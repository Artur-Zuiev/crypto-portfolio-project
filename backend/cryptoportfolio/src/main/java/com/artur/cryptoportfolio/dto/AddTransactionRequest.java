package com.artur.cryptoportfolio.dto;

import java.math.BigDecimal;

public class AddTransactionRequest {

    private Long cryptoCurrencyId;
    private BigDecimal quantity;
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
