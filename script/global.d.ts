/**
 * 系统运行的配置
 */
interface config {
    port: string,
    ffmpeg: string,
    appData: string,
    mode: string,
    root: string,
    autoNext: number,
    duration: number,
    save: {
        video: number,
        text: number
    },
    token: string
}


export {}
