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

import java.math.BigDecimal;
import java.math.RoundingMode;
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

            BigDecimal oldQuantity = existingItem.getQuantity();
            BigDecimal oldAverageBuyPrice = existingItem.getAverageBuyPrice();

            BigDecimal newQuantity = request.getQuantity();
            BigDecimal newBuyPrice = request.getAverageBuyPrice();

            BigDecimal totalQuantity = oldQuantity.add(newQuantity);
            BigDecimal totalInvested = oldQuantity.multiply(oldAverageBuyPrice).add(newQuantity.multiply(newBuyPrice));
            BigDecimal newAverageBuyPrice = totalInvested.divide(totalQuantity, 18, RoundingMode.HALF_UP);

            existingItem.setQuantity(totalQuantity);
            existingItem.setAverageBuyPrice(newAverageBuyPrice);

            PortfolioItem savedItem = portfolioItemRepository.save(existingItem);

            return ResponseEntity.ok(convertToResponse(savedItem, BigDecimal.ZERO));
        }

        PortfolioItem item = new PortfolioItem();
        item.setUser(user);
        item.setCryptoCurrency(cryptoCurrency);
        item.setQuantity(request.getQuantity());
        item.setAverageBuyPrice(request.getAverageBuyPrice());

        PortfolioItem savedItem = portfolioItemRepository.save(item);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertToResponse(savedItem, BigDecimal.ZERO));
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

        BigDecimal totalValue = calculateTotalValue(items);

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

        BigDecimal totalValue = BigDecimal.ZERO;
        BigDecimal totalInvested = BigDecimal.ZERO;

        // Best Coin is a genuine positive return, Worst Coin a genuine loss.
        // Break-even holdings must not appear as both the best and worst asset.
        String bestAssetSymbol = "-";
        BigDecimal bestAssetProfitLoss = BigDecimal.ZERO;
        String worstAssetSymbol = "-";
        BigDecimal worstAssetProfitLoss = BigDecimal.ZERO;

        for (PortfolioItem item : items) {
            BigDecimal quantity = item.getQuantity();
            BigDecimal averageBuyPrice = item.getAverageBuyPrice();
            BigDecimal currentPrice = BigDecimal.valueOf(item.getCryptoCurrency().getCurrentPrice());

            BigDecimal currentValue = quantity.multiply(currentPrice);
            BigDecimal investedValue = quantity.multiply(averageBuyPrice);
            BigDecimal profitLoss = currentValue.subtract(investedValue);

            totalValue = totalValue.add(currentValue);
            totalInvested = totalInvested.add(investedValue);

            if (profitLoss.compareTo(bestAssetProfitLoss) > 0) {
                bestAssetSymbol = item.getCryptoCurrency().getSymbol();
                bestAssetProfitLoss = profitLoss;
            }

            if (profitLoss.compareTo(worstAssetProfitLoss) < 0) {
                worstAssetSymbol = item.getCryptoCurrency().getSymbol();
                worstAssetProfitLoss = profitLoss;
            }
        }

        BigDecimal totalProfitLoss = totalValue.subtract(totalInvested);
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

        return ResponseEntity.ok(convertToResponse(savedItem, BigDecimal.ZERO));
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

    private BigDecimal calculateTotalValue(List<PortfolioItem> items) {
        BigDecimal totalValue = BigDecimal.ZERO;

        for (PortfolioItem item : items) {
            BigDecimal quantity = item.getQuantity();
            BigDecimal currentPrice = BigDecimal.valueOf(item.getCryptoCurrency().getCurrentPrice());

            totalValue = totalValue.add(quantity.multiply(currentPrice));
        }

        return totalValue;
    }

    private PortfolioItemResponse convertToResponse(PortfolioItem item, BigDecimal totalValue) {

        BigDecimal quantity = item.getQuantity();
        BigDecimal averageBuyPrice = item.getAverageBuyPrice();
        BigDecimal currentPrice = BigDecimal.valueOf(item.getCryptoCurrency().getCurrentPrice());

        BigDecimal currentValue = quantity.multiply(currentPrice);
        BigDecimal investedValue = quantity.multiply(averageBuyPrice);
        BigDecimal profitLoss = currentValue.subtract(investedValue);

        BigDecimal allocationPercentage = BigDecimal.ZERO;

        if (totalValue.signum() > 0) {
            allocationPercentage = currentValue.multiply(BigDecimal.valueOf(100)).divide(totalValue, 8, RoundingMode.HALF_UP);
        }

        return new PortfolioItemResponse(
                item.getId(),
                item.getCryptoCurrency().getSymbol(),
                item.getCryptoCurrency().getName(),
                quantity,
                averageBuyPrice,
                currentPrice,
                round2(currentValue),
                round2(profitLoss),
                round2(allocationPercentage)
        );
    }

    private BigDecimal round2(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}