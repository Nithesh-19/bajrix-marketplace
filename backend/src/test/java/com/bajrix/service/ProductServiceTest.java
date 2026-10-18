package com.bajrix.service;

import com.bajrix.dto.common.PagedResponse;
import com.bajrix.dto.product.CategoryCountDto;
import com.bajrix.dto.product.ProductDetailDto;
import com.bajrix.dto.product.ProductSummaryDto;
import com.bajrix.entity.Product;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SellerListingRepository sellerListingRepository;

    @InjectMocks
    private ProductService productService;

    private Product product1;
    private Product product2;

    @BeforeEach
    void setUp() {
        product1 = new Product(1L, "UltraTech PPC Cement 50 kg", "High strength cement", "Cement", "50 kg bag", "http://img1.jpg");
        product2 = new Product(2L, "Tata Tiscon 550D TMT Rebar (12mm)", "Ductile rebars", "Steel & TMT", "tonne", "http://img2.jpg");
    }

    @Test
    @DisplayName("Should return paginated products with aggregated offer statistics")
    void shouldReturnProductsWithAggregatedStats() {
        when(productRepository.searchProducts(eq("Cement"), isNull(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(product1)));

        // Mock batch aggregated stats: [productId, minPrice, maxPrice, count, totalStock]
        Object[] statsRow = new Object[]{1L, new BigDecimal("385.00"), new BigDecimal("405.00"), 3L, 1700L};
        when(sellerListingRepository.getOfferStatsForProductIds(List.of(1L)))
            .thenReturn(Collections.singletonList(statsRow));

        PagedResponse<ProductSummaryDto> response = productService.getProducts("Cement", null, 0, 10, "id_asc");

        assertNotNull(response);
        assertEquals(1, response.content().size());

        ProductSummaryDto dto = response.content().get(0);
        assertEquals(1L, dto.id());
        assertEquals("UltraTech PPC Cement 50 kg", dto.name());
        assertEquals(new BigDecimal("385.00"), dto.minPrice());
        assertEquals(new BigDecimal("405.00"), dto.maxPrice());
        assertEquals(3, dto.availableOffersCount());
        assertEquals(1700, dto.totalStock());
        assertTrue(dto.hasOffers());
    }

    @Test
    @DisplayName("Should retrieve product details with live offer statistics")
    void shouldReturnProductDetail() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        Object[] statsRow = new Object[]{1L, new BigDecimal("385.00"), new BigDecimal("405.00"), 3L, 1700L};
        when(sellerListingRepository.getOfferStatsForProductId(1L))
            .thenReturn(Collections.singletonList(statsRow));

        ProductDetailDto detail = productService.getProductById(1L);

        assertNotNull(detail);
        assertEquals("UltraTech PPC Cement 50 kg", detail.name());
        assertEquals(new BigDecimal("385.00"), detail.minPrice());
        assertEquals(3, detail.availableOffersCount());
    }

    @Test
    @DisplayName("Should return distinct categories with product counts")
    void shouldReturnCategoriesWithCounts() {
        Object[] row1 = new Object[]{"Cement", 2L};
        Object[] row2 = new Object[]{"Steel & TMT", 1L};
        when(productRepository.countProductsByCategory()).thenReturn(List.of(row1, row2));

        List<CategoryCountDto> categories = productService.getCategories();

        assertEquals(2, categories.size());
        assertEquals("Cement", categories.get(0).name());
        assertEquals(2L, categories.get(0).productCount());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product does not exist")
    void shouldThrowWhenProductMissing() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
            productService.getProductById(999L)
        );
    }
}
