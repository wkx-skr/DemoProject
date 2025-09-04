package com.datablau.data.asset.dto;

/**
 * @author: hxs
 * @date: 2025/4/28 15:16
 */
public class CatalogPropertyExtDto extends CatalogPropertyDto{
    private String domainId;
    private String isNull;
    private String sourceSystemId;

    public String getSourceSystemId() {
        return sourceSystemId;
    }

    public void setSourceSystemId(String sourceSystemId) {
        this.sourceSystemId = sourceSystemId;
    }

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getIsNull() {
        return isNull;
    }

    public void setIsNull(String isNull) {
        this.isNull = isNull;
    }
}
