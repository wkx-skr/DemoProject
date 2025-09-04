<template>
  <div class="model-auto-mapping-container">
    <!-- 左侧数据资产目录 -->
    <div class="asset-catalog">
      <div class="section-title">数据资产目录</div>
      <div class="auto-mapping-filter-row">
        <div class="filter-item">
          <span>业务域</span>
          <datablau-select
            v-model="businessDomain"
            placeholder="请选择"
            style="width: 150px"
            @change="handleBusinessDomainChange"
          >
            <el-option
              v-for="item in businessDomainOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </div>
        <div class="filter-item">
          <span>主题域</span>
          <datablau-select
            v-model="themeDomain"
            placeholder="请选择"
            style="width: 150px"
            @change="handleThemeDomainChange"
            :disabled="!businessDomain"
          >
            <el-option
              v-for="item in themeDomainOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </div>
        <div class="filter-item">
          <span>业务对象</span>
          <datablau-select
            v-model="checkedBusinessObjects"
            placeholder="请选择"
            style="width: 150px"
            multiple
            collapse-tags
            @change="handleCheckChange"
            :disabled="!themeDomain"
          >
            <el-option
              v-for="item in businessObjectsList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </div>
      </div>

      <div class="selected-items">
        <div class="selected-title">已选业务对象：</div>
        <div class="tag-list">
          <datablau-tag
            v-for="(item, index) in selectedBusinessObjects"
            :key="index"
            closable
            type="info"
            color="#13c2c2"
            @close="removeBusinessObject(index)"
          >
            {{ item.name }}
          </datablau-tag>
        </div>
      </div>
    </div>

    <!-- 右侧模型元数据 -->
    <div class="model-metadata">
      <div class="section-title">模型元数据</div>
      <div class="auto-mapping-filter-row">
        <div class="filter-item">
          <span>应用系统</span>
          <datablau-select
            v-model="appSystem"
            placeholder="请选择"
            style="width: 150px"
            clearable
            @change="handleAppSystemChange"
            @clear="handleAppSystemClear"
          >
            <el-option
              v-for="item in appSystemOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </div>
        <div class="filter-item">
          <span>数据源</span>
          <datablau-select
            v-model="modelType"
            placeholder="请选择"
            style="width: 150px"
            clearable
            :disabled="!appSystem"
            @change="handleModelChange"
            @clear="handleModelClear"
          >
            <el-option
              v-for="item in modelTypeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </div>
        <div class="filter-item">
          <span>数据库</span>
          <datablau-select
            v-model="schemaId"
            placeholder="请选择"
            style="width: 150px"
            clearable
            :disabled="!modelType"
            @change="handleSchemaChange"
            @clear="handleSchemaClear"
          >
            <el-option
              v-for="item in schemaOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </div>
      </div>
    </div>
    <!-- 自动匹配按钮区域 -->
    <div class="auto-match-btn">
      <datablau-button
        type="primary"
        @click="handleAutoMatch"
        size="small"
        :disabled="!canAutoMatch"
        :loading="isMatching"
      >
        自动匹配
      </datablau-button>
      <div class="match-tip" v-if="matchTip">{{ matchTip }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModelAutoMapping',
  data() {
    return {
      // 删除重复定义的属性
      businessDomain: undefined,
      themeDomain: undefined,
      businessPlan: undefined,
      appSystem: undefined,
      modelType: undefined,
      schemaId: undefined,
      businessDomainOptions: [],
      themeDomainOptions: [],
      businessPlanOptions: [],
      businessObjectsList: [],
      checkedBusinessObjects: [],
      selectedBusinessObjects: [],
      isMatching: false,
      appSystemOptions: [],
      modelTypeOptions: [],
      schemaOptions: [],
      modelTreeData: null,
    }
  },
  computed: {
    // 控制自动匹配按钮是否可点击
    canAutoMatch() {
      return (
        this.selectedBusinessObjects.length > 0 &&
        this.appSystem &&
        this.modelType &&
        this.schemaId
      )
    },
    // 添加 matchTip 计算属性
    matchTip() {
      if (this.isMatching) {
        return '正在创建自动匹配任务...'
      }
      if (!this.selectedBusinessObjects.length) {
        return '请选择需要匹配的业务对象'
      }
      if (!this.appSystem) {
        return '请选择应用系统'
      }
      if (!this.modelType) {
        return '请选择数据源'
      }
      if (!this.schemaId) {
        return '请选择数据库'
      }
      return `已选择 ${this.selectedBusinessObjects.length} 个业务对象，可以开始自动匹配`
    },
  },
  created() {
    // 删除不需要的fetchOptions调用，只保留initModelTree
    this.initModelTree()
    // 初始化业务对象列表
    this.fetchOptions()
  },
  methods: {
    // 获取下拉选项数据
    fetchOptions() {
      // 获取业务域选项 - 不传参数
      this.fetchBusinessDomains()
    },
    // 获取业务域选项
    fetchBusinessDomains() {
      // 调用接口获取业务域选项
      this.queryBusinessObject({})
        .then(res => {
          this.businessDomainOptions =
            res.data.map(item => ({
              value: item.id.toString(),
              label: item.name,
            })) || []
        })
        // .catch(err => {
        //   console.error('获取业务域选项失败', err)
        //   this.$message.error('获取业务域选项失败')
        // })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    handleBusinessDomainChange() {
      // 清空主题域和业务对象
      this.themeDomain = undefined
      this.themeDomainOptions = []
      this.businessObjectsList = []
      this.checkedBusinessObjects = []
      this.selectedBusinessObjects = []

      // 获取主题域选项
      if (this.businessDomain) {
        this.fetchThemeDomains()
      }
    },

    // 获取主题域选项
    fetchThemeDomains() {
      const params = {
        businessDomainId: parseInt(this.businessDomain),
      }

      this.queryBusinessObject(params)
        .then(res => {
          this.themeDomainOptions =
            res.data.map(item => ({
              value: item.id.toString(),
              label: item.name,
            })) || []
        })
        // .catch(err => {
        //   console.error('获取主题域选项失败', err)
        //   this.$message.error('获取主题域选项失败')
        // })
        .catch(err => {
          this.$showFailure(err)
        })
    },

    // 主题域变更
    handleThemeDomainChange() {
      // 清空业务对象
      this.businessObjectsList = []
      this.checkedBusinessObjects = []
      this.selectedBusinessObjects = []

      this.queryBusinessObjects()
    },
    // 添加数据库变更处理方法
    handleSchemaChange(value) {
      // 数据库变更时不需要特殊处理，因为使用了计算属性
    },

    handleSchemaClear() {
      // 清除时不需要特殊处理，因为使用了计算属性
    },
    // 初始化获取应用系统列表
    async initModelTree() {
      try {
        const res = await this.$http.get('/metadata/models/modeltree')
        this.modelTreeData = res.data
        // 提取所有type为MODEL_CATEGORY的节点作为应用系统选项
        this.appSystemOptions = this.findModelCategories(this.modelTreeData)
      } catch (error) {
        console.error('获取模型树失败:', error)
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

    // 根据MODEL ID提取对应的MODEL_SCHEMA节点
    extractSchemas(node, modelId) {
      let result = []
      if (node.id === modelId && node.subNodes) {
        result = node.subNodes
          .filter(item => item.type === 'MODEL_SCHEMA')
          .map(item => ({
            id: item.id,
            name: item.name,
          }))
      } else if (node.subNodes && Array.isArray(node.subNodes)) {
        node.subNodes.forEach(subNode => {
          result = result.concat(this.extractSchemas(subNode, modelId))
        })
      }
      return result
    },
    queryBusinessObject(params) {
      return this.$http.post('/assets/ddm/mapping/queryBusinessObject', params)
    },
    // 应用系统清除
    handleAppSystemClear() {
      this.modelType = undefined
      this.modelTypeOptions = []
    },

    // 应用系统变更
    handleAppSystemChange(value) {
      this.modelType = undefined
      this.schemaId = undefined
      this.modelTypeOptions = []
      this.schemaOptions = []

      if (value) {
        // 找到选中的系统节点
        const selectedSystem = this.appSystemOptions.find(
          sys => sys.id === value
        )
        if (selectedSystem && selectedSystem.subNodes) {
          // 直接从子节点中过滤MODEL类型
          this.modelTypeOptions = selectedSystem.subNodes
            .filter(node => node.type === 'MODEL')
            .map(node => ({
              id: node.id,
              name: node.name,
              subNodes: node.subNodes || [], // 保存子节点引用
            }))
        }
      }
    },

    // 处理数据源变化
    handleModelChange(value) {
      this.schemaId = undefined
      this.schemaOptions = []

      if (value) {
        // 找到选中的数据源节点
        const selectedModel = this.modelTypeOptions.find(
          model => model.id === value
        )
        if (selectedModel && selectedModel.subNodes) {
          // 直接从子节点中过滤MODEL_SCHEMA类型
          this.schemaOptions = selectedModel.subNodes
            .filter(node => node.type === 'MODEL_SCHEMA')
            .map(node => ({
              id: node.id,
              name: node.name,
            }))
        }
      }
    },

    // 模型清除
    handleModelClear() {},
    // 查询业务对象
    queryBusinessObjects() {
      if (!this.businessDomain || !this.themeDomain) {
        return
      }

      // 调用接口获取业务对象列表
      const params = {
        businessDomainId: parseInt(this.businessDomain),
        subjectDomainId: parseInt(this.themeDomain),
      }

      // 调用接口
      this.queryBusinessObject(params)
        .then(res => {
          this.businessObjectsList = res.data || []
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },

    // 处理复选框变化
    handleCheckChange(value) {
      // 更新已选业务对象
      this.selectedBusinessObjects = this.businessObjectsList.filter(item =>
        value.includes(item.id)
      )
    },

    // 移除已选业务对象
    removeBusinessObject(index) {
      const removedId = this.selectedBusinessObjects[index].id
      this.selectedBusinessObjects.splice(index, 1)

      // 更新下拉选择框选中状态
      const idx = this.checkedBusinessObjects.indexOf(removedId)
      if (idx !== -1) {
        this.checkedBusinessObjects.splice(idx, 1)
      }

      // 更新提示文案
    },

    handleAutoMatch() {
      if (!this.canAutoMatch) {
        if (!this.selectedBusinessObjects.length) {
          this.$message.warning('请先选择业务对象')
        } else if (!this.appSystem) {
          this.$message.warning('请选择应用系统')
        } else if (!this.modelType) {
          this.$message.warning('请选择数据源')
        } else if (!this.schemaId) {
          this.$message.warning('请选择数据库')
        }
        return
      }

      // 构建请求参数
      const params = {
        businessObjects: this.selectedBusinessObjects.map(item => ({
          id: item.id,
          structureId: item.structureId,
          catalogPath: item.catalogPath,
          name: item.name,
        })),
        modelCategoryId: parseInt(this.appSystem),
        modelId: parseInt(this.modelType),
        databaseId: this.schemaId,
      }

      // 调用自动映射接口
      this.isMatching = true
      this.autoMatchApi(params)
    },

    // 自动匹配接口
    // 修改 autoMatchApi 方法
    autoMatchApi(params) {
      this.isMatching = true
      this.$http
        .post('/assets/meta/mapping/createAutoMapping', params)
        .then(res => {
          this.$message.success('自动匹配任务已创建成功，请稍后查看结果')
          this.isMatching = false
          // 可以跳转到映射管理页面
          // this.$router.push('/dataAsset/modelMappingManage')
        })
        .catch(err => {
          this.$message.error('自动匹配任务创建失败')
          this.isMatching = false
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.model-auto-mapping-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: #fff;
  .asset-catalog,
  .model-metadata {
    width: 50%;
    position: absolute;
    top: 0;
    bottom: 50px;
    flex: 1;
    padding: 16px;
  }
  .asset-catalog {
    left: 0;
  }
  .model-metadata {
    right: 0;
  }

  .section-title {
    height: 50px;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .auto-mapping-filter-row {
    display: flex;
    margin-bottom: 16px;

    .filter-item {
      margin-right: 16px;
      display: flex;
      align-items: center;

      span {
        margin-right: 8px;
      }
    }
  }

  .selected-items {
    margin-top: 20px;

    .selected-title {
      margin-bottom: 10px;
      font-weight: bold;
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;

      .el-tag {
        margin-right: 8px;
        margin-bottom: 8px;
        color: white;
      }
    }
  }

  .auto-match-btn {
    width: 100%;
    height: 50px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: right;
    padding-right: 50px;
  }

  .el-alert {
    margin: 16px 0;
  }
}
</style>
