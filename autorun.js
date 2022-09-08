const childProcess = require("child_process");
const process = require("process");
const fs = require("fs");


var configFile = fs.readFileSync("./config.json", "utf8");
var config = JSON.parse(configFile);

const DEBUG = config.enabledebug;
function debugConsoleLog(text, text2) {
    if (DEBUG === true) {
        console.log("\033[32m[DEBUG]\033[0m", text, (text2 == undefined) ? "" : text2);
    };
};
debugConsoleLog("ENABLED");
debugConsoleLog("config.json:", config);

var timeList = new Map(config.timeList);
var playCmd = config.playCmd;
var processKillCmd = config.processKillCmd;
var timeOut = config.timeOut;
timeOut = (Number(timeOut) < 1000 || Object.is(Number(timeOut),NaN)) ? 1000 : Number(timeOut);
debugConsoleLog("timeList:", timeList);
debugConsoleLog("timeOut:", timeOut);


var targetTime;
var nith = false;
let now = new Date();
let day = now.getDay();


function play() {
    childProcess.exec(playCmd, () => {
        console.log("子进程已结束");
    });
};

function again() {
    if (processKillCmd === false) {
        run();
    } else {
        childProcess.exec(processKillCmd, (err) => {
            console.log((err) ? "\033[31m[WARN]\033[0m " + "子进程关闭失败" : "子进程关闭成功");
            run();
        });
    };
};

function getTargetTime() {
    let d, h, m, sh, sm, now = new Date();
    nith = false, d = now.getDay(), h = now.getHours(), m = now.getMinutes();
    chooseSh: for (let key of timeList) {
        if (key[0] >= h) {
            sh = key[0];
            debugConsoleLog("sh =", sh);
            let minList = timeList.get(sh);
            debugConsoleLog("minList =", minList);
            for (let key of minList) {
                if ((m < key || sh - h > 0) || nith == true) {
                    sm = key;
                    break chooseSh;
                };
            };
            debugConsoleLog("nith =", true);
            nith = true;
        };
    };
    debugConsoleLog("sm =", sm);
    if (sm == undefined) {
        console.log("\033[31m[WARN]\033[0m " + "目标时间均已过,脚本停止");
        process.exit();
    };
    debugConsoleLog("target: " + ((sh > 9) ? sh : "0" + sh) + ":" + ((sm > 9) ? sm : "0" + sm));
    return sh + ":" + sm;
};

function getleftTime(setTime) {
    let now = new Date(), h = now.getHours(), m = now.getMinutes();
    let x = setTime.split(":")[0], y = setTime.split(":")[1];
    return 60 * (Number(x) - h) + (Number(y) - m);
}

function main() {
    let sh = targetTime.split(":")[0], sm = targetTime.split(":")[1];
    let leftTime = getleftTime(targetTime);
    let now = new Date(),
        h = now.getHours(),
        m = now.getMinutes(),
        s = now.getSeconds();
    if (leftTime == 0) {
        console.log("时间到, 启动子进程");
        play();
        console.log("子进程启动,脚本暂停", timeOut, "毫秒");
        setTimeout(again, timeOut);
    } else {
        let output = "现在是";
        output += (h < 10) ? "0" + h + ":" : h + ":";
        output += (m < 10) ? "0" + m + ":" : m + ":";
        output += (s < 10) ? "0" + s : s;
        output += ",目标";
        output += ((sh > 9) ? sh : "0" + sh) + ":" + ((sm > 9) ? sm : "0" + sm) + ",剩余" + leftTime + "min";
        console.log(output);
        setTimeout(main, (leftTime > 1) ? 60000 : 1000);
    };
};

function run() {
    targetTime = getTargetTime();
    main();
};

run();