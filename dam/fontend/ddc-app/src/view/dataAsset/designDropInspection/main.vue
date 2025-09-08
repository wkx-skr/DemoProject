<template>
  <div class="design-drop-inspection">
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
          <!-- 左侧筛选 -->
          <div class="left-filter" style="line-height: 90px">
            <asset-catalog-dialog @confirm="onAssetConfirm" :disabled="isRightSideSelected" />
            <!--
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
            </el-form-item>-->
          </div>

          <!-- 分隔线 -->
          <div class="divider"></div>

          <!-- 右侧筛选 -->
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
                  v-for="c in $modelCategories"
                  :key="c.categoryId"
                  :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
                  :value="c.categoryId"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="逻辑模型">
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
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="button-group">
          <!-- <datablau-button type="normal" @click="handleSearch">
            查询
          </datablau-button> -->
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
      <div class="summary-info">
        <div class="summary-item">
          <span class="label">资产总数 (DL5):</span>
          <span class="value">{{ assetNumTotal || 0 }}</span>
        </div>
        <div class="summary-item">
          <span class="label">已承载DL5:</span>
          <span class="value">{{ registerAssetNumTotal || 0 }}</span>
        </div>
        <div class="summary-item">
          <span class="label">资产覆盖率:</span>
          <span class="value">{{ registerAssetRateTotal || '0%' }}</span>
        </div>
        <div class="summary-item">
          <span class="label">落标数:</span>
          <span class="value">{{ labelDropNumTotal || 0 }}</span>
        </div>
        <div class="summary-item">
          <span class="label">落标率:</span>
          <span class="value">{{ labelDropRateTotal || '0%' }}</span>
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
          label="已承载DL5数"
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
        height="calc(100% - 100px)"
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
import AssetCatalogDialog from '@/components/AssetCatalogDialog.vue'
export default {
  name: 'DesignDropInspection',
  components: { AssetCatalogDialog },
  data() {
    return {
      searchForm: {
        businessDomain: null,
        themeDomain: null,
        businessObject: null,
        appSystem: null,
        modelType: null,
      },
      selectedAssets: [],
      businessDomainOptions: [],
      themeDomainOptions: [],
      businessObjectsList: [],
      modelTypeOptions: [],
      resultTableData: [],
      detailTableData: [],
      loading: {
        resultTable: false,
        detailTable: false,
      },
      isRunning: false,
      // 新增总计数据
      assetNumTotal: 0,
      registerAssetNumTotal: 0,
      labelDropNumTotal: 0,
      registerAssetRateTotal: '0%',
      labelDropRateTotal: '0%',
      LDMTypes: LDMTypes,
    }
  },
  computed: {
    isLeftSideSelected() {
      return !!(
        this.searchForm.businessDomain ||
        this.searchForm.themeDomain ||
        this.searchForm.businessObject
      )
    },
    isRightSideSelected() {
      return !!(this.searchForm.appSystem || this.searchForm.modelType)
    },
    canRunTask() {
      return (
        (this.isLeftSideSelected || this.isRightSideSelected) &&
        !(this.isLeftSideSelected && this.isRightSideSelected)
      )
    },
    // 构建请求参数
    requestParams() {
      return {
        modelCategoryId: this.searchForm.appSystem || null,
        businessDomainId: this.searchForm.businessDomain || null,
        subjectDomainId: this.searchForm.themeDomain || null,
        businessObjectId: this.searchForm.businessObject || null,
        ddmModelId: this.searchForm.modelType || null,
      }
    },
  },
  created() {
    this.fetchInitialData()
  },
  methods: {
    // 处理资产选择确认
    onAssetConfirm(assets) {
      this.selectedAssets = assets;
      this.isLeftSideSelected = true;
    },
    // 导出所有Word报告
    async exportAllWordReport() {
      if (!this.resultTableData.length) {
        this.$message.warning('没有可导出的数据')
        return
      }
      this.$downloadFilePost(
        `/assets/labelDrop/exportDesignLabelDropResultByWord`,
        this.requestParams
      )
    },

    // 导出所有Excel明细
    async exportAllExcelDetail() {
      if (!this.detailTableData.length) {
        this.$message.warning('没有可导出的数据')
        return
      }
      this.$downloadFilePost(
        `/assets/labelDrop/exportDesignLabelDropResult`,
        this.requestParams
      )
    },
    // 获取初始数据
    async fetchInitialData() {
      await this.fetchBusinessDomains()
    },

    // 获取业务域选项
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

    // 业务域变更
    handleBusinessDomainChange() {
      this.searchForm.themeDomain = null
      this.searchForm.businessObject = null
      this.themeDomainOptions = []
      this.businessObjectsList = []

      if (this.searchForm.businessDomain) {
        this.fetchThemeDomains()
      }
    },
    handleBusinessDomainClear() {
      this.searchForm.themeDomain = null
      this.searchForm.businessObject = null
      this.themeDomainOptions = []
      this.businessObjectsList = []
    },

    // 获取主题域选项
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

    // 主题域变更
    handleThemeDomainChange() {
      this.searchForm.businessObject = null
      this.businessObjectsList = []

      if (this.searchForm.themeDomain) {
        this.fetchBusinessObjects()
      }
    },
    handleThemeDomainClear() {
      this.searchForm.businessObject = null
      this.businessObjectsList = []
    },

    // 获取业务对象列表
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

    // 应用系统变更
    handleAppSystemChange(value) {
      this.searchForm.modelType = null
      this.modelTypeOptions = []

      if (value) {
        this.fetchModels(value)
      }
    },

    // 应用系统清除
    handleAppSystemClear() {
      this.searchForm.modelType = null
      this.modelTypeOptions = []
    },

    // 获取逻辑模型列表
    async fetchModels(modelCategoryId) {
      try {
        const response = await this.$http.get(
          '/assets/ddm/data/queryModelByModelCategoryId',
          {
            params: { modelCategoryId },
          }
        )
        this.modelTypeOptions = response.data.map(item => ({
          value: item.ddmModelId,
          label: item.ddmModelName,
        }))
      } catch (error) {
        this.$showFailure(error)
      }
    },

    // 逻辑模型变更
    handleModelChange() {
      // 可以添加额外的处理逻辑
    },

    // 逻辑模型清除
    handleModelClear() {
      // 可以添加额外的处理逻辑
    },

    // 查询
    handleSearch() {
      this.fetchResultData()
    },

    // 重置
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.searchForm = {
        businessDomain: null,
        themeDomain: null,
        businessObject: null,
        appSystem: null,
        modelType: null,
      }
      this.themeDomainOptions = []
      this.businessObjectsList = []
      this.modelTypeOptions = []
      this.resultTableData = []
      this.detailTableData = []
      this.assetNumTotal = 0
      this.registerAssetNumTotal = 0
      this.labelDropNumTotal = 0
      this.registerAssetRateTotal = '0%'
      this.labelDropRateTotal = '0%'
      this.isLeftSideSelected = false;

      // 清空本地缓存
      localStorage.removeItem('selectedAssets');
      this.selectedAssets = [];

      // 清空选中资产
      this.selectedAssets = [];
    },

    // 获取落标结果数据
    async fetchResultData() {
      this.loading.resultTable = true
      try {
        const res = await this.$http.post(
          '/assets/labelDrop/getDesignLabelDropResult',
          this.requestParams
        )
        this.$message.success('运行落标校验任务成功')
        this.resultTableData = res.data.designLabelDropResultDtolist || []
        this.detailTableData = res.data.designLabelDropResultDetailDtoList || []
        this.assetNumTotal = res.data.assetNumTotal || 0
        this.registerAssetNumTotal = res.data.registerAssetNumTotal || 0
        this.labelDropNumTotal = res.data.labelDropNumTotal || 0
        this.registerAssetRateTotal = res.data.registerAssetRateTotal || '0%'
        this.labelDropRateTotal = res.data.labelDropRateTotal || '0%'
      } catch (err) {
        this.$showFailure(err)
        this.resultTableData = []
        this.detailTableData = []
        this.assetNumTotal = 0
        this.registerAssetNumTotal = 0
        this.labelDropNumTotal = 0
        this.registerAssetRateTotal = '0%'
        this.labelDropRateTotal = '0%'
      } finally {
        this.loading.resultTable = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.design-drop-inspection {
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
