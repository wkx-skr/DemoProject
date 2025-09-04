enum AttrsTypeEnum {
    LEVEL = 'DATA_SECURITY_LEVEL', // 数据安全
    IMPORTANCE ='DATA_IMPORTANCE', // 重要程度
    OBJECT = 'DATA_INFLUENCE_OBJECT', // 影响对象
    SCOPE = 'DATA_INFLUENCE_SCOPE', // 影响范围
    DEGREE = 'DATA_IMPACT_DEGREE', // 影响程度
    SENSITIVE = 'DATA_SENSITIVE', // 敏感数据
}
enum assetsTypeEnum {
    INFO_OBJECT ='INFO_OBJECT', // 信息项
    DATA_OBJECT = 'DATA_OBJECT', // 数据项 dataItem
    DATA_COLLECTION ='DATA_COLLECTION', // 表  
    DOMAIN = 'DOMAIN', // 数据标准
    INDEX = 'INDEX', // 数据指标
    REPORT = 'REPORT', // 报表
    FILE = 'FILE', // 文件
    DATA_SERVICE = 'DATA_SERVICE', // 数据服务
    DATA_STANDARD = 'DATA_STANDARD', // 基础标准
    DATA_STANDARD_CODE = 'DATA_STANDARD_CODE', // 标准代码
    CATALOG = 'CATALOG', // 目录
    TABLE = 'TABLE', // 表
    VIEW = 'VIEW', // 视图
}
enum ruleTypeEnum {
    GENERAL_RULE = 'GENERAL_RULE', // 一般规则
    CONSANGUINITY_CASCADE ='CONSANGUINITY_CASCADE', // 血缘级联规则
    MACHINE_LEARNING = 'MACHINE_LEARNING', // 机器学习规则
}
enum accessType {
    ACCESS_STRATEGY = 'ACCESS_STRATEGY',
    ACCESS_ROW_STRATEGY = 'ACCESS_ROW_STRATEGY',
    ACCESS_DATAMASK_COLUMN = 'ACCESS_DATAMASK_COLUMN',
    ACCESS_DATAMASK_TABLE = 'ACCESS_DATAMASK_TABLE',
}
let executeAction = [
  { label: 'SELECT', value: 'SELECT', disabled: true },
  { label: 'INSERT', value: 'INSERT' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
//   { label: 'CREATE', value: 'CREATE' },
//   { label: 'DROP', value: 'DROP' },
//   { label: 'ALTER', value: 'ALTER' },
//   { label: 'INDEX', value: 'INDEX' },
//   { label: 'LOCK', value: 'LOCK' },
//   { label: 'ALL', value: 'ALL' },
//   { label: 'READ', value: 'READ' },
//   { label: 'WRITE', value: 'WRITE' },
//   { label: 'REPL_ADMIN', value: 'REPL_ADMIN' },
//   { label: 'SERVICE_ADMIN', value: 'SERVICE_ADMIN' },
//   { label: 'TEMPORARY_UDF_ADMIN', value: 'TEMPORARY_UDF_ADMIN' },
//   { label: 'REFRESH', value: 'REFRESH' },
//   { label: 'SELECT_ALL', value: 'SELECT_ALL' },
//   { label: 'DESELECT_ALL', value: 'DESELECT_ALL' },
]
export {
    AttrsTypeEnum,
    assetsTypeEnum,
    ruleTypeEnum,
    accessType,
    executeAction
}
