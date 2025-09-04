<template>
  <datablau-dialog
    :visible.sync="visible"
    size="l"
    title="资源选择器"
    :key="comKey"
  >
    <div>
      <datablau-input
        placeholder="请输入关键字"
        v-model="keyword"
        @keypress.native.enter="handleSearchButton"
        @clear="handleSearchButton"
        clearable
        style="width: 240px; margin-right: 10px"
      ></datablau-input>
      <datablau-button type="primary" @click="handleSearchButton">
        搜索
      </datablau-button>
      <datablau-table
        class="common-selector-table"
        :data="tableData"
        :height="330"
        @row-click="handleRowClick"
        :row-class-name="rowClassName"
      >
        <el-table-column label="#" :width="50">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          prop="alias"
          label="英文名"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="Name"
          label="中文名"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="path" label="路径" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.path ? scope.row.path.join('/') : '' }}
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div slot="footer">
      <datablau-pagination
        class="bottom-pagination"
        style="position: relative; float: left"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[20]"
        :total="total"
        layout="total, sizes, prev, pager, next"
      ></datablau-pagination>
      <datablau-button type="secondary" @click="closeDialog">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button type="primary" @click="finish" :disabled="!selected">
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
import LDMTypes from '@constant/LDMTypes'
export default {
  data() {
    return {
      LDMTypes: LDMTypes,
      visible: false,
      objectType: null,
      comKey: 0, // 用于强制刷新组件
      keyword: '',
      keywordUse: '',
      tableData: null,
      pageSize: 10,
      currentPage: 1,
      total: 0,
      selected: null,
    }
  },
  methods: {
    clear() {
      this.keyword = ''
      this.keywordUse = ''
      this.selected = null
      this.comKey++
    },
    init(objectType) {
      if (objectType) {
        this.objectType = objectType
      } else {
        throw new Error('未选择对象类型')
      }
      this.visible = true
      this.handleSearch()
    },
    finish() {
      this.$emit('finish', {
        id: this.selected.Id,
        name: this.selected.Name,
        Type: this.selected.Type,
      })
      this.closeDialog()
    },
    closeDialog() {
      this.clear()
      this.visible = false
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.handleSearch()
    },
    handleSearchButton() {
      this.keywordUse = this.keyword
      this.currentPage = 1
      this.handleSearch()
    },
    handleSearch() {
      this.$http
        .post(this.$graph_url + `/graph/searchNode`, {
          page: this.currentPage - 1,
          size: this.pageSize,
          keyword: this.keywordUse,
          type: this.objectType,
        })
        .then(res => {
          this.tableData = res.data.content
          this.total = res.data.total
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleRowClick(row) {
      this.selected = row
    },
    rowClassName({ row }) {
      if (this.selected && row.Id === this.selected.Id) {
        return 'row-can-click row-selected'
      } else {
        return 'row-can-click'
      }
    },
  },
  computed: {
    buttonDisabled() {
      return false
    },
  },
}
</script>

<style lang="scss">
@import '~@/next/components/basic/color.sass';
.common-selector-table tr.row-selected {
  background: $table-click-color;
}
</style>
