/*
 * @Author: hasee
 * @Date:   2017-04-16 22:20:41
 * @Last Modified by:   yuhengyu
 * @Last Modified time: 2017-05-05 15:09:06
 */

'use strict'
import * as types from './mutations_types'

export default {
  set_nav_open: ({ commit }) => {
    commit(types.SET_NAV_OPEN)
  },
  set_nav_close: ({ commit }) => {
    commit(types.SET_NAV_CLOSE)
  },
}
