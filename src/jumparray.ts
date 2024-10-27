// type EndBeats = number;
const MIN_LENGTH = 128
const MAX_LENGTH = 1024
const MINOR_PARTS = 16;

type EndNextFn<T extends TwoDirectionNode> = (node: TypeOrTailer<T> | Header<T>) => [endBeats: number, next: TypeOrTailer<T>];

class JumpArray<T extends TwoDirectionNode> {
    header: Header<T>;
    tailer: Tailer<T>;
    array: (TypeOrTailer<T>[] | TypeOrTailer<T>)[];
    averageBeats: number;
    effectiveBeats: number;
    endNextFn: EndNextFn<T>
    nextFn: (node: T, beats: number) => T | false;
    goPrev: (node: T) => T;

    constructor(
        head: Header<T>,
        tail: Tailer<T>,
        originalListLength: number,
        effectiveBeats: number,
        endNextFn: EndNextFn<T>,
        nextFn: (node: T, beats: number) => T | false,
        // goPrev: (node: T) => T
        ) {
        this.header = head;
        this.tailer = tail;
        this.effectiveBeats = effectiveBeats;
        this.endNextFn = endNextFn;
        this.nextFn = nextFn;
        // const originalListLength = this.listLength
        const listLength: number = Math.max(MIN_LENGTH, Math.min(originalListLength * 4, MAX_LENGTH));
        const averageBeats: number = Math.pow(2, Math.ceil(Math.log2(effectiveBeats / listLength)));
        const exactLength: number = Math.ceil(effectiveBeats / averageBeats);
        // console.log(originalListLength, effectiveBeats, averageBeats, minorBeats, exactLength)
        const jumpArray: (TypeOrTailer<T> | TypeOrTailer<T>[])[] = new Array(exactLength);
        this.array = jumpArray;
        this.averageBeats = averageBeats;
        this.updateRange(head, tail)
    }
    updateEffectiveBeats(val: number) {
        this.effectiveBeats = val;
        const averageBeats = this.averageBeats;
        const exactLength: number = Math.ceil(val / averageBeats);
        const currentLength = this.array.length
        if (exactLength < currentLength) {
            this.array.splice(exactLength, currentLength - exactLength)
        }
    }
    updateAverageBeats() {
        const length = this.array.length;
        if (length >= 1024) {
            return
        }
        let crowded = 0
        for (let i = 0; i < 50; i++) {
            const index = Math.floor(Math.random() * length);
            if (Array.isArray(this.array[index])) {
                crowded++
            }
        }
        if (crowded > 30) {
            this.averageBeats /= 2
            this.updateRange(this.header, this.tailer)
        }
    }
    /**
     * 
     * @param firstNode 不含
     * @param lastNode 含
     */
    updateRange(firstNode: TypeOrHeader<T>, lastNode: TypeOrTailer<T>) {
        const {endNextFn, effectiveBeats} = this;
        const fillMinor = (startTime: number, endTime: number) => {
            const minorArray: TypeOrTailer<T>[] = <T[]>jumpArray[jumpIndex];
            const currentJumpBeats: number = jumpIndex * averageBeats
            const startsFrom: number = startTime < currentJumpBeats ? 0 : Math.ceil((startTime - currentJumpBeats) / minorBeats)
            const endsBefore: number = endTime > currentJumpBeats + averageBeats ? MINOR_PARTS : Math.ceil((endTime - currentJumpBeats) / minorBeats)
            for (let minorIndex = startsFrom; minorIndex < endsBefore; minorIndex++) {
                minorArray[minorIndex] = currentNode;
            }
        }
        const jumpArray = this.array
        const averageBeats: number = this.averageBeats;
        const minorBeats: number = averageBeats / MINOR_PARTS;
        let [previousEndTime, currentNode] = endNextFn(firstNode);
        let jumpIndex = Math.ceil(previousEndTime);
        let lastMinorJumpIndex = -1;
        for (;;) {
            let [endTime, nextNode] = endNextFn(currentNode);
            if (endTime === null) {
                endTime = effectiveBeats;
            }
            const currentJumpBeats: number = jumpIndex * averageBeats
            // Hold树可能会出现这种情况，故需特别考虑
            if (endTime > previousEndTime) {
                while (endTime >= (jumpIndex + 1) * averageBeats) {
                    if (lastMinorJumpIndex === jumpIndex) {
                        fillMinor(previousEndTime, endTime)
                        
                    } else {
                        try {
                        jumpArray[jumpIndex] = currentNode;
                        } catch (E) {console.log(jumpIndex, jumpArray);debugger}
                    }
                    jumpIndex++;
                }
                if (endTime > currentJumpBeats) {
                    if (lastMinorJumpIndex !== jumpIndex) {
                        jumpArray[jumpIndex] = new Array(MINOR_PARTS);
                        lastMinorJumpIndex = jumpIndex
                    }
                    fillMinor(previousEndTime, endTime)
                }
                previousEndTime = endTime;
            }
            if (currentNode === lastNode) {
                break
            }
            currentNode = nextNode;
        }
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
        let canBeNodeOrArray: TypeOrTailer<T> | TypeOrTailer<T>[] = this.array[jumpPos]
        let node: TypeOrTailer<T> = Array.isArray(canBeNodeOrArray)
            ? canBeNodeOrArray[Math.floor(rest / (jumpAverageBeats / MINOR_PARTS))]
            : canBeNodeOrArray;
        if ("tailing" in node) {
            return node;
        }
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
