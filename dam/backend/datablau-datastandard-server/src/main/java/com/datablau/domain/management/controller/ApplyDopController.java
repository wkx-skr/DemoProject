package com.datablau.domain.management.controller;

import com.datablau.domain.management.api.ApplyService;
import com.datablau.domain.management.dto.ApplyMessageDto;
import com.datablau.domain.management.dto.FlowBatchApplyDopInfoDto;
import com.datablau.domain.management.utils.DopTokenHttpUtil;
import com.datablau.domain.management.utils.GatewayDigestUtilsSm2;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-09-01 11:22
 * @description  由于白名单的问题，所以通过接口在这里也写一个
 */

@RestController
@RequestMapping("/dop")
@Tag(name = "批次管理页面")
public class ApplyDopController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApplyDopController.class);


    @Value("${batch.apply.enable}")
    private Boolean applyEnable;

    @Value("${batch.apply.modelType}")
    private String applyModel;

    @Autowired
    private ApplyService applyService;


    @PostMapping("/flow/notice/bulk")
    public ApplyMessageDto batchNoticeBatch(@RequestBody FlowBatchApplyDopInfoDto flowBatchApplyDopInfoDto, HttpServletRequest request) {
        String username = null;
        if (applyEnable){
            LOGGER.info(flowBatchApplyDopInfoDto.toString());
            if (ObjectUtils.isEmpty(flowBatchApplyDopInfoDto.getApprovalId())) {
                return new ApplyMessageDto("SYS.200","approvalId must not null",false);
            }
            // 并且此时还需要check header
            // 判断模式
            if ("DOP".equals(applyModel)) {
                try {
                    String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
                    String token = null;
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        token = authHeader.substring(7);      // 去掉 "Bearer "
                    }
                    // 3. 调用远端 loginCheck，只要 account
                    String account =null;
                    try {
                        if (!ObjectUtils.isEmpty(token)) {
                            account = DopTokenHttpUtil.fetchAccount(null, token);// 可能抛出“解析失败”
                            LOGGER.info(token);
                        }
                    } catch (RuntimeException e) {
                        // 这里捕获后看你需求：直接抛、记录日志、返回特殊信息等
                        throw e;
                    }
                    if (!ObjectUtils.isEmpty(account)) {
                        username = account;

                    }
                } catch (Exception e) {
                    LOGGER.error(e.getMessage());
                }
            }else {
                try {
                    String header = request.getHeader("set-datablau");
                    String rawToken = GatewayDigestUtilsSm2.decryptEncodedSm2(header);
                    LOGGER.info("Token 解密结果: {}", rawToken);
                    String[] parts = rawToken.split("\\|");
                    username = parts[0];
                    LOGGER.info("Token 提取用户名: {}", username);
                } catch (Exception e) {
                    LOGGER.error(e.getMessage());
                }
            }
            if (ObjectUtils.isEmpty(username)){
                try {
                    LOGGER.info("请求头没有获取到用户信息。。。");
                    username =getCurrentUser();
                }catch (Exception e){
                    LOGGER.error(e.getMessage());
                }
            }

        }else {
            try {
                username =getCurrentUser();
            }catch (Exception e){
                LOGGER.error(e.getMessage());
            }
        }
        LOGGER.info("current "+username);
        applyService.applyInfoWhitelist(flowBatchApplyDopInfoDto,username);

        return new ApplyMessageDto("SYS.200",null,true);
    }

}
