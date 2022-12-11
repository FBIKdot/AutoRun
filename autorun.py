import json
import os
import time


with open("./config.json", "r", encoding="utf8") as f:
    config = json.load(f)

DEBUG = config["enabledebug"]


def debugConsoleLog(text, text2=None):
    if DEBUG == True:
        print("\033[32m[DEBUG]\033[0m", text, text2 if text2 else "")


debugConsoleLog("ENABLED")
debugConsoleLog("config.json:", config)

timeList = config["timeList"]
playCmd = config["playCmd"]
processKillCmd = config["processKillCmd"]
timeOut = config["timeOut"]/1000
timeOut = 1 if (timeOut < 1 or timeList == None) else timeOut
debugConsoleLog("timeList:", timeList)
debugConsoleLog("timeOut:", timeOut)

nith = False
now = time.localtime()
day = now[6]


def getTargetTime():
    sh = None
    sm = None
    nith = False
    h, m = time.localtime()[3:5]
    breakAll = False
    for key in timeList:
        if key[0] >= h:
            sh = key[0]
            debugConsoleLog("sh =", sh)
            minList = timeList[timeList.index(key)][1]
            debugConsoleLog("minList =", minList)
            for key in minList:
                if m < key or sh - h > 0 or nith == True:
                    sm = key
                    breakAll = True
                    break
            if breakAll == True:
                break
            debugConsoleLog("nith =", True)
            nith = True
    if sm == None:
        print("\033[31m[WARN]\033[0m 目标时间均已过, 脚本停止")
        exit()
    debugConsoleLog(
        f"target: {sh if sh > 9 else 0}{sh}: {sm if sm > 9 else 0}{sm}")
    return f"{sh}:{sm}"


def getleftTime(setTime):
    h, m = time.localtime()[3:5]
    x, y = map(int, setTime.split(":"))
    return 60 * (x - h) + (y - m)


def main():
    sh, sm = map(int, targetTime.split(":"))
    leftTime = getleftTime(targetTime)
    h, m, s = time.localtime()[3:6]
    if leftTime == 0:
        print("时间到, 启动子进程")
        os.system(playCmd)
        print("子进程已结束, 脚本暂停", timeOut, "秒")
        time.sleep(timeOut)
        run()
    else:
        output = "现在是"
        if h < 10:
            output += "0" + str(h) + ":"
        else:
            output += str(h) + ":"
        if m < 10:
            output += "0" + str(m) + ":"
        else:
            output += str(m) + ":"
        if s < 10:
            output += "0" + str(s)
        else:
            output += str(s)
        output += ", 目标"
        output += (str(sh) if sh > 9 else "0" + str(sh)) + \
            ":" + (str(sm)if sm > 9 else "0" + str(sm)) + \
            ", 剩余" + str(leftTime) + "min"
        print(output)
        time.sleep(60 if leftTime > 1 else 1)
        main()


def run():
    global targetTime
    targetTime = getTargetTime()
    main()


run()
