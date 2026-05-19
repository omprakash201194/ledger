package com.omprakashgautam.homelab.ledger.repository;

import com.omprakashgautam.homelab.ledger.model.Alert;
import com.omprakashgautam.homelab.ledger.model.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByUserIdOrderByIsReadAscCreatedAtDesc(UUID userId);
    long countByUserIdAndIsReadFalse(UUID userId);
    boolean existsByUserIdAndSourceEntityAndAlertTypeAndIsReadFalse(UUID userId, String sourceEntity, AlertType alertType);

    @Modifying
    @Query("UPDATE Alert a SET a.isRead = true WHERE a.user.id = :userId")
    void markAllReadByUserId(UUID userId);
}
