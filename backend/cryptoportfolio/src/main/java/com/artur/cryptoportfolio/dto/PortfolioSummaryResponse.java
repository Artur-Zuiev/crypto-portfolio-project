package com.artur.cryptoportfolio.dto;

public class PortfolioSummaryResponse {

    private Double totalValue;
    private Double totalInvested;
    private Double totalProfitLoss;
    private Integer assetCount;

    private String bestAssetSymbol;
    private Double bestAssetProfitLoss;

    private String worstAssetSymbol;
    private Double worstAssetProfitLoss;

    public PortfolioSummaryResponse(
            Double totalValue,
            Double totalInvested,
            Double totalProfitLoss,
            Integer assetCount,
            String bestAssetSymbol,
            Double bestAssetProfitLoss,
            String worstAssetSymbol,
            Double worstAssetProfitLoss
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

    public Double getTotalValue() {
        return totalValue;
    }

    public Double getTotalInvested() {
        return totalInvested;
    }

    public Double getTotalProfitLoss() {
        return totalProfitLoss;
    }

    public Integer getAssetCount() {
        return assetCount;
    }

    public String getBestAssetSymbol() {
        return bestAssetSymbol;
    }

    public Double getBestAssetProfitLoss() {
        return bestAssetProfitLoss;
    }

    public String getWorstAssetSymbol() {
        return worstAssetSymbol;
    }

    public Double getWorstAssetProfitLoss() {
        return worstAssetProfitLoss;
    }
}