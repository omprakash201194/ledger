package com.omprakashgautam.homelab.ledger.controller;

import com.omprakashgautam.homelab.ledger.dto.request.LiabilityRequest;
import com.omprakashgautam.homelab.ledger.dto.response.LiabilityResponse;
import com.omprakashgautam.homelab.ledger.security.UserDetailsImpl;
import com.omprakashgautam.homelab.ledger.service.LiabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/liabilities")
@RequiredArgsConstructor
public class LiabilityController {

    private final LiabilityService liabilityService;

    @GetMapping
    public ResponseEntity<List<LiabilityResponse>> list(@AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(liabilityService.findAll(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LiabilityResponse> get(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(liabilityService.findById(id, principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<LiabilityResponse> create(@Valid @RequestBody LiabilityRequest request,
                                                    @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(liabilityService.create(request, principal.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LiabilityResponse> update(@PathVariable UUID id, @Valid @RequestBody LiabilityRequest request,
                                                    @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(liabilityService.update(id, request, principal.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        liabilityService.delete(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
