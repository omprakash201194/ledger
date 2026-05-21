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
import java.time.temporal.ChronoUnit;
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
    private final LiabilityRepository liabilityRepository;

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
        scanWillNoReview(today);
        scanStaleAssets(today);
        scanNomineeMissing();
        scanFdMaturity(today);
        scanEmiEndingSoon(today);

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

    private void scanWillNoReview(LocalDate today) {
        // reason: fires when a Will exists but hasn't been actively reviewed in 18+ months
        //         (reviewReminderDate is absent or in the past, and updatedAt is older than 18 months)
        LocalDate staleThreshold = today.minusMonths(18);
        for (WillRecord record : willRecordRepository.findAll()) {
            if (!record.isHasWill()) continue;
            LocalDate lastActivity = record.getUpdatedAt().toLocalDate();
            boolean noActiveReminder = (record.getReviewReminderDate() == null || record.getReviewReminderDate().isBefore(today));
            if (noActiveReminder && lastActivity.isBefore(staleThreshold)) {
                String sourceEntity = "will_id:" + record.getId();
                if (!alertRepository.existsByUserIdAndSourceEntityAndAlertTypeAndIsReadFalse(
                        record.getUser().getId(), sourceEntity, AlertType.WILL_NO_REVIEW)) {
                    long monthsAgo = ChronoUnit.MONTHS.between(lastActivity, today);
                    alertRepository.save(Alert.builder()
                            .user(record.getUser())
                            .alertType(AlertType.WILL_NO_REVIEW)
                            .title("Will last reviewed " + monthsAgo + " months ago — review suggested")
                            .message("Consider reviewing your Will to ensure it reflects your current wishes.")
                            .sourceEntity(sourceEntity)
                            .dueDate(null)
                            .isRead(false)
                            .build());
                }
            }
        }
    }

    private void scanNomineeMissing() {
        // reason: aggregate alert per user — delete stale one and recreate with current count
        //         so the count stays accurate as assets are added or nominees assigned
        for (User user : userRepository.findAll()) {
            long count = assetRepository.countByUserIdAndTrustedPersonIsNull(user.getId());
            alertRepository.deleteUnreadByUserIdAndAlertType(user.getId(), AlertType.NOMINEE_MISSING);
            if (count > 0) {
                alertRepository.save(Alert.builder()
                        .user(user)
                        .alertType(AlertType.NOMINEE_MISSING)
                        .title(count + " asset" + (count > 1 ? "s have" : " has") + " no nominee registered")
                        .message("Adding a nominee to your assets helps your family access them without legal delays.")
                        .sourceEntity("user_id:" + user.getId())
                        .dueDate(null)
                        .isRead(false)
                        .build());
            }
        }
    }

    private static final List<AssetType> MATURITY_ASSET_TYPES =
            List.of(AssetType.FIXED_DEPOSIT, AssetType.RECURRING_DEPOSIT, AssetType.NPS);

    private void scanFdMaturity(LocalDate today) {
        LocalDate limit = today.plusDays(30);
        for (Asset asset : assetRepository.findByAssetTypeInAndMaturityDateBetween(MATURITY_ASSET_TYPES, today, limit)) {
            String sourceEntity = "asset_id:" + asset.getId();
            if (!alertRepository.existsByUserIdAndSourceEntityAndAlertTypeAndIsReadFalse(
                    asset.getUser().getId(), sourceEntity, AlertType.FD_MATURITY_DUE)) {
                long daysLeft = ChronoUnit.DAYS.between(today, asset.getMaturityDate());
                String institutionPart = asset.getInstitution() != null ? " at " + asset.getInstitution() : "";
                alertRepository.save(Alert.builder()
                        .user(asset.getUser())
                        .alertType(AlertType.FD_MATURITY_DUE)
                        .title("Matures in " + daysLeft + " days — renewal decision needed: " + asset.getDescription())
                        .message("'" + asset.getDescription() + "'" + institutionPart + " matures on " + asset.getMaturityDate() + ". Decide on renewal or reinvestment.")
                        .sourceEntity(sourceEntity)
                        .dueDate(asset.getMaturityDate())
                        .isRead(false)
                        .build());
            }
        }
    }

    private void scanEmiEndingSoon(LocalDate today) {
        LocalDate limit = today.plusDays(60);
        for (Liability liability : liabilityRepository.findAll()) {
            if (liability.getTenureEndDate() == null) continue;
            if (!liability.getTenureEndDate().isAfter(limit) && !liability.getTenureEndDate().isBefore(today)) {
                String sourceEntity = "liability_id:" + liability.getId();
                if (!alertRepository.existsByUserIdAndSourceEntityAndAlertTypeAndIsReadFalse(
                        liability.getUser().getId(), sourceEntity, AlertType.EMI_ENDING_SOON)) {
                    long daysLeft = ChronoUnit.DAYS.between(today, liability.getTenureEndDate());
                    alertRepository.save(Alert.builder()
                            .user(liability.getUser())
                            .alertType(AlertType.EMI_ENDING_SOON)
                            .title("EMI ends in " + daysLeft + " days: " + liability.getLender())
                            .message("Loan with " + liability.getLender() + " ends on " + liability.getTenureEndDate() + ". Verify your final settlement letter.")
                            .sourceEntity(sourceEntity)
                            .dueDate(liability.getTenureEndDate())
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
