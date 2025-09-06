package com.datablau.data.asset.service.impl;

import com.alibaba.nacos.common.utils.CollectionUtils;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.api.TagService;
import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.api.DataAssetsCatalogApplyRecordService;
import com.datablau.data.asset.api.DataAssetsCatalogAuthRelApplyRecordService;
import com.datablau.data.asset.api.DataAssetsCatalogChangeRecordService;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.api.DataAssetsCatalogStructureService;
import com.datablau.data.asset.api.DataAssetsService;
import com.datablau.data.asset.enums.EnumApplyType;
import com.datablau.data.asset.enums.EnumVersionType;
import com.datablau.data.asset.impl.DataAssetsWorkflowServiceImpl;
import com.datablau.data.asset.jpa.repository.DataAssetsApplyRecordRepository;
import com.datablau.data.asset.jpa.repository.DataAssetsCatalogRepository;
import com.datablau.data.asset.service.DataAssetsWorkflowExtend0Service;
import com.datablau.data.asset.utils.KafkaLogUtils;
import com.datablau.data.common.util.JsonUtils;
import com.datablau.dataasset.api.RemoteDataAssetsCatalogService;
import com.datablau.dataasset.dto.AssetsWorkflowApplyDto;
import com.datablau.dataasset.dto.CatalogWorkflowApplyDto;
import com.datablau.dataasset.dto.DataAssetsCatalogStructureDto;
import com.datablau.dataasset.dto.RemoteCatalogDto;
import com.datablau.dataasset.dto.WorkflowApplyDto;
import com.datablau.dataasset.dto.WorkflowApplyRecordDto;
import com.datablau.dataasset.enums.RecordDataType;
import com.datablau.project.api.DomainExtService;
import com.datablau.project.api.dto.BatchApplyDetailRemoteDto;
import com.datablau.project.api.dto.BatchApplyRemoteDto;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserDetails;
import com.datablau.workflow.common.api.DatablauRemoteWorkflowService;
import com.datablau.workflow.common.entity.dto.WorkflowFormDto;
import com.datablau.workflow.common.entity.dto.query.WorkflowApplyQueryDto;
import com.datablau.workflow.common.entity.type.ProcessType;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static com.datablau.data.asset.service.DataAssetsWorkflowAttribute0.*;

/**
 *
 * @author: hxs
 * @date: 2025/4/22 17:37
 */
@Service
public class DataAssetsWorkflowExtend0ServiceImpl implements DataAssetsWorkflowExtend0Service {
    private static final Logger logger = LoggerFactory.getLogger(DataAssetsWorkflowExtend0ServiceImpl.class);

    @Autowired
    protected UserService userService;
    @Autowired
    protected DataAssetsService dataAssetsService;
    @Resource
    protected DatablauRemoteWorkflowService workflowService;
    @Autowired
    protected DataAssetsCatalogService dataAssetsCatalogService;
    @Autowired
    protected RemoteDataAssetsCatalogService remoteDataAssetsCatalogService;
    @Autowired
    protected DataAssetsCatalogStructureService dataAssetsCatalogStructureService;
    @Autowired
    protected DataAssetsCatalogChangeRecordService dataAssetsCatalogChangeRecordService;
    @Autowired
    protected DataAssetsCatalogApplyRecordService dataAssetsCatalogApplyRecordService;
    @Autowired
    protected DataAssetsApplyRecordRepository dataAssetsApplyRecordRepository;
    @Autowired
    protected DataAssetsCatalogAuthRelApplyRecordService dataAssetsCatalogAuthRelApplyRecordService;
    @Autowired
    protected DataAssetsCatalogRepository dataAssetsCatalogRepository;
    @Autowired
    protected TagService tagService;
    @Autowired
    protected KafkaLogUtils kafkaLogUtils;
    @Autowired
    protected MessageService messageService;

    @Autowired
    protected DomainExtService domainExtService;

    @Override
    public void applyUpOrDownLines0(WorkflowApplyDto workflowApplyDto, String username) {
        // 发布下线目录
        if (workflowApplyDto instanceof CatalogWorkflowApplyDto catalogWorkflowApplyDto) {
            logger.info("Publish the downline directory");
            //如果是跟随子资产操作
            if (catalogWorkflowApplyDto.getFlowAssets()) {
                logger.info("Apply to assets");
                AssetsWorkflowApplyDto assetsWorkflowApplyDto = new AssetsWorkflowApplyDto();
                assetsWorkflowApplyDto.setAssetsProcessType(Objects.equals(catalogWorkflowApplyDto.getCatalogProcessType(),
                        ProcessType.CATALOG_PUBLISH_APPLY) ?
                        ProcessType.ASSET_PUBLISH_APPLY :
                        ProcessType.ASSET_OFFLINE_APPLY);
                assetsWorkflowApplyDto.setCatalogId(catalogWorkflowApplyDto.getCatalogId());
                assetsWorkflowApplyDto.setFlowSub(catalogWorkflowApplyDto.getFlowSub());
                assetsWorkflowApplyDto.setReason(catalogWorkflowApplyDto.getReason());
//                this.applyAssetsUpOrDownLines(assetsWorkflowApplyDto, username);
                logger.info("The asset was released and offline");
            }
            this.applyCatalogUpOrDownLines0(catalogWorkflowApplyDto, username);
            logger.info("The directory was successfully released and taken offline");
        }

        //发布/下线资产
        if (workflowApplyDto instanceof AssetsWorkflowApplyDto) {
//            this.applyAssetsUpOrDownLines((AssetsWorkflowApplyDto) workflowApplyDto, username);
        }
    }

    @Override
    public void applyCatalogUpOrDownLines0(CatalogWorkflowApplyDto workflowApplyDto, String username) {
        /*获取存在权限的目录id集合*/
        Long catalogId = workflowApplyDto.getCatalogId();

        CommonCatalog dataAssetsCatalog = dataAssetsCatalogService.getById(workflowApplyDto.getCatalogId());
        if (Objects.equals(dataAssetsCatalog.getStatus(), EnumAssetsCatalogStatus.UNDER_REVIEW)) {
            throw new InvalidArgumentException(messageService.getMessage("catalogNotPendingReview"));
        }

        //获取需要操作的目录id
        Set<Long> hasAuthCatalogIds;
        if (workflowApplyDto.getFlowSub()) {
            List<EnumAssetsCatalogStatus> catalogStatuses;
            if (Objects.equals(ProcessType.CATALOG_PUBLISH_APPLY, workflowApplyDto.getCatalogProcessType())) {
                catalogStatuses = Lists.newArrayList(EnumAssetsCatalogStatus.OFFLINE, EnumAssetsCatalogStatus.UNPUBLISHED);
            } else {
                catalogStatuses = Lists.newArrayList(EnumAssetsCatalogStatus.PUBLISHED);
            }

            logger.info("The directory is published offline and the subset directory is obtained");
            List<RemoteCatalogDto> remoteCatalogEntities = dataAssetsCatalogService.getSubCatalogsExcludeNoPermissionDenied(workflowApplyDto.getCatalogId(), catalogStatuses, username);
            //过滤掉L4和L5
            Iterator<RemoteCatalogDto> iterator = remoteCatalogEntities.iterator();
            while (iterator.hasNext()){
                RemoteCatalogDto next = iterator.next();
                if(next.getLevel() > 3){
                    iterator.remove();
                }
            }
            hasAuthCatalogIds = dataAssetsCatalogService.getUserIsManageOrEditCatalogId(username, remoteCatalogEntities.stream().map(RemoteCatalogDto::getId).collect(Collectors.toList()));

        } else {
            hasAuthCatalogIds = Sets.newHashSet(catalogId);
        }

        //拿父级目录id，只有发布才带着上级。
        if(Objects.equals(ProcessType.CATALOG_PUBLISH_APPLY, workflowApplyDto.getCatalogProcessType())){
            String[] split = dataAssetsCatalog.getCatalogPath().split("/");
            ArrayList<Long> tempList = new ArrayList<>();
            for (String id : split) {
                if(!"0".equals(id)){
                    tempList.add(Long.valueOf(id));
                }
            }
            //还要判断上级是否已经发布，如果已经发布则不在提交
            List<CommonCatalog> tempCatalogs = dataAssetsCatalogRepository.findAllById(tempList);
            for (CommonCatalog tempCatalog : tempCatalogs) {
                if(tempCatalog.getStatus() == EnumAssetsCatalogStatus.OFFLINE || tempCatalog.getStatus() == EnumAssetsCatalogStatus.UNPUBLISHED){
                    hasAuthCatalogIds.add(tempCatalog.getId());
                }
            }
        }


        /*
         * 开始封装数据
         */
        DataAssetsCatalogStructureDto dataAssetsCatalogStructure = dataAssetsCatalogStructureService.findByCatalog(dataAssetsCatalog);
        List<CommonCatalog> dataAssetsCatalogs = dataAssetsCatalogRepository.findAllById(hasAuthCatalogIds);
        List<CommonCatalog> sortedDataAssetsCatalog = dataAssetsCatalogs.stream().sorted(Comparator.comparing(CommonCatalog::getLevel)).toList();
        Map<Long, CommonCatalog> catalogIdToObject = sortedDataAssetsCatalog.stream().collect(Collectors.toMap(CommonCatalog::getId, s -> s));

        //部门
        List<String> bms = sortedDataAssetsCatalog.stream().map(CommonCatalog::getBm).distinct().collect(Collectors.toList());
        Map<String, String> organizationDtoMap = remoteDataAssetsCatalogService.getOrgTreeByBm(bms);


        /**
         * 需要修改为的状态
         */
        EnumAssetsCatalogStatus toStatus = Objects.equals(ProcessType.CATALOG_PUBLISH_APPLY, workflowApplyDto.getCatalogProcessType()) ? EnumAssetsCatalogStatus.PUBLISHED : EnumAssetsCatalogStatus.OFFLINE;

        //获取目录的结构
        if (!dataAssetsCatalogStructure.isCatalogStraightPublish()) {
            //更新状态
            this.updateCatalogStatus(hasAuthCatalogIds, toStatus,
                    Objects.equals(ProcessType.CATALOG_PUBLISH_APPLY, workflowApplyDto.getCatalogProcessType()) ? LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "");

            //发送kafka 消息
            hasAuthCatalogIds.forEach(s -> {
                kafkaLogUtils.changeVisible(s, toStatus);
            });
            //记录版本
            if (Objects.equals(ProcessType.CATALOG_PUBLISH_APPLY, workflowApplyDto.getCatalogProcessType())) {
                dataAssetsCatalogChangeRecordService.writerVersionOfCatalog(hasAuthCatalogIds, workflowApplyDto.getReason(),
                        toStatus, EnumApplyType.MANUAL, username, dataAssetsCatalogStructure, EnumVersionType.PUBLISHED);
            }
            return;
        }


        List<RemoteCatalogDto> remoteCatalogEntities = dataAssetsCatalogService.getCatalogByIds(new ArrayList<>(hasAuthCatalogIds));
        Map<Long, RemoteCatalogDto> idToObject = remoteCatalogEntities.stream().collect(Collectors.toMap(RemoteCatalogDto::getId, s -> s));


        //目录缓存
        Map<String, String> catalogNameCache = Maps.newHashMap();
//        CountDownLatch countDownLatch = new CountDownLatch(hasAuthCatalogIds.size());
        // 发布时可以认为 这个就是单纯的 同一级，所以这里直接创建即可
        String operation = null;
        if (toStatus.equals(EnumAssetsCatalogStatus.PUBLISHED)){
            operation = "发布";
        }else {
            operation = "废弃";
        }
        BatchApplyRemoteDto batchApplyRemoteDto = new BatchApplyRemoteDto();
        batchApplyRemoteDto.setApplyType("资产");
        batchApplyRemoteDto.setApplyCreateTime(new Date());
        batchApplyRemoteDto.setApplyCreator(username);
        batchApplyRemoteDto.setApplyOperation(operation);
        // 设置一级目录的编码
        List<BatchApplyDetailRemoteDto> batchApplyDetailRemoteDtos = new ArrayList<>();
        for (Long hasAuthCatalogId : hasAuthCatalogIds) {
            List<WorkflowFormDto> workflowFormDtos = Lists.newArrayList();
            WorkflowApplyQueryDto workflowApplyQueryDto = new WorkflowApplyQueryDto();
            workflowApplyQueryDto.setProcessType(workflowApplyDto.getCatalogProcessType().getName());
            CommonCatalog catalog = catalogIdToObject.get(hasAuthCatalogId);
            RemoteCatalogDto remoteCatalogEntity = idToObject.get(hasAuthCatalogId);
            //当前状态
            workflowFormDtos.add(new WorkflowFormDto(CURRENT_STATUS, catalog.getStatus().name()));
            //目录类型
            workflowFormDtos.add(new WorkflowFormDto(CATALOG_TYPE, remoteCatalogEntity.getCatalogType()));
            //原因
            workflowFormDtos.add(new WorkflowFormDto(REASON, workflowApplyDto.getReason()));
            //catalogPath
            workflowFormDtos.add(new WorkflowFormDto(CATALOG_PATH, dataAssetsCatalogService.getCatalogPathName(catalog, catalogNameCache)));
            //catalogName
            workflowFormDtos.add(new WorkflowFormDto(CATALOG_NAME, catalog.getName()));
            //catalogCode
            workflowFormDtos.add(new WorkflowFormDto(CATALOG_CODE, catalog.getCode()));
            //abbreviation
            workflowFormDtos.add(new WorkflowFormDto(ABBREVIATION, catalog.getEnglishName()));
            //directoryStructure
            workflowFormDtos.add(new WorkflowFormDto(DIRECTORY_STRUCTURE, dataAssetsCatalogStructure.getName()));
            //department
            workflowFormDtos.add(new WorkflowFormDto(DEPARTMENT, organizationDtoMap.get(catalog.getBm())));
            //catalogKeywords
            workflowFormDtos.add(new WorkflowFormDto(CATALOG_KEYWORDS, catalog.getKeyword()));
            //describe
            workflowFormDtos.add(new WorkflowFormDto(DESCRIBE, catalog.getComment()));
            //bm
            workflowFormDtos.add(new WorkflowFormDto(BM, catalog.getBm()));
            //catalogId
            workflowFormDtos.add(new WorkflowFormDto(CATALOG_ID, String.valueOf(catalog.getId())));
            //approver
            workflowFormDtos.add(new WorkflowFormDto(APPROVER, getCatalogApproval(catalog, dataAssetsCatalogStructure)));

            //approverName
            workflowFormDtos.add(new WorkflowFormDto(APPROVER_NAME, getUserFullNameFormat(catalog.getApprover())));
            //申请人
            workflowFormDtos.add(new WorkflowFormDto(APPLY_NAME, getUserFullName(username)));
            //数据管家
            workflowFormDtos.add(new WorkflowFormDto(DATA_STEWARD, getUserFullName(catalog.getButler())));
            //applyType 申请方式
            workflowFormDtos.add(new WorkflowFormDto(APPLY_TYPE, EnumApplyType.MANUAL.getDesc()));
            workflowFormDtos.add(new WorkflowFormDto(START_USER_ID, username));
            workflowFormDtos.add(new WorkflowFormDto(PROCESS_TYPE, "DDC"));
            workflowFormDtos.add(new WorkflowFormDto(PROCESS_INSTANCE_NAME, getCatalogProcessName(workflowApplyDto.getCatalogProcessType(), catalog)));

            //拓展属性
            if (CollectionUtils.isNotEmpty(remoteCatalogEntity.getCatalogExtensions())) {
                workflowFormDtos.add(new WorkflowFormDto(CATALOG_EXTENSIONS, JsonUtils.toJSon(remoteCatalogEntity.getCatalogExtensions())));
            } else {
                workflowFormDtos.stream().filter(s -> Objects.equals(s.getCode(), CATALOG_EXTENSIONS)).findAny().ifPresent(workflowFormDtos::remove);
            }
            //放入参数
            workflowApplyQueryDto.setFormDefs(workflowFormDtos);
            workflowApplyQueryDto.setProCategoryCode(workflowApplyDto.getCatalogProcessType().name());
            //更新状态，并且发送workflow请求，记录原始状态
            updateCatalogStatusAndWriteRecord(catalogIdToObject.get(hasAuthCatalogId), workflowApplyQueryDto,
                    Objects.equals(workflowApplyDto.getCatalogProcessType(), ProcessType.CATALOG_PUBLISH_APPLY) ? EnumAssetsCatalogStatus.PUBLISHED :
                            EnumAssetsCatalogStatus.OFFLINE);
            if (ObjectUtils.isEmpty(batchApplyRemoteDto.getApplyName())){
                // 获取当前的一级目录
                if (catalog.getLevel() ==1 ) {
                    batchApplyRemoteDto.setApplyName( catalog.getName());
                    logger.info("设置code。。。。"+catalog.getCode());
                    batchApplyRemoteDto.setBuCode(catalog.getCode());
                }else {
                    String[] split = catalog.getCatalogPath().split("/");
                    CommonCatalog tmpCatalog = catalogIdToObject.get(split[1]);
                    String applyName = null;
                    if (!ObjectUtils.isEmpty(tmpCatalog)){
                        logger.info("bucode...."+tmpCatalog.getCode() + " 查询的id "+ tmpCatalog.getId());
                        applyName = tmpCatalog.getName();
                        batchApplyRemoteDto.setBuCode(tmpCatalog.getCode());
                    }else {
                        Optional<CommonCatalog> byId = dataAssetsCatalogRepository.findById(Long.valueOf(split[1]));
                        applyName =byId.get().getName();
                        logger.info("bucode...."+byId.get().getCode() +" 查询的id"+byId.get().getId());
                        batchApplyRemoteDto.setBuCode(byId.get().getCode());
                    }
                    batchApplyRemoteDto.setApplyName( applyName);

                    // 设置code

                }
            }

            BatchApplyDetailRemoteDto batchApplyDetailRemoteDto = new BatchApplyDetailRemoteDto();
            batchApplyDetailRemoteDto.setSubmitUser(username);
            batchApplyDetailRemoteDto.setDataType("资产");
            batchApplyDetailRemoteDto.setCnName(catalog.getName());
            batchApplyDetailRemoteDto.setEnName(catalog.getEnglishName());
            batchApplyDetailRemoteDto.setNeId(String.valueOf(catalog.getId()));
            batchApplyDetailRemoteDto.setOrderState(operation);
            batchApplyDetailRemoteDto.setCode(String.valueOf(catalog.getId()));
            batchApplyDetailRemoteDto.setOrderType(operation);
            batchApplyDetailRemoteDtos.add(batchApplyDetailRemoteDto);
            //发送kafka 消息
       //     kafkaLogUtils.changeVisible(hasAuthCatalogId, EnumAssetsCatalogStatus.UNDER_REVIEW);

        }
        batchApplyRemoteDto.setDetails(batchApplyDetailRemoteDtos);
        domainExtService.remoteCreateUpdateApple(batchApplyRemoteDto,"asset_pub");
        // 接口发送成功之后再进行状态的更新
        this.updateCatalogStatus(hasAuthCatalogIds, EnumAssetsCatalogStatus.UNDER_REVIEW, "");
    }

    protected void updateCatalogStatus(Set<Long> hasAuthCatalogIds, EnumAssetsCatalogStatus status, String publishTime) {
        //更新状态
        dataAssetsCatalogService.updateCatalogStatus(hasAuthCatalogIds, status, publishTime);
    }

    /**
     * 更新状态，并且记录原始目录状态
     */
    protected void updateCatalogStatusAndWriteRecord(CommonCatalog commonCatalog, WorkflowApplyQueryDto workflowApplyQueryDto, EnumAssetsCatalogStatus toStatus) {

        //开始记录版本
   //     String processInstanceId = workflowService.applyProcess(workflowApplyQueryDto);

        //记录原始状态
        WorkflowApplyRecordDto workflowApplyRecordDto = new WorkflowApplyRecordDto();
        workflowApplyRecordDto.setDataId(commonCatalog.getId());
        workflowApplyRecordDto.setFormStatus(commonCatalog.getStatus());
        workflowApplyRecordDto.setToStatus(toStatus);
        workflowApplyRecordDto.setDataType(RecordDataType.CATALOG);
        workflowApplyRecordDto.setCreateTime(LocalDateTime.now());
    //    workflowApplyRecordDto.setProcessInstanceId(processInstanceId);
        dataAssetsCatalogApplyRecordService.save(workflowApplyRecordDto);

        //更新目录的状态
     //   this.updateCatalogStatus(Sets.newHashSet(commonCatalog.getId()), EnumAssetsCatalogStatus.UNDER_REVIEW, "");
    }

    protected String getCatalogApproval(CommonCatalog catalog, DataAssetsCatalogStructureDto catalogStructure) {
        if (catalog.getParentId() == 0) {
            return catalog.getApprover();
        } else {
            Long catalogParentId = catalog.getParentId();
            CommonCatalog commonCatalog = dataAssetsCatalogRepository.findById(catalogParentId).orElseThrow(
                    () -> new InvalidArgumentException(messageService.getMessage("parentNotFound")));
            return commonCatalog.getApprover();
        }

    }

    protected String getUserFullName(String username) {
        if (StringUtils.isBlank(username)) return "";
        UserDetails userDetails = userService.getUserDetails(username);
        if (Objects.nonNull(userDetails)) {
            return userDetails.getFullUserName();
        }
        return "";
    }

    protected String getUserFullNameFormat(String username) {
        String userFullName = getUserFullName(username);
        if (StringUtils.isNotBlank(userFullName)) {
            return String.format("%s (%s)", userFullName, username);
        }
        return "";
    }

    protected String getCatalogProcessName(ProcessType processType, CommonCatalog commonCatalog) {
        String action = Objects.equals(processType, ProcessType.CATALOG_PUBLISH_APPLY)
                ? messageService.getMessage("catalogApply")
                : messageService.getMessage("catalogOffline");
        return String.format("%s"+ messageService.getMessage("catalogApplication")+"-%s", action, commonCatalog.getName());
    }
}
