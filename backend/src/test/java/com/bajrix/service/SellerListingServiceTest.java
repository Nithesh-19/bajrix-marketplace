package com.bajrix.service;

import com.bajrix.dto.seller.CreateListingRequest;
import com.bajrix.dto.seller.SellerListingDto;
import com.bajrix.dto.seller.UpdateListingRequest;
import com.bajrix.dto.seller.UpdateListingStatusRequest;
import com.bajrix.entity.Product;
import com.bajrix.entity.Seller;
import com.bajrix.entity.SellerListing;
import com.bajrix.entity.SellerStatus;
import com.bajrix.exception.DuplicateListingException;
import com.bajrix.exception.InvalidListingOperationException;
import com.bajrix.exception.ResourceNotFoundException;
import com.bajrix.exception.UnauthorizedSellerException;
import com.bajrix.repository.ProductRepository;
import com.bajrix.repository.SellerListingRepository;
import com.bajrix.repository.SellerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SellerListingServiceTest {

    @Mock
    private SellerListingRepository listingRepository;

    @Mock
    private SellerRepository sellerRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private SellerListingService listingService;

    private Seller seller1;
    private Seller seller2;
    private Product product1;
    private SellerListing listing1;

    @BeforeEach
    void setUp() {
        seller1 = new Seller(1L, "Apex Supplies", "apex@test.com", "123456", "Mumbai", SellerStatus.APPROVED, new BigDecimal("4.80"));
        seller2 = new Seller(2L, "BuildPro", "buildpro@test.com", "654321", "Delhi", SellerStatus.APPROVED, new BigDecimal("4.60"));
        product1 = new Product(1L, "UltraTech PPC Cement 50 kg", "Cement description", "Cement", "50 kg bag", "http://img.com/cement.jpg");
        listing1 = new SellerListing(100L, seller1, product1, new BigDecimal("390.00"), 500, 50, true);
        listing1.setVersion(0L);
    }

    @Test
    @DisplayName("Should successfully create a listing for an authorized seller")
    void shouldCreateListingSuccessfully() {
        CreateListingRequest request = new CreateListingRequest(1L, new BigDecimal("390.00"), 500, 50, true);

        when(sellerRepository.findById(1L)).thenReturn(Optional.of(seller1));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(listingRepository.existsBySellerIdAndProductId(1L, 1L)).thenReturn(false);
        when(listingRepository.save(any(SellerListing.class))).thenAnswer(inv -> {
            SellerListing sl = inv.getArgument(0);
            sl.setId(101L);
            return sl;
        });

        SellerListingDto result = listingService.createListing(1L, request);

        assertNotNull(result);
        assertEquals(new BigDecimal("390.00"), result.price());
        assertEquals(500, result.availableStock());
        assertEquals(50, result.minOrderQuantity());
        assertEquals("UltraTech PPC Cement 50 kg", result.productName());
        verify(listingRepository).save(any(SellerListing.class));
    }

    @Test
    @DisplayName("Should reject duplicate listing creation for same seller and product")
    void shouldRejectDuplicateListing() {
        CreateListingRequest request = new CreateListingRequest(1L, new BigDecimal("390.00"), 500, 50, true);

        when(sellerRepository.findById(1L)).thenReturn(Optional.of(seller1));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(listingRepository.existsBySellerIdAndProductId(1L, 1L)).thenReturn(true);

        DuplicateListingException ex = assertThrows(DuplicateListingException.class, () ->
            listingService.createListing(1L, request)
        );

        assertTrue(ex.getMessage().contains("already have an existing listing"));
        verify(listingRepository, never()).save(any(SellerListing.class));
    }

    @Test
    @DisplayName("Should reject creation when positive stock is less than minimum order quantity")
    void shouldRejectStockLessThanMoq() {
        // Stock 20 is less than MOQ 50
        CreateListingRequest request = new CreateListingRequest(1L, new BigDecimal("390.00"), 20, 50, true);

        when(sellerRepository.findById(1L)).thenReturn(Optional.of(seller1));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(listingRepository.existsBySellerIdAndProductId(1L, 1L)).thenReturn(false);

        InvalidListingOperationException ex = assertThrows(InvalidListingOperationException.class, () ->
            listingService.createListing(1L, request)
        );

        assertTrue(ex.getMessage().contains("cannot be less than the minimum order quantity"));
        verify(listingRepository, never()).save(any(SellerListing.class));
    }

    @Test
    @DisplayName("Should prevent Seller 2 from viewing or updating Seller 1's listing (Ownership Enforcement)")
    void shouldPreventUnauthorizedSellerModification() {
        when(listingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(listing1));

        UpdateListingRequest updateReq = new UpdateListingRequest(new BigDecimal("380.00"), 400, 40, true, 0L);

        // Seller 2 attempts to update Seller 1's listing
        UnauthorizedSellerException ex = assertThrows(UnauthorizedSellerException.class, () ->
            listingService.updateListing(2L, 100L, updateReq)
        );

        assertTrue(ex.getMessage().contains("do not have permission"));
        verify(listingRepository, never()).save(any(SellerListing.class));
    }

    @Test
    @DisplayName("Should throw OptimisticLockingFailureException when update version does not match current version")
    void shouldDetectOptimisticLockingConflict() {
        listing1.setVersion(2L); // Current version in DB is 2
        when(listingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(listing1));

        // Client sent stale version 1
        UpdateListingRequest staleRequest = new UpdateListingRequest(new BigDecimal("380.00"), 400, 40, true, 1L);

        assertThrows(ObjectOptimisticLockingFailureException.class, () ->
            listingService.updateListing(1L, 100L, staleRequest)
        );

        verify(listingRepository, never()).save(any(SellerListing.class));
    }

    @Test
    @DisplayName("Should successfully toggle listing status between active and inactive")
    void shouldUpdateListingStatus() {
        when(listingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(listing1));
        when(listingRepository.save(any(SellerListing.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateListingStatusRequest request = new UpdateListingStatusRequest(false);
        SellerListingDto result = listingService.updateListingStatus(1L, 100L, request);

        assertNotNull(result);
        assertFalse(result.active());
        verify(listingRepository).save(listing1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when modifying non-existent listing")
    void shouldThrowWhenListingNotFound() {
        when(listingRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        UpdateListingRequest updateReq = new UpdateListingRequest(new BigDecimal("380.00"), 400, 40, true, 0L);

        assertThrows(ResourceNotFoundException.class, () ->
            listingService.updateListing(1L, 999L, updateReq)
        );
    }
}
