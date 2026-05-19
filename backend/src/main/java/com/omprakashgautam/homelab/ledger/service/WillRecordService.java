package com.omprakashgautam.homelab.ledger.service;

import com.omprakashgautam.homelab.ledger.dto.request.WillRecordRequest;
import com.omprakashgautam.homelab.ledger.model.User;
import com.omprakashgautam.homelab.ledger.model.WillRecord;
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

    public Optional<WillRecord> find(String email) {
        User user = getUser(email);
        return willRecordRepository.findByUserId(user.getId());
    }

    @Transactional
    public WillRecord upsert(WillRecordRequest req, String email) {
        User user = getUser(email);
        WillRecord record = willRecordRepository.findByUserId(user.getId())
                .orElse(WillRecord.builder().user(user).build());
        // TODO Phase 2: apply fields from req
        return willRecordRepository.save(record);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}
