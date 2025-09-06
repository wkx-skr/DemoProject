package com.datablau.model.server.controller;

import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.DepartmentService;
import com.datablau.model.data.jpa.entity.Department;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/10/11 0011 下午 3:02
 */
@RestController("departmentController")
@ConditionalOnMissingBean(name = "departmentControllerExt")
@RequestMapping("/departments")
@Tag(name = "部门相关REST API(未使用)", description = "部门相关REST API(未使用)")
public class DepartmentController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(DepartmentController.class);

    @Autowired
    protected DepartmentService departmentService;

    @Autowired
    protected MessageService msgService;

    @RequestMapping("/")
    @Operation(summary = "获取部门信息", description = "获取部门信息")
    public List<Department> getDepartments() {
        return departmentService.getDepartments();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "创建部门", description = "创建部门")
    public Department createDepartment(@RequestBody Department department) {
        if (department.getParentId() == null || department.getParentId() < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }

        return departmentService.createDepartment(department);
    }

    @RequestMapping(value = "/{departmentId}", method = RequestMethod.PUT)
    @Operation(summary = "部门重命名", description = "部门重命名")
    public Department renameDepartment(@Parameter(description = "部门ID") @PathVariable("departmentId") Long departmentId,
                                       @RequestBody Department department) {
        if (departmentId == null || departmentId < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }

        return departmentService.updateDepartment(departmentId, department.getName(), department.getDescription());
    }

    @RequestMapping(value = "/{departmentId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除指定部门", description = "删除指定部门")
    public void deleteDepartment(@Parameter(description = "部门ID") @PathVariable("departmentId") Long departmentId) {
        if (departmentId == null || departmentId < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }

        departmentService.deleteDepartment(departmentId);
    }
}
