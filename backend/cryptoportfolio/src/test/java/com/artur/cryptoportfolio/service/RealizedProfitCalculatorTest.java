package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.model.CryptoCurrency;
import com.artur.cryptoportfolio.model.Transaction;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RealizedProfitCalculatorTest {
    private Transaction trade(String type, String quantity, String price, int minute) {
        CryptoCurrency coin = new CryptoCurrency();
        coin.setSymbol("BTC");
        Transaction tx = new Transaction();
        tx.setType(type);
        tx.setCryptoCurrency(coin);
        tx.setQuantity(new BigDecimal(quantity));
        tx.setPrice(new BigDecimal(price));
        tx.setTransactionDate(LocalDateTime.of(2026, 11, 3, 10, minute));
        return tx;
    }

    @Test void partialSaleUsesWeightedAverageCostNotLatestPurchasePrice() {
        // Input arrives newest first, as returned by the existing repository.
        var result = RealizedProfitCalculator.calculate(List.of(
                trade("SELL", "0.5", "130", 3),
                trade("BUY", "1", "120", 2),
                trade("BUY", "1", "100", 1)));
        assertEquals(0, result.realizedProfitLoss().compareTo(new BigDecimal("10")));
        assertEquals(1, result.completedSales());
        assertEquals(0, result.unmatchedSales());
    }

    @Test void exactFullSaleAndNewPositionHaveIndependentCostBasis() {
        var result = RealizedProfitCalculator.calculate(List.of(
                trade("SELL", "0.1", "90", 4),
                trade("BUY", "0.1", "110", 3),
                trade("SELL", "0.1", "120", 2),
                trade("BUY", "0.1", "100", 1)));
        assertEquals(0, result.realizedProfitLoss().compareTo(BigDecimal.ZERO));
        assertEquals(2, result.completedSales());
    }

    @Test void tinyFractionalSaleDoesNotRoundToZero() {
        var result = RealizedProfitCalculator.calculate(List.of(
                trade("SELL", "0.00000001", "200", 2),
                trade("BUY", "0.00000002", "100", 1)));
        assertEquals(0, result.realizedProfitLoss().compareTo(new BigDecimal("0.000001")));
    }

    @Test void unmatchedSaleIsReportedNotInvented() {
        var result = RealizedProfitCalculator.calculate(List.of(trade("SELL", "1", "200", 1)));
        assertEquals(BigDecimal.ZERO.setScale(18), result.realizedProfitLoss());
        assertEquals(1, result.unmatchedSales());
    }

    @Test void noSaleMeansNoRealizedReturn() {
        var result = RealizedProfitCalculator.calculate(List.of(trade("BUY", "0.1", "100", 1)));
        assertEquals(0, result.realizedProfitLoss().signum());
        assertEquals(0, result.completedSales());
    }
}
