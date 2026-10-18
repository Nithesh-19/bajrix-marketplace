package com.bajrix.controller;

import com.bajrix.dto.auth.AuthResponse;
import com.bajrix.dto.auth.LoginRequest;
import com.bajrix.dto.common.ApiResponse;
import com.bajrix.entity.Seller;
import com.bajrix.repository.SellerRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SellerRepository sellerRepository;

    public AuthController(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        String email = request.email() != null ? request.email().trim().toLowerCase() : "";
        String requestedRole = request.role() != null ? request.role().trim().toUpperCase() : null;

        // Check if seller email exists in sellers table
        Optional<Seller> sellerOpt = sellerRepository.findByEmail(email);

        if (sellerOpt.isPresent() && !"BUYER".equals(requestedRole)) {
            Seller seller = sellerOpt.get();
            AuthResponse authResponse = new AuthResponse(
                String.valueOf(seller.getId()),
                seller.getEmail(),
                seller.getName(),
                "SELLER",
                seller.getId(),
                seller.getSellerStatus() != null ? seller.getSellerStatus().name() : "APPROVED",
                seller.getName(),
                "bajrix-token-seller-" + UUID.randomUUID()
            );
            return ResponseEntity.ok(ApiResponse.ok("Login successful as Seller", authResponse));
        }

        // Otherwise buyer
        String buyerName = "buyer@bajrix.com".equalsIgnoreCase(email)
            ? "Priya Sharma (Larsen Infra)"
            : formatDisplayName(email);

        String organization = "buyer@bajrix.com".equalsIgnoreCase(email)
            ? "Larsen Infra Contracting Ltd"
            : "BajriX Procurement Partner";

        AuthResponse authResponse = new AuthResponse(
            "buyer-" + UUID.randomUUID().toString().substring(0, 8),
            email,
            buyerName,
            "BUYER",
            null,
            "ACTIVE",
            organization,
            "bajrix-token-buyer-" + UUID.randomUUID()
        );

        return ResponseEntity.ok(ApiResponse.ok("Login successful as Buyer", authResponse));
    }

    private String formatDisplayName(String email) {
        if (email == null || email.isBlank()) {
            return "BajriX Buyer";
        }
        String prefix = email.split("@")[0].replace(".", " ").replace("_", " ");
        String[] parts = prefix.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                sb.append(Character.toUpperCase(part.charAt(0)))
                  .append(part.substring(1).toLowerCase())
                  .append(" ");
            }
        }
        return sb.toString().trim();
    }
}
