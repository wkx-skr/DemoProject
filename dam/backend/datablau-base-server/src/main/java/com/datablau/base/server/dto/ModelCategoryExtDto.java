package com.datablau.base.server.dto;

import com.datablau.base.data.ModelCategoryDto;
import io.swagger.v3.oas.annotations.media.Schema;

public class ModelCategoryExtDto extends ModelCategoryDto {

    private static final long serialVersionUID = 1L;

    @Schema(
            title = "系统ID"
    )
    private Long folderId;

    @Schema(
            title = "系统ID"
    )
    private Long parentId;

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
}
