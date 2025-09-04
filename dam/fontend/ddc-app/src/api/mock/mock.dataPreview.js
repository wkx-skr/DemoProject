/*
 * @Author: yuhengyu
 * @Date:   2017-05-03 13:43:03
 * @Last Modified by:   yuhengyu
 * @Last Modified time: 2017-05-03 13:58:45
 */

'use strict'
import { data_Preview } from '../urls.js'
export const dataPreview = {
  path: data_Preview,
  data: {
    pageInfo: {
      last: true,
      first: true,
      totalElements: 1,
      totalPages: 1,
      size: 100,
      number: 0,
      sort: null,
      numberOfElements: 0,
    },
    content: [
      {
        objectId: 116,
        physicalName: 'test.csv',
      },
    ],
  },
}
