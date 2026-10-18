package com.bajrix.controller;

import com.bajrix.dto.common.ApiResponse;
import com.bajrix.dto.common.PagedResponse;
import com.bajrix.dto.product.CategoryCountDto;
import com.bajrix.dto.product.ProductDetailDto;
import com.bajrix.dto.product.ProductSummaryDto;
import com.bajrix.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PagedResponse<ProductSummaryDto>>> getProducts(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String query,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(defaultValue = "id_asc") String sort
    ) {
        PagedResponse<ProductSummaryDto> response = productService.getProducts(category, query, page, size, sort);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> getProductById(@PathVariable Long id) {
        ProductDetailDto dto = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryCountDto>>> getCategories() {
        List<CategoryCountDto> categories = productService.getCategories();
        return ResponseEntity.ok(ApiResponse.ok(categories));
    }
}
