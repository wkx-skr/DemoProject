<template>
  <div class="report-details" :class="{'hide-breadcrumbs': hideBreadcrumbs}">
    <div class="head-breadcrumb">
      <datablau-breadcrumb
        class="top-bread"
        :node-data="displayPath"
        :couldClick="false"
        @back="goBack"
      ></datablau-breadcrumb>
    </div>
    <div class="report-component-detail" v-loading="!currentModel">
      <report
        v-if="currentModel"
        ref="reportComponent"
        :detail="currentModel"
        :current-path="currentPath"
        :hideList="true"
        @hideTabs="hideTabsChange"
      >
      </report>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import report from '@/views/list/report/list.vue'
import store from '@/store'

export default {
  name: 'reportReview',
  data () {
    return {
      displayPath: ['审批管理'],
      currentPath: '',
      currentModel: null,
      hideBreadcrumbs: false
    }
  },
  props: {
    reviewReportId: {
      type: [String, Number],
      required: true
    }

  },
  components: {
    report
  },
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      this.getReportDetail()
        .then(res => {
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    async getReportDetail () {
      let reportDetail = null
      let modelDetail = null
      try {
        reportDetail = await HTTP.getReport({ id: this.reviewReportId })
        modelDetail = reportDetail.model
      } catch (e) {
        this.$showFailure(e)
        // 没有权限, 退回前页面
        this.$goBack()
        return
      }
      modelDetail.modelName = modelDetail.name
      this.currentPath = reportDetail.categories.join('/')
      this.displayPath = reportDetail.categories
      this.displayPath.shift()
      this.currentModel = modelDetail
      try {
        let permission = await HTTP.getModelPermission({ modelId: reportDetail.modelId }) || {}
        this.$set(this.currentModel, 'permission', permission)
      } catch (e) {
        this.$showFailure(e)
      }
      this.$refs.reportComponent?.handleRowClick(reportDetail)
    },
    goBack () {
      this.$router.go(-1)
      // this.$router.push({
      //   name: 'dashboard'
      // })
    },
    hideTabsChange (hideTabs) {
      this.hideBreadcrumbs = hideTabs
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.report-details {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  .head-breadcrumb {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 40px;
    padding: 8px 0 0 20px;
  }

  .report-component-detail {
    position: absolute;
    left: 0;
    top: 40px;
    right: 0;
    bottom: 0;
  }

  &.hide-breadcrumbs {
    .report-component-detail {
      top: 0;
    }
  }
}
</style>
