package com.datablau.data.asset.controller;


import com.datablau.base.api.ModelCategoryService70;
import com.datablau.base.data.BaseModelCategory;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import com.datablau.data.asset.dto.DesignLabelDropResultTotalDto;
import com.datablau.data.asset.dto.LabelDropInspectionQueryParamDto;
import com.datablau.data.asset.service.DataAssetDdmModelCollectService;
import com.datablau.data.asset.service.DataAssetLabelDropService;
import com.datablau.data.asset.service.DdmRelModelCategoryService;
import com.datablau.data.common.util.DynamicConfigurations;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.RemoteMetaDataExtendService;
import com.datablau.project.api.dto.DdmModelElementDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.List;

@Tag(name = "资产-落标检查 API")
@RestController
@RequestMapping(value = "/labelDrop")
public class DataAssetLabelDropController {

    @Autowired
    private DataAssetDdmModelCollectService dataAssetDdmModelCollectService;
    @Autowired
    private DdmRelModelCategoryService ddmRelModelCategoryServicel;

    @Autowired
    private DataAssetLabelDropService dataAssetLabelDropService;

    @Autowired
    private DatablauRemoteDdmModelServiceNew datablauRemoteDdmModelServiceNew;

    @Autowired
    private RemoteMetaDataExtendService remoteMetaDataExtendService;

    @Autowired
    private ModelCategoryService70 modelCategoryService;

    @GetMapping("/test")
    public List<DdmModelElementDto> test(@RequestParam Long ddmModelId) throws Exception{
        String BigDecimalPro = DynamicConfigurations.INSTANCE.getPropertyValue("configurable.datatypes.BigDecimal");
        String BooleanPro = DynamicConfigurations.INSTANCE.getPropertyValue("configurable.datatypes.Boolean");
        String DatePro = DynamicConfigurations.INSTANCE.getPropertyValue("configurable.datatypes.Date");
        String StringPro = DynamicConfigurations.INSTANCE.getPropertyValue("configurable.datatypes.String");

        //List<DdmModelElementDto> ddmModelElementDtos = datablauRemoteDdmModelServiceNew.queryDdmModelElementDetail(ddmModelId);

        List<DdmModelElementDto> ddmModelElementDtos1 = remoteMetaDataExtendService.queryDdmModelElementDetail(ddmModelId);
        return ddmModelElementDtos1;
    }

    @Operation(summary = "设计落标检查")
    @PostMapping("/getDesignLabelDropResult")
    public DesignLabelDropResultTotalDto getDesignLabelDropResult(@RequestBody LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception{
        return dataAssetLabelDropService.getDesignLabelDropResult(labelDropInspectionQueryParamDto);
    }

    @PostMapping("/exportDesignLabelDropResultByWord")
    @Operation(summary = "设计落标检查导出word")
    public ResponseEntity<Resource> exportDesignLabelDropResultByWord(@RequestBody LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception {
        labelDropInspectionQueryParamDto.setaExportWord(true);
        ByteArrayOutputStream resourse = dataAssetLabelDropService.exportDesignLabelDropResultByWord(labelDropInspectionQueryParamDto);

        // 构造HTTP响应
        HttpHeaders headers = new HttpHeaders();
        String filename = "设计落标报告.docx";


        //        headers.setContentDispositionFormData("attachment", encodedFileName);
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");
        headers.add("charset", "utf-8");
        headers.add("Content-Disposition", "attachment;filename=\""+ URLEncoder.encode(filename,"UTF-8")+"\"");
        Resource resource = new InputStreamResource(new ByteArrayInputStream(resourse.toByteArray()));
        return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);
    }

    /**
     * 导出设计落标明细
     *
     * @param labelDropInspectionQueryParamDto
     */
    @Operation(summary = "导出设计落标明细excel")
    @RequestMapping(value = "/exportDesignLabelDropResult", method = RequestMethod.POST)
    public ResponseEntity<byte[]> exportDesignLabelDropResult(@RequestBody LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception {
        return dataAssetLabelDropService.exportRequirementPublish(labelDropInspectionQueryParamDto);
    }

    @Operation(summary = "技术落标检查")
    @PostMapping("/getTechLabelDropResult")
    public DesignLabelDropResultTotalDto getTechLabelDropResult(@RequestBody LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception{
        return dataAssetLabelDropService.getTechLabelDropResult(labelDropInspectionQueryParamDto);
    }

    @GetMapping("/getTechLabelDropModelCategoryCount")
    public Integer getTechLabelDropModelCategoryCount(){
        return dataAssetLabelDropService.getTechLabelDropModelCategoryCount();
    }

    /**
     * 导出技术落标明细
     *
     * @param labelDropInspectionQueryParamDto
     */
    @Operation(summary = "导出技术落标明细excel")
    @RequestMapping(value = "/exportTechLabelDropResult", method = RequestMethod.POST)
    public ResponseEntity<byte[]> exportTechLabelDropResult(@RequestBody LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception {
        return dataAssetLabelDropService.exportTechLabelDropResult(labelDropInspectionQueryParamDto);
    }

    @PostMapping("/exportTechLabelDropResultByWord")
    @Operation(summary = "技术落标检查导出word")
    public ResponseEntity<Resource> exportTechLabelDropResultByWord(@RequestBody LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception {
        labelDropInspectionQueryParamDto.setaExportWord(true);
        ByteArrayOutputStream resourse = dataAssetLabelDropService.exportTechLabelDropResultByWord(labelDropInspectionQueryParamDto);

        // 构造HTTP响应
        HttpHeaders headers = new HttpHeaders();
        String filename = "技术落标报告.docx";


        //        headers.setContentDispositionFormData("attachment", encodedFileName);
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");
        headers.add("charset", "utf-8");
        headers.add("Content-Disposition", "attachment;filename=\""+ URLEncoder.encode(filename,"UTF-8")+"\"");
        Resource resource = new InputStreamResource(new ByteArrayInputStream(resourse.toByteArray()));
        return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);
    }

}
