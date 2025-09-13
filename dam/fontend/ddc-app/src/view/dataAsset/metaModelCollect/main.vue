<template>
  <div class="meta-model-collect">
    <!-- 搜索区域 -->
    <div class="search-area">
      <datablau-input
        v-model="searchKeyword"
        placeholder="请输入模型名称"
        prefix-icon="el-icon-search"
        @input="handleSearch"
        style="width: 240px"
      />
    </div>

    <!-- 表格部分 -->
    <datablau-table
      v-loading="loading"
      :data="tableData"
      @selection-change="handleSelectionChange"
      style="width: 100%; height: calc(100% - 111px)"
      height="100%"
    >
      <el-table-column type="selection" width="40" align="center" />
      <el-table-column prop="ddmCategoryPath" label="模型路径" />
      <el-table-column prop="ddmModelName" label="模型名称" />
      <el-table-column prop="dbType" label="模型类型">
        <template slot-scope="scope">
          <Database-Type
            :key="scope.row.dbType"
            :value="scope.row.dbType"
            :size="16"
          ></Database-Type>
        </template>
      </el-table-column>
      <el-table-column prop="modelCategoryName" label="应用系统">
        <template slot-scope="scope">
          <span>{{ scope.row.modelCategoryName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="最后更新时间">
        <template slot-scope="scope">
          <span>{{ $timeFormatter(scope.row.updateTime || '-') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="290">
        <template slot-scope="scope">
          <datablau-button
            type="text"
            class="link-button"
            @click="handleLinkSystem(scope.row)"
          >
            关联应用系统
          </datablau-button>
          <datablau-button
            type="text"
            class="link-button"
            :disabled="!scope.row.modelCategoryName"
            @click="handlerImmediatelyCollect(scope.row.jobId)"
          >
            立即采集
          </datablau-button>
          <datablau-button
            type="text"
            class="link-button"
            @click="metaCollect(scope.row)"
            :disabled="!scope.row.modelCategoryName"
          >
            自动采集任务
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>

    <!-- 弹窗部分调整 -->
    <datablau-dialog
      :visible.sync="dialogVisible"
      append-to-body
      title="关联业务系统"
      width="400px"
      class="link-system-dialog"
    >
      <el-form ref="form" :model="formData" :rules="rules" label-width="80px">
        <el-form-item
          label="系统名称"
          prop="modelCategoryId"
          class="required-label"
        >
          <datablau-select
            v-model="formData.modelCategoryId"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="c in $modelCategories"
              :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
              :value="c.categoryId"
              :key="c.categoryId"
            ></el-option>
          </datablau-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <datablau-button @click="dialogVisible = false">取消</datablau-button>
        <datablau-button type="primary" @click="handleConfirm">
          确认
        </datablau-button>
      </div>
    </datablau-dialog>

    <!-- 添加分页组件 -->
    <div class="pagination-container">
      <datablau-pagination
        :current-page="pageInfo.currentPage"
        :page-size="pageInfo.pageSize"
        :total="pageInfo.total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total, prev, pager, next, sizes"
      />
    </div>
  </div>
</template>

<script>
import DatabaseType from './DatabaseType.vue'
import api from "@/view/dataAsset/utils/api";
export default {
  data() {
    return {
      loading: false,
      searchKeyword: '',
      tableData: [], // 清空默认数据
      currentRow: null, // 添加当前操作行数据
      selectedRows: [],
      dialogVisible: false,
      formData: {
        systemName: '',
      },
      rules: {
        systemName: [
          { required: true, message: '请选择系统名称', trigger: 'change' },
        ],
      },
      pageInfo: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      formData: {
        systemName: '',
        modelCategoryId: null,
      },
    }
  },
  components: {
    DatabaseType,
  },
  created() {
    // 初始化防抖处理的方法
    this.debouncedSearch = _.debounce(this.fetchTableData, 300)
    this.fetchTableData()
  },

  methods: {
    // 处理 立即采集
    async handlerImmediatelyCollect(taskId) {
      const res = await this.$http.post(`/job/main/canExecuteToday?jobId=${taskId}`);
      await api.runTask(taskId, this.$user.username)
      this.$message.success('采集成功')
    },
    async handleLinkSystem(row) {
      this.currentRow = row
      this.dialogVisible = true
      // 如果已关联，设置当前的系统ID
      this.formData = {
        modelCategoryId: row.modelCategoryId || null,
      }
    },
    /**
     * 处理表格选择变化
     * @param {Array} rows 当前选中的所有行数据
     */
    handleSelectionChange(rows) {
      if (Array.isArray(rows)) {
        this.selectedRows = rows
      } else {
        this.selectedRows = []
        console.warn('Selected rows data is not an array')
      }
    },
    // 获取表格数据
    async fetchTableData() {
      this.loading = true
      try {
        const params = {
          ddmModelName: this.searchKeyword,
          currentPage: this.pageInfo.currentPage,
          pageSize: this.pageInfo.pageSize,
        }
        const res = await this.$http.post(
          '/assets/ddm/collect/queryDdmModelInfoPage',
          params
        )
        this.tableData = res.data.content
        this.pageInfo.total = res.data.totalItems
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || '获取数据失败，请稍后重试'
        this.$message.error(errorMsg)
      } finally {
        this.loading = false
      }
    },

    // 关联业务系统
    async handleConfirm() {
      try {
        await this.$refs.form.validate()
        this.loading = true
        const params = {
          ddmModelId: this.currentRow.ddmModelId,
          modelCategoryId: this.formData.modelCategoryId,
        }
        await this.$http.post(
          '/assets/ddm/collect/updateDdmRelModelCategory',
          params
        )
        this.$message.success('关联业务系统成功')
        this.dialogVisible = false
        this.fetchTableData()
      } catch (error) {
        const errorMsg = error.response?.data?.message || '关联失败，请稍后重试'
        this.$message.error(errorMsg)
      } finally {
        this.loading = false
      }
    },

    // 采集元数据
    async metaCollect(row) {
      try {
        this.loading = true
        if (row.jobId) {
          let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('jobScheduler', {
            jobId: row.jobId,
            name: row.ddmModelName,
            blank: true,
          })
          window.open(pageUrl)
        } else {
          const params = {
            ddmModelId: row.ddmModelId,
            ddmModelName: row.ddmModelName,
          }
          const res = await this.$http.post(
            '/assets/ddm/collect/createDdmCollectTask',
            params
          )
          if (res.data) {
            let pageUrl = this.BaseUtils.RouterUtils.getFullUrl(
              'metaDatasourceJob',
              {
                resourceId: res.data,
                jobType: '元数据-更新扫描任务',
                blank: true,
              }
            )
            window.open(pageUrl)
          } else {
            this.$message.error('创建采集任务失败，请稍后重试')
          }
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || '操作失败，请稍后重试'
        this.$message.error(errorMsg)
      } finally {
        this.loading = false
      }
    },

    // 搜索
    handleSearch() {
      this.pageInfo.currentPage = 1
      this.debouncedSearch()
    },

    // 分页相关方法
    handleCurrentChange(page) {
      this.pageInfo.currentPage = page
      this.debouncedSearch()
    },

    handleSizeChange(size) {
      this.pageInfo.pageSize = size
      this.pageInfo.currentPage = 1
      this.debouncedSearch()
    },
  },
}
</script>

<style lang="scss" scoped>
.meta-model-collect {
  padding: 16px;
  padding-bottom: 0;
  background-color: #fff;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .search-area {
    padding-bottom: 16px;
    // border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .add-button {
      margin-left: 16px;
    }
  }

  // /deep/ {
  //   .el-table {
  //     flex: 1;

  //     th {
  //       background-color: #f5f7fa;
  //       color: #606266;
  //       font-weight: normal;
  //       padding: 12px 0;
  //     }

  //     td {
  //       padding: 12px 0;
  //     }

  //     &::before {
  //       display: none;
  //     }
  //   }
  // }

  .pagination-container {
    padding: 16px;
    display: flex;
    justify-content: flex-end;
    background-color: #fff;
    border-top: 1px solid #ebeef5;
  }
}

.link-system-dialog {
  /deep/ {
    .el-dialog__body {
      padding: 20px 40px;
    }

    .required-label {
      .el-form-item__label::before {
        content: '*';
        color: #f56c6c;
        margin-right: 4px;
      }
    }
  }
}

.dialog-footer {
  text-align: center;

  .datablau-button + .datablau-button {
    margin-left: 12px;
  }
}
</style>
