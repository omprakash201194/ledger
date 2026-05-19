package com.omprakashgautam.homelab.ledger.dto.response;

import com.omprakashgautam.homelab.ledger.model.TrustedPerson;
import com.omprakashgautam.homelab.ledger.model.TrustedPersonType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class TrustedPersonResponse {
    private UUID id;
    private String name;
    private String relationship;
    private TrustedPersonType type;
    private String phone;
    private String email;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TrustedPersonResponse from(TrustedPerson p) {
        return TrustedPersonResponse.builder()
                .id(p.getId()).name(p.getName()).relationship(p.getRelationship())
                .type(p.getType()).phone(p.getPhone()).email(p.getEmail())
                .notes(p.getNotes()).createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
                .build();
    }
}
