package com.omprakashgautam.homelab.ledger.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ldg_will_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WillRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "has_will", nullable = false)
    private boolean hasWill;

    @Enumerated(EnumType.STRING)
    @Column(name = "will_type", length = 20)
    private WillType willType;

    @Column(length = 500)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "executor_id")
    private TrustedPerson executor;

    @Column(name = "registered_with", length = 255)
    private String registeredWith;

    @Column(name = "review_reminder_date")
    private LocalDate reviewReminderDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

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
