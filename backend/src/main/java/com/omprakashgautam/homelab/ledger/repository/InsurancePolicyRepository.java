package com.omprakashgautam.homelab.ledger.repository;

import com.omprakashgautam.homelab.ledger.model.InsurancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, UUID> {
    List<InsurancePolicy> findByUserId(UUID userId);
    List<InsurancePolicy> findByUserIdAndPremiumDueDayIsNotNull(UUID userId);
}
