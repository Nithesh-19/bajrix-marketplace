package com.bajrix.dto.seller;

public record SellerStatsDto(
    long totalListings,
    long activeListings,
    long lowStockListings
) {}
