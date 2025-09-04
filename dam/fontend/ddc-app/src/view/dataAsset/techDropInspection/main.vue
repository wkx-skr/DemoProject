<template>
  <div class="tech-drop-inspection">
    <!-- 顶部筛选区域 -->
    <div class="filter-area">
      <el-form
        :model="searchForm"
        ref="searchForm"
        :inline="true"
        size="mini"
        style="display: flex"
      >
        <div class="filter-content">
          <!-- 左侧筛选：业务域、主题域、业务对象 -->
          <div class="left-filter">
            <el-form-item label="业务域">
              <datablau-select
                v-model="searchForm.businessDomain"
                placeholder="请选择"
                style="width: 150px"
                clearable
                @change="handleBusinessDomainChange"
                @clear="handleBusinessDomainClear"
                :disabled="isRightSideSelected"
              >
                <el-option
                  v-for="item in businessDomainOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="主题域">
              <datablau-select
                v-model="searchForm.themeDomain"
                placeholder="请选择"
                style="width: 150px"
                clearable
                @change="handleThemeDomainChange"
                @clear="handleThemeDomainClear"
                :disabled="isRightSideSelected || !searchForm.businessDomain"
              >
                <el-option
                  v-for="item in themeDomainOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="业务对象">
              <datablau-select
                v-model="searchForm.businessObject"
                placeholder="请选择"
                style="width: 150px"
                clearable
                :disabled="isRightSideSelected || !searchForm.themeDomain"
              >
                <el-option
                  v-for="item in businessObjectsList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </datablau-select>
            </el-form-item>
          </div>

          <!-- 分隔线 -->
          <div class="divider"></div>

          <!-- 右侧筛选：应用系统、数据源、数据库 -->
          <div class="right-filter">
            <el-form-item label="应用系统">
              <datablau-select
                v-model="searchForm.appSystem"
                placeholder="请选择"
                style="width: 150px"
                clearable
                @change="handleAppSystemChange"
                @clear="handleAppSystemClear"
                :disabled="isLeftSideSelected"
              >
                <el-option
                  v-for="item in appSystemOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="数据源">
              <datablau-select
                v-model="searchForm.modelType"
                placeholder="请选择"
                style="width: 150px"
                clearable
                :disabled="!searchForm.appSystem || isLeftSideSelected"
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
            </el-form-item>
            <el-form-item label="数据库">
              <datablau-select
                v-model="searchForm.schemaId"
                placeholder="请选择"
                style="width: 150px"
                clearable
                :disabled="!searchForm.modelType || isLeftSideSelected"
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
            </el-form-item>
          </div>
        </div>

        <!-- 按钮组：查询、重置、运行落标任务 -->
        <div class="button-group">
          <datablau-button
            type="primary"
            @click="handleSearch"
            :disabled="!canRunTask"
            :loading="isRunning"
          >
            落标校验任务
          </datablau-button>
          <datablau-button type="secondary" @click="handleReset">
            重置
          </datablau-button>
        </div>
      </el-form>
    </div>

    <!-- 落标结果表格 -->
    <div class="result-table">
      <div class="table-title">
        落标结果
        <div class="table-actions">
          <datablau-button
            type="primary"
            @click="exportAllWordReport"
            :disabled="!resultTableData.length"
          >
            导出落标报告
          </datablau-button>
        </div>
      </div>
      <!-- 添加总体统计信息 -->
      <div class="summary-info">
        <div class="summary-item">
          <span class="label">资产总数 (DL5):</span>
          <span class="value">{{ resultSummary.assetNumTotal || 0 }}</span>
        </div>
        <div class="summary-item">
          <span class="label">资产注册数:</span>
          <span class="value">
            {{ resultSummary.registerAssetNumTotal || 0 }}
          </span>
        </div>
        <div class="summary-item">
          <span class="label">资产注册率:</span>
          <span class="value">
            {{
              resultSummary.registerAssetRateTotal
                ? resultSummary.registerAssetRateTotal
                : '0%'
            }}
          </span>
        </div>
        <div class="summary-item">
          <span class="label">落标数:</span>
          <span class="value">{{ resultSummary.labelDropNumTotal || 0 }}</span>
        </div>
        <div class="summary-item">
          <span class="label">落标率:</span>
          <span class="value">
            {{
              resultSummary.labelDropRateTotal
                ? resultSummary.labelDropRateTotal
                : '0%'
            }}
          </span>
        </div>
      </div>
      <datablau-table
        :data="resultTableData"
        height="calc(100% - 100px)"
        v-loading="loading.resultTable"
      >
        <el-table-column
          show-overflow-tooltip
          prop="modelCategoryName"
          label="应用系统"
        />
        <el-table-column
          show-overflow-tooltip
          prop="assetNum"
          label="资产数 (DL5)"
        />
        <el-table-column
          show-overflow-tooltip
          prop="registerAssetNum"
          label="资产注册数"
        />
        <!-- <el-table-column
          show-overflow-tooltip
          prop="registerAssetRate"
          label="资产注册率"
        /> -->
        <el-table-column
          show-overflow-tooltip
          prop="labelDropNum"
          label="落标数"
        />
        <!-- <el-table-column
          show-overflow-tooltip
          prop="labelDropRate"
          label="落标率"
        /> -->
        <!-- <el-table-column show-overflow-tooltip label="操作" width="150">
          <template slot-scope="scope">
            <datablau-button type="text" @click="exportWordReport(scope.row)">
              导出报告
            </datablau-button>
          </template>
        </el-table-column> -->
      </datablau-table>
    </div>

    <!-- 落标详情表格 -->
    <div class="detail-table">
      <div class="table-title">
        落标详情
        <div class="table-actions">
          <datablau-button
            type="primary"
            @click="exportAllExcelDetail"
            :disabled="!detailTableData.length"
          >
            导出落标失败明细
          </datablau-button>
        </div>
      </div>
      <datablau-table
        :data="detailTableData"
        height="calc(100% - 60px)"
        v-loading="loading.detailTable"
      >
        <el-table-column
          show-overflow-tooltip
          prop="categoryPath"
          label="字段来源"
        />
        <el-table-column
          show-overflow-tooltip
          prop="mappingColumn"
          label="映射字段"
        />
        <el-table-column
          show-overflow-tooltip
          prop="logicEntity"
          label="DL4实体英文名"
        />
        <el-table-column
          show-overflow-tooltip
          prop="attribute"
          label="DL5属性英文名"
        />
        <el-table-column
          show-overflow-tooltip
          prop="domainName"
          label="标准数据元"
        >
          <template slot-scope="scope">
            <datablau-link
              v-if="scope.row.domainId"
              :data-type="LDMTypes.Domain"
              :data-id="scope.row.domainId"
              :label="scope.row.domainName"
              :data-object="{
                domainId: scope.row.domainId,
                domainName: scope.row.domainName,
              }"
            ></datablau-link>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="status" label="落标状态" />
        <el-table-column
          prop="desc"
          label="落标问题描述"
          width="300"
          show-overflow-tooltip
        />
         <el-table-column
          show-overflow-tooltip
          prop="domainValue"
          label="标准值"
        />
        <el-table-column
          show-overflow-tooltip
          prop="columnValue"
          label="实际值"
        />
        <!-- <el-table-column show-overflow-tooltip label="操作" width="150">
          <template slot-scope="scope">
            <datablau-button type="text" @click="exportExcelDetail(scope.row)">
              导出明细
            </datablau-button>
          </template>
        </el-table-column> -->
      </datablau-table>
    </div>
  </div>
</template>

<script>
import LDMTypes from '@constant/LDMTypes'
export default {
  name: 'TechDropInspection',
  data() {
    return {
      // 搜索表单数据
      searchForm: {
        businessDomain: undefined, // 业务域
        themeDomain: undefined, // 主题域
        businessObject: undefined, // 业务对象
        appSystem: undefined, // 应用系统
        modelType: undefined, // 数据源
        schemaId: undefined, // 数据库
      },
      // 左侧筛选选项
      businessDomainOptions: [], // 业务域选项
      themeDomainOptions: [], // 主题域选项
      businessObjectsList: [], // 业务对象列表
      // 右侧筛选选项
      appSystemOptions: [], // 应用系统选项
      modelTypeOptions: [], // 数据源选项
      schemaOptions: [], // 数据库选项
      modelTreeData: null, // 模型树数据
      // 表格数据
      resultTableData: [], // 落标结果表格数据
      detailTableData: [], // 落标详情表格数据
      // 加载状态
      loading: {
        resultTable: false,
        detailTable: false,
      },
      isRunning: false, // 任务运行状态
      resultSummary: {}, // 落标结果摘要数据
      LDMTypes,
    }
  },
  computed: {
    // 判断左侧筛选是否已选择
    isLeftSideSelected() {
      return !!(
        this.searchForm.businessDomain ||
        this.searchForm.themeDomain ||
        this.searchForm.businessObject
      )
    },
    // 判断右侧筛选是否已选择
    isRightSideSelected() {
      return !!(
        this.searchForm.appSystem ||
        this.searchForm.modelType ||
        this.searchForm.schemaId
      )
    },
    // 判断是否可以运行落标任务（左右侧筛选只能选择一侧）
    canRunTask() {
      return (
        (this.isLeftSideSelected || this.isRightSideSelected) &&
        !(this.isLeftSideSelected && this.isRightSideSelected)
      )
    },
    // 构建请求参数
    requestParams() {
      return {
        parentModelId: this.searchForm.modelType || null,
        modelCategoryId: this.searchForm.appSystem || null,
        businessDomainId: this.searchForm.businessDomain || null,
        subjectDomainId: this.searchForm.themeDomain || null,
        businessObjectId: this.searchForm.businessObject || null,
        ddmModelId: this.searchForm.schemaId || null,
      }
    },
  },
  created() {
    // 初始化数据
    this.fetchInitialData()
    this.initModelTree()
  },
  methods: {
    /**
     * 初始化数据
     */
    async fetchInitialData() {
      await this.fetchBusinessDomains()
    },

    /**
     * 初始化模型树数据
     * 获取应用系统、数据源、数据库的层级关系
     */
    async initModelTree() {
      try {
        const res = await this.$http.get('/metadata/models/modeltree')
        this.modelTreeData = res.data
        // 提取所有type为MODEL_CATEGORY的节点作为应用系统选项
        this.appSystemOptions = this.findModelCategories(this.modelTreeData)
      } catch (error) {
       this.$showFailure(error)
      }
    },

    /**
     * 递归查找所有MODEL_CATEGORY节点
     * @param {Object} node - 当前节点
     * @returns {Array} - 找到的MODEL_CATEGORY节点列表
     */
    findModelCategories(node) {
      let categories = []
      if (node && node.subNodes) {
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

    /**
     * 获取业务域选项
     */
    async fetchBusinessDomains() {
      try {
        const res = await this.$http.post(
          '/assets/ddm/mapping/queryBusinessObject',
          {}
        )
        this.businessDomainOptions = res.data.map(item => ({
          value: item.id.toString(),
          label: item.name,
        }))
      } catch (err) {
        this.$showFailure(err)
      }
    },

    /**
     * 业务域变更处理
     * 清空主题域和业务对象，重新获取主题域选项
     */
    handleBusinessDomainChange() {
      this.searchForm.themeDomain = undefined
      this.searchForm.businessObject = undefined
      this.themeDomainOptions = []
      this.businessObjectsList = []

      if (this.searchForm.businessDomain) {
        this.fetchThemeDomains()
      }
    },
    handleBusinessDomainClear() {
      this.searchForm.themeDomain = undefined
      this.searchForm.businessObject = undefined
      this.themeDomainOptions = []
      this.businessObjectsList = []
    },

    /**
     * 获取主题域选项
     */
    async fetchThemeDomains() {
      try {
        const res = await this.$http.post(
          '/assets/ddm/mapping/queryBusinessObject',
          {
            businessDomainId: parseInt(this.searchForm.businessDomain),
          }
        )
        this.themeDomainOptions = res.data.map(item => ({
          value: item.id.toString(),
          label: item.name,
        }))
      } catch (err) {
        this.$showFailure(err)
      }
    },

    /**
     * 主题域变更处理
     * 清空业务对象，重新获取业务对象列表
     */
    handleThemeDomainChange() {
      this.searchForm.businessObject = undefined
      this.businessObjectsList = []

      if (this.searchForm.themeDomain) {
        this.fetchBusinessObjects()
      }
    },
    handleThemeDomainClear() {
      this.searchForm.businessObject = undefined
      this.businessObjectsList = []
    },

    /**
     * 获取业务对象列表
     */
    async fetchBusinessObjects() {
      try {
        const res = await this.$http.post(
          '/assets/ddm/mapping/queryBusinessObject',
          {
            businessDomainId: parseInt(this.searchForm.businessDomain),
            subjectDomainId: parseInt(this.searchForm.themeDomain),
          }
        )
        this.businessObjectsList = res.data || []
      } catch (err) {
        this.$showFailure(err)
      }
    },

    /**
     * 应用系统变更处理
     * 清空数据源和数据库，重新获取数据源选项
     * @param {String} value - 选中的应用系统ID
     */
    handleAppSystemChange(value) {
      this.searchForm.modelType = undefined
      this.searchForm.schemaId = undefined
      this.modelTypeOptions = []
      this.schemaOptions = []

      if (value) {
        // 找到选中的系统节点
        const selectedSystem = this.appSystemOptions.find(
          sys => sys.id === value
        )
        if (selectedSystem && selectedSystem.subNodes) {
          // 从子节点中过滤MODEL类型作为数据源选项
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

    /**
     * 应用系统清除处理
     * 清空数据源和数据库
     */
    handleAppSystemClear() {
      this.searchForm.modelType = undefined
      this.searchForm.schemaId = undefined
      this.modelTypeOptions = []
      this.schemaOptions = []
    },

    /**
     * 数据源变更处理
     * 清空数据库，重新获取数据库选项
     * @param {String} value - 选中的数据源ID
     */
    handleModelChange(value) {
      this.searchForm.schemaId = undefined
      this.schemaOptions = []

      if (value) {
        // 找到选中的数据源节点
        const selectedModel = this.modelTypeOptions.find(
          model => model.id === value
        )
        if (selectedModel && selectedModel.subNodes) {
          // 从子节点中过滤MODEL_SCHEMA类型作为数据库选项
          this.schemaOptions = selectedModel.subNodes
            .filter(node => node.type === 'MODEL_SCHEMA')
            .map(node => ({
              id: node.id,
              name: node.name,
            }))
        }
      }
    },

    /**
     * 数据源清除处理
     * 清空数据库
     */
    handleModelClear() {
      this.searchForm.schemaId = undefined
      this.schemaOptions = []
    },

    /**
     * 数据库变更处理方法
     * 数据库变更时无需额外处理，保留此方法以便后续扩展
     */
    handleSchemaChange(value) {
      // 数据库变更时无需额外处理，保留此方法以便后续扩展
    },

    /**
     * 数据库清除处理
     * 数据库清除时无需额外处理，保留此方法以便后续扩展
     */
    handleSchemaClear() {
      // 数据库清除时无需额外处理，保留此方法以便后续扩展
    },

    /**
     * 查询按钮点击处理
     * 获取落标结果和落标详情数据
     */
    handleSearch() {
      this.fetchResultData()
      // this.fetchDetailData()
    },

    /**
     * 重置按钮点击处理
     * 重置表单和清空表格数据
     */
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.resultTableData = []
      this.detailTableData = []
      this.resultSummary = {}
      this.searchForm = {
        businessDomain: undefined, // 业务域
        themeDomain: undefined, // 主题域
        businessObject: undefined, // 业务对象
        appSystem: undefined, // 应用系统
        modelType: undefined, // 数据源
        schemaId: undefined, // 数据库
      }
      this.businessObjectsList = []
      this.modelTypeOptions = []
      this.schemaOptions = []
    },

    /**
     * 获取落标结果数据
     */
    async fetchResultData() {
      this.loading.resultTable = true
      try {
        const res = await this.$http.post(
          '/assets/labelDrop/getTechLabelDropResult',
          this.requestParams
        )

        // 处理返回的数据
        if (res.data && res.data.designLabelDropResultDtolist) {
          this.$message.success('运行落标校验任务成功')
          this.resultTableData = res.data.designLabelDropResultDtolist
          this.detailTableData = res.data.designLabelDropResultDetailDtoList
          this.resultSummary.assetNumTotal = res.data.assetNumTotal
          this.resultSummary.registerAssetNumTotal =
            res.data.registerAssetNumTotal
          this.resultSummary.registerAssetRateTotal =
            res.data.registerAssetRateTotal
          this.resultSummary.labelDropNumTotal = res.data.labelDropNumTotal
          this.resultSummary.labelDropRateTotal = res.data.labelDropRateTotal
        } else {
          this.resultTableData = []
        }
      } catch (err) {
        this.$showFailure(err)
        this.resultTableData = []
        this.detailTableData = []
        this.resultSummary = {}
      } finally {
        this.loading.resultTable = false
      }
    },


    // 导出所有Word报告
    async exportAllWordReport() {
      this.$downloadFilePost(
        '/assets/labelDrop/exportTechLabelDropResultByWord',
        this.requestParams
      )
    },

    // 导出所有Excel明细
    async exportAllExcelDetail() {
      this.$downloadFilePost(
        '/assets/labelDrop/exportTechLabelDropResult',
        this.requestParams
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.tech-drop-inspection {
  height: 100%;
  padding: 16px;
  background: #fff;
  .summary-info {
    display: flex;
    flex-wrap: wrap;
    padding: 10px 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .summary-item {
    margin-right: 30px;
    margin-bottom: 5px;

    .label {
      font-weight: bold;
      margin-right: 5px;
    }

    .value {
      color: #409eff;
      font-weight: bold;
    }
  }
  .filter-area {
    margin-bottom: 16px;

    .filter-content {
      display: flex;
      align-items: flex-start;
      width: 80%;

      .left-filter,
      .right-filter {
        flex: 1;
        padding: 10px;
      }

      .divider {
        width: 1px;
        height: 100px;
        background: #dcdfe6;
        margin: 0 20px;
      }
    }

    .button-group {
      text-align: right;
      padding: 10px;

      .datablau-button {
        margin-left: 10px;
      }
    }
  }

  .result-table,
  .detail-table {
    height: calc(50% - 77px);
    margin-bottom: 16px;

    .table-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      font-weight: bold;

      .table-actions {
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
