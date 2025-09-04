<template>
  <div>
    <datablau-table :data="tableData" style="min-height: 200px">
      <el-table-column
        :label="$t('userPane.myTodo.ruleName')"
        prop="name"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <datablau-tooltip
            :content="$t('userPane.myTodo.noPermissions')"
            placement="bottom-start"
            :disabled="scope.row.hasAuthToView"
          >
            <datablau-button
              type="text"
              @click="jump2(scope.row)"
              :disabled="!scope.row.hasAuthToView"
            >
              {{ scope.row.name }}
            </datablau-button>
          </datablau-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('userPane.myTodo.ruleType')"
        :prop="
          commonData.processType === '技术规则'
            ? 'bigClassSelectOption'
            : 'category'
        "
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span v-if="commonData.processType === '技术规则'">
            {{ scope.row.bigClassSelectOption | bigClassFilter(bigClassList) }}
          </span>
          <span v-else>{{ scope.row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="commonData.processType === '技术规则'"
        :label="$t('userPane.myTodo.businessRule')"
        prop="buRuleName"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        v-if="commonData.processType === '业务规则'"
        :label="$t('userPane.myTodo.orgName')"
        prop="orgName"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('userPane.myTodo.creator')"
        prop="creator"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        v-if="commonData.processType === '技术规则'"
        :label="$t('userPane.myTodo.importance')"
        prop="importanceDisplayName"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('quality.page.dataQualityRules.table.operation')"
        prop="processState"
        show-overflow-tooltip
      ></el-table-column>
    </datablau-table>
  </div>
</template>
<script>
export default {
  props: {
    commonData: {
      type: Object,
      default: () => {
        return {}
      },
    },
    getDetailData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  filters: {
    bigClassFilter(value, bigClassList) {
      let result = ''
      bigClassList.forEach(e => {
        if (e.value === value) {
          result = e.label
        }
      })
      return result
    },
  },
  data() {
    return {
      bigClassList: [],
      tableData: null,
      importanceMap: {
        1: this.$t('quality.page.qualityRule.detail.importanceList.p1'),
        2: this.$t('quality.page.qualityRule.detail.importanceList.p2'),
        3: this.$t('quality.page.qualityRule.detail.importanceList.p3'),
      },
    }
  },
  watch: {
    commonData: {
      handler(val) {
        if (val) {
          this.getRuleInfo()
        }
      },
      deep: true,
      // immediate: true,
    },
  },
  created() {
    this.getBigClassListAndBusinessTypeList()
  },
  mounted() {},
  computed: {
    ruleType() {
      return this.commonData.processType
    },
  },
  methods: {
    getBigClassListAndBusinessTypeList() {
      this.$http
        .post(`${this.$url}/select/option/get`, {
          category: 'TR',
          names: ['规则大类'],
        })
        .then(res => {
          const classList = res.data.filter(e => e.optionName === '规则大类')
          classList.forEach(e => {
            const classObj = {
              id: e.id,
              label: e.optionValue,
              value: e.ruleCode,
            }
            this.bigClassList.push(classObj)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取规则详情
    getRuleInfo() {
      let url =
        this.commonData.processType === '技术规则'
          ? `${this.$quality_url}/workflow/techRules/getProcessDetail`
          : `${this.$quality_url}/workflow/businessRules/getProcessDetail` // 业务规则
      this.$http
        .post(`${url}?processInstanceId=${this.commonData.processInstanceId}`)
        .then(res => {
          let tempData = res.data
          tempData.forEach(item => {
            item.hasAuthToView = false
            if (this.commonData.processType === '技术规则') {
              if (
                (this.$user.username === item.creator &&
                  this.$auth.QUALITY_TECHNICAL_REGULATION_VIEW_MY) ||
                this.$auth.QUALITY_TECHNICAL_REGULATION_VIEW_ALL
              ) {
                item.hasAuthToView = true
              }
              item.importanceDisplayName =
                this.importanceMap[item.importance] || ''
            } else {
              if (
                (this.$user.username === item.creator &&
                  this.$auth.QUALITY_BUSINESS_RULE_VIEW_MY) ||
                this.$auth.QUALITY_BUSINESS_RULE_VIEW_ALL
              ) {
                item.hasAuthToView = true
              }
            }
          })
          this.tableData = tempData
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    jump2(row) {
      if (this.commonData.processType === '技术规则') {
        this.goTechRuleDetail(row)
      } else {
        this.gobuRuleDetail(row)
      }
    },
    // 跳转技术规则
    goTechRuleDetail(row) {
      window.open(
        this.BaseUtils.RouterUtils.getFullUrl('qualityRule', {
          id: row.ruleId,
          blank: true,
          copyId: row.copyId,
          copy: !!row.copyId,
          from: 'workflow',
        })
      )
      /* this.$http
        .post(this.$quality_url + '/quality/rule/tech/' + row.ruleId + '/check')
        .then(res => {
          if (row.hasAuthToView) {
            window.open(
              this.BaseUtils.RouterUtils.getFullUrl('qualityRule', {
                id: row.ruleId,
                blank: true,
                copyId: row.copyId,
                copy: !!row.copyId,
              })
            )
          }
        })
        .catch(err => {
          this.$message.error('您暂无权限访问')
        }) */
    },
    // 跳转业务规则
    gobuRuleDetail(row) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl +
          `main/dataQuality/rules?id=${
            row.ruleId
          }&copy=${!!row.copyId}&copyId=${row.copyId}&blank=true`
      )
      /* this.$http
        .post(this.$quality_url + '/quality/rule/bu/' + row.ruleId + '/check')
        .then(res => {
          if (row.hasAuthToView) {
            var pos = location.href.indexOf('#/')
            var baseUrl = location.href.slice(0, pos + 2)
            window.open(
              baseUrl +
                `main/dataQuality/rules?id=${
                  row.ruleId
                }&copy=${!!row.copyId}&copyId=${row.copyId}&blank=true`
            )
          }
        })
        .catch(err => {
          this.$message.error('您暂无权限访问')
        }) */
    },
  },
}
</script>
