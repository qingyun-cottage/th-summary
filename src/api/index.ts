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

    const res = await func()
    return res
}

export const getThDataList = () => {
    return handleReq(() => {
        const query = new Lean.Query('th_Data')
        return query.find()
    })
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

export const deleteAllData =async () => {
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
