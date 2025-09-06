package com.datablau.workflow.main.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.utils.AuthTools;
import com.datablau.workflow.common.api.DatablauRemoteWorkflowService;
import com.datablau.workflow.common.entity.dto.query.TaskQueryDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * @program: datablau-workflow
 * @description:
 * @author: wang tong
 * @create: 2023-12-21 15:17
 **/
@RestController
@RequestMapping("/dashboard")
public class DashboardController extends BaseController {

    @Autowired
    private DatablauRemoteWorkflowService workflowService;


    @RequestMapping("/workbench/tasks")
    public Map<String, Long> getWorkbenchTasks(@RequestBody TaskQueryDto queryDto) {
        //获取workflow的待办事项
        String username = AuthTools.currentUsernameFailFast();
        queryDto.setUsername(username);
        Map<String, Long> applyType = workflowService
                .getTaskAssigneeByApplyType(queryDto);
        //获取数据服务的待办事项
//        if(AuthTools.hasAnyRole("API_DEVELOP_AUTH")){
//            DdsApiService apiService = getDdsApiService();
//            if(apiService != null){
//                applyType.put("数据服务", apiService.countByStatus(WorkFlowConstants.TASK_CREATE));
//            }
//        }
        return applyType;
    }


}
