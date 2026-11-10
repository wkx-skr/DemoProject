# 资料与依据

检索日期：2026-11-10（Asia/Shanghai）。以下区分公开资料、当前工作区观察和项目设计选择。

## “王一一”的身份

用户已明确确认：王一一是原创虚构角色，公开资料只用于参考养成方案。项目不寻找真人原型，也不导入网上同名人物的生日、履历、照片、家庭关系或私人信息。

`characters/wang_yiyi.json` 记录已确认的原创身份、名字及养成用途；年龄、生日和亲属称呼仍等待确定。兴趣、口吻和生活意象属于可修改的原创设定，公开技术资料用于支持接入与记忆设计，不构成角色的真实人生经历。

## AstrBot 接入依据

| 来源 | 本版采用的内容 |
| --- | --- |
| [官方插件开发指南](https://docs.astrbot.app/dev/star/plugin-new.html) | 插件代码位于 `data/plugins/`；根目录提供 `metadata.yaml`；运行数据另放数据目录。 |
| [官方消息事件与 LLM hook](https://docs.astrbot.app/dev/star/guides/listen-message-event.html) | 在 `on_llm_request` 添加稳定设定；动态资料使用临时用户内容，避免旧状态留在历史中。 |
| [官方插件使用说明](https://docs.astrbot.app/use/plugin.html) | 已有 AstrBot 可安装/重载插件，无需重建服务器；安装后检查版本与加载状态。 |
| [官方上下文压缩说明](https://docs.astrbot.app/use/context-compress.html) | 聊天历史压缩不能替代持久记忆，因此提供可独立保存、列出、删除的记录。 |

适配器以 `TextPart.mark_as_temp()` 为前提，声明 AstrBot `>=4.24.0,<5`。这些是 API 兼容声明，尚未证明用户服务器的安装版本和其他插件组合已通过联调。

## 已有项目线索

工作区附近存在 `E:/ideaProject/livingmemory`，其 Git 来源是 [LivingMemory](https://github.com/lxfight-s-Astrbot-Plugins/astrbot_plugin_livingmemory)。本次仅阅读 README、元数据和接口使用方式，未修改该项目，也没有复制其实现代码；这不代表它已经部署在用户服务器。

本版可关闭自身显式记忆，让已有 LivingMemory 负责自动提取与召回。两者没有数据库直连或自动迁移；启用范围和人格要由现有 AstrBot 配置对应起来。

## 本项目的设计选择

以下不是关于真人或心理学的事实结论：每日最多 12 点、四种活动、四个成长阶段、无离线惩罚、最近 8 条记忆注入。它们只是便于验证、修改的第一版规则。暂不引入向量库、自动总结、语音或后台主动消息。
