let contextmenu = {
  bind: function (el, binding) {
    el.addEventListener('contextmenu', function (event) {
      event.preventDefault()
      binding.value(event, el)
    }, false)
  }
}

export default contextmenu
