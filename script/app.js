/*
* @author 友人a丶
* @date 
* 百度下拉词
* */

import {
    download,
    extractAudio,
    file_put_contents,
    fileExists,
    getOrigin,
    print,
    sanitizeFileName,
    sleep
} from "./utils/common.js";
import {getBrowserConnect} from "./utils/browser.js";
import config from "./utils/config.js";
import * as fs from "fs";
import getText from "./utils/my.js";


/* 程序运行开始 */
(async function () {

    try {

        /* 日志 */
        print("开始检测...");

        /* 浏览器 */
        const browser = await getBrowserConnect();

        /* 获取page */
        const pages = (await browser.pages());
        let page = null; //当前页面

        for (let i of pages) {
            const name = await i.title();
            if (name.indexOf("抖音") > -1) {
                page = i;
            }
        }


        /* 控制的游标 */
        const cursor = {total: 0, current: "", error: 0,}

        /* 无限循环 */
        while (true) {

            /* 是否弹出了登录窗口 */
            const close = await page.$(".douyin-login__close");
            if (close) await close.click(); //关闭登录窗口

            /* 加载新的视频 */
            if (cursor.error > 10) {
                print("10s内未检测到新的视频资源，任务已经停止！");
                process.exit();
            }

            /* 有报错，跳过 */
            if (cursor.total > 0) {
                if (config.autoNext) {
                    print("正在切换视频.....");
                    await page.keyboard.press('ArrowDown');
                } else {
                    break;
                }
            }

            /* 计数 */
            cursor.total++;


            /* 开始 */
            await sleep(1000);

            /* 获取视频信息 */
            const playing = await page.evaluate(function () {

                /* 获取x-player */
                const elems = document.querySelectorAll('video');

                /* 播放器存在 */
                if (elems) {

                    try {

                        const video = Object.values(elems)
                            .find((video) => {
                                return !video.paused;
                            });


                        if (!video) {
                            throw new Error("未检测到正在播放的视频.....");
                        }


                        let props = null;//属性值
                        let parent = video.parentNode;

                        /* 获取信息 */
                        while (parent) {

                            props = Object.keys(parent).find((key) => {
                                return key.indexOf('__reactProps') > -1
                            });

                            if (props) {
                                break;
                            }

                            parent = parent.parentNode;
                        }


                        if (!props) {
                            throw new Error("未检测到视频数据.....");
                        }


                        const player = (Array.isArray(parent[props].children) ? parent[props].children[0] : parent[props].children).props.value.player;

                        if (!player) return;

                        /* 音频 */
                        let audio = "";

                        /* 视频信息配置 */
                        const config = player.config;

                        /* 没有信息 */
                        if (!config.awemeInfo) {
                            throw new Error("视频信息读取失败.....");
                        }


                        if (config.awemeInfo.music && config.awemeInfo.music.playUrl) {
                            audio = config.awemeInfo.music.playUrl.uri;
                        }


                        /* 没有信息 */
                        if (!config.awemeInfo.shareInfo) {
                            throw new Error("视频信息读取失败.....");
                        }


                        return {
                            code: 1,
                            uid: config.awemeInfo.awemeId,
                            link: player.videoList ? player.videoList.reverse().find(item => {
                                return item.videoFormat === "mp4"
                            }).playApi : "",
                            audio: audio,
                            desc: config.awemeInfo.desc,
                            index: config.awemeInfo.shareInfo.shareUrl,
                            cover: config.awemeInfo.video.cover,
                            tags: config.awemeInfo.videoTag ? config.awemeInfo.videoTag.map(tag => {
                                return tag.tagName;
                            }) : [],
                            duration: config.duration,
                            author: {
                                nickname: config.awemeInfo.authorInfo.nickname,
                                avatar: config.awemeInfo.authorInfo.avatarUri,
                                createTime: config.awemeInfo.createTime
                            }
                        };
                    } catch (e) {
                        return {
                            code: 0,
                            msg: e.message
                        }
                    }
                } else {
                    return {
                        code: 0,
                        msg: "未检测到视频"
                    }
                }
            });


            /* 没有找到视频信息 */
            if (!playing.code) {
                print(`视频提取失败：${playing.msg}，正在重试.....`);
                cursor.error++;
                continue;
            }

            /* 如果相同，视频没有发生变化 */
            if (cursor.current === playing.uid) {
                cursor.error++;
                continue;
            }

            /* 记录UID */
            cursor.current = playing.uid;

            /* 打印日志 */
            print(`正在识别第${cursor.total}个视频：${playing.desc}...`)

            /* 时长判断 */
            if (playing.duration > config.duration) {
                print(`视频时长超出${config.duration}s限制，自动跳过....`);
                cursor.error++;
                continue;
            }


            /* 获取页面cookie */
            const Cookie = (await page.cookies()).map(cookie => {
                return `${cookie.name}=${cookie.value}`;
            }).join('; ');


            /* 获取301之后的链接 */
            if (playing.link) {

                for (let i = 0; i < 5; i++) {

                    /* 获取原始链接 */
                    const location = await getOrigin((playing.link.indexOf('http') > -1 ? "" : "https:") + playing.link, Cookie);

                    if (location) {
                        playing.link = location;
                        break;
                    } else {
                        await sleep(2000);
                    }
                }
            }


            /* 临时文件 */
            const desc = sanitizeFileName(playing.desc) ? sanitizeFileName(playing.desc) : cursor.total;
            const root = config.root + "/" + desc;
            const file = root + "/" + desc;


            /* 如果没有音频，或者要保存视频 */
            if ((config.save.text && !playing.audio) || config.save.video) {

                print("正在处理视频流.....");

                /* 链接是否存在 */
                if (!playing.link) {
                    print("视频流处理失败，正在重试.....");
                    cursor.error++;
                    continue;
                }

                if (await download({
                    url: playing.link,
                    file: file + ".mp4",
                    cookie: Cookie,
                    referer: "https://www.douyin.com/"
                })) {


                    if (!(await extractAudio(file))) {
                        print("音频流提取失败，正在重试.....");
                        cursor.error++;
                        continue;
                    }

                } else {
                    print("视频流下载失败，正在重试.....");
                    cursor.error++;
                    continue;
                }
            } else {

                print("正在处理音频流.....");

                const res = await download({
                    url: playing.audio,
                    file: file + ".wav",
                    cookie: Cookie,
                    referer: "https://www.douyin.com/"
                });

                if (!res) {
                    print("音频流处理失败，正在重试.....");
                    cursor.error++;
                    continue;
                }
            }


            /* 处理文案 */
            if (config.save.text) {

                print("正在识别文案.....");

                /* 上传oss */
                const text = await getText(file + ".wav");

                /* 删除视频文件 */
                if (!config.save.video) {
                    if (fileExists(file + `.mp4`)) fs.unlinkSync(file + `.mp4`);
                    if (fileExists(file + `.wav`)) fs.unlinkSync(file + ".wav");
                }

                /* oss上传失败 */
                if (!text) {
                    print("文案识别失败，正在重试.....");
                    cursor.error++;
                    continue;
                }


                playing.text = text;
            }


            /* 保存 */
            file_put_contents(String.raw`${root}/${desc}.txt`, JSON.stringify(playing, null, 2));


            /* 标记 */
            cursor.error = 0;
        }

        print("运行完毕！");

    } catch (e) {
        print(e.stack);
        print("程序异常退出！");
        process.exit();
    }

})();