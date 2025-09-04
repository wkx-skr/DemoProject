// form 表单校验函数
export default {
  // 非空校验
  notEmptyRequired: (rule, value, callback) => {
    value = _.trim(value)
    if (value || value === 0) {
      callback()
    } else {
      callback(new Error(rule.message || '该项不能为空'))
    }
  },
  // 长度校验
  maxLengthCustom(length) {
    return function (rule, value, callback) {
      if (value && value.length > length) {
        callback(new Error(`长度不能超过${length}个字符`))
      } else {
        callback()
      }
    }
  },
  // 校验 数据类型是否为数字
  numberRequired: (rule, value, callback) => {
    if (!isNaN(value - 0)) {
      callback()
    } else {
      callback(new Error('请填入数字'))
    }
  },
  // 数字必须 大于等于0
  numberRequiredGtZero: (rule, value, callback) => {
    if (!isNaN(value - 0) && value >= 0) {
      callback()
    } else {
      callback(new Error('请填入大于等于0的数字'))
    }
  }
}
