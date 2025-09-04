package com.datablau.data.asset.controller.discern;

import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.search.FieldEqualsCriteria;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.api.PermissionHelper;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.api.discern.DataAssetsDiscernResultService;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.dto.discern.*;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.metadata.common.api.DatablauRemoteMetadataService;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Description: 识别结果api
 *
 * @author liuhao
 * @version 1.0
 * @date 2022/12/12 9:54
 */
@RestController
@RequestMapping(value = "/discern/result")
public class DataAssetsDiscernResultController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataAssetsDiscernResultController.class);

    @Autowired
    private PermissionHelper permissionHelper;
    @Autowired
    private DataAssetsCatalogService catalogService;
    @Autowired
    private ModelCategoryService modelCategoryService;
    @Autowired
    private DataAssetsDiscernResultService resultService;
    @Autowired
    @Qualifier("remoteMetadataService")
    private DatablauRemoteMetadataService metadataService;

    public DataAssetsDiscernResultController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "业务系统下拉列表")
    @GetMapping("/searchitem/business")
    public ResResultDto<List<ModelCategoryDto>> searchItemBusiness() {
        //只能选取用户本身系统
//        LOGGER.info("user name:" + AuthTools.currentUsernameFailFast());
        //用户下的用户系统
//        List<Long> filter = Lists.newArrayList(permissionHelper.getUserAccesibleModelCategoryIds(AuthTools.currentUsernameFailFast(), "DAM"));
        //全部系统列表
        List<ModelCategoryDto> dataList = modelCategoryService.getModelCategoriesWithUdp();
        //过滤只有当前用户有权限的系统返回
//        List<ModelCategoryDto> result = dataList.stream().filter(data -> filter.contains(data.getCategoryId())).collect(Collectors.toList());
        return ResResultDto.ok(dataList);
    }


    @Operation(summary = "获取识别结果")
    @PostMapping("/get")
    public ResResultDto<Map<String, Object>> getResults(@RequestBody DiscernResultSearchDto searchDto) {
        return ResResultDto.ok(resultService.getResults(searchDto));
    }

    @Operation(summary = "修改识别结果资产目录")
    @PostMapping("/modify/result/catalog")
    public ResResultDto<List<DiscernResultDto>> modifyResultCatalog(@RequestBody List<ModifyCatalogDto> params){
        return ResResultDto.ok(resultService.modifyResultCatalog(params));
    }

    @Operation(summary = "修改识别结果标签")
    @PostMapping("/modify/result/tag")
    public ResResultDto<List<DiscernResultDto>> modifyResultTag(@RequestBody List<ModifyTagDto> params){
        List<DiscernResultDto> data = Lists.newArrayList();
        params.forEach(param->{
            data.add(resultService.modifyResultTag(param));
        });

        return ResResultDto.ok(data);
    }

    @Operation(summary = "处理识别结果")
    @PostMapping("/handle")
    public ResResultDto<?> handleResult(@RequestBody List<HandleResultDto> resultDtoList) {
        return ResResultDto.ok(null, resultService.handleResultV2(resultDtoList, getCurrentUser()));
    }

    @Operation(summary = "获取目录详情")
    @GetMapping("/catalog/{catalogId}")
    public ResResultDto<Map<String, Object>> getCatalogDetail(@PathVariable("catalogId") Long catalogId) {
        return ResResultDto.ok(catalogService.getCatalogDetail(catalogId));
    }

    @Operation(summary = "安全等级列表")
    @GetMapping("/level/securitylist")
    public ResResultDto<List<DataAssetsLevelTagClassifyDto>> getAllSecurity() {
        return ResResultDto.ok(resultService.queryDataSecurityLevelList());
    }

    @Operation(summary = "获取表详情")
    @GetMapping("/table/{objectId}")
    public ResResultDto<Map<String, Object>> getResultDetail(@PathVariable("objectId") Long objectId) {
        List<Map<String, Object>> tableList = new ArrayList<>();
        List<Map<String, Object>> columnList = new ArrayList<>();
        Map<String, Object> resMap = new HashMap<>();
        FieldEqualsCriteria equalsCriteria = new FieldEqualsCriteria("parentId", objectId, false);
        List<DataObjectDto> tableDetail = metadataService.getDataObject(equalsCriteria).list() == null ? new ArrayList<>() : metadataService.getDataObject(equalsCriteria).list();
        if (CollectionUtils.isEmpty(tableDetail)) {
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

}
