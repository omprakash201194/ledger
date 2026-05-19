package com.omprakashgautam.homelab.ledger.controller;

import com.omprakashgautam.homelab.ledger.dto.request.TrustedPersonRequest;
import com.omprakashgautam.homelab.ledger.dto.response.TrustedPersonResponse;
import com.omprakashgautam.homelab.ledger.security.UserDetailsImpl;
import com.omprakashgautam.homelab.ledger.service.TrustedPersonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trusted-persons")
@RequiredArgsConstructor
public class TrustedPersonController {

    private final TrustedPersonService trustedPersonService;

    @GetMapping
    public ResponseEntity<List<TrustedPersonResponse>> list(@AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(trustedPersonService.findAll(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrustedPersonResponse> get(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(trustedPersonService.findById(id, principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<TrustedPersonResponse> create(@Valid @RequestBody TrustedPersonRequest request,
                                                        @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(trustedPersonService.create(request, principal.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrustedPersonResponse> update(@PathVariable UUID id, @Valid @RequestBody TrustedPersonRequest request,
                                                        @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(trustedPersonService.update(id, request, principal.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        trustedPersonService.delete(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
