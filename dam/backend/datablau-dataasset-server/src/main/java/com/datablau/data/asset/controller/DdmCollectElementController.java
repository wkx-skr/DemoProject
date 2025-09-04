package com.datablau.data.asset.controller;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.PageResult;
import com.datablau.data.asset.dto.DdmCollectElementConditionForModel;
import com.datablau.data.asset.dto.DdmCollectElementConditionForTable;
import com.datablau.data.asset.dto.DdmCollectElementQueryParamDto;
import com.datablau.data.asset.dto.DdmModelCollectElementDto;
import com.datablau.data.asset.jpa.entity.DdmCollectElement;
import com.datablau.data.asset.jpa.entity.DdmRelModelCategory;
import com.datablau.data.asset.service.DdmCollectElementService;
import com.datablau.data.asset.service.DdmRelModelCategoryService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.job.scheduler.data.DatablauJobExecutionException;
import com.datablau.metadata.common.api.DatablauRemoteDamModelService;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.dto.DdmModelElementDto;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Tag(name = "资产-模型元数据查询相关 API")
@RestController
@RequestMapping(value = "/ddm/data")
public class DdmCollectElementController extends BaseController {

    @Autowired
    private DdmCollectElementService ddmCollectElementService;
    @Autowired
    private DdmRelModelCategoryService ddmRelModelCategoryService;
    @Autowired
    private DatablauRemoteDdmModelServiceNew datablauRemoteDdmModelServiceNew;

    @Autowired
    private DatablauRemoteDamModelService datablauRemoteDamModelService;

    @GetMapping("/test")
    public void test(@RequestParam Long ddmModelId) throws Exception{
        //先删除已采集的数据
        ddmCollectElementService.deleteDdmCollectElementByDdmModelId(ddmModelId);
        DdmRelModelCategory ddmRelModelCategory = ddmRelModelCategoryService.queryRelModelCategory(ddmModelId);
        if (ddmRelModelCategory == null) {
            throw new DatablauJobExecutionException("未找到应用系统");
        }
        //获取ddm元素
        List<DdmModelElementDto> modelElementDtos = datablauRemoteDdmModelServiceNew.queryDdmModelElementDtos(ddmModelId);
        List<DdmModelElementDto> models = modelElementDtos.stream().filter(x -> Objects.equals(LDMTypes.oModelSource, x.getTypeId())).toList();
        List<DdmModelElementDto> tables = modelElementDtos.stream().filter(x -> Objects.equals(LDMTypes.oEntity, x.getTypeId())).toList();
        List<DdmModelElementDto> columns = modelElementDtos.stream().filter(x -> Objects.equals(LDMTypes.oAttribute, x.getTypeId())).toList();
        List<DdmCollectElement> ddmCollectElements = Lists.newArrayList();
        DdmCollectElement ddmCollectElement;
        for (DdmModelElementDto model : models) {
            ddmCollectElement = new DdmCollectElement();
            ddmCollectElement.setModelCategoryId(ddmRelModelCategory.getModelCategoryId());
            ddmCollectElement.setDdmModelId(model.getDdmModelId());
            ddmCollectElement.setDdmModelName(model.getDdmModelName());
            ddmCollectElement.setObjectId(model.getDdmModelId());
            ddmCollectElement.setParentId(model.getParentId());
            ddmCollectElement.setParentAlias(null);
            ddmCollectElement.setParentName(null);
            ddmCollectElement.setName(model.getDdmModelName());
            ddmCollectElement.setAlias(model.getDdmModelAlias());
            ddmCollectElement.setTableId(null);
            ddmCollectElement.setTypeId(model.getTypeId());
            ddmCollectElements.add(ddmCollectElement);
        }
        for (DdmModelElementDto table : tables) {
            ddmCollectElement = new DdmCollectElement();
            ddmCollectElement.setModelCategoryId(ddmRelModelCategory.getModelCategoryId());
            ddmCollectElement.setDdmModelId(table.getDdmModelId());
            ddmCollectElement.setDdmModelName(table.getDdmModelName());
            ddmCollectElement.setObjectId(table.getTableId());
            ddmCollectElement.setParentId(table.getParentId());
            ddmCollectElement.setParentAlias(table.getDdmModelAlias());
            ddmCollectElement.setParentName(table.getDdmModelName());
            ddmCollectElement.setName(table.getTableName());
            ddmCollectElement.setAlias(table.getTableCnName());
            ddmCollectElement.setTableId(table.getTableId());
            ddmCollectElement.setTypeId(table.getTypeId());
            ddmCollectElements.add(ddmCollectElement);
        }
        for (DdmModelElementDto column : columns) {
            ddmCollectElement = new DdmCollectElement();
            ddmCollectElement.setModelCategoryId(ddmRelModelCategory.getModelCategoryId());
            ddmCollectElement.setDdmModelId(column.getDdmModelId());
            ddmCollectElement.setDdmModelName(column.getDdmModelName());
            ddmCollectElement.setObjectId(column.getColumnId());
            ddmCollectElement.setParentId(column.getParentId());
            ddmCollectElement.setParentAlias(column.getTableCnName());
            ddmCollectElement.setParentName(column.getTableName());
            ddmCollectElement.setName(column.getColumnName());
            ddmCollectElement.setAlias(column.getColumnCnName());
            ddmCollectElement.setTableId(column.getParentId());
            ddmCollectElement.setTypeId(column.getTypeId());
            ddmCollectElement.setPk(column.getPk());
            ddmCollectElements.add(ddmCollectElement);
        }
        //保存数据
        ddmCollectElementService.saveAll(ddmCollectElements);
        //更新ddm_rel_model_category表更新时间
        ddmRelModelCategory.setUpdater(AuthTools.currentUsernameFailFast());
        ddmRelModelCategory.setUpdateTime(new Date());
        ddmRelModelCategoryService.saveOrUpdate(ddmRelModelCategory);
    }

    @GetMapping("/queryModelByModelCategoryId")
    @Operation(summary = "模型元数据查询-获取模型下拉列表")
    public List<DdmCollectElementConditionForModel> queryModelByModelCategoryId(@RequestParam Long modelCategoryId) {
        return ddmCollectElementService.queryModelByModelCategoryId(modelCategoryId);
    }

    @GetMapping("/queryModelByModelId")
    @Operation(summary = "模型元数据查询-获取表下拉列表")
    public List<DdmCollectElementConditionForTable> queryModelByModelId(@RequestParam Long ddmModelId) {
        return ddmCollectElementService.queryModelByModelId(ddmModelId);
    }

    @PostMapping("/queryDdmModelCollectElementPage")
    @Operation(summary = "模型元数据查询")
    public PageResult<DdmModelCollectElementDto> queryDdmModelCollectElementPage(@RequestBody DdmCollectElementQueryParamDto paramDto) {
        return ddmCollectElementService.queryDdmModelCollectElementPage(paramDto);
    }

    //删除数据用于测试用
    @GetMapping("/deleteall")
    public void deleteall() {
        ddmCollectElementService.deleteAll();
    }

}
