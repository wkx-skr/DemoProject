/*
 * @Author: hasee
 * @Date:   2017-04-16 22:38:47
 * @Last Modified by:   yuhengyu
 * @Last Modified time: 2017-04-27 14:55:05
 */

'use strict'
import * as types from './mutations_types.js'

export default {
  [types.SAVE_DATA_OBJ](state, obj) {
    state.dataMainObj = obj
  },
}
