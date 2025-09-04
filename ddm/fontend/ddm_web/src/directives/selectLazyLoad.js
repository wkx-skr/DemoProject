let selectLazyLoad = {
  bind (el, binding) {
    let SELECT_DOM =
      el.querySelector('.el-select-dropdown .el-select-dropdown__wrap') || el
    SELECT_DOM.addEventListener('scroll', function () {
      let num = $(SELECT_DOM).hasClass('hightNum') ? 50 : 0.5
      let condition =
        this.scrollHeight - this.scrollTop <= this.clientHeight + num
      if (condition) {
        binding.value()
      }
    })
  }
}
export default selectLazyLoad
