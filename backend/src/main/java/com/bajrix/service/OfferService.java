package com.bajrix.service;

import com.bajrix.dto.offer.SellerOfferDto;
import com.bajrix.entity.SellerListing;
import com.bajrix.exception.ResourceNotFoundException;
import com.bajrix.repository.ProductRepository;
import com.bajrix.repository.SellerListingRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class OfferService {

    private final ProductRepository productRepository;
    private final SellerListingRepository sellerListingRepository;

    public OfferService(ProductRepository productRepository, SellerListingRepository sellerListingRepository) {
        this.productRepository = productRepository;
        this.sellerListingRepository = sellerListingRepository;
    }

    public List<SellerOfferDto> getOffersForProduct(Long productId, String sort) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with ID: " + productId);
        }

        Sort querySort = resolveOfferSort(sort);
        List<SellerListing> listings = sellerListingRepository.findBuyerVisibleOffers(productId, querySort);

        if (listings.isEmpty()) {
            return Collections.emptyList();
        }

        // Find the lowest price among available offers
        BigDecimal lowestPrice = listings.stream()
            .map(SellerListing::getPrice)
            .min(BigDecimal::compareTo)
            .orElse(null);

        return listings.stream()
            .map(sl -> new SellerOfferDto(
                sl.getId(),
                sl.getSeller().getId(),
                sl.getSeller().getName(),
                sl.getSeller().getLocation(),
                sl.getSeller().getRating(),
                sl.getPrice(),
                sl.getAvailableStock(),
                sl.getMinOrderQuantity(),
                sl.getActive(),
                lowestPrice != null && lowestPrice.compareTo(sl.getPrice()) == 0
            ))
            .toList();
    }

    private Sort resolveOfferSort(String sort) {
        if ("price_desc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "price");
        } else if ("stock_desc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "availableStock");
        } else if ("rating_desc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "seller.rating");
        }
        // Default sort: lowest price first
        return Sort.by(Sort.Direction.ASC, "price");
    }
}
