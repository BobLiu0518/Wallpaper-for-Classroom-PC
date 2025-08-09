// 这里是 Wallpaper-for-Classroom-PC 项目的核心逻辑代码
// 如需更改项目配置（如课表、值日表等），请移步 config.js
// *不建议*无开发基础的人员修改本文件内容

// prefixZero - 前导零
function prefixZero(num, n){
    return (Array(n).join(0) + num).slice(-n);
}

// getWeekParity - 获取单双周
function getWeekParity(date = new Date()){
    var d = date;
    var f = new Date(d.getFullYear(), 0, 1);
    var w = Math.ceil((parseInt((d - f) / (24 * 60 * 60 * 1000)) + 1 + f.getDay()) / 7);
    return revWeek ? w % 2 : (w + 1) % 2;
}

// getDay - 获取星期几
function getDay(d){
	return (temporaryDayOfWeek === null) ? d.getDay() : temporaryDayOfWeek;
}

// updateTime - 更新时间
function updateTime(){
    var d = new Date();
    if (d.getMinutes() != window.MINUTE) {
        window.MINUTE = d.getMinutes();
        updateSubject(d);
    }
    document.getElementById("clock").innerHTML =
        "<b>" + prefixZero(d.getHours(), 2) + ":" + prefixZero(d.getMinutes(), 2) +
        (showTimeSeconds ? ("<small><small>:"+ prefixZero(d.getSeconds(), 2) + "</small></small></b>"): "</b>");
    return;
}

// updateSubject - 更新科目
function updateSubject(d){
    const subjectsToday = subjectList[getWeekParity()][getDay(d)];
    const now = d.valueOf();

    if (!subjectsToday || subjectsToday.length === 0) {
        document.getElementById("subject").innerHTML = promptEmptySchedule;
        return;
    }

    let currentClassIndex = -1;
    let nextClassIndex = -1;

    for (let i = subjectsToday.length - 1; i >= 0; i--) {
        const subject = subjectsToday[i];
        if (subject === null) continue;

        const classStartTime = new Date();
        classStartTime.setHours(parseInt(subject[0] / 100));
        classStartTime.setMinutes(subject[0] % 100);
        classStartTime.setSeconds(0, 0);

        if (now >= classStartTime.valueOf()) {
            currentClassIndex = i;
            break; 
        }
    }

    for (let i = 0; i < subjectsToday.length; i++) {
        const subject = subjectsToday[i];
        if (subject === null) continue;

        const classStartTime = new Date();
        classStartTime.setHours(parseInt(subject[0] / 100));
        classStartTime.setMinutes(subject[0] % 100);
        classStartTime.setSeconds(0, 0);
        
        if (classStartTime.valueOf() - (promptUpdateDelay * 60 * 1000) > now) {
            nextClassIndex = i;
            break; 
        }
    }
    
    let lastClass = null;
    let lastClassIndex = -1;
    for(let i = subjectsToday.length - 1; i >= 0; i--) {
        if(subjectsToday[i] !== null) {
            lastClass = subjectsToday[i];
            lastClassIndex = i;
            break;
        }
    }
    
    if (lastClass !== null) {
        const lastClassEndTime = new Date();
        lastClassEndTime.setHours(parseInt(lastClass[0] / 100));
        lastClassEndTime.setMinutes(lastClass[0] % 100);
        const duration = lastClass[2] ? lastClass[2] : defaultClassDuration;
        lastClassEndTime.setMinutes(lastClassEndTime.getMinutes() + duration);

        if (now >= lastClassEndTime.valueOf()) {
            document.getElementById("subject").innerHTML = promptAfterSchool;
            updateSchedule(lastClassIndex);
            return;
        }
    }

    if (nextClassIndex !== -1) {
        const nextSubject = subjectsToday[nextClassIndex];
        document.getElementById("subject").innerHTML =
            "下一节 " + nextSubject[1] + " " +
            "<b>" + prefixZero(parseInt(nextSubject[0] / 100), 2) + ":" + prefixZero(nextSubject[0] % 100, 2) + "</b>";
    } else {
        document.getElementById("subject").innerHTML = promptAfterSchool;
    }

    updateSchedule(currentClassIndex);
}

// updateSchedule - 更新课表
function updateSchedule(currentClass){
    var items = document.getElementById('schedule').children;
    if(window.CLASS !== currentClass){
        window.CLASS = currentClass;
        var classIndexCounter = -1;
        for(let element of items){
            if(element.className.includes('scheduleItem')){
                classIndexCounter++;
                if (classIndexCounter === currentClass) {
                    element.id = 'currentClass';
                } else {
                    element.id = '';
                }
            }
        }
    }
    return;
}

// initTomorrowSchedule - 初始化明日课表
function initTomorrowSchedule() {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    const tomorrowDay = tomorrowDate.getDay();
    const tomorrowWeekParity = getWeekParity(tomorrowDate);

    const subjectsTomorrow = subjectList[tomorrowWeekParity][tomorrowDay];

    const container = document.getElementById("tomorrow-schedule");
    container.innerHTML = "";

    if (!subjectsTomorrow || subjectsTomorrow.length === 0) {
        container.innerHTML = "<div class='scheduleItem'><span>明天没有课哦</span></div>";
        return;
    }
    
    let scheduleHTML = "";
    subjectsTomorrow.forEach((element) => {
        if (element === null) {
            scheduleHTML += "<div class='scheduleSeparator'></div>";
        } else {
            scheduleHTML += `<div class='scheduleItem'><span>${element[1]}</span></div>`;
        }
    });
    
    container.innerHTML = scheduleHTML;
}

// init - 初始化
function init(){
    var d = new Date();
    window.DATE = d.getDate();
    window.MINUTE = d.getMinutes();
    window.CLASS = -1;
    
    document.getElementById("schedule").innerHTML = "";
    document.getElementById("tomorrow-schedule").innerHTML = "";

    if(subjectListConsistent){
        subjectList[1] = subjectList[0];
    }
    let emojiFilenameCopy = JSON.parse(JSON.stringify(emojiFilename));
    let todayScheduleHTML = "";
    subjectList[getWeekParity(d)][getDay(d)].forEach((element) => {
        if(element === null){
            todayScheduleHTML += "<div class='scheduleSeparator'></div>";
        }else{
            let classDiv;
            if(emojiEnabled){
                let emojiIndex = Math.floor(Math.random() * emojiFilenameCopy.length);
                let emoji = emojiFilenameCopy[emojiIndex] || emojiFilename[0];
                classDiv = `<div class='scheduleItem'><img class='emoji' src='emoji/${emoji}' /><span>${element[1]}</span></div>`;
                emojiFilenameCopy.splice(emojiIndex, 1);
                if(!emojiFilenameCopy.length){
                    emojiFilenameCopy = JSON.parse(JSON.stringify(emojiFilename));
                }
            }else{
                classDiv = `<div class='scheduleItem'><span></span><span>${element[1]}</span></div>`;
            }
            todayScheduleHTML += classDiv;
        }
    });
    document.getElementById("schedule").innerHTML = todayScheduleHTML;

    initTomorrowSchedule();

    if(dutyListConsistent){ dutyList[1] = dutyList[0]; }
    document.getElementById("duty").innerHTML = dutyList[getWeekParity(d)][getDay(d)];

    if(announcementRandomOrder){ announcementList.sort(() => { return Math.random() - 0.5; }); }
    const announcementEl = document.getElementById("announcement");
    if (announcementEl) {
        const announcementText = announcementList.join(" • ");
        announcementEl.innerHTML = announcementText;
        const scrollSpeedFactor = 15;
        const textWidth = announcementEl.offsetWidth;
        const containerWidth = document.getElementById("announcement-container").offsetWidth;
        const duration = (textWidth + containerWidth) / (scrollSpeedFactor * 10);
        const minDuration = 10;
        announcementEl.style.animationDuration = Math.max(duration, minDuration) + 's';
    }
    
    document.getElementById("countDown").innerHTML =  document.getElementById("countUp").innerHTML =  "";
    countdownList.forEach((element, index) => {
        if (!element || element.length === 0) return;
        var interval = Date.parse(element[1]) - d;
        if(interval > 0){
            generateCountDown(index, element[0], parseInt(interval / 86400000 + 1));
        }else if(countdownShowPastDate){
            generateCountUp(index, element[0], Math.abs(parseInt(interval / 86400000)));
        }
    });

    updateTime();
    updateSubject(d);

    if (window.innerWidth >= 768) {
        const tomorrowDetails = document.getElementById('tomorrow-schedule-wrapper');
        if (tomorrowDetails) {
            tomorrowDetails.open = true;
        }
    }
    
    return;
}

function generateCountDown(index, name, days){
    document.getElementById("countDown").innerHTML += "<p id='countDown" + index + "'></p>";
    if(countdownAnimation){
        document.getElementById("countDown" + index).innerHTML = "距离<span class='countDownLarge'>" + name  + "</span>还有<span class='countDownLarge'><b>888</b></span>天<br />";
        window.setTimeout(() => {
            window.nextTimeout(index, name, days, days > 88 ? days + 100 : 188);
        }, 500);
    }else{
        document.getElementById("countDown" + index).innerHTML = "距离<span class='countDownLarge'>" + name  + "</span>还有<span class='countDownLarge'><b>" + prefixZero(days, 3) + "</b></span>天<br />";
    }
}

function nextTimeout(index, name, days, now){
    document.getElementById("countDown" + index).innerHTML = "距离<span class='countDownLarge'>" + name  + "</span>还有<span class='countDownLarge'><b>" + prefixZero(now, 3) + "</b></span>天<br />";
    if(now > days){
        window.setTimeout(() => {
            nextTimeout(index, name, days, now - 1);
        }, parseInt(500 / (now - days)) + 2);
    }
}

function generateCountUp(index, name, days){
    document.getElementById("countUp").innerHTML = "<p id='countUp" + index + "'></p>" +  document.getElementById("countUp").innerHTML;
    if(countdownAnimation){
        document.getElementById("countUp" + index).innerHTML = "<span class='countDownLarge'>" + name  + "</span>结束已经<span class='countDownLarge'><b>000</b></span>天<br />";
        window.setTimeout(() => {
            window.nextTimeoutRev(index, name, days, 0);
        }, 500);
    }else{
        document.getElementById("countUp" + index).innerHTML = "<span class='countDownLarge'>" + name  + "</span>结束已经<span class='countDownLarge'><b>" + prefixZero(days, 3) + "</b></span>天<br />";
    }
}

function nextTimeoutRev(index, name, days, now){
    document.getElementById("countUp" + index).innerHTML = "<span class='countDownLarge'>" + name  + "</span>结束已经<span class='countDownLarge'><b>" + prefixZero(now, 3) + "</b></span>天<br />";
    if(now < days){
        window.setTimeout(() => {
            nextTimeoutRev(index, name, days, now + 1);
        }, parseInt(500 / (days - now)) + 2);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    init();
    window.setInterval("updateTime()", updateInterval);
});