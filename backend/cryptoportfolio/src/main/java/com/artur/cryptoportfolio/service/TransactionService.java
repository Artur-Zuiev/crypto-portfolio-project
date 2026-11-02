package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.dto.AddTransactionRequest;
import com.artur.cryptoportfolio.dto.TransactionResponse;
import com.artur.cryptoportfolio.model.*;
import com.artur.cryptoportfolio.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.util.List;

@Service
public class TransactionService {
    private final TransactionRepository transactions;
    private final CryptoCurrencyRepository currencies;
    private final UserRepository users;
    private final PortfolioItemRepository portfolios;

    public TransactionService(TransactionRepository transactions, CryptoCurrencyRepository currencies,
                              UserRepository users, PortfolioItemRepository portfolios) {
        this.transactions = transactions;
        this.currencies = currencies;
        this.users = users;
        this.portfolios = portfolios;
    }

    @Transactional
    public TransactionResponse addBuyTransactionByEmail(String email, AddTransactionRequest request) {
        return addBuyTransaction(users.findByEmail(email).orElseThrow().getId(), request);
    }
    @Transactional
    public TransactionResponse addSellTransactionByEmail(String email, AddTransactionRequest request) {
        return addSellTransaction(users.findByEmail(email).orElseThrow().getId(), request);
    }
    public List<TransactionResponse> getUserTransactionsByEmail(String email) {
        return getUserTransactions(users.findByEmail(email).orElseThrow().getId());
    }
    public List<TransactionResponse> getUserTransactions(Long userId) {
        return transactions.findByUserIdOrderByTransactionDateDesc(userId).stream().map(this::toResponse).toList();
    }
    @Transactional
    public TransactionResponse addBuyTransaction(Long userId, AddTransactionRequest request) {
        validate(request);
        User user = users.findById(userId).orElseThrow();
        CryptoCurrency currency = currencies.findById(request.getCryptoCurrencyId()).orElseThrow();
        List<PortfolioItem> items = portfolios.findByUserIdAndCryptoCurrencyId(userId, currency.getId());
        PortfolioItem item;
        if (items.isEmpty()) {
            item = new PortfolioItem();
            item.setUser(user);
            item.setCryptoCurrency(currency);
            item.setQuantity(request.getQuantity());
            item.setAverageBuyPrice(request.getPrice());
        } else {
            item = items.get(0);
            BigDecimal currentTotal = item.getQuantity().multiply(item.getAverageBuyPrice());
            BigDecimal purchaseTotal = request.getQuantity().multiply(request.getPrice());
            BigDecimal nextQuantity = item.getQuantity().add(request.getQuantity());
            item.setAverageBuyPrice(currentTotal.add(purchaseTotal).divide(nextQuantity, 18, RoundingMode.HALF_UP));
            item.setQuantity(nextQuantity);
        }
        portfolios.save(item);
        return saveTransaction(user, currency, "BUY", request);
    }
    @Transactional
    public TransactionResponse addSellTransaction(Long userId, AddTransactionRequest request) {
        validate(request);
        User user = users.findById(userId).orElseThrow();
        CryptoCurrency currency = currencies.findById(request.getCryptoCurrencyId()).orElseThrow();
        List<PortfolioItem> items = portfolios.findByUserIdAndCryptoCurrencyId(userId, currency.getId());
        if (items.isEmpty()) throw new IllegalArgumentException("You do not have this crypto");
        PortfolioItem item = items.get(0);
        BigDecimal remaining = item.getQuantity().subtract(request.getQuantity());
        if (remaining.signum() < 0) throw new IllegalArgumentException("Not enough crypto to sell");
        if (remaining.signum() == 0) portfolios.delete(item);
        else { item.setQuantity(remaining); portfolios.save(item); }
        return saveTransaction(user, currency, "SELL", request);
    }
    private TransactionResponse saveTransaction(User user, CryptoCurrency currency, String type, AddTransactionRequest request) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCryptoCurrency(currency);
        transaction.setType(type);
        transaction.setQuantity(request.getQuantity());
        transaction.setPrice(request.getPrice());
        return toResponse(transactions.save(transaction));
    }
    private static void validate(AddTransactionRequest request) {
        if (request == null || request.getCryptoCurrencyId() == null || request.getQuantity() == null
                || request.getPrice() == null || request.getQuantity().signum() <= 0 || request.getPrice().signum() <= 0
                || request.getQuantity().scale() > 18 || request.getPrice().scale() > 18
                || request.getQuantity().precision() - request.getQuantity().scale() > 20
                || request.getPrice().precision() - request.getPrice().scale() > 20) {
            throw new IllegalArgumentException("Valid positive quantity and price with at most 18 decimal places required");
        }
    }
    private TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(t.getId(), t.getCryptoCurrency().getSymbol(), t.getCryptoCurrency().getName(),
                t.getType(), t.getQuantity(), t.getPrice(), t.getQuantity().multiply(t.getPrice()), t.getTransactionDate());
    }
}
