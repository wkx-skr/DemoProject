<template>
  <!-- 当年累计处理审批流程（次） cumulativeApprovalsPerYear -->
  <div class="dashboard-item">
    <div class="title">当年累计处理审批流程（次）</div>
    <div class="content">
      <div class="number">{{ count }}</div>
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main'

export default {
  name: 'cumulativeApprovalsPerYear',
  data() {
    return {
      count: 0, // 默认值
      loading: false,
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      // 使用getDomainCount接口获取当年累计处理审批流程次数
      this.$http
        .post('/workflow/task/domainDone')
        .then(res => {
          if (res.data) {
            // 计算总和
            this.count = res.data || 0
          }
        })
        .catch(e => {
          console.error('获取审批流程数据失败', e)
          // 保留默认值
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<style scoped>
.dashboard-item {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.title {
  font-size: 12px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.number {
  font-size: 56px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@media screen and (max-width: 1366px) {
  .number {
    font-size: 48px;
  }

  .title {
    font-size: 14px;
  }
}
</style>
