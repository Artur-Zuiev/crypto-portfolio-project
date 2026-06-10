package com.artur.cryptoportfolio.controller;

import com.artur.cryptoportfolio.dto.AddPortfolioItemRequest;
import com.artur.cryptoportfolio.dto.MessageResponse;
import com.artur.cryptoportfolio.dto.UpdatePortfolioItemRequest;
import com.artur.cryptoportfolio.service.PortfolioService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @PostMapping("/items")
    public ResponseEntity<?> addPortfolioItem(
            Authentication authentication,
            @Valid @RequestBody AddPortfolioItemRequest request
    ) {
        String email = authentication.getName();
        return portfolioService.addPortfolioItem(email, request);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyPortfolio(Authentication authentication) {
        String email = authentication.getName();
        return portfolioService.getPortfolioByUserEmail(email);
    }

    @GetMapping("/my/summary")
    public ResponseEntity<?> getMyPortfolioSummary(Authentication authentication) {
        String email = authentication.getName();
        return portfolioService.getPortfolioSummaryByUserEmail(email);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updatePortfolioItem(
            Authentication authentication,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdatePortfolioItemRequest request
    ) {
        String email = authentication.getName();
        return portfolioService.updatePortfolioItem(email, itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<MessageResponse> deletePortfolioItem(
            Authentication authentication,
            @PathVariable Long itemId
    ) {
        String email = authentication.getName();
        return portfolioService.deletePortfolioItem(email, itemId);
    }
}