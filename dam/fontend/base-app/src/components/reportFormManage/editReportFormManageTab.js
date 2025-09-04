import indexTreeDialog from './indexTreeDialog.vue'
import imageUpload from './imageUpload.vue'
import HTTP from '@/http/main'
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
// import UserTop from '@/components/userTop/userTop.vue'
import dataSteward from '../../view/dataProperty/meta/dataSteward.vue'
import groupDepartment from '../../view/dataProperty/meta/groupDepartment.vue'

let self = null

export default {
  props: {
    oldReportFormManage: {
      required: true,
    },
    updSeparator: {
      type: String,
      default: ',',
    },
    appTypes: {
      // required: true,
      default() {
        return [
          {
            label: this.$t('meta.DS.tableDetail.report.multiAnalysis'),
            text: this.$t('meta.DS.tableDetail.report.multiAnalysis'),
            value: 'Analysis',
          },
          {
            label: this.$t('meta.DS.tableDetail.report.report'),
            text: this.$t('meta.DS.tableDetail.report.report'),
            value: 'Report',
          },
          {
            label: this.$t('meta.DS.tableDetail.report.list'),
            text: this.$t('meta.DS.tableDetail.report.list'),
            value: 'List',
          },
        ]
      },
    },
    nameArr: {
      default() {
        return []
      },
    },
    dimensionOptions: {},
    indexTree: {
      type: Array,
      default() {
        return []
      },
    },
    dimMap: {},
    indexMap: {
      type: Object,
      default() {
        return {}
      },
    },
    hasAccess: {
      type: Boolean,
      default: false,
    },
    getDataDemand: {
      type: Promise,
    },
    getDataSourceTree: {
      type: Promise,
    },
    showHeightAuto: {
      // 控制高度是否显示滚动条
      type: Boolean,
      default: false,
    },
    treeReportData: {
      type: Array,
      required: true,
    },
    reportDetailPro: {
      type: Promise,
      // required: true,
    },
  },

  data() {
    const reportFormManageUrl = this.$meta_url + '/service/dataReport/'
    const emptyData = {
      code: '',
      conditionArea: [],
      createTime: new Date().getTime(),
      dataRequirementCode: '',
      dataRequirementId: '',
      dataRequirementName: '',
      description: '',
      frequency: '',
      id: '',
      name: '',
      owner: '',
      range: '',
      resultArea: [],
      type: 'Analysis',
      url: '',
      thumbnailFileIds: '',
      biReportType: '',
      lastImportedModifiedTime: '',
    }
    const valiDupName = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('meta.DS.message.nameCanNotNull')))
        return
      }
      const index = this.nameArr.findIndex(item => {
        return item.name == value
      })
      if (
        index === -1 ||
        (this.isEdit && this.nameArr[index].id == this.reportFormManage.id)
      ) {
        callback()
      } else {
        callback(new Error(this.$t('meta.DS.message.nameDuplicate')))
      }
    }
    return {
      nodeData: [],
      action: '',
      tableHeight: undefined,
      isEdit: false, // 判断是创建报表还是编辑报表
      startEdit: true, // 判断是否开始编辑(input disabled)
      showBottom: 'imageData',
      bottomDataRequirement: [],
      bottomDataResult: [],
      reportFormManageUrl: reportFormManageUrl,
      reportFormManage: {
        type: '',
      },
      bottomDataDimension: [],
      bottomDataIndexs: [],
      bottomDataRelDbs: [], // 关联库表数组
      editObj: {}, // 下方 table 的 项 编辑时 存储信息
      dialogEditVisible: false,
      dataRequirements: [],
      emptyData: emptyData,
      minHeight: 300,
      dataReqMap: {}, // 数据需求
      appType_analysis: false,
      /* searchWay: [
        '日期范围选择',
        '树形单选',
        '下拉菜单多选',
        '手工输入精确匹配',
      ], */
      rules: {
        // name: {
        //   required: 'true',
        //   trigger: 'blur',
        //   message: '请填入报表名称',
        // },
        type: {
          required: 'true',
          trigger: 'blur',
          message: this.$t('meta.report.selReportType'),
        },
        owner: {
          required: 'true',
          trigger: 'blur',
          message: this.$t('meta.report.selOwner'),
        },
        name: {
          required: true,
          validator: valiDupName,
          trigger: 'blur',
        },
      },
      // Dimension: [], // 维度
      bottomMap: {
        requirement: this.$t('meta.report.requirement'),
        result: this.$t('meta.report.result'),
        dimension: this.$t('meta.report.dimension'),
        indexs: this.$t('meta.report.index'),
        relDb: this.$t('meta.report.relDbs'),
        imageData: this.$t('meta.report.reportImg'),
      },
      treeProp: {
        label: 'name',
        children: 'children',
      },
      bottomDataSourceCount: [],
      moveItemValue: '',
      typeMap: {
        // 查询结果区 类型
        Index: this.$t('meta.report.index'),
        Lat: this.$t('meta.report.dimension'),
        Other: this.$t('meta.report.common'),
      },
      typeArr: [
        {
          label: this.$t('meta.report.dimension'),
          value: 'Lat',
        },
        {
          label: this.$t('meta.report.index'),
          value: 'Index',
        },
        {
          label: this.$t('meta.report.common'),
          value: 'Other',
        },
      ],
      updateConditionArea: false,
      updateResultArea: false,
      updateRelatedTable: false,
      showChooseModel: false,
      // reDbKeyword: '', // 添加关联库表 搜索关键字
      getTablesPara: {
        currentPage: 1,
        keyword: null,
        modelId: undefined,
        pageSize: 200,
        types: ['TABLE'],
      },
      bottomTableMap: {},
      relDbChoosedMap: {}, // 关联库表是否被选择
      canJump: this.$auth.DATA_STANDARD_DIM_CATALOG_VIEW, // 是否有权限跳转到维度,指标

      /** tree choose data */
      chooseTreeData: [],
      imageList: [],
      importTypeArr: this.$globalData && this.$globalData.$importTypeArr,

      // 报表路径 编辑
      pathCascaderProps: {
        value: 'name',
        label: 'name',
        children: 'nodes',
        expandTrigger: 'click',
        checkStrictly: true,
      },
      showCustomReportPath: false,
      customPathArr: [''],
      pathEditCustom: false,
      pathFroCustomEdit: [''],

      // 关联库表区, 编辑
      dsCascaderProps: {
        value: 'nodeId',
        emitPath: false,
        label: 'name',
        expandTrigger: 'click',
        checkStrictly: true,
      },
      relDbCustom: true,
      couldReldbCustom: true,
      editReldbItem: {}, // 关联图表 编辑对象
      reDbItemDs: '', // 关联图标 编辑项 nodeId 属性值
      dsCascaderTreeMap: {}, // option nodeid 2 option node
      dbid2Optionid: {}, // modelid 2 option nodeid
      relTablesArr: [], // 关联库表 正在编辑的项 选中模型中的所有表
      relColumnsArr: [], // 关联库表 正在编辑的项 选中表中的所有字段
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
      udps: [],
    }
  },

  components: {
    indexTreeDialog,
    // chooseTree,
    imageUpload,
    spanWithTooltip,
    // UserTop,
    dataSteward,
    groupDepartment,
  },

  computed: {
    canSkip() {
      return !this.reportFormManage.dataRequirementCode
    },
    disableCommitButton() {
      let result = false
      const arrValidate = [
        this.reportFormManage.name,
        this.reportFormManage.type,
        this.reportFormManage.owner,
        this.reportFormManage.owner,
      ]
      arrValidate.forEach(item => {
        if (!item) {
          result = true
        }
      })
      const index = this.nameArr.findIndex(item => {
        return item.name == this.reportFormManage.name
      })
      if (
        index === -1 ||
        (this.isEdit && this.nameArr[index].id == this.reportFormManage.id)
      ) {
      } else {
        result = true
      }
      return result
    },
    indexCnAbbr() {
      let result = ''
      if (this.showBottom === 'result') {
        result = this.indexMap[this.editObj.code]
          ? this.indexMap[this.editObj.code].name
          : ''
      } else if (this.showBottom === 'indexs') {
        result = this.indexMap[this.editObj.code]
          ? this.indexMap[this.editObj.code].name
          : ''
      } else {
        result = ''
      }
      return result
    },
    bottomTableLength() {
      const arr = this.getBottomArr()
      const arr2 = []
      for (let i = 0, len = arr.length; i < len; i++) {
        arr2[i] = i + 1
      }
      return arr2
    },
    editBottomItemConfirm() {
      let result = true
      if (this.editObj && (this.editObj.label || this.editObj.columnName)) {
        result = false
      }
      return result
    },
    importType() {
      const type = this.reportFormManage.biReportType
      const obj =
        this.importTypeArr &&
        this.importTypeArr.find(item => item.value === type)
      return obj ? obj.label : 'dd'
    },
    canComfirEditPath() {
      let result = true
      const arr = this.pathFroCustomEdit || ['']
      let hasEnd = false
      for (let len = arr.length, i = len; i >= 0; i--) {
        if (!hasEnd && arr[i]) {
          hasEnd = true
        } else if (hasEnd && !arr[i]) {
          result = false
        }
      }
      return result
    },
    // 编辑关联库表项时是否能够自动匹配
    couldAutoMatchReldb() {
      let result = true
      if (!this.reDbItemDs || !this.editReldbItem.customTableName) {
        result = false
      }
      return result
    },
    // 关联库表编辑 是否可以 确定
    couldConfirRelbdEdit() {
      let result = false
      if (this.relDbCustom) {
        if (
          this.editReldbItem.customTableName &&
          this.editReldbItem.customColName
        ) {
          result = true
        }
      } else {
        if (
          this.reDbItemDs &&
          this.editReldbItem.tableId &&
          this.editReldbItem.columnId
        ) {
          result = true
        }
      }
      return result
    },
    reqDeleted() {
      let result = true
      if (this.reportFormManage.dataRequirementId) {
        result = !this.dataRequirements.some(item => {
          return item.id === this.reportFormManage.dataRequirementId
        })
      } else {
        result = false
      }
      return result
    },
  },
  created() {
    this.getUdp()
  },
  mounted() {
    this.action = `${this.$url}/files/upload` // 上传图片地址
    self = this
    this.dataInit()
    this.getDbData()
    $(window).resize(this.resizeTable)

    setTimeout(this.changeToEditMode, 300)
    this.$nextTick(() => {
      this.setLine(this.showBottom)
    })
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resizeTable)
  },
  methods: {
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      if (!isJPG && !isPNG) {
        this.$message.error(this.$t('meta.report.uploadLimit'))
      }
      return isJPG || isPNG
    },
    handleUploadError(e) {
      this.$showUploadFailure(e)
    },
    handleUploadSuccess(res) {
      const fileId = res.fileId
      this.imageList.push(fileId)
      // this.addList.push(fileId)
    },
    resetImageList(e) {
      this.imageList = e
    },
    getUdp() {
      this.$http
        .post(`${this.$meta_url}/udps/getUdpsOfType?typeId=${82800002}`)
        .then(res => {
          const udpValuesMap = {}
          if (this.reportFormManage.udpValues) {
            this.reportFormManage.udpValues
              .split(this.updSeparator)
              .forEach(item => {
                udpValuesMap[item.split(':')[0]] = item.split(':')[1]
              })
          }
          const udps = res.data
          udps.forEach(item => {
            if (udpValuesMap[item.name]) {
              if (item.type === 'BOOL') {
                if (udpValuesMap[item.name] === 'true') {
                  item.value = true
                } else if (udpValuesMap[item.name] === 'false') {
                  item.value = false
                } else {
                  item.value = undefined
                }
              } else {
                item.value = udpValuesMap[item.name]
              }
            } else {
              if (item.type === 'BOOL') {
                item.value = undefined
              } else {
                item.value = ''
              }
            }
          })
          this.setUdpVal(udps)
        })
    },
    setUdpVal(udps) {
      this.$http
        .post(
          `${this.$meta_url}/udps/getItemUdps?itemId=${this.reportFormManage.id}&typeId=82800002`
        )
        .then(res => {
          let result = res.data
          result.forEach(r => {
            udps.forEach(udp => {
              if (udp.id === r.id) {
                const val = r.type === 'BOOL' ? r.value === 'true' : r.value
                this.$set(udp, 'value', val)
              }
            })
          })
          this.udps = udps
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    fillUdp() {
      const category = this.reportFormManage
      category.udps = []
      this.udps.forEach(u => {
        category.udps.push({
          id: u.id,
          value: u.value,
        })
      })
    },
    // 响应事件
    resizeTable() {},
    addReportFormManage() {
      if (this.pathEditCustom) {
        this.reportFormManage.path = this.customPathArr
      }
      if (this.reportFormManage.type === 'Analysis' && false) {
        this.reportFormManage.conditionArea =
          this.bottomDataDimension.length > 0 ? this.bottomDataDimension : null
        this.reportFormManage.resultArea =
          this.bottomDataIndexs.length > 0 ? this.bottomDataIndexs : null
      } else {
        this.reportFormManage.conditionArea =
          this.bottomDataRequirement.length > 0
            ? this.bottomDataRequirement
            : null
        this.reportFormManage.resultArea =
          this.bottomDataResult.length > 0 ? this.bottomDataResult : null
      }
      this.reportFormManage.relatedTable =
        this.bottomDataRelDbs.length > 0 ? this.bottomDataRelDbs : null
      const urlAdd =
        '?updateConditionArea=' +
        this.updateConditionArea +
        '&updateResultArea=' +
        this.updateResultArea +
        '&updateRelatedTable=' +
        this.updateRelatedTable
      let imgIds = []
      let removeImgList = []
      let addImgList = []
      const successHandle = () => {
        const addpara = {
          method: 'post',
          getUrl: fileIds => {
            return `${this.$url}/files/commitFile?fileIds=${fileIds}`
          },
          list: addImgList,
          failureCallback: e => {
            this.$showFailure(e)
          },
          skipError: true,
        }
        this.$httpListCallback(addpara)
        const delResPara = {
          method: 'post',
          getUrl: fileId => {
            return `${this.$url}/files/deleteFile?fileId=${fileId}`
          },
          list: removeImgList,
          failureCallback: e => {},
          skipError: true,
        }
        this.$httpListCallback(delResPara)

        this.$emit('editFinish')
      }
      addImgList = this.imageList
      imgIds = this.imageList
      if (this.$refs.imgUpload && this.$refs.imgUpload.getImgIdList) {
        const data = this.$refs.imgUpload.getImgIdList()
        removeImgList = data.removeList
      }
      this.reportFormManage.thumbnailFileIds = imgIds.join(',')
      this.fillUdp()
      if (
        Array.isArray(this.reportFormManage.path) &&
        this.reportFormManage.path.length === 1 &&
        this.reportFormManage.path[0] === ''
      ) {
        this.reportFormManage.path = null
      }
      if (!this.isEdit) {
        this.reportFormManage.code = null
        this.reportFormManage.dataRequirementCode =
          this.reportFormManage.dataRequirementCode || null
        this.reportFormManage.dataRequirementId =
          this.reportFormManage.dataRequirementId || null
        this.reportFormManage.dataRequirementName =
          this.reportFormManage.dataRequirementName || null
        this.reportFormManage.id = null
        // this.$http.post(this.reportFormManageUrl, this.reportFormManage)
        this.$http({
          method: 'post',
          url: this.reportFormManageUrl + urlAdd,
          data: this.reportFormManage,
        })
          .then(res => {
            this.$emit('editFinish', {
              ifClose: true,
              addName: this.reportFormManage.name,
              add: true,
            })
            this.$message.success(this.$t('meta.DS.message.addSucceed'))
            this.startEdit = false
            successHandle()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        let url = this.reportFormManageUrl
        url += 'update' + urlAdd
        this.$http
          .post(url, this.reportFormManage)
          .then(res => {
            this.$emit('editFinish')
            this.$message.success(this.$t('meta.DS.message.modifySucceed'))
            this.startEdit = false
            successHandle()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    removetab() {
      // this.$emit('removeTab');
      this.$emit('closeEdit')
      this.startEdit = false
      // this.dataInit();
      // this.$nextTick(() => {
      //   this.startEdit = false;
      //   this.resizeTable();
      // });
    },
    showReportBottom(bottom) {
      this.showBottom = bottom
      this.setLine(bottom)
      // const dom = this.$refs[bottom]
      // const left = dom.getBoundingClientRect().left - this.$refs.tabBox.getBoundingClientRect().left
      // this.$nextTick(() => {
      //   this.$refs.line.style.width = dom.offsetWidth + 'px'
      //   this.$refs.line.style.transform = 'translateX(' + left + 'px)'
      // })
    },
    setLine(bottom) {
      const dom = this.$refs[bottom]
      const left =
        dom.getBoundingClientRect().left -
        this.$refs.tabBox.getBoundingClientRect().left
      this.$nextTick(() => {
        this.$refs.line.style.width = dom.offsetWidth + 'px'
        this.$refs.line.style.transform = 'translateX(' + left + 'px)'
      })
    },
    handleTypeChange(value) {
      if (this.reportFormManage.type === 'Analysis' && false) {
        this.appType_analysis = true
        this.bottomDataDimension = this.bottomDataDimension || []
        this.bottomDataIndexs = this.bottomDataIndexs || []
      } else {
        this.appType_analysis = false
        this.bottomDataRequirement = this.bottomDataRequirement || []
        this.bottomDataResult = this.bottomDataResult || []
      }
      this.showBottom = 'imageData'
    },
    saveEditObj() {
      const obj = _.clone(this.editObj)
      const arr = this.getBottomArr()
      delete obj.index
      delete obj.ediType
      let flag = arr.some((a, idx) => {
        return (
          idx !== this.editObj.index && a.code !== null && a.code === obj.code
        )
      })
      if (flag && this.editObj.type === 'Index') {
        this.$message.warning(this.$t('meta.report.repeatWarn'))
      } else {
        if (this.editObj.index >= 0) {
          arr.splice(this.editObj.index, 1, obj)
        } else {
          arr.push(obj)
        }
        this.dialogEditVisible = false
      }
    },
    editReportBottom({ row, column, $index }) {
      this.editObj = {}
      for (const key in row) {
        this.$set(this.editObj, key, row[key])
      }
      this.$set(this.editObj, 'ediType', this.showBottom)
      this.$set(this.editObj, 'index', $index)
      this.dialogEditVisible = true
      this.setChangeTrue()
    },
    addTableItem() {
      const reportId =
        this.oldReportFormManage.id === 'add'
          ? null
          : this.oldReportFormManage.id
      let obj = {
        code: null,
        dataReportId: reportId,
        description: null,
        id: null,
      }
      if (
        this.showBottom === 'requirement' ||
        this.showBottom === 'dimension'
      ) {
        obj.label = null
      } else if (this.showBottom === 'result' || this.showBottom === 'indexs') {
        obj.columnName = null
        obj.type = 'Index'
      } else if (this.showBottom === 'relDb') {
        obj = {
          dataReportId: reportId,
          id: null,
          modelId: '',
          modelName: '',
          tableName: '',
          tableId: '',
          columnName: '',
          columnId: '',
          // customTableName: '',
          // customColName: '',
          // ediType: 'relDb',
        }
        // this.tableArr.splice(0, this.tableArr.length);
        // this.editReldbItem = obj;
        // this.reDbItemDs = null;
      }
      if (this.showBottom === 'relDb') {
        this.editReldb({ row: obj, $index: -1 })
      } else {
        this.editReportBottom({ row: obj, $index: -1 })
      }
    },
    editReldb({ row, column, $index }) {
      this.reDbItemDs = null
      this.relTablesArr = []
      this.relColumnsArr = []
      const oldData = _.cloneDeep(row)
      this.editReldbItem = {}
      for (const key in row) {
        this.$set(this.editReldbItem, key, row[key])
      }
      this.$set(this.editReldbItem, 'customTableName', '')
      this.$set(this.editReldbItem, 'customColName', '')
      this.$set(this.editReldbItem, 'ediType', this.showBottom)
      this.$set(this.editReldbItem, 'index', $index)
      this.editObj = this.editReldbItem
      // console.log(this.editReldbItem, 'editReldbItem')
      if ($index === -1) {
        this.couldReldbCustom = true
        this.relDbCustom = false
      } else if (row.modelId && row.tableId) {
        this.couldReldbCustom = false
        this.relDbCustom = false
        this.reDbItemDs = this.dbid2Optionid[row.modelId] || ''
        this.reDbDsChange(this.reDbItemDs)
        this.$nextTick(() => {
          this.editReldbItem.tableId = oldData.tableId
          this.relEditTableChange()
          if (oldData.columnId) {
            this.$nextTick(() => {
              this.editReldbItem.columnId = oldData.columnId
              // console.log(this.editReldbItem, 'this.editReldbItem')
            })
          }
        })
      } else {
        this.couldReldbCustom = true
        this.relDbCustom = true
        this.editReldbItem.customTableName = row.tableName
        this.editReldbItem.customColName = row.columnName
        this.editReldbItem.tableName = ''
        this.editReldbItem.columnName = ''
      }
      this.dialogEditVisible = true
      this.setChangeTrue()
    },
    // 匹配关联库表, 从自定义匹配到已存在的库表
    matchRelDb() {
      const tableName = this.editReldbItem.customTableName || ''
      const colName = this.editReldbItem.customColName || ''
      const tableData = this.relTablesArr.find(
        item =>
          (item.physicalName || '').toLowerCase() === tableName.toLowerCase()
      )
      if (tableData && tableData.objectId) {
        // 表匹配成功
        this.editReldbItem.tableId = tableData.objectId
        let matchCol = null
        let getColArrError = null
        const colMatchErrMsg = this.$t('meta.report.manuallyChoose')
        if (colName) {
          matchCol = data => {
            this.$nextTick(() => {
              const colData = this.relColumnsArr.find(
                col =>
                  (col.physicalName || '').toLowerCase() ===
                  colName.toLowerCase()
              )
              if (colData && colData.objectId) {
                this.editReldbItem.columnId = colData.objectId
                this.relEditColChange(colData.objectId)
                this.$message.success(this.$t('meta.report.matchSucceed'))
              } else {
                this.$showFailure(colMatchErrMsg)
              }
            })
          }
          getColArrError = e => {
            this.$showFailure(colMatchErrMsg)
            console.log(e)
          }
        } else {
          this.$message.success(this.$t('meta.report.matchSucceed'))
        }
        this.relEditTableChange(tableData.objectId, matchCol, getColArrError)
      } else {
        this.$showFailure(this.$t('meta.report.manuallyChoose1'))
      }
    },
    handleAddTable(data) {
      const reportId =
        this.oldReportFormManage.id === 'add'
          ? null
          : this.oldReportFormManage.id
      if (this.editObj.ediType !== 'relDb') {
        return
      }
      const arr = this.getBottomArr()
      // let emptyRelDb = {
      //   dataReportId: reportId,
      //   id: null,
      //   modelId: null,
      //   modelName: null,
      //   tableId: null,
      //   tableName: null,
      // };
      const obj = {
        dataReportId: reportId,
        id: null,
        modelId: data.parentId,
        modelName: data.parentPhysicalName,
        tableId: data.objectId,
        tableName: data.physicalName,
      }
      arr.push(obj)
      const prop = data.parentId + '/' + data.objectId
      this.$set(this.relDbChoosedMap, prop, true)
    },
    handleRemoveTable(data) {
      if (this.editObj.ediType !== 'relDb') {
        return
      }
      const arr = this.getBottomArr()
      const index = arr.findIndex(item => {
        return item.modelId === data.parentId && item.tableId === data.objectId
      })
      if (index !== -1) {
        arr.splice(index, 1)
        const prop = data.parentId + '/' + data.objectId
        this.$set(this.relDbChoosedMap, prop, false)
      }
    },
    deleteReportBottom({ row, column, $index }) {
      // this.$confirm('确定要删除？', '提示', {
      //     type: 'warning',
      //     cancelButtonText: '取消',
      //     confirmButtonText: '确定'
      //   })
      //   .then(() => {
      const arr = this.getBottomArr()
      arr.splice($index, 1)
      if (this.showBottom === 'relDb') {
        const data = row
        const prop = data.modelId + '/' + data.tableId
        this.relDbChoosedMap[prop] = false
      }
      this.setChangeTrue()
      // })
      // .catch(e => {console.log(e)});
    },
    /* goToRequire() {
      this.$confirm('确定要离开改页面？离开前请保存修改。', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      })
        .then(() => {
          this.$router.push({
            name: 'dataDemand',
            query: {
              requirementid: this.reportFormManage.dataRequirementCode,
            },
          })
        })
        .catch(e => {
          console.log(e)
        })
    }, */
    changeDataDemand(value) {
      const requirement = this.dataReqMap[value]
      if (value && requirement) {
        this.reportFormManage.dataRequirementCode = requirement.code
        this.reportFormManage.dataRequirementName = requirement.name
      } else if (!value) {
        this.reportFormManage.dataRequirementCode = ''
        this.reportFormManage.dataRequirementName = ''
      }
    },
    setLabel2Lat(value) {
      const index = this.dimensionOptions.findIndex(item => {
        return item.value === value
      })
      if (index !== -1) {
        const str = this.dimensionOptions[index].label
        if (this.editObj.ediType === 'requirement') {
          this.editObj.label = str
        } else if (
          this.editObj.ediType === 'result' &&
          !this.editObj.columnName
        ) {
          this.editObj.columnName = str
        } else if (this.editObj.ediType === 'dimension') {
          this.editObj.label = str
        }
      }
    },
    setLabel2Index(value) {
      if (this.editObj.ediType === 'result' && !this.editObj.columnName) {
        this.editObj.columnName = value
      } else if (
        this.editObj.ediType === 'indexs' &&
        !this.editObj.columnName
      ) {
        this.editObj.columnName = value
      }
    },
    resetIndex() {
      this.$refs.checkIndexDai.showDialog()
    },
    chickIndex(index) {
      if (this.showBottom === 'indexs' && this.dialogEditVisible) {
        this.$set(this.editObj, 'code', index.id)
        this.setLabel2Index(index.name)
      } else if (this.showBottom === 'result' && this.dialogEditVisible) {
        this.$set(this.editObj, 'code', index.id)
        this.setLabel2Index(index.name)
      }
      let type = ''
      if (index.type === 'CODE') {
        type = 'codes'
      } else if (index.type === 'BASE_CODE') {
        type = 'baseCodes'
      }
      // this.$http.get(this.$url + '/service/me/' + type + '/' + index.id)
      HTTP.getDomainItemDetail(index.id)
        .then(res => {
          if (res.data) {
            this.$set(this.editObj, 'description', res.data.description)
            this.$set(this.editObj, 'datatype', res.data.dataType)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    moveTableItem({ row, column, $index }) {
      const arr = this.getBottomArr()
      this.moveItem($index, this.moveItemValue, arr)
      this.moveItemValue = ''
      $(this.$refs.tableOuter)[0].click()
      this.setChangeTrue()
    },
    resetTableMap(arr) {
      const obj = {}
      arr.forEach(item => {
        obj[item.objectId + ''] = item
      })
      this.bottomTableMap = obj
    },
    skipToDAI({ row, column, $index }) {
      this.$confirm(
        this.$t('meta.report.leaveConfirm'),
        this.$t('meta.report.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          let obj = {}
          if (row.type === 'Lat') {
            obj = this.dimMap[row.code]
            let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('dimension', {
              catalogId: obj.catalogId,
            })
            location.href = pageUrl
          } else if (row.type === 'Index') {
            obj = this.indexMap[row.code]
            this.checkIndexExist(
              obj.id,
              () => {
                let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('index', {
                  domain: obj.id,
                })
                location.href = pageUrl
              },
              () => {
                this.$message.error(
                  this.$t('meta.report.notFind', { name: obj.name })
                )
              }
            )
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    /* skipToDim({ row, column, $index }) {
      this.$confirm('确定要离开改页面？离开前请保存修改。', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      })
        .then(() => {
          const obj = this.dimMap[row.code] || {}
          this.$router.push({
            name: 'dimension',
            query: { catalogId: obj.catalogId },
          })
        })
        .catch(e => {
          console.log(e)
        })
    }, */
    checkIndexExist(code, resolve, reject) {
      // this.$http.get(this.$url + `/service/me/codes/${code}`)
      HTTP.getDomainItemDetail(code)
        .then(res => {
          resolve()
        })
        .catch(() => {
          reject()
        })
    },
    /* skipToIndex({ row, column, $index }) {
      const obj = this.indexMap[row.code] || {}
      this.checkIndexExist(
        obj.id,
        () => {
          this.$confirm('确定要离开改页面？离开前请保存修改。', '提示', {
            type: 'warning',
            cancelButtonText: this.$t('common.button.cancel'),
            confirmButtonText: this.$t('common.button.ok'),
          })
            .then(() => {
              this.$router.push({
                name: 'index',
                query: { id: obj.id },
              })
            })
            .catch(e => {
              console.log(e)
            })
        },
        () => {
          this.$message.error(`指标库中找不到"${obj.name}",可能已经被删除`)
        }
      )
    }, */
    changeToEditMode() {
      this.startEdit = true
      if (this.reqDeleted) {
        this.reportFormManage.dataRequirementId = ''
        this.changeDataDemand('')
      }
      this.resizeTable()
      this.$nextTick(() => {
        if (this.oldReportFormManage.id !== 'add') {
          this.$refs.form.validateField('name')
        }
      })
    },
    // 处理显示的数据
    dataInit() {
      // 设置路径编辑
      this.customPathArr = ['']
      this.pathEditCustom = false

      // 数据需求模块 取消
      // this.getDataReq();

      this.reportFormManage = {}
      for (const key in this.emptyData) {
        this.$set(this.reportFormManage, key, this.emptyData[key])
      }
      if (this.oldReportFormManage.id === 'add') {
        this.startEdit = true
        // this.reportFormManage = {};
      } else {
        for (const key in this.oldReportFormManage) {
          this.reportFormManage[key] = this.oldReportFormManage[key]
        }
        // this.reportFormManage.dataRequirementId = this.reportFormManage.dataRequirementId || '';
        // this.reportFormManage.dataRequirementCode = this.reportFormManage.dataRequirementCode || '';
        this.reportFormManage.description =
          this.reportFormManage.description || ''
        this.isEdit = true
        this.getDetails()
        this.getResourceStatistics()
      }
    },
    getDetails() {
      // get data with bottom table array
      // this.$http.get(this.reportFormManageUrl + this.reportFormManage.id)
      this.reportDetailPro
        .then(res => {
          for (const key in res.data) {
            this.reportFormManage[key] = res.data[key]
          }
          const str = this.reportFormManage.thumbnailFileIds || ''
          const imageList = str.split(',')
          this.imageList = imageList.filter(item => {
            return !!item
          })
          if (this.reportFormManage.type === 'Analysis' && false) {
            this.bottomDataDimension = res.data.conditionArea
            this.bottomDataIndexs = res.data.resultArea
          } else {
            this.bottomDataRequirement = res.data.conditionArea
            this.bottomDataResult = res.data.resultArea
          }
          this.reportFormManage.description =
            this.reportFormManage.description || ''
          this.bottomDataRelDbs = res.data.relatedTable || []
          this.relDbChoosedMap = {}
          this.bottomDataRelDbs.forEach(item => {
            const prop = item.modelId + '/' + item.tableId
            this.$set(this.relDbChoosedMap, prop, true)
          })
          this.handleTypeChange()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getResourceStatistics() {
      this.$http
        .get(
          this.reportFormManageUrl +
            this.reportFormManage.id +
            '/resourceStatistics'
        )
        .then(res => {
          if (res.data && Array.isArray(res.data.content)) {
            this.bottomDataSourceCount = res.data.content
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    formatType(row, column, cellValue, index) {
      return this.typeMap[cellValue]
    },
    modelFormater(row, column, cellValue, index) {
      // console.log(row, 'rel table row')
      let result = ''
      if (row.modelName) {
        result = row.modelName
      } else {
        result = cellValue
      }
      return result
    },
    tableFormater(row, column, cellValue, index) {
      let result = ''
      if (row.tableName) {
        result = row.tableName
      } else {
        result = cellValue
      }
      return result
    },
    columnFormater(row, column, cellValue, index) {
      let result = ''
      if (row.columnName) {
        result = row.columnName
      } else {
        result = cellValue
      }
      return result
    },
    // 关联库表项 编辑, 修改数据源
    reDbDsChange(id, successedCallback) {
      id = id || this.reDbItemDs
      this.editReldbItem.tableId = ''
      const node = this.dsCascaderTreeMap[id]
      if (!node || !node.id) {
        this.relTablesArr = []
        return
      }
      this.editReldbItem.modelName = node.name
      this.editReldbItem.modelId = node.id
      const modelId = node.id
      const succesedCallback = data => {
        this.relTablesArr = data.content
        successedCallback && successedCallback()
      }
      const failureCallback = e => {
        this.$showFailure(e)
      }
      let para = {}
      if (node.type === 'SCHEMA' || node.type === 'MODEL_SCHEMA') {
        para = {
          schema: node.name,
          modelId,
        }
      } else {
        para = {
          modelId,
        }
      }
      HTTP.getAllTablesFromDam({
        succesedCallback,
        failureCallback,
        para,
      })
    },
    relEditTableChange(objectId, getDataCallback, getDataErrorCallback) {
      objectId = objectId || this.editReldbItem.tableId
      this.relColumnsArr = []
      this.editReldbItem.columnId = ''
      const tableData = this.relTablesArr.find(
        item => item.objectId === objectId
      )
      if (tableData) {
        this.editReldbItem.tableName = tableData.physicalName
        // this.editReldbItem.tableId = tableData.objectId;
      }
      const succesedCallback = data => {
        this.relColumnsArr = data
        getDataCallback && getDataCallback(data)
      }
      const failureCallback = e => {
        if (getDataErrorCallback) {
          getDataErrorCallback(e)
        } else {
          this.$showFailure(e)
        }
      }
      HTTP.getCatalogColumns({
        para: {
          objectId: objectId,
        },
        failureCallback,
        succesedCallback,
      })
    },
    relEditColChange(objectId) {
      objectId = objectId || this.editReldbItem.columnId
      const colData = this.relColumnsArr.find(
        item => item.objectId === objectId
      )
      if (colData) {
        this.editReldbItem.columnName = colData.physicalName
        // this.editReldbItem.columnId = colData.objectId;
      }
    },
    saveEditRelDbItem() {
      // bottomDataRelDbs
      const saObj = _.cloneDeep(this.editReldbItem)
      if (this.relDbCustom) {
        saObj.modelId = ''
        saObj.modelName = ''
        saObj.tableId = ''
        saObj.columnId = ''
        saObj.tableName = saObj.customTableName
        saObj.columnName = saObj.customColName
      }
      delete saObj.index
      delete saObj.ediType
      delete saObj.customTableName
      delete saObj.customColName
      if (this.editReldbItem.index >= 0) {
        // edit
        this.bottomDataRelDbs.splice(this.editReldbItem.index, 1, saObj)
      } else {
        // add
        this.bottomDataRelDbs.push(saObj)
      }
      this.dialogEditVisible = false
    },
    // 处理不直接显示的信息
    /* 获取 数据需求 信息 */
    getDataReq() {
      this.getDataDemand
        .then(res => {
          this.dataRequirements = res.data
          this.dataReqMap = {}
          this.dataRequirements.forEach(item => {
            this.dataReqMap[item.id] = item
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    /* 移动数组顺序 */
    moveItem(from, to, arr) {
      const item = arr.splice(from, 1)
      arr.splice(to - 1, 0, item[0])
      return arr
    },
    getBottomArr() {
      let arr = []
      switch (this.showBottom) {
        case 'requirement':
          arr = this.bottomDataRequirement
          break
        case 'result':
          arr = this.bottomDataResult
          break
        case 'dimension':
          arr = this.bottomDataDimension
          break
        case 'indexs':
          arr = this.bottomDataIndexs
          break
        case 'relDb':
          arr = this.bottomDataRelDbs
          break
      }
      return arr
    },
    setChangeTrue() {
      if (
        this.showBottom === 'requirement' ||
        this.showBottom === 'dimension'
      ) {
        this.updateConditionArea = true
      } else if (this.showBottom === 'result' || this.showBottom === 'indexs') {
        this.updateResultArea = true
      } else if (this.showBottom === 'relDb') {
        this.updateRelatedTable = true
      }
    },
    resetModel() {
      this.showChooseModel = true
    },
    getDbData() {
      /** 获取关联库表选项 tree 信息 */
      const sortByName = node => {
        const departments = node.subNodes
        this.$utils.sort.sortConsiderChineseNumber(departments)
      }
      this.getDataSourceTree
        .then(res => {
          const t = res.data.subNodes
          if (t != null) {
            sortByName(res.data)
            t.forEach(item => {
              sortByName(item)
            })
            this.chooseTreeData = this.data2Casopts(t)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    data2Casopts(arr) {
      const dsCascaderTreeMap = {}
      const dbid2Optionid = {}
      let idCount = 1
      const arr2 = []
      const dealwithNode = node => {
        const children = []
        node.subNodes &&
          node.subNodes.forEach(subnode => {
            const newSub = dealwithNode(subnode)
            children.push(newSub)
          })
        const newNode = {
          id: node.id,
          type: node.type,
          name: node.name,
          disabled: !(
            node.type === 'MODEL' ||
            node.type === 'SCHEMA' ||
            node.type === 'MODEL_SCHEMA'
          ),
          children: children.length > 0 ? children : null,
          nodeId: idCount++,
        }
        dsCascaderTreeMap[newNode.nodeId] = newNode
        if (
          newNode.type === 'MODEL' ||
          newNode.type === 'MODEL_SCHEMA'
          // newNode.type === 'SCHEMA'
        ) {
          dbid2Optionid[newNode.id] = newNode.nodeId
        }
        this.dbid2Optionid = dbid2Optionid
        return newNode
      }
      arr.forEach(item => {
        const newNode = dealwithNode(item)
        arr2.push(newNode)
      })
      this.dsCascaderTreeMap = dsCascaderTreeMap
      return arr2
    },
    /* getrelatedData() {
      this.$http
        .get(this.reportFormManageUrl + '/')
        .then(res => {
          // TODO
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }, */
    isTableChoosed(data) {
      const prop = data.parentId + '/' + data.objectId
      return this.relDbChoosedMap[prop]
    },
    skip2Url(url) {
      const index = url.indexOf('http://')
      if (index === -1) {
        url = 'http://' + url
      }
      window.open(url)
    },
    toggleEditModel() {
      this.pathEditCustom = !this.pathEditCustom
      const path = this.reportFormManage.path || ['']
      this.customPathArr = this.customPathArr || [...path]
    },
    showEditPathDialog() {
      const path = this.customPathArr || ['']
      this.pathFroCustomEdit = [...path]
      this.showCustomReportPath = true
    },
    comfirEditPath() {
      // this.reportFormManage.path = this.customPathArr;
      const arr = []
      const pathArr = this.pathFroCustomEdit
      if (pathArr && Array.isArray(pathArr) && pathArr.length > 0) {
        for (let i = 0, len = pathArr.length; i < len; i++) {
          if (pathArr[i]) {
            arr.push(pathArr[i])
          } else {
            break
          }
        }
      }
      this.customPathArr = arr.length ? arr : null
      this.showCustomReportPath = false
    },
    cancelEditPath() {
      this.showCustomReportPath = false
    },
    addPathArr(index) {
      this.pathFroCustomEdit.splice(index, 0, '')
    },
    removePathArr(index) {
      this.pathFroCustomEdit.splice(index, 1)
    },
  },
  watch: {
    bottomDataRequirement() {
      this.resizeTable()
    },
    bottomDataResult() {
      this.resizeTable()
    },
    bottomDataDimension() {
      this.resizeTable()
    },
    bottomDataIndexs() {
      this.resizeTable()
    },
    bottomDataRelDbs() {
      this.resizeTable()
    },
    showBottom() {
      this.resizeTable()
    },
  },
  filters: {
    formatDaI: ({ row, cellValue }) => {
      let result = ''
      if (row.type === 'Lat') {
        // 维度
        result = self.dimMap[cellValue] ? self.dimMap[cellValue].catalog : ''
      } else if (row.type === 'Index') {
        // 指标
        result = self.indexMap[cellValue] ? self.indexMap[cellValue].name : ''
      } else if (row.type === 'Other') {
        // 普通
        result = cellValue
      }
      return result
    },
    formatDim({ row, cellValue }) {
      let name = ''
      if (self.dimMap[cellValue]) {
        name = self.dimMap[cellValue].catalog || self.dimMap[cellValue].value
      }
      if (!name) {
        name = cellValue
      }
      return name
    },
    indexFormat({ row, cellValue }) {
      if (self.indexMap[cellValue]) {
        return self.indexMap[cellValue].name
      }
    },
    pathFormat(para) {
      para = para || []
      let result = ''
      if (para && Array.isArray(para) && para.length > 0) {
        result = para.join(' / ')
      } else {
        result = '/'
      }
      return result
    },
  },
}
