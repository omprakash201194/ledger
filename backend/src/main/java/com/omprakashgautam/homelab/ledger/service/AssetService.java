package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.AssetRequest;
import com.omprakashgautam.homelab.ledger.dto.response.AssetResponse;
import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.Asset;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.repository.AssetRepository;
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
public class AssetService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final TrustedPersonRepository trustedPersonRepository;

    public List<AssetResponse> findAll(String email) {
        User user = getUser(email);
        return assetRepository.findByUserId(user.getId()).stream()
                .map(AssetResponse::from).toList();
    }

    public AssetResponse findById(UUID id, String email) {
        return AssetResponse.from(getOwned(id, email));
    }

    @Transactional
    public AssetResponse create(AssetRequest req, String email) {
        User user = getUser(email);
        Asset entity = mapFromRequest(req);
        entity.setUser(user);
        return AssetResponse.from(assetRepository.save(entity));
    }

    @Transactional
    public AssetResponse update(UUID id, AssetRequest req, String email) {
        Asset entity = getOwned(id, email);
        applyUpdate(entity, req);
        return AssetResponse.from(assetRepository.save(entity));
    }

    @Transactional
    public void delete(UUID id, String email) {
        assetRepository.delete(getOwned(id, email));
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

    private Asset mapFromRequest(AssetRequest req) {
        Asset entity = new Asset();
        entity.setAssetType(req.getAssetType());
        entity.setDescription(req.getDescription());
        entity.setInstitution(req.getInstitution());
        entity.setAccountNumber(req.getAccountNumber());
        entity.setHoldingMode(req.getHoldingMode());
        entity.setJointHolderName(req.getJointHolderName());
        entity.setApproxValue(req.getApproxValue());
        entity.setValueAsOf(req.getValueAsOf());
        entity.setDocumentLocation(req.getDocumentLocation());
        entity.setRemarks(req.getRemarks());
        if (req.getTrustedPersonId() != null) {
            entity.setTrustedPerson(trustedPersonRepository.findById(req.getTrustedPersonId())
                    .orElseThrow(() -> new ResourceNotFoundException("TrustedPerson not found: " + req.getTrustedPersonId())));
        }
        return entity;
    }

    private void applyUpdate(Asset entity, AssetRequest req) {
        entity.setAssetType(req.getAssetType());
        entity.setDescription(req.getDescription());
        entity.setInstitution(req.getInstitution());
        entity.setAccountNumber(req.getAccountNumber());
        entity.setHoldingMode(req.getHoldingMode());
        entity.setJointHolderName(req.getJointHolderName());
        entity.setApproxValue(req.getApproxValue());
        entity.setValueAsOf(req.getValueAsOf());
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
