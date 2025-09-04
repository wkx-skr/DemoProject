package com.datablau.gateway.security.core;

import com.andorj.model.common.utility.BeanHelper;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.data.OperationLogDto;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.gateway.util.RebuildExchangeUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/3/14 13:53
 */
@Component
public class LoginSuccessHandler extends RedisTopicPublisher implements ServerAuthenticationSuccessHandler {
    private static Logger LOGGER = LoggerFactory.getLogger(LoginSuccessHandler.class);

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange,
        Authentication authentication) {
        publishTopic(webFilterExchange, authentication.getName(), true);
        saveLoginRecordLog(webFilterExchange, authentication.getName());

        if(authentication.getCredentials().toString().indexOf("SSO") > -1){
            HttpHeaders headers = webFilterExchange.getExchange().getResponse().getHeaders();
            headers.add(HttpHeaders.SET_COOKIE, "sessionId="+ authentication.getCredentials().toString().substring(3) +"; Path=/dolphinscheduler; HttpOnly; SameSite=Lax");
        }
        return RebuildExchangeUtil.rebuildExchange(webFilterExchange.getExchange(), HttpStatus.OK);
    }

    public void saveLoginRecordLog(WebFilterExchange webFilterExchange, String username) {
        try {
            OperationLogService logService = BeanHelper.getBean(OperationLogService.class);

            ServerHttpRequest request = webFilterExchange.getExchange().getRequest();

            OperationLogDto log = new OperationLogDto();
            log.setOperator(username);
            log.setRequestUrl(request.getPath().toString());
            log.setRequestIp(request.getRemoteAddress().getAddress().getHostAddress());
            log.setUserAgent(request.getHeaders().getFirst(HttpHeaders.USER_AGENT));
            log.setDescription("登录了系统");
            log.setOperateTable("db_auth_users");
            log.setSystemModule(OperationModuleType.SYSTEM_LOGON.getModule());
            log.setOperation(OperationLogType.USER_LOG_IN.getOperation());

            logService.generateOperationLog(log);
        } catch (Exception e) {
            LOGGER.error("保存用户登录日志失败!", e);
        }
    }
}
