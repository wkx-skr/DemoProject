<template>
  <!-- 标准规范数据（个） standardSpecificationData -->
  <div class="dashboard-item">
    <div class="title">标准规范数据（个）</div>
    <div class="content">
      <div class="number">{{ count }}</div>
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main'

export default {
  name: 'standardSpecificationData',
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
      // 使用getDomainCount接口获取标准被引用到资产目录DL5的次数
      this.$http
        .get('/assets/dashboard/getAssetsDomainNum')
        .then(res => {
          if (res.data) {
            // 这里应该是标准被引用到资产目录DL5的次数
            // 根据接口返回的数据结构进行处理
            this.count = res.data.data || 0
          }
        })
        .catch(e => {
          console.error('获取标准规范数据失败', e)
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
  font-size: 16px;
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
