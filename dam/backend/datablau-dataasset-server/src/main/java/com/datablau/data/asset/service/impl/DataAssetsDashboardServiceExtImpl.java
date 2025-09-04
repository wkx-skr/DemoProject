package com.datablau.data.asset.service.impl;

import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.data.asset.jpa.repository.DataAssetExtRepository;
import com.datablau.data.asset.service.DataAssetsDashboardServiceExt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class DataAssetsDashboardServiceExtImpl implements DataAssetsDashboardServiceExt {


    @Autowired
    private DataAssetExtRepository dataAssetExtRepository;

    @Override
    public int getAssetsDomainNum() {

        return dataAssetExtRepository.findByCatalogTypeIdAndSubType(5L, EnumSupportType.DATA_STANDARD.name());
    }
}
