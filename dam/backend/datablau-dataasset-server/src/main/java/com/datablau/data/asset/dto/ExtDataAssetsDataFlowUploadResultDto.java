package com.datablau.data.asset.dto;

import java.io.Serial;
import java.io.Serializable;

public class ExtDataAssetsDataFlowUploadResultDto implements Serializable {

  @Serial
  private static final long serialVersionUID = 574036334274359912L;

  private Integer success;

  private Integer failed;

  private String fileId;

  public Integer getFailed() {
    return failed;
  }

  public void setFailed(Integer failed) {
    this.failed = failed;
  }

  public String getFileId() {
    return fileId;
  }

  public void setFileId(String fileId) {
    this.fileId = fileId;
  }

  public Integer getSuccess() {
    return success;
  }

  public void setSuccess(Integer success) {
    this.success = success;
  }
}
