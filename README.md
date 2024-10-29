# 抖音视频文案提取

合作请联系微信good7341

## 2024-10-29更新

### v1.0

1. 新增绿色免安装的可执行文件，无需额外操作，自带免费识别接口（2分钟以内的视频)，[点击下载 dist/douyin.exe](dist/douyin.exe)

截图演示：

![1.png](demo/3.jpg)
![2.png](demo/4.jpg)
![2.png](demo/5.jpg)

## 介绍

`\app\store\config.js` 文件配置运行参数

```javascript
export default {
    "akId": '', //阿里云音频识别应用ID
    "akSecret": '',  // 阿里云接口调用的Secret
    "appKey": '', // 阿里云接口调用的key
    "region": 'oss-cn-shanghai',  // 阿里云对象存储所在地区
    "bucket": '',  // 阿里云对象存储 Butket名称
}
```

## douyin.exe

* `打开窗口`会启动一个Webview窗口，并运行Chrome CDP协议，用于自动化
* `开始运行`会启动app\app.js脚本，并进行批量自动文案提取

## 运行

运行前，请先安装app目录下的npm包

## 演示

![1.png](demo/1.png)
![2.png](demo/2.png)


