package com.datablau.data.asset.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * 数据流权限转移模式
 */
public class DataFlowTransferPattern {
    
    /**
     * 逻辑实体编码
     */
    private String l4Code;
    
    /**
     * 源系统（当前拥有源U权限的系统）
     */
    private TransferSystemInfo fromSystem;
    
    /**
     * 目标系统（即将获得源U权限的系统）
     */
    private TransferSystemInfo toSystem;
    
    /**
     * 是否为有效的转移模式
     */
    private boolean validTransfer;
    
    /**
     * 转移验证失败原因
     */
    private List<String> validationErrors;
    
    public DataFlowTransferPattern() {
        this.validationErrors = new ArrayList<>();
    }
    
    public static class TransferSystemInfo {
        private String systemCode;
        private Long modelCategoryId;
        private String oldPermissions;
        private String newPermissions;
        private Boolean oldDistributionSource;
        private Boolean newDistributionSource;
        
        // getters and setters
        public String getSystemCode() { return systemCode; }
        public void setSystemCode(String systemCode) { this.systemCode = systemCode; }
        
        public Long getModelCategoryId() { return modelCategoryId; }
        public void setModelCategoryId(Long modelCategoryId) { this.modelCategoryId = modelCategoryId; }
        
        public String getOldPermissions() { return oldPermissions; }
        public void setOldPermissions(String oldPermissions) { this.oldPermissions = oldPermissions; }
        
        public String getNewPermissions() { return newPermissions; }
        public void setNewPermissions(String newPermissions) { this.newPermissions = newPermissions; }
        
        public Boolean getOldDistributionSource() { return oldDistributionSource; }
        public void setOldDistributionSource(Boolean oldDistributionSource) { this.oldDistributionSource = oldDistributionSource; }
        
        public Boolean getNewDistributionSource() { return newDistributionSource; }
        public void setNewDistributionSource(Boolean newDistributionSource) { this.newDistributionSource = newDistributionSource; }
        
        public boolean isLosingSourceU() {
            return (oldPermissions != null && oldPermissions.contains("U") && 
                    oldDistributionSource != null && oldDistributionSource) &&
                   !(newPermissions != null && newPermissions.contains("U") && 
                     newDistributionSource != null && newDistributionSource);
        }
        
        public boolean isGainingSourceU() {
            return !(oldPermissions != null && oldPermissions.contains("U") && 
                     oldDistributionSource != null && oldDistributionSource) &&
                   (newPermissions != null && newPermissions.contains("U") && 
                    newDistributionSource != null && newDistributionSource);
        }
        
        public boolean isLosingC() {
            return (oldPermissions != null && oldPermissions.contains("C")) &&
                   !(newPermissions != null && newPermissions.contains("C"));
        }
        
        public boolean isGainingC() {
            return !(oldPermissions != null && oldPermissions.contains("C")) &&
                   (newPermissions != null && newPermissions.contains("C"));
        }
    }
    
    // getters and setters
    public String getL4Code() { return l4Code; }
    public void setL4Code(String l4Code) { this.l4Code = l4Code; }
    
    public TransferSystemInfo getFromSystem() { return fromSystem; }
    public void setFromSystem(TransferSystemInfo fromSystem) { this.fromSystem = fromSystem; }
    
    public TransferSystemInfo getToSystem() { return toSystem; }
    public void setToSystem(TransferSystemInfo toSystem) { this.toSystem = toSystem; }
    
    public boolean isValidTransfer() { return validTransfer; }
    public void setValidTransfer(boolean validTransfer) { this.validTransfer = validTransfer; }
    
    public List<String> getValidationErrors() { return validationErrors; }
    public void setValidationErrors(List<String> validationErrors) { this.validationErrors = validationErrors; }
    
    public void addValidationError(String error) {
        this.validationErrors.add(error);
    }
} 