package com.bajrix.service;

import com.bajrix.dto.order.*;
import com.bajrix.entity.Order;
import com.bajrix.entity.OrderItem;
import com.bajrix.entity.OrderStatus;
import com.bajrix.entity.SellerListing;
import com.bajrix.exception.InvalidListingOperationException;
import com.bajrix.exception.ResourceNotFoundException;
import com.bajrix.repository.OrderRepository;
import com.bajrix.repository.SellerListingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final SellerListingRepository listingRepository;

    public OrderService(OrderRepository orderRepository, SellerListingRepository listingRepository) {
        this.orderRepository = orderRepository;
        this.listingRepository = listingRepository;
    }

    public OrderDto createOrder(CreateOrderRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new InvalidListingOperationException("Order must contain at least one item.");
        }

        String orderNumber = generateOrderNumber();

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setBuyerName(request.buyerName());
        order.setBuyerPhone(request.buyerPhone());
        order.setBuyerEmail(request.buyerEmail());
        order.setProjectSiteName(request.projectSiteName());
        order.setDeliveryAddress(request.deliveryAddress());
        order.setCity(request.city());
        order.setState(request.state());
        order.setPincode(request.pincode());
        order.setSiteUnloadingNotes(request.siteUnloadingNotes());
        order.setPaymentMethod(request.paymentMethod());
        order.setOrderStatus(OrderStatus.CONFIRMED);

        BigDecimal totalMaterial = BigDecimal.ZERO;
        Set<Long> uniqueSellers = new HashSet<>();

        for (OrderItemRequest itemReq : request.items()) {
            SellerListing listing = listingRepository.findByIdWithDetails(itemReq.listingId())
                .orElseThrow(() -> new ResourceNotFoundException("Material listing not found with ID: " + itemReq.listingId()));

            // Validate listing is active
            if (!Boolean.TRUE.equals(listing.getActive())) {
                throw new InvalidListingOperationException("Listing for '" + listing.getProduct().getName() + "' is currently inactive.");
            }

            // Validate seller is approved
            if (!listing.getSeller().isApproved()) {
                throw new InvalidListingOperationException("Seller '" + listing.getSeller().getName() + "' is not approved to fulfill buyer orders.");
            }

            // Validate MOQ
            if (itemReq.quantity() < listing.getMinOrderQuantity()) {
                throw new InvalidListingOperationException(
                    "Order quantity (" + itemReq.quantity() + ") for '" + listing.getProduct().getName() +
                    "' is below the minimum order quantity of " + listing.getMinOrderQuantity() + " " + listing.getProduct().getUnit() + "s."
                );
            }

            // Validate Available Stock
            if (listing.getAvailableStock() < itemReq.quantity()) {
                throw new InvalidListingOperationException(
                    "Insufficient inventory for '" + listing.getProduct().getName() +
                    "'. On-hand stock is " + listing.getAvailableStock() + ", but requested quantity is " + itemReq.quantity() + "."
                );
            }

            // Deduct real warehouse inventory atomically
            listing.setAvailableStock(listing.getAvailableStock() - itemReq.quantity());
            listingRepository.save(listing);

            BigDecimal lineTotal = listing.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));
            totalMaterial = totalMaterial.add(lineTotal);
            uniqueSellers.add(listing.getSeller().getId());

            OrderItem orderItem = new OrderItem(
                order,
                listing,
                listing.getSeller(),
                listing.getProduct(),
                listing.getProduct().getName(),
                listing.getProduct().getUnit(),
                listing.getSeller().getName(),
                listing.getPrice(),
                itemReq.quantity(),
                lineTotal
            );
            order.addItem(orderItem);
        }

        // B2B Freight Logistics Calculation: Flat ₹500 per supplier dispatch, free freight on orders > ₹50,000
        BigDecimal freight = totalMaterial.compareTo(new BigDecimal("50000")) >= 0
            ? BigDecimal.ZERO
            : BigDecimal.valueOf(uniqueSellers.size() * 500L);

        // Standard 18% GST for construction & building materials
        BigDecimal tax = totalMaterial.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = totalMaterial.add(freight).add(tax);

        order.setTotalMaterialAmount(totalMaterial);
        order.setFreightAmount(freight);
        order.setTaxAmount(tax);
        order.setTotalAmount(grandTotal);

        Order saved = orderRepository.save(order);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumberWithItems(orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found: " + orderNumber));
        return toDto(order);
    }

    private String generateOrderNumber() {
        int year = LocalDate.now().getYear();
        int randomDigits = ThreadLocalRandom.current().nextInt(10000, 99999);
        return "BJX-PO-" + year + "-" + randomDigits;
    }

    private OrderDto toDto(Order o) {
        List<OrderItemDto> items = o.getItems().stream()
            .map(i -> new OrderItemDto(
                i.getId(),
                i.getListing() != null ? i.getListing().getId() : null,
                i.getSeller().getId(),
                i.getSellerName(),
                i.getProduct().getId(),
                i.getProductName(),
                i.getProductUnit(),
                i.getUnitPrice(),
                i.getQuantity(),
                i.getTotalPrice()
            ))
            .toList();

        return new OrderDto(
            o.getId(),
            o.getOrderNumber(),
            o.getBuyerName(),
            o.getBuyerPhone(),
            o.getBuyerEmail(),
            o.getProjectSiteName(),
            o.getDeliveryAddress(),
            o.getCity(),
            o.getState(),
            o.getPincode(),
            o.getSiteUnloadingNotes(),
            o.getPaymentMethod(),
            o.getTotalMaterialAmount(),
            o.getFreightAmount(),
            o.getTaxAmount(),
            o.getTotalAmount(),
            o.getOrderStatus(),
            o.getCreatedAt(),
            items
        );
    }
}
