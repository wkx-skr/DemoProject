import PinyinMatch from 'pinyin-match'
export default {
  nl2br: (value) => {
    if (value) {
      return value.replace(/\n/g, '<br>')
    } else {
      return ''
    }
  },
  matchKeyword: (object, keyword, ...properties) => {
    let match = false
    properties.forEach(p => {
      if (object.hasOwnProperty(p) && typeof object[p] === 'string' && (object[p].toLowerCase().indexOf(keyword.toLowerCase()) > -1 || PinyinMatch.match(object[p], keyword))) {
        match = true
      }
    })
    return match
  },
  setClipBoard (str) {
    let result = false
    const textarea = document.createElement('textarea')
    textarea.readonly = 'readonly'
    textarea.value = str
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    // console.log(str, textarea.value, 'value')
    textarea.setSelectionRange(0, textarea.value.length)
    if (document.execCommand('copy')) {
      document.execCommand('copy', false, null)
      result = true
    }
    document.body.removeChild(textarea)
    return result
  },
  exportToFile (str, fileName) {
    const ele = document.createElement('a')
    ele.download = fileName
    ele.style.display = 'none'
    const blob = new Blob([str])
    ele.href = URL.createObjectURL(blob)
    document.body.appendChild(ele)
    ele.click()
    document.body.removeChild(ele)
  }
}
