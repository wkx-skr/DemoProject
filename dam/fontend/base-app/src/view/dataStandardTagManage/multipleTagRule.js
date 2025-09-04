const CLASS_PREFIX = 'com.datablau.dam.data.tagrule.'
export default {
  data() {
    return {
      threshold: 80,
      enable: false,
      rulesInitial: null,
      rules: null,
      ruleType: 'custom',
      tagId: null,

      testCase: '',
      testResult: '',

      lastClicked: { path: '0', isAndOrOr: true },
      currentEditingPath: null,
      currentEditingObject: null,
      showRuleForm: false,

      customRuleType: 'LengthRule',
      minLength: undefined,
      maxLength: undefined,

      prefix: '',
      postfix: '',

      containsEnable: false,
      containsChChar: 'CAN',
      containsEnChar: 'CAN',
      containsNumber: 'CAN',
      caseInsensitive: true,

      substringEnable: false,
      indexFromPositive: true,
      indexToPositive: true,
      indexFrom: 1,
      indexTo: 1,
      substringSet: '',
      substringFrom: '',
      substringTo: '',
      isRange: true,

      keywordLookUpEnable: false,
      keywordLookUpSet: '',
      keywordLookUpMin: 1,
      keywordLookUpMax: 10,

      regex: '',

      field: 'NAME', // NAME, ALIAS, DESC,
      fieldLabel: {
        NAME: '物理名称',
        ALIAS: '逻辑名称',
        DESC: '描述',
      },
    }
  },
  props: ['tagDetail'],
  methods: {
    getRules() {
      this.$http
        .get(this.$url + `/service/ruletag/${this.tagId}`)
        .then(res => {
          if (res.data) {
            const rawData = res.data
            ;({ threshold: this.threshold, enabled: this.enable } = rawData)
            if (res.data.type === 'REG_EXP') {
              this.ruleType = 'regex'
              if (rawData.ruleContent.indexOf('&') > -1) {
                this.regex = decodeURIComponent(
                  rawData.ruleContent.split('&')[1].split('=')[0]
                )
              } else {
                this.regex = rawData.ruleContent
              }
            } else if (rawData.type === 'CUSTOM') {
              this.ruleType = 'custom'
              this.rules = JSON.parse(res.data.ruleContent).rules
              this.rulesInitial = res.data.ruleContent
              this.drawRules()
            } else if (rawData.type === 'CUSTOM_META') {
              this.ruleType = 'meta'
              this.rules = JSON.parse(res.data.ruleContent).rules
              console.log(this.rules)
              this.rulesInitial = res.data.ruleContent
              this.drawRules()
            }
          } else {
            this.ruleType = null
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    drawRules() {
      $('.tag-rule').append($('.options'))
      $('#rule-map').html('')
      this.drawRule(this.rules, '')
    },
    drawRule(rules, preIndex) {
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
    getParentDom(path) {
      const parentPathArr = path.split('/')
      parentPathArr.pop()
      const parentPath = parentPathArr.join('/')
      return $('[data-id="' + parentPath + '"]')
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
    drawOr(path, value) {
      let dom = null
      if (path === '0') {
        dom = $('#rule-map')
      } else {
        dom = this.getParentDom(path)
      }
      const html = `<div class="shape shape-or" data-id="${path}">
        <div class="btn-bar">
          <i class="el-icon-more more" title=""/>
        </div>
      </div>`
      $(dom).append(html)
    },
    drawNormal(path, value) {
      const dom = this.getParentDom(path)
      const html = `<div class="shape shape-normal" data-id="${path}">
         <div>${this.ruleFormatter(value)}</div>
         <span class="editing-label">该模块正处于编辑状态，请在下方表单中编辑</span>
        <div class="btn-bar">
          <i class="el-icon-more more" title=""/>
        </div>
      </div>`
      $(dom).append(html)
    },
    drawNot(path, value) {
      const dom = this.getParentDom(path)
      const html = `<div class="shape shape-not" data-id="${path}">
         <div>${this.ruleFormatter(value)}</div>
         <span class="editing-label">该模块正处于编辑状态，请在下方表单中编辑</span>
        <div class="btn-bar">
          <i class="el-icon-more more" title=""/>
        </div>
      </div>`
      $(dom).append(html)
    },
    addHoverResponse() {
      const self = this
      const root = $('#rule-map')
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
        if (!$(e.target).hasClass('option')) {
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
        const options = $('.options')
        $this.append(options)
        options.show()
      })
    },
    getObjectAndNodeByPath(path) {
      const pathArr = path.split('/')
      pathArr.forEach((item, index, array) => {
        array[index] = parseInt(item)
      })
      let tmp = this.rules
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
      if (this.ruleType === 'custom') {
        object.rules.push({
          '@class': CLASS_PREFIX + 'AndRule',
          rules: [],
        })
      } else if (this.ruleType === 'meta') {
        object.rules.push({
          '@class': CLASS_PREFIX + 'MetaAndRule',
          rules: [],
        })
      }

      this.currentEditingObject = null
      this.showRuleForm = false
      this.drawRules()
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
      this.$DatablauCofirm(
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
    addRootShape() {
      this.ruleType = 'custom'
      this.rules = []
      this.rules.push({
        '@class': CLASS_PREFIX + 'AndRule',
        rules: [],
      })
      this.drawRules()
    },
    addRootShapeForMeta() {
      this.ruleType = 'meta'
      this.rules = []
      this.rules.push({
        '@class': CLASS_PREFIX + 'MetaAndRule',
        rules: [],
      })
      this.drawRules()
    },

    produceRuleForm(current) {
      let customRuleType =
        current['@class'] && current['@class'].substring(CLASS_PREFIX.length)
      if (customRuleType === 'NotRule') {
        customRuleType = current.rule['@class'].substring(CLASS_PREFIX.length)
        current = current.rule
      }
      this.customRuleType = customRuleType
      this.showRuleForm = true
      if (current.field) {
        this.field = current.field
      }
      switch (customRuleType) {
        case 'LengthRule':
          this.minLength = current.min
          this.maxLength = current.max
          break
        case 'WordRule':
          this.containsNumber = current.num
          this.containsChChar = current.chinese
          this.containsEnChar = current.english
          break
        case 'StringPrefixRule':
          this.prefix = current.prefix
          break
        case 'MetaPrefixRule':
          this.prefix = current.prefix
          this.caseInsensitive = current.caseInsensitive
          break
        case 'MetaPostfixRule':
          this.postfix = current.postfix
          this.caseInsensitive = current.caseInsensitive
          break
        case 'StringPostfixRule':
          this.postfix = current.postfix
          break
        case 'MetaExpRule':
          this.regex = current.regex
          break
        case 'MetaContainsRule':
          this.keywordLookUpSet = current.keywords.join(',')
          this.caseInsensitive = current.caseInsensitive
          break
        case 'KeywordLookupRule':
          this.keywordLookUpSet = current.keywords.join(',')
          this.keywordLookUpMin = current.minTimes
          this.keywordLookUpMax = current.maxTimes
          break
        case 'SubStringInRangeRule':
          if (current.startIdx < 0) {
            this.indexFromPositive = false
            this.indexFrom = -current.startIdx
          } else {
            this.indexFromPositive = true
            this.indexFrom = current.startIdx + 1
          }
          if (current.endIdx < 0) {
            this.indexToPositive = false
            this.indexTo = -current.endIdx
          } else {
            this.indexToPositive = true
            this.indexTo = current.endIdx + 1
          }
          this.substringFrom = current.start
          this.substringTo = current.end
          break
        case 'SubStringInSetRule':
          if (current.startIdx < 0) {
            this.indexFromPositive = false
            this.indexFrom = -current.startIdx
          } else {
            this.indexFromPositive = true
            this.indexFrom = current.startIdx + 1
          }
          if (current.endIdx < 0) {
            this.indexToPositive = false
            this.indexTo = -current.endIdx
          } else {
            this.indexToPositive = true
            this.indexTo = current.endIdx + 1
          }
          this.substringSet = current.candidates.join(',')
          break
        default:
          return true
      }
    },
    submitOneRule() {
      const current = this.currentEditingObject
      current['@class'] = CLASS_PREFIX + this.customRuleType
      switch (this.customRuleType) {
        case 'LengthRule':
          current.min = this.minLength
          current.max = this.maxLength
          break
        case 'WordRule':
          current.num = this.containsNumber
          current.chinese = this.containsChChar
          current.english = this.containsEnChar
          break
        case 'MetaPrefixRule':
          current.caseInsensitive = this.caseInsensitive
          current.field = this.field
          current.prefix = this.prefix
          break
        case 'StringPrefixRule':
          current.caseInsensitive = true
          current.prefix = this.prefix
          break
        case 'MetaPostfixRule':
          current.caseInsensitive = this.caseInsensitive
          current.field = this.field
          current.postfix = this.postfix
          break
        case 'StringPostfixRule':
          current.caseInsensitive = true
          current.postfix = this.postfix
          break
        case 'MetaExpRule':
          current.caseInsensitive = this.caseInsensitive
          current.field = this.field
          current.regex = this.regex
          break
        case 'MetaContainsRule':
          current.caseInsensitive = this.caseInsensitive
          current.field = this.field
          current.keywords = this.keywordLookUpSet
            .replace(/，/g, ',')
            .split(',')
          break
        case 'KeywordLookupRule':
          current.keywords = this.keywordLookUpSet
            .replace(/，/g, ',')
            .split(',')
          current.minTimes = this.keywordLookUpMin
          current.maxTimes = this.keywordLookUpMax
          current.caseInsensitive = true
          break
        case 'SubStringInRangeRule':
          if (this.indexFromPositive) {
            current.startIdx = this.indexFrom - 1
          } else {
            current.startIdx = -this.indexFrom
          }
          if (this.indexToPositive) {
            current.endIdx = this.indexTo - 1
          } else {
            current.endIdx = -this.indexTo
          }
          current.start = this.substringFrom
          current.end = this.substringTo
          break
        case 'SubStringInSetRule':
          if (this.indexFromPositive) {
            current.startIdx = this.indexFrom - 1
          } else {
            current.startIdx = -this.indexFrom
          }
          if (this.indexToPositive) {
            current.endIdx = this.indexTo - 1
          } else {
            current.endIdx = -this.indexTo
          }
          current.candidates = this.substringSet.replace(/，/g, ',').split(',')
          break

        default:
          return true
      }
      this.currentEditingObject = null
      this.showRuleForm = false
      this.drawRules()
    },
    ruleFormatter(rule) {
      const className = rule['@class']
      if (!className) {
        return ''
      }
      const customRuleType = className.substring(CLASS_PREFIX.length)
      switch (customRuleType) {
        case 'LengthRule':
          return '长度限制: ' + rule.min + '-' + rule.max
        case 'WordRule':
          let label = '字符类型: '
          if (rule.chinese === 'MUST') {
            label += '一定含有汉字.'
          } else if (rule.chinese === 'MUSTNOT') {
            label += '一定不含汉字.'
          } else if (rule.chinese === 'CAN') {
            label += '可能含有汉字.'
          }
          if (rule.english === 'MUST') {
            label += '一定含有英文字母.'
          } else if (rule.english === 'MUSTNOT') {
            label += '一定不含英文字母.'
          } else if (rule.english === 'CAN') {
            label += '可能含有英文字母.'
          }
          if (rule.num === 'MUST') {
            label += '一定含有数字.'
          } else if (rule.num === 'MUSTNOT') {
            label += '一定不含数字.'
          } else if (rule.num === 'CAN') {
            label += '可能含有数字.'
          }
          return label
        case 'StringPrefixRule':
          return '前缀: ' + rule.prefix
        case 'MetaPrefixRule':
          return (
            `${this.fieldLabel[rule.field]} 前缀: ${rule.prefix}` +
            (!rule.caseInsensitive ? ' ,严格区分大小写' : '')
          )
        case 'StringPostfixRule':
          return '后缀: ' + rule.postfix
        case 'MetaPostfixRule':
          return (
            `${this.fieldLabel[rule.field]} 后缀: ${rule.postfix}` +
            (!rule.caseInsensitive ? ' ,严格区分大小写' : '')
          )
        case 'MetaExpRule':
          return `${this.fieldLabel[rule.field]} 正则表达式: ${rule.regex}`
        case 'MetaContainsRule':
          return (
            '关键字匹配:  ' +
            rule.keywords.toString() +
            '。' +
            (!rule.caseInsensitive ? ' ,严格区分大小写' : '')
          )
        case 'KeywordLookupRule':
          return (
            '关键字匹配:  ' +
            rule.keywords.toString() +
            '。出现次数限制' +
            rule.minTimes +
            '-' +
            rule.maxTimes
          )
        case 'SubStringInSetRule':
          label = ''
          label += '子字符串匹配，离散值域为：'
          label += rule.candidates ? rule.candidates.join(',') : ''
          label += '. 匹配索引范围: '
          if (rule.startIdx < 0) {
            label += '倒数第' + Math.abs(rule.startIdx) + '位'
          } else {
            label += '第' + (rule.startIdx + 1) + '位'
          }
          label += '到'
          if (rule.endIdx < 0) {
            label += '倒数第' + Math.abs(rule.endIdx) + '位'
          } else {
            label += '第' + (rule.endIdx + 1) + '位'
          }
          return label
        case 'SubStringInRangeRule':
          label = ''
          label += '子字符串匹配，连续值域为：'
          label += rule.start + '-' + rule.end
          label += '. 匹配索引范围: '
          if (rule.startIdx < 0) {
            label += '倒数第' + Math.abs(rule.startIdx) + '位'
          } else {
            label += '第' + (rule.startIdx + 1) + '位'
          }
          label += '到'
          if (rule.endIdx < 0) {
            label += '倒数第' + Math.abs(rule.endIdx) + '位'
          } else {
            label += '第' + (rule.endIdx + 1) + '位'
          }
          return label
        default:
          return customRuleType
      }
    },
    handleSave() {
      if (this.ruleType === 'custom' || this.ruleType === 'meta') {
        this.saveCustom()
      } else if (this.ruleType === 'regex') {
        this.saveRegex()
      }
    },
    saveRegex() {
      const threshold = this.threshold
      const requestUrl =
        this.$url + `/service/ruletag/${this.tagId}/reg?threshold=${threshold}`
      const requestBody = this.regex

      this.$plainRequest
        .post(requestUrl, requestBody)
        .then(res => {
          this.$message.success('规则保存成功')
          if (this.enable) {
            this.enableRule()
          }
          this.changeTreeIcon(true)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeTreeIcon(save) {
      if (save) {
        $('.el-tree-node.is-current .tree-icon')
          .addClass('in-use')
          .addClass('rule-set')
      } else {
        $('.el-tree-node.is-current .tree-icon')
          .removeClass('in-use')
          .removeClass('rule-set')
      }
    },
    saveCustom() {
      const threshold = this.threshold
      const requestUrl =
        this.$url +
        `/service/ruletag/${this.tagId}/custom/?threshold=${threshold}`
      let rules = null
      const json = JSON.stringify(this.rules)
      rules = JSON.parse(json.replace(/,{}|{},|{}/g, ''))
      const requestBody = { rules: rules }
      this.$http
        .post(requestUrl, requestBody)
        .then(res => {
          this.$message.success('规则保存成功')
          if (this.enable) {
            this.enableRule()
          }
          this.changeTreeIcon(true)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleChangeType() {
      this.$confirm('确定要切换规则类型吗？当前规则的内容将不会被保留', '', {
        type: 'warning',
      })
        .then(() => {
          this.deleteRule()
        })
        .catch(() => {})
    },
    handleDelete() {
      this.$DatablauCofirm('确定要执行删除操作吗？', '', {
        type: 'warning',
      })
        .then(() => {
          this.deleteRule()
        })
        .catch(() => {})
    },
    deleteRule() {
      this.$http
        .delete(this.$url + `/service/ruletag/${this.tagId}`)
        .then(res => {
          this.rules = null
          this.regex = ''
          this.getRules()
          this.changeTreeIcon(false)
        })
        .catch(e => {
          //        this.$showFailure(e);
          this.rules = null
          this.regex = ''
          this.getRules()
        })
    },
    enableRule() {
      this.$http
        .put(this.$url + `/service/ruletag/${this.tagId}/enable`)
        .then(res => {})
        .catch(e => {
          this.$showFailure(e)
        })
    },
    disableRule() {
      this.$http
        .put(this.$url + `/service/ruletag/${this.tagId}/disable`)
        .then(res => {
          // Todo
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleEnableChange(enable) {
      if (enable) {
        this.enableRule()
      } else {
        this.disableRule()
      }
    },
    handleTest() {
      if (this.ruleType === 'regex') {
        this.testReg()
      } else if (this.ruleType === 'custom' || this.ruleType === 'meta') {
        const rules = this.rules
        if (rules) {
          this.testCustom(rules)
        }
      }
    },
    testReg() {
      const requestUrl = this.$url + '/service/ruletag/test/reg'
      const requestBody = {
        regex: this.regex,
        delimiter: ',',
        content: this.testCase.replace(/，/g, ','),
      }
      this.$http
        .put(requestUrl, requestBody)
        .then(res => {
          this.testResultFormatter(requestBody.content, res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    testCustom(rules) {
      const requestUrl = this.$url + '/service/ruletag/test/custom'
      let rulesB = null
      const json = JSON.stringify(this.rules)
      rulesB = JSON.parse(json.replace(/,{}|{},|{}/g, ''))
      const requestBody = {
        delimiter: ',',
        checker: {
          rules: rulesB,
        },
        content: this.testCase.replace(/，/g, ','),
      }
      this.$http
        .put(requestUrl, requestBody)
        .then(res => {
          this.testResultFormatter(requestBody.content, res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    testResultFormatter(content, cnt) {
      if (typeof cnt === 'number') {
        let matchesCnt = 0
        if (content) {
          matchesCnt = content.split(',').length
        }
        this.testResult = `执行完毕，${cnt}条符合，共${matchesCnt}条`
      } else {
        this.testResult = cnt
      }
    },
    addRegexRule() {
      this.ruleType = 'regex'
    },
  },
  computed: {
    hasRule() {
      return this.rules
    },
    submitBtnEnabled() {
      if (!this.customRuleType) {
        return false
      }
      switch (this.customRuleType) {
        case 'LengthRule':
          return this.minLength && this.maxLength
        case 'StringPrefixRule':
          return this.prefix
        case 'StringPostfixRule':
          return this.postfix
        case 'KeywordLookupRule':
          return this.keywordLookUpSet
        case 'SubStringInRangeRule':
          return this.substringFrom && this.substringTo
        case 'SubStringInSetRule':
          return this.substringSet
        default:
          return true
      }
    },
  },
  mounted() {
    if (this.tagId) {
      this.getRules()
    }
    this.addHoverResponse()
  },
  watch: {
    currentEditingPath(path) {
      $('.shape').removeClass('is-editing')
      $('.shape[data-id="' + path + '"]').addClass('is-editing')
    },
  },
  beforeMount() {
    this.tagId = this.tagDetail.tagId
  },
  beforeDestroy() {},
}
