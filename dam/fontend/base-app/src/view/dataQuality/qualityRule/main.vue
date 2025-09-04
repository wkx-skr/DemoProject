<template>
  <div class="qualityRule-content">
    <div>
      <datablau-page-title
        class="page-title-row2"
        :parent-name="$t('common.page.dataQuality')"
        :name="$t('common.page.qualityRule')"
      >
        <span v-if="showBuRule" class="rules-qualityRule">
          {{
            this.$t('quality.qualityRule.showBuRule', {
              buRuleName: this.$route.query.buRuleName,
            })
          }}
          <span class="rules-qualityRule-icon" @click="goQualityRule()">
            <i class="el-icon-close"></i>
          </span>
        </span>
      </datablau-page-title>
      <div class="tree-area">
        <div class="en-tree-box">
          <datablau-input
            maxlength="100"
            style="
              width: 260px;
              margin: 10px;
              position: relative;
              top: -1px;
              display: inline-block;
            "
            :iconfont-state="true"
            v-model="keyword"
            clearable
            :placeholder="$t('quality.page.qualityRule.treePlaceholder')"
          ></datablau-input>
        </div>
        <div class="tree-box" style="bottom: 0">
          <datablau-easy-tree
            style="position: relative"
            :show-checkbox="false"
            v-loading="treeLoading"
            ref="mainTree"
            :data="treeData"
            :key="treeKey"
            :expand-on-click-node="false"
            default-expand-all
            :props="defaultProps"
            @node-click="handleNodeClick"
            :filter-node-method="filterNode"
            check-strictly
            node-key="treeId"
            :data-supervise="false"
            :data-icon-function="dataIconFunction"
            height="calc(100vh - 110px)"
            :itemSize="34"
          ></datablau-easy-tree>
        </div>
        <!-- <div class="manage-box" v-if="$auth['QUALITY_BUSINESS_RULE_VIEW_CATALOG_ADD']">
        <datablau-button type="important" @click="addRulesCatalogue">
          添加目录
        </datablau-button>
      </div> -->
      </div>
      <div class="folder-line"></div>
      <div class="citic-card-tabs" :class="{ hideTab: !showTabs }">
        <index
          ref="index"
          :showBuRule="showBuRule"
          @showAddOrEdit="showAddOrEdit"
          :auth="auth"
          :add-auth="rootHasAuth"
          :treeData="treeData"
          :catalogId="catalogId"
          :catalogId2="catalogId2"
        ></index>
      </div>
      <div class="our-detail" v-if="addDetail">
        <div class="model-item-page-title">
          <datablau-breadcrumb
            :node-data="nodeData"
            @back="preRemove"
          ></datablau-breadcrumb>
        </div>
        <add-or-edit
          ref="addTab"
          v-if="showAddTab"
          :nameList="nameList"
          @back="showIndex"
          :isSee="false"
          :current-business-rule="currentCategory"
        ></add-or-edit>
        <add-or-edit
          ref="editTab"
          v-if="showEditTab"
          :nameList="nameList"
          @back="showIndex"
          :ruleDataObj="ruleDataObj"
          :isSee="false"
        ></add-or-edit>
        <add-or-edit
          v-if="showIsSee"
          :nameList="nameList"
          @back="showIndex"
          :ruleDataObj="ruleDataObj"
          :hasUnclosedTask="hasUnclosedTask"
          @showAddOrEdit="showAddOrEdit"
          :isSee="true"
          :auth="auth"
        ></add-or-edit>
      </div>
    </div>
  </div>
</template>

<script>
import index from './index'
import addOrEdit from './addOrEdit.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import HistoryManager from '@service/router/HistoryManager'
export default {
  components: {
    index,
    addOrEdit,
  },
  data() {
    return {
      lastTab: 'list',
      currentTab: 'list',
      detailTabList: [],
      showAddTab: false,
      showEditTab: false,
      display: 'index',
      nameList: [],
      ruleDataObj: {},
      isSee: false,
      editShow: true,
      showBuRule: false,
      nodeData: [],
      addDetail: false,
      showIsSee: false,
      hasUnclosedTask: false,
      treeData: [],
      treeKey: 0,
      defaultProps: {
        value: 'treeId',
        label: 'name',
        children: 'subNodes',
      },
      keyword: '',
      catalogsMap: new Map(),
      auth: false,
      rootHasAuth: false,
      currentCategory: null,
      catalogId: null,
      catalogId2: null,
      historyManager: null,
      treeLoading: false,
    }
  },
  mounted() {
    this.initResizeHorizontal()
    this.getTreeData()
    if (this.$route.query.buRuleId) {
      this.showBuRule = true
      this.currentTab = 'buRule'
      this.lastTab = this.currentTab
    }
    if (this.$route.query.id) {
      this.openSingleJob()
    }
    this.historyManager = new HistoryManager(
      this,
      'id',
      ['openSingleJob', 'openSingleJob2'],
      'backToListDirectly',
      false
    )
  },
  beforeDestroy() {
    this.historyManager.destroy()
  },
  methods: {
    openSingleJob() {
      this.addDetail = true
      this.showIsSee = true
    },
    openSingleJob2() {
      this.addDetail = true
      this.showEditTab = true
    },
    backToListDirectly() {
      this.addDetail = false
      this.showIsSee = false
      this.historyManager.updateRoute(null)
    },
    recu(data) {
      // console.log('data',data)
      let arr = []
      data?.forEach(item => {
        // if (item.subNodes && item.subNodes.length > 0) {
        if (item.subNodes === null) {
          item.subNodes = []
        }
        if (item.businessRules && item.businessRules !== null) {
          item.businessRules?.forEach(element => {
            element.type2 = 'businessRules'
            element.auth = item.auth
            // if (element.type2 === 'businessRules') {
            // element.treeId = 'businessRules_' + element.id
            item.subNodes.push(element)
            // }
          })
        }
        if (item.subNodes) {
          item.subNodes?.forEach(element => {
            element.type = 'subNodes'
            if (element.type === 'subNodes') {
              element.treeId = 'subNodes_' + element.id
            }
            if (element.type2 && element.type2 === 'businessRules') {
              element.treeId = 'businessRules_' + element.id
            }
          })
          this.recu(item.subNodes)
        }
        // }
      })
      return data
    },
    getTreeData() {
      const treeData = []
      this.treeLoading = true
      this.$http
        .post(this.$quality_url + '/quality/getQualityRuleTree')
        .then(res => {
          res.data.name = '技术规则'
          res.data.treeId = '_ROOT'
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
          this.treeData = this.recu(treeData)
          this.treeLoading = false
          this.$nextTick(function () {
            this.$refs.mainTree.setCurrentKey('_ROOT')
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
    handleNodeClick(data, node) {
      this.auth = !(data.auth === 1 || data.auth === 0)
      if (node.level === 1) {
        this.currentCategory = null
      } else {
        if (this.auth) {
          this.currentCategory = data.id
        }
      }
      this.$refs.index.changeTree()
      if (data.type2) {
        this.$refs.index.notBuRule = false
        this.$refs.index.initData(null, data.id)
        this.catalogId = null
        this.catalogId2 = data.id
      } else {
        this.$refs.index.initData(data.id)
        this.$refs.index.notBuRule = true
        this.catalogId = data.id
        this.catalogId2 = null
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
    },
    dataIconFunction(data, node) {
      if (data.type2 && data.type2 === 'businessRules') {
        return 'iconfont icon-yewuguize'
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (data.id !== 0) {
        if (this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_RENAME) {
          options.push({
            label: '重命名',
            callback: () => {
              this.handleEditCatalogue(data)
            },
            args: 'folder',
          })
        }
        if (this.$auth.QUALITY_BUSINESS_RULE_VIEW_CATALOG_DELETE) {
          options.push({
            label: '删除',
            callback: () => {
              this.deleteCatalogue(data)
            },
            args: 'folder',
          })
        }
      }
      return options
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
    goQualityRule() {
      this.showBuRule = false
      this.$router.push({
        name: 'qualityRule',
        path: 'qualityRule',
      })
      this.$bus.$emit('refreshRuleList')
    },
    showAddOrEdit(nameList, ruleDataObj, isSee, hasUnclosedTask) {
      this.nameList = nameList
      this.ruleDataObj = ruleDataObj
      this.isSee = isSee
      this.addDetail = true
      this.hasUnclosedTask = hasUnclosedTask
      if (isSee) {
        // 查看
        this.showIsSee = true
        this.detailTabList.push(ruleDataObj.name)
        this.currentTab = ruleDataObj.name
        this.nodeData = [
          { name: this.$t('common.page.qualityRule'), couldClick: false },
          {
            name: this.$t('common.button.scan') + ruleDataObj.name,
            couldClick: false,
          },
        ]
        if (ruleDataObj.level === 1) {
          this.historyManager.updateRoute(ruleDataObj.id, '0')
        } else {
          this.$router.push({
            query: {
              copy: true,
              copyId: ruleDataObj.copyId,
              blank: this.$route.query.blank,
            },
          })
          this.historyManager.updateRoute(ruleDataObj.id, '0')
        }
      } else if (!ruleDataObj) {
        // 新增
        this.showAddTab = true
        this.nodeData = [
          { name: this.$t('common.page.qualityRule'), couldClick: false },
          {
            name: this.$t('quality.page.qualityRule.addRule'),
            couldClick: false,
          },
        ]
        this.currentTab = 'add'
      } else {
        // 编辑
        this.showEditTab = true
        this.showIsSee = false
        this.editShow = false
        setTimeout(() => {
          this.editShow = true
        })
        this.currentTab = 'edit'
        this.nodeData = [
          { name: this.$t('common.page.qualityRule'), couldClick: false },
          {
            name: this.$t('common.button.edit') + ruleDataObj.name,
            couldClick: false,
          },
        ]
        if (ruleDataObj.level === 1) {
          this.historyManager.updateRoute(ruleDataObj.id, '1')
        } else {
          this.$router.push({
            query: {
              copy: true,
              copyId: ruleDataObj.copyId,
              blank: this.$route.query.blank,
            },
          })
          this.historyManager.updateRoute(ruleDataObj.id, '1')
        }
      }
    },
    // showCreateRuleFromStandard () {
    //   this.display = 'createRuleFromStandard'
    // },
    showIndex(name) {
      if (this.$route.query.blank) {
        window.close()
      } else {
        this.removeTab(name)
      }
    },
    preRemove() {
      if (this.$route.query.blank) {
        window.close()
      } else if (this.showAddTab) {
        this.$refs.addTab.preBack()
      } else if (this.showEditTab) {
        this.$refs.editTab.preBack()
      } else {
        this.removeTab()
      }
    },
    removeTab() {
      this.addDetail = false
      this.showEditTab = false
      this.showAddTab = false
      this.showIsSee = false
      this.$router.push({
        query: {},
      })
      this.historyManager.updateRoute(null)
    },
  },
  watch: {
    keyword(val) {
      this.$refs.mainTree.filter(val)
    },
  },
  computed: {
    showTabs() {
      return (
        this.showAddTab ||
        this.showEditTab ||
        this.detailTabList.length ||
        this.$route.query.buRuleId
      )
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.qualityRule-content {
  .tree-area {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 280px;
    background-color: var(--white-grey-bgc);
    border-right: none;
    // border: 1px solid var(--border-color-lighter);
    border-left: none;
    .tree-box {
      position: absolute;
      top: 52px;
      right: 0;
      bottom: 50px;
      // border-top: 1px solid #E6E6E6;
      left: 0;
      overflow: auto;
    }
  }
  .folder-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 280px;
    z-index: 2;
    width: 1px;
    cursor: e-resize !important;
    background-color: #e0e0e0;
  }
  .citic-card-tabs {
    top: 0;
    left: 280px;
    background: #fff;
  }
  .citic-card-tabs {
    background: #fff;
  }
  .rules-qualityRule {
    position: relative;
    padding-left: 20px;
    font-weight: 100;
    &:before {
      position: absolute;
      width: 2px;
      height: 14px;
      background-color: $border-color;
      content: '';
      top: 6px;
      left: 7px;
    }
    .rules-qualityRule-icon {
      width: 16px;
      height: 16px;
      background: $component-divide-color;
      display: inline-block;
      position: relative;
      border-radius: 100%;
      margin-left: 4px;
      margin-bottom: 3px;
      vertical-align: middle;
      cursor: pointer;
      &:hover {
        background: $table-click-color;
        i {
          color: $primary-color;
        }
      }
      i {
        position: absolute;
        top: 2px;
        left: 2px;
        color: $text-disabled;
        font-size: 8px;
      }
    }
  }
  .our-detail {
    background: #fff;
    position: absolute;
    width: 100%;
    z-index: 12;
    top: 0;
    bottom: 0;
    .model-item-page-title {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 9;
      height: 40px;
      margin: 0 20px;
      font-size: 16px;
      // line-height: 40px;
      padding-top: 8px;
      background: var(--default-bgc);
      border-bottom: 1px solid var(--border-color-lighter);
      // border-bottom: 1px solid red;
      button {
        margin-top: 8px;
      }
      .item-title {
        font-size: 18px;
      }
      .bottom-line {
        position: absolute;
        right: 20px;
        bottom: 0;
        left: 20px;
        display: inline-block;
        border-bottom: 1px solid #ddd;
      }
    }
  }
}
.boxDiv {
  //padding-left: 20px;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  overflow: auto;
  background-color: var(--default-bgc);
}
.returnIco {
  position: absolute;
  top: 10px;
  left: 10px;
  transform: scale(0.9);
}
</style>
