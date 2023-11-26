

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

    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.context = canvas.getContext("2d");
        this.audio = new Audio();
        this.playing = false;
        this.aspect = DEFAULT_ASPECT_RATIO;
        this.noteSize = 135;
        this.initCoordinate();

    }
    get time(): number {
        return this.audio.currentTime || 0
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
        for (let line of this.chart.orphanLines) {
            this.renderLine(line);
            context.restore()
            context.save()
        }

        const showInfo = settings.get("playerShowInfo");
        
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
        if (judgeLine.children.length !== 0) {
            context.save();
            for (let line of judgeLine.children) {
                this.renderLine(line);
            }
            context.restore();
        }
        context.rotate(theta);

        context.lineWidth = LINE_WIDTH; // 判定线宽度
        // const hexAlpha = alpha < 0 ? "00" : (alpha > 255 ? "FF" : alpha.toString(16))
        const lineColor = settings.get("lineColor")
        context.strokeStyle = `rgba(${lineColor[0]}, ${lineColor[1]}, ${lineColor[2]}, ${alpha / 255})`
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
                const positionY: number = eachNote.positionY - currentPositionY;
                const endPositionY = eachNote.endPositionY - currentPositionY;
                if (!positionY && positionY !== 0 || !endPositionY && endPositionY !== 0) {
                    debugger;
                }
                if (endPositionY >= 0 && TimeCalculator.toBeats(eachNote.endTime) >= this.beats) {
                    // 绑线Note=0不要忘了
                    this.renderNote(eachNote, positionY < 0 ? 0 : positionY, endPositionY)
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
        if (!note.above) {
            positionY = -positionY;
            endpositionY = -endpositionY
        }
        let length = endpositionY - positionY
        // console.log(NoteType[note.type])
        if (note.type === NoteType.Hold) {
            this.context.drawImage(image, note.positionX - this.noteSize / 2,  positionY - 10, this.noteSize, length)
        } else {
            this.context.drawImage(image, note.positionX - this.noteSize / 2, positionY - 10)
            if (note.double) {
                this.context.drawImage(DOUBLE, note.positionX - this.noteSize / 2, positionY - 10);
            }
            if (!note.above) {
                this.context.drawImage(BELOW, note.positionX - this.noteSize / 2, positionY - 10);
                
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


