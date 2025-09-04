import addMessage from './addMessage.vue'
import documents from './documents.vue'
import axios from 'axios'
export default {
  props: ['id'],
  components: {
    addMessage,
    documents
  },
  data () {
    return {
      nodeData: [
        {
          name: this.$t('common.page.requireManage'),
          couldClick: false
        }
      ],
      readOnly: true,
      activeName: 'first',
      ruleForm: { name: '一二三' },
      loading: false,
      rules: {},
      // 需求分析
      tableData: null,
      // 相关指标
      tableData1: [],
      // 相关维度
      tableData2: [],
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
      formData: {},
      jobDetails: {},
      documentKey: 1,
      haveDocument: false,
      showMessage: false,
      // 需求优先级
      priorityOptions: [
        {
          value: 0,
          label: 'p1'
        },
        {
          value: 1,
          label: 'p2'
        },
        {
          value: 3,
          label: 'p3'
        }
      ],
      // 需求状态
      stautsOptions: [
        {
          value: 'A',
          label: this.$t('indicator.demand.stateOption.A')
        },
        {
          value: 'R',
          label: this.$t('indicator.demand.stateOption.R')
        },
        {
          value: 'C',
          label: this.$t('indicator.demand.stateOption.C')
        },
        {
          value: 'D',
          label: this.$t('indicator.demand.stateOption.D')
        }
        // {
        //   value: 'E',
        //   label: '已拒绝',
        // },
      ],
      message: {},
      category: '',
      categoryArr: [],
      formRules: {},
      // 所属目录
      options: [
        {
          value: '0',
          label: '目录1',
          children: [
            {
              value: '1',
              label: '目录2',
              children: [
                {
                  value: '2',
                  label: '目录3'
                }
              ]
            }
          ]
        }
      ]
    }
  },
  mounted () {
    this.getTableData()
    this.getTableData1()
    this.getTableData2()
    this.init()
  },
  methods: {
    async init () {
      this.getTreeData()
      await this.getTreeList()
      setTimeout(() => {
        this.getFormData()
      }, 400)
      // this.getFormData();
    },
    // 返回
    backClick () {
      this.$emit('backClick')
    },
    tabClick (value) {
      this.activeName = value.name
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
    getTreeData () {
      let url = `${this.$metric_url}categories/tree?type=82800021`
      this.$http
        .post(url)
        .then(res => {
          this.options = this.treeSort(res.data.subNodes[0])
          console.log(this.options, 'this.options')
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // setTimeout(() => {
      //   this.treeData = this.TREE_DATA
      // }, 1000)
    },
    // 获取详情
    getFormData () {
      if (this.id) {
        let url = `${this.$metric_url}requirementmanagement/get?id=${this.id}`
        this.$http.post(url).then(res => {
          this.formData = _.cloneDeep(res.data)
          this.formData.categorys = this.sortCategory(res.data.categoryId).splice(1)
          // console.log(this.formData.categorys,'this.formData.categorys')
          // 处理附件信息
          if (
            Array.isArray(this.formData.enclosureId) &&
            this.formData.enclosureId.length > 0
          ) {
            let documents = []
            this.formData.enclosureId.forEach(item => {
              documents.push({ uuid: item })
            })
            this.jobDetails.documents = documents
            this.haveDocument = true
            console.log(this.jobDetails, 'this.jobDetails')
          } else {
            this.haveDocument = true
          }

          // 翻译需求优先级，状态
          if (this.formData.requirementPriority !== null) {
            this.formData.requirementPriority = this.priorityOptions.filter(
              item => item.value == this.formData.requirementPriority
            )[0].label
          }
          if (this.formData.requirementStauts !== null) {
            this.formData.requirementStauts = this.stautsOptions.filter(
              item => item.value == this.formData.requirementStauts
            )[0].label
          }
          // 导航名称
          this.nodeData = [
            {
              name: this.$t('common.page.requireManage'),
              couldClick: false
            },
            { name: this.formData.name, couldClick: false }
          ]
        })
      }
    },
    // 获取附件信息
    getDocument (fileIds) {
      this.$http
        .get(this.$meta_url+ '/service/files/?fileIds=' + fileIds)
        .then(res => {
          console.log()
        })
    },
    // 获取信息分析的信息
    getTableData () {
      this.tableData = []
      if (this.id) {
        let url = `${this.$metric_url}requirementmanagement/requirementdataobject/get/list`
        const request = axios.create({
          headers: {
            'Content-Type': 'application/json'
          }
        })
        request.post(url, this.id).then(res => {
          this.tableData = res.data
        })
      }
    },
    // 删除一个需求分析元数据
    DeleteClick (row) {
      if (row.objectId) {
        let url = '/requirementmanagement/requirementanalysisdataobject/delete'
        let body = { objectId: row.objectId }
        // this.$http.post(url, body).then(res => {
        // })
      }
    },
    // 新增信息项
    addMessage () {},
    // 关闭信息项
    closeMessage () {
      this.showMessage = false
    },
    // 获取目录列表
    getTreeList () {
      let url = `${this.$metric_url}categories/get?type=82800021`
      this.$http
        .post(url)
        .then(res => {
          this.treeList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 筛选目录
    sortCategory (id) {
      console.log(this.treeList, 'this.treeList')
      this.categoryArr.unshift(id)
      if (Array.isArray(this.treeList)) {
        let c = this.treeList.filter(item => item.categoryId === id)[0]
        if (c && c.parentId) {
          console.log(c.parentId, 'c.parentId')
          this.sortCategory(c.parentId)
        }
      }
      return this.categoryArr
    },
    // 获取相关指标
    getTableData1 () {
      let url = `${this.$metric_url}metricManagement/getMetricsByRequirementId?requirementId=${this.id}`
      this.$http
        .post(url)
        .then(res => {
          this.tableData1 = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // setTimeout(() => {
      //   this.treeData = this.TREE_DATA
      // }, 1000)
    },
    // 获取相关维度
    getTableData2 () {
      let url = `${this.$metric_url}dimension/requirement/get?id=${this.id}`
      this.$http
        .post(url)
        .then(res => {
          this.tableData2 = res.data
          this.tableData.forEach(element => {
            // 维度层级
            // if (element.hierarchy !== null&&element.hierarchy !==undefined) {
            //   let hierarchyWay = ''
            //   element.hierarchy.forEach(item => {
            //     hierarchyWay += '-' + item.chName
            //   })
            //   hierarchyWay = hierarchyWay.slice(1)
            //   element.hierarchyWay = hierarchyWay
            // }
            // element.category = this.sortCategory(element);
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  }
}
