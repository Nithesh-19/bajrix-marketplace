package com.bajrix.dto.offer;

import java.math.BigDecimal;

public record SellerOfferDto(
    Long id,
    Long sellerId,
    String sellerName,
    String sellerLocation,
    BigDecimal sellerRating,
    BigDecimal price,
    Integer availableStock,
    Integer minOrderQuantity,
    Boolean active,
    boolean isLowestPrice
) {}
