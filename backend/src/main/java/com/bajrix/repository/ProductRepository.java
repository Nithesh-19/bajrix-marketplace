package com.bajrix.repository;

import com.bajrix.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR :category = '' OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("category") String category,
                                 @Param("query") String query,
                                 Pageable pageable);

    @Query("SELECT p.category, COUNT(p.id) FROM Product p GROUP BY p.category ORDER BY p.category ASC")
    List<Object[]> countProductsByCategory();
}
