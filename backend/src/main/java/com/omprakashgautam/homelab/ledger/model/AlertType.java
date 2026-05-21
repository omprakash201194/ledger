package com.omprakashgautam.homelab.ledger.model;

public enum AlertType {
    INSURANCE_PREMIUM_DUE,
    EMI_DUE,
    WILL_REVIEW_DUE,
    WILL_NO_REVIEW,       // Will exists but hasn't been reviewed in 18+ months
    OBLIGATION_REVIEW,
    ASSET_VALUE_STALE,
    NOMINEE_MISSING,      // One or more assets have no nominee
    FD_MATURITY_DUE,      // FD / RD / NPS maturing within 30 days
    EMI_ENDING_SOON,      // Liability tenure ending within 60 days
}
