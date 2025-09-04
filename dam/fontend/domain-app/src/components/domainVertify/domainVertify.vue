<template>
  <div class="domain-vertify-page">
    <!-- title -->
    <datablau-page-title
      :parent-name="$t('domain.verification.verification')"
      :name="$t('domain.verification.domainLandingVerification')"
      v-if="showHome"
    ></datablau-page-title>
    <datablau-breadcrumb
      v-else
      style="
        height: 40px;
        background: #fff;
        display: flex;
        align-items: center;
        margin: 0 20px;
        border-bottom: 1px solid var(--border-color-lighter);
      "
      :node-data="breadcrumbData"
      :separator="'/'"
      :couldClick="false"
      @back="backClick"
      @nodeClick="nodeClick"
    ></datablau-breadcrumb>
    <!-- content -->
    <!-- first page -->
    <div class="data-security-tab" v-if="showHome">
      <div class="top-echart-line">
        <div class="left-top all-system-count">
          <system-echart
            :getData="getPieData"
            :colorMap="colorMap"
            :matchType="matchType"
            @setPieData="setPieData"
            ref="totalCount"
          ></system-echart>
        </div>
        <div class="right-top group-by-system">
          <every-system-count
            :colorMap="colorMap"
            :getData="getESystemData"
            :statusMap="statusMap"
            :matchType="matchType"
            @setEsystemData="setEsystemData"
            ref="systemCount"
          ></every-system-count>
        </div>
        <div class="job-info">
          <div class="last-time">
            <datablau-button size="mini" @click="jobManagement">
              {{ $t('domain.verification.manageVerificationJob') }}
            </datablau-button>
          </div>
        </div>
      </div>
      <div class="bottom-table">
        <column-table
          ref="columnTable"
          :matchType="matchType"
          @editCol="editCol"
          @updataColData="updataColData"
        ></column-table>
      </div>
    </div>
    <!-- second page -->
    <div
      v-if="!showHome && currentPageName === 'tabPage'"
      class="citic-card-tabs domainVertify-tabs"
    >
      <datablau-tabs v-model="currentTab" @tab-click="tabClick">
        <el-tab-pane
          v-for="tab in tabsConstArr"
          :label="tab.label"
          :name="tab.name"
          :key="tab.id + tab.name"
        >
          <job-detail
            v-if="currentPageData.type === 'jobDetail'"
            ref="showJobDetail"
            :job="verJobData"
          ></job-detail>
          <choose-datasource
            v-else-if="currentPageData.type === 'showDadaSource'"
            ref="showDadaSource"
            :choosedModels="choosedModels"
            @chooseDatasource="handleChangeModel"
            :domainVertify="true"
          ></choose-datasource>
        </el-tab-pane>
      </datablau-tabs>
    </div>
    <edit-security
      v-if="
        !showHome &&
        currentPageName === 'editDomain' &&
        currentPageData.type === 'edit'
      "
      :oldData="currentPageData.oldData"
      :matchType="matchType"
      @updateDomVerInfo="updateDomVerInfo"
      @cancel="removeTab(currentPageData.name)"
    ></edit-security>
  </div>
</template>

<script>
import systemEchart from './systemCountEchart.vue'
import everySystemCount from './everySystemCount.vue'
import columnTable from './columnTable.vue'
import editSecurity from './editVertify.vue'
import jobDetail from '@/components/jobManagement/jobDetail.vue'
import chooseDatasource from '@/components/inteligentFind/chooseTableItem.vue'

export default {
  data() {
    return {
      // breadcrumbData
      showHome: true,
      breadcrumbData: [],
      breadcrumbData1: [
        this.$t('domain.verification.domainLandingVerification'),
      ],
      breadcrumbData2: [
        this.$t('domain.verification.domainLandingVerification'),
        this.$t('domain.common.preview'),
      ],
      // options：1. tabPage === sweep range+run time 2. editDomain
      currentPageName: 'tabPage',
      currentPageData: {},
      matchType: {
        match: this.$t('domain.verification.completeMapping'),
        partMatch: this.$t('domain.verification.partialMapping'),
        notMatch: this.$t('domain.verification.canNotMap'),
      },
      // TODO i18n
      statusMap: {
        完全匹配: 'match',
        部分映射: 'partMatch',
        无法映射: 'notMatch',
      },
      defaultTabName: 'showDadaSource',
      currentTab: 'showDadaSource',
      getPieData: null,
      getESystemData: null,
      getAllPubDomain: null,
      tabsArr: [],
      tabsConstArr: [
        {
          id: 1,
          label: this.$t('domain.verification.setScanDataSource'),
          name: 'showDadaSource',
        },
      ],
      // TODO i18n
      colorMap: {
        default: '#CCCCCC',
        完全映射: '#32d790',
        部分映射: '#409eff',
        无法映射: '#f49837',
      },
      jobLastEndTime: this.$t('domain.common.none'),
      ifJobRunning: false,
      verJobData: null,
      jobContent: null,
      timerArr: [],
      choosedModels: [],
      modelJobData: {},
    }
  },
  components: {
    systemEchart,
    everySystemCount,
    columnTable,
    editSecurity,
    jobDetail,
    chooseDatasource,
  },
  computed: {
    showTabs() {
      const arr = this.tabsArr
      return arr && Array.isArray(arr) && arr.length > 0
    },
  },
  beforeMount() {
    if (this.$route.query.edit === 'on') {
      this.$datablauLoading.loading({
        text: this.$t('domain.common.loadingText'),
        color: '#409EFF',
        background: '#fff',
        // closeOnClickModal: true,
      })
    }
    this.setGetAllPubDomain()
    this.dataInit()
  },
  mounted() {
    this.$bus.$on('goBackHome', this.backClick)
    // let currentDomainVertifyObj = this.$store.state.currentDomainVertifyObj
    if (this.$route.query.edit === 'on') {
      const currentDomainVertifyObj = JSON.parse(
        localStorage.getItem('domainVertifyObj')
      )
      if (currentDomainVertifyObj) {
        setTimeout(() => {
          this.editCol(currentDomainVertifyObj)
          this.$datablauLoading.close()
        }, 600)
      }
    }
    this.$bus.$on('modelData', data => {
      this.modelJobData = data
      this.getGetres()
    })
  },
  methods: {
    jobManagement() {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      /* window.open(
        baseUrl +
          `main/systemManage/jobManagement?selectedTypes=DomainVerifyJobDescriptor`
      ) */
      window.open(this.BaseUtils.RouterUtils.getFullUrl('jobScheduler', {
        selectedTypes: 'DomainVerifyJobDescriptor',
      }))
    },
    getGetres() {
      let jobCon = {
        modelId: this.modelJobData.modelId,
        modelName: this.modelJobData.definition,
      }
      this.$http
        .post(this.$url + '/service/datablau_jobs/getres ', jobCon)
        .then(res => {
          const jobData = res.data.commonJob
          this.verJobData = jobData
          this.jobDetailState = true
          const jobDetailId = 'jobDetail'
          this.currentPageData = {
            name: jobDetailId,
            label: this.$t('domain.verification.domainLandingJob'),
            id: jobDetailId,
            type: 'jobDetail',
            // oldData: col
          }
          if (this.tabsConstArr.length === 1) {
            this.tabsConstArr.push({
              id: 2,
              label: this.$t('domain.verification.domainLandingJob'),
              name: 'jobDetail',
            })
          }
          this.currentTab = jobDetailId
          this.currentPageName = 'tabPage'
          this.breadcrumbData = this.breadcrumbData2
          this.showHome = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // breadcrumb api
    backClick(e) {
      this.showHome = true
      this.tabsConstArr = this.tabsConstArr.filter(item => {
        return item.id !== 2
      })
      // this.breadcrumbData = [this.$version.nav.dataFind]
      // this.$message.success('back')
    },
    nodeClick(node) {
      let clickNode = node.name || node
      if (
        clickNode === this.$t('domain.verification.domainLandingVerification')
      ) {
        this.showHome = true
      }
    },
    tabClick(node) {
      this.currentTab = node.name
      node.name === 'showDadaSource' && this.showChooseDs()
      node.name === 'jobDetail' && this.showJobSetting()
      // if(node.name === 'showDadaSource') {
      //   const callback = () => {
      //     this.addTabsArr('showDadaSource')
      //   }
      //   this.getJob(callback)
      // } else {
      //   this.$nextTick(() => {
      //     this.currentTab = node.name
      //   })
      // }
    },
    dataInit() {
      this.setPieData()
      this.setEsystemData()
      // this.getVetJobDetail()
    },
    setPieData() {
      const url = `${this.$meta_url}/service/domains/domainVerifyPie`
      this.getPieData = this.$http.get(url)
    },
    setEsystemData() {
      const url = `${this.$meta_url}/service/domains/domainVerifyBar`
      this.getESystemData = this.$http.get(url)
    },
    getVetJobDetail() {
      const options = {
        pageSize: 20,
        currentPage: 1,
        type: 'DomainVerifyJobDescriptor',
      }
      this.$http
        .post(`${this.$url}/service/datablau_jobs/page`, options)
        .then(res => {
          const jobData = res.data.content[0]
          if (jobData && jobData.lastRunEndTime) {
            this.jobLastEndTime =
              this.$timeFormatter(jobData.lastRunEndTime) ||
              this.$t('domain.common.none')
          }
          this.verJobData = jobData
          if (jobData.status === 'RUNNING' || jobData.status === 'INIT') {
            this.checkJobStatus()
          }
          if (this.$utils.isJSON(this.verJobData.jobContent)) {
            const obj = JSON.parse(this.verJobData.jobContent)
            this.jobContent = obj
            const modelIds = obj.modelIds
            if (modelIds && Array.isArray(modelIds)) {
              this.choosedModels = modelIds
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleResize() {},
    editCol(col) {
      this.currentPageData = {
        name: col.objectId + '',
        label: col.objectPhysicalName,
        id: col.objectId,
        type: 'edit',
        oldData: col,
      }
      this.currentPageName = 'editDomain'
      let breadName = `${col.objectPhysicalName}(${col.domainName})`
      this.breadcrumbData1[1] = breadName
      this.breadcrumbData = this.breadcrumbData1
      this.showHome = false
      // this.addTab(tab)
    },
    showJobSetting() {
      // this.getVetJobDetail()
      // jobDetail
      const jobDetailId = 'jobDetail'
      this.currentPageData = {
        name: jobDetailId,
        label: this.$t('domain.verification.domainLandingJob'),
        id: jobDetailId,
        type: 'jobDetail',
        // oldData: col
      }
      this.currentTab = jobDetailId
      this.currentPageName = 'tabPage'
      this.breadcrumbData = this.breadcrumbData2
      this.showHome = false
      // this.addTab(tab)
    },
    showChooseDs() {
      const showDadaSource = 'showDadaSource'
      this.currentPageData = {
        name: showDadaSource,
        label: this.$t('domain.verification.setScanDataSource'),
        id: showDadaSource,
        type: 'showDadaSource',
      }
      this.currentTab = showDadaSource
      this.currentPageName = 'tabPage'
      this.breadcrumbData = this.breadcrumbData2
      this.showHome = false
      // this.addTab(tab)
    },
    removeTab(name) {
      this.showHome = true
    },
    addTab(tab) {
      const index = this.tabsArr.findIndex(item => {
        return item.id == tab.id
      })
      if (index === -1) {
        this.tabsArr.push(tab)
      }
      this.currentTab = tab.name
    },
    handleChangeModel(datasources) {
      const ids = datasources
      const json = JSON.parse(this.verJobData.jobContent)
      json.modelIds = ids
      this.$http
        .put(this.$url + '/service/datablau_jobs/' + this.verJobData.id, json)
        .then(res => {
          this.$message.success(this.$t('domain.common.modifySuccessfully'))
          this.getVetJobDetail()
          // this.removeTab('showDadaSource');
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshTable() {
      if (this.$refs.columnTable && this.$refs.columnTable.refreshTable) {
        this.$refs.columnTable.refreshTable()
      }
    },
    refreshEcharts() {
      if (this.$refs.totalCount && this.$refs.totalCount.refreshEchart) {
        this.$refs.totalCount.refreshEchart()
      }
      if (this.$refs.systemCount && this.$refs.systemCount.refreshEchart) {
        this.$refs.systemCount.refreshEchart()
      }
    },
    updateDomVerInfo(col) {
      this.removeTab(col.objectId + '')
      // this.refreshTable()
      // this.refreshEcharts()
      this.dataInit()
    },
    updataColData() {},
    setGetAllPubDomain() {
      // this.getAllPubDomain = this.$http.post(`${this.$url}/service/domains/latest/page`, obj);
    },
    runJob() {
      const jobId = this.verJobData ? this.verJobData.id : ''
      if (jobId) {
        this.$http
          .put(`${this.$url}/service/datablau_jobs/${jobId}/run`)
          .then(res => {
            this.checkJobStatus()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$showFailure(this.$t('domain.common.jobNotFind'))
      }
    },
    checkJobStatus() {
      let ifRunning = false
      if (this.timerArr.length > 1) {
        for (let i = 1, len = this.timerArr.length; i < len; i++) {
          clearTimeout(this.timerArr[i])
        }
      }
      const jobId = this.verJobData ? this.verJobData.id : ''
      if (jobId) {
        this.$http
          .get(`${this.$url}/service/datablau_jobs/${jobId}`)
          .then(res => {
            const data = res.data
            if (
              data &&
              data.status &&
              (data.status === 'RUNNING' || data.status === 'INIT')
            ) {
              const timer = setTimeout(this.checkJobStatus, 1000)
              this.timerArr.push(timer)
              ifRunning = true
            } else {
              this.refreshPage()
            }
            this.ifJobRunning = ifRunning
          })
          .catch(e => {
            console.log(e)
          })
      }
    },
    refreshPage() {
      this.refreshEcharts()
      this.refreshTable()
      // this.getVetJobDetail()
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.domain-vertify-page {
  position: relative;
  // border: 1px solid red;
  background-color: #fff;
  height: 100%;

  .new-page-card-tabs {
    top: 0;
    // height: 100%;
  }

  .data-security-tab {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    .page-title-row {
      padding: 0 10px 10px;
      .safe-page-title {
        display: inline-block;
        font-size: 22px;
        font-weight: bold;
        padding-top: 10px;
        line-height: 30px;
        // padding-bottom: 10px;
      }
    }
    .top-echart-line {
      position: relative;
      height: 300px;
      // padding: 0 10px 0px;
      margin: 0 20px;
      margin-bottom: 10px;
      border: 1px solid var(--border-color-lighter);
      border-left: none;
      border-right: none;
      .left-top,
      .right-top,
      .job-info {
        display: inline-block;
        // position: relative;
        // width: 400px;
        // border: 1px solid #eee;
        box-sizing: border-box;
        width: 20%;
        height: 100%;
      }
      .right-top {
        width: 65%;
      }
      .job-info {
        width: 14%;
        // border: 1px solid #eee;
        vertical-align: top;
        text-align: center;
        .last-time {
          padding-top: 50px;
          .tip-text {
            padding: 0 0 20px;
          }
          .job-setting {
            padding: 40px 0 20px;
          }
        }
      }
    }
    .bottom-table {
      position: absolute;
      top: 302px;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
  .hideTab {
    .data-security-tab {
      .bottom-table {
        top: 360px;
      }
    }
  }
  .job-detail-buttons {
    // position: initial
    position: fixed;
    left: 160px;
  }
}
</style>
<style lang="scss">
@import '~@/next/components/basic/color.sass';
.row-page-info {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 30px;
  height: 50px;
  padding-left: 26px;
  margin-right: -20px;
  margin-left: -30px;
  overflow-x: visible;
  overflow-y: hidden;
  line-height: 50px;
  border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);

  .check-info {
    display: inline-block;
    width: 14px;
    height: 14px;
    vertical-align: middle;
    background: $primary-color;
  }

  .footer-row-info {
    margin-right: 10px;

    &::before {
      margin-right: 5px;
      margin-left: -13px;
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      line-height: 13px;
      color: white;
      vertical-align: middle;
      content: '\e6da';
    }
  }
}
</style>
