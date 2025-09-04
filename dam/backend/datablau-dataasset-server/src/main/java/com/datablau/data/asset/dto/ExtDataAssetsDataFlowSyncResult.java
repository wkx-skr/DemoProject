package com.datablau.data.asset.dto;

/**
 * 数据流同步结果
 */
public class ExtDataAssetsDataFlowSyncResult {
    
    /**
     * 处理的L4目录总数
     */
    private int totalCatalogs;
    
    /**
     * 新增记录数
     */
    private int addedCount;
    
    /**
     * 跳过的已存在记录数
     */
    private int skippedExistingCount;
    
    /**
     * 跳过的无效记录数（缺少必要字段等）
     */
    private int skippedInvalidCount;
    
    /**
     * 同步是否成功
     */
    private boolean success;
    
    /**
     * 同步结果消息
     */
    private String message;
    
    public ExtDataAssetsDataFlowSyncResult() {
        this.success = true;
    }
    
    public int getTotalCatalogs() {
        return totalCatalogs;
    }
    
    public void setTotalCatalogs(int totalCatalogs) {
        this.totalCatalogs = totalCatalogs;
    }
    
    public int getAddedCount() {
        return addedCount;
    }
    
    public void setAddedCount(int addedCount) {
        this.addedCount = addedCount;
    }
    
    public int getSkippedExistingCount() {
        return skippedExistingCount;
    }
    
    public void setSkippedExistingCount(int skippedExistingCount) {
        this.skippedExistingCount = skippedExistingCount;
    }
    
    public int getSkippedInvalidCount() {
        return skippedInvalidCount;
    }
    
    public void setSkippedInvalidCount(int skippedInvalidCount) {
        this.skippedInvalidCount = skippedInvalidCount;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    /**
     * 获取同步结果摘要
     */
    public String getSummary() {
        return String.format("同步完成：处理%d个L4目录，新增%d条记录，跳过%d条已存在记录，跳过%d条无效记录", 
                           totalCatalogs, addedCount, skippedExistingCount, skippedInvalidCount);
    }
} 