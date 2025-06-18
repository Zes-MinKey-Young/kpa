

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
        this.$title = $("div").addClass("side-editor-title").text("Event")
        this.$body = $("div").addClass("side-editor-body");
        this.append(this.$title, this.$body)
    }
}


class NoteEditor extends SideEditor<Note> {
    $time: ZFractionInput;
    $endTime: ZFractionInput;
    $type: ZDropdownOptionBox;
    $position: ZInputBox;
    $dir: ZDropdownOptionBox;
    $speed: ZInputBox;
    $alpha: ZInputBox;
    $size: ZInputBox;
    $delete: ZButton;
    aboveOption: BoxOption;
    belowOption: BoxOption;
    noteTypeOptions: BoxOption[];
    constructor() {
        super()
        this.noteTypeOptions = arrayForIn([
            "tap", "hold", "flick", "drag"
        ], (v) => new BoxOption(v, () => {
            editor.chart.operationList.do(new NoteTypeChangeOperation(this.target, NoteType[v]))
        }))
        this.aboveOption = new BoxOption("above", () => this.target.above = true)
        this.belowOption = new BoxOption("below", () => this.target.above = false)
        this.$title.text("Note")
        this.$time = new ZFractionInput();
        this.$endTime = new ZFractionInput();
        this.$type = new ZDropdownOptionBox(this.noteTypeOptions)
        this.$position = new ZInputBox();
        this.$dir = new ZDropdownOptionBox([this.aboveOption, this.belowOption]);
        this.$speed = new ZInputBox();
        this.$alpha = new ZInputBox();
        this.$size = new ZInputBox();
        this.$delete = new ZButton("Delete").addClass("destructive");
        this.$body.append(
            $("span").text("speed"), this.$speed,
            $("span").text("time"),
            $("div").addClass("flex-row").append(this.$time, $("span").text(" ~ "), this.$endTime),
            $("span").text("type"), this.$type,
            $("span").text("pos"), this.$position,
            $("span").text("dir"), this.$dir,
            $("span").text("alpha"), this.$alpha,
            $("span").text("size"), this.$size,
            $("span").text("del"), this.$delete
        )
        this.$time.onChange((t) => {
            editor.chart.operationList.do(new NoteTimeChangeOperation(this.target, this.target.parentNode.parentSeq.getNodeOf(t)))
            if (this.target.type !== NoteType.hold) {
                this.$endTime.setValue(t)
            }
        })
        this.$endTime.onChange((t) => {
            editor.chart.operationList.do(new HoldEndTimeChangeOperation(this.target, t));
        })
        // 这里缺保卫函数
        this.$position.onChange(() => {
            editor.chart.operationList.do(new NoteValueChangeOperation(this.target, "positionX", this.$position.getNum()))
        })
        this.$speed.onChange(() => {
            editor.chart.operationList.do(new NoteSpeedChangeOperation(this.target, this.$speed.getNum(), this.target.parentNode.parentSeq.parentLine))
        })
        this.$alpha.onChange(() => {
            editor.chart.operationList.do(new NoteValueChangeOperation(this.target, "alpha", this.$alpha.getNum()))
        })
        this.$size.onChange(() => {
            editor.chart.operationList.do(new NoteValueChangeOperation(this.target, "size", this.$size.getNum()))
        })
        this.$delete.onClick(() => {
            editor.chart.operationList.do(new NoteDeleteOperation(this.target));
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
        this.$size.setValue(note.size + "")
    }
}

class EventEditor extends SideEditor<EventStartNode | EventEndNode> {

    $time: ZFractionInput;
    $value: ZInputBox;
    $easing: ZEasingBox;
    $radioTabs: ZRadioTabs;
    $templateEasing: ZInputBox;
    constructor() {
        super()
        this.addClass("event-editor")
        this.$time = new ZFractionInput();
        this.$value = new ZInputBox();
        this.$easing = new ZEasingBox()
        this.$templateEasing = new ZInputBox().addClass("template-easing-box");
        this.$radioTabs = new ZRadioTabs("easing-type", {
            "Normal": this.$easing,
            "Template": this.$templateEasing
        })
        this.$body.append(
            $("span").text("time"), this.$time,
            $("span").text("value"), this.$value,
            this.$radioTabs
        )
        this.$time.onChange((t) => {
            editor.chart.operationList.do(new EventNodeTimeChangeOperation(this.target, t))
        })
        this.$value.onChange(() => {
            editor.chart.operationList.do(new EventNodeValueChangeOperation(this.target, this.$value.getNum()))
        })
        this.$easing.onChange((id) => this.setNormalEasing(id))
        this.$templateEasing.onChange((name) => this.setTemplateEasing(name))
        this.$radioTabs.$radioBox.onChange((id) => {
            if (id === 0) {
                this.setNormalEasing(this.$easing.value)
            } else if (id === 1) {
                if (!this.$templateEasing.getValue()) { return; }
                this.setTemplateEasing(this.$templateEasing.getValue())
            }
        })
    }
    setNormalEasing(id: number): void {
        editor.chart.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, easingArray[id]))
        this.target.innerEasing = easingArray[id]
    }
    setTemplateEasing(name: string): void {
        const chart = editor.chart;
        const easing = chart.templateEasingLib.getOrNew(name);
        editor.chart.operationList.do(new EventNodeInnerEasingChangeOperation(this.target, easing))
    }
    update(): void {
        const eventNode = this.target;
        if (!eventNode) {
            return;
        }
        this.$time.setValue(eventNode.time);
        this.$value.setValue(eventNode.value + "");
        if (eventNode.innerEasing instanceof NormalEasing) {
            this.$radioTabs.$radioBox.switchTo(0)
            this.$easing.setValue(eventNode.innerEasing);
        } else if (eventNode.innerEasing instanceof TemplateEasing) {
            this.$radioTabs.$radioBox.switchTo(1)

        }
    }
}