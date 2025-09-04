package com.datablau.dataSecurity.controller;

import com.andorj.common.data.PageResult;
import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.dto.DataSecurityRegulationDto;
import com.datablau.dataSecurity.dto.DataSecurityRegulationValueDto;
import com.datablau.dataSecurity.jpa.entity.DataSecurityRegulation;
import com.datablau.dataSecurity.service.api.DataSecurityRegulationService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

/**
 * Description: new java files header..
 *
 * @author liuhao
 * @version 1.0
 * @date 2022/10/18 11:42
 */
@RestController
@RequestMapping("/datasecurity/regulation")
public class DataSecurityRegulationController extends BaseController {
    @Autowired
    private DataSecurityRegulationService dataSecurityRegulationService;
    @Autowired
    private DDSKafkaLogUtil logUtils;

    public DataSecurityRegulationController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "添加法规条文")
    @PostMapping("/add")
    public void add(DataSecurityRegulationDto regulationDto) {
        dataSecurityRegulationService.addRegulation(AuthTools.currentUsernameFailFast(), regulationDto);
        logUtils.uploadSecurityRegulation(regulationDto,getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "下载法规条文")
    @PostMapping("/download/{regulationId}")
    public void download(HttpServletResponse response, @PathVariable("regulationId") Long regulationId) throws IOException {
        DataSecurityRegulation regulation = dataSecurityRegulationService.getRegulation(regulationId);
        DataSecurityRegulationDto regulationDto = new DataSecurityRegulationDto();
        BeanUtils.copyProperties(regulation,regulationDto);
        regulationDto.setFileName(regulation.getSourceName());
        logUtils.downloadSecurityRegulation(regulationDto,getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());

        ByteArrayInputStream byteIS = new ByteArrayInputStream(regulation.getRegulation());
        BufferedInputStream bufferIS = new BufferedInputStream(byteIS);
        OutputStream os = new BufferedOutputStream(response.getOutputStream());
        response.setHeader("Content-Disposition", "attachment; filename=" + regulation.getSourceName());
        response.setContentType("application/force-download");
        byte[] bytes = new byte[1024];
        int len = 0;
        while ((len = bufferIS.read(bytes)) != -1) {
            os.write(bytes, 0, len);
        }
        bufferIS.close();
        os.flush();
        os.close();
    }

    @Operation(summary = "查看法规详情")
    @GetMapping("/detail/{regulationId}")
    public ResResultDto<DataSecurityRegulationValueDto> detail(@PathVariable("regulationId") Long regulationId) {
        DataSecurityRegulationValueDto dataSecurityRegulationValueDto = dataSecurityRegulationService.getDetail(regulationId);
        return ResResultDto.ok(dataSecurityRegulationValueDto);
    }

    @Operation(summary = "根据条件获取法规条文列表")
    @PostMapping("/search")
    public ResResultDto<PageResult<DataSecurityRegulationValueDto>> getListByCondition(@RequestBody DataSecurityRegulationDto regulationDto) {
        PageResult<DataSecurityRegulationValueDto> result = dataSecurityRegulationService.searchRegulation(regulationDto);
        return ResResultDto.ok(result);
    }

    @Operation(summary = "删除法规条文")
    @DeleteMapping("/{regulationId}")
    public ResResultDto<Boolean> delete(@PathVariable("regulationId") Long regulationId) {
        DataSecurityRegulation regulation = dataSecurityRegulationService.getRegulation(regulationId);
        DataSecurityRegulationDto regulationDto = new DataSecurityRegulationDto();
        BeanUtils.copyProperties(regulation,regulationDto);
        Boolean res = dataSecurityRegulationService.deleteById(regulationId);
        if (res) {
            regulationDto.setFileName(regulation.getSourceName());
            logUtils.deleteSecurityRegulation(regulationDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        }
        return ResResultDto.ok(res);
    }

    @Operation(summary = "删除法规条文")
    @PostMapping("/")
    public ResResultDto<List<String>> delete(@RequestBody List<Long> regulationIds) {
        return ResResultDto.ok(dataSecurityRegulationService.deleteBatch(regulationIds));
    }
}
