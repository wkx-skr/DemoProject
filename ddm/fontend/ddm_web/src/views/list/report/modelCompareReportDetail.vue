<template>
  <div class="detail model-compare-detail model-com-detail">
    <div class="sub-title report-header-line">
      <span class="part-title">{{$store.state.$v.report.reportDetail}}</span>
      <el-tooltip effect="light" :content="$store.state.$v.report.changeScript" placement="right">
        <i class="fa fa-info-circle gray-info"></i>
      </el-tooltip>
      <div class="btn-con">
        <el-button size="small" class="download-result" @click="download">
          <i class="fa fa-download"></i>
          {{$store.state.$v.report.download}}
        </el-button>
        <el-button type="primary" size="small" style="margin-left:2em;" @click="showReportDetail">
          <!-- <i class="fa fa-grav" ></i> -->
          {{$store.state.$v.report.viewDetail}}
        </el-button>

      </div>
    </div>
      <div class="script-table-container" v-if="showTree">
        <div class="left-script-outer">
          <script-show
            :hightLightScript="hightLightScript"
          ></script-show>
        </div>
        <div class="report-script-middle"></div>
        <div class="report-script-right">
          <div class="table-header">
            <div class="tree-item show-table-head-tooltip">
              <span>{{$store.state.$v.RuleChecking.objectType}}</span>
              <span-with-tooltip
                :content="compareVersions ? compareVersions.left : ((data.leftObject || '') + ' (数据源)')"
                :classString="'left'"
              ></span-with-tooltip>
              <span-with-tooltip
                :content="compareVersions ? compareVersions.right : ((data.rightObject || '') + ' (' + $store.state.$v.OperationLog.model + ')')"
                :classString="'right'"
              ></span-with-tooltip>
            </div>
          </div>
          <div class="tree-outer">
            <el-tree
              v-if="showTree"
              ref="tree1"
              :data="tableData"
              v-loading="treeLoading"
              :props="businessDefaultProps"
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              :default-expand-all="false"
              :render-content="renderContent"
              class="model-compare-tree"
              @node-click="handleNodeClick"
            >

            </el-tree>
          </div>
        </div>

    </div>
  </div>
</template>

<script>
import spanWithTooltip from '../../../components/common/spanWithTooltip.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import scriptShow from './scriptShow.vue'
import $ from 'jquery'

export default {
  data () {
    return {
      keyword: '',
      treeLoading: false,
      businessDefaultProps: {
        label: 'name',
        id: 'name',
        children: 'differences'
      },
      showTree: false,
      longDetail: '',
      typeMap: {
        '80000002': 'DataType', // 数据类型
        '90000003': 'Name', // 名称
        '80100033': 'IsNotNull', // 非空
        '80100034': 'DefaultValue', // 默认值
        '80000096': 'KeyGroupMemberRefs', // 索引成员
        '80000097': 'KeyGroupType' // 索引成员
      },

      hightLightScript: '',
      startIndex: null,
      endIndex: null,
      indexArr: []
    }
  },
  props: ['tableData', 'data', 'compareVersions', 'resNodeMap', 'sqlContent'],
  components: {
    spanWithTooltip,
    scriptShow
  },
  beforeMount () {
    this.formatTooltip()
  },
  mounted () {
    $(this.$el).on('mouseenter', '.span-with-tooltip', function () {
      let text = $(this).text()
      if (text.length > 12) {
        $(this).attr('title', $(this).text())
      }
    })
    $(window).resize(this.resetTableStyle)
  },
  beforeDestroy () {
    $(window).unbind('resize', this.resetTableStyle)
  },
  methods: {
    formatTooltip () {
      this.sqlContent = this.sqlContent || ''
      this.setTooltip()

      let str = this.sqlContent
      let indexArr = this.getIndexArr(this.indexArr)
      let result = ''
      let strArr = []
      let currentIndex = 0

      indexArr.forEach(item => {
        if (currentIndex < item[0]) {
          strArr.push(str.substring(currentIndex, item[0]))
        }
        strArr.push('<mark class="hl-dom">')
        currentIndex = item[0] > currentIndex ? item[0] : currentIndex
        strArr.push(str.substring(currentIndex, item[1] - 0 + 1))
        strArr.push('</mark>')
        currentIndex = item[1] - 0 + 1
      })
      strArr.push(str.substring(currentIndex))
      let hightLightScript = strArr.join('')
      this.$emit('setNewSql', hightLightScript)

      this.hightLightScript = hightLightScript
    },
    getIndexArr (indexArr) {
      let result = []
      // let indexArr = this.indexArr
      // indexArr = [[4,5], [1,2], [8, 10], [12, 18], [9, 11]];
      if (indexArr && Array.isArray(indexArr)) {
        indexArr.sort((a, b) => {
          return a[0] - b[0]
        })
        let temp = null

        for (let i = 0, len = indexArr.length; i < len; i++) {
          let a = indexArr[i]
          let b = indexArr[i + 1]
          if (i < (len - 1)) {
            if (temp) {
              a = temp
            }
            if (a[1] < b[0]) {
              result.push(a)
              temp = null
            } else if (a[1] > b[0] && a[1] < b[1]) {
              temp = [a[0], b[1]]
            } else if (a[1] > b[1]) {
              temp = a
            }
          } else {
            if (temp) {
              a = temp
            }
            result.push(a)
          }
        }
      }

      return result
    },
    download () {
      this.$bus.$emit('downloadResult', !!this.compareVersions)
    },
    renderContent (h, { node, data, store }) {
      let iconClass = data.name.toLowerCase()
      let iconArr = null
      let contentStr = ''
      let leftStr = data.leftObject ? data.leftObject : data.leftValue
      let leftTooltipStr = leftStr
      if (data.tooltip) {
        leftTooltipStr = `${$store.state.$v.report.tip8} ${leftStr} ${$store.state.$v.report.tip9} ${data.tooltip}`
      }
      let rightStr = data.rightObject ? data.rightObject : data.rightValue
      let map = {
        Entity: this.$store.state.$v.report.table,
        Relationship: this.$store.state.$v.report.Relationship,
        Attribute: this.$store.state.$v.report.column,
        KeyGroup: this.$store.state.$v.modelDetail.keyIndex,
        View: this.$store.state.$v.dataEntity.view,
        Function: this.$store.state.$v.report.function,
        StoredProcedure: this.$store.state.$v.report.storeLogi
      }
      contentStr = map[data.name]
      if (!contentStr) {
        contentStr = this.labelFormatter(node.label)
      } else {
        if (iconClass === 'function' || iconClass === 'storedprocedure') {

        } else {
          iconArr = h('span', {
            'class': 'tree-icon ' + iconClass
          }, [])
        }
      }
      let level = node.level

      let result = h('div', {
        'class': 'tree-item',
        style: {
          width: `calc( 100% + ${level * 18}px )`,
          marginLeft: `-${level * 18}px`
          // paddingLeft: `${level*18}px`,
        }
      }, [
        // iconArr,
        h('span', {
          class: 'obj-type',
          style: {
            marginLeft: `${level * 18}px`
          }
        }, [iconArr, contentStr]),

        h('span', {
          'class': 'left'
        }, [h('el-tooltip', {
          props: {
            content: leftStr,
            effect: 'light',
            placement: 'left',
            'popper-class': 'left-script-tooltip'
          }
        }, [
          h('span', {
          }, leftStr)
        ])]),

        h('span', {
          'class': 'right',
          on: {
            click: () => {
              let msg = data.rightValue
              if (node.isLeaf && msg && msg.length > 10) {
                this.showLongText(msg)
              }
            }
          }
        }, [
          h('el-tooltip', {
            props: {
              content: rightStr,
              effect: 'light',
              placement: 'left'
            }
          }, [
            h('span', {}, rightStr)
          ])])
      ])
      return result
    },
    showLongText (text) {
      if (text) {
        this.longDetail = text
      }
    },
    filterNode (value, data) {
      if (!value) return true
      if (!data.name) return false
      return (
        false ||
          (data.leftObject && data.leftObject.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
          (data.leftValue && data.leftValue.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
          (data.rightObject && data.rightObject.toLowerCase().indexOf(value.toLowerCase()) !== -1) ||
          (data.rightValue && data.rightValue.toLowerCase().indexOf(value.toLowerCase()) !== -1))
    },
    labelFormatter (en) {
      switch (en) {
        case 'Database':
          return this.$store.state.$v.RuleChecking.database
        case 'Properties':
          return this.$store.state.$v.report.Attribute
        case 'DataType':
          return this.$store.state.$v.udp.dataType
        case 'Name':
          return this.$store.state.$v.tagMgr.name
        case 'IsNotNull':
          return this.$store.state.$v.dataEntity.notNull
        case 'DefaultValue':
          return this.$store.state.$v.udp.defaultValue
        case 'KeyGroupMemberRefs':
          return this.$store.state.$v.reprot.indexMember
        case 'KeyGroupType':
          return this.$store.state.$v.reprot.indexType
        default:
          return en
      }
    },
    setTooltip () {
      let objMap = {}
      let tableData = this.tableData
      this.setObjMap(tableData, objMap)

      let resNodeMap = this.resNodeMap
      for (let key in resNodeMap) {
        let repObj = resNodeMap[key]
        let currentObj = objMap[key] || {}
        for (let index in repObj) {
          let indexArray = repObj[index]
          let strIndexArr = []
          if (indexArray && Array.isArray(indexArray) && indexArray.length > 0) {
            indexArray.forEach(item => {
              let strIndexArrItem = item.split('|') || [0, 0]
              strIndexArrItem = strIndexArrItem.map(item => parseInt(item))
              strIndexArr.push(strIndexArrItem)
            })
            // if (isNaN(parseInt(this.startIndex)) || this.startIndex>strIndexArr[0]) {
            //   this.startIndex = strIndexArr[0];
            // }
            // if (isNaN(parseInt(this.endIndex)) || this.endIndex<strIndexArr[1]) {
            //   this.endIndex = strIndexArr[1];
            // }
            let tooltip = this.sqlContent.substring(strIndexArr[0], strIndexArr[1] + 1)
            if (parseInt(index) === 0) {
              currentObj.tooltip = tooltip
              currentObj.strIndexArr = strIndexArr
            } else {
              let propName = this.typeMap[index]
              if (currentObj[propName]) {
                currentObj[propName].tooltip = tooltip
                currentObj[propName].strIndexArr = strIndexArr
              }
              this.indexArr.push(...strIndexArr)
            }
          }
        }
      }
    },
    setObjMap (arr, objMap, currentParent) {
      if (arr && Array.isArray(arr)) {
        arr.forEach(item => {
          if (item.name !== 'Properties') {
            if (item.leftId) {
              objMap[item.leftId] = item
            } else if (currentParent) {
              let leftId = currentParent.leftId || ''
              currentParent = objMap[leftId]
              if (currentParent) {
                currentParent[item.name] = item
              }
            }
          }
          let differences = item.differences
          this.setObjMap(differences, objMap, item)
        })
      }
    },
    handleExpandChange (row, expandedRows) {
      let isOpen = false
      for (let i = 0; i < expandedRows.length; i++) {
        if (row === expandedRows[i]) {
          isOpen = true
          break
        }
      }
      if (isOpen) {
      } else {

      }
    },
    showLeftScript (data) {
      if (data.strIndexArr) {
        let sqlContent = this.sqlContent
        // this.showScriptHightLight = true;
        // let tagStart = '<span class="hight-light-code">';
        // let tagEnd = '</span>';
        let tagStart = '<mark class="hl-dom hl-dom-scroll">'
        let tagEnd = '</mark>'
        // let hightLightScript = this.insertTag(sqlContent, tagStart, tagEnd, data.strIndexArr[0], data.strIndexArr[1]-0+1);
        let hightLightScript = this.insertTagArr(sqlContent, tagStart, tagEnd, data.strIndexArr)
        this.hightLightScript = ''
        this.hightLightScript = hightLightScript
        this.$emit('setNewSql', hightLightScript)
      } else {
        // this.$message.info('脚本中未找到相关信息');
      }
    },
    insertTagArr (str, start, end, indexArr) {
      indexArr = this.getIndexArr(indexArr)
      let result = ''
      let strArr = []
      let currentIndex = 0

      indexArr.forEach(item => {
        if (currentIndex < item[0]) {
          strArr.push(str.substring(currentIndex, item[0]))
        }
        strArr.push(start)
        currentIndex = item[0] > currentIndex ? item[0] : currentIndex
        strArr.push(str.substring(currentIndex, item[1] - 0 + 1))
        strArr.push(end)
        currentIndex = item[1] - 0 + 1
      })
      strArr.push(str.substring(currentIndex))
      let hightLightScript = strArr.join('')
      return hightLightScript
    },
    insertTag (str, start, end, startIndex, endIndex) {
      let front = str.substring(0, startIndex)
      let middle = str.substring(startIndex, endIndex)
      let endStr = str.substring(endIndex)
      let newstr = `${front}${start}${middle}${end}${endStr}`
      return newstr
    },
    insert_flg (str, flg, sn) {
      let front = str.substring(0, sn)
      let end = str.substring(sn)
      let newstr = `${front}${flg}${end}`
      return newstr
    },

    showReportDetail () {
      this.showTree = true
      this.createResizeOuter()
    },
    createResizeOuter () {
      let minWith = {
        leftMinWidth: '400px',
        rightMinWidth: '600px'
      }
      setTimeout(() => {
        let resizeOuter = new ResizeHorizontal($('.left-script-outer'), $('.report-script-right'), $('.report-script-middle'), $('.script-table-container'), '10px')
        // , this.resetTableStyle
      }, 1000)
    },
    resetTableStyle () {
      this.formatTooltip()
    },
    handleNodeClick (data) {
      this.showLeftScript(data)
    }
  },
  watch: {
    sqlContent (newVal) {
      this.formatTooltip()
    }
  }
}
</script>

<style lang="scss" scoped="scoped">
// @import '../../../assets/styles/const.scss';
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.sub-title {
    font-weight: bold;
    font-size:14px;
    margin-top:2em;
    margin-bottom:1em;
}
.model-com-detail {
  .script-table-container {
    // background-color: #eee;
    padding: 10px 0;
    position:relative;
    min-height:300px;
    min-width:700px;
    // max-width:1500px;
    max-width: none;
    // border: 1px solid red;

    $leftPer: 60%;
    $rightPer: 40%;
    $middleLeft: calc(60% - 10px);
    $middleRight: calc(40% + 10px);
    .left-script-outer, .report-script-middle, .report-script-right {
      @include absPos();
      // border: 1px solid red;
    }
    .left-script-outer {
      // right: auto;
      // width: calc($leftPer - 10px);
      // width: calc(60% - 5px);
      right: calc(40% + 5px);
      border: 1px solid #eee;
      // border: 1px solid red;
    }
    .report-script-right {
      // left: auto;
      // width: calc($leftPer - 10px);
      // width: calc(40% - 5px);
      left: calc(60% + 5px);
      border: 1px solid #eee;
      background-color: #fff;
      // border: 1px solid red;
      min-width: 400px;
      .tree-outer {
        @include absPos();
        // width: 100%;
        top: 40px;
        overflow: auto;
        // height: 100%;

      }
    }
    .report-script-middle {
      left: calc(60% - 5px);
      right: calc(40% - 5px);
      // border: 1px solid red;
      cursor: e-resize;
      width: 10px;
    }
  }
}
$tableRightWidth: 100px;
$tableLeftWidth: 100px;
  .table-header {
    position: relative;
    border-bottom: 1px solid #eee;
    font-weight: bold;
    height: 40px;
    .tree-item {
      margin-left: 10px;
      line-height: 36px;
      height: 100%;
    }
    // span:first-child {
    //   text-indent: 20px;
    // }
    // span.right, span.left {
    //   line-height: 36px;
    // }
  }
  .model-compare-detail {
    .part-title {
      font-size: 16px;
      font-weight: bold;
      line-height: 34px;
    }
    .gray-info {
      color: #aaa;
      margin-left: 5px;
    }
    .report-header-line {
      // border: 1px solid red;
      .btn-con {
        // display: inline-block;
        float: right;
        // border: 1px solid red;
        .el-button {}
      }
    }
  }
</style>
<style lang="scss">
$tableItemWidth: 130px;
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
// :root {
//   $colWith: 30%;
// }
  $colWith: 30%;
  .tree-item {
    position: relative;
    box-sizing: content-box;
    padding-right: 20px;

    // display: flex;
    // flex: 1;
    // align-items: center;
    // justify-content: space-between;
    .left, .right {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      min-height: 5px;
      // @include absPos();
    }
    span.left {
      text-align: left;
      width: $colWith;
      right: $colWith * 1.1;
      left: auto;
    }
    span.right {
      text-align: left;
      width: $colWith;
      left: auto;
    }
    .left, .right {
      min-height: 5px;
    }
    .span-with-tooltip.left, .span-with-tooltip.right {
      width: $colWith;
    }
  }

  $treeLineHeight: 40px;
  .model-compare-tree {
    .el-tree-node__expand-icon {
      position: relative;
      z-index: 1;
    }
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
  .left-script-tooltip {
    // border: 1px solid red;
    max-width: 500px;
  }
.script-outer {
  border: 1px solid #eee;
  background-color: #F5F2F0;
  padding: 20px;
  // margin-bottom: 20px;
  white-space: pre-wrap;
  .hight-light-code {
    color: #EF514D;
  }
}
.script-dialog-body {
  max-height: 500px;
  overflow: auto;
}
</style>
