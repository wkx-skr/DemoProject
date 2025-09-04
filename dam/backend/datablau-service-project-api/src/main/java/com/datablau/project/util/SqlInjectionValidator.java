package com.datablau.project.util;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

/**
 * @author: hxs
 * @date: 2025/7/7 15:56
 */
public class SqlInjectionValidator {
    // 定义需要过滤的特殊字符和SQL关键词
    private static final Set<String> FORBIDDEN_KEYWORDS = new HashSet<>(Arrays.asList(
            "and", "or", "select", "union", "insert", "update", "delete", "drop",
            "create", "alter", "truncate", "exec", "declare", "xp_cmdshell", "sleep",
            "waitfor", "shutdown", "grant", "revoke", "fetch", "where", "from"
    ));

    private static final Set<Character> FORBIDDEN_CHARS = new HashSet<>(Arrays.asList(
            '\'', '"', '<', '>', '/', '*', ';', '+', '-', '&', '|', '(', ')',
            '=', '%', '\\', '!', '@', '#', '$', '^', '~', '`', '[', ']', '{', '}',
            ':', '?'
    ));

    /**
     * 严格校验SQL注入风险
     *
     * @param input 用户输入的数据
     * @param paramName 被检查的参数名称（用于错误信息）
     */
    public static void checkForSqlInjection(String input, String paramName) {
        if (input == null || input.isEmpty()) {
            return; // 空输入视为安全
        }

        // 1. 检查特殊字符
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (FORBIDDEN_CHARS.contains(c)) {
                String msg = "参数 '" + paramName + "' 包含危险字符 '" + c + "' , 输入值: " + input;
                throw new RuntimeException(msg);
            }
        }

        // 2. 检查SQL关键词（不区分大小写）
        String lowerInput = input.toLowerCase();
        for (String keyword : FORBIDDEN_KEYWORDS) {
            // 使用单词边界检测避免误判
            String pattern = "\\b" + keyword + "\\b";
            if (lowerInput.matches(".*" + pattern + ".*")) {
                String msg = "参数 '" + paramName + "' 包含危险SQL关键词 '" + keyword + "' , 输入值: " + input;
                throw new RuntimeException(msg);
            }
        }

        // 3. 检查编码绕过尝试
        if (containsEncodedChars(input)) {
            String msg = "参数 '" + paramName + "' 包含可能用于注入的编码字符, 输入值: " + input;
            throw new RuntimeException(msg);
        }
    }
    /**
     * 检测编码绕过尝试
     */
    private static boolean containsEncodedChars(String input) {
        // 检测URL编码（如 %27 表示单引号）
        if (input.matches(".*%[0-9a-fA-F]{2}.*")) {
            return true;
        }

        // 检测HTML实体编码（如 &#39; 或 &apos;）
        if (input.matches(".*&#?[0-9a-zA-Z]+;.*")) {
            return true;
        }

        // 检测十六进制编码（如 0x27）
        if (input.matches(".*0x[0-9a-fA-F]+.*")) {
            return true;
        }

        return false;
    }

}
