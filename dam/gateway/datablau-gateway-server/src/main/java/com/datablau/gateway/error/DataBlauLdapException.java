package com.datablau.gateway.error;

import org.springframework.security.core.AuthenticationException;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2022/10/26 17:37
 */
public class DataBlauLdapException extends AuthenticationException {

    public DataBlauLdapException(String msg, Throwable t) {
        super(msg, t);
    }

    public DataBlauLdapException(String msg) {
        super(msg);
    }
}
