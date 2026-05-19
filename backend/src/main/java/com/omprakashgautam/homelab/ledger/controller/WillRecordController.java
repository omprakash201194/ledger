package com.omprakashgautam.homelab.ledger.controller;

import com.omprakashgautam.homelab.ledger.dto.request.WillRecordRequest;
import com.omprakashgautam.homelab.ledger.model.WillRecord;
import com.omprakashgautam.homelab.ledger.security.UserDetailsImpl;
import com.omprakashgautam.homelab.ledger.service.WillRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/will")
@RequiredArgsConstructor
public class WillRecordController {

    private final WillRecordService willRecordService;

    @GetMapping
    public ResponseEntity<WillRecord> get(@AuthenticationPrincipal UserDetailsImpl principal) {
        return willRecordService.find(principal.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping
    public ResponseEntity<WillRecord> upsert(@RequestBody WillRecordRequest request,
                                              @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(willRecordService.upsert(request, principal.getUsername()));
    }
}
