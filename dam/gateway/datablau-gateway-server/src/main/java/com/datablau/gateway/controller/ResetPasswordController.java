package com.datablau.gateway.controller;

import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.ForgetPasswordDto;
import com.datablau.security.management.dto.UserDto;
import com.datablau.security.management.mail.api.MailMessageService;
import com.datablau.security.management.mail.api.MailTemplateService;
import com.datablau.security.management.mail.bo.MailParamBo;
import com.datablau.security.management.mail.contentholder.MailParamBoContentHolder;
import com.datablau.security.management.mail.enums.SceneEnum;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;

import java.lang.reflect.InvocationTargetException;
import java.util.Date;
import java.util.List;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FormFieldPart;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.RouterFunctions.Builder;
import org.springframework.web.reactive.function.server.ServerResponse;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/5/22 11:09
 */

@Configuration
public class ResetPasswordController extends BaseController {

    @Resource
    private UserService userService;

    @Resource
    private MessageService messageService;

    @Resource
    private MailMessageService mailMessageService;

    @Resource
    private MailTemplateService mailTemplateService;

    @Value("${datablau.server.http.baseUrl}")
    private String baseUrl;


    @Bean
    public RouterFunction<ServerResponse> resetPassword(){
        return RouterFunctions.route()
            .POST("/gateway/reset/password/byUserName", RequestPredicates.accept(MediaType.MULTIPART_FORM_DATA), request ->
                request.multipartData().flatMap(data -> {
                    String username = getParam(data, "username");

                    if(StringUtils.isEmpty(username)) ResponseHandler.responseNullParamHandler();



                    UserDto user = userService.getUser(username);
                    if (user == null) {
                        throw new InvalidArgumentException("找不到用户\"" + username + "\"");
                    }

                    if (Strings.isNullOrEmpty(user.getEmailAddress())) {
                        throw new IllegalOperationException("用户\"" + username + "\"的邮箱地址没有设置，需要联系管理员");
                    }
                    if (!mailMessageService.isMailServerConfigured()) {
                        throw new IllegalOperationException("系统没有配置邮件, 请联系管理员");
                    }

                    /*
                    由于nginx隐藏了真实的requestUrl，导致此处无法获取，因此改用读取配置文件的方式来获取baseUrl
                    */
                    String uuid = GeneralUtility.getUUID();
                    String resetUrl = baseUrl + "/base-app/forget_password.html?id=" + uuid;

                    ForgetPasswordDto password = new ForgetPasswordDto();
                    password.setExpire(DateUtils.addDays(new Date(), 1));
                    password.setUniqueId(uuid);
                    password.setUrl(resetUrl);
                    password.setUsername(username.toLowerCase());

                    userService.saveOrUpdateForgetPassword(password);


                    List<UserDto> users = Lists.newArrayList(user);
                    //获取参数对象上下文信息
                    List<MailParamBo> boList = MailParamBoContentHolder.getContentHolder();
                    //做各个场景下参数的转换
                    List<MailParamBo> convertList = users.stream().map(userDto ->{
                        MailParamBo bo = new MailParamBo();
                        bo.setReceivers(Lists.newArrayList(userDto.getEmailAddress()));
                        //前端可用参数
                        bo.setReceiverName(userDto.getUsername());
                        bo.setResetUrl(resetUrl);
                        return bo;
                    }).collect(Collectors.toList());
                    boList.addAll(convertList);
                    //发送邮件,定义好场景模板映射关系
                    boList.forEach(bo ->{
                        mailTemplateService.sendMail(SceneEnum.RESETPASSWD.getSceneId(), 1,bo);
                    });
                    //清除上下文参数对象
                    MailParamBoContentHolder.remove();

                    return ResponseHandler.responseOKHandler();
                })
            )
            .POST("/gateway/reset/password/byUniqueId", RequestPredicates.accept(MediaType.MULTIPART_FORM_DATA), request ->
                request.multipartData().flatMap(data -> {
                    String uniqueId = getParam(data, "uniqueId");
                    String newPassword = getParam(data, "newPassword");
                    ForgetPasswordDto forgetPasswordDto = new ForgetPasswordDto();
                    forgetPasswordDto.setUniqueId(uniqueId);
                    forgetPasswordDto.setNewPassword(newPassword);
                    try {
                        userService.resetPasswordByUniqueId(forgetPasswordDto);
                    } catch (Exception e) {
                        return ResponseHandler.response599Handler(e.getMessage() == null ? ((InvocationTargetException) e).getTargetException().getMessage():e.getMessage());
                    }

                    return ResponseHandler.responseOKHandler();
                })
            )
            .build();
    }

}
