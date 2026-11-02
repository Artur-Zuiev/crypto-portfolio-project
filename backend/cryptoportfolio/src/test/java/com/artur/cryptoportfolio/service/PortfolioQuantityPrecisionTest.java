package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.dto.PortfolioItemResponse;
import com.artur.cryptoportfolio.model.*;
import com.artur.cryptoportfolio.repository.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.lang.reflect.Method;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PortfolioQuantityPrecisionTest {
 @Test void tinyCryptoHoldingsAreNotRoundedToZeroInApiResponse() throws Exception {
  PortfolioService service = new PortfolioService(mock(PortfolioItemRepository.class),mock(UserRepository.class),mock(CryptoCurrencyRepository.class));
  CryptoCurrency crypto = new CryptoCurrency();crypto.setSymbol("BTC");crypto.setName("Bitcoin");crypto.setCurrentPrice(60000.0);
  PortfolioItem item = new PortfolioItem();item.setCryptoCurrency(crypto);
  item.setQuantity(new BigDecimal("0.00000001"));item.setAverageBuyPrice(new BigDecimal("50000"));
  Method convert = PortfolioService.class.getDeclaredMethod("convertToResponse",PortfolioItem.class,BigDecimal.class);convert.setAccessible(true);
  PortfolioItemResponse response=(PortfolioItemResponse)convert.invoke(service,item,new BigDecimal("0.0006"));
  assertEquals(0,new BigDecimal("0.00000001").compareTo(response.getQuantity()));
 }
}