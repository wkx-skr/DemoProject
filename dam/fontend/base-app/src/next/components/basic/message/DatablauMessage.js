/** confirm.js */
import { Message } from 'element-ui'
// function saveErrorList(val){
//   let self =val
//   console.log(this.$user,self,this,'this.$user')
//   // window.localStorage.setItem(`errorList-${this.$user.username}`, JSON.stringify(this.$errorList))
// }
function blauShowSuccess(msg, type) {
  const typeArr = ['success', 'warning', 'info', 'error']
  if (typeof msg === 'string') {
    if (type && typeArr.includes(type)) {
      type = type
    } else {
      type = 'success'
    }
    if (msg.length > 1000) {
      this.$datablauMessage({
        dangerouslyUseHTMLString: true,
        message:
          '<div style="max-height:600px;max-width:900px;overflow:auto">' +
          msg +
          '</div>',
        type: type,
        showClose: true,
        duration: 5000,
      })
      // this.$errorList.unshift({
      //   type: type,
      //   msg: msg,
      //   long: true,
      //   time: new Date()
      // })
      // saveErrorList(this)
    } else {
      this.$datablauMessage({
        dangerouslyUseHTMLString: true,
        message: msg,
        type: type,
        showClose: true,
      })
      // this.$errorList.unshift({
      //   type: type,
      //   msg: msg,
      //   time: new Date()
      // })
      // saveErrorList(this)
    }
  }
}

function blauShowFailure() {
  if (typeof arguments[0] === 'string') {
    // this.$errorList.unshift({
    //   type: 'error',
    //   msg: arguments[0],
    //   time: new Date()
    // })
    // saveErrorList()
    this.$datablauMessage({
      type: 'error',
      showClose: true,
      duration: 5000,
      message: arguments[0],
    })
  }
  if (arguments[0].response) {
    var status = arguments[0].response.status
  } else {
    status = 'code'
  }
  if (status === 401) {
    if (window.setting.ssoLoginUrl) {
      window.$ssoLogin()
    } else {
      window.location.href = '../base-app/datablau.html'
    }
  } else if (status === 404) {
    this.$datablauMessage.error('服务器无法连接')
  } else if (status === 500 || status === 400 || status === 599) {
    if (arguments[0].response.data.errorCode === -1) {
      return
    }
    let msg = ''
    msg += arguments[0].response.data.errorMessage
    msg = msg.replace(/\n/g, '<br>')
    if (String(msg).length > 1000) {
      this.$datablauMessage({
        dangerouslyUseHTMLString: true,
        message:
          '<div style="max-width:900px;max-height:500px;overflow:auto">' +
          msg +
          '</div>',
        type: 'error',
        showClose: true,
        duration: 0,
      })
      this.$errorList.unshift({
        type: 'error',
        msg:
          '<span style="color:darkblue">' +
          arguments[0].response.request.responseURL +
          '</span><br>' +
          msg,
        long: true,
        time: new Date(),
      })
      // saveErrorList()
    } else {
      this.$errorList.unshift({
        type: 'error',
        msg:
          '<span style="color:darkblue">' +
          arguments[0].response.request.responseURL +
          '</span><br>' +
          msg,
        time: new Date(),
      })
      // saveErrorList()
      this.$datablauMessage({
        showClose: true,
        duration: 5000,
        message: msg || arguments[0].response.data.errorType,
        type: 'error',
      })
    }
  } else if (status === 405 || status === 403) {
    this.$datablauMessage.error('错误类型' + status)
  } else if (status != 'code') {
    this.$datablauMessage.error('错误类型' + status)
  } else {
    //  DatablauMessage.error('代码错误');
    // console.log(arguments[0])
  }
}

function showMessage(options) {
  Message({
    ...options,
    customClass: 'datablau-messagetip',
  })
}
const DatablauMessage = function (options) {
  if (isObject(options)) {
    const { type = 'info', ...rest } = options
    showMessage({
      type,
      ...rest,
    })
    return
  }
  showMessage({
    type: options.type || 'info',
    message: options,
  })
}

;['success', 'error', 'info', 'warning'].forEach(type => {
  DatablauMessage[type] = function (options) {
    if (isObject(options)) {
      DatablauMessage({
        type: type,
        ...options,
      })
      return
    }
    DatablauMessage({
      type,
      message: options,
    })
  }
})

// 判断传入的是否是Object
function isObject(content) {
  return (
    Object.prototype.toString.call(content) === '[object Object]' &&
    !!content.message
  )
}
export { blauShowSuccess, blauShowFailure, DatablauMessage }
