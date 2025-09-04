package com.datablau.project.util;

/**
 * @author: hxs
 * @date: 2025/7/2 11:33
 */
public class CheckFileNameUtil {

    public static void checkExcelFileName(String fileName) {
        String[] split = fileName.split("\\.");
        if(!split[split.length-1].equals("xlsx")) {
            throw new RuntimeException("上传文件必须是xlsx文件");
        }
    }
}
