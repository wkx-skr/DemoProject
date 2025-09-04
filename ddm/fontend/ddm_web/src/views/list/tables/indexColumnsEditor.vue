<template>
  <div>
<!--    <div class="sub-title">成员字段</div>-->
    <div class="left-table">
      <el-table
        :data="leftColumns"
        ref="leftTable"
        class="datablau-table thin"
        :height="221"
        @row-click="onLeftTableRowClick"
        @selection-change="handleLeftSelectionChange"
      >
        <el-table-column
          type="selection"
          :selectable="leftTableSelectable"
        ></el-table-column>
        <el-table-column prop="properties.Name">
          <template slot="header">
            {{$store.state.$v.dataEntity.cols}} <datablau-tooltip style="margin-left:4px;" :content="`${$store.state.$v.dataEntity.tip1}<br>${$store.state.$v.dataEntity.tip2}`"></datablau-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="middle-button">
      <el-button
        type="text"
        :disabled="!addButtonEnable"
        @click="moveToRight"
        class="el-icon-caret-right">{{$store.state.$v.dataEntity.add}}</el-button
      ><br>
      <el-button
        type="text"
        :disabled="!removeButtonEnable"
        @click="moveToLeft"
        class="el-icon-caret-left">{{$store.state.$v.dataEntity.delete}}</el-button>
    </div>
    <div class="right-table">
      <el-table
        :height="221"
        :data="rightColumns"
        ref="rightTable"
        class="datablau-table thin"
        @row-click="onRightTableRowClick"
        @selection-change="handleRightSelectionChange"
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$store.state.$v.dataEntity.memberCol" prop="properties.AttributeRef">
          <template slot-scope="scope">
            {{columnsMap.get(scope.row.properties.AttributeRef).Name}}
          </template>
        </el-table-column>
        <el-table-column  min-width="130" :label="$store.state.$v.dataEntity.sortType" prop="properties.OrderType">
          <template slot-scope="scope">
            <el-select
              :key="selectKey"
              size="mini"
              v-model="scope.row.properties.OrderType"
              @change="updateRightData"
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
    <el-button
      size="small"
      type="primary"
      style="margin-top:10px;"
      @click="temporarySaveColumns"
    >{{$store.state.$v.dataEntity.temporarySave}}</el-button>
  </div>
</template>
<script>
import _ from 'lodash'
import datablauTooltip from '@/components/common/tooltip.vue'
export default {
  data () {
    return {
      leftColumns: [],
      rightColumns: [],
      leftSelection: [],
      rightSelection: [],
      selectKey: 0
    }
  },
  components: {
    datablauTooltip
  },
  props: ['dataCopied', 'columnsMap'],
  mounted () {
    this.$bus.$on('indexColumnsEditorGetMessage', data => {
      this.prepareColumns(data)
    })
    this.reload()
  },
  beforeDestroy () {
    this.$bus.$off('indexColumnsEditorGetMessage')
  },
  methods: {
    reload () {
      this.leftColumns = this.dataCopied.columnsMsg
    },
    prepareColumns (list) {
      list.forEach(item => {
        if (!item.properties.OrderType) {
          item.properties.OrderType = 'Ascending'
        }
      })
      this.rightColumns = list
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
      this.$refs.rightTable.toggleRowSelection(row)
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
        this.rightColumns.push({
          properties: {
            AttributeRef: item.properties.Id
          }
        })
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
  @import '../paneDetail';
  .left-table {
    width:43%;
    height:220px;
    /*background:blue;*/
    outline:1px solid #EEE;
  }
  .middle-button {
    position:absolute;
    left:46.5%;
    width:30px;
    bottom:120px;
  }
  .right-table {
    position:absolute;
    bottom:50px;
    width:43%;
    /*background:pink;*/
    outline:1px solid #EEE;
    right:20px;
    height:220px;
  }
</style>
