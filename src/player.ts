

const DEFAULT_ASPECT_RATIO = 3 / 2
const LINE_WIDTH = 10;
const LINE_COLOR = "#CCCC77"

// 以原点为中心，渲染的半径
const RENDER_SCOPE = 900;

class Player {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    chart: Chart;
    audio: HTMLAudioElement;
    playing: boolean;
    background: HTMLImageElement;
    aspect: number;
    noteSize: number;
    soundQueue: SoundQueue;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = canvas.getContext("2d");
        this.audio = new Audio();
        this.playing = false;
        this.aspect = DEFAULT_ASPECT_RATIO;
        this.noteSize = 135;
        this.initCoordinate();
        this.soundQueue = new SoundQueue()
    }
    get time(): number {
        return this.audio.currentTime || 0
    }
    get beats(): number {
        return this.chart.timeCalculator.secondsToBeats(this.time)
    }
    initCoordinate() {
        let {canvas, context} = this;
        
        // console.log(context.getTransform())
        const height = canvas.parentElement.clientHeight;
        const width = height * (this.aspect)
        canvas.height = height;
        canvas.width = width;
        // context.translate(height / 2, width / 2) 好好纪念这个把我气吐血的智障
        context.translate(width / 2, height / 2)
        context.scale(width / 1350, -height / 900)
        //context.scale(0.5, 0.5)
        context.save()
        // console.log(context.getTransform())
    }
    render() {
        const context = this.context;
        context.scale(1, -1)
        context.drawImage(this.background, -675, -450, 1350, 900);
        context.fillStyle = "#2227";
        context.fillRect(-2700, -1800, 5400, 3600)
        context.strokeStyle = "#66ccff";
        context.arc(0, 0, RENDER_SCOPE, 0, 2 * Math.PI);
        context.stroke()
        context.restore()
        context.save()
        context.strokeStyle = "#FFFFFF"
        drawLine(context, -1350, 0, 1350, 0)
        drawLine(context, 0, 900, 0, -900);
        
        // console.log("rendering")
        for (let line of this.chart.orphanLines) {
            this.renderLine(0, 0, line);
            context.restore()
            context.save()
        }

        const showInfo = settings.get("playerShowInfo");
        if (this.playing) {
            this.soundQueue.process(this.beats, this.chart.timeCalculator)
        } else {
            this.soundQueue.head = null;
            this.soundQueue.tail = null;
        }
    }
    renderLine(baseX: number, baseY: number, judgeLine: JudgeLine) {
        const context = this.context;
        const timeCalculator = this.chart.timeCalculator
        const beats = this.beats;
        // const timeCalculator = this.chart.timeCalculator
        let x = judgeLine.getStackedValue("moveX",beats)
        let y = judgeLine.getStackedValue("moveY",beats)
        let theta = judgeLine.getStackedValue("rotate", beats) / 180 * Math.PI // 转换为弧度制
        let alpha = judgeLine.getStackedValue("alpha", beats);
        judgeLine.moveX = x;
        judgeLine.moveY = y;
        judgeLine.rotate = theta;
        judgeLine.alpha = alpha;
        // console.log(x, y, theta, alpha);
        context.translate(x, y);
        let transformedX = x + baseX;
        let transformedY = y + baseY;
        if (judgeLine.children.length !== 0) {
            context.save();
            for (let line of judgeLine.children) {
                this.renderLine(transformedX, transformedY, line);
            }
            context.restore();
        }
        context.rotate(theta);

        context.lineWidth = LINE_WIDTH; // 判定线宽度
        // const hexAlpha = alpha < 0 ? "00" : (alpha > 255 ? "FF" : alpha.toString(16))
        const lineColor = settings.get("lineColor")
        context.strokeStyle = rgba(...lineColor, alpha / 255)
        drawLine(context, -1350, 0, 1350, 0)
        context.drawImage(ANCHOR, -10, -10)

        /** 判定线的法向量 */
        const nVector: Vector = [-Math.sin(theta), +Math.cos(theta)] // 奇变偶不变，符号看象限(
        const toCenter: Vector = [-transformedX, -transformedY];
        // 法向量是单位向量，分母是1，不写
        const distance: number = innerProduct(toCenter, nVector);
        let startY: number, endY: number;
        if (Math.abs(distance) < RENDER_SCOPE) {
            startY = 0;
            endY = Math.abs(distance) + RENDER_SCOPE
        } else if (distance > 0) {
            startY = distance - RENDER_SCOPE
            endY = distance + RENDER_SCOPE
        } else {
            startY = distance + RENDER_SCOPE
            endY = distance - RENDER_SCOPE
        }
        const drawScope = (y: number) => {
            if (y<=1e-6) return
            context.save()
            context.strokeStyle = "#66ccff"
            context.lineWidth = 2
            drawLine(context, -1350, +y, 1350, +y)
            drawLine(context, -1350, -y, 1350, -y)
            context.restore()

        }
        const holdTrees = judgeLine.holdTrees;
        const noteTrees = judgeLine.noteTrees;
        const soundQueue = this.soundQueue
        if (Object.keys(holdTrees).length || Object.keys(noteTrees). length) {
            judgeLine.updateSpeedIntegralFrom(beats, timeCalculator)
        }
        for (let trees of [holdTrees, noteTrees]) {
            for (let speed in trees) {
                const tree = trees[speed];
                const speedVal: number = parseFloat(speed);
                const timeRanges = judgeLine.computeTimeRange(beats, timeCalculator, startY / speedVal, endY / speedVal);
                console.log(timeRanges, startY, endY);
                for (let range of timeRanges) {
                    const start = range[0];
                    const end = range[1];
                    // drawScope(judgeLine.getStackedIntegral(start, timeCalculator))
                    // drawScope(judgeLine.getStackedIntegral(end, timeCalculator))
                    
                    let note: TypeOrTailer<Note> = tree.getNoteAt(start, tree.renderPointer);
                    while (!("tailing" in note) && TimeCalculator.toBeats(note.startTime) < end) {
                        this.renderSameTimeNotes(note, judgeLine, timeCalculator);
                        note = note.next;
                    }
                }
                let noteRange = tree.movePointerTo(tree.hitPointer, beats);
                if (noteRange
                    /* && timeCalculator.toSeconds(TC.toBeats(noteRange[0].endTime)) > this.time - 0.033*/) {
                    const [start, end] = noteRange;
                    let note = start;
                    while (note !== end) {
                        soundQueue.pushEntity(TC.toBeats(note.startTime), note.type, timeCalculator)
                        note = <Note>note.next
                    }
                } else {

                }
            }

        }
        drawScope(endY)
        /*
        for (let eachSpeed in judgeLine.noteSpeeds) {
            const speed = parseFloat(eachSpeed)
            let notes = judgeLine.noteSpeeds[eachSpeed];
            /** 判定线在假想的瀑布中前进距离 /
            let currentPositionY = judgeLine.computeLinePositionY(this.beats, this.chart.timeCalculator) * speed;
            for (let eachNote of notes) {
                /** Note在某一时刻与判定线的距离 /
                const positionY: number = eachNote.positionY - currentPositionY;
                const endPositionY = eachNote.endPositionY - currentPositionY;
                if (!positionY && positionY !== 0 || !endPositionY && endPositionY !== 0) {
                    debugger;
                }
                if (endPositionY >= 0 && TimeCalculator.toBeats(eachNote.endTime) >= this.beats) {
                    // 绑线Note=0不要忘了
                    this.renderNote(eachNote, positionY < 0 ? 0 : positionY, endPositionY)
                    // console.log(eachNote, eachNote.above)
                    // console.log("pos:", eachNote.positionY, notes.indexOf(eachNote))
                }
            }
        }
        */
    }
    renderSameTimeNotes(note: Note, judgeLine: JudgeLine, timeCalculator: TimeCalculator) {
        if (note.type === NoteType.Hold) {
            const startY = judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.startTime), timeCalculator) * note.speed;
            this.renderNote(
                note,
                startY < 0 ? 0 : startY,
                judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.endTime), timeCalculator) * note.speed
                )
        } else {
            this.renderNote(
                note,
                judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.startTime), timeCalculator) * note.speed
            )
        }
        if (note.nextSibling) {
            this.renderSameTimeNotes(note.nextSibling, judgeLine, timeCalculator);
        }
    }
    renderNote(note: Note, positionY: number, endpositionY?: number) {
        if (TimeCalculator.toBeats(note.endTime) < this.beats) {
            return;
        }
        let image: HTMLImageElement;
        switch (note.type) {
            case NoteType.Tap:
                image = TAP;
                break;
            case NoteType.Drag:
                image = DRAG;
                break;
            case NoteType.Flick:
                image = FLICK;
                break;
            case NoteType.Hold:
                image = HOLD_HEAD;
                break;
            default:
                image = TAP;
        }
        if (!note.above) {
            positionY = -positionY;
            endpositionY = -endpositionY
        }
        let length = endpositionY - positionY
        // console.log(NoteType[note.type])
        if (note.type === NoteType.Hold) {
            this.context.drawImage(HOLD_BODY, note.positionX - this.noteSize / 2,  positionY - 10, this.noteSize, length)
        }
        this.context.drawImage(image, note.positionX - this.noteSize / 2, positionY - 10)
        if (note.double) {
            this.context.drawImage(DOUBLE, note.positionX - this.noteSize / 2, positionY - 10);
        }
        if (!note.above) {
            this.context.drawImage(BELOW, note.positionX - this.noteSize / 2, positionY - 10);
            
        }
        
    }
    private update() {
        if (!this.playing) {
            return;
        }
        // console.log("anifr")
        requestAnimationFrame(() => {
            // console.log("render")
            this.render();
            this.update();
        })
    }
    play() {
        this.audio.play()
        this.playing = true;
        this.update();
    }
    pause() {
        this.playing = false;
        this.audio.pause()
    }
}

class ProgressBar {
    target: HTMLAudioElement;
    element: HTMLProgressElement;
    constructor(target: HTMLAudioElement, pauseFn: () => void, updateFn: () => void) {
        this.target = target;
        this.element = document.createElement("progress")
        const element = this.element;
        if (target.duration) {
            this.element.max = target.duration
        }
        target.addEventListener("loadeddata", () => {
            this.element.max = target.duration;
        })
        target.addEventListener("play", () => {
            this.update()
        })
        let controlling = false;
        on(["mousedown", "touchstart"], element, (event: MouseEvent | TouchEvent) => {
            controlling = true;
            pauseFn();
        })
        on(["mousemove", "touchmove"], element, (event: MouseEvent | TouchEvent) => {
            let posX: number;
            if (!controlling) {
                return;
            }
            if (event instanceof MouseEvent) {
                posX = event.clientX
            } else {
                posX = event.changedTouches[0].clientX
            }
            const value = element.max * ((posX - element.offsetLeft) / element.clientWidth);
            element.value = value;
            target.currentTime = value;
            updateFn()
        })
        on(["mouseup", "touchend"], element, (event: MouseEvent | TouchEvent) => {
            let posX: number;
            if (!controlling) {
                return;
            }
            controlling = false;
            if (event instanceof MouseEvent) {
                posX = event.clientX
            } else {
                posX = event.changedTouches[0].clientX
            }
            const value = element.max * ((posX - element.offsetLeft) / element.clientWidth);
            element.value = value;
            target.currentTime = value;
            updateFn()
        })
    }
    appendTo(element: HTMLElement) {
        element.appendChild(this.element)
        return this;
    }
    update() {
        if (this.target.paused) {
            return;
        }
        requestAnimationFrame(() => {
            this.element.value = this.target.currentTime;
            this.update();
        })
    }
}


class SoundEntity {
    next: SoundEntity | null;
    type: NoteType;
    // playsSound: boolean;
    // posX: number;
    // posY: number;
    beats: number;
    time: number;
    // playingSound: boolean;
    constructor(type: NoteType, beats: number, timeCalculator: TimeCalculator) {
        this.type = type;
        // this.playsSound = playsSound;
        // this.posX = posX;
        // this.posY = posY;
        this.beats = beats;
        this.time = timeCalculator.toSeconds(beats)
        // this.playingSound = false;
        this.next = null;
    }
}

class SoundQueue {
    head: SoundEntity | null;
    tail: SoundEntity | null;
    constructor() {
        this.head = null;
        this.tail = null
    }
    process(beats: number, timeCalculator: TimeCalculator): SoundEntity[] {
        console.log(this.head)
        const entities: SoundEntity[] = [];
        let current: SoundEntity = this.head;
        const last2fr = timeCalculator.toSeconds(beats) - 0.033
        while (current && (current.beats > beats || current.time < last2fr)) { // 未到的条目被忽略
            current = current.next;
        }
        this.head = current;
        debugger
        while (current) {
            let audio: HTMLAudioElement = <HTMLAudioElement>[null, sound.tap, sound.tap, sound.flick, sound.drag][current.type].cloneNode();
            audio.play()
            current = current.next;
        }
        this.head = null;
        this.tail = null;
        return entities
    }
    pushEntity(beats: number, type: NoteType, timeCalculator: TimeCalculator) {
        const entity = new SoundEntity(type, beats, timeCalculator)
        if (this.head === null) {
            this.head = entity;
            this.tail = entity;
        } else {
            this.tail.next = entity;
            this.tail = entity;
        }
    }
}
