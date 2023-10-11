/**
 * @date 2023/9/19
 * @author 爱心发电丶
 */
import * as path from 'path'
import OSS from 'ali-oss'
import config from "../store/config.js";

const client = new OSS({
    // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: config.region,
    // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
    accessKeyId: config.akId,
    accessKeySecret: config.akSecret,
    // 填写Bucket名称。
    bucket: config.bucket,
});

// 自定义请求头
const headers = {
    // 指定Object的存储类型。
    'x-oss-storage-class': 'Standard',
    // 指定Object的访问权限。
    'x-oss-object-acl': 'public-read',
    // 通过文件URL访问文件时，指定以附件形式下载文件，下载后的文件名称定义为example.txt。
    'Content-Disposition': 'attachment; filename="example.txt"',
    // 设置Object的标签，可同时设置多个标签。
    'x-oss-tagging': 'Tag1=1&Tag2=2',
    // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
    'x-oss-forbid-overwrite': 'false',
};


/**
 * 上传对象存储
 * @param file
 * @returns {Promise<void>}
 */
async function put(file) {
    try {

        const basename = path.basename(file); //文件名

        // 填写OSS文件完整路径和本地文件的完整路径。OSS文件完整路径中不能包含Bucket名称。
        // 如果本地文件的完整路径中未指定本地路径，则默认从示例程序所属项目对应本地路径中上传文件。
        const result = await client.put('/audio/' + basename, path.normalize(file)
            // 自定义headers
            , {headers}
        );


        if (result.res.requestUrls[0]) {
            return `https://${config.bucket}.${config.region}-internal.aliyuncs.com/audio/${basename}`;
        } else {
            return false;
        }

    } catch (e) {
        console.log(e);
        return false;
    }
}


/**
 * 删除指定文件
 * @returns {Promise<void>}
 */
async function del(file) {
    try {
        const basename = path.basename(file); //文件名
        // 填写OSS文件完整路径和本地文件的完整路径。OSS文件完整路径中不能包含Bucket名称。
        // 如果本地文件的完整路径中未指定本地路径，则默认从示例程序所属项目对应本地路径中上传文件。
        await client.delete('/audio/' + basename);

    } catch (e) {
        console.log(e);
        return false;
    }
}


export default {
    put,
    del
}