import {getBrowser} from "./common/common.js";
import {setInterceptor} from "./common/interceptor.js";
import page from "./store/page.js";
import * as fs from "fs";

(async () => {

    try {
		
		
		
		// 检测目录是否存在
		if (!fs.existsSync("video")) {
		  // 如果目录不存在，则创建它
		  fs.mkdirSync("video", { recursive: true });
		} 
		
		// 检测目录是否存在
		if (!fs.existsSync("audio")) {
		  // 如果目录不存在，则创建它
		  fs.mkdirSync("audio", { recursive: true });
		} 

		
		// 检测目录是否存在
		if (!fs.existsSync("text")) {
		  // 如果目录不存在，则创建它
		  fs.mkdirSync("text");
		} 

        console.log("开始运行，滑动第一个视频后，软件开始自动执行！");

        const browser = await getBrowser();
        const pages = await browser.pages()
        page.data = pages[0]; //页面


        setInterceptor(pages[0]); //设置拦截器


    } catch (e) {
        console.log(e.message + "错误")
        return false;
    }

})();