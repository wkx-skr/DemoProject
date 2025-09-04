package com.datablau.data.asset.dto;

import java.io.Serializable;
import java.util.List;

public class DesignLabelDropResultDto implements Serializable {
    private static final long serialVersionUID = 1L;

    //应用系统名称
    private String modelCategoryName;

    //资产数（DL5）
    private Long assetNum;

    //资产注册数
    private Long registerAssetNum;

    //资产注册率
    private String  registerAssetRate;

    //落标数
    private Long LabelDropNum;

    //落标率
    private String  labelDropRate;

    //涉及标准元数据个数
    private Long domainNum;

    /*private List<DesignLabelDropResultDetailDto> designLabelDropResultDetailDtoList;

    public List<DesignLabelDropResultDetailDto> getDesignLabelDropResultDetailDtoList() {
        return designLabelDropResultDetailDtoList;
    }

    public void setDesignLabelDropResultDetailDtoList(List<DesignLabelDropResultDetailDto> designLabelDropResultDetailDtoList) {
        this.designLabelDropResultDetailDtoList = designLabelDropResultDetailDtoList;
    }*/

    public Long getDomainNum() {
        return domainNum;
    }

    public void setDomainNum(Long domainNum) {
        this.domainNum = domainNum;
    }

    public String getRegisterAssetRate() {
        return registerAssetRate;
    }

    public void setRegisterAssetRate(String registerAssetRate) {
        this.registerAssetRate = registerAssetRate;
    }

    public String  getLabelDropRate() {
        return labelDropRate;
    }

    public void setLabelDropRate(String  labelDropRate) {
        this.labelDropRate = labelDropRate;
    }

    public String getModelCategoryName() {
        return modelCategoryName;
    }

    public void setModelCategoryName(String modelCategoryName) {
        this.modelCategoryName = modelCategoryName;
    }

    public Long getAssetNum() {
        return assetNum;
    }

    public void setAssetNum(Long assetNum) {
        this.assetNum = assetNum;
    }

    public Long getRegisterAssetNum() {
        return registerAssetNum;
    }

    public void setRegisterAssetNum(Long registerAssetNum) {
        this.registerAssetNum = registerAssetNum;
    }

    public Long getLabelDropNum() {
        return LabelDropNum;
    }

    public void setLabelDropNum(Long labelDropNum) {
        LabelDropNum = labelDropNum;
    }
}
