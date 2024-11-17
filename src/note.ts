

class Note {
    above: boolean;
    alpha: number;
    endTime: [number, number, number]
    isFake: boolean;
    positionX: number;
    size: number;
    speed: number;
    startTime: [number, number, number];
    type: NoteType;
    visibleTime: number;
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

    parent: NoteNode;

    // readonly chart: Chart;
    // readonly judgeLine: JudgeLine
    // posPrevious?: Note;
    // posNext?: Note;
    // posPreviousSibling?: Note;
    // posNextSibling: Note;
    constructor(data: NoteDataRPE) {
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
    dumpRPE(): NoteDataRPE {
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
        }
    }
    dumpKPA() {
        
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
    parent: NoteTree
    constructor(time: TimeT) {
        this.startTime = [...time];
        this.notes = [];
    }
    get isHold() {
        return this.parent instanceof HoldTree
    }
    get endTime() {
        return (this.notes.length === 0 || this.notes[0].type !== NoteType.hold) ? this.startTime : this.notes[0].endTime
    }
    add(note: Note) {
        if (!TimeCalculator.eq(note.startTime, this.startTime)) {
            console.warn("Wrong addition!")
        }
        this.notes.push(note)
        note.parent = this
    }
    remove(note: Note) {
        this.notes.splice(this.notes.indexOf(note))
        note.parent = null
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
            note1.next = note2;
        }
        if (note2) {
            note2.previous = note1;
        }
        if (note1 && note2) {
            note2.parent = note1.parent
        }
    }
    static insert<T extends Connectee>(note1: TypeOrHeader<T>, inserted: T, note2: TypeOrTailer<T>) {
        this.connect(note1, inserted);
        this.connect(inserted, note2);
    }
}


class NoteTree {
    speed: number;
    head: Header<NoteNode>;
    tail: Tailer<NoteNode>;
    currentPoint: NoteNode | Header<NoteNode>;
    // currentBranchPoint: NoteNode;
    renderPointer: Pointer<NoteNode>;
    hitPointer: Pointer<NoteNode>;
    editorPointer: Pointer<NoteNode>;
    /** 定位上个Note头已过，本身未到的Note */
    jump: JumpArray<NoteNode>;
    timesWithNotes: number;
    // timesWithHolds: number;
    timeRanges: [number, number][];
    effectiveBeats: number;

    parent: JudgeLine;
    constructor(speed: number, effectiveBeats?: number) {
        this.speed = speed
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
        this.renderPointer = new Pointer();
        this.hitPointer = new Pointer();
        this.editorPointer = new Pointer()
        this.effectiveBeats = effectiveBeats
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
    initPointers() {
        this.initPointer(this.hitPointer);
        this.initPointer(this.renderPointer)
        this.initPointer(this.editorPointer);
    }
    /**
     * 
     * @param beats 目标位置
     * @param beforeEnd 指定选取该时刻之前还是之后第一个Node，对于非Hold无影响
     * @param pointer 指针，实现查询位置缓存
     * @returns 
     */
    getNodeAt(beats: number, beforeEnd=false, pointer?: Pointer<NoteNode>, ): NoteNode | Tailer<NoteNode> {
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
        const node = this.getNodeAt(TimeCalculator.toBeats(time), false, this.editorPointer);
        if ("tailing" in node || TimeCalculator.ne(node.startTime, time)) {
            const newNode = new NoteNode(time);
            NoteNode.insert(node.previous, newNode, node);
            return newNode
        } else {
            return node;
        }
    }
    movePointerWithGivenJumpArray(pointer: Pointer<NoteNode>, beats: number, jump: JumpArray<NoteNode>, useEnd: boolean=false): [TypeOrTailer<NoteNode>, TypeOrTailer<NoteNode>, number] {
        const distance = NoteTree.distanceFromPointer(beats, pointer, useEnd);
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
    movePointerBeforeStart(pointer: Pointer<NoteNode>, beats: number): [TypeOrTailer<NoteNode>, TypeOrTailer<NoteNode>, number] {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.jump)
    }
    movePointerBeforeEnd(pointer: Pointer<NoteNode>, beats: number): [TypeOrTailer<NoteNode>, TypeOrTailer<NoteNode>, number] {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.jump, true)
    }
    static distanceFromPointer(beats: number, pointer: Pointer<NoteNode>, useEnd: boolean=false): 1 | 0 | -1 {
        const note = pointer.node;
        if (!note) {
            debugger;
        }
        if ("tailing" in note) {
            return TimeCalculator.toBeats(useEnd ? note.previous.endTime : note.previous.startTime) < beats ? 0 : -1;
        }
        const previous = note.previous;
        if (!previous) debugger
        const previousBeats = "heading" in previous ? -Infinity : TimeCalculator.toBeats(useEnd ? previous.endTime: previous.startTime);
        const thisBeats = TimeCalculator.toBeats(useEnd ? note.endTime : note.startTime);
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
}

class HoldTree extends NoteTree {
    /**
     * 最早的还未结束Hold
     */
    holdTailJump: JumpArray<NoteNode>;
    constructor(speed: number, effectiveBeats?: number) {
        super(speed, effectiveBeats)
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
    movePointerBeforeEnd(pointer: Pointer<NoteNode>, beats: number): [TypeOrTailer<NoteNode>, TypeOrTailer<NoteNode>, number] {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.holdTailJump, true);
    }
    
    getNodeAt(beats: number, beforeEnd=false, pointer?: Pointer<NoteNode>): TypeOrTailer<NoteNode> {
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
        return beforeEnd ? this.holdTailJump.getNodeAt(beats) : this.jump.getNodeAt(beats);
    }
    insertNoteJumpUpdater(note: NoteNode): () => void {
        const {previous, next} = note
        return () => {
            this.jump.updateRange(previous, next)
            this.holdTailJump.updateRange(previous,next)
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
        this.startTime = time
    }
    get endTime() {
        let latest: TimeT = [0, 0, 1];
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

class NoteNodeTree {
    jump: JumpArray<NNNode>
    parent: Chart;
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
            "parent": this
        }
        this.tail = {
            "tailing": true,
            "previous": null,
            "parent": this
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
    static distanceFromPointer(beats: number, pointer: Pointer<NNNode>, useEnd: boolean=false): 1 | 0 | -1 {
        const note = pointer.node;
        if (!note) {
            debugger;
        }
        if ("tailing" in note) {
            return TimeCalculator.toBeats(useEnd ? note.previous.endTime : note.previous.startTime) < beats ? 0 : -1;
        }
        const previous = note.previous;
        if (!previous) debugger
        const previousBeats = "heading" in previous ? -Infinity : TimeCalculator.toBeats(useEnd ? previous.endTime: previous.startTime);
        const thisBeats = TimeCalculator.toBeats(useEnd ? note.endTime : note.startTime);
        if (beats < previousBeats) {
            return -1;
        } else if (beats > thisBeats) {
            return 1;
        }
        return 0;
    }
    movePointerWithGivenJumpArray(pointer: Pointer<NNNode>, beats: number, jump: JumpArray<NNNode>, useEnd: boolean=false): [TypeOrTailer<NNNode>, TypeOrTailer<NNNode>, number] {
        const distance = NoteNodeTree.distanceFromPointer(beats, pointer, useEnd);
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
        const node = this.getNodeAt(TimeCalculator.toBeats(time), false, this.editorPointer);
        if ("tailing" in node || TimeCalculator.ne(node.startTime, time)) {
            const newNode = new NNNode(time);
            NoteNode.insert(node.previous, newNode, node);
            return newNode
        } else {
            return node;
        }
    }
    addNoteNode(noteNode: NoteNode) {
        this.getNode(noteNode.startTime).add(noteNode);
    }
}
