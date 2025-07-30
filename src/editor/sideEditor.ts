

abstract class SideEditor<T extends object> extends Z<"div"> {
    
    element: HTMLDivElement;
    $title: Z<"div">
    $body: Z<"div">
    _target: WeakRef<T>;
    get target() {
        return this._target?.deref();
    }
    set target(val) {
        this._target = new WeakRef(val);
        this.update();
    }
    abstract update(): void
    constructor() {
        super("div");
        this.addClass("side-editor");
        this.$title = $("div").addClass("side-editor-title");
        this.$body = $("div").addClass("side-editor-body");
        this.append(this.$title, this.$body)
    }
}


class NoteEditor extends SideEditor<Note> {
    aboveOption: BoxOption = new BoxOption("above", () => this.target.above = true);
    belowOption: BoxOption = new BoxOption("below", () => this.target.above = false);
    noteTypeOptions: BoxOption[] = ["tap", "hold", "flick", "drag"]
        .map((v) => new BoxOption(v, () => {
            editor.operationList.do(new NoteTypeChangeOperation(this.target, NoteType[v]))
        }));

    $time         = new ZFractionInput();;
    $endTime      = new ZFractionInput();;
    $type         = new ZDropdownOptionBox(this.noteTypeOptions);
    $position     = new ZInputBox();;
    $dir          = new ZDropdownOptionBox([this.aboveOption, this.belowOption]);
    $speed        = new ZInputBox();
    $alpha        = new ZInputBox();
    $size         = new ZInputBox();
    $yOffset      = new ZInputBox();
    $visibleBeats = new ZInputBox();
    $delete       = new ZButton("Delete").addClass("destructive");
    constructor() {
        super()
        this.$title.text("Note")
        this.$body.append(
            $("span").text("speed"), this.$speed,
            $("span").text("time"),
            $("div").addClass("flex-row").append(this.$time, $("span").text(" ~ "), this.$endTime),
            $("span").text("type"), this.$type,
            $("span").text("pos"), this.$position,
            $("span").text("dir"), this.$dir,
            $("span").text("alpha"), this.$alpha,
            $("span").text("size"), this.$size,
            $("span").text("AbsYOffset"), this.$yOffset,
            $("span").text("visibleBeats"), this.$visibleBeats,
            $("span").text("del"), this.$delete
        )
        this.$time.onChange((t) => {
            editor.operationList.do(new NoteTimeChangeOperation(this.target, this.target.parentNode.parentSeq.getNodeOf(t)))
            if (this.target.type !== NoteType.hold) {
                this.$endTime.setValue(t)
            }
        })
        this.$endTime.onChange((t) => {
            editor.operationList.do(new HoldEndTimeChangeOperation(this.target, t));
        })
        // 这里缺保卫函数
        this.$position.whenValueChange(() => {
            editor.operationList.do(new NoteValueChangeOperation(this.target, "positionX", this.$position.getNum()))
        })
        this.$speed.whenValueChange(() => {
            editor.operationList.do(new NoteSpeedChangeOperation(this.target, this.$speed.getNum(), this.target.parentNode.parentSeq.parentLine))
        })
        this.$alpha.whenValueChange(() => {
            editor.operationList.do(new NoteValueChangeOperation(this.target, "alpha", this.$alpha.getNum()))
        })
        this.$size.whenValueChange(() => {
            editor.operationList.do(new NoteValueChangeOperation(this.target, "size", this.$size.getNum()))
        })
        this.$yOffset.whenValueChange(() => {
            editor.operationList.do(new NoteYOffsetChangeOperation(this.target, this.$yOffset.getNum(), this.target.parentNode.parentSeq.parentLine));

        })
        this.$visibleBeats.whenValueChange(() => {
            editor.operationList.do(new NoteValueChangeOperation(this.target, "visibleBeats", this.$visibleBeats.getNum()));
        });
        this.$delete.onClick(() => {
            editor.operationList.do(new NoteDeleteOperation(this.target));
        })
    }
    update() {
        const note = this.target
        if (!note) {
            return;
        }
        this.$time.setValue(note.startTime);
        if (note.type === NoteType.hold) {
            this.$endTime.setValue(note.endTime);
            this.$endTime.disabled = false;
        } else {
            this.$endTime.setValue(note.startTime);
            this.$endTime.disabled = true;
        }
        this.$type.value = this.noteTypeOptions[note.type - 1];
        this.$position.setValue(note.positionX + "")
        this.$dir.value = note.above ? this.aboveOption : this.belowOption
        this.$speed.setValue(note.speed + "")
        this.$alpha.setValue(note.alpha + "")
        this.$yOffset.setValue(note.yOffset + "")
        this.$visibleBeats.setValue(note.visibleBeats + "")
        this.$size.setValue(note.size + "")
    }
}

class MultiNoteEditor extends SideEditor<Set<Note>> {
    $reverse: ZButton;
    $delete: ZButton;
    constructor() {
        super()
        this.$title.text("Multi Notes")
        this.$delete = new ZButton("Delete").addClass("destructive");
        this.$reverse = new ZButton("Reverse");
        this.$body.append(
            this.$delete,
            this.$reverse
        );
        this.$reverse.onClick(() => {
            editor.operationList.do(new ComplexOperation(...[...this.target].map(n => new NoteValueChangeOperation(n, "positionX", -n.positionX))))
        })
        this.$delete.onClick(() => {
            editor.operationList.do(new MultiNoteDeleteOperation(this.target))
        })
    }
    update(): void {

    }
}

class MultiNodeEditor extends SideEditor<Set<EventStartNode>> {
    $reverse: ZButton;
    $delete: ZButton;
    constructor() {
        super();
        this.$title.text("Multi Nodes");
        this.$delete = new ZButton("Delete").addClass("destructive");
        this.$reverse = new ZButton("Reverse");
        this.$body.append(
            this.$delete,
            this.$reverse
        );
        
        this.$reverse.onClick(() => {
            editor.operationList.do(new ComplexOperation(...[...this.target].map(n => new EventNodeValueChangeOperation(n, -n.value))))
        })
        this.$delete.onClick(() => {
            editor.operationList.do(new MultiNodeDeleteOperation(Array.from(this.target)));
        })
    }
    update(): void {
        
    }
} 

class EventEditor extends SideEditor<EventStartNode | EventEndNode> {

    $time           = new ZFractionInput();
    $value          = new ZInputBox();
    $easing         = new ZEasingBox();
    $templateEasing = new ZInputBox().addClass("template-easing-box");
    $parametric     = new ZInputBox();
    $bezierEditor   = new BezierEditor(window.innerWidth * 0.2);
    $delete: ZButton;
    $radioTabs: ZRadioTabs;
    constructor() {
        super()
        this.$title.text("Event")
        this.addClass("event-editor")
        this.$bezierEditor 
        this.$radioTabs = new ZRadioTabs("easing-type", {
            "Normal": this.$easing,
            "Template": this.$templateEasing,
            "Bezier": this.$bezierEditor,
            "Parametric": this.$parametric
        });
        this.$delete = new ZButton("delete").addClass("destructive")
            .onClick(() => editor.operationList.do(new EventNodePairRemoveOperation(EventNode.getEndStart(this.target)[1])));
        this.$body.append(
            $("span").text("time"), this.$time,
            $("span").text("value"), this.$value,
            this.$radioTabs,
            $("span").text("del"), this.$delete
        )
        this.$time.onChange((t) => {
            editor.operationList.do(new EventNodeTimeChangeOperation(this.target, t))
        })
        this.$value.whenValueChange(() => {
            editor.operationList.do(new EventNodeValueChangeOperation(this.target, this.$value.getNum()))
        })
        this.$easing.onChange((id) => this.setNormalEasing(id))
        this.$templateEasing.whenValueChange((name) => this.setTemplateEasing(name))
        this.$bezierEditor.whenValueChange(() => {
            this.setBezierEasing(this.$bezierEditor.getValue());
        })
        this.$parametric.whenValueChange(() => {
            this.setParametricEasing(this.$parametric.getValue());
        })
        this.$radioTabs.$radioBox.onChange((id) => {
            if (id === 0) { // Normal
                this.setNormalEasing(this.$easing.value)
            } else if (id === 1) { // Template
                if (!this.$templateEasing.getValue()) { return; }
                this.setTemplateEasing(this.$templateEasing.getValue())
            } else if (id === 2) { // Bezier
                this.setBezierEasing(this.$bezierEditor.getValue());
            } else if (id === 3) { // Parametric
                this.setParametricEasing(this.$parametric.getValue());
            }
        })
    }
    setNormalEasing(id: number): void {
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, easingArray[id]))
        this.target.innerEasing = easingArray[id]
    }
    setTemplateEasing(name: string): void {
        const chart = editor.chart;
        const easing = chart.templateEasingLib.getOrNew(name);
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, easing))
    }
    setBezierEasing(easing: BezierEasing) {
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, easing));
    }
    setParametricEasing(expression: string) {
        editor.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, new ParametricEquationEasing(expression)));
    }
    update(): void {
        const eventNode = this.target;
        if (!eventNode) {
            return;
        }
        this.$time.setValue(eventNode.time);
        this.$value.setValue(eventNode.value + "");
        if (eventNode.innerEasing instanceof NormalEasing) {
            this.$radioTabs.switchTo(0)
            this.$easing.setValue(eventNode.innerEasing);
        } else if (eventNode.innerEasing instanceof TemplateEasing) {
            this.$radioTabs.switchTo(1)
            this.$templateEasing.setValue(eventNode.innerEasing.name);
        } else if (eventNode.innerEasing instanceof BezierEasing) { 
            this.$radioTabs.switchTo(2)
            this.$bezierEditor.setValue(eventNode.innerEasing);
        } else if (eventNode.innerEasing instanceof ParametricEquationEasing) { 
            this.$radioTabs.switchTo(3)
            this.$parametric.setValue(eventNode.innerEasing.equation);
        }
        
    }
}
class UserScriptEditor extends SideEditor {
    $script = new ZTextArea().addClass("user-script-editor-script").setValue("");
    $runBtn = new ZButton("Run").addClass("user-script-editor-run", "progressive");
    constructor() {
        super();
        this.addClass("user-script-editor");
        this.$body.append(
            this.$script,
            this.$runBtn
        );
        const log = (content: any) => {
            const $d = $("div").addClass("user-script-editor-output").text(content + "");
            this.$script.before($d)
        }
        this.$runBtn.onClick(() => {
            try {
                const script = new Function("log", "return " + this.$script.getValue().trim());
                const result = script(log);
                if (typeof result === "function") {
                    result.isUserScript = true;
                    if (result.name !== "") {
                        if (!globalThis[result.name]?.isUserScript) {
                            notify("Cannot override built-in Global Variable. Please use a different name.")
                        } else {
                            globalThis[result.name] = result;
                            log(result.toString())
                        }
                    }
                    if (result.main && typeof result.main === "function") {
                        if (editor.chart.modified && !result.trusted) {
                            notify("This script is not trusted. Please make sure it is safe to run. You'd better save the chart before running it.")
                            notify("To trust this script, please add a line `trusted = true`.");
                            return;
                        }
                        result.main(editor.operationList, editor.chart);
                    }
                } else {
                    log(result)
                }
            } catch (error) {
                const $d = $("div").addClass("user-script-editor-error").text(error.message);
                this.$script.before($d);
            }
        })
    }
    update() {}
}