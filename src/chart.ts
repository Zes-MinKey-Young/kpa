
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

interface JudgeLineDataRPE {
    _id: number;
    notes: NoteDataRPE[];
    Group: number;
    Name: string;
    Texture: string;
    alphaControl: Array<any>; // ?
    bpmfactor: 1.0;
    eventLayers: EventLayerDataRPE[];
    extended: {inclineEvents: EventDataRPE[]};
    father: number;
    children: number[];
    isCover: Bool;
    numOfNotes: number;
    posControl: any[];
    sizeControl: any[];
    skewControl: any[];
    yControl: any[];
    zOrder: number;
}
interface CustomEasingData {
    content: EventDataRPE[];
    name: string;
    usedBy: string[];
    dependencies: string[];
}
interface ChartDataRPE {
    BPMList: BPMSegmentData[];
    META: MetaData;
    judgeLineGroup: string[];
    judgeLineList: JudgeLineDataRPE[];
    envEasings: CustomEasingData[]; // New!
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
    templateEasingLib: TemplateEasingLib;
    bpmList: BPMSegmentData[];
    timeCalculator: TimeCalculator;
    orphanLines: JudgeLine[];
    // comboMapping: ComboMapping;
    name: string;
    level: string;
    offset: number;

    operationList: OperationList;
    noteNodeTree: NoteNodeTree;
    effectiveBeats: number;
    constructor() {
        this.timeCalculator = new TimeCalculator();
        this.judgeLines = [];
        this.orphanLines = [];
        this.templateEasingLib = new TemplateEasingLib();
        // this.comboMapping = {};
        this.name = "uk";
        this.level = "uk";
        this.offset = 0;

        this.operationList = new OperationList()
    }
    getEffectiveBeats() {
        console.log(editor.player.audio.src)
        return this.timeCalculator.secondsToBeats(editor.player.audio.duration)
    }
    static fromRPEJSON(data: ChartDataRPE) {
        let chart = new Chart();
        chart.bpmList = data.BPMList;
        chart.name = data.META.name;
        chart.level = data.META.level;
        chart.offset = data.META.offset;
        chart.updateCalculator()
        console.log(chart, chart.getEffectiveBeats())
        chart.noteNodeTree = new NoteNodeTree(chart.getEffectiveBeats())
        if (data.envEasings) {
            chart.templateEasingLib.add(...data.envEasings)

        }
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