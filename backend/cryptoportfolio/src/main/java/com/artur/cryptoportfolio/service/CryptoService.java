package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.dto.MessageResponse;
import com.artur.cryptoportfolio.model.CryptoCurrency;
import com.artur.cryptoportfolio.repository.CryptoCurrencyRepository;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CryptoService {
    
    private final CryptoCurrencyRepository cryptoCurrencyRepository;

    public CryptoService(CryptoCurrencyRepository cryptoCurrencyRepository) {
        this.cryptoCurrencyRepository = cryptoCurrencyRepository;
    }

    public ResponseEntity<?> addCrypto(CryptoCurrency cryptoCurrency) {

        CryptoCurrency existingCrypto = cryptoCurrencyRepository
                .findBySymbol(cryptoCurrency.getSymbol())
                .orElse(null);
        
        if (existingCrypto != null) {
            return ResponseEntity.ok(existingCrypto);
        }

        cryptoCurrency.setLastUpdated(LocalDateTime.now());

        CryptoCurrency savedCrypto = cryptoCurrencyRepository.save(cryptoCurrency);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedCrypto);
    }

    public ResponseEntity<List<CryptoCurrency>> getAllCrypto() {
        List<CryptoCurrency> cryptoCurrencies = cryptoCurrencyRepository.findAll();

        return ResponseEntity.ok(cryptoCurrencies);
    }

    public ResponseEntity<?> getCryptoBySymbol(String symbol) {

        CryptoCurrency cryptoCurrency = cryptoCurrencyRepository
                .findBySymbol(symbol)
                .orElse(null);

        if (cryptoCurrency == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Crypto currency not found"));
        }

        return ResponseEntity.ok(cryptoCurrency);
    }

    private String getCoinGeckoId(String symbol) {
        Map<String, String> coinIds = new HashMap<>();

        coinIds.put("BTC", "bitcoin");
        coinIds.put("ETH", "ethereum");
        coinIds.put("SOL", "solana");
        coinIds.put("ADA", "cardano");
        coinIds.put("BNB", "binancecoin");

        return coinIds.get(symbol);
    }

    public ResponseEntity<?> updatePrices() {
        List<CryptoCurrency> cryptoCurrencies = cryptoCurrencyRepository.findAll();

        RestTemplate restTemplate = new RestTemplate();

        for (CryptoCurrency crypto : cryptoCurrencies) {
            String symbol = crypto.getSymbol().trim().toUpperCase();
            String coinGeckoId = getCoinGeckoId(symbol);

            if (coinGeckoId == null) {
                continue;
            }

            String url = "https://api.coingecko.com/api/v3/simple/price?ids="
                    + coinGeckoId
                    + "&vs_currencies=eur&include_market_cap=true";

            try {
                ResponseEntity<Map<String, Map<String, Double>>> apiResponse =
                        restTemplate.exchange(
                                url,
                                HttpMethod.GET,
                                null,
                                new ParameterizedTypeReference<Map<String, Map<String, Double>>>() {}
                        );

                Map<String, Map<String, Double>> response = apiResponse.getBody();

                if (response == null || !response.containsKey(coinGeckoId)) {
                    continue;
                }

                Map<String, Double> coinData = response.get(coinGeckoId);

                Double price = coinData.get("eur");
                Double marketCap = coinData.get("eur_market_cap");

                if (price != null) {
                    crypto.setCurrentPrice(price);
                }

                if (marketCap != null) {
                    crypto.setMarketCap(marketCap);
                }

                crypto.setLastUpdated(LocalDateTime.now());
                cryptoCurrencyRepository.save(crypto);

            } catch (Exception error) {
                System.out.println("Could not update price for " + symbol + ": " + error.getMessage());
            }
        }

        return ResponseEntity.ok(new MessageResponse("Prices updated successfully"));
    }
}