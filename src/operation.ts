
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
        if (this.operations.length !== 0) {
                
            const lastOp = this.operations[this.operations.length - 1]
            if (operation.constructor === lastOp.constructor) {
                if (lastOp.rewrite(operation)) {
                    return;
                }
            }
        }
        operation.do()
        if (operation.updatesEditor) {
            editor.update()
        }
        this.operations.push(operation);
    }
}



abstract class Operation {
    ineffective: boolean
    updatesEditor: boolean
    constructor() {

    }
    abstract do(): void
    abstract undo(): void
    rewrite(op: typeof this): boolean {return false;}
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
    value: Note[T];
    updatesEditor = true;
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
    rewrite(operation: NoteValueChangeOperation<T>): boolean {
        if (operation.note === this.note && this.field === operation.field) {
            this.value = operation.value;
            this.note[this.field] = operation.value
            return true;
        }
        return false;
    }
}

class NoteRemoveOperation extends Operation {
    noteNode: NoteNode;
    note: Note;
    constructor(note: Note) {
        super()
        this.note = note // In memory of forgettting to add this(
        if (!note.parent) {
            this.ineffective = true
        } else {
            this.noteNode = note.parent
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
    updatesEditor = true
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

class NoteTimeChangeOperation extends ComplexOperation<[NoteValueChangeOperation<"startTime">, NoteRemoveOperation, NoteAddOperation]> {
    
    updatesEditor = true
    constructor(note: Note, noteNode: NoteNode) {
        super(
            new NoteValueChangeOperation(note, "startTime", noteNode.startTime),
            new NoteRemoveOperation(note),
            new NoteAddOperation(note, noteNode)
        )
    }
    rewrite(operation: NoteTimeChangeOperation): boolean {
        if (operation.subOperations[0].note === this.subOperations[0].note) {
            this.subOperations[0].value = operation.subOperations[0].value
            this.subOperations[0].do()
            this.subOperations[1].do()
            this.subOperations[2].noteNode = operation.subOperations[2].noteNode
            this.subOperations[2].do()
            return true;
        }
        return false
    }
}

class NoteSpeedChangeOperation
extends ComplexOperation<[NoteValueChangeOperation<"speed">, NoteRemoveOperation, NoteAddOperation]> {
    updatesEditor = true
    originalTree: NoteTree;
    judgeLine: JudgeLine;
    targetTree: NoteTree
    constructor(note: Note, value: number, line: JudgeLine) {
        const valueChange = new NoteValueChangeOperation(note, "speed", value);
        const tree = line.getNoteTree(value, note.type === NoteType.hold, true)
        const node = tree.getNode(note.startTime);
        const removal = new NoteRemoveOperation(note);
        const insert = new NoteAddOperation(note, node)
        super(valueChange, removal, insert);
    }
}

class NoteTypeChangeOperation 
extends ComplexOperation</*[NoteValueChangeOperation<"type">, NoteInsertOperation]*/ any> {
    
    updatesEditor = true
    constructor(note: Note, value: number) {
        const isHold = note.type === NoteType.hold
        const valueChange = new NoteValueChangeOperation(note, "type", value);
        if (isHold !== (value === NoteType.hold)) {
            const tree = note.parent.parent.parent.getNoteTree(note.speed, !isHold, true)
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

class EventNodePairRemoveOperation extends Operation {
    updatesEditor = true
    node: EventStartNode;
    originalPrev: EventStartNode
    constructor(node: EventStartNode) {
        super()
        this.node = node;
        this.originalPrev = node.previous.previous
    }
    do() {
        EventNode.disconnect(this.node)
    }
    undo() {
        EventNode.insert(this.node, this.originalPrev)
    }
}

class EventNodePairInsertOperation extends Operation {
    updatesEditor = true
    node: EventStartNode;
    tarPrev: EventStartNode;
    originalTarPrev: EventStartNode
    constructor(node: EventStartNode, targetPrevious: EventStartNode) {
        super()
        this.node = node;
        this.tarPrev = targetPrevious
    }
    do() {
        EventNode.insert(this.node, this.tarPrev)
    }
    undo() {
        EventNode.disconnect(this.node)
    }
}

class EventNodeValueChangeOperation extends Operation {
    updatesEditor = true
    node: EventNode
    value: number;
    originalValue: number
    constructor(node: EventNode, val: number) {
        super()
        this.node = node
        this.value = val;
        this.originalValue = node.value
    }
    do() {
        this.node.value = this.value
    }
    undo() {
        this.node.value = this.originalValue
    }
    rewrite(operation: EventNodeValueChangeOperation): boolean {
        if (operation.node === this.node) {
            this.value = operation.value;
            this.node.value = operation.value
            return true;
        }
        return false;
    }
}
