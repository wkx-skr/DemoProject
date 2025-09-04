import UserSelect from '../../components/common/UserSelect.vue'
import udps from './udps.vue'
import standardDetail from './standardDetail.vue'
import quoto from './quoto.vue'
import scan from './standardScan.vue'
import folderDetail from './folderDetail.vue'
import updatedDomain from './updatedDomain.vue'
import HTTP from '@/http/main.js'
import applyDetail from '@/view/processControl/applyDetail.vue'
import editDim from '@/view/index/dim.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal.js'

export default {
  components: {
    UserSelect,
    udps,
    standardDetail,
    quoto,
    scan,
    folderDetail,
    updatedDomain,
    applyDetail,
    editDim,
  },
  props: {
    typeIds: {
      default: 1,
    },
    // field domain
    hasEditAuth: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    var nameValidatePass = (rule, value, callback) => {
      if (this.addObj.name === '') {
        callback(new Error(this.$t('domain.domain.classificationNameRequired')))
      } else if (this.nameArr.includes(this.addObj.name)) {
        callback(new Error(this.$t('domain.domain.classificationNameExisted')))
      } else {
        callback()
      }
    }
    var nameValidatePass1 = (rule, value, callback) => {
      if (this.changeObj.name === '') {
        callback(new Error(this.$t('domain.domain.classificationNameRequired')))
      } else if (this.nameArr.includes(this.changeObj.name)) {
        callback(new Error(this.$t('domain.domain.classificationNameExisted')))
      } else {
        callback()
      }
    }
    return {
      three: null,
      isAdopting: false,
      options: [],
      udps: [],
      showUdps: false,
      currentTab: 'details',
      showAddTab: false,
      hasAccess: false,
      containID: true,
      /* TREE */
      keyword: '',
      //    hasAccess:true,
      keywordSetTimeout: null,
      treeBox: undefined,
      defaultProps: {
        children: 'nodes',
        label: 'name',
        id: 'id',
      },
      expandedKeys: [],
      state: 'A',

      treeLoading: false,
      treeData: [],
      checkedList: [],
      checkedListLength: 0,
      /* END OF TREE */
      /*
       * About Assign Examine
       */
      showExamineDialog: false,
      lockAssignBtn: false,
      userSelect1: null,
      queryFirstTime: true,
      nowFolder: null,
      nowDomainId: null,
      nowDomain: null,
      uploading: false,

      contentStatus: 'scan', // 'write','add'

      updatingDetails: null,
      treeKey: 0,

      emailDialogVisible: false,
      emailDialogDomainIds: null,
      emailForDdm: true,
      emailForDam: true,

      domainCodes: null,
      rejectDialogVisible: false,
      rejectComment: '',
      domainHasComment: new Map(),
      showWorkflowDialog: false,
      formDtosData: [],
      showX: false,
      showD: false,
      showThemeDialog: false,
      addThemeDialog: false,
      changeThemeDialog: false,
      showThemeData: {},
      newClassName: '',
      nameArr: [],
      nameArr2: [],
      currentClassName: '',
      parentPath: '',
      addObj: {
        parentId: null,
        name: '',
        order: undefined,
        description: '',
      },
      changeObj: {},
      dataArr: [],
      newClassDescription: '',
      currentPathIds: [],
      allOrganizations: [],
      dims: [],
      getDataTypeOptionsPromise: null,
      isDerive: false,
      isUploadPublishedStandard: false,
      // stas:localStorage.getItem('status')
      uploadDialogVisible: false,
      showShareFile: false,
      nodeData: [],
      rulePram: {
        name: {
          required: true,
          validator: nameValidatePass,
          trigger: 'blur',
        },
      },
      rulePram1: {
        name: {
          required: true,
          validator: nameValidatePass1,
          trigger: 'blur',
        },
      },
      defaultCurrentNode: '',
      autoCode: false,
      accept: '.xlsx',
      autoCodeDisabled: null,
      formFile: [],
    }
  },
  created() {
    this.getAllOrgs()
    if (this.useDam) {
      this.getDataTypeOptionsPromise = HTTP.getSelectionOptions({
        requestBody: {
          category: 'DOMAIN',
          names: ['数据类型'],
        },
      })
    } else {
      this.getDataTypeOptionsPromise = new Promise(resolve => {
        // TODO i18n
        let data = [
          {
            id: 34,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'BOOLEAN',
            parentId: 65,
            parentOptionValue: this.$t('domain.common.dataTypeMap.integer'),
          },
          {
            id: 35,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'BYTE',
            parentId: 65,
            parentOptionValue: this.$t('domain.common.dataTypeMap.integer'),
          },
          {
            id: 36,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'SMALL',
            parentId: 65,
            parentOptionValue: this.$t('domain.common.dataTypeMap.integer'),
          },
          {
            id: 37,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'INTEGER',
            parentId: 65,
            parentOptionValue: this.$t('domain.common.dataTypeMap.integer'),
          },
          {
            id: 38,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'LONG',
            parentId: 65,
            parentOptionValue: this.$t('domain.common.dataTypeMap.integer'),
          },
          {
            id: 39,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'HUGE',
            parentId: 65,
            parentOptionValue: this.$t('domain.common.dataTypeMap.integer'),
          },
          {
            id: 40,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'INTERVAL',
            parentId: 65,
            parentOptionValue: this.$t('domain.common.dataTypeMap.integer'),
          },
          {
            id: 41,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'UNIQUEID',
            parentId: 65,
            parentOptionValue: this.$t('domain.common.dataTypeMap.integer'),
          },
          {
            id: 42,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'DECIMAL',
            parentId: 66,
            parentOptionValue: this.$t('domain.common.dataTypeMap.realNumber'),
          },
          {
            id: 43,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'DOUBLE',
            parentId: 66,
            parentOptionValue: this.$t('domain.common.dataTypeMap.realNumber'),
          },
          {
            id: 44,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'FLOAT',
            parentId: 66,
            parentOptionValue: this.$t('domain.common.dataTypeMap.realNumber'),
          },
          {
            id: 45,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'MONEY',
            parentId: 66,
            parentOptionValue: this.$t('domain.common.dataTypeMap.realNumber'),
          },
          {
            id: 46,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'NUMBER',
            parentId: 66,
            parentOptionValue: this.$t('domain.common.dataTypeMap.realNumber'),
          },
          {
            id: 47,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'NUMERIC',
            parentId: 66,
            parentOptionValue: this.$t('domain.common.dataTypeMap.realNumber'),
          },
          {
            id: 48,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'SHORT FLOAT',
            parentId: 66,
            parentOptionValue: this.$t('domain.common.dataTypeMap.realNumber'),
          },
          {
            id: 49,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'LONG FLOAT',
            parentId: 66,
            parentOptionValue: this.$t('domain.common.dataTypeMap.realNumber'),
          },
          {
            id: 50,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'AUDIO',
            parentId: 67,
            parentOptionValue: this.$t('domain.common.dataTypeMap.binary'),
          },
          {
            id: 51,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'BINARY',
            parentId: 67,
            parentOptionValue: this.$t('domain.common.dataTypeMap.binary'),
          },
          {
            id: 52,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'IMAGE',
            parentId: 67,
            parentOptionValue: this.$t('domain.common.dataTypeMap.binary'),
          },
          {
            id: 53,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'LARGE BINARY',
            parentId: 67,
            parentOptionValue: this.$t('domain.common.dataTypeMap.binary'),
          },
          {
            id: 54,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'SECURITY_ID',
            parentId: 67,
            parentOptionValue: this.$t('domain.common.dataTypeMap.binary'),
          },
          {
            id: 55,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'VIDEO',
            parentId: 67,
            parentOptionValue: this.$t('domain.common.dataTypeMap.binary'),
          },
          {
            id: 56,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'SPATIAL',
            parentId: 67,
            parentOptionValue: this.$t('domain.common.dataTypeMap.binary'),
          },
          {
            id: 57,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'DATE',
            parentId: 68,
            parentOptionValue: this.$t('domain.common.dataTypeMap.time'),
          },
          {
            id: 58,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'TIME',
            parentId: 68,
            parentOptionValue: this.$t('domain.common.dataTypeMap.time'),
          },
          {
            id: 59,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'VARCHAR',
            parentId: 69,
            parentOptionValue: this.$t('domain.common.dataTypeMap.string'),
          },
          {
            id: 60,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'CHAR',
            parentId: 69,
            parentOptionValue: this.$t('domain.common.dataTypeMap.string'),
          },
          {
            id: 61,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'NCHAR',
            parentId: 69,
            parentOptionValue: this.$t('domain.common.dataTypeMap.string'),
          },
          {
            id: 62,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'NVARCHAR',
            parentId: 69,
            parentOptionValue: this.$t('domain.common.dataTypeMap.string'),
          },
          {
            id: 63,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'TEXT',
            parentId: 69,
            parentOptionValue: this.$t('domain.common.dataTypeMap.string'),
          },
          {
            id: 64,
            optionCategory: 'DOMAIN',
            optionName: this.$t('domain.common.dataType'),
            optionValue: 'LONG TEXT',
            parentId: 69,
            parentOptionValue: this.$t('domain.common.dataTypeMap.string'),
          },
        ]
        resolve({ data })
      })
    }
  },
  mounted() {
    // console.log(this.typeIds);
    // this.getDomainCodes();
    if (this.$route.query.domain || this.$route.query.domainId) {
      this.contentStatus = 'scan'
      this.nowDomain = {}
    }
    this.hasAccess = this.$auth.ROLE_DOMAIN_ADMIN
    this.initEventListener()
    this.addNavEventListener()
    this.innerLoadStandard()
    this.treeBox = $('.tree-box')[0]
    this.getUdps()
    this.initResizeHorizontal()

    this.$bus.$on('reloadStandard', () => {
      this.innerLoadStandard()
    })
    this.$bus.$on('goToDomain', domainObj => this.goToDomain(domainObj))
    this.$bus.$on('gotDims', data => {
      this.dims = data
    })
  },
  beforeDestroy() {
    this.$bus.$off('userNameChange')
    this.$bus.$off('reloadStandard')
    this.$bus.$off('goToDomain')
    this.$message.closeAll()
    this.$bus.$off('gotDims')
  },
  methods: {
    elRadioSelect(state) {
      if (this.typeIds !== 2) {
        if (this.$auth.DATA_STANDARD_IMPORT_DIRECT) {
          this.isUploadPublishedStandard = state
        }
      } else if (this.typeIds === 2) {
        if (this.$auth.DATA_STANDARD_DIM_IMPORT_DIRECT) {
          this.isUploadPublishedStandard = state
        }
      }
    },
    getDomainCodes() {},
    goToUpdate(details) {
      this.state = 'D'
      $('.tab-box.tri [state=D]').click()
      this.updatingDetails = details
      //      this.nowDomainId = null;this.nowDomain = null; //Todo
      setTimeout(() => {
        this.updatingDetails = null
      }, 3000)
    },
    getUdps() {
      this.showUdps = false
      HTTP.getUpds({ categoryId: this.typeIds })
        .then(res => {
          let data = res.data
          if (data && Array.isArray(data)) {
            data = data.filter(
              item => item.bindFolderId - 0 === this.typeIds - 0
            )
          } else {
            data = []
          }
          this.udps = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-area'),
          middleDom: $('.tree-area-margin-right'),
          rightDom: $('.content-area'),
          outerDom: $('.domain-component-outer'),
          leftPaddingCor: 0,
          noCrack: true,
          minWith: { leftMinWidth: 240 },
          callback: this.treeListDragCallback,
        })
      }, 1000)
    },
    treeListDragCallback() {},
    initEventListener() {
      this.$bus.$on('userNameChange', item => {
        this.userSelect1 = item
      })
    },
    addNavEventListener() {
      const self = this
      var tab = $('.tab-box')
      tab.on('click', '.link', function () {
        $(this).siblings().removeClass('checked')
        $(this).addClass('checked')
        self.state = $(this).attr('state')
      })
    },
    dataIconFunction(data, node) {
      let className = ''
      // console.log(data, 'data')
      if (data.code) {
        className = 'tree-icon domain'
        if (data.updatingId) {
          className += ' is-updating'
        }
      } else {
        if (node.expanded) {
          className = 'iconfont icon-openfile'
        } else {
          className = 'iconfont icon-file'
        }
      }
      return className
    },
    dataOptionsFunction(data, node) {
      const options = []
      if (!data.code) {
        options.push({
          icon: 'iconfont icon-see',
          label: this.$t('domain.domain.checkCategory'),
          callback: () => {
            this.commandHandle('show', data)
          },
          args: 'folder',
        })
        let catalogAuth = true

        if (this.typeIds === 1) {
          // 基础标准
          catalogAuth = !!this.$auth.DATA_STANDARD_CATALOG
        } else if (this.typeIds === 2) {
          // 指标
          catalogAuth = !!this.$auth.DATA_STANDARD_DIM_CATALOG
        } else {
          // 领域标准
          // TODO
          // 现在领域标准使用基础标准权限, 后续添加自己的权限
          catalogAuth = !!this.hasEditAuth && !!this.$auth.DATA_STANDARD_CATALOG
        }

        if (catalogAuth) {
          options.push({
            icon: 'iconfont icon-tianjia',
            label: this.$t('domain.domain.addPeer'),
            callback: () => {
              this.commandHandle('addSame', data, node)
            },
            args: 'folder',
          })
          options.push({
            icon: 'iconfont icon-tianjia',
            label: this.$t('domain.domain.addSub'),
            callback: () => {
              this.commandHandle('addNext', data, node)
            },
            args: 'folder',
          })
          options.push({
            icon: 'iconfont icon-revise',
            label: this.$t('domain.domain.changeClassification'),
            callback: () => {
              this.commandHandle('change', data)
            },
            args: 'folder',
          })
          options.push({
            icon: 'iconfont icon-delete',
            label: this.$t('domain.domain.deleteClassification'),
            callback: () => {
              this.commandHandle('delete', data)
            },
            args: 'folder',
          })
        }
      }

      return options
    },
    commandHandle(command, data, node) {
      this.parentPath = ''
      this.getParentPath(this.treeData, data.parentId)
      switch (command) {
        case 'show':
          this.showTheme(data)
          break
        case 'addSame':
          this.addChildTheme(data, 'same', node)
          break
        case 'addNext':
          this.addChildTheme(data, 'next', node)
          break
        case 'change':
          this.changeTheme(data)
          break
        case 'delete':
          this.deleteTheme(data)
          break
      }
    },

    showTheme(data) {
      this.showThemeDialog = true
      this.showThemeData = data
      // this.getUserByIds([data.createUser])
    },
    addChildTheme(data, type, node) {
      this.nameArr = []
      if (type === 'same') {
        // add peer
        if (!data.parentId) {
          this.$message.error(this.$t('domain.domain.rootNoPeer'))
          return
        }
        this.getBrotherClassName(this.treeData, data.parentId)
        this.addObj = {
          parentId: data.parentId,
          name: '',
          order: node.parent.childNodes.length + 1,
          description: '',
        }
      } else {
        // add sub
        this.parentPath = this.parentPath
          ? `${this.parentPath}/${data.name}`
          : data.name
        this.nameArr = data.nodes ? data.nodes.map(e => e.name) : []
        this.addObj = {
          parentId: data.foldId,
          name: '',
          order: node.childNodes.length + 1,
          description: '',
        }
      }
      this.addThemeDialog = true
    },
    changeTheme(data) {
      if (!data.parentId) {
        this.$message.error(this.$t('domain.domain.rootNoChange'))
        return
      }
      this.currentClassName = data.name
      this.getBrotherClassName(this.treeData, data.parentId)
      const changeObj = _.clone(data)
      if (!changeObj.hasOwnProperty('order')) {
        changeObj.order = undefined
      }
      this.changeObj = changeObj
      this.changeThemeDialog = true
    },
    deleteTheme(data) {
      if (!data.parentId) {
        this.$message.error(this.$t('domain.domain.rootNoDelete'))
        return
      }
      if (!data.nodes) {
        this.$DatablauCofirm(
          this.$t('domain.domain.delClassificationConfirm'),
          this.$t('domain.common.tip'),
          {
            type: 'warning',
            closeOnClickModal: false,
          }
        ).then(() => {
          this.deleteSubmit(data.foldId, data.parentId)
        })
      } else {
        this.$message.error(this.$t('domain.domain.noDeleteWithSub'))
      }
    },
    getParentPath(list, targetId) {
      list.forEach(e => {
        if (e.foldId && e.foldId === targetId) {
          this.parentPath = e.name
        } else {
          if (e.nodes && e.nodes.length) {
            this.getParentPath(e.nodes, targetId)
          }
        }
      })
    },
    getBrotherClassName(list, parentId) {
      this.nameArr = []
      list.forEach(e => {
        if (e.parentId && e.parentId === parentId) {
          this.nameArr.push(e.name)
        } else {
          if (e.nodes && e.nodes.length) {
            this.getBrotherClassName(e.nodes, parentId)
          }
        }
      })
    },
    // handleCheckChange(data, checked) {
    //   this.checkedList = this.$refs.mainTree.getCheckedKeys(true);
    //   this.checkedListLength = this.checkedList.length;
    //   this.checkedContent = this.$refs.mainTree.getCheckedNodes(true);
    // },
    // loadStandardByKeyword() {
    //   let keyword = this.keyword
    //   this.$refs.mainTree.setCheckedKeys([]);
    //   if (keyword) {
    //     $('.el-tree-node__content').children('.el-tree-node__expand-icon').not('.is-leaf').next('.el-checkbox').hide()
    //   } else {
    //     $('.el-tree-node__content').children('.el-tree-node__expand-icon').not('.is-leaf').next('.el-checkbox').show()
    //   }
    //   this.$refs.mainTree.filter(keyword);
    //   setTimeout(()=> {
    //     this.updateTreeBoxScrollbar()
    //     this.treeLoading = false
    //   });
    // },
    filterNode(value, data, node) {
      // if (!value) return true;
      // let current = node;
      // let hit = false;
      //
      // if (node.isLeaf) {
      //   hit = this.$MatchKeyword(current.data, value, 'name');
      // }
      // // do {
      // //   hit = this.$MatchKeyword(current.data, value, 'name');
      // //   current = current.parent;
      // // }while(!hit && current.data && current.data.name)
      // return hit;
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // joinObject(x,y,name='name',children='nodes'){
    //   const joinChildren = (leftChildren,rightChildren)=>{
    //     let rightObj = new Map();
    //     rightChildren.forEach(item=>{
    //       rightObj.set(item.name,item);
    //     });
    //     leftChildren.forEach(item=>{
    //       if(rightObj.has(item.name)){
    //         if(item[children]){
    //           joinChildren(item[children],rightObj.get(item.name)[children]);
    //         }
    //         rightObj.delete(item.name);
    //       }
    //     });
    //     rightObj.forEach(item=>{
    //       leftChildren.push(item);
    //     });
    //   };
    //   joinChildren(x,y);
    //   return x;
    // },
    // filterStateDAndX (node) {
    //   const forEach = node => {
    //     if (node.nodes) {
    //       node.nodes.forEach(item => {
    //         forEach(item)
    //       })
    //     }
    //     if (node.domains) {
    //       node.domains = node.domains.filter(item => {
    //         if (this.showX) {
    //           return item.state === 'X'
    //         } else {
    //           return item.state === 'D'
    //         }
    //       })
    //     }
    //   }
    //   forEach(node)
    // },
    getAllOrgs() {
      HTTP.getOrgTree()
        .then(res => {
          const data = res.data
          const arr = [data]
          const getChildren = (obj, arr) => {
            if (obj.children && Array.isArray(obj.children)) {
              obj.children.forEach(item => {
                arr.push(item)
                getChildren(item, arr)
              })
            }
          }
          getChildren(data, arr)
          this.allOrganizations = arr
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    innerLoadStandard() {
      if (!this.$route.query.domain || this.$route.query.domainId) {
        this.contentStatus = 'folder'
      }
      return new Promise(resolve => {
        this.treeLoading = true
        // const url = `${this.$url}/service/domains/tree?onlyFolder=true&categoryId=${this.typeIds}`
        HTTP.getDomainTreeDetailService({
          onlyFolder: true,
          categoryId: this.typeIds,
        })
          .then(res => {
            this.treeLoading = false
            this.options = [res.data]
            this.treeData = [res.data]

            this.expandedKeys = [res.data.foldId]
            if (this.nowFolder && this.nowFolder.parentId) {
              this.expandedKeys.push(this.nowFolder.parentId)
            }
            if (!this.$route.query.domain || this.$route.query.domainId) {
              if (this.nowFolder && !this.nowFolder.data) {
                this.$nextTick(() => {
                  this.$refs.mainTree.setCurrentKey(this.nowFolder.foldId)
                })
              } else {
                this.$nextTick(() => {
                  this.$refs.mainTree.setCurrentKey(res.data.foldId)
                })
                this.nowFolder = {
                  data: res.data,
                }
              }
              this.$nextTick(() => {
                this.$refs.folderDetail.refreshData()
              })
            }
            resolve()
          })
          .catch(e => {
            this.treeLoading = false
            this.$showFailure(e)
          })
      })
    },
    loadNode(node, resolve) {
      if (!node.data.id) {
        resolve([])
        return
      }
      HTTP.getUpds({ categoryId: node.data.id })
        .then(res => {
          resolve(res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    standardImport() {
      this.formFile = []
      this.uploadDialogVisible = true

      // if (this.useWorkflow) {
      //   this.uploadDialogVisible = true
      //   console.log('333')
      // } else {
      //   // auto publish when workflow is enabled
      //   this.elRadioSelect(true)
      //   this.standardImportAction()
      // }
    },
    standardImportAction() {
      this.uploadDialogVisible = false
      // this.$refs.standardImport.$refs.upload.submit()
      // this.autoCode = false
      this.$refs.standardImport.$refs.upload.submit()
      this.autoCode = false
      // if (this.typeIds === 1 || this.typeIds === 2) {
      //   this.$refs.standardImport.$refs.upload.submit()
      //   this.autoCode = false
      // } else {
      //   // if (
      //   //   this.$refs.standardImport &&
      //   //   this.$refs.standardImport.$slots.default &&
      //   //   this.$refs.standardImport.$slots.default[0] &&
      //   //   this.$refs.standardImport.$slots.default[0].elm
      //   // ) {
      //   //   this.$refs.standardImport.$slots.default[0].elm.click()
      //   // }
      // }
    },
    goToDomain(domainObj) {
      setTimeout(() => {
        this.nowDomainId = domainObj.domainId
        this.nowDomain = domainObj
        this.currentTab = 'scan'
        this.contentStatus = 'scan'
      })
    },

    submitAssignExamine() {
      const self = this
      if (!self.userSelect1) {
        return
      }
      self.lockAssignBtn = true
      const requestBody = {
        reviewer: self.userSelect1.name,
        domainIds: self.checkedList,
      }

      this.$postLongList({
        method: 'post',
        requestUrl: this.$url + '/service/domains/review',
        requestBody: requestBody,
        listParameter: 'domainIds',
        successCallback: () => {
          self.nowDomainId = null
          this.$message({
            title: this.$version.common.success,
            message: this.$version.common.operationSucceed,
            type: 'success',
          })
          self.lockAssignBtn = false
          this.showExamineDialog = false
          self.stateChange()
        },
        failureCallback: () => {
          self.lockAssignBtn = false
        },
        finallyCallback: () => {},
      })
    },
    startDomainProcess(data) {
      const self = this
      const requestBody = {
        processType: this.$processMap.dataStandard,
        formDefs: data,
      }
      HTTP.startWorkflowProcess({ requestBody })
        .then(res => {
          this.showWorkflowDialog = false
          this.$message({
            title: this.$version.common.success,
            message: this.$version.common.operationSucceed,
            type: 'success',
          })
          this.lockAssignBtn = false
          self.stateChange()
        })
        .catch(e => {
          this.$showFailure(e)
          this.lockAssignBtn = false
        })
    },
    deleteStandard(selection) {
      const self = this
      this.$DatablauCofirm(
        this.$version.domain.dialog.deleteConfirmTip.format(selection.length),
        this.$version.domain.dialog.deleteConfirmTitle,
        {
          type: 'warning',
        }
      )
        .then(() => {
          const checkedIds = selection ? selection.map(e => e.domainId) : []
          this.isAdopting = true

          let postMehtod = this.$postLongList
          if (this.$ddmFirst) {
            postMehtod = HTTP.deleteDomainByIdsService
          }
          postMehtod({
            method: 'post',
            requestUrl: this.$url + '/service/domains/deleteByIds',
            requestBody: checkedIds,
            listParameter: null,
            successCallback: () => {
              self.$message({
                title: this.$version.common.success,
                message: this.$version.common.operationSucceed,
                type: 'success',
              })
              self.stateChange()
              self.nowDomainId = null
            },
            failureCallback: e => {
              // self.$showFailure(e)
            },
            finallyCallback: () => {
              console.log('finallyCallback')
              self.isAdopting = false
            },
          })
        })
        .catch(() => {})
    },
    // beforeAdopt(){
    //   let nodes = this.$refs.mainTree.getCheckedNodes(true);
    //   let hasUpdatingDomain = false;
    //   nodes.forEach(node=>{
    //     if(node.updatingId){
    //       hasUpdatingDomain = true;
    //     }
    //   });
    //   if(hasUpdatingDomain){
    //     this.emailDialogDomainIds = _.clone(this.checkedList);
    //     this.emailDialogVisible = true;
    //   }else{
    //     this.adopt();
    //   }
    // },
    adoptAndSendEmail() {
      const checkedList = []
      const nodes = this.$refs.mainTree.getCheckedNodes(true)
      nodes.forEach(item => {
        if (item.updatingId) {
          checkedList.push(item.updatingId)
        } else {
          checkedList.push(item.id)
        }
      })
      const requestBody = {
        domainIds: this.checkedList,
        reviewer: this.$user.username,
        sendMailForDAM: this.emailForDam,
        sendMailForDDM: this.emailForDdm,
      }
      this.handleAdopt(requestBody)
    },
    adopt() {
      const checkedList = []
      const nodes = this.$refs.mainTree.getCheckedNodes(true)
      nodes.forEach(item => {
        if (item.updatingId) {
          checkedList.push(item.updatingId)
        } else {
          checkedList.push(item.id)
        }
      })
      const self = this
      const requestBody = {
        domainIds: this.checkedList,
        reviewer: this.$user.username,
        sendMailForDAM: false,
        sendMailForDDM: false,
      }
      this.handleAdopt(requestBody)
    },
    handleAdopt(requestBody) {
      const self = this
      this.emailDialogVisible = false
      this.isAdopting = true

      this.$postLongList({
        method: 'post',
        requestUrl: this.$url + '/service/domains/approve',
        requestBody: requestBody,
        listParameter: 'domainIds',
        successCallback: () => {
          this.$message({
            title: this.$version.common.success,
            message: this.$version.common.operationSucceed,
            type: 'success',
          })
          self.stateChange()
          self.nowDomainId = null
        },
        failureCallback: () => {
          self.stateChange()
        },
        finallyCallback: () => {
          this.isAdopting = false
        },
      })
    },
    beforeReject() {
      this.rejectComment = ''
      this.rejectDialogVisible = true
      this.$nextTick(() => {
        this.$refs.rejectComment.focus()
      })
    },
    closeRejectDialog() {
      this.rejectDialogVisible = false
    },
    reject() {
      const self = this
      const requestBody = {
        domainIds: self.checkedList,
        comment: this.rejectComment,
      }
      this.isAdopting = true
      this.$postLongList({
        method: 'post',
        requestUrl: this.$url + '/service/domains/reject',
        requestBody: requestBody,
        listParameter: 'domainIds',
        successCallback: () => {
          this.$message({
            title: this.$version.common.success,
            message: this.$version.common.operationSucceed,
            type: 'success',
          })
          self.stateChange()
          self.nowDomainId = null
        },
        failureCallback: () => {
          self.stateChange()
        },
        finallyCallback: () => {
          this.rejectDialogVisible = false
          this.isAdopting = false
        },
      })
    },
    stateChange() {
      this.treeData = []
      this.innerLoadStandard()
    },
    handleClose() {
      this.showExamineDialog = false
    },
    backToFolder() {
      if (this.$route.query.domain || this.$route.query.domainId) {
        const query = this.$route.query
        const newQuery = _.omit(query, 'domain', 'domainId')
        this.$router.replace({ query: newQuery })
      } else {
        this.goBack()
      }

      this.updateList()
    },
    // 仅更新右侧列表
    updateList() {
      if (this.$refs.folderDetail && this.$refs.folderDetail.refreshData) {
        this.$refs.folderDetail.refreshData()
      }
    },
    handleItemClicked(data, node) {
      this.nowFolder = data
      this.contentStatus = 'folder'
      this.currentPathIds = []
      if (!this.nowFolder.parentId) {
        this.currentPathIds = this.options[0].foldId
      } else {
        this.getCurrentPathIds(this.nowFolder, true)
      }
      this.$nextTick(() => {
        this.$refs.folderDetail.resetQuery()
      })
      if (data.parentId === 0) {
        this.showShareFile = false
      } else {
        this.showShareFile = true
      }
    },
    getCurrentPathIds(foldObj, isFirst) {
      isFirst && this.currentPathIds.unshift(foldObj.foldId)
      if (foldObj.parentId) {
        this.currentPathIds.unshift(foldObj.parentId)
        this.getParentFoldr(this.options, foldObj.parentId)
      }
    },
    getParentFoldr(list, pId) {
      list.forEach(e => {
        if (e.foldId === pId) {
          this.getCurrentPathIds(e)
        } else {
          if (e.nodes && e.nodes.length) {
            this.getParentFoldr(e.nodes, pId)
          }
        }
      })
    },
    add() {
      // console.log(this.nowFolder)
      let root = this.nowFolder.data ? this.nowFolder.data : this.nowFolder
      // console.log(root, 'root')
      if (root.parentId === 0 && (!root.nodes || !root.nodes.length)) {
        this.$DatablauCofirm(this.$t('domain.domain.noDomainAtRoot'))
      } else {
        this.showAddTab = true
        this.currentTab = 'add'
        this.contentStatus = 'add'
      }
      // $('.is-current').removeClass('is-current');
    },
    removeTab() {
      this.currentTab = 'details'
      this.showAddTab = false
    },
    modelDownload() {
      const url = `${HTTP.domainTemplateDownloadUrl()}?categoryId=${
        this.typeIds
      }`
      // this.$url + `/service/domains/template?categoryId=${this.typeIds}`

      this.$downloadFilePost(url)
    },
    showBegain() {
      this.uploading = true
      this.$bus.$emit('showUploadProgress', {
        name: `${this.$t('domain.common.import')} ${this.labelText.name}`,
        time: 10,
      })
    },
    onChange(e) {
      this.formFile.push(e)
    },
    beforeRemove(e) {
      this.formFile = []
    },
    onError(e) {
      this.uploading = false
      this.$message.closeAll()
      this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(e)
    },
    onSuccess() {
      this.uploading = false
      this.$message.closeAll()
      this.$bus.$emit('changeUploadProgress', true)
      this.stateChange()
    },
    standardDownload(isAll) {
      this.$refs.folderDetail.exportStandards(isAll)
    },
    callOptions(evt) {
      const x = evt.clientX
      const y = evt.clientY
      const options = [
        {
          icon: 'el-icon-download',
          label: this.$version.option.downloadTemplate,
          callback: this.modelDownload,
        },
        {
          icon: 'el-icon-upload',
          label: this.$version.option.upload,
          callback: () => {
            if (!this.uploading) {
              $('#ban-upload-btn').click()
            } else {
              this.$message.warning(this.$t('domain.common.importWaiting'))
            }
          },
        },
        {
          icon: 'el-icon-download',
          label: this.$version.option.download,
          callback: this.standardDownload,
        },
        {
          icon: 'el-icon-edit',
          label: this.$version.option.udp,
          callback: () => {
            this.showUdps = true
          },
        },
        {
          icon: 'el-icon-plus',
          label: this.$version.option.addDomain,
          callback: this.add,
        },
      ]
      this.$bus.$emit('callContextMenu', {
        x: x,
        y: y,
        options: options,
      })
    },
    // handleSubmitAssign () {
    //   if (this.useWorkflow) {
    //     // this.enableBtn = false;
    //     this.submitSatardAssign();
    //   } else {
    //     this.showExamineDialog = true;
    //   }
    // },
    showSettings() {},
    addSubmit() {
      // this.$http
      //   .post(`${this.$url}/service/domains/folders`, this.addObj)
      HTTP.addCatalog(this.addObj)
        .then(res => {
          if (res) {
            this.addThemeDialog = false
            this.innerLoadStandard().then(() => {
              setTimeout(() => {
                this.expandedKeys.push(res.data.id)
              })
            })
            this.$message.success(
              this.$t('domain.domain.addClassificationSucceed')
            )
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeSubmit() {
      let para = _.cloneDeep(this.changeObj)
      para.id = para.foldId
      delete para.foldId
      HTTP.updateCategoryService(para)
        .then(res => {
          if (res) {
            // clear filter show all after change category
            this.keyword = ''
            this.changeThemeDialog = false
            this.expandedKeys = []
            this.innerLoadStandard().then(() => {
              setTimeout(() => {
                this.expandedKeys.push(this.changeObj.parentId)
              })
            })
            this.$message.success(
              this.$t('domain.domain.changeClassificationSucceed')
            )
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteSubmit(foldId, parentId) {
      if (parentId === 0 && !this.$isAdmin) {
        this.$message.error(this.$t('domain.common.operationPermissionDenied'))
        return
      }
      // this.$http
      //   .delete(`${this.$url}/service/domains/folders/${foldId}`, {})
      HTTP.deleteFolderService({ folderId: foldId, withNoValid: false })
        .then(res => {
          this.$message.success(this.$t('domain.common.delSucceed'))
          this.expandedKeys = []
          this.innerLoadStandard().then(() => {
            setTimeout(() => {
              this.expandedKeys.push(parentId)
            })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    Cancel(type) {
      if (this.newClassName) {
        this.$DatablauCofirm(
          this.$t('domain.common.abortConfirm'),
          this.$t('domain.common.tip'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
            closeOnClickModal: false,
          }
        )
          .then(() => {
            if (type === 'add') {
              this.addThemeDialog = false
            } else {
              this.changeThemeDialog = false
            }
          })
          .catch(() => {})
      } else {
        if (type === 'add') {
          this.addThemeDialog = false
        } else {
          this.changeThemeDialog = false
        }
      }
    },
    moreHandle(command) {
      switch (command) {
        case 'a':
          this.modelDownload()
          break
        case 'b':
          this.standardImport()
          break
        case 'c1':
          this.standardDownload(true)
          break
        case 'c2':
          this.standardDownload(false)
          break
        case 'd':
          this.showUdps = true
          break
      }
    },
    goBack() {
      this.contentStatus = 'folder'
    },
    updateBack() {
      this.innerLoadStandard()
    },
    editCurrent(row, isUpdate) {
      this.isDerive = false
      this.nowDomain = row
      this.nowDomainId = row.domainId
      this.contentStatus = 'write'
      this.nowDomain.isUpdate = isUpdate
    },
    handleDerive(row, isUpdate) {
      this.isDerive = true
      this.nowDomain = row
      this.nowDomainId = row.domainId
      this.contentStatus = 'write'
      this.nowDomain.isUpdate = false
    },
    nodeClick(node) {
      if (node.level === 1) {
        this.backToFolder()
      }
    },
    setPath(nodeData) {
      this.nodeData = nodeData
    },
    setFolderId(folderId) {
      if (!this.defaultCurrentNode && folderId) {
        this.defaultCurrentNode = folderId

        this.treeKey++
      }
    },
    getFindState(value) {
      HTTP.getfindState({ domainType: value })
        .then(res => {
          this.autoCodeDisabled = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  inject: ['headerProduction'],
  computed: {
    showAssignBtn() {
      return this.state === 'D'
    },
    showExamineBtn() {
      return this.state === 'C'
    },
    showWithdrawBtn() {
      return this.state === 'A'
    },
    enableBtn() {
      return this.checkedList.length > 0
    },
    defaultExpandAll() {
      return false
    },
    useWorkflow() {
      // workflow enable && not fieldDomain
      return !!(
        this.$workflowStatus &&
        this.$workflowStatus.workflow_enable &&
        this.$workflowStatus.workflow_domain_enable &&
        this.typeIds < 4
      )
    },
    // base on header, effect subscription etc
    useDam() {
      return this.headerProduction && this.headerProduction === 'dam'
      // return !this.$ddmFirst
    },
    labelText() {
      let obj = {}
      if (this.typeIds === 3) {
        obj = {
          typeName: this.$t('domain.common.dataDictionary'),
          standard: this.$t('domain.common.dictionaryInformation'),
          domainCode: this.$t('domain.common.dictionaryEncoding'),
          status: this.$t('domain.common.dictionaryState'),
          name: this.$t('domain.common.dictionaryName'),
          nameAbbr: this.$t('domain.common.dictionary'),
        }
      } else if (this.typeIds === 2) {
        obj = {
          typeName: this.$t('domain.common.indicator'),
          standard: this.$t('domain.common.indicatorInformation'),
          domainCode: this.$t('domain.common.indicatorCoding'),
          status: this.$t('domain.common.indicatorStatus'),
          name: this.$t('common.page.index'),
          nameAbbr: this.$t('domain.common.indicator'),
        }
      } else {
        obj = {
          typeName: this.$t('domain.common.dataStandard'),
          standard: this.$version.domain.propertyType.standard,
          domainCode: this.$version.domain.property.domainCode,
          status: this.$t('domain.common.standardStatus'),
          name: this.$t('domain.common.dataStandard'),
          nameAbbr: this.$t('domain.common.standard'),
        }
      }

      return obj
    },
    stas() {
      return this.$route.path.includes('embeddedModule') ? 'false' : ''
    },
    standardUploadUrl() {
      // if (this.typeIds === 1 || this.typeIds === 2) {
      // this.$url + '/service/domains/upload/domain?categoryId=' + this.typeIds
      let url = `${HTTP.domainUploadUrl()}?categoryId=${
        this.typeIds
      }&autoGenCode=${this.autoCode}`
      if (this.isUploadPublishedStandard) {
        url += '&published=true'
      }
      return url
      // } else {
      //   let url = `${HTTP.domainUploadUrl()}?categoryId=${this.typeIds}`
      //   console.log(
      //     this.isUploadPublishedStandard,
      //     'this.isUploadPublishedStandard'
      //   )
      //   url += '&published=true'
      //   return url
      // }
    },
  },
  watch: {
    uploadDialogVisible(value) {
      if (value === true && this.typeIds === 1) {
        this.getFindState('BASIC_CODE')
      } else if (value === true && this.typeIds === 2) {
        this.getFindState('NORM_SYS')
      }
      if (value === true && this.$refs.standardImport) {
        this.isUploadPublishedStandard = false
        this.$refs.standardImport.$refs.upload.clearFiles()
      }
    },
    keyword(value) {
      clearTimeout(this.keywordSetTimeout)
      setTimeout(() => {
        this.keywordSetTimeout = setTimeout(() => {
          this.$refs.mainTree.filter(value)
        }, 800)
      })
    },
    state(state) {
      this.stateChange()
    },
    $route: {
      deep: true,
      handler: function (to, from) {
        const currentNav = to.query.currentNav

        if (currentNav == 'index') {
          this.initEventListener()
          this.addNavEventListener()
          this.innerLoadStandard()
          this.getUdps()
        } else {
          this.initEventListener()
          this.addNavEventListener()
          this.innerLoadStandard()
          this.getUdps()
        }
      },
    },
  },
  filters: {
    convertTime(ori) {
      if (!ori) {
        return ''
      }
      const y = new Date(ori).getFullYear()
      const m = (new Date(ori).getMonth() + 1).toString().padStart(2, '0')
      const d = new Date(ori).getDate().toString().padStart(2, '0')
      const hh = new Date(ori).getHours().toString().padStart(2, '0')
      const mm = new Date(ori).getMinutes().toString().padStart(2, '0')
      const ss = new Date(ori).getSeconds().toString().padStart(2, '0')
      return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    },
  },
}
