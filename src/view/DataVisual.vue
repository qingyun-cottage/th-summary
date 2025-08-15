<script setup lang="ts">
// 使用 echarts 进行数据可视化
// 堆叠柱状图
import { getThDataList } from '@/api'
import { useDark } from '@vueuse/core'
import * as echarts from 'echarts'
import { computed, onMounted, reactive, ref, watch } from 'vue'

const isDark = useDark({
    storageKey: 'th_theme',
})

const chartTextColor = computed(() => {
    const currentTheme = isDark
    return currentTheme ? '#fff' : '#333'
})

const tempType = ref('')

watch(
    () => isDark,
    () => {
        if (tempType.value) {
            showDataWay(tempType.value as any)
        }
    }
)

type ItemData = {
    date: string
    type: '1' | '2'
    power: number
}

const rawList = ref<ItemData[]>([])

// 获取数据
const getRawList = async () => {
    const res = await getThDataList()

    if (res.length === 0) {
        throw new Error('暂无数据')
    }
    rawList.value = res
        .map((item: any) => {
            return {
                id: item.id,
                ...item.attributes,
            }
        })
        .sort((a: any, b: any) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime()
        })
}

let main = null
let myChart: any = null

const isEmpty = computed(() => {
    return rawList.value.length == 0
})

onMounted(() => {
    getRawList()
        .then(() => {
            main = document.getElementById('main')
            myChart = echarts.init(main)
            // console.log(rawList)
            showDataWay('all_month')
        })
        .catch(_err => {
            // console.log(_err)
        })
})

// 当前显示的月份
const showMonth = reactive({
    show: false,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
})

const showDataWay = (type: 'all' | 'all_month' | 'this_month') => {
    tempType.value = type
    switch (type) {
        case 'all':
            showMonth.show = false
            withDate(undefined)
            break
        case 'all_month':
            showMonth.show = false
            withMonth()
            break
        case 'this_month':
            handleThisMonth()
            break
        default:
            break
    }
}

// 点击本月
const handleThisMonth = () => {
    // showMonth 的 month 和 year 重置 默认值
    showMonth.month = new Date().getMonth() + 1
    showMonth.year = new Date().getFullYear()
    showMonth.show = true
    withOneMonth()
}
const prev = () => {
    if (showMonth.month > 1) {
        showMonth.month--
    } else {
        showMonth.month = 12
        showMonth.year--
    }
    withOneMonth()
}
const next = () => {
    if (showMonth.month < 12) {
        showMonth.month++
    } else {
        showMonth.month = 1
        showMonth.year++
    }
    withOneMonth()
}
// 单月查看
const withOneMonth = () => {
    const { year, month } = showMonth
    withDate({ year, month })
}

// 创建图表
const drawChart = (
    xData: string[] = [],
    power1List: number[] = [],
    power2List: number[] = [],
    title: string = '平均能耗'
) => {
    // const main = document.getElementById('main')
    // const myChart = echarts.init(main)
    // 清空旧数据
    myChart.clear()

    let option = {
        title: {
            text: title,
            subtext: '单位：KWh',
            right: '0',
            textStyle: {
                color: chartTextColor.value,
            },
        },
        // 提示框
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    color: '#ffffff',
                },
                crossStyle: {
                    color: chartTextColor.value,
                },
            },
            // 增加显示 两组数据的和
            formatter: function (params: any) {
                let sum = 0
                params.forEach((item: any) => {
                    sum += item.value
                })
                return (
                    params[0].name +
                    '<br/>' +
                    params[0].marker +
                    params[0].seriesName +
                    ' : ' +
                    params[0].value +
                    '<br/>' +
                    params[1].marker +
                    params[1].seriesName +
                    ' : ' +
                    params[1].value +
                    '<br/>' +
                    '合计 : ' +
                    sum
                )
            },
        },
        legend: {
            data: ['初号机', '贰号机'],
            textStyle: {
                color: chartTextColor.value, //字体颜色
            },
            // 左侧
            left: 0,
        },
        grid: {
            left: '0%',
            right: '3%',
            bottom: '45',
            top: '72',
            containLabel: true,
        },
        xAxis: [
            {
                type: 'category',
                data: xData,
                axisPointer: {
                    type: 'shadow',
                },
                axisLabel: {
                    show: true,
                    color: chartTextColor.value,
                },
            },
        ],
        yAxis: [
            {
                type: 'value',
                // name: 'power',
                nameTextStyle: {
                    color: '#ffffff',
                },
                min: 0,
                // max: 3000,
                // 最大值自适应 比列表值大一点
                // max: function (value: any) {
                //     return Math.ceil(value.max * 0.011) * 100
                // },
                axisLabel: {
                    // formatter: '{value} ',
                    color: chartTextColor.value,
                },
                splitLine: {
                    //网格线
                    show: true, //隐藏或显示
                    lineStyle: {
                        type: 'dotted', //设置网格线类型 dotted：虚线   solid:实线
                    },
                },
            },
        ],
        series: [
            {
                name: '初号机',
                type: 'bar',
                stack: 'th',
                data: power1List,
                itemStyle: {
                    color: '#5472c6',
                },
                label: {
                    show: false,
                    formatter: function (params: any) {
                        return params.value !== 0 ? params.value : ''
                    },
                },
            },
            {
                name: '贰号机',
                type: 'bar',
                stack: 'th',
                data: power2List,
                itemStyle: {
                    color: '#d36531',
                },
                label: {
                    // 数据不为0时显示
                    show: true,
                    position: 'top',
                    color: chartTextColor.value,
                    formatter: function (params: any) {
                        // return params.value !== 0 ? params.value : ''
                        // 计算power1+power2每一项的和
                        let power1 = power1List[params.dataIndex]
                        let power2 = power2List[params.dataIndex]
                        return power1 + power2 || ''
                    },
                },
            },
        ],
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
            },
            {
                start: 0,
                end: 100,
                handleSize: '80%',
                handleStyle: {
                    color: '#d3dee5',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2,
                },
            },
        ],
    }

    myChart.setOption(option)

    window.addEventListener('resize', () => {
        myChart.resize()
    })
}

// 创建月份数据
const withMonth = () => {
    const data = rawList.value

    // 将日期字符串转换为 Date 对象，并提取年份和月份
    const getDateByMonth = (dateStr: any) => {
        const [year, month] = dateStr.split('-')
        return new Date(year, month - 1)
    }

    // 获取起始月份和结束月份
    const startDate = getDateByMonth(data[0].date)
    const endDate = getDateByMonth(data[data.length - 1].date)

    // 生成连续的月份
    const xAxisData = []
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
        const year = currentDate.getFullYear()
        const month = String(currentDate.getMonth() + 1).padStart(2, '0')
        xAxisData.push(`${year}-${month}`)
        currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // 按月份分组合计数据
    const groupedData = new Map()
    data.forEach((item: ItemData) => {
        const [year, month] = item.date.split('-')
        const key = `${year}-${month}`
        const existingData = groupedData.get(key) || {
            month: key,
            totalPower1: 0,
            totalPower2: 0,
        }
        if (item.type == '1') {
            existingData.totalPower1 += item.power
        } else {
            existingData.totalPower2 += item.power
        }
        groupedData.set(key, existingData)
    })

    // 将没有数据的月份补全
    xAxisData.forEach(month => {
        if (!groupedData.has(month)) {
            groupedData.set(month, { month, totalPower1: 0, totalPower2: 0 })
        }
    })

    // 生成y轴数据 power1 power2
    const power1List = xAxisData.map(month => {
        const data = groupedData.get(month)
        return data.totalPower1
    })
    const power2List = xAxisData.map(month => {
        const data = groupedData.get(month)
        return data.totalPower2
    })

    // console.log([...groupedData.values()])

    // 平均能耗
    const averagePower = average(
        [...groupedData.values()].map(
            item => item.totalPower1 + item.totalPower2
        )
    )

    drawChart(xAxisData, power1List, power2List, `月均能耗 ：${averagePower}`)
}

// 创建日期数据
const withDate = (dateOpt: { year: number; month: number } | undefined) => {
    const data = rawList.value

    let title = '总和能耗'

    // 获取起始日期和结束日期
    let startDate = new Date(data[0].date)
    let endDate = new Date(data[data.length - 1].date)
    if (dateOpt) {
        // startDate = new Date('2024-06-01')
        // endDate = new Date('2024-06-30')
        // tiele = '2024年6月能耗'
        title = dateOpt.year + '年' + dateOpt.month + '月能耗'
        startDate = new Date(dateOpt.year, dateOpt.month - 1, 1)
        endDate = new Date(dateOpt.year, dateOpt.month, 0)
    }

    const xAxisData = []
    while (startDate <= endDate) {
        const year = startDate.getFullYear()
        const month = String(startDate.getMonth() + 1).padStart(2, '0')
        const day = String(startDate.getDate()).padStart(2, '0')
        xAxisData.push(`${year}-${month}-${day}`)
        startDate.setDate(startDate.getDate() + 1)
    }

    const groupedData = new Map()
    data.forEach((item: ItemData) => {
        const key = item.date
        const existingData = groupedData.get(key) || {
            date: key,
            totalPower1: 0,
            totalPower2: 0,
        }
        if (item.type == '1') {
            existingData.totalPower1 += item.power
        } else {
            existingData.totalPower2 += item.power
        }
        groupedData.set(key, existingData)
    })

    // 将没有数据的日期补全
    xAxisData.forEach(date => {
        if (!groupedData.has(date)) {
            groupedData.set(date, { date, totalPower1: 0, totalPower2: 0 })
        }
    })

    const power1List = xAxisData.map(date => {
        const data = groupedData.get(date)
        return data.totalPower1
    })
    const power2List = xAxisData.map(date => {
        const data = groupedData.get(date)
        return data.totalPower2
    })

    const allPower =
        power1List.reduce((a, b) => a + b) + power2List.reduce((a, b) => a + b)

    drawChart(xAxisData, power1List, power2List, `${title} ：${allPower}`)
}

// 计算数组的平均值
function average(arr: number[]) {
    // return arr.reduce((a, b) => a + b) / arr.length
    // 保留小数点后两位
    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)
}
</script>

<template>
    <div class="data_visual">
        <h2 class="title">数据展示</h2>
        <!-- 数据可视化 -->
        <template v-if="isEmpty">
            <span>暂无数据</span>
        </template>
        <template v-else>
            <div id="main"></div>
            <div class="btn_box">
                <div class="b1">
                    <button @click="showDataWay('all')">全部</button>
                    <button @click="showDataWay('all_month')">按月总览</button>
                </div>
                <div class="b2">
                    <button v-if="showMonth.show" @click="prev">上个月</button>
                    <button @click="showDataWay('this_month')">本月</button>
                    <button v-if="showMonth.show" @click="next">下个月</button>
                </div>
            </div>
        </template>
    </div>
</template>

<style lang="less" scoped>
.data_visual {
    position: relative;
    min-width: 720px;
    margin: 0 auto;
    // border: 1px solid #ffffff;
    .title {
        font-size: 32px;
        font-family: 'genkai-mincho';
    }
    #main {
        width: 100%;
        height: 50vh;
        // border: 1px solid #ffffff;
    }
    .btn_box {
        width: 100%;
        display: flex;
        justify-content: space-between;
        // gap: 10px;
        margin-top: 20px;
        .b1 {
            display: flex;
            gap: 10px;
        }
        .b2 {
            width: 40%;
            display: flex;
            justify-content: center;
            gap: 10px;
        }
    }
}
</style>
