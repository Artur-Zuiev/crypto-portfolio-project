package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.model.PortfolioItem;
import com.artur.cryptoportfolio.repository.CryptoCurrencyRepository;
import com.artur.cryptoportfolio.repository.PortfolioItemRepository;
import com.artur.cryptoportfolio.repository.TransactionRepository;
import com.artur.cryptoportfolio.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.mockito.Mockito.*;

class TransactionPrecisionTest {

    private final PortfolioItemRepository portfolioRepository = mock(PortfolioItemRepository.class);
    private final TransactionService service = new TransactionService(
            mock(TransactionRepository.class),
            mock(CryptoCurrencyRepository.class),
            mock(UserRepository.class),
            portfolioRepository
    );

    @Test
    void sellingExactHoldingDeletesPositionWithoutFloatingRemainder() throws Exception {
        PortfolioItem position = new PortfolioItem();
        position.setQuantity(0.3);
        Method sell = TransactionService.class.getDeclaredMethod(
                "updatePortfolioAfterSell", PortfolioItem.class, Double.class);
        sell.setAccessible(true);
        sell.invoke(service, position, 0.3);
        verify(portfolioRepository).delete(position);
        verify(portfolioRepository, never()).save(any());
    }

    @Test
    void partialSalePreservesTinyPositiveBalance() throws Exception {
        PortfolioItem position = new PortfolioItem();
        position.setQuantity(0.00000000012);
        Method sell = TransactionService.class.getDeclaredMethod(
                "updatePortfolioAfterSell", PortfolioItem.class, Double.class);
        sell.setAccessible(true);
        sell.invoke(service, position, 0.00000000011);
        verify(portfolioRepository).save(position);
        org.junit.jupiter.api.Assertions.assertEquals(0.00000000001, position.getQuantity(), 1e-22);
    }
}
