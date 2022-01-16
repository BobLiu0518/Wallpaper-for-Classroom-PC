function prefixZero(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}

function getParity() {
    var d = new Date();
    var f = new Date(d.getFullYear(), 0, 1);
    var w = Math.ceil((parseInt((d - f) / (24 * 60 * 60 * 1000)) + 1 + f.getDay()) / 7);
    return revWeek ? w % 2 : (w + 1) % 2;
}

function updateTime() {
    var d = new Date();
    if (d.getMinutes != window.MINUTE) {
        window.MINUTE = d.getMinutes();
        updateSubject();
    }
    document.getElementById("clock").innerHTML = prefixZero(d.getHours(), 2) + ":" + prefixZero(d.getMinutes(), 2) + "<small><small>:" + prefixZero(d.getSeconds(), 2) + "</small></small>";
    return;
}

function updateSubject() {
    var d = new Date();
    if (d.getDate() != window.DATE) {
        init();
        return;
    }
    var time = prefixZero(d.getHours(), 2) + prefixZero(d.getMinutes(), 2);
    var subjectsToday = subjectList[getParity()][d.getDay()];

    if (subjectsToday.length == 0 || time >= subjectsToday[subjectsToday.length - 1][0] + 2) {
        document.getElementById("subject").innerHTML = "请值日生做好值日工作";
    } else {
        var nextSubject = subjectsToday[0];
        subjectsToday.forEach(function(element, index) {
            if (time >= element[0] + 2) {
                nextSubject = subjectsToday[index + 1];
            }
        });
        document.getElementById("subject").innerHTML = "下一节 " + nextSubject[1] + " " + prefixZero(parseInt(nextSubject[0] / 100) % 100, 2) + ":" + prefixZero(nextSubject[0] % 100, 2);
    }
    return;
}

function init() {
    var d = new Date();
    window.DATE = d.getDate();
    window.MINUTE = d.getMinutes();
    document.getElementById("schedule").innerHTML = "";
    subjectList[getParity()][d.getDay()].forEach(function(element, index) {
        document.getElementById("schedule").innerHTML += "<br />" + element[1];
    });
    document.getElementById("duty").innerHTML = dutyList[getParity()][d.getDay()];
    updateTime();
    updateSubject();
    return;
}

init();
window.setInterval("updateTime()", 200);
window.setInterval("updateSubject()", 30000);