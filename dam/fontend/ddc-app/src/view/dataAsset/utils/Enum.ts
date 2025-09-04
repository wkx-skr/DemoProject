enum AssetsTypeEnum {
  DATA_OBJECT = 'DATA_OBJECT', // 数据项 dataItem
  DATA_COLLECTION = 'DATA_COLLECTION', // 数据表
  REPORT = 'REPORT', // 报表
  FILE = 'FILE', // 文件
  CATALOG = 'CATALOG', // 目录
  TABLE = 'TABLE', // 数据表
  VIEW = 'VIEW', // 视图
  DOMAIN = 'DOMAIN', // 数据标准
  INDEX = 'INDEX', // 数据指标
  DATA_STANDARD = 'DATA_STANDARD', // 基础标准
  DATA_STANDARD_CODE = 'DATA_STANDARD_CODE', // 标准代码
  META_MODEL = 'METAMODEL_OBJECT', // 元模型 METAMODEL_OBJECT
}

enum AttrsTypeEnum {
  LEVEL = 'DATA_SECURITY_LEVEL', // 数据安全
  IMPORTANCE = 'DATA_IMPORTANCE', // 重要程度
  OBJECT = 'DATA_INFLUENCE_OBJECT', // 影响对象
  SCOPE = 'DATA_INFLUENCE_SCOPE', // 影响范围
  DEGREE = 'DATA_IMPACT_DEGREE', // 影响程度
  SENSITIVE = 'DATA_SENSITIVE', // 敏感数据
}

enum IndexType {
  BASIC, // 基础
  // DERIVE, // 衍生
  FORK, // 派生
}

// const IndexTypeLabel = ['基础指标', '衍生指标', '派生指标']
const IndexTypeLabel = ['基础指标', '派生指标']
const IndexTypeLabelEn = ['Basic', 'Derive']

enum SafeLevel {
  Normal,
  Important,
  Danger,
}

const SafeLevelLabel = ['一般', '保密', '绝密']

enum FormatMethod {
  MANUAL,
  AUTO,
}

const FormatMethodLabel = ['手工填报', '系统加工']
const FormatMethodLabelEn = ['Manual', 'Auto']

enum DefaultGraph {
  ROW,
  LINE,
}

const DefaultGraphLabel = ['柱图', '折线']

export {
  IndexType,
  IndexTypeLabel,
  IndexTypeLabelEn,
  SafeLevel,
  SafeLevelLabel,
  AssetsTypeEnum,
  AttrsTypeEnum,
  FormatMethod,
  FormatMethodLabel,
  DefaultGraph,
  DefaultGraphLabel,
}
