/// <reference path="../dist/chartTypes.d.ts" />
// 为此我问了通义灵码半天，不失所望

import { type BunRequest } from 'bun';
import { resolve, relative } from 'path';
import { parseBlob } from 'music-metadata';
import { mkdir, exists, readdir } from 'fs/promises';
import { parse, type ParseError } from 'jsonc-parser';
import { EventType, NoteType} from '../dist/chartTypes.d.ts'


function isSubPath(targetPath: string, parentPath: string): boolean {
    const relativePath = relative(parentPath, targetPath);
    return relativePath.length > 0 && !relativePath.startsWith('..') && !isAbsolute(relativePath);
}

// 检查路径是否是绝对路径
function isAbsolute(p: string): boolean {
    return resolve(p) === p;
}

const defaultValues = {
    [EventType.moveX]: 0,
    [EventType.moveY]: 0,
    [EventType.rotate]: 0,
    [EventType.alpha]: 0,
    [EventType.speed]: 10
} as const;

async function createChart(music: File, title: string, baseBPM: number): Promise<ChartDataKPA> {
    const metadata = await parseBlob(music);
    const duration = metadata.format.duration;
    if (!duration) {
        throw new Error("No duration found");
    }

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
            Name: "untitled",
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

const config = Bun.file("config.jsonc")

interface Config {
    pathquery: string[];
    create: string[][];
    commit: string[][];
    autosave: string[][];
    versionControlEnabled: boolean;
}

const errors: ParseError[] = [];
const configData: Config = parse(await config.text(), errors);
if (errors.length) {
    throw new Error(errors.map(e => e.error).join("\n"));
}
const pathqueryCmd = configData.pathquery;
const createCmds = configData.create;
const commitCmds = configData.commit;
const autosaveCmds = configData.autosave;
const versionControlEnabled = configData.versionControlEnabled || false;

const generateCommand = (cmdTemplate: string[], time: Date, message: string) => {
    return cmdTemplate.map(
        (token) => token
            .replaceAll("$time", time.toISOString())
            .replaceAll("$message", message)
    )
}

const requiresMessage = (cmd: string[]) => cmd.some((token) => token.includes("$message"));
const commandsRequiresMessage = (cmds: string[][]) => cmds.some((cmd) => requiresMessage(cmd));

function checkRepo(cwd: string) {
    const proc = Bun.spawnSync(pathqueryCmd, {cwd});
    const out = proc.stdout.toString();
    if (proc.exitCode === 0 && (out === "" || out === ".")) {
        return true;
    } else if (proc.exitCode === 0) {
        console.log("There is a parent repo. Will create a sub repo.")
    }
    return false;
}

async function isChart(dir: string) {
    return await exists(`../Resources/${dir}/metadata.json`);
}

function checkOrCreateRepo(cwd: string) {
    if (!checkRepo(cwd)) {
        createCmds.forEach(cmd => Bun.spawnSync(generateCommand(cmd, new Date(), "Init"), {cwd}))
    }
}
Bun.serve({
    port: 2460,
    routes: {
        "/": Response.redirect("/html/chartIndex.html"),
        "/status": () => {
            return new Response("", { status: 204 })
        },
        "/html": async () => {
            return new Response(Bun.file("../html/index.html"), { status: 200 });
        },
        "/create": {
            GET: async () => {
                return Response.redirect("../html/create.html");
            },
            POST: async (req: BunRequest) => {
                const formData = await req.formData();
                const title = formData.get("title");
                const music = formData.get("music");
                const illustration = formData.get("illustration");
                const id = formData.get("id");
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
                await Bun.write(`../Resources/${id}/chart.json`, chartJson);
                await Bun.write(`../Resources/${id}/${illuPath}`, illustration);
                await Bun.write(`../Resources/${id}/${musicPath}`, music);

                await Bun.write(`../Resources/${id}/metadata.json`, JSON.stringify({
                    Chart: "chart.json",
                    Picture: illuPath,
                    Song: musicPath,
                    Title: title
                }))
                if (versionControlEnabled) {
                    createCmds.forEach(cmd => Bun.spawnSync(generateCommand(cmd, new Date(), "Create " + id), {
                        cwd: `../Resources/${id}`
                    }))
                }

                console.log(`Created chart ${id}`);
                return Response.redirect(`/Resources/${id}`);
            }
        },
        "/import": {
            GET: async (req: BunRequest) => {
                return Response.redirect("/html/import.html");
            },
            POST: async (req: BunRequest) => {
                const formData = await req.formData();
                const music = formData.get("music");
                const illustration = formData.get("illustration");
                const id = formData.get("id");
                const chart = formData.get("chart");
                if (!id || !music || !illustration || !chart
                    || typeof music === "string"
                    || typeof illustration === "string"
                    || typeof id !== "string"
                    || typeof chart == "string"
                ) {
                    return new Response("Invalid form data", { status: 400 });
                }
                
                if (!await exists("../Resources")) {
                    await mkdir("../Resources");
                }
                if (await exists(`../Resources/${id}`)) {
                    return new Response("ID already exists", { status: 409 });
                }
                await mkdir(`../Resources/${id}`);
                const illuPath = "illustration." + illustration.name.split(".").at(-1);
                const musicPath = "music." + music.name.split(".").at(-1);
                await Bun.write(`../Resources/${id}/chart.json`, chart);
                await Bun.write(`../Resources/${id}/${illuPath}`, illustration);
                await Bun.write(`../Resources/${id}/${musicPath}`, music);
                await Bun.write(`../Resources/${id}/metadata.json`, JSON.stringify({
                    Chart: "chart.json",
                    Picture: illuPath,
                    Song: musicPath
                }))
                if (versionControlEnabled) {
                    createCmds.forEach(cmd => Bun.spawnSync(generateCommand(cmd, new Date(), "Imported " + id), {
                        cwd: `../Resources/${id}`
                    }))
                }

                console.log(`Imported chart ${id}`);
                return Response.redirect(`/Resources/${id}`);
            }
        },
        "/Resources": async (req: BunRequest) => {
            const entries = await readdir("../Resources", {withFileTypes: true});
            const subDirs = entries
                .filter(entry => entry.isDirectory())
                .map(entry => entry.name)
            const charts = [];
            for (const subDir of subDirs) {
                if (await isChart(subDir)) {
                    charts.push(subDir);
                }
            }
            return Response.json({
                charts
            });
        },
        "/Resources/:id": async (req: BunRequest) => {
            return new Response(Bun.file("../html/index.html"))
        },
        "/autosave/:id": async (req: BunRequest) => {
            if (req.method !== "POST") {
                return new Response("Method not allowed", { status: 405 });
            }
            const id = req.params.id;
            const blob: Blob = await req.blob();
            const cwd = `../Resources/${id}`;
            if (versionControlEnabled) {
                checkOrCreateRepo(cwd);
                Bun.write(`../Resources/${id}/chart.json`, blob)
                autosaveCmds.forEach(cmd => Bun.spawnSync(generateCommand(cmd, new Date(), "Autosave"), {
                    cwd: `../Resources/${id}`
                }))
            } else {
                Bun.write(`../Resources/${id}/AutoSave ${new Date().toISOString}.json`, blob)
            }
                

            return new Response("OK");
        },
        "/commit/:id":  async (req: BunRequest) => {
            if (req.method !== "POST") {
                return new Response("Method not allowed", { status: 405 });
            }
            const id = req.params.id;
            const url = new URL(req.url);
            const message = url.searchParams.get("message");
            const blob: Blob = await req.blob();
            Bun.write(`../Resources/${id}/chart.json`, blob)
            const cwd = `../Resources/${id}`;
            if (versionControlEnabled) {
                if (commandsRequiresMessage(commitCmds) && !message) {
                    return Response.json({message: "Message is required."}, { status: 400 });
                }
                checkOrCreateRepo(cwd);
                for (const cmd of commitCmds) {
                    const proc = Bun.spawnSync(generateCommand(cmd, new Date(), message as string), {cwd});
                    console.log(proc.pid, proc.stdout.toString())
                    if (proc.exitCode !== 0) {
                        return Response.json({message: "Error while committing.\n" + proc.stdout.toString()}, { status: 500 });
                    }
                }
                return Response.json({message: "Commit successful."});
            } else {
                return Response.json({message: "Upload successful (version control disabled)."});
            }

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
console.log("Server started, port: 2460. Press Ctrl+C to exit.")
