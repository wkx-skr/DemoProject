package com.datablau.data.asset.dto;

import java.io.Serial;
import java.io.Serializable;

public class ExtDataAssetsDataFlowDiagramsLineResDto implements Serializable {

  @Serial
  private static final long serialVersionUID = -8867057995796538164L;

  private String modelCategoryNameLeft;

  private String permissionsCrudLeft;

  private String L4Name;

  private String L3Name;

  private String permissionsCrudRight;

  private String modelCategoryNameRight;

  public String getL3Name() {
    return L3Name;
  }

  public void setL3Name(String l3Name) {
    L3Name = l3Name;
  }

  public String getL4Name() {
    return L4Name;
  }

  public void setL4Name(String l4Name) {
    L4Name = l4Name;
  }

  public String getModelCategoryNameLeft() {
    return modelCategoryNameLeft;
  }

  public void setModelCategoryNameLeft(String modelCategoryNameLeft) {
    this.modelCategoryNameLeft = modelCategoryNameLeft;
  }

  public String getModelCategoryNameRight() {
    return modelCategoryNameRight;
  }

  public void setModelCategoryNameRight(String modelCategoryNameRight) {
    this.modelCategoryNameRight = modelCategoryNameRight;
  }

  public String getPermissionsCrudLeft() {
    return permissionsCrudLeft;
  }

  public void setPermissionsCrudLeft(String permissionsCrudLeft) {
    this.permissionsCrudLeft = permissionsCrudLeft;
  }

  public String getPermissionsCrudRight() {
    return permissionsCrudRight;
  }

  public void setPermissionsCrudRight(String permissionsCrudRight) {
    this.permissionsCrudRight = permissionsCrudRight;
  }
}
