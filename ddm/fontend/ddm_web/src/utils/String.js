export default {
  appendLeadingZero(data) {
    let number = data
    if (typeof number === 'string') {
      number = Number.parseInt(data)
    }
    if (typeof number !== 'number') {
      return false
    }
    if (number < 10) {
      return '0' + number
    } else {
      return number
    }
  },
  nl2br(value) {
    if (value) {
      return value.replace(/\n/g, '<br>')
    } else {
      return ''
    }
  },
  underLine2Hump(str) {
    const arr = str.split('_')
    if (arr.length > 1) {
      str = arr
        .map(item => {
          const str = item.toLowerCase()
          return str.replace(str[0], str[0].toUpperCase())
        })
        .join('')
      return str.replace(str[0], str[0].toLowerCase())
    } else {
      return str
    }
  },
  setClipBoard(str) {
    let result = false
    const input = document.createElement('input')
    input.setAttribute('readonly', 'readonly')
    input.setAttribute('value', str)
    document.body.appendChild(input)
    input.focus()
    input.select()
    input.setSelectionRange(0, str.length)
    if (document.execCommand('copy')) {
      document.execCommand('copy', false, null)
      result = true
    }
    document.body.removeChild(input)
    return result
  },
  // 计算字符串存储时的长度
  getLength(str){
    let realLength = 0, len = str.length, charCode = -1
    for (let i = 0; i < len; i++) {
      charCode = str.charCodeAt(i)
      if (charCode >= 0 && charCode <= 128)
         realLength += 1;
      else
         realLength += 2;
    }
    return realLength
  },
  cutByLength(str = '', length) {
    let realLength = 0, len = str.length, charCode = -1
    let result = ''
    for (let i = 0; i < len; i++) {
      charCode = str.charCodeAt(i)
      if (charCode >= 0 && charCode <= 128) {
        realLength += 1;
      } else {
        realLength += 2;
      }
      if (!result && realLength > length) {
        result = str.substring(0, i)
        break
      }
    }
    return result || str
  },
}
