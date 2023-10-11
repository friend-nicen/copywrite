/**
 * @date 2023/9/15
 * @author 爱心发电丶
 */

/*
* 当前时间
* */
import dayjs from "dayjs";
import puppeteer from "puppeteer";
import process from 'process';
import axios from "axios";
import https from "https";
import * as fs from "fs";
import page from "../store/page.js";
import * as child_process from "child_process";
import * as path from "path";
import Aoss from "./Aoss.js";
import identify from "./identify.js";

axios.defaults.proxy = false; //取消代理
axios.defaults.timeout = 15000; //超时

/* 取消https认证 */
axios.defaults.httpsAgent = new https.Agent({
    rejectUnauthorized: false
});


/**
 * 写入文件
 * @param file
 * @param data
 * @param options
 */
function file_put_contents(file, data, options) {
    options = options || {};
    const encoding = options.encoding || 'utf8';
    const flag = options.flag || 'w';
    fs.writeFileSync(file, data, {encoding, flag});
    console.log("保存成功！" + file);
}


export function now(format = "HH:mm:ss") {
    return dayjs().format(format);
}

/*
* 打印消息
* */
export function log(content) {
    console.log(now(), "，", content);
}

/*
* 休眠
* */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


/**
 * 初始化浏览器
 */
export async function getBrowser() {

    const websocket = await axios.get("http://127.0.0.1:7899/json/version");

    //直接连接已经存在的 Chrome
    return await puppeteer.connect({
        browserWSEndpoint: websocket.data.webSocketDebuggerUrl
    });
}


/**
 * 提取音频
 * @param file
 */
export function extractAudio(file) {
    return new Promise(resolve => {

        console.log("开始提取音频文件...");
        let basename = path.basename(file, '.mp4'); //文件名

        const src = path.win32.normalize(file);
        const name = path.win32.normalize(`audio/${basename}.wav`);

        let cmd = String.raw`lib\ffmpeg.exe -i "${src}" -vn -acodec pcm_s16le -ar 8000 "${name}"`

        /* 执行命令 */
        child_process.execSync(cmd, {stdio: 'ignore'});
        resolve(name); //返回

    })
}


/**
 * 下载指定url的视频文件
 * @param url
 * @param title
 */
export async function download(url, title) {

    console.log("开始下载：" + url);

    const path = process.cwd() + '/video/';

    await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
    })
        .then(async response => {

            console.log(`正在保存...，${path}${title}.mp4`);

            const videoData = Buffer.from(response.data, 'binary');
            file_put_contents(`${path}${title}.mp4`, videoData);

            const name = await extractAudio(`${path}${title}.mp4`); //提取音频

            const url = await Aoss.put(name);

            /* 如果oss上传成功 */
            if (url) {

                const text = await identify(url);

                if (text) {
                    file_put_contents(process.cwd() + '/text/' + title + ".txt", text);
                }

                /* 重新删除 */
                await Aoss.del(name);

            }


            // 模拟 enter 键的按下事件
            await page.data.keyboard.press('ArrowDown');


        })
        .catch(error => {
            console.log(error.message)
        });
}


/**
 * 节流函数
 * @param func
 * @param wait
 * @returns {(function(): void)|*}
 */
export function throttle(func, wait) {
    let timer = null;
    return function () {
        const context = this;
        const args = arguments;
        if (!timer) {
            timer = setTimeout(function () {
                func.apply(context, args);
                timer = null;
            }, wait);
        }
    };
}

