export default {
  props: {
    parentData: {
      type: Array,
      default: [],
    },
  },
  data() {
    const nameRegex = /^[^~!@#$%^&*|=+￥]+$/
    const codeRegex = /^[a-zA-Z0-9]+$/
    const indexRegex = /^[0-9]+$/
    return {
      nameRegex: nameRegex,
      codeRegex: codeRegex,
      indexRegex: indexRegex,
      title: '',
      isShow: false,
      isSub: false,
      isEdit: false,
      formData: {
        name: '',
        code: '',
        index: '',
        parentName: '',
        desc: '',
      },
      currentRow: {},
      rules: {
        name: [
          {
            required: true,
            message: this.$t('quality.page.ruleTypeSetting.fillName'),
            trigger: 'blur',
          },
          {
            pattern: nameRegex,
            message: this.$t('quality.page.ruleTypeSetting.regexName'),
            trigger: 'blur',
          },
        ],
        code: [
          {
            required: true,
            message: this.$t('quality.page.ruleTypeSetting.fillCode'),
            trigger: 'blur',
          },
          {
            pattern: nameRegex,
            message: this.$t('quality.page.ruleTypeSetting.regexName'),
            trigger: 'blur',
          },
        ],
        index: [
          {
            pattern: indexRegex,
            message: this.$t('quality.page.ruleTypeSetting.regexIndex'),
            trigger: 'blur',
          },
        ],
        parentName: [
          {
            required: true,
            message: this.$t('quality.page.ruleTypeSetting.fillParent'),
            trigger: 'change',
          },
        ],
      },
    }
  },
  mounted() {
    if (this.detailId) {
      this.getDetailDispatch()
    }
  },
  beforeDestroy() {},
  methods: {
    resetForm() {
      this.formData = {
        name: '',
        code: '',
        index: '',
        parentName: '',
        desc: '',
      }
    },
    open(type, row) {
      this.resetForm()
      this.isSub = type === 'addSub' || (row && row.parentId)
      this.isShow = true
      this.title =
        type === 'addRule'
          ? '新建规则类型'
          : type === 'addSub'
          ? '新建子集规则类型'
          : type === 'edit' && this.isSub
          ? '编辑子集规则类型'
          : '编辑规则类型'
      this.isEdit = type === 'edit'
      if (row) {
        this.currentRow = _.cloneDeep(row)
        this.handleEdit(row)
      }
    },
    handleEdit(row) {
      this.$set(this.formData, 'name', row.optionValue)
      this.$set(this.formData, 'code', row.ruleCode)
      this.$set(this.formData, 'index', row.ruleSort)
      this.$set(this.formData, 'desc', row.optionComment)
      this.$set(this.formData, 'parentName', row.parentId)
    },
    changeP(par) {
      const parCode = this.parentData.filter(p => {
        return p.value === par
      })[0].ruleCode
      this.$set(this.formData, 'parentCode', parCode)
    },
    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$refs.form.clearValidate()
          let obj = {
            optionCategory: 'TR',
            optionName: this.isSub ? '规则小类' : '规则大类',
            optionValue: this.formData.name,
            optionComment: this.formData.desc,
            ruleCode: this.formData.code,
            ruleSort: this.formData.index,
          }
          if (this.isSub) {
            obj.parentId = this.formData.parentName
            obj.parentCode = this.formData.parentCode
          }
          if (this.isEdit) {
            obj.optionId = this.currentRow.id || ''
          }
          this.$emit('getDialogData', obj)
        }
      })
    },
    cancel() {
      this.isShow = false
      this.$refs.form.clearValidate()
    },
  },
  computed: {},
  watch: {},
}
