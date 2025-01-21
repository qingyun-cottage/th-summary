<script setup lang="ts">
import { RegisterApi, loginApi, logoutApi, nowUser } from '@/api'
import { Overlay, showFailToast, showSuccessToast } from 'vant'
import { reactive } from 'vue'
import { onMounted } from 'vue'
import { ref } from 'vue'

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
    logoutApi().then(() => {
        isLogin.value = false
        showSuccessToast({ message: '退出登录' })
    })
}
</script>

<template>
    <div class="fixed_right">
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

    .name {
        font-size: 18px;
        margin-right: 8px;
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
        background-color: #242424;
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
