// interface TemplateEasingLib {[name: string]: TemplateEasing}
const MAX_LENGTH = 1024
const MINOR_PARTS = 16;

function arrEq<T>(arr1: Array<T>, arr2: Array<T>) {
    let length: number;
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
    time: TimeT;
    value: number;
    easing: Easing;
    /** 后一个事件节点 */
    next?: EventNode;
    /** 前一个事件节点 */
    previous?: EventNode;
    /** 封装缓动如果钩定时采用的倍率，默认为1，不使用封装缓动则不起作用 */
    ratio: number;
    constructor(time: TimeT, value: number) {
        this.time = time;
        this.value = value;
        this.previous = null;
        this.next = null;
        this.ratio = 1;
        this.easing = linearEasing
    }
    static fromEvent(data: EventDataRPE, templates: TemplateEasingLib): [EventStartNode, EventEndNode] {
        let start = new EventStartNode(data.startTime, data.start)
        let end = new EventEndNode(data.endTime, data.end);
        EventNode.connect(start, end)
        if (data.bezier) {
            let bp = data.bezierPoints
            let easing = new BezierEasing();
            easing.cp1 = { x: bp[0], y: bp[1] };
            easing.cp2 = { x: bp[2], y: bp[3] };
            start.easing = easing
        } else if (typeof data.easingType === "string") {
            start.easing = templates.get(data.easingType)
        } else if (typeof data.easingType === "number" && data.easingType !== 0) {
            start.easing = rpeEasingArray[data.easingType]
        } else if (start.value === end.value) {
            start.easing = fixedEasing
        } else {
            start.easing = linearEasing
        }
        if (!start.easing) debugger
        return [start, end]
    }
    // static connect(node1: EventStartNode, node2: EventEndNode): void
    static connect(node1: EventNode, node2: EventNode): void {
        node1.next = node2;
        node2.previous = node1;
    }
}
class EventStartNode extends EventNode {
    next?: EventEndNode;
    previous: EventEndNode;
    cachedIntegral?: number;
    constructor(time: TimeT, value: number) {
        super(time, value);
    }
    getValueAt(beats: number) {
        // 除了尾部的开始节点，其他都有下个节点
        // 钩定型缓动也有
        if (!this.next) {
            return this.value;
        }
        let timeDelta = TimeCalculator.getDelta(this.next.time, this.time)
        let current = beats - TimeCalculator.toBeats(this.time)
        if (current > timeDelta || current < 0) {
            console.warn("超过事件时间范围！", this, beats)
        }
        // 参数方程型缓动无需指定首尾数值
        if (this.easing instanceof ParametricEquationEasing) {
            return this.easing.getValue(current / timeDelta);
        }
        let valueDelta = this.next.value - this.value
        // 钩定模板缓动用ratio表示倍率
        if (valueDelta === 0 && this.easing instanceof TemplateEasing) {
            return this.value + this.easing.getValue(current / timeDelta) * this.ratio
        }
        if (!this.easing) {
            debugger
        }
        // 其他类型，包括普通缓动和非钩定模板缓动
        return this.value + this.easing.getValue(current / timeDelta) * valueDelta
    }
    getSpeedValueAt(beats: number) {
        if (!this.next) {
            return this.value
        }
        let timeDelta = TimeCalculator.getDelta(this.next.time, this.time)
        let valueDelta = this.next.value - this.value
        let current = beats - TimeCalculator.toBeats(this.time)
        return this.value + linearEasing.getValue(current / timeDelta) * valueDelta;
    }
    /**
     * 积分获取位移
     */
    getIntegral(beats: number, timeCalculator: TimeCalculator) {
        return timeCalculator.segmentToSeconds(TimeCalculator.toBeats(this.time), beats) * (this.value + this.getSpeedValueAt(beats)) / 2 * 120 // 每单位120px
    }
    getFullIntegral(timeCalculator: TimeCalculator) {
        if (!this.next) {
            console.log(this)
            throw new Error("getFullIntegral不可用于尾部节点")
        }
        let end = this.next;
        let endBeats = TimeCalculator.toBeats(end.time)
        let startBeats = TimeCalculator.toBeats(this.time)
        // 原来这里写反了，气死偶咧！
        return timeCalculator.segmentToSeconds(startBeats, endBeats) * (this.value + end.value) / 2 * 120
    }
}
class EventEndNode extends EventNode {
    next: EventStartNode;
    previous: EventStartNode;
    constructor(time: TimeT, value: number) {
        super(time, value);
    }
    getValueAt(beats: number) {
        return this.previous.getValueAt(beats);
    }
}

enum EventType {
    MoveX,
    MoveY,
    Rotate,
    Alpha,
    Speed,
    Easing
}

/**
 * 为一个链表结构。会有一个数组进行快跳。
 */
class EventNodeSequence {
    type: EventType;
    head: EventStartNode;
    tail: EventStartNode;
    jump: (EventStartNode | EventStartNode[])[]
    listLength: number;
    /** 一定是二的幂，避免浮点误差 */
    jumpAverageBeats: number;
    // nodes: EventNode[];
    // startNodes: EventStartNode[];
    // endNodes: EventEndNode[];
    // eventTime: Float64Array;
    constructor(type: EventType) {
        this.type = type;
        // this.head = this.tail = new EventStartNode([0, 0, 0], 0)
        // this.nodes = [];
        // this.startNodes = [];
        // this.endNodes = [];
    }
    static fromRPEJSON<T extends EventType>(type: T, data: EventDataRPE[], templates: TemplateEasingLib, timeCalculator: T extends EventType.Speed ? TimeCalculator: undefined) {
        const length = data.length;
        const isSpeed = type === EventType.Speed;
        // console.log(isSpeed)
        const seq = new EventNodeSequence(type);
        let listLength = length;
        let lastEnd: EventEndNode = null;
        // console.log(seq);
        [seq.head, lastEnd] = EventNode.fromEvent(data[0], templates);
        let lastIntegral: number = 0;
        for (let index = 1; index < length; index++) {
            const event = data[index];
            let [start, end] = EventNode.fromEvent(event, templates);
            if (lastEnd.value === lastEnd.previous.value && lastEnd.previous.easing instanceof NormalEasing) {
                lastEnd.time = start.time
                EventNode.connect(lastEnd, start)
            } else if (TimeCalculator.toBeats(lastEnd.time) !== TimeCalculator.toBeats(start.time)) {
                let val = lastEnd.value;
                let midStart = new EventStartNode(lastEnd.time, val);
                let midEnd = new EventEndNode(start.time, val);
                midStart.easing = lastEnd.previous.easing;
                EventNode.connect(lastEnd, midStart);
                EventNode.connect(midStart, midEnd);
                EventNode.connect(midEnd, start)
                if (isSpeed) {
                    midStart.cachedIntegral = lastIntegral;
                    lastIntegral += midStart.getFullIntegral(timeCalculator)
                }
                // seq.startNodes.push(midStart);
                // seq.endNodes.push(midEnd);
                listLength++;
            } else {
                
                EventNode.connect(lastEnd, start)
            }
            
            if (isSpeed) { // 这个接上再算
                lastEnd.previous.cachedIntegral = lastIntegral;
                lastIntegral += lastEnd.previous.getFullIntegral(timeCalculator)
                // console.log("lig",lastIntegral)
            }
            // seq.startNodes.push(start);
            // seq.endNodes.push(end);
            lastEnd = end;
            // seq.nodes.push(start, end);
        }
        // let last = seq.endNodes[length - 1];
        // let last = seq.endNodes[seq.endNodes.length - 1];
        const last = lastEnd;
        if (isSpeed) { // 这个接上再算
            last.previous.cachedIntegral = lastIntegral;
            lastIntegral += lastEnd.previous.getFullIntegral(timeCalculator)
            // console.log("lig",lastIntegral)
        }
        let tail = new EventStartNode(last.time, last.value);
        EventNode.connect(last, tail);
        tail.easing = last.previous.easing;
        tail.cachedIntegral = lastIntegral
        seq.tail = tail;
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
    get effectiveBeats(): number {
        return TimeCalculator.toBeats(this.tail.time)
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
        const fillMinor = (startTime: number, endTime: number) => {
            // @ts-ignore
            const minorArray: EventStartNode[] = jumpArray[jumpIndex];
            const currentJumpBeats: number = jumpIndex * averageBeats
            const startsFrom: number = startTime < currentJumpBeats ? 0 : Math.ceil((startTime - currentJumpBeats) / minorBeats)
            const endsBefore: number = endTime > currentJumpBeats + averageBeats ? MINOR_PARTS : Math.ceil((endTime - currentJumpBeats) / minorBeats)
            for (let minorIndex = startsFrom; minorIndex < endsBefore; minorIndex++) {
                minorArray[minorIndex] = currentNode;
            }
        }
        const originalListLength = this.listLength
        const listLength: number = Math.min(originalListLength * 4, MAX_LENGTH);
        const effectiveBeats: number = this.effectiveBeats;
        const averageBeats: number = Math.pow(2, Math.ceil(Math.log2(effectiveBeats / listLength)));
        const minorBeats: number = averageBeats / MINOR_PARTS;
        const exactLength: number = Math.floor(effectiveBeats / averageBeats) + 1;
        // console.log(originalListLength, effectiveBeats, averageBeats, minorBeats, exactLength)
        const jumpArray: (EventStartNode | EventStartNode[])[] = new Array(exactLength);
        let jumpIndex = 0;
        let lastMinorJumpIndex = -1;
        let currentNode: EventStartNode = this.head;
        for (let i = 0; i < originalListLength; i++) {
            let endNode: EventEndNode = currentNode.next;
            let nextNode: EventStartNode = endNode.next;
            let startTime: number = TimeCalculator.toBeats(currentNode.time);
            let endTime: number = TimeCalculator.toBeats(endNode.time);
            const currentJumpBeats: number = jumpIndex * averageBeats
            while (endTime >= (jumpIndex + 1) * averageBeats) {
                if (lastMinorJumpIndex === jumpIndex) {
                    fillMinor(startTime, endTime)
                    
                } else {
                    jumpArray[jumpIndex] = currentNode;
                }
                jumpIndex++;
            }
            if (endTime > currentJumpBeats) {
                if (lastMinorJumpIndex !== jumpIndex) {
                    jumpArray[jumpIndex] = new Array(MINOR_PARTS);
                    lastMinorJumpIndex = jumpIndex
                }
                fillMinor(startTime, endTime)
            }

            currentNode = nextNode;
        }
        if (lastMinorJumpIndex === jumpIndex) {
            fillMinor(TimeCalculator.toBeats(this.tail.time), Infinity)

        } else {
            jumpArray[exactLength - 1] = this.tail;
        }
        // console.log("jumpArray", jumpArray, "index", jumpIndex)
        if (jumpIndex !== exactLength - 1) {
            debugger
        }
        this.jump = jumpArray;
        this.jumpAverageBeats = averageBeats
    }
    insert() {

    }
    getNodeAt(beats: number): EventStartNode {
        if (beats >= this.effectiveBeats) {
            return this.tail;
        }
        const jumpAverageBeats = this.jumpAverageBeats
        const jumpPos = Math.floor(beats / jumpAverageBeats);
        const rest = beats - jumpPos * jumpAverageBeats;
        let canBeNodeOrArray: EventStartNode | EventStartNode[] = this.jump[jumpPos]
        let node: EventStartNode = Array.isArray(canBeNodeOrArray) ? canBeNodeOrArray[Math.floor(rest / (jumpAverageBeats / MINOR_PARTS))] : canBeNodeOrArray;
        // console.log(this, node, jumpPos, beats)
        if (!node) {
            debugger
        }
        for (; node.next && TimeCalculator.toBeats(node.next.time) < beats; ) {
            node = node.next.next;
        }
        // node = node.previous.previous
        // console.log(node, beats)
        if (beats < TimeCalculator.toBeats(node.time) || node.next && TimeCalculator.toBeats(node.next.time) < beats) {
            debugger
        }
        return node
    }
    getValueAt(beats: number) {
        return this.getNodeAt(beats).getValueAt(beats);
    }
    getIntegral(beats: number, timeCalculator: TimeCalculator) {
        const node: EventStartNode = this.getNodeAt(beats)
        return node.getIntegral(beats, timeCalculator) + node.cachedIntegral
    }
}

