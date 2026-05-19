package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.AssetRequest;
import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.Asset;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.AssetRepository;
import com.omprakashgautam.homelab.ledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    public List<Asset> findAll(String email) {
        User user = getUser(email);
        return assetRepository.findByUserId(user.getId());
    }

    public Asset findById(UUID id, String email) {
        return getOwned(id, email);
    }

    @Transactional
    public Asset create(AssetRequest req, String email) {
        User user = getUser(email);
        Asset entity = mapFromRequest(req);
        entity.setUser(user);
        return assetRepository.save(entity);
    }

    @Transactional
    public Asset update(UUID id, AssetRequest req, String email) {
        Asset entity = getOwned(id, email);
        applyUpdate(entity, req);
        return assetRepository.save(entity);
    }

    @Transactional
    public void delete(UUID id, String email) {
        Asset entity = getOwned(id, email);
        assetRepository.delete(entity);
    }

    private Asset getOwned(UUID id, String email) {
        Asset entity = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + id));
        if (!entity.getUser().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Asset not found: " + id);
        }
        return entity;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    // TODO Phase 2: implement mapping
    private Asset mapFromRequest(AssetRequest req) { return new Asset(); }
    private void applyUpdate(Asset entity, AssetRequest req) {}
}
