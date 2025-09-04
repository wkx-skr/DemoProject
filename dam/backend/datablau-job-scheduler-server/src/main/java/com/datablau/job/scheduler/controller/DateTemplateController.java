package com.datablau.job.scheduler.controller;

import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.common.controller.BaseController;
import com.datablau.job.scheduler.dto.DateTemplateDto;
import com.datablau.job.scheduler.jpa.entity.DateTemplate;
import com.datablau.job.scheduler.service.DateTemplateService;
import com.datablau.job.scheduler.utils.DatablauUtility;
import com.datablau.project.util.UserRights;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/dateTemplate")
public class DateTemplateController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(DateTemplateController.class);

    @Autowired
    private DateTemplateService dateTemplateService;


//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "sch_date_template",
//            systemModule = OperationModuleType.SYSTEM_TIME_TEMPLATE,
//            description = "查询时间模版"
//    )
    @RequestMapping(value = "/list", method = RequestMethod.POST)
    @PreAuthorize(UserRights.HAS_BASE_TIME_TEMPLATES_MANAGE_ROLE)
    public List<DateTemplateDto> getDateTemplateList(
        @RequestParam(value = "keyword", required = false) String keyword) {
        return dateTemplateService.getDateTemplateList(keyword);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "sch_date_template",
//            systemModule = OperationModuleType.SYSTEM_TIME_TEMPLATE,
//            description = "新建时间模版: {param}",
//            descriptionParamClass = DateTemplate.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public void addDateTemplate(@RequestBody DateTemplate dateTemplate) {
        dateTemplateService.addDateTemplate(dateTemplate);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "sch_date_template",
//            systemModule = OperationModuleType.SYSTEM_TIME_TEMPLATE,
//            description = "删除时间模版，id为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public void deleteDateTemplate(@RequestParam("id") Long id) {
        dateTemplateService.deleteDateTemplate(id);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "sch_date_template",
//            systemModule = OperationModuleType.SYSTEM_TIME_TEMPLATE,
//            description = "编辑时间模版，新内容为: {param}",
//            descriptionParamClass = DateTemplate.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public void updateDateTemplate(@RequestBody DateTemplate dateTemplate) {
        dateTemplateService.updateDateTemplate(dateTemplate);
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "sch_date_template",
//            systemModule = OperationModuleType.SYSTEM_TIME_TEMPLATE,
//            description = "导出时间模版的文件模板"
//    )
    @RequestMapping(value = "/downloadTemplate", method = RequestMethod.POST)
    public void downloadTemplate(HttpServletResponse response) {
        File file = new File(DatablauUtility.getResourcePath("/templates/date_template.xlsx"));
        exportFile(file, response, GeneralUtility.getMessageService().getMessage("downloadFileNameTemplate"));
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "sch_date_template",
//            systemModule = OperationModuleType.SYSTEM_TIME_TEMPLATE,
//            description = "导出时间模版的数据"
//    )
    @RequestMapping(value = "/exportDates", method = RequestMethod.POST)
    public ResponseEntity<byte[]> exportDates(@RequestParam("id") Long id) throws Exception {
        return dateTemplateService.exportDates(id);
    }
}
