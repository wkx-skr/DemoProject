/*
 * @Author: hasee
 * @Date:   2017-04-16 22:38:47
 * @Last Modified by:   Nicky
 * @Last Modified time: 2017-05-12 11:49:06
 */

'use strict'
import * as types from './mutations_types.js'

export default {
  [types.SET_NAV_OPEN](state) {
    state.width = '210px'
    state.hidden = false
  },
  [types.SET_NAV_CLOSE](state) {
    state.width = '50px'
    state.hidden = true
  },
}
