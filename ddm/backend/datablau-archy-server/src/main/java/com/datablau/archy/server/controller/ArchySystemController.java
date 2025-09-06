package com.datablau.archy.server.controller;

import com.andorj.model.common.dto.ExcelLoadJobResult;
import com.datablau.archy.common.enums.ArchyType;
import com.datablau.archy.server.dto.excel.ArchySystemExcelDto;
import com.datablau.archy.server.dto.query.ArchySystemQueryDto;
import com.datablau.archy.server.jpa.entity.ArchySystem;
import com.datablau.archy.server.jpa.entity.ArchyUdp;
import com.datablau.archy.server.service.ArchySystemService;
import com.datablau.archy.server.service.ArchyUdpService;
import com.datablau.archy.server.utils.DataUtility;
import com.datablau.data.common.api.ExcelLoader;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/system")
@Tag(name = "Archy应用系统相关REST API", description = "Archy应用系统REST API")
public class ArchySystemController extends BaseController {

    @Autowired
    private ArchySystemService archySystemService;

    @Autowired
    private ArchyUdpService archyUdpService;

    @Autowired
    private ExcelLoader excelLoader;

    @Operation(summary = "根据条件查询应用系统")
    @PostMapping("/systems")
    public Page<ArchySystem> findArchySystems(@RequestBody ArchySystemQueryDto archySystemQueryDto,
                                              @Parameter(description = "当前页，默认值是1") @RequestParam(name = "currentPage", required = false, defaultValue = "1") Integer currentPage,
                                              @Parameter(description = "页面大小") @RequestParam(name = "pageSize", required = false, defaultValue = "9999") Integer pageSize) {
        return archySystemService.findArchySystems(archySystemQueryDto, currentPage, pageSize);
    }

    @Operation(summary = "创建应用系统")
    @PostMapping("/system")
    public ArchySystem createArchySystem(@RequestBody ArchySystem system) {
        return archySystemService.createArchySystem(system);
    }

    @Operation(summary = "更新应用系统")
    @PutMapping("/system")
    public ArchySystem updateArchySystem(@RequestBody ArchySystem system) {
        return archySystemService.updateArchySystem(system);
    }

    @Operation(summary = "删除应用系统")
    @DeleteMapping("/system/{systemId}")
    public void deleteArchySystem(@Parameter(description = "系统域ID", required = true) @PathVariable Long systemId) {
        archySystemService.deleteArchySystem(systemId);
    }

    @GetMapping(value = "/system/udps")
    @Operation(summary = "查询UDP")
    public List<ArchyUdp> getArchySystemUdps() {
        return archyUdpService.getUdps(ArchyType.SYSTEM);
    }

    @PostMapping(value = "/system/udp")
    @Operation(summary = "创建UDP")
    public void createArchySystemUdp(@RequestBody List<ArchyUdp> udpList,
                                     @Parameter(description = "是否删除旧数据") @RequestParam(required = false, defaultValue = "false") Boolean forceClear) {
        archyUdpService.createUdps(udpList, ArchyType.SYSTEM, forceClear);
    }

    @PostMapping("/systems/import")
    @Operation(summary = "导入应用系统")
    public String importArchySystems(@Parameter(description = "导入应用系统的excel文件") @RequestParam("file") MultipartFile multipartFile) throws Exception {
        String filePath = DataUtility.uploadFile(multipartFile).getAbsolutePath();
        ExcelLoadJobResult<ArchySystemExcelDto> loadJobResult = excelLoader.loadFile(filePath, 0, ArchySystemExcelDto.class);
        return archySystemService.importArchySystems(loadJobResult.getLoaded());
    }

    @PostMapping(value = "/systems/export/template")
    @Operation(summary = "导出应用系统模板")
    public ResponseEntity<Resource> exportArchySystemTemplate() throws Exception {
        return archySystemService.exportArchySystemTemplate();
    }

    @PostMapping(value = "/systems/export")
    @Operation(summary = "导出应用系统")
    public ResponseEntity<byte[]> exportArchySystems() {
        return DataUtility.generalResponseEntityByFile(archySystemService.exportArchySystems());
    }
}
