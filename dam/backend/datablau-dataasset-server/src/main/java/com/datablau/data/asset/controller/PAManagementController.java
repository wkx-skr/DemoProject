package com.datablau.data.asset.controller;

import com.andorj.common.data.PageResult;
import com.datablau.data.asset.dto.PAManagementDto;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.impl.PAManagementServiceImpl;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 公告信息管理
 *
 * @Author: leipengfei
 * @CreateTime: 2023-11-21  16:33
 * @Description: TODO
 */
@Tag(name = "公告信息管理")
@RestController
@RequestMapping(value = "/pa")
public class PAManagementController extends BaseController {

    @Autowired
    private PAManagementServiceImpl paManagementService;

    @Operation(summary = "新增或修改公告信息")
    @PostMapping("/addorupdate")
    public ResResultDto addOrUpdatePA(@RequestBody PAManagementDto param) {
        try {
            paManagementService.addOrUpdate(param, getCurrentUser());
            return ResResultDto.ok();
        } catch (Exception e) {
            return ResResultDto.error(e.getMessage());
        }
    }


    @Operation(summary = "查看公告信息")
    @GetMapping("/{id}")
    public ResResultDto<PAManagementDto> getPAById(@PathVariable("id") Long id) {
        try {
            PAManagementDto data = paManagementService.getPAById(id);
            return ResResultDto.ok(data);
        } catch (Exception e) {
            return ResResultDto.error(e.getMessage());
        }
    }

    @Operation(summary = "删除公告信息")
    @DeleteMapping("/{id}")
    public ResResultDto<PAManagementDto> deletePAById(@PathVariable("id") Long id) {
        try {
            paManagementService.deletePAById(id);
            return ResResultDto.ok();
        } catch (Exception e) {
            return ResResultDto.error(e.getMessage());
        }
    }

    @Operation(summary = "发布公告信息")
    @PutMapping("/publish/{id}")
    public ResResultDto<PAManagementDto> publishPAById(@PathVariable("id") Long id) {
        try {
            paManagementService.publishPAById(id);
            return ResResultDto.ok();
        } catch (Exception e) {
            return ResResultDto.error(e.getMessage());
        }
    }


    @Operation(summary = "下线公告信息")
    @PutMapping("/unpublish/{id}")
    public ResResultDto<PAManagementDto> unPublishPAById(@PathVariable("id") Long id) {
        try {
            paManagementService.unPublishPAById(id);
            return ResResultDto.ok();
        } catch (Exception e) {
            return ResResultDto.error(e.getMessage());
        }
    }

    @Operation(summary = "公告列表")
    @GetMapping("/list")
    public ResResultDto<PageResult<PAManagementDto>> list(
        @Parameter(name = "pageNo", description = "页码") @RequestParam(defaultValue = "1") Integer pageNo,
        @Parameter(name = "pageSize", description = "页码大小") @RequestParam(defaultValue = "10") Integer pageSize) {
        try {
            PageResult<PAManagementDto> page = paManagementService.list(pageNo, pageSize);
            return ResResultDto.ok(page);
        } catch (Exception e) {
            return ResResultDto.error(e.getMessage());
        }
    }


    @Operation(summary = "首页公告列表")
    @GetMapping("/home/list")
    public ResResultDto<List<PAManagementDto>> homeList() {
        try {
            List<PAManagementDto> page = paManagementService.homeList();
            return ResResultDto.ok(page);
        } catch (Exception e) {
            return ResResultDto.error(e.getMessage());
        }
    }

}
