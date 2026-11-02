package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.dto.PortfolioItemResponse;
import com.artur.cryptoportfolio.model.CryptoCurrency;
import com.artur.cryptoportfolio.model.PortfolioItem;
import com.artur.cryptoportfolio.repository.CryptoCurrencyRepository;
import com.artur.cryptoportfolio.repository.PortfolioItemRepository;
import com.artur.cryptoportfolio.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class PortfolioQuantityPrecisionTest {

    @Test
    void tinyCryptoHoldingsAreNotRoundedToZeroInApiResponse() throws Exception {
        PortfolioService service = new PortfolioService(
                mock(PortfolioItemRepository.class),
                mock(UserRepository.class),
                mock(CryptoCurrencyRepository.class)
        );
        CryptoCurrency crypto = new CryptoCurrency();
        crypto.setSymbol("BTC");
        crypto.setName("Bitcoin");
        crypto.setCurrentPrice(60000.0);

        PortfolioItem item = new PortfolioItem();
        item.setCryptoCurrency(crypto);
        item.setQuantity(0.00000001);
        item.setAverageBuyPrice(50000.0);

        Method convert = PortfolioService.class.getDeclaredMethod(
                "convertToResponse", PortfolioItem.class, Double.class);
        convert.setAccessible(true);

        PortfolioItemResponse response = (PortfolioItemResponse) convert.invoke(
                service, item, 0.0006);
        assertEquals(0.00000001, response.getQuantity());
    }
}
