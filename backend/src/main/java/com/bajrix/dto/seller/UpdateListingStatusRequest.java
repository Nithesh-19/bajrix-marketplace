package com.bajrix.dto.seller;

import jakarta.validation.constraints.NotNull;

public record UpdateListingStatusRequest(
    @NotNull(message = "Active status is required")
    Boolean active
) {}
