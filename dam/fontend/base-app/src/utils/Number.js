const utils = {
  value2percent(value, precision = 2) {
    if (isNaN(value - 0)) {
      value = 0
    } else {
      value = value - 0
    }
    let isRealZero = value === 0
    let minus = false
    if (value < 0) {
      value *= -1
      minus = true
    }
    let result = 0
    result = value * Math.pow(10, precision)
    result = Math.round(result) / Math.pow(10, precision)
    // console.log('round result: ', result)
    if (minus) {
      result *= -1
    }
    // result = result.toFixed(precision)
    if (isNaN(result)) {
      result = 0
    }
    if (result === 0 && !isRealZero) {
      result = result.toFixed(precision)
    }
    return result
  },
  /**
   * 利用 , 分隔数字
   * @param val
   * @returns {string}
   */
  insertComma(val = 0) {
    // val = 30004001
    let result = ''
    if (!val && val !== 0) {
      return '0'
    }
    do {
      let mo = val % 1000
      if (val > 1000) {
        if (mo < 10) {
          mo = '00' + mo
        } else if (mo < 100) {
          mo = '0' + mo
        }
      }
      result = mo + ',' + result
      val = parseInt(val / 1000)
    } while (val > 0)
    return result.slice(0, -1)
  },
  /**
   * 利用 K, M, B 等替换数字后几位, 并插入 , 分隔
   * @param val
   * @returns {string}
   */
  numberSuffixFormatter(val = 0) {
    if (!val && val !== 0) {
      val = 0
    }
    if (isNaN(val)) {
      val = 0
    }
    let sub = ''
    if (val > Math.pow(10, 9)) {
      val = utils.value2percent(val / Math.pow(10, 9))
      sub = 'B'
    }
    if (val > Math.pow(10, 6)) {
      val = utils.value2percent(val / Math.pow(10, 6))
      sub = 'M'
    }
    if (val > Math.pow(10, 3)) {
      val = utils.value2percent(val / Math.pow(10, 3))
      sub = 'K'
    }
    val = val + sub
    return val
  },
}

export default utils
