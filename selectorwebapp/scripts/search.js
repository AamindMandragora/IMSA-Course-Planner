function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function getData() {
    var response = await fetch('/json/courses.json');
    return response.json();
}

function doubleincludes(s1, s2) {
    if (s1.includes(s2) || s2.includes(s1)) {
        return true;
    }
    let sp1 = s1.split(" ");
    let sp2 = s2.split(" ");
    for (var i in sp1) {
        for (var j in sp2) {
            if (sp1[i].includes(sp2[j]) || sp2[j].includes(sp1[i])) {
                return true;
            }
        }
    }
    return false;
}

async function search(by) {
    const data = await getData();
    let sems = [];
    let mods = [];
    let bylist = by.split(", ")
    let parsed = [];
    for (var b in bylist) {
        if (bylist[b] != '') {
            let used = false;
            if (doubleincludes('fall', bylist[b])) {
                sems.push(0)
                used = true;
            }
            if (doubleincludes('spring', bylist[b])) {
                sems.push(1)
                used = true;
            }
            if (doubleincludes('1', bylist[b])) {
                mods.push(1);
                used = true;
            }
            if (doubleincludes('2', bylist[b])) {
                mods.push(2)
                used = true;
            }
            if (doubleincludes('3', bylist[b])) {
                mods.push(3)
                used = true;
            }
            if (doubleincludes('4', bylist[b])) {
                mods.push(4)
                used = true;
            }
            if (doubleincludes('5', bylist[b])) {
                mods.push(5)
                used = true;
            }
            if (doubleincludes('6', bylist[b])) {
                mods.push(6)
                used = true;
            }
            if (doubleincludes('7', bylist[b])) {
                mods.push(7)
                used = true;
            }
            if (doubleincludes('8', bylist[b])) {
                mods.push(8)
                used = true;
            }
            if (used) {
                parsed.push(bylist[b]);
            } else {
                by = bylist[b];
            }
        }
    }
    if (sems.length == 0) {
        sems = [0, 1]
    }
    if (mods.length == 0) {
        mods = [1, 2, 3, 4, 5, 6, 7, 8];
    }
    if (bylist.length == parsed.length) {
        by = '';
    }
    for (var i = 0; i < data.length; i++) {
        for (var j in sems) {
            for (var k = 0; k < data[i].offerings[sems[j]].length; k++) {
                if (
                    (
                        ((data[i].name).toLowerCase()).includes(by.toLowerCase()) || 
                        doubleincludes((data[i].subject).toLowerCase(), by.toLowerCase()) ||
                        (((data[i].offerings[sems[j]][k][1]).toLowerCase()).includes(by.toLowerCase()))
                    ) && 
                    (
                        mods.includes(parseInt(data[i].offerings[sems[j]][k][2]))
                    )
                ) {
                    let row = document.createElement('tr');
                    let sem = ['Fall', 'Spring'][sems[j]];
                    let open = ['Open', 'Full'];
                    row.innerHTML = `<td>${data[i].name}</td><td>${sem}</td>`
                    for (var l = 0; l < 3; l++) {
                        var cell = document.createElement('td');
                        cell.innerHTML = data[i].offerings[sems[j]][k][l];
                        row.appendChild(cell)
                    }
                    for (var m = 0; m < 2; m++) {
                        for (var n = 0; n < data[i].adddrop[m][sems[j]].length; n++) {
                            if (data[i].adddrop[m][sems[j]][n] == data[i].offerings[sems[j]][k][2]) {
                                var cell = document.createElement('td');
                                if (m == 0) {
                                    cell.innerHTML = 'Open'
                                } else {
                                    cell.innerHTML = 'Closed'
                                }
                                row.appendChild(cell)
                            }
                        }
                    }
                    results.appendChild(row);
                }
            }
        }
    }
}

window.onload = async function (e) {
    let results = document.getElementById("results");
    await sleep(500);
    alert("This is the course searcher! With this, you can type in part of the official name of a course (searching invest will return the MIs but MI will not), the subject, the mod, the semester, and/or the teacher to search for a course that fits the description. (This also pulls from the add/drop list, so many sophomore classes will not be on there) Please separate by commas. A good query might look like 'Fall, 2, Dowling' or 'English, Fall, 6'. Please keep in mind that the calculator encodes mods slightly weirdly for any class that has two mods in a row (most science classes, some fine arts classes, some wellness classes, English and History classes like Creative Writing Workshop, Modern Theater, and History of Technology and Culture). For those classes, if the double mod is on a B or D day, it's encoded as mod three, not four. Similarly, if the double mod is on an A or C day, it's encoded as mod four. When entering the classes initially given to you in the Add/Drop calculator or searching them up, make sure to keep this in mind or the site may not provide the desired results.")
    document.getElementById('submit').addEventListener('click', function() {
        results.innerHTML = `<tr>
                                <th>Name</th>
                                <th>Semester</th>
                                <th>Section</th>
                                <th>Teacher</th>
                                <th>Mods</th>
                                <th>Status</th>
                            </tr>`
        search(document.getElementById('search').value);
    })
    document.addEventListener('keydown', function(e) {
        if (e.code == 'Enter') {
            results.innerHTML = `<tr>
                                <th>Name</th>
                                <th>Semester</th>
                                <th>Section</th>
                                <th>Teacher</th>
                                <th>Mods</th>
                                <th>Status</th>
                            </tr>`
            search(document.getElementById('search').value);
        }
    })
}