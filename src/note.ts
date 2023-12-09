

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
    double: boolean;
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
        if (note1 && note2) {
            note1.double = true;
            note2.double = true;
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
    // holdHead: Note;
    // holdTail: Note;
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
                const previous = note.previous;
                const previousTime = "heading" in previous ? 0 : TimeCalculator.toBeats(previous.endTime);
                return previousTime <= beats ? false : <Note>note.next; // getNodeAt有guard
            })
    }
    
    getNoteAt(beats: number): Note {
        return this.jump.getNodeAt(beats);
    }
    
}

