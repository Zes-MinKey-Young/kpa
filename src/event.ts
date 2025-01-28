// interface TemplateEasingLib {[name: string]: TemplateEasing}

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
    next: EventNode | Tailer<EventNode>;
    /** 前一个事件节点 */
    previous: EventNode | Header<EventNode>;
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
    static connect(node1: EventNode | Header<EventNode>, node2: EventNode | Tailer<EventNode>): void {
        node1.next = node2;
        node2.previous = node1;
    }
    static disconnect(node: EventStartNode) {
        (node.previous.previous).next = node.next;
        node.previous.previous = null;
        node.next = null;
    }
    static insert(node: EventStartNode, tarPrev: EventStartNode) {
        const tarNext = tarPrev.next
        this.connect(tarPrev, node);
        this.connect(node, tarNext);
    }
}
class EventStartNode extends EventNode {
    next: EventEndNode | Tailer<EventStartNode>;
    previous: EventEndNode;
    /** 
     * 对于速度事件，从计算时的时刻到此节点的总积分
     */
    cachedIntegral?: number;
    constructor(time: TimeT, value: number) {
        super(time, value);
    }
    dump(): EventDataRPE {
        const endNode = this.next as EventEndNode;
        const easing = this.easing
        return {
            bezier: easing instanceof BezierEasing ? 1 : 0,
            bezierPoints: easing instanceof BezierEasing ?
                [easing.cp1.x, easing.cp1.y, easing.cp2.x, easing.cp2.y] : // 修正了这里 cp2.y 的引用
                [0, 0, 0, 0],
            easingLeft: 0, // 假设默认值为 0
            easingRight: 0, // 假设默认值为 0
            easingType: easing instanceof TemplateEasing ?
                easing.name :
                easing instanceof NormalEasing ?
                    easing.id :
                    null,
            end: endNode.value,
            endTime: endNode.time,
            linkgroup: 0, // 假设默认值为 0
            start: this.value,
            startTime: this.time,
        }
    }
    getValueAt(beats: number) {
        // 除了尾部的开始节点，其他都有下个节点
        // 钩定型缓动也有
        if ("tailing" in this.next) {
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
        if ("tailing" in this.next) {
            return this.value
        }
        let timeDelta = TimeCalculator.getDelta(this.next.time, this.time)
        let valueDelta = this.next.value - this.value
        let current = beats - TimeCalculator.toBeats(this.time)
        if (current > timeDelta || current < 0) {
            console.warn("超过事件时间范围！", this, beats)
            // debugger
        }
        return this.value + linearEasing.getValue(current / timeDelta) * valueDelta;
    }
    /**
     * 积分获取位移
     */
    getIntegral(beats: number, timeCalculator: TimeCalculator) {
        return timeCalculator.segmentToSeconds(TimeCalculator.toBeats(this.time), beats) * (this.value + this.getSpeedValueAt(beats)) / 2 * 120 // 每单位120px
    }
    getFullIntegral(timeCalculator: TimeCalculator) {
        if ("tailing" in this.next) {
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
    moveX,
    moveY,
    rotate,
    alpha,
    speed,
    easing
}

/**
 * 为一个链表结构。会有一个数组进行快跳。
 */
class EventNodeSequence {
    id: string;
    type: EventType;
    head: Header<EventStartNode>;
    tail: Tailer<EventStartNode>;
    jump: JumpArray<EventStartNode>;
    listLength: number;
    /** 一定是二的幂，避免浮点误差 */
    jumpAverageBeats: number;
    // nodes: EventNode[];
    // startNodes: EventStartNode[];
    // endNodes: EventEndNode[];
    // eventTime: Float64Array;
    constructor(type: EventType) {
        this.type = type;
        this.head = {
            heading: true,
            next: null,
            parent: this
        };
        this.tail = {
            tailing: true,
            previous: null,
            parent: this
        }
        // this.head = this.tail = new EventStartNode([0, 0, 0], 0)
        // this.nodes = [];
        // this.startNodes = [];
        // this.endNodes = [];
    }
    static fromRPEJSON<T extends EventType>(type: T, data: EventDataRPE[], templates: TemplateEasingLib, timeCalculator: T extends EventType.speed ? TimeCalculator: undefined) {
        const length = data.length;
        // const isSpeed = type === EventType.Speed;
        // console.log(isSpeed)
        const seq = new EventNodeSequence(type);
        let listLength = length;
        let lastEnd: EventEndNode | Header<EventStartNode> = seq.head

        let lastIntegral: number = 0;
        for (let index = 0; index < length; index++) {
            const event = data[index];
            let [start, end] = EventNode.fromEvent(event, templates);
            if ("heading" in lastEnd) {
                EventNode.connect(lastEnd, start)
            } else if (lastEnd.value === lastEnd.previous.value && lastEnd.previous.easing instanceof NormalEasing) {
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
                // seq.startNodes.push(midStart);
                // seq.endNodes.push(midEnd);
                listLength++;
            } else {
                
                EventNode.connect(lastEnd, start)
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
            debugger // 这里事件层级里面一定有至少一个事件
            throw new Error();
        }
        tail = new EventStartNode(last.time, last.value);
        EventNode.connect(last, tail);
        tail.easing = last.previous.easing;
        tail.cachedIntegral = lastIntegral
        EventNode.connect(tail, seq.tail)
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
        return TimeCalculator.toBeats(this.tail.previous.time)
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
        const effectiveBeats: number = this.effectiveBeats;
        this.jump = new JumpArray(
            this.head,
            this.tail,
            originalListLength,
            effectiveBeats,
            (node) => {
                if ("tailing" in node) {
                    return [null, null]
                }
                if ("heading" in node) {
                    return [0, node.next]
                }
                const endNode =  (<EventStartNode>node).next;
                const time = "tailing" in endNode ? null : TimeCalculator.toBeats(endNode.time)
                return [time, "tailing" in endNode ? endNode : endNode.next]
            },
            (node: EventStartNode, beats: number) => TimeCalculator.toBeats((<EventEndNode>node.next).time) > beats ? false : (<EventEndNode>node.next).next,
            /*(node: EventStartNode) => {
                const prev = node.previous;
                return "heading" in prev ? node : prev.previous;
            }*/
            )
    }
    insert() {

    }
    getNodeAt(beats: number, usePrev: boolean = false): EventStartNode {
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
        if (TimeCalculator.toBeats(node.time) > beats && beats > 0) {
            debugger
        }
        return node;
    }
    getValueAt(beats: number, usePrev: boolean = false) {
        return this.getNodeAt(beats, usePrev).getValueAt(beats);
    }
    getIntegral(beats: number, timeCalculator: TimeCalculator) {
        const node: EventStartNode = this.getNodeAt(beats)
        return node.getIntegral(beats, timeCalculator) + node.cachedIntegral
    }
    updateNodesIntegralFrom(beats: number, timeCalculator: TimeCalculator) {
        let previousStartNode = this.getNodeAt(beats);
        previousStartNode.cachedIntegral = -previousStartNode.getIntegral(beats, timeCalculator);
        let totalIntegral: number = previousStartNode.cachedIntegral
        let endNode: EventEndNode | Tailer<EventStartNode>;
        while (!("tailing" in (endNode = previousStartNode.next))) {
            const currentStartNode = endNode.next
            totalIntegral += previousStartNode.getFullIntegral(timeCalculator);
            currentStartNode.cachedIntegral = totalIntegral;
            previousStartNode = currentStartNode;
        }
    }
    dump(): EventNodeSequenceDataKPA {
        const nodes: EventDataRPE[] = [];
        let currentNode: EventStartNode = this.head.next;

        while (currentNode && !("tailing" in currentNode.next)) {

            const eventData: EventDataRPE = currentNode.dump();

            nodes.push(eventData);

            currentNode = currentNode.next.next;
        }

        return {
            nodes: nodes,
            id: this.id // 或者使用其他唯一标识符
        };
    }
}

