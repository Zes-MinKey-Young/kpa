const easeOutElastic = (x: number): number => {
    const c4 = (2 * Math.PI) / 3;
    
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

const easeOutBounce = (x: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

const easeOutExpo = (x: number): number =>{
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

const easeOutBack = (x: number): number =>{
    const c1 = 1.70158;
    const c3 = c1 + 1;
    
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

const linear = (x: number): number => x


const easeOutSine = (x: number): number => Math.sin((x * Math.PI) / 2);


const easeInQuad = (x: number): number => Math.pow(x, 2)


const easeInCubic = (x: number): number => Math.pow(x, 3)


const easeInQuart = (x: number): number => Math.pow(x, 4)


const easeInQuint = (x: number): number => Math.pow(x, 5)


const easeInCirc = (x: number): number => 1 - Math.sqrt(1 - Math.pow(x, 2))


function mirror(easeOut: (x: number) => number) {
    return (x: number) => 1 - easeOut(1 - x);
}

function toEaseInOut(easeIn: (x: number) => number, easeOut: (x: number) => number) {
    return (x: number) => x < 0.5 ? easeIn(2 * x) / 2 : (1 + easeOut(2 * x - 1)) / 2
}

const easeOutQuad = mirror(easeInQuad);
const easeInSine = mirror(easeOutSine);
const easeOutQuart = mirror(easeInQuart);
const easeOutCubic = mirror(easeInCubic);
const easeOutQuint = mirror(easeInQuint);
const easeOutCirc = mirror(easeInCirc);
const easeInExpo = mirror(easeOutExpo);
const easeInElastic = mirror(easeOutElastic);
const easeInBounce = mirror(easeOutBounce);
const easeInBack = mirror(easeOutBack);
const easeInOutSine = toEaseInOut(easeInSine, easeOutSine);
const easeInOutQuad = toEaseInOut(easeInQuad, easeOutQuad);
const easeInOutCubic = toEaseInOut(easeInCubic, easeOutCubic);
const easeInOutQuart = toEaseInOut(easeInQuart, easeOutQuart);
const easeInOutQuint = toEaseInOut(easeInQuint, easeOutQuint);
const easeInOutExpo = toEaseInOut(easeInExpo, easeOutExpo);
const easeInOutCirc = toEaseInOut(easeInCirc, easeOutCirc);
const easeInOutBack = toEaseInOut(easeInBack, easeOutBack);
const easeInOutElastic = toEaseInOut(easeInElastic, easeOutElastic);
const easeInOutBounce = toEaseInOut(easeInBounce, easeOutBounce);

const easingFnMap = {
    "linear": [linear, linear, linear],
    "sine": [easeInSine, easeOutSine, toEaseInOut(easeInSine, easeOutSine)],
    "quad": [easeInQuad, easeOutQuad, toEaseInOut(easeInQuad, easeOutQuad)],
    "cubic": [easeInCubic, easeOutCubic, toEaseInOut(easeInCubic, easeOutCubic)],
    "quart": [easeInQuart, easeOutQuart, toEaseInOut(easeInQuart, easeOutQuart)],
    "quint": [easeInQuint, easeOutQuint, toEaseInOut(easeInQuint, easeOutQuint)],
    "expo": [easeInExpo, easeOutExpo, toEaseInOut(easeInExpo, easeOutExpo)],
    "circ": [easeInCirc, easeOutCirc, toEaseInOut(easeInCirc, easeOutCirc)],
    "back": [easeInBack, easeOutBack, toEaseInOut(easeInBack, easeOutBack)],
    "elastic": [easeInElastic, easeOutElastic, toEaseInOut(easeInElastic, easeOutElastic)],
    "bounce": [easeInBounce, easeOutBounce, toEaseInOut(easeInBounce, easeOutBounce)]
}

abstract class Easing {
    constructor() {

    }
    /**
     * 返回当前变化量与变化量之比
     * 或者当前数值。（参数方程）
     * @param t 一个0-1的浮点数，代表当前经过时间与总时间之比
     */
    abstract getValue(t: number): number;
}

class NormalEasing extends Easing {
    _getValue: (t: number) => number;
    constructor(fn: (x: number) => number) {
        super()
        this._getValue = fn;
    }
    getValue(t: number): number {
        if (t > 1 || t < 0) {
            console.warn("缓动超出定义域！")
            debugger;
        }
        // console.log("t:", t, "rat", this._getValue(t))
        return this._getValue(t)
    }
}

interface Coordinate {
    x:number;
    y: number;
}

class BezierEasing extends Easing {
    cp1: Coordinate;
    cp2: Coordinate;
    constructor() {
        super()
    }
    getValue(t: number): number {
        // 问MDN AI Help搞的（

        // 使用贝塞尔曲线公式计算纵坐标
        // 具体计算方法可以参考数学相关的贝塞尔曲线公式
        // 这里只是一个示例，具体实现需要根据实际情况进行调整
        const startx = 0;
        const starty = 0;
        const endx = 1;
        const endy = 1;
        const para = (t - startx) / (endx - startx);
        const y = (1 - para) ** 3 * starty + 3 * (1 - para) ** 2 * para * this.cp1.y + 3 * (1 - para) * para ** 2 * this.cp2.y + para ** 3 * endy;
        return y;
    }
}

class TemplateEasing extends Easing {
    eventNodeSequence: EventNodeSequence;
    constructor(nodes: EventNodeSequence) {
        super()
        this.eventNodeSequence = nodes;
    }
    getValue(t: number) {
        let seq = this.eventNodeSequence
        let delta = this.valueDelta;
        let frac = seq.getValueAt(t * this.eventNodeSequence.effectiveBeats)
        return delta === 0 ? frac : frac / delta;
    }
    get valueDelta(): number {
        let seq = this.eventNodeSequence;
        return seq.tail.value - seq.head.value;
    }
}

class ParametricEquationEasing extends Easing {
    _getValue: (x: number) => number;
    constructor(equation: string) {
        super()
        // @ts-ignore
        this._getValue = new Function("t", equation)
    }
    getValue(t: number): number {
        return this._getValue(t);
    }
}

class TemplateEasingLib {
    easings: {
        [name: string]: TemplateEasing
    }
    constructor() {
        this.easings = {};
    }
    add(...customEasingData: CustomEasingData[]) {
        const easings: {[name: string]: CustomEasingData} = {};
        for (let each of customEasingData) {
            easings[each.name] = each;
        }
        for (let each of customEasingData) {
            if (each.dependencies.length !== 0) {
                for (let dependency of each.dependencies) {
                    if (easings[dependency].usedBy.includes(each.name)) {
                        continue
                    }
                    easings[dependency].usedBy.push(each.name)
                }
            }
        }
        for (let each of customEasingData) {
            this.addOne(each, easings);
        }
    }
    private addOne(customEasingData: CustomEasingData, mayDepend: {[name: string]: CustomEasingData}) {

        if (customEasingData.dependencies.length !== 0) {
            return
        }
        this.easings[customEasingData.name] = new TemplateEasing(
            EventNodeSequence.fromRPEJSON(EventType.Easing, customEasingData.content, this, undefined)
            );
        if (customEasingData.usedBy) {
            for (let name of customEasingData.usedBy) {
                const dependencies = mayDepend[name].dependencies;
                dependencies.splice(dependencies.indexOf(customEasingData.name))
                if (dependencies.length === 0) {
                    this.addOne(mayDepend[name], mayDepend)
                }
            }
        }
    }
    /**
     * 有顺序不用考虑依赖处理
     * @param customEasingData
     */
    addOrdered(customEasingData: CustomEasingData[]) {
        for (let each of customEasingData) {
            this.easings[each.name] = new TemplateEasing(
            EventNodeSequence.fromRPEJSON(EventType.Easing, each.content, this, undefined)
            );
        }
        
    }
    get(key: string) {
        return this.easings[key];
    }
}

const linearEasing = new NormalEasing(linear);
const fixedEasing = new NormalEasing((x: number): number => (x === 1 ? 1 : 0));

const easingMap = {
    "linear": {out: linearEasing, in: linearEasing, inout: linearEasing},
    "sine": {in: new NormalEasing(easeInSine), out: new NormalEasing(easeOutSine), inout: new NormalEasing(easeInOutSine)},
    "quad": {in: new NormalEasing(easeInQuad), out: new NormalEasing(easeOutQuad), inout: new NormalEasing(easeInOutQuad)},
    "cubic": {in: new NormalEasing(easeInCubic), out: new NormalEasing(easeOutCubic), inout: new NormalEasing(easeInOutCubic)},
    "quart": {in: new NormalEasing(easeInQuart), out: new NormalEasing(easeOutQuart), inout: new NormalEasing(easeInOutQuart)},
    "quint": {in: new NormalEasing(easeInQuint), out: new NormalEasing(easeOutQuint), inout: new NormalEasing(easeInOutQuint)},
    "expo": {in: new NormalEasing(easeInExpo), out: new NormalEasing(easeOutExpo), inout: new NormalEasing(easeInOutExpo)},
    "circ": {in: new NormalEasing(easeInCirc), out: new NormalEasing(easeOutCirc), inout: new NormalEasing(easeInOutCirc)},
    "back": {in: new NormalEasing(easeInBack), out: new NormalEasing(easeOutBack), inout: new NormalEasing(easeInOutBack)},
    "elastic": {in: new NormalEasing(easeInElastic), out: new NormalEasing(easeOutElastic), inout: new NormalEasing(easeInOutElastic)},
    "bounce": {in: new NormalEasing(easeInBounce), out: new NormalEasing(easeOutBounce), inout: new NormalEasing(easeInOutBounce)}
}

const easingArray = [
    fixedEasing,
    linearEasing,
    easingMap.sine.out,
    easingMap.sine.in,
    easingMap.sine.inout,
    easingMap.quad.out,
    easingMap.quad.in,
    easingMap.quad.inout,
    easingMap.cubic.out,
    easingMap.cubic.in,
    easingMap.cubic.inout,
    easingMap.quart.out,
    easingMap.quart.in,
    easingMap.quart.inout,
    easingMap.quint.out,
    easingMap.quint.in,
    easingMap.quint.inout,
    easingMap.circ.out,
    easingMap.circ.in,
    easingMap.circ.inout,
    easingMap.expo.out,
    easingMap.expo.in,
    easingMap.expo.inout,
    easingMap.back.out,
    easingMap.back.in,
    easingMap.back.inout,
    easingMap.elastic.out,
    easingMap.elastic.in,
    easingMap.elastic.inout,
    easingMap.bounce.out,
    easingMap.bounce.in,
    easingMap.bounce.inout
]

const rpeEasingArray = [
    null,
    linearEasing, // 1
    easingMap.sine.out, // 2
    easingMap.sine.in, // 3
    easingMap.quad.out, // 4
    easingMap.quad.in, // 5
    easingMap.sine.inout, // 6
    easingMap.quad.inout, // 7
    easingMap.cubic.out, // 8
    easingMap.cubic.in, // 9
    easingMap.quart.out, // 10
    easingMap.quart.in, // 11
    easingMap.cubic.inout, // 12
    easingMap.quart.inout, // 13
    easingMap.quint.out, // 14
    easingMap.quint.in, // 15
    // easingMap.quint.inout,
    easingMap.expo.out, // 16
    easingMap.expo.in, // 17
    // easingMap.expo.inout,
    easingMap.circ.out, // 18
    easingMap.circ.in, // 19
    easingMap.back.out, // 20
    easingMap.back.in, // 21
    easingMap.circ.inout, // 22
    easingMap.back.inout, // 23
    easingMap.elastic.out, // 24
    easingMap.elastic.in, // 25
    easingMap.bounce.out, // 26
    easingMap.bounce.in, // 27
    easingMap.bounce.inout, //28
    easingMap.elastic.inout // 29
]