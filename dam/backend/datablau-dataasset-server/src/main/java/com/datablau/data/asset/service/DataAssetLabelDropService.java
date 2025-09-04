package com.datablau.data.asset.service;

import cn.hutool.poi.excel.ExcelWriter;
import com.datablau.data.asset.dto.DesignLabelDropResultDto;
import com.datablau.data.asset.dto.DesignLabelDropResultTotalDto;
import com.datablau.data.asset.dto.LabelDropInspectionQueryParamDto;
import org.springframework.http.ResponseEntity;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * @author: zxy
 * @date: 2025/4/23
 */
public interface DataAssetLabelDropService {


    DesignLabelDropResultTotalDto getDesignLabelDropResult(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception;

    ResponseEntity<byte[]> exportRequirementPublish(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception;

    DesignLabelDropResultTotalDto getTechLabelDropResult(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto);

    ResponseEntity<byte[]> exportTechLabelDropResult(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto)throws Exception;

    ByteArrayOutputStream exportDesignLabelDropResultByWord(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception;

    ByteArrayOutputStream exportTechLabelDropResultByWord(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception;

    Integer getTechLabelDropModelCategoryCount();

}
