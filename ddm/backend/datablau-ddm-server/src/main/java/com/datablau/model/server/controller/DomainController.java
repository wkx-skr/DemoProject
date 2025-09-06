package com.datablau.model.server.controller;

import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.dto.ExcelLoadJobResult;
import com.datablau.data.common.api.ExcelLoader;
import com.datablau.data.common.controller.BaseController;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.CategoryNodeDto;
import com.datablau.domain.management.dto.DomainQueryDto;
import com.datablau.domain.management.dto.DomainTreeNodeDto;
import com.datablau.domain.management.dto.LoadDomainDto;
import com.datablau.domain.management.dto.LocalDomainDto;
import com.datablau.model.data.api.LocalDomainService;
import com.datablau.model.data.dto.CodeDto;
import com.datablau.model.data.dto.CodeUsageDto;
import com.datablau.model.data.dto.DomainUsageDto;
import com.datablau.model.data.dto.LoadCodeDto;
import com.datablau.model.data.dto.LocalLoadPrivateDomainDto;
import com.datablau.model.data.dto.ModelColumnDomainApplyStatusDto;
import com.datablau.model.data.dto.PageResult;
import com.datablau.model.data.dto.PublicDomainTreeNodeDto;
import com.datablau.model.data.jpa.entity.UserDefinedDomainProperty;
import com.datablau.model.local.proto.Domain;
import com.datablau.model.local.utility.Configurations;
import com.datablau.model.local.utility.DDMUtility;
import com.datablau.model.server.dto.DomainExcelDto;
import com.datablau.model.server.utils.UploadFile;
import com.datablau.model.server.utils.proto.ProtoConverter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/10/24 0024 下午 6:21
 */
@RestController("domainController")
@ConditionalOnMissingBean(name = "domainControllerExt")
@RequestMapping("/domains")
@Tag(name = "数据标准相关REST API", description = "数据标准相关REST API")
public class DomainController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(DomainController.class);
    public static final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    protected MessageService msgService;

    @Autowired
    protected LocalDomainService localDomainService;

    @Autowired
    protected ExcelLoader excelLoader;

    @RequestMapping("/")
    @Operation(summary = "获取所有数据标准", description = "获取所有数据标准, 包括公共数据标准和私有数据标准")
    public LoadDomainDto getDomains(@Parameter(description = "公共标准最后更新时间戳") @RequestParam(name = "pubTimestamp", required = false, defaultValue = "0") Long pubTimestamp,
                                    @Parameter(description = "是否需要加载私有标准") @RequestParam(name = "loadPrivateDomain", defaultValue = "true") Boolean loadPrivateDomain,
                                    @Parameter(description = "是否将标准额外属性加载到UDP") @RequestParam(name = "loadBuildInUdp", required = false, defaultValue = "false") Boolean loadBuildInUdp) {
        return localDomainService.loadDomainsAfterTimestamp(pubTimestamp, loadPrivateDomain, loadBuildInUdp);
    }

    @RequestMapping("/proto")
    @Operation(summary = "获取所有数据标准", description = "获取所有数据标准, 包括公共数据标准和私有数据标准")
    public ResponseEntity<Domain.ProtoLoadDomainDto> getProtoDomains(@Parameter(description = "公共标准最后更新时间戳") @RequestParam(name = "pubTimestamp", required = false, defaultValue = "0") Long pubTimestamp,
                                                                     @Parameter(description = "是否需要加载私有标准") @RequestParam(name = "loadPrivateDomain", defaultValue = "true") Boolean loadPrivateDomain,
                                                                     @Parameter(description = "是否将标准额外属性加载到UDP") @RequestParam(name = "loadBuildInUdp", required = false, defaultValue = "false") Boolean loadBuildInUdp) {
        return ResponseEntity.ok(ProtoConverter.toProto(localDomainService.loadDomainsAfterTimestamp(pubTimestamp, loadPrivateDomain, loadBuildInUdp)));
    }

    @RequestMapping("/zipped")
    @Operation(summary = "获取所有数据标准", description = "获取所有数据标准, 包括公共数据标准和私有数据标准")
    public byte[] getDomainsBytes(@Parameter(description = "公共标准最后更新时间戳") @RequestParam(name = "pubTimestamp", required = false, defaultValue = "0") Long pubTimestamp,
                                  @Parameter(description = "是否需要加载私有标准") @RequestParam(name = "loadPrivateDomain", defaultValue = "true") Boolean loadPrivateDomain,
                                  @Parameter(description = "是否将标准额外属性加载到UDP") @RequestParam(name = "apiVersion", required = false, defaultValue = "false") Boolean loadBuildInUdp) throws Exception {

        return (DDMUtility.gzip(mapper.writeValueAsString(localDomainService.loadDomainsAfterTimestamp(pubTimestamp, loadPrivateDomain, loadBuildInUdp))));
    }

    @RequestMapping("/versions")
    @Operation(summary = "获取所有数据标准的历史版本", description = "获取所有数据标准的历史版本, 包括公共数据标准和领域数据标准, 私有数据标准没有历史版本")
    public Map<String, List<LocalDomainDto>> getDomainVersions(@Parameter(description = "公共标准最后更新时间戳") @RequestParam(name = "timestamp", required = false, defaultValue = "0") Long timestamp,
                                                               @Parameter(description = "是否将标准额外属性加载到UDP") @RequestParam(name = "loadBuildInUdp", required = false, defaultValue = "false") Boolean loadBuildInUdp) {
        return localDomainService.getPublicDomainVersionsAfterTimestamp(timestamp, loadBuildInUdp);
    }

    @RequestMapping("/category/{folderId}")
    @Operation(summary = "获取目录下的已发布数据标准", description = "获取目录下的已发布数据标准")
    public List<LocalDomainDto> getDomainsByCategoryId(@Parameter(description = "目录ID") @PathVariable(name = "folderId") Long folderId) {
        return localDomainService.getDomainsByFolderId(folderId);
    }

    @RequestMapping("/udps")
    @Operation(summary = "获取数据标准的用户定义属性", description = "获取数据标准的用户定义属性")
    public List<UserDefinedDomainProperty> getUdps() {
        return localDomainService.loadUdps();
    }

    @RequestMapping("/tree")
    @Operation(summary = "获取树形结构的公共数据标准", description = "获取树形结构的公共数据标准")
    public PublicDomainTreeNodeDto getPublicDomainTree(@Parameter(description = "是否需要强制从DAM同步数据标准") @RequestParam(name = "forceUpdate", defaultValue = "false") Boolean forceUpdate) {
        return localDomainService.loadPublicDomainTree(forceUpdate);
    }

    @RequestMapping("/tree/")
    @Operation(summary = "得到树形结构的数据标准", description = "得到树形结构的数据标准")
    public DomainTreeNodeDto getDomainTree(
            @Parameter(description = "数据标准状态") @RequestParam(value = "state", required = false) DomainState state,
            @Parameter(description = "分类的ID，如果不填默认就是数据标准") @RequestParam("categoryId") Long categoryId,
            @Parameter(description = "目录是否包含数据标准") @RequestParam(value = "onlyFolder", defaultValue = "true") Boolean onlyFolder) {
        return localDomainService.loadDomainTree(state, categoryId, onlyFolder);
    }

    @RequestMapping("/codes")
    @Operation(summary = "获取所有标准编码", description = "获取所有标准编码, 包括公共标准编码和私有标准编码")
    public LoadCodeDto getCodes(@Parameter(description = "是否需要强制从DAM同步标准编码") @RequestParam(value = "forceUpdate", defaultValue = "false") Boolean forceUpdate,
                                @Parameter(description = "是否获取领域标准,默认true以适应客户端，web前端传false过滤领域标准") @RequestParam(value = "getRealm", defaultValue = "true") Boolean getRealm) {
        return localDomainService.loadCodes(forceUpdate, getRealm);
    }

    @RequestMapping(value = "/private", method = RequestMethod.POST)
    @Operation(summary = "全量保存私有的数据标准",
            description = "全量保存私有的数据标准, body就是通过<strong>/domains/</strong>获取的数据结构中\"privateDomainRoot\"部分")
    public void createPrivateDomain(@RequestBody CategoryNodeDto root) {
        if (Configurations.INSTANCE.isEnablePrivateDomain()) {
            localDomainService.savePrivateDomains(root);
        }
    }

    @RequestMapping("/private/batch")
    @Operation(summary = "获取部分私有数据标准", description = "获取部分私有数据标准")
    public Collection<LocalDomainDto> getBatchOfPrivateDomains(@Parameter(description = "私有数据标准ID列表，用\";\"分隔") @RequestParam("ids") String ids) {
        if (Strings.isNullOrEmpty(ids)) {
            return Collections.emptyList();
        }

        String[] idParts = ids.split(";");
        List<String> idList = Arrays.asList(idParts);

        return localDomainService.getPrivateDomains(idList);
    }

    @RequestMapping(value = "/codes/private", method = RequestMethod.POST)
    @Operation(summary = "创建私有标准编码", description = "创建私有标准编码")
    public void createPrivateCodes(@RequestBody List<CodeDto> codes) {
        if (Configurations.INSTANCE.isEnablePrivateDomainCode()) {
            localDomainService.savePrivateCodes(codes);
        }
    }

    @RequestMapping("/private/lastupdate")
    @Operation(summary = "获取服务器端私有数据标准最后更新的时间戳", description = "获取服务器端私有数据标准最后更新的时间戳")
    public Long getPrivateDomainLastUpdateTimestamp() {
        return localDomainService.getPrivateDomainLastUpdateTime();
    }

    @RequestMapping("/codes/private/lastupdate")
    @Operation(summary = "获取服务器端私有标准编码最后更新的时间戳", description = "获取服务器端私有标准编码最后更新的时间戳")
    public Long getPrivateCodeLastUpdateTimestamp() {
        return localDomainService.getPrivateCodeLastUpdateTime();
    }

    @RequestMapping("/private")
    @Operation(summary = "获取所有的私有数据标准", description = "获取所有的私有数据标准，只有超级用户可以调用")
    public LocalLoadPrivateDomainDto getAllPrivatesDomains() {
        return localDomainService.getAllPrivateDomains();
    }

    @RequestMapping("/{domainCode}/usages")
    @Operation(summary = "获取公共数据标准的使用情况", description = "获取公共数据标准的使用情况")
    public PageResult<DomainUsageDto> getDomainUsages(
            @Parameter(description = "标准编码") @PathVariable("domainCode") String domainCode,
            @Parameter(description = "当前页码") @RequestParam("currentPage") int currentPage,
            @Parameter(description = "每页大小") @RequestParam("pageSize") int pageSize) {
        return localDomainService.getDomainUsage(domainCode, currentPage, pageSize);
    }

    @RequestMapping("/latest/page")
    @Operation(summary = "分页获取一组数据标准", description = "分页获取一组数据标准")
    public PageResult<LocalDomainDto> getPageDomains(
            @RequestBody DomainQueryDto queryDto) {
        return localDomainService.getPageDomains(queryDto);
    }

    @RequestMapping("/private/{domainId}/usages")
    @Operation(summary = "获取私有数据标准的使用情况", description = "获取私有数据标准的使用情况")
    public PageResult<DomainUsageDto> getPrivateDomainUsages(
            @Parameter(description = "私有数据标准ID") @PathVariable("domainId") String domainId,
            @Parameter(description = "当前页码") @RequestParam("currentPage") int currentPage,
            @Parameter(description = "每页大小") @RequestParam("pageSize") int pageSize) {
        return localDomainService.getPrivateDomainUsage(domainId, currentPage, pageSize);
    }

    @RequestMapping("/code/{code}/usages")
    @Operation(summary = "获取被字段直接引用的标准代码的使用情况", description = "获取被字段直接引用的标准代码的使用情况")
    public PageResult<CodeUsageDto> getCodeUsages(
            @Parameter(description = "标准代码") @PathVariable("code") String code,
            @Parameter(description = "当前页码") @RequestParam("currentPage") int currentPage,
            @Parameter(description = "每页大小") @RequestParam("pageSize") int pageSize) {
        return localDomainService.getCodeUsage(code, currentPage, pageSize);
    }

    @RequestMapping("/models/{modelId}/details")
    @Operation(summary = "获取模型使用数据标准的具体情况", description = "获取模型使用数据标准的具体情况,  返回值解释: Model ID = mId;\\\"\\n\" +\n" +
            "            \"            + \\\"Element ID = eId;\\\"\\n\" +\n" +
            "            \"            + \\\"Column name = cN;\\\"\\n\" +\n" +
            "            \"            + \\\"Column Alias = cA;\\\"\\n\" +\n" +
            "            \"            + \\\"Table name = tN;\\\"\\n\" +\n" +
            "            \"            + \\\"Table alias = tA;\\\"\\n\" +\n" +
            "            \"            + \\\"Domain en name = dEn;\\\"\\n\" +\n" +
            "            \"            + \\\"Domain ch name = dCn;\\\"\\n\" +\n" +
            "            \"            + \\\"Domain subject = dSub;\\\"\\n\" +\n" +
            "            \"            + \\\"Domain ID = dId;\\\"\\n\" +\n" +
            "            \"            + \\\"Is public domai = isP;")
    public List<ModelColumnDomainApplyStatusDto> getModelApplyDomainStatus(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        return localDomainService.getModelApplyDomainStatus(modelId);
    }

    @RequestMapping("/{domainCode}")
    @Operation(summary = "通过标准编码获取数据标准", description = "通过标准编码获取数据标准")
    public LocalDomainDto getDomainByDomainCode(@Parameter(description = "编码值") @PathVariable("domainCode") String domainCode,
                                                @Parameter(description = "编码值是标准编码还是标准ID， false为标准编码， true为标准ID") @RequestParam(name = "inAll", defaultValue = "false") boolean byId) {
        if (byId) {
            return localDomainService.getDomain(domainCode);
        } else {
            return localDomainService.getPublicDomain(domainCode);
        }
    }

    @RequestMapping(value = "/namemap", method = RequestMethod.POST)
    @Operation(summary = "通过标准ID获取数据标准名字列表", description = "通过标准ID获取数据标准名字列表")
    public Map<String, String> getDomainNameMapByIds(@Parameter(description = "数据标准ID") @RequestBody List<String> domainIds) {
        return localDomainService.getDomainNameMapByIds(domainIds);
    }

    @RequestMapping("/private/users")
    @Operation(summary = "获取拥有私有数据标准的用户名列表", description = "获取拥有私有数据标准的用户名列表")
    public List<String> getPrivateDomainUserList() {
        return localDomainService.getPrivateDomainUserList();
    }

    @RequestMapping("/private/users/{username}/")
    @Operation(summary = "获取用户收到的信息的简略信息", description = "获取用户收到的信息的简略信息")
    public CategoryNodeDto getPrivateDomainsOfUser(@Parameter(description = "用户名") @PathVariable("username") String username) {
        return localDomainService.getUserPrivateDomains(username);
    }

    @RequestMapping(value = "/public", method = RequestMethod.POST)
    @Operation(summary = "发布标准到公共标准", description = "发布标准到公共标准")
    public void publishDomains(@Parameter(description = "数据标准") @RequestBody List<LocalDomainDto> domainDtos) {
        if (domainDtos.isEmpty() || !Configurations.INSTANCE.isEnablePublishDomain()) {
            return;
        }
        localDomainService.publishDomains(domainDtos);
    }


    @RequestMapping(value = "/codes/public", method = RequestMethod.POST)
    @Operation(summary = "发布标准编码到公共标准编码",
            description = "发布标准编码到公共标准编码，注意，对于数据库已经存在的相同的代码的编码将会被覆盖")
    public void publishCodes(@Parameter(description = "标准编码") @RequestBody List<CodeDto> codeDtos) {
        if (codeDtos.isEmpty() || !Configurations.INSTANCE.isEnablePublishDomainCode()) {
            return;
        }
        localDomainService.publishCodes(codeDtos);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/upload/domain")
    @Operation(summary = "导入数据标准",
            description = "导入数据标准, 必须有[标准UUID]列和[标准编码]列, 会以[标准UUID]作为标准的唯一标志更新已有标准")
    public void uploadDomains(@Parameter(description = "导入数据标准的excel文件") @RequestParam("file") MultipartFile multipartFile) throws Exception {
        if (Configurations.INSTANCE.isDamConnectable()) {
            logger.warn("dam is set to connected. so do not import domains here.");
            return;
        }

        String filePath = UploadFile.uploadFile(multipartFile).getAbsolutePath();
        ExcelLoadJobResult<DomainExcelDto> loadJobResult = excelLoader.loadFile(filePath, 0, DomainExcelDto.class);
        localDomainService.publishDomains(convertToLocalDomain(loadJobResult.getLoaded()));
    }

    @RequestMapping(method = RequestMethod.GET, value = "/domain/template")
    //@AuditLog
    @Operation(summary = "导出数据标准模板", description = "导出数据标准模板")
    public void exportCodeTemplate(HttpServletResponse response) throws Exception {
        String webRoot = DDMUtility.getResourcePath("/");

        File file = new File(webRoot + "domains/" + msgService.getMessage("domainDdmTemplateFile"));
        response.setContentType("application/octet-stream");

        String realName = "";

        try {
            realName = URLEncoder.encode(msgService.getMessage("domainDdmTemplate"), "UTF-8");
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

    protected List<LocalDomainDto> convertToLocalDomain(List<DomainExcelDto> domains) {

        List<LocalDomainDto> rs = new ArrayList<>();
        for (DomainExcelDto domainExcelDto : domains) {
            LocalDomainDto result = new LocalDomainDto();
            result.setId(domainExcelDto.getDomainId());
            result.setDomainCode(domainExcelDto.getDomainCode());
            result.setChName(domainExcelDto.getChineseName());
            result.setEnName(domainExcelDto.getEnglishName());
            result.setAbbrivation(domainExcelDto.getAbbreviation());
            result.setDescription(domainExcelDto.getDescription());
            result.setReferenceCode(domainExcelDto.getReferenceCode());
            result.setDataType(domainExcelDto.getDataType());
            result.setDataScale(domainExcelDto.getDataScale());
            result.setDataPrecision(domainExcelDto.getDataPrecision());
            if (Strings.isNullOrEmpty(domainExcelDto.getNotNullStr())) {
                result.setNotNull(null);
            } else if (domainExcelDto.getNotNullStr().equals("是") || domainExcelDto.getNotNullStr().toLowerCase().equals("true")) {
                result.setNotNull(true);
            } else if (domainExcelDto.getNotNullStr().equals("否") || domainExcelDto.getNotNullStr().toLowerCase().equals("false")) {
                result.setNotNull(false);
            } else {
                throw new IllegalArgumentException(msgService.getMessage("propertyCanOnlyBeYesOrNo"));
            }

            if (!Strings.isNullOrEmpty(domainExcelDto.getPath())) {
                List<String> path = new LinkedList<>();
                String[] domainPathStr = domainExcelDto.getPath().split("/");
                for (String domainPath : domainPathStr) {
                    path.add(domainPath);
                }
                result.setPath(path);
            }

            rs.add(result);
        }
        return rs;
    }


    @RequestMapping(method = RequestMethod.POST, value = "/upload/domain/code")
    @Operation(summary = "导入标准代码文件", description = "导入标准代码文件")
    public Integer uploadCodeExcel(@Parameter(description = "导入标准代码的excel文件") @RequestParam("file") MultipartFile multipartFile)
            throws Exception {
        if (Configurations.INSTANCE.isDamConnectable()) {
            logger.warn("dam is set to connected. so do not import codes here.");
            return 0;
        }

        File uploadedFile = UploadFile.uploadFile(multipartFile);
        try {
            Integer domainCount =
                    localDomainService.loadCodesFromFile(uploadedFile);
            return domainCount;
        } finally {
            uploadedFile.delete();
        }
    }
}
