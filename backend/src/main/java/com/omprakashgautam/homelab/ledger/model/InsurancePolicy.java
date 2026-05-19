package com.omprakashgautam.homelab.ledger.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ldg_insurance_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsurancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "policy_type", nullable = false, length = 30)
    private PolicyType policyType;

    @Column(nullable = false, length = 255)
    private String insurer;

    @Column(name = "policy_number", length = 100)
    private String policyNumber;

    @Column(name = "life_assured", length = 100)
    private String lifeAssured;

    @Column(name = "sum_assured", precision = 18, scale = 2)
    private BigDecimal sumAssured;

    @Column(name = "premium_amount", precision = 18, scale = 2)
    private BigDecimal premiumAmount;

    @Column(name = "premium_due_month")
    private Integer premiumDueMonth;

    @Column(name = "premium_due_day")
    private Integer premiumDueDay;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trusted_person_id")
    private TrustedPerson trustedPerson;

    @Column(name = "maturity_date")
    private LocalDate maturityDate;

    @Column(name = "document_location", length = 500)
    private String documentLocation;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
