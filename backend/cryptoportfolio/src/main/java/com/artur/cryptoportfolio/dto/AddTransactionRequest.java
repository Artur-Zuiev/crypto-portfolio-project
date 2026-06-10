package com.artur.cryptoportfolio.dto;

public class AddTransactionRequest {

    private Long cryptoCurrencyId;
    private Double quantity;
    private Double price;

    public AddTransactionRequest() {
    }

    public Long getCryptoCurrencyId() {
        return cryptoCurrencyId;
    }

    public void setCryptoCurrencyId(Long cryptoCurrencyId) {
        this.cryptoCurrencyId = cryptoCurrencyId;
    }
    
    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
