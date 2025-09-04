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
              v-for="c in $modelCategories"
              :key="c.categoryId"
              :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
              :value="c.categoryId"
            ></el-option>
          </datablau-select>
        </div>
        <div class="filter-item">
          <span>模型</span>
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
              :key="item.value"
              :label="item.label"
              :value="item.value"
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
      // 左侧筛选条件
      businessDomain: undefined,
      themeDomain: undefined,
      businessPlan: undefined,

      // 右侧筛选条件
      appSystem: undefined,
      modelType: undefined,

      // 选项数据
      businessDomainOptions: [],
      themeDomainOptions: [],
      businessPlanOptions: [],
      appSystemOptions: [],
      modelTypeOptions: [],

      // 业务对象列表
      businessObjectsList: [],
      checkedBusinessObjects: [],

      // 已选业务对象
      selectedBusinessObjects: [],

      // 添加匹配状态控制
      isMatching: false,
      matchTip: '',
    }
  },
  computed: {
    // 控制自动匹配按钮是否可点击
    canAutoMatch() {
      return (
        this.selectedBusinessObjects.length > 0 &&
        this.appSystem &&
        this.modelType
      )
    },
  },
  created() {
    this.fetchOptions()
  },
  methods: {
    queryBusinessObject(params) {
      return this.$http.post('/assets/ddm/mapping/queryBusinessObject', params)
    },
    // 获取下拉选项数据
    fetchOptions() {
      // 获取业务域选项 - 不传参数
      this.fetchBusinessDomains()

      // 不再需要单独获取应用系统选项，因为使用了全局的 $modelCategories
    },
    // 获取应用系统选项
    fetchAppSystems() {
      // 使用全局的应用系统数据，如果有的话
      if (this.$modelCategories && this.$modelCategories.length > 0) {
        this.appSystemOptions = this.$modelCategories.map(c => ({
          value: c.categoryId.toString(),
          label: `${c.categoryName}(${c.categoryAbbreviation})`,
          data: c,
        }))
      } else {
        // 如果没有全局数据，则调用接口获取
        this.$http
          .post('/assets/ddm/collect/queryModelCategoryList')
          .then(res => {
            this.appSystemOptions = (res || []).map(c => ({
              value: c.categoryId.toString(),
              label: `${c.categoryName}(${c.categoryAbbreviation})`,
              data: c,
            }))
          })
          .catch(err => {
            this.$showFailure(err)
          })
      }
    },
    // 应用系统清除
    handleAppSystemClear() {
      this.modelType = undefined
      this.modelTypeOptions = []

      // 更新提示信息
      this.updateMatchTip()
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

    // 业务域变更
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

    // 业务方案变更
    handleBusinessPlanChange() {
      this.queryBusinessObjects()
    },

    // 应用系统变更
    handleAppSystemChange(value) {
      // 清空模型选择
      this.modelType = undefined
      this.modelTypeOptions = []

      // 获取对应的模型列表
      if (value) {
        this.fetchModels(value)
      }

      // 更新提示信息
      this.updateMatchTip()
    },
    // 更新匹配提示信息
    updateMatchTip() {
      if (!this.selectedBusinessObjects.length) {
        this.matchTip = '请选择需要匹配的业务对象'
      } else if (!this.appSystem) {
        this.matchTip = '请选择应用系统'
      } else if (!this.modelType) {
        this.matchTip = '请选择模型'
      } else {
        this.matchTip = `已选择 ${this.selectedBusinessObjects.length} 个业务对象，可以开始自动匹配`
      }
    },
    // 获取模型列表
    async fetchModels(modelCategoryId) {
      try {
        const response = await this.$http.get(
          `/assets/ddm/data/queryModelByModelCategoryId`,
          {
            params: { modelCategoryId },
          }
        )
        this.modelTypeOptions = response.data.map(item => ({
          value: item.ddmModelId,
          label: item.ddmModelName,
          data: item,
        }))
      } catch (error) {
        this.$showFailure(err)
      }
    },

    // 模型变更
    handleModelChange() {
      // 更新提示信息
      this.updateMatchTip()
    },

    // 模型清除
    handleModelClear() {
      // 更新提示信息
      this.updateMatchTip()
    },
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
        // .catch(err => {
        //   console.error('获取业务对象失败', err)
        //   this.$message.error('获取业务对象失败')
        // })
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
      this.updateMatchTip()
    },

    // 自动匹配处理
    handleAutoMatch() {
      if (!this.canAutoMatch) {
        if (!this.selectedBusinessObjects.length) {
          this.$message.warning('请先选择业务对象')
        } else if (!this.appSystem) {
          this.$message.warning('请选择应用系统')
        } else if (!this.modelType) {
          this.$message.warning('请选择模型')
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
        ddmModelId: parseInt(this.modelType),
      }

      // 调用自动映射接口
      this.isMatching = true
      this.matchTip = '正在创建自动匹配任务...'
      this.autoMatchApi(params)
    },

    // 自动匹配接口
    autoMatchApi(params) {
      // 调用接口创建自动映射任务
      this.$http
        .post('/assets/ddm/mapping/createAutoMapping', params)
        .then(res => {
          this.$message.success('自动匹配任务已创建成功，请稍后查看结果')
          this.matchTip = '任务创建成功，您可以前往映射管理页面查看结果'

          // 可以跳转到映射管理页面
          // this.$router.push('/dataAsset/modelMappingManage')
        })
        .catch(err => {
          this.$message.error('自动匹配任务创建失败')
          this.matchTip = '任务创建失败，请稍后重试'
        })
        .finally(() => {
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
