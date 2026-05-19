package com.omprakashgautam.homelab.ledger.repository;

import com.omprakashgautam.homelab.ledger.model.TrustedPerson;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TrustedPersonRepository extends JpaRepository<TrustedPerson, UUID> {
    List<TrustedPerson> findByUserId(UUID userId);
}
