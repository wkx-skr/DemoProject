package com.datablau.domain.management.dto;

import com.datablau.domain.management.utils.JsonUtils;
import com.datablau.domain.management.jpa.entity.StandardCodeFolderRela;

import java.util.List;

public class StandardCodeFolderDto extends StandardCodeDto {
    private Long folderId;

    private List<String> paths;

    private DomainDto parentDomain;
    @Override
    public Long getFolderId() {
        return folderId;
    }

    @Override
    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public List<String> getPaths() {
        return paths;
    }

    public void setPaths(List<String> paths) {
        this.paths = paths;
    }

    public DomainDto getParentDomain() {
        return parentDomain;
    }

    public void setParentDomain(DomainDto parentDomain) {
        this.parentDomain = parentDomain;
    }

    public static StandardCodeFolderDto buildBy(StandardCodeDto standardCodeDto) {
        return JsonUtils.toObject(JsonUtils.toJSon(standardCodeDto), StandardCodeFolderDto.class);
    }

    public StandardCodeFolderRela toStandardCodeFolderRela() {
        StandardCodeFolderRela standardCodeFolderRela = new StandardCodeFolderRela();
        standardCodeFolderRela.setCode(this.getCode());
        standardCodeFolderRela.setfId(this.getFolderId());
        return standardCodeFolderRela;
    }
}
