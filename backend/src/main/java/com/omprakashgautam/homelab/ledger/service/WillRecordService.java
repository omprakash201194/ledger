package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.WillRecordRequest;
import com.omprakashgautam.homelab.ledger.dto.response.WillRecordResponse;
import com.omprakashgautam.homelab.ledger.exception.ResourceNotFoundException;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.model.WillRecord;
import com.omprakashgautam.homelab.ledger.repository.TrustedPersonRepository;
import com.omprakashgautam.homelab.ledger.repository.UserRepository;
import com.omprakashgautam.homelab.ledger.repository.WillRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WillRecordService {

    private final WillRecordRepository willRecordRepository;
    private final UserRepository userRepository;
    private final TrustedPersonRepository trustedPersonRepository;

    public Optional<WillRecordResponse> find(String email) {
        User user = getUser(email);
        return willRecordRepository.findByUserId(user.getId()).map(WillRecordResponse::from);
    }

    @Transactional
    public WillRecordResponse upsert(WillRecordRequest req, String email) {
        User user = getUser(email);
        WillRecord record = willRecordRepository.findByUserId(user.getId())
                .orElse(WillRecord.builder().user(user).build());
        record.setHasWill(req.isHasWill());
        record.setWillType(req.getWillType());
        record.setLocation(req.getLocation());
        record.setRegisteredWith(req.getRegisteredWith());
        record.setReviewReminderDate(req.getReviewReminderDate());
        record.setNotes(req.getNotes());
        if (req.getExecutorId() != null) {
            record.setExecutor(trustedPersonRepository.findById(req.getExecutorId())
                    .orElseThrow(() -> new ResourceNotFoundException("TrustedPerson not found: " + req.getExecutorId())));
        } else {
            record.setExecutor(null);
        }
        return WillRecordResponse.from(willRecordRepository.save(record));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}
