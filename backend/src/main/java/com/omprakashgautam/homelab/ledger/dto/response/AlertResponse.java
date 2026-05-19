package com.omprakashgautam.homelab.ledger.dto.response;

import com.omprakashgautam.homelab.ledger.model.Alert;
import com.omprakashgautam.homelab.ledger.model.AlertType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class AlertResponse {
    private UUID id;
    private AlertType alertType;
    private String title;
    private String message;
    private String sourceEntity;
    private LocalDate dueDate;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static AlertResponse from(Alert a) {
        return AlertResponse.builder()
                .id(a.getId()).alertType(a.getAlertType()).title(a.getTitle())
                .message(a.getMessage()).sourceEntity(a.getSourceEntity())
                .dueDate(a.getDueDate()).isRead(a.isRead()).createdAt(a.getCreatedAt())
                .build();
    }
}
