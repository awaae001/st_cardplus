# 前言 
[头图](https://gcore.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate@master/doc/title.png) 目前基于正则变量更新的好感度方案，在实际使用上，存在下面的问题：
1. 需要针对 llm 的各种抽风，边缘状态与正则表达式塔塔开。
2. 无法随意隐藏较早楼层，需要在 `<FullVariableUpdate>` 产生后，才能将之前的楼层隐藏，否则会出现变量不一致的问题。
3. 需要持续对所有楼层进行正则处理，有较高的运行时开销。

为了解决这个问题，我开发了另一套脚本，会在每次 llm 生成完消息时，对消息里的变量变更进行扫描，读取里面的变更记录。

这种做法通过代码编写做到了：
1. 引入了一种新的不依赖于Check的变量更新条件描述方法，以及对应的初始值设定方式。
2. 支持根据开局设置变量初始值
3. 要求类似代码的格式输出，避免llm填写错误。
4. 在变量更新时设置回调，编写专有逻辑(在这张角色卡里用于可靠的日期切换，避免llm有时候忘了日期+1)
5. 变量记录不依赖于过往楼层，可以随时隐藏/删除。
6. 可以将整个变量json 传给 llm，让它设计状态栏。在这种严格格式化的场景，往往能取得很好的效果。
7. 支持在全局世界书中使用，只不过不能有重复的 `variable` 世界书条目，会导致内容的重复发送。
一般而言，建议与提示词模板语法一同使用，以获得最好的效果：https://discord.com/channels/1134557553011998840/1336648321963524127
# 安装
与这个工具相关的有一个脚本、两个正则和一个世界书条目，完成下面的步骤即可。

1. 在你自己的角色卡中，新增一个局部脚本，内容为：
```
import 'https://testingcf.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate@master/artifact/bundle.js'
```

如图所示：
https://gcore.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate@master/doc/img.png
点击确认后启用这个脚本即可。

2. 在你的角色卡中，新增一个局部正则`去除变量更新`，内容为：
```
/<UpdateVariable>[\s\S]*?</UpdateVariable>/gm
```
作用范围配置为 `AI输出` 和 `用户输入` ，其他选项配置为 `仅格式显示` `仅格式提示词`。如图所示：
[![img_1.png](img_1.png)](https://gcore.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate@master/doc/img_1.png)

新增另一个局部正则 `对 AI 隐藏状态栏`，内容为：
```
<StatusPlaceHolderImpl/>
```
作用范围配置为 `AI输出`，其他选项配置为 `仅格式提示词`。
额外的，如果要避免流式过程中，显示出变量更新的内容，还可以选择增加下面的正则( <@796962656065028097>  提供)：
```regexp
/<update(?:variable)?>((?!.*<\/update(?:variable)?>).*$|.*<\/update(?:variable)?>)/gsi
```

3. 在你的角色使用的世界书中，新增下面的 `蓝灯 D1` 条目，作用是将变量列表输出给 llm，并说明变量更新的规则:
```ejs
<status_description>//do not output following content
    {{get_message_variable::stat_data}},
</status_description>//do not output content below directly
<Analysis>$(IN ENGLISH$)
    - calculate time passed: ...
    - decide whether dramatic updates are allowed as it's in a special case or the time passed is more than usual: yes or no
    - list every variable in `<status_description>` section before actual variable analysis: ...
    - Analyze whether this variable satisfies its change conditions, do not output reason:...
    - Ignore summary related content when evaluate.
</Analysis>

rule:
description: You should output the update analysis in the end of the next reply
analysis:
    - You must rethink what variables are defined in <self_description> property, and analyze how to update each of them accordingly
    - For counting variables, change it when the corresponding event occur but don't change it any more during the same event
    - When a numerical variable changes, check if it crosses any stage threshold and update to the corresponding stage
    - if dest element is an array, only update and only output the first element, not `[]` block.
    format: |-
    <UpdateVariable>
        <Analysis>
            ${path}: Y/N
            ...
        </Analysis>
        _.set('${path}', ${old}, ${new});//${reason}
    </UpdateVariable>
    example: |-
    <UpdateVariable>
        <Analysis>
            悠纪.好感度: Y
            暮莲.日程.周三.上午: Y
            ...
        </Analysis>
        _.set('悠纪.好感度', 33,35);//愉快的一次讨论，悠纪觉得与你一起是开心的
        _.set('暮莲.日程.周三.上午', "空", "地点：data_center_zone.数据服务器室 行为：检查");//暮莲规划了周三上午的日程
    </UpdateVariable>
```

在配置完上面的内容后，你就完成了安装。可以通过 Sillytavern 的命令行，确定实际发出的内容。
# 使用
下面，将从各个方面的特性，介绍安装了这个工具(后称MVU)之后，应当在角色卡中如何使用它。

## 问题定位

### 检查变量状态
大部分情况下，发生问题时都需要检查 SillyTavern 的命令行，以及当前的变量状态。当前的变量状态可以通过安装插件 `https://github.com/LenAnderson/SillyTavern-Variable-Viewer/` 来显示。然后, 你可以在聊天框输入 /variableviewer 来开关变量查看器。

### 检查更新操作
此外，每次 llm 输出的字符串，也会有专门的段来说明更新的变量，即上面的：
```
    <UpdateVariable>
        <Analysis>
            悠纪.好感度: Y
            暮莲.日程.周三.上午: Y
            ...
        </Analysis>
        _.set('悠纪.好感度', 33,35);//愉快的一次讨论，悠纪觉得与你一起是开心的
        _.set('暮莲.日程.周三.上午', "空", "地点：data_center_zone.数据服务器室 行为：检查");//暮莲规划了周三上午的日程
    </UpdateVariable>
```
可以随时观察输出条目的内容，分析 llm 的更新操作，输出格式是否符合预期。