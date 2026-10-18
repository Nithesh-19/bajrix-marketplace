package com.bajrix.dto.order;

import com.bajrix.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderDto(
    Long id,
    String orderNumber,
    String buyerName,
    String buyerPhone,
    String buyerEmail,
    String projectSiteName,
    String deliveryAddress,
    String city,
    String state,
    String pincode,
    String siteUnloadingNotes,
    String paymentMethod,
    BigDecimal totalMaterialAmount,
    BigDecimal freightAmount,
    BigDecimal taxAmount,
    BigDecimal totalAmount,
    OrderStatus orderStatus,
    OffsetDateTime createdAt,
    List<OrderItemDto> items
) {}
