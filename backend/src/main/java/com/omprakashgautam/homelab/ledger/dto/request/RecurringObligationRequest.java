package com.omprakashgautam.homelab.ledger.dto.request;

import com.omprakashgautam.homelab.ledger.model.ActionOnDeath;
import com.omprakashgautam.homelab.ledger.model.Frequency;
import com.omprakashgautam.homelab.ledger.model.ObligationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class RecurringObligationRequest {
    @NotNull private ObligationType obligationType;
    @NotBlank private String payee;
    @NotNull private BigDecimal amount;
    @NotNull private Frequency frequency;
    private Integer dueDay;
    private String paymentSource;
    private ActionOnDeath actionOnDeath;
    private String remarks;
}
