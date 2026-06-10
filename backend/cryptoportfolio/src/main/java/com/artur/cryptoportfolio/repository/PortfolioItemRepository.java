package com.artur.cryptoportfolio.repository;

import com.artur.cryptoportfolio.model.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {
    
    List<PortfolioItem> findByUserId(Long userId);

    List<PortfolioItem> findByUserIdAndCryptoCurrencySymbol(Long userId, String symbol);

    List<PortfolioItem> findByUserIdAndCryptoCurrencyId(Long userId, Long cryptoCurrencyId);
}
