package com.omprakashgautam.homelab.ledger.dto.response;

import com.omprakashgautam.homelab.ledger.model.Asset;
import com.omprakashgautam.homelab.ledger.model.AssetType;
import com.omprakashgautam.homelab.ledger.model.HoldingMode;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class AssetResponse {
    private UUID id;
    private AssetType assetType;
    private String description;
    private String institution;
    private String accountNumber;
    private HoldingMode holdingMode;
    private String jointHolderName;
    private UUID trustedPersonId;
    private String trustedPersonName;
    private BigDecimal approxValue;
    private LocalDate valueAsOf;
    private String documentLocation;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AssetResponse from(Asset a) {
        return AssetResponse.builder()
                .id(a.getId()).assetType(a.getAssetType()).description(a.getDescription())
                .institution(a.getInstitution()).accountNumber(a.getAccountNumber())
                .holdingMode(a.getHoldingMode()).jointHolderName(a.getJointHolderName())
                .trustedPersonId(a.getTrustedPerson() != null ? a.getTrustedPerson().getId() : null)
                .trustedPersonName(a.getTrustedPerson() != null ? a.getTrustedPerson().getName() : null)
                .approxValue(a.getApproxValue()).valueAsOf(a.getValueAsOf())
                .documentLocation(a.getDocumentLocation()).remarks(a.getRemarks())
                .createdAt(a.getCreatedAt()).updatedAt(a.getUpdatedAt())
                .build();
    }
}
