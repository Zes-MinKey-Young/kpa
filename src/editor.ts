

class EventCurveEditor {
    sequence: EventNodeSequence;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    halfRange: number;
    halfCent: number;
    valueRatio: number;
    timeRatio: number;
    valueRange: number;
    basis: number;
    constructor(sequence: EventNodeSequence) {
        this.sequence = sequence;
        this.canvas = document.createElement("canvas")
        this.canvas.width = 400//this.canvas.parentElement.clientWidth;
        this.canvas.height = 100;
        this.context = this.canvas.getContext("2d");
        this.halfRange = 5
        this.halfCent = this.halfRange * 100;
        this.valueRange = 20;
        this.basis = -this.canvas.height / 2;
        this.valueRatio = this.canvas.height / this.valueRange;
        this.timeRatio = this.canvas.width / 2 / this.halfCent;
        this.update()
    }
    update() {
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.context.scale(1, -1)
        this.context.strokeStyle = "#EEE"
        this.context.fillStyle = "#333"
        this.context.lineWidth = 3
    }
    draw(beats: number) {
        const {height, width} = this.canvas
        this.context.fillRect(-width / 2, height / 2, width, -height)
        const beatCents = beats * 100
        const stop = beatCents + this.halfCent;
        let b = beatCents - this.halfCent
        if (b < 10) {
            b = 10
        }
        let lastValue = this.sequence.getValueAt((b - 10) / 100)
        for (; b < stop; b+=10) {
            let nowValue = this.sequence.getValueAt(b / 100)
            this.context.beginPath()
            this.context.moveTo((b - 10 - beatCents) * this.timeRatio, lastValue * this.valueRatio + this.basis)
            this.context.lineTo((b - beatCents) * this.timeRatio, nowValue * this.valueRatio + this.basis)
            this.context.stroke()
            debugger
            lastValue = nowValue;
        }
    }
}

class Editor {
    player: Player;
    chart: Chart;
    fileInput: HTMLInputElement
    musicInput: HTMLInputElement
    backgroundInput: HTMLInputElement
    eventCurveEditors: EventCurveEditor[]

    
    topbarEle: HTMLDivElement;
    previewEle: HTMLDivElement;
    noteInfoEle: HTMLDivElement;
    eventSequenceEle: HTMLDivElement;
    lineInfoEle: HTMLDivElement;
    playButton: HTMLButtonElement;
    constructor() {
        // @ts-ignore
        this.player = new Player(document.getElementById("player"))
        // @ts-ignore
        this.fileInput = document.getElementById("fileInput")
        // @ts-ignore
        this.musicInput = document.getElementById("musicInput")
        // @ts-ignore
        this.backgroundInput = document.getElementById("backgroundInput")

        
        // @ts-ignore
        this.topbarEle = document.getElementById("topbar")
        // @ts-ignore
        this.previewEle = document.getElementById("preview")
        // @ts-ignore
        this.eventSequenceEle = document.getElementById("eventSequence")
        // @ts-ignore
        this.noteInfoEle = document.getElementById("noteInfo")
        // @ts-ignore
        this.lineInfoEle = document.getElementById("lineInfo")

        // @ts-ignore
        this.playButton = document.getElementById("playButton")
        this.playButton.addEventListener("click", (event) => {
            if (!this.playing) {
                this.play();
                this.playButton.innerHTML = "暂停"
            } else {
                this.player.pause();
                this.playButton.innerHTML = "继续"
            }
        })

        this.fileInput.addEventListener("change", () => {
            const reader = new FileReader()
            reader.readAsText(this.fileInput.files[0])
            reader.addEventListener("load", () => {
                if (typeof reader.result !== "string") {
                    return;
                }
                let data = JSON.parse(reader.result)
                let chart = Chart.fromRPEJSON(data);
                this.player.chart = chart;
                this.chart = chart;
                this.player.render()
                this.eventCurveEditors = []
                let eventCurveEditor = new EventCurveEditor(chart.judgeLines[0].eventLayers[0].speed);
                this.eventSequenceEle.appendChild(eventCurveEditor.canvas)
                this.eventCurveEditors.push(eventCurveEditor)
                eventCurveEditor.draw(0)
                /**
                player.background = new Image();
                player.background.src = "../cmdysjtest.jpg";
                player.audio.src = "../cmdysjtest.mp3"; */
            })
        })

        this.musicInput.addEventListener("change", () => {
            const reader = new FileReader()
            reader.readAsDataURL(this.musicInput.files[0])
            reader.addEventListener("load", () => {
                // @ts-ignore
                this.player.audio.src = reader.result
            })
        })


        this.backgroundInput.addEventListener("change", () => {
            const reader = new FileReader()
            reader.readAsDataURL(this.backgroundInput.files[0])
            reader.addEventListener("load", () => {
                this.player.background = new Image();
                // @ts-ignore
                this.player.background.src = reader.result
            })
        })
    }
    update() {
        requestAnimationFrame(() => {
            if (this.playing) {
                this.updateEventSequences()
            }
            console.log("updated")
            this.update()
        })
    }
    updateEventSequences() {
        this.eventCurveEditors[0].draw(this.player.beats)
    }
    get playing(): boolean {
        return this.player.playing
    }
    play() {
        if (this.playing) {
            return;
        }
        this.player.play()
        this.update()
    }
}
