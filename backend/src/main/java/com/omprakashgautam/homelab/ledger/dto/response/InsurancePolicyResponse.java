package com.omprakashgautam.homelab.ledger.dto.response;

import com.omprakashgautam.homelab.ledger.model.InsurancePolicy;
import com.omprakashgautam.homelab.ledger.model.PolicyType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class InsurancePolicyResponse {
    private UUID id;
    private PolicyType policyType;
    private String insurer;
    private String policyNumber;
    private String lifeAssured;
    private BigDecimal sumAssured;
    private BigDecimal premiumAmount;
    private Integer premiumDueMonth;
    private Integer premiumDueDay;
    private UUID trustedPersonId;
    private String trustedPersonName;
    private LocalDate maturityDate;
    private String documentLocation;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static InsurancePolicyResponse from(InsurancePolicy p) {
        return InsurancePolicyResponse.builder()
                .id(p.getId()).policyType(p.getPolicyType()).insurer(p.getInsurer())
                .policyNumber(p.getPolicyNumber()).lifeAssured(p.getLifeAssured())
                .sumAssured(p.getSumAssured()).premiumAmount(p.getPremiumAmount())
                .premiumDueMonth(p.getPremiumDueMonth()).premiumDueDay(p.getPremiumDueDay())
                .trustedPersonId(p.getTrustedPerson() != null ? p.getTrustedPerson().getId() : null)
                .trustedPersonName(p.getTrustedPerson() != null ? p.getTrustedPerson().getName() : null)
                .maturityDate(p.getMaturityDate()).documentLocation(p.getDocumentLocation())
                .remarks(p.getRemarks()).createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt())
                .build();
    }
}
