package com.datablau.model.server.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.security.UserRights;
import com.datablau.model.message.api.MailMessageService;
import com.datablau.model.message.dto.MailServerDto;
import com.datablau.model.message.dto.MailTemplateDto;
import com.datablau.model.message.utility.SubscribeType;
import com.datablau.model.security.utility.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2017/12/22 18:55
 */
@RestController("messageController")
@ConditionalOnMissingBean(name = "messageControllerExt")
@RequestMapping("/notifications")
@Tag(name = "消息提醒相关REST API", description = "消息提醒相关REST API")
public class MessageController extends BaseController {

    @Autowired
    protected MailMessageService mailMessageService;

    @RequestMapping("/server")
    @Operation(summary = "获取邮件服务器配置", description = "获取邮件服务器配置")
    @PreAuthorize(UserRights.HAS_SUPERUSER_ROLE)
    public MailServerDto getMailServerConfig() {
        return mailMessageService.getMailServerConfiguration();
    }

    @RequestMapping(value = "/server", method = RequestMethod.POST)
    @PreAuthorize(UserRights.HAS_SUPERUSER_ROLE)
    @Operation(summary = "更新邮件服务器配置", description = "更新邮件服务器配置")
    public void updateServerConfiguration(@RequestBody MailServerDto mailServerDto) {
        mailMessageService.configureMailService(mailServerDto);
    }

    @RequestMapping("/templates")
    @PreAuthorize(UserRights.HAS_SUPERUSER_ROLE)
    @Operation(summary = "获取邮件模板", description = "获取邮件模板")
    public List<MailTemplateDto> getTemplates() {
        return mailMessageService.getTemplates();
    }

    @RequestMapping(value = "/templates", method = RequestMethod.PUT)
    @PreAuthorize(UserRights.HAS_SUPERUSER_ROLE)
    @Operation(summary = "更新邮件模板", description = "更新邮件模板")
    public void updateTemplate(@RequestBody MailTemplateDto templateDto) {
        mailMessageService.updateMailTemplate(templateDto);
    }

    @RequestMapping("/subscribe/{type}/{targetId}")
    @Operation(summary = "判断当前用户是否订阅了此资源", description = "判断当前用户是否订阅了此资源")
    public Boolean isSubscribedResource(@Parameter(description = "资源类型: Model, Category") @PathVariable("type") SubscribeType type, @Parameter(description = "目标ID") @PathVariable("targetId") Long targetId) {
        return mailMessageService.isSubscribedResourced(AuthTools.currentUsernameFailFast(), type, targetId);
    }

    @RequestMapping(value = "/subscribe/{type}/{targetId}", method = RequestMethod.POST)
    @Operation(summary = "订阅资源", description = "订阅资源")
    public void subscribeObject(@Parameter(description = "资源类型: Model, Category") @PathVariable("type") SubscribeType type, @Parameter(description = "目标ID") @PathVariable("targetId") Long targetId) {
        mailMessageService.subscribeMail(AuthTools.currentUsernameFailFast(), type, targetId);
    }

    @RequestMapping(value = "/unsubscribe/{type}/{targetId}", method = RequestMethod.DELETE)
    @Operation(summary = "取消订阅资源", description = "取消订阅资源")
    public void unsubscribeObject(@Parameter(description = "资源类型: Model, Category") @PathVariable("type") SubscribeType type, @Parameter(description = "目标ID") @PathVariable("targetId") Long targetId) {
        mailMessageService.unsubscribeMail(AuthTools.currentUsernameFailFast(), type, targetId);
    }
}
