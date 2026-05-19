package com.omprakashgautam.homelab.ledger.dto.response;

import com.omprakashgautam.homelab.ledger.model.WillRecord;
import com.omprakashgautam.homelab.ledger.model.WillType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class WillRecordResponse {
    private UUID id;
    private boolean hasWill;
    private WillType willType;
    private String location;
    private UUID executorId;
    private String executorName;
    private String registeredWith;
    private LocalDate reviewReminderDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WillRecordResponse from(WillRecord w) {
        return WillRecordResponse.builder()
                .id(w.getId()).hasWill(w.isHasWill()).willType(w.getWillType())
                .location(w.getLocation())
                .executorId(w.getExecutor() != null ? w.getExecutor().getId() : null)
                .executorName(w.getExecutor() != null ? w.getExecutor().getName() : null)
                .registeredWith(w.getRegisteredWith()).reviewReminderDate(w.getReviewReminderDate())
                .notes(w.getNotes()).createdAt(w.getCreatedAt()).updatedAt(w.getUpdatedAt())
                .build();
    }
}
