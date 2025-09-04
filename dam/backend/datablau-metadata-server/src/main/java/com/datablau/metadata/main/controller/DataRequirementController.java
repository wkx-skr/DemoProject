package com.datablau.metadata.main.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.util.ShareKit;
import com.datablau.metadata.main.entity.DataRequirement;
import com.datablau.metadata.main.service.requirement.api.DataRequirementService;
import com.datablau.metadata.main.util.DataUtility;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.util.List;


/**
 * @author senyan
 */
@RestController
@RequestMapping("/dataRequirement")
//@Feature(LicenseInfo.FE_MEASURE)
@Tag(name = "数据需求API ")
public class DataRequirementController extends LocalBaseController {

    private static final Logger log = LoggerFactory.getLogger(DataRequirementController.class);

    @Autowired
    private DataRequirementService dataRequirementService;
    @Autowired
    private MessageService msgService;

    public DataRequirementController(@Autowired RoleService roleService) {
        super(roleService);
    }

    @Operation(summary = "获取数据需求")
    @GetMapping(value = "/")
    public List<DataRequirement> loadDataRequirements() throws Exception {
        return dataRequirementService.loadDataRequirements();
    }

    @Operation(summary = "创建数据需求")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "dam_data_requirement",
//            systemModule = OperationModuleType.METADATA_DATA_REQUIREMENT,
//            description = "创建数据需求,新增数据需求编码为: {param}",
//            descriptionParamClass = DataRequirement.class,
//            descriptionParamMethod = "getCode"
//    )
    @PostMapping(value = "/")
    public void createDataRequirement(@RequestBody DataRequirement dr) throws Exception {
        if(dr.getId() != null){
            throw new InvalidArgumentException(msgService.getMessage("idMustBeEmpty"));
        }

        dataRequirementService.addDataRequirement(dr);
    }

    @Operation(summary = "修改数据需求")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_data_requirement",
//            systemModule = OperationModuleType.METADATA_DATA_REQUIREMENT,
//            description = "修改数据需求,修改数据需求为: {param}",
//            descriptionParamClass = DataRequirement.class,
//            descriptionParamMethod = "toString"
//    )
    @PostMapping(value = "/update")
    public boolean updateDataRequirement(@RequestBody DataRequirement dr) throws Exception {
        if (!dataRequirementService.updateDataRequirement(dr)) {
            throw new ItemNotFoundException(msgService.getMessage("cannotFindItemToUpdate"));
        }

        return true;
    }

    @Operation(summary = "删除数据需求")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "dam_data_requirement",
//            systemModule = OperationModuleType.METADATA_DATA_REQUIREMENT,
//            description = "删除数据需求，id为: {param}",
//            descriptionParamClass = ArrayList.class,
//            descriptionParamMethod = "toString"
//    )
    @PostMapping(value = "/delete")
    public void deleteDataRequirement(@RequestBody List<Long> ids) throws Exception {
        dataRequirementService.removeDataRequirements(ids);
    }

    @Operation(summary = "导入需求模板")
//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_data_requirement",
//            systemModule = OperationModuleType.METADATA_DATA_REQUIREMENT,
//            description = "导入需求模板"
//    )
    @PostMapping(value = "/file")
    public Integer uploadDataRequirementsExcel(@RequestParam("file") MultipartFile multipartFile)
            throws Exception {
        File uploadedFile = DataUtility.uploadFile(multipartFile);
        try {
            return dataRequirementService.loadDataRequirementsFromFile(uploadedFile);
        }
        finally {
            uploadedFile.delete();
        }
    }

    @Operation(summary = "导出需求模板")
//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_data_requirement",
//            systemModule = OperationModuleType.METADATA_DATA_REQUIREMENT,
//            description = "导出需求模板"
//    )
    @RequestMapping("/file")
    public void downloadTemplateFile(HttpServletResponse response) {
        //File file = mappingService.createSimpleTemplateFile();
        File file = new File(ShareKit.getResourcePath("/datarequirement/data_requirement_template.xlsx"));
        exportFile(file, response, "数据需求模板");
    }
}
