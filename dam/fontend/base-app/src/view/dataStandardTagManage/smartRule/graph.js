const CLASS_PREFIX = 'com.andorj.model.common.tag.rule.'
export default {
  props: {
    editMode: {
      type: Boolean,
      default: false,
    },
    appendMode: {
      type: Boolean,
      default: false,
    },
    rule: {
      type: Object,
    },
    tagDetail: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dom: null,
      dialogVisible: false,
      lastClicked: { path: '0', isAndOrOr: true },
      rules: {
        tagId: this.tagId,
        ruleName: '测试规则',
        ruleDescription: '测试规则描述',
        rules: {
          '@class': 'com.andorj.model.common.tag.rule.AndTagRule',
          // subRules: [{
          //   '@class': 'com.andorj.model.common.tag.rule.KeywordTagRule',
          //   keywords: ["name", "id", "address"],
          //   matchAll: false,
          //   caseInsensitive: true,
          //   targetTypeId: 82800009,
          //   targetField: "G_NAME"
          // }, {
          //   '@class': "com.andorj.model.common.tag.rule.LengthTagRule",
          //   min: 3,
          //   max: 20,
          //   targetTypeId: 82800009,
          //   targetField: 'G_NAME'
          // }]
        },
      },
      currentEditingObject: null,
      showRuleForm: false,
    }
  },
  beforeMount() {
    console.log(this.editMode, this.appendMode, this.rule, this.tagDetail)
    if (this.appendMode) {
      setTimeout(() => {
        this.dialogVisible = true
        setTimeout(() => {
          this.addRootShape()
          this.addHoverResponse()
        })
      }, 150)
    }
  },
  mounted() {
    setTimeout(() => {})
  },
  methods: {
    handleCloseDialog() {
      this.$emit('close')
    },
    addRootShape() {
      this.rules = {
        tagId: this.tagDetail.tagId,
        ruleName: '',
        ruleDescription: '',
        rules: {
          '@class': CLASS_PREFIX + 'AndTagRule',
          subRules: [],
        },
      }
      this.drawRules()
    },
    drawRules() {
      // $(this.$el).append($('.options'))
      if (!this.dom) {
        this.dom = $(this.$refs.ruleMap)
      }

      this.dom.html('')
      this.drawRule(this.rules.rules, '')
    },
    drawAnd(path) {
      let dom = null
      if (path === '0') {
        dom = this.dom
      }
      const html = `<div class="shape shape-and" data-id="${path}">
        <div class="btn-bar">
          <i class="el-icon-more more" title=""/>
        </div>
      </div>`
      $(dom).append(html)
    },
    drawRule(rules, preIndex) {
      console.log(rules)
      if (rules['@class'].includes('AndTagRule')) {
        if (preIndex) {
        } else {
          // ROOT
          this.drawAnd('0')
        }
      }

      return
      rules.forEach((value, index) => {
        if (value['@class']) {
          if (value['@class'].indexOf('AndRule') > -1) {
            if (preIndex) {
              this.drawAdd(preIndex + '/' + index, value)
              this.drawRule(value.rules, preIndex + '/' + index)
            } else {
              // ROOT
              this.drawAdd(String(index), value)
              this.drawRule(value.rules, String(index))
            }
          } else if (value['@class'].indexOf('OrRule') > -1) {
            this.drawOr(preIndex + '/' + index, value)
            this.drawRule(value.rules, preIndex + '/' + index)
          } else if (value['@class'].indexOf('NotRule') > -1) {
            this.drawNot(preIndex + '/' + index, value.rule)
          } else {
            this.drawNormal(preIndex + '/' + index, value)
          }
        } else {
          this.drawNormal(preIndex + '/' + index, value)
        }
      })
    },
    getObjectAndNodeByPath(path) {
      const pathArr = path.split('/')
      pathArr.forEach((item, index, array) => {
        array[index] = parseInt(item)
      })
      let tmp = this.rules.rules
      pathArr.forEach(item => {
        if (Array.isArray(tmp)) {
          tmp = tmp[item]
        } else if (Array.isArray(tmp.rules)) {
          tmp = tmp.rules[item]
        }
      })
      const dom = $('[data-id="' + path + '"]')
      return {
        object: tmp,
        dom: dom,
      }
    },
    appendAdd() {
      const path = this.lastClicked.path
      const { object, dom } = this.getObjectAndNodeByPath(path)
      console.log(path, object)
      object.subRules.push({
        '@class': CLASS_PREFIX + 'AndTagRule',
        subRules: [],
      })
      this.currentEditingObject = null
      this.showRuleForm = false
      console.log('123')
      // this.drawRules();
    },
    appendOr() {
      const path = this.lastClicked.path
      const { object, dom } = this.getObjectAndNodeByPath(path)

      if (this.ruleType === 'custom') {
        object.rules.push({
          '@class': CLASS_PREFIX + 'OrRule',
          rules: [],
        })
      } else if (this.ruleType === 'meta') {
        object.rules.push({
          '@class': CLASS_PREFIX + 'MetaOrRule',
          rules: [],
        })
      }
      this.currentEditingObject = null
      this.showRuleForm = false
      this.drawRules()
    },
    editSelf() {
      const path = this.lastClicked.path
      const { object, dom } = this.getObjectAndNodeByPath(path)
      this.currentEditingPath = path
      if (!object['@class']) {
        this.currentEditingObject = object
        this.produceRuleForm(object)
      } else if (
        object['@class'].indexOf('NotRule') > -1 &&
        !object.rule['@class']
      ) {
        this.currentEditingObject = object.rule
        this.produceRuleForm(object.rule)
      } else if (object['@class'].indexOf('NotRule') > -1) {
        this.currentEditingObject = object.rule
        this.produceRuleForm(object.rule)
      } else {
        this.currentEditingObject = object
        this.produceRuleForm(object)
      }
      this.showRuleForm = true
    },
    appendNormal() {
      const path = this.lastClicked.path
      const { object, dom } = this.getObjectAndNodeByPath(path)

      object.rules.push({})
      this.currentEditingObject = object.rules[object.rules.length - 1]
      this.customRuleType = null
      this.currentEditingPath = path + '/' + (object.rules.length - 1)
      this.drawRules()

      this.showRuleForm = true
    },
    appendNot() {
      const path = this.lastClicked.path
      const { object, dom } = this.getObjectAndNodeByPath(path)

      if (this.ruleType === 'custom') {
        object.rules.push({
          '@class': CLASS_PREFIX + 'NotRule',
          rule: {},
        })
      } else if (this.ruleType === 'meta') {
        object.rules.push({
          '@class': CLASS_PREFIX + 'MetaNotRule',
          rule: {},
        })
      }
      this.currentEditingObject = object.rules[object.rules.length - 1].rule
      this.customRuleType = null
      this.currentEditingPath = path + '/' + (object.rules.length - 1)
      this.drawRules()
      this.showRuleForm = true
    },
    deleteSelf() {
      this.$confirm(
        '确定要执行删除操作吗？将删除该节点及以下的全部内容，且不可恢复',
        '',
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.executeDelete()
        })
        .catch(() => {})
    },
    executeDelete() {
      const path = this.lastClicked.path
      const { object, dom } = this.getObjectAndNodeByPath(path)
      const parentPathArr = path.split('/')
      const lastPath = parentPathArr.pop()
      const parentPath = parentPathArr.join('/')
      const { object: parentObject } = this.getObjectAndNodeByPath(parentPath)
      parentObject.rules.splice(Number.parseInt(lastPath), 1)
      this.currentEditingObject = null
      this.showRuleForm = false
      this.drawRules()
    },
    drawAdd(path, value) {
      let dom = null
      if (path === '0') {
        dom = $('#rule-map')
      } else {
        dom = this.getParentDom(path)
      }
      const html = `<div class="shape shape-and" data-id="${path}">
        <div class="btn-bar">
          <i class="el-icon-more more" title=""/>
        </div>
      </div>`
      $(dom).append(html)
    },
    addHoverResponse() {
      const self = this
      const root = this.dom
      root.on('mouseenter', '.shape', function () {
        $('.shape').removeClass('outline')
        $(this).addClass('outline')
        $(document).click()
      })
      root.on('mouseleave', '.shape', function (e) {
        $(this).removeClass('outline')
        $(this).parent().addClass('outline')
      })
      root.on('click', '.btn-bar', function (e) {
        if (!$(e.target).hasClass('graph-options')) {
          setTimeout(() => {
            $(document).one('click', function (e) {
              options.hide()
            })
          })
        }
        const $this = $(this)
        const parentNode = $this.parent()
        if (parentNode.attr('data-id')) {
          self.lastClicked = {
            path: parentNode.attr('data-id'),
            isAndOrOr:
              parentNode.hasClass('shape-and') ||
              parentNode.hasClass('shape-or'),
          }
        }
        const options = $('.graph-options')
        $this.append(options)
        options.show()
      })
    },
  },
  computed: {},
}
