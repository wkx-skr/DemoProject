<template>
  <datablau-dialog size="m" :visible.sync="visible" title="实体选择">
    <datablau-input
      placeholder="请输入关键字"
      v-model="keyword"
      style="width: 240px"
    ></datablau-input>
    <datablau-table
      ref="table"
      :data="tableData"
      data-selectable
      :height="300"
      @selection-change="handleSelectionChange"
      row-key="id"
      reserve-selection
    >
      <el-table-column
        prop="name"
        label="名称"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="alias"
        label="别名"
        show-overflow-tooltip
      ></el-table-column>
    </datablau-table>
    <datablau-pagination
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      :current-page.sync="page"
      :page-sizes="[10, 20, 50]"
      :page-size="size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      class="page"
      style="margin-top: 10px"
    ></datablau-pagination>
    <div slot="footer">
      <datablau-tooltip
        style="float: left; margin-top: 5px"
        :content="selection.map(i => i.name).toString()"
        placement="top"
        :disabled="selection.length === 0"
      >
        <span>
          支持跨页多选，已选择{{
            selection.length
          }}个实体。注意，选择过多的实体可能会导致绘图变慢。
        </span>
      </datablau-tooltip>
      <datablau-button type="secondary" @click="closeTableDialog">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button
        type="primary"
        @click="saveTableDialog"
        :disabled="selection.length === 0"
      >
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
export default {
  props: {
    allSteps: {},
  },
  data() {
    return {
      visible: false,
      page: 1,
      size: 10,
      total: 0,
      tableData: null,
      selection: [],
      keyword: '',
    }
  },
  methods: {
    saveTableDialog() {
      this.closeTableDialog()
      this.$emit('selected', this.selection)
    },
    setSelection(selection) {
      this.selection = selection
    },
    addSelection(selection) {
      this.selection = this.selection.concat(selection)
    },
    callDialog() {
      if (!this.tableData) {
        const values = Object.values(this.allSteps)
        this.tableData = values.slice(0, this.size)
        this.total = values.length
      }
      this.selection.length = 0
      this.visible = true
      setTimeout(() => {
        this.$refs.table.clearSelection()
      })
    },
    getData() {
      this.tableData = Object.values(this.allSteps)
        .filter(item => {
          if (!this.keyword) {
            return true
          }
          return !!(
            this.keyword &&
            (_.lowerCase(item.name).includes(_.lowerCase(this.keyword)) ||
              _.lowerCase(_.toString(item.alias)).includes(
                _.lowerCase(this.keyword)
              ))
          )
        })
        .slice((this.page - 1) * this.size, this.page * this.size)
    },
    closeTableDialog() {
      this.visible = false
    },
    handleSizeChange(val) {
      this.page = 1
      this.size = val
      this.getData()
    },
    handlePageChange(val) {
      this.page = val
      this.getData()
    },
    handleSelectionChange(selection) {
      this.selection = selection
    },
  },
  watch: {
    keyword() {
      this.page = 1
      this.getData()
    },
  },
}
</script>

<style scoped></style>
