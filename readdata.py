import pymupdf
from pandas import DataFrame
import re
from pprint import pp as pprint
import json

pdfpath = r"adddrop.pdf"
jsonpath = r"selectorwebapp\json\courses.json"

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

for i in range(len(rows)):
    calc = rows[i].split("\t")
    if len(calc) == 5:
        sem = calc[2].split(' ')[0]
        teach = " ".join(calc[2].split(' ')[1:])
        calc[2] = sem
        calc.insert(3, teach)
    if len(calc) == 6:
        for i in range(len(calc)):
            if i == 4:
                if (re.search(r"\d\(A-D\)", calc[i])):
                    rrows[i].append(calc[i][0])
                elif (re.search(r"\d\(A-B,( |)D\)|\d\(A,( |)C-D\)", calc[i])):
                    rrows[i].append(calc[i][0])
                elif (re.search(r"\d-\d\(A,C\)", calc[i])):
                    rrows[i].append(calc[i][2])
                elif (re.search(r"\d-\d\(B,D\)", calc[i])):
                    rrows[i].append(calc[i][0])
                elif (re.search(r"\d\(C\) \d\(A,C\)", calc[i])):
                    rrows[i].append(calc[i][5])
                elif (re.search(r"\d\(B,D\) \d\(B\)", calc[i])):
                    rrows[i].append(calc[i][0])
                elif (re.search(r"\d-\d\(A\)", calc[i])):
                    rrows[i].append(calc[i][2])
                elif (re.search(r"\d-\d\(B\)", calc[i])):
                    rrows[i].append(calc[i][0])
                else:
                    rrows[i].append(calc[i][0])
            elif i == 5:
                rrows[i].append(int(calc[i]))
            else:
                rrows[i].append(calc[i])

df = DataFrame({'Section': rrows[0], 'Name': rrows[1], 'Term': rrows[2], 'Teacher': rrows[3], 'Mods': rrows[4], 'Open': rrows[5]})
print(df)
f = open(jsonpath)
courses = json.load(f)
for i in range(len(courses)):
    courses[i]['adddrop'] = [[[], []], [[], []]]
    courses[i]['offerings'] = [[], []]

for i in range(len(df)):
    found = False
    for j in range(len(courses)):
        if df['Name'][i] == courses[j]['name']:
            found = True
            if df['Term'][i] == 'Fall':
                if int(df['Open'][i]) == 1:
                    courses[j]['adddrop'][0][0].append(int(df['Mods'][i]))
                elif int(df['Open'][i]) == 0:
                    courses[j]['adddrop'][1][0].append(int(df['Mods'][i]))
                courses[j]['offerings'][0].append([df['Section'][i], df['Teacher'][i], int(df['Mods'][i])])
            if df['Term'][i] == 'Spring':
                if int(df['Open'][i]) == 1:
                    courses[j]['adddrop'][0][1].append(int(df['Mods'][i]))
                elif int(df['Open'][i]) == 0:
                    courses[j]['adddrop'][1][1].append(int(df['Mods'][i]))
                courses[j]['offerings'][1].append([df['Section'][i], df['Teacher'][i], int(df['Mods'][i])])
            break

f.close()

f = open(jsonpath, "w")
courses = json.dumps(courses)
f.write(courses)
f.close()