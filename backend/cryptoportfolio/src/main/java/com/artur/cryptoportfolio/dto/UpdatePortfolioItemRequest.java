package com.artur.cryptoportfolio.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class UpdatePortfolioItemRequest {

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.000000000000000001", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @NotNull(message = "Average buy price is required")
    @DecimalMin(value = "0.01", message = "Average buy price must be greater than 0")
    private BigDecimal averageBuyPrice;

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getAverageBuyPrice() {
        return averageBuyPrice;
    }

    public void setAverageBuyPrice(BigDecimal averageBuyPrice) {
        this.averageBuyPrice = averageBuyPrice;
    }

    
}
