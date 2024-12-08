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
        this.editor.eventCurveEditors.changeTarget(lineEditor.judgeLine)
        lineEditor.element.classList.add("judge-line-editor-selected")
        this.editor.eventCurveEditors.draw();
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


// @ts-ignore
const WeakRef = "WeakRef" in globalThis ? globalThis.WeakRef : (obj) => ({deref() {
    return obj
}})




class Editor {
    initialized: boolean;
    chartInitialized: boolean;
    audioInitialized: boolean;
    imageInitialized: boolean;

    player: Player;
    notesEditor: NotesEditor;
    eventEditor: EventEditor
    chart: Chart;
    chartData: ChartDataRPE
    progressBar: ProgressBar;
    fileInput: HTMLInputElement
    musicInput: HTMLInputElement
    backgroundInput: HTMLInputElement
    eventCurveEditors: EventCurveEditors

    
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
        this.imageInitialized = false;
        this.audioInitialized = false;
        this.chartInitialized = false

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

        
        this.eventCurveEditors = new EventCurveEditors(this.eventSequenceEle.clientWidth, this.eventSequenceEle.clientHeight);
        this.eventCurveEditors.appendTo(this.eventSequenceEle)

        
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
    checkAndInit() {
        if (this.initialized) {
            return
        }
        this.initialized = this.chartInitialized && this.imageInitialized && this.audioInitialized
        if (this.initialized) {
            this.loadChart();
            this.initFirstFrame();
        }
    }
    readChart(file: File) {
        const reader = new FileReader()
        reader.readAsText(file);
        reader.addEventListener("load", () => {
            if (typeof reader.result !== "string") {
                return;
            }
            let data = JSON.parse(reader.result)
            this.chartData = data
            this.chartInitialized = true;
            this.checkAndInit()
            /**
            player.background = new Image();
            player.background.src = "../cmdysjtest.jpg";
            player.audio.src = "../cmdysjtest.mp3"; */
        })
    }
    loadChart() {
        let chart = Chart.fromRPEJSON(this.chartData);
        this.player.chart = chart;
        this.chart = chart;
        this.judgeLinesEditor = new JudgeLinesEditor(this, this.lineInfoEle)
    }
    initFirstFrame() {
        const chart = this.chart;

        this.notesEditor.target = chart.orphanLines[0]


        this.player.render()
        this.notesEditor.draw(this.player.beats)
        const eventLayer = chart.judgeLines[0].eventLayers[0]
        const height = this.eventSequenceEle.clientHeight;
        const width = this.eventSequenceEle.clientWidth

        this.eventEditor = new EventEditor();
        this.noteEditor = new NoteEditor();
        this.noteInfoEle.append(
            this.eventEditor.element,
            this.noteEditor.element
            );
        this.eventEditor.target = chart.judgeLines[0].eventLayers[0].moveX.head.next
        this.eventEditor.update()
        this.eventEditor.hide()
        // this.noteEditor.target = chart.judgeLines[0].noteTrees["#1"].head.next.notes[0]
    }
    readAudio(file: File) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.addEventListener("load", () => {
            this.player.audio.src = <string>reader.result
            this.player.audio.addEventListener("canplaythrough", () => {
                this.audioInitialized = true;
                this.checkAndInit()
            })
        })
    }
    readImage(file: File) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.addEventListener("load", () => {
            this.player.background = new Image();
            this.player.background.src = <string>reader.result;
            this.imageInitialized = true;
            this.checkAndInit()
        })
    }
    update() {
        requestAnimationFrame(() => {
            if (this.playing) {
                this.update()
            } else {
                this.player.render()
            }
            this.updateEventSequences()
            this.judgeLinesEditor.update()
            this.updateNoteEditor()
            console.log("updated")
        })
    }
    updateEventSequences() {
        this.eventCurveEditors.draw(this.player.beats)
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
