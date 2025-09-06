package com.datablau.base.server.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.search.MultipleCriteria;
import com.andorj.model.common.search.Order;
import com.andorj.model.common.search.QueryByNameCriteria;
import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.andorj.model.common.utility.DigestUtils;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.criteria.DatasourceQueryCriteria;
import com.datablau.base.server.dto.DatasourceQueryDto;
import com.datablau.base.server.jpa.entity.DatasourceEntity;
import com.datablau.base.server.service.LocalDatasourceService;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.plugin.FrontEndPluginInfo;
import com.datablau.datasource.util.DatasourceManager;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/4/23 15:44
 */
@RestController
@RequestMapping("/datasources")
@Tag(name = "数据源", description = "/datasources")
public class DatasourceController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DatasourceController.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired
    private LocalDatasourceService localDatasourceService;

    @Autowired
    private DatasourceManager datasourceManager;

    @Autowired
    private ModelCategoryService modelCategoryService;

    public DatasourceController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_datasource",
//            systemModule = OperationModuleType.SYSTEM_MODULE,
//            description = "查询数据源连接"
//    )
    @Operation(summary = "查询指定的数据源")
    @PostMapping("/findDatasources")
    public Collection<DatasourceProperties> getDatasources(@RequestBody DatasourceQueryDto queryDto) {

        MultipleCriteria multipleCriteria = new MultipleCriteria();

        if (queryDto.getPage() != null) {
            multipleCriteria.setPage(queryDto.getPage());
        }else {
            Sort sort = new Sort();
            sort.setOrder(Order.DESC);
            sort.setField("creationTime");
            QueryPage queryPage = new QueryPage();
            queryPage.setCurrentPage(1);
            queryPage.setPageSize(100000);
            queryPage.setSortBy(Lists.newArrayList(sort));
            multipleCriteria.setPage(queryPage);
        }

        if (!CollectionUtils.isEmpty(queryDto.getDatasourceTypes())) {
            DatasourceQueryCriteria criteria = new DatasourceQueryCriteria();
            criteria.setQueryByTypes(queryDto.getDatasourceTypes());
            criteria.setMatchTypes(true);
            multipleCriteria.addCriteria(criteria);
        }

        if (!Strings.isNullOrEmpty(queryDto.getKeyword())) {
            QueryByNameCriteria queryByNameCriteria = new QueryByNameCriteria();
            queryByNameCriteria.setKeyword(queryDto.getKeyword());
            queryByNameCriteria.setFullWordMatch(false);
            queryByNameCriteria.setIgnoreCase(true);
            multipleCriteria.addCriteria(queryByNameCriteria);
        }

        // 根据所属系统筛选
        if (queryDto.getCategoryId() != null) {
            multipleCriteria.addFieldEqualsCriteria("categoryId", queryDto.getCategoryId(), false);
        } else {
            // 默认查dam 的应用系统权限
            Collection<Long> categorys = modelCategoryService.getModelCategoryOwnerGroupIdsOfUser(AuthTools.currentUsernameFailFast(), "DAM");
            multipleCriteria.addFieldInCriteria("categoryId",  new ArrayList<>(categorys), true);
        }

        return localDatasourceService.getDatasources(multipleCriteria);
    }

    @Operation(summary = "测试数据源的连通性")
    @PostMapping("/testConnection")
    public void testConnection(
        @Parameter(name = "dsId", description = "数据源id", required = true)
        @RequestParam(name = "dsId") Long dsId) {
        DatasourceEntity datasource = localDatasourceService.getDatasourceById(dsId);
        if (datasource == null) {
            throw new InvalidArgumentException("找不到id为'" + dsId + "'的数据源");
        }
        testConnection(datasource.toDatasourceProperties());
    }

    @Operation(summary = "测试连接信息是否正确")
    @PostMapping("/testConnectionInfo")
    public void testConnection(@RequestBody DatasourceProperties datasourceProperties) {
        decryptPassword(datasourceProperties);
        localDatasourceService.testConnection(datasourceProperties);
    }

    @Operation(summary = "创建数据源")
//    @OperatorLog(
//        operation = OperationLogType.TABLE_ADD,
//        systemModule = OperationModuleType.SYSTEM_MODULE,
//        description = "创建数据源连接: {param}",
//        operateTable = "db_datasource",
//        descriptionParamClass = DatasourceProperties.class,
//        descriptionParamMethod = "getSourceName"
//    )
    @PostMapping("/createDatasource")
    public DatasourceProperties createDatasource(@RequestBody DatasourceProperties datasource) {
        decryptPassword(datasource);
        return localDatasourceService.createDatasource(datasource).toDatasourceProperties();
    }

    @Operation(summary = "更新数据源")
//    @OperatorLog(
//        operation = OperationLogType.TABLE_MODIFY,
//        systemModule = OperationModuleType.SYSTEM_MODULE,
//        description = "更新数据源连接: {param}",
//        operateTable = "db_datasource",
//        descriptionParamClass = DatasourceProperties.class,
//        descriptionParamMethod = "getSourceName"
//    )
    @PostMapping("/updateDatasource")
    public DatasourceProperties updateDatasource(@RequestBody DatasourceProperties datasource) {
        decryptPassword(datasource);
        return localDatasourceService.updateDatasource(datasource).toDatasourceProperties();
    }


    @Operation(summary = "更新数据源")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            systemModule = OperationModuleType.SYSTEM_MODULE,
//            description = "更新数据源连接: {param}",
//            operateTable = "db_datasource",
//            descriptionParamClass = DatasourceProperties.class,
//            descriptionParamMethod = "getSourceName"
//    )
    @PostMapping("/updateSimpleDatasource")
    public DatasourceProperties updateSimpleDatasource(@RequestBody DatasourceProperties datasource) {
        decryptPassword(datasource);
        return localDatasourceService.updateSimpleDatasource(datasource).toDatasourceProperties();
    }

    @Operation(summary = "列出所有的数据源插件列表")
    @PostMapping("/getAllPlugins")
    public List<FrontEndPluginInfo> getAllPlugins() {
        return datasourceManager.loadAllPlugins();
    }

    @Operation(summary = "删除一系列数据源")
//    @OperatorLog(
//        operation = OperationLogType.TABLE_DELETE,
//        systemModule = OperationModuleType.SYSTEM_MODULE,
//        description = "删除数据源连接，id为: {params}",
//        operateTable = "db_datasource",
//        descriptionParamClass = Long.class,
//        descriptionParamMethod = "toString"
//    )
    @PostMapping("/deleteDatasources")
    public void deleteDatasources(@RequestBody List<Long> datasourceIds) {
        for (Long datasourceId : datasourceIds) {
            localDatasourceService.deleteDatasourceById(datasourceId);
        }
    }

    @Operation(summary = "获取schemas")
    @PostMapping("/getSchemas")
    public List<String> getSchemas(@RequestBody DatasourceProperties datasource) {
        decryptPassword(datasource);
        return localDatasourceService.getSchemas(datasource);
    }

    @Operation(summary = "获取databases")
    @PostMapping("/getDatabases")
    public List<String> getDatabases(@RequestBody DatasourceProperties datasource) {
        decryptPassword(datasource);
        return localDatasourceService.getDatabases(datasource);
    }

    private void decryptPassword(DatasourceProperties datasourceProperties) {
        if (datasourceProperties == null) {
            return;
        }

        if (datasourceProperties.getCredentialInfo() != null
                && !Strings.isNullOrEmpty(datasourceProperties.getCredentialInfo().getPassword())) {
            datasourceProperties.getCredentialInfo()
                    .setPassword(DigestUtils.decryptEncodedContent(datasourceProperties.getCredentialInfo().getPassword()));
        }
    }
}
