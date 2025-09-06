package com.datablau.model.server.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.ModelCheckRuleService;
import com.datablau.model.data.api.semantic.RuleChecker;
import com.datablau.model.data.dto.ModelCheckRuleSearchCriteriaDto;
import com.datablau.model.data.dto.ModelRuleSettingDto;
import com.datablau.model.data.dto.ModelStandardExtend;
import com.datablau.model.data.jpa.entity.ModelCheckRuleGroup;
import com.datablau.model.data.jpa.entity.ModelCheckRuleGroupBind;
import com.datablau.model.data.jpa.entity.ModelCheckRuleRelease;
import com.datablau.model.data.jpa.entity.ModelDefaultRuleSetting;
import com.datablau.model.data.jpa.entity.ModelStandard;
import com.datablau.model.data.rule.dto.DbTypeTree;
import com.datablau.model.data.rule.dto.ModelCheckRuleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
/**
 * @author Nicky - 数语科技有限公司
 * date 2020/3/20 10:30
 */
@RestController("modelRuleController")
@ConditionalOnMissingBean(name = "modelRuleControllerExt")
@RequestMapping("/rules")
@Tag(name = "模型检验规则相关REST API", description = "模型检验规则相关REST API")
public class ModelRuleController extends BaseController {

    @Autowired
    protected RuleChecker ruleChecker;

    @Autowired
    protected ModelCheckRuleService modelCheckRuleService;

    @RequestMapping("/")
    @Operation(summary = "获取所有的模型检查标准", description = "获取所有的模型检查标准")
    public List<ModelStandard> getAllStandards() {
        return ruleChecker.getOrderedModelStandards();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "创建一个新的模型检查文件", description = "创建一个新的模型检查文件，模型检查文件不能更新，只能添加和删除")
    public ModelStandard createModelStandard(@Parameter(description = "模型检查对象", required = true) @RequestBody ModelStandard modelStandard) {
        return ruleChecker.createNewModelStandard(modelStandard);
    }

    @RequestMapping(value = "/{modelStandardId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除一个指定的模型检查标准", description = "删除一个指定的模型检查标准")
    @Parameters({@Parameter(name = "modelStandardId", description = "模型标准ID", in = ParameterIn.PATH, required = true)})
    public void deleteModelStandard(@PathVariable("modelStandardId") Long modelStandardId) {
        ruleChecker.deleteModelStandard(modelStandardId);
    }

    @RequestMapping(value = "/test", method = RequestMethod.POST)
    @Operation(summary = "测试一个脚本", description = "测试一个脚本，request body应该是完整的脚本")
    public void testScript(@Parameter(description = "模型检查脚本", required = true) @RequestBody String script) {
        ruleChecker.testModelStandardScript(script);
    }

    @RequestMapping(value = "/current", method = RequestMethod.GET)
    @Operation(summary = "获取当前最新的模型检查文件", description = "获取当前最新的模型检查文件")
    public ModelStandardExtend getCurrentModelStandard() {
        return ruleChecker.getCurrentModelStandard();
    }


    @RequestMapping(value = "/entries/search", method = RequestMethod.POST)
    @Operation(summary = "查询手动添加的rule", description = "查询手动添加的rule")
    public Page<ModelCheckRuleDto> getPages(@Parameter(description = "模型规则查询对象", required = true) @RequestBody ModelCheckRuleSearchCriteriaDto searchCriteriaDto) {
        return modelCheckRuleService.getPage(searchCriteriaDto);
    }

    @RequestMapping(value = "/entries", method = RequestMethod.POST)
    @Operation(summary = "保存或者更新单条规则", description = "保存或者更新单条规则")
    public ModelCheckRuleDto saveOrUpdate(@Parameter(description = "模型规则对象", required = true) @RequestBody ModelCheckRuleDto modelCheckRuleDto) {
        return modelCheckRuleService.saveOrUpdateModelCheckRule(modelCheckRuleDto);
    }

    @RequestMapping(value = "/entries/{ruleId}")
    @Operation(summary = "根据ID查询单规则", description = "根据ID查询单规则")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH, required = true)})
    public ModelCheckRuleDto getModelCheckRuleById(@PathVariable("ruleId") Long ruleId) {
        return modelCheckRuleService.getRuleByRuleId(ruleId);
    }

    @RequestMapping(value = "/publish/model", method = RequestMethod.POST)
    @Operation(summary = "发布模型规则校验", description = "发布模型规则校验")
    public void publishModeCheckRule(@RequestBody ModelCheckRuleRelease modelCheckRuleRelease) {
        modelCheckRuleService.publishModeCheckRule(modelCheckRuleRelease);
    }

    @RequestMapping(value = "/entries/verify/{modelId}", method = RequestMethod.POST)
    @Operation(summary = "测试规则是否可用", description = "测试规则是否可用")
    @Parameters({@Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public String testifyRules(@Parameter(description = "模型规则对象", required = true) @RequestBody ModelCheckRuleDto modelCheckRuleDto, @PathVariable("modelId") Long modelId) {
        return modelCheckRuleService.testifyRules(modelCheckRuleDto, modelId);
    }

    @RequestMapping(value = "/entries/version/")
    @Operation(summary = "获取当前版本", description = "获取当前版本")
    // @Parameters({@Parameter(name = "ruleId", description ="规则id",   in  = "//", required = false)})
    public ModelCheckRuleRelease getCurVersion() {
        return modelCheckRuleService.getCurrentVersion();
    }

    @RequestMapping(value = "/dbTypes")
    @Operation(summary = "获取数据源枚举值列表", description = "获取数据源枚举值列表")
    public DbTypeTree getDataBaseTypes() {
        return modelCheckRuleService.getDataSourceTypeTree();
    }

    @GetMapping(value = "/default/setting")
    @Operation(summary = "获取当前规则的设置", description = "获取当前规则的设置")
    public List<ModelRuleSettingDto> getDefaultRuleSetting() {
        return modelCheckRuleService.getDefaultRuleSetting(false);
    }

    @PostMapping(value = "/default/setting")
    @Operation(summary = "设置当前规则的设置", description = "设置当前规则的设置")
    public Boolean setDefaultRuleSetting(@RequestBody List<ModelDefaultRuleSetting> settings) {
        return modelCheckRuleService.setDefaultRuleSetting(settings);
    }

    @PostMapping(value = "/group")
    @Operation(summary = "创建模型检查策略组")
    public ModelCheckRuleGroup createRuleGroup(@Parameter(description = "模型检查策略组", required = true) @RequestBody ModelCheckRuleGroup modelCheckRuleGroup) {
        return modelCheckRuleService.createRuleGroup(modelCheckRuleGroup);
    }

    @PutMapping(value = "/group")
    @Operation(summary = "更新模型检查策略组")
    public ModelCheckRuleGroup updateRuleGroup(@Parameter(description = "模型检查策略组", required = true) @RequestBody ModelCheckRuleGroup modelCheckRuleGroup) {
        return modelCheckRuleService.updateRuleGroup(modelCheckRuleGroup);
    }

    @GetMapping(value = "/group/{id}")
    @Operation(summary = "根据ID查询模型检查策略组")
    public ModelCheckRuleGroup findRuleGroup(@Parameter(description = "策略组ID", required = true) @PathVariable Long id) {
        return modelCheckRuleService.findRuleGroup(id);
    }

    @GetMapping("/groups")
    @Operation(summary = "查询所有模型检查策略组")
    public List<ModelCheckRuleGroup> findRuleGroups() {
        return modelCheckRuleService.findRuleGroups();
    }

    @PostMapping("/groups")
    @Operation(summary = "根据关键词查询模型检查策略组")
    public Page<ModelCheckRuleGroup> findRuleGroups(@Parameter(description = "关键词") @RequestParam(required = false) String keyword,
                                                    @Parameter(description = "当前页，默认值是1") @RequestParam(required = false, defaultValue = "1") Integer currentPage,
                                                    @Parameter(description = "页面大小") @RequestParam(required = false, defaultValue = "999999") Integer pageSize,
                                                    @Parameter(description = "是否只set其下规则编号和ID，否则set规则详情") @RequestParam(required = false, defaultValue = "true") boolean onlyRuleId) {
        return modelCheckRuleService.findRuleGroups(keyword, PageRequest.of(currentPage - 1, pageSize), onlyRuleId);
    }

    @DeleteMapping(value = "/group/{id}")
    @Operation(summary = "删除模型检查策略组")
    public void deleteRuleGroup(@Parameter(description = "策略组ID", required = true) @PathVariable Long id) {
        modelCheckRuleService.deleteRuleGroup(id);
    }

    @PostMapping(value = "/group/model/{modelId}")
    @Operation(summary = "给模型绑定策略组")
    public List<ModelCheckRuleGroupBind> bindRuleGroupForCategory(@Parameter(description = "目录ID", required = true) @PathVariable Long modelId,
                                                                  @RequestBody List<Long> ruleGroupIds) {
        return modelCheckRuleService.bindRuleGroupForModel(modelId, ruleGroupIds);
    }

    @GetMapping(value = "/group/model/{modelId}")
    @Operation(summary = "查询模型绑定的策略组")
    public List<ModelCheckRuleGroup> getCategoryBindRuleGroup(@Parameter(description = "模型ID", required = true) @PathVariable Long modelId) {
        return modelCheckRuleService.getModelBindRuleGroup(modelId);
    }

}
