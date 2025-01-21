<script setup lang="ts">
import { computed, reactive } from 'vue'
import { onMounted } from 'vue'
import {
    Overlay,
    showConfirmDialog,
    showDialog,
    showFailToast,
    showSuccessToast,
} from 'vant'
import { ref } from 'vue'
import {
    ThDataType,
    addThData,
    deleteAllData,
    editThData,
    getThDataList,
    importThData,
} from '@/api'
import { deleteThData } from '@/api'
import dayjs from 'dayjs'
import { downloadFile, uploadFile } from '@/utils/fileUtil'


type ListItem = {
    id: string
    date: string
    power: number
    type: string
}

const typeMap = {
    1: '初号機',
    2: '贰號機',
}

const state = reactive({
    addData: {
        // 日期
        date: null,
        // 战力
        power: null,
        // 类型
        type: '1',
    },
    showUpdateDialog: false,
    list: [] as ListItem[],
    // 排序 1 升序 2 降序
    sort: 2,
    updateData: {} as ListItem,
})

onMounted(() => {
    // console.log('mounted')
    getList()
})

// 加载数据的方法
const getList = () => {
    // console.log('加载数据')
    getThDataList()
        .then(res => {
            // console.log('加载数据', res)
            state.list = res.map((item: any) => {
                return {
                    id: item.id,
                    ...item.attributes,
                }
            })
        })
        .catch(_err => {
            // console.log(_err)
        })
}

const sortList = computed(() => {
    const list = state.list.slice().sort((a: ListItem, b: ListItem) => {
        // 根据日期排序
        if (state.sort === 1) {
            return new Date(a.date).getTime() - new Date(b.date).getTime()
        } else {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
        }
    }) as any
    list.sum = list.reduce((pre: number, cur: ListItem) => {
        return pre + cur.power
    }, 0)
    return list
})
// 获取排序方式
const getSort = computed(() => {
    return state.sort === 1 ? '升序' : '降序'
})
// 切换排序方式
const changeSort = () => {
    state.sort = state.sort === 1 ? 2 : 1
}
// 记录点击操作的次数
const clickOptIndex = ref(0)
// 点击操作
const clickOpt = () => {
    // 每次点击操作，增加1 超过6次归0
    clickOptIndex.value += 1
    if (clickOptIndex.value > 6) {
        clickOptIndex.value = 0
    }
}
const showSum = computed(() => {
    // 当clickOptIndex.value为6时，显示总和
    return clickOptIndex.value === 6
})

// 添加数据的方法
const addData = () => {
    // console.log('添加数据', state.addData)
    if (!state.addData.date || !state.addData.power) {
        showFailToast('请输入日期或内容')
        return
    }
    addThData(state.addData as unknown as ThDataType).then(() => {
        showSuccessToast('添加成功')
        getList()
    })
    // 清除输入框
    // state.addData.date = null
    // state.addData.power = null
}

// 修改数据的方法
const editData = (item: any) => {
    state.updateData = {
        id: item.id,
        date: item.date,
        power: item.power,
        type: item.type,
    }
    state.showUpdateDialog = true
}
const cancelEdit = () => {
    state.showUpdateDialog = false
}
const updateData = () => {
    editThData(state.updateData).then(() => {
        showSuccessToast('修改成功')
        state.showUpdateDialog = false
        getList()
    })
}

// 删除数据的方法
const deleteData = (item: any) => {
    showConfirmDialog({
        title: '提示',
        message: '确定删除吗？',
    })
        .then(() => {
            return deleteThData(item.id)
        })
        .then(() => {
            showSuccessToast('删除成功')
            getList()
        })
        .catch(() => {})
}

// 导入导出
const handleImport = () => {
    uploadFile((fileStr: string) => {
        try {
            const list = JSON.parse(fileStr)
            handleImport(list)
        } catch (e) {
            showFailToast('文件解析失败')
        }
    })
    function handleImport(list: ThDataType[]) {
        showConfirmDialog({
            title: '确认导入',
            message: `共 ${list.length} 条数据，\n将删除原有所有数据，\n写入新的数据\n\n是否导入？`,
        })
            .then(() => {
                return deleteAllData()
            })
            .then(() => {
                return importThData(list)
            })
            .then(() => {
                showSuccessToast('导入成功')
                getList()
            })
    }
}
const handleExport = () => {
    console.log('导出')
    getThDataList().then(async res => {
        try {
            await showConfirmDialog({
                title: '确认导出',
                message: `共${res.length}条数据，\n是否确认导出？`,
            })
            const list = res.map((item: any) => {
                return {
                    ...item.attributes,
                }
            })
            const timeStr = dayjs().format('YYYYMMDDHHmmss')
            const fileName = `th-summary-data-${timeStr}.json`
            const dataStr = JSON.stringify(list)
            downloadFile(fileName, dataStr)
            showDialog({
                title: '提示',
                message: '数据导出成功',
            })
        } catch {}
    })
}
</script>

<template>
    <div class="basic_usage">
        <h2 class="title">TH 汎用ヒト型決戦兵器</h2>
        <div class="top_box">
            <!-- <button for="file_upload">导入数据</button>
            <input type="file" id="file_upload" @change="handleImport" /> -->
            <button @click="handleImport">导入数据</button>
            <button @click="handleExport">导出数据</button>
            <button class="right" @click="changeSort">
                {{ getSort }}
            </button>
        </div>
        <div class="add_box">
            <span>日期</span>
            <input class="input" type="date" v-model="state.addData.date" />
            <span>战力</span>
            <input
                class="input"
                type="number"
                placeholder="请输入内容"
                v-model="state.addData.power"
            />
            <span>类型</span>
            <!-- 只有1和2 -->
            <select class="input select" v-model="state.addData.type">
                <option value="1">{{ typeMap[1] }}</option>
                <option value="2">{{ typeMap[2] }}</option>
            </select>

            <button @click="addData()">添加</button>
        </div>
        <div class="list_box">
            <div class="item">
                <span>序号</span>
                <span>日期</span>
                <span>战力</span>
                <span>类型</span>
                <span class="opt" @click="clickOpt">
                    {{ showSum ? sortList.sum : '操作' }}
                </span>
            </div>
            <div class="list_content">
                <div
                    class="item"
                    v-for="(item, index) in sortList"
                    :key="index"
                >
                    <span>{{ index + 1 || item.id }}</span>
                    <span>{{ item.date }}</span>
                    <span>{{ item.power }}</span>
                    <span>
                        {{ typeMap[item.type as keyof typeof typeMap] }}
                    </span>
                    <span class="opt">
                        <button @click="editData(item)">修改</button>
                        <button @click="deleteData(item)">删除</button>
                    </span>
                </div>
            </div>
        </div>

        <Overlay :show="state.showUpdateDialog">
            <div class="wrapper">
                <div class="update_box">
                    <div class="title_text">
                        <span>修改</span>
                    </div>
                    <div class="form_item">
                        <span>日期</span>
                        <input
                            class="input"
                            type="date"
                            v-model="state.updateData.date"
                        />
                    </div>
                    <div class="form_item">
                        <span>战力</span>
                        <input
                            class="input"
                            type="number"
                            placeholder="请输入内容"
                            v-model="state.updateData.power"
                        />
                    </div>
                    <div class="form_item">
                        <span>类型</span>
                        <!-- 只有1和2 -->
                        <select
                            class="input select"
                            v-model="state.updateData.type"
                        >
                            <option value="1">{{ typeMap[1] }}</option>
                            <option value="2">{{ typeMap[2] }}</option>
                        </select>
                    </div>
                    <div class="btn_box">
                        <button @click="cancelEdit">取消</button>
                        <button @click="updateData">保存</button>
                    </div>
                </div>
            </div>
        </Overlay>
    </div>
</template>

<style lang="less" scoped>
.basic_usage {
    position: relative;
    min-width: 720px;
    margin: 0 auto;
}
.title {
    // 导入字体 本地
    // margin-top: -20px;
    font-size: 32px;
    font-family: 'GenkaiMincho';
}
.top_box {
    display: flex;
    gap: 10px;
    .right {
        margin-left: auto;
    }
}
.add_box {
    margin: 20px 12px 15px;
    display: flex;
    align-items: center;
    gap: 12px;

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
.list_box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;

    .list_content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: 360px;
        overflow: auto;

        &::-webkit-scrollbar {
            width: 0;
        }
    }

    .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;

        span {
            width: 100px;
            display: inline-block;
            text-align: center;

            // 不允许复制
            // user-select: none;
        }
        .opt {
            width: 200px;
            display: flex;
            justify-content: center;
            gap: 10px;
            user-select: none;
        }
    }
}
.wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    .update_box {
        padding: 20px 20px 20px 40px;
        width: 400px;
        // height: 400px;
        background-color: var(--bgColor);
        border-radius: 10px;
        display: flex;
        gap: 16px;
        flex-direction: column;
        align-items: start;

        .title_text {
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
