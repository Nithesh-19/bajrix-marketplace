package com.bajrix.controller;

import com.bajrix.dto.common.PagedResponse;
import com.bajrix.dto.product.CategoryCountDto;
import com.bajrix.dto.product.ProductDetailDto;
import com.bajrix.dto.product.ProductSummaryDto;
import com.bajrix.exception.GlobalExceptionHandler;
import com.bajrix.exception.ResourceNotFoundException;
import com.bajrix.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import(GlobalExceptionHandler.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Test
    @DisplayName("GET /api/products - Should return paginated products")
    void shouldReturnPaginatedProducts() throws Exception {
        ProductSummaryDto p = new ProductSummaryDto(
            1L, "UltraTech PPC Cement 50 kg", "Desc", "Cement", "50 kg bag",
            "http://img.com", new BigDecimal("385.00"), new BigDecimal("405.00"), 3, 1700, true
        );
        PagedResponse<ProductSummaryDto> paged = PagedResponse.of(List.of(p), new PageImpl<>(List.of(p), PageRequest.of(0, 10), 1));

        when(productService.getProducts(any(), any(), anyInt(), anyInt(), anyString())).thenReturn(paged);

        mockMvc.perform(get("/api/products")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].name").value("UltraTech PPC Cement 50 kg"))
            .andExpect(jsonPath("$.data.content[0].minPrice").value(385.00))
            .andExpect(jsonPath("$.data.content[0].availableOffersCount").value(3));
    }

    @Test
    @DisplayName("GET /api/products/{id} - Should return product details")
    void shouldReturnProductDetail() throws Exception {
        ProductDetailDto detail = new ProductDetailDto(
            1L, "UltraTech PPC Cement 50 kg", "Full description", "Cement", "50 kg bag",
            "http://img.com", new BigDecimal("385.00"), new BigDecimal("405.00"), 3, 1700, true,
            OffsetDateTime.now(), OffsetDateTime.now()
        );

        when(productService.getProductById(1L)).thenReturn(detail);

        mockMvc.perform(get("/api/products/1")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.name").value("UltraTech PPC Cement 50 kg"))
            .andExpect(jsonPath("$.data.category").value("Cement"));
    }

    @Test
    @DisplayName("GET /api/products/{id} - Should return 404 when product is not found")
    void shouldReturn404WhenNotFound() throws Exception {
        when(productService.getProductById(999L)).thenThrow(new ResourceNotFoundException("Product not found with ID: 999"));

        mockMvc.perform(get("/api/products/999")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value(404))
            .andExpect(jsonPath("$.message").value("Product not found with ID: 999"));
    }

    @Test
    @DisplayName("GET /api/categories - Should return categories with counts")
    void shouldReturnCategories() throws Exception {
        when(productService.getCategories()).thenReturn(List.of(
            new CategoryCountDto("Cement", 2),
            new CategoryCountDto("Steel & TMT", 1)
        ));

        mockMvc.perform(get("/api/categories")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].name").value("Cement"))
            .andExpect(jsonPath("$.data[0].productCount").value(2));
    }
}
