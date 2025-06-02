class RPEChartCompiler {
    constructor() {

    }

    dumpChart(chart: Chart): ChartDataRPE {
        const templateLib = chart.templateEasingLib;
        const judgeLineGroups = chart.judgeLineGroups.map(group => group.name);
        const judgeLineList = chart.judgeLines.map(line => this.dumpJudgeLine(line, templateLib));
        const BPMList = chart.timeCalculator.dump();
        const META: MetaData = {
            RPEVersion: 1,
            background: '',
            charter: '',
            composer: '',
            id: crypto.randomUUID(),
            level: chart.level,
            name: chart.name,
            offset: chart.offset,
            song: chart.name
        };
        return {
            BPMList,
            META,
            judgeLineList,
            judgeLineGroup: judgeLineGroups
        };
    }

    dumpJudgeLine(judgeLine: JudgeLine, templateLib: TemplateEasingLib): JudgeLineDataRPE {
        const notes = [];
        for (let lists of [judgeLine.hnLists, judgeLine.nnLists]) {
            for (let name in lists) {
                const list = lists[name];
                let node = list.head.next;
                while (!("tailing" in node)) {
                    notes.push(...node.notes.map(note => this.dumpNoteNode(note)));
                    node = node.next;
                }
            }
        }
        return {
            notes: notes,
            Group: judgeLine.groupId,
            Name: judgeLine.name,
            Texture: judgeLine.texture,
            bpmfactor: 1.0,
            eventLayers: judgeLine.eventLayers.map(layer => ({
                moveXEvents: layer.moveX ? this.dumpEventNodeSequence(layer.moveX) : null,
                moveYEvents: layer.moveY ? this.dumpEventNodeSequence(layer.moveY) : null,
                rotateEvents: layer.rotate ? this.dumpEventNodeSequence(layer.rotate) : null,
                alphaEvents: layer.alpha ? this.dumpEventNodeSequence(layer.alpha) : null,
                speedEvents: layer.speed ? this.dumpEventNodeSequence(layer.speed) : null
            }))
        };
    }

    dumpEventNodeSequence(sequence: EventNodeSequence): EventNodeSequenceDataRPE {
        return {
            nodes: sequence.nodes.map(node => ({
                time: node.time,
                value: node.value,
                easing: templateLib.resolveEasing(node.easing),
                ratio: node.ratio
            })),
            id: sequence.id,
            type: sequence.type
        };
    }

    dumpNoteNode(note: Note): NoteNodeDataRPE {
        return {
            startTime: note.startTime,
            endTime: note.endTime,
            type: NoteType[note.type],
            isFake: note.isFake,
            speed: note.speed
        };
    }
}

