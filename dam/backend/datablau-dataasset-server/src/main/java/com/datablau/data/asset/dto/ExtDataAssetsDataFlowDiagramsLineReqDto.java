package com.datablau.data.asset.dto;

import java.io.Serial;
import java.io.Serializable;

public class ExtDataAssetsDataFlowDiagramsLineReqDto implements Serializable {

  @Serial
  private static final long serialVersionUID = 3061697170762686814L;

  private Long modelCategoryIdOther;

  private Long modelCategoryId;

  /**
   * true: left
   * false: right
   */
  private Boolean flag;

  public Long getModelCategoryIdOther() {
    return modelCategoryIdOther;
  }

  public void setModelCategoryIdOther(Long modelCategoryIdOther) {
    this.modelCategoryIdOther = modelCategoryIdOther;
  }

  public Long getModelCategoryId() {
    return modelCategoryId;
  }

  public void setModelCategoryId(Long modelCategoryId) {
    this.modelCategoryId = modelCategoryId;
  }

  public Boolean getFlag() {
    return flag;
  }

  public void setFlag(Boolean flag) {
    this.flag = flag;
  }
}
