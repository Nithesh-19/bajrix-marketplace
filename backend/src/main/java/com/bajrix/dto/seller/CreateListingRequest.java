package com.bajrix.dto.seller;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateListingRequest(
    @NotNull(message = "Product ID is required")
    Long productId,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    BigDecimal price,

    @NotNull(message = "Available stock is required")
    @Min(value = 0, message = "Available stock cannot be negative")
    Integer availableStock,

    @NotNull(message = "Minimum order quantity is required")
    @Min(value = 1, message = "Minimum order quantity must be at least 1")
    Integer minOrderQuantity,

    Boolean active
) {}
