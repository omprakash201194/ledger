package com.omprakashgautam.homelab.ledger.dto.response;

import com.omprakashgautam.homelab.ledger.model.ActionOnDeath;
import com.omprakashgautam.homelab.ledger.model.Frequency;
import com.omprakashgautam.homelab.ledger.model.ObligationType;
import com.omprakashgautam.homelab.ledger.model.RecurringObligation;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class RecurringObligationResponse {
    private UUID id;
    private ObligationType obligationType;
    private String payee;
    private BigDecimal amount;
    private Frequency frequency;
    private Integer dueDay;
    private String paymentSource;
    private ActionOnDeath actionOnDeath;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RecurringObligationResponse from(RecurringObligation o) {
        return RecurringObligationResponse.builder()
                .id(o.getId()).obligationType(o.getObligationType()).payee(o.getPayee())
                .amount(o.getAmount()).frequency(o.getFrequency()).dueDay(o.getDueDay())
                .paymentSource(o.getPaymentSource()).actionOnDeath(o.getActionOnDeath())
                .remarks(o.getRemarks()).createdAt(o.getCreatedAt()).updatedAt(o.getUpdatedAt())
                .build();
    }
}
