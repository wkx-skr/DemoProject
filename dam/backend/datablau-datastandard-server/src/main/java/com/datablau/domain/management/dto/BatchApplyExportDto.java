package com.datablau.domain.management.dto;



import com.datablau.data.common.util.ExcelExport;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-10 14:10
 * @description
 */
public class BatchApplyExportDto implements Serializable {


    @ExcelExport(value = "批次名称", sort = 0)
    private String batchName;

    @ExcelExport(value = "创建人", sort = 1)
    private String createUser;

    @ExcelExport(value = "创建时间", sort = 2)
    private LocalDateTime createTime;

    @ExcelExport(value = "资产类型", sort = 3)
    private String dataType;

    @ExcelExport(value = "确认人", sort = 4)
    private String confirmUser;

    @ExcelExport(value = "审批状态", sort = 5)
    private String applyState;


    public String getBatchName() {
        return batchName;
    }

    public void setBatchName(String batchName) {
        this.batchName = batchName;
    }

    public String getCreateUser() {
        return createUser;
    }

    public void setCreateUser(String createUser) {
        this.createUser = createUser;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getApplyState() {
        return applyState;
    }

    public void setApplyState(String applyState) {
        this.applyState = applyState;
    }

    public String getConfirmUser() {
        return confirmUser;
    }

    public void setConfirmUser(String confirmUser) {
        this.confirmUser = confirmUser;
    }
}
