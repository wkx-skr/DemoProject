export default {
  sort: (array, propertyName = 'name', order = 'ascending') => {
    if (!propertyName) {
      return false
    }
    array &&
      array.sort((a, b) => {
        let [aVal, bVal] = [a[propertyName], b[propertyName]]
        if (!aVal && aVal !== 0) {
          aVal = ''
        }
        if (!bVal && bVal !== 0) {
          bVal = ''
        }
        const isInt =
          (parseInt(aVal) || parseInt(aVal) === 0) &&
          (parseInt(bVal) || parseInt(bVal) === 0)
        if (!isInt) {
          aVal += ''
          bVal += ''
        }
        if (isInt) {
          return parseInt(aVal) - parseInt(bVal)
        } else if (
          a[propertyName] &&
          b[propertyName] &&
          a[propertyName].toLowerCase() > b[propertyName].toLowerCase()
        ) {
          return 1
        } else {
          return -1
        }
      })
  },
  sortConsiderChineseNumber: (
    array,
    propertyName = 'name',
    order = 'ascending',
    treatDigitAsChar = false
  ) => {
    const chineseArr = {
      零: 1,
      一: 2,
      二: 3,
      三: 4,
      四: 5,
      五: 6,
      六: 7,
      七: 8,
      八: 9,
      九: 10,
      十: 11,
    }
    const reg = /^[\u4E00-\u9FA5]+$/

    function isDigit(ch) {
      const code = ch.charCodeAt()
      return code >= 48 && code <= 57
    }

    function isChineseDigit(ch) {
      return chineseArr[ch] && true
    }

    function isChinese(ch) {
      return reg.test(ch)
    }

    function isEnglishChar(ch) {
      const reg = /^[A-Za-z]$/
      return reg.test(ch)
    }

    function sort(str1, str2) {
      // sort: number, English, Chinese, other
      let i = 0
      for (; i < str1.length; i++) {
        // The str2 shorter than str1, and they have the same prefix
        if (str2.length === i) {
          return 1
        }

        const ch1 = str1[i] /* .toUpperCase() */
        const ch2 = str2[i] /* .toUpperCase() */

        if (ch1 === ch2) {
          continue
        }
        if (!isDigit(ch1) && !isChinese(ch1) && !isEnglishChar(ch1)) {
          return 1
        } else if (!isDigit(ch2) && !isChinese(ch2) && !isEnglishChar(ch2)) {
          return -1
        }
        if (isDigit(ch1)) {
          if (isDigit(ch2)) {
            return ch1.charCodeAt() - ch2.charCodeAt()
          } else {
            return -1
          }
        }

        if (isEnglishChar(ch1) && isEnglishChar(ch2)) {
          return ch1.charCodeAt() - ch2.charCodeAt()
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
      }
      return str1.length - str2.length
    }

    const callback = (a, b) => {
      if (a.order && b.order) {
        if (a.order === b.order) {
        } else {
          return a.order - b.order
        }
      }
      if (a.order && !b.order) {
        return -1
      }
      if (!a.order && b.order) {
        return 1
      }
      let [aVal, bVal] = [a[propertyName], b[propertyName]]
      if (!aVal && aVal !== 0) {
        aVal = ''
      }
      if (!bVal && bVal !== 0) {
        bVal = ''
      }
      let result
      if (treatDigitAsChar) {
        result = sort(aVal, bVal)
      } else {
        let intA = parseInt(aVal)
        let intB = parseInt(bVal)
        if (!isNaN(intA) && !isNaN(intB)) {
          result = intA - intB
        } else {
          result = sort(aVal, bVal)
        }
      }
      return result
    }
    array && array.sort(callback)
    if (order !== 'ascending') {
      array && array.reverse()
    }
  },
}
