// 这里是 Wallpaper-for-Classroom-PC 项目的核心逻辑代码
// 如需更改项目配置（如课表、值日表等），请移步 config.js
// *不建议*无开发基础的人员修改本文件内容

// prefixZero - 前导零
// 为 num 添加前导零，使其位数达到 n 位
function prefixZero(num, n){
    return (Array(n).join(0) + num).slice(-n);
}

// getWeekParity - 获取单双周
function getWeekParity(){
    var d = new Date();
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
    var subjectsToday = subjectList[getWeekParity()][getDay(d)];

    if(subjectsToday.length == 0){
        // 无课
        document.getElementById("subject").innerHTML = promptEmptySchedule;
    }else{
        // 还有课
        var nextClass = 0;
        var currentClass = 0;

        // 遍历寻找这一节和下一节
        subjectsToday.forEach((subject, index) => {
            if(subject === null){
                return; // continue
            }

            // 课程时间
            classTime = new Date();
            classTime.setHours((subject[0] / 100));
            classTime.setMinutes(subject[0] % 100);

            // 已经过了上课时间+延迟
            
            if(d.valueOf() >= classTime.valueOf() + promptUpdateDelay * 60 * 1000){
                nextClass = index + 1;
            }
            // 已经过了下课时间
            if(d.valueOf() >= classTime.valueOf() + (subject[2] ? subject[2] : defaultClassDuration) * 60 * 1000){
                currentClass = index + 1;
            }
        });

        while(subjectsToday[nextClass] === null){
            nextClass ++;
        }
        while(subjectsToday[currentClass] === null){
            currentClass ++;
        }
        if(nextClass > subjectsToday.length - 1 || currentClass > subjectsToday.length - 1){
            // 课上完了
            document.getElementById("subject").innerHTML = promptAfterSchool;
            updateSchedule(subjectsToday.length - 1);
        }else{
            // 课没上完
            document.getElementById("subject").innerHTML =
                "下一节 " + subjectsToday[nextClass][1] + " " +
                "<b>" + prefixZero(parseInt(subjectsToday[nextClass][0] / 100), 2) + ":" + prefixZero(subjectsToday[nextClass][0] % 100, 2) +"</b>";
            updateSchedule(currentClass);
        }
    }
    return;
}

// updateSchedule - 更新课表
function updateSchedule(currentClass){
    var items = document.getElementById('schedule').children;
    if(window.CLASS != currentClass){
        // 需要更新
        window.CLASS = currentClass;
        var index = 0;
        for(let element of items){
            if(element.className == 'scheduleSeparator'){
                index ++;
                continue;
            }else if(index == currentClass){
                element.children[1].id = 'currentClass';
            }else if(index != currentClass){
                element.children[1].id = '';
            }
            index ++;
        }
    }

    return;
}

// init - 初始化
function init(){
    var d = new Date();
    window.DATE = d.getDate();
    window.MINUTE = d.getMinutes();
    window.CLASS = -1;
    document.getElementById("schedule").innerHTML = "";

    // 设置课程表
    if(subjectListConsistent){
        subjectList[1] = subjectList[0];
    }
    emojiFilenameCopy = JSON.parse(JSON.stringify(emojiFilename));
    subjectList[getWeekParity()][getDay(d)].forEach((element) => {
        if(element === null){
            // 分隔符
            document.getElementById("schedule").innerHTML += "<div class='scheduleSeparator'></div>";
        }else{
            // 课
            if(emojiEnabled){
                emojiIndex = Math.floor(Math.random() * emojiFilenameCopy.length);
                document.getElementById("schedule").innerHTML += 
                    "<div class='scheduleItem'>" +
                    "<img class='emoji' src='emoji/" + emojiFilenameCopy[emojiIndex] + "' />" +
                    "<span>" + element[1] + "</span></div>";
                emojiFilenameCopy.splice(emojiIndex, 1);
                if(!emojiFilenameCopy.length){
                    emojiFilenameCopy = JSON.parse(JSON.stringify(emojiFilename));
                }
            }else{
                document.getElementById("schedule").innerHTML += 
                    "<div class='scheduleItem'><span></span><span>" + element[1] + "</span></div>";
            }
        }
    });

    // 设置值日表
    if(dutyListConsistent){
        dutyList[1] = dutyList[0];
    }
    document.getElementById("duty").innerHTML = dutyList[getWeekParity()][getDay(d)];

    // 设置公告
    if(announcementRandomOrder){
        announcementList.sort(() => { return Math.random() - 0.5; });
    }
    document.getElementById("announcement").innerHTML = announcementList.join("&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;");
    
    // 设置倒计时
    document.getElementById("countDown").innerHTML =  document.getElementById("countUp").innerHTML =  "";
    countdownList.forEach((element, index) => {
        var interval = Date.parse(element[1]) - d;
        if(interval > 0){
            generateCountDown(index, element[0], parseInt(interval / 86400000 + 1));
        }else if(countdownShowPastDate){
            generateCountUp(index, element[0], Math.abs(parseInt(interval / 86400000 + 1)) + 1);
        }
    });

    updateTime();
    updateSubject(d);
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

init();
window.setInterval("updateTime()", updateInterval);