package com.omprakashgautam.homelab.ledger.dto.request;

import com.omprakashgautam.homelab.ledger.model.LiabilityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class LiabilityRequest {
    @NotNull private LiabilityType liabilityType;
    @NotBlank private String lender;
    private String accountNumber;
    private BigDecimal originalAmount;
    private BigDecimal outstandingBalance;
    private BigDecimal emiAmount;
    private LocalDate tenureEndDate;
    private UUID linkedAssetId;
    private String remarks;
}
