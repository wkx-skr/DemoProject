package com.datablau.ddd.server.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datablau.ddd.data.dto.dolphinscheduler.DsProjectDto;
import com.datablau.ddd.ds.service.DolphinSchedulerDataSourceService;
import com.datablau.ddd.ds.service.DolphinSchedulerProjectService;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;
@RestController
@RequestMapping("/remote")
public class DsRemoteCallController {

    @Autowired
    DolphinSchedulerProjectService dolphinSchedulerProjectService;

    @Autowired
    DolphinSchedulerDataSourceService dolphinSchedulerDataSourceService;

    @Operation(summary = "获取dolphinScheduler项目列表")
    @GetMapping("/ds-projects")
    public List<DsProjectDto> getDsProjects(@RequestParam String env) throws JsonProcessingException {
        return dolphinSchedulerProjectService.getDsProjects(env);
    }
}
