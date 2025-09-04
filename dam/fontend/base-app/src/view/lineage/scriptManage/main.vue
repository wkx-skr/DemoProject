<template>
  <div class="catalogueList">
    <!--    <div class="tree-area">
      <div class="en-tree-box">
        <datablau-input
          maxlength="100"
          style="
            min-width: 260px;
            margin: 10px;
            position: relative;
            top: -1px;
            display: inline-block;
          "
          :iconfont-state="true"
          v-model="keyword"
          clearable
        ></datablau-input>
      </div>
      <div class="tree-box">
        <datablau-tree
          class="el-tree light-blue-tree grey-tree"
          style="position: relative"
          :show-checkbox="false"
          ref="mainTree"
          :data="treeData"
          :key="treeKey"
          :expand-on-click-node="false"
          default-expand-all
          :props="defaultProps"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          check-strictly
          node-key="id"
          :data-supervise="true"
          :data-icon-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
        ></datablau-tree>
      </div>
    </div>-->
    <!--    <div class="folder-line"></div>-->
    <div class="citic-card-tabs">
      <div class="breadcrumb" v-if="isAdd || isEdit">
        <datablau-breadcrumb
          :node-data="nodeData"
          @back="removeTab"
          @nodeClick="removeTab"
        ></datablau-breadcrumb>
      </div>

      <list
        v-if="!isAdd && !isEdit"
        @addScript="addScript"
        @edit="editScript"
      ></list>
      <add-script
        v-if="isAdd || isEdit"
        :editRowInfo="editRowInfo"
        :isEdit="isEdit"
        @removeTab="removeTab"
      ></add-script>
    </div>
  </div>
</template>
<script>
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import list from './list.vue'
import addScript from './addScript.vue'
export default {
  components: {
    list,
    addScript,
  },
  data() {
    return {
      keyword: '',
      isAdd: false,
      isEdit: false,
      nodeData: [],
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'subNodes',
      },
      treeData: [],
      treeKey: 0,
      editRowInfo: {},
    }
  },
  // beforeCreate() {
  beforeMount() {},
  mounted() {
    // this.initResizeHorizontal()
    this.nodeData = [
      {
        name: this.$t('meta.lineageManage.scriptManage.scriptManage'),
        couldClick: false,
      },
    ]
  },
  methods: {
    addScript() {
      this.isAdd = true
      this.nodeData.push({
        name: this.$t('meta.lineageManage.scriptManage.createScript'),
        couldClick: false,
      })
    },
    editScript(rowData) {
      this.isEdit = true
      this.nodeData.push({
        name: this.$t('meta.lineageManage.scriptManage.editScript'),
        couldClick: false,
      })
      this.editRowInfo = rowData
    },
    removeTab() {
      this.isAdd = false
      this.isEdit = false
      this.nodeData = [
        {
          name: this.$t('meta.lineageManage.scriptManage.scriptManage'),
          couldClick: false,
        },
      ]
    },

    /* handleNodeClick(data, e) {},
    filterNode(value, data, node) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
    }, */
    /* dataOptionsFunction(data) {
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
    } */
    /*
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    }, */
    // 控制左右两边的拖拽
    /* initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-area'),
          middleDom: $('.folder-line'),
          rightDom: $('.citic-card-tabs'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
        })
      }, 1000)
    }, */
  },
  watch: {},
}
</script>
<style scoped lang="scss">
.catalogueList {
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
  /*.folder-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 280px;
    z-index: 2;
    width: 1px;
    cursor: e-resize !important;
    background-color: #e0e0e0;
  }*/
  .citic-card-tabs {
    top: 0;
    left: 0;
    background: #fff;
    .breadcrumb {
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
</style>
<style lang="scss"></style>
