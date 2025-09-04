import PinyinMatch from 'pinyin-match'

export function matchKeyword (object, keyword, ...properties) {
  let match = false
  properties.forEach(p => {
    if (
      object.hasOwnProperty(p) &&
      typeof object[p] === 'string' &&
      (object[p].toLowerCase().indexOf(keyword.toLowerCase()) > -1 ||
        PinyinMatch.match(object[p], keyword))
    ) {
      match = true
    }
  })
  return match
}

export default {
  matchKeyword
}
