{
  const setting = {
    version: {
      dam: '8.0.0',
      date: '2025年4月',
    },
    logo: 'datablau',
    // #sso=true
    // #logo=jiashi/datablau/other
    // ############################ COMMENT ############################
    // #  If you want to show our default styles and pages,set         #
    // #  logo=datablau. When logo equals 'jiashi' or 'datablau',   #
    // #  the other settings will be ignored. To enable other settings,#
    // #  set logo=other                                               #
    // #################################################################
    title: 'DATABLAU数据资产管理平台',
    damName: 'Datablau数据架构平台',
    ddmName: 'Datablau数据建模平台',
    ddcName: '数据资产目录服务平台',
    showLogo: 'false',
    // #mainColor=#479EFF
    // #lightColor=#d1E5FF
    // #itemHoverColor=#67AEFF

    // ############################ COMMENT ############################
    // #  If you want a user with role "ROLE_USER" alone change        #
    // #  direction to 'ddc.html' after login ,set this configuration  #
    // #  to true.
    // damEnabled: 'true', // 已废弃, 直接从后台读取
    ddcFirst: 'false',
    esconnectable: 'true',
    ignoreComponentViewerAccess: 'false',

    // ############################  SSO 配置   ######################################
    ssoLoginUrl: 'https://dataarchitecture.pipechina.com.cn:18080/base/sso/login',
    ssoLogoutUrl: '',

    // ############################ COMMENT ############################
    // #  If you want filter domains discarded  and under development  #
    // #  above domains tree. set this configuration to true           #
    supportFilterDomainsUnderDevelopment: 'false',
    restApiPathName: '',
    iconApiPathName: '',
    workflowApiPathName: '/workflow',
    newProduct: [
      /* '数据安全' */
    ],

    // ############################  特殊配置   ######################################
    // 异步请求业务目录和标签，不阻塞页面。 默认关闭，如遇由于接口返回过慢导致长时间白屏可以尝试开启，但开启可能会导致部分页面出现异常，请谨慎使用
    doNotWaitCatalogAndTag: false,
    // 总是使用元数据驾驶舱，默认不开启。
    alwaysUseMetadataDashboard: false,

    // ########################### Gateway #############################
    // testApi填写一个get方式的，用于检测当前服务是否联通。如果会造成不利影响，可以让后台专门开发一个API用于检测
    // gatewayEnable: true, // 配置项废弃, 默认为 true 不能修改
    currentProduct: 'dam',
    products: {
      dam: {
        hostname: '', // ip 或者域名, 默认为当前页面, dam 和 ddm 相同
        serverPath: '/dam',
        webPath: '/',
        frontendPort: '',
        testApi: '/dam/service/userInfo',
      },
      ddm: {
        hostname: '', // ip 或者域名, 默认为当前页面, dam 和 ddm 相同
        serverPath: '/ddm',
        webPath: '/ddm-web/',
        frontendPort: '',
        testApi: '/ddm/service/main/loginInfo',
      },
    },
    homePageScreenEnable: false, // 默认隐藏资产大屏菜单
  }

  setting.gatewayEnable = true

  

  function formatterProduct(product) {
    product.webPath = product.webPath || location.pathname
    product.hostname = product.hostname || location.hostname
    product.urlPrefix =
      product.urlPrefix || location.protocol + '//' || 'http://'

    let defaultPort = product.urlPrefix === 'http://' ? 80 : 443
    product.frontendPort = product.frontendPort || location.port || defaultPort
    return product
  }

  formatterProduct(setting.products.dam)
  formatterProduct(setting.products.ddm)

  setting.restApiPathName = setting.products.dam.serverPath || '/dam'

  setting.agentRe = {
    // 数据源中添加Agent类型
    enable: true,
  }

  if (!window.setting) {
    window.setting = setting
  }
}
