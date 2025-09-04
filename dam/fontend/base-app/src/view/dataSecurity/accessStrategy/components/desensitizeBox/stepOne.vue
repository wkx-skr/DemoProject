<template>
  <div style="position: absolute; bottom: 0; top: 72px; left: 0; right: 0">
    <datablau-form-submit ref="formSubmit">
      <datablau-form
        ref="firstForm"
        :model="firstData"
        :rules="firstRules"
        :validateNoScroll="true"
      >
        <el-form-item label="策略名称" prop="accessStrategyName">
          <datablau-input
            v-model="firstData.accessStrategyName"
            placeholder="请输入策略名称"
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
        <el-form-item label="策略描述">
          <datablau-input
            type="textarea"
            v-model="firstData.strategyDescribe"
            placeholder="请输入策略描述"
            style="width: 640px"
            :autosize="{
              minRows: 5,
              maxRows: 6,
            }"
            show-word-limit
            resize="none"
          ></datablau-input>
        </el-form-item>

        <el-form-item label="选择目录" prop="catalogName">
          <datablau-input
            ref="catalogName"
            v-model="firstData.catalogName"
            placeholder="请选择目录"
            style="width: 480px"
            @focus="openDirector"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <template slot="buttons">
        <div>
          <datablau-button type="normal" @click="next">下一步</datablau-button>
          <datablau-button class="cut-apart-btn" type="secondary" @click="back">
            取消
          </datablau-button>
        </div>
      </template>
    </datablau-form-submit>
    <datablau-dialog
      width="800"
      height="560"
      title="选择安全策略"
      :visible.sync="showPolicyDialog"
      v-if="showPolicyDialog"
      :before-close="beforeClose"
    >
      <div>
        <div class="policy-filter">
          <datablau-input
            placeholder="搜索安全策略名称"
            clearable
            v-model="policyKeyword"
            style="width: 240px"
          ></datablau-input>
          <datablau-button
            type="primary"
            @click="searchPolicyByKeyword"
            style="margin-left: 10px"
          >
            查询
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
            label="安全策略名称"
            prop="name"
            width="400px"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="数据所属部门"
            prop="deptName"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="创建人"
            prop="creator"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="创建时间"
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
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="confirmPolicy"
          :disabled="!selectedPolicy.id"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      :title="'选择目录'"
      size="s"
      height="350px"
      width="600px"
      :visible.sync="directory"
      v-if="directory"
      :before-close="beforeCloseTree"
    >
      <datablau-tree
        v-loading="treeLoading"
        @node-click="handleNodeClick"
        node-key="catalogId"
        :props="defaultProps"
        :data="treeData"
        :data-supervise="true"
        :data-img-function="dataIconFunction"
        ref="tree"
        empty-text="暂无目录信息"
      ></datablau-tree>
      <span slot="footer">
        <datablau-button type="secondary" @click="close">取消</datablau-button>
        <datablau-button type="important" :disabled="!selectGra" @click="sure">
          确定
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
            message: '请输入策略名称',
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
        rule.field == 'securityStrategyName' ? '请选择安全策略' : '请选择目录'
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
        ? window.setting.restApiPathName +
            '/service/ddc/config/icon/' +
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

<style scoped lang="scss"></style>
