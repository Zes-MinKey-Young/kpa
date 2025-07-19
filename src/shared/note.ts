/**
 * @author Zes M Young
 */


const NNLIST_Y_OFFSET_HALF_SPAN = 100


const node2string = (node: NoteNode | Tailer<NoteNode>) => {
    if (!node) {
        return "" + node
    }
    if ("heading" in node || "tailing" in node) {
        return "heading" in node ? "H" : "tailing" in node ? "T" : "???"
    }
    if (!node.notes) {
        return "EventNode"
    }
    return `NN(${node.notes.length}) at ${node.startTime}`
}
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
    above: boolean;
    alpha: number;
    endTime: [number, number, number]
    isFake: boolean;
    /** x coordinate in the judge line */
    positionX: number;
    size: number;
    speed: number;
    startTime: [number, number, number];
    type: NoteType;
    visibleTime: number;
    visibleBeats: number;
    yOffset: number;
    /*
     * 和打击位置的距离，与yOffset和上下无关，为负不可见
    positionY: number;
    endPositionY?: number;
     */
    /*
    next: TypeOrTailer<NoteNode>;
    previousSibling?: Note;
    nextSibling: Note;
    */

    parentNode: NoteNode;

    // readonly chart: Chart;
    // readonly judgeLine: JudgeLine
    // posPrevious?: Note;
    // posNext?: Note;
    // posPreviousSibling?: Note;
    // posNextSibling: Note;
    constructor(data: NoteDataRPE) {
        this.above = data.above === 1;
        this.alpha = data.alpha ?? 255;
        this.endTime = data.type === NoteType.hold ? data.endTime : data.startTime;
        this.isFake = Boolean(data.isFake);
        this.positionX = data.positionX;
        this.size = data.size ?? 1.0;
        this.speed = data.speed ?? 1.0;
        this.startTime = data.startTime;
        this.type = data.type;
        this.visibleTime = data.visibleTime;
        // @ts-expect-error
        this.yOffset = data.absoluteYOffset ?? data.yOffset * this.speed;
        // @ts-expect-error 若data是RPE数据，则为undefined，无影响。
        // 当然也有可能是KPA数据但是就是没有给
        this.visibleBeats = data.visibleBeats;
        /*
        this.previous = null;
        this.next = null;
        this.previousSibling = null;
        this.nextSibling = null;
        */
    }
    static fromKPAJSON(data: NoteDataKPA, timeCalculator: TimeCalculator) {
        const note = new Note(data);
        if (!note.visibleBeats) {
            note.computeVisibleBeats(timeCalculator);
        }
        return note;
    }
    computeVisibleBeats(timeCalculator: TimeCalculator) {
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
    clone(offset: TimeT) {
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
    dumpRPE(timeCalculator: TimeCalculator): NoteDataRPE {
        let visibleTime: number;
        if (this.visibleBeats !== Infinity) {
            const beats = TimeCalculator.toBeats(this.startTime);
            this.visibleBeats = timeCalculator.segmentToSeconds(beats - this.visibleBeats, beats);
        } else {
            visibleTime = 99999.0
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
            speed: this.speed
        }
    }
    dumpKPA(): NoteDataKPA {
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
            speed: this.speed
        }
    }
}
/*
abstract class TwoDirectionTreeNode {
    constructor() {

    }

}
*/

type Connectee = NoteNode | NNNode


class NoteNode implements TwoDirectionNode {
    totalNode: NNNode;
    readonly startTime: TimeT
    /**
     * The notes it contains.
     * If they are holds, they are ordered by their endTime, from late to early.
     */
    readonly notes: Note[];
    next: TypeOrTailer<NoteNode>;
    _previous: WeakRef<TypeOrHeader<NoteNode>> | null;
    get previous(): TypeOrHeader<NoteNode> {
        if (!this._previous) return null;
        return this._previous.deref()
    }
    set previous(val) {
        if (!val) {
            this._previous = null;
            return;
        }
        this._previous = new WeakRef(val)
    }
    parentSeq: NNList
    chart: Chart;
    static count = 0;
    id: number;
    constructor(time: TimeT) {
        this.startTime = [...time];
        this.notes = [];
        this.id = NoteNode.count++;
    }
    static fromKPAJSON(data: NoteNodeDataKPA, timeCalculator: TimeCalculator) {
        const node = new NoteNode(data.startTime);
        for (let noteData of data.notes) {
            const note = Note.fromKPAJSON(noteData, timeCalculator);
            node.add(note);
        }
        return node
    }
    get isHold() {
        return this.parentSeq instanceof HNList
    }
    get endTime(): TimeT {
        if (this.notes.length === 0) {
            return this.startTime; // 改了半天这个逻辑本来就是对的()
        }
        return (this.notes.length === 0 || this.notes[0].type !== NoteType.hold) ? this.startTime : this.notes[0].endTime
    }
    add(note: Note) {
        if (!TimeCalculator.eq(note.startTime, this.startTime)) {
            console.warn("Wrong addition!")
        }
        this.notes.push(note);
        note.parentNode = this
        this.sort(this.notes.length - 1);
    }
    sort(note: Note): void;
    /**
     * 其他部分均已有序，通过冒泡排序把发生变更的NoteNode移动到正确的位置 
     * @param index 待排序的Note的索引
     */
    sort(index: number): void;
    sort(index: number | Note) {
        if (typeof index !== "number") {
            index = this.notes.indexOf(index);
            if (index === -1) {
                return;
            }
        }
        if (!this.isHold) {
            return;
        }
        const {notes} = this;
        const note = notes[index];
        for (let i = index; i > 0; i--) {
            const prev = notes[i - 1];
            if (TimeCalculator.lt(prev.endTime, note.endTime)) {
                // swap
                notes[i] = prev;
                notes[i - 1] = note;
            } else {
                break;
            }
        }
        for (let i = index; i < notes.length - 1; i++) {
            const next = notes[i + 1];
            if (TimeCalculator.gt(next.endTime, note.endTime)) {
                // swap
                notes[i] = next;
                notes[i + 1] = note;
            } else {
                break;
            }
        }
    }
    remove(note: Note) {
        this.notes.splice(this.notes.indexOf(note), 1)
        note.parentNode = null
    }
    static disconnect<T extends Connectee>(note1: T | Header<T>, note2: T | Tailer<T>) {
        if (note1) {
            note1.next = null;
        }
        if (note2) {
            note2.previous = null;
        }

    }
    static connect<T extends Connectee>(note1: T | Header<T>, note2: T | Tailer<T>) {
        if (note1) {
            // @ts-expect-error
            note1.next = note2;
        }
        if (note2) {
            // @ts-expect-error
            note2.previous = note1;
        }
        if (note1 && note2) {
            note2.parentSeq = note1.parentSeq
        }
    }
    static insert<T extends Connectee>(note1: TypeOrHeader<T>, inserted: T, note2: TypeOrTailer<T>) {
        this.connect(note1, inserted);
        this.connect(inserted, note2);
    }
    dump(): NoteNodeDataKPA {
        return {
            notes: this.notes.map(note => note.dumpKPA()),
            startTime: this.startTime
        }
    }
}


class NNList {
    /** 格式为#xxoxx或$xxoxx，亦可自命名 */
    id: string;
    head: Header<NoteNode>;
    tail: Tailer<NoteNode>;
    currentPoint: NoteNode | Header<NoteNode>;
    // currentBranchPoint: NoteNode;
    /*
    renderPointer: Pointer<NoteNode>;
    hitPointer: Pointer<NoteNode>;
    editorPointer: Pointer<NoteNode>;
    */
    /** 定位上个Note头已过，本身未到的Note */
    jump: JumpArray<NoteNode>;
    timesWithNotes: number;
    // timesWithHolds: number;
    timeRanges: [number, number][];
    effectiveBeats: number;

    parentLine: JudgeLine;
    constructor(public speed: number, public medianYOffset: number = 0, effectiveBeats?: number) {
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
        this.effectiveBeats = effectiveBeats
    }
    /** 此方法永远用于最新KPAJSON */
    static fromKPAJSON(isHold: boolean, effectiveBeats: number, data: NNListDataKPA, nnnList: NNNList, timeCalculator: TimeCalculator) {
        const list = isHold ? new HNList(data.speed, data.medianYOffset, effectiveBeats) : new NNList(data.speed, data.medianYOffset, effectiveBeats)
        const nnlength = data.noteNodes.length
        let cur: TypeOrHeader<NoteNode> = list.head;
        for (let i = 0; i < nnlength; i++) {
            const nnData = data.noteNodes[i];
            const nn = NoteNode.fromKPAJSON(nnData, timeCalculator);
            NoteNode.connect(cur, nn);
            cur = nn;
            nnnList.addNoteNode(nn);
        }
        NoteNode.connect(cur, list.tail);
        list.initJump();
        return list
    }
    initJump() {
        const originalListLength = this.timesWithNotes;
        if (!this.effectiveBeats) {
            this.effectiveBeats = TimeCalculator.toBeats(this.tail.previous.endTime)
        }
        const effectiveBeats: number = this.effectiveBeats;
        this.jump = new JumpArray<NoteNode>(
            this.head,
            this.tail,
            originalListLength,
            effectiveBeats,
            (node: TypeOrHeader<NoteNode> | Tailer<NoteNode>) => {
                if ("tailing" in node) {
                    return [null, null]
                }
                const nextNode = node.next;
                const startTime = "heading" in node ? 0 : TimeCalculator.toBeats(node.startTime)
                return [startTime, nextNode]
            },
            (note: NoteNode, beats: number) => {
                return TimeCalculator.toBeats(note.startTime) >= beats ? false : <NoteNode>note.next; // getNodeAt有guard
            }
            /*,
            (note: Note) => {
                const prev = note.previous;
                return "heading" in prev ? note : prev
            })*/)
    }
    initPointer(pointer: Pointer<NoteNode>) {
        pointer.pointTo(this.head.next, 0)
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
    getNodeAt(beats: number, beforeEnd=false, pointer?: Pointer<NoteNode>, ): NoteNode | Tailer<NoteNode> {
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
    getNodeOf(time: TimeT) {
        const node = this.getNodeAt(TimeCalculator.toBeats(time), false)
                    .previous;


        const isEqual = !("heading" in node) && TimeCalculator.eq(node.startTime, time)

        if (!isEqual) {
            const newNode = new NoteNode(time);
            const next = node.next
            NoteNode.insert(node, newNode, next);
            // console.log("created:", node2string(newNode))
            this.jump.updateRange(node, next);
            // console.log("pl", this.parentLine)

            if (this.parentLine?.chart) {
                this.parentLine.chart.nnnList.getNode(time).add(newNode)
            }

            return newNode
        } else {
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
    static distanceFromPointer<T extends NNNode | NoteNode>(beats: number, pointer: Pointer<T>, useEnd: boolean=false): 1 | 0 | -1 {
        const note = pointer.node;
        if (!note) {
            debugger;
        }
        if ("tailing" in note) {
            if ("heading" in note.previous) {
                return 0
            }
            return TimeCalculator.toBeats(useEnd ? note.previous.endTime : note.previous.startTime) < beats ? -1 : 0;
        }
        const previous = note.previous;
        if (!previous) debugger
        const previousBeats = "heading" in previous ? -Infinity : TimeCalculator.toBeats(useEnd ? previous.endTime: previous.startTime);
        const thisBeats = TimeCalculator.toBeats(useEnd ? note.endTime : note.startTime);
        console.log("tpb", thisBeats, previousBeats, beats)
        if (beats < previousBeats) {
            return -1;
        } else if (beats > thisBeats) {
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
    dumpKPA(): NNListDataKPA {
        const nodes: NoteNodeDataKPA[] = []
        let node: TypeOrTailer<NoteNode> = this.head.next
        while (!("tailing" in node)) {
            nodes.push(node.dump())
            node = node.next
        }
        return {
            speed: this.speed,
            noteNodes: nodes
        }
    }
}


/**
 * HoldNode的链表
 * HN is the abbreviation of HoldNode, which is not individually declared.
 * A NN that contains holds (a type of note) is a HN.
 */
class HNList extends NNList {
    /**
     * 最早的还未结束Hold
     */
    holdTailJump: JumpArray<NoteNode>;
    constructor(speed: number, medianYOffset: number, effectiveBeats?: number) {
        super(speed, medianYOffset, effectiveBeats)
    }
    initJump(): void {
        super.initJump()
        const originalListLength = this.timesWithNotes;
        const effectiveBeats: number = this.effectiveBeats;
        
        this.holdTailJump = new JumpArray<NoteNode>(
            this.head,
            this.tail,
            originalListLength,
            effectiveBeats,
            (node) => {
                if ("tailing" in node) {
                    return [null, null]
                }
                if (!node) debugger
                const nextNode = (<TypeOrHeader<NoteNode>>node).next;
                const endTime = "heading" in node ? 0 : TimeCalculator.toBeats((<NoteNode>node).endTime)
                return [endTime, nextNode]
            },
            (node: NoteNode, beats: number) => {
                return TimeCalculator.toBeats(node.endTime) >= beats ? false : <NoteNode>node.next; // getNodeAt有guard
            }
        )
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
    
    getNodeAt(beats: number, beforeEnd=false): TypeOrTailer<NoteNode> {
        return beforeEnd ? this.holdTailJump.getNodeAt(beats) : this.jump.getNodeAt(beats);
    }
    // unused
    insertNoteJumpUpdater(note: NoteNode): () => void {
        const {previous, next} = note
        return () => {
            this.jump.updateRange(previous, next)
            this.holdTailJump.updateRange(previous, next)
        }
    }
}

class NNNode implements TwoDirectionNode {
    readonly noteNodes: NoteNode[];
    readonly holdNodes: NoteNode[];
    readonly startTime: TimeT;
    real: number;
    noteOfType: [number, number, number, number]
    previous: TypeOrHeader<NNNode>;
    next: TypeOrTailer<NNNode>
    constructor(time: TimeT) {
        this.noteNodes = []
        this.holdNodes = [];
        this.startTime = time
    }
    get endTime() {
        let latest: TimeT = this.startTime;
        for (let index = 0; index < this.holdNodes.length; index++) {
            const element = this.holdNodes[index];
            if (TC.gt(element.endTime, latest)) {
                latest = element.endTime
            }
        }
        return latest
    }
    add(node: NoteNode) {
        if (node.isHold) {
            this.holdNodes.push(node)
        } else {
            
            this.noteNodes.push(node)
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
    jump: JumpArray<NNNode>
    parentChart: Chart;
    head: Header<NNNode>;
    tail: Tailer<NNNode>;
    
    editorPointer: Pointer<NNNode>

    effectiveBeats: number;
    timesWithNotes: number;
    constructor(effectiveBeats: number) {
        this.effectiveBeats = effectiveBeats;
        this.head = {
            "heading": true,
            "next": null,
            "parentSeq": this
        }
        this.tail = {
            "tailing": true,
            "previous": null,
            "parentSeq": this
        }
        this.editorPointer = new Pointer()
        this.editorPointer.pointTo(this.tail, 0)
        NoteNode.connect(this.head, this.tail)
        this.initJump()
    }
    initJump() {
        const originalListLength = this.timesWithNotes || 512;
        /*
        if (!this.effectiveBeats) {
            this.effectiveBeats = TimeCalculator.toBeats(this.tail.previous.endTime)
        }
        */
        const effectiveBeats: number = this.effectiveBeats;
        this.jump = new JumpArray<NNNode>(
            this.head,
            this.tail,
            originalListLength,
            effectiveBeats,
            (node: TypeOrHeader<NNNode> | Tailer<NNNode>) => {
                if ("tailing" in node) {
                    return [null, null]
                }
                const nextNode = node.next;
                const startTime = "heading" in node ? 0 : TimeCalculator.toBeats(node.startTime)
                return [startTime, nextNode]
            },
            (note: NNNode, beats: number) => {
                return TimeCalculator.toBeats(note.startTime) >= beats ? false : <NNNode>note.next; // getNodeAt有guard
            }
            /*,
            (note: Note) => {
                const prev = note.previous;
                return "heading" in prev ? note : prev
            })*/)
    }
    movePointerBeforeStart(pointer: Pointer<NNNode>, beats: number): [TypeOrTailer<NNNode>, TypeOrTailer<NNNode>, number] {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.jump)
    }
    movePointerBeforeEnd(pointer: Pointer<NNNode>, beats: number): [TypeOrTailer<NNNode>, TypeOrTailer<NNNode>, number] {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.jump, true)
    }
    movePointerWithGivenJumpArray(pointer: Pointer<NNNode>, beats: number, jump: JumpArray<NNNode>, useEnd: boolean=false): [TypeOrTailer<NNNode>, TypeOrTailer<NNNode>, number] {
        const distance = NNList.distanceFromPointer(beats, pointer, useEnd);
        const original = pointer.node;
        if (distance === 0) {
            pointer.beats = beats;
            return [original, original, 0]
        }
        const delta = beats - pointer.beats;
        if (Math.abs(delta) > jump.averageBeats / MINOR_PARTS) {
            const end = jump.getNodeAt(beats);
            if (!end) {
                debugger;
            }
            pointer.pointTo(end, beats)
            return [original, end, distance]
        }
        let end: TypeOrTailer<NNNode>;
        if (distance === 1) {
            end = (<NNNode>original).next // 多谢了个let，特此留念
        } else if (distance === -1) {
            end = "heading" in original.previous ? original : original.previous;
        }
        if (!end) {
            debugger;
        }
        pointer.pointTo(end, beats)
        return [original, end, distance]
    }
    getNodeAt(beats: number, beforeEnd=false, pointer?: Pointer<NNNode>, ): NNNode | Tailer<NNNode> {
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
        return this.jump.getNodeAt(beats);
    }
    getNode(time: TimeT) {
        const node = this.getNodeAt(TimeCalculator.toBeats(time), false).previous;
        if ("heading" in node || TimeCalculator.ne(node.startTime, time)) {
            const newNode = new NNNode(time);
            const next = node.next
            NoteNode.insert(node, newNode, next);
            this.jump.updateRange(node, next)
            return newNode
        } else {
            return node;
        }
    }
    addNoteNode(noteNode: NoteNode) {
        this.getNode(noteNode.startTime).add(noteNode);
    }
}
