enum Auth {
  PROJECT_MANAGE, // 项目管理
  PROJECT_DEMAND, // 开发需求
  PROJECT_MEMBER, // 成员管理
  PROJECT_PUBLISH, // 发布管理
  PROJECT_LOG, // 日志管理
  PROJECT_ANALYSIS, // 血缘解析
  MODEL_VIEW, // 模型浏览
  MODEL_EDIT, // 模型编辑
  PROCEDURE_VIEW, // 程序浏览
  PROCEDURE_EDIT, // 程序编辑
  WORKFLOW_MANAGEMENT // 工作流
}
const AuthLabel = [
  '项目管理',
  '开发需求',
  '成员管理',
  '发布管理',
  '日志管理',
  '血缘解析',
  '模型浏览',
  '模型编辑',
  '程序浏览',
  '程序编辑',
  '工作流'
]
export {
  Auth, AuthLabel
}
