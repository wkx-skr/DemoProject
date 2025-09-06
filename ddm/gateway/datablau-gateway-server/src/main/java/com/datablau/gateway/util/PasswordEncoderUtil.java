package com.datablau.gateway.util;

import com.andorj.model.common.utility.DigestUtils;
import com.datablau.security.management.api.UserService;
import com.google.common.base.Strings;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.springframework.security.core.AuthenticationException;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/12/3 16:39
 */
public class PasswordEncoderUtil {
    private static MessageDigest messageDigest;

    public static int SALT_BYTE_SIZE = 16;

    public static boolean passCheck(String password, String authenticPassword) throws AuthenticationException {
        if (authenticPassword == null) {
           return false;
        }
        final String presentedPassword = DigestUtils.decryptEncodedContent(authenticPassword);
        return isSHA256PasswordValid(password, presentedPassword);
    }


    /**
     * This is how SHA256 authentication works:
     * 1. get the saved salt from userDetails
     * 2. concatenate the salt with the entered password
     * 3. hash it using SHA256
     * 4. compare with the saved password from userDetails
     */
    public static synchronized boolean isSHA256PasswordValid(final String storePassword,
        final String presentedPassword) {
        try {

            if (Strings.isNullOrEmpty(storePassword)) {
                return false;
            }

            String salt = storePassword.substring(0, SALT_BYTE_SIZE);
            String saltPass = salt + presentedPassword;
            byte[] input = getMessageDigest().digest(saltPass.getBytes("UTF-8"));
            for (int i = 0; i < 3; i++) {
                getMessageDigest().reset();
                input = getMessageDigest().digest(input);
            }
            String hasdedpass = org.apache.commons.codec.digest.DigestUtils.sha256Hex(input).toString();

            if (!hasdedpass.equals(storePassword.substring(SALT_BYTE_SIZE))) {
               return false;
            }
        } catch (final UnsupportedEncodingException e) {
            return false;
        }
        return true;
    }

    public static MessageDigest getMessageDigest() {
        if (messageDigest == null) {
            try {
                messageDigest = MessageDigest.getInstance(UserService.PASSWORD_HASH_SHA256);
            } catch (final NoSuchAlgorithmException e) {
                throw new RuntimeException(e);
            }
        }
        return messageDigest;
    }
}
