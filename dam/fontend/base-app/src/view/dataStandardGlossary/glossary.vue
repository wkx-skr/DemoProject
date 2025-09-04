<template>
  <div style="background: #fff">
    <datablau-dialog
      :width="'600px'"
      :height="'350px'"
      :title="editDialogData.label"
      v-if="showEditDialog"
      :visible.sync="showEditDialog"
    >
      <edit-glossary-tab
        :oldGlossary="editDialogData.glossary"
        @editFinish="editGlossaryFinish"
        v-if="showEditDialog && editDialogData.type === 'edit'"
        :hasAccess="hasAccess"
      ></edit-glossary-tab>
    </datablau-dialog>
    <datablau-page-title
      :parent-name="$t('common.page.domain')"
      :name="$t('common.page.glossary')"
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
    ></datablau-breadcrumb>
    <history-tab :glossary="currentGlossary" ref="historyTab"></history-tab>
    <div class="glossary-tabs" style="background: #fff">
      <glossary-tab
        @editGlossary="showEditGlossaryDialog"
        @showCheckResult="showCheckResult"
        @showHistory="showHistory"
        @downloadFile="downloadFile"
        @downloadGlossary="downloadGlossary"
        @showAddGlossaryDialog="showAddGlossaryDialog"
        @handleBeforeUpload="handleBeforeUpload"
        @onError="onError"
        @onSuccess="onSuccess"
        ref="glossaryTab"
        v-loading="onUpload"
        :hasAccess="hasAccess"
        :postUrl="postUrl"
        v-if="showHome"
      ></glossary-tab>
      <check-result-table
        class="check-result-table"
        v-else
        :chineseName="checkResultData.glossary.chName"
        :abbreviation="checkResultData.glossary.abbr"
      ></check-result-table>
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main'
import glossaryTab from './glossaryTab2.vue'
import editGlossaryTab from './editGlossaryTab.vue'
import checkResultTable from './checkResultTable.vue'
import historyTab from './historyTab.vue'

export default {
  components: {
    glossaryTab,
    editGlossaryTab,
    checkResultTable,
    historyTab,
  },
  inject: ['headerProduction'],
  data() {
    const glossaryUrl = this.$url + '/service/ns/'
    return {
      glossaryUrl: glossaryUrl,
      hasAccess: true,
      currentTab: 'glossaryTab',
      editTabsArr: [],
      // postUrl: glossaryUrl + 'job',
      postUrl: HTTP.nsUploadUrl(),
      onUpload: false,
      interval: null,
      typeMap: {
        check: 'check',
        edit: 'edit',
        history: 'history',
      },
      currentGlossary: {},
      showHome: true,
      breadcrumbData: [this.$t('domain.glossary.glossary')],
      showEditDialog: false,
      editDialogData: {},
      checkResultData: {},
    }
  },
  created() {
    this.hasAccess = !(
      this.headerProduction.toUpperCase() !== 'DAM' && this.$damEnabled
    )
  },
  methods: {
    // 面包屑组件api
    backClick(e) {
      this.showHome = true
      this.breadcrumbData.pop()
    },
    showAddGlossaryDialog() {
      this.editDialogData = {
        name: 'add',
        label: this.$t('domain.glossary.addGlossary'),
        id: 'add',
        type: 'edit',
        glossary: {
          nsId: 'add',
          label: this.$t('domain.glossary.addGlossary'),
        },
      }
      // this.addTab(tab)
      this.showEditDialog = true
    },
    showHistory(glossary) {
      this.currentGlossary = _.cloneDeep(glossary)
      this.$refs.historyTab && this.$refs.historyTab.showDialog()
    },
    showEditGlossaryDialog(glossary) {
      this.editDialogData = {
        name: this.typeMap.edit + glossary.nsId + '',
        label: glossary.chName,
        id: this.typeMap.edit + glossary.nsId,
        type: 'edit',
        glossary: glossary,
      }
      // this.addTab(tab)
      this.showEditDialog = true
    },
    showCheckResult(glossary) {
      // showEditGlossaryDialog(glossary) {
      this.checkResultData = {
        name: this.typeMap.check + glossary.nsId,
        id: this.typeMap.check + glossary.nsId,
        type: 'check',
        glossary: glossary,
      }
      // this.addTab(tab)
      this.breadcrumbData.push(glossary.chName)
      this.showHome = false
    },
    addTab(tab) {
      const index = this.editTabsArr.findIndex(item => {
        return item.id == tab.id
      })
      if (index === -1) {
        this.editTabsArr.push(tab)
      }
      this.currentTab = tab.name
    },
    editGlossaryFinish() {
      this.showEditDialog = false
      this.editDialogData = {}
      // refresh
      this.$refs.glossaryTab.getTableData()
    },
    removeTab(name) {
      const index = this.editTabsArr.findIndex(item => {
        return item.name == name
      })
      if (index >= 0) {
        this.editTabsArr.splice(index, 1)
      }
      this.currentTab = 'glossaryTab'
    },
    downloadFile() {
      // const url = this.glossaryUrl + 'template'
      this.$downloadFilePost(HTTP.nsTemplateDownloadUrl())
    },

    // upload
    handleBeforeUpload() {},
    onError(e) {
      this.onUpload = false
      this.$showUploadFailure(e)
      this.$bus.$emit('changeUploadProgress', false)
    },
    onSuccess(response, para) {
      console.log(response, 'response')
      this.$refs.glossaryTab.getTableData()
      this.onUpload = false
      this.$message.success({
        message: this.$t('domain.glossary.importSuccessful'),
      })
    },
    getJobStatus(jobId, isbacth) {
      this.$http
        .get(this.$url + '/service/simplejobs/' + jobId)
        .then(res => {
          if (res.data.jobStatus !== 'RUNNING') {
            this.onUpload = false
            this.$refs.glossaryTab.getTableData()
            if (res.data.jobStatus === 'FINISHED') {
              if (res.data.result) {
                const result = res.data.result
                if (typeof result === 'number') {
                  this.$message.success(
                    this.$t('domain.glossary.importFinishedCount', {
                      count: res.data.result,
                    })
                  )
                } else if (Array.isArray(result)) {
                  if (result.length > 0) {
                    result.forEach(item => {
                      this.$showFailure(item)
                    })
                  } else {
                    this.$message.success(
                      this.$t('domain.glossary.importSuccessful')
                    )
                  }
                } else if (typeof result === 'object') {
                  msg = ''
                  for (const k in result) {
                    msg += '<b>' + k + ' : </b>' + result[k] + '<br>'
                  }
                }
              } else {
                this.$message.success(
                  this.$t('domain.glossary.importSuccessful')
                )
              }
              this.deleteId && this.updataCurrentRow(this.deleteId)
              if (
                res.data.jobName === 'LineageBatchImport' &&
                res.data.result.length > 0
              ) {
                let wrong = ''
                res.data.result.forEach(item => {
                  wrong += '<p>' + item.first + ' ' + item.second + '</p>'
                })
                this.$message.error({
                  message: wrong,
                  dangerouslyUseHTMLString: true,
                })
              }
            } else if (res.data.jobStatus === 'FAILED') {
              this.$showFailure(res.data.errorMessage)
            }
          } else {
            this.interval = setTimeout(() => {
              this.getJobStatus(jobId)
            }, 100)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    downloadGlossary() {
      this.$downloadFilePost(HTTP.nsExportUrl())
    },
  },
  watch: {
    currentTab(newVal) {
      if (newVal === 'glossaryTab') {
        this.$refs.glossaryTab.getTableData()
      }
    },
  },
  computed: {
    showTabs() {
      return this.editTabsArr && this.editTabsArr.length > 0
    },
  },
}
</script>
<style scoped lang="scss">
.right-top {
  position: absolute;
  top: 8px;
  right: 20px;
  z-index: 9;

  .margin20 {
    margin-left: 20px;
  }

  .inline-block {
    display: inline-block;
  }

  .inline-block-btn {
    margin-left: 0;
  }
}

.glossary-tabs {
  position: absolute;
  top: 40px;
  right: 0;
  bottom: 0;
  left: 0;
  // margin-right: 20px;
  /deep/ .tab-bottom-line {
    // right: 0;
    // margin: 0 20px;
  }
  .check-result-table {
    /deep/.datablau-tab-table-line {
      top: 52px;
      // right: 20px;
      // bottom: auto;
    }
  }
}

// .glossary-tabs /deep/ .datablau-tabs > .el-tabs {
//   position: absolute;
//   top: 0;
//   right: 0;
//   bottom: 0;
//   left: 0;
//   //background: var(--white-grey-bgc);

//   &.hideTab {
//     .el-tabs__header {
//       display: none;
//     }

//     .el-tabs__content {
//       top: 0;
//     }
//   }

//   & > .el-tabs__content {
//     position: absolute;
//     top: 40px;
//     right: 0;
//     bottom: 0;
//     left: 0;
//     border-top: none;
//   }
// }

// .glossary-tabs /deep/ .datablau-tabs {
//   &.hideTab {
//     .el-tabs__header {
//       display: none;
//     }

//     .el-tabs__content {
//       top: 0;
//     }
//   }
// }
</style>
