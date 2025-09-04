<template>
  <div class="batch-list">
    <!-- 搜索区域 -->
    <div style="margin-left: 20px;">
      <datablau-input
        :iconfont-state="true"
        placeholder="批次名称"
        v-model="localFilterForm.applyName"
        style="display: inline-block"
        clearable
      />
      <datablau-select
        style="display: inline-block; margin-left: 10px"
        clearable
        multiple
        filterable
        v-model="localFilterForm.applyType"
        placeholder="批次类型"
      >
        <el-option label="资产DL123" value="资产DL123"></el-option>
        <el-option label="资产DL45" value="资产DL45"></el-option>
        <el-option label="标准数据元" value="标准数据元"></el-option>
        <el-option label="业务术语" value="业务术语"></el-option>
      </datablau-select>
      <datablau-input
        :iconfont-state="true"
        placeholder="创建人"
        v-model="localFilterForm.applyCreator"
        style="display: inline-block; margin-left: 10px"
        clearable
      />
      <datablau-dateRange
        @changeDateTime="handleDateRangeChange"
        style="display: inline-block; margin-left: 10px"
        v-model="dateRange"
        start-placeholder="创建开始日期"
        end-placeholder="创建结束日期"
        clearable
      />
      <!-- 审核状态 -->
      <datablau-select
        style="display: inline-block; margin-left: 10px"
        clearable
        filterable
        v-model="localFilterForm.innerState"
        placeholder="审核状态"
      >
        <el-option label="未确认" value="UNCONFIRMED" />
        <el-option label="已确认" value="CONFIRMED" />
        <el-option label="已绑定" value="BIND" />
        <el-option label="通过" value="PASS" />
        <el-option label="未通过" value="REJECT" />
      </datablau-select>
      <datablau-button
        type="primary"
        style="margin-left: 10px"
        @click="handleSearch"
      >
        查询
      </datablau-button>
      <datablau-button style="margin-left: 10px" @click="handleReset">
        重置
      </datablau-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-row">
      <datablau-table
        class="datablau-table-info"
        ref="batchTable"
        :data="tableData"
        height="100%"
        highlight-current-row
        @sort-change="$emit('sort-change', $event)"
        :border="true"
        v-loading="loading"
        :row-key="row => row.id"
        :data-selectable="true"
        :row-selectable="selectableBatch"
        @selection-change="$emit('selection-change', $event)"
      >
        <el-table-column
          label="批次类型"
          prop="applyType"
          show-overflow-tooltip
        />
        <el-table-column
          label="批次名称"
          prop="applyName"
          show-overflow-tooltip
        />
        <el-table-column
          label="创建人"
          prop="applyCreator"
          show-overflow-tooltip
        />
        <el-table-column label="状态" prop="innerState" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-tag :status="scope.row.innerState" />
          </template>
        </el-table-column>
        <el-table-column
          label="确认人"
          prop="confirmUser"
          show-overflow-tooltip
        />
        <el-table-column
          label="创建时间"
          prop="applyCreateTime"
          show-overflow-tooltip
          sortable="custom"
          :formatter="$dateFormatter"
        />
        <el-table-column
          label="操作"
          width="250"
          header-align="center"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              type="text"
              size="mini"
              @click="$emit('view', scope.row)"
            >
              查看
            </datablau-button>
            <datablau-button
              v-if="scope.row.innerState === 'UNCONFIRMED'"
              type="text"
              size="mini"
              @click="$emit('reject', scope.row)"
            >
              驳回
            </datablau-button>
            <!-- 确认按钮 -->
            <datablau-button
              v-if="
                scope.row.innerState === 'UNCONFIRMED' &&
                $auth['APPLY_CONFIRM']
              "
              type="text"
              size="mini"
              @click="$emit('confirm', scope.row)"
            >
              确认
            </datablau-button>
            <datablau-button
              v-if="
                !dopEnabled &&
                scope.row.innerState === 'UNCONFIRMED' &&
                $auth['APPLY_CONFIRM']
              "
              type="text"
              size="mini"
              @click="$emit('approval', scope.row)"
            >
              审批
            </datablau-button>
            <datablau-button
              type="text"
              size="mini"
              @click="$emit('delete', scope.row)"
              v-if="
                scope.row.innerState === 'UNCONFIRMED' && $auth['APPLY_DELETE']
              "
            >
              删除
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>

    <!-- 分页区域 -->
    <div class="footer-row">
      <datablau-pagination
        style="float: right"
        @size-change="$emit('size-change', $event)"
        @current-change="$emit('current-change', $event)"
        :current-page.sync="pagination.currentPage"
        :page-sizes="pagination.pageSizes"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
      />
    </div>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag.vue'

export default {
  name: 'BatchList',
  components: {
    StatusTag,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    pagination: {
      type: Object,
      required: true,
    },
    filterForm: {
      type: Object,
      required: true,
    },
    dopEnabled: {
      type: Boolean,
      default: false,
    },
    selectedRows: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      dateRange: [],
      localFilterForm: { ...this.filterForm },
      isUpdatingFromParent: false, // 添加标志位防止死循环
    }
  },
  watch: {
    filterForm: {
      handler(newVal) {
        this.isUpdatingFromParent = true
        this.localFilterForm = { ...newVal }
        this.$nextTick(() => {
          this.isUpdatingFromParent = false
        })
      },
      deep: true,
    },
    // 监听本地表单变化，同步到父组件
    localFilterForm: {
      handler(newVal) {
        if (!this.isUpdatingFromParent) {
          this.$emit('updateFilterForm', { ...newVal })
        }
      },
      deep: true,
    },
  },
  methods: {
    handleSearch() {
      this.$emit('search')
    },

    handleReset() {
      this.dateRange = []
      this.isUpdatingFromParent = true
      this.localFilterForm = {
        pageNum: 1,
        pageSize: 20,
        applyType: [],
        applyName: '',
        applyCreator: '',
        startTime: '',
        endTime: '',
        innerState: '',
      }
      // 同步重置后的表单到父组件
      this.$emit('updateFilterForm', { ...this.localFilterForm })
      this.$nextTick(() => {
        this.isUpdatingFromParent = false
      })
      this.$emit('reset')
    },

    handleDateRangeChange(value) {
      this.isUpdatingFromParent = true
      if (value && value.length === 2) {
        this.localFilterForm.startTime = new Date(value[0]).toISOString()
        this.localFilterForm.endTime = new Date(value[1]).toISOString()
      } else {
        this.localFilterForm.startTime = ''
        this.localFilterForm.endTime = ''
      }
      // 同步日期变化到父组件
      this.$emit('updateFilterForm', { ...this.localFilterForm })
      this.$nextTick(() => {
        this.isUpdatingFromParent = false
      })
    },

    selectableBatch(row) {
      return this.dopEnabled && row.innerState === 'CONFIRMED'
    },

  },
}
</script>

<style scoped lang="scss">
.batch-list {
  height: 100%;

  .table-row {
    position: absolute;
    top: 60px;
    bottom: 60px;
    left: 0;
    right: 0;
    padding: 0 20px;
  }

  .footer-row {
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    height: 50px;
    padding: 10px 20px;
    box-sizing: border-box;
  }
}
</style>
