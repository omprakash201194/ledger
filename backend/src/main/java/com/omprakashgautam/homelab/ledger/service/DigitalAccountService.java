package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.DigitalAccountRequest;
import com.omprakashgautam.homelab.ledger.dto.response.DigitalAccountResponse;
import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.DigitalAccount;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.DigitalAccountRepository;
import com.omprakashgautam.homelab.ledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DigitalAccountService {

    private final DigitalAccountRepository digitalAccountRepository;
    private final UserRepository userRepository;

    public List<DigitalAccountResponse> findAll(String email) {
        User user = getUser(email);
        return digitalAccountRepository.findByUserId(user.getId()).stream()
                .map(DigitalAccountResponse::from).toList();
    }

    public DigitalAccountResponse findById(UUID id, String email) {
        return DigitalAccountResponse.from(getOwned(id, email));
    }

    @Transactional
    public DigitalAccountResponse create(DigitalAccountRequest req, String email) {
        User user = getUser(email);
        DigitalAccount entity = mapFromRequest(req);
        entity.setUser(user);
        return DigitalAccountResponse.from(digitalAccountRepository.save(entity));
    }

    @Transactional
    public DigitalAccountResponse update(UUID id, DigitalAccountRequest req, String email) {
        DigitalAccount entity = getOwned(id, email);
        applyUpdate(entity, req);
        return DigitalAccountResponse.from(digitalAccountRepository.save(entity));
    }

    @Transactional
    public void delete(UUID id, String email) {
        digitalAccountRepository.delete(getOwned(id, email));
    }

    private DigitalAccount getOwned(UUID id, String email) {
        DigitalAccount entity = digitalAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DigitalAccount not found: " + id));
        if (!entity.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("DigitalAccount not found: " + id);
        }
        return entity;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private DigitalAccount mapFromRequest(DigitalAccountRequest req) {
        DigitalAccount entity = new DigitalAccount();
        entity.setCategory(req.getCategory());
        entity.setServiceName(req.getServiceName());
        entity.setUsername(req.getUsername());
        entity.setCredentialLocation(req.getCredentialLocation());
        entity.setTwoFaMethod(req.getTwoFaMethod());
        entity.setRecoveryContact(req.getRecoveryContact());
        entity.setActionOnDeath(req.getActionOnDeath());
        entity.setRemarks(req.getRemarks());
        return entity;
    }

    private void applyUpdate(DigitalAccount entity, DigitalAccountRequest req) {
        entity.setCategory(req.getCategory());
        entity.setServiceName(req.getServiceName());
        entity.setUsername(req.getUsername());
        entity.setCredentialLocation(req.getCredentialLocation());
        entity.setTwoFaMethod(req.getTwoFaMethod());
        entity.setRecoveryContact(req.getRecoveryContact());
        entity.setActionOnDeath(req.getActionOnDeath());
        entity.setRemarks(req.getRemarks());
    }
}
