
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
                    if (operation.updatesEditor) {
                        editor.update()
                    }
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

type NoteValueField = "speed" | "type" | "positionX" | "startTime" | "endTime" | "alpha" | "size"

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

/**
 * 删除一个note
 * 从语义上删除Note要用这个操作
 * 结果上，这个会更新编辑器
 */
class NoteDeleteOperation extends NoteRemoveOperation {
    updatesEditor = true
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
    note: Note
    updatesEditor = true
    constructor(note: Note, noteNode: NoteNode) {
        super(
            new NoteValueChangeOperation(note, "startTime", noteNode.startTime),
            new NoteRemoveOperation(note),
            new NoteAddOperation(note, noteNode)
        )
        this.note = note
        if (note.parent === noteNode) {
            this.ineffective = true
        }
    }
    rewrite(operation: NoteTimeChangeOperation): boolean {
        if (operation.note === this.note) {
            this.subOperations[0].value = operation.subOperations[0].value
            this.subOperations[0].do()
            this.subOperations[1] = new NoteRemoveOperation(this.note)
            if (!this.subOperations[1].ineffective) {
                this.subOperations[1].do()
            }
            this.subOperations[2].noteNode = operation.subOperations[2].noteNode
            this.subOperations[2].do()
            return true;
        }
        return false
    }
}

class HoldEndTimeChangeOperation extends NoteValueChangeOperation<"endTime"> {
    constructor(note: Note, value: TimeT) {
        super(note, "endTime", value)
        if (TimeCalculator.lt(value, note.startTime)) {
            this.ineffective = true
        }
    }
    do() {
        super.do()
        const node = this.note.parent;
        (node.parent as HNList).holdTailJump.updateRange(node.previous, node.next)
    }
    undo() {
        super.undo()
        const node = this.note.parent;
        (node.parent as HNList).holdTailJump.updateRange(node.previous, node.next)
    }
}


class NoteSpeedChangeOperation
extends ComplexOperation<[NoteValueChangeOperation<"speed">, NoteRemoveOperation, NoteAddOperation]> {
    updatesEditor = true
    originalTree: NNList;
    judgeLine: JudgeLine;
    targetTree: NNList
    constructor(note: Note, value: number, line: JudgeLine) {
        const valueChange = new NoteValueChangeOperation(note, "speed", value);
        const tree = line.getNNList(value, note.type === NoteType.hold, true)
        const node = tree.getNodeOf(note.startTime);
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
            const tree = note.parent.parent.parent.getNNList(note.speed, !isHold, true)
            const node = tree.getNodeOf(note.startTime);
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
    updatesEditor = true;
    endNode: EventEndNode;
    startNode: EventStartNode;
    sequence: EventNodeSequence;
    originalPrev: EventStartNode
    constructor(node: EventStartNode) {
        super();
        if (node.isFirstStart()) {
            this.ineffective = true;
            return;
        }
        [this.endNode, this.startNode] = EventNode.getEndStart(node)
        this.sequence = this.startNode.parent
        this.originalPrev = (<EventEndNode>node.previous).previous
    }
    do() {
        this.sequence.jump.updateRange(...EventNode.removeNodePair(this.endNode, this.startNode))
    }
    undo() {
        this.sequence.jump.updateRange(...EventNode.insert(this.startNode, this.originalPrev))
    }
}

class EventNodePairInsertOperation extends Operation {
    updatesEditor = true
    node: EventStartNode;
    tarPrev: EventStartNode;
    constructor(node: EventStartNode, targetPrevious: EventStartNode) {
        super()
        this.node = node;
        this.tarPrev = targetPrevious
    }
    do() {
        this.node.parent.jump.updateRange(...EventNode.insert(this.node, this.tarPrev))
    }
    undo() {
        this.node.parent.jump.updateRange(...EventNode.removeNodePair(...EventNode.getEndStart(this.node)))
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

class EventNodeTimeChangeOperation extends Operation {
    updatesEditor = true
    sequence: EventNodeSequence;
    /**
     * 这里两个node不是面对面，而是背靠背
     * i. e. EndNode -> StartNode
     */
    startNode: EventStartNode;
    endNode: EventEndNode;
    value: TimeT;
    originalValue: TimeT;
    originalPrevious: EventStartNode;
    newPrevious: EventStartNode;
    constructor(node: EventStartNode | EventEndNode, val: TimeT) {
        super()
        if ("heading" in node.previous) {
            this.ineffective = true;
            return;
        }
        if (!TimeCalculator.gt(val, [0, 0, 1])) {
            this.ineffective = true;
            return;
        }
        [this.endNode, this.startNode] = EventNode.getEndStart(node)
        const seq = this.sequence = node.parent
        const mayBeThere = seq.getNodeAt(TimeCalculator.toBeats(val))
        if (mayBeThere && TC.eq(mayBeThere.time, val)) { // 不是arrayEq，这里踩坑
            this.ineffective = true;
            return;
        }
        this.originalPrevious = this.endNode.previous;
        this.newPrevious = mayBeThere === this.startNode ? (<EventEndNode>this.startNode.previous).previous : mayBeThere
        this.value = val;
        this.originalValue = node.time
        console.log("操作：", this)
    }
    do() { // 这里其实还要设计重新选址的问题
        this.startNode.time = this.endNode.time = this.value;
        if (this.newPrevious !== this.originalPrevious) {
            this.sequence.jump.updateRange(...EventNode.removeNodePair(this.endNode, this.startNode))
            EventNode.insert(this.startNode, this.newPrevious)
        }
        this.sequence.jump.updateRange(this.endNode.previous, EventNode.nextStartOfStart(this.startNode))
    }
    undo() {
        this.endNode.time = this.startNode.time = this.originalValue;
        if (this.newPrevious !== this.originalPrevious) {
            this.sequence.jump.updateRange(...EventNode.removeNodePair(this.endNode, this.startNode))
            EventNode.insert(this.startNode, this.originalPrevious)
        }
        this.sequence.jump.updateRange(this.endNode.previous, EventNode.nextStartOfStart(this.startNode))
    }

}

class EventNodeInnerEasingChangeOperation extends Operation {
    updatesEditor = true
    startNode: EventStartNode;
    value: Easing;
    originalValue: Easing
    constructor(node: EventStartNode | EventEndNode, val: Easing) {
        super();
        let _;
        [this.startNode, _] = EventNode.getStartEnd(node)
        this.value = val;
        this.originalValue = node.easing
    }
    do() {
        this.startNode.innerEasing = this.value
    }
   undo() {
        this.startNode.innerEasing = this.originalValue
   }
}