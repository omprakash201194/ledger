package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.Alert;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.AlertRepository;
import com.omprakashgautam.homelab.ledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    public List<Alert> findAll(String email) {
        User user = getUser(email);
        return alertRepository.findByUserIdOrderByIsReadAscCreatedAtDesc(user.getId());
    }

    public long countUnread(UUID userId) {
        return alertRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public Alert markRead(UUID id, String email) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + id));
        if (!alert.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Alert not found: " + id);
        }
        alert.setRead(true);
        return alertRepository.save(alert);
    }

    @Transactional
    public void markAllRead(String email) {
        User user = getUser(email);
        alertRepository.markAllReadByUserId(user.getId());
    }

    // TODO Phase 2: implement alert generation logic
    @Scheduled(cron = "0 30 2 * * *")
    public void generateAlerts() {
        log.info("Alert scheduler running");
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}
