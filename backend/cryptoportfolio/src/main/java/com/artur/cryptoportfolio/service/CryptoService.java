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
        ensureDefaultCurrencies();
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

    // The dashboard previously displayed hard-coded coins after a database reset.
    // Create their records first; prices remain unavailable until a provider returns them.
    private void ensureDefaultCurrencies() {
        Map<String, String> defaults = Map.of(
                "BTC", "Bitcoin", "ETH", "Ethereum", "SOL", "Solana",
                "ADA", "Cardano", "BNB", "Binance Coin");
        for (String symbol : List.of("BTC", "ETH", "SOL", "ADA", "BNB")) {
            if (cryptoCurrencyRepository.findBySymbol(symbol).isEmpty()) {
                CryptoCurrency currency = new CryptoCurrency();
                currency.setSymbol(symbol);
                currency.setName(defaults.get(symbol));
                currency.setCurrentPrice(0.0);
                currency.setMarketCap(0.0);
                currency.setLastUpdated(null);
                cryptoCurrencyRepository.save(currency);
            }
        }
    }

    public ResponseEntity<?> updatePrices() {
        ensureDefaultCurrencies();
        List<CryptoCurrency> currencies = cryptoCurrencyRepository.findAll();

        // One CoinGecko request for all five coins, rather than five calls
        // that are more likely to hit the public API's rate limit.
        String ids = "bitcoin,ethereum,solana,cardano,binancecoin";
        String url = "https://api.coingecko.com/api/v3/simple/price?ids="
                + ids + "&vs_currencies=eur&include_market_cap=true";

        Map<String, Map<String, Double>> response;
        try {
            ResponseEntity<Map<String, Map<String, Double>>> result =
                    new RestTemplate().exchange(url, HttpMethod.GET, null,
                            new ParameterizedTypeReference<Map<String, Map<String, Double>>>() {});
            response = result.getBody();
        } catch (Exception error) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(new MessageResponse("Price provider unavailable. Please retry Refresh Prices later."));
        }

        if (response == null || response.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(new MessageResponse("Price provider returned no cryptocurrency prices."));
        }

        int updated = 0;
        for (CryptoCurrency currency : currencies) {
            String id = getCoinGeckoId(currency.getSymbol().trim().toUpperCase());
            Map<String, Double> values = id == null ? null : response.get(id);
            if (values == null) continue;

            Double price = values.get("eur");
            if (price == null || !Double.isFinite(price) || price <= 0) continue;

            currency.setCurrentPrice(price);
            Double cap = values.get("eur_market_cap");
            if (cap != null && Double.isFinite(cap) && cap >= 0) {
                currency.setMarketCap(cap);
            }
            currency.setLastUpdated(LocalDateTime.now());
            cryptoCurrencyRepository.save(currency);
            updated++;
        }

        if (updated == 0) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(new MessageResponse("No valid EUR prices returned. Please retry later."));
        }
        return ResponseEntity.ok(new MessageResponse("Updated " + updated + " cryptocurrency prices."));
    }
}
