<template>
  <datablau-dialog
    :title="Label.choose"
    :visible.sync="visible"
    size="xl"
    :height="606"
    @close="handleClose"
  >
    <datablau-input
      v-model="keyword"
      :style="{
        width: modifierCategory === ModifierCategory.BASE ? '280px' : '330px',
      }"
      :placeholder="Label.searchValuePlaceholder"
      clearable
      iconfont-state
    ></datablau-input>
    <div style="height: 420px">
      <datablau-table
        ref="table"
        class="thin"
        :data="tableData"
        id="selectValueTable"
        height="100%"
        data-selectable
        @selection-change="tableSelectionChanged"
      >
        <el-table-column
          :label="Label.valueCode"
          prop="code"
          :min-width="200"
          :show-overflow-tooltip="false"
        ></el-table-column>
        <el-table-column
          :label="Label.valueName"
          prop="name"
          :min-width="200"
          :show-overflow-tooltip="false"
        ></el-table-column>
        <el-table-column
          label="描述"
          prop="description"
          :min-width="200"
          :show-overflow-tooltip="false"
        ></el-table-column>
      </datablau-table>
    </div>
    <div class="dialog-bottom">
      <div style="position: absolute; left: 20px">
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          :pager-count="5"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </div>
      <datablau-button @click="handleClose" type="secondary" style="">
        {{ $t('common.button.close') }}
      </datablau-button>
      <datablau-button
        @click="handleSelect"
        type="primary"
        :disabled="!isSelectEnabled"
      >
        添加
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
import {
  Label,
  ModifierCategory
} from '@/dataWarehouse/views/dataIndex/modifier/entrance/Constant'
import HTTP from '@/resource/http.js'
const URL_BASE = `${HTTP.$domains}modifier/`
export default {
  props: {
    modifierCategory: ModifierCategory,
    modifierTypeId: {}
  },
  data () {
    return {
      ModifierCategory: ModifierCategory,
      visible: true,
      tableData: null,
      pageSize: 20,
      currentPage: 1,
      total: 0,
      selection: [],
      keyword: '',
      getDataTimer: null
    }
  },
  mounted () {
    this.removeHeaderCheckbox()
    this.getData()
  },
  methods: {
    handleClose () {
      this.$emit('close')
    },
    handleSelect () {
      this.$emit('select', this.selection)
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.handleCurrentChange(1)
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getData()
    },
    getData () {
      this.tableData = null
      if (this.getDataTimer) {
        clearTimeout(this.getDataTimer)
        this.getDataTimer = null
      }
      this.getDataTimer = setTimeout(() => {
        this.$http
          .post(URL_BASE + 'getModifierValuePage', {
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            modifierTypeId: this.modifierTypeId,
            keyword: this.keyword
          })
          .then(res => {
            this.total = res.data.totalItems
            this.tableData = res.data.content
          })
      }, 500)
    },
    tableSelectionChanged (selection) {
      this.selection = selection
      const isMultiple = this.modifierCategory === ModifierCategory.BASE
      if (!isMultiple && selection.length > 1) {
        const delRow = selection.shift()
        this.$refs.table.toggleRowSelection(delRow, false)
      }
    },
    removeHeaderCheckbox () {
      const isMultiple = this.modifierCategory === ModifierCategory.BASE
      if (isMultiple) {
        return
      }
      setTimeout(() => {
        $('#selectValueTable table th .el-checkbox').css({ display: 'none' })
      }, 10)
    }
  },
  computed: {
    Label () {
      return Label[this.modifierCategory]
    },
    isSelectEnabled () {
      return this.selection.length > 0
    }
  },
  watch: {
    keyword () {
      this.currentPage = 1
      this.getData()
    }
  }
}
</script>

<style scoped></style>
