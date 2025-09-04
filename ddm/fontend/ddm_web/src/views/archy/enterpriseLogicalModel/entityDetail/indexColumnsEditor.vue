<template>
  <div id="index-col-editor" :class="{'black-index-col-editor': themeBlack}">
<!--    <div class="sub-title">成员字段</div>-->
    <div class="left-table">
      <el-input
        size="mini"
        style="position:absolute;top:40px;left:10px;width:310px;z-index:9"
        v-model="keyword1"
        clearable
        placeholder="请输入关键词"
        @input="filterLeft"
        ></el-input>
      <el-table
        :data="leftDisplay"
        ref="leftTable"
        class="datablau-table thin"
        :height="400"
        @row-click="onLeftTableRowClick"
        @selection-change="handleLeftSelectionChange"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          type="selection"
          :selectable="leftTableSelectable"
        ></el-table-column>
        <el-table-column prop="properties.Name">
          <template slot="header">
            可选字段 <datablau-tips icon="icon-tips" style="margin-left:4px;display: inline-block;position: relative;top: 2px;" content="1. 被选中的字段仍保留在本列表，复选框呈不可选择状态<br>2. 找不到字段？刚刚新增的字段需要先保存到模型库才可以被选择"></datablau-tips>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="middle-button">
      <el-button
        v-show="addButtonEnable"
        type="primary"
        style="width:34px;height:34px;padding:0;margin-bottom:12px;"
        @click="moveToRight"
        class="el-icon-arrow-right"></el-button>
      <el-button
        v-show="!addButtonEnable"
        type="info"
        disabled
        style="width:34px;height:34px;padding:0;margin-bottom:12px;margin-left:0"
        class="el-icon-arrow-right"></el-button>
      <br>
      <el-button
        type="primary"
        style="width:34px;height:34px;padding:0;margin-bottom:12px;"
        v-show="removeButtonEnable"
        @click="moveToLeft"
        class="el-icon-arrow-left"></el-button>
      <el-button
        v-show="!removeButtonEnable"
        type="info"
        disabled
        style="width:34px;height:34px;padding:0;margin-bottom:12px;margin-left:0"
        class="el-icon-arrow-left"></el-button>
    </div>
    <div class="right-table">
      <el-input
        style="position:absolute;top:38px;left:8px;width:326px;z-index:9"
        placeholder="请输入关键词"
        size="mini"
        v-model="keyword2"
        clearable
        @input="filterRight">
      </el-input>
      <el-table
        :height="400"
        :data="rightDisplay"
        ref="rightTable"
        class="datablau-table thin"
        @row-click="onRightTableRowClick"
        @selection-change="handleRightSelectionChange"
      >
        <el-table-column type="selection" :selectable="rightTableSelectable"></el-table-column>
        <el-table-column label="成员字段" prop="properties.AttributeRef">
          <template slot-scope="scope">
            <datablau-tooltip  placement="top" :open-delay="200" effect="dark" :content="'由于SubType关系存在，该主键的相关成员不能删除'" :disabled="rightTableSelectable(scope.row)">
              <div>{{columnsMap.get(scope.row.properties.AttributeRef).Name}}</div>
            </datablau-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="排序类型" prop="properties.OrderType">
          <template slot-scope="scope">
            <el-select
              :key="selectKey"
              size="mini"
              v-model="scope.row.properties.OrderType"
              @change="updateRightData"
              :popper-class="themeBlack ? 'balck-el-select' : ''"
            >
              <el-option value="Ascending" key="A" label="Ascending"></el-option>
              <el-option value="Descending" key="D" label="Descending"></el-option>
              <el-option value="None" key="N" label="None"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="" width="50">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click.stop="up(scope.$index)" :disabled="scope.$index===0" class="fa fa-long-arrow-up"></el-button>
            <el-button type="text" size="mini" @click.stop="down(scope.$index)" :disabled="scope.$index===rightColumns.length-1" class="fa fa-long-arrow-down"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div slot="footer" style="text-align: right;">
      <!--<el-button
        @click="$emit('close')"
        size="mini">关闭</el-button>-->
      <datablau-button
        size="mini"
        type="primary"
        style="margin-top:10px;"
        @click="temporarySaveColumns"
        :themeBlack="themeBlack"
      >暂存</datablau-button>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
export default {
  data () {
    return {
      leftColumns: [],
      leftDisplay: [],
      rightColumns: [],
      rightDisplay: [],
      leftSelection: [],
      rightSelection: [],
      selectKey: 0,
      memberId: -10000000,
      keyword1: '',
      keyword2: ''
    }
  },
  props: ['dataCopied', 'columnsMap', 'deliverNum', 'disabledPk', 'themeBlack'],
  mounted () {
    this.$bus.$on('indexColumnsEditorGetMessage', data => {
      this.prepareColumns(data)
    })
    this.reload()
  },
  beforeDestroy () {
    this.$bus.$off('indexColumnsEditorGetMessage')
  },
  watch: {
    'dataCopied.columnsMsg': {
      handler () {
        this.leftColumns = this.dataCopied.columnsMsg
        this.leftDisplay = this.dataCopied.columnsMsg
      },
      deep: true
    }
  },
  methods: {
    rightTableSelectable (row) {
      if (this.disabledPk?.has(row.properties.AttributeRef)) {
        return false
      } else {
        return true
      }
    },
    filterLeft (val) {
      this.leftDisplay = _.cloneDeep(this.leftColumns.filter(v => v.properties.Name.indexOf(val) > -1))
    },
    filterRight (val) {
      this.rightDisplay = _.cloneDeep(this.rightColumns.filter(v => this.columnsMap.get(v.properties.AttributeRef).Name.indexOf(val) > -1))
    },
    tableRowClassName (scope) {
      if (scope.row.properties.deleted) {
        return 'hide-entity-row'
      } else {
        return ''
      }
    },
    reload () {
      this.leftColumns = this.dataCopied.columnsMsg
      this.leftDisplay = this.dataCopied.columnsMsg
    },
    prepareColumns (list) {
      list.forEach(item => {
        if (!item.properties.OrderType) {
          item.properties.OrderType = 'None'
        }
      })
      this.rightColumns = list
      this.keyword1 = ''
      this.keyword2 = ''
      this.filterLeft('')
      this.filterRight('')
      this.rightDisplay = list
    },
    updateRightData () {
      this.selectKey++
    },
    handleLeftSelectionChange (val) {
      this.leftSelection = val
    },
    handleRightSelectionChange (val) {
      this.rightSelection = val
    },
    onLeftTableRowClick (row) {
      if (this.leftTableSelectable(row)) {
        this.$refs.leftTable.toggleRowSelection(row)
      }
    },
    onRightTableRowClick (row) {
      if (this.rightTableSelectable(row)) {
        this.$refs.rightTable.toggleRowSelection(row)
      }
    },
    leftTableSelectable (row) {
      let id = row.properties.Id
      let bool = false
      this.rightColumns.forEach(item => {
        if (item.properties.AttributeRef === id) {
          bool = true
        }
      })
      return !bool
    },
    moveToRight () {
      this.leftSelection.forEach(item => {
        if (!item.properties.deleted) {
          this.rightColumns.push({
            properties: {
              AttributeRef: item.properties.Id,
              Id: this.deliverNum.seed++,
              OrderType: item.properties.OrderType ? item.properties.OrderType : 'None',
              UniqueId: uuidv4(),
              TypeId: 80500001,
              Name: item.properties.Name,
              new: true
            },
            objectClass: 'Datablau.LDM.EntityKeyGroupMember'
          })
        }
      })
      this.$refs.leftTable.clearSelection()
    },
    moveToLeft () {
      /*
      this.rightSelection.forEach(item => {
        this.leftColumns.push({
          properties: this.columnsMap.get(item.properties.AttributeRef)
        })
      })
      */
      const ids = this.rightSelection.map(item => item.properties.AttributeRef)
      for (let i = this.rightColumns.length - 1; i >= 0; i--) {
        if (ids.includes(this.rightColumns[i].properties.AttributeRef)) {
          this.rightColumns.splice(i, 1)
        }
      }
      this.$refs.rightTable.clearSelection()
    },
    temporarySaveColumns () {
      this.$emit('saveColumns', this.rightColumns)
      this.$emit('close')
    },
    up (index) {
      this.swap(index - 1, index)
    },
    down (index) {
      this.swap(index, index + 1)
    },
    swap (prev, next) {
      let temp = _.clone(this.rightColumns[prev])
      this.rightColumns[prev] = _.clone(this.rightColumns[next])
      this.$set(this.rightColumns, next, temp)
    }
  },
  computed: {
    addButtonEnable () {
      return this.leftSelection.length > 0
    },
    removeButtonEnable () {
      return this.rightSelection.length > 0
    }
  }
}
</script>
<style lang="scss" scoped>
  @import '@/views/list/_paneDetail.scss';
  /deep/ .hide-entity-row {
    display: none;
  }
  /deep/ .el-table {
    &:before {
      display: none;
    }
    .el-table__header-wrapper {
      padding-bottom: 46px;
    }
  }
  .left-table {
    position: relative;
    width:43%;
    height:400px;
    /*background:blue;*/
    outline:1px solid #EEE;
  }
  .middle-button {
    position:absolute;
    left:46.5%;
    width:30px;
    bottom:286px;
  }
  .right-table {
    position:absolute;
    bottom:50px;
    width:43%;
    /*background:pink;*/
    outline:1px solid #EEE;
    right:20px;
    height:400px;
  }
  .el-button--info {
    &.is-disabled {
      margin-left: 0px;
      background: #EFEFEF;
      border-color: #D2D2D2;
      color: #999999;
    }
  }
  .black-index-col-editor{
    /deep/ .el-table{
      background: #333333;
      th.el-table__cell{
        background-color: #222222;
        color: #bbbbbb;
        border-bottom: 1px solid #666666;
      }
      .el-table__header-wrapper{
        border-bottom: 1px solid #666666;
      }
      tr{
        background-color: #222222;
      }
      td.el-table__cell{
        color: #bbbbbb;
        border-bottom: 1px solid #666666;
      }
      .el-checkbox__inner{
        background-color: transparent;
        border: 1px solid #666666;
      }
    }
    .left-table{
      outline: 1px solid #666666;
    }
    .right-table{
      outline: 1px solid #666666;
    }
    /deep/ .el-input__inner{
      background-color: transparent;
      border-color: #4D4D4D;
      color: #c6c6c6;
    }
    /deep/ .el-checkbox__input.is-disabled .el-checkbox__inner{
      background-color: transparent;
      border-color: #666666;
    }
    /deep/  .el-button--info.is-disabled{
      background: rgba(77, 77, 77, 0.4) !important;
      border: 1px solid #4D4D4D !important;
    }
  }
</style>
<style lang="scss">
  .el-select-dropdown{
      &.balck-el-select{
        background-color: #2A2A2A;
        border: 1px solid #333333;
        .popper__arrow::after{
          border-bottom-color: #2A2A2A;
        }
        .popper__arrow{
          border-bottom-color: #333333;
        }
        .el-select-dropdown__item{
          color: #BBBBBB;
        }
        .el-select-dropdown__item.hover{
          background-color: rgba(24, 127, 255, .2);
        }
      }
  }
</style>
