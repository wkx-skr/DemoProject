<template>
  <div>
    <datablau-dialog
      :visible.sync="editDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      :title="$t('meta.process.editProp')"
      size="m"
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
    </datablau-dialog>
    <datablau-table
      class="datablau-table"
      style="margin-top: 0em; border-bottom: 1px solid #e0e0e0"
      :height="441"
      :data="udps"
      show-overflow-tooltip
      :show-column-selection="false"
    >
      <el-table-column
        prop="code"
        :label="$t('meta.process.code')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="name"
        :label="$t('meta.process.name')"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="type"
        :label="$t('meta.process.valType')"
        :formatter="valueTypeFormatter"
        show-overflow-tooltip
      ></el-table-column>

      <el-table-column
        :label="$t('meta.process.operation')"
        width="115"
        header-align="right"
        align="right"
      >
        <template slot-scope="scope" v-if="scope.row.modifiable">
          <datablau-button
            low-key
            type="icon"
            size="mini"
            title="编辑"
            @click="modifyProperty(scope.row)"
            class="iconfont icon-bianji right-btn"
          ></datablau-button>
          <datablau-button
            low-key
            type="icon"
            size="mini"
            title="删除"
            @click="deleteRow(scope.row)"
            class="iconfont icon-delete right-btn"
          ></datablau-button>
          <datablau-button
            low-key
            type="icon"
            size="mini"
            title="上移"
            style="width: 5px"
            @click="up(scope.$index)"
            :disabled="scope.$index === 0"
            class="iconfont icon-up right-btn"
          ></datablau-button>
          <datablau-button
            low-key
            type="icon"
            size="mini"
            title="下移"
            style="width: 5px"
            @click="down(scope.$index)"
            :disabled="scope.$index === udps.length - 1"
            class="iconfont icon-down right-btn"
          ></datablau-button>
        </template>
      </el-table-column>
    </datablau-table>

    <div class="dialog-bottom">
      <datablau-button
        @click="addProperty"
        type="secondary"
        class="form-detail-btn"
        style="float: left"
      >
        {{ $t('meta.process.addProp') }}
      </datablau-button>
      <datablau-button type="secondary" @click="cancelForm" size="small">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button type="important" size="small" @click="saveForm">
        {{ $t('common.button.save') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
import editFormItem from './editFormItem.vue'
import HTTP from '@/http/main'
import {RangeTypeOption, RangeTypeOptionLabel} from "@/view/processControl/RangeTypeOption";
export default {
  components: { editFormItem },
  data() {
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
        { value: 'ENUM', label: 'ENUM' },
      ],
      formDetail: ['udps', 'allFormItem'],
    }
  },
  props: {
    currentFormId: {
      type: [String, Number],
      required: true,
    },
  },
  beforeMount() {},
  mounted() {},
  methods: {
    dataInit() {
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
    updateForm(data) {
      this.udps.push(data)
      this.editDialogVisible = false
    },
    handleTabClick() {
      this.getUdpsByType()
    },
    addProperty() {
      this.currentRow = null
      this.editDialogVisible = true
    },
    modifyProperty(row) {
      this.currentRow = _.cloneDeep(row)
      this.editDialogVisible = true
    },
    updateFormItem(data) {
      const index = this.udps.findIndex(item => item.id == data.id)
      if (index !== -1) {
        this.udps.splice(index, 1, data)
      }
      this.editDialogVisible = false
    },
    valueTypeFormatter(row) {
      let result = RangeTypeOptionLabel[RangeTypeOption[row.type]]
      if (row.type === 'ENUM') {
        const typeData = row.enums || []
        if (typeData.length > 0) {
          const value = typeData.join(';')
          result += `(${value})`
        }
      }
      return result
    },
    deleteRow(row) {
      this.$DatablauCofirm(`确定删除"${row.name}"吗？`, '', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
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
    up(index) {
      this.swap(index - 1, index)
    },
    down(index) {
      this.swap(index, index + 1)
    },
    swap(prev, next) {
      this.udps[prev].order = next
      this.udps[next].order = prev
      this.$utils.sort.sort(this.udps, 'order')
    },
    saveForm() {
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
            order: index + 1,
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
    },
    cancelForm() {
      this.$emit('cancelForm')
    },
  },
  beforeDestroy() {
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
    /* currentFormId: {
      immediate: true,
      handler: function (newVal) {
        this.dataInit()
      },
    }, */
  },
}
</script>

<style lang="scss" scoped>
$primary-color: #409eff;
$text-default: #555555;
.right-btn {
  color: $text-default;
  &:hover {
    color: $primary-color;
  }
}
.form-detail-btn {
  &.text {
    height: 34px !important;
    line-height: 34px !important;
  }
}
</style>
