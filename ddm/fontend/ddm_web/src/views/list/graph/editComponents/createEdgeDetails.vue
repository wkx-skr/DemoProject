<template>
  <div>
    <div v-if="edgeType !== 'VirtualNonIdentifying' && edgeType !== 'ViewNonIdentifying'" class="connection-type">
      <span class="title">关系类型</span>
      <el-radio-group class="content" v-model="edgeType">
        <el-radio :disabled="edgeType === 'ManyToManyManyToMany'" label="RelationalIdentifying">主键关系</el-radio>
        <el-radio :disabled="edgeType === 'ManyToManyManyToMany'" label="RelationalNonIdentifying">非主键关系</el-radio>
      </el-radio-group>
    </div>
    <ul class="edge-set-item-list">
      <li>
        <span class="title">名称</span>
        <el-input size="mini" class="content" v-model="cellData.name"></el-input>
      </li>
      <li>
        <span class="title">基数关系</span>
        <el-select style="width: 100px;" class="content" size="small" v-model="cellData.endCardinalityType">
          <el-option :key="item.value" :value="item.value" :label="item.label" v-for="item in endCardinalityType"></el-option>
        </el-select>
        <span class="title">值</span>
        <el-input style="width: 100px;" size="small" class="content"></el-input>
      </li>
      <li>
        <span class="title">父表</span>
        <el-select @change="changeParentTable" style="width: 100px;" class="content" size="small" v-model="cellData.source.OwneeRef">
          <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in Object.values(dataByType.table).filter(table => !table.properties.deleted)"></el-option>
        </el-select>
      </li>
      <li>
        <span class="title">子表</span>
        <el-select @change="changeChildTable" style="width: 100px;" class="content" size="small" v-model="cellData.target.OwneeRef">
          <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in Object.values(dataByType.table).filter(table => !table.properties.deleted)"></el-option>
        </el-select>
      </li>
      <li>
        <span class="title">父键</span>
        <el-select :disabled="edgeType !== 'RelationalIdentifying' && edgeType !== 'RelationalNonIdentifying'" style="width: 200px" class="content" size="small" @change="changeKeyRef" v-model="cellData.ParentKeyRef">
          <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in parentKeyRefSelectArr"></el-option>
        </el-select>
      </li>
      <li>
        <span class="title">子键</span>
        <el-select disabled style="width: 200px" class="content" size="small" @change="changeKeyRef" v-model="cellData.ChildKeyRef">
          <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in childKeyRefSelectArr"></el-option>
        </el-select>
      </li>
      <li>
        <span class="title">级联</span>
        <el-select style="width: 100px;" class="content" size="small" :value="-1">
          <el-option :value="-1" label="---"></el-option>
          <el-option :value="1" label="是"></el-option>
          <el-option :value="0" label="否"></el-option>
        </el-select>
      </li>
    </ul>
    <el-table
      :key="tableKey"
      class="table-class"
      :data="parentMemberList"
      stripe
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
          <el-select :key="foreignKey.children.map(member => member.properties.Id).join(',') + scope.$index" :disabled="edgeType === 'ManyToManyManyToMany'" @change="changeForeignKeyMemberShip" style="width: 200px" class="content" size="small" v-model="foreignKey.children[scope.$index].properties.AttributeRefBak">
            <!--          <el-select :disabled="edgeType === 'ManyToManyManyToMany'" @change="changeForeignKeyMemberShip" style="width: 200px" class="content" size="small" v-model="mapMember(scope.row.properties.Id).properties.AttributeRefBak">-->
            <el-option :key="item.properties.Id" :value="item.properties.Id" :label="item.properties.Name" v-for="item in dataByType[cellData.target.isTable ? 'table' : 'view'][cellData.target.OwneeRef].children.filter(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && !column.properties.deleted)"></el-option>
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="primary">取消</el-button>
  </div>
</template>

<script>
// 创建自定义关系，需考虑自定义外键传入
import _ from 'lodash'

export default {
  props: ['endCardinalityType', 'cellData', 'dataByType', 'getTableHTMLFunction', 'graph', 'deliverNum', 'LayerEdit', 'Changes', 'pathIds', 'isCircle', 'createRelation', 'createDeepRelation', 'currentEdgeType', 'startIdToEndIds', 'calculateStartIdToEndIds'],
  data () {
    let parentMemberList = []
    let childMemberList = []
    let foreignKey = {}
    let primaryKey = {}
    if (this.cellData.type === 'Relational' || this.cellData.type === 'View') { // 主键关系或者外键关系
      primaryKey = this.dataByType[this.cellData.source.isTable ? 'table' : 'view'][this.cellData.source.OwneeRef].children.find(column => column.properties.Id === this.dataByType.relation[this.cellData.OwneeRef].properties.ParentKeyRef)
      parentMemberList = primaryKey && primaryKey.children && primaryKey.children.filter(member => !member.properties.deleted).map(member => {
        let column = this.dataByType[this.cellData.source.isTable ? 'table' : 'view'][this.cellData.source.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
        return column
      })
      foreignKey = this.dataByType[this.cellData.target.isTable ? 'table' : 'view'][this.cellData.target.OwneeRef].children.find(column => column.properties.Id === this.dataByType.relation[this.cellData.OwneeRef].properties.ChildKeyRef)
      childMemberList = foreignKey && foreignKey.children && foreignKey.children.filter(member => !member.properties.deleted).map(member => {
        member.properties.AttributeRefBak = member.properties.AttributeRef
        let column = this.dataByType[this.cellData.target.isTable ? 'table' : 'view'][this.cellData.target.OwneeRef].children.find(column => !column.properties.deleted && column.properties.Id === member.properties.AttributeRef)
        return column
      })
    }
    return {
      parentMemberList,
      childMemberList,
      foreignKey,
      primaryKey,
      edgeType: (this.cellData.type && this.cellData.relationalType) ? this.cellData.type + this.cellData.relationalType : 'RelationalIdentifying',
      relation: {},
      emtpyNum: this.emptyMemberNum,
      changes: [],
      tableKey: 0
    }
  },
  computed: {
    parentKeyRefSelectArr () {
      return (this.dataByType.table[this.cellData.source.OwneeRef]) && (this.dataByType.table[this.cellData.source.OwneeRef].children.filter(column => (this.cellData.type !== 'View' ? (column.properties.KeyGroupType === 'PrimaryKey' || column.properties.KeyGroupType === 'UniqueKey') : column.properties.KeyGroupType === 'VirtualKey')))
    },
    childKeyRefSelectArr () {
      return (this.dataByType.table[this.cellData.target.OwneeRef]) && (this.dataByType.table[this.cellData.target.OwneeRef].children.filter(column => (this.cellData.type !== 'View' ? (!column.properties.deleted && (column.properties.KeyGroupType === 'ForeignKey' || column.properties.KeyGroupType === 'UniqueKey')) : (!column.properties.deleted && (column.properties.KeyGroupType === 'VirtualKey')))))
    }
  },
  mounted () {
    console.log(this.cellData)
    if (!this.cellData.isCreated) {
      this.relation = this.dataByType.relation[this.cellData.OwneeRef]
      this.$set(this.relation.properties, 'ParentKeyRefBak', this.relation.properties.ParentKeyRef)
      this.$set(this.relation.properties, 'ChildKeyRefBak', this.relation.properties.ChildKeyRef)
    }
  },
  watch: {

  },
  methods: {
    changeChildTable (tableId) {
      if (this.cellData.source.OwneeRef && this.cellData.target.OwneeRef) {
        this.addRelation()
      }
    },
    changeParentTable (tableId) {
      if (this.cellData.source.OwneeRef && this.cellData.target.OwneeRef) {
        this.addRelation()
      }
    },
    addRelation () {
      this.dataByType.relation[this.$parent.$parent.$parent.$parent.emptyRelationNum] = {

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
      let foreignKeyMember = this.foreignKey.children && this.foreignKey.children.find(member => !member.properties.deleted && member.properties.AttributeRefBak === columnId && member.properties.AttributeRef !== columnId)
      let targetTable = this.dataByType.table[this.cellData.target.OwneeRef]

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

      // change = new (this.Changes)('modifyColumn', {
      //   pId: targetTable.properties.Id,
      //   pName: targetTable.properties.Name,
      //   name: mapColumnBak.properties.Name,
      //   pre: _.cloneDeep(mapColumnBak),
      //   now: null
      // })
      // mapColumnBak.properties.Reference = null
      // change.obj.now = _.cloneDeep(mapColumnBak)
      // this.changes.push(change)

      change = new (this.Changes)('modifyIndex', {
        pId: targetTable.properties.Id,
        pName: targetTable.properties.Name,
        name: this.foreignKey.properties.Name,
        pre: _.cloneDeep(this.foreignKey),
        now: null
      })
      foreignKeyMember.properties.AttributeRef = foreignKeyMember.properties.AttributeRefBak
      let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.ChildEntityRef)
      if (cell.isTable) {
        cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      } else if (cell.isView) {
        cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      } else if (cell.isComment) {
        cell.value = this.getCommentHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
      } else if (cell.isFigure) {
        cell.value = this.getFigureHTMLFunction(cell.Id, this.graph.graph, null, null, true)
      }
      this.graph.graph.getView().refresh()
      change.obj.now = _.cloneDeep(this.foreignKey)
      this.changes.push(change)
      this.tableKey++
    },
    changeKeyRef () {
      if (this.cellData.source.OwneeRef && this.cellData.target.OwneeRef) {
        this.primaryKey = this.dataByType.table[this.cellData.source.OwneeRef].children.find(column => column.properties.Id === this.cellData.ParentKeyRef)
        this.parentMemberList = this.primaryKey.children.filter(member => !member.properties.deleted).map(member => {
          let column = this.dataByType.table[this.cellData.source.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
          return column
        })
        this.foreignKey = this.dataByType.table[this.cellData.target.OwneeRef].children.find(column => column.properties.Id === this.cellData.ChildKeyRef)
        this.childMemberList = this.foreignKey.children && this.foreignKey.children.filter(member => !member.properties.deleted).map(member => {
          member.properties.AttributeRefBak = member.properties.AttributeRef
          let column = this.dataByType.table[this.cellData.target.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
          return column
        })
        this.tableKey++
      }
    },
    changeEdgeType () {
      this.changeOperate()
    },
    changeEndCardinalityType () {
      let change = new (this.Changes)('modifyRelation', {
        name: this.relation.properties.Name,
        pre: _.cloneDeep(this.relation)
      })
      this.relation.properties.EndCardinality = this.cellData.endCardinalityType
      this.relation.properties.changed = true
      let edge = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.Id)
      edge.endCardinalityType = this.cellData.endCardinalityType
      edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
      this.graph.graph.refresh(edge)
      change.obj.now = _.cloneDeep(this.relation)
      this.changes.push(change)
    },
    save () {
      if (!this.changes) {
        return false
      }
      if (this.changes.length > 0) {
        this.graph.editor.undoManager.undoableEditHappened((new (this.LayerEdit)(this.changes)))
      }
      return this.changes.length > 0
    },
    async changeOperate () {
      let sourceTable = this.dataByType[this.cellData.source.isTable ? 'table' : 'view'][this.relation.properties.ParentEntityRef]
      let targetTable = this.dataByType[this.cellData.target.isTable ? 'table' : 'view'][this.relation.properties.ChildEntityRef]
      let targetPrimaryKey = targetTable.children.find(column => column.properties.KeyGroupType === 'PrimaryKey')
      let sourcePrimaryKey = sourceTable.children.find(column => column.properties.Id === this.relation.properties.ParentKeyRefBak)
      let targetForeignKey = targetTable.children.find(column => column.properties.KeyGroupType === 'ForeignKey' && column.properties.Id === this.relation.properties.ChildKeyRef && !column.properties.deleted)

      if (this.edgeType === 'RelationalIdentifying') { // 切换为主键关系
        // if (this.relation.properties.ParentKeyRef === this.relation.properties.ParentKeyRefBak) { // 父键未发生改变
        //   // 修改子表主键索引
        //   let sourceTable = this.dataByType.table[this.relation.properties.ParentEntityRef]
        //   let targetTable = this.dataByType.table[this.relation.properties.ChildEntityRef]
        //   let sourcePrimaryKey = sourceTable.children.find(column => column.properties.KeyGroupType === 'PrimaryKey')
        //   let targetPrimaryKey = targetTable.children.find(column => column.properties.KeyGroupType === 'PrimaryKey')
        //   let changes = []
        //   let change = new (this.Changes)('modifyIndex', {
        //     pId: targetTable.properties.Id,
        //     pName: targetTable.properties.Name,
        //     name: targetPrimaryKey.properties.Name,
        //     pre: _.cloneDeep(targetPrimaryKey),
        //     now: null
        //   })
        //   sourcePrimaryKey.properties.KeyGroupMemberRefs.map(memberRef => sourcePrimaryKey.children.find(member1 => member1.properties.Id === memberRef)).forEach(sourcePrimaryKeyMember => {
        //     let mapTargetColumn = targetTable.children.find(column => column.properties.Reference === sourcePrimaryKeyMember.properties.AttributeRef)
        //
        //     if (!targetPrimaryKey.properties.KeyGroupMemberRefs) {
        //       targetPrimaryKey.properties.KeyGroupMemberRefs = []
        //       targetPrimaryKey.children = []
        //     }
        //     let targetPrimaryMemberList = targetPrimaryKey.properties.KeyGroupMemberRefs.map(memberRef => targetPrimaryKey.children.find(member3 => member3.properties.Id === memberRef))
        //     if (targetPrimaryMemberList.some(mebmer4 => mebmer4.properties.AttributeRef === mapTargetColumn.properties.Id)) { // 有此主键不需要任何处理
        //
        //     } else {
        //       let targetPrimaryKeyMember = {
        //         objectClass: 'Datablau.LDM.EntityKeyGroupMember',
        //         properties: {
        //           AttributeRef: mapTargetColumn.properties.Id,
        //           Id: this.emtpyNum,
        //           RawType: 'KeyGroupMember',
        //           Reference: sourcePrimaryKeyMember.properties.Id,
        //           TypeId: 80500001,
        //           UniqueId: 'c5e2ba67-5412-48e5-bcb0-cd05db6dfb95'
        //         }
        //       }
        //       targetPrimaryKey.children.push(targetPrimaryKeyMember)
        //       targetPrimaryKey.properties.KeyGroupMemberRefs.push(targetPrimaryKeyMember.properties.Id)
        //     }
        //     this.emtpyNum++
        //   })
        //   change.obj.now = _.cloneDeep(targetPrimaryKey)
        //   changes.push(change)
        //   setTimeout(() => {
        //     this.graph.editor.undoManager.undoableEditHappened((new (this.LayerEdit)(changes)))
        //   })
        //   let cellList = this.graph.graph.getDefaultParent().children
        //   let cell = cellList.find(cell => cell.OwneeRef === this.relation.properties.ChildEntityRef)
        //   cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        //   this.graph.graph.getView().refresh()
        // } else { // 父键发生改变
        //   // 修改子表主键索引
        //   let sourceTable = this.dataByType.table[this.relation.properties.ParentEntityRef]
        //   let targetTable = this.dataByType.table[this.relation.properties.ChildEntityRef]
        //   let sourcePrimaryKey = sourceTable.children.find(column => column.properties.Id === this.relation.properties.ParentKeyRefBak)
        //   let targetForeignKey = targetTable.children.find(column => column.properties.KeyGroupType === 'ForeignKey' && column.properties.Id === this.relation.properties.ChildKeyRef)
        //   if (targetForeignKey.children) {
        //     targetForeignKey.children.forEach(member => this.$set(member.properties, 'deleted', true))
        //   }
        //   this.$set(targetForeignKey.properties, 'deleted', true)
        //   let cellList = this.graph.graph.getDefaultParent().children
        //   let source = cellList.find(cell => cell.OwneeRef === this.relation.properties.ParentEntityRef)
        //   let target = cellList.find(cell => cell.OwneeRef === this.relation.properties.ChildEntityRef)
        //   let changes = []
        //   this.pathIds = new Set()
        //   this.$bus.$emit('changeCurrentEdgeType', 'RelationalIdentifying')
        //   if (this.isCircle(sourceTable, targetTable)) {
        //     try {
        //       await this.$confirm(`创建当前一对一的关系会引起非法的环状数据关联，是否转换成一对多的关系？`, '提示', {
        //         type: 'warning',
        //         confirmButtonText: '是',
        //         cancelButtonText: ' 否 ',
        //         showClose: false,
        //         closeOnClickModal: false
        //       })
        //       this.$bus.$emit('changeCurrentEdgeType', 'RelationalNonIdentifying')
        //       await this.createRelation(source, target, this.currentEdgeType, changes, true, sourcePrimaryKey)
        //       return
        //     } catch (e) {
        //       console.log(e)
        //       return
        //     }
        //   }
        //   try {
        //     await this.createRelation(source, target, this.currentEdgeType, changes, true, sourcePrimaryKey)
        //     let endIds = this.startIdToEndIds[target.OwneeRef]
        //     await this.createDeepRelation(endIds, target, this.currentEdgeType, changes)
        //   } catch (e) {
        //     console.log(e)
        //   }
        // }
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

        let cellList = this.graph.graph.getDefaultParent().children
        let source = cellList.find(cell => cell.OwneeRef === this.relation.properties.ParentEntityRef)
        let target = cellList.find(cell => cell.OwneeRef === this.relation.properties.ChildEntityRef)
        this.$bus.$emit('clearPathIds')
        if (this.isCircle(sourceTable, targetTable)) {
          try {
            await this.$confirm(`创建当前一对一的关系会引起非法的环状数据关联，是否转换成一对多的关系？`, '提示', {
              type: 'warning',
              confirmButtonText: '是',
              cancelButtonText: ' 否 ',
              showClose: false,
              closeOnClickModal: false
            })
            await this.createRelation(source, target, 'RelationalNonIdentifying', this.changes, this.relation, sourcePrimaryKey)
            return
          } catch (e) {
            console.log(e)
            return
          }
        }
        try {
          await this.createRelation(source, target, 'RelationalIdentifying', this.changes, this.relation, sourcePrimaryKey)
          let endIds = this.startIdToEndIds[target.OwneeRef]
          await this.createDeepRelation(endIds, target, this.changes)
        } catch (e) {
          console.log(e)
        }
        let change = new (this.Changes)('modifyRelation', {
          name: this.relation.properties.Name,
          pre: _.cloneDeep(this.relation)
        })
        this.relation.properties.ParentKeyRef = this.relation.properties.ParentKeyRefBak
        this.relation.properties.changed = true
        this.cellData.relationalType = 'Identifying'
        let edge = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.Id)
        edge.relationalType = this.cellData.relationalType
        this.relation.properties.RelationalType = 'Identifying'
        // if (this.relation.properties.EndCardinality !== this.cellData.endCardinalityType) {
        this.relation.properties.EndCardinality = this.cellData.endCardinalityType
        // let edge = cellList.find(cell => cell.OwneeRef === this.relation.properties.Id)
        edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
        this.graph.graph.refresh(edge)
        // }
        change.obj.now = _.cloneDeep(this.relation)
        this.changes.push(change)
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
        let targetPrimaryKeyCopy = _.cloneDeep(targetPrimaryKey)
        let change = new (this.Changes)('modifyIndex', {
          pId: targetTable.properties.Id,
          pName: targetTable.properties.Name,
          name: targetPrimaryKey.properties.Name,
          pre: _.cloneDeep(targetPrimaryKey),
          now: null
        })

        sourcePrimaryKey.children.forEach(sourcePrimaryKeyMember => {
          if (sourcePrimaryKeyMember.properties.deleted) {
            return
          }
          let mapTargetColumn = targetTable.children.find(column => column.properties.Reference === sourcePrimaryKeyMember.properties.AttributeRef)
          if (!mapTargetColumn) {
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

        let cellList = this.graph.graph.getDefaultParent().children
        let source = cellList.find(cell => cell.OwneeRef === this.relation.properties.ParentEntityRef)
        let target = cellList.find(cell => cell.OwneeRef === this.relation.properties.ChildEntityRef)

        this.$bus.$emit('clearPathIds')
        try {
          await this.createRelation(source, target, 'RelationalNonIdentifying', this.changes, this.relation, sourcePrimaryKey)
          // let endIds = this.startIdToEndIds[target.OwneeRef]
          // if (endIds) {
          //   this.$bus.$emit('changeCurrentEdgeType', 'RelationalIdentifying')
          //   await this.createDeepRelation(endIds, target, this.currentEdgeType, this.changes)
          // }
          this.calculateStartIdToEndIds()
          setTimeout(async () => {
            let endIds = this.startIdToEndIds[target.OwneeRef]
            await this.createDeepRelation(endIds, target, this.changes, targetPrimaryKeyCopy)
          })
        } catch (e) {
          console.log(e)
        }
        change = new (this.Changes)('modifyRelation', {
          name: this.relation.properties.Name,
          pre: _.cloneDeep(this.relation)
        })
        this.relation.properties.ParentKeyRef = this.relation.properties.ParentKeyRefBak
        this.relation.properties.changed = true
        this.cellData.relationalType = 'NonIdentifying'
        let edge = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === this.relation.properties.Id)
        edge.relationalType = this.cellData.relationalType
        this.relation.properties.RelationalType = 'NonIdentifying'
        // if (this.relation.properties.EndCardinality !== this.cellData.endCardinalityType) {
        this.relation.properties.EndCardinality = this.cellData.endCardinalityType
        // let edge = cellList.find(cell => cell.OwneeRef === this.relation.properties.Id)
        edge.style = this.graph.drawEdgeShapeStyle(edge.Id)
        this.graph.graph.refresh(edge)
        // }
        change.obj.now = _.cloneDeep(this.relation)
        this.changes.push(change)
      }

      if (this.cellData.type === 'Relational') { // 主键关系或者外键关系
        this.primaryKey = this.dataByType[this.cellData.source.isTable ? 'table' : 'view'][this.cellData.source.OwneeRef].children.find(column => column.properties.Id === this.dataByType.relation[this.cellData.OwneeRef].properties.ParentKeyRef)
        this.parentMemberList = this.primaryKey.children.filter(member => !member.properties.deleted).map(member => {
          let column = this.dataByType[this.cellData.source.isTable ? 'table' : 'view'][this.cellData.source.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
          return column
        })
        this.foreignKey = this.dataByType[this.cellData.target.isTable ? 'table' : 'view'][this.cellData.target.OwneeRef].children.find(column => column.properties.Id === this.dataByType.relation[this.cellData.OwneeRef].properties.ChildKeyRef)
        this.childMemberList = this.foreignKey.children && this.foreignKey.children.filter(member => !member.properties.deleted).map(member => {
          member.properties.AttributeRefBak = member.properties.AttributeRef
          let column = this.dataByType[this.cellData.target.isTable ? 'table' : 'view'][this.cellData.target.OwneeRef].children.find(column => column.properties.Id === member.properties.AttributeRef)
          return column
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .connection-type {
    .title {
      display: inline-block;
      width: 100px;
    }
  }
  .edge-set-item-list {
    margin-top: 15px;
    border-top: 1px solid #d0d0d0;
    padding-top: 30px;
    display: flex;
    align-items: stretch;
    flex-wrap: wrap;
    li:nth-child(odd) {
      border-right: 1px solid #d0d0d0;
    }
    li {
      box-sizing: border-box;
      display: inline-flex;
      flex: 0 0 50%;
      align-items: center;
      padding-bottom: 30px;
      padding-right: 15px;
    }
    .title {
      display: inline-block;
      flex: 0 0 100px;
      text-align: right;
      margin-right: 15px;
    }
    .content {
      flex: 1 1 auto;
      text-align: left;
    }
  }
  .table-class {
    margin-top: 30px;
  }
</style>
