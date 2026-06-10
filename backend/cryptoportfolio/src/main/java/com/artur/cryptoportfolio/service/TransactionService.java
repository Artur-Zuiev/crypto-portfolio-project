package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.dto.AddTransactionRequest;
import com.artur.cryptoportfolio.dto.TransactionResponse;
import com.artur.cryptoportfolio.model.CryptoCurrency;
import com.artur.cryptoportfolio.model.PortfolioItem;
import com.artur.cryptoportfolio.model.Transaction;
import com.artur.cryptoportfolio.model.User;
import com.artur.cryptoportfolio.repository.CryptoCurrencyRepository;
import com.artur.cryptoportfolio.repository.PortfolioItemRepository;
import com.artur.cryptoportfolio.repository.TransactionRepository;
import com.artur.cryptoportfolio.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CryptoCurrencyRepository cryptoCurrencyRepository;
    private final UserRepository userRepository;
    private final PortfolioItemRepository portfolioItemRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            CryptoCurrencyRepository cryptoCurrencyRepository,
            UserRepository userRepository,
            PortfolioItemRepository portfolioItemRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.cryptoCurrencyRepository = cryptoCurrencyRepository;
        this.userRepository = userRepository;
        this.portfolioItemRepository = portfolioItemRepository;
    }

    @Transactional
    public TransactionResponse addBuyTransactionByEmail(String email, AddTransactionRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return addBuyTransaction(user.getId(), request);
    }

    @Transactional
    public TransactionResponse addSellTransactionByEmail(String email, AddTransactionRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return addSellTransaction(user.getId(), request);
    }

    public List<TransactionResponse> getUserTransactionsByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return getUserTransactions(user.getId());
    }

    @Transactional
    public TransactionResponse addBuyTransaction(Long userId, AddTransactionRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CryptoCurrency cryptoCurrency = cryptoCurrencyRepository.findById(request.getCryptoCurrencyId())
                .orElseThrow(() -> new RuntimeException("Crypto currency not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCryptoCurrency(cryptoCurrency);
        transaction.setType("BUY");
        transaction.setQuantity(request.getQuantity());
        transaction.setPrice(request.getPrice());

        Transaction savedTransaction = transactionRepository.save(transaction);

        updatePortfolioAfterBuy(user, cryptoCurrency, request.getQuantity(), request.getPrice());

        return mapToResponse(savedTransaction);
    }

    @Transactional
    public TransactionResponse addSellTransaction(Long userId, AddTransactionRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CryptoCurrency cryptoCurrency = cryptoCurrencyRepository.findById(request.getCryptoCurrencyId())
                .orElseThrow(() -> new RuntimeException("Crypto currency not found"));

        List<PortfolioItem> items = portfolioItemRepository
                .findByUserIdAndCryptoCurrencyId(user.getId(), cryptoCurrency.getId());

        if (items.isEmpty()) {
            throw new RuntimeException("You do not have this crypto");
        }

        PortfolioItem existingItem = items.get(0);

        if (existingItem.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Not enough crypto to sell");
        }

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCryptoCurrency(cryptoCurrency);
        transaction.setType("SELL");
        transaction.setQuantity(request.getQuantity());
        transaction.setPrice(request.getPrice());

        Transaction savedTransaction = transactionRepository.save(transaction);

        updatePortfolioAfterSell(existingItem, request.getQuantity());

        return mapToResponse(savedTransaction);
    }

    public List<TransactionResponse> getUserTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void updatePortfolioAfterBuy(
            User user,
            CryptoCurrency cryptoCurrency,
            Double newQuantity,
            Double newBuyPrice
    ) {
        List<PortfolioItem> items = portfolioItemRepository
                .findByUserIdAndCryptoCurrencyId(user.getId(), cryptoCurrency.getId());

        if (items.isEmpty()) {
            PortfolioItem newItem = new PortfolioItem();
            newItem.setUser(user);
            newItem.setCryptoCurrency(cryptoCurrency);
            newItem.setQuantity(newQuantity);
            newItem.setAverageBuyPrice(newBuyPrice);

            portfolioItemRepository.save(newItem);
        } else {
            PortfolioItem existingItem = items.get(0);

            Double oldQuantity = existingItem.getQuantity();
            Double oldAverageBuyPrice = existingItem.getAverageBuyPrice();

            Double totalOldValue = oldQuantity * oldAverageBuyPrice;
            Double totalNewValue = newQuantity * newBuyPrice;

            Double finalQuantity = oldQuantity + newQuantity;
            Double finalAverageBuyPrice = (totalOldValue + totalNewValue) / finalQuantity;

            existingItem.setQuantity(finalQuantity);
            existingItem.setAverageBuyPrice(finalAverageBuyPrice);

            portfolioItemRepository.save(existingItem);
        }
    }

    private void updatePortfolioAfterSell(
        PortfolioItem existingItem,
        Double sellQuantity
    ) {
        Double oldQuantity = existingItem.getQuantity();
        Double finalQuantity = oldQuantity - sellQuantity;

        if (finalQuantity <= 0) {
            portfolioItemRepository.delete(existingItem);
            return;
        }

        existingItem.setQuantity(finalQuantity);
        portfolioItemRepository.save(existingItem);
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        Double totalValue = transaction.getQuantity() * transaction.getPrice();

        return new TransactionResponse(
                transaction.getId(),
                transaction.getCryptoCurrency().getSymbol(),
                transaction.getCryptoCurrency().getName(),
                transaction.getType(),
                transaction.getQuantity(),
                transaction.getPrice(),
                totalValue,
                transaction.getTransactionDate()
        );
    }
}