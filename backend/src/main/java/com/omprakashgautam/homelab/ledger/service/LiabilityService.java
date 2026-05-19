package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.LiabilityRequest;
import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.Liability;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.LiabilityRepository;
import com.omprakashgautam.homelab.ledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LiabilityService {

    private final LiabilityRepository liabilityRepository;
    private final UserRepository userRepository;

    public List<Liability> findAll(String email) {
        User user = getUser(email);
        return liabilityRepository.findByUserId(user.getId());
    }

    public Liability findById(UUID id, String email) {
        return getOwned(id, email);
    }

    @Transactional
    public Liability create(LiabilityRequest req, String email) {
        User user = getUser(email);
        Liability entity = mapFromRequest(req);
        entity.setUser(user);
        return liabilityRepository.save(entity);
    }

    @Transactional
    public Liability update(UUID id, LiabilityRequest req, String email) {
        Liability entity = getOwned(id, email);
        applyUpdate(entity, req);
        return liabilityRepository.save(entity);
    }

    @Transactional
    public void delete(UUID id, String email) {
        Liability entity = getOwned(id, email);
        liabilityRepository.delete(entity);
    }

    private Liability getOwned(UUID id, String email) {
        Liability entity = liabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Liability not found: " + id));
        if (!entity.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Liability not found: " + id);
        }
        return entity;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    // TODO Phase 2: implement mapping
    private Liability mapFromRequest(LiabilityRequest req) { return new Liability(); }
    private void applyUpdate(Liability entity, LiabilityRequest req) {}
}
