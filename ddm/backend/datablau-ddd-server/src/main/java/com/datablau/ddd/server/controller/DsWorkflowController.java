package com.datablau.ddd.server.controller;

import io.swagger.v3.oas.annotations.Parameter;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSON;
import com.andorj.model.common.api.MessageService;
import com.datablau.ddd.common.constant.DolphinSchedulerConstants;
import com.datablau.ddd.common.exception.BusinessException;
import com.datablau.ddd.common.threadpool.ThreadPoolInstance;
import com.datablau.ddd.data.dto.DataSourceCreateTableDto;
import com.datablau.ddd.data.dto.ResResultDto;
import com.datablau.ddd.data.dto.dolphinscheduler.DsDataxTaskDefinitionDto;
import com.datablau.ddd.data.dto.dolphinscheduler.DsDataxTaskForm;
import com.datablau.ddd.data.dto.dolphinscheduler.DsDataxTaskRelationDto;
import com.datablau.ddd.data.enums.OperandType;
import com.datablau.ddd.data.enums.OperationType;
import com.datablau.ddd.data.enums.ResourceType;
import com.datablau.ddd.data.jpa.entity.CodeTreeNode;
import com.datablau.ddd.data.jpa.entity.type.OperationProjectType;
import com.datablau.ddd.data.jpa.repository.ProjectRepository;
import com.datablau.ddd.ds.service.DolphinSchedulerDataxService;
import com.datablau.ddd.lineage.service.ProjectLineageImportService;
import com.datablau.ddd.server.annotation.OperaLog;
import com.datablau.ddd.server.service.api.CodeTreeService;
import com.datablau.ddd.server.service.api.DsEnvService;
import com.datablau.server.DatasourceBaseService;

@RestController
@RequestMapping("/workflow")
public class DsWorkflowController {

    @Autowired
    MessageService msgService;

    @Autowired
    DolphinSchedulerDataxService dolphinSchedulerDataxService;

    @Autowired
    DsEnvService dsEnvService;

    @Autowired
    CodeTreeService codeTreeService;

    @Autowired
    DatasourceBaseService datasourceBaseService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectLineageImportService projectLineageImportService;

    private static final Logger logger = LoggerFactory.getLogger(DsWorkflowController.class);

    @OperaLog(operation = OperationType.INSERT, operand = OperandType.DATAX, operateTable = "ddd_code_tree_node", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "创建数据同步文件"})
    @PostMapping("/{genNum}/{projectId}")
    public ResResultDto<Long> createAndRunDataxWorkflow(@PathVariable(value = "genNum") Integer genNum,
                                                        @Parameter(description = "当前项目Id") @PathVariable(value = "projectId") Long projectId,
                                                        @Parameter(description = "创建后是否运行") @RequestParam(value = "isRun", required = false, defaultValue = "true") Boolean isRun,
                                                        @Parameter(description = "当前环境") @RequestParam(value = "env", required = false) String env,
                                                        @Parameter(description = "是否是修改数据同步") @RequestParam(value = "isUpdate", required = false, defaultValue = "false") Boolean isUpdate,
                                                        @Parameter(description = "数据表单") @RequestBody DsDataxTaskForm form) throws IOException, ExecutionException, InterruptedException {
        env = this.verifyEnv(env);
        // 获取dolphin节点id
        int taskCodeSize = form.getDsDataxTaskDefinitionDto().get(0).getDtTable().size();
        // 所有表时由后端获取各表信息
        if (form.getDsDataxTaskDefinitionDto().get(0).getIsWholeTable() == 1) {
            List<String> tableList = datasourceBaseService.getRawTablesByModelAndSchema(form.getFromModelId(),
                    form.getDsDataxTaskDefinitionDto().get(0).getDsDatabase(), 1, 200000, "").getContent();
            taskCodeSize = tableList.size();
        }
        List<Long> taskCodes = new ArrayList<>();
        // 与同步表数量一致
        for (int i = 0; i < taskCodeSize; i++) {
            String taskCode = dolphinSchedulerDataxService.genTaskCodeList(projectId, genNum, env);
            Long code = Long.parseLong(taskCode);
            taskCodes.add(code);
        }
        DsDataxTaskDefinitionDto taskDefinitionDto = form.getDsDataxTaskDefinitionDto().get(0);

        Map<String, List<String>> formConditionMap = new HashMap<>(form.getConditionMap());
        List<DsDataxTaskDefinitionDto> formTaskDefinition = new ArrayList<>();
        List<DsDataxTaskRelationDto> formRelation = new ArrayList<>();
        formTaskDefinition.add(form.getDsDataxTaskDefinitionDto().get(0));
        formRelation.add(form.getDsDataxTaskRelationDto().get(0));

        // 重建表单
        DsDataxTaskForm formDto = new DsDataxTaskForm(formTaskDefinition,
                formRelation, form.getLocations(), form.getName(),
                form.getTenantCode(), form.getExecutionType(), form.getDescription(),
                form.getGlobalParams(), form.getTimeout(), form.getCodeTreeNodeDto(), form.getDdl(), formConditionMap,
                form.getType(), form.getIsMultiplex(), form.getRowLimit(), form.getFromModelId(), form.getToModelId(),
                form.getIsIncrease(), form.getSyncColumnMap());
        int datasourceId = taskDefinitionDto.getTaskParams().getDataSource();
        int dataTargetId = taskDefinitionDto.getTaskParams().getDataTarget();
        List<String> dsTables = taskDefinitionDto.getDsTable();
        List<String> dtTables = taskDefinitionDto.getDtTable();
        String fileName = taskDefinitionDto.getName();
        long truncateCode = 0L;
        long ddlCode = 0L;

        // 是否清空目标表记录
        Integer isDeleted = taskDefinitionDto.getIsDeleted();
        // 1. 选择根据源表生成目标表 2. 全表同步(全表同步中各个表的DDL由后端生成) 3. DDL由一个节点执行
        if (form.getIsMultiplex().equals("2")
                || !StringUtils.isEmpty(form.getDdl()) || taskDefinitionDto.getIsWholeTable() == 1) {
            String ddlTaskCode = dolphinSchedulerDataxService.genTaskCodeList(projectId, genNum, env);
            ddlCode = Long.parseLong(ddlTaskCode);
        }
        // 除hive外 其他类型的数据库作为目标库都可以在datax模板中的preSql写truncate语句
        if (isDeleted == 1 && taskDefinitionDto.getTaskParams().getDtType().equals(DolphinSchedulerConstants.HIVE)) {
            String truncateTaskCode = dolphinSchedulerDataxService.genTaskCodeList(projectId, genNum, env);
            truncateCode = Long.parseLong(truncateTaskCode);
        }
        // 创建任务
        Map<String, Object> resultMap = dolphinSchedulerDataxService.createProcessDefinition(form,
                taskCodes, ddlCode,
                truncateCode, projectId, isUpdate, env);
        String workflowJson = (String) resultMap.get("workflowJson");

        Long workflowCode = JSON.parseObject(workflowJson).getLong("workflowCode");
        String workflowName = JSON.parseObject(workflowJson).getString("name");

        // 上线工作流
        dolphinSchedulerDataxService.releaseProcessDefinition(workflowCode, workflowName, "ONLINE",
                projectId, env);
        // 运行工作流
        if (Boolean.TRUE.equals(isRun)) {
            dolphinSchedulerDataxService.startProcessInstance(workflowCode, projectId, 1, env);
        }
        // 创建文件&写入信息
        String content =
                dolphinSchedulerDataxService.queryTaskDefinitionDetail(formDto, workflowCode,
                        workflowName, taskCodes,
                        ddlCode, truncateCode, projectId, datasourceId, dataTargetId,
                        dsTables,
                        dtTables, fileName, env);
        formDto.getCodeTreeNodeDto().setContent(content);
        CodeTreeNode resultNode;
        if (Boolean.TRUE.equals(isUpdate)) {
            resultNode = codeTreeService.updateFileForDatax(formDto.getCodeTreeNodeDto().getCodeDetailId(), content);
        } else {
            resultNode = codeTreeService.createFile(formDto.getCodeTreeNodeDto());
        }
        ThreadPoolInstance.execute(() -> {
            try {
                projectLineageImportService.analysisDatax(projectId, resultNode.getId());
            } catch (Exception e) {
                logger.error("解析datax血缘失败,文件id为[{}],错误原因为：{}", resultNode.getId(), e.getMessage());
            }
        });
        return ResResultDto.ok(resultNode.getCodeDetailId());
    }

    @PostMapping("/{projectId}/{workflowCode}/start")
    public void startProcessInstance(@PathVariable(value = "projectId") Long projectId,
                                     @PathVariable(value = "workflowCode") Long workflowCode,
                                     @RequestParam(value = "env", required = false) String env) {
        env = this.verifyEnv(env);
        dolphinSchedulerDataxService.startProcessInstance(workflowCode, projectId, 0, env);
    }

    @PostMapping("/{projectId}/simpleList")
    public String queryProcessDefinitionList(@PathVariable(value = "projectId") Long projectId,
                                             @RequestParam(value = "env", required = false) String env) {
        return dolphinSchedulerDataxService.queryProcessDefinitionList(projectId, this.verifyEnv(env));
    }

    @PostMapping("/{projectId}/list")
    public String queryProcessDefinitionDetailedList(@PathVariable(value = "projectId") Long projectId,
                                                     @RequestParam(value = "env", required = false) String env,
                                                     @RequestParam(value = "isPublish", required = false, defaultValue = "0") String isPublish) {
        return dolphinSchedulerDataxService.queryProcessDefinitionDetailedList(projectId, this.verifyEnv(env),
                isPublish);
    }

    @GetMapping("/environment")
    public String queryAllEnvironmentList(@RequestParam(value = "env", required = false) String env) {
        return dolphinSchedulerDataxService.queryAllEnvironmentList(this.verifyEnv(env));
    }

    @GetMapping("/workerGroup")
    public String queryAllWorkerGroups(@RequestParam(value = "env", required = false) String env) {
        return dolphinSchedulerDataxService.queryAllWorkerGroups(this.verifyEnv(env));
    }

    @GetMapping("/taskGroup")
    public String queryTaskGroupByCode(@RequestParam("pageNo") Integer pageNo,
                                       @RequestParam(value = "projectId", required = false) Long projectId,
                                       @RequestParam("pageSize") Integer pageSize,
                                       @RequestParam(value = "env", required = false) String env) {
        return dolphinSchedulerDataxService.queryTaskGroupByCode(pageNo, pageSize, projectId, this.verifyEnv(env));
    }

    @GetMapping("/resources")
    public String queryResourceList(@RequestParam(value = "type") ResourceType type,
                                    @RequestParam(value = "env", required = false) String env) {
        return dolphinSchedulerDataxService.queryResourceList(type, this.verifyEnv(env));
    }

    @GetMapping("/datasource")
    public String queryDataSource(@RequestParam(value = "env", required = false) String env) {
        env = this.verifyEnv(env);
        return dolphinSchedulerDataxService.queryDataSourceListPaging(env);
    }

    @PostMapping("/datasource/{type}")
    public String queryDataSourceByType(@PathVariable(value = "type") String type,
                                        @RequestParam(value = "env", required = false) String env) {
        env = this.verifyEnv(env);
        return dolphinSchedulerDataxService.queryDataSourceListPagingByType(type, env);
    }

    @PostMapping("/{projectId}/processName")
    public List<String> queryProcessNameByWorkflowCode(@PathVariable(value = "projectId") Long projectId,
                                                       @RequestBody List<Long> workflowCode,
                                                       @RequestParam(value = "env", required = false, defaultValue = "test") String env) {
        return dolphinSchedulerDataxService.queryProcessNameByWorkflowCode(projectId, workflowCode, env);
    }

    // 项目发布到其他环境
    @PostMapping(value = "/{projectCode}/import")
    public ResResultDto<String> importProcessDefinition(@PathVariable("projectCode") Long projectCode,
                                                        @RequestParam(value = "projectId") Long projectId,
                                                        @RequestParam("versionId") Long versionId,
                                                        @RequestParam(value = "env") String env) {
        return dolphinSchedulerDataxService.importProcessDefinition(projectCode, versionId, projectId, env);
    }

    @PostMapping("/{projectId}/projectCode")
    public Long getDsProjectCode(@PathVariable("projectId") Long projectId) {
        return dolphinSchedulerDataxService.getDsProjectCode(projectId);
    }

    @PostMapping("/ddl/init")
    public String initDDL(@RequestBody List<DataSourceCreateTableDto> dataSourceCreateTableDtos) throws IOException, InterruptedException, ExecutionException {
        StringBuilder ddl = new StringBuilder();
        String databaseType = dataSourceCreateTableDtos.get(0).getToDBType();
        CountDownLatch countDownLatch = new CountDownLatch(dataSourceCreateTableDtos.size());
        List<Future<StringBuilder>> res = new ArrayList<>();
        Map<String, String> map = dolphinSchedulerDataxService.getDataTypeMappings(
                dataSourceCreateTableDtos.get(0).getFromDBType(),
                dataSourceCreateTableDtos.get(0).getToDBType());
        String delimiter = dataSourceCreateTableDtos.get(0).getDelimiter();
        for (DataSourceCreateTableDto dto : dataSourceCreateTableDtos) {
            Future<StringBuilder> submit = ThreadPoolInstance.submit(
                    () -> {
                        StringBuilder stringBuilder = new StringBuilder();
                        try {
                            stringBuilder = dolphinSchedulerDataxService.dropScript(
                                    delimiter, databaseType, dto, map);
                        } catch (Exception e) {
                            throw new BusinessException(
                                    "生成" + dto.getToschemaName() + "." + dto.getToTableName()
                                            + "的DDL脚本失败:" + e.getMessage());
                        } finally {
                            countDownLatch.countDown();
                        }
                        return stringBuilder;
                    });
            res.add(submit);
        }
        countDownLatch.await();
        for (Future<StringBuilder> sub : res) {
            ddl.append(sub.get());
        }
        return ddl.toString();
    }

    public String verifyEnv(String env) {
        String defaultEnv = "test";
        return env == null ? defaultEnv : env;
    }
}
