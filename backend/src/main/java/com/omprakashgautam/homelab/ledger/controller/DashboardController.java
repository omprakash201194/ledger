package com.omprakashgautam.homelab.ledger.controller;

import com.omprakashgautam.homelab.ledger.repository.AssetRepository;
import com.omprakashgautam.homelab.ledger.repository.LiabilityRepository;
import com.omprakashgautam.homelab.ledger.repository.UserRepository;
import com.omprakashgautam.homelab.ledger.security.UserDetailsImpl;
import com.omprakashgautam.homelab.ledger.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AssetRepository assetRepository;
    private final LiabilityRepository liabilityRepository;
    private final AlertService alertService;
    private final UserRepository userRepository;

    @GetMapping("/net-worth")
    public ResponseEntity<Map<String, Object>> netWorth(@AuthenticationPrincipal UserDetailsImpl principal) {
        var user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        BigDecimal totalAssets = assetRepository.sumApproxValueByUserId(user.getId());
        BigDecimal totalLiabilities = liabilityRepository.sumOutstandingBalanceByUserId(user.getId());
        BigDecimal netWorth = totalAssets.subtract(totalLiabilities);
        long unreadAlerts = alertService.countUnread(user.getId());

        return ResponseEntity.ok(Map.of(
                "totalAssets", totalAssets,
                "totalLiabilities", totalLiabilities,
                "netWorth", netWorth,
                "unreadAlertCount", unreadAlerts
        ));
    }
}
