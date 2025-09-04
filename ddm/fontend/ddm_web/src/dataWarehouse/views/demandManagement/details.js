import addMessage from './addMessage.vue'
import documents from './documents.vue'
import axios from 'axios'
import HTTP from '@/resource/http'

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
          label: '待审核'
        },
        {
          value: 'RA',
          label: '审批中'
        },
        {
          value: 'RJ',
          label: '已拒绝'
        },
        {
          value: 'C',
          label: '已确认'
        },
        {
          value: 'RC',
          label: '验收中'
        },
        {
          value: 'RK',
          label: '验收未通过'
        },
        {
          value: 'R',
          label: '验收通过'
        },
        {
          value: 'RG',
          label: '需求变更审核中'
        },
        {
          value: 'RL',
          label: '需求废弃审核中'
        },
        {
          value: 'L',
          label: '已废弃'
        }
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
      ],
      workflowData: [],
      historyData: [],
      workflowTableData: []
    }
  },
  mounted () {
    this.getTableData()
    this.getTableData1()
    this.getTableData2()
    this.init()
  },
  methods: {
    historyView (row) {
      let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('demandManage', {
        id: row.requirementId,
        type: 'scan',
        version: row.version,
        requirement: row.requirementDataobject.join(',')
      })
      window.open(pageUrl)
    },
    getHistoryData (id) {
      let url = `${this.$domains}requirementmanagement/history?id=${id}`
      this.$http
        .get(url)
        .then(res => {
          this.historyData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getWorkflowList (projectId) {
      this.workflowTableData = []
      this.$http
        .post(this.$dddUrl + `/service/workflow/${projectId}/list?isPublish=1`)
        .then(res => {
          res.data.data.forEach(element => {
            this.formData.workflowCode.forEach(code => {
              if (Number(code) === Number(element.code)) {
                this.workflowTableData.push(element)
              }
            })
          })
        }).catch(e => {
          // this.$showFailure(e)
        })
    },
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
      let url = `${this.$domains}categories/tree?type=82800021`
      this.$http
        .post(url)
        .then(res => {
          this.options = this.treeSort(res.data.subNodes[0])
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
        let url = ''
        let urlmethod = 'post'
        if (this.$route.query.version) {
          urlmethod = 'get'
          url = `${this.$domains}requirementmanagement/history/detail?id=${this.$route.query.id}&version=${this.$route.query.version}`
        } else {
          urlmethod = 'post'
          url = `${HTTP.$domains}requirementmanagement/get?id=${this.id}`
        }
        this.$http[urlmethod](url).then(res => {
          if (res.data.module === 'D3' && res.data.projectId) {
            this.getWorkflowList(res.data.projectId)
          }
          if (!this.$route.query.version) {
            this.getHistoryData(res.data.id)
          }
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
          } else {
            this.haveDocument = true
          }

          // 翻译需求优先级，状态
          if (this.formData.requirementPriority !== null) {
            this.formData.requirementPriority = this.priorityOptions.filter(
              item => item.value === this.formData.requirementPriority
            )[0].label
          }
          if (this.formData.requirementStauts !== null) {
            this.formData.requirementStauts = this.stautsOptions.filter(
              item => item.value === this.formData.requirementStauts
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
        .get(this.$url + '/service/files/?fileIds=' + fileIds)
        .then(res => {
          console.log()
        })
    },
    // 获取信息分析的信息
    getTableData () {
      this.tableData = []
      if (this.$route.query.version) {
        this.$http
          .post(this.$domains + 'requirementmanagement/requirementdataobjects/get', this.$route.query.requirement.split(','))
          .then(res => {
            this.tableData = res.data
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        if (this.id) {
          let url = `${HTTP.$domains}requirementmanagement/requirementdataobject/get/list`
          const request = axios.create({
            headers: {
              'Content-Type': 'application/json'
            }
          })
          request.post(url, this.id).then(res => {
            this.tableData = res.data
          })
        }
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
      let url = `${HTTP.$domains}categories/get?type=82800021`
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
      this.categoryArr.unshift(id)
      if (Array.isArray(this.treeList)) {
        let c = this.treeList.filter(item => item.categoryId === id)[0]
        if (c && c.parentId) {
          this.sortCategory(c.parentId)
        }
      }
      return this.categoryArr
    },
    // 获取相关指标
    getTableData1 () {
      let url = `${HTTP.$domains}metricManagement/getMetricsByRequirementId?requirementId=${this.id}`
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
      let url = `${HTTP.$domains}dimension/requirement/get?id=${this.id}`
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
