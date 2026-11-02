package com.artur.cryptoportfolio.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;


public class UpdatePortfolioItemRequest {

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.000000000000000001", message = "Quantity must be greater than 0")
    @Digits(integer = 20, fraction = 18)
    private BigDecimal quantity;

    @NotNull(message = "Average buy price is required")
    @DecimalMin(value = "0.000000000000000001", message = "Average buy price must be greater than 0")
    @Digits(integer = 20, fraction = 18)
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
