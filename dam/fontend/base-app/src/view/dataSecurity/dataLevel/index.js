import LDMTypes from '@constant/LDMTypes'
import API from '../util/api'

import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import api from '../util/api'

export default {
  data() {
    var nameValidatePass = async (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入' + this.tagData.nameLabel))
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
    return {
      tagKeyword: '',
      treeData: [
        {
          name: '数据安全评级',
          tagId: '数据安全评级',
          parentId: -1,
          description: `通过综合考虑保密性、完整性和可用性的影响评估结果，识别数据安全定级关健要素，即作为最终数据安全级别评定时所使用的主要影响对象及影程度。<br/>
        定级要索识别立至少满足：<br/>
          1.因不同数据在安全性（保密性、完整性、可用性）方面有不同侧重，以所侧重的安全性评估结果，作为相应数据安全定级的主要依据。<br/>
          2. 数据的保密性，完整生和可用性要求基本一致的，则重点以保密性评估所确定的定级要素为主要定级依据。
          `,
          children: [
            {
              name: '安全等级',
              tagId: 'DATA_SECURITY_LEVEL',
              parentId: 0,
              parentTagId: '数据安全评级',
              description: '',
              key: 'DATA_SECURITY_LEVEL',
              children: [],
            },
          ],
        },
        {
          name: '数据重要程度参考',
          tagId: '数据重要程度参考',
          parentId: -1,
          description: '',
          children: [
            {
              name: '重要程度',
              tagId: 'DATA_IMPORTANCE',
              parentId: 0,
              parentTagId: '数据重要程度参考',
              description: '',
              key: 'DATA_IMPORTANCE',
              children: [],
            },
          ],
        },
        {
          name: '数据安全判定依据',
          parentId: -1,
          tagId: '数据安全判定依据',
          description: `安全影呵评估宜综合考虑数据类型、数据内容、数据规模、数据来源，机构职能和业务特点等因素，对数据安全性（保密性、完整生、可用性：造受破坏后所造成的影喻进行评估。评估过程中，根据实际情况识别各项安全性在影响评定中优先级，分别进行保密性、完整性及可用性评估，并综合考虑保密
性、完整性及可用的评钻结果，形成最终安全影响估。`,
          children: [
            {
              name: '影响对象',
              tagId: 'DATA_INFLUENCE_OBJECT',
              parentId: 0,
              parentTagId: '数据安全判定依据',
              description: `影响对象指金融业机构数据安全性遭受破坏后受到影响的对象，包括国家安全，公众权益，个人隐私，企业合法权益等。`,
              key: 'DATA_INFLUENCE_OBJECT',
              children: [],
            },
            {
              name: '影响范围',
              tagId: 'DATA_INFLUENCE_SCOPE',
              parentId: 0,
              parentTagId: '数据安全判定依据',
              description: '',
              key: 'DATA_INFLUENCE_SCOPE',
              children: [],
            },
            {
              name: '影响程度',
              tagId: 'DATA_IMPACT_DEGREE',
              parentId: 0,
              parentTagId: '数据安全判定依据',
              description: `影响程度指金融业机构数据安全性遭到破坏后所产生影响的大小，从高到低划分为严重损害、一般
              损害、轻微损害和无损害。影响程度的确定宜综合考虑数据类型、数据特征与数据规模等因素，并结合金融业务属性确定数据安全性遭到玻坏后的影响程
              度，例如：<br/>
              1. 数据安全性遭到破坏后，客户的个人自然信息产生的影响程度通常要高于单位基本信息。<br/>
              2. 数据安全性遭到破坏后，身份鉴别信息产生的影响程度通常要高于个人基本概况信息。<br/>
              3. 交易信息中对实时性要求较高的数据，其安全性遭到破坏产生的影响程度通常要高于实时性要求较低的数据等。
              `,
              key: 'DATA_IMPACT_DEGREE',
              children: [],
            },
          ],
        },
      ],
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
      ],
      levelPrePath: {
        DATA_SECURITY_LEVEL: '数据安全评级/DATA_SECURITY_LEVEL',
        DATA_IMPORTANCE: '数据重要程度评估/DATA_IMPORTANCE',
        DATA_INFLUENCE_OBJECT: '数据安全影响评估/DATA_INFLUENCE_OBJECT',
        DATA_INFLUENCE_SCOPE: '数据安全影响评估/DATA_INFLUENCE_SCOPE',
        DATA_IMPACT_DEGREE: '数据安全影响评估/DATA_IMPACT_DEGREE',
      },
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
    }
  },
  computed: {},
  inject: ['reload'],
  mounted() {
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
          callback: () => { },
        })
      }, 1000)
    },
    async initializeTree() {
      try {
        const res = await API.getLevelData()
        const result = res.data.data
        const allTagData = result.map(item => ({
          ...item.tag,
          key: item.tag.tagId,
          parentId: item.classificationType,
          classificationType: item.classificationType,
          description: JSON.parse(item.tag.properties).description,
        }))
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
        this.$blauShowFailure(error)
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
        if (node.data.name === '安全等级') return 'iconfont icon-safetylevel'
        if (node.data.name === '影响范围') return 'iconfont icon-scope'
        if (node.data.name === '重要程度') return 'iconfont icon-importance'
        if (node.data.name === '影响程度') return 'iconfont icon-extent'
        if (node.data.name === '影响对象') return 'iconfont icon-impactobject'
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
              label: '新增' + data.name,
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
              label: '修改',
              callback: () => {
                this.handleEdit(data)
              },
              args: 'folder',
            })
            options.push({
              icon: 'iconfont icon-delete',
              label: '删除',
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
      this.tagData = {
        nameLabel: data.name + '名称',
        namePlaceholder: data.name + '名称，避免使用#/\\@$_%<>等特殊字符',
        name: '',
        descLabel: data.name + '描述',
        description: '',
        classificationType: data.tagId,
      }
      this.tagDialogTitle = `新增${data.name}`
      // this.rules.name[0].message = '请输入' + data.name + '名称'
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
      this.tagData = {
        tagId: data.tagId,
        nameLabel: parentData.name + '名称',
        namePlaceholder: parentData.name + '名称，避免使用#/\\@$_%<>等特殊字符',
        name: data.name,
        descLabel: parentData.name + '描述',
        description: data.description,
        classificationType: parentData.tagId,
      }
      this.tagDialogTitle = `修改${parentData.name}`
      // this.rules.name[0].message = '请输入' + parentData.name + '名称'
      this.tagDialogVisible = true
      this.$refs.tagForm && this.$refs.tagForm.$refs.form.clearValidate()
    },
    handleDelete(data) {
      this.$confirm('确认删除？', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      }).then(() => {
        API.deleteLevel(data.tagId)
          .then(res => {
            if (res.data.status === 200) {
              this.$blauShowSuccess('删除成功')
              const tree = this.$refs.securityTree.$refs.tree
              tree.remove(data)
              if (this.currentNode.id === data.id) {
                this.currentNode = (
                  tree.getNode({
                    tagId: data.parentId,
                  }) || {}
                ).data
              }
            } else {
              this.$blauShowFailure(res.data.msg)
            }
          })
          .catch(e => {
            this.$blauShowFailure(e)
          })
      })
    },
    handleCloseTagDialog() {
      this.tagDialogVisible = false
      this.tagData = {
        tagId: undefined,
        nameLabel: '名称',
        name: '',
        descLabel: '描述',
        description: '',
        classificationType: null,
      }
    },
    submitData() {
      this.$refs.tagForm.$refs.form.validate(async valid => {
        if (valid) {
          const { tagId, name, description, classificationType } = this.tagData
          // console.log(tagId, name, description, classificationType)
          const params = {
            tagId,
            tagName: name,
            classificationType,
            description,
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
            this.$blauShowSuccess(tagId ? '修改成功' : '创建成功')
            this.tagDialogVisible = false
            nextNodeId = tagId || rs.tag.tagId
            await this.initializeTree()
            const nextNode = this.$refs.securityTree.$refs.tree.getNode({
              tagId: nextNodeId,
            })
            this.currentNode = nextNode.data
          } else {
            this.$blauShowFailure(apiRes.data.msg)
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
      // console.log(asset)
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      if (asset.type == '80000005') {
        window.open(
          baseUrl +
          `main/meta?objectId=${asset.objectId}&blank=true&isAssets=true`
        )
      }
      // this.$bus.$emit('showDetail', query);
      if (asset.assetsType == '80000004') {
        // 表
        window.open(
          baseUrl +
          `myItem?objectId=${asset.objectId}&catalogPath=${asset.sourcePath}&type=TABLE&blank=true&isAssets=true`
        )
      }
      if (asset.assetsType == '80500008') {
        // 视图
        window.open(
          baseUrl +
          `myItem?objectId=${asset.objectId}&catalogPath=${asset.sourcePath}&type=VIEW&blank=true&isAssets=true`
        )
      }
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
          this.loading = false
          if (currentNode.tagId === this.currentNode.tagId) {
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
          this.$blauShowFailure(e)
        })
    },
    // 搜索目录树
    async queryTags(keyword) {
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
        this.$blauShowFailure(error)
        this.searchLoading = false
      }
    },
  },
  watch: {
    currentNode: {
      handler(node, oldNode = {}) {
        // console.log(node)
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
        this.searchTimer = setTimeout(() => { }, 1000)
      }
    },
    assetKeyword(keyword) {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(() => {
          this.queryAssets({
            pageNo: 1,
            pageSize: 20,
          })
          this.searchTimer = null
        }, 1000)
      } else {
        this.queryAssets({
          pageNo: 1,
          pageSize: 20,
        })
        this.searchTimer = setTimeout(() => { }, 1000)
      }
    },
  },
  beforeDestroy() {
    clearTimeout(this.searchTimer)
    $(document).unbind('mouseup', this.handleDragEnd)
  },
}
