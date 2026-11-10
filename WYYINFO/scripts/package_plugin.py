"""Package the plugin subdirectory without runtime data or monorepo siblings."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]


def package():
    version_line = next(
        line
        for line in (ROOT / "metadata.yaml").read_text(encoding="utf-8").splitlines()
        if line.startswith("version:")
    )
    version = version_line.split(":", 1)[1].strip()
    if not version or any(c not in "0123456789.-" for c in version):
        raise ValueError("Invalid plugin version")
    files = [
        ROOT / name
        for name in (
            "main.py",
            "metadata.yaml",
            "_conf_schema.json",
            "README.md",
            "characters/wang_yiyi.json",
            "prompts/system.md",
        )
    ]
    files += sorted((ROOT / "yiyi").glob("*.py"))
    files += sorted((ROOT / "docs").glob("*.md"))
    files.append(Path(__file__).resolve())
    if any(not path.is_file() or path.is_symlink() for path in files):
        raise ValueError("Missing or unexpected source file")
    destination = ROOT / "dist" / f"astrbot_plugin_wyy-{version}.zip"
    destination.parent.mkdir(exist_ok=True)
    with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
        for path in files:
            archive.write(path, "astrbot_plugin_wyy/" + path.relative_to(ROOT).as_posix())
    print(destination)
    return destination


if __name__ == "__main__":
    package()
