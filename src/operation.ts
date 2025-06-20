
class OperationList extends EventTarget {
    operations: Operation[];
    undoneOperations: Operation[];
    constructor(public parentChart: Chart) {
        super()
        this.operations = [];
        this.undoneOperations = [];
    }
    undo() {
        const op = this.operations.pop()
        if (op) {
            if (!this.parentChart.modified){
                this.parentChart.modified = true;
                this.dispatchEvent(new Event("firstmodified"))
            }
            this.undoneOperations.push(op)
            op.undo()
        }
    }
    redo() {
        const op = this.undoneOperations.pop()
        if (op) {
            if (!this.parentChart.modified){
                this.parentChart.modified = true;
                this.dispatchEvent(new Event("firstmodified"))
            }
            this.operations.push(op)
            op.do()
        }
    }
    do(operation: Operation) {
        if (operation.ineffective) {
            return
        }
        if (!this.parentChart.modified){
            this.parentChart.modified = true;
            this.dispatchEvent(new Event("firstmodified"))
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
            if (op.ineffective) { continue; }
            op.do()
        }
    }
    undo() {
        const length = this.length
        for (let i = length - 1; i >= 0; i--) {
            const op = this.subOperations[i]
            if (op.ineffective) { continue; }
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
        if (this.field === "endTime") {
            console.log("endTime")
        }
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
    isHold: boolean;
    constructor(note: Note) {
        super()
        this.note = note // In memory of forgettting to add this(
        this.isHold = note.type === NoteType.hold;
        if (!note.parentNode) {
            this.ineffective = true
        } else {
            this.noteNode = note.parentNode
        }
    }
    do() {
        const {note, noteNode} = this;
        noteNode.remove(note);
        const needsUpdate = this.isHold && TimeCalculator.lt(noteNode.endTime, note.endTime)
        if (needsUpdate) {
            const endBeats = TimeCalculator.toBeats(note.endTime);
            const tailJump = (noteNode.parentSeq as HNList).holdTailJump;
            const updateFrom = tailJump.header
            const updateTo = tailJump.tailer;
            // tailJump.getPreviousOf(noteNode, endBeats);
            tailJump.updateRange(updateFrom, noteNode.next);
        }
    }
    undo() {
        const {note, noteNode} = this;
        const needsUpdate = this.isHold && TimeCalculator.lt(noteNode.endTime, note.endTime);
        if (needsUpdate) {
            const endBeats = TimeCalculator.toBeats(note.endTime);
            const tailJump = (noteNode.parentSeq as HNList).holdTailJump;
            const updateFrom = tailJump.getNodeAt(endBeats).previous;
            noteNode.add(note)
            tailJump.updateRange(updateFrom, noteNode.next);
        } else {
            noteNode.add(note);
        }
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

class MultiNoteDeleteOperation extends ComplexOperation<NoteDeleteOperation[]> {
    updatesEditor = true
    constructor(notes: Set<Note> | Note[]) {
        if (notes instanceof Set) {
            notes = [...notes];
        }
        super(...notes.map(note => new NoteDeleteOperation(note)))
        if (notes.length === 0) {
            this.ineffective = true
        }
    }

}

class NoteAddOperation extends Operation {
    noteNode: NoteNode
    note: Note;
    isHold: boolean;
    updatesEditor = true
    constructor(note: Note, node: NoteNode) {
        super()
        this.note = note;
        this.isHold = note.type === NoteType.hold;
        this.noteNode = node
    }
    do() {
        const {note, noteNode} = this;
        const needsUpdate = this.isHold && TimeCalculator.lt(noteNode.endTime, note.endTime);
        if (needsUpdate) {
            const endBeats = TimeCalculator.toBeats(note.endTime);
            const tailJump = (noteNode.parentSeq as HNList).holdTailJump;
            const updateFrom = tailJump.header 
            // tailJump.getNodeAt(endBeats).previous;
            noteNode.add(note)
            tailJump.updateRange(updateFrom, noteNode.next);
        } else {
            noteNode.add(note);
        }
    }
    undo() {
        const {note, noteNode} = this;
        noteNode.remove(note);
        const needsUpdate = this.isHold && TimeCalculator.lt(noteNode.endTime, note.endTime)
        if (needsUpdate) {
            const endBeats = TimeCalculator.toBeats(note.endTime);
            const tailJump = (noteNode.parentSeq as HNList).holdTailJump;
            const updateFrom = tailJump.getPreviousOf(noteNode, endBeats);
            tailJump.updateRange(updateFrom, noteNode.next);
        }
    }
}

class MultiNoteAddOperation extends ComplexOperation<NoteAddOperation[]> {
    updatesEditor = true
    constructor(notes: Set<Note> | Note[], judgeLine: JudgeLine) {
        if (notes instanceof Set) {
            notes = [...notes];
        }
        super(...notes.map(note => {
            const node = judgeLine.getNode(note, true)
            return new NoteAddOperation(note, node);
        }))
        if (notes.length === 0) {
            this.ineffective = true
        }
    }
}

class NoteTimeChangeOperation extends ComplexOperation<[NoteRemoveOperation, NoteValueChangeOperation<"startTime">, NoteAddOperation]> {
    note: Note
    updatesEditor = true
    constructor(note: Note, noteNode: NoteNode) {
        super(
            new NoteRemoveOperation(note),
            new NoteValueChangeOperation(note, "startTime", noteNode.startTime),
            new NoteAddOperation(note, noteNode)
        )
        if (note.type === NoteType.hold && !TimeCalculator.gt(note.endTime, noteNode.startTime)) {
            this.ineffective = true
        }
        this.note = note
        if (note.parentNode === noteNode) {
            this.ineffective = true
        }
    }
    rewrite(operation: NoteTimeChangeOperation): boolean {
        if (operation.note === this.note) {
            this.subOperations[0] = new NoteRemoveOperation(this.note)
            if (!this.subOperations[0].ineffective) {
                this.subOperations[0].do()
            }
            this.subOperations[1].value = operation.subOperations[1].value
            this.subOperations[1].do()
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
        if (!TimeCalculator.gt(value, note.startTime)) {
            this.ineffective = true
        }
    }
    do() {
        super.do()
        const node = this.note.parentNode;
        node.sort(this.note);
        const tailJump = (node.parentSeq as HNList).holdTailJump;
        tailJump.updateRange(tailJump.header, tailJump.tailer);
    }
    undo() {
        super.undo()
        const node = this.note.parentNode;
        node.sort(this.note);
        const tailJump = (node.parentSeq as HNList).holdTailJump;
        tailJump.updateRange(tailJump.header, tailJump.tailer);
    }
    rewrite(operation: HoldEndTimeChangeOperation): boolean { // 看懂了，不重写的话会出问题
        if (operation.note === this.note && this.field === operation.field) {
            if (operation.value === this.value) {
                return true;
            }
            this.value = operation.value;
            this.note[this.field] = operation.value;
            const tailJump = (this.note.parentNode.parentSeq as HNList).holdTailJump;
            tailJump.updateRange(tailJump.header, tailJump.tailer);
            return true;
        }
        return false;
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
            const tree = note.parentNode.parentSeq.parentLine.getNNList(note.speed, !isHold, true)
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
    originalPrev: EventStartNode;
    constructor(node: EventStartNode) {
        super();
        if (node.previous === null) {
            this.ineffective = true;
            return;
        }
        if (node.isFirstStart()) {
            this.ineffective = true;
            return;
        }
        [this.endNode, this.startNode] = EventNode.getEndStart(node)
        this.sequence = this.startNode.parentSeq
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
    originalSequence: EventNodeSequence;
    constructor(node: EventStartNode, targetPrevious: EventStartNode) {
        super()
        this.node = node;
        this.tarPrev = targetPrevious
        this.originalSequence = targetPrevious.parentSeq
    }
    do() {
        const [endNode, startNode] = EventNode.insert(this.node, this.tarPrev);
        this.node.parentSeq.jump.updateRange(endNode, startNode)
    }
    undo() {
        this.originalSequence?.jump.updateRange(...EventNode.removeNodePair(...EventNode.getEndStart(this.node)))
    }
}


/**
 * Only used for new nodes
 * dynamically compute the targetPrevious
 * /
class EventNodePairAddOperation extends Operation {
    updatesEditor = true
    constructor(public node: EventStartNode, public targetSequence: EventNodeSequence) {
        super();
    }
    do() {
        const tarPrev = this.targetSequence.getNodeAt(this.node.start);
        const [endNode, startNode] = 
    }
}
*/

class MultiNodeAddOperation extends ComplexOperation<EventNodePairInsertOperation[]> {
    updatesEditor = true
    nodes: EventStartNode[];
    constructor(nodes: EventStartNode[], seq: EventNodeSequence) {
        let prev = seq.getNodeAt(TimeCalculator.toBeats(nodes[0].time));
        super(...nodes.map(node => {
            const op = new EventNodePairInsertOperation(node, prev);
            prev = node; // 有种reduce的感觉
            return op
        }));
        this.nodes = nodes
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
        const seq = this.sequence = node.parentSeq
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
        this.sequence.jump.updateRange(EventNode.previousStartOfStart(this.endNode.previous), EventNode.nextStartOfStart(this.startNode))
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