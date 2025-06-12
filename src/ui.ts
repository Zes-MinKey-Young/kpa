


type CSSStyleName = Exclude<keyof CSSStyleDeclaration, "length"
    | "parentRule" | "item" | "getPropertyValue" 
    | "getPropertyPriority" | "setProperty" | "removeProperty">

/**
 * Z is just like jQuery, but it's much simpler.
 * It only contains one element, which is enough in most cases.
 * In contrast, jQuery can contain multiple elements, which makes the type inference miserable sometimes.
 * When you need to create a new element, unlike jQuery, you do not need to wrap the tag name with <>.
 * just use $("div"), for example.
 * The type parameter is the tagname instead of the class of the element,
 * which settles the problem that in jQuery the editor does not infer $("<tagName>") as a specific HTMLElement Type.
 * For example, $("<input>") in jQuery cannot be directly inferred as JQuery<HTMLInputElement>.
 * But $("input") in Z is obviously inferred as Z<"input">.
 * Supports chaining, like jQuery.
 */
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
    css(name: CSSStyleName, value: string) {
        if (value) {
            this.element.style[name] = value
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
    on(eventType: string, callback: (e: Event) => any) {
        this.element.addEventListener(eventType, callback)
        return this;
    }
    show() {
        this.element.style.display = ""
    }
    hide() {
        this.element.style.display = "none"
    }
    remove() {
        this.element.remove()
    }
}

const $ = <K extends keyof HTMLElementTagNameMap>(...args: [K]) => new Z(...args);

/*
 * The classes below encapsulate some common UI Gadgets in KPA.
 */

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
/**
 * An input box with up and down arrows, which can and can only be used to input numbers.
 */
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
        return this
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
/**
 * An input box for mixed fractions, which is convenient for inputting time (beats) in music.
 */
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
    /**
     * 
     * @param options 
     * @param up determine whether the dropdown is up or down
     */
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
        this.$value.css("width", "100%")
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

class ZMemorableBox extends ZEditableDropdownOptionBox {
    constructor(options: string[], up: boolean=false) {
        super([], up)
        for (let i = 0; i < options.length; i++) {
            this.appendString(options[i])
        }
    }
    constructOption(str: string) {
        return new EditableBoxOption(str, (o, text) => {this.appendString(text)}, (_) => undefined, (_) => undefined, false)
    }
    appendString(str: string) {
        this.appendOption(this.constructOption(str))
    }
}

namespace EasingOptions {
    export const IN = new BoxOption("in");
    export const OUT = new BoxOption("out");
    export const IO = new BoxOption("inout");
    export const easeTypeOptions = [IN, OUT, IO];
    export const easeTypeOptionsMapping = {in: IN, out: OUT, inout: IO}
    export const FIXED = new BoxOption("fixed");
    export const LINEAR = new BoxOption("linear");
    export const SINE = new BoxOption("sine");
    export const QUAD = new BoxOption("quad");
    export const CUBIC = new BoxOption("cubic");
    export const QUART = new BoxOption("quart");
    export const QUINT = new BoxOption("quint");
    export const EXPO = new BoxOption("expo");
    export const CIRC = new BoxOption("circ");
    export const BACK = new BoxOption("back");
    export const ELASTIC = new BoxOption("elastic");
    export const BOUNCE = new BoxOption("bounce");
    export const funcTypeOptions = [FIXED, LINEAR, SINE, QUAD, CUBIC, QUART, QUINT, EXPO, CIRC, BACK, ELASTIC, BOUNCE];
    export const funcTypeOptionsMapping = {fixed: FIXED,linear: LINEAR, sine: SINE, quad: QUAD, cubic: CUBIC, quart: QUART, quint: QUINT, expo: EXPO, circ: CIRC, back: BACK, elastic: ELASTIC, bounce: BOUNCE}
}

/**
 * Easing box
 * A box to input normal easings (See ./easing.ts)
 */
class ZEasingBox extends Z<"div"> {
    callbacks: ((value: number) => void)[]
    $input: ZArrowInputBox;
    $easeType: ZDropdownOptionBox;
    $funcType: ZDropdownOptionBox;
    value: number;
    constructor() {
        super("div")
        this.callbacks = []
        this.$input = new ZArrowInputBox()
            .onChange((num) => {
                const easing = easingArray[num]
                this.$easeType.value = EasingOptions.easeTypeOptionsMapping[easing.easeType];
                this.$funcType.value = EasingOptions.funcTypeOptionsMapping[easing.funcType];
            });
        this.$easeType = new ZDropdownOptionBox(EasingOptions.easeTypeOptions).onChange(() => this.update())
        this.$funcType = new ZDropdownOptionBox(EasingOptions.funcTypeOptions).onChange(() => this.update())

        this.addClass("flex-row")
            .append(
                this.$input,
                $("span").text("Ease"), this.$easeType, this.$funcType
            )
    }
    update() {
        this.value = easingMap[this.$funcType.value.text][this.$easeType.value.text].id;
        this.$input.setValue(this.value)
        this.callbacks.forEach(f => f(this.value))
    }
    /**
     * Set a new KPA easing id and change the $funcType and $easeType, but does not call the callback
     * @param easing
     */
    setValue(easing: NormalEasing) {
        this.value = easing.id;
        this.$input.setValue(this.value)
        this.$funcType.value = EasingOptions.funcTypeOptionsMapping[easing.funcType];
        this.$easeType.value = EasingOptions.easeTypeOptionsMapping[easing.easeType];
    }

    onChange(callback: (value: number) => void) {
        this.callbacks.push(callback)
    }
}

class ZRadioBox extends Z<"div"> {
    callbacks: ((index: number) => void)[];
    $inputs: Z<"input">[];
    selectedIndex: number;
    constructor(name:string, options: string[], defaultIndex: number = 0) {
        super("div")
        this.callbacks = [];
        this.$inputs = [];
        this.addClass("radio-box")
        for (let i = 0; i < options.length; i++) {
            const $input = $("input").attr("type", "radio").attr("name", name);
            this.$inputs.push($input);
            const $label = $("label").text(options[i]);
            this.append($input, $label)
            $input.on("change",() => {
                if (this.selectedIndex === i) { return }
                this.selectedIndex = i
                this.callbacks.forEach(f => f(i))

            })
            if (i === defaultIndex) {
                $input.attr("checked", "true")
            }
        }
        this.selectedIndex = defaultIndex;
    }
    onChange(callback: (index: number) => void) {
        this.callbacks.push(callback);
        return this;
    }
    /**
     * 只转到某个选项，但不触发回调
     * @param index 
     * @returns 
     */
    switchTo(index: number) {
        if (this.selectedIndex === index) { return }
        this.$inputs[this.selectedIndex].element.checked = false
        this.$inputs[index].element.checked = true
        this.selectedIndex = index
        return this;
    }
}

/**
 * A tabbed UI, with input[type="radio"]s on the top
 */
class ZRadioTabs extends Z<"div"> {
    $radioBox: ZRadioBox;
    selectedIndex: number;
    $pages: Z<any>[]
    constructor(name: string, pages: Plain<Z<any>>, defaultIndex: number = 0) {
        super("div")
        this.$pages = []
        this.addClass("radio-tabs")
        const keys = Object.keys(pages)
        this.$radioBox = new ZRadioBox(name, keys, defaultIndex)
        this.append(this.$radioBox)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.append(pages[key]);
            if (i !== defaultIndex) {
                pages[key].hide()
            }
        }
        this.selectedIndex = defaultIndex;
        this.$radioBox.onChange((index) => {
            if (this.selectedIndex === index) { return }
            pages[keys[this.selectedIndex]].hide()
            pages[keys[index]].show()
            this.selectedIndex = index
        })
    }
    onChange(callback: (index: number) => void) {
        this.$radioBox.onChange(callback)
        return this;
    }
    /**
     * 只转到某个选项，但不触发回调
     * @param index 
     * @returns 
     */
    switchTo(index: number) {
        this.$radioBox.switchTo(index)
        this.$pages[this.selectedIndex].hide()
        this.$pages[index].show()
        this.selectedIndex = index;
        return this;
    }
}
