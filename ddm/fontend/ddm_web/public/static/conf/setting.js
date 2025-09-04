var setting = {
  version: {
    ddm: '7.0.7'
  },
  logo: 'custom',
  // #sso=true
  // #logo=jiashi/datablau/other
  // ############################ COMMENT ############################
  // #  If you want to show our default styles and pages,set         #
  // #  logo=datablau. When logo equals 'jiashi' or 'datablau',   #
  // #  the other settings will be ignored. To enable other settings,#
  // #  set logo=other                                               #
  // #################################################################

  title: '数据建模平台',
  titleD3: '数据模型开发平台',
  enTitle: 'DDM Web',
  damName: 'Datablau数据治理平台',
  ddmName: 'Datablau数据建模平台',
  ddmNameEn: 'Data Model Web Portal',
  ddcName: '数据资产目录服务平台',
  showLogo: 'true',
  showBackBtn: 'true',
  editorTheme: 'black',
  // #mainColor=#479EFF
  // #lightColor=#d1E5FF
  // #itemHoverColor=#67AEFF

  // ############################ COMMENT ############################
  // #  If you want a user with role "ROLE_USER" alone change        #
  // #  direction to 'ddc.html' after login ,set this configuration  #
  // #  to true.
  // damEnabled: 'true', // 是否可以跳转到 dam, 已废弃, 直接从后台读取
  ddcFirst: 'false',
  esconnectable: 'true',
  ignoreComponentViewerAccess: 'false',

  // ############################ COMMENT ############################
  // #  If you want filter domains discarded  and under development  #
  // #  above domains tree. set this configuration to true           #
  restApiPathName: '/ddm',
  licenseServerUrl: 'http://192.168.1.150:18083/ddm-license-server/service/index.html',
  workflowApiPathName: '/workflow',
  showLicenseServer: true,
  showConflictMerge: true,
  // ############################  SSO 配置   ######################################
  ssoLoginUrl: 'https://dataarchitecture.pipechina.com.cn:18080/base/sso/login',
  ssoLogoutUrl: '',
  // ########################### Gateway #############################
  // gatewayEnable: true, // 配置项废弃, 默认为 true 不能修改
  // testApi填写一个get方式的，用于检测当前服务是否联通。如果会造成不利影响，可以让后台专门开发一个API用于检测
  // TODO 7.0 dam 的属性,占位, 后续要移除
  servicesAlive: {},
  currentProduct: 'ddm',
  products: {
    dam: {
      hostname: '', // ip 或者域名, 默认为当前页面, dam 和 ddm 相同
      serverPath: '/metadata',
      webPath: '/base-app/',
      frontendPort: '',
      testApi: '/dam/service/userInfo'
    },
    ddm: {
      hostname: '', // ip 或者域名, 默认为当前页面, dam 和 ddm 相同
      serverPath: '/ddm',
      webPath: '/ddm-app/',
      frontendPort: '',
      testApi: '/ddm/service/main/loginInfo'
    },
    'base-app': {
      hostname: '',
      serverPath: '/base',
      webPath: '/base-app/',
      frontendPort: ''
    },
    'user-app': {
      hostname: '',
      serverPath: '/user',
      webPath: '/user-app/',
      frontendPort: ''
    },
    'domain-app': {
      hostname: '',
      serverPath: '/domain',
      webPath: '/domain-app/',
      frontendPort: ''
    },
    // ddt: {
    //   hostname: '', // ip 或者域名, 默认为当前页面, dam 和 ddm 相同
    //   serverPath: '/ddd',
    //   webPath: '/ddd-web/',
    //   frontendPort: '',
    //   testApi: '/ddm/service/main/loginInfo'
    // },
    ddd: {
      hostname: '', // ip 或者域名, 默认为当前页面, dam 和 ddm 相同
      serverPath: '/ddd',
      webPath: '/ddd-app/',
      frontendPort: '',
      testApi: '/ddm/service/main/loginInfo'
    },
    dds: {
      hostname: '', // ip 或者域名, 默认为当前页面, dam 和 ddm 相同
      serverPath: '/dolphinscheduler',
      webPath: '/ddd-app/',
      frontendPort: '',
      testApi: '/ddm/service/main/loginInfo'
    }
  },
  language: 'Chinese'
}

setting.gatewayEnable = true

// 程序执行更新按钮是否开启
setting.sqlRunRefresh = false

function formatterProduct (product) {
  product.webPath = product.webPath || location.pathname
  product.hostname = product.hostname || location.hostname
  product.urlPrefix = product.urlPrefix || location.protocol + '//' || 'http://'

  let defaultPort = product.urlPrefix === 'http://' ? 80 : 443
  product.frontendPort = product.frontendPort || location.port || defaultPort
  return product
}

formatterProduct(setting.products.dam)
formatterProduct(setting.products.ddm)
// formatterProduct(setting.products.ddt)
formatterProduct(setting.products.ddd)
formatterProduct(setting.products.dds)
formatterProduct(setting.products['base-app'])
formatterProduct(setting.products['domain-app'])
formatterProduct(setting.products['user-app'])

window.setting = setting
