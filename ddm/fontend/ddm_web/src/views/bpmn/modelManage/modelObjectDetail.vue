<template>
  <div class="model-object-detail-wrapper">
    <div class="model-filter-wrapper">
      <datablau-input iconfontState clearable v-model="query" placeholder="搜索名称、ID" @input="searchTableData"></datablau-input>
      <span class="title">对象类型</span>
      <datablau-select clearable class="select-wrapper" v-model="objectTypeValue" multiple @change="changeFilterType">
        <el-option v-for="item in udpType" :label="item.label" :value="item.label2" :key="item.label"></el-option>
      </datablau-select>
    </div>
    <div class="content-flex-wrapper">
      <div class="table-content-wrapper">
        <datablau-form-submit>
          <datablau-table
            ref="tableRef"
            :data="tableShowData"
            singleSelect
            :autoHideSelection="false"
            @current-change="handleTableCurrentChange"
            highlight-current-row
            row-key="properties.BpmnId"
            @row-click="handleTableRowClick"
            height="100%"
          >
            <el-table-column
              show-overflow-tooltip
              label="ID"
              min-width="120"
            >
              <template slot-scope="scope">
                {{scope.row.properties.BpmnId}}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              label="对象名称"
              min-width="180"
            >
              <template slot-scope="scope">
                {{scope.row.properties.Name}}
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              label="对象类型"
            >
              <template slot-scope="scope">
                {{LDMTypes[scope.row.properties.TypeId]}}
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <div class="bottom-pagination-container">
              <datablau-pagination
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                :page-size="pageSize"
                :page-sizes="[20, 50, 100]"
                :current-page.sync="currentPage"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              ></datablau-pagination>
            </div>
          </template>
        </datablau-form-submit>
      </div>
      <div class="edit-panel-wrapper" :style="editModal? '': 'display: none;'" :class="{hide: !editModal}">
        <i class="iconfont icon-false close-btn" @click="togglePanel"></i>
        <div class="edit-detail-wrapper">
          <datablau-form label-width="132px">
            <h2>基本信息</h2>
            <el-form-item prop="name">
              <div slot="label" class="form-item-head">
                <datablau-icon class="icon-item" :data-type="'archyname'" icon-type="svg" :size="24" ></datablau-icon>
                <span class="name">名称</span>
              </div>
              <div>{{itemObject.Name}}</div>
            </el-form-item>
            <el-form-item prop="id">
              <div slot="label" class="form-item-head">
                <datablau-icon class="icon-item" :data-type="'archyid'" icon-type="svg" :size="24" ></datablau-icon>
                <span class="name">ID</span>
              </div>
              <div>{{itemObject.BpmnId}}</div>
            </el-form-item>
            <el-form-item prop="type">
              <div slot="label" class="form-item-head">
                <datablau-icon class="icon-item" :data-type="'archytype'" icon-type="svg" :size="24" ></datablau-icon>
                <span class="name">类型</span>
              </div>
              {{LDMTypes[itemObject.TypeId]}}
            </el-form-item>
            <h2 v-if="LDMTypes[itemObject.TypeId] !== 'SequenceFlow' && LDMTypes[itemObject.TypeId] !== 'Association'">属性信息</h2>
            <template v-if="LDMTypes[itemObject.TypeId] !== 'SequenceFlow' && LDMTypes[itemObject.TypeId] !== 'Association'">
              <el-form-item v-if="LDMTypes[itemObject.TypeId] !== 'DataStoreReference' && LDMTypes[itemObject.TypeId] !== 'DataObjectReference'" prop="model">
                <div slot="label" class="form-item-head">
                  <datablau-icon class="icon-item" :data-type="'modeltype'" icon-type="svg" :size="24" ></datablau-icon>
                  <span class="name">模型</span>
                </div>
                <div>
                  <datablau-button
                    :key="index"
                    v-for="(item, index) in bpmnModelList"
                    type="text"
                    @click="goBPMNModelDetail(item)">
                    {{item.name}}
                  </datablau-button>
                </div>
              </el-form-item>
              <template v-if="LDMTypes[itemObject.TypeId] && LDMTypes[itemObject.TypeId].indexOf('Task') > -1">
                <el-form-item prop="organization">
                  <div slot="label" class="form-item-head">
                    <datablau-icon class="icon-item" :data-type="'zuzhijigou'" icon-type="svg" :size="24" ></datablau-icon>
                    <span class="name">组织机构</span>
                    <datablau-button v-if="isEdit" tooltipContent="添加" type="icon" class="iconfont icon-tianjia add-btn" @click="addStructure"></datablau-button>
                  </div>
                  <div>
                    <datablau-button
                      style="cursor: unset"
                      v-if="structureInfo.fullName"
                      type="text">
                      {{structureInfo.fullName}}
                    </datablau-button>
                  </div>
                </el-form-item>
                <el-form-item prop="role">
                  <div slot="label" class="form-item-head">
                    <datablau-icon class="icon-item" :data-type="'role'" icon-type="svg" :size="24" ></datablau-icon>
                    <span class="name">角色</span>
                  </div>
                  <div v-if="isEdit">
                    <datablau-input style="width: 230px;" v-model="structureInfo.role"></datablau-input>
                  </div>
                  <div v-else>
                    <p>{{structureInfo.role}}</p>
                  </div>
                </el-form-item>
              </template>
              <template v-if="LDMTypes[itemObject.TypeId] && LDMTypes[itemObject.TypeId].indexOf('Task') === -1">
                <div v-for="(item, index) in businessObjectList" :key="index">
                  <el-form-item style="margin-bottom: 0" prop="businessObject" >
                    <div slot="label" class="form-item-head">
                      <datablau-icon class="icon-item" :data-type="'archyobject'" icon-type="svg" :size="24" ></datablau-icon>
                      <span class="name">业务对象{{index+1}}</span>
                    </div>
                    <div>
                      <datablau-button
                        type="text"
                        @click="goBusinessObjectDetail(item)">
                        {{item.name}}
                      </datablau-button>
                    </div>
                  </el-form-item>
                  <el-form-item v-if="isEdit || (item.entityList && item.entityList.length)" prop="entityObject" >
                    <div slot="label" class="form-item-head">
                      <datablau-icon class="icon-item" :data-type="'shiti'" icon-type="svg" :size="24" ></datablau-icon>
                      <span class="name">实体</span>
                    </div>
                    <div>
                      <datablau-button
                        type="text"
                        :key="idx"
                        v-for="(i, idx) in item.entityList"
                        @click="goEntityDetail(i)">
                        {{i.name}}
                      </datablau-button>
                    </div>
                  </el-form-item>
                </div>
                <el-form-item v-if="isEdit || !businessObjectList.length" prop="businessObject" :key="businessObjectList.length">
                  <div slot="label" class="form-item-head">
                    <datablau-icon class="icon-item" :data-type="'archyobject'" icon-type="svg" :size="24" ></datablau-icon>
                    <span class="name">业务对象{{this.businessObjectList.length+1}}</span>
                  </div>
                </el-form-item>
                <el-form-item v-if="businessObjectList.some(item => item.entityList && item.entityList.length)" prop="attribute">
                  <div slot="label" class="form-item-head">
                    <datablau-icon class="icon-item" :data-type="'attribute'" icon-type="svg" :size="24" ></datablau-icon>
                    <span class="name">属性</span>
                  </div>
                  <div v-if="isEdit">
                    <datablau-input clearable style="width: 230px;" v-model="attribute.value"></datablau-input>
                  </div>
                  <div v-else>
                    <p>{{attribute.value}}</p>
                  </div>
                </el-form-item>
              </template>
              <el-form-item v-if="LDMTypes[itemObject.TypeId] === 'DataStoreReference' || LDMTypes[itemObject.TypeId] === 'DataObjectReference'" prop="node">
                <div slot="label" class="form-item-head">
                  <datablau-icon class="icon-item" :data-type="'node'" icon-type="svg" :size="24" ></datablau-icon>
                  <span class="name">结点</span>
                </div>
                <div v-if="isEdit">
                  <datablau-select
                    style="width: 230px;"
                    clearable
                    v-model="node.value">
                    <el-option label="输入" value="input"></el-option>
                    <el-option label="输出" value="output"></el-option>
                  </datablau-select>
                </div>
                <div v-else>
                  <p>{{node.value === 'input' ? '输入' : node.value === 'output' ? '输出' : ''}}</p>
                </div>
              </el-form-item>
            </template>
          </datablau-form>
          <udps-list ref="udpListRef" :isEdit="isEdit" :itemObject="itemObject" v-if="udpArr && udpArr.length" :udpArr="udpArr"></udps-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LDMTypes from '@constant/LDMTypes'
import udpsList from '@/views/bpmn/bpmnModel/udpsList.vue'
import HTTP from '@/resource/http'
export default {
  components: {
    udpsList
  },
  mounted () {
    this.getModelEntityList()
    this.getUdpsInfoList()
    this.getOrgList()
  },
  computed: {
    udpArr () {
      let typeStr = LDMTypes[this.itemObject.TypeId]
      if (typeStr === 'CallActivity' || typeStr === 'Transaction') {
        typeStr = 'SubProcess'
      }
      let udp = this.udpType.find(udp => typeStr?.indexOf(udp.label2) >= 0)
      if (udp) {
        return this.udpMap[udp.label]
      } else {
        return []
      }
    }
  },
  props: {
    modelId: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      selection: [],
      udpType: [{
        label: 'Gateways',
        label2: 'Gate',
        value: 80210051
      }, {
        label: 'Tasks',
        label2: 'Task',
        value: 80210052
      }, {
        label: 'SubProcesses',
        label2: 'SubProcess',
        value: 80210053
      }, {
        label: 'Events',
        label2: 'Event',
        value: 80210054
      }, {
        label: 'Data',
        label2: 'Data',
        value: 80210055
      }, {
        label: 'Participants',
        label2: 'Participant',
        value: 80210056
      }],
      udpMap: {},
      structureInfo: {},
      bpmnModelList: [],
      businessObjectList: [],
      node: {},
      attribute: {},
      itemObject: {},
      isEdit: false,
      editModal: false,
      query: '',
      LDMTypes,
      objectTypeValue: '',
      objectType: [
        'Gateways',
        'Tasks',
        'SubProcesses',
        'Events',
        'Data',
        'Participants'
      ],
      tableData: [],
      tableShowData: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      allDepartmentList: []
    }
  },
  methods: {
    // 获取所有的机构，并将返回的树形数据 转换成 数组
    getOrgList () {
      this.$http
        .get('/user/org/organization/tree/')
        .then(res => {
          this.flattenOrg([res.data], this.allDepartmentList)
        })
    },
    // 将嵌套数据 拍平成 数组
    flattenOrg (sourceArray, flattenedArray = []) {
      for (const element of sourceArray) {
        if (Array.isArray(element.children) && element.children.length > 0) {
          flattenedArray.push({
            ...element,
            children: []
          })
          this.flattenOrg(element.children, flattenedArray)
        } else {
          flattenedArray.push(element)
        }
      }
      return flattenedArray
    },
    handleTableCurrentChange (row) {
      setTimeout(() => { // 防止handleTableRowClick走错误逻辑
        this.currentRow = row
      }, 200)
      this.$refs.tableRef.scopeRadio = row?.properties?.BpmnId
    },
    togglePanel () {
      this.editModal = !this.editModal
      if (!this.editModal) {
        this.$refs.tableRef.setCurrentRow()
        this.$refs.tableRef.scopeRadio = null
      }
    },
    changeFilterType (selection) {
      this.editModal = false
      this.$refs.tableRef.setCurrentRow()
      this.$refs.tableRef.scopeRadio = null
      this.selection = selection
      this.currentPage = 1
      this.getTableData()
    },
    getCurrentName (bpmnModelList, businessObjectList) {
      if (!bpmnModelList.length && !businessObjectList.length) {
        return
      }
      let params = {
        archyList: businessObjectList.map(businessObject => {
          let { entityList } = businessObject
          let res = {
            uuid: businessObject.id,
            modelId: businessObject.logicalModelId,
            entityList: entityList?.map(entity => ({
              tableId: entity.elementId
            }))
          }
          return res
        }),
        modelList: bpmnModelList.map(bpmnModel => ({ modelId: bpmnModel.id }))
      }
      this.$http.post(`${this.$bpmn}editor/element/info`, params).then(res => {
        let { archyList, modelList } = res.data
        businessObjectList.forEach((businessObject, index) => { // 更新为最新的名字
          if (archyList[index]?.name) {
            businessObject.name = archyList[index].name
          }
          businessObject?.entityList?.forEach((entity, indexj) => {
            if (archyList[index]?.entityList[indexj]?.tableName) {
              entity.name = archyList[index].entityList[indexj].tableName
            }
          })
        })
        bpmnModelList.forEach((bpmnModel, index) => {
          if (modelList[index]?.modelName) {
            bpmnModel.name = modelList[index].modelName
          }
        })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleTableRowClick (row) {
      if (this.currentRow === row) {
        this.$refs.tableRef.setCurrentRow()
        setTimeout(() => {
          this.$refs.tableRef.scopeRadio = null
        }, 100)
        this.editModal = false
      } else {
        this.editModal = true
        this.itemObject = row.properties
        if (this.itemObject.BPMNBindObject) {
          let { bpmnModelList, businessObjectList, structureInfo, node, attribute } = JSON.parse(this.itemObject.BPMNBindObject)
          this.bpmnModelList = bpmnModelList
          this.businessObjectList = businessObjectList
          this.structureInfo = structureInfo
          this.node = node
          this.attribute = attribute
          let department = this.allDepartmentList.find(item => item.id === (structureInfo.id))
          if (!department) {
            this.structureInfo.fullName = ''
          } else {
            this.structureInfo.fullName = department.fullName
          }
          this.getCurrentName(bpmnModelList, businessObjectList)
        } else {
          this.bpmnModelList = []
          this.businessObjectList = []
          this.structureInfo = {}
          this.node = {}
          this.attribute = {}
        }
      }
    },
    getUdpsInfoList () {
      this.$http.get(this.$bpmn + 'udps/').then(res => {
        this.udpList = res.data.sort((a, b) => a.order - b.order)
        this.udpList.forEach(udp => {
          console.log(udp.targetTypes, LDMTypes[udp.targetTypes])
          if (this.udpMap[LDMTypes[udp.targetTypes]]) {
            this.udpMap[LDMTypes[udp.targetTypes]].push(udp)
          } else {
            this.udpMap[LDMTypes[udp.targetTypes]] = [udp]
          }
        })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    goEntityDetail (item) {
      this.$http.get(this.$archyUrl + `object/object/${item.uuid}`).then(res => {
        let { logicalModelVersionId } = res.data
        let url = `${this.$url}/models/${item.modelId}/table/${item.elementId}?versionId=${logicalModelVersionId}`
        this.$http.get(url).then(res => {
          HTTP.getModelPermission({ modelId: item.modelId })
            .then(permissions => {
              if (permissions.admin || permissions.editor || permissions.viewer) {
                const pos = location.href.indexOf('#/')
                const baseUrl = location.href.slice(0, pos + 2)
                window.open(baseUrl + `main/enterpriseLogicalModel?id=${item.uuid}&combinedId=${item.combinedId}`, '_blank')
              } else {
                this.$showFailure(this.$t('common.info.noModelPermission'))
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }).catch(err => {
          this.$showFailure(err)
        })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    goBusinessObjectDetail (item) {
      this.$http.post(`${HTTP.$archyServerUrl}object/object/info/${item.id}?setEntity=${false}`).then(res => {
        if (res.data.releaseState === 'X') {
          this.$datablauMessage.error('该业务对象已废弃，您可以选择删除后引用新的业务对象。')
        } else {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(baseUrl + `main/enterpriseLogicalModel?id=${item.id}`, '_blank')
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    goBPMNModelDetail (item) {
      this.$http.get(this.$bpmn + `editor/model/${item.id}?withPath=true`).then(res => {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(baseUrl + `main/bpmnModelManage?id=${item.id}`, '_blank')
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    searchTableData () {
      this.currentPage = 1
      this.getTableData()
    },
    getModelEntityList () {
      this.$http.get(this.$bpmn + `editor/${this.modelId}/direct/content/json?longKey=false`).then(res => {
        console.log(res.data)
        this.tableData = res.data.children.filter(item => LDMTypes[item.properties.TypeId] !== 'Definitions' && LDMTypes[item.properties.TypeId] !== 'Process' && LDMTypes[item.properties.TypeId] !== 'Collaboration' && LDMTypes[item.properties.TypeId] !== 'DataObject')
        this.total = this.tableData.length
        this.currentPage = 1
        this.getTableData()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.getTableData()
    },
    handleCurrentChange (current) {
      this.currentPage = current
      this.getTableData()
    },
    getTableData () {
      let res = this.tableData.filter(item => item.properties.BpmnId.toLowerCase().indexOf(this.query.trim().toLowerCase()) > -1 || (item.properties.Name && item.properties.Name.toLowerCase().indexOf(this.query.trim().toLowerCase()) > -1)).filter(item => !this.selection.length || this.selection.some(s => LDMTypes[item.properties.TypeId].indexOf(s) >= 0 || (s === 'SubProcess' && (LDMTypes[item.properties.TypeId] === 'CallActivity' || LDMTypes[item.properties.TypeId] === 'Transaction'))))
      this.tableShowData = res.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
      this.total = res.length
    }
  }
}
</script>

<style lang="scss" scoped>
.content-flex-wrapper {
  display: flex;
  position: absolute;
  top: 55px;
  left: 0;
  right: 0;
  bottom: 0;
  .table-content-wrapper {
    height: 100%;
    flex: 1 1 auto;
    position: relative;
  }
  .edit-panel-wrapper {
    .close-btn {
      position: absolute;
      top: 8px;
      right: 16px;
      width: 30px;
      height: 30px;
      background-color: #F5F5F5;
      border-radius: 50%;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
      &:hover {
        color: #409EFF;
      }
    }
    height: calc(100% + 57px);
    position: relative;
    top: -57px;
    flex: 0 0 auto;
    width: 400px;
    z-index: 2;
    background: #fff;
    border: 1px solid #ddd;
    border-right: none;
    animation: showPanel 225ms cubic-bezier(0,0,.2,1) 0ms;
    box-shadow: -2px 2px 4px 2px rgba(85,85,85,0.1);
    &.hide {
      transform: translate(100%, 0);
    }
  }
}
.form-item-head {
  text-align: left;
  .icon-item {
    vertical-align: middle;
    margin-right: 6px;
  }
  .name {
    display: inline-block;
    vertical-align: middle;
  }
  .add-btn {
    float: right;
    position: relative;
    top: 5px;
  }
}
.edit-detail-wrapper {
  height: 100%;
  padding: 20px;
  overflow: auto;
  h2 {
    color: #777;
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 7px;
  }
}
.model-filter-wrapper {
  .title {
    margin-left: 16px;
    margin-right: 8px;
  }
  .select-wrapper {
    display: inline-block;
  }
}
@keyframes showPanel {
  0% {
    transform: translate(100%, 0);
  }
  100% {
    transform: translate(0, 0);
  }
}
/deep/ .el-table.datablau-table tr.current-row td, /deep/ .el-table.datablau-table tr.current-row + tr td {
  border-color: #EBEEF5;
  border-top: none;
}
/deep/ .el-table.datablau-table tr.current-row + tr td {
  border-color: #EBEEF5;
}
</style>
