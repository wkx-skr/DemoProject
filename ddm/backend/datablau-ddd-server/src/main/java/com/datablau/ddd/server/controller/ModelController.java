package com.datablau.ddd.server.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.search.QueryIdCriteria;
import com.datablau.base.api.DatasourceService;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.ddd.common.dto.ResultWrapper;
import com.datablau.ddd.common.exception.BusinessException;
import com.datablau.ddd.data.dto.Column;
import com.datablau.ddd.data.dto.DwMappingSaveDto;
import com.datablau.ddd.data.dto.ModelDDLDto;
import com.datablau.ddd.data.dto.ModelDiffDto;
import com.datablau.ddd.data.dto.ModelDto;
import com.datablau.ddd.data.dto.ModelTreeNodeDto;
import com.datablau.ddd.data.dto.ModelTreeNodeHistoryDto;
import com.datablau.ddd.data.dto.ModelVersionDto;
import com.datablau.ddd.data.dto.ResResultDto;
import com.datablau.ddd.data.dto.TableVersionDiffDto;
import com.datablau.ddd.data.dto.automodel.AutoModelDto;
import com.datablau.ddd.data.dto.automodel.SavedTablesDto;
import com.datablau.ddd.data.dto.automodel.SqlAutoModelDto;
import com.datablau.ddd.data.enums.OperandType;
import com.datablau.ddd.data.enums.OperationType;
import com.datablau.ddd.data.jpa.entity.CodeTreeNode;
import com.datablau.ddd.data.jpa.entity.ModelTableApproval;
import com.datablau.ddd.data.jpa.entity.ModelTreeNode;
import com.datablau.ddd.data.jpa.entity.Project;
import com.datablau.ddd.data.jpa.entity.type.OperationProjectType;
import com.datablau.ddd.server.annotation.OperaLog;
import com.datablau.ddd.server.service.api.DdmService;
import com.datablau.ddd.server.service.api.ModelTreeService;
import com.datablau.ddd.server.service.api.ModelVersionDiffService;
import com.datablau.ddd.server.service.api.ProjectService;
import com.datablau.server.DatasourceBaseService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.common.collect.Sets;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "")
@RestController()
@RequestMapping("/model")
public class ModelController {

    public static final String FOLDER_NOT_EXIST = "folderNotExist";
    @Autowired
    MessageService msgService;

    @Autowired
    ModelTreeService modelTreeService;

    @Autowired
    DdmService ddmService;

    @Autowired
    ModelVersionDiffService modelVersionDiffService;

    @Autowired
    ProjectService projectService;

    @Autowired
    private DatasourceService datasourceService;

    @Autowired
    DatasourceBaseService datasourceBaseService;

    @Operation(summary = "根据项目id获取项目目录结构", description = "根据项目id获取项目目录结构")
    @GetMapping("/tree/{projectId}")
    public ModelTreeNode getTree(@PathVariable(value = "projectId") Long projectId) {
        return modelTreeService.getTree(projectId);
    }

    @Operation(summary = "根据条件搜索模型历史差异表")
    @PostMapping("/history/versions/diff")
    public List<TableVersionDiffDto> modelDiffTables(@RequestBody ModelDiffDto modelDiffDto) throws JsonProcessingException {
        return ddmService.getModelDiffTables(modelDiffDto.getModelId(), modelDiffDto.getStartVerId(),
                modelDiffDto.getEndVerId(),
                ENTITY_TYPE_CHANGE_FILTER_IDS, modelDiffDto.getProjectId(), modelDiffDto.getStatus(),
                modelDiffDto.getTableName(),
                modelDiffDto.getTheme(), modelDiffDto.getPageNo(), modelDiffDto.getPageSize());
    }
    private static Set<Long> ENTITY_TYPE_CHANGE_FILTER_IDS = Sets.newHashSet(
            LDMTypes.oAttribute,
            LDMTypes.oEntity
    // LDMTypes.oKeyGroup,
    // LDMTypes.oKeyGroupMember,
    // LDMTypes.oStoredProcedure,
    // LDMTypes.oFunction,
    // LDMTypes.oView,
    // LDMTypes.oSchema
    );

    @Operation(summary = "返回模型某个版本的所有主题")
    @GetMapping("/{modelId}/{version}/diagram")
    public Map<Long, String> modelDiagrams(@PathVariable Long modelId, @PathVariable Long version) {
        return ddmService.getModelDiagrams(modelId, version);
    }

    @OperaLog(operation = OperationType.INSERT, operand = OperandType.MODEL, operateTable = "ddd_model_tree_node", systemModule = OperationProjectType.PROJECT_DEVELOP, description = {
            "引入模型"})
    @Operation(summary = "引用模型")
    @PostMapping("/ref")
    public ModelTreeNode refModel(@RequestBody @Validated ModelTreeNodeDto modelTreeNodeDto) {
        List<ModelTreeNode> suspectDupFile = modelTreeService.getSuspectDup(modelTreeNodeDto);

        if (!suspectDupFile.isEmpty()) {
            throw new BusinessException(msgService.getMessage("duplicateFileNames"));
        }

        return modelTreeService.linkModel(modelTreeNodeDto);
    }

    @Operation(summary = "模型状态，已评审，已上线等")
    @GetMapping("/status/list")
    public List<String> modelStatusList() {
        List<String> status = new ArrayList<>();
        status.add("草稿");
        status.add("已评审");
        status.add("已上线");
        return status;
    }

    @OperaLog(operation = OperationType.UPDATE, operand = OperandType.MODEL, operateTable = "ddd_model_tree_node", systemModule = OperationProjectType.PROJECT_DEVELOP, description = {
            "更新模型"})
    @Operation(summary = "更新模型")
    @PutMapping("/ref")
    public ModelTreeNode updateRefModel(@RequestBody @Validated ModelTreeNodeDto modelTreeNodeDto) {
        ModelTreeNode modelTreeNode = modelTreeService.findModelTreeNodeById(modelTreeNodeDto);

        if (modelTreeNode == null) {
            throw new BusinessException(msgService.getMessage("modelNodeNotExist"));
        }

        return modelTreeService.updateLinkModel(modelTreeNode, modelTreeNodeDto);
    }

    @OperaLog(operation = OperationType.DELETE, operand = OperandType.MODEL, operateTable = "ddd_model_tree_node", systemModule = OperationProjectType.PROJECT_DEVELOP, description = {
            "删除引入模型"})
    @Operation(summary = "删除引用模型", description = "删除引用模型")
    @DeleteMapping("/ref")
    public void deleteModelRef(@RequestBody @Validated ModelTreeNodeDto modelTreeNodeDto) {
        modelTreeService.deleteModel(modelTreeNodeDto);
    }

    @Operation(summary = "引用多个模型")
    @PostMapping("/refs")
    public List<ModelTreeNode> refModels(@RequestBody @Validated List<ModelTreeNodeDto> modelTreeNodeDtos) {
        List<ModelTreeNode> res = new ArrayList<>();
        for (ModelTreeNodeDto modelTreeNodeDto : modelTreeNodeDtos) {
            List<ModelTreeNode> suspectDupFile = modelTreeService.getSuspectDup(modelTreeNodeDto);

            if (!suspectDupFile.isEmpty()) {
                continue;
            }

            res.add(modelTreeService.linkModel(modelTreeNodeDto));
        }
        return res;
    }

    @Operation(summary = "删除多个模型", description = "删除多个模型")
    @DeleteMapping("/refs")
    public void removeModelRefs(@RequestBody @Validated List<Long> modelTreeNodeIds) {
        modelTreeService.deleteModels(modelTreeNodeIds);
    }

    @OperaLog(operation = OperationType.INSERT, operand = OperandType.MODEL_FOLDER, operateTable = "ddd_model_tree_node", systemModule = OperationProjectType.PROJECT_DEVELOP, description = {
            "创建模型文件夹"})
    @Operation(summary = "创建文件夹", description = "创建文件夹")
    @PostMapping("/folder")
    public ModelTreeNode createFolder(@RequestBody @Validated ModelTreeNodeDto modelTreeNodeDto) {
        List<ModelTreeNode> suspectDup = modelTreeService.getSuspectDup(modelTreeNodeDto);

        if (!suspectDup.isEmpty()) {
            throw new BusinessException(msgService.getMessage("duplicateFolderNames"));
        }
        return modelTreeService.createFolder(modelTreeNodeDto);
    }

    @OperaLog(operation = OperationType.UPDATE, operand = OperandType.MODEL_FOLDER, operateTable = "ddd_model_tree_node", systemModule = OperationProjectType.PROJECT_DEVELOP, description = {
            "更新模型文件夹"})
    @Operation(summary = "更新文件夹", description = "更新文件夹")
    @PutMapping("/folder")
    public ModelTreeNode updateFolder(@RequestBody @Validated ModelTreeNodeDto modelTreeNodeDto) {
        ModelTreeNode folder = modelTreeService.getModelTreeNodeById(modelTreeNodeDto.getId());
        if (folder == null) {
            throw new BusinessException(msgService.getMessage(FOLDER_NOT_EXIST));
        }

        List<ModelTreeNode> suspectDup = modelTreeService.getSuspectDup(modelTreeNodeDto);
        if (!suspectDup.isEmpty() && !suspectDup.get(0).getId().equals(modelTreeNodeDto.getId())) {
            throw new BusinessException(msgService.getMessage("duplicateFolderNames"));
        }

        return modelTreeService.updateFolder(modelTreeNodeDto);
    }

    @OperaLog(operation = OperationType.DELETE, operand = OperandType.MODEL_FOLDER, operateTable = "ddd_model_tree_node", systemModule = OperationProjectType.PROJECT_DEVELOP, description = {
            "删除模型文件夹"})
    @Operation(summary = "删除文件夹", description = "删除文件夹")
    @DeleteMapping("/folder/{folderId}")
    public void deleteFolder(@PathVariable(value = "folderId") Long folderId) {
        ModelTreeNode folder = modelTreeService.getModelTreeNodeById(folderId);
        if (folder == null) {
            throw new BusinessException(msgService.getMessage(FOLDER_NOT_EXIST));
        }
        modelTreeService.deleteFolder(folder);
    }

    @Operation(summary = "移动文件夹或者文件", description = "移动文件夹或者文件")
    @PostMapping("/folder/move")
    public void moveFolder(@RequestParam(value = "folderId") Long folderId,
                           @RequestParam(value = "targetParentId") Long targetParentId) {
        ModelTreeNode folder = modelTreeService.getModelTreeNodeById(folderId);
        if (folder == null) {
            throw new BusinessException(msgService.getMessage(FOLDER_NOT_EXIST));
        }
        folder.setParentId(targetParentId);
        modelTreeService.saveFolder(folder);
    }

    @Operation(summary = "获取数据源", description = "获取数据源")
    @GetMapping("/getDataSource")
    public ResultWrapper<List<DatasourceProperties>> getDataSource(@RequestParam Long projectId) {
        Project projectInfo = projectService.getProjectById(projectId);
        if (projectInfo == null) {
            return ResultWrapper.getErrorResultWrapper("无法获取项目信息");
        }
        if (projectInfo.getTestDataSource() == null) {
            return ResultWrapper.getSuccessResultWrapper(new ArrayList<>());
        }
        List<Integer> ds = projectInfo.getTestDataSource();
        List<String> datasourceIds = ds.stream()
                .map(String::valueOf)
                .toList();
        QueryIdCriteria criteria = new QueryIdCriteria();
        criteria.setIds(datasourceIds);
        List<DatasourceProperties> datasources = datasourceService.getDatasources(criteria);
        return ResultWrapper.getSuccessResultWrapper(datasources);
    }

    @Operation(summary = "保存DDL", description = "保存DDL")
    @PostMapping("/saveDDL")
    public ResResultDto<String> saveDDL(@RequestBody ModelDDLDto modelDDLDto) {
        return modelTreeService.saveDDL(modelDDLDto);
    }

    @Operation(summary = "签入版本", description = "签入版本")
    @PostMapping("/version/{version}")
    public ResResultDto<String> insertVersion(@RequestBody ModelDDLDto modelDDLDto,
                                              @PathVariable("version") String version) {
        modelTreeService.insertVersion(modelDDLDto, version);
        modelTreeService.saveDDL(modelDDLDto);
        return ResResultDto.ok();
    }

    @Operation(summary = "获取版本列表", description = "获取版本列表")
    @GetMapping("/version/list")
    public List<ModelTreeNodeHistoryDto> getVersionList(@RequestParam("projectId") Long projectId,
                                                        @RequestParam("modelId") Long modelId) {
        return modelTreeService.getVersionList(projectId, modelId);
    }

    @Operation(summary = "获取DDL", description = "获取DDL")
    @GetMapping("/getDDL")
    public ModelTreeNode getSavedDDL(@RequestParam("id") Long id) {
        return modelTreeService.getModelTreeNodeById(id);
    }

    @Operation(summary = "模型发布", description = "模型发布")
    @PostMapping("/version/publish")
    public ResResultDto<String> publishModelVersion(@RequestBody List<ModelTableApproval> modelTableApprovalList) {
        return modelTreeService.publishModelVersion(modelTableApprovalList);
    }

    @Operation(summary = "模型导出xml", description = "模型导出xml")
    @PostMapping("/xmls")
    public void exportModels(@RequestBody List<ModelDto> models) {
        modelTreeService.getModelsXml(models);
    }

    @GetMapping("/modelIds")
    public List<ModelVersionDto> getModelIdAndVersions(@RequestParam("projectId") Long projectId) {
        List<ModelTreeNode> modelList = modelTreeService.getAllModelsByProjectId(projectId);
        List<ModelVersionDto> modelVersionDtoList = new ArrayList<>();
        if (!modelList.isEmpty()) {
            for (ModelTreeNode model : modelList) {
                ModelVersionDto modelVersionDto = new ModelVersionDto();
                modelVersionDto.setModelId(model.getModelId());
                String modelVersion = model.getEndVersion().getVersion();
                Long version = null;
                if (!"9223372036854776000".equals(modelVersion)) {
                    version = Long.parseLong(modelVersion);
                }
                modelVersionDto.setModelVersion(version);
                modelVersionDtoList.add(modelVersionDto);
            }
        }
        return modelVersionDtoList;
    }

    @PostMapping("/dwMapping/{datasourceId}/table/{tableName}")
    public String getDwMappingByTable(@PathVariable("datasourceId") Long datasourceId,
                                      @PathVariable("tableName") String tableName) {
        return modelTreeService.getDwMappingByTableName(datasourceId, tableName);
    }

    @PostMapping("/dwMapping/file/save")
    public CodeTreeNode saveDwMappingInsertSql(@RequestBody DwMappingSaveDto dwMappingSaveDto) {
        return modelTreeService.saveDwMappingInsertSql(dwMappingSaveDto);
    }

    @PostMapping("/autoModel")
    public ResResultDto<String> createAutoModel(@RequestBody AutoModelDto autoModelDto) {
        modelTreeService.createAutoModel(autoModelDto);
        return ResResultDto.ok();
    }

    @PostMapping("/autoModel/sql")
    public List<List<Column>> createAutoModelBySql(SqlAutoModelDto sqlAutoModelDto) {
        Map<String, Column> columnMap = new HashMap<>();
        try {
            List<Column> columns = datasourceBaseService.getRawColumnDetailsByModelSchemaAndTableInfo(
                    sqlAutoModelDto.getDatasourceId(), sqlAutoModelDto.getSchemaName(),
                    sqlAutoModelDto.getTableName());
            columns.forEach(column -> {
                String expression =
                        sqlAutoModelDto.getSchemaName() + "." + sqlAutoModelDto.getTableName() + "." + column.getName();
                column.setExpression(expression);
                columnMap.put(column.getName(), column);
            });
        } catch (Exception e) {
            throw new BusinessException("获取元数据信息时失败");
        }
        List<List<Column>> resultList = new ArrayList<>();
        List<List<String>> headerList = sqlAutoModelDto.getHeaderList();
        for (List<String> headers : headerList) {
            List<Column> elements = new ArrayList<>();
            for (String header : headers) {
                Column column = new Column(header, false, true, "varchar(255)", 255, false, header);
                elements.add(columnMap.getOrDefault(header, column));
            }
            resultList.add(elements);
        }
        return resultList;
    }

    @PostMapping("/autoModel/saveTables/{modelId}/{modelType}")
    public void saveTables(@RequestBody List<SavedTablesDto> dtoList,
                           @PathVariable Long modelId,
                           @PathVariable String modelType) {

        modelTreeService.saveTables(dtoList, modelId, modelType);

    }
}
