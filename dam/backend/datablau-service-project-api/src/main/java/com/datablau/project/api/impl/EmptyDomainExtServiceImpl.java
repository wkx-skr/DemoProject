package com.datablau.project.api.impl;

import com.datablau.domain.management.dto.DomainDto;
import com.datablau.project.api.DomainExtService;
import com.datablau.project.api.dto.BatchApplyRemoteDto;
import com.datablau.project.api.dto.CustomDomainExtDto;

import java.util.Collection;
import java.util.List;

public class EmptyDomainExtServiceImpl implements DomainExtService {
    @Override
    public List<CustomDomainExtDto> getDomainsById(List<String> ids) {
        return null;
    }


    @Override
    public void remoteCreateUpdateApple(BatchApplyRemoteDto batchApplyRemoteDto ,String type ) {

    }

    @Override
    public List<DomainDto> getDomainsByReferenceCodes(Collection<String> ReferenceCodes) {
        return List.of();
    }
}
