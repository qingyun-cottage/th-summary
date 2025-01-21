import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'

export type ThemeStr = 'light' | 'dark'

export const useTheme = defineStore('theme', () => {
    const [autoMode, otherMode] = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches
        ? ['dark', 'light']
        : ['light', 'dark']

    const local_theme = ['auto', 'light', 'dark'].includes(
        localStorage.getItem('th_theme') || ''
    )
        ? localStorage.getItem('th_theme')
        : 'auto'

    const state = reactive({
        theme: local_theme,
        autoMode: <ThemeStr>autoMode,
        otherMode: <ThemeStr>otherMode,
    })

    // 计算属性
    const currentTheme = computed(() => {
        const currentTheme =
            state.theme === 'auto' ? state.autoMode : state.otherMode
        document.documentElement.setAttribute('data-theme', currentTheme)
        return currentTheme
    })

    // 初始化逻辑：当系统颜色方案改变时更新 autoMode 和 otherMode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    function handleColorSchemeChange(event: MediaQueryListEvent) {
        console.log('系统颜色切换事件')
        state.autoMode = event.matches ? 'dark' : 'light'
        state.otherMode = event.matches ? 'light' : 'dark'
    }
    mediaQuery.addEventListener('change', handleColorSchemeChange)

    const toggleTheme = () => {
        state.theme = state.theme == 'auto' ? state.otherMode : 'auto'
        document.documentElement.setAttribute('data-theme', currentTheme.value)
        localStorage.setItem('th_theme', state.theme)
    }

    return {
        currentTheme,
        toggleTheme,
    }
})
