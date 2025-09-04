package com.datablau.domain.management.dto;

import com.datablau.domain.management.constants.DomainCheckState;
import com.datablau.domain.management.utils.JsonUtils;
import com.datablau.domain.management.jpa.entity.DomainExt;
import com.datablau.domain.management.utils.XSSUtil;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(
        title = "数据标准Ext传输层",
        description = "数据标准Ext传输层"
)
public class DomainExtDto extends DomainDto {

    @Schema(
            title = "最大值",
            description = "最大值"
    )
    private Integer maxValue;
    @Schema(
            title = "最小值",
            description = "最小值"
    )
    private Integer minValue;

    @Schema(
            title = "关联术语",
            description = "关联术语"
    )
    private String referenceTerm;
    @Schema(title = "检查状态")
    private DomainCheckState checkState;

    private String referenceName;

    private String referenceTermName;


    public Integer getMaxValue() {
        return maxValue;
    }

    public void setMaxValue(Integer maxValue) {
        this.maxValue = maxValue;
    }

    public Integer getMinValue() {
        return minValue;
    }

    public void setMinValue(Integer minValue) {
        this.minValue = minValue;
    }

    public String getReferenceTerm() {
        return referenceTerm;
    }

    public void setReferenceTerm(String referenceTerm) {
        this.referenceTerm = referenceTerm;
    }

    public DomainCheckState getCheckState() {
        return checkState;
    }

    public void setCheckState(DomainCheckState checkState) {
        this.checkState = checkState;
    }

    public String getReferenceName() {
        return referenceName;
    }

    public void setReferenceName(String referenceName) {
        this.referenceName = referenceName;
    }

    public String getReferenceTermName() {
        return referenceTermName;
    }

    public void setReferenceTermName(String referenceTermName) {
        this.referenceTermName = referenceTermName;
    }

    public static DomainExtDto buildBy(DomainDto domainDto) {
        return  buildBy(domainDto, null, null, null, null);
    }
    public static DomainExtDto buildBy(DomainDto domainDto, DomainExt domainExt) {
        DomainExtDto object = JsonUtils.toObject(JsonUtils.toJSon(domainDto), DomainExtDto.class);
        object.setReferenceTerm(domainExt.getReferenceTerm());
        object.setMaxValue(domainExt.getMaxValue());
        object.setMinValue(domainExt.getMinValue());
        object.setCheckState(domainExt.getCheckState());
        return object;
    }
    public static DomainExtDto buildBy(DomainDto domainDto, String referenceTerm, Integer maxValue, Integer minValue, DomainCheckState checkState) {
        DomainExtDto object = JsonUtils.toObject(JsonUtils.toJSon(domainDto), DomainExtDto.class);
        object.setReferenceTerm(referenceTerm);
        object.setMaxValue(maxValue);
        object.setMinValue(minValue);
        object.setCheckState(checkState);
        return object;
    }

    public DomainExt buildDomainExt() {
        DomainExt domainExt = new DomainExt();
        domainExt.setdId(this.getDomainId());
        domainExt.setReferenceTerm(this.referenceTerm);
        domainExt.setMaxValue(this.maxValue);
        domainExt.setMinValue(this.minValue);
        domainExt.setCheckState(this.checkState == null ? DomainCheckState.UNCHECK : this.checkState);
        return domainExt;
    }

    public void filter() {
        this.setDomainId(XSSUtil.processInput(this.getDomainId()));
        this.setDomainCode(XSSUtil.processInput(this.getDomainCode()));
        this.setChineseName(XSSUtil.processInput(this.getChineseName()));
        this.setEnglishName(XSSUtil.processInput(this.getEnglishName()));
        this.setAbbreviation(XSSUtil.processInput(this.getAbbreviation()));
        this.setDescription(XSSUtil.processInput(this.getDescription()));
    }
}
