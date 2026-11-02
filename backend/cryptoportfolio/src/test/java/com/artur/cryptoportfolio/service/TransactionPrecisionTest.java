package com.artur.cryptoportfolio.service;

import com.artur.cryptoportfolio.dto.AddTransactionRequest;
import com.artur.cryptoportfolio.model.*;
import com.artur.cryptoportfolio.repository.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TransactionPrecisionTest {
 private final TransactionRepository tx=mock(TransactionRepository.class);
 private final CryptoCurrencyRepository coins=mock(CryptoCurrencyRepository.class);
 private final UserRepository users=mock(UserRepository.class);
 private final PortfolioItemRepository items=mock(PortfolioItemRepository.class);
 private final TransactionService service=new TransactionService(tx,coins,users,items);

 private void setup(BigDecimal balance) {
  User u=new User(); CryptoCurrency c=new CryptoCurrency();
  c.setSymbol("BTC");c.setName("Bitcoin");
  when(users.findById(1L)).thenReturn(Optional.of(u));
  when(coins.findById(2L)).thenReturn(Optional.of(c));
  PortfolioItem p=new PortfolioItem();p.setQuantity(balance);p.setCryptoCurrency(c);
  when(items.findByUserIdAndCryptoCurrencyId(any(),any())).thenReturn(List.of(p));
  when(tx.save(any())).thenAnswer(inv -> inv.getArgument(0));
 }
 private AddTransactionRequest request(String amount) {
  AddTransactionRequest r=new AddTransactionRequest();
  r.setCryptoCurrencyId(2L);r.setQuantity(new BigDecimal(amount));r.setPrice(new BigDecimal("100"));
  return r;
 }
 @Test void fullSaleDeletesExactly() {
  setup(new BigDecimal("0.3"));
  service.addSellTransaction(1L,request("0.3"));
  verify(items).delete(any(PortfolioItem.class));
 }
 @Test void partialSaleKeepsTinyRemainder() {
  setup(new BigDecimal("0.00000000012"));
  service.addSellTransaction(1L,request("0.00000000011"));
  org.mockito.ArgumentCaptor<PortfolioItem> captor=org.mockito.ArgumentCaptor.forClass(PortfolioItem.class);
  verify(items).save(captor.capture());
  assertEquals(0,new BigDecimal("0.00000000001").compareTo(captor.getValue().getQuantity()));
 }
 @Test void rejectsOversell() {
  setup(new BigDecimal("0.1"));
  assertThrows(IllegalArgumentException.class,()->service.addSellTransaction(1L,request("0.2")));
  verify(tx,never()).save(any());
 }
}