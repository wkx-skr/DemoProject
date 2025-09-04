<script>
export default {
  name: 'similarityCheckTask',
  components: {
    DomainSimilarityList: () =>
      import('../newDataStandard/DomainSimilarityList.vue'),
    DomainSimilarityJob: () =>
      import('../similarityCheckTask/DomainSimilarityJob.vue'),
  },
  data() {
    return {
      activeTabName: 'result',
    }
  },
  methods: {
    handleTabClick() {},
  },
}
</script>

<template>
  <div class="similarity-check-task-page">
    <el-tabs v-model="activeTabName" @tab-click="handleTabClick">
      <el-tab-pane
        label="检查结果"
        name="result"
        style="height: calc(100vh - 140px)"
      >
        <DomainSimilarityList style="height: calc(100% - 40px)" />
      </el-tab-pane>
      <el-tab-pane
        label="数据标准-相似标准检查任务"
        name="task"
        style="height: calc(100vh - 140px)"
      >
        <DomainSimilarityJob />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.similarity-check-task-page {
  background: white;
  padding: 10px 20px;
  height: 100%;
}
</style>
