enum IndexType {
  BASIC, // 基础
  DERIVE, // 衍生
  FORK// 派生
}
const IndexTypeLabel = ['原子指标', '衍生指标', '派生指标']
const IndexTypeLabelEn = ['Basic', 'Derive', 'Fork']

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

enum SafeLevel {
  Normal,
  Important,
  Danger,
}
const SafeLevelLabel = ['一般', '保密', '绝密']

export {
  IndexType,
  IndexTypeLabel,
  IndexTypeLabelEn,
  FormatMethod,
  FormatMethodLabel,
  DefaultGraph,
  DefaultGraphLabel,
  SafeLevel,
  SafeLevelLabel,
}
