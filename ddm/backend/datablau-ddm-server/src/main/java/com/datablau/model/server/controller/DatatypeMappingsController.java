package com.datablau.model.server.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.DatatypeMappingsService;
import com.datablau.model.data.jpa.entity.DatatypeMapSettings;
import com.datablau.model.data.security.UserRights;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.utils.utility.DbType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController("datatypeMappingsController")
@ConditionalOnMissingBean(name = "datatypeMappingsControllerExt")
@RequestMapping("/datatype")
@Tag(name = "数据类型转换设置相关REST API", description = "数据类型转换设置相关REST API")
public class DatatypeMappingsController extends BaseController {

    @Autowired
    protected DatatypeMappingsService datatypeMappingsService;

    @GetMapping("/")
    @Operation(summary = "获取所有模型类型的数据类型转换设置", description = "获取所有模型类型的数据类型转换设置，key为大写的模型类型，目前客户端会调用该接口")
    public Map<String, DatatypeMapSettings> getDatatypeMapSettings() {
        return datatypeMappingsService.getDatatypeMapSettings();
    }

    @GetMapping("/list")
    @Operation(summary = "获取模型类型列表", description = "获取模型类型列表")
    public List<DatatypeMapSettings> getDataTypes() {
        return datatypeMappingsService.getDatatypes();
    }

    @GetMapping("/{dbType}")
    @Operation(summary = "获取指定模型类型的数据类型转换设置", description = "获取指定模型类型的数据类型转换设置")
    public DatatypeMapSettings getDataTypeMapSettings(@Parameter(description = "模型类型", required = true) @PathVariable("dbType") DbType dbType) {
        return datatypeMappingsService.getDatatypes(dbType);
    }

    @PostMapping("/{dbType}")
    @PreAuthorize(UserRights.HAS_DATA_TYPE_MANAGE_ROLE)
    @Operation(summary = "修改指定模型类型的数据类型转换设置", description = "修改指定模型类型的数据类型转换设置")
    public DatatypeMapSettings setDataTypeMapSettings(@Parameter(description = "模型类型", required = true) @PathVariable("dbType") DbType dbType,
                                                      @Parameter(description = "数据类型转换设置", required = true) @RequestBody DatatypeMapSettings settings) {
        settings.setListUpdater(AuthTools.currentUsernameFailFast());
        settings.setModelType(dbType.name());
        return datatypeMappingsService.setDatatypeMapSettings(settings);
    }

    @PostMapping(value = "/upload/{dbType}")
    @PreAuthorize(UserRights.HAS_DATA_TYPE_MANAGE_ROLE)
    @Operation(summary = "导入excel转字符串给前端，不存数据库", description = "导入excel转字符串给前端，不存数据库")
    public String uploadFile(@Parameter(description = "模型类型", required = true) @PathVariable("dbType") DbType dbType,
                             @Parameter(description = "数据类型转换excel", required = true) @RequestParam("file") MultipartFile file) throws Exception {
        return datatypeMappingsService.uploadDatatypeMapToString(dbType, file);
    }

    @PostMapping(value = "/export/{dbType}")
    @PreAuthorize(UserRights.HAS_DATA_TYPE_MANAGE_ROLE)
    @Operation(summary = "导出指定模型类型的数据类型转换excel", description = "导出指定模型类型的数据类型转换excel")
    public ResponseEntity<Resource> exportDatatypeTemplate(@Parameter(description = "模型类型", required = true) @PathVariable("dbType") DbType dbType) throws Exception {
        return datatypeMappingsService.exportDatatypeTemplate(dbType);

    }

}
