package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.data.PageResult;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.util.ShareKit;
import com.datablau.metadata.main.dto.GeneralSearchCriteriaDto;
import com.datablau.metadata.main.dto.business.BusinessFlowTreeNodeDto;
import com.datablau.metadata.main.dto.business.BusinessObjectBindDto;
import com.datablau.metadata.main.entity.business.BusinessFlow;
import com.datablau.metadata.main.entity.business.BusinessObject;
import com.datablau.metadata.main.entity.business.BusinessTable;
import com.datablau.metadata.main.entity.lineage.LineageBusinessBind;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.service.business.api.BusinessObjectService;
import com.datablau.metadata.main.service.lineage.api.LineageMappingService;
import com.datablau.metadata.main.util.DataUtility;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.security.management.api.RoleService;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.net.URLEncoder;
import java.util.Collection;
import java.util.List;

/**
 * @author Nicky - 数语科技有限公司
 * date 2019/7/5 14:30
 */
@RestController
@RequestMapping("/busiObjects")
@Description("业务活动相关的REST API")
public class BusinessObjectController extends BaseController {
    private static final Logger logger = LoggerFactory.getLogger(BusinessObjectController.class);

    @Autowired
    private BusinessObjectService objectService;

    @Autowired
    private LineageMappingService lineageMappingService;

    public BusinessObjectController(@Autowired RoleService roleService){
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @GetMapping("/flows")
    @Description("获取所有的业务流程")
    public List<BusinessFlow> getAllFlows() {
        return objectService.getAllFlows();
    }

    @GetMapping("/objects")
    @Description("获取所有的业务活动")
    public List<BusinessObject> getAllObjects() {
        return objectService.getAllObjects();
    }

    @RequestMapping(value = "/getall", method = RequestMethod.POST)
    @Description("获取所有的业务对象")
    public PageResult<BusinessTable> getAllBusinessTables(@RequestBody GeneralSearchCriteriaDto searchCriteriaDto) {
        return objectService.getAllBusinessTables(searchCriteriaDto);
    }

    @GetMapping("/tabs/target/{tableId}")
    @Description("获取所有和当前物理表绑定的业务对象")
    public List<BusinessTable> getAllBusinessTablesByBindedDamTable(@Description("物理表Id") @PathVariable("tableId")Long tableId) {
        return objectService.getAllBusinessTablesByBindedDamTableId(tableId);
    }

    @GetMapping("/flows/{flowId}/objects")
    @Description("获取一个业务流程下所有业务活动")
    public List<BusinessObject> getAllObjectsOfFlow(@Description("流程ID") @PathVariable("flowId") String flowId) {
        return objectService.getAllObjectsOfFlow(flowId);
    }

    @GetMapping("/flows/tree")
    @Description("获取业务流程树")
    //@PreAuthorize(UserRights.BUSINESS_PROCESS_VIEW)
    public BusinessFlowTreeNodeDto getBusinessTreeNode() {
        return objectService.getObjectTree();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "dam_busi_flow",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "新增业务流程名为:{param}",
//            descriptionParamClass = BusinessFlow.class,
//            descriptionParamMethod = "getFlowName"
//    )
    @PostMapping("/flows")
    @Description("创建业务流程")
    public BusinessFlow createFlow(@RequestBody BusinessFlow flow) {
        return objectService.createBusinessFlow(flow);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "dam_busi_obj",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "新增的业务活动为：{param}",
//            descriptionParamClass = BusinessObject.class,
//            descriptionParamMethod = "getBusiName"
//    )
    @PostMapping("/objects")
    @Description("创建业务活动")
    public BusinessObject createObject(@RequestBody BusinessObject object) {
        return objectService.createBusinessObject(object);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "dam_busi_tab",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "新增业务实体名为:{param}",
//            descriptionParamClass = BusinessTable.class,
//            descriptionParamMethod = "getBusinessTabName"
//    )
    @PostMapping("/tabs")
    @Description("创建业务对象")
    public BusinessTable createObject(@RequestBody BusinessTable tab) {
        return objectService.createBusinessTable(tab);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_busi_flow",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "修改业务流程,ID为:{param}",
//            descriptionParamClass = BusinessFlow.class,
//            descriptionParamMethod = "getFlowId"
//    )
    @PutMapping("/flows/{flowId}")
    @Description("修改业务流程")
    public BusinessFlow updateFlow(@Description("业务流程ID") @PathVariable("flowId") String flowId, @RequestBody BusinessFlow flow) {
        flow.setFlowId(flowId);
        return objectService.updateBusinessFlow(flow);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_busi_obj",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "修改的业务活动为：{param}",
//            descriptionParamClass = BusinessObject.class,
//            descriptionParamMethod = "getBusiName"
//    )
    @PutMapping("/objects/{objectId}")
    @Description("修改业务活动")
    public BusinessObject updateObject(@Description("业务活动ID") @PathVariable("objectId")String objectId, @RequestBody BusinessObject object) {
        object.setObjId(objectId);
        return objectService.updateBusinessObject(object);
    }
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_busi_tab",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "修改业务实体为:{param}",
//            descriptionParamClass = BusinessTable.class,
//            descriptionParamMethod = "getBusinessTabName"
//    )
    @PutMapping("/tabs/{tabId}")
    @Description("修改业务对象")
    public BusinessTable updateTable(@Description("业务对象ID") @PathVariable("tabId")String tabId, @RequestBody BusinessTable tab) {
        tab.setBusinessTabId(tabId);
        return objectService.updateBusinessTable(tab);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "dam_busi_obj",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "删除业务活动"
//    )
    @DeleteMapping("/objects")
    @Description("删除业务活动")
    public void deleteObjects(@Description("对象ID列表，用逗号分隔") @RequestParam("objectIds") String ids) {
        objectService.deleteBusinessObject(Lists.newArrayList(ids.split(",")));
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "dam_busi_flow",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "删除业务流程,ID为:{param}",
//            descriptionParamClass = String.class,
//            descriptionParamMethod = "toString"
//    )
    @DeleteMapping("/flows")
    @Description("删除业务流程")
    public void deleteFlows(@Description("流程ID列表，用逗号分隔") @RequestParam("flowIds") String ids) {
        objectService.deleteBusinessFlow(Lists.newArrayList(ids.split(",")));
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "dam_busi_tab",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "删除业务实体,ID为:{param}",
//            descriptionParamClass = String.class,
//            descriptionParamMethod = "toString"
//    )
    @DeleteMapping("/tabs")
    @Description("删除业务对象")
    public void deleteBusinessTables(@Description("对象ID列表，用逗号分隔") @RequestParam("tabIds") String ids) {
        objectService.deleteBusinessTable(Lists.newArrayList(ids.split(",")));
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_busi_flow",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "导入业务流程"
//    )
    @RequestMapping(method = RequestMethod.POST, value = "/upload")
    @Description("导入业务流程文件")
    public void uploadDomainExcel(@RequestParam("file") MultipartFile multipartFile)
        throws Exception {

        File uploadedFile = DataUtility.uploadFile(multipartFile);
        try {
            objectService.loadObjectsFromFile(uploadedFile);
        } finally {
            uploadedFile.delete();
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_busi_flow",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "导出业务流程模板"
//    )
    @RequestMapping(method = RequestMethod.GET, value = "/template")
    @Description("导出模板")
    public void exportBusinessTemplate(HttpServletResponse response) throws Exception {
        File file = new File(ShareKit.getResourcePath("/templates/business_obj.xlsx"));
        response.setContentType("application/octet-stream");

        String realName = "";

        try {
            realName = URLEncoder.encode("业务流程模板", "UTF-8");
            realName = realName.replace("+", "%20");
        } catch (Exception ex) {
            logger.warn("Failed to convert template file name");
        }

        response.setHeader("Content-disposition", "attachment; filename=" + realName + ".xlsx");
        response.setHeader("Content-Length", String.valueOf(file.length()));

        try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
            BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
            byte[] buff = new byte[2048];
            int bytesRead;
            while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                bos.write(buff, 0, bytesRead);
            }

        } catch (Exception ex) {
            throw new IllegalStateException();
        }
    }

    @RequestMapping(value = "/objects/{objectId}/ddm/usage", method = RequestMethod.GET, produces = {"application/json"})
    @Description("获取模型中业务活动的应用情况")
    public String getDomainUsageInDDM(@Description("当前页码") @RequestParam("currentPage")Integer currentPage,
        @Description("每页大小") @RequestParam("pageSize")Integer pageSize, @Description("业务活动ID") @PathVariable("objectId") String objectId) {
        return objectService.getBusinessObjUsageInDDM(objectId, currentPage, pageSize);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_busi_obj_to_busi_tab",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "绑定业务对象到业务活动"
//    )
    @RequestMapping(value = "/objects/{objectId}/bind/{tabId}", method = RequestMethod.POST)
    @Description("绑定业务对象到业务活动")
    public void bindBusinessTableToBusinessObject(@Description("业务活动的ID") @PathVariable("objectId")String businessObjId,
                                          @Description("业务对象的ID") @PathVariable("tabId")String businessTabId,
                                          @Description("绑定输入与否，true为绑定输入，false为绑定输出") @RequestParam("input") Boolean input) {
        objectService.bindBusinessTableToBusinessObject(businessTabId, businessObjId, input);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_busi_obj_to_busi_tab",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "解绑业务对象到业务活动"
//    )
    @RequestMapping(value = "/objects/{objectId}/unbind/{tabId}", method = RequestMethod.DELETE)
    @Description("解绑业务对象到业务活动")
    public void unbindBusinessObjectToTable(@Description("业务活动的ID") @PathVariable("objectId")String businessObjId,
                                            @Description("业务对象的ID") @PathVariable("tabId")String businessTabId,
                                            @Description("绑定输入与否，true为绑定输入，false为绑定输出") @RequestParam("input") Boolean input) {
        objectService.unbindBusinessTableToBusinessObject(businessTabId, businessObjId, input);
    }

//    @RequestMapping(value = "/objects/{objectId}/bind/{tableId}", method = RequestMethod.POST)
//    @Description("绑定物理表/视图到业务对象")
//    public void bindBusinessObjectToTable(@Description("业务活动的ID") @PathVariable("objectId")String businessObjId,
//        @Description("表或者视图的objectID") @PathVariable("tableId")Long tableId,
//        @Description("绑定输入与否，true为绑定输入，false为绑定输出") @RequestParam("input") Boolean input) {
//        objectService.bindObjectToBusinessObject(tableId, businessObjId, input);
//    }
//
//    @RequestMapping(value = "/objects/{objectId}/unbind/{tableId}", method = RequestMethod.DELETE)
//    @Description("解绑业务活动和物理表/视图")
//    public void unbindBusinessObjectToTable(@Description("业务活动的ID") @PathVariable("objectId")String businessObjId,
//        @Description("表或者视图的objectID") @PathVariable("tableId")Long tableId,
//        @Description("绑定输入与否，true为绑定输入，false为绑定输出") @RequestParam("input") Boolean input) {
//        objectService.unbindObjectToBusinessObject(tableId, businessObjId, input);
//    }

    @RequestMapping(value = "/objects/{objectId}/dam/bindings", method = RequestMethod.GET)
    @Description("获取业务活动绑定的业务对象")
    public Collection<BusinessObjectBindDto> getBusinessObjectBindings(@Description("业务活动的ID") @PathVariable("objectId")String businessObjectId) {
        return objectService.getBusinessObjBindings(businessObjectId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_lineage_bu_bind",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "绑定物理表到业务逻辑表"
//    )
    @RequestMapping(value = "/tables/bind", method = RequestMethod.POST)
    @Description("绑定物理表到业务逻辑表")
    public void bindPhysicalTableToBusinessTable(@RequestBody LineageBusinessBind bind) {
        lineageMappingService.createLineageBusinessBind(bind);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_lineage_bu_bind",
//            systemModule = OperationModuleType.METADATA_BUSINESS_FLOW,
//            description = "解绑物理表到业务逻辑表"
//    )
    @RequestMapping(value = "/tables/unbind", method = RequestMethod.POST)
    @Description("解绑物理表到业务逻辑表")
    public void unbindPhysicalTableToBusinessTable(@RequestBody LineageBusinessBind bind) {
        lineageMappingService.deleteLineageBusinessBind(bind);
    }

    @RequestMapping(value = "/table/{smId}/{stId}/bindings")
    @Description("获取当前业务逻辑表绑定的物理表")
    public List<DataObject> getAllLineageBusinessBindTablesBySource(@Description("业务逻辑表的模型ID") @PathVariable("smId")Long smId,
                                                                    @Description("业务逻辑表的表ID") @PathVariable("stId")Long stId){
        return lineageMappingService.getAllLineageBusinessBindTablesBySource(smId, stId);
    }

    @RequestMapping(value = "/table/{smId}/{stId}/bindings/{ttId}")
    @Description("获取当前业务逻辑表和绑定的物理表之间的血缘关系")
    public List<LineageBusinessBind> getAllLineageBusinessBindingsBySourceAndTarget(@Description("业务逻辑表的模型ID") @PathVariable("smId")Long smId,
                                                                                    @Description("业务逻辑表的表ID") @PathVariable("stId")Long stId,
                                                                                    @Description("物理表的表ID") @PathVariable("ttId")Long ttId){
        return lineageMappingService.findLineageBusinessBindingsBySourceTableAndTargetTable(smId, stId, ttId);
    }
}
