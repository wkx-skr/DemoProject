package com.datablau.domain.management.dto;

import com.datablau.data.common.util.ExcelExport;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-10 14:11
 * @description
 */
public class BatchApplyDetailExportDto implements Serializable {

    @ExcelExport(value = "中文名称", sort = 0)
    private String cnName;

    @ExcelExport(value = "英文名称", sort = 1)
    private String enName;

    @ExcelExport(value = "字段编码", sort = 2)
    private String code;

    @ExcelExport(value = "资产类型", sort = 3)
    private String dataType;

   // @ExcelExport(value = "原值", sort = 4)
    private String oldData;

   // @ExcelExport(value = "新值", sort = 5)
    private String neData;

    @ExcelExport(value = "提交人", sort = 4)
    private String submitUser;

    @ExcelExport(value = "提交时间", sort = 5)
    private LocalDateTime createTime;

    @ExcelExport(value = "确认状态", sort = 6)
    private String orderState;

    public String getCnName() {
        return cnName;
    }

    public void setCnName(String cnName) {
        this.cnName = cnName;
    }

    public String getEnName() {
        return enName;
    }

    public void setEnName(String enName) {
        this.enName = enName;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getOldData() {
        return oldData;
    }

    public void setOldData(String oldData) {
        this.oldData = oldData;
    }

    public String getNeData() {
        return neData;
    }

    public void setNeData(String neData) {
        this.neData = neData;
    }

    public String getSubmitUser() {
        return submitUser;
    }

    public void setSubmitUser(String submitUser) {
        this.submitUser = submitUser;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public String getOrderState() {
        return orderState;
    }

    public void setOrderState(String orderState) {
        this.orderState = orderState;
    }
}
