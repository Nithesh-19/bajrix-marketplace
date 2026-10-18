package com.bajrix.controller;

import com.bajrix.entity.Seller;
import com.bajrix.entity.SellerStatus;
import com.bajrix.exception.GlobalExceptionHandler;
import com.bajrix.repository.SellerRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SellerRepository sellerRepository;

    @Test
    @DisplayName("POST /api/auth/login - Should authenticate existing seller")
    void shouldAuthenticateSeller() throws Exception {
        Seller seller = new Seller(
            1L, "Apex Building Supplies", "contact@apexsupplies.com",
            "+91 98201 12345", "Navi Mumbai, MH", SellerStatus.APPROVED, new BigDecimal("4.80")
        );

        when(sellerRepository.findByEmail("contact@apexsupplies.com")).thenReturn(Optional.of(seller));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "email": "contact@apexsupplies.com",
                        "password": "anyPassword"
                    }
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.role").value("SELLER"))
            .andExpect(jsonPath("$.data.sellerId").value(1))
            .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }

    @Test
    @DisplayName("POST /api/auth/login - Should authenticate buyer")
    void shouldAuthenticateBuyer() throws Exception {
        when(sellerRepository.findByEmail("buyer@bajrix.com")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "email": "buyer@bajrix.com",
                        "password": "anyPassword"
                    }
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.role").value("BUYER"))
            .andExpect(jsonPath("$.data.name").value("Priya Sharma (Larsen Infra)"));
    }
}
