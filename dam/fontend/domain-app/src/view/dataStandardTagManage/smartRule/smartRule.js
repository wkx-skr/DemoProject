// import editRule from './editRule.vue'
// import Graph from './graph.vue'
import multipleTagRule from '@/view/dataStandardTagManage/smartRule/multipleTagRule.vue'
import regexTagRule from '@/view/dataStandardTagManage/smartRule/regexTagRule.vue'
export default {
  components: {
    // editRule,
    multipleTagRule,
    regexTagRule,
  },
  props: {
    tagDetail: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      taggableObjects: null,
      rules: [],
      loading: false,
      currentRule: null,
      currentRuleId: null,
      dialogVisible: false,
      isRegex: false,
    }
  },
  mounted() {
    this.getRulesOfTag()
    this.getTaggableObjects()
  },
  methods: {
    getTaggableObjects() {
      // 获取所有可以打标签的对象和可以用来分析的属性
      this.$http
        .get(this.$url + '/service/tags/taggableObjects')
        .then(res => {
          console.log(res.data, 678)
          res.data.forEach(item => {
            try {
              if (item.name === '元数据') {
                const idx = item.fieldNames.indexOf('数据源名称')
                item.fieldNames.splice(idx, 1)
              }
            } catch (e) {}
          })
          this.taggableObjects = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    fieldLabelFormatter(field) {
      switch (field) {
        case 'G_NAME':
          return '物理名称'
        case 'G_ALIAS':
          return '逻辑名称'
        case 'G_DESCRIPTION':
          return '描述'
        default:
          return field
      }
    },
    createRules() {
      // 创建一个规则并和标签绑定, 成功之后返回指定标签绑定的所有规则
      const requestBody = {
        tagId: this.tagId,
        ruleName: '测试规则',
        ruleDescription: '测试规则描述',
        rule: {
          '@class': 'com.andorj.model.common.tag.rule.AndTagRule',
          subRules: [
            {
              '@class': 'com.andorj.model.common.tag.rule.KeywordTagRule',
              keywords: ['name', 'id', 'address'],
              matchAll: false,
              caseInsensitive: true,
              targetTypeId: 82800009,
              targetField: 'G_NAME',
            },
            {
              '@class': 'com.andorj.model.common.tag.rule.LengthTagRule',
              min: 3,
              max: 20,
              targetTypeId: 82800009,
              targetField: 'G_NAME',
            },
          ],
        },
      }
      this.$http
        .post(this.$url + '/service/tags/rules', requestBody)
        .then(res => {
          console.log(res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateRules() {
      // 更新一个规则
      const requestBody = {
        tagId: this.tagId,
        ruleId: 1,
        ruleName: '测试规则',
        ruleDescription: '测试规则描述',
        rule: {
          '@class': 'com.andorj.model.common.tag.rule.AndTagRule',
          subRules: [
            {
              '@class': 'com.andorj.model.common.tag.rule.KeywordTagRule',
              keywords: ['name', 'id', 'address'],
              matchAll: false,
              caseInsensitive: true,
              targetTypeId: 82800009,
              targetField: 'G_NAME',
            },
            {
              '@class': 'com.andorj.model.common.tag.rule.LengthTagRule',
              min: 3,
              max: 20,
              targetTypeId: 82800009,
              targetField: 'G_NAME',
            },
          ],
        },
      }
      const ruleId = 1 // todo
      this.$http
        .put(this.$url + `/service/tags/rules/${ruleId}`, requestBody)
        .then(res => {
          console.log(res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTagsByRecommendations() {
      // 获取指定对象的推荐的标签的ID列表
      const typeId = ''
      const itemId = ''
      this.$http
        .get(
          this.$url +
            `/service/tags/recommendations/types/${typeId}?itemId=${itemId}`
        )
        .then(res => {})
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getRulesOfTag() {
      // 获取一个标签的所有规则
      const tagId = this.tagId
      this.loading = true
      this.$http
        .get(this.$url + `/service/tags/rules/tags/${tagId}`)
        .then(res => {
          if (res.data) {
            this.rules = res.data
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.loading = false
        })
    },
    deleteRules({ ruleId, ruleName }) {
      // 删除一个规则, 如果规则存在，则会返回规则对应的标签的所有剩余规则，否则返回null
      this.$DatablauCofirm(`确定要删除规则“${ruleName}”吗？`, '', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          this.$http
            .delete(this.$url + `/service/tags/rules/${ruleId}`)
            .then(res => {})
            .catch(e => {
              this.$showFailure(e)
            })
            .then(() => {
              this.getRulesOfTag()
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '操作已取消',
          })
        })
    },
    addRule() {
      this.isRegex = false
      this.currentRule = null
      this.currentRuleId = 'add'
    },
    addRegexRule() {
      this.isRegex = true
      this.currentRule = null
      this.currentRuleId = 'add'
    },
    editRule(row) {
      this.isRegex = !!row.rule['@class'].includes('RegexTagRule')
      this.currentRule = row
      this.currentRuleId = row.ruleId
    },
    handleClose() {
      this.handleDialogClose()
      this.dialogVisible = false
    },
    handleDialogClose() {
      this.currentRuleId = null
      this.currentRule = null
    },
  },
  computed: {
    tagId() {
      return this.tagDetail.tagId
    },
  },
  watch: {
    currentRuleId(newValue) {
      if (newValue) {
        this.dialogVisible = true
      } else {
        this.dialogVisible = false
      }
    },
  },
}
