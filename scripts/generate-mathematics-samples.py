"""Generate original, explicitly labeled website sample activities (requires reportlab)."""
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable

OUT = Path(__file__).resolve().parents[1] / 'static/downloads/mathematics'
SAMPLES = [
    ('pattern-detectives', 'Pattern detectives', 'Lower School', 'Mathematics + creative reasoning',
     'How can the same pattern be represented in different ways?',
     ['Build a repeating pattern with two kinds of objects. Draw the first twelve objects.',
      'Describe the part that repeats. How could you predict the twentieth object without building the whole pattern?',
      'Now make a growing pattern: 1 square, then 3 squares, then 5 squares. Draw the next two stages.',
      'Explain how the growing pattern differs from the repeating pattern. Ask a partner to test your explanation.']),
    ('measure-a-garden', 'Measure a garden', 'Lower School', 'Mathematics + design',
     'Can two gardens have the same perimeter and different areas?',
     ['On squared paper, draw a rectangular garden that is 2 units wide and 6 units long. Count its area and perimeter.',
      'Draw gardens measuring 3 by 5 units and 4 by 4 units. Compare their areas and perimeters.',
      'Use a drawing to explain why the gardens have the same perimeter but different areas.',
      'Design a garden of your own. Label the lengths and explain how you checked your measurements.']),
    ('classroom-data', 'Our classroom in data', 'Lower School', 'Mathematics + observation',
     'How can we show what a collection contains?',
     ['Collect twenty classroom objects, such as blocks or counters. Choose a feature by which to sort them.',
      'Make a tally chart. Check that your category counts add up to twenty.',
      'Make a bar graph with a title, category labels, and an even scale.',
      'Write two statements supported by your graph. What does your graph leave out?']),
    ('motion-and-graphs', 'Motion and graphs', 'Middle School', 'Mathematics + physics',
     'What does the slope of a distance-time graph tell us?',
     ['Use these sample observations: time (seconds) 0, 1, 2, 3, 4; distance (meters) 0, 2, 4, 6, 8. Label the units.',
      'Plot the observations. Calculate the change in distance for each one-second interval.',
      'A second object has distances 0, 1, 4, 9, 16 meters at the same times. Plot these observations and compare.',
      'Explain which object has constant speed. What information would you need to test the model with a real object?']),
    ('growing-patterns', 'Growing patterns in code', 'Middle School', 'Mathematics + computer science',
     'Can a short program describe a growing pattern?',
     ['A pattern contains 3, 5, 7, and 9 tiles in stages 1, 2, 3, and 4. Sketch one possible arrangement.',
      'Write a rule for the number of tiles in stage n. Check the rule at each known stage.',
      'Write pseudocode or Python to produce the first ten stage totals. Compare the output with your prediction.',
      'Explain why matching ten outputs is useful evidence but is not a proof that your rule describes every stage.']),
    ('plant-growth', 'What does a plant graph tell us?', 'Middle School', 'Mathematics + biology',
     'Does a graph alone explain why a plant grew?',
     ['Sample heights in centimeters: day 0: 4; day 3: 5; day 6: 7; day 9: 8; day 12: 10. Organize the data in a table.',
      'Graph height against day. Calculate the change in height over each three-day interval.',
      'Estimate the height on day 15 and describe the assumption behind your estimate.',
      'Propose a fair comparison of two growing conditions. Explain why one plant alone cannot establish the cause of a difference.']),
    ('model-and-residuals', 'A model is a starting point', 'High School', 'Mathematics + data science',
     'How can the errors of a model help us improve it?',
     ['Use data pairs (x, y): (1, 3), (2, 5), (3, 8), (4, 8), (5, 11). Try the model y = 2x + 1.',
      'Calculate each prediction and residual, defined as observed y minus predicted y.',
      'Find the mean absolute error. Plot the residuals and explain what a positive residual means.',
      'Compare the model with y = 2x. State which has smaller mean absolute error on these observations and why more data would help.']),
    ('optimization', 'Design under constraints', 'High School', 'Mathematics + design + calculus',
     'Which open box can hold the most?',
     ['Start with a 20 cm by 30 cm rectangle. Cut a square of side x from each corner and fold up the sides.',
      'Write the volume as a function of x and justify the feasible domain 0 < x < 10.',
      'Use a table, graph, or derivative to identify a candidate maximum. Explain how you know it is a maximum.',
      'Discuss how material thickness and construction constraints could change a practical design.']),
    ('proof-and-code', 'From computation to proof', 'High School', 'Mathematics + computer science',
     'What does a computer experiment establish, and what still needs proof?',
     ['Compute the sums of the first 1, 2, 3, 4, and 5 positive odd integers. Form a conjecture.',
      'Write code or pseudocode to test the conjecture for the first 100 cases.',
      'Explain the pattern with a square diagram or an induction argument.',
      'Compare your computational evidence with the proof. Explain how each contributes to your understanding.']),
]

def build():
    OUT.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Brand', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#006d74'), spaceAfter=22))
    styles.add(ParagraphStyle(name='Task', fontName='Helvetica', fontSize=11, leading=17, spaceAfter=15))
    styles['Title'].alignment = TA_LEFT
    styles['Title'].textColor = colors.HexColor('#164d57')
    for slug, title, division, connection, question, tasks in SAMPLES:
        doc = SimpleDocTemplate(str(OUT / (slug + '.pdf')), pagesize=(612, 792), rightMargin=54, leftMargin=54, topMargin=48, bottomMargin=45, title=title, author='Primoris website draft')
        story = [Paragraph('PRIMORIS ACADEMY / MATHEMATICS', styles['Brand']), Paragraph(title, styles['Title']), Paragraph(division + ' | ' + connection, styles['Task']), HRFlowable(width='100%', color=colors.HexColor('#00a5ae')), Spacer(1, 18), Paragraph('Website sample - for review', styles['Heading3']), Paragraph('An original illustrative activity for the website prototype. This is not an approved Primoris classroom handout or a confirmed curriculum requirement.', styles['Task']), Paragraph(question, styles['Heading2'])]
        for i, task in enumerate(tasks, 1):
            story.append(Paragraph(str(i) + '. ' + task.replace('&', '&amp;').replace('<', '&lt;'), styles['Task']))
        story += [Spacer(1, 15), Paragraph('Reflect', styles['Heading3']), Paragraph('What did you discover? What would you investigate next? Show your reasoning with words, diagrams, calculations, or code.', styles['Task'])]
        doc.build(story)

if __name__ == '__main__':
    build()
