import $ from 'jquery'
import { Message } from 'element-ui'
function detectZoom() {
  let ratio = 0
  const screen = window.screen
  const ua = navigator.userAgent.toLowerCase()
  if (window.devicePixelRatio !== undefined) {
    ratio = window.devicePixelRatio
  } else if (~ua.indexOf('msie')) {
    if (screen.deviceXDPI && screen.logicalXDPI) {
      ratio = screen.deviceXDPI / screen.logicalXDPI
    }
  } else if (
    window.outerWidth !== undefined &&
    window.innerWidth !== undefined
  ) {
    ratio = window.outerWidth / window.innerWidth
  }
  if (ratio) {
    ratio = Math.round(ratio * 100)
  }
  return ratio
}
function preventDefault() {
  $(document).keydown(function (event) {
    // event.metaKey mac的command键
    if (
      (event.ctrlKey === true || event.metaKey === true) &&
      (event.which === 61 ||
        event.which === 107 ||
        event.which === 173 ||
        event.which === 109 ||
        event.which === 187 ||
        event.which === 189)
    ) {
      event.preventDefault()
    } else if (
      (event.ctrlKey === true || event.metaKey === true) &&
      (event.which === 96 || event.which === 48)
    ) {
      Message.closeAll()
    }
  })
  window.addEventListener(
    'mousewheel',
    event => {
      if (event.ctrlKey === true || event.metaKey) {
        event.preventDefault()
      }
    },
    {
      passive: false,
    }
  )
}
function alert() {
  const ratio = detectZoom()
  if (ratio < 100) {
    Message.warning({
      message: '页面显示比例异常，请尝试 Ctrl + 数字0 修复这个问题',
      duration: 0,
      showClose: true,
    })
  }
}
function apply() {
  alert()
  preventDefault()
}

export default apply
