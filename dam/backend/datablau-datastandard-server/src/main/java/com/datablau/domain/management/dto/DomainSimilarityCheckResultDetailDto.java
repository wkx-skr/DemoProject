package com.datablau.domain.management.dto;


import com.datablau.domain.management.constants.DomainCheckState;
import com.datablau.domain.management.data.DomainState;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.Serializable;
import java.util.List;

@Schema(title = "标准相似度检查")
public class DomainSimilarityCheckResultDetailDto implements Serializable {
    private static final long serialVersionUID = -1l;

    @Schema( title = "聚合明细ID")
    private Long id;
    @Schema( title = "聚合ID")
    private Long clusterId;

    @Schema( title = "分数")
    private float score;

    @Schema( title = "标准id")
    private String domainId;

    @Schema( title = "标准编码")
    private String domainCode;
    @Schema( title = "中文名称")
    private String chineseName;
    @Schema( title = "英文名称")
    private String englishName;
    @Schema( title = "目录id")
    private Long folderId;

    @Schema( title = "发布状态")
    private DomainState state;

    @Schema( title = "数据类型")
    private String dataType;
    @Schema( title = "数据长度")
    private Integer dataScale;
    @Schema( title = "数据精度")
    private Integer dataPrecision;
    @Schema( title = "谁提交的数据标准")
    private String submitter;

    @Schema( title = "业务定义部门")
    private String descriptionDepartment;

    @Schema( title = "业务定义部门")
    private String descriptionDepartmentName;
    @Schema( title = "标准检查状态")
    private DomainCheckState checkState;

    @Schema( title = "目录集合")
    private List<String> path;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClusterId() {
        return clusterId;
    }

    public void setClusterId(Long clusterId) {
        this.clusterId = clusterId;
    }

    public float getScore() {
        return score;
    }

    public void setScore(float score) {
        this.score = score;
    }

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getDomainCode() {
        return domainCode;
    }

    public void setDomainCode(String domainCode) {
        this.domainCode = domainCode;
    }

    public String getChineseName() {
        return chineseName;
    }

    public void setChineseName(String chineseName) {
        this.chineseName = chineseName;
    }

    public String getEnglishName() {
        return englishName;
    }

    public void setEnglishName(String englishName) {
        this.englishName = englishName;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public DomainState getState() {
        return state;
    }

    public void setState(DomainState state) {
        this.state = state;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public Integer getDataScale() {
        return dataScale;
    }

    public void setDataScale(Integer dataScale) {
        this.dataScale = dataScale;
    }

    public Integer getDataPrecision() {
        return dataPrecision;
    }

    public void setDataPrecision(Integer dataPrecision) {
        this.dataPrecision = dataPrecision;
    }

    public String getSubmitter() {
        return submitter;
    }

    public void setSubmitter(String submitter) {
        this.submitter = submitter;
    }

    public String getDescriptionDepartment() {
        return descriptionDepartment;
    }

    public void setDescriptionDepartment(String descriptionDepartment) {
        this.descriptionDepartment = descriptionDepartment;
    }

    public String getDescriptionDepartmentName() {
        return descriptionDepartmentName;
    }

    public void setDescriptionDepartmentName(String descriptionDepartmentName) {
        this.descriptionDepartmentName = descriptionDepartmentName;
    }

    public DomainCheckState getCheckState() {
        return checkState;
    }

    public void setCheckState(DomainCheckState checkState) {
        this.checkState = checkState;
    }

    public List<String> getPath() {
        return path;
    }

    public void setPath(List<String> path) {
        this.path = path;
    }
}
