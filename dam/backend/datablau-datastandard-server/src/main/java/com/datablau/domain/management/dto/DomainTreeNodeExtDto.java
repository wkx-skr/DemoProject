package com.datablau.domain.management.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.apache.commons.compress.utils.Lists;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Objects;
import java.util.Set;

public class DomainTreeNodeExtDto extends DomainTreeNodeDto {
    @Schema(title = "对应一级目录的bizCode", description = "对应一级目录的bizCode")
    private String bizCode;

    @Schema(title = "/{name}", description = "/{name}")
    private String namePath;

    public static void getAllSubNodeId(DomainTreeNodeDto node, Set<Long> subNodeIds) {
        if(!CollectionUtils.isEmpty(node.getNodes())) {
            for (DomainTreeNodeDto subNode : node.getNodes()) {
                subNodeIds.add(subNode.getFoldId());
                getAllSubNodeId(subNode, subNodeIds);
            }
        }
    }

    public String getBizCode() {
        return bizCode;
    }

    public void setBizCode(String bizCode) {
        this.bizCode = bizCode;
    }

    public String getNamePath() {
        return namePath;
    }

    public void setNamePath(String namePath) {
        this.namePath = namePath;
    }

    public static DomainTreeNodeExtDto buildBy(DomainTreeNodeDto nodeDto, String bizCode) {
        DomainTreeNodeExtDto domainTreeNodeExtDto = new DomainTreeNodeExtDto();
        domainTreeNodeExtDto.setBizCode(bizCode);
        domainTreeNodeExtDto.setCategoryId(nodeDto.getCategoryId());
        domainTreeNodeExtDto.setDescription(nodeDto.getDescription());
        domainTreeNodeExtDto.setDomains(nodeDto.getDomains());
        domainTreeNodeExtDto.setFoldId(nodeDto.getFoldId());
        domainTreeNodeExtDto.setName(nodeDto.getName());
        domainTreeNodeExtDto.setNodes(nodeDto.getNodes());
        domainTreeNodeExtDto.setOrder(nodeDto.getOrder());
        domainTreeNodeExtDto.setParentId(nodeDto.getParentId());
        domainTreeNodeExtDto.setType(nodeDto.getType());
        return domainTreeNodeExtDto;
    }

    public static String searchBizCode(DomainTreeNodeDto root, Long folderId, Long categoryId) {
        DomainTreeNodeDto node = DomainTreeNodeExtDto.findByFolderId(folderId, root);
        return node == null ? null : DomainTreeNodeExtDto.searchBizCode(root, node, categoryId);
    }
    public static String searchBizCode(DomainTreeNodeDto root, DomainTreeNodeDto nodeDto, Long categoryId) {
        Long folderId = nodeDto.getParentId();
        DomainTreeNodeDto node = nodeDto;
        while (node.getParentId() != categoryId) {
            DomainTreeNodeDto parentNode = DomainTreeNodeExtDto.findByFolderId(folderId, root);
            if(parentNode.getParentId() == 0l) {
                break;
            }
            node = parentNode;
        }
        return node.getParentId() == categoryId && node instanceof DomainTreeNodeExtDto ? ((DomainTreeNodeExtDto) node).getBizCode() : null;
    }

    public static String buildNamePath(DomainTreeNodeDto domainTreeNodeDto, DomainTreeNodeDto root) {
        List<String> namePathArr = buildNamePathArr(domainTreeNodeDto, root);
        return "/" + StringUtils.join(namePathArr, "/");
    }


    public static List<String> buildNamePathArr(DomainTreeNodeDto domainTreeNodeDto, DomainTreeNodeDto root) {
        List<String> result = Lists.newArrayList();
        String name = domainTreeNodeDto.getName();
        result.add(name);
        Long folderId = domainTreeNodeDto.getParentId();
        while (folderId != 0l) {
            DomainTreeNodeDto parentNode = DomainTreeNodeExtDto.findByFolderId(folderId, root);
            result.add(0, parentNode.getName());
            folderId = parentNode.getParentId();
        }
        return result;
    }
    public static DomainTreeNodeDto findByFolderId(Long folderId, DomainTreeNodeDto domainTreeNodeDto) {
        if(domainTreeNodeDto != null) {
            if(Objects.equals(domainTreeNodeDto.getFoldId(), folderId)) {
                return domainTreeNodeDto;
            }
            if(!CollectionUtils.isEmpty(domainTreeNodeDto.getNodes())) {
                for (DomainTreeNodeDto node : domainTreeNodeDto.getNodes()) {
                    DomainTreeNodeDto byFolderId = findByFolderId(folderId, node);
                    if(byFolderId != null) {
                        return byFolderId;
                    }
                }
            }
        }
        return null;
    }
}
