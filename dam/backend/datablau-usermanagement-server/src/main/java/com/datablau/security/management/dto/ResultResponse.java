package com.datablau.security.management.dto;

public class ResultResponse {

    private int code;      // 用于存储返回的状态码
    private String message; // 用于存储返回的消息

    // 默认构造方法
    public ResultResponse() {}

    // 带参构造方法
    public ResultResponse(int code, String message) {
        this.code = code;
        this.message = message;
    }

    // 获取 code 的值
    public int getCode() {
        return code;
    }

    // 设置 code 的值
    public void setCode(int code) {
        this.code = code;
    }

    // 获取 message 的值
    public String getMessage() {
        return message;
    }

    // 设置 message 的值
    public void setMessage(String message) {
        this.message = message;
    }

    // 重写 toString 方法，方便输出结果
    @Override
    public String toString() {
        return "ResultResponse{" +
                "code=" + code +
                ", message='" + message + '\'' +
                '}';
    }

    // 静态方法用于快速构造 ResultResponse 对象
    public static ResultResponse success(String message) {
        return new ResultResponse(0, message);
    }

    public static ResultResponse error(String message) {
        return new ResultResponse(-1, message);
    }
}
