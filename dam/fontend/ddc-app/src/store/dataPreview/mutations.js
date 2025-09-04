/*
 * @Author: hasee
 * @Date:   2017-04-16 22:38:47
 * @Last Modified by:   yuhengyu
 * @Last Modified time: 2017-05-10 14:37:54
 */

'use strict'
import * as types from './mutations_types.js'

export default {
  [types.ADD_TAGS_CONDITION](state, tag) {
    state.selectedTags.push(tag)
  },
  [types.SAVE_DATA_INFO](state, dataInfo) {
    state.dataInfo = dataInfo
  },
}
