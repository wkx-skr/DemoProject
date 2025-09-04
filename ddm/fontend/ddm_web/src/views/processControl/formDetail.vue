<template>
  <div>
    <el-dialog
      :visible.sync="editDialogVisible"
      width="700px"
      append-to-body
      :close-on-click-modal="false"
      title="编辑属性"
    >
      <edit-form-item
        :current-row="currentRow"
        v-if="editDialogVisible"
        @close="editDialogVisible = false"
        :dupUdpNamMap="dupUdpNamMap"
        :valueTypeArr="valueTypeArr"
        @addFormItem="updateForm"
        @updateFormItem="updateFormItem"
        :maxOrder="maxOrder"
      ></edit-form-item>
      <!-- @refresh="getUdpsByType" -->
    </el-dialog>
    <el-table
      class="datablau-table"
      style="margin-top: 0em"
      :height="400"
      :data="udps"
    >
      <el-table-column
        prop="code"
        label="编码"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="name"
        label="名称"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="type"
        label="值域类型"
        :formatter="valueTypeFormatter"
        show-overflow-tooltip
      ></el-table-column>

      <el-table-column
        label="操作"
        width="115"
        header-align="right"
        align="right"
      >
        <template slot-scope="scope" v-if="scope.row.modifiable">
          <el-button
            type="text"
            size="mini"
            @click="up(scope.$index)"
            :disabled="scope.$index === 0"
            class="fa fa-long-arrow-up"
          ></el-button>
          <el-button
            type="text"
            size="mini"
            @click="down(scope.$index)"
            :disabled="scope.$index === udps.length - 1"
            class="fa fa-long-arrow-down"
          ></el-button>
          <el-button
            type="text"
            size="mini"
            @click="modifyProperty(scope.row)"
            class="el-icon-edit"
          ></el-button>
          <el-button
            type="text"
            size="mini"
            @click="deleteRow(scope.row)"
            class="el-icon-delete"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 0.1em; overflow: auto">
      <el-button
        @click="addProperty"
        type="text"
        style="float: right; position: relative; top: -3px"
        style1="position:absolute;right:2em;top:4em;"
      >
        添加属性
      </el-button>
      <el-button type="primary" size="small" @click="saveForm">保存</el-button>
    </div>
  </div>
</template>

<script>
import editFormItem from './editFormItem.vue'
import HTTP from '@/resource/http.js'
export default {
  components: { editFormItem },
  data () {
    return {
      allFormItem: [],
      udps: [],
      dupUdpNamMap: {},
      editDialogVisible: false,
      currentRow: null,
      maxOrder: 0,
      valueTypeArr: [
        { value: 'STRING', label: 'String' },
        { value: 'LONG', label: 'Long' },
        { value: 'DATE', label: 'DATE' },
        { value: 'BOOLEAN', label: 'Boolean' },
        { value: 'ENUM', label: 'ENUM' }
      ],
      formDetail: ['udps', 'allFormItem']
    }
  },
  props: {
    currentFormId: {
      type: [String, Number],
      required: true
    }
  },
  beforeMount () {},
  mounted () {},
  methods: {
    dataInit () {
      HTTP.getFormDetail({ formId: this.currentFormId })
        .then(res => {
          const data = res.data || []
          this.allFormItem = data
          const udps = []
          data.forEach((item, index) => {
            item.order = index + 1
            udps.push(item)
          })
          this.udps = udps
          this.maxOrder = udps.length
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateForm (data) {
      this.udps.push(data)
      this.editDialogVisible = false
    },
    handleTabClick () {
      this.getUdpsByType()
    },
    addProperty () {
      this.currentRow = null
      this.editDialogVisible = true
    },
    modifyProperty (row) {
      this.currentRow = _.cloneDeep(row)
      this.editDialogVisible = true
    },
    updateFormItem (data) {
      const index = this.udps.findIndex(item => item.id === data.id)
      if (index !== -1) {
        this.udps.splice(index, 1, data)
      }
      this.editDialogVisible = false
    },
    valueTypeFormatter (row) {
      let result = ''
      switch (row.type) {
        case 'STRING':
          result = '字符串'
          break
        case 'LONG':
          result = '数值'
          break
        case 'DATE':
          result = '日期'
          break
        case 'ENUM':
          result = '枚举值'
          const typeData = row.enums || []
          if (typeData.length > 0) {
            const value = typeData.join(';')
            result += `(${value})`
          }
          break
        case 'BOOLEAN':
          result = '布尔值'
          break
        case 'EXPRESS':
          result = '审批人'
          break
        default:
          result = row.type
          break
      }
      return result
    },
    deleteRow (row) {
      this.$confirm(`确定删除"${row.name}"吗？`, '', {
        type: 'warning'
      })
        .then(() => {
          const udps = []
          this.udps.forEach(item => {
            if (item.code !== row.code) {
              udps.push(item)
              item.index = udps.length
            }
          })
          this.udps = udps
          this.maxOrder = udps.length
        })
        .catch(() => {
          this.$message.info('操作已取消')
        })
    },
    up (index) {
      this.swap(index - 1, index)
    },
    down (index) {
      this.swap(index, index + 1)
    },
    swap (prev, next) {
      this.udps[prev].order = next
      this.udps[next].order = prev
      this.$utils.sort.sort(this.udps, 'order')
    },
    saveForm () {
      const udps = this.udps || []
      const requestBody = []
      udps.forEach((item, index) => {
        if (item.modifiable) {
          const itemObj = {
            formId: this.currentFormId,
            code: item.code,
            name: item.name,
            type: item.type,
            value: item.value,
            enums: null,
            required: item.required,
            readable: item.readable,
            writable: item.writable,
            order: index + 1
          }
          if (itemObj.type === 'ENUM') {
            itemObj.enums = item.enums
          }
          if (itemObj.type === 'USERS') {
            itemObj.value = JSON.stringify(itemObj.value.split(','))
          }
          requestBody.push(itemObj)
        }
      })
      HTTP.updateForm({ formId: this.currentFormId, requestBody })
        .then(res => {
          this.$emit('updateFormList')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  },
  beforeDestroy () {
    this.formDetail.forEach(item => {
      if (typeof this[item] === 'object' && this[item]) {
        Object.keys(this[item]).forEach(o => {
          this[item][o] = null
        })
      }
      this[item] = null
    })
    if (window.CollectGarbage) {
      window.CollectGarbage()
    }
  },
  watch: {
    currentFormId: {
      immediate: true,
      handler: function (newVal) {
        this.dataInit()
      }
    }
  }
}
</script>

<style scoped></style>
