import glob
import html
import json
import os
import re
import zipfile
import xml.etree.ElementTree as ET


SOURCE_DIR = os.path.join("SSE Atlas", "countries-data-fa")
OUTPUT_FILE = os.path.join("data", "country-articles-fa.json")
COUNTRY_IDS = {
    "اسپانیا": ("ESP", "اسپانیا"),
    "افریقای جنوبی": ("ZAF", "آفریقای جنوبی"),
    "اوروگوئه": ("URY", "اروگوئه"),
    "اکوادور": ("ECU", "اکوادور"),
    "ایالات متحده امریکا": ("USA", "ایالات متحده آمریکا"),
    "ایتالیا": ("ITA", "ایتالیا"),
    "ایران": ("IRN", "ایران"),
    "برزیل": ("BRA", "برزیل"),
    "سنگال": ("SEN", "سنگال"),
    "فیلیپین": ("PHL", "فیلیپین"),
    "هند": ("IND", "هند"),
    "چین": ("CHN", "چین"),
    "ژاپن": ("JPN", "ژاپن"),
    "کانادا": ("CAN", "کانادا"),
    "کره جنوبی": ("KOR", "کره جنوبی"),
    "کلمبیا": ("COL", "کلمبیا"),
    "کنیا": ("KEN", "کنیا"),
}
REFERENCE_HEADINGS = {"منابع", "منابع و مآخذ", "مآخذ", "references", "reference", "bibliography"}
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
WORD_NS = "{" + NS["w"] + "}"


def paragraph_content(paragraph):
    pieces = []
    for element in paragraph.iter():
        if element.tag == WORD_NS + "t":
            pieces.append(element.text or "")
        elif element.tag in (WORD_NS + "tab", WORD_NS + "br"):
            pieces.append(" ")
    return re.sub(r"\s+", " ", "".join(pieces)).strip()


def is_bold_heading(paragraph, text):
    runs = [run for run in paragraph.findall(".//w:r", NS) if paragraph_content(run)]
    if not runs or len(text) > 140:
        return False
    for run in runs:
        formatting = run.find("w:rPr/w:b", NS)
        if formatting is None or formatting.get(WORD_NS + "val", "1") in ("0", "false", "off"):
            return False
    return True


def is_references_heading(text):
    normalized = re.sub(r"\s+", "", text.casefold()).replace("‌", "")
    return normalized in {re.sub(r"\s+", "", item.casefold()).replace("‌", "") for item in REFERENCE_HEADINGS}


def extract_article(path):
    with zipfile.ZipFile(path) as document:
        root = ET.fromstring(document.read("word/document.xml"))
    body = root.find("w:body", NS)
    paragraphs = []
    for paragraph in body.findall("w:p", NS):
        text = paragraph_content(paragraph)
        if text:
            paragraphs.append((paragraph, text))
    if len(paragraphs) < 3:
        raise ValueError(f"Expected a title, section heading, and body text in {path}")

    title = paragraphs[0][1]
    summary = next((text for paragraph, text in paragraphs[1:] if not is_bold_heading(paragraph, text)), "")
    if len(summary) > 300:
        summary = summary[:297].rsplit(" ", 1)[0] + "..."

    article_parts = []
    sources = []
    in_sources = False
    for paragraph, text in paragraphs[1:]:
        if is_bold_heading(paragraph, text) and is_references_heading(text):
            in_sources = True
            continue
        if in_sources:
            sources.append(text)
            continue
        escaped = html.escape(text, quote=True)
        article_parts.append(f"<h2>{escaped}</h2>" if is_bold_heading(paragraph, text) else f"<p>{escaped}</p>")

    profile = {
        "id": "",
        "name": "",
        "title": title,
        "summary": summary,
        "article": "\n".join(article_parts),
    }
    if sources:
        profile["sources"] = sources
    return profile


def main():
    profiles = []
    for path in sorted(glob.glob(os.path.join(SOURCE_DIR, "*.docx"))):
        key = os.path.splitext(os.path.basename(path))[0].lower()
        if key not in COUNTRY_IDS:
            raise ValueError(f"Add an ISO country mapping for {path}")
        country_id, name = COUNTRY_IDS[key]
        profile = extract_article(path)
        profile["id"] = country_id
        profile["name"] = name
        profiles.append(profile)

    expected_ids = {value[0] for value in COUNTRY_IDS.values()}
    if {profile["id"] for profile in profiles} != expected_ids:
        raise ValueError("The country article source files do not match the configured country list")

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as output:
        json.dump(profiles, output, ensure_ascii=False, indent=2)
        output.write("\n")
    reference_count = sum(bool(profile.get("sources")) for profile in profiles)
    print(f"Built {len(profiles)} Persian country articles ({reference_count} with separate references) in {OUTPUT_FILE}")


if __name__ == "__main__":
    main()