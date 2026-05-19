package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.auth.AuthResponse;
import com.omprakashgautam.homelab.ledger.dto.auth.LoginRequest;
import com.omprakashgautam.homelab.ledger.dto.auth.RegisterRequest;
import com.omprakashgautam.homelab.ledger.model.Provider;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.UserRepository;
import com.omprakashgautam.homelab.ledger.security.JwtTokenProvider;
import com.omprakashgautam.homelab.ledger.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = userRepository.save(User.builder()
                .email(req.getEmail())
                .name(req.getName())
                .provider(Provider.LOCAL)
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .build());

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        String token = jwtTokenProvider.generateToken(auth);
        return toResponse(token, user);
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        String token = jwtTokenProvider.generateToken(auth);
        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        return toResponse(token, user);
    }

    private AuthResponse toResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }
}
