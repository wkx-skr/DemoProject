const Mock = require('mockjs')

const List = []
const count = 100

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    author: '@first',
    reviewer: '@first',
    title: '@title(5, 10)',
    content_short: 'mock data',
    forecast: '@float(0, 100, 2, 2)',
    importance: '@integer(1, 3)',
    display_time: '@datetime',
    comment_disabled: true,
    platforms: ['a-platform']
  }))
}

module.exports = [
  {
    url: '/test/service/user/fake/data',
    type: 'put',
    response: config => {
      return {
        'code': 200,
        'relatedVideos': null,
        'playlist': List
      }
    }
  }
]
