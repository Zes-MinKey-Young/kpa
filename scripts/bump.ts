import { isccDirectory, outPutDir } from "./constants"

const versionFile = Bun.file("../VERSION");
const versionTsFile = Bun.file("../src/version.ts");
const innoSetupFile = Bun.file("../install.iss");
const version = await versionFile.text();
console.log(`当前版本：${version}`);

async function runProgramAndPrintToConsole(cmd: string[], cwd?: string) {
    console.log(`运行：${cmd.join(" ")}`);
    const proc = Bun.spawn(cmd, {cwd});
    for await (const chunk of proc.stdout) {
        console.log(chunk.toString());
    }
}

const nextVersion: string | null = prompt("输入新版本号");
if (!nextVersion) {
    console.log("你咋不输入啊？");
    process.exit(1);
}

console.log("编译一下server/index.ts");
await runProgramAndPrintToConsole(["bun", "build", "server/index.ts", "--compile"]);


const versionTsFileText = await versionTsFile.text();
const versionInTs = /^\s*const VERSION = "([\.\d]+)";\s+$/.exec(versionTsFileText)

if (!versionInTs || versionInTs[1] !== version) {
    console.log("version.ts里不是这个呀，我帮你改一下？");

    const target = `const VERSION = "${version}";\n`
    
    await Bun.write(versionTsFile, target);
    console.log(`已将${versionTsFileText}修改为${target}。`)
} else {
    console.log("嗯，version.ts里是这个。");
    console.log(`版本号是${version}。`);
    console.log(`\x1b[32m${versionTsFileText}\x1b[0m`);
}

const innoSetupFileText = await innoSetupFile.text()
const matchResult = innoSetupFileText.match(/AppVersion=([0-9\.]+])/);
const versionInIss = matchResult ? matchResult[1] : null;
if (versionInIss !== version) {
    console.log("InnoSetup里不是这个呀，我帮你改一下？");
    const lines = innoSetupFileText.split("\n");
    lines.map((line) => {
        if (line.startsWith("AppVersion=")) {
            line = `AppVersion=${version}`;
        } else if (line.startsWith("OutputBaseFilename=")) {
            line = `OutputBaseFilename=KPA_Setup_v${version}`;
        }
    });
    const edited =  lines.join("\n")
    await Bun.write(innoSetupFile, edited);
    console.log("改好了，内容如下：");
    console.log(edited);
} else {
    console.log("嗯，是对的");
    console.log(`\x1b[32m${innoSetupFileText}\x1b[0m`)
}

console.log("现在可以运行.iss文件了");
await runProgramAndPrintToConsole(["ISCC", "/O", outPutDir], isccDirectory);
console.log("编译完成，结果在：", outPutDir);

console.log("现在可以提交了");
await runProgramAndPrintToConsole(["git", "add", "."]);
await runProgramAndPrintToConsole(["git", "commit", "-m", `chore: bump to ${version}`]);

