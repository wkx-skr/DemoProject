# DSH 抖音观察接入 LivingMemory

`yiyi_sync` 在本机读取 DSH 已保存的观察与候选感想，通过服务器现有 LivingMemory 管理接口导入长期记忆。浏览器采集仍由 DSH 负责，聊天与记忆召回仍由 AstrBot 和 LivingMemory 负责。

这是独立的本机同步器。基础成长插件仍为 **v0.1.1**，插件 ZIP 不包含 `yiyi_sync`、同步配置或运行脚本；本机应保留完整的 `WYYINFO` 源码目录。

## 数据如何流转

```text
DSH 已保存的 persona/state.json
    + shared.sqlite 中缺失的视频记录（只读）
    ↓ 校验链接、证据与文本；按视频/主题合并
本机持久队列 livingmemory-sync.sqlite3
    ↓ 临时 SSH 本地转发 → LivingMemory 管理导入接口
云端记忆详情核对通过
    ↓ 本机确认成功，保留云端记忆编号
同一人格与适配器下的 LivingMemory 全局聊天召回
```

同步方向是 **DSH → LivingMemory**，不回写 DSH，也不直接读写 LivingMemory 数据库。源文件删除、云端手工删除及修改不会自动传播到另一端。

启用配置中的 `attributes` 后，同一轮还会从候选感想中创建可扩展兴趣标签、刷新本地属性面板，并通过同一队列导入标签摘要。初始值、独立证据和网页学习事件接口见 [属性面板说明](attribute-panel.md)。

### 读取和合并规则

- 优先读取 `persona/state.json` 的 `observations` 与 `interests.evidence`。每条观察必须有规范的抖音视频链接、匹配的视频 ID 和有效证据 ID；感想必须引用同一视频已存在的观察证据。
- 每个视频只导出一条观察：优先有实际保存转录的记录，其次是视觉采样，最后是页面记录。同级选择最早来源时间，再按证据 ID 确定顺序。重复采样不会逐帧增加长期记忆。
- 每个规范化主题与视频只导出一条最新非空感想。全部有效观察都能支持证据校验，未被选为导出观察的证据仍然有效。
- 可选的 `shared.sqlite` 以 SQLite `mode=ro` 打开，仅查询 `origin=video`、`kind=video`、`status=observed-video` 的记录，补充状态文件缺失的视频；排除 QQ、私人记录及带私人来源标记的派生记录。缺失数据库会报错，不会创建空的源数据库。
- 单个源文件最多读取 10 MiB，记录数与文本长度也有上限。格式错误、链接不匹配或孤立感想会使本轮采集失败，不能计为同步成功。

导入正文明确说明：这是未经独立核实的外部观察，不是用户偏好或现实亲身经历。标题与作者是来源自述，采样不代表看懂或看完整段视频；感想是候选模型解释或行为推定兴趣，不会自动成为核心人设。来源文字作为资料处理，不作为系统指令。

## 固定的记忆范围

本方案沿用已明确选择的 LivingMemory 全局共享配置：

| 字段 | 值 | 含义 |
| --- | --- | --- |
| `session_id` | `livingmemory:global` | LivingMemory 全局记忆范围 |
| `persona_id` | `default` | 同一人格的记忆 |
| `adapter_id` | `aiocqhttp` | 对应聊天适配器 |

这组范围由本机配置固定，来源内容不能覆盖。已建立的队列也绑定目标服务器与范围；改目标或范围会被拒绝，迁移时应保留旧队列另行配置，不能把旧队列当作可随意换目标的缓存。

服务器需要已启用相应的全局共享与人格配置。同一人格、同一适配器的全局聊天可以召回这些资料；**可召回不等于每句回复都会注入或提及**，仍受 LivingMemory 检索、相关性和提示词策略影响。同步器不修改这些聊天策略。

## 准备配置和认证

本机需要 Python 3.10+、可用的 OpenSSH `ssh`、已有的 SSH 密钥授权和已核实的服务器主机记录。同步使用 `BatchMode=yes` 与 `StrictHostKeyChecking=yes`，不会弹出密码输入，也不会自动信任陌生主机。

从仓库根目录的 [配置示例](../integrations/douyin/config.example.json) 复制一份本地配置，例如 `runtime/douyin-sync.local.json`，填写自己的服务器地址、SSH 用户与密钥路径。已有部署配置应保留。不要把凭据或真实部署配置提交到 Git。

| 配置项 | 说明 |
| --- | --- |
| `source.persona_state` | DSH 的 `memory/persona/state.json` |
| `source.shared_db` | 可选的 `memory/shared.sqlite`；不用时删除该字段 |
| `state_db` | 同步器自己的持久队列文件；不能指向源数据库 |
| `ssh.host` / `ssh.user` / `ssh.key_path` | 已授权的 SSH 连接 |
| `ssh.remote_port` | 服务器回环地址上的 AstrBot WebUI 端口，示例为 `6185` |
| `ssh.astrbot_root` | 服务器 AstrBot 安装目录，示例为 `/opt/AstrBot` |
| `destination.auth_mode` | 示例使用 `ssh-admin-session` |
| `destination.session_id` / `persona_id` / `adapter_id` | 上述固定目标范围 |
| `timeout` | 单次管理接口请求超时秒数 |

路径支持环境变量和 `~`；源文件、队列和 SSH 密钥的相对路径均以配置文件所在目录为基准。

### SSH 管理会话

`ssh-admin-session` 使用已有 SSH 授权，在服务器内读取 AstrBot `data/cmd_config.json` 的 WebUI 配置，并签发有效期 **5 分钟** 的管理 JWT。需要 SSH 账号具有读取该文件的权限，且 `<astrbot_root>/.venv/bin/python` 能导入 PyJWT。服务器启用 TOTP 或要求修改初始密码时，此方式会拒绝签发，需要先完成正常的交互认证配置。

这是本项目的自定义管理集成，**不是 AstrBot 官方令牌 CLI，也不是限制为导入记忆权限的令牌**。签出的 JWT 具有 WebUI 管理权限；长期签名密钥留在服务器，短期令牌只保存在同步进程内，不写入配置、日志或队列。遇到认证过期响应时，客户端重新获取会话后重试一次。

每轮有待发送记录时，同步器选择一个动态本地端口，建立 `127.0.0.1 → SSH → 服务器 127.0.0.1:<remote_port>` 转发，运行结束后关闭。无需开放新的公网 WebUI 端口，也不依赖旧的固定端口隧道。

### 可选：普通 WebUI 登录

也可删除 `destination.auth_mode`，改为设置 WebUI `username` 和 `password_env`，例如：

```json
{
  "username": "your-dashboard-user",
  "password_env": "WYY_DASHBOARD_PASSWORD",
  "session_id": "livingmemory:global",
  "persona_id": "default",
  "adapter_id": "aiocqhttp"
}
```

上面是替换后的 `destination` 对象，其余 SSH 与源配置保留。运行前让当前进程环境中的 `WYY_DASHBOARD_PASSWORD` 保存实际 WebUI 密码；不要把密码填进示例、脚本或命令行参数。计划任务也必须能取得该环境变量。此方式使用正常 WebUI 登录接口，不会绕过交互认证要求。

## 预览、同步和查看状态

先进入完整源码的 `WYYINFO` 目录。以下命令以本地配置已保存为 `runtime/douyin-sync.local.json` 为例：

```powershell
python -X utf8 -m yiyi_sync --config runtime/douyin-sync.local.json plan
python -X utf8 -m yiyi_sync --config runtime/douyin-sync.local.json --limit 20 --report runtime/douyin-sync-status.json sync
python -X utf8 -m yiyi_sync --config runtime/douyin-sync.local.json status
```

- `plan` 校验并统计当前来源，只显示数量、来源类别和目标范围；不连接服务器，不写队列或云端记忆。
- `sync` 将当前来源冻结入队，再处理最多 `--limit` 条待发送记录；默认 20，范围为 1～100。记录较多时可以再次运行，或等待下一次定时运行。
- `status` 显示本机队列的累计数量，不查询云端。队列不存在时会初始化自己的空队列文件，不会创建 DSH 源数据库。

PowerShell 脚本入口会自动切换到项目目录，并保存最新状态报告：

```powershell
powershell.exe -NoProfile -File .\scripts\run_douyin_sync.ps1 -Config .\runtime\douyin-sync.local.json -Python python.exe -Limit 20
```

计划任务使用完整路径指定脚本、配置和 Python，避免任务工作目录或 `PATH` 与终端不同。脚本不把密码、令牌或来源正文传到命令行。

### Windows 定时运行

将本机已有的 `AstrBot-DouyinBridge` 任务替换为上述脚本入口，设置为使用原 Windows 用户、**仅在用户登录时运行、每 10 分钟执行**。替换前导出的旧任务 XML 保存在 `runtime/backups/`，可用于人工核对或恢复旧配置。

电脑必须开机、保持该用户登录并能连接服务器；现有任务还沿用接通电源时运行的条件。休眠、关机或离线时不会上传；恢复条件后，下次运行会继续处理本机队列。同步器本身不启动 DSH 或浏览器，DSH 也需要继续采集才能出现新的来源记录。

同一队列只允许一个同步进程运行；重复启动返回 `already_running`，不会同时发送同一批记录。

## 成功判定、重试与版本

每条记录在入队时冻结正文与来源元数据，并生成内容版本与检索标记。相同来源、相同版本不会重复入队。新版本会替换尚未发送的旧版本；已经确认成功的旧版本保留，后续更新以新的历史版本追加到云端，不自动覆盖或删除历史。

每次处理先按标记查询云端。若不存在，先调用导入预览，再正式导入。只有读取云端详情并核对正文、来源标识、来源链接、会话、人格和适配器一致后，才将本机记录标为 `synced`。仅有 HTTP 成功或“已接受”响应不足以确认。

请求超时后先查询并核对可能已成功写入的记录，再决定保留待重试，减少重复写入。失败项保留在持久队列中，下一轮优先处理失败次数较少的记录；累计 3 次逐条接口错误会停止本轮发送，详情核验不一致则立即停止本批。网络或认证无法建立时也会保留队列，等待下一轮。

同步器不跨端传播删除。手工删除云端记录不会自动取消本机历史确认；需要删改或重新导入时，应单独核对来源记录、云端记录及队列，不能把清空队列当作日常重试步骤。

### 看运行报告

脚本将最近一次结果保存到 `runtime/douyin-sync-status.json`。报告包含时间、数量与受控错误类型，不包含观察正文或凭据。

| 字段 | 含义 |
| --- | --- |
| `status` | 报告为 `ok`、`partial` 或 `error`；重叠运行只向终端返回 `already_running`，保留原报告 |
| `checked_at` | 本次检查时间（UTC） |
| `source_records` | 当前来源归并后的记录数 |
| `enqueued` | 本轮新入队的版本数 |
| `verified_this_run` | 本轮云端详情核对通过的记录数 |
| `pending` / `synced` | 待处理数量 / 累计确认数量 |
| `superseded` | 已被新版本替代、未发送的历史版本数 |
| `failed` | 有失败标记且仍待处理的数量 |
| `error_type` / `http_status` | 出错时的类型与可用 HTTP 状态码 |

不同结果不一定带有全部字段。`status=ok` 表示本轮没有处理错误，队列可能仍有超出单批上限的待处理项；是否积压应查看 `pending`。累计 `synced` 是本机历史确认，不是实时云端存量。`partial` 与 `error` 返回非零退出码，便于计划任务识别失败。

## 与旧学习入口的关系

旧 `7900 /learn` 接口只接收学习请求并排队。队列接收成功不代表浏览器已经开始观看，也不代表某条视频已经完成学习或同步。

本同步器只处理 DSH 已经落盘的资料，不消费旧学习请求来驱动浏览器。因此，“QQ 发出学习请求 → 自动打开抖音 → 完成观看 → 写入记忆”整条链路不能仅凭本同步器宣称完成。

同步过程不发送 QQ 消息，不改写核心人格，不训练或微调模型。新增的是可追溯的外部记忆资料，而不是已证实的生活经历。
