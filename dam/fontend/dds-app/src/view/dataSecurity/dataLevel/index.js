import LDMTypes from '@constant/LDMTypes'
import API from '../util/api'

import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import api from '../util/api'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
import { dumpMetaDetail } from '@/view/dataSecurity/util/util'

export default {
  components: {
    isShowTooltip,
  },
  data() {
    var nameValidatePass = async (rule, value, callback) => {
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
    const colorValidate = (rule, value, callback) => {
      if (this.tagData.color) {
        callback()
      } else {
        callback(new Error(this.$t('dataLevel.selectColor')))
      }
    }
    return {
      treeShow: true,
      listShow: true,
      tagKeyword: '',
      treeData: [],
      defaultProps: {
        label: 'name',
        children: 'children',
        id: 'tagId',
      },
      defaultExpanded: [],
      details: {},
      drag: {
        start: 0,
        startTime: 0,
        startWidth: 0,
        mousedown: false,
        end: 0,
        offset: 0,
        windowOffset: 0,
      },
      tagRuleSetSet: new Set(),
      tagData: {},
      tagDialogVisible: false,
      tagDialogTitle: '',
      currentNode: {},
      assetsData: [],
      loading: false,
      breadcrumbData: [],
      assetKeyword: '',
      assetsPagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0,
      },
      assetOrder: 'ascending',
      rules: {
        name: [
          { required: true, validator: nameValidatePass, trigger: 'blur' },
        ],
        color: [
          { required: true, validator: colorValidate, trigger: 'change' },
        ],
      },
      searchTimer: null,
      editable: true, // 是否具有编辑权限，用于标识是否可编辑目录树节点
      showUnFold: true, // 是否展开目录树
      nodeHistory: [], // 树节点点击历史，用于面包屑返回功能
      levelKey: [
        'DATA_SECURITY_LEVEL',
        'DATA_IMPORTANCE',
        'DATA_INFLUENCE_OBJECT',
        'DATA_INFLUENCE_SCOPE',
        'DATA_IMPACT_DEGREE',
        'DATA_SENSITIVE',
      ],
      searchResult: [],
      searchLoading: false,
      chooseResult: '',
      allTagData: [],
      assetsTypeIconMap: {
        80000005: 'column',
        80000004: 'table',
        80500008: 'view',
      },

      showClose: false,
      primaryTagColor: [
        '#BB6CF9',
        '#4E85F7',
        '#3AD1BF',
        '#8DC78A',
        '#F8EB77',
        '#FBC372',
        '#F9716C',
      ],
      allTagColor: [
        '#BB6CF9',
        '#6F54EB',
        '#4E85F7',
        '#3AD1BF',
        '#8DC78A',
        '#F8EB77',
        '#FBC372',
        '#FBA476',
        '#F9716C',
        '#FBADD2',
        '#4B0085',
        '#44308D',
        '#10239E',
        '#00682F',
        '#009343',
        '#8E7719',
        '#8E3B00',
        '#B64C00',
        '#A80A1A',
        '#C41D7F',
        '#7F32BC',
        '#4122CD',
        '#006AFE',
        '#1CA595',
        '#00B854',
        '#FFCC0D',
        '#FF9F01',
        '#FB602C',
        '#F5222E',
        '#F759AB',
        '#DECDEA',
        '#D2CCF0',
        '#A3C9FF',
        '#B0F1DB',
        '#C4E6C2',
        '#FCF39E',
        '#FDE0B7',
        '#FEE3D4',
        '#FBCCC7',
        '#FDD6E7',
      ],
      moreColor: false,
      selectedColor: [],
    }
  },
  computed: {},
  inject: ['reload'],
  mounted() {
    this.treeData = [
      {
        name: this.$t('dataLevel.securityRate'),
        tagId: this.$t('dataLevel.securityRate'),
        parentId: -1,
        description: `${this.$t('dataLevel.securityTxt1')}<br/>
        ${this.$t('dataLevel.securityTxt2')}<br/>
        1.${this.$t('dataLevel.securityTxt3')}<br/>
        2. ${this.$t('dataLevel.securityTxt4')}
        `,
        children: [
          {
            name: this.$t('securityModule.securityLevel'),
            tagId: 'DATA_SECURITY_LEVEL',
            parentId: 0,
            parentTagId: this.$t('dataLevel.securityRate'),
            description: '',
            key: 'DATA_SECURITY_LEVEL',
            children: [],
          },
        ],
      },
      {
        name: this.$t('dataLevel.dataImportant'),
        tagId: this.$t('dataLevel.dataImportant'),
        parentId: -1,
        description: '',
        children: [
          {
            name: this.$t('securityModule.importance'),
            tagId: 'DATA_IMPORTANCE',
            parentId: 0,
            parentTagId: this.$t('dataLevel.dataImportant'),
            description: '',
            key: 'DATA_IMPORTANCE',
            children: [],
          },
        ],
      },
      {
        name: this.$t('dataLevel.dataSecurityDetermine'),
        parentId: -1,
        tagId: this.$t('dataLevel.dataSecurityDetermine'),
        description: `${this.$t('dataLevel.dataSecurityTxt1')}`,
        children: [
          {
            name: this.$t('securityModule.affectedObjects'),
            tagId: 'DATA_INFLUENCE_OBJECT',
            parentId: 0,
            parentTagId: this.$t('dataLevel.dataSecurityDetermine'),
            description: `${this.$t('dataLevel.dataSecurityTxt1')}`,
            key: 'DATA_INFLUENCE_OBJECT',
            children: [],
          },
          {
            name: this.$t('securityModule.reach'),
            tagId: 'DATA_INFLUENCE_SCOPE',
            parentId: 0,
            parentTagId: this.$t('dataLevel.dataSecurityDetermine'),
            description: '',
            key: 'DATA_INFLUENCE_SCOPE',
            children: [],
          },
          {
            name: this.$t('securityModule.impactLevel'),
            tagId: 'DATA_IMPACT_DEGREE',
            parentId: 0,
            parentTagId: this.$t('dataLevel.dataSecurityDetermine'),
            description: `${this.$t('dataLevel.dataSecurityDes')}<br/>
            1. ${this.$t('dataLevel.dataSecurityDes1')}<br/>
            2. ${this.$t('dataLevel.dataSecurityDes2')}<br/>
            3. ${this.$t('dataLevel.dataSecurityDes3')}
            `,
            key: 'DATA_IMPACT_DEGREE',
            children: [],
          },
        ],
      },
    ]
    this.currentNode = this.treeData[0]
    this.initResizeHorizontal()
    this.initializeTree()
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
    // 选择安全等级颜色
    setTagColor(color) {
      if (this.selectedColor.indexOf(color) === -1) {
        this.tagData.color = color
        this.moreColor = false
        const curIndex = this.primaryTagColor.indexOf(color)
        if (curIndex === -1) {
          this.primaryTagColor[7] = color
        }
      }
    },
    // 展示更多颜色
    showMoreColor() {
      this.moreColor = !this.moreColor
    },
    focusSelect() {
      if (!this.chooseResult && !this.showClose) {
        this.searchResult = []
      }
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $(this.$refs.leftDom),
          middleDom: $(this.$refs.resizeBar),
          rightDom: $(this.$refs.rightDom),
          noCrack: true,
          minWith: { leftMinWidth: 240, leftMaxWidth: 800 },
          callback: () => {},
        })
      }, 1000)
    },
    async initializeTree() {
      try {
        const res = await API.getLevelData()
        this.treeShow = true
        const result = res.data.data
        const allTagData = result.map(item => {
          return {
            ...item.tag,
            key: item.tag.tagId,
            parentId: item.classificationType,
            classificationType: item.classificationType,
            description: JSON.parse(item.tag.properties || '{}').description,
            color: item.color,
          }
        })
        this.allTagData = allTagData
        const tree = this.$refs.securityTree.$refs.tree
        this.levelKey.forEach(key => {
          tree.updateKeyChildren(
            key,
            allTagData
              .filter(item => item.classificationType === key)
              .sort((a, b) => a.tagId - b.tagId)
          )
        })
      } catch (error) {
        this.$showFailure(error)
        this.treeShow = false
      }
    },
    // 目录树展开和收起
    expandOrCollapse() {
      if (this.showUnFold) {
        this.$refs.securityTree.collapseTopLevel()
      } else {
        this.$refs.securityTree.expandAllLevel()
      }
      this.showUnFold = !this.showUnFold
    },
    // 目录树
    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      return false
    },
    dataIconFunction(data, node) {
      if (node.level === 1) {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else if (node.level === 2) {
        if (node.data.name === this.$t('securityModule.securityLevel'))
          return 'iconfont icon-safetylevel'
        if (node.data.name === this.$t('securityModule.reach'))
          return 'iconfont icon-scope'
        if (node.data.name === this.$t('securityModule.importance'))
          return 'iconfont icon-importance'
        if (node.data.name === this.$t('securityModule.impactLevel'))
          return 'iconfont icon-extent'
        if (node.data.name === this.$t('securityModule.affectedObjects'))
          return 'iconfont icon-impactobject'
        return 'iconfont icon-menu-ztml'
      } else {
        return 'iconfont icon-biaoqian'
      }
    },
    dataOptionsFunction(data, type) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (data.parentId !== -1) {
        if (this.$auth.DATA_SECURITY_LEVEL_MANAGE) {
          if (data.parentId === 0) {
            options.push({
              icon: 'iconfont icon-tianjia',
              label: this.$t('securityModule.new'),
              callback: () => {
                this.tagData = {}
                this.initProps(this.tagData, data)
                this.defaultExpanded = [data.tagId]
                this.handleAdd(data)
              },
              args: 'folder',
            })
          } else {
            options.push({
              icon: 'iconfont icon-revise',
              label: this.$t('securityModule.edit'),
              callback: () => {
                this.handleEdit(data)
              },
              args: 'folder',
            })
            options.push({
              icon: 'iconfont icon-delete',
              label: this.$t('securityModule.delete'),
              tooltip: true,
              // text: '内置等级，不可删除',
              // disabled: data.builtIn,
              callback: () => {
                this.editTag = data
                this.handleDelete(data)
              },
              args: 'folder',
            })
          }
        }
      }
      return options
    },
    handleChooseChange(target) {
      this.showClose = false
      if (target) {
        // console.log(target)
        const node = this.$refs.securityTree.$refs.tree.getNode({
          tagId: target,
        })
        this.currentNode = node.data
      } else {
        this.searchResult = []
      }
    },
    handleAdd(data) {
      this.selectedColor = this.allTagData
        .filter(tag => tag.classificationType === data.tagId)
        .map(item => item.color)
      this.tagData = {
        nameLabel: data.name + this.$t('dataLevel.name'),
        namePlaceholder: data.name + this.$t('dataLevel.name'),
        name: '',
        descLabel: data.name + this.$t('securityModule.des'),
        description: '',
        classificationType: data.tagId,
        color: '',
      }
      this.tagDialogTitle = `${this.$t('securityModule.new')}${data.name}`
      this.tagDialogVisible = true
      this.$refs.tagForm && this.$refs.tagForm.$refs.form.clearValidate()
    },
    handleEdit(data) {
      if (!data.tagId) {
        data = this.currentNode
      }
      this.tagData = {}
      this.initProps(this.tagData, data)
      this.defaultExpanded = [data.tagId]
      const parentNode = this.$refs.securityTree.$refs.tree.getNode({
        tagId: data.parentId,
      })
      const parentData = parentNode.data
      // 设置已选择的等级颜色
      this.selectedColor = this.allTagData
        .filter(
          tag =>
            tag.classificationType === parentData.tagId &&
            tag.tagId !== data.tagId
        )
        .map(item => item.color)
      if (this.primaryTagColor.indexOf(data.color) === -1) {
        this.primaryTagColor[7] = data.color
      }
      this.tagData = {
        tagId: data.tagId,
        nameLabel: parentData.name + this.$t('dataLevel.name'),
        namePlaceholder: parentData.name + this.$t('dataLevel.name'),
        name: data.name,
        descLabel: parentData.name + this.$t('securityModule.des'),
        description: data.description,
        classificationType: parentData.tagId,
        color: data.color,
      }
      this.tagDialogTitle = `${this.$t('securityModule.edit')}${
        parentData.name
      }`
      this.tagDialogVisible = true
      this.$refs.tagForm && this.$refs.tagForm.$refs.form.clearValidate()
    },
    handleDelete(data) {
      this.$DatablauCofirm(
        `${this.$t('securityModule.sureDelTip1', { name: data.name })}`,
        this.$t('dataLevel.delDataLevel')
      ).then(() => {
        API.deleteLevel(data.tagId)
          .then(async res => {
            if (res.data.status === 200) {
              this.$datablauMessage.success(
                this.$t('securityModule.delSuccess')
              )
              const tree = this.$refs.securityTree.$refs.tree
              tree.remove(data)
              await this.initializeTree()
              if (this.currentNode.id === data.id) {
                this.currentNode = (
                  tree.getNode({
                    tagId: data.parentId,
                  }) || {}
                ).data
              }
            } else {
              this.$showFailure(res.data.msg)
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    handleCloseTagDialog() {
      this.tagDialogVisible = false
      this.selectedColor = []
      this.moreColor = false
      setTimeout(() => {
        this.tagData = {
          tagId: undefined,
          nameLabel: this.$t('dataLevel.name'),
          name: '',
          descLabel: this.$t('securityModule.des'),
          description: '',
          classificationType: null,
          color: null,
        }
      })
    },
    submitData() {
      this.$refs.tagForm.$refs.form.validate(async valid => {
        if (valid) {
          const { tagId, name, description, classificationType, color } =
            this.tagData
          const params = {
            tagId,
            tagName: name,
            classificationType,
            description,
            color,
          }
          let nextNodeId = ''
          let apiRes = null
          if (tagId) {
            // 修改分级
            apiRes = await API.updateLevel(params)
          } else {
            // 新增分级
            apiRes = await API.addNewLevel(params)
          }
          if (apiRes.data.status === 200) {
            const rs = apiRes.data.data
            this.$datablauMessage.success(
              tagId
                ? this.$t('securityModule.editSuccess')
                : this.$t('securityModule.newSuccess')
            )
            this.tagDialogVisible = false
            nextNodeId = tagId || rs.tag.tagId
            await this.initializeTree()
            const nextNode = this.$refs.securityTree.$refs.tree.getNode({
              tagId: nextNodeId,
            })
            this.currentNode = nextNode.data
          } else {
            this.$showFailure(apiRes.data.msg)
          }
        } else {
          return false
        }
      })
    },
    initProps(obj, tag) {
      // obj 为this的属性,指向一个 object
      for (const key in tag) {
        if (key !== 'properties') {
          this.$set(obj, key, tag[key])
        } else if (tag[key]) {
          if (this.$utils.isJSON(tag[key])) {
            const obj2 = JSON.parse(tag[key])
            for (const key2 in obj2) {
              if (/css/.test(key2)) {
                this.$set(obj, key2.replace('css:', ''), obj2[key2])
              } else {
                this.$set(obj, key2, obj2[key2])
              }
            }
          } else {
            this.$set(obj, key, tag[key])
          }
        }
      }
    },
    handleCheckChange(data, checked, indeterminate) {
      this.checkedList = this.$refs.tree.getCheckedNodes()
      this.checkedListLength = this.checkedList.length
    },
    handleNodeClick(data, node, tree) {
      this.currentNode = data
    },
    // 点击面包屑节点
    breadcrumbNodeClick(node) {
      // console.log(node)
      this.currentNode = node
    },
    // 点击面包屑返回
    goBack() {
      this.nodeHistory.splice(-1, 1)
      if (this.nodeHistory.length) {
        this.handleNodeClick(this.nodeHistory.splice(-1, 1)[0])
      }
    },
    // 找到当前节点的路径
    getParentNodes(node) {
      const tree = this.$refs.securityTree.$refs.tree
      const parentNodes = [node]
      let parent = tree.getNode({ tagId: node.parentId || node.parentTagId })
      while (parent) {
        parentNodes.unshift(parent.data)
        parent = tree.getNode({
          tagId: parent.data.parentId || parent.data.parentTagId,
        })
      }
      return parentNodes
    },
    // 数据资产表格 - pageSize 改变时的回调
    handleAssetsSizeChange(pageSize) {
      // console.log(pageSize)
      this.queryAssets({
        pageNo: 1,
        pageSize,
      })
    },
    // 数据资产表格 - 页码改变时的回调
    handleAssetsCurrentChange(pageNum) {
      // console.log(pageNum)
      this.queryAssets({
        pageNo: pageNum,
      })
    },
    handleSortChange({ column, prop, order }) {
      this.assetOrder = order
      this.queryAssets({
        pageNo: 1,
      })
    },
    // 数据资产表格 - 查看单条资产的详情
    toCheckAssetDetails(asset) {
      let params = {}
      if (asset.type == '80000005') {
        params = {
          name: 'dataCatalogForDDC',
          query: {
            objectId: asset.objectId,
            blank: true,
            isAssets: true,
          },
        }
      }
      if (asset.type == '80000004') {
        // 表
        params = {
          name: 'dataCatalogForDDC',
          query: {
            objectId: asset.objectId,
            type: 'TABLE',
            blank: true,
            isAssets: true,
          },
        }
      }
      if (asset.type == '80500008') {
        // 视图
        params = {
          name: 'dataCatalogForDDC',
          query: {
            objectId: asset.objectId,
            type: 'VIEW',
            blank: true,
            isAssets: true,
          },
        }
      }
      dumpMetaDetail(this, params)
    },
    // 查询数据资产
    queryAssets(defaultParams) {
      const { pageNum, pageSize } = this.assetsPagination
      const currentNode = this.currentNode
      const params = {
        id: currentNode.id,
        name: this.assetKeyword,
        pageNo: pageNum,
        pageSize,
        orderByName: this.assetOrder ? this.assetOrder === 'ascending' : true,
        ...defaultParams,
      }
      if (currentNode.parentId === -1) {
        params.tagIds = (currentNode.children || []).reduce(
          (prev, item) =>
            prev.concat(
              this.allTagData
                .filter(tag => tag.parentId === item.tagId)
                .map(t => t.tagId)
            ),
          []
        )
      } else {
        params.tagIds =
          currentNode.parentId === 0
            ? this.allTagData
                .filter(tag => tag.parentId === currentNode.tagId)
                .map(t => t.tagId)
            : [currentNode.tagId]
      }
      this.loading = true
      this.assetsData = []
      API.getAssetsByLevel(params)
        .then(res => {
          this.listShow = true
          this.loading = false
          if (currentNode.tagId === this.currentNode.tagId) {
            let logicalInfoArr = []
            res.data.data.content.forEach(item => {
              if (item.type === 80000004 || item.type === 80000005) {
                logicalInfoArr.push(item.objectId)
              }
            })
            this.getLogicalInfo(logicalInfoArr)
            const result = res.data.data
            if (result) {
              this.assetsData = result.content
              this.assetsPagination = {
                pageNum: params.pageNo,
                pageSize: params.pageSize,
                total: result.totalItems,
              }
            }
          }
        })
        .catch(e => {
          this.loading = false
          this.listShow = false
          this.$showFailure(e)
        })
    },
    getLogicalInfo(logicalInfoArr) {
      this.$http
        .post('/metadata/entities/getLogicalInfo', logicalInfoArr)
        .then(res => {
          this.assetsData.forEach(element => {
            this.$set(element, 'logical', res.data[Number(element.objectId)])
          })
        })
        .catch(e => {
          this.failureCallback(e)
        })
    },
    // 搜索目录树
    async queryTags(keyword) {
      if (keyword) {
        this.searchLoading = true
        this.showClose = true
        try {
          const searchRes = await api.searchLevel(keyword)
          // console.log(searchRes.data.data)
          this.searchResult = searchRes.data.data.map(item => ({
            ...item.tag,
            classificationType: item.classificationType,
            tagId: item.tag.tagId,
          }))
          this.searchLoading = false
        } catch (error) {
          this.$showFailure(error)
          this.searchLoading = false
        }
      } else {
        this.searchResult = null
      }
    },
    searchData() {
      this.queryAssets({
        pageNo: 1,
        pageSize: 20,
      })
    },
  },
  watch: {
    currentNode: {
      handler(node, oldNode = {}) {
        if (node.tagId) {
          const tree = this.$refs.securityTree.$refs.tree
          tree.setCurrentNode({
            tagId: node.tagId,
          })
          this.breadcrumbData = this.getParentNodes(node)
          const params = {
            pageNo: 1,
            pageSize: 20,
          }
          // 调接口，查询当前分级下的数据资产
          this.queryAssets(params)
        }
      },
      immediate: true,
      deep: true,
    },
    tagKeyword(keyword) {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(() => {
          this.queryTags()
          this.searchTimer = null
        }, 1000)
      } else {
        this.queryTags()
        this.searchTimer = setTimeout(() => {}, 1000)
      }
    },
    assetKeyword(val) {
      if (!val) {
        this.searchData()
      }
    },
  },
  beforeDestroy() {
    clearTimeout(this.searchTimer)
    $(document).unbind('mouseup', this.handleDragEnd)
  },
}
