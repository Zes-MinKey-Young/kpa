

const DEFAULT_ASPECT_RATIO = 3 / 2
const LINE_WIDTH = 10;
const LINE_COLOR = "#CCCC77";
const HIT_EFFECT_SIZE = 200;
const HALF_HIT = HIT_EFFECT_SIZE / 2

// 以原点为中心，渲染的半径
const RENDER_SCOPE = 900;

const getVector = (theta: number): [Vector, Vector] => [[Math.cos(theta), Math.sin(theta)], [-Math.sin(theta), Math.cos(theta)]]

class Player {
    editor: Editor;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    hitCanvas: HTMLCanvasElement;
    hitContext: CanvasRenderingContext2D
    chart: Chart;
    audio: HTMLAudioElement;
    audioProcessor: AudioProcessor;
    playing: boolean;
    background: HTMLImageElement;
    aspect: number;
    noteSize: number;
    noteHeight: number;
    soundQueue: SoundEntity[];
    lastBeats: number
    
    constructor(canvas: HTMLCanvasElement, editor: Editor) {
        this.canvas = canvas
        this.context = canvas.getContext("2d");
        this.audioProcessor = new AudioProcessor();
        this.hitCanvas = document.createElement("canvas");
        this.hitContext = this.hitCanvas.getContext("2d");
        this.audio = new Audio();
        this.editor = editor;
        this.playing = false;
        this.aspect = DEFAULT_ASPECT_RATIO;
        this.noteSize = 135;
        this.noteHeight = 10;
        this.initCoordinate();
        window.addEventListener("resize", () => {
            this.initCoordinate();
            if (!editor.initialized) {
                this.initGreyScreen()
            } else {
                editor.update()
            }
        })
        this.audio.addEventListener("ended", () => {
            this.playing = false;
        })
        this.initGreyScreen();
        this.soundQueue = []
    }
    get time(): number {
        return (this.audio.currentTime || 0) - this.chart.offset / 1000 - 0.017;
    }
    get beats(): number {
        return this.chart.timeCalculator.secondsToBeats(this.time)
    }
    initCoordinate() {
        let {canvas, context, hitCanvas, hitContext} = this;
        
        // console.log(context.getTransform())
        const height = canvas.parentElement.clientHeight;
        const width = height * (this.aspect)
        canvas.height = height;
        canvas.width = width;
        hitCanvas.height = height;
        hitCanvas.width = width
        
        const RATIO = 1.0
        // 计算最终的变换矩阵
        const sx1 = width / 1350
        const sy1 = height / 900
        const sx = sx1 * RATIO;
        const sy = (-sy1) * RATIO;
        const tx = width / 2;
        const ty = height / 2;

        // 设置变换矩阵
        context.setTransform(sx, 0, 0, sy, tx, ty);
        hitContext.setTransform(sx1, 0, 0, sy1, tx, ty);
        //hitContext.scale(0.5, 0.5)
        context.save()
        hitContext.save()
        // console.log(context.getTransform())
    }
    renderDropScreen() {
        const {canvas, context} = this;
        context.scale(1, -1);
        context.fillStyle = "#6cf"
        context.fillRect(-675, -450, 1350, 900);
        context.fillStyle = "#444"
        context.font = "100px phigros"
        const metrics = context.measureText("松手释放");
        context.fillText("松手释放", -metrics.width/2, 0)
        context.restore();
        context.save();
    }
    renderGreyScreen() {
        const {canvas, context} = this;
        context.scale(1, -1);
        context.fillStyle = "#AAA"
        context.fillRect(-675, -450, 1350, 900);
        context.fillStyle = "#444"
        context.font = "100px phigros"
        const metrics = context.measureText("放入文件");
        context.fillText("放入文件", -metrics.width/2, 0)
        context.restore();
        context.save();
    }
    initGreyScreen() {
        const {canvas, context} = this;
        this.renderGreyScreen()
        canvas.addEventListener("dragover", (e) => {
            e.preventDefault();
            this.renderDropScreen()
        })
        canvas.addEventListener("dragleave", (e) => {
            e.preventDefault();
            this.renderGreyScreen()
        })
        canvas.addEventListener("drop", (e) => {
            const files = e.dataTransfer.files;
            const len = files.length;
            for (let i = 0; i < len; i++) {
                const file = files[i];
                const arr = file.name.split(".")
                const extension = arr[arr.length - 1];
                if (["jpeg", "jpg", "png", "gif", "svg", "webp", "bmp", "ico"].includes(extension)) {
                    this.editor.readImage(file);
                } else if (["json"].includes(extension)) {
                    this.editor.readChart(file)
                } else {
                    this.editor.readAudio(file)
                }
            }
            e.preventDefault()
        })
    }
    render() {
        // console.time("render")
        const context = this.context;
        const hitContext = this.hitContext;
        hitContext.clearRect(675, -450, -1350, 900);
        context.scale(1, -1)
        context.drawImage(this.background, -675, -450, 1350, 900);
        // 涂灰色（背景变暗）
        context.fillStyle = "#2227";
        context.fillRect(-27000, -18000, 54000, 36000)
        // 画出渲染范围圆
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
        context.scale(1, -1)
        context.drawImage(this.hitCanvas, -675, -450, 1350, 900)
        context.restore()
        context.save()

        const showInfo = settings.get("playerShowInfo");
        if (showInfo) {
            context.scale(1, -1);
            context.fillStyle = "#ddd"
            context.font = "50px phigros"
            const chart = this.chart;
            const title = chart.name;
            const level = chart.level;
            context.fillText(title, -650, 400);
            context.restore()
            context.save()
        }

        const timeLimit = this.time - 0.033
        if (this.playing) {
            const queue = this.soundQueue;
            const len = queue.length;
            for (let i = 0; i < len; i++) {
                const SoundEntity = queue[i];
                if (SoundEntity.seconds < timeLimit) {
                    continue;
                }
                this.audioProcessor.playNoteSound(SoundEntity.type);
            }
        }
        this.soundQueue = [];
        
        // console.timeEnd("render")
    }
    renderLine(baseX: number, baseY: number, judgeLine: JudgeLine) {
        const context = this.context;
        const timeCalculator = this.chart.timeCalculator
        const beats = this.beats;
        // const timeCalculator = this.chart.timeCalculator
        const [x, y, theta, alpha] = judgeLine.getValues(beats)
        judgeLine.moveX = x;
        judgeLine.moveY = y;
        judgeLine.rotate = theta;
        judgeLine.alpha = alpha;
        // console.log(x, y, theta, alpha);
        context.translate(x, y);
        const transformedX = x + baseX;
        const transformedY = y + baseY;
        if (judgeLine.children.length !== 0) {
            context.save();
            for (let line of judgeLine.children) {
                this.renderLine(transformedX, transformedY, line);
            }
            context.restore();
        }
        context.rotate(-theta);

        context.lineWidth = LINE_WIDTH; // 判定线宽度
        // const hexAlpha = alpha < 0 ? "00" : (alpha > 255 ? "FF" : alpha.toString(16))
        const lineColor = settings.get("lineColor")
        context.strokeStyle = rgba(...lineColor, alpha / 255)
        drawLine(context, -1350, 0, 1350, 0)
        context.drawImage(ANCHOR, -10, -10)

        /** 判定线的法向量 */
        const nVector: Vector = getVector(theta)[1] // 奇变偶不变，符号看象限(
        const toCenter: Vector = [-transformedX, -transformedY];
        // 法向量是单位向量，分母是1，不写
        /** the distance between the center and the line */
        const distance: number = Math.abs(innerProduct(toCenter, nVector));
        let startY: number, endY: number;
        if (distance < RENDER_SCOPE) {
            startY = 0;
            endY = distance + RENDER_SCOPE
        } else {
            startY = distance - RENDER_SCOPE
            endY = distance + RENDER_SCOPE
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

        const hitRenderLimit = beats > 0.66 ? beats - 0.66 : 0 // 渲染 0.66秒内的打击特效
        const holdTrees = judgeLine.hnLists;
        const noteTrees = judgeLine.nnLists;
        const soundQueue = this.soundQueue
        if (Object.keys(holdTrees).length || Object.keys(noteTrees). length) {
            judgeLine.updateSpeedIntegralFrom(beats, timeCalculator)
        }
        
        for (let trees of [holdTrees, noteTrees]) {
            for (let name in trees) {
                const tree = trees[name];
                const speedVal: number = tree.speed;
                // debugger
                // 渲染音符
                const timeRanges = judgeLine.computeTimeRange(beats, timeCalculator, startY / speedVal, endY / speedVal);
                tree.timeRanges = timeRanges
                // console.log(timeRanges, startY, endY);
                for (let range of timeRanges) {
                    const start = range[0];
                    const end = range[1];
                    // drawScope(judgeLine.getStackedIntegral(start, timeCalculator))
                    // drawScope(judgeLine.getStackedIntegral(end, timeCalculator))
                    
                    let noteNode: TypeOrTailer<NoteNode> = tree.getNodeAt(start, true);
                    let startBeats;
                    
                    while (!("tailing" in noteNode)
                        && (startBeats = TimeCalculator.toBeats(noteNode.startTime)) < end
                    ) {
                        // 判断是否为多押
                        const isDuplicate = noteNode.notes.length > 1
                            || noteNode.totalNode.noteNodes.some(node => node !== noteNode && node.notes.length)
                        this.renderSameTimeNotes(noteNode, isDuplicate, judgeLine, timeCalculator);
                        noteNode = noteNode.next;
                    }
                    
                }
                // 处理音效
                this.renderSounds(tree, beats, soundQueue, timeCalculator)
                // 打击特效
                if (beats > 0) {
                    if (tree instanceof HNList) {
                        this.renderHoldHitEffects(judgeLine, tree, hitRenderLimit, beats, this.hitContext, timeCalculator)
                    } else {
                        this.renderHitEffects(judgeLine, tree, hitRenderLimit, beats, this.hitContext, timeCalculator)
                    }
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
    renderSounds(tree: NNList, beats: number, soundQueue: SoundEntity[], timeCalculator: TimeCalculator) {
        const lastBeats = this.lastBeats
        let node: Header<NoteNode> | NoteNode = tree.getNodeAt(beats).previous
        while (true) {
            if ("heading" in node || TimeCalculator.toBeats(node.startTime) < lastBeats) {
                break;
            }
            
            const notes = node.notes
            , len = notes.length
            for (let i = 0; i < len; i++) {
                const note = notes[i];
                soundQueue.push(new SoundEntity(note.type, TimeCalculator.toBeats(note.startTime), timeCalculator))
            }
            node = node.previous
        }
    }
    renderHitEffects(judgeLine: JudgeLine, tree: NNList, startBeats: number, endBeats: number, hitContext: CanvasRenderingContext2D, timeCalculator: TimeCalculator) {
        let noteNode = tree.getNodeAt(startBeats, true);
        const end = tree.getNodeAt(endBeats);
        if ("tailing" in noteNode) {
            return;
        }
        while (noteNode !== end) {
            const beats = TimeCalculator.toBeats(noteNode.startTime);
            const base = judgeLine.getBaseCoordinate(beats);
            const thisCoord = judgeLine.getThisCoordinate(beats);
            const bx = base[0] + thisCoord[0]
            const by = base[1] + thisCoord[1];
            const [vx, vy] = getVector(-judgeLine.getStackedValue("rotate", beats) * Math.PI / 180)[0];
            const notes = noteNode.notes
            , len = notes.length
            for (let i = 0; i < len; i++) {
                const note = notes[i];
                const posX = note.positionX;
                const x = bx + posX * vx, y = by + posX * vy;
                const nth = Math.floor((this.time - timeCalculator.toSeconds(beats)) * 30);
                drawNthFrame(hitContext, nth, x - HALF_HIT, -y - HALF_HIT, HIT_EFFECT_SIZE, HIT_EFFECT_SIZE)
            }

            noteNode = <NoteNode>noteNode.next
        } 
    }
    renderHoldHitEffects(judgeLine: JudgeLine, tree: HNList, startBeats: number, endBeats: number, hitContext: CanvasRenderingContext2D, timeCalculator: TimeCalculator) {
        let noteNode = tree.getNodeAt(startBeats, true);
        const end = tree.getNodeAt(endBeats);
        if ("tailing" in noteNode) {
            return;
        }
        while (noteNode !== end) {
            const beats = TimeCalculator.toBeats(noteNode.startTime);
            const base = judgeLine.getBaseCoordinate(beats);
            const thisCoord = judgeLine.getThisCoordinate(beats);
            const bx = base[0] + thisCoord[0]
            const by = base[1] + thisCoord[1];
            const [vx, vy] = getVector(-judgeLine.getStackedValue("rotate", beats) * Math.PI / 180)[0];
            const notes = noteNode.notes
            , len = notes.length
            for (let i = 0; i < len; i++) {
                const note = notes[i];
                if (startBeats > TimeCalculator.toBeats(note.endTime)) {
                    continue;
                }
                const posX = note.positionX;
                const x = bx + posX * vx, y = by + posX * vy;
                const nth = Math.floor((this.beats - Math.floor(this.beats)) * 30);
                drawNthFrame(hitContext, nth, x - HALF_HIT, -y - HALF_HIT, HIT_EFFECT_SIZE, HIT_EFFECT_SIZE)
            }
            noteNode = <NoteNode>noteNode.next
        }
    }
    renderSameTimeNotes(noteNode: NoteNode, duplicated: boolean, judgeLine: JudgeLine, timeCalculator: TimeCalculator) {
        if (noteNode.isHold) {
            const startY = judgeLine.getStackedIntegral(TimeCalculator.toBeats(noteNode.startTime), timeCalculator) * noteNode.parent.speed;
            const notes = noteNode.notes
                , len = notes.length
            for (let i = 0; i < len; i++) {
                const note = notes[i]
                this.renderNote(
                    note,
                    duplicated,
                    startY < 0 ? 0 : startY,
                    judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.endTime), timeCalculator) * note.speed
                    )
            }
        } else {
            const notes = noteNode.notes
            , len = notes.length
            for (let i = 0; i < len; i++) {
                const note = notes[i];
                this.renderNote(
                    note,
                    duplicated,
                    judgeLine.getStackedIntegral(TimeCalculator.toBeats(note.startTime), timeCalculator) * note.speed
                )

            }
        }
    }
    renderNote(note: Note, double: boolean, positionY: number, endpositionY?: number) {
        if (TimeCalculator.toBeats(note.endTime) < this.beats) {
            return;
        }
        let image: HTMLImageElement = getImageFromType(note.type);
        const context = this.context;
        
        if (!note.above) {
            positionY = -positionY;
            endpositionY = -endpositionY
        }
        let length = endpositionY - positionY
        const size = this.noteSize * note.size;
        const half = size / 2;
        const height = this.noteHeight;
        // console.log(NoteType[note.type])
        const opac = note.alpha < 255
        if (opac) {
            context.save()
            context.globalAlpha = note.alpha / 255;
        }
        if (note.type === NoteType.hold) {
            context.drawImage(HOLD_BODY, note.positionX -  half,  positionY - 10, this.noteSize, length)
        }
        context.drawImage(image, note.positionX - half, positionY - 10, size, height)
        if (double) {
            context.drawImage(DOUBLE, note.positionX - half, positionY - 10, size, height);
        }
        if (!note.above) {
            context.drawImage(BELOW, note.positionX - half, positionY - 10, size, height);
        }
        if (opac) {
            context.restore()
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
        this.lastBeats = this.beats
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
        on(["mouseleave", "touchend"], element, () => {
            controlling = false;
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
    type: NoteType;
    // playsSound: boolean;
    // posX: number;
    // posY: number;
    beats: number;
    seconds: number;
    // playingSound: boolean;
    constructor(type: NoteType, beats: number, timeCalculator: TimeCalculator) {
        this.type = type;
        // this.playsSound = playsSound;
        // this.posX = posX;
        // this.posY = posY;
        this.beats = beats;
        this.seconds = timeCalculator.toSeconds(beats)
        // this.playingSound = false;
    }
}

