// rollup.config.js
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
    input: 'app.js', // 你的入口文件
    onwarn: () => {
    },
    output: {
        file: 'dist/douyin.js', // 输出文件
        format: 'cjs',
        inlineDynamicImports: true
    },
    plugins: [
        terser({
            output: {
                comments: false, // 移除所有注释
            }
        }),
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs(),
        json()
    ],
};