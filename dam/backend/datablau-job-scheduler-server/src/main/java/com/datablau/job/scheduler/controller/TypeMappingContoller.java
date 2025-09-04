package com.datablau.job.scheduler.controller;

import com.datablau.job.scheduler.data.QueryDto;
import com.datablau.job.scheduler.data.TypeMappingDto;
import com.datablau.job.scheduler.service.JobTypeMappingService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/10/19 11:06
 */
@RestController
@RequestMapping("/typeMapping")
public class TypeMappingContoller extends BaseControllers {

    @Autowired
    private JobTypeMappingService typeMappingService;

    @PostMapping("/getList")
    @Operation(summary = "获取类型映射列表")
    public List<TypeMappingDto> getList(){
        return typeMappingService.getTypeList();
    }

    @PostMapping("/getPages")
    @Operation(summary = "查询分页")
    public Page<TypeMappingDto> getPages(@RequestBody QueryDto queryDto){
        return typeMappingService.getPages(queryDto);
    }

    @PostMapping("/updateMapping")
    @Operation(summary = "更新或保存映射")
    public void updateMapping(@RequestBody TypeMappingDto typeMapping){
        typeMappingService.updateTypeMapping(typeMapping);
    }

}
