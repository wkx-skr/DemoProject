package com.datablau.security.management.rest.controller;

import com.datablau.security.management.dto.DopTokenDto;
import com.datablau.security.management.dto.DopUserDto;
import com.datablau.security.management.util.TokenDigestUtilsSm2;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-04 17:07
 * @description  dop 对接controller
 */

@RestController
@RequestMapping("/oauth")
public class UserOauthController  {

    private final Logger logger = LoggerFactory.getLogger(UserOauthController.class);

    @PostMapping("/token")
    public DopTokenDto verifyAndGenerateToken(@RequestBody DopUserDto dto) throws Exception {
        DopTokenDto dopTokenDto = new DopTokenDto();
        try {

            logger.info("dto message " +dto.toString());
            boolean valid = TokenDigestUtilsSm2.verifySign(dto.getUsername(), dto.getSign());
            if (!valid) {
               logger.info("签名验证失败");
                dopTokenDto.setState("500");
                return  dopTokenDto;
//                return "签名验证失败";
            }
            String rawToken = dto.getUsername()+ "|" + Instant.now().toEpochMilli() + "|" + UUID.randomUUID();
            // 这里应该存入redis 后面进行验证销毁
            String s = TokenDigestUtilsSm2.encryptSm2(rawToken);
            dopTokenDto.setDataToken(s);
            dopTokenDto.setState("200");
            return dopTokenDto;
        }catch (Exception e){
            logger.error(e.getMessage());
            dopTokenDto.setState("500");
        }
        return dopTokenDto;

    }




}
