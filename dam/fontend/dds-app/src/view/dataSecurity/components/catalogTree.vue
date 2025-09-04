<!--
 * @author weifeng shi
 * @description: 数据安全模块常规目录树模块（统一树组件管理）
 * 识别算法，数据脱敏规则，访问策略管理，识别任务, 识别规则
 * @date 2023-08-17 15:52
 -->
<template>
  <div class="catalog-tree-page">
    <!-- 新建或编辑目录 -->
    <datablau-dialog
      width="560px"
      :title="catalogTitle"
      :visible.sync="catalogDialogVisible"
      v-if="catalogDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      @close="closeCatalogDialog"
      :height="298"
    >
      <datablau-form
        v-if="catalogEditable"
        :model="catalogDetails"
        :rules="catalogRules"
        ref="catalogForm"
        label-width="60px"
        class="catalogDialog"
      >
        <el-form-item :label="$t('securityModule.name')" prop="name">
          <datablau-input
            clearable
            show-word-limit
            maxlength="100"
            size="small"
            style="width: 100%"
            v-model="catalogDetails.name"
            :placeholder="$t('securityModule.input')"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('securityModule.des')" prop="description">
          <datablau-input
            type="textarea"
            clearable
            show-word-limit
            maxlength="1000"
            size="small"
            class="item-desc"
            style="width: 100%; height: 120px"
            v-model="catalogDetails.describe"
            :placeholder="$t('securityModule.input')"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <datablau-detail v-else :fullWidth="true" :labelWidth="'auto'">
        <el-form-item
          :label="$t('securityModule.catalogName')"
          style="width: 100%"
        >
          <span>{{ catalogDetails.name }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('securityModule.catalogDes')"
          style="width: 100%"
        >
          <span>{{ catalogDetails.describe }}</span>
        </el-form-item>
      </datablau-detail>
      <div slot="footer">
        <datablau-button type="secondary" @click="closeCatalogDialog">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          v-if="catalogEditable"
          type="important"
          @click="submitCatalog"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <template v-if="treeList">
      <datablau-tree-header :noTitle="!showTitle">
        <template v-if="showTitle">
          <template slot="title">
            {{ getTitle(type) }}
          </template>
          <template slot="more" v-if="getAuth(type)">
            <datablau-button
              type="icon"
              low-key
              :tooltip-content="$t('securityModule.new')"
              class="iconfont icon-tianjia"
              @click="openCatalogDialog('new', {})"
            ></datablau-button>
          </template>
        </template>
        <template slot="search">
          <datablau-input
            v-model="catalogKeyword"
            clearable
            :placeholder="$t('securityModule.search')"
            :iconfont-state="true"
          ></datablau-input>
          <datablau-button
            v-if="!showTitle"
            type="icon"
            low-key
            :tooltip-content="$t('securityModule.new')"
            class="iconfont icon-tianjia"
            @click="openCatalogDialog('new', {})"
          ></datablau-button>
        </template>
      </datablau-tree-header>
      <div
        class="tree-title"
        :class="{ 'tree-title-active': !currentNode.catalogId }"
        @click="handleAllTree"
      >
        <i class="iconfont icon-file"></i>
        <span>{{ getTitle(type, 3) }}</span>
      </div>
      <div class="tree-line"></div>
      <div class="tree-content" :class="{ 'tree-content-spe': !showTitle }">
        <datablau-tree
          :show-overflow-tooltip="true"
          @node-click="handleNodeClick"
          node-key="catalogId"
          :props="defaultProps"
          :data="treeData"
          :auto-expand-parent="true"
          :default-expanded-keys="expandedKeys"
          :data-icon-function="dataIconFunction"
          :data-supervise="true"
          :data-options-function="dataOptionsFunction"
          :expand-on-click-node="false"
          :highlight-current="true"
          ref="catalogTree"
          :filter-node-method="filterNode"
        ></datablau-tree>
      </div>
    </template>
  </div>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
export default {
  props: {
    clickTree: Function,
    type: {
      type: String,
      default: 'DISCERN_ALGORITHM',
    },
    defaultProps: {
      type: Object,
      default() {
        return {
          children: 'subNodes',
          label: 'name',
        }
      },
    },
  },
  computed: {
    showTitle() {
      if (
        this.type === 'DISCERN_RULE' ||
        this.type === 'DISCERN_TASK' ||
        this.type === 'DISCERN_ALGORITHM'
      ) {
        return false
      } else {
        return true
      }
    },
  },
  data() {
    let nameValidatePass = async (rule, value, callback) => {
      if (this.catalogDetails.name === '') {
        callback(new Error(this.$t('securityModule.input')))
      } else {
        // 判断是否含不允许输入的特殊字符
        const reg = /[#/\\@$_%<>]/gi
        if (reg.test(this.catalogDetails.name)) {
          callback(new Error(this.$t('securityModule.inputTip')))
        } else {
          // 判断名称是否已存在
          const params = {
            parentId: this.catalogDetails.parentId || 0,
            name: this.catalogDetails.name,
            type: this.type,
            catalogId: this.catalogDetails.catalogId,
          }
          const existRes = await API.checkStrategyCatalogName(params)
          if (!existRes.data.data) {
            callback(new Error(this.$t('securityModule.reName')))
          } else {
            callback()
          }
        }
      }
    }
    return {
      treeList: true,
      expandedKeys: [],
      catalogKeyword: '',
      currentNode: {},
      treeData: [],
      catalogTitle: '',
      catalogDialogVisible: false,
      catalogEditable: false,
      catalogDetails: {}, // 操作目录
      catalogRules: {
        name: {
          required: true,
          validator: nameValidatePass,
          trigger: 'blur',
        },
      },
      resetId: '',
      newTreeData: [],
      parentId: '',
      curCatalogId: '',
    }
  },
  watch: {
    catalogKeyword: {
      handler(val) {
        this.$refs.catalogTree.$refs.tree.filter(val)
      },
    },
  },
  mounted() {
    this.getTree()
  },
  methods: {
    closeCatalogDialog() {
      this.catalogDialogVisible = false
    },
    setAllAttr(type) {
      let params = {
        title: '',
        catalogTitle: '',
        allCatalog: '',
        manage: false,
        view: false,
      }
      switch (type) {
        case 'DISCERN_ALGORITHM':
          // 识别算法
          params.title = this.$t('securityModule.algorithmLib')
          params.catalogTitle = this.$t('securityModule.algorithmLibCatalog')
          params.allCatalog = this.$t('securityModule.allAlgorithmLib')
          params.manage = this.$auth.DATA_SECURITY_DISCERN_ALGORITHM_MANAGE
          params.view = this.$auth.DATA_SECURITY_DISCERN_ALGORITHM_CATALOG
          break
        case 'MASK_RULE':
          // 数据脱敏规则
          params.manage = this.$auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE
          params.view = this.$auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE
          params.title = this.$t('securityModule.desensitizationRules')
          params.catalogTitle = this.$t(
            'securityModule.desensitizationRulesCatalog'
          )
          params.allCatalog = this.$t('securityModule.allDesensitizationRules')
          break
        case 'ACCESS_CONTROL':
          // 访问策略管理
          params.manage = this.$auth.DATA_SECURITY_ACCESS_CATALOG_MANAGE
          params.view = this.$auth.DATA_SECURITY_ACCESS_CATALOG_VIEW
          params.title = this.$t('securityModule.accessPolicy')
          params.catalogTitle = this.$t('securityModule.accessPolicyCatalog')
          params.allCatalog = this.$t('securityModule.allAccessPolicy')
          break
        case 'DISCERN_TASK':
          // 识别任务管理
          params.manage = this.$auth.DATA_SECURITY_DISCERN_RULE_MANAGE
          params.view = this.$auth.DATA_SECURITY_DISCERN_TASK
          params.title = this.$t('securityModule.idTasks')
          params.catalogTitle = this.$t('securityModule.idTasksCatalog')
          params.allCatalog = this.$t('securityModule.allIdTasks')
          break
        case 'DISCERN_RULE':
          // 识别规则管理
          params.manage = this.$auth.DATA_SECURITY_DISCERN_RULE_MANAGE
          params.view = this.$auth.DATA_SECURITY_DISCERN_RULE
          params.title = this.$t('securityModule.idRules')
          params.catalogTitle = this.$t('securityModule.idRulesCatalog')
          params.allCatalog = this.$t('securityModule.allIdRules')
          break
        default:
          break
      }
      return params
    },
    getTitle(type, num = 1) {
      const params = this.setAllAttr(type)
      if (num === 1) {
        return params.title
      }
      if (num === 2) {
        return params.catalogTitle
      }
      if (num === 3) {
        return params.allCatalog
      }
    },
    // 判断权限
    getAuth(type, num = 1) {
      const params = this.setAllAttr(type)
      // 管理权限
      if (num === 1) {
        return params.manage
      }
      // 查看权限
      if (num === 2) {
        return params.view
      }
    },
    // 根据关键字过滤策略目录树
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 设置目录树的全路径
    getAllPath(node) {
      const that = this
      function handleData(data, nameList = []) {
        data.map(item => {
          item.nameList = _.cloneDeep(nameList)
          const nameMap = {
            name: item[that.defaultProps.label],
          }
          item.nameList.push(nameMap)
          if (
            item[that.defaultProps.children] &&
            item[that.defaultProps.children].length > 0
          ) {
            handleData(item[that.defaultProps.children], item.nameList)
          }
        })
      }
      handleData(node)
    },
    async getTree(name) {
      try {
        const res = await API.getStrategyCatalog(this.type)
        if (res.status === 200) {
          this.treeList = true
          await this.getAllPath(res.data.data.subNodes || [])
          this.treeData = res.data.data.subNodes || []
          this.toParent()
        } else {
          this.$showFailure(res)
          this.treeList = false
        }
      } catch (e) {
        this.$showFailure(e)
        this.treeList = false
        this.clickTree('listShow')
      }
    },
    handleAllTree() {
      this.curCatalogId = ''
      this.toParent()
    },
    toParent() {
      this.$nextTick(() => {
        if (this.resetId) {
          // 编辑，新建目录下的列表时
          this.curCatalogId = this.resetId
        }
        const tree = this.$refs.catalogTree.$refs.tree
        if (this.curCatalogId) {
          const node = tree.getNode(this.curCatalogId)
          this.currentNode = node.data
        } else {
          this.currentNode = {}
        }
        this.setCurrentKey(this.curCatalogId)
        const options = {
          data: this.currentNode,
          catalogLen: this.treeData.length,
          treeData: this.treeData,
        }
        this.clickTree('catalogTree', options)
      })
    },
    // 将当前节点的所有父级节点展开
    async expandParents(id) {
      const tree = this.$refs.catalogTree.$refs.tree
      const node = tree.getNode(id)
      this.currentNode = node.data
      let parentId = node.data.parentId
      if (parentId) {
        handleData(parentId)
      }
      function handleData(parentId) {
        tree.store.nodesMap[parentId].expanded = true
        const nowId = tree.getNode(parentId).data.parentId
        if (nowId) {
          handleData(nowId)
        }
      }
      tree.setCurrentKey(this.currentNode.catalogId)
    },
    setCurrentKey(catalogId) {
      this.$nextTick(async () => {
        const tree = this.$refs.catalogTree.$refs.tree
        if (catalogId) {
          await this.expandParents(catalogId)
          tree.setCurrentKey(catalogId)
        } else {
          tree.setCurrentKey(null)
        }
      })
    },
    // 打开目录对话框（新建或修改）
    openCatalogDialog(type, data) {
      if (type === 'new') {
        this.catalogDetails = {
          name: '',
          describe: '',
          parentId: data.catalogId || 0,
        }
        this.catalogTitle =
          this.$t('securityModule.new') + this.getTitle(this.type, 2)
        this.catalogEditable = true
      }
      if (type === 'edit') {
        this.catalogDetails = {
          name: data.name,
          describe: data.describe,
          parentId: data.parentId,
          catalogId: data.catalogId,
        }
        this.catalogTitle =
          this.$t('securityModule.edit') + this.getTitle(this.type, 2)
        this.catalogEditable = true
      }

      if (type === 'see') {
        this.catalogDetails = {
          ...data,
        }
        this.catalogTitle =
          this.$t('securityModule.view') + this.getTitle(this.type, 2)
        this.catalogEditable = false
        this.recordLog(data)
      }
      this.catalogDialogVisible = true
    },
    // 查看目录记录日志
    recordLog(data) {
      const params = {
        desc: data.describe,
        catalogName: data.name,
        catalogId: data.catalogId,
        catalogType: this.type,
      }
      API.recordLogApi(params)
        .then(res => {})
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 打开目录对话框（新建或修改）
    dataOptionsFunction(data) {
      let options = []
      if (this.getAuth(this.type, 1)) {
        options.push({
          icon: 'iconfont icon-tianjia',
          label: this.$t('securityModule.new'),
          callback: () => {
            this.openCatalogDialog('new', data)
          },
        })
        options.push({
          icon: 'iconfont icon-revise',
          label: this.$t('securityModule.edit'),
          callback: () => {
            this.openCatalogDialog('edit', data)
          },
        })
        options.push({
          icon: 'iconfont icon-delete',
          label: this.$t('securityModule.delete'),
          callback: () => {
            this.deleteCatalog(data)
          },
        })
      }
      if (this.getAuth(this.type, 2)) {
        options.push({
          icon: 'iconfont icon-see',
          label: this.$t('securityModule.view'),
          callback: () => {
            this.openCatalogDialog('see', data)
          },
        })
      }
      return options
    },
    // 删除目录
    deleteCatalog(data) {
      const { catalogId, parentId } = data
      const newParams = this.setAllAttr(this.type)
      let hasChild = false
      let tipTxt = ''
      let tipContent = ''
      const name = this.getTitle(this.type, 2)
      if (data.subNodes && data.subNodes.length !== 0) {
        hasChild = true
        tipContent = this.$t('securityModule.delTip1', { name: data.name })
      } else {
        tipContent = this.$t('securityModule.sureDelTip1', { name: data.name })
        hasChild = false
      }
      this.$DatablauCofirm(
        tipContent,
        `${this.$t('securityModule.delete')}${name}`
      ).then(() => {
        API.judgeDelApi(catalogId, this.type)
          .then(res => {
            const bool = res.data.data
            if (bool) {
              API.deleteStrategyCatalog(catalogId, this.type)
                .then(async deleteRes => {
                  if (deleteRes.status === 200) {
                    this.$datablauMessage.success(
                      this.$t('securityModule.delSuccess')
                    )
                    if (this.curCatalogId && this.curCatalogId === catalogId) {
                      if (parentId) {
                        this.curCatalogId = parentId
                      } else {
                        this.curCatalogId = ''
                      }
                    }
                    await this.getTree('delete')
                  } else {
                    this.$showFailure(deleteRes.data)
                  }
                })
                .catch(error => {
                  this.$showFailure(error)
                })
            } else {
              // if (hasChild) {
              //   tipTxt = `${data.name}中存在${newParams.title}，不允许删除！`
              // } else {
              //   tipTxt = `${data.name}中存在${newParams.title}，不允许删除！`
              // }
              tipTxt = this.$t('securityModule.delTip2', {
                name: data.name,
                title: newParams.title,
              })
              this.$datablauMessage.error(tipTxt)
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    // 目录树节点图标
    dataIconFunction(data, node) {
      let className = ''
      if (data.code) {
        className = 'tree-icon domain'
        if (data.udpatingId) {
          className += ' is-udpating'
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
    handleNodeClick(data, node) {
      this.resetId = ''
      this.curCatalogId = data.catalogId
      this.toParent()
    },
    changeCatalog(params) {
      API.modifyStrategyCatalog(params)
        .then(async res => {
          this.catalogDialogVisible = false
          this.$nextTick(() => {
            this.curCatalogId = params.catalogId
            this.getTree()
            this.$datablauMessage.success(this.$t('securityModule.editSuccess'))
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addCatalog(params) {
      API.addStrategyCatalog(params)
        .then(async res => {
          this.catalogDialogVisible = false
          this.curCatalogId = res.data.data
          await this.getTree()
          this.$datablauMessage.success(this.$t('securityModule.newSuccess'))
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    submitCatalog() {
      let params = {
        describe: this.catalogDetails.describe,
        name: this.catalogDetails.name,
        parentId: this.catalogDetails.parentId || 0,
        subNodes: [],
        type: this.type,
      }
      this.$refs.catalogForm.validate(valid => {
        if (valid) {
          if (this.catalogDetails.catalogId) {
            params.catalogId = this.catalogDetails.catalogId
            this.changeCatalog(params)
          } else {
            this.addCatalog(params)
          }
        }
      })
    },
  },
}
</script>

<style scoped lang="scss">
.datablau-detail {
  /deep/ .detail-form {
    padding: 0;
  }
}
.catalogDialog {
  /deep/ .el-form {
    .el-form-item {
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
.catalog-tree-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /deep/ .tree-header {
    .tree-name {
      font-size: 14px;
    }
  }
  .tree-title {
    height: 32px;
    line-height: 32px;
    padding: 0 10px;
    margin-top: 8px;
    box-sizing: content-box;
    cursor: pointer;
    &:hover {
      background: rgba(64, 158, 255, 0.1);
      span {
        color: #409eff;
      }
    }
    &.tree-title-active {
      background: rgba(64, 158, 255, 0.1);
      span {
        color: #409eff;
      }
    }
    i {
      color: #409eff;
    }
    span {
      margin-left: 5px;
    }
  }
  .tree-line {
    height: 1px;
    margin: 8px 0;
    background: #efefef;
  }
  .tree-content {
    position: absolute;
    top: 133px;
    bottom: 0;
    left: 0;
    right: 0;
    overflow-y: auto;
    &.tree-content-spe {
      top: 92px;
    }
  }
}
</style>
