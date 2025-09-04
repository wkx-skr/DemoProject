package com.datablau.data.asset.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * 数据流导入结果
 */
public class ExtDataAssetsDataFlowImportResult {
    
    /**
     * 总处理记录数
     */
    private int totalCount;
    
    /**
     * 成功导入记录数
     */
    private int successCount;
    
    /**
     * 跳过记录数
     */
    private int skipCount;
    
    /**
     * 跳过的记录详情
     */
    private List<String> skipReasons;
    
    /**
     * 是否导入成功（没有跳过记录）
     */
    private boolean success;
    
    public ExtDataAssetsDataFlowImportResult() {
        this.skipReasons = new ArrayList<>();
    }
    
    public int getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }
    
    public int getSuccessCount() {
        return successCount;
    }
    
    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }
    
    public int getSkipCount() {
        return skipCount;
    }
    
    public void setSkipCount(int skipCount) {
        this.skipCount = skipCount;
    }
    
    public List<String> getSkipReasons() {
        return skipReasons;
    }
    
    public void setSkipReasons(List<String> skipReasons) {
        this.skipReasons = skipReasons;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    /**
     * 添加跳过记录的原因
     */
    public void addSkipReason(String reason) {
        this.skipReasons.add(reason);
        this.skipCount = this.skipReasons.size();
    }
    
    /**
     * 获取结果摘要信息
     */
    public String getSummary() {
        if (skipCount == 0) {
            return String.format("导入成功：共处理 %d 条记录，全部导入成功", totalCount);
        } else {
            return String.format("导入完成：共处理 %d 条记录，成功 %d 条，跳过 %d 条", 
                    totalCount, successCount, skipCount);
        }
    }
    
    /**
     * 获取详细的错误信息
     */
    public String getDetailMessage() {
        if (skipCount == 0) {
            return getSummary();
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append(getSummary());
        sb.append("\n\n跳过记录详情：\n");
        for (int i = 0; i < skipReasons.size(); i++) {
            sb.append(String.format("%d. %s\n", i + 1, skipReasons.get(i)));
        }
        return sb.toString();
    }
} 