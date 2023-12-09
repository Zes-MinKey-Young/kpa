

const DEFAULT_ASPECT_RATIO = 3 / 2
const LINE_WIDTH = 10;
const LINE_COLOR = "#CCCC77"

// 以原点为中心，渲染的半径
const RENDER_SCOPE = 800;

class Player {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    chart: Chart;
    audio: HTMLAudioElement;
    playing: boolean;
    background: HTMLImageElement;
    aspect: number;
    noteSize: number;

    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = canvas.getContext("2d");
        this.audio = new Audio();
        this.playing = false;
        this.aspect = DEFAULT_ASPECT_RATIO;
        this.noteSize = 135;
        this.initCoordinate();

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
        // context.scale(0.25, 0.25)
        context.save()
        // console.log(context.getTransform())
    }
    render() {
        this.context.scale(1, -1)
        this.context.drawImage(this.background, -675, -450, 1350, 900);
        this.context.fillStyle = "#2227";
        this.context.fillRect(-2700, -1800, 5400, 3600)
        this.context.restore()
        this.context.save()
        const context = this.context;
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
        
    }
    renderLine(baseX: number, baseY: number, judgeLine: JudgeLine) {
        const context = this.context;
        const timeCalculator = this.chart.timeCalculator
        // const timeCalculator = this.chart.timeCalculator
        let x = judgeLine.getStackedValue("moveX", this.beats)
        let y = judgeLine.getStackedValue("moveY",this.beats)
        let theta = judgeLine.getStackedValue("rotate", this.beats) / 180 * Math.PI // 转换为弧度制
        let alpha = judgeLine.getStackedValue("alpha", this.beats);
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
        judgeLine.updateSpeedIntegralFrom(this.beats, timeCalculator)
        const holdTrees = judgeLine.holdTrees;
        const noteTrees = judgeLine.noteTrees;
        for (let trees of [holdTrees, noteTrees]) {
            for (let speed in trees) {
                const tree = trees[speed];
                const speedVal: number = parseFloat(speed);
                const timeRanges = judgeLine.computeTimeRange(this.beats, timeCalculator, startY / speedVal, endY / speedVal);
                console.log(timeRanges, startY, endY);
                for (let range of timeRanges) {
                    const start = range[0];
                    const end = range[1];
                    let note: TypeOrTailer<Note> = tree.getNoteAt(start);
                    while (!("tailing" in note) && TimeCalculator.toBeats(note.startTime) < end) {
                        this.renderSameTimeNotes(note, judgeLine, timeCalculator);
                        note = note.next;
                    }
                }
            }

        }

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
                image = HOLD;
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
            this.context.drawImage(image, note.positionX - this.noteSize / 2,  positionY - 10, this.noteSize, length)
        } else {
            this.context.drawImage(image, note.positionX - this.noteSize / 2, positionY - 10)
            if (note.double) {
                this.context.drawImage(DOUBLE, note.positionX - this.noteSize / 2, positionY - 10);
            }
            if (!note.above) {
                this.context.drawImage(BELOW, note.positionX - this.noteSize / 2, positionY - 10);
                
            }
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
    constructor(target: HTMLAudioElement) {
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

