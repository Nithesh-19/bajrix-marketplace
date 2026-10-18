package com.bajrix.repository;

import com.bajrix.entity.SellerListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerListingRepository extends JpaRepository<SellerListing, Long> {

    @Query("SELECT sl FROM SellerListing sl " +
           "JOIN FETCH sl.seller s " +
           "JOIN FETCH sl.product p " +
           "WHERE sl.product.id = :productId " +
           "AND sl.active = true " +
           "AND s.sellerStatus = com.bajrix.entity.SellerStatus.APPROVED")
    List<SellerListing> findBuyerVisibleOffers(@Param("productId") Long productId, Sort sort);

    @Query("SELECT sl FROM SellerListing sl " +
           "JOIN FETCH sl.seller s " +
           "JOIN FETCH sl.product p " +
           "WHERE sl.product.id = :productId " +
           "AND sl.active = true " +
           "AND s.sellerStatus = com.bajrix.entity.SellerStatus.APPROVED " +
           "ORDER BY sl.price ASC")
    List<SellerListing> findBuyerVisibleOffersDefault(@Param("productId") Long productId);

    @Query("SELECT sl.product.id, MIN(sl.price), MAX(sl.price), COUNT(sl.id), SUM(sl.availableStock) " +
           "FROM SellerListing sl " +
           "WHERE sl.product.id IN :productIds " +
           "AND sl.active = true " +
           "AND sl.seller.sellerStatus = com.bajrix.entity.SellerStatus.APPROVED " +
           "GROUP BY sl.product.id")
    List<Object[]> getOfferStatsForProductIds(@Param("productIds") List<Long> productIds);

    @Query("SELECT sl.product.id, MIN(sl.price), MAX(sl.price), COUNT(sl.id), SUM(sl.availableStock) " +
           "FROM SellerListing sl " +
           "WHERE sl.product.id = :productId " +
           "AND sl.active = true " +
           "AND sl.seller.sellerStatus = com.bajrix.entity.SellerStatus.APPROVED " +
           "GROUP BY sl.product.id")
    List<Object[]> getOfferStatsForProductId(@Param("productId") Long productId);

    @Query("SELECT sl FROM SellerListing sl " +
           "JOIN FETCH sl.product p " +
           "JOIN FETCH sl.seller s " +
           "WHERE s.id = :sellerId " +
           "AND (:active IS NULL OR sl.active = :active) " +
           "AND (:query IS NULL OR :query = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<SellerListing> findBySellerIdFiltered(@Param("sellerId") Long sellerId,
                                              @Param("active") Boolean active,
                                              @Param("query") String query,
                                              Pageable pageable);

    @Query("SELECT sl FROM SellerListing sl " +
           "JOIN FETCH sl.product p " +
           "JOIN FETCH sl.seller s " +
           "WHERE sl.id = :id")
    Optional<SellerListing> findByIdWithDetails(@Param("id") Long id);

    boolean existsBySellerIdAndProductId(Long sellerId, Long productId);

    Optional<SellerListing> findBySellerIdAndProductId(Long sellerId, Long productId);

    long countBySellerId(Long sellerId);

    long countBySellerIdAndActiveTrue(Long sellerId);

    @Query("SELECT COUNT(sl) FROM SellerListing sl WHERE sl.seller.id = :sellerId AND sl.availableStock <= sl.minOrderQuantity")
    long countLowStockBySellerId(@Param("sellerId") Long sellerId);
}
