package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.dto.AddPortfolioItemRequest;
import com.artur.cryptoportfolio.dto.MessageResponse;
import com.artur.cryptoportfolio.dto.PortfolioItemResponse;
import com.artur.cryptoportfolio.dto.PortfolioSummaryResponse;
import com.artur.cryptoportfolio.dto.UpdatePortfolioItemRequest;
import com.artur.cryptoportfolio.model.CryptoCurrency;
import com.artur.cryptoportfolio.model.PortfolioItem;
import com.artur.cryptoportfolio.model.User;
import com.artur.cryptoportfolio.repository.CryptoCurrencyRepository;
import com.artur.cryptoportfolio.repository.PortfolioItemRepository;
import com.artur.cryptoportfolio.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PortfolioService {

    private final PortfolioItemRepository portfolioItemRepository;
    private final UserRepository userRepository;
    private final CryptoCurrencyRepository cryptoCurrencyRepository;

    public PortfolioService(
            PortfolioItemRepository portfolioItemRepository,
            UserRepository userRepository,
            CryptoCurrencyRepository cryptoCurrencyRepository
    ) {
        this.portfolioItemRepository = portfolioItemRepository;
        this.userRepository = userRepository;
        this.cryptoCurrencyRepository = cryptoCurrencyRepository;
    }

    public ResponseEntity<?> addPortfolioItem(String email, AddPortfolioItemRequest request) {

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("User not found"));
        }

        CryptoCurrency cryptoCurrency = cryptoCurrencyRepository.findBySymbol(request.getSymbol())
                .orElse(null);

        if (cryptoCurrency == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Crypto currency not found"));
        }

        List<PortfolioItem> existingItems = portfolioItemRepository
                .findByUserIdAndCryptoCurrencySymbol(user.getId(), request.getSymbol());

        PortfolioItem existingItem = null;

        if (!existingItems.isEmpty()) {
            existingItem = existingItems.get(0);
        }

        if (existingItem != null) {

            Double oldQuantity = existingItem.getQuantity();
            Double oldAverageBuyPrice = existingItem.getAverageBuyPrice();

            Double newQuantity = request.getQuantity();
            Double newBuyPrice = request.getAverageBuyPrice();

            Double totalQuantity = oldQuantity + newQuantity;
            Double totalInvested = (oldQuantity * oldAverageBuyPrice) + (newQuantity * newBuyPrice);
            Double newAverageBuyPrice = totalInvested / totalQuantity;

            existingItem.setQuantity(totalQuantity);
            existingItem.setAverageBuyPrice(newAverageBuyPrice);

            PortfolioItem savedItem = portfolioItemRepository.save(existingItem);

            return ResponseEntity.ok(convertToResponse(savedItem, 0.0));
        }

        PortfolioItem item = new PortfolioItem();
        item.setUser(user);
        item.setCryptoCurrency(cryptoCurrency);
        item.setQuantity(request.getQuantity());
        item.setAverageBuyPrice(request.getAverageBuyPrice());

        PortfolioItem savedItem = portfolioItemRepository.save(item);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertToResponse(savedItem, 0.0));
    }

    public ResponseEntity<?> getPortfolioByUserEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("User not found"));
        }

        List<PortfolioItem> items = portfolioItemRepository.findByUserId(user.getId());

        Double totalValue = calculateTotalValue(items);

        List<PortfolioItemResponse> response = new ArrayList<>();

        for (PortfolioItem item : items) {
            response.add(convertToResponse(item, totalValue));
        }

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> getPortfolioSummaryByUserEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("User not found"));
        }

        List<PortfolioItem> items = portfolioItemRepository.findByUserId(user.getId());

        Double totalValue = 0.0;
        Double totalInvested = 0.0;

        String bestAssetSymbol = "-";
        Double bestAssetProfitLoss = 0.0;

        String worstAssetSymbol = "-";
        Double worstAssetProfitLoss = 0.0;

        boolean firstItem = true;

        for (PortfolioItem item : items) {

            Double quantity = item.getQuantity();
            Double averageBuyPrice = item.getAverageBuyPrice();
            Double currentPrice = item.getCryptoCurrency().getCurrentPrice();

            Double currentValue = quantity * currentPrice;
            Double investedValue = quantity * averageBuyPrice;
            Double profitLoss = currentValue - investedValue;

            totalValue += currentValue;
            totalInvested += investedValue;

            if (firstItem) {
                bestAssetSymbol = item.getCryptoCurrency().getSymbol();
                bestAssetProfitLoss = profitLoss;

                worstAssetSymbol = item.getCryptoCurrency().getSymbol();
                worstAssetProfitLoss = profitLoss;

                firstItem = false;
            } else {
                if (profitLoss > bestAssetProfitLoss) {
                    bestAssetSymbol = item.getCryptoCurrency().getSymbol();
                    bestAssetProfitLoss = profitLoss;
                }

                if (profitLoss < worstAssetProfitLoss) {
                    worstAssetSymbol = item.getCryptoCurrency().getSymbol();
                    worstAssetProfitLoss = profitLoss;
                }
            }
        }

        Double totalProfitLoss = totalValue - totalInvested;
        Integer assetCount = items.size();

        PortfolioSummaryResponse response = new PortfolioSummaryResponse(
                round2(totalValue),
                round2(totalInvested),
                round2(totalProfitLoss),
                assetCount,
                bestAssetSymbol,
                round2(bestAssetProfitLoss),
                worstAssetSymbol,
                round2(worstAssetProfitLoss)
        );

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> updatePortfolioItem(
            String email,
            Long itemId,
            UpdatePortfolioItemRequest request
    ) {

        PortfolioItem item = portfolioItemRepository.findById(itemId)
                .orElse(null);

        if (item == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Portfolio item not found"));
        }

        if (!item.getUser().getEmail().equals(email)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("You cannot update this portfolio item"));
        }

        item.setQuantity(request.getQuantity());
        item.setAverageBuyPrice(request.getAverageBuyPrice());

        PortfolioItem savedItem = portfolioItemRepository.save(item);

        return ResponseEntity.ok(convertToResponse(savedItem, 0.0));
    }

    public ResponseEntity<MessageResponse> deletePortfolioItem(String email, Long itemId) {

        PortfolioItem item = portfolioItemRepository.findById(itemId)
                .orElse(null);

        if (item == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Portfolio item not found"));
        }

        if (!item.getUser().getEmail().equals(email)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("You cannot delete this portfolio item"));
        }

        portfolioItemRepository.delete(item);

        return ResponseEntity.ok(new MessageResponse("Portfolio item deleted successfully"));
    }

    private Double calculateTotalValue(List<PortfolioItem> items) {
        Double totalValue = 0.0;

        for (PortfolioItem item : items) {
            Double quantity = item.getQuantity();
            Double currentPrice = item.getCryptoCurrency().getCurrentPrice();

            totalValue += quantity * currentPrice;
        }

        return totalValue;
    }

    private PortfolioItemResponse convertToResponse(PortfolioItem item, Double totalValue) {

        Double quantity = item.getQuantity();
        Double averageBuyPrice = item.getAverageBuyPrice();
        Double currentPrice = item.getCryptoCurrency().getCurrentPrice();

        Double currentValue = quantity * currentPrice;
        Double investedValue = quantity * averageBuyPrice;
        Double profitLoss = currentValue - investedValue;

        Double allocationPercentage = 0.0;

        if (totalValue > 0) {
            allocationPercentage = (currentValue / totalValue) * 100;
        }

        return new PortfolioItemResponse(
                item.getId(),
                item.getCryptoCurrency().getSymbol(),
                item.getCryptoCurrency().getName(),
                round2(quantity),
                round2(averageBuyPrice),
                round2(currentPrice),
                round2(currentValue),
                round2(profitLoss),
                round2(allocationPercentage)
        );
    }

    private Double round2(Double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}