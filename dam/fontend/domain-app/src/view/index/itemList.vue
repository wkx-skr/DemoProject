<template>
  <div v-loading="loading" class="container">
    <div class="filter-outer">
      <div class="page-title">{{ pageTitle }}</div>
      <el-input
        style="position: absolute; right: 10px; top: 10px; width: 240px"
        size="mini"
        v-model="keyword"
        :placeholder="$t('common.placeholder.normal')"
      ></el-input>
    </div>
    <div class="table-outer">
      <el-table
        class="datablau-table"
        :data="pageData"
        height="100%"
        row-class-name="row-can-click"
        @row-click="handleRowClick"
      >
        <el-table-column prop="name" label="指标名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <i
              v-if="scope.row.type === 'BASE_CODE'"
              class="tree-icon base-index"
            ></i>
            <i v-else class="tree-icon index"></i>
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column
          label="英文名称"
          prop="enFull"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="主题" prop="path" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path3"></span>
            </span>
            {{ scope.row.path.map(item => item.name).join(' / ') }}
          </template>
        </el-table-column>
        <el-table-column
          label="计算公式"
          prop="function"
          show-overflow-tooltip
        ></el-table-column>
      </el-table>
    </div>
    <div class="pagination-outer">
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[10, 20, 50]"
        :page-size.sync="pageSize"
        layout="total,sizes, prev, pager, next"
        :total="total"
      ></datablau-pagination>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  props: {},
  data() {
    return {
      fullData: null,
      folderFilteredData: null,
      filteredData: null,
      pageData: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      loading: false,
      keyword: '',
      pageTitle: '所有指标',
    }
  },
  mounted() {},
  methods: {
    setFullData(rawData) {
      this.fullData = null
      this.buildIndexArray(rawData)
    },
    buildIndexArray(rawData) {
      const indexArray = []
      const forEach = (o, parentPath) => {
        const path = _.clone(parentPath)
        if (o.type === 'FOLDER') {
          path.push(o)
        }
        if (o.type === 'BASE_CODE') {
          o.path = path
          indexArray.push(o)
          if (o.children) {
            o.children.forEach(c => {
              c.baseCode = o
              c.path = path
              forEach(c, path)
            })
          }
        }
        if (o.type === 'CODE') {
          o.path = path
          indexArray.push(o)
          if (o.children) {
            o.children.forEach(item => {
              item.baseCode = o.baseCode
              item.path = path
              forEach(item, path)
            })
          }
        }
        if (o.type === 'FOLDER') {
          if (o.children) {
            o.children.forEach(item => {
              forEach(item, path)
            })
          }
        }
      }
      forEach(rawData, [])
      this.fullData = indexArray
    },
    updateData(id, node) {
      this.loading = true
      this.filterDataByFolder(id)
      if (!node) {
        this.pageTitle = '所有指标'
      } else {
        this.pageTitle = node.data.name
      }
    },
    filterDataByFolder(folderId) {
      this.currentPage = 1
      this.folderFilteredData = this.fullData.filter(item => {
        let select = false
        item.path.forEach(p => {
          if (p.id === folderId) {
            select = true
          }
        })
        return select
      })
      this.filterDataByKeyword()
    },
    filterDataByKeyword() {
      const filteredData = this.folderFilteredData.filter(item => {
        return this.$MatchKeyword(
          item,
          this.keyword.toLowerCase(),
          'enFull',
          'function',
          'name'
        )
      })
      this.filteredData = filteredData
      this.total = filteredData.length
      this.buildCurrentPage()
    },
    buildCurrentPage() {
      const start = this.pageSize * (this.currentPage - 1)
      const end = this.pageSize * this.currentPage
      this.pageData = this.filteredData.slice(start, end)
      this.loading = false
    },
    handleSizeChange() {
      this.currentPage = 1
      this.buildCurrentPage()
    },
    handleCurrentChange() {
      this.buildCurrentPage()
    },
    pathFormatter(row, column) {
      const array = row[column.property]
      return (
        `<span class="icon-i-folder">
                  <span class="path1"></span>
                  <span class="path2"></span>
                </span>` + array.map(item => item.name).join(' / ')
      )
    },
    handleRowClick(row) {
      this.$emit('row-click', row)
    },
  },
  watch: {
    keyword() {
      this.filterDataByKeyword()
    },
  },
}
</script>
<style lang="scss" scoped>
.container {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.filter-outer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
}
.table-outer {
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 42px;
}
.pagination-outer {
  position: absolute;
  height: 40px;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
