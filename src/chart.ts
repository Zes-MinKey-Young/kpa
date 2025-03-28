
type Bool = 1 | 0
enum NoteType {
    tap=1,
    drag=4,
    flick=3,
    hold=2
}


type TimeT = [number, number, number]

interface BPMSegmentData {
    bpm: number;
    startTime: TimeT;
    // endTime?: TimeT;
}
interface MetaData {
    RPEVersion: number;
    background: string;
    charter: string;
    composer: string;
    id: string;
    level: string;
    name: string;
    offset: number;
    song: string;
}

interface NoteDataRPE {
    above: Bool | 2;
    alpha: number;
    endTime: TimeT
    isFake: Bool;
    positionX: number;
    size: number;
    speed: number;
    startTime: TimeT;
    type: NoteType;
    visibleTime: number;
    yOffset: number
}

interface EventDataRPE {
    bezier: Bool;
    bezierPoints: [number, number, number, number];
    easingLeft: number;
    easingRight: number;
    easingType: number | string;
    end: number;
    endTime: TimeT;
    linkgroup: number;
    start: number;
    startTime: TimeT;
}

interface EventLayerDataRPE {
    moveXEvents: EventDataRPE[];
    moveYEvents: EventDataRPE[];
    rotateEvents: EventDataRPE[];
    alphaEvents: EventDataRPE[];
    speedEvents: EventDataRPE[];
}

interface EventLayerDataKPA {
    moveX: string;
    moveY: string;
    rotate: string;
    alpha: string;
    speed: string;
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

interface JudgeLineDataRPE {
    _id?: number;
    notes: NoteDataRPE[];
    Group: number;
    Name: string;
    Texture: string;
    alphaControl: AlphaControl[]; // ?
    bpmfactor: 1.0;
    eventLayers: EventLayerDataRPE[];
    extended: {inclineEvents: EventDataRPE[]};
    father: number;
    children: number[];
    isCover: Bool;
    numOfNotes: number;
    posControl: PosControl[];
    sizeControl: SizeControl[];
    skewControl: SkewControl[];
    yControl: YControl[];
    zOrder: number;
}
interface CustomEasingData {
    content: string;
    name: string;
    usedBy: string[];
    dependencies: string[];
}



interface ChartDataRPE {
    BPMList: BPMSegmentData[];
    META: MetaData;
    judgeLineGroup: string[];
    judgeLineList: JudgeLineDataRPE[];
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
    info: {
        level: string;
        name: string
    }
    envEasings: CustomEasingData[]; // New!
    eventNodeSequences: EventNodeSequenceDataKPA[];
    orphanLines: JudgeLineDataKPA[];
    bpmList: BPMSegmentData[];
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
    moveX: EventNodeSequence;
    moveY: EventNodeSequence;
    rotate: EventNodeSequence;
    alpha: EventNodeSequence;
    speed: EventNodeSequence;
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
        this.effectiveBeats = this.timeCalculator.secondsToBeats(editor.player.audio.duration)
        return this.effectiveBeats
    }
    static fromRPEJSON(data: ChartDataRPE) {
        let chart = new Chart();
        chart.bpmList = data.BPMList;
        chart.name = data.META.name;
        chart.level = data.META.level;
        chart.offset = data.META.offset;
        chart.updateCalculator()
        console.log(chart, chart.getEffectiveBeats())
        chart.nnnList = new NNNList(chart.getEffectiveBeats())
        
        /*
        if (data.envEasings) {
            chart.templateEasingLib.add(...data.envEasings)

        }
        */
        
        // let line = data.judgeLineList[0];
        const length = data.judgeLineList.length
        const orphanLines: JudgeLineDataRPE[] = [];
        for (let i = 0; i < length; i++) {
            const lineData = data.judgeLineList[i];
            lineData._id = i;
            if (lineData.father === -1) {
                orphanLines.push(lineData);
                continue;
            }
            const father = data.judgeLineList[lineData.father];
            const children = father.children || (father.children = []);
            children.push(i);
        }
        const readOne = (lineData: JudgeLineDataRPE) => {
            const line: JudgeLine = JudgeLine.fromRPEJSON(chart, lineData._id, lineData, chart.templateEasingLib, chart.timeCalculator)
            chart.judgeLines.push(line)
            if (lineData.children) {
                for (let each of lineData.children) {
                    const child = readOne(data.judgeLineList[each]);
                    child.father = line;
                    line.children.push(child)
                }
            }
            return line;
        }
        for (let lineData of data.judgeLineList) {
            const line = readOne(lineData);
            chart.orphanLines.push(line)
        }
        return chart
    }
    static fromKPAJSON(data: ChartDataKPA) {
        const chart = new Chart();
        chart.bpmList = data.bpmList;
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
        this.timeCalculator.update()
    }
    updateEffectiveBeats(duration: number) {
        const EB = this.timeCalculator.secondsToBeats(duration);
        for (let i = 0; i < this.judgeLines.length; i++) {
            const judgeLine = this.judgeLines[i]
        }
    }
    dumpKPA(): ChartDataKPA {
        const eventNodeSequences = new Set<EventNodeSequence>();
        const orphanLines = [];
        for (let line of this.orphanLines) {
            orphanLines.push(line.dumpKPA(eventNodeSequences));
        }
        const envEasings = this.templateEasingLib.dump(eventNodeSequences);
        const eventNodeSequenceData: EventNodeSequenceDataKPA[] = [];
        for (let sequence of eventNodeSequences) {
            eventNodeSequenceData.push(sequence.dump());
        }
        return {
            bpmList: this.timeCalculator.dump(),
            envEasings: envEasings,
            eventNodeSequences: eventNodeSequenceData,
            info: {
                level: this.level,
                name: this.name
            },
            offset: this.offset,
            orphanLines: orphanLines
        };
    }
    dumpRPE(): ChartDataRPE {
        // 完整META字段处理
        const META: MetaData = {
            RPEVersion: 1, // 默认版本号
            background: '', // 需补充默认值
            charter: '',
            composer: '',
            id: crypto.randomUUID(), // 生成唯一ID
            level: this.level,
            name: this.name,
            offset: this.offset,
            song: this.name // 默认使用chart名称
        };

        // 完整判定线数据处理
        const judgeLineList = this.judgeLines.map(line => 
            line.dumpRPE(this.templateEasingLib)
        );

        // 完整BPM列表结构
        const BPMList = this.timeCalculator.dump()

        return {
            BPMList,
            META,
            judgeLineList,
            judgeLineGroup: []
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