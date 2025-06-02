/**
 *
 */
class BPMStartNode extends EventStartNode {
    nspb: number;
    cachedStartIntegral?: number;
    cachedIntegral?: number;
    next: BPMEndNode | Tailer<BPMStartNode>;
    constructor(startTime: TimeT, bpm: number) {
        super(startTime, bpm);
        this.nspb = Math.round(60_000_000_000 / bpm);
    }
    getIntegral(beats: number): number {
        return Math.round((beats - TimeCalculator.toBeats(this.time)) * this.nspb);
    }
    /**
     * may only used with a startnode whose next is not tail
     * @returns 
     */
    getFullIntegral(): number {
        return Math.round((TimeCalculator.toBeats(this.next.time) - TimeCalculator.toBeats(this.time)) * this.nspb);
    }
    /*
    static connect(node1: BPMStartNode, node2: BPMEndNode | Tailer<EventStartNode>): void;
    static connect(node1: BPMEndNode | Header<BPMStartNode>, node2: BPMStartNode): void;
    static connect(node1: EventNode | Header<EventNode>, node2: EventNode | Tailer<EventNode>): void {
        super.connect(node1, node2);
    }
    */
}
class BPMEndNode extends EventEndNode {
    spb: number;
    previous: BPMStartNode;
    next: BPMStartNode;
    constructor(endTime: TimeT) {
        super(endTime, null);
    }
    // @ts-expect-error
    get value(): number {
        return this.previous.value
    }
    set value(val) {}
}

/**
 * 拥有与事件类似的逻辑
 * 每对节点之间代表一个BPM相同的片段
 * 片段之间BPM可以发生改变
 */

class BPMSequence extends EventNodeSequence {
    head: Header<BPMStartNode>;
    tail: Tailer<BPMStartNode>;
    /** 从拍数访问节点 */
    jump: JumpArray<EventStartNode>;
    /** 以秒计时的跳数组，处理从秒访问节点 */
    secondJump: JumpArray<BPMStartNode>;
    constructor(bpmList: BPMSegmentData[], public duration: number) {
        super(EventType.bpm, null);
        let curPos: Header<BPMStartNode> | BPMEndNode = this.head;
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
        const last = new BPMStartNode(next.startTime, next.bpm)
        BPMStartNode.connect(curPos, last);
        BPMStartNode.connect(last, this.tail);
        this.initJump();
    }
    initJump(): void {
        console.log(this)
        this.effectiveBeats = TimeCalculator.toBeats(this.tail.previous.time)
        super.initJump();
        this.updateSecondJump();
    }
    updateSecondJump(): void {
        // 用纳秒计算，相加的时候两边都是整形，减少浮点误差
        let integralNs = 0;
        // 计算积分并缓存到BPMNode
        let node: TypeOrHeader<BPMStartNode> = this.head.next;
        while (true) {
            if ("tailing" in node.next) {
                break;
            }
            const endNode = <BPMEndNode>(<BPMStartNode>node).next;
            const nodeIntegral = node.getFullIntegral();
            console.log(nodeIntegral, integralNs)
            node.cachedStartIntegral = integralNs;
            integralNs += Math.round(nodeIntegral);
            node.cachedIntegral = integralNs;

            node = endNode.next;
        }
        node.cachedStartIntegral = integralNs;
        const originalListLength = this.listLength;
        this.secondJump = new JumpArray(
            this.head,
            this.tail,
            originalListLength,
            this.duration * 1_000_000_000,
            (node) => {
                if ("tailing" in node) {
                    return [null, null];
                }
                if ("heading" in node) {
                    return [0, node.next];
                }
                const endNode = <BPMEndNode>(<BPMStartNode>node).next;
                const time = node.cachedIntegral;
                const nextNode = endNode.next;
                if ("tailing" in nextNode.next) {
                    return [time, nextNode.next]; // Tailer代替最后一个StartNode去占位
                } else {
                    return [time, nextNode];
                }
            },
            (node: BPMStartNode, nanoseconds: number) => {
                return node.cachedIntegral > nanoseconds ? false : (<BPMEndNode>node.next).next;
            }
        );
        debugger;
    }

    getNodeBySeconds(seconds: number): BPMStartNode {
        const node = this.secondJump.getNodeAt(seconds * 1_000_000_000);
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
    bpmList: BPMSegmentData[];
    bpmSequence: BPMSequence;
    duration: number;

    constructor() {
    }

    update() {
        let bpmList = this.bpmList;
        this.bpmSequence = new BPMSequence(bpmList, this.duration);
    }
    toSeconds(beats: number) {
        const node: BPMStartNode = this.bpmSequence.getNodeAt(beats);
        // console.log(node)
        const pre = !("heading" in node.previous) ? node.previous.previous.cachedIntegral : 0;
        return (node.cachedStartIntegral + node.getIntegral(beats)) / 1_000_000_000;
    }
    segmentToSeconds(beats1: number, beats2: number): number {
        let ret = this.toSeconds(beats2) - this.toSeconds(beats1)
        if (ret < 0) {
            console.warn("segmentToSeconds的第二个参数需大于第一个！", "得到的参数：", arguments)
        }
        return ret
    }
    secondsToBeats(seconds: number) {
        const nanoseconds = seconds * 1_000_000_000;
        const node = this.bpmSequence.getNodeBySeconds(nanoseconds);
        // console.log("node:", node)
        const beats = (nanoseconds - node.cachedStartIntegral) / node.nspb;
        return TimeCalculator.toBeats(node.time) + beats
    }
    static toBeats(beaT: TimeT): number {
        if (!beaT) debugger
        return beaT[0] + beaT[1] / beaT[2]
    }
    static getDelta(beaT1: TimeT, beaT2: TimeT): number {
        return this.toBeats(beaT1) - this.toBeats(beaT2)
    }
    static eq(beaT1: TimeT, beaT2: TimeT): boolean {
        return beaT1[0] === beaT2 [0] && beaT1[1] * beaT2[2] === beaT1[2] * beaT2[1] // 这里曾经把两个都写成beaT1，特此留念（
    }
    static gt(beaT1:TimeT, beaT2: TimeT): boolean {
        return beaT1[0] > beaT2[0] || beaT1[0] === beaT2[0] && beaT1[1] * beaT2[2] > beaT1[2] * beaT2[1]
    }
    static lt(beaT1:TimeT, beaT2: TimeT): boolean {
        return beaT1[0] < beaT2[0] || beaT1[0] === beaT2[0] && beaT1[1] * beaT2[2] < beaT1[2] * beaT2[1]
    }
    static ne(beaT1:TimeT, beaT2: TimeT): boolean {
        return beaT1[0] !== beaT2[0] || beaT1[1] * beaT2[2] !== beaT1[2] * beaT2[1]
    }
    static sub(beaT1: TimeT, beaT2: TimeT): TimeT {
        return [beaT1[0] - beaT2[0], beaT1[1] * beaT2[2] - beaT1[2] * beaT2[1], beaT1[2] * beaT2[2]]
    }
    static div(beaT1: TimeT, beaT2: TimeT): [number, number] {
        return [(beaT1[0] * beaT1[2] + beaT1[1]) * beaT2[2], (beaT2[0] * beaT2[2] + beaT2[1]) * beaT1[2]]
    }
    static mul(beaT: TimeT, ratio: [number, number]): TimeT {
        // 将带分数beaT: TimeT乘一个分数[number, number]得到一个新的带分数returnval: TimeT，不要求这个带分数分子不超过分母，但所有的数都是整数
        // （输入的两个元组都是整数元组）
        const [numerator, denominator] = ratio
        const b0nume = beaT[0] * numerator;
        const remainder = b0nume % denominator;
        if (remainder === 0) {
            return [b0nume / denominator, beaT[1] * numerator, beaT[2] * denominator]
        } else {
            return [Math.floor(b0nume / denominator), beaT[1] * numerator + remainder * beaT[2], beaT[2] * denominator]
        }
    }
    /**
     * 原地规范化时间元组，但仍然返回这个元组，方便使用
     * validate TimeT in place
     * @param beaT 
     */
    static validate(beaT: TimeT): TimeT {
        if (beaT === undefined || beaT[2] === 0) {
            throw new Error("Invalid time" + beaT.valueOf());
        }
        if (beaT[1] >= beaT[2]) {
            const quotient = Math.floor(beaT[1] / beaT[2]);
            const remainder = beaT[1] % beaT[2];
            beaT[0] += quotient;
            beaT[1] = remainder;
        } else if (beaT[1] < 0) {
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
    static gcd(a: number, b: number): number {
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
    dump(): BPMSegmentData[] {
        return this.bpmList;
    }
}

const TC = TimeCalculator;