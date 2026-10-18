package com.bajrix.dto.product;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ProductDetailDto(
    Long id,
    String name,
    String description,
    String category,
    String unit,
    String imageUrl,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    long availableOffersCount,
    long totalStock,
    boolean hasOffers,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
