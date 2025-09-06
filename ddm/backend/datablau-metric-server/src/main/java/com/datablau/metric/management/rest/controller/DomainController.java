package com.datablau.metric.management.rest.controller;

import com.andorj.common.core.data.CommonPair;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.EditHistory;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.common.api.impl.KafkaPublishService;
import com.datablau.domain.management.mq.message.DeleteDataStandardMessage;
import com.datablau.metric.management.api.DomainCategoryPermissionService;
import com.datablau.metric.management.api.DomainInternalService;
import com.datablau.metric.management.api.DomainService;
import com.datablau.metric.management.api.DomainStatisticsService;
import com.datablau.metric.management.api.MetricExportService;
import com.datablau.metric.management.data.CategoryType;
import com.datablau.metric.management.data.DomainState;
import com.datablau.metric.management.dto.DomainChartDto;
import com.datablau.metric.management.dto.DomainDto;
import com.datablau.metric.management.dto.DomainFolderAccessListDto;
import com.datablau.metric.management.dto.DomainFolderDto;
import com.datablau.metric.management.dto.DomainFolderResDto;
import com.datablau.metric.management.dto.DomainQueryDto;
import com.datablau.metric.management.dto.DomainTreeNodeDto;
import com.datablau.metric.management.dto.DomainUdpDto;
import com.datablau.metric.management.dto.SelectOptionResDto;
import com.datablau.metric.management.dto.StandardCodeDto;
import com.datablau.metric.management.dto.StandardCodeQueryDto;
import com.datablau.metric.management.dto.StandardCompareResultDto;
import com.datablau.metric.management.dto.StatisticsDto;
import com.datablau.metric.management.jpa.entity.DomainFolder;
import com.datablau.metric.management.type.PermissionLevel;
import com.datablau.metric.management.type.PermissionType;
import com.datablau.metric.management.utility.DataUtility;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.util.*;
import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.redisson.api.RMap;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author huajun.li
 */
@RestController
@RequestMapping("/domains")
@Tag(name = "数据标准相关的REST API")
public class DomainController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(DomainController.class);

    private static final String DOMAIN_SELECT_KEY = "DATABLAU_METRIC_SELECT";

    @Value("${datablau.kafka-topic.domain-delete:datablau-domain.domain.delete}")
    private String deleteDomainTopic;

    @Autowired
    private MessageService msgService;
    @Autowired
    private DomainService domainService;
    @Autowired
    private MetricExportService domainExportService;
    @Autowired
    private DomainStatisticsService domainStatisticsService;
    @Autowired
    private DomainCategoryPermissionService domainCategoryPermissionService;
    @Autowired
    private DomainInternalService domainInternalService;
    @Autowired
    private RedissonClient redissonClient;


    private RMap<String, Set<SelectOptionResDto>> selectRMap = null;

    @PostConstruct
    public void init() throws Exception {
        File file = new File(GeneralUtility.getWebRootPath() + File.separator + "resources" + File.separator + "select" + File.separator + "select_option.txt");
        if (!file.exists()) {
            LOGGER.warn("The built-in select options config file cannot be found");
            return;
        }

        selectRMap = redissonClient.getMap(DOMAIN_SELECT_KEY);

        try (FileInputStream fis = new FileInputStream(file);
             InputStreamReader isr = new InputStreamReader(fis, "UTF-8");
             BufferedReader br = new BufferedReader(isr)) {
            String line = null;
            while ((line = br.readLine()) != null) {
                line = line.trim();
                if(StringUtils.isEmpty(line)) {
                    continue;
                }
                String[] contents = line.split(", ");
                SelectOptionResDto option = new SelectOptionResDto();

                String nullStr = "NULL";
                if(!nullStr.equals(contents[0].trim())) {
                    option.setOptionCategory(contents[0].trim());
                }
                if(!nullStr.equals(contents[1].trim())) {
                    option.setOptionName(contents[1].trim());
                }
                if(!nullStr.equals(contents[2].trim())) {
                    option.setOptionValue(contents[2].trim());
                }
                if(!nullStr.equals(contents[3].trim())) {
                    option.setParentOptionValue(contents[3].trim());
                }
                Set<SelectOptionResDto> resList = selectRMap.getOrDefault(option.getOptionName(), new LinkedHashSet<>());
                resList.add(option);
                selectRMap.put(option.getOptionName(), resList);
            }
        }
    }

    @PostMapping("/tree/getTree")
    @Operation(summary = "得到树形结构的数据标准")
    public DomainTreeNodeDto getDomainTree(@RequestBody DomainQueryDto queryDto, HttpServletRequest request) {
        if (!Strings.isNullOrEmpty(queryDto.getMetricsType())) {
            List<DomainFolder> domainFolders = domainInternalService.getDomainFoldersByParentIdAndCatalog(0L, queryDto.getMetricsType());
            if (!CollectionUtils.isEmpty(domainFolders)) {
                queryDto.setCategoryId(domainFolders.get(0).getId());
            }
        }
        return domainService.loadDomainTree(queryDto.getDomainState(), queryDto.getCategoryId(),
                getCurrentUser(request), queryDto.getOnlyFolder());
    }

    @PostMapping("/domain/getPage")
    @Operation(summary = "分页获取一组数据标准")
    public PageResult<DomainDto> getDomainPage(@RequestBody DomainQueryDto domainQueryDto,
                                               HttpServletRequest request) {
        domainQueryDto.setCurrentUser(getCurrentUser(request));
        return domainService.getPageDomains(domainQueryDto);
    }

    @PostMapping("/domain/getPublicPage")
    @Operation(summary = "分页获取一组已发布的数据标准")
    public PageResult<DomainDto> getPublicDomainPage(@RequestBody DomainQueryDto domainQueryDto,
                                                     HttpServletRequest request) {
        domainQueryDto.setCurrentUser(getCurrentUser(request));
        domainQueryDto.setDomainState(DomainState.A);
        return domainService.getPageDomains(domainQueryDto);
    }

    /**
     * 获取根据数据标准id获取数据标准详情
     *
     * @throws InvalidArgumentException 标准不存在抛出异常
     */
    @PostMapping("/domain/getDomainById")
    @Operation(summary = "获取一个数据标准的具体内容")
    public DomainDto getDomainDetails(@RequestBody DomainQueryDto queryDto,
                                      HttpServletRequest request) {
        DomainDto domain = domainService.getDomainByDomainId(queryDto.getDomainId());
        if (domain == null) {
            throw new InvalidArgumentException(msgService.getMessage("domainNotExists"));
        }
        // TODO 7.0
        //访问次数加1，如果没有dam则需要注释掉
//        RemoteServiceGetter
//                .getDatablauRemoteDomainService()
//                .asyncIncrementVisitCount(domain.getDomainId(), LDMTypes.oDataStandard, getCurrentUser(request));
        return domain;
    }

    @PostMapping("/domain/getDomainByCodes")
    @Operation(summary = "通过标准代码获取数据标准")
    public List<DomainDto> findDomainByDomainCodes(@RequestBody List<String> domainCodes) {
        return domainService.findDomainByDomainCodes(domainCodes);
    }

    /**
     * 创建一个数据标准
     *
     * @throws IllegalOperationException
     */
    @PostMapping("/domain/createDomain")
    @Operation(summary = "创建一个数据标准")
    public DomainDto createDomain(
            @RequestBody DomainDto domain,
            @Parameter(name = "published", description = "是否直接发布，当通过推荐标准创建的时候，此值需要是true", required = true)
            @RequestParam(name = "published", defaultValue = "false") Boolean published,
            HttpServletRequest request) {
        if (!AuthTools.hasAnyRole(AuthTools.ROLE_SUPERUSER)) {
            if (!domainCategoryPermissionService.hasPermissionToFolder(AuthTools.currentUsernameFailFast(),
                    domain.getFolderId(), PermissionLevel.WRITE)) {
                throw new IllegalOperationException(msgService.getMessage("notAllowedToEditFolder"));
            }
        }
        return domainService.addDomain(getCurrentUser(request), domain, published);
    }

    @PostMapping("/domain/updateDomain")
    @Operation(summary = "修改一个数据标准的内容")
    public void updateDomain(@RequestBody DomainDto domain, HttpServletRequest request) {
        domainService.updateDomain(domain, getCurrentUser(request));
    }

    @PostMapping("/udp/createUdps")
    @Operation(summary = "创建数据标准的UDP")
    public List<DomainUdpDto> createUdps(
            @RequestBody List<DomainUdpDto> udfs,
            @Parameter(name = "clear", description = "把UDP完全清除，并把当前系统中所有数据标准中的UDP清除。"
                    + "一般只有当UDP有属性被删除的时候需要传入true", required = true)
            @RequestParam(name = "clear", defaultValue = "false") Boolean forceClear,
            @Parameter(name = "categoryId", description = "UDP对应的分类的ID， "
                    + "如果不填默认是数据标准", required = true)
            @RequestParam(name = "categoryId", defaultValue = DomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId) {
        return domainService.batchCreateDomainUdps(udfs, categoryId, forceClear);
    }

    @PostMapping("/udp/getUdps")
    @Operation(summary = "获取所有用户自定义的数据标准属性")
    public List<DomainUdpDto> getAllUdps(@RequestBody DomainQueryDto queryDto) {
        return domainService.getDomainUdps(queryDto.getCategoryId());
    }

    /**
     * 根据数据标准id集合删除数据标准
     */
    @PostMapping("/domain/deleteDomainByIds")
    @Operation(summary = "根据数据标准ID删除一组标准")
    public void deleteDomainByIds(@RequestBody List<String> domainIds, HttpServletRequest request) {
        if (domainIds == null || domainIds.isEmpty()) {
            return;
        }
        domainService.removeDomainByIds(getCurrentUser(request), domainIds);

        KafkaPublishService kafkaPublishService = (KafkaPublishService) BeanHelper.getBeanByName("kafkaService");
        DeleteDataStandardMessage message = new DeleteDataStandardMessage(domainIds);
        message.setMsgId(System.currentTimeMillis());
        message.setSendTime(new Date());
        kafkaPublishService.sendMessage(deleteDomainTopic, message);
    }

    /**
     * 导入数据标准
     *
     * @throws Exception
     */
    @PostMapping(value = "/domain/uploadDomain")
    @Operation(summary = "导入数据标准")
    public void uploadDomains(@Parameter(name = "file", description = "导入数据标准的excel文件", required = true)
                              @RequestParam("file") MultipartFile multipartFile,
                              @Parameter(name = "published", description = "是否导入已发布标准", required = true)
                              @RequestParam(value = "published", defaultValue = "false") Boolean published,
                              @Parameter(name = "categoryId", description = "导入标准的分类", required = true)
                              @RequestParam(value = "categoryId", defaultValue = "1") Long categoryId,
                              @Parameter(name = "autoGenCode", description = "是否自动生成code", required = false)
                              @RequestParam(value = "autoGenCode", defaultValue = "false") boolean autoGenCode,
                              HttpServletRequest request) throws Exception {
        File uploadFile = DataUtility.uploadFile(multipartFile);
        try {
            domainService.addImportDomains(uploadFile, published, categoryId, getCurrentUser(request), autoGenCode);
        } finally {
            uploadFile.delete();
        }
    }

    /**
     * 导出数据标准模板
     *
     * @throws UnexpectedStateException
     */
    @PostMapping(value = "/domain/exportTemplate")
    @Operation(summary = "导出数据标准模板")
    public void exportDomainTemplate(
            HttpServletResponse response,
            @Parameter(name = "categoryId", description = "分类的ID，"
                    + "如果不填默认就是数据标准", required = true)
            @RequestParam(value = "categoryId", defaultValue = DomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId) {
        File templateFile = null;
        try {
            response.setContentType("application/octet-stream");

            templateFile = domainService.exportDomainTemplate(categoryId, new HashMap<>());

            String realName = "";

            try {
                realName = URLEncoder.encode("基础标准模板", "UTF-8");

                if (categoryId == 2) {
                    realName = URLEncoder.encode("指标模板", "UTF-8");
                } else if (categoryId == 3) {
                    realName = URLEncoder.encode("数据字典模板", "UTF-8");
                } else if (categoryId > 3) {
                    realName = URLEncoder.encode("领域数据标准模板", "UTF-8");
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

    @PostMapping(value = "/domain/exportDomainTemplates")
    @Operation(summary = "导出数据标准模板")
    public ResponseEntity<byte[]> exportDomainsTemplate(            HttpServletResponse response,
                                                                    @Parameter(name = "categoryId", description = "分类的ID，"
                                                                            + "如果不填默认就是数据标准", required = true)
                                                                    @RequestParam(value = "categoryId", defaultValue = DomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId) throws Exception {
        return DataUtility.generalResponseEntityByFile(domainExportService.exportDomainTemplate(categoryId, null));
    }

    @PostMapping(value = "/domain/exportDomainData")
    @Operation(summary = "导出数据标准")
    public ResponseEntity<byte[]> exportDomainsData(@RequestBody DomainQueryDto queryDto) throws Exception {
        return DataUtility.generalResponseEntityByFile(domainExportService.exportDomainTemplate(queryDto.getCategoryId(), queryDto));
    }


    @PostMapping(value = "/domain/exportDomain")
    @Operation(summary = "导出数据标准")
    public ResponseEntity<byte[]> exportDomains(@RequestBody DomainQueryDto queryDto) throws Exception {
        return DataUtility.generalResponseEntityByFile(domainService.exportDomain(queryDto));
    }

    @PostMapping(value = "/code/getDatasetname")
    @Operation(summary = "获取所有的标准代码的主题")
    public List<String> getAllStandardDatasetName(@RequestBody DomainQueryDto queryDto) {
        return domainService.getAllStandardDatasetName(queryDto.getCategoryId());
    }

    @PostMapping(value = "/code/createCode")
    @Operation(summary = "创建一个标准代码")
    public StandardCodeDto addCode(@RequestBody StandardCodeDto code, HttpServletRequest request) {
        return domainService.addCode(code, getCurrentUser(request));
    }

    @PostMapping(value = "/code/updateCode")
    @Operation(summary = "修改一个标准代码")
    public StandardCodeDto updateCode(@RequestBody StandardCodeDto code, HttpServletRequest request) {
        return domainService.updateCode(code, getCurrentUser(request));
    }

    @PostMapping("/code/getCode")
    @Operation(summary = "得到某一个标准代码的内容")
    public StandardCodeDto getCodeDetails(@RequestBody StandardCodeQueryDto queryDto) {
        return domainService.getCodeByCodeNumber(queryDto.getCode(), queryDto.getCategoryId());
    }

    @PostMapping("/code/getCodeUsages")
    @Operation(summary = "查询一个标准代码的使用情况")
    public Collection<DomainDto> getDomainCodeUsages(@RequestBody StandardCodeQueryDto queryDto) {
        return domainService.getDomainsByReferenceCode(queryDto.getCode());
    }

    @PostMapping("/code/getEditHistory")
    @Operation(summary = "获取一个标准代码的修改历史")
    public PageResult<EditHistory> getCodeEditHistory(@RequestBody StandardCodeQueryDto queryDto) {
        return domainService.getCodeHistory(queryDto.getCode(), queryDto.getCategoryId(),
                queryDto.getPageSize(), queryDto.getCurrentPage());
    }

    @PostMapping("/code/getCodeHistory")
    @Operation(summary = "获取一个标准代码的历史版本")
    public List<StandardCodeDto> getCodeOldVersions(@RequestBody StandardCodeQueryDto queryDto) {
        return domainService.getAllOldCodeVersions(queryDto.getCode(), queryDto.getCategoryId());
    }

    @PostMapping("/code/compareVersion")
    @Operation(summary = "比较标准代码两个版本")
    public StandardCompareResultDto compareCodeHistoryBetweenVersion(@RequestBody StandardCodeQueryDto queryDto) {
        return domainService.compareCodeHistoryBetweenVersion(queryDto.getCode(), queryDto.getCategoryId(),
                queryDto.getSrvVersion(), queryDto.getTagVersion());
    }

    @PostMapping("/code/deleteCode")
    @Operation(summary = "删除一组标准代码")
    public void deleteCodes(@RequestBody StandardCodeQueryDto queryDto, HttpServletRequest request) {
        domainService.deleteCodeByCodeNumbers(queryDto.getCodes(), getCurrentUser(request),
                queryDto.getCategoryId());
    }

    @PostMapping("/category/getCategories")
    @Operation(summary = "获取所有标准的分类")
    public List<DomainFolderDto> getAllCategories() {
        return domainService.getAllDomainCategoriesOfUser(AuthTools.currentUsername());
    }

    @PostMapping("/category/grant")
    @Operation(summary = "给部门或者个人赋予顶级目录的访问权限，这个权限会被继承到所有子目录, "
            + "post body为目标id，如果type为USER，那么body为用户名， "
            + "如果type为DEPARTMENT，那么body为部门编码")
    public void updateUserRightsOfCategory(
            @Parameter(name = "categoryId", description = "目标顶级目录ID")
            @RequestParam("categoryId") Long categoryId,
            @Parameter(name = "type", description = "赋权目标是部门还是用户，可选值为USER,DEPARTMENT")
            @RequestParam("type") PermissionType type,
            @Parameter(name = "level", description = "目标对目录的权限等级，可选值为 ADMIN,WRITE,READ,NONE")
            @RequestParam("level") PermissionLevel level,
            @RequestBody String target) {
        domainCategoryPermissionService.updateUserPermissionOfCategory(categoryId, type, target, level);
    }

    @PostMapping("/category/getGrant")
    @Operation(summary = "查询某个用户对目录的权限，如果有多个权限(机构权限)返回最高权限")
    public PermissionLevel getCategoryGrant(@Parameter(name = "folderId", description = "目录id")
                                            @RequestParam("folderId") Long folderId,
                                            @Parameter(name = "username", description = "用户名")
                                            @RequestParam("username") String username) {
        return domainCategoryPermissionService.getUserPermissionLevelOfFolderId(folderId, username);
    }

    @PostMapping("/category/getGrantList")
    @Operation(summary = "获取某一个分类的完整的权限列表")
    public List<DomainFolderAccessListDto> getCategoryGrantList(@RequestParam("categoryId") Long categoryId) {
        return domainCategoryPermissionService.getCategoryPermissionList(categoryId);
    }

    /**
     * 创建一个标准目录， 如果parentId为0，那么创建的为顶级分类
     *
     * @throws IllegalOperationException
     * @throws InvalidArgumentException
     */
    @PostMapping(value = "/folder/createFolder")
    @Operation(summary = "创建一个标准目录， 如果parentId为0，那么创建的为顶级分类")
    public DomainFolderDto createFolder(@RequestBody DomainFolderDto folder) {
        if (ObjectUtils.equals(folder.getParentId(), 0L) &&
                !AuthTools.hasAnyRole(AuthTools.ROLE_SUPERUSER, "DATA_STANDARD_CATEGORY_CREATE")) {
            throw new InvalidArgumentException(msgService.getMessage("createRootCategorySuperuserRequired"));
        }

        if (ObjectUtils.notEqual(folder.getParentId(), 0L)) {
            if (!domainCategoryPermissionService.hasPermissionToFolder(AuthTools.currentUsernameFailFast(),
                    folder.getParentId(), PermissionLevel.ADMIN)) {
                throw new IllegalOperationException(msgService.getMessage("notAllowedToEditFolder"));
            }
        }

        DomainFolderDto createdFolder = domainService.createFolder(folder);
        try {
            domainCategoryPermissionService.updateUserPermissionOfCategory(createdFolder.getId(),
                    PermissionType.USER,
                    AuthTools.currentUsernameFailFast(),
                    PermissionLevel.ADMIN);

            return createdFolder;
        } catch (Throwable tw) {
            DomainFolderResDto dto = new DomainFolderResDto();
            dto.setFolderId(createdFolder.getId());
            dto.setUsername(AuthTools.currentUsernameFailFast());
            dto.setWithNoValid(true);
            domainService.deleteFolder(dto);

            throw new UnexpectedStateException("failed to create folder", tw);
        }
    }

    /**
     * 更新一个标准目录
     *
     * @throws IllegalOperationException
     */
    @PostMapping(value = "/folder/updateFolder")
    @Operation(summary = "更新一个标准目录")
    public DomainFolderDto updateCategory(@RequestBody DomainFolderDto folder) {
        if (!AuthTools.hasAnyRole(AuthTools.ROLE_SUPERUSER)) {
            if (!domainCategoryPermissionService.hasPermissionToFolder(AuthTools.currentUsernameFailFast(),
                    folder.getId(), PermissionLevel.ADMIN)) {
                throw new IllegalOperationException(msgService.getMessage("notAllowedToEditFolder"));
            }
        }
        return domainService.updateFolder(folder);
    }

    /**
     * 删除一个标准目录
     *
     * @throws IllegalOperationException
     */
    @PostMapping(value = "/folder/deleteFolder")
    @Operation(summary = "删除一个标准目录")
    public void deleteCategory(@RequestBody DomainFolderResDto folderResDto) {
        folderResDto.setUsername(AuthTools.currentUsername());
        Long folderId = folderResDto.getFolderId();

        //如果最上级不是领域标准，则不需要权限控制
        DomainTreeNodeDto rootFolder = domainInternalService.getDomainRootFolder(folderId);
        //如果当前用户不是超管
        if (!AuthTools.hasAnyRole(AuthTools.ROLE_SUPERUSER) && rootFolder.getFoldId() > 6L) {
            //获取当前用户对用户组根目录的权限
            PermissionLevel pl = domainCategoryPermissionService
                    .getUserPermissionLevelOfCategory(rootFolder.getFoldId(), AuthTools.currentUsernameFailFast());
            //如果当前用户对目录有管理权限
            if (PermissionLevel.ADMIN.equals(pl)) {
                for (DomainFolderDto folder : domainService.getAllDomainCategories()) {
                    if (folder.getId().equals(rootFolder.getFoldId())
                            && CategoryType.ENTERPRISE.equals(folder.getType())) {
                        //如果是企业级目录，不让删
                        throw new IllegalOperationException(msgService.getMessage("notAllowToDeleteRootCategory"));
                    }
                }
            } else {
                //如果没有管理权限，则不让删
                throw new IllegalOperationException(msgService.getMessage("notAllowToDeleteRootCategory"));
            }
        }
        domainService.deleteFolder(folderResDto);
    }

    /**
     * 获取下拉数据
     */
    @PostMapping(value = "/select/getSelectOption")
    @Operation(summary = "获取下拉数据选项")
    public Set<SelectOptionResDto> getSelectOption(
            @RequestParam(value = "type", defaultValue = "值域类型") String type) {
        return selectRMap.get(type);
    }

    @PostMapping(value = "/getGeneralStatistics")
    @Operation(summary = "获取数据标准的统计数据")
    //@PreAuthorize("hasAnyRole('ROLE_SUPERUSER', 'DATA_STANDARD_DASHBOARD')")
    public StatisticsDto getDomainStatistics() {
        return domainStatisticsService.getStatistics();
    }

    @PostMapping(value = "/getMonthlyStatistics")
    @Operation(summary = "获取数据标准创建的过去一年的统计数据")
    //@PreAuthorize("hasAnyRole('ROLE_SUPERUSER', 'DATA_STANDARD_DASHBOARD')")
    public DomainChartDto getMonthlyDomainStatistics() {
        return domainStatisticsService.getChartData();
    }

    @PostMapping("/domain/getHistory")
    @Operation(summary = "得到数据标准的修改历史")
    public PageResult<EditHistory> getDomainHistory(@RequestBody DomainQueryDto queryDto) {
        return domainService.getDomainHistory(queryDto.getDomainId(), queryDto.getPageSize(), queryDto.getCurrentPage());
    }


    @PostMapping(value = "/version/compareHistory")
    @Operation(summary = "比较数据标准的历史版本")
    public CommonPair<DomainDto, DomainDto> compareHistoryBetweenVersion(
            @Parameter(name = "domainId", description = "数据标准id")
            @RequestParam("domainId") String domainId,
            @Parameter(name = "srcVersion", description = "版本1")
            @RequestParam("srcVersion") Integer srcVersion,
            @Parameter(name = "tagVersion", description = "版本2")
            @RequestParam("tagVersion") Integer tagVersion) {
        return domainService.compareHistoryBetweenVersion(domainId, srcVersion, tagVersion);
    }

    /**
     * 获取比较中英文映射
     */
    @PostMapping(value = "/mapping/getColumnMapping")
    @Operation(summary = "比较中文映射")
    public Map<String, String> columnMappingToChineseName(@RequestBody DomainQueryDto queryDto) {
        Map<String, String> result = new HashMap<>();
        result.put("1_domainCode", "标准编码");
        result.put("1_chineseName", "中文名称");
        result.put("1_englishName", "英文名称");
        result.put("1_abbreviation", "英文简写");
        result.put("1_description", "业务定义");
        if (queryDto.getCategoryId() != 2) {
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
        if (queryDto.getCategoryId() == 2) {
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
        result.put("3_name", "编码中文名称");
        result.put("3_order", "顺序号");
        result.put("3_definition", "备注1");
        result.put("3_definition2", "备注2");
        result.put("3_definition3", "备注3");
        return result;
    }

    @PostMapping(value = "/column/mapping")
    @Operation(summary = "比较功能的中文映射")
    public Map<String, String> columnMappingToChineseName(
            @Parameter(name = "categoryId", description = "目标顶级目录ID")
            @RequestParam(value = "categoryId", defaultValue = "1") Long categoryId) {
        Map<String, String> result = new HashMap<>();
        result.put("1_domainCode", "标准编码");
        result.put("1_chineseName", "中文名称");
        result.put("1_englishName", "英文名称");
        result.put("1_abbreviation", "英文简写");
        result.put("1_description", "业务定义");
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
        boolean isMetrics = (categoryId == 2L || categoryId == 5L || categoryId == 6L);
        if(isMetrics) {
            result.put("1_referenceCode", "引用代码");
            result.put("1_function", "计算公式");
            result.put("1_measureUnit", "度量单位");
            result.put("1_monitorObjects", "观测对象");
            result.put("1_parentCode", "父级指标");
            result.put("1_dimCodes", "修饰维度");
            result.put("1_documentIds", "参考文档");


            result.put("1_source", "指标来源");
            result.put("1_domainCode", "指标编码");
            result.put("1_relationDomain", "来源指标");
            result.put("1_timeModifierRefs", "时间周期");
            result.put("1_modifierRefs", "修饰词");
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
}
