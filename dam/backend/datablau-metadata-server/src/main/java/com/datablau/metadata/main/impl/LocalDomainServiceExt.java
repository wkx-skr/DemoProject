package com.datablau.metadata.main.impl;

import com.datablau.data.common.udp.MetadataUdpEntry;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.metadata.main.dao.metadata.DataObjectRepository;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.dto.ObjectTenderQueryDto;
import com.datablau.metadata.main.dto.ObjectTenderQueryTableColumnResult;
import com.datablau.metadata.main.dto.ObjectTenderQueryTableResult;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.service.domain.impl.LocalDomainServiceImpl;
import com.datablau.metadata.main.util.RemoteServiceGetter;
import com.datablau.project.api.DomainExtService;
import com.datablau.project.api.RemoteDataAssetExtendService;
import com.datablau.project.api.dto.CustomDomainExtDto;
import com.datablau.project.dto.CatalogResDto;
import com.datablau.udp.service.api.MetadataUserDefinedPropertyService;
import lombok.extern.slf4j.Slf4j;
import oracle.net.aso.v;
import org.apache.commons.lang3.StringUtils;
import org.elasticsearch.common.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service("localDomainServiceExt")
public class LocalDomainServiceExt extends LocalDomainServiceImpl {

    @Autowired
    private DataObjectRepository dataObjectRepo;

    @Autowired
    private ModelRepository modelRepo;

    @Autowired
    private DomainExtService domainExtService;

    @Autowired
    private RemoteDataAssetExtendService remoteDataAssetExtendService;

    @Autowired
    private MetadataUserDefinedPropertyService propertyService;
    public List<ObjectTenderQueryTableResult> objectsTender(List<ObjectTenderQueryDto> queryParams) {
        Iterator<ObjectTenderQueryDto> iterator = queryParams.iterator();
        while (iterator.hasNext()) {
            ObjectTenderQueryDto queryParam = iterator.next();
            if (StringUtils.isBlank(queryParam.getTableName())) {
                iterator.remove();
            }
            if (StringUtils.isBlank(queryParam.getSchema())) {
                iterator.remove();
            }
            if (queryParam.getModelId() == null) {
                iterator.remove();
            }
        }

        if(CollectionUtils.isEmpty(queryParams)) {
            log.error("查询参数为空");
            return null;
        }

        List<DataObject> columns = new ArrayList<>();
        Map<Long, DataObject> tableCache = new HashMap<>();
        Map<Long, List<ObjectTenderQueryDto>> dsGroup = queryParams.stream().collect(Collectors.groupingBy(ObjectTenderQueryDto::getModelId));
        List<Model> dsList = modelRepo.findByDatasourceIdIn(dsGroup.keySet());
        Map<String, Long> schemaMap = dsList.stream().collect(Collectors.toMap(k -> k.getDatabase(), v -> v.getModelId()));
        for (Long dsId : dsGroup.keySet()) {
            List<ObjectTenderQueryDto> schemaParams = dsGroup.get(dsId);
            Map<String, List<ObjectTenderQueryDto>> schemaGroup = schemaParams.stream().collect(Collectors.groupingBy(ObjectTenderQueryDto::getSchema));
            for (String schemaName : schemaGroup.keySet()) {
                if(!schemaMap.containsKey(schemaName)) {
                    log.error("数据源{}不存在", schemaName);
                }
                Long modelId = schemaMap.get(schemaName);
                List<ObjectTenderQueryDto> tableParams = schemaGroup.get(schemaName);
                Set<String> tableNameParams = tableParams.stream().map(v -> v.getTableName().toLowerCase()).collect(Collectors.toSet());
                List<DataObject> tables = dataObjectService.getTablesOfModelByTablePhysicalNames(modelId, tableNameParams, schemaName);
                if(tables != null) {
                    tableCache.putAll(tables.stream().collect(Collectors.toMap(v -> v.getObjectId(), v -> v)));
                    Set<Long> tableIds = tables.stream().map(v -> v.getObjectId()).collect(Collectors.toSet());
                    List<DataObject> columnByTableIds = dataObjectRepo.findColumnByTableIds(tableIds);
                    if(columnByTableIds != null) {
                        columns.addAll(columnByTableIds);
                    }
                }
            }
        }
        if(columns.isEmpty()) {
            log.error("查询结果为空");
            return null;
        }

        // 查询column关联的domain
        Set<Long> columnIds = columns.stream().map(v -> v.getObjectId()).collect(Collectors.toSet());
        List<Map<String, Object>> columnAndDomainId = remoteDataAssetExtendService.getDomainByColumnId(columnIds);
        if(CollectionUtils.isEmpty(columnAndDomainId)) {
            log.error("调用资产服务，查询结果为空");
            return null;
        }
        // 查询资产目录信息
        HashMap<Long, CatalogResDto> catalogInfoMaps = remoteDataAssetExtendService.getCatalogInfoByObjId(tableCache.keySet().stream().map(v -> v.toString()).toList());

        // 组装返回参数
        Map<Long, ObjectTenderQueryTableResult> resultMap = new HashMap<>();
        for (Map<String, Object> columnRes : columnAndDomainId) {
            Long columnId = (Long) columnRes.get("columnId");
            Boolean isNull = (Boolean) columnRes.get("isNull");
            DataObject columnObject = columns.stream().filter(v -> Objects.equals(columnId, v.getObjectId())).findFirst().orElseThrow(() -> new RuntimeException());

            // 业务域+安全级别
            String securityLevelValue = null;
            String l1NameValue = null;
            if(catalogInfoMaps.get(columnId) != null && StringUtils.isNotEmpty(catalogInfoMaps.get(columnId).getL1Name())) {
                l1NameValue = catalogInfoMaps.get(columnId).getL1Name();
            }
            // 查询扩展属性
            List<MetadataUdpEntry> udpEntries = propertyService.getObjectUdps(columnObject.getObjectId(), columnObject.getTypeId());
            if(!CollectionUtils.isEmpty(udpEntries)){
                Map<String, MetadataUdpEntry> udpMap = udpEntries.stream().collect(Collectors.toMap(MetadataUdpEntry::getName, a -> a));
                MetadataUdpEntry securityLevel = udpMap.get("安全级别");
                if(securityLevel != null){
                    securityLevelValue = securityLevel.getValue();
                }
                MetadataUdpEntry l1Name = udpMap.get("业务域");
                //当资产目录侧没有数据时取扩展属性
                if(l1Name != null && l1NameValue == null){
                    l1NameValue = l1Name.getValue();
                }
            }

            if(resultMap.containsKey(columnObject.getTableId())) {
                resultMap.get(columnObject.getTableId()).addColumn(columnObject, isNull, securityLevelValue);
            } else {
                ObjectTenderQueryTableResult value = new ObjectTenderQueryTableResult(tableCache.get(columnObject.getTableId()), l1NameValue);
                value.addColumn(columnObject, isNull, securityLevelValue);
                resultMap.put(columnObject.getTableId(), value);
            }
        }

        List<String> domainIds = columnAndDomainId.stream().map(v -> v.get("domainId").toString()).toList();
        List<CustomDomainExtDto> domainDtos = domainExtService.getDomainsById(domainIds);
        if (CollectionUtils.isEmpty(domainDtos) || domainDtos.size() != domainIds.size()) {
            log.error("调用数据标准服务，查询结果为空");
            return null;
        }

        for (CustomDomainExtDto customDomainExtDto : domainDtos) {
            String domainId = customDomainExtDto.getDomainId();
            Long columnId = (Long) columnAndDomainId.stream()
                    .filter(v -> v.get("domainId").toString().equals(domainId))
                    .findFirst().orElseThrow(() -> new RuntimeException("domainId is not found : " + domainId))
                    .get("columnId");
            for (Long k : resultMap.keySet()) {
                ObjectTenderQueryTableResult v = resultMap.get(k);
                Optional<ObjectTenderQueryTableColumnResult> columnResultOptional = v.getColumns().stream().filter(v0 -> Objects.equals(v0.getColumnId(), columnId)).findFirst();
                if(columnResultOptional.isPresent()) {
                    columnResultOptional.get().addRule(customDomainExtDto);
                    break;
                }
            }
        }

        return new ArrayList<>(resultMap.values());
    }
}
