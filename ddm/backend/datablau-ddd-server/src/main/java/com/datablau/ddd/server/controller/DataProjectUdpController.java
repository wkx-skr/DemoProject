package com.datablau.ddd.server.controller;

import org.apache.poi.ss.formula.functions.T;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datablau.ddd.common.dto.SaveUdpDto;
import com.datablau.ddd.common.dto.SaveUdpValDto;
import com.datablau.ddd.common.dto.UpdateUdpDto;
import com.datablau.ddd.common.dto.UpdateUdpValDto;
import com.datablau.ddd.common.vo.DataAssetsUdpVo;
import com.datablau.ddd.data.dto.ResResultDto;
import com.datablau.ddd.data.jpa.entity.DataProjectUdp;
import com.datablau.ddd.server.service.api.DataProjectUdpService;
import com.datablau.ddd.server.service.api.DataProjectUdpValService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "拓展属性")
@RestController
@RequestMapping(value = "/udp")
public class DataProjectUdpController {

    @Autowired
    private DataProjectUdpService dataProjectUdpService;

    @Autowired
    private DataProjectUdpValService dataProjectUdpValService;

    @Operation(summary = "添加拓展属性")
    @PostMapping(value = "/")
    public ResResultDto<T> save(@Validated @RequestBody SaveUdpDto saveUdpDto) {
        dataProjectUdpService.save(saveUdpDto);
        return ResResultDto.ok();
    }

    @Operation(summary = "获取所有的组名")
    @GetMapping(value = "/groups")
    public ResResultDto<Set<String>> getGroups() {
        Set<String> groups = dataProjectUdpService.getGroups();
        return ResResultDto.ok(groups);
    }

    @Operation(summary = "修改拓展属性")
    @PutMapping(value = "/")
    public ResResultDto<T> update(@Validated @RequestBody UpdateUdpDto saveUdpDto) {
        dataProjectUdpService.update(saveUdpDto);
        return ResResultDto.ok();
    }

    @Operation(summary = "删除拓展属性")
    @DeleteMapping(value = "/{id}")
    public ResResultDto<T> delete(@PathVariable Long id) {
        dataProjectUdpService.delete(id);
        return ResResultDto.ok();
    }

    @Operation(summary = "获取所有的拓展属性")
    @GetMapping(value = "/")
    public ResResultDto<List<DataProjectUdp>> findAll() {
        List<DataProjectUdp> dataProjectUdps = dataProjectUdpService.findAll();
        return ResResultDto.ok(dataProjectUdps);
    }

    @Operation(summary = "资产添加拓展属性")
    @PostMapping(value = "/val")
    public ResResultDto<T> addUdpVal(@Validated @RequestBody SaveUdpValDto saveUdpValDto) {
        dataProjectUdpValService.save(saveUdpValDto);
        return ResResultDto.ok();
    }

    @Operation(summary = "更新项目拓展属性的值")
    @PutMapping(value = "/val")
    public ResResultDto<T> updateVdpVal(
                                        @Validated @RequestBody List<UpdateUdpValDto> updateUdpValDto) {
        dataProjectUdpValService.update(updateUdpValDto);
        return ResResultDto.ok();
    }

    @Operation(summary = "删除项目拓展属性的值")
    @DeleteMapping(value = "/delete/project/{udpValId}")
    public ResResultDto<T> deleteProjectUdpVal(@PathVariable Long udpValId) {
        dataProjectUdpValService.deleteProjectUdpVal(udpValId);
        return ResResultDto.ok();
    }

    @Operation(summary = "获取资产拓展属性")
    @GetMapping(value = "/getProject/udp/{projectId}/{fileId}")
    public ResResultDto<Map<String, List<DataAssetsUdpVo>>> getProjectVdp(@PathVariable Long projectId,
                                                                          @PathVariable Long fileId) {
        Map<String, List<DataAssetsUdpVo>> dataAssetsUdpVo = dataProjectUdpValService.getUpd(projectId, fileId);
        return ResResultDto.ok(dataAssetsUdpVo);
    }
}
