<template>
  <div id="table-list" v-loading="diagramsLoading || tableLoading" >
    <check-in-version
      :dialog-visible="checkInVersionDialogVisible"
      @close="checkInVersionDialogVisible=false"
      @save="save"
    ></check-in-version>
    <datablau-dialog
      title="映射建表"
      :visible.sync="mapTableModal"
      :append-to-body="true"
      width="800px"
      height="500px"
      class="edit-map-table"
      :close-on-click-modal="false"
    >
      <map-table-selector v-if="mapTableModal" @paginationKeyRefresh="paginationKeyRefresh" :isConceptual="isConceptual" :isLogicalModel="isLogicalModel" ref="mapTableSelectorRef"></map-table-selector>
      <div slot="footer">
        <datablau-pagination
          v-if="mapTableModal"
          :key="paginationKey"
          style="float: left"
          @size-change="$refs.mapTableSelectorRef && $refs.mapTableSelectorRef.handleSizeChange"
          @current-change="$refs.mapTableSelectorRef && $refs.mapTableSelectorRef.handleCurrentChange"
          :current-page="$refs.mapTableSelectorRef && $refs.mapTableSelectorRef.currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="$refs.mapTableSelectorRef && $refs.mapTableSelectorRef.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="$refs.mapTableSelectorRef && $refs.mapTableSelectorRef.total"
        ></datablau-pagination>
        <datablau-button @click="mapTableModal = false" type="secondary" size="mini">
          取消
        </datablau-button>
        <datablau-button type="primary" size="mini" @click="handleMapTable">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <div style="position:absolute;right:0;left:0;top:2px;height:60px;line-height:60px;margin-left:20px;margin-right:20px;font-size:12px">
      <!-- <span style="font-size:14px;font-weight:bold;display:inline-block;"><i class="tree-icon diagram"></i>{{currentName}}</span> -->
      <!-- <span v-if="currentModel.dwModel" style="font-size:14px;font-weight:bold;display:block;">{{currentName}}</span> -->

      <datablau-input
        style="width:240px;margin-right:2em;"
        :iconfont-state="true"
        v-model="keyword"
        :placeholder="$store.state.$v.dataEntity.enterKeywords"
        size="small"
      ></datablau-input>
      <!-- <span v-if="!isConceptual" style="margin-right: 14px;">{{$store.state.$v.dataEntity.type}}</span> -->
      <datablau-checkbox style="display: inline-block;font-size: 12px;margin-right: 2em" v-model="typeFilter">
        <el-checkbox v-if="!isConceptual" label="Entity">{{isLogicalModel ? $store.state.$v.dataEntity.entity : $store.state.$v.report.table}}</el-checkbox>
        <el-checkbox v-if="isLogicalModel || isConceptual" label="BusinessObject">{{$store.state.$v.dataEntity.business}}</el-checkbox>
        <el-checkbox v-if="!isLogicalModel && !isConceptual && !isCassandraOrMongoDB" label="View">{{$store.state.$v.dataEntity.view}}</el-checkbox>
      </datablau-checkbox>
      <div style="float: right;">
        <!-- <datablau-button
          class="iconfont icon-copy"
          type="important"
          @click="copyTable"
          :disabled="selectCopyTableList.length === 0"
        >
          复制表
        </datablau-button>
        <datablau-button
          class="iconfont icon-Moveto"
          type="important"
          @click="pasteTable"
        >
          粘贴表
        </datablau-button> -->
        <datablau-button
          class="iconfont icon-SQL"
          type="important"
          @click="sqlCreateTable"
          v-if="currentModel.modelType  === 'MySQL' || currentModel.modelType  === 'Oracle' || currentModel.modelType  === 'Hive' || currentModel.modelType  === 'DB2LUW'"
        >
          SQL建表
        </datablau-button>
        <!-- <datablau-button
          v-show="writable && !isConceptual && from !== 'graph'"
          class="iconfont icon-tianjia"
          type="important"
          @click="mapTable"
        >
          映射建表
        </datablau-button> -->
        <!-- <datablau-button
          v-show="writable && !isConceptual && from !== 'graph'"
          class="iconfont icon-tianjia"
          type="important"
          @click="addTable"
        >
          {{(isConceptual || isLogicalModel) ? $store.state.$v.dataEntity.addEntity : $store.state.$v.dataEntity.addTable }}
        </datablau-button> -->
      </div>
    </div>
    <div class="table-content" style="position:absolute;top:65px;bottom:40px;left:0;right:0;padding-left:20px;padding-right:20px;">
<!--      <div class="title">描述</div>-->
<!--      <div class="description">暂无描述</div>-->
<!--      <div class="title">包含表</div>-->
      <datablau-table
        class="datablau-table"
        :data="currentPageData"
        height="98%"
        @sort-change="handleSortChange"
        :data-selectable="true"
        @selection-change="handleSelectionChangeTable"
      >
        <el-table-column width="30">
          <template slot-scope="scope">
            <img style="
                width:20px;
                height:20px;
                position: relative;
                bottom: 2px;"
                :src="scope.row.isView ? viewImg : scope.row.TypeId === 80100073 ? businessImg : tableImg"
                class="table-img"
            >
          </template>
        </el-table-column>
        <el-table-column
          :label="(isConceptual || isLogicalModel) ? $store.state.$v.dataEntity.entityOrViewName : $store.state.$v.dataEntity.tableOrViewName"
          prop="Name"
          min-width="140"
          sortable="custom"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="link-text">{{scope.row.Name}}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="150" sortable="custom" prop="LogicalName" :label="$store.state.$v.dataEntity.alias"  show-overflow-tooltip></el-table-column>
        <el-table-column
          min-width="240"
          :label="$store.state.$v.dataEntity.definition"
          prop="Definition"
          :show-overflow-tooltip="true"
        >
        </el-table-column>
        <el-table-column
          v-if="isLogicalModel"
          min-width="120"
          prop="IsLogicalOnly"
          :label="$store.state.$v.dataEntity.logicalOnly">
          <template slot-scope="scope">
            <datablau-checkbox style="margin-left:12px" :disabled="true" @click.stop.native="" v-model="trueVal" :checkboxType="'single'" v-if="scope.row.IsLogicalOnly"></datablau-checkbox>
          </template>
        </el-table-column>
        <el-table-column
          v-else
          prop="IsPhysicalOnly"
          min-width="120"
          :label="$store.state.$v.dataEntity.physicalOnly">
          <template slot-scope="scope">
            <datablau-checkbox style="margin-left:12px" :disabled="true" @click.stop.native="" v-model="trueVal" :checkboxType="'single'" v-if="scope.row.IsPhysicalOnly"></datablau-checkbox>
          </template>
        </el-table-column>
        <el-table-column  width="160" sortable="custom" prop="ColumnOrderArrayRefs" :label="isLogicalModel ? $store.state.$v.dataEntity.columnCount1 : $store.state.$v.dataEntity.columnCount" show-overflow-tooltip >
          <template slot-scope="scope">
            <span class="num-circle"  v-if="scope.row.ColumnOrderArrayRefs">{{scope.row.ColumnOrderArrayRefs.length}}</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column
          min-width="120"
          v-for="(udpList, index) in udpListfilteredArray"
          :key="index"
          :label="udpList.FriendlyName">
          <template slot-scope="scope">
            <span v-if="udpList.ExtendedEnumStruct">
              {{getudpValue(udpList.ExtendedEnumStruct, scope.row[udpList.Id]) }}
            </span>
            <span v-else>{{scope.row[udpList.Id]}}</span>

          </template>
        </el-table-column>
        <el-table-column
          width="160"
          align="center"
          :label="$store.state.$v.dataEntity.Operation"
           fixed="right"
        >
          <template slot-scope="scope">
            <!-- <el-button v-if="!scope.row.isView" type="text" @click.stop="onRowEditClick(scope.row)">
              {{ $store.state.$v.dataEntity.edit }}
            </el-button> -->
            <datablau-button
                  type="text"
                  @click.stop="onRowClick(scope.row)"
                >
                  <datablau-tooltip
                    effect="dark"
                    content="查看"
                    placement="bottom"
                  >
                    <i class="iconfont icon-see"></i>
                  </datablau-tooltip>
            </datablau-button>
              <datablau-button
                  v-if="writable"
                  type="text"
                  @click.stop="onRowEditClick(scope.row)"
                >
                  <datablau-tooltip
                    effect="dark"
                    :content="$store.state.$v.dataEntity.edit"
                    placement="bottom"
                  >
                    <i class="iconfont icon-bianji"></i>
                  </datablau-tooltip>
            </datablau-button>
            <!-- <el-button v-if="!scope.row.isView" type="text" @click.stop="onRowDeleteClick(scope.row)">
              {{ $store.state.$v.dataEntity.delete }}
            </el-button> -->
            <datablau-button
                  v-if="writable"
                  type="text"
                  @click.stop="onRowDeleteClick(scope.row)"
                  style="margin-left:0"
                >
                  <datablau-tooltip
                    effect="dark"
                    :content="$store.state.$v.dataEntity.delete"
                    placement="bottom"
                  >
                    <i class="iconfont icon-delete"></i>
                  </datablau-tooltip>
            </datablau-button>
            <!-- <el-button v-if="!scope.row.isView && $store.state.lic.archy" type="text" @click.stop="checkLineage(scope.row)">
              血缘
            </el-button> -->
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="page-container">
      <datablau-pagination
        layout="total, sizes, prev, pager, next"
        :total="total"
        :page-size.sync="pageSize"
        :page-sizes="[20, 50, 100]"
        :current-page.sync="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></datablau-pagination>
    </div>
    <datablau-dialog
      title="SQL建表"
      :visible.sync="sqlCreateTableVisible"
      :append-to-body="true"
      size="s"
      height="300px"
      class="edit-map-table"
      :close-on-click-modal="false"
    >
    <datablau-input
      style="width: 500px"
      v-model="sqlValue"
      placeholder="请输入SQL"
      :autosize="{minRows: 6, maxRows: 6}"
      type="textarea"
    ></datablau-input>
      <div slot="footer">
        <datablau-button @click="sqlCreateClose" type="secondary" size="mini">
          取消
        </datablau-button>
        <datablau-button type="primary" size="mini" :loading="sqlCreateLoading" @click="sqlCreateTableCreate" :disabled="sqlValue === ''">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
// import datablauChecked from './datablauChecked'
import $version from '@/resource/version.json'
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
import _ from 'lodash'
import LDMTypes from '@constant/LDMTypes'
import mapTableSelector from '@/views/list/tables/mapTableSelector.vue'
import checkInVersion from '@/views/list/tables/CheckInVersion.vue'

export default {
  components: { checkInVersion, mapTableSelector },
  props: ['currentName', 'dataByType', 'currentId', 'currentModel', 'isLogicalModel', 'isConceptual', 'diagramsLoading', 'isCassandraOrMongoDB', 'from'],
  data () {
    return {
      mapTableObj: {
        modelId: '',
        tableIds: []
      },
      checkInVersionDialogVisible: false,
      paginationKey: 0,
      mapTableModal: false,
      tableLoading: false,
      tableImg: require('@/assets/images/mxgraphEdit/Table.svg'),
      viewImg: require('@/assets/images/panedetail_icon/view.svg'),
      businessImg: require('@/assets/images/mxgraphEdit/Business.svg'),
      trueVal: true,
      keyword: '',
      diagramData: [],
      sortedData: [],
      filteredData: [],
      currentPageData: [],
      total: 0,
      pageSize: 20,
      currentPage: 1,
      writable: this.$store.state.lic.editor && (this.$store.state.user.isAdmin || this.currentModel.permission?.editor),
      // admin: this.currentModel.permission && this.currentModel.permission.admin,
      // typeFilter: this.isConceptual ? ['BusinessObject'] : this.isLogicalModel ? ['Entity', 'BusinessObject'] : ['Entity']
      typeFilter: this.isConceptual ? ['BusinessObject'] : this.isLogicalModel ? ['Entity', 'BusinessObject'] : ['Entity'],
      layerTreekeyword: '',
      layerdefaultProps: {
        children: 'children',
        label: 'name',
        value: 'id'
      },
      layerdefaultExpandedKeys: [0],
      udpListfilteredArray: [],
      layertreeData: [],
      themetreeData: [],
      treeClickDataId: 0,
      selectCopyTableList: [],
      sqlCreateTableVisible: false,
      sqlValue: '',
      sqlCreateLoading: false
    }
  },
  beforeMount () {
    this.$version = $version
    this.openDefaultItem()
  },
  mounted () {
    const mounted = () => {
      if (this.currentId) {
        this.prepareData()
      } else {
        this.prepareWholeData()
      }
      this.filterData()
    }
    mounted()
    this.$bus.$on('appendTableToList', table => {
      this.diagramData.push(table.properties)
      this.handleSortChange({})
      this.filterData()
    })
    this.$bus.$on('updateTableToList', () => {
      setTimeout(() => {
        mounted()
      })
    })
    this.$bus.$on('onlyShowView', () => {
      this.typeFilter = ['View']
    })
    setTimeout(() => {
      this.writable = this.$store.state.lic.editor && (this.$store.state.user.isAdmin || this.currentModel.permission?.editor)
    })
    let self = this
    window.addEventListener('pagehide', (event) => {
      if (this.$store.state.lic.editor && this.$store.state.isEditing) {
        let tenantId = localStorage.getItem('tenantId')
        if (tenantId) {
          navigator.sendBeacon(`${self.$url}/service/editor/${self.currentModel.id}/unlock?tenantId=${tenantId}`)
        } else {
          navigator.sendBeacon(`${self.$url}/service/editor/${self.currentModel.id}/unlock`)
        }
      }
    }, { capture: true })
    window.addEventListener('unload', (event) => {
      if (this.$store.state.lic.editor && this.$store.state.isEditing) {
        let tenantId = localStorage.getItem('tenantId')
        if (tenantId) {
          navigator.sendBeacon(`${self.$url}/service/editor/${self.currentModel.id}/unlock?tenantId=${tenantId}`)
        } else {
          navigator.sendBeacon(`${self.$url}/service/editor/${self.currentModel.id}/unlock`)
        }
        this.$http.post(`${self.$url}/service/editor/${self.currentModel.id}/unlock`).then(res => {

        }).catch((err) => {
          this.$showFailure(err)
        })
      }
    }, { capture: true })
    if (this.isView) {
      this.typeFilter = ['View']
    }
  },
  beforeDestroy () {
    this.$bus.$off('appendTableToList')
    this.$bus.$off('updateTableToList')
    this.$bus.$off('onlyShowView')
  },
  computed: {
  },
  methods: {
    sqlCreateClose () {
      this.sqlCreateTableVisible = false
      this.sqlValue = ''
    },
    sqlCreateTable () {
      this.sqlCreateTableVisible = true
    },
    sqlCreateTableCreate () {
      if (this.sqlCreateLoading) return
      this.sqlCreateLoading = true
      this.$http
        .post(`${this.$url}/models/${this.currentModel.id}/create/table/sql`, { sql: this.sqlValue })
        .then(res => {
          this.sqlCreateTableVisible = false
          this.sqlValue = ''
          this.addTable('sql', res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.sqlCreateLoading = false
        })
    },
    pasteTable () {
      if (localStorage.getItem('mapTableObj') === '{}' || !localStorage.getItem('mapTableObj')) {
        return
      }
      let mapTableObj = JSON.parse(localStorage.getItem('mapTableObj'))
      let numberLenght = 0
      if (this.currentModel.modelType === 'Conceptual') {
        if (mapTableObj.Conceptual) {
          numberLenght = mapTableObj.Conceptual.tableIds.length
          this.mapTableObj.tableIds = mapTableObj.Conceptual.tableIds
        } else if (mapTableObj.Logical) {
          numberLenght = mapTableObj.Logical.businessObject.length
          this.mapTableObj.tableIds = mapTableObj.Logical.businessObject
        }
      } else if (this.currentModel.modelType === 'Logical') {
        if (mapTableObj.Logical) {
          numberLenght = mapTableObj.Logical.tableIds.length
          this.mapTableObj.tableIds = mapTableObj.Logical.tableIds
        } else if (mapTableObj.Other) {
          numberLenght = mapTableObj.Other.tableIdsTable.length
          this.mapTableObj.tableIds = mapTableObj.Other.tableIdsTable
        } else if (mapTableObj.Conceptual) {
          numberLenght = mapTableObj.Conceptual.tableIds.length
          this.mapTableObj.tableIds = mapTableObj.Conceptual.tableIds
        }
      } else {
        if (mapTableObj.Logical) {
          numberLenght = mapTableObj.Logical.tableIdsTable.length
          this.mapTableObj.tableIds = mapTableObj.Logical.tableIdsTable
        } else if (mapTableObj.Other) {
          numberLenght = mapTableObj.Other.tableIds.length
          this.mapTableObj.tableIds = mapTableObj.Other.tableIds
        }
      }
      if (numberLenght === 0) return
      this.$confirm(`确定将${mapTableObj.modelIdName}模型的${numberLenght}张表粘贴到当前模型下吗？`, '提示', {
        type: 'warning',
        confirmButtonText: this.$store.state.$v.modelDetail.ok,
        cancelButtonText: this.$store.state.$v.modelDetail.cancel
      }).then(() => {
        this.mapTableObj.modelId = mapTableObj.modelId
        this.mapTableObj.dataSourceColumnTypeMapping = mapTableObj.dataSourceColumnTypeMapping
        // this.mapTableObj.tableIds = mapTableObj.tableIds
        this.checkInVersionDialogVisible = true
      }).catch(() => {
        this.$message.info(this.$store.state.$v.modelDetail.operationCancel)
      })
    },
    copyTable () {
      if (this.currentModel.modelType === 'Conceptual') {
        this.mapTableObj.Conceptual = {
          tableIds: this.selectCopyTableList.map(item => item.Id)
        }
      } else if (this.currentModel.modelType === 'Logical') {
        this.mapTableObj.Logical = {
          tableIdsTable: [],
          businessObject: [],
          tableIds: this.selectCopyTableList.map(item => item.Id)
        }
        this.selectCopyTableList.forEach(element => {
          if (element.TypeId === 80000004) {
            this.mapTableObj.Logical.tableIdsTable.push(element.Id)
          } else {
            this.mapTableObj.Logical.businessObject.push(element.Id)
          }
        })
      } else {
        this.mapTableObj.Other = {
          tableIdsTable: [],
          tableIdsView: [],
          tableIds: this.selectCopyTableList.map(item => item.Id)
        }
        this.selectCopyTableList.forEach(element => {
          if (element.TypeId === 80000004) {
            this.mapTableObj.Other.tableIdsTable.push(element.Id)
          } else {
            this.mapTableObj.Other.tableIdsView.push(element.Id)
          }
        })
      }
      this.mapTableObj.modelId = this.currentModel.id
      this.mapTableObj.modelIdName = this.currentModel.Name
      this.mapTableObj.dataSourceColumnTypeMapping = this.currentModel.dataSourceColumnTypeMapping
      // this.mapTableObj.tableIds = this.selectCopyTableList.map(item => item.Id)
      localStorage.setItem('mapTableObj', JSON.stringify(this.mapTableObj))
      this.$blauShowSuccess('复制成功')
    },
    handleSelectionChangeTable (row) {
      this.selectCopyTableList = row
    },
    getudpValue (data, id) {
      if (id) {
        let arr = []
        let idName = id.split(',')
        JSON.parse(data).forEach(element => {
          idName.forEach(ele => {
            if (ele === element.i) {
              arr.push(element.n)
            }
          })
        })
        return arr.join(',')
      }
    },
    findNodeById (data, id) {
      for (let i = 0; i < data.length; i++) {
        let node = data[i]
        if (node.id === id) {
          return node
        }
        if (node.children && node.children.length > 0) {
          let result = this.findNodeById(node.children, id)
          if (result) {
            return result
          }
        }
      }
      return null
    },
    getThemetreeData () {
      this.$http
        .get(`${this.$url}/subject/tree`)
        .then(res => {
          this.themetreeData = [res.data]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getLayertreeData () {
      this.$http
        .get(`${this.$url}/layer/tree`)
        .then(res => {
          this.layertreeData = [res.data]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    treeClickData (data) {
      console.log(data, 'data')
      this.treeClickDataId = data.id
      this.filterData()
    },
    save (request) {
      HTTP.getElementsContent({ modelId: this.mapTableObj.modelId,
        elementIds: this.mapTableObj.tableIds,
        longkey: false,
        successCallback: data => {
          this.$bus.$emit('handleMapTableSaveInModelGraphEdit', data, request, this.mapTableObj.dataSourceColumnTypeMapping)
        } })
    },
    handleMapTable () {
      this.mapTableObj.modelId = this.$refs.mapTableSelectorRef.currentModel.id
      this.mapTableObj.tableIds = this.$refs.mapTableSelectorRef.selectedData.map(item => item.Id)
      this.mapTableModal = false
      this.checkInVersionDialogVisible = true
    },
    paginationKeyRefresh () {
      this.paginationKey++
    },
    updateTableData (table) {
      const properties = ['Name', 'LogicalName', 'Definition', 'IsLogicalOnly', 'IsPhysicalOnly', 'ColumnOrderArrayRefs']
      this.diagramData.forEach(item => {
        if (item.Id === table.properties.Id) {
          properties.forEach(p => {
            item[p] = table.properties[p]
          })
        }
      })
      this.currentPageData.forEach(item => {
        if (item.Id === table.properties.Id) {
          properties.forEach(p => {
            item[p] = table.properties[p]
          })
        }
      })
    },
    prepareData () {
      if (this.diagramData === undefined) {
        this.diagramData = []
      }
      let data = {
        id: this.currentId
      }
      if (!this.dataByType.diagram[data.id].children) {
        this.dataByType.diagram[data.id].children = []
      }
      this.diagramData.length = 0
      this.dataByType.diagram[data.id].children.forEach(entity => {
        if (entity.properties.TypeId === 80000008 || entity.properties.TypeId === 80100073) {
          let table = this.dataByType.table[entity.properties.OwneeRef]
          if (table) {
            table.properties.columnCal = this.countColumns(table)
            this.diagramData.push(table.properties)
          } else {
            let view = this.dataByType.view[entity.properties.OwneeRef]
            if (view) {
              view.properties.isView = true
              this.diagramData.push(view.properties)
            }
          }
        }
      })

      this.handleSortChange({})
    },
    getTablesRelation () {
      this.$http
        .get(`${this.$url}/models/${this.currentModel.id}/dw/tables/relation`)
        .then(res => {
          // this.diagramData.forEach(element => {
          //   res.data.forEach(ele => {
          //     if (ele.tableId === element.Id) {
          //       if (ele.themeId) {
          //         this.$set(element, 'Theme', this.findNodeById(this.themetreeData, ele.themeId)?.name)
          //       }
          //       if (ele.layerId) {
          //         this.$set(element, 'Layer', this.findNodeById(this.layertreeData, ele.layerId)?.name)
          //         this.$set(element, 'LayerId', ele.layerId)
          //       }
          //     }
          //   })
          // })
          console.log(this.diagramData, 'this.diagramData00000')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    prepareWholeData () {
      // if (this.currentModel.dwModel) {
      //   this.getLayertreeData()
      //   this.getThemetreeData()
      //   this.getTablesRelation()
      // }
      if (this.diagramData === undefined) {
        this.diagramData = []
      }
      this.udpListfilteredArray = []
      this.diagramData.length = 0
      const tablesKey = Object.keys(this.dataByType.table)
      tablesKey.forEach(key => {
        const table = this.dataByType.table[key]
        table.properties.columnCal = this.countColumns(table)
        this.diagramData.push(table.properties)
      })
      const viewsKey = Object.keys(this.dataByType.view)
      viewsKey.forEach(key => {
        const view = this.dataByType.view[key]
        view.properties.isView = true
        this.diagramData.push(view.properties)
      })
      this.dataByType.udp.forEach((value, key) => {
        if (value.entityType === 80000004) {
          this.udpListfilteredArray.push(value)
        }
      })
      this.handleSortChange({})
    },
    handleSortChange ({ column, prop, order }) {
      this.sortedData = _.clone(this.diagramData).filter(item => !item.new) // 过滤掉new的原因是防止新建表，然后取消有脏数据
      if (order) {
        sort.sortConsiderChineseNumber(this.sortedData, prop, order)
      } else {
      }
      this.currentPage = 1
      this.filterData()
    },
    filterData () {
      if (this.typeFilter && this.typeFilter.length > 0) {
        this.sortedData = this.sortedData.filter((item) => this.typeFilter.includes(LDMTypes[item.TypeId]))
      }
      if (!this.keyword) {
        this.filteredData = this.sortedData
        // if (this.currentModel.dwModel) {
        //   if (this.treeClickDataId === 0) {
        //     this.filteredData = this.sortedData
        //   } else {
        //     let filteredData = []
        //     console.log(this.sortedData, 'this.sortedData')
        //     this.sortedData.forEach(item => {
        //       console.log(item, '0000', this.treeClickDataId)
        //       if (item.Layer === this.treeClickDataId) {
        //         filteredData.push(item)
        //       }
        //     })
        //     this.filteredData = filteredData
        //   }
        // } else {
        //   this.filteredData = this.sortedData
        // }
      } else {
        const keyword = this.keyword.toLowerCase()
        let filteredData = []
        this.sortedData.forEach(item => {
          if ((item.LogicalName && item.LogicalName.toLowerCase().includes(keyword)) || (item.Name && item.Name.toLowerCase().includes(keyword)) || (item.Definition && item.Definition.toLowerCase().includes(keyword))) {
            filteredData.push(item)
          }
        })
        this.filteredData = filteredData
      }
      this.filterCurrentPageData()
    },
    filterCurrentPageData () {
      this.total = this.filteredData.length
      this.currentPageData = this.filteredData.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
    countColumns (table) {
      let columnCal = 0
      if (table.children && Array.isArray(table.children)) {
        table.children.forEach(col => {
          if (col && col.properties && col.properties.TypeId === 80000005) {
            columnCal++
          }
        })
      }
      return columnCal
    },
    onRowClick (row) {
      this.$store.commit('setTableId', row.Id)
      // if (row.isView) {
      //   this.$emit('showViewDetail', row.Id)
      // } else {
      //   this.$emit('handleDialogData', row.Id)
      // }
      this.$emit('handleDialogData', row.Id, row.isView)
    },
    onRowEditClick (row) {
      if (this.$store.state.lic.editor) {
        this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/lock`).then(res => {
          if (res.data) {
            this.$store.commit('setEditStatus', true)
            this.$store.commit('setTableId', row.Id)
            this.$emit('handleDialogDataEdit', row.Id, row.isView)
          } else {
            this.$message.error('模型尝试加锁失败，请重试')
          }
        }).catch(err => {
          this.$showFailure(err)
        })
      } else {
        this.$store.commit('setTableId', row.Id)
        this.$emit('handleDialogDataEdit', row.Id, row.isView)
      }
    },
    onRowDeleteClick (row) {
      this.$confirm(`${this.$store.state.$v.modelDetail.sureDelete + row.Name + this.$store.state.$v.modelDetail.ma}`, '', {
        type: 'warning',
        confirmButtonText: this.$store.state.$v.modelDetail.ok,
        cancelButtonText: this.$store.state.$v.modelDetail.cancel
      }).then(() => {
        this.tableLoading = true
        HTTP.deleteTableOfModel({
          modelId: this.currentModel.id,
          tableId: row.Id,
          modelVersion: this.currentModel.currentVersion,
          successCallback: data => {
            this.diagramData.forEach((item, index) => {
              if (item.Id === row.Id) {
                this.diagramData.splice(index, 1)
              }
            })
            this.handleSortChange({})
            this.filterData()
            this.$emit('updateVersion', data.currentVersion)
            this.$bus.$emit('update-model')
            this.$datablauMessage.success('删除成功！')
          },
          failureCallback: () => {

          },
          finallyCallback: () => {
            this.tableLoading = false
          }
        })
      }).catch(() => {
        this.$message.info(this.$store.state.$v.modelDetail.operationCancel)
      })
    },
    checkLineage (row) {
      console.log(row, 'row')
      HTTP.skip2('modelLineage', { entityid: row.Id, entityname: row.Name, modelid: this.currentModel.id })
    },
    openDefaultItem () {
      if (this.$route.query.objectType) {
        switch (this.$route.query.objectType) {
          case 'table':
            this.$emit('handleDialogData', this.$route.query.objectId)
            break
          case 'view':
            this.$emit('showViewDetail', this.$route.query.objectId)
            break
          default:
            break
        }
      } else if (this.$route.query.typeId) {
        const typeId = String(this.$route.query.typeId)
        const elementId = String(this.$route.query.elementId)
        const parentId = String(this.$route.query.parentId)
        setTimeout(() => {
          switch (typeId) {
            case '80000004':
              this.$emit('handleDialogData', this.$route.query.elementId)
              break
            case '80000005':
              this.$emit('handleDialogData', this.$route.query.parentId)
              break
            case '80500008':
              this.$emit('showViewDetail', this.$route.query.elementId)
              break
          }
        })
      }
    },
    addTable (type, sqlObj) {
      this.$http.put(`${this.$url}/service/editor/${this.currentModel.id}/lock`).then(res => {
        if (res.data) {
          this.$store.commit('setEditStatus', true)
          if (type === 'sql') {
            this.$emit('handleDialogData', '', '', sqlObj)
          } else {
            this.$emit('handleDialogData')
          }
        } else {
          this.$message.error('模型尝试加锁失败，请重试')
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    mapTable () {
      this.mapTableModal = true
    },
    handleSizeChange () {
      this.currentPage = 1
      this.filterCurrentPageData()
    },
    handleCurrentChange () {
      this.filterCurrentPageData()
    }
  },
  watch: {
    keyword () {
      this.currentPage = 1
      this.filterData()
    },
    typeFilter: {
      handler (val) {
        this.handleSortChange({})
      },
      deep: true
    }
  }
}
</script>

<style lang='scss' scoped>
  #table-list {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .is-block.text {
    padding: 0;
    margin-right: 10px;
    width: 24px;
  }
  .page-container {
    padding: 10px 20px;
    position: absolute;
    bottom: 0;
    right: 0px;
    left: 0px;
    height: 50px;
    text-align: right;
    font-size: 12px;
    line-height: 16px;
    border-top: 1px solid rgb(221, 221, 221);
  }
  .num-circle {
    margin-left: 8px;
    display: inline-block;
    width: 24px;
    height: 24px;
    border-radius: 12px;
    background: #EFEFEF;
    text-align: center;
  }
  .table-content .datablau-checkbox2 /deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
    background-color: #409eff;
    border-color: #409EFF;
    color: #fff;
    &::after {
      border-color: #fff;
    }
  }
  .datablau-tips {
    color: #999;
  }
  /deep/ .el-tabs__header {
      padding-left: 0;
    }
  .link-text:hover {
    color: #409eff;
  }
  .title {
    font-size: 14px;
    margin-top: 1em;
    margin-bottom: 1em;
    font-weight: bold;
  }
  .description {
    color: #9A9A9A;
    margin-bottom:2em;
  }
  /deep/ .el-checkbox__label {
    font-size: 12px;
  }
</style>
<style lang="scss">
 #table-list {
   .el-table th>.cell {
      height: 100%;
      line-height: 34px;
    }
 }
</style>
