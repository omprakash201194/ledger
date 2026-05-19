package com.omprakashgautam.homelab.ledger.dto.response;

import com.omprakashgautam.homelab.ledger.model.ActionOnDeath;
import com.omprakashgautam.homelab.ledger.model.DigitalAccount;
import com.omprakashgautam.homelab.ledger.model.DigitalAccountCategory;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class DigitalAccountResponse {
    private UUID id;
    private DigitalAccountCategory category;
    private String serviceName;
    private String username;
    private String credentialLocation;
    private String twoFaMethod;
    private String recoveryContact;
    private ActionOnDeath actionOnDeath;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DigitalAccountResponse from(DigitalAccount a) {
        return DigitalAccountResponse.builder()
                .id(a.getId()).category(a.getCategory()).serviceName(a.getServiceName())
                .username(a.getUsername()).credentialLocation(a.getCredentialLocation())
                .twoFaMethod(a.getTwoFaMethod()).recoveryContact(a.getRecoveryContact())
                .actionOnDeath(a.getActionOnDeath()).remarks(a.getRemarks())
                .createdAt(a.getCreatedAt()).updatedAt(a.getUpdatedAt())
                .build();
    }
}
