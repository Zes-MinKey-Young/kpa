
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
            const op = this.subOperations[i]
            if (op.ineffective) { break; }
            op.do()
        }
    }
    undo() {
        const length = this.length
        for (let i = length - 1; i >= 0; i--) {
            const op = this.subOperations[i]
            if (op.ineffective) { break; }
            op.undo()
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
        this.previousValue = note[field]
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

class NoteRemoveOperation extends Operation {
    noteNode: NoteNode;
    note: Note;
    constructor(note: Note) {
        super()
        if (!note.parent) {
            this.ineffective = true
        } else {
            note.parent
        }
    }
    do() {
        this.noteNode.remove(this.note)
    }
    undo() {
        this.noteNode.add(this.note)
    }
}

class NoteAddOperation extends Operation {
    noteNode: NoteNode
    note: Note;
    constructor(note: Note, node: NoteNode) {
        super()
        this.note = note;
        this.noteNode = node
    }
    do() {
        this.noteNode.add(this.note)
    }
    undo() {
        this.noteNode.remove(this.note)
    }
}

class NoteSpeedChangeOperation
extends ComplexOperation<[NoteValueChangeOperation<"speed">, NoteRemoveOperation, NoteAddOperation]> {
    originalTree: NoteTree;
    judgeLine: JudgeLine;
    targetTree: NoteTree
    constructor(note: Note, value: number, line: JudgeLine) {
        const valueChange = new NoteValueChangeOperation(note, "speed", value);
        const tree = line.getNoteTree(value, note.type === NoteType.hold)
        const node = tree.getNode(note.startTime);
        const removal = new NoteRemoveOperation(note);
        const insert = new NoteAddOperation(note, node)
        super(valueChange, removal, insert);
    }
}

class NoteTypeChangeOperation 
extends ComplexOperation</*[NoteValueChangeOperation<"type">, NoteInsertOperation]*/ any> {

    constructor(note: Note, value: number) {
        const isHold = note.type === NoteType.hold
        const valueChange = new NoteValueChangeOperation(note, "type", value);
        if (isHold !== (value === NoteType.hold)) {
            const tree = note.parent.parent.parent.getNoteTree(note.speed, !isHold)
            const node = tree.getNode(note.startTime);
            const removal = new NoteRemoveOperation(note);
            const insert = new NoteAddOperation(note, node);
            super(valueChange, removal, insert);
        } else {
            super(valueChange);
        }
    }
}

class NoteTreeChangeOperation extends NoteAddOperation {

}

