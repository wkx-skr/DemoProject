const resize = { // 指令的名称
  bind (el, binding) { // el为绑定的元素，binding为绑定给指令的对象
    //   console.log(el,"绑定",binding);
    let width = ''; let height = ''
    function isReize () {
      const style = document.defaultView.getComputedStyle(el)
      if (width !== style.width || height !== style.height) {
        binding.value({ width: style.width, height: style.height }) // 关键(这传入的是函数,所以执行此函数)
      }
      width = style.width
      height = style.height
    }
    el.__vueSetInterval__ = setInterval(isReize, 300)
  },
  unbind (el) {
    // console.log(el,"解绑");
    clearInterval(el.__vueSetInterval__)
  }
}
export default resize
