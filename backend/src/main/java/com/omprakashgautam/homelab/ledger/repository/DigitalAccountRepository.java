package com.omprakashgautam.homelab.ledger.repository;

import com.omprakashgautam.homelab.ledger.model.DigitalAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DigitalAccountRepository extends JpaRepository<DigitalAccount, UUID> {
    List<DigitalAccount> findByUserId(UUID userId);
}
