package com.datablau.archy.server.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class ArchyObjectL4L5ImportResultDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long success = 0L;
    private Long failed = 0L;
    private String fileId;
    private Map<String, ArchyObjectL4L5ErrorDto> archyObjectL4L5ErrorMap;

    public void addArchyObjectL4L5Error(ArchyObjectL4L5ErrorDto archyObjectL4L5ErrorDto) {
        if (archyObjectL4L5ErrorMap == null) {
            archyObjectL4L5ErrorMap = new HashMap<>();
        }
        String key = archyObjectL4L5ErrorDto.getSheetName() + "-" + archyObjectL4L5ErrorDto.getLineNo();
        if (archyObjectL4L5ErrorMap.containsKey(key)) {
            archyObjectL4L5ErrorMap.get(key).addErrorMsg(archyObjectL4L5ErrorDto.getErrorMsg());
        } else {
            archyObjectL4L5ErrorMap.put(key, archyObjectL4L5ErrorDto);
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

    public String getFileId() {
        return fileId;
    }

    public void setFileId(String fileId) {
        this.fileId = fileId;
    }

    public Map<String, ArchyObjectL4L5ErrorDto> getArchyObjectL4L5ErrorMap() {
        return archyObjectL4L5ErrorMap;
    }

    public void setArchyObjectL4L5ErrorMap(Map<String, ArchyObjectL4L5ErrorDto> archyObjectL4L5ErrorMap) {
        this.archyObjectL4L5ErrorMap = archyObjectL4L5ErrorMap;
    }

    public synchronized void addSuccess() {
        Long var1 = this.success;
        this.success = this.success + 1L;
    }

    public synchronized void addFailed() {
        Long var1 = this.success;
        this.success = this.success - 1L;
        var1 = this.failed;
        this.failed = this.failed + 1L;
    }

    public synchronized void addFailedList(int size) {
        this.success = this.success - (long)size;
        this.failed = this.failed + (long)size;
    }

    public synchronized void minusSuccess() {
        if (this.success > 0L) {
            Long var1 = this.success;
            this.success = this.success - 1L;
        }

    }
}
