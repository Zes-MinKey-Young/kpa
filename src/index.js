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
class Note {
    constructor(data) {
        this.above = Boolean(data.above);
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
    }
}
class JudgeLine {
    constructor() {
        this.notes = [];
        this.eventLayers = [];
        this.noteSpeeds = {};
    }
    static fromRPEJSON(data, templates, timeCalculator) {
        let line = new JudgeLine();
        if (data.notes) {
            let notes = data.notes;
            const len = notes.length;
            let lastNote = new Note(notes[0]);
            line.notes.push(lastNote);
            for (let i = 1; i < len; i++) {
                let note = new Note(notes[i]);
                if (arrEq(note.startTime, lastNote.startTime)) {
                    note.double = true;
                    lastNote.double = true;
                }
                line.notes.push(note);
                lastNote = note;
            }
        }
        const eventLayers = data.eventLayers;
        const length = eventLayers.length;
        for (let index = 0; index < length; index++) {
            const layerData = eventLayers[index];
            const layer = {
                moveX: EventNodeSequence.fromRPEJSON(layerData.moveXEvents, templates),
                moveY: EventNodeSequence.fromRPEJSON(layerData.moveYEvents, templates),
                rotate: EventNodeSequence.fromRPEJSON(layerData.rotateEvents, templates),
                alpha: EventNodeSequence.fromRPEJSON(layerData.alphaEvents, templates),
                speed: EventNodeSequence.fromRPEJSON(layerData.speedEvents, templates)
            };
            line.eventLayers[index] = layer;
            for (let each in layerData) {
                let type = each.slice(-6); // 去掉后面的“Event”
                line.eventLayers[index][type];
            }
        }
        line.updateNoteSpeeds();
        line.computeNotePositionY(timeCalculator);
        return line;
    }
    computeNotePositionY(timeCalculator) {
        for (let each of this.notes) {
            // console.log("inte", this.getStackedIntegral(TimeCalculator.toBeats(each.startTime), timeCalculator))
            each.positionY = this.getStackedIntegral(TimeCalculator.toBeats(each.startTime), timeCalculator) * each.speed;
            each.endpositionY = this.getStackedIntegral(TimeCalculator.toBeats(each.endTime), timeCalculator) * each.speed;
        }
    }
    updateNoteSpeeds() {
        let noteSpeed = this.noteSpeeds = {};
        for (let note of this.notes) {
            if (!noteSpeed[note.speed]) {
                noteSpeed[note.speed] = [];
            }
            noteSpeed[note.speed].push(note);
        }
    }
    computeLinePositionY(beats, timeCalculator) {
        return this.getStackedIntegral(beats, timeCalculator);
    }
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
        this.templateEasingLib = {};
    }
    static fromRPEJSON(data) {
        let chart = new Chart();
        chart.bpmList = data.BPMList;
        chart.updateCalculator();
        if (data.envEasings) {
            for (let easing of data.envEasings) {
                chart.templateEasingLib[easing.name] = new TemplateEasing(EventNodeSequence.fromRPEJSON(easing.content, chart.templateEasingLib)); // 大麻烦！
            }
        }
        // let line = data.judgeLineList[0];
        for (let line of data.judgeLineList) {
            chart.judgeLines.push(JudgeLine.fromRPEJSON(line, chart.templateEasingLib, chart.timeCalculator));
        }
        return chart;
    }
    updateCalculator() {
        this.timeCalculator.bpmList = this.bpmList;
        this.timeCalculator.update();
    }
}
function easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
        ? 0
        : x === 1
            ? 1
            : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}
function easeOutBounce(x) {
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
}
function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}
function easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
function linear(x) {
    return x;
}
function easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
}
function easeInQuad(x) {
    return Math.pow(x, 2);
}
function easeInCubic(x) {
    return Math.pow(x, 3);
}
function easeInQuart(x) {
    return Math.pow(x, 4);
}
function easeInQuint(x) {
    return Math.pow(x, 5);
}
function easeInCirc(x) {
    return 1 - Math.sqrt(1 - Math.pow(x, 2));
}
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
}
class NormalEasing extends Easing {
    constructor(fn) {
        super();
        this._getValue = fn;
    }
    getValue(t) {
        if (t > 1 || t < 0) {
            console.warn("缓动超出定义域！");
        }
        console.log("t:", t, "rat", this._getValue(t));
        return this._getValue(t);
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
        const startx = 0;
        const starty = 0;
        const endx = 1;
        const endy = 1;
        const para = (t - startx) / (endx - startx);
        const y = Math.pow((1 - para), 3) * starty + 3 * Math.pow((1 - para), 2) * para * this.cp1.y + 3 * (1 - para) * Math.pow(para, 2) * this.cp2.y + Math.pow(para, 3) * endy;
        return y;
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
        return seq.endNodes[seq.endNodes.length - 1].value - seq.startNodes[0].value;
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
const linearEasing = new NormalEasing(linear);
const fixedEasing = new NormalEasing(linear);
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
    constructor() {
        this.previous = null;
        this.next = null;
        this.ratio = 1;
    }
    static fromEvent(data, templates) {
        let start = new EventStartNode, end = new EventEndNode();
        start.time = data.startTime;
        start.value = data.start;
        end.previous = start;
        start.next = end;
        end.time = data.endTime;
        end.value = data.end;
        if (data.bezier) {
            let bp = data.bezierPoints;
            let easing = new BezierEasing();
            easing.cp1 = { x: bp[0], y: bp[1] };
            easing.cp2 = { x: bp[2], y: bp[3] };
            start.easing = easing;
        }
        else if (typeof data.easingType === "string") {
            start.easing = templates[data.easingType];
        }
        else if (data.easingType !== 0) {
            start.easing = rpeEasingArray[data.easingType];
        }
        return [start, end];
    }
}
class EventStartNode extends EventNode {
    constructor() {
        super();
    }
    getValueAt(beats) {
        // 除了尾部的开始节点，其他都有下个节点
        // 钩定型缓动也有
        if (!this.next) {
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
        // 其他类型，包括普通缓动和非钩定模板缓动
        return this.value + this.easing.getValue(current / timeDelta) * valueDelta;
    }
    getSpeedValueAt(beats) {
        if (!this.next) {
            return this.value;
        }
        let timeDelta = TimeCalculator.getDelta(this.next.time, this.time);
        let valueDelta = this.next.value - this.value;
        let current = beats - TimeCalculator.toBeats(this.time);
        return this.value + linearEasing.getValue(current / timeDelta) * valueDelta;
    }
    /**
     * 积分获取位移
     */
    getIntegral(beats, timeCalculator) {
        return timeCalculator.segmentToSeconds(TimeCalculator.toBeats(this.time), beats) * (this.value + this.getSpeedValueAt(beats)) / 2 * 120; // 每单位120px
    }
    getFullIntegral(timeCalculator) {
        if (!this.next) {
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
    constructor() {
        super();
    }
    getValueAt(beats) {
        return this.previous.getValueAt(beats);
    }
}
class EventNodeSequence {
    constructor() {
        // this.nodes = [];
        this.startNodes = [];
        this.endNodes = [];
    }
    static fromRPEJSON(data, templates) {
        let seq = new EventNodeSequence();
        const length = data.length;
        let lastEnd = null;
        for (let index = 0; index < length; index++) {
            const event = data[index];
            let [start, end] = EventNode.fromEvent(event, templates);
            if (lastEnd) {
                if (lastEnd.value === lastEnd.previous.value) {
                    lastEnd.time = start.time;
                }
                else if (!arrEq(lastEnd.time, start.time)) {
                    let val = lastEnd.value;
                    let midStart = new EventStartNode();
                    let midEnd = new EventEndNode();
                    midStart.time = lastEnd.time;
                    midEnd.time = start.time;
                    midStart.value = midEnd.value = val;
                    seq.startNodes.push(midStart);
                    seq.endNodes.push(midEnd);
                }
            }
            seq.startNodes.push(start);
            seq.endNodes.push(end);
            lastEnd = end;
            // seq.nodes.push(start, end);
        }
        let last = seq.endNodes[length - 1];
        let tail = new EventStartNode();
        tail.previous = last;
        last.next = tail;
        tail.time = last.time;
        tail.value = last.value;
        seq.startNodes.push(tail);
        seq.update();
        seq.validate();
        return seq;
    }
    validate() {
        /**
         * 奇谱发生器中事件都是首尾相连的
         */
        const length = this.endNodes.length;
        for (let index = 0; index < length; index++) {
            let end = this.endNodes[index];
            let start = this.startNodes[index + 1];
            if (!arrEq(end.time, start.time)) {
                start.time = end.time;
            }
            start.previous = end;
            end.next = start;
            // 这个就是真的该这么写了（
        }
    }
    /** 有效浮点拍数：最后一个结束节点的时间 */
    get effectiveBeats() {
        return TimeCalculator.toBeats(this.endNodes[this.endNodes.length - 1].time);
    }
    update() {
        let { startNodes, endNodes } = this;
        startNodes.sort((a, b) => TimeCalculator.getDelta(a.time, b.time));
        endNodes.sort((a, b) => TimeCalculator.getDelta(a.time, b.time));
        const length = this.endNodes.length;
        // this.nodes = new Array(length * 2 + 1);
        let eventTime;
        this.eventTime = eventTime = new Float64Array(length);
        for (let i = 0; i < length; i++) {
            eventTime[i] = TimeCalculator.getDelta(endNodes[i].time, startNodes[i].time);
        }
    }
    insert() {
    }
    getValueAt(beats) {
        let eventTime = this.eventTime;
        const length = this.endNodes.length;
        let i = 0;
        let rest = beats;
        for (; i < length; i++) {
            rest -= eventTime[i];
            if (rest < 0) {
                break;
            }
            /**
            if (beats < 0) {
                break
            }
            */
        }
        return this.startNodes[i].getValueAt(beats);
    }
    getIntegral(beats, timeCalculator) {
        let total = 0;
        const length = this.endNodes.length;
        let i = 0;
        for (; i < length; i++) {
            if (TimeCalculator.toBeats(this.endNodes[i].time) >= beats) {
                break;
            }
            total += this.startNodes[i].getFullIntegral(timeCalculator);
        }
        console.log(total, this);
        total += this.startNodes[i].getIntegral(beats, timeCalculator);
        console.log(total);
        return total;
    }
}
const TAP = new Image(135);
const DRAG = new Image(135);
const FLICK = new Image(135);
const HOLD = new Image(135);
const DOUBLE = new Image(135);
const BELOW = new Image(135);
const ANCHOR = new Image(20, 20);
TAP.src = "../img/tap.png";
DRAG.src = "../img/drag.png";
FLICK.src = "../img/flick.png";
HOLD.src = "../img/hold.png";
ANCHOR.src = "../img/anchor.png";
BELOW.src = "../img/below.png";
DOUBLE.src = "../img/double.png";
const DEFAULT_ASPECT_RATIO = 3 / 2;
const LINE_WIDTH = 10;
const LINE_COLOR = "#CCCC77";
class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.audio = new Audio();
        this.playing = false;
        this.aspect = DEFAULT_ASPECT_RATIO;
        this.noteSize = 135;
        this.initCoordinate();
        // @ts-ignore
        this.topBarEle = document.getElementById("topBar");
        // @ts-ignore
        this.previewEle = document.getElementById("preview");
        // @ts-ignore
        this.topBarEle = document.getElementById("topBar");
        // @ts-ignore
        this.topBarEle = document.getElementById("topBar");
        // @ts-ignore
        this.topBarEle = document.getElementById("topBar");
    }
    get time() {
        return this.audio.currentTime;
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
        context.save();
        // console.log(context.getTransform())
    }
    render() {
        this.context.scale(1, -1);
        this.context.drawImage(this.background, -675, -450, 1350, 900);
        this.context.fillStyle = "#2227";
        this.context.fillRect(-675, -450, 1350, 900);
        this.context.restore();
        this.context.save();
        const context = this.context;
        context.strokeStyle = "#000000";
        context.beginPath();
        context.moveTo(-1350, 0);
        context.lineTo(1350, 0);
        context.stroke();
        context.beginPath();
        context.moveTo(0, 900);
        context.lineTo(0, -900);
        context.stroke();
        // console.log("rendering")
        for (let line of this.chart.judgeLines) {
            this.renderLine(line);
            context.restore();
            context.save();
        }
    }
    renderLine(judgeLine) {
        const context = this.context;
        // const timeCalculator = this.chart.timeCalculator
        let x = judgeLine.getStackedValue("moveX", this.beats);
        let y = judgeLine.getStackedValue("moveY", this.beats);
        let theta = judgeLine.getStackedValue("rotate", this.beats) / 180 * Math.PI; // 转换为弧度制
        let alpha = judgeLine.getStackedValue("alpha", this.beats);
        // console.log(x, y, theta, alpha);
        context.translate(x, y);
        context.rotate(theta);
        context.lineWidth = LINE_WIDTH; // 判定线宽度
        // const hexAlpha = alpha < 0 ? "00" : (alpha > 255 ? "FF" : alpha.toString(16))
        context.strokeStyle = `rgba(200, 200, 120, ${alpha / 255})`;
        context.beginPath();
        context.moveTo(-1350, 0);
        context.lineTo(1350, 0);
        context.stroke();
        context.drawImage(ANCHOR, -10, -10);
        for (let eachSpeed in judgeLine.noteSpeeds) {
            const speed = parseFloat(eachSpeed);
            let notes = judgeLine.noteSpeeds[eachSpeed];
            /** 判定线在假想的瀑布中前进距离 */
            let currentPositionY = judgeLine.computeLinePositionY(this.beats, this.chart.timeCalculator) * speed;
            for (let eachNote of notes) {
                /** Note在某一时刻与判定线的距离 */
                let positionY = eachNote.positionY - currentPositionY;
                let endpositionY;
                if ((endpositionY = eachNote.endpositionY - currentPositionY) >= 0 && TimeCalculator.toBeats(eachNote.endTime) >= this.beats) {
                    // 绑线Note=0不要忘了
                    this.renderNote(eachNote, positionY < 0 ? 0 : positionY, endpositionY);
                    console.log(eachNote, eachNote.above);
                    // console.log("pos:", eachNote.positionY, notes.indexOf(eachNote))
                }
            }
        }
    }
    renderNote(note, positionY, endpositionY) {
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
        // console.log(NoteType[note.type])
        if (note.type === NoteType.Hold) {
            this.context.drawImage(image, note.positionX - this.noteSize / 2, note.above ? positionY : -positionY, this.noteSize, note.above ? endpositionY - positionY : positionY - endpositionY);
        }
        else {
            this.context.drawImage(image, note.positionX - this.noteSize / 2, note.above ? positionY : -positionY);
            if (note.double) {
                this.context.drawImage(DOUBLE, note.positionX - this.noteSize / 2, note.above ? positionY : -positionY);
            }
            if (!note.above) {
                this.context.drawImage(BELOW, note.positionX - this.noteSize / 2, note.above ? positionY : -positionY);
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
        return TimeCalculator.toBeats(beaT1) - TimeCalculator.toBeats(beaT2);
    }
}
// @ts-ignore
const player = globalThis.player = new Player(document.getElementById("player"));
// @ts-ignore
const fileInput = document.getElementById("fileInput");
// @ts-ignore
const musicInput = document.getElementById("musicInput");
// @ts-ignore
const backgroundInput = document.getElementById("backgroundInput");
document.getElementById("playButton").addEventListener("click", () => {
    player.play();
});
fileInput.addEventListener("change", () => {
    const reader = new FileReader();
    reader.readAsText(fileInput.files[0]);
    reader.addEventListener("load", () => {
        // @ts-ignore
        let data = JSON.parse(reader.result);
        let chart = Chart.fromRPEJSON(data);
        player.chart = chart;
        /**
        player.background = new Image();
        player.background.src = "../cmdysjtest.jpg";
        player.audio.src = "../cmdysjtest.mp3"; */
    });
});
musicInput.addEventListener("change", () => {
    const reader = new FileReader();
    reader.readAsDataURL(musicInput.files[0]);
    reader.addEventListener("load", () => {
        // @ts-ignore
        player.audio.src = reader.result;
    });
});
backgroundInput.addEventListener("change", () => {
    const reader = new FileReader();
    reader.readAsDataURL(backgroundInput.files[0]);
    reader.addEventListener("load", () => {
        player.background = new Image();
        // @ts-ignore
        player.background.src = reader.result;
    });
});
