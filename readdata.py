import pymupdf
from pandas import DataFrame
import re
from pprint import pp as pprint
import json

pdfpath = r"adddrop.pdf"
jsonpath = r"public\json\courses.json"

rows = []
rrows = [[], [], [], [], [], []]

doc = pymupdf.open(pdfpath)
for page in doc:
    text_blocks = page.get_text("dict", flags=pymupdf.TEXTFLAGS_TEXT)["blocks"]
    for block in text_blocks:
        text = ''
        for line in block["lines"]:
            x = int((line['bbox'][0] + line['bbox'][2])/2)
            y = int((line['bbox'][1] + line['bbox'][3])/2)
            available = page.get_pixmap().pixel(x, y)
            for span in line["spans"]:
                text += span["text"] + "\t"
        if available[0] > (available[1] + available[2]):
            text += '0'
        else:
            text += '1'
        rows.append(text)

rows = set(rows)
rows = list(rows)

for i in range(len(rows)):
    calc = rows[i].split("\t")
    if len(calc) == 5:
        sem = calc[2].split(' ')[0]
        teach = " ".join(calc[2].split(' ')[1:])
        calc[2] = sem
        calc.insert(3, teach)
    if len(calc) == 6:
        for i in range(len(calc)):
            if i == 5:
                rrows[i].append(int(calc[i]))
            else:
                rrows[i].append(calc[i])

df = DataFrame({'Section': rrows[0], 'Name': rrows[1], 'Term': rrows[2], 'Teacher': rrows[3], 'Mods': rrows[4], 'Open': rrows[5]})
f = open(jsonpath)
courses = json.load(f)
for i in range(len(courses)):
    courses[i]['offerings'] = [[], []]

for i in range(len(df)):
    found = False
    for j in range(len(courses)):
        if df['Name'][i] == courses[j]['name']:
            found = True
            if df['Term'][i] == 'Fall':
                courses[j]['offerings'][0].append([df['Section'][i], df['Teacher'][i], df['Mods'][i], int(df['Open'][i])])
            if df['Term'][i] == 'Spring':
                courses[j]['offerings'][1].append([df['Section'][i], df['Teacher'][i], df['Mods'][i], int(df['Open'][i])])
            break

f.close()

f = open(jsonpath, "w")
courses = json.dumps(courses)
f.write(courses)
f.close()