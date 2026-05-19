package com.omprakashgautam.homelab.ledger.dto.request;

import com.omprakashgautam.homelab.ledger.model.PolicyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class InsurancePolicyRequest {
    @NotNull private PolicyType policyType;
    @NotBlank private String insurer;
    private String policyNumber;
    private String lifeAssured;
    private BigDecimal sumAssured;
    private BigDecimal premiumAmount;
    private Integer premiumDueMonth;
    private Integer premiumDueDay;
    private UUID trustedPersonId;
    private LocalDate maturityDate;
    private String documentLocation;
    private String remarks;
}
