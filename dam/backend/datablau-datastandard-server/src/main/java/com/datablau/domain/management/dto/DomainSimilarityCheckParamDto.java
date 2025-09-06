package com.datablau.domain.management.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

@Schema(
        title = "相似度检查",
        description = "相似度检查"
)
public class DomainSimilarityCheckParamDto implements Serializable {
    private static final long serialVersionUID = 1L;

    @Schema(title = "domainId")
    private String domainId;

    @Schema(title = "中文名称")
    private String chineseName;

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getChineseName() {
        return chineseName;
    }

    public void setChineseName(String chineseName) {
        this.chineseName = chineseName;
    }
}
