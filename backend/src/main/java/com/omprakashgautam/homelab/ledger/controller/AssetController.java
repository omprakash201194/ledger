package com.omprakashgautam.homelab.ledger.controller;

import com.omprakashgautam.homelab.ledger.dto.request.AssetRequest;
import com.omprakashgautam.homelab.ledger.model.Asset;
import com.omprakashgautam.homelab.ledger.security.UserDetailsImpl;
import com.omprakashgautam.homelab.ledger.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public ResponseEntity<List<Asset>> list(@AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(assetService.findAll(principal.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> get(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(assetService.findById(id, principal.getUsername()));
    }

    @PostMapping
    public ResponseEntity<Asset> create(@Valid @RequestBody AssetRequest request,
                                            @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(assetService.create(request, principal.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> update(@PathVariable UUID id, @Valid @RequestBody AssetRequest request,
                                             @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(assetService.update(id, request, principal.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal UserDetailsImpl principal) {
        assetService.delete(id, principal.getUsername());
        return ResponseEntity.noContent().build();
    }
}
