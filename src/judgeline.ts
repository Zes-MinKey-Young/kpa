class JudgeLine {
    holdTrees: {[key: number]: HoldTree};
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

    id: number;
    name: string
    constructor() {
        //this.notes = [];
        this.eventLayers = [];
        this.children = [];
        this.holdTrees = {};
        this.noteTrees = {};
        // this.noteSpeeds = {};
    }
    static fromRPEJSON(id: number, data: JudgeLineDataPRE, templates: TemplateEasingLib, timeCalculator: TimeCalculator, comboMapping: ComboMapping) {
        let line = new JudgeLine()
        line.id = id;
        line.name = data.Name
        if (data.notes) {
            const holdTrees = line.holdTrees;
            const noteTrees = line.noteTrees;
            let notes = data.notes;
            notes.sort((n1: NoteDataRPE, n2: NoteDataRPE) => {
                if (TimeCalculator.ne(n1.startTime, n2.startTime)) {
                    return TimeCalculator.gt(n1.startTime, n2.startTime) ? 1 : -1
                }
                return TimeCalculator.gt(n1.endTime, n2.endTime) ? -1 : 1 // 这里曾经排反了（
            })
            const len = notes.length;
            let lastTime: TimeT = [-1, 0, 1];
            let comboInfoEntity: ComboInfoEntity;
                    
            for (let i = 0; i < len; i++) {
            const note: Note = new Note(notes[i]);
                if (TC.ne(note.startTime, lastTime)) {
                    lastTime = note.startTime;
                    const timeString = toTimeString(lastTime)
                    comboInfoEntity =  timeString in comboMapping ? comboMapping[timeString] : (comboMapping[timeString] = new ComboInfoEntity());
                }
                if (note.isFake) {
                    comboInfoEntity.fake++
                } else {
                    comboInfoEntity.real++
                }
                if (note.type === NoteType.hold) {
                    comboInfoEntity.holdHead++;
                    const speed = note.speed;
                    const tree = speed in holdTrees ? holdTrees[speed] : (holdTrees[speed] = new HoldTree());
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
                    const timeString = toTimeString(note.endTime);
                    const holdEntity = timeString in comboMapping ? comboMapping[timeString] : (comboMapping[timeString] = new ComboInfoEntity());
                    holdEntity.hold++;
                    if (!note.isFake) {
                        holdEntity.realEnd++;
                    }
                } else {
                    if (!note.isFake) {
                        comboInfoEntity.realEnd++;
                    }
                    comboInfoEntity[NoteType[note.type]]++;
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
                    tree.initPointer(tree.hitPointer)
                    tree.initPointer(tree.renderPointer)
                }
            }
        }
        const eventLayers = data.eventLayers;
        const length = eventLayers.length;
        for (let index = 0; index < length; index++) {
            const layerData = eventLayers[index];
            const layer: EventLayer = {
                moveX: EventNodeSequence.fromRPEJSON(EventType.moveX, layerData.moveXEvents, templates, undefined),
                moveY: EventNodeSequence.fromRPEJSON(EventType.moveY, layerData.moveYEvents, templates, undefined),
                rotate: EventNodeSequence.fromRPEJSON(EventType.rotate, layerData.rotateEvents, templates, undefined),
                alpha: EventNodeSequence.fromRPEJSON(EventType.alpha, layerData.alphaEvents, templates, undefined),
                speed: EventNodeSequence.fromRPEJSON(EventType.speed, layerData.speedEvents, templates, timeCalculator)
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
        //return [[0, Infinity]]
        //*
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
        let nextSpeed = this.getStackedValue("speed", nextTime, true)
        let range: [number, number] = [undefined, undefined];
        const computeTime = (speed: number, current: number, fore: number) => timeCalculator.secondsToBeats(current / (speed * 120) + timeCalculator.toSeconds(fore));
        for (let i = 0; i < len - 1;) {
            const thisTime = nextTime;
            const thisPosY = nextPosY;
            let thisSpeed = this.getStackedValue("speed", thisTime);
            if (Math.abs(thisSpeed) < 1e-8) {
                thisSpeed = 0; // 不这样做可能导致下面异号判断为真从而死循环
            }
            nextTime = times[i + 1]
            nextPosY = this.getStackedIntegral(nextTime, timeCalculator);
            nextSpeed = this.getStackedValue("speed", nextTime, true)
            if (thisSpeed * nextSpeed < 0) { // 有变号零点，再次切断，保证处理的每个区间单调性
                //debugger;
                nextTime = (nextTime - thisTime) * (0 - thisSpeed) / (nextSpeed - thisSpeed) + thisTime;
                nextSpeed = 0
                nextPosY = this.getStackedIntegral(nextTime, timeCalculator)
                //debugger
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
        //*/
    }
    /*
    computeLinePositionY(beats: number, timeCalculator: TimeCalculator)  {
        return this.getStackedIntegral(beats, timeCalculator)
    }
    */
    getValues(beats: number, usePrev: boolean=false): [x: number, y: number, theta: number, alpha: number] {
        return [
            this.getStackedValue("moveX", beats, usePrev),
            this.getStackedValue("moveY", beats, usePrev),
            this.getStackedValue("rotate", beats, usePrev) / 180 * Math.PI, // 转换为弧度制
            this.getStackedValue("alpha", beats, usePrev),
        ]
    }
    getThisCoordinate(beats: number, usePrev: boolean=false): TupleCoordinate {
        return [this.getStackedValue("moveX", beats, usePrev),
        this.getStackedValue("moveY", beats, usePrev)]
    }
    getBaseCoordinate(beats: number, usePrev: boolean=false): TupleCoordinate {
        if (!this.father) {
            return [0, 0]
        }
        const baseBase = this.father.getBaseCoordinate(beats, usePrev);
        const base = this.father.getThisCoordinate(beats, usePrev);
        return [baseBase[0] + base[0], baseBase[1] + base[1]]
    }
    getStackedValue(type: keyof EventLayer, beats: number, usePrev: boolean = false) {
        const length = this.eventLayers.length;
        let current = 0;
        for (let index = 0; index < length; index++) {
            const layer = this.eventLayers[index];
            if (!layer) {
                break;
            }
            current += layer[type].getValueAt(beats, usePrev);
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