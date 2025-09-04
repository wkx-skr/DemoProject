package com.datablau.data.asset.dto;

import java.io.Serial;
import java.io.Serializable;

public class ExtDataAssetsCatalogDto implements Serializable {

  @Serial
  private static final long serialVersionUID = -8290917450485069646L;

  private Long catalogId;

  private String catalogCode;

  private String catalogName;

  private Integer catalogLevel;

  private Long parentId;

  private String fullPath;

  public String getCatalogCode() {
    return catalogCode;
  }

  public void setCatalogCode(String catalogCode) {
    this.catalogCode = catalogCode;
  }

  public Long getCatalogId() {
    return catalogId;
  }

  public void setCatalogId(Long catalogId) {
    this.catalogId = catalogId;
  }

  public String getCatalogName() {
    return catalogName;
  }

  public void setCatalogName(String catalogName) {
    this.catalogName = catalogName;
  }

  public Integer getCatalogLevel() {
    return catalogLevel;
  }

  public void setCatalogLevel(Integer catalogLevel) {
    this.catalogLevel = catalogLevel;
  }

  public Long getParentId() {
    return parentId;
  }

  public void setParentId(Long parentId) {
    this.parentId = parentId;
  }

  public String getFullPath() {
    return fullPath;
  }

  public void setFullPath(String fullPath) {
    this.fullPath = fullPath;
  }
}
