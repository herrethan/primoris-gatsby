"""Generate labeled draft project prompts for department previews (requires ReportLab)."""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'static/downloads/departments'

def build():
    data = json.loads((ROOT / 'content/department-resources.json').read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    styles['Title'].alignment = 0
    styles['Title'].textColor = colors.HexColor('#164d57')
    styles.add(ParagraphStyle(name='Brand', fontName='Helvetica-Bold', fontSize=10, spaceAfter=18, textColor=colors.HexColor('#006d74')))
    styles.add(ParagraphStyle(name='Prompt', fontName='Helvetica', fontSize=11, leading=17, spaceAfter=16))
    for slug, subject in data.items():
        for division, activities in subject['divisions'].items():
            # Keep existing download URLs while using High School in the content.
            division_slug = 'upper-school' if division == 'High School' else division.lower().replace(' ', '-')
            filename = f"{slug}-{division_slug}.pdf"
            doc = SimpleDocTemplate(str(OUT / filename), pagesize=(612,792), leftMargin=54, rightMargin=54, topMargin=42, bottomMargin=42, title=f"{subject['title']} - {division} sample projects", author='Primoris website draft')
            story = [Paragraph('PRIMORIS ACADEMY / WEBSITE PREVIEW', styles['Brand']), Paragraph(escape(subject['title']), styles['Title']), Paragraph(escape(division) + ' | Three sample project prompts', styles['Prompt']), HRFlowable(width='100%', color=colors.HexColor('#00a5ae')), Spacer(1,14), Paragraph('NOT REVIEWED - illustrative draft', styles['Heading3']), Paragraph('Original sample prompts for reviewing the website format. These are not approved classroom materials, a confirmed syllabus, or a list of current offerings. Discuss activities and appropriate materials with a teacher.', styles['Prompt'])]
            for activity in activities:
                story.extend([Paragraph(escape(activity['title']), styles['Heading3']), Paragraph(escape(activity['prompt']), styles['Prompt'])])
            story.extend([Paragraph('Reflect and explain', styles['Heading3']), Paragraph('What did you discover? What evidence supports your explanation? What would you change or investigate next?', styles['Prompt'])])
            doc.build(story)
    print(f"Generated {sum(len(s['divisions']) for s in data.values())} draft resource PDFs.")

if __name__ == '__main__':
    build()
