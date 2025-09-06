package com.datablau.gateway.impl;

import com.datablau.gateway.api.TokenService;
import com.andorj.model.common.utility.DigestUtils;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;


/**
 * @Author Senyan - 北京数语科技有限公司
 * @Date 2021/3/23
 */

@Service("tokenService")
public class TokenServiceImpl implements TokenService {
    private static final Logger logger = LoggerFactory.getLogger(TokenServiceImpl.class);

    // token life cycle
    private static final Long TIMEOUT = 60000 * 2L;


    @Override
    public String acquireToken(String username) throws Exception {
        //create a random tokenId
        String tokenId = UUID.randomUUID().toString().replaceAll("-", "");
        //tokenId = tokenId.substring(0, 8);
        return buildToken(tokenId, username);
    }

    private boolean isExpiredToken(ParsedToken pt) {
        Long elapsed = System.currentTimeMillis() / 1000 - pt.timestamp;

        if (elapsed > TIMEOUT) {
            return true;
        } else {
            return false;
        }
    }

    private synchronized String buildToken(String tokenId, String username) {
        String expression = tokenId + ":" + username + ":" + (System.currentTimeMillis() / 1000L);
        String token = DigestUtils.encrypt(expression);

        return token;
    }

    @Override
    public String validateToken(String token) throws Exception {

        ParsedToken pt = ParsedToken.getParsedToken(token);
        if (isExpiredToken(pt)) {
            logger.error("token is expired!,token is:" + token);
            throw new Exception("token is expired!");
        }

        return pt.username;
    }

    private static class ParsedToken {
        String tokenId;
        String username;
        Long timestamp;

        ParsedToken() {
        }

        static ParsedToken getParsedToken(String token) throws Exception{
            String deprecated = DigestUtils.decryptIfIsEncrypted(token);
            String[] parts = deprecated.split(":");
            if (parts.length != 3) {
                throw new Exception("Invalid token. Please try to log in to the model store again.");
            }

            ParsedToken pt = new ParsedToken();
            pt.tokenId = parts[0];
            pt.username = parts[1];

            try {
                pt.timestamp = Long.parseLong(parts[2]);
            } catch (NumberFormatException ne) {
                throw new Exception("Invalid token. Please try to log in to the model store again.");
            }

            return pt;
        }
    }
}
