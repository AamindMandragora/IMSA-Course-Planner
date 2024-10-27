Object.defineProperties(Array.prototype, {
    count: {
        value: function(value) {
            if (typeof this[0] == 'object') {
                var sum = 0;
                for (var i = 0; i < this.length; i++) {
                    sum += this[i].count(value);
                }
                return sum;
            } else {
                return this.filter(x => x==value).length;
            }
        }
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function randint(max, min=0) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getData() {
    var response = await fetch('/json/courses.json');
    return response.json();
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const permutator = (inputArr) => {
    let result = [];
  
    const permute = (arr, m = []) => {
        if (arr.length === 0) {
            result.push(m)
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next))
            }
        }
   }
   permute(inputArr)
   return result;
}

function checkAvailable(data, courses, coursesGiven, index, slots, full, semester, maxswitched) {
    if (courses[index] != "") {
        var course = data[courses[index]].offerings[semester];
        for (var i = 0; i < course.length; i++) {
            var indexo = index - (index % 2);
            var indexe = indexo + 1;
            if (course[i][2].includes(index+1) && (full || course[i][3] == 1 || (coursesGiven.includes(data[courses[index]].name)) && !(coursesGiven[index] == data[courses[index]].name)) && (!(coursesGiven.includes(courses[index])) || (coursesGiven[index] == data[courses[index]].name) || (maxswitched > 0))) {
                if (course[i][2].includes("(A-D)") && slots[index][0] == -1 && slots[index][1] == -1 && slots[index][2] == -1 && slots[index][3] == -1) {
                    slots[index] = [courses[index], courses[index], courses[index], courses[index]]
                } else if (course[i][2].includes("(A-B,D)") && slots[index][0] == -1 && slots[index][1] == -1 && slots[index][3] == -1) {
                    slots[index] = [courses[index], courses[index], slots[index][2], courses[index]]
                } else if (course[i][2].includes("(A,C-D)") && slots[index][0] == -1 && slots[index][2] == -1 && slots[index][3] == -1) {
                    slots[index] = [courses[index], slots[index][1], courses[index], courses[index]]
                } else if (course[i][2].includes("(A,C)") && course[i][2].includes("(C)") && slots[indexo][2] == -1 && slots[indexe][0] == -1 && slots[indexe][2] == -1) {
                    slots[indexo][2] = courses[index];
                    slots[indexe] = [courses[index], slots[indexe][1], courses[index], slots[indexe][1]];
                } else if (course[i][2].includes("(B,D)") && course[i][2].includes("(D)") && slots[indexe][1] == -1 && slots[indexo][1] == -1 && slots[indexo][3] == -1) {
                    slots[indexe][1] = courses[index];
                    slots[indexo] = [slots[indexe][1], courses[index], slots[indexe][1], courses[index]];
                } else if (course[i][2].includes("(A,C)") && slots[indexo][2] == -1 && slots[indexo][0] == -1 && slots[indexe][0] == -1 && slots[indexe][2] == -1) {
                    slots[indexe] = [courses[index], slots[indexe][1], courses[index], slots[indexe][3]];
                    slots[indexo] = [courses[index], slots[indexo][1], courses[index], slots[indexe][3]];
                } else if (course[i][2].includes("(B,D)") && slots[indexo][1] == -1 && slots[indexo][3] == -1 && slots[indexe][1] == -1 && slots[indexe][3] == -1) {
                    slots[indexe] = [slots[indexe][0], courses[index], slots[indexe][2], courses[index]];
                    slots[indexo] = [slots[indexo][0], courses[index], slots[indexo][2], courses[index]];
                } else if (course[i][2].includes("(A)") && slots[indexo][0] == -1 && slots[indexe][0] == -1) {
                    slots[indexe][0] = courses[index];
                    slots[indexo][0] = course[index];
                } else if (course[i][2].includes("(B)") && slots[indexo][1] == -1 && slots[indexe][1] == -1) {
                    slots[indexe][1] = courses[index];
                    slots[indexo][1] = course[index];
                } else if (course[i][2].includes("(C)") && slots[indexo][2] == -1 && slots[indexe][2] == -1) {
                    slots[indexe][2] = courses[index];
                    slots[indexo][2] = course[index];
                } else if (course[i][2].includes("(D)") && slots[indexo][3] == -1 && slots[indexe][3] == -1) {
                    slots[indexe][3] = courses[index];
                    slots[indexo][3] = course[index];
                }
                if ((coursesGiven.includes(data[courses[index]].name)) && !(coursesGiven[index] == data[courses[index]].name)) {
                    maxswitched -= 1;
                }
            }
        }
    }
    if (index + 1 < courses.length) {
        return checkAvailable(data, courses, coursesGiven, index+1, slots, full, semester, maxswitched);
    } else {
        return slots;
    }
}

function checkSemester(data, coursesRequested, coursesGiven, prerequisites=[]) {
    var courses = name2numbers(data, coursesRequested);
    var maxmods = 32;
    for (var i = 0; i < courses.length; i++) {
        if (['X(A,B,C,D)', 'O(A,C) E(A,C)'].includes(data[courses[i]].modpattern[0])) {
            maxmods -= 4;
        } else if (['E(A,C,D)', 'O(C) E(A,C)'].includes(data[courses[i]].modpattern[0])) {
            maxmods -= 3
        } else if (['O(A) E(A)'].includes(data[courses[i]].modpattern[0])) {
            maxmods -= 2
        }
        break;
    }
    let p = permutator(courses);
    shuffleArray(p);
    out = [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1]
    ];
    let sem = 0;
    if (document.getElementById('spring').checked) {
        sem = 1;
    }
    for (var i = 0; i < p.length; i++) {
        slots = [
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1]
        ];
        if (p[i] != '') {
            var slots = checkAvailable(data, p[i], coursesGiven, 0, slots, document.getElementById("full").checked, sem, parseInt(document.getElementById("switches").value));
            if (slots.count(-1) < out.count(-1)) {
                out = slots;
            }
        }
    }
    return out;
}

function name2numbers(data, courses) {
    var out = ['', '', '', '', '', '', '', '']
    for (var i = 0; i < courses.length; i++) {
        for (var j = 0; j < data.length; j++) {
            if (data[j].name == courses[i]) {
                out[i]=j;
                break;
            }
        }
    }
    return out;
}

function numbers2name(data, slots) {
    for (var i = 0; i < slots.length; i++) {
        for (var j = 0; j < slots[i].length; j++) {
            if (slots[i][j] != -1) {
                slots[i][j] = data[slots[i][j]].name;
            } else {
                slots[i][j] = "";
            }
        }
    }
    return slots;
}

function makeTable(data, coursesRequested, coursesGiven, prerequisites) {
    let sem = numbers2name(data, checkSemester(data, coursesRequested, coursesGiven, prerequisites));
    document.getElementById('form').style.display = 'none';
    document.getElementById('output').style.display = 'flex';
    let semtable = document.getElementById("schedule");
    semtable.innerHTML =    `<tr>
                                <th>A</th>
                                <th>B</th>
                                <th>C</th>
                                <th>D</th>
                            </tr>`
    let coursesSeen = [];
    for (var i = 0; i < sem.length; i++) {
        let mod = document.createElement("tr")
        for (var j = 0; j < sem[1].length; j++) {
            let course = document.createElement("td");
            course.innerText = sem[i][j];
            if (sem[i][j] != '') {
                if (!coursesSeen.includes(sem[i][j])) {
                    coursesSeen.push(sem[i][j]);
                }
                course.classList.add(`mod${coursesSeen.indexOf(sem[i][j]) + 1}`)
            }
            mod.appendChild(course);
        }
        semtable.appendChild(mod);
    }
    document.getElementById('redo').addEventListener('click', onLoad);
}

function updateDropdowns(data) {
    var news = document.getElementsByClassName("newclass");
    for (var i = 0; i < news.length; i++) {
        var c = document.createElement("option");
        c.innerText = "Select a Class";
        c.value = "";
        news[i].appendChild(c);
        for (var j = 0; j < data.length; j++) {
            var c = document.createElement("option");
            c.innerText = data[j].name;
            c.value = data[j].name;
            news[i].appendChild(c);
        }
    }
}

async function onLoad() {
    const data = await getData();
    document.getElementById('form').style.display = 'flex';
    document.getElementById('output').style.display = 'none';
    updateDropdowns(data);
    document.getElementById('fall').checked = true;
    document.getElementById('submit').addEventListener('click', async function() {
        document.getElementById("errors").innerText = "";
        var prerequisites = [];
        let coursesRequested = ['', '', '', '', '', '', '', ''];
        let coursesGiven = ['', '', '', '', '', '', '', ''];
        var news = Array.from(document.getElementsByClassName('newclass'));
        for (var i = 0; i < news.length; i++) {
            coursesRequested[i]=news[i].value;
        }
        var powers = document.getElementById("powerschool").value;
        powers = powers.split("\n");
        for (var j = 0; j < powers.length; j++) {
            var sisplit = powers[j].split("\t")
            var i = parseInt(sisplit[0][0])-1;
            if (i > -1) {
                if (sisplit[0].includes("A-D") || sisplit[0].includes("A-B") || sisplit[0].includes("C-D")) {
                    coursesGiven[i]=sisplit[3];
                } else if (sisplit[0].includes("A") || sisplit[0].includes("C")) {
                    coursesGiven[(i-(i%2)+1)]=sisplit[3];
                } else if (sisplit[0].includes("B") || sisplit[0].includes("D")) {
                    coursesGiven[(i-(i%2))]=sisplit[3];
                }
            }
        }
        console.log(coursesGiven);
        let courses = name2numbers(data, coursesRequested);
        let flags = [false, false];
        for (var i = 0; i < courses.length; i++) {
            if (courses[i] == "") {
                continue;
            }
            if (data[courses[i]].subject == "Math") {
                flags[0] = true;
            } else if (data[courses[i]].subject == "English") {
                flags[1] = true;
            }
        }
        if (coursesRequested.count("") <= 3 && flags.count(false) == 0) {
            makeTable(data, coursesRequested, coursesGiven, prerequisites);
        }
        if (coursesRequested.count("") > 3) {
            document.getElementById("errors").innerText += 'You need to add more classes.\n'
        }
        if (flags[0] == false) {
            document.getElementById("errors").innerText += 'You need at least one math class per semester.\n'
        }
        if (flags[1] == false) {
            document.getElementById("errors").innerText += 'You need at least one english class per semester.\n'
        }
    })
}

window.onload = async function() {
    onLoad()
};