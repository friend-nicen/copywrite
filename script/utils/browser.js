/*
* @author 友人a丶
* @date 
* 浏览器操作
* */


import puppeteer from "puppeteer";
import runtime from "./runtime.js";
import {print} from './common.js'
import config from "./config.js";
import axios from "axios";


/**
 * 初始化浏览器
 */
export async function getBrowserConnect() {

    const websocket = await axios.get(`http://127.0.0.1:${config.port}/json/version`);

    //直接连接已经存在的 Chrome
    const browser = await puppeteer.connect({
        browserWSEndpoint: websocket.data.webSocketDebuggerUrl,
        defaultViewport: null
    });

    /* 赋值 */
    runtime.browser = browser;
    return browser;
}