// 上传文件
export function uploadFile(callback: (fileStr: string) => void) {
    // 打开浏览器选择文件
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = () => {
        const file = input.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e: any) => {
                const fileStr = e.target.result
                callback(fileStr)
            }
            reader.readAsText(file)
        }
    }
    input.click()
}

// 下载文件
export function downloadFile(fileName: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
}
