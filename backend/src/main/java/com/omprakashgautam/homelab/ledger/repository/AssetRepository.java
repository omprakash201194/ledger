package com.omprakashgautam.homelab.ledger.repository;

import com.omprakashgautam.homelab.ledger.model.Asset;
import com.omprakashgautam.homelab.ledger.model.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AssetRepository extends JpaRepository<Asset, UUID> {
    List<Asset> findByUserId(UUID userId);

    @Query("SELECT COALESCE(SUM(a.approxValue), 0) FROM Asset a WHERE a.user.id = :userId AND a.approxValue IS NOT NULL")
    BigDecimal sumApproxValueByUserId(UUID userId);

    long countByUserIdAndTrustedPersonIsNull(UUID userId);

    List<Asset> findByAssetTypeInAndMaturityDateBetween(List<AssetType> types, LocalDate start, LocalDate end);
}
