package com.artur.cryptoportfolio.repository;

import com.artur.cryptoportfolio.model.CryptoCurrency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CryptoCurrencyRepository extends JpaRepository<CryptoCurrency, Long> {
    Optional<CryptoCurrency> findBySymbol(String symbol);
}
