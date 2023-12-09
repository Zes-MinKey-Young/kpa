
class TimeCalculator {
    bpmList: BPMSegmentData[];
    segmentSeconds: Float64Array;
    segmentBeats: Float64Array;
    segmentSPB: Float64Array;
    constructor() {
    }

    update() {
        /**
         * bpmList项数=SPB数量=片段拍数、秒数-1
         * 最后一个片段是没有时长的
         */
        let bpmList = this.bpmList;
        let length = bpmList.length;
        let segmentSeconds: Float64Array, segmentBeats: Float64Array, segmentSPB: Float64Array;

        this.segmentSeconds = segmentSeconds = new Float64Array(length - 1);
        this.segmentBeats = segmentBeats = new Float64Array(length - 1)
        this.segmentSPB = segmentSPB = new Float64Array(length)
        let index = 0;
        let next = bpmList[0];
        let nextBeats = TimeCalculator.toBeats(next.startTime);
        for (; index < length - 1; index++) {
            let each = next;
            next = bpmList[index + 1]
            let spb = 60 / each.bpm;
            let startTime = each.startTime;
            let startBeats = TimeCalculator.toBeats(startTime);
            let duration = nextBeats - startBeats;
            nextBeats = startBeats;
            segmentSPB[index] = spb;
            segmentBeats[index] = duration;
            segmentSeconds[index] = duration * spb;
        }
        segmentSPB[index] = 60 / next.bpm; // 最后一个SPB在上面不会存
    }
    toSeconds(beats: number) {
        let {segmentSeconds, segmentBeats, segmentSPB} = this;
        let seconds = 0;
        let currentBeats = segmentBeats[0];
        if (segmentBeats.length === 0) {
            return beats * segmentSPB[0]
        }
        let index = 0;
        for (; currentBeats < beats; index++) {
            seconds += segmentSeconds[index];
            currentBeats += segmentBeats[index + 1]
        }
        return seconds + (beats - segmentBeats[index]) * segmentSPB[index]
    }
    segmentToSeconds(beats1: number, beats2: number): number {
        let ret = this.toSeconds(beats2) - this.toSeconds(beats1)
        if (ret < 0) {
            console.warn("segmentToSeconds的第二个参数需大于第一个！", "得到的参数：", arguments)
        }
        return ret
    }
    secondsToBeats(seconds: number) {
        let {segmentSeconds, segmentBeats, segmentSPB} = this;
        let beats = 0;
        let currentSeconds = segmentSeconds[0];
        if (segmentSeconds.length === 0) {
            return seconds / segmentSPB[0]
        }
        let index = 0;
        for (; currentSeconds < seconds; index++) {
            beats += segmentBeats[index];
            currentSeconds += segmentSeconds[index + 1]
        }
        return beats + (seconds - segmentSeconds[index]) / segmentSPB[index]
    }
    static toBeats(beaT: TimeT): number {
        return beaT[0] + beaT[1] / beaT[2]
    }
    static getDelta(beaT1: TimeT, beaT2: TimeT): number {
        return this.toBeats(beaT1) - this.toBeats(beaT2)
    }
    static eq(beaT1: TimeT, beaT2: TimeT): boolean {
        return beaT1[0] === beaT2 [0] && beaT1[1] * beaT2[2] === beaT2[1] * beaT2[2]
    }
    static gt(beaT1:TimeT, beaT2: TimeT): boolean {
        return beaT1[0] >beaT2[0] || beaT1[1] * beaT2[2] > beaT1[2] * beaT2[1]
    }
    static lt(beaT1:TimeT, beaT2: TimeT): boolean {
        return beaT1[0] <beaT2[0] || beaT1[1] * beaT2[2] < beaT1[2] * beaT2[1]
    }
    static ne(beaT1:TimeT, beaT2: TimeT): boolean {
        return beaT1[0] !== beaT2[0] || beaT1[1] * beaT2[2] !== beaT1[2] * beaT2[1]
    }
}