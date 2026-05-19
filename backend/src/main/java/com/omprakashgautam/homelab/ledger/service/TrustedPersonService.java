package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.TrustedPersonRequest;
import com.omprakashgautam.homelab.ledger.dto.response.TrustedPersonResponse;
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

    public List<TrustedPersonResponse> findAll(String email) {
        User user = getUser(email);
        return trustedPersonRepository.findByUserId(user.getId()).stream()
                .map(TrustedPersonResponse::from).toList();
    }

    public TrustedPersonResponse findById(UUID id, String email) {
        return TrustedPersonResponse.from(getOwned(id, email));
    }

    @Transactional
    public TrustedPersonResponse create(TrustedPersonRequest req, String email) {
        User user = getUser(email);
        TrustedPerson entity = mapFromRequest(req);
        entity.setUser(user);
        return TrustedPersonResponse.from(trustedPersonRepository.save(entity));
    }

    @Transactional
    public TrustedPersonResponse update(UUID id, TrustedPersonRequest req, String email) {
        TrustedPerson entity = getOwned(id, email);
        applyUpdate(entity, req);
        return TrustedPersonResponse.from(trustedPersonRepository.save(entity));
    }

    @Transactional
    public void delete(UUID id, String email) {
        trustedPersonRepository.delete(getOwned(id, email));
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

    private TrustedPerson mapFromRequest(TrustedPersonRequest req) {
        TrustedPerson entity = new TrustedPerson();
        entity.setName(req.getName());
        entity.setRelationship(req.getRelationship());
        entity.setType(req.getType());
        entity.setPhone(req.getPhone());
        entity.setEmail(req.getEmail());
        entity.setNotes(req.getNotes());
        return entity;
    }

    private void applyUpdate(TrustedPerson entity, TrustedPersonRequest req) {
        entity.setName(req.getName());
        entity.setRelationship(req.getRelationship());
        entity.setType(req.getType());
        entity.setPhone(req.getPhone());
        entity.setEmail(req.getEmail());
        entity.setNotes(req.getNotes());
    }
}
