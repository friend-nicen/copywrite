/**
 * @date 2023/9/19
 * @author 爱心发电丶
 */

import Client from "@alicloud/nls-filetrans-2018-08-17";
import config from "../store/config.js";

/**
 * 录音文件识别
 * @param fileLink
 */
export default async function fileTrans(fileLink) {

    var akId = config.akId;
    var akSecret = config.akSecret;
    var appKey = config.appKey

    //地域ID，固定值。
    var ENDPOINT = 'http://filetrans.cn-shanghai.aliyuncs.com';
    var API_VERSION = '2018-08-17';
    /**
     * 创建阿里云鉴权client
     */
    var client = new Client({
        accessKeyId: akId,     //获取AccessKey ID和AccessKey Secret请前往控制台：https://ram.console.aliyun.com/manage/ak
        secretAccessKey: akSecret,
        endpoint: ENDPOINT,
        apiVersion: API_VERSION
    });
    /**
     * 提交录音文件识别请求，请求参数组合成JSON格式的字符串作为task的值。
     * 请求参数appkey：项目appkey，获取Appkey请前往控制台：https://nls-portal.console.aliyun.com/applist
     * 请求参数file_link：需要识别的录音文件。
     */
    var task = {
        appkey: appKey,
        file_link: fileLink,
        first_channel_only: true,
        version: "4.0",        // 新接入请使用4.0版本，已接入（默认2.0）如需维持现状，请注释掉该参数设置。
        enable_words: false     // 设置是否输出词信息，默认值为false，开启时需要设置version为4.0。
    };

    task = JSON.stringify(task);

    var taskParams = {
        Task: task
    };

    var options = {
        method: 'POST'
    };

    return new Promise(resolve => {
        // 提交录音文件识别请求，处理服务端返回的响应。
        client.submitTask(taskParams, options).then((response) => {

            // 服务端响应信息的状态描述StatusText。
            var statusText = response.StatusText;
            if (statusText !== 'SUCCESS') {
                console.log('录音文件识别请求响应失败!');
                resolve(false);
                return;
            }

            console.log('录音文件识别请求响应成功!');

            // 获取录音文件识别请求任务的TaskId，以供识别结果查询使用。
            var taskId = response.TaskId;

            /**
             * 以TaskId为查询参数，提交识别结果查询请求。
             * 以轮询的方式进行识别结果的查询，直到服务端返回的状态描述为"SUCCESS"、SUCCESS_WITH_NO_VALID_FRAGMENT，
             * 或者为错误描述，则结束轮询。
             */
            var taskIdParams = {
                TaskId: taskId
            };
            var timer = setInterval(() => {
                client.getTaskResult(taskIdParams).then((response) => {
                    var statusText = response.StatusText;
                    if (statusText === 'RUNNING' || statusText === 'QUEUEING') {
                        // 继续轮询，注意间隔周期。
                    } else {
                        if (statusText === 'SUCCESS' || statusText === 'SUCCESS_WITH_NO_VALID_FRAGMENT') {
                            console.log('录音文件识别成功：');
                            var sentences = response.Result;

                            if (!sentences) {
                                resolve(false);
                            } else {

                                let text = ""; //文本

                                sentences.Sentences.forEach(item => {
                                    text += item.Text;
                                })

                                resolve(text);

                            }

                            resolve(sentences);
                        } else {
                            console.log('录音文件识别失败!');
                            resolve(false);
                        }
                        // 退出轮询
                        clearInterval(timer);
                    }
                }).catch((error) => {
                    console.error(error);
                    // 异常情况，退出轮询。
                    clearInterval(timer);
                });
            }, 10000);
        }).catch((error) => {
            console.error(error);
        });
    })
}

