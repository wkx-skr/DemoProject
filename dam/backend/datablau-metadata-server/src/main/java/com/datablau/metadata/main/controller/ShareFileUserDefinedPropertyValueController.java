package com.datablau.metadata.main.controller;

import com.datablau.metadata.main.entity.share.file.ShareFileUserDefinedPropertyValue;
import com.datablau.metadata.main.service.share.file.api.ShareFileUserDefinedPropertyValueService;
import com.datablau.metadata.main.service.share.file.dto.ShareFileUserDefinedPropertyDto;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/shareFileUdpVal")
@Tag(name = "共享文件属性值")
public class ShareFileUserDefinedPropertyValueController extends LocalBaseController {

    @Autowired
    ShareFileUserDefinedPropertyValueService valueService;

    public ShareFileUserDefinedPropertyValueController(@Autowired RoleService roleService) {
        super(roleService);
    }

    @Operation(summary = "获取共享文件属性")
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public List<ShareFileUserDefinedPropertyDto> getShareFileUdpValue(@Parameter(name = "id") @PathVariable(value = "id") Long id){
        return valueService.getShareFileUdpValue(id);
    }

    @Operation(summary = "添加共享文件属性")
    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public void addShareFileUdpVal(@RequestBody ShareFileUserDefinedPropertyValue value){
        valueService.addShareFileUdpVal(value);
    }

    @Operation(summary = "更新共享文件属性")
    @RequestMapping(value = "/", method = RequestMethod.POST)
    public void updateShareFileUdpVal(@RequestBody ShareFileUserDefinedPropertyValue value){
        valueService.updateShareFileUdpVal(value);
    }

    @Operation(summary = "删除共享文件属性")
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void deleteShareFileUdpValById(@Parameter(name = "id") @PathVariable(value = "id") Long id){
        valueService.deleteShareFileUdpValById(id);
    }

}
