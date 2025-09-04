package com.datablau.gateway.util;


import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-21 15:42
 * @description
 */
public class DopTokenHttpUtil {

    private static final Logger logger = LoggerFactory.getLogger(DopTokenHttpUtil.class);
    /**
     * 远端 loginCheck，只返回 account。
     *
     * @param token  不带 Bearer 前缀的原始 token
     * @return       用户 account，如 zhanghz13
     * @throws RuntimeException 解析失败 / 接口调用失败
     */
    public static String fetchAccount(String urlPre,String token) {
        String url = urlPre + "/api/main/loginCheck";

        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Accept", "application/json");
        headers.put("Authorization", "Bearer " + token);

        String resp;
        try {
            resp = HttpUtil.createPost(url)
                    .addHeaders(headers)
                    .body("{}")           // loginCheck 一般无 Body，发空 JSON 更安全
                    .timeout(30_000)
                    .execute()
                    .body();
            logger.info("[loginCheck] 响应：{}", resp);
        } catch (Exception e) {
            throw new RuntimeException("loginCheck 接口调用失败！", e);
        }

        // —— 只解析 account —— //
        try {
            JSONObject obj = JSONUtil.parseObj(resp);
            // Hutool 支持 getByPath，直接定位 data.user.account
            String account = obj.getByPath("data.user.account", String.class);
            if (account == null || account.trim().isEmpty()) {
                throw new RuntimeException("解析失败"); // 字段缺失算解析失败
            }
            return account;
        } catch (Exception e) {
            throw new RuntimeException("解析失败", e);
        }
    }


}
