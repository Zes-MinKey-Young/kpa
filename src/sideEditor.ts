

abstract class SideEditor<T extends object> {
    
    element: HTMLDivElement;
    $title: Z<"div">
    $element: Z<"div">;
    $body: Z<"div">
    _target: WeakRef<T>;
    get target() {
        return this._target.deref();
    }
    set target(val) {
        this._target = new WeakRef(val);
        this.update();
    }
    abstract update(): void
    constructor() {

        this.$element = $("div").addClass("side-editor");
        this.element = this.$element.release()
        this.$title = $("div").addClass("side-editor-title").text("Event")
        this.$body = $("div").addClass("side-editor-body");
        this.$element.append(this.$title, this.$body)
    }
    hide() {
        this.$element.hide()
    }
    show() {
        this.$element.show()
    }
}


class NoteEditor extends SideEditor<Note> {
    $time: ZFractionInput;
    $endTime: ZFractionInput;
    $type: ZDropdownOptionBox;
    $position: ZInputBox;
    $dir: ZDropdownOptionBox;
    $speed: ZInputBox
    aboveOption: BoxOption;
    belowOption: BoxOption;
    noteTypeOptions: BoxOption[];
    constructor() {
        super()
        this.noteTypeOptions = arrayForIn([
            "tap", "hold", "flick", "drag"
        ], (v) => new BoxOption(v, () => {
            this.target.chart.operationList.do(new NoteTypeChangeOperation(this.target, NoteType[v]))
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
        this.$body.append(
            $("span").text("speed"), this.$speed,
            $("span").text("time"),
            $("div").addClass("flex-row").append(this.$time, $("span").text(" ~ "), this.$endTime),
            $("span").text("type"), this.$type,
            $("span").text("pos"), this.$position,
            $("span").text("dir"), this.$dir
        )
        this.$time.onChange((t) => {
            this.target.startTime = t
            if (this.target.type !== NoteType.hold) {
                this.target.endTime = t
                this.$endTime.setValue(t)
            }
        })
        // 这里缺保卫函数
        this.$position.onChange(() => {
            this.target.chart.operationList.do(new NoteValueChangeOperation(this.target, "positionX", this.$speed.getNum()))
        })
        this.$speed.onChange(() => {
            this.target.chart.operationList.do(new NoteSpeedChangeOperation(this.target, this.$speed.getNum(), this.target.judgeLine))
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
    }
}

class EventEditor extends SideEditor<EventNode> {

    $time: ZFractionInput;
    $value: ZInputBox;
    $easing: ZEasingBox;
    constructor() {
        super()
        this.$element.addClass("event-editor")
        this.$time = new ZFractionInput();
        this.$value = new ZInputBox();
        this.$easing = new ZEasingBox();
        this.$body.append(
            $("span").text("time"), this.$time,
            $("span").text("value"), this.$value,
            $("span").text("easing"), this.$easing
        )
        this.$time.onChange((t) => this.target.time = t)
        this.$value.onChange(() => this.target.value = this.$value.getNum())
        this.$easing.onChange((id) => this.target.easing = easingArray[id])
    }
    update() {
        const eventNode = this.target;
        if (!eventNode) {
            return;
        }
        this.$time.setValue(eventNode.time);
        this.$value.setValue(eventNode.value + "");
    }
}