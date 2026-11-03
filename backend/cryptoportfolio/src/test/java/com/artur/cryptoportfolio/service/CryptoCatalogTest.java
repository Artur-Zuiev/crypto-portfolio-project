package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.model.CryptoCurrency;
import com.artur.cryptoportfolio.repository.CryptoCurrencyRepository;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CryptoCatalogTest {
    @Test
    void zeroPriceIsAllowedForCoinWithoutLiveQuote() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        CryptoCurrency coin = new CryptoCurrency();
        coin.setSymbol("BTC");
        coin.setName("Bitcoin");
        coin.setCurrentPrice(0.0);
        coin.setMarketCap(0.0);
        assertTrue(validator.validate(coin).isEmpty(),
                "An initially unpriced coin must be saved without inventing a price");
        coin.setCurrentPrice(-1.0);
        assertFalse(validator.validate(coin).isEmpty(),
                "Negative prices must still be rejected");
    }

    @Test
    void firstGetCreatesSelectableCoinsInEmptyDatabase() {
        CryptoCurrencyRepository repository = mock(CryptoCurrencyRepository.class);
        when(repository.findBySymbol(anyString())).thenReturn(Optional.empty());
        when(repository.save(any(CryptoCurrency.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(repository.findAll()).thenReturn(List.of());

        CryptoService service = new CryptoService(repository);
        service.getAllCrypto();

        ArgumentCaptor<CryptoCurrency> captor = ArgumentCaptor.forClass(CryptoCurrency.class);
        verify(repository, times(5)).save(captor.capture());
        assertEquals(5, captor.getAllValues().size());
        for (CryptoCurrency coin : captor.getAllValues()) {
            assertEquals(0.0, coin.getCurrentPrice());
            assertEquals(0.0, coin.getMarketCap());
            assertNull(coin.getLastUpdated());
        }
    }
}
