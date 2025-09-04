<template>
  <div>
    <datablau-form-submit class="table-row">
      <datablau-table
        height="100%"
        :data-selectable="true"
        :show-column-selection="false"
        :data="pagingData"
        @selection-change="handleSelectionChange"
      >
        <el-table-column width="25">
          <template slot-scope="scope">
            <i
              style="position: relative; margin-left: 5px; top: 2px"
              :class="[
                'iconfont',
                'icon-' + typeIconMap[scope.row.objectType || scope.row.type],
              ]"
            ></i>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="数据资产名称" show-overflow-tooltip>
          <template scope="{row}">
            {{ row.physicalName || row.objectName
            }}{{ row.logicalName && `（${row.logicalName}）` }}
          </template>
        </el-table-column>
        <el-table-column
          prop="path"
          :min-width="180"
          show-overflow-tooltip
          label="权威来源"
        ></el-table-column>
        <el-table-column
          prop="tagNames"
          :min-width="100"
          label="安全等级"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ getSecurityName(scope.row.tagNames) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" :width="'60px'">
          <template scope="{row}">
            <datablau-button type="icon" @click="delectSingle(row)">
              <i class="iconfont icon-delete"></i>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="border">
          <template v-if="selectList.length > 0">
            <span class="check-info"></span>
            <span class="footer-row-info">
              当前选中“{{ selectList.length }}条”信息，是否
            </span>

            <datablau-button
              type="danger"
              class="el-icon-delete"
              @click="delectAry"
            >
              删除
            </datablau-button>
          </template>
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100, 200]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="left-btn"
          ></datablau-pagination>
        </div>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
export default {
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    tableData: {
      handler() {
        this.allTableData = _.cloneDeep(this.tableData)
        this.total = this.allTableData.length
        this.paging(0, this.pageSize)
      },
      immediate: true,
    },
  },
  data() {
    return {
      selectList: [],
      typeIconMap: {
        TABLE: 'biao',
        VIEW: 'shitu',
        COLUMN: 'ziduan',
      },
      currentPage: 1,
      pageSize: 20,
      total: 0,
      pagingData: [],
      allTableData: [],
    }
  },
  methods: {
    getSecurityName(list) {
      if (list) {
        return list.join(',')
      }
      return ''
    },
    paging(star, size) {
      this.pagingData = this.allTableData.splice(star, size)
      this.allTableData.splice(star, 0, ...this.pagingData)
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.paging(0, val)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.paging((val - 1) * this.pageSize, val * this.pageSize)
    },
    handleSelectionChange(row) {
      this.selectList = row
    },
    delectAry() {
      this.$DatablauCofirm(
        `已选择“${this.selectList.length}条”数据，确认要删除吗？`
      ).then(() => {
        this.selectList.forEach(item => {
          this.delectTable(item)
        })
      })
    },
    delectSingle(item) {
      this.$DatablauCofirm(`确认要删除吗？`).then(() => {
        this.delectTable(item)
      })
    },
    delectTable(row) {
      this.allTableData = this.allTableData.filter(
        item => item.objectId !== row.objectId
      )
      this.$emit('delectData', { list: this.allTableData, row })
    },
  },
  mounted() {},
}
</script>

<style scoped lang="scss">
.table-row {
}

.left-btn {
  float: right;
}
</style>
