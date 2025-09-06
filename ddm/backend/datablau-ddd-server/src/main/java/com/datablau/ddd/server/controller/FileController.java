package com.datablau.ddd.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datablau.ddd.data.dto.FileStatusDto;
import com.datablau.ddd.server.service.api.FileOperateService;

@RestController
@RequestMapping("/file")
public class FileController {

    @Autowired
    private FileOperateService fileOperateService;

    @PostMapping("/status/maintain")
    public void fileStatusMaintained(@RequestParam("type") String type,
                                     @RequestParam("procedureId") Long procedureId,
                                     @RequestParam("projectId") Long projectId) {
        fileOperateService.fileStatusMaintained(type, procedureId, projectId);
    }

    @PostMapping("/status/remove")
    public void fileStatusRemoved(@RequestParam("type") String type,
                                  @RequestParam("procedureId") Long procedureId,
                                  @RequestParam("projectId") Long projectId) {
        fileOperateService.fileStatusRemoved(type, procedureId, projectId);
    }

    @PostMapping("/status/remove/batch")
    public void fileStatusRemovedBatch(@RequestBody FileStatusDto fileStatusDto,
                                       @RequestParam("projectId") Long projectId) {
        fileOperateService.fileStatusRemovedBatch(fileStatusDto, projectId);
    }

    @GetMapping("/getAll")
    public FileStatusDto getFilesFromRedis(@RequestParam("projectId") Long projectId) {
        return fileOperateService.getFilesFromRedis(projectId);
    }
}
