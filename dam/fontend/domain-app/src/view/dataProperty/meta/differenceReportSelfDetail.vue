<template>
  <div
    class="versions-detail"
    style="padding: 0 20px"
    :element-loading-text="$t('meta.DS.treeSubOperation.loadingText')"
  >
    <div class="compareName">
      <div class="compare-message left-cont">
        <div class="message-name">
          <p>
            <span class="message-name-title">
              {{ $t('meta.DS.treeSubOperation.versionInfo') }}
            </span>
            <span>{{ compareIds[0].versionName }}</span>
          </p>
          <p>
            <span class="message-name-title">
              {{ $t('meta.DS.treeSubOperation.createTime') }}：
            </span>
            <span>{{ $timeFormatter(compareIds[0].createTime) }}</span>
          </p>
        </div>
        <div class="editbutton">
          <datablau-button type="secondary" @click="handleClick(compareIds[0])">
            <i class="iconfont icon-bianji"></i>
            {{ $t('meta.DS.treeSubOperation.modifyVersionInfo') }}
          </datablau-button>
        </div>
      </div>
      <div class="middle-cont">
        <p>VS</p>
      </div>
      <div class="compare-message right-cont">
        <div class="message-name">
          <p>
            <span class="message-name-title">
              {{ $t('meta.DS.treeSubOperation.versionInfo') }}
            </span>
            <span>{{ compareIds[1].versionName }}</span>
          </p>
          <p>
            <span class="message-name-title">
              {{ $t('meta.DS.treeSubOperation.createTime') }}：
            </span>
            <span>{{ $timeFormatter(compareIds[1].createTime) }}</span>
          </p>
        </div>
        <div class="editbutton">
          <datablau-button type="secondary" @click="handleClick(compareIds[1])">
            <i class="iconfont icon-bianji"></i>
            {{ $t('meta.DS.treeSubOperation.modifyVersionInfo') }}
          </datablau-button>
        </div>
      </div>
    </div>
    <div class="report-overview">
      <div class="fieldMessage-title">
        <span class="message-title">
          {{ $t('meta.DS.treeSubOperation.reportSummary') }}
        </span>
        <span
          style="color: #f1a90e; font-size: 12px; padding-left: 10px"
          v-if="result.changedObjects"
        >
          <i
            class="el-icon-warning-outline"
            style="
              font-size: 16px;
              padding-top: 1px;
              vertical-align: text-top;
              padding-right: 2px;
            "
          ></i>
          {{ $t('meta.DS.treeSubOperation.dataHasDif') }}
        </span>
      </div>
      <datablau-table
        v-loading="reportverviewloading"
        :data="[
          {
            name: $t('meta.DS.treeSubOperation.table'),
            added: result.table.added,
            modified: result.table.modified,
            removed: result.table.removed,
          },
          {
            name: $t('meta.DS.treeSubOperation.column'),
            added: result.column.added,
            modified: result.column.modified,
            removed: result.column.removed,
          },
          {
            name: $t('meta.DS.treeSubOperation.index'),
            added: result.index.added,
            modified: result.index.modified,
            removed: result.index.removed,
          },
          {
            name: $t('meta.DS.treeSubOperation.view'),
            added: result.view.added,
            modified: result.view.modified,
            removed: result.view.removed,
          },
          {
            name: $t('meta.DS.treeSubOperation.storedPro'),
            added: result.sp.added,
            modified: result.sp.modified,
            removed: result.sp.removed,
          },
          {
            name: $t('meta.DS.treeSubOperation.function'),
            added: result.func.added,
            modified: result.func.modified,
            removed: result.func.removed,
          },
        ]"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
        :height="'282px'"
        style="margin-top: 10px"
      >
        <el-table-column
          prop="name"
          :label="$t('meta.DS.treeSubOperation.type')"
        ></el-table-column>
        <el-table-column
          prop="added"
          :label="$t('meta.DS.treeSubOperation.add')"
        >
          <template slot-scope="scope">
            <span
              class="no-difference"
              :class="{ difference: scope.row.added > 0 }"
            >
              {{ scope.row.added }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="modified"
          :label="$t('meta.DS.treeSubOperation.change')"
        >
          <template slot-scope="scope">
            <span
              class="no-difference"
              :class="{ difference: scope.row.modified > 0 }"
            >
              {{ scope.row.modified }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="removed"
          :label="$t('meta.DS.treeSubOperation.del')"
        >
          <template slot-scope="scope">
            <span
              class="no-difference"
              :class="{ difference: scope.row.removed > 0 }"
            >
              {{ scope.row.removed }}
            </span>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="variance-report-details">
      <div class="fieldMessage-title">
        <span class="message-title">
          {{ $t('meta.DS.treeSubOperation.difReportDetail') }}
        </span>
      </div>
      <div class="details-search">
        <el-radio-group
          @change="radioSearchChange"
          v-model="radioSearch"
          size="medium"
        >
          <el-radio-button label="table">
            {{ $t('meta.DS.treeSubOperation.table') }}
          </el-radio-button>
          <el-radio-button label="columns">
            {{ $t('meta.DS.treeSubOperation.column') }}
          </el-radio-button>
          <el-radio-button label="all">
            {{ $t('meta.DS.treeSubOperation.all') }}
          </el-radio-button>
        </el-radio-group>
        <datablau-button
          style="float: right"
          type="secondary"
          @click="downloadDetails"
          v-if="radioSearch === 'all'"
        >
          <i class="iconfont icon-download"></i>
          {{ $t('meta.DS.treeSubOperation.downloadDetail') }}
        </datablau-button>
        <div class="screen-part">
          <datablau-input
            v-if="radioSearch !== 'all'"
            style="width: 300px; display: inline-block"
            v-model="screenValue"
            :iconfont-state="true"
            :placeholder="$t('meta.DS.treeSubOperation.cnNameOrEnName')"
            clearable
          ></datablau-input>
          <div class="screen-part-select" v-if="radioSearch !== 'all'">
            <span>{{ $t('meta.DS.treeSubOperation.changeStatus') }}：</span>
            <datablau-select-weak
              style="width: 120px; display: inline-block"
              ref="nodeOptionsSelect"
              :optionsData="{
                data: stateOptions,
                key: 'value',
                value: 'value',
                label: 'label',
              }"
              @change="stateValueChange"
              v-model="stateValue"
              :placeholder="$t('meta.common.pleaseSelect')"
              clearable
            ></datablau-select-weak>
            <p class="identification">
              <span class="delete">
                <i class="circle delete"></i>
                {{ $t('common.button.delete') }}
              </span>
              <span class="modify">
                <i class="circle modify"></i>
                {{ $t('common.button.modify') }}
              </span>
              <span class="added">
                <i class="circle added"></i>
                {{ $t('meta.DS.treeSubOperation.add') }}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div v-if="radioSearch === 'table'" class="report-details">
        <div class="report-details-first">
          <div class="first-title">
            <p>{{ compareIds[0].versionName }}</p>
          </div>
          <datablau-table
            :data="tablesData"
            :data-selectable="tablesDataOption.selectable"
            :auto-hide-selection="tablesDataOption.autoHideSelectable"
            :show-column-selection="tablesDataOption.showColumnSelection"
            :column-selection="tablesDataOption.columnSelection"
            :border="tablesDataOption.columnResizable"
            :row-style="TableRowStyle"
            :max-height="300 + 'px'"
            v-loading="tablesDataloading"
            ref="tabelRef1"
          >
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.enName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <p
                  :class="{
                    add: scope.row.type === 'ADD',
                    remove: scope.row.type === 'REMOVE',
                    modify: scope.row.type === 'MODIFY',
                  }"
                >
                  {{ scope.row.tagPhysicalName }}
                </p>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.cnName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.tagLogicalName }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.difColumn')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{
                  scope.row.type === 'REMOVE' ? '' : scope.row.tagDiffColumnSize
                }}
              </template>
            </el-table-column>
          </datablau-table>
        </div>
        <div class="report-details-sencond">
          <div class="sencond-title">
            <p>{{ compareIds[1].versionName }}</p>
          </div>
          <datablau-table
            :data="tablesData"
            :data-selectable="tablesDataOption.selectable"
            :auto-hide-selection="tablesDataOption.autoHideSelectable"
            :show-column-selection="tablesDataOption.showColumnSelection"
            :column-selection="tablesDataOption.columnSelection"
            :border="tablesDataOption.columnResizable"
            :row-style="TableRowStyle2"
            :max-height="300 + 'px'"
            v-loading="tablesDataloading"
            ref="tabelRef2"
          >
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.enName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <p
                  :class="{
                    add: scope.row.type === 'ADD',
                    remove: scope.row.type === 'REMOVE',
                    modify: scope.row.type === 'MODIFY',
                  }"
                >
                  {{
                    scope.row.type !== 'ADD' ? scope.row.srcPhysicalName : ''
                  }}
                </p>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.cnName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.type !== 'ADD' ? scope.row.srcLogicalName : '' }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.difColumn')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{
                  scope.row.type !== 'ADD' ? scope.row.srcDiffColumnSize : ''
                }}
              </template>
            </el-table-column>
          </datablau-table>
        </div>
        <div class="report-details-pagination">
          <datablau-pagination
            style="margin-top: 10px; margin-bottom: 20px; text-align: right"
            @size-change="handleSizeChangeTable"
            @current-change="handleCurrentChangeTable"
            :current-page="currentPageTable"
            :page-sizes="[20, 50, 100, 500]"
            :page-size="pageSizeTable"
            :layout="'total, sizes, prev, pager, next, jumper'"
            :total="totalItems"
          ></datablau-pagination>
        </div>
      </div>
      <div v-if="radioSearch === 'columns'" class="report-details">
        <div class="report-details-first">
          <div class="first-title">
            <p>{{ compareIds[0].versionName }}</p>
          </div>
          <datablau-table
            :data="columnsData"
            :data-selectable="tablesDataOption.selectable"
            :auto-hide-selection="tablesDataOption.autoHideSelectable"
            :show-column-selection="tablesDataOption.showColumnSelection"
            :column-selection="tablesDataOption.columnSelection"
            :border="tablesDataOption.columnResizable"
            :row-style="TableRowStyle"
            :max-height="300 + 'px'"
            v-loading="columnsDataloading"
            ref="columnsRef1"
          >
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.enName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <p
                  :class="{
                    add: scope.row.type === 'ADD',
                    remove: scope.row.type === 'REMOVE',
                    modify: scope.row.type === 'MODIFY',
                  }"
                >
                  {{ scope.row.tagPhysicalName }}
                </p>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.cnName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.tagLogicalName }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.columnAnnotation')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.tagDefinition }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.columnType')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.tagType }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.id')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.tagkeyValue }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.defaultVal')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.tagDefault }}
              </template>
            </el-table-column>
          </datablau-table>
        </div>
        <div class="report-details-sencond">
          <div class="sencond-title">
            <p>{{ compareIds[1].versionName }}</p>
          </div>
          <datablau-table
            :data="columnsData"
            :data-selectable="tablesDataOption.selectable"
            :auto-hide-selection="tablesDataOption.autoHideSelectable"
            :show-column-selection="tablesDataOption.showColumnSelection"
            :column-selection="tablesDataOption.columnSelection"
            :border="tablesDataOption.columnResizable"
            :row-style="TableRowStyle2"
            :max-height="300 + 'px'"
            v-loading="columnsDataloading"
            ref="columnsRef2"
          >
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.enName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <p
                  :class="{
                    add: scope.row.type === 'ADD',
                    remove: scope.row.type === 'REMOVE',
                    modify: scope.row.type === 'MODIFY',
                  }"
                >
                  {{
                    scope.row.type !== 'ADD' ? scope.row.srcPhysicalName : ''
                  }}
                </p>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.cnName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.type !== 'ADD' ? scope.row.srcLogicalName : '' }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.columnAnnotation')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.srcDefinition }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.columnType')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.srcType }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.id')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.srckeyValue }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.treeSubOperation.defaultVal')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.srcDefault }}
              </template>
            </el-table-column>
          </datablau-table>
        </div>
        <div class="report-details-pagination">
          <datablau-pagination
            style="margin-top: 10px; margin-bottom: 20px; text-align: right"
            @size-change="handleSizeChangeColumns"
            @current-change="handleCurrentChangeColumns"
            :current-page="currentPageColumns"
            :page-sizes="[20, 50, 100, 500]"
            :page-size="pageSizeColumns"
            :layout="'total, sizes, prev, pager, next, jumper'"
            :total="totalItemsColumns"
          ></datablau-pagination>
        </div>
      </div>
      <div v-if="radioSearch === 'all'">
        <report-detail
          :tableData="tableData"
          :data="data"
          :compareVersions="compareVersions"
          :versionState="true"
        ></report-detail>
      </div>
    </div>

    <!-- <div class="preview" style="max-width: 1000px">
      <div class="sub-title part-title">报告概述</div>
      <el-form
        class="page-form"
        label-position="right"
        label-width="60px"
        size="small"
      >
        <el-table
          :data="[
            {
              name: '表',
              added: result.table.added,
              modified: result.table.modified,
              removed: result.table.removed,
            },
            {
              name: '字段',
              added: result.column.added,
              modified: result.column.modified,
              removed: result.column.removed,
            },
            {
              name: '索引',
              added: result.index.added,
              modified: result.index.modified,
              removed: result.index.removed,
            },
            {
              name: '视图',
              added: result.view.added,
              modified: result.view.modified,
              removed: result.view.removed,
            },
            {
              name: '存储过程',
              added: result.sp.added,
              modified: result.sp.modified,
              removed: result.sp.removed,
            },
            {
              name: '函数',
              added: result.func.added,
              modified: result.func.modified,
              removed: result.func.removed,
            },
          ]"
          class="plain-table"
          ref="multipleTable"
          :stripe="true"
          border
        >
          <el-table-column prop="name" label="类型"></el-table-column>
          <el-table-column prop="added" label="新增"></el-table-column>
          <el-table-column prop="modified" label="变化"></el-table-column>
          <el-table-column prop="removed" label="删除"></el-table-column>
        </el-table>
      </el-form>
    </div>
    <report-detail
      :tableData="tableData"
      :data="data"
      :compareVersions="compareVersions"
    ></report-detail> -->
  </div>
</template>

<script>
import reportDetail from './modelCompareReportDetail.vue'
export default {
  components: { reportDetail },
  props: ['detail', 'compareIds'],
  data() {
    return {
      data: {},
      tableData: [],
      result: {
        table: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        column: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        view: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        index: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        sp: {
          added: 0,
          removed: 0,
          modified: 0,
        },
        func: {
          added: 0,
          removed: 0,
          modified: 0,
        },
      },
      option: {
        showColumnSelection: false,
        // columnSelection: [],
        columnResizable: true,
      },
      radioSearch: 'table',
      stateOptions: [
        {
          value: 'REMOVE',
          label: this.$t('meta.DS.treeSubOperation.del'),
        },
        {
          value: 'MODIFY',
          label: this.$t('meta.DS.treeSubOperation.modify'),
        },
        {
          value: 'ADD',
          label: this.$t('meta.DS.treeSubOperation.add'),
        },
      ],
      stateValue: '',
      screenValue: '',
      tablesDataArr: [],
      tablesData: [],
      tablesDataOption: {
        selectable: false,
        autoHideSelectable: false,
        showColumnSelection: false,
        // columnSelection: [],
        columnResizable: false,
      },
      currentPageTable: 1,
      pageSizeTable: 20,
      totalItems: 0,
      columnsData: [],
      columnsDataArr: [],
      currentPageColumns: 1,
      pageSizeColumns: 20,
      totalItemsColumns: 0,
      columnsDataloading: true,
      tablesDataloading: true,
      compareVersions: {},
      loadingAll: true,
      reportverviewloading: true,
      dom1: null,
      dom2: null,
      dom3: null,
      dom4: null,
    }
  },
  methods: {
    listenerScroll() {
      this.dom2.addEventListener('scroll', () => {
        // 横滚
        this.dom1.scrollLeft = this.dom2.scrollLeft
        // 竖滚
        this.dom1.scrollTop = this.dom2.scrollTop
      })
      this.dom1.addEventListener('scroll', () => {
        // 横滚
        this.dom2.scrollLeft = this.dom1.scrollLeft
        // 竖滚
        this.dom2.scrollTop = this.dom1.scrollTop
      })
    },
    listenerScroll2() {
      this.dom3.addEventListener('scroll', () => {
        // 横滚
        this.dom4.scrollLeft = this.dom3.scrollLeft
        // 竖滚
        this.dom4.scrollTop = this.dom3.scrollTop
      })
      this.dom4.addEventListener('scroll', () => {
        // 横滚
        this.dom3.scrollLeft = this.dom4.scrollLeft
        // 竖滚
        this.dom3.scrollTop = this.dom4.scrollTop
      })
    },
    downloadDetails() {
      let url = `${this.$url}/service/entities/version/compare/download`
      let obj = {
        startVersion: this.compareIds[0].version,
        endVersion: this.compareIds[1].version,
        modelId: this.compareIds[0].modelId,
      }
      this.$downloadFilePost(url, obj)
    },
    TableRowStyle({ row, rowIndex }) {
      let rowBackground = {}
      if (row.type.includes('ADD')) {
        rowBackground.background = 'rgba(102, 191, 22, 0.1)'
        // rowBackground.color = '#66BF16'
        return rowBackground
      } else if (row.type.includes('MODIFY')) {
        rowBackground.background = 'rgba(238, 157, 0, 0.1)'
        // rowBackground.color = '#EE9D00'
        return rowBackground
      }
    },
    TableRowStyle2({ row, rowIndex }) {
      let rowBackground = {}
      if (row.type.includes('REMOVE')) {
        rowBackground.background = 'rgba(242, 34, 10, 0.1)'
        // rowBackground.color = '#F2220A'
        return rowBackground
      } else if (row.type.includes('MODIFY')) {
        rowBackground.background = 'rgba(238, 157, 0, 0.1)'
        // rowBackground.color = '#EE9D00'
        return rowBackground
      }
    },
    radioSearchChange(value) {
      this.screenValue = ''
      this.stateValue = ''
      if (value === 'table') {
        this.getComparePage(80000004)
      } else if (value === 'columns') {
        this.getComparePage(80000005)
      } else {
        this.getCompare()
      }
    },
    editName(data) {
      this.compareIds.forEach((element, index) => {
        if (element.version === data.version) {
          this.$set(this.compareIds, index, data)
        }
      })
    },
    handleClick(data) {
      this.$emit('editVersions', data, true)
    },
    stateValueChange() {
      let typeId = this.radioSearch === 'table' ? 80000004 : 80000005
      this.getComparePage(typeId)
    },
    getCompare() {
      let response = {
        startVersion: this.compareIds[0].version,
        endVersion: this.compareIds[1].version,
        modelId: this.compareIds[0].modelId,
      }
      this.$http
        .post(this.$url + '/service/entities/version/compare', response)
        .then(res => {
          // this.getCompareDetail()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getCompareDetail() {
      let response = {
        startVersion: this.compareIds[0].version,
        endVersion: this.compareIds[1].version,
        modelId: this.compareIds[0].modelId,
      }
      this.$http
        .post(
          this.$url + '/service/entities/version/compare/getCompareDetail',
          response
        )
        .then(res => {
          this.result = res.data
          this.reportverviewloading = false

          // if (this.radioSearch === 'all') {
          this.compareVersions = {
            right: this.compareIds[0].versionName,
            left: this.compareIds[1].versionName,
          }
          this.tableData = res.data.compareResult.differences
          this.data = res.data.compareResult
          // }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getComparePage(typeId) {
      let response = {
        startVersion: this.compareIds[0].version,
        endVersion: this.compareIds[1].version,
        modelId: this.compareIds[0].modelId,
        keyword: this.screenValue,
        typeId: typeId,
      }
      if (this.radioSearch === 'table') {
        response.currentPage = this.currentPageTable
        response.pageSize = this.pageSizeTable
      } else if (this.radioSearch === 'columns') {
        response.currentPage = this.currentPageColumns
        response.pageSize = this.pageSizeColumns
      }
      if (this.stateValue !== '') {
        response.changeType = this.stateValue
      }
      this.$http
        .post(
          this.$url + '/service/entities/version/compare/getComparePage',
          response
        )
        .then(res => {
          if (this.radioSearch === 'table') {
            this.tablesData = res.data.content
            this.totalItems = res.data.totalItems
            this.loadingAll = false
            this.tablesDataloading = false
            this.dom1 = this.$refs.tabelRef1.$refs.table.$refs.bodyWrapper
            this.dom2 = this.$refs.tabelRef2.$refs.table.$refs.bodyWrapper
            this.listenerScroll()
          } else if (this.radioSearch === 'columns') {
            res.data.content.forEach(col => {
              col.tagkeyValue = (function () {
                let ret = ''
                col.tagKey.forEach(function (val) {
                  switch (val.type) {
                    case 'PrimaryKey':
                      ret += ',PK'
                      break
                    case 'ForeignKey':
                      ret += ',FK'
                      break
                    case 'NonUniqueKey':
                      ret += ',NK'
                      break
                    case 'UniqueKey':
                      ret += ',UK'
                      break
                    default:
                      ret += this.$t('meta.DS.treeSubOperation.unknow')
                      break
                  }
                })
                return ret.slice(1)
              })()
              col.srckeyValue = (function () {
                let ret = ''
                col.srcKey.forEach(function (val) {
                  switch (val.type) {
                    case 'PrimaryKey':
                      ret += ',PK'
                      break
                    case 'ForeignKey':
                      ret += ',FK'
                      break
                    case 'NonUniqueKey':
                      ret += ',NK'
                      break
                    case 'UniqueKey':
                      ret += ',UK'
                      break
                    default:
                      ret += this.$t('meta.DS.treeSubOperation.unknow')
                      break
                  }
                })
                return ret.slice(1)
              })()
            })
            this.columnsData = res.data.content
            this.totalItemsColumns = res.data.totalItems
            this.columnsDataloading = false
            this.dom3 = this.$refs.columnsRef1.$refs.table.$refs.bodyWrapper
            this.dom4 = this.$refs.columnsRef2.$refs.table.$refs.bodyWrapper
            this.listenerScroll2()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChangeTable(val) {
      this.currentPageTable = 1
      this.pageSizeTable = val
      this.getComparePage(80000004)
    },
    handleCurrentChangeTable(val) {
      this.currentPageTable = val
      this.getComparePage(80000004)
    },
    handleSizeChangeColumns(val) {
      this.currentPageColumns = 1
      this.pageSizeColumns = val
      this.getComparePage(80000005)
    },
    handleCurrentChangeColumns(val) {
      this.currentPageColumns = val
      this.getComparePage(80000005)
    },
    compare(property, desc) {
      return function (a, b) {
        var value1 = a[property]
        var value2 = b[property]
        if (desc == true) {
          // 升序排列
          return value1 - value2
        } else {
          // 降序排列
          return value2 - value1
        }
      }
    },
    filtData() {
      const keyword = this.screenValue.trim().toLowerCase()
      if (this.radioSearch === 'table') {
        this.tablesData = []
        this.tablesDataArr.forEach(item => {
          if (!item.tagPhysicalName || item.tagPhysicalName === null) {
            item.tagPhysicalName = ''
          }
          if (!item.tagLogicalName || item.tagLogicalName === null) {
            item.tagLogicalName = ''
          }
          if (!item.srcPhysicalName || item.srcPhysicalName === null) {
            item.srcPhysicalName = ''
          }
          if (!item.srcLogicalName || item.srcLogicalName === null) {
            item.srcLogicalName = ''
          }
          if (
            item.tagPhysicalName
              .toLowerCase()
              .indexOf(this.screenValue.trim().toLowerCase()) > -1 ||
            item.tagLogicalName
              .toLowerCase()
              .indexOf(this.screenValue.trim().toLowerCase()) > -1 ||
            item.srcPhysicalName
              .toLowerCase()
              .indexOf(this.screenValue.trim().toLowerCase()) > -1 ||
            item.srcLogicalName
              .toLowerCase()
              .indexOf(this.screenValue.trim().toLowerCase()) > -1
          ) {
            if (this.stateValue !== '') {
              if (item.type === this.stateValue) {
                this.tablesData.push(item)
              }
            } else {
              this.tablesData.push(item)
            }
          }
        })
        let s = this.pageSizeTable
        let c = this.currentPageTable
        this.tablesData = this.tablesData.slice(s * (c - 1), s * c)
      }
      if (this.radioSearch === 'columns') {
        this.columnsData = []
        this.columnsDataArr.forEach(item => {
          if (!item.tagPhysicalName || item.tagPhysicalName === null) {
            item.tagPhysicalName = ''
          }
          if (!item.tagLogicalName || item.tagLogicalName === null) {
            item.tagLogicalName = ''
          }
          if (!item.srcPhysicalName || item.srcPhysicalName === null) {
            item.srcPhysicalName = ''
          }
          if (!item.srcLogicalName || item.srcLogicalName === null) {
            item.srcLogicalName = ''
          }
          if (
            item.tagPhysicalName
              .toLowerCase()
              .indexOf(this.screenValue.trim().toLowerCase()) > -1 ||
            item.tagLogicalName
              .toLowerCase()
              .indexOf(this.screenValue.trim().toLowerCase()) > -1 ||
            item.srcPhysicalName
              .toLowerCase()
              .indexOf(this.screenValue.trim().toLowerCase()) > -1 ||
            item.srcLogicalName
              .toLowerCase()
              .indexOf(this.screenValue.trim().toLowerCase()) > -1
          ) {
            if (this.stateValue !== '') {
              if (item.type === this.stateValue) {
                this.columnsData.push(item)
              }
            } else {
              this.columnsData.push(item)
            }
          }
        })
        let s = this.pageSizeColumns
        let c = this.currentPageColumns
        this.columnsData = this.columnsData.slice(s * (c - 1), s * c)
      }
    },
  },
  mounted() {
    // const detail = this.detail
    // this.data = detail.data
    // this.tableData = detail.tableData
    // this.result = detail.result
    this.compareIds = this.compareIds.sort(this.compare('version'), false)
    this.getCompareDetail()
    this.getCompare()
    this.getComparePage(80000004)
  },
  watch: {
    screenValue(val) {
      let typeId = this.radioSearch === 'table' ? 80000004 : 80000005
      this.getComparePage(typeId)
    },
  },
}
</script>

<style lang="scss" scoped="scoped">
@import './differenceReport.scss';
</style>
<style lang="scss">
.details-search {
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    color: #409eff;
  }
  .el-radio-button .el-radio-button__inner {
    padding: 9px 23px;
  }
  .el-radio-button:first-child .el-radio-button__inner {
    border-radius: 0;
  }
  .el-radio-button:last-child .el-radio-button__inner {
    border-radius: 0;
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    border-color: #409eff;
  }
  .el-radio-button {
    &:nth-of-type(2) {
      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        border-left: 1px solid #409eff;
      }
      .el-radio-button__inner {
        border-left: 1px solid transparent;
      }
    }
    &:nth-of-type(3) {
      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        border-left: 1px solid #409eff;
      }
      .el-radio-button__inner {
        border-left: 1px solid transparent;
      }
    }
  }
  .el-radio-button:hover .el-radio-button__inner {
    background: rgba(64, 158, 255, 0.1);
  }
}
</style>
