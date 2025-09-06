package com.datablau.model.server.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedSystemException;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.data.Data.ProtoObjectX;
import com.andorj.file.transfer.api.RemoteFileLoader;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.base.api.FileService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.model.data.api.ModelService;
import com.datablau.model.data.api.ReverseTaskSerice;
import com.datablau.model.data.api.ScriptService;
import com.datablau.model.data.api.semantic.RuleChecker;
import com.datablau.model.data.dto.CreateModelDto;
import com.datablau.model.data.dto.NewModelDto;
import com.datablau.model.data.dto.ReverseTaskDto;
import com.datablau.model.data.dto.RuleCheckResultDto;
import com.datablau.model.data.dto.SaveModelDto;
import com.datablau.model.data.utility.SpringContextUtils;
import com.datablau.model.local.utility.ServerConstants;
import com.datablau.model.res.data.ResResult;
import com.datablau.model.res.view.ParsedView;
import com.datablau.model.rex.dto.ConnectionInfoDto;
import com.datablau.model.rex.dto.JobProgress;
import com.datablau.model.rex.dto.ReverseEngineeringDto;
import com.datablau.model.rex.re.ReverseForwardEngineering;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.server.dto.SqlDto;
import com.datablau.model.server.utils.ServerExceptionCode;
import com.datablau.model.server.utils.UploadFile;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Set;

/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/11/7 0007 下午 6:05
 */

@RequestMapping("/re")
@RestController("reverseEngineeringController")
@ConditionalOnMissingBean(name = "reverseEngineeringControllerExt")
@Tag(name = "逆向工程相关REST", description = "逆向工程相关REST")
public class ReverseEngineeringController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(ReverseEngineeringController.class);
    protected static final ObjectMapper mapper = new ObjectMapper();
    @Autowired
    protected MessageService msgService;
    @Autowired
    protected ReverseTaskSerice jobMonitor;
    @Autowired
    protected ScriptService scriptService;
    @Autowired
    protected RuleChecker ruleChecker;
    @Autowired
    @Qualifier("fileService")
    protected FileService storedFileService;
    @Autowired
    protected ModelService modelService;

/*
    @Autowired
    @Qualifier("asyncExecutor")
    private ThreadPoolTaskExecutor asyncExecutor;
*/

    @RequestMapping(value = "/databases", method = RequestMethod.POST)
    @Operation(summary = "获取数据库列表", description = "获取数据库列表")
    public Collection<String> getDatabases(@RequestBody ConnectionInfoDto connInfo) {
        if (connInfo.getType() == null) {
            throw new InvalidArgumentException(msgService.getMessage("datasourceTypeMissing"),
                    ServerExceptionCode.SERVER_RE_DATASOURCE_TYPE_MISSING);
        }

        ReverseForwardEngineering engine = null;
        try {
            engine = connInfo.getType().getReverseEngine();
        } catch (Exception ex) {
            throw new UnexpectedSystemException(
                    msgService.getMessage("failedToCreateReEngine", ex.getMessage()),
                    ServerExceptionCode.SERVER_RE_CREATE_ENGINE_FAIL);
        }

        return engine.getDatabases(connInfo);
    }


    @RequestMapping(value = "/databases/tables", method = RequestMethod.POST)
    @Operation(summary = "获取Database下的所有表", description = "获取Database下的所有表")
    public Collection<String> getTables(@RequestBody ConnectionInfoDto connInfo) {
        if (connInfo.getType() == null) {
            throw new InvalidArgumentException(msgService.getMessage("datasourceTypeMissing"),
                    ServerExceptionCode.SERVER_RE_DATASOURCE_TYPE_MISSING);
        }

        ReverseForwardEngineering engine = null;
        try {
            engine = connInfo.getType().getReverseEngine();
        } catch (Exception ex) {
            throw new UnexpectedSystemException(
                    msgService.getMessage("failedToCreateReEngine", ex.getMessage()),
                    ServerExceptionCode.SERVER_RE_CREATE_ENGINE_FAIL);
        }

        return engine.getTables(connInfo, connInfo.getDatabase());
    }


    @RequestMapping(value = "/databases/views", method = RequestMethod.POST)
    @Operation(summary = "获取Database下的所有视图", description = "获取Database下的所有视图")
    public Collection<String> getViews(@RequestBody ConnectionInfoDto connInfo) {
        if (connInfo.getType() == null) {
            throw new InvalidArgumentException(msgService.getMessage("datasourceTypeMissing"),
                    ServerExceptionCode.SERVER_RE_DATASOURCE_TYPE_MISSING);
        }

        ReverseForwardEngineering engine = null;
        try {
            engine = connInfo.getType().getReverseEngine();
        } catch (Exception ex) {
            throw new UnexpectedSystemException(
                    msgService.getMessage("failedToCreateReEngine", ex.getMessage()),
                    ServerExceptionCode.SERVER_RE_CREATE_ENGINE_FAIL);
        }

        return engine.getViews(connInfo, connInfo.getDatabase());
    }


    @RequestMapping(value = "/schemas", method = RequestMethod.POST)
    @Operation(summary = "获取所有schema", description = "获取所有schema")
    public Collection<String> getSchemas(@RequestBody ConnectionInfoDto connInfo) {
        if (connInfo.getType() == null) {
            throw new InvalidArgumentException(msgService.getMessage("datasourceTypeMissing"),
                    ServerExceptionCode.SERVER_RE_DATASOURCE_TYPE_MISSING);
        }

        ReverseForwardEngineering engine = null;
        try {
            engine = connInfo.getType().getReverseEngine();
        } catch (Exception ex) {
            throw new UnexpectedSystemException(
                    msgService.getMessage("failedToCreateReEngine", ex.getMessage()),
                    ServerExceptionCode.SERVER_RE_CREATE_ENGINE_FAIL);
        }

        return engine.getSchemas(connInfo);
    }


    @RequestMapping(value = "/curschema", method = RequestMethod.POST)
    @Operation(summary = "得到当前的schema", description = "得到当前的schema")
    public String getCurrentSchema(@RequestBody ConnectionInfoDto connInfo) {
        if (connInfo.getType() == null) {
            throw new InvalidArgumentException(msgService.getMessage("datasourceTypeMissing"),
                    ServerExceptionCode.SERVER_RE_DATASOURCE_TYPE_MISSING);
        }

        ReverseForwardEngineering engine = null;
        try {
            engine = connInfo.getType().getReverseEngine();
        } catch (Exception ex) {
            throw new UnexpectedSystemException(
                    msgService.getMessage("failedToCreateReEngine", ex.getMessage()),
                    ServerExceptionCode.SERVER_RE_CREATE_ENGINE_FAIL);
        }

        return engine.getCurrentSchema(connInfo);
    }


    @RequestMapping(value = "/", method = RequestMethod.POST, produces = "application/xml;charset=UTF-8")
    @Operation(summary = "逆向工程数据源", description = "逆向工程数据源，返回xml格式模型")
    public String reverseEngineerDatabase(@RequestBody ReverseEngineeringDto reParams)
            throws Exception {
        ModelX model = buildModel(reParams);
        return model.exportXML();
    }


    @RequestMapping(value = "/bin", method = RequestMethod.POST)
    @Operation(summary = "逆向工程数据源", description = "逆向工程数据源，返回二进制格式模型")
    public ResponseEntity<ProtoObjectX> reverseEngineerDatabaseBinary(@RequestBody ReverseEngineeringDto reParams)
            throws Exception {

        ModelX model = buildModel(reParams);
        ProtoObjectX.Builder obj = ProtoObjectX.newBuilder();
        model.serialize(obj);
        return ResponseEntity.ok(obj.build());
    }

    protected ModelX buildModel(ReverseEngineeringDto reParams) {
        if (reParams.getConnInfo() == null) {
            throw new InvalidArgumentException(msgService.getMessage("reConnectionParamMissing"),
                    ServerExceptionCode.SERVER_RE_CONNECTION_INFO_MISSING);
        }

        if (reParams.getConnInfo().getType() == null) {
            throw new InvalidArgumentException(msgService.getMessage("datasourceTypeMissing"),
                    ServerExceptionCode.SERVER_RE_DATASOURCE_TYPE_MISSING);
        }

        ReverseForwardEngineering engine = null;
        try {
            engine = reParams.getConnInfo().getType().getReverseEngine();
        } catch (Exception ex) {
            throw new UnexpectedSystemException(
                    msgService.getMessage("failedToCreateReEngine", ex.getMessage()),
                    ServerExceptionCode.SERVER_RE_CREATE_ENGINE_FAIL);
        }

        ModelX model = engine
                .reverseEngineering(reParams.getConnInfo(), reParams.getOptions(), reParams.getJobId());

        return model;
    }


    @RequestMapping("/{jobId}/progress")
    @Operation(summary = "获取任务的进度", description = "获取任务的进度")
    @Parameter(name = "jobId", description = "任务ID", in = ParameterIn.PATH)
    public List<JobProgress> getJobProgress(@PathVariable("jobId") String jobId) throws Throwable {
        // multi-thread serialize exception
        List<JobProgress> pros = jobMonitor.getJobHistory(jobId);
        return pros == null ? null : new ArrayList<>(pros);
    }

    @RequestMapping(value = "/script/parse/view", method = RequestMethod.POST)
    @Operation(summary = "尝试解析视图", description = "尝试解析视图")
    public ParsedView getParsedView(@Parameter(description = "脚本") @RequestBody SqlDto sqlDto) throws Throwable {
        return scriptService.parsedView(sqlDto.getDbtype(), sqlDto.getSql());
    }

    @RequestMapping(value = "/script/parse/rule", method = RequestMethod.POST)
    @Operation(hidden = true)
    public Set<RuleCheckResultDto> getRuleCheckResult(@Parameter(description = "脚本") @RequestBody SqlDto sqlDto) throws Throwable {
        ResResult result = scriptService.parsedModel(sqlDto.getDbtype(), sqlDto.getSql());
        if (result != null) {
            ModelX modelX = result.getModelX();
            if (modelX != null) {
                return ruleChecker.check(modelX);
            }
        }

        return Collections.emptySet();
    }

    @RequestMapping(value = "/bin/save", method = RequestMethod.POST)
    @Operation(summary = "逆向工程数据源", description = "逆向工程数据源，保存到指定的文件")
    public void reverseEngineerDatabaseBinaryAndSaveToFile(@RequestBody ReverseEngineeringDto reParams,
                                                           @RequestParam(value = "fileName", required = true) String fileName) {
        String userName = AuthTools.currentUsernameNullSafe();
        new Thread(() -> {
            ModelX model = buildModel(reParams);
            ProtoObjectX.Builder obj = ProtoObjectX.newBuilder();
            model.serialize(obj);
            File saved = null;
            try {
                saved = UploadFile.saveFile(obj.build(), fileName);
            } catch (Exception e) {
                e.printStackTrace();
            }
            FileDescriptor newFile = storedFileService.createFile(saved.getName(), userName, ServerConstants.APPNAME);
            RemoteFileLoader remoteFileLoader = BeanHelper.getBean(RemoteFileLoader.class);
            remoteFileLoader.uploadFileToRemote(newFile.getFileId(), saved);
            storedFileService.commitFiles(Collections.singleton(newFile.getFileId()));
            saved.delete();
        }).start();
    }

    @RequestMapping(value = "/bin/save/to/server", method = RequestMethod.POST)
    @Operation(summary = "逆向工程数据源", description = "逆向工程数据源,保存到模型库")
    public void reverseEngineerDatabaseBinaryAndSaveToModelServer(@RequestBody ReverseEngineeringDto reParams,
                                                                  @RequestParam(value = "modelInfo", required = true) String modelInfo) {
        SecurityContext originalCtx = SecurityContextHolder.getContext();
        SpringContextUtils.shareRequest();
        asyncReverseEngineer(originalCtx, reParams, modelInfo);
    }


    @Async("asyncExecutor")
    protected void asyncReverseEngineer(SecurityContext originalCtx, ReverseEngineeringDto reParams, String modelInfo) {
        // 异步执行的逻辑
        SecurityContextHolder.setContext(originalCtx);
        ModelX modelx = buildModel(reParams);
        NewModelDto newModel = null;
        try {
            newModel = mapper.readValue(modelInfo, NewModelDto.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        if (newModel == null) {
            throw new InvalidArgumentException("Invalid new model information.");
        }
        newModel.setUseProto(true);
        newModel.setType(reParams.getConnInfo().getType().getDisplayName());
        jobMonitor.createReverseTask(reParams.getJobId(), new ReverseTaskDto(AuthTools.currentUsernameNullSafe(), newModel.getType(), newModel.getName(), reParams.getJobId(), new Date(), false, SpringContextUtils.isFromClient()));
        SaveModelDto save = modelService.buildSaveModelDtoFromModelX(modelx, newModel);
        CreateModelDto createModel = new CreateModelDto();
        createModel.setModelInfo(newModel);
        createModel.setModelContents(save);
        modelService.createModel(createModel);
    }

    @RequestMapping(value = "/job/list", method = RequestMethod.GET)
    @Operation(summary = "逆向工程数据源", description = "逆向工程数据源,保存到模型库")
    public List<ReverseTaskDto> getReJobList(@RequestParam(value = "showAll", required = false) boolean showAll) {
        return jobMonitor.getJobList(showAll);
    }
}
