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
    const input = document.createElement('textarea')
    input.setAttribute('readonly', 'readonly')
    input.value = str
    document.body.appendChild(input)
    input.focus()
    document.execCommand('selectAll', false, null)
    if (document.execCommand('copy')) {
      document.execCommand('copy', false, null)
      result = true
    }
    document.body.removeChild(input)
    return result
  },
}
