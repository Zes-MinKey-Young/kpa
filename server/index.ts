/// <reference path="../src/chartTypes.d.ts" />
// 为此我问了通义灵码半天，不失所望

import type { BunRequest } from 'bun';
import { resolve, relative } from 'path';
import { parseBlob } from 'music-metadata'


function isSubPath(targetPath: string, parentPath: string): boolean {
    const relativePath = relative(parentPath, targetPath);
    return relativePath.length > 0 && !relativePath.startsWith('..') && !isAbsolute(relativePath);
}

// 检查路径是否是绝对路径
function isAbsolute(p: string): boolean {
    return resolve(p) === p;
}

const defaultValues= {
    [EventType.moveX]: 0,
    [EventType.moveY]: 0,
    [EventType.alpha]: 0,
    [EventType.rotate]: 0,
    [EventType.speed]: 10
}

async function createChart(music: File, title: string, baseBPM: number): Promise<ChartDataKPA> {
    const metadata = await parseBlob(music);
    const duration = metadata.format.duration;

    const eventNodeSequenceData: EventNodeSequenceDataKPA[] = [];
    const orphanLines: JudgeLineDataKPA[] = [];
    const bpmList: BPMSegmentData[] = [
        {
            bpm: baseBPM,
            startTime: [0, 0, 0]
        }
    ];
    const judgeLineGroups: string[] = ["Default"];
    const addSequence = (id: string, type: Exclude<EventType, EventType.bpm | EventType.easing>) => {
        const data: EventNodeSequenceDataKPA = {
            id,
            type,
            events: [
                {
                    startTime: [0, 0, 1],
                    endTime: [1, 0, 1],
                    bezier: 0,
                    easingLeft: 0.,
                    easingRight: 1.,
                    start: defaultValues[type],
                    end: defaultValues[type],

                }
            ]
        }
        eventNodeSequenceData.push(data);
        return id;
    }
    const addJudgeLine = (i: number) => {
        const eventLayer: EventLayerDataKPA = {
            moveX: addSequence(`#${i}.0.moveX`, EventType.moveX),
            moveY: addSequence(`#${i}.0.moveY`, EventType.moveY),
            rotate: addSequence(`#${i}.0.rotate`, EventType.rotate),
            alpha: addSequence(`#${i}.0.alpha`, EventType.alpha),
            speed: addSequence(`#${i}.0.speed`, EventType.speed)
        }
        const data: JudgeLineDataKPA = {
            id: i,
            group: 0,
            hnLists: {},
            nnLists: {},
            Name: "unknown",
            Texture: "line.png",
            eventLayers: [eventLayer],
            children: []
        }
        orphanLines.push(data);
    }
    for (let i = 0; i < 24; i++) {
        addJudgeLine(i);
    }
    return {
        
        offset: 0,
        duration: duration,
        info: {
            level: "0",
            name: title
        },
        envEasings: [], // New!
        eventNodeSequences: eventNodeSequenceData,
        orphanLines,
        bpmList,
        judgeLineGroups
    }
}


Bun.serve({
    port: 2460,
    routes: {
        "/": Response.redirect("/html"),
        "/html": new Response(Bun.file("./index.html")),
        "/create": async (req: BunRequest) => {
            const formData = await req.formData();
            const music = formData.get("music");
            const illustration = formData.get("illustration");
            const id = formData.get("id");
            const title = formData.get("title");
            const baseBPM = formData.get("baseBPM");
            if (!music || !illustration || !id || !title || !baseBPM
                || typeof music === "string"
                || typeof illustration === "string"
                || typeof id !== "string"
                || typeof title !== "string"
                || typeof baseBPM !== "string"
            ) {
                return new Response("Invalid form data", { status: 400 });
            }
            const chart = await createChart(music, title, parseFloat(baseBPM));
            const chartJson = JSON.stringify(chart);
            Bun.write(`./${id}.json`, chartJson);
            Bun.write(`./${id}.${illustration.name.split(".").at(-1)}`, illustration);
            Bun.write(`./${id}.${music.name.split(".").at(-1)}`, music);
            console.log(`Created chart ${id}`);
            return Response.json(chart);
        },
        "*": async (req) => {
            const url = new URL(req.url);
            const filename = decodeURIComponent(url.pathname.slice(1));
            if (!isSubPath(filename, resolve("./"))) return new Response("403", { status: 403 });
            const file = Bun.file(resolve("./", filename));
            if (await file.exists()) {
                return new Response(file);
            }

            return new Response("404", { status: 404 });
        }
    }
})
