package com.datablau.data.asset.jpa.entity;

import java.io.Serial;
import java.io.Serializable;

public class ExtDataAssetsDataFlowId implements Serializable {

  @Serial
  private static final long serialVersionUID = -2542358557674345390L;

  private String l4Code;

  private Long modelCategoryId;

  public String getL4Code() {
    return l4Code;
  }

  public void setL4Code(String l4Code) {
    this.l4Code = l4Code;
  }

  public Long getModelCategoryId() {
    return modelCategoryId;
  }

  public void setModelCategoryId(Long modelCategoryId) {
    this.modelCategoryId = modelCategoryId;
  }
}
