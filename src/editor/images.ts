const TAP = new Image(135);
const DRAG = new Image(135);
const FLICK = new Image(135);
const HOLD = new Image(135);
const HOLD_HEAD = new Image(135);
const HOLD_BODY = new Image(135);
const DOUBLE = new Image(135);
const BELOW = new Image(135);
const ANCHOR = new Image(20, 20);
const NODE_START = new Image(20, 10);
const NODE_END = new Image(20, 10);
const HIT_FX = new Image(1024, 1024);
const SELECT_NOTE = new Image(135);
const TRUCK = new Image(135);

TAP.src = "../img/tap.png"
DRAG.src = "../img/drag.png"
FLICK.src = "../img/flick.png"
HOLD.src = "../img/hold.png"
HOLD_HEAD.src = "../img/holdHead.png"
HOLD_BODY.src = "../img/holdBody.png"
ANCHOR.src = "../img/anchor.png"
BELOW.src = "../img/below.png"
DOUBLE.src = "../img/double.png"
NODE_START.src = "../img/south.png"
NODE_END.src = "../img/north.png"
HIT_FX.src = "../img/hit_fx.png"
SELECT_NOTE.src = "../img/selectNote.png"
TRUCK.src = "../img/Truck.png"



const drawNthFrame = (context: CanvasRenderingContext2D, nth: number, dx: number, dy: number, dw: number, dh: number) => {
    const x = nth % 4;
    const y = (nth - x) / 4
    context.drawImage(HIT_FX, x * 256, y * 256, 256, 256, dx, dy, dw, dh)
}

const getImageFromType = (noteType: NoteType) => {
    switch (noteType) {
        case NoteType.tap:
            return TAP;
        case NoteType.drag:
            return DRAG;
        case NoteType.flick:
            return  FLICK;
        case NoteType.hold:
            return HOLD_HEAD;
        default:
            return TAP;
    }
}
