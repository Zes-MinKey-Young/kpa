
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
}

class ZInputBox extends Z<"input"> {
    constructor() {
        super("input")
        this.addClass("input-box")
        this.attr("type", "text")
    }
    getValue() {
        return this.element.value
    }
    getNum() {
        return this.element.valueAsNumber
    }
    setValue(val) {
        this.element.value = val
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
        this.element.append(
            this.$int.release(),
            this.$nume.release(),
            $("div").addClass("line").release(),
            this.$deno.release()
        )
    }
    getValue(): TimeT {
        return [this.$int.getNum() || 0, this.$nume.getNum() || 1, this.$deno.getNum() || 0]
    }
    setValue(time: TimeT) {
        this.$int.setValue(time[0]);
        this.$nume.setValue(time[1])
        this.$deno.setValue(time[2])
    }
}
