import {
  testByContent,
  getLineageType,
  createScript,
  updateScript,
} from './server'
export default {
  components: {},
  props: {
    editRowInfo: {
      type: Object,
      default() {
        return {}
      },
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      addForm: {
        name: '',
        scriptType: 'JAVASCRIPT',
        scriptContent: '',
        lineageType: '',
        description: '',
      },
      lineageTypeList: [],
      rules: {
        name: [
          {
            required: true,
            message: this.$t('meta.lineageManage.scriptManage.fillScriptName'),
            trigger: 'blur',
          },
        ],
        lineageType: [
          {
            required: true,
            message: this.$t(
              'meta.lineageManage.scriptManage.selLineageFileType'
            ),
            trigger: 'change',
          },
        ],
      },
      testModal: false,
      testTitle: '',
      testForm: {
        content: '',
        result: '',
      },
      regexData: [{ regex: '', replace: '' }],
      currentRegexRow: {},
      placeholder: this.$t(
        'meta.lineageManage.scriptManage.scriptContentPlaceholder'
      ),
    }
  },
  created() {},
  mounted() {
    this.getLineageType()
    if (this.isEdit) {
      // 编辑
      this.addForm.name = this.editRowInfo.name
      this.addForm.scriptType = this.editRowInfo.scriptType
      this.addForm.lineageType = this.editRowInfo.lineageType
      this.addForm.description = this.editRowInfo.description
      if (this.addForm.scriptType === 'JAVASCRIPT') {
        this.addForm.scriptContent = this.editRowInfo.scriptContent
      } else if (this.addForm.scriptType === 'REGEX') {
        this.regexData = JSON.parse(this.editRowInfo.scriptContent)
      }
    }
  },
  methods: {
    handleEdit() {},
    // 获取血缘类型
    async getLineageType() {
      try {
        let res = await getLineageType()
        if (res.status === 200) {
          this.lineageTypeList = res.data
        }
      } catch (e) {
        this.$showFailure(e)
      }
    },
    async runTest() {
      let param = {}
      if (this.addForm.scriptType === 'JAVASCRIPT') {
        // javascript
        /* const tmp = this.addForm.scriptContent
        const re = /function\s*(\w*)/i
        const matches = re.exec(tmp) */
        param = {
          scriptType: this.addForm.scriptType,
          functionScript: this.addForm.scriptContent,
          toBeReplace: this.testForm.content,
        }
      } else {
        // 正则
        param = {
          scriptType: this.addForm.scriptType,
          regexScript: {
            regex: this.currentRegexRow.regex,
            replace: this.currentRegexRow.replace || '',
          },
          toBeReplace: this.testForm.content,
        }
      }
      try {
        let res = await testByContent(param)
        if (res.status === 200) {
          this.testForm.result = res.data
        } else {
        }
      } catch (e) {
        this.$showFailure(e)
      }
    },
    // 打开测试弹窗
    openTest(obj) {
      this.currentRegexRow = obj
      this.testModal = true
      this.testForm.content = ''
      this.testForm.result = ''
      this.testTitle =
        this.addForm.scriptType === 'JAVASCRIPT'
          ? this.$t('meta.lineageManage.scriptManage.javascriptTest')
          : this.$t('meta.lineageManage.scriptManage.regexTest')
    },
    onCancel() {
      this.testModal = false
    },
    addRegex() {
      this.regexData.push({ regex: '', replace: '' })
    },
    deleteRegexRow(idx) {
      this.regexData.splice(idx, 1)
    },
    async _createScript(param) {
      try {
        await createScript(param)
        this.$message.success(this.$t('meta.DS.message.createSucceed'))
        this.removeTab()
      } catch (e) {
        this.$showFailure(e)
      }
    },
    async _updateScript(param) {
      try {
        await updateScript(param)
        this.$message.success(this.$t('meta.DS.message.modifySucceed'))
        this.removeTab()
      } catch (e) {
        this.$showFailure(e)
      }
    },
    save() {
      this.$refs.addForm.validate(valid => {
        if (!valid) {
          return false
        } else {
          let obj = {
            name: this.addForm.name,
            description: this.addForm.description,
            lineageType: this.addForm.lineageType,
            fileNameRule: '',
            scriptType: this.addForm.scriptType,
            // order: 1,
          }
          if (this.isEdit) {
            obj.id = this.editRowInfo.id
          }
          if (this.addForm.scriptType === 'JAVASCRIPT') {
            /* const tmp = this.addForm.scriptContent
            const re = /function\s*(\w*)/i
            const matches = re.exec(tmp)
            console.log('matches', matches) */
            /* if (!matches) {
              this.$showFailure('脚本格式不正确')
              return
            } */
            let obj1 = {
              functionScript: this.addForm.scriptContent,
            }
            Object.assign(obj, obj1)
          } else {
            let obj1 = {
              regexScript: this.regexData,
            }
            Object.assign(obj, obj1)
          }
          if (this.isEdit) {
            this._updateScript(obj)
          } else {
            this._createScript(obj)
          }
        }
      })
    },
    removeTab() {
      this.$emit('removeTab')
    },
  },
  watch: {
    /* keyword() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.queryRules()
      }, 800)
    }, */
  },
}
