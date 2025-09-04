import { MessageBox as MessageBoxEl } from 'element-ui'
import Vue from 'vue'

const MessageBox = function () {
  // 在 iframe 中, 显示 dialog, 向父窗口发送消息
  Vue.prototype.$bus.$emit('dialog-visible-change', true)

  const result = MessageBoxEl.call(this, ...arguments)
  result
    .then(() => {})
    .catch(() => {})
    .finally(() => {
      // 在 iframe 中, 显示 dialog, 向父窗口发送消息
      Vue.prototype.$bus.$emit('dialog-visible-change', false)
    })
  return result
}
Object.keys(MessageBoxEl).forEach(method => {
  MessageBox[method] = function () {
    // 在 iframe 中, 显示 dialog, 向父窗口发送消息
    Vue.prototype.$bus.$emit('dialog-visible-change', true)

    const result = MessageBoxEl[method].call(this, ...arguments)
    result
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        // 在 iframe 中, 显示 dialog, 向父窗口发送消息
        Vue.prototype.$bus.$emit('dialog-visible-change', false)
      })
    return result
  }
})

Vue.prototype.$msgbox = MessageBox
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt

function DatablauCofirm(msg, title, type, options) {
  const typeArr = ['success', 'info', 'warning', 'error']
  let datablauTitle = this.$t('component.messageBox.title')
  let datablauOptions = {
    confirmButtonText: this.$t('component.messageBox.confirm'),
    cancelButtonText: this.$t('component.messageBox.cancel'),
    // customClass: 'datablau-message-box',
    type: 'warning',
  }
  if (this.$route.path.indexOf('sql_editor') !== -1) {
    datablauOptions.customClass = 'datablau-message-box datablau-message-boxBalck'
  } else {
    datablauOptions.customClass = 'datablau-message-box'
  }
  let allOptions = {}
  if (title && typeof title === 'string' && !typeArr.includes(title)) {
    datablauTitle = title
  }
  if (title && typeof title === 'string' && typeArr.includes(title)) {
    datablauOptions.type = title
  }
  if (title && typeof title === 'object') {
    allOptions = Object.assign({}, datablauOptions, title)
  }
  if (type && typeof type === 'string' && typeArr.includes(type)) {
    datablauOptions.type = type
  }
  if (type && typeof type === 'object') {
    allOptions = Object.assign({}, datablauOptions, type)
  }
  if (type && typeof type === 'object') {
    allOptions = Object.assign({}, datablauOptions, type)
  }
  if (options && typeof options === 'object') {
    allOptions = Object.assign({}, datablauOptions, options)
  }
  if (Object.keys(allOptions).length == 0) {
    return MessageBox.confirm(msg, datablauTitle, datablauOptions)
  }
  return MessageBox.confirm(msg, datablauTitle, allOptions)
}

function DatablauAlert(msg, title, type, options) {
  const typeArr = ['success', 'info', 'warning', 'error']
  let datablauTitle = this.$t('component.messageBox.title')
  let datablauOptions = {
    confirmButtonText: this.$t('component.messageBox.confirm'),
    cancelButtonText: this.$t('component.messageBox.cancel'),
    type: 'warning',
    // customClass: 'datablau-message-box',
  }
  if (this.$route.path.indexOf('sql_editor') !== -1) {
    datablauOptions.customClass = 'datablau-message-box datablau-message-boxBalck'
  } else {
    datablauOptions.customClass = 'datablau-message-box'
  }
  let allOptions = {}
  if (title && typeof title === 'string' && !typeArr.includes(title)) {
    datablauTitle = title
  }
  if (title && typeof title === 'string' && typeArr.includes(title)) {
    datablauOptions.type = title
  }
  if (title && typeof title === 'object') {
    allOptions = Object.assign({}, datablauOptions, title)
  }
  if (type && typeof type === 'string' && typeArr.includes(type)) {
    datablauOptions.type = type
  }
  if (type && typeof type === 'object') {
    allOptions = Object.assign({}, datablauOptions, type)
  }
  if (type && typeof type === 'object') {
    allOptions = Object.assign({}, datablauOptions, type)
  }
  if (options && typeof options === 'object') {
    allOptions = Object.assign({}, datablauOptions, options)
  }
  if (Object.keys(allOptions).length == 0) {
    return MessageBox.alert(msg, datablauTitle, datablauOptions)
  }
  return MessageBox.alert(msg, datablauTitle, allOptions)
}

function DatablauPrompt(msg, title, type, options) {
  const typeArr = ['success', 'info', 'warning', 'error']
  let datablauTitle = this.$t('component.messageBox.title')
  let datablauOptions = {
    confirmButtonText: this.$t('component.messageBox.confirm'),
    cancelButtonText: this.$t('component.messageBox.cancel'),
    // customClass: 'datablau-message-box',
    type: 'warning',
  }
  if (this.$route.path.indexOf('sql_editor') !== -1) {
    datablauOptions.customClass = 'datablau-message-box datablau-message-boxBalck'
  } else {
    datablauOptions.customClass = 'datablau-message-box'
  }
  let allOptions = {}
  if (title && typeof title === 'string' && !typeArr.includes(title)) {
    datablauTitle = title
  }
  if (title && typeof title === 'string' && typeArr.includes(title)) {
    datablauOptions.type = title
  }
  if (title && typeof title === 'object') {
    allOptions = Object.assign({}, datablauOptions, title)
  }
  if (type && typeof type === 'string' && typeArr.includes(type)) {
    datablauOptions.type = type
  }
  if (type && typeof type === 'object') {
    allOptions = Object.assign({}, datablauOptions, type)
  }
  if (type && typeof type === 'object') {
    allOptions = Object.assign({}, datablauOptions, type)
  }
  if (options && typeof options === 'object') {
    allOptions = Object.assign({}, datablauOptions, options)
  }
  if (Object.keys(allOptions).length == 0) {
    return MessageBox.prompt(msg, datablauTitle, datablauOptions)
  }
  return MessageBox.prompt(msg, datablauTitle, allOptions)
}

export { DatablauCofirm, DatablauAlert, DatablauPrompt }
