package com.bajrix.dto.seller;

import com.bajrix.entity.SellerStatus;
import java.math.BigDecimal;

public record SellerDto(
    Long id,
    String name,
    String email,
    String phone,
    String location,
    SellerStatus sellerStatus,
    BigDecimal rating
) {}
