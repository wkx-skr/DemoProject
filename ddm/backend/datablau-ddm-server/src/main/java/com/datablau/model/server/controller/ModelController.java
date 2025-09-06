package com.datablau.model.server.controller;

import com.andorj.common.core.api.data.ApiModelVerEditDetailLog;
import com.andorj.common.core.api.data.ApiModelVerEditLog;
import com.andorj.common.core.data.CommonColumn;
import com.andorj.common.core.data.CommonModelElement;
import com.andorj.common.core.data.CommonTable;
import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.common.api.DWMappingService;
import com.datablau.model.common.dto.DwMappingDto;
import com.datablau.model.data.api.*;
import com.datablau.model.data.api.impl.SendMailToUser;
import com.datablau.model.data.api.semantic.RuleChecker;
import com.datablau.model.data.converter.ParsedModel;
import com.datablau.model.data.converter.ParsedObject;
import com.datablau.model.data.dto.*;
import com.datablau.model.data.general.OperationType;
import com.datablau.model.data.jpa.entity.*;
import com.datablau.model.data.jpa.repository.ModelElementRepository;
import com.datablau.model.data.jpa.repository.ModelRepository;
import com.datablau.model.data.jpa.repository.ThirdPartyInfoRepository;
import com.datablau.model.data.jpa.repository.TrashedModelRepository;
import com.datablau.model.data.query.obj.ShallowModelElement;
import com.datablau.model.data.query.obj.ShallowVerModelElement;
import com.datablau.model.data.utility.SpringContextUtils;
import com.datablau.model.fes.api.FesService;
import com.datablau.model.fes.dto.FesResResult;
import com.datablau.model.fes.dto.JpaClassForwardBodyParam;
import com.datablau.model.fes.impl.strategy.ForwardOption;
import com.datablau.model.fes.impl.strategy.ForwardSetting;
import com.datablau.model.local.utility.DataExceptionCode;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.server.data.service.impl.DatablauRemoteDdmModelServiceImpl;
import com.datablau.model.server.dto.EmailDto;
import com.datablau.model.server.dto.ModelWithPath;
import com.datablau.model.server.dto.WebSearchForTableAndColumnDto;
import com.datablau.model.server.utils.MicroserviceUtils;
import com.datablau.model.server.utils.enums.MicroserviceType;
import com.datablau.model.utils.utility.DbType;
import com.datablau.security.management.exception.DatablauPermissionException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.data.domain.Page;
import org.springframework.data.util.Pair;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.net.URLEncoder;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/10/12 0012 上午 10:54
 */
@RestController("modelController")
@ConditionalOnMissingBean(name = "modelControllerExt")
@RequestMapping("/models")
@Tag(name = "模型相关REST API", description = "模型相关REST API")
public class ModelController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(ModelController.class);

    protected ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    protected ModelService modelService;

    @Autowired
    DWMappingService dwMappingService;
    @Autowired
    protected MessageService msgService;

    @Autowired
    protected ModelRepository modelDao;

    @Autowired
    protected RuleChecker ruleChecker;

    @Autowired
    protected LocalDomainService localDomainService;

    @Autowired
    protected ModelElementRepository modelElementDao;

    @Autowired
    protected FesService fesService;

    @Autowired
    protected ModelEditAuditService modelEditAuditService;

    @Autowired
    protected PermissionHelper permissionHelper;
/*
    @Autowired
    @Qualifier("datablauRemoteAssetService")
    protected DatablauRemoteAssetService datablauRemoteAssetService;*/

    @Autowired
    protected MessageService messageService;

    @Autowired
    protected ScriptOptionService scriptOptionService;

    @Autowired
    protected ModelInfoStatisticsService modelInfoStatisticsService;

    @Autowired
    protected TrashedModelRepository trashedModelDao;

    @Autowired
    protected MicroserviceUtils microserviceUtils;

    @Autowired
    protected RestTemplate restTemplate;

    @Autowired
    protected SendMailToUser sendMailToUser;

    @RequestMapping("/")
    @Operation(summary = "获取模型的树形结构", description = "获取模型的树形结构")
    public ModelTreeNodeDto getModelTree() {
        if (SpringContextUtils.isFromClient()) {
            permissionHelper.reloadCurrentUserAuth(false);
        }
        return modelService.getModelTree(null);
    }

    @RequestMapping("/tree")
    @Operation(summary = "获取用户模型的树形结构", description = "获取用户模型的树形结构 modelType:Logical,Conceptual,Physics,不传modelType则查询所有模型")
    public ModelTreeNodeDto getModelTreeByUserName(
            @Parameter(name = "模型类型") @RequestParam(value = "modelType", required = false) String modelType) {
        return modelService.getModelTreeByUserName(modelType);
    }

    @RequestMapping("/list")
    @Operation(summary = "获取自己模型的列表", description = "获取自己模型的列表")
    public List<Model> getMyModels() {
        return modelService.getCurrentUserAllBranches().stream().filter(Model::getCanBeRead).collect(Collectors.toList());
    }

    @RequestMapping("/search")
    @Operation(summary = "搜索模型名称", description =
            "搜索模型名称, 如果关键字为\"财务 模型\",那么关键字会被拆分为\"财务\"和\"模型\", 必须同时包含这两个词的， 如果关键词为\"cw\"，会进行拼音匹配和英语匹配，有一种匹配就算匹配，"
                    + "比如\"财务模型\"和\"cw模型\"都会被匹配")
    @Parameters({
            @Parameter(name = "keyword", description = "搜索的关键字，不能为空", in = ParameterIn.QUERY, required = true)})
    public List<Model> searchModels(@RequestParam("keyword") String keyword) {
        if (Strings.isNullOrEmpty(keyword.trim())) {
            throw new InvalidArgumentException(msgService.getMessage("keywordCannotByEmpty"));
        }

        return modelService.searchModels(keyword);
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "创建一个模型", description = "创建一个模型")
    public Model createModel(
            @Parameter(description = "模型对象", required = true) @RequestBody CreateModelDto createModelRequest)
            throws Exception {
        Model model = modelService.createModel(createModelRequest);
        ruleChecker.check(model.getId());
        return model;
    }

    @RequestMapping("/fetchall")
    @Operation(summary = "获取所有模型", description = "获取所有模型, 只有超管才有此权限")
    public List<Model> getAllModels() {
        return modelService.getAllModels();
    }

    @RequestMapping("/{modelId}/compress")
    @Operation(summary = "压缩一个模型", description = "压缩一个模型, 返回值是压缩百分比，为小于1的浮点数")
    @Parameters({
            @Parameter(name = "modelId", description = "Model ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "highrate", description = "是否采用高压缩率(true/false)，高压缩率(true)会删除模型的所有版本，否则会保留中间大版本", in = ParameterIn.QUERY),
            @Parameter(name = "test", description = "是否只是评估此分支可以压缩多少", in = ParameterIn.QUERY)})
    public double compressModel(@PathVariable("modelId") Long modelId,
                                @RequestParam(value = "highrate", defaultValue = "false") Boolean highCompression,
                                @RequestParam(value = "test", defaultValue = "true") Boolean testOnly) {
        return modelService.compressModel(modelId, highCompression, testOnly);
    }

    @RequestMapping("/{modelId}")
    @Operation(summary = "获取一个模型信息", description = "获取一个模型信息")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "withPath", description = "是否带路径信息", in = ParameterIn.QUERY)})
    public Model getModel(@PathVariable("modelId") Long modelId,
                          @RequestParam(value = "withPath", defaultValue = "false") Boolean withPath) {
        try {
            Model model = modelService.getModelById(modelId);
            if (withPath) {
                ModelWithPath wp = new ModelWithPath(model);
                String fullPath = modelService.getModelPath(model.getCategoryId(), wp.getCategories(), "/" + model.getName());
                wp.setPath(modelService.getModelPath(modelId), fullPath);
                return wp;
            } else
                return model;

        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelViewerPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping("/{modelId}/content")
    @Operation(summary = "获取一个模型所有内容", description = "获取一个模型所有内容")
    @Parameters({@Parameter(name = "recordId", description = "模型自增ID", in = ParameterIn.QUERY),
            @Parameter(name = "versionId", description = "模型版本ID", in = ParameterIn.QUERY),
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public ModelDto getModelContent(
            @RequestParam(value = "recordId", required = false) Long recordId,
            @RequestParam(value = "versionId", required = false) Long versionId,
            @PathVariable("modelId") Long modelId) {
        ModelDto model = null;
        try {
            if (recordId != null) {
                model = modelService.getModelRecordContent(modelId, recordId);
            } else {
                model = modelService.getModelContent(modelId, versionId);
            }
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelViewerPermission",
                            modelService.findModelAdmin(modelId)));
        }

        Model modelx = modelService.getModelById(modelId);

        modelEditAuditService.logOperationForModel(modelx, OperationType.GET_MODEL_CONTENT, null);

        return model;
    }

    @RequestMapping("/{modelId}/path")
    @Operation(summary = "获取一个模型的目录路径", description = "获取一个模型的目录路径")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public String getModelPath(@PathVariable("modelId") Long modelId) {
        try {
            return modelService.getModelPath(modelId);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelViewerPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping("/{modelId}/content/json")
    @Operation(summary = "获取一个模型的JSON格式的全部内容", description = "获取一个模型的JSON格式的全部内容")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "versionId", description = "模型版本ID", in = ParameterIn.QUERY)})
    public ParsedModel getModelParsedContent(
            @RequestParam(value = "versionId", required = false) Long versionId,
            @PathVariable("modelId") Long modelId) throws Exception {
        try {
            return modelService.getModelJsonObject(modelId, versionId);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelViewerPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping("/{modelId}/direct/content/json")
    @Operation(summary = "获取模型和它的直接子元素", description = "获取模型和它的直接子元素，使用JSON返回，此API搭配/{modelId}/elements/{elementId}/content/json来实现延迟加载")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "versionId", description = "模型版本ID", in = ParameterIn.QUERY)})
    public ParsedModel getModelAndItsDirectChildrenContent(
            @RequestParam(value = "versionId", required = false) Long versionId,
            @PathVariable("modelId") Long modelId,
            @Parameter(description = "类型过滤器") @RequestParam(value = "typeFilter", required = false) Set<Long> filteredTypeIds,
            @Parameter(description = "key是否为typeId") @RequestParam(value = "longKey", defaultValue = "false") Boolean longKey)
            throws Exception {
        ParsedModel model;
        try {
            model = modelService.getModelAndDirectChildrenJsonObject(modelId, versionId, filteredTypeIds, longKey);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService.getMessage("dontHaveModelViewerPermission",
                    modelService.findModelAdmin(modelId)));
        }

        Model modelx = modelService.getModelById(modelId);
        modelEditAuditService.logOperationForModel(modelx, OperationType.GET_MODEL_CONTENT, null);

        return model;
    }

    @RequestMapping("/{modelId}/elements/{elementId}/content/json")
    @Operation(summary = "获取一个对象和它所有子孙元素的内容，以JSON格式返回", description = "获取一个对象和它所有子孙元素的内容，以JSON格式返回")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "versionId", description = "模型版本ID", in = ParameterIn.QUERY),
            @Parameter(name = "elementId", description = "元素ID", in = ParameterIn.PATH, required = true)})
    public ParsedObject getObjectParsedContent(@PathVariable("modelId") Long modelId,
                                               @RequestParam(value = "versionId", required = false) Long versionId,
                                               @PathVariable("elementId") Long elementId,
                                               @Parameter(description = "key是否为typeId") @RequestParam(value = "longKey", defaultValue = "false") Boolean longKey) throws Exception {
        try {
            return modelService.getObjectJsonObject(modelId, versionId, elementId, longKey);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelViewerPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping(value = "/{modelId}/elements/content/json", method = RequestMethod.POST)
    @Operation(summary = "获取一组对象和它们所有子孙元素的内容，以MAP的JSON格式返回", description = "获取一组对象和它们所有子孙元素的内容，以MAP的JSON格式返回， key是elementId， value是JSON内容。请求的body应该是元素ID列表")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "includeSubEntities", description = "是否加载子元素", in = ParameterIn.QUERY)})
    public Map<Long, ParsedObject> getObjectsParsedContent(@PathVariable("modelId") Long modelId,
                                                           @RequestParam(value = "includeSubEntities", defaultValue = "true") Boolean includeSubEntities,
                                                           @Parameter(description = "子元素ID") @RequestBody Set<Long> elementIds,
                                                           @Parameter(description = "key是否为typeId") @RequestParam(value = "longKey", defaultValue = "false") Boolean longKey) throws Exception {
        try {
            return modelService
                    .getBatchOfObjectsJsonContent(modelId, elementIds, includeSubEntities, longKey);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelViewerPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping("/{modelId}/elements/content/json")
    @Operation(summary = "获取一组对象和它们所有子孙元素的内容", description = "获取一组对象和它们所有子孙元素的内容，以List的JSON格式返回。本API支持分页")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "typeId", description = "类型ID", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "includeSubEntities", description = "是否加载子元素", in = ParameterIn.QUERY),
            @Parameter(name = "sortByPhysical", description = "按照物理名称排序？true按照物理名称排序， false按照逻辑名称排序", in = ParameterIn.QUERY),
            @Parameter(name = "asc", description = "按照升序排序？ true按照升序， false按照降序", in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "currentPage", description = "当前页", in = ParameterIn.QUERY, required = true)})
    public Page<ParsedObject> getPageOfObjectsParsedContent(@PathVariable("modelId") Long modelId,
                                                            @RequestParam("typeId") Long typeId,
                                                            @RequestParam(value = "includeSubEntities", defaultValue = "true") Boolean includeSubEntities,
                                                            @RequestParam(value = "sortByPhysical", defaultValue = "true") Boolean sortByPhysical,
                                                            @RequestParam(value = "asc", defaultValue = "true") Boolean asc,
                                                            @RequestParam("pageSize") Integer pageSize,
                                                            @RequestParam("currentPage") Integer currentPage) throws Exception {
        try {
            return modelService
                    .getOnePageOfTypedElementJsonContent(modelId, typeId, pageSize, currentPage,
                            includeSubEntities, sortByPhysical, asc);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelViewerPermission",
                            modelService.findModelAdmin(modelId)));
        }

    }

    @RequestMapping("/{modelId}/content/xml")
    @Operation(summary = "获取一个模型的XML格式的全部内容", description = "获取一个模型的XML格式的全部内容")
    @Parameters({@Parameter(name = "versionId", description = "模型版本ID", in = ParameterIn.QUERY),
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public String getModelXmlContent(
            @RequestParam(value = "versionId", required = false) Long versionId,
            @PathVariable("modelId") Long modelId) {
        try {
            return modelService.getModelXmlContent(modelId, versionId);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelViewerPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping(value = "/{modelId}/save", method = RequestMethod.POST)
    @Operation(summary = "保存一个模型的内容", description = "保存一个模型的内容, 由于结构体太过复杂需要由客户端生成")
    @Parameters({
            @Parameter(name = "notReturn", description = "是否不返回已经保存的模型内容", in = ParameterIn.QUERY),
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public ModelDto saveModel(
            @Parameter(description = "模型对象", required = true) @RequestBody SaveModelDto saveRequest,
            @PathVariable("modelId") Long modelId,
            @RequestParam(value = "notReturn", defaultValue = "false") Boolean notReturn) {
        try {
            saveRequest.setModelId(modelId);
            Model model = modelService.saveModel(saveRequest);
            //sendMailForIncrementalSave(saveRequest, model);
            //ModelVersion mv = modelService.getModelVersionByModelIdAndRecordId(saveRequest.getModelId(), saveRequest.getLastVersion());
            //SendMailForIncrementalSaveModel mi = new SendMailForIncrementalSaveModel(saveRequest, model, mv);
            //Thread t = new Thread(mi);
            //t.start();

            if (notReturn == false) {
                return convertTo(model);
            } else {
                return modelService.getModelContent(modelId, null);
            }
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelEditorPermission",
                            modelService.findModelAdmin(modelId)));
        } finally {
            ruleChecker.check(modelId);
        }
    }

    @RequestMapping("/{modelId}/elements/{elementId}")
    @Operation(summary = "得到指定对象以及其所有后继对象的JSON表达结果", description = "得到指定对象以及其所有后继对象的JSON表达结果, 此API在后期后删除")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "versionId", description = "模型版本ID", in = ParameterIn.QUERY),
            @Parameter(name = "elementId", description = "对象ID", in = ParameterIn.PATH, required = true)})
    public ParsedObject getSingleElementJsonObject(@PathVariable("modelId") Long modelId,
                                                   @RequestParam(value = "versionId", required = false) Long versionId,
                                                   @PathVariable("elementId") Long elementId) throws Exception {
        return modelService.getObjectJsonObject(modelId, versionId, elementId);
    }

    @RequestMapping(value = "/{modelId}", method = RequestMethod.PUT)
    @Operation(summary = "修改一个模型属性", description = "修改一个模型属性")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public Model modifyModel(@PathVariable("modelId") Long modelId,
                             @Parameter(description = "模型属性对象", required = true) @RequestBody Model model) {
        try {
            if (model.getReferredModelId() != null && isBaselineNameDuplicated(
                    model.getReferredModelId(), model.getName(), modelId)) {
                throw new InvalidArgumentException(msgService.getMessage("modelBaselineNameExists"),
                        DataExceptionCode.MODEL_NAME_EXISTS_IN_CATEGORY);
            }
            model.setId(modelId);
            return modelService.updateModel(model);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService.getMessage("dontHaveModelEditorPermission",
                    modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping("/deleted")
    @Operation(summary = "获取所有已经被放到回收站的模型", description = "获取所有已经被放到回收站的模型")
    public List<ShallowTrashedModel> getDeletedModels(@RequestParam(required = false, defaultValue = "false") Boolean fillParentModel) {
        return modelService.getDeletedModels(fillParentModel);
    }

    @RequestMapping(value = "/deleted/{modelId}", method = RequestMethod.PUT)
    @Operation(summary = "从回收站还原指定的模型", description = "从回收站还原指定的模型")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "categoryId", description = "还原指定目录ID", in = ParameterIn.QUERY, required = true)})
    public void restoreModel(@PathVariable("modelId") Long modelId,
                             @RequestParam("categoryId") Long categoryId) {
        modelService.restoreModel(categoryId, modelId);
    }

    @RequestMapping(value = "/deleted/models", method = RequestMethod.PUT)
    @Operation(summary = "从回收站还原指定的模型及其分支", description = "从回收站还原指定的模型及其分支")
    @Parameters({
            @Parameter(name = "modelIds", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "categoryId", description = "还原指定目录ID", in = ParameterIn.QUERY, required = true)})
    public void restoreModel(@RequestParam("modelIds") Set<Long> modelIds,
                             @RequestParam("categoryId") Long categoryId) {
        modelService.restoreModel(categoryId, modelIds);
    }

    @RequestMapping(value = "/{modelId}/baselines", method = RequestMethod.POST)
    @Operation(summary = "从模型一个版本创建分支", description = "从模型一个版本创建分支")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "versionId", description = "模型版本ID", in = ParameterIn.QUERY)})
    public Model createBaseline(@PathVariable("modelId") Long modelId,
                                @RequestParam(value = "versionId", required = false) Long versionId,
                                @RequestBody CreateModelVersionDto createBaselineRequst) {

        try {
            if (isBaselineNameDuplicated(modelId, createBaselineRequst.getVersion(), null)) {
                throw new InvalidArgumentException(msgService.getMessage("modelBaselineNameExists"),
                        DataExceptionCode.MODEL_NAME_EXISTS_IN_CATEGORY);
            }
            createBaselineRequst.setModelId(modelId);
            Model model = null;
            if (versionId != null) {
                model = modelService.createBaselineBasedOnVersion(createBaselineRequst, versionId);
            } else {
                model = modelService.createBaseline(createBaselineRequst);
            }
            ruleChecker.check(model.getId());
            return model;
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelEditorPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    protected boolean isBaselineNameDuplicated(Long refencedModelId, String newName,
                                               Long existedBaseLineId) {
        logger.info("referenced model id is:" + refencedModelId + "; existedbaselineid is:"
                + existedBaseLineId + ";model name is:" + newName);
        List<Model> models = null;
        try {
            models = AuthTools.runAsSuperuser(() -> {
                Model parent = modelService.getModelById(refencedModelId);

                List<Model> branchs = modelService.getAllBaseLinesOfModel(parent.getReferredModelId() == null ? parent.getId() : parent.getReferredModelId());
                logger.info("real referred model id is:" + (parent.getReferredModelId() == null ? parent.getId() : parent.getReferredModelId()));
                return branchs;
            });
        } catch (Exception e) {
            throw new AndorjRuntimeException("failed to get parent model path.");
        }

        for (Model model : models) {
            if ((existedBaseLineId == null || model.getId().longValue() != existedBaseLineId
                    .longValue()) && StringUtils.equals(newName, model.getName())) {
                logger.info("model id is:" + model.getId() + ";model name is:" + model.getName());
                return true;
            }
        }
        return false;
    }

    @RequestMapping(value = "/{modelId}/baselines/{baselineId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除模型的指定分支", description = "删除模型的指定分支")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "baselineId", description = "分支ID", in = ParameterIn.PATH, required = true)})
    public void deleteBaseline(@PathVariable("modelId") Long modelId,
                               @PathVariable("baselineId") Long baselineId) {
        modelService.permanentlyDeleteBaseline(modelId, baselineId);
    }

    @RequestMapping(value = "/{modelId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除指定的模型及其所有分支", description = "删除指定的模型及其所有分支")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public void deleteModel(@PathVariable("modelId") Long modelId) {
        modelService.permanentlyDeleteModel(modelId);
    }

    @RequestMapping(value = "/{modelId}/complete", method = RequestMethod.DELETE)
    @Operation(summary = "从回收站删除模型", description = "从回收站删除模型，必须有超管权限")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public void deleteModelCompleted(@PathVariable("modelId") Long modelId) {
        // 1.判断模型是否存在
        TrashedModel model = trashedModelDao.findByIdEquals(modelId);
        if (model == null) {
            throw new InvalidArgumentException(msgService.getMessage("modelMissingInTrashCan", modelId));
        }

        // 2.查询当前模型及所有子分支
        Set<Long> allModelIds = new HashSet<>();
        allModelIds.add(modelId);
        if (model.getReferredModelId() == null) {
            logger.info(AuthTools.currentUsernameFailFast() + " is completely deleting model " + model.getName() + "/" + model.getId());
            for (TrashedModel trashed : trashedModelDao.findAllByReferredModelIdEquals(modelId)) {
                allModelIds.add(trashed.getId());
                logger.info("model with id " + trashed.getId() + " is also being deleted");
            }
        } else {
            TrashedModel mainModel = trashedModelDao.findByIdEquals(model.getReferredModelId());
            if (mainModel == null) {
                Model ndMainModel = modelDao.findByIdEquals(model.getReferredModelId());
                logger.info(AuthTools.currentUsernameFailFast() + " is completely deleting branch " + model.getName() + " of model " + ndMainModel.getName() + ", ID " + modelId);
            } else {
                logger.info(AuthTools.currentUsernameFailFast() + " is completely deleting branch " + model.getName() + " of model " + mainModel.getName() + ", ID " + modelId);
            }
        }

        // 3.删除模型及其分支的相关的数据
        modelService.deleteModelFromTrashCan(allModelIds);
        logger.info("Deleting the information about Archy is complete");
    }

    @RequestMapping("/{modelId}/activeBranch")
    @Operation(summary = "得到模型的活跃分支", description = "得到模型的活跃分支")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public Model getActiveModelOfModelId(@PathVariable("modelId") Long modelId) {
        return modelService.getActiveModelOfModel(modelId);
    }

    @RequestMapping(value = "/{modelId}/activeBranch/{activeBranchId}", method = RequestMethod.POST)
    @Operation(summary = "设置模型的活跃分支", description = "设置模型的活跃分支")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "activeBranchId", description = "需要设为活跃的分支ID", in = ParameterIn.PATH, required = true)})
    public void setActiveModelOfModel(@PathVariable("modelId") Long modelId,
                                      @PathVariable("activeBranchId") Long activeModelId) {
        modelService.setActiveModelOfModel(modelId, activeModelId);
    }

    @RequestMapping("/{modelId}/baselines")
    @Operation(summary = "获取指定模型的所有分支", description = "获取指定模型的所有分支")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public List<Model> getModelBaselines(@PathVariable("modelId") Long modelId) {
        try {
            return modelService.getAllBaseLinesOfModel(modelId);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelViewerPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping(value = "/baselines", method = RequestMethod.POST)
    @Operation(summary = "获取一组模型所有的分支", description = "获取一组模型所有的分支")
    public Map<Long, List<Model>> getModelBaselines(
            @Parameter(description = "模型ID", required = true) @RequestBody List<Long> modelIds) {
        return modelService.getAllBaseLinesOfModels(modelIds);
    }

    @RequestMapping(value = "/{modelId}/lock", method = RequestMethod.PUT)
    @Operation(summary = "锁定指定的模型或分支", description = "锁定指定的模型或分支")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public void lockModel(@PathVariable("modelId") Long modelId) {
        try {
            modelService.lockModel(modelId);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelEditorPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping(value = "/{modelId}/unlock", method = RequestMethod.POST)
    @Operation(summary = "解锁指定的模型或分支", description = "解锁指定的模型或分支")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public void unlockModel(@PathVariable("modelId") Long modelId) {
        try {
            modelService.unlockModel(modelId);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelEditorPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping("/{modelId}/tryupdate")
    @Operation(summary = "测试当前用户能不能更新指定模型", description = "测试当前用户能不能更新指定模型")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public void tryUpdateModel(@PathVariable("modelId") Long modelId) {
        try {
            modelService.tryUpdateModel(modelId);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelEditorPermission",
                            modelService.findModelAdmin(modelId)));
        }

    }

    @RequestMapping("/{modelId}/versions")
    @Operation(summary = "获取模型的所有版本", description = "获取模型的所有版本")
    @Parameters({@Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public List<ModelVersion> getModelVersions(@PathVariable("modelId") Long modelId) throws Exception {
        try {
            return modelService.getModelVersions(modelId);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelViewerPermission", modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping(value = "/{modelId}/versions/{versionId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除模型指定的版本", description = "删除模型指定的版本")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "versionId", description = "版本ID", in = ParameterIn.PATH, required = true)})
    public Model resetModelToVersionBeforeTheGivenVersion(@PathVariable("modelId") Long modelId,
                                                          @PathVariable("versionId") Long versionId) {
        try {
            return modelService.permanentlyResetVersion(modelId, versionId);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelAdminPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping(value = "/{modelId}/versions/{versionId}", method = RequestMethod.PUT)
    @Operation(summary = "更新模型的版本", description = "更新模型的版本")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "versionId", description = "版本ID", in = ParameterIn.PATH, required = true)})
    public ModelVersion updateModelVersion(@PathVariable("modelId") Long modelId,
                                           @PathVariable("versionId") Long versionId,
                                           @RequestBody CreateModelVersionDto updateVersionRequest) {
        try {
            return modelService.updateModelVersion(modelId, versionId, updateVersionRequest);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelEditorPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping(value = "/{modelId}/versions", method = RequestMethod.POST)
    @Operation(summary = "创建模型的版本", description = "创建模型的版本, 自动把从上一个版本开始到目前所有的改动变成新的版本")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public ModelVersion createModelVersion(@PathVariable("modelId") Long modelId,
                                           @RequestBody CreateModelVersionDto createModelVersionRequest) {
        try {
            createModelVersionRequest.setModelId(modelId);
            return modelService.createUserDefinedModelVersion(createModelVersionRequest);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelEditorPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping("/category/{categoryId}")
    @Operation(summary = "展开指定的一个目录", description = "展开指定的一个目录，获取它直接下级的目录和模型")
    @Parameters({
            @Parameter(name = "categoryId", description = "目录ID", in = ParameterIn.PATH, required = true)})
    public ExpandCategoryDto expandOneLevel(@PathVariable("categoryId") Long categoryId) {
        return modelService.expandOneLevel(categoryId);
    }

    @RequestMapping(value = "/{modelId}/freeze", method = RequestMethod.PUT)
    @Operation(summary = "把指定的分支设为封版状态", description = "把指定的分支设为封版状态")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public Model freezeBaseline(@PathVariable("modelId") Long modelId) {
        try {
            return modelService.freezeModel(modelId);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelAdminPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping(value = "/{modelId}/unfreeze", method = RequestMethod.PUT)
    @Operation(summary = "解除分支的封版状态", description = "解除分支的封版状态")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public Model unfreezeBaseline(@PathVariable("modelId") Long modelId) {
        try {
            return modelService.unfreezeModel(modelId);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelAdminPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }

    @RequestMapping(value = "/{modelId}/phases", method = RequestMethod.POST)
    @Operation(summary = "把当前分支阶段更改到下一个阶段", description = "把当前分支阶段更改到下一个阶段, 只要用户有该模型的读写权限就可以修改。")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "cur_phase", description = "设置模型阶段代码", in = ParameterIn.QUERY, required = true)})
    public Model proceedToNextPhase(@PathVariable("modelId") Long modelId,
                                    @RequestParam("cur_phase") Integer currentPhase) {

        return modelService.setModelPhase(modelId, currentPhase);
    }

    @RequestMapping(value = "/{modelId}/shared", method = RequestMethod.POST)
    @Operation(summary = "把当前模型设置为共享模式", description = "把当前模型设置为共享模式, 只有超级管理员有权限。")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "shared", description = "是否设置为共享", in = ParameterIn.QUERY, required = true)})
    public Model shareModel(@PathVariable("modelId") Long modelId,
                            @RequestParam("shared") Boolean shared) {

        return modelService.setModelShared(modelId, shared);
    }

    @RequestMapping(value = "/{modelId}/actions/start", method = RequestMethod.POST)
    @Operation(summary = "触发与指定模型相关的一个动作", description = "触发与指定模型相关的一个动作")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "action", description = "行为ID", in = ParameterIn.QUERY, required = true)})
    public String activateActionOfModel(@PathVariable("modelId") Long modelId,
                                        @RequestParam("action") Long actionId) {
        return "开发中";
    }

    @RequestMapping(value = "/{modelId}/actions/current")
    @Operation(summary = "获取模型当前所处的动作状态", description = "获取模型当前所处的动作状态")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public String getCurrentActiveActionStatus(@PathVariable("modelId") Long modelId) {
        return "开发中";
    }

    protected ModelDto convertTo(Model model) {
        ModelDto dto = new ModelDto();
        dto.setCurrentVersion(model.getCurrentVersion());
        return dto;
    }

    @RequestMapping(value = "/{modelId}/lineageInfluence", method = RequestMethod.POST, produces = "text/json;charset=UTF-8")
    @Operation(summary = "通过DAM查询指定字段的血缘图", description = "通过DAM查询指定字段的血缘图")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public String findLineageInfluence(@PathVariable("modelId") Long modelId,
                                       @RequestParam(value = "onlyUpstream", required = false) Boolean onlyUpstream,
                                       @RequestParam(value = "onlyImpact", required = false) Boolean onlyImpact,
                                       @Parameter(description = "字段的名称", required = true) @RequestBody List<String[]> columns) {
        //解析封装对象
        List<CommonModelElement> tableList = new ArrayList<>();
        AtomicReference<Long> id = new AtomicReference<>(100000L);
        List<Pair<String, String>> convertedNames = new ArrayList<>(columns.size());
        for (String[] columnName : columns) {
            if (columnName.length < 2) {
                throw new InvalidArgumentException(
                        msgService.getMessage("tableNameAndColumnNameNull"));
            }

            if (columnName.length == 2) {
                convertedNames.add(Pair.of(columnName[0], columnName[1]));
            }
        }
        if (convertedNames.size() > 0) {
            convertedNames.stream()
                    .collect(Collectors.groupingBy(Pair::getFirst))
                    .entrySet().stream()
                    .forEach(entry -> {
                        String tableInfo = entry.getKey();
                        String schemaName = null;
                        String tableName = tableInfo;
                        if (tableInfo.contains(".")) {
                            schemaName = tableInfo.substring(0, tableInfo.indexOf("."));
                            tableName = tableInfo.substring(tableInfo.indexOf(".") + 1);
                        }

                        CommonModelElement commonModelElement = new CommonModelElement();
                        commonModelElement.setPhysicalName(tableName);
                        commonModelElement.setTypeId(LDMTypes.oEntity);
                        commonModelElement.setParentId(modelId);
                        commonModelElement.setModelId(modelId);
                        Long tableId = id.getAndSet(id.get() + 1);
                        commonModelElement.setElementId(tableId);
                        if (schemaName != null) {
                            Map<String, String> propMap = new HashMap<>();
                            propMap.put("schema", schemaName);
                            commonModelElement.setProperties(propMap);
                        }
                        tableList.add(commonModelElement);
                        //封装字段
                        List<CommonModelElement> subList = new ArrayList<>();
                        List<Pair<String, String>> value = entry.getValue();
                        value.stream().forEach(colPair -> {
                            CommonModelElement colElement = new CommonModelElement();
                            colElement.setPhysicalName(colPair.getSecond());
                            colElement.setTypeId(LDMTypes.oAttribute);
                            colElement.setModelId(modelId);
                            colElement.setParentId(tableId);
                            colElement.setElementId(id.getAndSet(id.get() + 1));
                            subList.add(colElement);
                        });

                        if (commonModelElement.getProperties() == null)
                            commonModelElement.setProperties(new HashMap<String, String>());
                        try {
                            commonModelElement.getProperties().put("columns", objectMapper.writeValueAsString(subList));
                        } catch (Exception e) {
                            logger.warn("parse value failed cause by:" + e.getMessage(), e);
                        }
                    });
        }


        return sendMailToUser.findLineageInfluence(modelId, tableList, getLineageType(onlyUpstream, onlyImpact));
    }

    @RequestMapping(value = "/{modelId}/tableLineage/{tableId}", method = RequestMethod.POST, produces = "text/json;charset=UTF-8")
    @Operation(summary = "通过DAM查询一个表的血缘图", description = "通过DAM查询一个表的血缘图")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "tableId", description = "表ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "onlyImpact", description = "只显示影响还是全链路， false为全链路， true为影响的", in = ParameterIn.QUERY)})
    public String findTableLineage(@PathVariable("modelId") Long modelId,
                                   @PathVariable("tableId") Long tableId,
                                   @RequestParam(value = "onlyUpstream", required = false) Boolean onlyUpstream,
                                   @RequestParam(value = "onlyImpact", required = false) Boolean onlyImpact)
            throws Exception {

        CommonModelElement tableElement = modelService
                .getModelElementById(modelId, tableId, true);
        if (tableElement == null) throw new RuntimeException(messageService.getMessage("notFoundTableById", tableId));

        List<CommonModelElement> subObjects = modelService
                .getAllSubObjects(modelId, tableId, LDMTypes.oAttribute);

        if (subObjects != null && !subObjects.isEmpty()) {
            if (tableElement.getProperties() == null) tableElement.setProperties(new HashMap<String, String>());
            tableElement.getProperties().put("columns", objectMapper.writeValueAsString(subObjects));
        }

        return sendMailToUser.findLineageInfluence(modelId, Lists.newArrayList(tableElement), getLineageType(onlyUpstream, onlyImpact));
    }

    // 兼容老代码，以增加新参数方式支持全部显示方式
    protected String getLineageType(Boolean onlyUpstream, Boolean onlyImpact) {
        if (onlyUpstream == true && onlyImpact == true) {
            return "ALL";
        } else if (onlyImpact == true) {
            return "RIGHT";
        } else if (onlyUpstream == true) {
            return "LEFT";
        } else {
            return "ALL";
        }
    }

    @RequestMapping(method = RequestMethod.POST, value = "/lineageInflunceMail")
    @Operation(summary = "依据血缘发送影响邮件", description = "依据血缘发送影响邮件")
    public void sendMailForLineageInflunceThroughModelCategory(
            @Parameter(description = "邮件对象", required = true) @RequestBody EmailDto mail) {
        sendMailToUser.sendMailForLineageInfluence(mail.getUsers(), mail.getExcel(), mail.getFile(), mail.getFilename(), mail.getSubject(), mail.getBody());
    }

    @RequestMapping(value = "/{modelId}/rulecheck")
    @Operation(summary = "获取一个模型的规则检验结果", description = "获取一个模型的规则检验结果")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public RuleCheckData getModelCheckResult(@PathVariable("modelId") Long modelId) {
        return modelService.getModelRuleCheckResult(modelId);
    }

    @RequestMapping(value = "/{modelId}/editlog/list")
    @Operation(summary = "获取小版本变更的操作用户和时间列表", description = "获取小版本变更的操作用户和时间列表")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "versionId", description = "版本ID", in = ParameterIn.QUERY, required = false)})
    public List<ApiModelVerEditLog> getModelEditAuditLog(@PathVariable("modelId") Long modelId,
                                                         @RequestParam(name = "versionId", required = false) Long versionId) {
        return modelService.getModelVerEditLog(modelId, versionId);
    }

    @RequestMapping(value = "/{modelId}/editlog")
    @Operation(summary = "获取数个小版本操作的具体内容", description = "获取数个小版本操作的具体内容, 对于老的版本有可能记录会被从数据库删除，只保留在maudit.log文件中")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "startVer", description = "最小的自增版本号, 一般是1", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "endVer", description = "最大的自增版本号", in = ParameterIn.QUERY, required = true)})
    public List<ApiModelVerEditDetailLog> getModelEditDetailAuditLog(
            @PathVariable("modelId") Long modelId,
            @RequestParam(name = "startVer") Long startVer,
            @RequestParam(name = "endVer") Long endVer) {
        return modelService.getModelVerDetailEditLog(modelId, startVer, endVer);
    }

    @RequestMapping(value = "/{modelId}/editlog/ids")
    @Operation(summary = "获取数个小版本操作的元素Id集合", description = "获取数个小版本操作的元素Id集合")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "startVer", description = "最小的自增版本号, 一般是1", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "endVer", description = "最大的自增版本号", in = ParameterIn.QUERY, required = true)})
    public Set<Long> getModelEditIdAuditLog(@PathVariable("modelId") Long modelId,
                                            @RequestParam(name = "startVer") Long startVer,
                                            @RequestParam(name = "endVer") Long endVer) {
        return modelService.getModelVerIdsEditLog(modelId, startVer, endVer);
    }

    @GetMapping(value = "/{modelId}/editlog/page")
    @Operation(summary = "获取数个小版本操作的具体内容(分页)", description = "获取数个小版本操作的具体内容(分页), 对于老的版本有可能记录会被从数据库删除，只保留在maudit.log文件中")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "startVer", description = "最小的自增版本号, 一般是1", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "endVer", description = "最大的自增版本号", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页", in = ParameterIn.QUERY)})
    public Page<ApiModelVerEditDetailLog> getModelEditDetailAuditLogPage(
            @PathVariable("modelId") Long modelId,
            @RequestParam(name = "startVer") Long startVer,
            @RequestParam(name = "endVer") Long endVer,
            @RequestParam(name = "pageSize", required = false, defaultValue = "20") Integer pageSize,
            @RequestParam(name = "currentPage", required = false, defaultValue = "1") Integer currentPage) {
        return modelService.getModelEditDetailAuditLogPage(modelId, startVer, endVer, pageSize, currentPage);
    }

    @RequestMapping(value = "/{modelId}/editlog/elements/{elementId}")
    @Operation(summary = "获取某一个元素的修改历史", description = "获取某一个元素的修改历史，对于老的版本可能会被从数据库删除，只保留在maudit.log文件中")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "elementId", description = "元素ID, 此元素必须是table，column， keygroup， key或者diagram中一种，其它类型不会单独记录", in = ParameterIn.PATH, required = true)})
    //@PreAuthorize(UserRights.MODEL_ACCESS_MODEL_ID_PERMISSION)
    public List<ApiModelVerEditDetailLog> getModelElementEditDetailAuditLog(
            @PathVariable("modelId") Long modelId,
            @PathVariable("elementId") Long elementId) {
        modelService.getModelById(modelId);
        return modelService.getModelElementVerDetailEditLog(modelId, elementId);
    }

    @RequestMapping(value = "/{modelId}/editlog/table/{elementId}")
    @Operation(summary = "获取表的修改历史，包含表的字段，索引和索引成员", description = "获取表的修改历史，包含表的字段，索引和索引成员")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "elementId", description = "表的元素ID", in = ParameterIn.PATH, required = true)})
    public List<ModelVerDetailLogDto> getTableVerDetailEditLog(
            @PathVariable("modelId") Long modelId,
            @PathVariable("elementId") Long elementId) {
        modelService.getModelById(modelId);
        return modelService.getTableVerDetailEditLog(modelId, elementId);
    }

    @RequestMapping(value = "/search", method = RequestMethod.PUT)
    @Operation(summary = "通过名称和中文名搜索对象", description = "通过名称和中文名搜索对象, 默认为表和字段, 仅搜索模型的master分支")
    @Parameters({
            @Parameter(name = "keyword", description = "关键字", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "pageSize", description = "每页大小", in = ParameterIn.QUERY, required = true)})
    public List<ModelElementExtendDto> searchTableAndColumnInModelStore(
            @RequestParam("keyword") String keyword,
            @RequestParam("currentPage") Integer currentPage,
            @RequestParam("pageSize") Integer pageSize,
            @Parameter(description = "类型ID") @RequestParam(name = "typeIds", required = false) Set<Long> typeIds,
            @Parameter(description = "标签ID列表") @RequestParam(name = "tagIds", required = false) Set<Long> tagIds) {
        return modelService.getObjectsByName(keyword, typeIds, tagIds,
                currentPage, pageSize);
    }

    @RequestMapping(value = "/web-search", method = RequestMethod.PUT)
    @Operation(summary = "通过名称和中文名搜索对象", description = "通过名称和中文名搜索对象, 默认为表和字段, 仅搜索模型的master分支")
    public Page<ModelElementExtendDto> searchTableAndColumnInModelStore(
            @Parameter(description = "搜索条件对象", required = true) @RequestBody WebSearchForTableAndColumnDto searchDto) {
        String keyword = searchDto.getKeyword();
        Set<Long> typeIds = searchDto.getTypeIds();
        Set<Long> tagIds = searchDto.getTagIds();
        int currentPage = searchDto.getCurrentPage();
        int pageSize = searchDto.getPageSize();
        return modelService.getObjectsByNameForWeb(keyword, typeIds, tagIds,
                currentPage, pageSize);
    }

    protected List<ModelElementExtendDto> convertToModelElementExtendDto(
            List<ModelElement> elements) {
        List<ModelElementExtendDto> elems = new ArrayList<>();

        for (ModelElement element : elements) {
            ModelElementExtendDto dto = new ModelElementExtendDto(element);
            Long modelId = element.getModelId();
            try {
                Model model = modelService.getModelByIdWithoutPermissionCheck(modelId);
                if (model != null) {
                    dto.setModelName(model.getName());
                    dto.setModelType(model.getModelType());
                    dto.setUseProto(model.getUseProto());
                }

                elems.add(dto);
            } catch (Exception ex) {
                // do nothing if model id deleted in db
            }
        }

        return elems;
    }

    @RequestMapping(value = "/{modelId}/table/{tableId}")
    @Operation(summary = "返回模型库中某个表的详细信息", description = "返回模型库中某个表的详细信息")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "tableId", description = "表ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "isSimple", description = "是否仅包含简要信息", in = ParameterIn.QUERY),
            @Parameter(name = "includeSub", description = "是否加载子元素", in = ParameterIn.QUERY)})
    public List<ModelElementExtendDto> loadTableInfo(@PathVariable("modelId") Long modelId,
                                                     @PathVariable("tableId") Long tableId,
                                                     @RequestParam(value = "isSimple", defaultValue = "false") boolean isSimple,
                                                     @RequestParam(value = "includeSub", defaultValue = "true") Boolean includeSub) {
        return convertToModelElementExtendDto(modelService.getCompleteTable(modelId, tableId, isSimple, includeSub));
    }

    @RequestMapping(value = "/{modelId}/table/{tableId}/related")
    @Operation(summary = "返回模型库中某个表的关联对象", description = "返回模型库中某个表的关联对象")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "tableId", description = "表ID", in = ParameterIn.PATH, required = true)})
    public List<ModelElementExtendDto> getTableRelatedObjects(@PathVariable("modelId") Long modelId,
                                                              @PathVariable("tableId") Long tableId) {
        return modelService.getTableRelatedObjects(modelId, tableId);
    }

    @RequestMapping(value = "/manage/{modelId}/domain_state")
    @Operation(summary = "获取一个模型打标准的状态", description = "获取一个模型打标准的状态")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "versionId", description = "模型版本ID", in = ParameterIn.QUERY),
            @Parameter(name = "filterIsPhysicalOnly", description = "是否需要仅物理属性", in = ParameterIn.QUERY)})
    public List<ModelColumnDomainApplyStatusDto> getDomainApplyState(
            @PathVariable("modelId") Long modelId,
            @RequestParam(value = "versionId", required = false) Long versionId,
            @RequestParam(value = "filterIsPhysicalOnly", required = false, defaultValue = "false") boolean filterIsPhysicalOnly) {
        return localDomainService.getModelApplyDomainStatus(modelId, versionId, filterIsPhysicalOnly);
    }

    @RequestMapping(value = "/manage/{modelId}/tables")
    @Operation(summary = "获取一个模型的所有表", description = "获取一个模型的所有表")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public List<CommonTable> getModelTables(@PathVariable("modelId") Long modelId) {
        return DatablauRemoteDdmModelServiceImpl
                .convertToCommonTables(modelElementDao.getShallowTablesByModelId(modelId),
                        modelElementDao);
    }

    @RequestMapping(value = "/manage/{modelId}/tables/{tableId}")
    @Operation(summary = "获取一个表的所有字段", description = "获取一个表的所有字段")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "tableId", description = "表的ID", in = ParameterIn.PATH, required = true)})
    public List<CommonColumn> getColumnsOfTable(@PathVariable("modelId") Long modelId,
                                                @PathVariable("tableId") Long tableId) {
        List<ShallowModelElement> columns = modelElementDao
                .getShallowColumnsByModelIdAndTableId(modelId, tableId);
        return DatablauRemoteDdmModelServiceImpl.convertToCommonColumns(columns);
    }

    @RequestMapping("/{modelId}/elements/{elementId}/parent")
    @Operation(summary = "获取模型的指定元素的父元素ID", description = "获取模型的指定元素的父元素ID")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "elementId", description = "元素ID", in = ParameterIn.PATH, required = true)})
    public Long getParentIdOfElement(@PathVariable("modelId") Long modelId,
                                     @PathVariable("elementId") Long elementId) {
        return modelElementDao.findModelElementParentId(modelId, elementId);
    }

    @RequestMapping(value = "/manage/{modelId}/domain_state/export")
    @Operation(summary = "导出一个模型打标准的状态", description = "导出一个模型打标准的状态")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "versionId", description = "模型版本ID", in = ParameterIn.QUERY)})
    public ResponseEntity<byte[]> exportDomainApplyState(@PathVariable("modelId") Long modelId,
                                                         @RequestParam(value = "versionId", required = false) Long versionId) {

        HttpHeaders headers = new HttpHeaders();

        File file = localDomainService.exportModelApplyDomainStatus(modelId, versionId);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        String realName = msgService.getMessage("usage") + ".xlsx";
        try {
            realName = URLEncoder.encode(realName, "UTF-8");
            realName = realName.replace("+", "%20");
        } catch (Exception ex) {
            logger.warn("Failed to convert template file name");
        }
        headers.setContentDispositionFormData("attachment", realName);

        ResponseEntity<byte[]> result = null;
        try {
            result = new ResponseEntity<>(FileUtils.readFileToByteArray(file), headers,
                    HttpStatus.OK);
        } catch (Exception e) {
            throw new AndorjRuntimeException("failed to export file");
        }
        return result;
    }

    @RequestMapping("/{modelId}/history/versions/{verId}/details")
    @Operation(summary = "获取模型指定版本的详细修改记录", description = "获取模型指定版本的详细修改记录")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "verId", description = "版本号", in = ParameterIn.PATH, required = true)})
    public VersionElementChangesDto getModelHistoryDetails(@PathVariable("modelId") Long modelId,
                                                           @PathVariable("verId") Long ver) throws Exception {
        return modelService.getElementsChanges(modelId, ver);
    }

    @RequestMapping("/script/option")
    @Operation(summary = "获取默认模型ddl脚本选项", description = "获取默认模型ddl脚本选项")
    @Parameters({
            @Parameter(name = "dbType", description = "模型类型", in = ParameterIn.QUERY)})
    public ForwardOption getModelScriptDefaultOption(
            @RequestParam(value = "dbType", required = false) DbType dbType) throws Exception {
        if (dbType == null) {
            return fesService.getDefaultForwardOption();
        } else {
            return fesService.getDefaultForwardOption(dbType);
        }
    }

    @RequestMapping(value = "/{modelId}/script", method = RequestMethod.POST)
    @Operation(summary = "获取模型ddl脚本", description = "获取模型ddl脚本")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public FesResult getModelScript(@PathVariable("modelId") Long modelId,
                                    @Parameter(name = "targetVerId", description = "目标版本号") @RequestParam(value = "targetVerId", required = false) Long targetVerId,
                                    @Parameter(name = "baseVerId", description = "基准版本号") @RequestParam(value = "baseVerId", required = false) Long baseVerId,
                                    @Parameter(name = "mode", description = "产生脚本模式", required = true) @RequestParam(value = "mode") FesResult.FesMode mode,
                                    @Parameter(name = "bySchema", description = "是否按照schema分类") @RequestParam(value = "bySchema", required = false, defaultValue = "false") Boolean bySchema,
                                    @Parameter(name = "option", description = "ForwardSetting") @RequestBody ForwardSetting option
    ) throws Exception {
        return modelService.getModelScript(modelId, targetVerId, baseVerId, mode, option, bySchema);
    }

    @PutMapping("/fesTemplate")
    @Operation(summary = "获取正向工程模板", description = "获取正向工程模板")
    @Parameters({
            @Parameter(name = "group", description = "组", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "name", description = "名称", in = ParameterIn.QUERY, required = true)})
    public FesResResult updateFesTemplate(@RequestParam("group") String group,
                                          @RequestParam("name") String name,
                                          @RequestBody FesTemplate template) {
        return modelService.updateFesTemplate(group, name, template.getTemplate());
    }

    @GetMapping("/defaultFesTemplate")
    @Operation(summary = "获取默认正向工程模板", description = "获取默认正向工程模板")
    @Parameters({
            @Parameter(name = "group", description = "组", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "name", description = "名称", in = ParameterIn.QUERY, required = true)})
    public FesResResult getDefaultFesTemplate(@RequestParam("group") String group,
                                              @RequestParam("name") String name) {
        return modelService.getDefaultFesTemplate(group, name);
    }

    @GetMapping("/fesTemplate")
    @Operation(summary = "获取正向工程模板", description = "获取正向工程模板")
    @Parameters({
            @Parameter(name = "group", description = "组", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "name", description = "名称", in = ParameterIn.QUERY, required = true)})
    public FesResResult getFesTemplate(@RequestParam("group") String group,
                                       @RequestParam("name") String name) {
        return modelService.getFesTemplate(group, name);
    }

    @RequestMapping("/jpaClasses/option")
    @Operation(summary = "获取默认模型jpa脚本选项", description = "获取默认模型jpa脚本选项")
    public ForwardOption getModelJpaClassDefaultOption() throws Exception {
        return fesService.getDefaultJpaForwardOption();
    }

    @RequestMapping(value = "/{modelId}/jpaClasses", method = RequestMethod.POST)
    @Operation(summary = "获取模型jpa class", description = "获取模型jpa class")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "targetVerId", description = "目标版本号", in = ParameterIn.QUERY)})
    public FesResResult getModelJpaClasses(@PathVariable("modelId") Long modelId,
                                           @RequestParam(value = "targetVerId", required = false) Long targetVerId,
                                           @RequestBody JpaClassForwardBodyParam body
    ) throws Exception {
        return modelService.getModelJpaClass(modelId, targetVerId, body);
    }

    @RequestMapping(value = "/{modelId}/jpaClasses/download", method = RequestMethod.POST)
    @Operation(summary = "下载模型jpa class", description = "下载模型jpa class")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "targetVerId", description = "目标版本号", in = ParameterIn.QUERY)})
    public void downloadModelJpaClassesZip(@PathVariable("modelId") Long modelId,
                                           @RequestParam(value = "targetVerId", required = false) Long targetVerId,
                                           @RequestBody JpaClassForwardBodyParam body,
                                           HttpServletResponse response
    ) throws Exception {
        String tempFolder = GeneralUtility.getTempFolder();
        String downloadFolderPath =
                tempFolder + File.separator + UUID.randomUUID().toString().replaceAll("-", "")
                        .substring(8);
        File dir = new File(downloadFolderPath);
        FesResResult fesResResult = modelService
                .generateModelJpaClassFile(modelId, targetVerId, downloadFolderPath, body);
        if (!fesResResult.isSuccess()) {
            response.setContentType("application/json");
            String s = objectMapper.writer().writeValueAsString(fesResResult);
            response.getWriter().print(s);
            return;
        }
        File zipFile = GeneralUtility
                .zipDirectory(dir, new File(tempFolder + File.separator + dir.getName() + ".zip"));
        response.setContentType("application/octet-stream");
        String realName = "";
        try {
            realName = URLEncoder.encode("jpaClasses", "UTF-8");
            realName = realName.replace("+", "%20");
        } catch (Exception ex) {
            logger.warn("Failed to convert template file name");
        }

        response.setHeader("Content-disposition", "attachment; filename=" + realName + ".zip");
        response.setHeader("Content-Length", String.valueOf(zipFile.length()));

        try {
            FileUtils.copyFile(zipFile, response.getOutputStream());
        } finally {
            if (dir.isDirectory() && dir.exists()) {
                FileUtils.deleteQuietly(dir);
            }

            if (zipFile.exists()) {
                FileUtils.deleteQuietly(zipFile);
            }
        }
    }

    @RequestMapping(value = "/{modelId}/jpaClassesFile", method = RequestMethod.POST)
    @Operation(summary = "生成jpa class的类文件，测试用", description = "生成jpa class的类文件，测试用")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "targetVerId", description = "目标版本号", in = ParameterIn.QUERY),
            @Parameter(name = "path", description = "文件存放的路径", in = ParameterIn.QUERY, required = true)})
    public FesResResult getModelJpaClassesFile(@PathVariable("modelId") Long modelId,
                                               @RequestParam(value = "targetVerId", required = false) Long targetVerId,
                                               @RequestParam String path,
                                               @RequestBody JpaClassForwardBodyParam body
    ) throws Exception {
        return modelService.generateModelJpaClassFile(modelId, targetVerId, path, body);
    }


    @RequestMapping("/{modelId}/history/versions/{baseVerId}/{targetVerId}/details")
    @Operation(summary = "获取模型任意两个签入版本的详细修改记录", description = "获取模型任意两个签入版本的详细修改记录")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "baseVerId", description = "签入版本ID1", in = ParameterIn.PATH, required = true),
            @Parameter(name = "targetVerId", description = "对比签入版本ID2", in = ParameterIn.PATH, required = true),
            @Parameter(name = "showAll", description = "是否显示所有属性信息", in = ParameterIn.QUERY)})
    public VersionElementChangesDto getModelHistoryDetailsNew(@PathVariable("modelId") Long modelId,
                                                              @PathVariable("baseVerId") Long baseVerId,
                                                              @PathVariable("targetVerId") Long targetVerId,
                                                              @RequestParam(value = "showAll", defaultValue = "true") boolean showAll)
            throws Exception {
        return modelService
                .getElementsChangesBetweenTwoVersions(modelId, baseVerId, targetVerId, showAll);
    }


    @RequestMapping(value = "/checkns")
    @Operation(summary = "获取模型库中不符合该术语的表和字段", description = "获取模型库中不符合该术语的表和字段")
    @Parameters({
            @Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "pageSize", description = "每页大小", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "modelIds", description = "模型id", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "chName", description = "中文名", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "abbr", description = "英文缩写", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "type", description = "查询对象类型", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "ignoreNonAuto", description = "是否过滤没有打开自动翻译功能的模型", in = ParameterIn.QUERY)})
    public PageResult<CheckNamingStandardDto> checkNamingStandardInDDM(
            @RequestParam("currentPage") Integer currentPage,
            @RequestParam("pageSize") Integer pageSize,
            @RequestParam(name = "modelIds", required = false) String modelIdsStr,
            @RequestParam("chName") String chName,
            @RequestParam("abbr") String abbr,
            @RequestParam("type") Long typeId,
            @RequestParam(value = "ignoreNonAuto", defaultValue = "false") Boolean ingoreNonAutoTranslatedModel)
            throws Exception {
        List<Long> modelIds = null;
        try {
            if (!Strings.isNullOrEmpty(modelIdsStr)) {
                String[] ids = modelIdsStr.split(",");
                modelIds = new ArrayList<>();
                for (String id : ids) {
                    modelIds.add(Long.parseLong(id));
                }
            } else {
                modelIds = Collections.emptyList();
            }
        } catch (Exception ex) {
            throw new IllegalArgumentException(msgService.getMessage("unknowModelId"));
        }

        return modelService
                .checkNamingStandard(modelIds, chName, abbr, currentPage, pageSize, typeId,
                        ingoreNonAutoTranslatedModel);
    }

    @RequestMapping(value = "/search/path", method = RequestMethod.POST)
    @Operation(summary = "通过模型路径获取模型的ID", description = "通过模型路径获取模型的ID")
    public Model getModelIdByModelPath(
            @Parameter(description = "模型路径", required = true) @RequestBody String modelPath) {
        return modelService.searchModelByPath(modelPath);
    }

    @RequestMapping(value = "/search/table", method = RequestMethod.POST)
    @Operation(summary = "搜索模型中的表", description = "搜索模型中的表")
    public ShallowVerModelElement getTableByNameOrId(
            @Parameter(description = "模型搜索条件", required = true) @RequestBody SearchTablesByNameDto condition) {
        return modelService.searchTableInModelStore(condition);
    }

    @RequestMapping(value = "/{modelId}/limitedDsApply", method = RequestMethod.POST)
    @Operation(summary = "设置模型强管控模式", description = "设置模型强管控模式")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "config", description = "强管控模式", in = ParameterIn.QUERY, required = true)})
    public Model proceedToNextPhase(@PathVariable("modelId") Long modelId,
                                    @RequestParam(value = "config") boolean limitedDsApply,
                                    @Parameter(description = "强管控模式详细设置", required = true) @RequestBody ModelLimitedDsApplyConfigDto config) {

        return modelService.setModelLimitedDsApply(modelId, limitedDsApply, config);
    }

    @RequestMapping(value = "/{modelId}/copy/{categoryId}", method = RequestMethod.POST)
    @Operation(summary = "复制一个模型到指定目录", description = "复制一个模型到指定目录")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "categoryId", description = "复制到目录ID", in = ParameterIn.PATH, required = true)})

    public void copyModel(@PathVariable("modelId") Long modelId,
                          @PathVariable("categoryId") Long categoryId) {
        modelService.copyModel(modelId, categoryId);
    }

    @RequestMapping(value = "/{modelId}/move/{categoryId}", method = RequestMethod.POST)
    @Operation(summary = "移动模型至另一个目录", description = "移动模型至另一个目录")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "categoryId", description = "复制到目录ID", in = ParameterIn.PATH, required = true)})
    public void moveModel(@PathVariable("modelId") Long modelId,
                          @PathVariable("categoryId") Long categoryId) {
        modelService.cutModel(modelId, categoryId);
    }

    @RequestMapping("/phases")
    @Operation(summary = "把当前分支阶段更改到下一个阶段", description = "把当前分支阶段更改到下一个阶段，只有模型管理员有权限")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "cur_phase", description = "设置模型阶段代码", in = ParameterIn.QUERY, required = true)})
    public Model setToNextPhase(@RequestParam("modelId") Long modelId,
                                @RequestParam("cur_phase") Integer currentPhase) {

        return modelService.setModelPhase(modelId, currentPhase);
    }

    @RequestMapping(value = "/option", method = RequestMethod.POST)
    @Operation(summary = "保存模型脚本配置", description = "保存模型脚本配置,模型类型统一配置需要DDL配置的权限点,单模型配置保存需要DDL配置的权限点或者模型管理员")
    public ScriptOption createModelScriptOption(
            @Parameter(description = "模型脚本设置") @RequestBody ScriptOption scriptOption)
            throws Exception {
        return scriptOptionService.saveModelScriptOption(scriptOption);
    }

    @RequestMapping(value = "/{modelId}/option", method = RequestMethod.GET)
    @Operation(summary = "根据模型ID和脚本类型获取模型关联的脚本配置", description = "根据模型ID和脚本类型获取模型关联的脚本配置")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "type", description = "脚本类型", in = ParameterIn.QUERY, required = true)})
    public ScriptOption getModelScriptOption(@PathVariable("modelId") Long modelId,
                                             @RequestParam("type") ScriptOption.ScriptOptionType type) {
        return scriptOptionService.getModelScriptOption(modelId, type);
    }

    @RequestMapping(value = "/{modelId}/options", method = RequestMethod.GET)
    @Operation(summary = "根据模型ID获取模型关联的所有类型的脚本配置", description = "根据模型ID获取模型关联的所有类型的脚本配置")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public List<ScriptOption> getModelScriptOptions(@PathVariable("modelId") Long modelId) {
        return scriptOptionService.getModelScriptOptions(modelId);
    }

    @RequestMapping(value = "/options", method = RequestMethod.GET)
    @Operation(summary = "根据模型类型获取所有脚本配置", description = "根据模型类型获取所有脚本配置")
    @Parameters({@Parameter(name = "dbType", description = "模型类型", in = ParameterIn.QUERY)})
    public List<ScriptOption> getModelTypeBindScriptOptions(@RequestParam DbType dbType) {
        List<ScriptOption.ScriptOptionType> allTypes = new ArrayList<>(Arrays.asList(ScriptOption.ScriptOptionType.values()));
        return scriptOptionService.getModelTypeScriptOptions(dbType, allTypes);
    }

    @RequestMapping(value = "/script/options", method = RequestMethod.GET)
    @Operation(summary = "获取所有模型类型的DDL脚本配置", description = "获取所有模型类型的DDL脚本配置")
    public Map<DbType, List<ScriptOption>> getAllModelTypeScriptOptions(
            @Parameter(description = "是否返回默认模板") @RequestParam(required = false, defaultValue = "false") boolean withDefault) {
        return scriptOptionService.getAllModelTypeScriptOptions(withDefault);
    }

    @RequestMapping(value = "/branch/{modelId}/merge/{baseVerId}/{targetVerId}", method = RequestMethod.POST)
    @Operation(summary = "根据分支模型ID及起始结束版本自动合并至master", description = "根据分支模型ID及起始结束版本自动合并至master")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "baseVerId", description = "分支起始签入版本", in = ParameterIn.PATH, required = true),
            @Parameter(name = "targetVerId", description = "分支结束签入版本", in = ParameterIn.PATH, required = true),
            @Parameter(name = "typeFilter", description = "类型过滤器:"
                    + "80000004(表),"
                    + "80000007(关系),"
                    + "80500008(视图)"
                    + "80700001(schema),"
                    + "80600002(tablespace),"
                    + "80600146(序列),"
                    + "80000027(备注),"
                    + "80010214(样式)", in = ParameterIn.QUERY, required = false)})
    public BranchAutoMergeResultDto autoMerge(@PathVariable("modelId") Long modelId,
                                              @PathVariable("baseVerId") Long baseVerId,
                                              @PathVariable("targetVerId") Long targetVerId,
                                              @Parameter(description = "类型过滤器") @RequestParam(value = "typeFilter", required = false) Set<Long> filteredTypeIds,
                                              @Parameter(description = "是否包含合并主题域,若包含主题域,会自动补全形状对应的对象")
                                              @RequestParam(value = "includeDiagram", required = true, defaultValue = "false") Boolean includeDiagram
    ) throws Exception {
        Boolean beforeLock = modelService.beforeAutoMergerLockModel(modelId, true);
        try {
            return modelService.autoMergeByFilteredType(modelId, baseVerId, targetVerId, filteredTypeIds, includeDiagram);
        } finally {
            modelService.afterAutoMergerUnlockModel(modelId, beforeLock);
        }
    }


    @RequestMapping(value = "/branch/{modelId}/merge/{baseVerId}/{targetVerId}/to/{targetModelId}", method = RequestMethod.POST)
    @Operation(summary = "根据分支模型ID及起始结束版本自动合并至master", description = "根据分支模型ID及起始结束版本自动合并至master")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "baseVerId", description = "分支起始签入版本", in = ParameterIn.PATH, required = true),
            @Parameter(name = "targetVerId", description = "分支结束签入版本", in = ParameterIn.PATH, required = true),
            @Parameter(name = "targetModelId", description = "合并目标模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "typeFilter", description = "类型过滤器:"
                    + "80000004(表),"
                    + "80000007(关系),"
                    + "80500008(视图)"
                    + "80700001(schema),"
                    + "80600002(tablespace),"
                    + "80600146(序列),"
                    + "80000027(备注),"
                    + "80010214(样式)", in = ParameterIn.QUERY, required = false)})
    public BranchAutoMergeResultDto autoMerge(@PathVariable("modelId") Long modelId,
                                              @PathVariable("baseVerId") Long baseVerId,
                                              @PathVariable("targetVerId") Long targetVerId,
                                              @PathVariable("targetModelId") Long targetModelId,
                                              @Parameter(description = "类型过滤器") @RequestParam(value = "typeFilter", required = false) Set<Long> filteredTypeIds,
                                              @Parameter(description = "是否包含合并主题域,若包含主题域,会自动补全形状对应的对象")
                                              @RequestParam(value = "includeDiagram", required = true, defaultValue = "false") Boolean includeDiagram,
                                              @Parameter(description = "签入版本名称")
                                              @RequestParam(value = "checkInName", required = false) String checkInName,
                                              @Parameter(description = "是否从初始版本开始第一次合并")
                                              @RequestParam(value = "mergeFromOriginal", required = false, defaultValue = "true") Boolean mergeFromOriginal,
                                              @Parameter(description = "签入版本描述")
                                              @RequestBody String checkInDesc
    ) throws Exception {
        Boolean beforeLock = modelService.beforeAutoMergerLockModel(targetModelId, false);
        CreateModelVersionDto version = new CreateModelVersionDto();//填充版本属性
        version.setModelId(targetModelId);
        version.setVersion(checkInName);
        if (StringUtils.isNotEmpty(checkInDesc)) {
            Map<String, String> result = objectMapper.readValue(checkInDesc, new TypeReference<HashMap<String, String>>() {
            });
            if (result != null && result.size() > 0) {
                version.setDescription(result.get("checkInDesc"));
            }
        }
        modelService.setMergeFromOriginalVersion(mergeFromOriginal);
        try {
            return modelService.autoMergeByFilteredType(modelId, baseVerId, targetVerId, filteredTypeIds, includeDiagram, targetModelId, version);
        } finally {
            modelService.afterAutoMergerUnlockModel(targetModelId, beforeLock);
        }
    }

    @RequestMapping(value = "/recommend/ds/", method = RequestMethod.POST)
    @Operation(summary = "批量获取属性的推荐数据标准", description = "批量获取属性的推荐数据标准")
    public List<RecommendDSDto> recommendDS(@RequestBody List<RecommendDSDto> recommends) {
        if (recommends == null || recommends.size() == 0) {
            return null;
        }
        return modelService.recommendDSBasedOnChNameOrEnName(recommends);
    }

    @GetMapping("/info/statistics")
    @Operation(summary = "获取模型的统计信息")
    public ModelInfoStatistics getInfo(@RequestParam(value = "modelId") Long modelId, @RequestParam(value = "version", required = false) Long version) {
        ModelInfoStatistics result = modelInfoStatisticsService.getModelInfoStatistics(modelId, version);
        return result;
    }


    @GetMapping("/duplicated")
    @Operation(summary = "模型名是否重复")
    public Boolean isDuplicated(@RequestParam(value = "categoryId") Long categoryId, @RequestParam(value = "modelName") String modelName) {
        if (modelDao.getModelsCountInCategoryWithModelName(categoryId, modelName) > 0) {
            return true;
        }
        return false;
    }

    @RequestMapping(value = "/{modelId}/config", method = RequestMethod.GET)
    @Operation(summary = "根据模型ID获取模型关联的所有模型配置项", description = "根据模型ID获取模型关联的所有模型配置项")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public ModelConfigurationDto getModelConfiguration(@PathVariable("modelId") Long modelId) {
        return modelService.getModelConfiguration(modelId);
    }


    @RequestMapping(value = "/{modelId}/simple", method = RequestMethod.GET)
    @Operation(summary = "根据模型ID获取模型树", description = "根据模型ID获取模型关联的所有模型配置项")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public SimpleModelElementTreeNode getSimpleModelElementTreeNode(@PathVariable("modelId") Long modelId)
            throws Exception {
        return modelService.getSimpleModelElementTree(modelId);
    }

    @GetMapping(value = "/layers/{currentPage}/{pageSize}")
    @Operation(summary = "从ddd获取数仓分层规范配置")
    @Parameters({
            @Parameter(name = "currentPage", description = "当前分页", in = ParameterIn.PATH, required = true),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.PATH, required = true)})
    public String getLayersFromDDD(@PathVariable("currentPage") Integer currentPage,
                                   @PathVariable("pageSize") Integer pageSize) {

        String url;
        try {
            url = microserviceUtils.getMicroserviceUrl(MicroserviceType.DDD);
        } catch (Exception ex) {
            return "";
        }

        logger.info("ddd url is:" + url);

        HashMap<String, Integer> map = new HashMap<>();
        map.put("currentPage", currentPage);
        map.put("pageSize", pageSize);

        String layers = restTemplate.getForObject(url + "/layers?currentPage={currentPage}&pageSize={pageSize}", String.class, map);
        return layers;
    }

    @GetMapping(value = "/dwmapping/{currentPage}/{pageSize}")
    @Operation(summary = "从ddd获取映射类型")
    @Parameters({
            @Parameter(name = "currentPage", description = "当前分页", in = ParameterIn.PATH, required = true),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.PATH, required = true)})
    public String getDWMappingTypeFromDDD(@PathVariable("currentPage") Integer currentPage,
                                          @PathVariable("pageSize") Integer pageSize) {
        ThirdPartyInfoRepository thirdPartyInfoDao = BeanHelper.getBean(ThirdPartyInfoRepository.class);
        ThirdPartyInfo dwMappingType = thirdPartyInfoDao.findThirdPartyInfoByName("DWMappingType");
        if (dwMappingType == null) {
            String url = microserviceUtils.getMicroserviceUrl(MicroserviceType.DDD);
            logger.info("ddd url is:" + url);
            HashMap<String, Integer> map = new HashMap<>();
            map.put("currentPage", currentPage);
            map.put("pageSize", pageSize);
            String types = restTemplate.getForObject(url + "/dwmapping?currentPage={currentPage}&pageSize={pageSize}", String.class, map);
            return types;
        } else {
            String url = dwMappingType.getThirdPartyUrl();
            logger.info("thirdPartyInfoDao url is:" + url);
            HashMap<String, Integer> map = new HashMap<>();
            map.put("currentPage", currentPage);
            map.put("pageSize", pageSize);
            String types = restTemplate.getForObject(url, String.class, map);
            return types;
        }
    }

    @Operation(summary = "根据映射关系生成SQL", description = "根据映射关系生成SQL")
    @PostMapping("/dwmapping/{modelId}/table/sql")
    public List<DwMappingDto> bulidSqlByMappingRelation(@PathVariable("modelId") Long modelId,
                                                        @RequestBody List<DwMappingDto> dwMappingDto) {
        return dwMappingService.getInsertSqlByMappingRelation(modelId, dwMappingDto);
    }

    /**
     * 根据sql创建表
     * @param modelId 模型ID
     * @param sql sql
     * @return ParsedObject
     */
    @Operation(summary = "根据sql创建表", description = "根据sql创建表")
    @PostMapping("/{modelId}/create/table/sql")
    public ParsedObject createTableBySql(@PathVariable("modelId") Long modelId,
                                            @RequestBody DwMappingDto sql) {
        return modelService.createTableBySql(modelId, sql.getSql());
    }

    @Operation(summary = "根据模型、版本及关键词查询指定模型中的字段")
    @PostMapping("/columns")
    public List<ColumnInfoDto> getColumnsByModelAndKeywords(@RequestBody AutoModelPropDto autoModelPropDto) {
        return modelService.getColumnsByModelAndKeywords(autoModelPropDto);
    }

    @Operation(summary = "获取模型中所有的字段详情")
    @GetMapping("/{modelId}/columns")
    public List<ColumnInfoDto> getModelColumns(@PathVariable Long modelId, @RequestParam(required = false) Long modelVersionId) {
        return modelService.getModelColumns(modelId, modelVersionId, null);
    }

    @Operation(summary = "获取模型中所有字段之间的关系", description = "父子字段映射")
    @GetMapping("/{modelId}/columns/relation")
    public List<ColumnRelationDto> getColumnRelation(@PathVariable Long modelId, @RequestParam(required = false) Long modelVersionId) {
        return modelService.getColumnRelation(modelId, modelVersionId);
    }

    @RequestMapping("/searchTree")
    @Operation(summary = "搜索获取模型的树形结构", description = "搜索获取模型的树形结构")
    public List<ModelSearchDto> getModelSearchTree(@RequestParam String search, @RequestParam(required = false) Long id) throws Exception {
        if (SpringContextUtils.isFromClient()) {
            permissionHelper.reloadCurrentUserAuth(false);
        }
        List<ModelSearchDto> modelTree = modelService.getModelSearchTree(search, id);
        return modelTree;
    }

    @GetMapping("/{modelId}/diagrams")
    public List<ModelDiagramElementDto> getModelDiagrams(@PathVariable Long modelId) {
        return modelService.getModelDiagrams(modelId);
    }

    @RequestMapping("/category/{categoryId}/baselines")
    @Operation(summary = "获取指定目录下的所有模型的分支", description = "获取指定目录下的所有模型的分支")
    @Parameters({@Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public List<Model> getModelBaselinesUnderCategory(@PathVariable("categoryId") Long categoryId,
                                                      @RequestParam(name ="showSubCategory",defaultValue = "false",required = false) boolean showSubCategory) {
        return modelService.getModelBaselinesUnderCategory(categoryId,showSubCategory);
    }

    @RequestMapping("/activeBranch")
    @Operation(summary = "得到模型的活跃分支", description = "得到模型的活跃分支")
    public Map<Long,Long> getActiveModelOfModelId(@RequestBody Collection<Long> modelIds) {
        return modelService.getActiveModelsOfModel(modelIds);
    }

    @RequestMapping("/model/source/{modelId}")
    @Operation(summary = "得到当前模型下的modelsource", description = "得到当前模型下的modelsource")
    public ModelElement getModelElementOfModel(@PathVariable Long modelId) {
        return modelService.getModelElementOfModel(modelId);
    }


}