package com.datablau.base.server.controller;

import com.datablau.base.api.InstantJobDao70;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStatus;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author nicky - 数语科技有限公司
 * date 2022/9/30 15:38
 */
@RestController
@RequestMapping("/instantJob")
public class InstantJobController extends BaseController {

    @Autowired
    private InstantJobDao70 instantJobService;

    public InstantJobController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "获取用户的所有临时任务列表")
    @PostMapping("/getJobs")
    public List<InstantJobStatus> getUserJobStatus() {
        return instantJobService.getUserJobs(AuthTools.currentUsernameFailFast());
    }

    @Operation(summary = "获取用户的所有临时任务列表")
    @PostMapping("/getJobs/type")
    public List<InstantJobStatus> getUserJobStatus(@RequestParam("type") String type) {
        return instantJobService.getUserJobs(AuthTools.currentUsernameFailFast(),type);
    }

    @Operation(summary = "获取特定任务的结果")
    @Parameters({@Parameter(name = "jobId", description = "任务的id", in = ParameterIn.QUERY, required = true)})
    @PostMapping("/getJobResult")
    public InstantJobResult getJobResult(@RequestParam("jobId") String jobId) {
        return instantJobService.getJobResult(jobId);
    }

    @Operation(summary = "获取特定任务的状态")
    @Parameters({@Parameter(name = "jobId", description = "任务的id", in = ParameterIn.QUERY, required = true)})
    @PostMapping("/getJobStatus")
    public InstantJobStatus getJobStatus(@RequestParam("jobId")String jobId) {
        return instantJobService.getJobStatus(jobId);
    }

    @Operation(summary = "删除用户的一个任务，包括结果")
    @Parameters({@Parameter(name = "jobId", description = "任务的id", in = ParameterIn.QUERY, required = true)})
    @PostMapping("/deleteJob")
    public void deleteJob(@RequestParam("jobId")String jobId) {
        instantJobService.deleteJob(jobId);
    }

    @Operation(summary = "删除用户的一个导入任务，包括结果")
    @Parameters({@Parameter(name = "jobId", description = "任务的id", in = ParameterIn.QUERY, required = true)})
    @PostMapping("/deleteImportJob")
    public void deleteImportJob(@RequestParam("jobId")String jobId) {
        instantJobService.deleteImportJob(jobId);
    }
}
