<template>
  <div class="businessObj-detail-wrapper">
    <div class="breadcrumb-wrapper" v-show="!showHistoryDetail">
      <datablau-breadcrumb
        :node-data="breadcrumbData"
        @back="goBack"
        @nodeClick="nodeClick"
      ></datablau-breadcrumb>
    </div>

    <div class="top-info">
      <div class="left-info">
        <div
          class="icon-container"
        ></div>
        <div class="top-info-container">
          <p class="title">{{ info.name }}</p>
          <p class="define-text">编码：{{ info.code }}</p>
        </div>
      </div>
      <div class="right-button">
        <!--<datablau-button-->
        <!--  type="normal"-->
        <!--  @click="handleEdit"-->
        <!--  :disabled="info.state === 'C' || info.state === 'X'"-->
        <!--  :tooltipContent="info.state === 'C' || info.state === 'X' ? '审核中或已废弃无法编辑': ''"-->
        <!--  v-if="showHistory"-->
        <!--&gt;-->
        <!--  编辑-->
        <!--</datablau-button>-->
        <!--<datablau-button-->
        <!--  type="important"-->
        <!--  :disabled="info.state !== 'D'"-->
        <!--  :tooltipContent="info.state !== 'D' ? '仅待审核可发布': ''"-->
        <!--  @click="handlePublish"-->
        <!--  v-if="showHistory"-->
        <!--&gt;-->
        <!--  发布-->
        <!--</datablau-button>-->

        <div class="object-publish-info">
          <p class="info-item status-item">
            <span class="info-label">发布状态</span>
            <br>
            <span :class="`info-text status ${info.state}`">
              <span class="status-icon">
                <datablau-icon
                  :data-type="statusIcon"
                  icon-type="svg"
                  :size="20"
                ></datablau-icon>
              </span>
              <span class="status-label">
                {{ getStatusName(info.state) }}
              </span>

            </span>
          </p>
          <p class="item-border"></p>
          <p class="info-item">
            <span class="info-label">创建时间</span>
            <br>
            <span class="info-text">
              {{ getTimeFormat(info.createTime) }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <div class="tabs-header-container">
      <datablau-tabs
        class="detail-wrapper "
        v-model="currentTab"
      >
        <el-tab-pane
          label="摘要"
          name="info"
        >
        </el-tab-pane>
        <el-tab-pane
          label="实体"
          name="entity"
        >
        </el-tab-pane>
        <el-tab-pane
          label="知识图谱"
          name="graph"
        >
        </el-tab-pane>
        <el-tab-pane
          v-if="modelInfo.modelId"
          label="关联模型"
          name="relatedModel">
          <span slot="label">
            关联模型
            <el-popover
              v-if="diagramList.length"
              placement="bottom"
              width="200"
              trigger="click"
              content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">
              <datablau-tree
                ref="diagramTree"
                class="diagram-list-wrapper"
                node-key="elementId"
                :data="diagramList"
                :props="defaultProps"
                :data-icon-function="dataIconFunction"
                @node-click="handleNodeClick"
                :auto-expand-parent="true"
              ></datablau-tree>
              <datablau-button slot="reference" type="icon" class="iconfont icon-downarrow diagram-btn" @click="showDiagramTree"></datablau-button>
            </el-popover>
          </span>
        </el-tab-pane>
        <el-tab-pane
          label="变更历史"
          name="history"
        >
        </el-tab-pane>
      </datablau-tabs>
    </div>
    <div class="tabs-content-container">
      <div class="content-panel-wrapper" v-loading="dataLoading">
        <!--模型摘要-->
        <div v-if="currentTab==='info'">
          <div class="top-hint">基本信息</div>
          <datablau-form
            label-position="right"
            label-width="160px"
            class="detail-form"
            size="mini"
          >
            <div class="info-container">
              <el-form-item label="目录：">
                {{ info.path }}
              </el-form-item>
              <el-form-item label="名称：">
                {{ info.name }}
              </el-form-item>
              <el-form-item label="简称：">
                {{ info.abbreviation }}
              </el-form-item>
              <el-form-item label="编码：">
                {{ info.code }}
              </el-form-item>
              <el-form-item label="英文名称：">
                {{ info.alias }}
              </el-form-item>
              <el-form-item label="业务定义：">
                {{ info.definition }}
              </el-form-item>
              <el-form-item label="数据概念：">
                {{ info.subjectTag }}
              </el-form-item>
              <el-form-item
                class="detail udp-form-item"
                v-for="(udp, index) in additionalProperties.filter(
              e => e.catalog === '基本信息'
            )"
                :key="index"
                :label="``"
                label-width="0"
              >
                <udp-form-label
                  :content="`${udp.name}`"
                  :strWidth="160"
                  :showModel="true"
                ></udp-form-label>
                <!--<span class="label">{{ udp.name }}</span>-->
                <span class="value" v-html="htmlValue(udp.value)"></span>
              </el-form-item>
            </div>
            <el-form-item v-if="modelInfo.modelId" label="关联模型：">
              <datablau-button @click="goModelDetail(modelInfo.modelId)" type="text">{{ `${modelInfo.modelPath}.ddm` }}</datablau-button>
            </el-form-item>
            <!--<div class="info-container">-->
            <!--  <el-form-item label="发布状态" :class="`status ${info.state}`">-->
            <!--    {{ getStatusName(info.state) }}-->
            <!--  </el-form-item>-->
            <!--  <el-form-item label="发布时间">-->
            <!--    {{ moment(info.createTime).format('YYYY-MM-DD') }}-->
            <!--  </el-form-item>-->
            <!--</div>-->
            <!--<div class="info-container">-->
            <!--  <el-form-item label="路径" class="auto-width">-->
            <!--    {{ info.path }}-->
            <!--  </el-form-item>-->
            <!--</div>-->
          </datablau-form>
          <div class="top-hint">管理信息</div>
          <datablau-form
            label-position="right"
            label-width="160px"
            class="detail-form"
          >

            <el-form-item label="目的：">
              {{ info.purpose }}
            </el-form-item>
            <el-form-item label="范围：">
              {{ info.scope }}
            </el-form-item>
            <el-form-item label="包含：">
              {{ info.include }}
            </el-form-item>
            <el-form-item label="不包含：">
              {{ info.exclude }}
            </el-form-item>
            <el-form-item
              class="detail udp-form-item"
              v-for="(udp, index) in additionalProperties.filter(
              e => e.catalog === '管理信息'
            )"
              :key="index"
              label=""
              label-width="0"
            >
              <udp-form-label
                :content="`${udp.name}`"
                :strWidth="160"
                :showModel="true"
              ></udp-form-label>
              <!--<span class="label">{{ udp.name }}</span>-->
              <span class="value" v-html="htmlValue(udp.value)"></span>
            </el-form-item>
          </datablau-form>
        </div>

        <!--实体-->
        <div v-show="currentTab==='entity'" style="margin-top: 10px">
          <div class="top-hint table-title">实体列表</div>
          <div class="entity-container">
            <datablau-input
              v-model="entityQuery"
              :iconfont-state="true"
              placeholder="请输入查询实体"
              @input="searchEntityData"
              clearable
              style="margin-left: 16px;"
              v-if="false"
            ></datablau-input>
            <div class="table-container">
              <datablau-table
                :data="entitiesLoading ? null : entitiesShowData"
                key="entityTable"
                ref="entityTable"
                @row-click="checkEntityRelation"
                :highlight-current-row="true"
                :maxHeight="500"
              >
                <el-table-column
                  prop="alias"
                  label="名称"
                  min-width="120"
                  sortable
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <datablau-list-icon
                      iconType="svg"
                      :dataType="'table'"
                    ></datablau-list-icon>
                    <span
                      @click.stop="checkEntityDetail(scope.row)"
                      class="list-table-link"
                    >
                      {{ scope.row.name }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="alias"
                  label="中文名"
                  sortable
                  show-overflow-tooltip
                  min-width="120"
                >
                </el-table-column>
                <el-table-column
                  prop="modelId"
                  label="模型"
                  show-overflow-tooltip
                  min-width="160"
                >
                  <template>
                    <span
                      @click.stop="checkModel({modelId: modelInfo.modelId})"
                      class="list-table-link"
                    >
                      {{ modelInfo.modelPath }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="definition"
                  label="业务定义"
                  show-overflow-tooltip
                  min-width="160"
                >
                </el-table-column>
                <!-- 新增 操作人 操作时间 -->
                 <el-table-column
                  prop="operator"
                  label="操作人"
                  show-overflow-tooltip
                  min-width="160"
                >
                </el-table-column>
                <el-table-column
                  prop="operatorDate"
                  label="操作时间"
                  :formatter="$timeFormatter"
                  show-overflow-tooltip
                  min-width="160"
                >
                </el-table-column>
                <el-table-column
                  label="查看"
                  width="80"
                  show-overflow-tooltip
                  align="center"
                  header-align="center"
                  fixed="right"
                >
                  <template slot-scope="scope">
                    <datablau-tooltip
                      effect="dark"
                      content="查看"
                      placement="bottom"
                    >
                      <datablau-button
                        class="iconfont icon-see"
                        type="text"
                        @click.stop="checkEntityDetail(scope.row)"
                      ></datablau-button>
                    </datablau-tooltip>
                  </template>
                </el-table-column>
              </datablau-table>
            </div>
            <div class="page-pagination" v-if="entities && entities.length > 10">
              <datablau-pagination
                @size-change="handleEntitySizeChange"
                @current-change="handleEntityCurrentChange"
                :page-sizes="[10, 20, 50]"
                :page-size="entityPage.size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="entityPage.total">
              </datablau-pagination>
            </div>
          </div>
          <div class="top-hint table-title">表关联</div>
          <div class="relation-table-container" v-if="loadEntity">
            <relation-table-list
              :objectId="id"
              :sourceId="currentSourceId"
              :entitiesMap="entitiesMap"
              @checkEntity="checkRelationEntityDetail"
              @checkModel="checkModel"
            ></relation-table-list>
          </div>

        </div>

        <!--知识图谱-->
        <div
          class="knowledge-graph"
          v-if="currentTab === 'graph'"
        >
          <knowledge-graph
            ref="knowledgeGraph"
            style="margin: 10px 20px;"
            :summary="{
          properties: { Id: this.id, TypeId: 'ArchyObject',App: 'archy' },
        }"
          ></knowledge-graph>
        </div>

        <!--变更历史-->
        <div class="history-wrapper" v-if="currentTab === 'history'">
          <el-timeline class="timeline-wrapper">
            <el-timeline-item :key="`${item.id}_${item.version}`" v-for="(item, index) in versions">
              <div class="info-detail">
                <div class="time-title">{{ moment(item.lastModifiedTime).format('YYYY-MM-DD') }}</div>
                <div class="content-wrapper">
                  <div class="content-head">
                    <span>发布人：{{ item.lastModifier }}</span>
                    <span>版本号：{{ item.version }}</span>
                    <span>发布时间：{{ moment(item.lastModifiedTime).format('YYYY-MM-DD') }}</span>
                    <div class="operate-wrapper">
                      <!--<a type="text" @click="showVersion(item)">查看详情</a>-->
                      <!--|-->
                      <span @click="item.show = !item.show">{{ item.show ? '收起' : '展开' }}<i class="el-icon-arrow-up"
                                                                                            :class="{down: !item.show}"></i></span>
                    </div>
                  </div>
                  <ul :style="{'max-height': item.show?'300px':'0'}" v-if="index !== versions.length - 1"
                      class="content-detail">
                    <li>
                      <h2>定义:</h2>
                      <p class="content">{{ versions[index + 1].definition }}</p>
                      改为
                      <p class="content">{{ item.definition }}</p>
                    </li>
                    <li>
                      <h2>目的:</h2>
                      <p class="content">{{ versions[index + 1].purpose }}</p>
                      改为
                      <p class="content">{{ item.purpose }}</p>
                    </li>
                    <li>
                      <h2>范围:</h2>
                      <p class="content">{{ versions[index + 1].scope }}</p>
                      改为
                      <p class="content">{{ item.scope }}</p>
                    </li>
                    <li>
                      <h2>包含:</h2>
                      <p class="content">{{ versions[index + 1].include }}</p>
                      改为
                      <p class="content">{{ item.include }}</p>
                    </li>
                    <li>
                      <h2>不包含:</h2>
                      <p class="content">{{ versions[index + 1].exclude }}</p>
                      改为
                      <p class="content">{{ item.exclude }}</p>
                    </li>
                    <!--<li>-->
                    <!--  <h2>模型：</h2>-->
                    <!--  <p>{{ item.subjectName }}</p>-->
                    <!--</li>-->
                  </ul>
                  <ul :style="{'max-height': item.show?'300px':'0'}" class="content-detail" v-else>
                    <li>
                      <h2>定义:</h2>
                      <p class="content">{{ item.definition }}</p>
                    </li>
                    <li>
                      <h2>目的:</h2>
                      <p class="content">{{ item.purpose }}</p>
                    </li>
                    <li>
                      <h2>范围:</h2>
                      <p class="content">{{ item.scope }}</p>
                    </li>
                    <li>
                      <h2>包含:</h2>
                      <p class="content">{{ item.include }}</p>
                    </li>
                    <li>
                      <h2>不包含:</h2>
                      <p class="content">{{ item.exclude }}</p>
                    </li>
                    <!--<li>-->
                    <!--  <h2>模型：</h2>-->
                    <!--  <p>{{ item.subjectName }}</p>-->
                    <!--</li>-->
                  </ul>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <datablau-null v-if="!versions || versions.length===0" :type="'data'"
                         style="width: 160px; margin: 0 auto;"></datablau-null>
        </div>
        <div class="related-model-wrapper" v-if="currentTab === 'relatedModel'">
          <!--<datablau-tabs
            @tab-click="handleTabClick"
            style="padding: 10px 16px 0;"
            v-model="diagramNow"
            type="card"
          >
            <el-tab-pane
              v-for="item in diagramList"
              :key="item.properties.Id"
              :label="item.properties.Name"
              :name="item.properties.Id"
            ></el-tab-pane>
          </datablau-tabs>-->
          <model-component ref="modelComponent" class="model-wrapper" :diagramNow="diagramNow" v-if="modelInfo.modelId && diagramNow !== ''" :id="modelInfo.modelId" :key="modelGraphKey"></model-component>
        </div>
      </div>
    </div>

    <div
      class="entity-detail-wrapper"
      v-if="showEntityDetail"
    >
      <entity-detail
        @goBack="hideEntityDetail"
        :logicalModelVersionId="logicalModelVersionId"
        :element-id="showEntityId"
        :model-id="entityModelId"
        :entityData="showEntityData"
        :path="breadcrumbData"
        :showKnowledgeGraph="showKnowledgeGraph"
      ></entity-detail>
    </div>

  </div>
</template>

<script>
import moment from 'moment'
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
import knowledgeGraph from '@/dataWarehouse/views/dataIndex/damComponents/knowledgeGraph.vue'
import relationTableList from './relationTableList.vue'
import entityDetail from './entityDetail/entityDetail.vue'
import udpFormLabel from '@/views/archy/enterpriseLogicalModel/udpFormLabel.vue'
import modelComponent from '@/views/list/modelComponent.vue'

export default {
  name: 'businessObjectDetail',
  data () {
    return {
      logicalModelVersionId: -1,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      modelGraphKey: 0,
      diagramList: [],
      diagramNow: '',
      currentTab: 'info',
      loadEntity: false, // 用于标记是否开始加载对象的实体，只触发一次
      currentThemeName: '',
      dialogLoading: false,
      dialogVisible: false,
      editModel: true,
      loading: false,
      dataLoading: false,
      showKnowledgeGraph: false, // 物理表与物理字段的知识图谱去掉
      createForm: {
        subjectId: '',
        name: '',
        code: '',
        alias: '',
        definition: '',
        purpose: '',
        scope: '',
        include: '',
        exclude: ''
      },
      // themeList: [],
      rules: {
        name: [
          { required: true, message: '请输入对象名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入对象编码', trigger: 'blur' }
        ],
        subjectId: [
          { message: '请选择数据概念', trigger: 'blur' }
        ]
      },
      showHistoryDetail: false,
      currentVersion: null,

      breadcrumbData: [],
      diagrams: null,
      diagramId: null,
      diagramName: null,
      isLogicalModel: false,
      isConceptual: false,
      // showHistory: Boolean(this.$route.query.showHistory),
      info: {},
      modelInfo: {},
      entities: null,
      entitiesMap: null,
      entityPage: {
        current: 1,
        size: 10,
        total: 0
      },
      objectPage: {
        current: 1,
        size: 20,
        total: 0
      },
      entitiesShowData: [],
      entitiesLoading: true, // 用于标记是否获取实体列表
      objects: [],
      objectsShowData: [],
      currentSourceId: '',
      panel: 'info',
      activeTab: ['basic', 'logicalModel'],
      versions: [],
      showEntityDetail: false,
      showEntityId: null,
      showEntityData: null,
      entityModelId: null,
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
      additionalProperties: [],
      filterTheme: 'all',
      filterTime: [],
      title: ''
    }
  },
  props: {
    id: { // 业务对象id
      type: [String, Number],
      required: true
    },
    showHistory: {
      type: Boolean,
      default: true
    },
    version: {
      type: [String, Number],
      default: ''
    },
    udps: {
      type: Array,
      required: true
    }
  },
  components: {
    modelComponent,
    relationTableList,
    entityDetail,
    udpFormLabel,
    knowledgeGraph
    // modelGraph,
    // modelLineage
  },
  mounted () {
    let combinedId = this.$route.query?.combinedId
    if (combinedId) {
      this.getModelInfo(true)
    } else {
      this.getModelInfo()
    }
    this.getInfo()
  },
  watch: {
    currentTab (newVal) {
      if (newVal === 'entity') {
        // 第一次切换到 实体 tab，获取实体列表
        if (!this.loadEntity) {
          this.getModelInfo(true)
          this.loadEntity = true
        }
        this.currentSourceId = ''
        this.$refs.entityTable?.setCurrentRow()
      } else if (newVal === 'relatedModel') {
        this.getDiagramInfo()
      }
    },
    panel (name) {
      if (name !== 'ERD') { // 如果点击基本信息下的栏目
        this.$refs.themeTree.setCurrentKey(null)
      }
    }
  },
  computed: {
    statusIcon () {
      let map = {
        O: 'unpublished',
        D: 'pending-review',
        C: 'review',
        A: 'published',
        X: 'abandoned'
      }
      return map[this.info?.state] || ''
    }
  },
  methods: {
    goModelDetail (modelId) {
      HTTP.getModelPermission({
        modelId
      })
        .then(permission => {
          permission = permission || {}
          if (permission.admin || permission.editor || permission.viewer) {
            const pos = location.href.indexOf('#/')
            const baseUrl = location.href.slice(0, pos + 2)
            window.open(baseUrl + `main/list?id=${modelId}`, '_blank')
          } else {
            this.$datablauMessage.error(this.$t('common.info.noModelPermission'))
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showDiagramTree () {
      this.$nextTick(() => {
        this.$refs.diagramTree.setCurrentKey(this.diagramNow)
      })
    },
    handleNodeClick (data) {
      this.diagramNow = data.elementId
      this.modelGraphKey++
    },
    dataIconFunction (data, node) {
      return 'tree-icon diagram'
    },
    handleTabClick () {
      this.modelGraphKey++
    },
    handleCancel () {
      this.dialogVisible = false
    },
    editBussinessObject () {
      this.loading = true
      HTTP.editBussinessObject(this.createForm)
        .then(res => {
          this.loading = false
          this.$blauShowSuccess('业务对象修改成功')
          this.getAllModelTheme()
          this.handleCancel()
        })
        .catch(err => {
          this.loading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    handleSubmit () {
      this.$refs['createForm'].validate((valid) => {
        if (valid) {
          this.editBussinessObject()
        } else {
          return false
        }
      })
    },
    getStatusName (state) {
      let result = ''
      switch (state) {
        case 'A':
          result = '已发布'
          break
        case 'C':
          result = '审核中'
          break
        case 'D':
          result = '待审核'
          break
        case 'X':
          result = '已废弃'
          break
        // case 'O':
        //   result = '过时的'
        //   break
      }
      return result
    },
    getTimeFormat (time) {
      // return time ? moment(time).format('YYYY-MM-DD') : '--'
      return this.$timeFormatter(time)
    },
    htmlValue (value) {
      if (value && typeof value === 'string') {
        return value.replace(/\n/g, '<br>').replace(/<script>/g, '')
      } else {
        return ''
      }
    },
    handleEdit () {
      this.editModel = true
      // this.getModelThemeDetail(row.data.id)
      this.createForm = _.cloneDeep(this.info)
      this.dialogVisible = true
    },
    handlePublish (row) {
      this.loading = true
      HTTP.applyWorkflow({
        processType: '业务对象',
        formDefs: [
          {
            code: 'id',
            value: this.info.id
          }
        ]
      })
        .then(res => {
          this.getInfo()
          this.loading = false
          this.$blauShowSuccess('申请发布成功')
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
          this.loading = false
        })
    },
    changeEventStartTime () {
      this.objectPage.current = 1
      this.getObjectsPageData()
    },
    handleThemeFilter () {
      this.objectPage.current = 1
      this.getObjectsPageData()
    },
    goBack () {
      // this.$router.go(-1)
      this.$emit('goBack')
    },
    hideVersion () {
      this.showHistoryDetail = false
    },
    nodeClick (data) {
      this.$router.push(data.operate)
    },
    showVersion (item) {
      this.currentVersion = item
      // console.log(this.currentVersion, 'this.currentVersion')
      this.showHistoryDetail = true
      // this.breadcrumbData.push({ name: item.version })
      // this.$router.push({
      //   path: '/main/businessObj/detail/' + item.id,
      //   query: {
      //     version: item.version
      //   }
      // })
      // this.$nextTick(() => {
      //   this.showHistoryDetail = true
      // })
    },
    getVersionInfo () {
      this.$http.get(HTTP.$archyServerUrl + 'object/object/history?uuid=' + this.info.id).then(res => {
        // console.log(res.data, 'getVersionInfo res.data')
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
        // $('.el-tree > .el-tree-node:first-child > .el-tree-node__content').trigger('click')
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
            let propertyId = udpMap.get(item.OwneeRef)?.Id
            if (![80000000, 80000004, 80000005, 80000006, 80000007].includes(propertyId)) {
              udpMap.get(propertyId).entityType = item.OwnerRef
              udp.set(propertyId, udpMap.get(propertyId))
            }
          }
        })
        this.dataByType.udp = udp
      } else {
        this.dataByType.udp = new Map()
      }
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
      HTTP.getDiagrams({
        modelId: this.modelInfo.id,
        successCallback: (data) => {
          this.data = data.children
          this.prepareUdpData(data.udp)
          this.dataByType.model = data.properties
          this.isLogicalModel = this.dataByType.model.TypeUniqueId === '025502f5-3820-4555-9d0f-bbb148840e9a'
          this.isConceptual = this.dataByType.model.TypeUniqueId === '721ac3dc-dabe-4be2-ae47-cbd6b0a14d80'
          this.prepareTreeData()
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
            <span class={className}></span>
          </span>
          <span>{data.Name}</span>
        </span>)
    },
    // showModel (row) {
    //   const pos = location.href.indexOf('#/')
    //   const baseUrl = location.href.slice(0, pos + 2)
    //   window.open(`${baseUrl}main/list?id=${row.modelId}&objectId=${row.elementId}&objectType=table`)
    //   // this.$router.push({
    //   //   name: 'list',
    //   //   query: {
    //   //     id: row.modelId,
    //   //     pId: row.categoryId,
    //   //     objectId: row.elementId,
    //   //     objectType: 'table'
    //   //   }
    //   // })
    // },
    checkEntityDetail (data) {
      this.showKnowledgeGraph = true
      // let permission = this.modelInfo.permission
      HTTP.getModelPermission({
        modelId: data.modelId
      })
        .then(permission => {
          permission = permission || {}
          if (permission.admin || permission.editor || permission.viewer) {
            this.showTableDetail(data)
          } else {
            this.$datablauMessage.error(this.$t('common.info.noModelPermission'))
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    checkRelationEntityDetail (data) {
      this.showKnowledgeGraph = false
      HTTP.getModelPermission({
        modelId: data.modelId
      })
        .then(permission => {
          permission = permission || {}
          if (permission.admin || permission.editor || permission.viewer) {
            this.showTableDetail(data)
          } else {
            this.$datablauMessage.error(this.$t('common.info.noModelPermission'))
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showTableDetail (data) {
      this.showEntityId = data.elementId
      this.showEntityData = data
      this.entityModelId = data.modelId
      this.showEntityDetail = true
    },
    checkModel (data) {
      // console.log(data, 'data')
      this.$skip2({
        type: 'model',
        modelId: data.modelId,
        objectId: data.modelId
      })
    },
    checkEntityRelation (row) {
      // console.log(row, 'row')
      if (this.currentSourceId === row.combinedId) {
        this.currentSourceId = ''
        this.$refs.entityTable.setCurrentRow()
      } else {
        this.currentSourceId = row.combinedId
      }
    },
    showObject (id) {
      // this.$router.push({
      //   path: `/main/businessObj/detail/${id}?showHistory=true`
      // })
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
      this.dataLoading = true
      this.$http.get(HTTP.$archyServerUrl + 'object/object/' + this.id).then(res => {
        this.info = res.data
        this.title = this.info.name
        this.logicalModelVersionId = res.data.logicalModelVersionId

        let path = (this.info.path || '').split('/').map(item => {
          return {
            name: item,
            couldClick: false
          }
        })
        path.push({
          name: this.info.name,
          couldClick: false
        })
        this.breadcrumbData.push(...path)
        this.getUdpCurrent()
        this.getVersionInfo()
      }).catch(err => {
        this.$showFailure(err)
      })
        .finally(e => {
          this.dataLoading = false
        })
    },
    getDiagramInfo () {
      if (this.modelInfo.id) {
        HTTP.getModelDiagrams({ modelId: this.modelInfo.id })
          .then(data => {
            this.diagramList = data
            if (this.diagramList.length) {
              this.diagramNow = this.diagramList[0].elementId
              this.modelGraphKey++
            } else {
              this.$datablauMessage.error('当前模型没有可展示的主题域，请您添加主题域后再进行查看')
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getModelInfo (showEntity = false) {
      let query = {}
      if (this.version) {
        query = {
          version: this.version
        }
      }
      this.$http.post(`${HTTP.$archyServerUrl}object/object/info/${this.id}?setEntity=${showEntity}`, query)
        .then(res => {
          this.modelInfo = res.data
          this.modelInfo.id = res.data.modelId
          let combinedId = this.$route.query?.combinedId
          if (combinedId) {
            let obj = res.data.entities.find(item => item.combinedId === combinedId)
            this.checkEntityDetail(obj)
            this.$route.query.combinedId = ''
          }
          if (showEntity) {
            if (res.data.entities) {
              this.entities = res.data.entities || []
              let entitiesMap = {}
              this.entities.forEach(item => {
                entitiesMap[item.combinedId] = item
              })
              this.entitiesMap = entitiesMap
            } else {
              this.entities = []
              this.entitiesMap = {}
            }
            this.entitiesLoading = false
            this.getEntityPageData()
            return
          }

          this.entities = []
          if (res.data.objects) {
            this.objects = res.data.objects
            this.getObjectsPageData()
          }
          this.modelInfo.id && HTTP.getModelPermission({
            modelId: this.modelInfo.id
          })
            .then(data => {
              data = data || {}
              this.modelInfo.permission = data
              if (data.admin || data.editor || data.viewer) {
                this.getDiagrams()
              }
            })
            .catch(e => {
              this.$showFailure(e)
            })
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
    },
    hideEntityDetail () {
      this.showEntityDetail = false
    },
    getUdpCurrent () {
      const propertiesObj = this.info.additionalProperties || {}
      let additionalProperties = []
      this.udps.forEach(udp => {
        let udpData = propertiesObj[udp.propertyId]
        const obj = {
          name: udp.name,
          value: udpData,
          catalog: udp.catalog
        }
        // console.log(obj, 'obj')
        additionalProperties.push(obj)
      })
      this.additionalProperties = additionalProperties
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/next/components/basic/color.sass";
/deep/ .tree-icon.diagram {
  width: 24px!important;
  height: 24px!important;
  max-height: 24px!important;
}
.diagram-list-wrapper {
  font-size: 12px;
}
.model-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.udp-form-item {
  /deep/ .el-form-item__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.inline {
  display: inline-block;

  &:nth-of-type(3) {
    margin-right: 24px;
  }

  /deep/ .el-form-item__content {
    width: 220px;
  }

}

.button-box {
  position: absolute;
  top: 12px;
  right: 20px;
}

.detail-form {
  margin-left: 20px;

  /deep/ .el-form-item__content {
    max-width: 800px;
  }
}

.top-info-container {
  //border: 1px solid red;
  height: 46px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-between;

  .title {
    line-height: 20px;
    font-size: 20px;
    color: #555555;
    vertical-align: top;
  }

  .define-text {
    line-height: 14px;
    font-size: 14px;
    vertical-align: bottom;
  }

}

.object-publish-info .status {

  &::before {
    display: none;
  }

  &.A {
    color: #5CB793;
  }

  &.D {
    color: #F79B3F;
  }

  &.C {
    color: #4386F5;
  }

  &.X {
    color: #AFB4BF;
  }
}

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
  margin: 20px 20px 30px;
  line-height: 18px;
  border-left: 4px solid #409EFF;
  padding-left: 6px;
  font-size: 16px;
  color: #555;
}

///deep/ .el-form.db-form .el-form-item__label {
//  font-weight: bold;
//}

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

  .title {
    padding-left: 28px;
    font-size: 12px;
  }

  /deep/ {
    .el-collapse-item__wrap {
      border: none;
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
      background: rgba(64, 158, 255, 0.1);
      color: #409EFF;
    }

    &:hover {
      background: rgba(64, 158, 255, 0.1);
    }
  }
}

.content-panel-wrapper {
  position: absolute;
  left: 0px;
  top: 34px;
  right: 0;
  bottom: 0;
  overflow: auto;
  padding-right: 20px;

  .related-model-wrapper {
    position: absolute;
    left: 0px;
    top: 0px;
    right: 0;
    bottom: 0;
    overflow: hidden;
  }
}

.theme-title {
  display: inline-block;
  margin-left: 20px;
  border-left: 1px solid $blue;
  padding-left: 20px;
}

.ERD {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  bottom: 0;

  /deep/ .drap-box {
    left: 20px;
  }
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
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

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
      left: -115px;
      top: 4px
    }

    .content-wrapper {
      box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.15);
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

.top-hint.table-title {
  margin-bottom: 8px;
}

.table-container {
  position: relative;
  //border: 1px solid red;
  margin: 0 20px 0;
  min-height: 240px;
  //max-height: 500px;
  //top: 46px;
  //left: 20px;
  //right: 20px;
  //bottom: 50px;
}

.page-pagination {
  //border-top: 1px solid #ddd;
  //position: absolute;
  //bottom: 0;
  //left: 0;
  //right: 0;
  height: 50px;
  display: flex;
  padding-right: 20px;
  justify-content: flex-end;
  align-items: center;
}

.theme-box {
  position: relative;
  left: 16px;
  top: -10px;
}

.inner-business-object-detail {
  //border: 1px solid red;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2;
  background-color: #fff;
}

.top-info {
  height: 70px;
  //background: #F6F8FF;
  padding: 0 20px;
  position: relative;

  .left-info {
    display: flex;
    //border: 1px solid red;
    @include absPos();
    right: 300px;
    left: 20px;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;

    .icon-container {
      //border: 1px solid red;
      display: inline-block;
      width: 48px;
      height: 48px;
      margin-right: 8px;
      background: transparent url("../../../assets/images/search/business_object.svg") no-repeat center/contain;
    }

    .info-container {
      display: inline-block;
      //border: 1px solid red;
      color: #555;

      .title {
        font-size: 16px;
      }

      .define-text {
        line-height: 14px;
      }

    }
  }

  .right-button {
    float: right;
    height: 100%;
    padding-top: 16px;

    .object-publish-info {
      //border: 1px solid red;
      width: 220px;
      height: 40px;
      display: inline-block;
      vertical-align: top;

      .info-item {
        display: inline-block;
        line-height: 16px;
        vertical-align: top;

        .info-label {
          font-size: 14px;
        }

        .info-text {
          display: inline-block;
          margin-top: 5px;
        }

        &.status-item {
          $statusWidth: 70px;
          width: $statusWidth;

          .info-label {
            //text-align: center;
            display: inline-block;
            text-indent: 4px;
            width: 100%;
          }

          .info-text {
            display: inline-block;
            line-height: 20px;
            height: 20px;
            width: 100%;
            border-radius: 10px;

            .status-label {
              vertical-align: top;
              font-size: 12px;
              display: inline-block;
              width: 50px;
              text-align: center;
              height: 20px;
              line-height: 20px;
            }

            &.A {
              background-color: #EFF8E7; // 已发布
            }

            &.D {
              background-color: #FFF1E8; // 待审核
            }

            &.C {
              background-color: #EBF5FF; // 审核中
            }

            &.X {
              background-color: #F6F7F8; // 已废弃
            }

          }

          .status-icon {
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            //border: 1px solid red;
          }

          &.A {
            color: #5CB793;
          }

          &.D {
            color: #F79B3F;
          }

          &.C {
            color: #4386F5;
          }

          &.X {
            color: #AFB4BF;
          }
        }
      }

      .item-border {
        border-right: 1px solid #DDD;
        height: 100%;
        display: inline-block;
        margin: 0 16px;
      }
    }
  }
}

.tabs-header-container {
  height: 30px;
  padding: 0 20px;
}

.tabs-content-container {
  //border: 1px solid red;
  position: absolute;
  top: 100px;
  bottom: 0px;
  left: 0;
  right: 0;
  z-index: 1;
}

.entity-detail-wrapper {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0;
  right: 0;
  z-index: 2;
  background-color: #fff;
}

.list-table-link {
  cursor: pointer;

  &:hover {
    color: $primary-color
  }
}
</style>

<style lang="scss">
.el-dialog__wrapper .theme-create-form2.el-dialog {
  max-height: unset !important;

  .el-form.db-form .datablau-input {
    width: 100%;
  }

  textarea {
    font-family: Arial;
  }

  .el-textarea__inner {
    min-height: unset !important;
    height: 96px !important;
  }

  .el-dialog__body {
    bottom: 60px;

    .datablau-dialog-content {
      .content-inner {
        margin-top: 16px;
      }
    }
  }

  .el-dialog__footer {
    padding-top: 22px;
  }

  .el-dialog__headerbtn {
    top: 14px;
  }
}

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
      margin-left: 0 !important;
    }

    & > i:nth-child(2) {
      left: 60px !important;
    }
  }
}

.theme-box .el-tree {
  font-size: 12px;
}
</style>
