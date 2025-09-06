package com.datablau.model.server.controller;

import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.CategoryService;
import com.datablau.model.data.api.ModelQualityReportService;
import com.datablau.model.data.api.ModelService;
import com.datablau.model.data.dto.ModelQualityReportData;
import com.datablau.model.data.dto.ModelQualityReportDto;
import com.datablau.model.data.dto.ModelQualityReportResultBaseDto;
import com.datablau.model.data.dto.ModelQualityReportReviewResultDto;
import com.datablau.model.data.dto.SimpleModelQualityReport;
import com.datablau.model.data.jpa.entity.Category;
import com.datablau.model.data.jpa.entity.Model;
import com.datablau.model.data.jpa.entity.ModelQualityReport;
import com.datablau.model.data.jpa.entity.ModelVersion;
import com.datablau.model.data.jpa.repository.ModelVersionRepository;
import com.datablau.model.local.utility.Configurations;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.workflow.common.api.DatablauRemoteWorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @Author Senyan - 北京数语科技有限公司
 * @Date 2020/2/28
 */

@RestController("modelQualityReportController")
@ConditionalOnMissingBean(name = "modelQualityReportControllerExt")
@RequestMapping("/modelQR")
@Tag(name = "模型报告使用的REST API", description = "模型报告使用的REST API")
public class ModelQualityReportController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(ModelQualityReportController.class);

    @Autowired
    protected ModelQualityReportService mqrService;
    protected DatablauRemoteWorkflowService workflowService;
    @Autowired
    protected ModelService modelService;
    @Autowired
    protected ModelVersionRepository modelVersionDao;
    @Autowired
    protected CategoryService categoryService;
    @Qualifier("organizationService")
    @Autowired
    protected OrganizationService organizationService;
    @Autowired
    @Qualifier("modelCategoryService")
    protected ModelCategoryService modelCategoryService;

    @RequestMapping(value = "/model/{modelId}/qualityReport", method = RequestMethod.GET)
    @Operation(summary = "获取一个模型的所有报告", description = "获取一个模型的所有报告")
    @Parameters({@Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public List<SimpleModelQualityReport> getDdmModelQualityReports(@PathVariable("modelId") Long modelId) {
        return mqrService.getDdmModelQualityReport(modelId);
    }

    @RequestMapping(value = "/model/qualityReports", method = RequestMethod.GET)
    @Operation(summary = "获取当前用户创建的所有报告", description = "获取当前用户创建的所有报告")
    public Page<SimpleModelQualityReport> getDdmModelQualityReportsCreatedByCurrentUser(
            @Parameter(name = "当前页，默认值是0") @RequestParam(name = "currentPage", required = false, defaultValue = "1") Integer currentPage,
            @Parameter(name = "页面大小") @RequestParam(name = "pageSize", required = false, defaultValue = "9999") Integer pageSize) {
        return mqrService.getDdmModelQualityReportByCreator(AuthTools.currentUsernameFailFast(), PageRequest.of(currentPage - 1, pageSize));
    }

    @RequestMapping(value = "/model/qualityReport/{qrId}", method = RequestMethod.GET)
    @Operation(summary = "获取一个报告的基本信息", description = "获取一个报告的基本信息")
    @Parameters({@Parameter(name = "qrId", description = "报告ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "entire", description = "是否获取详细信息", in = ParameterIn.QUERY)})
    public ModelQualityReportData getDdmModelQualityReportDetail(@PathVariable("qrId") Long qrId, @RequestParam(name = "entire", defaultValue = "false") Boolean entire) {
        ModelQualityReportData report = mqrService.getDdmModelQualityReportDetail(qrId, entire);
        if (report == null) {
            return null;
        }

        ModelQualityReportDto reportDto = new ModelQualityReportDto(report);
        try {
            // 模型基本信息
            Model model = modelService.getModelByIdWithoutPermissionCheck(report.getModelId());
            reportDto.setModel(model);
            // 模型路径信息
            modelService.getModelPath(model.getCategoryId(), reportDto.getCategories(), "");
            // 模型版本信息
            if (entire) {
                List<ModelVersion> versions = modelVersionDao.getModelVersionByModelIdAndVersionIds(report.getModelId(),
                        report.getModelVersionIds());
                Map<Long, String> versionMap = versions.stream()
                        .collect(Collectors.toMap(ModelVersion::getId, ModelVersion::getName));
                reportDto.setVersion(versionMap);
            }
            // 绑定的DAM应用系统和部门
            Category category = categoryService.getCategory(model.getCategoryId());
            Long damCategoryId = category.getDamModelCategoryId();
            if (damCategoryId != null && Configurations.INSTANCE.isDamConnectable()) {
                ModelCategoryDto damSystem = modelCategoryService.getModelCategory(damCategoryId);
                if (damSystem != null) {
                    // 应用系统
                    reportDto.setDamSystem(damSystem.getCategoryName());
                    // IT部门
                    OrganizationDto itDepartment = organizationService.getOrganizationsByBm(damSystem.getItDepartment());
                    if (itDepartment != null) {
                        reportDto.setItDepartment(itDepartment.getFullName());
                    }
                    // 业务部门
                    String businessDepartmentCode = damSystem.getBusinessDepartment();
                    OrganizationDto businessDepartment = organizationService.getOrganizationsByBm(businessDepartmentCode);
                    if (businessDepartment != null) {
                        reportDto.setBusinessDepartment(businessDepartment.getFullName());
                    }
                }
            }
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        return reportDto;
    }

    @RequestMapping(value = "/model/qualityReport/{qrId}/content", method = RequestMethod.GET, produces = {"application/json; charset=utf-8"})
    @Operation(summary = "获取一个报告的详细报告内容", description = "获取一个报告的详细报告内容")
    @Parameters({@Parameter(name = "qrId", description = "报告ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "type", description = "报告内容类型", in = ParameterIn.QUERY, required = true)})
    public ModelQualityReportResultBaseDto getDdmModelQualityReportDetail(@PathVariable("qrId") Long qrId,
                                                                          @RequestParam("type") ModelQualityReport.ModelQualityReportType type) {
        return mqrService.getDdmModelQualityReportDetailByIdAndReportType(qrId, type);
    }

    @RequestMapping(value = "/model/qualityReport/{qrId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除报告", description = "删除报告")
    @Parameters({@Parameter(name = "qrId", description = "报告ID", in = ParameterIn.PATH, required = true)})
    public void removeDdmModelQualityReportDetail(@PathVariable("qrId") Long qrId) {
        deleteWorkflowProcessInstance(qrId);

        mqrService.removeDdmModelQualityReportDetail(qrId);
    }

//    @RequestMapping(value = "/model/qualityReport/{qrId}", method = RequestMethod.POST)
//    public void updateDdmModelQualityReportDetail(@Description("报告ID") @PathVariable("qrId")Long qrId, @RequestBody ModelQualityReport report) {
//        dataModelService.updateDdmModelQualityReportDetail(qrId, report);
//    }

    @RequestMapping(value = "/model/qualityReport/{qrId}", method = RequestMethod.PUT)
    @Operation(summary = "重新创建报告的内容", description = "重新创建报告的内容")
    @Parameters({@Parameter(name = "qrId", description = "报告ID", in = ParameterIn.PATH, required = true)})
    public void recreateDdmModelQualityReportDetail(@PathVariable("qrId") Long qrId) {
        deleteWorkflowProcessInstance(qrId);

        mqrService.recreateDdmModelQualityReportDetail(qrId);
    }

    protected void deleteWorkflowProcessInstance(Long qrId) {
        ModelQualityReportData report = mqrService.getDdmModelQualityReportDetail(qrId, false);
        if (StringUtils.isEmpty(report.getProcessInstanceId())) {
            return;
        }

        try {
            workflowService.deleteProcessInstance(report.getProcessInstanceId());
        } catch (Exception e) {
            logger.error("delete process instance failed");
        }
    }

    @RequestMapping(value = "/model/qualityReport", method = RequestMethod.POST)
    @Operation(summary = "创建报告,incrementalScript为可选", description = "创建报告,incrementalScript为可选")
    public void createDdmModelQualityReport(@Parameter(description = "模型报告对象", required = true) @RequestBody ModelQualityReportData report) {
        mqrService.createDdmModelQualityReport(report);
    }

    @RequestMapping(value = "/model/qualityReport/{qrId}/compare/script", method = RequestMethod.POST)
    @Operation(summary = "更新报告的附属脚本并开始比较脚本和版本更改的内容", description = "更新报告的附属脚本并开始比较脚本和版本更改的内容")
    @Parameters({@Parameter(name = "qrId", description = "报告ID", in = ParameterIn.PATH, required = true)})
    public void compareDdmModelQualityReportWithScript(@PathVariable("qrId") Long qrId, @Parameter(description = "附属脚本", required = true) @RequestBody String script) throws Exception {
        mqrService.compareDdmModelQualityIncrementalReportWithScript(qrId, script);
    }

    @RequestMapping(value = "/model/qualityReport/{qrId}/process", method = RequestMethod.GET)
    @Operation(summary = "更新报告的审批流程", description = "更新报告的审批流程")
    @Parameters({@Parameter(name = "qrId", description = "报告ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "processInstanceId", description = "工作流进程id", in = ParameterIn.QUERY, required = true)})
    public void updateDdmModelQualityReportWithProcessInstanceId(@PathVariable("qrId") Long qrId,
                                                                 @RequestParam String processInstanceId) throws Exception {
        mqrService.updateDdmModelQualityReportWithProcessInstanceId(qrId, processInstanceId);
    }

    /*
    @Description("显示命名推荐等信息")
        @RequestMapping(value = "/model/quaulityReport/{qrId}/recommend", method = RequestMethod.POST)
    public List<ModelColumnDomainApplyStatusDto> getDdmModelQualityReportWithRecommend(@Description("报告ID")   @PathVariable("qrId")Long qrId,
                                                                                       @Description("模型ID")   @RequestParam Long modelId,
                                                                                       @Description("版本ID")   @RequestParam Long versionId,
                                                                                       @Description("字段集合")  @RequestBody Set<Long> columnIds) throws Exception {
         return mqrService.getDdmModelQualityReportRecommendInfo(qrId, modelId, versionId, columnIds);
    }
    */

    @RequestMapping(value = "/model/qualityReport/{qrId}/reviewresult", method = RequestMethod.GET)
    @Operation(summary = "获取评审详情", description = "获取评审详情")
    @Parameters({@Parameter(name = "qrId", description = "报告ID", in = ParameterIn.PATH, required = true)})
    public ModelQualityReportReviewResultDto getDdmModelQualityReportOfReviewResult(@PathVariable("qrId") Long qrId) {
        return mqrService.getDdmModelQualityReportReviewResult(qrId);
    }

    @RequestMapping(value = "/model/qualityReport/{qrId}/reviewresult/update", method = RequestMethod.POST)
    @Operation(summary = "更新评审详情", description = "更新评审详情")
    @Parameters({@Parameter(name = "qrId", description = "报告ID", in = ParameterIn.PATH, required = true)})
    public void updateDdmModelQualityReportOfReviewResult(@PathVariable("qrId") Long qrId,
                                                          @Parameter(description = "评审结构", required = true) @RequestBody ModelQualityReportReviewResultDto reviewResult) {
        mqrService.updateDdmModelQualityReportOfReviewResult(qrId, reviewResult);
    }
}