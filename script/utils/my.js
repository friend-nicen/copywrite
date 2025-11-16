import axios from "axios";
import {print} from "./common.js";
import * as fs from "fs";

/**
 * 获取配置信息
 */
export default async function getText(file) {


    return new Promise(resolve => {
        axios.post("/文案识别接口", {
            file: fs.createReadStream(file)
        }, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            resolve(res.data.data);
        }).catch(error => {
            print(error.message);
            resolve();
        });
    });
}

