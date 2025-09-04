import { Button } from 'element-ui'

const durationTime = 500
// props 增加 durationTime 属性, 定义点击被节流的时间
Button.props.durationTime = {
  type: Number,
  default: durationTime,
}
Button.methods.handleClick = function handleClick(evt) {
  // 根据 lastClickTime 时间判断是否需要节流
  let now = new Date().getTime()
  if (!this.lastClickTime || this.lastClickTime < now - this.durationTime) {
    this.$emit('click', evt)
    // 保存上次点击生效时间
    this.lastClickTime = new Date().getTime()
  } else {
    console.warn(
      `重复点击做了节流处理, 点击事件 ${durationTime}ms 内仅生效一次, 具体信息请查看 'customButton.js' 文件`
    )
  }
}
export default { Button }
