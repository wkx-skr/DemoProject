import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import SortBaseInfo from '../components/sortBaseInfo.vue'
import RecognitionRules from '../components/recognitionRules.vue'
import SafetyStandards from '../components/safetyStandards.vue'
import MappingData from '../components/mappingData.vue'
import ItemAttr from '../components/itemAttr.vue'
import AddStandard from '../components/addStandard.vue'
import API from '../util/api'
import folder from '../../../assets/images/search/folder.svg'
import {
  AttrsTypeEnum,
  assetsTypeEnum,
} from '@/view/dataSecurity/util/attrEnum'
export default {
  components: {
    SortBaseInfo,
    SafetyStandards,
    ItemAttr,
    RecognitionRules,
    MappingData,
    AddStandard,
  },
  data() {
    const hasManageAuth = this.$auth.DATA_SECURITY_CATALOG_MANAGE
    return {
      canNew: true,
      rightLoading: false,
      hasManageAuth,
      fileList: [],
      uploadShow: false,
      uploadUrl: '',
      treeLoading: false,
      AttrsTypeEnum: AttrsTypeEnum,
      level: 1,
      isEdit: false,
      visible: false,
      minScreen: false,
      breadcrumbNodes: [],
      showSecuritySort: false,
      rules: [],
      treeKey: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf',
      },
      securityForm: {},
      allLevelList: [],
      levelList: [],
      allDegreeList: [],
      degreeList: [],
      allRangeList: [],
      rangeList: [],
      allObjectList: [],
      objectList: [],
      allImportList: [],
      importList: [],
      allStatuteList: [],
      statuteList: [],
      activeName: 'first',
      describe: '描述',
      isOpen: true,
      infoList: [],
      // 识别规则
      ruleForm: {
        name: '',
        type: '',
        page: 1,
        size: 20,
        sort: 'ascending',
      },
      discernList: [
        {
          id: 1,
          name: '识别1',
        },
        {
          id: 2,
          name: '识别2',
        },
      ],
      ruleData: null,
      ruleTotal: 0,
      ruleSelections: [],
      attrsMap: [],
      structureVos: [],
      curCatalogTree: {}, // 当前选中的目录树(树节点右侧更多直接点击的)
      heightCatalog: {}, // 高亮的目录树
      highId: '', // 高亮id
      hasAttr: false,
      curComment: '', // 用于取消编辑时，还原
      udps: [],
      classifyTitle: '新建安全分类',
      allTreeList: [], // 所有树目录
      isOneLevel: true,
      nameList: [],
      expandArr: [],
      resolve: null,
      curType: '', // 当前状态，add，edit，delete
      searchList: [],
      desBox: 47,
      showClose: false,
      rootNode: null,
    }
  },
  watch: {
    heightCatalog: {
      async handler(val, old) {
        if (val) {
          this.$nextTick(() => {
            this.desBox = $(this.$refs.desBox).height()
          })
          if (val.id) {
            this.$refs.tree.setCurrentKey(val.id)
            this.hasAttr = this.getIsInfoItem(val.assetsType.split(','))
            this.securityForm = await this.getCatalogInfo(val)
            this.getRightAttr()
            this.getNode()
          } else {
            this.hasAttr = false
          }
        }
      },
      immediate: true,
      deep: true,
    },
  },
  async mounted() {
    const nameValidatePass = async (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入分类名称'))
      } else {
        // 判断是否含不允许输入的特殊字符
        const reg = /[#/\\@$_%<>]/gi
        if (reg.test(value)) {
          callback(new Error('名称不允许包含#/\\@$_%<>等特殊字符'))
        } else {
          callback()
        }
      }
    }
    this.initResizeHorizontal()
    this.uploadUrl = `${this.$url}/service/datasecurity/catalog/upload`
    this.desBox = $(this.$refs.desBox).height()
    window.onresize = () => {
      this.$nextTick(() => {
        this.desBox = $(this.$refs.desBox).height()
      })
    }
    this.rules = {
      name: [
        {
          required: true,
          // message: '请输入分类名称',
          validator: nameValidatePass,
          trigger: 'blur',
        },
      ],
      levelId: [
        {
          required: true,
          message: '请选择安全等级',
          trigger: 'change',
        },
      ],
      impactDegreeId: [
        {
          required: true,
          message: '请选择影响程度',
          trigger: 'change',
        },
      ],
      scopeId: [
        {
          required: true,
          message: '请选择影响范围',
          trigger: 'change',
        },
      ],
      objectId: [
        {
          required: true,
          message: '请选择影响对象',
          trigger: 'change',
        },
      ],
      importId: [
        {
          required: true,
          message: '请选择重要程度',
          trigger: 'change',
        },
      ],
      // statuteId: [
      //   {
      //     required: true,
      //     message: '请选择法规',
      //     trigger: 'change',
      //   },
      // ],
      // article: [
      //   {
      //     required: true,
      //     message: '请输入条文',
      //     trigger: 'blur',
      //   },
      // ],
    }
    this.initForm()
    this.getAttrs()
  },
  methods: {
    clear() {
      this.showClose = false
      this.$refs.loadSelect.blur()
    },
    visibleChange(val) {
      if (!val) {
        this.showClose = false
      }
    },
    beforeUpload(file) {
      if (!this.checkFileValidation(file, ['xlsx'])) {
        this.$blauShowFailure(this.$t('assets.catalogue.importLimit'))
        return false
      }
    },
    checkFileValidation(file, supported) {
      const fileName = file.name
      const splitedName = fileName.split('.')
      const puffix = splitedName[splitedName.length - 1]
      return supported.indexOf(puffix) !== -1
    },
    // 上传时，文件变化的回调
    handleChange(file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (!this.checkFileValidation(fileList[i], ['xlsx'])) {
          this.$blauShowFailure('请选择xlsx格式文件')
          this.fileList = []
          this.$refs.calssifyUpload.showList = []
          this.$refs.calssifyUpload.$refs.upload.uploadFiles = []
          return false
        }
      }
      this.fileList = fileList
      if (fileList && fileList.length >= 2) {
        this.$DatablauCofirm('仅支持上传一个文件，是否覆盖？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            fileList.shift()
            this.fileList = fileList
          })
          .catch(e => {
            fileList.pop()
            this.fileList = fileList
          })
      }
      if (file.status === 'success') {
        this.fileList = []
        this.uploadShow = false
        this.$bus.$emit('getTaskJobResult', file.response, 'import')
      }
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    // 导入文件上传失败
    handleUploadError(e) {
      this.$showUploadFailure(e)
    },
    uploadSure() {
      this.$refs.calssifyUpload.$refs.upload.submit()
    },
    handleFocus() {
      if (!this.treeKey && !this.showClose) {
        this.nameList = []
      }
    },
    getCatalogName(key) {
      if (key) {
        this.showClose = true
        API.classifySearch(key)
          .then(res => {
            res.data.map(item => {
              item.name = item.catalogPathName + item.name
            })
            this.nameList = res.data || []
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.nameList = []
      }
    },
    async getTreeList(idList, nameList) {
      this.treeLoading = true
      for (let i = 0; i < idList.length; i++) {
        const { data } = await API.getClassifyTree(idList[i])
        let treeList = data.DataSecurityStructureVo.catalogVos || []
        treeList.map(async item => {
          const newList = this.structureVos.filter(
            o => o.level === item.level && o.structureId === item.structureId
          )
          item.catalogNamePath = nameList.slice(0, i + 1).join('/')
          item.icon = newList[0].icon
          this.allTreeList.push(item)
        })
      }
      // console.log(this.allTreeList)
      this.treeData = this.getTreeStructure(this.allTreeList, this.structureVos)

      const itemList = this.allTreeList.filter(
        item => item.id === parseFloat(this.treeKey)
      )
      this.heightCatalog = itemList[0]
      this.curCatalogTree = itemList[0]
      setTimeout(() => {
        this.$refs.tree.expandTopLevel()
        this.$refs.tree.filter(itemList[0].name)
        this.treeLoading = false
      }, 100)
    },
    async selectCatalogName(keyId) {
      if (keyId) {
        this.showClose = false
        this.allTreeList = []
        this.$refs.tree.$data.store.lazy = false
        const itemMap = this.nameList.filter(
          item => item.id === parseFloat(keyId)
        )[0]
        const nameList = itemMap.name.split('/')
        let idList = itemMap.catalogPath.split('/').filter(item => item !== '')
        await this.getTreeList(idList, nameList)
        this.$refs.tree.setCurrentKey(keyId)
      } else {
        this.$refs.tree.$data.store.lazy = true
        this.getTree(0, this.resolve)
      }
    },
    getUdpsList(level) {
      this.udps =
        this.structureVos.filter(item => item.level === level)[0].udpVo || []
      this.getRulesVerify(true)
    },
    // 获取面包靴
    getNode() {
      if (this.heightCatalog.catalogNamePath) {
        const newList = this.heightCatalog.catalogNamePath.split('/')
        let nodeList = []
        const catalogPathList = this.heightCatalog.catalogPath.split('/')
        newList.map((item, index) => {
          let newMap = {}
          newMap.name = item
          if (index === newList.length - 1) {
            newMap.id = parseInt(this.heightCatalog.id)
          } else {
            newMap.id = parseInt(catalogPathList[index + 1])
          }
          nodeList.push(newMap)
        })
        this.breadcrumbNodes = nodeList
      }
    },
    handleBreadcrumb(data) {
      this.allTreeList.map(item => {
        if (item.id === data.id) {
          this.handleNodeClick(item)
        }
      })
    },
    goBack() {
      const len = this.breadcrumbNodes.length
      if (len === 1) {
        this.$datablauMessage({
          message: '当前为第一级目录，无法返回',
          type: 'warning',
        })
      } else {
        const data = this.breadcrumbNodes[len - 2]
        this.allTreeList.map(item => {
          if (item.id === data.id) {
            this.handleNodeClick(item)
          }
        })
      }
    },
    // 判断扩展属性是否有效
    validateExtendProps(rule, value, callback) {
      const udp = this.udps.find(u => u.propName === rule.field)
      let valid = true
      if (udp && udp.type === 'STRING')
        valid = !!udp.value && !!udp.value.trim().length
      if (udp && udp.type === 'NUM') valid = udp.value === 0 || udp.value
      if (udp && udp.type === 'ENUM') valid = !!udp.value
      if (valid) {
        callback()
      } else {
        callback(new Error(this.$t('assets.catalogue.completeExtendProps')))
      }
    },
    // 添加扩展属性规则验证
    getRulesVerify(isAdd = false) {
      this.udps.map(u => {
        if (isAdd) {
          // 新建时，清空属性值
          u.value = ''
        }
        if (u.type === 'NUM' && !u.value) {
          u.value = undefined
        }
        if (u.required) {
          this.$set(this.rules, u.propName, [
            {
              required: true,
              validator: this.validateExtendProps,
              trigger: ['blur', 'change'],
            },
          ])
        }
      })
    },
    // 初始化安全目录属性
    initForm() {
      this.securityForm = {
        name: '',
        levelId: '',
        impactDegreeId: '',
        scopeId: '',
        objectId: '',
        importId: '',
        statuteId: '',
        article: '',
        comment: '',
      }
    },
    getAttrs(data) {
      this.attrsMap = [
        {
          name: '安全等级',
          type: AttrsTypeEnum.LEVEL,
          children: [],
        },
        {
          name: '重要程度',
          type: AttrsTypeEnum.IMPORTANCE,
          children: [],
        },
        {
          name: '影响对象',
          type: AttrsTypeEnum.OBJECT,
          children: [],
        },
        {
          name: '影响范围',
          type: AttrsTypeEnum.SCOPE,
          children: [],
        },
        {
          name: '影响程度',
          type: AttrsTypeEnum.DEGREE,
          children: [],
        },
      ]
      API.getLevelData()
        .then(res => {
          const data = res.data.data
          this.attrsMap.map(item => {
            const newList = data.filter(o => o.classificationType === item.type)
            item.children = newList.map(m => {
              return Object.assign({}, m.tag)
            })
            item.children.sort((a, b) => {
              return a.tagId - b.tagId
            })
          })
          this.attrsMap.map(item => {
            switch (item.type) {
              case AttrsTypeEnum.LEVEL:
                this.allLevelList = item.children
                this.levelList = this.allLevelList
                break
              case AttrsTypeEnum.SCOPE:
                // 获取影响范围list
                this.allRangeList = item.children
                this.rangeList = this.allRangeList
                break
              case AttrsTypeEnum.DEGREE:
                // 获取影响程度list
                this.allDegreeList = item.children
                this.degreeList = this.allDegreeList
                break
              case AttrsTypeEnum.OBJECT:
                // 获取影响对象list
                this.allObjectList = item.children
                this.objectList = this.allObjectList
                break
              case AttrsTypeEnum.IMPORTANCE:
                this.allImportList = item.children
                this.importList = this.allImportList
                break
              default:
                break
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 局部刷新树节点
    refreshTreeNode(id) {
      if (id) {
        const node = this.$refs.tree.getNode(id)
        if (node) {
          node.loaded = false
          node.expand()
        }
      } else {
        this.rootNode.childNodes = [] // 清空根节点
        this.treeLoading = true
        this.loadCallback(this.rootNode, this.resolve)
      }
    },
    dataIconFunction(data, node) {
      return data.icon
        ? window.setting.restApiPathName +
            '/service/ddc/config/icon/' +
            data.icon
        : folder
    },
    dataOptionsFunction(data, node) {
      this.curCatalogTree = data
      const newList = this.structureVos.filter(o => o.level === data.level)
      const lastLeaf = this.structureVos.length === data.level
      const hasInfo = newList[0].assetsTypes.includes(
        assetsTypeEnum.INFO_OBJECT
      )
      const options = []
      if (this.hasManageAuth) {
        let label = ''
        if (data.name) {
          label =
            data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
        }
        if (!lastLeaf) {
          options.push({
            icon: 'iconfont icon-tianjia',
            label: '新建子类',
            callback: () => {
              this.level = data.level
              this.showAdd(data)
            },
            args: 'folder',
          })
        }
        if (hasInfo) {
          options.push({
            icon: 'iconfont icon-tianjia',
            label: '添加信息项',
            callback: () => {
              this.showBind(data)
            },
            args: 'folder',
          })
        }
        options.push({
          icon: 'iconfont icon-revise',
          label: '修改分类',
          callback: () => {
            this.editCatalog(data, node)
          },
          args: 'folder',
        })
        options.push({
          icon: 'iconfont icon-delete',
          label: '删除分类',
          callback: () => {
            this.deleteCatalog(data)
          },
          args: 'folder',
        })
      }
      return options
    },
    async getTree(id, resolve, name, isLazy = true) {
      const { data } = await API.getClassifyTree(id)
      this.structureVos = data.DataSecurityStructureVo.detailVos
      this.statuteList = data.DataSecurityRegulation
      let treeList
      if (id === 0) {
        this.allTreeList = []
      }
      treeList = data.DataSecurityStructureVo.catalogVos || []
      if (treeList.length > 0) {
        treeList.map(async item => {
          const newList = this.structureVos.filter(o => o.level === item.level)
          if (name) {
            item.catalogNamePath = `${name}/${item.name}`
          } else {
            item.catalogNamePath = item.name
          }
          item.icon = newList[0].icon
          const result = this.allTreeList.some(o => o.id === item.id)
          if (result) {
            const index = this.allTreeList.findIndex(o => o.id === item.id)
            this.allTreeList.splice(index, 1, item)
          } else {
            this.allTreeList.push(item)
          }
        })
      }
      this.treeLoading = false
      this.rightLoading = false
      if (id === 0) {
        this.treeData = treeList
      }
      if (isLazy) {
        // const newArr = treeList.slice(0, 500)
        this.$nextTick(() => {
          if (!this.highId) {
            this.highId = treeList[0].id
          }
          this.heightCatalog = this.allTreeList.filter(
            m => m.id === this.highId
          )[0]
        })
        return resolve(treeList)
      }
    },
    getTreeStructure(treeList, attrList) {
      let newArray = []
      treeList.map(item => {
        const newList = attrList.filter(
          o => o.level === item.level && o.structureId === item.structureId
        )
        item.icon = newList[0].icon
        if (item.parentId === 0) {
          newArray.push(item)
        }
      })
      arrToTree(treeList, newArray)
      function arrToTree(list, arr) {
        arr.forEach(res => {
          list.forEach((ret, index) => {
            if (res.id === ret.parentId) {
              if (!res.hasOwnProperty('children')) {
                res.children = []
              }
              res.children.push(ret)
            }
          })
          if (res.hasOwnProperty('children')) {
            arrToTree(list, res.children)
          }
        })
      }
      this.treeData = newArray
      return newArray
    },
    async loadCallback(node, resolve) {
      this.resolve = resolve
      if (node.level === 0) {
        this.rootNode = node
        this.treeLoading = true
        this.getTree(0, resolve)
      } else {
        this.getTree(node.data.id, resolve, node.data.catalogNamePath)
      }
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-box'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.classify-right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 240, leftMaxWidth: 800 },
        })
      }, 1000)
    },
    getIsInfoItem(curTypeList) {
      const hasAttr =
        curTypeList.includes(assetsTypeEnum.INFO_OBJECT) ||
        curTypeList.includes(assetsTypeEnum.DATA_COLLECTION) ||
        curTypeList.includes(assetsTypeEnum.DATA_OBJECT)
      return hasAttr
    },
    async addCatalog(evt) {
      this.isEdit = false
      this.isOneLevel = true
      await this.getUdpsList(1)
      this.classifyTitle = '新建安全分类'
      const curTypeList = this.structureVos.filter(item => item.level === 1)[0]
        .assetsTypes
      await this.getIsInfoItem(curTypeList)
      this.curCatalogTree = this.structureVos.filter(
        item => item.level === 1
      )[0]
      const x = evt.clientX
      const y = evt.clientY
      const options = []
      options.push(
        {
          icon: 'iconfont icon-tianjia',
          label: '新建安全分类',
          callback: data => {
            this.addSecurity()
          },
        },
        {
          icon: 'iconfont icon-import',
          label: '导入安全分类',
          callback: () => {
            this.importSecurity()
          },
        },
        {
          icon: 'iconfont icon-export',
          label: '导出安全分类',
          callback: () => {
            this.exportSecurity()
          },
        }
      )
      if (options.length > 0) {
        let yOfResult = y
        let bottomMargin = 30 * options.length + 15
        if (window.innerHeight - y < bottomMargin) {
          yOfResult = window.innerHeight - bottomMargin
        }
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: yOfResult,
          options: options,
        })
      }
    },
    // 获取右侧目录的基本属性
    getRightAttr() {
      let udpList = []
      if (this.udps.length > 0) {
        this.udps.map(item => {
          const newMap = {
            key: item.propName,
            value: item.value,
            icon: '/static/images/metadataIcon/udp.svg',
          }
          udpList.push(newMap)
        })
      }
      let attrList = []
      let basisList = []
      let systemList = []
      if (this.hasAttr) {
        attrList = [
          {
            key: '影响对象',
            value: this.securityForm.dataInfluenceObject
              ? this.securityForm.dataInfluenceObject.name
              : '',
            icon: '/static/images/metadataIcon/influenceObject.svg',
          },
          {
            key: '影响范围',
            value: this.securityForm.dataInfluenceScope
              ? this.securityForm.dataInfluenceScope.name
              : '',
            icon: '/static/images/metadataIcon/influenceScope.svg',
          },
          {
            key: '重要程度',
            value: this.securityForm.dataImportance
              ? this.securityForm.dataImportance.name
              : '',
            icon: '/static/images/metadataIcon/importance.svg',
          },
          {
            key: '影响程度',
            value: this.securityForm.dataImpactDegree
              ? this.securityForm.dataImpactDegree.name
              : '',
            icon: '/static/images/metadataIcon/impactDegree.svg',
          },
          {
            key: '安全等级',
            value: this.securityForm.securityLevel
              ? this.securityForm.securityLevel.name
              : '',
            icon: '/static/images/metadataIcon/safetyLevel.svg',
          },
        ]
        basisList = [
          {
            key: '法规',
            value: this.securityForm.dataSecurityRegulation
              ? this.securityForm.dataSecurityRegulation.sourceName
              : '',
            icon: '/static/images/metadataIcon/statute.svg',
          },
          {
            key: '条文',
            value: this.securityForm.article,
            icon: '/static/images/metadataIcon/article.svg',
          },
        ]
      }
      systemList = [
        {
          key: '创建人',
          value: this.securityForm.creator,
          icon: '/static/images/metadataIcon/creator.svg',
        },
        {
          key: '创建时间',
          value: this.securityForm.createTime,
          icon: '/static/images/metadataIcon/creationTime.svg',
        },
        {
          key: '最后修改时间',
          value: this.securityForm.modifyTime,
          icon: '/static/images/metadataIcon/modifyTime.svg',
        },
      ]
      this.infoList = [
        {
          title: '数据安全评定依据',
          id: 1,
          data: attrList,
        },
        {
          title: '判定依据',
          id: 2,
          data: basisList,
        },
        {
          title: '扩展属性',
          id: 3,
          data: udpList,
        },
        {
          title: '系统属性',
          id: 4,
          data: systemList,
        },
      ]
    },
    async handleNodeClick(data) {
      this.heightCatalog = data
      this.curCatalogTree = data
      this.highId = data.id
    },
    async addSecurity() {
      this.hasAttr = await this.getIsInfoItem(this.structureVos[0].assetsTypes)
      await this.initForm()
      this.showSecuritySort = true
    },
    importSecurity() {
      this.uploadShow = true
    },
    exportSecurity() {
      API.exportSecurityClassification().then(res => {
        this.$bus.$emit('getTaskJobResult', res.data, 'export')
      })
      // const url = this.$url + `/service/datasecurity/catalog/export`
      // this.$downloadFile(url, { fileName: '导出安全分类' })
    },
    // 下载导入模板
    modelDownload() {
      const url = this.$url + `/service/datasecurity/catalog/export/template`
      this.$downloadFile(url, { fileName: '下载安全分类模板' })
    },
    close(name) {
      this.$refs[name].resetFields()
      this.showSecuritySort = false
    },
    sure(name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          // 接口没返回前，不能连续提交
          if (this.canNew) {
            this.submitForm()
          }
        } else {
          return false
        }
      })
    },
    submitForm() {
      this.canNew = false
      let level
      if (this.isOneLevel) {
        level = this.curCatalogTree.level
      } else {
        level = this.curCatalogTree.level + 1
      }
      let parentId, id, catalogTypeId, article
      if (this.isEdit) {
        parentId = this.curCatalogTree.parentId
        id = this.curCatalogTree.id
        catalogTypeId = this.curCatalogTree.catalogTypeId
      } else {
        parentId = this.isOneLevel ? 0 : this.curCatalogTree.id
        catalogTypeId = this.structureVos.filter(
          item => item.level === level
        )[0].catalogTypeId
      }
      let attrMap
      if (this.hasAttr) {
        attrMap = {
          securityId: this.securityForm.levelId, // 安全分类id
          importanceId: this.securityForm.importId, // 重要程度id
          impactId: this.securityForm.impactDegreeId, // 影响程度id
          influenceObjectId: this.securityForm.objectId, // 影响对象id
          influenceScopeId: this.securityForm.scopeId, // 影响范围id
          regulationId: this.securityForm.statuteId, // 法规id
          article: this.securityForm.article, // 条文
        }
      }
      const params = {
        level, // 第几级目录
        name: this.securityForm.name, // 目录名称
        comment: this.securityForm.comment, // 目录描述
        id, // 当前目录id
        parentId, // 当前目录的父级id
        catalogTypeId, // 目录类型id
        structureId: this.curCatalogTree.structureId, // 目录结构id（预留）
        ...attrMap,
        udpDtos: this.udps,
      }
      if (this.isEdit) {
        this.highId = id
        API.modifyClassifyCatalog(params)
          .then(res => {
            this.canNew = true
            this.rightLoading = true
            this.refreshTreeNode(parentId)
            this.$datablauMessage.success('修改成功')
            this.curType = 'edit'
            this.showSecuritySort = false
          })
          .catch(e => {
            this.canNew = true
            this.$showFailure(e)
          })
      } else {
        API.newClassifyCatalog(params)
          .then(async res => {
            this.highId = res.data
            this.canNew = true
            this.showSecuritySort = false
            const id = this.isOneLevel ? 0 : this.curCatalogTree.id
            const name =
              this.curCatalogTree.level === 0
                ? ''
                : this.curCatalogTree.catalogNamePath
            this.refreshTreeNode(id)
            this.$datablauMessage.success('新建成功')
            this.curType = 'add'
          })
          .catch(e => {
            this.canNew = true
            this.$showFailure(e)
          })
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      if (data.type === 'ALL' || data.type === 'ALLFILE') {
        return true
      }
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      return false
    },
    async showAdd(data) {
      this.isEdit = false
      await this.getUdpsList(data.level + 1)
      this.isOneLevel = false
      this.classifyTitle = '新建安全分类'
      const nextList = this.structureVos.filter(o => o.level === data.level + 1)
      this.hasAttr = await this.getIsInfoItem(nextList[0].assetsTypes)
      await this.initForm()
      this.showSecuritySort = true
    },
    showBind() {
      this.visible = true
    },
    judgeUdps() {
      const result = this.udps.some(item => item.required && !item.value)
      return result
    },
    async getCatalogInfo(params) {
      const id = params.id
      const newList = this.structureVos.filter(o => o.level === params.level)
      this.hasAttr = await this.getIsInfoItem(newList[0].assetsTypes)
      const { data } = await API.getClassifyDetail(id)
      this.udps = data.dataSecurityUdpVo
      let isUpds = false
      if (this.udps.length > 0) {
        isUpds = await this.judgeUdps()
      }
      if (this.udps.length > 0) {
        this.getRulesVerify()
      }
      if (this.hasAttr) {
        if (
          data.securityLevel &&
          data.dataImportance &&
          data.dataImpactDegree &&
          data.dataInfluenceScope &&
          data.dataInfluenceObject &&
          !isUpds
        ) {
        } else {
          this.$datablauMessage.warning(
            '【安全等级，影响对象， 影响范围 ，影响程度，重要程度，扩展属性】属性是必填字段，请先完善属性内容。'
          )
        }
        this.securityForm.levelId = data.securityLevel
          ? data.securityLevel.tagId
          : ''
        this.securityForm.importId = data.dataImportance
          ? data.dataImportance.tagId
          : ''
        this.securityForm.impactDegreeId = data.dataImpactDegree
          ? data.dataImpactDegree.tagId
          : ''
        this.securityForm.scopeId = data.dataInfluenceScope
          ? data.dataInfluenceScope.tagId
          : ''
        this.securityForm.objectId = data.dataInfluenceObject
          ? data.dataInfluenceObject.tagId
          : ''
        this.securityForm.statuteId = data.dataSecurityRegulation
          ? data.dataSecurityRegulation.id
          : ''
        this.securityForm = { ...this.securityForm, ...data }
      } else {
        this.securityForm = data
      }
      return this.securityForm
    },
    async editCatalog(data, node) {
      this.$datablauLoading.message()
      this.isEdit = true
      this.classifyTitle = `修改安全分类`
      await this.getCatalogInfo(data)
      this.curCatalogTree = data
      this.showSecuritySort = true
      this.$datablauLoading.close()
    },
    deleteCatalog(data) {
      this.$DatablauCofirm(`确认要删除“${data.name}”目录？`, '提示', {
        type: 'warning',
      }).then(async () => {
        API.delClassifyCatalog(data.id)
          .then(res => {
            this.$datablauMessage.success('删除成功')
            this.refreshTreeNode(data.parentId)
            this.curType = 'delete'
            const node = this.$refs.tree.getNode(data.id)
            if (data.parentId) {
              this.highId = node.parent.data.id
              this.handleNodeClick(node.parent.data)
            } else {
              this.highId = 0
              // console.log(node)
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    // 子组件传来的方法
    async clickChild(name, options) {
      switch (name) {
        case 'baseInfo':
          this.isEdit = true
          this.showSecuritySort = true
          this.curCatalogTree = options.data
          this.securityForm = await this.getCatalogInfo(options.data)
          break
        case 'addStandard':
          if (options.type === 'close') {
            this.visible = false
          }
          if (options.type === 'submit') {
            if (this.activeName === 'second') {
              this.$refs.safetyStandards.getList()
            }
            this.visible = false
          }
          if (options.type === 'add') {
            this.visible = true
          }
          break
        default:
          break
      }
    },
    handleClick(node) {
      this.activeName = node.name
      if (this.activeName === 'second') {
        this.isOpen = true
      }
    },
    operationOpen(params) {
      this.isOpen = params.isOpen
      this.minScreen = params.minScreen
    },
    // ----------------------  识别规则部分  ---------------------------
  },
}
