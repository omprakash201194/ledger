package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.LiabilityRequest;
import com.omprakashgautam.homelab.ledger.dto.response.LiabilityResponse;
import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.Liability;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.AssetRepository;
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
    private final AssetRepository assetRepository;

    public List<LiabilityResponse> findAll(String email) {
        User user = getUser(email);
        return liabilityRepository.findByUserId(user.getId()).stream()
                .map(LiabilityResponse::from).toList();
    }

    public LiabilityResponse findById(UUID id, String email) {
        return LiabilityResponse.from(getOwned(id, email));
    }

    @Transactional
    public LiabilityResponse create(LiabilityRequest req, String email) {
        User user = getUser(email);
        Liability entity = mapFromRequest(req);
        entity.setUser(user);
        return LiabilityResponse.from(liabilityRepository.save(entity));
    }

    @Transactional
    public LiabilityResponse update(UUID id, LiabilityRequest req, String email) {
        Liability entity = getOwned(id, email);
        applyUpdate(entity, req);
        return LiabilityResponse.from(liabilityRepository.save(entity));
    }

    @Transactional
    public void delete(UUID id, String email) {
        liabilityRepository.delete(getOwned(id, email));
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

    private Liability mapFromRequest(LiabilityRequest req) {
        Liability entity = new Liability();
        entity.setLiabilityType(req.getLiabilityType());
        entity.setLender(req.getLender());
        entity.setAccountNumber(req.getAccountNumber());
        entity.setOriginalAmount(req.getOriginalAmount());
        entity.setOutstandingBalance(req.getOutstandingBalance());
        entity.setEmiAmount(req.getEmiAmount());
        entity.setTenureEndDate(req.getTenureEndDate());
        entity.setRemarks(req.getRemarks());
        if (req.getLinkedAssetId() != null) {
            entity.setLinkedAsset(assetRepository.findById(req.getLinkedAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + req.getLinkedAssetId())));
        }
        return entity;
    }

    private void applyUpdate(Liability entity, LiabilityRequest req) {
        entity.setLiabilityType(req.getLiabilityType());
        entity.setLender(req.getLender());
        entity.setAccountNumber(req.getAccountNumber());
        entity.setOriginalAmount(req.getOriginalAmount());
        entity.setOutstandingBalance(req.getOutstandingBalance());
        entity.setEmiAmount(req.getEmiAmount());
        entity.setTenureEndDate(req.getTenureEndDate());
        entity.setRemarks(req.getRemarks());
        if (req.getLinkedAssetId() != null) {
            entity.setLinkedAsset(assetRepository.findById(req.getLinkedAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + req.getLinkedAssetId())));
        } else {
            entity.setLinkedAsset(null);
        }
    }
}
