package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.RecurringObligationRequest;
import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.RecurringObligation;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.RecurringObligationRepository;
import com.omprakashgautam.homelab.ledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecurringObligationService {

    private final RecurringObligationRepository recurringObligationRepository;
    private final UserRepository userRepository;

    public List<RecurringObligation> findAll(String email) {
        User user = getUser(email);
        return recurringObligationRepository.findByUserId(user.getId());
    }

    public RecurringObligation findById(UUID id, String email) {
        return getOwned(id, email);
    }

    @Transactional
    public RecurringObligation create(RecurringObligationRequest req, String email) {
        User user = getUser(email);
        RecurringObligation entity = mapFromRequest(req);
        entity.setUser(user);
        return recurringObligationRepository.save(entity);
    }

    @Transactional
    public RecurringObligation update(UUID id, RecurringObligationRequest req, String email) {
        RecurringObligation entity = getOwned(id, email);
        applyUpdate(entity, req);
        return recurringObligationRepository.save(entity);
    }

    @Transactional
    public void delete(UUID id, String email) {
        RecurringObligation entity = getOwned(id, email);
        recurringObligationRepository.delete(entity);
    }

    private RecurringObligation getOwned(UUID id, String email) {
        RecurringObligation entity = recurringObligationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RecurringObligation not found: " + id));
        if (!entity.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("RecurringObligation not found: " + id);
        }
        return entity;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    // TODO Phase 2: implement mapping
    private RecurringObligation mapFromRequest(RecurringObligationRequest req) { return new RecurringObligation(); }
    private void applyUpdate(RecurringObligation entity, RecurringObligationRequest req) {}
}
