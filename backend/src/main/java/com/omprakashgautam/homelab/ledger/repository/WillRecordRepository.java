package com.omprakashgautam.homelab.ledger.repository;

import com.omprakashgautam.homelab.ledger.model.WillRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface WillRecordRepository extends JpaRepository<WillRecord, UUID> {
    Optional<WillRecord> findByUserId(UUID userId);
}
