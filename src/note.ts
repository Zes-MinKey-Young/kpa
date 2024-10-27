

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
    _previous: WeakRef<TypeOrHeader<Note>> | null;
    get previous(): TypeOrHeader<Note> {
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
    next: TypeOrTailer<Note>;
    previousSibling?: Note;
    nextSibling: Note;

    list: NoteTree;

    readonly chart: Chart;
    readonly judgeLine: JudgeLine
    // posPrevious?: Note;
    // posNext?: Note;
    // posPreviousSibling?: Note;
    // posNextSibling: Note;
    constructor(judgeLine: JudgeLine, data: NoteDataRPE) {
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
        this.previous = null;
        this.next = null;
        this.previousSibling = null;
        this.nextSibling = null;

        this.chart = judgeLine.chart
        this.judgeLine = judgeLine
    }
    static connectSibling(note1: Note, note2: Note) {
        if (note1) {
            note1.nextSibling = note2;
            
        }
        if (note2) {
            note2.previousSibling = note1;
        }
        if (note1 && note2) {
            note2.list = note2.list;
        }
    }
    
    static disconnectSibling(note1: Note, note2: Note) {
        if (note1) {
            note1.nextSibling = null;
            
        }
        if (note2) {
            note2.previousSibling = null;
        }
    }
    static disconnect(note1: Note | Header<Note>, note2: Note | Tailer<Note>) {
        if (note1) {
            note1.next = null;
        }
        if (note2) {
            note2.previous = null;
        }

    }
    static connect(note1: Note | Header<Note>, note2: Note | Tailer<Note>) {
        if (note1) {
            note1.next = note2;
        }
        if (note2) {
            note2.previous = note1;
        }
        if (note1 && note2) {
            note2.list = note1.list
        }
    }
    static insertSibling(note1: Note, inserted: Note, note2: Note) {
        this.connectSibling(note1, inserted);
        this.connectSibling(inserted, note2);
    }
    static insert(note1: TypeOrHeader<Note>, inserted: Note, note2: TypeOrTailer<Note>) {
        this.connect(note1, inserted);
        this.connect(inserted, note2);
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


class NoteTree {
    speed: number;
    head: Header<Note>;
    tail: Tailer<Note>;
    currentPoint: Note | Header<Note>;
    currentBranchPoint: Note;
    renderPointer: Pointer<Note>;
    hitPointer: Pointer<Note>;
    editorPointer: Pointer<Note>;
    /** 定位上个Note头已过，本身未到的Note */
    jump: JumpArray<Note>;
    timesWithNotes: number;
    // timesWithHolds: number;
    timeRanges: [number, number][];
    effectiveBeats: number;
    constructor(speed: number, effectiveBeats?: number) {
        this.speed = speed
        this.head = {
            heading: true,
            next: null,
            list: this
        };
        this.currentPoint = this.head;
        this.currentBranchPoint = <Note>{startTime: [-1, 0, 1]}
        this.tail = {
            tailing: true,
            previous: null,
            list: this
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
        this.jump = new JumpArray<Note>(
            this.head,
            this.tail,
            originalListLength,
            effectiveBeats,
            (note: TypeOrHeader<Note> | Tailer<Note>) => {
                if ("tailing" in note) {
                    return [null, null]
                }
                const nextNote = note.next;
                const startTime = "heading" in note ? 0 : TimeCalculator.toBeats(note.startTime)
                return [startTime, nextNote]
            },
            (note: Note, beats: number) => {
                return TimeCalculator.toBeats(note.startTime) >= beats ? false : <Note>note.next; // getNodeAt有guard
            }
            /*,
            (note: Note) => {
                const prev = note.previous;
                return "heading" in prev ? note : prev
            })*/)
    }
    initPointer(pointer: Pointer<Note>) {
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
     * @param beforeEnd 指定选取该时刻之前还是之后第一个Note，对于非Hold无影响
     * @param pointer 指针，实现查询位置缓存
     * @returns 
     */
    getNoteAt(beats: number, beforeEnd=false, pointer?: Pointer<Note>, ): Note | Tailer<Note> {
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
    movePointerWithGivenJumpArray(pointer: Pointer<Note>, beats: number, jump: JumpArray<Note>, useEnd: boolean=false): [TypeOrTailer<Note>, TypeOrTailer<Note>, number] {
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
        let end: TypeOrTailer<Note>;
        if (distance === 1) {
            end = (<Note>original).next // 多谢了个let，特此留念
        } else if (distance === -1) {
            end = "heading" in original.previous ? original : original.previous;
        }
        if (!end) {
            debugger;
        }
        pointer.pointTo(end, beats)
        return [original, end, distance]
    }
    movePointerBeforeStart(pointer: Pointer<Note>, beats: number): [TypeOrTailer<Note>, TypeOrTailer<Note>, number] {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.jump)
    }
    movePointerBeforeEnd(pointer: Pointer<Note>, beats: number): [TypeOrTailer<Note>, TypeOrTailer<Note>, number] {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.jump, true)
    }
    static distanceFromPointer(beats: number, pointer: Pointer<Note>, useEnd: boolean=false): 1 | 0 | -1 {
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
    insertNoteJumpUpdater(note: Note) {
        const {previous, next} = note
        return () => {
            this.jump.updateRange(previous, next)
        }
    }
    /**
     * To find the note's previous(Sibling) if it is to be inserted into the tree
     * @param note 
     */
    findPrev(note: Note): TypeOrHeader<Note> {
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
}

class HoldTree extends NoteTree {
    /**
     * 最早的还未结束Hold
     */
    holdTailJump: JumpArray<Note>;
    constructor(speed: number, effectiveBeats?: number) {
        super(speed, effectiveBeats)
    }
    initJump(): void {
        super.initJump()
        const originalListLength = this.timesWithNotes;
        const effectiveBeats: number = this.effectiveBeats;
        
        this.holdTailJump = new JumpArray<Note>(
            this.head,
            this.tail,
            originalListLength,
            effectiveBeats,
            (note) => {
                if ("tailing" in note) {
                    return [null, null]
                }
                if (!note) debugger
                const nextNote = (<TypeOrHeader<Note>>note).next;
                const endTime = "heading" in note ? 0 : TimeCalculator.toBeats((<Note>note).endTime)
                return [endTime, nextNote]
            },
            (note: Note, beats: number) => {
                return TimeCalculator.toBeats(note.endTime) >= beats ? false : <Note>note.next; // getNodeAt有guard
            }
        )
    }
    movePointerBeforeEnd(pointer: Pointer<Note>, beats: number): [TypeOrTailer<Note>, TypeOrTailer<Note>, number] {
        return this.movePointerWithGivenJumpArray(pointer, beats, this.holdTailJump, true);
    }
    
    getNoteAt(beats: number, beforeEnd=false, pointer?: Pointer<Note>): TypeOrTailer<Note> {
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
    insertNoteJumpUpdater(note: Note): () => void {
        const {previous, next} = note
        return () => {
            this.jump.updateRange(previous, next)
            this.holdTailJump.updateRange(previous,next)
        }
    }
}

class ComboInfoList {
    comboMapping: {
        [beat: /*`${number}:${number}/${number}`*/ string]: ComboInfoEntity
    };
    head: Header<ComboInfoEntity>;
    tail: Tailer<ComboInfoEntity>;
    // jump: JumpArray<ComboInfoEntity>;
    constructor() {
        this.head = {
            heading: true,
            next: null,
            list: this
        };
        this.tail = {
            tailing: true,
            previous: null,
            list: this
        }
    }
}
