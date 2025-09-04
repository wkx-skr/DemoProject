package com.datablau.data.asset.dto;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

public class ExtDataAssetsDataFlowResDto implements Serializable {

  @Serial
  private static final long serialVersionUID = -290200080481138027L;

  private Integer currentPage;

  private Integer pageSize;

  private Long totalItems;

  private List<ExtDataAssetsDataFlowDto> content;

  public Integer getCurrentPage() {
    return currentPage;
  }

  public void setCurrentPage(Integer currentPage) {
    this.currentPage = currentPage;
  }

  public List<ExtDataAssetsDataFlowDto> getContent() {
    return content;
  }

  public void setContent(List<ExtDataAssetsDataFlowDto> content) {
    this.content = content;
  }

  public Integer getPageSize() {
    return pageSize;
  }

  public void setPageSize(Integer pageSize) {
    this.pageSize = pageSize;
  }

  public Long getTotalItems() {
    return totalItems;
  }

  public void setTotalItems(Long totalItems) {
    this.totalItems = totalItems;
  }
}
