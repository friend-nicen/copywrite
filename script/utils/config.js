import {decode} from "js-base64";
import * as fs from "fs";
import dayjs from "dayjs";

/*if (!process.argv[2]) process.exit();*/

/** @type config */
const config = process.argv[2] ? JSON.parse(decode(process.argv[2])) : {};

/* 时间目录 */
const path = dayjs().format("YYYY-MM-DD-HH-mm-ss");
config.duration = 300;


/* 默认目录 */
if (!config.root) {
    config.root = __dirname;
}

/* 新建 */
config.root = config.root + "文案\\" + path;
export default config;