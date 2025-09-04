/*
 * @Author: yuhengyu
 * @Date:   2017-05-02 17:26:54
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-06-10 17:27:21
 */

'use strict'
import vThis from '@/http/main.js'
const lengthCtrl = (value, length) => {
  if (value.length > length) {
    return value.substr(0, length) + '...'
  } else {
    return value
  }
}

function getUser(val) {
  return new Promise(resolve => {
    const usernames = [val]
    vThis.$http
      .post(`/user/usermanagement/user/getUsersByUsernames`, _.uniq(usernames))
      .then(res => {
        resolve(res.data[0].firstName)
      })
  })
}
const getname = async val => {
  const result = await getUser(val)
  return result
}

export default {
  lengthCtrl,
  getname,
}
