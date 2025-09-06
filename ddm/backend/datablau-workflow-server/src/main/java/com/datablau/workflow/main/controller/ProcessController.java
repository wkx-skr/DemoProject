package com.datablau.workflow.main.controller;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import com.datablau.workflow.common.entity.dto.FlowElementDto;
import com.datablau.workflow.common.entity.dto.ProcessDefinitionDto;
import com.datablau.workflow.common.utils.PageVo;
import com.datablau.workflow.main.service.ProcessCommonService;
import com.datablau.workflow.main.service.ProcessService;
import java.util.Base64;

import com.datablau.workflow.main.util.ServerConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLDecoder;
import java.util.List;
import java.util.Map;

/**
 * 流程相关操作api
 */
@RestController
@RequestMapping("/process")
public class ProcessController extends BaseController {

    @Autowired
    private ProcessService processService;
    @Autowired
    private ProcessCommonService processCommonService;

    public ProcessController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }


    /**
     * 获取流程列表
     * @param pageSize 每页大小
     * @param currentPage 当前页数
     * @param name 流程名称
     * @return 返回分页数据
     */
    @RequestMapping(value = "/", method = RequestMethod.GET)
    public PageVo<ProcessDefinitionDto> getProcessList(
            @RequestParam(value = "pageSize", required = false) Integer pageSize,
            @RequestParam(value = "currentPage", required = false) Integer currentPage,
            @RequestParam(value = "name", required = false) String name) {
        try {
            name = URLDecoder.decode(name, "UTF-8");
        } catch (Exception ignored) {

        }
        return processService.getProcessList(pageSize, currentPage, name);

    }

    /**
     * 发起流程前调用该方法，获取表单数据以及流程信息
     * @param proDefId 流程定义id
     * @return 返回表单数据、流程信息
     */
    @RequestMapping(value = "/start/{proDefId}", method = RequestMethod.GET)
    public Map<String, Object> startPage(@PathVariable("proDefId") String proDefId) {
        try {
            proDefId = URLDecoder.decode(proDefId, "UTF-8");
        } catch (Exception ignored) {

        }
        return processService.startPage(proDefId);
    }

    /**
     * 获取流程图
     * @param processInstanceId 流程实例id
     * @return 返回图片数据
     * @throws AndorjRuntimeException 获取失败抛出异常
     */
    @RequestMapping(value = "/image", method = RequestMethod.GET)
    public String getImage(@RequestParam("processInstanceId") String processInstanceId) {
        try {
            processInstanceId = URLDecoder.decode(processInstanceId, "UTF-8");
        } catch (Exception ignored) {

        }
        try {
            byte[] processImage = processCommonService.traceProcessImage(processInstanceId);

            return Base64.getEncoder().encodeToString(processImage);
        } catch (Exception e) {
            throw new AndorjRuntimeException(e.getMessage());
        }
    }

    /**
     * 删除流程实例
     * @param processInstanceId 流程实例id
     */
    @RequestMapping(value = "/instance/delete", method = RequestMethod.GET)
    public void deleteProcessInstance(@RequestParam("processInstanceId") String processInstanceId) {
        try {
            processInstanceId = URLDecoder.decode(processInstanceId, "UTF-8");
        } catch (Exception ignored) {

        }
        processService.deleteProcessInstance(processInstanceId);
    }

    /**
     * 获取流程的用户节点
     * @param processDefinitionId 流程定义id
     * @return 返回用户节点集合
     */
    @RequestMapping(value = "/elements", method = RequestMethod.GET)
    public List<FlowElementDto> getUserTaskFlowElement(@RequestParam("processDefinitionId") String processDefinitionId) {
        return processService.getUserTaskFlowElement(processDefinitionId);
    }

    /**
     * 撤销流程申请
     * @param processInstanceId 流程实例id
     */
    @RequestMapping(value = "/revoke", method = RequestMethod.GET)
    public void revokeApplyProcessInstance(@RequestParam("processInstanceId") String processInstanceId) {
        processService.revokeApplyProcessInstance(processInstanceId);
    }

}
