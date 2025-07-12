/**
 * @author Zes Minkey Young
 * This file is an alternative for those users whose browsers don't support ESnext.Collection
 */
declare const DEFAULT_TEMPLATE_LENGTH = 16;
declare const easeOutElastic: (x: number) => number;
declare const easeOutBounce: (x: number) => number;
declare const easeOutExpo: (x: number) => number;
declare const easeOutBack: (x: number) => number;
declare const linear: (x: number) => number;
declare const linearLine: CurveDrawer;
declare const easeOutSine: (x: number) => number;
declare const easeInQuad: (x: number) => number;
declare const easeInCubic: (x: number) => number;
declare const easeInQuart: (x: number) => number;
declare const easeInQuint: (x: number) => number;
declare const easeInCirc: (x: number) => number;
declare function mirror(easeOut: (x: number) => number): (x: number) => number;
declare function toEaseInOut(easeIn: (x: number) => number, easeOut: (x: number) => number): (x: number) => number;
declare const easeOutQuad: (x: number) => number;
declare const easeInSine: (x: number) => number;
declare const easeOutQuart: (x: number) => number;
declare const easeOutCubic: (x: number) => number;
declare const easeOutQuint: (x: number) => number;
declare const easeOutCirc: (x: number) => number;
declare const easeInExpo: (x: number) => number;
declare const easeInElastic: (x: number) => number;
declare const easeInBounce: (x: number) => number;
declare const easeInBack: (x: number) => number;
declare const easeInOutSine: (x: number) => number;
declare const easeInOutQuad: (x: number) => number;
declare const easeInOutCubic: (x: number) => number;
declare const easeInOutQuart: (x: number) => number;
declare const easeInOutQuint: (x: number) => number;
declare const easeInOutExpo: (x: number) => number;
declare const easeInOutCirc: (x: number) => number;
declare const easeInOutBack: (x: number) => number;
declare const easeInOutElastic: (x: number) => number;
declare const easeInOutBounce: (x: number) => number;
declare const easingFnMap: {
    linear: ((x: number) => number)[];
    sine: ((x: number) => number)[];
    quad: ((x: number) => number)[];
    cubic: ((x: number) => number)[];
    quart: ((x: number) => number)[];
    quint: ((x: number) => number)[];
    expo: ((x: number) => number)[];
    circ: ((x: number) => number)[];
    back: ((x: number) => number)[];
    elastic: ((x: number) => number)[];
    bounce: ((x: number) => number)[];
};
/**
 * 缓动基类
 * Easings are used to describe the rate of change of a parameter over time.
 * They are used in events, curve note filling, etc.
 */
declare abstract class Easing {
    constructor();
    /**
     * 返回当前变化量与变化量之比
     * 或者当前数值。（参数方程）
     * @param t 一个0-1的浮点数，代表当前经过时间与总时间之比
     */
    abstract getValue(t: number): number;
    segmentedValueGetter(easingLeft: number, easingRight: number): (t: number) => number;
    drawCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number): void;
}
type TupleCoordinate = [number, number];
type CurveDrawer = (context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) => void;
declare class SegmentedEasing extends Easing {
    easing: Easing;
    left: number;
    right: number;
    getter: (t: number) => number;
    constructor(easing: Easing, left: number, right: number);
    getValue(t: number): number;
}
/**
 * 普通缓动
 * See https://easings.net/zh-cn to learn about the basic types of easing.
 *
 */
declare class NormalEasing extends Easing {
    rpeId: number;
    id: number;
    funcType: string;
    easeType: string;
    _getValue: (t: number) => number;
    _drawCurve: CurveDrawer;
    constructor(fn: (t: number) => number);
    constructor(fn: (t: number) => number, curveDrawer?: CurveDrawer);
    getValue(t: number): number;
    drawCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number): void;
}
interface Coordinate {
    readonly x: number;
    readonly y: number;
}
/**
 * 贝塞尔曲线缓动
 * uses the Bezier curve formula to describe an easing.
 */
declare class BezierEasing extends Easing {
    cp1: Coordinate;
    cp2: Coordinate;
    constructor();
    getValue(t: number): number;
    drawCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number): void;
}
/**
 * 模板缓动
 * to implement an easing with an eventNodeSequence.
 * 这是受wikitext的模板概念启发的。
 * This is inspired by the "template" concept in wikitext.
 */
declare class TemplateEasing extends Easing {
    eventNodeSequence: EventNodeSequence;
    name: string;
    constructor(name: string, sequence: EventNodeSequence);
    getValue(t: number): number;
    get valueDelta(): number;
    get headValue(): number;
}
/**
 * 参数方程缓动
 * to implement an easing with a parametric equation.
 * RPE 亦有参数方程，但是它并不是作为缓动类型使用的；
 * RPE also has Parametric Equations, but it does not use it as an easing type;
 * 相反，RPE只是通过插值生成一个线性事件序列，是无法逆向的。
 * It instead just generate a sequence of linear events through interpolation, which is irreversible.
 * 这里在KPA中我们使用它作为缓动类型，以增加复用性。
 * Here in KPA we use it as an easing type, to increase reusability.
 * 在转换为RPEJSON前，都不需要对其进行分割。
 * We do not segment it until the chart is converted to an RPEJSON.
 */
declare class ParametricEquationEasing extends Easing {
    _getValue: (x: number) => number;
    constructor(equation: string);
    getValue(t: number): number;
}
/**
 * 缓动库
 * 用于管理模板缓动
 * for template easing management
 * 谱面的一个属性
 * a property of chart
 * 加载谱面时，先加载事件序列，所需的模板缓动会被加入到缓动库，但并不立即实现，在读取模板缓动时，才实现缓动。
 * To load a chart, the eventNodeSquences will be first loaded, during which process
 * the easings will be added to the easing library but not implemented immediately.
 * They will be implemented when the template easings are read from data.
 *
 */
declare class TemplateEasingLib {
    easings: {
        [name: string]: TemplateEasing;
    };
    constructor();
    getOrNew(name: string): TemplateEasing;
    /**
     * 注册一个模板缓动，但不会实现它
     * register a template easing when reading eventNodeSequences, but does not implement it immediately
     */
    require(name: string): void;
    implement(name: string, sequence: EventNodeSequence): void;
    /**
     * 检查所有模板缓动是否实现
     * check if all easings are implemented
     * 应当在读取完所有模板缓动后调用
     * should be invoked after all template easings are read
     */
    check(): void;
    get(key: string): TemplateEasing | undefined;
    dump(eventNodeSequences: Set<EventNodeSequence>): CustomEasingData[];
}
declare const linearEasing: NormalEasing;
declare const fixedEasing: NormalEasing;
declare const easingMap: {
    fixed: {
        out: NormalEasing;
        in: NormalEasing;
        inout: NormalEasing;
    };
    linear: {
        out: NormalEasing;
        in: NormalEasing;
        inout: NormalEasing;
    };
    sine: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    quad: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    cubic: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    quart: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    quint: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    expo: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    circ: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    back: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    elastic: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
    bounce: {
        in: NormalEasing;
        out: NormalEasing;
        inout: NormalEasing;
    };
};
/**
 * 按照KPA的编号
 */
declare const easingArray: NormalEasing[];
declare const rpeEasingArray: NormalEasing[];
declare const MIN_LENGTH = 128;
declare const MAX_LENGTH = 1024;
declare const MINOR_PARTS = 16;
type EndNextFn<T extends TwoDirectionNode> = (node: TypeOrTailer<T> | Header<T>) => [endBeats: number, next: TypeOrTailer<T>];
declare const breakpoint: () => never;
declare class JumpArray<T extends TwoDirectionNode> {
    endNextFn: EndNextFn<T>;
    nextFn: (node: T, beats: number) => T | false;
    resolveLastNode: (node: TypeOrTailer<T>) => TypeOrTailer<T>;
    header: Header<T>;
    tailer: Tailer<T>;
    array: (TypeOrTailer<T>[] | TypeOrTailer<T>)[];
    averageBeats: number;
    effectiveBeats: number;
    goPrev: (node: T) => T;
    /**
     *
     * @param head 链表头
     * @param tail 链表尾
     * @param originalListLength
     * @param effectiveBeats 有效拍数（等同于音乐拍数）
     * @param endNextFn 接收一个节点，返回该节点分管区段拍数，并给出下个节点。若抵达尾部，返回[null, null]（停止遍历的条件是抵达尾部而不是得到null）
     * @param nextFn 接收一个节点，返回下个节点。如果应当停止，返回false。
     */
    constructor(head: Header<T>, tail: Tailer<T>, originalListLength: number, effectiveBeats: number, endNextFn: EndNextFn<T>, nextFn: (node: T, beats: number) => T | false, resolveLastNode?: (node: TypeOrTailer<T>) => TypeOrTailer<T>);
    updateEffectiveBeats(val: number): void;
    updateAverageBeats(): void;
    /**
     *
     * @param firstNode 不含
     * @param lastNode 含
     */
    updateRange(firstNode: TypeOrHeader<T>, lastNode: TypeOrTailer<T>): void;
    getPreviousOf(node: T, beats: number): T | Header<T>;
    /**
     *
     * @param beats 拍数
     * @ param usePrev 可选，若设为true，则在取到事件头部时会返回前一个事件（即视为左开右闭）
     * @returns 时间索引链表的节点
     */
    getNodeAt(beats: number): T | Tailer<T>;
}
/**
 * @deprecated
 */
declare class Pointer<T extends TwoDirectionNode> {
    beats: number;
    node: T | Tailer<T>;
    before: number;
    constructor();
    pointTo(node: TypeOrTailer<T>, beats: number, counts?: boolean): void;
}
/**
 * @author Zes M Young
 */
declare const node2string: (node: NoteNode | Tailer<NoteNode>) => string;
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
declare class Note {
    above: boolean;
    alpha: number;
    endTime: [number, number, number];
    isFake: boolean;
    /** x coordinate in the judge line */
    positionX: number;
    size: number;
    speed: number;
    startTime: [number, number, number];
    type: NoteType;
    visibleTime: number;
    yOffset: number;
    parentNode: NoteNode;
    constructor(data: NoteDataRPE);
    /**
     *
     * @param offset
     * @returns
     */
    clone(offset: TimeT): Note;
    dumpRPE(): NoteDataRPE;
    dumpKPA(): void;
}
type Connectee = NoteNode | NNNode;
declare class NoteNode implements TwoDirectionNode {
    totalNode: NNNode;
    readonly startTime: TimeT;
    /**
     * The notes it contains.
     * If they are holds, they are ordered by their endTime, from late to early.
     */
    readonly notes: Note[];
    next: TypeOrTailer<NoteNode>;
    _previous: WeakRef<TypeOrHeader<NoteNode>> | null;
    get previous(): TypeOrHeader<NoteNode>;
    set previous(val: TypeOrHeader<NoteNode>);
    parentSeq: NNList;
    chart: Chart;
    static count: number;
    id: number;
    constructor(time: TimeT);
    static fromKPAJSON(data: NoteNodeDataKPA): NoteNode;
    get isHold(): boolean;
    get endTime(): TimeT;
    add(note: Note): void;
    sort(note: Note): any;
    /**
     * 其他部分均已有序，通过冒泡排序把发生变更的NoteNode移动到正确的位置
     * @param index 待排序的Note的索引
     */
    sort(index: number): any;
    remove(note: Note): void;
    static disconnect<T extends Connectee>(note1: T | Header<T>, note2: T | Tailer<T>): void;
    static connect<T extends Connectee>(note1: T | Header<T>, note2: T | Tailer<T>): void;
    static insert<T extends Connectee>(note1: TypeOrHeader<T>, inserted: T, note2: TypeOrTailer<T>): void;
    dump(): NoteNodeDataKPA;
}
declare class NNList {
    id: string;
    speed: number;
    head: Header<NoteNode>;
    tail: Tailer<NoteNode>;
    currentPoint: NoteNode | Header<NoteNode>;
    /** 定位上个Note头已过，本身未到的Note */
    jump: JumpArray<NoteNode>;
    timesWithNotes: number;
    timeRanges: [number, number][];
    effectiveBeats: number;
    parentLine: JudgeLine;
    constructor(speed: number, effectiveBeats?: number);
    static fromKPAJSON(isHold: boolean, effectiveBeats: number, data: NNListDataKPA, nnnList: NNNList): NNList;
    initJump(): void;
    initPointer(pointer: Pointer<NoteNode>): void;
    /**
     *
     * @param beats 目标位置
     * @param beforeEnd 指定选取该时刻之前还是之后第一个Node，对于非Hold无影响
     * @param pointer 指针，实现查询位置缓存
     * @returns
     */
    getNodeAt(beats: number, beforeEnd?: boolean, pointer?: Pointer<NoteNode>): NoteNode | Tailer<NoteNode>;
    /**
     * Get or create a node of given time
     * @param time
     * @returns
     */
    getNodeOf(time: TimeT): NoteNode;
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
    static distanceFromPointer<T extends NNNode | NoteNode>(beats: number, pointer: Pointer<T>, useEnd?: boolean): 1 | 0 | -1;
    /**
     * To find the note's previous(Sibling) if it is to be inserted into the tree
     * @param note
     */
    dumpKPA(): NNListDataKPA;
}
/**
 * HoldNode的链表
 * HN is the abbreviation of HoldNode, which is not individually declared.
 * A NN that contains holds (a type of note) is a HN.
 */
declare class HNList extends NNList {
    /**
     * 最早的还未结束Hold
     */
    holdTailJump: JumpArray<NoteNode>;
    constructor(speed: number, effectiveBeats?: number);
    initJump(): void;
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
    getNodeAt(beats: number, beforeEnd?: boolean): TypeOrTailer<NoteNode>;
    insertNoteJumpUpdater(note: NoteNode): () => void;
}
declare class NNNode implements TwoDirectionNode {
    readonly noteNodes: NoteNode[];
    readonly holdNodes: NoteNode[];
    readonly startTime: TimeT;
    real: number;
    noteOfType: [number, number, number, number];
    previous: TypeOrHeader<NNNode>;
    next: TypeOrTailer<NNNode>;
    constructor(time: TimeT);
    get endTime(): TimeT;
    add(node: NoteNode): void;
}
/**
 * 二级音符节点链表
 * contains NNNs
 * NNN is the abbreviation of NoteNodeNode, which store note (an element in music game) nodes with same startTime
 * NN is the abbreviation of NoteNode, which stores the notes with the same startTime.
 */
declare class NNNList {
    jump: JumpArray<NNNode>;
    parentChart: Chart;
    head: Header<NNNode>;
    tail: Tailer<NNNode>;
    editorPointer: Pointer<NNNode>;
    effectiveBeats: number;
    timesWithNotes: number;
    constructor(effectiveBeats: number);
    initJump(): void;
    movePointerBeforeStart(pointer: Pointer<NNNode>, beats: number): [TypeOrTailer<NNNode>, TypeOrTailer<NNNode>, number];
    movePointerBeforeEnd(pointer: Pointer<NNNode>, beats: number): [TypeOrTailer<NNNode>, TypeOrTailer<NNNode>, number];
    movePointerWithGivenJumpArray(pointer: Pointer<NNNode>, beats: number, jump: JumpArray<NNNode>, useEnd?: boolean): [TypeOrTailer<NNNode>, TypeOrTailer<NNNode>, number];
    getNodeAt(beats: number, beforeEnd?: boolean, pointer?: Pointer<NNNode>): NNNode | Tailer<NNNode>;
    getNode(time: TimeT): NNNode;
    addNoteNode(noteNode: NoteNode): void;
}
declare class JudgeLine {
    texture: string;
    group: JudgeLineGroup;
    cover: boolean;
    hnLists: Map<string, HNList>;
    nnLists: Map<string, NNList>;
    eventLayers: EventLayer[];
    father: JudgeLine;
    children: JudgeLine[];
    moveX: number;
    moveY: number;
    rotate: number;
    alpha: number;
    id: number;
    name: string;
    readonly chart: Chart;
    constructor(chart: Chart);
    static fromRPEJSON(chart: Chart, id: number, data: JudgeLineDataRPE, templates: TemplateEasingLib, timeCalculator: TimeCalculator): JudgeLine;
    static fromKPAJSON(chart: Chart, id: number, data: JudgeLineDataKPA, templates: TemplateEasingLib, timeCalculator: TimeCalculator): JudgeLine;
    updateSpeedIntegralFrom(beats: number, timeCalculator: TimeCalculator): void;
    /**
     * startY and endY must not be negative
     * @param beats
     * @param timeCalculator
     * @param startY
     * @param endY
     * @returns
     */
    computeTimeRange(beats: number, timeCalculator: TimeCalculator, startY: number, endY: number): [number, number][];
    /**
     *
     * @param beats
     * @param usePrev 如果取到节点，将使用EndNode的值。默认为FALSE
     * @returns
     */
    getValues(beats: number, usePrev?: boolean): [x: number, y: number, theta: number, alpha: number];
    /**
     * 求该时刻坐标，不考虑父线
     * @param beats
     * @param usePrev
     * @returns
     */
    getThisCoordinate(beats: number, usePrev?: boolean): TupleCoordinate;
    /**
     * 求父线锚点坐标，无父线返回原点
     * @param beats
     * @param usePrev
     * @returns
     */
    getBaseCoordinate(beats: number, usePrev?: boolean): TupleCoordinate;
    getStackedValue(type: keyof EventLayer, beats: number, usePrev?: boolean): number;
    getStackedIntegral(beats: number, timeCalculator: TimeCalculator): number;
    /**
     * 获取对应速度和类型的Note树,没有则创建
     */
    getNNList(speed: number, isHold: boolean, initsJump: boolean): NNList;
    getNode(note: Note, initsJump: boolean): NoteNode;
    /**
     *
     * @param eventNodeSequences To Collect the sequences used in this line
     * @returns
     */
    dumpKPA(eventNodeSequences: Set<EventNodeSequence>, judgeLineGroups: JudgeLineGroup[]): JudgeLineDataKPA;
    private dumpControlEvent;
    updateEffectiveBeats(EB: number): void;
}
declare enum EventType {
    moveX = 0,
    moveY = 1,
    rotate = 2,
    alpha = 3,
    speed = 4,
    easing = 5,
    bpm = 6
}
declare enum NoteType {
    tap = 1,
    drag = 4,
    flick = 3,
    hold = 2
}
interface EventLayer {
    moveX?: EventNodeSequence;
    moveY?: EventNodeSequence;
    rotate?: EventNodeSequence;
    alpha?: EventNodeSequence;
    speed?: EventNodeSequence;
}
type Plain<T> = {
    [k: string]: T;
};
/**
 * 相当于 Python 推导式
 * @param arr
 * @param expr
 * @param guard
 * @returns
 */
declare function arrayForIn<T, RT>(arr: T[], expr: (v: T) => RT, guard?: (v: T) => boolean): RT[];
/**
 * 相当于 Python 推导式
 * @param obj
 * @param expr
 * @param guard
 * @returns
 */
declare function dictForIn<T, RT>(obj: Plain<T>, expr: (v: T) => RT, guard?: (v: T) => boolean): Plain<RT>;
declare class Chart {
    judgeLines: JudgeLine[];
    bpmList: BPMSegmentData[];
    timeCalculator: TimeCalculator;
    orphanLines: JudgeLine[];
    name: string;
    level: string;
    offset: number;
    templateEasingLib: TemplateEasingLib;
    sequenceMap: Map<string, EventNodeSequence>;
    effectiveBeats: number;
    nnnList: NNNList;
    /**  */
    judgeLineGroups: JudgeLineGroup[];
    duration: number;
    chartingTime: number;
    rpeChartingTime: number;
    modified: boolean;
    constructor();
    getEffectiveBeats(): number;
    static fromRPEJSON(data: ChartDataRPE, duration: number): Chart;
    static fromKPAJSON(data: ChartDataKPA): Chart;
    updateCalculator(): void;
    updateEffectiveBeats(duration: number): void;
    dumpKPA(): Required<ChartDataKPA>;
    getJudgeLineGroups(): string[];
    createNNNode(time: TimeT): NNNode;
}
declare class JudgeLineGroup {
    name: string;
    constructor(name: string);
    addJudgeLine(judgeLine: JudgeLine): void;
    judgeLines: JudgeLine[];
}
/**
 * To compare two arrays
 * @param arr1
 * @param arr2
 * @returns
 */
declare function arrEq<T>(arr1: Array<T>, arr2: Array<T>): boolean;
/**
 * 事件节点基类
 * event node.
 * 用于代表事件的开始和结束。（EventStartNode表开始，EventEndNode表结束）
 * Used to represent the starts (EventStartNode) and ends (EventEndNode) of events.
 * 事件指的是判定线在某个时间段上的状态变化。
 * Events is the changing of judge line's state in a certain time.
 * 五种事件类型：移动X，移动Y，旋转，透明度，速度。
 * 5 basic types of events: moveX, moveY, rotate, alpha, speed.
 * 事件节点没有类型，类型由它所属的序列决定。
 * Type is not event nodes' property; it is the property of EventNodeSequence.
 * Events' type is determined by which sequence it belongs to.
 * 与RPE不同的是，KPA使用两个节点来表示一个事件，而不是一个对象。
 * Different from that in RPE, KPA uses two nodes rather than one object to represent an event.
 */
declare abstract class EventNode {
    time: TimeT;
    value: number;
    easing: Easing;
    /** 后一个事件节点 */
    next: EventNode | Tailer<EventNode>;
    /** 前一个事件节点 */
    previous: EventNode | Header<EventNode>;
    abstract parentSeq: EventNodeSequence;
    constructor(time: TimeT, value: number);
    clone(offset: TimeT): EventStartNode | EventEndNode;
    /**
     * gets the easing object from RPEEventData
     * @param data
     * @param left
     * @param right
     * @param templates
     * @returns
     */
    static getEasing(data: EventDataRPE, left: number, right: number, templates: TemplateEasingLib): Easing;
    /**
     * constructs EventStartNode and EventEndNode from EventDataRPE
     * @param data
     * @param templates
     * @returns
     */
    static fromEvent(data: EventDataRPE, templates: TemplateEasingLib): [EventStartNode, EventEndNode];
    static connect(node1: EventStartNode, node2: EventEndNode | Tailer<EventStartNode>): void;
    static connect(node1: EventEndNode | Header<EventStartNode>, node2: EventStartNode): void;
    static removeNodePair(endNode: EventEndNode, startNode: EventStartNode): [EventStartNode | Header<EventStartNode>, EventStartNode | Tailer<EventStartNode>];
    static insert(node: EventStartNode, tarPrev: EventStartNode): [Header<EventStartNode> | EventStartNode, EventStartNode | Tailer<EventStartNode>];
    /**
     *
     * @param node
     * @returns the next node if it is a tailer, otherwise the next start node
     */
    static nextStartOfStart(node: EventStartNode): EventStartNode | Tailer<EventStartNode>;
    /**
     *
     * @param node
     * @returns itself if node is a tailer, otherwise the next start node
     */
    static nextStartOfEnd(node: EventEndNode | Tailer<EventStartNode>): EventStartNode | Tailer<EventStartNode>;
    static previousStartOfStart(node: EventStartNode): EventStartNode | Header<EventStartNode>;
    /**
     * It does not return the start node which form an event with it.
     * @param node
     * @returns
     */
    static secondPreviousStartOfEnd(node: EventEndNode): EventStartNode | Header<EventStartNode>;
    static nextStartInJumpArray(node: EventStartNode): EventStartNode | Tailer<EventStartNode>;
    /**
     * 获得一对背靠背的节点。不适用于第一个StartNode
     * @param node
     * @returns
     */
    static getEndStart(node: EventStartNode | EventEndNode): [EventEndNode, EventStartNode];
    static getStartEnd(node: EventStartNode | EventEndNode): [EventStartNode, EventEndNode];
    static setToNewOrderedArray(dest: TimeT, set: Set<EventStartNode>): [EventStartNode[], EventStartNode[]];
    static belongToSequence(nodes: Set<EventStartNode>, sequence: EventNodeSequence): boolean;
    /**
     * 检验这些节点对是不是连续的
     * 如果不是不能封装为模板缓动
     * @param nodes 有序开始节点数组，必须都是带结束节点的（背靠背）（第一个除外）
     * @returns
     */
    static isContinuous(nodes: EventStartNode[]): boolean;
    get innerEasing(): Easing;
    /**
     * 设置easing，如果easing是分段缓动，则将分段缓动中的easing设置为innerEasing
     * 不可传入分段缓动，否则会出错
     */
    set innerEasing(easing: Exclude<Easing, SegmentedEasing>);
}
declare class EventStartNode extends EventNode {
    next: EventEndNode | Tailer<EventStartNode>;
    previous: EventEndNode | Header<EventStartNode>;
    /**
     * 对于速度事件，从计算时的时刻到此节点的总积分
     */
    cachedIntegral?: number;
    constructor(time: TimeT, value: number);
    get easingIsSegmented(): boolean;
    parentSeq: EventNodeSequence;
    /**
     * 因为是RPE和KPA共用的方法所以easingType可以为字符串
     * @returns
     */
    dump(): EventDataRPE;
    /**
     * 仅用于编译至RPE时解决最后一个StartNode的问题
     * 限最后一个StartNode使用
     * @returns
     */
    dumpAsLast(): EventDataRPE;
    getValueAt(beats: number): number;
    getSpeedValueAt(beats: number): number;
    /**
     * 积分获取位移
     */
    getIntegral(beats: number, timeCalculator: TimeCalculator): number;
    getFullIntegral(timeCalculator: TimeCalculator): number;
    isFirstStart(): boolean;
    isLastStart(): boolean;
    clone(offset?: TimeT): EventStartNode;
    clonePair(offset: TimeT): EventStartNode;
}
declare class EventEndNode extends EventNode {
    next: EventStartNode;
    previous: EventStartNode;
    get parentSeq(): EventNodeSequence;
    set parentSeq(_parent: EventNodeSequence);
    constructor(time: TimeT, value: number);
    getValueAt(beats: number): number;
    clone(offset?: TimeT): EventEndNode;
}
/**
 * 为一个链表结构。会有一个数组进行快跳。
 * is the list of event nodes, but not purely start nodes.
 * 结构如下：Header -> (StartNode -> [EndNode) -> (StartNode] -> [EndNode) -> ... -> StartNode] -> Tailer.
 * The structure is like this: Header -> (StartNode -> [EndNode) -> (StartNode] -> [EndNode) -> ... -> StartNode] -> Tailer.
 * 用括号标出的两个节点是一个事件，用方括号标出的两个节点是同一时间点的节点。
 * The each 2 nodes marked by parentheses is an event; the each 2 nodes marked by brackets have the same time.
 * 注意尾节点之前的节点不是一个结束节点，而是一个开始节点，其缓动无效。
 * Note that the node before the tailer is not an end node, but a start node whose easing is meaningless.
 * 就是说最后一个节点后取值，显然会取得这个节点的值，与缓动无关。
 * (i. e. the value after the last event node is its value, not subject to easing, obviously.)
 * 如果尾之前的节点是一个结束节点，那么取值会返回undefined，这是不期望的。
 * If so, the value after that will be undefined, which is not expected.
 * ("so" refers to the assumption that the node before the tailer is an end node)
 * 和NNList和NNNList一样，有跳数组以加速随机读取。
 * Like NNList and NNNList, it has a jump array to speed up random reading.
 * 插入或删除节点时，需要更新跳数组。
 * Remember to update the jump array when inserting or deleting nodes.
 */
declare class EventNodeSequence {
    type: EventType;
    effectiveBeats: number;
    chart: Chart;
    /** id follows the format `#${lineid}.${layerid}.${typename}` by default */
    id: string;
    /** has no time or value */
    head: Header<EventStartNode>;
    /** has no time or value */
    tail: Tailer<EventStartNode>;
    jump?: JumpArray<EventStartNode>;
    listLength: number;
    /** 一定是二的幂，避免浮点误差 */
    jumpAverageBeats: number;
    constructor(type: EventType, effectiveBeats: number);
    static fromRPEJSON<T extends EventType>(type: T, data: EventDataRPE[], chart: Chart, endValue?: number): EventNodeSequence;
    /**
     * 生成一个新的事件节点序列，仅拥有一个节点。
     * 需要分配ID！！！！！！
     * @param type
     * @param effectiveBeats
     * @returns
     */
    static newSeq(type: EventType, effectiveBeats: number): EventNodeSequence;
    /** validate() {
        /*
         * 奇谱发生器中事件都是首尾相连的
         //
        const length = this.endNodes.length;
        for (let index = 0; index < length; index++) {
            let end = this.endNodes[index];
            let start = this.startNodes[index + 1]
            if (!arrEq(end.time, start.time)) {
                start.time = end.time
            }
            start.previous = end;
            end.next = start;
            // 这个就是真的该这么写了（
        }
    }
    **/
    initJump(): void;
    updateJump(from: TypeOrHeader<EventStartNode>, to: TypeOrTailer<EventStartNode>): void;
    insert(): void;
    getNodeAt(beats: number, usePrev?: boolean): EventStartNode;
    getValueAt(beats: number, usePrev?: boolean): number;
    getIntegral(beats: number, timeCalculator: TimeCalculator): number;
    updateNodesIntegralFrom(beats: number, timeCalculator: TimeCalculator): void;
    dump(): EventNodeSequenceDataKPA;
}
/**
 *
 */
declare class BPMStartNode extends EventStartNode {
    spb: number;
    cachedStartIntegral?: number;
    cachedIntegral?: number;
    next: BPMEndNode | Tailer<BPMStartNode>;
    constructor(startTime: TimeT, bpm: number);
    getIntegral(beats: number): number;
    /**
     * may only used with a startnode whose next is not tail
     * @returns
     */
    getFullIntegral(): number;
}
declare class BPMEndNode extends EventEndNode {
    spb: number;
    previous: BPMStartNode;
    next: BPMStartNode;
    constructor(endTime: TimeT);
    get value(): number;
    set value(val: number);
}
/**
 * 拥有与事件类似的逻辑
 * 每对节点之间代表一个BPM相同的片段
 * 片段之间BPM可以发生改变
 */
declare class BPMSequence extends EventNodeSequence {
    duration: number;
    head: Header<BPMStartNode>;
    tail: Tailer<BPMStartNode>;
    /** 从拍数访问节点 */
    jump: JumpArray<EventStartNode>;
    /** 以秒计时的跳数组，处理从秒访问节点 */
    secondJump: JumpArray<BPMStartNode>;
    constructor(bpmList: BPMSegmentData[], duration: number);
    initJump(): void;
    updateSecondJump(): void;
    updateJump(from: TypeOrHeader<EventStartNode>, to: TypeOrTailer<EventStartNode>): void;
    getNodeBySeconds(seconds: number): BPMStartNode;
    dumpBPM(): BPMSegmentData[];
}
/**
 * @alias TC
 */
declare class TimeCalculator {
    bpmList: BPMSegmentData[];
    bpmSequence: BPMSequence;
    duration: number;
    constructor();
    update(): void;
    toSeconds(beats: number): number;
    segmentToSeconds(beats1: number, beats2: number): number;
    secondsToBeats(seconds: number): number;
    static toBeats(beaT: TimeT): number;
    static getDelta(beaT1: TimeT, beaT2: TimeT): number;
    static eq(beaT1: TimeT, beaT2: TimeT): boolean;
    static gt(beaT1: TimeT, beaT2: TimeT): boolean;
    static lt(beaT1: TimeT, beaT2: TimeT): boolean;
    static ne(beaT1: TimeT, beaT2: TimeT): boolean;
    static add(beaT1: TimeT, beaT2: TimeT): TimeT;
    static sub(beaT1: TimeT, beaT2: TimeT): TimeT;
    static div(beaT1: TimeT, beaT2: TimeT): [number, number];
    static mul(beaT: TimeT, ratio: [number, number]): TimeT;
    /**
     * 原地规范化时间元组，但仍然返回这个元组，方便使用
     * validate TimeT in place
     * @param beaT
     */
    static validateIp(beaT: TimeT): TimeT;
    static gcd(a: number, b: number): number;
    dump(): BPMSegmentData[];
}
declare const TC: typeof TimeCalculator;
type CSSStyleName = Exclude<keyof CSSStyleDeclaration, "length" | "parentRule" | "item" | "getPropertyValue" | "getPropertyPriority" | "setProperty" | "removeProperty">;
/**
 * Z is just like jQuery, but it's much simpler.
 * It only contains one element, which is enough in most cases.
 * In contrast, jQuery can contain multiple elements, which makes the type inference miserable sometimes.
 * When you need to create a new element, unlike jQuery, you do not need to wrap the tag name with <>.
 * just use $("div"), for example.
 * The type parameter is the tagname instead of the class of the element,
 * which settles the problem that in jQuery the editor does not infer $("<tagName>") as a specific HTMLElement Type.
 * For example, $("<input>") in jQuery cannot be directly inferred as JQuery<HTMLInputElement>.
 * But $("input") in Z is obviously inferred as Z<"input">.
 * Supports chaining, like jQuery.
 */
declare class Z<K extends keyof HTMLElementTagNameMap> extends EventTarget {
    element: HTMLElementTagNameMap[K];
    constructor(type: K, newElement?: boolean);
    get clientWidth(): number;
    get clientHeight(): number;
    html(str: string): this;
    text(str: string): this;
    addClass(...classes: string[]): this;
    removeClass(...classes: string[]): void;
    release(): HTMLElementTagNameMap[K];
    attr(name: string): string;
    attr(name: string, value: string): this;
    css(name: CSSStyleName, value: string): void;
    append(...$elements: (Z<any> | HTMLElement)[]): this;
    appendTo(element: HTMLElement | Z<keyof HTMLElementTagNameMap>): this;
    onClick(callback: (e: Event) => any): this;
    onInput(callback: (e: Event) => any): this;
    /**
     * 用于绑定元素原生事件
     * @param eventType
     * @param callback
     * @returns
     */
    on<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    on(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    show(): void;
    hide(): void;
    remove(): void;
    static from<K extends keyof HTMLElementTagNameMap>(element: HTMLElementTagNameMap[K]): Z<K>;
}
declare const $: <K extends keyof HTMLElementTagNameMap>(strOrEle: K | HTMLElementTagNameMap[K]) => Z<K>;
declare class ZButton extends Z<"div"> {
    _disabled: boolean;
    get disabled(): boolean;
    set disabled(val: boolean);
    constructor(text: string);
    onClick(callback: (e: Event) => any): this;
}
declare class ZSwitch extends ZButton {
    get checked(): boolean;
    set checked(val: boolean);
    constructor(text: string);
    whenClickChange(callback: (checked: boolean, e: Event) => any): this;
}
declare class ZValueChangeEvent extends Event {
    constructor();
}
declare class ZInputBox extends Z<"input"> {
    _disabled: boolean;
    get disabled(): boolean;
    set disabled(val: boolean);
    constructor(defaultValue?: string);
    getValue(): string;
    lastInt: number;
    lastNum: number;
    getInt(): number;
    getNum(): number;
    setValue(val: string): this;
    whenValueChange(callback: (content: string, e: Event) => any): this;
}
/**
 * An input box with up and down arrows, which can and can only be used to input numbers.
 */
declare class ZArrowInputBox extends Z<"div"> {
    scale: number;
    $up: Z<"div">;
    $down: Z<"div">;
    $input: ZInputBox;
    constructor();
    getValue(): number;
    setValue(val: number): this;
    onChange(callback: (content: number, e: Event) => any): this;
}
/**
 * An input box for mixed fractions, which is convenient for inputting time (beats) in music.
 */
declare class ZFractionInput extends Z<"span"> {
    $int: ZInputBox;
    $nume: ZInputBox;
    $deno: ZInputBox;
    constructor();
    getValue(): TimeT;
    setValue(time: TimeT): void;
    _disabled: boolean;
    get disabled(): boolean;
    set disabled(val: boolean);
    onChange(callback: (result: TimeT) => void): void;
}
declare class BoxOption {
    $elementMap: Map<ZDropdownOptionBox, Z<"div">>;
    text: string;
    onChangedTo: (option: BoxOption) => void;
    onChanged: (option: BoxOption) => void;
    constructor(text: string, onChangedTo?: (option: BoxOption) => void, onChanged?: (option: BoxOption) => void);
    getElement(box: ZDropdownOptionBox): Z<"div">;
}
declare class EditableBoxOption extends BoxOption {
    editsItself: boolean;
    onEdited: (option: BoxOption, text: string) => void;
    constructor(text: string, onEdited: (option: BoxOption, text: string) => void, onChangedTo?: (option: BoxOption) => void, onChanged?: (option: BoxOption) => void, editsItself?: boolean);
    edit(text: string): void;
}
declare class ZDropdownOptionBox extends Z<"div"> {
    callbacks: ((val: string) => any)[];
    readonly options: BoxOption[];
    _value: BoxOption;
    $optionList: Z<"div">;
    get value(): BoxOption;
    set value(option: BoxOption);
    $value: Z<"div">;
    constructor(options: BoxOption[], up?: boolean);
    _disabled: boolean;
    get disabled(): boolean;
    set disabled(val: boolean);
    onChange(callback: (val: string) => any): this;
    appendOption(option: BoxOption): this;
    replaceWithOptions(options: BoxOption[]): this;
}
declare class ZEditableDropdownOptionBox extends Z<"div"> {
    $optionList: Z<"div">;
    callbacks: ((val: string) => any)[];
    readonly options: EditableBoxOption[];
    _value: EditableBoxOption;
    get value(): EditableBoxOption;
    set value(option: EditableBoxOption);
    $value: ZInputBox;
    /**
     *
     * @param options
     * @param up determine whether the dropdown is up or down
     */
    constructor(options: EditableBoxOption[], up?: boolean);
    _disabled: boolean;
    get disabled(): boolean;
    set disabled(val: boolean);
    onChange(callback: (val: string) => any): this;
    appendOption(option: EditableBoxOption): this;
    replaceWithOptions(options: EditableBoxOption[]): this;
}
declare class ZMemorableBox extends ZEditableDropdownOptionBox {
    constructor(options: string[], up?: boolean);
    constructOption(str: string): EditableBoxOption;
    appendString(str: string): void;
}
declare namespace EasingOptions {
    const IN: BoxOption;
    const OUT: BoxOption;
    const IO: BoxOption;
    const easeTypeOptions: BoxOption[];
    const easeTypeOptionsMapping: {
        in: BoxOption;
        out: BoxOption;
        inout: BoxOption;
    };
    const FIXED: BoxOption;
    const LINEAR: BoxOption;
    const SINE: BoxOption;
    const QUAD: BoxOption;
    const CUBIC: BoxOption;
    const QUART: BoxOption;
    const QUINT: BoxOption;
    const EXPO: BoxOption;
    const CIRC: BoxOption;
    const BACK: BoxOption;
    const ELASTIC: BoxOption;
    const BOUNCE: BoxOption;
    const funcTypeOptions: BoxOption[];
    const funcTypeOptionsMapping: {
        fixed: BoxOption;
        linear: BoxOption;
        sine: BoxOption;
        quad: BoxOption;
        cubic: BoxOption;
        quart: BoxOption;
        quint: BoxOption;
        expo: BoxOption;
        circ: BoxOption;
        back: BoxOption;
        elastic: BoxOption;
        bounce: BoxOption;
    };
}
/**
 * Easing box
 * A box to input normal easings (See ./easing.ts)
 */
declare class ZEasingBox extends Z<"div"> {
    $input: ZArrowInputBox;
    $easeType: ZDropdownOptionBox;
    $funcType: ZDropdownOptionBox;
    value: number;
    constructor(dropdownUp?: boolean);
    update(): void;
    /**
     * Set a new KPA easing id and change the $funcType and $easeType, but does not call the callback
     * @param easing
     */
    setValue(easing: NormalEasing): void;
    onChange(callback: (value: number) => void): this;
}
declare class ZRadioBox extends Z<"div"> {
    callbacks: ((index: number) => void)[];
    $inputs: Z<"input">[];
    selectedIndex: number;
    constructor(name: string, options: string[], defaultIndex?: number);
    onChange(callback: (index: number) => void): this;
    /**
     * 只转到某个选项，但不触发回调
     * @param index
     * @returns
     */
    switchTo(index: number): this;
}
/**
 * A tabbed UI, with input[type="radio"]s on the top
 */
declare class ZRadioTabs extends Z<"div"> {
    $radioBox: ZRadioBox;
    selectedIndex: number;
    $pages: Z<any>[];
    constructor(name: string, pages: Plain<Z<any>>, defaultIndex?: number);
    onChange(callback: (index: number) => void): this;
    /**
     * 只转到某个选项，但不触发回调
     * @param index
     * @returns
     */
    switchTo(index: number): this;
}
declare class ZDialog extends Z<"dialog"> {
    constructor();
    show(): this;
    bindDonePromise(promise: Promise<any>): this;
    whenClosed(callback: () => void): this;
    close(): void;
}
declare class ZNotification extends Z<"div"> {
    $text: Z<"span">;
    $close: Z<"span">;
    constructor(text: string, timeout?: number);
}
interface ListNode<T> {
    next: ListNode<T> | null;
    value: T;
}
interface TwoDirectionNode {
    previous: TwoDirectionNode | Header<TwoDirectionNode>;
    next: TwoDirectionNode | Tailer<TwoDirectionNode>;
}
interface List<TN extends TwoDirectionNode> {
    head: Header<TN>;
    tail: Tailer<TN>;
}
interface Header<TN extends TwoDirectionNode> {
    next: TN;
    heading: true;
    parentSeq: List<TN>;
}
interface Tailer<TN extends TwoDirectionNode> {
    previous: TN;
    tailing: true;
    parentSeq: List<TN>;
}
type TypeOrHeader<T extends TwoDirectionNode> = Header<T> | T;
type TypeOrTailer<T extends TwoDirectionNode> = Tailer<T> | T;
declare const connect: <T>(foreNode: ListNode<T>, lateNode: ListNode<T>) => void;
declare const rgba: (r: number, g: number, b: number, a: number) => string;
declare const rgb: (r: number, g: number, b: number) => string;
/** @deprecated */
declare const toTimeString: (beaT: TimeT) => string;
declare function drawLine(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number): void;
/**
 *
 * @param context
 * @param startX
 * @param startY
 * @param endX
 * @param endY
 * @param cp1x control point 1
 * @param cp1y
 * @param cp2x
 * @param cp2y
 */
declare function drawBezierCurve(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number): void;
/**
 * To assign the same handler for different event types on an element
 * @param eventTypes array of strings representing the types
 * @param element
 * @param handler
 */
declare function on<K extends keyof HTMLElementEventMap>(eventTypes: K[], element: HTMLElement, handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): void;
/**
 * to print a two-directional node list
 * @param list
 */
declare function printList<T extends TwoDirectionNode>(list: List<T>): void;
type Vector = [x: number, y: number];
/**
 * to compute the length of a vector
 * @param v
 * @returns length
 */
declare const absVector: (v: Vector) => number;
/**
 *
 * @param v1
 * @param v2
 * @returns
 */
declare const innerProduct: (v1: Vector, v2: Vector) => number;
/**
 * To get offset coordinates from mouse or touch
 * @param event
 * @param element
 * @returns
 */
declare const getOffsetCoordFromEvent: (event: MouseEvent | TouchEvent, element: HTMLElement) => [number, number];
declare function saveTextToFile(text: string, filename: string): void;
declare function shortenFloat(num: number, decimalPlaces: number): number;
declare function changeAudioTime(audio: HTMLAudioElement, delta: number): void;
declare class OperationList extends EventTarget {
    parentChart: Chart;
    operations: Operation[];
    undoneOperations: Operation[];
    constructor(parentChart: Chart);
    undo(): void;
    redo(): void;
    do(operation: Operation): void;
}
declare abstract class Operation {
    ineffective: boolean;
    updatesEditor: boolean;
    constructor();
    abstract do(): void;
    abstract undo(): void;
    rewrite(op: typeof this): boolean;
}
declare class ComplexOperation<T extends Operation[]> extends Operation {
    subOperations: T;
    length: number;
    constructor(...sub: T);
    do(): void;
    undo(): void;
}
type NoteValueField = "speed" | "type" | "positionX" | "startTime" | "endTime" | "alpha" | "size";
declare class NoteValueChangeOperation<T extends NoteValueField> extends Operation {
    field: T;
    note: Note;
    previousValue: Note[T];
    value: Note[T];
    updatesEditor: boolean;
    constructor(note: Note, field: T, value: Note[T]);
    do(): void;
    undo(): void;
    rewrite(operation: NoteValueChangeOperation<T>): boolean;
}
declare class NoteRemoveOperation extends Operation {
    noteNode: NoteNode;
    note: Note;
    isHold: boolean;
    constructor(note: Note);
    do(): void;
    undo(): void;
}
/**
 * 删除一个note
 * 从语义上删除Note要用这个操作
 * 结果上，这个会更新编辑器
 */
declare class NoteDeleteOperation extends NoteRemoveOperation {
    updatesEditor: boolean;
}
declare class MultiNoteDeleteOperation extends ComplexOperation<NoteDeleteOperation[]> {
    updatesEditor: boolean;
    constructor(notes: Set<Note> | Note[]);
}
declare class NoteAddOperation extends Operation {
    noteNode: NoteNode;
    note: Note;
    isHold: boolean;
    updatesEditor: boolean;
    constructor(note: Note, node: NoteNode);
    do(): void;
    undo(): void;
}
declare class MultiNoteAddOperation extends ComplexOperation<NoteAddOperation[]> {
    updatesEditor: boolean;
    constructor(notes: Set<Note> | Note[], judgeLine: JudgeLine);
}
declare class NoteTimeChangeOperation extends ComplexOperation<[NoteRemoveOperation, NoteValueChangeOperation<"startTime">, NoteAddOperation]> {
    note: Note;
    updatesEditor: boolean;
    constructor(note: Note, noteNode: NoteNode);
    rewrite(operation: NoteTimeChangeOperation): boolean;
}
declare class HoldEndTimeChangeOperation extends NoteValueChangeOperation<"endTime"> {
    constructor(note: Note, value: TimeT);
    do(): void;
    undo(): void;
    rewrite(operation: HoldEndTimeChangeOperation): boolean;
}
declare class NoteSpeedChangeOperation extends ComplexOperation<[NoteValueChangeOperation<"speed">, NoteRemoveOperation, NoteAddOperation]> {
    updatesEditor: boolean;
    originalTree: NNList;
    judgeLine: JudgeLine;
    targetTree: NNList;
    constructor(note: Note, value: number, line: JudgeLine);
}
declare class NoteTypeChangeOperation extends ComplexOperation</*[NoteValueChangeOperation<"type">, NoteInsertOperation]*/ any> {
    updatesEditor: boolean;
    constructor(note: Note, value: number);
}
declare class NoteTreeChangeOperation extends NoteAddOperation {
}
declare class EventNodePairRemoveOperation extends Operation {
    updatesEditor: boolean;
    endNode: EventEndNode;
    startNode: EventStartNode;
    sequence: EventNodeSequence;
    originalPrev: EventStartNode;
    constructor(node: EventStartNode);
    do(): void;
    undo(): void;
}
/**
 * 将一对孤立的节点对插入到一个开始节点之后的操作。
 * 如果这个节点对的时刻与节点对的时刻相同，那么该节点对将不会被插入。
 * 而是把原来开始节点的值修改。
 */
declare class EventNodePairInsertOperation extends Operation {
    updatesEditor: boolean;
    node: EventStartNode;
    tarPrev: EventStartNode;
    originalSequence: EventNodeSequence;
    overlapped: boolean;
    originalValue: number;
    value: number;
    /**
     *
     * @param node the node to insert
     * @param targetPrevious The node to insert before, accessed through EventNodeSequence.getNodeAt(TC.toBeats(node))
     * If the targetPrevious's time is the same as node's time, the node will not be inserted,
     * and the targetPrevious' value will be replaced with the node's value.
     */
    constructor(node: EventStartNode, targetPrevious: EventStartNode);
    do(): void;
    undo(): void;
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
declare class MultiNodeAddOperation extends ComplexOperation<EventNodePairInsertOperation[]> {
    updatesEditor: boolean;
    nodes: EventStartNode[];
    constructor(nodes: EventStartNode[], seq: EventNodeSequence);
}
declare class MultiNodeDeleteOperation extends ComplexOperation<EventNodePairRemoveOperation[]> {
    updatesEditor: boolean;
    constructor(nodes: EventStartNode[]);
}
declare class EventNodeValueChangeOperation extends Operation {
    updatesEditor: boolean;
    node: EventNode;
    value: number;
    originalValue: number;
    constructor(node: EventNode, val: number);
    do(): void;
    undo(): void;
    rewrite(operation: EventNodeValueChangeOperation): boolean;
}
declare class EventNodeTimeChangeOperation extends Operation {
    updatesEditor: boolean;
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
    constructor(node: EventStartNode | EventEndNode, val: TimeT);
    do(): void;
    undo(): void;
}
declare class EventNodeInnerEasingChangeOperation extends Operation {
    updatesEditor: boolean;
    startNode: EventStartNode;
    value: Easing;
    originalValue: Easing;
    constructor(node: EventStartNode | EventEndNode, val: Easing);
    do(): void;
    undo(): void;
}
declare class EventNodeEasingChangeOperation extends Operation {
    updatesEditor: boolean;
    startNode: EventStartNode;
    value: Easing;
    originalValue: Easing;
    constructor(node: EventStartNode | EventEndNode, val: Easing);
    do(): void;
    undo(): void;
}
declare class EncapsuleOperation extends ComplexOperation<[MultiNodeDeleteOperation, EventNodeEasingChangeOperation, EventNodeValueChangeOperation]> {
    updatesEditor: boolean;
    constructor(nodes: EventStartNode[], easing: TemplateEasing);
}
declare enum EncapsuleErrorType {
    NotBelongToSourceSequence = 1,
    NotContinuous = 2,
    ZeroDelta = 3
}
/**
 * 将一些来自sourceSequence的节点打包为一个用于模板缓动的事件序列
 * 然后把sourceSequence中的源节点集合替换为单个使用了该模板的事件
 * @param sourceSequence
 * @param sourceNodes
 */
declare function encapsule(templateEasingLib: TemplateEasingLib, sourceSequence: EventNodeSequence, sourceNodes: Set<EventStartNode>, name: string): EncapsuleErrorType | EncapsuleOperation;
declare abstract class SideEditor<T extends object> extends Z<"div"> {
    element: HTMLDivElement;
    $title: Z<"div">;
    $body: Z<"div">;
    _target: WeakRef<T>;
    get target(): T;
    set target(val: T);
    abstract update(): void;
    constructor();
}
declare class NoteEditor extends SideEditor<Note> {
    $time: ZFractionInput;
    $endTime: ZFractionInput;
    $type: ZDropdownOptionBox;
    $position: ZInputBox;
    $dir: ZDropdownOptionBox;
    $speed: ZInputBox;
    $alpha: ZInputBox;
    $size: ZInputBox;
    $delete: ZButton;
    aboveOption: BoxOption;
    belowOption: BoxOption;
    noteTypeOptions: BoxOption[];
    constructor();
    update(): void;
}
declare class MultiNoteEditor extends SideEditor<Set<Note>> {
    $reverse: ZButton;
    $delete: ZButton;
    constructor();
    update(): void;
}
declare class MultiNodeEditor extends SideEditor<Set<EventStartNode>> {
    $reverse: ZButton;
    $delete: ZButton;
    constructor();
    update(): void;
}
declare class EventEditor extends SideEditor<EventStartNode | EventEndNode> {
    $time: ZFractionInput;
    $value: ZInputBox;
    $easing: ZEasingBox;
    $radioTabs: ZRadioTabs;
    $templateEasing: ZInputBox;
    $delete: ZButton;
    constructor();
    setNormalEasing(id: number): void;
    setTemplateEasing(name: string): void;
    update(): void;
}
type PositionEntity<T> = {
    target: T;
    left: number;
    top: number;
    height: number;
    width: number;
    priority: number;
} | {
    target: T;
    centerX: number;
    centerY: number;
    height: number;
    width: number;
    priority: number;
    rad?: number;
};
declare const pointIsInRect: (x: number, y: number, rectTop: number, rectLeft: number, width: number, height: number) => boolean;
declare class SelectionManager<T> {
    positions: PositionEntity<T>[];
    constructor();
    refresh(): void;
    add(entity: PositionEntity<T>): {
        annotate: (context: CanvasRenderingContext2D, canvasX: number, canvasY: number) => void;
    };
    click(Coordinate: Coordinate): undefined | PositionEntity<T>;
    click(x: number, y: number): undefined | PositionEntity<T>;
    /**
     * For PositionEntities whose centerXY is given, this method only examine whether the center is in the rect.
     * For PositionEntities whose left, top is given, this method also examine whether the pos rect is in the rect.
     * @param top
     * @param left
     * @param right
     * @param bottom
     * @returns
     */
    selectScope(top: number, left: number, bottom: number, right: number): PositionEntity<T>[];
}
declare const eventTypeMap: {
    basis: number;
    valueGridSpan: number;
    valueRange: number;
}[];
type EventTypeName = "moveX" | "moveY" | "alpha" | "rotate" | "speed" | "easing" | "bpm";
declare enum NewNodeState {
    controlsStart = 0,
    controlsEnd = 1,
    controlsBoth = 2
}
declare class EventCurveEditors extends Z<"div"> {
    element: HTMLDivElement;
    $bar: Z<"div">;
    $typeSelect: ZDropdownOptionBox;
    $layerSelect: ZDropdownOptionBox;
    $timeSpanInput: ZInputBox;
    $editSwitch: ZSwitch;
    $easingBox: ZEasingBox;
    $newNodeStateSelect: ZDropdownOptionBox;
    $encapsuleBtn: ZButton;
    $templateNameInput: ZInputBox;
    $selectOption: ZDropdownOptionBox;
    selectState: SelectState;
    $copyButton: ZButton;
    $pasteButton: ZButton;
    moveX: EventCurveEditor;
    moveY: EventCurveEditor;
    alpha: EventCurveEditor;
    rotate: EventCurveEditor;
    speed: EventCurveEditor;
    easing: EventCurveEditor;
    bpm: EventCurveEditor;
    lastBeats: number;
    easingBeats: number;
    clipboard: Set<EventStartNode>;
    nodesSelection: Set<EventStartNode>;
    constructor(width: number, height: number);
    _selectedEditor: EventCurveEditor;
    get selectedEditor(): EventCurveEditor;
    set selectedEditor(val: EventCurveEditor);
    _selectedLayer: "0" | "1" | "2" | "3" | "ex";
    get selectedLayer(): "0" | "1" | "2" | "3" | "ex";
    set selectedLayer(val: "0" | "1" | "2" | "3" | "ex");
    draw(beats?: number): void;
    target: JudgeLine;
    changeTarget(target: JudgeLine): void;
}
type NodePosition = {
    node: EventNode;
    x: number;
    y: number;
};
declare enum EventCurveEditorState {
    select = 0,
    selecting = 1,
    edit = 2,
    flowing = 3,
    selectScope = 4,
    selectingScope = 5
}
declare class EventCurveEditor {
    type: EventType;
    target: EventNodeSequence;
    targetEasing?: TemplateEasing;
    parentEditorSet: EventCurveEditors;
    innerHeight: number;
    innerWidth: number;
    $element: Z<"div">;
    element: HTMLDivElement;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    valueRatio: number;
    timeRatio: number;
    valueRange: number;
    /**
     * (distance from the horizontal axis to the middle axis) / height
     */
    valueBasis: number;
    timeRange: number;
    timeGridSpan: number;
    valueGridSpan: number;
    timeGridColor: RGB;
    valueGridColor: RGB;
    padding: number;
    lastBeats: number;
    selectionManager: SelectionManager<EventNode>;
    state: EventCurveEditorState;
    wasEditing: boolean;
    _selectedNode: WeakRef<EventStartNode | EventEndNode>;
    pointedValue: number;
    pointedBeats: number;
    beatFraction: number;
    easing: NormalEasing;
    newNodeState: NewNodeState;
    selectState: SelectState;
    mouseIn: boolean;
    startingPoint: Coordinate;
    startingCanvasPoint: Coordinate;
    canvasPoint: Coordinate;
    get selectedNode(): EventStartNode | EventEndNode;
    set selectedNode(val: EventStartNode | EventEndNode);
    private _active;
    /** @deprecated use active instead */
    get displayed(): boolean;
    set displayed(val: boolean);
    get active(): boolean;
    set active(val: boolean);
    constructor(type: EventType, height: number, width: number, parent: EventCurveEditors);
    matrix: Matrix;
    invertedMatrix: Matrix;
    canvasMatrix: Matrix;
    invertedCanvasMatrix: Matrix;
    updateMatrix(): void;
    appendTo(parent: HTMLElement): void;
    downHandler(event: MouseEvent | TouchEvent): void;
    upHandler(event: MouseEvent | TouchEvent): void;
    initContext(): void;
    drawCoordination(beats: number): void;
    draw(beats?: number): void;
    changeTarget(line: JudgeLine, index: number): void;
    paste(): void;
    copy(): void;
}
declare const DRAWS_NN = true;
declare const COLOR_1 = "#66ccff";
declare const COLOR_2 = "#ffcc66";
declare const HEAD = 1;
declare const BODY = 2;
declare const TAIL = 3;
/**
 * 用于Note编辑器记录其中的音符贴图位置
 */
type NotePosition = {
    note: Note;
    x: number;
    y: number;
    height: number;
    type: 1 | 2 | 3;
};
declare enum NotesEditorState {
    select = 0,
    selecting = 1,
    edit = 2,
    selectScope = 3,
    selectingScope = 4,
    flowing = 5
}
declare class HoldTail {
    note: Note;
    constructor(note: Note);
}
declare const timeToString: (time: TimeT) => string;
declare enum SelectState {
    none = 0,
    extend = 1,
    replace = 2,
    exclude = 3
}
declare class NotesEditor extends Z<"div"> {
    editor: Editor;
    $statusBar: Z<"div">;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    _target: JudgeLine;
    targetTree?: NNList;
    positionBasis: number;
    positionRatio: number;
    positionGridSpan: number;
    positionSpan: number;
    timeRatio: number;
    timeGridSpan: number;
    timeSpan: number;
    padding: number;
    timeGridColor: RGB;
    positionGridColor: RGB;
    selectionManager: SelectionManager<Note | HoldTail>;
    startingPoint: Coordinate;
    startingCanvasPoint: Coordinate;
    canvasPoint: Coordinate;
    notesSelection: Set<Note>;
    clipboard: Set<Note>;
    selectingTail: boolean;
    state: NotesEditorState;
    selectState: SelectState;
    wasEditing: boolean;
    pointedPositionX: number;
    pointedBeats: number;
    beatFraction: number;
    noteType: NoteType;
    noteAbove: boolean;
    drawn: boolean;
    lastBeats: number;
    $optionBox: ZEditableDropdownOptionBox;
    $typeOption: ZDropdownOptionBox;
    $noteAboveOption: ZDropdownOptionBox;
    $selectOption: ZDropdownOptionBox;
    $copyButton: ZButton;
    $pasteButton: ZButton;
    $editButton: ZSwitch;
    allOption: EditableBoxOption;
    mouseIn: boolean;
    get target(): JudgeLine;
    set target(line: JudgeLine);
    constructor(editor: Editor, width: number, height: number);
    downHandler(event: TouchEvent | MouseEvent): void;
    upHandler(event: any): void;
    _selectedNote: WeakRef<Note>;
    get selectedNote(): Note;
    set selectedNote(val: Note);
    matrix: Matrix;
    invertedMatrix: Matrix;
    canvasMatrix: Matrix;
    invertedCanvasMatrix: Matrix;
    updateMatrix(): void;
    init(): void;
    drawCoordination(beats: number): void;
    draw(beats?: number): void;
    drawNNList(tree: NNList, beats: number): void;
    drawNote(beats: number, note: Note, isTruck: boolean, nth: number): void;
    paste(): void;
    copy(): void;
}
declare const NODE_WIDTH = 20;
declare const NODE_HEIGHT = 20;
declare const NOTE_WIDTH = 54;
declare const NOTE_HEIGHT = 6;
declare const round: (n: number, r: number) => string;
declare class JudgeLinesEditor {
    editor: Editor;
    chart: Chart;
    element: HTMLDivElement;
    editors: JudgeLineEditor[];
    metaLineAdded: boolean;
    constructor(editor: Editor, element: HTMLDivElement);
    _selectedLine: JudgeLineEditor;
    get selectedLine(): JudgeLineEditor;
    set selectedLine(lineEditor: JudgeLineEditor);
    addJudgeLine(judgeLine: JudgeLine): void;
    update(): void;
}
declare class JudgeLineEditor {
    linesEditor: JudgeLinesEditor;
    element: HTMLDivElement;
    judgeLine: JudgeLine;
    $id: Z<"div">;
    $name: ZInputBox;
    $xSpan: Z<"span">;
    $ySpan: Z<"span">;
    $thetaSpan: Z<"span">;
    $alphaSpan: Z<"span">;
    constructor(linesEditor: JudgeLinesEditor, judgeLine: JudgeLine);
    update(): void;
}
declare class SaveDialog extends ZDialog {
    $message: ZInputBox;
    chartData: ChartDataKPA;
    constructor();
}
declare const tips: string[];
declare const generateTipsLabel: () => Z<"div">;
declare class Editor extends EventTarget {
    initialized: boolean;
    chartInitialized: boolean;
    audioInitialized: boolean;
    imageInitialized: boolean;
    player: Player;
    notesEditor: NotesEditor;
    eventEditor: EventEditor;
    chart: Chart;
    operationList?: OperationList;
    chartType: "rpejson" | "kpajson";
    chartData: ChartDataRPE | ChartDataKPA;
    progressBar: ZProgressBar;
    eventCurveEditors: EventCurveEditors;
    $topbar: Z<"div">;
    $preview: Z<"div">;
    $noteInfo: Z<"div">;
    $eventSequence: Z<"div">;
    lineInfoEle: HTMLDivElement;
    playButton: HTMLButtonElement;
    $timeDivisor: ZArrowInputBox;
    timeDivisor: number;
    $saveButton: ZButton;
    $compileButton: ZButton;
    $playbackRate: ZDropdownOptionBox;
    $offsetInput: ZInputBox;
    $tipsLabel: Z<"div">;
    judgeLinesEditor: JudgeLinesEditor;
    selectedLine: JudgeLine;
    noteEditor: NoteEditor;
    multiNoteEditor: MultiNoteEditor;
    multiNodeEditor: MultiNodeEditor;
    renderingTime: number;
    lastRenderingTime: number;
    $saveDialog: SaveDialog;
    constructor();
    shownSideEditor: SideEditor<any>;
    switchSide(editor: SideEditor<any>): void;
    checkAndInit(): void;
    readChart(file: Blob): void;
    loadChart(): void;
    initFirstFrame(): void;
    readAudio(file: Blob): void;
    readImage(file: Blob): void;
    update(): void;
    updateEventSequences(): void;
    updateNotesEditor(): void;
    updateShownEditor(): void;
    get playing(): boolean;
    play(): void;
    pause(): void;
    static notify(message: string): void;
}
/**
 * 全生命周期只会编译一次，想多次就再构造一个
 */
declare class RPEChartCompiler {
    chart: Chart;
    sequenceMap: Map<EventNodeSequence, EventNodeSequence>;
    constructor(chart: Chart);
    compileChart(): ChartDataRPE;
    dumpJudgeLine(judgeLine: JudgeLine): JudgeLineDataRPE;
    dumpEventNodeSequence(sequence: EventNodeSequence): EventDataRPE[];
    compileNNLists(nnLists: NNList[], hnLists: HNList[]): NoteDataRPE[];
    /**
     * 倒序转换为数组
     * @param nnList
     * @returns
     */
    nnListToArray(nnList: NNList): NoteDataRPE[];
    /**
     * 将当前序列中所有通过模板缓动引用了其他序列的事件直接展开为被引用的序列内容
     * transform all events that reference other sequences by template easing
     * into the content of the referenced sequence
     * 有点类似于MediaWiki的{{subst:templateName}}
     * @param map 由TemplateEasingLib提供
     * @returns
     */
    substitute(seq: EventNodeSequence): EventNodeSequence;
}
declare class Coordinate {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number);
    mul(matrix: Matrix): Coordinate;
    static from([x, y]: [number, number]): Coordinate;
}
declare class Matrix {
    readonly a: number;
    readonly b: number;
    readonly c: number;
    readonly d: number;
    readonly e: number;
    readonly f: number;
    constructor(a: number, b: number, c: number, d: number, e: number, f: number);
    rotate(angle: number): Matrix;
    translate(x: number, y: number): Matrix;
    scale(x: number, y: number): Matrix;
    invert(): Matrix;
    xmul(x: number, y: number): number;
    ymul(x: number, y: number): number;
    static fromDOMMatrix({ a, b, c, d, e, f }: DOMMatrix): Matrix;
}
declare const identity: Matrix;
/**
 * 使用AudioBuffer加快播放
 */
declare class AudioProcessor {
    audioContext: AudioContext;
    initialized: boolean;
    tap: AudioBuffer;
    drag: AudioBuffer;
    flick: AudioBuffer;
    constructor();
    init(): void;
    fetchAudioBuffer(path: string): Promise<AudioBuffer>;
    play(buffer: AudioBuffer): void;
    playNoteSound(type: NoteType): void;
}
declare const TAP: HTMLImageElement;
declare const DRAG: HTMLImageElement;
declare const FLICK: HTMLImageElement;
declare const HOLD: HTMLImageElement;
declare const HOLD_HEAD: HTMLImageElement;
declare const HOLD_BODY: HTMLImageElement;
declare const DOUBLE: HTMLImageElement;
declare const BELOW: HTMLImageElement;
declare const ANCHOR: HTMLImageElement;
declare const NODE_START: HTMLImageElement;
declare const NODE_END: HTMLImageElement;
declare const HIT_FX: HTMLImageElement;
declare const SELECT_NOTE: HTMLImageElement;
declare const TRUCK: HTMLImageElement;
declare const drawNthFrame: (context: CanvasRenderingContext2D, nth: number, dx: number, dy: number, dw: number, dh: number) => void;
declare const getImageFromType: (noteType: NoteType) => HTMLImageElement;
declare const ENABLE_PLAYER = true;
declare const DRAWS_NOTES = true;
declare const DEFAULT_ASPECT_RATIO: number;
declare const LINE_WIDTH = 10;
declare const LINE_COLOR = "#CCCC77";
declare const HIT_EFFECT_SIZE = 200;
declare const HALF_HIT: number;
declare const RENDER_SCOPE = 900;
declare const getVector: (theta: number) => [Vector, Vector];
declare class Player {
    editor: Editor;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    hitCanvas: HTMLCanvasElement;
    hitContext: CanvasRenderingContext2D;
    chart: Chart;
    audio: HTMLAudioElement;
    audioProcessor: AudioProcessor;
    playing: boolean;
    background: HTMLImageElement;
    aspect: number;
    noteSize: number;
    noteHeight: number;
    soundQueue: SoundEntity[];
    lastBeats: number;
    greenLine: number;
    constructor(canvas: HTMLCanvasElement, editor: Editor);
    get time(): number;
    get beats(): number;
    initCoordinate(): void;
    renderDropScreen(): void;
    renderGreyScreen(): void;
    initGreyScreen(): void;
    render(): void;
    renderLine(baseX: number, baseY: number, judgeLine: JudgeLine): void;
    renderSounds(tree: NNList, beats: number, soundQueue: SoundEntity[], timeCalculator: TimeCalculator): void;
    renderHitEffects(judgeLine: JudgeLine, tree: NNList, startBeats: number, endBeats: number, hitContext: CanvasRenderingContext2D, timeCalculator: TimeCalculator): void;
    /**
     *
     * @param judgeLine
     * @param tree
     * @param beats 当前拍数
     * @param startBeats
     * @param endBeats 截止拍数
     * @param hitContext
     * @param timeCalculator
     * @returns
     */
    renderHoldHitEffects(judgeLine: JudgeLine, tree: HNList, beats: number, startBeats: number, endBeats: number, hitContext: CanvasRenderingContext2D, timeCalculator: TimeCalculator): void;
    renderSameTimeNotes(noteNode: NoteNode, chord: boolean, judgeLine: JudgeLine, timeCalculator: TimeCalculator): void;
    renderNote(note: Note, chord: boolean, positionY: number, endpositionY?: number): void;
    private update;
    play(): void;
    pause(): void;
}
declare class ZProgressBar extends Z<"progress"> {
    target: HTMLAudioElement;
    constructor(target: HTMLAudioElement, pauseFn: () => void, updateFn: () => void);
    update(): void;
}
declare class SoundEntity {
    type: NoteType;
    beats: number;
    seconds: number;
    constructor(type: NoteType, beats: number, timeCalculator: TimeCalculator);
}
declare class ChartMetadata {
    name: string;
    song: string;
    picture: string;
    chart: string;
    constructor(name: string, song: string, picture: string, chart: string);
    static fromJson(json: any): ChartMetadata;
    toJson(): string;
}
/**
 * 运行时位置是kpa/dist
 */
declare class ServerApi {
    supportsServer: boolean;
    statusPromise: Promise<boolean>;
    chartId: string;
    constructor();
    getChart(id: string): Promise<void>;
    uploadChart(chart: ChartDataKPA, message: string): Promise<boolean>;
    autosave(chart: ChartDataKPA): Promise<boolean>;
    startAutosave(): void;
}
interface SettingEntries {
    lineColor: [number, number, number];
    playerShowInfo: boolean;
}
declare class Settings {
    cache: SettingEntries;
    constructor();
    get<K extends keyof SettingEntries>(item: K): SettingEntries[K];
    set<K extends keyof SettingEntries>(item: K, val: SettingEntries[K]): void;
}
