package com.artur.cryptoportfolio.controller;

import com.artur.cryptoportfolio.model.CryptoCurrency;
import com.artur.cryptoportfolio.service.CryptoService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/crypto")
public class CryptoController {
    
    private final CryptoService cryptoService;

    public CryptoController(CryptoService cryptoService) {
        this.cryptoService = cryptoService;
    }

    @PostMapping
    public ResponseEntity<?> addCrypto(@Valid @RequestBody CryptoCurrency cryptoCurrency) {
        return cryptoService.addCrypto(cryptoCurrency);
    }

    @GetMapping
    public ResponseEntity<?> getAllCrypto() {
        return cryptoService.getAllCrypto();
    }

    @PostMapping("/update-prices")
    public ResponseEntity<?> updatePrices() {
        return cryptoService.updatePrices();
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<?> getCryptoBySymbol(@PathVariable String symbol) {
        return cryptoService.getCryptoBySymbol(symbol);
    }
}
