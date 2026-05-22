package com.omprakashgautam.homelab.ledger.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Detects OAuth2 requests originating from the mobile app (identified by ?platform=mobile)
 * and sets a short-lived cookie so OAuth2SuccessHandler can redirect to the app's deep link
 * scheme (ledger://oauth2) instead of the web frontend URL.
 *
 * NOTE: path must include the /api prefix — SecurityConfig sets
 * authorizationEndpoint baseUri to /api/oauth2/authorization.
 * SameSite=None; Secure is required so the cookie survives the cross-site
 * redirect from Google back to Spring (Lax blocks it on cross-site POSTs/redirects).
 */
@Slf4j
public class MobileOAuth2DetectionFilter extends OncePerRequestFilter {

    static final String MOBILE_COOKIE_NAME = "ledger_mobile_oauth";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String platform = request.getParameter("platform");

        // reason: path includes /api prefix because SecurityConfig sets baseUri("/api/oauth2/authorization")
        if (path.startsWith("/api/oauth2/authorization/") && "mobile".equals(platform)) {
            log.info("Mobile OAuth2 initiation detected — setting mobile callback cookie");

            Cookie cookie = new Cookie(MOBILE_COOKIE_NAME, "true");
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            cookie.setMaxAge(300); // 5 minutes — enough for OAuth2 round-trip
            cookie.setSecure(true);
            // reason: SameSite=None required so the cookie is sent when Google
            // redirects back to our domain (a cross-site top-level navigation).
            // Without it browsers default to Lax which drops the cookie.
            response.addHeader("Set-Cookie",
                    MOBILE_COOKIE_NAME + "=true; Path=/; Max-Age=300; HttpOnly; Secure; SameSite=None");
        }

        filterChain.doFilter(request, response);
    }
}
