import { Upload } from 'element-ui'
import HTTP from '@/http/main'

const { $headers } = HTTP
const headersArr = []

// 通过闭包, 可以在全局调用这个函数为 upload 组件添加 headers
// 主要用于 sso 增加 headers
function addGlobalHeaders(header = { key: '', value: '' }) {
  headersArr.push(header)
}

Object.keys($headers).forEach(key => {
  let obj = {
    key,
    value: $headers[key],
  }
  addGlobalHeaders(obj)
})

Upload.watch.headers = {
  immediate: true,
  handler: function (newVal) {
    headersArr.forEach(header => {
      // 直接在子组件内修改父组件传入的 props, 不推荐的用法
      // 非引用类型会报错
      if (!newVal[header.key]) {
        newVal[header.key] = header.value
      }
    })
  },
}
export default { Upload, addGlobalHeaders }
