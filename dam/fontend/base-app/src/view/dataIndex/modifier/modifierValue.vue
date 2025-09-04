<template>
  <div>
    <datablau-button @click="addRow" type="text" class="iconfont icon-tianjia">
      {{ Label.newValue }}
    </datablau-button>
    <datablau-table
      class="thin"
      :data="tableData"
      style="width: 800px"
      v-loading="tableLoading"
    >
      <el-table-column
        :label="Label.valueCode"
        prop="code"
        :min-width="200"
        :show-overflow-tooltip="false"
      >
        <template slot-scope="scope">
          <datablau-input
            v-model="scope.row.code"
            style="width: 100%"
          ></datablau-input>
        </template>
      </el-table-column>
      <el-table-column
        :label="Label.valueName"
        prop="name"
        :min-width="200"
        :show-overflow-tooltip="false"
      >
        <template slot-scope="scope">
          <datablau-input
            v-model="scope.row.name"
            style="width: 100%"
          ></datablau-input>
        </template>
      </el-table-column>
      <el-table-column
        label="描述"
        prop="description"
        :min-width="200"
        :show-overflow-tooltip="false"
      >
        <template slot-scope="scope">
          <datablau-input
            v-model="scope.row.description"
            style="width: 100%"
          ></datablau-input>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('domain.common.operation')"
        fixed="right"
        :width="80"
      >
        <template slot-scope="scope">
          <datablau-button
            type="icon"
            class="iconfont icon-delete"
            @click="deleteRow(scope.$index)"
          ></datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <datablau-pagination
      style="float: left; margin-top: 10px"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></datablau-pagination>
  </div>
</template>
<script>
import { Label, ModifierCategory } from './entrance/Constant'

export default {
  props: {
    dataList: {
      required: true,
      type: Array,
    },
    modifierCategory: ModifierCategory,
    currentItem: {},
  },
  mounted() {
    this.$bus.$on('modifier-value-loading', tableLoading => {
      this.tableLoading = tableLoading
    })
    this.setTableData()
  },
  beforeDestroy() {
    this.$bus.$off('modifier-value-loading')
  },
  data() {
    return {
      tableLoading: false,
      total: 0,
      pageSize: 10,
      currentPage: 1,
      tableData: [],
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.setTableData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.setTableData()
    },
    setTableData() {
      this.total = this.dataList.length
      if (this.currentPage > Math.ceil(this.total / this.pageSize)) {
        this.currentPage--
      }
      this.tableData = this.dataList.slice(
        this.pageSize * (this.currentPage - 1),
        this.pageSize * this.currentPage
      )
    },
    addRow() {
      this.dataList.push({
        code: '',
        name: '',
        description: '',
        modifierTypeId: this.currentItem ? this.currentItem.id : null,
        modifierCategory: ModifierCategory[this.modifierCategory],
      })
      this.total++
      this.currentPage = Math.ceil(this.total / this.pageSize)
    },
    deleteRow(idx) {
      const row = this.tableData[idx]
      if (row.id) {
        if (row.bindMetrics) {
          this.$DatablauAlert(
            `${this.Label.valueName}“${row.name}”被引用，不可删除!`,
            '',
            'warning',
            {}
          )
        } else {
          this.$DatablauCofirm(
            `${this.Label.valueName}“${row.name}”，确认要删除吗？`,
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            }
          ).then(() => {
            this.dataList.splice(
              idx + (this.currentPage - 1) * this.pageSize,
              1
            )
            this.total--
          })
        }
      } else {
        // 用户刚刚创建的，不需要处理，直接删除
        this.dataList.splice(idx + (this.currentPage - 1) * this.pageSize, 1)
        this.total--
      }
    },
  },
  computed: {
    Label() {
      return Label[this.modifierCategory]
    },
  },
  watch: {
    dataList: {
      handler() {
        this.setTableData()
      },
    },
    total: {
      handler() {
        this.setTableData()
      },
    },
  },
}
</script>
