<template>
  <div class="subtype-detail-wrapper">
    <div class="head-wrapper">
      <img :src="relationImg" alt="" />
      <p>子类编辑器</p>
    </div>
    <datablau-form
      style="margin-top: 20px;"
      label-width="77px">
      <el-form-item
        label="超类表：">
        {{tableData.properties.Name}}
      </el-form-item>
      <el-form-item
        label="类型：">
        <datablau-radio v-model="subtypeData.properties.SubtypeType">
          <el-radio v-for="item in subtypeType" :label="item.value" :key="item.value">{{item.label}}</el-radio>
        </datablau-radio>
      </el-form-item>
      <el-form-item
        label="分类字段：">
        <datablau-select
          v-model="subtypeData.properties.AttributeRef"
          clearable
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in columnArr"
            :key="item.properties.Id"
            :label="item.properties.LogicalName ? `${item.properties.LogicalName}（${item.properties.Name}）` : item.properties.Name"
            :value="item.properties.Id"
          ></el-option>
        </datablau-select>
      </el-form-item>
    </datablau-form>
    <div v-if="cellData.type === 'Subtype' && cellData.subtypeTopEdge">
      <div class="title" style="font-size: 14px;padding-top:20px;padding-bottom:10px">样式设置</div>
      <div class="style-box">
        <el-color-picker style="vertical-align: middle;margin-right:15px" show-alpha v-model="currentStyleRelatedShapeTemplate.StyleBackColor2" size="mini"></el-color-picker>
        <span class="label-disc middle-y">关系线颜色</span>
        <opacity-component style="margin-left: 5px;" class="middle-y" :rgba.sync="currentStyleRelatedShapeTemplate.StyleBackColor2"></opacity-component>
      </div>
      <datablau-button style="margin-top: 10px" @click="resetColor2" size="mini" type="primary">重置</datablau-button>
    </div>
    <div v-else-if="cellData.isSubType">
      <div class="title" style="font-size: 14px;padding-top:20px;padding-bottom:10px">样式设置</div>
      <div class="style-box">
        <el-color-picker style="vertical-align: middle;margin-right:15px" show-alpha v-model="currentStyleRelatedShapeTemplate.StyleBackColor" size="mini"></el-color-picker>
        <span class="label-disc middle-y">SubType背景色</span>
        <opacity-component style="margin-left: 5px;" class="middle-y" :rgba.sync="currentStyleRelatedShapeTemplate.StyleBackColor"></opacity-component>
      </div>
      <datablau-button style="margin-top: 10px;" @click="resetColor" size="mini" type="primary">重置</datablau-button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import opacityComponent from './opacityComponent.vue'
export default {
  data () {
    return {
      subtypeType: [{
        label: 'Exclusive',
        value: 'Exclusive'
      }, {
        label: 'Inclusive',
        value: 'Inclusive'
      }],
      relationImg: require('@/assets/images/mxgraphEdit/SubtypeActive.svg'),
      subtypeDataInital: {}
    }
  },
  components: {
    opacityComponent
  },
  mounted () {
    this.prepareData()
  },
  props: ['cellData', 'dataByType', 'getTableHTMLFunction', 'graph', 'deliverNum', 'LayerEdit', 'Changes', 'subtypeData', 'currentStyleRelatedShapeTemplate', 'currentId', 'formatThemeTemplateData'],
  computed: {
    tableData () {
      return this.dataByType.table[this.cellData.type === 'Subtype' && this.cellData.subtypeTopEdge ? this.cellData.target.ParentTableId : this.cellData.ParentTableId]
    },
    columnArr () {
      return this.tableData.children?.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.deleted)
    }
  },
  methods: {
    resetColor () {
      this.currentStyleRelatedShapeTemplate.StyleBackColor = null
    },
    resetColor2 () {
      this.currentStyleRelatedShapeTemplate.StyleBackColor2 = null
    },
    prepareData () {
      this.subtypeDataInital = _.cloneDeep(this.subtypeData)
    },
    save () {
      let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === this.cellData.Id)
      let changes = []
      if (this.cellData.isSubType) {
        let styleChanged = true
        if (this.cellData.isSubType ? this.formatThemeTemplateData(shape.properties).StyleBackColor === this.currentStyleRelatedShapeTemplate.StyleBackColor : this.formatThemeTemplateData(shape.properties).StyleBackColor2 === this.currentStyleRelatedShapeTemplate.StyleBackColor2) {
          // 未发生任何改变，不用存
          styleChanged = false
        } else {
          let change = new (this.Changes)('modifyShape', {
            id: shape.properties.Id,
            name: shape.properties.Name,
            pre: _.cloneDeep(shape),
            now: null
          })
          shape.properties = this.currentStyleRelatedShapeTemplate
          let arr = []
          if (shape.properties['StyleBackColor'] && shape.properties['StyleBackColor'].indexOf('rgba') !== -1) {
            arr = shape.properties['StyleBackColor'].split(',')
            shape.properties['StyleBackColor'] = `ARGBColor:${(parseFloat(arr[3].slice(1, -1)) * 255).toFixed(0)}:${arr[0].slice(5)}:${arr[1].slice(1)}:${arr[2].slice(1)}`
          }
          shape.properties.changed = true
          change.obj.now = _.cloneDeep(shape)
          changes.push(change)
          this.cellData.changed = true
          if (this.cellData.isSubType) {
            this.cellData.value = this.graph.drawSubTypeShape(shape, true)
            this.cellData.style = this.graph.drawSubTypeStyle(this.cellData)
          } else if (this.cellData.type === 'Subtype' && this.cellData.subtypeTopEdge) {
            this.cellData.style = this.graph.drawEdgeShapeStyle(this.cellData.Id)
          }
          this.graph.graph.refresh(this.cellData)
        }

        let subtypeChanged = false
        if (JSON.stringify(this.subtypeData.properties) !== JSON.stringify(this.subtypeDataInital.properties)) {
          this.subtypeData.properties.changed = true
          this.tableData.properties.changed = true
          let change = new (this.Changes)('modifySubtype', {
            pId: this.tableData.properties.Id,
            pName: this.tableData.properties.Name,
            name: this.subtypeData.properties.Name,
            pre: _.cloneDeep(this.subtypeDataInital),
            now: _.cloneDeep(this.subtypeData)
          })
          changes.push(change)
          subtypeChanged = true
        }

        if (!styleChanged && subtypeChanged) {
          if (this.cellData.isSubType) {
            this.cellData.value = this.graph.drawSubTypeShape(shape, true)
            this.cellData.style = this.graph.drawSubTypeStyle(this.cellData)
            this.graph.graph.refresh(this.cellData)
          }
        }
      } else if (this.cellData.type === 'Subtype' && this.cellData.subtypeTopEdge) {
        let styleChanged = true
        if (this.cellData.isSubType ? this.formatThemeTemplateData(shape.properties).StyleBackColor === this.currentStyleRelatedShapeTemplate.StyleBackColor : this.formatThemeTemplateData(shape.properties).StyleBackColor2 === this.currentStyleRelatedShapeTemplate.StyleBackColor2) {
          // 未发生任何改变，不用存
          styleChanged = false
        } else {
          let change = new (this.Changes)('modifyShape', {
            id: shape.properties.Id,
            name: shape.properties.Name,
            pre: _.cloneDeep(shape),
            now: null
          })
          shape.properties = this.currentStyleRelatedShapeTemplate
          let arr = []
          if (shape.properties['StyleBackColor2'] && shape.properties['StyleBackColor2'].indexOf('rgba') !== -1) {
            arr = shape.properties['StyleBackColor2'].split(',')
            shape.properties['StyleBackColor2'] = `ARGBColor:${(parseFloat(arr[3].slice(1, -1)) * 255).toFixed(0)}:${arr[0].slice(5)}:${arr[1].slice(1)}:${arr[2].slice(1)}`
          }
          shape.properties.changed = true
          change.obj.now = _.cloneDeep(shape)
          changes.push(change)
          this.cellData.changed = true
          if (this.cellData.isSubType) {
            this.cellData.value = this.graph.drawSubTypeShape(shape, true)
            this.cellData.style = this.graph.drawSubTypeStyle(this.cellData)
          } else if (this.cellData.type === 'Subtype' && this.cellData.subtypeTopEdge) {
            this.cellData.style = this.graph.drawEdgeShapeStyle(this.cellData.Id)
          }
          this.graph.graph.refresh(this.cellData)
        }

        let subtypeChanged = false
        if (JSON.stringify(this.subtypeData.properties) !== JSON.stringify(this.subtypeDataInital.properties)) {
          this.subtypeData.properties.changed = true
          this.tableData.properties.changed = true
          let change = new (this.Changes)('modifySubtype', {
            pId: this.tableData.properties.Id,
            pName: this.tableData.properties.Name,
            name: this.subtypeData.properties.Name,
            pre: _.cloneDeep(this.subtypeDataInital),
            now: _.cloneDeep(this.subtypeData)
          })
          changes.push(change)
          subtypeChanged = true
          let subtypeShape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === this.cellData.target.Id)
          this.cellData.target.value = this.graph.drawSubTypeShape(subtypeShape, true)
          this.cellData.target.style = this.graph.drawSubTypeStyle(this.cellData.target)
          this.graph.graph.refresh(this.cellData.target)
        }
      }
      if (!changes) {
        return false
      }
      if (changes.length > 0) {
        this.graph.editor.undoManager.undoableEditHappened((new (this.LayerEdit)(changes)))
      }
      return changes.length > 0
    }
  }
}
</script>

<style scoped lang="scss">
.head-wrapper {
  img {
    width: 20px;
    height: 20px
  }
  p {
    margin-left: 8px;
    display: inline-block;
    font-size: 14px;
    font-weight: bold;
    color: #555;
    line-height: 14px;
  }
}
/deep/ .el-form.db-form .el-form-item {
  margin-bottom: 0;
}
</style>
