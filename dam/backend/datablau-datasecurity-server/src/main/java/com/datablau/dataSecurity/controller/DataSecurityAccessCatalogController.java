package com.datablau.dataSecurity.controller;

import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.constant.EnumCatalogType;
import com.datablau.dataAccess.dto.DataSecurityAccessCatalogNodeDto;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.service.api.DataSecurityAccessCatalogService;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * <p>
 * 访控策略目录接口
 * <p>
 *
 * @author weijiakun
 * @create 2023-02-28 14:44
 */
@RequestMapping("/accessStrategy/catalog")
@RestController
@Tag(name = "访控策略目录 REST API")
public class DataSecurityAccessCatalogController extends BaseController {


    @Autowired
    private DataSecurityAccessCatalogService catalogService;

    @Autowired
    private DDSKafkaLogUtil logUtils;

    public DataSecurityAccessCatalogController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping("/tree")
    @Operation(summary = "获取目录树")
    public ResResultDto<DataSecurityAccessCatalogNodeDto> getDataSecurityAccessCatalogTree(@RequestParam("type") EnumCatalogType type) {
        return ResResultDto.ok(catalogService.getCatalogTree(type));
    }

    @PostMapping("/add")
    @Operation(summary = "新增目录")
    public ResResultDto<Long> addDataSecurityAccessCatalog(@RequestBody DataSecurityAccessCatalogNodeDto catalogNodeDto) {
        logUtils.addCatalogLog(catalogNodeDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), catalogNodeDto.getType());
        return ResResultDto.ok(catalogService.addCatalog(catalogNodeDto));
    }

    @PostMapping("/modify")
    @Operation(summary = "修改目录")
    public ResResultDto<DataSecurityAccessCatalogNodeDto> modifyDataSecurityAccessCatalog(@RequestBody DataSecurityAccessCatalogNodeDto catalogNodeDto) {
        logUtils.editCatalogLog(catalogNodeDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(),catalogNodeDto.getType());
        return ResResultDto.ok(catalogService.modifyCatalog(catalogNodeDto));
    }

    @PostMapping("/checkName")
    @Operation(summary = "目录重名校验")
    public ResResultDto<?> checkDataSecurityAccessCatalogName(@RequestBody DataSecurityAccessCatalogNodeDto catalogNodeDto) {
        return ResResultDto.ok(catalogService.checkName(catalogNodeDto.getName(), catalogNodeDto.getCatalogId(), catalogNodeDto.getParentId(), catalogNodeDto.getType()));
    }

    @PostMapping("/delete/{catalogId}/{type}")
    @Operation(summary = "删除目录")
    @Parameters({@Parameter(name = "catalogId", description = "访控策略目录id", in = ParameterIn.PATH)})
    public ResResultDto<DataSecurityAccessCatalogNodeDto> deleteDataSecurityAccessCatalog(@PathVariable("catalogId") Long catalogId,
                                                                                          @PathVariable("type") EnumCatalogType type) {

        DataSecurityAccessCatalogNodeDto dataSecurityAccessCatalogNodeDto = catalogService.findById(catalogId);
        catalogService.deleteCatalog(catalogId, type);
        logUtils.deleteCommitCatalog(dataSecurityAccessCatalogNodeDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(),type);
        return ResResultDto.ok(dataSecurityAccessCatalogNodeDto);
    }


    @PostMapping("/verify/{catalogId}/{type}")
    @Operation(summary = "验证能否删除目录")
    @Parameters({@Parameter(name = "catalogId", description = "访控策略目录id", in = ParameterIn.PATH)})
    public ResResultDto<Boolean> verifyDeleteDataSecurityAccessCatalog(@PathVariable("catalogId") Long catalogId,
                                                                       @PathVariable("type") EnumCatalogType type) {
        return ResResultDto.ok(catalogService.verifyCatalog(catalogId, type));
    }
}
