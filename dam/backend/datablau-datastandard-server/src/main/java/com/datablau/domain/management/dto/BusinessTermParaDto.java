package com.datablau.domain.management.dto;

import com.datablau.domain.management.jpa.entity.BusinessTerm;

import java.util.ArrayList;
import java.util.List;

/**
 * @ClassName：BusinessTermParaDto
 * @Author: dingzicheng
 * @Date: 2024/9/4 15:19
 * @Description: 业务术语导出成功与失败Dto
 */
public class BusinessTermParaDto {
    private List<BusinessTermExcelDto> businessTermDto = new ArrayList<>();
    private List<BusinessTerm> insertBusinessTerm = new ArrayList<>();
    private List<BusinessTermExcelDto> errorBusinessTerm = new ArrayList<>();

    public List<BusinessTermExcelDto> getBusinessTermDto() {
        return businessTermDto;
    }

    public void setBusinessTermDto(List<BusinessTermExcelDto> businessTermDto) {
        this.businessTermDto = businessTermDto;
    }

    public List<BusinessTerm> getInsertBusinessTerm() {
        return insertBusinessTerm;
    }

    public void setInsertBusinessTerm(List<BusinessTerm> insertBusinessTerm) {
        this.insertBusinessTerm = insertBusinessTerm;
    }

    public List<BusinessTermExcelDto> getErrorBusinessTerm() {
        return errorBusinessTerm;
    }

    public void setErrorBusinessTerm(List<BusinessTermExcelDto> errorBusinessTerm) {
        this.errorBusinessTerm = errorBusinessTerm;
    }
}
