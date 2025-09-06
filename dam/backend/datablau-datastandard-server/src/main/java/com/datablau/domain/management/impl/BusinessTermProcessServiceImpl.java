package com.datablau.domain.management.impl;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.api.MessageService;
import com.datablau.domain.management.api.ApplyService;
import com.datablau.domain.management.api.BusinessTermProcessService;
import com.datablau.domain.management.api.BusinessTermService;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.BatchApplyDetailDto;
import com.datablau.domain.management.dto.BatchApplyDto;
import com.datablau.domain.management.dto.BusinessTermDto;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.domain.management.jpa.entity.BusinessTerm;
import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.DomainProcessRecord;
import com.datablau.domain.management.jpa.repository.BusinessTermRepository;
import com.datablau.domain.management.jpa.repository.DomainProcessRecordRepository;
import com.datablau.domain.management.jpa.repository.DomainProcessRecordRepositoryExt;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.utils.AuthTools;
import com.datablau.workflow.common.api.DatablauRemoteWorkflowService;
import com.datablau.workflow.common.entity.dto.WorkflowEventResult;
import com.datablau.workflow.common.entity.dto.WorkflowFormDto;
import com.datablau.workflow.common.entity.dto.query.WorkflowApplyQueryDto;
import com.datablau.workflow.common.entity.type.ProcessResultType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.*;
import java.util.stream.Collectors;

import static com.datablau.domain.management.impl.DomainProcessServiceImpl.DOMAIN_STATE_ORIGINAL;

@Service
public class BusinessTermProcessServiceImpl implements BusinessTermProcessService {
    private static final Logger LOGGER = LoggerFactory.getLogger(BusinessTermProcessServiceImpl.class);
    private ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private BusinessTermRepository businessTermRepository;
    @Autowired
    private BusinessTermService businessTermService;
    @Resource
    public DatablauRemoteWorkflowService workflowService;

    @Autowired
    public MessageService msgService;

    @Autowired
    public PlatformTransactionManager txManager;

    @Autowired
    public DomainProcessRecordRepository domainProcessRecordRepository;
    @Autowired
    private DomainProcessRecordRepositoryExt domainProcessRecordRepositoryExt;

    @Autowired
    private BusinessTermRepository busTermRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private ApplyService applyService;


    @Override
    public void applyBusinessTermPublishBatch(Set<Long> nIds, String username) {
        List<Long> tmIds= new ArrayList<>();
        tmIds.addAll(nIds);
        List<BusinessTermDto> businessTermDtos = businessTermService.queryBusinessTermById(tmIds);
        businessTermPublishVerifyDao(businessTermDtos);
        List<BatchApplyDto> pubDatas = generateBusinessUpdateApplyDto(null, businessTermDtos, "发布",username);
        applyService.createBatch(pubDatas);

        // todo  操作记录暂时不写
       // this.saveProcessRecord(businessTerm, processInstanceId);

    }

    @Override
    @Transactional
    public void applyBusinessTermPublish(Long nsId, String username) {

        BusinessTerm businessTerm = businessTermRepository.findAllByIdEquals(nsId);

        DomainState oldState = businessTerm.getState();
        this.businessTermPublishVerify(businessTerm);
        this.applyProcess(username, oldState, businessTerm, null,
                this.msgService.getMessage("process.publish.businessTerm"),
                "BUSINESS_TERM_PUBLISH_SYSTEM_INIT");
    }


    public void applyProcess(String username, DomainState oldState,
                             BusinessTerm businessTerm, BusinessTermDto newDto,
                             String processNamePrefix, String processCode) {

        try {
            LOGGER.info("businessTerm:" + new ObjectMapper().writeValueAsString(businessTerm));
        } catch (JsonProcessingException e) {

        }
        // 非发布流程 需要创建副本
        Long updatingNsId = null;
        if (!processCode.contains("PUBLISH")) {
            updatingNsId = this.generateCopyBusinessTerm(businessTerm.getId(), newDto);
        }

        // 这里依据不同的类型进行判断
        if (msgService.getMessage("process.publish.businessTerm").equals(processNamePrefix)){
//            BatchApplyDto batchApplyDto = generateBusinessUpdateApplyDto(businessTerm.getId(), dto);
//            applyService.create(batchApplyDto);
        } else if (msgService.getMessage("process.update.businessTerm").equals(processNamePrefix)) {
            // 变更  这里只适合变更
            List<BusinessTermDto> tmDtos = new ArrayList<>();
            tmDtos.add(newDto);
            List<BatchApplyDto> update = generateBusinessUpdateApplyDto(null, tmDtos, "变更", username);
            applyService.createBatch(update);
        } else if (msgService.getMessage("process.abandon.businessTerm").equals(processNamePrefix)) {
            // 废弃

        }

        List<WorkflowFormDto> formDtoList = new ArrayList();
        formDtoList.add(new WorkflowFormDto("startUserId", username != null ? username : AuthTools.currentUsername()));
        formDtoList.add(new WorkflowFormDto("processInstanceName", processNamePrefix + "---" + businessTerm.getChName()));
        formDtoList.add(new WorkflowFormDto("formDetailUrl", "http://localhost/fdafda"));
        formDtoList.add(new WorkflowFormDto("nsId", businessTerm.getId().toString()));
        if(updatingNsId != null) {
            formDtoList.add(new WorkflowFormDto("updatingNsId", updatingNsId.toString()));
        }
        formDtoList.add(new WorkflowFormDto("domainCategoryId", businessTerm.getCategoryId().toString()));
        if (oldState != null) {
            formDtoList.add(new WorkflowFormDto("domainStateOriginal", oldState.toString()));
        }

        WorkflowApplyQueryDto queryDto = new WorkflowApplyQueryDto();
        queryDto.setProcessCode(processCode);
        queryDto.setFormDefs(formDtoList);
        try {
            LOGGER.info("queryDto:" + new ObjectMapper().writeValueAsString(queryDto));
        } catch (JsonProcessingException e) {

        }
      //  String processInstanceId = this.workflowService.applyProcess(queryDto);

        try {
         //   this.saveProcessRecord(businessTerm, processInstanceId);
        } catch (Exception var9) {
          //  this.workflowService.deleteProcessInstance(processInstanceId);
            throw new AndorjRuntimeException(this.msgService.getMessage("saveFailed"), var9);
        }

        LOGGER.info(AuthTools.currentUsername() + " submitted BusinessTerm [" + processNamePrefix + "---" + businessTerm.getChName() + "] apply, The generated process instance ID: " );
    }

    public void saveProcessRecord(BusinessTerm dto, String processInstanceId) throws Exception {
        DomainProcessRecord processRecord = new DomainProcessRecord();
        processRecord.setItemId(dto.getId().toString());
        processRecord.setItemType(80010077L);
        processRecord.setProcessInstanceId(processInstanceId);
        processRecord.setItemContent(this.objectMapper.writeValueAsString(dto));
        this.domainProcessRecordRepository.save(processRecord);
    }

    public Long generateCopyBusinessTerm(Long nsId, BusinessTermDto toBeUpdate) {

        BusinessTerm publicOldBusinessTerm = businessTermRepository.findAllByIdEquals(nsId);

        //新的一条数据 状态是审核中
        BusinessTerm newBusinessTerm = this.convertToBusinessTerm(toBeUpdate);
        newBusinessTerm.setId(null);
        newBusinessTerm.setFirstPublish(publicOldBusinessTerm.getFirstPublish());
        newBusinessTerm.setState(DomainState.C);
        newBusinessTerm.setVersion(publicOldBusinessTerm.getVersion());
        BusinessTerm save = this.businessTermRepository.save(newBusinessTerm);

        //旧的数据
        publicOldBusinessTerm.setUpdatingNsId(save.getId());
        this.businessTermRepository.save(publicOldBusinessTerm);
        return save.getId();
    }


    private BusinessTerm convertToBusinessTerm(BusinessTermDto toBeUpdate) {
        BusinessTerm businessTerm = new BusinessTerm();
        businessTerm.setId(toBeUpdate.getId());
        businessTerm.setDomainCode(toBeUpdate.getDomainCode());
        businessTerm.setFolderId(toBeUpdate.getFolderId());
        businessTerm.setChName(toBeUpdate.getChName());
        businessTerm.setBusinessTermAliases(toBeUpdate.getBusinessTermAliases());
        businessTerm.setExplanationTerms(toBeUpdate.getExplanationTerms());
        businessTerm.setEnName(toBeUpdate.getEnName());
        businessTerm.setAbbr(toBeUpdate.getAbbr());
        businessTerm.setManagementDepartment(toBeUpdate.getManagementDepartment());
        businessTerm.setReporter(toBeUpdate.getReporter());
        businessTerm.setCategoryId(toBeUpdate.getFolderId());
        businessTerm.setUpdateTime(toBeUpdate.getUpdateTime());
        businessTerm.setFirstPublish(toBeUpdate.getFirstPublish());
        businessTerm.setState(toBeUpdate.getState());
        businessTerm.setSource(toBeUpdate.getSource());
        businessTerm.setExample(toBeUpdate.getExample());
        businessTerm.setRelaId(toBeUpdate.getRelaId());
        businessTerm.setScene(toBeUpdate.getScene());
        businessTerm.setUpdatingNsId(toBeUpdate.getUpdatingNsId());
        businessTerm.setVersion(toBeUpdate.getVersion());
        return businessTerm;

    }


    public void businessTermPublishVerify(BusinessTerm dto) {
        String type = this.msgService.getMessage("process.type.businessTerm");
        if (dto == null) {
            throw new InvalidArgumentException(this.msgService.getMessage("noFindBusinessTerm"));
        } else {
            if (dto.getState().equals(DomainState.C)) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsInAuditing", new Object[]{type}));
            } else if (!dto.getState().equals(DomainState.D) && !dto.getState().equals(DomainState.X)) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsNotInAuditing", new Object[]{type}));
            } else {
                dto.setState(DomainState.C);
                this.businessTermService.updateDomainState(dto, null, AuthTools.currentUsername());
            }
        }
    }

    public void businessTermPublishVerifyDao(List<BusinessTermDto> dtos) {
        String type = this.msgService.getMessage("process.type.businessTerm");
        for (BusinessTermDto dto : dtos) {

            if (dto == null) {
                throw new InvalidArgumentException(this.msgService.getMessage("noFindBusinessTerm"));
            } else {
                if (dto.getState().equals(DomainState.C)) {
                    throw new InvalidArgumentException(this.msgService.getMessage("processIsInAuditing", new Object[]{type}));
                } else if (!dto.getState().equals(DomainState.D) && !dto.getState().equals(DomainState.X)) {
                    throw new InvalidArgumentException(this.msgService.getMessage("processIsNotInAuditing", new Object[]{type}));
                } else {

                }
            }
        }

        for (BusinessTermDto dto : dtos) {
            dto.setState(DomainState.C);
            this.businessTermService.updateDomainState( BusinessTermDto.buildByDao(dto), null, AuthTools.currentUsername());
        }
    }





    @Override
    @Transactional
    public void applyBusinessTermUpdate(BusinessTermDto dto,String username) {
        businessTermService.checkParams(dto);

        BusinessTerm oldBusinessTerm = businessTermRepository.findAllByIdEquals(dto.getId());
        DomainState oldState = oldBusinessTerm.getState();

        this.businessTermUpdateVerify(oldBusinessTerm);

        this.applyProcess(null, oldState, oldBusinessTerm, dto, this.msgService.getMessage("process.update.businessTerm"), "BUSINESS_TERM_UPDATE_SYSTEM_INIT");
    }

    public void businessTermUpdateVerify(BusinessTerm oldDto) {
        if (oldDto == null) {
            throw new InvalidArgumentException(this.msgService.getMessage("noFindBusinessTerm"));
        } else {
            String type = this.msgService.getMessage("process.type.businessTerm");
            if (!oldDto.getState().equals(DomainState.A)) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsNotInPublishing", new Object[]{type}));
            } else if (oldDto.getUpdatingNsId() != null) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsInAuditing", new Object[]{type}));
            }
        }
    }

    @Override
    @Transactional
    public void applyBusinessTermAbolish(Long nsId) {
        BusinessTerm businessTerm = businessTermRepository.findAllByIdEquals(nsId);
        DomainState oldState = businessTerm.getState();
        this.businessTermAbolishVerify(businessTerm);

        BusinessTermDto businessTermDto = businessTermService.queryBusinessTermById(nsId);

        this.applyProcess(null, oldState, businessTerm, businessTermDto, this.msgService.getMessage("process.abandon.businessTerm"), "BUSINESS_TERM_ABOLISH_SYSTEM_INIT");
    }

    @Override
    public void businessTermPublishWorkflowCallBack(WorkflowEventResult eventResult) {

        LOGGER.info("Process flow [" + eventResult.getProcessInstanceId() + "]-[" + eventResult.getProcessInsName()
                + "] Callback Events, The result is[" + eventResult.getProcessResult().getValue() + "]");

        try {
            LOGGER.info("businessTermPublishWorkflowCallBack 获取回调的处理结果:{}", objectMapper.writeValueAsString(eventResult));
        } catch (JsonProcessingException e) {

        }
        //处理回调结果
        Long nsId = Long.valueOf(eventResult.getFormValueMap().get("nsId"));

        String startUser = eventResult.getStartUserId();

        String stateOriginal = eventResult.getFormValueMap().get(DOMAIN_STATE_ORIGINAL);


        ProcessResultType resultType = eventResult.getProcessResult();

        if (ProcessResultType.PASS == resultType) {
            //发布业务术语
            businessTermService.publicBusinessTerm(nsId, startUser, stateOriginal);

        } else if (ProcessResultType.REJECT == resultType
                || ProcessResultType.REVOKE == resultType) {
            //驳回申请或者撤销的逻辑这里是一样的，都是把状态改回待审核
            BusinessTerm newBusinessTerm = this.busTermRepo.findAllByIdEquals(nsId);
            if (DomainState.X.toString().equals(stateOriginal)) {
                // 如果申请发布前状态时已废弃，驳回、撤销后状态还是已废弃
                newBusinessTerm.setState(DomainState.X);
            } else {
                newBusinessTerm.setState(DomainState.D);
            }
            businessTermService.updateDomainState(newBusinessTerm, null, startUser);
        }

    }


    @Override
    public void businessTermUpdateWorkflowCallBack(WorkflowEventResult eventResult) {

        String processInstanceId = eventResult.getProcessInstanceId();
        LOGGER.info("Process flow [" + processInstanceId + "]-[" + eventResult.getProcessInsName() + "] " +
                "callback Events, The result is[" + eventResult.getProcessResult().getValue() + "]");

        try {
            LOGGER.info("businessTermUpdateWorkflowCallBack 获取回调的处理结果:{}", objectMapper.writeValueAsString(eventResult));
        } catch (JsonProcessingException e) {

        }

        //处理回调结果
        Long nsId = Long.valueOf(eventResult.getFormValueMap().get("nsId"));

        String startUser = eventResult.getStartUserId();
        ProcessResultType resultType = eventResult.getProcessResult();

        if (ProcessResultType.PASS == resultType) {
            this.businessTermService.passBusinessTermUpdate(nsId, startUser);
        } else if (ProcessResultType.REJECT == resultType || ProcessResultType.REVOKE == resultType) {
            this.businessTermService.rejectBusinessTermUpdate(nsId, startUser);

        }
    }

    @Override
    public void businessTermAbolishWorkflowCallBack(WorkflowEventResult eventResult) {
        String processInstanceId = eventResult.getProcessInstanceId();
        LOGGER.info("Process flow [" + processInstanceId + "]-[" + eventResult.getProcessInsName() + "] " +
                "callback Events, The result is[" + eventResult.getProcessResult().getValue() + "]");

        try {
            LOGGER.info("businessTermUpdateWorkflowCallBack 获取回调的处理结果:{}", objectMapper.writeValueAsString(eventResult));
        } catch (JsonProcessingException e) {

        }

        //处理回调结果
        Long nsId = Long.valueOf(eventResult.getFormValueMap().get("nsId"));

        String startUser = eventResult.getStartUserId();

        ProcessResultType resultType = eventResult.getProcessResult();

        this.businessTermService.businessTermAbolish(nsId, startUser, resultType);


    }


    public void businessTermAbolishVerify(BusinessTerm dto) {
        if (dto == null) {
            throw new InvalidArgumentException(this.msgService.getMessage("noFindBusinessTerm"));
        } else {
            String type = this.msgService.getMessage("process.type.businessTerm");
            if (!dto.getState().equals(DomainState.A)) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsNotInPublishing", new Object[]{type}));
            } else if (dto.getUpdatingNsId() != null) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsInAuditing", new Object[]{type}));
            }
        }
    }

    @Override
    public BusinessTermDto getProcessBusinessTermDtoDetail(Long nsId, String processInstanceId) throws JsonProcessingException {
        if (StringUtils.isBlank(processInstanceId)) {
            throw new InvalidArgumentException(msgService.getMessage("processInstanceIdIsNull"));
        } else {
            DomainProcessRecord domainProcessRecord;
            if (nsId != null) {
                domainProcessRecord = domainProcessRecordRepository.findFirstByItemIdAndProcessInstanceId(nsId.toString(), processInstanceId);
            } else {
                domainProcessRecord = domainProcessRecordRepository.findFirstByProcessInstanceId(processInstanceId);

            }

            if (domainProcessRecord != null && StringUtils.isNotBlank(domainProcessRecord.getItemContent())) {


                BusinessTerm businessTerm = objectMapper.readValue(domainProcessRecord.getItemContent(), BusinessTerm.class);
                BusinessTermDto businessTermDto = BusinessTermDto.buildBy(businessTerm);
                businessTermService.fillDepartmentName(businessTermDto);
                return businessTermDto;
            } else {
                throw new AndorjRuntimeException(this.msgService.getMessage("auditDataIsNotExist"));
            }
        }
    }

    @Override
    public Long getNsIdByProcessInstanceId(String processInstanceId) {

        DomainProcessRecord domainProcessRecord = domainProcessRecordRepository.findFirstByProcessInstanceId(processInstanceId);
        if (domainProcessRecord != null) {

            Long res = Long.valueOf(domainProcessRecord.getItemId());
            BusinessTerm old = busTermRepo.findAllByIdEquals(Long.valueOf(res));
            return old != null && old.getUpdatingNsId() != null ? old.getUpdatingNsId() : res;

        } else {
            return null;
        }
    }

    @Override
    public void applyBusinessTermAbolishBatch(Set<Long> nsIds, String username) {
        List<Long> tmIds= new ArrayList<>();
        tmIds.addAll(nsIds);
        List<BusinessTermDto> businessTermDtos = businessTermService.queryBusinessTermById(tmIds);
        List<BusinessTerm> businessTerms = busTermRepo.findAllByIdIn(nsIds);
        for (BusinessTerm businessTerm : businessTerms) {
            businessTerm.setState(DomainState.C);
        }
        busTermRepo.saveAll(businessTerms);
        businessTermAbolishVerifyBatch(businessTermDtos);
        List<BatchApplyDto> pubDatas = generateBusinessUpdateApplyDto(null, businessTermDtos, "废弃",username);
        applyService.createBatch(pubDatas);
        // todo 操作记录

    }


    private List<BatchApplyDto> generateBusinessUpdateApplyDto(Long id, List<BusinessTermDto> dtos, String type,String username) {

        String currentUsername = username;
        Date now = new Date();

        List<BatchApplyDto> result = new ArrayList<>();
        Map<String, List<BusinessTermDto>> grouped = dtos.stream()
                .filter(dto -> dto.getPaths() != null && dto.getPaths().size() > 1)
                .collect(Collectors.groupingBy(dto -> dto.getPaths().get(1)));
        grouped.forEach((k,v)->{


            BatchApplyDto batchApplyDto = new BatchApplyDto();
            // 管他数组越不越界
            batchApplyDto.setApplyName(k);
            batchApplyDto.setApplyCreator(currentUsername);
            batchApplyDto.setApplyOperation(type);
            batchApplyDto.setApplyCreateTime(now);
            batchApplyDto.setApplyType("业务术语");
            List<BatchApplyDetailDto> ds = new ArrayList<>();
            for (BusinessTermDto businessTermDto : v) {
                BatchApplyDetailDto detailDto = new BatchApplyDetailDto();
                detailDto.setCode(businessTermDto.getDomainCode());
                detailDto.setApplyType("业务术语");
                detailDto.setCnName(businessTermDto.getChName());
                detailDto.setEnName(businessTermDto.getEnName());
                detailDto.setNeId(String.valueOf(businessTermDto.getId()));
                detailDto.setOldId(String.valueOf(id));
                detailDto.setSubmitUser(currentUsername);
                detailDto.setOrderType(type);
                ds.add(detailDto);
            }
            batchApplyDto.setDetails(ds);
            result.add(batchApplyDto);

        });

        return result ;

    }


    public void businessTermAbolishVerifyBatch(List<BusinessTermDto> dtos) {
        for (BusinessTermDto dto : dtos) {
            if (dto == null) {
                throw new InvalidArgumentException(this.msgService.getMessage("noFindBusinessTerm"));
            } else {
                String type = this.msgService.getMessage("process.type.businessTerm");
                if (!dto.getState().equals(DomainState.A)) {
                    throw new InvalidArgumentException(this.msgService.getMessage("processIsNotInPublishing", new Object[]{type}));
                } else if (dto.getUpdatingNsId() != null) {
                    throw new InvalidArgumentException(this.msgService.getMessage("processIsInAuditing", new Object[]{type}));
                }
            }
        }

    }



}
