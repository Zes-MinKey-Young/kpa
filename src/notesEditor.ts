
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


enum NotesEditorState {
    select,
    selecting,
    edit,
    flowing
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
            ).onChange(() => this.noteType = NoteType[this.$typeOption.value.text])
        this.$timeDivisionInput = new ZArrowInputBox()
            .onChange((nb, _) => this.timeDivision = nb)
            .setValue(4)
        this.$noteAboveOption = new ZDropdownOptionBox([new BoxOption("above"), new BoxOption("below")])
            .onChange(() => this.noteAbove = this.$noteAboveOption.value.text === "above")
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
                    editor.chart.operationList.do(new NoteTimeChangeOperation(this.selectedNote, this.selectedNote.parent.parent.getNode([this.pointedBeats, this.beatFraction, this.timeDivision])))
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
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
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
                    const notePos = positions[i];
                    if (pointIsInRect(x, y, notePos, NODE_WIDTH, notePos.height)) {
                        this.selectedNote = notePos.note
                        console.log("dete")
                        break;
                    }
                    console.log(notePos);
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