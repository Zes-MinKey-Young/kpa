
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
class JudgeLine {
    holdTrees: {[key: number]: NoteTree};
    noteTrees: {[key: number]: NoteTree};
    eventLayers: EventLayer[];
    // notePosition: Float64Array;
    // noteSpeeds: NoteSpeeds;
    father: JudgeLine;
    children: JudgeLine[];
    moveX: number;
    moveY: number;
    rotate: number;
    alpha: number;
    constructor() {
        //this.notes = [];
        this.eventLayers = [];
        this.children = [];
        this.holdTrees = {};
        this.noteTrees = {};
        // this.noteSpeeds = {};
    }
    static fromRPEJSON(data: JudgeLineDataPRE, templates: TemplateEasingLib, timeCalculator: TimeCalculator) {
        let line = new JudgeLine()
        if (data.notes) {
            const holdTrees = line.holdTrees;
            const noteTrees = line.noteTrees;
            let notes = data.notes;
            notes.sort((n1: NoteDataRPE, n2: NoteDataRPE) => {
                if (TimeCalculator.ne(n1.startTime, n2.startTime)) {
                    return TimeCalculator.gt(n1.startTime, n2.startTime) ? 1 : -1
                }
                return TimeCalculator.gt(n1.endTime, n2.endTime) ? 1 : -1
            })
            const len = notes.length;
            for (let i = 0; i < len; i++) {
                const note: Note = new Note(notes[i]);
                if (note.type === NoteType.Hold) {
                    const speed = note.speed;
                    const tree = speed in holdTrees ? holdTrees[speed] : (holdTrees[speed] = new NoteTree());
                    const lastHold = tree.currentBranchPoint
                    const lastHoldTime: TimeT = lastHold.startTime
                    if (TimeCalculator.eq(lastHoldTime, note.startTime)) {
                        Note.connectSibling(lastHold, note);
                        tree.currentBranchPoint = note;
                    } else {
                        Note.connect(tree.currentPoint, note)
                        tree.currentPoint = note;
                        tree.currentBranchPoint = note;
                    }
                    tree.timesWithNotes++
                } else {
                    
                    const speed = note.speed;
                    const tree = speed in noteTrees ? noteTrees[speed] : (noteTrees[speed] = new NoteTree());
                    const lastNote = tree.currentBranchPoint
                    const lastNoteTime: TimeT = lastNote.startTime
                    if (TimeCalculator.eq(lastNoteTime, note.startTime)) {
                        Note.connectSibling(lastNote, note);
                        tree.currentBranchPoint = note;
                    } else {
                        Note.connect(tree.currentPoint, note)
                        tree.currentPoint = note;
                        tree.currentBranchPoint = note;
                        tree.timesWithNotes++
                    }
                    
                }
            }
            for (let trees of [holdTrees, noteTrees]) {
                for (let speed in trees) {
                    const tree: NoteTree = trees[speed];
                    Note.connect(tree.currentPoint, tree.tail)
                    tree.initJump();
                }
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
        // line.updateNoteSpeeds();
        // line.computeNotePositionY(timeCalculator);
        return line;
    }
    updateSpeedIntegralFrom(beats: number, timeCalculator: TimeCalculator) {
        for (let eventLayer of this.eventLayers) {
            eventLayer.speed.updateNodesIntegralFrom(beats, timeCalculator);
        }
    }
    computeTimeRange(beats: number, timeCalculator: TimeCalculator , startY: number, endY: number): [number, number][] {
        return [[0, Infinity]]
        /*
        let times: number[] = [];
        let result: [number, number][] = [];
        for (let eventLayer of this.eventLayers) {
            const sequence = eventLayer.speed;
            let node: EventStartNode | Tailer<EventStartNode> = sequence.getNodeAt(beats);
            let endNode: EventEndNode | Tailer<EventStartNode>
            while (true) {
                times.push(TimeCalculator.toBeats(node.time))
                if ("tailing" in (endNode = node.next)) {
                    break;
                }

                node = endNode.next
            }
        }
        times = [...new Set(times)].sort((a, b) => a - b)
        const len = times.length;
        let nextTime = times[0]
        let nextPosY = this.getStackedIntegral(nextTime, timeCalculator)
        let nextSpeed = this.getStackedValue("speed", nextTime - 1e-6)
        let range: [number, number] = [undefined, undefined];
        const computeTime = (speed: number, current: number, fore: number) => timeCalculator.secondsToBeats(current / (speed * 120) + timeCalculator.toSeconds(fore));
        for (let i = 0; i < len - 1;) {
            const thisTime = nextTime;
            const thisPosY = nextPosY;
            const thisSpeed = nextSpeed;
            nextTime = times[i + 1]
            nextPosY = this.getStackedIntegral(nextTime, timeCalculator);
            nextSpeed = this.getStackedValue("speed", nextTime - 1e-6)
            if (thisSpeed * nextSpeed < 0) { // 有变号零点，再次切断，保证处理的每个区间单调性
                nextTime = (nextTime - thisTime) * (0 - thisSpeed) / (nextSpeed - thisSpeed) + thisTime;
                nextSpeed = 0
                nextPosY = this.getStackedIntegral(nextTime, timeCalculator)
            } else {
                i++
            }
            if (range[0] === undefined) {
                // 变速区间直接全部囊括，匀速要算一下，因为好算
                if (thisPosY < startY && startY <= nextPosY || thisPosY >= endY && endY > nextPosY) {
                    range[0] = thisSpeed !== nextSpeed ? thisTime : computeTime(
                        thisSpeed,
                        (thisPosY < nextPosY ? startY : endY) - thisPosY, thisTime)
                } else if (startY < thisPosY && thisPosY <= endY) {
                    range[0] = thisTime;
                }
            }
            // 要注意这里不能合成双分支if因为想要的Y片段可能在一个区间内
            if (range[0] !== undefined) {
                if (thisPosY < endY && endY <= nextPosY || thisPosY >= startY && startY > nextPosY) {
                    range[1] = thisSpeed !== nextSpeed ? nextTime : computeTime(
                        thisSpeed,
                        (thisPosY > nextPosY ? startY : endY) - thisPosY, thisTime)
                    if (range[0] > range[1]){
                        debugger
                    }
                    result.push(range)
                    range = [undefined, undefined];
                }
            }
        }
        const thisPosY = nextPosY;
        const thisTime = nextTime;
        const thisSpeed = nextSpeed;
        const inf = thisSpeed > 0 ? Infinity : (thisSpeed < 0 ? -Infinity : thisPosY)
        if (range[0] === undefined) {
            // 变速区间直接全部囊括，匀速要算一下，因为好算
            if (thisPosY < startY && startY <= inf || thisPosY >= endY && endY > inf) {
                range[0] = computeTime(
                    thisSpeed,
                    (thisPosY < inf ? startY : endY) - thisPosY,
                    thisTime)
            } else if (thisSpeed === 0) {
                range[0] = 0;
            }
        }
        // 要注意这里不能合成双分支if因为想要的Y片段可能在一个区间内
        if (range[0] !== undefined) {
            if (thisPosY < endY && endY <= inf || thisPosY >= startY && startY > inf) {
                range[1] = computeTime(
                    thisSpeed,
                    (thisPosY > inf ? startY : endY) - thisPosY,
                    thisTime)
                result.push(range)
            } else if (thisSpeed === 0) {
                range[1] = Infinity;
                result.push(range)
            }
        }
        return result;
        */
    }
    /*
    computeLinePositionY(beats: number, timeCalculator: TimeCalculator)  {
        return this.getStackedIntegral(beats, timeCalculator)
    }
    */
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


