enum ShapeType {
  GROUP,
  STEP,
  COLUMN
}
enum StepType {
  INPUT,
  OUTPUT,
  PROCESS,
  CURSOR,
  CURSOR_VAR,
  IS_CURRENT,
  METRICS = 101,
  REPORT = 102
}
export {
  ShapeType,
  StepType
}
