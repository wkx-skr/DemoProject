- # 任务相关REST API

  ## 启动任务 Success!

  **接口URL：** `/main/startJob`

  **请求方法：** POST

  **请求参数：**
  - 任务ID (Long)：必填
  - 执行任务人员 (String)：必填

  **接口描述：** 启动任务

  ---

  ## 查询任务列表, 包含关联表数据 Success!

  **接口URL：** `/main/query/jobs/byDto`

  **请求方法：** POST

  **请求参数：**
  - JobQueryDto (RequestBody)：查询条件

  **接口描述：** 查询任务列表，包含关联表数据

  ---

  ## 根据commonJob，查询任务数据 Success!

  **接口URL：** `/main/query/jobs/byCriteria`

  **请求方法：** POST

  **请求参数：**
  - QueryParameterCriteria (RequestBody)：查询条件

  **接口描述：** 根据commonJob，查询任务数据

  ---

  ## 根据CommonJobResult，查询任务执行结果 Success!

  **接口URL：** `/main/query/jobResults/byCriteria`

  **请求方法：** POST

  **请求参数：**
  - QueryParameterCriteria (RequestBody)：查询条件

  **接口描述：** 根据CommonJobResult，查询任务执行结果

  ---

  ## 根据RunningEvent，查询消息 Success!

  **接口URL：** `/main/query/jobEvents/byCriteria`

  **请求方法：** POST

  **请求参数：**
  - QueryParameterCriteria (RequestBody)：查询条件

  **接口描述：** 根据RunningEvent，查询消息

  ---

  ## 修改任务调度时间

  **接口URL：** `/main/rescheduleJob`

  **请求方法：** POST

  **请求参数：**
  - 任务ID (Long)：必填
  - 调度时间cron表达式 (String)：必填

  **接口描述：** 修改任务调度时间

  ---

  ## 停止任务

  **接口URL：** `/main/stopJob`

  **请求方法：** POST

  **请求参数：**
  - 任务执行ID (Long)：必填

  **接口描述：** 停止任务

  ---

  ## 启用任务 Success!

  **接口URL：** `/main/enableJob`

  **请求方法：** POST

  **请求参数：**
  - 任务ID (Long)：必填

  **接口描述：** 启用任务

  ---

  ## 禁用任务 Success!

  **接口URL：** `/main/disableJob`

  **请求方法：** POST

  **请求参数：**
  - 任务ID (Long)：必填

  **接口描述：** 禁用任务