package com.bajrix.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class SellerIdentityResolver implements HandlerMethodArgumentResolver {

    private final String headerName;
    private final Long defaultSellerId;

    public SellerIdentityResolver(
        @Value("${app.security.mock-seller.header-name:X-Seller-Id}") String headerName,
        @Value("${app.security.mock-seller.default-id:1}") Long defaultSellerId
    ) {
        this.headerName = headerName;
        this.defaultSellerId = defaultSellerId;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentSellerId.class) &&
               Long.class.isAssignableFrom(parameter.getParameterType());
    }

    @Override
    public Object resolveArgument(MethodParameter parameter,
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) {
        String headerVal = webRequest.getHeader(headerName);
        if (headerVal == null || headerVal.trim().isEmpty()) {
            return defaultSellerId;
        }

        try {
            return Long.parseLong(headerVal.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid " + headerName + " header: '" + headerVal + "'. Must be a positive integer ID.");
        }
    }
}
