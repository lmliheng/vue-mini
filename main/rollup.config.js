const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript')

module.exports = {
    input: 'packages/vue/src/index.ts',
    output: [
        { 
            sourcemap: true, 
            file: 'packages/vue/dist/vue.js', 
            format: 'iife', 
            name: 'Vue' 
        },
    ],
    plugins: [
        resolve(), 
        commonjs(), 
        typescript({
            sourceMap: true,  // 保持 true，与 tsconfig 一致
            declaration: true,
            declarationDir: './packages/vue/dist/types'  // 指定声明文件输出目录
        })
    ],
    external: [],
};