

// @ts-ignore
const player = globalThis.player = new Player(document.getElementById("player"))
// @ts-ignore
const fileInput: HTMLInputElement = document.getElementById("fileInput")
// @ts-ignore
const musicInput: HTMLInputElement = document.getElementById("musicInput")
// @ts-ignore
const backgroundInput: HTMLInputElement = document.getElementById("backgroundInput")


document.getElementById("playButton").addEventListener("click", () => {
    player.play()
})

fileInput.addEventListener("change", () => {
    const reader = new FileReader()
    reader.readAsText(fileInput.files[0])
    reader.addEventListener("load", () => {
        // @ts-ignore
        let data = JSON.parse(reader.result)
        let chart = Chart.fromRPEJSON(data);
        player.chart = chart;
        /**
        player.background = new Image();
        player.background.src = "../cmdysjtest.jpg";
        player.audio.src = "../cmdysjtest.mp3"; */
    })
})

musicInput.addEventListener("change", () => {
    const reader = new FileReader()
    reader.readAsDataURL(musicInput.files[0])
    reader.addEventListener("load", () => {
        // @ts-ignore
        player.audio.src = reader.result
    })
})


backgroundInput.addEventListener("change", () => {
    const reader = new FileReader()
    reader.readAsDataURL(backgroundInput.files[0])
    reader.addEventListener("load", () => {
        player.background = new Image();
        // @ts-ignore
        player.background.src = reader.result
    })
})
