package com.datablau.model.server.controller;

import com.datablau.model.data.api.MappingModelService;
import com.datablau.model.data.dto.CreateMappingModelNewDto;
import com.datablau.model.data.dto.FindMappingModelsDto;
import com.datablau.model.data.dto.MappingModelDto;
import com.datablau.model.data.dto.MappingModelTreeNodeDto;
import com.datablau.model.data.dto.SaveMappingModelDto;
import com.datablau.model.data.jpa.entity.MappingModel;
import com.datablau.model.data.jpa.repository.MappingModelRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import com.datablau.data.common.controller.BaseController;
/**
 * @Author Jing - 北京数语科技有限公司
 * @Date 4/1/2021 1:46 PM
 */
@RestController("mappingModelController")
@ConditionalOnMissingBean(name = "mappingModelControllerExt")
@RequestMapping("/mappingModels")
@Tag(name = "Mapping模型相关REST API", description = "Mapping模型相关REST API")
public class MappingModelController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(MappingModelController.class);

    @Autowired
    MappingModelService mappingModelService;

    @Autowired
    MappingModelRepository mappingModelDao;

    @RequestMapping("/list")
    @Operation(summary = "获取所有的模型", description = "获取所有的模型")
    public List<MappingModel> getMappingModels() {
        return mappingModelService.getAllMappingModels();
    }

    @RequestMapping("/")
    @Operation(summary = "获取Mapping模型的树形结构", description = "获取Mapping模型的树形结构")
    public MappingModelTreeNodeDto getModelTree() {
        return mappingModelService.getModelTree();
    }

    @RequestMapping(value = "/{modelId}/save", method = RequestMethod.POST)
    @Operation(summary = "save a mapping model", description = "save a mapping model")
    public void saveMappingModel(@RequestBody SaveMappingModelDto saveMappingModelDto,
                                 @Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        mappingModelService.saveModel(saveMappingModelDto);
    }

    @RequestMapping(value = "/{modelId}", method = RequestMethod.POST)
    @Operation(summary = "get the model info with the specified model id", description = "get the model info with the specified model id")
    public Optional<MappingModel> getMappingModelInfo(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        return mappingModelDao.findById(modelId);
    }

    protected MappingModelDto convertTo(MappingModel model) {
        MappingModelDto dto = new MappingModelDto();
        dto.setCurrentVersion(model.getCurrentVersion());
        return dto;
    }

    @RequestMapping(value = "/{modelId}/saveNew", method = RequestMethod.POST)
    @Operation(summary = "save a mapping model by another way", description = "save a mapping model by another way")
    public MappingModelDto saveMappingModeNew(@RequestBody SaveMappingModelDto saveMappingModelDto,
                                              @Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        saveMappingModelDto.setModelId(modelId);
        MappingModel model = mappingModelService.saveModel(saveMappingModelDto);
        return model == null ? null : convertTo(model);
    }

    @RequestMapping(value = "/createNew", method = RequestMethod.POST)
    @Operation(summary = "create a mapping model by another way", description = "create a mapping model by another way")
    public MappingModel createMappingModeNew(@RequestBody CreateMappingModelNewDto createMappingModelRequest) {
        return mappingModelService.createModelNew(createMappingModelRequest);
    }

    @RequestMapping(value = "/{modelId}/openNew", method = RequestMethod.POST)
    @Operation(summary = "get the latest mappings and model info", description = "get the latest mappings and model info")
    public MappingModelDto getMappingModelContentNew(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        return mappingModelService.getMappingModelContentNew(modelId);
    }

    @RequestMapping(value = "/{modelId}/lock", method = RequestMethod.PUT)
    @Operation(summary = "锁定指定的映射模型", description = "锁定指定的映射模型")
    public void lockModel(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        mappingModelService.lockModel(modelId);
    }

    @RequestMapping(value = "/{modelId}/unlock", method = RequestMethod.POST)
    @Operation(summary = "解锁指定的映射模型", description = "解锁指定的映射模型")
    public void unlockModel(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        mappingModelService.unlockModel(modelId);
    }

    @RequestMapping(value = "/{modelId}/getTargetTables", method = RequestMethod.GET)
    @Operation(summary = "get the latest target tables of mappings  model", description = "get the latest target tables of mappings  model")
    public List<String> getTargetTables(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        return mappingModelService.getTargetTables(modelId);
    }

    @RequestMapping(value = "/{combinedId}/getMappingModel", method = RequestMethod.GET)
    @Operation(summary = "get the mapping model which contains target table which has combinedId",
            description = "get the mapping model which contains target table which has combinedId")
    public List<MappingModel> getMappingModel(@Parameter(description = "目标表CombinedId") @PathVariable("combinedId") String combinedId) {
        return mappingModelService.getMappingModelsByCombinedId(combinedId);
    }

    @RequestMapping("/{modelId}/path")
    @Operation(summary = "获取一个模型的目录路径", description = "获取一个模型的目录路径")
    public String getMappingModelPath(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        return mappingModelService.getMappingModelFullPathOfStore(modelId);
    }


    @RequestMapping(value = "/findMappingModels", method = RequestMethod.PUT)
    @Operation(summary = "get the mapping model which contains target table which has combinedId",
            description = "get the mapping model which contains target table which has combinedId")
    public List<FindMappingModelsDto> findMappingModels(@Parameter(description = "目标表CombinedId") @RequestParam("combinedId") String combinedId) {
        return mappingModelService.getMappingModelsInfosBasedOnIds(combinedId);
    }

    @RequestMapping(value = "/{projectId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除指定的项目", description = "删除指定的项目")
    public void deleteModel(@Parameter(description = "项目ID") @PathVariable("projectId") Long projectId) {
        mappingModelService.deleteModel(projectId);
    }

    @RequestMapping(value = "/{projectId}", method = RequestMethod.GET)
    @Operation(summary = "获取指定项目的所有映射的SQL", description = "获取指定项目的所有映射的SQL")
    public List<String> getMappingModelSQLs(@Parameter(description = "项目Id") @PathVariable("projectId") Long projectId) {
        return mappingModelService.getMappingModelSQLs(projectId);
    }

    @RequestMapping(value = "/targetTableExisted", method = RequestMethod.GET)
    @Operation(summary = "检查目标表是否存在", description = "检查目标表是否存在")
    public boolean checkIfTargetExistedInMapping(@Parameter(description = "目标表CombinedId") @RequestParam("combinedId") String combinedId) {
        return mappingModelService.checkIfTargetTableExisted(combinedId);
    }

}
