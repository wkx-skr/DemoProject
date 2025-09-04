package com.datablau.data.asset.dto;

import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-21 17:25
 * @description  存储资产检查中  某个用户的统计信息的dto
 */
public class AssetsCheckUserDto implements Serializable {

    private Integer columnSize = 0;
    // 表总数
    private Integer tableSize = 0;

    // 有中文名称的字段
    private Integer hasLogicalNameColumnsSize = 0;
    // 有安全等级的字段数量
    private Integer hasSafeColumnsSize = 0;

    // 有中文名称的字段
    private Integer hasLogicalNameTableSize = 0;
    // 有安全等级的表数量
    private Integer hasSafeTableSize = 0;

    // 字段和资产L5类型匹配数量
    private Integer hasTypeMatchSize = 0;
    // 业务描述填充率 （只有表有）
    private  Integer hasBusTableSize = 0;
    // 使用填充率 （只有表有）
    private Integer hasUseTableSize = 0;

    private Integer hasComplianceRateSize = 0;




    public Integer getColumnSize() {
        return columnSize;
    }

    public void setColumnSize(Integer columnSize) {
        this.columnSize = columnSize;
    }

    public Integer getTableSize() {
        return tableSize;
    }

    public void setTableSize(Integer tableSize) {
        this.tableSize = tableSize;
    }

    public Integer getHasLogicalNameColumnsSize() {
        return hasLogicalNameColumnsSize;
    }

    public void setHasLogicalNameColumnsSize(Integer hasLogicalNameColumnsSize) {
        this.hasLogicalNameColumnsSize = hasLogicalNameColumnsSize;
    }

    public Integer getHasSafeColumnsSize() {
        return hasSafeColumnsSize;
    }

    public void setHasSafeColumnsSize(Integer hasSafeColumnsSize) {
        this.hasSafeColumnsSize = hasSafeColumnsSize;
    }

    public Integer getHasLogicalNameTableSize() {
        return hasLogicalNameTableSize;
    }

    public void setHasLogicalNameTableSize(Integer hasLogicalNameTableSize) {
        this.hasLogicalNameTableSize = hasLogicalNameTableSize;
    }

    public Integer getHasSafeTableSize() {
        return hasSafeTableSize;
    }

    public void setHasSafeTableSize(Integer hasSafeTableSize) {
        this.hasSafeTableSize = hasSafeTableSize;
    }

    public Integer getHasTypeMatchSize() {
        return hasTypeMatchSize;
    }

    public void setHasTypeMatchSize(Integer hasTypeMatchSize) {
        this.hasTypeMatchSize = hasTypeMatchSize;
    }

    public Integer getHasBusTableSize() {
        return hasBusTableSize;
    }

    public void setHasBusTableSize(Integer hasBusTableSize) {
        this.hasBusTableSize = hasBusTableSize;
    }

    public Integer getHasUseTableSize() {
        return hasUseTableSize;
    }

    public void setHasUseTableSize(Integer hasUseTableSize) {
        this.hasUseTableSize = hasUseTableSize;
    }

    public Integer getHasComplianceRateSize() {
        return hasComplianceRateSize;
    }

    public void setHasComplianceRateSize(Integer hasComplianceRateSize) {
        this.hasComplianceRateSize = hasComplianceRateSize;
    }

    public void incrementColumnSize() {
        this.columnSize++;
    }

    public void incrementTableSize() {
        this.tableSize++;
    }

    public void incrementHasLogicalNameColumnsSize() {
        this.hasLogicalNameColumnsSize++;
    }

    public void incrementHasSafeColumnsSize() {
        this.hasSafeColumnsSize++;
    }

    public void incrementHasLogicalNameTableSize() {
        this.hasLogicalNameTableSize++;
    }

    public void incrementHasSafeTableSize() {
        this.hasSafeTableSize++;
    }

    public void incrementHasTypeMatchSize() {
        this.hasTypeMatchSize++;
    }

    public void incrementHasBusTableSize() {
        this.hasBusTableSize++;
    }

    public void incrementHasUseTableSize() {
        this.hasUseTableSize++;
    }

    public void incrementHasComplianceRateSize() {
        this.hasComplianceRateSize++;
    }

}
