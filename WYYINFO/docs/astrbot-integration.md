# 接入现有 AstrBot

本说明只增加角色插件，不重建服务器、Docker、模型提供商或消息平台。当前未获得 dsh 路径或服务器连接信息，以下需要在已有环境执行。

## 选择接入方式

**完整插件模式：** AstrBot `>=4.24.0,<5`，使用内置模型对话链路。该模式包含动态记忆和成长。Dify、Coze 或自行绕过 `on_llm_request` 的插件不保证参与注入，需要单独适配。

**仅静态人格：** 执行 `python -m yiyi persona --title 爸爸 --out runtime/persona.txt`，把文本复制到目标会话使用的 AstrBot 人格系统提示中。此方式可以先看口吻，但没有本插件的持久记忆、成长或管理指令。不要同时启用完整插件注入。

## 安装插件

在现有 AstrBot 数据卷中建立：

```text
data/
  plugins/
    astrbot_plugin_wyy/
      main.py
      metadata.yaml
      _conf_schema.json
      characters/
      prompts/
      yiyi/
```

源码保存在 [DemoProject](https://github.com/wkx-skr/DemoProject) 的 `WYYINFO/` 子目录。可以从插件 ZIP 安装，或只复制 `WYYINFO/` 内的代码到上面的位置，再在 WebUI 重载。不要直接把整个 DemoProject clone 成插件目录，因为它的根目录不是插件入口。Docker 用户操作的是挂载的实际 `data` 卷；不要把路径猜成服务器固定目录，也不要复制 `.venv` 或本地 `runtime` 数据。

在 `WYYINFO/` 内执行 `python scripts/package_plugin.py` 可重新生成安装包。`metadata.yaml` 的 repo 用于指向源码仓库；因为插件位于仓库子目录，更新也应重新安装 ZIP 或复制子目录代码，不使用从仓库根目录拉取代码的自动更新。

本插件不额外安装模型 SDK、Embedding 模型或向量数据库，依赖仅为 Python 标准库与 AstrBot 本身。若版本提示不满足要求，先用静态人格方式，不要直接跳过兼容检查。

## 首次配置

1. 插件正常加载后，在与机器人的私聊中发送 `/yiyi_here`。
2. 复制返回的 64 位标识到插件配置 `allowed_scopes` 列表。它是当前平台会话和发送者的哈希标识，不是 Token，也不是账号密码。
3. 设置 `guardian_title`。默认是“你”，填“爸爸”“妈妈”或昵称均可；这是用户确定的称呼，不由模型猜测。
4. `memory_enabled` 默认开启；使用 LivingMemory 独立管理长期记忆时可关闭。
5. 保存并重载插件；确保目标会话生效的 AstrBot 配置允许本插件，使用不冲突的基础人格。

第一版只处理私聊，群聊不会注入人设或读取私人记录。平台实例、会话标识或发送账号改变后需要重新添加标识；不会自动把旧会话数据迁入新身份。

若 `/yiyi_here` 没反应，先检查插件是否加载、该配置是否允许插件，以及唤醒前缀。文中 `/` 是默认前缀，实际配置可不同。

## 联调验收

1. `/yiyi_status`：初始经验为 0。
2. `/yiyi_remember 我喜欢蓝色`：获得记录编号；`/yiyi_memories` 能看到原文。
3. 正常提问“一一，你觉得今天的小画用什么颜色好？”：观察能否自然参考偏好；语气需要人工判断。
4. `/yiyi_activity read`：增加 3 点；连续多次活动当日总增加最多 12 点。
5. 重载插件后再次查看状态和记忆：应保留。重发一条新活动消息属于新登记；仅同一平台消息的重复投递去重。
6. 未加入名单的另一个账号私聊：不注入一一人格，不读取前一个账号的记录；群聊同样不生效。
7. `/yiyi_forget 编号`：本插件列表中消失。新对话中确认不再从插件资料召回；旧聊天历史里的文本仍可能影响模型。

## 数据、备份与更新

数据文件位于 AstrBot 的实际数据目录下：`plugin_data/astrbot_plugin_wyy/yiyi.sqlite3`。本地 CLI 的 `runtime/yiyi.sqlite3` 与服务器数据独立，不会自动同步。

要备份可先禁用插件、等待正在执行的操作结束，再复制数据库文件与 AstrBot 插件配置。恢复前同样停止写入。已有数据库版本无法识别时，插件会拒绝覆盖，先保留备份再处理。

更新代码前保存对 `characters/wang_yiyi.json` 的个人修改（建议在自己的 Git 中提交）。保持 `data/plugin_data/` 完整，仅更新 `data/plugins/astrbot_plugin_wyy/` 的代码。修改人设或配置后重载插件。

`/yiyi_forget` 只删除本插件的对应记录，不删除 AstrBot 历史、模型服务日志、LivingMemory 或备份中的副本。停用一一不会删除数据库；再次启用原范围后继续使用原记录。

## 与 LivingMemory 共用

可选择：本插件负责显式重要记忆，LivingMemory 负责更长的自动总结；或者关闭本插件记忆，让 LivingMemory 统一管理。第一种模式可能重复召回相同信息，应先用少量消息检查效果。

两者不共享数据库。本插件私聊白名单不约束 LivingMemory 的独立范围；必须在已有记忆插件中设置对应的访问范围。这里没有提供数据库合并、跨用户迁移或批量导入旧聊天的功能。

API 依据见 [资料记录](research.md)。
