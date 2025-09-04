package com.datablau.data.asset.controller;

import com.datablau.data.asset.api.DataAssetsCatalogChangeRecordService;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.jpa.entity.DataAssetsCatalogChangeRecord;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataasset.dto.CatalogChangeRecordDto;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Tag(name = "目录修改记录")
@RestController
@RequestMapping(value = "/catalog/change/record")
public class DataAssetsCatalogChangeRecordController extends BaseController {


    @Autowired
    private DataAssetsCatalogChangeRecordService dataAssetsCatalogChangeRecordService;

    public DataAssetsCatalogChangeRecordController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }
    @Operation(summary = "目录修改记录")
    @GetMapping(value = "/{pageNum}/{pageSize}")
    public ResResultDto<Page<DataAssetsCatalogChangeRecord>> page(@PathVariable int pageNum,
                                                                  @PathVariable int pageSize,
                                                                  @RequestParam(name = "catalogId") Long catalogId) {
        Page<DataAssetsCatalogChangeRecord> dataAssetsCatalogChangeRecords = dataAssetsCatalogChangeRecordService.page(catalogId, pageNum, pageSize);
        return ResResultDto.ok(dataAssetsCatalogChangeRecords);
    }


    @Operation(summary = "保存修改记录")
    @PostMapping(value = "/save")
    public ResResultDto<?> save(@RequestBody DataAssetsCatalogChangeRecord dataAssetsCatalogChangeRecord){
        CatalogChangeRecordDto catalogChangeRecordEntity = new CatalogChangeRecordDto();
        catalogChangeRecordEntity.setCatalogId(dataAssetsCatalogChangeRecord.getCatalogId());
        catalogChangeRecordEntity.setContent(dataAssetsCatalogChangeRecord.getContent());
        catalogChangeRecordEntity.setVersion(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        catalogChangeRecordEntity.setChangeTime(LocalDateTime.now());
        dataAssetsCatalogChangeRecordService.save(catalogChangeRecordEntity);
        return ResResultDto.ok();
    }
}
