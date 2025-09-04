package com.datablau.dataSecurity.controller;

import com.andorj.common.data.PageResult;
import com.datablau.base.data.PageQueryDto;
import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.security.api.RemoteDataSecurityStrategyService;
import com.datablau.data.security.dto.StrategyDto;
import com.datablau.dataAccess.dto.BatchDeleteAccessControlDto;
import com.datablau.dataAccess.dto.CreateSecurityAccessCopyDto;
import com.datablau.dataAccess.dto.DataSecurityAccessControlDto;
import com.datablau.dataAccess.dto.ExistObjectsDto;
import com.datablau.dataAccess.dto.QueryStrategyDto;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.dto.SecuritySearchDto;
import com.datablau.dataAccess.jpa.entity.DataSecurityAccessControl;
import com.datablau.dataAccess.service.api.AccessStrategyService;
import com.datablau.dataAccess.service.api.DataSecurityAccessDatamaskService;
import com.datablau.dataAccess.service.api.DataSecurityLocalMetadataService;
import com.datablau.dataAccess.service.api.RowAccessStrategyService;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataAccess.utils.CommonUtil;
import com.datablau.dataAccess.vo.DataSecurityAccessControlVo;
import com.datablau.dataSecurity.service.api.DataSecurityCatalogService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.metadata.common.api.DatablauRemoteMetadataService;
import com.datablau.metadata.common.dto.metadata.DataObjectSearchResult;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * <p>
 * 访控策略列表页相关接口
 * <p>
 *
 * @author weijiakun
 * @create 2023-03-07 14:37
 */
@RequestMapping("/accessStrategy")
@RestController
@Tag(name = "数据安全访控策略列表页 REST API")
public class DataSecurityAccessControlController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataSecurityAccessControlController.class);

    @Autowired
    private AccessStrategyService accessStrategyService;
    @Autowired
    private RowAccessStrategyService rowAccessStrategyService;
    @Autowired
    private DataSecurityAccessDatamaskService datamaskService;
    @Autowired
    private CommonUtil commonUtil;
    @Autowired
    private DataSecurityCatalogService dataSecurityCatalogService;
    @Autowired
    private RemoteDataSecurityStrategyService remoteDataSecurityStrategyService;
    @Autowired
    private DDSKafkaLogUtil ddsKafkaLogUtil;
    @Autowired
    private DataSecurityLocalMetadataService dataSecurityLocalMetadataService;
    @Autowired
    private DatablauRemoteMetadataService datablauRemoteMetadataService;

    public DataSecurityAccessControlController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @GetMapping("/test")
    public void testLog() {
        LOGGER.info("test info log");
        LOGGER.debug("test debug log");
        LOGGER.error("test error log");
        LOGGER.warn("test warn log");
    }

    @PostMapping("/get/basic/{strategyId}")
    @Operation(summary = "数据安全访控策略基础页信息")
    @Parameters({@Parameter(name = "strategyId", description = "安全访控策略id", in = ParameterIn.PATH)})
    public ResResultDto<Map<String, Object>> getSecurityAccessControlBasic(@PathVariable("strategyId") Long strategyId,
                                                                           @RequestParam(value = "log", defaultValue = "false") Boolean log) {
        Map<String, Object> resMap = new HashMap<>();
        DataSecurityAccessControlDto accessStrategy = accessStrategyService.getBasicAccessStrategy(strategyId, resMap);
        resMap.put("dto", accessStrategy);
        if (log) {
            ddsKafkaLogUtil.getAccessStrategy(accessStrategy, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        }
        return ResResultDto.ok(resMap);
    }

    @PostMapping("/get")
    @Operation(summary = "获取数据安全访控策略列表")
    @Parameters({@Parameter(name = "strategyName", description = "访控策略名称")})
    public ResResultDto<PageResult<DataSecurityAccessControlVo>> getSecurityAccessStrategyPage(
            @RequestParam("strategyName") String strategyName,
            @RequestParam("catalogId") Long catalogId,
            @RequestParam("currentPage") int currentPage,
            @RequestParam("pageSize") int pageSize,
            @RequestParam("sort") String sort) {
        return ResResultDto.ok(accessStrategyService.searchAccessStrategy(strategyName, catalogId, currentPage, pageSize, sort));
    }


    @Operation(summary = "创建策略副本")
    @PostMapping(value = "/create/copy")
    public ResResultDto<?> createCopy(@RequestBody CreateSecurityAccessCopyDto securityAccessCopyDto) {
        accessStrategyService.createCopy(securityAccessCopyDto, getCurrentUser());
        return ResResultDto.ok();
    }

    @PostMapping("/batch/delete")
    @Operation(summary = "批量删除安全访控策略")
    public ResResultDto<?> deleteSecurityAccessStrategies(@RequestBody BatchDeleteAccessControlDto deleteAccessControlDto) {
        //删除访问策略
        List<DataSecurityAccessControlDto> controlDtoList = new ArrayList<>();
        try {
            controlDtoList = accessStrategyService.deleteAccessStrategy(deleteAccessControlDto.getAccessStrategyIdList());
        } catch (Exception e) {
            LOGGER.error("删除访问策略错误！", e);
        }
        //删除行级访问策略
        for (Long rowAccessId : deleteAccessControlDto.getRowAccessStrategyIdList()) {
            try {
                DataSecurityAccessControl rowStrategy = rowAccessStrategyService.deleteRowStrategy(rowAccessId);
                DataSecurityAccessControlDto controlDto = new DataSecurityAccessControlDto();
                BeanUtils.copyProperties(rowStrategy, controlDto);
                controlDtoList.add(controlDto);
            } catch (Exception e) {
                LOGGER.error("删除行级访问策略！", e);
            }
        }
        //删除脱敏策略
        try {
            controlDtoList.addAll(datamaskService.deleteMasks(deleteAccessControlDto.getMaskIdList()));
        } catch (Exception e) {
            LOGGER.error("删除脱敏策略！", e);
        }
        ddsKafkaLogUtil.deleteAccessStrategy(controlDtoList, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return ResResultDto.ok();
    }


    @GetMapping("/prop/{objectId}")
    @Operation(summary = "获取资产基础信息")
    public ResResultDto<Map<String, Object>> getAssetProp(@PathVariable("objectId") Long objectId) {
        Map<String, Object> resMap = new HashMap<>();
        dataSecurityLocalMetadataService.getProps(objectId, resMap);
        dataSecurityCatalogService.getProps(objectId, (Long) resMap.getOrDefault("typeId", 80000005L), resMap);
        return ResResultDto.ok(resMap);
    }

    @PostMapping("/gateway")
    @Operation(summary = "安全网关同步信息")
    public Map<String, StrategyDto> getStrategy(
            @RequestBody QueryStrategyDto queryStrategyDto) {
        return remoteDataSecurityStrategyService.findStrategy(queryStrategyDto.getMandateType(), queryStrategyDto.getUsername(), queryStrategyDto.getModelId(), queryStrategyDto.getTableInfoList());
    }


    @Operation(summary = "排除对应类型的数据")
    @PostMapping(value = "/existObjects")
    public ResResultDto<?> existObjects(@RequestBody ExistObjectsDto existObjectsDto) {
        if (CollectionUtils.isEmpty(existObjectsDto.getObjectIds()) || Objects.isNull(existObjectsDto.getType())) {
            return ResResultDto.ok();
        }
        Collection<Long> existObjects = datamaskService.filterObject(existObjectsDto.getObjectIds(), existObjectsDto.getType());
        return ResResultDto.ok(existObjects);
    }


    @Operation(summary = "获取元数据需要查询的tableIdList")
    @PostMapping(value = "/table/list")
    public ResResultDto<Collection<Long>> searchObjects(@RequestBody SecuritySearchDto criteria) {
        if (criteria.getRangeSearch() && criteria.getExclude()) {
            //获取到排除之后的表id
            List<Long> tableIds = dataSecurityLocalMetadataService.getTableIdsBySchemaNameAndModelIdAndIdNotIn(criteria.getSchemaList(), criteria.getModelId(), criteria.getTableIdList());
            if (!CollectionUtils.isEmpty(tableIds)) {
                return ResResultDto.ok(tableIds);
            }
        }
        return ResResultDto.ok();
    }

    @Operation(summary = "获取元数据详细信息")
    @PostMapping(value = "/searchMetadata/detail")
    public ResResultDto<List<DataObjectSearchResult>> getDataObjectDetails(@RequestBody List<Long> objectIds) {
        return ResResultDto.ok(datablauRemoteMetadataService.getDataObjectDetails(objectIds));
    }

    @Operation(summary = "获取数据源使用信息")
    @PostMapping(value = "/getStrategyUsagesName")
    public Page<Map<String, Object>> findDatasourceUsage(@RequestBody PageQueryDto queryDto) {
        return accessStrategyService.findMetadataUsages(queryDto);
    }
}
