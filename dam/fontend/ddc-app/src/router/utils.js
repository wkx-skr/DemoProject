/*
 * @Author: yuhengyu
 * @Date:   2017-05-06 22:33:56
 * @Last Modified by:   yuhengyu
 * @Last Modified time: 2017-05-09 14:49:13
 */

'use strict'
export const errorNotifycation = _this => {
  _this.$notify.error({
    title: 'error',
    message:
      window.lang == 'English'
        ? 'error while importing your data'
        : '数据异常,请重新导入',
  })
}
