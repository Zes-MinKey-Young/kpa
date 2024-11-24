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
    },
    {
        basis: 0,
        valueGridSpan: 270,
        valueRange: 1350
    }
]

class EventCurveEditors {
    $element: Z<"div">;
    element: HTMLDivElement;
    $bar: Z<"div">;
    $typeSelect: ZDropdownOptionBox;

    moveX: EventCurveEditor;
    moveY: EventCurveEditor;
    alpha: EventCurveEditor;
    rotate: EventCurveEditor;
    speed: EventCurveEditor;
    easing: EventCurveEditor;

    lastBeats: number
    constructor(width: number, height: number) {
        this.$element = $("div")
        this.$element.addClass("event-curve-editors")

        this.$bar = $("div")
        this.$typeSelect = new ZDropdownOptionBox(arrayForIn([
            "moveX",
            "moveY",
            "alpha",
            "rotate",
            "speed",
            "easing"
        ], (s) => new BoxOption(s)), true);
        this.$typeSelect.onChange((val) => {
            this.selectedEditor = this[val];
        })
        this.$bar.append(this.$typeSelect)
        this.$element.append(this.$bar)

        this.element = this.$element.element;
        for (let type of ["moveX", "moveY", "alpha", "rotate", "speed", "easing"]) {
            this[type] = new EventCurveEditor(EventType[type], height - 24, width)
            this[type].displayed = false;
            this.element.append(this[type].element)
        }
        this.selectedEditor = this.moveX;

    }
    appendTo(element: HTMLElement) {
        element.append(this.element)
    }
    _selectedEditor: EventCurveEditor;
    get selectedEditor() {
        return this._selectedEditor
    }
    set selectedEditor(val) {
        if (this._selectedEditor) this._selectedEditor.displayed = false;
        this._selectedEditor = val;
        val.displayed = true;
        this.draw()
    }
    draw(beats?: number) {
        beats = beats || this.lastBeats
        this.lastBeats = beats;
        console.log("draw")
        this.selectedEditor.draw(beats)
    }
    changeTarget(target: JudgeLine) {
        ["moveX", "moveY", "alpha", "rotate", "speed"].forEach((type) => {
            this[type].target = target.eventLayers[0][type]
        })
        this.draw()
    }
}

class EventCurveEditor {
    type: EventType
    target: EventNodeSequence;

    $element: Z<"div">;
    element: HTMLDivElement
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
            this.element.style.display = ""
        } else {
            this.element.style.display = "none";
        }
    }
    constructor(type: EventType, height: number, width: number) {
        const config = eventTypeMap[type]
        this.type = type
        this._displayed = true;
        this.$element = $("div")
        this.element = this.$element.element;
        this.displayed = false;




        this.canvas = document.createElement("canvas")
        this.element.append(this.canvas)
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
    appendTo(parent: HTMLElement) {
        parent.append(this.element);
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
        if (!this.target) {
            return
        }
        beats = beats || this.lastBeats || 0;
        const {height, width} = this.canvas;
        const {timeRatio, valueRatio, valueBasis: basis, context}= this
        this.drawCoordination(beats)
        const startBeats = beats - this.timeRange / 2;
        const endBeats = beats + this.timeRange / 2;
        let previousEndNode: EventEndNode | Header<EventStartNode> = this.target.getNodeAt(startBeats < 0 ? 0 : startBeats).previous || this.target.head; // 有点奇怪的操作
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
            console.log(this.type, EventType.speed)
            if (this.type === EventType.speed) {
                console.log(startNode)
                context.lineWidth = 1;
                context.strokeText(("" + startNode.cachedIntegral).slice(0, 6), startX, 0)
                context.lineWidth = 3
            }
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
/**
 * 用于Note编辑器记录其中的音符贴图位置
 */
type NotePosition = {
    note: Note,
    x: number,
    y: number,
    height: number,
    type: 1 | 2 | 3
}

class NotesEditor {
    editor: Editor

    $element: Z<"div">;
    $statusBar: Z<"div">;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    _target: JudgeLine;
    targetTree?: NoteTree;
    positionBasis: number
    positionRatio: number;
    positionGridSpan: number;
    positionSpan: number;
    timeRatio: number;
    timeGridSpan: number;
    timeSpan: number;
    padding: number;

    timeGridColor: RGB;
    positionGridColor: RGB;

    state: NotesEditorState;
    wasEditing: boolean;
    pointedPositionX: number;
    pointedBeats: number;
    beatFraction: number
    noteType: NoteType
    timeDivision: number
    noteAbove: boolean

    notePositions: NotePosition[];

    drawn: boolean;

    lastBeats: number;

    $optionBox: ZEditableDropdownOptionBox;
    $typeOption: ZDropdownOptionBox;
    $timeDivisionInput: ZArrowInputBox;
    $noteAboveOption: ZDropdownOptionBox;
    $editButton: ZButton
    allOption: EditableBoxOption
    
    get target() {
        return this._target
    }

    set target(line) {
        if (this._target !== line) {
            this._target = line;
            // update the OptionBox options
            const options = [this.allOption]
            for (let trees of [line.noteTrees, line.holdTrees]) {
                for (let name in trees) {
                    const tree = trees[name];
                    const option = new EditableBoxOption(
                        name,
                        (_, t) => {
                            trees[name] = null;
                            name = t
                            trees[name] = tree
                        },
                        () => this.targetTree = tree
                        )
                    options.push(option)
                }

            }
            this.$optionBox.replaceWithOptions(options)
        }
    }

    constructor(editor: Editor, width: number, height: number) {
        this.allOption = new EditableBoxOption("*", (_s, t) => {}, () => this.targetTree = null, () => undefined, false)

        this.$element = $("div").addClass("notes-editor");
        this.$statusBar = $("div").addClass("notes-editor-status-bar");
        this.$element.append(this.$statusBar)
        this.$optionBox = new ZEditableDropdownOptionBox([this.allOption])
        this.$typeOption = new ZDropdownOptionBox(
            arrayForIn([
                "tap", "hold", "flick", "drag"
            ], (v) => new BoxOption(v))
            ).onInput(() => this.noteType = NoteType[this.$typeOption.value.text])
        this.$timeDivisionInput = new ZArrowInputBox()
            .onChange((nb, _) => this.timeDivision = nb)
            .setValue(4)
        this.$noteAboveOption = new ZDropdownOptionBox([new BoxOption("above"), new BoxOption("below")])
            .onInput(() => this.noteAbove = this.$noteAboveOption.value.text === "above")
        this.$editButton = new ZButton("e/s")
            .onClick(() => {
                this.state = this.state === NotesEditorState.edit ? NotesEditorState.select : NotesEditorState.edit
            })
        this.$statusBar.append(
            this.$optionBox,
            this.$timeDivisionInput,
            this.$typeOption,
            this.$noteAboveOption,
            this.$editButton
            )
        this.$statusBar.css("width", width + "px")

        this.editor = editor;
        this.padding = 10;
        this.targetTree = null;
        this.state = NotesEditorState.select
        this.wasEditing = false;
        this.positionBasis = 0;
        this.positionGridSpan = 135;
        this.positionRatio = width / 1350;
        this.timeGridSpan = 1;
        this.timeSpan = 2;
        this.timeRatio = (height - this.padding) / this.timeSpan;
        this.timeDivision = 4;
        this.noteType = NoteType.tap;
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        console.log("Initialized:", width, height)
        this.context = this.canvas.getContext("2d");
        this.$element.release().append(this.canvas)
        on(["mousedown", "touchstart"], this.canvas, (event) => {this.downHandler(event)})
        on(["mouseup", "touchend"], this.canvas, (event) => this.upHandler(event))
        on(["mousemove", "touchmove"], this.canvas, (event) => {
            const [x, y] = event instanceof MouseEvent ? [event.offsetX, event.offsetY] : [event.changedTouches[0].clientX - this.canvas.offsetLeft, event.changedTouches[0].clientY - this.canvas.offsetTop];
            const {width, height} = this.canvas
            const {padding} = this;
            this.pointedPositionX = Math.round(((x - width / 2 - padding) / this.positionRatio) / this.positionGridSpan) * this.positionGridSpan
            const accurateBeats = (height - y - padding) / this.timeRatio + this.lastBeats
            this.pointedBeats = Math.floor(accurateBeats)
            this.beatFraction = Math.round((accurateBeats - this.pointedBeats) * this.timeDivision)
            if (this.beatFraction === this.timeDivision) {
                this.pointedBeats += 1
                this.beatFraction = 0
            }

            switch (this.state) {
                case NotesEditorState.selecting:
                    console.log("det")
                    editor.chart.operationList.do(new NoteValueChangeOperation(this.selectedNote, "positionX", this.pointedPositionX))
                    editor.noteEditor.update()

            }
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
    downHandler(event: TouchEvent | MouseEvent) {
        const {width, height} = this.canvas;
        console.log(width, height)
        const [offsetX, offsetY] = event instanceof MouseEvent ? [event.offsetX, event.offsetY] : [event.changedTouches[0].clientX - this.canvas.offsetLeft, event.changedTouches[0].clientY - this.canvas.offsetTop];
        const [x, y] = [offsetX - width / 2, offsetY - (this.canvas.height - this.padding)];
        console.log("offset:", offsetX, offsetY)
        console.log("Coord:", x, y);
        switch (this.state) {
            case NotesEditorState.select:
            case NotesEditorState.selecting:
                const positions = this.notePositions;
                const len = positions.length;
                let i = 0;
                for (; i < len; i++) {
                    const pos = positions[i];
                    if (pos.x - NOTE_WIDTH / 2 <= x && x <= pos.x + NOTE_WIDTH / 2 
                    && pos.y <= y && y <= pos.y + pos.height) {
                        this.selectedNote = pos.note
                        console.log("dete")
                        break;
                    }
                    console.log(pos);
                }
                this.state = i === len ? NotesEditorState.select : NotesEditorState.selecting
                console.log(NotesEditorState[this.state])
                this.wasEditing = false;
                break;
            case NotesEditorState.edit:
                const {timeDivision, beatFraction, pointedBeats} = this
                const startTime: TimeT = [pointedBeats, beatFraction, timeDivision];
                const endTime: TimeT = this.noteType === NoteType.hold ? [pointedBeats + 1, 0, 1] : [...startTime]
                const note = new Note({
                    endTime: endTime,
                    startTime: startTime,
                    visibleTime: 99999,
                    positionX: this.pointedPositionX,
                    alpha: 255,
                    above: this.noteAbove ? 1 : 0,
                    isFake: 0,
                    size: 1.0,
                    speed: 1.0,
                    type: this.noteType,
                    yOffset: 0
                });
                // this.editor.chart.getComboInfoEntity(startTime).add(note)
                this.editor.chart.operationList.do(new NoteAddOperation(note, this.target.getNode(note, true)));
                this.selectedNote = note;
                this.state = NotesEditorState.selecting;
                this.wasEditing = true;
                break;
        }
    }
    upHandler(event) {
        if (this.state === NotesEditorState.selecting) {
            this.state = this.wasEditing ? NotesEditorState.edit : NotesEditorState.select
        }
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
        element.append(this.$element.release())
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
            positionSpan: positionRange,
            positionBasis,
            
            timeGridSpan,
            timeSpan: timeRange,
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

        context.strokeText("State:" + NotesEditorState[this.state], 0, -height + 2)
        // 绘制x坐标线
        // 计算上下界
        const upperEnd = Math.ceil((width / 2 - positionBasis) / positionGridSpan / positionRatio) * positionGridSpan
        const lowerEnd = Math.ceil((-width / 2 - positionBasis) / positionGridSpan / positionRatio) * positionGridSpan
        context.strokeStyle = rgb(...this.positionGridColor)
        context.lineWidth = 1;
        // debugger;
        for (let value = lowerEnd; value < upperEnd; value += positionGridSpan) {
            const positionX = value * positionRatio + positionBasis;
            drawLine(context, positionX, -height + padding, positionX, 0);
            context.strokeText(value + "", positionX, -height + padding)
            // debugger
        }
        context.strokeStyle = rgb(...this.timeGridColor)
        // 绘制时间线
        const startBeats = Math.floor(beats);
        const stopBeats = Math.ceil(beats + timeRange);
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionY = (time - beats)  * timeRatio
            drawLine(context, -width / 2, -positionY, width / 2, -positionY);
            context.strokeText(time + "", -width / 2, -positionY)
            
            context.save()
            context.lineWidth = 1
            for (let i = 1; i < this.timeDivision; i++) {
                const minorPosY = (time + i / this.timeDivision - beats) * timeRatio
                drawLine(context, -width / 2, -minorPosY, width / 2, -minorPosY);
            }
            context.restore()
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
            positionSpan: positionRange,
            positionBasis,
            
            timeGridSpan,
            timeSpan: timeRange,
            timeRatio,
            
            padding} = this;
        const width = canvasWidth - padding * 2;
        const height = canvasHeight - padding * 2;
        this.drawCoordination(beats);
        if (this.targetTree) {
            this.drawTree(this.targetTree, beats)
        } else {
            for (let trees of [this.target.noteTrees, this.target.holdTrees]) {
                for (let speed in trees) {
                    let tree = trees[speed];
                    this.drawTree(tree, beats)
                }
            }
        }
        
        this.drawn = false;
        this.lastBeats = beats
    }
    drawTree(tree: NoteTree, beats: number) {
        const timeRange = this.timeSpan
        let noteNode = tree.getNodeAt(beats, true, tree.editorPointer);
        if ("tailing" in noteNode) {
            return
        }
        while (!("tailing" in noteNode) && TimeCalculator.toBeats(noteNode.startTime) < beats + timeRange) {
            const notes = noteNode.notes
                , length = notes.length
            for (let i = 0; i < length; i++) {
                this.drawNote(beats, notes[i], i === 0)
            }
            noteNode = noteNode.next // 这句之前忘了，卡死了，特此留念（
        }
    }
    drawNote(beats: number, note: Note, isTruck: boolean) {
        const context = this.context;
        const {
            positionGridSpan,
            positionRatio,
            positionSpan: positionRange,
            positionBasis,
            
            timeGridSpan,
            timeSpan: timeRange,
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
        this.notePositions.push({note, x: posX, y: posY, height: NOTE_HEIGHT, type: HEAD})
        if (note.type === NoteType.hold) {
            context.drawImage(HOLD_BODY, posLeft, -end * timeRatio, NOTE_WIDTH, (end - start) * timeRatio);
            this.notePositions.push({note, x: posX, y: -end * timeRatio, height: NOTE_HEIGHT, type: TAIL})
            this.notePositions.push({note, x: posX, y: -end * timeRatio, height: (end - start) * timeRatio, type: BODY})
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
