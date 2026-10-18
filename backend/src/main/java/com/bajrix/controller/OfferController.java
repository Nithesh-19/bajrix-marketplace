package com.bajrix.controller;

import com.bajrix.dto.common.ApiResponse;
import com.bajrix.dto.offer.SellerOfferDto;
import com.bajrix.service.OfferService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @GetMapping("/{id}/offers")
    public ResponseEntity<ApiResponse<List<SellerOfferDto>>> getOffersForProduct(
        @PathVariable Long id,
        @RequestParam(defaultValue = "price_asc") String sort
    ) {
        List<SellerOfferDto> offers = offerService.getOffersForProduct(id, sort);
        return ResponseEntity.ok(ApiResponse.ok(offers));
    }
}
