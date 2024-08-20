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
    if (
        (
            (data[courses[index]].adddrop[0][semester].includes(index+1)) || 
            ((full == true || maxswitched != 0) && (data[courses[index]].adddrop[1][semester].includes(index+1))) || 
            ((coursesGiven.indexOf(data[courses[index]].name) == index))
        ) && (
            (coursesGiven.indexOf(data[courses[index]].name) == -1) || 
            (coursesGiven.indexOf(data[courses[index]].name) == index) ||
            (maxswitched != 0)
        )
    ) {
        if (data[courses[index]].modpattern[0] == 'X(A,B,C,D)') {
            if (slots[index][0] == -1 &&
                slots[index][1] == -1 &&
                slots[index][2] == -1 &&
                slots[index][3] == -1) {
                slots[index][0] = courses[index];
                slots[index][1] = courses[index];
                slots[index][2] = courses[index];
                slots[index][3] = courses[index];
                if (!((coursesGiven.indexOf(data[courses[index]].name) == -1) || (coursesGiven.indexOf(data[courses[index]].name) == index))) {
                    maxswitched -= 1;
                }
            }
        } else if (data[courses[index]].modpattern[0] == 'E(A,C,D)') {
            if (index % 2 == 0 &&
                slots[index][0] == -1 &&
                slots[index][1] == -1 &&
                slots[index][3] == -1) {
                slots[index][0] = courses[index];
                slots[index][1] = courses[index];
                slots[index][3] = courses[index];
                if (!((coursesGiven.indexOf(data[courses[index]].name) == -1) || (coursesGiven.indexOf(data[courses[index]].name) == index))) {
                    maxswitched -= 1;
                }
            } else if (index % 2 == 1 &&
                slots[index][0] == -1 &&
                slots[index][2] == -1 &&
                slots[index][3] == -1) {
                slots[index][0] = courses[index];
                slots[index][2] = courses[index];
                slots[index][3] = courses[index];
                if (!((coursesGiven.indexOf(data[courses[index]].name) == -1) || (coursesGiven.indexOf(data[courses[index]].name) == index))) {
                    maxswitched -= 1;
                }
            }
        } else if (data[courses[index]].modpattern[0] == 'O(A,C) E(A,C)') {
            var i = Math.floor(index / 2);
            if (index % 2 == 1 && 
                slots[2*i][0] == -1 &&
                slots[2*i+1][0] == -1 &&
                slots[2*i][2] == -1 &&
                slots[2*i+1][2] == -1) {
                slots[2*i][0] = courses[index];
                slots[2*i+1][0] = courses[index];
                slots[2*i][2] = courses[index];
                slots[2*i+1][2] = courses[index];
                if (!((coursesGiven.indexOf(data[courses[index]].name) == -1) || (coursesGiven.indexOf(data[courses[index]].name) == index))) {
                    maxswitched -= 1;
                }
            } else if (index % 2 == 0 && 
                slots[2*i][1] == -1 &&
                slots[2*i+1][1] == -1 &&
                slots[2*i][3] == -1 &&
                slots[2*i+1][3] == -1) {
                slots[2*i][1] = courses[index];
                slots[2*i+1][1] = courses[index];
                slots[2*i][3] = courses[index];
                slots[2*i+1][3] = courses[index];
                if (!((coursesGiven.indexOf(data[courses[index]].name) == -1) || (coursesGiven.indexOf(data[courses[index]].name) == index))) {
                    maxswitched -= 1;
                }
            }
        } else if (data[courses[index]].modpattern[0] == 'O(C) E(A,C)') {
            if (
                index % 2 == 1 &&
                slots[index-1][2] == -1 &&
                slots[index][0] == -1 &&
                slots[index][2] == -1
            ) {
                slots[index-1][2] = courses[index];
                slots[index][0] = courses[index];
                slots[index][2] = courses[index];
                if (!((coursesGiven.indexOf(data[courses[index]].name) == -1) || (coursesGiven.indexOf(data[courses[index]].name) == index))) {
                    maxswitched -= 1;
                }
            } else if (
                i % 2 == 0 &&
                slots[index][1] == -1 &&
                slots[index][3] == -1 &&
                slots[index+1][1] == -1
            ) {
                slots[index][1] = courses[index];
                slots[index][3] = courses[index];
                slots[index+1][1] = courses[index];
                if (!((coursesGiven.indexOf(data[courses[index]].name) == -1) || (coursesGiven.indexOf(data[courses[index]].name) == index))) {
                    maxswitched -= 1;
                }
            }
        } else if (data[courses[index]].modpattern[0] == 'O(A) E(A)') {
            var i = Math.floor(index / 2);
            if (index % 2 == 1 &&
                slots[2*i][0] == -1 &&
                slots[2*i+1][0] == -1) {
                slots[2*i][0] = courses[index];
                slots[2*i+1][0] = courses[index];
                if (!((coursesGiven.indexOf(data[courses[index]].name) == -1) || (coursesGiven.indexOf(data[courses[index]].name) == index))) {
                    maxswitched -= 1;
                }
            } else if (index % 2 == 0 &&
                slots[2*i][1] == -1 &&
                slots[2*i+1][1] == -1) {
                slots[2*i][1] = courses[index];
                slots[2*i+1][1] = courses[index];
                if (!((coursesGiven.indexOf(data[courses[index]].name) == -1) || (coursesGiven.indexOf(data[courses[index]].name) == index))) {
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
    var out = []
    for (var i = 0; i < courses.length; i++) {
        for (var j = 0; j < data.length; j++) {
            if (data[j].name == courses[i]) {
                out.push(j);
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
    var givens = document.getElementsByClassName("givenclass");
    for (var i = 0; i < givens.length; i++) {
        var c = document.createElement("option");
        c.innerText = "Mod " + (i + 1) + " Class";
        c.value = "";
        givens[i].appendChild(c);
        for (var j = 0; j < data.length; j++) {
            var c = document.createElement("option");
            c.innerText = data[j].name;
            c.value = data[j].name;
            givens[i].appendChild(c);
        }
    }
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
        var prerequisites = [];
        let coursesRequested = [];
        let coursesGiven = [];
        var s = Array.from(document.getElementsByClassName('newclass'));
        for (var i = 0; i < s.length; i++) {
            coursesRequested.push(s[i].value);
        }
        var s = Array.from(document.getElementsByClassName('givenclass'));
        for (var i = 0; i < s.length; i++) {
            coursesGiven.push(s[i].value);
        }
        let courses = name2numbers(data, coursesRequested);
        let flags = [false, false];
        for (var i = 0; i < courses.length; i++) {
            if (data[courses[i]].subject == "Math") {
                flags[0] = true;
            } else if (data[courses[i]].subject == "English") {
                flags[1] = true;
        }
        if (coursesRequested.count("") <= 3 && flags.count(false) == 0) {
            makeTable(data, coursesRequested, coursesGiven, prerequisites);
        }
        if (coursesRequested.count("") > 3) {
            //add more classes
            document.getElementById("errors").innerText += 'You need to add more classes.\n'
        }
        if (flags[0] == false) {
            //you need a math class
            document.getElementById("errors").innerText += 'You need at least one math class per semester.\n'
        }
        if (flags[1] == false) {
            document.getElementById("errors").innerText += 'You need at least one english class per semester.\n'
        }
    })
}

window.onload = async function() {
    onLoad()
    await sleep(500);
    alert("This is the Add/Drop Calculator! With this, you just have to input the classes you were given, and the classes you got, and the site will calculate the best way to try and fit all of them in. You can choose the semester, whether or not to look at full classes, and how many classes you're fine with switching between mods. Please keep in mind that the calculator encodes mods slightly weirdly for any class that has two mods in a row (most science classes, some fine arts classes, some wellness classes, English and History classes like Creative Writing Workshop, Modern Theater, and History of Technology and Culture). For those classes, if the double mod is on a B or D day, it's encoded as mod three, not four. Similarly, if the double mod is on an A or C day, it's encoded as mod four. When entering the classes initially given to you in the Add/Drop calculator or searching them up, make sure to keep this in mind or the site may not provide the desired results.")
};