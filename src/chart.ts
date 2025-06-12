enum EventType {
    moveX,
    moveY,
    rotate,
    alpha,
    speed,
    easing,
    bpm
}
enum NoteType {
    tap=1,
    drag=4,
    flick=3,
    hold=2
}

interface EventLayer {
    moveX?: EventNodeSequence;
    moveY?: EventNodeSequence;
    rotate?: EventNodeSequence;
    alpha?: EventNodeSequence;
    speed?: EventNodeSequence;
}



type Plain<T> = {[k: string]: T}

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
        this.judgeLineGroups = []

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
        chart.judgeLineGroups = data.judgeLineGroups.map(group => new JudgeLineGroup(group));
        chart.updateCalculator()
        chart.nnnList = new NNNList(chart.getEffectiveBeats())
        const sequences = data.eventNodeSequences
        const length = data.eventNodeSequences.length
        for (let i = 0; i < length; i++) {
            const sequence = sequences[i];
            (chart.sequenceMap[sequence.id] = EventNodeSequence.fromRPEJSON(sequence.type, sequence.events, chart)).id = sequence.id;
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