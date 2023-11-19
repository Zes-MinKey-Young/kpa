

const DEFAULT_ASPECT_RATIO = 3 / 2
const LINE_WIDTH = 10;
const LINE_COLOR = "#CCCC77"

class Player {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    chart: Chart;
    audio: HTMLAudioElement;
    playing: boolean;
    background: HTMLImageElement;
    aspect: number;
    noteSize: number;

    topBarEle: HTMLDivElement;
    previewEle: HTMLDivElement;
    noteInfoEle: HTMLDivElement;
    eventSequenceEle: HTMLDivElement;
    lineInfoEle: HTMLDivElement;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = canvas.getContext("2d");
        this.audio = new Audio();
        this.playing = false;
        this.aspect = DEFAULT_ASPECT_RATIO;
        this.noteSize = 135;
        this.initCoordinate();

        // @ts-ignore
        this.topBarEle = document.getElementById("topBar")
        // @ts-ignore
        this.previewEle = document.getElementById("preview")
        // @ts-ignore
        this.topBarEle = document.getElementById("topBar")
        // @ts-ignore
        this.topBarEle = document.getElementById("topBar")
        // @ts-ignore
        this.topBarEle = document.getElementById("topBar")
    }
    get time(): number {
        return this.audio.currentTime
    }
    get beats(): number {
        return this.chart.timeCalculator.secondsToBeats(this.time)
    }
    initCoordinate() {
        let {canvas, context} = this;
        
        // console.log(context.getTransform())
        const height = canvas.parentElement.clientHeight;
        const width = height * (this.aspect)
        canvas.height = height;
        canvas.width = width;
        // context.translate(height / 2, width / 2) 好好纪念这个把我气吐血的智障
        context.translate(width / 2, height / 2)
        context.scale(width / 1350, -height / 900)
        context.save()
        // console.log(context.getTransform())
    }
    render() {
        this.context.scale(1, -1)
        this.context.drawImage(this.background, -675, -450, 1350, 900);
        this.context.fillStyle = "#2227";
        this.context.fillRect(-675, -450, 1350, 900)
        this.context.restore()
        this.context.save()
        const context = this.context;
        context.strokeStyle = "#000000"
        context.beginPath();
        context.moveTo(-1350, 0);
        context.lineTo(1350, 0);
        context.stroke();
        context.beginPath();
        context.moveTo(0, 900);
        context.lineTo(0, -900);
        context.stroke();
        // console.log("rendering")
        for (let line of this.chart.judgeLines) {
            this.renderLine(line);
            context.restore()
            context.save()
        }
    }
    renderLine(judgeLine: JudgeLine) {
        const context = this.context;
        // const timeCalculator = this.chart.timeCalculator
        let x = judgeLine.getStackedValue("moveX", this.beats)
        let y = judgeLine.getStackedValue("moveY",this.beats)
        let theta = judgeLine.getStackedValue("rotate", this.beats) / 180 * Math.PI // 转换为弧度制
        let alpha = judgeLine.getStackedValue("alpha", this.beats);
        // console.log(x, y, theta, alpha);
        context.translate(x, y);
        context.rotate(theta);

        context.lineWidth = LINE_WIDTH; // 判定线宽度
        // const hexAlpha = alpha < 0 ? "00" : (alpha > 255 ? "FF" : alpha.toString(16))
        context.strokeStyle = `rgba(200, 200, 120, ${alpha / 255})`
        context.beginPath();
        context.moveTo(-1350, 0);
        context.lineTo(1350, 0);
        context.stroke();
        context.drawImage(ANCHOR, -10, -10)
        for (let eachSpeed in judgeLine.noteSpeeds) {
            const speed = parseFloat(eachSpeed)
            let notes = judgeLine.noteSpeeds[eachSpeed];
            /** 判定线在假想的瀑布中前进距离 */
            let currentPositionY = judgeLine.computeLinePositionY(this.beats, this.chart.timeCalculator) * speed;
            for (let eachNote of notes) {
                /** Note在某一时刻与判定线的距离 */
                let positionY: number = eachNote.positionY - currentPositionY;
                let endpositionY;
                if ((endpositionY = eachNote.endpositionY - currentPositionY) >= 0 && TimeCalculator.toBeats(eachNote.endTime) >= this.beats) {
                    // 绑线Note=0不要忘了
                    this.renderNote(eachNote, positionY < 0 ? 0 : positionY, endpositionY)
                    console.log(eachNote, eachNote.above)
                    // console.log("pos:", eachNote.positionY, notes.indexOf(eachNote))
                }
            }
        }
    }
    renderNote(note: Note, positionY: number, endpositionY?: number) {
        let image: HTMLImageElement;
        switch (note.type) {
            case NoteType.Tap:
                image = TAP;
                break;
            case NoteType.Drag:
                image = DRAG;
                break;
            case NoteType.Flick:
                image = FLICK;
                break;
            case NoteType.Hold:
                image = HOLD;
                break;
            default:
                image = TAP;
        }
        // console.log(NoteType[note.type])
        if (note.type === NoteType.Hold) {
            this.context.drawImage(image, note.positionX - this.noteSize / 2,  note.above ? positionY : -positionY, this.noteSize, note.above ? endpositionY - positionY : positionY - endpositionY)
        } else {
            this.context.drawImage(image, note.positionX - this.noteSize / 2, note.above ? positionY : -positionY)
            if (note.double) {
                this.context.drawImage(DOUBLE, note.positionX - this.noteSize / 2, note.above ? positionY : -positionY);
            }
            if (!note.above) {
                this.context.drawImage(BELOW, note.positionX - this.noteSize / 2, note.above ? positionY : -positionY);
                
            }
        }
    }
    private update() {
        if (!this.playing) {
            return;
        }
        // console.log("anifr")
        requestAnimationFrame(() => {
            // console.log("render")
            this.render();
            this.update();
        })
    }
    play() {
        this.audio.play()
        this.playing = true;
        this.update();
    }
    pause() {
        this.playing = false;
        this.audio.pause()
    }
}


