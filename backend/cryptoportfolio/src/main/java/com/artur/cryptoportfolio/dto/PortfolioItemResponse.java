package com.artur.cryptoportfolio.dto;

import java.math.BigDecimal;

public class PortfolioItemResponse {
    
    private Long id;
    private String symbol;
    private String name;
    private BigDecimal quantity;
    private BigDecimal averageBuyPrice;
    private BigDecimal currentPrice;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
    private BigDecimal allocationPercentage;

    public PortfolioItemResponse(
            Long id,
            String symbol,
            String name,
            BigDecimal quantity,
            BigDecimal averageBuyPrice,
            BigDecimal currentPrice,
            BigDecimal currentValue,
            BigDecimal profitLoss,
            BigDecimal allocationPercentage
    ) {
        this.id = id;
        this.symbol = symbol;
        this.name = name;
        this.quantity = quantity;
        this.averageBuyPrice = averageBuyPrice;
        this.currentPrice = currentPrice;
        this.currentValue = currentValue;
        this.profitLoss = profitLoss;
        this.allocationPercentage = allocationPercentage;
    }

    public Long getId() {
        return id;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getAverageBuyPrice() {
        return averageBuyPrice;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }

    public BigDecimal getProfitLoss() {
        return profitLoss;
    }

    public BigDecimal getAllocationPercentage() {
        return allocationPercentage;
    }
}