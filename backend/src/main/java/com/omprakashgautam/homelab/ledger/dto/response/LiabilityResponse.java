package com.omprakashgautam.homelab.ledger.dto.response;

import com.omprakashgautam.homelab.ledger.model.Liability;
import com.omprakashgautam.homelab.ledger.model.LiabilityType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class LiabilityResponse {
    private UUID id;
    private LiabilityType liabilityType;
    private String lender;
    private String accountNumber;
    private BigDecimal originalAmount;
    private BigDecimal outstandingBalance;
    private BigDecimal emiAmount;
    private LocalDate tenureEndDate;
    private UUID linkedAssetId;
    private String linkedAssetDescription;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LiabilityResponse from(Liability l) {
        return LiabilityResponse.builder()
                .id(l.getId()).liabilityType(l.getLiabilityType()).lender(l.getLender())
                .accountNumber(l.getAccountNumber()).originalAmount(l.getOriginalAmount())
                .outstandingBalance(l.getOutstandingBalance()).emiAmount(l.getEmiAmount())
                .tenureEndDate(l.getTenureEndDate())
                .linkedAssetId(l.getLinkedAsset() != null ? l.getLinkedAsset().getId() : null)
                .linkedAssetDescription(l.getLinkedAsset() != null ? l.getLinkedAsset().getDescription() : null)
                .remarks(l.getRemarks()).createdAt(l.getCreatedAt()).updatedAt(l.getUpdatedAt())
                .build();
    }
}
