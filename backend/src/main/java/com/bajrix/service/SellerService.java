package com.bajrix.service;

import com.bajrix.dto.seller.SellerDto;
import com.bajrix.entity.Seller;
import com.bajrix.exception.ResourceNotFoundException;
import com.bajrix.repository.SellerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SellerService {

    private final SellerRepository sellerRepository;

    public SellerService(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    public List<SellerDto> getAllSellers() {
        return sellerRepository.findAllByOrderByRatingDesc().stream()
            .map(this::toDto)
            .toList();
    }

    public SellerDto getSellerById(Long id) {
        Seller seller = getSellerEntity(id);
        return toDto(seller);
    }

    public Seller getSellerEntity(Long id) {
        return sellerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Seller not found with ID: " + id));
    }

    private SellerDto toDto(Seller s) {
        return new SellerDto(
            s.getId(),
            s.getName(),
            s.getEmail(),
            s.getPhone(),
            s.getLocation(),
            s.getSellerStatus(),
            s.getRating()
        );
    }
}
