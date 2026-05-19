package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.InsurancePolicyRequest;
import com.omprakashgautam.homelab.ledger.dto.response.InsurancePolicyResponse;
import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.InsurancePolicy;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.InsurancePolicyRepository;
import com.omprakashgautam.homelab.ledger.repository.TrustedPersonRepository;
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
    private final TrustedPersonRepository trustedPersonRepository;

    public List<InsurancePolicyResponse> findAll(String email) {
        User user = getUser(email);
        return insurancePolicyRepository.findByUserId(user.getId()).stream()
                .map(InsurancePolicyResponse::from).toList();
    }

    public InsurancePolicyResponse findById(UUID id, String email) {
        return InsurancePolicyResponse.from(getOwned(id, email));
    }

    @Transactional
    public InsurancePolicyResponse create(InsurancePolicyRequest req, String email) {
        User user = getUser(email);
        InsurancePolicy entity = mapFromRequest(req);
        entity.setUser(user);
        return InsurancePolicyResponse.from(insurancePolicyRepository.save(entity));
    }

    @Transactional
    public InsurancePolicyResponse update(UUID id, InsurancePolicyRequest req, String email) {
        InsurancePolicy entity = getOwned(id, email);
        applyUpdate(entity, req);
        return InsurancePolicyResponse.from(insurancePolicyRepository.save(entity));
    }

    @Transactional
    public void delete(UUID id, String email) {
        insurancePolicyRepository.delete(getOwned(id, email));
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

    private InsurancePolicy mapFromRequest(InsurancePolicyRequest req) {
        InsurancePolicy entity = new InsurancePolicy();
        entity.setPolicyType(req.getPolicyType());
        entity.setInsurer(req.getInsurer());
        entity.setPolicyNumber(req.getPolicyNumber());
        entity.setLifeAssured(req.getLifeAssured());
        entity.setSumAssured(req.getSumAssured());
        entity.setPremiumAmount(req.getPremiumAmount());
        entity.setPremiumDueMonth(req.getPremiumDueMonth());
        entity.setPremiumDueDay(req.getPremiumDueDay());
        entity.setMaturityDate(req.getMaturityDate());
        entity.setDocumentLocation(req.getDocumentLocation());
        entity.setRemarks(req.getRemarks());
        if (req.getTrustedPersonId() != null) {
            entity.setTrustedPerson(trustedPersonRepository.findById(req.getTrustedPersonId())
                    .orElseThrow(() -> new ResourceNotFoundException("TrustedPerson not found: " + req.getTrustedPersonId())));
        }
        return entity;
    }

    private void applyUpdate(InsurancePolicy entity, InsurancePolicyRequest req) {
        entity.setPolicyType(req.getPolicyType());
        entity.setInsurer(req.getInsurer());
        entity.setPolicyNumber(req.getPolicyNumber());
        entity.setLifeAssured(req.getLifeAssured());
        entity.setSumAssured(req.getSumAssured());
        entity.setPremiumAmount(req.getPremiumAmount());
        entity.setPremiumDueMonth(req.getPremiumDueMonth());
        entity.setPremiumDueDay(req.getPremiumDueDay());
        entity.setMaturityDate(req.getMaturityDate());
        entity.setDocumentLocation(req.getDocumentLocation());
        entity.setRemarks(req.getRemarks());
        if (req.getTrustedPersonId() != null) {
            entity.setTrustedPerson(trustedPersonRepository.findById(req.getTrustedPersonId())
                    .orElseThrow(() -> new ResourceNotFoundException("TrustedPerson not found: " + req.getTrustedPersonId())));
        } else {
            entity.setTrustedPerson(null);
        }
    }
}
