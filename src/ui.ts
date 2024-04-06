
class Z<K extends keyof HTMLElementTagNameMap> {
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
    removeClass(...classes: string[]) {
        this.element.classList.remove(...classes)
    }
    release() {
        return this.element;
    }
    attr(name: string): string;
    attr(name: string, value: string): this;
    attr(name: string, value?: string) {
        if (value) {
            this.element.setAttribute(name, value)
            return this;
        } else {
            return this.element.getAttribute(name);
        }
    }
    append(...$elements: Z<any>[]) {
        const elements = new Array($elements.length);
        for (let index = 0; index < $elements.length; index++) {
            elements[index] = $elements[index].release();
        }
        this.element.append(...elements)
        return this;
    }
    onClick(callback: (e: Event) => any) {
        this.element.addEventListener("click", callback)
        return this;
    }
    onInput(callback: (e: Event) => any) {
        this.element.addEventListener("input", callback)
        return this;
    }
    show() {
        this.element.style.display = "initial"
    }
    hide() {
        this.element.style.display = "none"
    }
}

class ZInputBox extends Z<"input"> {
    _disabled: boolean;
    get disabled() { return this.element.disabled}
    set disabled(val) {
                this.element.disabled = val
    }
    constructor() {
        super("input")
        this.addClass("input-box")
        this.attr("type", "text")
    }
    getValue() {
        return this.element.value
    }
    getInt() {
        return parseInt(this.element.value)
    }
    getNum() {
        return parseFloat(this.element.value)
    }
    setValue(val) {
        this.element.value = val
        return this;
    }
    onChange(callback: (content: string, e: Event) => any) {
        this.element.addEventListener("input", (event) => {
            callback(this.getValue(), event);
        })
        return this;
    }
}

class ZArrowInputBox extends Z<"div"> {
    scale: number;
    $up: Z<"div">;
    $down: Z<"div">;
    $input: ZInputBox;
    constructor() {
        super("div")
        this.scale = 1
        this.$input = new ZInputBox();
        this.$up = $("div")
            .addClass("arrow-up")
            .onClick(() => {
                this.setValue(this.getValue() + this.scale)
            });
        this.$down = $("div")
            .addClass("arrow-down")
            .onClick(() => {
                console.log(this.getValue())
                this.setValue(this.getValue() - this.scale)
            })
        this.addClass("arrow-input-box")
        this.append(
            this.$up,
            this.$down,
            this.$input
            )
    }
    getValue() {
        return this.$input.getNum()
    }
    setValue(val: number) {
        this.$input.setValue(val)
    }
    onChange(callback: (content: number, e: Event) => any) {
        const listener = (content, event) => {
            callback(parseInt(content), event);
        }
        this.$input.onChange(listener)
        this.$up.onClick((e) => listener(this.getValue(), e))
        this.$down.onClick((e) => listener(this.getValue(), e))
        return this;
    }
}

class ZFractionInput extends Z<"span"> {
    $int: ZInputBox;
    $nume: ZInputBox;
    $deno: ZInputBox;
    constructor() {
        super("span")
        this.addClass("fraction-input");
        this.$int = new ZInputBox().addClass("integer");
        this.$nume = new ZInputBox().addClass("nume");
        this.$deno = new ZInputBox().addClass("deno");
        this.append(
            this.$int,
            this.$nume,
            $("div").addClass("line"),
            this.$deno
        )
    }
    getValue(): TimeT {
        return [this.$int.getInt() || 0, this.$nume.getInt() || 1, this.$deno.getInt() || 0]
    }
    setValue(time: TimeT) {
        this.$int.setValue(time[0]);
        this.$nume.setValue(time[1])
        this.$deno.setValue(time[2])
    }
    _disabled: boolean;
    get disabled() {
        return this._disabled
    }
    set disabled(val) {
        this._disabled = val;
        [this.$int, this.$deno, this.$nume].forEach(($e) => $e.disabled = val)
    }
}

class ZDropdownOptionBox extends Z<"div"> {
    callbacks: ((val: string) => any)[]
    options: string[];
    _value: string;
    get value() {
        return this._value;
    }
    set value(val) {
        this.$value.text(val);
        this._value = val
    }
    $value: Z<"div">
    constructor(options: string[]) {
        super("div")
        this.callbacks = [];
        this.addClass("dropdown-option-box")
        this.$value = $("div")
        const span = $("span");
        this.append(span, this.$value);
        const optionList = $("div").addClass("dropdown-option-list");
        span.append(optionList)
        this.options = options;
        const length = options.length;
        for (let i = 0; i < length; i++) {
            const item = $("div").text(options[i]).onClick(() => {
                this.value = options[i]
                this.callbacks.forEach((fn) => fn(options[i]))
            })
            optionList.append(item)
        }
        this.value = options[0];
    }
    _disabled: boolean;
    get disabled() {
        return this._disabled
    }
    set disabled(val) {
        if (this._disabled === val) {
            return;
        }
        this._disabled = val;
        if (val) {
            this.addClass("disabled")
        } else {
            this.removeClass("disabled")
        }
    }
    onChange(callback: (val: string) => any) {
        this.callbacks.push(callback);
        return this;
    }
}

class ZEasingBox extends Z<"div"> {
    $input: ZArrowInputBox;
    $easeType: ZDropdownOptionBox;
    $funcType: ZDropdownOptionBox;
    constructor() {
        super("div")
        this.$input = new ZArrowInputBox()
            .onChange((num) => {
                const easing = easingArray[num]
                this.$easeType.value = easing.easeType;
                this.$funcType.value = easing.funcType;
            });
        this.$easeType = new ZDropdownOptionBox([
            "in",
            "out",
            "inout"
        ]).onChange(() => this.update())
        this.$funcType = new ZDropdownOptionBox(Object.keys(easingMap)).onChange(() => this.update())

        this.addClass("flex-row")
            .append(
                this.$input,
                $("span").text("Ease"), this.$easeType, this.$funcType
                
            )
    }
    update() {
        this.value = easingMap[this.$funcType.value][this.$easeType.value].id;
        this.$input.setValue(this.value)
    }
    _value: number;
    set value(val) {
        this._value = val;
    }
    get value() {return this._value}
}