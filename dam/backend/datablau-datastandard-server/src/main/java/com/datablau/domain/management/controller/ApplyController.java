package com.datablau.domain.management.controller;

import com.andorj.common.data.PageResult;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.domain.management.api.ApplyService;
import com.datablau.domain.management.api.BatchConfirmConfigService;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.jpa.entity.BatchConfirmConfig;
import com.datablau.domain.management.utils.DopTokenHttpUtil;
import com.datablau.domain.management.utils.GatewayDigestUtilsSm2;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.logging.log4j.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-17 14:56
 * @description
 */
@RestController
@RequestMapping("/apply")
@Tag(name = "批次管理页面")
public class ApplyController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApplyController.class);


    @Autowired
    private BatchConfirmConfigService batchConfirmConfigService;


    @Value("${batch.apply.enable}")
    private Boolean applyEnable;

    @Value("${batch.apply.modelType}")
    private String applyModel;

    @Autowired
    private ApplyService applyService;


    /**
     * 增加批量接口通过接口
     * @param flowBatchApplyDopInfoDto
     * @param request
     * @return
     */
    @PostMapping("/batch/flow/notice/bulk")
    public ApplyMessageDto batchNoticeBatch(@RequestBody FlowBatchApplyDopInfoDto flowBatchApplyDopInfoDto, HttpServletRequest request) {
        String username = null;
        if (applyEnable){
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
        if (ObjectUtils.isEmpty(username)){
            return new ApplyMessageDto("SYS.200","用户解析异常",false);
        }
        applyService.applyInfoWhitelist(flowBatchApplyDopInfoDto,username);

        return new ApplyMessageDto("SYS.200",null,true);
    }

    /**
     * 批量绑定
     * @param batchApplyDopInfoDto
     * @param request
     * @return
     */

    //  客户调用接口， 主要用于客户对审批通过与否 后面开放白名单 然后解析sign
    @PostMapping("/batch/flow/bind/bulk")
    public ApplyMessageDto batchBindBulk(@RequestBody BatchApplyBindDto batchApplyDopInfoDto, HttpServletRequest request) {
        String username = null;
        if (applyEnable){
            if (ObjectUtils.isEmpty(batchApplyDopInfoDto.getApprovalId())) {
                //  throw new IllegalArgumentException("approvalId is must not null");
                return new ApplyMessageDto("SYS.200","approvalId is must not null",false);
            }

            if (CollectionUtils.isEmpty(batchApplyDopInfoDto.getBatchId())) {
                //  throw new IllegalArgumentException("approvalId is must not null");
                return new ApplyMessageDto("SYS.200","batchId is must not null",false);
            }
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
                            account = DopTokenHttpUtil.fetchAccount(null, token);  // 可能抛出“解析失败”
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
                    if (!ObjectUtils.isEmpty(username)) {
                        username = parts[0];
                    }
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
        if (ObjectUtils.isEmpty(username)){
            return new ApplyMessageDto("SYS.200","用户解析异常",false);
        }
        try {
            applyService.applyBindBatch(batchApplyDopInfoDto,username);
        }catch (Exception e){
            return new ApplyMessageDto("SYS.200",e.getMessage(),false);
        }
        return new ApplyMessageDto("SYS.200",null,true);
    }



    @PostMapping("/batch/validate/bulk")
    public ApplyMessageDto validateBatchIdsBulk(
            @RequestBody List<Long> batchIds) {
        LOGGER.info("batch Id" +batchIds);
        String s = applyService.applyValidateData(batchIds);
        if (!Strings.isBlank(s)){
            LOGGER.info(s);
            return new ApplyMessageDto("SYS.200",s,false);
        }

        return new ApplyMessageDto("SYS.200",null,true);
    }






    //  客户调用接口， 主要用于客户对审批通过与否 后面开放白名单 然后解析sign
    @PostMapping("/batch/flow/notice")
    public ApplyMessageDto batchNotice(@RequestBody BatchApplyDopInfoDto batchApplyDopInfoDto, HttpServletRequest request) {
        String username = null;
        if (applyEnable){
            if (ObjectUtils.isEmpty(batchApplyDopInfoDto.getApprovalId())) {
                return new ApplyMessageDto("SYS.200",null,false);
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
        if (ObjectUtils.isEmpty(username)){
            return new ApplyMessageDto("SYS.200","用户解析异常",false);
        }
        applyService.applyInfo(batchApplyDopInfoDto,username);

        return new ApplyMessageDto("SYS.200",null,true);
    }


    // 该接口主要是 由于流程走批次管理了，
    // 所以说这边进行一个开放增加一个接口
    // 用于无法和dop对接情况下内部可以走的一个通过与否的按钮判断
    // 如果配置出现则内部可以自己审批
    @GetMapping("/conf/info")
    public Boolean batchConfInfo(){
        return applyEnable;
    }



    @PostMapping("/page")
    public PageResult<BatchApplyDto> page(@RequestBody BatchApplyPageQueryDto queryDto) {
        // 获取当前用户 判断该用户是否需要获取 未确认的分页数据
        String currentUser = getCurrentUser();
        LOGGER.info("当前用户:" +currentUser);

        return applyService.page(queryDto,currentUser);
    }


    @GetMapping("/detail/{batchId}")
    public List<BatchApplyDetailDto> getDetailsByBatchId(@PathVariable("batchId") Long batchId) {
        return applyService.getDetailDtoByBatchId(batchId);
    }


    @PostMapping("/confirm")
    public void confirmBatch(@RequestBody BatchConfirmRequestDto requestDto) {
        String currentUser = getCurrentUser();
        applyService.confirmBatch(requestDto.getBatchIds(),currentUser);
    }



    @PostMapping("/delete")
    public void deleteBatch(@RequestBody BatchConfirmRequestDto batchIds) {
        applyService.deleteBatch(batchIds.getBatchIds(),getCurrentUser());
    }

    //  客户调用接口， 主要用于客户对审批通过与否 后面开放白名单 然后解析sign
    @PostMapping("/batch/flow/bind")
    public ApplyMessageDto batchBind(@RequestBody BatchApplyDopInfoDto batchApplyDopInfoDto, HttpServletRequest request) {
        String username = null;
        if (applyEnable){
            if (ObjectUtils.isEmpty(batchApplyDopInfoDto.getApprovalId())) {
              //  throw new IllegalArgumentException("approvalId is must not null");
                return new ApplyMessageDto("SYS.200","approvalId is must not null",false);
            }

            if (ObjectUtils.isEmpty(batchApplyDopInfoDto.getBatchId())) {
                //  throw new IllegalArgumentException("approvalId is must not null");
                return new ApplyMessageDto("SYS.200","batchId is must not null",false);
            }


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
                            account = DopTokenHttpUtil.fetchAccount(null, token);  // 可能抛出“解析失败”
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
                    if (!ObjectUtils.isEmpty(username)) {
                        username = parts[0];
                    }
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

        if (ObjectUtils.isEmpty(username)){
            return new ApplyMessageDto("SYS.200","用户解析异常",false);
        }
        try {
            applyService.applyBind(batchApplyDopInfoDto,username);
        }catch (Exception e){
            return new ApplyMessageDto("SYS.200",e.getMessage(),false);
        }


        return new ApplyMessageDto("SYS.200",null,true);
    }


    @PostMapping("/batch/validate/{batchId}")
    public ApplyMessageDto validateBatch(
            @PathVariable Long batchId) {
        LOGGER.info("batch Id" +batchId);
        String s = applyService.applyValidateData(Collections.singletonList(batchId));
        if (!Strings.isBlank(s)){
            LOGGER.info(s);
            return new ApplyMessageDto("SYS.200",s,false);
        }

        return new ApplyMessageDto("SYS.200",null,true);

    }




    /**
     * 保存或更新一级目录确认人配置
     */
    @PostMapping("/confirm/config/save")
    public void saveConfirmConfig(@RequestBody BatchConfirmConfigSaveDto dto) throws Exception{
        BatchConfirmConfig config = new BatchConfirmConfig();
        config.setId(dto.getId());
        config.setDomainName(dto.getDomainName());
        config.setConfirmUser1(dto.getConfirmUser1());
        config.setConfirmUser2(dto.getConfirmUser2());
        batchConfirmConfigService.save(config);
    }

    /**
     * 批量删除确认人配置
     */
    @PostMapping("/confirm/config/delete")
    public void deleteConfirmConfigs(@RequestBody List<Long> ids) {
        ids.forEach(batchConfirmConfigService::deleteById);
    }

    /**
     * 分页查询一级目录确认人配置
     */
    @PostMapping("/confirm/config/page")
    public PageResult<BatchConfirmConfig> pageConfirmConfigs(@RequestBody BatchConfirmConfigPageQueryDto dto) {
        return batchConfirmConfigService.page(dto);
    }

    /**
     * 查询当前用户是确认人的配置项
     */
    @GetMapping("/confirm/config/my")
    public List<BatchConfirmConfig> getMyConfirmConfigs() {
        return batchConfirmConfigService.findByUser(getCurrentUser());
    }


    @GetMapping("/export/{batchId}")
    public void exportBatchInfo(@PathVariable("batchId") Long batchId, HttpServletResponse response) {
        Map<String, List<List<Object>>> sheets = applyService.exportBatchAndDetails(batchId);
        ExcelUtil.exportManySheetByList(response, "批次导出", sheets);
    }


    /**
     * 驳回接口
     *
     */

    @PostMapping("/batch/reject")
    public void  rejectApply(@RequestBody  List<Long> ids){
        // 驳回
        applyService.applyReject(ids,getCurrentUser());

    }




}
