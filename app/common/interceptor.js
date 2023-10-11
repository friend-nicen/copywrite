import {download} from "./common.js";
import md5 from "crypto-js/md5.js";
import Mq from "./Mq.js";


const load = []; //加载过的视频md5

export function setInterceptor(page) {

    /**
     * 响应拦截器
     */
    const onRes = async response => {
        if (response.ok()) {

            const url = response.url();


            /* 保存所有视频 */
            if (url.indexOf("douyinvod.com") > -1) {

                const hash = md5(url).toString();

                if (load.indexOf(hash) === -1) {

                    load.push(hash); //记录

                    Mq.add(async () => {
                        await download(url, hash); //下载视频
                    })
                }


            }
        }
    };


    page.on('response', onRes);

}