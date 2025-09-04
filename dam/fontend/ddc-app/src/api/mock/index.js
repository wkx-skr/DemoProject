/*
 * @Author: yuhengyu
 * @Date:   2017-04-18 10:34:04
 * @Last Modified by:   yuhengyu
 * @Last Modified time: 2017-05-03 14:03:34
 */

'use strict'
import Mock from 'mockjs'

import { dataDetails } from './mock.data.js'
import { dataMain } from './mock.dataMain.js'
import { dataPreview } from './mock.dataPreview.js'

/* function addToMock(list){
  list.forEach(val => {
    Mock.mock(val.path,val.data);
  })
}
*/

Mock.mock(dataDetails.path, dataDetails.data)

Mock.mock(dataMain.path, dataMain.data)

Mock.mock(dataPreview.path, dataPreview.data)

export default Mock
