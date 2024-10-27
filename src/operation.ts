
class OperationList {
    operations: Operation[];
    undoneOperations: Operation[];
    constructor() {
        this.operations = [];
        this.undoneOperations = [];
    }
    undo() {
        const op = this.operations.pop()
        if (op) {
            this.undoneOperations.push(op)
            op.undo()
        }
    }
    redo() {
        const op = this.undoneOperations.pop()
        if (op) {
            this.operations.push(op)
            op.do()
        }
    }
    do(operation: Operation) {
        if (operation.ineffective) {
            return
        }
        operation.do()
        this.operations.push(operation);
    }
}

abstract class Operation {
    ineffective: boolean
    constructor() {

    }
    abstract do(): void
    abstract undo(): void
}

class ComplexOperation<T extends Operation[]> extends Operation {
    subOperations: T;
    length: number;
    constructor(...sub: T) {
        super()
        this.subOperations = sub
        this.length = sub.length
    }
    do() {
        const length = this.length
        for (let i = 0; i < length; i++) {
            this.subOperations[i].do()
        }
    }
    undo() {
        const length = this.length
        for (let i = length - 1; i >= 0; i--) {
            this.subOperations[i].undo()
        }
    }
}

type NoteValueField = "speed" | "type" | "positionX" | "startTime" | "endTime"

class NoteValueChangeOperation<T extends NoteValueField> extends Operation {
    field: T;
    note: Note;
    previousValue: Note[T]
    value: Note[T]
    constructor(note: Note, field: T, value: Note[T]) {
        super()
        this.field = field
        this.note = note;
        this.value = value;
        if (value === note[field]) {
            this.ineffective = true
        }
    }
    do() {
        this.note[this.field] = this.value
    }
    undo() {
        this.note[this.field] = this.previousValue
    }
}

class NoteInsertOperation extends Operation {
    originalPrevious: TypeOrHeader<Note>;
    originalPreviousSibling: Note;
    previous: Note;
    previousSibling: Note;
    note: Note;
    constructor(note: Note, previous: TypeOrHeader<Note>) {
        super()
        this.note = note;
        this.originalPrevious = note.previous
        this.originalPreviousSibling = note.previousSibling
        let previousSibling: Note;
        if (!("heading" in previous) && TimeCalculator.eq(previous.startTime, note.startTime)) {
            previousSibling = previous
            while (previousSibling.nextSibling && TimeCalculator.gt(previousSibling.nextSibling.endTime, note.endTime)) {
                previousSibling = previousSibling.nextSibling
            }
        }
        this.previousSibling = previousSibling
    }
    do() {
        const note = this.note
        const previous = note.previous
        const update = note.list.insertNoteJumpUpdater(note)
        if (this.previousSibling) {
            if (note.previousSibling) {
                Note.connectSibling(note.previousSibling, note.nextSibling)
            } else if (note.nextSibling) {
                const next = note.nextSibling
                Note.disconnect(note, next)
                Note.connect(note.previous, next)
                Note.connect(next, note.next)
            } else {
                Note.connect(note.previous, note.next)
            }
            Note.insertSibling(this.previousSibling, note, this.previousSibling.nextSibling)
        } else {
            Note.insert(this.previous, note, this.previous.next)
        }
        if (previous) {
            update()
        }
        if (note.previous) {
            note.list.insertNoteJumpUpdater(note)()
        }
    }
    undo() {
        const note = this.note;
        const update = note.list.insertNoteJumpUpdater(note)
        if (this.originalPreviousSibling) {
            if (note.previousSibling) {
                Note.connectSibling(note.previousSibling, note.nextSibling)
            } else if (note.nextSibling) {
                const next = note.nextSibling
                Note.disconnect(note, next)
                Note.connect(note.previous, next)
                Note.connect(next, note.next)
            } else {
                Note.connect(note.previous, note.next)
            }
            Note.insertSibling(this.originalPreviousSibling, note, this.originalPreviousSibling.nextSibling)
        } else {
            Note.insert(this.previous, note, this.previous.next)
        }
        if (!this.previousSibling) {
            update()
        }
        if (note.previous) {
            note.list.insertNoteJumpUpdater(note)
        }
    }
}

class NoteSpeedChangeOperation
extends ComplexOperation<[NoteValueChangeOperation<"speed">, NoteInsertOperation]> {
    originalTree: NoteTree;
    judgeLine: JudgeLine;
    targetTree: NoteTree
    constructor(note: Note, value: number, line: JudgeLine) {
        const valueChange = new NoteValueChangeOperation(note, "speed", value);
        const tree = line.getNoteTree(value, note.type === NoteType.hold)
        const previous = tree.getNoteAt(TimeCalculator.toBeats(note.startTime), false).previous
        const insert = new NoteInsertOperation(note, previous)
        super(valueChange, insert);
    }
}

class NoteTypeChangeOperation 
extends ComplexOperation</*[NoteValueChangeOperation<"type">, NoteInsertOperation]*/ any> {

    constructor(note: Note, value: number) {
        const isHold = note.type === NoteType.hold
        const valueChange = new NoteValueChangeOperation(note, "type", value);
        if (isHold != (value === NoteType.hold)) {
            const tree = note.judgeLine.getNoteTree(note.speed, !isHold)
            const previous = tree.getNoteAt(TimeCalculator.toBeats(note.startTime), false).previous
            const insert = new NoteInsertOperation(note, previous)
            super(valueChange, insert);
        } else {
            super(valueChange);
        }
    }
}

class NoteTreeChangeOperation extends NoteInsertOperation {

}

