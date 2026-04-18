import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BASE_DOC = ROOT_DIR / "DOC" / "designDocument" / "baseDoc"
GENERATED_DOC = ROOT_DIR / "DOC" / "designDocument" / "generatedDoc"

# 改良版の柔軟なパターン
INCLUDE_PATTERN = r"```(?:\w+)?\s*\r?\n<!--\s*INCLUDE:(.*?)\s*-->\s*\r?\n```"

def embed_code_blocks(md_path: Path):
    content = md_path.read_text(encoding='utf-8')

    def replacer(match):
        relative_path = match.group(1).strip()
        target_path = (ROOT_DIR / relative_path).resolve()

        if not target_path.exists():
            print(f"[!] ファイルが見つかりません: {relative_path}")
            return f"```txt\n// ファイルが見つかりません: {relative_path}\n```"

        code = target_path.read_text(encoding='utf-8').strip()
        extension = target_path.suffix[1:] or "txt"

        # Java の import 行を除去
        if extension == "java":
            code_lines = code.splitlines()
            filtered_lines = [line for line in code_lines if not line.strip().startswith("import ")]
            code = "\n".join(filtered_lines)

            # 連続する空行を1つにまとめて削除
            code = re.sub(r"\n{2,}", "\n", code).strip()


        return f"```{extension}\n{code}\n```"

    # INCLUDE を実際に置き換える
    new_content = re.sub(INCLUDE_PATTERN, replacer, content, flags=re.DOTALL)

    # 出力先パスを構築
    relative_path = md_path.relative_to(BASE_DOC)
    output_path = GENERATED_DOC / relative_path
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(new_content, encoding='utf-8')

    print(f"[✓] 生成: {output_path.relative_to(ROOT_DIR)}")

def run():
    for section in ["BE", "FE"]:
        md_files = list((BASE_DOC / section).rglob("*.md"))
        print(f"\n📄 {section} Markdownファイル数: {len(md_files)}")
        for md_file in md_files:
            embed_code_blocks(md_file)

if __name__ == "__main__":
    run()
