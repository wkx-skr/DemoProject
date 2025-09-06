package com.datablau.model.server.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.SubjectService;
import com.datablau.model.data.dto.TableRefDto;
import com.datablau.model.data.dto.SubjectDto;
import com.datablau.model.data.jpa.entity.Subject;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * @author qingminyan
 */
@RestController
@RequestMapping(value = "/subject")
public class SubjectController extends BaseController {

    @Resource
    SubjectService subjectService;


    /**
     * 主题树
     *
     * @return SubjectDto
     */
    @Operation(summary = "主题树", description = "主体树")
    @GetMapping("/tree")
    public SubjectDto getTree() {
        return subjectService.getTree();
    }

    /**
     * 根据id获取主题
     *
     * @param id 主题ID
     * @return Subject
     */
    @Operation(summary = "根据id获取主题", description = "根据id获取主题")
    @GetMapping("/{id}")
    public Subject getSubject(@PathVariable(value = "id") @NotNull Long id) {

        return subjectService.getSubjectById(id);
    }

    /**
     * 根据parentId获取主题
     *
     * @param parentId 父id
     * @return List<Subject>
     */
    @Operation(summary = "根据parentId获取主题", description = "根据parentId获取主题")
    @GetMapping("/parent/{parentId}")
    public List<Subject> getSubjectByParentId(@PathVariable(value = "parentId") @NotNull Long parentId) {
        return subjectService.getSubjectByParentId(parentId);
    }

    /**
     * 创建主题，同一级别不允许有重名主题
     *
     * @param subject 主题
     * @return Subject
     */
    @Operation(summary = "创建主题", description = "创建主题")
    @PostMapping
    public Subject createSubject(@RequestBody @Validated Subject subject) {
        return subjectService.createSubject(subject);
    }

    /**
     * 更新主题
     *
     * @param subject 主题
     * @return Subject
     */
    @Operation(summary = "更新主题", description = "更新主题")
    @PutMapping
    public Subject updateSubject(@RequestBody @Validated Subject subject) {
        return subjectService.updateSubject(subject);
    }

    /**
     * 删除主题
     *
     * @param id 主题ID
     */
    @Operation(summary = "删除主题", description = "删除主题")
    @DeleteMapping("/{id}")
    public void deleteSubject(@PathVariable(value = "id") Long id) {
        subjectService.deleteSubject(id);
    }


    /**
     * 获取主题下绑定的表
     *
     * @param subjectId 主题ID
     */
    @Operation(summary = "获取主题下绑定的表", description = "获取主题下绑定的表")
    @GetMapping("/{subjectId}/tables")
    public List<TableRefDto> getTables(@PathVariable(value = "subjectId") Long subjectId) {
        return subjectService.getTables(subjectId);
    }

}

