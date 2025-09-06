package com.datablau.model.server.controller;


import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.dto.ExcelLoadJobResult;
import com.datablau.data.common.api.ExcelLoader;
import com.datablau.data.common.controller.BaseController;
import com.datablau.domain.management.dto.NamingStandardDto;
import com.datablau.domain.management.dto.NamingStandardQueryDto;
import com.datablau.model.data.api.NamingStandardService;
import com.datablau.model.data.dto.LoadNamingStandardDto;
import com.datablau.model.data.dto.NamingStandardExcelDto;
import com.datablau.model.data.dto.PageResult;
import com.datablau.model.data.jpa.entity.PrivateNamingStandard;
import com.datablau.model.data.jpa.entity.PublicNamingStandard;
import com.datablau.model.local.utility.Configurations;
import com.datablau.model.server.utils.UploadFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/10/31 0031 上午 11:09
 */
@RestController("namingStandardController")
@ConditionalOnMissingBean(name = "namingStandardControllerExt")
@RequestMapping("/namingstandards")
@Tag(name = "命名标准相关REST API", description = "命名标准相关REST API")
public class NamingStandardController extends BaseController {

    @Autowired
    protected MessageService msgService;

    @Autowired
    protected NamingStandardService namingStandardService;

    @Autowired
    protected ExcelLoader excelLoader;

    @RequestMapping("/")
    @Operation(summary = "获取所有命名标准", description = "获取所有命名标准")
    @Parameters({@Parameter(name = "loadPublicTimestamp", description = "客户端上次获取的公共命名标准的最后时间戳", in = ParameterIn.QUERY),
            @Parameter(name = "forceUpdate", description = "是否强制从DAM端同步更新命名标准", in = ParameterIn.QUERY),
            @Parameter(name = "loadPrivateTimestamp", description = "客户端上次获取的私有命名标准的最后时间戳", in = ParameterIn.QUERY)})
    public LoadNamingStandardDto getNamingStandards(
            @RequestParam(value = "loadPublicTimestamp", required = false) Long loadPublicTimestamp,
            @RequestParam(value = "forceUpdate", required = false, defaultValue = "false") Boolean forceUpdate,
            @RequestParam(value = "loadPrivateTimestamp", required = false) Long loadPrivateTimestamp) {
        return namingStandardService
                .loadNamingStandards(loadPublicTimestamp, loadPrivateTimestamp, forceUpdate);
    }

    @RequestMapping(value = "/private", method = RequestMethod.POST)
    @Operation(summary = "上传用户的自定义命名标准", description = "上传用户的自定义命名标准")
    public void updatePrivateNamingStandards(@Parameter(description = "命名标准", required = true) @RequestBody List<NamingStandardDto> standards,
                                             @RequestParam(value = "autoSync", required = false, defaultValue = "true") Boolean autoSync) {
        namingStandardService.savePrivateNamingStandards(standards, autoSync);
    }

    @RequestMapping("/private")
    @Operation(summary = "搜索私有命名标准", description = "搜索私有命名标准")
    @Parameters({@Parameter(name = "keyword", description = "关键字", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "pageSize", description = "每页大小", in = ParameterIn.QUERY, required = true)})
    public PageResult<PrivateNamingStandard> getPrivateNamingStandards(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam("currentPage") Integer currentPage,
            @RequestParam("pageSize") Integer pageSize) {
        return namingStandardService.getPrivateNamingStandards(keyword, currentPage, pageSize);
    }

    @RequestMapping("/public")
    @Operation(summary = "搜索公共命名标准", description = "搜索公共命名标准")
    @Parameters({@Parameter(name = "keyword", description = "关键字", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "pageSize", description = "每页大小", in = ParameterIn.QUERY, required = true)})
    public PageResult<PublicNamingStandard> getPublicNamingStandards(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam("currentPage") Integer currentPage,
            @RequestParam("pageSize") Integer pageSize) {
        return namingStandardService.getPublicNamingStandards(keyword, currentPage, pageSize);
    }

    @RequestMapping(value = "/public", method = RequestMethod.POST)
    @Operation(summary = "发布私有命名标准到公共命名标准", description = "发布私有命名标准到公共命名标准")
    public void publishNamingStandards(@Parameter(description = "命名标准", required = true) @RequestBody List<NamingStandardDto> namingStandards) {
        namingStandardService.publishNamingStandards(convertToPublicNamingStandards(namingStandards));
    }

    @RequestMapping(value = "/search", method = RequestMethod.POST)
    @Operation(summary = "查询命名标准", description = "查询命名标准")
    public PageResult<NamingStandardDto> getNamingStandards(@Parameter(description = "命名标准", required = true) @RequestBody NamingStandardQueryDto queryDto) {
        return namingStandardService.getPageOfNamingStandard(queryDto);
    }

    protected List<PublicNamingStandard> convertToPublicNamingStandards(Collection<NamingStandardDto> namingStandardDtos) {
        List<PublicNamingStandard> result = new ArrayList<>(namingStandardDtos.size());
        for (NamingStandardDto namingStandardDto : namingStandardDtos) {
            result.add(convertToPublicNamingStandard(namingStandardDto));
        }

        return result;
    }

    protected PublicNamingStandard convertToPublicNamingStandard(NamingStandardDto namingStandardDto) {
        PublicNamingStandard standard = new PublicNamingStandard();
        standard.setEnglishName(namingStandardDto.getEnglishName());
        standard.setChineseName(namingStandardDto.getChineseName());
        standard.setAbbreviation(namingStandardDto.getAbbreviation());
        standard.setCategory(namingStandardDto.getCategory());

        return standard;
    }


    @RequestMapping(method = RequestMethod.POST, value = "/upload")
    @Operation(summary = "导入excel", description = "导入excel")
    public void uploadNamingStandards(@Parameter(description = "导入excel文件", required = true) @RequestParam("file") MultipartFile multipartFile) throws Exception {
        if (!Configurations.INSTANCE.isEnablePublishDomain() || Configurations.INSTANCE.isDamConnectable()) {
            return;
        }

        String filePath = UploadFile.uploadFile(multipartFile).getAbsolutePath();
        ExcelLoadJobResult<NamingStandardExcelDto> result = excelLoader.loadFile(filePath, 0, NamingStandardExcelDto.class);
        List<NamingStandardExcelDto> namingStandards = result.getLoaded();
        if (namingStandards != null && !namingStandards.isEmpty()) {
            namingStandardService.publishNamingStandards(convertNamingStandardDtos(namingStandards));
        }
    }

    protected List<NamingStandardDto> convertNamingStandardDtos(List<NamingStandardExcelDto> namingStandards) {
        List<NamingStandardDto> namingStandardDtos = new ArrayList<>();
        if (namingStandards == null) {
            return null;
        }
        for (NamingStandardExcelDto namingStandard : namingStandards) {
            NamingStandardDto namingStandardDto = new NamingStandardDto();
            namingStandardDto.setAbbreviation(namingStandard.getAbbreviation());
            namingStandardDto.setEnglishName(namingStandard.getEnglishName());
            namingStandardDto.setCategory(namingStandard.getCategory());
            namingStandardDto.setChineseName(namingStandard.getChineseName());
            namingStandardDtos.add(namingStandardDto);
        }
        return namingStandardDtos;
    }
}
