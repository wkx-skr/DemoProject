exports.port = 8080
// const baseUrl = 'http://poc-01.datablau.cn:18080'
const baseUrl = 'http://172.16.198.248:18080'
// const baseUrl = 'http://172.16.198.167:12345'
// const baseUrl = 'http://192.168.5.245:18092'
// const baseUrl = 'http://192.168.7.208:18080'
// let baseUrl = 'http://192.168.7.158:18080'
// const ddtBaseUrl = 'http://192.168.7.158:18080'
// const ddtBaseUrl = 'http://192.168.7.158:12345'
// const ddtBaseUrl = 'http://172.16.198.248:18080'
const ddtBaseUrl = 'http://172.16.198.167:12345'
// const ddtBaseUrl = 'http://192.168.5.245:18092'




// baseUrl = 'http://192.168.5.246:18082'
// const baseUrl = 'http://192.168.7.200:18080' // 高可用
// const baseUrl = 'http://192.168.3.17:58080' // 英文环境
// const baseUrl = 'http://localhost:9001' // 本地
// const baseUrl = 'http://192.168.2.133:18080'

exports.proxy = {
  '/mock': {
    target: 'http://localhost:8080',
    pathRewrite: {
      '^/mock/': '/test/'
    }
  },
  '/ddd/': {
    target: baseUrl
  },
  '/dam/': {
    target: baseUrl
    // target: 'http://192.168.1.150:18079', // dam shut down
    // target: 'http://192.168.1.150:58080',
    // target: 'http://192.168.1.150:18080',
    // target: 'http://192.168.7.172:18080', // lishaohui
    // target: 'http://192.168.1.131:18080', // 王欣
    // target: 'http://192.168.3.224:18080', // weikai
    // target: 'http://one.datablau.cn:18080', // 销售演示
    // target: 'http://192.168.1.151:42810', // 5.8
    // target: 'http://office.datablau.cn:42686', // dds
    // target: 'http://2o11v66464.imwork.net'
    // target: 'http://2o11v66464.imwork.net'
  },
  '/ddm/': {
    target: baseUrl
    // target: 'http://192.168.1.150:58081',
    // target: 'http://localhost:8081',
    // target: 'http://192.168.1.150:18081',
    // target: 'http://192.168.7.172:18080', // lishaohui
    // target: 'http://192.168.1.131:18080', // 王欣
    // target: 'http://192.168.3.224:18080', // weikai
    // target: 'http://one.datablau.cn:18080', // 销售演示
    // target: 'http://192.168.1.151:42810', // 5.8
    // target: 'http://office.datablau.cn:42686', // dds
    // target: 'http://2o11v66464.imwork.net'
    // target: 'http://2o11v66464.imwork.net'
  },
  '/domain/': {
    target: baseUrl
    // target: 'http://192.168.1.150:18100', // master
    // target: 'http://192.168.1.150:58080', // master
    // target: 'http://192.168.5.209:18100', // lihuajun
    // target: 'http://192.168.3.224:18100', // weikai
  },
  '/gateway': {
    target: ddtBaseUrl
    // target: 'http://192.168.1.150:58080', // master
    // target: 'http://192.168.4.122:18082', // 李少辉
  },
  '/workflow/': {
    target: baseUrl
    // target: 'http://192.168.1.150:58080', // master
  },
  '/user/': {
    target: baseUrl
    // target: 'http://192.168.1.150:58080', // master
  },
  '/ddt/': {
    target: ddtBaseUrl
  },
  '/ddm-web/': {
    target: baseUrl
  }
}
