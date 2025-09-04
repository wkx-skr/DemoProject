<template>
  <div class="meta-model-query">
    <div class="search-area">
      <div class="search-form">
        <div class="form-item">
          <span class="label">应用系统</span>
          <datablau-select
            v-model="searchForm.modelCategoryId"
            placeholder="请选择"
            clearable
            @change="handleSystemChange"
            @clear="handleSystemClear"
          >
            <el-option
              v-for="c in $modelCategories"
              :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
              :value="c.categoryId"
              :key="c.categoryId"
            ></el-option>
          </datablau-select>
        </div>
        <div class="form-item">
          <span class="label">模型</span>
          <datablau-select
            v-model="searchForm.ddmModelId"
            placeholder="请选择"
            :disabled="!searchForm.modelCategoryId"
            clearable
            @change="handleModelChange"
            @clear="handleModelClear"
          >
            <el-option
              v-for="item in options.models"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </datablau-select>
        </div>
        <div class="form-item">
          <span class="label">表/逻辑数据实体</span>
          <datablau-select
            v-model="searchForm.tableId"
            placeholder="请选择"
            :disabled="!searchForm.ddmModelId"
          >
            <el-option
              v-for="item in options.tables"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </datablau-select>
        </div>
        <datablau-button type="primary" @click="handleSearch">
          查询
        </datablau-button>
        <datablau-button @click="handleReset">重置</datablau-button>
      </div>
    </div>

    <!-- 表格部分 -->
    <!-- 修改表格列 -->
    <datablau-table
      :data="tableData"
      style="width: 100%; height: calc(100% - 111px)"
      height="100%"
    >
      <el-table-column prop="modelCategoryName" label="应用系统" />
      <el-table-column prop="ddmModelName" label="模型" />
      <el-table-column prop="tableName" label="表/逻辑数据实体" />
      <el-table-column prop="tableCnName" label="表/实体中文名" />
      <el-table-column prop="columnCnName" label="属性中文名" />
      <el-table-column prop="columnName" label="属性英文名" />
      <el-table-column prop="pk" label="主键" align="center">
        <template slot-scope="scope">
          {{ scope.row.pk ? '是' : '否' }}
        </template>
      </el-table-column>
    </datablau-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <datablau-pagination
        :current-page="pageInfo.currentPage"
        :page-size="pageInfo.pageSize"
        :page-sizes="[20, 50, 100]"
        :total="pageInfo.total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total, prev, pager, next, sizes"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'MetaModelQuery',

  data() {
    return {
      searchForm: {
        modelCategoryId: '',
        ddmModelId: '',
        tableId: '',
      },
      options: {
        models: [],
        tables: [],
      },
      tableData: [],
      pageInfo: {
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
    }
  },

  created() {
    this.handleSearch()
  },

  methods: {
    // 应用系统清除
    handleSystemClear() {
      this.searchForm.ddmModelId = ''
      this.searchForm.tableId = ''
      this.options.models = []
      this.options.tables = []
    },

    // 模型清除
    handleModelClear() {
      this.searchForm.tableId = ''
      this.options.tables = []
    },
    // 根据系统获取模型列表
    async fetchModels(modelCategoryId) {
      try {
        const response = await this.$http.get(
          `/assets/ddm/data/queryModelByModelCategoryId`,
          {
            params: { modelCategoryId },
          }
        )
        this.options.models = response.data.map(item => ({
          label: item.ddmModelName,
          value: item.ddmModelId,
        }))
      } catch (error) {
        this.$message.error('获取模型列表失败')
      }
    },

    // 根据模型获取表/实体列表
    async fetchTables(ddmModelId) {
      try {
        const response = await this.$http.get(
          `/assets/ddm/data/queryModelByModelId`,
          {
            params: { ddmModelId },
          }
        )
        this.options.tables = response.data.map(item => ({
          label: item.tableName,
          value: item.tableId,
        }))
      } catch (error) {
        this.$message.error('获取表/实体列表失败')
      }
    },

    // 应用系统变化
    handleSystemChange(value) {
      this.searchForm.ddmModelId = ''
      this.searchForm.tableId = ''
      this.options.models = []
      this.options.tables = []
      if (value) {
        this.fetchModels(value)
      }
    },

    // 模型变化
    handleModelChange(value) {
      this.searchForm.tableId = ''
      this.options.tables = []
      if (value) {
        this.fetchTables(value)
      }
    },

    // 重置
    handleReset() {
      this.searchForm = {
        modelCategoryId: '',
        ddmModelId: '',
        tableId: '',
      }
      this.pageInfo = {
        currentPage: 1,
        pageSize: 20
      }
      this.options.models = []
      this.options.tables = []
      this.handleSearch()
    },

    // 查询数据
    async handleSearch() {
      try {
        const params = {
          modelCategoryId: this.searchForm.modelCategoryId,
          ddmModelId: this.searchForm.ddmModelId,
          tableId: this.searchForm.tableId || null,
          currentPage: this.pageInfo.currentPage,
          pageSize: this.pageInfo.pageSize,
        }

        const response = await this.$http.post(
          '/assets/ddm/data/queryDdmModelCollectElementPage',
          params
        )
        this.tableData = response.data.content
        this.pageInfo.total = response.data.totalItems
      } catch (error) {
        this.$message.error('查询失败')
      }
    },

    handleCurrentChange(page) {
      this.pageInfo.currentPage = page
      this.handleSearch()
    },

    handleSizeChange(size) {
      this.pageInfo.pageSize = size
      this.pageInfo.currentPage = 1
      this.handleSearch()
    },
  },
}
</script>

<style lang="scss" scoped>
.meta-model-query {
  padding: 16px;
  padding-bottom: 0;
  background-color: #fff;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .search-area {
    padding-bottom: 16px;

    .search-form {
      display: flex;
      align-items: center;
      gap: 16px;

      .form-item {
        display: flex;
        align-items: center;

        .label {
          margin-right: 8px;
          white-space: nowrap;
        }

        .datablau-select {
          width: 160px;
        }
      }
    }
  }

  .pagination-container {
    padding: 16px;
    display: flex;
    justify-content: flex-end;
    background-color: #fff;
    border-top: 1px solid #ebeef5;
  }
}
</style>
