package com.datablau.domain.management.controller;

import com.datablau.domain.management.api.MeasurementService;
import com.datablau.domain.management.dto.measurement.*;
import com.datablau.domain.management.utility.DataUtility;
import com.datablau.domain.management.utility.DatablauUtility;
import com.datablau.security.management.utils.AuthTools;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/8/23 10:12
 */
@RestController
@RequestMapping("/me")
public class MeasurementController extends BaseController {
    private static final Logger logger = LoggerFactory.getLogger(MeasurementController.class);

    @Autowired
    private MeasurementService meService;


    @ModelAttribute
    public void encodeBase64Url(HttpServletRequest request) {
        try {

            NativeWebRequest webRequest = new ServletWebRequest(request);
            Map<String, String> map =
                    (Map<String, String>) webRequest.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE,
                            RequestAttributes.SCOPE_REQUEST);

            if (map == null) {
                return;
            }

            for (Map.Entry<String, String> entry : map.entrySet()) {
                try {
                    String encodeBaseStr = entry.getValue() == null ? "" : entry.getValue();
                    String decodeBase64Str = new String(Base64.getDecoder().decode(encodeBaseStr.getBytes()),
                            StandardCharsets.UTF_8);
                    if (decodeBase64Str.startsWith("__BASE64__")) {
                        decodeBase64Str = decodeBase64Str.replace("__BASE64__", "");
                        map.put(entry.getKey(), decodeBase64Str);
                    }
                } catch (Exception e) {
                    logger.debug("failed decode parameter : " + entry.getKey() + ", value is: " + entry.getValue());
                }
            }

            webRequest.setAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE, map, RequestAttributes.SCOPE_REQUEST);
        } catch (Exception e) {
            logger.debug("decode url [ " + request.getRequestURL() + " ] failed : " + e.getMessage());
        }
    }

    @RequestMapping("/tree")
    public MeasurementTreeNodeDto getMeTree() {
        return meService.getMeasurementTree();
    }

    @RequestMapping("/units/catalogs")
    public List<MeUnitCatalogDto> getUnitCatalogs() {
        return meService.getUnitCatalogs();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_me_unit_cat",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "创建或修改目录"
//    )
    @RequestMapping(value = "/units/catalogs", method = RequestMethod.POST)
    public MeUnitCatalogDto createOrUpdateUnitCatalog(@RequestBody MeUnitCatalogDto catalog) {
        return meService.createOrUpdateUnitCatalog(catalog);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_unit_cat",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "删除目录"
//    )
    @RequestMapping(value = "/units/catalogs/{catalogId}", method = RequestMethod.DELETE)
    public void removeUnitCatalog(@PathVariable("catalogId") String catalogId) {
        meService.removeUnitCatalog(catalogId);
    }

    @RequestMapping("/units/catalogs/{catalogId}/units")
    public List<MeUnitDto> getUnitsOfCatalog(@PathVariable("catalogId") String catalogId) {
        return meService.getUnitsOfCatalog(catalogId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_me_unit",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "创建原子指标"
//    )
    @RequestMapping(value = "/units", method = RequestMethod.POST)
    public MeUnitDto createUnit(@RequestBody MeUnitDto unit) {
        return meService.createOrUpdateUnit(unit);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_unit",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "删除原子指标"
//    )
    @RequestMapping(value = "/units/{unitId}/", method = RequestMethod.DELETE)
    public void removeUnit(@PathVariable("unitId") String unitId) {
        meService.removeUnit(unitId);
    }

    @RequestMapping("/properties/catalogs")
    public List<MePropertyCatalogDto> getPropertyCatalogs() {
        return meService.getPropertyCatalogs();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_prop_cat",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "创建或更新属性目录"
//    )
    @RequestMapping(value = "/properties/catalogs", method = RequestMethod.POST)
    public MePropertyCatalogDto createOrUpdatePropertyCatalog(@RequestBody MePropertyCatalogDto catalog) {
        return meService.createOrUpdatePropertyCatalog(catalog);
    }

    @RequestMapping(value = "/properties/catalogs/{catalogId}", method = RequestMethod.DELETE)
    public void removePropertyCatalog(@PathVariable("catalogId") String catalogId) {
        meService.removePropertyCatalog(catalogId);
    }

    @RequestMapping("/properties/catalogs/{catalogId}/properties")
    public List<MePropertyDto> getPropertiesOfCatalog(@PathVariable("catalogId") String catalogId) {
        return meService.getPropertiesOfCatalog(catalogId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_me_prop_cat",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "创建或更新指标属性"
//    )
    @RequestMapping(value = "/properties", method = RequestMethod.POST)
    public MePropertyDto createOrUpdateProperty(@RequestBody MePropertyDto property) {
        return meService.createOrUpdateProperty(property);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_prop_cat",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "删除指标属性"
//    )
    @RequestMapping(value = "/properties/{propertyId}/", method = RequestMethod.DELETE)
    public void removeProperty(@PathVariable("propertyId") String propertyId) {
        meService.removeProperty(propertyId);
    }

    @RequestMapping("/baseCodes/{codeId}")
    public MeBaseCodeDto getBaseCode(@PathVariable("codeId") String codeId) {
        MeBaseCodeDto code = meService.getBaseCode(codeId);
        return code;
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_me_base_code",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "编辑指标体系"
//    )
    @RequestMapping(value = "/baseCodes", method = RequestMethod.POST)
    public MeBaseCodeDto createOrUpdateBaseCode(@RequestBody MeBaseCodeDto code) {
        return meService.createOrUpdateBaseCode(code);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_base_code",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "删除指标体系"
//    )
    @RequestMapping(value = "/baseCodes/{codeId}", method = RequestMethod.DELETE)
    public void removeBaseCode(@PathVariable("codeId") String codeId) {
        meService.removeBaseCode(codeId);
    }


    @RequestMapping("/codes/pattern/")
    public MeCodePatternDto getPattern() {
        return meService.getCodePattern();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_me_code_pattern",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "修改指标编码规则"
//    )
    @RequestMapping(value = "/codes/pattern/", method = RequestMethod.POST)
    public MeCodePatternDto updatePattern(@RequestBody MeCodePatternDto pattern) {
        return meService.updateCodePattern(pattern);
    }

    @RequestMapping("/codes/{codeId}")
    public MeCodeDto getCode(@PathVariable("codeId") String codeId) {
        return meService.getCode(codeId);
    }

//    @RequestMapping("/codes/{codeId}/usages")
//    @Description("查询一个指标的使用情况")
//    public Collection<ObjectFullPathDto> getCodeUsage(@Description("指标ID") @PathVariable("codeId") String codeId) {
//        return meService.getCodeUsages(codeId);
//    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_me_code",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "创建或更新指标编码："
//    )
    @RequestMapping(value = "/codes", method = RequestMethod.POST)
    public MeCodeDto createOrUpdateCode(@RequestBody MeCodeDto code) {
        return meService.createOrUpdateCode(code);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_code",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "删除指标编码"
//    )
    @RequestMapping(value = "/codes/{codeId}", method = RequestMethod.DELETE)
    public void removeCode(@PathVariable("codeId") String codeId) {
        meService.removeCode(codeId);
    }

    @RequestMapping("/monitors/catalogs")
    public List<MeMonitorObjectCatalogDto> getMonitorObjectCatalogs() {
        return meService.getMonitorObjectCatalogs();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_me_obj_cat",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "创建或更新观测目录"
//    )
    @RequestMapping(value = "/monitors/catalogs", method = RequestMethod.POST)
    public MeMonitorObjectCatalogDto createOrUpdateMonitoryObjectCatalog(@RequestBody MeMonitorObjectCatalogDto catalog) {
        return meService.createOrUpdateMonitorObjectCatalog(catalog);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_obj_cat",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "删除观测目录"
//    )
    @RequestMapping(value = "/monitors/catalogs/{catalogId}", method = RequestMethod.DELETE)
    public void removeMonitorObjectCatalog(@PathVariable("catalogId") String catalogId) {
        meService.removeMonitorObjectCatalog(catalogId);
    }

    @RequestMapping("/monitors/catalogs/{catalogId}/objects")
    public List<MeMonitorObjectDto> getObjectsOfMonitorCatalog(@PathVariable("catalogId") String catalogId) {
        return meService.getMeMonitorObjectsOfCatalog(catalogId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_me_obj",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "创建或更新观测对象"
//    )
    @RequestMapping(value = "/monitors", method = RequestMethod.POST)
    public MeMonitorObjectDto createOrUpdateMonitorObject(@RequestBody MeMonitorObjectDto obj) {
        return meService.createOrUpdateMonitorObject(obj);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_obj",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "删除观测对象"
//    )
    @RequestMapping(value = "/monitors/{objectId}", method = RequestMethod.DELETE)
    public void removeMonitorObject(@PathVariable("objectId") String objId) {
        meService.removeMonitorObject(objId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_me_dim",
//            systemModule = OperationModuleType.DOMAIN_DIM,
//            description = "查询维度管理"
//    )
    @RequestMapping("/dims/catalogs")
    public List<MeDimCatalogDto> getDimCatalogs() {
        return meService.getDimCatalogs();
    }

    @RequestMapping("/dims/catalogs/tree")
    public MeDimCatalogTreeDto getDimCatalogTree() {
        return meService.getDimCatalogTree();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_me_dim_catalog",
//            systemModule = OperationModuleType.DOMAIN_DIM,
//            description = "创建或修改维度体系的目录，编码为: {param}",
//            descriptionParamClass = MeDimCatalogDto.class,
//            descriptionParamMethod = "getCatalogId"
//    )
    @RequestMapping(value = "/dims/catalogs", method = RequestMethod.POST)
    //@PreAuthorize(UserRights.DATA_STANDARD_DIM_CATALOG_ADD)
    public MeDimCatalogDto createOrUpdateDimCatalog(@RequestBody MeDimCatalogDto catalog) {
        return meService.createOrUpdateDimCatalog(catalog);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_dim_catalog",
//            systemModule = OperationModuleType.DOMAIN_DIM,
//            description = "删除维度体系的目录，编码为: {param}",
//            descriptionParamClass = String.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping(value = "/dims/catalogs/{catalogId}", method = RequestMethod.DELETE)
    //@PreAuthorize(UserRights.DATA_STANDARD_DIM_CATALOG_DELETE)
    public void removeDimCatalog(@PathVariable("catalogId") String catalogId) {
        meService.removeDimCatalog(catalogId);
    }

    @RequestMapping("/dims/catalogs/{catalogId}/dims")
    public List<MeDimDto> getDimsOfCatalog(@PathVariable("catalogId") String catalogId) {
        return meService.getDimsOfCatalog(catalogId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_me_dim",
//            systemModule = OperationModuleType.DOMAIN_DIM,
//            description = "创建或修改维度，编码为: {param}",
//            descriptionParamClass = MeDimDto.class,
//            descriptionParamMethod = "getDimCode"
//    )
    @RequestMapping(value = "/dims", method = RequestMethod.POST)
    //@PreAuthorize(UserRights.DATA_STANDARD_DIM_CATALOG_VALUE_ADD)
    public MeDimDto createOrUpdateDim(@RequestBody MeDimDto dim) {
        return meService.createOrUpdateDim(dim);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_dim",
//            systemModule = OperationModuleType.DOMAIN_DIM,
//            description = "删除维度，id为: {param}",
//            descriptionParamClass = String.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping(value = "/dims/{dimId}", method = RequestMethod.DELETE)
    //@PreAuthorize(UserRights.DATA_STANDARD_DIM_CATALOG_VALUE_DELETE)
    public void removeDim(@PathVariable("dimId") String dimId) {
        meService.removeDim(dimId);
    }

    @RequestMapping("/funcs")
    public List<MeFuncDto> getFuncs() {
        return meService.getFuncs();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_me_func",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "创建或更新函数"
//    )
    @RequestMapping(value = "/funcs", method = RequestMethod.POST)
    public MeFuncDto createOrUpdateFunc(@RequestBody MeFuncDto func) {
        return meService.createOrUpdateFunc(func);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_func",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "删除函数"
//    )
    @RequestMapping(value = "/funcs/{funcId}", method = RequestMethod.DELETE)
    public void removeFunc(@PathVariable("funcId") String funcId) {
        meService.removeFunc(funcId);
    }

    @RequestMapping("/baseCodes/{codeId}/linkageGraph")
    public MeLinkageGraph getBaseCodeLinkageGraph(@PathVariable("codeId") String codeId) {
        return meService.getBaseCodeGraph(codeId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_me_code",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "把指标应用到列的元数据上"
//    )
//    @RequestMapping(method = RequestMethod.POST, value = "/entities")
//    @Description("把指标应用到列的元数据上")
//    @EndpointDoc(bodyExample = "{\"measurementId\":\"CD001\",\"objectId\":657422}")
//    public int applyMeasurementOnEntity(@RequestBody MeasurementUsage usage) {
//        return meService.addMeasurementUsage(usage);
//    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_me_code",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "绑定其它指标到列元数据上"
//    )
//    @RequestMapping(method = RequestMethod.PUT, value = "/entities")
//    @Description("绑定其它指标到列元数据上")
//    @EndpointDoc(bodyExample = "{\"measurementId\":\"CD001\",\"objectId\":657422}")
//    public void updateTagged(@RequestBody MeasurementUsage usage) {
//        meService.updateMeasurementUsage(usage);
//    }

//
//    @RequestMapping(method = RequestMethod.GET, value = "/entities/usages")
//    @Description("获取完整的指标和元数据的关联列表")
//    public List<MeasurementUsage> getDomainUsages() {
//        return meService.loadMeasurementUsages();
//    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_me_code",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "删除一个列元数据上的指标"
//    )
//    @RequestMapping(method = RequestMethod.DELETE, value = "/{measurementId}/columns/{objectId}")
//    @Description("删除一个列元数据上的指标")
//    public int removeMeasurementUsage(@Description("指标ID") @PathVariable("measurementId") String measurementId,
//                                  @Description("对象ID") @PathVariable("objectId") Long objectId) {
//        return meService.removeMeasurementUsage(objectId);
//    }


//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "db_me_base_code",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "导入指标"
//    )
    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public MesurementImportResultDto importMeasurement(@RequestParam("file") MultipartFile multipartFile) throws Exception {
        logger.info(
                AuthTools.currentUsernameNullSafe() + " is uploading file " + multipartFile.getName());
        File uploadedFile = DataUtility.uploadFile(multipartFile);
        try {
            return meService.importMeasument(uploadedFile);
        } finally {
            uploadedFile.delete();
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "db_me_base_code",
//            systemModule = OperationModuleType.DOMAIN_METRIC,
//            description = "下载指标体系模板"
//    )
    @RequestMapping("/template")
    public void downloadTemplate(HttpServletResponse response) throws Exception {
        File file = new File(DatablauUtility.getResourcePath("/templates/measurement.xlsx"));
        response.setContentType("application/octet-stream");

        String realName = "";

        try {
            realName = URLEncoder.encode("指标模板", "UTF-8");
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

    @RequestMapping(value = "/dims/catalogs/codes", method = RequestMethod.POST)
    public List<MeDimDto> createOrUpdateDimCatalog(@RequestBody List<String> dimAndCatalogIds) {
        return meService.findByDimCodeAndDimCatalogId(dimAndCatalogIds);
    }
}
