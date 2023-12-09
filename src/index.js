const connect = (foreNode, lateNode) => {
    foreNode.next = lateNode;
};
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;
const rgb = (r, g, b) => `rgba(${r}, ${g}, ${b})`;
function drawLine(context, startX, startY, endX, endY) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
}
// ParameterListSoLoooongException()
function drawBezierCurve(context, startX, startY, endX, endY, cp1x, cp1y, cp2x, cp2y) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    context.stroke();
}
function on(eventTypes, element, handler) {
    for (let type of eventTypes) {
        element.addEventListener(type, handler);
    }
}
const absVector = (v) => {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
};
const innerProduct = (v1, v2) => {
    return v1[0] * v2[0] + v1[1] * v2[1];
};
// type EndBeats = number;
class JumpArray {
    constructor(head, tail, originalListLength, effectiveBeats, endNextFn, nextFn) {
        this.header = head;
        this.tailer = tail;
        this.effectiveBeats = effectiveBeats;
        this.endNextFn = endNextFn;
        this.nextFn = nextFn;
        const fillMinor = (startTime, endTime) => {
            const minorArray = jumpArray[jumpIndex];
            const currentJumpBeats = jumpIndex * averageBeats;
            const startsFrom = startTime < currentJumpBeats ? 0 : Math.ceil((startTime - currentJumpBeats) / minorBeats);
            const endsBefore = endTime > currentJumpBeats + averageBeats ? MINOR_PARTS : Math.ceil((endTime - currentJumpBeats) / minorBeats);
            for (let minorIndex = startsFrom; minorIndex < endsBefore; minorIndex++) {
                minorArray[minorIndex] = currentNode;
            }
        };
        // const originalListLength = this.listLength
        const listLength = Math.min(originalListLength * 4, MAX_LENGTH);
        const averageBeats = Math.pow(2, Math.ceil(Math.log2(effectiveBeats / listLength)));
        const minorBeats = averageBeats / MINOR_PARTS;
        const exactLength = Math.floor(effectiveBeats / averageBeats) + 1;
        // console.log(originalListLength, effectiveBeats, averageBeats, minorBeats, exactLength)
        const jumpArray = new Array(exactLength);
        let jumpIndex = 0;
        let lastMinorJumpIndex = -1;
        let currentNode = head.next;
        let previousTime = 0;
        for (let i = 0; i < originalListLength; i++) {
            let [endTime, nextNode] = endNextFn(currentNode);
            const currentJumpBeats = jumpIndex * averageBeats;
            while (endTime >= (jumpIndex + 1) * averageBeats) {
                if (lastMinorJumpIndex === jumpIndex) {
                    fillMinor(previousTime, endTime);
                }
                else {
                    jumpArray[jumpIndex] = currentNode;
                }
                jumpIndex++;
            }
            if (endTime > currentJumpBeats) {
                if (lastMinorJumpIndex !== jumpIndex) {
                    jumpArray[jumpIndex] = new Array(MINOR_PARTS);
                    lastMinorJumpIndex = jumpIndex;
                }
                fillMinor(previousTime, endTime);
            }
            currentNode = nextNode;
            previousTime = endTime;
            if (!currentNode) {
                break;
            }
        }
        /*
        if (lastMinorJumpIndex === jumpIndex) {
            fillMinor(TimeCalculator.toBeats(this.tail.time), Infinity)

        } else {
            jumpArray[exactLength - 1] = this.tail;
        }
        */
        // console.log("jumpArray", jumpArray, "index", jumpIndex)
        if (jumpIndex !== exactLength - 1) {
            debugger;
        }
        this.array = jumpArray;
        this.averageBeats = averageBeats;
    }
    getNodeAt(beats) {
        if (beats >= this.effectiveBeats) {
            return this.tailer.previous;
        }
        const jumpAverageBeats = this.averageBeats;
        const jumpPos = Math.floor(beats / jumpAverageBeats);
        const rest = beats - jumpPos * jumpAverageBeats;
        const nextFn = this.nextFn;
        let canBeNodeOrArray = this.array[jumpPos];
        let node = Array.isArray(canBeNodeOrArray)
            ? canBeNodeOrArray[Math.floor(rest / (jumpAverageBeats / MINOR_PARTS))]
            : canBeNodeOrArray;
        // console.log(this, node, jumpPos, beats)
        if (!node) {
            debugger;
        }
        let next;
        // console.log(this)
        while (next = nextFn(node, beats)) {
            node = next;
        }
        // node = node.previous.previous
        // console.log(node, beats)
        /*
        if (beats < TimeCalculator.toBeats(node.time || node.startTime)
        || node.next && TimeCalculator.toBeats(node.next.time) < beats) {
            debugger
        }
        */
        return node;
    }
}
class Settings {
    constructor() {
        let json;
        if (json = localStorage.getItem("settings")) {
            this.cache = JSON.parse(json);
        }
        else {
            this.cache = {
                lineColor: [200, 200, 120],
                playerShowInfo: true
            };
        }
    }
    get(item) {
        return this.cache[item];
    }
    set(item, val) {
        this.cache[item] = val;
        localStorage.setItem("settings", JSON.stringify(this.cache));
    }
}
const NODE_WIDTH = 20;
const NODE_HEIGHT = 10;
class JudgeLinesEditor {
    constructor(editor, element) {
        this.chart = editor.chart;
        this.editor = editor;
        this.element = element;
        this.orphans = [];
        for (let each of this.orphans) {
            this.addJudgeLine(each);
        }
    }
    addJudgeLine(judgeLine) {
    }
}
const eventTypeMap = [
    {
        basis: 0,
        valueGridSpan: 270,
        valueRange: 1350
    },
    {
        basis: 0,
        valueGridSpan: 180,
        valueRange: 900
    },
    {
        basis: 0,
        valueGridSpan: 90,
        valueRange: 720
    },
    {
        basis: -0.5,
        valueGridSpan: 17,
        valueRange: 255
    },
    {
        basis: -0.25,
        valueGridSpan: 2,
        valueRange: 20
    }
];
class EventCurveEditor {
    constructor(type, sequence) {
        const config = eventTypeMap[type];
        this.sequence = sequence;
        this.canvas = document.createElement("canvas");
        this.canvas.width = 400; //this.canvas.parentElement.clientWidth;
        this.canvas.height = 100;
        this.context = this.canvas.getContext("2d");
        this.halfRange = 2;
        this.halfCent = this.halfRange * 100;
        this.valueRange = config.valueRange;
        this.basis = this.canvas.height * config.basis;
        this.valueRatio = this.canvas.height / this.valueRange;
        this.timeRatio = this.canvas.width / 2 / this.halfCent;
        this.timeCentGridSpan = 100;
        this.valueGridSpan = config.valueGridSpan;
        this.timeGridColor = [120, 255, 170];
        this.valueGridColor = [255, 170, 120];
        this.update();
    }
    update() {
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.context.strokeStyle = "#EEE";
        this.context.fillStyle = "#333";
        this.context.lineWidth = 2;
    }
    drawCoordination(beats) {
        const { height, width } = this.canvas;
        const beatCents = beats * 100;
        const { timeCentGridSpan, valueGridSpan, valueRatio, context } = this;
        // const middleValue = Math.round(-this.basis / this.valueRatio)
        const upperEnd = Math.ceil((height / 2 - this.basis) / valueGridSpan / valueRatio) * valueGridSpan;
        const lowerEnd = Math.ceil((-height / 2 - this.basis) / valueGridSpan / valueRatio) * valueGridSpan;
        context.strokeStyle = rgb(...this.valueGridColor);
        context.lineWidth = 1;
        for (let value = lowerEnd; value < upperEnd; value += valueGridSpan) {
            const positionY = value * valueRatio + this.basis;
            drawLine(context, -width / 2, -positionY, width, -positionY);
            context.strokeText(value + "", -width / 2, -positionY);
        }
        context.strokeStyle = rgb(...this.timeGridColor);
        const stopCents = Math.ceil(beats + this.halfRange) * 100;
        const startCents = Math.ceil(beats - this.halfRange) * 100;
        for (let time = startCents; time < stopCents; time += timeCentGridSpan) {
            const positionX = (time - beatCents) * this.timeRatio;
            drawLine(context, positionX, height / 2, positionX, -height / 2);
            context.strokeText(time / 100 + "", positionX, height / 2);
        }
        context.lineWidth = 3;
        drawLine(context, 0, width / 2, 0, -width / 2);
        context.strokeStyle = "#EEE";
    }
    draw(beats) {
        const { height, width } = this.canvas;
        const { timeRatio, valueRatio, basis, context } = this;
        this.context.fillRect(-width / 2, -height / 2, width, height);
        this.drawCoordination(beats);
        const startBeats = beats - this.halfRange;
        const endBeats = beats + this.halfRange;
        let previousEndNode = this.sequence.getNodeAt(startBeats < 0 ? 0 : startBeats).previous || this.sequence.head; // 有点奇怪的操作
        let previousTime = "heading" in previousEndNode ? 0 : TimeCalculator.toBeats(previousEndNode.time);
        while (previousTime < endBeats) {
            const startNode = previousEndNode.next;
            const endNode = startNode.next;
            if ("tailing" in endNode) {
                break;
            }
            const startTime = TimeCalculator.toBeats(startNode.time);
            const endTime = TimeCalculator.toBeats(endNode.time);
            const startValue = startNode.value;
            const endValue = endNode.value;
            const startX = (startTime - beats) * 100 * timeRatio;
            const endX = (endTime - beats) * 100 * timeRatio;
            const startY = startValue * valueRatio + basis;
            const endY = endValue * valueRatio + basis;
            startNode.easing.drawCurve(context, startX, -startY, endX, -endY);
            context.drawImage(NODE_START, startX, -startY - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT);
            context.drawImage(NODE_END, endX - NODE_WIDTH, -endY - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT);
            previousEndNode = endNode;
            previousTime = endTime;
        }
        if ("tailing" in previousEndNode.next.next) {
            const lastStart = previousEndNode.next;
            const startTime = TimeCalculator.toBeats(lastStart.time);
            const startValue = lastStart.value;
            const startX = (startTime - beats) * 100 * timeRatio;
            const startY = startValue * valueRatio + basis;
            drawLine(context, startX, startY, width / 2, startY);
            context.drawImage(NODE_START, startX, -startY - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT);
        }
        /*
        const beatCents = beats * 100
        const stop = beatCents + this.halfCent;
        let b = beatCents - this.halfCent
        if (b < 10) {
            b = 10
        }
        let lastValue = this.sequence.getValueAt((b - 10) / 100)
        for (; b < stop; b+=10) {
            let nowValue = this.sequence.getValueAt(b / 100)
            this.context.beginPath()
            this.context.moveTo((b - 10 - beatCents) * this.timeRatio, lastValue * this.valueRatio + this.basis)
            this.context.lineTo((b - beatCents) * this.timeRatio, nowValue * this.valueRatio + this.basis)
            this.context.stroke()
            debugger
            lastValue = nowValue;
        }
        */
    }
}
class Editor {
    constructor() {
        this.player = new Player(document.getElementById("player"));
        this.progressBar = new ProgressBar(this.player.audio);
        this.fileInput = document.getElementById("fileInput");
        this.musicInput = document.getElementById("musicInput");
        this.backgroundInput = document.getElementById("backgroundInput");
        this.topbarEle = document.getElementById("topbar");
        this.progressBar.appendTo(this.topbarEle);
        this.previewEle = document.getElementById("preview");
        this.eventSequenceEle = document.getElementById("eventSequence");
        this.noteInfoEle = document.getElementById("noteInfo");
        this.lineInfoEle = document.getElementById("lineInfo");
        this.playButton = document.getElementById("playButton");
        this.playButton.addEventListener("click", (event) => {
            if (!this.playing) {
                this.play();
                this.playButton.innerHTML = "暂停";
            }
            else {
                this.player.pause();
                this.playButton.innerHTML = "继续";
            }
        });
        this.fileInput.addEventListener("change", () => {
            const reader = new FileReader();
            reader.readAsText(this.fileInput.files[0]);
            reader.addEventListener("load", () => {
                if (typeof reader.result !== "string") {
                    return;
                }
                let data = JSON.parse(reader.result);
                let chart = Chart.fromRPEJSON(data);
                this.player.chart = chart;
                this.chart = chart;
                this.player.render();
                this.eventCurveEditors = [];
                const eventLayer = chart.judgeLines[0].eventLayers[0];
                for (let type in eventLayer) {
                    const eventCurveEditor = new EventCurveEditor(EventType[type.charAt(0).toUpperCase() + type.slice(1)], eventLayer[type]);
                    this.eventSequenceEle.appendChild(eventCurveEditor.canvas);
                    this.eventCurveEditors.push(eventCurveEditor);
                    eventCurveEditor.draw(0);
                }
                /**
                player.background = new Image();
                player.background.src = "../cmdysjtest.jpg";
                player.audio.src = "../cmdysjtest.mp3"; */
            });
        });
        this.musicInput.addEventListener("change", () => {
            const reader = new FileReader();
            reader.readAsDataURL(this.musicInput.files[0]);
            reader.addEventListener("load", () => {
                this.player.audio.src = reader.result;
            });
        });
        this.backgroundInput.addEventListener("change", () => {
            const reader = new FileReader();
            reader.readAsDataURL(this.backgroundInput.files[0]);
            reader.addEventListener("load", () => {
                this.player.background = new Image();
                this.player.background.src = reader.result;
            });
        });
    }
    update() {
        requestAnimationFrame(() => {
            if (this.playing) {
                this.updateEventSequences();
            }
            console.log("updated");
            this.update();
        });
    }
    updateEventSequences() {
        this.eventCurveEditors.forEach((each) => each.draw(this.player.beats));
    }
    get playing() {
        return this.player.playing;
    }
    play() {
        if (this.playing) {
            return;
        }
        this.player.play();
        this.update();
    }
}
class Note {
    // posPrevious?: Note;
    // posNext?: Note;
    // posPreviousSibling?: Note;
    // posNextSibling: Note;
    constructor(data) {
        this.above = data.above === 1;
        this.alpha = data.alpha;
        this.endTime = data.endTime;
        this.isFake = Boolean(data.isFake);
        this.positionX = data.positionX;
        this.size = data.size;
        this.speed = data.speed;
        this.startTime = data.startTime;
        this.type = data.type;
        this.visibleTime = data.visibleTime;
        this.yOffset = data.yOffset;
        this.previous = null;
        this.next = null;
        this.previousSibling = null;
        this.nextSibling = null;
    }
    static connectSibling(note1, note2) {
        if (note1) {
            note1.nextSibling = note2;
        }
        if (note2) {
            note2.previousSibling = note1;
        }
        if (note1 && note2) {
            note1.double = true;
            note2.double = true;
        }
    }
    static connect(note1, note2) {
        if (note1) {
            note1.next = note2;
        }
        if (note2) {
            note2.previous = note1;
        }
    }
    static insertSibling(note1, inserted, note2) {
        this.connectSibling(note1, inserted);
        this.connectSibling(inserted, note2);
    }
}
class NoteTree {
    // timesWithHolds: number;
    constructor() {
        this.head = {
            heading: true,
            next: null
        };
        this.currentPoint = this.head;
        this.currentBranchPoint = { startTime: [-1, 0, 1] };
        this.tail = {
            tailing: true,
            previous: null
        };
        this.timesWithNotes = 0;
    }
    get effectiveBeats() {
        return TimeCalculator.toBeats(this.tail.previous.endTime);
    }
    initJump() {
        const originalListLength = this.timesWithNotes;
        const effectiveBeats = this.effectiveBeats;
        this.jump = new JumpArray(this.head, this.tail, originalListLength, effectiveBeats, (note) => {
            const nextNote = note.next;
            const endTime = TimeCalculator.toBeats(note.endTime);
            if ("tailing" in nextNote) {
                return [endTime, null];
            }
            return [endTime, nextNote];
        }, (note, beats) => {
            const previous = note.previous;
            const previousTime = "heading" in previous ? 0 : TimeCalculator.toBeats(previous.endTime);
            return previousTime <= beats ? false : note.next; // getNodeAt有guard
        });
    }
    getNoteAt(beats) {
        return this.jump.getNodeAt(beats);
    }
}
var NoteType;
(function (NoteType) {
    NoteType[NoteType["Tap"] = 1] = "Tap";
    NoteType[NoteType["Drag"] = 4] = "Drag";
    NoteType[NoteType["Flick"] = 3] = "Flick";
    NoteType[NoteType["Hold"] = 2] = "Hold";
})(NoteType || (NoteType = {}));
function arrayForIn(arr, expr, guard) {
    let ret = [];
    for (let each of arr) {
        if (!guard || guard && guard(each)) {
            ret.push(expr(each));
        }
    }
    return ret;
}
/**
 * 根据Note的速度存储在不同字段
interface NoteSpeeds {
    [key: number]: Note[]
}

 */
class JudgeLine {
    constructor() {
        //this.notes = [];
        this.eventLayers = [];
        this.children = [];
        this.holdTrees = {};
        this.noteTrees = {};
        // this.noteSpeeds = {};
    }
    static fromRPEJSON(data, templates, timeCalculator) {
        let line = new JudgeLine();
        if (data.notes) {
            const holdTrees = line.holdTrees;
            const noteTrees = line.noteTrees;
            let notes = data.notes;
            notes.sort((n1, n2) => {
                if (TimeCalculator.ne(n1.startTime, n2.startTime)) {
                    return TimeCalculator.gt(n1.startTime, n2.startTime) ? 1 : -1;
                }
                return TimeCalculator.gt(n1.endTime, n2.endTime) ? 1 : -1;
            });
            const len = notes.length;
            for (let i = 0; i < len; i++) {
                const note = new Note(notes[i]);
                if (note.type === NoteType.Hold) {
                    const speed = note.speed;
                    const tree = speed in holdTrees ? holdTrees[speed] : (holdTrees[speed] = new NoteTree());
                    const lastHold = tree.currentBranchPoint;
                    const lastHoldTime = lastHold.startTime;
                    if (TimeCalculator.eq(lastHoldTime, note.startTime)) {
                        Note.connectSibling(lastHold, note);
                        tree.currentBranchPoint = note;
                    }
                    else {
                        Note.connect(tree.currentPoint, note);
                        tree.currentPoint = note;
                        tree.currentBranchPoint = note;
                    }
                    tree.timesWithNotes++;
                }
                else {
                    const speed = note.speed;
                    const tree = speed in noteTrees ? noteTrees[speed] : (noteTrees[speed] = new NoteTree());
                    const lastNote = tree.currentBranchPoint;
                    const lastNoteTime = lastNote.startTime;
                    if (TimeCalculator.eq(lastNoteTime, note.startTime)) {
                        Note.connectSibling(lastNote, note);
                        tree.currentBranchPoint = note;
                    }
                    else {
                        Note.connect(tree.currentPoint, note);
                        tree.currentPoint = note;
                        tree.currentBranchPoint = note;
                        tree.timesWithNotes++;
                    }
                }
            }
            for (let trees of [holdTrees, noteTrees]) {
                for (let speed in trees) {
                    const tree = trees[speed];
                    Note.connect(tree.currentPoint, tree.tail);
                    tree.initJump();
                }
            }
        }
        const eventLayers = data.eventLayers;
        const length = eventLayers.length;
        for (let index = 0; index < length; index++) {
            const layerData = eventLayers[index];
            const layer = {
                moveX: EventNodeSequence.fromRPEJSON(EventType.MoveX, layerData.moveXEvents, templates, undefined),
                moveY: EventNodeSequence.fromRPEJSON(EventType.MoveY, layerData.moveYEvents, templates, undefined),
                rotate: EventNodeSequence.fromRPEJSON(EventType.Rotate, layerData.rotateEvents, templates, undefined),
                alpha: EventNodeSequence.fromRPEJSON(EventType.Alpha, layerData.alphaEvents, templates, undefined),
                speed: EventNodeSequence.fromRPEJSON(EventType.Speed, layerData.speedEvents, templates, timeCalculator)
            };
            line.eventLayers[index] = layer;
            for (let each in layerData) {
                let type = each.slice(-6); // 去掉后面的“Event”
                line.eventLayers[index][type];
            }
        }
        // line.updateNoteSpeeds();
        // line.computeNotePositionY(timeCalculator);
        return line;
    }
    updateSpeedIntegralFrom(beats, timeCalculator) {
        for (let eventLayer of this.eventLayers) {
            eventLayer.speed.updateNodesIntegralFrom(beats, timeCalculator);
        }
    }
    computeTimeRange(beats, timeCalculator, startY, endY) {
        return [[0, Infinity]];
        /*
        let times: number[] = [];
        let result: [number, number][] = [];
        for (let eventLayer of this.eventLayers) {
            const sequence = eventLayer.speed;
            let node: EventStartNode | Tailer<EventStartNode> = sequence.getNodeAt(beats);
            let endNode: EventEndNode | Tailer<EventStartNode>
            while (true) {
                times.push(TimeCalculator.toBeats(node.time))
                if ("tailing" in (endNode = node.next)) {
                    break;
                }

                node = endNode.next
            }
        }
        times = [...new Set(times)].sort((a, b) => a - b)
        const len = times.length;
        let nextTime = times[0]
        let nextPosY = this.getStackedIntegral(nextTime, timeCalculator)
        let nextSpeed = this.getStackedValue("speed", nextTime - 1e-6)
        let range: [number, number] = [undefined, undefined];
        const computeTime = (speed: number, current: number, fore: number) => timeCalculator.secondsToBeats(current / (speed * 120) + timeCalculator.toSeconds(fore));
        for (let i = 0; i < len - 1;) {
            const thisTime = nextTime;
            const thisPosY = nextPosY;
            const thisSpeed = nextSpeed;
            nextTime = times[i + 1]
            nextPosY = this.getStackedIntegral(nextTime, timeCalculator);
            nextSpeed = this.getStackedValue("speed", nextTime - 1e-6)
            if (thisSpeed * nextSpeed < 0) { // 有变号零点，再次切断，保证处理的每个区间单调性
                nextTime = (nextTime - thisTime) * (0 - thisSpeed) / (nextSpeed - thisSpeed) + thisTime;
                nextSpeed = 0
                nextPosY = this.getStackedIntegral(nextTime, timeCalculator)
            } else {
                i++
            }
            if (range[0] === undefined) {
                // 变速区间直接全部囊括，匀速要算一下，因为好算
                if (thisPosY < startY && startY <= nextPosY || thisPosY >= endY && endY > nextPosY) {
                    range[0] = thisSpeed !== nextSpeed ? thisTime : computeTime(
                        thisSpeed,
                        (thisPosY < nextPosY ? startY : endY) - thisPosY, thisTime)
                } else if (startY < thisPosY && thisPosY <= endY) {
                    range[0] = thisTime;
                }
            }
            // 要注意这里不能合成双分支if因为想要的Y片段可能在一个区间内
            if (range[0] !== undefined) {
                if (thisPosY < endY && endY <= nextPosY || thisPosY >= startY && startY > nextPosY) {
                    range[1] = thisSpeed !== nextSpeed ? nextTime : computeTime(
                        thisSpeed,
                        (thisPosY > nextPosY ? startY : endY) - thisPosY, thisTime)
                    if (range[0] > range[1]){
                        debugger
                    }
                    result.push(range)
                    range = [undefined, undefined];
                }
            }
        }
        const thisPosY = nextPosY;
        const thisTime = nextTime;
        const thisSpeed = nextSpeed;
        const inf = thisSpeed > 0 ? Infinity : (thisSpeed < 0 ? -Infinity : thisPosY)
        if (range[0] === undefined) {
            // 变速区间直接全部囊括，匀速要算一下，因为好算
            if (thisPosY < startY && startY <= inf || thisPosY >= endY && endY > inf) {
                range[0] = computeTime(
                    thisSpeed,
                    (thisPosY < inf ? startY : endY) - thisPosY,
                    thisTime)
            } else if (thisSpeed === 0) {
                range[0] = 0;
            }
        }
        // 要注意这里不能合成双分支if因为想要的Y片段可能在一个区间内
        if (range[0] !== undefined) {
            if (thisPosY < endY && endY <= inf || thisPosY >= startY && startY > inf) {
                range[1] = computeTime(
                    thisSpeed,
                    (thisPosY > inf ? startY : endY) - thisPosY,
                    thisTime)
                result.push(range)
            } else if (thisSpeed === 0) {
                range[1] = Infinity;
                result.push(range)
            }
        }
        return result;
        */
    }
    /*
    computeLinePositionY(beats: number, timeCalculator: TimeCalculator)  {
        return this.getStackedIntegral(beats, timeCalculator)
    }
    */
    getStackedValue(type, beats) {
        const length = this.eventLayers.length;
        let current = 0;
        for (let index = 0; index < length; index++) {
            const layer = this.eventLayers[index];
            if (!layer) {
                break;
            }
            current += layer[type].getValueAt(beats);
        }
        return current;
    }
    getStackedIntegral(beats, timeCalculator) {
        const length = this.eventLayers.length;
        let current = 0;
        for (let index = 0; index < length; index++) {
            const layer = this.eventLayers[index];
            if (!layer) {
                break;
            }
            current += layer.speed.getIntegral(beats, timeCalculator);
        }
        // console.log("integral", current)
        return current;
    }
}
class Chart {
    constructor() {
        this.timeCalculator = new TimeCalculator();
        this.judgeLines = [];
        this.orphanLines = [];
        this.templateEasingLib = new TemplateEasingLib();
    }
    static fromRPEJSON(data) {
        let chart = new Chart();
        chart.bpmList = data.BPMList;
        chart.updateCalculator();
        if (data.envEasings) {
            chart.templateEasingLib.add(...data.envEasings);
        }
        // let line = data.judgeLineList[0];
        const length = data.judgeLineList.length;
        const orphanLines = [];
        for (let i = 0; i < length; i++) {
            const lineData = data.judgeLineList[i];
            if (lineData.father === -1) {
                orphanLines.push(lineData);
                continue;
            }
            const father = data.judgeLineList[lineData.father];
            const children = father.children || (father.children = []);
            children.push(i);
        }
        const readOne = (lineData) => {
            const line = JudgeLine.fromRPEJSON(lineData, chart.templateEasingLib, chart.timeCalculator);
            chart.judgeLines.push(line);
            if (lineData.children) {
                for (let each of lineData.children) {
                    const child = readOne(data.judgeLineList[each]);
                    child.father = line;
                    line.children.push(child);
                }
            }
            return line;
        };
        for (let lineData of data.judgeLineList) {
            const line = readOne(lineData);
            chart.orphanLines.push(line);
        }
        return chart;
    }
    updateCalculator() {
        this.timeCalculator.bpmList = this.bpmList;
        this.timeCalculator.update();
    }
}
const easeOutElastic = (x) => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
        ? 0
        : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
};
const easeOutBounce = (x) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (x < 1 / d1) {
        return n1 * x * x;
    }
    else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    }
    else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    }
    else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
};
const easeOutExpo = (x) => {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};
const easeOutBack = (x) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const linear = (x) => x;
const linearLine = (context, startX, startY, endX, endY) => drawLine(context, startX, startY, endX, endY);
const easeOutSine = (x) => Math.sin((x * Math.PI) / 2);
const easeInQuad = (x) => Math.pow(x, 2);
const easeInCubic = (x) => Math.pow(x, 3);
const easeInQuart = (x) => Math.pow(x, 4);
const easeInQuint = (x) => Math.pow(x, 5);
const easeInCirc = (x) => 1 - Math.sqrt(1 - Math.pow(x, 2));
function mirror(easeOut) {
    return (x) => 1 - easeOut(1 - x);
}
function toEaseInOut(easeIn, easeOut) {
    return (x) => x < 0.5 ? easeIn(2 * x) / 2 : (1 + easeOut(2 * x - 1)) / 2;
}
const easeOutQuad = mirror(easeInQuad);
const easeInSine = mirror(easeOutSine);
const easeOutQuart = mirror(easeInQuart);
const easeOutCubic = mirror(easeInCubic);
const easeOutQuint = mirror(easeInQuint);
const easeOutCirc = mirror(easeInCirc);
const easeInExpo = mirror(easeOutExpo);
const easeInElastic = mirror(easeOutElastic);
const easeInBounce = mirror(easeOutBounce);
const easeInBack = mirror(easeOutBack);
const easeInOutSine = toEaseInOut(easeInSine, easeOutSine);
const easeInOutQuad = toEaseInOut(easeInQuad, easeOutQuad);
const easeInOutCubic = toEaseInOut(easeInCubic, easeOutCubic);
const easeInOutQuart = toEaseInOut(easeInQuart, easeOutQuart);
const easeInOutQuint = toEaseInOut(easeInQuint, easeOutQuint);
const easeInOutExpo = toEaseInOut(easeInExpo, easeOutExpo);
const easeInOutCirc = toEaseInOut(easeInCirc, easeOutCirc);
const easeInOutBack = toEaseInOut(easeInBack, easeOutBack);
const easeInOutElastic = toEaseInOut(easeInElastic, easeOutElastic);
const easeInOutBounce = toEaseInOut(easeInBounce, easeOutBounce);
const easingFnMap = {
    "linear": [linear, linear, linear],
    "sine": [easeInSine, easeOutSine, toEaseInOut(easeInSine, easeOutSine)],
    "quad": [easeInQuad, easeOutQuad, toEaseInOut(easeInQuad, easeOutQuad)],
    "cubic": [easeInCubic, easeOutCubic, toEaseInOut(easeInCubic, easeOutCubic)],
    "quart": [easeInQuart, easeOutQuart, toEaseInOut(easeInQuart, easeOutQuart)],
    "quint": [easeInQuint, easeOutQuint, toEaseInOut(easeInQuint, easeOutQuint)],
    "expo": [easeInExpo, easeOutExpo, toEaseInOut(easeInExpo, easeOutExpo)],
    "circ": [easeInCirc, easeOutCirc, toEaseInOut(easeInCirc, easeOutCirc)],
    "back": [easeInBack, easeOutBack, toEaseInOut(easeInBack, easeOutBack)],
    "elastic": [easeInElastic, easeOutElastic, toEaseInOut(easeInElastic, easeOutElastic)],
    "bounce": [easeInBounce, easeOutBounce, toEaseInOut(easeInBounce, easeOutBounce)]
};
class Easing {
    constructor() {
    }
    drawCurve(context, startX, startY, endX, endY) {
        const delta = endY - startY;
        const timeDelta = endX - startX;
        let last = startY;
        for (let t = 1; t <= timeDelta; t++) {
            const ratio = t / timeDelta;
            const curPosY = this.getValue(ratio) * delta + startY;
            drawLine(context, startX + t - 1, last, startX + t, curPosY);
            last = curPosY;
        }
    }
}
class NormalEasing extends Easing {
    constructor(fn, curveDrawer) {
        super();
        this._getValue = fn;
        if (curveDrawer) {
            this._drawCurve = curveDrawer;
        }
    }
    getValue(t) {
        if (t > 1 || t < 0) {
            console.warn("缓动超出定义域！");
            // debugger;
        }
        // console.log("t:", t, "rat", this._getValue(t))
        return this._getValue(t);
    }
    drawCurve(context, startX, startY, endX, endY) {
        if (this._drawCurve) {
            this._drawCurve(context, startX, startY, endX, endY);
        }
        else {
            super.drawCurve(context, startX, startY, endX, endY);
        }
    }
}
class BezierEasing extends Easing {
    constructor() {
        super();
    }
    getValue(t) {
        // 问MDN AI Help搞的（
        // 使用贝塞尔曲线公式计算纵坐标
        // 具体计算方法可以参考数学相关的贝塞尔曲线公式
        // 这里只是一个示例，具体实现需要根据实际情况进行调整
        const startX = 0;
        const startY = 0;
        const endX = 1;
        const endY = 1;
        const para = (t - startX) / (endX - startX);
        const y = Math.pow((1 - para), 3) * startY + 3 * Math.pow((1 - para), 2) * para * this.cp1.y + 3 * (1 - para) * Math.pow(para, 2) * this.cp2.y + Math.pow(para, 3) * endY;
        return y;
    }
    drawCurve(context, startX, startY, endX, endY) {
        const { x: cp1x, y: cp1y } = this.cp1;
        const { x: cp2x, y: cp2y } = this.cp2;
        const delta = endY - startY;
        const timeDelta = endX - startX;
        drawBezierCurve(context, startX, startY, endX, endY, startX + cp1x * timeDelta, startY + cp1y * delta, endX + cp2x * timeDelta, endY + cp2y * delta);
    }
}
class TemplateEasing extends Easing {
    constructor(nodes) {
        super();
        this.eventNodeSequence = nodes;
    }
    getValue(t) {
        let seq = this.eventNodeSequence;
        let delta = this.valueDelta;
        let frac = seq.getValueAt(t * this.eventNodeSequence.effectiveBeats);
        return delta === 0 ? frac : frac / delta;
    }
    get valueDelta() {
        let seq = this.eventNodeSequence;
        return seq.tail.previous.value - seq.head.next.value;
    }
}
class ParametricEquationEasing extends Easing {
    constructor(equation) {
        super();
        // @ts-ignore
        this._getValue = new Function("t", equation);
    }
    getValue(t) {
        return this._getValue(t);
    }
}
class TemplateEasingLib {
    constructor() {
        this.easings = {};
    }
    add(...customEasingData) {
        const easings = {};
        for (let each of customEasingData) {
            easings[each.name] = each;
        }
        for (let each of customEasingData) {
            if (each.dependencies.length !== 0) {
                for (let dependency of each.dependencies) {
                    if (easings[dependency].usedBy.includes(each.name)) {
                        continue;
                    }
                    easings[dependency].usedBy.push(each.name);
                }
            }
        }
        for (let each of customEasingData) {
            this.addOne(each, easings);
        }
    }
    addOne(customEasingData, mayDepend) {
        if (customEasingData.dependencies.length !== 0) {
            return;
        }
        this.easings[customEasingData.name] = new TemplateEasing(EventNodeSequence.fromRPEJSON(EventType.Easing, customEasingData.content, this, undefined));
        if (customEasingData.usedBy) {
            for (let name of customEasingData.usedBy) {
                const dependencies = mayDepend[name].dependencies;
                dependencies.splice(dependencies.indexOf(customEasingData.name));
                if (dependencies.length === 0) {
                    this.addOne(mayDepend[name], mayDepend);
                }
            }
        }
    }
    /**
     * 有顺序不用考虑依赖处理
     * @param customEasingData
     */
    addOrdered(customEasingData) {
        for (let each of customEasingData) {
            this.easings[each.name] = new TemplateEasing(EventNodeSequence.fromRPEJSON(EventType.Easing, each.content, this, undefined));
        }
    }
    get(key) {
        return this.easings[key];
    }
}
const linearEasing = new NormalEasing(linear, linearLine);
const fixedEasing = new NormalEasing((x) => (x === 1 ? 1 : 0));
const easingMap = {
    "linear": { out: linearEasing, in: linearEasing, inout: linearEasing },
    "sine": { in: new NormalEasing(easeInSine), out: new NormalEasing(easeOutSine), inout: new NormalEasing(easeInOutSine) },
    "quad": { in: new NormalEasing(easeInQuad), out: new NormalEasing(easeOutQuad), inout: new NormalEasing(easeInOutQuad) },
    "cubic": { in: new NormalEasing(easeInCubic), out: new NormalEasing(easeOutCubic), inout: new NormalEasing(easeInOutCubic) },
    "quart": { in: new NormalEasing(easeInQuart), out: new NormalEasing(easeOutQuart), inout: new NormalEasing(easeInOutQuart) },
    "quint": { in: new NormalEasing(easeInQuint), out: new NormalEasing(easeOutQuint), inout: new NormalEasing(easeInOutQuint) },
    "expo": { in: new NormalEasing(easeInExpo), out: new NormalEasing(easeOutExpo), inout: new NormalEasing(easeInOutExpo) },
    "circ": { in: new NormalEasing(easeInCirc), out: new NormalEasing(easeOutCirc), inout: new NormalEasing(easeInOutCirc) },
    "back": { in: new NormalEasing(easeInBack), out: new NormalEasing(easeOutBack), inout: new NormalEasing(easeInOutBack) },
    "elastic": { in: new NormalEasing(easeInElastic), out: new NormalEasing(easeOutElastic), inout: new NormalEasing(easeInOutElastic) },
    "bounce": { in: new NormalEasing(easeInBounce), out: new NormalEasing(easeOutBounce), inout: new NormalEasing(easeInOutBounce) }
};
const easingArray = [
    fixedEasing,
    linearEasing,
    easingMap.sine.out,
    easingMap.sine.in,
    easingMap.sine.inout,
    easingMap.quad.out,
    easingMap.quad.in,
    easingMap.quad.inout,
    easingMap.cubic.out,
    easingMap.cubic.in,
    easingMap.cubic.inout,
    easingMap.quart.out,
    easingMap.quart.in,
    easingMap.quart.inout,
    easingMap.quint.out,
    easingMap.quint.in,
    easingMap.quint.inout,
    easingMap.circ.out,
    easingMap.circ.in,
    easingMap.circ.inout,
    easingMap.expo.out,
    easingMap.expo.in,
    easingMap.expo.inout,
    easingMap.back.out,
    easingMap.back.in,
    easingMap.back.inout,
    easingMap.elastic.out,
    easingMap.elastic.in,
    easingMap.elastic.inout,
    easingMap.bounce.out,
    easingMap.bounce.in,
    easingMap.bounce.inout
];
const rpeEasingArray = [
    null,
    linearEasing,
    easingMap.sine.out,
    easingMap.sine.in,
    easingMap.quad.out,
    easingMap.quad.in,
    easingMap.sine.inout,
    easingMap.quad.inout,
    easingMap.cubic.out,
    easingMap.cubic.in,
    easingMap.quart.out,
    easingMap.quart.in,
    easingMap.cubic.inout,
    easingMap.quart.inout,
    easingMap.quint.out,
    easingMap.quint.in,
    // easingMap.quint.inout,
    easingMap.expo.out,
    easingMap.expo.in,
    // easingMap.expo.inout,
    easingMap.circ.out,
    easingMap.circ.in,
    easingMap.back.out,
    easingMap.back.in,
    easingMap.circ.inout,
    easingMap.back.inout,
    easingMap.elastic.out,
    easingMap.elastic.in,
    easingMap.bounce.out,
    easingMap.bounce.in,
    easingMap.bounce.inout,
    easingMap.elastic.inout // 29
];
// interface TemplateEasingLib {[name: string]: TemplateEasing}
const MAX_LENGTH = 1024;
const MINOR_PARTS = 16;
function arrEq(arr1, arr2) {
    let length;
    if ((length = arr1.length) !== arr2.length) {
        return false;
    }
    for (let i = 0; i < length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}
class EventNode {
    constructor(time, value) {
        this.time = time;
        this.value = value;
        this.previous = null;
        this.next = null;
        this.ratio = 1;
        this.easing = linearEasing;
    }
    static fromEvent(data, templates) {
        let start = new EventStartNode(data.startTime, data.start);
        let end = new EventEndNode(data.endTime, data.end);
        EventNode.connect(start, end);
        if (data.bezier) {
            let bp = data.bezierPoints;
            let easing = new BezierEasing();
            easing.cp1 = { x: bp[0], y: bp[1] };
            easing.cp2 = { x: bp[2], y: bp[3] };
            start.easing = easing;
        }
        else if (typeof data.easingType === "string") {
            start.easing = templates.get(data.easingType);
        }
        else if (typeof data.easingType === "number" && data.easingType !== 0) {
            start.easing = rpeEasingArray[data.easingType];
        }
        else if (start.value === end.value) {
            start.easing = fixedEasing;
        }
        else {
            start.easing = linearEasing;
        }
        if (!start.easing)
            debugger;
        return [start, end];
    }
    // static connect(node1: EventStartNode, node2: EventEndNode): void
    static connect(node1, node2) {
        node1.next = node2;
        node2.previous = node1;
    }
}
class EventStartNode extends EventNode {
    constructor(time, value) {
        super(time, value);
    }
    getValueAt(beats) {
        // 除了尾部的开始节点，其他都有下个节点
        // 钩定型缓动也有
        if ("tailing" in this.next) {
            return this.value;
        }
        let timeDelta = TimeCalculator.getDelta(this.next.time, this.time);
        let current = beats - TimeCalculator.toBeats(this.time);
        if (current > timeDelta || current < 0) {
            console.warn("超过事件时间范围！", this, beats);
        }
        // 参数方程型缓动无需指定首尾数值
        if (this.easing instanceof ParametricEquationEasing) {
            return this.easing.getValue(current / timeDelta);
        }
        let valueDelta = this.next.value - this.value;
        // 钩定模板缓动用ratio表示倍率
        if (valueDelta === 0 && this.easing instanceof TemplateEasing) {
            return this.value + this.easing.getValue(current / timeDelta) * this.ratio;
        }
        if (!this.easing) {
            debugger;
        }
        // 其他类型，包括普通缓动和非钩定模板缓动
        return this.value + this.easing.getValue(current / timeDelta) * valueDelta;
    }
    getSpeedValueAt(beats) {
        if ("tailing" in this.next) {
            return this.value;
        }
        let timeDelta = TimeCalculator.getDelta(this.next.time, this.time);
        let valueDelta = this.next.value - this.value;
        let current = beats - TimeCalculator.toBeats(this.time);
        if (current > timeDelta || current < 0) {
            console.warn("超过事件时间范围！", this, beats);
            // debugger
        }
        return this.value + linearEasing.getValue(current / timeDelta) * valueDelta;
    }
    /**
     * 积分获取位移
     */
    getIntegral(beats, timeCalculator) {
        return timeCalculator.segmentToSeconds(TimeCalculator.toBeats(this.time), beats) * (this.value + this.getSpeedValueAt(beats)) / 2 * 120; // 每单位120px
    }
    getFullIntegral(timeCalculator) {
        if ("tailing" in this.next) {
            console.log(this);
            throw new Error("getFullIntegral不可用于尾部节点");
        }
        let end = this.next;
        let endBeats = TimeCalculator.toBeats(end.time);
        let startBeats = TimeCalculator.toBeats(this.time);
        // 原来这里写反了，气死偶咧！
        return timeCalculator.segmentToSeconds(startBeats, endBeats) * (this.value + end.value) / 2 * 120;
    }
}
class EventEndNode extends EventNode {
    constructor(time, value) {
        super(time, value);
    }
    getValueAt(beats) {
        return this.previous.getValueAt(beats);
    }
}
var EventType;
(function (EventType) {
    EventType[EventType["MoveX"] = 0] = "MoveX";
    EventType[EventType["MoveY"] = 1] = "MoveY";
    EventType[EventType["Rotate"] = 2] = "Rotate";
    EventType[EventType["Alpha"] = 3] = "Alpha";
    EventType[EventType["Speed"] = 4] = "Speed";
    EventType[EventType["Easing"] = 5] = "Easing";
})(EventType || (EventType = {}));
/**
 * 为一个链表结构。会有一个数组进行快跳。
 */
class EventNodeSequence {
    // nodes: EventNode[];
    // startNodes: EventStartNode[];
    // endNodes: EventEndNode[];
    // eventTime: Float64Array;
    constructor(type) {
        this.type = type;
        this.head = {
            heading: true,
            next: null
        };
        this.tail = {
            tailing: true,
            previous: null
        };
        // this.head = this.tail = new EventStartNode([0, 0, 0], 0)
        // this.nodes = [];
        // this.startNodes = [];
        // this.endNodes = [];
    }
    static fromRPEJSON(type, data, templates, timeCalculator) {
        const length = data.length;
        // const isSpeed = type === EventType.Speed;
        // console.log(isSpeed)
        const seq = new EventNodeSequence(type);
        let listLength = length;
        let lastEnd = seq.head;
        let lastIntegral = 0;
        for (let index = 0; index < length; index++) {
            const event = data[index];
            let [start, end] = EventNode.fromEvent(event, templates);
            if ("heading" in lastEnd) {
                EventNode.connect(lastEnd, start);
            }
            else if (lastEnd.value === lastEnd.previous.value && lastEnd.previous.easing instanceof NormalEasing) {
                lastEnd.time = start.time;
                EventNode.connect(lastEnd, start);
            }
            else if (TimeCalculator.toBeats(lastEnd.time) !== TimeCalculator.toBeats(start.time)) {
                let val = lastEnd.value;
                let midStart = new EventStartNode(lastEnd.time, val);
                let midEnd = new EventEndNode(start.time, val);
                midStart.easing = lastEnd.previous.easing;
                EventNode.connect(lastEnd, midStart);
                EventNode.connect(midStart, midEnd);
                EventNode.connect(midEnd, start);
                // seq.startNodes.push(midStart);
                // seq.endNodes.push(midEnd);
                listLength++;
            }
            else {
                EventNode.connect(lastEnd, start);
            }
            // seq.startNodes.push(start);
            // seq.endNodes.push(end);
            lastEnd = end;
            // seq.nodes.push(start, end);
        }
        // let last = seq.endNodes[length - 1];
        // let last = seq.endNodes[seq.endNodes.length - 1];
        const last = lastEnd;
        let tail;
        if ("heading" in last) {
            debugger; // 这里事件层级里面一定有至少一个事件
            throw new Error();
        }
        tail = new EventStartNode(last.time, last.value);
        EventNode.connect(last, tail);
        tail.easing = last.previous.easing;
        tail.cachedIntegral = lastIntegral;
        EventNode.connect(tail, seq.tail);
        seq.listLength = listLength;
        // seq.startNodes.push(tail);
        // seq.update();
        // seq.validate();
        seq.initJump();
        return seq;
    }
    /** validate() {
        /*
         * 奇谱发生器中事件都是首尾相连的
         //
        const length = this.endNodes.length;
        for (let index = 0; index < length; index++) {
            let end = this.endNodes[index];
            let start = this.startNodes[index + 1]
            if (!arrEq(end.time, start.time)) {
                start.time = end.time
            }
            start.previous = end;
            end.next = start;
            // 这个就是真的该这么写了（
        }
    }
    **/
    /** 有效浮点拍数：最后一个结束节点的时间 */
    get effectiveBeats() {
        return TimeCalculator.toBeats(this.tail.previous.time);
    }
    /*update() {
        let {startNodes, endNodes} = this;
        startNodes.sort((a, b) => TimeCalculator.getDelta(a.time, b.time))
        endNodes.sort((a, b) => TimeCalculator.getDelta(a.time, b.time))
        const length = this.endNodes.length;
        // this.nodes = new Array(length * 2 + 1);
        let eventTime: Float64Array;
        this.eventTime = eventTime = new Float64Array(length);
        for (let i = 0; i < length; i++) {
            eventTime[i] = TimeCalculator.getDelta(endNodes[i].time, startNodes[i].time);
        }
    }*/
    initJump() {
        const originalListLength = this.listLength;
        const effectiveBeats = this.effectiveBeats;
        this.jump = new JumpArray(this.head, this.tail, originalListLength, effectiveBeats, (node) => {
            const endNode = node.next;
            if ("tailing" in endNode) {
                return [Infinity, null];
            }
            return [TimeCalculator.toBeats(endNode.time), endNode.next];
        }, (node, beats) => TimeCalculator.toBeats(node.next.time) > beats ? false : node.next.next);
    }
    insert() {
    }
    getNodeAt(beats) {
        let node = this.jump.getNodeAt(beats);
        if (TimeCalculator.toBeats(node.time) > beats) {
            debugger;
        }
        return node;
    }
    getValueAt(beats) {
        return this.getNodeAt(beats).getValueAt(beats);
    }
    getIntegral(beats, timeCalculator) {
        const node = this.getNodeAt(beats);
        return node.getIntegral(beats, timeCalculator) + node.cachedIntegral;
    }
    updateNodesIntegralFrom(beats, timeCalculator) {
        let previousStartNode = this.getNodeAt(beats);
        previousStartNode.cachedIntegral = -previousStartNode.getIntegral(beats, timeCalculator);
        let totalIntegral = previousStartNode.cachedIntegral;
        let endNode;
        while (!("tailing" in (endNode = previousStartNode.next))) {
            const currentStartNode = endNode.next;
            totalIntegral += previousStartNode.getFullIntegral(timeCalculator);
            currentStartNode.cachedIntegral = totalIntegral;
            previousStartNode = currentStartNode;
        }
    }
}
const TAP = new Image(135);
const DRAG = new Image(135);
const FLICK = new Image(135);
const HOLD = new Image(135);
const DOUBLE = new Image(135);
const BELOW = new Image(135);
const ANCHOR = new Image(20, 20);
const NODE_START = new Image(20, 10);
const NODE_END = new Image(20, 10);
TAP.src = "../img/tap.png";
DRAG.src = "../img/drag.png";
FLICK.src = "../img/flick.png";
HOLD.src = "../img/hold.png";
ANCHOR.src = "../img/anchor.png";
BELOW.src = "../img/below.png";
DOUBLE.src = "../img/double.png";
NODE_START.src = "../img/south.png";
NODE_END.src = "../img/north.png";
const DEFAULT_ASPECT_RATIO = 3 / 2;
const LINE_WIDTH = 10;
const LINE_COLOR = "#CCCC77";
// 以原点为中心，渲染的半径
const RENDER_SCOPE = 800;
class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.audio = new Audio();
        this.playing = false;
        this.aspect = DEFAULT_ASPECT_RATIO;
        this.noteSize = 135;
        this.initCoordinate();
    }
    get time() {
        return this.audio.currentTime || 0;
    }
    get beats() {
        return this.chart.timeCalculator.secondsToBeats(this.time);
    }
    initCoordinate() {
        let { canvas, context } = this;
        // console.log(context.getTransform())
        const height = canvas.parentElement.clientHeight;
        const width = height * (this.aspect);
        canvas.height = height;
        canvas.width = width;
        // context.translate(height / 2, width / 2) 好好纪念这个把我气吐血的智障
        context.translate(width / 2, height / 2);
        context.scale(width / 1350, -height / 900);
        context.scale(0.25, 0.25);
        context.save();
        // console.log(context.getTransform())
    }
    render() {
        this.context.scale(1, -1);
        this.context.drawImage(this.background, -675, -450, 1350, 900);
        this.context.fillStyle = "#2227";
        this.context.fillRect(-2700, -1800, 5400, 3600);
        this.context.restore();
        this.context.save();
        const context = this.context;
        context.strokeStyle = "#FFFFFF";
        drawLine(context, -1350, 0, 1350, 0);
        drawLine(context, 0, 900, 0, -900);
        // console.log("rendering")
        for (let line of this.chart.orphanLines) {
            this.renderLine(0, 0, line);
            context.restore();
            context.save();
        }
        const showInfo = settings.get("playerShowInfo");
    }
    renderLine(baseX, baseY, judgeLine) {
        const context = this.context;
        const timeCalculator = this.chart.timeCalculator;
        // const timeCalculator = this.chart.timeCalculator
        let x = judgeLine.getStackedValue("moveX", this.beats);
        let y = judgeLine.getStackedValue("moveY", this.beats);
        let theta = judgeLine.getStackedValue("rotate", this.beats) / 180 * Math.PI; // 转换为弧度制
        let alpha = judgeLine.getStackedValue("alpha", this.beats);
        // console.log(x, y, theta, alpha);
        context.translate(x, y);
        let transformedX = x + baseX;
        let transformedY = y + baseY;
        if (judgeLine.children.length !== 0) {
            context.save();
            for (let line of judgeLine.children) {
                this.renderLine(transformedX, transformedY, line);
            }
            context.restore();
        }
        context.rotate(theta);
        context.lineWidth = LINE_WIDTH; // 判定线宽度
        // const hexAlpha = alpha < 0 ? "00" : (alpha > 255 ? "FF" : alpha.toString(16))
        const lineColor = settings.get("lineColor");
        context.strokeStyle = rgba(...lineColor, alpha / 255);
        drawLine(context, -1350, 0, 1350, 0);
        context.drawImage(ANCHOR, -10, -10);
        /** 判定线的法向量 */
        const nVector = [-Math.sin(theta), +Math.cos(theta)]; // 奇变偶不变，符号看象限(
        const toCenter = [-transformedX, -transformedY];
        // 法向量是单位向量，分母是1，不写
        const distance = innerProduct(toCenter, nVector);
        let startY, endY;
        if (Math.abs(distance) < RENDER_SCOPE) {
            startY = 0;
            endY = Math.abs(distance) + RENDER_SCOPE;
        }
        else if (distance > 0) {
            startY = distance - RENDER_SCOPE;
            endY = distance + RENDER_SCOPE;
        }
        else {
            startY = distance + RENDER_SCOPE;
            endY = distance - RENDER_SCOPE;
        }
        judgeLine.updateSpeedIntegralFrom(this.beats, timeCalculator);
        const holdTrees = judgeLine.holdTrees;
        const noteTrees = judgeLine.noteTrees;
        for (let trees of [holdTrees, noteTrees]) {
            for (let speed in trees) {
                const tree = trees[speed];
                const speedVal = parseFloat(speed);
                const timeRanges = judgeLine.computeTimeRange(this.beats, timeCalculator, startY / speedVal, endY / speedVal);
                console.log(timeRanges, startY, endY);
                for (let range of timeRanges) {
                    const start = range[0];
                    const end = range[1];
                    let note = tree.getNoteAt(start);
                    while (!("tailing" in note) && TimeCalculator.toBeats(note.startTime) < end) {
                        this.renderSameTimeNotes(note, judgeLine, timeCalculator);
                        note = note.next;
                    }
                }
            }
        }
        /*
        for (let eachSpeed in judgeLine.noteSpeeds) {
            const speed = parseFloat(eachSpeed)
            let notes = judgeLine.noteSpeeds[eachSpeed];
            /** 判定线在假想的瀑布中前进距离 /
            let currentPositionY = judgeLine.computeLinePositionY(this.beats, this.chart.timeCalculator) * speed;
            for (let eachNote of notes) {
                /** Note在某一时刻与判定线的距离 /
                const positionY: number = eachNote.positionY - currentPositionY;
                const endPositionY = eachNote.endPositionY - currentPositionY;
                if (!positionY && positionY !== 0 || !endPositionY && endPositionY !== 0) {
                    debugger;
                }
                if (endPositionY >= 0 && TimeCalculator.toBeats(eachNote.endTime) >= this.beats) {
                    // 绑线Note=0不要忘了
                    this.renderNote(eachNote, positionY < 0 ? 0 : positionY, endPositionY)
                    // console.log(eachNote, eachNote.above)
                    // console.log("pos:", eachNote.positionY, notes.indexOf(eachNote))
                }
            }
        }
        */
    }
    renderSameTimeNotes(note, judgeLine, timeCalculator) {
        if (note.type === NoteType.Hold) {
            const startY = judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.startTime), timeCalculator) * note.speed;
            this.renderNote(note, startY < 0 ? 0 : startY, judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.endTime), timeCalculator) * note.speed);
        }
        else {
            this.renderNote(note, judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.startTime), timeCalculator) * note.speed);
        }
        if (note.nextSibling) {
            this.renderSameTimeNotes(note.nextSibling, judgeLine, timeCalculator);
        }
    }
    renderNote(note, positionY, endpositionY) {
        if (TimeCalculator.toBeats(note.endTime) < this.beats) {
            return;
        }
        let image;
        switch (note.type) {
            case NoteType.Tap:
                image = TAP;
                break;
            case NoteType.Drag:
                image = DRAG;
                break;
            case NoteType.Flick:
                image = FLICK;
                break;
            case NoteType.Hold:
                image = HOLD;
                break;
            default:
                image = TAP;
        }
        if (!note.above) {
            positionY = -positionY;
            endpositionY = -endpositionY;
        }
        let length = endpositionY - positionY;
        // console.log(NoteType[note.type])
        if (note.type === NoteType.Hold) {
            this.context.drawImage(image, note.positionX - this.noteSize / 2, positionY - 10, this.noteSize, length);
        }
        else {
            this.context.drawImage(image, note.positionX - this.noteSize / 2, positionY - 10);
            if (note.double) {
                this.context.drawImage(DOUBLE, note.positionX - this.noteSize / 2, positionY - 10);
            }
            if (!note.above) {
                this.context.drawImage(BELOW, note.positionX - this.noteSize / 2, positionY - 10);
            }
        }
    }
    update() {
        if (!this.playing) {
            return;
        }
        // console.log("anifr")
        requestAnimationFrame(() => {
            // console.log("render")
            this.render();
            this.update();
        });
    }
    play() {
        this.audio.play();
        this.playing = true;
        this.update();
    }
    pause() {
        this.playing = false;
        this.audio.pause();
    }
}
class ProgressBar {
    constructor(target) {
        this.target = target;
        this.element = document.createElement("progress");
        const element = this.element;
        if (target.duration) {
            this.element.max = target.duration;
        }
        target.addEventListener("loadeddata", () => {
            this.element.max = target.duration;
        });
        target.addEventListener("play", () => {
            this.update();
        });
        let controlling = false;
        on(["mousedown", "touchstart"], element, (event) => {
            controlling = true;
        });
        on(["mousemove", "touchmove"], element, (event) => {
            let posX;
            if (!controlling) {
                return;
            }
            if (event instanceof MouseEvent) {
                posX = event.clientX;
            }
            else {
                posX = event.changedTouches[0].clientX;
            }
            const value = element.max * ((posX - element.offsetLeft) / element.clientWidth);
            element.value = value;
            target.currentTime = value;
        });
        on(["mouseup", "touchend"], element, (event) => {
            let posX;
            if (!controlling) {
                return;
            }
            controlling = false;
            if (event instanceof MouseEvent) {
                posX = event.clientX;
            }
            else {
                posX = event.changedTouches[0].clientX;
            }
            const value = element.max * ((posX - element.offsetLeft) / element.clientWidth);
            element.value = value;
            target.currentTime = value;
        });
    }
    appendTo(element) {
        element.appendChild(this.element);
        return this;
    }
    update() {
        if (this.target.paused) {
            return;
        }
        requestAnimationFrame(() => {
            this.element.value = this.target.currentTime;
            this.update();
        });
    }
}
class TimeCalculator {
    constructor() {
    }
    update() {
        /**
         * bpmList项数=SPB数量=片段拍数、秒数-1
         * 最后一个片段是没有时长的
         */
        let bpmList = this.bpmList;
        let length = bpmList.length;
        let segmentSeconds, segmentBeats, segmentSPB;
        this.segmentSeconds = segmentSeconds = new Float64Array(length - 1);
        this.segmentBeats = segmentBeats = new Float64Array(length - 1);
        this.segmentSPB = segmentSPB = new Float64Array(length);
        let index = 0;
        let next = bpmList[0];
        let nextBeats = TimeCalculator.toBeats(next.startTime);
        for (; index < length - 1; index++) {
            let each = next;
            next = bpmList[index + 1];
            let spb = 60 / each.bpm;
            let startTime = each.startTime;
            let startBeats = TimeCalculator.toBeats(startTime);
            let duration = nextBeats - startBeats;
            nextBeats = startBeats;
            segmentSPB[index] = spb;
            segmentBeats[index] = duration;
            segmentSeconds[index] = duration * spb;
        }
        segmentSPB[index] = 60 / next.bpm; // 最后一个SPB在上面不会存
    }
    toSeconds(beats) {
        let { segmentSeconds, segmentBeats, segmentSPB } = this;
        let seconds = 0;
        let currentBeats = segmentBeats[0];
        if (segmentBeats.length === 0) {
            return beats * segmentSPB[0];
        }
        let index = 0;
        for (; currentBeats < beats; index++) {
            seconds += segmentSeconds[index];
            currentBeats += segmentBeats[index + 1];
        }
        return seconds + (beats - segmentBeats[index]) * segmentSPB[index];
    }
    segmentToSeconds(beats1, beats2) {
        let ret = this.toSeconds(beats2) - this.toSeconds(beats1);
        if (ret < 0) {
            console.warn("segmentToSeconds的第二个参数需大于第一个！", "得到的参数：", arguments);
        }
        return ret;
    }
    secondsToBeats(seconds) {
        let { segmentSeconds, segmentBeats, segmentSPB } = this;
        let beats = 0;
        let currentSeconds = segmentSeconds[0];
        if (segmentSeconds.length === 0) {
            return seconds / segmentSPB[0];
        }
        let index = 0;
        for (; currentSeconds < seconds; index++) {
            beats += segmentBeats[index];
            currentSeconds += segmentSeconds[index + 1];
        }
        return beats + (seconds - segmentSeconds[index]) / segmentSPB[index];
    }
    static toBeats(beaT) {
        return beaT[0] + beaT[1] / beaT[2];
    }
    static getDelta(beaT1, beaT2) {
        return this.toBeats(beaT1) - this.toBeats(beaT2);
    }
    static eq(beaT1, beaT2) {
        return beaT1[0] === beaT2[0] && beaT1[1] * beaT2[2] === beaT2[1] * beaT2[2];
    }
    static gt(beaT1, beaT2) {
        return beaT1[0] > beaT2[0] || beaT1[1] * beaT2[2] > beaT1[2] * beaT2[1];
    }
    static lt(beaT1, beaT2) {
        return beaT1[0] < beaT2[0] || beaT1[1] * beaT2[2] < beaT1[2] * beaT2[1];
    }
    static ne(beaT1, beaT2) {
        return beaT1[0] !== beaT2[0] || beaT1[1] * beaT2[2] !== beaT1[2] * beaT2[1];
    }
}
const settings = new Settings();
const editor = new Editor();
