<template>
  <div class="dw-mapping-wrapper" v-loading="columnLoading">
    <datablau-dialog
      title="添加实体"
      append-to-body
      width="873px"
      :visible.sync="addEntityVisible"
      :height="'500px'"
    >
      <add-entity-dialog
        :key="addEntityKey"
        @checkedTreeData="mergeTreeData"
        @close="addEntityVisible=false"
        ></add-entity-dialog>
    </datablau-dialog>
    <div class="table-mapping mapping-item">
      <div>
        <datablau-detail-subtitle title="表映射" mt="10px"></datablau-detail-subtitle>
        <datablau-button
          :disabled="!editMode"
          :dblClickTimeout="0"
          @click="addDwMapping"
           style="margin-left: 6px;"
           type="text">
          <i style="font-size:16px;vertical-align: text-bottom;" class="el-icon-circle-plus-outline"></i>添加表映射
        </datablau-button>
      </div>
      <div class="content-wrapper">
        <datablau-table
          :key="tableKey"
          :data="dwMapping"
          height="100%"
          ref="dwTable"
          highlight-current-row
          single-select
          :tree-props="{
          children: 'children1'
        }"
          row-key="properties.Id"
          :class="{'dwTable2': typeDataWareHouse}"
          :singleDefaultSelect="singleDefaultSelect"
          @current-change="changeRadioSelect"
          :current-row-key="currentRowKey"
          @selection-change="changeRadioSelect"
          :autoHideSelection="false"
          :row-class-name="tableRowClassName"
          style="height: auto"
        >
          <el-table-column
            label="映射名">
            <template slot-scope="scope">
              <datablau-input :disabled="!editMode" class="input-wrapper" v-model="scope.row.properties.Name"></datablau-input>
            </template>
          </el-table-column>
          <el-table-column
            label="说明">
            <template slot-scope="scope">
              <datablau-input :disabled="!editMode" class="input-wrapper" v-model="scope.row.properties.Definition"></datablau-input>
            </template>
          </el-table-column>
          <el-table-column
            label="来源表名">
            <template slot-scope="scope">
              <datablau-input disabled class="input-wrapper" v-model="scope.row.properties.DataSources"></datablau-input>
            </template>
          </el-table-column>
          <el-table-column
            label="默认"
            width="37"
            fixed="right">
            <template slot-scope="scope">
              <datablau-checkbox :disabled="!editMode" @change="changeDefault(scope.row, ...arguments)" style="display: inline-block;" :checkboxType="'single'" :class="{'checkboxDataWareHouse':typeDataWareHouse}" v-model="scope.row.properties.IsKeep"></datablau-checkbox>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="40"
            fixed="right">
            <template slot-scope="scope">
              <datablau-button :disabled="!editMode" tooltipContent="删除映射" @click.stop="deleteDwMapping(scope.row)" style="display: inline-block;margin-left: 5px;" type="icon" class="iconfont icon-delete"></datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
    </div>
    <div style="margin-top: 20px;" class="column-mapping mapping-item">
      <div class="title-wrapper">
        <datablau-detail-subtitle title="字段映射" mt="10px"></datablau-detail-subtitle>
        <datablau-button
          :disabled="!currentRowKey || !editMode"
          :dblClickTimeout="0"
          @click="addDwColumn"
          style="margin-left: 6px;"
          type="text">
          <i style="font-size:16px;vertical-align: text-bottom;" class="el-icon-circle-plus-outline"></i>添加字段
        </datablau-button>
      </div>
      <div class="content-wrapper">
        <div class="table-panel">
          <datablau-table
            style="overflow: auto;"
            :key="contentKey"
            height="100%"
            highlight-current-row
            @current-change="columnCurrentChange"
            :data="selectRow.children || []"
            :current-row-key="currentColumnRowKey"
            row-key="properties.Id"
            :row-class-name="tableRowClassName"
          >
            <el-table-column
              label="中文名"
              width="130">
              <template slot-scope="scope">
                <datablau-input :disabled="!editMode" class="input-wrapper" v-model="allCols[scope.$index].cnName"></datablau-input>
              </template>
            </el-table-column>
            <el-table-column
              label="字段名"
              width="120">
              <template slot-scope="scope">
                <datablau-input :disabled="!editMode" class="input-wrapper" v-model="allCols[scope.$index].name"></datablau-input>
              </template>
            </el-table-column>
            <el-table-column
              label="字段类型"
              width="138">
              <template slot-scope="scope">
                <span v-if="!editMode">{{allCols[scope.$index].dataType}}</span>
                <el-autocomplete
                  v-else
                  :clearable="false"
                  size="mini"
                  @select="(val) => {clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!allCols[scope.$index].domainId, allCols[scope.$index])}"
                  v-model="allCols[scope.$index].dataType"
                  :fetch-suggestions="queryColumnDataType"
                  :disabled="fk.indexOf(scope.row.elementId) > -1"
                  @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!allCols[scope.$index].domainId, allCols[scope.$index])"
                >
                  <template slot-scope="{ item }">
                    <div @click.stop v-if="item.type" style="cursor:initial;color:#aaaaaa;margin-left: -4px;">{{item.value}}</div>
                    <span v-else>{{item.value}}</span>
                  </template>
                </el-autocomplete>
              </template>
            </el-table-column>
            <el-table-column
              label="映射类型"
              :width="150">
              <template slot-scope="scope">
                <el-autocomplete
                  :disabled="!editMode"
                  size="mini"
                  v-model="scope.row.properties.MappingType"
                  :fetch-suggestions="queryDataType"
                  @select="onSelectMappingType(scope.row, ...arguments)"
                >
                  <template slot-scope="{ item }">
                    <span>{{item.mappingType}}</span>
                  </template>
                </el-autocomplete>
              </template>
            </el-table-column>
            <el-table-column
              label="映射表达式"
              :width="170"
              show-overflow-tooltip>
              <template slot-scope="scope">
                <datablau-input :disabled="!editMode" class="input-wrapper" v-model="scope.row.properties.MappingExpression"></datablau-input>
              </template>
            </el-table-column>
            <el-table-column
              label="映射说明">
              <template slot-scope="scope">
                <datablau-input :disabled="!editMode" class="input-wrapper" v-model="scope.row.properties.MappingComment"></datablau-input>
              </template>
            </el-table-column>
            <el-table-column
              label="主键"
              width="50">
              <template slot-scope="scope">
                <datablau-checked v-if="pkSelection[scope.$index]"></datablau-checked>
              </template>
            </el-table-column>
            <el-table-column
              label="非空"
              width="50">
              <template slot-scope="scope">
                <datablau-checked v-if="allCols[scope.$index].notNull"></datablau-checked>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="100"
              fixed="right">
              <template slot-scope="scope">
                <datablau-button :disabled="!editMode" tooltipContent="清空映射" @click.stop="clearDwMappingItem(scope.row)" style="display: inline-block;margin-left: 5px;" type="icon" class="iconfont icon-abandon"></datablau-button>
                <datablau-button :disabled="fk.indexOf(scope.row.properties.ChildKeyRef) > -1 || !editMode" :tooltipContent="fk.indexOf(scope.row.properties.ChildKeyRef) > -1 ? `外键成员${scope.row.properties.colName}不允许被删除映射` : '删除映射'" @click.stop="deleteDwMappingItem(scope.$index, scope.row)" style="display: inline-block;margin-left: 5px;" type="icon" class="iconfont icon-delete"></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
        <div v-show="!shrink && editMode" class="mapping-operation-panel">
          <div class="middle-content-wrapper">
            <ul>
              <li @click="autoMapping">
                <div class="img-wrapper">
                  <img :src="automappingImg" alt="" />
                </div>
                <h2>自动映射</h2>
              </li>
              <li @click="newMapping">
                <div class="img-wrapper">
                  <img :src="newmappingImg" alt="" />
                </div>
                <h2>新建映射</h2>
              </li>
            </ul>
          </div>
          <div class="right-content-wrapper">
            <datablau-button
              :disabled="!editMode"
              :dblClickTimeout="0"
              @click="addEntity"
              type="text">
              <i style="font-size:16px;vertical-align: text-bottom;" class="el-icon-circle-plus-outline"></i>添加实体
            </datablau-button>
            <datablau-tree
              expand-on-click-node
              class="grey-tree"
              :key="treeKey"
              ref="detailTree"
              :data="treeData"
              :props="defaultPropsDetail"
              :load="loadNode"
              lazy
              :highlight-current="true"
              node-key="id"
              dataSupervise
              @current-change="currentTreeChange"
              :data-options-function="dataOptionsFunction"
              :data-icon-function="dataIconFunctionDetail"
            ></datablau-tree>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DatablauCheckbox from '@components/basic/checkbox/DatablauCheckbox'
import datablauChecked from '@/views/list/tables/datablauChecked.vue'
import { v4 as uuidv4 } from 'uuid'
import LDMTypes from '@/next/constant/LDMTypes.ts'
import automappingImg from '@/views/list/graph/images/automapping.svg'
import newmappingImg from '@/views/list/graph/images/newmapping.svg'
import addEntityDialog from '@/views/list/graph/editComponents/addEntityDialog.vue'
import HTTP from '@/resource/http'
import $ from 'jquery'
import $const from '@/resource/const'
import _ from 'lodash'
export default {
  components: { DatablauCheckbox, datablauChecked, addEntityDialog },
  props: {
    dwMappingOrigin: {
      type: Array,
      required: true
    },
    allCols: {

    },
    pkSelection: {

    },
    typeDataWareHouse: {

    },
    deliverNum: {

    },
    fk: {

    },
    shrink: {

    },
    editMode: {

    },
    limitedDsApply: {

    },
    limitedDsApplyConfig: {

    },
    currentModel: {

    }
  },
  data () {
    return {
      columnLoading: false,
      dwMapping: [],
      dwMappingBak: [],
      defaultPropsDetail: {
        label: 'name',
        children: 'children',
        id: 'id',
        isLeaf: 'leaf'
      },
      currentRowKey: null,
      currentColumnRowKey: null,
      contentKey: 0,
      tableKey: 0,
      singleDefaultSelect: null,
      selectRow: {
        children: []
      },
      automappingImg,
      newmappingImg,
      addEntityVisible: false,
      addEntityKey: 0,
      treeData: [],
      treeKey: 0,
      currentColumn: null,
      currentTreeData: null,
      mappingTypeHints: [],
      newDwMapping: [],
      modDwMapping: [],
      delDwMapping: []
    }
  },
  mounted () {
    this.initDwMapping()
    this.getMappingType()
    this.$bus.$on('mappingChanged', this.initDwMapping)
    this.$bus.$on('deleteColumn', this.deleteDwMappingItemReal)
    this.$bus.$on('addDwItem', this.addDwMappingItem)
  },
  beforeDestroy () {
    this.$bus.$off('mappingChanged')
    this.$bus.$off('deleteColumn')
    // this.$bus.$off('addDwItem')
  },
  watch: {
    dwMapping: {
      deep: true,
      handler () {
        this.getDataSources()
      }
    }
  },
  methods: {
    changeDefault (row, val) {
      if (val) {
        this.dwMapping.forEach(mapping => {
          if (mapping.properties.Id !== row.properties.Id) {
            this.$set(mapping.properties, 'IsKeep', false)
          }
        })
      }
    },
    queryColumnDataType (queryString, cb) {
      let allDataTypes = $const.DataTypes[this.currentModel.modelType.toLowerCase()]
      let result = queryString ? allDataTypes.filter((item) => {
        if (typeof item === 'string') {
          return (item.toLowerCase().indexOf(queryString.toLowerCase()) > -1)
        } else {
          return false
        }
      }) : allDataTypes
      if (queryString) {
        result = _.uniq(result)
      }
      cb(result.map(item => {
        if (typeof item === 'string') {
          return {
            value: item
          }
        } else {
          return {
            value: item.label,
            type: 'folder'
          }
        }
      }))
    },
    clearLimitedDomain (bool, row) {
      if (bool) {
        row.domainId = null
        row.domainName = null
      }
    },
    getDataSources () {
      this.dwMapping.forEach(mapping => {
        let sourceTables = new Set()
        mapping.children?.forEach(item => {
          sourceTables.add(item.properties.SourceTableName)
        })
        mapping.properties.DataSources = [...sourceTables].filter(item => item).join(';')
      })
    },
    temporarySave () {
      let newDwMapping = []
      let modDwMapping = []
      let delDwMapping = []
      const oldDataMap = new Map()
      this.dwMappingBak.forEach(item => {
        oldDataMap.set(item.properties.Id, item)
      })
      this.dwMapping.forEach(item => {
        if (item.children) {
          item.children = item.children.filter(item => !item.properties.deleted)
        }
        if (!item.properties.deleted) {
          if (oldDataMap.has(item.properties.Id)) {
            if (JSON.stringify(oldDataMap.get(item.properties.Id)) === JSON.stringify(item)) {

            } else {
              modDwMapping.push(item)
            }
            oldDataMap.get(item.properties.Id).blur = true
          } else {
            newDwMapping.push(item)
          }
        }
      })
      oldDataMap.forEach(item => {
        if (!item.blur) {
          delDwMapping.push(item)
        }
      })
      this.newDwMapping = newDwMapping
      this.modDwMapping = modDwMapping
      this.delDwMapping = delDwMapping
    },
    onSelectMappingType (row, val) {
      row.properties.MappingType = val.mappingType
    },
    queryDataType (queryString, cb) {
      if (!queryString) {
        cb(this.mappingTypeHints)
      } else {
        cb(this.mappingTypeHints.filter(hint => hint.mappingType.toLowerCase().indexOf(queryString.toLocaleString()) > -1))
      }
    },
    getMappingType () {
      this.$http.get(`${HTTP.$dddServerUrl}dwmapping?currentPage=1&pageSize=2000`).then(res => {
        console.log(res.data.content)
        this.mappingTypeHints = res.data.content
      }).catch(e => {
        console.log(e)
      })
    },
    async mappingTreeDataToColumn (leftColumn, rightCurrentTreeData) {
      leftColumn.ModelRef = rightCurrentTreeData.modelId
      leftColumn.ParentEntityRef = rightCurrentTreeData.parentId
      leftColumn.ParentKeyRef = rightCurrentTreeData.id
      let tree = this.$refs.detailTree
      let parentNode = tree.getNode(rightCurrentTreeData.parentId)
      let modelNode = tree.getNode(rightCurrentTreeData.modelId)
      this.$set(leftColumn, 'MappingExpression', parentNode.data.name + '.' + rightCurrentTreeData.name) // 防止没有MappingExpression属性
      leftColumn.SourceModelName = modelNode.data.name + '.ddm'
      leftColumn.SourceTableName = parentNode.data.tableName
      try {
        let res = await this.$http.get(this.$url + `/models/${rightCurrentTreeData.modelId}/path`)
        leftColumn.ModelSourcePath = res.data
      } catch (e) {
        console.log(e)
      }
    },
    currentTreeChange (data) {
      this.currentTreeData = data
    },
    columnCurrentChange (data) {
      this.currentColumn = data
    },
    async autoMapping () {
      if (!this.editMode) {
        return
      }
      if (!this.currentTreeData?.parentId) { // 模型
        this.$datablauMessage.error('请选择右侧实体或字段!')
        return
      }
      if (this.currentTreeData.leaf) { // 字段
        if (!this.currentColumn) {
          this.$datablauMessage.error('请选择左侧字段!')
          return
        }
        this.columnLoading = true
        await this.mappingTreeDataToColumn(this.currentColumn.properties, this.currentTreeData)
        this.columnLoading = false
      } else { // 实体
        if (this.selectRow.children) {
          this.columnLoading = true
          for (let index = 0; index < this.selectRow.children.length; index++) {
            let mappingItem = this.selectRow.children[index]
            let columnName = this.allCols[index].name
            if (!this.currentTreeData.children) { // 右侧树懒加载没有展开，children没有数据
              try {
                let res = await this.$http(this.$url + `/models/${this.currentTreeData.parentId}/elements/${this.currentTreeData.id}/content/json`)
                let columns = res.data.children?.filter(item => item.objectClass === 'Datablau.LDM.EntityAttribute').map(item => ({
                  name: item.properties.Name,
                  id: item.properties.Id,
                  parentId: this.currentTreeData.id,
                  modelId: this.currentTreeData.parentId,
                  leaf: true
                })) || []
                this.$set(this.currentTreeData, 'children', columns)
              } catch (e) {
                console.log(e)
              }
            }
            let currentTreeColumn = this.currentTreeData.children?.find(column => column.name === columnName)
            if (currentTreeColumn) {
              await this.mappingTreeDataToColumn(mappingItem.properties, currentTreeColumn)
            }
          }
          this.columnLoading = false
        }
      }
    },
    getNewName (leftColumns, name) {
      let count = 0
      let conflict = false
      leftColumns?.forEach(column => {
        let reg = new RegExp(name + '(\\d+)$')
        let res = column.name.match(reg)
        if (res) {
          if (+res[1] > count) {
            count = +res[1]
          }
          conflict = true
        } else {
          if (column.name === name) {
            conflict = true
          }
        }
      })
      if (conflict) {
        return name + (count + 1)
      } else {
        return name
      }
    },
    async createMappingColumn (rightTreeColumn) {
      let { col, colIndex } = this.$parent.$parent.$parent.$parent.addColumn()
      let newName = this.getNewName(this.allCols.slice(0, -1), rightTreeColumn.name)
      col.name = newName
      for (let i = 0; i < this.dwMapping.length; i++) {
        let dwMapping = this.dwMapping[i]
        if (!dwMapping.children) {
          dwMapping.children = []
        }
        let seed = this.deliverNum.seed++
        let tree = this.$refs.detailTree
        let parentNode = tree.getNode(rightTreeColumn.parentId)
        let modelNode = tree.getNode(rightTreeColumn.modelId)
        try {
          if (dwMapping === this.selectRow) { // 当前的mapping
            let res = await this.$http.get(this.$url + `/models/${rightTreeColumn.modelId}/path`)
            dwMapping.children.push({
              objectClass: 'Datablau.LDM.DWMappingItem',
              properties: {
                ChildKeyRef: col.elementId,
                Id: seed,
                MappingExpression: parentNode.data.name + '.' + rightTreeColumn.name,
                ModelRef: rightTreeColumn.modelId,
                ModelSourcePath: res.data,
                Name: `DWMappingItem_${seed}`,
                ParentEntityRef: rightTreeColumn.parentId,
                ParentKeyRef: rightTreeColumn.id,
                SourceModelName: modelNode.data.name + '.ddm',
                SourceTableName: parentNode.data.tableName,
                TypeId: LDMTypes.DWMappingItem,
                UniqueId: uuidv4()
                // colCnName: col.cnName,
                // colDataType: col.dataType,
                // colName: col.name,
                // notNull: col.notNull,
                // primaryKey: this.pkSelection[colIndex]
              }
            })
          } else {
            dwMapping.children.push({
              objectClass: 'Datablau.LDM.DWMappingItem',
              properties: {
                ChildKeyRef: col.elementId,
                Id: seed,
                MappingExpression: '',
                ModelRef: null,
                ModelSourcePath: '',
                Name: `DWMappingItem_${seed}`,
                ParentEntityRef: null,
                ParentKeyRef: null,
                SourceModelName: '',
                SourceTableName: '',
                TypeId: LDMTypes.DWMappingItem,
                UniqueId: uuidv4()
                // colCnName: col.cnName,
                // colDataType: col.dataType,
                // colName: col.name,
                // notNull: col.notNull,
                // primaryKey: this.pkSelection[colIndex]
              }
            })
          }
        } catch (e) {
          console.log(e)
        }
      }
    },
    async newMapping () {
      if (!this.editMode) {
        return
      }
      if (!this.currentTreeData?.parentId) { // 模型
        this.$datablauMessage.error('请选择右侧实体或字段!')
        return
      }
      if (this.currentTreeData.leaf) { // 字段
        this.columnLoading = true
        await this.createMappingColumn(this.currentTreeData)
        this.columnLoading = false
      } else {
        this.columnLoading = true
        if (this.currentTreeData.children) {
          for (let i = 0; i < this.currentTreeData.children.length; i++) {
            let treeData = this.currentTreeData.children[i]
            await this.createMappingColumn(treeData)
          }
        }
        this.columnLoading = false
      }
    },
    dataOptionsFunction (data) {
      return [
        {
          label: '删除',
          icon: 'iconfont icon-delete',
          callback: () => {
            const tree = this.$refs.detailTree
            tree.remove(data.id)
            // if (data.parentId) {
            //   const parentNode = tree.getNode(data.parentId)
            //   let index = parentNode.data.children.find(item => item.id === data.id)
            //   parentNode.data.children.splice(index, 1)
            //   tree.remove(data.id)
            // } else {
            //   let index = this.treeData.find(item => item.id === data.id)
            //   this.treeData.splice(index, 1)
            //   tree.remove(data.id)
            // }
          }
        }
      ]
    },
    dataIconFunctionDetail (data, node) {
      if (node.level === 1) {
        return 'tree-icon warehouse'
      } else if (node.level === 2) {
        return 'tree-icon table'
      } else if (node.level === 3) {
        return 'tree-icon column'
      } else {
        return ''
      }
    },
    loadNode (node, resolve) {
      if (node.level === 1) { // 获取表数据
        // this.$http(this.$url + `/models/${node.data.id}/direct/content/json`).then(res => {
        //   let result = res.data.children?.filter(item => item.objectClass === 'Datablau.LDM.EntityComposite').map(item => ({
        //     name: item.properties.Name,
        //     id: item.properties.Id,
        //     parentId: node.data.id,
        //     leaf: false
        //   })) || []
        //   resolve(result)
        // }).catch(err => {
        //   this.$showFailure(err)
        // })
        resolve(node.data.children)
      } else if (node.level === 2) { // 获取字段数据
        this.$http(this.$url + `/models/${node.parent.data.id}/elements/${node.data.id}/content/json`).then(res => {
          let result = res.data.children?.filter(item => item.objectClass === 'Datablau.LDM.EntityAttribute').map(item => ({
            name: item.properties.Name,
            id: item.properties.Id,
            parentId: node.data.id,
            modelId: node.parent.data.id,
            leaf: true
          })) || []
          node.data.children = result
          resolve(result)
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    mergeTreeData (addTreeData) {
      addTreeData.forEach(addModel => {
        let nowModel = this.treeData.find(i => i.id === addModel.id)
        if (nowModel) {
          if (!nowModel.children) {
            this.$set(nowModel, 'children', [])
          }
          addModel.children?.forEach(addTable => {
            let nowTable = nowModel.children.find(i => i.id === addTable.id)
            if (!nowTable) {
              this.$refs.detailTree.append(addTable, nowModel.id)
              // nowModel.children.push(addTable)
            }
          })
          // let childrenCopy = _.cloneDeep(nowModel.children)
          // this.$refs.detailTree.updateKeyChildren(nowModel.id, childrenCopy)
          // nowModel.children = childrenCopy
        } else {
          this.treeData.push(addModel)
        }
      })
    },
    addEntity () {
      this.addEntityVisible = true
      this.addEntityKey++
    },
    clearDwMappingItem (item) {
      let properties = item.properties
      properties.MappingExpression = ''
      properties.MappingType = ''
      properties.MappingComment = ''
      properties.ModelRef = null
      properties.ModelSourcePath = ''
      properties.ParentEntityRef = null
      properties.ParentKeyRef = null
      properties.SourceModelName = ''
      properties.SourceTableName = ''
    },
    deleteDwMappingItem (index, item) {
      let indexAllCols = this.allCols.findIndex(col => col.elementId === item.properties.ChildKeyRef) // allCols的index和dwMappingItem的index不同
      this.$bus.$emit('deleteTableColumn', { elementId: item.properties.ChildKeyRef }, indexAllCols) // 选触发删除字段事件，在删除字段中再触发实际删除deleteDwMappingItemReal
    },
    deleteDwMappingItemReal (colId) {
      this.dwMapping.forEach(dwMapping => {
        let item = dwMapping.children?.find(item => item.properties.ChildKeyRef === colId)
        this.$set(item.properties, 'deleted', true)
      })
    },
    addDwColumn () {
      let { col, colIndex } = this.$parent.$parent.$parent.$parent.addColumn()
      this.addDwMappingItem({ col, colIndex })
    },
    addDwMappingItem ({ col, colIndex }) {
      this.dwMapping.forEach(dwMapping => {
        if (!dwMapping.children) {
          dwMapping.children = []
        }
        let seed = this.deliverNum.seed++
        dwMapping.children.push({
          objectClass: 'Datablau.LDM.DWMappingItem',
          properties: {
            ChildKeyRef: col.elementId,
            Id: seed,
            MappingExpression: '',
            ModelRef: null,
            ModelSourcePath: '',
            Name: `DWMappingItem_${seed}`,
            ParentEntityRef: null,
            ParentKeyRef: null,
            SourceModelName: '',
            SourceTableName: '',
            TypeId: LDMTypes.DWMappingItem,
            UniqueId: uuidv4()
            // colCnName: col.cnName,
            // colDataType: col.dataType,
            // colName: col.name,
            // notNull: col.notNull,
            // primaryKey: this.pkSelection[colIndex]
          }
        })
      })
    },
    getMaxId (cols) {
      return Math.max(...cols.map(v => {
        if (v.properties.deleted) {
          return 0
        }
        let arr = v.properties.Name.split('_')
        let num = parseInt(arr[arr.length - 1])
        return isNaN(num) ? 0 : num
      }))
    },
    addDwMapping () {
      let maxId = this.getMaxId(this.dwMapping)
      maxId = isNaN(maxId) || maxId === -Infinity ? 0 : maxId
      let item = {
        children: [],
        objectClass: 'Datablau.LDM.EntityDWMapping',
        properties: {
          DataSources: '',
          Definition: '',
          Id: this.deliverNum.seed++,
          Name: `Mapping_${++maxId}`,
          TypeId: LDMTypes.DWMapping,
          UniqueId: uuidv4(),
          IsKeep: !this.dwMapping.filter(item => !item.properties.deleted).length,
          new: true
        }
      }
      item.children = this.allCols.map((col, colIndex) => {
        if (col.deleted) {
          return null
        } else {
          let seed = this.deliverNum.seed++
          return {
            objectClass: 'Datablau.LDM.DWMappingItem',
            properties: {
              ChildKeyRef: col.elementId,
              Id: seed,
              MappingExpression: '',
              ModelRef: null,
              ModelSourcePath: '',
              Name: `DWMappingItem_${seed}`,
              ParentEntityRef: null,
              ParentKeyRef: null,
              SourceModelName: '',
              SourceTableName: '',
              TypeId: LDMTypes.DWMappingItem,
              UniqueId: uuidv4()
              // colCnName: col.cnName,
              // colDataType: col.dataType,
              // colName: col.name,
              // notNull: col.notNull,
              // primaryKey: this.pkSelection[colIndex]
            }
          }
        }
      }).filter(item => item)
      this.dwMapping.push(item)
      clearTimeout(this.scrollTimer)
      this.scrollTimer = setTimeout(() => {
        this.$nextTick(() => {
          $('.table-mapping.mapping-item .el-table__body-wrapper').scrollTop(10000000)
        })
      }, 100)
      if (!this.currentRowKey) {
        this.changeRadioSelect()
      }
    },
    deleteDwMapping (item) {
      this.$set(item.properties, 'deleted', true)
      this.changeRadioSelect()
    },
    tableRowClassName (scope) {
      if (scope.row.properties.deleted) {
        return 'hide-row'
      } else {
        return ''
      }
    },
    initDwMapping () {
      this.dwMapping = _.cloneDeep(this.dwMappingOrigin)
      this.currentColumn = null
      this.currentTreeData = null
      let modelMap = new Map()
      this.treeData = []
      this.dwMapping.forEach(mapping => {
        mapping.children?.forEach(item => {
          // let colIndex = this.allCols.findIndex(col => col.elementId === item.properties.ChildKeyRef)
          // let col = this.allCols[colIndex]
          // if (col) {
          //   this.$set(item.properties, 'colName', col.name)
          //   this.$set(item.properties, 'colCnName', col.cnName)
          //   this.$set(item.properties, 'colDataType', col.dataType)
          //   this.$set(item.properties, 'notNull', col.notNull)
          //   this.$set(item.properties, 'primaryKey', this.pkSelection[colIndex])
          // }
          if (item.properties.ModelRef && item.properties.ParentEntityRef && item.properties.ParentKeyRef) {
            let reg = new RegExp('^(\\S+).' + item.properties.SourceTableName)
            let res = item.properties.MappingExpression.match(reg)
            let schemaName = ''
            if (res) {
              schemaName = res[1]
            }
            if (modelMap.has(item.properties.ModelRef)) {
              let model = modelMap.get(item.properties.ModelRef)
              if (!model.children.find(table => table.id === item.properties.ParentEntityRef)) {
                model.children.push({
                  tableName: item.properties.SourceTableName,
                  name: schemaName ? schemaName + '.' + item.properties.SourceTableName : item.properties.SourceTableName,
                  id: item.properties.ParentEntityRef,
                  parentId: item.properties.ModelRef,
                  leaf: false
                })
              }
            } else {
              let model = {
                id: item.properties.ModelRef,
                name: item.properties.SourceModelName.slice(0, -4),
                leaf: false,
                children: [{
                  tableName: item.properties.SourceTableName,
                  name: schemaName ? schemaName + '.' + item.properties.SourceTableName : item.properties.SourceTableName,
                  id: item.properties.ParentEntityRef,
                  parentId: item.properties.ModelRef,
                  leaf: false
                }]
              }
              this.treeData.push(model)
              modelMap.set(item.properties.ModelRef, model)
            }
          }
        })
      })
      this.dwMappingBak = _.cloneDeep(this.dwMapping)
      if (this.dwMapping[0]) {
        this.singleDefaultSelect = this.dwMapping[0].properties.Id
        this.currentRowKey = this.dwMapping[0].properties.Id
        this.selectRow = this.dwMapping[0]
        if (this.selectRow.children?.length) {
          this.currentColumnRowKey = this.selectRow.children[0].properties.Id
          this.currentColumn = this.selectRow.children[0]
        }
        this.tableKey++
        this.contentKey++
      }
    },
    changeRadioSelect (row) {
      if (!row) {
        row = this.dwMapping.find(item => !item.properties.deleted)
      }
      if (row) {
        this.$refs.dwTable.scopeRadio = row.properties.Id
        this.selectRow = row
        this.currentRowKey = row.properties.Id
        if (this.selectRow.children?.length) {
          this.currentColumnRowKey = this.selectRow.children[0].properties.Id
          this.currentColumn = this.selectRow.children[0]
        }
      } else {
        this.selectRow = {
          children: []
        }
        this.currentRowKey = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .right-content-wrapper {
    display: inline-block;
    vertical-align: top;
    width: 320px;
    height: 100%;
    overflow: auto;
    position: relative;
    /deep/ .tree-icon {
      width: 24px!important;
      height: 24px;
    }
    .grey-tree {
      position: absolute;
      top: 25px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
    }
  }
  .middle-content-wrapper {
    display: inline-flex;
    width: 172px;
    align-items: center;
    justify-content: center;
    height: 100%;
    ul {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    li {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      cursor: pointer;
      width: 96px;
      height: 96px;
      &:hover .img-wrapper {
        border-radius: 50%;
        background: rgba(64,158,255,0.1);
      }
      .img-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
      }
      img {
        width: 24px;
        height: 24px;
      }
      h2 {
        margin-top: 5px;
        font-size: 14px;
        font-weight: normal;
        color: #555;
      }
    }
  }
  .content-wrapper {
    display: flex;
    .table-panel {
      width: 500px;
      flex: 1 1 auto;
      position: relative;
      .db-table {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        overflow: auto;
      }
    }
    .mapping-operation-panel {
      flex: 0 0 auto;
    }
  }
  .input-wrapper {
    display: block;
  }
  h2.title-hint {
    &:before {
      display: inline-block;
      margin-right: 6px;
      content: '';
      width: 4px;
      height: 14px;
      background: #409EFF;
      border-radius: 1px;
      vertical-align: text-bottom;
    }
    font-size: 14px;
    line-height: 18px;
    color: #555;
    &.title-hint2{
      color: #BBBBBB;
    }
  }
.dw-mapping-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  .table-mapping {
    height: 200px;
    overflow: auto;
    flex: 0 0 auto;
    position: relative;
    .content-wrapper {
      position: absolute;
      top: 37px;
      left: 0;
      right: 0;
      bottom: 0;
      .db-table {
        width: 100%;
        /deep/ .el-table__fixed-right::before {
          display: none;
        }
      }
    }
  }
  .column-mapping {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    overflow: auto;
    .title-wrapper {
      flex: 0 0 auto;
    }
    .content-wrapper {
      flex: 1 1 auto;
      overflow: hidden;
      margin-bottom: 20px;
    }
  }
}
/deep/ .hide-row {
  display: none;
}
/*.mapping-item h2 {
  display: inline-block;
  font-size: 14px;
  padding: 5px;
  line-height: 1;
  background: #ddd;
}*/
</style>
<style lang="scss">
  .el-table.datablau-table tr.current-row + tr td {
    border-color: #EBEEF5;
    border-top-color: #EBEEF5;
  }
  .dwTable2{
    .el-table.datablau-table tr.current-row td {
      border-color: #646464;
      border-top-color: #646464;
    }
  }
  .checkboxDataWareHouse{
    .el-checkbox__input.is-disabled .el-checkbox__inner{
      background-color:#666666
    }
  }
</style>
