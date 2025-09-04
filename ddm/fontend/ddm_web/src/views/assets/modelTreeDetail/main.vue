<template>
  <div class="businessObj-detail-wrapper">
    <div class="breadcrumb-wrapper">
      <datablau-breadcrumb
        :node-data="breadcrumbData"
        @back="$router.go(-1)"
        @nodeClick="nodeClick"
      ></datablau-breadcrumb>
    </div>
    <div class="left-panel-wrapper">
      <div class="content-title">{{title}}</div>
      <el-collapse v-model="activeTab">
        <el-collapse-item name="logicalModel">
          <template slot="title">
            <div class="title">
              <i class="iconfont icon-openfile" style="color: #409EFF"></i>
              逻辑模型
            </div>
          </template>
          <div class="link" :class="{active: panel === 'baseInfo'}" @click="panel='baseInfo'">
            模型摘要
          </div>
          <div class="link" v-if="showHistory" :class="{active: panel === 'consanguinity'}" @click="panel='consanguinity'">
            模型血缘
          </div>
          <div class="link" :class="{active: panel === 'entity'}" @click="panel='entity'">
            数据实体
          </div>
          <div class="link" :class="{active: panel === 'relatedBusinessObj'}" @click="panel='relatedBusinessObj'">
            依赖业务对象
          </div>
          <div class="link" :class="{active: panel === 'ERD'}" @click="clickERD">
            关系图
          </div>
          <div class="theme-box">
            <el-tree
              class="grey-tree"
              :data="diagrams"
              ref="themeTree"
              :props="{label: 'Name', id: 'Id'}"
              :render-content="renderContent"
              @node-click="handleDiagramClick"
              :expand-on-click-node="true"
              node-key="Id"
            ></el-tree>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="content-panel-wrapper">
      <div class="base-info" v-show="panel==='baseInfo'">
        <div class="top-hint">模型摘要</div>
        <datablau-form>
          <el-form-item label="模型名称">
            {{modelInfo.modelName}}
          </el-form-item>
          <el-form-item label="模型版本">
            {{modelInfo.modelVersionName}}
          </el-form-item>
          <el-form-item label="模型路径">
            {{modelInfo.modelPath}}
          </el-form-item>
          <el-form-item label="创建者">
            {{modelInfo.creator}}
          </el-form-item>
        </datablau-form>
      </div>
      <div v-show="panel==='entity'" style="margin-top: 10px">
        <datablau-input
          v-model="entityQuery"
          :iconfont-state="true"
          placeholder="请输入查询实体"
          @input="searchEntityData"
          clearable
          style="margin-left: 16px;"
        ></datablau-input>
        <div class="table-container">
          <datablau-table
            :data="entitiesShowData"
            height="100%"
          >
            <el-table-column
              prop="alias"
              label="实体名称"
              width="150"
              sortable
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="name"
              label="英文名"
              sortable
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="definition"
              label="定义"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="columnSize"
              label="字段数"
              sortable
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              label="操作"
              width="150"
              show-overflow-tooltip>
              <template slot-scope="scope">
                <datablau-tooltip
                  effect="dark"
                  content="查看"
                  placement="bottom"
                >
                  <datablau-button class="iconfont icon-see" type="text" @click="showModel(scope.row)"></datablau-button>
                </datablau-tooltip>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
        <div class="page-pignation">
          <datablau-pagination
            @size-change="handleEntitySizeChange"
            @current-change="handleEntityCurrentChange"
            :page-sizes="[20, 50, 100]"
            :page-size="entityPage.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="entityPage.total">
          </datablau-pagination>
        </div>
      </div>
      <div v-show="panel==='consanguinity'" class="lineage-container">
        <model-lineage v-if="panel==='consanguinity'" :model-id="id" :type="type"></model-lineage>
      </div>
      <div v-show="panel==='relatedBusinessObj'" style="margin-top: 10px">
        <div class="tool-panel">
          <datablau-input
            v-model="objectQuery"
            :iconfont-state="true"
            placeholder="请输入查询业务对象"
            @input="searchObjectsData"
            clearable
            style="margin-left: 16px;margin-right: 8px;"
          ></datablau-input>
          <div class="label">
            主题
          </div>
          <datablau-select
            @change="handleThemeFilter"
            v-model="filterTheme"
            style="width: 120px"
          >
            <el-option
              key="all"
              label="全部"
              value="all"
            ></el-option>
            <el-option
              v-for="item in themeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </datablau-select>
          <div class="label">
            发布时间
          </div>
          <datablau-dateRange
            @changeDateTime="changeEventStartTime"
            v-model="filterTime"
            :pickerOptionsArray="['最近一周', '最近一个月', '最近三个月']"
          ></datablau-dateRange>
        </div>
        <div class="table-container">
          <datablau-table
            :data="objectsShowData"
            height="100%"
          >
            <el-table-column
              prop="name"
              label="对象名称"
              width="150"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="subjectName"
              label="主题"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="definition"
              label="定义"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="scope"
              label="范围"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="include"
              label="包括"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="owner"
              label="负责人"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              label="创建时间"
              show-overflow-tooltip>
              <template slot-scope="scope">
                {{moment(scope.row.createTime).format('YYYY-MM-DD HH:mm')}}
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              label="发布时间"
              show-overflow-tooltip>
              <template slot-scope="scope">
                {{moment(scope.row.releaseTime).format('YYYY-MM-DD HH:mm')}}
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              label="状态"
              show-overflow-tooltip>
              <template slot-scope="scope">
                <div :class="scope.row.state">
                  {{stateMap[scope.row.state]}}
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="150"
              show-overflow-tooltip>
              <template slot-scope="scope">
                <datablau-tooltip
                  effect="dark"
                  content="查看"
                  placement="bottom"
                >
                  <datablau-button type="text" class="iconfont icon-see" @click="showObject(scope.row.id)">查看</datablau-button>
                </datablau-tooltip>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
        <div class="page-pignation">
          <datablau-pagination
            @size-change="handleObjectsSizeChange"
            @current-change="handleObjectsCurrentChange"
            :page-sizes="[20, 50, 100]"
            :page-size="objectPage.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="objectPage.total">
          </datablau-pagination>
        </div>
      </div>
      <div class="ERD" v-show="panel === 'ERD'">
        <model-graph
          v-if="diagramId && modelInfo.id"
          :current-id="diagramId"
          :current-name="diagramName"
          :key="diagramId"
          :data="data"
          ref="modelGraphReference"
          :data-by-type="dataByType"
          :modelId="modelInfo.id"
          :currentModel="modelInfo"
          :hideEntityClick="true"
          @hideTabs="hideTabsChange"
        >
        </model-graph>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import $ from 'jquery'
import HTTP from '@/resource/http'
import modelGraph from '@/views/list/graph/modelGraph.vue'
import sort from '@/resource/utils/sort'
import modelLineage from '../lineage/modelLineage.vue'
export default {
  data () {
    return {
      breadcrumbData: [{ name: this.type === 'LogicalApp' ? '应用逻辑模型' : '物理数据模型' }],
      diagrams: null,
      diagramId: null,
      diagramName: null,
      isLogicalModel: false,
      isConceptual: false,
      showHistory: Boolean(this.$route.query.showHistory),
      info: {

      },
      modelInfo: {

      },
      entities: [],
      entityPage: {
        current: 1,
        size: 20,
        total: 0
      },
      objectPage: {
        current: 1,
        size: 20,
        total: 0
      },
      entitiesShowData: [],
      objects: [],
      objectsShowData: [],
      panel: 'baseInfo',
      activeTab: ['logicalModel'],
      versions: [],
      moment,
      stateMap: {
        A: '已发布',
        C: '审核中',
        D: '待审核',
        X: '已废弃',
        O: '过时的'
      },
      entityQuery: '',
      objectQuery: '',
      data: [],
      dataByType: {
        table: {},
        diagram: {},
        view: {},
        comment: {},
        relation: {},
        model: {},
        udp: null,
        theme: {}
      },
      hideTabs: false,
      themeList: [],
      filterTheme: 'all',
      filterTime: [],
      version: this.$route.query.version,
      title: ''
    }
  },
  props: ['id', 'type'],
  components: {
    modelGraph,
    modelLineage
  },
  mounted () {
    this.$bus.$on('refeshBreadcrumbData', (data) => {
      this.breadcrumbData = data
    })
    // this.getInfo()
    this.getModelInfo()
    this.getAllModelTheme()
  },
  watch: {
    panel (name) {
      if (name !== 'ERD') { // 如果点击基本信息下的栏目
        this.$refs.themeTree.setCurrentKey(null)
      }
    },
    $route (val) {
      this.panel = 'baseInfo'
      this.activeTab = ['logicalModel']
      this.showHistory = Boolean(this.$route.query.showHistory)
      this.version = this.$route.query.version
      // this.getInfo()
      this.getModelInfo()
    }
  },
  methods: {
    changeEventStartTime () {
      this.objectPage.current = 1
      this.getObjectsPageData()
    },
    handleThemeFilter () {
      this.objectPage.current = 1
      this.getObjectsPageData()
    },
    getAllModelTheme () {
      HTTP.getAllModelTheme()
        .then(res => {
          this.themeList = res.content
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    nodeClick (data) {
      this.$router.push(data.operate)
    },
    showVersion (item) {
      this.breadcrumbData.push({ name: item.version })
      this.$router.push({
        path: '/main/businessObj/detail/' + item.id,
        query: {
          version: item.version
        }
      })
    },
    getVersionInfo () {
      this.$http.get(this.$url + '/service/archy/object/object/history?uuid=' + this.info.id).then(res => {
        this.versions = res.data.map(i => ({
          ...i,
          show: false
        }))
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    clickERD () {
      this.panel = 'ERD'
      if (this.diagrams) {
        // this.handleDiagramClick(this.diagrams[0])
        $('.el-tree > .el-tree-node:first-child > .el-tree-node__content').trigger('click')
      }
    },
    hideTabsChange (val) {
      this.hideTabs = val
    },
    prepareUdpData (rawData) {
      if (rawData && Array.isArray(rawData.children)) {
        let udpMap = new Map()
        rawData.children.forEach(item => {
          if (item.hasOwnProperty('properties') && item.properties.hasOwnProperty('Id')) {
            udpMap.set(item.properties['Id'], item.properties)
          }
        })
        let udp = new Map()
        udpMap.forEach(item => {
          if (item.OwnerRef) {
            let udpId = udpMap.get(item.OwneeRef)?.Id
            if (![80000000, 80000004, 80000005, 80000006, 80000007].includes(udpId)) {
              udpMap.get(udpId).entityType = item.OwnerRef
              udp.set(udpId, udpMap.get(udpId))
            }
          }
        })
        this.dataByType.udp = udp
      } else {
        this.dataByType.udp = new Map()
      }
    },
    getPermission () {
      HTTP.getModelPermission({
        modelId: this.modelInfo.id,
        successCallback: data => {
          this.modelInfo.permission = data
          this.permissionReady = true
        }
      })
    },
    prepareTreeData () {
      const self = this
      this.diagrams = []
      this.data.forEach(item => {
        //  TODO it's could work for lazy load.
        if (item.properties.TypeId === 80000004 || item.properties.TypeId === 80100073) {
          self.dataByType.table[item.properties.Id] = item
        } else if (item.properties.TypeId === 80000006) {
          self.dataByType.diagram[item.properties.Id] = item
          this.diagrams.push(item.properties)
          let tables = []
          let children = item.children
          if (children && children.length > 0) {
            for (let i = 0, len = children.length; i < len; i++) {
              if (children[i] && children[i].properties && children[i].properties.TypeId === 80000008) {
                tables.push(children[i])
              }
            }
          }
          if (tables.length > this.largestDiagramCount) {
            this.largestDiagramCount = tables.length
            this.largestDiagramId = item.properties.Id
          }
        } else if (item.properties.TypeId === 80500008) {
          self.dataByType.view[item.properties.Id] = item
        } else if (item.properties.TypeId === 80000027) {
          self.dataByType.comment[item.properties.Id] = item
        } else if (item.properties.TypeId === 80000007) {
          self.dataByType.relation[item.properties.Id] = item
        } else if (item.properties.TypeId === 80010214) { // 样式主题
          self.dataByType.theme[item.properties.Id] = item
        }
      })
      this.modelInfo.diagramCount = this.diagrams.length
      sort.sortConsiderChineseNumber(this.diagrams, 'Name')
    },
    getDiagrams () {
      this.$bus.$on('append-theme', ({ current, parent }) => {
        const tree = this.$refs.themeTree
        const parentNode = tree.getNode(parent)
        const currentNode = tree.getNode(current.Id)
        if (parentNode && !currentNode) {
          tree.append(current, parent)
          this.$nextTick(() => {
            parentNode.expanded = true
          })
        }
      })
      HTTP.getDiagrams({
        modelId: this.modelInfo.id,
        successCallback: (data) => {
          this.data = data.children
          this.prepareUdpData(data.udp)
          this.dataByType.model = data.properties
          this.isLogicalModel = this.dataByType.model.TypeUniqueId === '025502f5-3820-4555-9d0f-bbb148840e9a'
          this.isConceptual = this.dataByType.model.TypeUniqueId === '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80'
          this.prepareTreeData()
          this.getPermission()
        }
      })
    },
    handleDiagramClick (diagram, node, el) {
      window.move = false
      this.panel = 'ERD'
      this.diagramId = diagram.Id
      this.diagramName = diagram.Name
      this.currentPane = 'diagram'
    },
    renderContent (h, { node, data, store }) {
      let className = 'tree-icon diagram'
      return (
        <span style="flex: 1; display: flex;align-items: center;">
          <span style="text-align:center;width:24px;">
            <span class={className} ></span>
          </span>
          <span>{data.Name}</span>
        </span>)
    },
    showModel (row) {
      window.open(`/#/main/list?id=${row.modelId}&pId=${row.parentId}&objectId=${row.elementId}&objectType=table`)
      // this.$router.push({
      //   name: 'list',
      //   query: {
      //     id: row.modelId,
      //     pId: row.categoryId,
      //     objectId: row.elementId,
      //     objectType: 'table'
      //   }
      // })
    },
    showObject (id) {
      this.$router.push({
        name: 'businessObjDetail',
        query: {
          id
        }
      })
    },
    searchEntityData () {
      this.entityPage.current = 1
      this.getEntityPageData()
    },
    searchObjectsData () {
      this.objectPage.current = 1
      this.getObjectsPageData()
    },
    handleEntitySizeChange (size) {
      this.entityPage.size = size
      this.getEntityPageData()
    },
    handleEntityCurrentChange (current) {
      this.entityPage.current = current
      this.getEntityPageData()
    },
    handleObjectsSizeChange (size) {
      this.objectPage.size = size
      this.getObjectsPageData()
    },
    handleObjectsCurrentChange (current) {
      this.objectPage.current = current
      this.getObjectsPageData()
    },
    getInfo () {
      this.$http.get(this.$url + '/service/archy/domain/domain/' + this.id).then(res => {
        this.info = res.data
        if (!this.breadcrumbData.some(i => i.name === this.info.name)) {
          this.breadcrumbData.push({ name: this.info.name, operate: `/main/businessObj/detail/${this.info.id}?showHistory=true` })
        } else if (this.showHistory) {
          this.breadcrumbData = [this.breadcrumbData[0], { name: this.info.name, operate: `/main/businessObj/detail/${this.info.id}?showHistory=true` }]
        }
        this.getVersionInfo()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    getModelInfo () {
      this.$http.get(this.$url + `/service/archy/system/category/model/info/${this.id}`, {
        version: this.version
      }).then(res => {
        this.modelInfo = res.data
        this.modelInfo.id = res.data.modelId
        this.title = this.modelInfo.modelName
        if (res.data.entities) {
          this.entities = res.data.entities
          this.getEntityPageData()
        }
        if (res.data.objects) {
          this.objects = res.data.objects
          this.getObjectsPageData()
        }
        this.getDiagrams()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    getEntityPageData () {
      let lq = this.entityQuery.toLowerCase()
      let tmpData = this.entities.filter(item => (item.alias && item.alias.toLowerCase().indexOf(lq) !== -1) || (item.name && item.name.toLowerCase().indexOf(lq) !== -1))
      this.entityPage.total = tmpData.length
      this.entitiesShowData = tmpData.slice((this.entityPage.current - 1) * this.entityPage.size, this.entityPage.current * this.entityPage.size)
    },
    getObjectsPageData () {
      let lq = this.objectQuery.toLowerCase()
      let tmpA = this.filterTheme === 'all' ? this.objects : this.objects.filter(item => item.subjectId === this.filterTheme)
      let tmpB = this.filterTime.length ? tmpA.filter(item => item.releaseTime >= this.filterTime[0] && item.releaseTime <= this.filterTime[1]) : tmpA
      let tmpData = tmpB.filter(item => item.name && item.name.toLowerCase().indexOf(lq) !== -1)
      this.objectPage.total = tmpData.length
      this.objectsShowData = tmpData.slice((this.objectPage.current - 1) * this.objectPage.size, this.objectPage.current * this.objectPage.size)
    }
  }
}
</script>

<style lang="scss" scoped>
  $blue: #409EFF;
  .A {
    color: #66BF16;
  }
  .C {
    color: #409EFF;
  }
  .D {
    color: #409EFF;
  }
  .timeline-wrapper {
    padding-left: 100px;
    padding-right: 20px;
  }
  .tool-panel {
    & > div {
      display: inline-block;
    }
    .label {
      display: inline-block;
      margin-right: 8px;
      line-height: 32px;
      font-size: 12px;
      font-weight: 400;
      color: #555555;
    }
    /deep/ .datablau-select .el-select .el-input input {
      height: 32px;
    }
    .datablau-select {
      margin-right: 16px;
    }
  }
  .top-hint {
    margin: 20px 30px 30px;
    line-height: 18px;
    border-left: 4px solid #409EFF;
    padding-left: 6px;
    font-size: 16px;
    color: #555;
  }
  /deep/ .el-form.db-form .el-form-item__label {
    font-weight: bold;
  }
  .breadcrumb-wrapper {
    position: relative;
    z-index: 1;
    padding: 0 20px;
    height: 34px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #DDD;
  }
  .left-panel-wrapper {
    position: absolute;
    left: 0;
    top: 34px;
    bottom: 0;
    width: 180px;
    border-right: 1px solid #E0E0E0;
    padding-top: 4px;
    .title {
      padding-left: 28px;
      font-size: 12px;
    }
    /deep/ .el-collapse-item__header {
      border-bottom: none;
    }
    .el-collapse {
      border: none;
    }
    .content-title {
      font-size: 12px;
      color: #555;
      line-height: 34px;
      padding-left: 11px;
    }
    /deep/ {
      .el-collapse-item__wrap {
        border:  none;
      }
      .el-collapse-item__content {
        padding-bottom: 0;
      }
      .el-collapse-item__arrow {
        position: absolute;
        left: 10px;
      }
    }
    .link {
      width: 180px;
      height: 32px;
      padding-left: 51px;
      line-height: 32px;
      cursor: pointer;
      font-size: 12px;
      &.active {
        background: rgba(64,158,255,0.1);
        color: #409EFF;
      }
      &:hover {
        background: rgba(64,158,255,0.1);
      }
    }
  }
  .content-panel-wrapper {
    position: absolute;
    left: 180px;
    top: 34px;
    right: 0;
    bottom: 0;
  }
  .theme-title {
    display: inline-block;
    margin-left: 20px;
    border-left: 1px solid $blue;
    padding-left: 20px;
  }
  .ERD {
    position: absolute;
    top: 37px;
    left: 20px;
    right: 0;
    bottom: 0;
  }
  .back-btn {
    margin-right: 10px;
    display: inline-block;
    font-size: 12px;
    line-height: 1;
    color: #888f9d;
    padding: 7px 12px;
    background: #f7f7f7;
    cursor: pointer;
    i {
      margin-right: 5px;
    }
  }
  .businessObj-detail-wrapper {
    font-size: 12px;
    line-height: 1;
    .update-time {
      position: absolute;
      left: 20px;
      right: 20px;
      bottom: 5px;
      color: #999;
      border-top: 1px solid #ddd;
      padding: 9px 0;
      background: #fff;
    }
    /deep/ .el-timeline-item__node {
      background-color: #409EFF;
      width: 10px;
      height: 10px;
      left: 0;
    }
    .history-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
      padding-top: 20px;
    }
    .info-detail {
      position: relative;
      .time-title {
        position: absolute;
        left: -100px;
        top: 4px
      }
      .content-wrapper {
        box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.15);
      }
      .content-head {
        border: 1px solid #F5F5F5;
        border-bottom: none;
        padding: 0 10px;
        background: #F5F5F5;
        line-height: 34px;
        border-radius: 2px;
        span + span {
          margin-left: 20px;
        }
        .el-icon-arrow-up {
          margin-left: 5px;
          transition: all .2s;
          &.down {
            transform: rotate(-180deg);
          }
        }
        .operate-wrapper {
          float: right;
          a {
            cursor: pointer;
            color: #409EFF;
            margin-right: 10px;
          }
          span {
            margin-left: 10px;
            cursor: pointer;
          }
        }
      }
      .content-detail {
        transition: all .8s;
        border: 1px solid #F5F5F5;
        border-top: none;
        border-radius: 2px;
        overflow: hidden;
        li {
          padding: 10px;
          color: #555;
          line-height: 1;
          font-size: 14px;
          h2 {
            margin-right: 5px;
          }
          h2, p {
            font-size: 14px;
            display: inline-block;
          }
        }
      }
    }
  }

  .table-container {
    position: absolute;
    top: 46px;
    left: 20px;
    right: 20px;
    bottom: 50px;
  }
  .page-pignation {
    border-top: 1px solid #ddd;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 20px;
  }
  .theme-box {
    position: relative;
    left: 16px;
  }
</style>

<style lang="scss">
  .ERD .citic-card-tabs.new-style > .el-tabs > .el-tabs__header {
    display: none;
  }
  .ERD .citic-card-tabs.new-style > .el-tabs > .el-tabs__content {
    top: 3px;
  }
  .ERD {
    .edit-model-btn {
      display: none;
    }
    .drap-box {
      & > div:nth-child(1) {
        margin-left: 0!important;
      }
      & > i:nth-child(2) {
        left: 60px!important;
      }
    }
  }
  .theme-box .el-tree {
    font-size: 12px;
  }
</style>
