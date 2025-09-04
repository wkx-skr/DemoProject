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
  },
  data() {
    return {
      formData: {
        ruleName: '',
        ruleDescription: '',
      },
      visible: false,
      rules: null,

      lastClicked: { path: '0', isAndOrOr: true },
      currentEditingPath: null,
      currentEditingObject: null,
      showRuleForm: false,

      customRuleType: 'LengthRule',
      minLength: undefined,
      maxLength: undefined,

      prefix: '',
      postfix: '',
    }
  },
  mounted() {
    if (this.appendMode) {
      console.log('inner-edit-rule')
      console.log(this.editMode, this.rule)
      this.visible = true
    }
    if (this.editMode) {
      console.log('inner-edit-rule')
      console.log(this.editMode, this.rule)
      this.visible = true
      this.rules = _.cloneDeep(this.rule.rule)
      this.drawRules()
    }
    this.addHoverResponse()
  },
  methods: {
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
        const options = $('.options')
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
  },
  computed: {
    dialogTitle() {
      if (this.editMode) {
        return this.rule.ruleName
      } else {
        return '创建规则'
      }
    },
  },
}
