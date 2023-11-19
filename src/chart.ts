
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

interface NoteData {
    above: Bool;
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

interface EventData {
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

interface EventLayerData {
    moveXEvents: EventData[];
    moveYEvents: EventData[];
    rotateEvents: EventData[];
    alphaEvents: EventData[];
    speedEvents: EventData[];
}

interface JudgeLineData {
    notes: NoteData[];
    Group: number;
    Name: string;
    Texture: string;
    alphaControl: Array<any>; // ?
    bpmfactor: 1.0;
    eventLayers: EventLayerData[];
    extended: {inclineEvents: EventData[]};
    father: number;
    isCover: Bool;
    numOfNotes: number;
    posControl: any[];
    sizeControl: any[];
    skewControl: any[];
    yControl: any[];
    zOrder: number;
}
interface CustomEasingData {
    content: EventData[];
    name: string
}
interface ChartData {
    BPMList: BPMSegmentData[];
    META: MetaData;
    judgeLineGroup: string[];
    judgeLineList: JudgeLineData[];
    envEasings: CustomEasingData[]; // New!
}
function arrayForIn<T, RT>(arr: T[], expr: (v: T) => RT, guard?: (v: T) => any): RT[] {
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
    endpositionY?: number;
    double: boolean;
    constructor(data: NoteData) {
        this.above = Boolean(data.above);
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
    constructor() {
        this.notes = [];
        this.eventLayers = [];
        this.noteSpeeds = {};
    }
    static fromRPEJSON(data: JudgeLineData, templates: TemplateEasingLib, timeCalculator: TimeCalculator) {
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
                moveX: EventNodeSequence.fromRPEJSON(layerData.moveXEvents, templates),
                moveY: EventNodeSequence.fromRPEJSON(layerData.moveYEvents, templates),
                rotate: EventNodeSequence.fromRPEJSON(layerData.rotateEvents, templates),
                alpha: EventNodeSequence.fromRPEJSON(layerData.alphaEvents, templates),
                speed: EventNodeSequence.fromRPEJSON(layerData.speedEvents, templates)
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
            each.endpositionY = this.getStackedIntegral(TimeCalculator.toBeats(each.endTime), timeCalculator) * each.speed;
        }
    }
    updateNoteSpeeds() {
        let noteSpeed = this.noteSpeeds = {}
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
    constructor() {
        this.timeCalculator = new TimeCalculator();
        this.judgeLines = [];
        this.templateEasingLib = {};
    }
    static fromRPEJSON(data: ChartData) {
        let chart = new Chart();
        chart.bpmList = data.BPMList;
        chart.updateCalculator()
        if (data.envEasings) {
            for (let easing of data.envEasings) {
                chart.templateEasingLib[easing.name] = new TemplateEasing(EventNodeSequence.fromRPEJSON(easing.content, chart.templateEasingLib)) // 大麻烦！
            }

        }
        // let line = data.judgeLineList[0];
        for (let line of data.judgeLineList) {
            chart.judgeLines.push(JudgeLine.fromRPEJSON(line, chart.templateEasingLib, chart.timeCalculator))
        }
        return chart
    }
    updateCalculator() {
        this.timeCalculator.bpmList = this.bpmList;
        this.timeCalculator.update()
    }
}


