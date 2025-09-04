<template>
  <div style="position: absolute; bottom: 0; top: 72px; left: 0; right: 0">
    <datablau-form-submit ref="formSubmit">
      <datablau-form
        ref="firstForm"
        :model="firstData"
        :rules="firstRules"
        :validateNoScroll="true"
      >
        <el-form-item
          :label="$t('accessStrategy.accessName')"
          prop="accessStrategyName"
        >
          <datablau-input
            v-model="firstData.accessStrategyName"
            :placeholder="$t('securityModule.input')"
            maxlength="50"
            clearable
            show-word-limit
            style="width: 480px"
          ></datablau-input>
        </el-form-item>
        <!-- <el-form-item label="引用安全策略" prop="securityStrategyName">
          <datablau-input
            ref="policy"
            v-model="firstData.securityStrategyName"
            placeholder="请选择策略名称"
            style="width: 480px"
            @focus="openPolicyDialog"
          ></datablau-input>
        </el-form-item> -->
        <el-form-item :label="$t('accessStrategy.accessDes')">
          <datablau-input
            type="textarea"
            v-model="firstData.strategyDescribe"
            :placeholder="$t('securityModule.input')"
            style="width: 640px"
            :autosize="{
              minRows: 5,
              maxRows: 6,
            }"
            show-word-limit
            resize="none"
          ></datablau-input>
        </el-form-item>

        <el-form-item
          :label="$t('securityModule.selectCatalog')"
          prop="catalogName"
        >
          <datablau-input
            ref="catalogName"
            v-model="firstData.catalogName"
            :placeholder="$t('securityModule.placeSelect')"
            style="width: 480px"
            @focus="openDirector"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <template slot="buttons">
        <div>
          <datablau-button type="normal" @click="next">
            {{ $t('accessStrategy.nextStep') }}
          </datablau-button>
          <datablau-button class="cut-apart-btn" type="secondary" @click="back">
            {{ $t('securityModule.cancel') }}
          </datablau-button>
        </div>
      </template>
    </datablau-form-submit>
    <datablau-dialog
      width="800"
      height="560"
      :title="$t('accessStrategy.selectSecurityPolicy')"
      :visible.sync="showPolicyDialog"
      v-if="showPolicyDialog"
      :before-close="beforeClose"
    >
      <div>
        <div class="policy-filter">
          <datablau-input
            :placeholder="$t('accessStrategy.searchSecurityPolicyName')"
            clearable
            v-model="policyKeyword"
            style="width: 240px"
          ></datablau-input>
          <datablau-button
            type="primary"
            @click="searchPolicyByKeyword"
            style="margin-left: 10px"
          >
            {{ $t('securityModule.query') }}
          </datablau-button>
        </div>
        <datablau-table
          :data="policyData"
          single-select
          @selection-change="handlePolicySelect"
          ref="policyTable"
          v-loading="loading"
        >
          <el-table-column
            :label="$t('accessStrategy.securityPolicyName')"
            prop="name"
            width="400px"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('accessStrategy.dataDept')"
            prop="deptName"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('accessStrategy.founder')"
            prop="creator"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('accessStrategy.creationTime')"
            prop="createTime"
            show-overflow-tooltip
          >
            <template scope="{row}">
              {{
                row.createTime
                  .replace(/-/g, '/')
                  .replace(/T/g, ' ')
                  .replace(/\.\d+/g, '')
              }}
            </template>
          </el-table-column>
        </datablau-table>
      </div>
      <div slot="footer">
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="pagination.pageNum"
          :page-sizes="[20, 50, 100, 200]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          style="float: left"
        ></datablau-pagination>
        <datablau-button type="secondary" @click="closePolicyDialog">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="confirmPolicy"
          :disabled="!selectedPolicy.id"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      :title="$t('securityModule.selectCatalog')"
      size="s"
      :height="480"
      width="600px"
      :visible.sync="directory"
      v-if="directory"
      :before-close="beforeCloseTree"
    >
      <div class="tree-search-box">
        <datablau-input
          style="width: 100%"
          v-model="treeKey"
          :iconfont-state="true"
          clearable
          :placeholder="$t('securityModule.search')"
        ></datablau-input>
      </div>
      <div class="tree-box">
        <datablau-tree
          v-loading="treeLoading"
          @node-click="handleNodeClick"
          node-key="catalogId"
          :props="defaultProps"
          :data="treeData"
          :data-supervise="true"
          :data-img-function="dataIconFunction"
          :filter-node-method="filterStrategyCatalogs"
          ref="tree"
          :empty-text="$t('securityModule.noCatalogInfo')"
        ></datablau-tree>
      </div>

      <span slot="footer">
        <datablau-button type="secondary" @click="close">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button type="important" :disabled="!selectGra" @click="sure">
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
import folder from '@/assets/images/search/folder.svg'
export default {
  name: 'FirstStep',
  props: {
    initData: {
      type: Object,
      default: () => {
        return {}
      },
    },
    clickChild: {
      type: Function,
    },
    catalogInfo: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      treeKey: '',
      contentLoading: false,
      pagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0,
      },
      loading: false,
      firstData: {},
      firstRules: {
        accessStrategyName: [
          {
            required: true,
            message: this.$t('securityModule.input'),
            trigger: 'blur',
          },
        ],
        // securityStrategyName: [
        //   {
        //     required: true,
        //     validator: this.checkPolicyName,
        //     trigger: 'change',
        //   },
        // ],
        catalogName: [
          {
            required: true,
            validator: this.checkPolicyName,
            trigger: 'change',
          },
        ],
      },
      showPolicyDialog: false,
      selectedPolicy: {},
      policyKeyword: '',
      policyData: [],
      directory: false,
      treeData: [],
      defaultProps: {
        children: 'subNodes',
        label: 'name',
      },
      selectGra: null,
      resolve: null, // 如果目录懒加载
      treeLoading: false,
    }
  },
  mounted() {
    this.getTree()
  },
  methods: {
    // 根据关键字过滤策略目录树
    filterStrategyCatalogs(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    back() {
      this.clickChild('cancel')
    },
    getTree() {
      API.getStrategyCatalog()
        .then(res => {
          const treeData = res.data.data.subNodes || []
          this.treeData = treeData
        })
        .catch(e => {
          this.treeData = []
          this.$showFailure(e)
        })
    },
    isValid() {
      this.$refs.firstForm.validate(valid => {
        return valid
      })
    },
    async next() {
      const canNext = await this.nextJudge()
      if (canNext) {
        if (this.$parent.strategyType === 'ACCESS_DATAMASK_TABLE') {
          this.clickChild('step', { step: 2, prevStep: 1 })
        } else {
          this.clickChild('step', { step: 3, prevStep: 1 })
        }
      }
    },
    nextJudge() {
      let result = false
      this.$refs.firstForm.validate(valid => {
        if (valid) {
          result = true
        } else {
          result = false
        }
      })
      return result
    },
    checkPolicyName(rule, value, callback) {
      let mess =
        rule.field == 'securityStrategyName'
          ? this.$t('accessStrategy.selectSecurityPolicy')
          : this.$t('securityModule.placeSelect')
      if (
        (rule.field == 'securityStrategyName' &&
          this.firstData.securityStrategyId) ||
        (rule.field == 'catalogName' && this.firstData.catalogName)
      ) {
        callback()
      } else {
        callback(new Error(mess))
      }
    },
    // 打开安全策略选择弹窗
    openPolicyDialog() {
      this.$refs.policy.blur()
      this.pagination = {
        pageNum: 1,
        pageSize: 20,
        total: 0,
      }
      this.showPolicyDialog = true
      this.getPolicyTable('')
      this.$refs.policyTable && this.$refs.policyTable.clearSingleSelect()
    },
    // 选择目录
    openDirector() {
      this.$refs.catalogName.blur()
      this.directory = true
      // this.$refs.tree && this.$refs.tree.$refs.tree.setCurrentKey(null)
    },
    /**
     * =================================  选择安全策略弹框内容  =====================================
     */
    // 加载安全策略
    getPolicyTable(name) {
      let param = {
        securityPolicyName: name,
      }
      this.loading = true
      API.getControlList({ ...param, ...this.pagination })
        .then(res => {
          this.loading = false
          this.policyData = res.data.data.content
          this.pagination.total = res.data.data.totalElements
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    // 关闭安全策略选择弹窗
    closePolicyDialog() {
      this.beforeClose()
    },
    beforeClose() {
      this.showPolicyDialog = false
      this.selectedPolicy = {}
      this.policyKeyword = ''
    },
    confirmPolicy() {
      this.firstData.securityStrategyId = this.selectedPolicy.id
      this.firstData.securityStrategyName = this.selectedPolicy.name
      this.closePolicyDialog()
    },
    searchPolicyByKeyword() {
      this.getPolicyTable(this.policyKeyword)
    },
    handlePolicySelect(row) {
      this.selectedPolicy = row
    },
    handlePriorityChange(value) {
      console.log(value)
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.getPolicyTable(this.policyKeyword)
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.getRegulation(this.policyKeyword)
    },
    dataIconFunction(data) {
      return data.icon
        ? window.setting.iconApiPathName +
            '/datasecurity/datasecurity/structure/icon/' +
            data.icon
        : folder
    },
    /**
     * =================================  选择访问策略目录  =====================================
     */
    handleNodeClick(data) {
      this.selectGra = data
    },
    sure() {
      this.directory = false
      this.firstData.catalogName = this.selectGra.name
      this.firstData.catalogId = this.selectGra.catalogId
    },
    close() {
      this.beforeCloseTree()
    },
    beforeCloseTree() {
      this.directory = false
      this.selectGra = null
    },
  },
  watch: {
    treeKey(val) {
      this.$refs.tree.$refs.tree.filter(val)
    },
    initData: {
      handler() {
        this.firstData = _.cloneDeep(this.initData)
      },
      immediate: true,
      deep: true,
    },
    catalogInfo: {
      handler(val) {
        if (!this.initData.id) {
          this.firstData.catalogName = val.catalogName
          this.firstData.catalogId = val.catalogId
        }
      },
      immediate: true,
      deep: true,
    },
  },
}
</script>

<style scoped lang="scss">
.tree-box {
  position: absolute;
  top: 42px;
  bottom: 0;
  left: 20px;
  right: 20px;
  overflow-y: auto;
}
</style>
