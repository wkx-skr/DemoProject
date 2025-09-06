package com.datablau.model.server.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.EntityTemplateService;
import com.datablau.model.data.dto.EntityTemplatePropertyDto;
import com.datablau.model.data.jpa.entity.EntityTemplate;
import com.datablau.model.server.dto.StatLicenseDaysDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.Collection;
import java.util.List;


/**
 * @Author fengpiao - 北京数语科技有限公司
 * @Date 2022/4/6 11:17
 */
@RestController("entityTemplateController")
@ConditionalOnMissingBean(name = "entityTemplateControllerExt")
@RequestMapping("/entitytemplate")
@Tag(name = "实体模板相关REST API", description = "实体模板相关REST API")
public class EntityTemplateController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(EntityTemplateController.class);

    @Autowired
    protected EntityTemplateService entityTemplateService;

    @Operation(summary = "创建实体模板")
    @PostMapping("/save")
    public List<EntityTemplate> saveEntityTemplates(@RequestBody Collection<EntityTemplate> templates) {
        return entityTemplateService.saveEntityTemplates(templates);
    }

    /**
     * Update entity templates
     * @param templates
     */
    @Operation(summary = "更新实体模板")
    @PostMapping("/update")
    public List<EntityTemplate> updateEntityTemplates(@RequestBody Collection<EntityTemplate> templates) {
        return entityTemplateService.updateEntityTemplates(templates);
    }

    /**
     * Load all entity templates
     * @return
     */
    @Operation(summary = "查询全部的实体模板")
    @GetMapping("/")
    public List<EntityTemplate> getEntityTemplates() {
        return entityTemplateService.getEntityTemplates();
    }

    /**
     * delete entity templates
     * @return
     */
    @Operation(summary = "删除实体模板")
    @PostMapping("/delete")
    public void deleteEntityTemplates(@RequestBody Collection<EntityTemplate> templates) {
        entityTemplateService.deleteEntityTemplates(templates);
    }

    /**
     * publish entity templates
     * @return
     */
    @Operation(summary = "发布实体模板")
    @PostMapping("/publish")
    public void publishEntityTemplates(@RequestBody Collection<EntityTemplate> templates) {
        entityTemplateService.publishEntityTemplates(templates);
    }

    @Operation(summary = "获取发布实体模板")
    @GetMapping("/publish")
    public List<EntityTemplate> getPublishEntityTemplates() {
        return entityTemplateService.getPublishEntityTemplates(true);
    }

    /**
     * 禁用实体模板
     * @param templates
     */
    @Operation(summary = "禁用实体模板")
    @PostMapping("/hide")
    public void hideEntityTemplates(@RequestBody Collection<EntityTemplate> templates) {
        entityTemplateService.hideEntityTemplates(templates);
    }


    /**
     * check EntityTemplate is unique。
     * @param entityTemplate
     * @return
     */

    @Operation(summary = "检查实体模板名称")
    @PostMapping("/check")
    public String checkEntityTemplate(@RequestBody Collection<EntityTemplate> entityTemplate) {
        return entityTemplateService.checkEntityTemplate(entityTemplate);
    }

    @Operation(summary = "实体模板下拉属性列表")
    @GetMapping("/property/list")
    public List<EntityTemplatePropertyDto> getPropertyList() {
        return entityTemplateService.getPropertyList();
    }


    @Operation(summary = "实体模板属性替换")
    @GetMapping("/property")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "tableId", description = "表ID", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "entityTemplateId", description = "实体模版ID", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "separator", description = "分隔符", required = true, in = ParameterIn.QUERY),
    })
    public EntityTemplatePropertyDto getPropertyReplace(
            @RequestParam(value = "modelId", required = true) Long modelId,
            @RequestParam(value = "tableId", required = true) Long tableId,
            @RequestParam(value = "entityTemplateId", required = true) Long entityTemplateId,
            @RequestParam(value = "separator", required = true) String separator
    ) throws Exception {
        return entityTemplateService.getPropertyReplace(modelId, tableId, entityTemplateId, separator);
    }

}
