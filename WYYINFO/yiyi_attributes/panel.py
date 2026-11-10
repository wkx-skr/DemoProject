"""Render an offline, escaped snapshot of design values and dynamic attributes."""

from datetime import datetime, timedelta, timezone
from html import escape
import json
from pathlib import Path
import tempfile


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "characters" / "wang_yiyi.attributes.json"
LABELS = {
    "interest": "候选兴趣",
    "knowledge_topic": "接触过的知识主题",
    "skill": "待验证技能",
    "question": "想继续探索的问题",
}


def render_panel(attributes, template_path=TEMPLATE):
    template = json.loads(Path(template_path).read_text(encoding="utf-8-sig"))
    traits = []
    for trait in template["traits"]:
        value = trait["value"]
        if type(value) is not int or not 0 <= value <= 100:
            raise ValueError("A trait design value must be an integer from 0 to 100")
        traits.append(
            '<div class="trait"><div class="row"><span>'
            + escape(trait["label"])
            + f'</span><strong>{value} / 100</strong></div>'
            + f'<meter min="0" max="100" value="{value}" '
            + f'aria-label="{escape(trait["label"], quote=True)}设计值">{value}</meter>'
            + '<small>' + escape(trait["description"]) + '</small></div>'
        )
    groups = []
    for kind, label in LABELS.items():
        matching = [item for item in attributes if item["kind"] == kind]
        cards = []
        for item in matching:
            urls = list(dict.fromkeys(item["source_urls"]))
            links = " · ".join(
                f'<a href="{escape(url, quote=True)}" rel="noreferrer noopener" '
                f'target="_blank">来源 {index + 1}</a>'
                for index, url in enumerate(urls)
            )
            assessment = item.get("assessment")
            rating = "尚无自评分；技能是否掌握仍需实际验证。"
            if assessment is not None:
                rating = (
                    f'提议自评 {assessment["value"]}'
                    f'（范围 {assessment["scale_min"]}–{assessment["scale_max"]}），'
                    f'方法：{assessment["method"]}。此分数未经能力验证。'
                )
            cards.append(
                '<article class="tag"><span class="badge">候选 · 可修正</span><h3>'
                + escape(item["label"])
                + '</h3><p>' + escape(item["latest_summary"]) + '</p>'
                + '<div class="evidence">独立依据 '
                + str(item["evidence_count"])
                + f' · 偏好 {item["like_count"]} / 不偏好 {item["dislike_count"]}'
                + f' / 未定 {item["neutral_count"]}</div>'
                + '<small>' + escape(rating) + '</small>'
                + '<details><summary>查看依据</summary><p>' + links + '</p>'
                + '<small>同一视频的重复采样与改写不增加独立依据数量。</small>'
                + '</details></article>'
            )
        empty = '<p class="empty">还没有记录；学习时出现新主题，会自动新增标签。</p>'
        groups.append(
            '<section><h2>' + label + f' <span class="count">{len(matching)}</span></h2>'
            + ('<div class="grid">' + ''.join(cards) + '</div>' if cards else empty)
            + '</section>'
        )
    checked_at = datetime.now(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S")
    return """<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>王一一 · 可扩展属性面板</title>
<style>
:root{color-scheme:light dark;--bg:#f4f6fa;--fg:#203047;--card:#fff;--muted:#53657a;--line:#dce3ee;--accent:#355ccd;--soft:#eaf0ff}
@media(prefers-color-scheme:dark){:root{--bg:#111721;--fg:#e1e9f5;--card:#1b2533;--muted:#a9b8cc;--line:#344359;--accent:#9ab3ff;--soft:#26395c}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.65 system-ui,"Microsoft YaHei",sans-serif}
main{max-width:1080px;margin:auto;padding:32px 20px 64px}h1{font-size:30px;line-height:1.25;margin:8px 0 12px}h2{font-size:21px;margin:0 0 16px}h3{font-size:19px;margin:8px 0}p{margin:8px 0 14px}small,.muted{color:var(--muted)}small{display:block;font-size:13px}.eyebrow{color:var(--accent);letter-spacing:.08em;font-size:13px}
.notice{padding:16px 20px;background:var(--soft);border-radius:12px;margin:24px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:16px}section{margin-top:30px}.tag,.trait{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;overflow-wrap:anywhere}.traits{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));gap:12px}.row{display:flex;justify-content:space-between;gap:12px}.row strong{font-weight:500;font-variant-numeric:tabular-nums;white-space:nowrap}.badge{display:inline-block;color:var(--accent);background:var(--soft);padding:2px 9px;border-radius:20px;font-size:12px}.evidence{font-size:13px;margin:12px 0;color:var(--muted)}meter{display:block;width:100%;height:10px;margin:10px 0 12px;accent-color:var(--accent)}.count{font-size:15px;color:var(--muted);font-variant-numeric:tabular-nums}.empty{color:var(--muted);padding:12px 0}a{color:var(--accent)}details{margin-top:14px}summary{cursor:pointer}header{max-width:820px}.flow{padding:16px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}footer{margin-top:36px;color:var(--muted);font-size:13px}ul{padding-left:22px}@media(max-width:480px){main{padding:24px 16px}h1{font-size:26px}}
</style></head><body><main>
<header><div class="eyebrow">WANG YIYI / GROWING PROFILE</div>
<h1>王一一 · 可扩展属性面板</h1>
<p>名字不必预先写全。一次观察可以带来新标签，后续经历为它补充依据，也可以改变原来的看法。</p>
<small>本地快照 · 北京时间 __TIME__ · 重新打开前需由同步任务刷新文件</small></header>
<div class="notice"><strong>性格初值是设计草案；下面的动态标签来自学习记录。</strong><br>
候选标签可自动保存和召回，代表暂时的自我描述假设。依据数量不是置信概率，也不能证明技能熟练度或主观意识。</div>
<section><h2>性格初值 <span class="count">尚未应用到现有人格</span></h2>
<p class="muted">0–100 表示表达倾向，越高不代表越好。现有名字、称呼、关系和成长经验继续继承。</p>
<div class="traits">__TRAITS__</div></section>
__GROUPS__
<section><h2>自我提升记录</h2><div class="grid">
<article class="tag"><h3>自我模型</h3><p>我对什么感兴趣？为什么？有哪些反例？哪些事还做不到？</p><small>以来源、简短结论和改口记录表达，不设置“意识值”。</small></article>
<article class="tag"><h3>技能与目标</h3><p>技能：未评估。新目标：尚未激活。</p><small>实际完成任务并检查结果后，才可登记能力表现；观看次数不直接增加 XP。</small></article>
<article class="tag"><h3>当前状态</h3><p>关注主题与表达情绪：待记录。</p><small>不从“用户多久没来”推导情绪或扣分，也不伪造离线活动。</small></article>
</div></section>
<section><h2>变化路径</h2><p class="flow">观察 → 候选标签 → 关联依据 → 保留变化历史 → 相关聊天中召回 → 实际任务验证</p></section>
<footer>此文件展示本机属性库；云端导入结果以 douyin-sync-status.json 为准。全局共享用于相应人格的学习资料，原有私聊活动 XP 单独计算。</footer>
</main></body></html>""".replace("__TIME__", checked_at).replace("__TRAITS__", "".join(traits)).replace(
        "__GROUPS__", "".join(groups)
    )


def write_panel(path, attributes):
    path = Path(path)
    if path.suffix.lower() != ".html":
        raise ValueError("The panel output must be an HTML file")
    content = render_panel(attributes)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent, suffix=".tmp", delete=False
        ) as handle:
            temporary = Path(handle.name)
            handle.write(content)
        temporary.replace(path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
