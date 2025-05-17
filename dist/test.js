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
/**
 * 缓动基类
 * Easings are used to describe the rate of change of a parameter over time.
 * They are used in events, curve note filling, etc.
 */
class Easing {
    constructor() {
    }
    segmentedValueGetter(easingLeft, easingRight) {
        const leftValue = this.getValue(easingLeft);
        const rightValue = this.getValue(easingRight);
        return (t) => (this.getValue(t) - leftValue) / (rightValue - leftValue);
    }
    drawCurve(context, startX, startY, endX, endY) {
        const delta = endY - startY;
        const timeDelta = endX - startX;
        let last = startY;
        context.beginPath();
        context.moveTo(startX, last);
        for (let t = 4; t <= timeDelta; t += 4) {
            const ratio = t / timeDelta;
            const curPosY = this.getValue(ratio) * delta + startY;
            context.lineTo(startX + t, curPosY);
            last = curPosY;
        }
        context.stroke();
    }
}
class SegmentedEasing extends Easing {
    constructor(easing, left, right) {
        super();
        this.easing = easing;
        this.left = left;
        this.right = right;
        this.getter = easing.segmentedValueGetter(left, right);
    }
    getValue(t) {
        return this.getter(t);
    }
}
/**
 * 普通缓动
 * See https://easings.net/zh-cn to learn about the basic types of easing.
 *
 */
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
/**
 * 贝塞尔曲线缓动
 * uses the Bezier curve formula to describe an easing.
 */
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
/**
 * 模板缓动
 * to implement an easing with an eventNodeSequence.
 * 这是受wikitext的模板概念启发的。
 * This is inspired by the "template" concept in wikitext.
 */
class TemplateEasing extends Easing {
    constructor(name, nodes) {
        super();
        this.eventNodeSequence = nodes;
        this.name = name;
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
/**
 * 参数方程缓动
 * to implement an easing with a parametric equation.
 * RPE 亦有参数方程，但是它并不是作为缓动类型使用的；
 * RPE also has Parametric Equations, but it does not use it as an easing type;
 * 相反，RPE只是通过插值生成一个线性事件序列，是无法逆向的。
 * It instead just generate a sequence of linear events through interpolation, which is irreversible.
 * 这里在KPA中我们使用它作为缓动类型，以增加复用性。
 * Here in KPA we use it as an easing type, to increase reusability.
 * 在转换为RPEJSON前，都不需要对其进行分割。
 * We do not segment it until the chart is converted to an RPEJSON.
 */
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
/**
 * 缓动库
 * 用于管理模板缓动
 * for template easing management
 * 谱面的一个属性
 * a property of chart
 * 加载谱面时，先加载事件序列，所需的模板缓动会被加入到缓动库，但并不立即实现，在读取模板缓动时，才实现缓动。
 * To load a chart, the eventNodeSquences will be first loaded, during which process
 * the easings will be added to the easing library but not implemented immediately.
 * They will be implemented when the template easings are read from data.
 *
 */
class TemplateEasingLib {
    constructor(chart) {
        this.easings = {};
        this.chart = chart;
    }
    getOrNew(name) {
        if (this.easings[name]) {
            return this.easings[name];
        }
        else {
            const easing = new TemplateEasing(name, EventNodeSequence.newSeq(EventType.easing));
            return this.easings[name] = easing;
        }
    }
    /**
     * 注册一个模板缓动，但不会实现它
     * register a template easing when reading eventNodeSequences, but does not implement it immediately
     */
    require(name) {
        this.easings[name] = new TemplateEasing(name, null);
    }
    /**
     * 检查所有模板缓动是否实现
     * check if all easings are implemented
     * 应当在读取完所有模板缓动后调用
     * should be invoked after all template easings are read
     */
    check() {
        for (let key in this.easings) {
            if (!this.easings[key].eventNodeSequence) {
                throw new Error(`未实现的缓动：${key}`);
            }
        }
    }
    /**
     * @param customEasingData
     */
    add(customEasingData) {
        for (let each of customEasingData) {
            if (this.easings[each.name]) {
                if (this.easings[each.name].eventNodeSequence) {
                    throw new Error(`重复的缓动名：${each.name}`);
                }
                this.easings[each.name].eventNodeSequence = this.chart.sequenceMap[each.content];
            }
            this.easings[each.name] = new TemplateEasing(each.name, this.chart.sequenceMap[each.content]);
        }
    }
    get(key) {
        return this.easings[key];
    }
    dump(eventNodeSequences) {
        const customEasingDataList = [];
        for (let key in this.easings) {
            const templateEasing = this.easings[key];
            const eventNodeSequence = templateEasing.eventNodeSequence;
            if (eventNodeSequences.has(eventNodeSequence)) {
                continue;
            }
            eventNodeSequences.add(eventNodeSequence);
            customEasingDataList.push({
                name: key,
                content: eventNodeSequence.id, // 这里只存储编号，具体内容在保存时再编码
                usedBy: [],
                dependencies: []
            });
        }
        return customEasingDataList;
    }
    expandTemplates() {
        const map = new Map();
        for (let key in this.easings) {
            const templateEasing = this.easings[key];
            const eventNodeSequence = templateEasing.eventNodeSequence;
            const newEventNodeSequence = eventNodeSequence.substitute(map);
            map.set(eventNodeSequence, newEventNodeSequence);
        }
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
for (let funcType in easingMap) {
    for (let easeType in easingMap[funcType]) {
        const easing = easingMap[funcType][easeType];
        easing.funcType = funcType;
        easing.easeType = easeType;
    }
}
/**
 * 按照KPA的编号
 */
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
easingArray.forEach((easing, index) => {
    easing.id = index;
});
const rpeEasingArray = [
    null,
    linearEasing, // 1
    easingMap.sine.out, // 2
    easingMap.sine.in, // 3
    easingMap.quad.out, // 4
    easingMap.quad.in, // 5
    easingMap.sine.inout, // 6
    easingMap.quad.inout, // 7
    easingMap.cubic.out, // 8
    easingMap.cubic.in, // 9
    easingMap.quart.out, // 10
    easingMap.quart.in, // 11
    easingMap.cubic.inout, // 12
    easingMap.quart.inout, // 13
    easingMap.quint.out, // 14
    easingMap.quint.in, // 15
    // easingMap.quint.inout,
    easingMap.expo.out, // 16
    easingMap.expo.in, // 17
    // easingMap.expo.inout,
    easingMap.circ.out, // 18
    easingMap.circ.in, // 19
    easingMap.back.out, // 20
    easingMap.back.in, // 21
    easingMap.circ.inout, // 22
    easingMap.back.inout, // 23
    easingMap.elastic.out, // 24
    easingMap.elastic.in, // 25
    easingMap.bounce.out, // 26
    easingMap.bounce.in, // 27
    easingMap.bounce.inout, //28
    easingMap.elastic.inout // 29
];
rpeEasingArray.forEach((easing, index) => {
    if (!easing) {
        return;
    }
    easing.rpeId = index;
});
const connect = (foreNode, lateNode) => {
    foreNode.next = lateNode;
};
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;
const rgb = (r, g, b) => `rgba(${r}, ${g}, ${b})`;
/** @deprecated */
const toTimeString = (beaT) => `${beaT[0]}:${beaT[1]}/${beaT[2]}`;
function drawLine(context, startX, startY, endX, endY) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
}
// ParameterListSoLoooongException()
/**
 *
 * @param context
 * @param startX
 * @param startY
 * @param endX
 * @param endY
 * @param cp1x control point 1
 * @param cp1y
 * @param cp2x
 * @param cp2y
 */
function drawBezierCurve(context, startX, startY, endX, endY, cp1x, cp1y, cp2x, cp2y) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    context.stroke();
}
/**
 * To assign the same handler for different event types on an element
 * @param eventTypes array of strings representing the types
 * @param element
 * @param handler
 */
function on(eventTypes, element, handler) {
    for (let type of eventTypes) {
        element.addEventListener(type, handler);
    }
}
/**
 * to print a two-directional node list
 * @param list
 */
function printList(list) {
    let cur = list.head;
    while (1) {
        console.log(cur);
        if ("tailing" in cur) {
            break;
        }
        cur = cur.next;
    }
}
/**
 * to compute the length of a vector
 * @param v
 * @returns length
 */
const absVector = (v) => {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
};
/**
 *
 * @param v1
 * @param v2
 * @returns
 */
const innerProduct = (v1, v2) => {
    return v1[0] * v2[0] + v1[1] * v2[1];
};
const pointIsInRect = (x, y, rectPos, width, height) => rectPos.x - width / 2 <= x && x <= rectPos.x + width / 2
    && rectPos.y <= y && y <= rectPos.y + height;
/**
 * To get offset coordinates from mouse or touch
 * @param event
 * @param element
 * @returns
 */
const getOffsetCoordFromEvent = (event, element) => event instanceof MouseEvent ?
    [event.offsetX, event.offsetY] :
    [event.changedTouches[0].clientX - element.offsetTop, event.changedTouches[0].clientY - element.offsetTop];
function saveTextToFile(text, filename) {
    // 创建一个 Blob 对象
    const blob = new Blob([text], { type: 'text/plain' });
    // 创建一个 URL 对象
    const url = URL.createObjectURL(blob);
    // 创建一个 <a> 元素
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    // 将 <a> 元素添加到文档中
    document.body.appendChild(a);
    // 触发点击事件
    a.click();
    // 移除 <a> 元素
    document.body.removeChild(a);
    // 释放 URL 对象
    URL.revokeObjectURL(url);
}
function shortenFloat(num, decimalPlaces) {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(num * multiplier) / multiplier;
}
class OperationList {
    constructor() {
        this.operations = [];
        this.undoneOperations = [];
    }
    undo() {
        const op = this.operations.pop();
        if (op) {
            this.undoneOperations.push(op);
            op.undo();
        }
    }
    redo() {
        const op = this.undoneOperations.pop();
        if (op) {
            this.operations.push(op);
            op.do();
        }
    }
    do(operation) {
        if (operation.ineffective) {
            return;
        }
        if (this.operations.length !== 0) {
            const lastOp = this.operations[this.operations.length - 1];
            if (operation.constructor === lastOp.constructor) {
                if (lastOp.rewrite(operation)) {
                    if (operation.updatesEditor) {
                        editor.update();
                    }
                    return;
                }
            }
        }
        operation.do();
        if (operation.updatesEditor) {
            editor.update();
        }
        this.operations.push(operation);
    }
}
class Operation {
    constructor() {
    }
    rewrite(op) { return false; }
}
class ComplexOperation extends Operation {
    constructor(...sub) {
        super();
        this.subOperations = sub;
        this.length = sub.length;
    }
    do() {
        const length = this.length;
        for (let i = 0; i < length; i++) {
            const op = this.subOperations[i];
            if (op.ineffective) {
                break;
            }
            op.do();
        }
    }
    undo() {
        const length = this.length;
        for (let i = length - 1; i >= 0; i--) {
            const op = this.subOperations[i];
            if (op.ineffective) {
                break;
            }
            op.undo();
        }
    }
}
class NoteValueChangeOperation extends Operation {
    constructor(note, field, value) {
        super();
        this.updatesEditor = true;
        this.field = field;
        this.note = note;
        this.value = value;
        this.previousValue = note[field];
        if (value === note[field]) {
            this.ineffective = true;
        }
    }
    do() {
        this.note[this.field] = this.value;
    }
    undo() {
        this.note[this.field] = this.previousValue;
    }
    rewrite(operation) {
        if (operation.note === this.note && this.field === operation.field) {
            this.value = operation.value;
            this.note[this.field] = operation.value;
            return true;
        }
        return false;
    }
}
class NoteRemoveOperation extends Operation {
    constructor(note) {
        super();
        this.note = note; // In memory of forgettting to add this(
        if (!note.parent) {
            this.ineffective = true;
        }
        else {
            this.noteNode = note.parent;
        }
    }
    do() {
        this.noteNode.remove(this.note);
    }
    undo() {
        this.noteNode.add(this.note);
    }
}
class NoteAddOperation extends Operation {
    constructor(note, node) {
        super();
        this.updatesEditor = true;
        this.note = note;
        this.noteNode = node;
    }
    do() {
        this.noteNode.add(this.note);
    }
    undo() {
        this.noteNode.remove(this.note);
    }
}
class NoteTimeChangeOperation extends ComplexOperation {
    constructor(note, noteNode) {
        super(new NoteValueChangeOperation(note, "startTime", noteNode.startTime), new NoteRemoveOperation(note), new NoteAddOperation(note, noteNode));
        this.updatesEditor = true;
        this.note = note;
        if (note.parent === noteNode) {
            this.ineffective = true;
        }
    }
    rewrite(operation) {
        if (operation.note === this.note) {
            this.subOperations[0].value = operation.subOperations[0].value;
            this.subOperations[0].do();
            this.subOperations[1] = new NoteRemoveOperation(this.note);
            if (!this.subOperations[1].ineffective) {
                this.subOperations[1].do();
            }
            this.subOperations[2].noteNode = operation.subOperations[2].noteNode;
            this.subOperations[2].do();
            return true;
        }
        return false;
    }
}
class NoteSpeedChangeOperation extends ComplexOperation {
    constructor(note, value, line) {
        const valueChange = new NoteValueChangeOperation(note, "speed", value);
        const tree = line.getNoteTree(value, note.type === NoteType.hold, true);
        const node = tree.getNodeOf(note.startTime);
        const removal = new NoteRemoveOperation(note);
        const insert = new NoteAddOperation(note, node);
        super(valueChange, removal, insert);
        this.updatesEditor = true;
    }
}
class NoteTypeChangeOperation extends ComplexOperation {
    constructor(note, value) {
        this.updatesEditor = true;
        const isHold = note.type === NoteType.hold;
        const valueChange = new NoteValueChangeOperation(note, "type", value);
        if (isHold !== (value === NoteType.hold)) {
            const tree = note.parent.parent.parent.getNoteTree(note.speed, !isHold, true);
            const node = tree.getNodeOf(note.startTime);
            const removal = new NoteRemoveOperation(note);
            const insert = new NoteAddOperation(note, node);
            super(valueChange, removal, insert);
        }
        else {
            super(valueChange);
        }
    }
}
class NoteTreeChangeOperation extends NoteAddOperation {
}
class EventNodePairRemoveOperation extends Operation {
    constructor(node) {
        super();
        this.updatesEditor = true;
        if (node.isFirstStart()) {
            this.ineffective = true;
            return;
        }
        [this.endNode, this.startNode] = EventNode.getEndStart(node);
        this.sequence = this.startNode.parent;
        this.originalPrev = node.previous.previous;
    }
    do() {
        this.sequence.jump.updateRange(...EventNode.removeNodePair(this.endNode, this.startNode));
    }
    undo() {
        this.sequence.jump.updateRange(...EventNode.insert(this.startNode, this.originalPrev));
    }
}
class EventNodePairInsertOperation extends Operation {
    constructor(node, targetPrevious) {
        super();
        this.updatesEditor = true;
        this.node = node;
        this.tarPrev = targetPrevious;
    }
    do() {
        this.node.parent.jump.updateRange(...EventNode.insert(this.node, this.tarPrev));
    }
    undo() {
        this.node.parent.jump.updateRange(...EventNode.removeNodePair(...EventNode.getEndStart(this.node)));
    }
}
class EventNodeValueChangeOperation extends Operation {
    constructor(node, val) {
        super();
        this.updatesEditor = true;
        this.node = node;
        this.value = val;
        this.originalValue = node.value;
    }
    do() {
        this.node.value = this.value;
    }
    undo() {
        this.node.value = this.originalValue;
    }
    rewrite(operation) {
        if (operation.node === this.node) {
            this.value = operation.value;
            this.node.value = operation.value;
            return true;
        }
        return false;
    }
}
class EventNodeTimeChangeOperation extends Operation {
    constructor(node, val) {
        super();
        this.updatesEditor = true;
        if ("heading" in node.previous) {
            this.ineffective = true;
            return;
        }
        if (!TimeCalculator.gt(val, [0, 0, 1])) {
            this.ineffective = true;
            return;
        }
        [this.endNode, this.startNode] = EventNode.getEndStart(node);
        const seq = this.sequence = node.parent;
        const mayBeThere = seq.getNodeAt(TimeCalculator.toBeats(val));
        if (mayBeThere && TC.eq(mayBeThere.time, val)) { // 不是arrayEq，这里踩坑
            this.ineffective = true;
            return;
        }
        this.originalPrevious = this.endNode.previous;
        this.newPrevious = mayBeThere === this.startNode ? this.startNode.previous.previous : mayBeThere;
        this.value = val;
        this.originalValue = node.time;
        console.log("操作：", this);
    }
    do() {
        this.startNode.time = this.endNode.time = this.value;
        if (this.newPrevious !== this.originalPrevious) {
            this.sequence.jump.updateRange(...EventNode.removeNodePair(this.endNode, this.startNode));
            EventNode.insert(this.startNode, this.newPrevious);
        }
        this.sequence.jump.updateRange(this.endNode.previous, EventNode.nextStartOfStart(this.startNode));
    }
    undo() {
        this.endNode.time = this.startNode.time = this.originalValue;
        if (this.newPrevious !== this.originalPrevious) {
            this.sequence.jump.updateRange(...EventNode.removeNodePair(this.endNode, this.startNode));
            EventNode.insert(this.startNode, this.originalPrevious);
        }
        this.sequence.jump.updateRange(this.endNode.previous, EventNode.nextStartOfStart(this.startNode));
    }
}
class EventNodeInnerEasingChangeOperation extends Operation {
    constructor(node, val) {
        super();
        this.updatesEditor = true;
        let _;
        [_, this.startNode] = EventNode.getEndStart(node);
        this.value = val;
        this.originalValue = node.easing;
    }
    do() {
        this.startNode.innerEasing = this.value;
    }
    undo() {
        this.startNode.innerEasing = this.originalValue;
    }
}
// type EndBeats = number;
const MIN_LENGTH = 128;
const MAX_LENGTH = 1024;
const MINOR_PARTS = 16;
class JumpArray {
    /**
     *
     * @param head 链表头
     * @param tail 链表尾
     * @param originalListLength
     * @param effectiveBeats 有效拍数（等同于音乐拍数）
     * @param endNextFn 接收一个节点，返回该节点分管区段拍数，并给出下个节点。若抵达尾部，返回[null, null]（停止遍历的条件是抵达尾部而不是得到null）
     * @param nextFn 接收一个节点，返回下个节点。如果应当停止，返回false。
     */
    constructor(head, tail, originalListLength, effectiveBeats, endNextFn, nextFn) {
        this.header = head;
        this.tailer = tail;
        this.endNextFn = endNextFn;
        this.nextFn = nextFn;
        // const originalListLength = this.listLength
        const listLength = Math.max(MIN_LENGTH, Math.min(originalListLength * 4, MAX_LENGTH));
        const averageBeats = Math.pow(2, Math.ceil(Math.log2(effectiveBeats / listLength)));
        const exactLength = Math.ceil(effectiveBeats / averageBeats);
        console.log(exactLength, listLength, averageBeats, exactLength);
        // console.log(originalListLength, effectiveBeats, averageBeats, minorBeats, exactLength)
        const jumpArray = new Array(exactLength);
        this.array = jumpArray;
        this.averageBeats = averageBeats;
        this.effectiveBeats = exactLength * averageBeats;
        this.updateRange(head, tail);
    }
    updateEffectiveBeats(val) {
        this.effectiveBeats = val;
        const averageBeats = this.averageBeats;
        const exactLength = Math.ceil(val / averageBeats);
        const currentLength = this.array.length;
        if (exactLength < currentLength) {
            this.array.splice(exactLength, currentLength - exactLength);
        }
    }
    updateAverageBeats() {
        const length = this.array.length;
        if (length >= 1024) {
            return;
        }
        let crowded = 0;
        for (let i = 0; i < 50; i++) {
            const index = Math.floor(Math.random() * length);
            if (Array.isArray(this.array[index])) {
                crowded++;
            }
        }
        if (crowded > 30) {
            this.averageBeats /= 2;
            this.updateRange(this.header, this.tailer);
        }
    }
    /**
     *
     * @param firstNode 不含
     * @param lastNode 含
     */
    updateRange(firstNode, lastNode) {
        console.log(firstNode, lastNode);
        const { endNextFn, effectiveBeats } = this;
        /**
         *
         * @param startTime
         * @param endTime 就是节点管辖范围的终止点，可以超过该刻度的最大值
         */
        const fillMinor = (startTime, endTime) => {
            const minorArray = jumpArray[jumpIndex];
            const currentJumpBeats = jumpIndex * averageBeats;
            const startsFrom = startTime < currentJumpBeats ? 0 : Math.ceil((startTime - currentJumpBeats) / minorBeats);
            const endsBefore = endTime > currentJumpBeats + averageBeats ? MINOR_PARTS : Math.ceil((endTime - currentJumpBeats) / minorBeats);
            for (let minorIndex = startsFrom; minorIndex < endsBefore; minorIndex++) {
                minorArray[minorIndex] = currentNode;
            }
            console.log(jumpIndex, arrayForIn(minorArray, (n) => node2string(n)).join("]["));
            console.log("cur:", currentNode);
        };
        const jumpArray = this.array;
        const averageBeats = this.averageBeats;
        const minorBeats = averageBeats / MINOR_PARTS;
        let [previousEndTime, currentNode] = endNextFn(firstNode);
        let jumpIndex = Math.floor(previousEndTime / averageBeats); // 这里写漏了特此留念
        for (;;) {
            let [endTime, nextNode] = endNextFn(currentNode);
            console.log("----Node:", currentNode, "next:", nextNode, "endTime:", endTime, "previousEndTime:", previousEndTime);
            if (endTime === null) {
                endTime = effectiveBeats;
            }
            // Hold树可能会不出现这种情况，故需特别考虑
            if (endTime > previousEndTime) {
                while (endTime >= (jumpIndex + 1) * averageBeats) {
                    if (Array.isArray(jumpArray[jumpIndex])) {
                        fillMinor(previousEndTime, endTime);
                    }
                    else {
                        try {
                            console.log(jumpIndex, currentNode);
                            jumpArray[jumpIndex] = currentNode;
                        }
                        catch (E) {
                            console.log(jumpIndex, jumpArray);
                            debugger;
                        }
                    }
                    jumpIndex++;
                }
                const currentJumpBeats = jumpIndex * averageBeats; // 放错了
                if (endTime > currentJumpBeats) {
                    let minor = jumpArray[jumpIndex];
                    if (!Array.isArray(minor)) {
                        jumpArray[jumpIndex] = new Array(MINOR_PARTS);
                    }
                    fillMinor(previousEndTime, endTime);
                }
                previousEndTime = endTime;
            }
            if (currentNode === lastNode) {
                currentNode = nextNode; // 为了后续可能的填充，防止刻度不满引发错误
                break;
            }
            currentNode = nextNode;
        }
        const minor = jumpArray[jumpIndex];
        if (Array.isArray(minor)) {
            console.log("minor", arrayForIn(minor, (n) => node2string(n)));
            if (!minor[MINOR_PARTS - 1]) {
                if (!currentNode) {
                    currentNode = this.tailer;
                    fillMinor(previousEndTime, effectiveBeats);
                    return;
                }
                do {
                    let [endTime, nextNode] = endNextFn(currentNode);
                    if (endTime === null) {
                        endTime = this.effectiveBeats;
                    }
                    if (endTime > previousEndTime) {
                        fillMinor(previousEndTime, endTime);
                        previousEndTime = endTime;
                    }
                    currentNode = nextNode;
                } while (previousEndTime < (jumpIndex + 1) * averageBeats);
            }
        }
    }
    /**
     *
     * @param beats 拍数
     * @ param usePrev 可选，若设为true，则在取到事件头部时会返回前一个事件（即视为左开右闭）
     * @returns 时间索引链表的节点
     */
    getNodeAt(beats) {
        if (beats < 0) {
            return this.header.next;
        }
        if (beats >= this.effectiveBeats) {
            return this.tailer;
        }
        const jumpAverageBeats = this.averageBeats;
        const jumpPos = Math.floor(beats / jumpAverageBeats);
        const rest = beats - jumpPos * jumpAverageBeats;
        const nextFn = this.nextFn;
        let canBeNodeOrArray = this.array[jumpPos];
        let node = Array.isArray(canBeNodeOrArray)
            ? canBeNodeOrArray[Math.floor(rest / (jumpAverageBeats / MINOR_PARTS))]
            : canBeNodeOrArray;
        if ("tailing" in node) {
            return node;
        }
        // console.log(this, node, jumpPos, beats)
        if (!node) {
            console.warn("No node:", node, beats);
            debugger;
        }
        let next;
        // console.log(this)
        while (next = nextFn(node, beats)) {
            node = next;
            if ("tailing" in node) {
                break;
            }
        }
        return node;
    }
}
/**
 * @deprecated
 */
class Pointer {
    constructor() {
        this.node = null;
        this.beats = null;
        this.before = 0;
    }
    pointTo(node, beats, counts = false) {
        if (!node) {
            debugger;
        }
        this.node = node;
        this.beats = beats;
    }
}
class SelectionManager {
    constructor() {
    }
    refresh() {
        this.positions = [];
    }
    add(entity) {
        this.positions.push(entity);
    }
    click(x, y) {
        const positions = this.positions;
        console.log(positions, x, y);
        const len = positions.length;
        let i = 0;
        let selected, priority = -1;
        for (; i < len; i++) {
            const pos = positions[i];
            if (pointIsInRect(x, y, pos, pos.width, pos.height)) {
                if (pos.priority > priority) {
                    selected = pos;
                    priority = pos.priority;
                }
            }
        }
        return selected;
    }
}
/**
 * @author Zes M Young
 */
const node2string = (node) => {
    if (!node) {
        return "" + node;
    }
    if ("heading" in node || "tailing" in node) {
        return "heading" in node ? "H" : "tailing" in node ? "T" : "???";
    }
    if (!node.notes) {
        return "EventNode";
    }
    return `NN(${node.notes.length}) at ${node.startTime}`;
};
/**
 * 音符
 * Basic element in music game.
 * Has 4 types: tap, drag, flick and hold.
 * Only hold has endTime; others' endTime is equal to startTime.
 * For this reason, holds are store in a special list (HNList),
 * which is sorted by both startTime and endTime,
 * so that they are accessed correctly and rapidly in the renderer.
 * Note that Hold and HoldNode are not individually-declared classes.
 * Hold is a note with type being NoteType.hold,
 * while HoldNode is a node that contains holds.
 */
class Note {
    // readonly chart: Chart;
    // readonly judgeLine: JudgeLine
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
        /*
        this.previous = null;
        this.next = null;
        this.previousSibling = null;
        this.nextSibling = null;
        */
    }
    /*
    static connectPosSibling(note1: Note, note2: Note) {
        note1.posNextSibling = note2;
        note2.posPreviousSibling = note1;
    }
    static connectPos(note1: Note, note2: Note) {
        note1.posNext = note2;
        note2.posPrevious = note1;
    }
    */
    dumpRPE() {
        return {
            above: this.above ? 1 : 0,
            alpha: this.alpha,
            endTime: this.endTime,
            isFake: this.isFake ? 1 : 0,
            positionX: this.positionX,
            size: this.size,
            startTime: this.startTime,
            type: this.type,
            visibleTime: this.visibleTime,
            yOffset: this.yOffset,
            speed: this.speed
        };
    }
    dumpKPA() {
    }
}
class NoteNode {
    get previous() {
        if (!this._previous)
            return null;
        return this._previous.deref();
    }
    set previous(val) {
        if (!val) {
            this._previous = null;
            return;
        }
        this._previous = new WeakRef(val);
    }
    constructor(time) {
        this.startTime = [...time];
        this.notes = [];
    }
    static fromKPAJSON(data) {
        const node = new NoteNode(data.startTime);
        for (let noteData of data.notes) {
            const note = new Note(noteData);
            node.add(note);
        }
        return node;
    }
    get isHold() {
        return this.parent instanceof HNList;
    }
    get endTime() {
        return (this.notes.length === 0 || this.notes[0].type !== NoteType.hold) ? this.startTime : this.notes[0].endTime;
    }
    add(note) {
        if (!TimeCalculator.eq(note.startTime, this.startTime)) {
            console.warn("Wrong addition!");
        }
        this.notes.push(note);
        note.parent = this;
    }
    remove(note) {
        this.notes.splice(this.notes.indexOf(note), 1);
        note.parent = null;
    }
    static disconnect(note1, note2) {
        if (note1) {
            note1.next = null;
        }
        if (note2) {
            note2.previous = null;
        }
    }
    static connect(note1, note2) {
        if (note1) {
            // @ts-expect-error
            note1.next = note2;
        }
        if (note2) {
            // @ts-expect-error
            note2.previous = note1;
        }
        if (note1 && note2) {
            note2.parent = note1.parent;
        }
    }
    static insert(note1, inserted, note2) {
        this.connect(note1, inserted);
        this.connect(inserted, note2);
    }
    dump() {
        return {
            notes: this.notes.map(note => note.dumpRPE()),
            startTime: this.startTime
        };
    }
}
class NNList {
    constructor(speed, effectiveBeats) {
        this.speed = speed;
        this.head = {
            heading: true,
            next: null,
            parent: this
        };
        this.currentPoint = this.head;
        // this.currentBranchPoint = <NoteNode>{startTime: [-1, 0, 1]}
        this.tail = {
            tailing: true,
            previous: null,
            parent: this
        };
        this.timesWithNotes = 0;
        /*
        this.renderPointer = new Pointer();
        this.hitPointer = new Pointer();
        this.editorPointer = new Pointer()
        */
        this.effectiveBeats = effectiveBeats;
    }
    static fromKPAJSON(isHold, effectiveBeats, data, nnnList) {
        const list = isHold ? new HNList(data.speed, effectiveBeats) : new NNList(data.speed, effectiveBeats);
        const nnlength = data.noteNodes.length;
        let cur = list.head;
        for (let i = 0; i < nnlength; i++) {
            const nnData = data.noteNodes[i];
            const nn = NoteNode.fromKPAJSON(nnData);
            NoteNode.connect(cur, nn);
            cur = nn;
            nnnList.addNoteNode(nn);
        }
        NoteNode.connect(cur, list.tail);
        list.initJump();
        return list;
    }
    initJump() {
        const originalListLength = this.timesWithNotes;
        if (!this.effectiveBeats) {
            this.effectiveBeats = TimeCalculator.toBeats(this.tail.previous.endTime);
        }
        const effectiveBeats = this.effectiveBeats;
        this.jump = new JumpArray(this.head, this.tail, originalListLength, effectiveBeats, (node) => {
            if ("tailing" in node) {
                return [null, null];
            }
            const nextNode = node.next;
            const startTime = "heading" in node ? 0 : TimeCalculator.toBeats(node.startTime);
            return [startTime, nextNode];
        }, (note, beats) => {
            return TimeCalculator.toBeats(note.startTime) >= beats ? false : note.next; // getNodeAt有guard
        }
        /*,
        (note: Note) => {
            const prev = note.previous;
            return "heading" in prev ? note : prev
        })*/ );
    }
    initPointer(pointer) {
        pointer.pointTo(this.head.next, 0);
    }
    //initPointers() {
    /*
    this.initPointer(this.hitPointer);
    this.initPointer(this.renderPointer)
    this.initPointer(this.editorPointer);
    */
    //}
    /**
     *
     * @param beats 目标位置
     * @param beforeEnd 指定选取该时刻之前还是之后第一个Node，对于非Hold无影响
     * @param pointer 指针，实现查询位置缓存
     * @returns
     */
    getNodeAt(beats, beforeEnd = false, pointer) {
        /*
        if (pointer) {
            if (beats !== pointer.beats) {
                if (beforeEnd) {
                    this.movePointerBeforeEnd(pointer, beats)
                } else {
                    this.movePointerBeforeStart(pointer, beats)
                }
            }
            if (!pointer.node) {
                debugger
            }
            return pointer.node
        }
        */
        return this.jump.getNodeAt(beats);
    }
    /**
     * Get or create a node of given time
     * @param time
     * @returns
     */
    getNodeOf(time) {
        var _a;
        const node = this.getNodeAt(TimeCalculator.toBeats(time), false)
            .previous;
        const isEqual = !("heading" in node) && TimeCalculator.eq(node.startTime, time);
        if (!isEqual) {
            const newNode = new NoteNode(time);
            const next = node.next;
            NoteNode.insert(node, newNode, next);
            console.log("created:", node2string(newNode));
            this.jump.updateRange(node, next);
            if ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.chart) {
                this.parent.chart.nnnList.getNode(time).add(newNode);
            }
            return newNode;
        }
        else {
            return node;
        }
    }
    /**
     * @deprecated
     * @param pointer
     * @param beats
     * @param jump
     * @param useEnd
     * @returns
     * /
    movePointerWithGivenJumpArray(pointer: Pointer<NoteNode>, beats: number, jump: JumpArray<NoteNode>, useEnd: boolean=false): [TypeOrTailer<NoteNode>, TypeOrTailer<NoteNode>, number] {
        const distance = NoteTree.distanceFromPointer(beats, pointer, useEnd);
        const original = pointer.node;
        beats >= 4 && console.log(pointer, beats, distance, jump, this)
        if (distance === 0) {
            pointer.beats = beats;
            return [original, original, 0]
        }
        const delta = beats - pointer.beats;
        if (Math.abs(delta) > jump.averageBeats / MINOR_PARTS) {
            const end = jump.getNodeAt(beats);
            console.log("end, beats", end, beats)
            if (!end) {
                debugger;
            }
            pointer.pointTo(end, beats)
            return [original, end, distance]
        }
        let end: TypeOrTailer<NoteNode>;
        if (distance === 1) {
            end = (<NoteNode>original).next // 多谢了个let，特此留念
        } else if (distance === -1) {
            end = "heading" in original.previous ? original : original.previous;
        }
        if (!end) {
            debugger;
        }
        pointer.pointTo(end, beats)
        return [original, end, distance]
    }
    // */
    /**
     * @deprecated
     * /
    movePointerBeforeStart(pointer: Pointer<NoteNode>, beats: number): [TypeOrTailer<NoteNode>, TypeOrTailer<NoteNode>, number] {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.jump)
    }
    /**
     * @deprecated
     * /
    movePointerBeforeEnd(pointer: Pointer<NoteNode>, beats: number): [TypeOrTailer<NoteNode>, TypeOrTailer<NoteNode>, number] {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.jump, true)
    }
    // */
    /**
     * @deprecated
     */
    static distanceFromPointer(beats, pointer, useEnd = false) {
        const note = pointer.node;
        if (!note) {
            debugger;
        }
        if ("tailing" in note) {
            if ("heading" in note.previous) {
                return 0;
            }
            return TimeCalculator.toBeats(useEnd ? note.previous.endTime : note.previous.startTime) < beats ? -1 : 0;
        }
        const previous = note.previous;
        if (!previous)
            debugger;
        const previousBeats = "heading" in previous ? -Infinity : TimeCalculator.toBeats(useEnd ? previous.endTime : previous.startTime);
        const thisBeats = TimeCalculator.toBeats(useEnd ? note.endTime : note.startTime);
        console.log("tpb", thisBeats, previousBeats, beats);
        if (beats < previousBeats) {
            return -1;
        }
        else if (beats > thisBeats) {
            return 1;
        }
        return 0;
    }
    /*
    insertNoteJumpUpdater(note: Note) {
        const {previous, next} = note
        return () => {
            this.jump.updateRange(previous, next)
        }
    }
    */
    /**
     * To find the note's previous(Sibling) if it is to be inserted into the tree
     * @param note
     */
    /*
    findPrev(note: Note): TypeOrHeader<NoteNode> {
        const beats = TimeCalculator.toBeats(note.startTime)
        const destNote = this.getNoteAt(beats, false, this.editorPointer)
        if ("tailing" in destNote) {
            return destNote.previous
        }
        if (TimeCalculator.eq(destNote.startTime, note.startTime)) {
            if (!(this instanceof HoldTree)) {
                return destNote
            }
            let cur = destNote
            while (1) {
                const next = destNote.nextSibling
                if (!next) {
                    break
                }
                if (TimeCalculator.lt(note.endTime, next.endTime)) {
                    return cur
                }
                cur = next
            }
        }
        return destNote.previous
    }
    */
    dumpKPA() {
        const nodes = [];
        let node = this.head.next;
        while (!("tailing" in node)) {
            nodes.push(node.dump());
            node = node.next;
        }
        return {
            speed: this.speed,
            noteNodes: nodes
        };
    }
}
/**
 * HoldNode的链表
 * HN is the abbreviation of HoldNode, which is not individually declared.
 * A NN that contains holds (a type of note) is a HN.
 */
class HNList extends NNList {
    constructor(speed, effectiveBeats) {
        super(speed, effectiveBeats);
    }
    initJump() {
        super.initJump();
        const originalListLength = this.timesWithNotes;
        const effectiveBeats = this.effectiveBeats;
        this.holdTailJump = new JumpArray(this.head, this.tail, originalListLength, effectiveBeats, (node) => {
            if ("tailing" in node) {
                return [null, null];
            }
            if (!node)
                debugger;
            const nextNode = node.next;
            const endTime = "heading" in node ? 0 : TimeCalculator.toBeats(node.endTime);
            return [endTime, nextNode];
        }, (node, beats) => {
            return TimeCalculator.toBeats(node.endTime) >= beats ? false : node.next; // getNodeAt有guard
        });
    }
    /**
     *
     * @param pointer
     * @param beats
     * @returns
     * /
    movePointerBeforeEnd(pointer: Pointer<NoteNode>, beats: number): [TypeOrTailer<NoteNode>, TypeOrTailer<NoteNode>, number] {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.holdTailJump, true);
    }
    //*/
    getNodeAt(beats, beforeEnd = false, pointer) {
        /*
        if (pointer) {
            if (beats !== pointer.beats) {
                if (beforeEnd) {
                    this.movePointerBeforeEnd(pointer, beats)
                } else {
                    this.movePointerBeforeStart(pointer, beats)
                }
            }
            return pointer.node
        }
        */
        return beforeEnd ? this.holdTailJump.getNodeAt(beats) : this.jump.getNodeAt(beats);
    }
    insertNoteJumpUpdater(note) {
        const { previous, next } = note;
        return () => {
            this.jump.updateRange(previous, next);
            this.holdTailJump.updateRange(previous, next);
        };
    }
}
class NNNode {
    constructor(time) {
        this.noteNodes = [];
        this.holdNodes = [];
        this.startTime = time;
    }
    get endTime() {
        let latest = this.startTime;
        for (let index = 0; index < this.holdNodes.length; index++) {
            const element = this.holdNodes[index];
            if (TC.gt(element.endTime, latest)) {
                latest = element.endTime;
            }
        }
        return latest;
    }
    add(node) {
        if (node.isHold) {
            this.holdNodes.push(node);
        }
        else {
            this.noteNodes.push(node);
        }
        node.totalNode = this;
    }
}
/**
 * 二级音符节点链表
 * contains NNNs
 * NNN is the abbreviation of NoteNodeNode, which store note (an element in music game) nodes with same startTime
 * NN is the abbreviation of NoteNode, which stores the notes with the same startTime.
 */
class NNNList {
    constructor(effectiveBeats) {
        this.effectiveBeats = effectiveBeats;
        this.head = {
            "heading": true,
            "next": null,
            "parent": this
        };
        this.tail = {
            "tailing": true,
            "previous": null,
            "parent": this
        };
        this.editorPointer = new Pointer();
        this.editorPointer.pointTo(this.tail, 0);
        NoteNode.connect(this.head, this.tail);
        this.initJump();
    }
    initJump() {
        const originalListLength = this.timesWithNotes || 512;
        /*
        if (!this.effectiveBeats) {
            this.effectiveBeats = TimeCalculator.toBeats(this.tail.previous.endTime)
        }
        */
        const effectiveBeats = this.effectiveBeats;
        this.jump = new JumpArray(this.head, this.tail, originalListLength, effectiveBeats, (node) => {
            if ("tailing" in node) {
                return [null, null];
            }
            const nextNode = node.next;
            const startTime = "heading" in node ? 0 : TimeCalculator.toBeats(node.startTime);
            return [startTime, nextNode];
        }, (note, beats) => {
            return TimeCalculator.toBeats(note.startTime) >= beats ? false : note.next; // getNodeAt有guard
        }
        /*,
        (note: Note) => {
            const prev = note.previous;
            return "heading" in prev ? note : prev
        })*/ );
    }
    movePointerBeforeStart(pointer, beats) {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.jump);
    }
    movePointerBeforeEnd(pointer, beats) {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.jump, true);
    }
    movePointerWithGivenJumpArray(pointer, beats, jump, useEnd = false) {
        const distance = NNList.distanceFromPointer(beats, pointer, useEnd);
        const original = pointer.node;
        if (distance === 0) {
            pointer.beats = beats;
            return [original, original, 0];
        }
        const delta = beats - pointer.beats;
        if (Math.abs(delta) > jump.averageBeats / MINOR_PARTS) {
            const end = jump.getNodeAt(beats);
            if (!end) {
                debugger;
            }
            pointer.pointTo(end, beats);
            return [original, end, distance];
        }
        let end;
        if (distance === 1) {
            end = original.next; // 多谢了个let，特此留念
        }
        else if (distance === -1) {
            end = "heading" in original.previous ? original : original.previous;
        }
        if (!end) {
            debugger;
        }
        pointer.pointTo(end, beats);
        return [original, end, distance];
    }
    getNodeAt(beats, beforeEnd = false, pointer) {
        if (pointer) {
            if (beats !== pointer.beats) {
                if (beforeEnd) {
                    this.movePointerBeforeEnd(pointer, beats);
                }
                else {
                    this.movePointerBeforeStart(pointer, beats);
                }
            }
            if (!pointer.node) {
                debugger;
            }
            return pointer.node;
        }
        return this.jump.getNodeAt(beats);
    }
    getNode(time) {
        const node = this.getNodeAt(TimeCalculator.toBeats(time), false);
        if ("tailing" in node || TimeCalculator.ne(node.startTime, time)) {
            const newNode = new NNNode(time);
            const previous = node.previous;
            NoteNode.insert(previous, newNode, node);
            this.jump.updateRange(previous, node);
            return newNode;
        }
        else {
            return node;
        }
    }
    addNoteNode(noteNode) {
        this.getNode(noteNode.startTime).add(noteNode);
    }
}
class JudgeLine {
    constructor(chart) {
        //this.notes = [];
        this.chart = chart;
        this.eventLayers = [];
        this.children = [];
        this.hnLists = {};
        this.nnLists = {};
        this.groupId = "Default";
        this.texture = "line.png";
        this.cover = true;
        // this.noteSpeeds = {};
    }
    static fromRPEJSON(chart, id, data, templates, timeCalculator) {
        let line = new JudgeLine(chart);
        line.id = id;
        line.name = data.Name;
        line.groupId = chart._lineGroups[data.Group];
        line.cover = Boolean(data.isCover);
        const noteNodeTree = chart.nnnList;
        if (data.notes) {
            const holdTrees = line.hnLists;
            const noteTrees = line.nnLists;
            let notes = data.notes;
            notes.sort((n1, n2) => {
                if (TimeCalculator.ne(n1.startTime, n2.startTime)) {
                    return TimeCalculator.gt(n1.startTime, n2.startTime) ? 1 : -1;
                }
                return TimeCalculator.gt(n1.endTime, n2.endTime) ? -1 : 1; // 这里曾经排反了（
            });
            const len = notes.length;
            let lastTime = [-1, 0, 1];
            // let comboInfoEntity: ComboInfoEntity;
            for (let i = 0; i < len; i++) {
                const note = new Note(notes[i]);
                const tree = line.getNoteTree(note.speed, note.type === NoteType.hold, false);
                const cur = tree.currentPoint;
                const lastHoldTime = "heading" in cur ? [-1, 0, 1] : cur.startTime;
                if (TimeCalculator.eq(lastHoldTime, note.startTime)) {
                    tree.currentPoint.add(note);
                }
                else {
                    const node = new NoteNode(note.startTime);
                    node.add(note); // 这里之前没写，特此留念！
                    NoteNode.connect(tree.currentPoint, node);
                    tree.currentPoint = node;
                    noteNodeTree.addNoteNode(node);
                }
                tree.timesWithNotes++;
            }
            for (let trees of [holdTrees, noteTrees]) {
                for (let speed in trees) {
                    const tree = trees[speed];
                    NoteNode.connect(tree.currentPoint, tree.tail);
                    tree.initJump();
                    // tree.initPointers()
                }
            }
        }
        const eventLayers = data.eventLayers;
        const length = eventLayers.length;
        for (let index = 0; index < length; index++) {
            const layerData = eventLayers[index];
            const layer = {
                moveX: EventNodeSequence.fromRPEJSON(EventType.moveX, layerData.moveXEvents, chart),
                moveY: EventNodeSequence.fromRPEJSON(EventType.moveY, layerData.moveYEvents, chart),
                rotate: EventNodeSequence.fromRPEJSON(EventType.rotate, layerData.rotateEvents, chart),
                alpha: EventNodeSequence.fromRPEJSON(EventType.alpha, layerData.alphaEvents, chart),
                speed: EventNodeSequence.fromRPEJSON(EventType.speed, layerData.speedEvents, chart)
            };
            line.eventLayers[index] = layer;
            for (let type in layer) {
                layer[type].id = `#${id}.${index}.${type}`;
                chart.sequenceMap[layer[type].id] = layer[type];
            }
        }
        // line.updateNoteSpeeds();
        // line.computeNotePositionY(timeCalculator);
        return line;
    }
    static fromKPAJSON(chart, id, data, templates, timeCalculator) {
        let line = new JudgeLine(chart);
        line.id = id;
        line.name = data.Name;
        const nnnList = chart.nnnList;
        for (let isHold of [false, true]) {
            const key = `${isHold ? "hn" : "nn"}Lists`;
            const lists = data[key];
            for (let name in lists) {
                const listData = lists[name];
                const list = NNList.fromKPAJSON(isHold, chart.effectiveBeats, listData, nnnList);
                list.id = name;
                line[key][name] = list;
            }
        }
        for (let child of data.children) {
            line.children.push(JudgeLine.fromKPAJSON(chart, id, child, templates, timeCalculator));
        }
        for (let eventLayerData of data.eventLayers) {
            let eventLayer = {};
            for (let key in eventLayerData) {
                // use "fromRPEJSON" for they have the same logic
                eventLayer[key] = chart.sequenceMap[eventLayerData[key]];
            }
            line.eventLayers.push(eventLayer);
        }
        chart.judgeLines.push(line);
        return line;
    }
    updateSpeedIntegralFrom(beats, timeCalculator) {
        for (let eventLayer of this.eventLayers) {
            eventLayer.speed.updateNodesIntegralFrom(beats, timeCalculator);
        }
    }
    /**
     * startY and endY must not be negative
     * @param beats
     * @param timeCalculator
     * @param startY
     * @param endY
     * @returns
     */
    computeTimeRange(beats, timeCalculator, startY, endY) {
        //return [[0, Infinity]]
        //*
        // 提取所有有变化的时间点
        let times = [];
        let result = [];
        for (let eventLayer of this.eventLayers) {
            const sequence = eventLayer.speed;
            let node = sequence.getNodeAt(beats);
            let endNode;
            while (true) {
                times.push(TimeCalculator.toBeats(node.time));
                if ("tailing" in (endNode = node.next)) {
                    break;
                }
                node = endNode.next;
            }
        }
        times = [...new Set(times)].sort((a, b) => a - b);
        const len = times.length;
        let nextTime = times[0];
        let nextPosY = this.getStackedIntegral(nextTime, timeCalculator);
        let nextSpeed = this.getStackedValue("speed", nextTime, true);
        let range = [undefined, undefined];
        const computeTime = (speed, currentPos, fore) => timeCalculator.secondsToBeats(currentPos / (speed * 120) + timeCalculator.toSeconds(fore));
        for (let i = 0; i < len - 1;) {
            const thisTime = nextTime;
            const thisPosY = nextPosY;
            let thisSpeed = this.getStackedValue("speed", thisTime);
            if (Math.abs(thisSpeed) < 1e-8) {
                thisSpeed = 0; // 不这样做可能导致下面异号判断为真从而死循环
            }
            nextTime = times[i + 1];
            nextPosY = this.getStackedIntegral(nextTime, timeCalculator);
            nextSpeed = this.getStackedValue("speed", nextTime, true);
            if (thisSpeed * nextSpeed < 0) { // 有变号零点，再次切断，保证处理的每个区间单调性
                //debugger;
                nextTime = (nextTime - thisTime) * (0 - thisSpeed) / (nextSpeed - thisSpeed) + thisTime;
                nextSpeed = 0;
                nextPosY = this.getStackedIntegral(nextTime, timeCalculator);
                //debugger
            }
            else {
                i++;
            }
            if (range[0] === undefined) {
                // 变速区间直接全部囊括，匀速要算一下，因为好算
                /*
                设两个时间点的位置为a,b
                开始结束点为s,e
                选中小段一部分在区间内：
                a < s <= b
                或a > e >= b
                全部在区间内
                s <= a <= b
                */
                if (thisPosY < startY && startY <= nextPosY
                    || thisPosY > endY && endY >= nextPosY) {
                    range[0] = thisSpeed !== nextSpeed ? thisTime : computeTime(thisSpeed, (thisPosY < nextPosY ? startY : endY) - thisPosY, thisTime);
                }
                else if (startY <= thisPosY && thisPosY <= endY) {
                    range[0] = thisTime;
                }
            }
            // 要注意这里不能合成双分支if因为想要的Y片段可能在一个区间内
            if (range[0] !== undefined) {
                if (thisPosY < endY && endY <= nextPosY || thisPosY > startY && startY >= nextPosY) {
                    range[1] = thisSpeed !== nextSpeed ? nextTime : computeTime(thisSpeed, (thisPosY > nextPosY ? startY : endY) - thisPosY, thisTime);
                    if (range[0] > range[1]) {
                        console.error("range start should be smaller than range end.");
                        console.log("\nRange is:", range, "thisTime:", thisTime, "thisSpeed:", thisSpeed, "thisPosY:", thisPosY, "\nstartY:", startY, "endY:", endY, "nextTime:", nextTime, "nextPosY:", nextPosY, "nextSpeed:", nextSpeed, "\njudgeLine:", this);
                    }
                    result.push(range);
                    range = [undefined, undefined];
                }
            }
        }
        const thisPosY = nextPosY;
        const thisTime = nextTime;
        const thisSpeed = nextSpeed;
        const inf = thisSpeed > 0 ? Infinity : (thisSpeed < 0 ? -Infinity : thisPosY);
        if (range[0] === undefined) {
            // 变速区间直接全部囊括，匀速要算一下，因为好算
            if (thisPosY < startY && startY <= inf || thisPosY >= endY && endY > inf) {
                range[0] = computeTime(thisSpeed, (thisPosY < inf ? startY : endY) - thisPosY, thisTime);
            }
            else if (thisSpeed === 0) {
                range[0] = 0;
            }
        }
        // 要注意这里不能合成双分支if因为想要的Y片段可能在一个区间内
        if (range[0] !== undefined) {
            if (thisPosY < endY && endY <= inf || thisPosY >= startY && startY > inf) {
                range[1] = computeTime(thisSpeed, (thisPosY > inf ? startY : endY) - thisPosY, thisTime);
                result.push(range);
            }
            else if (thisSpeed === 0) {
                range[1] = Infinity;
                result.push(range);
            }
        }
        return result;
        //*/
    }
    /*
    computeLinePositionY(beats: number, timeCalculator: TimeCalculator)  {
        return this.getStackedIntegral(beats, timeCalculator)
    }
    */
    /**
     *
     * @param beats
     * @param usePrev 如果取到节点，将使用EndNode的值。默认为FALSE
     * @returns
     */
    getValues(beats, usePrev = false) {
        return [
            this.getStackedValue("moveX", beats, usePrev),
            this.getStackedValue("moveY", beats, usePrev),
            this.getStackedValue("rotate", beats, usePrev) / 180 * Math.PI, // 转换为弧度制
            this.getStackedValue("alpha", beats, usePrev),
        ];
    }
    /**
     * 求该时刻坐标，不考虑父线
     * @param beats
     * @param usePrev
     * @returns
     */
    getThisCoordinate(beats, usePrev = false) {
        return [this.getStackedValue("moveX", beats, usePrev),
            this.getStackedValue("moveY", beats, usePrev)];
    }
    /**
     * 求父线锚点坐标，无父线返回原点
     * @param beats
     * @param usePrev
     * @returns
     */
    getBaseCoordinate(beats, usePrev = false) {
        if (!this.father) {
            return [0, 0];
        }
        const baseBase = this.father.getBaseCoordinate(beats, usePrev);
        const base = this.father.getThisCoordinate(beats, usePrev);
        return [baseBase[0] + base[0], baseBase[1] + base[1]];
    }
    getStackedValue(type, beats, usePrev = false) {
        const length = this.eventLayers.length;
        let current = 0;
        for (let index = 0; index < length; index++) {
            const layer = this.eventLayers[index];
            if (!layer) {
                break;
            }
            current += layer[type].getValueAt(beats, usePrev);
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
    /**
     * 获取对应速度和类型的Note树,没有则创建
     */
    getNoteTree(speed, isHold, initsJump) {
        const trees = isHold ? this.hnLists : this.nnLists;
        for (let treename in trees) {
            const tree = trees[treename];
            if (tree.speed == speed) {
                return tree;
            }
        }
        const tree = isHold ? new HNList(speed, this.chart.timeCalculator.secondsToBeats(editor.player.audio.duration)) : new NNList(speed, this.chart.timeCalculator.secondsToBeats(editor.player.audio.duration));
        tree.parent = this;
        if (initsJump)
            tree.initJump();
        const id = (isHold ? "$" : "#") + speed;
        (trees[id] = tree).id = id;
        return tree;
    }
    getNode(note, initsJump) {
        const speed = note.speed;
        const isHold = note.type === NoteType.hold;
        const tree = this.getNoteTree(speed, isHold, initsJump);
        return tree.getNodeOf(note.startTime);
    }
    /**
     *
     * @param eventNodeSequences To Collect the sequences used in this line
     * @returns
     */
    dumpKPA(eventNodeSequences) {
        const children = [];
        for (let line of this.children) {
            children.push(line.dumpKPA(eventNodeSequences));
        }
        const eventLayers = [];
        for (let i = 0; i < this.eventLayers.length; i++) {
            const layer = this.eventLayers[i];
            let layerData = {};
            for (let type in layer) {
                const sequence = layer[type];
                eventNodeSequences.add(sequence);
                layerData[type] = sequence.id;
            }
            eventLayers.push(layerData);
        }
        return {
            id: this.id,
            Name: this.name,
            Texture: "line.png",
            children: children,
            eventLayers: eventLayers,
            hnLists: dictForIn(this.hnLists, (t) => t.dumpKPA()),
            nnLists: dictForIn(this.nnLists, (t) => t.dumpKPA())
        };
    }
    dumpRPE(templateLib) {
        var _a, _b;
        const notes = [];
        for (let lists of [this.hnLists, this.nnLists]) {
            for (let name in lists) {
                const list = lists[name];
                let node = list.head.next;
                while (!("tailing" in node)) {
                    notes.push(...node.notes.map(note => note.dumpRPE()));
                    node = node.next;
                }
            }
        }
        return {
            notes: notes,
            Group: this.groupId,
            Name: this.name,
            Texture: this.texture,
            // alphaControl: this.alphaEvents.map(e => this.dumpControlEvent(e)),
            bpmfactor: 1.0,
            eventLayers: this.eventLayers.map(layer => ({
                moveXEvents: layer.moveX.dumpRPE(templateLib),
                moveYEvents: layer.moveY.dumpRPE(templateLib),
                rotateEvents: layer.rotate.dumpRPE(templateLib),
                alphaEvents: layer.alpha.dumpRPE(templateLib),
                speedEvents: layer.speed.dumpRPE(templateLib)
            })),
            /*
            extended: {
                inclineEvents: this.inclineEvents.dumpRPE()
            },
            */
            father: (_b = (_a = this.father) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : -1,
            isCover: this.cover ? 1 : 0,
            numOfNotes: notes.length,
            // posControl: this.positionControl.map(c => this.dumpControlEvent(c)),
            // sizeControl: this.sizeControl.map(c => this.dumpControlEvent(c)),
            // skewControl: this.skewControl.map(c => this.dumpControlEvent(c)),
            // yControl: this.yControl.map(c => this.dumpControlEvent(c)),
            zOrder: 0
        };
    }
    dumpControlEvent(event) {
        return {
            startTime: event.startTime,
            endTime: event.endTime,
            startValue: event.startValue,
            endValue: event.endValue,
            easing: templateLib.resolveEasing(event.easing)
        };
    }
    updateEffectiveBeats(EB) {
        for (let i = 0; i < this.eventLayers.length; i++) {
            const layer = this.eventLayers[i];
            for (let type in layer) {
                const sequence = layer[type];
                sequence.effectiveBeats = EB;
            }
        }
        for (let lists of [this.nnLists, this.hnLists]) {
            for (let name in lists) {
                lists[name].effectiveBeats = EB;
            }
        }
    }
}
var NoteType;
(function (NoteType) {
    NoteType[NoteType["tap"] = 1] = "tap";
    NoteType[NoteType["drag"] = 4] = "drag";
    NoteType[NoteType["flick"] = 3] = "flick";
    NoteType[NoteType["hold"] = 2] = "hold";
})(NoteType || (NoteType = {}));
/**
 * 相当于 Python 推导式
 * @param arr
 * @param expr
 * @param guard
 * @returns
 */
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
 * 相当于 Python 推导式
 * @param obj
 * @param expr
 * @param guard
 * @returns
 */
function dictForIn(obj, expr, guard) {
    let ret = {};
    for (let key in obj) {
        const each = obj[key];
        if (!guard || guard && guard(each)) {
            ret[key] = expr(each);
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
/*
interface ComboMapping {
    [beat: /*`${number}:${number}/${number}`* / string]: ComboInfoEntity
}
//*/
class Chart {
    constructor() {
        this.timeCalculator = new TimeCalculator();
        this.judgeLines = [];
        this.orphanLines = [];
        this.templateEasingLib = new TemplateEasingLib(this);
        // this.comboMapping = {};
        this.name = "uk";
        this.level = "uk";
        this.offset = 0;
        this.sequenceMap = {};
        this.operationList = new OperationList();
    }
    getEffectiveBeats() {
        console.log(editor.player.audio.src);
        this.effectiveBeats = this.timeCalculator.secondsToBeats(editor.player.audio.duration);
        return this.effectiveBeats;
    }
    static fromRPEJSON(data) {
        let chart = new Chart();
        chart._lineGroups = data.judgeLineGroup;
        chart.bpmList = data.BPMList;
        chart.name = data.META.name;
        chart.level = data.META.level;
        chart.offset = data.META.offset;
        chart.updateCalculator();
        console.log(chart, chart.getEffectiveBeats());
        chart.nnnList = new NNNList(chart.getEffectiveBeats());
        /*
        if (data.envEasings) {
            chart.templateEasingLib.add(...data.envEasings)

        }
        */
        // let line = data.judgeLineList[0];
        const judgeLineList = data.judgeLineList;
        const length = judgeLineList.length;
        const orphanLines = [];
        for (let i = 0; i < length; i++) {
            const lineData = data.judgeLineList[i];
            lineData._id = i;
            if (lineData.father === -1) {
                orphanLines.push(lineData);
                continue;
            }
            const father = data.judgeLineList[lineData.father];
            const children = father.children || (father.children = []);
            children.push(i);
        }
        const readOne = (lineData) => {
            const line = JudgeLine.fromRPEJSON(chart, lineData._id, lineData, chart.templateEasingLib, chart.timeCalculator);
            chart.judgeLines.push(line);
            if (lineData.children) {
                for (let each of lineData.children) {
                    const child = readOne(judgeLineList[each]);
                    child.father = line;
                    line.children.push(child);
                }
            }
            return line;
        };
        for (let lineData of judgeLineList) {
            const line = readOne(lineData);
            chart.orphanLines.push(line);
        }
        return chart;
    }
    static fromKPAJSON(data) {
        const chart = new Chart();
        chart.bpmList = data.bpmList;
        chart.name = data.info.name;
        chart.level = data.info.level;
        chart.offset = data.offset;
        chart.updateCalculator();
        chart.nnnList = new NNNList(chart.getEffectiveBeats());
        const sequences = data.eventNodeSequences;
        const length = data.eventNodeSequences.length;
        for (let i = 0; i < length; i++) {
            const sequence = sequences[i];
            (chart.sequenceMap[sequence.id] = EventNodeSequence.fromRPEJSON(sequence.type, sequence.nodes, chart)).id = sequence.id;
        }
        chart.templateEasingLib.add(data.envEasings);
        chart.templateEasingLib.check();
        for (let lineData of data.orphanLines) {
            const line = JudgeLine.fromKPAJSON(chart, lineData.id, lineData, chart.templateEasingLib, chart.timeCalculator);
            chart.orphanLines.push(line);
        }
        return chart;
    }
    updateCalculator() {
        this.timeCalculator.bpmList = this.bpmList;
        this.timeCalculator.update();
    }
    updateEffectiveBeats(duration) {
        const EB = this.timeCalculator.secondsToBeats(duration);
        for (let i = 0; i < this.judgeLines.length; i++) {
            const judgeLine = this.judgeLines[i];
            judgeLine.updateEffectiveBeats(EB);
        }
    }
    dumpKPA() {
        const eventNodeSequences = new Set();
        const orphanLines = [];
        for (let line of this.orphanLines) {
            orphanLines.push(line.dumpKPA(eventNodeSequences));
        }
        const envEasings = this.templateEasingLib.dump(eventNodeSequences);
        const eventNodeSequenceData = [];
        for (let sequence of eventNodeSequences) {
            eventNodeSequenceData.push(sequence.dump());
        }
        return {
            bpmList: this.timeCalculator.dump(),
            envEasings: envEasings,
            eventNodeSequences: eventNodeSequenceData,
            info: {
                level: this.level,
                name: this.name
            },
            offset: this.offset,
            orphanLines: orphanLines
        };
    }
    dumpRPE() {
        // 完整META字段处理
        const META = {
            RPEVersion: 1, // 默认版本号
            background: '', // 需补充默认值
            charter: '',
            composer: '',
            id: crypto.randomUUID(), // 生成唯一ID
            level: this.level,
            name: this.name,
            offset: this.offset,
            song: this.name // 默认使用chart名称
        };
        // 完整判定线数据处理
        const judgeLineList = this.judgeLines.map(line => line.dumpRPE(this.templateEasingLib));
        // 完整BPM列表结构
        const BPMList = this.timeCalculator.dump();
        return {
            BPMList,
            META,
            judgeLineList,
            judgeLineGroup: []
        };
    }
    getJudgeLineGroups() {
        // 实现分组逻辑（示例实现）
        return Array.from(new Set(this.judgeLines.map(line => line.groupId.toString())));
    }
    /*
    getComboInfoEntity(time: TimeT) {
        const key = toTimeString(time);
        if (key in this.comboMapping) {
            return this.comboMapping[key]
        } else {
            return this.comboMapping[key] = new ComboInfoEntity()
        }
    }
    */
    createNNNode(time) {
        return new NNNode(time);
    }
}
/*
class ComboInfoEntity {
    tap: number;
    drag: number;
    holdHead: number;
    flick: number;
    hold: number;
    real: number;
    fake: number;
    realEnd: number;
    previous: TypeOrHeader<ComboInfoEntity>;
    next: TypeOrTailer<ComboInfoEntity>;
    constructor() {
        this.tap = 0;
        this.drag = 0;
        this.holdHead = 0;
        this.hold = 0;
        this.flick = 0;
        this.real = 0;
        this.fake = 0;
        this.realEnd = 0;
    }
    add(note: Note) {
        if (note.isFake) {
            this.fake++
        } else {
            this.real++
        }
        this[NoteType[note.type]]++
    }
    remove(note: Note) {
        if (note.isFake) {
            this.fake--
        } else {
            this.real--
        }
        
        this[NoteType[note.type]]--
    }
}
*/ 
// interface TemplateEasingLib {[name: string]: TemplateEasing}
/**
 * To compare two arrays
 * @param arr1
 * @param arr2
 * @returns
 */
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
/**
 * 事件节点基类
 * event node.
 * 用于代表事件的开始和结束。（EventStartNode表开始，EventEndNode表结束）
 * Used to represent the starts (EventStartNode) and ends (EventEndNode) of events.
 * 事件指的是判定线在某个时间段上的状态变化。
 * Events is the changing of judge line's state in a certain time.
 * 五种事件类型：移动X，移动Y，旋转，透明度，速度。
 * 5 basic types of events: moveX, moveY, rotate, alpha, speed.
 * 事件节点没有类型，类型由它所属的序列决定。
 * Type is not event nodes' property; it is the property of EventNodeSequence.
 * Events' type is determined by which sequence it belongs to.
 * 与RPE不同的是，KPA使用两个节点来表示一个事件，而不是一个对象。
 * Different from that in RPE, KPA uses two nodes rather than one object to represent an event.
 */
class EventNode {
    constructor(time, value) {
        this.time = time;
        this.value = value;
        this.previous = null;
        this.next = null;
        this.ratio = 1;
        this.easing = linearEasing;
    }
    clone() {
        const ret = new this.constructor([...this.time], this.value);
        ret.easing = this.easing;
        ret.ratio = this.ratio;
        return ret;
    }
    //#region 
    /**
     * gets the easing object from RPEEventData
     * @param data
     * @param left
     * @param right
     * @param templates
     * @returns
     */
    static getEasing(data, left, right, templates) {
        if ((left && right) && (left !== 0.0 || right !== 1.0)) {
            return new SegmentedEasing(EventNode.getEasing(data, 0.0, 1.0, templates), left, right);
        }
        if (data.bezier) {
            let bp = data.bezierPoints;
            let easing = new BezierEasing();
            easing.cp1 = { x: bp[0], y: bp[1] };
            easing.cp2 = { x: bp[2], y: bp[3] };
            return easing;
        }
        else if (typeof data.easingType === "string") {
            return templates.get(data.easingType);
        }
        else if (typeof data.easingType === "number" && data.easingType !== 0) {
            return rpeEasingArray[data.easingType];
        }
        else if (data.start === data.end) {
            return fixedEasing;
        }
        else {
            return linearEasing;
        }
    }
    /**
     * constructs EventStartNode and EventEndNode from EventDataRPE
     * @param data
     * @param templates
     * @returns
     */
    static fromEvent(data, templates) {
        let start = new EventStartNode(data.startTime, data.start);
        let end = new EventEndNode(data.endTime, data.end);
        start.easing = EventNode.getEasing(data, data.easingLeft, data.easingRight, templates);
        EventNode.connect(start, end);
        if (!start.easing) {
            start.easing = linearEasing;
            console.error("No easing found for event:", data, start, "will use linear by default");
        }
        return [start, end];
    }
    static connect(node1, node2) {
        node1.next = node2;
        node2.previous = node1;
        if (node1 && node2) {
            node2.parent = node1.parent;
        }
    }
    /*
    static disconnectStart(node: EventStartNode) {
        (node.previous.previous).next = node.next;
        node.previous.previous = null;
        node.next = null;
    }
    */
    static removeNodePair(endNode, startNode) {
        const prev = endNode.previous;
        const next = startNode.next;
        prev.next = next;
        next.previous = prev;
        endNode.previous = null;
        startNode.next = null;
        return [this.previousStartOfStart(prev), this.nextStartOfEnd(next)];
    }
    static insert(node, tarPrev) {
        const tarNext = tarPrev.next;
        if ("heading" in node.previous) {
            throw new Error("Cannot insert a head node before any node");
        }
        this.connect(tarPrev, node.previous);
        this.connect(node, tarNext);
        return [this.previousStartOfStart(tarPrev), this.nextStartOfEnd(tarNext)];
    }
    /**
     *
     * @param node
     * @returns the next node if it is a tailer, otherwise the next start node
     */
    static nextStartOfStart(node) {
        return "tailing" in node.next ? node.next : node.next.next;
    }
    /**
     *
     * @param node
     * @returns itself if node is a tailer, otherwise the next start node
     */
    static nextStartOfEnd(node) {
        return "tailing" in node ? node : node.next;
    }
    static previousStartOfStart(node) {
        return "heading" in node.previous ? node.previous : node.previous.previous;
    }
    /**
     * It does not return the start node which form an event with it.
     * @param node
     * @returns
     */
    static secondPreviousStartOfEnd(node) {
        return this.previousStartOfStart(node.previous);
    }
    /**
     * 获得一对背靠背的节点。不适用于第一个StartNode
     * @param node
     * @returns
     */
    static getEndStart(node) {
        if (node instanceof EventStartNode) {
            if (node.isFirstStart()) {
                throw new Error("Cannot get previous start node of the first start node");
            }
            return [node.previous, node];
        }
        else if (node instanceof EventEndNode) {
            return [node, node.next];
        }
    }
    get innerEasing() {
        return this.easing instanceof SegmentedEasing ?
            this.easing.easing :
            this.easing;
    }
    /**
     * 设置easing，如果easing是分段缓动，则将分段缓动中的easing设置为innerEasing
     * 不可传入分段缓动，否则会出错
     */
    set innerEasing(easing) {
        if (this.easing instanceof SegmentedEasing) {
            this.easing.easing = easing;
        }
        else {
            this.easing = easing;
        }
    }
}
class EventStartNode extends EventNode {
    constructor(time, value) {
        super(time, value);
    }
    get easingIsSegmented() {
        return this.easing instanceof SegmentedEasing;
    }
    /**
     * 因为是RPE和KPA共用的方法所以easingType可以为字符串
     * @returns
     */
    dump() {
        const endNode = this.next;
        const isSegmented = this.easingIsSegmented;
        const easing = isSegmented ? this.easing.easing : this.easing;
        return {
            bezier: easing instanceof BezierEasing ? 1 : 0,
            bezierPoints: easing instanceof BezierEasing ?
                [easing.cp1.x, easing.cp1.y, easing.cp2.x, easing.cp2.y] : // 修正了这里 cp2.y 的引用
                [0, 0, 0, 0],
            easingLeft: isSegmented ? this.easing.left : 0.0,
            easingRight: isSegmented ? this.easing.right : 1.0,
            // @ts-expect-error
            easingType: easing instanceof TemplateEasing ?
                (easing.name) :
                easing instanceof NormalEasing ?
                    easing.rpeId :
                    null,
            end: endNode.value,
            endTime: endNode.time,
            linkgroup: 0, // 假设默认值为 0
            start: this.value,
            startTime: this.time,
        };
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
    isFirstStart() {
        return this.previous && "heading" in this.previous;
    }
    clone() {
        return super.clone();
    }
    ;
}
class EventEndNode extends EventNode {
    get parent() { return this.previous.parent; }
    set parent(_parent) { }
    constructor(time, value) {
        super(time, value);
    }
    getValueAt(beats) {
        return this.previous.getValueAt(beats);
    }
    clone() {
        return super.clone();
    }
}
var EventType;
(function (EventType) {
    EventType[EventType["moveX"] = 0] = "moveX";
    EventType[EventType["moveY"] = 1] = "moveY";
    EventType[EventType["rotate"] = 2] = "rotate";
    EventType[EventType["alpha"] = 3] = "alpha";
    EventType[EventType["speed"] = 4] = "speed";
    EventType[EventType["easing"] = 5] = "easing";
    EventType[EventType["bpm"] = 6] = "bpm";
})(EventType || (EventType = {}));
/**
 * 为一个链表结构。会有一个数组进行快跳。
 * is the list of event nodes, but not purely start nodes.
 * 结构如下：Header -> (StartNode -> [EndNode) -> (StartNode] -> [EndNode) -> ... -> StartNode] -> Tailer.
 * The structure is like this: Header -> (StartNode -> [EndNode) -> (StartNode] -> [EndNode) -> ... -> StartNode] -> Tailer.
 * 用括号标出的两个节点是一个事件，用方括号标出的两个节点是同一时间点的节点。
 * The each 2 nodes marked by parentheses is an event; the each 2 nodes marked by brackets have the same time.
 * 注意尾节点之前的节点不是一个结束节点，而是一个开始节点，其缓动无效。
 * Note that the node before the tailer is not an end node, but a start node whose easing is meaningless.
 * 就是说最后一个节点后取值，显然会取得这个节点的值，与缓动无关。
 * (i. e. the value after the last event node is its value, not subject to easing, obviously.)
 * 如果尾之前的节点是一个结束节点，那么取值会返回undefined，这是不期望的。
 * If so, the value after that will be undefined, which is not expected.
 * ("so" refers to the assumption that the node before the tailer is an end node)
 * 和NNList和NNNList一样，有跳数组以加速随机读取。
 * Like NNList and NNNList, it has a jump array to speed up random reading.
 * 插入或删除节点时，需要更新跳数组。
 * Remember to update the jump array when inserting or deleting nodes.
 */
class EventNodeSequence {
    // nodes: EventNode[];
    // startNodes: EventStartNode[];
    // endNodes: EventEndNode[];
    // eventTime: Float64Array;
    constructor(type, effectiveBeats) {
        this.type = type;
        this.effectiveBeats = effectiveBeats;
        this.head = {
            heading: true,
            next: null,
            parent: this
        };
        this.tail = {
            tailing: true,
            previous: null,
            parent: this
        };
        this.listLength = 1;
        // this.head = this.tail = new EventStartNode([0, 0, 0], 0)
        // this.nodes = [];
        // this.startNodes = [];
        // this.endNodes = [];
    }
    static fromRPEJSON(type, data, chart) {
        const { templateEasingLib: templates, timeCalculator } = chart;
        const length = data.length;
        // const isSpeed = type === EventType.Speed;
        // console.log(isSpeed)
        const seq = new EventNodeSequence(type, chart.effectiveBeats);
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
    static newSeq(type, effectiveBeats) {
        const sequence = new EventNodeSequence(type, effectiveBeats);
        const node = new EventStartNode([0, 0, 1], type === EventType.speed ? 10 : 0);
        EventNode.connect(sequence.head, node);
        EventNode.connect(node, sequence.tail);
        sequence.initJump();
        return sequence;
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
            console.log(node);
            if ("tailing" in node) {
                return [null, null];
            }
            if ("heading" in node) {
                return [0, node.next];
            }
            const endNode = node.next;
            const time = TimeCalculator.toBeats(endNode.time);
            const nextNode = endNode.next;
            if ("tailing" in nextNode.next) {
                return [time, nextNode.next]; // Tailer代替最后一个StartNode去占位
            }
            else {
                return [time, nextNode];
            }
        }, (node, beats) => {
            return TimeCalculator.toBeats(node.next.time) > beats ? false : node.next.next;
        });
    }
    insert() {
    }
    getNodeAt(beats, usePrev = false) {
        let node = this.jump.getNodeAt(beats);
        if ("tailing" in node) {
            // 最后一个事件节点本身具有无限延伸的特性
            return node.previous;
        }
        if (usePrev && TimeCalculator.toBeats(node.time) === beats) {
            const prev = node.previous;
            if (!("heading" in prev)) {
                node = prev.previous;
            }
        }
        if (TimeCalculator.toBeats(node.time) > beats && beats >= 0) {
            console.warn("Got a node after the given beats. This would only happen when the given beats is negative. Beats and Node:", beats, node);
        }
        return node;
    }
    getValueAt(beats, usePrev = false) {
        return this.getNodeAt(beats, usePrev).getValueAt(beats);
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
    dump() {
        const nodes = [];
        let currentNode = this.head.next;
        while (currentNode && !("tailing" in currentNode.next)) {
            const eventData = currentNode.dump();
            nodes.push(eventData);
            currentNode = currentNode.next.next;
        }
        return {
            type: this.type,
            nodes: nodes,
            id: this.id // 或者使用其他唯一标识符
        };
    }
    /**
     * 将当前序列中所有通过模板缓动引用了其他序列的事件直接展开为被引用的序列内容
     * transform all events that reference other sequences by template easing
     * into the content of the referenced sequence
     * 有点类似于MediaWiki的{{subst:templateName}}
     * @param map 由TemplateEasingLib提供
     * @returns
     */
    substitute(map) {
        if (map.has(this)) {
            return map.get(this);
        }
        let currentNode = this.head.next;
        const newSeq = new EventNodeSequence(this.type, this.effectiveBeats);
        map.set(this, newSeq);
        let currentPos = newSeq.head;
        while (true) {
            if (!currentNode || ("tailing" in currentNode.next)) {
                break;
            }
            const endNode = currentNode.next;
            if (currentNode.easing instanceof TemplateEasing) {
                const quoted = currentNode.easing.eventNodeSequence.substitute(map);
                /** 只对头尾数值相同的模板缓动有效 */
                const ratio = currentNode.ratio;
                const startTime = currentNode.time;
                const endTime = endNode.time;
                const start = currentNode.value;
                const end = endNode.value;
                const delta = end - start;
                const originalDelta = quoted.head.next.value - quoted.tail.previous.value;
                const convert = delta === 0
                    ? (value) => start + value * ratio
                    : (value) => start + value * delta / originalDelta;
                let node = quoted.head.next;
                while (true) {
                    const newNode = new EventStartNode(node.time, convert(node.value));
                }
            }
            else {
                const newStartNode = currentNode.clone();
                const newEndNode = endNode.clone();
                EventNode.connect(currentPos, newStartNode);
                EventNode.connect(newStartNode, newEndNode);
                currentPos = newEndNode;
            }
            currentNode = endNode.next;
        }
    }
}
/**
 *
 */
class BPMStartNode extends EventStartNode {
    constructor(startTime, bpm) {
        super(startTime, bpm);
        this.spb = 60 / bpm;
    }
    getIntegral(beats) {
        return (beats - TimeCalculator.toBeats(this.time)) * this.spb;
    }
    /**
     * may only used with a startnode whose next is not tail
     * @returns
     */
    getFullIntegral() {
        return (TimeCalculator.toBeats(this.next.time) - TimeCalculator.toBeats(this.time)) * this.spb;
    }
}
class BPMEndNode extends EventEndNode {
    constructor(endTime) {
        super(endTime, null);
    }
    // @ts-expect-error
    get value() {
        return this.previous.value;
    }
    set value(val) { }
}
/**
 * 拥有与事件类似的逻辑
 * 每对节点之间代表一个BPM相同的片段
 * 片段之间BPM可以发生改变
 */
class BPMSequence extends EventNodeSequence {
    constructor(bpmList, duration) {
        super(EventType.bpm, null);
        this.duration = duration;
        let curPos = this.head;
        let next = bpmList[0];
        this.listLength = bpmList.length;
        for (let i = 1; i < bpmList.length; i++) {
            const each = next;
            next = bpmList[i];
            const startNode = new BPMStartNode(each.startTime, each.bpm);
            const endNode = new BPMEndNode(next.startTime);
            BPMStartNode.connect(startNode, endNode);
            BPMStartNode.connect(curPos, startNode);
            curPos = endNode;
        }
        const last = new BPMStartNode(next.startTime, next.bpm);
        BPMStartNode.connect(curPos, last);
        BPMStartNode.connect(last, this.tail);
        this.initJump();
    }
    initJump() {
        console.log(this);
        this.effectiveBeats = TimeCalculator.toBeats(this.tail.previous.time);
        super.initJump();
        this.updateSecondJump();
    }
    updateSecondJump() {
        let integral = 0;
        // 计算积分并缓存到BPMNode
        let node = this.head.next;
        while (true) {
            if ("tailing" in node.next) {
                break;
            }
            const endNode = node.next;
            node.cachedStartIntegral = integral;
            integral += node.getFullIntegral();
            node.cachedIntegral = integral;
            node = endNode.next;
        }
        const originalListLength = this.listLength;
        this.secondJump = new JumpArray(this.head, this.tail, originalListLength, this.duration, (node) => {
            if ("tailing" in node) {
                return [null, null];
            }
            if ("heading" in node) {
                return [0, node.next];
            }
            const endNode = node.next;
            const time = node.cachedIntegral;
            const nextNode = endNode.next;
            if ("tailing" in nextNode.next) {
                return [time, nextNode.next]; // Tailer代替最后一个StartNode去占位
            }
            else {
                return [time, nextNode];
            }
        }, (node, seconds) => {
            return node.cachedIntegral > seconds ? false : node.next.next;
        });
    }
    getNodeBySeconds(seconds) {
        const node = this.secondJump.getNodeAt(seconds);
        if ("tailing" in node) {
            return node.previous;
        }
        return node;
    }
}
/**
 * TimeT是用带分数表示的拍数，该元组的第一个元素表示整数部分，第二个元素表示分子，第三个元素表示分母。
 */
class TimeCalculator {
    constructor() {
    }
    update() {
        let bpmList = this.bpmList;
        this.bpmSequence = new BPMSequence(bpmList, this.duration);
    }
    toSeconds(beats) {
        const node = this.bpmSequence.getNodeAt(beats);
        console.log(node);
        const pre = !("heading" in node.previous) ? node.previous.previous.cachedIntegral : 0;
        return node.cachedStartIntegral + node.getIntegral(beats);
    }
    segmentToSeconds(beats1, beats2) {
        let ret = this.toSeconds(beats2) - this.toSeconds(beats1);
        if (ret < 0) {
            console.warn("segmentToSeconds的第二个参数需大于第一个！", "得到的参数：", arguments);
        }
        return ret;
    }
    secondsToBeats(seconds) {
        const node = this.bpmSequence.getNodeBySeconds(seconds);
        console.log("node:", node);
        const beats = (seconds - node.cachedStartIntegral) / node.spb;
        return TimeCalculator.toBeats(node.time) + beats;
    }
    static toBeats(beaT) {
        if (!beaT)
            debugger;
        return beaT[0] + beaT[1] / beaT[2];
    }
    static getDelta(beaT1, beaT2) {
        return this.toBeats(beaT1) - this.toBeats(beaT2);
    }
    static eq(beaT1, beaT2) {
        return beaT1[0] === beaT2[0] && beaT1[1] * beaT2[2] === beaT1[2] * beaT2[1]; // 这里曾经把两个都写成beaT1，特此留念（
    }
    static gt(beaT1, beaT2) {
        return beaT1[0] > beaT2[0] || beaT1[0] === beaT2[0] && beaT1[1] * beaT2[2] > beaT1[2] * beaT2[1];
    }
    static lt(beaT1, beaT2) {
        return beaT1[0] < beaT2[0] || beaT1[0] === beaT2[0] && beaT1[1] * beaT2[2] < beaT1[2] * beaT2[1];
    }
    static ne(beaT1, beaT2) {
        return beaT1[0] !== beaT2[0] || beaT1[1] * beaT2[2] !== beaT1[2] * beaT2[1];
    }
    static sub(beaT1, beaT2) {
        return [beaT1[0] - beaT2[0], beaT1[1] * beaT2[2] - beaT1[2] * beaT2[1], beaT1[2] * beaT2[2]];
    }
    static div(beaT1, beaT2) {
        return [(beaT1[0] * beaT1[2] + beaT1[1]) * beaT2[2], (beaT2[0] * beaT2[2] + beaT2[1]) * beaT1[2]];
    }
    static mul(beaT, ratio) {
        // 将带分数beaT: TimeT乘一个分数[number, number]得到一个新的带分数returnval: TimeT，不要求这个带分数分子不超过分母，但所有的数都是整数
        // （输入的两个元组都是整数元组）
        const [numerator, denominator] = ratio;
        const b0nume = beaT[0] * numerator;
        const remainder = b0nume % denominator;
        if (remainder === 0) {
            return [b0nume / denominator, beaT[1] * numerator, beaT[2] * denominator];
        }
        else {
            return [Math.floor(b0nume / denominator), beaT[1] * numerator + remainder * beaT[2], beaT[2] * denominator];
        }
    }
    /**
     * 原地规范化时间元组，但仍然返回这个元组，方便使用
     * validate TimeT in place
     * @param beaT
     */
    static validate(beaT) {
        if (beaT === undefined || beaT[2] === 0) {
            throw new Error("Invalid time" + beaT.valueOf());
        }
        if (beaT[1] >= beaT[2]) {
            const quotient = Math.floor(beaT[1] / beaT[2]);
            const remainder = beaT[1] % beaT[2];
            beaT[0] += quotient;
            beaT[1] = remainder;
        }
        else if (beaT[1] < 0) {
            const quotient = Math.floor(beaT[1] / beaT[2]);
            const remainder = beaT[2] + beaT[1] % beaT[2];
            beaT[0] += quotient;
            beaT[1] = remainder;
        }
        if (beaT[1] === 0) {
            beaT[2] = 1;
            return beaT;
        }
        const gcd = this.gcd(beaT[2], beaT[1]);
        if (gcd > 1) {
            beaT[1] /= gcd;
            beaT[2] /= gcd;
        }
        return beaT;
    }
    static gcd(a, b) {
        if (a === 0 || b === 0) {
            return 0;
        }
        while (b !== 0) {
            const r = a % b;
            a = b;
            b = r;
        }
        return a;
    }
    dump() {
        return this.bpmList;
    }
}
const TC = TimeCalculator;
if (globalThis.document) {
    var settings = new Settings();
    var editor = new Editor();
}
else {
    const tc = new TimeCalculator;
    tc.bpmList = [
        {
            "bpm": 200.0,
            "startTime": [0, 0, 1]
        },
        {
            "bpm": 180.0,
            "startTime": [276, 0, 1]
        },
        {
            "bpm": 170.0,
            "startTime": [280, 0, 1]
        },
        {
            "bpm": 150.0,
            "startTime": [284, 0, 1]
        },
        {
            "bpm": 130.0,
            "startTime": [286, 0, 1]
        },
        {
            "bpm": 100.0,
            "startTime": [288, 0, 1]
        },
        {
            "bpm": 90.0,
            "startTime": [292, 0, 1]
        },
        {
            "bpm": 95.0,
            "startTime": [293, 0, 1]
        },
        {
            "bpm": 100.0,
            "startTime": [294, 0, 1]
        },
        {
            "bpm": 105.0,
            "startTime": [295, 0, 1]
        },
        {
            "bpm": 110.00000000000001,
            "startTime": [296, 0, 1]
        },
        {
            "bpm": 115.0,
            "startTime": [297, 0, 1]
        },
        {
            "bpm": 120.0,
            "startTime": [298, 0, 1]
        },
        {
            "bpm": 130.0,
            "startTime": [299, 0, 1]
        },
        {
            "bpm": 140.0,
            "startTime": [300, 0, 1]
        },
        {
            "bpm": 150.0,
            "startTime": [332, 0, 1]
        },
        {
            "bpm": 155.0,
            "startTime": [340, 0, 1]
        },
        {
            "bpm": 160.0,
            "startTime": [348, 0, 1]
        },
        {
            "bpm": 165.0,
            "startTime": [356, 0, 1]
        },
        {
            "bpm": 170.0,
            "startTime": [364, 0, 1]
        },
        {
            "bpm": 175.0,
            "startTime": [366, 0, 1]
        },
        {
            "bpm": 180.0,
            "startTime": [368, 0, 1]
        },
        {
            "bpm": 185.0,
            "startTime": [370, 0, 1]
        },
        {
            "bpm": 190.0,
            "startTime": [372, 0, 1]
        },
        {
            "bpm": 195.0,
            "startTime": [374, 0, 1]
        },
        {
            "bpm": 200.0,
            "startTime": [376, 0, 1]
        },
        {
            "bpm": 205.0,
            "startTime": [378, 0, 1]
        },
        {
            "bpm": 210.0,
            "startTime": [380, 0, 1]
        },
        {
            "bpm": 215.0,
            "startTime": [382, 0, 1]
        },
        {
            "bpm": 220.00000000000003,
            "startTime": [384, 0, 1]
        },
        {
            "bpm": 225.0,
            "startTime": [386, 0, 1]
        },
        {
            "bpm": 230.0,
            "startTime": [388, 0, 1]
        },
        {
            "bpm": 235.00000000000003,
            "startTime": [390, 0, 1]
        },
        {
            "bpm": 240.0,
            "startTime": [392, 0, 1]
        },
        {
            "bpm": 245.0,
            "startTime": [394, 0, 1]
        },
        {
            "bpm": 250.0,
            "startTime": [396, 0, 1]
        },
        {
            "bpm": 255.0,
            "startTime": [398, 0, 1]
        },
        {
            "bpm": 260.0,
            "startTime": [400, 0, 1]
        },
        {
            "bpm": 265.0,
            "startTime": [402, 0, 1]
        },
        {
            "bpm": 270.0,
            "startTime": [404, 0, 1]
        },
        {
            "bpm": 275.0,
            "startTime": [406, 0, 1]
        },
        {
            "bpm": 280.0,
            "startTime": [408, 0, 1]
        },
        {
            "bpm": 285.0,
            "startTime": [410, 0, 1]
        },
        {
            "bpm": 290.0,
            "startTime": [412, 0, 1]
        },
        {
            "bpm": 300.0,
            "startTime": [414, 0, 1]
        },
        {
            "bpm": 310.0,
            "startTime": [416, 0, 1]
        },
        {
            "bpm": 320.0,
            "startTime": [418, 0, 1]
        },
        {
            "bpm": 330.0,
            "startTime": [420, 0, 1]
        },
        {
            "bpm": 340.0,
            "startTime": [422, 0, 1]
        },
        {
            "bpm": 350.0,
            "startTime": [424, 0, 1]
        },
        {
            "bpm": 100.0,
            "startTime": [461, 0, 1]
        },
        {
            "bpm": 110.00000000000001,
            "startTime": [462, 0, 1]
        },
        {
            "bpm": 120.0,
            "startTime": [463, 0, 1]
        },
        {
            "bpm": 130.0,
            "startTime": [464, 0, 1]
        },
        {
            "bpm": 140.0,
            "startTime": [465, 0, 1]
        },
        {
            "bpm": 150.0,
            "startTime": [465, 1, 2]
        },
        {
            "bpm": 160.0,
            "startTime": [466, 0, 1]
        },
        {
            "bpm": 170.0,
            "startTime": [466, 1, 2]
        },
        {
            "bpm": 180.0,
            "startTime": [467, 0, 1]
        },
        {
            "bpm": 190.0,
            "startTime": [467, 1, 2]
        },
        {
            "bpm": 200.0,
            "startTime": [468, 0, 1]
        },
        {
            "bpm": 150.0,
            "startTime": [570, 0, 1]
        }
    ];
    tc.duration = 1145;
    console.log(tc);
    tc.update();
    console.log(tc);
    console.log(tc.toSeconds(2), tc.toSeconds(301));
    console.log(tc.secondsToBeats(100));
}
//# sourceMappingURL=test.js.map