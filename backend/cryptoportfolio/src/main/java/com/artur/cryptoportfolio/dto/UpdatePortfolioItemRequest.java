package com.artur.cryptoportfolio.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class UpdatePortfolioItemRequest {

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.000000000000000001", message = "Quantity must be greater than 0")
    private Double quantity;

    @NotNull(message = "Average buy price is required")
    @DecimalMin(value = "0.01", message = "Average buy price must be greater than 0")
    private Double averageBuyPrice;

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public Double getAverageBuyPrice() {
        return averageBuyPrice;
    }

    public void setAverageBuyPrice(Double averageBuyPrice) {
        this.averageBuyPrice = averageBuyPrice;
    }

    
}
