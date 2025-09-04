/*
 * @Author: yuhengyu
 * @Date:   2017-04-18 10:29:44
 * @Last Modified by:   yuhengyu
 * @Last Modified time: 2017-04-18 10:59:25
 */

'use strict'
import axios from 'axios'

export default {
  getData(callback) {
    axios
      .get('/main/dataPreview')
      .then(res => {
        callback(res.data)
      })
      .catch(error => {
        console.log(error)
      })
  },
}
