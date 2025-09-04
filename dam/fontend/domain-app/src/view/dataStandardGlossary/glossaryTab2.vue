<template>
  <div class="glossary-tab">
    <datablau-upload
      class="inline-block upload-btn"
      :action="postUrl"
      :before-upload="handleBeforeUpload"
      :on-error="onError"
      :on-success="onSuccess"
      :show-file-list="false"
      accept=".xlsx"
      :headers="$headers"
      :isEdit="true"
      style="vertical-align: top"
      v-show="false"
      ref="uploadComponent"
    >
      <datablau-button type="text">
        {{ $t('domain.common.batchImport') }}
      </datablau-button>
    </datablau-upload>
    <datablau-eltable
      class="table-tab-container table-scroll-y"
      style="margin-right: 20px"
      ref="glossaryTable"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideBottomLine"
      :tableOption="tableOption"
      :hide-default-filter="true"
      :show-custom-filter="true"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      @gridSelectionChanged="gridSelectionChanged"
    >
      <div slot="chNameTableCol" slot-scope="scope">
        <el-button :size="'small'" type="text" @click="goToDetail(scope.row)">
          {{ scope?.row?.chName }}
        </el-button>
      </div>
      <div slot="custom-state" slot-scope="scope">
        <span :style="`color:${getStatusColor(scope.row.state)}`">
          <span
            :style="`background-color:${getStatusColor(scope.row.state)}`"
            class="circle"
          ></span>
          {{ statusFormatter(scope.row.state) }}
        </span>
      </div>
      <div class="search-area" slot="customFilter">
        <datablau-input
          :placeholder="$t('domain.glossary.searchPlaceholder')"
          v-model="defaultParaData.keyword"
          maxlength="50"
          clearable
        ></datablau-input>
        <datablau-input
          :placeholder="$t('domain.glossary.domainCodePlaceholder')"
          v-model="defaultParaData.domainCode"
          maxlength="50"
          clearable
        ></datablau-input>
        <datablau-select
          :placeholder="$t('domain.glossary.statePlaceholder')"
          v-model="defaultParaData.state"
          filterable
          clearable
        >
          <el-option
            v-for="item in stateOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </datablau-select>
        <datablau-button
          size="mini"
          type="normal"
          :disabled="tableLoading"
          @click="getTableData()"
        >
          {{ $t('domain.common.search') }}
        </datablau-button>
        <datablau-button
          size="mini"
          type="secondary"
          :disabled="tableLoading"
          @click="getTableData(true)"
        >
          {{ $t('domain.common.reset') }}
        </datablau-button>
      </div>
      <div v-if="hasAccess" class="right-top" slot="header">
        <datablau-button
          size="mini"
          type="important"
          class="iconfont icon-tianjia"
          v-if="$auth['DICTIONARY_ADD'] || $auth['ROLE_BUSI_TERM_ADD']"
          @click="showAddGlossaryDialog"
        >
          {{ $t('common.button.add') }}
        </datablau-button>
        <el-dropdown trigger="click" @command="moreHandle" v-if="hasAccess">
          <datablau-button
            size="mini"
            class="el-dropdown-link"
            style="margin: 10px 0 10px 10px"
            type="secondary"
            v-if="
              $auth['BUSI_TERM_EXPORT'] ||
              $auth['DICTIONARY_IMPORT'] ||
              $auth['ROLE_BUSI_TERM_EXPORT']
            "
          >
            {{ $t('common.button.more') }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu class="more-drop-box" slot="dropdown">
            <el-dropdown-item
              icon="iconfont icon-import"
              command="import"
              v-if="$auth['DICTIONARY_IMPORT']"
            >
              {{ $t('common.button.import') }}
            </el-dropdown-item>
            <el-dropdown-item
              icon="iconfont icon-export"
              command="export"
              v-if="$auth['DICTIONARY_EXPORT'] || $auth['ROLE_BUSI_TERM_EXPORT']"
            >
              {{ $t('common.button.export') }}
            </el-dropdown-item>
            <!-- <el-dropdown-item
              icon="iconfont icon-download"
              command="download"
              v-if="$auth['DICTIONARY_IMPORT']"
            >
              {{ $t('domain.common.downloadTemp') }}
            </el-dropdown-item> -->
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="bottom-line" slot="footer">
        <span v-if="selection && selection.length">
          <span class="count-span">
            {{
              $t('common.deleteMessage', {
                selection: (selection || 0).length || 0,
              })
            }}
          </span>
          <datablau-button
            icon="el-icon-delete"
            v-if="hasAccess && $auth['DICTIONARY_DELETE']"
            type="danger"
            size="small"
            @click="deleteRow"
            :disabled="!disabledControl2() || toDeleteLoading"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
          <datablau-button
            class="iconfont icon-export"
            type="important"
            @click="downloadSelected"
            v-if="$auth['DICTIONARY_EXPORT'] || $auth['ROLE_BUSI_TERM_EXPORT']"
            :disabled="!this.selection || !this.selection.length"
          >
            {{ $t('domain.common.exportSelected') }}
          </datablau-button>
          <datablau-button
            type="primary"
            size="mini"
            @click="toPublish()"
            :disabled="!disabledControl2() || toPublishLoading"
            :loading="toPublishLoading"
            v-if="$auth['BUSI_TERM_PUBLISH'] || $auth['ROLE_BUSI_TERM_PUBLISH']"
          >
            {{ $t('domain.common.applyPublish') }}
          </datablau-button>
          <datablau-button
            type="normal"
            size="mini"
            @click="toChange"
            :disabled="disabledControl('A')"
            v-if="$auth['BUSI_TERM_CHANGE'] || $auth['ROLE_BUSI_TERM_CHANGE']"
          >
            {{ $t('domain.common.applyChange') }}
          </datablau-button>
          <datablau-button
            type="normal"
            size="mini"
            @click="toAbandon()"
            :disabled="disabledControl('A') || toAbandonLoading"
            v-if="$auth['BUSI_TERM_ABOLISH'] || $auth['ROLE_BUSI_TERM_ABOLISH']"
            :loading="toAbandonLoading"
          >
            {{ $t('domain.common.applyDiscard') }}
          </datablau-button>
          <datablau-button
            type="normal"
            size="mini"
            @click="moveFolderDialog = true"
            v-if="$auth['BUSI_TERM_MOVE'] || $auth['ROLE_BUSI_TERM_MOVE']"
          >
            {{ $t('domain.common.move') }}
          </datablau-button>
        </span>
      </div>
    </datablau-eltable>
    <datablau-dialog
      size="l"
      append-to-body
      :title="
        $t('common.page.glossary') +
        (this.$i18n.locale === 'en' ? '  ' : '') +
        $t('common.button.import')
      "
      :height="300"
      :close-on-click-modal="false"
      :visible.sync="uploadDialogVisible"
    >
      <!--<div class="exportError">
        <span class="exportErrorSpan">
          {{ $t('common.export.exportError') }}
        </span>
        <datablau-radio v-model="exportType">
          <el-radio class="radio-info" :label="true">
            {{ $t('common.export.option1') }}
          </el-radio>
          <el-radio class="radio-info" :label="false">
            {{ $t('common.export.option2') }}
          </el-radio>
        </datablau-radio>
        <div style="display: inline-block">
          <span class="remark-info" style="display: flex; align-items: center">
            <i class="iconfont icon-tips"></i>
            <p
              style="
                white-space: pre-line;
                padding-left: 0px;
                line-height: 1.2;
                margin-left: 6px;
              "
            >
              {{ $t('common.export.exportTip') }}
            </p>
          </span>
        </div>
      </div>-->
      <div class="uploadContent">
        <p class="uploadtip">
          {{ $t('quality.page.dataQualityRules.importRules.uploadtip') }}
        </p>
        <datablau-button
          style="float: right; margin-right: -8px"
          type="text"
          @click="downloadFile"
          v-if="$auth['DICTIONARY_IMPORT']"
        >
          {{ $t('domain.common.downloadTemp') }}
        </datablau-button>
        <datablau-upload
          :action="standardUploadUrl"
          :before-upload="showBegain"
          :on-error="handleUpdateMetadataError"
          :on-success="handleUpdateMetadataSuccess"
          :on-change="onChange"
          :before-remove="beforeRemove"
          :show-file-list="true"
          accept=".xlsx"
          :headers="$headers"
          ref="standardImport"
          :isEdit="true"
          :limit="1"
          :auto-upload="false"
          class="standardImport-upload"
        >
          <slot>
            <datablau-button type="secondary">
              <i class="iconfont icon-upload" style="margin-right: 6px"></i>
              <span>
                {{
                  $t('quality.page.dataQualityRules.importRules.uploadTemplate')
                }}
              </span>
            </datablau-button>
          </slot>
          <div slot="tip" class="el-upload__tip"></div>
        </datablau-upload>
      </div>
      <div slot="footer">
        <datablau-button
          :disabled="formFile.length === 0"
          type="primary"
          @click="standardImportAction"
        >
          {{ $t('domain.common.confirm') }}
        </datablau-button>
        <datablau-button type="secondary" @click="uploadDialogVisible = false">
          {{ $t('domain.common.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      :title="'移动至'"
      :visible.sync="moveFolderDialog"
      class="jobs-sta"
      width="500px"
      height="316px"
    >
      <new-code-tree
        ref="folderTreeForMove"
        class="tree-dialog"
        :showSearch="false"
        :showCheckbox="true"
        :signalChecked="true"
        :checkStrictly="true"
      />
      <div slot="footer">
        <datablau-button
          :disabled="toMoveLoading"
          type="primary"
          size="mini"
          @click="toMove"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button
          type="secondary"
          size="mini"
          :disabled="toMoveLoading"
          @click="moveFolderDialog = false"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import vue from 'vue'
import HTTP from '@/http/main'
import {
  columnDefs,
  stateOptions,
  statusFormatter,
  getStatusColor,
} from '@/view/dataStandardGlossary/glossaryConstants'
import newCodeTree from '@/view/dataStandardCode/newTree.vue'

export default {
  props: ['postUrl', 'folderId'],
  components: { newCodeTree },
  inject: ['headerProduction'],

  data() {
    const glossaryUrl = this.$url + '/service/ns/'
    return {
      glossaryUrl,
      totalShow: 0,
      hideTopLine: false,
      hideBottomLine: false,
      tableOption: null,
      tableHidePagination: false,
      stateOptions: stateOptions(this),
      defaultParaData: {
        keyword: '',
        domainCode: '',
        state: '',
        sortData: {
          colId: 'updateTime',
          sort: 'desc',
        },
        filterType: {},
        currentPage: 1,
        pageSize: 20,
      },
      getCategories: null,
      selection: [],
      columnDefs: columnDefs(this),
      uploadDialogVisible: false,
      formFile: [],
      exportType: true,
      statusFormatter,
      getStatusColor,
      moveFolderDialog: false,
      toMoveLoading: false,
      toAbandonLoading: false,
      toDeleteLoading: false,
      toPublishLoading: false,
      tableLoading: false,
    }
  },
  beforeMount() {
    // this.refreshFilterItem();
    const noSortFunction = (valueA, valueB, nodeA, nodeB, isInverted) => {
      return !isInverted
    }
    // const typeName = this.hasAccess
    //   ? 'selectionCheckboxColumn'
    //   : 'firstEmptyColumn'
    const tableOption = {
      frameworkComponents: {},
      selectable: this.hasAccess && this.$auth.DICTIONARY_DELETE,
      autoHideSelectable: true,
      showColumnSelection: false,
      columnSelection: [],
      columnResizable: true,
    }
    this.tableOption = tableOption
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    toAbandon() {
      this.$DatablauCofirm(
        this.$t('domain.glossary.discardConfirm'),
        this.$t('domain.common.warning'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.toAbandonLoading = true
          const ids = [...this.selection.map(item => item.id)]
          HTTP.applyAbolishBusinessTerm(ids)
            .then(res => {
              this.toAbandonLoading = false
              this.$message.success(
                this.$t('domain.common.applyDiscardSucceed')
              )
              this.getTableData()
            })
            .catch(e => {
              this.toAbandonLoading = false
              this.$showFailure(e)
            })
        })
        .catch(err => {
          console.log('abandon error', err)
        })
        .finally(() => {
          this.toAbandonLoading = false
        })
    },
    toChange() {
      this.editGlossary({ data: this.selection[0] }, true)
    },
    toPublish() {
      this.toPublishLoading = true
      const ids = [...this.selection.map(item => item.id)]
      HTTP.publishBusinessTerm(ids)
        .then(res => {
          this.toPublishLoading = false
          this.$message.success(this.$t('domain.common.applyPublishSucceed'))
          this.getTableData()
        })
        .catch(e => {
          this.toPublishLoading = false
          this.$showFailure(e)
        })
    },
    disabledControl(state) {
      return (
        !this.selection.length ||
        this.selection.filter(e => e.state === state).length !==
          this.selection.length
      )
    },
    disabledControl2() {
      let flag = true
      flag = this.selection.every(item => {
        return item.state === 'X' || item.state === 'D'
      })
      return flag
    },

    downloadSelected() {
      const arr = []
      this.selection.forEach(item => {
        arr.push(item.id)
      })
      this.downloadGlossary(arr)
    },
    onChange(e) {
      this.formFile.push(e)
    },
    beforeRemove(e) {
      this.formFile = []
    },
    standardImportAction() {
      this.uploadDialogVisible = false
      this.$refs.standardImport.$refs.upload.submit()
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const orderByMap = {
          chName: 'chineseName',
          domainCode: 'domainCode',
          enName: 'englishName',
          abbr: 'abbr',
          firstPublish: 'firstPublish',
          updateTime: 'updateTime',
        }
        para.sortData = para.sortData || {}
        const resultPara = {
          folderId: this.folderId,
          currentPage: para.currentPage || 1,
          pageSize: para.pageSize || 20,
          orderBy: orderByMap[para.sortData.colId || 'updateTime'],
          sort: para.sortData.sort === 'asc' ? 'asc' : 'desc',
          domainState: this.defaultParaData.state || undefined,
          keyword: this.defaultParaData.keyword,
          domainCode: this.defaultParaData.domainCode,
        }

        resultPara.currentPage--
        // this.$http
        //   .get(this.glossaryUrl, { params: resultPara })
        const tryCurrent = res => {
          const data = res.data.content
          this.totalShow = res.data.totalItems
          if (res.data.totalItems > 0 && data.length === 0) {
            resultPara.currentPage--
            HTTP.nsGetPageService(resultPara).then(res => {
              const data = res.data.content
              this.totalShow = res.data.totalItems
              tryCurrent(res)
            })
          } else {
            resolve(data)
            this.$testLastPageEmpty({
              data: res.data,
              refComponent: this.$refs && this.$refs.glossaryTable,
              startWith0: true,
            })
          }
        }
        HTTP.nsGetPageService(resultPara)
          .then(res => {
            tryCurrent(res)
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    gridSelectionChanged(para) {
      const api = para.api
      if (!api) return
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
    },
    getTableData(reset) {
      if (reset) {
      }
      this.$refs.glossaryTable && this.$refs.glossaryTable.refreshData()
      setTimeout(() => {
        this.getcolumnFomatter()
      })
    },
    goToDetail(row) {
      if (this.hasAccess && row.state === 'D') {
        this.editGlossary({ data: row })
      } else if (this.hasAccess) {
        this.showGlossaryDetail({ data: row })
      }
    },
    showGlossaryDetail({ api, data, e }) {
      this.$emit('showGlossary', data)
    },
    editGlossary({ api, data, e }, isChangeFlow) {
      this.$emit('editGlossary', data, isChangeFlow)
    },
    showHistory({ api, data, e }) {
      this.$emit('showHistory', data)
    },

    // delete choose lineage
    deleteRow() {
      const self = this
      self
        .$confirm(
          this.$t('domain.common.delConfirm'),
          this.$t('domain.common.delete'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        )
        .then(() => {
          const arr = []
          this.selection.forEach(item => {
            arr.push(item.id)
          })
          console.log(arr, 'arr')
          // this.$http
          //   .put(self.glossaryUrl, arr)
          this.toDeleteLoading = true
          HTTP.nsDeleteService(arr)
            .then(res => {
              this.$message.success(this.$t('domain.common.delSucceed'))
              // this.timer = 'first';
              this.getTableData()
            })
            .catch(e => {
              console.log(e, 'e')
              if (
                e.response &&
                e.response.data &&
                e.response.data.rootErrorMessage
              ) {
                const reason =
                  e.response.data.rootErrorMessage ||
                  this.$t('domain.glossary.unknown')
                this.$showFailure(reason)
              } else {
                this.$showFailure(e)
              }
            })
            .finally(() => {
              this.toDeleteLoading = false
            })
        })
        .catch(res => {
          console.log(res, 'res')
        })
    },
    getcolumnFomatter() {
      this.$refs.glossaryTable.columnFomatter()
    },
    // table filter
    /* getFilterItem() {
      return new Promise((resolve, reject) => {
        const result = []
        let getCategories = this.getCategories
        if (!getCategories || true) {
          // getCategories = this.$http.get(`${this.$url}/service/ns/categories/`)
          getCategories = HTTP.nsGetCategoriesService()
        }
        getCategories
          .then(res => {
            const data = res.data
            if (data && Array.isArray(data)) {
              data.forEach(item => {
                if (item) {
                  result.push(item)
                }
              })
            }
            resolve(result)
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    }, */
    refreshFilterItem() {
      this.getCategories = HTTP.nsGetCategoriesService()
    },
    downloadFile(para) {
      this.$emit('downloadFile', para)
    },
    downloadGlossary(para) {
      this.$emit('downloadGlossary', para)
    },
    showAddGlossaryDialog() {
      this.$emit('showAddGlossaryDialog')
    },
    handleBeforeUpload(para) {
      this.$emit('handleBeforeUpload', para)
    },
    showBegain(para) {
      this.$emit('handleBeforeUpload', para)
    },
    onError(para) {
      this.$emit('onError', para)
    },
    onSuccess(para) {
      this.$emit('onSuccess', para)
    },
    handleUpdateMetadataSuccess(para) {
      // this.$emit('onSuccess', para)
      this.$bus.$emit('getTaskJobResult', para, 'import')
    },
    handleUpdateMetadataError(para) {
      this.$emit('onError', para)
    },
    formatterTime(params) {
      let t = ''
      if (params.value) {
        t = this.$timeFormatter(params.value) || this.$t('domain.common.none')
      } else {
        t = this.$t('domain.common.none')
      }
      return t
    },
    moreHandle(command) {
      switch (command) {
        case 'download':
          this.downloadFile()
          break
        case 'export':
          this.downloadGlossary()
          break
        case 'import':
          this.uploadCodeFile()
          break
      }
    },
    uploadCodeFile() {
      // if (
      //   this.$refs.uploadComponent &&
      //   this.$refs.uploadComponent.$slots.default &&
      //   this.$refs.uploadComponent.$slots.default[0] &&
      //   this.$refs.uploadComponent.$slots.default[0].elm
      // ) {
      //   this.$refs.uploadComponent.$slots.default[0].elm.click()
      // }
      this.exportType = true
      this.uploadDialogVisible = true
    },
    toMove() {
      const nodes = this.$refs.folderTreeForMove.getCheckedNodes()
      if (nodes && nodes.length === 1) {
        const { foldId, name } = nodes[0]
        this.$DatablauCofirm(
          `确认将选中的数据迁移至[${name}]目录？`,
          this.$t('domain.common.warning'),
          {
            type: 'warning',
          }
        ).then(() => {
          this.toMoveLoading = true
          const terms = [
            ...this.selection.map(item => {
              return { ...item }
            }),
          ]
          this.$http
            .post(this.$domain_url + `/ns/ns/moveNs?id=${foldId}`, terms)
            .then(res => {
              this.toMoveLoading = false
              this.moveFolderDialog = false
              this.$message.success('操作成功')
              this.getTableData()
            })
            .catch(e => {
              this.toMoveLoading = false
              this.$showFailure(e)
            })
        })
      }
    },
  },
  watch: {
    uploadDialogVisible(value) {
      if (value === true && this.$refs.standardImport) {
        this.$refs.standardImport.$refs.upload.clearFiles()
      }
    },
    folderId(value) {
      this.getTableData()
    },
  },
  computed: {
    standardUploadUrl() {
      let url = this.postUrl
      return url
    },
    hasAccess() {
      return !(
        this.headerProduction.toUpperCase() !== 'DAM' && this.$damEnabled
      )
    },
  },
}
</script>
<style lang="scss">
@import '~@/next/components/basic/color.sass';

.uploadContent {
  clear: both;
  background: #f7f9fb;
  border-radius: 4px;
  padding: 16px;
  .uploadtip {
    font-size: 12px;
    color: $text-message;
    padding-bottom: 16px;
    display: inline-block;
  }
  .autoCode {
    padding-top: 16px;
  }
}
.exportError {
  clear: both;
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}
.glossary-tab {
  .tab-with-table {
    .datablau-tab-table-line.hide-filter {
      top: 60px;
    }
  }
  .right-top {
    white-space: nowrap;
    padding-top: 2px;

    .upload-btn {
      display: inline-block;
    }
  }
  .datablau-tab-top-line {
    .search-area {
      display: flex;
      align-items: center;
      height: 60px;
    }
    .datablau-input {
      //margin-top: 15px;
      margin-right: 15px;
    }
  }
  .datablau-tab-table-line {
    .db-table.datablau-table-info {
      .datablau-table {
        // position: relative;
        .el-table__body-wrapper {
          //bottom: 10px;
        }
      }
    }
  }
  .bottom-line {
    margin-left: 0px;

    .count-span {
      margin-right: 10px;
    }
  }
  .more-drop-box .el-dropdown-menu__item {
    .iconfont {
      color: #999;
      font-size: 14px;
    }
    &:hover {
      color: #409eff;
      .iconfont {
        color: #409eff;
      }
    }
  }
}
</style>
