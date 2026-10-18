package com.bajrix.service;

import com.bajrix.dto.offer.SellerOfferDto;
import com.bajrix.entity.Product;
import com.bajrix.entity.Seller;
import com.bajrix.entity.SellerListing;
import com.bajrix.entity.SellerStatus;
import com.bajrix.exception.ResourceNotFoundException;
import com.bajrix.repository.ProductRepository;
import com.bajrix.repository.SellerListingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfferServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SellerListingRepository sellerListingRepository;

    @InjectMocks
    private OfferService offerService;

    private Product product;
    private Seller sellerA;
    private Seller sellerB;
    private Seller sellerC;
    private SellerListing offerA;
    private SellerListing offerB;
    private SellerListing offerC;

    @BeforeEach
    void setUp() {
        product = new Product(1L, "UltraTech PPC Cement 50 kg", "Desc", "Cement", "50 kg bag", "http://img.com");
        sellerA = new Seller(1L, "Seller A", "a@test.com", "111", "Navi Mumbai", SellerStatus.APPROVED, new BigDecimal("4.80"));
        sellerB = new Seller(2L, "Seller B", "b@test.com", "222", "Noida", SellerStatus.APPROVED, new BigDecimal("4.60"));
        sellerC = new Seller(3L, "Seller C", "c@test.com", "333", "Bengaluru", SellerStatus.APPROVED, new BigDecimal("4.90"));

        offerA = new SellerListing(1L, sellerA, product, new BigDecimal("390.00"), 500, 50, true);
        offerB = new SellerListing(2L, sellerB, product, new BigDecimal("385.00"), 200, 25, true);
        offerC = new SellerListing(3L, sellerC, product, new BigDecimal("405.00"), 1000, 100, true);
    }

    @Test
    @DisplayName("Should return buyer-visible offers and correctly identify lowest price offer")
    void shouldReturnOffersWithLowestPriceFlag() {
        when(productRepository.existsById(1L)).thenReturn(true);
        // Repository returns offers (already sorted by price ascending: 385, 390, 405)
        when(sellerListingRepository.findBuyerVisibleOffers(eq(1L), any(Sort.class)))
            .thenReturn(List.of(offerB, offerA, offerC));

        List<SellerOfferDto> offers = offerService.getOffersForProduct(1L, "price_asc");

        assertEquals(3, offers.size());

        // Offer B is ₹385 -> must be marked as lowest price
        SellerOfferDto bDto = offers.get(0);
        assertEquals("Seller B", bDto.sellerName());
        assertEquals(new BigDecimal("385.00"), bDto.price());
        assertTrue(bDto.isLowestPrice());

        // Offer A is ₹390 -> not lowest price
        SellerOfferDto aDto = offers.get(1);
        assertEquals("Seller A", aDto.sellerName());
        assertFalse(aDto.isLowestPrice());

        // Offer C is ₹405 -> not lowest price
        SellerOfferDto cDto = offers.get(2);
        assertEquals("Seller C", cDto.sellerName());
        assertFalse(cDto.isLowestPrice());
    }

    @Test
    @DisplayName("Should return empty list cleanly when product has no eligible offers")
    void shouldHandleZeroOffersGracefully() {
        when(productRepository.existsById(9L)).thenReturn(true);
        when(sellerListingRepository.findBuyerVisibleOffers(eq(9L), any(Sort.class)))
            .thenReturn(Collections.emptyList());

        List<SellerOfferDto> offers = offerService.getOffersForProduct(9L, "price_asc");

        assertNotNull(offers);
        assertTrue(offers.isEmpty());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product does not exist")
    void shouldThrowWhenProductNotFound() {
        when(productRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () ->
            offerService.getOffersForProduct(999L, "price_asc")
        );
    }
}
