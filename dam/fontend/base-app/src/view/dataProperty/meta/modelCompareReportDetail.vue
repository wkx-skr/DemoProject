<template>
  <div class="detail model-compare-detail">
    <el-dialog
      :title="$t('meta.DS.treeSubOperation.viewPro')"
      width="800px"
      :visible.sync="showLongDetail"
      append-to-body
    >
      <pre style="overflow: auto; max-height: 500px"
        >{{ longDetail }}
      </pre>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="showLongDetail = false" type="text">
          {{ $t('common.button.close') }}
        </el-button>
      </span>
    </el-dialog>
    <div class="sub-title report-header-line" v-if="!versionState">
      <span class="part-title">
        <span v-if="prodModelCompare">
          {{ $t('meta.DS.treeSubOperation.diff') }}
        </span>
        {{ $t('meta.DS.treeSubOperation.reportDetail') }}
      </span>
      <div class="btn-con">
        <datablau-button
          type="secondary"
          class="download-result"
          @click="download"
        >
          <i class="fa fa-download"></i>
          {{ $t('meta.DS.treeSubOperation.downloadDetail') }}
        </datablau-button>
        <datablau-button
          type="primary"
          size="small"
          style="margin-left: 2em"
          @click="showTree = true"
        >
          <!-- <i class="fa fa-grav" ></i> -->
          {{ $t('meta.DS.treeSubOperation.viewDetail') }}
        </datablau-button>
      </div>
    </div>
    <div
      class="table-container"
      :style="{ 'max-width': isFullWidth ? '' : '1000px' }"
    >
      <!--<div class="search-box">-->
      <!--<input type="text" v-model="keyword" placeholder="可以输入关键字搜索" />-->
      <!--</div>-->
      <div
        class="tree-item table-header show-table-head-tooltip"
        v-if="showTree || versionState"
      >
        <span>{{ $t('meta.DS.treeSubOperation.objType') }}</span>
        <span-with-tooltip
          :style="{ width: isFullWidth ? '400px' : '240px' }"
          style="float: right"
          :content="
            compareVersions
              ? compareVersions.right
              : (data.rightObject || '') +
                (prodModelCompare ? '' : $t('meta.DS.treeSubOperation.model'))
          "
          :classString="'right'"
        ></span-with-tooltip>
        <span-with-tooltip
          :style="{ width: isFullWidth ? '400px' : '220px' }"
          style="float: right"
          :content="
            compareVersions
              ? compareVersions.left
              : (data.leftObject || '') +
                (prodModelCompare
                  ? ''
                  : $t('meta.DS.treeSubOperation.dataSource'))
          "
          :classString="'left'"
        ></span-with-tooltip>
      </div>
      <div v-if="showTree || versionState">
        <el-tree
          ref="tree1"
          :data="tableShowData"
          v-loading="treeLoading"
          :props="businessDefaultProps"
          :filter-node-method="filterNode"
          expand-on-click-node
          :render-after-expand="true"
          :default-expand-all="false"
          :render-content="renderContent"
          class="model-compare-tree"
        ></el-tree>
        <div class="bottom-page" v-if="total > 0">
          <datablau-pagination
            layout="total, prev, pager, next"
            @current-change="changeCurrentPage"
            @size-change="handleSizeChange"
            :current-page.sync="currentPage"
            :page-size="pageSize"
            :hide-on-single-page="true"
            :total="total"
          ></datablau-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import spanWithTooltip from '../../../components/common/spanWithTooltip.vue'
import datablauIcon from '@/next/components/basic/icon/DatablauIcon.vue'
export default {
  data() {
    return {
      keyword: '',
      treeLoading: false,
      businessDefaultProps: {
        label: 'name',
        id: 'name',
        children: 'differences',
      },
      showTree: false,
      longDetail: '',
      tableShowData: [],
      pageSize: 20,
      currentPage: 1,
      total: 0,
      showLongDetail: false,
    }
  },
  // props:['tableData','data', 'compareVersions', 'prod-model-compare'],
  props: {
    isLogical: {},
    tableData: {},
    data: {},
    compareVersions: {},
    prodModelCompare: {
      type: Boolean,
      default: false,
      required: false,
    },
    versionState: {
      type: Boolean,
      default: false,
    },
    isFullWidth: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    spanWithTooltip,
    datablauIcon,
  },
  mounted() {
    $(this.$el).on('mouseenter', '.span-with-tooltip', function () {
      const text = $(this).text()
      if (text.length > 12) {
        $(this).attr('title', $(this).text())
      }
    })

    this.dataInit()
  },
  beforeDestroy() {
    $(this.$el).off('mouseenter')
    this.showTree = false
    this.total = 0
    this.tableShowData.length = 0
  },
  methods: {
    download() {
      this.$bus.$emit('downloadResult', !!this.compareVersions)
    },
    renderContent(h, { node, data, store }) {
      const iconClass =
        data.name.toLowerCase() === 'attribute'
          ? this.isLogical
            ? 'logicalcolumn'
            : 'column'
          : data.name.toLowerCase() === 'entity'
          ? this.isLogical
            ? 'logicaltable'
            : 'table'
          : data.name.toLowerCase() === 'keygroup'
          ? 'suoyin'
          : data.name.toLowerCase() === 'properties'
          ? 'set'
          : data.name.toLowerCase()
      let iconArr = null
      let contentStr = ''
      const leftStr = data.leftObject ? data.leftObject : data.leftValue
      const rightStr = data.rightObject ? data.rightObject : data.rightValue
      const map = {
        Entity: this.isLogical
          ? '实体'
          : this.$t('meta.DS.treeSubOperation.table'),
        Relationship: this.$t('meta.DS.treeSubOperation.relationship'),
        Attribute: this.isLogical
          ? '属性'
          : this.$t('meta.DS.treeSubOperation.column'),
        KeyGroup: this.$t('meta.DS.treeSubOperation.key'),
        View: this.$t('meta.DS.treeSubOperation.view'),
        Function: this.$t('meta.DS.treeSubOperation.function'),
        StoredProcedure: this.$t('meta.DS.treeSubOperation.storedPro'),
        Package: this.$t('meta.DS.treeSubOperation.package'),
        Properties: '属性',
      }
      contentStr = map[data.name]
      if (!contentStr) {
        contentStr = this.labelFormatter(node.label)
        iconArr = h(
          datablauIcon,
          {
            props: { 'data-type': 'doc', size: 18 },
            style: { 'vertical-align': 'middle' },
          },
          []
        )
      } else {
        iconArr = h(
          datablauIcon,
          {
            props: { 'data-type': iconClass, size: 18 },
            style: { 'vertical-align': 'middle' },
          },
          []
        )
      }
      const result = h(
        'div',
        {
          class: 'tree-item',
        },
        [
          iconArr,
          h(
            'span',
            {
              class: 'obj-type',
            },
            [contentStr]
          ),
          h(
            'span',
            {
              class: 'right',
              style: {
                width: this.isFullWidth ? '420px' : '240px',
              },
              on: {
                click: () => {
                  const msg = data.rightValue
                  if (node.isLeaf && msg && msg.length > 10) {
                    this.showLongText(msg)
                  }
                },
              },
            },
            [
              h(spanWithTooltip, {
                props: {
                  content: rightStr,
                  widthStr: '240px',
                },
              }),
            ]
          ),
          h(
            'span',
            {
              class: 'left',
              style: {
                width: this.isFullWidth ? '400px' : '240px',
              },
              on: {
                click: () => {
                  const msg = data.leftValue
                  if (node.isLeaf && msg && msg.length > 10) {
                    this.showLongText(msg)
                  }
                },
              },
            },
            [
              h(spanWithTooltip, {
                props: {
                  content: leftStr,
                  widthStr: '240px',
                },
              }),
            ]
          ),
        ]
      )
      return result
    },
    showLongText(text) {
      if (text) {
        this.longDetail = text
        this.showLongDetail = true
      }
    },
    dataInit() {
      this.getShowData({
        pageSize: this.pageSize,
        currentPage: this.currentPage,
      })
    },
    getShowData(para) {
      let tableData = this.tableData
      let tableShowData = []
      const s = para.pageSize
      const c = para.currentPage

      if (tableData && Array.isArray(tableData) && tableData.length > 0) {
        tableShowData = tableData.slice(s * (c - 1), s * c)
      } else {
        tableData = []
      }
      this.total = tableData.length
      this.tableShowData = tableShowData
    },
    changeCurrentPage(currentPage) {
      this.currentPage = currentPage
      this.getShowData({
        pageSize: this.pageSize,
        currentPage: this.currentPage,
      })
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.getShowData({
        pageSize: this.pageSize,
        currentPage: this.currentPage,
      })
    },
    filterNode(value, data) {
      if (!value) return true
      if (!data.name) return false
      return (
        false ||
        //          (data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1)
        (data.leftObject &&
          data.leftObject.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
        (data.leftValue &&
          data.leftValue.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
        (data.rightObject &&
          data.rightObject.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
        (data.rightValue &&
          data.rightValue.toLowerCase().indexOf(value.toLowerCase()) !== -1)
      )
    },
    labelFormatter(en) {
      switch (en) {
        case 'Database':
          return this.$t('meta.DS.treeSubOperation.database')
        case 'Properties':
          return this.$t('meta.DS.treeSubOperation.pro')
        case 'DataType':
          return this.$t('meta.DS.treeSubOperation.dataType')
        case 'Name':
          return this.$t('meta.DS.treeSubOperation.name')
        case 'IsNotNull':
          return this.$t('meta.DS.treeSubOperation.notNull')
        case 'DefaultValue':
          return this.$t('meta.DS.treeSubOperation.defaultVal')
        default:
          return en
      }
    },
    handleExpandChange(row, expandedRows) {
      let isOpen = false
      for (let i = 0; i < expandedRows.length; i++) {
        if (row == expandedRows[i]) {
          isOpen = true
          break
        }
      }
      if (isOpen) {
      } else {
      }
    },
  },
  watch: {
    tableData(newVal) {
      this.showTree = true
      this.currentPage = 1
      this.dataInit()
    },
  },
}
</script>

<style lang="scss" scoped="scoped">
.sub-title {
  font-size: 14px;
  margin-top: 2em;
  margin-bottom: 1em;
}
.table-container {
  min-height: 300px;
  position: relative;
  min-width: 700px;
  //max-width: 1000px;
  height: 440px;
  .show-table-head-tooltip {
    position: absolute;
    top: 0;
  }
  .model-compare-tree {
    position: absolute;
    top: 40px;
    height: 360px;
    overflow: auto;
    left: 0;
    right: 0;
    padding-right: 20px;
    border: 1px solid #ddd;
    border-top: none;
  }
  .bottom-page {
    position: absolute;
    bottom: 0;
  }
}
</style>
<style lang="scss">
.tree-item {
  width: 100%;
  /*flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;*/
  span.left {
    text-align: left;
    float: right;
    width: 240px;
    margin-right: 60px;
  }
  span.right {
    text-align: left;
    float: right;
    width: 240px;
  }
  .left,
  .right {
    min-height: 5px;
  }
}

$treeLineHeight: 40px;
.model-compare-tree {
  .tree-item {
    line-height: $treeLineHeight;
    height: $treeLineHeight;
    .obj-type {
      font-weight: bold;
      padding-left: 10px;
    }
  }
  .el-tree-node__content {
    line-height: $treeLineHeight;
    height: $treeLineHeight;
    border-bottom: 1px solid #eee;
  }
}
</style>
<style lang="scss" scoped>
@import '../../../assets/styles/const.scss';
.table-header {
  // background-color:$blue;
  // color:#FFF;
  border: 1px solid #ddd;
  font-weight: bold;
  padding: 10px 20px 10px;
  span:first-child {
    /*margin-left:2em;*/
  }
  span.right {
    width: 220px;
  }
}
.model-compare-detail {
  .part-title {
    font-size: 16px;
    font-weight: bold;
    line-height: 34px;
  }
  .report-header-line {
    // border: 1px solid red;
    .btn-con {
      // display: inline-block;
      float: right;
      // border: 1px solid red;
      .el-button {
      }
    }
  }
  .bottom-page {
    padding-top: 20px;
    height: 50px;
  }
}
</style>
