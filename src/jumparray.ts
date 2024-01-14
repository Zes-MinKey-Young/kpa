// type EndBeats = number;

class JumpArray<T extends TwoDirectionNode> {
    header: Header<T>;
    tailer: Tailer<T>;
    array: (T[] | T)[];
    averageBeats: number;
    effectiveBeats: number;
    endNextFn: (node: T) => [endBeats: number, next: T];
    nextFn: (node: T, beats: number) => T | false;
    goPrev: (node: T) => T;
    constructor(
        head: Header<T>,
        tail: Tailer<T>,
        originalListLength: number,
        effectiveBeats: number,
        endNextFn: (node: T) => [endBeats: number, next: T],
        nextFn: (node: T, beats: number) => T | false,
        // goPrev: (node: T) => T
        ) {
        this.header = head;
        this.tailer = tail;
        this.effectiveBeats = effectiveBeats;
        this.endNextFn = endNextFn;
        this.nextFn = nextFn;
        //this.goPrev = goPrev
        const fillMinor = (startTime: number, endTime: number) => {
            const minorArray: T[] = <T[]>jumpArray[jumpIndex];
            const currentJumpBeats: number = jumpIndex * averageBeats
            const startsFrom: number = startTime < currentJumpBeats ? 0 : Math.ceil((startTime - currentJumpBeats) / minorBeats)
            const endsBefore: number = endTime > currentJumpBeats + averageBeats ? MINOR_PARTS : Math.ceil((endTime - currentJumpBeats) / minorBeats)
            for (let minorIndex = startsFrom; minorIndex < endsBefore; minorIndex++) {
                minorArray[minorIndex] = currentNode;
            }
        }
        // const originalListLength = this.listLength
        const listLength: number = Math.min(originalListLength * 4, MAX_LENGTH);
        const averageBeats: number = Math.pow(2, Math.ceil(Math.log2(effectiveBeats / listLength)));
        const minorBeats: number = averageBeats / MINOR_PARTS;
        const exactLength: number = Math.floor(effectiveBeats / averageBeats) + 1;
        // console.log(originalListLength, effectiveBeats, averageBeats, minorBeats, exactLength)
        const jumpArray: (T | T[])[] = new Array(exactLength);
        let jumpIndex = 0;
        let lastMinorJumpIndex = -1;
        let currentNode: T = head.next;
        let previousTime = 0;
        for (let i = 0; i < originalListLength; i++) {
            let [endTime, nextNode] = endNextFn(currentNode)
            const currentJumpBeats: number = jumpIndex * averageBeats
            // Hold树可能会出现这种情况，故需特别考虑
            if (endTime > previousTime) {
                while (endTime >= (jumpIndex + 1) * averageBeats) {
                    if (lastMinorJumpIndex === jumpIndex) {
                        fillMinor(previousTime, endTime)
                        
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
                    fillMinor(previousTime, endTime)
                }
                previousTime = endTime;
            }

            currentNode = nextNode;
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
            debugger
        }
        this.array = jumpArray;
        this.averageBeats = averageBeats
    }
    /**
     * 
     * @param beats 拍数
     * @ param usePrev 可选，若设为true，则在取到事件头部时会返回前一个事件（即视为左开右闭）
     * @returns 时间索引链表的节点
     */
    getNodeAt(beats: number): T | Tailer<T> {
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
        let canBeNodeOrArray: T | T[] = this.array[jumpPos]
        let node: T = Array.isArray(canBeNodeOrArray)
            ? canBeNodeOrArray[Math.floor(rest / (jumpAverageBeats / MINOR_PARTS))]
            : canBeNodeOrArray;
        // console.log(this, node, jumpPos, beats)
        if (!node) {
            console.log(node, jumpPos, beats)
            debugger
        }
        let next: T | false;
        // console.log(this)
        while (next = nextFn(node, beats)) {
            node = next;
        }
        return node
    }
}

class Pointer<T extends TwoDirectionNode> {
    beats: number;
    node: T | Tailer<T>;
    before: number;
    constructor() {
        this.node = null;
        this.beats = null;
        this.before = 0;
    }
    pointTo(node: TypeOrTailer<T>, beats: number, counts: boolean=false) {
        if (!node) {
            debugger
        }
        this.node = node;
        this.beats = beats
    }
}
