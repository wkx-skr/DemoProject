package com.datablau.metadata.main.dto.global.search;

import com.datablau.metadata.common.dto.DataDepartmentTableDto;
import com.datablau.metadata.common.dto.DataManagerTableDto;
import com.datablau.metadata.main.service.elastic.wrapper.GlobalSearchWrapper;

import java.io.Serializable;
import java.util.List;

public class TableSearchResultNew extends GlobalSearchWrapper implements Serializable {

    private static final long serialVersionUID = 1L;
    private Long objectId;
    private boolean hasSampleData;
    private boolean hasQualityData;
    private List<DataDepartmentTableDto> dataDepartments;
    private List<DataManagerTableDto> dataManagers;
    private String modelType; //数据库类型
    private String owner; //负责人
    private String useDescription; //使用描述
    private String businessDescription; //业务描述
    private String businessDomain; //业务域


    public TableSearchResultNew(GlobalSearchWrapper searchWrapper) {
        super(searchWrapper);
        this.objectId = Long.parseLong(searchWrapper.getItemId());
    }

    public Long getObjectId() {
        return objectId;
    }

    public void setObjectId(Long objectId) {
        this.objectId = objectId;
    }

    public boolean isHasSampleData() {
        return hasSampleData;
    }

    public void setHasSampleData(boolean hasSampleData) {
        this.hasSampleData = hasSampleData;
    }

    public boolean isHasQualityData() {
        return hasQualityData;
    }

    public void setHasQualityData(boolean hasQualityData) {
        this.hasQualityData = hasQualityData;
    }

    public List<DataDepartmentTableDto> getDataDepartments() {
        return dataDepartments;
    }

    public void setDataDepartments(List<DataDepartmentTableDto> dataDepartments) {
        this.dataDepartments = dataDepartments;
    }

    public List<DataManagerTableDto> getDataManagers() {
        return dataManagers;
    }

    public void setDataManagers(List<DataManagerTableDto> dataManagers) {
        this.dataManagers = dataManagers;
    }

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getUseDescription() {
        return useDescription;
    }

    public void setUseDescription(String useDescription) {
        this.useDescription = useDescription;
    }

    public String getBusinessDescription() {
        return businessDescription;
    }

    public void setBusinessDescription(String businessDescription) {
        this.businessDescription = businessDescription;
    }

    public String getBusinessDomain() {
        return businessDomain;
    }

    public void setBusinessDomain(String businessDomain) {
        this.businessDomain = businessDomain;
    }
}
