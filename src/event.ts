interface TemplateEasingLib {[name: string]: TemplateEasing}

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
    constructor() {
        this.previous = null;
        this.next = null;
        this.ratio = 1;
    }
    static fromEvent(data: EventData, templates: TemplateEasingLib): [EventStartNode, EventEndNode] {
        let start = new EventStartNode, end = new EventEndNode();
        start.time = data.startTime;
        start.value = data.start;
        end.previous = start;
        start.next = end;
        end.time = data.endTime;
        end.value = data.end;
        if (data.bezier) {
            let bp = data.bezierPoints
            let easing = new BezierEasing();
            easing.cp1 = {x: bp[0], y: bp[1]};
            easing.cp2 = {x: bp[2], y: bp[3]};
            start.easing = easing
        } else if (typeof data.easingType === "string") {
            start.easing = templates[data.easingType]
        } else if (data.easingType !== 0) {
            start.easing = rpeEasingArray[data.easingType]
        }
        return [start, end]
    }
}
class EventStartNode extends EventNode {
    next?: EventEndNode;
    previous: EventEndNode;
    constructor() {
        super()
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
        return timeCalculator.segmentToSeconds( TimeCalculator.toBeats(this.time), beats) * (this.value + this.getSpeedValueAt(beats)) / 2 * 120 // 每单位120px
    }
    getFullIntegral(timeCalculator: TimeCalculator) {
        if (!this.next) {
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
    constructor() {
        super()
    }
    getValueAt(beats: number) {
        return this.previous.getValueAt(beats);
    }
}

class EventNodeSequence {
    // nodes: EventNode[];
    startNodes: EventStartNode[];
    endNodes: EventEndNode[];
    eventTime: Float64Array;
    constructor() {
        // this.nodes = [];
        this.startNodes = [];
        this.endNodes = [];
    }
    static fromRPEJSON(data: EventData[], templates: TemplateEasingLib) {
        let seq = new EventNodeSequence();
        const length = data.length;
        let lastEnd: EventEndNode = null;
        for (let index = 0; index < length; index++) {
            const event = data[index];
            let [start, end] = EventNode.fromEvent(event, templates);
            if (lastEnd) {
                if (lastEnd.value === lastEnd.previous.value) {
                    lastEnd.time = start.time
                } else if (!arrEq(lastEnd.time, start.time)) {
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
            let start = this.startNodes[index + 1]
            if (!arrEq(end.time, start.time)) {
                start.time = end.time
            }
            start.previous = end;
            end.next = start;
            // 这个就是真的该这么写了（
        }
    }
    /** 有效浮点拍数：最后一个结束节点的时间 */
    get effectiveBeats(): number {
        return TimeCalculator.toBeats(this.endNodes[this.endNodes.length - 1].time)
    }
    update() {
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
    }
    insert() {

    }
    getValueAt(beats: number) {
        let eventTime = this.eventTime;
        const length = this.endNodes.length
        let i = 0;
        let rest = beats
        for (; i < length; i++) {
            rest -= eventTime[i];
            if (rest < 0) {
                break
            }
            /**
            if (beats < 0) {
                break
            }
            */
        }
        return this.startNodes[i].getValueAt(beats);
    }
    getIntegral(beats: number, timeCalculator: TimeCalculator) {
        let total = 0;
        const length = this.endNodes.length;
        let i = 0;
        for (; i < length; i++) {
            if (TimeCalculator.toBeats(this.endNodes[i].time) >= beats) {
                break;
            }
            total += this.startNodes[i].getFullIntegral(timeCalculator);
        }
        console.log(total, this)
        total += this.startNodes[i].getIntegral(beats, timeCalculator);
        console.log(total)
        return total;
    }
}

