const NODE_WIDTH = 10;
const NODE_HEIGHT = 10;

const NOTE_WIDTH = 54;
const NOTE_HEIGHT = 6

const round = (n: number, r: number) => Math.round(n * 10 ** r) / 10 ** r + ""



const $ = <K extends keyof HTMLElementTagNameMap>(...args: [K]) => new Z(...args);

class JudgeLinesEditor {
    editor: Editor;
    chart: Chart;
    element: HTMLDivElement;
    // orphans: JudgeLine[]
    editors: JudgeLineEditor[];
    metaLineAdded = false;
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
    _selectedLine: JudgeLineEditor;
    get selectedLine() {
        return this._selectedLine
    }
    set selectedLine(lineEditor: JudgeLineEditor) {
        if (this._selectedLine === lineEditor) {
            return;
        }
        if (this.selectedLine) {
            
            this._selectedLine.element.classList.remove("judge-line-editor-selected")
        }
        this._selectedLine = lineEditor;
        this.editor.notesEditor.target = lineEditor.judgeLine;
        lineEditor.element.classList.add("judge-line-editor-selected")
        this.editor.eventCurveEditors.forEach((e) => e.draw())
        this.editor.notesEditor.draw()
    }
    addJudgeLine(judgeLine: JudgeLine) {
        const editor = new JudgeLineEditor(this, judgeLine)
        this.editors.push(editor);
        this.element.appendChild(editor.element);
        if (!this.metaLineAdded) {
            this.metaLineAdded = true;
            this.selectedLine = editor
        }
    }
    update() {
        for (let each of this.editors) {
            each.update()
        }
    }
}

class JudgeLineEditor {
    linesEditor: JudgeLinesEditor;
    element: HTMLDivElement;
    judgeLine: JudgeLine;
    $id: Z<"div">;
    $name: ZInputBox;
    $xSpan: Z<"span">;
    $ySpan: Z<"span">;
    $thetaSpan: Z<"span">;
    $alphaSpan: Z<"span">;
    constructor(linesEditor: JudgeLinesEditor, judgeLine: JudgeLine) {
        this.linesEditor = linesEditor;
        this.judgeLine = judgeLine;
        const element = document.createElement("div");
        element.classList.add("judge-line-editor")
        this.element = element;
        this.$id = $("div").addClass("judgeline-info-id");
        this.$id.text(this.judgeLine.id + "")
        this.$name = new ZInputBox()
        this.$name
            .addClass("judgeline-info-name")
            .setValue(judgeLine.name)
            .onChange((s) => judgeLine.name = s);
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
        element.addEventListener("click", () => {
            this.linesEditor.selectedLine = this;
        })
    }
    update() {
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
    // halfCent: number;
    valueRatio: number;
    timeRatio: number;
    valueRange: number;
    valueBasis: number;
    timeRange: number;
    timeGridSpan: number;
    valueGridSpan: number;

    timeGridColor: RGB;
    valueGridColor: RGB;

    padding: number;

    lastBeats: number;

    _displayed: boolean
    get displayed() {
        return this._displayed
    }
    set displayed(val) {
        if (val === this._displayed) {
            return
        }
        this._displayed = val;
        if (val) {
            this.canvas.style.display = ""
        } else {
            this.canvas.style.display = "none";
        }
    }
    constructor(type: EventType, sequence: EventNodeSequence, height: number, width: number) {
        const config = eventTypeMap[type]
        this._displayed = true;
        this.sequence = sequence;
        this.canvas = document.createElement("canvas")
        this.canvas.width = width//this.canvas.parentElement.clientWidth;
        this.canvas.height = height;
        this.padding = 10;
        this.context = this.canvas.getContext("2d");
        this.timeRange = 4
        // this.halfCent = this.halfRange * 100;
        this.valueRange = config.valueRange;
        this.valueBasis = this.canvas.height * config.basis;
        this.valueRatio = this.canvas.height / this.valueRange;
        this.timeRatio = this.canvas.width / this.timeRange;
        this.timeGridSpan = 1;
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
        const {height: canvasHeight, width: canvasWidth} = this.canvas;
        const height = canvasHeight - this.padding * 2, width = canvasWidth - this.padding * 2;
        const {timeGridSpan, valueGridSpan, valueRatio, context} = this;
        context.fillRect(-canvasWidth / 2, -canvasHeight / 2, canvasWidth, canvasHeight)
        // const beatCents = beats * 100
        // const middleValue = Math.round(-this.basis / this.valueRatio)
        // 计算上下界
        const upperEnd = Math.ceil((height / 2 - this.valueBasis) / valueGridSpan / valueRatio) * valueGridSpan
        const lowerEnd = Math.ceil((-height / 2 - this.valueBasis) / valueGridSpan / valueRatio) * valueGridSpan
        context.strokeStyle = rgb(...this.valueGridColor)
        context.lineWidth = 1;

        for (let value = lowerEnd; value < upperEnd; value += valueGridSpan) {
            const positionY = value * valueRatio + this.valueBasis;
            drawLine(context, -canvasWidth / 2, -positionY, canvasWidth, -positionY);
            context.strokeText(value + "", -width / 2, -positionY)
        }
        context.strokeStyle = rgb(...this.timeGridColor)
        
        const stopBeats = Math.ceil((beats + this.timeRange / 2) / timeGridSpan) * timeGridSpan;
        const startBeats = Math.ceil((beats - this.timeRange / 2) / timeGridSpan) * timeGridSpan;
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionX = (time - beats)  * this.timeRatio
            drawLine(context, positionX, height / 2, positionX, -height / 2);
            context.strokeText(time + "", positionX, height / 2)
        }

        context.lineWidth = 3;
        drawLine(context, 0, width / 2, 0, -width / 2)
        context.strokeStyle = "#EEE";
    }
    draw(beats?: number) {
        beats = beats || this.lastBeats || 0;
        const {height, width} = this.canvas;
        const {timeRatio, valueRatio, valueBasis: basis, context}= this
        this.drawCoordination(beats)
        const startBeats = beats - this.timeRange / 2;
        const endBeats = beats + this.timeRange / 2;
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
            const startX = (startTime - beats) * timeRatio;
            const endX   = (endTime   - beats) * timeRatio;
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
            const startX = (startTime - beats) * timeRatio;
            const startY = startValue * valueRatio + basis;
            drawLine(context, startX, startY, width / 2, startY);
            context.drawImage(NODE_START, startX, -startY - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT)
        }
        this.lastBeats = beats;
    }
}

// @ts-ignore
const WeakRef = "WeakRef" in globalThis ? globalThis.WeakRef : (obj) => ({deref() {
    return obj
}})

enum NotesEditorState {
    select,
    selecting,
    edit,
    flowing
}


const HEAD = 1;
const BODY = 2;
const TAIL = 3;
type NotePosition = [
    note: Note,
    x: number,
    y: number,
    height: number,
    type: 1 | 2 | 3
]

class NotesEditor {
    editor: Editor

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    target: JudgeLine;
    positionBasis: number
    positionRatio: number;
    positionGridSpan: number;
    positionRange: number;
    timeRatio: number;
    timeGridSpan: number;
    timeRange: number;
    padding: number;

    timeGridColor: RGB;
    positionGridColor: RGB;

    state: NotesEditorState;

    notePositions: NotePosition[];

    drawn: boolean;

    lastBeats: number;
    
    constructor(editor: Editor, width: number, height: number) {
        this.editor = editor;
        this.padding = 10;
        this.target = null;
        this.state = NotesEditorState.select
        this.positionBasis = 0;
        this.positionGridSpan = 135;
        this.positionRatio = width / 1350;
        this.timeGridSpan = 1;
        this.timeRange = 4;
        this.timeRatio = (height - this.padding) / this.timeRange;
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext("2d");
        on(["mousedown", "touchstart"], this.canvas, (event) => {
            const [clientX, clientY] = event instanceof MouseEvent ? [event.offsetX, event.offsetY] : [event.changedTouches[0].clientX - this.canvas.offsetLeft, event.changedTouches[0].clientY - this.canvas.offsetTop];
            const [x, y] = [clientX - width / 2, clientY - (this.canvas.height - this.padding)];
            console.log(x, y);
            switch (this.state) {
                case NotesEditorState.select:
                case NotesEditorState.selecting:
                    const positions = this.notePositions;
                    const len = positions.length;
                    let i = 0;
                    for (; i < len; i++) {
                        const pos = positions[i];
                        if (pos[1] - NOTE_WIDTH / 2 <= x && x <= pos[1] + NOTE_WIDTH / 2 
                        && pos[2] <= y && y <= pos[2] + pos[3]) {
                            this.selectedNote = pos[0]
                            break;
                        }
                        console.log(pos);
                    }
                    this.state = i === len ? NotesEditorState.select : NotesEditorState.selecting
                case NotesEditorState.edit:

            }
        })
        on(["mousemove", "touchmove"], this.canvas, (event) => {
            const [x, y] = event instanceof MouseEvent ? [event.clientX, event.clientY] : [event.changedTouches[0].clientY, event.changedTouches[0].clientY];
            

        })
        on(["mousedown", "mousemove", "touchstart", "touchmove"], this.canvas, (event) => {
            if (this.drawn) {
                return
            }
            requestAnimationFrame(() => this.draw(this.lastBeats));
            this.drawn = true;
        })
        
        this.timeGridColor = [120, 255, 170];
        this.positionGridColor = [255, 170, 120];
        this.init()
    }
    _selectedNote: WeakRef<Note>;
    get selectedNote() {
        if (!this._selectedNote) {
            return undefined;
        }
        return this._selectedNote.deref()
    }
    set selectedNote(val: Note) {
        this._selectedNote = new WeakRef(val);
        this.editor.noteEditor.target = val;
    }
    appendTo(element: HTMLElement) {
        element.append(this.canvas)
    }
    init() {
        this.context.translate(this.canvas.width / 2, this.canvas.height - this.padding)
        this.context.strokeStyle = "#EEE"
        this.context.fillStyle = "#333"
        this.context.lineWidth = 2
    }
    drawCoordination(beats: number) {
        const {context, canvas} = this;
        const {width: canvasWidth, height: canvasHeight} = canvas;
        console.log(canvasWidth, canvasHeight)
        const {
            positionGridSpan,
            positionRatio,
            positionRange,
            positionBasis,
            
            timeGridSpan,
            timeRange,
            timeRatio,
            
            padding} = this;
        const width = canvasWidth - padding * 2
        const height = canvasHeight - padding * 2

        context.fillRect(-canvasWidth / 2, padding - canvasHeight, canvasWidth, canvasHeight)

        context.save()
        context.lineWidth = 5;
        context.strokeStyle = "#EEE";
        // 基线
        drawLine(context, -canvasWidth / 2, 0, canvasWidth / 2, 0);
        context.restore()
        // 绘制x坐标线
        // 计算上下界
        const upperEnd = Math.ceil((width / 2 - positionBasis) / positionGridSpan / positionRatio) * positionGridSpan
        const lowerEnd = Math.ceil((-width / 2 - positionBasis) / positionGridSpan / positionRatio) * positionGridSpan
        context.strokeStyle = rgb(...this.positionGridColor)
        context.lineWidth = 1;
        debugger;
        for (let value = lowerEnd; value < upperEnd; value += positionGridSpan) {
            const positionX = value * positionRatio + positionBasis;
            drawLine(context, positionX, -height + padding, positionX, 0);
            context.strokeText(value + "", -height + padding, positionX)
            debugger
        }
        context.strokeStyle = rgb(...this.timeGridColor)
        // 绘制时间线
        const startBeats = Math.floor(beats);
        const stopBeats = Math.ceil(beats + timeRange);
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionY = (time - beats)  * timeRatio
            drawLine(context, -width / 2, -positionY, width / 2, -positionY);
            context.strokeText(time + "", -width / 2, -positionY)
        }
    }
    draw(beats?: number) {
        beats = beats || this.lastBeats || 0;
        this.notePositions = [];
        const {context, canvas} = this;
        const {width: canvasWidth, height: canvasHeight} = canvas;
        const {
            positionGridSpan,
            positionRatio,
            positionRange,
            positionBasis,
            
            timeGridSpan,
            timeRange,
            timeRatio,
            
            padding} = this;
        const width = canvasWidth - padding * 2;
        const height = canvasHeight - padding * 2;
        this.drawCoordination(beats);

        for (let trees of [this.target.noteTrees, this.target.holdTrees]) {
            for (let speed in trees) {
                let tree = trees[speed];
                let note = tree.getNoteAt(beats, true, tree.editorPointer);
                while (!("tailing" in note) && TimeCalculator.toBeats(note.startTime) < beats + timeRange) {
                    let branch = note;
                    do {
                        this.drawNote(beats, branch, branch === note);
                    } while (branch = branch.nextSibling)
                    note = note.next;
                }
            }
        }
        this.drawn = false;
        this.lastBeats = beats
    }
    drawNote(beats: number, note: Note, isTruck: boolean) {
        const context = this.context;
        const {
            positionGridSpan,
            positionRatio,
            positionRange,
            positionBasis,
            
            timeGridSpan,
            timeRange,
            timeRatio,
            
            padding} = this;
        const posX = note.positionX * positionRatio
        const posLeft = posX - NOTE_WIDTH / 2;
        const start = TimeCalculator.toBeats(note.startTime) - beats
        const end = TimeCalculator.toBeats(note.endTime) - beats
        const posY = -start * timeRatio
        context.drawImage(getImageFromType(note.type), posLeft, posY , NOTE_WIDTH, NOTE_HEIGHT)
        if (isTruck) {
            context.drawImage(TRUCK, posLeft, posY , NOTE_WIDTH, NOTE_HEIGHT)
        }
        this.notePositions.push([note, posX, posY, NOTE_HEIGHT, HEAD])
        if (note.type === NoteType.hold) {
            context.drawImage(HOLD_BODY, posLeft, -end * timeRatio, NOTE_WIDTH, (end - start) * timeRatio);
            this.notePositions.push([note, posX, -end * timeRatio, NOTE_HEIGHT, TAIL])
            this.notePositions.push([note, posX, -end * timeRatio, (end - start) * timeRatio, BODY])
        }
        if (note === this.selectedNote) {
            if (note.type === NoteType.hold) {
                context.drawImage(SELECT_NOTE, posLeft, -end * timeRatio, NOTE_WIDTH, (end - start) * timeRatio);
            } else {
                context.drawImage(SELECT_NOTE, posLeft, posY , NOTE_WIDTH, NOTE_HEIGHT)
            }
        }
    }
}

class Editor {
    initialized: boolean;
    chartInitialized: boolean;
    audioInitialized: boolean;
    imageInitialized: boolean;

    player: Player;
    notesEditor: NotesEditor;
    eventEditor: EventEditor
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

    judgeLinesEditor: JudgeLinesEditor;
    selectedLine: JudgeLine;
    noteEditor: NoteEditor;

    constructor() {
        this.initialized = false;
        this.eventCurveEditors = [];

        this.topbarEle = <HTMLDivElement>document.getElementById("topbar")
        this.previewEle = <HTMLDivElement>document.getElementById("preview")
        this.eventSequenceEle = <HTMLDivElement>document.getElementById("eventSequence")
        this.noteInfoEle = <HTMLDivElement>document.getElementById("noteInfo")
        this.lineInfoEle = <HTMLDivElement>document.getElementById("lineInfo")

        this.player = new Player(<HTMLCanvasElement>document.getElementById("player"), this);
        this.notesEditor = new NotesEditor(this, this.previewEle.clientWidth - this.player.canvas.width, this.player.canvas.height)
        this.notesEditor.appendTo(this.previewEle)
        this.progressBar = new ProgressBar(this.player.audio, () => this.pause(), () => {
            this.update();
            this.player.render();
        });
        this.progressBar.appendTo(this.topbarEle)
        this.fileInput = <HTMLInputElement>document.getElementById("fileInput")
        this.musicInput = <HTMLInputElement>document.getElementById("musicInput")
        this.backgroundInput = <HTMLInputElement>document.getElementById("backgroundInput")

        

        
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
        this.previewEle.addEventListener("wheel", (event) => {
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
            currentTime += event.deltaY / 500;
            if (currentTime > audio.duration) {
                currentTime = audio.duration
            } else if (currentTime < 0) {
                currentTime = 0;
            }
            audio.currentTime = currentTime
            this.progressBar.update()
            this.update()
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

        this.notesEditor.target = chart.orphanLines[0]


        this.player.render()
        this.notesEditor.draw(this.player.beats)
        const eventLayer = chart.judgeLines[0].eventLayers[0]
        const height = this.eventSequenceEle.clientHeight;
        const width = this.eventSequenceEle.clientWidth
        for (let type in eventLayer) {
            const eventCurveEditor = new EventCurveEditor(EventType[type], eventLayer[type], height, width);
            this.eventSequenceEle.appendChild(eventCurveEditor.canvas)
            this.eventCurveEditors.push(eventCurveEditor);
            eventCurveEditor.draw(0);
            eventCurveEditor.displayed = false;
        }
        this.eventCurveEditors[0].displayed = true;

        this.eventEditor = new EventEditor();
        this.noteEditor = new NoteEditor();
        this.noteInfoEle.append(
            this.eventEditor.element,
            this.noteEditor.element
            );
        this.eventEditor.target = chart.judgeLines[0].eventLayers[0].moveX.head.next
        this.eventEditor.update()
        this.eventEditor.hide()
        this.noteEditor.target = chart.judgeLines[0].noteTrees[1].head.next
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
                this.update()
            }
            this.updateEventSequences()
            this.judgeLinesEditor.update()
            this.updateNoteEditor()
            console.log("updated")
        })
    }
    updateEventSequences() {
        this.eventCurveEditors.forEach((each) => each.draw(this.player.beats))
    }
    updateNoteEditor() {
        this.notesEditor.draw(this.player.beats)
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
