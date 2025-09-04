package com.datablau.data.quality.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.util.ShareKit;
import com.datablau.data.quality.api.DataQualityRuleProcessService;
import com.datablau.data.quality.jpa.entity.DataQualityBusinessRule;
import com.datablau.data.quality.jpa.entity.DataQualityTechRule;
import com.datablau.data.quality.metadata.service.DataQualityDao;
import com.datablau.data.quality.utility.ServerConstants;
import com.datablau.data.quality.workflow.dto.BusinessRuleProcessInfoDto;
import com.datablau.data.quality.workflow.dto.TechRuleProcessInfoDto;
import com.datablau.data.quality.workflow.dto.WorkflowApplyDto;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/8/30 16:50
 */
@RestController
@RequestMapping("/workflow")
@Tag(name = "数据质量涉及审批流的 REST API")
public class WorkflowController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(WorkflowController.class);

    @Autowired
    private DataQualityRuleProcessService dataQualityRuleProcessService;

    @Autowired
    private MessageService msgService;

    @Autowired
    private DataQualityDao dataQualityDao;

    public WorkflowController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping("/techRules/submitApply")
    public void applyTechRulesPublish(@RequestBody WorkflowApplyDto applyDto) throws Exception {
        List<String> errors = new ArrayList<>();
        try {
            dataQualityRuleProcessService.submitTechRuleApplication(applyDto.getRuleIds(),
                applyDto.getApplyReason(), applyDto.getApplyFile());
        } catch (Exception ex) {
            Throwable rootCause = ShareKit.getRootCause(ex);
            List<DataQualityTechRule> techRulesById = dataQualityDao.getTechRulesById(applyDto.getRuleIds());
            List<String> ruleNames = techRulesById.stream().map(DataQualityTechRule::getName).toList();
            LOGGER.error("failed to submit application for rule " + applyDto.getRuleIds(),
                rootCause);
            errors.add(msgService.getMessage("submitTechRuleAuditFailed", ruleNames, rootCause.getMessage()));
        }

        if (!errors.isEmpty()) {
            throw new UnexpectedStateException(StringUtils.join(errors, "\n"));
        }
    }

    @PostMapping("/techRules/copySubmitApply")
    @Transactional
    public void copyAndApplyTechRulesPublish(@RequestBody WorkflowApplyDto applyDto) throws Exception {
        List<String> errors = new ArrayList<>();
        try {
            dataQualityDao.deleteTechRuleCopy(applyDto.getRuleIds(), false);
            dataQualityDao.createTechRuleCopies(applyDto.getRuleIds(), applyDto.getProcessState());
            dataQualityRuleProcessService.submitTechRuleApplication(applyDto.getRuleIds(),
                    applyDto.getApplyReason(), applyDto.getApplyFile());
        } catch (Exception ex) {
            Throwable rootCause = ShareKit.getRootCause(ex);
            LOGGER.error("failed to submit application for rule " + applyDto.getRuleIds(),
                    rootCause);
            List<DataQualityTechRule> techRulesById = dataQualityDao.getTechRulesById(applyDto.getRuleIds());
            List<String> ruleNames = techRulesById.stream().map(DataQualityTechRule::getName).toList();
            errors.add(msgService.getMessage("submitTechRuleAuditFailed", ruleNames, rootCause.getMessage()));
        }

        if (!errors.isEmpty()) {
            throw new UnexpectedStateException(StringUtils.join(errors, "\n"));
        }
    }

    @PostMapping("/businessRules/submitApply")
    public void applyBusinessRulesPublish(@RequestBody WorkflowApplyDto applyDto) throws Exception {
        List<String> errors = new ArrayList<>();
        try {
            dataQualityRuleProcessService.submitBusinessRuleApplication(applyDto.getRuleIds(),
                applyDto.getApplyReason(), applyDto.getApplyFile());
        } catch (Exception ex) {
            Throwable rootCause = ShareKit.getRootCause(ex);
            LOGGER.error("failed to submit application for rule " + applyDto.getRuleIds(),
                rootCause);
            List<DataQualityBusinessRule> businessRulesById = dataQualityDao.getBusinessRulesById(applyDto.getRuleIds());
            List<String> ruleNames = businessRulesById.stream().map(DataQualityBusinessRule::getName).toList();
            errors.add(msgService.getMessage("submitBusRuleAuditFailed", ruleNames, rootCause.getMessage()));
        }

        if (!errors.isEmpty()) {
            throw new UnexpectedStateException(StringUtils.join(errors, "\n"));
        }
    }

    /**
     * 复制并提交技术规则流程
     * @param applyDto
     * @throws Exception
     */
    @PostMapping("/businessRules/copySubmitApply")
    @Transactional
    public void copyAndApplyBusinessRulesPublish(@RequestBody WorkflowApplyDto applyDto) throws Exception {
        List<String> errors = new ArrayList<>();
        try {
            // 需要删除之前的副本
            dataQualityDao.deleteBusinessRuleCopy(applyDto.getRuleIds());
            dataQualityDao.createBusinessRuleCopies(applyDto.getRuleIds(), applyDto.getProcessState());
            dataQualityRuleProcessService.submitBusinessRuleApplication(applyDto.getRuleIds(),
                applyDto.getApplyReason(), applyDto.getApplyFile());
        } catch (Exception ex) {
            Throwable rootCause = ShareKit.getRootCause(ex);
            LOGGER.error("failed to submit application for rule " + applyDto.getRuleIds(),
                rootCause);
            List<DataQualityBusinessRule> businessRulesById = dataQualityDao.getBusinessRulesById(applyDto.getRuleIds());
            List<String> ruleNames = businessRulesById.stream().map(DataQualityBusinessRule::getName).toList();
            errors.add(msgService.getMessage("submitBusRuleAuditFailed", ruleNames, rootCause.getMessage()));
        }

        if (!errors.isEmpty()) {
            throw new UnexpectedStateException(StringUtils.join(errors, "\n"));
        }
    }

    @PostMapping(value = "/techRules/getProcessDetail")
    public List<TechRuleProcessInfoDto> getTechRuleDetail(
        @Parameter(name = "processInstanceId", description = "流程实例", required = true)
        @RequestParam("processInstanceId") String processInstanceId) throws Exception {

        return dataQualityRuleProcessService.getProcessTechRuleDetail(processInstanceId);
    }

    @PostMapping(value = "/businessRules/getProcessDetail")
    public List<BusinessRuleProcessInfoDto> getBusinessBusinessRuleDetail(
        @Parameter(name = "processInstanceId", description = "流程实例", required = true)
        @RequestParam("processInstanceId") String processInstanceId) throws Exception {

        return dataQualityRuleProcessService.getProcessBusinessRuleDetail(processInstanceId);
    }
}
