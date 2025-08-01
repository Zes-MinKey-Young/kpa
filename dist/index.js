var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const VERSION = "1.6.1";
/**
 * @author Zes Minkey Young
 * This file is an alternative for those users whose browsers don't support ESnext.Collection
 */
var _a, _b, _c;
Set.prototype.union = (_a = Set.prototype.union) !== null && _a !== void 0 ? _a : function (other) {
    const it = other.keys();
    return new Set([...this, ...{ [Symbol.iterator]() { return it; } }]);
};
Set.prototype.intersection = (_b = Set.prototype.intersection) !== null && _b !== void 0 ? _b : function (other) {
    return new Set([...this].filter(x => other.has(x)));
};
Set.prototype.difference = (_c = Set.prototype.difference) !== null && _c !== void 0 ? _c : function (other) {
    return new Set([...this].filter(x => !other.has(x)));
};
const DEFAULT_TEMPLATE_LENGTH = 16;
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
        const timeDelta = easingRight - easingLeft;
        const delta = rightValue - leftValue;
        console.log("lr", easingLeft, leftValue, easingRight, rightValue);
        return (t) => (this.getValue(easingLeft + timeDelta * t) - leftValue) / delta;
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
/**
 * @immutable
 */
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
    replace(easing) {
        return new SegmentedEasing(easing, this.left, this.right);
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
        drawBezierCurve(context, startX, startY, endX, endY, startX + cp1x * timeDelta, startY + cp1y * delta, startX + cp2x * timeDelta, startY + cp2y * delta);
    }
}
/**
 * 模板缓动
 * to implement an easing with an eventNodeSequence.
 * 这是受wikitext的模板概念启发的。
 * This is inspired by the "template" concept in wikitext.
 */
class TemplateEasing extends Easing {
    constructor(name, sequence) {
        super();
        this.eventNodeSequence = sequence;
        this.name = name;
    }
    getValue(t) {
        const seq = this.eventNodeSequence;
        let delta = this.valueDelta;
        const frac = seq.getValueAt(t * seq.effectiveBeats) - this.headValue;
        return delta === 0 ? frac : frac / delta;
    }
    get valueDelta() {
        let seq = this.eventNodeSequence;
        return seq.tail.previous.value - seq.head.next.value;
    }
    get headValue() {
        return this.eventNodeSequence.head.next.value;
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
        this.equation = equation;
        // @ts-ignore
        this._getValue = new Function("t", equation);
    }
    getValue(t) {
        var _a;
        return (_a = this._getValue(t)) !== null && _a !== void 0 ? _a : 0;
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
    constructor() {
        this.easings = {};
    }
    getOrNew(name) {
        if (this.easings[name]) {
            return this.easings[name];
        }
        else {
            const easing = new TemplateEasing(name, EventNodeSequence.newSeq(EventType.easing, DEFAULT_TEMPLATE_LENGTH));
            easing.eventNodeSequence.id = "*" + name;
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
    implement(name, sequence) {
        this.easings[name].eventNodeSequence = sequence;
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
                console.warn(`未实现的缓动：${key}`);
            }
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
}
const linearEasing = new NormalEasing(linear, linearLine);
const fixedEasing = new NormalEasing((x) => (x === 1 ? 1 : 0));
const easingMap = {
    "fixed": { out: fixedEasing, in: fixedEasing, inout: fixedEasing },
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
fixedEasing.funcType = "fixed";
fixedEasing.easeType = "in";
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
// type EndBeats = number;
const MIN_LENGTH = 128;
const MAX_LENGTH = 1024;
const MINOR_PARTS = 16;
const breakpoint = () => { debugger; };
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
    constructor(head, tail, originalListLength, effectiveBeats, endNextFn, nextFn, resolveLastNode = (node) => node
    // goPrev: (node: T) => T
    ) {
        this.endNextFn = endNextFn;
        this.nextFn = nextFn;
        this.resolveLastNode = resolveLastNode;
        this.header = head;
        this.tailer = tail;
        // const originalListLength = this.listLength
        const listLength = Math.max(MIN_LENGTH, Math.min(originalListLength * 4, MAX_LENGTH));
        const averageBeats = Math.pow(2, Math.ceil(Math.log2(effectiveBeats / listLength)));
        const exactLength = Math.ceil(effectiveBeats / averageBeats);
        // console.log(exactLength, listLength, averageBeats, exactLength)
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
        const { endNextFn, effectiveBeats, resolveLastNode } = this;
        lastNode = resolveLastNode(lastNode);
        console.log(firstNode, lastNode);
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
            // console.log(jumpIndex, arrayForIn(minorArray, (n) => node2string(n)).join("]["))
            // console.log("cur:", currentNode)
        };
        const jumpArray = this.array;
        const averageBeats = this.averageBeats;
        const minorBeats = averageBeats / MINOR_PARTS;
        let [previousEndTime, currentNode] = endNextFn(firstNode);
        let jumpIndex = Math.floor(previousEndTime / averageBeats); // 这里写漏了特此留念
        for (;;) {
            let [endTime, nextNode] = endNextFn(currentNode);
            // console.log("----Node:", currentNode, "next:", nextNode, "endTime:", endTime, "previousEndTime:", previousEndTime )
            if (endTime === null) {
                endTime = effectiveBeats;
            }
            // Hold树可能会不出现这种情况，故需特别考虑
            if (endTime >= previousEndTime) {
                while (endTime >= (jumpIndex + 1) * averageBeats) {
                    if (Array.isArray(jumpArray[jumpIndex])) {
                        fillMinor(previousEndTime, endTime);
                    }
                    else {
                        try {
                            // console.log(jumpIndex, currentNode)
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
            // console.log("minor", arrayForIn(minor, (n) => node2string(n)))
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
    getPreviousOf(node, beats) {
        const jumpAverageBeats = this.averageBeats;
        const jumpPos = Math.floor(beats / jumpAverageBeats);
        const rest = beats - jumpPos * jumpAverageBeats;
        const nextFn = this.nextFn;
        for (let i = jumpPos; i >= 0; i--) {
            let canBeNodeOrArray = this.array[i];
            if (Array.isArray(canBeNodeOrArray)) {
                const minorIndex = Math.floor(rest / (jumpAverageBeats / MINOR_PARTS)) - 1;
                for (let j = minorIndex; j >= 0; j--) {
                    const minorNode = canBeNodeOrArray[j];
                    if (minorNode !== node) {
                        return minorNode;
                    }
                }
            }
        }
        return this.header;
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
/**
 * @author Zes M Young
 */
const NNLIST_Y_OFFSET_HALF_SPAN = 100;
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
const rgb2hex = (rgb) => {
    return rgb[0] << 16 | rgb[1] << 8 | rgb[2];
};
const hex2rgb = (hex) => {
    return [hex >> 16, hex >> 8 & 0xFF, hex & 0xFF];
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
        var _a, _b, _c, _d, _e;
        this.above = data.above === 1;
        this.alpha = (_a = data.alpha) !== null && _a !== void 0 ? _a : 255;
        this.endTime = data.type === NoteType.hold ? data.endTime : data.startTime;
        this.isFake = Boolean(data.isFake);
        this.positionX = data.positionX;
        this.size = (_b = data.size) !== null && _b !== void 0 ? _b : 1.0;
        this.speed = (_c = data.speed) !== null && _c !== void 0 ? _c : 1.0;
        this.startTime = data.startTime;
        this.type = data.type;
        this.visibleTime = data.visibleTime;
        // @ts-expect-error
        this.yOffset = (_d = data.absoluteYOffset) !== null && _d !== void 0 ? _d : data.yOffset * this.speed;
        // @ts-expect-error 若data是RPE数据，则为undefined，无影响。
        // 当然也有可能是KPA数据但是就是没有给
        this.visibleBeats = data.visibleBeats;
        this.tint = data.tint ? rgb2hex(data.tint) : undefined;
        this.tintHitEffects = data.tintHitEffects ? rgb2hex(data.tintHitEffects) : undefined;
        this.judgeSize = (_e = data.judgeSize) !== null && _e !== void 0 ? _e : this.size;
        /*
        this.previous = null;
        this.next = null;
        this.previousSibling = null;
        this.nextSibling = null;
        */
    }
    static fromKPAJSON(data, timeCalculator) {
        const note = new Note(data);
        if (!note.visibleBeats) {
            note.computeVisibleBeats(timeCalculator);
        }
        return note;
    }
    computeVisibleBeats(timeCalculator) {
        if (!this.visibleTime || this.visibleTime >= 90000) {
            this.visibleBeats = Infinity;
            return;
        }
        const hitBeats = TimeCalculator.toBeats(this.startTime);
        const hitSeconds = timeCalculator.toSeconds(hitBeats);
        const visabilityChangeSeconds = hitSeconds - this.visibleTime;
        const visabilityChangeBeats = timeCalculator.secondsToBeats(visabilityChangeSeconds);
        this.visibleBeats = hitBeats - visabilityChangeBeats;
    }
    /**
     *
     * @param offset
     * @returns
     */
    clone(offset) {
        const data = this.dumpKPA();
        data.startTime = TimeCalculator.add(data.startTime, offset);
        data.endTime = TimeCalculator.add(data.endTime, offset); // 踩坑
        return new Note(data);
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
    dumpRPE(timeCalculator) {
        let visibleTime;
        if (this.visibleBeats !== Infinity) {
            const beats = TimeCalculator.toBeats(this.startTime);
            this.visibleBeats = timeCalculator.segmentToSeconds(beats - this.visibleBeats, beats);
        }
        else {
            visibleTime = 99999.0;
        }
        return {
            above: this.above ? 1 : 0,
            alpha: this.alpha,
            endTime: this.endTime,
            isFake: this.isFake ? 1 : 0,
            positionX: this.positionX,
            size: this.size,
            startTime: this.startTime,
            type: this.type,
            visibleTime: visibleTime,
            yOffset: this.yOffset / this.speed,
            speed: this.speed,
            tint: this.tint !== undefined ? hex2rgb(this.tint) : undefined,
            tintHitEffects: this.tint !== undefined ? hex2rgb(this.tintHitEffects) : undefined
        };
    }
    dumpKPA() {
        return {
            above: this.above ? 1 : 0,
            alpha: this.alpha,
            endTime: this.endTime,
            isFake: this.isFake ? 1 : 0,
            positionX: this.positionX,
            size: this.size,
            startTime: this.startTime,
            type: this.type,
            visibleBeats: this.visibleBeats,
            yOffset: this.yOffset / this.speed,
            /** 新KPAJSON认为YOffset就应该是个绝对的值，不受速度影响 */
            /** 但是有历史包袱，所以加字段 */
            absoluteYOffset: this.yOffset,
            speed: this.speed,
            tint: this.tint !== undefined ? hex2rgb(this.tint) : undefined,
            tintHitEffects: this.tint !== undefined ? hex2rgb(this.tintHitEffects) : undefined,
            judgeSize: this.judgeSize && this.judgeSize !== 1.0 ? this.judgeSize : undefined,
        };
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
        this.id = NoteNode.count++;
    }
    static fromKPAJSON(data, timeCalculator) {
        const node = new NoteNode(data.startTime);
        for (let noteData of data.notes) {
            const note = Note.fromKPAJSON(noteData, timeCalculator);
            node.add(note);
        }
        return node;
    }
    get isHold() {
        return this.parentSeq instanceof HNList;
    }
    get endTime() {
        if (this.notes.length === 0) {
            return this.startTime; // 改了半天这个逻辑本来就是对的()
        }
        return (this.notes.length === 0 || this.notes[0].type !== NoteType.hold) ? this.startTime : this.notes[0].endTime;
    }
    add(note) {
        if (!TimeCalculator.eq(note.startTime, this.startTime)) {
            console.warn("Wrong addition!");
        }
        this.notes.push(note);
        note.parentNode = this;
        this.sort(this.notes.length - 1);
    }
    sort(index) {
        if (typeof index !== "number") {
            index = this.notes.indexOf(index);
            if (index === -1) {
                return;
            }
        }
        if (!this.isHold) {
            return;
        }
        const { notes } = this;
        const note = notes[index];
        for (let i = index; i > 0; i--) {
            const prev = notes[i - 1];
            if (TimeCalculator.lt(prev.endTime, note.endTime)) {
                // swap
                notes[i] = prev;
                notes[i - 1] = note;
            }
            else {
                break;
            }
        }
        for (let i = index; i < notes.length - 1; i++) {
            const next = notes[i + 1];
            if (TimeCalculator.gt(next.endTime, note.endTime)) {
                // swap
                notes[i] = next;
                notes[i + 1] = note;
            }
            else {
                break;
            }
        }
    }
    remove(note) {
        this.notes.splice(this.notes.indexOf(note), 1);
        note.parentNode = null;
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
            note2.parentSeq = note1.parentSeq;
        }
    }
    static insert(note1, inserted, note2) {
        this.connect(note1, inserted);
        this.connect(inserted, note2);
    }
    dump() {
        return {
            notes: this.notes.map(note => note.dumpKPA()),
            startTime: this.startTime
        };
    }
}
NoteNode.count = 0;
class NNList {
    constructor(speed, medianYOffset = 0, effectiveBeats) {
        this.speed = speed;
        this.medianYOffset = medianYOffset;
        this.head = {
            heading: true,
            next: null,
            parentSeq: this
        };
        this.currentPoint = this.head;
        // this.currentBranchPoint = <NoteNode>{startTime: [-1, 0, 1]}
        this.tail = {
            tailing: true,
            previous: null,
            parentSeq: this
        };
        this.timesWithNotes = 0;
        /*
        this.renderPointer = new Pointer();
        this.hitPointer = new Pointer();
        this.editorPointer = new Pointer()
        */
        this.effectiveBeats = effectiveBeats;
    }
    /** 此方法永远用于最新KPAJSON */
    static fromKPAJSON(isHold, effectiveBeats, data, nnnList, timeCalculator) {
        const list = isHold ? new HNList(data.speed, data.medianYOffset, effectiveBeats) : new NNList(data.speed, data.medianYOffset, effectiveBeats);
        const nnlength = data.noteNodes.length;
        let cur = list.head;
        for (let i = 0; i < nnlength; i++) {
            const nnData = data.noteNodes[i];
            const nn = NoteNode.fromKPAJSON(nnData, timeCalculator);
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
            // console.log("created:", node2string(newNode))
            this.jump.updateRange(node, next);
            // console.log("pl", this.parentLine)
            if ((_a = this.parentLine) === null || _a === void 0 ? void 0 : _a.chart) {
                this.parentLine.chart.nnnList.getNode(time).add(newNode);
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
    constructor(speed, medianYOffset, effectiveBeats) {
        super(speed, medianYOffset, effectiveBeats);
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
    getNodeAt(beats, beforeEnd = false) {
        return beforeEnd ? this.holdTailJump.getNodeAt(beats) : this.jump.getNodeAt(beats);
    }
    // unused
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
            "parentSeq": this
        };
        this.tail = {
            "tailing": true,
            "previous": null,
            "parentSeq": this
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
        const node = this.getNodeAt(TimeCalculator.toBeats(time), false).previous;
        if ("heading" in node || TimeCalculator.ne(node.startTime, time)) {
            const newNode = new NNNode(time);
            const next = node.next;
            NoteNode.insert(node, newNode, next);
            this.jump.updateRange(node, next);
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
/**
 * 奇谱发生器使用中心来表示一个NNList的y值偏移范围，这个函数根据yOffset算出对应中心值
 * @param yOffset
 * @returns
 */
const getRangeMedian = (yOffset) => {
    return (Math.floor((Math.abs(yOffset) - NNLIST_Y_OFFSET_HALF_SPAN) / NNLIST_Y_OFFSET_HALF_SPAN / 2) * (NNLIST_Y_OFFSET_HALF_SPAN * 2) + NNLIST_Y_OFFSET_HALF_SPAN * 2) * Math.sign(yOffset);
};
class JudgeLine {
    constructor(chart) {
        this.hnLists = new Map();
        this.nnLists = new Map();
        this.eventLayers = [];
        this.children = new Set();
        this.name = "Untitled";
        //this.notes = [];
        this.chart = chart;
        this.texture = "line.png";
        this.cover = true;
        // this.noteSpeeds = {};
    }
    static fromRPEJSON(chart, id, data, templates, timeCalculator) {
        let line = new JudgeLine(chart);
        line.id = id;
        line.name = data.Name;
        chart.judgeLineGroups[data.Group].add(line);
        line.cover = Boolean(data.isCover);
        const noteNodeTree = chart.nnnList;
        if (data.notes) {
            const holdLists = line.hnLists;
            const noteLists = line.nnLists;
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
                note.computeVisibleBeats(timeCalculator);
                if (note.speed === 0) {
                    debugger;
                }
                const tree = line.getNNList(note.speed, note.yOffset, note.type === NoteType.hold, false);
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
            for (let trees of [holdLists, noteLists]) {
                for (const [_, list] of trees) {
                    NoteNode.connect(list.currentPoint, list.tail);
                    list.initJump();
                    // tree.initPointers()
                }
            }
        }
        const eventLayers = data.eventLayers;
        const length = eventLayers.length;
        const createSequence = (type, events, index) => {
            if (events) {
                const sequence = EventNodeSequence.fromRPEJSON(type, events, chart);
                sequence.id = `#${id}.${index}.${EventType[type]}`;
                chart.sequenceMap.set(sequence.id, sequence);
                return sequence;
            }
        };
        for (let index = 0; index < length; index++) {
            const layerData = eventLayers[index];
            if (!layerData) {
                continue;
            }
            const layer = {
                moveX: createSequence(EventType.moveX, layerData.moveXEvents, index),
                moveY: createSequence(EventType.moveY, layerData.moveYEvents, index),
                rotate: createSequence(EventType.rotate, layerData.rotateEvents, index),
                alpha: createSequence(EventType.alpha, layerData.alphaEvents, index),
                speed: createSequence(EventType.speed, layerData.speedEvents, index)
            };
            line.eventLayers[index] = layer;
        }
        // line.updateNoteSpeeds();
        // line.computeNotePositionY(timeCalculator);
        return line;
    }
    static fromKPAJSON(isOld, chart, id, data, templates, timeCalculator) {
        let line = new JudgeLine(chart);
        line.id = id;
        line.name = data.Name;
        chart.judgeLineGroups[data.group].add(line);
        const nnnList = chart.nnnList;
        for (let isHold of [false, true]) {
            const key = `${isHold ? "hn" : "nn"}Lists`;
            const lists = data[key];
            for (let name in lists) {
                const listData = lists[name];
                if (!isOld) {
                    const list = NNList.fromKPAJSON(isHold, chart.effectiveBeats, listData, nnnList, timeCalculator);
                    list.parentLine = line;
                    list.id = name;
                    line[key].set(name, list);
                }
                else {
                    line.getNNListFromOldKPAJSON(line[key], name, isHold, chart.effectiveBeats, listData, nnnList, timeCalculator);
                }
            }
        }
        for (let child of data.children) {
            line.children.add(JudgeLine.fromKPAJSON(isOld, chart, child.id, child, templates, timeCalculator));
        }
        for (let eventLayerData of data.eventLayers) {
            let eventLayer = {};
            for (let key in eventLayerData) {
                // use "fromRPEJSON" for they have the same logic
                eventLayer[key] = chart.sequenceMap.get(eventLayerData[key]);
            }
            line.eventLayers.push(eventLayer);
        }
        chart.judgeLines.push(line);
        return line;
    }
    getNNListFromOldKPAJSON(lists, namePrefix, isHold, effectiveBeats, listData, nnnList, timeCalculator) {
        const speed = listData.speed;
        const constructor = isHold ? HNList : NNList;
        const createdLists = new Set();
        const getOrCreateNNList = (median, name) => {
            if (lists.has(name)) {
                return lists.get(name);
            }
            const list = new constructor(speed, median, effectiveBeats);
            list.id = name;
            list.parentLine = this;
            lists.set(name, list);
            createdLists.add(list);
            return list;
        };
        const nns = listData.noteNodes;
        const len = nns.length;
        for (let i = 0; i < len; i++) {
            const nodeData = nns[i];
            const l = nodeData.notes.length;
            for (let j = 0; j < l; j++) {
                const noteData = nodeData.notes[j];
                const note = new Note(noteData);
                const median = getRangeMedian(note.yOffset);
                const list = getOrCreateNNList(median, namePrefix + "o" + median);
                const cur = list.currentPoint;
                if (!note.visibleBeats) {
                    note.computeVisibleBeats(timeCalculator);
                }
                if (!("heading" in cur) && TC.eq(noteData.startTime, cur.startTime)) {
                    cur.add(note);
                }
                else {
                    const node = new NoteNode(noteData.startTime);
                    node.add(note);
                    nnnList.addNoteNode(node);
                    NoteNode.connect(cur, node);
                    list.currentPoint = node;
                }
            }
        }
        for (const list of createdLists) {
            NoteNode.connect(list.currentPoint, list.tail);
            list.initJump();
        }
    }
    updateSpeedIntegralFrom(beats, timeCalculator) {
        var _a;
        for (let eventLayer of this.eventLayers) {
            (_a = eventLayer === null || eventLayer === void 0 ? void 0 : eventLayer.speed) === null || _a === void 0 ? void 0 : _a.updateNodesIntegralFrom(beats, timeCalculator);
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
        console.log("invoked");
        //return [[0, Infinity]]
        //*
        // 提取所有有变化的时间点
        let times = [];
        let result = [];
        for (let eventLayer of this.eventLayers) {
            const sequence = eventLayer === null || eventLayer === void 0 ? void 0 : eventLayer.speed;
            if (!sequence) {
                continue;
            }
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
        // console.log(times)
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
            // console.log(thisSpeed, nextSpeed, thisSpeed * nextSpeed < 0, i, [...result])
            if (thisSpeed * nextSpeed < 0) { // 有变号零点，再次切断，保证处理的每个区间单调性
                //debugger;
                nextTime = (nextTime - thisTime) * (0 - thisSpeed) / (nextSpeed - thisSpeed) + thisTime;
                nextSpeed = 0;
                nextPosY = this.getStackedIntegral(nextTime, timeCalculator);
                //debugger
            }
            else {
                // console.log("i++")
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
        const thisSpeed = this.getStackedValue("speed", thisTime);
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
    getMatrix(beats, usePrev = false) {
        const base = this.father.getMatrix(beats, usePrev);
        const x = this;
    }
    getStackedValue(type, beats, usePrev = false) {
        const length = this.eventLayers.length;
        let current = 0;
        for (let index = 0; index < length; index++) {
            const layer = this.eventLayers[index];
            if (!layer || !layer[type]) {
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
            if (!layer || !layer.speed) {
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
    getNNList(speed, yOffset, isHold, initsJump) {
        const lists = isHold ? this.hnLists : this.nnLists;
        const medianYOffset = getRangeMedian(yOffset);
        for (const [_, list] of lists) {
            if (list.speed === speed && list.medianYOffset === medianYOffset) {
                return list;
            }
        }
        const list = isHold ? new HNList(speed, medianYOffset, this.chart.timeCalculator.secondsToBeats(editor.player.audio.duration)) : new NNList(speed, medianYOffset, this.chart.timeCalculator.secondsToBeats(editor.player.audio.duration));
        list.parentLine = this;
        NoteNode.connect(list.head, list.tail);
        if (initsJump)
            list.initJump();
        const id = (isHold ? "$" : "#") + speed + "o" + medianYOffset;
        lists.set(id, list);
        list.id = id;
        return list;
    }
    getNode(note, initsJump) {
        const speed = note.speed;
        const yOffset = note.yOffset;
        const isHold = note.type === NoteType.hold;
        const tree = this.getNNList(speed, yOffset, isHold, initsJump);
        return tree.getNodeOf(note.startTime);
    }
    /**
     *
     * @param eventNodeSequences To Collect the sequences used in this line
     * @returns
     */
    dumpKPA(eventNodeSequences, judgeLineGroups) {
        const children = [];
        for (let line of this.children) {
            children.push(line.dumpKPA(eventNodeSequences, judgeLineGroups));
        }
        const eventLayers = [];
        for (let i = 0; i < this.eventLayers.length; i++) {
            const layer = this.eventLayers[i];
            if (!layer)
                continue;
            let layerData = {};
            for (let type in layer) {
                const sequence = layer[type];
                if (!sequence)
                    continue;
                eventNodeSequences.add(sequence);
                layerData[type] = sequence.id;
            }
            eventLayers.push(layerData);
        }
        const hnListsData = {};
        const nnListsData = {};
        for (let [id, list] of this.hnLists) {
            hnListsData[id] = list.dumpKPA();
        }
        for (let [id, list] of this.nnLists) {
            nnListsData[id] = list.dumpKPA();
        }
        return {
            group: judgeLineGroups.indexOf(this.group),
            id: this.id,
            Name: this.name,
            Texture: "line.png",
            children: children,
            eventLayers: eventLayers,
            hnLists: hnListsData,
            nnLists: nnListsData
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
            for (let [_, list] of lists) {
                list.effectiveBeats = EB;
            }
        }
    }
    static checkinterdependency(judgeLine, toBeFather) {
        let descendantsAndSelf = new Set();
        const add = (line) => {
            descendantsAndSelf.add(line);
            for (let child of line.children) {
                add(child);
            }
        };
        add(judgeLine);
        return descendantsAndSelf.has(toBeFather);
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
class Chart {
    constructor() {
        this.judgeLines = [];
        this.bpmList = [];
        this.timeCalculator = new TimeCalculator();
        this.orphanLines = [];
        // comboMapping: ComboMapping;
        this.name = "unknown";
        this.level = "unknown";
        this.offset = 0;
        this.templateEasingLib = new TemplateEasingLib;
        this.sequenceMap = new Map();
        /**  */
        this.judgeLineGroups = [];
        this.modified = false;
    }
    getEffectiveBeats() {
        const effectiveBeats = this.timeCalculator.secondsToBeats(this.duration);
        console.log(effectiveBeats);
        this.effectiveBeats = effectiveBeats;
        return this.effectiveBeats;
    }
    static fromRPEJSON(data, duration) {
        let chart = new Chart();
        chart.judgeLineGroups = data.judgeLineGroup.map(group => new JudgeLineGroup(group));
        chart.bpmList = data.BPMList;
        chart.name = data.META.name;
        chart.level = data.META.level;
        chart.offset = data.META.offset;
        chart.duration = duration;
        chart.rpeChartingTime = data.chartTime ? Math.round(data.chartTime / 60) : 0;
        chart.chartingTime = 0;
        chart.updateCalculator();
        console.log(chart, chart.getEffectiveBeats());
        chart.nnnList = new NNNList(chart.getEffectiveBeats());
        /*
        if (data.envEasings) {
            chart.templateEasingLib.add(...data.envEasings)

        }
        */
        // let line = data.judgeLineList[0];
        const judgeLineDataList = data.judgeLineList;
        const judgeLineList = judgeLineDataList.map((lineData, id) => JudgeLine.fromRPEJSON(chart, id, lineData, chart.templateEasingLib, chart.timeCalculator));
        const length = judgeLineList.length;
        chart.judgeLines = judgeLineList;
        for (let i = 0; i < length; i++) {
            const data = judgeLineDataList[i];
            const line = judgeLineList[i];
            const father = data.father === -1 ? null : judgeLineList[data.father];
            if (father) {
                father.children.add(line);
            }
            else {
                chart.orphanLines.push(line);
            }
        }
        return chart;
    }
    static fromKPAJSON(data) {
        var _a, _b;
        const chart = new Chart();
        chart.bpmList = data.bpmList;
        chart.duration = data.duration;
        chart.name = data.info.name;
        chart.level = data.info.level;
        chart.offset = data.offset;
        chart.judgeLineGroups = data.judgeLineGroups.map(group => new JudgeLineGroup(group));
        chart.chartingTime = (_a = data.chartTime) !== null && _a !== void 0 ? _a : 0;
        chart.rpeChartingTime = (_b = data.rpeChartTime) !== null && _b !== void 0 ? _b : 0;
        chart.updateCalculator();
        chart.nnnList = new NNNList(chart.getEffectiveBeats());
        const envEasings = data.envEasings;
        const len = envEasings.length;
        for (let i = 0; i < len; i++) {
            const easingData = envEasings[i];
            chart.templateEasingLib.require(easingData.name);
        }
        const sequences = data.eventNodeSequences;
        const length = data.eventNodeSequences.length;
        for (let i = 0; i < length; i++) {
            const seqData = sequences[i];
            const sequence = EventNodeSequence.fromRPEJSON(seqData.type, seqData.events, chart, seqData.endValue);
            sequence.id = seqData.id;
            chart.sequenceMap.set(sequence.id, sequence);
        }
        for (let i = 0; i < len; i++) {
            const easingData = envEasings[i];
            chart.templateEasingLib.implement(easingData.name, chart.sequenceMap.get(easingData.content));
        }
        chart.templateEasingLib.check();
        const isOld = !data.version || data.version < 150;
        for (let lineData of data.orphanLines) {
            const line = JudgeLine.fromKPAJSON(isOld, chart, lineData.id, lineData, chart.templateEasingLib, chart.timeCalculator);
            chart.orphanLines.push(line);
        }
        chart.judgeLines.sort((a, b) => a.id - b.id);
        return chart;
    }
    updateCalculator() {
        this.timeCalculator.bpmList = this.bpmList;
        this.timeCalculator.duration = this.duration;
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
            orphanLines.push(line.dumpKPA(eventNodeSequences, this.judgeLineGroups));
        }
        const envEasings = this.templateEasingLib.dump(eventNodeSequences);
        const eventNodeSequenceData = [];
        for (let sequence of eventNodeSequences) {
            eventNodeSequenceData.push(sequence.dump());
        }
        return {
            version: VERSION,
            duration: this.duration,
            bpmList: this.timeCalculator.dump(),
            envEasings: envEasings,
            eventNodeSequences: eventNodeSequenceData,
            info: {
                level: this.level,
                name: this.name
            },
            offset: this.offset,
            orphanLines: orphanLines,
            judgeLineGroups: this.judgeLineGroups.map(g => g.name),
            chartTime: this.chartingTime,
            rpeChartTime: this.rpeChartingTime
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
class JudgeLineGroup {
    constructor(name) {
        this.name = name;
        this.judgeLines = [];
    }
    add(judgeLine) {
        // 加入之前已经按照ID升序排列
        // 加入时将新判定线插入到正确位置
        if (judgeLine.group) {
            judgeLine.group.remove(judgeLine);
        }
        judgeLine.group = this;
        // 找到正确的位置插入，保持按ID升序排列
        for (let i = 0; i < this.judgeLines.length; i++) {
            if (this.judgeLines[i].id > judgeLine.id) {
                this.judgeLines.splice(i, 0, judgeLine);
                return;
            }
        }
        // 如果没有找到比它大的ID，则插入到末尾
        this.judgeLines.push(judgeLine);
    }
    remove(judgeLine) {
        const index = this.judgeLines.indexOf(judgeLine);
        if (index !== -1) {
            this.judgeLines.splice(index, 1);
        }
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
        this.value = value !== null && value !== void 0 ? value : 0;
        this.previous = null;
        this.next = null;
        this.easing = linearEasing;
    }
    clone(offset) {
        const ret = new this.constructor(offset ? TimeCalculator.add(this.time, offset) : this.time, this.value);
        ret.easing = this.easing;
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
            easing.cp1 = new Coordinate(bp[0], bp[1]);
            easing.cp2 = new Coordinate(bp[2], bp[3]);
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
            node2.parentSeq = node1.parentSeq;
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
        node.parentSeq = node.previous.parentSeq;
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
    static nextStartInJumpArray(node) {
        if (node.next.next.isLastStart()) {
            return node.next.next.next;
        }
        else {
            return node.next.next;
        }
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
    static getStartEnd(node) {
        if (node instanceof EventStartNode) {
            return [node, node.next];
        }
        else if (node instanceof EventEndNode) {
            return [node.previous, node];
        }
        else {
            throw new Error("Invalid node type");
        }
    }
    static setToNewOrderedArray(dest, set) {
        const nodes = [...set];
        nodes.sort((a, b) => TimeCalculator.gt(a.time, b.time) ? 1 : -1);
        const offset = TimeCalculator.sub(dest, nodes[0].time);
        return [nodes, nodes.map(node => node.clonePair(offset))];
    }
    static belongToSequence(nodes, sequence) {
        for (let each of nodes) {
            if (each.parentSeq !== sequence) {
                return false;
            }
        }
        return true;
    }
    /**
     * 检验这些节点对是不是连续的
     * 如果不是不能封装为模板缓动
     * @param nodes 有序开始节点数组，必须都是带结束节点的（背靠背）（第一个除外）
     * @returns
     */
    static isContinuous(nodes) {
        const l = nodes.length;
        let nextNode = nodes[0];
        for (let i = 0; i < l - 1; i++) {
            const node = nextNode;
            nextNode = nodes[i + 1];
            if (node.next !== nextNode.previous) {
                return false;
            }
        }
        return true;
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
            this.easing.replace(easing);
        }
        else {
            this.easing = easing;
        }
    }
}
/*
enum EventNodeType {
    first,
    middle,
    last
}


interface StartNextMap {
    [EventNodeType.first]: EventEndNode;
    [EventNodeType.middle]: EventEndNode;
    [EventNodeType.last]: Tailer<EventStartNode<EventNodeType.last>>;
}
interface StartPreviousMap {
    [EventNodeType.first]: Header<EventStartNode<EventNodeType.first>>;
    [EventNodeType.middle]: EventEndNode;
    [EventNodeType.last]: EventEndNode;
}
*/
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
        var _a;
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
                    (_a = easing.rpeId) !== null && _a !== void 0 ? _a : 1 :
                    null,
            end: easing === fixedEasing ? this.value : endNode.value,
            endTime: endNode.time,
            linkgroup: 0, // 假设默认值为 0
            start: this.value,
            startTime: this.time,
        };
    }
    /**
     * 仅用于编译至RPE时解决最后一个StartNode的问题
     * 限最后一个StartNode使用
     * @returns
     */
    dumpAsLast() {
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
            end: this.value,
            endTime: TimeCalculator.add(this.time, [1, 0, 1]),
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
        if (valueDelta === 0) {
            return this.value;
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
    isLastStart() {
        return this.next && "tailing" in this.next;
    }
    clone(offset) {
        return super.clone(offset);
    }
    ;
    clonePair(offset) {
        const endNode = !("heading" in this.previous) ? this.previous.clone(offset) : new EventEndNode(this.time, this.value);
        const startNode = this.clone(offset);
        EventNode.connect(endNode, startNode);
        return startNode;
    }
    ;
    drawCurve(context, startX, startY, endX, endY, matrix) {
        if (!(this.easing instanceof ParametricEquationEasing)) {
            return this.easing.drawCurve(context, startX, startY, endX, endY);
        }
        const getValue = (ratio) => {
            return matrix.ymul(0, this.easing.getValue(ratio));
        };
        const timeDelta = endX - startX;
        let last = startY;
        context.beginPath();
        context.moveTo(startX, last);
        for (let t = 4; t <= timeDelta; t += 4) {
            const ratio = t / timeDelta;
            const curPosY = getValue(ratio);
            context.lineTo(startX + t, curPosY);
            last = curPosY;
        }
        context.stroke();
    }
}
/*
type AnyStartNode = EventStartNode<EventNodeType.first>
                  | EventStartNode<EventNodeType.middle>
                  | EventStartNode<EventNodeType.last>
                  */
class EventEndNode extends EventNode {
    get parentSeq() { var _a; return (_a = this.previous) === null || _a === void 0 ? void 0 : _a.parentSeq; }
    set parentSeq(_parent) { }
    constructor(time, value) {
        super(time, value);
    }
    getValueAt(beats) {
        return this.previous.getValueAt(beats);
    }
    clone(offset) {
        return super.clone(offset);
    }
}
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
            parentSeq: this
        };
        this.tail = {
            tailing: true,
            previous: null,
            parentSeq: this
        };
        this.listLength = 1;
        // this.head = this.tail = new EventStartNode([0, 0, 0], 0)
        // this.nodes = [];
        // this.startNodes = [];
        // this.endNodes = [];
    }
    static fromRPEJSON(type, data, chart, endValue) {
        var _a, _b, _c;
        const { templateEasingLib: templates, timeCalculator } = chart;
        const length = data.length;
        // const isSpeed = type === EventType.Speed;
        // console.log(isSpeed)
        const seq = new EventNodeSequence(type, type === EventType.easing ? TimeCalculator.toBeats(data[length - 1].endTime) : chart.effectiveBeats);
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
        const last = lastEnd;
        let tail;
        tail = new EventStartNode((_a = last.time) !== null && _a !== void 0 ? _a : [0, 0, 1], endValue !== null && endValue !== void 0 ? endValue : last.value);
        EventNode.connect(last, tail);
        // @ts-expect-error
        // last can be a header, in which case easing is undefined.
        // then we use the easing that initialized in the EventStartNode constructor.
        tail.easing = (_c = (_b = last.previous) === null || _b === void 0 ? void 0 : _b.easing) !== null && _c !== void 0 ? _c : tail.easing;
        tail.cachedIntegral = lastIntegral;
        EventNode.connect(tail, seq.tail);
        seq.listLength = listLength;
        seq.initJump();
        return seq;
    }
    /**
     * 生成一个新的事件节点序列，仅拥有一个节点。
     * 需要分配ID！！！！！！
     * @param type
     * @param effectiveBeats
     * @returns
     */
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
        if (this.head.next === this.tail.previous) {
            return;
        }
        this.jump = new JumpArray(this.head, this.tail, originalListLength, effectiveBeats, (node) => {
            // console.log(node)
            if ("tailing" in node) {
                return [null, null];
            }
            if ("heading" in node) {
                if ("tailing" in node.next.next) {
                    return [0, node.next.next];
                }
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
            return TimeCalculator.toBeats(node.next.time) > beats ? false : EventNode.nextStartInJumpArray(node);
        }, (node) => {
            return node.next && "tailing" in node.next ? node.next : node;
        }
        /*(node: EventStartNode) => {
            const prev = node.previous;
            return "heading" in prev ? node : prev.previous;
        }*/
        );
    }
    updateJump(from, to) {
        if (!this.jump || this.effectiveBeats !== this.jump.effectiveBeats) {
            this.initJump();
        }
        this.jump.updateRange(from, to);
    }
    insert() {
    }
    getNodeAt(beats, usePrev = false) {
        var _a;
        let node = ((_a = this.jump) === null || _a === void 0 ? void 0 : _a.getNodeAt(beats)) || this.head.next;
        if ("tailing" in node) {
            if (usePrev) {
                return node.previous.previous.previous;
            }
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
            events: nodes,
            id: this.id,
            endValue: currentNode.value
        };
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
        return (beats - TimeCalculator.toBeats(this.time)) * 60 / this.value;
    }
    /**
     * may only used with a startnode whose next is not tail
     * @returns
     */
    getFullIntegral() {
        return (TimeCalculator.toBeats(this.next.time) - TimeCalculator.toBeats(this.time)) * 60 / this.value;
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
        if (this.effectiveBeats !== 0) {
            super.initJump(); // 为0可以跳过jumpArray，用不到
            // 只有一个BPM片段就会这样
        }
        this.updateSecondJump();
    }
    updateSecondJump() {
        let integral = 0;
        // 计算积分并缓存到BPMNode
        let node = this.head.next;
        while (true) {
            node.cachedStartIntegral = integral;
            if ("tailing" in node.next) {
                break;
            }
            const endNode = node.next;
            integral += node.getFullIntegral();
            node.cachedIntegral = integral;
            node = endNode.next;
        }
        node.cachedStartIntegral = integral;
        if (this.effectiveBeats === 0) {
            return;
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
    updateJump(from, to) {
        super.updateJump(from, to);
        this.updateSecondJump();
    }
    getNodeBySeconds(seconds) {
        if (this.effectiveBeats === 0) {
            return this.tail.previous;
        }
        const node = this.secondJump.getNodeAt(seconds);
        if ("tailing" in node) {
            return node.previous;
        }
        return node;
    }
    dumpBPM() {
        let cur = this.head.next;
        const ret = [];
        while (true) {
            ret.push({
                bpm: cur.value,
                startTime: cur.time
            });
            const end = cur.next;
            if ("tailing" in end) {
                break;
            }
            cur = end.next;
        }
        return ret;
    }
}
/**
 * @alias TC
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
        // console.log("node:", node)
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
    static add(beaT1, beaT2) {
        return [beaT1[0] + beaT2[0], beaT1[1] * beaT2[2] + beaT1[2] * beaT2[1], beaT1[2] * beaT2[2]];
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
    static validateIp(beaT) {
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
        return this.bpmSequence.dumpBPM();
    }
}
const TC = TimeCalculator;
/**
 * Z is just like jQuery, but it's much simpler.
 * It only contains one element, which is enough in most cases.
 * In contrast, jQuery can contain multiple elements, which makes the type inference miserable sometimes.
 * When you need to create a new element, unlike jQuery, you do not need to wrap the tag name with <>.
 * just use $("div"), for example.
 * The type parameter is the tagname instead of the class of the element,
 * which settles the problem that in jQuery the editor does not infer $("<tagName>") as a specific HTMLElement Type.
 * For example, $("<input>") in jQuery cannot be directly inferred as JQuery<HTMLInputElement>.
 * But $("input") in Z is obviously inferred as Z<"input">.
 * Supports chaining, like jQuery.
 */
class Z extends EventTarget {
    get parent() {
        return Z.from(this.element.parentElement);
    }
    constructor(type, newElement = true) {
        super();
        if (newElement)
            this.element = document.createElement(type);
    }
    get clientWidth() {
        return this.element.clientWidth;
    }
    get clientHeight() {
        return this.element.clientHeight;
    }
    html(str) {
        this.element.innerHTML = str;
        return this;
    }
    text(str) {
        const childNodes = this.element.childNodes;
        if (childNodes.length === 1 && childNodes[0].nodeType === Node.TEXT_NODE) {
            childNodes[0].nodeValue = str;
        }
        else {
            this.element.replaceChildren(str);
        }
        return this;
    }
    addClass(...classes) {
        this.element.classList.add(...classes);
        return this;
    }
    removeClass(...classes) {
        this.element.classList.remove(...classes);
    }
    release() {
        return this.element;
    }
    attr(name, value) {
        if (value) {
            this.element.setAttribute(name, value);
            return this;
        }
        else {
            return this.element.getAttribute(name);
        }
    }
    css(name, value) {
        if (value) {
            this.element.style[name] = value;
        }
    }
    append(...$elements) {
        const elements = new Array($elements.length);
        for (let index = 0; index < $elements.length; index++) {
            const $element = $elements[index];
            elements[index] = $element instanceof Z ? $element.release() : $element;
        }
        this.element.append(...elements);
        return this;
    }
    after($e) {
        this.parent.element.insertBefore($e.element, this.element.nextSibling);
    }
    before($e) {
        this.parent.element.insertBefore($e.element, this.element);
    }
    insertAfter($e) {
        this.parent.element.insertBefore(this.element, $e.element.nextSibling);
    }
    insertBefore($e) {
        this.parent.element.insertBefore(this.element, $e.element);
    }
    appendTo(element) {
        element.append(this.element);
        return this;
    }
    onClick(callback) {
        this.element.addEventListener("click", callback);
        return this;
    }
    onInput(callback) {
        this.element.addEventListener("input", callback);
        return this;
    }
    on(eventType, callback) {
        this.element.addEventListener(eventType, callback);
        return this;
    }
    show() {
        this.element.style.display = "";
    }
    hide() {
        this.element.style.display = "none";
    }
    remove() {
        this.element.remove();
    }
    static from(element) {
        const $ele = new Z(element.localName);
        $ele.element = element;
        return $ele;
    }
    appendMass(callback) {
        const fragment = document.createDocumentFragment();
        this.append = (...$elements) => {
            fragment.append(...$elements.map(element => element instanceof Z ? element.element : element));
            return this;
        };
        callback();
        delete this.append;
        this.element.append(fragment);
        return this;
    }
}
const $ = (strOrEle) => typeof strOrEle === "string" ? new Z(strOrEle) : Z.from(strOrEle);
/*
 * The classes below encapsulate some common UI Gadgets in KPA.
 */
class ZButton extends Z {
    get disabled() { return this._disabled; }
    set disabled(val) {
        if (val !== this._disabled) {
            this._disabled = val;
            if (val) {
                this.addClass("disabled");
            }
            else {
                this.removeClass("disabled");
            }
        }
    }
    constructor(text) {
        super("div");
        this.addClass("button");
        this.text(text);
    }
    onClick(callback) {
        this.element.addEventListener("click", (e) => {
            if (this.disabled) {
                return;
            }
            callback(e);
        });
        return this;
    }
}
class ZSwitch extends ZButton {
    get checked() {
        return this.element.classList.contains("checked");
    }
    set checked(val) {
        if (val !== this.checked) {
            this.element.classList.toggle("checked", val);
            console.log("switch checked:", val, this.checked);
            this.dispatchEvent(new ZValueChangeEvent());
        }
    }
    constructor(text) {
        super(text);
        this.addClass("switch");
        this.onClick(() => {
            this.checked = !this.checked;
            this.dispatchEvent(new Event("clickChange"));
        });
    }
    whenClickChange(callback) {
        this.addEventListener("clickChange", (event) => {
            callback(this.checked, event);
        });
        return this;
    }
}
class ZValueChangeEvent extends Event {
    constructor() {
        super("valueChange");
    }
}
class ZInputBox extends Z {
    get disabled() { return this.element.disabled; }
    set disabled(val) {
        this.element.disabled = val;
    }
    constructor(defaultValue) {
        super("input");
        this.addClass("input-box");
        this.attr("type", "text");
        this.element.addEventListener("focusout", () => {
            this.dispatchEvent(new ZValueChangeEvent());
        });
        if (defaultValue)
            this.element.value = defaultValue;
    }
    getValue() {
        return this.element.value;
    }
    getInt() {
        if (!this.element.value) {
            this.element.value = this.lastInt + "";
            return this.lastInt;
        }
        return this.lastInt = parseInt(this.element.value);
    }
    getNum() {
        if (!this.element.value) {
            this.element.value = this.lastNum + "";
            return this.lastNum;
        }
        return this.lastNum = parseFloat(this.element.value);
    }
    setValue(val) {
        this.element.value = val;
        return this;
    }
    whenValueChange(callback) {
        this.addEventListener("valueChange", (event) => {
            const changesValue = callback(this.getValue(), event) !== false;
            if (!changesValue) {
                this.element.value = this._lastValue;
            }
            else {
                this._lastValue = this.element.value;
            }
        });
        return this;
    }
}
/**
 * An input box with up and down arrows, which can and can only be used to input numbers.
 */
class ZArrowInputBox extends Z {
    constructor() {
        super("div");
        this.scale = 1;
        this.$input = new ZInputBox();
        this.$up = $("div")
            .addClass("arrow-up")
            .onClick(() => {
            this.setValue(this.getValue() + this.scale);
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.$down = $("div")
            .addClass("arrow-down")
            .onClick(() => {
            console.log(this.getValue());
            this.setValue(this.getValue() - this.scale);
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.addClass("arrow-input-box");
        this.append(this.$up, this.$down, this.$input);
        this.$input.whenValueChange(() => {
            this.dispatchEvent(new ZValueChangeEvent());
        });
    }
    getValue() {
        return this.$input.getNum();
    }
    setValue(val) {
        this.$input.setValue(val + "");
        return this;
    }
    onChange(callback) {
        this.addEventListener("valueChange", (e) => callback(this.getValue(), e));
        return this;
    }
}
/**
 * An input box for mixed fractions, which is convenient for inputting time (beats) in music.
 */
class ZFractionInput extends Z {
    constructor() {
        super("span");
        this.addClass("fraction-input");
        this.$int = new ZInputBox().addClass("integer");
        this.$nume = new ZInputBox().addClass("nume");
        this.$deno = new ZInputBox().addClass("deno");
        this.$deno.whenValueChange(() => {
            if (this.$deno.getValue() == "0") {
                this.$deno.setValue("1");
            }
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.$int.whenValueChange(() => {
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.$nume.whenValueChange(() => {
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.append(this.$int, this.$nume, $("div").addClass("line"), this.$deno);
    }
    getValue() {
        return [this.$int.getInt() || 0, this.$nume.getInt() || 0, this.$deno.getInt() || 1];
    }
    setValue(time) {
        this.$int.setValue(time[0] + "");
        this.$nume.setValue(time[1] + "");
        this.$deno.setValue(time[2] + "");
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(val) {
        this._disabled = val;
        [this.$int, this.$deno, this.$nume].forEach(($e) => $e.disabled = val);
    }
    onChange(callback) {
        this.addEventListener("valueChange", (e) => {
            callback(this.getValue());
        });
    }
}
class BoxOption {
    constructor(text, onChangedTo, onChanged) {
        this.onChangedTo = onChangedTo;
        this.onChanged = onChanged;
        this.$elementMap = new Map();
        this.text = text;
    }
    getElement(box) {
        if (!this.$elementMap.has(box)) {
            this.$elementMap.set(box, $("div").addClass("box-option").text(this.text));
        }
        return this.$elementMap.get(box);
    }
}
class EditableBoxOption extends BoxOption {
    constructor(text, onEdited, onChangedTo, onChanged, editsItself) {
        super(text, onChangedTo, onChanged);
        this.onEdited = onEdited;
        this.editsItself = editsItself === undefined ? true : editsItself;
    }
    edit(text) {
        this.onEdited(this, text);
        if (this.editsItself) {
            this.text = text;
        }
    }
}
class ZDropdownOptionBox extends Z {
    get value() {
        return this._value;
    }
    set value(option) {
        this.$value.text(option.text);
        this._value = option;
    }
    constructor(options, up = false) {
        super("div");
        this.callbacks = [];
        this.addClass("dropdown-option-box");
        if (up) {
            this.addClass("up");
        }
        this.$value = $("div");
        const span = $("span");
        this.append(span, this.$value);
        this.$optionList = $("div").addClass("dropdown-option-list");
        const optionList = this.$optionList;
        span.append(optionList);
        this.options = options;
        const length = options.length;
        for (let i = 0; i < length; i++) {
            const $element = options[i].getElement(this);
            optionList.append($element);
        }
        optionList.onClick((event) => {
            const target = event.target;
            if (target instanceof HTMLDivElement) {
                if (target !== this.value.getElement(this).release()) {
                    let option;
                    for (let i = 0; i < options.length; i++) {
                        option = options[i];
                        if (option.getElement(this).release() === target) {
                            break;
                        }
                    }
                    this.value.onChanged && this.value.onChanged(this.value);
                    option.onChangedTo && option.onChangedTo(option);
                    this.value = option;
                    this.callbacks.forEach(f => f(option.text));
                }
            }
        });
        this.value = options[0];
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(val) {
        if (this._disabled === val) {
            return;
        }
        this._disabled = val;
        if (val) {
            this.addClass("disabled");
        }
        else {
            this.removeClass("disabled");
        }
    }
    onChange(callback) {
        this.callbacks.push(callback);
        return this;
    }
    appendOption(option) {
        this.options.push(option);
        this.$optionList.append(option.getElement(this));
        return this;
    }
    replaceWithOptions(options) {
        this.options.splice(0, this.options.length)
            .forEach((option) => option.getElement(this).remove());
        this.options.push(...options);
        for (let i = 0; i < options.length; i++) {
            this.$optionList.append(options[i].getElement(this));
        }
        return this;
    }
}
class ZEditableDropdownOptionBox extends Z {
    get value() {
        return this._value;
    }
    set value(option) {
        this.$value.setValue(option.text);
        this._value = option;
    }
    /**
     *
     * @param options
     * @param up determine whether the dropdown is up or down
     */
    constructor(options, up = false) {
        super("div");
        this.callbacks = [];
        this.addClass("dropdown-option-box");
        if (up) {
            this.addClass("up");
        }
        this.$value = new ZInputBox();
        this.$value.onInput(() => {
            this.value.edit(this.$value.getValue());
        });
        this.$value.css("width", "100%");
        const span = $("span");
        this.append(span, this.$value);
        this.$optionList = $("div").addClass("dropdown-option-list");
        const optionList = this.$optionList;
        span.append(optionList);
        this.options = options;
        const length = options.length;
        for (let i = 0; i < length; i++) {
            const $element = options[i].getElement(this);
            optionList.append($element);
        }
        optionList.onClick((event) => {
            const target = event.target;
            if (target instanceof HTMLDivElement) {
                if (target !== this.value.getElement(this).release()) {
                    let option;
                    for (let i = 0; i < options.length; i++) {
                        option = options[i];
                        if (option.getElement(this).release() === target) {
                            break;
                        }
                    }
                    this.value.onChanged && this.value.onChanged(this.value);
                    option.onChangedTo && option.onChangedTo(option);
                    this.value = option;
                    this.callbacks.forEach(f => f(option.text));
                }
            }
        });
        this.value = options[0];
    }
    get disabled() {
        return this._disabled;
    }
    set disabled(val) {
        if (this._disabled === val) {
            return;
        }
        this._disabled = val;
        if (val) {
            this.addClass("disabled");
        }
        else {
            this.removeClass("disabled");
        }
    }
    onChange(callback) {
        this.callbacks.push(callback);
        return this;
    }
    appendOption(option) {
        this.options.push(option);
        this.$optionList.append(option.getElement(this));
        return this;
    }
    replaceWithOptions(options) {
        this.options.splice(0, this.options.length)
            .forEach((option) => option.getElement(this).remove());
        this.options.push(...options);
        for (let i = 0; i < options.length; i++) {
            this.$optionList.append(options[i].getElement(this));
        }
        return this;
    }
}
class ZMemorableBox extends ZEditableDropdownOptionBox {
    constructor(options, up = false) {
        super([], up);
        for (let i = 0; i < options.length; i++) {
            this.appendString(options[i]);
        }
    }
    constructOption(str) {
        return new EditableBoxOption(str, (o, text) => { this.appendString(text); }, (_) => undefined, (_) => undefined, false);
    }
    appendString(str) {
        this.appendOption(this.constructOption(str));
    }
}
var EasingOptions;
(function (EasingOptions) {
    EasingOptions.IN = new BoxOption("in");
    EasingOptions.OUT = new BoxOption("out");
    EasingOptions.IO = new BoxOption("inout");
    EasingOptions.easeTypeOptions = [EasingOptions.IN, EasingOptions.OUT, EasingOptions.IO];
    EasingOptions.easeTypeOptionsMapping = { in: EasingOptions.IN, out: EasingOptions.OUT, inout: EasingOptions.IO };
    EasingOptions.FIXED = new BoxOption("fixed");
    EasingOptions.LINEAR = new BoxOption("linear");
    EasingOptions.SINE = new BoxOption("sine");
    EasingOptions.QUAD = new BoxOption("quad");
    EasingOptions.CUBIC = new BoxOption("cubic");
    EasingOptions.QUART = new BoxOption("quart");
    EasingOptions.QUINT = new BoxOption("quint");
    EasingOptions.EXPO = new BoxOption("expo");
    EasingOptions.CIRC = new BoxOption("circ");
    EasingOptions.BACK = new BoxOption("back");
    EasingOptions.ELASTIC = new BoxOption("elastic");
    EasingOptions.BOUNCE = new BoxOption("bounce");
    EasingOptions.funcTypeOptions = [EasingOptions.FIXED, EasingOptions.LINEAR, EasingOptions.SINE, EasingOptions.QUAD, EasingOptions.CUBIC, EasingOptions.QUART, EasingOptions.QUINT, EasingOptions.EXPO, EasingOptions.CIRC, EasingOptions.BACK, EasingOptions.ELASTIC, EasingOptions.BOUNCE];
    EasingOptions.funcTypeOptionsMapping = { fixed: EasingOptions.FIXED, linear: EasingOptions.LINEAR, sine: EasingOptions.SINE, quad: EasingOptions.QUAD, cubic: EasingOptions.CUBIC, quart: EasingOptions.QUART, quint: EasingOptions.QUINT, expo: EasingOptions.EXPO, circ: EasingOptions.CIRC, back: EasingOptions.BACK, elastic: EasingOptions.ELASTIC, bounce: EasingOptions.BOUNCE };
})(EasingOptions || (EasingOptions = {}));
/**
 * Easing box
 * A box to input normal easings (See ./easing.ts)
 */
class ZEasingBox extends Z {
    constructor(dropdownUp = false) {
        super("div");
        this.$input = new ZArrowInputBox()
            .onChange((num) => {
            const easing = easingArray[num];
            this.$easeType.value = EasingOptions.easeTypeOptionsMapping[easing.easeType];
            this.$funcType.value = EasingOptions.funcTypeOptionsMapping[easing.funcType];
            this.value = num;
            this.dispatchEvent(new ZValueChangeEvent());
        });
        this.$easeType = new ZDropdownOptionBox(EasingOptions.easeTypeOptions, dropdownUp).onChange(() => this.update());
        this.$funcType = new ZDropdownOptionBox(EasingOptions.funcTypeOptions, dropdownUp).onChange(() => this.update());
        this.addClass("flex-row")
            .append(this.$input, $("span").text("Ease"), this.$easeType, this.$funcType);
    }
    update() {
        this.value = easingMap[this.$funcType.value.text][this.$easeType.value.text].id;
        this.$input.setValue(this.value);
        this.dispatchEvent(new ZValueChangeEvent());
    }
    /**
     * Set a new KPA easing id and change the $funcType and $easeType, but does not call the callback
     * @param easing
     */
    setValue(easing) {
        this.value = easing.id;
        this.$input.setValue(this.value);
        this.$funcType.value = EasingOptions.funcTypeOptionsMapping[easing.funcType];
        this.$easeType.value = EasingOptions.easeTypeOptionsMapping[easing.easeType];
    }
    onChange(callback) {
        this.addEventListener("valueChange", () => {
            callback(this.value);
        });
        return this;
    }
}
class ZRadioBox extends Z {
    constructor(name, options, defaultIndex = 0) {
        super("div");
        this.callbacks = [];
        this.$inputs = [];
        this.addClass("radio-box");
        for (let i = 0; i < options.length; i++) {
            const $input = $("input").attr("type", "radio").attr("name", name);
            this.$inputs.push($input);
            const $label = $("label").text(options[i]);
            this.append($input, $label);
            $input.on("change", () => {
                if (this.selectedIndex === i) {
                    return;
                }
                this.selectedIndex = i;
                this.callbacks.forEach(f => f(i));
            });
            if (i === defaultIndex) {
                $input.attr("checked", "true");
            }
        }
        this.selectedIndex = defaultIndex;
    }
    onChange(callback) {
        this.callbacks.push(callback);
        return this;
    }
    /**
     * 只转到某个选项，但不触发回调
     * @param index
     * @returns
     */
    switchTo(index) {
        if (this.selectedIndex === index) {
            return;
        }
        this.$inputs[this.selectedIndex].element.checked = false;
        this.$inputs[index].element.checked = true;
        this.selectedIndex = index;
        return this;
    }
}
/**
 * A tabbed UI, with input[type="radio"]s on the top
 */
class ZRadioTabs extends Z {
    constructor(name, pages, defaultIndex = 0) {
        super("div");
        this.$pages = [];
        this.addClass("radio-tabs");
        const keys = Object.keys(pages);
        this.$radioBox = new ZRadioBox(name, keys, defaultIndex);
        this.append(this.$radioBox);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.append(pages[key]);
            this.$pages.push(pages[key]);
            if (i !== defaultIndex) {
                pages[key].hide();
            }
        }
        this.selectedIndex = defaultIndex;
        this.$radioBox.onChange((index) => {
            if (this.selectedIndex === index) {
                return;
            }
            pages[keys[this.selectedIndex]].hide();
            pages[keys[index]].show();
            this.selectedIndex = index;
        });
    }
    onChange(callback) {
        this.$radioBox.onChange(callback);
        return this;
    }
    /**
     * 只转到某个选项，但不触发回调
     * @param index
     * @returns
     */
    switchTo(index) {
        this.$radioBox.switchTo(index);
        this.$pages[this.selectedIndex].hide();
        this.$pages[index].show();
        this.selectedIndex = index;
        return this;
    }
}
class ZDialog extends Z {
    constructor() {
        super("dialog");
    }
    show() {
        this.element.show();
        return this;
    }
    bindDonePromise(promise) {
        promise.then(() => {
            this.element.close();
        });
        return this;
    }
    whenClosed(callback) {
        this.element.addEventListener("close", callback);
        return this;
    }
    close() {
        this.element.close();
    }
}
class ZNotification extends Z {
    constructor(text, timeout = 8000) {
        super("div");
        this.addClass("notification");
        setTimeout(() => this.addClass("fade-in"), 50);
        this.onClick(() => {
            this.removeClass("fade-in");
        });
        setTimeout(() => {
            this.removeClass("fade-in");
            setTimeout(() => {
                this.remove();
            }, 1000);
        }, timeout);
        this.$text = $("span").text(text);
        this.append(this.$text);
    }
}
function notify(message) {
    $(document.body).append(new ZNotification(message));
}
class ZTextArea extends Z {
    constructor(rows = 20, cols = 40) {
        super("textarea");
        this.attr("rows", rows + "");
        this.attr("cols", cols + "");
    }
    getValue() {
        return this.element.value;
    }
    setValue(value) {
        this.element.value = value;
        return this;
    }
    get value() {
        return this.element.value;
    }
    set value(value) {
        this.element.value = value;
    }
}
class ZCollapseController extends Z {
    constructor(_folded, stopsPropagation = true) {
        super("div");
        this._folded = _folded;
        this.targets = [];
        if (_folded) {
            this.addClass("collapse-folded");
        }
        else {
            this.addClass("collapse-unfolded");
        }
        this.onClick((e) => {
            if (stopsPropagation)
                e.stopPropagation();
            this.folded = !this.folded;
        });
    }
    get folded() {
        return this._folded;
    }
    set folded(value) {
        if (value === this._folded) {
            return;
        }
        this._folded = value;
        if (value) {
            this.removeClass("collapse-unfolded");
            this.addClass("collapse-folded");
            for (const $target of this.targets) {
                $target.hide();
            }
        }
        else {
            this.addClass("collapse-unfolded");
            this.removeClass("collapse-folded");
            for (const $target of this.targets) {
                $target.show();
            }
        }
    }
    attach($element) {
        this.targets.push($element);
    }
}
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
const getOffset = (element) => {
    const rect = element.getBoundingClientRect();
    return [rect.left, rect.top];
};
/**
 * To get offset coordinates from mouse or touch
 * @param event
 * @param element
 * @returns
 */
const getOffsetCoordFromEvent = (event, element) => {
    if (event instanceof MouseEvent) {
        return [event.offsetX, event.offsetY];
    }
    else {
        const [left, top] = getOffset(element); // 不是简单的offsetLeft，因为offsetLeft是相对于offsetParent的
        return [event.changedTouches[0].clientX - left, event.changedTouches[0].clientY - top];
    }
};
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
function changeAudioTime(audio, delta) {
    const time = audio.currentTime + delta;
    if (time < 0) {
        audio.currentTime = 0;
    }
    else if (time > audio.duration) {
        audio.currentTime = audio.duration;
    }
    else {
        audio.currentTime = time;
    }
}
/**
 * 获取一串数字的第？分位数
 */
function getPercentile(sorted, percentile) {
    return sorted[Math.floor(sorted.length * percentile)];
}
const isAllDigits = (str) => /^\d+$/.test(str);
class NeedsReflowEvent extends Event {
    constructor(condition) {
        super("needsreflow");
        this.condition = condition;
    }
}
class OperationList extends EventTarget {
    constructor(parentChart) {
        super();
        this.parentChart = parentChart;
        this.operations = [];
        this.undoneOperations = [];
    }
    undo() {
        const op = this.operations.pop();
        if (op) {
            if (!this.parentChart.modified) {
                this.parentChart.modified = true;
                this.dispatchEvent(new Event("firstmodified"));
            }
            this.undoneOperations.push(op);
            op.undo();
            if (op.updatesEditor) {
                editor.update();
            }
        }
        else {
            this.dispatchEvent(new Event("noundo"));
        }
    }
    redo() {
        const op = this.undoneOperations.pop();
        if (op) {
            if (!this.parentChart.modified) {
                this.parentChart.modified = true;
                this.dispatchEvent(new Event("firstmodified"));
            }
            this.operations.push(op);
            op.do();
            if (op.updatesEditor) {
                this.dispatchEvent(new Event("needsupdate"));
            }
            if (op.reflows) {
                this.dispatchEvent(new NeedsReflowEvent(op.reflows));
            }
        }
        else {
            this.dispatchEvent(new Event("noredo"));
        }
    }
    do(operation) {
        if (operation.ineffective) {
            return;
        }
        if (!this.parentChart.modified) {
            this.parentChart.modified = true;
            this.dispatchEvent(new Event("firstmodified"));
        }
        if (this.operations.length !== 0) {
            const lastOp = this.operations[this.operations.length - 1];
            if (operation.constructor === lastOp.constructor) {
                if (lastOp.rewrite(operation)) {
                    if (operation.updatesEditor) {
                        this.dispatchEvent(new Event("needupdate"));
                    }
                    return;
                }
            }
        }
        operation.do();
        if (operation.updatesEditor) {
            this.dispatchEvent(new Event("needupdate"));
        }
        if (operation.reflows) {
            console.log(operation.reflows);
            this.dispatchEvent(new NeedsReflowEvent(operation.reflows));
        }
        this.operations.push(operation);
    }
    clear() {
        this.operations = [];
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
                continue;
            }
            op.do();
        }
    }
    undo() {
        const length = this.length;
        for (let i = length - 1; i >= 0; i--) {
            const op = this.subOperations[i];
            if (op.ineffective) {
                continue;
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
        if (this.field === "endTime") {
            console.log("endTime");
        }
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
        this.isHold = note.type === NoteType.hold;
        if (!note.parentNode) {
            this.ineffective = true;
        }
        else {
            this.noteNode = note.parentNode;
        }
    }
    do() {
        const { note, noteNode } = this;
        noteNode.remove(note);
        const needsUpdate = this.isHold && TimeCalculator.lt(noteNode.endTime, note.endTime);
        if (needsUpdate) {
            const endBeats = TimeCalculator.toBeats(note.endTime);
            const tailJump = noteNode.parentSeq.holdTailJump;
            const updateFrom = tailJump.header;
            const updateTo = tailJump.tailer;
            // tailJump.getPreviousOf(noteNode, endBeats);
            tailJump.updateRange(updateFrom, noteNode.next);
        }
    }
    undo() {
        const { note, noteNode } = this;
        const needsUpdate = this.isHold && TimeCalculator.lt(noteNode.endTime, note.endTime);
        if (needsUpdate) {
            const endBeats = TimeCalculator.toBeats(note.endTime);
            const tailJump = noteNode.parentSeq.holdTailJump;
            const updateFrom = tailJump.getNodeAt(endBeats).previous;
            noteNode.add(note);
            tailJump.updateRange(updateFrom, noteNode.next);
        }
        else {
            noteNode.add(note);
        }
    }
}
/**
 * 删除一个note
 * 从语义上删除Note要用这个操作
 * 结果上，这个会更新编辑器
 */
class NoteDeleteOperation extends NoteRemoveOperation {
    constructor() {
        super(...arguments);
        this.updatesEditor = true;
    }
}
class MultiNoteDeleteOperation extends ComplexOperation {
    constructor(notes) {
        if (notes instanceof Set) {
            notes = [...notes];
        }
        super(...notes.map(note => new NoteDeleteOperation(note)));
        this.updatesEditor = true;
        if (notes.length === 0) {
            this.ineffective = true;
        }
    }
}
class NoteAddOperation extends Operation {
    constructor(note, node) {
        super();
        this.updatesEditor = true;
        this.note = note;
        this.isHold = note.type === NoteType.hold;
        this.noteNode = node;
    }
    do() {
        const { note, noteNode } = this;
        const needsUpdate = this.isHold && TimeCalculator.lt(noteNode.endTime, note.endTime);
        if (needsUpdate) {
            const endBeats = TimeCalculator.toBeats(note.endTime);
            const tailJump = noteNode.parentSeq.holdTailJump;
            const updateFrom = tailJump.header;
            // tailJump.getNodeAt(endBeats).previous;
            noteNode.add(note);
            tailJump.updateRange(updateFrom, noteNode.next);
        }
        else {
            noteNode.add(note);
        }
    }
    undo() {
        const { note, noteNode } = this;
        noteNode.remove(note);
        const needsUpdate = this.isHold && TimeCalculator.lt(noteNode.endTime, note.endTime);
        if (needsUpdate) {
            const endBeats = TimeCalculator.toBeats(note.endTime);
            const tailJump = noteNode.parentSeq.holdTailJump;
            const updateFrom = tailJump.getPreviousOf(noteNode, endBeats);
            tailJump.updateRange(updateFrom, noteNode.next);
        }
    }
}
class MultiNoteAddOperation extends ComplexOperation {
    constructor(notes, judgeLine) {
        if (notes instanceof Set) {
            notes = [...notes];
        }
        super(...notes.map(note => {
            const node = judgeLine.getNode(note, true);
            return new NoteAddOperation(note, node);
        }));
        this.updatesEditor = true;
        if (notes.length === 0) {
            this.ineffective = true;
        }
    }
}
class NoteTimeChangeOperation extends ComplexOperation {
    constructor(note, noteNode) {
        super(new NoteRemoveOperation(note), new NoteValueChangeOperation(note, "startTime", noteNode.startTime), new NoteAddOperation(note, noteNode));
        this.updatesEditor = true;
        if (note.type === NoteType.hold && !TimeCalculator.gt(note.endTime, noteNode.startTime)) {
            this.ineffective = true;
        }
        this.note = note;
        if (note.parentNode === noteNode) {
            this.ineffective = true;
        }
    }
    rewrite(operation) {
        if (operation.note === this.note) {
            this.subOperations[0] = new NoteRemoveOperation(this.note);
            if (!this.subOperations[0].ineffective) {
                this.subOperations[0].do();
            }
            this.subOperations[1].value = operation.subOperations[1].value;
            this.subOperations[1].do();
            this.subOperations[2].noteNode = operation.subOperations[2].noteNode;
            this.subOperations[2].do();
            return true;
        }
        return false;
    }
}
class HoldEndTimeChangeOperation extends NoteValueChangeOperation {
    constructor(note, value) {
        super(note, "endTime", value);
        if (!TimeCalculator.gt(value, note.startTime)) {
            this.ineffective = true;
        }
    }
    do() {
        super.do();
        const node = this.note.parentNode;
        node.sort(this.note);
        const tailJump = node.parentSeq.holdTailJump;
        tailJump.updateRange(tailJump.header, tailJump.tailer);
    }
    undo() {
        super.undo();
        const node = this.note.parentNode;
        node.sort(this.note);
        const tailJump = node.parentSeq.holdTailJump;
        tailJump.updateRange(tailJump.header, tailJump.tailer);
    }
    rewrite(operation) {
        if (operation.note === this.note && this.field === operation.field) {
            if (operation.value === this.value) {
                return true;
            }
            this.value = operation.value;
            this.note[this.field] = operation.value;
            const tailJump = this.note.parentNode.parentSeq.holdTailJump;
            tailJump.updateRange(tailJump.header, tailJump.tailer);
            return true;
        }
        return false;
    }
}
class NoteSpeedChangeOperation extends ComplexOperation {
    constructor(note, value, line) {
        const valueChange = new NoteValueChangeOperation(note, "speed", value);
        const tree = line.getNNList(value, note.yOffset, note.type === NoteType.hold, true);
        const node = tree.getNodeOf(note.startTime);
        const removal = new NoteRemoveOperation(note);
        const insert = new NoteAddOperation(note, node);
        super(valueChange, removal, insert);
        this.updatesEditor = true;
    }
}
class NoteYOffsetChangeOperation extends ComplexOperation {
    constructor(note, value, line) {
        const valueChange = new NoteValueChangeOperation(note, "yOffset", value);
        const tree = line.getNNList(note.speed, value, note.type === NoteType.hold, true);
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
            const tree = note.parentNode.parentSeq.parentLine.getNNList(note.speed, note.yOffset, !isHold, true);
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
        if (node.previous === null) {
            this.ineffective = true;
            return;
        }
        if (node.isFirstStart()) {
            this.ineffective = true;
            return;
        }
        [this.endNode, this.startNode] = EventNode.getEndStart(node);
        this.sequence = this.startNode.parentSeq;
        this.originalPrev = node.previous.previous;
    }
    do() {
        this.sequence.updateJump(...EventNode.removeNodePair(this.endNode, this.startNode));
    }
    undo() {
        this.sequence.updateJump(...EventNode.insert(this.startNode, this.originalPrev));
    }
}
/**
 * 将一对孤立的节点对插入到一个开始节点之后的操作。
 * 如果这个节点对的时刻与节点对的时刻相同，那么该节点对将不会被插入。
 * 而是把原来开始节点的值修改。
 */
class EventNodePairInsertOperation extends Operation {
    /**
     *
     * @param node the node to insert
     * @param targetPrevious The node to insert before, accessed through EventNodeSequence.getNodeAt(TC.toBeats(node))
     * If the targetPrevious's time is the same as node's time, the node will not be inserted,
     * and the targetPrevious' value will be replaced with the node's value.
     */
    constructor(node, targetPrevious) {
        super();
        this.updatesEditor = true;
        this.node = node;
        this.tarPrev = targetPrevious;
        this.originalSequence = targetPrevious.parentSeq;
        if (TimeCalculator.eq(node.time, targetPrevious.time)) {
            this.overlapped = true;
            this.value = node.value;
            this.originalValue = targetPrevious.value;
        }
    }
    do() {
        if (this.overlapped) {
            this.tarPrev.value = this.value;
            return;
        }
        const [endNode, startNode] = EventNode.insert(this.node, this.tarPrev);
        this.node.parentSeq.updateJump(endNode, startNode);
    }
    undo() {
        var _a;
        if (this.overlapped) {
            this.tarPrev.value = this.originalValue;
            return;
        }
        (_a = this.originalSequence) === null || _a === void 0 ? void 0 : _a.updateJump(...EventNode.removeNodePair(...EventNode.getEndStart(this.node)));
    }
}
/**
 * Only used for new nodes
 * dynamically compute the targetPrevious
 * /
class EventNodePairAddOperation extends Operation {
    updatesEditor = true
    constructor(public node: EventStartNode, public targetSequence: EventNodeSequence) {
        super();
    }
    do() {
        const tarPrev = this.targetSequence.getNodeAt(this.node.start);
        const [endNode, startNode] =
    }
}
*/
class MultiNodeAddOperation extends ComplexOperation {
    constructor(nodes, seq) {
        let prev = seq.getNodeAt(TimeCalculator.toBeats(nodes[0].time));
        super(...nodes.map(node => {
            const op = new EventNodePairInsertOperation(node, prev);
            if (!op.overlapped)
                prev = node; // 有种reduce的感觉
            return op;
        }));
        this.updatesEditor = true;
        this.nodes = nodes;
    }
}
class MultiNodeDeleteOperation extends ComplexOperation {
    constructor(nodes) {
        super(...nodes.map(node => new EventNodePairRemoveOperation(node)));
        this.updatesEditor = true;
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
        const seq = this.sequence = node.parentSeq;
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
            this.sequence.updateJump(...EventNode.removeNodePair(this.endNode, this.startNode));
            EventNode.insert(this.startNode, this.newPrevious);
        }
        this.sequence.updateJump(EventNode.previousStartOfStart(this.endNode.previous), EventNode.nextStartOfStart(this.startNode));
    }
    undo() {
        this.endNode.time = this.startNode.time = this.originalValue;
        if (this.newPrevious !== this.originalPrevious) {
            this.sequence.updateJump(...EventNode.removeNodePair(this.endNode, this.startNode));
            EventNode.insert(this.startNode, this.originalPrevious);
        }
        this.sequence.updateJump(this.endNode.previous, EventNode.nextStartOfStart(this.startNode));
    }
}
class EventNodeInnerEasingChangeOperation extends Operation {
    constructor(node, val) {
        super();
        this.updatesEditor = true;
        let _;
        [this.startNode, _] = EventNode.getStartEnd(node);
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
class EventNodeEasingChangeOperation extends Operation {
    constructor(node, val) {
        super();
        this.updatesEditor = true;
        let _;
        [this.startNode, _] = EventNode.getStartEnd(node);
        this.value = val;
        this.originalValue = node.easing;
    }
    do() {
        this.startNode.easing = this.value;
    }
    undo() {
        this.startNode.easing = this.originalValue;
    }
}
/*

class BPMNodeValueChangeOperation extends Operation {
    updatesEditor = true
    node: BPMStartNode;
    value: number;
    originalValue: number
    constructor(node: BPMStartNode | BPMEndNode, val: number) {
        super()
        this.node = EventNode.getStartEnd(node)[0] as BPMStartNode;
        this.value = val;
        this.originalValue = node.value
    }
    do() {
        this.node.value = this.value
        this.node.parentSeq.initJump();
    }
    undo() {
        this.node.value = this.originalValue;
        this.node.parentSeq.initJump();
    }

}

class BPMNodeInsertOperation extends Operation {
    updatesEditor = true;
    node: BPMStartNode;
    value: number;
    originalValue: number;

}
*/
class EncapsuleOperation extends ComplexOperation {
    constructor(nodes, easing) {
        const len = nodes.length;
        super(new MultiNodeDeleteOperation(nodes.slice(1, -1)), new EventNodeEasingChangeOperation(nodes[0], easing), 
        // 这里nodes至少都有两个，最后一个node不可能是第一个StartNode
        new EventNodeValueChangeOperation(nodes[len - 1].previous, nodes[len - 1].value));
        this.updatesEditor = true;
    }
}
var EncapsuleErrorType;
(function (EncapsuleErrorType) {
    EncapsuleErrorType[EncapsuleErrorType["NotBelongToSourceSequence"] = 1] = "NotBelongToSourceSequence";
    EncapsuleErrorType[EncapsuleErrorType["NotContinuous"] = 2] = "NotContinuous";
    EncapsuleErrorType[EncapsuleErrorType["ZeroDelta"] = 3] = "ZeroDelta";
})(EncapsuleErrorType || (EncapsuleErrorType = {}));
/**
 * 将一些来自sourceSequence的节点打包为一个用于模板缓动的事件序列
 * 然后把sourceSequence中的源节点集合替换为单个使用了该模板的事件
 * @param sourceSequence
 * @param sourceNodes
 */
function encapsule(templateEasingLib, sourceSequence, sourceNodes, name) {
    if (!EventNode.belongToSequence(sourceNodes, sourceSequence)) {
        return EncapsuleErrorType.NotBelongToSourceSequence;
    }
    const [oldArray, nodeArray] = EventNode.setToNewOrderedArray([0, 0, 1], sourceNodes);
    if (Math.abs(nodeArray[0].value - nodeArray[nodeArray.length - 1].value) < 1e-10) {
        return EncapsuleErrorType.ZeroDelta;
    }
    if (!EventNode.isContinuous(oldArray)) {
        return EncapsuleErrorType.NotContinuous;
    }
    const easing = templateEasingLib.getOrNew(name);
    const sequence = easing.eventNodeSequence;
    sequence.effectiveBeats = TimeCalculator.toBeats(nodeArray[nodeArray.length - 1].time);
    // 直接do，这个不需要做成可撤销的
    new MultiNodeAddOperation(nodeArray, sequence).do();
    return new EncapsuleOperation(oldArray, easing);
}
class JudgeLineInheritanceChangeOperation extends Operation {
    constructor(chart, judgeLine, value) {
        super();
        this.chart = chart;
        this.judgeLine = judgeLine;
        this.value = value;
        this.updatesEditor = true;
        this.reflows = JudgeLinesEditorLayoutType.tree;
        this.originalValue = judgeLine.father;
        // 这里只会让它静默失败，外面调用的时候能够在判断一次并抛错误才是最好的
        if (JudgeLine.checkinterdependency(judgeLine, value)) {
            this.ineffective = true;
        }
    }
    do() {
        const line = this.judgeLine;
        line.father = this.value;
        if (this.originalValue) {
            this.originalValue.children.delete(line);
        }
        else {
            const index = this.chart.orphanLines.indexOf(line);
            if (index >= 0) // Impossible to be false, theoretically
                this.chart.orphanLines.splice(index, 1);
        }
        if (this.value) {
            this.value.children.add(line);
        }
        else {
            this.chart.orphanLines.push(line);
        }
    }
    undo() {
        const line = this.judgeLine;
        line.father = this.originalValue;
        if (this.originalValue) {
            this.originalValue.children.add(line);
        }
        else {
            this.chart.orphanLines.push(line);
        }
        if (this.value) {
            this.value.children.delete(line);
        }
        else {
            const index = this.chart.orphanLines.indexOf(line);
            if (index >= 0) // Impossible to be false, theoretically
                this.chart.orphanLines.splice(index, 1);
        }
    }
}
class JudgeLineRenameOperation extends Operation {
    constructor(judgeLine, value) {
        super();
        this.judgeLine = judgeLine;
        this.value = value;
        this.updatesEditor = true;
        this.originalValue = judgeLine.name;
    }
    do() {
        this.judgeLine.name = this.value;
    }
    undo() {
        this.judgeLine.name = this.originalValue;
    }
}
class JudgeLineRegroupOperation extends Operation {
    constructor(judgeLine, value) {
        super();
        this.judgeLine = judgeLine;
        this.value = value;
        this.updatesEditor = true;
        this.reflows = JudgeLinesEditorLayoutType.grouped;
        this.originalValue = judgeLine.group;
    }
    do() {
        this.judgeLine.group = this.value;
        this.value.add(this.judgeLine);
        this.originalValue.remove(this.judgeLine);
    }
    undo() {
        this.judgeLine.group = this.originalValue;
        this.originalValue.add(this.judgeLine);
        this.value.remove(this.judgeLine);
    }
}
class JudgeLineCreateOperation extends Operation {
    // 之前把=写成了:半天不知道咋错了
    constructor(chart, judgeLine) {
        super();
        this.chart = chart;
        this.judgeLine = judgeLine;
        this.reflows = JudgeLinesEditorLayoutType.grouped | JudgeLinesEditorLayoutType.tree | JudgeLinesEditorLayoutType.ordered;
    }
    do() {
        const id = this.chart.judgeLines.length;
        this.judgeLine.id = id;
        this.chart.judgeLines.push(this.judgeLine);
        this.chart.orphanLines.push(this.judgeLine);
        this.chart.judgeLineGroups[0].add(this.judgeLine);
    }
    undo() {
        this.chart.judgeLineGroups[0].remove(this.judgeLine);
        this.chart.judgeLines.splice(this.chart.judgeLines.indexOf(this.judgeLine), 1);
        this.chart.orphanLines.splice(this.chart.orphanLines.indexOf(this.judgeLine), 1);
    }
}
class JudgeLineDeleteOperation extends Operation {
    constructor(chart, judgeLine) {
        super();
        this.chart = chart;
        this.judgeLine = judgeLine;
        if (!this.chart.judgeLines.includes(this.judgeLine)) {
            this.ineffective = true;
        }
        this.originalGroup = judgeLine.group;
    }
    do() {
        this.chart.judgeLines.splice(this.chart.judgeLines.indexOf(this.judgeLine), 1);
        if (this.chart.orphanLines.includes(this.judgeLine)) {
            this.chart.orphanLines.splice(this.chart.orphanLines.indexOf(this.judgeLine), 1);
        }
        this.originalGroup.remove(this.judgeLine);
    }
    undo() {
        this.chart.judgeLines.push(this.judgeLine);
        this.chart.orphanLines.push(this.judgeLine);
        this.originalGroup.add(this.judgeLine);
    }
}
const BEZIER_POINT_SIZE = 20;
const HALF_BEZIER_POINT_SIZE = BEZIER_POINT_SIZE / 2;
var BezierEditorState;
(function (BezierEditorState) {
    BezierEditorState[BezierEditorState["select"] = 0] = "select";
    BezierEditorState[BezierEditorState["selectingStart"] = 1] = "selectingStart";
    BezierEditorState[BezierEditorState["selectingEnd"] = 2] = "selectingEnd";
})(BezierEditorState || (BezierEditorState = {}));
/** 编辑三次贝塞尔曲线 */
class BezierEditor extends Z {
    constructor(size) {
        super("div");
        this.size = size;
        this.canvas = document.createElement("canvas");
        this.selectionManager = new SelectionManager();
        this.startPoint = new Coordinate(0, 0);
        this.endPoint = new Coordinate(0, 0);
        this.state = BezierEditorState.select;
        this.drawn = false;
        this.canvas.width = this.canvas.height = size;
        this.context = this.canvas.getContext("2d");
        this.element.appendChild(this.canvas);
        on(["mousedown", "touchstart"], this.canvas, (e) => {
            this.downHandler(e);
            this.update();
        });
        on(["mousemove", "touchmove"], this.canvas, (e) => {
            this.moveHandler(e);
            this.update();
        });
        on(["mouseup", "touchend"], this.canvas, (e) => {
            this.upHandler(e);
            this.update();
        });
    }
    update() {
        this.updateMatrix();
        this.selectionManager.refresh();
        const { context, size, startPoint, endPoint, selectionManager } = this;
        const { x: sx, y: sy } = startPoint.mul(this.matrix);
        const { x: ex, y: ey } = endPoint.mul(this.matrix);
        context.fillStyle = "#222";
        context.fillRect(0, 0, size, size);
        context.fillStyle = "#EEE";
        context.fillText(`${sx} ${sy} ${ex} ${ey} ${BezierEditorState[this.state]}`, 5, 20);
        context.strokeStyle = "#EE7";
        context.lineWidth = 5;
        drawBezierCurve(context, 0, size, size, 0, sx, sy, ex, ey);
        context.drawImage(NODE_START, sx - HALF_BEZIER_POINT_SIZE, sy - HALF_BEZIER_POINT_SIZE, BEZIER_POINT_SIZE, BEZIER_POINT_SIZE);
        context.drawImage(NODE_END, ex - HALF_BEZIER_POINT_SIZE, ey - HALF_BEZIER_POINT_SIZE, BEZIER_POINT_SIZE, BEZIER_POINT_SIZE);
        selectionManager.add({
            centerX: sx,
            centerY: sy,
            width: BEZIER_POINT_SIZE,
            height: BEZIER_POINT_SIZE,
            priority: 1,
            target: "start"
        });
        selectionManager.add({
            centerX: ex,
            centerY: ey,
            width: BEZIER_POINT_SIZE,
            height: BEZIER_POINT_SIZE,
            priority: 0,
            target: "end"
        });
    }
    updateMatrix() {
        const size = this.size;
        this.matrix = identity.translate(0, size).scale(size, -size);
        this.invertedMatrix = this.matrix.invert();
    }
    downHandler(event) {
        const [x, y] = getOffsetCoordFromEvent(event, this.canvas);
        const tar = this.selectionManager.click(x, y);
        if (!tar) {
            return;
        }
        if (tar.target === "start") {
            this.state = BezierEditorState.selectingStart;
        }
        else if (tar.target === "end") {
            this.state = BezierEditorState.selectingEnd;
        }
    }
    moveHandler(event) {
        if (this.state === BezierEditorState.select) {
            return;
        }
        const [x, y] = getOffsetCoordFromEvent(event, this.canvas);
        const coord = new Coordinate(x, y).mul(this.invertedMatrix);
        if (this.state === BezierEditorState.selectingStart) {
            this.startPoint = coord;
        }
        else if (this.state === BezierEditorState.selectingEnd) {
            this.endPoint = coord;
        }
    }
    upHandler(event) {
        if (this.state === BezierEditorState.selectingStart || this.state === BezierEditorState.selectingEnd) {
            this.dispatchEvent(new ZValueChangeEvent());
        }
        this.state = BezierEditorState.select;
    }
    getValue() {
        const easing = new BezierEasing();
        easing.cp1 = this.startPoint;
        easing.cp2 = this.endPoint;
        return easing;
    }
    setValue(easing) {
        this.startPoint = easing.cp1;
        this.endPoint = easing.cp2;
        this.update();
    }
    whenValueChange(fn) {
        this.addEventListener("valueChange", fn);
    }
}
class SideEditor extends Z {
    constructor() {
        super("div");
        this.addClass("side-editor");
        this.$title = $("div").addClass("side-editor-title");
        this.$body = $("div").addClass("side-editor-body");
        this.append(this.$title, this.$body);
    }
}
class SideEntityEditor extends SideEditor {
    get target() {
        var _a;
        return (_a = this._target) === null || _a === void 0 ? void 0 : _a.deref();
    }
    set target(val) {
        this._target = new WeakRef(val);
        this.update();
    }
    constructor() {
        super();
    }
}
class NoteEditor extends SideEntityEditor {
    ;
    ;
    ;
    constructor() {
        super();
        this.aboveOption = new BoxOption("above", () => this.target.above = true);
        this.belowOption = new BoxOption("below", () => this.target.above = false);
        this.realOption = new BoxOption("true", () => this.target.isFake = false);
        this.fakeOption = new BoxOption("fake", () => this.target.isFake = true);
        this.noteTypeOptions = ["tap", "hold", "flick", "drag"]
            .map((v) => new BoxOption(v, () => {
            editor.operationList.do(new NoteTypeChangeOperation(this.target, NoteType[v]));
        }));
        this.$time = new ZFractionInput();
        this.$endTime = new ZFractionInput();
        this.$type = new ZDropdownOptionBox(this.noteTypeOptions);
        this.$position = new ZInputBox();
        this.$dir = new ZDropdownOptionBox([this.aboveOption, this.belowOption]);
        this.$speed = new ZInputBox();
        this.$fake = new ZDropdownOptionBox([this.fakeOption, this.realOption]);
        this.$alpha = new ZInputBox();
        this.$size = new ZInputBox();
        this.$yOffset = new ZInputBox();
        this.$visibleBeats = new ZInputBox();
        this.$tint = new ZInputBox();
        this.$tintHitEffect = new ZInputBox();
        this.$judgeSize = new ZInputBox();
        this.$delete = new ZButton("Delete").addClass("destructive");
        this.$title.text("Note");
        this.$body.append($("span").text("speed"), this.$speed, $("span").text("time"), $("div").addClass("flex-row").append(this.$time, $("span").text(" ~ "), this.$endTime), $("span").text("type"), this.$type, $("span").text("pos"), this.$position, $("span").text("dir"), this.$dir, $("span").text("real"), this.$fake, $("span").text("alpha"), this.$alpha, $("span").text("size"), this.$size, $("span").text("AbsYOffset"), this.$yOffset, $("span").text("visibleBeats"), this.$visibleBeats, $("span").text("tint"), this.$tint, $("span").text("tintHitEffects"), this.$tintHitEffect, $("span").text("judgeSize"), this.$judgeSize, $("span").text("del"), this.$delete);
        this.$time.onChange((t) => {
            editor.operationList.do(new NoteTimeChangeOperation(this.target, this.target.parentNode.parentSeq.getNodeOf(t)));
            if (this.target.type !== NoteType.hold) {
                this.$endTime.setValue(t);
            }
        });
        this.$endTime.onChange((t) => {
            editor.operationList.do(new HoldEndTimeChangeOperation(this.target, t));
        });
        // 这里缺保卫函数
        this.$position.whenValueChange(() => {
            editor.operationList.do(new NoteValueChangeOperation(this.target, "positionX", this.$position.getNum()));
        });
        this.$speed.whenValueChange(() => {
            editor.operationList.do(new NoteSpeedChangeOperation(this.target, this.$speed.getNum(), this.target.parentNode.parentSeq.parentLine));
        });
        this.$alpha.whenValueChange(() => {
            editor.operationList.do(new NoteValueChangeOperation(this.target, "alpha", this.$alpha.getNum()));
        });
        this.$size.whenValueChange(() => {
            editor.operationList.do(new NoteValueChangeOperation(this.target, "size", this.$size.getNum()));
        });
        this.$yOffset.whenValueChange(() => {
            editor.operationList.do(new NoteYOffsetChangeOperation(this.target, this.$yOffset.getNum(), this.target.parentNode.parentSeq.parentLine));
        });
        this.$visibleBeats.whenValueChange(() => {
            editor.operationList.do(new NoteValueChangeOperation(this.target, "visibleBeats", this.$visibleBeats.getNum()));
        });
        this.$delete.onClick(() => {
            editor.operationList.do(new NoteDeleteOperation(this.target));
        });
        this.$tint.whenValueChange((str) => {
            editor.operationList.do(new NoteValueChangeOperation(this.target, "tint", str === "" ? undefined : parseInt(str, 16)));
        });
        this.$tintHitEffect.whenValueChange((str) => {
            editor.operationList.do(new NoteValueChangeOperation(this.target, "tintHitEffects", str === "" ? undefined : parseInt(str, 16)));
        });
        this.$judgeSize.whenValueChange(() => {
            editor.operationList.do(new NoteValueChangeOperation(this.target, "judgeSize", this.$judgeSize.getNum()));
        });
    }
    update() {
        const note = this.target;
        if (!note) {
            return;
        }
        this.$time.setValue(note.startTime);
        if (note.type === NoteType.hold) {
            this.$endTime.setValue(note.endTime);
            this.$endTime.disabled = false;
        }
        else {
            this.$endTime.setValue(note.startTime);
            this.$endTime.disabled = true;
        }
        this.$type.value = this.noteTypeOptions[note.type - 1];
        this.$position.setValue(note.positionX + "");
        this.$dir.value = note.above ? this.aboveOption : this.belowOption;
        this.$fake.value = note.isFake ? this.fakeOption : this.realOption;
        this.$speed.setValue(note.speed + "");
        this.$alpha.setValue(note.alpha + "");
        this.$yOffset.setValue(note.yOffset + "");
        this.$visibleBeats.setValue(note.visibleBeats + "");
        this.$size.setValue(note.size + "");
        this.$tint.setValue(note.tint ? note.tint.toString(16).padStart(6, "0") : "");
        this.$tintHitEffect.setValue(note.tintHitEffects ? note.tintHitEffects.toString(16).padStart(6, "0") : "");
        this.$judgeSize.setValue(note.judgeSize + "");
    }
}
class MultiNoteEditor extends SideEntityEditor {
    constructor() {
        super();
        this.$title.text("Multi Notes");
        this.$delete = new ZButton("Delete").addClass("destructive");
        this.$reverse = new ZButton("Reverse");
        this.$body.append(this.$delete, this.$reverse);
        this.$reverse.onClick(() => {
            editor.operationList.do(new ComplexOperation(...[...this.target].map(n => new NoteValueChangeOperation(n, "positionX", -n.positionX))));
        });
        this.$delete.onClick(() => {
            editor.operationList.do(new MultiNoteDeleteOperation(this.target));
        });
    }
    update() {
    }
}
class MultiNodeEditor extends SideEntityEditor {
    constructor() {
        super();
        this.$title.text("Multi Nodes");
        this.$delete = new ZButton("Delete").addClass("destructive");
        this.$reverse = new ZButton("Reverse");
        this.$body.append(this.$delete, this.$reverse);
        this.$reverse.onClick(() => {
            editor.operationList.do(new ComplexOperation(...[...this.target].map(n => new EventNodeValueChangeOperation(n, -n.value))));
        });
        this.$delete.onClick(() => {
            editor.operationList.do(new MultiNodeDeleteOperation(Array.from(this.target)));
        });
    }
    update() {
    }
}
class EventEditor extends SideEntityEditor {
    constructor() {
        super();
        this.$time = new ZFractionInput();
        this.$value = new ZInputBox();
        this.$normalOuter = $("div");
        this.$normalLeft = new ZInputBox().attr("placeholder", "left").setValue("0.0");
        this.$normalRight = new ZInputBox().attr("placeholder", "right").setValue("1.0");
        this.$easing = new ZEasingBox();
        this.$templateOuter = $("div");
        this.$templateEasing = new ZInputBox().addClass("template-easing-box");
        this.$templateLeft = new ZInputBox().attr("placeholder", "left").setValue("0.0");
        this.$templateRight = new ZInputBox().attr("placeholder", "right").setValue("1.0");
        this.$parametric = new ZInputBox();
        this.$bezierEditor = new BezierEditor(window.innerWidth * 0.2);
        this.$title.text("Event");
        this.addClass("event-editor");
        this.$normalOuter.append(this.$easing, this.$normalLeft, this.$normalRight);
        this.$radioTabs = new ZRadioTabs("easing-type", {
            "Normal": this.$normalOuter,
            "Template": this.$templateEasing,
            "Bezier": this.$bezierEditor,
            "Parametric": this.$parametric
        });
        this.$delete = new ZButton("delete").addClass("destructive")
            .onClick(() => editor.operationList.do(new EventNodePairRemoveOperation(EventNode.getEndStart(this.target)[1])));
        this.$body.append($("span").text("time"), this.$time, $("span").text("value"), this.$value, this.$radioTabs, $("span").text("del"), this.$delete);
        this.$time.onChange((t) => {
            editor.operationList.do(new EventNodeTimeChangeOperation(this.target, t));
        });
        this.$value.whenValueChange(() => {
            editor.operationList.do(new EventNodeValueChangeOperation(this.target, this.$value.getNum()));
        });
        this.$easing.onChange((id) => this.setNormalEasing(id));
        this.$templateEasing.whenValueChange((name) => this.setTemplateEasing(name));
        this.$bezierEditor.whenValueChange(() => {
            this.setBezierEasing(this.$bezierEditor.getValue());
        });
        this.$parametric.whenValueChange(() => {
            this.setParametricEasing(this.$parametric.getValue());
        });
        this.$radioTabs.$radioBox.onChange((id) => {
            if (id === 0) { // Normal
                this.setNormalEasing(this.$easing.value);
            }
            else if (id === 1) { // Template
                if (!this.$templateEasing.getValue()) {
                    return;
                }
                this.setTemplateEasing(this.$templateEasing.getValue());
            }
            else if (id === 2) { // Bezier
                this.setBezierEasing(this.$bezierEditor.getValue());
            }
            else if (id === 3) { // Parametric
                this.setParametricEasing(this.$parametric.getValue());
            }
        });
        for (const $input of [this.$normalLeft, this.$normalRight, this.$templateLeft, this.$templateRight]) {
            $input.whenValueChange(() => {
                const isNormal = $input === this.$normalLeft || $input === this.$normalRight;
                const left = isNormal ? this.$normalLeft.getNum() : this.$templateLeft.getNum();
                const right = isNormal ? this.$normalRight.getNum() : this.$templateRight.getNum();
                if (left < 0 || right > 1 || left > right) {
                    editor.update();
                    return;
                }
                const isOriginallySegmented = this.target.easing instanceof SegmentedEasing;
                // 如果本来就是被分段的，就不改回纯的了
                // 否则能不分就不分
                const needsSegmentation = isOriginallySegmented || left !== 0 || right !== 1;
                if (needsSegmentation) {
                    if (isOriginallySegmented) {
                        editor.operationList.do(new EventNodeEasingChangeOperation(this.target, new SegmentedEasing(this.target.easing.easing, left, right)));
                    }
                    else {
                        editor.operationList.do(new EventNodeEasingChangeOperation(this.target, new SegmentedEasing(this.target.easing, left, right)));
                    }
                }
            });
        }
    }
    setNormalEasing(id) {
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, easingArray[id]));
        this.target.innerEasing = easingArray[id];
    }
    setTemplateEasing(name) {
        const chart = editor.chart;
        const easing = chart.templateEasingLib.getOrNew(name);
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, easing));
    }
    setBezierEasing(easing) {
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, easing));
    }
    setParametricEasing(expression) {
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, new ParametricEquationEasing(expression)));
    }
    update() {
        const eventNode = this.target;
        if (!eventNode) {
            return;
        }
        this.$time.setValue(eventNode.time);
        this.$value.setValue(eventNode.value + "");
        if (eventNode.innerEasing instanceof NormalEasing) {
            this.$radioTabs.switchTo(0);
            this.$easing.setValue(eventNode.innerEasing);
            if (eventNode.easing instanceof SegmentedEasing) {
                this.$normalLeft.setValue(eventNode.easing.left + "");
                this.$normalRight.setValue(eventNode.easing.right + "");
            }
        }
        else if (eventNode.innerEasing instanceof TemplateEasing) {
            this.$radioTabs.switchTo(1);
            this.$templateEasing.setValue(eventNode.innerEasing.name);
        }
        else if (eventNode.innerEasing instanceof BezierEasing) {
            this.$radioTabs.switchTo(2);
            this.$bezierEditor.setValue(eventNode.innerEasing);
        }
        else if (eventNode.innerEasing instanceof ParametricEquationEasing) {
            this.$radioTabs.switchTo(3);
            this.$parametric.setValue(eventNode.innerEasing.equation);
        }
    }
}
class JudgeLineInfoEditor extends SideEntityEditor {
    constructor() {
        super();
        this.$father = new ZInputBox("-1");
        this.$group = new ZDropdownOptionBox([new BoxOption("Default")]);
        this.$newGroup = new ZInputBox("");
        this.$createGroup = new ZButton("Create");
        this.$createLine = new ZButton("Create");
        this.$del = new ZButton("Delete").addClass("destructive");
        this.$title.text("Judge Line");
        this.$body.append($("span").text("Father"), this.$father, $("span").text("Group"), this.$group, $("span").text("New Group"), $("div").append(this.$newGroup, this.$createGroup), $("span").text("New Line"), this.$createLine, $("span").text("del"), this.$del);
        this.$father.whenValueChange((content) => {
            if (!this.target) {
                notify("GC了");
                return;
            }
            if (content === "-1") {
                editor.operationList.do(new JudgeLineInheritanceChangeOperation(editor.chart, this.target, null));
            }
            if (isAllDigits(content)) {
                const lineId = parseInt(content);
                const father = editor.chart.judgeLines[lineId];
                if (!father) {
                    notify("Line ID out of range");
                    return false;
                }
                editor.operationList.do(new JudgeLineInheritanceChangeOperation(editor.chart, this.target, father));
            }
            else {
                const father = editor.chart.judgeLines.find(line => line.name === content);
                if (!father) {
                    notify("Line name not found");
                    return false;
                }
                editor.operationList.do(new JudgeLineInheritanceChangeOperation(editor.chart, this.target, father));
            }
        });
        this.$createGroup.onClick(() => {
            if (!this.target) {
                notify("GC了");
                return;
            }
            const name = this.$newGroup.getValue().trim();
            if (name === "") {
                notify("Please input a name");
                return;
            }
            if (editor.chart.judgeLineGroups.some(group => group.name === name)) {
                notify(`'${name}' already exists`);
                return;
            }
            const group = new JudgeLineGroup(name);
            editor.chart.judgeLineGroups.push(group);
            editor.operationList.do(new JudgeLineRegroupOperation(this.target, group));
        });
        this.$createLine.onClick(() => {
            // 等重排了再说，重排之前没有这个线的编辑器，会出错
            editor.judgeLinesEditor.addEventListener("reflow", () => {
                console.log("reflow event");
                editor.judgeLinesEditor.selectedLine = line;
            }, { once: true });
            const line = new JudgeLine(editor.chart);
            editor.operationList.do(new JudgeLineCreateOperation(editor.chart, line));
            this.target = line;
        });
        this.$del.onClick(() => {
            if (!this.target) {
                notify("GC了");
                return;
            }
            editor.operationList.do(new JudgeLineDeleteOperation(editor.chart, this.target));
        });
    }
    update() {
        const judgeLine = this.target;
        if (!judgeLine) {
            return;
        }
        this.$father.setValue(judgeLine.father ? judgeLine.father.id + "" : "-1");
        this.updateGroups(editor.chart.judgeLineGroups);
    }
    updateGroups(groups) {
        this.$group.replaceWithOptions(groups.map(group => {
            const option = new BoxOption(group.name, () => {
                if (!this.target)
                    return;
                editor.operationList.do(new JudgeLineRegroupOperation(this.target, group));
            });
            return option;
        }));
    }
}
class UserScriptEditor extends SideEditor {
    constructor() {
        super();
        this.$script = new ZTextArea().addClass("user-script-editor-script").setValue("");
        this.$runBtn = new ZButton("Run").addClass("user-script-editor-run", "progressive");
        this.addClass("user-script-editor");
        this.$body.append(this.$script, this.$runBtn);
        const log = (content) => {
            const $d = $("div").addClass("user-script-editor-output").text(content + "");
            this.$script.before($d);
        };
        this.$runBtn.onClick(() => {
            var _a;
            try {
                const script = new Function("log", "return " + this.$script.getValue().trim());
                const result = script(log);
                if (typeof result === "function") {
                    result.isUserScript = true;
                    if (result.name !== "") {
                        if (!((_a = globalThis[result.name]) === null || _a === void 0 ? void 0 : _a.isUserScript)) {
                            notify("Cannot override built-in Global Variable. Please use a different name.");
                        }
                        else {
                            globalThis[result.name] = result;
                            log(result.toString());
                        }
                    }
                    if (result.main && typeof result.main === "function") {
                        if (editor.chart.modified && !result.trusted) {
                            notify("This script is not trusted. Please make sure it is safe to run. You'd better save the chart before running it.");
                            notify("To trust this script, please add a line `trusted = true`.");
                            return;
                        }
                        result.main(editor.operationList, editor.chart);
                    }
                }
                else {
                    log(result);
                }
            }
            catch (error) {
                const $d = $("div").addClass("user-script-editor-error").text(error.message);
                this.$script.before($d);
            }
        });
    }
    update() { }
}
const pointIsInRect = (x, y, rectTop, rectLeft, width, height) => rectLeft <= x && x <= rectLeft + width
    && rectTop <= y && y <= rectTop + height;
class SelectionManager {
    constructor() {
    }
    refresh() {
        this.positions = [];
    }
    add(entity) {
        this.positions.push(entity);
        return {
            annotate: (context, canvasX, canvasY) => {
                context.save();
                context.fillStyle = "pink";
                context.fillText(`${shortenFloat(entity.left || entity.centerX, 1)}, ${shortenFloat(entity.top || entity.centerY, 1)}`, canvasX, canvasY - 10);
                context.restore();
            },
        };
    }
    click(x, y) {
        if (typeof x !== "number") {
            return this.click(x.x, x.y);
        }
        const positions = this.positions;
        // console.log(positions, x, y)
        const len = positions.length;
        let i = 0;
        let selected, priority = -1;
        for (; i < len; i++) {
            const pos = positions[i];
            if ("centerX" in pos) {
                const dx = x - pos.centerX;
                const dy = y - pos.centerY;
                const theta = pos.rad || 0;
                // dx dy 顺时针转rad，判断绝对值与半宽高的关系，均小于则在旋转矩形内
                const rx = Math.abs(theta ? dx * Math.cos(theta) + dy * Math.sin(theta) : dx);
                const ry = Math.abs(theta ? dx * -Math.sin(theta) + dy * Math.cos(theta) : dy);
                if (rx < pos.width / 2 && ry < pos.height / 2 && pos.priority > priority) {
                    selected = pos;
                    priority = pos.priority;
                }
            }
            else {
                if (pointIsInRect(x, y, pos.top, pos.left, pos.width, pos.height)) {
                    if (pos.priority > priority) {
                        selected = pos;
                        priority = pos.priority;
                    }
                }
            }
        }
        return selected;
    }
    /**
     * For PositionEntities whose centerXY is given, this method only examine whether the center is in the rect.
     * For PositionEntities whose left, top is given, this method also examine whether the pos rect is in the rect.
     * @param top
     * @param left
     * @param right
     * @param bottom
     * @returns
     */
    selectScope(top, left, bottom, right) {
        return this.positions.filter(pos => {
            if ("centerX" in pos) {
                console.log(left, pos.centerX, right);
                console.log(top, pos.centerY, bottom);
                return pos.centerX >= left && pos.centerX <= right && pos.centerY >= top && pos.centerY <= bottom;
            }
            else {
                return pos.left >= left && pos.left + pos.width <= right
                    && pos.top >= top && pos.top + pos.height <= bottom;
            }
        });
    }
}
// ** TODO: Charting time stats
const eventTypeMap = [
    {
        valueGridSpan: 135,
        valueRange: [-675, 675]
    },
    {
        valueGridSpan: 180,
        valueRange: [-450, 450]
    },
    {
        valueGridSpan: 90,
        valueRange: [-360, 360]
    },
    {
        valueGridSpan: 17,
        valueRange: [0, 255]
    },
    {
        valueGridSpan: 2,
        valueRange: [-5, 15]
    },
    {
        valueGridSpan: 270,
        valueRange: [-675, 675]
    },
    {
        valueGridSpan: 40,
        valueRange: [0, 400]
    }
];
var NewNodeState;
(function (NewNodeState) {
    NewNodeState[NewNodeState["controlsStart"] = 0] = "controlsStart";
    NewNodeState[NewNodeState["controlsEnd"] = 1] = "controlsEnd";
    NewNodeState[NewNodeState["controlsBoth"] = 2] = "controlsBoth";
})(NewNodeState || (NewNodeState = {}));
class EventCurveEditors extends Z {
    ;
    constructor() {
        super("div");
        this.$bar = $("div").addClass("event-curve-editors-bar");
        this.$typeSelect = new ZDropdownOptionBox([
            "moveX",
            "moveY",
            "alpha",
            "rotate",
            "speed",
            "easing",
            "bpm"
        ].map((s) => new BoxOption(s)), true);
        this.$layerSelect = new ZDropdownOptionBox(["0", "1", "2", "3", "ex"].map((s) => new BoxOption(s)), true);
        this.$timeSpanInput = new ZInputBox("4").attr("size", "3");
        this.$editSwitch = new ZSwitch("Edit");
        this.$easingBox = new ZEasingBox(true);
        this.$rangeInput = new ZInputBox().attr("size", "6");
        this.easingBeats = 0;
        this._selectedLayer = "0";
        this.addClass("event-curve-editors");
        this.$typeSelect.onChange((val) => {
            this.selectedEditor = this[val];
        });
        this.$layerSelect.onChange((val) => {
            if (!(["0", "1", "2", "3", "ex"]).includes(val)) {
                throw new Error("Invalid layer");
            }
            // @ts-expect-error 上面已经排除（我也不知道什么时候会出这种）
            this.selectedLayer = val;
        });
        this.$rangeInput.whenValueChange((content) => {
            if (content === "auto" || content === "") {
                this.selectedEditor.autoRangeEnabled = true;
            }
            const parts = content.split(",");
            if (parts.length !== 2) {
                notify("Invalid range");
                this.updateAdjustmentOptions(this.selectedEditor);
                return;
            }
            this.selectedEditor.valueRange = [parseFloat(parts[0]), parseFloat(parts[1])];
            this.selectedEditor.autoRangeEnabled = false;
        });
        this.$easingBox.onChange(id => {
            for (let type of ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm"]) {
                this[type].easing = rpeEasingArray[id];
            }
        });
        this.$easingBox.setValue(easingMap.linear.in);
        this.$newNodeStateSelect = new ZDropdownOptionBox([
            "Both",
            "Start",
            "End"
        ].map((s) => new BoxOption(s)), true)
            .onChange((val) => {
            for (let type of ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm"]) {
                this[type].newNodeState = NewNodeState["controls" + val];
            }
        });
        this.$selectOption = new ZDropdownOptionBox(["none", "extend", "replace", "exclude"].map(v => new BoxOption(v)), true);
        this.$copyButton = new ZButton("Copy");
        this.$pasteButton = new ZButton("Paste");
        this.$encapsuleBtn = new ZButton("Encapsule");
        this.$templateNameInput = new ZInputBox().attr("size", "4");
        this.$templateNameInput.whenValueChange((name) => {
            const easing = editor.chart.templateEasingLib.get(name);
            if (easing) {
                this.easing.target = easing.eventNodeSequence;
                this.easing.targetEasing = easing;
                this.draw();
            }
            else {
                this.easing.target = null;
            }
        });
        this.on("wheel", (ev) => {
            const delta = ev.deltaY / 500;
            if (editor.player.playing) {
                editor.pause();
            }
            if (this.selectedEditor === this.easing) {
                this.easingBeats = Math.min(Math.max(this.easingBeats + delta, 0), this.easing.target.effectiveBeats);
                this.easing.draw(this.easingBeats);
            }
            else {
                changeAudioTime(editor.player.audio, delta);
                editor.update();
            }
        });
        this.$bar.append(this.$typeSelect, this.$layerSelect, this.$timeSpanInput, this.$rangeInput, this.$selectOption, this.$editSwitch, this.$copyButton, this.$pasteButton, this.$easingBox, this.$newNodeStateSelect, this.$templateNameInput, this.$encapsuleBtn);
        this.append(this.$bar);
        this.nodesSelection = new Set();
    }
    init() {
        const barHeight = this.$bar.clientHeight;
        for (let type of ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm"]) {
            this[type] = new EventCurveEditor(EventType[type], this.parent.clientHeight - barHeight, this.parent.clientWidth, this);
            this[type].active = false;
            this.append(this[type].element);
        }
        this.selectedEditor = this.moveX;
    }
    get selectedEditor() {
        return this._selectedEditor;
    }
    set selectedEditor(val) {
        if (val === this._selectedEditor)
            return;
        if (this._selectedEditor)
            this._selectedEditor.active = false;
        this._selectedEditor = val;
        val.active = true;
        this.updateAdjustmentOptions(val);
        this.nodesSelection = new Set();
        this.draw();
    }
    get selectedLayer() {
        return this._selectedLayer;
    }
    set selectedLayer(val) {
        this._selectedLayer = val;
        ["moveX", "moveY", "alpha", "rotate", "speed"].forEach((type) => {
            this[type].changeTarget(this.target, val);
        });
    }
    draw(beats) {
        beats = beats || this.lastBeats;
        this.lastBeats = beats;
        //console.log("draw")
        if (this.selectedEditor === this.easing) {
            this.easing.draw(this.easingBeats);
        }
        else {
            this.selectedEditor.draw(beats);
        }
    }
    changeTarget(target) {
        ["moveX", "moveY", "alpha", "rotate", "speed"].forEach((type) => {
            this[type].changeTarget(target, this.selectedLayer);
        });
        this.target = target;
        this.draw();
    }
    updateAdjustmentOptions(editor) {
        this.$rangeInput.setValue(editor.autoRangeEnabled ? "auto" : editor.valueRange.join("，"));
    }
}
var EventCurveEditorState;
(function (EventCurveEditorState) {
    EventCurveEditorState[EventCurveEditorState["select"] = 0] = "select";
    EventCurveEditorState[EventCurveEditorState["selecting"] = 1] = "selecting";
    EventCurveEditorState[EventCurveEditorState["edit"] = 2] = "edit";
    EventCurveEditorState[EventCurveEditorState["flowing"] = 3] = "flowing";
    EventCurveEditorState[EventCurveEditorState["selectScope"] = 4] = "selectScope";
    EventCurveEditorState[EventCurveEditorState["selectingScope"] = 5] = "selectingScope";
})(EventCurveEditorState || (EventCurveEditorState = {}));
const lengthOf = (range) => range[1] - range[0];
const medianOf = (range) => (range[0] + range[1]) / 2;
const percentileOf = (range, percent) => range[0] + lengthOf(range) * percent;
/**
 * 对于一个值，在一系列可吸附值上寻找最接近的值
 * @param sortedAttachable
 * @param value
 * @returns
 */
const computeAttach = (sortedAttachable, value) => {
    const len = sortedAttachable.length;
    if (len === 0)
        return value;
    if (value < sortedAttachable[0]) {
        return sortedAttachable[0];
    }
    for (let i = 0; i < len - 1; i++) {
        const cur = sortedAttachable[i];
        if (value === cur) {
            return cur;
        }
        const next = sortedAttachable[i + 1];
        if (value > cur && value < next) {
            return (value - cur) < (next - value) ? cur : next;
        }
    }
    if (value > sortedAttachable[len - 1]) {
        return sortedAttachable[len - 1];
    }
};
/**
 * 生成可吸附值
 * @param linear 一次函数的两个系数
 * @param range 显示范围
 */
function generateAttachable(linear, range) {
    const k = linear[0], b = linear[1];
    const left = range[0], right = range[1];
    if (k <= 1e-6) {
        return [left, b, right];
    }
    const startingX = Math.floor((left - b) / k);
    const attachable = [];
    for (let i = startingX;; i++) {
        const val = k * i + b;
        attachable.push(k * i + b);
        if (val > right)
            break;
    }
    return attachable;
}
function divideOrMul(gridSpan, maximum) {
    const m = Math.floor(maximum);
    if (m === 0) {
        const times = Math.floor(1 / maximum);
        return gridSpan * times;
    }
    if (isNaN(gridSpan) || isNaN(m)) {
        debugger;
    }
    if (!Number.isInteger(gridSpan)) {
        return gridSpan / m;
    }
    else {
        // 有的时候maximum莫名其妙整的特大，采取这种方式
        if (gridSpan < maximum) {
            return 1;
        }
        for (let i = m; i >= 1; i--) {
            if (gridSpan % i === 0) {
                return gridSpan / i;
            }
        }
    }
}
class EventCurveEditor {
    get selectedNode() {
        if (!this._selectedNode) {
            return undefined;
        }
        return this._selectedNode.deref();
    }
    set selectedNode(val) {
        this._selectedNode = new WeakRef(val);
        editor.eventEditor.target = val;
    }
    /** @deprecated use active instead */
    get displayed() { return this.active; }
    set displayed(val) { this.active = val; }
    get active() {
        return this._active;
    }
    set active(val) {
        if (val === this._active) {
            return;
        }
        this._active = val;
        if (val) {
            this.element.style.display = "";
        }
        else {
            this.element.style.display = "none";
        }
    }
    constructor(type, height, width, parent) {
        this.type = type;
        this.attachableValues = [];
        this.newNodeState = NewNodeState.controlsBoth;
        this.autoRangeEnabled = true;
        const config = eventTypeMap[type];
        if (type === EventType.alpha) {
            this.autoRangeEnabled = false;
        }
        this.parentEditorSet = parent;
        this._active = true;
        this.$element = $("div");
        this.element = this.$element.element;
        this.active = false;
        this.state = EventCurveEditorState.select;
        this.selectionManager = new SelectionManager();
        this.canvas = document.createElement("canvas");
        this.element.append(this.canvas);
        this.canvas.width = width;
        this.canvas.height = height;
        this.padding = 14;
        this.innerHeight = this.canvas.height - this.padding * 2;
        this.innerWidth = this.canvas.width - this.padding * 2;
        this.context = this.canvas.getContext("2d");
        this.timeSpan = 4;
        // this.halfCent = this.halfRange * 100;
        this.valueRange = config.valueRange;
        this.valueRatio = this.innerHeight / lengthOf(this.valueRange);
        this.attachableValues = generateAttachable([config.valueGridSpan, 0], this.valueRange);
        this.timeRatio = this.innerWidth / this.timeSpan;
        this.timeGridSpan = 1;
        this.timeGridColor = [120, 255, 170];
        this.valueGridColor = [255, 170, 120];
        this.initContext();
        this.easing = easingMap.linear.in;
        // 下面有一堆监听器
        // #region
        parent.$editSwitch.whenClickChange((checked) => {
            this.state = checked ? EventCurveEditorState.edit : EventCurveEditorState.select;
        });
        parent.$timeSpanInput.whenValueChange((val) => {
            this.timeSpan = parent.$timeSpanInput.getNum();
            this.draw();
        });
        on(["mousemove", "touchmove"], this.canvas, (event) => {
            const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
            const coord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
            const { x, y } = coord;
            const { padding } = this;
            const { x: beats, y: value } = coord.mul(this.invertedMatrix);
            this.pointedValue = computeAttach(this.attachableValues, value);
            const accurateBeats = beats + this.lastBeats;
            this.pointedBeats = Math.floor(accurateBeats);
            this.beatFraction = Math.round((accurateBeats - this.pointedBeats) * editor.timeDivisor);
            if (this.beatFraction === editor.timeDivisor) {
                this.pointedBeats += 1;
                this.beatFraction = 0;
            }
            switch (this.state) {
                case EventCurveEditorState.selecting:
                    // console.log("det")
                    editor.operationList.do(new EventNodeValueChangeOperation(this.selectedNode, this.pointedValue));
                    editor.operationList.do(new EventNodeTimeChangeOperation(this.selectedNode, [this.pointedBeats, this.beatFraction, editor.timeDivisor]));
            }
            this.draw();
        });
        on(["mousedown", "touchstart"], this.canvas, (event) => {
            this.downHandler(event);
            this.draw();
        });
        on(["mouseup", "touchend"], this.canvas, (event) => {
            this.upHandler(event);
            this.draw();
        });
        parent.$selectOption.onChange((v) => {
            this.selectState = SelectState[v];
            if (this.selectState === SelectState.none) {
                this.state = EventCurveEditorState.select;
            }
            else {
                this.state = EventCurveEditorState.selectScope;
            }
        });
        this.mouseIn = false;
        this.canvas.addEventListener("mouseenter", () => {
            this.mouseIn = true;
        });
        this.canvas.addEventListener("mouseleave", () => {
            this.mouseIn = false;
        });
        parent.$copyButton.onClick(() => {
            this.copy();
        });
        parent.$pasteButton.onClick(() => {
            this.paste();
        });
        parent.$encapsuleBtn.onClick(() => {
            if (!this.active) {
                return;
            }
            const $input = this.parentEditorSet.$templateNameInput;
            const name = $input.getValue();
            if (name === "") {
                notify("Please input template name");
                return;
            }
            const lib = editor.chart.templateEasingLib;
            if (name in lib.easings) {
                notify("Template name already exists");
                return;
            }
            const op = encapsule(lib, this.target, this.parentEditorSet.nodesSelection, name);
            if (op === EncapsuleErrorType.NotBelongToSourceSequence) {
                notify("Not belong to source sequence");
            }
            else if (op === EncapsuleErrorType.NotContinuous) {
                notify("Not continuous");
            }
            else if (op === EncapsuleErrorType.ZeroDelta) {
                notify("Selected first and last eventStartNode has zero delta");
            }
            else {
                editor.operationList.do(op);
                parent.$templateNameInput.dispatchEvent(new ZValueChangeEvent());
            }
        });
        window.addEventListener("keydown", (e) => {
            if (!this.mouseIn) {
                return;
            }
            if (document.activeElement !== document.body) {
                return;
            }
            e.preventDefault();
            switch (e.key.toLowerCase()) {
                case "v":
                    this.paste();
                    break;
                case "c":
                    this.copy();
                    break;
            }
        });
        // #endregion
    }
    updateMatrix() {
        this.valueRatio = this.innerHeight / lengthOf(this.valueRange);
        this.timeRatio = this.innerWidth / this.timeSpan;
        const { timeSpan: timeRange, valueRange, timeRatio, valueRatio } = this;
        this.matrix = identity.scale(timeRatio, -valueRatio).translate(0, -medianOf(valueRange));
        this.invertedMatrix = this.matrix.invert();
        // console.log(this.matrix);
        // console.log(identity.translate(0, -valueBasis * valueRange))
        this.canvasMatrix = Matrix.fromDOMMatrix(this.context.getTransform());
        this.invertedCanvasMatrix = this.canvasMatrix.invert();
    }
    appendTo(parent) {
        parent.append(this.element);
    }
    downHandler(event) {
        var _a;
        const { width, height } = this.canvas;
        const { padding } = this;
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        const coord = canvasCoord.mul(this.invertedMatrix);
        this.canvasPoint = canvasCoord;
        // console.log("ECECoord:" , [x, y])
        switch (this.state) {
            case EventCurveEditorState.select:
            case EventCurveEditorState.selecting:
                const snode = this.selectionManager.click(canvasCoord);
                this.state = !snode ? EventCurveEditorState.select : EventCurveEditorState.selecting;
                if (snode) {
                    this.selectedNode = snode.target;
                    editor.switchSide(editor.eventEditor);
                }
                // console.log(EventCurveEditorState[this.state])
                this.wasEditing = false;
                break;
            case EventCurveEditorState.edit:
                const timeDivisor = editor.timeDivisor;
                const { beatFraction, pointedBeats } = this;
                const time = [pointedBeats, beatFraction, timeDivisor];
                const prev = this.target.getNodeAt(TimeCalculator.toBeats(time));
                if (TimeCalculator.eq(prev.time, time)) {
                    break;
                }
                let node, endNode;
                if (this.type === EventType.bpm) {
                    node = new BPMStartNode(time, this.pointedValue);
                    endNode = new BPMEndNode(time);
                }
                else {
                    endNode = new EventEndNode(time, this.newNodeState === NewNodeState.controlsStart ? prev.value : this.pointedValue);
                    node = new EventStartNode(time, this.newNodeState === NewNodeState.controlsEnd ? prev.value : this.pointedValue);
                }
                node.easing = (_a = this.parentEditorSet.easing.targetEasing) !== null && _a !== void 0 ? _a : this.easing;
                EventNode.connect(endNode, node);
                // this.editor.chart.getComboInfoEntity(startTime).add(note)
                editor.operationList.do(new EventNodePairInsertOperation(node, prev));
                if (this.type === EventType.bpm) {
                    editor.player.audio.currentTime = editor.chart.timeCalculator.toSeconds(this.lastBeats);
                }
                this.selectedNode = node;
                this.state = EventCurveEditorState.selecting;
                this.parentEditorSet.$editSwitch.checked = false;
                this.wasEditing = true;
                break;
            case EventCurveEditorState.selectScope:
                this.startingPoint = coord;
                this.startingCanvasPoint = canvasCoord;
                this.state = EventCurveEditorState.selectingScope;
                break;
        }
    }
    upHandler(event) {
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        const { x, y } = canvasCoord.mul(this.invertedMatrix);
        switch (this.state) {
            case EventCurveEditorState.selecting:
                if (!this.wasEditing) {
                    this.state = EventCurveEditorState.select;
                }
                else {
                    this.state = EventCurveEditorState.edit;
                    this.parentEditorSet.$editSwitch.checked = true;
                }
                break;
            case EventCurveEditorState.selectingScope:
                const [sx, ex] = [this.startingCanvasPoint.x, canvasCoord.x].sort((a, b) => a - b);
                const [sy, ey] = [this.startingCanvasPoint.y, canvasCoord.y].sort((a, b) => a - b);
                const array = this.selectionManager.selectScope(sy, sx, ey, ex);
                // console.log("Arr", array);
                // console.log(sx, sy, ex, ey)
                const nodes = array.map(x => x.target).filter(x => x instanceof EventStartNode);
                // console.log(nodes);
                switch (this.selectState) {
                    case SelectState.extend:
                        this.parentEditorSet.nodesSelection = this.parentEditorSet.nodesSelection.union(new Set(nodes));
                        break;
                    case SelectState.replace:
                        this.parentEditorSet.nodesSelection = new Set(nodes);
                        break;
                    case SelectState.exclude:
                        this.parentEditorSet.nodesSelection = this.parentEditorSet.nodesSelection.difference(new Set(nodes));
                        break;
                }
                this.parentEditorSet.nodesSelection = new Set([...this.parentEditorSet.nodesSelection].filter((note) => !!note.parentSeq));
                // console.log("bp")
                if (this.parentEditorSet.nodesSelection.size !== 0) {
                    editor.multiNodeEditor.target = this.parentEditorSet.nodesSelection;
                    editor.switchSide(editor.multiNodeEditor);
                }
                this.state = EventCurveEditorState.selectScope;
                break;
            default:
                this.state = EventCurveEditorState.select;
        }
    }
    initContext() {
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.context.strokeStyle = "#EEE";
        this.context.fillStyle = "#333";
        this.context.lineWidth = 2;
    }
    drawCoordination(beats) {
        const { height: canvasHeight, width: canvasWidth } = this.canvas;
        const { innerHeight, innerWidth } = this;
        const { attachableValues, timeGridSpan, valueRange, valueRatio, timeRatio, context } = this;
        const timeDivisor = editor.timeDivisor;
        context.fillRect(-canvasWidth / 2, -canvasHeight / 2, canvasWidth, canvasHeight);
        // const beatCents = beats * 100
        // const middleValue = Math.round(-this.basis / this.valueRatio)
        const basis = -medianOf(valueRange) / lengthOf(valueRange) * this.innerHeight;
        // 计算上下界
        context.save();
        context.fillStyle = "#EEE";
        context.strokeStyle = rgb(...this.valueGridColor);
        context.lineWidth = 1;
        const len = attachableValues.length;
        for (let i = 0; i < len; i++) {
            const value = attachableValues[i];
            const positionY = this.matrix.ymul(0, value);
            drawLine(context, -canvasWidth / 2, positionY, canvasWidth, positionY);
            context.fillText(value + "", -innerWidth / 2, positionY);
        }
        context.strokeStyle = rgb(...this.timeGridColor);
        const stopBeats = Math.ceil((beats + this.timeSpan / 2) / timeGridSpan) * timeGridSpan;
        const startBeats = Math.ceil((beats - this.timeSpan / 2) / timeGridSpan - 1) * timeGridSpan;
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionX = (time - beats) * timeRatio;
            drawLine(context, positionX, innerHeight / 2, positionX, -innerHeight / 2);
            context.fillText(time + "", positionX, innerHeight / 2);
            context.save();
            context.lineWidth = 1;
            for (let i = 1; i < timeDivisor; i++) {
                const minorPosX = (time + i / timeDivisor - beats) * timeRatio;
                drawLine(context, minorPosX, innerHeight / 2, minorPosX, -innerHeight / 2);
            }
            context.restore();
        }
        context.restore();
        context.lineWidth = 3;
        drawLine(context, 0, innerHeight / 2, 0, -innerHeight / 2);
        context.strokeStyle = "#EEE";
    }
    draw(beats) {
        if (!this.target) {
            return;
        }
        beats = beats || this.lastBeats || 0;
        this.updateMatrix();
        const { height, width } = this.canvas;
        const { timeRatio, valueRatio, context, selectionManager, matrix } = this;
        selectionManager.refresh();
        this.drawCoordination(beats);
        context.save();
        context.fillStyle = "#EEE";
        context.fillText("State: " + EventCurveEditorState[this.state], 10, -30);
        context.fillText("Beats: " + shortenFloat(beats, 4).toString(), 10, -10);
        context.fillText("Sequence: " + this.target.id, 10, -50);
        context.fillText(`Last Frame Took: ${shortenFloat(editor.renderingTime, 2) || 'N/A'}ms, fps: ${Math.round(1000 / editor.renderingTime)}`, 10, -70);
        if (this.pointedBeats) {
            context.fillText(`pointedTime: ${this.pointedBeats}:${this.beatFraction}:${editor.timeDivisor}`, 10, 10);
        }
        if (this.canvasPoint) {
            this.context.fillText(`Cursor: ${this.canvasPoint.x}, ${this.canvasPoint.y}`, 10, -90);
        }
        context.restore();
        const startBeats = beats - this.timeSpan / 2;
        const endBeats = beats + this.timeSpan / 2;
        let previousEndNode = this.target.getNodeAt(startBeats < 0 ? 0 : startBeats).previous || this.target.head; // 有点奇怪的操作
        let previousTime = "heading" in previousEndNode ? 0 : TimeCalculator.toBeats(previousEndNode.time);
        // 该数组用于自动调整网格
        const valueArray = [];
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
            valueArray.push(startValue, endValue);
            const { x: startX, y: startY } = new Coordinate(startTime - beats, startValue).mul(matrix);
            // console.log("startXY", startX, startY);
            // console.log(Matrix.fromDOMMatrix(context.getTransform()))
            const { x: endX, y: endY } = new Coordinate(endTime - beats, endValue).mul(matrix);
            const topY = startY - NODE_HEIGHT / 2;
            const topEndY = endY - NODE_HEIGHT / 2;
            selectionManager.add({
                target: startNode,
                left: startX,
                top: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, startX, topY);
            selectionManager.add({
                target: endNode,
                left: endX - NODE_WIDTH,
                top: topEndY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, endX - NODE_WIDTH, topEndY + NODE_HEIGHT + 20);
            const selected = this.parentEditorSet.nodesSelection.has(startNode);
            if (selected) {
                context.save();
                context.strokeStyle = 'cyan';
            }
            startNode.drawCurve(context, startX, startY, endX, endY, matrix);
            if (selected) {
                context.restore();
            }
            context.drawImage(NODE_START, startX, topY, NODE_WIDTH, NODE_HEIGHT);
            context.drawImage(NODE_END, endX - NODE_WIDTH, topEndY, NODE_WIDTH, NODE_HEIGHT);
            // console.log(this.type, EventType.speed)
            if (this.type === EventType.speed) {
                // console.log(startNode)
                // console.log(startNode.easing)
                context.lineWidth = 1;
                context.fillText(("" + startNode.cachedIntegral).slice(0, 6), startX, 0);
                context.lineWidth = 3;
            }
            previousEndNode = endNode;
            previousTime = endTime;
        }
        if ("tailing" in previousEndNode.next.next) {
            const lastStart = previousEndNode.next;
            const startTime = TimeCalculator.toBeats(lastStart.time);
            const startValue = lastStart.value;
            const { x: startX, y: startY } = new Coordinate(startTime - beats, startValue).mul(matrix);
            const topY = startY - NODE_HEIGHT / 2;
            const selected = this.parentEditorSet.nodesSelection.has(lastStart);
            if (selected) {
                context.save();
                context.strokeStyle = 'cyan';
            }
            drawLine(context, startX, startY, width / 2, startY);
            if (selected) {
                context.restore();
            }
            context.drawImage(NODE_START, startX, startY - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT);
            selectionManager.add({
                target: lastStart,
                left: startX,
                top: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, startX, topY);
        }
        this.adjust(valueArray);
        if (this.state === EventCurveEditorState.selectingScope) {
            const { startingCanvasPoint, canvasPoint } = this;
            context.save();
            context.strokeStyle = "#84F";
            context.strokeRect(startingCanvasPoint.x, startingCanvasPoint.y, canvasPoint.x - startingCanvasPoint.x, canvasPoint.y - startingCanvasPoint.y);
            context.restore();
        }
        this.lastBeats = beats;
    }
    adjust(values) {
        if (this.state !== EventCurveEditorState.select) {
            return;
        }
        const valueRange = this.valueRange;
        const distinctValueCount = new Set(values).size;
        if (distinctValueCount < 2 && valueRange[0] < values[0] && values[0] < valueRange[1]) {
            return;
        }
        if (this.autoRangeEnabled) {
            const sorted = values.sort((a, b) => a - b);
            const lengthOfValue = lengthOf(valueRange);
            // 如果上四分位数超出了valueRange，则扩大valueRange右边界valueRange长度的一半。
            // 如果上四分位数不及valueRange的2/3处位置，则缩小valueRange右边界valueRange长度的一半。
            // 下四分位数同理
            const upper = getPercentile(sorted, 0.95);
            const lower = getPercentile(sorted, 0.05);
            const pos1Third = percentileOf(valueRange, 0.34);
            const pos2Third = percentileOf(valueRange, 0.66);
            const range = [...this.valueRange];
            if (upper > valueRange[1]) {
                range[1] = valueRange[1] + lengthOfValue / 2;
            }
            else if (upper < pos2Third) {
                range[1] = valueRange[1] - lengthOfValue / 3;
            }
            if (lower < valueRange[0]) {
                range[0] = valueRange[0] - lengthOfValue / 2;
            }
            else if (lower > pos1Third) {
                range[0] = valueRange[0] + lengthOfValue / 3;
            }
            this.valueRange = range;
        }
        // 计算合适的valueGridSpan
        // 根据这个值能够整除多少个值。
        let priority = 0;
        let valueGridSpan = eventTypeMap[this.type].valueGridSpan;
        const len = values.length;
        for (let i = 0; i < len; i++) {
            const v = values[i];
            if (v === 0) {
                continue;
            }
            const p = values.reduce((acc, cur) => {
                return cur % v === 0 ? acc + 1 : acc;
            });
            if (p > priority * 1.2) {
                priority = p;
                valueGridSpan = v;
            }
        }
        valueGridSpan = divideOrMul(valueGridSpan, 10 / (lengthOf(this.valueRange) / valueGridSpan));
        if (distinctValueCount > 10) {
            this.attachableValues = generateAttachable([valueGridSpan, 0], this.valueRange);
        }
        else {
            this.attachableValues = Array.from(new Set([...generateAttachable([valueGridSpan, 0], this.valueRange), ...values])).sort((a, b) => a - b);
        }
    }
    changeTarget(line, index) {
        if (this.type === EventType.easing) {
            console.error("Easing does not use changeTarget. Assign directly instead.");
            return;
        }
        line.eventLayers[index] = line.eventLayers[index] || {};
        const seq = line.eventLayers[index][EventType[this.type]];
        if (seq) {
            this.target = seq;
        }
        else {
            this.target = EventNodeSequence.newSeq(this.type, editor.chart.getEffectiveBeats());
            this.target.id = `#${line.id}.${index}.${EventType[this.type]}`;
        }
    }
    paste() {
        if (!this.active) {
            return;
        }
        const { lastBeats } = this;
        const { clipboard } = this.parentEditorSet;
        const { timeDivisor } = editor;
        if (!clipboard || clipboard.size === 0) {
            return;
        }
        if (!lastBeats) {
            notify("Have not rendered a frame");
        }
        const dest = [this.pointedBeats, this.beatFraction, timeDivisor];
        const [_, newNodes] = EventNode.setToNewOrderedArray(dest, clipboard);
        editor.operationList.do(new MultiNodeAddOperation(newNodes, this.target));
        editor.multiNodeEditor.target = this.parentEditorSet.nodesSelection = new Set(newNodes);
        editor.update();
    }
    copy() {
        if (!this.active) {
            return;
        }
        console.log(this.parentEditorSet.nodesSelection);
        this.parentEditorSet.clipboard = this.parentEditorSet.nodesSelection;
        this.parentEditorSet.nodesSelection = new Set();
        editor.update();
    }
}
const DRAWS_NN = true;
const COLOR_1 = "#66ccff";
const COLOR_2 = "#ffcc66";
const HEAD = 1;
const BODY = 2;
const TAIL = 3;
var NotesEditorState;
(function (NotesEditorState) {
    NotesEditorState[NotesEditorState["select"] = 0] = "select";
    NotesEditorState[NotesEditorState["selecting"] = 1] = "selecting";
    NotesEditorState[NotesEditorState["edit"] = 2] = "edit";
    NotesEditorState[NotesEditorState["selectScope"] = 3] = "selectScope";
    NotesEditorState[NotesEditorState["selectingScope"] = 4] = "selectingScope";
    NotesEditorState[NotesEditorState["flowing"] = 5] = "flowing";
})(NotesEditorState || (NotesEditorState = {}));
class HoldTail {
    constructor(note) {
        this.note = note;
    }
}
const timeToString = (time) => {
    return `${time[0]}:${time[1]}/${time[2]}`;
};
var SelectState;
(function (SelectState) {
    SelectState[SelectState["none"] = 0] = "none";
    SelectState[SelectState["extend"] = 1] = "extend";
    SelectState[SelectState["replace"] = 2] = "replace";
    SelectState[SelectState["exclude"] = 3] = "exclude";
})(SelectState || (SelectState = {}));
class NotesEditor extends Z {
    get target() {
        return this._target;
    }
    set target(line) {
        if (this._target === line) {
            return;
        }
        this._target = line;
        // update the OptionBox options
        const options = [this.allOption];
        for (let lists of [line.nnLists, line.hnLists]) {
            for (let [name, list] of lists) {
                const option = new EditableBoxOption(name, (_, t) => {
                    lists[name] = null;
                    name = t;
                    lists[name] = list;
                }, () => this.targetTree = list);
                options.push(option);
            }
        }
        this.$optionBox.replaceWithOptions(options);
        if (this.targetTree) {
            const name = this.targetTree.id || "#1";
            options.forEach((option) => {
                if (option.text === name) {
                    this.$optionBox.value = option;
                }
            });
            if (this.targetTree instanceof HNList) {
                if (line.hnLists.has(name)) {
                    this.targetTree = line.hnLists.get(name);
                }
                else {
                    this.targetTree = null;
                    this.$optionBox.value = this.allOption;
                }
            }
            else {
                if (line.nnLists.has(name)) {
                    this.targetTree = line.nnLists.get(name);
                }
                else {
                    this.targetTree = null;
                    this.$optionBox.value = this.allOption;
                }
            }
        }
    }
    constructor(editor) {
        super("div");
        this.addClass("notes-editor");
        this.selectionManager = new SelectionManager();
        this.allOption = new EditableBoxOption("*", (_s, t) => { }, () => this.targetTree = null, () => undefined, false);
        this.$statusBar = $("div").addClass("notes-editor-status-bar");
        this.append(this.$statusBar);
        this.$optionBox = new ZEditableDropdownOptionBox([this.allOption]);
        this.$typeOption = new ZDropdownOptionBox(arrayForIn([
            "tap", "hold", "flick", "drag"
        ], (v) => new BoxOption(v))).onChange(() => this.noteType = NoteType[this.$typeOption.value.text]);
        this.$noteAboveOption = new ZDropdownOptionBox([new BoxOption("above"), new BoxOption("below")])
            .onChange(() => this.noteAbove = this.$noteAboveOption.value.text === "above");
        this.notesSelection = new Set();
        this.$selectOption = new ZDropdownOptionBox(["none", "extend", "replace", "exclude"].map(v => new BoxOption(v)))
            .onChange((v) => {
            this.selectState = SelectState[v];
            if (this.selectState === SelectState.none) {
                this.state = NotesEditorState.select;
            }
            else {
                this.state = NotesEditorState.selectScope;
            }
        });
        this.noteAbove = true;
        this.$copyButton = new ZButton("Copy")
            .onClick(() => {
            this.copy();
        });
        this.$pasteButton = new ZButton("Paste")
            .onClick(() => {
            this.paste();
        });
        this.$editButton = new ZSwitch("Edit")
            .whenClickChange((checked) => {
            this.state = checked ? NotesEditorState.edit : NotesEditorState.select;
        });
        this.$statusBar.append(this.$optionBox, this.$typeOption, this.$noteAboveOption, this.$editButton, this.$copyButton, this.$pasteButton, this.$selectOption);
        this.editor = editor;
        this.padding = 10;
        this.targetTree = null;
        this.state = NotesEditorState.select;
        this.wasEditing = false;
        this.positionBasis = 0;
        this.positionGridSpan = 135;
        this.positionSpan = 1350;
        this.timeGridSpan = 1;
        this.timeSpan = 2;
        this.noteType = NoteType.tap;
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.append(this.canvas);
        on(["mousedown", "touchstart"], this.canvas, (event) => { this.downHandler(event); });
        on(["mouseup", "touchend"], this.canvas, (event) => this.upHandler(event));
        on(["mousemove", "touchmove"], this.canvas, (event) => {
            const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
            const canvasCoord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
            const { x, y } = canvasCoord.mul(this.invertedMatrix);
            // const {width, height} = this.canvas
            // const {padding} = this;
            this.pointedPositionX = Math.round((x) / this.positionGridSpan) * this.positionGridSpan;
            const accurateBeats = y + this.lastBeats;
            this.pointedBeats = Math.floor(accurateBeats);
            this.beatFraction = Math.round((accurateBeats - this.pointedBeats) * editor.timeDivisor);
            if (this.beatFraction === editor.timeDivisor) {
                this.pointedBeats += 1;
                this.beatFraction = 0;
            }
            switch (this.state) {
                case NotesEditorState.selecting:
                    console.log("det");
                    console.log(this.selectedNote);
                    if (!this.selectedNote) {
                        console.warn("Unexpected error: selected note does not exist");
                        break;
                    }
                    const timeT = [this.pointedBeats, this.beatFraction, editor.timeDivisor];
                    editor.operationList.do(new NoteValueChangeOperation(this.selectedNote, "positionX", this.pointedPositionX));
                    if (this.selectingTail) {
                        editor.operationList.do(new HoldEndTimeChangeOperation(this.selectedNote, timeT));
                    }
                    else {
                        editor.operationList.do(new NoteTimeChangeOperation(this.selectedNote, this.selectedNote.parentNode.parentSeq.getNodeOf(timeT)));
                    }
            }
        });
        on(["mousedown", "mousemove", "touchstart", "touchmove"], this.canvas, (event) => {
            if (this.drawn) {
                return;
            }
            this.draw();
        });
        this.canvas.addEventListener("mouseenter", () => {
            this.mouseIn = true;
        });
        this.canvas.addEventListener("mouseleave", () => {
            this.mouseIn = false;
        });
        const map = { q: NoteType.tap, w: NoteType.drag, e: NoteType.flick, r: NoteType.hold };
        window.addEventListener("keydown", (e) => {
            console.log("Key down:", e.key);
            if (!this.mouseIn) {
                return;
            }
            if (document.activeElement !== document.body) {
                return;
            }
            e.preventDefault();
            switch (e.key.toLowerCase()) {
                case "v":
                    this.paste();
                    break;
                case "c":
                    this.copy();
                    break;
                case "q":
                case "w":
                case "e":
                case "r":
                    const noteType = map[e.key.toLowerCase()];
                    const { beatFraction, pointedBeats } = this;
                    const startTime = [pointedBeats, beatFraction, editor.timeDivisor];
                    const endTime = this.noteType === NoteType.hold ? [pointedBeats + 1, 0, 1] : [...startTime];
                    const note = new Note({
                        endTime: endTime,
                        startTime: startTime,
                        visibleTime: 99999,
                        positionX: this.pointedPositionX,
                        alpha: 255,
                        above: this.noteAbove ? 1 : 0,
                        isFake: 0,
                        size: 1.0,
                        speed: 1.0,
                        type: noteType,
                        yOffset: 0
                    });
                    // this.editor.chart.getComboInfoEntity(startTime).add(note)
                    this.editor.operationList.do(new NoteAddOperation(note, this.target.getNode(note, true)));
                    break;
            }
        });
        /*
        window.addEventListener("resize", () => {
            const {clientHeight: outerHeight, clientWidth: outerWidth} = editor.$preview.element;
            const {clientHeight, clientWidth} = editor.player.canvas;
            this.canvas.width = outerWidth - clientWidth;
            this.canvas.height = outerHeight;
        });
        //*/
        this.timeGridColor = [120, 255, 170];
        this.positionGridColor = [255, 170, 120];
    }
    downHandler(event) {
        const { width, height } = this.canvas;
        // console.log(width, height)
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        const coord = canvasCoord.mul(this.invertedMatrix);
        const { x, y } = coord;
        // console.log("offset:", offsetX, offsetY)
        // console.log("Coord:", x, y);
        switch (this.state) {
            case NotesEditorState.select:
            case NotesEditorState.selecting:
                const snote = this.selectionManager.click(canvasCoord);
                this.state = !snote ? NotesEditorState.select : NotesEditorState.selecting;
                if (snote) {
                    const tar = snote.target;
                    const isTail = this.selectingTail = tar instanceof HoldTail;
                    this.selectedNote = isTail ? tar.note : tar;
                    this.editor.switchSide(editor.noteEditor);
                }
                console.log(NotesEditorState[this.state]);
                this.wasEditing = false;
                break;
            case NotesEditorState.edit:
                const { beatFraction, pointedBeats } = this;
                const startTime = [pointedBeats, beatFraction, editor.timeDivisor];
                const endTime = this.noteType === NoteType.hold ? [pointedBeats + 1, 0, 1] : [...startTime];
                const note = new Note({
                    endTime: endTime,
                    startTime: startTime,
                    visibleTime: 99999,
                    positionX: this.pointedPositionX,
                    alpha: 255,
                    above: this.noteAbove ? 1 : 0,
                    isFake: 0,
                    size: 1.0,
                    speed: 1.0,
                    type: this.noteType,
                    yOffset: 0
                });
                // this.editor.chart.getComboInfoEntity(startTime).add(note)
                this.editor.operationList.do(new NoteAddOperation(note, this.target.getNode(note, true)));
                this.selectedNote = note;
                if (note.type === NoteType.hold) {
                    this.selectingTail = true;
                }
                this.state = NotesEditorState.selecting;
                this.editor.switchSide(this.editor.noteEditor);
                this.$editButton.checked = false;
                this.wasEditing = true;
                break;
            case NotesEditorState.selectScope:
                this.startingPoint = coord;
                this.startingCanvasPoint = canvasCoord;
                this.state = NotesEditorState.selectingScope;
                break;
        }
    }
    upHandler(event) {
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        const { x, y } = canvasCoord.mul(this.invertedMatrix);
        switch (this.state) {
            case NotesEditorState.selecting:
                this.state = this.wasEditing ? NotesEditorState.edit : NotesEditorState.select;
                if (this.wasEditing) {
                    this.$editButton.checked = true;
                }
                break;
            case NotesEditorState.selectingScope:
                const [sx, ex] = [this.startingCanvasPoint.x, canvasCoord.x].sort((a, b) => a - b);
                const [sy, ey] = [this.startingCanvasPoint.y, canvasCoord.y].sort((a, b) => a - b);
                const array = this.selectionManager.selectScope(sy, sx, ey, ex);
                // console.log("Arr", array);
                // console.log(sx, sy, ex, ey)
                const notes = array.map(x => x.target).filter(x => x instanceof Note);
                switch (this.selectState) {
                    case SelectState.extend:
                        this.notesSelection = this.notesSelection.union(new Set(notes));
                        break;
                    case SelectState.replace:
                        this.notesSelection = new Set(notes);
                        break;
                    case SelectState.exclude:
                        this.notesSelection = this.notesSelection.difference(new Set(notes));
                        break;
                }
                this.notesSelection = new Set([...this.notesSelection].filter((note) => !!note.parentNode));
                // console.log("bp")
                if (this.notesSelection.size !== 0) {
                    this.editor.multiNoteEditor.target = this.notesSelection;
                    this.editor.switchSide(editor.multiNoteEditor);
                }
                this.state = NotesEditorState.selectScope;
                break;
        }
    }
    get selectedNote() {
        if (!this._selectedNote) {
            return undefined;
        }
        return this._selectedNote.deref();
    }
    set selectedNote(val) {
        this._selectedNote = new WeakRef(val);
        this.editor.noteEditor.target = val;
    }
    updateMatrix() {
        this.positionRatio = this.canvas.width / this.positionSpan;
        this.timeRatio = this.canvas.height / this.timeSpan;
        const { 
        // timeSpan,
        // positionSpan,
        timeRatio, positionRatio } = this;
        this.matrix = identity.scale(positionRatio, -timeRatio);
        this.invertedMatrix = this.matrix.invert();
        this.canvasMatrix = Matrix.fromDOMMatrix(this.context.getTransform());
        this.invertedCanvasMatrix = this.canvasMatrix.invert();
    }
    init(width, height) {
        this.positionRatio = width / 1350;
        this.canvas.width = width;
        this.canvas.height = height - this.$statusBar.clientHeight;
        this.context.translate(this.canvas.width / 2, this.canvas.height - this.padding);
        this.context.strokeStyle = "#EEE";
        this.context.fillStyle = "#333";
        this.context.font = "20px phigros";
        this.context.lineWidth = 2;
    }
    drawCoordination(beats) {
        const { context, canvas } = this;
        const { width: canvasWidth, height: canvasHeight } = canvas;
        // console.log(canvasWidth, canvasHeight)
        const { positionGridSpan, positionRatio, positionSpan: positionRange, positionBasis, timeGridSpan, timeSpan, timeRatio, padding, pointedBeats, beatFraction } = this;
        const width = canvasWidth - padding * 2;
        const height = canvasHeight - padding * 2;
        context.fillStyle = "#333";
        context.fillRect(-canvasWidth / 2, padding - canvasHeight, canvasWidth, canvasHeight);
        context.save();
        context.lineWidth = 5;
        context.strokeStyle = "#EEE";
        // 基线
        drawLine(context, -canvasWidth / 2, 0, canvasWidth / 2, 0);
        context.fillStyle = "#EEE";
        context.fillText("State:" + NotesEditorState[this.state], 0, -height + 20);
        if (pointedBeats)
            context.fillText(`PointedTime: ${pointedBeats}:${beatFraction}/${this.editor.timeDivisor}`, 0, -height + 70);
        if (this.targetTree && this.targetTree.timeRanges) {
            context.fillText("Range:" + arrayForIn(this.targetTree.timeRanges, (range) => range.join("-")).join(","), -100, -height + 50);
        }
        context.restore();
        // 绘制x坐标线
        // 计算上下界
        const upperEnd = Math.ceil((width / 2 - positionBasis) / positionGridSpan / positionRatio) * positionGridSpan;
        const lowerEnd = Math.ceil((-width / 2 - positionBasis) / positionGridSpan / positionRatio) * positionGridSpan;
        context.strokeStyle = rgb(...this.positionGridColor);
        context.lineWidth = 1;
        console.log(upperEnd, lowerEnd);
        // debugger;
        for (let value = lowerEnd; value < upperEnd; value += positionGridSpan) {
            const positionX = value * positionRatio + positionBasis;
            drawLine(context, positionX, -height + padding, positionX, 0);
            context.fillStyle = rgb(...this.positionGridColor);
            context.fillText(value + "", positionX, -height + padding);
            // debugger
        }
        context.strokeStyle = rgb(...this.timeGridColor);
        // 绘制时间线
        const startBeats = Math.floor(beats);
        const stopBeats = Math.ceil(beats + timeSpan);
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionY = (time - beats) * timeRatio;
            drawLine(context, -width / 2, -positionY, width / 2, -positionY);
            context.save();
            context.fillStyle = rgb(...this.timeGridColor);
            context.fillText(time + "", -width / 2, -positionY);
            context.lineWidth = 1;
            for (let i = 1; i < editor.timeDivisor; i++) {
                const minorPosY = (time + i / editor.timeDivisor - beats) * timeRatio;
                drawLine(context, -width / 2, -minorPosY, width / 2, -minorPosY);
            }
            context.restore();
        }
    }
    draw(beats) {
        beats = beats || this.lastBeats || 0;
        this.updateMatrix();
        this.selectionManager.refresh();
        const { context, canvas } = this;
        const { width: canvasWidth, height: canvasHeight } = canvas;
        const { positionGridSpan, positionRatio, positionSpan: positionRange, positionBasis, timeGridSpan, timeSpan: timeRange, timeRatio, padding } = this;
        const width = canvasWidth - padding * 2;
        const height = canvasHeight - padding * 2;
        this.drawCoordination(beats);
        if (this.targetTree) {
            this.drawNNList(this.targetTree, beats);
        }
        else {
            // Hold first, so that drag/flicks can be seen
            for (const lists of [this.target.hnLists, this.target.nnLists]) {
                for (const [_, list] of lists) {
                    this.drawNNList(list, beats);
                }
            }
        }
        // 绘制侧边音符节点标识
        if (DRAWS_NN && this.targetTree) {
            context.save();
            context.lineWidth = 3;
            const jump = this.targetTree.jump;
            const averageBeats = jump.averageBeats;
            const start = Math.floor(beats / averageBeats);
            const end = Math.ceil((beats + timeRange) / averageBeats);
            const array = jump.array;
            const array2 = this.targetTree instanceof HNList ? this.targetTree.holdTailJump.array : null;
            let lastNode = null;
            let color = COLOR_1;
            const minorAverageBeats = jump.averageBeats / MINOR_PARTS;
            const x = width / 2 - 10;
            const x2 = -width / 2 + 10;
            const switchColor = () => (context.strokeStyle = color = color === COLOR_1 ? COLOR_2 : COLOR_1);
            for (let i = start; i < end; i++) {
                const scale = array[i];
                if (!scale) {
                    continue;
                }
                const y = -(i * averageBeats - beats) * timeRatio;
                // console.log(i, y)
                if (Array.isArray(scale)) {
                    for (let j = 0; j < MINOR_PARTS; j++) {
                        const node = scale[j];
                        if (node !== lastNode) {
                            switchColor();
                            lastNode = node;
                            context.fillText("tailing" in node ? "Tail" : node.id.toString(), x - 30, y - j * minorAverageBeats * timeRatio);
                        }
                        drawLine(context, x - 4, y - j * minorAverageBeats * timeRatio, x, y - (j + 1) * minorAverageBeats * timeRatio + 5);
                    }
                }
                else {
                    if (scale !== lastNode) {
                        switchColor();
                        lastNode = scale;
                    }
                    context.fillText("tailing" in scale ? "Tail" : scale.id.toString(), x - 30, y);
                    drawLine(context, x - 10, y, x + 10, y - averageBeats * timeRatio + 5);
                }
            }
            if (array2)
                for (let i = start; i < end; i++) {
                    const scale = array2[i];
                    if (!scale) {
                        continue;
                    }
                    const y = -(i * averageBeats - beats) * timeRatio;
                    // console.log(i, y)
                    if (Array.isArray(scale)) {
                        for (let j = 0; j < MINOR_PARTS; j++) {
                            const node = scale[j];
                            if (node !== lastNode) {
                                switchColor();
                                lastNode = node;
                                context.fillText("tailing" in node ? "Tail" : `${node.id} (${timeToString(node.startTime)}-${timeToString(node.endTime)})`, x2 + 10, y - j * minorAverageBeats * timeRatio);
                            }
                            drawLine(context, x2 - 4, y - j * minorAverageBeats * timeRatio, x2, y - (j + 1) * minorAverageBeats * timeRatio + 5);
                        }
                    }
                    else {
                        if (scale !== lastNode) {
                            switchColor();
                            lastNode = scale;
                        }
                        context.fillText("tailing" in scale ? "Tail" : `${scale.id} (${timeToString(scale.startTime)}-${timeToString(scale.endTime)})`, x2 + 10, y);
                        drawLine(context, x2 - 10, y, x2 + 10, y - averageBeats * timeRatio + 5);
                    }
                }
            context.restore();
        }
        if (this.state === NotesEditorState.selectingScope) {
            const { startingCanvasPoint, canvasPoint } = this;
            context.save();
            context.strokeStyle = "#84F";
            context.strokeRect(startingCanvasPoint.x, startingCanvasPoint.y, canvasPoint.x - startingCanvasPoint.x, canvasPoint.y - startingCanvasPoint.y);
            context.restore();
        }
        this.drawn = false;
        this.lastBeats = beats;
    }
    drawNNList(tree, beats) {
        const timeRange = this.timeSpan;
        let noteNode = tree.getNodeAt(beats, true);
        if ("tailing" in noteNode) {
            return;
        }
        while (!("tailing" in noteNode) && TimeCalculator.toBeats(noteNode.startTime) < beats + timeRange) {
            const notes = noteNode.notes, length = notes.length;
            const posMap = new Map();
            for (let i = 0; i < length; i++) {
                const note = notes[i];
                const posX = note.positionX;
                const count = posMap.get(note.positionX) || 0;
                this.drawNote(beats, note, i === 0, count);
                posMap.set(posX, count + 1);
            }
            noteNode = noteNode.next; // 这句之前忘了，卡死了，特此留念（
        }
    }
    drawNote(beats, note, isTruck, nth) {
        const context = this.context;
        const { 
        //positionGridSpan,
        positionRatio, 
        //positionSpan: positionRange,
        //positionBasis,
        //timeGridSpan,
        //timeSpan: timeRange,
        timeRatio, padding, matrix } = this;
        const start = TimeCalculator.toBeats(note.startTime) - beats;
        const end = TimeCalculator.toBeats(note.endTime) - beats;
        const { x: posX, y: posY } = new Coordinate(note.positionX, start).mul(matrix);
        const posLeft = posX - NOTE_WIDTH / 2;
        const isHold = note.type === NoteType.hold;
        let rad;
        if (nth !== 0) {
            rad = Math.PI * (1 - Math.pow(2, -nth));
            context.save();
            context.translate(posX, posY);
            context.rotate(rad);
            context.drawImage(getImageFromType(note.type), -NOTE_WIDTH / 2, -NOTE_HEIGHT / 2, NOTE_WIDTH, NOTE_HEIGHT);
            if (this.notesSelection.has(note)) {
                context.save();
                context.fillStyle = "#DFD9";
                context.fillRect(-NOTE_WIDTH / 2, -NOTE_HEIGHT / 2, NOTE_WIDTH, NOTE_HEIGHT);
                context.restore();
            }
            else if (this.selectedNote === note) {
                context.drawImage(SELECT_NOTE, -NOTE_WIDTH / 2, -NOTE_HEIGHT / 2, NOTE_WIDTH, NOTE_HEIGHT);
            }
            context.restore();
            this.selectionManager.add({
                target: note,
                centerX: posX,
                centerY: posY,
                width: NOTE_WIDTH,
                height: NOTE_HEIGHT,
                rad,
                priority: isHold ? 1 : 2
            });
        }
        else {
            const posTop = posY - NOTE_HEIGHT / 2;
            context.drawImage(getImageFromType(note.type), posLeft, posTop, NOTE_WIDTH, NOTE_HEIGHT);
            if (this.notesSelection.has(note)) {
                context.save();
                context.fillStyle = "#DFD9";
                context.fillRect(posLeft, posTop, NOTE_WIDTH, NOTE_HEIGHT);
                context.restore();
            }
            else if (this.selectedNote === note && !this.selectingTail) {
                context.drawImage(SELECT_NOTE, posLeft, posTop, NOTE_WIDTH, NOTE_HEIGHT);
            }
            this.selectionManager.add({
                target: note,
                centerX: posX,
                centerY: posY,
                height: NOTE_HEIGHT,
                width: NOTE_WIDTH,
                priority: isHold ? 1 : 2
            });
        }
        if (isHold) {
            context.drawImage(HOLD_BODY, posLeft, -end * timeRatio, NOTE_WIDTH, (end - start) * timeRatio);
            this.selectionManager.add({
                target: new HoldTail(note),
                left: posLeft,
                top: -end * timeRatio,
                height: NOTE_HEIGHT,
                width: NOTE_WIDTH,
                priority: 1
            });
            this.selectionManager.add({
                target: note,
                left: posLeft,
                top: -end * timeRatio,
                height: (end - start) * timeRatio,
                width: NOTE_WIDTH,
                priority: 0
            });
        }
    }
    paste() {
        const { clipboard, lastBeats } = this;
        const { timeDivisor } = this.editor;
        if (!clipboard || clipboard.size === 0) {
            return;
        }
        if (!lastBeats) {
            notify("Have not rendered a frame");
        }
        const notes = [...clipboard];
        notes.sort((a, b) => TimeCalculator.gt(a.startTime, b.startTime) ? 1 : -1);
        const startTime = notes[0].startTime;
        // const portions: number = Math.round(timeDivisor * lastBeats);
        const dest = [this.pointedBeats, this.beatFraction, timeDivisor];
        const offset = TimeCalculator.sub(dest, startTime);
        const newNotes = notes.map(n => n.clone(offset));
        this.editor.operationList.do(new MultiNoteAddOperation(newNotes, this.target));
        this.editor.multiNoteEditor.target = this.notesSelection = new Set(newNotes);
        this.editor.update();
    }
    copy() {
        this.clipboard = this.notesSelection;
        this.notesSelection = new Set();
        this.editor.update();
    }
}
const NODE_WIDTH = 20;
const NODE_HEIGHT = 20;
const NOTE_WIDTH = 54;
const NOTE_HEIGHT = 6;
var JudgeLinesEditorLayoutType;
(function (JudgeLinesEditorLayoutType) {
    JudgeLinesEditorLayoutType[JudgeLinesEditorLayoutType["ordered"] = 1] = "ordered";
    JudgeLinesEditorLayoutType[JudgeLinesEditorLayoutType["tree"] = 2] = "tree";
    JudgeLinesEditorLayoutType[JudgeLinesEditorLayoutType["grouped"] = 4] = "grouped";
})(JudgeLinesEditorLayoutType || (JudgeLinesEditorLayoutType = {}));
class JudgeLinesEditor extends Z {
    constructor(editor, element) {
        super("div", false);
        this.metaLineAdded = false;
        this.layoutType = JudgeLinesEditorLayoutType.ordered;
        this.chart = editor.chart;
        this.editor = editor;
        this.element = element;
        this.orderedLayout();
    }
    get selectedLine() {
        return this._selectedLine;
    }
    set selectedLine(line) {
        if (this._selectedLine === line) {
            return;
        }
        if (this._selectedLine) {
            const editors = this.editors.get(this._selectedLine);
            editors.removeClass("judge-line-editor-selected");
        }
        this._selectedLine = line;
        this.editor.notesEditor.target = line;
        this.editor.eventCurveEditors.changeTarget(line);
        const editr = this.editors.get(line);
        editr.addClass("judge-line-editor-selected");
        this.editor.player.greenLine = line.id;
        this.editor.eventCurveEditors.draw();
        this.editor.notesEditor.draw();
    }
    orderedLayout() {
        this._selectedLine = null; // Set as null first so that the editor is correctly selected
        // 用这个减少回流（内部实现用了文档碎片）
        this.appendMass(() => {
            this.html("");
            this.editors = new Map();
            for (const line of this.chart.judgeLines) {
                const editor = new JudgeLineEditor(this, line);
                this.registerEditor(editor);
                this.append(editor);
            }
        });
        this.selectedLine = this.chart.judgeLines[0];
    }
    treeLayout() {
        this._selectedLine = null;
        this.appendMass(() => {
            this.html("");
            this.editors = new Map();
            this.collapseStack = [];
            for (const line of this.chart.orphanLines) {
                this.addIndentedLineEditor(line, 0);
            }
        });
        this.selectedLine = this.chart.judgeLines[0];
    }
    addIndentedLineEditor(line, indentLevel) {
        const isFather = line.children.size > 0;
        const $collapse = isFather ? new ZCollapseController(false) : $("div");
        const editer = new JudgeLineEditor(this, line, $collapse);
        for (const $col of this.collapseStack) {
            $col.attach(editer);
        }
        if (isFather) {
            editer.addClass("judge-line-editor-father");
            this.collapseStack.push($collapse);
        }
        this.registerEditor(editer);
        this.append(editer);
        editer.css("marginLeft", indentLevel * 2 + "em");
        for (const child of [...line.children].sort((a, b) => a.id - b.id)) {
            this.addIndentedLineEditor(child, indentLevel + 1);
        }
        if (isFather) {
            this.collapseStack.pop();
        }
    }
    groupedLayout() {
        this._selectedLine = null;
        this.appendMass(() => {
            this.html("");
            this.editors = new Map();
            for (const group of this.chart.judgeLineGroups) {
                const groupEditor = new GroupEditor(group);
                this.append(groupEditor);
                for (const line of group.judgeLines) {
                    const editr = new JudgeLineEditor(this, line);
                    this.registerEditor(editr);
                    this.append(editr);
                    groupEditor.$collapse.attach(editr);
                }
            }
        });
        this.selectedLine = this.chart.judgeLineGroups[0].judgeLines[0];
    }
    registerEditor(editor) {
        const line = editor.judgeLine;
        this.editors.set(line, editor);
    }
    update() {
        for (const [_line, editr] of this.editors) {
            editr.update();
        }
    }
    reflow(type = this.layoutType) {
        if (type !== this.layoutType) {
            this.layoutType = type;
        }
        switch (type) {
            case JudgeLinesEditorLayoutType.ordered:
                this.orderedLayout();
                break;
            case JudgeLinesEditorLayoutType.grouped:
                this.groupedLayout();
                break;
            case JudgeLinesEditorLayoutType.tree:
                this.treeLayout();
                break;
        }
        this.dispatchEvent(new Event("reflow"));
    }
}
class GroupEditor extends Z {
    constructor(target) {
        super("div");
        this.target = target;
        this.$collapse = new ZCollapseController(false);
        this.addClass("group-editor");
        this.append(this.$collapse, $("span").text(target.name));
    }
}
class JudgeLineEditor extends Z {
    constructor(linesEditor, judgeLine, $collapse = $("div")) {
        super("div");
        this.linesEditor = linesEditor;
        this.judgeLine = judgeLine;
        this.addClass("judge-line-editor");
        this.$id = $("div").addClass("judgeline-info-id");
        this.$id.text(this.judgeLine.id + "");
        this.$name = new ZInputBox();
        this.$name
            .addClass("judgeline-info-name")
            .setValue(judgeLine.name)
            .whenValueChange((s) => {
            let m = s.match(/^\.(father|group)\s+?\=\s+?(.+)$/);
            if (m) {
                let [_, type, name] = m;
                if (type == "father") {
                    if (!name.match(/^[0-9]+$/)) {
                        return false;
                    }
                    const id = parseInt(name);
                    const lines = editor.chart.judgeLines;
                    if (id >= lines.length) {
                        return false;
                    }
                    judgeLine.father = lines[id];
                }
                else if (type == "group") {
                    const mayBeGroup = editor.chart.judgeLineGroups.find(group => group.name === name);
                    mayBeGroup.add(judgeLine);
                }
                return false;
            }
            judgeLine.name = s;
        });
        this.$xSpan = $("span");
        this.$ySpan = $("span");
        this.$thetaSpan = $("span");
        this.$alphaSpan = $("span");
        this.append(this.$id, this.$name, $collapse, $("span").text("x: "), this.$xSpan, $("span").text("y: "), this.$ySpan, $("span").text("θ: "), this.$thetaSpan, $("span").text("α: "), this.$alphaSpan);
        this.onClick(() => {
            this.linesEditor.selectedLine = this.judgeLine;
        });
        this.update();
    }
    update() {
        const line = this.judgeLine;
        const { moveX, moveY, rotate, alpha } = line;
        this.$xSpan.text(typeof moveX === "number" ? shortenFloat(moveX, 2) + "" : "N/A");
        this.$ySpan.text(typeof moveY === "number" ? shortenFloat(moveY, 2) + "" : "N/A");
        this.$thetaSpan.text(typeof rotate === "number" ? shortenFloat(rotate / Math.PI * 180, 2) + "" : "N/A");
        this.$alphaSpan.text(typeof alpha === "number" ? Math.round(alpha) + "(" + Math.round(alpha).toString(16) + ")" : "N/A");
    }
}
class SaveDialog extends ZDialog {
    constructor() {
        super();
        this.$clearsOperationList = new ZSwitch("Clears operation list");
        this.append($("span").text("Message"));
        this.$message = new ZInputBox();
        this.$message.attr("placeholder", "Enter Commit Message");
        this.append(this.$message);
        this.append(new ZButton("Save")
            .addClass("progressive")
            .onClick(() => {
            this.close();
            this.dispatchEvent(new CustomEvent("save", { detail: this.$message.getValue() }));
        }));
        this.append(new ZButton("Cancel")
            .addClass("destructive")
            .onClick(() => this.close()));
        this.append(this.$clearsOperationList);
        // @ts-expect-error Here customEvent must be CustomEvent
        this.addEventListener("save", (customEvent) => {
            console.log("save", customEvent.detail);
            serverApi.uploadChart(this.chartData, customEvent.detail)
                .then((successful) => {
                this.dispatchEvent(new Event("saved"));
            });
        });
    }
}
const tips = [
    "奇谱发生器是Phigros自制谱界最好用的制谱器，每天不写30个奇谱就会有300条判定线在我身上爬",
    "你说得对，但是奇谱发生器是由Zes Minkey Young自主研发的一款制谱器，后面的忘了",
    "本制谱器没有使用lchzh3473的sim-phi制作",
    "制谱器一定要有谱面✍✍✍✍✍✍✍✍",
    "[露出了6号缓动]",
    "本软件是“奇谱发生器”，不是“八股谱发生器”更不是“粪谱发生器”",
    "撤销重做、复制粘贴不需要Ctrl，直接按Z/Y/C/V即可",
    "天苍苍，野茫茫，风吹草低见牛羊",
    "闊靛緥婧愮偣",
    "至此，，，，",
    "国王的船员们说阿门",
    "一觉醒来，全世界制谱水平下降1%，而你不变",
    "我-我-要-要-投-诉-你！",
    "横眉冷对千夫指，俯首甘为孺子牛",
    "比起模板缓动，我更喜欢你！",
    "美食大赛是一款快速高效的JavaScript运行时",
    "新的 可扩展标记语言超文本传输协议请求 括弧",
    "Error: Cannot create an instance of abstract class 'Fruit' at line 3 '我不吃苹果和香蕉，医生让我吃水果'",
    "讲个笑话：睡眠排序的时间复杂度是O(N)",
    "玩诶喝沸诗俺会生辉",
    "半罐水响叮当，一罐水响叮叮当当",
    "十二年寒窗苦读，曾经那个弱不禁风的小男孩已经长成了一个弱不禁风的大男孩",
    "沉默是金，晚的康桥",
    "面包的价格是50万马克，所以你选择钝角，并将答案标在试卷上",
    "化学老师发出了尖锐的爆鸣声",
    "把你故事的参考文献讲出来，看看是不是在出版社里面。你昨天在这里输出日志，只有你猜中考题是二分查找",
    "好的菜会被下架吗？好的老师会被开除吗？好的话会被擦掉吗？会吗？会吗？",
    "20岁吃过砒霜，现在已经18岁了",
    "对手使用了电石，你的启普发生器爆炸了",
    "从今天起，做一个幸福的人，劈马，喂柴，周游世界",
    "不积极阅读乐学学术力作",
    "运动降低人到封建礼教的能量传递效率",
    "Taq酶会解决问题的",
    "你说的对，但是《Air Ticket Extend》是由SWORDNEW...SWORDGAME.EXE自主研发的一款文字剧情冒险游戏，中间的忘了，揭开『科学』『魔法』的真相。",
];
const generateTipsLabel = () => {
    const $div = $("div");
    $div.addClass("tips-label");
    let id;
    const changeText = () => {
        $div.text("Tips:" + tips[Math.floor(Math.random() * tips.length)]);
    };
    const update = () => id = setTimeout(() => {
        changeText();
        id = null;
        update();
    }, 10000);
    $div.onClick(() => {
        if (id)
            clearTimeout(id);
        changeText();
        update();
    });
    changeText();
    update();
    return $div;
};
class Editor extends EventTarget {
    constructor() {
        super();
        this.$topbar = $(document.getElementById("topbar"));
        this.$preview = $(document.getElementById("preview"));
        this.$noteInfo = $(document.getElementById("noteInfo"));
        this.$eventSequence = $(document.getElementById("eventSequence"));
        this.lineInfoEle = document.getElementById("lineInfo");
        this.$saveButton = new ZButton("保存");
        this.$compileButton = new ZButton("编译");
        this.$offsetInput = new ZInputBox().attr("size", "3");
        this.$switchButton = new ZButton("切换");
        this.$judgeLinesEditorLayoutSelector = new ZDropdownOptionBox([
            new BoxOption("Ordered", () => { this.judgeLinesEditor.reflow(JudgeLinesEditorLayoutType.ordered); }),
            new BoxOption("Grouped", () => { this.judgeLinesEditor.reflow(JudgeLinesEditorLayoutType.grouped); }),
            new BoxOption("Tree", () => { this.judgeLinesEditor.reflow(JudgeLinesEditorLayoutType.tree); })
        ]);
        this.initialized = false;
        this.imageInitialized = false;
        this.audioInitialized = false;
        this.chartInitialized = false;
        // load player
        this.player = new Player(document.getElementById("player"));
        this.notesEditor = new NotesEditor(this);
        this.notesEditor.appendTo(this.$preview);
        const notesEditorWidth = this.$preview.clientWidth - this.player.canvas.clientWidth;
        if (notesEditorWidth < 400) {
            this.notesEditor.addClass("mobile");
            this.notesEditor.init(this.$preview.clientWidth, this.$preview.clientHeight);
        }
        else {
            this.notesEditor.init(notesEditorWidth, this.$preview.clientHeight);
        }
        this.progressBar = new ZProgressBar(this.player.audio);
        this.progressBar.addEventListener("pause", () => this.pause());
        this.progressBar.addEventListener("change", () => {
            this.update();
            this.player.render();
        });
        this.progressBar.appendTo(this.$topbar);
        this.eventCurveEditors = new EventCurveEditors();
        this.eventCurveEditors.appendTo(this.$eventSequence);
        this.eventCurveEditors.init();
        this.playButton = document.getElementById("playButton");
        this.playButton.addEventListener("click", (event) => {
            if (!this.playing) {
                this.play();
            }
            else {
                this.pause();
            }
        });
        this.$preview.on("wheel", (event) => {
            if (!this.initialized) {
                return;
            }
            if (this.playing) {
                this.pause();
            }
            const audio = this.player.audio;
            // console.log(event.deltaY)
            changeAudioTime(audio, event.deltaY / 500);
            this.progressBar.update();
            this.update();
            this.player.render();
            // event.preventDefault()
        });
        // Time Divisor (the third number in TimeTuple)
        this.$timeDivisor = new ZArrowInputBox();
        this.$timeDivisor.onChange((n) => {
            this.timeDivisor = n;
            this.update();
        });
        this.$timeDivisor.setValue(4);
        this.timeDivisor = 4;
        // PlaybackRate
        this.$playbackRate = new ZDropdownOptionBox(["1.0x", "1.5x", "2.0x", "0.5x", "0.25x", "0.75x"].map((n) => new BoxOption(n)))
            .onChange((rateStr) => {
            this.player.audio.playbackRate = parseFloat(rateStr);
        });
        // Save Button
        this.$saveButton.disabled = true;
        this.$saveButton.onClick(() => {
            const json = this.chart.dumpKPA();
            if (serverApi.supportsServer && serverApi.chartId) {
                this.$saveDialog.show();
                this.$saveDialog.chartData = json;
                this.$saveDialog.addEventListener("saved", () => {
                    if (this.$saveDialog.$clearsOperationList.checked) {
                        this.operationList.clear();
                    }
                    this.chart.modified = false;
                    this.$saveButton.disabled = true;
                }, { once: true });
                return;
            }
            saveTextToFile(JSON.stringify(json), this.chart.name + ".kpa.json");
            this.chart.modified = false;
        });
        this.$saveDialog = new SaveDialog();
        this.$compileButton.onClick(() => {
            const compiler = new RPEChartCompiler(this.chart);
            const json = compiler.compileChart();
            saveTextToFile(JSON.stringify(json), this.chart.name + ".rpe.json");
        });
        this.$offsetInput.whenValueChange(() => {
            this.chart.offset = this.$offsetInput.getInt();
        });
        this.$switchButton.onClick(() => {
            switch (this.shownSideEditor) {
                case this.eventEditor:
                case this.noteEditor:
                case this.multiNodeEditor:
                case this.multiNoteEditor:
                    editor.switchSide(this.judgeLineInfoEditor);
                    break;
                case this.judgeLineInfoEditor:
                    editor.switchSide(this.userScriptEditor);
            }
        });
        this.$tipsLabel = generateTipsLabel();
        this.$topbar.append(this.$timeDivisor, this.$playbackRate, this.$offsetInput, this.$saveButton, this.$saveDialog, this.$compileButton, this.$switchButton, this.$judgeLinesEditorLayoutSelector, this.$tipsLabel);
        this.addEventListener("chartloaded", (e) => {
            this.eventCurveEditors.bpm.target = this.chart.timeCalculator.bpmSequence;
            this.$offsetInput.setValue(this.chart.offset.toString());
            this.operationList.addEventListener("firstmodified", () => {
                this.$saveButton.disabled = false;
            });
            this.operationList.addEventListener("noundo", () => {
                notify("Nothing to undo");
            });
            this.operationList.addEventListener("noredo", () => {
                notify("Nothing to redo");
            });
            this.operationList.addEventListener("needsupdate", () => {
                this.update();
            });
            // @ts-expect-error
            this.operationList.addEventListener("needsreflow", (ev) => {
                if (this.judgeLinesEditor.layoutType & ev.condition) {
                    notify("Reflow");
                    this.judgeLinesEditor.reflow();
                }
            });
        });
        window.addEventListener("beforeunload", (e) => {
            if (this.chart.modified) {
                e.preventDefault();
                e.returnValue = "Unsaved Changes";
            }
        });
        window.addEventListener("keydown", (e) => {
            var _a, _b;
            if ((e.key === "z" || e.key === "y") && document.activeElement === document.body) {
                e.preventDefault();
            }
            else {
                return;
            }
            if (e.key === "z") {
                (_a = this.operationList) === null || _a === void 0 ? void 0 : _a.undo();
            }
            else if (e.key === "y") {
                (_b = this.operationList) === null || _b === void 0 ? void 0 : _b.redo();
            }
        });
        /*
        window.addEventListener("resize", () => {
            this.player.initCoordinate();
            if (!this.initialized) {
                this.player.initGreyScreen()
            } else {
                this.update()
            }
        })
            */
    }
    switchSide(editr) {
        if (editr === this.shownSideEditor) {
            return;
        }
        this.shownSideEditor.hide();
        editr.show();
        this.shownSideEditor = editr;
    }
    checkAndInit() {
        if (this.initialized) {
            return;
        }
        this.initialized = this.chartInitialized && this.imageInitialized && this.audioInitialized;
        if (this.initialized) {
            this.addEventListener("chartloaded", (e) => {
                this.initFirstFrame();
            });
            this.loadChart();
        }
    }
    addListenerForPlayer() {
        const player = this.player;
        const canvas = player.canvas;
        canvas.addEventListener("dragover", (e) => {
            e.preventDefault();
            player.renderDropScreen();
        });
        canvas.addEventListener("dragleave", (e) => {
            e.preventDefault();
            player.renderGreyScreen();
        });
        canvas.addEventListener("drop", (e) => {
            const files = e.dataTransfer.files;
            const len = files.length;
            for (let i = 0; i < len; i++) {
                const file = files[i];
                const arr = file.name.split(".");
                const extension = arr[arr.length - 1];
                if (["jpeg", "jpg", "png", "gif", "svg", "webp", "bmp", "ico"].includes(extension)) {
                    this.readImage(file);
                }
                else if (["json"].includes(extension)) {
                    this.readChart(file);
                }
                else {
                    this.readAudio(file);
                }
            }
            e.preventDefault();
        });
    }
    readChart(file) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener("load", () => {
            if (typeof reader.result !== "string") {
                return;
            }
            let data = JSON.parse(reader.result);
            this.chartData = data;
            if ("META" in this.chartData) {
                this.chartType = "rpejson";
            }
            else {
                this.chartType = "kpajson";
            }
            this.chartInitialized = true;
            this.checkAndInit();
            /**
            player.background = new Image();
            player.background.src = "../cmdysjtest.jpg";
            player.audio.src = "../cmdysjtest.mp3"; */
        });
    }
    loadChart() {
        const assignChart = (chart) => {
            this.player.chart = chart;
            this.chart = chart;
            this.operationList = new OperationList(chart);
            this.judgeLinesEditor = new JudgeLinesEditor(this, this.lineInfoEle);
            this.dispatchEvent(new Event("chartloaded"));
            this.chartData = null; // 这个内存量其实挺恐怖的
        };
        if (this.chartType === "rpejson") {
            // 若为1.6.0版本以后，元数据中有时长信息，直接使用以建立谱面
            // 否则等待<audio>加载完
            // @ts-expect-error
            if (this.chartData.META.duration) {
                assignChart(Chart.fromRPEJSON(this.chartData, this.chartData.META.duration));
            }
            else {
                assignChart(Chart.fromRPEJSON(this.chartData, this.player.audio.duration));
            }
            return;
        }
        assignChart(Chart.fromKPAJSON(this.chartData));
    }
    initFirstFrame() {
        const chart = this.chart;
        this.notesEditor.target = chart.orphanLines[0];
        this.player.render();
        this.notesEditor.draw(this.player.beats);
        const eventLayer = chart.judgeLines[0].eventLayers[0];
        const height = this.$eventSequence.clientHeight;
        const width = this.$eventSequence.clientWidth;
        this.eventEditor = new EventEditor();
        this.noteEditor = new NoteEditor();
        this.judgeLineInfoEditor = new JudgeLineInfoEditor();
        this.userScriptEditor = new UserScriptEditor();
        this.multiNoteEditor = new MultiNoteEditor();
        this.multiNodeEditor = new MultiNodeEditor();
        this.$noteInfo.append(this.eventEditor, this.noteEditor, this.judgeLineInfoEditor, this.userScriptEditor, this.multiNoteEditor, this.multiNodeEditor);
        this.eventEditor.target = chart.judgeLines[0].eventLayers[0].moveX.head.next;
        this.judgeLineInfoEditor.target = chart.judgeLines[0];
        this.eventEditor.update();
        this.eventEditor.hide();
        this.judgeLineInfoEditor.hide();
        this.userScriptEditor.hide();
        this.multiNoteEditor.hide();
        this.multiNodeEditor.hide();
        this.shownSideEditor = this.noteEditor;
        // this.noteEditor.target = chart.judgeLines[0].noteTrees["#1"].head.next.notes[0]
    }
    readAudio(file) {
        const url = URL.createObjectURL(file);
        this.player.audio.src = url;
        this.player.audio.addEventListener("canplaythrough", () => {
            this.audioInitialized = true;
            this.checkAndInit();
        });
    }
    readImage(file) {
        const url = URL.createObjectURL(file);
        this.player.background = new Image();
        this.player.background.src = url;
        this.imageInitialized = true;
        this.checkAndInit();
    }
    update() {
        requestAnimationFrame(() => {
            if (this.playing) {
                this.update();
            }
            else {
                this.player.render();
            }
            this.updateEventSequences();
            this.judgeLinesEditor.update();
            this.updateNotesEditor();
            this.updateShownEditor();
            const now = performance.now();
            this.renderingTime = this.lastRenderingTime ? (now - this.lastRenderingTime) : 0;
            this.lastRenderingTime = now;
            console.log("updated");
        });
    }
    updateEventSequences() {
        this.eventCurveEditors.draw(this.player.beats);
    }
    updateNotesEditor() {
        this.notesEditor.draw(this.player.beats);
    }
    updateShownEditor() {
        this.shownSideEditor.update();
    }
    get playing() {
        return this.player.playing;
    }
    play() {
        if (this.playing) {
            return;
        }
        this.playButton.innerHTML = "暂停";
        this.player.play();
        this.update();
    }
    pause() {
        this.player.pause();
        this.update();
        this.playButton.innerHTML = "继续";
    }
}
/**
 * 全生命周期只会编译一次，想多次就再构造一个
 */
class RPEChartCompiler {
    constructor(chart) {
        this.chart = chart;
        this.sequenceMap = new Map();
    }
    compileChart() {
        console.time("compileChart");
        const chart = this.chart;
        const judgeLineGroups = chart.judgeLineGroups.map(group => group.name);
        const judgeLineList = chart.judgeLines.map(line => this.dumpJudgeLine(line));
        const BPMList = chart.timeCalculator.dump();
        const META = {
            RPEVersion: 1,
            background: '',
            charter: '',
            composer: '',
            id: Math.random().toString().slice(2, 10),
            level: chart.level,
            name: chart.name,
            offset: chart.offset,
            song: chart.name
        };
        console.timeEnd("compileChart");
        return {
            BPMList,
            META,
            judgeLineList,
            judgeLineGroup: judgeLineGroups,
            multiLineString: '',
            multiScale: 1.0
        };
    }
    dumpJudgeLine(judgeLine) {
        var _a, _b;
        const chart = this.chart;
        const notes = this.compileNNLists([...judgeLine.nnLists.values()], [...judgeLine.hnLists.values()]);
        return {
            notes: notes,
            Group: chart.judgeLineGroups.indexOf(judgeLine.group),
            Name: judgeLine.name,
            Texture: judgeLine.texture,
            bpmfactor: 1.0,
            eventLayers: judgeLine.eventLayers.map((layer) => ({
                moveXEvents: layer.moveX ? this.dumpEventNodeSequence(layer.moveX) : null,
                moveYEvents: layer.moveY ? this.dumpEventNodeSequence(layer.moveY) : null,
                rotateEvents: layer.rotate ? this.dumpEventNodeSequence(layer.rotate) : null,
                alphaEvents: layer.alpha ? this.dumpEventNodeSequence(layer.alpha) : null,
                speedEvents: layer.speed ? this.dumpEventNodeSequence(layer.speed) : null
            })),
            father: (_b = (_a = judgeLine.father) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : -1,
            isCover: judgeLine.cover ? 1 : 0,
            numOfNotes: notes.length,
        };
    }
    dumpEventNodeSequence(sequence) {
        const nodes = [];
        sequence = this.substitute(sequence);
        let node = sequence.head.next;
        while (true) {
            const end = node.next;
            if ("tailing" in end)
                break;
            nodes.push(node.dump());
            node = end.next;
        }
        nodes.push(node.dumpAsLast());
        return nodes;
    }
    compileNNLists(nnLists, hnLists) {
        const noteLists = nnLists.map(list => this.nnListToArray(list));
        const holdLists = hnLists.map(list => this.nnListToArray(list));
        const ret = [];
        const time = (list) => list.length === 0 ? [Infinity, 0, 1] : list[list.length - 1].startTime;
        const concatWithOrder = (lists) => {
            if (lists.length === 0)
                return;
            // 先按最早的时间排序
            lists.sort((a, b) => {
                return TimeCalculator.gt(time(a), time(b)) ? 1 : -1;
            });
            // 每次从lists中第一个list pop一个data加入到结果，然后冒泡调整这个list的位置
            while (lists[0].length > 0) {
                const list = lists[0];
                const node = list.pop();
                ret.push(node);
                let i = 0;
                while (i + 1 < lists.length && TimeCalculator.gt(time(lists[i]), time(lists[i + 1]))) {
                    const temp = lists[i];
                    lists[i] = lists[i + 1];
                    lists[i + 1] = temp;
                    i++;
                }
            }
        };
        concatWithOrder(noteLists);
        concatWithOrder(holdLists);
        return ret;
    }
    /**
     * 倒序转换为数组
     * @param nnList
     * @returns
     */
    nnListToArray(nnList) {
        const notes = [];
        let node = nnList.tail.previous;
        while (!("heading" in node)) {
            for (let each of node.notes) {
                notes.push(each.dumpRPE());
            }
            node = node.previous;
        }
        return notes;
    }
    /**
     * 将当前序列中所有通过模板缓动引用了其他序列的事件直接展开为被引用的序列内容
     * transform all events that reference other sequences by template easing
     * into the content of the referenced sequence
     * 有点类似于MediaWiki的{{subst:templateName}}
     * @param map 由TemplateEasingLib提供
     * @returns
     */
    substitute(seq) {
        const map = this.sequenceMap;
        if (map.has(seq)) {
            return map.get(seq);
        }
        let currentNode = seq.head.next;
        const newSeq = new EventNodeSequence(seq.type, seq.effectiveBeats);
        map.set(seq, newSeq);
        let currentPos = newSeq.head;
        while (true) {
            if (!currentNode || ("tailing" in currentNode.next)) {
                break;
            }
            const endNode = currentNode.next;
            if (currentNode.easing instanceof TemplateEasing) {
                const quoted = this.substitute(currentNode.easing.eventNodeSequence);
                const startTime = currentNode.time;
                const endTime = endNode.time;
                const start = currentNode.value;
                const end = endNode.value;
                const delta = end - start;
                const originalStart = quoted.head.next.value;
                const originalDelta = quoted.tail.previous.value - quoted.head.next.value;
                const originalTimeSpan = TimeCalculator.sub(quoted.tail.previous.time, quoted.head.next.time);
                const timeSpan = TimeCalculator.sub(endTime, startTime);
                const ratio = TimeCalculator.div(timeSpan, originalTimeSpan);
                const convert = (value) => start + (value - originalStart) * delta / originalDelta;
                // 我恨TS没有运算符重载
                const convertTime = (time) => TC.validateIp(TC.add(startTime, TC.mul(TC.sub(time, quoted.head.next.time), ratio)));
                let node = quoted.head.next;
                while (true) {
                    const end = node.next;
                    if ("tailing" in end) {
                        break;
                    }
                    const newNode = new EventStartNode(convertTime(node.time), convert(node.value));
                    const newEndNode = new EventEndNode(convertTime(end.time), convert(end.value));
                    EventNode.connect(currentPos, newNode);
                    EventNode.connect(newNode, newEndNode);
                    currentPos = newEndNode;
                    node = end.next;
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
        const lastStart = currentNode.clone();
        EventNode.connect(currentPos, lastStart);
        EventNode.connect(lastStart, newSeq.tail);
        return newSeq;
    }
}
class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    mul(matrix) {
        const { x, y } = this;
        return new Coordinate(x * matrix.a + y * matrix.c + matrix.e, x * matrix.b + y * matrix.d + matrix.f);
    }
    static from([x, y]) {
        return new Coordinate(x, y);
    }
}
class Matrix {
    constructor(a, b, c, d, e, f) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }
    rotate(angle) {
        const { a, b, c, d, e, f } = this;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Matrix(a * cos + c * sin, b * cos + d * sin, a * -sin + c * cos, b * -sin + d * cos, e, f);
    }
    translate(x, y) {
        const { a, b, c, d, e, f } = this;
        return new Matrix(a, b, c, d, a * x + c * y + e, b * x + d * y + f);
    }
    scale(x, y) {
        const { a, b, c, d, e, f } = this;
        return new Matrix(a * x, b * y, c * x, d * y, e, f);
    }
    invert() {
        const { a, b, c, d, e, f } = this;
        const det = a * d - b * c;
        return new Matrix(d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det);
    }
    xmul(x, y) {
        return x * this.a + y * this.c + this.e;
    }
    ymul(x, y) {
        return x * this.b + y * this.d + this.f;
    }
    static fromDOMMatrix({ a, b, c, d, e, f }) {
        return new Matrix(a, b, c, d, e, f);
    }
}
const identity = new Matrix(1, 0, 0, 1, 0, 0);
/**
 * 使用AudioBuffer加快播放
 */
class AudioProcessor {
    constructor() {
        if (this.instance) {
            return this.instance;
        }
        this.audioContext = "AudioContext" in window ? new AudioContext() : new globalThis.webkitAudioContext();
        this.init();
    }
    init() {
        Promise.all([
            this.fetchAudioBuffer(serverApi.resolvePath("/sound/tap.mp3")),
            this.fetchAudioBuffer(serverApi.resolvePath("/sound/drag.mp3")),
            this.fetchAudioBuffer(serverApi.resolvePath("/sound/flick.mp3"))
        ]).then(([T, D, F]) => {
            this.tap = T;
            this.drag = D;
            this.flick = F;
            this.initialized = true;
        });
    }
    fetchAudioBuffer(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(path);
            return this.audioContext.decodeAudioData(yield res.arrayBuffer());
        });
    }
    play(buffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
    }
    playNoteSound(type) {
        if (!this.initialized) {
            return;
        }
        this.play([this.tap, this.tap, this.flick, this.drag][type - 1]);
    }
}
const HIT_FX_SIZE = 1024;
let TAP = new Image(135);
let DRAG = new Image(135);
let FLICK = new Image(135);
let HOLD_HEAD = new Image(135);
let HOLD_BODY = new Image(135);
const DOUBLE = new Image(135);
const BELOW = new Image(135);
const ANCHOR = new Image(20, 20);
const NODE_START = new Image(20, 10);
const NODE_END = new Image(20, 10);
let HIT_FX = new Image(HIT_FX_SIZE, HIT_FX_SIZE);
const SELECT_NOTE = new Image(135);
const TRUCK = new Image(135);
let fetched = false;
const fetchImage = () => {
    if (fetched)
        return;
    fetched = true;
    TAP.src = serverApi.resolvePath("/img/tap.png");
    DRAG.src = serverApi.resolvePath("/img/drag.png");
    FLICK.src = serverApi.resolvePath("/img/flick.png");
    HOLD_HEAD.src = serverApi.resolvePath("/img/holdHead.png");
    HOLD_BODY.src = serverApi.resolvePath("/img/holdBody.png");
    TAP.onload = () => {
        createImageBitmap(TAP).then((bmp) => {
            TAP = bmp;
        });
    };
    DRAG.onload = () => {
        createImageBitmap(DRAG).then((bmp) => {
            DRAG = bmp;
        });
    };
    FLICK.onload = () => {
        createImageBitmap(FLICK).then((bmp) => {
            FLICK = bmp;
        });
    };
    HOLD_BODY.onload = () => {
        createImageBitmap(HOLD_BODY).then((bmp) => {
            HOLD_BODY = bmp;
        });
    };
    HOLD_HEAD.onload = () => {
        createImageBitmap(HOLD_HEAD).then((bmp) => {
            HOLD_HEAD = bmp;
        });
    };
    ANCHOR.src = serverApi.resolvePath("/img/anchor.png");
    BELOW.src = serverApi.resolvePath("/img/below.png");
    DOUBLE.src = serverApi.resolvePath("/img/double.png");
    NODE_START.src = serverApi.resolvePath("/img/south.png");
    NODE_END.src = serverApi.resolvePath("/img/north.png");
    HIT_FX.src = serverApi.resolvePath("/img/hit_fx.png");
    HIT_FX.onload = () => {
        createImageBitmap(HIT_FX).then((bmp) => {
            HIT_FX = bmp;
        });
    };
    SELECT_NOTE.src = serverApi.resolvePath("/img/selectNote.png");
    TRUCK.src = serverApi.resolvePath("/img/Truck.png");
};
const drawNthFrame = (context, source, nth, dx, dy, dw, dh) => {
    const x = nth % 4;
    const y = (nth - x) / 4;
    context.drawImage(source, x * 256, y * 256, 256, 256, dx, dy, dw, dh);
};
const getImageFromType = (noteType) => {
    switch (noteType) {
        case NoteType.tap:
            return TAP;
        case NoteType.drag:
            return DRAG;
        case NoteType.flick:
            return FLICK;
        case NoteType.hold:
            return HOLD_HEAD;
        default:
            return TAP;
    }
};
const ENABLE_PLAYER = true;
const DRAWS_NOTES = true;
const DEFAULT_ASPECT_RATIO = 3 / 2;
const LINE_WIDTH = 10;
const LINE_COLOR = "#CCCC77";
const HIT_EFFECT_SIZE = 200;
const HALF_HIT = HIT_EFFECT_SIZE / 2;
// 以原点为中心，渲染的半径
const RENDER_SCOPE = 900;
const getVector = (theta) => [[Math.cos(theta), Math.sin(theta)], [-Math.sin(theta), Math.cos(theta)]];
class Player {
    constructor(canvas) {
        this.tintNotesMapping = new Map();
        this.tintEffectMapping = new Map();
        this.greenLine = 0;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.audioProcessor = new AudioProcessor();
        this.hitCanvas = document.createElement("canvas");
        this.hitContext = this.hitCanvas.getContext("2d");
        this.audio = new Audio();
        this.playing = false;
        this.aspect = DEFAULT_ASPECT_RATIO;
        this.noteSize = 175;
        this.noteHeight = 10;
        this.initCoordinate();
        this.audio.addEventListener("ended", () => {
            this.playing = false;
        });
        this.initGreyScreen();
        this.soundQueue = [];
    }
    get time() {
        return (this.audio.currentTime || 0) - this.chart.offset / 1000 - 0.017;
    }
    get beats() {
        return this.chart.timeCalculator.secondsToBeats(this.time);
    }
    initCoordinate() {
        let { canvas, context, hitCanvas, hitContext } = this;
        // console.log(context.getTransform())
        const height = 900;
        const width = 1350;
        canvas.height = height;
        canvas.width = width;
        hitCanvas.height = height;
        hitCanvas.width = width;
        const RATIO = 1.0;
        // 计算最终的变换矩阵
        const tx = width / 2;
        const ty = height / 2;
        // 设置变换矩阵
        context.setTransform(RATIO, 0, 0, RATIO, tx, ty);
        //hitContext.scale(0.5, 0.5)
        context.save();
        hitContext.save();
        // console.log(context.getTransform())
    }
    renderDropScreen() {
        const { canvas, context } = this;
        context.fillStyle = "#6cf";
        context.fillRect(-675, -450, 1350, 900);
        context.fillStyle = "#444";
        context.font = "100px phigros";
        const metrics = context.measureText("松手释放");
        context.fillText("松手释放", -metrics.width / 2, 0);
        context.restore();
        context.save();
    }
    renderGreyScreen() {
        const { canvas, context } = this;
        context.fillStyle = "#AAA";
        context.fillRect(-675, -450, 1350, 900);
        context.fillStyle = "#444";
        context.font = "100px phigros";
        const metrics = context.measureText("放入文件");
        context.fillText("放入文件", -metrics.width / 2, 0);
        context.restore();
        context.save();
    }
    initGreyScreen() {
        const { canvas, context } = this;
        this.renderGreyScreen();
    }
    render() {
        if (!ENABLE_PLAYER) {
            return;
        }
        // console.time("render")
        const context = this.context;
        const hitContext = this.hitContext;
        hitContext.clearRect(0, 0, 1350, 900);
        context.drawImage(this.background, -675, -450, 1350, 900);
        // 涂灰色（背景变暗）
        context.fillStyle = "#2227";
        context.fillRect(-27000, -18000, 54000, 36000);
        // 画出渲染范围圆
        context.strokeStyle = "#66ccff";
        context.arc(0, 0, RENDER_SCOPE, 0, 2 * Math.PI);
        context.stroke();
        context.restore();
        context.save();
        context.strokeStyle = "#FFFFFF";
        drawLine(context, -1350, 0, 1350, 0);
        drawLine(context, 0, 900, 0, -900);
        // console.log("rendering")
        for (let line of this.chart.orphanLines) {
            this.renderLine(identity.translate(675, 450).scale(1, -1), line);
            context.restore();
            context.save();
        }
        hitContext.strokeStyle = "#66ccff";
        hitContext.lineWidth = 5;
        drawLine(hitContext, 0, 900, 1350, 0);
        context.drawImage(this.hitCanvas, -675, -450, 1350, 900);
        context.restore();
        context.save();
        const showInfo = settings.get("playerShowInfo");
        if (showInfo) {
            context.fillStyle = "#ddd";
            context.font = "50px phigros";
            const chart = this.chart;
            const title = chart.name;
            const level = chart.level;
            context.fillText(title, -650, 400);
            context.restore();
            context.save();
        }
        const timeLimit = this.time - 0.033;
        if (this.playing) {
            const queue = this.soundQueue;
            const len = queue.length;
            for (let i = 0; i < len; i++) {
                const SoundEntity = queue[i];
                if (SoundEntity.seconds < timeLimit) {
                    continue;
                }
                this.audioProcessor.playNoteSound(SoundEntity.type);
            }
        }
        this.soundQueue = [];
        // console.timeEnd("render")
    }
    renderLine(matrix, judgeLine) {
        const context = this.context;
        const timeCalculator = this.chart.timeCalculator;
        const beats = this.beats;
        // const timeCalculator = this.chart.timeCalculator
        const [x, y, theta, alpha] = judgeLine.getValues(beats);
        judgeLine.moveX = x;
        judgeLine.moveY = y;
        judgeLine.rotate = theta;
        judgeLine.alpha = alpha;
        // console.log(x, y, theta, alpha);
        // console.time("calculate coordinate");
        const { x: transformedX, y: transformedY } = new Coordinate(x, y).mul(matrix);
        const MyMatrix = identity.translate(transformedX, transformedY).rotate(-theta).scale(1, -1);
        // console.timeEnd("calculate coordinate");
        // console.time("transform");
        context.setTransform(MyMatrix);
        // console.timeEnd("transform");
        if (judgeLine.children.size !== 0) {
            for (let line of judgeLine.children) {
                context.save();
                this.renderLine(MyMatrix, line);
                context.restore();
            }
        }
        context.lineWidth = LINE_WIDTH; // 判定线宽度
        // const hexAlpha = alpha < 0 ? "00" : (alpha > 255 ? "FF" : alpha.toString(16))
        const lineColor = settings.get("lineColor");
        context.strokeStyle = rgba(...(this.greenLine === judgeLine.id ? [100, 255, 100] : lineColor), alpha / 255);
        drawLine(context, -1350, 0, 1350, 0);
        context.drawImage(ANCHOR, -10, -10);
        /** 判定线的法向量 */
        const nVector = getVector(theta)[1]; // 奇变偶不变，符号看象限(
        const toCenter = [675 - transformedX, 450 - transformedY];
        // 法向量是单位向量，分母是1，不写
        /** the distance between the center and the line */
        const innerProd = innerProduct(toCenter, nVector);
        const getYs = (offset) => {
            const distance = Math.abs(innerProd + offset);
            let startY, endY;
            if (distance < RENDER_SCOPE) {
                startY = 0;
                endY = distance + RENDER_SCOPE;
            }
            else {
                startY = distance - RENDER_SCOPE;
                endY = distance + RENDER_SCOPE;
            }
            return [startY, endY];
        };
        const drawScope = (y) => {
            if (y <= 1e-6)
                return;
            context.save();
            context.strokeStyle = "#66ccff";
            context.lineWidth = 2;
            drawLine(context, -1350, +y, 1350, +y);
            drawLine(context, -1350, -y, 1350, -y);
            context.restore();
        };
        const hitRenderLimit = beats > 0.66 ? beats - 0.66 : 0; // 渲染 0.66秒内的打击特效
        const holdTrees = judgeLine.hnLists;
        const noteTrees = judgeLine.nnLists;
        const soundQueue = this.soundQueue;
        // console.time("Updating integral");
        if (holdTrees.size || noteTrees.size) {
            judgeLine.updateSpeedIntegralFrom(beats, timeCalculator);
        }
        // console.timeEnd("Updating integral");
        for (let trees of [holdTrees, noteTrees]) {
            for (const [_, list] of trees) {
                const speedVal = list.speed;
                if (DRAWS_NOTES) {
                    // debugger
                    // 渲染音符
                    // console.time("computeTimeRange")
                    const [startY, endY] = getYs(list.medianYOffset);
                    const timeRanges = speedVal !== 0 ? judgeLine.computeTimeRange(beats, timeCalculator, startY / speedVal, endY / speedVal) : [[0, Infinity]];
                    list.timeRanges = timeRanges;
                    // console.timeEnd("computeTimeRange");
                    // console.time("Rendering notes");
                    // console.log(timeRanges, startY, endY);
                    for (let range of timeRanges) {
                        const start = range[0];
                        const end = range[1];
                        // drawScope(judgeLine.getStackedIntegral(start, timeCalculator))
                        // drawScope(judgeLine.getStackedIntegral(end, timeCalculator))
                        let noteNode = list.getNodeAt(start, true);
                        // console.log(noteNode)
                        let startBeats;
                        while (!("tailing" in noteNode)
                            && (startBeats = TimeCalculator.toBeats(noteNode.startTime)) < end) {
                            // 判断是否为多押
                            const isChord = noteNode.notes.length > 1
                                || noteNode.totalNode.noteNodes.some(node => node !== noteNode && node.notes.length)
                                || noteNode.totalNode.holdNodes.some(node => node !== noteNode && node.notes.length);
                            this.renderSameTimeNotes(noteNode, isChord, judgeLine, timeCalculator);
                            noteNode = noteNode.next;
                        }
                    }
                    // console.timeEnd("Rendering notes");
                }
                // console.time("Rendering sounds");
                // 处理音效
                this.renderSounds(list, beats, soundQueue, timeCalculator);
                // console.timeEnd("Rendering sounds");
                // console.time("Rendering hit effects");
                // 打击特效
                if (beats > 0) {
                    if (list instanceof HNList) {
                        this.renderHoldHitEffects(MyMatrix, list, beats, hitRenderLimit, beats, timeCalculator);
                    }
                    else {
                        this.renderHitEffects(MyMatrix, list, hitRenderLimit, beats, timeCalculator);
                    }
                }
                // console.timeEnd("Rendering hit effects");
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
    renderSounds(tree, beats, soundQueue, timeCalculator) {
        const lastBeats = this.lastBeats;
        let node = tree.getNodeAt(beats).previous;
        while (true) {
            if ("heading" in node || TimeCalculator.toBeats(node.startTime) < lastBeats) {
                break;
            }
            const notes = node.notes, len = notes.length;
            for (let i = 0; i < len; i++) {
                const note = notes[i];
                if (note.isFake) {
                    continue;
                }
                soundQueue.push(new SoundEntity(note.type, TimeCalculator.toBeats(note.startTime), timeCalculator));
            }
            node = node.previous;
        }
    }
    renderHitEffects(matrix, tree, startBeats, endBeats, timeCalculator) {
        let noteNode = tree.getNodeAt(startBeats, true);
        const { hitContext } = this;
        // console.log(hitContext.getTransform())
        const end = tree.getNodeAt(endBeats);
        if ("tailing" in noteNode) {
            return;
        }
        while (noteNode !== end) {
            const beats = TimeCalculator.toBeats(noteNode.startTime);
            const notes = noteNode.notes, len = notes.length;
            for (let i = 0; i < len; i++) {
                const note = notes[i];
                if (note.isFake) {
                    continue;
                }
                const posX = note.positionX;
                const yo = note.yOffset * (note.above ? 1 : -1);
                const { x, y } = new Coordinate(posX, yo).mul(matrix);
                // console.log("he", x, y);
                const he = note.tintHitEffects;
                const nth = Math.floor((this.time - timeCalculator.toSeconds(beats)) * 30);
                drawNthFrame(hitContext, he !== undefined ? this.getTintHitEffect(he) : HIT_FX, nth, x - HALF_HIT, y - HALF_HIT, HIT_EFFECT_SIZE, HIT_EFFECT_SIZE);
            }
            noteNode = noteNode.next;
        }
    }
    /**
     *
     * @param judgeLine
     * @param tree
     * @param beats 当前拍数
     * @param startBeats
     * @param endBeats 截止拍数
     * @param timeCalculator
     * @returns
     */
    renderHoldHitEffects(matrix, tree, beats, startBeats, endBeats, timeCalculator) {
        const start = tree.getNodeAt(startBeats, true);
        const { hitContext } = this;
        let noteNode = start;
        const end = tree.getNodeAt(endBeats);
        if ("tailing" in noteNode) {
            return;
        }
        if (noteNode !== end)
            // console.log("start", start, startBeats, endBeats)
            while (noteNode !== end) {
                const notes = noteNode.notes, len = notes.length;
                for (let i = 0; i < len; i++) {
                    const note = notes[i];
                    if (note.isFake) {
                        continue;
                    }
                    if (startBeats > TimeCalculator.toBeats(note.endTime)) {
                        continue;
                    }
                    const posX = note.positionX;
                    const yo = note.yOffset * (note.above ? 1 : -1);
                    const { x, y } = new Coordinate(posX, yo).mul(matrix);
                    const nth = Math.floor((this.beats - Math.floor(this.beats)) * 30);
                    const he = note.tintHitEffects;
                    drawNthFrame(hitContext, he !== undefined ? this.getTintHitEffect(he) : HIT_FX, nth, x - HALF_HIT, y - HALF_HIT, HIT_EFFECT_SIZE, HIT_EFFECT_SIZE);
                }
                noteNode = noteNode.next;
            }
    }
    renderSameTimeNotes(noteNode, chord, judgeLine, timeCalculator) {
        if (noteNode.isHold) {
            const startY = judgeLine.getStackedIntegral(TimeCalculator.toBeats(noteNode.startTime), timeCalculator) * noteNode.parentSeq.speed;
            const notes = noteNode.notes, len = notes.length;
            for (let i = 0; i < len; i++) {
                const note = notes[i];
                this.renderNote(note, chord, startY < 0 ? 0 : startY, judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.endTime), timeCalculator) * note.speed);
            }
        }
        else {
            // console.log("renderSameTimeNotes", noteNode)
            const notes = noteNode.notes, len = notes.length;
            for (let i = 0; i < len; i++) {
                const note = notes[i];
                this.renderNote(note, chord, judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.startTime), timeCalculator) * note.speed);
            }
        }
    }
    renderNote(note, chord, positionY, endpositionY) {
        // console.log(note, this.beats)
        if (TimeCalculator.toBeats(note.endTime) < this.beats) {
            return;
        }
        if (TimeCalculator.toBeats(note.startTime) - note.visibleBeats > this.beats) {
            return;
        }
        let image = note.tint ? this.getTintNote(note.tint, note.type) : getImageFromType(note.type);
        const context = this.context;
        if (note.yOffset) {
            positionY += note.yOffset;
            endpositionY += note.yOffset;
        }
        if (!note.above) {
            positionY = -positionY;
            endpositionY = -endpositionY;
        }
        let length = endpositionY - positionY;
        const size = this.noteSize * note.size;
        const half = size / 2;
        const height = this.noteHeight;
        // console.log(NoteType[note.type])
        const opac = note.alpha < 255;
        if (opac) {
            context.save();
            context.globalAlpha = note.alpha / 255;
        }
        if (note.type === NoteType.hold) {
            const isJudging = TimeCalculator.toBeats(note.startTime) <= this.beats;
            positionY = isJudging ? 0 : positionY;
            length = isJudging ? (endpositionY) : length;
            context.drawImage(HOLD_BODY, note.positionX - half, positionY - 10, size, length);
        }
        context.drawImage(image, note.positionX - half, positionY - 10, size, height);
        if (chord) {
            context.drawImage(DOUBLE, note.positionX - half, positionY - 10, size, height);
        }
        if (!note.above) {
            context.drawImage(BELOW, note.positionX - half, positionY - 10, size, height);
        }
        if (opac) {
            context.restore();
        }
    }
    getTintNote(tint, type) {
        const map = this.tintNotesMapping;
        const key = tint | type << 24; // 25位整形表示一个类型的Note贴图
        const canBeSource = map.get(key);
        if (canBeSource) {
            return canBeSource;
        }
        const source = new OffscreenCanvas(NOTE_WIDTH, NOTE_HEIGHT);
        const context = source.getContext('2d');
        context.drawImage(getImageFromType(type), 0, 0, NOTE_WIDTH, NOTE_HEIGHT);
        context.globalCompositeOperation = 'multiply';
        context.fillStyle = "#" + tint.toString(16).padStart(6, "0");
        context.fillRect(0, 0, NOTE_WIDTH, NOTE_HEIGHT);
        map.set(key, source); // 在ImageBitmap创建完成之前，先使用Canvas临时代替
        createImageBitmap(source).then((bmp) => {
            map.set(key, bmp);
        });
        return source;
    }
    getTintHitEffect(tint) {
        const map = this.tintEffectMapping;
        const key = tint;
        const canBeSource = map.get(key);
        if (canBeSource) {
            return canBeSource;
        }
        const source = new OffscreenCanvas(HIT_FX_SIZE, HIT_FX_SIZE);
        const context = source.getContext('2d');
        context.clearRect(0, 0, HIT_FX_SIZE, HIT_FX_SIZE);
        context.drawImage(HIT_FX, 0, 0, HIT_FX_SIZE, HIT_FX_SIZE);
        context.globalCompositeOperation = 'source-in';
        context.fillStyle = "#" + tint.toString(16);
        context.fillRect(0, 0, HIT_FX_SIZE, HIT_FX_SIZE);
        context.globalCompositeOperation = 'multiply';
        context.drawImage(HIT_FX, 0, 0, HIT_FX_SIZE, HIT_FX_SIZE);
        map.set(key, source);
        createImageBitmap(source).then((bmp) => {
            map.set(key, bmp);
        });
        return source;
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
        this.lastBeats = this.beats;
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
class ZProgressBar extends Z {
    constructor(target) {
        super("progress");
        this.target = target;
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
            this.dispatchEvent(new Event("pause"));
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
            this.dispatchEvent(new CustomEvent("change", { detail: value }));
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
            this.dispatchEvent(new CustomEvent("change", { detail: value }));
        });
        on(["mouseleave", "touchend"], element, () => {
            controlling = false;
        });
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
class SoundEntity {
    // playingSound: boolean;
    constructor(type, beats, timeCalculator) {
        this.type = type;
        // this.playsSound = playsSound;
        // this.posX = posX;
        // this.posY = posY;
        this.beats = beats;
        this.seconds = timeCalculator.toSeconds(beats);
        // this.playingSound = false;
    }
}
const PROJECT_NAME = "kpa";
class ChartMetadata {
    constructor(name, song, picture, chart) {
        this.name = name;
        this.song = song;
        this.picture = picture;
        this.chart = chart;
    }
    static fromJson(json) {
        return new ChartMetadata(json.Name, json.Song, json.Picture, json.Chart);
    }
    toJson() {
        return JSON.stringify({
            Name: this.name,
            Song: this.song,
            Picture: this.picture,
            Chart: this.chart
        });
    }
}
class ServerApi extends EventTarget {
    constructor() {
        super();
        this.statusPromise = fetch("/status")
            .then(res => {
            if (res.status == 204) {
                this.supportsServer = true;
                document.title += "Connected";
                this.dispatchEvent(new Event("load"));
                return true;
            }
            else {
                this.supportsServer = false;
                this.dispatchEvent(new Event("load"));
                return false;
            }
        });
    }
    getChart(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.chartId = id;
            const res0 = yield fetch(`/Resources/${id}/metadata.json`);
            if (res0.status === 404) {
                alert("Chart not found");
            }
            const metadata = ChartMetadata.fromJson(yield res0.json());
            const chartPath = metadata.chart;
            const picturePath = metadata.picture;
            const songPath = metadata.song;
            const res1 = yield fetch(`/Resources/${id}/${chartPath}`);
            const res2 = yield fetch(`/Resources/${id}/${picturePath}`);
            const res3 = yield fetch(`/Resources/${id}/${songPath}`);
            return [yield res1.blob(), yield res2.blob(), yield res3.blob()];
        });
    }
    uploadChart(chart, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.chartId;
            const chartBlob = new Blob([JSON.stringify(chart)], { type: "application/json" });
            const res = yield fetch(`/commit/${id}?message=${message}`, {
                method: "POST",
                body: chartBlob,
            });
            notify((yield res.json()).message);
            return res.status === 200;
        });
    }
    autosave(chart) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.chartId;
            const chartBlob = new Blob([JSON.stringify(chart)], { type: "application/json" });
            const res = yield fetch(`/autosave/${id}`, {
                method: "POST",
                body: chartBlob,
            });
            if (res.status !== 200) {
                return false;
            }
            return res.status === 200;
        });
    }
    fetchVersion(versionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`/Resources/${this.chartId}/history/${versionId}`);
            return yield res.json();
        });
    }
    resolvePath(path) {
        if (this.supportsServer) {
            return path;
        }
        else {
            return PROJECT_NAME + "/" + path;
        }
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
var editor, settings;
if (globalThis.document) {
    var serverApi = new ServerApi();
    serverApi.addEventListener("load", () => {
        fetchImage();
        settings = new Settings();
        editor = new Editor();
        const url = new URL(window.location.href);
        const pathname = url.pathname;
        const segs = pathname.split("/");
        let promise;
        if (url.searchParams.get('chart')) {
            promise = serverApi.getChart(url.searchParams.get('chart'));
        }
        else if (url.pathname.startsWith("/Resources/") && segs.length === 3) {
            promise = serverApi.getChart(segs[2]);
        }
        if (promise) {
            promise.then(([chart, illustration, music]) => {
                editor.readChart(chart);
                editor.readAudio(music);
                editor.readImage(illustration);
            });
        }
        setInterval(() => {
            const chart = editor.chart;
            if (chart.modified) {
                chart.chartingTime++;
                serverApi.autosave(chart.dumpKPA())
                    .then(success => {
                    if (success) {
                        chart.modified = false;
                        editor.$saveButton.disabled = true;
                    }
                    else {
                        notify("Autosave failed");
                    }
                });
            }
        }, 60000);
    });
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
//# sourceMappingURL=index.js.map