/*
 * @Author: hasee
 * @Date:   2017-04-16 22:20:41
 * @Last Modified by:   yuhengyu
 * @Last Modified time: 2017-05-10 14:37:42
 */

'use strict'
import * as types from './mutations_types'

export default {
  add_tags_condition: ({ commit }, tag) => {
    commit(types.ADD_TAGS_CONDITION, tag)
  },
  save_data_info: ({ commit }, dataInfo) => {
    commit(types.SAVE_DATA_INFO, dataInfo)
  },
}
