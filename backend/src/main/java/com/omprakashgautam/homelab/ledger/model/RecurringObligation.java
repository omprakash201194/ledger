package com.omprakashgautam.homelab.ledger.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ldg_recurring_obligations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringObligation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "obligation_type", nullable = false, length = 30)
    private ObligationType obligationType;

    @Column(nullable = false, length = 255)
    private String payee;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Frequency frequency;

    @Column(name = "due_day")
    private Integer dueDay;

    @Column(name = "payment_source", length = 255)
    private String paymentSource;

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
