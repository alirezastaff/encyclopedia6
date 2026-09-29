import glob
import html
import json
import os
import re
import zipfile
import xml.etree.ElementTree as ET


SOURCE_DIR = os.path.join("SSE Atlas", "countries-data")
OUTPUT_FILE = os.path.join("data", "country-articles.json")
COUNTRY_IDS = {
    "brazil": ("BRA", "Brazil"),
    "canada": ("CAN", "Canada"),
    "china": ("CHN", "China"),
    "colombia": ("COL", "Colombia"),
    "ecuador": ("ECU", "Ecuador"),
    "india": ("IND", "India"),
    "iran": ("IRN", "Iran"),
    "italy": ("ITA", "Italy"),
    "japan": ("JPN", "Japan"),
    "kenya": ("KEN", "Kenya"),
    "philippines": ("PHL", "Philippines"),
    "senegal": ("SEN", "Senegal"),
    "south africa": ("ZAF", "South Africa"),
    "south korea": ("KOR", "South Korea"),
    "spain": ("ESP", "Spain"),
    "united states": ("USA", "United States of America"),
    "uruguay": ("URY", "Uruguay"),
}
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
WORD_NS = "{" + NS["w"] + "}"


def paragraph_content(paragraph):
    pieces = []
    for element in paragraph.iter():
        if element.tag == WORD_NS + "t":
            pieces.append(element.text or "")
        elif element.tag == WORD_NS + "tab":
            pieces.append(" ")
        elif element.tag == WORD_NS + "br":
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


def extract_article(path):
    with zipfile.ZipFile(path) as document:
        root = ET.fromstring(document.read("word/document.xml"))
    body = root.find("w:body", NS)
    paragraphs = []
    for paragraph in body.findall("w:p", NS):
        text = paragraph_content(paragraph)
        if text:
            paragraphs.append((text, is_bold_heading(paragraph, text)))
    if len(paragraphs) < 3:
        raise ValueError(f"Expected a title, section heading, and body text in {path}")

    title = paragraphs[0][0]
    summary = next((text for text, heading in paragraphs[1:] if not heading), "")
    if len(summary) > 300:
        summary = summary[:297].rsplit(" ", 1)[0] + "..."

    article_parts = []
    for text, heading in paragraphs[1:]:
        escaped = html.escape(text, quote=True)
        article_parts.append(f"<h2>{escaped}</h2>" if heading else f"<p>{escaped}</p>")
    return title, summary, "\n".join(article_parts)


def main():
    profiles = []
    for path in sorted(glob.glob(os.path.join(SOURCE_DIR, "*.docx"))):
        key = os.path.splitext(os.path.basename(path))[0].lower()
        if key not in COUNTRY_IDS:
            raise ValueError(f"Add an ISO country mapping for {path}")
        country_id, name = COUNTRY_IDS[key]
        title, summary, article = extract_article(path)
        profiles.append({"id": country_id, "name": name, "title": title, "summary": summary, "article": article})
    if set(profile["id"] for profile in profiles) != {value[0] for value in COUNTRY_IDS.values()}:
        raise ValueError("The country article source files do not match the configured country list")
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as output:
        json.dump(profiles, output, ensure_ascii=False, indent=2)
        output.write("\n")
    print(f"Built {len(profiles)} country articles in {OUTPUT_FILE}")


if __name__ == "__main__":
    main()