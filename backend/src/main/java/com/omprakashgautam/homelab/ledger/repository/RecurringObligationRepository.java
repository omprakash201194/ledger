package com.omprakashgautam.homelab.ledger.repository;

import com.omprakashgautam.homelab.ledger.model.RecurringObligation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RecurringObligationRepository extends JpaRepository<RecurringObligation, UUID> {
    List<RecurringObligation> findByUserId(UUID userId);
}
