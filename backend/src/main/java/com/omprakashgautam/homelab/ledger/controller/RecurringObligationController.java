package com.omprakashgautam.homelab.ledger.controller;

import com.omprakashgautam.homelab.ledger.dto.request.RecurringObligationRequest;
import com.omprakashgautam.homelab.ledger.dto.response.RecurringObligationResponse;
import com.omprakashgautam.homelab.ledger.security.UserDetailsImpl;
import com.omprakashgautam.homelab.ledger.service.RecurringObligationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
public class RecurringObligationController {

    private final RecurringObligationService recurringObligationService;

    @GetMapping
    public ResponseEntity<List<RecurringObligationResponse>> list(@AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(recurringObligationService.findAll(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecurringObligationResponse> get(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(recurringObligationService.findById(id, principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<RecurringObligationResponse> create(@Valid @RequestBody RecurringObligationRequest request,
                                                              @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(recurringObligationService.create(request, principal.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringObligationResponse> update(@PathVariable UUID id, @Valid @RequestBody RecurringObligationRequest request,
                                                              @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(recurringObligationService.update(id, request, principal.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        recurringObligationService.delete(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
