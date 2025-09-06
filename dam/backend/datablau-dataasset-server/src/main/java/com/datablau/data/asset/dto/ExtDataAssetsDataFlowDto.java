package com.datablau.data.asset.dto;

import com.andorj.model.common.annotation.ExcelColumn;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.Serial;
import java.io.Serializable;

public class ExtDataAssetsDataFlowDto implements Serializable {

  @Serial
  private static final long serialVersionUID = 5124742799174556660L;

  @ExcelColumn(columnNames = "系统名称")
  private String modelCategoryName;

  private String modelCategoryCode;

  @ExcelColumn(columnNames = "业务对象名称")
  private String l3Name;

  @ExcelColumn(columnNames = "业务对象编码")
  private String l3Code;

  @ExcelColumn(columnNames = "逻辑实体名称")
  private String l4Name;

  @ExcelColumn(columnNames = "逻辑实体编码")
  private String l4Code;

  // 逻辑实体完整层级路径
  private String l4FullPath;

  @ExcelColumn(columnNames = "数据操作")
  private String dataFlowPermissions;

  @ExcelColumn(columnNames = "是否分发源头")
  @JsonIgnore
  private String distributionSourceStr;

  private Boolean distributionSource;

  private Long modelCategoryId;

  public String getDataFlowPermissions() {
    return dataFlowPermissions;
  }

  public void setDataFlowPermissions(String dataFlowPermissions) {
    this.dataFlowPermissions = dataFlowPermissions;
  }

  public String getL3Code() {
    return l3Code;
  }

  public void setL3Code(String l3Code) {
    this.l3Code = l3Code;
  }

  public String getL3Name() {
    return l3Name;
  }

  public void setL3Name(String l3Name) {
    this.l3Name = l3Name;
  }

  public String getL4Code() {
    return l4Code;
  }

  public void setL4Code(String l4Code) {
    this.l4Code = l4Code;
  }

  public String getL4Name() {
    return l4Name;
  }

  public void setL4Name(String l4Name) {
    this.l4Name = l4Name;
  }

  public String getL4FullPath() {
    return l4FullPath;
  }

  public void setL4FullPath(String l4FullPath) {
    this.l4FullPath = l4FullPath;
  }

  public String getModelCategoryCode() {
    return modelCategoryCode;
  }

  public void setModelCategoryCode(String modelCategoryCode) {
    this.modelCategoryCode = modelCategoryCode;
  }

  public String getModelCategoryName() {
    return modelCategoryName;
  }

  public void setModelCategoryName(String modelCategoryName) {
    this.modelCategoryName = modelCategoryName;
  }

  public Boolean getDistributionSource() {
    return distributionSource;
  }

  public void setDistributionSource(Boolean distributionSource) {
    this.distributionSource = distributionSource;
  }

  public String getDistributionSourceStr() {
    return distributionSourceStr;
  }

  public void setDistributionSourceStr(String distributionSourceStr) {
    this.distributionSourceStr = distributionSourceStr;
  }

  public Long getModelCategoryId() {
    return modelCategoryId;
  }

  public void setModelCategoryId(Long modelCategoryId) {
    this.modelCategoryId = modelCategoryId;
  }
}
