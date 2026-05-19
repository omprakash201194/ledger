package com.omprakashgautam.homelab.ledger.dto.request;

import com.omprakashgautam.homelab.ledger.model.WillType;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class WillRecordRequest {
    private boolean hasWill;
    private WillType willType;
    private String location;
    private UUID executorId;
    private String registeredWith;
    private LocalDate reviewReminderDate;
    private String notes;
}
