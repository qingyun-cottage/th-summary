<script setup lang="ts">
import { RegisterApi, loginApi, logoutApi, nowUser } from '@/api'
import { useTheme } from '@/store/theme'
import {
    Overlay,
    showConfirmDialog,
    showFailToast,
    showSuccessToast,
} from 'vant'
import { reactive } from 'vue'
import { onMounted } from 'vue'
import { ref } from 'vue'

const theme = useTheme()

const toggleTheme = () => {
    theme.toggleTheme()
}

const isLogin = ref(false)
const userName = ref('')
const dialogData = reactive({
    showOverlay: false,
    title: '',
    userName: '',
    password: '',
})

onMounted(() => {
    getUserInfo()
})

const getUserInfo = () => {
    const userInfo = nowUser()
    if (userInfo) {
        isLogin.value = true
        userName.value = userInfo.attributes.username
    }
}

let submitFun = () => {}
const handleLogin = () => {
    dialogData.title = '登录'
    dialogData.showOverlay = true
    submitFun = () => {
        loginApi(dialogData.userName, dialogData.password)
            .then(_res => {
                showSuccessToast('登录成功')
                closeDialog()
                window.location.reload()
            })
            .catch(_err => {
                showFailToast('登录失败')
            })
    }
}
const handleRegister = () => {
    dialogData.title = '注册'
    dialogData.showOverlay = true
    submitFun = () => {
        RegisterApi(dialogData.userName, dialogData.password)
            .then(_res => {
                showSuccessToast('注册成功，自动登录')
                closeDialog()
                window.location.reload()
            })
            .catch(_err => {
                showFailToast('注册失败，请联系管理员')
            })
    }
}

const submit = () => {
    submitFun()
}
const cancel = () => {
    // dialogData.showOverlay = false
    Object.assign(dialogData, {
        showOverlay: false,
        userName: '',
        password: '',
    })
}

const closeDialog = () => {
    cancel()
    getUserInfo()
}

const logout = () => {
    showConfirmDialog({
        title: '提示',
        message: '确定要退出登录吗？',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
    })
        .then(() => {
            return logoutApi()
        })
        .then(() => {
            isLogin.value = false
            showSuccessToast({ message: '退出登录' })
            window.location.reload()
        })
}
</script>

<template>
    <div class="fixed_right">
        <!-- 切换按钮 -->
        <div class="theme_btn" @click="toggleTheme">
            <svg
                viewBox="0 0 24 24"
                class="light-icon"
                v-if="theme.currentTheme == 'dark'"
            >
                <path
                    d="M6.05 4.14l-.39-.39a.993.993 0 0 0-1.4 0l-.01.01a.984.984 0 0 0 0 1.4l.39.39c.39.39 1.01.39 1.4 0l.01-.01a.984.984 0 0 0 0-1.4zM3.01 10.5H1.99c-.55 0-.99.44-.99.99v.01c0 .55.44.99.99.99H3c.56.01 1-.43 1-.98v-.01c0-.56-.44-1-.99-1zm9-9.95H12c-.56 0-1 .44-1 .99v.96c0 .55.44.99.99.99H12c.56.01 1-.43 1-.98v-.97c0-.55-.44-.99-.99-.99zm7.74 3.21c-.39-.39-1.02-.39-1.41-.01l-.39.39a.984.984 0 0 0 0 1.4l.01.01c.39.39 1.02.39 1.4 0l.39-.39a.984.984 0 0 0 0-1.4zm-1.81 15.1l.39.39a.996.996 0 1 0 1.41-1.41l-.39-.39a.993.993 0 0 0-1.4 0c-.4.4-.4 1.02-.01 1.41zM20 11.49v.01c0 .55.44.99.99.99H22c.55 0 .99-.44.99-.99v-.01c0-.55-.44-.99-.99-.99h-1.01c-.55 0-.99.44-.99.99zM12 5.5c-3.31 0-6 2.69-6 6s2.69 6 6 6s6-2.69 6-6s-2.69-6-6-6zm-.01 16.95H12c.55 0 .99-.44.99-.99v-.96c0-.55-.44-.99-.99-.99h-.01c-.55 0-.99.44-.99.99v.96c0 .55.44.99.99.99zm-7.74-3.21c.39.39 1.02.39 1.41 0l.39-.39a.993.993 0 0 0 0-1.4l-.01-.01a.996.996 0 0 0-1.41 0l-.39.39c-.38.4-.38 1.02.01 1.41z"
                    fill="currentColor"
                ></path>
            </svg>
            <svg viewBox="0 0 24 24" class="dark-icon" v-else>
                <path
                    d="M11.01 3.05C6.51 3.54 3 7.36 3 12a9 9 0 0 0 9 9c4.63 0 8.45-3.5 8.95-8c.09-.79-.78-1.42-1.54-.95A5.403 5.403 0 0 1 11.1 7.5c0-1.06.31-2.06.84-2.89c.45-.67-.04-1.63-.93-1.56z"
                    fill="currentColor"
                ></path>
            </svg>
        </div>
        <template v-if="isLogin">
            <span class="name">{{ userName }}</span>
            <button @click="logout">退出登录</button>
        </template>
        <template v-else>
            <button @click="handleLogin">登录</button>
            <button @click="handleRegister">注册</button>
        </template>
    </div>

    <Overlay :show="dialogData.showOverlay">
        <div class="wrapper">
            <div class="inner_box">
                <div class="title">
                    {{ dialogData.title }}
                </div>
                <div class="form_item">
                    <span>用户</span>
                    <input
                        type="text"
                        v-model="dialogData.userName"
                        placeholder="用户名"
                    />
                </div>
                <div class="form_item">
                    <span>密码</span>
                    <input
                        type="password"
                        v-model="dialogData.password"
                        placeholder="请输入密码"
                    />
                </div>
                <div class="btn_box">
                    <button @click="cancel">取消</button>
                    <button @click="submit">{{ dialogData.title }}</button>
                </div>
            </div>
        </div>
    </Overlay>
</template>

<style lang="less" scoped>
.fixed_right {
    // position: absolute;
    // top: 0;
    // right: 0;
    padding: 10px;
    display: flex;
    // flex-direction: column;
    align-items: center;
    gap: 10px;

    .theme_btn {
        width: 24px;
        height: 24px;
        cursor: pointer;
    }

    .name {
        font-size: 18px;
        margin: 0 8px;
        user-select: none;
    }

    .active {
        border-color: #646cff;
    }
}

.wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    .inner_box {
        padding: 20px 20px 20px 40px;
        width: 400px;
        // height: 400px;
        // background-color: #242424;
        background-color: var(--bgColor);
        border-radius: 10px;
        display: flex;
        gap: 16px;
        flex-direction: column;
        align-items: start;

        .title {
            font-size: 18px;
        }
        .form_item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .btn_box {
            // 靠右
            width: 100%;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }

        .input {
            width: 150px;
            // height: 20px;
            // line-height: 30px;
        }
        .select {
            height: 30px;
            // 聚焦状态
            &:focus {
                outline: none;
            }
        }
    }
}
</style>
