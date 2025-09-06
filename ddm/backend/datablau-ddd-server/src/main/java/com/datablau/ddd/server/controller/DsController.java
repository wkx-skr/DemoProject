package com.datablau.ddd.server.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.andorj.model.common.api.MessageService;
import com.datablau.ddd.common.exception.BusinessException;
import com.datablau.ddd.data.dto.DsEnvDto;
import com.datablau.ddd.data.jpa.entity.DsEnv;
import com.datablau.ddd.ds.service.DolphinSchedulerDataSourceService;
import com.datablau.ddd.server.service.api.DsEnvService;
import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/local")
public class DsController {

    @Autowired
    MessageService msgService;
    @Autowired
    DsEnvService dsEnvService;

    @Autowired
    DolphinSchedulerDataSourceService dolphinSchedulerDataSourceService;

    @Operation(summary = "获取所有环境")
    @GetMapping("/ds-envs")
    public List<DsEnv> getDsEnvs() {
        return dsEnvService.getAllEnvs();
    }

    @Operation(summary = "创建DS环境")
    @PostMapping("/ds-env")
    public DsEnv createDsEnv(@RequestBody @Validated DsEnvDto dsEnvDto) {
        DsEnv environment = dsEnvService.getEnvByName(dsEnvDto.getEnv());
        if (environment != null) {
            throw new BusinessException(msgService.getMessage("请删除当前环境后再创建"));
        }

        return dsEnvService.createEnv(dsEnvDto);
    }

    @Operation(summary = "根据环境名获取环境详细信息")
    @GetMapping("/ds-env")
    public DsEnv getDsEnv(@RequestParam String env) {
        return dsEnvService.getEnvByName(env);
    }

    @Operation(summary = "根据环境名获取环境URL")
    @GetMapping("/ds-simple-env")
    public DsEnv getSimpleDsEnv(@RequestParam String env) {
        DsEnv dsEnv = dsEnvService.getEnvByName(env);
        dsEnv.setToken(null);
        return dsEnv;
    }

    @Operation(summary = "更新DS环境")
    @PutMapping("/ds-env")
    public DsEnv updateDsEnv(@RequestBody @Validated DsEnvDto dsEnvDto) {
        DsEnv environment = dsEnvService.getEnvById(dsEnvDto.getId());
        if (environment == null) {
            throw new BusinessException(msgService.getMessage("envNotExist"));
        }

        return dsEnvService.updateEnv(dsEnvDto, environment);
    }

    @Operation(summary = "根据环境名删除环境")
    @DeleteMapping("/ds-env")
    public void deleteDsEnv(@RequestParam String env) {
        DsEnv environment = dsEnvService.getEnvByName(env);
        if (environment == null) {
            throw new BusinessException(msgService.getMessage("envNotExist"));
        }
        dsEnvService.deleteEnv(environment);
    }

    @Operation(summary = "根据环境名获取环境详细信息")
    @GetMapping("/datasource/detail/{id}")
    public String getPassword(@PathVariable(value = "id") Long id) {
        return dolphinSchedulerDataSourceService.getDataSourcePassword(id);
    }

    @Operation(summary = "测试环境连通")
    @PostMapping("/connect")
    public void envConnect(@RequestBody DsEnvDto dsEnvDto) {
        dsEnvService.envConnect(dsEnvDto);
    }
}
