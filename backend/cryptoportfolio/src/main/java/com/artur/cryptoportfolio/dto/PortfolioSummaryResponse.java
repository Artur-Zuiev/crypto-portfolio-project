package com.artur.cryptoportfolio.dto;
import java.math.BigDecimal;

public class PortfolioSummaryResponse {

    private BigDecimal totalValue;
    private BigDecimal totalInvested;
    private BigDecimal totalProfitLoss;
    private Integer assetCount;

    private String bestAssetSymbol;
    private BigDecimal bestAssetProfitLoss;

    private String worstAssetSymbol;
    private BigDecimal worstAssetProfitLoss;

    public PortfolioSummaryResponse(
            BigDecimal totalValue,
            BigDecimal totalInvested,
            BigDecimal totalProfitLoss,
            Integer assetCount,
            String bestAssetSymbol,
            BigDecimal bestAssetProfitLoss,
            String worstAssetSymbol,
            BigDecimal worstAssetProfitLoss
    ) {
        this.totalValue = totalValue;
        this.totalInvested = totalInvested;
        this.totalProfitLoss = totalProfitLoss;
        this.assetCount = assetCount;
        this.bestAssetSymbol = bestAssetSymbol;
        this.bestAssetProfitLoss = bestAssetProfitLoss;
        this.worstAssetSymbol = worstAssetSymbol;
        this.worstAssetProfitLoss = worstAssetProfitLoss;
    }

    public BigDecimal getTotalValue() {
        return totalValue;
    }

    public BigDecimal getTotalInvested() {
        return totalInvested;
    }

    public BigDecimal getTotalProfitLoss() {
        return totalProfitLoss;
    }

    public Integer getAssetCount() {
        return assetCount;
    }

    public String getBestAssetSymbol() {
        return bestAssetSymbol;
    }

    public BigDecimal getBestAssetProfitLoss() {
        return bestAssetProfitLoss;
    }

    public String getWorstAssetSymbol() {
        return worstAssetSymbol;
    }

    public BigDecimal getWorstAssetProfitLoss() {
        return worstAssetProfitLoss;
    }
}