package com.datablau.data.asset.controller;

import com.datablau.data.asset.api.DataAssetsCatalogApplyRecordService;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.jpa.entity.DataAssetsCatalogApplyRecord;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataasset.enums.RecordDataType;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "申请记录")
@RestController
@RequestMapping(value = "/apply/record")
public class DataAssetsCatalogApplyRecordController extends BaseController {


    @Autowired
    private DataAssetsCatalogApplyRecordService dataAssetsCatalogApplyRecordService;

    public DataAssetsCatalogApplyRecordController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "获取最近的一条提交记录")
    @GetMapping(value = "/{dataId}")
    public ResResultDto<DataAssetsCatalogApplyRecord> findApplyRecord(@PathVariable Long dataId,
                                                                      @RequestParam("recordType") String recordType) {

        RecordDataType recordDataType = RecordDataType.valueOf(recordType);
        DataAssetsCatalogApplyRecord record = dataAssetsCatalogApplyRecordService.findTopRecord(dataId, recordDataType);
        return ResResultDto.ok(record);
    }
}
