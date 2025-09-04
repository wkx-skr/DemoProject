# http 请求全局防抖

- 事件背景

新增数据时, 用户点击按钮, 向后台发送请求, 同时, 按钮需要置灰禁用, 但是项目中大部分按钮没有这项功能, 并且修改的优先级较低, 所以加了一个全局的防抖拦截器, 会根据 method, url 和 data 判断拦截 http 请求,
当有一个完全相同的请求还未返回时, 第二个请求会被拦截, 并保持请求中的状态。

- 代码逻辑
  - 创建一个map, 保存了需要拦截的请求,
  - 创建全局对象 requestMap, 保存已经发送而没有返回的api,
  - 第一次发送请求时, 判断是否是需要拦截的api, 如果是, 根据 http 请求的 method, url 和 data, 生成id, 保存 http 请求到 requestMap
  - 每次请求前, 判断是否有相同 id 的请求还未返回
  - 如果已经存在相同 id 的请求, 生成一个 状态为 'pending' 的 promise, 并保持
  - 如果没有, 正常发送请求, 并利用 id 将请求存储到全局对象 requestMap 中,
  - 在请求返回时, 无论是否成功, 清除全局对象中保存的请求 id
  - 注意:
    - 由于存在多个请求嵌套的问题，所以请求没有设置成全局，必须是每个需要拦截的请求单独填写
    - 发送请求前, 生成定时器, 到期后在全局对象中清除请求 id, 这是为了应对请求超时的问题, 这个超时时间可以修改, 默认是 120s, 即 120s 后可以再次发起相同的 http 请求
    - 对于数据量较大, 处理较慢的 http 请求, 建议在按钮上增加独立的 loading 或 disable 效果

- 实现方式:
  - 使用 axios 时, 从 `duplicateCancel.js` 中引入 `duplicateCancel, dupTestError, failureRemoveKey, removeCancelKey` 方法, 加入到
    axios 的全局对象 与 实例 的拦截器中, 由于 axios 的实例并没有继承全局对象的拦截器, 所以所以axios 实例都需要手动添加拦截器:
  ```javascript
  // 对所有实例增加 过滤器, 对 http 请求统一处理
  // 其他实例 如 $wHttp, 手动调用
  let instanceAddInterceptors = (instance) => {
  
    instance.interceptors.request.use(utils.urlFilter)
  
    // 全局处理短时间的重复的 http 请求
    // 超时清理时间: 120s
    instance.interceptors.request.use(duplicateCancel, dupTestError)
    instance.interceptors.response.use(removeCancelKey, failureRemoveKey)
  }
  
  // 遍历实例, 调用, 加载拦截器
  // 如果实例较多, 可以覆盖 axios 的 create 方法, 在生成实例时, 直接调用
  // https://github.com/axios/axios/issues/993
  [axios, $http, $plainRequest, $http_blob].forEach(instance => {
    instanceAddInterceptors(instance)
  })
  
  ```
  - 当使用 fetch 时, 需要所有的 fetch 被包装在对象中, 代码中 http 请求调用的是外层对象才可以使用全局过滤, ddm 中使用了 `NormalRequest.js` 对 fetch 进行包装,
    在其中引入 `duplicateCancel.js` 中的 ` duplicateTest, duplicateTestRemoveMap` 方法, 分别在请求发送前后调用, 当 `duplicateTest` 返回 true,
    意味着请求需要被拦截, 就替换成 pending 的 promise

  ```javascript
  let fetchConfigObj = {
    url,
    ...requestConfig
  }
  let response
  if (duplicateTest(fetchConfigObj)) {
    response = await new Promise(() => {
    })
  } else {
    response = await fetch(url, requestConfig).catch(e => {
      location.href = `/datablau.html`
    }).finally(() => {
      duplicateTestRemoveMap(fetchConfigObj)
    })
  }
  ```

- 使用方式:

找到需要拦截的 api, 将 api 添加到 `http/main.js` 的 `filterApiArr` 数组中, url 中带参数的用 `{}` 括住。例如:

```javascript
const filterApiArr = [
  {"method": "POST", "url": "/entities/search"},
  {"method": "DELETE", "url": "/usermanagement/groups/{groupId}"},
  {method: 'PUT', url: '/modelCategories/{categoryId}'},
  {method: 'GET', url: '/api/test/{apiId}'},
  {method: 'POST', url: '/domains/latest/page'}
]
```
