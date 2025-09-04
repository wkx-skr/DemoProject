package com.datablau.security.management.rest.controller;

import com.andorj.common.core.annotation.Feature;
import com.andorj.license.utility.lic.LicenseInfo;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.controller.ResultDto;
import com.datablau.data.common.controller.ResultDtoGenerator;
import com.datablau.data.common.util.NacosConfigReader;
import com.datablau.project.util.UserRights;
import com.datablau.security.management.mail.api.MailMessageService;
import com.datablau.security.management.mail.api.MailTemplateService;
import com.datablau.security.management.mail.bo.MailTemplateBo;
import com.datablau.security.management.mail.dto.MailServerDto;
import com.datablau.security.management.mail.dto.MailTemplateDto;
import com.datablau.security.management.mail.dto.SceneDto;
import com.datablau.security.management.rest.bo.MailTemplateApiBo;
import com.datablau.security.management.utils.AuthTools;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/3/16 16:31
 */
@Tag(name = "Mail相关API")
@RestController
@RequestMapping("/mail")
@Feature(LicenseInfo.FE_BASE)
public class MailController extends BaseController {

    private static final ObjectMapper objectMapper = new ObjectMapper();


    @Autowired
    private MailMessageService mailService;

    @Autowired
    private MailTemplateService mailTemplateService;

    @Autowired
    private NacosConfigReader nacosConfigReader;


    @Operation(summary = "获取邮件配置")
    @PostMapping("/getMailServer")
    public MailServerDto getMailServer() {
        return mailService.getMailServerConfiguration();
    }

    //@OperatorLog(
    //        operation = OperationLogType.TABLE_MODIFY,
    //        operateTable = "db_mail_server",
    //        systemModule = OperationModuleType.SYSTEM_MAIL,
    //        description = "更新邮件服务器配置"
    //)
    @Operation(summary = "创建邮件配置")
    @PostMapping(value = "/createMailConfiguration")
    public void createMailConfiguration(@RequestBody MailServerDto mailServer) {
        mailService.configureMailService(mailServer);
    }

    @GetMapping(value = "/getscenelist",produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "获取邮件模板列表",method = "GET")
    @PreAuthorize(UserRights.HAS_BASE_EMAIL_MANAGE_ROLE)
    public ResultDto<List<SceneDto>>  getSceneList(){

        List<SceneDto> list = mailTemplateService.getSceneList();
        return ResultDtoGenerator.genSuccessResult(list);
    }


    //@OperatorLog(
    //        operation = OperationLogType.TABLE_MODIFY,
    //        operateTable = "db_maillscene_map",
    //        systemModule = OperationModuleType.SYSTEM_MAIL,
    //        description = "编辑邮件模版启用状态，邮件id和启用状态分别为(0-不启用 1-启用): {param}",
    //        descriptionParamClass = Integer.class,
    //        descriptionParamMethod = "toString"
    //)
    @PostMapping(value = "/setsceneenable",produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "设置邮件是否启用",method = "POST")
    @Parameters({
            @Parameter(name = "sceneId",description = "场景Id",required = true),
            @Parameter(name = "enable",description = "启用标志(0-不启用 1-启用)",required = true)
    })
    public ResultDto<?> setSceneEnable(@RequestParam Integer sceneId, @RequestParam Integer enable){
        int res = mailTemplateService.setSceneEnable(sceneId,enable);
        if (res > 0){
            return ResultDtoGenerator.genSuccessResult("启用状态更新成功",null);
        }
        return ResultDtoGenerator.genFailResult("启用状态更新失败");
    }

    @GetMapping(value = "/getmailtemplate",produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "根据场景获取邮件模板",method = "GET")
    @Parameter(name = "sceneId",description = "场景Id",required = true)
    public ResultDto<MailTemplateDto> getMailTemplate(@RequestParam Integer sceneId){
        MailTemplateDto data = mailTemplateService.getMailTemplate(sceneId);
        if (data == null){
            return ResultDtoGenerator.genFailResult("不存在此场景");
        }
        return ResultDtoGenerator.genSuccessResult(data);
    }


    //@OperatorLog(
    //        operation = OperationLogType.TABLE_MODIFY,
    //        operateTable = "db_maillscene_map",
    //        systemModule = OperationModuleType.SYSTEM_MAIL,
    //        description = "编辑邮件模版内容，邮件内容为: {param}",
    //        descriptionParamClass = MailTemplateApiBo.class,
    //        descriptionParamMethod = "toString"
    //)
    @PostMapping(value = "/updatetemplate",produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "更新邮件模板",method = "POST")
    public ResultDto<?> updateTemplate(@RequestBody @Valid MailTemplateApiBo bo, BindingResult bindingResult) throws JsonProcessingException {
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.joining(","));
            return ResultDtoGenerator.genFailResult(errorMsg);
        }

        //source to target
        MailTemplateBo params = objectMapper.convertValue(bo, MailTemplateBo.class);

        params.setUserName(AuthTools.currentUsername());
        mailTemplateService.updateTemplate(params);
        return ResultDtoGenerator.genSuccessResult(null);
    }

    @PostMapping("/editionInfos")
    public Map<String, Object> getEditionInfo(){
        return nacosConfigReader.getEditionInfos();
    }
}
