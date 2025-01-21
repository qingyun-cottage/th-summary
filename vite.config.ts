import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [vue()],
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
})
