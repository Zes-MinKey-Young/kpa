const NODE_WIDTH = 10;
const NODE_HEIGHT = 10;

const round = (n: number, r: number) => Math.round(n * 10 ** r) / 10 ** r + ""

class z$<K extends keyof HTMLElementTagNameMap> {
    element: HTMLElementTagNameMap[K];
    constructor(type: K) {
        this.element = document.createElement(type);
    }
    html(str: string) {
        this.element.innerHTML = str
        return this;
    }
    text(str: string) {
        const childNodes = this.element.childNodes
        if (childNodes.length === 1 && childNodes[0].nodeType === Node.TEXT_NODE) {
            childNodes[0].nodeValue = str;
        } else {
            this.element.replaceChildren(str)
        }
        return this
    }
    addClass(...classes: string[]) {
        this.element.classList.add(...classes)
        return this;
    }
    release() {
        return this.element;
    }
}

const $ = <K extends keyof HTMLElementTagNameMap>(...args: [K]) => new z$(...args);

class JudgeLinesEditor {
    editor: Editor;
    chart: Chart;
    element: HTMLDivElement;
    // orphans: JudgeLine[]
    editors: JudgeLineEditor[];
    constructor(editor: Editor, element: HTMLDivElement) {
        this.chart = editor.chart;
        this.editor = editor
        this.element = element;
        this.editors = []
        // this.orphans = [];
        for (let each of this.chart.orphanLines) {
            this.addJudgeLine(each)
        }
    }
    addJudgeLine(judgeLine: JudgeLine) {
        const editor = new JudgeLineEditor(judgeLine)
        this.editors.push(editor);
        this.element.appendChild(editor.element)
    }
    update() {
        for (let each of this.editors) {
            each.update()
        }
    }
}

class JudgeLineEditor {
    element: HTMLDivElement;
    judgeLine: JudgeLine;
    $id: z$<"div">;
    $name: z$<"div">;
    $xSpan: z$<"span">;
    $ySpan: z$<"span">;
    $thetaSpan: z$<"span">;
    $alphaSpan: z$<"span">;
    constructor(judgeLine: JudgeLine) {
        this.judgeLine = judgeLine;
        const element = document.createElement("div");
        element.classList.add("judge-line-editor")
        this.element = element;
        this.$id = $("div").addClass("judgeline-info-id");
        this.$name = $("div").addClass("judgeline-info-name");
        this.$xSpan = $("span");
        this.$ySpan = $("span");
        this.$thetaSpan = $("span");
        this.$alphaSpan = $("span");
        element.append(
            this.$id.release(),
            this.$name.release(),
            $("span").text("x: ").release(),
            this.$xSpan.release(),
            $("span").text("y: ").release(),
            this.$ySpan.release(),
            $("span").text("θ: ").release(),
            this.$thetaSpan.release(),
            $("span").text("α: ").release(),
            this.$alphaSpan.release()
        )
    }
    update() {
        this.$id.text(this.judgeLine.id + "")
        this.$xSpan.text(round(this.judgeLine.moveX, 2))
        this.$ySpan.text(round(this.judgeLine.moveY, 2))
        this.$thetaSpan.text(round(this.judgeLine.rotate / Math.PI * 180, 2))
        this.$alphaSpan.text(Math.round(this.judgeLine.alpha) + "(" + Math.round(this.judgeLine.alpha).toString(16) + ")")
    }
}

const eventTypeMap = [
    {
        basis: 0,
        valueGridSpan: 270,
        valueRange: 1350
    },
    {
        basis: 0,
        valueGridSpan: 180,
        valueRange: 900
    },
    {
        basis: 0,
        valueGridSpan: 90,
        valueRange: 720
    },
    {
        basis: -0.5,
        valueGridSpan: 17,
        valueRange: 255
    },
    {
        basis: -0.25,
        valueGridSpan: 2,
        valueRange: 20
    }
]

class EventCurveEditor {
    sequence: EventNodeSequence;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    halfRange: number;
    halfCent: number;
    valueRatio: number;
    timeRatio: number;
    valueRange: number;
    basis: number;
    timeCentGridSpan: number;
    valueGridSpan: number;
    timeGridColor: RGB;
    valueGridColor: RGB;
    width: number;
    height: number;
    constructor(type: EventType, sequence: EventNodeSequence, height: number, width: number) {
        const config = eventTypeMap[type]
        this.sequence = sequence;
        this.canvas = document.createElement("canvas")
        this.canvas.width = width//this.canvas.parentElement.clientWidth;
        this.canvas.height = height;
        this.height = height - 20
        this.width = width - 20
        this.context = this.canvas.getContext("2d");
        this.halfRange = 2
        this.halfCent = this.halfRange * 100;
        this.valueRange = config.valueRange;
        this.basis = this.canvas.height * config.basis;
        this.valueRatio = this.canvas.height / this.valueRange;
        this.timeRatio = this.canvas.width / 2 / this.halfCent;
        this.timeCentGridSpan = 100;
        this.valueGridSpan = config.valueGridSpan;
        this.timeGridColor = [120, 255, 170];
        this.valueGridColor = [255, 170, 120];
        this.update()
    }
    update() {
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.context.strokeStyle = "#EEE"
        this.context.fillStyle = "#333"
        this.context.lineWidth = 2
    }
    drawCoordination(beats: number) {
        const {height, width} = this;
        const beatCents = beats * 100
        const {timeCentGridSpan, valueGridSpan, valueRatio, context} = this;
        // const middleValue = Math.round(-this.basis / this.valueRatio)
        const upperEnd = Math.ceil((height / 2 - this.basis) / valueGridSpan / valueRatio) * valueGridSpan
        const lowerEnd = Math.ceil((-height / 2 - this.basis) / valueGridSpan / valueRatio) * valueGridSpan
        context.strokeStyle = rgb(...this.valueGridColor)
        context.lineWidth = 1;

        for (let value = lowerEnd; value < upperEnd; value += valueGridSpan) {
            const positionY = value * valueRatio + this.basis;
            drawLine(context, -width / 2, -positionY, width, -positionY);
            context.strokeText(value + "", -width / 2, -positionY)
        }
        context.strokeStyle = rgb(...this.timeGridColor)
        
        const stopCents = Math.ceil(beats + this.halfRange) * 100;
        const startCents = Math.ceil(beats - this.halfRange) * 100;
        for (let time = startCents; time < stopCents; time += timeCentGridSpan) {
            const positionX = (time - beatCents)  * this.timeRatio
            drawLine(context, positionX, height / 2, positionX, -height / 2);
            context.strokeText(time / 100 + "", positionX, height / 2)
        }

        context.lineWidth = 3;
        drawLine(context, 0, width / 2, 0, -width / 2)
        context.strokeStyle = "#EEE";
    }
    draw(beats: number) {
        const {height, width} = this.canvas;
        const {timeRatio, valueRatio, basis, context}= this
        this.context.fillRect(-width / 2, -height / 2, width, height)
        this.drawCoordination(beats)
        const startBeats = beats - this.halfRange;
        const endBeats = beats + this.halfRange;
        let previousEndNode: EventEndNode | Header<EventStartNode> = this.sequence.getNodeAt(startBeats < 0 ? 0 : startBeats).previous || this.sequence.head; // 有点奇怪的操作
        let previousTime = "heading" in previousEndNode ? 0: TimeCalculator.toBeats(previousEndNode.time);
        while (previousTime < endBeats) {
            const startNode = previousEndNode.next;
            const endNode = startNode.next;
            if ("tailing" in endNode) {
                break;
            }
            const startTime = TimeCalculator.toBeats(startNode.time);
            const endTime = TimeCalculator.toBeats(endNode.time);
            const startValue = startNode.value;
            const endValue   = endNode.value;
            const startX = (startTime - beats) * 100 * timeRatio;
            const endX   = (endTime   - beats) * 100 * timeRatio;
            const startY = startValue * valueRatio + basis;
            const endY   = endValue   * valueRatio + basis;
            startNode.easing.drawCurve(context, startX, -startY, endX, -endY)
            context.drawImage(NODE_START, startX, -startY - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT)
            context.drawImage(NODE_END, endX - NODE_WIDTH, -endY - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT)
            previousEndNode = endNode;
            previousTime = endTime;
        }
        if ("tailing" in previousEndNode.next.next) {
            const lastStart = previousEndNode.next;
            const startTime = TimeCalculator.toBeats(lastStart.time);
            const startValue = lastStart.value;
            const startX = (startTime - beats) * 100 * timeRatio;
            const startY = startValue * valueRatio + basis;
            drawLine(context, startX, startY, width / 2, startY);
            context.drawImage(NODE_START, startX, -startY - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT)
        }
        
        /*
        const beatCents = beats * 100
        const stop = beatCents + this.halfCent;
        let b = beatCents - this.halfCent
        if (b < 10) {
            b = 10
        }
        let lastValue = this.sequence.getValueAt((b - 10) / 100)
        for (; b < stop; b+=10) {
            let nowValue = this.sequence.getValueAt(b / 100)
            this.context.beginPath()
            this.context.moveTo((b - 10 - beatCents) * this.timeRatio, lastValue * this.valueRatio + this.basis)
            this.context.lineTo((b - beatCents) * this.timeRatio, nowValue * this.valueRatio + this.basis)
            this.context.stroke()
            debugger
            lastValue = nowValue;
        }
        */
    }
}

class Editor {
    initialized: boolean;
    chartInitialized: boolean;
    audioInitialized: boolean;
    imageInitialized: boolean;

    player: Player;
    chart: Chart;
    progressBar: ProgressBar;
    fileInput: HTMLInputElement
    musicInput: HTMLInputElement
    backgroundInput: HTMLInputElement
    eventCurveEditors: EventCurveEditor[]

    
    topbarEle: HTMLDivElement;
    previewEle: HTMLDivElement;
    noteInfoEle: HTMLDivElement;
    eventSequenceEle: HTMLDivElement;
    lineInfoEle: HTMLDivElement;
    playButton: HTMLButtonElement;

    judgeLinesEditor: JudgeLinesEditor
    constructor() {
        this.initialized = false;
        this.player = new Player(<HTMLCanvasElement>document.getElementById("player"), this)
        this.progressBar = new ProgressBar(this.player.audio, () => this.pause(), () => this.player.render());
        this.fileInput = <HTMLInputElement>document.getElementById("fileInput")
        this.musicInput = <HTMLInputElement>document.getElementById("musicInput")
        this.backgroundInput = <HTMLInputElement>document.getElementById("backgroundInput")

        
        this.topbarEle = <HTMLDivElement>document.getElementById("topbar")
        this.progressBar.appendTo(this.topbarEle)
        this.previewEle = <HTMLDivElement>document.getElementById("preview")
        this.eventSequenceEle = <HTMLDivElement>document.getElementById("eventSequence")
        this.noteInfoEle = <HTMLDivElement>document.getElementById("noteInfo")
        this.lineInfoEle = <HTMLDivElement>document.getElementById("lineInfo")

        
        this.playButton = <HTMLButtonElement>document.getElementById("playButton")
        this.playButton.addEventListener("click", (event) => {
            if (!this.playing) {
                this.play();
            } else {
                this.pause();
            }
        })

        this.fileInput.addEventListener("change", () => {
            this.readChart(this.fileInput.files[0])
        })

        this.musicInput.addEventListener("change", () => {
            this.readAudio(this.musicInput.files[0])
        })


        this.backgroundInput.addEventListener("change", () => {
            this.readImage(this.backgroundInput.files[0])
        })
        window.addEventListener("wheel", (event) => {
            if (!this.initialized) {
                return;
            }
            const player = this.player;
            if (this.playing) {
                this.pause();
            }
            const audio = this.player.audio;
            let currentTime = audio.currentTime;
            console.log(event.deltaY)
            currentTime += event.deltaY / 250;
            if (currentTime > audio.duration) {
                currentTime = audio.duration
            } else if (currentTime < 0) {
                currentTime = 0;
            }
            audio.currentTime = currentTime
            this.progressBar.update()
            this.player.render()
            // event.preventDefault()
        })
    }
    readChart(file: File) {
        const reader = new FileReader()
        reader.readAsText(file);
        reader.addEventListener("load", () => {
            if (typeof reader.result !== "string") {
                return;
            }
            let data = JSON.parse(reader.result)
            let chart = Chart.fromRPEJSON(data);
            this.player.chart = chart;
            this.chart = chart;
            this.chartInitialized = true;
            this.judgeLinesEditor = new JudgeLinesEditor(this, this.lineInfoEle)
            if (this.chartInitialized && this.imageInitialized) {
                this.initFirstFrame();
            }
            this.initialized = this.chartInitialized && this.imageInitialized && this.audioInitialized
            /**
            player.background = new Image();
            player.background.src = "../cmdysjtest.jpg";
            player.audio.src = "../cmdysjtest.mp3"; */
        })
    }
    initFirstFrame() {
        const chart = this.chart;
        this.player.render()
        this.eventCurveEditors = [];
        const eventLayer = chart.judgeLines[0].eventLayers[0]
        const height = this.eventSequenceEle.clientHeight;
        const width = this.eventSequenceEle.clientWidth
        for (let type in eventLayer) {
            const eventCurveEditor = new EventCurveEditor(EventType[type], eventLayer[type], height, width);
            this.eventSequenceEle.appendChild(eventCurveEditor.canvas)
            this.eventCurveEditors.push(eventCurveEditor);
            eventCurveEditor.draw(0);
        }
    }
    readAudio(file: File) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.addEventListener("load", () => {
            this.player.audio.src = <string>reader.result
            this.audioInitialized = true;
            this.initialized = this.chartInitialized && this.imageInitialized && this.audioInitialized
        })
    }
    readImage(file: File) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.addEventListener("load", () => {
            this.player.background = new Image();
            this.player.background.src = <string>reader.result;
            this.imageInitialized = true;
            if (this.chartInitialized && this.imageInitialized) {
                this.initFirstFrame();
            }
            this.initialized = this.chartInitialized && this.imageInitialized && this.audioInitialized
        })
    }
    update() {
        requestAnimationFrame(() => {
            if (this.playing) {
                this.updateEventSequences()
                this.update()
            }
            this.judgeLinesEditor.update()
            console.log("updated")
        })
    }
    updateEventSequences() {
        this.eventCurveEditors.forEach((each) => each.draw(this.player.beats))
    }
    get playing(): boolean {
        return this.player.playing
    }
    play() {
        if (this.playing) {
            return;
        }
        this.playButton.innerHTML = "暂停"
        this.player.play()
        this.update()
    }
    pause() {
        this.player.pause()
        this.playButton.innerHTML = "继续"
    }
}
