enum AttrsTypeEnum {
    LEVEL = 'DATA_SECURITY_LEVEL', // 数据安全
    IMPORTANCE ='DATA_IMPORTANCE', // 重要程度
    OBJECT = 'DATA_INFLUENCE_OBJECT', // 影响对象
    SCOPE = 'DATA_INFLUENCE_SCOPE', // 影响范围
    DEGREE = 'DATA_IMPACT_DEGREE', // 影响程度
}
enum assetsTypeEnum {
    CATALOG = 'CATALOG', // 目录
    INFO_OBJECT ='INFO_OBJECT', // 信息项
    DATA_COLLECTION = 'TABLE', // 数据表
    VIEW = 'VIEW', // 视图
    DATA_OBJECT = 'DATA_OBJECT', // 数据项
}
enum ruleTypeEnum {
    GENERAL_RULE = 'GENERAL_RULE', // 一般规则
    CONSANGUINITY_CASCADE ='CONSANGUINITY_CASCADE', // 血缘级联规则
    MACHINE_LEARNING = 'MACHINE_LEARNING', // 机器学习规则
}
let executeAction = [
  { label: 'SELECT', value: 'SELECT' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'DROP', value: 'DROP' },
  { label: 'ALTER', value: 'ALTER' },
  { label: 'INDEX', value: 'INDEX' },
  { label: 'LOCK', value: 'LOCK' },
  { label: 'ALL', value: 'ALL' },
  { label: 'READ', value: 'READ' },
  { label: 'WRITE', value: 'WRITE' },
  { label: 'REPL_ADMIN', value: 'REPL_ADMIN' },
  { label: 'SERVICE_ADMIN', value: 'SERVICE_ADMIN' },
  { label: 'TEMPORARY_UDF_ADMIN', value: 'TEMPORARY_UDF_ADMIN' },
  { label: 'REFRESH', value: 'REFRESH' },
  { label: 'SELECT_ALL', value: 'SELECT_ALL' },
  { label: 'DESELECT_ALL', value: 'DESELECT_ALL' },
]
export {
    AttrsTypeEnum,
    assetsTypeEnum,
    ruleTypeEnum,
    executeAction
}
