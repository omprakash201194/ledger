package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.TrustedPersonRequest;
import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.TrustedPerson;
import com.omprakashgautam.homelab.ledger.model.User;
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
public class TrustedPersonService {

    private final TrustedPersonRepository trustedPersonRepository;
    private final UserRepository userRepository;

    public List<TrustedPerson> findAll(String email) {
        User user = getUser(email);
        return trustedPersonRepository.findByUserId(user.getId());
    }

    public TrustedPerson findById(UUID id, String email) {
        return getOwned(id, email);
    }

    @Transactional
    public TrustedPerson create(TrustedPersonRequest req, String email) {
        User user = getUser(email);
        TrustedPerson entity = mapFromRequest(req);
        entity.setUser(user);
        return trustedPersonRepository.save(entity);
    }

    @Transactional
    public TrustedPerson update(UUID id, TrustedPersonRequest req, String email) {
        TrustedPerson entity = getOwned(id, email);
        applyUpdate(entity, req);
        return trustedPersonRepository.save(entity);
    }

    @Transactional
    public void delete(UUID id, String email) {
        TrustedPerson entity = getOwned(id, email);
        trustedPersonRepository.delete(entity);
    }

    private TrustedPerson getOwned(UUID id, String email) {
        TrustedPerson entity = trustedPersonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TrustedPerson not found: " + id));
        if (!entity.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("TrustedPerson not found: " + id);
        }
        return entity;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    // TODO Phase 2: implement mapping
    private TrustedPerson mapFromRequest(TrustedPersonRequest req) { return new TrustedPerson(); }
    private void applyUpdate(TrustedPerson entity, TrustedPersonRequest req) {}
}
