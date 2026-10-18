package com.bajrix.dto.seller;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record SellerListingDto(
    Long id,
    Long sellerId,
    String sellerName,
    Long productId,
    String productName,
    String productCategory,
    String productUnit,
    String productImageUrl,
    BigDecimal price,
    Integer availableStock,
    Integer minOrderQuantity,
    Boolean active,
    Long version,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
