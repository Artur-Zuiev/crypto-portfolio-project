package com.artur.cryptoportfolio.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

public class AddTransactionRequest {

    @NotNull
    private Long cryptoCurrencyId;
    @NotNull
    @DecimalMin("0.000000000000000001")
    @Digits(integer = 20, fraction = 18)
    private BigDecimal quantity;
    @NotNull
    @DecimalMin("0.000000000000000001")
    @Digits(integer = 20, fraction = 18)
    private BigDecimal price;

    public AddTransactionRequest() {
    }

    public Long getCryptoCurrencyId() {
        return cryptoCurrencyId;
    }

    public void setCryptoCurrencyId(Long cryptoCurrencyId) {
        this.cryptoCurrencyId = cryptoCurrencyId;
    }
    
    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
