奇谱发生器（简称KPA），新概念Phigros制谱器，使用TypeScript编写。

Kipphi Apparatus (KPA), A New concept Phigros Chart Editor written in TypeScript.

URL：https://pgrfm.miraheze.org/wiki/%E5%A5%87%E8%B0%B1%E5%8F%91%E7%94%9F%E5%99%A8

# 理念

奇谱发生器主张尽可能少地使用键盘而只需鼠标操作谱面，期望对移动平台有良好的兼容性。同时，奇谱发生器尽可能不增加播放器作者的负担，故其谱面格式引入的所有新概念、特性都可以“编译”到更低级的格式，如RPEJSON。（编译功能尚未加入）

奇谱发生器主张增加复用性，类似于编程中的函数和wikitext中的模板。

奇谱发生器期望编辑事件可以像剪辑视频那样。奇谱发生器中事件通过横向坐标曲线图呈现和编辑，事件不与音符编辑区域对齐。奇谱发生器中编辑的不是事件而是事件节点。事件序列中的所有事件都是连续的（即所有终止节点后都有开始节点，事件序列的最后一个节点是开始节点，以便添加）。

# Concepts

KPA tries to use keyboard less and use mouse more, expecting a good capacity on mobile platforms. Meanwhile, KPA gives work to player authors as little as possible, so all the new concepts and features introduced to its chart format can be "compiled" to a junior format, such as RPEJSON. (Not Added yet)

KPA tries to increase reusability, like functions in programming and templates in wikitext.

KPA expects editing events like editing videos. In KPA, Events are presented and edited in a horizontal coordination graph of curves, not adjusted to Notes' Editing Area. What you edit is EventNodes instead of Events. All the Events in Event Node Sequences are continuous, i. e. each End Node has Start Node after them, and the last Node is Start Node, so that it is easy to append Nodes.

# 使用
访问https://zes-minkey-young.github.io/kpa/html

或者下载本仓库，创建本地服务器运行index.html

# Usage
Visit https://zes-minkey-young.github.io/kpa/html

Or download this repository, create a local server and run index.html

# 开发
本仓库使用TypeScript编写，使用VSCode开发。由于文件之间的类、接口等引用交错复杂，故采用直接编译到一个文件的方式，而不是使用ESModule的方式。欢迎为本项目做出贡献。

# Development
This repository is written in TypeScript and developed in VSCode. Due to the complex interrelationship between files, this repository uses a single file to compile all the files, instead of using ESModule. Welcome to contribute to this project.
