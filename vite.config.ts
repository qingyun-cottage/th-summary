import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'

function replaceCrossorigin() {
    return {
        name: 'replace-crossorigin',
        transformIndexHtml(html: string) {
            // console.log('html', html)
            return html.replace(/crossorigin /g, '')
        },
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    base: 'https://gitee.com/qingyun-cottage/resource/raw/main/single/th-summary',
    plugins: [
        vue(),
        // legacy({
        //     targets: [], // 根据需要调整目标浏览器
        //     polyfills: true, // 自动注入必要的 Polyfill
        // }),
        // replaceCrossorigin(),
    ],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    server: {
        host: '0.0.0.0', // 这个用于启动
        port: 8066, // 指定启动端口
        open: false, //启动后是否自动打开浏览器
    },
    // build: {
    //     target: 'es2015',
    // },
})
