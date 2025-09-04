package com.datablau.data.asset.dto;

import java.io.Serial;
import java.io.Serializable;

public class ExtDataAssetsDataFlowReqDto implements Serializable {

  @Serial
  private static final long serialVersionUID = -3664117823527557962L;

  private String modelCategoryName;

  private Long modelCategoryId;

  private Boolean distributionSource;

  private String l3Name;

  private String l4Name;

  private String l4Code;

  private String dataFlowPermissions;

  private Integer currentPage;

  private Integer pageSize;

  public Integer getCurrentPage() {
    return currentPage;
  }

  public void setCurrentPage(Integer currentPage) {
    this.currentPage = currentPage;
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

  public String getModelCategoryName() {
    return modelCategoryName;
  }

  public void setModelCategoryName(String modelCategoryName) {
    this.modelCategoryName = modelCategoryName;
  }

  public Integer getPageSize() {
    return pageSize;
  }

  public void setPageSize(Integer pageSize) {
    this.pageSize = pageSize;
  }

  public String getDataFlowPermissions() {
    return dataFlowPermissions;
  }

  public void setDataFlowPermissions(String dataFlowPermissions) {
    this.dataFlowPermissions = dataFlowPermissions;
  }

  public Long getModelCategoryId() {
    return modelCategoryId;
  }

  public void setModelCategoryId(Long modelCategoryId) {
    this.modelCategoryId = modelCategoryId;
  }

  public Boolean getDistributionSource() {
    return distributionSource;
  }

  public void setDistributionSource(Boolean distributionSource) {
    this.distributionSource = distributionSource;
  }
}
