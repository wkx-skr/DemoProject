# 王一一 · 个人档案与共同成长框架

给已经运行的 AstrBot 增加一个有稳定性格、能记住小事、可以通过共同活动成长的原创数字角色。服务器、消息平台和模型调用继续由现有 AstrBot 负责。

**当前为 v0.1.0 基础版。** 王一一已确认为原创角色，公开资料只用于参考养成方案。性格与兴趣是可修改的创作设定，年龄和生日留空。网络检索与接口依据见 [资料记录](docs/research.md)。

## 一一的初始模样

温暖、好奇、稍微慢热，有一点小倔强。喜欢故事、颜色和日常里的小发现，允许有自己的偏好，也允许聊天自然结束。默认称呼你为“你”；可在插件配置中改成爸爸、妈妈或昵称。

从 [人物档案](characters/wang_yiyi.json) 修改性格、兴趣、口吻和成长规则；[角色设计](docs/character-design.md) 说明哪些属于设定、哪些需要真实记录。档案中的作息是对话素材，没有后台定时任务。

## 已有能力

| 模块 | 第一版行为 |
| --- | --- |
| 人物档案 | JSON 配置 + 提示词，可以导出给 AstrBot 使用 |
| 长期记忆 | 通过指令显式写入、查看、删除；SQLite 保存，重启后保留 |
| 记忆召回 | 本轮使用同一范围的最近 8 条，每条最多 500 字；暂非语义检索 |
| 共同成长 | 阅读、绘画、分享、复盘；每天最多 12 点，阶段从初识到自主探索 |
| 会话隔离 | 私聊白名单；平台会话与发送者共同确定数据范围 |
| AstrBot 适配 | 稳定人格与临时动态资料分开注入；沿用现有模型与聊天记录 |
| 本地调试 | Python 标准库即可预览人格、操作记忆和验证成长，不需要 API Key |

成长靠明确登记的活动，不会因为一直发消息而自动升级。记忆修正采用“删除旧记录，再添加新记录”。本版不会自动改变性格、主动发消息、生成语音/头像或模拟离线生活。

## 先在本地看效果

Python 3.10+，在仓库根目录执行：

```shell
python -m yiyi validate
python -m yiyi persona --out runtime/persona.txt
python -m yiyi remember "我喜欢蓝色" --kind preference
python -m yiyi activity read --event-id first-reading
python -m yiyi status
python -m yiyi context
python -m yiyi memories
python -m yiyi forget 1
```

`persona` 导出静态人设；`context` 显示程序会提供给模型的资料，不产生模型回复。再次用同一个 `--event-id` 登记活动不会重复计分。

本地数据默认保存在 `runtime/yiyi.sqlite3`，范围为 `local-demo`。换一个独立范围：

```shell
python -m yiyi --scope another-demo status
```

`--scope`、`--db`、`--character` 是全局参数，放在子命令前。若终端中文乱码，可使用 `python -X utf8 -m yiyi ...`。

## 接入已有 AstrBot

完整步骤在 [AstrBot 接入说明](docs/astrbot-integration.md)。插件要求 **AstrBot >=4.24.0,<5**；用户服务器版本和现有插件组合仍需实机验收。

1. 把本仓库代码放入现有 `data/plugins/astrbot_plugin_wyy/`，确认此目录下直接存在 `main.py` 与 `metadata.yaml`，再在 WebUI 重载插件。
2. 在目标私聊发送 `/yiyi_here`，把返回的完整标识加入插件配置 `allowed_scopes`。空名单不启用人设或记忆。
3. 设置 `guardian_title`，保存并重载；在该会话使用适合一一的基础人格，避免叠加另一套互相矛盾的人设。
4. 发送 `/yiyi_status`，再正常聊天。不要同时把完整导出人设粘贴到 AstrBot 又开启本插件，以免重复注入。

| 指令 | 用法 |
| --- | --- |
| `/yiyi_here` | 获取当前私聊的配置标识 |
| `/yiyi_status` | 查看共同积累与阶段 |
| `/yiyi_remember 我喜欢蓝色` | 登记一条记忆，内容可带空格 |
| `/yiyi_memories` | 查看最近 20 条登记的记忆 |
| `/yiyi_forget 1` | 删除当前范围内编号 1 的记忆 |
| `/yiyi_activity read` | 登记阅读：3 点 |
| `/yiyi_activity draw` | 登记绘画或构思画面：3 点 |
| `/yiyi_activity share` | 登记分享日常：2 点 |
| `/yiyi_activity reflect` | 登记复盘尝试：4 点 |

已有 LivingMemory 时，可将 `memory_enabled` 设为 `false`，由它承担长期记忆。本项目不读取或改写 LivingMemory 数据库；两边的范围配置、删除与备份分别管理。

## 目录与验证

```text
characters/wang_yiyi.json   可编辑人物档案
prompts/system.md           稳定行为规则
yiyi/character.py           档案校验和提示词组装
yiyi/store.py               持久记忆、去重与成长事务
yiyi/__main__.py            本地命令行工具
main.py                    AstrBot 插件入口
metadata.yaml              插件元数据
_conf_schema.json          AstrBot 配置表单
docs/                      角色、架构、接入和资料说明
tests/                     存储与接入行为测试
```

```shell
python -m unittest discover -s tests -v
```

测试使用临时 SQLite 文件和 AstrBot 接口替身，不访问服务器或消耗模型额度；不能替代真实 AstrBot 安装测试。运行数据、环境文件和本地配置已被 `.gitignore` 排除。

## Git 与后续

代码目标仓库为 [wkx-skr/DemoProject](https://github.com/wkx-skr/DemoProject)，框架放在独立的 `WYYINFO/` 子目录。该仓库还包含其他项目，安装时复制此子目录的内容或使用插件 ZIP，不要把整个 DemoProject 当作 AstrBot 插件安装。执行本说明中的 Python 命令前，先进入 `WYYINFO/`。

从源码重新打包：

```shell
python scripts/package_plugin.py
```

输出为 `dist/astrbot_plugin_wyy-0.1.0.zip`，仅包含插件代码、档案和说明，不包含运行数据。更新时重新安装此包或复制子目录内容；不要使用指向仓库根目录的自动代码更新。

下一步先确认年龄/生日、专属称呼、dsh 所在位置、AstrBot 版本与现有插件列表，再做一次私聊联调。之后可增加经过确认的成长日记、兴趣变化和可控的主动问候。
