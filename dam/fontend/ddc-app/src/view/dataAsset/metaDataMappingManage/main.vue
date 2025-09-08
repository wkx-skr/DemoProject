<template>
  <div class="model-mapping-manage">
    <!-- 搜索条件区域 -->
    <div class="mapping-search" style="width: 100%">
      <el-form
        :model="searchForm"
        ref="searchForm"
        :inline="true"
        size="mini"
      >
        <div style="display: flex">
          <div style="line-height: 90px">
            <asset-catalog-dialog
              @confirm="onAssetConfirm"
              storageKey="selectedAssets1"
            />
            <!-- <el-form-item
              label="业务对象"
              label-width="100px"
              style="margin: 0"
            >
              <datablau-select
                v-model="searchForm.businessObjectId"
                placeholder="请选择"
                style="width: 8vw"
                clearable
                @change="handleBusinessObjectChange"
                :disabled="isRightSideSelected"
                @clear="handleBusinessObjectClear"
              >
                <el-option
                  v-for="item in businessObjectOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              label="逻辑数据实体"
              label-width="100px"
              style="margin: 0"
            >
              <datablau-select
                v-model="searchForm.logicDataEntityId"
                placeholder="请选择"
                style="width: 8vw"
                clearable
                @clear="handleLogicDataEntityClear"
                :disabled="!searchForm.businessObjectId || isRightSideSelected"
              >
                <el-option
                  v-for="item in logicalDataEntityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item> -->
          </div>
          <div style="display: flex; align-items: center; margin-left: 30px">
            <el-form-item style="margin-bottom: 0" label="应用系统" label-width="60px">
              <datablau-select
                style="width: 8vw"
                v-model="searchForm.modelCategoryId"
                placeholder="请选择"
                clearable
                @change="handleSystemChange"
                @clear="handleSystemClear"
                :disabled="isLeftSideSelected"
                :loading="loading.appSystems"
              >
                <el-option
                  v-for="c in appSystemOptions"
                  :key="c.value"
                  :label="c.label"
                  :value="c.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 0" label="数据源" label-width="60px">
              <datablau-select
                style="width: 8vw"
                v-model="searchForm.modelId"
                placeholder="请选择"
                clearable
                :disabled="!searchForm.modelCategoryId || isLeftSideSelected"
                @change="handleModelChange"
                @clear="handleModelClear"
                :loading="loading.models"
              >
                <el-option
                  v-for="item in modelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item style="margin-bottom: 0" label="数据库" label-width="60px">
              <datablau-select
                style="width: 8vw"
                v-model="searchForm.databaseId"
                placeholder="请选择"
                clearable
                :disabled="!searchForm.modelId || isLeftSideSelected"
                :loading="loading.databases"
                @change="handleDatabaseChange"
                @clear="handleDatabaseClear"
                multiple
              >
                <el-option
                  v-for="item in schemaEntityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              label="操作人"
              label-width="60px"
              style="margin-bottom: 0"
            >
              <el-input v-model="searchForm.operator" placeholder="请输入操作人"/>
            </el-form-item>
            <!-- <el-form-item label="物理表" label-width="60px">
              <datablau-select
                style="width: 8vw"
                v-model="searchForm.tableId"
                placeholder="请选择"
                clearable
                :disabled="!searchForm.databaseId || isLeftSideSelected"
                :loading="loading.tables"
                filterable
                remote
                :remote-method="remoteSearchTables"
                @clear="tableOptions = []"
              >
                <el-option
                  v-for="item in tableOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item> -->
            <el-checkbox v-model="onlyUnmapped">只查看未关联属性</el-checkbox>
          </div>
        </div>
      </el-form>
      <div class="right-button">
        <div style="margin-right: 20px">
          <datablau-button type="primary" @click="handleAutoMatch">执行自动匹配</datablau-button>
          <datablau-button type="normal" size="mini" @click="handleSearch">
            查询
          </datablau-button>
          <datablau-button type="secondary" size="mini" @click="resetForm">
            重置
          </datablau-button>
        </div>
        <div>
          <datablau-button type="primary" size="mini" @click="handleImport">
            导入映射
          </datablau-button>
          <datablau-button type="primary" size="mini" @click="handleExport">
            下载映射模板
          </datablau-button>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="mapping-table">
      <datablau-table
        :data="tableData"
        @selection-change="handleSelectionChange"
        style="width: 100%; height: 100%"
        height="100%"
        v-loading="loading.table"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="数据资产目录" align="center" border>
          <el-table-column
            prop="businessObjectName"
            label="业务对象中文名"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="logicDataEntityEnName"
            label="逻辑数据实体英文名"
            width="150"
          ></el-table-column>
          <el-table-column
            prop="logicDataEntityName"
            label="逻辑实体中文名"
            width="150"
          ></el-table-column>
          <el-table-column
            prop="columnCatalogName"
            label="属性英文名"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="columnCatalogAlias"
            label="属性中文名"
            width="120"
          ></el-table-column>
        </el-table-column>
        <el-table-column label="模型元数据" align="center">
          <el-table-column
            prop="modelCategoryName"
            label="应用系统"
          ></el-table-column>
          <el-table-column
            prop="modelName"
            label="数据源"
          ></el-table-column>
          <el-table-column
            prop="databaseName"
            label="数据库"
          ></el-table-column>
          <el-table-column
            prop="tableName"
            label="表英文名"
          ></el-table-column>
          <el-table-column
            prop="tableAlias"
            label="表中文名"
          ></el-table-column>
          <el-table-column
            prop="columnAlias"
            label="字段中文名"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="columnName"
            label="字段英文名"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="mappingType"
            label="映射类型"
          ></el-table-column>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template slot-scope="scope">
            <datablau-button
              type="text"
              size="small"
              @click="handleViewMappingLog(scope.row)"
              :disabled="!scope.row.mappingId"
            >
              查看记录
            </datablau-button>
            <datablau-button
              type="text"
              size="small"
              :disabled="
                !scope.row.mappingId || scope.row.mappingType === '取消映射'
              "
              @click="handleCancelMapping(scope.row)"
            >
              取消映射
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>

    <!-- 底部操作按钮和分页 -->
    <div class="mapping-footer">
      <div class="left-btn" v-show="selectedRows && selectedRows.length > 0">
        <span class="footer-row-info">
          已选择 {{ selectedRows.length }} 条数据
        </span>
        <datablau-button
          type="primary"
          size="mini"
          @click="handleBatchCancelMapping"
          :disabled="
            selectedRows.some(
              row => !row.mappingId || row.mappingType === '取消映射'
            )
          "
        >
          批量取消映射
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

    <!-- 映射记录弹窗 -->
    <datablau-dialog
      title="映射记录"
      :visible.sync="mappingLogVisible"
      width="600px"
      append-to-body
    >
      <datablau-table :data="mappingLogData" style="width: 100%">
        <el-table-column
          prop="mappingType"
          label="映射类型"
          width="120"
        ></el-table-column>
        <el-table-column prop="operatorTime" label="操作时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.operatorTime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="operator"
          label="操作人"
          width="120"
        ></el-table-column>
      </datablau-table>
    </datablau-dialog>
  </div>
</template>

<script>
import AssetCatalogDialog from '@/components/AssetCatalogDialog.vue'
export default {
  name: 'ModelMappingManage',
  components: { AssetCatalogDialog },
  data() {
    return {
      onlyUnmapped: false,
      searchForm: {
        businessObjectId: '',
        logicDataEntityId: '',
        modelCategoryId: '',
        modelId: '',
        databaseId: '',
        tableId: '',
        operator: '',
      },
      selectedAssets: [],
      businessObjectOptions: [],
      logicalDataEntityOptions: [],
      appSystemOptions: [],
      modelOptions: [],
      schemaEntityOptions: [],
      tableData: [],
      selectedRows: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
      mappingLogVisible: false,
      mappingLogData: [],
      // 加载状态
      loading: {
        table: false,
        businessObjects: false,
        logicalDataEntities: false,
        appSystems: false,
        models: false,
        databases: false,
        tables: false,
      },
      // 模型树数据
      modelTreeData: null,
      tableOptions: [], // 物理表选项
    }
  },
  computed: {
    // 判断左侧是否已选择
    isLeftSideSelected() {
      return !!(
        this.searchForm.businessObjectId || this.searchForm.logicDataEntityId
      )
    },
    // 判断右侧是否已选择
    isRightSideSelected() {
      return !!(
        this.searchForm.modelCategoryId ||
        this.searchForm.modelId ||
        this.searchForm.databaseId ||
        this.searchForm.tableId
      )
    },
  },
  created() {
    // 初始化模型树数据
    this.initModelTree()
    this.fetchBusinessObjects()
    this.fetchData()
  },
  methods: {
    // 处理自动匹配点击事件
    handleAutoMatch() {
      if (!this.selectedAssets.length) {
        this.$message.warning('请先选择数据资产目录');
        return;
      }
      if (!this.searchForm.modelCategoryId) {
        this.$message.warning('请选择应用系统');
        return;
      }
      if (!this.searchForm.ddmModelId) {
        this.$message.warning('请选择数据模型');
        return;
      } if (!this.searchForm.databaseId) {
        this.$message.warning('请选择数据库');
        return;
      }

      // 构建请求参数
      const params = {
        businessObjects: this.selectedAssets.map(item => ({
          id: item.id,
          structureId: item.structureId,
          catalogPath: item.catalogPath,
          name: item.name,
        })),
        modelCategoryId: parseInt(this.searchForm.modelCategoryId),
        modelId: parseInt(this.searchForm.ddmModelId),
        databaseId: this.searchForm.databaseId,
      }

      this.$http
        .post('/assets/meta/mapping/createAutoMapping', params)
        .then(res => {
          this.$message.success('自动匹配任务已创建成功，请稍后查看结果')
        })
        .catch(err => {
          this.$message.error('自动匹配任务创建失败')
        })
    },
    // 处理资产选择确认
    onAssetConfirm(assets) {
      this.selectedAssets = assets;
    },
    // 处理数据库变化
    handleDatabaseChange(value) {
      this.searchForm.tableId = ''
      this.tableOptions = []

      if (value) {
        this.fetchTables()
      }
    },
    // 清除数据库选择
    handleDatabaseClear() {
      this.searchForm.tableId = ''
      this.tableOptions = []
    },
    // 获取物理表列表
    fetchTables(keyword = '') {
      if (!this.searchForm.modelId || !this.searchForm.databaseId) {
        return
      }

      this.loading.tables = true

      // 获取选中的数据库名称作为schema参数
      const selectedDatabase = this.schemaEntityOptions.find(
        item => item.value === this.searchForm.databaseId
      )

      const schema = selectedDatabase ? selectedDatabase.label : ''

      // 构建请求参数
      const params = {
        currentPage: 1,
        keyword: keyword || '',
        modelIds: [parseInt(this.searchForm.modelId)],
        pageSize: 100,
        tagIds: null,
        typeIds: [80000004, 80500008],
        schema: schema,
      }

      // 调用接口获取物理表列表
      this.$http
        .post('/metadata/entities/searchMetadata', params)
        .then(res => {
          this.tableOptions = (res.data?.content || []).map(item => ({
            value: item.objectId.toString(),
            label: item.name || item.code,
            data: item,
          }))
        })
        .catch(err => {
          this.$showFailure(err)
        })
        .finally(() => {
          this.loading.tables = false
        })
    },
    // 远程搜索物理表
    remoteSearchTables(query) {
      if (query !== '') {
        this.fetchTables(query)
      } else {
        this.fetchTables()
      }
    },
    // 初始化获取应用系统列表
    async initModelTree() {
      try {
        this.loading.appSystems = true
        const res = await this.$http.get('/metadata/models/modeltree')
        this.modelTreeData = res.data
        // 提取所有type为MODEL_CATEGORY的节点作为应用系统选项
        this.appSystemOptions = this.findModelCategories(
          this.modelTreeData
        ).map(item => ({
          value: item.id,
          label: item.name,
          subNodes: item.subNodes || [],
        }))
        this.loading.appSystems = false
      } catch (error) {
        console.error('获取模型树失败:', error)
        this.loading.appSystems = false
      }
    },

    // 查找所有MODEL_CATEGORY节点
    findModelCategories(node) {
      let categories = []
      if (node.subNodes) {
        node.subNodes.forEach(subNode => {
          if (subNode.type === 'MODEL_CATEGORY') {
            categories.push({
              id: subNode.id,
              name: subNode.name,
              subNodes: subNode.subNodes || [], // 保存子节点引用
            })
          }
          // 递归查找子节点中的MODEL_CATEGORY
          categories = categories.concat(this.findModelCategories(subNode))
        })
      }
      return categories
    },

    // 业务对象清除事件处理
    handleBusinessObjectClear() {
      this.searchForm.logicDataEntityId = ''
      this.logicalDataEntityOptions = []
    },

    // 逻辑数据实体清除事件处理
    handleLogicDataEntityClear() {
      // 无需额外操作，仅清除选中值
    },

    // 获取业务对象选项
    fetchBusinessObjects() {
      this.loading.businessObjects = true
      // 调用接口获取业务对象选项
      this.$http
        .post('/assets/ddm/mapping/queryLogicDataEntity', {})
        .then(res => {
          this.businessObjectOptions =
            res.data.map(item => ({
              value: item.id.toString(),
              label: item.name,
              data: item,
            })) || []
        })
        .catch(err => {
          this.$showFailure(err)
        })
        .finally(() => {
          this.loading.businessObjects = false
        })
    },

    // 业务对象变更时获取关联的逻辑数据实体
    handleBusinessObjectChange(value) {
      // 清空逻辑数据实体选择
      this.searchForm.logicDataEntityId = ''
      this.logicalDataEntityOptions = []

      // 清空右侧所有选择
      this.clearRightSideSelections()

      // 获取对应的逻辑数据实体列表
      if (value) {
        this.fetchLogicalDataEntities(value)
      }
    },

    // 获取逻辑数据实体列表
    fetchLogicalDataEntities(businessObjectId) {
      this.loading.logicalDataEntities = true
      // 调用接口获取逻辑数据实体列表
      this.$http
        .post('/assets/ddm/mapping/queryLogicDataEntity', {
          businessObjectId: parseInt(businessObjectId),
        })
        .then(res => {
          this.logicalDataEntityOptions =
            res.data.map(item => ({
              value: item.id.toString(),
              label: item.name,
              data: item,
            })) || []
        })
        .catch(err => {
          this.$showFailure(err)
        })
        .finally(() => {
          this.loading.logicalDataEntities = false
        })
    },

    // 应用系统变更
    handleSystemChange(value) {
      this.searchForm.modelId = ''
      this.searchForm.databaseId = ''
      this.searchForm.tableId = ''
      this.modelOptions = []
      this.schemaEntityOptions = []
      this.tableOptions = []

      if (value) {
        this.loading.models = true
        // 找到选中的系统节点
        const selectedSystem = this.appSystemOptions.find(
          sys => sys.value === value
        )
        if (selectedSystem && selectedSystem.subNodes) {
          // 直接从子节点中过滤MODEL类型
          this.modelOptions = selectedSystem.subNodes
            .filter(node => node.type === 'MODEL')
            .map(node => ({
              value: node.id,
              label: node.name,
              subNodes: node.subNodes || [], // 保存子节点引用
            }))
        }
        this.loading.models = false
      }
    },

    // 清空左侧所有选择
    clearLeftSideSelections() {
      this.searchForm.businessObjectId = ''
      this.searchForm.logicDataEntityId = ''
      this.logicalDataEntityOptions = []
    },

    // 清空右侧所有选择
    clearRightSideSelections() {
      this.searchForm.modelCategoryId = ''
      this.searchForm.modelId = ''
      this.searchForm.databaseId = ''
      this.searchForm.tableId = ''
      this.modelOptions = []
      this.schemaEntityOptions = []
      this.tableOptions = []
    },

    // 应用系统清除
    handleSystemClear() {
      this.searchForm.modelId = ''
      this.searchForm.databaseId = ''
      this.searchForm.tableId = ''
      this.modelOptions = []
      this.schemaEntityOptions = []
      this.tableOptions = []
    },

    // 处理数据源变化
    handleModelChange(value) {
      this.searchForm.databaseId = ''
      this.schemaEntityOptions = []

      if (value) {
        this.loading.databases = true
        // 找到选中的数据源节点
        const selectedModel = this.modelOptions.find(
          model => model.value === value
        )
        if (selectedModel && selectedModel.subNodes) {
          // 直接从子节点中过滤MODEL_SCHEMA类型
          this.schemaEntityOptions = selectedModel.subNodes
            .filter(node => node.type === 'MODEL_SCHEMA')
            .map(node => ({
              value: node.id,
              label: node.name,
            }))
        }
        this.loading.databases = false
      }
    },

    // 清除数据源选择
    handleModelClear() {
      this.searchForm.databaseId = ''
      this.schemaEntityOptions = []
    },

    // 获取表格数据
    fetchData() {
      // 构建查询参数
      const params = {
        businessObjectId: this.searchForm.businessObjectId
          ? parseInt(this.searchForm.businessObjectId)
          : null,
        logicDataEntityId: this.searchForm.logicDataEntityId
          ? parseInt(this.searchForm.logicDataEntityId)
          : null,
        modelCategoryId: this.searchForm.modelCategoryId
          ? parseInt(this.searchForm.modelCategoryId)
          : null,
        modelId: this.searchForm.modelId
          ? parseInt(this.searchForm.modelId)
          : null,
        databaseId: this.searchForm.databaseId
          ? parseInt(this.searchForm.databaseId)
          : null,
        tableId: this.searchForm.tableId
          ? parseInt(this.searchForm.tableId)
          : null,
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        operator: this.searchForm.operator || null,
      }

      this.loading.table = true
      // 调用接口获取数据
      this.$http
        .post('/assets/meta/mapping/queryMappingPage', params)
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

    // 处理搜索
    handleSearch() {
      this.pagination.currentPage = 1
      this.fetchData()
    },

    // 重置表单
    resetForm() {
      this.$refs.searchForm.resetFields()
      // 清空所有选择的数据
      this.searchForm = {
        businessObjectId: '',
        logicDataEntityId: '',
        modelCategoryId: '',
        modelId: '',
        databaseId: '',
        tableId: '',
      }
      this.logicalDataEntityOptions = []
      this.modelOptions = []
      this.schemaEntityOptions = []
      this.tableOptions = []

       // 清空本地缓存
      localStorage.removeItem('selectedAssets1');
      this.selectedAssets = [];

      // 清空选中资产
      this.selectedAssets = [];

      // 重置分页
      this.pagination.currentPage = 1

      this.fetchData()
    },
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
        formData.append('multipartFile', file)

        // 显示上传中提示
        const loading = this.$loading({
          lock: true,
          text: '正在上传映射文件...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })

        // 调用上传接口
        this.$http
          .post('/assets/meta/mapping/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 60000, // 设置超时时间为60秒
          })
          .then(res => {
            loading.close()
            this.$message.success(`映射导入成功：${file.name}`)
            // 刷新数据
            this.fetchData()
          })
          .catch(err => {
            loading.close()
            console.error('映射导入失败', err)

            // 处理不同类型的错误
            if (err.response && err.response.data) {
              // 如果服务器返回了具体错误信息
              this.$message.error(
                `映射导入失败: ${
                  err.response.data.message || '请检查文件格式是否正确'
                }`
              )
            } else if (err.code === 'ECONNABORTED') {
              this.$message.error('映射导入超时，请稍后重试或联系管理员')
            } else {
              this.$message.error('映射导入失败，请检查文件格式或网络连接')
            }
          })
      })

      // 触发文件选择
      fileInput.click()
    },
    handleExport() {
      this.$downloadFilePost(
        '/assets/meta/mapping/downloadMetaDataMappingTemplate'
      )
    },
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    handleViewMappingLog(row) {
      // 查看映射记录
      if (!row.mappingId) {
        this.$message.warning('无法获取映射记录')
        return
      }

      // 调用接口获取映射记录
      this.$http
        .get('/assets/meta/mapping/queryMappingLog', {
          params: { mappingId: row.mappingId },
        })
        .then(res => {
          this.mappingLogData = res?.data || []
          this.mappingLogVisible = true
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getDate()).padStart(2, '0')} ${String(
        date.getHours()
      ).padStart(2, '0')}:${String(date.getMinutes()).padStart(
        2,
        '0'
      )}:${String(date.getSeconds()).padStart(2, '0')}`
    },
    handleCancelMapping(row) {
      // 取消单个映射
      if (!row.mappingId) {
        this.$message.warning('无法取消映射')
        return
      }

      this.$confirm('确认取消该映射关系?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // 调用接口取消映射
          this.$http
            .post('/assets/meta/mapping/cancelMapping', [row.mappingId])
            .then(res => {
              this.$message.success('已取消映射')
              this.fetchData()
            })
            .catch(err => {
              this.$showFailure(err)
            })
        })
        .catch(() => {
          this.$message.info('已取消操作')
        })
    },
    handleBatchCancelMapping() {
      // 批量取消映射
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先选择要取消映射的条目')
        return
      }

      this.$confirm(
        `确认取消选中的${this.selectedRows.length}条映射关系?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          // 获取所有选中行的mappingId
          const mappingIds = this.selectedRows
            .map(row => row.mappingId)
            .filter(id => id)

          if (mappingIds.length === 0) {
            this.$message.warning('所选条目中没有有效的映射ID')
            return
          }

          // 调用接口批量取消映射
          this.$http
            .post('/assets/meta/mapping/cancelMapping', mappingIds)
            .then(res => {
              this.$message.success(`已取消${mappingIds.length}条映射`)
              this.fetchData()
            })
            .catch(err => {
              this.$showFailure(err)
            })
        })
        .catch(() => {
          this.$message.info('已取消操作')
        })
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.fetchData()
    },
  },
}
</script>

<style lang="scss" scoped>
.model-mapping-manage {
  background: #fff;
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;

  .mapping-search {
    position: absolute;
    top: 0;
    background-color: #fff;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .mapping-table {
    position: absolute;
    top: 110px;
    left: 0;
    right: 0;
    bottom: 50px;
    padding: 0 20px;

    .table-header {
      display: flex;
      background-color: #fff;
      padding: 10px 0;
      font-weight: bold;
      top: 0;
      z-index: 5;

      .left-title {
        flex: 1;
        padding-left: 20px;
      }

      .right-title {
        flex: 1;
        padding-left: 20px;
      }
    }

    .datablau-table {
      width: 100%;
    }
  }

  .mapping-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);

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

  .right-button {
    display: flex;
    align-items: center;
  }

  /deep/ .list-title {
    display: none;
  }

  .circle {
    position: relative;
    bottom: 1px;
    display: inline-block;
    margin-right: 7px;
    background-color: #5cb793;
    border-radius: 3.5px;
    width: 7px;
    height: 7px;
  }
}
</style>
