package com.datablau.data.asset.controller.discern;

import com.datablau.data.asset.api.discern.DataAssetsDiscernCatalogService;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.dto.discern.DataAssetsCatalogValueDto;
import com.datablau.data.asset.dto.discern.DataAssetsDiscernCatalogNodeDto;
import com.datablau.data.asset.enums.discern.EnumCatalogType;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * <p>
 * 访控策略目录接口
 * <p>
 *
 * @author weijiakun
 * @create 2023-02-28 14:44
 */
@RequestMapping("/discern/catalog")
@RestController
@Tag(name = "访控策略目录 REST API")
public class DataAssetsDiscernCatalogController extends BaseController {

    @Autowired
    private DataAssetsDiscernCatalogService catalogService;

    public DataAssetsDiscernCatalogController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping("/tree")
    @Operation(summary = "获取目录树")
    public ResResultDto<DataAssetsDiscernCatalogNodeDto> getDataSecurityAccessCatalogTree(@RequestParam("type") EnumCatalogType type) {
        return ResResultDto.ok(catalogService.getCatalogTree(type));
    }

    @PostMapping("/add")
    @Operation(summary = "新增目录")
    public ResResultDto<Long> addDataSecurityAccessCatalog(@RequestBody DataAssetsDiscernCatalogNodeDto catalogNodeDto) {
        return ResResultDto.ok(catalogService.addCatalog(catalogNodeDto));
    }

    @PostMapping("/modify")
    @Operation(summary = "修改目录")
    public ResResultDto<DataAssetsDiscernCatalogNodeDto> modifyDataSecurityAccessCatalog(@RequestBody DataAssetsDiscernCatalogNodeDto catalogNodeDto) {
        return ResResultDto.ok(catalogService.modifyCatalog(catalogNodeDto));
    }

    @PostMapping("/checkName")
    @Operation(summary = "目录重名校验")
    public ResResultDto<?> checkDataSecurityAccessCatalogName(@RequestBody DataAssetsDiscernCatalogNodeDto catalogNodeDto) {
        return ResResultDto.ok(catalogService.checkName(catalogNodeDto.getName(), catalogNodeDto.getCatalogId(), catalogNodeDto.getParentId(), catalogNodeDto.getType()));
    }

    @PostMapping("/delete/{catalogId}/{type}")
    @Operation(summary = "删除目录")
    @Parameters({@Parameter(name = "catalogId", description = "访控策略目录id", in = ParameterIn.PATH)})
    public ResResultDto<DataAssetsDiscernCatalogNodeDto> deleteDataSecurityAccessCatalog(@PathVariable("catalogId") Long catalogId,
                                                                                         @PathVariable("type") EnumCatalogType type) {

        DataAssetsDiscernCatalogNodeDto dataAssetsDiscernCatalogNodeDto = catalogService.findById(catalogId);
        catalogService.deleteCatalog(catalogId, type);
        return ResResultDto.ok(dataAssetsDiscernCatalogNodeDto);
    }


    @PostMapping("/verify/{catalogId}/{type}")
    @Operation(summary = "验证能否删除目录")
    @Parameters({@Parameter(name = "catalogId", description = "访控策略目录id", in = ParameterIn.PATH)})
    public ResResultDto<Boolean> verifyDeleteDataSecurityAccessCatalog(@PathVariable("catalogId") Long catalogId,
                                                                       @PathVariable("type") EnumCatalogType type) {
        return ResResultDto.ok(catalogService.verifyCatalog(catalogId, type));
    }
}
