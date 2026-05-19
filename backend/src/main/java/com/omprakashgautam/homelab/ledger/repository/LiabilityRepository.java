package com.omprakashgautam.homelab.ledger.repository;

import com.omprakashgautam.homelab.ledger.model.Liability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface LiabilityRepository extends JpaRepository<Liability, UUID> {
    List<Liability> findByUserId(UUID userId);

    @Query("SELECT COALESCE(SUM(l.outstandingBalance), 0) FROM Liability l WHERE l.user.id = :userId AND l.outstandingBalance IS NOT NULL")
    BigDecimal sumOutstandingBalanceByUserId(UUID userId);
}
