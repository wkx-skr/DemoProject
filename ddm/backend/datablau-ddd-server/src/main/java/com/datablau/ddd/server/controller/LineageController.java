package com.datablau.ddd.server.controller;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.andorj.lineage.data.LineageContainer;
import com.datablau.ddd.common.dto.Property;
import com.datablau.ddd.data.dto.LineageAnalysisRecordDto;
import com.datablau.ddd.data.dto.PageableResult;
import com.datablau.ddd.data.dto.RunSqlDto;
import com.datablau.ddd.data.enums.OperandType;
import com.datablau.ddd.data.enums.OperationType;
import com.datablau.ddd.data.jpa.entity.ProjectVersion;
import com.datablau.ddd.data.jpa.entity.type.OperationProjectType;
import com.datablau.ddd.data.jpa.repository.ProjectVersionRepository;
import com.datablau.ddd.lineage.service.LineageService;
import com.datablau.ddd.lineage.service.ProjectLineageImportService;
import com.datablau.ddd.server.annotation.OperaLog;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * @author Nicky
 * @since 1.0
 */
@RestController
@RequestMapping("/lineage")
// @Feature(LicenseInfo.FE_LINEAGE)
@Tag(name = "血缘相关API")
public class LineageController {

    @Autowired
    ProjectLineageImportService projectLineageImportService;

    @Autowired
    private ProjectVersionRepository projectVersionRepository;

    @Autowired
    private LineageService lineageService;

    @OperaLog(operation = OperationType.INSERT, operand = OperandType.LINEAGE, operateTable = "ddd_lineage_analysis_record", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "刷新血缘"})
    @Operation(summary = "单个程序解析血缘")
    @GetMapping(value = "/analysisOne/{projectId}/{fileId}")
    public void analysisOne(@PathVariable Long projectId, @PathVariable Long fileId) throws Exception {
        projectLineageImportService.analysisOne(projectId, fileId);
    }

    @OperaLog(operation = OperationType.ONCLICK, operand = OperandType.LINEAGE, operateTable = "ddd_lineage_analysis_record", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "一键血缘解析"})
    @Operation(summary = "对项目最新版本发布的文件进行血缘解析")
    @GetMapping(value = "/analysisLatestVersion/{projectId}")
    public Map<String, Object> analysisLatestVersion(@PathVariable Long projectId) throws Exception {
        // 查已通过版本中最新一条数据
        ProjectVersion projectVersion =
                projectVersionRepository.findTopByProjectIdAndStatusOrderByUpdateTimeDesc(projectId, "2");
        Long projectVersionId = projectVersion == null ? null : projectVersion.getId();
        return projectLineageImportService.analysisLineage(projectId, projectVersionId);
    }

    @Operation(summary = "血缘记录列表")
    @GetMapping(value = "/getLineageRecordList/{projectId}")
    public PageableResult<LineageAnalysisRecordDto> getLineageRecordList(@PathVariable Long projectId,
                                                                         @RequestParam Integer currentPage,
                                                                         @RequestParam Integer pageSize,
                                                                         @RequestParam(required = false) String fileName) {

        return projectLineageImportService.getLineageRecordList(projectId, currentPage, pageSize, fileName);
    }

    @OperaLog(operation = OperationType.DELETE, operand = OperandType.LINEAGE, operateTable = "ddd_lineage_analysis_record", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "清空解析日志"})
    @Operation(summary = "清空血缘记录列表")
    @DeleteMapping(value = "/deleteLineageRecordList/{projectId}")
    public void deleteLineageRecordList(@PathVariable Long projectId) {

        projectLineageImportService.deleteLineageRecordList(projectId);
    }

    @GetMapping(value = "/delete/{folderId}")
    public void delete(@PathVariable Long folderId) {
        projectLineageImportService.deleteProjectLineageFolder(folderId, true);
    }

    @Operation(summary = "根据模型id直接解析出对应血缘")
    @PostMapping(value = "/parse")
    public LineageContainer parseLineage(@RequestBody RunSqlDto runSqlDto) {
        String sql = new String(Base64.getDecoder().decode(runSqlDto.getSql()), StandardCharsets.UTF_8);
        for (Property param : runSqlDto.getProperties()) {
            sql = sql.replace("${" + param.getProp() + "}", "'" + param.getValue() + "'");
        }
        return lineageService.parseSqlLineage(runSqlDto.getDatasourceId(), sql);
    }

}
