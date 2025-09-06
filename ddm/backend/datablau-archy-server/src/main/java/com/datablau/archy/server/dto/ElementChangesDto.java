package com.datablau.archy.server.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.Strings;
import com.google.common.collect.Sets;
import io.swagger.v3.oas.annotations.media.Schema;
import org.apache.commons.lang.ObjectUtils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @author Nicky - 数语科技有限公司
 * date 2020/7/8 11:24
 */
@JsonInclude(Include.NON_NULL)
@Schema(title = "元素变更对象")
public class ElementChangesDto implements Serializable {

    @JsonProperty("tid")
    @Schema(title = "变更元素类型")
    protected Long typeId;

    @JsonProperty("tn")
    @Schema(title = "类型名称")
    protected String typeName;

    @JsonProperty("cp")
    @Schema(title = "当前属性Map集合")
    protected Map<String, String> currentProperties;

    @JsonProperty("pp")
    @Schema(title = "变更前属性Map集合")
    protected Map<String, String> previousProperties;

    @JsonProperty("sub")
    @Schema(title = "子元素对象")
    protected List<ElementChangesDto> sub;

    @JsonProperty("mid")
    @Schema(title = "模型ID")
    protected Long modelId;

    @JsonProperty("eid")
    @Schema(title = "元素ID")
    protected Long elementId;

    @JsonProperty("v")
    @Schema(title = "当前版本")
    protected Long currentVersion;

    @JsonProperty("pId")
    @Schema(title = "父元素ID")
    protected Long parentId;

    @JsonProperty("nc")
    @Schema(title = "是否发生变更")
    protected Boolean noChange;

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public Map<String, String> getCurrentProperties() {
        return currentProperties;
    }

    public void setCurrentProperties(Map<String, String> currentProperties) {
        this.currentProperties = currentProperties;
    }

    public Map<String, String> getPreviousProperties() {
        return previousProperties;
    }

    public void setPreviousProperties(Map<String, String> previousProperties) {
        this.previousProperties = previousProperties;
    }

    public List<ElementChangesDto> getSub() {
        return sub;
    }

    public void setSub(List<ElementChangesDto> sub) {
        this.sub = sub;
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public Long getElementId() {
        return elementId;
    }

    public void setElementId(Long elementId) {
        this.elementId = elementId;
    }

    public Long getCurrentVersion() {
        return currentVersion;
    }

    public void setCurrentVersion(Long currentVersion) {
        this.currentVersion = currentVersion;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public Boolean getNoChange() {
        return noChange;
    }

    public void setNoChange(Boolean noChange) {
        this.noChange = noChange;
    }
}
