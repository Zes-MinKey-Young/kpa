
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

        this.$bar = $("div").addClass("flex-row")
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
            this[type] = new EventCurveEditor(EventType[type], height - 24, width, this)
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

type NodePosition = {
    node: EventNode;
    x: number;
    y: number
}

enum EventCurveEditorState {
    select,
    selecting,
    edit,
    flowing
}

class EventCurveEditor {
    type: EventType
    target: EventNodeSequence;
    parent: EventCurveEditors

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

    selectionManager: SelectionManager<EventNode>
    state: EventCurveEditorState;
    wasEditing: boolean

    _selectedNode: WeakRef<EventNode>;
    pointedValue: number;
    pointedBeats: number;
    beatFraction: number;
    get selectedNode() {
        if (!this._selectedNode) {
            return undefined;
        }
        return this._selectedNode.deref()
    }
    set selectedNode(val: EventNode) {
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
        this.parent = parent
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

        on(["mousemove", "touchmove"], this.canvas, (event) => {
            const [x, y] = getOffsetCoordFromEvent(event, this.canvas);
            const {width, height} = this.canvas
            const {padding} = this;
            this.pointedValue = Math.round(((x - this.valueBasis) / this.valueRatio) / this.valueGridSpan) * this.valueGridSpan
            const accurateBeats = (x - width / 2) / this.timeRatio + this.lastBeats
            this.pointedBeats = Math.floor(accurateBeats)
            this.beatFraction = Math.round((accurateBeats - this.pointedBeats) * editor.timeDivisor)
            if (this.beatFraction === editor.timeDivisor) {
                this.pointedBeats += 1
                this.beatFraction = 0
            }

            switch (this.state) {
                case EventCurveEditorState.selecting:
                    console.log("det")
                    editor.chart.operationList.do(new EventNodeValueChangeOperation(this.selectedNode, this.pointedValue))

            }
        })
        on(["mousedown", "touchstart"], this.canvas, (event) => {
            this.downHandler(event)
        })

    }
    appendTo(parent: HTMLElement) {
        parent.append(this.element);
    }

    downHandler(event: MouseEvent | TouchEvent) {
        const {width, height} = this.canvas;
        const {padding} = this;
        const [offsetX, offsetY] = getOffsetCoordFromEvent(event, this.canvas);
        const [x, y] = [offsetX - width / 2, offsetY - height / 2];
        console.log("ECECoord:" , [x, y])
        switch (this.state) {
            case EventCurveEditorState.select:
            case EventCurveEditorState.selecting:
                const snode = this.selectionManager.click(x, y)
                this.state = !snode ? EventCurveEditorState.select : EventCurveEditorState.selecting;
                if (snode) {
                    this.selectedNode = snode.target
                    editor.switchSide(editor.eventEditor)
                }
                console.log(EventCurveEditorState[this.state])
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
                const endNode = new EventEndNode(time, this.pointedValue)
                const node = new EventStartNode(time, this.pointedValue)
                EventNode.connect(endNode, node)
                // this.editor.chart.getComboInfoEntity(startTime).add(note)
                editor.chart.operationList.do(new   EventNodePairInsertOperation(node, prev));
                this.selectedNode = node;
                this.state = EventCurveEditorState.selecting;
                this.wasEditing = true;
                break;
        }
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
        const {
            timeGridSpan, valueGridSpan,
            valueRatio, timeRatio, context} = this;
        const timeDivisor = editor.timeDivisor
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
            const positionX = (time - beats)  * timeRatio
            drawLine(context, positionX, height / 2, positionX, -height / 2);
            context.strokeText(time + "", positionX, height / 2)

            
            context.save()
            context.lineWidth = 1
            for (let i = 1; i < timeDivisor; i++) {
                const minorPosX = (time + i / timeDivisor - beats) * timeRatio
                drawLine(context, minorPosX, height / 2, minorPosX, -height / 2);
            }
            context.restore()
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
        const {
            timeRatio, valueRatio,
            valueBasis: basis,
            context,
            selectionManager
        }= this
        selectionManager.refresh()
        this.drawCoordination(beats)
        context.save()
        this.context.fillStyle = "#EEE"
        this.context.fillText("State: " + EventCurveEditorState[this.state], 0, -10)
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
            const startX = (startTime - beats) * timeRatio;
            const endX   = (endTime   - beats) * timeRatio;
            const startY = startValue * valueRatio + basis;
            const topY = -startY - NODE_HEIGHT / 2
            const endY   = endValue   * valueRatio + basis;
            const topEndY = -endY - NODE_HEIGHT / 2

            selectionManager.add({
                target: startNode,
                x: startX,
                y: topY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            })
            selectionManager.add({
                target: endNode,
                x: endX,
                y: topEndY,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                priority: 1
            })


            startNode.easing.drawCurve(context, startX, -startY, endX, -endY)
            context.drawImage(NODE_START, startX, topY, NODE_WIDTH, NODE_HEIGHT)
            context.drawImage(NODE_END, endX - NODE_WIDTH, topEndY, NODE_WIDTH, NODE_HEIGHT)
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