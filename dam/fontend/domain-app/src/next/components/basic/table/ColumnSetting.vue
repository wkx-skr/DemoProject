<template>
  <datablau-dialog title="自定义列" size="l" :visible.sync="dialogVisible">
    <datablau-table
      :data="tableData"
      :auto-hide-selection="false"
      ref="multipleTable"
      @select="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        label=""
        :width="24"
        :selectable="selectable"
      ></el-table-column>
      <el-table-column :width="30" label="#">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="label" label="列名">
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
          <span style="margin-left: 10px">{{ scope.row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column :width="60">
        <template slot-scope="scope">
          <span v-if="!selectable(scope.row)">(必选)</span>
        </template>
      </el-table-column>
      <el-table-column
        label="排序"
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
      <el-table-column label="宽度" :width="110" header-align="center">
        <template slot-scope="scope">
          <datablau-input
            style="width: 70px"
            v-model="scope.row.width"
          ></datablau-input>
          px
        </template>
      </el-table-column>
    </datablau-table>
    <div slot="footer">
      <datablau-button type="secondary" @click="close">
        {{ $t('common.button.close') }}
      </datablau-button>
      <datablau-button type="primary" @click="save">
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      tableData: null,
    }
  },
  props: {
    allColumns: Array,
    componentCaseName: Number,
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
              resolve(res.data.content)
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
        .post(this.$url + '/service/dashboard/widgets', {
          widgetId: widgetId,
          content: JSON.stringify(this.tableData),
        })
        .then(() => {
          this.close()
          this.$emit('update-setting', this.tableData)
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
          this.tableData = JSON.parse(configuration)
          if (!callback) {
            this.$emit('update-setting', this.tableData)
          }
        })
        .catch(() => {
          const widgetSetting = []
          this.allColumns
            .filter(i => i.prop)
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
    close() {
      this.dialogVisible = false
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
     * @param row 当前行
     */
    handleSelectionChange(selection, row) {
      row.visible = !!selection.map(i => i.prop).includes(row.prop)
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
