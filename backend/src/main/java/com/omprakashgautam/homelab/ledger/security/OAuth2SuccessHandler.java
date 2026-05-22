package com.omprakashgautam.homelab.ledger.security;

import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.oauth2.frontend-redirect-url}")
    private String frontendRedirectUrl;

    @Value("${app.oauth2.mobile-redirect-url}")
    private String mobileRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found after OAuth2 login: " + email));

        String token = jwtTokenProvider.generateTokenForUser(user);
        log.info("OAuth2 login successful for user: {}", email);

        // reason: mobile app sets a short-lived cookie on the OAuth2 initiation request
        // so we can redirect to the app deep link instead of the web frontend
        boolean isMobile = isMobileRequest(request, response);

        String baseRedirect = isMobile ? mobileRedirectUrl : frontendRedirectUrl;
        String redirectUrl = baseRedirect
                + "?token=" + token
                + "&userId=" + user.getId()
                + "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8)
                + "&name=" + URLEncoder.encode(user.getName() != null ? user.getName() : "", StandardCharsets.UTF_8);

        log.info("Redirecting OAuth2 success to {} destination", isMobile ? "mobile" : "web");
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private boolean isMobileRequest(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            log.info("OAuth2SuccessHandler: no cookies present on callback request");
            return false;
        }

        log.info("OAuth2SuccessHandler: cookies present = {}",
                Arrays.stream(cookies).map(Cookie::getName).toList());

        return Arrays.stream(cookies)
                .filter(c -> MobileOAuth2DetectionFilter.MOBILE_COOKIE_NAME.equals(c.getName()))
                .anyMatch(c -> "true".equals(c.getValue()));
    }
}
