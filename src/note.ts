

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
    /**
     * 和打击位置的距离，与yOffset和上下无关，为负不可见
    positionY: number;
    endPositionY?: number;
     */
    previous: TypeOrHeader<Note>;
    next: TypeOrTailer<Note>;
    previousSibling?: Note;
    nextSibling: Note;
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
        this.previous = null;
        this.next = null;
        this.previousSibling = null;
        this.nextSibling = null;
    }
    static connectSibling(note1: Note, note2: Note) {
        if (note1) {
            note1.nextSibling = note2;
            
        }
        if (note2) {
            note2.previousSibling = note1;
        }
    }
    static connect(note1: Note | Header<Note>, note2: Note | Tailer<Note>) {
        if (note1) {
            note1.next = note2;
        }
        if (note2) {
            note2.previous = note1;
        }
        
    }
    static insertSibling(note1: Note, inserted: Note, note2: Note) {
        this.connectSibling(note1, inserted);
        this.connectSibling(inserted, note2);
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
}


class NoteTree {
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
    constructor() {
        this.head = {
            heading: true,
            next: null
        };
        this.currentPoint = this.head;
        this.currentBranchPoint = <Note>{startTime: [-1, 0, 1]}
        this.tail = {
            tailing: true,
            previous: null
        };
        this.timesWithNotes = 0;
        this.renderPointer = new Pointer();
        this.hitPointer = new Pointer();
        this.editorPointer = new Pointer()
    }
    get effectiveBeats() {
        return TimeCalculator.toBeats(this.tail.previous.endTime)
    }
    initJump() {
        const originalListLength = this.timesWithNotes;
        const effectiveBeats: number = this.effectiveBeats;
        this.jump = new JumpArray<Note>(
            this.head,
            this.tail,
            originalListLength,
            TimeCalculator.toBeats(this.tail.previous.startTime),
            (note: Note) => {
                const nextNote = note.next;
                const startTime = TimeCalculator.toBeats(note.startTime)
                if ("tailing" in nextNote) {
                    return [startTime, null]
                }
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
}

class HoldTree extends NoteTree {
    holdTailJump: JumpArray<Note>;
    constructor() {
        super()
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
            (note: Note) => {
                const nextNote = note.next;
                const endTime = TimeCalculator.toBeats(note.endTime)
                if ("tailing" in nextNote) {
                    return [endTime, null]
                }
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
            next: null
        };
        this.tail = {
            tailing: true,
            previous: null
        }
    }
}
