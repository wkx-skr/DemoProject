<template>
  <div class="en-list-box">
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
        :typeIds="typeIds"
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
    <div class="filter-line">
      <datablau-list-search :hideTitle="true">
        <el-form :model="searchFormData" @submit.native.prevent>
          <el-form-item label-width="0">
            <datablau-input
              clearable
              :placeholder="$t('domain.code.codeListSearchPlaceholder')"
              size="mini"
              v-model="searchFormData.keyword"
            ></datablau-input>
          </el-form-item>
          <!-- <el-form-item v-if="!useWorkflow">
            <datablau-button
              size="mini"
              type="normal"
              @click="handleCurrentChange(1, 'search')"
            >
              {{ $t('domain.common.search') }}
            </datablau-button>
          </el-form-item> -->

          <el-form-item
            class="select-form-item"
            :label="$t('domain.code.codeStatus')"
          >
            <!--style="width: 100px"-->
            <datablau-select
              size="mini"
              style="width: 140px"
              v-model="searchFormData.state"
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
              @click="handleCurrentChange(1, 'search')"
              style="margin-left: 8px"
            >
              {{ $t('domain.common.search') }}
            </datablau-button>
            <span
              style="margin-left: 6px"
              v-if="$store.state.damConnectable"
              :class="!showTag ? '' : 'active'"
            >
              <datablau-button
                type="text"
                @click="showFilterTag"
                class="iconfont icon-filter"
              >
                {{ $t('meta.DS.filter.moreFilter') }}
              </datablau-button>
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.DS.filter.tag')"
            style="display: block"
          >
            <div class="tag-bar oneline-eclipse">
              <el-tag
                style="margin-left: 0.3em"
                size="small"
                closable
                v-for="(v, i) in currentTag"
                @close="handleClose(v, i)"
                v-if="currentTag && i < 5"
                :key="i"
              >
                {{ tagNames[i] }}
              </el-tag>
              <span v-if="currentTag && currentTag.length > 5">
                {{ $t('meta.DS.filter.etcTag').format(currentTag.length) }}
              </span>
              <datablau-button
                size="small"
                type="text"
                @click="callTagSelector"
              >
                {{ $t('meta.DS.filter.filterByTag') }}
                <i class="el-icon-plus" style="font-weight: bold"></i>
              </datablau-button>
              <datablau-button
                type="text"
                size="small"
                @click="cancelTagSelect"
                v-if="currentTag && currentTag.length"
              >
                {{ $t('meta.DS.filter.cancelFilterByTag') }}
              </datablau-button>
            </div>
          </el-form-item>
        </el-form>
        <template slot="buttons" class="right-btns" v-if="hasEditAuth">
          <datablau-button
            class="iconfont icon-tianjia"
            type="important"
            size="mini"
            @click="add"
            style="margin: 10px 0 10px 35px"
            v-if="$auth['STANDARD_CODE_ADD'] || $auth['ROLE_STANDARD_CODE_ADD']"
          >
            {{ $t('common.button.add') }}
          </datablau-button>
          <el-dropdown trigger="click" @command="moreHandle">
            <datablau-button
              size="mini"
              class="el-dropdown-link"
              style="margin: 10px 0 10px 10px"
              type="secondary"
              v-if="
                $auth['STANDARD_CODE_IMPORT_CODE'] ||
                $auth['ROLE_STANDARD_CODE_IMPORT'] ||
                $auth['STANDARD_CODE_EXPORT'] ||
                $auth['ROLE_STANDARD_CODE_EXPORT'] ||
                $auth['STANDARD_CODE_EXPAND']
              "
            >
              {{ $t('common.button.more') }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </datablau-button>
            <el-dropdown-menu class="more-drop-box" slot="dropdown">
              <el-dropdown-item
                icon="iconfont icon-import"
                command="b"
                v-if="
                  $auth['STANDARD_CODE_IMPORT_CODE'] ||
                  $auth['ROLE_STANDARD_CODE_IMPORT']
                "
              >
                {{ $t('common.button.import') }}
              </el-dropdown-item>
              <el-dropdown-item
                icon="iconfont icon-export"
                command="c"
                v-if="
                  $auth['STANDARD_CODE_EXPORT'] ||
                  $auth['ROLE_STANDARD_CODE_EXPORT']
                "
              >
                {{ $t('common.button.export') }}
              </el-dropdown-item>
              <!--              <el-dropdown-item
                icon="iconfont icon-download"
                command="a"
                v-if="
                  $auth['STANDARD_CODE_IMPORT_CODE'] ||
                  $auth['ROLE_STANDARD_CODE_IMPORT']
                "
              >
                {{ $t('domain.common.downloadTemp') }}
              </el-dropdown-item>-->
              <el-dropdown-item
                command="d"
                v-if="$auth['STANDARD_CODE_EXPAND']"
              >
                <span
                  class="iconfont icon-expand"
                  style="margin-right: 6px; font-size: 16px"
                ></span>
                {{ $version.option.udp }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </datablau-list-search>
    </div>

    <div class="row-list" :class="{ 'show-tag': showTag }">
      <datablau-form-submit>
        <datablau-table
          class="datablau-table"
          height="100%"
          :data="tableData"
          :data-selectable="hasEditAuth && couldEdit"
          @selection-change="tableSelectionChanged"
        >
          <el-table-column :width="hasEditAuth && couldEdit ? '20p' : '25px'">
            <div style="display: flex; align-items: center">
              <datablau-icon
                style="flex-shrink: 0"
                data-type="daima"
                :isIcon="true"
                :size="18"
              ></datablau-icon>
            </div>
          </el-table-column>

          <el-table-column
            min-width="120px"
            :label="$t('domain.code.codeName')"
            prop="name"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="openScan(scope.row)">
                {{ scope.row.name }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column
            width="100px"
            :label="$t('domain.code.codePropCode')"
            prop="code"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            min-width="120px"
            :label="$t('domain.common.standardTheme')"
            prop="datasetName"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <i
                class="iconfont icon-file"
                style="font-size: 14px; color: #409eff"
              ></i>
              &nbsp;
              {{ (scope.row.paths && scope.row.paths[1]) || '' }}
              <!--              {{ scope.row.datasetName || '' }}-->
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('domain.code.codeStatus')"
            prop="state"
            :min-width="80"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span
                v-if="scope.row.parentDomain"
                :style="`color:${getStatusColor(scope.row.parentDomain.state)}`"
              >
                <span
                  :style="`background-color:${getStatusColor(
                    scope.row.parentDomain.state
                  )}`"
                  class="circle"
                ></span>
                {{ statusFormatter(scope.row.parentDomain.state) }}
              </span>
              <span v-else></span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$version.tableHeader.publishTime"
            :min-width="130"
            column-key="publish"
            prop="publishTime"
            :formatter="$timeNoSecondFormatter"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>
                {{
                  scope.row.parentDomain && scope.row.parentDomain.firstPublish
                    ? $timeNoSecondFormatter(
                        scope.row.parentDomain.firstPublish
                      )
                    : ''
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$version.tableHeader.lastModificationTime"
            :min-width="130"
            column-key="last"
            prop="lastModification"
            :formatter="$timeNoSecondFormatter"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('domain.common.remark')"
            prop="comment"
            :min-width="80"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('domain.common.operation')"
            header-align="center"
            align="left"
            width="80"
            fixed="right"
          >
            <template slot-scope="scope">
              <datablau-button
                size="small"
                type="icon"
                @click="openScan(scope.row)"
              >
                <datablau-tooltip
                  :content="$t('domain.common.check')"
                  placement="top"
                >
                  <i class="iconfont icon-see"></i>
                </datablau-tooltip>
              </datablau-button>
              <datablau-button
                size="small"
                type="icon"
                v-if="
                  (scope.row.parentDomain?.state === 'D' ||
                    !scope.row.parentDomain?.state) &&
                  useWorkflow
                "
                @click="openEdit(scope.row)"
                v-show="
                  $auth['STANDARD_CODE_EDIT'] ||
                  $auth['ROLE_STANDARD_CODE_EDIT']
                "
              >
                <datablau-tooltip
                  :content="$t('common.button.edit')"
                  placement="top"
                >
                  <i class="iconfont icon-bianji"></i>
                </datablau-tooltip>
              </datablau-button>
              <datablau-button
                size="small"
                type="icon"
                v-if="
                  (scope.row.parentDomain?.state === 'D' ||
                    !scope.row.parentDomain?.state) &&
                  !useWorkflow
                "
                @click="openEdit(scope.row)"
                v-show="
                  $auth['STANDARD_CODE_EDIT'] ||
                  $auth['ROLE_STANDARD_CODE_EDIT']
                "
              >
                <datablau-tooltip
                  :content="$t('common.button.edit')"
                  placement="top"
                >
                  <i class="iconfont icon-bianji"></i>
                </datablau-tooltip>
              </datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <div class="row-pagination">
            <div
              class="left-btn"
              style="float: left"
              v-show="selection && selection.length > 0"
            >
              <span
                class="footer-row-info"
                v-if="
                  $auth['STANDARD_CODE_DELETE'] ||
                  $auth['ROLE_STANDARD_CODE_DELETE'] ||
                  $auth['STANDARD_CODE_RELEASE'] ||
                  $auth['ROLE_STANDARD_CODE_PUBLISH'] ||
                  $auth['STANDARD_CODE_UPDATA'] ||
                  $auth['ROLE_STANDARD_CODE_CHANGE'] ||
                  $auth['STANDARD_CODE_SCRAP'] ||
                  $auth['ROLE_STANDARD_CODE_DISCARD']
                "
              >
                {{
                  $t('common.deleteMessage', {
                    selection: selection.length,
                  })
                }}
              </span>
              <!-- <datablau-button
                type="danger"
                style="width: 70px"
                size="mini"
                @click="toDelete"
                v-if="
                  ($auth['STANDARD_CODE_DELETE'] ||
                    $auth['ROLE_STANDARD_CODE_DELETE']) &&
                  !useWorkflow
                "
              >
                {{ $t('common.button.delete') }}
              </datablau-button> -->
              <!--hide when useWorkflow false-->
              <datablau-button
                type="danger"
                style="width: 70px"
                size="mini"
                @click="toDelete"
                :disabled="deleteBtnDisabled()"
                :tooltip-content="
                  disabledControl('D') && disabledControl('X')
                    ? $t('domain.code.deleteTooltip')
                    : ``
                "
                v-if="
                  $auth['STANDARD_CODE_DELETE'] ||
                  $auth['ROLE_STANDARD_CODE_DELETE']
                "
              >
                {{ $t('common.button.delete') }}
              </datablau-button>
              <datablau-button
                class="iconfont icon-export"
                type="important"
                @click="downloadSelected"
                v-if="
                  $auth['STANDARD_CODE_EXPORT_SELECTED'] ||
                  $auth['ROLE_STANDARD_CODE_EXPORT']
                "
              >
                {{ $t('domain.common.exportSelected') }}
              </datablau-button>
              <datablau-button
                type="primary"
                size="mini"
                @click="toPublish()"
                :disabled="!disabledControl2()"
                :loading="toPublishLoading"
                v-if="
                  ($auth['STANDARD_CODE_RELEASE'] ||
                    $auth['ROLE_STANDARD_CODE_PUBLISH']) &&
                  useWorkflow
                "
                :tooltip-content="
                  disabledControl('D') && disabledControl('X')
                    ? $t('domain.code.publishTooltip')
                    : ``
                "
              >
                {{ $t('domain.common.applyPublish') }}
              </datablau-button>
              <datablau-button
                type="primary"
                size="mini"
                @click="toPublish($t('domain.code.domain'))"
                :disabled="!disabledControl2()"
                :loading="toPublishLoading"
                v-if="
                  ($auth['STANDARD_CODE_RELEASE'] ||
                    $auth['ROLE_STANDARD_CODE_PUBLISH']) &&
                  !useWorkflow
                "
                :tooltip-content="
                  disabledControl('D') && disabledControl('X')
                    ? $t('domain.code.publishTooltip')
                    : ``
                "
              >
                {{ $t('domain.common.applyPublish') }}
              </datablau-button>
              <datablau-button
                type="normal"
                size="mini"
                @click="toChange"
                :disabled="disabledControl('A')"
                v-if="
                  ($auth['STANDARD_CODE_UPDATA'] ||
                    $auth['ROLE_STANDARD_CODE_CHANGE']) &&
                  useWorkflow
                "
                :tooltip-content="
                  disabledControl('A') ? $t('domain.code.changeTooltip') : ``
                "
              >
                {{ $t('domain.common.applyChange') }}
              </datablau-button>
              <datablau-button
                type="normal"
                size="mini"
                @click="toChange()"
                :disabled="disabledControl('A')"
                v-if="
                  ($auth['STANDARD_CODE_UPDATA'] ||
                    $auth['ROLE_STANDARD_CODE_CHANGE']) &&
                  !useWorkflow
                "
                :tooltip-content="
                  disabledControl('A') ? $t('domain.code.changeTooltip') : ``
                "
              >
                {{ $t('domain.common.applyChange') }}
              </datablau-button>
              <datablau-button
                type="normal"
                size="mini"
                @click="toAbandon()"
                :disabled="disabledControl('A')"
                v-if="
                  ($auth['STANDARD_CODE_SCRAP'] ||
                    $auth['ROLE_STANDARD_CODE_DISCARD']) &&
                  useWorkflow
                "
                :loading="toAbandonLoading"
                :tooltip-content="
                  disabledControl('A') ? $t('domain.code.discardTooltip') : ``
                "
              >
                {{ $t('domain.common.applyDiscard') }}
              </datablau-button>
              <datablau-button
                type="normal"
                size="mini"
                @click="toAbandon($t('domain.code.domain'))"
                :disabled="disabledControl('A')"
                v-if="
                  ($auth['STANDARD_CODE_SCRAP'] ||
                    $auth['ROLE_STANDARD_CODE_DISCARD']) &&
                  !useWorkflow
                "
                :loading="toAbandonLoading"
                :tooltip-content="
                  disabledControl('A') ? $t('domain.code.discardTooltip') : ``
                "
              >
                {{ $t('domain.common.applyDiscard') }}
              </datablau-button>
              <datablau-button
                type="normal"
                size="mini"
                @click="moveFolderDialog = true"
                v-if="
                  $auth['STANDARD_CODE_MOVE'] ||
                  $auth['ROLE_STANDARD_CODE_MOVE']
                "
              >
                {{ $t('domain.common.move') }}
              </datablau-button>
            </div>
            <datablau-pagination
              class="pagination-component"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              :pager-count="5"
              layout="total, sizes, prev, pager, next"
              :total="total"
            ></datablau-pagination>
          </div>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'
import newCodeTree from './newTree.vue'
import {
  stateOptions,
  statusFormatter,
  getStatusColor,
} from '@/view/dataStandardGlossary/glossaryConstants'
export default {
  name: 'List',
  data() {
    return {
      dataList: [],
      filteredRules: [],
      tableData: null,
      headers: [],
      rowCanClick: false,
      fullSetting: {
        options: {},
        filters: [],
      },
      filters: [],
      pageSize: 20,
      currentPage: 1,
      total: 0,
      rowClassName: '',
      keyword: '',
      showContent: false,
      tableLoading: false,
      firstTimeout: null,
      tableHeight: null,
      selection: [],
      moveFolderDialog: false,
      toMoveLoading: false,
      toDeleteLoading: false,
      toAbandonLoading: false,
      toPublishLoading: false,
      stateOptions: stateOptions(this),
      searchFormData: {
        keyword: '',
        code: '',
        state: null,
      },
      showTag: false,
      currentTag: null,
      tagNames: null,
      all: 'more',
      statusFormatter,
      getStatusColor,
    }
  },
  inject: ['categoryId', 'headerProduction'],
  props: {
    currentCatalog: {},
    useWorkflow: {
      type: Boolean,
      default: false,
    },
    hasEditAuth: {
      type: Boolean,
      default: true,
    },
    typeIds: {
      type: [Number, String],
    },
  },
  components: {
    newCodeTree,
  },
  computed: {
    // dam 启用时, ddm 页面 数据标准不能编辑
    couldEdit() {
      let bool = true
      if (this.$damEnabled && this.headerProduction.toUpperCase() === 'DDM') {
        bool = false
      }
      return bool
    },
  },
  mounted() {
    // console.log(this.useWorkflow, 'useWorkflow')
    console.log(console.log(this.typeIds, '---'))
  },
  methods: {
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
          const codes = [
            ...this.selection.map(item => {
              return { code: item.code, folderId: item.folderId }
            }),
          ]
          this.$http
            .post(this.$domain_url + `/domains/moveCode?id=${foldId}`, codes)
            .then(res => {
              this.toMoveLoading = false
              this.moveFolderDialog = false
              this.$message.success('操作成功')
              this.handleCurrentChange(1)
            })
            .catch(e => {
              this.toMoveLoading = false
              this.$showFailure(e)
            })
        })
      }
    },
    disabledControl2() {
      let flag = true
      flag = this.selection.every(item => {
        return (
          item.parentDomain &&
          (item.parentDomain.state === 'X' || item.parentDomain.state === 'D')
        )
      })
      return flag
    },
    deleteBtnDisabled() {
      const index = this.selection.findIndex(item => {
        return (
          item.parentDomain &&
          (item.parentDomain.state === 'A' || item.parentDomain.state === 'C')
        )
      })
      return index > -1
    },
    handleClose(v, i) {
      this.currentTag.splice(i, 1)
      this.tagNames.splice(i, 1)
    },
    callTagSelector() {
      this.$bus.$once('tagSelected', ({ keys, names }) => {
        if (keys && names) {
          this.currentTag = keys
          this.tagNames = names
          this.currentPage = 1
        }
      })
      this.$bus.$emit('callSelectorDialog', {
        type: 'tag',
        tagIds: this.currentTag,
        single: false,
        security: false,
      })
    },
    cancelTagSelect() {
      this.currentTag = null
      this.tagNames = null
      this.currentPage = 1
    },
    showFilterTag() {
      this.showTag = !this.showTag
    },
    openDefaultCode() {
      if (this.$route.query.code) {
        // this.$http
        //   .get(
        //     this.$url +
        //       `/service/domains/codes/content?codeNumber=${this.$route.query.code}`
        //   )
        if (
          this.$route.query.showType &&
          this.$route.query.showType === 'code'
        ) {
          HTTP.getCodeContent({
            codeNumber: this.$route.query.code,
            categoryId: this.categoryId,
          }).then(res => {
            this.openScan(res.data)
          })
        } else {
          HTTP.getCodeContent({ codeNumber: this.$route.query.code }).then(
            res => {
              this.openScan(res.data)
            }
          )
        }
      }
    },
    resetData(folderId) {
      this.searchFormData.keyword = ''
      this.searchFormData.state = null
      this.searchFormData.folderId = folderId
      this.handleCurrentChange(1)
    },
    getListData(type) {
      if (!type) {
        this.openDefaultCode()
      }
      this.tableLoading = true
      const obj = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        name: this.searchFormData.keyword,
        state: this.searchFormData.state,
        // TODO i18n
        datasetName:
          this.currentCatalog === '所有标准代码' ? '' : this.currentCatalog,
        tagIds: this.currentTag,
        folderId: this.searchFormData.folderId,
      }
      obj.categoryId = this.categoryId

      HTTP.getCodeListService(obj)
        .then(res => {
          this.tableLoading = false
          this.tableData = res.data.data
          this.total = res.data.total
          setTimeout(() => {
            this.tableHeight = document.documentElement.clientHeight - 190
          })
          if (this.$route.params.code) {
            setTimeout(() => {
              this.openScan(this.$route.params)
            })
          }
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getListData()
    },
    handleCurrentChange(current, type) {
      this.currentPage = current
      this.getListData(type)
    },
    toDelete() {
      this.$DatablauCofirm(
        this.$t('domain.common.delCountConfirm', {
          count: this.selection.length,
        }),
        this.$t('domain.common.tip'),
        'warning',
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      ).then(res => {
        const promiseList = []
        promiseList.push(
          HTTP.deleteCodeService({
            codes: this.selection.map(i => i.realCode),
            categoryId: this.categoryId,
          })
        )
        this.toDeleteLoading = true
        Promise.all(promiseList)
          .then(res => {
            this.toDeleteLoading = false
            this.$message.success(this.$t('domain.common.delSucceed'))
            // refresh tree
            this.$bus.$emit('refreshFinalCallback')
            this.$emit('editSuccess')
          })
          .catch(e => {
            this.toDeleteLoading = false
            this.$showFailure(e)
          })
      })
    },
    // 导出所选
    downloadSelected(type) {
      const url = HTTP.codeExportUrl().split('?')[0]
      const obj = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        name: this.searchFormData.keyword,
        state: this.searchFormData.state,
        // TODO i18n
        datasetName: this.currentCatalog.includes('所有')
          ? ''
          : this.currentCatalog,
        tagIds: this.currentTag,
        categoryId: this.categoryId,
      }
      if (type === 'all') {
        obj.codes = null
      } else if (this.selection && this.selection.length > 0) {
        obj.codes = this.selection.map(s => {
          return s.realCode
        })
      }
      this.$downloadFilePost(url, obj)
    },
    toPublish(typeName) {
      this.toPublishLoading = true
      // TODO i18n
      if (typeName) {
        this.applyCodeState('A')
      } else {
        this.applyCodeState('A')
      }
    },
    toAbandon(typeName) {
      this.$DatablauCofirm(
        this.$t('domain.code.discardConfirm'),
        this.$t('domain.common.warning'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.toAbandonLoading = true
          // TODO i18n
          if (typeName) {
            this.applyCodeState('')
          } else {
            this.applyCodeState('')
          }
        })
        .catch(() => {})
    },
    toChange() {
      if (this.selection.length > 1) {
        this.$message.warning(this.$t('domain.code.changeOnlyOne'))
        return
      }
      if (!this.selection[0].parentDomain?.domainId) {
        console.error('数据错误>>>>', this.selection[0])
        return
      }
      this.selection[0].isUpdate = true
      this.openEdit(this.selection[0])
    },
    applyCodeState(newState) {
      const codeValueLabel = []
      codeValueLabel.push(
        {
          name: this.$t('domain.code.codeValue'),
          value: 'value',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.cName'),
          value: 'name',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.order'),
          value: 'order',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.remark1'),
          value: 'definition',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.remark2'),
          value: 'definition2',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.remark3'),
          value: 'definition3',
          type: 'normal',
        }
      )
      // this.selection.forEach((data, i) => {
      //   HTTP.getCodeContentService({
      //     code: data.code,
      //     categoryId: this.categoryId,
      //   }).then(res => {
      //     const para = {
      //       requestBody: {
      //         processType: processType,
      //         formDefs: [
      //           { code: 'realCode', value: data.realCode },
      //           {
      //             code: 'codeValueLabel',
      //             value: JSON.stringify(codeValueLabel),
      //           },
      //           {
      //             code: 'codeValueValue',
      //             value: res.data.values.length
      //               ? JSON.stringify(res.data.values)
      //               : '',
      //           },
      //         ],
      //       },
      //     }
      const domainIds = this.selection.map(i => i.parentDomain?.domainId)
      const errIdx = domainIds.findIndex(v => !v)
      if (errIdx > -1) {
        console.error('数据错误>>>>>>>>>', errIdx)
        return
      }
      const promise = newState
        ? HTTP.publishCode(this.selection.map(i => i.realCode))
        : HTTP.abolishCode(this.selection.map(i => i.realCode))
      promise
        .then(() => {
          this.$message.success(this.$t('domain.common.applicationSubmitted'))
          this.toAbandonLoading = false
          this.toPublishLoading = false
          this.handleCurrentChange(1)
        })
        .catch(e => {
          this.toAbandonLoading = false
          this.toPublishLoading = false
          this.$showFailure(e)
        })
      // })
      // })
    },
    exportStandards(isAll) {
      if (isAll) {
        const obj = {
          domainCode: this.searchFormData.domainCode,
          chineseName: this.searchFormData.domainName,
          domainState: this.searchFormData.stateValue,
          folderId: this.data.foldId || null,
          submitter: this.searchFormData.submitter,
          firstPublishStart: this.searchFormData.startTime,
          firstPublishEnd: this.searchFormData.endTime,
          orderColumn: ['chineseName', 'domainCode', 'lastModification'],
          ascOrder: [true, false, true],
          currentPage: this.currentPage,
          pageSize: this.pageSize,
        }
        this.$downloadFilePost(
          HTTP.domainExportUrl(),
          obj,
          this.$t('domain.common.dataStandard')
        )
      } else {
        if (!this.selection.length) {
          this.$message.info(this.$t('domain.code.exportCheckTooltip'))
          return
        }
        this.$downloadFilePost(
          HTTP.domainExportUrl(),
          { domainIds: this.selection.map(e => e.domainId) },
          this.$t('domain.common.dataStandard')
        )
      }
    },
    disabledControl(state) {
      return (
        !this.selection.length ||
        this.selection.filter(
          e => e.parentDomain && e.parentDomain.state === state
        ).length !== this.selection.length
      )
    },
    tableSelectionChanged(selection) {
      this.selection = selection
    },
    openScan(row) {
      this.$emit('openCode', row)
    },
    openEdit(row) {
      const obj = _.cloneDeep(row)
      this.$emit('openEdit', 'edit', obj)
    },
    add() {
      this.$emit('add')
    },
    moreHandle(command) {
      switch (command) {
        case 'a':
          this.$emit('codeownload')
          break
        case 'b':
          this.$emit('uploadCodeFile')
          break
        case 'c':
          // this.$emit('codeFildDownload')
          this.downloadSelected('all')
          break
        case 'd':
          this.$emit('openUdp')
          break
      }
    },
  },
  watch: {
    tableLoading: {
      immediate: true,
      handler: function (newValue) {
        if (newValue) {
          this.tableData = null
        }
      },
    },
  },
}
</script>
<style lang="scss">
.en-list-box .input input {
  background-color: #f6f6f6;
  border-radius: 3px;
  border: none;
  height: 30px;
  line-height: 30px;
  width: 240px;
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
.el-form .el-form-item.select-form-item .el-form-item__content {
  min-width: auto !important;
}
</style>
<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.row-list {
  position: absolute;
  top: 54px;
  bottom: 0px;
  width: 100%;
  transition: top 1s;
  &.show-tag {
    top: 88px;
  }
}

.filter-header-btn {
  display: inline-block;

  &:hover {
    background-color: $table-hover-color;
  }
  &.active {
    background-color: $table-hover-color;
  }
}
.circle {
  position: relative;
  bottom: 1px;
  display: inline-block;
  margin-right: 7px;
  background-color: #5cb793;
  border-radius: 3.5px;
  width: 7px;
  height: 7px;
}

.en-list-box {
  padding: 10px 0;
  overflow: auto;
  .filter-line {
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    height: 54px;
  }

  .content {
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 15px 20px;
    z-index: 1;
  }
}

.row-filter {
  margin-top: 18px;
  min-width: 600px;
}

.row-table {
  position: absolute;
  top: 90px;
  left: 20px;
  right: 20px;
  bottom: 50px;
  min-width: 1000px;
  /*outline:1px solid pink;*/
}

.row-pagination {
  width: 100%;

  .left-btn {
    .footer-row-info {
      margin-right: 10px;
    }
  }

  .pagination-component {
    float: right;
  }
}

.filter-item {
  margin-left: 1em;

  .label {
    margin-right: 0.5em;
    color: #20293b;
    font-size: 13px;
  }
}
</style>
