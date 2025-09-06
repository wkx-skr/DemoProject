package com.datablau.ddd.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
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
import com.datablau.ddd.data.dto.SubjectDomainTreeNodeDto;
import com.datablau.ddd.data.jpa.entity.SubjectDomain;
import com.datablau.ddd.server.service.api.SubjectDomainService;
import io.swagger.v3.oas.annotations.Operation;

@RestController()
@RequestMapping("/subject")
public class SubjectDomainController {

    public static final String NODE_NOT_EXIST = "nodeNotExist";

    @Autowired
    private SubjectDomainService subjectDomainService;

    @Autowired
    MessageService msgService;

    @GetMapping("/tree")
    @Operation(summary = "得到树形结构的主题域")
    public SubjectDomain getDomainTree() {
        return subjectDomainService.getTree();
    }

    @Operation(summary = "创建子节点", description = "创建子节点")
    @PostMapping("/node")
    public SubjectDomain createNode(@RequestBody @Validated SubjectDomainTreeNodeDto subjectDomainTreeNodeDto) {
        return subjectDomainService.createNode(subjectDomainTreeNodeDto);
    }

    @Operation(summary = "创建根节点", description = "创建根节点")
    @PostMapping("/node/default")
    public SubjectDomain createDefaultNode(@RequestBody @Validated SubjectDomainTreeNodeDto subjectDomainTreeNodeDto) {
        return subjectDomainService.createRootFolder(subjectDomainTreeNodeDto);
    }

    @Operation(summary = "更新节点")
    @PutMapping("/node")
    public SubjectDomain updateNode(@RequestBody @Validated SubjectDomainTreeNodeDto subjectDomainTreeNodeDto) {
        SubjectDomain folder = subjectDomainService.getSubjectDomainById(subjectDomainTreeNodeDto.getId());
        if (folder == null) {
            throw new BusinessException(msgService.getMessage(NODE_NOT_EXIST));
        }
        return subjectDomainService.updateNode(subjectDomainTreeNodeDto);
    }

    @Operation(summary = "删除子节点")
    @DeleteMapping("/node/{nodeId}")
    public void deleteNode(@PathVariable(value = "nodeId") Long nodeId) {
        SubjectDomain node = subjectDomainService.getSubjectDomainById(nodeId);
        if (node == null) {
            throw new BusinessException(msgService.getMessage(NODE_NOT_EXIST));
        }
        subjectDomainService.deleteNode(node);
    }

    @Operation(summary = "移动节点")
    @PostMapping("/node/move")
    public void moveFolder(@RequestParam(value = "nodeId") Long nodeId,
                           @RequestParam(value = "targetId") Long targetId,
                           @RequestParam(value = "targetParentId") Long targetParentId,
                           @RequestParam(value = "targetOrder") Long targetOrder) {

        SubjectDomain node = subjectDomainService.getSubjectDomainById(nodeId);
        if (node == null) {
            throw new BusinessException(msgService.getMessage(NODE_NOT_EXIST));
        }
        subjectDomainService.moveItem(node, targetId, targetParentId, targetOrder);
    }

}
