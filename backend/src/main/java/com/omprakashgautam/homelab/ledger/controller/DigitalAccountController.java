package com.omprakashgautam.homelab.ledger.controller;

import com.omprakashgautam.homelab.ledger.dto.request.DigitalAccountRequest;
import com.omprakashgautam.homelab.ledger.dto.response.DigitalAccountResponse;
import com.omprakashgautam.homelab.ledger.security.UserDetailsImpl;
import com.omprakashgautam.homelab.ledger.service.DigitalAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/digital-accounts")
@RequiredArgsConstructor
public class DigitalAccountController {

    private final DigitalAccountService digitalAccountService;

    @GetMapping
    public ResponseEntity<List<DigitalAccountResponse>> list(@AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(digitalAccountService.findAll(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DigitalAccountResponse> get(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(digitalAccountService.findById(id, principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<DigitalAccountResponse> create(@Valid @RequestBody DigitalAccountRequest request,
                                                         @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(digitalAccountService.create(request, principal.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DigitalAccountResponse> update(@PathVariable UUID id, @Valid @RequestBody DigitalAccountRequest request,
                                                         @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(digitalAccountService.update(id, request, principal.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        digitalAccountService.delete(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
