package com.omprakashgautam.homelab.ledger.dto.request;

import com.omprakashgautam.homelab.ledger.model.TrustedPersonType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TrustedPersonRequest {
    @NotBlank private String name;
    private String relationship;
    @NotNull private TrustedPersonType type;
    private String phone;
    private String email;
    private String notes;
}
