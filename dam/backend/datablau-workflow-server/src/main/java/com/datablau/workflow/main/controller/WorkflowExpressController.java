package com.datablau.workflow.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.annotation.EndpointDoc;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import com.datablau.workflow.main.entity.WorkflowExpress;
import com.datablau.workflow.main.service.WorkflowExpressService;
import com.datablau.workflow.main.service.express.parser.UserExpressParser;
import com.datablau.workflow.main.util.ServerConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * 表达式相关api
 */
@RestController
@RequestMapping("/express")
@Description("表达式相关api")
public class WorkflowExpressController extends BaseController {

    @Autowired
    private WorkflowExpressService expressService;

    public WorkflowExpressController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    /**
     * 创建表达式
     */
    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Description("创建表达式")
    @EndpointDoc(bodyExample = "{\n"
                    + "    \"expressName\" : \"机构为1233的平台管理员\",\n"
                    + "    \"express\" : \"organization(1233).users.role(平台管理员)\"\n"
                    + "}")
    public void create(@RequestBody WorkflowExpress workflowExpress) {
        expressService.createWorkflowExpress(workflowExpress);
    }

    /**
     * 修改表达式
     */
    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    @Description("修改表达式")
    @EndpointDoc(bodyExample = "{\n"
                    + "    \"expressName\" : \"机构为1233的平台管理员\",\n"
                    + "    \"express\" : \"organization(1233).users.role(平台管理员)\"\n"
                    + "}")
    public void modify(@PathVariable() Long id,
                       @RequestBody WorkflowExpress workflowExpress) {
        workflowExpress.setId(id);
        expressService.modifyWorkflowExpress(workflowExpress);
    }

    /**
     * 删除表达式
     */
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    @Description("删除表达式")
    public void delete(@PathVariable() Long id) {
        expressService.deleteWorkflowExpress(id);
    }

    /**
     * 查询表达式
     */
    @RequestMapping(value = "/", method = RequestMethod.GET)
    @Description("查询表达式")
    @EndpointDoc(responseExample = "[\n"
                    + "    {\n"
                    + "        \"id\": 1,\n"
                    + "        \"expressName\": \"机构为1233的平台管理员\",\n"
                    + "        \"express\": \"organization(1233).users.role(平台管理员)\",\n"
                    + "        \"buildIn\": false\n"
                    + "    }\n"
                    + "]")
    public List<WorkflowExpress> findAll() {
        return expressService.findAllWorkflowExpress();
    }

    /**
     * 测试表达式
     * 注：从表单中取值的无法测试
     */
    @RequestMapping(value = "/test", method = RequestMethod.POST)
    @Description("查询表达式")
    @EndpointDoc(
            bodyExample = "{\n"
                    + "    \"express\" : \"organization(1233).users.role(平台管理员).title(研发)\"\n"
                    + "}",
            responseExample = "[\n"
                    + "    \"admin\"\n"
                    + "]")
    public List<String> test(@RequestBody WorkflowExpress workflowExpress) {
        return new UserExpressParser(new ArrayList<>()).parser(workflowExpress.getExpress());
    }

}
