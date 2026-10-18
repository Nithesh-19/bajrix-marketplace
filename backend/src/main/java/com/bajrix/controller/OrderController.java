package com.bajrix.controller;

import com.bajrix.dto.common.ApiResponse;
import com.bajrix.dto.order.CreateOrderRequest;
import com.bajrix.dto.order.OrderDto;
import com.bajrix.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderDto order = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Purchase Order generated successfully", order));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderByOrderNumber(@PathVariable String orderNumber) {
        OrderDto order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.ok(order));
    }
}
