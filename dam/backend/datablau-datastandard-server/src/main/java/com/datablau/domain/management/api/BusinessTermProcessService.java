package com.datablau.domain.management.api;

import com.datablau.domain.management.dto.BusinessTermDto;
import com.datablau.workflow.common.entity.dto.WorkflowEventResult;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;
import java.util.Set;

public interface BusinessTermProcessService {

    void applyBusinessTermPublishBatch(Set<Long> nIds ,String username);

    void applyBusinessTermPublish(Long nsId,String username);

    void applyBusinessTermUpdate(BusinessTermDto dto,String username);

    void applyBusinessTermAbolish(Long nsId);

    void businessTermPublishWorkflowCallBack(WorkflowEventResult eventResult);

    void businessTermUpdateWorkflowCallBack(WorkflowEventResult eventResult);

    void businessTermAbolishWorkflowCallBack(WorkflowEventResult eventResult);

    BusinessTermDto getProcessBusinessTermDtoDetail(Long nsId, String processInstanceId) throws JsonProcessingException;

    Long getNsIdByProcessInstanceId(String processInstanceId);

    void applyBusinessTermAbolishBatch(Set<Long> nsIds,String username);


}
