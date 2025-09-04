package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.datablau.data.common.controller.BaseController;
import com.datablau.metadata.common.dto.SimpleJobStatusDto;
import com.datablau.metadata.main.service.SimpleJobService;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/3/28 15:44
 */
@RestController
@RequestMapping("/simplejobs")
@Description("获取简单任务状态的REST API")
@Tag(name = "获取简单任务状态的REST API")
//@Feature(LicenseInfo.FE_BASE)
public class SimpleJobController extends BaseController {

    @Autowired
    private SimpleJobService simpleJobService;

    public SimpleJobController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @RequestMapping("/status")
    @Description("得到任务的状态")
    @Operation(summary = "得到任务的状态")
    public SimpleJobStatusDto getJobStatus(@Parameter(name = "jobId") @RequestParam("jobId")Long jobId) {
        return simpleJobService.getJobStatus(jobId);
    }
}
