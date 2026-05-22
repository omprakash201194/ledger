package com.omprakashgautam.homelab.ledger.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Detects OAuth2 requests originating from the mobile app (identified by ?platform=mobile)
 * and sets a short-lived cookie so OAuth2SuccessHandler can redirect to the app's deep link
 * scheme (ledger://oauth2) instead of the web frontend URL.
 */
public class MobileOAuth2DetectionFilter extends OncePerRequestFilter {

    static final String MOBILE_COOKIE_NAME = "ledger_mobile_oauth";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String platform = request.getParameter("platform");

        // Only act on the OAuth2 authorization initiation endpoint
        if (path.startsWith("/oauth2/authorization/") && "mobile".equals(platform)) {
            Cookie cookie = new Cookie(MOBILE_COOKIE_NAME, "true");
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            cookie.setMaxAge(300); // 5 minutes — long enough to complete OAuth2 round-trip
            cookie.setSecure(true);
            response.addCookie(cookie);
        }

        filterChain.doFilter(request, response);
    }
}
