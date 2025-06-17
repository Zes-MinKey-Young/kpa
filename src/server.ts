class ChartMetadata {
    
    constructor(public name: string,
    public song: string,
    public picture: string,
    public chart: string) {}
    static fromJson(json: any): ChartMetadata {
        return new ChartMetadata(json.Name, json.Song, json.Picture, json.Chart)
    }
    toJson(): string {
        return JSON.stringify({
            Name: this.name,
            Song: this.song,
            Picture: this.picture,
            Chart: this.chart
        })
    }
}


/**
 * 运行时位置是kpa/dist
 */
class ServerApi {
    supportsServer: boolean;
    statusPromise: Promise<boolean>;
    chartId: string;
    constructor() {
        this.statusPromise = fetch("../status")
            .then(res => {
                if (res.status == 204) {
                    this.supportsServer = true;
                    document.title += "Connected"
                    return true
                } else {
                    this.supportsServer = false;
                    return false
                }
            })
        
    }
    async getChart(id: string) {
        this.chartId = id;
        const res0 = await fetch(`../Resources/${id}/metadata.json`)
        if (res0.status === 404) {
            alert("Chart not found")
        }
        const metadata = ChartMetadata.fromJson(await res0.json())
        const chartPath = metadata.chart
        const picturePath = metadata.picture
        const songPath = metadata.song
        const res1 = await fetch(`../Resources/${id}/${chartPath}`)
        const res2 = await fetch(`../Resources/${id}/${picturePath}`)
        const res3 = await fetch(`../Resources/${id}/${songPath}`)
        const chart = await res1.blob();
        editor.readChart(chart)
        const picture = await res2.blob();
        editor.readImage(picture);
        editor.readAudio(await res3.blob());
    }
    async uploadChart(chart: ChartDataKPA, message: string) {
        const id = this.chartId;
        const chartBlob = new Blob([JSON.stringify(chart)], { type: "application/json" })
        const res = await fetch(`../commit/${id}?message=${message}`, {
            method: "POST",
            body: chartBlob,
        });
        Editor.notify((await res.json()).message)
        return res.status === 200;
    }
}