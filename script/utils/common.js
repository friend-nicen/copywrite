/*
* @author 友人a丶
* @date 
* 公共库
* */

import dayjs from "dayjs";
import https from "https";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";
import config from "./config.js";


axios.defaults.proxy = false; //取消代理
axios.defaults.timeout = 3600000; //超时

/* 取消https认证 */
axios.defaults.httpsAgent = new https.Agent({
    rejectUnauthorized: false
});


/* 自定义 axios 错误处理 */
axios.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response && error.response.status === 302) {
        return Promise.resolve(error.response);
    }
    return Promise.reject(error);
});


export function now(format = "YYYY/MM/DD HH:mm:ss") {
    return dayjs().format(format);
}

/*
* 打印消息
* */
export function print(content, stack = null) {
    if (typeof content === 'object') {
        content = JSON.stringify(content);
    }
    console.log(now(), "，", content);
    if (stack) console.log(stack);
}

/*
* 休眠
* */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


/**
 * 异步检查文件是否存在
 * @param {string} filePath - 要检查的文件路径
 * @returns boolean
 */
export function fileExists(filePath) {
    try {
        fs.accessSync(filePath);
        return true; // 文件存在
    } catch (error) {
        return false; // 文件不存在
    }
}


/**
 * 获取视频的原链接
 */
export function getOrigin(url, cookie) {
    return new Promise(resolve => {
        axios.options(url, {
            maxRedirects: 0,
            headers: {
                "Cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
            }
        }).then(response => {
            resolve(response.headers.get('location'))
        }).catch(e => {
            print(e.message);
            resolve();
        })

    });
}

/**
 * 写入文件
 * @param file
 * @param data
 * @param options
 */
export function file_put_contents(file, data, options) {

    options = options || {};
    const encoding = options.encoding || 'utf8';
    const flag = options.flag || 'w';

    /* 解析目录 */
    const pathinfo = path.parse(file);

    /* 检测目录是否存在 */
    if (!fs.existsSync(pathinfo.dir)) {
        fs.mkdirSync(pathinfo.dir, {recursive: true});
    }

    fs.writeFileSync(file, data, {encoding, flag});
}


/**
 * 下载指定url的视频文件
 * @param param
 */
export async function download(param = {}) {

    return new Promise(async resolve => {

        /* 循环下载 */
        for (let i = 3; i > 0; i--) {
            /* 下载 */
            const res = await axios({
                url: param.url,
                method: 'GET',
                headers: {
                    "Cookie": param.cookie,
                    "Referer": param.referer,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
                },
                responseType: 'arraybuffer'
            }).then(async response => {
                const blob = Buffer.from(response.data, 'binary');
                file_put_contents(param.file, blob);
                resolve(true);
                return true;
            }).catch(error => {
                print(error.message);
                return false;
            });

            /* 成功直接中断 */
            if (res) break;

            /* 暂停 */
            await sleep(1000);
        }

        /* 失败 */
        resolve(false);
    })
}


/**
 * 提取音频
 * @param file
 */
export function extractAudio(file) {

    return new Promise(resolve => {

        print("正在处理音频流...");

        const src = path.win32.normalize(file + ".mp4");
        const name = path.win32.normalize(file + ".wav");
        const ffmpeg = path.win32.normalize(config.ffmpeg);

        /* 执行命令 */
        const cmd = String.raw`${ffmpeg} -i "${src}" -vn -acodec pcm_s16le -ar 8000 "${name}"`;

        /* 执行命令 */
        try {
            child_process.execSync(cmd, {stdio: 'ignore'});
            resolve(true);
        } catch (e) {
            print(e.message);
            resolve(false);
        }


    })
}


/**
 * 规范化文件名
 * @param input
 * @returns {*|string}
 */
export function sanitizeFileName(input) {
    // Windows文件名不支持的特殊字符
    const invalidChars = /[<>:"\/\\|?*]/g;
    // 移除特殊字符
    let sanitized = input.replace(invalidChars, '');
    // 限制文件名长度不超过255个字符
    sanitized = sanitized.substring(0, 180);
    return sanitized;
}


/**
 * 随机数
 * @param min
 * @param max
 * @return {number}
 * @constructor
 */
export function RandomInt(min, max) {
    min = Math.ceil(min); // 确保最小值是整数
    max = Math.floor(max); // 确保最大值是整数
    return Math.floor(Math.random() * (max - min + 1)) + min; // 加1是为了包含最大值
}