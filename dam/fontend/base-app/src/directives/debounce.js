let debounce = {
  inserted: function (el, binding) {
    let timer
    el.addEventListener('keyup', () => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        binding.value()
      }, 300)
    })
  }
}
export default debounce
