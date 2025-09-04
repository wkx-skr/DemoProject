const CLASS_PREFIX = 'com.datablau.dam.data.tagrule.'
const CLASS_PREFIX_NEW = 'com.andorj.model.common.tag.rule.'
const GlobalTagProperty = {
  G_NONE: {
    label: '不限',
    value: 'G_NONE',
  },
  G_NAME: {
    label: '物理名称',
    value: 'G_NAME',
  },
  G_ALIAS: {
    label: '逻辑名称',
    value: 'G_ALIAS',
  },
  G_DESCRIPTION: {
    label: '描述',
    value: 'G_DESCRIPTION',
  },
}
const TargetType = new Map()
TargetType.set(82800009, '元数据')
TargetType.set(80010001, '数据源')
TargetType.set(82800002, '报表')
TargetType.set(80000000, '应用系统')
export default {
  data() {
    return {
      threshold: 80,
      enable: false,
      rulesInitial: null,
      rules: null,
      ruleType: 'meta',
      tagId: null,
      ruleName: '',
      ruleDescription: '',

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

      matchAll: false,
      keywords: [],
      targetField: null,
      targetTypeId: null,
      taggableObjects: [],
    }
  },
  props: ['tagDetail', 'currentRule', 'isMeta', 'currentThreshold'],
  created() {
    if (this.currentThreshold) {
      this.threshold = this.currentThreshold
    }
    this.getTaggableObjects()
  },
  methods: {
    getTaggableObjects() {
      // 获取所有可以打标签的对象和可以用来分析的属性
      this.$http
        .get(this.$url + '/service/tags/taggableObjects')
        .then(res => {
          res.data.forEach(item => {
            try {
              if (item.name === '元数据') {
                const idx = item.fieldNames.indexOf('数据源名称')
                item.fieldNames.splice(idx, 1)
              }
            } catch (e) {}
          })
          this.taggableObjects = res.data
          this.targetTypeId = 82800009
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
    encodeRule(rawRule) {
      const rawData = _.cloneDeep(rawRule)
      const encodeNode = node => {
        switch (node['@class']) {
          case 'com.andorj.model.common.tag.rule.AndTagRule':
            node['@class'] = 'com.datablau.dam.data.tagrule.MetaAndRule'
            break
          case 'com.andorj.model.common.tag.rule.OrTagRule':
            node['@class'] = 'com.datablau.dam.data.tagrule.MetaOrRule'
            break
          case 'com.andorj.model.common.tag.rule.NotTagRule':
            node['@class'] = 'com.datablau.dam.data.tagrule.MetaNotRule'
            break
        }
        if (node.subRules) {
          node.rules = node.subRules
          delete node.subRules
          node.rules.forEach(subNode => {
            encodeNode(subNode)
          })
        }
      }
      encodeNode(rawData)
      return [rawData]
    },
    decodeRule(encodedRule) {
      const rawData = _.cloneDeep(encodedRule[0])
      const decodeNode = node => {
        if (node['@class'].includes(CLASS_PREFIX)) {
          switch (node['@class']) {
            case 'com.datablau.dam.data.tagrule.MetaAndRule':
              node['@class'] = 'com.andorj.model.common.tag.rule.AndTagRule'
              break
            case 'com.datablau.dam.data.tagrule.MetaOrRule':
              node['@class'] = 'com.andorj.model.common.tag.rule.OrTagRule'
              break
            case 'com.datablau.dam.data.tagrule.MetaNotRule':
              node['@class'] = 'com.andorj.model.common.tag.rule.NotTagRule'
              break
            default:
              node['@class'] = node['@class'].replace(
                CLASS_PREFIX,
                CLASS_PREFIX_NEW
              )
              break
          }
        }
        if (node.rules) {
          node.subRules = node.rules
          delete node.rules
          node.subRules.forEach(subNode => {
            decodeNode(subNode)
          })
        }
      }
      decodeNode(rawData)
      return rawData
    },
    getRules() {
      if (this.currentRule) {
        this.rules = this.encodeRule(this.currentRule.rule)
        this.ruleName = this.currentRule.ruleName
        this.ruleDescription = this.currentRule.ruleDescription
      } else {
        this.rules = this.encodeRule({
          '@class': 'com.andorj.model.common.tag.rule.AndTagRule',
          subRules: [],
        })
      }
      const testRules = {
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
      }
      this.rulesInitial = _.cloneDeep(this.rules)
      this.drawRules()
      // this.$http.get(this.$url + `/service/ruletag/${this.tagId}`).then(res=>{
      //   if(res.data){
      //     let rawData = res.data;
      //     ({ threshold : this.threshold,enabled:this.enable } = rawData);
      //     if(res.data.type === 'REG_EXP'){
      //       this.ruleType = 'regex';
      //       if(rawData.ruleContent.indexOf('&')> -1){
      //         this.regex = decodeURIComponent(rawData.ruleContent.split('&')[1].split('=')[0]);
      //       }else{
      //         this.regex = rawData.ruleContent;
      //       }
      //     }else if(rawData.type === 'CUSTOM') {
      //       this.ruleType = 'custom';
      //       this.rules = JSON.parse(res.data.ruleContent).rules;
      //       this.rulesInitial = res.data.ruleContent;
      //       this.drawRules();
      //     }else if(rawData.type==='CUSTOM_META'){
      //       this.ruleType = 'meta';
      //       this.rules = JSON.parse(res.data.ruleContent).rules;
      //       this.rulesInitial = res.data.ruleContent;
      //       this.drawRules();
      //     }
      //   }else{
      //     this.ruleType = null;
      //   }
      // }).catch(e=>{
      //   this.$showFailure(e);
      // });
    },
    drawRules() {
      $('.tag-rule').append($('.options'))
      $('#rule-map').html('')
      this.drawRule(this.rules, '')
    },
    drawRule(rules, preIndex) {
      rules &&
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
      if (customRuleType && customRuleType.includes('.')) {
        customRuleType = customRuleType.split('.')[1]
      }
      this.customRuleType = customRuleType
      this.showRuleForm = true
      // if(current.field){
      //   this.field = current.field;
      // }
      this.targetTypeId = current.targetTypeId
      this.targetField = current.targetField
      switch (customRuleType) {
        case 'KeywordTagRule':
          this.keywordLookUpSet = current.keywords.join(',')
          this.caseInsensitive = current.caseInsensitive
          this.matchAll = current.matchAll
          break
        case 'LengthTagRule':
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
      if (current.targetTypeId) {
        current['@class'] = CLASS_PREFIX_NEW + this.customRuleType
      }
      current.targetField = this.targetField
      current.targetTypeId = this.targetTypeId
      switch (this.customRuleType) {
        case 'KeywordTagRule':
          current.keywords = this.keywordLookUpSet
            .replace(/，/g, ',')
            .split(',')
          current.matchAll = this.matchAll
          current.caseInsensitive = this.caseInsensitive
          break
        case 'LengthRule':
          current.min = this.minLength
          current.max = this.maxLength
          break
        case 'LengthTagRule':
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

      let customRuleType = className.substring(CLASS_PREFIX.length)
      if (customRuleType.includes('.')) {
        customRuleType = customRuleType.split('.')[1]
      }
      switch (customRuleType) {
        case 'KeywordTagRule':
          return (
            `对“${TargetType.get(
              rule.targetTypeId
            )}”按“${this.fieldLabelFormatter(rule.targetField)}”` +
            `进行关键字匹配: ${rule.keywords.join(',')}. ` +
            (rule.caseInsensitive ? '忽略大小写' : '')
          )
        case 'LengthTagRule':
          return (
            `对“${TargetType.get(
              rule.targetTypeId
            )}”按“${this.fieldLabelFormatter(rule.targetField)}”` +
            `进行长度匹配: ${rule.min} - ${rule.max}`
          )
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
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    saveCustom() {
      let rules = null
      const json = JSON.stringify(this.rules)
      rules = JSON.parse(json.replace(/,{}|{},|{}/g, ''))
      const rule = this.decodeRule(rules)
      this.$emit('saveRules', rule, this.threshold)
      // if (this.currentRule) {
      //   const requestBody = {
      //     tagId: this.tagDetail.tagId,
      //     ruleId: this.currentRule.ruleId,
      //     ruleName: this.ruleName,
      //     ruleDescription: this.ruleDescription,
      //     rule: rule
      //   }
      //   this.$http.put(this.$url + `/service/tags/rules/${this.currentRule.ruleId}`, requestBody).then(res => {
      //     this.showRuleForm = false
      //     this.$emit('update-list')
      //     this.$emit('close')
      //   }).catch(e => {
      //     this.$showFailure(e)
      //   })
      // } else {
      //   const requestBody = {
      //     tagId: this.tagDetail.tagId,
      //     ruleName: this.ruleName,
      //     ruleDescription: this.ruleDescription,
      //     rule: rule
      //   }
      //   this.$http.post(this.$url + `/service/tags/rules`, requestBody).then(res => {
      //     this.showRuleForm = false
      //     this.$emit('update-list')
      //     this.$emit('close')
      //   }).catch(e => {
      //     this.$showFailure(e)
      //   })
      // }

      // let requestBody = { rules : rules };
      // this.$http.post(requestUrl,requestBody).then(res=>{
      //   this.$message.success('规则保存成功');
      //   if(this.enable){
      //     this.enableRule();
      //   }
      // }).catch(e=>{
      //   this.$showFailure(e);
      // });
    },
    handleClose() {
      this.$emit('close')
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
        case 'KeywordTagRule':
          return this.keywordLookUpSet && this.targetField && this.targetTypeId
        case 'LengthTagRule':
          return this.minLength && this.maxLength
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
    // if(this.tagId){
    //   this.getRules();
    // }
    this.getRules()
    this.addHoverResponse()
  },
  watch: {
    currentEditingPath(path) {
      $('.shape').removeClass('is-editing')
      $('.shape[data-id="' + path + '"]').addClass('is-editing')
    },
    targetTypeId(newVal, oldVal) {
      if (oldVal) {
        this.targetField = null
      }
    },
  },
  beforeMount() {
    // this.tagId = this.tagDetail.tagId;
  },
  beforeDestroy() {},
}
