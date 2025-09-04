export default {
  sort: (array, propertyName = 'name', order = 'ascending') => {
    if (!array) {
      return
    }
    if (!propertyName) {
      return false
    }
    array.sort((a, b) => {
      let [aVal, bVal] = [a[propertyName], b[propertyName]]
      if (!aVal && aVal !== 0) {
        aVal = ''
      }
      if (!bVal && bVal !== 0) {
        bVal = ''
      }
      let isInt = (parseInt(aVal) || parseInt(aVal) === 0) && (parseInt(bVal) || parseInt(bVal) === 0)
      if (!isInt) {
        aVal += ''
        bVal += ''
      }
      if (isInt) {
        return parseInt(aVal) - parseInt(bVal)
      } else if (aVal.toLowerCase() > bVal.toLowerCase()) {
        return 1
      } else {
        return -1
      }
    })
    if (order !== 'ascending') {
      array.reverse()
    }
  },
  sortConsiderChineseNumber: (array, propertyName = 'name', order = 'ascending') => {
    if (!array) {
      return
    }
    let chineseArr = { '零': 1, '一': 2, '二': 3, '三': 4, '四': 5, '五': 6, '六': 7, '七': 8, '八': 9, '九': 10, '十': 11 }
    let reg = /^[\u4E00-\u9FA5]+$/

    function isDigit (ch) {
      let code = ch.charCodeAt()
      return code >= 48 && code <= 57
    }

    function isChineseDigit (ch) {
      return chineseArr[ch] && true
    }

    function isChinese (ch) {
      return reg.test(ch)
    }

    function isEnglishChar (ch) {
      let reg = /^[A-Za-z]$/
      return reg.test(ch)
    }

    function sort (str1, str2) {
      // sort: number, English, Chinese, other
      let i = 0
      for (; i < str1.length; i++) {
        // The str2 shorter than str1, and they have the same prefix
        if (str2.length === i) {
          return 1
        }

        let ch1 = typeof str1[i] === 'string' ? str1[i].toUpperCase() : ''
        let ch2 = typeof str1[i] === 'string' ? str2[i].toUpperCase() : ''

        if (ch1 === ch2) {
          continue
        }

        if (isDigit(ch1)) {
          if (isDigit(ch2)) {
            return ch1.charCodeAt() - ch2.charCodeAt()
          } else {
            return -1
          }
        }

        if (isEnglishChar(ch1) && isEnglishChar(ch2)) {
          return ch1.localeCompare(ch2)
        } else if (isEnglishChar(ch1) || isEnglishChar(ch2)) {
          if (isDigit(ch2)) {
            return 1
          } else {
            return isEnglishChar(ch1) ? -1 : 1
          }
        }

        if (isChineseDigit(ch1)) {
          if (isDigit(ch2)) {
            return 1
          } else if (isChineseDigit(ch2)) {
            return chineseArr[ch1] - chineseArr[ch2]
          } else if (isChinese(ch2)) {
            return -1
          } else {
            return ch1.localeCompare(ch2)
          }
        }

        if (isChinese(ch1)) {
          if (isDigit(ch2)) {
            return 1
          } else if (isChineseDigit(ch2)) {
            return 1
          } else {
            return ch1.localeCompare(ch2)
          }
        }

        return ch1.localeCompare(ch2)
      }

      return str1.length - str2.length
    }

    let callback = (a, b) => {
      let [aVal, bVal] = [a[propertyName], b[propertyName]]
      if (!aVal && aVal !== 0) {
        aVal = ''
      }
      if (!bVal && bVal !== 0) {
        bVal = ''
      }
      let result = 0
      if (!isNaN(aVal - 0) && !isNaN(bVal - 0)) {
        result = (aVal - 0) - (bVal - 0)
      } else {
        result = sort(aVal, bVal)
      }
      return result
    }
    array.sort(callback)
    if (order !== 'ascending') {
      array.reverse()
    }
  }
}
