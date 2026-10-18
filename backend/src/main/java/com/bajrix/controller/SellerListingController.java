package com.bajrix.controller;

import com.bajrix.dto.common.ApiResponse;
import com.bajrix.dto.common.PagedResponse;
import com.bajrix.dto.seller.*;
import com.bajrix.security.CurrentSellerId;
import com.bajrix.service.SellerListingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller/listings")
public class SellerListingController {

    private final SellerListingService sellerListingService;

    public SellerListingController(SellerListingService sellerListingService) {
        this.sellerListingService = sellerListingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SellerListingDto>>> getListings(
        @CurrentSellerId Long sellerId,
        @RequestParam(required = false) Boolean active,
        @RequestParam(required = false) String query,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "updated_desc") String sort
    ) {
        PagedResponse<SellerListingDto> response = sellerListingService.getListingsForSeller(sellerId, active, query, page, size, sort);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<SellerStatsDto>> getSellerStats(@CurrentSellerId Long sellerId) {
        SellerStatsDto stats = sellerListingService.getSellerStats(sellerId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SellerListingDto>> getListingById(
        @CurrentSellerId Long sellerId,
        @PathVariable Long id
    ) {
        SellerListingDto dto = sellerListingService.getListingById(sellerId, id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SellerListingDto>> createListing(
        @CurrentSellerId Long sellerId,
        @Valid @RequestBody CreateListingRequest request
    ) {
        SellerListingDto created = sellerListingService.createListing(sellerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Listing created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SellerListingDto>> updateListing(
        @CurrentSellerId Long sellerId,
        @PathVariable Long id,
        @Valid @RequestBody UpdateListingRequest request
    ) {
        SellerListingDto updated = sellerListingService.updateListing(sellerId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Listing updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SellerListingDto>> updateListingStatus(
        @CurrentSellerId Long sellerId,
        @PathVariable Long id,
        @Valid @RequestBody UpdateListingStatusRequest request
    ) {
        SellerListingDto updated = sellerListingService.updateListingStatus(sellerId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Listing status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(
        @CurrentSellerId Long sellerId,
        @PathVariable Long id
    ) {
        sellerListingService.deleteListing(sellerId, id);
        return ResponseEntity.noContent().build();
    }
}
