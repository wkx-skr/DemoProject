export default {
  data() {
    return {}
  },
  mounted() {},
  methods: {
    getOriData() {
      let obj = {
        typeSelectWraper: this.typeSelectWraper, // 数据库
        customConnection: this.customConnection, // 自定义连接串
        driverValue: this.driverValue, // 驱动
        dbtype: this.dsform.dbtype, // 数据库
        jarName: this.dsform.jarName, // JAR名称
        driverClassname: this.dsform.driverClassname, // 驱动名称--输入的
        connUrl: this.dsform.connUrl, // 连接串
        hostname: this.dsform.hostname, // 服务器名称 || 中转库地址 ||EndPoint
        dbport: this.dsform.dbport, // 端口 || Zookeeper端口 ||EndPoint
        HBaseMasterPort: this.dsform.HBaseMasterPort, // master端口
        HBaseRegionserverPort: this.dsform.HBaseRegionserverPort, // Regionserver端口
        AuthenticationType: this.AuthenticationType, // 授权方式
        // delimiter: this.dsform.delimiter, // 分隔符   CSV类型--已删除
        // IsFirstRowColumnName: this.dsform.IsFirstRowColumnName, // 首行为列名   CSV类型--已删除

        sharePath: this.dsform.sharePath, // 文件路径   --文件类资产所有
        showSmbUserPw: this.showSmbUserPw, // 使用用户名密码  --文件类资产所有
        // description: this.dsform.description, // 描述  --文件类资产所有

        username: this.dsform.username, // 用户名 || 中转库用户名 || AK ID   应该不用
        password: this.dsform.password, // 密码 || 中转库密码 || AK Secret  应该不用
        ESwithSsl: this.ESwithSsl, // 使用ssl
        testPw: this.testPw, // 修改密码  应该不用

        ServicePrincipal: this.dsform.ServicePrincipal, // 服务认证规则
        UserPrincipal: this.dsform.UserPrincipal, // 用户认证规则
        extraDbPara: this.dsform.extraDbPara, // 连接模式
        ScanSize: this.dsform.ScanSize, // 扫描数量(行)
        Encoding: this.dsform.Encoding, // 字符编码
        targetType: this.targetType, // 目标类型
        preDbnames: this.preDbnames, // 数据库 || SID || Service Name
        dbname: this.dsform.dbname, // 数据库
        KeyStorePath: this.dsform.KeyStorePath, // KeyStore路径
        KeyStorePass: this.dsform.KeyStorePass, // KeyStore密码
        schemaSelected: this.schemaSelected, // Schema || Indices
        OfflineDumpTargetSchemaName: this.OfflineDumpTargetSchemaName, // Schema || Indices
        OfflineDumpRealDBType: this.dsform.OfflineDumpRealDBType, // 生产数据库类型
        OfflineDumpTargetDBName: this.OfflineDumpTargetDBName, // 生产数据库
        OfflineProSchema: this.OfflineProSchema, // 生产schema
        // owner: this.dsform.owner, // 所有者
        BlackListAppliedTypeIds: this.BlackListAppliedTypeIds, // 黑名单
        SelectedBlackList: this.SelectedBlackList, // 黑名单
        dataConnectValue: this.dataConnectValue, // 数据连接性
        dataSampling: this.dataSampling, // 数据采样性
        backupDatasourceValue: this.backupDatasourceValue, // 备用数据源
        InstanceName: this.InstanceName, // Server Instance
      }
      return obj
    },
  },
}
