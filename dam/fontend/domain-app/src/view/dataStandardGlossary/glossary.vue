<template>
  <div class="glossary-page" :class="{ showHome }">
    <history-tab :glossary="currentGlossary" ref="historyTab"></history-tab>
    <template v-if="showHome">
      <div class="tree-area">
        <tree-catalogue
          ref="treeCatalog"
          @itemClick="treeNodeClick"
        ></tree-catalogue>
      </div>
      <div class="tree-area-margin-right"></div>
    </template>
    <div class="content-area">
      <div class="breadcrumb-line top-back-line" style="margin: 0">
        <datablau-breadcrumb
          v-if="!showHome"
          style="height: auto; line-height: initial; display: inline-block"
          :node-data="breadcrumbData"
          @back="backClick"
        ></datablau-breadcrumb>
      </div>
      <div class="glossary-tabs" style="background: #fff">
        <glossary-tab
          @editGlossary="
            (data, isChangeFlow) =>
              showGlossaryDialog(data, 'edit', isChangeFlow)
          "
          @showGlossary="data => showGlossaryDialog(data, 'detail')"
          @showCheckResult="showCheckResult"
          @showHistory="showHistory"
          @downloadFile="downloadFile"
          @downloadGlossary="downloadGlossary"
          @showAddGlossaryDialog="showGlossaryDialog({}, 'add')"
          @handleBeforeUpload="handleBeforeUpload"
          @onError="onError"
          @onSuccess="onSuccess"
          ref="glossaryTab"
          v-loading="onUpload"
          :postUrl="postUrl"
          :folder-id="currentFolderId"
          v-if="showHome"
        ></glossary-tab>
        <!--        <check-result-table
          class="check-result-table"
          v-else
          :chineseName="checkResultData.glossary.chName"
          :abbreviation="checkResultData.glossary.abbr"
        ></check-result-table>-->
        <edit-glossary-tab
          :oldGlossary="editDialogData.glossary"
          v-if="editDialogData.type"
          :is-edit="editDialogData.type === 'edit'"
          :is-detail="editDialogData.type === 'detail'"
          :is-add="editDialogData.type === 'add'"
          :is-change-flow="editDialogData.isChangeFlow"
          @editFinish="editGlossaryFinish"
          :tree-data="treeData"
          :fold-id="currentFolderId"
        ></edit-glossary-tab>
      </div>
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main'
import glossaryTab from './glossaryTab2.vue'
import editGlossaryTab from './editGlossaryTab.vue'
import checkResultTable from './checkResultTable.vue'
import historyTab from './historyTab.vue'
import treeCatalogue from '@/view/dataStandardCode/newTree.vue'

export default {
  components: {
    treeCatalogue,
    glossaryTab,
    editGlossaryTab,
    checkResultTable,
    historyTab,
  },
  data() {
    const glossaryUrl = this.$url + '/service/ns/'
    return {
      glossaryUrl: glossaryUrl,
      currentTab: 'glossaryTab',
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
      editDialogData: {},
      checkResultData: {},
      currentFolder: null,
      treeData: [],
    }
  },
  created() {
    console.log('glossary>>>>>>>>>', this.$auth)
  },
  methods: {
    treeNodeClick(data, node) {
      this.currentFolder = data
    },
    // 面包屑组件api
    backClick(e) {
      this.showHome = true
      this.breadcrumbData = []
      this.editDialogData = {}
    },
    /*
     * type: add, detail, edit
     * */
    showGlossaryDialog(glossary, type, isChangeFlow) {
      this.treeData = this.$refs.treeCatalog.getTreeData()

      const isAdd = type === 'add'
      this.editDialogData = {
        type,
        glossary: glossary || {},
        isChangeFlow,
      }
      this.breadcrumbData = [
        {
          name: !isAdd ? glossary?.chName : '所有业务术语',
          couldClick: false,
        },
        {
          name: !isAdd ? '编辑业务术语' : '创建业务术语',
          couldClick: false,
        },
      ]
      this.showHome = false
    },
    showHistory(glossary) {
      this.currentGlossary = _.cloneDeep(glossary)
      this.$refs.historyTab && this.$refs.historyTab.showDialog()
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
    editGlossaryFinish() {
      this.editDialogData = {}
      this.showHome = true
      // refresh
      this.$nextTick(() => {
        this.$refs.glossaryTab.getTableData()
      })
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
    downloadGlossary(param) {
      this.$downloadFilePost(HTTP.nsExportUrl(), param)
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
    currentFolderId() {
      return this.currentFolder ? this.currentFolder.foldId : null
    },
  },
}
</script>
<style scoped lang="scss">
$grey-border: 1px solid #eaecf1;
$blue: #268bd3;
$tree-box-width: 240px;
$border-text: 1px solid #aaa;
@import '../../next/components/basic/color.sass';
.glossary-page.showHome {
  .content-area {
    left: $tree-box-width !important;
  }
}
.glossary-page {
  background: #fff;
  .tree-area {
    width: $tree-box-width;

    .tree-search-box {
      padding: 10px;
    }

    .tree-box {
      position: absolute;
      top: 45px;
      right: 0;
      bottom: 48px;
      left: 0;

      &.full {
        bottom: 0;
      }
    }

    .manage-box {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 48px;
      padding: 10px;
      border-top: $grey-border;

      span {
        position: absolute;
        top: 15px;
        right: 10px;
        color: #9b9ea2;
      }
    }
  }
  .tree-area-margin-right {
    position: absolute;
    top: 0;
    left: $tree-box-width - 3px;
    width: 7px;
    height: 100%;
    cursor: e-resize !important;
    background-color: transparent;
    z-index: 2;
  }

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

  .content-area {
    left: 0;
    .glossary-tabs {
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
  }
}
</style>
