package com.omprakashgautam.homelab.ledger.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ldg_digital_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DigitalAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DigitalAccountCategory category;

    @Column(name = "service_name", nullable = false, length = 255)
    private String serviceName;

    @Column(length = 255)
    private String username;

    @Column(name = "credential_location", length = 500)
    private String credentialLocation;

    @Column(name = "two_fa_method", length = 100)
    private String twoFaMethod;

    @Column(name = "recovery_contact", length = 255)
    private String recoveryContact;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_on_death", length = 20)
    private ActionOnDeath actionOnDeath;

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
