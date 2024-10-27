
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
    remove() {
        this.element.remove()
    }
}

class ZButton extends Z<"div"> {
    _disabled: boolean;
    get disabled() { return  this._disabled }
    set disabled(val) {
        if (val !== this._disabled) {
            this._disabled = val;
            if (val) {
                this.addClass("disabled")
            } else {
                this.removeClass("disabled")
            }
        }
    }
    constructor(text: string) {
        super("div")
        this.addClass("button")
        this.text(text)
    }
    onClick(callback: (e: Event) => any): this {
        if (this.disabled) {
            return;
        }
        this.element.addEventListener("click", callback)
        return this;
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
    lastInt: number;
    lastNum: number
    getInt() {
        if (!this.element.value) {
            this.element.value = this.lastInt + ""
            return this.lastInt
        }
        return this.lastInt = parseInt(this.element.value)
    }
    getNum() {
        
        if (!this.element.value) {
            this.element.value = this.lastNum + ""
            return this.lastNum
        }
        return this.lastNum = parseFloat(this.element.value)
    }
    setValue(val: string) {
        this.element.value = val
        return this;
    }
    onChange(callback: (content: string, e: Event) => any) {
        this.element.addEventListener("focusout", (event) => {
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
        this.$input.setValue(val + "")
    }
    onChange(callback: (content: number, e: Event) => any) {
        const listener = (content: string, event: Event) => {
            callback(parseInt(content), event);
        }
        this.$input.onChange(listener)
        this.$up.onClick((e) => callback(this.getValue(), e))
        this.$down.onClick((e) => callback(this.getValue(), e))
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
        this.$int.setValue(time[0] + "");
        this.$nume.setValue(time[1] + "")
        this.$deno.setValue(time[2] + "")
    }
    _disabled: boolean;
    get disabled() {
        return this._disabled
    }
    set disabled(val) {
        this._disabled = val;
        [this.$int, this.$deno, this.$nume].forEach(($e) => $e.disabled = val)
    }
    onChange(callback: (result: TimeT) => void) {
        const listener = () => {
            if (!this.$deno.getValue()) {
                return;
            }
            callback(this.getValue())
        }
        this.$nume.onClick(listener)
    }
}

class BoxOption {
    $element: Z<"div">
    text: string;
    onChangedTo: (option: BoxOption) => void;
    onChanged: (option: BoxOption) => void
    constructor(text: string, onChangedTo?: (option: BoxOption) => void, onChanged?: (option: BoxOption) => void) {
        this.$element = $("div").addClass("box-option").text(text);
        this.text = text;
        this.onChangedTo = onChangedTo;
        this.onChanged = onChanged;
    }
}

class EditableBoxOption extends BoxOption {
    editsItself: boolean;
    onEdited: (option: BoxOption, text: string) => void
    constructor(text: string, onEdited: (option: BoxOption, text: string) => void, onChangedTo?: (option: BoxOption) => void, onChanged?: (option: BoxOption) => void, editsItself?: boolean) {
        super(text, onChangedTo, onChanged)
        this.onEdited = onEdited;
        this.editsItself = editsItself === undefined ? true : editsItself
    }
    edit(text: string) {
        this.onEdited(this, text)
        if (this.editsItself) {
            this.text = text;
        }
    }
}


class ZDropdownOptionBox extends Z<"div"> {
    callbacks: ((val: string) => any)[]
    readonly options: BoxOption[];
    _value: BoxOption;
    $optionList: Z<"div">
    get value() {
        return this._value;
    }
    set value(option) {
        this.$value.text(option.text);
        this._value = option
    }
    $value: Z<"div">
    constructor(options: BoxOption[], up: boolean=false) {
        super("div")
        this.callbacks = [];
        this.addClass("dropdown-option-box")
        if (up) {
            this.addClass("up")
        }
        this.$value = $("div")
        const span = $("span");
        this.append(span, this.$value);
        this.$optionList = $("div").addClass("dropdown-option-list");
        const optionList = this.$optionList
        span.append(optionList)
        this.options = options;
        const length = options.length;
        for (let i = 0; i < length; i++) {
            const $element = options[i].$element
            optionList.append($element)
        }
        optionList.onClick((event) => {
            const target = event.target
            if (target instanceof HTMLDivElement) {
                if (target !== this.value.$element.release()) {
                    let option: BoxOption;
                    for (let i =0; i < options.length; i++) {
                        option = options[i]
                        if (option.$element.release() === target) {
                            break;
                        }
                    }
                    this.value.onChanged && this.value.onChanged(this.value);
                    option.onChangedTo && option.onChangedTo(option)
                    this.value = option
                    this.callbacks.forEach(f => f(option.text))
                }
            }
        })
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
    appendOption(option: BoxOption): this {
        this.options.push(option);
        this.$optionList.append(option.$element);
        return this;
    }
    replaceWithOptions(options: BoxOption[]): this {
        this.options.splice(0, this.options.length)
            .forEach((option) => option.$element.remove())
        this.options.push(...options);
        for (let i = 0; i < options.length; i++) {
            this.$optionList.append(options[i].$element)
        }
        return this;
    }
}

class ZEditableDropdownOptionBox extends Z<"div"> {
    $optionList: Z<"div">
    callbacks: ((val: string) => any)[]
    readonly options: EditableBoxOption[];
    _value: EditableBoxOption;
    get value() {
        return this._value;
    }
    set value(option) {
        this.$value.setValue(option.text);
        this._value = option
    }
    $value: ZInputBox
    constructor(options: EditableBoxOption[], up: boolean=false) {
        super("div")
        this.callbacks = [];
        this.addClass("dropdown-option-box")
        if (up) {
            this.addClass("up")
        }
        this.$value = new ZInputBox()
        this.$value.onInput(() => {
            this.value.edit(this.$value.getValue())
        })
        const span = $("span");
        this.append(span, this.$value);
        this.$optionList = $("div").addClass("dropdown-option-list");
        const optionList = this.$optionList
        span.append(optionList)
        this.options = options;
        const length = options.length;
        for (let i = 0; i < length; i++) {
            const $element = options[i].$element
            optionList.append($element)
        }
        optionList.onClick((event) => {
            const target = event.target
            if (target instanceof HTMLDivElement) {
                if (target !== this.value.$element.release()) {
                    let option: EditableBoxOption;
                    for (let i =0; i < options.length; i++) {
                        option = options[i]
                        if (option.$element.release() === target) {
                            break;
                        }
                    }
                    this.value.onChanged && this.value.onChanged(this.value);
                    option.onChangedTo && option.onChangedTo(option)
                    this.value = option
                    this.callbacks.forEach(f => f(option.text))
                }
            }
        })
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
    appendOption(option: EditableBoxOption): this {
        this.options.push(option);
        this.$optionList.append(option.$element);
        return this;
    }
    replaceWithOptions(options: EditableBoxOption[]): this {
        this.options.splice(0, this.options.length)
            .forEach((option) => option.$element.remove())
        this.options.push(...options);
        for (let i = 0; i < options.length; i++) {
            this.$optionList.append(options[i].$element)
        }
        return this;
    }
}




class ZEasingBox extends Z<"div"> {
    callbacks: ((value: number) => void)[]
    $input: ZArrowInputBox;
    $easeType: ZDropdownOptionBox;
    $funcType: ZDropdownOptionBox;
    constructor() {
        super("div")
        this.callbacks = []
        const IN = new BoxOption("in")
        const OUT = new BoxOption("out")
        const IO = new BoxOption("inout")
        const easeTypeOptionMapping = {in: IN, out: OUT, inout: IO}
        const funcTypeOptions = []
        for (let key in Object.keys(easingMap)) {
            funcTypeOptions.push(new BoxOption(key))
        }
        this.$input = new ZArrowInputBox()
            .onChange((num) => {
                const easing = easingArray[num]
                this.$easeType.value = easeTypeOptionMapping[easing.easeType];
                this.$funcType.value = easeTypeOptionMapping[easing.funcType];
            });
        this.$easeType = new ZDropdownOptionBox([
            IN,
            OUT,
            IO
        ]).onChange(() => this.update())
        this.$funcType = new ZDropdownOptionBox(funcTypeOptions).onChange(() => this.update())

        this.addClass("flex-row")
            .append(
                this.$input,
                $("span").text("Ease"), this.$easeType, this.$funcType
                
            )
    }
    update() {
        this.value = easingMap[this.$funcType.value.text][this.$easeType.value].id;
        this.$input.setValue(this.value)
        this.callbacks.forEach(f => f(this.value))
    }
    _value: number;
    set value(val) {
        this._value = val;
    }
    get value() {return this._value}
    onChange(callback: (value: number) => void) {
        this.callbacks.push(callback)
    }
}