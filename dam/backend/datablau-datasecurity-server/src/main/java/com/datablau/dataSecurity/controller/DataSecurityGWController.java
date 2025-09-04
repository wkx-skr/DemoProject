package com.datablau.dataSecurity.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.data.PageResult;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.security.dto.GatewayDto;
import com.datablau.data.security.dto.GatewayGroupDto;
import com.datablau.dataAccess.dto.DataSecurityGatewayDto;
import com.datablau.dataAccess.service.api.DataSecurityGatewayService;
import com.datablau.dataAccess.service.api.DataSecurityLocalMetadataService;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.dto.SecurityModelTreeNodeDto;
import com.datablau.dataSecurity.dto.SecurityModelTreeNodeType;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author weijiakun
 * 数据安全网关服务controller
 */
@RestController
@RequestMapping("/dataSecurity")
@Tag(name = "数据安全网关服务相关", description = "数据安全网关服务相关 API")
public class DataSecurityGWController extends BaseController {

    @Autowired
    private DataSecurityLocalMetadataService metadataService;
    @Autowired
    private DataSecurityGatewayService dataSecurityGatewayService;
    @Autowired
    private ModelCategoryService modelCategoryService;

    public DataSecurityGWController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "创建新的数据网关服务")
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public void createService(@RequestBody DataSecurityGatewayDto dataSecurityGatewayDto) {
        String loginedUsername = AuthTools.currentUsernameFailFast();
        dataSecurityGatewayService.createDataSecurityGateway(dataSecurityGatewayDto, loginedUsername);
    }

    @Operation(summary = "更新数据网关服务")
    @RequestMapping(value = "/update/{id}", method = RequestMethod.POST)
    public void updateService(@RequestBody DataSecurityGatewayDto dataSecurityGatewayDto) {
        dataSecurityGatewayService.updateDataSecurityGateway(dataSecurityGatewayDto);
    }

    @Operation(summary = "启用/禁用 数据网关服务")
    @RequestMapping(value = "/enable/{id}/{enable}", method = RequestMethod.POST)
    public void enableService(@PathVariable("id") @Description("安全网关服务id") Long id,
                              @PathVariable("enable") @Description("安全网关服务状态") Long enable) {
        dataSecurityGatewayService.updateGatewayEnable(id, enable);
    }

    @Operation(summary = "删除安全网关服务")
    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    @Parameter(name = "id", description = "安全网关服务id", in = ParameterIn.PATH, required = true)
    public void deleteService(@PathVariable("id") @Description("安全网关服务id") Long id) {
        dataSecurityGatewayService.deleteDataSecurityGateway(id);
    }

    @Operation(summary = "获取安全网关服务详情")
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    @Parameter(name = "id", description = "安全网关服务id", in = ParameterIn.PATH, required = true)
    public DataSecurityGatewayDto getDataSecurityGateway(@PathVariable("id") @Description("安全网关服务id") Long id) {
        return dataSecurityGatewayService.getOneById(id);
    }

    @Operation(summary = "获取数据网关服务(分页)")
    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public List<GatewayDto> getServices(
            @Description("搜索名称") @RequestParam(name = "search", required = false) String search,
            @Description("搜索排序字段") @RequestParam(name = "order_by", required = false, defaultValue = "createTime") String orderBy,
            @Description("搜索排序方向,true: 正序/ false:倒序") @RequestParam(name = "is_asc", required = false, defaultValue = "false") boolean isAsc,
            @Description("当前页,第一页为1") @RequestParam(name = "current_page", required = false, defaultValue = "1") int currentPage,
            @Description("每页条目数量,默认50") @RequestParam(name = "page_size", required = false, defaultValue = PageResult.DEFAULT_PAGE_SIZE + "") int pageSize) {
        return dataSecurityGatewayService.getAllDataSecurityGatewayByPage();
    }

    @Operation(summary = "获取数据网关分组(分页)")
    @RequestMapping(value = "/group/page", method = RequestMethod.GET)
    public List<GatewayGroupDto> getGroups() {
        return dataSecurityGatewayService.getAllDataSecurityGatewayGroupByPage();
    }

    @Operation(summary = "创建数据安全网关分组")
    @RequestMapping(value = "/group/create", method = RequestMethod.POST)
    public void createGroup(@RequestBody GatewayGroupDto dto) {
        dataSecurityGatewayService.createDataSecurityGatewayGroup(dto);
    }

    @Operation(summary = "更新数据安全网关分组")
    @RequestMapping(value = "/group/update", method = RequestMethod.POST)
    public void updateGroup(@RequestBody GatewayGroupDto dto) {
        dataSecurityGatewayService.updateDataSecurityGatewayGroup(dto);
    }

    @Operation(summary = "删除安全网关分组")
    @RequestMapping(value = "/group/delete/{id}", method = RequestMethod.DELETE)
    @Parameter(name = "id", description = "安全网关服务分组id", in = ParameterIn.PATH, required = true)
    public void deleteGroup(@PathVariable("id") @Description("安全网关服务分组id") Long id) {
        dataSecurityGatewayService.deleteDataSecurityGatewayGroup(id);
    }

    @Operation(summary = "获取安全网关健康状况")
    @RequestMapping(value = "/server", method = RequestMethod.GET)
    public List<String> getServerList() {
        return dataSecurityGatewayService.getServerList();
    }

    @Operation(summary = "根据网关名称搜索")
    @RequestMapping(value = "/search", method = RequestMethod.GET)
    public List<DataSecurityGatewayDto> searchDataSecurityGateway(@Parameter(name = "网关名称") String gatewayName) {

        List<DataSecurityGatewayDto> gatewayDtoList = dataSecurityGatewayService.searchDataSecurityGateway(gatewayName);

        return gatewayDtoList;
    }

    @Operation(summary = "搜索日志数据源")
    @RequestMapping(value = "/model/tree", method = RequestMethod.GET)
    public Collection<SecurityModelTreeNodeDto> findModelsTree() {
        List<GatewayDto> gatewayDtos = dataSecurityGatewayService.getAllDataSecurityGatewayByPage();
        Set<Long> modelIds = gatewayDtos.stream().map(GatewayDto::getModelId).collect(Collectors.toSet());
        Map<Long, SecurityModelTreeNodeDto> modelCategoryMap = new HashMap<>();
        for (ModelCategoryDto category : modelCategoryService.getModelCategories()) {
            SecurityModelTreeNodeDto node = new SecurityModelTreeNodeDto();
            node.setId(category.getCategoryId());
            node.setType(SecurityModelTreeNodeType.MODEL_CATEGORY);
            node.setName(category.getCategoryName() + "(" + category.getCategoryAbbreviation() + ")");
            modelCategoryMap.put(node.getId(), node);
        }
        Map<Long, List<String>> schemaMap = metadataService.getAllModelSchemas();
        for (ModelDto model : metadataService.getSimpleModelsUnsafe()) {
            if (!modelCategoryMap.containsKey(model.getCategoryId())) {
                continue;
            }
            if (model.getType() != null && "SMBSHAREFILE".equals(model.getType())) {
                continue;
            }

//            if (model.getNotLoaded()) {
//                continue;
//            }
            if (!modelIds.contains(model.getModelId())) {
                continue;
            }

            SecurityModelTreeNodeDto node = new SecurityModelTreeNodeDto();
            node.setName(model.getDefinition());
            node.setType(SecurityModelTreeNodeType.MODEL);
            node.setId(model.getModelId());
            modelCategoryMap.get(model.getCategoryId()).addSubNode(node);

            List<String> schemas = schemaMap.get(model.getModelId());
            if (schemas != null) {
                for (String schema : schemas) {
                    SecurityModelTreeNodeDto schemaNode = new SecurityModelTreeNodeDto();
                    schemaNode.setType(SecurityModelTreeNodeType.SCHEMA);
                    schemaNode.setName(schema);
                    schemaNode.setId(node.getId());
                    node.addSubNode(schemaNode);
                }
            }
        }
        return modelCategoryMap.values().stream().filter(x -> x.getSubNodes() != null && !x.getSubNodes().isEmpty()).collect(Collectors.toList());
    }

    @Operation(summary = "驱动下载")
    @GetMapping("/download/driver")
    public void downloadDriver(HttpServletResponse response) {
        dataSecurityGatewayService.downloadDriver(response);
    }

}
