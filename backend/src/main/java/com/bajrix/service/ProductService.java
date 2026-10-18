package com.bajrix.service;

import com.bajrix.dto.common.PagedResponse;
import com.bajrix.dto.product.CategoryCountDto;
import com.bajrix.dto.product.ProductDetailDto;
import com.bajrix.dto.product.ProductSummaryDto;
import com.bajrix.entity.Product;
import com.bajrix.exception.ResourceNotFoundException;
import com.bajrix.repository.ProductRepository;
import com.bajrix.repository.SellerListingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final SellerListingRepository sellerListingRepository;

    public ProductService(ProductRepository productRepository, SellerListingRepository sellerListingRepository) {
        this.productRepository = productRepository;
        this.sellerListingRepository = sellerListingRepository;
    }

    public PagedResponse<ProductSummaryDto> getProducts(String category, String query, int page, int size, String sort) {
        // Enforce maximum page size limit
        int boundedSize = Math.min(Math.max(size, 1), 50);
        int boundedPage = Math.max(page, 0);

        Sort pageSort = resolveProductSort(sort);
        Pageable pageable = PageRequest.of(boundedPage, boundedSize, pageSort);

        String trimmedCategory = (category != null && !category.isBlank()) ? category.trim() : null;
        String trimmedQuery = (query != null && !query.isBlank()) ? query.trim() : null;

        Page<Product> productPage = productRepository.searchProducts(trimmedCategory, trimmedQuery, pageable);

        if (productPage.isEmpty()) {
            return PagedResponse.of(Collections.emptyList(), productPage);
        }

        List<Long> productIds = productPage.getContent().stream()
            .map(Product::getId)
            .toList();

        // Batch fetch aggregated offer statistics for current page (prevents N+1 queries)
        List<Object[]> statsList = sellerListingRepository.getOfferStatsForProductIds(productIds);
        Map<Long, OfferStats> statsMap = new HashMap<>();
        for (Object[] row : statsList) {
            Long pId = (Long) row[0];
            BigDecimal minP = (BigDecimal) row[1];
            BigDecimal maxP = (BigDecimal) row[2];
            long count = ((Number) row[3]).longValue();
            long totalStk = ((Number) row[4]).longValue();
            statsMap.put(pId, new OfferStats(minP, maxP, count, totalStk));
        }

        List<ProductSummaryDto> dtos = productPage.getContent().stream()
            .map(p -> {
                OfferStats stats = statsMap.getOrDefault(p.getId(), OfferStats.EMPTY);
                return new ProductSummaryDto(
                    p.getId(),
                    p.getName(),
                    p.getDescription(),
                    p.getCategory(),
                    p.getUnit(),
                    p.getImageUrl(),
                    stats.minPrice(),
                    stats.maxPrice(),
                    stats.offersCount(),
                    stats.totalStock(),
                    stats.offersCount() > 0
                );
            })
            .toList();

        // Optional in-memory price sort if client specifically sorts page by price
        if ("price_asc".equalsIgnoreCase(sort)) {
            dtos = new ArrayList<>(dtos);
            dtos.sort(Comparator.comparing(
                ProductSummaryDto::minPrice,
                Comparator.nullsLast(BigDecimal::compareTo)
            ));
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            dtos = new ArrayList<>(dtos);
            dtos.sort(Comparator.comparing(
                ProductSummaryDto::minPrice,
                Comparator.nullsLast(BigDecimal::compareTo)
            ).reversed());
        }

        return PagedResponse.of(dtos, productPage);
    }

    public ProductDetailDto getProductById(Long id) {
        Product p = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        List<Object[]> statsList = sellerListingRepository.getOfferStatsForProductId(id);
        OfferStats stats = OfferStats.EMPTY;
        if (!statsList.isEmpty()) {
            Object[] row = statsList.get(0);
            stats = new OfferStats(
                (BigDecimal) row[1],
                (BigDecimal) row[2],
                ((Number) row[3]).longValue(),
                ((Number) row[4]).longValue()
            );
        }

        return new ProductDetailDto(
            p.getId(),
            p.getName(),
            p.getDescription(),
            p.getCategory(),
            p.getUnit(),
            p.getImageUrl(),
            stats.minPrice(),
            stats.maxPrice(),
            stats.offersCount(),
            stats.totalStock(),
            stats.offersCount() > 0,
            p.getCreatedAt(),
            p.getUpdatedAt()
        );
    }

    public List<CategoryCountDto> getCategories() {
        return productRepository.countProductsByCategory().stream()
            .map(row -> new CategoryCountDto((String) row[0], ((Number) row[1]).longValue()))
            .toList();
    }

    private Sort resolveProductSort(String sort) {
        if ("name_desc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "name");
        } else if ("name_asc".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "name");
        } else if ("newest".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "id");
        }
        return Sort.by(Sort.Direction.ASC, "id");
    }

    private record OfferStats(BigDecimal minPrice, BigDecimal maxPrice, long offersCount, long totalStock) {
        static final OfferStats EMPTY = new OfferStats(null, null, 0, 0);
    }
}
