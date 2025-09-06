package com.datablau.domain.management.impl;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.api.DomainSimilarityCheckService;
import com.datablau.domain.management.constants.DomainCheckState;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.jpa.entity.*;
import com.datablau.domain.management.jpa.repository.*;
import com.datablau.domain.management.utils.JsonUtils;
import com.datablau.security.management.api.OrganizationService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;


@Service
public class DomainSimilarityCheckServiceImpl implements DomainSimilarityCheckService {

    @Autowired
    private DomainSimilarityCheckResultRepository domainSimilarityCheckResultRepo;

    @Autowired
    private DomainSimilarityCheckResultDetailRepository domainSimilarityCheckResultDetailRepo;

    @Autowired
    private DomainExtRepository domainExtRepo;

    @Autowired
    private DomainFolderExtService domainFolderExtService;

    @Autowired
    private DomainRepository domainRepo;

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private SkipReasonRepository skipReasonRepository;

//    private DomainSimilarityCheckJob job;

    /*@PostConstruct
    public void init () {
        DatablauJobDescriptor descriptor = new DatablauJobDescriptor();
        JobParameter jobParameter = new JobParameter();
        jobParameter.setParameterName("threshold");
        jobParameter.setValue("0.7");
        JobParameter jobParameter1 = new JobParameter();
        jobParameter1.setValue("10");
        jobParameter1.setParameterName("groupCount");

        descriptor.setParameters(Arrays.asList(jobParameter, jobParameter1));
        job = new DomainSimilarityCheckJob(descriptor);
    }*/


    @Override
    @Transactional
    public boolean deleteAll() {
        this.domainSimilarityCheckResultRepo.deleteAll();
        this.domainSimilarityCheckResultDetailRepo.deleteAll();
        return true;
    }

    @Override
    @Transactional
    public boolean refreshCheckState(Set<String> domainIds, List<Domain> domains) {
        List<DomainExt> oldDatas = new ArrayList<>();
        List<String> oldDomainIds = new ArrayList<>();
        this.domainExtRepo.findAll().forEach(domainExt -> {
            oldDatas.add(domainExt);
            oldDomainIds.add(domainExt.getdId());
        });
        // 新增数据(domain_ext表中没有信息的，应该不是有)
        Set<String> newDomainIds = domainIds.stream().filter(domainId -> !oldDomainIds.contains(domainId)).collect(Collectors.toSet());
        if (!CollectionUtils.isEmpty(newDomainIds)) {
            List<DomainExt> newDatas = new ArrayList<>();
            newDomainIds.forEach(domainId -> {
                DomainExt domainExt = new DomainExt();
                domainExt.setdId(domainId);
                domainExt.setCheckState(DomainCheckState.UNPASS);
                newDatas.add(domainExt);
            });
            domainExtRepo.saveAll(newDatas);
        }
        // 更新数据
        List<DomainExt> updateDatas = new ArrayList<>();
        // 所有 set checkState = UNPASS where (checkState = 'UNCHECK' or (checkState = 'PASS' and state = '待审核')) and domainId in (ids)
        for (DomainExt oldData : oldDatas) {
            if(!domainIds.contains(oldData.getdId())) {
                continue;
            }
            if (oldData.getCheckState() == null || oldData.getCheckState() == DomainCheckState.UNCHECK) {
                oldData.setCheckState(DomainCheckState.UNPASS);
                updateDatas.add(oldData);
            }
            if(oldData.getCheckState() == DomainCheckState.PASS) {
                Domain tmpDomainDto = domains.stream().filter(domainDto -> domainDto.getDomainId().equals(oldData.getdId())).findFirst().get();
                if(tmpDomainDto.getState() == DomainState.D) {
                    oldData.setCheckState(DomainCheckState.UNPASS);
                    updateDatas.add(oldData);
                }
            }
        }
        // 所有 set checkState = PASS where checkState in (UNCHECK, UNPASS) and domainId not in (ids)
        for (DomainExt oldData : oldDatas) {
            if(!domainIds.contains(oldData.getdId())) {
                if (oldData.getCheckState() == DomainCheckState.UNCHECK || oldData.getCheckState() == DomainCheckState.UNPASS) {
                    oldData.setCheckState(DomainCheckState.PASS);
                    updateDatas.add(oldData);
                }
            }
        }
        domainExtRepo.saveAll(updateDatas);
        return true;
    }

    @Override
    @Transactional
    public boolean save(DomainSimilarityCheckResult checkResult, List<DomainSimilarityCheckResultDetailDto> details) {
        DomainSimilarityCheckResult result = this.domainSimilarityCheckResultRepo.save(checkResult);
        List<DomainSimilarityCheckResultDetail> domainSimilarityCheckResultDetails = new ArrayList<>();
        for (DomainSimilarityCheckResultDetailDto colCluster : details) {
            DomainSimilarityCheckResultDetail detail = JsonUtils.toObject(JsonUtils.toJSon(colCluster), DomainSimilarityCheckResultDetail.class);
            detail.setClusterId(result.getClusterId());
            domainSimilarityCheckResultDetails.add(detail);
        }
        this.domainSimilarityCheckResultDetailRepo.saveAll(domainSimilarityCheckResultDetails);
        return true;
    }

    @Override
    public List<Domain> getDomainsByStates(Set<DomainState> states) {
        return domainRepo.findAllByStateIn(states);
    }

    /*
     * 根据domainId获取相似度分组
     * */
    @Override
    public List<DomainSimilarityCheckResult> getSimilarityGroup(Map<String, Object> reqBody) {
        String domainId = reqBody.getOrDefault("domainId", "").toString();
        List<DomainSimilarityCheckResult> results = new ArrayList<>();
        if(StringUtils.isNotEmpty(domainId)) {
            List<DomainSimilarityCheckResultDetail> details = domainSimilarityCheckResultDetailRepo.findAllByDomainIdIn(Arrays.asList(domainId));
            if(CollectionUtils.isEmpty(details)) {
                return results;
            }
            Set<Long> clusterIdSet = details.stream().map(v -> v.getClusterId()).collect(Collectors.toSet());
            domainSimilarityCheckResultRepo.findAllById(clusterIdSet).forEach(results::add);
        } else {
            domainSimilarityCheckResultRepo.findAll().forEach(results::add);
        }
        return results;
    }

    @Override
    public List<DomainSimilarityCheckResult> getSimilarityGroupNew(DomainSimilarityCheckParamDto reqBody) {

        String domainId = reqBody.getDomainId();
        List<DomainSimilarityCheckResult> results = new ArrayList<>();
        if(StringUtils.isNotEmpty(domainId)) {
            List<DomainSimilarityCheckResultDetail> details = domainSimilarityCheckResultDetailRepo.findAllByDomainIdIn(Arrays.asList(domainId));
            if(CollectionUtils.isEmpty(details)) {
                return results;
            }
            Set<Long> clusterIdSet = details.stream().map(v -> v.getClusterId()).collect(Collectors.toSet());
            domainSimilarityCheckResultRepo.findAllById(clusterIdSet).forEach(results::add);
        }
        if (StringUtils.isNotEmpty(reqBody.getChineseName())){
            String name = "%" + reqBody.getChineseName() + "%";
            List<DomainSimilarityCheckResultDetail> details = domainSimilarityCheckResultDetailRepo.findByChineseNameLike(name);
            if(CollectionUtils.isEmpty(details)) {
                return results;
            }
            Set<Long> clusterIdSet = details.stream().map(v -> v.getClusterId()).collect(Collectors.toSet());
            domainSimilarityCheckResultRepo.findAllById(clusterIdSet).forEach(results::add);
        }

        if (StringUtils.isEmpty(domainId) && StringUtils.isEmpty(reqBody.getChineseName())){
            domainSimilarityCheckResultRepo.findAll().forEach(results::add);
        }

        return results;
    }

    /*
    * 根据clusterId获取相似度+Domain详情
    * */
    @Override
    public List<DomainSimilarityCheckResultDetailDto> getSimilarityDetailByDomainId(Map<String, Object> reqBody, String user) {
        List<DomainSimilarityCheckResult> similarityGroup = getSimilarityGroup(reqBody);
        List<DomainSimilarityCheckResultDetailDto> result = new ArrayList<>();
        for (DomainSimilarityCheckResult domainSimilarityCheckResult : similarityGroup) {
            List<DomainSimilarityCheckResultDetailDto> clusterDetails = getSimilarityDetail(new HashMap<>() {{
                put("clusterId", domainSimilarityCheckResult.getClusterId());
            }}, user);
            result.addAll(clusterDetails);
        }
        return result;
    }

    /*
    * 根据clusterId获取相似度+Domain详情
    * */
    @Override
    public List<DomainSimilarityCheckResultDetailDto> getSimilarityDetail(Map<String, Object> reqBody, String user) {
        String clusterId = reqBody.getOrDefault("clusterId", "").toString();
        if(StringUtils.isEmpty(clusterId)) {
            return null;
        }
        Long clusterIdLong = Long.valueOf(clusterId);
        List<DomainSimilarityCheckResultDetail> details = domainSimilarityCheckResultDetailRepo.findAllByClusterIdEquals(clusterIdLong);
        List<DomainSimilarityCheckResultDetailDto> detailDtos = details.stream()
                .map(v -> JsonUtils.toObject(JsonUtils.toJSon(v), DomainSimilarityCheckResultDetailDto.class))
                .collect(Collectors.toList());

        // 获取机构code-名称map
        Set<String> depList = detailDtos.stream().map(v -> v.getDescriptionDepartment()).collect(Collectors.toSet());
        Map<String, String> orgNameMap = getOrgNameMap(depList);
        // 获取标准Ext信息
        Set<String> domainIds = detailDtos.stream().map(v -> v.getDomainId()).collect(Collectors.toSet());
        List<DomainExt> domainExts = domainExtRepo.findByDIdIn(domainIds);
        // 获取目录树
        DomainTreeNodeDto root = domainFolderExtService.loadDomainTree(null, DomainService.DOMAIN_CATEGORY_ID, user, true);
        for (DomainSimilarityCheckResultDetailDto detailDto : detailDtos) {
            Long folderId = detailDto.getFolderId();
            List<String> paths = DomainTreeNodeExtDto.buildNamePathArr(DomainTreeNodeExtDto.findByFolderId(folderId, root), root);
            detailDto.setPath(paths);
            Optional<DomainExt> domainDtoOpt = domainExts.stream().filter(v -> v.getdId().equals(detailDto.getDomainId())).findFirst();
            domainDtoOpt.ifPresent(dto -> {
                detailDto.setCheckState(dto.getCheckState());
            });
            detailDto.setDescriptionDepartmentName(orgNameMap.get(detailDto.getDescriptionDepartment()));
        }

        // 添加排序逻辑：当前用户提交的数据排在前面
        detailDtos.sort((d1, d2) -> {
            boolean isD1User = user.equals(d1.getSubmitter());
            boolean isD2User = user.equals(d2.getSubmitter());
            if (isD1User && !isD2User) {
                return -1; // d1排在d2前面
            } else if (!isD1User && isD2User) {
                return 1;  // d2排在d1前面
            }
            return 0; // 保持原有顺序
        });

        return detailDtos;
    }

    @Override
    @Transactional
    public Boolean skipCheck(List<String> domainIds, String currentUser) {

        if(!CollectionUtils.isEmpty(domainIds)) {
            List<Domain> domains = domainRepo.findByDomainIdIn(domainIds);
            if(domains.stream().filter(v -> currentUser.equals(v.getSubmitter())).count() != domainIds.size()) {
                throw new InvalidArgumentException("只能跳过自己提交的标准！");
            }
            domainExtRepo.updateCheckState(domainIds, DomainCheckState.SKIP);
        }
        return false;
    }

    @Override
    @Transactional
    public Boolean skipCheckNew(List<SkipReasonDto> skipReasonDtos, String currentUser) {
        List<String> domainIds = new ArrayList<>();
        List<SkipReason> skipReasons = new ArrayList<>();
        for (SkipReasonDto skipReasonDto : skipReasonDtos) {
            domainIds.add(skipReasonDto.getDomainId());
            SkipReason skipReason = new SkipReason();
            BeanUtils.copyProperties(skipReasonDto, skipReason);
            skipReasons.add(skipReason);
        }
        if(!CollectionUtils.isEmpty(domainIds)) {
            List<Domain> domains = domainRepo.findByDomainIdIn(domainIds);
            if(domains.stream().filter(v -> currentUser.equals(v.getSubmitter())).count() != domainIds.size()) {
                throw new InvalidArgumentException("只能跳过自己提交的标准！");
            }
            domainExtRepo.updateCheckState(domainIds, DomainCheckState.SKIP);
        }
        skipReasonRepository.saveAll(skipReasons);
        return true;
    }

    private Map<String, String> getOrgNameMap(Set<String> depList) {
        return organizationService.getOrganizationsByBms(new ArrayList<>(depList)).stream().collect(Collectors.toMap(o -> o.getBm(), o -> o.getFullName()));
    }
}
