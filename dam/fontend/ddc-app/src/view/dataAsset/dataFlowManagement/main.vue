<template>
  <div class="data-flow-management">
    <!-- 搜索条件区域 -->
    <div class="data-flow-search">
      <el-form
        :model="searchForm"
        ref="searchForm"
        :inline="true"
        size="mini"
        class="search-form-inline"
      >
        <el-form-item label="系统名称" label-width="100px">
          <datablau-input
            v-model="searchForm.modelCategoryName"
            placeholder="搜索名称"
            clearable
            style="width: 8vw"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="业务对象名称" label-width="100px">
          <datablau-input
            v-model="searchForm.l3Name"
            placeholder="搜索名称"
            clearable
            style="width: 8vw"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="逻辑实体名称" label-width="100px">
          <datablau-input
            v-model="searchForm.l4Name"
            placeholder="搜索名称"
            clearable
            style="width: 8vw"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <div class="right-button-group">
        <datablau-button type="normal" size="mini" @click="handleSearch">
          查询
        </datablau-button>
        <datablau-button type="secondary" size="mini" @click="resetForm">
          重置
        </datablau-button>
        <datablau-button type="warning" size="mini" @click="handleSync" :loading="loading.sync">
          同步数据
        </datablau-button>
        <datablau-button type="primary" size="mini" @click="handleCreate">
          新建CRUD
        </datablau-button>
        <el-dropdown @command="handleCommand">
          <datablau-button type="normal" size="mini">
            更多操作
          </datablau-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="downloadCRUDTemplate">下载CRUD模板</el-dropdown-item>
            <el-dropdown-item command="importCRUD">导入CRUD</el-dropdown-item>
            <el-dropdown-item command="exportCRUD" v-if="$auth['DATA_FLOW_DIAGRAM_EXPORT']">导出CRUD</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="data-flow-table">
      <datablau-table
        :data="tableData"
        @selection-change="handleSelectionChange"
        style="width: 100%; height: 100%"
        height="100%"
        v-loading="loading.table"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="系统名称" prop="modelCategoryName" align="center"></el-table-column>
        <!-- <el-table-column label="系统编码" prop="modelCategoryCode" align="center"></el-table-column> -->

        <el-table-column label="业务对象名称" prop="l3Name" width="200" align="center"></el-table-column>
        <el-table-column label="业务对象编码" prop="l3Code" width="200" align="center"></el-table-column>
        <el-table-column label="逻辑实体名称" prop="l4Name" width="200" align="center"></el-table-column>
        <el-table-column label="逻辑实体编码" prop="l4Code" width="250" align="center"></el-table-column>
        <el-table-column label="数据操作" prop="dataFlowPermissions" width="160" align="center">
          <template slot-scope="scope">
            <el-tag
              v-for="(permission, index) in scope.row.dataFlowPermissions.split('')"
              :key="permission + index"
              :type="getPermissionTagType(permission)"
              class="permission-tag"
              size="mini"
            >
              {{ permission }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否分发源头" prop="distributionSource" width="100" align="center">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.distributionSource !== null"
              :type="getDistributionSourceTagType(scope.row.distributionSource)"
              size="mini"
            >
              {{ getDistributionSourceText(scope.row.distributionSource) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template slot-scope="scope">
            <datablau-button
              type="text"
              size="small"
              @click="handleEdit(scope.row)"
            >
              编辑CRUD
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>

    <!-- 底部操作按钮和分页 -->
    <div class="data-flow-footer">
      <div class="left-btn" v-show="selectedRows && selectedRows.length > 0">
        <span class="footer-row-info">
          已选择 {{ selectedRows.length }} 条数据
        </span>
        <datablau-button
          type="danger"
          size="mini"
          @click="handleBatchDelete"
          :disabled="selectedRows.length === 0"
        >
          移除绑定关系
        </datablau-button>
      </div>
      <datablau-pagination
        class="pagination-component"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="pagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
      ></datablau-pagination>
    </div>

    <!-- 编辑权限弹窗 -->
    <datablau-dialog
      :title="crudDialogTitle"
      :visible.sync="crudDialogVisible"
      :close-on-click-modal="false"
      width="820px"
      append-to-body
      @close="handleDialogClose"
    >
      <el-form :model="crudForm" :rules="rules" ref="crudForm" label-width="120px" size="mini" class="crud-form">
        <el-form-item label="系统名称" prop="modelCategoryId">
          <el-cascader
            v-if="dialogMode === 'create'"
            v-model="crudForm.modelCategoryId"
            :options="systemOptions"
            :props="{ value: 'categoryId', label: 'name', children: 'nodes', checkStrictly: true, emitPath: false }"
            placeholder="请选择"
            clearable
            filterable
            style="width: 100%;"
            :disabled="dialogMode === 'edit'"
          ></el-cascader>
          <datablau-input
            v-else
            v-model="editDisplay.systemName"
            disabled
            style="width: 100%;"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="逻辑实体名称" prop="l4Code">
          <el-select
            v-if="dialogMode === 'create'"
            v-model="crudForm.l4Code"
            placeholder="请输入搜索逻辑实体名称"
            filterable
            remote
            :remote-method="searchLogicalEntities"
            :loading="logicalEntityLoading"
            clearable
            style="width: 100%;"
            :disabled="dialogMode === 'edit'"
            @change="handleLogicalEntityChange"
            @clear="handleLogicalEntityClear"
            @blur="handleLogicalEntityBlur"
            @focus="handleLogicalEntityFocus"
          >
            <el-option
              v-for="item in logicalEntityOptions"
              :key="item.value"
              :label="item.fullPath"
              :value="item.value"
            />
          </el-select>
          <datablau-input
            v-else
            v-model="editDisplay.logicalEntityPath"
            disabled
            style="width: 100%;"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="数据操作" prop="permissions" class="permission-form-item">
          <div class="permission-checkbox-group">
            <el-checkbox v-model="crudForm.permissions.C">C</el-checkbox>
            <el-checkbox v-model="crudForm.permissions.R">R</el-checkbox>
            <el-checkbox v-model="crudForm.permissions.U">U</el-checkbox>
            <el-checkbox v-model="crudForm.permissions.D">D</el-checkbox>
          </div>
        </el-form-item>
        <el-form-item label="是否分发源头" label-width="120px">
          <div class="distribution-note-layout">
            <el-radio-group
              v-model="crudForm.distributionSource"
              :disabled="!crudForm.permissions.U">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
            <div class="dialog-note">
              <!-- 注：如果勾选分发源头，则所有R来源于该U，而非来源于C。 -->
              注：此选项针对U操作，如果勾选，在生成的数据流图中，逻辑实体的方向为U->R，适用于MDM中备案数据分发等情况。
            </div>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <datablau-button @click="crudDialogVisible = false">取消</datablau-button>
        <datablau-button type="primary" @click="saveCrudPermissions">确定</datablau-button>
      </span>
    </datablau-dialog>

    <!-- 新建权限弹窗 -->
    <datablau-dialog
      title="新建CRUD"
      :visible.sync="createDialogVisible"
      width="500px"
      append-to-body
    >
      <el-form :model="createForm" ref="createForm" label-width="120px" size="mini">
        <el-form-item label="逻辑实体编码" prop="l4Code">
          <datablau-input v-model="createForm.l4Code" placeholder="请输入逻辑实体编码"></datablau-input>
        </el-form-item>
        <el-form-item label="数据操作">
          <div class="permission-checkbox-group" style="margin-top: 5px;">
            <el-checkbox v-model="newPermissions.C">C</el-checkbox>
            <el-checkbox v-model="newPermissions.R">R</el-checkbox>
            <el-checkbox v-model="newPermissions.U">U</el-checkbox>
            <el-checkbox v-model="newPermissions.D">D</el-checkbox>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <datablau-button @click="createDialogVisible = false">取消</datablau-button>
        <datablau-button type="primary" @click="createNewPermission">确定</datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
export default {
  name: 'DataFlowManagement',
  data() {
    return {
      searchForm: {
        l3Name: '',
        l4Name: '',
        modelCategoryName: '',
        currentPage: 1,
        pageSize: 10
      },
      tableData: [],
      selectedRows: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      loading: {
        table: false,
        sync: false,
      },
      crudDialogVisible: false,
      dialogMode: 'create',
      currentRow: null,
      crudForm: {
        modelCategoryId: null,
        l4Code: null,
        distributionSource: null,
        permissions: {
          C: false,
          R: false,
          U: false,
          D: false
        }
      },
      systemOptions: [],
      logicalEntityOptions: [],
      logicalEntityLoading: false,
      logicalEntityBlurTimer: null, // 失焦延时器
      validatePermissions: (rule, value, callback) => {
        const { C, R, U, D } = value;
        if (!C && !R && !U && !D) {
          callback(new Error('请至少选择一个数据操作'));
        } else {
          callback();
        }
      },
      createDialogVisible: false,
      createForm: {
        l4Code: ''
      },
      newPermissions: {
        C: false,
        R: false,
        U: false,
        D: false
      },
      editDisplay: {
        systemName: '',
        logicalEntityPath: ''
      },
      baseRules: {
        permissions: [
          { required: true, validator: (rule, value, callback) => {
              const { C, R, U, D } = value;
              if (!C && !R && !U && !D) {
                callback(new Error('请至少选择一个数据操作'));
              } else {
                callback();
              }
            }, trigger: 'change'
          }
        ]
      },
      rules: {
        permissions: []
      }
    }
  },
  computed: {
    crudDialogTitle() {
      return this.dialogMode === 'create' ? '新建CRUD' : '编辑CRUD';
    }
  },
  created() {
    this.fetchData()
    this.fetchSystemTree()
  },
  methods: {


    // Fetch system tree data
    fetchSystemTree() {
      this.$http.get('/base/modelCategory/getTree')
        .then(res => {
          const rawNodes = res?.data?.nodes || [];
          this.systemOptions = this.processNodesForCascader(rawNodes);
        })
        .catch(err => {
          this.$showFailure(err);
          this.systemOptions = [];
        });
    },

    // Recursively process nodes for cascader display
    processNodesForCascader(nodes) {
      if (!Array.isArray(nodes)) {
        return [];
      }
      return nodes.map(node => {
        const processedNode = { ...node };
        if (processedNode.nodes && Array.isArray(processedNode.nodes)) {
          if (processedNode.nodes.length === 0) {
            // Set nodes to undefined if empty to avoid expand icon / 'No data'
            processedNode.nodes = undefined;
          } else {
            // Recursively process children
            processedNode.nodes = this.processNodesForCascader(processedNode.nodes);
          }
        } else {
          // If nodes is null or not an array, treat as leaf / undefined children
          processedNode.nodes = undefined;
        }
        // Explicitly set isLeaf if nodes is now undefined (helps cascader)
        if (processedNode.nodes === undefined) {
          processedNode.isLeaf = true;
        }
        return processedNode;
      });
    },

    // 搜索逻辑实体
    searchLogicalEntities(query) {
      // 清空条件检查
      if (!query || query.trim() === '') {
        this.logicalEntityOptions = [];
        this.logicalEntityLoading = false;
        return;
      }

      // 防止重复请求
      if (this.logicalEntityLoading) {
        return;
      }

      this.logicalEntityLoading = true;
      this.$http.get('/assets/dataflow/searchLogicalEntities', {
        params: { keyword: query.trim() }
      })
        .then(res => {
          const entities = res?.data || [];
          this.logicalEntityOptions = entities.map(entity => ({
            value: entity.catalogCode,
            label: entity.catalogName,
            fullPath: entity.fullPath || entity.catalogName
          }));
          console.log(`搜索到 ${entities.length} 个逻辑实体`);
        })
        .catch(err => {
          console.error('搜索逻辑实体失败:', err);
          this.$message.error('搜索逻辑实体失败');
          this.logicalEntityOptions = [];
        })
        .finally(() => {
          this.logicalEntityLoading = false;
        });
    },

    // 处理逻辑实体选择变更
    handleLogicalEntityChange(value) {
      // 取消失焦清空操作，因为用户已经选择了
      if (this.logicalEntityBlurTimer) {
        clearTimeout(this.logicalEntityBlurTimer);
        this.logicalEntityBlurTimer = null;
      }
    },

    // 处理逻辑实体清除
    handleLogicalEntityClear() {
      // 清空搜索状态
      this.logicalEntityOptions = [];
      this.logicalEntityLoading = false;
      if (this.logicalEntityBlurTimer) {
        clearTimeout(this.logicalEntityBlurTimer);
        this.logicalEntityBlurTimer = null;
      }

    },

    // 处理逻辑实体搜索框失焦
    handleLogicalEntityBlur() {
      // 使用延时清空，给选择操作留出时间
      this.logicalEntityBlurTimer = setTimeout(() => {
        // 如果没有选中的值，清空搜索结果避免下次显示缓存结果
        if (!this.crudForm.l4Code) {
          this.logicalEntityOptions = [];
          this.logicalEntityLoading = false;
        }
        this.logicalEntityBlurTimer = null;
      }, 200); // 200ms延时，足够完成选择操作
    },

    // 处理逻辑实体搜索框获得焦点
    handleLogicalEntityFocus() {
      // 取消可能存在的失焦清空操作
      if (this.logicalEntityBlurTimer) {
        clearTimeout(this.logicalEntityBlurTimer);
        this.logicalEntityBlurTimer = null;
      }

      // 如果没有选中的值，确保搜索结果为空
      if (!this.crudForm.l4Code) {
        this.logicalEntityOptions = [];
        this.logicalEntityLoading = false;
      }
    },

    // 打开新建弹窗
    handleCreate() {
      this.dialogMode = 'create';
      this.currentRow = null;

      // 清空表单
      this.crudForm = {
        modelCategoryId: null,
        l4Code: null,
        permissions: { C: false, R: false, U: false, D: false },
        distributionSource: null
      };

      // 清空显示数据
      this.editDisplay = { systemName: '', logicalEntityPath: '' };

      // 清空搜索状态
      this.logicalEntityOptions = [];
      this.logicalEntityLoading = false;
      if (this.logicalEntityBlurTimer) {
        clearTimeout(this.logicalEntityBlurTimer);
        this.logicalEntityBlurTimer = null;
      }

      // 设置新建模式的验证规则
      this.rules = {
        ...this.baseRules,
        modelCategoryId: [
          { required: true, message: '请选择系统名称', trigger: 'change' }
        ],
        l4Code: [
          { required: true, message: '请选择逻辑实体名称', trigger: 'change' }
        ]
      };

      // 打开弹窗
      this.crudDialogVisible = true;

      // 清理表单验证
      this.$nextTick(() => {
        if (this.$refs.crudForm) {
          this.$refs.crudForm.clearValidate();
        }
      });
    },

    // 打开编辑弹窗
    handleEdit(row) {
      this.dialogMode = 'edit';
      this.currentRow = row;

      // 设置显示数据（只读显示）
      this.editDisplay.systemName = row.modelCategoryName || 'N/A';
      this.buildLogicalEntityPath(row);

      // 设置表单数据
      this.crudForm.modelCategoryId = row.modelCategoryId || null;
      this.crudForm.l4Code = row.l4Code;

      // 设置权限
      this.initPermissionsFromString(row.dataFlowPermissions);

      // 设置数据源值
      const distSourceValue = row.distributionSource === undefined ? null : row.distributionSource;
      this.crudForm.distributionSource = distSourceValue;

      // 打开弹窗
      this.crudDialogVisible = true;

      // 清理表单验证
      this.$nextTick(() => {
        if (this.$refs.crudForm) {
          this.$refs.crudForm.clearValidate();
        }
      });
    },

    // 处理弹窗关闭
    handleDialogClose() {
      // 延迟清理，避免闪烁
      this.$nextTick(() => {
        // 重置所有状态到初始值
        this.crudForm = {
          modelCategoryId: null,
          l4Code: null,
          permissions: { C: false, R: false, U: false, D: false },
          distributionSource: null
        };

        this.editDisplay = { systemName: '', logicalEntityPath: '' };
        this.logicalEntityOptions = [];
        this.logicalEntityLoading = false;
        this.currentRow = null;
        this.dialogMode = 'create';
        this.rules = { ...this.baseRules };

        // 清理延时器
        if (this.logicalEntityBlurTimer) {
          clearTimeout(this.logicalEntityBlurTimer);
          this.logicalEntityBlurTimer = null;
        }

        // 清理表单验证
        if (this.$refs.crudForm) {
          this.$refs.crudForm.resetFields();
          this.$refs.crudForm.clearValidate();
        }
      });
    },

    // 获取权限标签类型
    getPermissionTagType(permission) {
      const typeMap = {
        'C': 'success',
        'R': 'info',
        'U': 'warning',
        'D': 'danger'
      }
      return typeMap[permission] || ''
    },

    // 获取数据源标签类型
    getDistributionSourceTagType(distributionSource) {
      if (distributionSource === true) return 'primary';   // 蓝色"是"
      if (distributionSource === false) return 'info';     // 灰色"否"
      return null; // null的情况不显示标签
    },

    // 获取数据源显示文本
    getDistributionSourceText(distributionSource) {
      if (distributionSource === true) return '是';
      if (distributionSource === false) return '否';
      return ''; // null的情况显示空字符串
    },

    // 查询数据
    fetchData() {
      this.loading.table = true

      // 构建查询参数
      const params = {

      }

      // 调用后端接口
      this.$http.post('/assets/dataflow/page', {
        l3Name: this.searchForm.l3Name || null,
        l4Name: this.searchForm.l4Name || null,
        modelCategoryName: this.searchForm.modelCategoryName || null,
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize
      })
        .then(res => {
          this.tableData = res?.data?.content || []
          this.pagination.total = res?.data?.totalItems || 0
        })
        .catch(err => {
          this.$showFailure(err)
        })
        .finally(() => {
          this.loading.table = false
        })
    },

    // 搜索
    handleSearch() {
      this.pagination.currentPage = 1
      this.fetchData()
    },

    // 重置表单
    resetForm() {
      this.$refs.searchForm.resetFields()
      this.searchForm.l3Name = '';
      this.searchForm.l4Name = '';
      this.searchForm.modelCategoryName = '';
      this.pagination.currentPage = 1
      this.fetchData()
    },

    // 同步数据
    handleSync() {
      this.$confirm('确认执行数据同步？同步将基于最新的L4目录数据更新数据流配置。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading.sync = true;
          this.$http.get('/assets/dataflow/sync')
            .then(res => {
              const syncResult = res.data;
              if (syncResult && syncResult.success) {
                // 显示详细的同步结果
                this.$alert(
                  syncResult.message,
                  '同步完成',
                  {
                    confirmButtonText: '确定',
                    type: 'success',
                    showClose: false
                  }
                );
                // 同步成功后刷新数据
                this.fetchData();
              } else {
                // 同步失败
                this.$message.error(syncResult ? syncResult.message : '同步失败');
              }
            })
            .catch(err => {
              console.error('数据同步失败', err);
              this.$showFailure(err);
            })
            .finally(() => {
              this.loading.sync = false;
            });
        })
        .catch(() => {
          this.$message.info('已取消数据同步');
        });
    },



    // 构建逻辑实体层级路径
    buildLogicalEntityPath(row) {
      // 优先使用后端返回的完整路径
      if (row.l4FullPath && row.l4FullPath.trim() !== '') {
        this.editDisplay.logicalEntityPath = row.l4FullPath;
      } else {
        // 如果后端没有返回完整路径，则显示基本信息
        this.editDisplay.logicalEntityPath = row.l4Name || 'N/A';
      }
    },

    // 从字符串初始化权限
    initPermissionsFromString(permissionStr) {
      this.crudForm.permissions = { C: false, R: false, U: false, D: false };
      if (!permissionStr) return

      const permArray = permissionStr.split('')
      permArray.forEach(perm => {
        if (this.crudForm.permissions.hasOwnProperty(perm)) {
          this.crudForm.permissions[perm] = true
        }
      })
    },

    // 保存 CRUD 权限
    saveCrudPermissions() {
      this.$refs.crudForm.validate(async (valid) => {
        if (valid) {
          const permissionStr = Object.keys(this.crudForm.permissions)
            .filter(key => this.crudForm.permissions[key])
            .join('');

          console.log('Collected Data for Save:', {
            modelCategoryId: this.crudForm.modelCategoryId,
            l4Code: this.crudForm.l4Code,
            dataFlowPermissions: permissionStr,
            distributionSource: this.crudForm.distributionSource
          });

          if (this.dialogMode === 'edit') {
            this.$refs.crudForm.clearValidate(['modelCategoryId', 'l4Code']);
          }
          this.$http.post('/assets/dataflow/create', {
            l4Code: this.crudForm.l4Code,
            dataFlowPermissions: permissionStr,
            modelCategoryId: this.crudForm.modelCategoryId,
            distributionSource: this.crudForm.distributionSource
          })
            .then(() => {
              const action = this.dialogMode === 'create' ? '新建' : '更新';
              this.$message.success(`${action}CRUD成功`);

              // 先关闭弹窗，然后刷新数据
              this.crudDialogVisible = false;
              this.fetchData();
            })
            .catch(err => {
              this.$showFailure(err);
            });
        } else {
          console.log('CRUD Form validation failed!!');
          return false;
        }
      });
    },

    // 表格选择变更
    handleSelectionChange(val) {
      this.selectedRows = val
    },

    // 导入权限
    handleImport() {
      // 创建文件选择器
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = '.xlsx,.xls' // 限制文件类型为Excel

      // 监听文件选择事件
      fileInput.addEventListener('change', event => {
        const file = event.target.files[0]
        if (!file) return

        // 检查文件类型
        const fileType = file.name.split('.').pop().toLowerCase()
        if (!['xlsx', 'xls'].includes(fileType)) {
          this.$message.error('请上传Excel文件(.xlsx或.xls格式)')
          return
        }

        // 检查文件大小（限制为10MB）
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          this.$message.error('文件大小不能超过10MB')
          return
        }

        // 创建FormData对象
        const formData = new FormData()
        formData.append('file', file)

        // 显示上传中提示
        const loading = this.$loading({
          lock: true,
          background: 'rgba(0, 0, 0, 0.7)',
        })

        // 调用上传接口
        this.$http.post('/assets/dataflow/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 设置超时时间为60秒
        })
          .then(res => {
            loading.close()

            // 处理导入结果
            const importResult = res.data
            if (importResult) {
              if (importResult.skipCount === 0) {
                // 全部成功
                this.$message.success(importResult.summary)
              } else {
                // 有跳过的记录，显示警告
                this.$confirm(
                  importResult.detailMessage,
                  '导入结果',
                  {
                    confirmButtonText: '我知道了',
                    showCancelButton: false,
                    type: 'warning',
                    dangerouslyUseHTMLString: false
                  }
                ).then(() => {
                  // 用户确认后不做任何操作
                }).catch(() => {
                  // 用户取消也不做任何操作
                })
              }
            } else {
              // 兼容旧版本返回
              this.$message.success(`导入CRUD成功：${file.name}`)
            }

            // 刷新数据
            this.fetchData()
          })
          .catch(err => {
            loading.close()
            console.error('导入CRUD失败', err)

            // 处理不同类型的错误
            if (err.response && err.response.data) {
              // 如果服务器返回了具体错误信息
              this.$message.error(
                `导入CRUD失败: ${
                  err.response.data.message || '请检查文件格式是否正确'
                }`
              )
            } else if (err.code === 'ECONNABORTED') {
              this.$message.error('导入CRUD超时，请稍后重试或联系管理员')
            } else {
              this.$message.error('导入CRUD失败，请检查文件格式或网络连接')
            }
          })
      })

      // 触发文件选择
      fileInput.click()
    },

    // 导出模板
    handleExport() {
      this.$datablauDownload('/assets/dataflow/download', {}, '数据流管理模板')
    },
    //导出数据
    handleDataflowExport() {
      let { l3Name, l4Name , modelCategoryName } = this.searchForm
      this.$datablauDownload('/assets/dataflow/export',  { l3Name, l4Name , modelCategoryName }, 'CRUD矩阵数据')
    },

    // 分页大小变更
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.fetchData()
    },

    // 当前页变更
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.fetchData()
    },

    // 批量删除
    handleBatchDelete() {
      if (!this.selectedRows || this.selectedRows.length === 0) {
        this.$message.warning('请先选择要移除绑定关系的数据');
        return;
      }

      this.$confirm(`确认移除选中的 ${this.selectedRows.length} 条绑定关系?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // Prepare payload as List<Object { modelCategoryId, l4Code }>
          const deletePayload = this.selectedRows.map(row => ({
            // --- IMPORTANT: Assumes row.modelCategoryId exists! ---
            // --- Backend /dataflow/page endpoint MUST return modelCategoryId ---
            modelCategoryId: row.modelCategoryId,
            l4Code: row.l4Code
          }));

          // Check if any essential data is missing (basic check)
          if (deletePayload.some(item => item.modelCategoryId === undefined || item.l4Code === undefined)) {
            this.$message.error('选中的数据缺少必要的ID信息，无法删除');
            console.error('Delete payload missing data:', deletePayload);
            return;
          }

          const loading = this.$loading({ lock: true, text: '正在删除...' });
          this.$http.post('/assets/dataflow/delete', deletePayload)
            .then(() => {
              loading.close();
              this.$message.success('批量删除成功');
              this.fetchData(); // Refresh data after delete
            })
            .catch(err => {
              loading.close();
              this.$showFailure(err);
            });
        })
        .catch(() => {
          // User cancelled
          this.$message.info('已取消批量删除操作');
        });
    },
    handleCommand(command) {
      let fns = {
        'downloadCRUDTemplate': this.handleExport,
        'importCRUD': this.handleImport,
        'exportCRUD': this.handleDataflowExport
      }
      fns[command] && fns[command]()
    }
  },
  watch: {
    // Watch for changes in the U permission
    'crudForm.permissions.U'(newValue) {
      if (newValue) {
        // 当U权限被勾选时，如果distributionSource为null，设置默认值为false
        if (this.crudForm.distributionSource === null) {
          this.crudForm.distributionSource = false;
        }
      } else {
        // If U is unchecked, Distribution Source must also be null (which unchecks both Yes/No)
        if (this.crudForm.distributionSource !== null) {
          this.crudForm.distributionSource = null;
        }
      }
    },
    // Watch for changes in the Distribution Source - Now watch the main value
    'crudForm.distributionSource'(newValue) {
      // If Distribution Source becomes true (Yes is checked), U must also be checked
      if (newValue === true && !this.crudForm.permissions.U) {
        this.crudForm.permissions.U = true;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.data-flow-management {
  background: #fff;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 15px;

  .data-flow-search {
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 15px;
    flex-shrink: 0;

    .search-form-inline {
      flex-grow: 1;
      display: flex;
      align-items: center;
    }

    /deep/ .el-form-item {
      margin-bottom: 0;
      margin-right: 15px;
    }
  }

  .data-flow-table {
    position: absolute;
    top: 80px;
    bottom: 52px;
    left: 15px;
    right: 15px;
    width: auto;
    overflow-y: auto;
  }

  .data-flow-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    background-color: #fff;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
    flex-shrink: 0;

    .left-btn {
      display: flex;
      align-items: center;

      .footer-row-info {
        margin-right: 10px;
      }
    }

    .pagination-component {
      margin-left: auto;
    }
  }

  .right-button-group {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    white-space: nowrap;

    .datablau-button {
      padding: 7px 10px;
    }
  }

  .permission-tag {
    margin-right: 5px;
  }

  .permission-edit-content {
    padding: 0 20px;
  }

  .dialog-note {
    margin-left: 20px;
    color: #909399;
    font-size: 12px;
  }

  .permission-tip {
    background-color: #FDF6EC;
    padding: 10px;
    border-radius: 4px;
    font-size: 14px;
  }

  .permission-desc {
    margin-top: 8px;
    color: #666;
    font-size: 13px;
    line-height: 1.5;
  }

  .permission-layout {
    display: flex;
    align-items: flex-start;

    .crud-checkboxes {
      display: flex;
      flex-direction: column;
      margin-right: 40px;

      .el-checkbox {
        margin-bottom: 10px !important;
        margin-right: 0 !important;
        &:last-child {
          margin-bottom: 0 !important;
        }
      }
    }

    .distribution-checkbox-container {
      margin-left: 40px;
      .el-checkbox {
        margin-bottom: 0 !important;
      }
    }
  }

  .permission-checkbox-group {
    display: flex;
    flex-wrap: wrap;

    .el-checkbox {
      margin-right: 25px;
      margin-bottom: 15px;
      &:last-child {
        margin-right: 0;
      }
    }
  }

  // Add spacing for form items within the dialog
  /deep/ .crud-form .el-form-item {
    margin-bottom: 18px; // Increase bottom margin for spacing
  }

  // Ensure permission item itself doesn't add extra bottom margin if others have it
  /deep/ .permission-form-item {
    margin-bottom: 18px;
  }

  .distribution-note-layout {
    display: flex;
    align-items: center;
  }

  // Style disabled cascader inputs (targeting the inner el-input component) in the dialog
  /deep/ .crud-form .el-cascader .el-input.is-disabled .el-input__inner {
    background-color: #f5f7fa; // Standard Element UI disabled background color
    cursor: not-allowed;
  }
}
</style>
