
interface ListNode<T> {
    next: ListNode<T> | null;
    value: T;
}

interface TwoDirectionNode {
    previous: TwoDirectionNode | Header<TwoDirectionNode>;
    next: TwoDirectionNode | Tailer<TwoDirectionNode>;
}

interface Header<TN extends TwoDirectionNode> {
    next: TN;
    heading: true;
}


interface Tailer<TN extends TwoDirectionNode> {
    previous: TN;
    tailing: true;
}
type TypeOrHeader<T extends TwoDirectionNode> = Header<T> | T
type TypeOrTailer<T extends TwoDirectionNode> = Tailer<T> | T

const connect = <T>(foreNode: ListNode<T>, lateNode: ListNode<T>) => {
    foreNode.next = lateNode;
}

type RGB = [number, number, number]

const rgba = (r: number, g: number, b: number, a: number) => `rgba(${r}, ${g}, ${b}, ${a})`
const rgb = (r: number, g: number, b: number) => `rgba(${r}, ${g}, ${b})`

const toTimeString = (beaT: TimeT) /*`${number}:${number}/${number}`*/ =>  `${beaT[0]}:${beaT[1]}/${beaT[2]}`

function drawLine(context: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
    context.beginPath()
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke()
}
// ParameterListSoLoooongException()
function drawBezierCurve(context: CanvasRenderingContext2D,startX: number, startY: number, endX: number, endY: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    context.stroke();
}
function on<K extends keyof HTMLElementEventMap>(
    eventTypes: K[],
    element: HTMLElement,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
) {
    for (let type of eventTypes) {
        element.addEventListener(type, handler);
    }
}



type Vector = [x: number, y: number]

const absVector = (v: Vector) => {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
}
const innerProduct = (v1: Vector, v2: Vector) => {
    return v1[0] * v2[0] + v1[1] * v2[1];
}
