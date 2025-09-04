<template>
  <div class="permission-list">
    <div class="toolbar">
      <datablau-button type="primary" @click="openAddDialog">
        新增权限
      </datablau-button>
      <!-- <datablau-button @click="exportAll">导出全部</datablau-button> -->
    </div>
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="业务域">
        <datablau-input
          v-model="searchForm.domainName"
          placeholder="请输入目录名称"
          size="small"
          clearable
        />
      </el-form-item>
      <el-form-item label="确认人1">
        <datablau-input
          v-model="searchForm.confirmUser1"
          placeholder="请输入确认人1"
          size="small"
          clearable
        />
      </el-form-item>
      <el-form-item label="确认人2">
        <datablau-input
          v-model="searchForm.confirmUser2"
          placeholder="请输入确认人2"
          size="small"
          clearable
        />
      </el-form-item>
      <el-form-item style="margin-bottom: 10px">
        <datablau-button type="primary" size="small" @click="handleSearch">
          查询
        </datablau-button>
        <datablau-button size="small" @click="handleReset">
          重置
        </datablau-button>
      </el-form-item>
    </el-form>
    <datablau-table :data="tableData" style="width: 100%" border>
      <el-table-column prop="domainName" label="业务域" />
      <el-table-column prop="confirmUser1" label="确认人1" />
      <el-table-column prop="confirmUser2" label="确认人2" />
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <datablau-button
            size="mini"
            @click="openEditDialog(scope.$index, scope.row)"
          >
            编辑
          </datablau-button>
          <datablau-button
            size="mini"
            type="danger"
            @click="deletePermission(scope.row)"
          >
            删除
          </datablau-button>
        </template>
      </el-table-column>
    </datablau-table>
    <el-pagination
      style="margin-top: 10px; text-align: right"
      background
      layout="total, prev, pager, next, sizes"
      :total="total"
      :page-size="searchForm.pageSize"
      :current-page="searchForm.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <!-- 新增/编辑弹窗 -->
    <datablau-dialog
      :title="editId === null ? '新增权限' : '编辑权限'"
      :visible.sync="dialogVisible"
      append-to-body
    >
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item
          label="业务域"
          :label-width="formLabelWidth"
          prop="domainName"
        >
          <datablau-input v-model="form.domainName" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="确认人1"
          :label-width="formLabelWidth"
          prop="confirmUser1"
        >
          <datablau-input v-model="form.confirmUser1" autocomplete="off" />
        </el-form-item>
        <el-form-item
          label="确认人2"
          :label-width="formLabelWidth"
          prop="confirmUser2"
        >
          <datablau-input v-model="form.confirmUser2" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <datablau-button @click="dialogVisible = false">取 消</datablau-button>
        <datablau-button type="primary" @click="savePermission">
          确 定
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
export default {
  name: 'PermissionList',
  data() {
    return {
      tableData: [],
      total: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 20,
        domainName: '',
        confirmUser1: '',
        confirmUser2: '',
      },
      dialogVisible: false,
      form: {
        id: null,
        domainName: '',
        confirmUser1: '',
        confirmUser2: '',
      },
      editId: null,
      formLabelWidth: '100px',
      rules: {
        domainName: [
          { required: true, message: '请输入业务域', trigger: 'blur' },
        ],
        confirmUser1: [
          { required: true, message: '请输入确认人1', trigger: 'blur' },
        ],
        confirmUser2: [
          { required: true, message: '请输入确认人2', trigger: 'blur' },
        ],
      },
      loading: false,
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await this.$http({
          url: '/domain/apply/confirm/config/page',
          method: 'post',
          data: this.searchForm,
        })
        this.tableData = res.data.content || []
        this.total = res.data.totalItems || 0
      } catch (e) {
        this.$showFailure(e)
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.searchForm.pageNum = 1
      this.fetchData()
    },
    handleReset() {
      this.searchForm = {
        pageNum: 1,
        pageSize: 20,
        domainName: '',
        confirmUser1: '',
        confirmUser2: '',
      }
      this.fetchData()
    },
    handleSizeChange(val) {
      this.searchForm.pageSize = val
      this.searchForm.pageNum = 1
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.searchForm.pageNum = val
      this.fetchData()
    },
    openAddDialog() {
      this.editId = null
      this.form = {
        id: null,
        domainName: '',
        confirmUser1: '',
        confirmUser2: '',
      }
      this.dialogVisible = true
    },
    openEditDialog(index, row) {
      this.editId = row.id
      this.form = { ...row }
      this.dialogVisible = true
    },
    savePermission() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        try {
          await this.$http({
            url: '/domain/apply/confirm/config/save',
            method: 'post',
            data: this.form,
          })
          this.$message.success('保存成功')
          this.dialogVisible = false
          this.fetchData()
        } catch (e) {
          this.$showFailure(e)
        }
      })
    },
    async deletePermission(row) {
      try {
        await this.$confirm('确认删除该权限配置吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        await this.$http({
          url: '/domain/apply/confirm/config/delete',
          method: 'post',
          data: [row.id],
        })
        this.$message.success('删除成功')
        this.fetchData()
      } catch (e) {
        if (e !== 'cancel') this.$showFailure(e)
      }
    },
    exportAll() {
      //TODO: 调用后端导出接口，替换下方本地导出逻辑
      this.$message.info('请在此处调用后端导出接口')
    },
  },
}
</script>

<style scoped>
.permission-list {
  padding: 10px 20px;
}
.toolbar {
  margin-bottom: 10px;
}
.search-form {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
</style>
