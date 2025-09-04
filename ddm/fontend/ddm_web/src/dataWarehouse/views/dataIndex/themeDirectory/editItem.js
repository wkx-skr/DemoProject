import MetaSelector from '@/components/common/metaSelector.vue'
export default {
  components: {
    MetaSelector
  },
  props: {
    iscreate: {
      type: Boolean,
      required: false
    },
    id: {
      type: Number,
      required: false
    },
    categoryId: {
      type: Number,
      required: false
    }
  },
  data () {
    return {
      type: 82800027,
      nodeData: [
        {
          name: this.$t('common.page.themeDirectory'),
          couldClick: false
        },
        {
          name: this.$t('indicator.subject.newSubject'),
          couldClick: false
        }
      ],
      formData: {
        tableName: '',
        system: '',
        tableId: null
      },
      formRules: {
        categorys: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        name: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        }
        // tableName: {
        //   required: true,
        //   trigger: 'change',
        //   message: '此项不能为空',
        // },
        // system: {
        //   required: true,
        //   trigger: 'change',
        //   message: '此项不能为空',
        // },
      },
      // 层级表单
      hierarchyFormData: {},
      // 层级表单验证
      hierarchyRules: {
        chName: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        englishName: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        }
      },
      showhierarchy: false,
      showValue: false,
      valueRules: {
        lvlId: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        parentId: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        valueTableData: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        }
      },
      valueFormData: {
        valueTableData: []
      },
      dimensionValueTable: [],
      // 目录
      options: [],
      categoryArr: [],
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: false, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: false, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true // 预览
      },
      showAddValue: false,
      addValueRules: {
        name: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        chineseName: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        code: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull')
        },
        dataOrder: {
          type: 'number',
          message: this.$t(
            'quality.page.dataQualityRepairJob.validateRules.fixedNum'
          )
        }
      },
      addValueForm: {},
      valueTree: [],
      parentOptions: [],
      showServiceLife: false,
      hierarchyOption: [],
      orderOption: [
        {
          order: 0,
          chName: this.$t('indicator.dimension.root')
        }
      ],
      requirementOption: [],
      hierarchyTable: null,
      dimensionValueTree: [],
      tableLabelArray: ['', ''],
      selectKey: 1
    }
  },
  beforeMount () {},
  mounted () {
    this.init()
    console.log(this.categoryId, 'this.categoryId1')
  },
  methods: {
    init () {
      this.getTreeData()
      if (this.id) {
        this.getTreeList()
        setTimeout(() => {
          this.getFormData()
        }, 200)
      } else {
        this.showServiceLife = true
        if (this.categoryId && this.categoryId != null) {
          this.getTreeList()
          setTimeout(() => {
            let categorys = this.sortCategory(this.categoryId).splice(1)
            this.$set(this.formData, 'categorys', categorys)
            // console.log(this.formData.categorys,'this.formData.categorys')
          }, 400)
        }
      }
    },
    back () {
      this.$emit('back')
    },
    // 设置数据源
    setTable () {
      this.selectKey++
      setTimeout(() => {
        this.$refs.metaSelector.init()
      }, 200)
    },
    handleMetaSelect ({ model, table, column }) {
      this.formData.tableId = table.objectId
      // this.tableId=table.objectId
      this.formData.tableName = table.physicalName
      this.formData.system = model.categoryName
      // this.tableName = table.name
      // this.modelName = model.name
      this.tableLabelArray = [
        model.categoryName,
        model.name,
        model.schema,
        table.physicalName
      ]
      console.log(model, table, column, 'model, table, column')
    },
    // 筛选目录
    sortCategory (id) {
      this.categoryArr.unshift(id)
      console.log(this.treeList, 'terr')
      if (Array.isArray(this.treeList)) {
        let c = this.treeList.filter(item => item.categoryId === id)[0]
        if (c.parentId) {
          console.log(c.parentId, 'c.parentId')
          this.sortCategory(c.parentId)
        }
      }
      return this.categoryArr
    },
    // 获取详情
    getFormData () {
      let url = `${this.$domains}querytheme/get?id=${this.id}`
      this.$http
        .post(url)
        .then(res => {
          this.formData = res.data
          this.hierarchyTable = _.cloneDeep(res.data.hierarchy)
          this.nodeData = [
            {
              name: this.$t('common.page.themeDirectory'),
              couldClick: false
            },
            {
              name: this.formData.name,
              couldClick: false
            }
          ]
          if (this.formData.hierarchy === null) {
            this.formData.hierarchy = []
            this.hierarchyTable = []
          }
          let categorys = this.sortCategory(res.data.categoryId).splice(1)
          this.$set(this.formData, 'categorys', categorys)
          this.tableLabelArray = [this.formData.system, this.formData.tableName]
          // this.tableLabelArray = [model.categoryName, model.name,model.schema,table.physicalName]
          this.showServiceLife = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 提交
    onSubmit () {
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.$blauShowFailure(this.$t('domain.common.requiredIsNull'))
          return false
        } else {
          // 提取选择的目录ID及目录名
          this.formData.categoryId =
            this.formData.categorys[this.formData.categorys.length - 1]
          // let url = this.$damUrl + '/service/';
          let url = `${this.$domains}querytheme/create`
          let body = this.formData
          // body.requirementEditor = this.$user.username
          if (this.iscreate) {
            // 新建
            body.creatDate = new Date().getTime()
            body.creatUser = this.$store.state.user.name
            // body.tableId = this.tableId;
            if (!body.tableId) {
              this.$message.error(this.$t('meta.report.selDataSource'))
              return false
            }
            url = `${this.$domains}querytheme/create`
          } else {
            // 修改
            url = `${this.$domains}querytheme/update`
          }
          this.$http
            .post(url, body)
            .then(res => {
              let data = { id: this.categoryId }
              this.$bus.$emit('updateThemeItem1', data)
              this.back()
              this.$message.closeAll()
              this.$message.success(
                this.iscreate
                  ? this.$t('quality.page.ruleTemplate.message.addSuccess')
                  : this.$t('quality.page.ruleTemplate.message.editSuccess')
              )
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    categoryChange (val) {
      console.log(val, 'val')
    },
    treeSort (root) {
      let t = root.subNodes
      if (t) {
        t.forEach(item => {
          item.value = item.id
          item.label = item.name
          if (item.subNodes) {
            item.children = item.subNodes
            this.treeSort(item)
          }
        })
      }
      return t
    },
    // 获取目录树
    getTreeData () {
      let url = `${this.$domains}categories/tree?type=${this.type}`
      this.$http
        .post(url)
        .then(res => {
          if (res.data.subNodes[0] && res.data.subNodes[0].subNodes) {
            this.options = this.treeSort(res.data.subNodes[0])
          } else {
            this.options = []
          }
          // console.log(this.options, 'this.options')
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // setTimeout(() => {
      //   this.treeData = this.TREE_DATA
      // }, 1000)
    },
    // 获取目录列表
    getTreeList () {
      let url = `${this.$domains}categories/get?type=${this.type}`
      this.$http
        .post(url)
        .then(res => {
          this.treeList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  },
  computed: {
    tableLabel () {
      return this.tableLabelArray.filter(i => i).join(' / ')
    }
  }
}
