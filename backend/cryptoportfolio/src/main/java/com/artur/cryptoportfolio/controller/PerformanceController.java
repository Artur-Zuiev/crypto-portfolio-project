package com.artur.cryptoportfolio.controller;

import com.artur.cryptoportfolio.repository.TransactionRepository;
import com.artur.cryptoportfolio.repository.UserRepository;
import com.artur.cryptoportfolio.service.RealizedProfitCalculator;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Account-scoped performance based only on persisted transactions. */
@RestController
@RequestMapping("/api/portfolio/performance")
public class PerformanceController {
    private final TransactionRepository transactions;
    private final UserRepository users;

    public PerformanceController(TransactionRepository transactions, UserRepository users) {
        this.transactions = transactions;
        this.users = users;
    }

    @GetMapping("/realized")
    public RealizedProfitCalculator.Result getRealizedPerformance(Authentication authentication) {
        Long userId = users.findByEmail(authentication.getName()).orElseThrow().getId();
        return RealizedProfitCalculator.calculate(
                transactions.findByUserIdOrderByTransactionDateDesc(userId));
    }
}
