package com.omprakashgautam.homelab.ledger.security;

import com.omprakashgautam.homelab.ledger.model.Provider;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Creating new user via Google OAuth2: email={}", email);
            return userRepository.save(User.builder()
                    .email(email)
                    .name(name != null && !name.isBlank() ? name : email)
                    .provider(Provider.GOOGLE)
                    .passwordHash(null)
                    .build());
        });

        return oauth2User;
    }
}
