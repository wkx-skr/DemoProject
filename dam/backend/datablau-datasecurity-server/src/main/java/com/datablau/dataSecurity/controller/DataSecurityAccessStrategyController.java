package com.datablau.dataSecurity.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.data.PageResult;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.api.PermissionHelper;
import com.datablau.base.data.BaseModelCategory;
import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.constant.EnumVisitorType;
import com.datablau.dataAccess.dto.DataSecurityAccessControlDto;
import com.datablau.dataAccess.dto.DataSecurityAccessStrategyColumnDto;
import com.datablau.dataAccess.dto.DataSecurityAccessStrategyColumnQueryDto;
import com.datablau.dataAccess.dto.DataSecurityAccessStrategyDto;
import com.datablau.dataAccess.dto.DataSecurityAccessStrategyNewColumnDto;
import com.datablau.dataAccess.dto.DataSecurityAccessStrategyRangeQueryDto;
import com.datablau.dataAccess.dto.DataSecurityAccessStrategyVisitorDto;
import com.datablau.dataAccess.dto.DataSecurityAccessTableRangeDto;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.service.api.AccessStrategyService;
import com.datablau.dataAccess.service.api.DataSecurityLocalMetadataService;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataAccess.vo.AccessStrategyObjectVo;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.dataasset.api.RemoteDataAssetsService;
import com.datablau.metadata.common.dto.metadata.DataObjectSearchResult;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * <p>
 * 数据安全访问策略
 * <p>
 *
 * @author weijiakun
 * @create 2023-01-16 16:02
 */
@RequestMapping("/accessStrategy")
@RestController
@Tag(name = "数据安全访问策略 REST API")
public class DataSecurityAccessStrategyController extends BaseController {

    @Autowired
    private AccessStrategyService accessStrategyService;
    @Autowired
    private RemoteDataAssetsService remoteDataAssetsService;
    @Autowired
    private DataSecurityLocalMetadataService metadataService;
    @Autowired
    private PermissionHelper permissionHelper;
    @Autowired
    private ModelCategoryService modelCategoryService;

    @Autowired
    private DDSKafkaLogUtil ddsKafkaLogUtil;

    public DataSecurityAccessStrategyController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping("/add")
    @Operation(summary = "新增数据安全访问策略")
    public ResResultDto<?> addSecurityAccessStrategy(@RequestBody DataSecurityAccessStrategyDto accessStrategyDto) {
        accessStrategyDto.setCreator(AuthTools.currentUsernameFailFast());
        accessStrategyService.addAccessStrategy(accessStrategyDto, false);
        ddsKafkaLogUtil.addAccessStrategy(accessStrategyDto.getAccessStrategyName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return ResResultDto.ok();
    }

    @PostMapping("/search/model/{modelId}")
    @Operation(summary = "查找逻辑数据源中所有 实体数据源")
    public ResResultDto<List<ModelDto>> searchModel(@PathVariable("modelId") Long modelId) {
        return ResResultDto.ok(metadataService.getModelDtoByLogicalModelId(modelId));
    }

    @GetMapping("/all/logic/model")
    @Operation(summary = "查找所有的逻辑数据源")
    public ResResultDto<List<ModelDto>> getAllLogicModel(
            @Description("是否返回逻辑实体") @RequestParam(value = "includeLogicalEntity", defaultValue = "false") boolean includeLogicalEntity) {
        //用户下的用户系统
        List<Long> filter = Lists.newArrayList(permissionHelper.getUserAccesibleModelCategoryIds(AuthTools.currentUsernameFailFast(), "DAM"));
        //全部系统列表
        List<BaseModelCategory> dataList = modelCategoryService.getAllBaseModelCategories();
        //过滤只有当前用户有权限的系统返回
        List<BaseModelCategory> result = dataList.stream().filter(data -> filter.contains(data.getId())).collect(Collectors.toList());
        if (CollectionUtils.isEmpty(result)){
            return ResResultDto.ok(new ArrayList<>());
        }
        List<ModelDto> modelDtoList = metadataService.getAllLogicModelDto(result.stream().map(BaseModelCategory::getId).collect(Collectors.toList()));
        modelDtoList.removeIf(modelDto -> !includeLogicalEntity && "DATADICTIONARY_LOGICAL".equals(modelDto.getType()));
        return ResResultDto.ok(modelDtoList);
    }


    @PostMapping("/modify")
    @Operation(summary = "修改数据安全访问策略")
    public ResResultDto<?> modifySecurityAccessStrategy(@RequestBody DataSecurityAccessStrategyDto accessStrategyDto) {
        accessStrategyService.modifyAccessStrategy(accessStrategyDto);
        ddsKafkaLogUtil.modifyAccessStrategy(accessStrategyDto.getAccessStrategyName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return ResResultDto.ok();
    }

    @PostMapping("/get/modify/{controlId}")
    @Operation(summary = "获取数据安全访问策略详情")
    @Parameters({@Parameter(name = "controlId", description = "安全访问策略id", in = ParameterIn.PATH)})
    public ResResultDto<?> getSecurityAccessStrategyModifyInfo(@PathVariable("controlId") Long controlId) {
        return ResResultDto.ok(accessStrategyService.getAccessStrategyModifyInfo(controlId));
    }

    @PostMapping("/get/visitor/{controlId}")
    @Operation(summary = "获取数据安全访问策略访问者列表")
    @Parameters({@Parameter(name = "controlId", description = "安全访问策略id", in = ParameterIn.PATH),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "页码", in = ParameterIn.QUERY),
            @Parameter(name = "sort", description = "排序: ASC DESC", in = ParameterIn.QUERY),
            @Parameter(name = "query", description = "搜索项", in = ParameterIn.QUERY),
            @Parameter(name = "isWhite", description = "黑白名单，true:白名单, false:黑名单", in = ParameterIn.QUERY),
            @Parameter(name = "visitorType", description = "访问者类型", in = ParameterIn.QUERY)})
    public ResResultDto<PageResult<DataSecurityAccessStrategyVisitorDto>> getSecurityAccessStrategyVisitor(@PathVariable("controlId") Long controlId,
                                                                                                           @RequestParam(value = "visitorType") EnumVisitorType visitorType,
                                                                                                           @RequestParam(value = "query") String query,
                                                                                                           @RequestParam("currentPage") int currentPage,
                                                                                                           @RequestParam("pageSize") int pageSize,
                                                                                                           @RequestParam(value = "isWhite", defaultValue = "true") Boolean isWhite,
                                                                                                           @RequestParam("sort") String sort) {
        return ResResultDto.ok(accessStrategyService.getBasicAccessStrategyVisitor(controlId, visitorType, query, currentPage, pageSize, sort, isWhite));
    }

//    @PostMapping("/get/visitor/{controlId}")
//    @Operation(summary = "获取数据安全访问策略访问者列表 - 取消分页")
//    @Parameters({@Parameter(name = "controlId", description = "安全访问策略id", in = ParameterIn.PATH),
//            @Parameter(name = "sort", description = "排序: ASC DESC", in = ParameterIn.QUERY),
//            @Parameter(name = "query", description = "搜索项", in = ParameterIn.QUERY),
//            @Parameter(name = "isWhite", description = "黑白名单，true:白名单, false:黑名单", in = ParameterIn.QUERY),
//            @Parameter(name = "visitorType", description = "访问者类型", in = ParameterIn.QUERY)})
//    public ResResultDto<List<DataSecurityAccessStrategyVisitorDto>> getSecurityAccessStrategyVisitor(@PathVariable("controlId") Long controlId,
//                                                                                                           @RequestParam(value = "visitorType") EnumVisitorType visitorType,
//                                                                                                           @RequestParam(value = "query") String query,
//                                                                                                           @RequestParam(value = "isWhite", defaultValue = "true") Boolean isWhite,
//                                                                                                           @RequestParam("sort") String sort) {
//        return ResResultDto.ok(accessStrategyService.getBasicAccessStrategyVisitor(controlId, visitorType, query, sort, isWhite));
//    }

    @PostMapping("/get/all/visitor/{controlId}")
    @Operation(summary = "获取所有的数据安全访问策略访问者")
    @Parameters({@Parameter(name = "controlId", description = "安全访问策略id", in = ParameterIn.PATH),
            @Parameter(name = "visitorType", description = "访问者类型", in = ParameterIn.QUERY),
            @Parameter(name = "isWhite", description = "是否白名单", in = ParameterIn.QUERY)})
    public ResResultDto<List<DataSecurityAccessStrategyVisitorDto>> getSecurityAccessStrategyVisitor(@PathVariable("controlId") Long controlId,
                                                                                                     @RequestParam(value = "visitorType") EnumVisitorType visitorType,
                                                                                                     @RequestParam(value = "isWhite") Boolean isWhite) {
        List<DataSecurityAccessStrategyVisitorDto> data = accessStrategyService.getAllBasicAccessStrategyVisitor(controlId, visitorType, isWhite);

        //bug:31616 结果有重复数据,暂时去重
        List<DataSecurityAccessStrategyVisitorDto> result = data;
        if (EnumVisitorType.USER.equals(visitorType)) {
            result = data.stream()
                .collect(Collectors.collectingAndThen(
                    Collectors.toCollection(() -> new TreeSet<>(Comparator.comparing(DataSecurityAccessStrategyVisitorDto::getFullUserName))),
                    ArrayList::new));
        }

        return ResResultDto.ok(result);
    }

    @PostMapping("/get/object/{controlId}")
    @Operation(summary = "获取数据安全访问策略访问数据列表")
    @Parameters({@Parameter(name = "controlId", description = "安全访问策略id", in = ParameterIn.PATH),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "页码", in = ParameterIn.QUERY),
            @Parameter(name = "sort", description = "排序: ASC DESC", in = ParameterIn.QUERY)})
    public ResResultDto<PageResult<DataSecurityAccessStrategyColumnDto>> getSecurityAccessStrategyObject(@PathVariable("controlId") Long controlId,
                                                                                                         @RequestParam("currentPage") int currentPage,
                                                                                                         @RequestParam("pageSize") int pageSize,
                                                                                                         @RequestParam("sort") String sort) {
        return ResResultDto.ok(accessStrategyService.getBasicAccessStrategyObject(controlId, currentPage, pageSize, sort));
    }

    @PostMapping("/delete/{strategyId}")
    @Operation(summary = "删除数据安全访问策略")
    @Parameters({@Parameter(name = "strategyId", description = "安全访问策略id", in = ParameterIn.PATH)})
    public ResResultDto<?> deleteSecurityAccessStrategy(@PathVariable("strategyId") Long strategyId) {
        List<DataSecurityAccessControlDto> controlDtoList = accessStrategyService.deleteAccessStrategy(Collections.singletonList(strategyId));
        ddsKafkaLogUtil.deleteAccessStrategy(controlDtoList, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return ResResultDto.ok();
    }

    @PostMapping("/v2/get/object/{controlId}")
    @Operation(summary = "获取数据安全访问策略访问数据列表")
    @Parameters({@Parameter(name = "controlId", description = "安全访问策略id", in = ParameterIn.PATH),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "页码", in = ParameterIn.QUERY),
            @Parameter(name = "sort", description = "排序: ASC DESC", in = ParameterIn.QUERY)})
    public ResResultDto<PageResult<DataSecurityAccessStrategyNewColumnDto>> getNewSecurityAccessStrategyObject(@PathVariable("controlId") Long controlId,
                                                                                                               @RequestParam("currentPage") int currentPage,
                                                                                                               @RequestParam("pageSize") int pageSize,
                                                                                                               @RequestParam("sort") String sort) {
        return ResResultDto.ok(accessStrategyService.getNewBasicAccessStrategyObject(controlId, currentPage, pageSize, sort));
    }

    @PostMapping("/column/{strategyId}/{objectId}/{typeId}")
    @Operation(summary = "获取当前数据的数据安全访控策略的策略规则")
    @Parameters({
            @Parameter(name = "strategyId", description = "安全访控策略id", in = ParameterIn.PATH),
            @Parameter(name = "objectId", description = "object id", in = ParameterIn.PATH),
            @Parameter(name = "typeId", description = "type id", in = ParameterIn.PATH)
    })
    public ResResultDto<PageResult<DataSecurityAccessControlDto>> getAccessColumnPage(@PathVariable("strategyId") Long strategyId,
                                                                                      @PathVariable("objectId") Long objectId,
                                                                                      @PathVariable("typeId") Long typeId) {
        return ResResultDto.ok(accessStrategyService.getAccessColumnPageByAccessStrategyId(strategyId, objectId, typeId));
    }


    @PostMapping("/get/{typeId}/{controlId}")
    @Operation(summary = "获取数据安全访问策略访问数据列表 - 修改页")
    @Parameters({@Parameter(name = "controlId", description = "安全访问策略id", in = ParameterIn.PATH),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "页码", in = ParameterIn.QUERY),
            @Parameter(name = "sort", description = "排序: ASC DESC", in = ParameterIn.QUERY)})
    public ResResultDto<PageResult<AccessStrategyObjectVo>> modifySecurityAccessStrategyObject(@PathVariable("controlId") Long controlId,
                                                                                               @PathVariable("typeId") Long typeId,
                                                                                               @RequestParam("currentPage") int currentPage,
                                                                                               @RequestParam("pageSize") int pageSize,
                                                                                               @RequestParam("sort") String sort) {
        return ResResultDto.ok(accessStrategyService.getBasicAccessStrategyObject(controlId, typeId, currentPage, pageSize, sort));
    }

    @PostMapping("/get/user/table")
    @Operation(summary = "获取当前用户可访问的数据表信息")
    public ResResultDto<PageResult<DataSecurityAccessTableRangeDto>> getTableByUsername(@RequestBody DataSecurityAccessStrategyRangeQueryDto rangeQueryDto) {
        PageResult<DataSecurityAccessTableRangeDto> pageResult = accessStrategyService.getAllActiveRangeByUserName(rangeQueryDto);
        List<DataSecurityAccessTableRangeDto> tableRangeDtoList = pageResult.getContent();
        for (DataSecurityAccessTableRangeDto tableRangeDto : tableRangeDtoList) {
            //设置数据资产目录
            tableRangeDto.setAssetCatalog(remoteDataAssetsService.getCatalogPathByItem(tableRangeDto.getTableId().toString(), EnumSupportType.TABLE));
        }
        return ResResultDto.ok(pageResult);
    }


    @PostMapping("/columns")
    @Operation(summary = "根据指定的表id列表获取字段信息")
    public ResResultDto<PageResult<DataObjectSearchResult>> getEntityColumnsBySelectTables(@RequestBody DataSecurityAccessStrategyColumnQueryDto queryDto) {

        PageResult<DataObjectSearchResult> colObjs;
        if (queryDto.isExclude()) {
            //获取到排除之后的表id
            queryDto.setTableIdList(metadataService.getTableIdsBySchemaNameAndModelIdAndIdNotIn(queryDto.getSchemaList(), queryDto.getModelId(), queryDto.getTableIdList()));
        }
        //是否有关键词搜索
        if (StringUtils.isEmpty(queryDto.getKeyword())) {
            colObjs = metadataService.getDataObjectChildrenBySelectTables(queryDto.getTableIdList(), queryDto.getTagId(), queryDto.getCurrentPage(), queryDto.getPageSize(), queryDto.getSort());
        } else {
            colObjs = metadataService.getDataObjectChildrenBySelectTables(queryDto.getTableIdList(), queryDto.getTagId(), queryDto.getKeyword(), queryDto.getCurrentPage(), queryDto.getPageSize(), queryDto.getSort());
        }

        return ResResultDto.ok(colObjs);
    }

    @PostMapping("/tables/exclude")
    @Operation(summary = "根据指定的表id之外的表")
    public ResResultDto<PageResult<DataObjectSearchResult>> getEntityTablesByExcludeTables(@RequestBody DataSecurityAccessStrategyColumnQueryDto queryDto) {
        return ResResultDto.ok(metadataService.getTableBySchemaNameAndModelIdAndIdNotIn(queryDto.getSchemaList(), queryDto.getModelId(), queryDto.getTableIdList(), queryDto.getPageSize(), queryDto.getCurrentPage(), queryDto.getKeyword()));
    }

}
