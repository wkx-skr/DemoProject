package com.datablau.data.asset.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class ManualMappingImportResultDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(name = "成功条数")
    private Long success = 0L;
    @Schema(name = "失败条数")
    private Long failed = 0L;
    @Schema(name = "导入异常信息")
    private List<String> errorMsg = new ArrayList<>();

    public  synchronized void addSuccess() {
        Long successCount = this.success;
        this.success = successCount+1L;
    }

    public synchronized void addFailed() {
        Long successCount = this.success;
        this.success = successCount - 1L;
        successCount = this.failed;
        this.failed = successCount + 1L;
    }

    public synchronized  void addFailedList(int size) {
        this.success = this.success - (long)size;
        this.failed = this.failed + (long)size;
    }

    public synchronized  void minusSuccess() {
        Long successCount = this.success;
        if (successCount > 0L) {
           this.success = successCount -1L;
        }
    }

    public Long getSuccess() {
        return success;
    }

    public void setSuccess(Long success) {
        this.success = success;
    }

    public Long getFailed() {
        return failed;
    }

    public void setFailed(Long failed) {
        this.failed = failed;
    }

    public List<String> getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(List<String> errorMsg) {
        this.errorMsg = errorMsg;
    }
}
