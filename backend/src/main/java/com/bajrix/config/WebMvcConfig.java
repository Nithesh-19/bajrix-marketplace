package com.bajrix.config;

import com.bajrix.security.SellerIdentityResolver;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final SellerIdentityResolver sellerIdentityResolver;

    public WebMvcConfig(SellerIdentityResolver sellerIdentityResolver) {
        this.sellerIdentityResolver = sellerIdentityResolver;
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(sellerIdentityResolver);
    }
}
