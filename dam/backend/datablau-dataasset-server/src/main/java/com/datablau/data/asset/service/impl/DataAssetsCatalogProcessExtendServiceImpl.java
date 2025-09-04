package com.datablau.data.asset.service.impl;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.api.DataAssetsCatalogAuthService;
import com.datablau.data.asset.api.DataAssetsCatalogElasticsearchService;
import com.datablau.data.asset.api.DataAssetsCatalogUdpService;
import com.datablau.data.asset.enums.EnumApplyType;
import com.datablau.data.asset.enums.EnumVersionType;
import com.datablau.data.asset.event.CatalogEvent;
import com.datablau.data.asset.impl.DataAssetsCatalogProcessServiceImpl;
import com.datablau.data.asset.jpa.entity.DataAssets;
import com.datablau.data.asset.jpa.repository.DataAssetsCatalogRepository;
import com.datablau.data.asset.jpa.repository.DataAssetsCatalogVisitRepository;
import com.datablau.data.asset.jpa.repository.DataAssetsRepository;
import com.datablau.data.asset.service.DataAssetsCatalogArchyService;
import com.datablau.dataasset.dto.DataAssetsCatalogStructureDto;
import com.datablau.dataasset.dto.WorkflowApplyRecordDto;
import com.datablau.project.api.RemoteArchyExtendService;
import com.datablau.workflow.common.entity.dto.WorkflowEventResult;
import com.datablau.workflow.common.entity.type.ProcessType;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 *
 * @author: hxs
 * @date: 2025/4/22 19:33
 */
@Service("dataAssetsCatalogProcessServiceExt")
@Primary
public class DataAssetsCatalogProcessExtendServiceImpl extends DataAssetsCatalogProcessServiceImpl {

    @Autowired
    private DataAssetsCatalogExtendServiceImpl dataAssetsCatalogExtendService;
    @Autowired
    protected DataAssetsCatalogRepository catalogRepository;
    @Autowired
    protected DataAssetsRepository assetsRepository;
    @Autowired
    protected DataAssetsCatalogAuthService authService;
    @Autowired
    protected DataAssetsCatalogUdpService udpService;
    @Autowired
    protected DataAssetsCatalogVisitRepository visitRepository;
    @Autowired
    private RemoteArchyExtendService remoteArchyExtendService;
    @Autowired
    protected ApplicationEventPublisher publisher;
    @Autowired
    protected DataAssetsCatalogElasticsearchService elasticsearchService;


    @Override
    protected void catalogApprovedPass(WorkflowEventResult eventResult) {
        logger.info(messageService.getMessage("applyCatalogIsOnlineAndOffline"));
        String processInstanceId = eventResult.getProcessInstanceId();
        List<WorkflowApplyRecordDto> workflowApplyRecordDtos = dataAssetsCatalogApplyRecordService.findRecordByProcessInstanceId(processInstanceId);

        workflowApplyRecordDtos.forEach(w -> {
            dataAssetsCatalogExtendService.updateCatalogStatus(Sets.newHashSet(w.getDataId()), w.getToStatus(),
                    Objects.equals(ProcessType.valueOf(eventResult.getProcessType()), ProcessType.CATALOG_PUBLISH_APPLY) ?
                            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) :
                            "");
            kafkaLogUtils.changeVisible(w.getDataId(), w.getToStatus());
        });

        Set<Long> catalogIds = workflowApplyRecordDtos.stream().map(WorkflowApplyRecordDto::getDataId).collect(
                Collectors.toSet());
        String reason = eventResult.getFormValueMap().get(REASON);
        String username = eventResult.getFormValueMap().get(START_USER_ID);

        Long catalogId = catalogIds.stream().findAny().orElseThrow(
                () -> new InvalidArgumentException(messageService.getMessage("directoryFileIDIsEmpty")));

        CommonCatalog commonCatalog = dataAssetsCatalogService.getById(catalogId);
        //三级目录下线要删除目录和业务对象
        if (Objects.equals(ProcessType.valueOf(eventResult.getProcessType()), ProcessType.CATALOG_OFFLINE_APPLY)) {
            if (commonCatalog.getLevel() == 3) {
                this.deleteByL3Id(commonCatalog);
            }
        }

        DataAssetsCatalogStructureDto dataAssetsCatalogStructure = structureService.findByCatalog(commonCatalog);
        //记录版本
        EnumAssetsCatalogStatus toStatus = Objects.equals(ProcessType.valueOf(eventResult.getProcessType())
                , ProcessType.CATALOG_PUBLISH_APPLY)
                ? EnumAssetsCatalogStatus.PUBLISHED
                : EnumAssetsCatalogStatus.OFFLINE;
        dataAssetsCatalogChangeRecordService.writerVersionOfCatalog(catalogIds
                , reason, toStatus, EnumApplyType.MANUAL,
                username, dataAssetsCatalogStructure, EnumVersionType.PUBLISHED);
    }

    private void deleteByL3Id(CommonCatalog catalog) {
        List<CommonCatalog> subByCatalogs = catalogRepository.findSubExclude(catalog.getStructureId(), catalog.getCatalogPath() + catalog.getId() + "/");
        List<Long> subs = subByCatalogs.stream().map(CommonCatalog::getId).collect(Collectors.toList());
        subs.add(catalog.getId());
//        List<DataAssets> subAssets = new ArrayList<>();
//        if (subs.size() > 1000) {
//            List<List<Long>> parts = Lists.partition(subs, 1000);
//            for (List<Long> part : parts) {
//                subAssets = assetsRepository.findByCatalogIdIn(part);
//                if (!subAssets.isEmpty()) {
//                    break;
//                }
//            }
//        } else {
//            subAssets = assetsRepository.findByCatalogIdIn(subs);
//        }
        subByCatalogs.add(catalog);
        for (CommonCatalog subByCatalog : subByCatalogs) {
            //删除目录
            catalogRepository.delete(subByCatalog);
            //删除本目录所有权限
            authService.deleteCatalogAuth(catalog);
            //删除目录属性值
            udpService.deleteByUdpValByCatalogId(catalog.getId());
            //删除资产
            assetsRepository.deleteByCatalogId(catalog.getId());
            //删除目录上的访问数据
            visitRepository.deleteAllByCatalogId(subByCatalog.getId());

            Integer level = subByCatalog.getLevel();
            if(level == 3){
                //删除ddm侧技术架构
                remoteArchyExtendService.deleteArchyByDataCatalog(subByCatalog.getId(), 1);
            }
        }
        //删除es资产
        publisher.publishEvent(new CatalogEvent(this, subByCatalogs.stream().map(CommonCatalog::getId).collect(Collectors.toList())));
        //删除es 目录
        elasticsearchService.deleteCatalog(catalog.getId());
    }
}
