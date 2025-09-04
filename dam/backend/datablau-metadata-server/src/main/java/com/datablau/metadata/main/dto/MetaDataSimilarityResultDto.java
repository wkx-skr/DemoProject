package com.datablau.metadata.main.dto;

import com.datablau.data.common.util.ExcelExport;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 元数据相似度计算结果DTO
 * 
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-16
 * @description 用于保存表与表之间的相似度计算结果
 */
public class MetaDataSimilarityResultDto implements Serializable {
    
    private static final long serialVersionUID = 1L;

    /**
     * 表A英文名
     */
    @ExcelExport(value = "表A英文名", sort = 0)
    private String tableAEnglishName;

    /**
     * 表A中文名
     */
    @ExcelExport(value = "表A中文名", sort = 1)
    private String tableAChineseName;

    /**
     * 表B英文名
     */
    @ExcelExport(value = "表B英文名", sort = 2)
    private String tableBEnglishName;

    /**
     * 表B中文名
     */
    @ExcelExport(value = "表B中文名", sort = 3)
    private String tableBChineseName;

    /**
     * 表英文名相似度，范围0-1，保留两位小数
     */
    @ExcelExport(value = "表英文名相似度", sort = 4)
    private BigDecimal tableEnglishNameSimilarity;

    /**
     * 字段英文名相似度，范围0-1，保留两位小数
     */
    @ExcelExport(value = "字段英文名相似度", sort = 5)
    private BigDecimal fieldEnglishNameSimilarity;

    public MetaDataSimilarityResultDto() {
    }

    public MetaDataSimilarityResultDto(String tableAEnglishName, String tableAChineseName, 
                                     String tableBEnglishName, String tableBChineseName,
                                     BigDecimal tableEnglishNameSimilarity, BigDecimal fieldEnglishNameSimilarity) {
        this.tableAEnglishName = tableAEnglishName;
        this.tableAChineseName = tableAChineseName;
        this.tableBEnglishName = tableBEnglishName;
        this.tableBChineseName = tableBChineseName;
        this.tableEnglishNameSimilarity = tableEnglishNameSimilarity;
        this.fieldEnglishNameSimilarity = fieldEnglishNameSimilarity;
    }

    public String getTableAEnglishName() {
        return tableAEnglishName;
    }

    public void setTableAEnglishName(String tableAEnglishName) {
        this.tableAEnglishName = tableAEnglishName;
    }

    public String getTableAChineseName() {
        return tableAChineseName;
    }

    public void setTableAChineseName(String tableAChineseName) {
        this.tableAChineseName = tableAChineseName;
    }

    public String getTableBEnglishName() {
        return tableBEnglishName;
    }

    public void setTableBEnglishName(String tableBEnglishName) {
        this.tableBEnglishName = tableBEnglishName;
    }

    public String getTableBChineseName() {
        return tableBChineseName;
    }

    public void setTableBChineseName(String tableBChineseName) {
        this.tableBChineseName = tableBChineseName;
    }

    public BigDecimal getTableEnglishNameSimilarity() {
        return tableEnglishNameSimilarity;
    }

    public void setTableEnglishNameSimilarity(BigDecimal tableEnglishNameSimilarity) {
        this.tableEnglishNameSimilarity = tableEnglishNameSimilarity;
    }

    public BigDecimal getFieldEnglishNameSimilarity() {
        return fieldEnglishNameSimilarity;
    }

    public void setFieldEnglishNameSimilarity(BigDecimal fieldEnglishNameSimilarity) {
        this.fieldEnglishNameSimilarity = fieldEnglishNameSimilarity;
    }
} 