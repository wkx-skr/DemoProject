package com.datablau.domain.management.impl;


import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.datablau.data.common.util.JsonUtils;
import com.datablau.domain.management.api.ApplyService;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.DomainProcessRecord;
import com.datablau.domain.management.jpa.entity.StandardCode;
import com.datablau.domain.management.jpa.entity.StandardCodeSource;
import com.datablau.domain.management.jpa.repository.DomainRepository;
import com.datablau.domain.management.jpa.repository.DomainRepositoryExt;
import com.datablau.domain.management.jpa.repository.StandardCodeRepository;
import com.datablau.domain.management.jpa.repository.StandardCodeSourceRepository;
import com.datablau.security.management.utils.AuthTools;
import com.datablau.workflow.common.entity.dto.WorkflowEventResult;
import com.datablau.workflow.common.entity.dto.WorkflowFormDto;
import com.datablau.workflow.common.entity.dto.query.WorkflowApplyQueryDto;
import com.datablau.workflow.common.entity.type.ProcessResultType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang.StringUtils;
import org.elasticsearch.common.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service("domainProcessServiceExt")
public class DomainProcessServiceExt extends DomainProcessServiceImpl {
    private static final Logger LOGGER = LoggerFactory.getLogger(DomainProcessServiceExt.class);


    @Autowired
    private DomainService domainService;

    @Autowired
    private DomainExtServiceImpl domainExtService;
    @Autowired
    private ApplyService applyService;
    @Autowired
    private StandardCodeRepository standardCodeRepo;
    @Autowired
    private DomainRepository domainRepo;
    @Autowired
    private DomainRepositoryExt domainRepositoryExt;

    @Autowired
    private StandardCodeSourceRepository standardCodeSourceRepo;

    public DomainDto getProcessDomainDetail(String domainId, String processInstanceId) throws JsonProcessingException {
        if (Strings.isNullOrEmpty(processInstanceId)) {
            throw new InvalidArgumentException(this.msgService.getMessage("processInstanceIdIsNull"));
        } else {
            DomainProcessRecord domainProcessRecord;
            if (!Strings.isNullOrEmpty(domainId)) {
                domainProcessRecord = this.domainProcessRecordRepository.findFirstByItemIdAndProcessInstanceId(domainId, processInstanceId);
            } else {
                domainProcessRecord = this.domainProcessRecordRepository.findFirstByProcessInstanceId(processInstanceId);
            }

            if (domainProcessRecord != null && !Strings.isNullOrEmpty(domainProcessRecord.getItemContent())) {
                return this.objectMapper.readValue(domainProcessRecord.getItemContent(), DomainExtDto.class);
            } else {
                throw new AndorjRuntimeException(this.msgService.getMessage("auditDataIsNotExist"));
            }
        }
    }
    public void standardPublishVerify(StandardCodeDto standardCodeDto) {
        String type = this.msgService.getMessage("process.type.code");
        if (standardCodeDto == null) {
            throw new InvalidArgumentException(this.msgService.getMessage("noFindCodeStandard"));
        } else {
            type = this.getStandTypeNameByCategoryId(standardCodeDto.getCategoryId());
            /*if (standardCodeDto.getState().equals(DomainState.C)) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsInAuditing", new Object[]{type}));
            } else */if (!standardCodeDto.getState().equals(DomainState.D) && !standardCodeDto.getState().equals(DomainState.X)) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsNotInAuditing", new Object[]{type}));
            } else {
                standardCodeDto.setState(DomainState.C);
                this.domainService.updateStandardState(standardCodeDto, (String)null, AuthTools.currentUsername());
            }
        }
    }
    public void standardUpdateVerify(StandardCodeDto oldDto, StandardCodeDto newDto) {
        if (oldDto == null) {
            throw new InvalidArgumentException(this.msgService.getMessage("noFindCodeStandard"));
        } else {
            String type = this.getStandTypeNameByCategoryId(oldDto.getCategoryId());
            /*if (!oldDto.getState().equals(DomainState.A)) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsNotInPublishing", new Object[]{type}));
            } else */if (!Strings.isNullOrEmpty(oldDto.getUpdatingCode())) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsInAuditing", new Object[]{type}));
            } else if (!StringUtils.isEmpty(oldDto.getUpdatingCode())) {
                throw new InvalidArgumentException(this.msgService.getMessage("processPublishFailed", new Object[]{type}));
            }
        }
    }
    public void standardAbolishVerify(StandardCodeDto dto) {
        if (dto == null) {
            throw new InvalidArgumentException(this.msgService.getMessage("noFindCodeStandard"));
        } else {
            String type = this.getStandTypeNameByCategoryId(dto.getCategoryId());
            /*if (!dto.getState().equals(DomainState.A)) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsNotInPublishing", new Object[]{type}));
            } else */if (!Strings.isNullOrEmpty(dto.getUpdatingCode())) {
                throw new InvalidArgumentException(this.msgService.getMessage("processIsInAuditing", new Object[]{type}));
            }
        }
    }

    @Transactional
    public void applyStandardCodePublish(String domainId, String realCode) {

        StandardCodeDto dto = this.domainService.getCodeByCodeNumber(realCode, (Long)null);
        dto.setStateOriginal(dto.getState());
        this.standardPublishVerify(dto);
        this.domainService.getCodeSource(realCode);
        if (dto.getCategoryId() == 1L) {
            this.applyDomainPublishForStandardCode(domainId, dto, null);
        } else {
            this.applyProcess((StandardCodeDto)dto, (StandardCodeDto)null, this.msgService.getMessage("process.publish.domainCode"), "TERRITORY_STANDARD_PUBLISH_SYSTEM_INIT");
        }
    }

    @Transactional
    public void applyStandardCodeUpdate(String domainId, StandardCodeDto dto) {
        StandardCodeDto oldDto = this.domainService.getCodeByCodeNumber(dto.getRealCode(), (Long)null);
        this.standardUpdateVerify(oldDto, dto);
        if (oldDto.getCategoryId() == 1L) {
//            DomainExtDto domainExtDto = domainExtService.getDomainById(domainId);
            this.applyDomainUpdateForStandardCode(domainId, oldDto, dto);
        } else {
            this.applyProcess(oldDto, dto, this.msgService.getMessage("process.update.domainCode"), "TERRITORY_STANDARD_UPDATE_SYSTEM_INIT");
        }
    }

    @Transactional
    public void applyStandardCodeAbolish(String domainId, String realCode) {
        StandardCodeDto dto = this.domainService.getCodeByCodeNumber(realCode, (Long)null);
        this.standardAbolishVerify(dto);
        if (dto.getCategoryId() == 1L) {
            this.applyDomainAbolishForStandardCode(domainId, dto, dto);
        } else {
            this.applyProcess(dto, dto, this.msgService.getMessage("process.abandon.domainCode"), "TERRITORY_STANDARD_ABOLISH_SYSTEM_INIT");
        }
    }

    private void applyDomainPublishForStandardCode(String domainId, StandardCodeDto dto, StandardCodeDto newDto) {
        DomainExtDto domain = this.domainExtService.getDomainById(domainId);
        domain.setStateOriginal(domain.getState());
        this.domainPublishVerify(domain);
        this.applyProcessWithStandardCode(this.msgService.getMessage("process.publish.code"), "STANDARD_PUBLISH_SYSTEM_INIT", dto, newDto, domainId, domain);
    }
    private void applyDomainUpdateForStandardCode(String domainId, StandardCodeDto dto, StandardCodeDto newDto) {
        DomainExtDto domain = this.domainExtService.getDomainById(domainId);
        this.domainUpdateVerify(domain, domain);
        this.applyProcessWithStandardCode(this.msgService.getMessage("process.update.code"), "STANDARD_UPDATE_SYSTEM_INIT", dto, newDto, domainId, domain);
    }
    private void applyDomainAbolishForStandardCode(String domainId, StandardCodeDto dto, StandardCodeDto newDto) {
        DomainExtDto domain = this.domainExtService.getDomainById(domainId);
        this.domainAbolishVerify(domain);
        this.applyProcessWithStandardCode(this.msgService.getMessage("process.abandon.code"), "STANDARD_ABOLISH_SYSTEM_INIT", dto, newDto, domainId, domain);

    }

    private void applyProcessWithStandardCode(String processNamePrefix, String processCode, StandardCodeDto dto, StandardCodeDto newDto, String domainId, DomainExtDto domainExtDto) {
        List<WorkflowFormDto> formDtoList = new ArrayList();
        formDtoList.add(new WorkflowFormDto("startUserId", AuthTools.currentUsername()));
        formDtoList.add(new WorkflowFormDto("processInstanceName", processNamePrefix + "---" + dto.getName()));
        formDtoList.add(new WorkflowFormDto("formDetailUrl", "http://localhost/fdafda"));
        formDtoList.add(new WorkflowFormDto("stdCode", dto.getRealCode()));
        formDtoList.add(new WorkflowFormDto("domainId", domainId));
        formDtoList.add(new WorkflowFormDto("standardCategoryId", dto.getCategoryId().toString()));
        if (dto.getStateOriginal() != null) {
            formDtoList.add(new WorkflowFormDto("standardStateOriginal", dto.getStateOriginal().toString()));
        }

        WorkflowApplyQueryDto queryDto = new WorkflowApplyQueryDto();
        queryDto.setProcessCode(processCode);
        queryDto.setFormDefs(formDtoList);
  //      String processInstanceId = this.workflowService.applyProcess(queryDto);

        try {
            if (!processCode.contains("PUBLISH")) {
                StandardCodeSourceDto codeSource = this.domainService.getCodeSource(dto.getCode());
                if (!Objects.isNull(codeSource) && codeSource.getJobId() != null) {
                    this.domainService.generateCopyStandardWithSource(dto.getCode(), AuthTools.currentUsername(), newDto);
                } else {
                    this.domainService.generateCopyStandard(dto.getCode(), newDto);
                }
                this.domainService.generateCopyDomain(domainId, domainExtDto,newDto);

             //   this.saveStandardProcessRecord(newDto, processInstanceId);
            } else {
             //   this.saveStandardProcessRecord(newDto == null ? dto : newDto, processInstanceId);
            }
        } catch (Exception var9) {
         //   this.workflowService.deleteProcessInstance(processInstanceId);
            throw new AndorjRuntimeException(this.msgService.getMessage("saveFailed"), var9);
        }

        String var10001 = AuthTools.currentUsername();
      //  LOGGER.info(var10001 + " submitted standard code[" + dto.getName() + "] apply, The generated process instance ID: " + processInstanceId);
    }

    @Transactional
    public void applyDomainUpdate(DomainExtDto newDomain) {
        /*重写源码，当标准变更时，需要包含ext的信息*/
        DomainExtDto oldDomain = this.domainExtService.getDomainById(newDomain.getDomainId());
        this.domainUpdateVerify(oldDomain, newDomain);
        if (oldDomain.getCategoryId() == 1L) {
            // 数据标准更新时不再走apply方法
          //  this.applyProcess(oldDomain, newDomain, this.msgService.getMessage("process.update.dataStandard"), "DOMAIN_UPDATE_SYSTEM_INIT");
            // 这里直接走直接check完 直接走 生成copy方法； 然后去生成 批次单
            domainService.generateCopyDomain(oldDomain.getDomainId(), newDomain, null);
        } else if (oldDomain.getCategoryId() == 2L) {
            this.applyProcess(oldDomain, newDomain, this.msgService.getMessage("process.update.index"), "METRIC_UPDATE_SYSTEM_INIT");
        } else {
            this.applyProcess(oldDomain, newDomain, this.msgService.getMessage("process.update.domain"), "TERRITORY_DOMAIN_UPDATE_SYSTEM_INIT");
        }

    }

    @Transactional
    public void standardCodePublishCallback(WorkflowEventResult eventResult) {
        String domainId = eventResult.getFormValueMap().getOrDefault("domainId", "");
        if(StringUtils.isNotEmpty(domainId)) {
            this.domainPublishCallbackForStandardCode(eventResult);
        } else {
            super.standardCodePublishCallback(eventResult);
        }
    }

    @Transactional
    public void standardCodeAbolishCallback(WorkflowEventResult eventResult) {
        String domainId = eventResult.getFormValueMap().getOrDefault("domainId", "");
        if(StringUtils.isNotEmpty(domainId)) {
            this.domainAbolishCallbackForStandardCode(eventResult);
        } else {
            super.standardCodeAbolishCallback(eventResult);
        }
    }

    @Transactional
    public void standardCodeUpdateCallback(WorkflowEventResult eventResult) {
        String domainId = eventResult.getFormValueMap().getOrDefault("domainId", "");
        if(StringUtils.isNotEmpty(domainId)) {
            this.domainUpdateCallbackForStandardCode(eventResult);
        } else {
            super.standardCodeUpdateCallback(eventResult);
        }
    }

    private void domainPublishCallbackForStandardCode(WorkflowEventResult eventResult) {
        // 处理标准
        String var10001 = eventResult.getProcessInstanceId();
        LOGGER.info("Process flow [" + var10001 + "]-[" + eventResult.getProcessInsName() + "] Callback Events, The result is[" + eventResult.getProcessResult().getValue() + "]");
        String domainId = (String)eventResult.getFormValueMap().get("domainId");
        String startUser = eventResult.getStartUserId();
        String stateOriginal = (String)eventResult.getFormValueMap().get("domainStateOriginal");
        ProcessResultType resultType = eventResult.getProcessResult();
        if (ProcessResultType.PASS == resultType) {
            this.domainService.publicDomain(domainId, startUser, stateOriginal);
        } else if (ProcessResultType.REJECT == resultType || ProcessResultType.REVOKE == resultType) {
            DomainDto domain = this.domainService.getDomainByDomainId(domainId);
            if (DomainState.X.toString().equals(stateOriginal)) {
                domain.setState(DomainState.X);
            } else {
                domain.setState(DomainState.D);
            }
            this.domainService.updateDomainState(domain, (String)null, startUser);
        }

        // 处理参考数据
        LOGGER.info("Process flow [" + var10001 + "]-[" + eventResult.getProcessInsName() + "]callback events, The result is[" + eventResult.getProcessResult().getValue() + "]");
        String id = (String)eventResult.getFormValueMap().get("stdCode");
        if (ProcessResultType.PASS == resultType) {
            this.domainService.publicStandard(id, startUser, stateOriginal);
        } else if (ProcessResultType.REJECT == resultType || ProcessResultType.REVOKE == resultType) {
            StandardCodeDto dto = this.domainService.getCodeByCodeNumber(id, (Long)null);
            if (DomainState.X.toString().equals(stateOriginal)) {
                dto.setState(DomainState.X);
            } else {
                dto.setState(DomainState.D);
            }
            this.domainService.updateStandardState(dto, (String)null, startUser);
        }

    }

    private void domainUpdateCallbackForStandardCode(WorkflowEventResult eventResult) {
        String var10001 = eventResult.getProcessInstanceId();
        LOGGER.info("Process flow [" + var10001 + "]-[" + eventResult.getProcessInsName() + "] callback Events, The result is[" + eventResult.getProcessResult().getValue() + "]");
        String domainId = (String)eventResult.getFormValueMap().get("domainId");
        String startUser = eventResult.getStartUserId();
        ProcessResultType resultType = eventResult.getProcessResult();
        if (ProcessResultType.PASS == resultType) {
            this.domainService.deleteCopyDomain(domainId, true, startUser);
        } else if (ProcessResultType.REJECT == resultType || ProcessResultType.REVOKE == resultType) {
            DomainDto domain = this.domainService.getDomainByDomainId(domainId);
            this.domainService.deleteCopyDomain(domainId, false, startUser);
            domain.setState(DomainState.A);
            this.domainService.updateDomainState(domain, (String)null, startUser);
        }


        LOGGER.info("Process flow [" + var10001 + "]-[" + eventResult.getProcessInsName() + "]callback events, The result is[" + eventResult.getProcessResult().getValue() + "]");
        String code = (String)eventResult.getFormValueMap().get("stdCode");
        if (ProcessResultType.PASS == resultType) {
            StandardCodeSourceDto codeSource = this.domainService.getCodeSource(code);
            if (Objects.nonNull(codeSource)) {
                if (Objects.nonNull(codeSource.getJobId())) {
                    StandardCodeSourceDto codeSourceC = this.domainService.getCodeSource(code + "+++");
                    if (codeSourceC != null) {
                        codeSourceC.setJobId(codeSource.getJobId());
                        codeSource = codeSourceC;
                    }

                    this.domainService.updateCodeSource(codeSource, startUser, false);
                } else if (StringUtils.isNotEmpty(codeSource.getJobName())) {
                    this.domainService.releaseCodeSource(codeSource, startUser);
                }
            }

            if (Boolean.TRUE.equals(codeSource.getCleanSource())) {
                this.domainService.deleteCodeSource(code, codeSource.getJobId());
            }

            this.domainService.deleteCopyStandard(code, true, startUser);
        } else if (ProcessResultType.REJECT == resultType || ProcessResultType.REVOKE == resultType) {
            StandardCodeDto dto = this.domainService.getCodeByCodeNumber(code, (Long)null);
            this.domainService.deleteCopyStandard(code, false, startUser);
            dto.setState(DomainState.A);
            this.domainService.updateStandardState(dto, (String)null, startUser);
        }

    }

    private void domainAbolishCallbackForStandardCode(WorkflowEventResult eventResult) {

        // 处理标准
        String var10001 = eventResult.getProcessInstanceId();
        LOGGER.info("Process flow [" + var10001 + "]-[" + eventResult.getProcessInsName() + "] callback events, The result is [" + eventResult.getProcessResult().getValue() + "]");
        String domainId = (String)eventResult.getFormValueMap().get("domainId");
        String startUser = eventResult.getStartUserId();
        ProcessResultType resultType = eventResult.getProcessResult();
        this.domainService.deleteCopyDomain(domainId, false, startUser);
        DomainDto domain = this.domainService.getDomainByDomainId(domainId);
        if (ProcessResultType.PASS == resultType) {
            domain.setLastReview(new Date());
            domain.setState(DomainState.X);
        } else if (ProcessResultType.REJECT == resultType || ProcessResultType.REVOKE == resultType) {
            domain.setState(DomainState.A);
        }

        this.domainService.updateDomainState(domain, (String)null, startUser);

        // 处理参考数据
        LOGGER.info("Process flow [" + var10001 + "]-[" + eventResult.getProcessInsName() + "]callback events, The result is[" + eventResult.getProcessResult().getValue() + "]");
        String code = (String)eventResult.getFormValueMap().get("stdCode");
        this.domainService.deleteCopyStandard(code, false, startUser);
        StandardCodeDto dto = this.domainService.getCodeByCodeNumber(code, (Long)null);
        if (ProcessResultType.PASS == resultType) {
            dto.setState(DomainState.X);
        } else if (ProcessResultType.REJECT == resultType || ProcessResultType.REVOKE == resultType) {
            dto.setState(DomainState.A);
        }

        this.domainService.updateStandardState(dto, (String)null, startUser);
    }


    @Transactional
    public void applyDomainPublishBatch(List<String> domainId ,String username) {
        List<DomainDto> domainsByIds = domainService.getDomainsByIds(domainId);
        // 获取对应的refencoCode 并设置为审核中
        Map<String , DomainDto> neDomainMap = new HashMap<>();
        for (DomainDto domainsById : domainsByIds) {
            domainsById.setStateOriginal(domainsById.getState());
            neDomainMap.put(domainsById.getDomainId(),domainsById);
        }
        this.domainPublishVerifyBatch(domainsByIds);
        // 由于发布的时候会出现导入的数据 所以这里要进行分开处理
        List<Domain> byUpdatingDomainIdIn = domainRepositoryExt.findByUpdatingDomainIdIn(neDomainMap.keySet());
        List<DomainDto> pubData = new ArrayList<>();
        Map<String,Domain> updateData = new HashMap<>();
        if (!CollectionUtils.isEmpty(byUpdatingDomainIdIn)){
            // 如果不为空那么说明有一部分需要走变更逻辑
            Map<String, Domain> updateDomainMap = byUpdatingDomainIdIn.stream()
                    .collect(Collectors.toMap(
                            Domain::getUpdatingDomainId,
                            Function.identity(),
                            (existing, replacement) -> existing // 选择保留已存在的值
                    ));
            for (DomainDto domainsById : domainsByIds) {
                if (updateDomainMap.containsKey(domainsById.getDomainId())){
                    // 变更
                    updateData.put(domainsById.getDomainId(), updateDomainMap.get(domainsById.getDomainId()));
                }else {
                    pubData.add(domainsById);
                }
            }
        }else {
            pubData.addAll(domainsByIds);
        }
        if (!CollectionUtils.isEmpty(pubData)) {
            List<BatchApplyDto> datas = generalDomainBatch(pubData, "发布", username);
            applyService.createBatch(datas);
        }
        if (!CollectionUtils.isEmpty(updateData)){
            // 变更逻辑 这里看情况考虑下要不要进行业务域的区分
            List<BatchApplyDto> updateBatchDtos = new ArrayList<>();
            updateData.forEach((k,v)->{
                BatchApplyDto batchApplyDto = generateUpdateApplyDto(updateData.get(k), neDomainMap.get(k), null);
                updateBatchDtos.add(batchApplyDto);
            });
            // 按照业务域分组 然后创建
            Map<String, List<BatchApplyDto>> collect = updateBatchDtos.stream().collect(Collectors.groupingBy(BatchApplyDto::getApplyName));
            collect.forEach((k,v)->{
                // 说明这个同一个业务域下面的数据
                BatchApplyDto bt = new BatchApplyDto();
                List<BatchApplyDetailDto> details = new ArrayList<>();
                for (BatchApplyDto batchApplyDto : v) {
                    BeanUtils.copyProperties(batchApplyDto,bt);
                    details.addAll(batchApplyDto.getDetails());
                }
                bt.setDetails(new ArrayList<>());
                bt.setDetails(details);
                applyService.create(bt);
                    }
            );
        }


        // 避免影响其他流程 todo

//        if (domain.getCategoryId() == 1L) {
//            this.applyProcess((DomainDto)domain, (DomainDto)null, this.msgService.getMessage("process.publish.dataStandard"), "DOMAIN_PUBLISH_SYSTEM_INIT");
//        } else if (domain.getCategoryId() == 2L) {
//            this.applyProcess((DomainDto)domain, (DomainDto)null, this.msgService.getMessage("process.publish.index"), "METRIC_PUBLISH_SYSTEM_INIT");
//        } else {
//            this.applyProcess((DomainDto)domain, (DomainDto)null, this.msgService.getMessage("process.publish.domain"), "TERRITORY_DOMAIN_PUBLISH_SYSTEM_INIT");
//        }

    }

    private List<BatchApplyDto>  generalDomainBatch(List<DomainDto> domainsByIds, String type,String username) {

        String currentUsername = username;
        Date now = new Date();

        List<BatchApplyDto> result = new ArrayList<>();
        Map<String, List<DomainDto>> collect = domainsByIds.stream()
                .filter(dto -> dto.getPath() != null && dto.getPath().size() > 1)
                .collect(Collectors.groupingBy(dto -> dto.getPath().get(1)));
        Set<String> standCodes = domainsByIds.stream().filter(da->ObjectUtils.isEmpty(da.getRefDomainCode())).map(DomainDto::getReferenceCode).collect(Collectors.toSet());
        // 将标准代码设置为审核中

        collect.forEach((k,v)->{
            BatchApplyDto batchApplyDto = new BatchApplyDto();
            // 管他数组越不越界
            batchApplyDto.setApplyName(k);
            batchApplyDto.setApplyCreator(currentUsername);
            batchApplyDto.setApplyOperation(type);
            batchApplyDto.setApplyCreateTime(now);
            batchApplyDto.setApplyType("标准数据元");
            List<BatchApplyDetailDto> ds = new ArrayList<>();
            for (DomainDto businessTermDto : v) {
                BatchApplyDetailDto detailDto = new BatchApplyDetailDto();
                detailDto.setCode(businessTermDto.getDomainCode());
                detailDto.setApplyType("标准数据元");
                detailDto.setCnName(businessTermDto.getChineseName());
                detailDto.setEnName(businessTermDto.getEnglishName());
                detailDto.setNeId(String.valueOf(businessTermDto.getDomainId()));
              //  detailDto.setOldId(String.valueOf());
                detailDto.setSubmitUser(currentUsername);
                detailDto.setOrderType(type);
                detailDto.setDomainCode(businessTermDto.getReferenceCode());
                ds.add(detailDto);
            }
            batchApplyDto.setDetails(ds);
            result.add(batchApplyDto);

        });
        if (!CollectionUtils.isEmpty(standCodes)){
            List<StandardCode> byCodeIn = standardCodeRepo.findByCodeIn(standCodes);
            byCodeIn.forEach(e->{
                e.setState(DomainState.C);
            });
            standardCodeRepo.saveAll(byCodeIn);
        }

        return result ;


    }


    public void domainPublishVerifyBatch(List<DomainDto> domains) {
        String type = this.msgService.getMessage("process.type.dataStandard");
        for (DomainDto domain : domains) {
            if (domain == null) {
                throw new InvalidArgumentException(this.msgService.getMessage("standardNotFound", new Object[]{type}));
            } else {
                type = this.getTypeNameByCategoryId(domain.getCategoryId());
                if (domain.getState().equals(DomainState.C)) {
                    throw new InvalidArgumentException(this.msgService.getMessage("processIsInAuditing", new Object[]{type}));
                } else if (!domain.getState().equals(DomainState.D) && !domain.getState().equals(DomainState.X)) {
                    throw new InvalidArgumentException(this.msgService.getMessage("processIsNotInAuditing", new Object[]{type}));
                } else {

                }
            }
        }
        for (DomainDto domain : domains) {
            domain.setState(DomainState.C);
            this.domainService.updateDomainState(domain, (String)null, AuthTools.currentUsername());
        }


    }



    public void applyDomainAbolishBatch(List<String> domainId,String username) {
        //DomainDto domain = this.domainService.getDomainByDomainId(domainId);
        List<DomainDto> domainsByDomainIds = domainService.getDomainsByDomainIds(domainId);
        // 由于check 没有对数据库操作 所以可以直接for循环check
        for (DomainDto domainsByDomainId : domainsByDomainIds) {
            this.domainAbolishVerify(domainsByDomainId);
        }
        // 如果没有问题 将对应标准修改为审核中
        List<Domain> allByDomainIdIn = domainRepo.findAllByDomainIdIn(domainId);
        for (Domain domain : allByDomainIdIn) {
            domain.setState(DomainState.C);
        }
        domainRepo.saveAll(allByDomainIdIn);
        List<BatchApplyDto> datas = generalDomainBatch(domainsByDomainIds, "废弃",username);
        applyService.createBatch(datas);

//        DomainDto oldDomainAfterUpdate = this.domainService.getDomainByDomainId(domainId);
//        if (domain.getCategoryId() == 1L) {
//            this.applyProcess(oldDomainAfterUpdate, domain, this.msgService.getMessage("process.abandon.dataStandard"), "DOMAIN_ABOLISH_SYSTEM_INIT");
//        } else if (domain.getCategoryId() == 2L) {
//            this.applyProcess(oldDomainAfterUpdate, domain, this.msgService.getMessage("process.abandon.index"), "METRIC_ABOLISH_SYSTEM_INIT");
//        } else {
//            this.applyProcess(oldDomainAfterUpdate, domain, this.msgService.getMessage("process.abandon.domain"), "TERRITORY_DOMAIN_ABOLISH_SYSTEM_INIT");
//        }

    }



    private BatchApplyDto generateUpdateApplyDto(Domain publicOldDomain, DomainDto toBeUpdate, StandardCodeDto dto) {
        String batchName = toBeUpdate.getPath().get(1);
        BatchApplyDto batchApplyDto = new BatchApplyDto();
        batchApplyDto.setApplyName(batchName);
        String currentUsername = AuthTools.currentUsername();
        batchApplyDto.setApplyCreator(currentUsername);
        batchApplyDto.setApplyOperation("变更");
        batchApplyDto.setApplyType("标准数据元");
        batchApplyDto.setApplyCreateTime(new Date());
        List<BatchApplyDetailDto> dtos = new ArrayList<>();
        BatchApplyDetailDto batchApplyDetailDto = new BatchApplyDetailDto();
        batchApplyDetailDto.setCode(toBeUpdate.getDomainCode());
        batchApplyDetailDto.setApplyType("标准数据元");
        batchApplyDetailDto.setCnName(toBeUpdate.getChineseName());
        batchApplyDetailDto.setEnName(toBeUpdate.getEnglishName());
        batchApplyDetailDto.setNeId(toBeUpdate.getDomainId());
        batchApplyDetailDto.setOldId(publicOldDomain.getDomainId());
        batchApplyDetailDto.setSubmitUser(currentUsername);
        batchApplyDetailDto.setOrderType("变更");
        batchApplyDetailDto.setDomainCode(toBeUpdate.getRefDomainCode());
        if (!org.springframework.util.ObjectUtils.isEmpty(toBeUpdate.getRefDomainCode()) && !org.springframework.util.ObjectUtils.isEmpty(dto)){
            // 由于是变更这里可以不动 感觉这里不对劲 todo。虽然是抄的代码
            StandardCodeSourceDto codeSource =convertCodeSource(standardCodeSourceRepo.findById(toBeUpdate.getRefDomainCode()));
            if (codeSource != null) {
                if (dto.getJobId() == null) {
                    dto.setJobId(codeSource.getJobId());
                }

                if (!StringUtils.isEmpty(dto.getJobName())) {
                }

                if (StringUtils.isEmpty(dto.getJobName())) {
                    dto.setBusinessId(codeSource.getCategoryId());
                    dto.setBusinessName(codeSource.getCategoryName());
                    dto.setCode(codeSource.getCode());
                    dto.setModelId(codeSource.getModelId());
                    dto.setModelName(codeSource.getModelName());
                    dto.setSchema(codeSource.getSchema());
                    dto.setObjectId(codeSource.getObjectId());
                    dto.setObjectName(codeSource.getObjectName());
                    dto.setCodeFieldId(codeSource.getCodeFieldId());
                    dto.setCodeField(codeSource.getCodeField());
                    dto.setCodeChineseFieldId(codeSource.getCodeChineseFieldId());
                    dto.setCodeChineseField(codeSource.getCodeChineseField());
                    dto.setParentValueId(codeSource.getParentValueId());
                    dto.setParentValue(codeSource.getParentValue());
                    dto.setSql(codeSource.getSql());
                    dto.setJobId(codeSource.getJobId());
                    dto.setSchedule(codeSource.getSchedule());
                    dto.setConditionList(codeSource.getConditionList());
                    dto.setAuthDimensionId(codeSource.getAuthDimensionId());
                    dto.setAuthDimension(codeSource.getAuthDimension());
                    dto.setDbType(codeSource.getDbType());
                    dto.setDatasourceId(codeSource.getDatasourceId());
                    dto.setJobName(codeSource.getJobName());
                    dto.setSchedule(codeSource.getSchedule());
                    dto.setTypeName(codeSource.getTypeName());
                    dto.setColMap(codeSource.getColMap());
                }
            }
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                batchApplyDetailDto.setNeData(objectMapper.writeValueAsString(dto));
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }


        dtos.add(batchApplyDetailDto);
        batchApplyDto.setDetails(dtos);

        return batchApplyDto;
    }



    private StandardCodeSourceDto convertCodeSource(Optional<StandardCodeSource> standardCodeSource) {
        StandardCodeSourceDto dto = new StandardCodeSourceDto();
        if (standardCodeSource.isPresent()) {
            StandardCodeSource codeSource = standardCodeSource.get();
            dto.setBusinessId(codeSource.getCategoryId());
            dto.setBusinessName(codeSource.getCategoryName());
            dto.setCode(codeSource.getCode());
            dto.setModelId(codeSource.getModelId());
            dto.setModelName(codeSource.getModelName());
            dto.setSchema(codeSource.getSchema());
            dto.setObjectId(codeSource.getObjectId());
            dto.setObjectName(codeSource.getObjectName());
            dto.setCodeFieldId(codeSource.getCodeFieldId());
            dto.setCodeField(codeSource.getCodeField());
            dto.setCodeChineseFieldId(codeSource.getCodeChineseFieldId());
            dto.setCodeChineseField(codeSource.getCodeChineseField());
            dto.setParentValueId(codeSource.getParentValueId());
            dto.setParentValue(codeSource.getParentValue());
            dto.setSql(codeSource.getSqlContext());
            dto.setJobId(codeSource.getJobId());
            dto.setSchedule(codeSource.getSchedule());
            dto.setConditionList(JsonUtils.toObjectList(codeSource.getConditionList(), SqlConditionDto.class));
            dto.setAuthDimensionId(codeSource.getAuthDimensionId());
            dto.setAuthDimension(codeSource.getAuthDimension());
            dto.setDbType(codeSource.getDbType());
            dto.setDatasourceId(codeSource.getDatasourceId());
            dto.setJobName(codeSource.getJobName());
            dto.setSchedule(codeSource.getSchedule());
            dto.setTypeName(codeSource.getTypeName());
            dto.setColMap(JsonUtils.toObject(codeSource.getColMap(), new TypeReference<Map>() {}));
        }
        return dto;

    }



}
