import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 引入组件样式 (这里是全部引入)
import 'vant/lib/index.css'
import { ConfigProvider } from 'vant'

createApp(App)
    .use(ConfigProvider)
    .mount('#app')
