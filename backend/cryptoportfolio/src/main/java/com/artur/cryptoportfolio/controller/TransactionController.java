package com.artur.cryptoportfolio.controller;

import com.artur.cryptoportfolio.dto.AddTransactionRequest;
import com.artur.cryptoportfolio.dto.TransactionResponse;
import com.artur.cryptoportfolio.service.TransactionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/buy")
    public TransactionResponse addBuyTransaction(
            Authentication authentication,
            @RequestBody AddTransactionRequest request
    ) {
        String email = authentication.getName();
        return transactionService.addBuyTransactionByEmail(email, request);
    }

    @PostMapping("/sell")
    public TransactionResponse addSellTransaction(
            Authentication authentication,
            @RequestBody AddTransactionRequest request
    ) {
        String email = authentication.getName();
        return transactionService.addSellTransactionByEmail(email, request);
    }

    @GetMapping
    public List<TransactionResponse> getTransactions(Authentication authentication) {
        String email = authentication.getName();
        return transactionService.getUserTransactionsByEmail(email);
    }
}