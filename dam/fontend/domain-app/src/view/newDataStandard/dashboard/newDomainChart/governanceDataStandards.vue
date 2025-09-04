<template>
  <!-- 治理数据标准量（个） governanceDataStandards -->
  <div class="dashboard-item">
    <div class="title">治理数据标准量（个）</div>
    <div class="content">
      <div class="number">
        {{ count }}
        <span style="color: black">({{ badCount }})</span>
      </div>
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main'

export default {
  name: 'governanceDataStandards',
  data() {
    return {
      count: 0, // 默认值
      badCount: 0,
      loading: false,
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      // 使用getDomainCount接口获取治理数据标准量
      this.$http
        .post('/domain/domains/getDomainCount')
        .then(res => {
          if (res.data) {
            // 已废弃的个数（即被治理的数量）
            this.count = res.data.allDomain || 0
            this.badCount = res.data.abolishDomain || 0
          }
        })
        .catch(e => {
          console.error('获取治理数据标准量失败', e)
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
