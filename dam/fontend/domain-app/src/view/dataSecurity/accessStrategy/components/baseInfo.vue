<template>
  <div>
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
        <el-form-item label="策略描述" prop="strategyDescribe">
          <datablau-input
            type="textarea"
            v-model="firstData.strategyDescribe"
            placeholder="请输入策略描述"
            style="width: 800px"
            :autosize="{
              minRows: 5,
            }"
            show-word-limit
          ></datablau-input>
          <!-- resize="none" -->
        </el-form-item>

        <el-form-item label="选择目录" prop="catalogName">
          <datablau-input
            ref="selectGra"
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
      width="800px"
      :height="540"
      title="选择安全策略"
      :visible.sync="showPolicyDialog"
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
        <div class="table-box" style="height: 388px">
          <datablau-table
            :data="policyData"
            single-select
            height="100%"
            @selection-change="handlePolicySelect"
            ref="policyTable"
            v-loading="loading"
          >
            <el-table-column
              label="安全策略名称"
              prop="name"
              :win-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="数据所属部门"
              prop="deptName"
              :win-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="创建人"
              :win-width="120"
              prop="creator"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="创建时间"
              prop="createTime"
              :win-width="140"
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
      :height="480"
      width="600px"
      :destroy-on-close="true"
      :visible.sync="directory"
      v-if="directory"
    >
      <div class="tree-search-box">
        <datablau-input
          style="width: 100%"
          v-model="treeKey"
          :iconfont-state="true"
          clearable
          placeholder="搜索"
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
          empty-text="暂无目录信息"
        ></datablau-tree>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="close">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          :disabled="!selectGra.catalogId"
          @click="sure"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '../../util/api'
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
      pagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0,
      },
      loading: false,
      firstData: {
        priority: 3,
      },
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
      options: [],
      directory: false,
      treeData: [],
      defaultProps: {
        children: 'subNodes',
        label: 'name',
        isLeaf: 'leaf',
      },
      selectGra: {},
      resolve: null, // 如果目录懒加载
      treeLoading: false,
    }
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
    isValid() {
      this.$refs.firstForm.validate(valid => {
        return valid
      })
    },
    canNext() {
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
    async next() {
      const flag = await this.canNext()
      if (flag) {
        this.clickChild('step', { step: 2, prevStep: 1 })
      }
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
      this.$refs.selectGra.blur()
      this.treeKey = ''
      this.directory = true
      this.selectGra = {}
      this.getClassifyTree()
      this.getStrategyCatalog()
      // this.$refs.tree && this.$refs.tree.$refs.tree.setCurrentKey(null)
    },
    // 加载安全策略
    getPolicyTable(name) {
      let param = {
        securityPolicyName: name,
      }
      this.loading = true
      HTTP.getControlList({ ...param, ...this.pagination })
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
    handlePriorityChange(value) {},
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.getPolicyTable(this.policyKeyword)
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.getPolicyTable(this.policyKeyword)
    },
    dataIconFunction(data) {
      return data.icon
        ? window.setting.restApiPathName +
            '/service/ddc/config/icon/' +
            data.icon
        : folder
    },
    handleNodeClick(data) {
      this.selectGra = data
    },
    loadCallback(node, resolve) {
      this.resolve = resolve
      if (node.level === 0) {
        this.getClassifyTree(0)
      } else {
        this.getClassifyTree(node.data.id)
      }
    },
    getClassifyTree(id) {
      // this.treeLoading = true
    },
    sure() {
      this.directory = false
      this.firstData.catalogName = this.selectGra.name
      this.firstData.catalogId = this.selectGra.catalogId
    },
    close() {
      this.directory = false
    },
    getStrategyCatalog() {
      this.treeLoading = true
      HTTP.getStrategyCatalog()
        .then(res => {
          this.treeData = res.data.data.subNodes
          this.treeLoading = false
          this.$nextTick(() => {
            this.$refs.tree && this.$refs.tree.expandAllLevel()
            this.$refs.tree.$refs.tree.setCurrentKey(
              this.catalogInfo.catalogId || this.firstData.catalogId
            )
            if (this.initData.id) {
              this.selectGra = {
                catalogId: this.firstData.catalogId,
                name: this.firstData.catalogName,
              }
            } else {
              this.selectGra = {
                catalogId: this.catalogInfo.catalogName,
                name: this.catalogInfo.catalogId,
              }
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
          this.treeLoading = false
        })
    },
  },
  watch: {
    treeKey(val) {
      this.$nextTick(() => {
        this.$refs.tree.$refs.tree.filter(val)
      })
    },
    initData: {
      handler() {
        this.firstData = _.cloneDeep(this.initData)
        this.initData.id && (this.firstData.id = this.initData.id)
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
