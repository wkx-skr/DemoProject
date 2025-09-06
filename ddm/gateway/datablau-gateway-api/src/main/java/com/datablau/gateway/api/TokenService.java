package com.datablau.gateway.api;

/**
 * @Author Senyan - 北京数语科技有限公司
 * @Date 2021/3/23
 */
public interface TokenService {

    String acquireToken(String username) throws Exception;

    String validateToken(String token) throws Exception;
    
}
