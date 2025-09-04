package com.datablau.data.quality.controller;

import com.andorj.common.core.annotation.Feature;
import com.andorj.license.utility.lic.LicenseInfo;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.quality.metadata.service.DataQualityRegionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author huajun.li
 * date 2019/12/3
 */
@RestController
@RequestMapping("/region")
@Tag(name = "与数据质量的地区相关联的REST API")
@Feature(LicenseInfo.FE_QUALITY)
public class DataQualityRegionController extends BaseController {

    @Autowired
    DataQualityRegionService regionService;


    @Operation(summary = "统计数量")
    @PostMapping(value = "/count/detail")
    public Map<String, Object> initDetailCount(@RequestBody List<String> tagNames) {
        return regionService.initCountDetail(tagNames);
    }

}
