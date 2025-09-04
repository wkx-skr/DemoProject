<template>
  <div class="connection-wrapper">
    <div class="connection-type">
      <img style="margin-right: 5px;vertical-align: middle;" :src="relationUsedImg" width="14" />
      <span style="font-size: 14px" class="title">关系</span>
      <datablau-radio class="content" v-model="edgeType" @change="changeEdgeType">
        <el-radio v-if="edgeType === 'SubtypeIdentifying'" :disabled="edgeType === 'SubtypeIdentifying'" label="SubtypeIdentifying">标识关系</el-radio>
        <el-radio v-else :disabled="edgeType !== 'RelationalIdentifying' && edgeType !== 'RelationalNonIdentifying'" label="RelationalIdentifying">标识关系</el-radio>
        <el-radio :disabled="(edgeType !== 'RelationalIdentifying' && edgeType !== 'RelationalNonIdentifying') || edgeType === 'SubtypeIdentifying'" label="RelationalNonIdentifying">非标识关系</el-radio>
        <el-radio v-if="isDesignModel" :disabled="edgeType !== 'ManyToManyManyToMany'" label="ManyToManyManyToMany">多对多</el-radio>
        <el-radio :disabled="edgeType !== 'VirtualNonIdentifying'" label="VirtualNonIdentifying">虚拟关系</el-radio>
        <el-radio v-if="!isDesignModel" :disabled="edgeType !== 'ViewNonIdentifying'" label="ViewNonIdentifying">视图关系</el-radio>
        <!--        <el-radio label="VirtualNonIdentifying">虚拟关系</el-radio>-->
      </datablau-radio>
    </div>
    <ul class="edge-set-item-list">
      <li>
        <span class="title">名称</span>
        <!-- <span v-if="!cellData.isCreated" class="content">{{cellData.OwneeRef === -1 ? '' : dataByType.relation[cellData.OwneeRef].properties.Name}}</span>
        <el-input size="mini" v-else class="content" v-model="cellData.name"></el-input> -->
        <datablau-input style="width: 210px" size="mini" class="content" v-model="dataByType.relation[cellData.OwneeRef].properties.Name"></datablau-input>
      </li>
      <li>
        <span class="title">基数关系</span>
        <datablau-select :disabled="edgeType === 'ManyToManyManyToMany'" @change="changeEndCardinalityType" style="width: 90px;margin-right:5px;display: inline-block;" class="content" size="small" v-model="cellData.endCardinalityType">
          <el-option :key="item.value" :value="item.value" :label="item.label" v-for="item in endCardinalityType"></el-option>
        </datablau-select>
        <span class="title" style="width:10px;margin-right:10px">值</span>
        <el-input-number :disabled="edgeType === 'ManyToManyManyToMany'" :min="0" size="mini" style="width: 95px;" @input="changeCardinalityValue"  v-model="cellData.CardinalityValue"></el-input-number>
      </li>
      <li>
        <span class="title">父表</span>
        <!--<span v-if="!cellData.isCreated" class="content">{{dataByType[cellData.source.isTable ? 'table' : 'view'][cellData.source.OwneeRef].properties.Name}}</span>
        <el-select v-else @change="changeParentTable" style="width: 100px;" class="content" size="small" v-model="cellData.source.OwneeRef">
          <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in Object.values(dataByType.table).filter(table => !table.properties.deleted)"></el-option>
        </el-select> -->
        <datablau-select disabled style="width: 210px;display: inline-block;" class="content" size="small" :value="cellData.source.ParentTableId || cellData.source.OwneeRef">
          <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in Object.values(dataByType[!this.dataByType.table[cellData.source.ParentTableId || cellData.source.OwneeRef] ? 'view' : 'table']).filter(table => !table.properties.deleted)"></el-option>
        </datablau-select>
      </li>
      <li>
        <span class="title">子表</span>
        <!-- <span v-if="!cellData.isCreated" class="content">{{dataByType[cellData.target.isTable ? 'table' : 'view'][cellData.target.OwneeRef].properties.Name}}</span>
          <el-select v-else @change="changeChildTable" style="width: 100px;" class="content" size="small" v-model="cellData.target.OwneeRef">
            <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in Object.values(dataByType.table).filter(table => !table.properties.deleted)"></el-option>
        </el-select> -->
        <datablau-select disabled style="width: 210px;display: inline-block;" class="content" size="small" v-model="cellData.target.OwneeRef">
          <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in Object.values(dataByType[this.edgeType === 'ViewNonIdentifying' || !this.dataByType.table[cellData.target.OwneeRef] ? 'view' : 'table']).filter(table => !table.properties.deleted)"></el-option>
        </datablau-select>
      </li>
      <li>
        <span class="title">父键</span>
        <datablau-select v-if="cellData.OwneeRef" :disabled="edgeType !== 'SubtypeIdentifying' && edgeType !== 'RelationalIdentifying' && edgeType !== 'RelationalNonIdentifying' && edgeType !== 'VirtualNonIdentifying'" style="width: 210px;display: inline-block;" class="content" size="small" @change="changeParentKeyRef" v-model="dataByType.relation[cellData.OwneeRef].properties.ParentKeyRefBak">
          <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in parentKeyRefSelectArr"></el-option>
        </datablau-select>
      </li>
      <li>
        <span class="title">子键</span>
        <datablau-select @change="changeChildKeyRef" v-if="cellData.OwneeRef" :disabled="edgeType !== 'VirtualNonIdentifying'" style="width: 210px;display: inline-block;" class="content" size="small" v-model="dataByType.relation[cellData.OwneeRef].properties.ChildKeyRefBak">
          <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in childKeyRefSelectArr"></el-option>
        </datablau-select>
      </li>
      <li>
        <span class="title">级联</span>
        <datablau-select :disabled="edgeType === 'ManyToManyManyToMany'" v-model="dataByType.relation[cellData.OwneeRef].properties.IsCascade" style="width: 210px;display: inline-block;" class="content" size="small">
          <el-option :value="undefined" label="---"></el-option>
          <el-option :value="true" label="是"></el-option>
          <el-option :value="false" label="否"></el-option>
        </datablau-select>
      </li>
    </ul>
    <datablau-table
      :svgSize="40"
      :key="tableKey"
      :header-row-class-name="edgeType === 'ViewNonIdentifying'?'disabled':''"
      class="table-class"
      :data="parentMemberList"
      stripe
      max-height="300px"
      style="width: 100%">
      <el-table-column
        label="父中文名">
        <template slot-scope="scope">
          <span>{{scope.row.properties.LogicalName}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="父字段">
        <template slot-scope="scope">
          <span>{{scope.row.properties.Name}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="子中文名">
        <template slot-scope="scope">
          <span>{{childMemberList[scope.$index].properties.LogicalName}}</span>
          <!--<span>{{dataByType[cellData.target.isTable ? 'table' : 'view'][cellData.target.OwneeRef].children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.deleted).find(column => column.properties.Reference === scope.row.properties.Id).properties.LogicalName}}</span>-->
        </template>
      </el-table-column>
      <el-table-column
        label="子字段">
        <template slot-scope="scope">
          <el-select :key="foreignKey.children.map(member => member.properties.Id).join(',') + scope.$index" :disabled="edgeType === 'ManyToManyManyToMany' || edgeType === 'VirtualNonIdentifying' || edgeType === 'ViewNonIdentifying' " @change="changeForeignKeyMemberShip" style="width: 120px" class="content" size="small" v-model="foreignKey.children[scope.$index].properties.AttributeRefBak">
            <!--          <el-select :disabled="edgeType === 'ManyToManyManyToMany'" @change="changeForeignKeyMemberShip" style="width: 200px" class="content" size="small" v-model="mapMember(scope.row.properties.Id).properties.AttributeRefBak">-->
            <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in dataByType[cellData.target.isTable ? 'table' : 'view'][cellData.target.OwneeRef].children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.deleted)"></el-option>
          </el-select>
        </template>
      </el-table-column>
    </datablau-table>
    <div>
      <div class="title" style="font-size: 14px;padding-top:20px;padding-bottom:10px">样式设置</div>
      <div class="style-box">
        <el-color-picker style="vertical-align: middle;margin-right:15px" show-alpha v-model="currentStyleRelatedShapeTemplate.StyleBackColor2" size="mini"></el-color-picker>
        <span class="label-disc middle-y">关系线颜色</span>
        <opacity-component class="middle-y" :rgba.sync="currentStyleRelatedShapeTemplate.StyleBackColor2"></opacity-component>
      </div>
      <datablau-button @click="resetColor" size="mini" type="primary">重置</datablau-button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import opacityComponent from './opacityComponent.vue'
import { v4 as uuidv4 } from 'uuid'

export default {
  components: { opacityComponent },
  props: ['endCardinalityType', 'cellData', 'dataByType', 'getTableHTMLFunction', 'graph', 'deliverNum', 'LayerEdit', 'Changes', 'pathIds', 'isCircle', 'createRelation', 'createDeepRelation', 'currentEdgeType', 'startIdToEndIds', 'calculateStartIdToEndIds', 'currentStyleRelatedShapeTemplate', 'formatThemeTemplateData', 'currentId', 'isLogicalModel', 'isDesignModel'],
  data () {
    let parentMemberList = []
    let childMemberList = []
    let foreignKey = {}
    let primaryKey = {}
    if (this.cellData.type === 'Relational' || this.cellData.type === 'View' || this.cellData.type === 'Subtype') { // 主键关系或者外键关系
      primaryKey = this.dataByType[this.cellData.source.isView ? 'view' : 'table'][this.cellData.source.ParentTableId || this.cellData.source.OwneeRef].children && this.dataByType[this.cellData.source.isView ? 'view' : 'table'][this.cellData.source.ParentTableId || this.cellData.source.OwneeRef].children.find(column => column.properties.Id === this.dataByType.relation[this.cellData.OwneeRef].properties.ParentKeyRef)
      this.processKeyGroupMemberOrder(primaryKey)
      parentMemberList = primaryKey && primaryKey.children && primaryKey.children.filter(member => !member.properties.deleted).map(member => {
        let column = this.dataByType[this.cellData.source.isView ? 'view' : 'table'][this.cellData.source.ParentTableId || this.cellData.source.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
        return column
      })
      let targetTable = this.dataByType[this.cellData.target.isView ? 'view' : 'table'][this.cellData.target.OwneeRef]
      foreignKey = targetTable.children && targetTable.children.find(column => column.properties.Id === this.dataByType.relation[this.cellData.OwneeRef].properties.ChildKeyRef)
      this.processKeyGroupMemberOrder(foreignKey)
      foreignKey?.children?.sort((member1, member2) => {
        let index1 = foreignKey.properties.KeyGroupMemberRefs?.findIndex(i => i === member1.properties.Id)
        let index2 = foreignKey.properties.KeyGroupMemberRefs?.findIndex(i => i === member2.properties.Id)
        return index1 - index2
      })
      childMemberList = foreignKey && foreignKey.children && foreignKey.children.filter(member => !member.properties.deleted).map(member => {
        member.properties.AttributeRefBak = member.properties.AttributeRef
        let column = this.dataByType[this.cellData.target.isView ? 'view' : 'table'][this.cellData.target.OwneeRef].children.find(column => !column.properties.deleted && column.properties.Id === member.properties.AttributeRef)
        return column
      })
    } else if (this.cellData.type === 'ManyToMany' || this.cellData.type === 'Virtual') {
      let relation = this.dataByType.relation[this.cellData.OwneeRef]
      let ParentKeyRefBak = relation.properties.ParentKeyRef
      let ParentEntityRef = relation.properties.ParentEntityRef
      let ChildKeyRefBak = relation.properties.ChildKeyRef
      let ChildEntityRef = relation.properties.ChildEntityRef
      let sourceTableKey = (this.dataByType.table[ParentEntityRef] || this.dataByType.view[ParentEntityRef])?.children?.find(column => column.properties.Id === ParentKeyRefBak)
      primaryKey = sourceTableKey
      this.processKeyGroupMemberOrder(primaryKey)
      parentMemberList = sourceTableKey?.children?.filter(member => !member.properties.deleted).map(member => {
        let column = this.dataByType[this.cellData.source.isView ? 'view' : 'table'][this.cellData.source.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
        return column
      })
      let targetTableKey = (this.dataByType.table[ChildEntityRef] || this.dataByType.view[ChildEntityRef])?.children?.find(column => column.properties.Id === ChildKeyRefBak)
      foreignKey = targetTableKey
      this.processKeyGroupMemberOrder(foreignKey)
      childMemberList = targetTableKey?.children?.filter(member => !member.properties.deleted).map(member => {
        member.properties.AttributeRefBak = member.properties.AttributeRef
        let column = this.dataByType[this.cellData.target.isView ? 'view' : 'table'][this.cellData.target.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
        return column
      }).filter(column => column)
      if (!childMemberList) {
        childMemberList = []
      }
      if (!foreignKey) {
        foreignKey = {
          children: []
        }
      } else if (!foreignKey.children) {
        foreignKey.children = []
      }
      let cha = parentMemberList?.length - childMemberList?.length
      if (cha > 0) {
        for (let i = 0; i < cha; i++) {
          childMemberList.push({
            children: [],
            objectClass: 'Datablau.LDM.EntityAttribute',
            properties: {}
          })
          foreignKey.children.push({
            children: [],
            objectClass: 'Datablau.LDM.EntityKeyGroupMember',
            properties: {}
          })
        }
      }
    }
    return {
      relationUsedImg: require('../../../../assets/images/mxgraphEdit/relation-used.svg'),
      parentMemberList: parentMemberList || [],
      childMemberList,
      foreignKey,
      primaryKey,
      edgeType: this.relation?.objectClass.slice(25) + this.relation?.properties.RelationalType,
      relation: {},
      changes: [],
      tableKey: 0,
      preName: this.dataByType.relation[this.cellData.OwneeRef].properties.Name,
      preIsCascade: this.dataByType.relation[this.cellData.OwneeRef].properties.IsCascade,
      ParentKeyRefBakPre: this.dataByType.relation[this.cellData.OwneeRef].properties.ParentKeyRef
    }
  },
  computed: {
    parentKeyRefSelectArr () {
      return (this.dataByType[this.cellData.source.isView ? 'view' : 'table'][this.cellData.source.ParentTableId || this.cellData.source.OwneeRef].children) && (this.dataByType[this.cellData.source.isView ? 'view' : 'table'][this.cellData.source.ParentTableId || this.cellData.source.OwneeRef].children.filter(column => ((this.cellData.type === 'Virtual' ? column.objectClass === 'Datablau.LDM.EntityKeyGroup' : this.cellData.type !== 'View' ? (column.properties.KeyGroupType === 'PrimaryKey' || column.properties.KeyGroupType === 'UniqueKey') : column.properties.KeyGroupType === 'VirtualKey') && !column.properties.deleted)))
    },
    childKeyRefSelectArr () {
      return (this.dataByType[this.cellData.target.isView ? 'view' : 'table'][this.cellData.target.OwneeRef].children) && (this.dataByType[this.cellData.target.isView ? 'view' : 'table'][this.cellData.target.OwneeRef].children.filter(column => (this.cellData.type === 'Virtual' ? (!column.properties.deleted && column.objectClass === 'Datablau.LDM.EntityKeyGroup') : this.cellData.type !== 'View' ? (!column.properties.deleted && (column.properties.KeyGroupType === 'ForeignKey' || column.properties.KeyGroupType === 'UniqueKey' || column.properties.KeyGroupType === 'PrimaryKey')) : (!column.properties.deleted && (column.properties.KeyGroupType === 'VirtualKey')))))
    }
  },
  mounted () {
    if (!this.cellData.isCreated) {
      this.relation = this.dataByType.relation[this.cellData.OwneeRef]
      if (this.parentKeyRefSelectArr.map(i => i.properties.Id).includes(this.relation.properties.ParentKeyRef)) {
        this.$set(this.relation.properties, 'ParentKeyRefBak', this.relation.properties.ParentKeyRef)
      } else {
        this.$set(this.relation.properties, 'ParentKeyRefBak', '')
      }
      if (this.childKeyRefSelectArr.map(i => i.properties.Id).includes(this.relation.properties.ChildKeyRef)) {
        this.$set(this.relation.properties, 'ChildKeyRefBak', this.relation.properties.ChildKeyRef)
      } else {
        this.$set(this.relation.properties, 'ChildKeyRefBak', '')
      }
    }
    this.fullfillCha()
  },
  watch: {
    relation: {
      handler (val) {
        // this.edgeType = (this.cellData.type && this.cellData.relationalType) ? this.cellData.type + this.cellData.relationalType : 'RelationalIdentifying'
        this.edgeType = this.relation?.objectClass.slice(25) + this.relation?.properties.RelationalType
      },
      deep: true
    },
    'relation.properties.ParentKeyRefBak': {
      handler (val, oldVal) {
        if (oldVal) {
          this.ParentKeyRefBakPre = oldVal
        }
      },
      deep: true
    }
  },
  methods: {
    processKeyGroupMemberOrder (key) {
      if (key?.properties?.KeyGroupMemberRefs?.length) {
        key.children.sort((member1, member2) => {
          return key.properties.KeyGroupMemberRefs.findIndex(m => m === member1.properties.Id) - key.properties.KeyGroupMemberRefs.findIndex(m => m === member2.properties.Id)
        })
      }
    },
    changeUpRelationType (targetTable, targetPrimaryKey, changes, targetPrimaryKeyPrevious) {
      let relations = Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && relation.properties.ChildEntityRef === targetTable.properties.Id && (relation.properties.RelationalType === 'Identifying' || relation.properties.RelationalType === 'NonIdentifying')) // 找到子表的主键关系和非主键关系
      if (targetPrimaryKeyPrevious) { // 仅修改主键的member对应的字段所关联的关系才修改
        let changeAttributeIds = []
        targetPrimaryKey.children?.forEach(member => {
          if (!targetPrimaryKeyPrevious.children?.map(mem => mem.properties.AttributeRef).includes(member.properties.AttributeRef)) {
            changeAttributeIds.push(member.properties.AttributeRef)
          }
        })
        targetPrimaryKeyPrevious.children?.forEach(member => {
          if (!(targetPrimaryKey.properties.deleted ? [] : targetPrimaryKey.children)?.map(mem => mem.properties.AttributeRef).includes(member.properties.AttributeRef)) {
            changeAttributeIds.push(member.properties.AttributeRef)
          }
        })
        relations = relations.filter(relation => {
          let foreignKey = targetTable.children?.find(column => column.properties.Id === relation.properties.ChildKeyRef)
          return foreignKey.children?.map(member => member.properties.AttributeRef).some(columnId => changeAttributeIds.includes(columnId))
        })
      }
      relations.forEach(relation => {
        let foreignKey = targetTable.children.find(keyGroup => keyGroup.properties.Id === relation.properties.ChildKeyRef)
        let foreignKeyMapColumns = foreignKey?.children?.map(member => member.properties.AttributeRef)
        let primaryKeyMapColumns = targetPrimaryKey.properties.deleted || !targetPrimaryKey?.children ? [] : targetPrimaryKey?.children.map(member => member.properties.AttributeRef)
        let changed = false
        let change = new (this.Changes)('modifyRelation', {
          name: relation.properties.Name,
          pre: _.cloneDeep(relation)
        })
        if (!foreignKeyMapColumns?.length) { // 子表foreignKey为空，不做任何改变
        } else if (foreignKeyMapColumns?.length && foreignKeyMapColumns?.every(columnId => primaryKeyMapColumns.includes(columnId))) { // 外键是主键子集，修改上游关系为主键关系
          if (relation.properties.RelationalType !== 'Identifying') {
            relation.properties.RelationalType = 'Identifying'
            relation.properties.StartCardinality = 'OneOnly'
            changed = true
          }
        } else { // 外键不是主键子集，修改上游关系为非主键关系
          if (relation.properties.RelationalType !== 'NonIdentifying') {
            relation.properties.RelationalType = 'NonIdentifying'
            relation.properties.StartCardinality = 'ZeroOrOne'
            changed = true
          }
        }
        if (changed) {
          relation.properties.changed = true
          change.obj.now = _.cloneDeep(relation)
          changes.push(change)
          let cellList = this.graph.graph.getDefaultParent().children
          let edge = cellList.find(cell => cell.OwneeRef === relation.properties.Id)
          edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
          edge.relationalType = relation.properties.RelationalType
          this.graph.graph.refresh(edge)
        }
      })
    },
    resetColor () {
      this.currentStyleRelatedShapeTemplate.StyleBackColor2 = null
    },
    changeChildTable (tableId) {
      if ((this.cellData.source.ParentTableId || this.cellData.source.OwneeRef) && this.cellData.target.OwneeRef) {
        this.addRelation()
      }
    },
    changeParentTable (tableId) {
      if ((this.cellData.source.ParentTableId || this.cellData.source.OwneeRef) && this.cellData.target.OwneeRef) {
        this.addRelation()
      }
    },
    mapMember (columnId) {
      let resultMember = this.foreignKey.children.filter(member => !member.properties.deleted).find(member1 => {
        return member1.properties.Reference === this.primaryKey.children.find(member => {
          return !member.properties.deleted && member.properties.AttributeRef === columnId
        }).properties.Id
      })
      if (resultMember) {
        return resultMember
      } else {
        return {
          properties: {}
        }
      }
    },
    async changeForeignKeyMemberShip (columnId) {
      let targetPrimaryKey = this.dataByType['table'][this.cellData.target.OwneeRef].children && (this.dataByType['table'][this.cellData.target.OwneeRef].children.find(column => column.properties.KeyGroupType === 'PrimaryKey' && !column.properties.deleted))
      let primaryKeyMember = targetPrimaryKey && targetPrimaryKey.children?.find(member => !member.properties.deleted && member.properties.AttributeRef === columnId)
      let foreignKeyMember = this.foreignKey.children && this.foreignKey.children.find(member => !member.properties.deleted && member.properties.AttributeRefBak === columnId && member.properties.AttributeRef !== columnId)
      if (this.edgeType === 'RelationalIdentifying' && targetPrimaryKey && !primaryKeyMember) { // 切换的子字段不是主键，需要转换关系为非主键关系
        this.edgeType = 'RelationalNonIdentifying'
        await this.changeOperate(foreignKeyMember)
        setTimeout(async () => {
          let targetTable = this.dataByType[this.cellData.target.isView ? 'view' : 'table'][this.cellData.target.OwneeRef]

          targetTable.properties.changed = true

          let mapColumn = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === foreignKeyMember.properties.AttributeRef)
          let mapColumnBak = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === columnId)
          let change = new (this.Changes)('modifyColumn', {
            pId: targetTable.properties.Id,
            pName: targetTable.properties.Name,
            name: mapColumn.properties.Name,
            pre: _.cloneDeep(mapColumn),
            now: null
          })

          mapColumn.properties.Reference = mapColumnBak.properties.Reference
          change.obj.now = _.cloneDeep(mapColumn)
          this.changes.push(change)

          change = new (this.Changes)('modifyIndex', {
            pId: targetTable.properties.Id,
            pName: targetTable.properties.Name,
            name: this.foreignKey.properties.Name,
            pre: _.cloneDeep(this.foreignKey),
            now: null
          })
          let foreignKeyMember1 = this.foreignKey.children && this.foreignKey.children.find(member => !member.properties.deleted && member.properties.AttributeRefBak === foreignKeyMember.properties.AttributeRef)
          foreignKeyMember1.properties.AttributeRef = foreignKeyMember.properties.AttributeRefBak
          foreignKeyMember1.properties.AttributeRefBak = foreignKeyMember.properties.AttributeRefBak
          let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.ChildEntityRef)
          if (cell.isTable) {
            cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          } else if (cell.isView) {
            cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          } else if (cell.isComment) {
            cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          } else if (cell.isFigure) {
            cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
            this.graph.graph.refresh(cell)
          }
          this.graph.graph.getView().refresh()
          change.obj.now = _.cloneDeep(this.foreignKey)
          targetTable.properties.changed = true
          this.foreignKey.properties.changed = true
          this.changes.push(change)
          this.tableKey++
        }, 100)
      } else { // 包括非标识关系切换字段，subtype切换字段，标识关系切换的字段为主键
        let targetTable = this.dataByType[this.cellData.target.isView ? 'view' : 'table'][this.cellData.target.OwneeRef]

        targetTable.properties.changed = true

        let mapColumn = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === foreignKeyMember.properties.AttributeRef)
        let mapColumnBak = targetTable.children.find(column => !column.properties.deleted && column.properties.Id === columnId)
        let change = new (this.Changes)('modifyColumn', {
          pId: targetTable.properties.Id,
          pName: targetTable.properties.Name,
          name: mapColumn.properties.Name,
          pre: _.cloneDeep(mapColumn),
          now: null
        })

        mapColumn.properties.Reference = mapColumnBak.properties.Reference
        change.obj.now = _.cloneDeep(mapColumn)
        this.changes.push(change)

        change = new (this.Changes)('modifyIndex', {
          pId: targetTable.properties.Id,
          pName: targetTable.properties.Name,
          name: this.foreignKey.properties.Name,
          pre: _.cloneDeep(this.foreignKey),
          now: null
        })
        foreignKeyMember.properties.AttributeRef = foreignKeyMember.properties.AttributeRefBak
        change.obj.now = _.cloneDeep(this.foreignKey)
        targetTable.properties.changed = true
        this.foreignKey.properties.changed = true
        this.changes.push(change)

        if (this.edgeType === 'SubtypeIdentifying' && targetPrimaryKey && !primaryKeyMember) { // subtype关系切字段，如果该字段不是主键，需加入主键member
          let change = new (this.Changes)('modifyIndex', {
            pId: targetTable.properties.Id,
            pName: targetTable.properties.Name,
            name: targetPrimaryKey.properties.Name,
            pre: _.cloneDeep(targetPrimaryKey),
            now: null
          })
          targetPrimaryKey.properties.changed = true
          if (!targetPrimaryKey.children) {
            targetPrimaryKey.children = []
          }
          targetPrimaryKey.children.push({
            objectClass: 'Datablau.LDM.EntityKeyGroupMember',
            properties: {
              AttributeRef: mapColumnBak.properties.Id,
              Id: this.deliverNum.seed++,
              OrderType: 'Ascending',
              UniqueId: uuidv4(),
              TypeId: 80500001,
              Name: mapColumnBak.properties.Name,
              new: true
            }
          })
          targetPrimaryKey.properties.KeyGroupMemberRefs = targetPrimaryKey.children.map(column => column.properties.Id)
          change.obj.now = _.cloneDeep(targetPrimaryKey)
          this.changes.push(change)
        }

        this.changeUpRelationType(targetTable, targetPrimaryKey, this.changes)
        let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.ChildEntityRef)
        if (cell.isTable) {
          cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        } else if (cell.isView) {
          cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        } else if (cell.isComment) {
          cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        } else if (cell.isFigure) {
          cell.style = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
          this.graph.graph.refresh(cell)
        }
        this.graph.graph.getView().refresh()
        this.tableKey++
      }
    },
    changeChildKeyRef () {
      setTimeout(() => { // 加setTimeout，为了this.ParentKeyRefBakPre已改变
        this.changeOperate()
        this.fullfillCha()
      })
    },
    changeParentKeyRef () {
      setTimeout(() => {
        this.changeOperate()
        this.fullfillCha()
      })
    },
    fullfillCha () {
      if (!this.childMemberList) {
        this.childMemberList = []
      }
      if (!this.foreignKey) {
        this.foreignKey = {
          children: []
        }
      } else if (!this.foreignKey.children) {
        this.foreignKey.children = []
      }
      let cha = this.parentMemberList?.length - this.childMemberList?.length
      if (cha > 0) {
        for (let i = 0; i < cha; i++) {
          this.childMemberList.push({
            children: [],
            objectClass: 'Datablau.LDM.EntityAttribute',
            properties: {}
          })
          this.foreignKey.children.push({
            children: [],
            objectClass: 'Datablau.LDM.EntityKeyGroupMember',
            properties: {}
          })
        }
      }
    },
    changeEdgeType () {
      this.changeOperate(null, true)
    },
    changeCardinalityValue (val) {
      if (!val || !this.relation.properties) {
        return
      }
      this.$set(this.cellData, 'endCardinalityType', undefined)
      this.$set(this.cellData, 'CardinalityValue', val)
      let change = new (this.Changes)('modifyRelation', {
        name: this.relation.properties.Name,
        pre: _.cloneDeep(this.relation)
      })
      this.relation.properties.EndCardinality = this.cellData.endCardinalityType
      this.relation.properties.CardinalityValue = this.cellData.CardinalityValue
      this.relation.properties.changed = true
      let edge = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.Id)
      edge.endCardinalityType = this.cellData.endCardinalityType
      edge.CardinalityValue = this.cellData.CardinalityValue
      edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
      this.graph.graph.refresh(edge)
      change.obj.now = _.cloneDeep(this.relation)
      this.changes.push(change)
      this.$forceUpdate()
    },
    changeEndCardinalityType (val) {
      if (!val || !this.relation.properties) {
        return
      }
      this.$set(this.cellData, 'endCardinalityType', val)
      this.$set(this.cellData, 'CardinalityValue', undefined)
      let change = new (this.Changes)('modifyRelation', {
        name: this.relation.properties.Name,
        pre: _.cloneDeep(this.relation)
      })
      this.relation.properties.EndCardinality = this.cellData.endCardinalityType
      this.relation.properties.CardinalityValue = this.cellData.CardinalityValue
      this.relation.properties.changed = true
      let edge = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.Id)
      edge.endCardinalityType = this.cellData.endCardinalityType
      edge.CardinalityValue = this.cellData.CardinalityValue
      edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
      this.graph.graph.refresh(edge)
      change.obj.now = _.cloneDeep(this.relation)
      this.changes.push(change)
      this.$forceUpdate()
    },
    save () {
      let shape = this.dataByType.diagram[this.currentId].children.find(shape => shape.properties.Id === this.cellData.Id)
      let styleChanged = true
      if (this.formatThemeTemplateData(shape.properties).StyleBackColor2 === this.currentStyleRelatedShapeTemplate.StyleBackColor2) {
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
        this.changes.push(change)
        let edge = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.Id)
        edge.changed = true
        edge.endCardinalityType = this.cellData.endCardinalityType
        edge.CardinalityValue = this.cellData.CardinalityValue
        edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
        this.graph.graph.refresh(edge)
      }

      if (this.dataByType.relation[this.cellData.OwneeRef].properties.IsCascade !== this.preIsCascade || this.dataByType.relation[this.cellData.OwneeRef].properties.Name !== this.preName) {
        let now = _.cloneDeep(this.dataByType.relation[this.cellData.OwneeRef])
        let pre = _.cloneDeep(this.dataByType.relation[this.cellData.OwneeRef])
        Object.assign(pre.properties, {
          Name: this.preName,
          IsCascade: this.preIsCascade
        })
        this.dataByType.relation[this.cellData.OwneeRef].properties.changed = true
        let change = new (this.Changes)('modifyRelation', {
          name: this.relation.properties.Name,
          pre,
          now
        })
        this.changes.push(change)
      }

      if (!this.changes) {
        return false
      }
      if (this.changes.length > 0) {
        this.graph.editor.undoManager.undoableEditHappened((new (this.LayerEdit)(this.changes)))
      }
      return this.changes.length > 0
    },
    async deleteOrAddPrimaryKeyMemberInForeignKey (targetTable, relation, changes) {
      let targetPrimaryKey = targetTable.children.find(column => !column.properties.deleted && column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.KeyGroupType === 'PrimaryKey')
      let targetForeignKey = targetTable.children.find(column => !column.properties.deleted && column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === relation.properties.ChildKeyRef)
      if (this.relation.properties.RelationalType === 'Identifying') { // 准备切换为非主键关系
        let change = new (this.Changes)('modifyIndex', {
          pId: targetTable.properties.Id,
          pName: targetTable.properties.Name,
          name: targetPrimaryKey.properties.Name,
          pre: _.cloneDeep(targetPrimaryKey),
          now: null
        })
        let targetPrimaryKeyMemberIdsFilter = targetForeignKey?.children?.map(member => member.properties.AttributeRef).map(columnId => {
          let targetPrimaryKeyMember = targetPrimaryKey?.children?.find(member => member.properties.AttributeRef === columnId)
          return targetPrimaryKeyMember
        }).filter(member => member).map(member => member.properties.Id)
        targetPrimaryKey.children = targetPrimaryKey.children?.filter(member => !targetPrimaryKeyMemberIdsFilter.includes(member.properties.Id))
        targetPrimaryKey.properties.KeyGroupMemberRefs = targetPrimaryKey.children?.filter(member => !member.properties.deleted).map(member => member.properties.Id)
        targetPrimaryKey.properties.changed = true
        change.obj.now = _.cloneDeep(targetPrimaryKey)
        changes.push(change)
        let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === targetTable.properties.Id)
        if (cell) {
          cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          cell.changed = true
          this.graph.graph.getView().refresh()
        }
      } else if (this.relation.properties.RelationalType === 'NonIdentifying') { // 准备切换为主键关系
        if (!targetPrimaryKey) { // 没有主键，创建主键
          let keyId = 1
          let index = targetTable.children.filter(i => i.objectClass === 'Datablau.LDM.EntityKeyGroup')
          if (index && index.length) {
            let name = index[index.length - 1].properties.Name
            keyId = parseInt(name.slice(name.search(/\d+$/)))
          }
          targetPrimaryKey = {
            children: [],
            objectClass: 'Datablau.LDM.EntityKeyGroup',
            properties: {
              Id: this.deliverNum.seed++,
              KeyGroupMemberRefs: [],
              KeyGroupType: 'PrimaryKey',
              Macro: this.dataByType.namingOption.PKDefaultMacro,
              Name: this.dataByType.namingOption.PKDefaultMacro.replace(/%owner%/, targetTable.properties.Name).replace(/%keyid%/, '' + (keyId++)),
              RawType: 'KeyGroup',
              TypeId: 80000093,
              UniqueId: uuidv4(),
              new: true
            }
          }
          targetTable.children.push(targetPrimaryKey)
          changes.push(new (this.Changes)('insertIndex', {
            pId: targetTable.properties.Id,
            pName: targetTable.properties.Name,
            name: targetPrimaryKey.properties.Name,
            now: _.cloneDeep(targetPrimaryKey)
          }))
        }
        let change = new (this.Changes)('modifyIndex', {
          pId: targetTable.properties.Id,
          pName: targetTable.properties.Name,
          name: targetPrimaryKey.properties.Name,
          pre: _.cloneDeep(targetPrimaryKey),
          now: null
        })
        let targetColumnIdsMap = targetPrimaryKey?.children?.map(member => member.properties.AttributeRef)
        let targetPrimaryKeyMemberColumnIdsAdd = targetForeignKey?.children?.map(member => member.properties.AttributeRef).filter(columnId => !targetColumnIdsMap?.includes(columnId))
        if (targetPrimaryKey.children) {
          targetPrimaryKey.children = targetPrimaryKey.children.concat(targetPrimaryKeyMemberColumnIdsAdd.map(columnId => {
            let column = targetTable?.children?.find(column => !column.properties.deleted && column.properties.Id === columnId)
            return {
              'properties': {
                'TypeId': 80500001,
                'OrderType': 'Ascending',
                'AttributeRef': columnId,
                'Id': this.deliverNum.seed++,
                'RawType': 'KeyGroupMember',
                'Name': column.properties.Name,
                UniqueId: uuidv4(),
                new: true
              },
              'objectClass': 'Datablau.LDM.EntityKeyGroupMember'
            }
          }))
        } else {
          targetPrimaryKey.children = targetPrimaryKeyMemberColumnIdsAdd.map(columnId => {
            let column = targetTable?.children?.find(column => !column.properties.deleted && column.properties.Id === columnId)
            return {
              'properties': {
                'TypeId': 80500001,
                'OrderType': 'Ascending',
                'AttributeRef': columnId,
                'Id': this.deliverNum.seed++,
                'RawType': 'KeyGroupMember',
                'Name': column.properties.Name,
                UniqueId: uuidv4(),
                new: true
              },
              'objectClass': 'Datablau.LDM.EntityKeyGroupMember'
            }
          })
        }
        targetPrimaryKey.properties.KeyGroupMemberRefs = targetPrimaryKey.children.filter(member => !member.properties.deleted).map(member => member.properties.Id)
        targetPrimaryKey.properties.changed = true
        change.obj.now = _.cloneDeep(targetPrimaryKey)
        changes.push(change)
        let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === targetTable.properties.Id)
        if (cell) {
          cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          cell.changed = true
          this.graph.graph.getView().refresh()
        }
      }
    },
    async changeOperate (foreignKeyMember, noOpenCreateColumnModal = false) { // foreignKeyMember主要用于切换子字段不是主键时，需要保留其中某个主键索引member noOpenCreateColumnModal = false 默认弹窗
      let sourceTable = this.dataByType[this.cellData.source.isView ? 'view' : 'table'][this.relation.properties.ParentEntityRef]
      let targetTable = this.dataByType[this.cellData.target.isView ? 'view' : 'table'][this.relation.properties.ChildEntityRef]
      let targetTableCopy = _.cloneDeep(targetTable)
      let targetPrimaryKey = targetTable.children.find(column => !column.properties.deleted && column.properties.KeyGroupType === 'PrimaryKey')
      let sourcePrimaryKey = sourceTable.children.find(column => column.properties.Id === this.relation.properties.ParentKeyRefBak)
      let sourcePrimaryKeyPrevious = this.ParentKeyRefBakPre && sourceTable.children.find(column => column.properties.Id === this.ParentKeyRefBakPre)
      let targetForeignKey = targetTable.children.find(column => column.properties.KeyGroupType === 'ForeignKey' && column.properties.Id === this.relation.properties.ChildKeyRef && !column.properties.deleted)
      if (this.edgeType === 'RelationalIdentifying' || this.edgeType === 'SubtypeIdentifying') { // 切换为主键关系或subtype关系
        let cellList = this.graph.graph.getDefaultParent().children
        let source = cellList.find(cell => cell.OwneeRef === this.relation.properties.ParentEntityRef)
        let target = cellList.find(cell => cell.OwneeRef === this.relation.properties.ChildEntityRef)
        this.$bus.$emit('clearPathIds')
        if (this.isCircle(sourceTable, targetTable)) {
          try {
            // await this.$confirm(`创建当前一对一的关系会引起非法的环状数据关联，是否转换成一对多的关系？`, '提示', {
            //   type: 'warning',
            //   confirmButtonText: '是',
            //   cancelButtonText: ' 否 ',
            //   showClose: false,
            //   closeOnClickModal: false
            // })
            // if (noOpenCreateColumnModal) {
            //   await this.createRelation(source, target, 'RelationalNonIdentifying', this.changes, this.relation, sourcePrimaryKey, sourcePrimaryKeyPrevious, true)
            // } else {
            //   await this.createRelation(source, target, 'RelationalNonIdentifying', this.changes, this.relation, sourcePrimaryKey)
            // }
            this.edgeType = 'RelationalNonIdentifying'
            this.$datablauMessage.error('创建当前一对一的关系会引起非法的环状数据关联')
            return
          } catch (e) {
            console.log(e)
            return
          }
        }
        let change = new (this.Changes)('modifyRelation', {
          name: this.relation.properties.Name,
          pre: _.cloneDeep(this.relation)
        })
        try {
          if (foreignKeyMember) {
            // 为子字段切换不从源表传递
          } else if (noOpenCreateColumnModal) {
            await this.deleteOrAddPrimaryKeyMemberInForeignKey(targetTable, this.relation, this.changes)
          } else {
            await this.createRelation(source, target, 'RelationalIdentifying', this.changes, this.relation, sourcePrimaryKey, sourcePrimaryKeyPrevious, true)
          }
          let endIds = this.startIdToEndIds[target.OwneeRef]
          await this.createDeepRelation(endIds, target, this.changes, targetTableCopy, true)
        } catch (e) {
          console.log(e)
        }
        this.relation.properties.ParentKeyRef = this.relation.properties.ParentKeyRefBak
        this.relation.properties.changed = true
        this.cellData.relationalType = 'Identifying'
        let edge = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.Id)
        edge.relationalType = this.cellData.relationalType
        this.relation.properties.RelationalType = 'Identifying'
        this.relation.properties.StartCardinality = 'OneOnly'
        // if (this.relation.properties.EndCardinality !== this.cellData.endCardinalityType) {
        this.relation.properties.EndCardinality = this.cellData.endCardinalityType
        this.relation.properties.CardinalityValue = this.cellData.CardinalityValue
        // let edge = cellList.find(cell => cell.OwneeRef === this.relation.properties.Id)
        edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
        this.graph.graph.refresh(edge)
        // }
        change.obj.now = _.cloneDeep(this.relation)
        this.changes.push(change)
        targetPrimaryKey = targetTable.children.find(column => !column.properties.deleted && column.properties.KeyGroupType === 'PrimaryKey')
        this.changeUpRelationType(targetTable, targetPrimaryKey, this.changes)
      } else if (this.edgeType === 'RelationalNonIdentifying') { // 切换为外键关系
        // 修改子表主键索引
        // if (targetForeignKey.children) {
        //   targetForeignKey.children.forEach(member => this.$set(member.properties, 'deleted', true))
        // }
        // this.$set(targetForeignKey.properties, 'deleted', true)
        //
        // let change = new (this.Changes)('deleteIndex', {
        //   pId: targetTable.properties.Id,
        //   pName: targetTable.properties.Name,
        //   name: targetForeignKey.properties.Name,
        //   id: targetForeignKey.properties.Id
        // })
        // this.changes.push(change)
        debugger
        let targetPrimaryKeyCopy = _.cloneDeep(targetPrimaryKey)
        let change = null
        if (targetPrimaryKeyCopy) {
          change = new (this.Changes)('modifyIndex', {
            pId: targetTable.properties.Id,
            pName: targetTable.properties.Name,
            name: targetPrimaryKey.properties.Name,
            pre: _.cloneDeep(targetPrimaryKey),
            now: null
          })

          sourcePrimaryKey.children?.forEach(sourcePrimaryKeyMember => {
            if (sourcePrimaryKeyMember.properties.deleted) {
              return
            }
            // let mapTargetColumn = targetTable.children.find(column => column.properties.Reference === sourcePrimaryKeyMember.properties.AttributeRef)
            let columnId = targetTable.children.find(column => column.properties.Id === this.relation?.properties.ChildKeyRef).children?.find(member => member.properties.Reference === sourcePrimaryKeyMember.properties.Id)?.properties?.AttributeRef
            let mapTargetColumn = targetTable.children.find(column => column.properties.Id === columnId)
            if (!mapTargetColumn) {
              return
            }
            if (foreignKeyMember && mapTargetColumn.properties.Id === foreignKeyMember.properties.AttributeRef) {
              return
            }
            if (!targetPrimaryKey.properties.KeyGroupMemberRefs) {
              return
            }
            // let targetPrimaryMemberList = targetPrimaryKey.properties.KeyGroupMemberRefs.map(memberRef => targetPrimaryKey.children.find(member3 => member3.properties.Id === memberRef))
            // let resultMember = targetPrimaryMemberList.find(mebmer4 => mebmer4.properties.AttributeRef === mapTargetColumn.properties.Id)
            let resultMemberIndex = targetPrimaryKey.children.findIndex(mebmer4 => mebmer4.properties.AttributeRef === mapTargetColumn.properties.Id)
            let resultMember = targetPrimaryKey.children[resultMemberIndex]
            if (resultMember) { // 主键有此member删除
              // this.$set(resultMember.properties, 'deleted', true)
              // resultMember.properties.hasDeleted = true
              targetPrimaryKey.children.splice(resultMemberIndex, 1)
              targetPrimaryKey.properties.KeyGroupMemberRefs.splice(targetPrimaryKey.properties.KeyGroupMemberRefs.findIndex(item => item === resultMember.properties.Id), 1)
            }
            // } else {
            //   resultMember.properties.hasDeleted = false
            // }
          })

          change.obj.now = _.cloneDeep(targetPrimaryKey)
          this.changes.push(change)
        }
        if (foreignKeyMember) { // 切换子字段修改member的AttributeRef
          change = new (this.Changes)('modifyIndex', {
            pId: targetTable.properties.Id,
            pName: targetTable.properties.Name,
            name: targetForeignKey.properties.Name,
            pre: _.cloneDeep(targetForeignKey),
            now: null
          })
          foreignKeyMember.properties.AttributeRef = foreignKeyMember.properties.AttributeRefBak
          change.obj.now = _.cloneDeep(targetForeignKey)
          this.changes.push(change)
        }
        let cellList = this.graph.graph.getDefaultParent().children
        let source = cellList.find(cell => cell.OwneeRef === this.relation.properties.ParentEntityRef)
        let target = cellList.find(cell => cell.OwneeRef === this.relation.properties.ChildEntityRef)
        change = new (this.Changes)('modifyRelation', {
          name: this.relation.properties.Name,
          pre: _.cloneDeep(this.relation)
        })
        this.$bus.$emit('clearPathIds')
        try {
          if (foreignKeyMember) {
            // 为子字段切换不从源表传递
          } else if (noOpenCreateColumnModal) {
            // await this.createRelation(source, target, 'RelationalNonIdentifying', this.changes, this.relation, sourcePrimaryKey, sourcePrimaryKey, true) // 不弹创建字段提示框
            await this.deleteOrAddPrimaryKeyMemberInForeignKey(targetTable, this.relation, this.changes)
          } else {
            await this.createRelation(source, target, 'RelationalNonIdentifying', this.changes, this.relation, sourcePrimaryKey, sourcePrimaryKeyPrevious, true) // 弹创建字段提示框
          }
          // let endIds = this.startIdToEndIds[target.OwneeRef]
          // if (endIds) {
          //   this.$bus.$emit('changeCurrentEdgeType', 'RelationalIdentifying')
          //   await this.createDeepRelation(endIds, target, this.currentEdgeType, this.changes)
          // }
          this.calculateStartIdToEndIds()
          setTimeout(async () => {
            let endIds = this.startIdToEndIds[target.OwneeRef]
            await this.createDeepRelation(endIds, target, this.changes, targetTableCopy, true)
          })
        } catch (e) {
          console.log(e)
        }
        this.relation.properties.ParentKeyRef = this.relation.properties.ParentKeyRefBak
        this.relation.properties.changed = true
        this.cellData.relationalType = 'NonIdentifying'
        let edge = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.Id)
        edge.relationalType = this.cellData.relationalType
        this.relation.properties.RelationalType = 'NonIdentifying'
        this.relation.properties.StartCardinality = 'ZeroOrOne'
        // if (this.relation.properties.EndCardinality !== this.cellData.endCardinalityType) {
        this.relation.properties.EndCardinality = this.cellData.endCardinalityType
        // let edge = cellList.find(cell => cell.OwneeRef === this.relation.properties.Id)
        edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
        this.graph.graph.refresh(edge)
        // }
        change.obj.now = _.cloneDeep(this.relation)
        this.changes.push(change)
        this.changeUpRelationType(targetTable, targetPrimaryKey, this.changes)
      } else if (this.edgeType === 'ManyToManyManyToMany' || this.edgeType === 'VirtualNonIdentifying') {
        let change = new (this.Changes)('modifyRelation', {
          name: this.relation.properties.Name,
          pre: _.cloneDeep(this.relation)
        })
        this.relation.properties.ParentKeyRef = this.relation.properties.ParentKeyRefBak
        this.relation.properties.ChildKeyRef = this.relation.properties.ChildKeyRefBak
        this.relation.properties.changed = true
        let edge = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.Id)
        edge.relationalType = this.cellData.relationalType
        // if (this.relation.properties.EndCardinality !== this.cellData.endCardinalityType) {
        this.relation.properties.EndCardinality = this.cellData.endCardinalityType
        // let edge = cellList.find(cell => cell.OwneeRef === this.relation.properties.Id)
        edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
        this.graph.graph.refresh(edge)
        // }
        change.obj.now = _.cloneDeep(this.relation)
        this.changes.push(change)
      }
      console.log(this.cellData)
      if (this.cellData.type === 'Relational' || this.cellData.type === 'View' || this.cellData.type === 'Subtype') { // 主键关系或者外键关系或者subtype关系和视图关系
        this.primaryKey = this.dataByType[this.cellData.source.isView ? 'view' : 'table'][this.cellData.source.ParentTableId || this.cellData.source.OwneeRef].children && this.dataByType[this.cellData.source.isView ? 'view' : 'table'][this.cellData.source.ParentTableId || this.cellData.source.OwneeRef].children.find(column => column.properties.Id === this.dataByType.relation[this.cellData.OwneeRef].properties.ParentKeyRef)
        this.parentMemberList = this.primaryKey.children?.filter(member => !member.properties.deleted).map(member => {
          let column = this.dataByType[this.cellData.source.isView ? 'view' : 'table'][this.cellData.source.ParentTableId || this.cellData.source.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
          return column
        }) || []
        this.foreignKey = this.dataByType[this.cellData.target.isView ? 'view' : 'table'][this.cellData.target.OwneeRef].children.find(column => column.properties.Id === this.dataByType.relation[this.cellData.OwneeRef].properties.ChildKeyRef)
        this.childMemberList = this.foreignKey.children && this.foreignKey.children.filter(member => !member.properties.deleted).map(member => {
          member.properties.AttributeRefBak = member.properties.AttributeRef
          let column = this.dataByType[this.cellData.target.isView ? 'view' : 'table'][this.cellData.target.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
          return column
        })
      } else if (this.cellData.type === 'ManyToMany' || this.cellData.type === 'Virtual') {
        let relation = this.dataByType.relation[this.cellData.OwneeRef]
        let ParentKeyRefBak = relation.properties.ParentKeyRefBak
        let ParentEntityRef = relation.properties.ParentEntityRef
        let ChildKeyRefBak = relation.properties.ChildKeyRefBak
        let ChildEntityRef = relation.properties.ChildEntityRef
        let sourceTableKey = (this.dataByType.table[ParentEntityRef] || this.dataByType.view[ParentEntityRef])?.children?.find(column => column.properties.Id === ParentKeyRefBak)
        this.primaryKey = sourceTableKey
        this.parentMemberList = sourceTableKey?.children?.filter(member => !member.properties.deleted).map(member => {
          let column = this.dataByType[this.cellData.source.isView ? 'view' : 'table'][this.cellData.source.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
          return column
        }) || []
        let targetTableKey = (this.dataByType.table[ChildEntityRef] || this.dataByType.view[ChildEntityRef])?.children?.find(column => column.properties.Id === ChildKeyRefBak)
        this.foreignKey = targetTableKey
        this.childMemberList = targetTableKey?.children?.filter(member => !member.properties.deleted).map(member => {
          member.properties.AttributeRefBak = member.properties.AttributeRef
          let column = this.dataByType[this.cellData.target.isView ? 'view' : 'table'][this.cellData.target.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
          return column
        }).filter(column => column)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-table /deep/ .el-table__cell {
    padding: 0;
    height: 40px;
    line-height: 40px;
  }
  .el-select /deep/ .el-input {
    font-size: 12px;
    color: #555;
  }
  /deep/ .el-radio__label {
    font-size: 12px;
  }
  .el-input--small /deep/ .el-input__inner {
    height: 30px;
  }
  .el-table {
    font-size: 12px;
  }
  .el-table /deep/ th {
    font-size: 12px;
    color: #555;
  }
  .connection-wrapper {
    position: relative;
    top: -5px;
  }
  .label-disc {
    margin-right: 20px;
    font-size: 12px;
    font-weight: 400;
    color: #555555;
  }
  .style-box  {
    position: relative;
    height: 42px;
  }
  .middle-y {
    display: inline-block;
    vertical-align: middle;
  }
  .connection-type {
    .title {
      display: inline-block;
      width: 53px;
    }
    .content {
      display: inline-block;
      .el-radio {
        margin-right: 10px;
      }
    }
  }
  .edge-set-item-list {
    margin-top: 20px;
    display: flex;
    align-items: stretch;
    flex-wrap: wrap;
    // li:nth-child(odd) {
    //   border-right: 1px solid #d0d0d0;
    // }
    li {
      width: 300px;
      box-sizing: border-box;
      display: inline-block;
      // flex: 0 0 50%;
      align-items: center;
      padding-bottom: 10px;
    }
    .title {
      display: inline-block;
      // flex: 0 0 100px;
      text-align: right;
      margin-right: 10px;
      width: 70px;
    }
    .content {
      flex: 1 1 auto;
      text-align: left;
    }
  }
  .table-class {
    margin-top: 10px;
    /deep/ .disabled th {
      color: #C0C4CC!important;
    }
  }
</style>
