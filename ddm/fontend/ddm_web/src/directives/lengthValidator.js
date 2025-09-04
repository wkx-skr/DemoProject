const lengthValidator = {
  bind: function (el, binding, vnode) {
    el.classList.add('length-validator-container')
    // 根据 绑定的 el input 元素, 找到 input 元素
    const elInput = el.querySelector('input')
    // 绑定报错信息元素, 并隐藏
    const errMsg = document.createElement('p')
    let maxLength = binding.arg
    if (maxLength && !isNaN(maxLength - 0)) {
      maxLength = maxLength - 0
    } else {
      maxLength = 50
    }
    errMsg.innerHTML = `<span class="directive-error-message">长度不能超过${maxLength}个字符</span>`
    el.appendChild(errMsg)
  },
  componentUpdated (el, binding, vnode) {
    // update 时, 校验 输入值长度
    // 校验失败, 显示错误信息, 成功, 隐藏错误信息
    const vaule = binding.value
    let maxLength = binding.arg
    if (maxLength && !isNaN(maxLength - 0)) {
      maxLength = maxLength - 0
    } else {
      maxLength = 50
    }
    if (vaule && vaule.length > maxLength) {
      // 长度超出, 显示错误信息
      el.classList.add('show-error')
    } else {
      // 隐藏 错误信息
      el.classList.remove('show-error')
    }
  },
  unbind: function (el) {}
}

export default lengthValidator
