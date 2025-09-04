<template>
  <div class="citic-card-tabs">
    <el-tabs
      type="card"
      v-model="currentTab"
      @tab-remove="removeTab"
      :class="{ 'hide-tab': !showTabs }"
    >
      <!-- table tab -->
      <el-tab-pane label="任务列表" name="jobList">
        <div>
          <job-list @showJobDetail="showJobDetail"></job-list>
        </div>
      </el-tab-pane>

      <!-- edit tab-->
      <el-tab-pane
        v-for="(item, index) in editTabsArr"
        :key="item.name"
        :label="item.label"
        :name="item.name"
        closable
      >
        <detail
          :job="item.jobData"
          @closeUpdataTab="removeTab(item.name)"
          @updataJobs="updataJobs"
        ></detail>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
// import jobList from '@/components/jobManagement/systemJob.vue';
import jobList from './jobList.vue'
import detail from '@/components/jobManagement/jobDetail.vue'
export default {
  data() {
    return {
      editTabsArr: [],
      currentTab: 'jobList',
      showTabs: true,
    }
  },
  components: {
    jobList,
    detail,
  },
  computed: {},
  mounted() {},
  methods: {
    removeTab(name) {
      const index = this.editTabsArr.findIndex(item => item.name === name)
      if (index > -1) {
        this.editTabsArr.splice(index, 1)
      }
      this.currentTab = 'jobList'
    },
    showJobDetail(para) {
      const data = para.data
      const tab = {
        name: data.id + '',
        label: data.name,
        jobData: data,
      }
      this.addTab(tab)
    },
    addTab(tab) {
      const index = this.editTabsArr.findIndex(item => item.name === tab.name)
      if (index === -1) {
        this.editTabsArr.push(tab)
      }
      this.currentTab = tab.name
    },
    updataJobs(para) {},
  },
  watch: {},
}
</script>

<style lang="scss">
.citic-card-tabs {
  // top: 0;
}
</style>
