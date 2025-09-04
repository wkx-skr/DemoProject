package com.datablau.metadata.main.dto.mm;

import java.io.Serializable;
import java.util.List;

public class ApiMM implements Serializable {

    private static final long serialVersionUID = 1L;

    private String apiId;

    private String apiName;

    private String dataSourceType;

    private String apiDescription;

    private String requestParameters;

    private String returnParameters;

    private String dataBase;

    private List<String> table;

    private String manager;

    private String version;

    public String getApiId() {
        return apiId;
    }

    public void setApiId(String apiId) {
        this.apiId = apiId;
    }

    public String getApiName() {
        return apiName;
    }

    public void setApiName(String apiName) {
        this.apiName = apiName;
    }

    public String getDataSourceType() {
        return dataSourceType;
    }

    public void setDataSourceType(String dataSourceType) {
        this.dataSourceType = dataSourceType;
    }

    public String getApiDescription() {
        return apiDescription;
    }

    public void setApiDescription(String apiDescription) {
        this.apiDescription = apiDescription;
    }

    public String getRequestParameters() {
        return requestParameters;
    }

    public void setRequestParameters(String requestParameters) {
        this.requestParameters = requestParameters;
    }

    public String getReturnParameters() {
        return returnParameters;
    }

    public void setReturnParameters(String returnParameters) {
        this.returnParameters = returnParameters;
    }

    public String getDataBase() {
        return dataBase;
    }

    public void setDataBase(String dataBase) {
        this.dataBase = dataBase;
    }

    public List<String> getTable() {
        return table;
    }

    public void setTable(List<String> table) {
        this.table = table;
    }

    public String getManager() {
        return manager;
    }

    public void setManager(String manager) {
        this.manager = manager;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
