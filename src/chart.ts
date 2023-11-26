
type Bool = 1 | 0
enum NoteType {
    Tap=1,
    Drag=4,
    Flick=3,
    Hold=2
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

interface JudgeLineDataPRE {
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
    judgeLineList: JudgeLineDataPRE[];
    envEasings: CustomEasingData[]; // New!
}
function arrayForIn<T, RT>(arr: T[], expr: (v: T) => RT, guard?: (v: T) => boolean): RT[] {
    let ret: RT[] = []
    for (let each of arr) {
        if (!guard || guard && guard(each)) {
            ret.push(expr(each))
        }
    }
    return ret;
}


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
     */
    positionY: number;
    endPositionY?: number;
    double: boolean;
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
    }
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
 */
interface NoteSpeeds {
    [key: number]: Note[]
}

class JudgeLine {
    notes: Note[];
    eventLayers: EventLayer[];
    notePosition: Float64Array;
    noteSpeeds: NoteSpeeds;
    father: JudgeLine;
    children: JudgeLine[];
    constructor() {
        this.notes = [];
        this.eventLayers = [];
        this.children = [];
        this.noteSpeeds = {};
    }
    static fromRPEJSON(data: JudgeLineDataPRE, templates: TemplateEasingLib, timeCalculator: TimeCalculator) {
        let line = new JudgeLine()
        if (data.notes) {
            let notes = data.notes;
            const len = notes.length;
            let lastNote = new Note(notes[0]);
            line.notes.push(lastNote)
            for (let i = 1; i < len; i++) {
                let note = new Note(notes[i]);
                if (arrEq(note.startTime, lastNote.startTime)) {
                    note.double = true;
                    lastNote.double = true;
                }
                line.notes.push(note)
                lastNote = note
            }
        }
        const eventLayers = data.eventLayers;
        const length = eventLayers.length;
        for (let index = 0; index < length; index++) {
            const layerData = eventLayers[index];
            const layer: EventLayer = {
                moveX: EventNodeSequence.fromRPEJSON(EventType.MoveX, layerData.moveXEvents, templates, undefined),
                moveY: EventNodeSequence.fromRPEJSON(EventType.MoveY, layerData.moveYEvents, templates, undefined),
                rotate: EventNodeSequence.fromRPEJSON(EventType.Rotate, layerData.rotateEvents, templates, undefined),
                alpha: EventNodeSequence.fromRPEJSON(EventType.Alpha, layerData.alphaEvents, templates, undefined),
                speed: EventNodeSequence.fromRPEJSON(EventType.Speed, layerData.speedEvents, templates, timeCalculator)
            };
            line.eventLayers[index] = layer;
            for (let each in layerData) {
                let type = each.slice(-6); // 去掉后面的“Event”
                line.eventLayers[index][type]
            }
        }
        line.updateNoteSpeeds();
        line.computeNotePositionY(timeCalculator);
        return line;
    }
    computeNotePositionY(timeCalculator: TimeCalculator) {
        for (let each of this.notes) {
            // console.log("inte", this.getStackedIntegral(TimeCalculator.toBeats(each.startTime), timeCalculator))
            each.positionY = this.getStackedIntegral(TimeCalculator.toBeats(each.startTime), timeCalculator) * each.speed;
            each.endPositionY = this.getStackedIntegral(TimeCalculator.toBeats(each.endTime), timeCalculator) * each.speed;
        }
    }
    updateNoteSpeeds() {
        let noteSpeed = this.noteSpeeds
        for (let note of this.notes) {
            if (!noteSpeed[note.speed]) {
                noteSpeed[note.speed] = []
            }
            noteSpeed[note.speed].push(note)
        }
    }
    computeLinePositionY(beats: number, timeCalculator: TimeCalculator)  {
        return this.getStackedIntegral(beats, timeCalculator)
    }
    getStackedValue(type: keyof EventLayer, beats: number) {
        const length = this.eventLayers.length;
        let current = 0;
        for (let index = 0; index < length; index++) {
            const layer = this.eventLayers[index];
            if (!layer) {
                break;
            }
            current += layer[type].getValueAt(beats);
        }
        return current
    }
    getStackedIntegral(beats: number, timeCalculator: TimeCalculator) {
        
        const length = this.eventLayers.length;
        let current = 0;
        for (let index = 0; index < length; index++) {
            const layer = this.eventLayers[index];
            if (!layer) {
                break;
            }
            current += layer.speed.getIntegral(beats, timeCalculator);
        }
        // console.log("integral", current)
        return current;
    }
}

class Chart {
    judgeLines: JudgeLine[];
    templateEasingLib: TemplateEasingLib;
    bpmList: BPMSegmentData[];
    timeCalculator: TimeCalculator;
    orphanLines: JudgeLine[]
    constructor() {
        this.timeCalculator = new TimeCalculator();
        this.judgeLines = [];
        this.orphanLines = [];
        this.templateEasingLib = new TemplateEasingLib();
    }
    static fromRPEJSON(data: ChartDataRPE) {
        let chart = new Chart();
        chart.bpmList = data.BPMList;
        chart.updateCalculator()
        if (data.envEasings) {
            chart.templateEasingLib.add(...data.envEasings)

        }
        // let line = data.judgeLineList[0];
        const length = data.judgeLineList.length
        const orphanLines: JudgeLineDataPRE[] = [];
        for (let i = 0; i < length; i++) {
            const lineData = data.judgeLineList[i];
            if (lineData.father === -1) {
                orphanLines.push(lineData);
                continue;
            }
            const father = data.judgeLineList[lineData.father];
            const children = father.children || (father.children = []);
            children.push(i);
        }
        const readOne = (lineData: JudgeLineDataPRE) => {
            const line: JudgeLine = JudgeLine.fromRPEJSON(lineData, chart.templateEasingLib, chart.timeCalculator)
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
}


