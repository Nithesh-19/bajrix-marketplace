package com.bajrix.repository;

import com.bajrix.entity.Seller;
import com.bajrix.entity.SellerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {

    Optional<Seller> findByEmail(String email);

    List<Seller> findAllBySellerStatus(SellerStatus status);

    List<Seller> findAllByOrderByRatingDesc();
}
