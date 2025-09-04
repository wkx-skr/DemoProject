package com.datablau.data.asset.jpa.entity;


import com.andorj.common.core.annotation.Comment;
import com.datablau.data.asset.dto.DesignLabelDropResultDto;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(
        name = "tech_label_drop_result"
)
public class TechLabelDropResult {


    @Id
    @Column(name = "id")
    @GeneratedValue(
            generator = "tech_label_drop_result_generator"
    )
    @GenericGenerator(
            name = "tech_label_drop_result_generator",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "TECH_LABEL_DROP_RESULT_SEQ"
            )}
    )
    private Long id;

    //应用系统名称
    @Column(name = "model_category_name")
    private String modelCategoryName;

    //资产数（DL5）
    @Column(name = "asset_num")
    private Long assetNum;

    //资产注册数
    @Column(name = "register_asset_num")
    private Long registerAssetNum;

    //资产注册率
    @Column(name = "register_asset_rate")
    private String  registerAssetRate;

    //落标数
    @Column(name = "label_drop_num")
    private Long LabelDropNum;

    //落标率
    @Column(name = "label_drop_rate")
    private String  labelDropRate;

    //涉及标准元数据个数
    @Column(name = "domain_num")
    private Long domainNum;

    @Comment("校验时间")
    @Column(name = "check_time")
    private String checkTime;

    public TechLabelDropResult() {
    }

    public TechLabelDropResult(DesignLabelDropResultDto designLabelDropResultDto) {
        this.assetNum = designLabelDropResultDto.getAssetNum();
        this.registerAssetNum = designLabelDropResultDto.getRegisterAssetNum();
        this.registerAssetRate = designLabelDropResultDto.getRegisterAssetRate();
        this.labelDropRate = designLabelDropResultDto.getLabelDropRate();
        this.domainNum = designLabelDropResultDto.getDomainNum();
        this.modelCategoryName = designLabelDropResultDto.getModelCategoryName();
        this.labelDropRate = designLabelDropResultDto.getLabelDropRate();

    }

    public String getCheckTime() {
        return checkTime;
    }

    public void setCheckTime(String checkTime) {
        this.checkTime = checkTime;
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

    public String getRegisterAssetRate() {
        return registerAssetRate;
    }

    public void setRegisterAssetRate(String registerAssetRate) {
        this.registerAssetRate = registerAssetRate;
    }

    public Long getLabelDropNum() {
        return LabelDropNum;
    }

    public void setLabelDropNum(Long labelDropNum) {
        LabelDropNum = labelDropNum;
    }

    public String getLabelDropRate() {
        return labelDropRate;
    }

    public void setLabelDropRate(String labelDropRate) {
        this.labelDropRate = labelDropRate;
    }

    public Long getDomainNum() {
        return domainNum;
    }

    public void setDomainNum(Long domainNum) {
        this.domainNum = domainNum;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
