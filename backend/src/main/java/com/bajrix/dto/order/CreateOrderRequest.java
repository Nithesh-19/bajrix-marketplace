package com.bajrix.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateOrderRequest(
    @NotBlank(message = "Buyer name is required")
    String buyerName,

    @NotBlank(message = "Contact phone number is required")
    String buyerPhone,

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    String buyerEmail,

    String projectSiteName,

    @NotBlank(message = "Delivery site address is required")
    String deliveryAddress,

    @NotBlank(message = "City is required")
    String city,

    @NotBlank(message = "State is required")
    String state,

    @NotBlank(message = "Pincode is required")
    String pincode,

    String siteUnloadingNotes,

    @NotBlank(message = "Payment method is required")
    String paymentMethod,

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    List<OrderItemRequest> items
) {}
