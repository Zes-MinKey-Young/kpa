// interface TemplateEasingLib {[name: string]: TemplateEasing}

/**
 * To compare two arrays
 * @param arr1 
 * @param arr2 
 * @returns 
 */
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
abstract class EventNode {
    time: TimeT;
    value: number;
    easing: Easing;
    /** 后一个事件节点 */
    next: EventNode | Tailer<EventNode>;
    /** 前一个事件节点 */
    previous: EventNode | Header<EventNode>;
    /** 模板缓动如果钩定时采用的倍率，默认为1，不使用模板缓动则不起作用 */
    ratio: number;
    abstract parent: EventNodeSequence;
    constructor(time: TimeT, value: number) {
        this.time = time;
        this.value = value;
        this.previous = null;
        this.next = null;
        this.ratio = 1;
        this.easing = linearEasing
    }
    clone(): EventStartNode | EventEndNode {
        const ret = new (this.constructor as (typeof EventStartNode | typeof EventEndNode))
                        ([...this.time], this.value);
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
    static getEasing(data: EventDataRPE, left: number, right: number, templates: TemplateEasingLib): Easing {
        if ((left && right) && (left !== 0.0 || right !== 1.0)) {
            return new SegmentedEasing(EventNode.getEasing(data, 0.0, 1.0, templates), left, right)
        }
        if (data.bezier) {
            let bp = data.bezierPoints
            let easing = new BezierEasing();
            easing.cp1 = { x: bp[0], y: bp[1] };
            easing.cp2 = { x: bp[2], y: bp[3] };
            return easing
        } else if (typeof data.easingType === "string") {
            return templates.get(data.easingType)
        } else if (typeof data.easingType === "number" && data.easingType !== 0) {
            return rpeEasingArray[data.easingType]
        } else if (data.start === data.end) {
            return fixedEasing
        } else {
            return linearEasing
        }
    }
    /**
     * constructs EventStartNode and EventEndNode from EventDataRPE
     * @param data 
     * @param templates 
     * @returns 
     */
    static fromEvent(data: EventDataRPE, templates: TemplateEasingLib): [EventStartNode, EventEndNode] {
        let start = new EventStartNode(data.startTime, data.start)
        let end = new EventEndNode(data.endTime, data.end);
        start.easing = EventNode.getEasing(data, data.easingLeft, data.easingRight, templates);
        EventNode.connect(start, end)
        if (!start.easing) {
            start.easing = linearEasing;
            console.error("No easing found for event:", data, start, "will use linear by default")
        }
        return [start, end]
    }
    static connect(node1: EventStartNode, node2: EventEndNode | Tailer<EventStartNode>): void
    static connect(node1: EventEndNode | Header<EventStartNode>, node2: EventStartNode): void
    static connect(node1: EventNode | Header<EventNode>, node2: EventNode | Tailer<EventNode>): void {
        node1.next = node2;
        node2.previous = node1;
        if (node1 && node2) {
            node2.parent = node1.parent
        }
    }
    /*
    static disconnectStart(node: EventStartNode) {
        (node.previous.previous).next = node.next;
        node.previous.previous = null;
        node.next = null;
    }
    */
    static removeNodePair(endNode: EventEndNode, startNode: EventStartNode): [EventStartNode | Header<EventStartNode>, EventStartNode | Tailer<EventStartNode>] {
        const prev = endNode.previous;
        const next = startNode.next;
        prev.next = next;
        next.previous = prev;
        endNode.previous = null;
        startNode.next = null;
        return [this.previousStartOfStart(prev), this.nextStartOfEnd(next)]
    }
    static insert(node: EventStartNode, tarPrev: EventStartNode): [Header<EventStartNode> | EventStartNode, EventStartNode | Tailer<EventStartNode>] {
        const tarNext = tarPrev.next;
        if ("heading" in node.previous) {
            throw new Error("Cannot insert a head node before any node");
        }
        this.connect(tarPrev, node.previous);
        node.parent = node.previous.parent;
        this.connect(node, tarNext);
        return [this.previousStartOfStart(tarPrev), this.nextStartOfEnd(tarNext)]
    }
    /**
     * 
     * @param node 
     * @returns the next node if it is a tailer, otherwise the next start node
     */
    static nextStartOfStart(node: EventStartNode) {
        return "tailing" in node.next ? node.next : node.next.next
    }
    /**
     * 
     * @param node 
     * @returns itself if node is a tailer, otherwise the next start node
     */
    static nextStartOfEnd(node: EventEndNode | Tailer<EventStartNode>) {
        return "tailing" in node ? node : node.next
    }
    static previousStartOfStart(node: EventStartNode): EventStartNode | Header<EventStartNode> {
        return "heading" in node.previous ? node.previous : node.previous.previous;
    }
    /**
     * It does not return the start node which form an event with it.
     * @param node 
     * @returns 
     */
    static secondPreviousStartOfEnd(node: EventEndNode): EventStartNode | Header<EventStartNode> {
        return this.previousStartOfStart(node.previous);
    }
    static nextStartInJumpArray(node: EventStartNode): EventStartNode | Tailer<EventStartNode> {
        if ((<EventEndNode>node.next).next.isLastStart()) {
            return node.next.next.next;
        } else {
            return node.next.next;
        }
    }
    /**
     * 获得一对背靠背的节点。不适用于第一个StartNode
     * @param node 
     * @returns 
     */
    static getEndStart(node: EventStartNode | EventEndNode): [EventEndNode, EventStartNode] {
        if (node instanceof EventStartNode) {
            if (node.isFirstStart()) {
                throw new Error("Cannot get previous start node of the first start node");
            }
            return [<EventEndNode>node.previous, node]
        } else if (node instanceof EventEndNode) {
            return [node, node.next]
        }
    }
    static getStartEnd(node: EventStartNode | EventEndNode): [EventStartNode, EventEndNode] {
        if (node instanceof EventStartNode) {
            return [node, <EventEndNode>node.next]
        } else if (node instanceof EventEndNode) {
            return [<EventStartNode>node.previous, node]
        } else {
            throw new Error("Invalid node type")
        }
    }
    get innerEasing(): Easing {
        return this.easing instanceof SegmentedEasing ?
            (this.easing as SegmentedEasing).easing :
            this.easing;
    }
    /**
     * 设置easing，如果easing是分段缓动，则将分段缓动中的easing设置为innerEasing
     * 不可传入分段缓动，否则会出错
     */
    set innerEasing(easing: Exclude<Easing, SegmentedEasing>) {
        if (this.easing instanceof SegmentedEasing) {
            (this.easing as SegmentedEasing).easing = easing;
        } else {
            this.easing = easing;
        }
    }
    // #endregion
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
    next: EventEndNode | Tailer<EventStartNode>;
    previous: EventEndNode | Header<EventStartNode>;
    /** 
     * 对于速度事件，从计算时的时刻到此节点的总积分
     */
    cachedIntegral?: number;
    constructor(time: TimeT, value: number) {
        super(time, value);
    }
    get easingIsSegmented() {
        return this.easing instanceof SegmentedEasing;
    }
    parent: EventNodeSequence;
    /**
     * 因为是RPE和KPA共用的方法所以easingType可以为字符串
     * @returns 
     */
    dump(): EventDataRPE {
        const endNode = this.next as EventEndNode;
        const isSegmented = this.easingIsSegmented
        const easing = isSegmented ? (this.easing as SegmentedEasing).easing : this.easing;
        return {
            bezier: easing instanceof BezierEasing ? 1 : 0,
            bezierPoints: easing instanceof BezierEasing ?
                [easing.cp1.x, easing.cp1.y, easing.cp2.x, easing.cp2.y] : // 修正了这里 cp2.y 的引用
                [0, 0, 0, 0],
            easingLeft: isSegmented ? (this.easing as SegmentedEasing).left : 0.0,
            easingRight: isSegmented ? (this.easing as SegmentedEasing).right : 1.0,
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
    isFirstStart() {
        return this.previous && "heading" in this.previous
    }
    isLastStart() {
        return this.next && "tailing" in this.next
    }
    clone(): EventStartNode {
        return super.clone() as EventStartNode;
    };
}
/*
type AnyStartNode = EventStartNode<EventNodeType.first>
                  | EventStartNode<EventNodeType.middle>
                  | EventStartNode<EventNodeType.last>
                  */
class EventEndNode extends EventNode {
    next: EventStartNode;
    previous: EventStartNode;
    get parent() {return this.previous?.parent}
    set parent(_parent: EventNodeSequence) {}
    constructor(time: TimeT, value: number) {
        super(time, value);
    }
    getValueAt(beats: number) {
        return this.previous.getValueAt(beats);
    }
    clone(): EventEndNode {
        return super.clone() as EventEndNode;
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
    chart: Chart;
    /** id follows the format `#${lineid}.${layerid}.${typename}` by default */
    id: string;
    /** has no time or value */
    head: Header<EventStartNode>;
    /** has no time or value */
    tail: Tailer<EventStartNode>;
    jump: JumpArray<EventStartNode>;
    listLength: number;
    /** 一定是二的幂，避免浮点误差 */
    jumpAverageBeats: number;
    // nodes: EventNode[];
    // startNodes: EventStartNode[];
    // endNodes: EventEndNode[];
    // eventTime: Float64Array;
    constructor(public type: EventType, public effectiveBeats: number) {
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
        this.listLength = 1;
        // this.head = this.tail = new EventStartNode([0, 0, 0], 0)
        // this.nodes = [];
        // this.startNodes = [];
        // this.endNodes = [];
    }
    static fromRPEJSON<T extends EventType>(type: T, data: EventDataRPE[], chart: Chart) {
        const {templateEasingLib: templates, timeCalculator} = chart
        const length = data.length;
        // const isSpeed = type === EventType.Speed;
        // console.log(isSpeed)
        const seq = new EventNodeSequence(type, chart.effectiveBeats);
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
    static newSeq(type: EventType, effectiveBeats: number): EventNodeSequence {
        const sequence = new EventNodeSequence(type, effectiveBeats);
        const node = new EventStartNode([0, 0, 1], type === EventType.speed ? 10 : 0);
        EventNode.connect(sequence.head, node)
        EventNode.connect(node, sequence.tail)
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
        const effectiveBeats: number = this.effectiveBeats;
        this.jump = new JumpArray<EventStartNode>(
            this.head,
            this.tail,
            originalListLength,
            effectiveBeats,
            (node) => {
                // console.log(node)
                if ("tailing" in node) {
                    return [null, null]
                }
                if ("heading" in node) {
                    return [0, node.next]
                }
                const endNode =  <EventEndNode>(<EventStartNode>node).next;
                const time = TimeCalculator.toBeats(endNode.time);
                const nextNode = endNode.next;
                if ("tailing" in nextNode.next) {
                    return [time, nextNode.next] // Tailer代替最后一个StartNode去占位
                } else {
                    return [time, nextNode]
                }
            },
            (node: EventStartNode, beats: number) => {
                return TimeCalculator.toBeats((<EventEndNode>node.next).time) > beats ? false : EventNode.nextStartInJumpArray(node)
            },
            /*(node: EventStartNode) => {
                const prev = node.previous;
                return "heading" in prev ? node : prev.previous;
            }*/
            )
    }
    insert() {

    }
    getNodeAt(beats: number, usePrev: boolean = false): EventStartNode {
        let node = this.jump?.getNodeAt(beats) || this.head.next;
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
            console.warn("Got a node after the given beats. This would only happen when the given beats is negative. Beats and Node:", beats, node)
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
            type: this.type,
            events: nodes,
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
    substitute(map: Map<EventNodeSequence, EventNodeSequence>) {
        if (map.has(this)) {
            return map.get(this);
        }
        let currentNode: EventStartNode = this.head.next;
        const newSeq = new EventNodeSequence(this.type, this.effectiveBeats);
        map.set(this, newSeq);
        let currentPos: Header<EventStartNode> | EventEndNode = newSeq.head;
        while (true) {
            if (!currentNode || ("tailing" in currentNode.next)) {
                break;
            }
            const endNode = currentNode.next;
            if (currentNode.easing instanceof TemplateEasing) {
                const quoted: EventNodeSequence = currentNode.easing.eventNodeSequence.substitute(map);
                /** 只对头尾数值相同的模板缓动有效 */
                const ratio: number = currentNode.ratio;
                const startTime: TimeT = currentNode.time;
                const endTime: TimeT = endNode.time;
                const start: number = currentNode.value;
                const end: number = endNode.value;
                const delta = end - start;
                const originalDelta = quoted.head.next.value - quoted.tail.previous.value;
                const convert: (v: number) => number
                    = delta === 0
                    ? (value: number) => start + value * ratio
                    : (value: number) => start + value * delta / originalDelta;
                let node = quoted.head.next;
                while (true) {
                    const newNode = new EventStartNode(node.time, convert(node.value))
                    
                }
            } else {
                const newStartNode = currentNode.clone();
                const newEndNode = endNode.clone();
                EventNode.connect(currentPos, newStartNode)
                EventNode.connect(newStartNode, newEndNode);
                currentPos = newEndNode;
            }
            currentNode = endNode.next;
        }
    }
}

