package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.annotation.EndpointDoc;
import com.andorj.common.core.data.CommonPair;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.EditHistory;
import com.andorj.common.data.PageResult;
import com.andorj.enhance.data.FoundMatchDomainDto;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.base.api.ObjectVisitService;
import com.datablau.data.common.api.ExcelLoader;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.BaseStandardCodeDto;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.domain.management.dto.DomainFolderAccessListDto;
import com.datablau.domain.management.dto.DomainFolderDto;
import com.datablau.domain.management.dto.DomainQueryDto;
import com.datablau.domain.management.dto.DomainTreeNodeDto;
import com.datablau.domain.management.dto.DomainUdpDto;
import com.datablau.domain.management.dto.DomainUsageResDto;
import com.datablau.domain.management.dto.DomainVersionDto;
import com.datablau.domain.management.dto.SimpleDomainDto;
import com.datablau.domain.management.dto.StandardCodeDto;
import com.datablau.domain.management.dto.StandardCodePageDto;
import com.datablau.domain.management.dto.StandardCodeQueryDto;
import com.datablau.domain.management.dto.StandardCompareResultDto;
import com.datablau.domain.management.dto.UserAccessibleCategoryDto;
import com.datablau.domain.management.dto.measurement.ObjectFullPathDto;
import com.datablau.domain.management.type.PermissionLevel;
import com.datablau.domain.management.type.PermissionType;
import com.datablau.metadata.common.dto.domain.verify.DomainUsage;
import com.datablau.metadata.main.dao.metadata.DataObjectRepository;
import com.datablau.metadata.main.dto.domain.AppliedDomainEntityList;
import com.datablau.metadata.main.dto.domain.ReferenceDataDto;
import com.datablau.metadata.main.dto.domain.ReviewRequestDto;
import com.datablau.metadata.main.dto.domain.SimpleQueryDto;
import com.datablau.metadata.main.dto.domain.verify.DomainVerifyInfoDto;
import com.datablau.metadata.main.dto.metadata.BaseDataObject;
import com.datablau.metadata.main.dto.metadata.BaseDomainCount;
import com.datablau.metadata.main.dto.metadata.ColumnClusterQueryDto;
import com.datablau.metadata.main.entity.domain.ColumnClusterDetailDelete;
import com.datablau.metadata.main.entity.domain.ColumnClusterJobResultDelete;
import com.datablau.metadata.main.entity.metadata.ColumnClusterDetail;
import com.datablau.metadata.main.entity.metadata.ColumnClusterJobResult;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.service.aic.api.AicBotService;
import com.datablau.metadata.main.service.domain.api.DomainDashboardService;
import com.datablau.metadata.main.service.domain.api.DomainVerifyService;
import com.datablau.metadata.main.service.domain.api.LocalDomainService;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.util.DataUtility;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @author baobao
 */
@RestController
@RequestMapping("/domains")
//@Feature(LicenseInfo.FE_DOMAIN)
@Tag(name = "数据标准相关的REST API")
public class DomainController extends LocalBaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DomainController.class);
    @Autowired
    private LocalDomainService localDomainService;
    @Autowired
    private DataObjectService objectService;
    @Autowired
    private DomainVerifyService domainVerifyService;
    @Autowired
    private MessageService msgService;
    @Autowired
    private ExcelLoader excelLoader;
    @Autowired
    private ObjectVisitService objectVisitService;
    @Autowired
    private DataObjectRepository objectRepository;
    @Autowired
    private DomainDashboardService domainDashboardService;
    @Autowired
    private OperationLogService operationLogService;

    public DomainController(@Autowired RoleService roleService) {
        super(roleService);
    }

    /**
     * 获取数据标准列表
     * @param state
     * @param categoryId
     * @return
     */
    @Operation(summary = "获取数据标准列表")
    @Parameters({@Parameter(name = "state", description = "数据标准当前的状态, 候选值V(\"Verifiy\"), A(\"Accepted\"), "
            + "D(\"Development\"), C(\"Candidate\"), X(\"Expired\")", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "分类的ID，如果不填默认就是数据标准", in = ParameterIn.QUERY)})
//    @AuditLog
    @GetMapping(value = "/")
    public List<DomainDto> getDomains(@RequestParam("state") DomainState state,
                                      @RequestParam(name = "", defaultValue = LocalDomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId) {
        return localDomainService.loadDomains(state, categoryId);
    }


    /**
     * 获取一组数据标准
     * @param domainIds
     * @return
     */
    @Operation(summary = "获取一组数据标准")
    @EndpointDoc(bodyExample = "[\"8E047999441A4042BC2AE142FED09586\", \"5E55BECABD1F4809A80FEDCCB70B2A0B\"]")
    @PutMapping(value = "/collection")
    public List<DomainDto> getCollectionDomains(@RequestBody Set<String> domainIds) {
        return localDomainService.getDomainsByDomainIds(domainIds);
    }

    /**
     * 获取所有的标准代码
     * @param discard
     * @param categoryId
     * @return
     */
    @Operation(summary = "获取所有的标准代码")
    @Parameters({@Parameter(name = "discard", description = "是否是被废弃的", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "分类的ID，如果不填默认就是企业标准代码", in = ParameterIn.QUERY)})
//    @AuditLog
    @RequestMapping("/codes")
    public List<BaseStandardCodeDto> getAllCodes(@RequestParam(name = "discard", defaultValue = "false") boolean discard,
                        @RequestParam(name = "categoryId", defaultValue = LocalDomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId) {
        if (discard) {
            return localDomainService.getDiscardCodeList(categoryId);
        } else {
            return localDomainService.getCodeList(categoryId);
        }
    }

    /**
     * 获取所有标准的分类
     * @return
     */
    @Operation(summary = "获取所有标准的分类")
    @RequestMapping("/categories")
    public List<DomainFolderDto> getAllCategories() {
        return localDomainService.getAllDomainCategoriesOfUser(AuthTools.currentUsernameFailFast());
    }

    /**
     * 获取所有目录的分类
     * @return
     */
    @Operation(summary = "获取所有目录的分类")
    @RequestMapping("/categories/catalogs")
    public Set<String> getAllCatalogs() {
        return localDomainService.getAllCatalogs();
    }

    /**
     * 创建一个标准目录， 如果parentId为0，那么创建的为顶级分类
     * @param folder
     * @return
     */
    @Operation(summary = "创建一个标准目录， 如果parentId为0，那么创建的为顶级分类")
    @PostMapping(value = "/folders")
    public DomainFolderDto createFolder(@RequestBody DomainFolderDto folder) {
        return localDomainService.createDomainCategory(folder);
    }

    /**
     * 更新一个标准目录
     * @param folderId
     * @param folder
     * @return
     */
    @Operation(summary = "更新一个标准目录")
    @Parameters({@Parameter(name = "folderId", description = "目录id", in = ParameterIn.PATH)})
    @PutMapping(value = "/folders/{folderId}")
    public DomainFolderDto updateCategory(@PathVariable("folderId") Long folderId, @RequestBody DomainFolderDto folder) {
        folder.setId(folderId);
        return localDomainService.updateDomainCategory(folder);
    }

    /**
     * 删除一个标准目录
     * @param folderId
     */
    @Operation(summary = "删除一个标准目录")
    @DeleteMapping(value = "/folders/{folderId}")
    public void deleteCategory(@PathVariable("folderId") Long folderId) {
        localDomainService.deleteDomainCategory(folderId);
    }

    /**
     * 获取所有用户自定义的数据标准属性
     * @param categoryId
     * @return
     */
    @Operation(summary = "获取所有用户自定义的数据标准属性")
    @Parameters({@Parameter(name = "catalogId", description = "分类的ID", in = ParameterIn.QUERY)})
    @RequestMapping("/udps")
    public List<DomainUdpDto> getAllUdps(
            @RequestParam(name = "categoryId", defaultValue = LocalDomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId) {
        return localDomainService.getDomainUdps(categoryId);
    }

    /**
     * 创建数据标准的UDP
     * @param udfs
     * @param forceClear
     * @param categoryId
     * @return
     */
    @Operation(summary = "创建数据标准的UDP")
    @Parameters({@Parameter(name = "clear", description = "把UDP完全清除，并把当前系统中所有数据标准中的UDP清除。"
            + "一般只有当UDP有属性被删除的时候需要传入true", in = ParameterIn.QUERY),
            @Parameter(name = "catalogId", description = "UDP对应的分类的ID", in = ParameterIn.QUERY)})
//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "dam_domain_udps",
//            systemModule = OperationModuleType.DOMAIN_GENERATE,
//            description = "创建数据标准的UDP"
//    )
    @EndpointDoc(bodyExample = "[{\n"
            + "    \"name\" : \"数据管理员\",\n"
            + "    \"dataType\" : \"String\",\n"
            + "    \"order\" : 1,\n"
            + "    \"catalog\" : \"业务属性\"\n"
            + "}, {\n"
            + "    \"name\" : \"执行周期\",\n"
            + "    \"dataType\" : \"String\",\n"
            + "    \"order\" : 2,\n"
            + "    \"catalog\" : \"管理属性\",\n"
            + "    \"required\" : true,\n"
            + "    \"candidates\" : [\"每天\", \"每周\", \"每月\"]\n"
            + "}]", responseExample = "[\n"
            + "    {\n"
            + "        \"udpId\": 2,\n"
            + "        \"bindFolderId\": 1,\n"
            + "        \"dataType\": \"String\",\n"
            + "        \"name\": \"数据管理员\",\n"
            + "        \"order\": 1,\n"
            + "        \"catalog\": \"业务属性\",\n"
            + "        \"candidates\": null,\n"
            + "        \"required\": false\n"
            + "    },\n"
            + "    {\n"
            + "        \"udpId\": 3,\n"
            + "        \"bindFolderId\": 1,\n"
            + "        \"dataType\": \"String\",\n"
            + "        \"name\": \"执行周期\",\n"
            + "        \"order\": 2,\n"
            + "        \"catalog\": \"管理属性\",\n"
            + "        \"candidates\": [\n"
            + "            \"每天\",\n"
            + "            \"每周\",\n"
            + "            \"每月\"\n"
            + "        ],\n"
            + "        \"required\": true\n"
            + "    }\n"
            + "]")
    @PostMapping(value = "/udps")
    public List<DomainUdpDto> createUdps(@RequestBody List<DomainUdpDto> udfs,
                             @RequestParam(name = "clear", defaultValue = "false") Boolean forceClear,
                             @RequestParam(name = "categoryId", defaultValue = LocalDomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId) {
        return localDomainService.uploadDomainUdps(udfs, categoryId, forceClear);
    }

    /**
     * 得到某一个标准代码的内容
     * @param codeNumber
     * @param categoryId
     * @return
     */
    @Operation(summary = "得到某一个标准代码的内容")
    @Parameters({@Parameter(name = "codeNumber", description = "标准代码值", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "分类的ID", in = ParameterIn.QUERY)})
//    @AuditLog
    @RequestMapping("/codes/content")
    public StandardCodeDto getCodeDetails(@RequestParam("codeNumber") String codeNumber,
                      @RequestParam(name = "categoryId", defaultValue = LocalDomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId) {
        return localDomainService.getCodeByCodeNumber(codeNumber, categoryId);
    }

    /**
     * 得到数据标准的修改历史
     * @param domainId
     * @param pageSize
     * @param currentPage
     * @return
     */
    @Operation(summary = "得到数据标准的修改历史")
    @Parameters({@Parameter(name = "domainId", description = "数据标准ID", in = ParameterIn.PATH),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY)})
    @RequestMapping("/{domainId}/history")
    public PageResult<EditHistory> getDomainHistory(@PathVariable("domainId") String domainId,
                                                    @RequestParam("pageSize") int pageSize,
                                                    @RequestParam("currentPage") int currentPage) {
        return localDomainService.getDomainHistory(domainId, pageSize, currentPage);
    }



    /**
     * 创建一个标准代码
     * @param code
     * @return
     */
    @Operation(summary = "创建一个标准代码")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "dam_std_code",
//            systemModule = OperationModuleType.DOMAIN_STANDARD,
//            description = "新增标准代码名为:{param}",
//            descriptionParamClass = StandardCodeDto.class,
//            descriptionParamMethod = "getName"
//    )
    @PostMapping(value = "/codes/")
    //@PreAuthorize(UserRights.STANDARD_CODE_ADD)
    public StandardCodeDto addCode(@RequestBody StandardCodeDto code) {
        return localDomainService.addCode(code);
    }

    /**
     * 获取一个标准代码的历史版本
     * @param codeNumber
     * @param categoryId
     * @return
     */
    @Operation(summary = "获取一个标准代码的历史版本")
    @Parameters({@Parameter(name = "codeNumber", description = "标准代码的编码", in = ParameterIn.QUERY),
            @Parameter(name = "catalogId", description = "分类的ID", in = ParameterIn.QUERY)})
    @RequestMapping("/codes/oldVersions")
    public List<StandardCodeDto> getCodeOldVersions(@RequestParam("codeNumber") String codeNumber,
                        @RequestParam(name = "categoryId", defaultValue = LocalDomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId) {
        return localDomainService.getAllOldCodeVersions(codeNumber, categoryId);
    }

    /**
     * 获取一个标准代码的修改历史
     * @param codeNumber
     * @param categoryId
     * @param pageSize
     * @param currentPage
     * @return
     */
    @Operation(summary = "获取一个标准代码的修改历史")
    @Parameters({@Parameter(name = "codeNumber", description = "标准代码的编码", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "分类的ID", in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY)})
    @RequestMapping("/codes/history")
    public PageResult<EditHistory> getCodeEditHistory(@RequestParam("codeNumber") String codeNumber,
                              @RequestParam(name = "categoryId", defaultValue = LocalDomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId,
                              @RequestParam("pageSize") int pageSize,
                              @RequestParam("currentPage") int currentPage) {
        return localDomainService.getCodeHistory(codeNumber, categoryId, pageSize, currentPage);
    }

    /**
     * 修改一个标准代码
     * @param sendMailForDAM
     * @param sendMailForDDM
     * @param code
     * @return
     */
    @Operation(summary = "修改一个标准代码")
    @Parameters({@Parameter(name = "sendMailForDAM", description = "是否给dam发送邮件通知", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "sendMailForDDM", description = "是否给ddm发送邮件通知", required = true, in = ParameterIn.QUERY)
    })
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_std_code",
//            systemModule = OperationModuleType.DOMAIN_STANDARD,
//            description = "修改一个标准代码为:{param}",
//            descriptionParamClass = StandardCodeDto.class,
//            descriptionParamMethod = "getName"
//    )
    //@PreAuthorize(UserRights.STANDARD_CODE_EDIT)
    @PutMapping(value = "/codes/content")
    public StandardCodeDto updateCode(
            @RequestParam(name = "sendMailForDAM", defaultValue = "false") Boolean sendMailForDAM,
            @RequestParam(name = "sendMailForDDM", defaultValue = "false") Boolean sendMailForDDM,
            @RequestBody StandardCodeDto code) {
        return localDomainService.updateCode(code, sendMailForDAM, sendMailForDDM);
    }

    /**
     * 废弃一个标准代码
     * @param codeNumber
     * @param categoryId
     */
    @Operation(summary = "废弃一个标准代码")
    @Parameters({@Parameter(name = "codeNumber", description = "标准代码的编码", in = ParameterIn.QUERY),
            @Parameter(name = "catalogId", description = "标准代码的分类", in = ParameterIn.QUERY)})
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_std_code",
//            systemModule = OperationModuleType.DOMAIN_STANDARD,
//            description = "废弃一个标准代码"
//    )
    @PutMapping(value = "/codes/discard")
    public void discardCode(@Description("标准代码的编码") @RequestParam("codeNumber") String codeNumber,
                            @Description("标准代码的分类") @RequestParam(name = "categoryId", defaultValue = "1") Long categoryId) {
        localDomainService.discardCode(codeNumber, categoryId);
    }

    /**
     * 把废弃标准代码变成非废弃状态
     * @param codeNumber
     * @param categoryId
     */
    @Operation(summary = "把废弃标准代码变成非废弃状态")
    @Parameters({@Parameter(name = "codeNumber", description = "标准代码的编码", in = ParameterIn.QUERY),
            @Parameter(name = "catalogId", description = "标准代码的分类", in = ParameterIn.QUERY)})
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_std_code",
//            systemModule = OperationModuleType.DOMAIN_STANDARD,
//            description = "恢复一个废弃代码"
//    )
    @PutMapping(value = "/codes/undiscard")
    public void undiscardCode(@RequestParam("codeNumber") String codeNumber,
                              @RequestParam(name = "categoryId", defaultValue = "1") Long categoryId) {
        localDomainService.undiscardCode(codeNumber, categoryId);
    }



    /**
     * 获取一个数据标准的所有历史版本
     * @param domainId
     * @return
     */
    @Operation(summary = "获取一个数据标准的所有历史版本")
    @Parameters({@Parameter(name = "domainId", description = "数据标准ID", in = ParameterIn.PATH)})
    @RequestMapping("/{domainId}/oldVersions")
    public List<DomainVersionDto> getDomainOldVersions(@Description("数据标准ID") @PathVariable("domainId") String domainId) {
        return localDomainService.getAllVersionsOfDomain(domainId);
    }

    @Operation(summary = "获取当前用户可以访问的所有目录，以及不同目录的访问权限")
    @PostMapping("/categories")
    public List<UserAccessibleCategoryDto> getAllUserAccessibleCategories() {
        return localDomainService.getAllUserAccessibleCategories(AuthTools.currentUsernameFailFast());
    }

    /**
     * 赋予顶级目录的访问权限
     * @param categoryId
     * @param type
     * @param level
     * @param target
     */
    @Operation(summary = "给部门或者个人赋予顶级目录的访问权限，这个权限会被继承到所有子目录,post body为目标id，如果type为USER，那么body为用户名， 如果type为DEPARTMENT，那么body为部门编码")
    @Parameters({@Parameter(name = "categoryId", description = "目标顶级目录ID", in = ParameterIn.QUERY),
            @Parameter(name = "type", description = "赋权目标是部门还是用户，可选值为USER,DEPARTMENT", in = ParameterIn.QUERY),
            @Parameter(name = "level", description = "目标对目录的权限等级, 可选值为 ADMIN,WRITE,READ,NONE", in = ParameterIn.QUERY)})
    @PostMapping("/categories/grant")
    public void updateUserRightsOfCategory(@RequestParam("categoryId") Long categoryId,
                                        @RequestParam("type") PermissionType type,
                                        @RequestParam("level") PermissionLevel level,
                                        @RequestBody String target) {
        localDomainService.updateUserPermissionOfCategory(categoryId, type, target, level);
    }

    /**
     * 获取某一个分类的完整的权限列表
     * @param categoryId
     * @return
     */
    @Operation(summary = "获取某一个分类的完整的权限列表")
    @Parameters({@Parameter(name = "catalogId", description = "目录id", in = ParameterIn.QUERY)})
    @GetMapping("/categories/get")
    public List<DomainFolderAccessListDto> getPermissionDetailsOfCategory(@RequestParam("categoryId") Long categoryId) {
        return localDomainService.getPermissionDetailsOfCategory(categoryId);
    }

    /**
     * 得到树形结构的数据标准
     * @param state
     * @param categoryId
     * @param onlyFolder
     * @return
     */
    @Operation(summary = "得到树形结构的数据标准")
    @Parameters({@Parameter(name = "state", description = "数据标准的状态值", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "分类的ID", in = ParameterIn.QUERY),
            @Parameter(name = "onlyFolder", description = "目录是否包含数据标准", in = ParameterIn.QUERY)})
    @RequestMapping("/tree")
    public DomainTreeNodeDto getDomainTree(@RequestParam(value = "state", required = false) DomainState state,
                                        @RequestParam("categoryId") Long categoryId,
                                        @RequestParam(value = "onlyFolder", defaultValue = "true") Boolean onlyFolder) {
        return localDomainService.loadDomainTree(state, categoryId, onlyFolder);
    }


    /**
     * 获取完整的数据标准和元数据的关联列表
     * @return
     */
    @Operation(summary = "获取完整的数据标准和元数据的关联列表")
//    @AuditLog
    @GetMapping(value = "/entities")
    public AppliedDomainEntityList getUsedDomains() {
        return new AppliedDomainEntityList(localDomainService.loadDomainUsages());
    }

    /**
     * 把数据标准应用到列的元数据上
     * @param usage
     * @return
     */
    @Operation(summary = "把数据标准应用到列的元数据上")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.DOMAIN_GENERATE,
//            description = "把数据标准应用到列的元数据上"
//    )
//    @AuditLog(auditParams = true)
    @EndpointDoc(bodyExample = "{\"domainId\":\"006a2af8d6814875a69fde3d03c78ccb\",\"objectId\":657422}")
    @PostMapping(value = "/entities")
    public int applyDomainOnEntity(@RequestBody DomainUsage usage) {
        Long objectId = usage.getObjectId();
        DataObject dataObject = objectService.getDataObjectByObjectId(objectId);
        //todo 7.0
        //        checkMetadataEditPermissions(dataObject);

        int number = localDomainService.addDomainUsage(usage);

        //增加日志
        addEntityDomainLog(dataObject);

        return number;
    }

    protected void addEntityDomainLog(DataObject dataObject) {
        try {
            String logMessage = msgService.getMessage("metadata.column.domain.log.modify", dataObject.getFullName());
            operationLogService.generateOperationLog(OperationModuleType.METADATA_DATA, "dam_element",
                    OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    /**
     * 绑定其它数据标准到列元数据上
     * @param usage
     */
    @Operation(summary = "绑定其它数据标准到列元数据上")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.DOMAIN_GENERATE,
//            description = "把数据标准应用到列的元数据上"
//    )
//    @AuditLog(auditParams = true)
    @EndpointDoc(bodyExample = "{\"domainId\":\"006a2af8d6814875a69fde3d03c78ccb\",\"objectId\":657422}")
    @PutMapping(value = "/entities")
    public void updateTagged(@RequestBody DomainUsage usage) {
        localDomainService.updateDomainUsage(usage);
    }

    /**
     * 获取完整的数据标准和元数据的关联列表
     * @return
     */
    @Operation(summary = "获取完整的数据标准和元数据的关联列表")
//    @AuditLog
    @GetMapping(value = "/entities/usages")
    public List<DomainUsage> getDomainUsages() {
        return localDomainService.loadDomainUsages();
    }

    /**
     * 查询一个数据标准的使用情况
     * @param domainId
     * @return ObjectFullPathDto
     * @throws Exception
     */
    @Operation(summary = "查询一个数据标准的使用情况")
    @Parameters({@Parameter(name = "domainId", description = "标准ID", in = ParameterIn.PATH)})
//    @AuditLog(auditParams = true)
    @RequestMapping("/{domainId}/usages")
    public Collection<ObjectFullPathDto> getDomainUsages(@PathVariable("domainId") String domainId)
            throws Exception {
        Set<DomainUsage> usages = localDomainService.getDomainUsages(domainId);
        Set<Long> objectIds = new HashSet<Long>();

        for (DomainUsage usage : usages) {
            objectIds.add(usage.getObjectId());
        }

        return objectService.getObjectFullPathByIds(objectIds, true);
    }

    @PostMapping("/domain/getDomainUsagesPage")
    @Operation(summary = "分页查询一个数据标准的使用情况")
    public PageResult<ObjectFullPathDto> getDomainUsagesPage(@RequestBody DomainQueryDto queryDto) {
        return domainDashboardService.getDomainUsagesPage(queryDto);
    }

    /**
     *          //    DELETE for delete
     *         @RequestMapping(method = RequestMethod.DELETE, value = "/entities/{usageId}")
//     *         @AuditLog(auditParams = true)
     *         @Description("删除一个列元数据上的数据标准")
     *         public void removeTagged(@Description("元数据的objectId") @PathVariable("usageId") Long usageId) {
     *             domainService.removeDomainUsage(usageId);
     *         }
     */

    /**
     * 删除一个列元数据上的数据标准
     * @param domainId
     * @param objectId
     */
    @Operation(summary = "删除一个列元数据上的数据标准")
    @Parameters({@Parameter(name = "domainId", description = "标准ID", in = ParameterIn.PATH),
            @Parameter(name = "objectId", description = "对象ID", in = ParameterIn.PATH)})
//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "dam_domain_verify",
//            systemModule = OperationModuleType.DOMAIN_GENERATE,
//            description = "删除一个列元数据上的数据标准"
//    )
//    @AuditLog(auditParams = true)
    @DeleteMapping(value = "/{domainId}/columns/{objectId}")
    public void removeDomainUsage(@PathVariable("domainId") String domainId, @PathVariable("objectId") Long objectId) {
        localDomainService.removeDomainUsage(objectId);

        //增加日志
        DataObject dataObject = objectService.getDataObjectByObjectId(objectId);
        addEntityDomainLog(dataObject);
    }

    /**
     * 提交审核请求
     * @param request
     */
    @Operation(summary = "提交审核请求")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_domain_assignment",
//            systemModule = OperationModuleType.DOMAIN_GENERATE,
//            description = "提交审核请求"
//    )
//    @AuditLog(auditParams = true)
    @EndpointDoc(bodyExample = "{\n"
            + "    \"reviewer\" : \"admin\",\n"
            + "    \"domainIds\" : [\"816c855fbe81404fb7549b0242120c6c\"]\n"
            + "}")
    @PostMapping(value = "/review")
    public void submitDomainReviewRequest(@RequestBody ReviewRequestDto request) {
        localDomainService.submitDomainReviewRequest(request.getReviewer(), request.getDomainIds());
    }

    /**
     * 驳回审核请求
     * @param request
     */
    @Operation(summary = "驳回审核请求")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_domain_assignment",
//            systemModule = OperationModuleType.DOMAIN_GENERATE,
//            description = "驳回审核请求"
//    )
//    @AuditLog(auditParams = true)
    @PostMapping(value = "/reject")
    public void rejectDomainReviewRequest(@RequestBody ReviewRequestDto request) {
        localDomainService.rejectDomainReviewRequests(request.getDomainIds(), request.getComment());
    }

    /**
     * 通过审核
     * @param request
     */
    @Operation(summary = "通过审核")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_domain_assignment",
//            systemModule = OperationModuleType.DOMAIN_GENERATE,
//            description = "通过审核"
//    )
//    @AuditLog(auditParams = true)
    @EndpointDoc(bodyExample = "{\n"
            + "    \"domainIds\" : [\"816c855fbe81404fb7549b0242120c6c\"]\n"
            + "}")
    @PostMapping(value = "/approve")
    public void approveDomainReviewRequest(@RequestBody ReviewRequestDto request) {
        localDomainService.approveDomainReviewRequests(request);
    }

    /**
     * 撤回请求
     * @param request
     */
    @Operation(summary = "撤回请求")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_domain_assignment",
//            systemModule = OperationModuleType.DOMAIN_GENERATE,
//            description = "撤回请求"
//    )
//    @AuditLog(auditParams = true)
    @PostMapping(value = "/withdraw")
    public void withDrawApprovedDomains(@RequestBody ReviewRequestDto request) {
        localDomainService.withDrawDomains(request.getDomainIds());
    }


    /**
     * 搜索数据标准
     * @param keyword
     * @param state
     * @param categoryId
     * @return
     */
    @Operation(summary = "搜索数据标准")
    @Parameters({@Parameter(name = "key", description = "关键字", in = ParameterIn.QUERY),
            @Parameter(name = "state", description = "数据标准状态", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "分类的ID", in = ParameterIn.QUERY)})
//    @AuditLog(auditParams = true)
    @RequestMapping("/search")
    public DomainTreeNodeDto searchDomains(@RequestParam(value = "key") String keyword,
                                           @RequestParam(value = "state", defaultValue = "A") DomainState state,
                                           Long categoryId) {
        return localDomainService.searchDomains(keyword, state, categoryId);
    }


    /**
     * 找到跟一个数据标准相关的其它数据标准
     * @param domainId
     * @return DomainDto
     * @throws Exception
     */
    @Operation(summary = "找到跟一个数据标准相关的其它数据标准")
    @Parameters({@Parameter(name = "domainId", description = "标准ID", in = ParameterIn.PATH)})
//    @AuditLog(auditParams = true)
    @RequestMapping("/{domainId}/related")
    public Collection<DomainDto> findRelatedDomains(@PathVariable("domainId") String domainId)
            throws Exception {
        List<DomainDto> domains = localDomainService.findRelatedDomains(domainId);
        return getDomainDto(domains);
    }


    /**
     * 查询一个标准代码的使用情况
     * @param codeNumber
     * @return DomainDto
     * @throws Exception
     */
    @Operation(summary = "查询一个标准代码的使用情况")
    @Parameters({@Parameter(name = "codeNumber", description = "标准代码编号", in = ParameterIn.QUERY)})
//    @AuditLog(auditParams = true)
    @RequestMapping("/code/usages")
    public Collection<DomainDto> getDomainCodeUsages(@RequestParam("codeNumber") String codeNumber)
            throws Exception {
        return localDomainService.getDomainCodeUsages(codeNumber);
    }

    /**
     * 获取一个数据标准的具体内容
     * @param domainId
     * @return DomainDto
     * @throws IOException
     */
    @Operation(summary = "获取一个数据标准的具体内容")
    @Parameters({@Parameter(name = "domainId", description = "数据标准的ID", in = ParameterIn.PATH)})
//    @AuditLog(auditParams = true)
    @GetMapping(value = "/details/{domainId}")
    public DomainDto getDomainDetails(@PathVariable("domainId") String domainId)
            throws IOException {
        DomainDto domain = localDomainService.getDomainByDomainId(domainId);
        if (domain == null) {
            return null;
        }

        objectVisitService.asyncIncrementVisitCount(domain.getDomainId(), LDMTypes.oDataStandard, AuthTools.currentUsernameFailFast());
        return domain;
    }

    /**
     * 导入标准代码文件
     * @param multipartFile
     * @param categoryId
     * @throws Exception
     */
    @Operation(summary = "导入标准代码文件")
    @Parameters({@Parameter(name = "file", description = "文件", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "标准代码的分类", in = ParameterIn.QUERY)})
//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_std_code",
//            systemModule = OperationModuleType.DOMAIN_STANDARD,
//            description = "导入标准代码文件"
//    )
//    @AuditLog
    //@PreAuthorize(UserRights.STANDARD_CODE_IMPORT_CODE)
    @PostMapping(value = "/uploadcode")
    public void uploadCodeExcel(@RequestParam("file") MultipartFile multipartFile,
                                @RequestParam(name = "categoryId", defaultValue = "1") Long categoryId,
                                @RequestParam(value = "published", defaultValue = "false") boolean published) throws Exception {
        LOGGER.info(AuthTools.currentUsernameNullSafe() + " is uploading file " + multipartFile.getName());
        File uploadedFile = DataUtility.uploadFile(multipartFile);
        try {
            localDomainService.loadCodesFromFile(uploadedFile, categoryId, published);
        } finally {
            uploadedFile.delete();
        }
    }

    /**
     * 导出数据标准模板
     * @param response
     * @param categoryId
     * @throws Exception
     * @throws UnexpectedStateException
     */
    @Operation(summary = "导出数据标准模板")
    @Parameters({@Parameter(name = "categoryId", description = "分类的ID", in = ParameterIn.PATH)})
//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_domain",
//            systemModule = OperationModuleType.DOMAIN_GENERATE,
//            description = "导出数据标准模板"
//    )
    @GetMapping(value = "/template")
    public void exportDomainTemplate(HttpServletResponse response,
                 @RequestParam(value = "categoryId", defaultValue = LocalDomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId)
            throws Exception {
        File templateFile = null;
        try {
            response.setContentType("application/octet-stream");

            templateFile = localDomainService.exportDomainTemplate(categoryId, new HashMap<>());

            String realName = "";

            try {
                realName = URLEncoder.encode("基础标准模板", "UTF-8");

                if (categoryId == 2) {
                    realName = URLEncoder.encode("指标模板", "UTF-8");
                } else if (categoryId == 3) {
                    realName = URLEncoder.encode("数据字典模板", "UTF-8");
                }

                realName = realName.replace("+", "%20");
            } catch (Exception ex) {
                LOGGER.warn("Failed to convert template file name");
            }

            response.setHeader("Content-disposition", "attachment; filename=" + realName + ".xlsx");
            response.setHeader("Content-Length", String.valueOf(templateFile.length()));

            try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(templateFile));
                 BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
                byte[] buff = new byte[2048];
                int bytesRead;
                while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                    bos.write(buff, 0, bytesRead);
                }

            } catch (Exception ex) {
                throw new UnexpectedStateException(msgService.getMessage("failedToExportTemplateFile", ex.getMessage()), ex);
            }
        } finally {
            if (templateFile != null && templateFile.exists()) {
                templateFile.delete();
            }
        }
    }

    /**
     * 导入数据标准
     * @param multipartFile
     * @param published
     * @param categoryId
     * @throws Exception
     */
    @Operation(summary = "导入数据标准")
    @Parameters({@Parameter(name = "file", description = "导入数据标准的excel文件", in = ParameterIn.QUERY),
            @Parameter(name = "published", description = "是否发布", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "分类id", in = ParameterIn.QUERY),
            @Parameter(name = "autoGenCode", description = "是否生成Code", in = ParameterIn.QUERY)})
//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_domain",
//            systemModule = OperationModuleType.DOMAIN_GENERATE,
//            description = "导入数据标准"
//    )
    @PostMapping(value = "/upload/domain")
    public void uploadDomains(@RequestParam("file") MultipartFile multipartFile,
                              @RequestParam(value = "published", defaultValue = "false") Boolean published,
                              @RequestParam(value = "categoryId", defaultValue = "1") Long categoryId,
                              @RequestParam(value = "autoGenCode", defaultValue = "false") boolean autoGenCode) throws Exception {

        File uploadFile = DataUtility.uploadFile(multipartFile);
        try {
            localDomainService.uploadDomains(uploadFile, published, categoryId, autoGenCode);
        } finally {
            uploadFile.delete();
        }
    }

    /**
     * 获得所有推荐标准结果
     * @param currentPage
     * @param pageSize
     * @param keyword
     * @param isFullWord
     * @param categoryId
     * @param modelId
     * @param orderByNum
     * @return
     */
    @Operation(summary = "获得所有推荐标准结果")
    @Parameters({@Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "keyword", description = "搜索关键字", in = ParameterIn.QUERY),
            @Parameter(name = "isFullWord", description = "字段名和关键字完全匹配", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "指定的系统", in = ParameterIn.QUERY),
            @Parameter(name = "modelId", description = "指定的数据源", in = ParameterIn.QUERY),
            @Parameter(name = "orderByNum", description = "依据数量排序 升序(1), 降序(-1), 无序(0)", in = ParameterIn.QUERY)})
    //@PreAuthorize(UserRights.RECOMMENDED_VIEW)
    @RequestMapping("/cluster_result")
    public Page<ColumnClusterJobResult> getAllClusterJobResult(
                    @RequestParam(name = "currentPage", defaultValue = "0") Integer currentPage,
                   @RequestParam(name = "pageSize", defaultValue = "50") Integer pageSize,
                   @RequestParam(name = "keyword", required = false) String keyword,
                   @RequestParam(name = "isFullWord", required = false) Integer isFullWord,
                   @RequestParam(name = "categoryId", required = false) Long categoryId,
                   @RequestParam(name = "modelId", required = false) Long modelId,
                   @RequestParam(name = "orderByNum", defaultValue = "0", required = false) Integer orderByNum) {
        PageRequest request = PageRequest.of(currentPage, pageSize);
        boolean isFullWordMatch = null != isFullWord && isFullWord == 1;
        int orderBy = 0;
        if (null != orderByNum) {
            orderBy = orderByNum;
        }
        return localDomainService.getPagingClusterJobResults(request, keyword, isFullWordMatch, categoryId, modelId, orderBy);
    }

    /**
     * 更新推荐标准结果
     * @param result
     */
    @Operation(summary = "更新推荐标准结果")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_col_cluster",
//            systemModule = OperationModuleType.DOMAIN_GENERATE,
//            description = "更新推荐标准结果："
//    )
    @PostMapping(value = "/cluster_result")
    public void updateClusterResult(@RequestBody ColumnClusterJobResult result) {
        localDomainService.updateClusterJobResult(result);
    }

    /**
     * 删除推荐标准结果
     * @param clusterId
     */
    @Operation(summary = "删除推荐标准结果")
    @PostMapping(value = "/cluster_result/delete")
    public void deleteClusterResult(@RequestParam("clusterId") Long clusterId) {
        localDomainService.deleteClusterJobResult(clusterId);
    }

    /**
     * 指定聚合推荐分类的推荐结果分页查询
     * @param queryDto
     * @return
     */
    @Operation(summary = "指定聚合推荐分类的推荐结果分页查询")
    @PostMapping(value = "/cluster_result/detail/page")
    public PageResult<ColumnClusterDetail> getClusterResultPage(@RequestBody ColumnClusterQueryDto queryDto) {
        return localDomainService.getClusterResultPage(queryDto);
    }


    /**
     * 获取所有模型中数据标准的应用情况
     * @param currentPage
     * @param pageSize
     * @param domainCode
     * @return
     */
    @Operation(summary = "获取所有模型中数据标准的应用情况")
    @Parameters({@Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "每页大小", in = ParameterIn.QUERY)})
    @EndpointDoc(bodyExample = "D00001")
    @PutMapping(value = "/ddm/usage", produces = {"application/json"})
    public String getDomainUsageInDDM(@RequestParam("currentPage") Integer currentPage,
                                      @RequestParam("pageSize") Integer pageSize,
                                      @RequestBody String domainCode) {
        return localDomainService.getDomainUsageInDDM(domainCode, currentPage, pageSize);
    }

    /**
     * 获取所有打有安全标签的数据源信息
     * @param modelCategoryId
     * @param theme
     * @param keyword
     * @param status
     * @param orderBy
     * @param sort
     * @param domainId
     * @param currentPage
     * @param pageSize
     * @return
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "dam_domain_verify",
//            systemModule = OperationModuleType.DOMAIN_VERIFYINFO,
//            description = "查询自动核标任务"
//    )
    @Operation(summary = "获取所有打有安全标签的数据源信息")
    @Parameters({@Parameter(name = "modelCategoryId", description = "系统id", in = ParameterIn.QUERY),
            @Parameter(name = "theme", description = "标准主题", in = ParameterIn.QUERY),
            @Parameter(name = "keyword", description = "中英文匹配模糊查询条件", in = ParameterIn.QUERY),
            @Parameter(name = "status", description = "处理状态过滤", in = ParameterIn.QUERY),
            @Parameter(name = "orderBy", description = "依据哪个字段排序", in = ParameterIn.QUERY),
            @Parameter(name = "sort", description = "升序还是降序排列结果", in = ParameterIn.QUERY),
            @Parameter(name = "domainId", description = "数据标准id", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY)})
//    @AuditLog
    //@PreAuthorize(UserRights.EXAMINATION_VIEW)
    @RequestMapping("/domainVerifyInfo")
    public PageResult<DomainVerifyInfoDto> getSecurityInfo(
            @RequestParam(value = "modelCategoryId", required = false) Long modelCategoryId,
            @RequestParam(value = "theme", required = false) String theme,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(name = "orderBy", defaultValue = "domainName", required = false) String orderBy,
            @RequestParam(name = "sort", defaultValue = "asc", required = false) String sort,
            @RequestParam(name = "domainId", required = false) String domainId,
            @RequestParam("currentPage") Integer currentPage,
            @RequestParam("pageSize") Integer pageSize) {

        return domainVerifyService.getVerifyInfo(modelCategoryId, keyword, theme, status, orderBy, sort, domainId, currentPage, pageSize);
    }

    /**
     * 全量下载自动核标数据
     *
     * @return*/
//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_domain_verify",
//            systemModule = OperationModuleType.DOMAIN_VERIFYINFO,
//            description = "导出自动核标任务"
//    )
    @RequestMapping(value = "/download", method = RequestMethod.POST)
    public ResponseEntity<Resource> downExcel() throws Exception{
        ByteArrayOutputStream bos = null;
        try {
            Workbook wb = domainVerifyService.export();
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");

            String realName = "自动核标结果.xlsx";
            try {
                realName = URLEncoder.encode(realName, "UTF-8");
            } catch (Exception ignored) {
            }
            headers.setContentDispositionFormData("attachment", realName);
            Resource resource = new InputStreamResource(
                    new ByteArrayInputStream(bos.toByteArray()));

            return ResponseEntity.ok().headers(headers)
                    .contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);

        } finally {
            if (null != bos) {
                bos.close();
            }
        }
    }


    /**
     * 根据标签名统计分组标签表中的信息做成饼图
     * @return
     */
    @Operation(summary = "根据标签名统计分组标签表中的信息做成饼图")
//    @AuditLog
    //@PreAuthorize(UserRights.EXAMINATION_VIEW)
    @RequestMapping("/domainVerifyPie")
    public Map<String, Long> getSecurityPie() {
        return domainVerifyService.getVerifyPie();
    }


    /**
     * 根据标签名统计分组标签表中的信息做成饼图
     * @param domainId
     * @return
     */
    @Operation(summary = "根据标签名统计分组标签表中的信息做成饼图")
    @Parameters({@Parameter(name = "domainId", description = "数据标准id", in = ParameterIn.PATH)})
//    @AuditLog
    //@PreAuthorize(UserRights.EXAMINATION_VIEW)
    @RequestMapping("/domainVerifyPie/{domainId}")
    public Map<String, Long> getSecurityPieByDomainIds(@PathVariable("domainId") String domainId) {
        return domainVerifyService.getVerifyPie(domainId);
    }

    /**
     * 根据标签名统计分组标签表中的信息做成柱状图
     * @return
     */
    @Operation(summary = "根据标签名统计分组标签表中的信息做成柱状图")
//    @AuditLog
    //@PreAuthorize(UserRights.EXAMINATION_VIEW)
    @RequestMapping("/domainVerifyBar")
    public Map<Long, Map<String, Long>> getSecurityBar() {
        return domainVerifyService.getVerifyBar();
    }


    /**
     * 更新元数据状态
     * @param objectId
     * @param status
     */
    @Operation(summary = "更新元数据状态")
    @Parameters({@Parameter(name = "objectId", description = "字段元数据id", in = ParameterIn.QUERY),
            @Parameter(name = "status", description = "状态", in = ParameterIn.QUERY)})
//    @AuditLog
    @RequestMapping("/update")
    public void update(@RequestParam("objectId") Long objectId, @RequestParam("status") String status) {
        domainVerifyService.updateStatusByObjectId(objectId, status);
    }


    /**
     * 更新数据安全信息的内容
     * @param updateInfoDto
     * @throws UnexpectedStateException
     */
    @Operation(summary = "更新数据安全信息的内容：可编辑内容包括：“处理意见(suggestion)、负责人(owner)、核标状态(status)、问题描述(problem)、备注(note)”")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_domain_verify",
//            systemModule = OperationModuleType.DOMAIN_VERIFYINFO,
//            description = "更新验证信息"
//    )
    @EndpointDoc(bodyExample =
            "          { \"id\": 233,\n"
                    + "            \"domainId\": \"f13d8085083b4543bf00b3bdd103e9bb\",\n"
                    + "            \"domainName\": \"客户个人平均年收入\",\n"
                    + "            \"domainCode\": \"CD0004\",\n"
                    + "            \"domainPath\": [\n"
                    + "                \"客户信息\",\n"
                    + "                \"客户资产信息\",\n"
                    + "                \"客户资产信息\"\n"
                    + "            ],\n"
                    + "            \"objectId\": 4764,\n"
                    + "            \"objectLogicalName\": null,\n"
                    + "            \"objectPhysicalName\": \"ID\",\n"
                    + "            \"modelCategoryName\": \"短信平台\",\n"
                    + "            \"modelName\": \"ORACLE_DAMDAILY\",\n"
                    + "            \"tableId\": 4707,\n"
                    + "            \"tableName\": \"DB_AUTH_GROUPS\",\n"
                    + "            \"databaseName\": \"DDMDALIY\",\n"
                    + "            \"theme\": \"保单信息\",\n"
                    + "            \"status\": \"部分映射\",\n"
                    + "            \"owner\": \"admin\",\n"
                    + "            \"problem\": \"数据类型不匹配，元数据的数据类型为：NUMBER，数据标准的数据类型为："
                    + "               VARCHAR；2、3、4、5、6、7、8、9、10、11、12、13、14、15、16、17、18、19、20、21、22、23"
                    + "               等字段值与标准码值不匹配；\",\n"
                    + "            \"suggestion\": null,\n"
                    + "            \"note\": null,\n"
                    + "            \"creationTime\": 1567059163812\n"
                    + "        }")
    @PostMapping(value = "/updateVerifyInfo")
    public DomainVerifyInfoDto updateVerifyInfo(@RequestBody DomainVerifyInfoDto updateInfoDto) {
        if (updateInfoDto.getId() == null) {
            throw new UnexpectedStateException(msgService.getMessage("idOfDataVerificationInformationCanNotBeEmpty"));
        }
        return domainVerifyService.updateDomainVerify(updateInfoDto);
    }

    /**
     * 查询数据标准是否被引用
     * @param ids
     * @return
     */
    @Operation(summary = "查询数据标准是否被引用")
//    @AuditLog
    @PostMapping(value = "/used")
    public boolean ifUsedByObject(List<String> ids) {
        for (String id : ids) {
            if (localDomainService.ifUsedByObject(id)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 分页获取一组数据标准
     * @param domainQueryDto
     * @return
     */
    @Operation(summary = "分页获取一组数据标准")
    @EndpointDoc(bodyExample =
            "{\n"
            + "    \"domainCode\": \"\",\n"
            + "    \"chineseName\": \"\",\n"
            + "    \"domainState\": null,\n"
            + "    \"folderId\": null,\n"
            + "    \"submitter\": \"\",\n"
            + "    \"firstPublishStart\": null,\n"
            + "    \"firstPublishEnd\": null,\n"
            + "    \"orderColumn\": [\n"
            + "        \"createTime\"\n"
            + "    ],\n"
            + "    \"ascOrder\": [\n"
            + "        false\n"
            + "        ],\n"
            + "    \"currentPage\": 1,\n"
            + "    \"pageSize\": 20\n"
            + "}",
            responseExample =
            "{\n"
            + "    \"totalItems\": 5,\n"
            + "    \"currentPage\": 1,\n"
            + "    \"pageSize\": 20,\n"
            + "    \"content\": [\n"
            + "        {\n"
            + "            \"domainId\": \"eeba89c278e7475e92443b42d62770b0\",\n"
            + "            \"domainCode\": \"f\",\n"
            + "            \"chineseName\": \"f\",\n"
            + "            \"englishName\": \"f\",\n"
            + "            \"abbreviation\": \"ef\",\n"
            + "            \"description\": \"\",\n"
            + "            \"dataType\": \"int\",\n"
            + "            \"notNull\": false,\n"
            + "            \"lastModification\": 1620453297236,\n"
            + "            \"additionalProperties\": [],\n"
            + "            \"submitter\": \"admin\",\n"
            + "            \"version\": 1,\n"
            + "            \"state\": \"D\",\n"
            + "            \"folderId\": 1,\n"
            + "            \"categoryId\": 1,\n"
            + "            \"path\": [\n"
            + "                \"检核任务\"\n"
            + "            ],\n"
            + "            \"pathStr\": \"所有基础标准\",\n"
            + "            \"createTime\": 1620453297159\n"
            + "        },\n"
            + "        {\n"
            + "            \"domainId\": \"30e6de1ff9d14b71aac20a133f72a6cf\",\n"
            + "            \"domainCode\": \"e\",\n"
            + "            \"chineseName\": \"e\",\n"
            + "            \"englishName\": \"e\",\n"
            + "            \"abbreviation\": \"e\",\n"
            + "            \"description\": \"\",\n"
            + "            \"dataType\": \"int\",\n"
            + "            \"notNull\": false,\n"
            + "            \"lastModification\": 1620453268080,\n"
            + "            \"additionalProperties\": [],\n"
            + "            \"submitter\": \"admin\",\n"
            + "            \"version\": 1,\n"
            + "            \"state\": \"D\",\n"
            + "            \"folderId\": 1,\n"
            + "            \"categoryId\": 1,\n"
            + "            \"path\": [\n"
            + "                \"所有基础标准\"\n"
            + "            ],\n"
            + "            \"pathStr\": \"所有基础标准\"\n"
            + "        }\n"
            + "    ]\n"
            + "}")
    @PostMapping(value = "/latest/page")
    public PageResult<DomainDto> getPageLatestDomainListChangeTuAcct(@RequestBody DomainQueryDto domainQueryDto) {
        return localDomainService.getPageDomains(domainQueryDto);
    }

    /**
     * 分页获取所有的标准代码
     * @param reqDto
     * @return
     */
    @Operation(summary = "分页获取所有的标准代码")
    @EndpointDoc(bodyExample =
            "{\n"
            + "    \"name\" : \"代码\",\n"
            + "    \"code\" : \"\",\n"
            + "    \"state\" : \"C\",\n"
            + "    \"datasetName\" : \"启银的主题1\",\n"
            + "    \"currentPage\" : 1,\n"
            + "    \"pageSize\" : 20\n"
            + "}",
            responseExample =
            "{\n"
            + "    \"data\": [\n"
            + "        {\n"
            + "            \"updatingCode\": null,\n"
            + "            \"id\": null,\n"
            + "            \"code\": \"sqy001\",\n"
            + "            \"name\": \"启银的代码1\",\n"
            + "            \"enName\": \"englishName\",\n"
            + "            \"datasetName\": \"启银的主题1\",\n"
            + "            \"submitter\": \"admin\",\n"
            + "            \"lastModification\": 1619576565834,\n"
            + "            \"createTime\": 1620443513548,\n"
            + "            \"state\": \"C\",\n"
            + "            \"discardBy\": null,\n"
            + "            \"discardTimestamp\": null,\n"
            + "            \"values\": null,\n"
            + "            \"version\": 1,\n"
            + "            \"owner\": null\n"
            + "        }\n"
            + "    ],\n"
            + "    \"total\": 1,\n"
            + "    \"currentPage\": 1,\n"
            + "    \"pageSize\": 20\n"
            + "}")
    //@PreAuthorize(UserRights.STANDARD_CODE_VIEW)
    @PostMapping(value = "/codes/page")
    public StandardCodePageDto getCodesPage(@RequestBody StandardCodeQueryDto reqDto) {
        return localDomainService.findCodesPage(reqDto);
    }


    /**
     * 获取所有的标准代码的主题
     * @param categoryId
     * @return
     */
    @Operation(summary = "获取所有的标准代码的主题")
    @Parameters({@Parameter(name = "catalogId", description = "分类的ID", in = ParameterIn.QUERY)})
    @EndpointDoc(responseExample = "")
    @GetMapping(value = "/codes/datasetname")
    public List<String> getAllStandardDatasetName(
            @RequestParam(name = "categoryId", defaultValue = LocalDomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId) {
        return localDomainService.getAllStandardDatasetName(categoryId);
    }


    /**
     * 比较数据标准小版本
     * @param domainId
     * @param srcVersion
     * @param tagVersion
     * @return
     */
    @Operation(summary = "比较数据标准小版本")
    @Parameters({@Parameter(name = "domainId", description = "数据标准ID", in = ParameterIn.QUERY),
            @Parameter(name = "srcVersion", description = "源版本", in = ParameterIn.PATH),
            @Parameter(name = "tagVersion", description = "目标版本", in = ParameterIn.PATH)})
    @GetMapping(value = "/version/history/{srcVersion}/{tagVersion}")
    public CommonPair<DomainDto, DomainDto> compareHistoryBetweenVersion(
            @RequestParam("domainId") String domainId,
            @PathVariable("srcVersion") Integer srcVersion,
            @PathVariable("tagVersion") Integer tagVersion) {
        return localDomainService.compareHistoryBetweenVersion(domainId, srcVersion, tagVersion);
    }

    /**
     * 比较中文映射
     * @param categoryId
     * @return
     */
    @Operation(summary = "比较中文映射")
    @Parameters({@Parameter(name = "catalogId", description = "目录id", in = ParameterIn.QUERY)})
    @GetMapping(value = "/column/mapping")
    public Map<String, String> columnMappingToChineseName(@RequestParam(value = "cagegoryId", defaultValue = "1") Long categoryId) {
        Map<String, String> result = new HashMap<>();
        result.put("1_domainCode", "标准编码");
        result.put("1_chineseName", "中文名称");
        result.put("1_englishName", "英文名称");
        result.put("1_abbreviation", "英文简写");
        result.put("1_description", "业务定义");
        if (categoryId != 2) {
            result.put("1_referenceCode", "引用代码");
        }
        result.put("1_dataType", "数据类型");
        result.put("1_dataScale", "数据长度");
        result.put("1_dataPrecision", "数据精度");
        result.put("1_notNull", "非空");
        result.put("1_pathStr", "主题目录");
        result.put("1_businessRule", "业务规则");
        result.put("1_descriptionDepartmentName", "业务定义部门");
        result.put("1_source", "标准来源");
        result.put("1_synonym", "同义词");
        result.put("1_relationDomain", "相关标准");
        result.put("1_authCategoryName", "权威系统");
        result.put("1_rangeType", "信息类型");
        result.put("1_dataFormat", "数据格式");
        result.put("1_ownerOrgName", "技术部门");
        if (categoryId == 2) {
            result.put("1_function", "计算公式");
            result.put("1_measureUnit", "度量单位");
            result.put("1_monitorObjects", "观测对象");
            result.put("1_parentCode", "父级指标");
            result.put("1_dimCodes", "修饰维度");
            result.put("1_documentIds", "参考文档");
        }

        result.put("2_datasetName", "标准主题");
        result.put("2_code", "代码编号");
        result.put("2_name", "中文名称");
        result.put("2_enName", "英文名称");
        result.put("2_comment", "备注");

        result.put("3_value", "编码取值");
        result.put("3_name", "中文名称");
        result.put("3_order", "顺序号");
        result.put("3_definition", "备注");

        return result;
    }

    /**
     * 比较数据标准小版本
     * @param code
     * @param categoryId
     * @param srcVersion
     * @param tagVersion
     * @return
     */
    @Operation(summary = "比较数据标准小版本")
    @Parameters({@Parameter(name = "domainId", description = "数据标准ID", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "分类的ID", in = ParameterIn.QUERY),
            @Parameter(name = "srcVersion", description = "源版本", in = ParameterIn.PATH),
            @Parameter(name = "tagVersion", description = "目标版本", in = ParameterIn.PATH)})
    @GetMapping(value = "/codes/history/{srcVersion}/{tagVersion}")
    public StandardCompareResultDto compareCodeHistoryBetweenVersion(
            @RequestParam("code") String code,
            @RequestParam(name = "categoryId", defaultValue = LocalDomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId,
            @PathVariable("srcVersion") Integer srcVersion,
            @PathVariable("tagVersion") Integer tagVersion) {
        return localDomainService.compareCodeHistoryBetweenVersion(code, categoryId, srcVersion, tagVersion);
    }

    /**
     * 通过标准代码获取数据标准
     * @param domainCodes
     * @return
     */
    @Operation(summary = "通过标准代码获取数据标准")
    @PostMapping(value = "/codes/domain/codes")
    public List<DomainDto> findDomainByDomainCodes(@RequestBody List<String> domainCodes) {
        return localDomainService.findDomainByDomainCodes(domainCodes);
    }

    /**
     * 数据标准影响力分析
     * @param modelCategoryId
     * @param domainId
     * @param currentPage
     * @param pageSize
     * @return
     */
    @Operation(summary = "数据标准影响力分析")
    @Parameters({@Parameter(name = "modelCategoryId", description = "系统id", in = ParameterIn.PATH),
            @Parameter(name = "domainId", description = "标准id", in = ParameterIn.PATH),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY)})
    @GetMapping(value = "/{modelCategoryId}/{domainId}/usage")
    public DomainUsageResDto queryDomainUsage(@PathVariable("modelCategoryId") Long modelCategoryId,
                                              @PathVariable("domainId") String domainId,
                                              @RequestParam("currentPage") Integer currentPage,
                                              @RequestParam("pageSize") Integer pageSize) {
        if (modelCategoryId == 0L) {
            modelCategoryId = null;
        }
        return localDomainService.queryDomainUsage(modelCategoryId, domainId, currentPage, pageSize);
    }

    private boolean isValidStr(String str) {
        return !Strings.isNullOrEmpty(str);
    }

    private Collection<DomainDto> getDomainDto(Collection<DomainDto> domains) {
        Map<String, DomainDto> domainMap = new HashMap<>();

        Set<String> ids = new HashSet<>();
        for (DomainDto domain : domains) {
            ids.add(domain.getDomainId());
            domainMap.put(domain.getDomainId(), domain);
        }

        for (BaseDomainCount count : localDomainService.domainsUsages(ids)) {
            domainMap.get(count.getDomainId()).setUsageCount(count.getCount());
        }

        return domainMap.values();
    }

    private Set<SimpleDomainDto> convertToSimpleDomainDto(Collection<DomainDto> domains) {
        Set<SimpleDomainDto> result = new HashSet<>();
        for (DomainDto domain : domains) {
            result.add(new SimpleDomainDto(domain));
        }
        return result;
    }

    /**
     * 查询已经删除的推荐标准结果
     */
    @Parameters({@Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "keyword", description = "搜索关键字", in = ParameterIn.QUERY),
            @Parameter(name = "isFullWord", description = "字段名和关键字完全匹配", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "指定的系统", in = ParameterIn.QUERY),
            @Parameter(name = "modelId", description = "指定的数据源", in = ParameterIn.QUERY),
            @Parameter(name = "orderByNum", description = "依据数量排序 升序(1), 降序(-1), 无序(0)", in = ParameterIn.QUERY)})
    @GetMapping(value = "/cluster_result/findDelete")
    public Page<ColumnClusterJobResultDelete> findDelete(
            @RequestParam(name = "currentPage", defaultValue = "0") Integer currentPage,
            @RequestParam(name = "pageSize", defaultValue = "50") Integer pageSize,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "isFullWord", required = false) Integer isFullWord,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "modelId", required = false) Long modelId,
            @RequestParam(name = "orderByNum", defaultValue = "0", required = false) Integer orderByNum){

        PageRequest request = PageRequest.of(currentPage, pageSize);
        boolean isFullWordMatch = null != isFullWord && isFullWord == 1;
        int orderBy = 0;
        if (null != orderByNum) {
            orderBy = orderByNum;
        }
        return localDomainService.getPagingClusterJobResultsDelete(request, keyword, isFullWordMatch, categoryId, modelId, orderBy);
    }

    /**
     * 查询重新推荐中的详情信息
     * @param queryDto
     * @return
     */
    @Operation(summary = "指定聚合推荐分类的推荐结果分页查询")
    @PostMapping(value = "/cluster_result/detaildelete/page")
    public PageResult<ColumnClusterDetailDelete> getClusterDelResultPage(@RequestBody ColumnClusterQueryDto queryDto) {
        return localDomainService.getClusterResultDelPage(queryDto);
    }

    /**
     * 移除删除的推荐结果，并支持重新推荐任务
     */
    @PostMapping("/cluster_result/reviveResult")
    public void reviveResult(@RequestBody List<Long> clusterId){
        localDomainService.reviveResult(clusterId);
    }

    /**
     * 获取所有推荐标准总和
     * @return
     */
    @RequestMapping("/cluster_result/count")
    public Long getCountClusterJobResults(){
        return localDomainService.getCountClusterJobResults();
    }


    @PostMapping("/domain/ref/data")
    @Operation(summary = "获取标准代码关联的元数据")
    public PageResult<ReferenceDataDto> getRefData(@RequestBody SimpleQueryDto queryDto, @RequestParam("state") String state) {
        if (!state.equals("A")) {
            return null;
        }
        return localDomainService.getRefDomainDataObjects(queryDto);
    }


    /**
     * 根据数据标准id解绑元数据
     */
    @PostMapping("/unbindDomainById")
    @Operation(summary = "根据数据标准ID解绑")
    public void unbindDomainById(@Parameter(name = "domainId", description = "数据标准id")
                                 @RequestParam("domainId") String domainId) {
        objectRepository.removeDomainsFromObjects(Lists.newArrayList(domainId));
    }

    /**
     * 根据数据标准id解绑元数据
     */
    @PostMapping("/aicBotTest")
    public void aicBotTest(@RequestParam Long modelId) {
        AicBotService aicBotService = BeanHelper.getBean(AicBotService.class);
        DataObjectService dataObjectService = BeanHelper.getBean(DataObjectService.class);

        List<BaseDataObject> candidates =
                dataObjectService.getLookupDomainCandidatesPage(modelId, PageRequest.of(0, 10000)).getContent();

        for (BaseDataObject candidate : candidates) {
            if (StringUtils.isEmpty(candidate.getLogicalName())) {
                continue;
            }
            List<FoundMatchDomainDto> domains = aicBotService.lookForDomains(candidate);
            System.out.println();
        }
    }

}
