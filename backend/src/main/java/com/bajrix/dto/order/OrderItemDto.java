package com.bajrix.dto.order;

import java.math.BigDecimal;

public record OrderItemDto(
    Long id,
    Long listingId,
    Long sellerId,
    String sellerName,
    Long productId,
    String productName,
    String productUnit,
    BigDecimal unitPrice,
    Integer quantity,
    BigDecimal totalPrice
) {}
