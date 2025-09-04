package com.datablau.project.api;

import com.datablau.domain.management.dto.DomainDto;
import com.datablau.project.api.dto.BatchApplyRemoteDto;
import com.datablau.project.api.dto.CustomDomainExtDto;

import java.util.Collection;
import java.util.List;

public interface DomainExtService {
    List<CustomDomainExtDto> getDomainsById(List<String> ids);

    // 资产远程调用 审批表
    void remoteCreateUpdateApple(BatchApplyRemoteDto batchApplyRemoteDto,String type);


    List<DomainDto> getDomainsByReferenceCodes(Collection<String> ReferenceCodes);
}
