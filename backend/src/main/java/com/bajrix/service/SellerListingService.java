package com.bajrix.service;

import com.bajrix.dto.common.PagedResponse;
import com.bajrix.dto.seller.*;
import com.bajrix.entity.Product;
import com.bajrix.entity.Seller;
import com.bajrix.entity.SellerListing;
import com.bajrix.exception.DuplicateListingException;
import com.bajrix.exception.InvalidListingOperationException;
import com.bajrix.exception.ResourceNotFoundException;
import com.bajrix.exception.UnauthorizedSellerException;
import com.bajrix.repository.ProductRepository;
import com.bajrix.repository.SellerListingRepository;
import com.bajrix.repository.SellerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SellerListingService {

    private final SellerListingRepository listingRepository;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;

    public SellerListingService(SellerListingRepository listingRepository,
                                SellerRepository sellerRepository,
                                ProductRepository productRepository) {
        this.listingRepository = listingRepository;
        this.sellerRepository = sellerRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<SellerListingDto> getListingsForSeller(Long sellerId,
                                                               Boolean active,
                                                               String query,
                                                               int page,
                                                               int size,
                                                               String sort) {
        // Verify seller exists
        if (!sellerRepository.existsById(sellerId)) {
            throw new ResourceNotFoundException("Seller not found with ID: " + sellerId);
        }

        int boundedSize = Math.min(Math.max(size, 1), 50);
        int boundedPage = Math.max(page, 0);

        Sort listingSort = resolveListingSort(sort);
        Pageable pageable = PageRequest.of(boundedPage, boundedSize, listingSort);

        String trimmedQuery = (query != null && !query.isBlank()) ? query.trim() : null;
        Page<SellerListing> listingPage = listingRepository.findBySellerIdFiltered(sellerId, active, trimmedQuery, pageable);

        return PagedResponse.of(listingPage.getContent().stream().map(this::toDto).toList(), listingPage);
    }

    @Transactional(readOnly = true)
    public SellerListingDto getListingById(Long sellerId, Long listingId) {
        SellerListing listing = listingRepository.findByIdWithDetails(listingId)
            .orElseThrow(() -> new ResourceNotFoundException("Listing not found with ID: " + listingId));

        // Enforce seller ownership
        verifyOwnership(listing, sellerId);

        return toDto(listing);
    }

    public SellerListingDto createListing(Long sellerId, CreateListingRequest request) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new ResourceNotFoundException("Seller not found with ID: " + sellerId));

        Product product = productRepository.findById(request.productId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.productId()));

        // Enforce business rule: A seller can have only one listing per product
        if (listingRepository.existsBySellerIdAndProductId(sellerId, request.productId())) {
            throw new DuplicateListingException(
                "You already have an existing listing for '" + product.getName() + "'. Please update your existing listing instead of creating a duplicate."
            );
        }

        // Validate MOQ vs Stock rule
        validateStockAndMoq(request.availableStock(), request.minOrderQuantity());

        SellerListing listing = new SellerListing(
            null,
            seller,
            product,
            request.price(),
            request.availableStock(),
            request.minOrderQuantity(),
            request.active() != null ? request.active() : true
        );

        SellerListing saved = listingRepository.save(listing);
        return toDto(saved);
    }

    public SellerListingDto updateListing(Long sellerId, Long listingId, UpdateListingRequest request) {
        SellerListing listing = listingRepository.findByIdWithDetails(listingId)
            .orElseThrow(() -> new ResourceNotFoundException("Listing not found with ID: " + listingId));

        // Enforce seller ownership
        verifyOwnership(listing, sellerId);

        // Optimistic locking version check
        if (request.version() != null && !request.version().equals(listing.getVersion())) {
            throw new ObjectOptimisticLockingFailureException(SellerListing.class, listingId);
        }

        // Validate MOQ vs Stock rule
        validateStockAndMoq(request.availableStock(), request.minOrderQuantity());

        listing.setPrice(request.price());
        listing.setAvailableStock(request.availableStock());
        listing.setMinOrderQuantity(request.minOrderQuantity());
        if (request.active() != null) {
            listing.setActive(request.active());
        }

        SellerListing updated = listingRepository.save(listing);
        return toDto(updated);
    }

    public SellerListingDto updateListingStatus(Long sellerId, Long listingId, UpdateListingStatusRequest request) {
        SellerListing listing = listingRepository.findByIdWithDetails(listingId)
            .orElseThrow(() -> new ResourceNotFoundException("Listing not found with ID: " + listingId));

        // Enforce seller ownership
        verifyOwnership(listing, sellerId);

        listing.setActive(request.active());
        SellerListing updated = listingRepository.save(listing);
        return toDto(updated);
    }

    public void deleteListing(Long sellerId, Long listingId) {
        SellerListing listing = listingRepository.findByIdWithDetails(listingId)
            .orElseThrow(() -> new ResourceNotFoundException("Listing not found with ID: " + listingId));

        // Enforce seller ownership
        verifyOwnership(listing, sellerId);

        listingRepository.delete(listing);
    }

    @Transactional(readOnly = true)
    public SellerStatsDto getSellerStats(Long sellerId) {
        if (!sellerRepository.existsById(sellerId)) {
            throw new ResourceNotFoundException("Seller not found with ID: " + sellerId);
        }

        long total = listingRepository.countBySellerId(sellerId);
        long active = listingRepository.countBySellerIdAndActiveTrue(sellerId);
        long lowStock = listingRepository.countLowStockBySellerId(sellerId);

        return new SellerStatsDto(total, active, lowStock);
    }

    private void verifyOwnership(SellerListing listing, Long sellerId) {
        if (!listing.getSeller().getId().equals(sellerId)) {
            throw new UnauthorizedSellerException("Forbidden: You do not have permission to manage listings belonging to another seller.");
        }
    }

    private void validateStockAndMoq(Integer stock, Integer moq) {
        if (stock != null && moq != null && stock > 0 && stock < moq) {
            throw new InvalidListingOperationException(
                "Available stock (" + stock + ") cannot be less than the minimum order quantity (" + moq + ") when stock is greater than zero."
            );
        }
    }

    private Sort resolveListingSort(String sort) {
        if ("price_asc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "price");
        } else if ("stock_asc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "availableStock");
        } else if ("stock_desc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "availableStock");
        }
        return Sort.by(Sort.Direction.DESC, "updatedAt");
    }

    private SellerListingDto toDto(SellerListing sl) {
        return new SellerListingDto(
            sl.getId(),
            sl.getSeller().getId(),
            sl.getSeller().getName(),
            sl.getProduct().getId(),
            sl.getProduct().getName(),
            sl.getProduct().getCategory(),
            sl.getProduct().getUnit(),
            sl.getProduct().getImageUrl(),
            sl.getPrice(),
            sl.getAvailableStock(),
            sl.getMinOrderQuantity(),
            sl.getActive(),
            sl.getVersion(),
            sl.getCreatedAt(),
            sl.getUpdatedAt()
        );
    }
}
