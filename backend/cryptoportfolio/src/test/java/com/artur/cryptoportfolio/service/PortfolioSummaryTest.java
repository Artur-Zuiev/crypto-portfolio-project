package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.dto.PortfolioSummaryResponse;
import com.artur.cryptoportfolio.model.CryptoCurrency;
import com.artur.cryptoportfolio.model.PortfolioItem;
import com.artur.cryptoportfolio.model.User;
import com.artur.cryptoportfolio.repository.CryptoCurrencyRepository;
import com.artur.cryptoportfolio.repository.PortfolioItemRepository;
import com.artur.cryptoportfolio.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PortfolioSummaryTest {
    private final PortfolioItemRepository portfolioItems = mock(PortfolioItemRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final PortfolioService service = new PortfolioService(
            portfolioItems, users, mock(CryptoCurrencyRepository.class));

    private PortfolioItem holding(String symbol, String price, String paid) {
        CryptoCurrency currency = new CryptoCurrency();
        currency.setSymbol(symbol);
        currency.setName(symbol);
        currency.setCurrentPrice(Double.parseDouble(price));
        PortfolioItem item = new PortfolioItem();
        item.setCryptoCurrency(currency);
        item.setQuantity(BigDecimal.ONE);
        item.setAverageBuyPrice(new BigDecimal(paid));
        return item;
    }

    private PortfolioSummaryResponse summary(PortfolioItem... holdings) {
        User user = new User();
        user.setEmail("example@localhost");
        when(users.findByEmail("example@localhost")).thenReturn(Optional.of(user));
        when(portfolioItems.findByUserId(any())).thenReturn(List.of(holdings));
        return (PortfolioSummaryResponse) service.getPortfolioSummaryByUserEmail("example@localhost").getBody();
    }

    @Test void breakEvenPortfolioDoesNotInventBestOrWorst() {
        PortfolioSummaryResponse result = summary(
                holding("BTC", "100", "100"), holding("ETH", "200", "200"));
        assertNotNull(result);
        assertEquals("-", result.getBestAssetSymbol());
        assertEquals("-", result.getWorstAssetSymbol());
        assertEquals(0, BigDecimal.ZERO.compareTo(result.getTotalProfitLoss()));
    }

    @Test void positiveAndNegativeChangesPickActualWinnersAndLosers() {
        PortfolioSummaryResponse result = summary(
                holding("BTC", "110", "100"), holding("ETH", "90", "100"));
        assertNotNull(result);
        assertEquals("BTC", result.getBestAssetSymbol());
        assertEquals("ETH", result.getWorstAssetSymbol());
    }

    @Test void onlyProfitDoesNotInventLoss() {
        PortfolioSummaryResponse result = summary(holding("BTC", "110", "100"));
        assertNotNull(result);
        assertEquals("BTC", result.getBestAssetSymbol());
        assertEquals("-", result.getWorstAssetSymbol());
    }
}
