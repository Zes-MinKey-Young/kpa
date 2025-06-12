/// <reference path="../dist/chartTypes.d.ts" />
// 为此我问了通义灵码半天，不失所望

import { sleepSync, type BunRequest } from 'bun';
import { resolve, relative } from 'path';
import { parseBlob } from 'music-metadata';
import { mkdir, exists } from 'fs/promises';
import { EventType, NoteType} from '../dist/chartTypes.d.ts'


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
    [EventType.rotate]: 0,
    [EventType.alpha]: 0,
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
            startTime: [0, 0, 1] // 答案是0 0 0，因为鱼没有脑子
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
            moveX: addSequence(`#${i}.0.moveX`, 0),
            moveY: addSequence(`#${i}.0.moveY`, 1),
            rotate: addSequence(`#${i}.0.rotate`, 2),
            alpha: addSequence(`#${i}.0.alpha`, 3),
            speed: addSequence(`#${i}.0.speed`, 4)
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
        "/status": () => {
            return new Response("", { status: 204 })
        },
        "/html": async () => {
            return new Response(Bun.file("../html/index.html"), { status: 200 });
        },
        "/create": async (req: BunRequest) => {
            const formData = await req.formData();
            const music = formData.get("music");
            const illustration = formData.get("illustration");
            const id = formData.get("id");
            const title = formData.get("title");
            const baseBPM = formData.get("bpm");
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
            if (!await exists("../Resources")) {
                await mkdir("../Resources");
            }
            if (!await exists(`../Resources/${id}`)) {
                await mkdir(`../Resources/${id}`);
            }
            const illuPath = "illustration." + illustration.name.split(".").at(-1);
            const musicPath = "music." + music.name.split(".").at(-1);
            Bun.write(`../Resources/${id}/chart.json`, chartJson);
            Bun.write(`../Resources/${id}/${illuPath}`, illustration);
            Bun.write(`../Resources/${id}/${musicPath}`, music);

            Bun.write(`../Resources/${id}/metadata.json`, JSON.stringify({
                Chart: "chart.json",
                Picture: illuPath,
                Song: musicPath
            }))
            console.log(`Created chart ${id}`);
            return Response.json(chart);
        },
        "/Resources/:id": async (req) => {
            const id = req.params.id;
            return new Response(Bun.file("../html/index.html"))
        },
        "/*": {
            GET: async (req) => {
                const url = new URL(req.url);
                const filename = decodeURIComponent(url.pathname.slice(1));
                if (!isSubPath(filename, resolve("../"))) return new Response("403", { status: 403 });
                const file = Bun.file(resolve("../", filename));
                if (await file.exists()) {
                    return new Response(file);
                }

                return new Response("404", { status: 404 });
            },
            PUT: async (req: BunRequest) => {
                const url = new URL(req.url);
                const filename = decodeURIComponent(url.pathname.slice(1));
                if (!isSubPath(filename, resolve("../Resources/"))) return new Response("403", { status: 403 });
                await Bun.write(resolve("../Resources/", filename), req.body);
                return new Response("OK", { status: 200 });
            }
    }
    }
})
