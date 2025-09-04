package com.datablau.domain.management.utils;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

public class XSSUtil {
    public static String processInput(String input) {
        if (StringUtils.isEmpty(input)) {
            return input;
        }
        // 假设输入已经是URL编码过的，如果已经解码过则直接传递
        String decodedInput = decodeInput(input);
        String sanitizedInput = StringEscapeUtils.escapeHtml(decodedInput);
        return sanitizedInput;
    }

    public static String decodeInput(String input) {
        // 使用URLDecoder解码
        try {
            return URLDecoder.decode(input, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            return input;  // 如果解码失败，返回原始输入
        }
    }

}
