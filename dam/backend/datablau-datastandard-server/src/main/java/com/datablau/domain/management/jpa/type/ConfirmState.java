package com.datablau.domain.management.jpa.type;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-20 15:17
 * @description
 */
public enum ConfirmState {
    UNCONFIRMED,     // 未确认 本状态可以进行删除 批次
    CONFIRMED,    // 已确认
    BIND,   // 绑定 (与dop 绑定)
    PASS,  // 通过
    REJECT // 未通过
}
