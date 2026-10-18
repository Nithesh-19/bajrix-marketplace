package com.bajrix.controller;

import com.bajrix.dto.common.ApiResponse;
import com.bajrix.dto.seller.SellerDto;
import com.bajrix.security.CurrentSellerId;
import com.bajrix.service.SellerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @GetMapping("/sellers")
    public ResponseEntity<ApiResponse<List<SellerDto>>> getAllSellers() {
        List<SellerDto> sellers = sellerService.getAllSellers();
        return ResponseEntity.ok(ApiResponse.ok(sellers));
    }

    @GetMapping("/seller/profile")
    public ResponseEntity<ApiResponse<SellerDto>> getCurrentSellerProfile(@CurrentSellerId Long sellerId) {
        SellerDto seller = sellerService.getSellerById(sellerId);
        return ResponseEntity.ok(ApiResponse.ok(seller));
    }

    @GetMapping("/sellers/{id}")
    public ResponseEntity<ApiResponse<SellerDto>> getSellerById(@PathVariable Long id) {
        SellerDto seller = sellerService.getSellerById(id);
        return ResponseEntity.ok(ApiResponse.ok(seller));
    }
}
