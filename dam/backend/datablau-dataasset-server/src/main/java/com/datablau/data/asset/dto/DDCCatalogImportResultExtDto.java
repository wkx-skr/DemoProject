package com.datablau.data.asset.dto;

import com.datablau.data.asset.upload.DDCCatalogImportResultDto;

import java.util.HashMap;
import java.util.Map;

public class DDCCatalogImportResultExtDto extends DDCCatalogImportResultDto {

    private String fileId;
    private Map<String, DDCCatalogErrorDto> ddcCatalogErrorMap;

    public DDCCatalogImportResultExtDto () {
        super();
    }

    public Map<String, DDCCatalogErrorDto> getDdcCatalogErrorMap() {
        return ddcCatalogErrorMap;
    }

    public String getFileId() {
        return fileId;
    }

    public void setFileId(String fileId) {
        this.fileId = fileId;
    }

    public void setDdcCatalogErrorMap(Map<String, DDCCatalogErrorDto> ddcCatalogErrorMap) {
        this.ddcCatalogErrorMap = ddcCatalogErrorMap;
    }

    public void addDdcCatalogError(DDCCatalogErrorDto ddcCatalogErrorDto) {
        if (ddcCatalogErrorMap == null) {
            ddcCatalogErrorMap = new HashMap<>();
        }
        String key = ddcCatalogErrorDto.getSheetName() + "-" + ddcCatalogErrorDto.getLineNo();
        if (ddcCatalogErrorMap.containsKey(key)) {
            ddcCatalogErrorMap.get(key).addErrorMsg(ddcCatalogErrorDto.getErrorMsg());
        } else {
            ddcCatalogErrorMap.put(key, ddcCatalogErrorDto);
        }
    }
}
