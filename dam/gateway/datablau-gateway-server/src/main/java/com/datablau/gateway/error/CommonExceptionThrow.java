package com.datablau.gateway.error;

import com.andorj.common.core.exception.NotFoundRemoteServerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ldap.CommunicationException;
import org.springframework.ldap.NameNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2022/10/26 17:48
 */
public class CommonExceptionThrow {
    private static final Logger logger = LoggerFactory.getLogger(CommonExceptionThrow.class);

    /**
     * 抛出严重异常，其他异常统一归类为账号密码错误
     * @param e
     * @return
     */
    public static Mono<Authentication> throwException(Exception e){

        if(e instanceof NotFoundRemoteServerException){
            logger.info(e.getMessage(), e);
            throw new DataBlauRmiException(e.getMessage());
        }else if(e instanceof NameNotFoundException){
            throw new DataBlauLdapException("ldap查询baseDN错误");
        }else if(e instanceof CommunicationException){
            throw new DataBlauLdapException("ldap连接信息错误");
        }else if(e instanceof UsernameNotFoundException){
            Mono.error(e);
        }

        return Mono.empty();

    }


}
