package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.response.AlertResponse;
import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.*;
import com.omprakashgautam.homelab.ledger.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final InsurancePolicyRepository insurancePolicyRepository;
    private final RecurringObligationRepository recurringObligationRepository;
    private final WillRecordRepository willRecordRepository;
    private final AssetRepository assetRepository;

    public List<AlertResponse> findAll(String email) {
        User user = getUser(email);
        return alertRepository.findByUserIdOrderByIsReadAscCreatedAtDesc(user.getId()).stream()
                .map(AlertResponse::from).toList();
    }

    public long countUnread(UUID userId) {
        return alertRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public AlertResponse markRead(UUID id, String email) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + id));
        if (!alert.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Alert not found: " + id);
        }
        alert.setRead(true);
        return AlertResponse.from(alertRepository.save(alert));
    }

    @Transactional
    public void markAllRead(String email) {
        User user = getUser(email);
        alertRepository.markAllReadByUserId(user.getId());
    }

    @Scheduled(cron = "0 30 2 * * *")
    @Transactional
    public void generateAlerts() {
        log.info("Alert scanner starting");
        LocalDate today = LocalDate.now();

        scanInsurancePremiums(today);
        scanRecurringObligations(today);
        scanWillReviews(today);
        scanStaleAssets(today);

        log.info("Alert scanner complete");
    }

    private void scanInsurancePremiums(LocalDate today) {
        LocalDate limit = today.plusDays(30);
        for (InsurancePolicy policy : insurancePolicyRepository.findAll()) {
            if (policy.getPremiumDueMonth() == null || policy.getPremiumDueDay() == null) continue;
            LocalDate nextDue = nextAnnualDueDate(policy.getPremiumDueMonth(), policy.getPremiumDueDay(), today);
            if (!nextDue.isAfter(limit)) {
                String sourceEntity = "policy_id:" + policy.getId();
                if (!alertRepository.existsByUserIdAndSourceEntityAndAlertTypeAndIsReadFalse(
                        policy.getUser().getId(), sourceEntity, AlertType.INSURANCE_PREMIUM_DUE)) {
                    alertRepository.save(Alert.builder()
                            .user(policy.getUser())
                            .alertType(AlertType.INSURANCE_PREMIUM_DUE)
                            .title("Insurance premium due: " + policy.getInsurer())
                            .message("Premium for policy " + policy.getPolicyNumber() + " (" + policy.getInsurer() + ") is due on " + nextDue)
                            .sourceEntity(sourceEntity)
                            .dueDate(nextDue)
                            .isRead(false)
                            .build());
                }
            }
        }
    }

    private void scanRecurringObligations(LocalDate today) {
        LocalDate limit = today.plusDays(7);
        for (RecurringObligation obligation : recurringObligationRepository.findAll()) {
            if (obligation.getDueDay() == null || obligation.getFrequency() != Frequency.MONTHLY) continue;
            LocalDate nextDue = nextMonthlyDueDate(obligation.getDueDay(), today);
            if (!nextDue.isAfter(limit)) {
                String sourceEntity = "obligation_id:" + obligation.getId();
                if (!alertRepository.existsByUserIdAndSourceEntityAndAlertTypeAndIsReadFalse(
                        obligation.getUser().getId(), sourceEntity, AlertType.EMI_DUE)) {
                    alertRepository.save(Alert.builder()
                            .user(obligation.getUser())
                            .alertType(AlertType.EMI_DUE)
                            .title("Payment due: " + obligation.getPayee())
                            .message("Payment of ₹" + obligation.getAmount() + " to " + obligation.getPayee() + " is due on " + nextDue)
                            .sourceEntity(sourceEntity)
                            .dueDate(nextDue)
                            .isRead(false)
                            .build());
                }
            }
        }
    }

    private void scanWillReviews(LocalDate today) {
        LocalDate limit = today.plusDays(30);
        for (WillRecord record : willRecordRepository.findAll()) {
            if (record.getReviewReminderDate() == null) continue;
            if (!record.getReviewReminderDate().isAfter(limit) && !record.getReviewReminderDate().isBefore(today)) {
                String sourceEntity = "will_id:" + record.getId();
                if (!alertRepository.existsByUserIdAndSourceEntityAndAlertTypeAndIsReadFalse(
                        record.getUser().getId(), sourceEntity, AlertType.WILL_REVIEW_DUE)) {
                    alertRepository.save(Alert.builder()
                            .user(record.getUser())
                            .alertType(AlertType.WILL_REVIEW_DUE)
                            .title("Will review reminder")
                            .message("Your will is scheduled for review on " + record.getReviewReminderDate())
                            .sourceEntity(sourceEntity)
                            .dueDate(record.getReviewReminderDate())
                            .isRead(false)
                            .build());
                }
            }
        }
    }

    private void scanStaleAssets(LocalDate today) {
        LocalDate staleThreshold = today.minusDays(90);
        for (Asset asset : assetRepository.findAll()) {
            if (asset.getValueAsOf() == null) continue;
            if (asset.getValueAsOf().isBefore(staleThreshold)) {
                String sourceEntity = "asset_id:" + asset.getId();
                if (!alertRepository.existsByUserIdAndSourceEntityAndAlertTypeAndIsReadFalse(
                        asset.getUser().getId(), sourceEntity, AlertType.ASSET_VALUE_STALE)) {
                    alertRepository.save(Alert.builder()
                            .user(asset.getUser())
                            .alertType(AlertType.ASSET_VALUE_STALE)
                            .title("Asset value stale: " + asset.getDescription())
                            .message("The value of '" + asset.getDescription() + "' was last updated on " + asset.getValueAsOf() + " — consider updating it")
                            .sourceEntity(sourceEntity)
                            .dueDate(null)
                            .isRead(false)
                            .build());
                }
            }
        }
    }

    // Computes the next annual due date for (month, day). If the date has already passed this year, returns next year's.
    private LocalDate nextAnnualDueDate(int month, int day, LocalDate today) {
        LocalDate candidate = LocalDate.of(today.getYear(), month, day);
        if (candidate.isBefore(today)) {
            candidate = candidate.plusYears(1);
        }
        return candidate;
    }

    // Computes the next monthly due date for a given day-of-month. If the day has already passed this month, returns next month.
    private LocalDate nextMonthlyDueDate(int day, LocalDate today) {
        LocalDate candidate = today.withDayOfMonth(Math.min(day, today.lengthOfMonth()));
        if (candidate.isBefore(today)) {
            LocalDate nextMonth = today.plusMonths(1);
            candidate = nextMonth.withDayOfMonth(Math.min(day, nextMonth.lengthOfMonth()));
        }
        return candidate;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}
