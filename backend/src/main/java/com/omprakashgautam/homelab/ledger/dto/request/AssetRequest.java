package com.omprakashgautam.homelab.ledger.dto.request;

import com.omprakashgautam.homelab.ledger.model.AssetType;
import com.omprakashgautam.homelab.ledger.model.HoldingMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class AssetRequest {
    @NotNull private AssetType assetType;
    @NotBlank private String description;
    private String institution;
    private String accountNumber;
    @NotNull private HoldingMode holdingMode;
    private String jointHolderName;
    private UUID trustedPersonId;
    private BigDecimal approxValue;
    private LocalDate valueAsOf;
    private String documentLocation;
    private String remarks;
}
