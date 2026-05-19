package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.InsurancePolicyRequest;
import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.InsurancePolicy;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.InsurancePolicyRepository;
import com.omprakashgautam.homelab.ledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InsurancePolicyService {

    private final InsurancePolicyRepository insurancePolicyRepository;
    private final UserRepository userRepository;

    public List<InsurancePolicy> findAll(String email) {
        User user = getUser(email);
        return insurancePolicyRepository.findByUserId(user.getId());
    }

    public InsurancePolicy findById(UUID id, String email) {
        return getOwned(id, email);
    }

    @Transactional
    public InsurancePolicy create(InsurancePolicyRequest req, String email) {
        User user = getUser(email);
        InsurancePolicy entity = mapFromRequest(req);
        entity.setUser(user);
        return insurancePolicyRepository.save(entity);
    }

    @Transactional
    public InsurancePolicy update(UUID id, InsurancePolicyRequest req, String email) {
        InsurancePolicy entity = getOwned(id, email);
        applyUpdate(entity, req);
        return insurancePolicyRepository.save(entity);
    }

    @Transactional
    public void delete(UUID id, String email) {
        InsurancePolicy entity = getOwned(id, email);
        insurancePolicyRepository.delete(entity);
    }

    private InsurancePolicy getOwned(UUID id, String email) {
        InsurancePolicy entity = insurancePolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InsurancePolicy not found: " + id));
        if (!entity.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("InsurancePolicy not found: " + id);
        }
        return entity;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    // TODO Phase 2: implement mapping
    private InsurancePolicy mapFromRequest(InsurancePolicyRequest req) { return new InsurancePolicy(); }
    private void applyUpdate(InsurancePolicy entity, InsurancePolicyRequest req) {}
}
