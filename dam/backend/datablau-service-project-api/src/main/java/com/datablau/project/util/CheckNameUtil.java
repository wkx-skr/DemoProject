package com.datablau.project.util;

import org.apache.commons.lang.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author: hxs
 * @date: 2025/6/6 17:11
 */
public class CheckNameUtil {

    public static final String ChNameRegex = "^[\u4e00-\u9fa5a-zA-Z0-9]+$";

    public static String checkEnglishNameStyle(String englishName) {
        if (englishName == null) {
            //throw new IllegalArgumentException("输入字符串不能为空");
            return "输入字符串不能为空";
        }

        // 检查是否只包含英文字母和空格
        Pattern pattern = Pattern.compile("^[A-Za-z\\s]+$");
        Matcher matcher = pattern.matcher(englishName);
        if (!matcher.matches()) {
            //throw new IllegalArgumentException("字符串只能包含英文字母和空格");
            return "字符串只能包含英文字母和空格";
        }

        // 检查每个单词的首字母是否大写
        String[] words = englishName.split("\\s+");
        for (String word : words) {
            if (word.isEmpty()) {
                continue; // 跳过连续空格产生的空单词
            }
            char firstChar = word.charAt(0);
            if (!Character.isUpperCase(firstChar)) {
                //throw new IllegalArgumentException("单词 '" + word + "' 的首字母必须是大写");
                return "单词 '" + word + "' 的首字母必须是大写";
            }
        }
        return null;
    }

    public static boolean checkChineseName(String chineseName) {
        return Pattern.matches(ChNameRegex, chineseName);
    }

    public static boolean checkChineseNameLength(String chineseName, int length) {
        if (StringUtils.isEmpty(chineseName)) {
            return false;
        }
        return chineseName.length() > length;
    }


    public static void main(String[] args) {
        String s = "我1a";
        System.out.println(checkChineseName(s));
    }
}
