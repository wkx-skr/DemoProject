# 数据库查询参数说明

## 页大小
- 标题: 页大小
- 描述: 页大小
- 数据类型: 整数
- 字段名: pageSize

## 当前页
- 标题: 当前页
- 描述: 当前页
- 数据类型: 整数
- 字段名: currentPage

## 任务名
- 标题: 任务名
- 描述: 任务名
- 数据类型: 字符串
- 字段名: name

## 任务类型
- 标题: 任务类型
- 描述: 任务类型
- 数据类型: 字符串
- 字段名: type

## 任务状态
- 标题: 任务状态
- 描述: 任务状态
- 数据类型: DatablauJobStatus
- 字段名: status

## 排序字段名
- 标题: 排序字段名
- 描述: 排序字段名
- 数据类型: 字符串
- 字段名: orderName

## 排序方式
- 标题: 排序方式
- 描述: 排序方式
- 数据类型: 字符串
- 字段名: orderBy

## 是否禁用
- 标题: 是否禁用
- 描述: 是否禁用
- 数据类型: 布尔值
- 字段名: disable

## 服务器类型
- 标题: 服务器类型
- 描述: 跟服务器类型查询所有任务
- 数据类型: 字符串
- 字段名: appName

## resourceId
- 标题: resourceId
- 描述: 任务关联资源ID
- 数据类型: 字符串
- 字段名: resourceId



```java
public enum DatablauJobStatus {
    NOT_RUN(0),
    INIT(DatablauJobStatusCode.SC_INITED),
    CREATED(DatablauJobStatusCode.SC_CREATED),
    PREPARED(DatablauJobStatusCode.SC_PREPARED),
    RUNNING(DatablauJobStatusCode.SC_RUNNING),
    FINISHED(DatablauJobStatusCode.SC_FINISHED),
    STOPPED(DatablauJobStatusCode.SC_STOPPED),
    FAILED(DatablauJobStatusCode.SC_FAILED),
    SKIPPED(DatablauJobStatusCode.SC_SKIPPED);
    
    private int statusCode;
    
    private DatablauJobStatus(int statusCode) {
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}

```

