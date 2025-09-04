import businessRules from './list.vue'
import addRule from './addRule.vue'
import seeRule from './seeRule.vue'
import editRule from './addRule.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
export default {
  components: {
    businessRules,
    addRule,
    editRule,
    seeRule,
  },
  data() {
    return {
      currentTab: 'businessList',
      lastTab: 'businessList',
      showAddBusinessRule: false,
      businessRulesMap: {},
      businessRulesArray: [],
      rulesEditing: [],
      categories: this.$modelCategories,
      editTitle: '添加目录',
      dialogVisible: false,
      keyword: '',
      ruleForm: {
        name: '',
        type: 'QUALITY_RULE',
        parentId: null,
        id: null,
      },
      rules: {
        name: [{ required: true, message: '请输入目录名称', trigger: 'blur' }],
      },
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'subNodes',
      },
      treeData: [],
      treeKey: 0,
      showCodePop: false,
      isEdit: false,
      catalogsMap: new Map(),
      catalogPath: [],
      nav: [],
      catalogStr: '',
      routeString: '',
      ruleDetail: [],
      auth: false,
      rootHasAuth: false,
      currentCategory: null,
      rowList: [],
      treeLoading: false,
      treeRawData: null,
    }
  },
  mounted() {
    this.getTreeData()
    this.initResizeHorizontal()
    this.$bus.$on('startEditBusinessRule', detail => {
      this.addTab('business', _.clone(detail))
      this.showAddBusinessRule = true
      this.currentTab = 'edit'
      this.ruleDetail = detail
      this.nodeData = [
        { name: this.$t('common.page.dataQualityRules'), couldClick: false },
        { name: detail.name, couldClick: false },
      ]
    })
    this.$bus.$on('startSeeBusinessRule', detail => {
      this.addTab('business', _.clone(detail))
      this.showAddBusinessRule = true
      this.currentTab = 'see'
      this.ruleDetail = detail
      console.log(detail, 'detail')
      this.nodeData = [
        { name: this.$t('common.page.dataQualityRules'), couldClick: false },
        { name: detail.name, couldClick: false },
      ]
    })
    this.$bus.$on('addBusinessRule', catalogStr => {
      this.catalogStr = catalogStr
      this.showAddBusinessRule = true
      this.currentTab = 'add'
      this.nodeData = [
        { name: this.$t('common.page.dataQualityRules'), couldClick: false },
        {
          name: this.$t('quality.page.dataQualityRules.addBusinessRule'),
          couldClick: false,
        },
      ]
    })
    this.$bus.$on('removeAddRule', name => {
      if (name) {
        this.removeTab(name)
      } else {
        this.removeTab('add')
      }
    })
    this.$bus.$on('rulesDeleted', rules => {
      rules.forEach(rule => {
        this.removeTab(rule.name)
      })
    })
    this.$bus.$on('removeEditRule', name => {
      this.removeTab(name)
    })
    this.$bus.$on('cancel', () => {
      this.removeTab(this.currentTab)
    })
  },
  beforeDestroy() {
    this.$bus.$off('cancel')
    this.$bus.$off('startEditBusinessRule')
    this.$bus.$off('addBusinessRule')
    this.$bus.$off('removeAddRule')
    this.$bus.$off('removeEditRule')
    this.$bus.$off('rulesDeleted')
    this.$bus.$off('startSeeBusinessRule')
  },
  methods: {
    nodeClick(node) {
      if (node.level === 1) {
        this.removeTab()
      }
    },
    dataOptionsFunction(data) {
      return // 业务规则目录不会有编辑功能
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (data.id === 0) {
        if (this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_ADD) {
          options.push({
            label: this.$t('quality.page.dataQualityRules.addDirectory'),
            callback: () => {
              this.addRulesCatalogue()
            },
            args: 'folder',
          })
        }
      }
      if (data.id !== 0) {
        if (this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_RENAME) {
          options.push({
            label: this.$t('quality.page.dataQualityRules.rename'),
            callback: () => {
              this.handleEditCatalogue(data)
            },
            args: 'folder',
          })
        }
        if (this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_DELETE) {
          options.push({
            label: this.$t('common.button.delete'),
            callback: () => {
              this.deleteCatalogue(data)
            },
            args: 'folder',
          })
        }
      }
      return options
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    // 控制左右两边的拖拽
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-area'),
          middleDom: $('.folder-line'),
          rightDom: $('.citic-card-tabs'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
        })
      }, 1000)
    },
    nameKeydown(e) {
      e.target.value = e.target.value.replace(/[`\\#/]/g, '')
    },
    handleEditCatalogue(data) {
      this.editTitle = this.$t(
        'quality.page.dataQualityRules.directoriesRenaming'
      )
      if (data) {
        this.ruleForm.name = data.name
        this.ruleForm.id = data.id
        this.ruleForm.parentId = data.parentId
      }
      this.dialogVisible = true
      this.isEdit = true
    },
    handleDialogClose() {
      this.dialogVisible = false
      this.ruleForm.name = ''
      this.ruleForm.id = null
      this.ruleForm.parentId = null
    },
    deleteCatalogue(data) {
      this.$DatablauCofirm(
        this.$t('quality.page.dataQualityRules.deletePrompt'),
        this.$t('common.info.title'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          this.$http
            .delete(this.$quality_url + `/categories/${data.id}`)
            .then(res => {
              this.$message.success(
                this.$t('quality.page.dataQualityRules.successfullyDeleted')
              )
              this.getTreeData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.log(e)
        })
    },
    getTreeData() {
      const treeData = []
      this.treeLoading = true
      this.$http
        .get(this.$quality_url + '/categories/tree/?type=QUALITY_RULE')
        .then(res => {
          this.treeRawData = res.data
          res.data.name = this.$t(
            'quality.page.dataQualityRules.allBusinessRules'
          )

          this.catalogsMap = new Map()
          this.catalogsMap.set(res.data.id, res.data)
          const arrayToMap = arr => {
            arr.forEach(item => {
              this.catalogsMap.set(item.id, item)
              if (Array.isArray(item.subNodes)) {
                arrayToMap(item.subNodes)
              }
            })
          }
          arrayToMap(res.data.subNodes)
          // res.data.subNodes.sort((a,b)=>{
          //   return a.name.localeCompare(b.name)
          // })
          /* this.$utils.sort.sortConsiderChineseNumber(
            res.data.subNodes,
            'name',
            'ascending',
            true
          ) */
          const Foreach = arr => {
            if (Array.isArray(arr)) {
              this.$utils.sort.sortConsiderChineseNumber(arr, 'name')
              arr.forEach(item => {
                if (Array.isArray(item.subNodes)) {
                  Foreach(item.subNodes)
                }
              })
            }
          }
          Foreach(res.data.subNodes)
          treeData.push(res.data)
          this.treeData = treeData
          this.treeLoading = false
          this.$nextTick(function () {
            this.$refs.mainTree.setCurrentKey(res.data.id)
            let hasAuth = false
            const judgeRootAuth = node => {
              if (hasAuth) {
                return
              }
              if (node.auth === 1 || node.auth === 0) {
                if (node.subNodes) {
                  node.subNodes.forEach(subNode => {
                    judgeRootAuth(subNode)
                  })
                }
              } else {
                hasAuth = true
              }
            }
            judgeRootAuth(res.data)
            this.rootHasAuth = hasAuth
            this.auth = !(res.data.auth === 1 || res.data.auth === 0)
          })
        })
        .catch(e => {
          this.treeLoading = false
          this.$showFailure(e)
        })
    },
    addRulesCatalogue(value) {
      this.dialogVisible = true
      this.isEdit = false
      this.editTitle = this.$t('quality.page.dataQualityRules.addDirectory')
      this.ruleForm.name = ''
      if (value === 'add2') {
        this.ruleForm.parentId = this.ruleForm.id
      }
    },
    conEdi() {
      this.ruleForm.name = this.ruleForm.name.replace(/[`\\#/]/g, '')
      const response = {
        name: this.ruleForm.name,
        type: 'QUALITY_RULE',
      }
      if (this.ruleForm.parentId) {
        response.parentId = this.ruleForm.parentId
      }
      this.$http
        .post(this.$quality_url + '/categories/', response)
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRules.successfullyAdded')
          )
          this.dialogVisible = false
          this.getTreeData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    editCatalogueName() {
      const requestBody = {
        name: this.ruleForm.name,
        type: 'QUALITY_RULE',
        merge: false,
        parentId: this.ruleForm.parentId,
      }
      this.$http
        .put(this.$quality_url + `/categories/${this.ruleForm.id}`, requestBody)
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRules.nameEditSuccessfully')
          )
          this.dialogVisible = false
          this.getTreeData()
          this.$refs.businessRules.loadRules(this.ruleForm.name)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleNodeClick(data, node) {
      if (this.$route.query.blank) {
        this.$router.push({
          name: 'dataQualityRules',
        })
      }
      this.rowList = []
      this.getParent(node)
      this.auth = !(data.auth === 1 || data.auth === 0)
      if (node.level === 1) {
        this.currentCategory = null
      } else {
        if (this.auth) {
          this.currentCategory = data.id
        }
      }
      if (data && data.id) {
        this.ruleForm.name = data.name
        this.ruleForm.id = data.id
        this.ruleForm.parentId = data.parentId
      }
      // data.parentId = data.parentId
      this.showCodePop = false
      let routeString = ''
      const [arr, map] = [this.treeData, this.catalogsMap]
      // if (e && e.parent.level === 1) {
      //   routeString = data.name
      // } else {
      const cur = map.get(data.id)
      const navIds = []
      if (cur.subNodes !== null && cur.subNodes.length > 0) {
        navIds.push({ id: null, candidates: cur })
      }
      navIds.push({
        id: data.name,
        candidates: map.get(map.get(data.id).parentId),
      })
      if (cur.parentId) {
        navIds.push({
          id: map.get(cur.parentId).name,
          candidates: map.get(map.get(cur.id).parentId),
        })
        // cur = map.get(cur.parentId);
      }
      this.nav = navIds.reverse()
      this.catalogPath = []
      this.nav.forEach(item => {
        this.catalogPath.push(item.id)
      })
      this.currentCatalogs = ''
      routeString = data.id
      // }
      this.routeString = routeString

      this.$refs.businessRules.currentPage = 1
      this.$refs.businessRules.loadRules(routeString)
      this.$refs.businessRules.switchDirectory()
    },
    getParent(node) {
      var that = this
      if (node.parent.data && !Array.isArray(node.parent.data)) {
        node.parent.data instanceof Object && that.rowList.push(node.data.id)

        that.getParent(node.parent)
      } else {
        that.rowList.push(node.data.id)
      }
    },
    renderContent(h, { node, data, store }) {
      if (
        data.name ===
          this.$t('quality.page.dataQualityRules.allBusinessRules') ||
        (!this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_RENAME &&
          !this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_DELETE)
      ) {
        return (
          <span style="width: 88%;position:relative;">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            <span style="margin-left:5px">
              {node.label.indexOf('/') != -1
                ? node.label.split('/')[1]
                : node.label}
            </span>
            <span
              class="three-point"
              style="position: absolute;right: 5px;"
            ></span>
          </span>
        )
      } else {
        return (
          <span style="width: 88%;position:relative;">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            &nbsp;
            <span>
              {node.label.indexOf('/') != -1
                ? node.label.split('/')[1]
                : node.label}
            </span>
            <span class="three-point" style="position: absolute;right: 5px;">
              <el-dropdown
                trigger="hover"
                style="float:right;margin-right:5px"
                size="mini"
                on-command={command => this.commandHandle(command, data)}
              >
                <span class="el-dropdown-link">
                  <i class="el-icon-more" slot="reference"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  {this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_RENAME ? (
                    <el-dropdown-item command="addSame" style="padding: 0 20px">
                      重命名
                    </el-dropdown-item>
                  ) : (
                    ''
                  )}
                  {this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_DELETE ? (
                    <el-dropdown-item command="addNext" style="padding: 0 20px">
                      {this.$t('common.button.delete')}
                    </el-dropdown-item>
                  ) : (
                    ''
                  )}
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </span>
        )
      }
    },
    commandHandle(command, data) {
      switch (command) {
        case 'addSame':
          this.handleEditCatalogue(data)
          break
        case 'addNext':
          this.deleteCatalogue(data)
          break
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
    },
    refreshCallback() {
      this.$refs.businessRules.queryRules()
    },
    addTab(type, data) {
      if (type === 'business') {
        if (this.businessRulesMap[data.name]) {
        } else {
          this.businessRulesMap[data.name] = data
          this.businessRulesArray.push(data)
        }
        this.currentTab = data.name
      }
    },
    removeTab(tabName) {
      if (this.$route.query.blank) {
        window.close()
      }
      this.showAddBusinessRule = false

      // if (tabName === 'add') {
      //   this.currentTab = this.lastTab
      //   this.showAddBusinessRule = false
      // } else {
      //   this.businessRulesArray.forEach((rule, index) => {
      //     if (rule.name === tabName) {
      //       this.businessRulesArray.splice(index, 1)
      //       delete this.businessRulesMap[tabName]
      //     }
      //   })
      //   this.currentTab = this.lastTab
      // }
    },
    updateCurrentTab(rule) {
      this.businessRulesArray.forEach((item, index) => {
        if (item.id === rule.id) {
          this.businessRulesArray[index] = rule
          this.$set(this.businessRulesArray, '-1', item.id)
          this.currentTab = rule.name
        }
      })
    },
  },
  computed: {
    showTabs() {
      return this.businessRulesArray.length > 0 || this.showAddBusinessRule
    },
  },
  watch: {
    keyword(val) {
      this.$refs.mainTree.filter(val)
    },
  },
}
