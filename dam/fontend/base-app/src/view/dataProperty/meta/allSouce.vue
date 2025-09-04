<template>
  <div id="data-source" class="tab-page tabPageAbs">
    <datablau-dialog
      :visible.sync="reDialog"
      :title="$t('meta.reManage.reInfo')"
      append-to-body
      size="s"
      height="400"
    >
      <div class="reContent">
        <datablau-detail
          label-width="100px"
          :model="reForm"
          :column="1"
          :fullWidth="true"
          v-if="!isReport"
        >
          <el-form-item :label="$t('meta.reManage.name')">
            <span class="reFormItem" :title="reForm.definition">
              {{ reForm.definition }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('meta.reManage.system')" v-show="isFile">
            <span class="reFormItem" :title="reForm.categoryName">
              {{ reForm.categoryName }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.datasource')"
            v-show="!isFile"
          >
            <span class="reFormItem" :title="reForm.datasourceName">
              {{ reForm.datasourceName }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('meta.reManage.db')">
            <span class="reFormItem" :title="reForm.type">
              {{
                reForm.type === 'DATADICTIONARY_LOGICAL'
                  ? 'Data Dictionary (Logical)'
                  : reForm.type === 'DATADICTIONARY'
                  ? 'Data Dictionary (Physical)'
                  : reForm.type
              }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('meta.reManage.driver')" v-show="!isFile">
            <span class="reFormItem" :title="reForm.driverName">
              {{ reForm.driverName }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('meta.reManage.server')" v-show="!isFile">
            <span class="reFormItem" :title="reForm.HostServer">
              {{ reForm.HostServer }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.dataConnect')"
            v-show="!isFile"
          >
            <span class="reFormItem" :title="reForm.dataConnect">
              {{ reForm.dataConnect }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.dataSample')"
            v-show="!isFile"
          >
            <span class="reFormItem" :title="reForm.dataSample">
              {{ reForm.dataSample }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.backupDatasource')"
            v-show="!isFile"
          >
            <span class="reFormItem" :title="reForm.backupDatasourceName">
              {{ reForm.backupDatasourceName }}
            </span>
          </el-form-item>
          <!--          文件 -->
          <el-form-item :label="$t('meta.reManage.reType')" v-if="isFile">
            <span class="reFormItem" :title="reForm.reType">
              {{ reForm.reType }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.fileName')"
            v-if="isFile && !isAuto"
          >
            <span class="reFormItem" :title="reForm.fileName">
              {{ reForm.fileName }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.filePath')"
            v-if="isFile && isAuto"
          >
            <span class="reFormItem" :title="reForm.filePath">
              {{ reForm.filePath }}
            </span>
          </el-form-item>
        </datablau-detail>
        <datablau-detail
          label-width="100px"
          :model="reForm"
          :column="1"
          :fullWidth="true"
          v-else
        >
          <el-form-item :label="$t('meta.reManage.name')">
            <span class="reFormItem" :title="reForm.definition">
              {{ reForm.definition }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('meta.reManage.reportType')">
            <span class="reFormItem" :title="reForm.biType">
              {{ reForm.biType }}
            </span>
          </el-form-item>
          <el-form-item
            label="Dispatcher URI"
            v-if="reForm.biType === 'COGNOS'"
          >
            <span class="reFormItem" :title="reForm.CM_URL">
              {{ reForm.CM_URL }}
            </span>
          </el-form-item>
          <el-form-item label="Gateway URI" v-if="reForm.biType === 'COGNOS'">
            <span class="reFormItem" :title="reForm.GATEWAY_URL">
              {{ reForm.GATEWAY_URL }}
            </span>
          </el-form-item>
          <el-form-item :label="$t('meta.reManage.server1')">
            <span class="reFormItem" :title="reForm.HostServer">
              {{ reForm.HostServer }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.namespace')"
            v-if="reForm.biType === 'COGNOS'"
          >
            <span class="reFormItem" :title="reForm.NAMINGSPACE">
              {{ reForm.NAMINGSPACE }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.version')"
            v-if="reForm.biType === 'SMARTBI'"
          >
            <span class="reFormItem" :title="reForm.version">
              {{ reForm.version }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('meta.reManage.finePath')"
            v-if="reForm.biType === 'FINE_REPORT'"
          >
            <span class="reFormItem" :title="reForm.reportBaseUrl">
              {{ reForm.reportBaseUrl }}
            </span>
          </el-form-item>
        </datablau-detail>
      </div>
    </datablau-dialog>
    <datablau-filter-row>
      <datablau-input
        :iconfont-state="true"
        :placeholder="$t('meta.DS.allSource.dataSourceName')"
        v-model="filterForm.modelName"
        style="display: inline-block"
        clearable
        @keydown.enter.native="handleCurrentChange(1)"
      ></datablau-input>
      <span class="label-info">
        {{ $t('meta.DS.allSource.businessSystem') }}：
      </span>
      <datablau-select
        v-model="filterForm.categoryId"
        @change="handleChange"
        filterable
        clearable
        style="display: inline-block"
        :no-data-text="$t('meta.dataSource.noSystem')"
      >
        <el-option
          v-for="c in optionsData"
          :title="c.categoryName"
          :label="c.categoryName"
          :value="c.categoryId"
          :key="c.categoryId"
        ></el-option>
      </datablau-select>
      <!--      <datablau-select-weak
        style="display: inline-block"
        clearable
        filterable
        @change="handleChange"
        v-model="filterForm.categoryId"
        :optionsData="{
          data: optionsData,
          key: 'categoryId',
          value: 'categoryId',
          label: 'categoryName',
        }"
      >
        &lt;!&ndash; <el-option
          v-for="item in optionsData"
          :key="item.categoryId"
          :label="
            item.categoryId === 0
              ? item.categoryName
              : item.categoryName + '(' + item.categoryAbbreviation + ')'
          "
          :value="item.categoryId"
          :disabled="item.disabled"
        ></el-option> &ndash;&gt;
        <el-option :label="123"></el-option>
      </datablau-select-weak>-->
      <div class="right-btn"></div>
    </datablau-filter-row>
    <div class="table-row">
      <datablau-table
        class="datablau-table-info"
        ref="dsTable"
        :data="displayData"
        :key="dsDataKey"
        height="100%"
        :header-cell-class-name="cellClass"
        highlight-current-row
        @sort-change="handleSortChange"
        :checkDisabledObj="checkDisabledObj"
        :border="option.columnResizable"
      >
        <el-table-column
          :width="$i18n.locale === 'zh' ? '' : 140"
          :label="$t('meta.DS.allSource.dataSourceName')"
          prop="definition"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.DS.allSource.dataBase')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <!-- {{ scope.row.type }} -->
            <database-type
              :key="scope.row.type"
              :value="scope.row.type"
              :size="24"
            ></database-type>
          </template>
        </el-table-column>
        <el-table-column
          prop="categoryName"
          :width="$i18n.locale === 'zh' ? '120' : 140"
          :label="$t('meta.DS.allSource.businessSystem')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="tableCount"
          :width="$i18n.locale === 'zh' ? 90 : 120"
          :label="$t('meta.DS.allSource.tableCount')"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          prop="columnCount"
          sortable="custom"
          :width="$i18n.locale === 'zh' ? 100 : 130"
          :label="$t('meta.DS.allSource.columnCount')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="monthUpdateCount"
          :width="$i18n.locale === 'zh' ? 160 : 180"
          sortable="custom"
          :label="$t('meta.DS.allSource.monthUpdateCount')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :width="$i18n.locale === 'zh' ? '' : 100"
          prop="businessOrg"
          :label="$t('meta.DS.allSource.buDep')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="itOrg"
          min-width="100"
          :label="$t('meta.DS.allSource.techDep')"
          show-overflow-tooltip
        ></el-table-column>

        <el-table-column
          :label="$t('meta.DS.allSource.operation')"
          width="150"
          header-align="center"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <div class="tool" v-if="scope.row.modelId !== 'fake'">
              <datablau-button
                low-key
                type="icon"
                :title="$t('meta.DS.treeSubOperation.version')"
                class="btn-in-table-info"
                @click="newOpenModelHistory(scope.row)"
              >
                <i class="iconfont icon-banben"></i>
              </datablau-button>
              <datablau-subscribe
                type-id="80010001"
                :key="scope.row.modelId"
                :object-name="scope.row.definition"
                :object-id="scope.row.modelId"
                class="btn-in-table-info"
                display-type="icon"
              ></datablau-subscribe>
              <el-dropdown @command="commandHandle(...arguments, scope.row)">
                <datablau-button
                  low-key
                  type="icon"
                  :title="$t('common.button.more')"
                  class="btn-in-table-info"
                >
                  <i class="el-icon-more"></i>
                </datablau-button>
                <el-dropdown-menu slot="dropdown" class="drop-menu-info">
                  <el-dropdown-item
                    :command="updateExport(scope.row, 'export')"
                    v-if="$auth['EXPORT_METADATA']"
                  >
                    {{ $t('meta.DS.allSource.exportMetadata') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="update(scope.row, 'update')"
                    v-if="$auth['UPDATA_METADATA']"
                  >
                    {{ $t('meta.DS.allSource.updateMetadata') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    :divided="
                      $auth['EXPORT_METADATA'] || $auth['UPDATA_METADATA']
                    "
                    v-if="$versionFeature['metadata_ModelCompare']"
                    :command="
                      openModelCompareJob(scope.row, 'openModelCompareJob')
                    "
                  >
                    {{ $t('meta.DS.allSource.modelDiffAndSync') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="openModelHistory(scope.row, 'openModelHistory')"
                  >
                    {{ $t('meta.DS.allSource.changeHistory') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="openReDialog(scope.row, 'openReDialog')"
                  >
                    {{ $t('meta.reManage.title') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <i v-else class="el-icon-loading"></i>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="footer-row">
      <datablau-pagination
        style="float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import DatabaseType from '@/components/dataSource/DatabaseType.vue'

import HTTP from '@/http/main'
import DatablauSelect from '@/next/components/basic/select/DatablauSelect.vue'
const moment = require('moment')
export default {
  data() {
    // this.BASE_URL = this.$url + '/service/'
    this.BASE_URL = this.$meta_url + '/service/'
    this.uploadHost = this.BASE_URL + 'upload'
    const accessModelCompare = this.$ddmConnectable
    return {
      reDialog: false,
      reForm: {},
      sortMap: {},
      filterForm: {
        modelName: '',
        categoryId: 0,
      },
      vloading: false,
      optionsData: [],
      accessModelCompare: accessModelCompare,
      // 显示table
      selection: [],
      selectCal: 0,
      deltaData: [],
      allData: [],
      total: 0,
      dsData: [], // 过滤后的数组
      dsDataKey: 0,
      testBtnKey: 0,
      displayData: null,
      keyword: '',
      keywordFilterProps: ['definition', 'type', 'categoryName'],
      emptyPara: {
        keyword: '',
        currentPage: 1,
        sortData: {
          prop: '',
          order: 'ascending',
        },
        pageSize: 20,
      },
      sortData: {
        prop: '',
        order: 'ascending',
      },
      loadingDS: true,
      deleteDisabled: true,
      currentRow: null,
      tableHeight: undefined,
      showTable: false,
      currentPage: 1,
      pageSize: 20,

      // 修改,添加 数据源
      schemaSelected: [],
      isEditing: false,
      dsform: {},
      updateDataSource: false,
      autoSetJob: {
        modelId: '',
        modelName: '',
      },
      currentModelId: null,
      expandRowKeys: [],
      mutipleLength: 0,
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      checkDisabledObj: {
        modelId: ['fake'],
      },
      isFile: false,
      isReport: false,
      isAuto: false,
    }
  },
  props: {},

  components: { DatabaseType, DatablauSelect },

  computed: {
    isFileData() {
      var self = this
      var ds = self.dsform
      return (
        ds.dbtype == 'CSV' ||
        ds.dbtype == 'EXCEL' ||
        ds.dbtype == 'DATADICTIONARY' ||
        ds.dbtype == 'DATADICTIONARY_LOGICAL' ||
        ds.dbtype == 'TABLEAU'
      )
    },
  },
  beforeMount() {
    this.optionsData = [
      {
        categoryName: this.$t('meta.DS.allSource.allSystem'),
        categoryId: 0,
      },
      ...this.$modelCategories,
    ]
  },
  mounted() {
    this.getTableData()
  },
  beforeDestroy() {},

  methods: {
    cellClass(row) {
      if (row.columnIndex === 0) {
        return 'disableheadselection'
      }
    },
    commandHandle(commandData) {
      let command = commandData.command
      let data = commandData.data
      data.id = commandData.data.modelId
      if (command === 'export') {
        this.export(data)
      } else if (command === 'update') {
        this.newUpdate(data)
      } else if (command === 'openModelCompareJob') {
        this.newOpenModelCompareJob(data)
      } else if (command === 'openModelHistory') {
        this.newOpenModelHistory(data)
      } else if (command === 'openModelCompare') {
        this.newOpenModelCompare(data)
      } else if (command === 'openReDialog') {
        this.newOpenReDialog(data)
      }
    },
    export(data) {
      let schemaOrdbs =
        data.reverseOptions.SELECT_SCHEMA || data.reverseOptions.DATABASE_NAME
      let schema = schemaOrdbs?.split(';') || schemaOrdbs?.split(';') || []
      let schemaArr = []
      if (schema.length) {
        schema.forEach(s => {
          schemaArr.push({ name: s })
        })
      }
      this.$emit('showModelExport', data.id, schemaArr)
    },
    newUpdate(data) {
      this.$emit('showUpdate', data)
    },
    newOpenModelCompareJob(data) {
      if (!this.$ddmConnectable) {
        this.$message.warning(this.$t('meta.DS.message.notEnabledDDM'))
        return
      }
      if (data.notLoaded) {
        this.$message.warning(this.$t('meta.DS.noReTips'))
        return
      }
      if (data.id) {
        this.$emit('showModelCompareJob', data)
      } else {
        let item = this.selection[0]
        item.id = item.modelId
        item.name = item.definition
        this.$emit('showModelCompareJob', item)
      }
    },
    newOpenModelHistory(data) {
      data.id = data.modelId
      data.name = data.definition
      this.$emit('showModelHistory', data)
    },
    newOpenModelCompare(data) {
      if (data.id) {
        this.$emit('showModelCompare', data)
      } else {
        let arr = this.selection.map(item => {
          item.id = item.modelId
          item.name = item.definition
          return item
        })
        if (arr.length == 1) {
          this.$emit('showModelCompare', arr[0])
        } else {
          this.$emit('showModelCompare', arr)
        }
      }
    },
    newOpenReDialog(data) {
      this.getReDetail(data.id)
    },
    getReDetail(id) {
      this.$http
        .post(`${this.$meta_url}/models/${id}/plain`)
        .then(res => {
          if (
            res.data.type === 'DATADICTIONARY_LOGICAL' ||
            res.data.type == 'DATADICTIONARY' ||
            res.data.type == 'TABLEAU'
          ) {
            this.isFile = true
          } else {
            this.isFile = false
          }
          let biType = ''
          let biInfo = null
          if (res.data.reverseOptions?.biType) {
            this.isReport = true
            biInfo = JSON.parse(res.data.reverseOptions.biServerInfo)
            this.$globalData.$importTypeArr.forEach(bi => {
              if (res.data.reverseOptions.biType === bi.value) {
                biType = bi.label
              }
            })
          } else {
            this.isReport = false
          }
          this.isAuto =
            `${res.data.reverseOptions?.ExcelAutoCollect}` === 'true'
          this.reForm = {
            definition: res.data.definition || '-',
            datasourceName: res.data.datasourceName || '-',
            categoryName: res.data.categoryName || '-',
            type: res.data.type || '-',
            driverId: res.data.driverId || '-',
            HostServer: res.data.reverseOptions.HostServer || '-',
            dataConnect:
              res.data.dataConnect === 'SELF'
                ? this.$t('meta.dataSource.edit.selfCon')
                : res.data.dataConnect === 'BACKUP'
                ? this.$t('meta.dataSource.edit.backupCon')
                : res.data.dataConnect === 'DISABLED'
                ? this.$t('meta.dataSource.edit.disabledCon')
                : '-',
            dataSample: res.data.dataSample
              ? this.$t('meta.dataSource.edit.couldSample')
              : this.$t('meta.dataSource.edit.canNotSample'),
            backupDatasourceName: res.data.backupDatasourceName || '-',
          }
          if (this.isReport) {
            this.$set(this.reForm, 'biType', biType || '-')
            this.$set(
              this.reForm,
              'GATEWAY_URL',
              biInfo.additionalProp.GATEWAY_URL || '-'
            )
            this.$set(
              this.reForm,
              'CM_URL',
              biInfo.additionalProp.CM_URL || '-'
            )
            this.$set(
              this.reForm,
              'NAMINGSPACE',
              biInfo.additionalProp.NAMINGSPACE || '-'
            )
            this.$set(
              this.reForm,
              'version',
              biInfo.additionalProp.version || '-'
            )
            this.$set(this.reForm, 'HostServer', biInfo.host || '-')
            this.$set(
              this.reForm,
              'reportBaseUrl',
              biInfo.additionalProp.reportBaseUrl || '-'
            )
          }
          if (this.isFile && this.isAuto) {
            // 路径
            this.$set(this.reForm, 'filePath', res.data.reverseOptions.FilePath)
            this.$set(this.reForm, 'reType', '自动采集')
          } else if (this.isFile && !this.isAuto) {
            this.$set(this.reForm, 'reType', '手动采集')
            this.$http
              .post(
                `${this.$url}/files/getFilesInfo?fileIds=${res.data.reverseOptions.FilePath}`
              )
              .then(res => {
                this.$set(this.reForm, 'fileName', res.data[0].fileName)
              })
          }
          if (!this.isFile && !this.isReport) {
            this.$http
              .post(
                `${this.$url}/drivers/getDriverById?driverId=${res.data.driverId}`
              )
              .then(res => {
                this.$set(this.reForm, 'driverName', res.data.driverName)
              })
          }

          this.reDialog = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateExport(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    update(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    openModelCompareJob(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    openModelHistory(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    openReDialog(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    handleChange(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    openModelCompare(index, command) {
      return {
        data: index,
        command: command,
      }
    },
    /** 响应事件 */
    // 分页 设置
    handleSizeChange(size) {
      this.currentPage = 1
      this.pageSize = size
      this.getTableData()
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      this.getTableData()
    },
    handleSortChange(sortData) {
      if (!sortData.order) {
        this.sortMap = {}
      } else {
        this.sortMap = {}
        this.sortMap[sortData.prop] =
          sortData.order === 'ascending'
            ? 'ASC'
            : sortData.order === 'descending'
            ? 'DESC'
            : ''
      }
      this.getTableData()
      /* this.sortData = sortData
      // sortData = {column, prop, order}
      const obj = {
        sortData: {
          prop: sortData.prop,
          order: sortData.order,
        },
        keyword: this.keyword,
        currentPage: 1,
        pageSize: this.pageSize,
      }
      this.currentPage = 1
      this.changeDSDisplay(obj) */
    },

    handleSelectionChange(val) {
      if (val.length > 2) {
        let del_row = val.shift()
        this.$refs.dsTable.onlyTwoChange(del_row)
      }
      this.selection = val
      this.mutipleLength = val.length
      this.deleteDisabled = this.selection.length == 0
    },
    callOptionsMenu(row, evt) {
      this.currentModelId = row.modelId
      const x = evt.clientX
      const y = evt.clientY
      const options = []
      // if(this.$featureMap['FE_META']){
      //   options.push({
      //     label:'导出元数据',
      //     callback:()=>{
      //       this.downloadMetadata(row);
      //     }
      //   })
      // }
      // if(this.$featureMap['FE_META']&&!this.isFileItem(row)) {
      //   options.push({
      //     label: '更新元数据',
      //     callback: () => {
      //       let ref = this.$refs.refreshMeta;
      //       ref.$el.click();
      //     }
      //   });
      // }
      // if (this.$featureMap.FE_META && this.$ddmConnectable) {
      //   options.push({
      //     label: '比较任务',
      //     callback: () => {
      //       this.goToJob(row, 2)
      //     },
      //   })
      // }
      // if (this.$featureMap.FE_META) {
      //   options.push({
      //     label: '更新任务',
      //     callback: () => {
      //       this.goToJob(row, 1)
      //     },
      //   })
      // }
      /* options.push({
        label: this.$t('meta.DS.allSource.metaDataDiff'),
        callback: () => {
          this.goToJob(row, 2)
        },
      }) */
      if (this.$versionFeature.metadata_ModelCompare) {
        options.push({
          label: this.$t('meta.DS.allSource.modelDiffAndSync'),
          callback: () => {
            this.goToJob(row, 2)
          },
        })
      }
      options.push({
        label: this.$t('meta.DS.allSource.changeHistory'),
        callback: () => {
          this.goToJob(row, 2)
        },
      })
      options.push({
        label: this.$t('meta.DS.allSource.exportMetadata'),
        callback: () => {
          this.goToJob(row, 2)
        },
      })
      options.push({
        label: this.$t('meta.DS.allSource.updateMetadata'),
        callback: () => {
          this.goToJob(row, 2)
        },
      })
      this.$bus.$emit('callContextMenu', {
        x: x,
        y: y,
        options: options,
        isLeft: true,
        placement: 'bottom-left',
      })
    },
    handleCreated() {
      this.dialogCrVdsVisible = false
    },
    downloadMetadata(row) {
      this.$emit('downloadMetadata', row.modelId)
    },
    handleRefresh(index, row) {
      // deprecated
      /* const self = this;
      row.isRefreshing = true;
      this.dsDataKey++;
      self.$http
        .get(self.BASE_URL + "models/" + row.modelId + "/delta")
        .then(res => {
          this.deltaData = res.data;
          row.isRefreshing = false;
          if (!res.data.changedObjects) {
            this.$message.success("模型无变化");
            this.dsDataKey++;
          } else {
            self.innerLoadDataSources();
            this.dialogShowDifferenceVisible = true;
            self.showSuccess("更新数据源成功");
            this.dsDataKey++;
          }
        })
        .catch(e => {
          row.isRefreshing = false;
          this.$showFailure(e);
        }); */
    },
    goToJob(row, jobType) {
      this.$router.push({
        name: 'jobManagement',
        query: { dataSourceId: row.modelId, jobType: jobType },
      })
    },
    showBegain() {
      this.uploading = true
      this.$bus.$emit('showUploadProgress', {
        name: this.$t('meta.DS.allSource.updateMetadata'),
        time: 10,
      })
    },
    handleUpdateMetadataSuccess() {
      this.$bus.$emit('changeUploadProgress', true)
    },
    handleUpdateMetadataError(err, file, fileList) {
      this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(err)
    },
    handleTest(row, index) {
      this.$http
        .get(this.BASE_URL + 'models/connection/test/' + row.modelId)
        .then(res => {
          row.isError = false
          row.isSuccess = true
          this.testBtnKey++
        })
        .catch(e => {
          row.isSuccess = false
          row.isError = true
          this.testBtnKey++
          this.$showFailure(e)
        })
    },
    getTableData() {
      this.vloading = true
      let requestBody = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        modelName: _.trim(this.filterForm.modelName.toLowerCase()),
        categoryId:
          this.filterForm.categoryId === 0 ? '' : this.filterForm.categoryId,
      }
      if (Object.keys(this.sortMap).length > 0) {
        requestBody.sortMap = this.sortMap
      }
      this.$http
        .post(this.BASE_URL + 'models/fromre/page', requestBody)
        .then(res => {
          this.vloading = false
          this.total = res.data.totalItems
          this.displayData = res.data.content || []
        })
        .catch(e => {
          this.vloading = false
          this.$blauShowFailure(e)
        })
    },

    /** 处理显示的数据 */
    parameterFormat: function (row) {
      return JSON.stringify(row.connectionInfo.parameterMap)
    },
    resizeTable() {
      this.$nextTick(() => {
        this.tableHeight = $('.table-row')[0].offsetHeight || this.tableHeight
        this.dsDataKey++
      })
    },
    changeDSDisplay(para, allData) {
      allData = allData || this.displayData
      const arr = []
      if (!para) {
        para = _.clone(this.emptyPara)
        para.pageSize = this.pageSize
        para.keyword = this.keyword
        this.currentPage = para.currentPage
      }
      para.keyword = para.keyword || this.keyword
      const keyword = para.keyword.trim().toLowerCase()
      allData.forEach(item => {
        let bool = false
        this.keywordFilterProps.forEach(prop => {
          if (item[prop] && item[prop].toLowerCase().indexOf(keyword) !== -1) {
            bool = true
          }
        })
        if (bool) {
          arr.push(item)
        }
      })
      this.total = arr.length
      this.dsData = arr
      if (para.sortData && para.sortData.prop) {
        const order =
          para.sortData.order !== 'descending' ? 'ascending' : 'descending'
        this.$utils.sort.sortConsiderChineseNumber(
          arr,
          para.sortData.prop,
          order
        )
      }
      localStorage.setItem('arr', JSON.stringify(arr))
      const currentPage = para.currentPage || 1 // 任意其它条件改变, currentPage 变为 1
      const pageSize = para.pageSize || this.pageSize
      this.displayData = arr.slice(
        pageSize * (currentPage - 1),
        pageSize * currentPage
      )

      this.loadingDS = false
    },

    /** 处理不显示的数据 */
    isOracle() {
      const ds = this.dsform
      return ds.dbtype === 'ORACLE'
    },
    versionFormat: function (row) {
      return row.connectionInfo.versioning
        ? this.$t('meta.common.true')
        : this.$t('meta.common.false')
    },
    // 操作 table 数据
    deleteCurrentRow(row, callback) {
      var self = this
      this.$http
        .delete(self.BASE_URL + 'models/' + row.modelId)
        .then(res => {
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
          this.innerLoadDataSources()
          this.loadingDS = false
        })
    },
    showSuccess(msg) {
      this.$message({
        title: 'Success',
        message: msg,
        type: 'success',
      })
    },
    refreshDataSourceList() {
      HTTP.refreshDataSource()
    },

    checkREProgress(jobId) {
      this.innerLoadDataSources()
      const self = this
      if (jobId) {
        this.$dataSource.interval[jobId] = setInterval(() => {
          self.checkREProgressStep(jobId)
        }, 3000)
        window.localStorage.setItem(
          'dataSourcesOf' + this.$user.username,
          JSON.stringify(this.$dataSource)
        )
      } else {
        const local = window.localStorage.getItem(
          'dataSourcesOf' + this.$user.username
        )
        if (local) {
          this.$dataSource = JSON.parse(
            window.localStorage.getItem('dataSourcesOf' + this.$user.username)
          )
        }
        const keys = Object.keys(this.$dataSource.interval)
        keys.forEach(jobId => {
          this.$dataSource.interval[jobId] = setInterval(() => {
            self.checkREProgressStep(jobId)
          }, 1000)
        })
        window.localStorage.setItem(
          'dataSourcesOf' + this.$user.username,
          JSON.stringify(this.$dataSource)
        )
        if (keys.length == 0) {
        }
      }
    },
    checkREProgressStep(jobId) {
      const jobInfo = {
        jobId: jobId,
        type: 'datasource',
      }
      this.$addIntervalArr(jobInfo)
      if (this.$dataSource.fakeData.type) {
        this.$http
          .get(this.BASE_URL + 'models/re/' + jobId + '/progress')
          .then(res => {
            if (res.data.percentage === 100 || !!res.data.exception) {
              this.updateDataSource = false
              clearInterval(this.$dataSource.interval[jobId])
              this.$dataSource.interval = {}
              this.$dataSource.fakeData = {}
              window.localStorage.setItem(
                'dataSourcesOf' + this.$user.username,
                JSON.stringify(this.$dataSource)
              )
              this.innerLoadDataSources()
              if (new Date().getTime() - this.lastLoadTimeStamp > 1000) {
                this.lastLoadTimeStamp = new Date().getTime()
              }
              this.$removeIntervalArr(jobInfo)
            } else if (!res.data) {
              this.updateDataSource = false
              clearInterval(this.$dataSource.interval[jobId])
              this.$dataSource.interval = {}
              this.$dataSource.fakeData = {}
              window.localStorage.setItem(
                'dataSourcesOf' + this.$user.username,
                JSON.stringify(this.$dataSource)
              )
              this.innerLoadDataSources()
              this.$removeIntervalArr(jobInfo)
            }

            const data = res.data
            this.$saveJobHistory({
              name: '',
              jobStatus:
                data.stopped || data.percentage === 100 || !!data.exception
                  ? 'FINISHED'
                  : 'RUNNING',
              jobId: jobId,
              jobName: '',
              errorMessage: '',
              result: data.message,
              startTime: '',
              endTime: data.timestamp,
              objType: '',
              jobType: 'dataSource',
              progress: data.percentage,
            })
          })
          .catch(e => {
            this.$showFailure(e)
            this.updateDataSource = false
            clearInterval(this.$dataSource.interval[jobId])
            this.$dataSource.interval = {}
            this.$dataSource.fakeData = {}
            window.localStorage.setItem(
              'dataSourcesOf' + this.$user.username,
              JSON.stringify(this.$dataSource)
            )
            this.innerLoadDataSources()
          })
      }
    },
    innerLoadDataSources() {
      var self = this
      self.loadingDS = true
      this.refreshDataSourceList()
      HTTP.getAllDataSource()
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          this.$utils.sort.sortConsiderChineseNumber(
            res.data,
            'creationTime',
            'descending'
          )
          self.allData = res.data
          if (this.$dataSource.fakeData && this.$dataSource.fakeData.type) {
            self.allData.unshift(this.$dataSource.fakeData)
          }
          if (this.keyword === '') {
            self.changeDSDisplay()
          } else {
            this.keyword = ''
          }
          this.openTabByQuery()
        })
        .catch(e => {
          this.loadingDS = false
          this.$showFailure(e)
        })
    },
  },
  watch: {
    'filterForm.categoryId': {
      handler: function () {
        this.getTableData()
      },
      // const obj = {
      //   keyword: newVal,
      //   currentPage: 1,
      //   sortData: this.sortData,
      //   pageSize: this.pageSize,
      // }
      // this.currentPage = 1
    },
  },
}
</script>
<style lang="scss" scoped>
$primary-color: #409eff;
.tab-page {
  .label-info {
    margin: 0 10px 0 20px;
    font-size: 14px;
  }
  .right-btn {
    display: inline-block;
    float: right;
    margin-right: 20px;
    height: 34px;
    .is-block {
      line-height: 34px;
    }
  }
  .footer-row {
    right: 0;
    left: 0;
    bottom: 0;
    height: 50px;
    padding-top: 8px;
    padding-right: 20px;
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    z-index: 3;
  }
}
.table-row {
  margin: 0 20px;
  // border-bottom: 1px solid var(--border-color-lighter);
  .datablau-table-info {
    height: 100%;
  }
  .drop-menu-info {
    margin-top: 2px;
  }
  .btn-in-table-info {
    margin-right: 8px;
  }
  /deep/ .disableheadselection > .cell .el-checkbox__inner {
    display: none;
  }
}
.el-dialog {
  .reContent {
    .el-form-item {
      width: 100%;
    }
  }
}
</style>
