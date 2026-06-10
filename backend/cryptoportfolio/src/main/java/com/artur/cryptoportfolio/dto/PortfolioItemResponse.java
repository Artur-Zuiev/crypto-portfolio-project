package com.artur.cryptoportfolio.dto;

public class PortfolioItemResponse {
    
    private Long id;
    private String symbol;
    private String name;
    private Double quantity;
    private Double averageBuyPrice;
    private Double currentPrice;
    private Double currentValue;
    private Double profitLoss;
    private Double allocationPercentage;

    public PortfolioItemResponse(
            Long id,
            String symbol,
            String name,
            Double quantity,
            Double averageBuyPrice,
            Double currentPrice,
            Double currentValue,
            Double profitLoss,
            Double allocationPercentage
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

    public Double getQuantity() {
        return quantity;
    }

    public Double getAverageBuyPrice() {
        return averageBuyPrice;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public Double getCurrentValue() {
        return currentValue;
    }

    public Double getProfitLoss() {
        return profitLoss;
    }

    public Double getAllocationPercentage() {
        return allocationPercentage;
    }
}