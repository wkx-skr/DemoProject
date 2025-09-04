import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import SortBaseInfo from '../components/sortBaseInfo.vue'
import SafetyStandards from '../components/safetyStandards.vue'
import MappingData from '../components/mappingData.vue'
import ItemAttr from '../components/itemAttr.vue'
import AddStandard from '../components/addStandard.vue'
import API from '../util/api'
import folder from '../../../assets/images/search/folder.svg'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
import {
  AttrsTypeEnum,
  assetsTypeEnum,
} from '@/view/dataSecurity/util/attrEnum'
export default {
  components: {
    SortBaseInfo,
    SafetyStandards,
    ItemAttr,
    MappingData,
    AddStandard,
    isShowTooltip,
  },
  data() {
    const hasManageAuth = this.$auth.DATA_SECURITY_CATALOG_MANAGE
    return {
      treeShow: true,
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
      isSee: false,
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
      levelList: [],
      degreeList: [],
      rangeList: [],
      objectList: [],
      importList: [],
      sensitiveList: [],
      statuteList: [],
      activeName: 'first',
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
      classifyTitle: '',
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
      title: '',
      hasItem: false,
      queryId: '',
      isView: false,
      viewLoading: false,
    }
  },
  watch: {
    heightCatalog: {
      async handler(val, old) {
        if (val && !this.queryId) {
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
    this.title = this.$t('accessControl.securityCatalog')
    const query = this.$route.query
    if (query.id) {
      this.viewLoading = true
      this.queryId = query.id
      this.isView = true

      const { data: structionData } = await API.getClassifyTree(0)
      this.structureVos = structionData.DataSecurityStructureVo.detailVos
      const { data } = await API.getClassifyDetail(query.id)
      const newMap = this.structureVos.filter(o => o.level === data.level)[0]
      const item = {
        ...data,
        catalogType: newMap.name,
        icon: newMap.icon,
        assetsType: newMap.assetsTypes.join(','),
      }
      this.hasAttr = await this.getIsInfoItem(newMap.assetsTypes)
      await this.getUdpsList(newMap.level)
      this.securityForm = await this.getCatalogInfo(item)
      this.handleNodeClick(item)
      this.breadcrumbNodes = []
      $('#db-main').css({ left: 0, top: 0, zIndex: 999 })
      this.getRightAttr()
      this.viewLoading = false
    } else {
      this.initForm()
    }
    const nameValidatePass = async (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('securityModule.input')))
      } else {
        // 判断是否含不允许输入的特殊字符
        const reg = /[#/\\@$_%<>]/gi
        if (reg.test(value)) {
          callback(new Error(this.$t('securityModule.inputTip')))
        } else {
          callback()
        }
      }
    }
    this.initResizeHorizontal()
    this.uploadUrl = `/datasecurity/datasecurity/catalog/upload`
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
          validator: nameValidatePass,
          trigger: 'blur',
        },
      ],
      levelId: [
        {
          required: true,
          message: this.$t('securityModule.placeSelect'),
          trigger: 'change',
        },
      ],
      // impactDegreeId: [
      //   {
      //     required: true,
      //     message: '请选择影响程度',
      //     trigger: 'change',
      //   },
      // ],
      // scopeId: [
      //   {
      //     required: true,
      //     message: '请选择影响范围',
      //     trigger: 'change',
      //   },
      // ],
      // objectId: [
      //   {
      //     required: true,
      //     message: '请选择影响对象',
      //     trigger: 'change',
      //   },
      // ],
      // importId: [
      //   {
      //     required: true,
      //     message: '请选择重要程度',
      //     trigger: 'change',
      //   },
      // ],
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
        this.$datablauMessage.error(this.$t('accessControl.importLimit'))
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
          this.$datablauMessage.error(this.$t('accessControl.importLimit'))
          this.fileList = []
          this.$refs.calssifyUpload.showList = []
          this.$refs.calssifyUpload.$refs.upload.uploadFiles = []
          return false
        }
      }
      this.fileList = fileList
      if (fileList && fileList.length >= 2) {
        this.$DatablauCofirm(this.$t('securityModule.singleUploadTip'))
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
      this.treeData = this.getTreeStructure(this.allTreeList, this.structureVos)
      const itemList = this.allTreeList.filter(
        item => item.id === parseFloat(this.treeKey)
      )
      setTimeout(() => {
        this.heightCatalog = itemList[0]
        this.curCatalogTree = itemList[0]
        this.highId = itemList[0].id
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
        this.highId = ''
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
      if (this.queryId) {
        window.close()
        return
      }
      const len = this.breadcrumbNodes.length
      if (len === 1) {
        this.$datablauMessage({
          message: this.$t('accessControl.cannotBack'),
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
        callback(new Error(this.$t('accessControl.completeExtendProps')))
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
        sensitiveId: '',
        article: '',
        comment: '',
      }
    },
    getAttrs(data) {
      this.attrsMap = [
        {
          name: this.$t('securityModule.securityLevel'),
          type: AttrsTypeEnum.LEVEL,
          children: [],
        },
        {
          name: this.$t('securityModule.importance'),
          type: AttrsTypeEnum.IMPORTANCE,
          children: [],
        },
        {
          name: this.$t('securityModule.affectedObjects'),
          type: AttrsTypeEnum.OBJECT,
          children: [],
        },
        {
          name: this.$t('securityModule.reach'),
          type: AttrsTypeEnum.SCOPE,
          children: [],
        },
        {
          name: this.$t('securityModule.impactLevel'),
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
                this.levelList = item.children
                break
              case AttrsTypeEnum.SCOPE:
                // 获取影响范围list
                this.rangeList = item.children
                break
              case AttrsTypeEnum.DEGREE:
                // 获取影响程度list
                this.degreeList = item.children
                break
              case AttrsTypeEnum.OBJECT:
                // 获取影响对象list
                this.objectList = item.children
                break
              case AttrsTypeEnum.IMPORTANCE:
                this.importList = item.children
                break
              case AttrsTypeEnum.SENSITIVE:
                this.sensitiveList = item.children
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
        ? window.setting.iconApiPathName +
            '/datasecurity/datasecurity/structure/icon/' +
            data.icon
        : folder
    },
    dataOptionsFunction(data, node) {
      this.curCatalogTree = data
      const newList = this.structureVos.filter(o => o.level === data.level)
      const lastLeaf = this.structureVos.length === data.level
      const hasInfo =
        newList[0].assetsTypes.includes(assetsTypeEnum.DATA_OBJECT) ||
        newList[0].assetsTypes.includes(assetsTypeEnum.TABLE) ||
        newList[0].assetsTypes.includes(assetsTypeEnum.VIEW)
      const hasItem = newList[0].assetsTypes.includes(
        assetsTypeEnum.DATA_OBJECT
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
            label: this.$t('securityModule.new'),
            callback: () => {
              this.level = data.level
              this.showAdd(data)
            },
            args: 'folder',
          })
        }
        if (hasItem && this.hasManageAuth) {
          options.push({
            icon: 'iconfont icon-tianjia',
            label: this.$t('accessControl.addInfoItem'),
            callback: () => {
              this.showBind(data)
            },
            args: 'folder',
          })
        }
        options.push({
          icon: 'iconfont icon-revise',
          label: this.$t('securityModule.edit'),
          callback: () => {
            this.editCatalog(data, node)
          },
          args: 'folder',
        })
        options.push({
          icon: 'iconfont icon-delete',
          label: this.$t('securityModule.delete'),
          callback: () => {
            this.deleteCatalog(data)
          },
          args: 'folder',
        })
      }
      if (this.$auth.DATA_SECURITY_CATALOG) {
        options.push({
          icon: 'iconfont icon-see',
          label: this.$t('securityModule.view'),
          callback: () => {
            this.editCatalog(data, node, true)
          },
          args: 'folder',
        })
      }
      return options
    },
    async getTree(id, resolve, name, isLazy = true) {
      try {
        const { data } = await API.getClassifyTree(id)
        this.treeShow = true
        this.structureVos = data.DataSecurityStructureVo.detailVos
        this.statuteList = data.DataSecurityRegulation
        let treeList
        if (id === 0) {
          this.allTreeList = []
        }
        treeList = data.DataSecurityStructureVo.catalogVos || []
        if (treeList.length > 0) {
          treeList.map(async item => {
            const newList = this.structureVos.filter(
              o => o.level === item.level
            )
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
          this.$nextTick(() => {
            if (treeList.length > 0) {
              if (!this.highId) {
                this.highId = treeList[0].id
              }
              this.heightCatalog = this.allTreeList.filter(
                m => m.id === this.highId
              )[0]
            }
          })
          this.$utils.sort.sortConsiderChineseNumber(treeList, 'name')
          return resolve(treeList)
        }
      } catch (e) {
        this.treeShow = false
        this.treeLoading = false
        this.$showFailure(e)
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
        curTypeList.includes(assetsTypeEnum.DATA_OBJECT) ||
        curTypeList.includes(assetsTypeEnum.TABLE) ||
        curTypeList.includes(assetsTypeEnum.VIEW)
      return hasAttr
    },
    async addCatalog(evt) {
      this.isEdit = false
      this.isSee = false
      this.isOneLevel = true
      await this.getUdpsList(1)
      this.classifyTitle = this.$t('securityModule.new') + this.title
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
          label: this.$t('securityModule.new'),
          callback: data => {
            this.addSecurity()
          },
        },
        {
          icon: 'iconfont icon-import',
          label: this.$t('accessControl.importSecurity'),
          callback: () => {
            this.importSecurity()
          },
        },
        {
          icon: 'iconfont icon-export',
          label: this.$t('accessControl.exportSecurity'),
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
            icon: require('../../../../static/images/metadataIcon/udp.svg'),
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
            key: this.$t('securityModule.affectedObjects'),
            value: this.securityForm.dataInfluenceObject
              ? this.securityForm.dataInfluenceObject.name
              : '',
            icon: require('../../../../static/images/metadataIcon/influenceObject.svg'),
          },
          {
            key: this.$t('securityModule.reach'),
            value: this.securityForm.dataInfluenceScope
              ? this.securityForm.dataInfluenceScope.name
              : '',
            icon: require('../../../../static/images/metadataIcon/influenceScope.svg'),
          },
          {
            key: this.$t('securityModule.importance'),
            value: this.securityForm.dataImportance
              ? this.securityForm.dataImportance.name
              : '',
            icon: require('../../../../static/images/metadataIcon/importance.svg'),
          },
          {
            key: this.$t('securityModule.impactLevel'),
            value: this.securityForm.dataImpactDegree
              ? this.securityForm.dataImpactDegree.name
              : '',
            icon: require('../../../../static/images/metadataIcon/impactDegree.svg'),
          },
          {
            key: this.$t('securityModule.securityLevel'),
            value: this.securityForm.securityLevel
              ? this.securityForm.securityLevel.name
              : '',
            icon: require('../../../../static/images/metadataIcon/safetyLevel.svg'),
          },
        ]
        basisList = [
          {
            key: this.$t('accessControl.fagui'),
            value: this.securityForm.dataSecurityRegulation
              ? this.securityForm.dataSecurityRegulation.sourceName
              : '',
            icon: require('../../../../static/images/metadataIcon/statute.svg'),
          },
          {
            key: this.$t('accessControl.article'),
            value: this.securityForm.article,
            icon: require('../../../../static/images/metadataIcon/article.svg'),
          },
        ]
      }
      systemList = [
        {
          key: this.$t('securityModule.creator'),
          value: this.securityForm.creator,
          icon: require('../../../../static/images/metadataIcon/creator.svg'),
        },
        {
          key: this.$t('securityModule.creationTime'),
          value: this.securityForm.createTime,
          icon: require('../../../../static/images/metadataIcon/creationTime.svg'),
        },
        {
          key: this.$t('accessControl.modifyTime'),
          value: this.securityForm.modifyTime,
          icon: require('../../../../static/images/metadataIcon/modifyTime.svg'),
        },
      ]
      this.infoList = [
        {
          title: this.$t('accessControl.secuirtyEvaluate'),
          id: 1,
          data: attrList,
        },
        {
          title: this.$t('securityModule.extendAttr'),
          id: 3,
          data: udpList,
        },
        {
          title: this.$t('accessControl.systemAttr'),
          id: 4,
          data: systemList,
        },
      ]
      if (this.$versionFeature.datasecurity_Regulations) {
        this.infoList.splice(1, 0, {
          title: this.$t('accessControl.evaluate'),
          id: 2,
          data: basisList,
        })
      }
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
    },
    // 下载数据分类模板
    modelDownload() {
      const url = `/datasecurity/datasecurity/catalog/export/template`
      this.$downloadFile(url, {
        fileName: this.$t('accessControl.downloadTem'),
      })
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
          securityId: this.securityForm.levelId, // 数据分类id
          importanceId: this.securityForm.importId, // 重要程度id
          impactId: this.securityForm.impactDegreeId, // 影响程度id
          influenceObjectId: this.securityForm.objectId, // 影响对象id
          influenceScopeId: this.securityForm.scopeId, // 影响范围id
          regulationId: this.securityForm.statuteId, // 法规id
          sensitiveId: this.securityForm.sensitiveId, // 敏感数据id
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
            this.$datablauMessage.success(this.$t('securityModule.editSuccess'))
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
            this.$datablauMessage.success(this.$t('securityModule.newSuccess'))
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
      return data.name.indexOf(value) !== -1
    },
    async showAdd(data) {
      this.isSee = false
      this.isEdit = false
      await this.getUdpsList(data.level + 1)
      this.isOneLevel = false
      this.classifyTitle = this.$t('securityModule.new') + this.title
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
    async getCatalogInfo(params, isTip = true) {
      const id = params.id
      const newList = this.structureVos.filter(o => o.level === params.level)
      this.hasAttr = await this.getIsInfoItem(newList[0].assetsTypes)
      const { data } = await API.getClassifyDetail(id, this.isSee)
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
          // data.dataImportance &&
          // data.dataImpactDegree &&
          // data.dataInfluenceScope &&
          // data.dataInfluenceObject &&
          !isUpds
        ) {
        } else {
          if (this.heightCatalog.id === id && isTip) {
            this.$datablauMessage.warning(this.$t('accessControl.attrTip'))
          }
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
        this.securityForm.sensitiveId = data.sensitiveTag
          ? data.sensitiveTag.tagId
          : ''
        this.securityForm = { ...this.securityForm, ...data }
      } else {
        if (isUpds && isTip) {
          this.$datablauMessage.warning(this.$t('accessControl.attrTip1'))
        }
        this.securityForm = data
      }
      return this.securityForm
    },
    async editCatalog(data, node, bool = false) {
      if (bool) {
        // 判断是查看或编辑
        this.isSee = true
        this.isEdit = false
        this.classifyTitle = this.$t('securityModule.view') + this.title
      } else {
        this.isEdit = true
        this.isSee = false
        this.classifyTitle = this.$t('securityModule.edit') + this.title
      }
      await this.getUdpsList(data.level)
      await this.getCatalogInfo(data, false)
      this.curCatalogTree = data
      this.showSecuritySort = true
      this.$datablauLoading.close()
    },
    deleteCatalog(data) {
      let tipContent = ''
      if (data.leaf) {
        tipContent = this.$t('securityModule.sureDelTip1', {
          name: data.name,
        })
      } else {
        tipContent = this.$t('securityModule.delTip1', {
          name: data.name,
        })
      }
      this.$DatablauCofirm(tipContent, this.$t('accessControl.delCatalog'))
        .then(() => {
          API.delClassifyCatalog(data.id)
            .then(res => {
              this.$datablauMessage.success(
                this.$t('securityModule.delSuccess')
              )
              this.refreshTreeNode(data.parentId)
              this.curType = 'delete'
              const node = this.$refs.tree.getNode(data.id)
              if (data.parentId) {
                this.highId = node.parent.data.id
                this.handleNodeClick(node.parent.data)
              } else {
                this.highId = 0
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.log(e)
        })
    },
    // 子组件传来的方法
    async clickChild(name, options) {
      switch (name) {
        case 'baseInfo':
          this.isEdit = true
          this.isSee = false
          this.classifyTitle = this.$t('securityModule.edit') + this.title
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
            this.curCatalogTree = options.data
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
