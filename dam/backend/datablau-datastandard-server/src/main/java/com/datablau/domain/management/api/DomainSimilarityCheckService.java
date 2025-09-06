package com.datablau.domain.management.api;

import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.DomainSimilarityCheckParamDto;
import com.datablau.domain.management.dto.DomainSimilarityCheckResultDetailDto;
import com.datablau.domain.management.dto.SkipReasonDto;
import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.DomainSimilarityCheckResult;
import com.datablau.domain.management.jpa.entity.DomainSimilarityCheckResultDetail;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface DomainSimilarityCheckService {
    boolean deleteAll();

    boolean refreshCheckState(Set<String> domainIds, List<Domain> domains);

    boolean save(DomainSimilarityCheckResult result, List<DomainSimilarityCheckResultDetailDto> details);

    List<Domain> getDomainsByStates(Set<DomainState> domainStates);

    List<DomainSimilarityCheckResult> getSimilarityGroup(Map<String, Object> reqBody);

    List<DomainSimilarityCheckResult> getSimilarityGroupNew(DomainSimilarityCheckParamDto reqBody);

    /*
    * 根据clusterId获取相似度+Domain详情
    * */
    List<DomainSimilarityCheckResultDetailDto> getSimilarityDetailByDomainId(Map<String, Object> reqBody, String user);

    List<DomainSimilarityCheckResultDetailDto> getSimilarityDetail(Map<String, Object> reqBody, String user);

    Boolean skipCheck(List<String> domainIds, String currentUser);


    Boolean skipCheckNew(List<SkipReasonDto> skipReasonDtos, String currentUser);
}
