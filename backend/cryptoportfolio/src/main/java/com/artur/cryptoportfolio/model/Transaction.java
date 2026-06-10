package com.artur.cryptoportfolio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    
     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Long id;

     // Wer macht operation
     @ManyToOne
     @JoinColumn(name = "user_id")
     private User user;

     // Whelche Crypto
     @ManyToOne
     @JoinColumn(name = "crypto_currency_id")
     private CryptoCurrency cryptoCurrency;

     //BUY oder SELL
     private String type;

     // Wie viel Cointen
     private Double quantity;

     // Price für ein Coint im Moment 
     private Double price;

     // Date von Operation
     private LocalDateTime transactionDate;

     public Transaction() {
        this.transactionDate = LocalDateTime.now();
     }

     public Long getId() {
        return id;
     }

     public User getUser() {
        return user;
     }

     public void setUser(User user) {
        this.user = user;
     }

     public CryptoCurrency getCryptoCurrency() {
        return cryptoCurrency;
     }

     public void setCryptoCurrency(CryptoCurrency cryptoCurrency) {
        this.cryptoCurrency = cryptoCurrency;
     }

     public String getType() {
        return type;
     }

     public void setType(String type) {
        this.type = type;
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

     public LocalDateTime getTransactionDate() {
        return transactionDate;
     }

     public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
     }
}
