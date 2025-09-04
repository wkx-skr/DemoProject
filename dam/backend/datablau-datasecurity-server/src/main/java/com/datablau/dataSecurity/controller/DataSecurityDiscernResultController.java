package com.datablau.dataSecurity.controller;

import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.search.FieldEqualsCriteria;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.catalog.jpa.repository.CommonCatalogRepository;
import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.dto.DiscernResultSearchDto;
import com.datablau.dataSecurity.dto.HandleResultDto;
import com.datablau.dataSecurity.dto.export.DiscernResultExport;
import com.datablau.dataSecurity.jpa.entity.DataSecurityDiscernResult;
import com.datablau.dataSecurity.service.api.DataSecurityCatalogService;
import com.datablau.dataSecurity.service.api.DataSecurityDiscernResultService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.dataSecurity.utils.JsonUtils;
import com.datablau.metadata.common.api.DatablauRemoteMetadataService;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.security.management.api.RoleService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Description: 识别结果api
 *
 * @author liuhao
 * @version 1.0
 * @date 2022/12/12 9:54
 */
@RestController
@RequestMapping(value = "/datasecurity/result")
public class DataSecurityDiscernResultController extends BaseController {
    private static final Logger log = LoggerFactory.getLogger(DataSecurityDiscernResultController.class);

    @Autowired
    private DataSecurityDiscernResultService resultService;
    @Autowired
    @Qualifier("datablauRemoteMetadataService")
    private DatablauRemoteMetadataService metadataService;
    @Autowired
    private DataSecurityCatalogService catalogService;

    @Autowired
    private CommonCatalogRepository catalogRepository;

    @Autowired
    private DDSKafkaLogUtil logUtils;

    public DataSecurityDiscernResultController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "获取识别结果")
    @PostMapping("/get")
    public ResResultDto<Map<String, Object>> getResults(@RequestBody DiscernResultSearchDto searchDto) {
        return ResResultDto.ok(resultService.getResults(searchDto));
    }

    @Operation(summary = "处理识别结果")
    @PostMapping("/handle")
    public void handleResult(@RequestBody List<HandleResultDto> resultDtoList) {
        Map<String, Object> map = resultService.handleResult(resultDtoList, getCurrentUser());
        String op = (String) map.get("op");
        if (StringUtils.isNotBlank(op)) {
            logUtils.discernedResult((List<String>) map.get("list"), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), op);
        }
    }

    @Operation(summary = "分类分级结果导出")
    @GetMapping("/export")
    public void export(HttpServletResponse response, Long sourceId) {
        Map<String, List<List<Object>>> discernResult = new LinkedHashMap<>(5);
        List<Object> list = Lists.newArrayList();

        List<DataSecurityDiscernResult> results = resultService.findAllByDataSourceIdAndAdopted(sourceId, false);
        for (DataSecurityDiscernResult record : results) {
            try {
                DiscernResultExport obj = new DiscernResultExport();
                obj.setCategoryName("/");
                FieldEqualsCriteria equalsCriteria = new FieldEqualsCriteria("objectId", record.getTableId(), false);

                DataObjectDto table = metadataService.getDataObject(equalsCriteria).singleton();
                if (table != null) {
                    obj.setTableName(table.getPhysicalName());
                    obj.setTableAlias(table.getLogicalName());
                }

                obj.setColumnName(record.getDataAssetName());
                obj.setColumnAlias(record.getAlias());

                List<Map<String, Object>> resultList = JsonUtils.toObject(record.getDiscernedContent(), new TypeReference<List<Map<String, Object>>>() {
                });
                obj.setCatalogResult(getCatalogNamePath(Long.valueOf((Integer) resultList.get(0).get("catalogId"))));
                obj.setLevelResult((String) resultList.get(0).get("tag"));
                list.add(obj);
            } catch (Exception e) {
                log.error("导出分类分级结果报错", e);
            }
        }

        discernResult.put("分类分级结果", ExcelUtil.getSheetData(list));
        ExcelUtil.exportManySheetByList(response, "分类分级结果", discernResult);
    }

    @Operation(summary = "获取表详情")
    @GetMapping("/table/{objectId}")
    public ResResultDto<Map<String, Object>> getResultDetail(@PathVariable("objectId") Long objectId) {
        List<Map<String, Object>> tableList = new ArrayList<>();
        List<Map<String, Object>> columnList = new ArrayList<>();
        Map<String, Object> resMap = new HashMap<>();
        FieldEqualsCriteria equalsCriteria = new FieldEqualsCriteria("parentId", objectId, false);
        List<DataObjectDto> tableDetail = metadataService.getDataObject(equalsCriteria).list() == null ? new ArrayList<>() : metadataService.getDataObject(equalsCriteria).list();
        if (tableDetail == null || tableDetail.size() == 0) {
            throw new ItemNotFoundException("源端已被删除");
        }
        equalsCriteria = new FieldEqualsCriteria("objectId", objectId, false);
        tableDetail.add(metadataService.getDataObject(equalsCriteria).singleton());
        tableDetail.forEach(dataObject -> {
            Map<String, Object> detailMap = new HashMap<>();
            detailMap.put("objectId", dataObject.getObjectId());
            if (dataObject.getTypeId() == LDMTypes.oAttribute) {
                detailMap.put("columnDesc", dataObject.getDefinition());
                detailMap.put("columnName", dataObject.getPhysicalName());
                detailMap.put("columnAlias", dataObject.getLogicalName());
                columnList.add(detailMap);
            } else if (dataObject.getTypeId() == LDMTypes.oEntity || dataObject.getTypeId() == LDMTypes.oView) {
                detailMap.put("tableDesc", dataObject.getDefinition());
                detailMap.put("tableName", dataObject.getPhysicalName());
                detailMap.put("tableAlias", dataObject.getLogicalName());
                detailMap.put("type", dataObject.getTypeId());
                tableList.add(detailMap);
            }
        });
        resMap.put("table", tableList);
        resMap.put("column", columnList);
        return ResResultDto.ok(resMap);
    }

    @Operation(summary = "获取目录详情")
    @GetMapping("/catalog/{catalogId}")
    public ResResultDto<Map<String, Object>> getCatalogDetail(@PathVariable("catalogId") Long catalogId) {
        return ResResultDto.ok(catalogService.getCatalogDetail(catalogId));
    }


    private String getCatalogNamePath(Long catalogId) {
        StringBuilder catalogNamePath = new StringBuilder();

        CommonCatalog currentCatalog = getCatalog(catalogId);
        if (null == currentCatalog) {
            return null;
        }
        String catalogPath = currentCatalog.getCatalogPath();

        String[] catalogParent = catalogPath.split("/");
        for (String cg : catalogParent) {
            CommonCatalog catalog = getCatalog(Long.valueOf(cg));
            if (catalog == null) {
                continue;
            }
            if (catalogNamePath.length() > 0) {
                catalogNamePath.append("-").append(catalog.getName());
            } else {
                catalogNamePath.append(catalog.getName());
            }
        }

        catalogNamePath.append("-").append(currentCatalog.getName());
        return catalogNamePath.toString();
    }

    private CommonCatalog getCatalog(Long catalogId) {
        Optional<CommonCatalog> catalogOptional = catalogRepository.findById(catalogId);
        if (!catalogOptional.isPresent()) {
            return null;
        }
        //访问此目录
        CommonCatalog catalog = catalogOptional.get();

        return catalog;
    }
}
