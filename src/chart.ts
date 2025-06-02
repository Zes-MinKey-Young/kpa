
enum NoteType {
    tap=1,
    drag=4,
    flick=3,
    hold=2
}

/** 尽管JSON中有布尔值字面量，RPEJSON中没有使用它 */
type Bool = 1 | 0
/** 三元组，用带分数表示的时间 */
type TimeT = [number, number, number]

interface ChartDataRPE {
    /** BPM列表 */
    BPMList: BPMSegmentData[];
    /** 元数据 */
    META: MetaData;
    /** 判定线组 */
    judgeLineGroup: string[];
    /** 判定线列表 */
    judgeLineList: JudgeLineDataRPE[];
}

interface BPMSegmentData {
    bpm: number;
    startTime: TimeT;
    // endTime?: TimeT;
}
interface MetaData {
    /** RPE版本（int） */
    RPEVersion: number;
    /** 背景图片路径 */
    background: string;
    /** 谱师名称 */
    charter: string;
    /** 曲师名称 */
    composer: string;
    /** 谱面ID，即Resources文件夹下的文件夹名称 */
    id: string;
    /** 谱面难度 */
    level: string;
    /** 谱面名称 */
    name: string;
    /** 谱面偏移（以毫秒计量） */
    offset: number;
    /** 音乐文件路径 */
    song: string;
    /** 音乐时长（1.6(存疑)新增） */
    duration?: number;
}

interface NoteDataRPE {
    /** 音符是否在判定线上方 （2为下方） */
    above: Bool | 2;
    /** 音符不透明度 */
    alpha: number;
    /** 音符结束时间，无论是否为Hold都有该属性 */
    endTime: TimeT;
    /** 音符是否为假 */
    isFake: Bool;
    /** 音符在判定线上落点位置 */
    positionX: number;
    /** 音符大小（默认1.0） */
    size: number;
    /** 音符速度 */
    speed: number;
    /** 音符开始时间 */
    startTime: TimeT;
    /** 音符类型（1 为 Tap，2 为 Hold，3 为 Flick，4 为 Drag）*/
    type: NoteType;
    /** 音符可视时间（打击前多少秒开始显现，默认99999.0） */
    visibleTime: number;
    /** y值偏移，使音符被打击时的位置偏离判定线 */
    yOffset: number
}

/** 事件 */
interface EventDataRPE<T = number> {
    /** 是否使用贝塞尔曲线 */
    bezier: Bool;
    /** 贝塞尔控制点 */
    bezierPoints: [number, number, number, number];
    /** 截取缓动左边界 */
    easingLeft: number;
    /** 截取缓动右边界 */
    easingRight: number;
    /** 缓动类型 */
    easingType: number;
    /** 结束值 */
    end: T;
    /** 结束时间 */
    endTime: TimeT;
    /** 链接组 */
    linkgroup: number;
    /** 开始值 */
    start: T;
    /** 开始时间 */
    startTime: TimeT;
}

/**
 * 五个种类的事件的start/end含义：
 * X/Y方向移动：像素
 * 旋转：角度（以度计）
 * 不透明度改变：不透明度（0-255的整数）
 * 速度改变：RPE速度单位（每个单位代表每秒下降120px）
 */

/** 每条判定线的前四个事件层级。第五个是特殊事件，这里没有列入 */
interface EventLayerDataRPE {
    moveXEvents: EventDataRPE[];
    moveYEvents: EventDataRPE[];
    rotateEvents: EventDataRPE[];
    alphaEvents: EventDataRPE[];
    speedEvents: EventDataRPE[];
}



interface Control {
    easing: number;
    x: number;
}

interface AlphaControl extends Control {
    alpha: number;
}
interface PosControl extends Control {
    pos: number;
}
interface SizeControl extends Control {
    size: number;
}
interface SkewControl extends Control {
    skew: number;
}
interface YControl extends Control {
    y: number;
}

/** 判定线 */
interface JudgeLineDataRPE {
    _id?: number;
    /** 音符数据
     * 对音符的顺序没有要求，但RPE生成的标准RPEJSON中应当按照时间升序排列，
     * 且非Hold类型与Hold分开排列，非Hold在前
     */
    notes: NoteDataRPE[];
    /** 所在的判定线组，对应judgeLineGroup数组中的字符串的下标 */
    Group: number;
    /** 线名 */
    Name: string;
    /** 纹理图片的路径 */
    Texture: string;
    alphaControl: AlphaControl[];
    /** BPM因数 */
    bpmfactor: 1.0;
    /** 事件层级，这里没有介绍第五个 */
    eventLayers: [EventLayerDataRPE, EventLayerDataRPE, EventLayerDataRPE, EventLayerDataRPE];
    /** 扩展事件 */
    extended: {
        colorEvents: EventDataRPE<RGB>[];
        inclineEvents: EventDataRPE[];
        scaleXEvents: EventDataRPE[];
        scaleYEvents: EventDataRPE[];
        textEvents: EventDataRPE<string>[];
    };
    /** 父线线号，没有父线则为-1 */
    father: number;
    /** 有无遮罩 */
    isCover: Bool;
    /** 音符数量 */
    numOfNotes: number;

    posControl: PosControl[];
    sizeControl: SizeControl[];
    skewControl: SkewControl[];
    yControl: YControl[];
    /** z轴顺序，决定重叠的顺序 */
    zOrder: number;

    /** 背景是否为GIF */
    isGif: Bool;
    attachUI: "combonumber" | "pause";
}

interface JudgeLineDataRPEExtended extends JudgeLineDataRPE {
    _id?: number;
    children: number[]
}

interface CustomEasingData {
    content: string;
    name: string;
    usedBy: string[];
    dependencies: string[];
}


interface EventLayerDataKPA {
    moveX: string;
    moveY: string;
    rotate: string;
    alpha: string;
    speed: string;
}


interface NoteNodeDataKPA {
    notes: NoteDataRPE[];
    startTime: TimeT;
}

interface NNListDataKPA {
    speed: number;
    noteNodes: NoteNodeDataKPA[];
}

interface JudgeLineDataKPA {
    id: number;
    group: number;
    nnLists: {[k: string]: NNListDataKPA};
    hnLists: {[k: string]: NNListDataKPA};
    // Group: number;
    Name: string;
    Texture: string;
    // alphaControl: Array<any>; // ?
    // bpmfactor: 1.0;
    eventLayers: EventLayerDataKPA[];
    children: JudgeLineDataKPA[];
    // extended: {inclineEvents: EventDataRPE[]};
    // father: number;
    // children: number[];
    // isCover: Bool;
    // numOfNotes: number;
    // posControl: any[];
    // sizeControl: any[];
    // skewControl: any[];
    // yControl: any[];
    // zOrder: number;
}



interface EventNodeSequenceDataKPA {
    nodes: EventDataRPE[];
    id: string;
    type: EventType;
}

interface ChartDataKPA {
    offset: number;
    duration: number;
    info: {
        level: string;
        name: string
    }
    envEasings: CustomEasingData[]; // New!
    eventNodeSequences: EventNodeSequenceDataKPA[];
    orphanLines: JudgeLineDataKPA[];
    bpmList: BPMSegmentData[];
    judgeLineGroups: string[];
}

/**
 * 相当于 Python 推导式
 * @param arr 
 * @param expr 
 * @param guard 
 * @returns 
 */
function arrayForIn<T, RT>(arr: T[], expr: (v: T) => RT, guard?: (v: T) => boolean): RT[] {
    let ret: RT[] = []
    for (let each of arr) {
        if (!guard || guard && guard(each)) {
            ret.push(expr(each))
        }
    }
    return ret;
}

type Plain<T> = {[k: string]: T}

/**
 * 相当于 Python 推导式
 * @param obj
 * @param expr 
 * @param guard 
 * @returns 
 */
 function dictForIn<T, RT>(obj: Plain<T>, expr: (v: T) => RT, guard?: (v: T) => boolean): Plain<RT> {
    let ret: Plain<RT> = {}
    for (let key in obj) {
        const each = obj[key]
        if (!guard || guard && guard(each)) {
            ret[key] = expr(each)
        }
    }
    return ret;
}


interface EventLayer {
    moveX?: EventNodeSequence;
    moveY?: EventNodeSequence;
    rotate?: EventNodeSequence;
    alpha?: EventNodeSequence;
    speed?: EventNodeSequence;
}

/**
 * 根据Note的速度存储在不同字段
interface NoteSpeeds {
    [key: number]: Note[]
}

 */

/*
interface ComboMapping {
    [beat: /*`${number}:${number}/${number}`* / string]: ComboInfoEntity
}
//*/

class Chart {
    judgeLines: JudgeLine[];
    bpmList: BPMSegmentData[];
    timeCalculator: TimeCalculator;
    orphanLines: JudgeLine[];
    // comboMapping: ComboMapping;
    name: string;
    level: string;
    offset: number;
    
    /** initialized in constructor */
    templateEasingLib: TemplateEasingLib;
    /** initialized in constructor */
    operationList: OperationList;
    /** initialized in constructor */
    sequenceMap: Plain<EventNodeSequence>;

    effectiveBeats: number;
    nnnList: NNNList;
    /**  */
    judgeLineGroups: JudgeLineGroup[];
    duration: number;
    constructor() {
        this.timeCalculator = new TimeCalculator();
        this.judgeLines = [];
        this.orphanLines = [];
        this.templateEasingLib = new TemplateEasingLib(this);
        // this.comboMapping = {};
        this.name = "uk";
        this.level = "uk";
        this.offset = 0;
        this.sequenceMap = {}

        this.operationList = new OperationList()
    }
    getEffectiveBeats() {
        console.log(editor.player.audio.src)
        const effectiveBeats = this.timeCalculator.secondsToBeats(this.duration)
        console.log(effectiveBeats)
        this.effectiveBeats = effectiveBeats
        return this.effectiveBeats
    }
    static fromRPEJSON(data: ChartDataRPE, duration: number) {
        let chart = new Chart();
        chart.judgeLineGroups = data.judgeLineGroup.map(group => new JudgeLineGroup(group));
        chart.bpmList = data.BPMList;
        chart.name = data.META.name;
        chart.level = data.META.level;
        chart.offset = data.META.offset;
        chart.duration = duration;
        chart.updateCalculator()
        console.log(chart, chart.getEffectiveBeats())
        chart.nnnList = new NNNList(chart.getEffectiveBeats())
        
        /*
        if (data.envEasings) {
            chart.templateEasingLib.add(...data.envEasings)

        }
        */
        
        // let line = data.judgeLineList[0];
        const judgeLineList: JudgeLineDataRPEExtended[] = <JudgeLineDataRPEExtended[]>data.judgeLineList;
        const length = judgeLineList.length
        const orphanLines: JudgeLineDataRPEExtended[] = [];
        for (let i = 0; i < length; i++) {
            const lineData = data.judgeLineList[i];
            lineData._id = i;
            if (lineData.father === -1) {
                orphanLines.push(<JudgeLineDataRPEExtended>lineData);
                continue;
            }
            const father: JudgeLineDataRPEExtended = <JudgeLineDataRPEExtended>data.judgeLineList[lineData.father];
            const children = father.children || (father.children = []);
            children.push(i);
        }
        const readOne = (lineData: JudgeLineDataRPEExtended) => {
            const line: JudgeLine = JudgeLine.fromRPEJSON(chart, lineData._id, lineData, chart.templateEasingLib, chart.timeCalculator)
            chart.judgeLines.push(line)
            if (lineData.children) {
                for (let each of lineData.children) {
                    const child = readOne(judgeLineList[each]);
                    child.father = line;
                    line.children.push(child)
                }
            }
            return line;
        }
        for (let lineData of judgeLineList) {
            const line = readOne(lineData);
            chart.orphanLines.push(line)
        }
        return chart
    }
    static fromKPAJSON(data: ChartDataKPA) {
        const chart = new Chart();
        chart.bpmList = data.bpmList;
        chart.duration = data.duration;
        chart.name = data.info.name;
        chart.level = data.info.level;
        chart.offset = data.offset;
        chart.updateCalculator()
        chart.nnnList = new NNNList(chart.getEffectiveBeats())
        const sequences = data.eventNodeSequences
        const length = data.eventNodeSequences.length
        for (let i = 0; i < length; i++) {
            const sequence = sequences[i];
            (chart.sequenceMap[sequence.id] = EventNodeSequence.fromRPEJSON(sequence.type, sequence.nodes, chart)).id = sequence.id;
        }
        chart.templateEasingLib.add(data.envEasings)
        chart.templateEasingLib.check()
        for (let lineData of data.orphanLines) {
            const line: JudgeLine = JudgeLine.fromKPAJSON(chart, lineData.id, lineData, chart.templateEasingLib, chart.timeCalculator)
            chart.orphanLines.push(line)
        }

        return chart;
    }
    updateCalculator() {
        this.timeCalculator.bpmList = this.bpmList;
        this.timeCalculator.duration = this.duration;
        this.timeCalculator.update()
    }
    updateEffectiveBeats(duration: number) {
        const EB = this.timeCalculator.secondsToBeats(duration);
        for (let i = 0; i < this.judgeLines.length; i++) {
            const judgeLine = this.judgeLines[i]
            judgeLine.updateEffectiveBeats(EB);
        }
    }
    dumpKPA(): ChartDataKPA {
        const eventNodeSequences = new Set<EventNodeSequence>();
        const orphanLines = [];
        for (let line of this.orphanLines) {
            orphanLines.push(line.dumpKPA(eventNodeSequences, this.judgeLineGroups));
        }
        const envEasings = this.templateEasingLib.dump(eventNodeSequences);
        const eventNodeSequenceData: EventNodeSequenceDataKPA[] = [];
        for (let sequence of eventNodeSequences) {
            eventNodeSequenceData.push(sequence.dump());
        }
        return {
            duration: this.duration,
            bpmList: this.timeCalculator.dump(),
            envEasings: envEasings,
            eventNodeSequences: eventNodeSequenceData,
            info: {
                level: this.level,
                name: this.name
            },
            offset: this.offset,
            orphanLines: orphanLines,
            judgeLineGroups: this.judgeLineGroups.map(g => g.name),
        };
    }
    getJudgeLineGroups(): string[] {
        // 实现分组逻辑（示例实现）
        return Array.from(new Set(
            this.judgeLines.map(line => line.groupId.toString())
        ));
    }
    /*
    getComboInfoEntity(time: TimeT) {
        const key = toTimeString(time);
        if (key in this.comboMapping) {
            return this.comboMapping[key]
        } else {
            return this.comboMapping[key] = new ComboInfoEntity()
        }
    }
    */
    createNNNode(time: TimeT) {
     return new NNNode(time)
    }
}

class JudgeLineGroup {
    constructor(public name: string) {
        this.judgeLines = []
    }
    addJudgeLine(judgeLine: JudgeLine) {
        this.judgeLines.push(judgeLine)
        judgeLine.group = this
    }
    judgeLines: JudgeLine[];
}

/*
class ComboInfoEntity {
    tap: number;
    drag: number;
    holdHead: number;
    flick: number;
    hold: number;
    real: number;
    fake: number;
    realEnd: number;
    previous: TypeOrHeader<ComboInfoEntity>;
    next: TypeOrTailer<ComboInfoEntity>;
    constructor() {
        this.tap = 0;
        this.drag = 0;
        this.holdHead = 0;
        this.hold = 0;
        this.flick = 0;
        this.real = 0;
        this.fake = 0;
        this.realEnd = 0;
    }
    add(note: Note) {
        if (note.isFake) {
            this.fake++
        } else {
            this.real++
        }
        this[NoteType[note.type]]++
    }
    remove(note: Note) {
        if (note.isFake) {
            this.fake--
        } else {
            this.real--
        }
        
        this[NoteType[note.type]]--
    }
}
*/