package com.omprakashgautam.homelab.ledger.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ldg_assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 30)
    private AssetType assetType;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(length = 255)
    private String institution;

    @Column(name = "account_number", length = 100)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "holding_mode", nullable = false, length = 30)
    private HoldingMode holdingMode;

    @Column(name = "joint_holder_name", length = 100)
    private String jointHolderName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trusted_person_id")
    private TrustedPerson trustedPerson;

    @Column(name = "approx_value", precision = 18, scale = 2)
    private BigDecimal approxValue;

    @Column(name = "value_as_of")
    private LocalDate valueAsOf;

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
