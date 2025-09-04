const chineseJson = require('@/resource/version/chinese.json')
const englishJson = require('@/resource/version/english.json')
const json = window.lang === 'English' ? englishJson : chineseJson
export default json
