# AutoRun
基于node.js的定时终端命令运行脚本.

![AutoRun](https://user-images.githubusercontent.com/83176414/189032684-2bc414aa-2924-40e3-8752-0410ac5dce1a.png)

使用`Map`键值对结构配置目标时间列表, 查找速度极快. 可自动根据当前时间来选择下一个目标时间, 自定义运行的命令, 可供`Map`键值对与`for...of`循环的学习参考. 

# 使用方法
本脚本为了提高修改目标时间的效率, 使用`config.json`配置脚本的目标时间与命令.
## 配置
在`config.json`配置目标时间, 以下是配置目标时间为`7:20`,`7:45`,`7:50`,`8:00`和`8:30`的示范:
~~~json
"timeList":[
        [7, [20, 45, 50]],
        [8, [0, 30]]
    ],
~~~
在`config.json`配置运行的命令, 以下是配置目标命令为
~~~cmd
mpv main.mp3
~~~
的示范: **请注意转义**
~~~json
"playCmd":"mpv main.mp3"
~~~
在`config.json`配置关闭进程用的命令
~~~json
"processKillCmd":"taskkill /F /IM mpv.com /T"
~~~
不需要的话可以设置为`false`.
~~~json
"processKillCmd":false
~~~
在`config.json`配置等待时间, 单位为毫秒. 以下为设置等待时间为`60000`毫秒(及1分钟)的示范:
~~~json
"timeOut":60000
~~~
等待时间默认为`1000`毫秒(及1秒), 如果小于默认时间则自动归正为`1000`毫秒
## 运行
用node运行autorun.js
~~~cmd
node autorun.js
~~~
大功告成!
# 原理
以下为实现定时执行命令功能的原理
## 目标时间获取原理
通过`for...of`循环遍历每一个`key`.

正常情况下将与当前小时相等的`key`所对应的`value`数组内的元素 与当前分钟比较, 继而选择下一目标时间. 

第二种情况. 如果当前小时相等的`key`所对应的`value`数组内的数字 没有一个比当前分钟大, 则选择下一`key`所对应的`value`数组内的第一个元素.

> 所以, 如果在`config.json`中没有按照顺序设置timeList键值对中用于设置小时的部分, 那么就可能会导致第二种情况发生后目标小时没有被正确选择, 或者目标分钟为`undefined`, 后者可能会导致脚本认为"目标时间均已过"然后结束脚本. 

## 定时原理
~~~
(目标小时 - 当前小时 ) × 60 + (目标分钟 - 当前分钟) = 剩余分钟
~~~
算出剩余时间, 然后每隔一分钟将剩余时间对比一次, 如果剩余时间不大于一就一秒对比一次. 

如果剩余时间对比0为`true`,及剩余时间为0, 就用子进程执行设置的命令. 

为了防止命令结束后马上递归会再次运行让子进程运行命令, 脚本运行完子进程后等待所设置的等待时间后关闭子进程. 
## 更多
可以在源码中声明`run`函数与执行`run`函数的中间设置自定义时间规则. 

星期的变量`day`已经声明好了, 星期日为`0`, 星期一为`1`, 以此类推.

以下为星期五特别时间设置, 星期六停止脚本, 星期天取消小时小于19的时间 的示范:
~~~js
function run() {
    targetTime = getTargetTime();
    main();
};
// ========== 自定义时间规则开始 ==========
if (day == 5) {
    debugConsoleLog("星期五");
    timeList.set(15, [0, 50]);
    timeList.set(16, [0, 40]);
} else if (day == 6) {
    console.log("\033[31m[WARN]\033[0m" + "星期六,停止脚本");
} else if (day == 1) {
    debugConsoleLog("星期日");
    for (let i = 0; i < 19; i++) {
        timeList.delete(i);
    };
};
// ========== 自定义时间规则结束 ==========
run();
~~~
在`config.json`中配置`enabledebug`的值为`true`可以开启调试功能, 会把一些重要逻辑内变量的状态打印出来.

![enabledebug](https://user-images.githubusercontent.com/83176414/189032720-1a96782d-7ab2-44f0-8570-5c3b5738e5ca.png)

# 感言
2022下半年开学时间疫情变严重了, 然后开始了一段网课. 有一次我用虚拟声卡放了一次晚自习铃声, 班主任认为这挺好, 于是想让我去找一个打铃的软件.

结果, 找是找到了.但是免费版只能设置一个打铃时间, 全功能需要付费. 找了半天, 不是无法配合虚拟声卡, 就是全功能需要付费.

于是我想: **干脆写一个吧**.

一开始我用`Python`写了一个运用大量`if`判断目标时间的脚本, 但是设置时间的方法很笨拙, 修改一个目标时间可能需要改大量的`if`条件. 

当时我就想到`JavaScript`的`Map`键值对非常好用, 然后我果断用`node.js`重写脚本, 于是有了`AutoRun`.

# 鸣谢

感谢 某某Laba 不给我免费用, 打个铃也要付费. 他们不给我限制功能我就不会制作`AutoRun`, 多亏了它们我提升了我的编程技能. 

感谢 [rpOne](https://github.com/rpOneawa) 纠正了用`JavaScript`的比较思维 写`Python`脚本的我.

![不可能没看懂, 绝对不可能](https://user-images.githubusercontent.com/83176414/189031562-2a539376-f498-4370-9ff6-0f1b5e4e2629.png)

感觉 [MisaLiu](https://github.com/MisaLiu) 解答了多出教程看不懂的`setTimeOut()`递归知识.

![`setTimeOut()`递归知识](https://user-images.githubusercontent.com/83176414/189031660-2baf39e9-3414-473e-976a-20f64e237ce1.png)
