package com.datablau.data.asset.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class DesignLabelDropResultTotalDto implements Serializable {
    private static final long serialVersionUID = 1L;


    //总资产数（DL5）
    private Long assetNumTotal;

    //总资产注册数(已承载)
    private Long registerAssetNumTotal;

    //总资产注册率(资产覆盖率)
    private String  registerAssetRateTotal;

    //总落标数
    private Long LabelDropNumTotal;

    //总落标率
    private String  labelDropRateTotal;

    //模型字段数
    private Long modelColumnNumTotal;

    /**
     * 计数列表
     */
    private List<DesignLabelDropResultDto> designLabelDropResultDtolist =  new ArrayList<>();

    /**
     * excel列表
     */
    private List<DesignLabelDropResultDetailExcelDto> designLabelDropResultDetailExcelDtos = new ArrayList<>();


    public Long getModelColumnNumTotal() {
        return modelColumnNumTotal;
    }

    public void setModelColumnNumTotal(Long modelColumnNumTotal) {
        this.modelColumnNumTotal = modelColumnNumTotal;
    }

    /**
     * 详情列表
     */
    private List<DesignLabelDropResultDetailDto> designLabelDropResultDetailDtoList;

    /**
     * dl5资产列表
     */
    private List<DL5AttributeDto> dl5AttributeDtos =  new ArrayList<>();

    public List<DL5AttributeDto> getDl5AttributeDtos() {
        return dl5AttributeDtos;
    }

    public void setDl5AttributeDtos(List<DL5AttributeDto> dl5AttributeDtos) {
        this.dl5AttributeDtos = dl5AttributeDtos;
    }

    public List<DesignLabelDropResultDetailDto> getDesignLabelDropResultDetailDtoList() {
        return designLabelDropResultDetailDtoList;
    }

    public void setDesignLabelDropResultDetailDtoList(List<DesignLabelDropResultDetailDto> designLabelDropResultDetailDtoList) {
        this.designLabelDropResultDetailDtoList = designLabelDropResultDetailDtoList;
    }

    public List<DesignLabelDropResultDetailExcelDto> getDesignLabelDropResultDetailExcelDtos() {
        return designLabelDropResultDetailExcelDtos;
    }

    public void setDesignLabelDropResultDetailExcelDtos(List<DesignLabelDropResultDetailExcelDto> designLabelDropResultDetailExcelDtos) {
        this.designLabelDropResultDetailExcelDtos = designLabelDropResultDetailExcelDtos;
    }

    public List<DesignLabelDropResultDto> getDesignLabelDropResultDtolist() {
        return designLabelDropResultDtolist;
    }

    public void setDesignLabelDropResultDtolist(List<DesignLabelDropResultDto> designLabelDropResultDtolist) {
        this.designLabelDropResultDtolist = designLabelDropResultDtolist;
    }

    public Long getAssetNumTotal() {
        return assetNumTotal;
    }

    public void setAssetNumTotal(Long assetNumTotal) {
        this.assetNumTotal = assetNumTotal;
    }

    public Long getRegisterAssetNumTotal() {
        return registerAssetNumTotal;
    }

    public void setRegisterAssetNumTotal(Long registerAssetNumTotal) {
        this.registerAssetNumTotal = registerAssetNumTotal;
    }

    public String getRegisterAssetRateTotal() {
        return registerAssetRateTotal;
    }

    public void setRegisterAssetRateTotal(String registerAssetRateTotal) {
        this.registerAssetRateTotal = registerAssetRateTotal;
    }

    public Long getLabelDropNumTotal() {
        return LabelDropNumTotal;
    }

    public void setLabelDropNumTotal(Long labelDropNumTotal) {
        LabelDropNumTotal = labelDropNumTotal;
    }

    public String getLabelDropRateTotal() {
        return labelDropRateTotal;
    }

    public void setLabelDropRateTotal(String labelDropRateTotal) {
        this.labelDropRateTotal = labelDropRateTotal;
    }

}
