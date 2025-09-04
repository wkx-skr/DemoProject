enum WarningLevel {
  EARLY_WARNING,
  WARNING,
  SERIOUS_WARNING
}
const WarningLevelLabel = ['警告', '预警', '严重预警']
const WarningLevelLabelEn = ['Warning', 'Alert', 'Critical Alert']

enum Schedule {
  YEAR,
  MONTH,
  WEEK,
  DAY
}
const ScheduleLabel = ['年', '月', '周', '日']
export {
  WarningLevel,
  WarningLevelLabel,
  WarningLevelLabelEn,
  Schedule,
  ScheduleLabel
}
