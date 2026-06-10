package com.artur.cryptoportfolio.dto;

import java.time.LocalDateTime;

public class TransactionResponse {
    
    private Long id;
    private String cryptoSymbol;
    private String cryptoName;
    private String type;
    private Double quantity;
    private Double price;
    private Double totalValue;
    private LocalDateTime transactionDate;

    public TransactionResponse() {
    }

    public TransactionResponse(
            Long id,
            String cryptoSymbol,
            String cryptoName,
            String type,
            Double quantity,
            Double price,
            Double totalValue,
            LocalDateTime transactionDate
    ) {
        this.id = id;
        this.cryptoSymbol = cryptoSymbol;
        this.cryptoName = cryptoName;
        this.type = type;
        this.quantity = quantity;
        this.price = price;
        this.totalValue = totalValue;
        this.transactionDate = transactionDate;
    }

    public Long getId() {
        return id;
    }

    public String getCryptoSymbol() {
        return cryptoSymbol;
    }

    public String getCryptoName() {
        return cryptoName;
    }

    public String getType() {
        return type;
    }

    public Double getQuantity() {
        return quantity;
    }

    public Double getPrice() {
        return price;
    }

    public Double getTotalValue() {
        return totalValue;
    }
    
    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }
}
