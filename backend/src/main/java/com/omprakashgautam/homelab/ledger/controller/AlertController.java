package com.omprakashgautam.homelab.ledger.controller;

import com.omprakashgautam.homelab.ledger.model.Alert;
import com.omprakashgautam.homelab.ledger.security.UserDetailsImpl;
import com.omprakashgautam.homelab.ledger.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<Alert>> list(@AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(alertService.findAll(principal.getUsername()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Alert> markRead(@PathVariable UUID id,
                                          @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(alertService.markRead(id, principal.getUsername()));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal UserDetailsImpl principal) {
        alertService.markAllRead(principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
