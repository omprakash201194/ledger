package com.omprakashgautam.homelab.ledger.dto.request;

import com.omprakashgautam.homelab.ledger.model.ActionOnDeath;
import com.omprakashgautam.homelab.ledger.model.DigitalAccountCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DigitalAccountRequest {
    @NotNull private DigitalAccountCategory category;
    @NotBlank private String serviceName;
    private String username;
    private String credentialLocation;
    private String twoFaMethod;
    private String recoveryContact;
    private ActionOnDeath actionOnDeath;
    private String remarks;
}
