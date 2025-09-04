package com.datablau.metadata.main.controller;

import com.datablau.metadata.main.entity.share.file.ShareFileUserDefinedProperty;
import com.datablau.metadata.main.service.share.file.api.ShareFileUserDefinedPropertyService;
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
@RequestMapping("/shareFileUdp")
@Tag(name = "共享文件属性")
public class ShareFileUserDefinedPropertyController extends LocalBaseController {

    @Autowired
    ShareFileUserDefinedPropertyService propertyService;

    public ShareFileUserDefinedPropertyController(@Autowired RoleService roleService) {
        super(roleService);
    }

    @Operation(summary = "获取共享文件属性")
    @RequestMapping(value = "/", method = RequestMethod.GET)
    public List<ShareFileUserDefinedProperty> getAllShareFileUdp(){
        return propertyService.getAllShareFileUdp();
    }

    @Operation(summary = "删除共享文件属性")
    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public void deleteShareFileUdpById(@RequestBody ShareFileUserDefinedProperty property){
        propertyService.addShareFileUdp(property);
    }

    @Operation(summary = "更新共享文件属性")
    @RequestMapping(value = "/", method = RequestMethod.POST)
    public void updateShareFileUdp(@RequestBody ShareFileUserDefinedProperty property){
        propertyService.updateShareFileUdp(property);
    }

    @Operation(summary = "删除共享文件属性")
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void deleteShareFileUdpById(@Parameter(name = "id") @PathVariable("id") Long id){
        propertyService.deleteShareFileUdpById(id);
    }


}
