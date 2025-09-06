package com.datablau.archy.server.controller;

import com.datablau.archy.common.enums.ArchyType;
import com.datablau.archy.server.dto.ArchySubjectDto;
import com.datablau.archy.server.jpa.entity.ArchySubject;
import com.datablau.archy.server.jpa.entity.ArchyUdp;
import com.datablau.archy.server.service.ArchySubjectService;
import com.datablau.archy.server.service.ArchyUdpService;
import com.datablau.data.common.controller.BaseController;

import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @Author yudonghai - 北京数语科技有限公司
 * @Date 2022/7/20 18:52
 */
@RestController
@RequestMapping("/subject")
@Tag(name = "Archy主题相关REST API", description = "Archy主题相关REST API")
public class ArchySubjectController extends BaseController {

    @Autowired
    private ArchySubjectService archySubjectService;

    @Autowired
    private ArchyUdpService archyUdpService;

    @Operation(summary = "查询主题")
    @GetMapping("/subjects")
    public Page<ArchySubject> findArchySubjectsByKeyword(@Parameter(description = "主题名") @RequestParam(name = "name", required = false) String keyword,
                                                         @Parameter(description = "当前页，默认值是1") @RequestParam(name = "currentPage", required = false, defaultValue = "1") Integer currentPage,
                                                         @Parameter(description = "页面大小") @RequestParam(name = "pageSize", required = false, defaultValue = "9999") Integer pageSize) {
        if (Strings.isNullOrEmpty(keyword)) {
            return archySubjectService.findArchySubjects(PageRequest.of(currentPage - 1, pageSize));
        } else {
            return archySubjectService.findArchySubjectsByKeyword(keyword, PageRequest.of(currentPage - 1, pageSize));
        }
    }

    @Operation(summary = "查询主题树,旧接口给客户端使用")
    @GetMapping("/subjects/tree")
    public List<ArchySubjectDto> findArchySubjectsList() {
        return archySubjectService.findArchySubjectsList();
    }

    @Operation(summary = "查询主题树，新接口")
    @GetMapping("/subject/tree")
    public List<ArchySubject> findArchySubjectTree(@Parameter(description = "是否查询目录下的业务对象") @RequestParam(required = false, defaultValue = "true") boolean setArchyObject) {
        return archySubjectService.findArchySubjectTree(setArchyObject);
    }

    @Operation(summary = "根据ID查询主题")
    @GetMapping("/subject/{subjectId}")
    public ArchySubject findArchySubjectById(@Parameter(description = "主题ID", required = true) @PathVariable(name = "subjectId") Long id) {
        return archySubjectService.findArchySubjectById(id);
    }

    @Operation(summary = "创建主题")
    @PostMapping("/subject")
    public ArchySubject createArchySubject(@RequestBody ArchySubject archySubject) {
        return archySubjectService.createArchySubject(archySubject);
    }

    @Operation(summary = "更新主题")
    @PutMapping("/subject")
    public ArchySubject updateArchySubject(@RequestBody ArchySubject archySubject) {
        return archySubjectService.updateArchySubject(archySubject);
    }

    @Operation(summary = "删除主题")
    @DeleteMapping("/subject/{subjectId}")
    public void deleteArchySubject(@Parameter(description = "主题ID", required = true) @PathVariable(name = "subjectId") Long id) {
        archySubjectService.deleteArchySubject(id);
    }

    @GetMapping(value = "/subject/udps")
    @Operation(summary = "查询UDP")
    public List<ArchyUdp> getArchySubjectUdps() {
        return archyUdpService.getUdps(ArchyType.OBJECT_SUBJECT);
    }

    @PostMapping(value = "/subject/udp")
    @Operation(summary = "创建UDP")
    public void createArchySubjectUdp(@RequestBody List<ArchyUdp> udpList,
                                      @Parameter(description = "是否删除旧数据") @RequestParam(required = false, defaultValue = "false") Boolean forceClear) {
        archyUdpService.createUdps(udpList, ArchyType.OBJECT_SUBJECT, forceClear);
    }
}