package com.datablau.ddd.server.controller;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.andorj.model.common.api.MessageService;
import com.datablau.ddd.common.exception.BusinessException;
import com.datablau.ddd.data.dto.PageableResult;
import com.datablau.ddd.data.dto.ProjectTypeDto;
import com.datablau.ddd.data.jpa.entity.ProjectType;
import com.datablau.ddd.server.service.api.ProjectTypeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "项目类型")
@RestController
@RequestMapping("/project/type")
public class ProjectTypeController {

    private final MessageService msgService;

    private final ProjectTypeService projectTypeService;
    public ProjectTypeController(MessageService msgService, ProjectTypeService projectTypeService) {
        this.msgService = msgService;
        this.projectTypeService = projectTypeService;
    }

    @Operation(summary = "项目类型列表", description = "项目类型列表")
    @GetMapping("/list")
    public PageableResult<ProjectType> getProjectTypeList(@RequestParam(value = "currentPage", required = false) Integer currentPage,
                                                          @RequestParam(value = "pageSize", required = false) Integer pageSize) {
        return projectTypeService.getProjectTypeList(currentPage, pageSize);
    }

    @Operation(summary = "项目类型详情", description = "项目类型详情")
    @GetMapping("/{id}")
    public ProjectType getProjectTypeInfo(@PathVariable("id") Long id) {
        return projectTypeService.getProjectTypeInfo(Collections.singletonList(id)).get(0);
    }

    @Operation(summary = "新建项目类型", description = "新建项目类型")
    @PostMapping("/add")
    public ProjectType addProjectType(@RequestBody ProjectTypeDto projectType) {
        ProjectType projectTypeDto = projectTypeService.findByTypeName(projectType.getTypeName());
        if (projectTypeDto != null) {
            throw new BusinessException(msgService.getMessage("项目类型已存在！"));
        }
        return projectTypeService.addProjectType(projectType);
    }

    @Operation(summary = "修改项目类型", description = "修改项目类型")
    @PutMapping("/update")
    public ProjectType updateProjectType(@RequestBody ProjectTypeDto projectType) {
        return projectTypeService.updateProjectType(projectType);
    }

    @Operation(summary = "删除项目类型", description = "删除项目类型")
    @DeleteMapping("/delete")
    public void deleteProjectType(@RequestParam("ids") String ids) {
        String[] id = ids.split(",");
        List<ProjectType> projectTypeInfo = projectTypeService.getProjectTypeInfo(convertStringArrayToLongList(id));
        if (projectTypeInfo.size() != id.length) {
            throw new BusinessException(msgService.getMessage("部分项目类型不存在！"));
        }
        projectTypeService.deleteById(convertStringArrayToLongList(id));
    }
    public List<Long> convertStringArrayToLongList(String[] stringArray) {
        return Arrays.stream(stringArray)
                .map(Long::parseLong)
                .toList();
    }
}
