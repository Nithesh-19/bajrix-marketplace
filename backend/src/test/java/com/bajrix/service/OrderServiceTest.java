package com.bajrix.service;

import com.bajrix.dto.order.CreateOrderRequest;
import com.bajrix.dto.order.OrderDto;
import com.bajrix.dto.order.OrderItemRequest;
import com.bajrix.entity.*;
import com.bajrix.exception.InvalidListingOperationException;
import com.bajrix.repository.OrderRepository;
import com.bajrix.repository.SellerListingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private SellerListingRepository listingRepository;

    @InjectMocks
    private OrderService orderService;

    private Seller approvedSeller;
    private Seller pendingSeller;
    private Product product;
    private SellerListing activeListing;

    @BeforeEach
    void setUp() {
        approvedSeller = new Seller(1L, "Apex Supplies", "apex@test.com", "123456", "Mumbai", SellerStatus.APPROVED, new BigDecimal("4.80"));
        pendingSeller = new Seller(4L, "NovaTech", "nova@test.com", "999888", "Gujarat", SellerStatus.PENDING, new BigDecimal("4.20"));
        product = new Product(1L, "UltraTech PPC Cement 50 kg", "Cement", "Cement", "50 kg bag", "http://img.com");
        activeListing = new SellerListing(10L, approvedSeller, product, new BigDecimal("390.00"), 500, 50, true);
    }

    @Test
    @DisplayName("Should successfully place order and atomically deduct listing inventory")
    void shouldPlaceOrderAndDeductStock() {
        OrderItemRequest item = new OrderItemRequest(10L, 100);
        CreateOrderRequest request = new CreateOrderRequest(
            "Acme Infra Developers", "+91 98200 11223", "procurement@acmeinfra.com",
            "Project Skyrise Tower C", "Plot 42, Sector 18, Navi Mumbai", "Navi Mumbai", "Maharashtra", "400705",
            "10-wheel tipper access available", "BANK_TRANSFER",
            List.of(item)
        );

        when(listingRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(activeListing));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            return o;
        });

        OrderDto orderDto = orderService.createOrder(request);

        assertNotNull(orderDto);
        assertEquals("Acme Infra Developers", orderDto.buyerName());
        assertEquals(new BigDecimal("39000.00"), orderDto.totalMaterialAmount()); // 100 * 390
        assertEquals(400, activeListing.getAvailableStock()); // Stock deducted from 500 -> 400!
        verify(listingRepository).save(activeListing);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("Should reject order when quantity is below seller MOQ")
    void shouldRejectWhenBelowMoq() {
        // Order 20 bags when MOQ is 50
        OrderItemRequest item = new OrderItemRequest(10L, 20);
        CreateOrderRequest request = new CreateOrderRequest(
            "Acme Infra", "+91 98200 11223", "buyer@test.com", null,
            "Site 1", "Mumbai", "MH", "400001", null, "UPI",
            List.of(item)
        );

        when(listingRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(activeListing));

        InvalidListingOperationException ex = assertThrows(InvalidListingOperationException.class, () ->
            orderService.createOrder(request)
        );

        assertTrue(ex.getMessage().contains("below the minimum order quantity"));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should reject order when requested quantity exceeds available stock")
    void shouldRejectWhenInsufficientStock() {
        // Order 600 bags when stock is 500
        OrderItemRequest item = new OrderItemRequest(10L, 600);
        CreateOrderRequest request = new CreateOrderRequest(
            "Acme Infra", "+91 98200 11223", "buyer@test.com", null,
            "Site 1", "Mumbai", "MH", "400001", null, "UPI",
            List.of(item)
        );

        when(listingRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(activeListing));

        InvalidListingOperationException ex = assertThrows(InvalidListingOperationException.class, () ->
            orderService.createOrder(request)
        );

        assertTrue(ex.getMessage().contains("Insufficient inventory"));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should reject order if seller account is not approved")
    void shouldRejectWhenSellerNotApproved() {
        SellerListing unapprovedListing = new SellerListing(20L, pendingSeller, product, new BigDecimal("380.00"), 500, 50, true);
        OrderItemRequest item = new OrderItemRequest(20L, 100);
        CreateOrderRequest request = new CreateOrderRequest(
            "Acme Infra", "+91 98200 11223", "buyer@test.com", null,
            "Site 1", "Mumbai", "MH", "400001", null, "UPI",
            List.of(item)
        );

        when(listingRepository.findByIdWithDetails(20L)).thenReturn(Optional.of(unapprovedListing));

        InvalidListingOperationException ex = assertThrows(InvalidListingOperationException.class, () ->
            orderService.createOrder(request)
        );

        assertTrue(ex.getMessage().contains("not approved to fulfill buyer orders"));
    }
}
