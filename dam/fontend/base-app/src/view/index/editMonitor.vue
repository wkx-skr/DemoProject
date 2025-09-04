<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      width="400px"
      append-to-body
      :visible.sync="dialogVisible"
    >
      <el-form label-width="6em">
        <el-form-item label="编码">
          <el-input
            size="small"
            :disabled="dialogType === 'rename'"
            v-model="dialogId"
            placeholder="如果为空，将自动生成"
          ></el-input>
        </el-form-item>
        <el-form-item :label="typeLabel">
          <el-input
            ref="dialogInput"
            size="small"
            :placeholder="dialogPlaceholder"
            autofocus
            v-model="dialogName"
            @keydown.native.enter="handleDialog"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="abortHandleDialog">关闭</el-button>
        <el-button type="primary" size="small" @click="handleDialog">

          {{ $t('common.button.ok') }}

        </el-button>
      </span>
    </el-dialog>
    <div class="title-line" v-if="currentDim">
      <span class="title">
        <span style="color: #555; font-size: 20px">{{ typeLabel }}</span>
        {{ currentType !== 'MONITOR' ? ' /' + currentDim.catalog : '' }}
      </span>
      <el-button
        size="small"
        class="el-icon-add"
        style="float: right"
        @click="callDialog('value', 'add')"
      >
        {{ currentType !== 'MONITOR' ? '添加值' : '添加观测对象' }}
      </el-button>
    </div>
    <el-table
      v-if="currentDim"
      :data="dims"
      class="stripe-table"
      :height="tableHeight"
      v-loading="tableLoading"
      @sort-change="handleSortChange"
      border
    >
      <el-table-column
        label="编码"
        :prop="typeLabel === '观测对象' ? 'objectId' : 'dimId'"
        show-overflow-tooltip
        sortable="custom"
      ></el-table-column>
      <el-table-column
        :label="typeLabel !== '观测对象' ? typeLabel + '值' : typeLabel"
        :prop="typeLabel === '观测对象' ? 'monitorObject' : 'value'"
        show-overflow-tooltip
        sortable="custom"
      ></el-table-column>
      <el-table-column label="操作" width="160">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="callDialog('value', 'rename', scope.row)"
          >
            重命名
          </el-button>
          <el-button type="text" @click="deleteDim(scope.row)">{{ $t('common.button.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'editMonitor',
  data() {
    return {
      currentDim: {
        catalog: 'default',
        catalogId: 'default',
      },
      currentMonitor: {
        catalog: 'default',
        catalogId: 'default',
      },
      showPop: false,
      showCodePop: false,
      dialogTitle: '',
      dialogName: '',
      dialogId: '',
      dialogVisible: false,
      dialogFunction: null,
      dialogPlaceholder: '请输入',
      dialogType: 'rename',
      currentType: 'MONITOR',
      tableLoading: false,
      dims: [],
      tableHeight: 500,
    }
  },
  mounted() {
    this.initTableHeight()
    this.getMonitors()
    $(window).on('resize', this.initTableHeight)
  },
  beforeDestroy() {
    $(window).off('resize', this.initTableHeight)
  },
  methods: {
    getMonitors() {
      this.$http
        .get(
          this.$url +
            '/service/me/monitors/catalogs/' +
            this.currentMonitor.catalogId +
            '/objects'
        )
        .then(res => {
          this.dims = res.data
          this.$bus.$emit('gotMonitors', { default: { values: res.data } })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initTableHeight() {
      setTimeout(() => {
        const height = $('.content-area')[0].offsetHeight
        this.tableHeight = height - 100
      })
    },
    callDialog() {
      this.showCodePop = false
      if (arguments[0] === 'value') {
        let requestBody = {}
        const dimensionType = 'NORMAL'
        //        let typeText = '维度值';
        let typeText = this.typeLabel
        if (this.currentType != 'MONITOR') {
          typeText += '值'
        }
        this.dialogPlaceholder = '请输入' + typeText
        if (arguments[1] === 'rename') {
          this.dialogType = 'rename'
          requestBody = arguments[2]
          if (requestBody.value) {
            this.dialogName = requestBody.value
            this.dialogId = requestBody.dimId
          } else {
            this.dialogName = requestBody.monitorObject
            this.dialogId = requestBody.objectId
          }
          this.dialogTitle = '重命名' + typeText
        } else {
          this.dialogType = 'add'
          this.dialogName = ''
          this.dialogId = ''
          this.dialogTitle = '新增' + typeText
        }
        this.dialogFunction = () => {
          if (this.currentType === 'MONITOR') {
            requestBody.monitorObject = this.dialogName
            requestBody.objectId = this.dialogId
              ? this.dialogId
              : 'M-' + this.$getUniqueId()
            requestBody.catalog = this.currentMonitor
            this.$http
              .post(this.$url + '/service/me/monitors', requestBody)
              .then(res => {
                this.$message.success(this.$version.common.operationSucceed)
                this.getMonitors()
                this.abortHandleDialog()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            requestBody = {
              catalog: this.currentDim,
            }
            requestBody.dimId = this.dialogId
              ? this.dialogId
              : 'D-' + this.$getUniqueId()
            requestBody.value = this.dialogName
            this.$http
              .post(this.$url + '/service/me/dims', requestBody)
              .then(res => {
                this.$message.success(this.$version.common.operationSucceed)
                this.getDims()
                this.abortHandleDialog()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      }
      this.showPop = false
      this.showCodePop = false
      this.dialogVisible = true
    },
    abortHandleDialog() {
      this.dialogVisible = false
    },
    handleDialog() {
      if (!this.dialogName) {
        this.$message.warning(`${this.typeLabel}不能为空`)
      } else {
        this.dialogFunction()
      }
    },
    handleSortChange({ prop, order }) {
      this.$utils.sort.sortConsiderChineseNumber(this.dims, prop, order)
    },
    deleteDim(row) {
      this.$confirm('确定要执行删除操作吗？', '删除', {
        type: 'warning',
      })
        .then(() => {
          let requestUrl = this.$url + '/service/me/dims/'
          if (this.currentType === 'MONITOR') {
            requestUrl = this.$url + '/service/me/monitors/'
          }
          this.$http
            .delete(requestUrl + (row.dimId ? row.dimId : row.objectId))
            .then(res => {
              if (this.currentType === 'MONITOR') {
                this.getMonitors()
              } else {
                this.getDims()
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {})
    },
  },
  computed: {
    typeLabel() {
      const type = this.currentType
      if (type === 'MONITOR') {
        return '观测对象'
      } else if (type === 'NORMAL') {
        return '修饰维度'
      } else {
        return '时间周期'
      }
    },
  },
}
</script>
