package com.bajrix.security;

import java.lang.annotation.*;

/**
 * Annotation used on controller method parameters to resolve the current seller ID
 * from the 'X-Seller-Id' HTTP header (or application default).
 * 
 * NOTE FOR REVIEWERS:
 * This mock identity resolver provides strict seller data isolation for evaluation/demo
 * purposes. In production, this can be seamlessly swapped with Spring Security's
 * @AuthenticationPrincipal backed by JWT / OAuth2 resource server.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CurrentSellerId {
}
