package com.omprakashgautam.homelab.ledger.controller;

import com.omprakashgautam.homelab.ledger.dto.request.InsurancePolicyRequest;
import com.omprakashgautam.homelab.ledger.dto.response.InsurancePolicyResponse;
import com.omprakashgautam.homelab.ledger.security.UserDetailsImpl;
import com.omprakashgautam.homelab.ledger.service.InsurancePolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/insurance")
@RequiredArgsConstructor
public class InsurancePolicyController {

    private final InsurancePolicyService insurancePolicyService;

    @GetMapping
    public ResponseEntity<List<InsurancePolicyResponse>> list(@AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(insurancePolicyService.findAll(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsurancePolicyResponse> get(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(insurancePolicyService.findById(id, principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<InsurancePolicyResponse> create(@Valid @RequestBody InsurancePolicyRequest request,
                                                          @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(insurancePolicyService.create(request, principal.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsurancePolicyResponse> update(@PathVariable UUID id, @Valid @RequestBody InsurancePolicyRequest request,
                                                          @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(insurancePolicyService.update(id, request, principal.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        insurancePolicyService.delete(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
