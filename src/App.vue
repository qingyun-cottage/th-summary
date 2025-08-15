<script setup lang="ts">
// import { onMounted } from 'vue'
import { useDark } from '@vueuse/core'
import { computed, ref, shallowRef } from 'vue'
import CheckMenu from './components/CheckMenu.vue'
import UserBar from './components/UserBar.vue'
import BasicUsage from './view/BasicUsage.vue'
import DataVisual from './view/DataVisual.vue'

const isDark = useDark({
    storageKey: 'th_theme',
})

const theme = computed(() => {
    return isDark.value ? 'dark' : 'light'
})

// 定义菜单
const menu = ref([
    {
        name: 'BasicUsage',
        label: '基础数据',
        // 不用shallowRef的话, vue提示会有性能问题
        component: shallowRef(BasicUsage),
        active: true,
    },
    {
        name: 'DataVisual',
        label: '数据可视化',
        component: shallowRef(DataVisual),
        active: false,
    },
])
// 子组件的事件
const handleMenuChange = (name: string) => {
    menu.value.forEach(item => {
        item.active = item.name === name
    })
}
</script>

<template>
    <van-config-provider :theme="theme">
        <header class="head">
            <CheckMenu :menuData="menu" @menuChange="handleMenuChange" />
            <UserBar />
        </header>
        <div class="content">
            <component :is="menu.find(item => item.active)?.component" />
        </div>
    </van-config-provider>
</template>

<style scoped lang="less">
.van-config-provider {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
}
.head {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
}
.content {
    width: 100%;
    flex: 1;
    overflow: auto;
    display: flex;
    // align-items: center;
}
</style>
