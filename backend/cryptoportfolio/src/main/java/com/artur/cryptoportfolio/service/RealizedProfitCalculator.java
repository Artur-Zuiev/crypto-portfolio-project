package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.model.Transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Realized profit from recorded BUY/SELL transactions using weighted average cost.
 * It intentionally does not infer missing transaction history from manually edited
 * or deleted portfolio positions.
 */
public final class RealizedProfitCalculator {
    private static final int SCALE = 18;
    private RealizedProfitCalculator() {}

    public record Result(BigDecimal realizedProfitLoss, int completedSales, int unmatchedSales) {}

    private static final class Position {
        BigDecimal quantity = BigDecimal.ZERO;
        BigDecimal avgCost = BigDecimal.ZERO;
    }

    public static Result calculate(List<Transaction> transactions) {
        Map<String, Position> positions = new HashMap<>();
        BigDecimal realized = BigDecimal.ZERO;
        int sales = 0;
        int unmatched = 0;

        List<Transaction> ordered = transactions.stream()
                .sorted(Comparator
                        .comparing(Transaction::getTransactionDate,
                                Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Transaction::getId,
                                Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        for (Transaction transaction : ordered) {
            if (transaction.getCryptoCurrency() == null
                    || transaction.getCryptoCurrency().getSymbol() == null
                    || transaction.getQuantity() == null || transaction.getPrice() == null
                    || transaction.getQuantity().signum() <= 0 || transaction.getPrice().signum() <= 0) {
                continue;
            }
            String symbol = transaction.getCryptoCurrency().getSymbol();
            Position position = positions.computeIfAbsent(symbol, ignored -> new Position());
            BigDecimal amount = transaction.getQuantity();
            BigDecimal price = transaction.getPrice();

            if ("BUY".equalsIgnoreCase(transaction.getType())) {
                BigDecimal nextQuantity = position.quantity.add(amount);
                BigDecimal priorCost = position.quantity.multiply(position.avgCost);
                position.avgCost = priorCost.add(amount.multiply(price))
                        .divide(nextQuantity, SCALE, RoundingMode.HALF_UP);
                position.quantity = nextQuantity;
            } else if ("SELL".equalsIgnoreCase(transaction.getType())) {
                if (amount.compareTo(position.quantity) > 0) {
                    // Previous holdings may have been edited outside transaction history.
                    // Such sales cannot be valued reliably and must be explicitly flagged.
                    unmatched++;
                    continue;
                }
                realized = realized.add(amount.multiply(price.subtract(position.avgCost)));
                sales++;
                position.quantity = position.quantity.subtract(amount);
                if (position.quantity.signum() == 0) position.avgCost = BigDecimal.ZERO;
            }
        }
        return new Result(realized.setScale(SCALE, RoundingMode.HALF_UP), sales, unmatched);
    }
}
