package com.datablau.gateway.error;

import org.springframework.security.core.AuthenticationException;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2022/10/26 17:33
 */
public class DataBlauRmiException extends AuthenticationException {

    public DataBlauRmiException(String msg, Throwable t) {
        super(msg, t);
    }

    public DataBlauRmiException(String msg) {
        super(msg);
    }
}
