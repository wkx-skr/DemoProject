const pageMapDdsGw = {
  "$t('common.page.安全网关')": {
    "$t('common.page.gatewayManager')": [
      "dataSecurityGateway",
      "logAudit",
      "logging",
    ],
  }
}
const pageIconDdsGw = {
  "$t('common.page.gatewayManager')": 'icon-menu-aqwg',
}
const pageTreeDdsGw = {
  dataSecurityGateway: {
    name: "dataSecurityGateway", // 安全网关
    label: "$t('common.page.dataSecurityGateway')",
    vueRouter: "/main/dataSecurityGateway",
    appName: "dds-app",
    accessRequired: ["MAIN_DATA_AUTH_SECURITY_GATEWAY"],
    licenseRequired: ['FE_JDBC_GATEWAY'],
  },
  logAudit: {
    name: "logAudit", // 日志审计
    label: "日志审计",
    vueRouter: "/main/logAudit",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_GATEWAY_AUDIT"],
    licenseRequired: ['FE_JDBC_GATEWAY'],
  },
  logging: {
    name: "logging", // 安全操作日志
    label: "安全操作日志",
    vueRouter: "/main/logging",
    appName: "dds-app",
    accessRequired: ["DATA_SECURITY_OP_LOG"],
    licenseRequired: ['FE_JDBC_GATEWAY'],
  },
}
export default {
  ddsGwPageMap: pageMapDdsGw,
  ddsGwIconMap: pageIconDdsGw,
  ddsGwPageTree: pageTreeDdsGw
}
