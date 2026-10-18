package com.bajrix.controller;

import com.bajrix.dto.common.PagedResponse;
import com.bajrix.dto.seller.CreateListingRequest;
import com.bajrix.dto.seller.SellerListingDto;
import com.bajrix.dto.seller.UpdateListingRequest;
import com.bajrix.exception.DuplicateListingException;
import com.bajrix.exception.GlobalExceptionHandler;
import com.bajrix.exception.UnauthorizedSellerException;
import com.bajrix.security.SellerIdentityResolver;
import com.bajrix.service.SellerListingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SellerListingController.class)
@Import({GlobalExceptionHandler.class, SellerIdentityResolver.class})
class SellerListingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SellerListingService sellerListingService;

    @Test
    @DisplayName("POST /api/seller/listings - Should reject listing when price is zero or negative")
    void shouldRejectInvalidPrice() throws Exception {
        // Price is 0.00 (violates @DecimalMin("0.01"))
        CreateListingRequest invalidRequest = new CreateListingRequest(
            1L,
            new BigDecimal("0.00"),
            100,
            10,
            true
        );

        mockMvc.perform(post("/api/seller/listings")
                .header("X-Seller-Id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.validationErrors[0].field").value("price"))
            .andExpect(jsonPath("$.validationErrors[0].message").value("Price must be greater than zero"));
    }

    @Test
    @DisplayName("POST /api/seller/listings - Should reject listing when stock is negative")
    void shouldRejectNegativeStock() throws Exception {
        CreateListingRequest invalidRequest = new CreateListingRequest(
            1L,
            new BigDecimal("390.00"),
            -5,
            10,
            true
        );

        mockMvc.perform(post("/api/seller/listings")
                .header("X-Seller-Id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.validationErrors[0].field").value("availableStock"))
            .andExpect(jsonPath("$.validationErrors[0].message").value("Available stock cannot be negative"));
    }

    @Test
    @DisplayName("POST /api/seller/listings - Should reject listing when MOQ is less than 1")
    void shouldRejectInvalidMoq() throws Exception {
        CreateListingRequest invalidRequest = new CreateListingRequest(
            1L,
            new BigDecimal("390.00"),
            100,
            0,
            true
        );

        mockMvc.perform(post("/api/seller/listings")
                .header("X-Seller-Id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.validationErrors[0].field").value("minOrderQuantity"))
            .andExpect(jsonPath("$.validationErrors[0].message").value("Minimum order quantity must be at least 1"));
    }

    @Test
    @DisplayName("POST /api/seller/listings - Should return 409 Conflict when duplicate listing exists")
    void shouldReturnConflictOnDuplicate() throws Exception {
        CreateListingRequest request = new CreateListingRequest(
            1L,
            new BigDecimal("390.00"),
            100,
            10,
            true
        );

        when(sellerListingService.createListing(eq(1L), any(CreateListingRequest.class)))
            .thenThrow(new DuplicateListingException("You already have an existing listing for this product"));

        mockMvc.perform(post("/api/seller/listings")
                .header("X-Seller-Id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409))
            .andExpect(jsonPath("$.message").value("You already have an existing listing for this product"));
    }

    @Test
    @DisplayName("PUT /api/seller/listings/{id} - Should return 403 Forbidden when unauthorized seller attempts modification")
    void shouldReturnForbiddenForUnauthorizedSeller() throws Exception {
        UpdateListingRequest request = new UpdateListingRequest(
            new BigDecimal("380.00"),
            200,
            20,
            true,
            0L
        );

        when(sellerListingService.updateListing(eq(2L), eq(100L), any(UpdateListingRequest.class)))
            .thenThrow(new UnauthorizedSellerException("Forbidden: You do not have permission to manage listings belonging to another seller."));

        mockMvc.perform(put("/api/seller/listings/100")
                .header("X-Seller-Id", "2")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.status").value(403))
            .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("POST /api/seller/listings - Should successfully create valid listing and return 201 Created")
    void shouldCreateListingSuccessfully() throws Exception {
        CreateListingRequest request = new CreateListingRequest(
            1L,
            new BigDecimal("390.00"),
            500,
            50,
            true
        );

        SellerListingDto createdDto = new SellerListingDto(
            10L, 1L, "Apex Supplies", 1L, "UltraTech PPC Cement 50 kg", "Cement", "50 kg bag",
            "http://img.com", new BigDecimal("390.00"), 500, 50, true, 0L,
            OffsetDateTime.now(), OffsetDateTime.now()
        );

        when(sellerListingService.createListing(eq(1L), any(CreateListingRequest.class)))
            .thenReturn(createdDto);

        mockMvc.perform(post("/api/seller/listings")
                .header("X-Seller-Id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(10))
            .andExpect(jsonPath("$.data.price").value(390.00))
            .andExpect(jsonPath("$.data.availableStock").value(500));
    }
}
