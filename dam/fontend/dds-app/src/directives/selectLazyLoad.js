let selectLazyLoad = {
  bind(el, binding) {
    let SELECT_DOM =
      el.querySelector('.el-select-dropdown .el-select-dropdown__wrap') || el
    SELECT_DOM.addEventListener('scroll', function () {
      let condition =
        this.scrollHeight - this.scrollTop <= this.clientHeight + 0.5
      if (condition) {
        binding.value()
      }
    })
  },
}
export default selectLazyLoad
