import Lean from 'leancloud-storage'
import { showFailToast } from 'vant'

Lean.init({
    appId: 'lAoggwjRMvY1wU8S39PdpvJX-gzGzoHsz',
    appKey: 'RNOBEZjkuuXGsMvNEYdJOoIK',
    serverURL: 'https://laoggwjr.lc-cn-n1-shared.com',
})

export type ThDataType = {
    power: number
    type: string
    date: string
}

type ThDataItem = {
    id: string
    power: number
    type: string
    date: string
}

export const loginApi = (username: string, password: string) => {
    return Lean.User.logIn(username, password)
}

export const RegisterApi = (username: string, password: string) => {
    const user = new Lean.User()
    user.setUsername(username)
    user.setPassword(password)
    return user.signUp()
}

export const nowUser = () => {
    return Lean.User.current()
}
export const logoutApi = () => {
    return Lean.User.logOut()
}

const handleReq = async (func: Function) => {
    // 如果没有登录，则弹窗提示
    if (!Lean.User.current()) {
        showFailToast('请先登录')
        return
    }
    try {
        const res = await func()
        return res
    } catch (error) {
        // 重新登录
        await logoutApi()
        window.location.reload()
    }
}

// export const getThDataList = () => {
//     return handleReq(() => {
//         const query = new Lean.Query('th_Data')
//         // 查询前1000条数据
//         query.limit(1000)
//         return query.find()
//     })
// }
// export const getThDataList = (): Promise<any> => {
//     // 由于 LeanCloud 的限制，查询所有数据时，只能查询前1000条数据，所以这里需要分页查询
//     let pageSize = 1000
//     let page = 0
//     const query = new Lean.Query('th_Data')
//     function getData() {
//         return new Promise((resolve, _reject) => {
//             query.limit(pageSize)
//             query.skip(page * pageSize)
//             query.find().then((res: any) => {
//                 if (res.length < pageSize) {
//                     resolve(res)
//                 } else {
//                     page++
//                     getData().then((res2: any) => {
//                         resolve([...res, ...res2])
//                     })
//                 }
//             })
//         })
//     }
//     return getData()
// }

export const getThDataList = async (): Promise<any[]> => {
    // 由于性能原因，limit 最大只能设为 1000。即使将其设为大于 1000 的数，云端也只会返回 1,000 条结果。
    const pageSize = 800
    let page = 0
    let allResults: any[] = []

    const query = new Lean.Query('th_Data')
    while (true) {
        query.limit(pageSize)
        query.skip(page * pageSize)
        try {
            const res = await handleReq(() => query.find())
            if (res.length) {
                allResults = [...allResults, ...res]
            }
            // 如果返回的结果少于pageSize，则表示已经获取完所有数据
            if (res.length < pageSize) break
        } catch (error) {
            console.error('Error fetching data:', error)
            throw error // 或者根据需求选择其他错误处理方式
        }
        page++
    }
    return allResults
}

export const addThData = (data: ThDataType) => {
    const { power, type, date } = data
    return handleReq(() => {
        const thData = new Lean.Object('th_Data')
        thData.set('power', power)
        thData.set('type', type)
        thData.set('date', date)
        return thData.save()
    })
}

export const editThData = (data: ThDataItem) => {
    const { id, power, type, date } = data
    return handleReq(() => {
        const thData = Lean.Object.createWithoutData('th_Data', id)
        thData.set('power', power)
        thData.set('type', type)
        thData.set('date', date)
        return thData.save()
    })
}

export const deleteThData = (objectId: string) => {
    return handleReq(() => {
        const thData = Lean.Object.createWithoutData('th_Data', objectId)
        return thData.destroy()
    })
}

export const deleteAllData = async () => {
    const all = await getThDataList()
    return handleReq(() => {
        Lean.Object.destroyAll(all)
    })
}

export const importThData = (data: ThDataType[]) => {
    const list = data.map(item => {
        const thData = new Lean.Object('th_Data')
        thData.set('power', item.power)
        thData.set('type', item.type)
        thData.set('date', item.date)
        return thData
    })
    return handleReq(() => Lean.Object.saveAll(list))
}
