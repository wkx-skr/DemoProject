export default {
  props: {
    iscreate: {
      type: Boolean,
      required: false,
    },
    id: {
      type: Number,
      required: false,
    },
    categoryId: {
      type: Number,
      required: false,
    },
    udps: {},
  },
  data() {
    const validRangeValidator = (rule, value, callback) => {
      if (!value) {
        return callback(
          new Error(this.$t('indicator.dimension.serviceLifeNotNull'))
        )
      }
      if (
        this.iscreate &&
        new Date().getTime() - this.formData.dateRange[0] > 24 * 3600 * 1000
      ) {
        callback(new Error(this.$t('indicator.dimension.validTimeNotBefore')))
      } else {
        callback()
      }
    }
    return {
      nodeData: this.iscreate
        ? [
            {
              name: this.$t('common.page.indexApply'),
              couldClick: false,
            },
            {
              name: this.$t('common.page.dimensionDefinition'),
              couldClick: false,
            },
            {
              name: this.$t('indicator.dimension.addDimension'),
            },
          ]
        : [],
      udpLoadedReady: false,
      formData: {
        hierarchy: [],
        categoryId: '',
        categorys: [],
        requirementId: '',
        dimensionName: '',
        englishName: '',
        technicalLeader: '',
        businessLeader: '',
        managementLeader: '',
        stauts: 0,
        description: '',
        dateRange: [],
        dimensionUdpValue: {},
      },
      formRules: {
        categorys: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        hierarchy: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        // dimensionCode: {
        //     required: true,
        //     trigger: 'change',
        //     message: '此项不能为空',
        // },
        businessLeader: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        dimensionName: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        englishName: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        managementLeader: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        dateRange: {
          required: true,
          trigger: 'change',
          validator: validRangeValidator,
        },
        // dateRange: {
        //   required: true,
        //   trigger: 'change',
        //   message: '此项不能为空',
        // },
        technicalLeader: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
      },
      // 层级表单
      hierarchyFormData: {},
      // 层级表单验证
      hierarchyRules: {
        chName: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
        englishName: {
          required: true,
          trigger: 'change',
          message: this.$t('indicator.demand.notNull'),
        },
      },
      showhierarchy: false,
      dimensionValueTable: [],
      addTitle: this.$t('indicator.dimension.newDimensionValue'),
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
        preview: true, // 预览
      },
      valueTree: [],
      showServiceLife: false,
      // 状态
      stautsOptions: [
        {
          value: 0,
          label: this.$t('indicator.dimension.stateOptions.0'),
        },
        {
          value: 1,
          label: this.$t('indicator.dimension.stateOptions.1'),
        },
        {
          value: 2,
          label: this.$t('indicator.dimension.stateOptions.2'),
        },
      ],
      orderOption: [
        {
          order: 0,
          chName: this.$t('indicator.dimension.root'),
        },
      ],
      requirementOption: [],
      hierarchyTable: null,
      hierarchyTitle: this.$t('indicator.dimension.h.new'),
    }
  },
  beforeMount() {},
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.getTreeData()
      this.getRequirementData()
      if (this.id) {
        this.getTreeList(() => {
          this.getFormData()
        })
        // 查询维度值
        this.getValue()
      } else {
        this.udps.forEach(e => {
          this.$set(this.formData.dimensionUdpValue, e.id, null)
        })
        this.udpLoadedReady = true
        this.showServiceLife = true
        if (this.categoryId && this.categoryId != null) {
          this.getTreeList(() => {
            let categorys = this.sortCategory(this.categoryId).splice(1)
            this.$set(this.formData, 'categorys', categorys)
          })
        }
      }
    },
    changeEventStartTime(time) {
      this.formData.dateRange = time
    },
    back() {
      this.$emit('back')
    },
    // 筛选目录
    sortCategory(id) {
      this.categoryArr.unshift(id)
      if (Array.isArray(this.treeList)) {
        let c = this.treeList.filter(item => item.categoryId === id)[0]
        if (c.parentId) {
          this.sortCategory(c.parentId)
        }
      }
      return this.categoryArr
    },
    // 获取详情
    getFormData() {
      let url = `/domain/dimension/get?id=${this.id}`
      this.$http
        .post(url)
        .then(res => {
          this.formData = _.cloneDeep(res.data)
          if (!this.formData.dimensionUdpValue) {
            this.$set(this.formData, 'dimensionUdpValue', {})
          }
          this.udps.forEach(e => {
            if (!this.formData.dimensionUdpValue[e.id]) {
              this.$set(this.formData.dimensionUdpValue, e.id, null)
            }
          })
          this.udpLoadedReady = true
          this.nodeData = [
            {
              name: this.$t('common.page.indexApply'),
              couldClick: false,
            },
            {
              name: this.$t('common.page.dimensionDefinition'),
              couldClick: false,
            },
            {
              name: this.formData.dimensionName,
            },
          ]
          this.hierarchyTable = _.cloneDeep(res.data.hierarchy)
          if (this.formData.hierarchy === null) {
            this.formData.hierarchy = []
            this.hierarchyTable = []
          }
          let categorys = this.sortCategory(res.data.categoryId).splice(1)
          this.$set(this.formData, 'categorys', categorys)
          this.showServiceLife = true
          this.formData.dateRange = [
            this.formData.serviceLifeStart,
            this.formData.serviceLifeEnd,
          ]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 提交层级
    submitHierarchy() {
      this.$refs.hierarchyForm.validate(valid => {
        if (!valid) {
          this.$blauShowFailure(this.$t('domain.common.requiredIsNull'))
          return false
        } else {
          if (this.hierarchyFormData.index !== undefined) {
            // 修改
            let index = this.hierarchyFormData.index
            this.$set(this.formData.hierarchy, index, this.hierarchyFormData)
          } else {
            // 添加
            this.hierarchyFormData.order = this.formData.hierarchy.length + 1
            this.formData.hierarchy.push(this.hierarchyFormData)
          }
          this.showhierarchy = false
          this.hierarchyFormData = {}
        }
      })
    },
    // 点击新增层级
    addHierarchy() {
      this.hierarchyTitle = this.$t('indicator.dimension.h.new')
      this.hierarchyFormData = {}
      this.showhierarchy = true
      if (this.formData.hierarchy.length > 0) {
        this.orderOption = _.cloneDeep(this.formData.hierarchy)
      } else {
        this.orderOption = [
          {
            order: 0,
            chName: this.$t('indicator.dimension.root'),
          },
        ]
      }
    },
    // 编辑层级
    hierarchyEdit(scope) {
      this.hierarchyTitle = this.$t('indicator.dimension.h.edit')
      // let parentOrder=scope.row.order-1;
      // scope.row.parentOrder=parentOrder;
      this.hierarchyFormData = _.cloneDeep(scope.row)
      this.hierarchyFormData.index = scope.$index
      // if(parentOrder>0){
      //   let hierarchy= _.cloneDeep(this.formData.hierarchy);
      //   hierarchy=hierarchy.filter(item=>item.index!==scope.row.index);
      //   this.orderOption = hierarchy;
      // }else{
      //   this.orderOption = [{
      //     order: 0,
      //     chName: '根层级',
      //   }]
      // }
      this.showhierarchy = true
    },
    // 删除层级
    hierarchyDelete(scope) {
      this.$DatablauCofirm(
        this.$t('meta.report.delConfirm'),
        this.$t('meta.report.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          // console.log(scope, 'this.formData.hierarchy');
          let root = this.formData.hierarchy.filter(
            item => item.order < scope.row.order
          )
          let liv = this.formData.hierarchy.filter(
            item => item.order > scope.row.order
          )
          let values = this.dimensionValueTable.filter(
            item => item.lvlId == scope.row.order
          )
          if (root.length > 0) {
            if (liv.length > 0) {
              this.$message.closeAll()
              this.$message.error(this.$t('indicator.dimension.deleteByOrder'))
            } else {
              // dimensionValueTable
              if (values.length > 0) {
                this.$message.error(this.$t('indicator.dimension.hasSub'))
              } else {
                this.formData.hierarchy.splice(scope.$index, 1)
                this.$message.closeAll()
                this.$message.success(
                  this.$t(
                    'meta.lineageManage.lineageCatalogue.successfullyDeleted'
                  )
                )
              }
            }
          } else {
            this.$message.error(this.$t('indicator.dimension.rootCannotDelete'))
          }
        })
        .catch(e => {
          // this.$showFailure(e)
        })
    },
    // 查询全部维度值
    getValue() {
      let url = `/domain/dimension/list/get?id=${this.id}`
      this.$http
        .post(url)
        .then(res => {
          if (res.data) {
            this.dimensionValueTable = res.data
          } else {
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 提交维度
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.$blauShowFailure(this.$t('domain.common.requiredIsNull'))
          return false
        } else {
          if (!this.formData.hierarchy || !this.formData.hierarchy.length > 0) {
            this.$message.error(this.$t('indicator.dimension.needHierarchy'))
            return false
          }
          // 提取选择的目录ID及目录名
          this.formData.categoryId =
            this.formData.categorys[this.formData.categorys.length - 1]
          let url = '/domain/dimension/create'
          let body = this.formData
          body.updateTime = new Date().getTime()
          if (this.formData.dateRange && this.formData.dateRange.length === 2) {
            body.serviceLifeStart = this.formData.dateRange[0]
            body.serviceLifeEnd = this.formData.dateRange[1]
          }
          if (this.iscreate) {
            // 新建
            url = '/domain/dimension/create'
          } else {
            // 修改
            url = '/domain/dimension/update'
          }
          this.$http
            .post(url, body)
            .then(res => {
              let data = { id: this.categoryId }
              this.$bus.$emit('updateDimensionItem1', data)
              this.back()
              this.$message.closeAll()
              this.$message.success(
                this.iscreate
                  ? this.$t('quality.page.ruleTemplate.message.addSuccess')
                  : this.$t('quality.page.ruleTemplate.message.editSuccess')
              )
              let url = `/domain/dimension/value/create`
              let dimensionId = res.data.dimensionId
              let body = this.dimensionValueTable
              if (
                Array.isArray(this.dimensionValueTable) &&
                this.dimensionValueTable.length > 0
              ) {
                body = this.dimensionValueTable.map(item => {
                  item.dimensionId = dimensionId
                  return item
                })
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    categoryChange(val) {
      console.log(val, 'val')
    },
    treeSort(root) {
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
    getTreeData() {
      let url = `/domain/categories/tree?type=82800023`
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
    getTreeList(callback) {
      let url = `/domain/categories/get?type=82800023`
      this.$http
        .post(url)
        .then(res => {
          this.treeList = res.data
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取需求列表
    getRequirementData() {
      let url = `/domain/requirementmanagement/getall`
      this.$http
        .post(url)
        .then(res => {
          // console.log(res.data,'111')
          let data = _.cloneDeep(res.data)
          data.map(item => {
            if (item.name.length > 21) {
              // console.log(item,'item')
              item.name = item.name.slice(0, 20) + '...'
            }
          })
          this.requirementOption = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    //
    setOwner(property) {
      this.$utils.staffSelect.open([], true).then(res => {
        this.formData[property] = res[0].username
        // console.log(this.formData,'this.formData');
      })
    },
  },
  computed: {},
}
