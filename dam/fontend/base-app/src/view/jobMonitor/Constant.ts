enum JobServerStatus {
  NOT_START,
  RUNNING,
  STOPPED
}
const JobServerStatusLabel: Array<string> = ['未运行', '运行中', '已停止']
enum JobFileStatus {
  SUCCESS,
  UPDATING,
  FAILED
}
const JobFileStatusLabel: Array<string> = ['成功', '正在更新', '失败']
const JobServerLabel = {
  datablau_domain: '数据标准服务',
  datablau_dataasset: '数据资产服务',
  datablau_datasecurity: '数据安全服务',
  datablau_dataquality: '数据质量服务',
  datablau_metadata: '元数据服务',
  datablau_dds: '数据服务服务',
  datablau_metric: '指标管理服务'
}
export {
  JobFileStatus,
  JobFileStatusLabel,
  JobServerStatus,
  JobServerStatusLabel,
  JobServerLabel
}
