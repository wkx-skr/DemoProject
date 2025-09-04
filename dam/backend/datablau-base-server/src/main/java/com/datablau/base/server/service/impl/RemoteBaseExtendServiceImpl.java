package com.datablau.base.server.service.impl;

import com.andorj.model.common.utility.BeanHelper;
import com.datablau.data.common.util.JsonUtils;
import com.datablau.project.api.RemoteBaseExtendService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserDetails;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
public class RemoteBaseExtendServiceImpl implements RemoteBaseExtendService {

    @Value("${notification.weact.url:http://10.39.7.17:8080/open-apis/message/v4/batch_send}")
    private String weactUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public void sendToWeact(String user, String name, Map<String, Object> content) {
        this.sendToWeact(user, name, "post", content);
    }

    /*
    receive_id_type: 'open_id, user_id, union_id, email, chat_id'
    {
        msg_type: '消息类型 包括：text、post、image、file、audio、media、sticker、interactive、share_chat、share_user等，类型定义请参考发送消息内容示例值："text"',
        content: '消息内容，JSON结构序列化后的字符串。不同msg_type对应不同内容，具体格式说明参考：发送消息内容注意：JSON字符串需进行转义，如换行符转义后为\\n文本消息请求体最大不能超过150KB卡片及富文本消息请求体最大不能超过30KB示例值："{\"text\":\"test content\"}"'
        uuid: '',
        receive_id: ''
    }
    * */
    private void sendToWeact(String user, String name, String msgType, Map content) {
        UserService userService = (UserService) BeanHelper.getBeanByName("userService");
        UserDetails userDetails = userService.getUserDetails(user);
        String userID = null;
        if(userDetails != null && userDetails.getAdditionalProperties() != null) {
            userID = userDetails.getAdditionalProperties().getOrDefault("userId", "").toString();
        }
        if(StringUtils.isEmpty(userID)) {
            log.error("标准变更流程[{}]，通知weact用户失败：{}", name, user);
            return;
//            userID = "T9068610";
        }
        // 组装参数
        String _content = JsonUtils.toJSon(content);
        Map<String, Object> requestBody = Map.of(
                "msg_type", msgType,
                "content", _content,
                "uuid", new Date().getTime() + "",
                "receive_id", userID
        );
        MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity request = new HttpEntity(requestBody, headers);
        String formatUrl = String.format("%s?receive_id_type=%s", weactUrl, "user_id");
        Map<String, Object> responseMap = restTemplate.postForObject(formatUrl, request, Map.class);
        if(responseMap.containsKey("code") && Objects.equals(responseMap.get("code"), 0)) {
            log.info("标准变更流程[{}]，通知weact用户：{}", name, user);
        } else {
            log.error("标准变更流程[{}]，通知weact用户：{}，返回失败：{}, 请求参数：{}", name, user, responseMap, requestBody);
        }
    }
}
