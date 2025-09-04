package com.datablau.security.management.util;

import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class IntegrateCryptoUtils {

    private static final Logger logger = LoggerFactory.getLogger(IntegrateCryptoUtils.class);

    @Value("${integrate.encryptUrl:https://dataplat-portal.pipechina.com.cn:8080/encrypt}")
    private String encryptUrl;
    @Value("${integrate.encryptAppId:DataArchPlatform}")
    private String encryptAppId;
    @Value("${integrate.decryptUrl:https://dataplat-portal.pipechina.com.cn:8080/decrypt}")
    private String decryptUrl;


    /**
     * 调用密服平台进行加密
     * @param text
     * @return
     */
    public String encryptMobile(String text) {
        Map<String, Object> formParams = new HashMap<>();
        formParams.put("text",text);
        formParams.put("appId",encryptAppId);
        try(HttpResponse response = HttpUtil.createPost(encryptUrl)
                .body(JSONUtil.toJsonStr(formParams))
                .execute()) {
            String resp = response.body();
            logger.info("resp:{}", resp);
            JSONObject json = new JSONObject(resp);
            JSONObject data = json.getJSONObject("data");
            String resMobile= data.getStr("text");
            return resMobile;
        } catch (Exception e){
            logger.error("对手机号加密失败", e);
            throw new RuntimeException(e);
        }
    }

    /**
     * 调用密服平台解密
     * @param encryptText
     * @return id 为调用加密接口返回的id
     */
    public String decrypt(String encryptText, String id) {

        Map<String, Object> formParams = new HashMap<>();
        formParams.put("text",encryptText);
        formParams.put("id",id);
        try(HttpResponse response = HttpUtil.createPost(decryptUrl)
                .body(JSONUtil.toJsonStr(formParams))
                .execute()) {
            String resp = response.body();
            JSONObject json = new JSONObject(resp);
            JSONObject data = json.getJSONObject("data");
            String resMobile= data.getStr("text");
            return resMobile;
        } catch (Exception e){
            logger.error("对手机号解密失败", e);
            throw new RuntimeException(e);
        }
    }
}
