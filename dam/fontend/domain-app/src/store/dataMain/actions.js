/*
 * @Author: hasee
 * @Date:   2017-04-16 22:20:41
 * @Last Modified by:   yuhengyu
 * @Last Modified time: 2017-04-27 14:58:40
 */

'use strict'
import * as types from './mutations_types'

export default {
  save_data_obj: ({ commit }, obj) => {
    commit(types.SAVE_DATA_OBJ, obj)
  },
}
