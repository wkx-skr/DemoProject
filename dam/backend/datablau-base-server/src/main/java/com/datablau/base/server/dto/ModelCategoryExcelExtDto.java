package com.datablau.base.server.dto;

import com.andorj.model.common.annotation.ExcelColumn;
import com.datablau.base.data.ModelCategoryExcelDto;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class ModelCategoryExcelExtDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long categoryId;

    @ExcelColumn(
            columnNames = {"父系统名称"}
    )
    private String parentCategoryName;

    @ExcelColumn(
            columnNames = {"系统名称"}
    )
    private String categoryName;
    @ExcelColumn(
            columnNames = {"系统简写"}
    )
    private String categoryAbbreviation;
    @ExcelColumn(
            columnNames = {"IT部门"}
    )
    private String itDepartment;
    @ExcelColumn(
            columnNames = {"业务部门"}
    )
    private String businessDepartment;
    @ExcelColumn(
            columnNames = {"业务域"}
    )
    private String zone;
    @ExcelColumn(
            columnNames = {"重要性"}
    )
    private String importance;
    @ExcelColumn(
            columnNames = {"数据源数量"}
    )
    private Long dataSourceQuantity = 0L;
    @ExcelColumn(
            columnNames = {"描述"}
    )
    private String description;
    @ExcelColumn(
            columnNames = {"负责人"}
    )
    private String owner;
    @ExcelColumn(
            columnNames = {"部署地"}
    )
    private String deployment;
    @ExcelColumn(
            columnNames = {"业务属性值"},
            asMultipleCols = true
    )
    private Map<String, String> udpMaps;
    private String attributionCenter;
    private List<String> busOwner;



    public ModelCategoryExcelExtDto() {
    }

    public String getParentCategoryName() {
        return parentCategoryName;
    }

    public void setParentCategoryName(String parentCategoryName) {
        this.parentCategoryName = parentCategoryName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryAbbreviation() {
        return categoryAbbreviation;
    }

    public void setCategoryAbbreviation(String categoryAbbreviation) {
        this.categoryAbbreviation = categoryAbbreviation;
    }

    public String getItDepartment() {
        return itDepartment;
    }

    public void setItDepartment(String itDepartment) {
        this.itDepartment = itDepartment;
    }

    public String getBusinessDepartment() {
        return businessDepartment;
    }

    public void setBusinessDepartment(String businessDepartment) {
        this.businessDepartment = businessDepartment;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public String getImportance() {
        return importance;
    }

    public void setImportance(String importance) {
        this.importance = importance;
    }

    public Long getDataSourceQuantity() {
        return dataSourceQuantity;
    }

    public void setDataSourceQuantity(Long dataSourceQuantity) {
        this.dataSourceQuantity = dataSourceQuantity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getDeployment() {
        return deployment;
    }

    public void setDeployment(String deployment) {
        this.deployment = deployment;
    }

    public Map<String, String> getUdpMaps() {
        return udpMaps;
    }

    public void setUdpMaps(Map<String, String> udpMaps) {
        this.udpMaps = udpMaps;
    }

    public String getAttributionCenter() {
        return attributionCenter;
    }

    public void setAttributionCenter(String attributionCenter) {
        this.attributionCenter = attributionCenter;
    }

    public List<String> getBusOwner() {
        return busOwner;
    }

    public void setBusOwner(List<String> busOwner) {
        this.busOwner = busOwner;
    }
}
