<template>
  <datablau-dialog
    :title="$t('common.columnSetting.title')"
    size="l"
    :visible.sync="dialogVisible"
    :before-close="handleBeforeClose"
  >
    <datablau-table
      :data="tableData"
      :auto-hide-selection="false"
      ref="multipleTable"
      @select="handleSelectionChange"
      @select-all="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        label=""
        :width="24"
        :selectable="selectable"
      ></el-table-column>
      <el-table-column :width="35" label="#">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        prop="label"
        :label="$t('common.columnSetting.columnNames')"
      >
        <template slot-scope="scope">
          <div
            style="
              background-color: grey;
              width: 100%;
              height: 40px;
              position: absolute;
              opacity: 0.1;
              transform: translateY(-9px);
            "
            :style="{
              width: isNaN(scope.row.width) ? '100%' : scope.row.width + 'px',
            }"
          ></div>
          <span style="margin-left: 10px">
            {{ scope.row.label || scope.row.prop }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :width="60">
        <template slot-scope="scope">
          <span v-if="!selectable(scope.row)">(必选)</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.columnSetting.width')"
        :width="110"
        header-align="center"
      >
        <template slot-scope="scope">
          <datablau-input
            style="width: 70px"
            v-model="scope.row.width"
          ></datablau-input>
          px
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.columnSetting.sort')"
        header-align="center"
        align="center"
        :width="80"
      >
        <template slot-scope="scope">
          <datablau-button
            type="icon"
            @click="up(scope.$index)"
            :disabled="scope.$index === 0"
            class="iconfont icon-up"
          >
            <!--            上移-->
          </datablau-button>
          <datablau-button
            type="icon"
            @click="down(scope.$index)"
            :disabled="scope.$index === (tableData && tableData.length - 1)"
            class="iconfont icon-down"
          >
            <!--            下移-->
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <div slot="footer">
      <datablau-button type="secondary" @click="handleClose">
        {{ $t('common.button.close') }}
      </datablau-button>
      <datablau-button type="primary" @click="save">
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      dialogVisible: false,
      tableData: null,
      tableDataInitial: null,
    }
  },
  props: {
    allColumns: Array,
    componentCaseName: Number,
    buildInProperties: {
      required: false,
    },
  },
  mounted() {},
  methods: {
    loadConfiguration() {
      const widgetId = 'COLUMN-SETTING-' + this.componentCaseName
      return new Promise((resolve, reject) => {
        this.$http
          .post(this.$url + `/widget/getWidgetConfig?id=${widgetId}`)
          .then(res => {
            if (res.data.content) {
              resolve(JSON.parse(res.data.content))
            } else {
              reject()
            }
          })
          .catch(e => {
            reject()
          })
      })
    },
    saveConfiguration() {
      if (!this.componentCaseName && this.componentCaseName !== 0) {
        console.error('组件实例名称错误,请联系攻城狮修改代码！')
      }
      this.tableData.forEach(item => {
        if (!item.width || isNaN(item.width)) {
          item.width = 'auto'
        }
      })
      const widgetId = 'COLUMN-SETTING-' + this.componentCaseName
      this.$http
        .post(this.$url + '/widget/saveWidgetConfig', {
          widgetId: widgetId,
          content: JSON.stringify(this.tableData),
        })
        .then(() => {
          this.tableDataInitial = _.cloneDeep(this.tableData)
          this.$emit('update-setting', this.tableData)
          this.dialogVisible = false
        })
        .catch(e => {
          this.showFailure(e)
        })
    },
    /**
     * 外部使用，用于获取配置
     */
    prepareWidgetSetting(callback) {
      this.loadConfiguration()
        .then(configuration => {
          { // 增加、删除
            const allColumns = this.allColumns
              .filter(i => i.prop)
              .filter(i => {
                if (this.buildInProperties && this.buildInProperties.length > 0) {
                  return this.buildInProperties.includes(i.prop)
                } else {
                  return true
                }
              })
            const allColumnsMap = new Map()
            allColumns.forEach(item => {
              allColumnsMap.set(item.prop, item)
            })
            /**
            敲掉已经删除的column
             */
            const tableData = configuration.filter(i => {
              return allColumnsMap.has(i.prop)
            })
            /**
             * 增加新增的column
             */
            allColumnsMap.keys().forEach(item => {
              const column = allColumnsMap.get(item);
              if (!tableData.map(i => i.prop).includes(item)) {
                tableData.push({
                  prop: column.prop,
                  label: column.label,
                  dataRequired: column.dataRequired,
                  order: tableData.length,
                  width: column.width ? column.width : 'auto',
                  visible: false,
                })
              }
            })
            /**
             * 更新column
             */
            tableData.forEach(item => {
              if (allColumnsMap.get(item.prop)) {
                item.label = allColumnsMap.get(item.prop).label
                item.dataRequired = allColumnsMap.get(item.prop).dataRequired
              }
            })
            this.tableData = tableData
            this.tableDataInitial = _.cloneDeep(this.tableData)
          }

          if (!callback) {
            this.$emit('update-setting', this.tableData)
          }
        })
        .catch(() => {
          const widgetSetting = []
          this.allColumns
            .filter(i => i.prop)
            .filter(i => {
              if (this.buildInProperties && this.buildInProperties.length > 0) {
                return this.buildInProperties.includes(i.prop)
              } else {
                return true
              }
            })
            .forEach((column, order) => {
              widgetSetting.push({
                prop: column.prop,
                label: column.label,
                dataRequired: column.dataRequired,
                order: order,
                width: column.width ? column.width : 'auto',
                visible: true,
              })
            })
          this.tableData = widgetSetting
          this.tableDataInitial = _.cloneDeep(this.tableData)
        })
        .then(() => {
          if (callback) {
            callback(this.tableData)
          }
        })
    },
    initTableData() {
      this.$nextTick(() => {
        this.$refs.multipleTable.clearSelection()
        this.toggleSelection(this.tableData)
      })
    },
    callDialog() {
      this.dialogVisible = true
      if (!this.allColumns) {
        throw new Error('未配置allColumns')
      }
      this.initTableData()
    },
    save() {
      this.saveConfiguration()
    },
    handleClose() {
      if (this.tableDataInitial) {
        this.tableData = _.cloneDeep(this.tableDataInitial)
      }
      this.dialogVisible = false
    },
    handleBeforeClose(done) {
      this.handleClose()
      done()
    },
    reset() {
      console.log('reset')
    },
    selectable(row) {
      return !row.dataRequired
    },
    /**
     * 打开弹框时，选中已选的
     */
    toggleSelection(rows) {
      if (rows) {
        this.$refs.multipleTable.clearSelection()
        rows.forEach(row => {
          if (row.visible) {
            this.$refs.multipleTable.toggleRowSelection(row)
          }
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    /**
     * 当用户修改复选框时，更新tableData的visible(可见)属性
     * @param selection 当前选择的行的List
     */
    handleSelectionChange(selection) {
      this.tableData.forEach(row => {
        row.visible = !!selection.map(i => i.prop).includes(row.prop)
      })
    },
    up(index) {
      this.swap(index - 1, index)
    },
    down(index) {
      this.swap(index, index + 1)
    },
    swap(prev, next) {
      this.tableData[prev].order = next
      this.tableData[next].order = prev
      this.$utils.sort.sort(this.tableData, 'order')
    },
  },
}
</script>

<style scoped></style>
