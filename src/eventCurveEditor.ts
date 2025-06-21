
const eventTypeMap = [
    { // moveX
        basis: 0,
        valueGridSpan: 135,
        valueRange: 1350
    },
    { // moveY
        basis: 0,
        valueGridSpan: 180,
        valueRange: 900
    },
    { // rotate
        basis: 0,
        valueGridSpan: 90,
        valueRange: 720
    },
    { // alpha
        basis: -0.5,
        valueGridSpan: 17,
        valueRange: 255
    },
    { // speed
        basis: -0.25,
        valueGridSpan: 2,
        valueRange: 20
    },
    { // easing
        basis: 0,
        valueGridSpan: 270,
        valueRange: 1350
    },
    { // bpm
        basis: -0.5,
        valueGridSpan: 40,
        valueRange: 300
    }
]

type EventTypeName = "moveX" | "moveY" | "alpha" | "rotate" | "speed" | "easing" | "bpm";

enum NewNodeState {
    controlsStart,
    controlsEnd,
    controlsBoth
}

class EventCurveEditors extends Z<"div"> {
    element: HTMLDivElement;
    $bar: Z<"div">;
    $typeSelect: ZDropdownOptionBox;
    $layerSelect: ZDropdownOptionBox;
    $editSwitch: ZSwitch;
    $easingBox: ZEasingBox;
    $newNodeStateSelect: ZDropdownOptionBox


    moveX: EventCurveEditor;
    moveY: EventCurveEditor;
    alpha: EventCurveEditor;
    rotate: EventCurveEditor;
    speed: EventCurveEditor;
    easing: EventCurveEditor;
    bpm: EventCurveEditor;

    lastBeats: number;

    clipboard: Set<EventStartNode>;
    nodesSelection: Set<EventStartNode>;

    $selectOption: ZDropdownOptionBox;
    selectState: SelectState;
    $copyButton: ZButton;
    $pasteButton: ZButton;
    constructor(width: number, height: number) {
        super("div")
        this.addClass("event-curve-editors")

        this.$bar = $("div").addClass("flex-row")
        this.$typeSelect = new ZDropdownOptionBox([
            "moveX",
            "moveY",
            "alpha",
            "rotate",
            "speed",
            "easing",
            "bpm"
        ].map((s) => new BoxOption(s)), true);
        this.$typeSelect.onChange((val) => {
            this.selectedEditor = this[val];
        })

        this.$layerSelect = new ZDropdownOptionBox(["0", "1", "2", "3", "ex"].map((s) => new BoxOption(s)), true);
        this.$layerSelect.onChange((val) => {
            this.selectedLayer = val;
        });
        this.$editSwitch = new ZSwitch("Edit");
        this.$easingBox = new ZEasingBox(true)
            .onChange(id => {
                for (let type of ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm"] as const) {
                    this[type].easing = rpeEasingArray[id];
                }
            });
        this.$easingBox.setValue(easingMap.linear.in);
        this.$newNodeStateSelect = new ZDropdownOptionBox([
            "Both",
            "Start",
            "End"
        ].map((s) => new BoxOption(s)), true)
            .onChange((val) => {
                for (let type of ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm"] as const) {
                    this[type].newNodeState = NewNodeState["controls" + val];
                }
            });
            
        this.$selectOption = new ZDropdownOptionBox(["none", "extend", "replace", "exclude"].map(v => new BoxOption(v)), true)
        
        this.$copyButton = new ZButton("Copy")
        this.$pasteButton = new ZButton("Paste")



        this.$bar.append(
            this.$typeSelect,
            this.$layerSelect,
            this.$selectOption,
            this.$editSwitch,
            this.$copyButton,
            this.$pasteButton,
            this.$easingBox,
            this.$newNodeStateSelect
        )
        this.append(this.$bar)

        for (let type of ["moveX", "moveY", "alpha", "rotate", "speed", "easing", "bpm"] as const) {
            this[type] = new EventCurveEditor(EventType[type], height - 40, width, this);
            this[type].displayed = false;
            this.append(this[type].element)
        }
        this.nodesSelection = new Set<EventStartNode>();
        this.selectedEditor = this.moveX;

    }
    _selectedEditor: EventCurveEditor;
    get selectedEditor() {
        return this._selectedEditor
    }
    set selectedEditor(val) {
        if (val === this._selectedEditor) return;
        if (this._selectedEditor) this._selectedEditor.displayed = false;
        this._selectedEditor = val;
        val.displayed = true;
        this.nodesSelection = new Set<EventStartNode>();
        this.draw()
    }
    _selectedLayer: "0" | "1" | "2" | "3" | "ex" = "0";
    get selectedLayer() {
        return this._selectedLayer
    }
    set selectedLayer(val) {
        this._selectedLayer = val;
        ["moveX", "moveY", "alpha", "rotate", "speed"].forEach((type) => {
            this[type].changeTarget(this.target, val)
        })
    }
    draw(beats?: number) {
        beats = beats || this.lastBeats
        this.lastBeats = beats;
        //console.log("draw")
        this.selectedEditor.draw(beats)
    }
    target: JudgeLine;
    changeTarget(target: JudgeLine) {
        ["moveX", "moveY", "alpha", "rotate", "speed"].forEach((type) => {
            this[type].changeTarget(target, this.selectedLayer)
        })
        this.target = target;
        this.draw()
    }
}

type NodePosition = {
    node: EventNode;
    x: number;
    y: number
}

enum EventCurveEditorState {
    select,
    selecting,
    edit,
    flowing,
    selectScope,
    selectingScope
}

class EventCurveEditor {
    type: EventType
    target: EventNodeSequence;
    parentEditorSet: EventCurveEditors;

    innerHeight: number;
    innerWidth: number;

    $element: Z<"div">;
    element: HTMLDivElement
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    // halfCent: number;
    valueRatio: number;
    timeRatio: number;
    valueRange: number;
    /**
     * (distance from the horizontal axis to the middle axis) / height
     */
    valueBasis: number;
    timeRange: number;
    timeGridSpan: number;
    valueGridSpan: number;

    timeGridColor: RGB;
    valueGridColor: RGB;

    padding: number;

    lastBeats: number;

    selectionManager: SelectionManager<EventNode>;
    state: EventCurveEditorState;
    wasEditing: boolean

    _selectedNode: WeakRef<EventStartNode | EventEndNode>;
    pointedValue: number;
    pointedBeats: number;
    beatFraction: number;

    easing: NormalEasing;
    newNodeState: NewNodeState = NewNodeState.controlsBoth;
    selectState: SelectState;
    mouseIn: boolean;
    startingPoint: Coordinate;
    startingCanvasPoint: Coordinate;
    canvasPoint: Coordinate;

    get selectedNode() {
        if (!this._selectedNode) {
            return undefined;
        }
        return this._selectedNode.deref()
    }
    set selectedNode(val: EventStartNode | EventEndNode) {
        this._selectedNode = new WeakRef(val);
        editor.eventEditor.target = val;
    }

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
    constructor(type: EventType, height: number, width: number, parent: EventCurveEditors) {
        const config = eventTypeMap[type]
        this.type = type
        this.parentEditorSet = parent
        this._displayed = true;
        this.$element = $("div")
        this.element = this.$element.element;
        this.displayed = false;
        this.state = EventCurveEditorState.select


        this.selectionManager = new SelectionManager()


        this.canvas = document.createElement("canvas")
        this.element.append(this.canvas)
        this.canvas.width = width//this.canvas.parentElement.clientWidth;
        this.canvas.height = height;
        this.padding = 14;
        this.innerHeight = this.canvas.height - this.padding * 2;
        this.innerWidth = this.canvas.width - this.padding * 2;
        this.context = this.canvas.getContext("2d");


        this.timeRange = 4
        // this.halfCent = this.halfRange * 100;
        this.valueRange = config.valueRange;
        this.valueBasis = config.basis;
        this.valueRatio = this.innerHeight / this.valueRange;
        this.timeRatio = this.innerWidth / this.timeRange;
        this.timeGridSpan = 1;
        this.valueGridSpan = config.valueGridSpan;
        this.timeGridColor = [120, 255, 170];
        this.valueGridColor = [255, 170, 120];
        this.initContext()

        this.easing = easingMap.linear.in;

        parent.$editSwitch.onClickChange((checked) => {
            this.state = checked ? EventCurveEditorState.edit : EventCurveEditorState.select;
        })

        on(["mousemove", "touchmove"], this.canvas, (event) => {
            const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
            const coord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
            
            const {x, y} = coord;
            const {padding} = this;
            const {x: beats, y: value} = coord.mul(this.invertedMatrix);
            this.pointedValue = Math.round(value / this.valueGridSpan) * this.valueGridSpan
            const accurateBeats = beats + this.lastBeats
            this.pointedBeats = Math.floor(accurateBeats)
            this.beatFraction = Math.round((accurateBeats - this.pointedBeats) * editor.timeDivisor)
            if (this.beatFraction === editor.timeDivisor) {
                this.pointedBeats += 1
                this.beatFraction = 0
            }

            switch (this.state) {
                case EventCurveEditorState.selecting:
                    // console.log("det")
                    editor.chart.operationList.do(new EventNodeValueChangeOperation(this.selectedNode, this.pointedValue))
                    editor.chart.operationList.do(new EventNodeTimeChangeOperation(this.selectedNode, [this.pointedBeats, this.beatFraction, editor.timeDivisor]))

            }
            this.draw()
        })
        on(["mousedown", "touchstart"], this.canvas, (event) => {
            this.downHandler(event)
            this.draw()
        })
        on(["mouseup", "touchend"], this.canvas, (event) => {
            this.upHandler(event)
            this.draw()
        })

        parent.$selectOption.onChange((v: string) => {
            this.selectState = SelectState[v];
            if (this.selectState === SelectState.none) {
                this.state = EventCurveEditorState.select;
            } else {
                this.state = EventCurveEditorState.selectScope;
            }
        });

        this.mouseIn = false;
        this.canvas.addEventListener("mouseenter", () => {
            this.mouseIn = true;
        });
        this.canvas.addEventListener("mouseleave", () => {
            this.mouseIn = false;
        });
        parent.$copyButton.onClick(() => {
            this.copy();
        });
        parent.$pasteButton.onClick(() => {
            this.paste();
        });
        
        window.addEventListener("keypress", (e: KeyboardEvent) => { // 踩坑：Canvas不能获得焦点
            console.log("Key press:", e.key);
            if (!this.mouseIn) {
                return;
            }
            switch (e.key.toLowerCase()) {
                case "v":
                    this.paste();
                    break;
                case "c":
                    this.copy();
                    break;
            }
        })

    }
    matrix: Matrix;
    invertedMatrix: Matrix;
    canvasMatrix: Matrix;
    invertedCanvasMatrix: Matrix;
    updateMatrix() {
        this.valueRatio = this.innerHeight / this.valueRange;
        this.timeRatio = this.innerWidth / this.timeRange;
        const {
            timeRange,
            valueRange,
            timeRatio,
            valueRatio,
            valueBasis
        } = this;
        this.matrix = identity.scale(timeRatio, -valueRatio).translate(0, valueBasis * valueRange);
        this.invertedMatrix = this.matrix.invert();
        console.log(this.matrix);
        console.log(identity.translate(0, -valueBasis * valueRange))
        this.canvasMatrix = Matrix.fromDOMMatrix(this.context.getTransform());
        this.invertedCanvasMatrix = this.canvasMatrix.invert();
    }
    appendTo(parent: HTMLElement) {
        parent.append(this.element);
    }

    downHandler(event: MouseEvent | TouchEvent) {
        const {width, height} = this.canvas;
        const {padding} = this;
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = this.canvasPoint = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        const coord = canvasCoord.mul(this.invertedMatrix);
        this.canvasPoint = canvasCoord;
        // console.log("ECECoord:" , [x, y])
        switch (this.state) {
            case EventCurveEditorState.select:
            case EventCurveEditorState.selecting:
                const snode = this.selectionManager.click(canvasCoord)
                this.state = !snode ? EventCurveEditorState.select : EventCurveEditorState.selecting;
                if (snode) {
                    this.selectedNode = snode.target
                    editor.switchSide(editor.eventEditor)
                }
                // console.log(EventCurveEditorState[this.state])
                this.wasEditing = false;
                break;
            case EventCurveEditorState.edit:
                const timeDivisor = editor.timeDivisor
                const {beatFraction, pointedBeats} = this
                const time: TimeT = [pointedBeats, beatFraction, timeDivisor];
                const prev = this.target.getNodeAt(TimeCalculator.toBeats(time))
                if (TimeCalculator.eq(prev.time, time)) {
                    break;
                }
                const endNode = new EventEndNode(time, this.newNodeState === NewNodeState.controlsStart ? prev.value : this.pointedValue)
                const node = new EventStartNode(time, this.newNodeState === NewNodeState.controlsEnd ? prev.value : this.pointedValue);
                node.easing = this.easing;
                EventNode.connect(endNode, node)
                // this.editor.chart.getComboInfoEntity(startTime).add(note)
                editor.chart.operationList.do(new EventNodePairInsertOperation(node, prev));
                this.selectedNode = node;
                this.state = EventCurveEditorState.selecting;
                this.parentEditorSet.$editSwitch.checked = false;
                this.wasEditing = true;
                break;
            case EventCurveEditorState.selectScope:
                this.startingPoint = coord;
                this.startingCanvasPoint = canvasCoord;
                this.state = EventCurveEditorState.selectingScope;
                break;
        }
    }
    upHandler(event: MouseEvent | TouchEvent) {
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const canvasCoord = new Coordinate(offsetX, offsetY).mul(this.invertedCanvasMatrix);
        const {x, y} = canvasCoord.mul(this.invertedMatrix);
        switch (this.state) {
            case EventCurveEditorState.selecting:
                if (!this.wasEditing) {
                    this.state = EventCurveEditorState.select;
                } else {
                    this.state = EventCurveEditorState.edit;
                    this.parentEditorSet.$editSwitch.checked = true;
                }
                break;
            case EventCurveEditorState.selectingScope:
                const [sx, ex] = [this.startingCanvasPoint.x, canvasCoord.x].sort((a, b) => a - b);
                const [sy, ey] = [this.startingCanvasPoint.y, canvasCoord.y].sort((a, b) => a - b);
                const array = this.selectionManager.selectScope(sy, sx, ey, ex);
                console.log("Arr", array);
                console.log(sx, sy, ex, ey)
                const nodes = array.map(x => x.target).filter(x => x instanceof EventStartNode);
                console.log(nodes);
                switch (this.selectState) {
                    case SelectState.extend:
                        this.parentEditorSet.nodesSelection = this.parentEditorSet.nodesSelection.union(new Set(nodes));
                        break;
                    case SelectState.replace:
                        this.parentEditorSet.nodesSelection = new Set(nodes);
                        break;
                    case SelectState.exclude:
                        this.parentEditorSet.nodesSelection = this.parentEditorSet.nodesSelection.difference(new Set(nodes));
                        break;
                }
                this.parentEditorSet.nodesSelection = new Set([...this.parentEditorSet.nodesSelection].filter((note: EventStartNode) => !!note.parentSeq))
                console.log("bp")
                if (this.parentEditorSet.nodesSelection.size !== 0) {
                    editor.multiNodeEditor.target = this.parentEditorSet.nodesSelection;
                    editor.switchSide(editor.multiNodeEditor);
                }
                this.state = EventCurveEditorState.selectScope;
                break;
            default:
                this.state = EventCurveEditorState.select;
        }
    }

    initContext() {
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.context.strokeStyle = "#EEE"
        this.context.fillStyle = "#333"
        this.context.lineWidth = 2
    }
    drawCoordination(beats: number) {
        const {height: canvasHeight, width: canvasWidth} = this.canvas;
        const {innerHeight, innerWidth} = this;
        const {
            timeGridSpan, valueGridSpan,
            valueRatio, timeRatio, context} = this;
        const timeDivisor = editor.timeDivisor
        context.fillRect(-canvasWidth / 2, -canvasHeight / 2, canvasWidth, canvasHeight)
        // const beatCents = beats * 100
        // const middleValue = Math.round(-this.basis / this.valueRatio)
        const basis = this.valueBasis * this.innerHeight;
        // 计算上下界
        context.save()
        context.fillStyle = "#EEE";
        const upperEnd = Math.ceil((innerHeight / 2 - basis) / valueGridSpan / valueRatio) * valueGridSpan
        const lowerEnd = Math.ceil((-innerHeight / 2 - basis) / valueGridSpan / valueRatio) * valueGridSpan
        context.strokeStyle = rgb(...this.valueGridColor)
        context.lineWidth = 1;

        for (let value = lowerEnd; value < upperEnd; value += valueGridSpan) {
            const positionY = value * valueRatio + basis;
            drawLine(context, -canvasWidth / 2, -positionY, canvasWidth, -positionY);
            context.fillText(value + "", -innerWidth / 2, -positionY)
        }
        context.strokeStyle = rgb(...this.timeGridColor)
        
        const stopBeats = Math.ceil((beats + this.timeRange / 2) / timeGridSpan) * timeGridSpan;
        const startBeats = Math.ceil((beats - this.timeRange / 2) / timeGridSpan - 1) * timeGridSpan;
        for (let time = startBeats; time < stopBeats; time += timeGridSpan) {
            const positionX = (time - beats)  * timeRatio
            drawLine(context, positionX, innerHeight / 2, positionX, -innerHeight / 2);
            context.fillText(time + "", positionX, innerHeight / 2)

            
            context.save()
            context.lineWidth = 1
            for (let i = 1; i < timeDivisor; i++) {
                const minorPosX = (time + i / timeDivisor - beats) * timeRatio
                drawLine(context, minorPosX, innerHeight / 2, minorPosX, -innerHeight / 2);
            }
            context.restore()
        }
        context.restore()
        context.lineWidth = 3;
        drawLine(context, 0, innerHeight / 2, 0, -innerHeight / 2)
        context.strokeStyle = "#EEE";
    }
    draw(beats?: number) {
        if (!this.target) {
            return
        }
        beats = beats || this.lastBeats || 0;
        this.updateMatrix()
        const {height, width} = this.canvas;
        const {
            timeRatio, valueRatio,
            valueBasis: basis,
            context,
            selectionManager,
            matrix
        }= this
        selectionManager.refresh()
        this.drawCoordination(beats)
        context.save()
        context.fillStyle = "#EEE"
        context.fillText("State: " + EventCurveEditorState[this.state], 10, -30)
        context.fillText("Beats: " + shortenFloat(beats, 4).toString(), 10, -10)
        context.fillText("Sequence: " + this.target.id, 10, -50)
        context.fillText("Last Frame Took:" + (shortenFloat(editor.renderingTime, 2) || "??") + "ms", 10, -70);
        if (this.pointedBeats) {
            context.fillText(`pointedTime: ${this.pointedBeats}:${this.beatFraction}:${editor.timeDivisor}`, 10, 10);
        }

        if (this.canvasPoint) {
            this.context.fillText(`Cursor: ${this.canvasPoint.x}, ${this.canvasPoint.y}`, 10, -90)
        }
        context.restore()
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
            const {x: startX, y: startY} = new Coordinate(startTime - beats, startValue).mul(matrix);
            console.log("startXY", startX, startY);
            console.log(Matrix.fromDOMMatrix(context.getTransform()))
            const {x: endX, y: endY} = new Coordinate(endTime - beats, endValue).mul(matrix);
            const topY = startY - NODE_HEIGHT / 2
            const topEndY = endY - NODE_HEIGHT / 2

            selectionManager.add({
                target: startNode,
                left: startX,
                top: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, startX, topY)
            selectionManager.add({
                target: endNode,
                left: endX - NODE_WIDTH,
                top: topEndY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, endX - NODE_WIDTH, topEndY + NODE_HEIGHT + 20)

            const selected = this.parentEditorSet.nodesSelection.has(startNode)

            if (selected) {
                context.save()
                context.strokeStyle = 'cyan';
            }


            startNode.easing.drawCurve(context, startX, startY, endX, endY)
            if (selected) {
                context.restore()
            }
            context.drawImage(NODE_START, startX, topY, NODE_WIDTH, NODE_HEIGHT)
            context.drawImage(NODE_END, endX - NODE_WIDTH, topEndY, NODE_WIDTH, NODE_HEIGHT)
            // console.log(this.type, EventType.speed)
            if (this.type === EventType.speed) {
                // console.log(startNode)
                // console.log(startNode.easing)
                context.lineWidth = 1;
                context.fillText(("" + startNode.cachedIntegral).slice(0, 6), startX, 0)
                context.lineWidth = 3
            }
            previousEndNode = endNode;
            previousTime = endTime;
        }
        if ("tailing" in previousEndNode.next.next) {
            const lastStart = previousEndNode.next;
            const startTime = TimeCalculator.toBeats(lastStart.time);
            const startValue = lastStart.value;
            const {x: startX, y: startY} = new Coordinate(startTime - beats, startValue).mul(matrix);
            const topY = startY - NODE_HEIGHT / 2;
            const selected = this.parentEditorSet.nodesSelection.has(lastStart)
            if (selected) {
                context.save()
                context.strokeStyle = 'cyan';
            }
            drawLine(context, startX, startY, width / 2, startY);
            if (selected) {
                context.restore()
            }
            context.drawImage(NODE_START, startX, startY - NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT)
            selectionManager.add({
                target: lastStart,
                left: startX,
                top: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            }).annotate(context, startX, topY);

        }
        
        if (this.state === EventCurveEditorState.selectingScope) {
            const {startingCanvasPoint, canvasPoint} = this;
            context.save()
            context.strokeStyle = "#84F";
            context.strokeRect(startingCanvasPoint.x, startingCanvasPoint.y, canvasPoint.x - startingCanvasPoint.x, canvasPoint.y - startingCanvasPoint.y);
            context.restore()
        }
        this.lastBeats = beats;
    }
    changeTarget(line: JudgeLine, index: number) {
        if (this.type === EventType.easing) {
            console.error("Easing does not use changeTarget. Assign directly instead.")
            return;
        }
        line.eventLayers[index] = line.eventLayers[index] || {};
        this.target = line.eventLayers[index][EventType[this.type]] || EventNodeSequence.newSeq(this.type, editor.chart.getEffectiveBeats());
    }

    

    paste() {
        if (!this.displayed) {
            return;
        }
        const {lastBeats} = this;
        const {clipboard} = this.parentEditorSet;
        const {timeDivisor} = editor;
        if (!clipboard || clipboard.size === 0) {
            return;
        }
        if (!lastBeats) {
            Editor.notify("Have not rendered a frame")
        }
        const nodes = [...clipboard];
        nodes.sort((a: EventNode, b: EventNode) => TimeCalculator.gt(a.time, b.time) ? 1 : -1);
        const startTime: TimeT = nodes[0].time;
        // const portions: number = Math.round(timeDivisor * lastBeats);
        const dest: TimeT = [this.pointedBeats, this.beatFraction, timeDivisor];
        const offset: TimeT = TimeCalculator.sub(dest, startTime);

        
        const newNodes: EventStartNode[] = nodes.map(n => n.clonePair(offset));
        editor.chart.operationList.do(new MultiNodeAddOperation(newNodes, this.target));
        editor.multiNodeEditor.target = this.parentEditorSet.nodesSelection = new Set<EventStartNode>(newNodes);
        editor.update();
    }
    copy(): void {
        if (!this.displayed) {
            return;
        }
        console.log(this.parentEditorSet.nodesSelection);
        this.parentEditorSet.clipboard = this.parentEditorSet.nodesSelection;
        this.parentEditorSet.nodesSelection = new Set<EventStartNode>();
        editor.update();
    }
}