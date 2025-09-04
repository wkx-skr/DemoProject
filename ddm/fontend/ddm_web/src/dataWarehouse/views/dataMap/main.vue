<template>
  <div class="con">
    <div id="dataMap">
    </div>
    <div class="searchBox">
      <div class="left">
        <datablau-input style="width:320px" clearable :iconfont-state="true" v-model="name" placeholder="搜索系统名称、表名称" @keydown.native.enter="getDataBySearch"></datablau-input>
      </div>
      <div class="right">
<!--        <div class="icon-see iconfont"></div>-->
        <datablau-button type="icon" class="icon-location iconfont" tooltipContent="定位" @click="orientation"></datablau-button>
        <datablau-button type="icon" class="icon-quanping1 iconfont" tooltipContent="全屏" v-if="!fullScreen"  @click="setFrameToFullScreen"></datablau-button>
        <datablau-button type="icon" class="icon-suoxiao iconfont" tooltipContent="还原" @click="setFrameToWindow"  v-else></datablau-button>
        <datablau-button type="icon" class="icon-return iconfont" tooltipContent="返回" @click="goBack" v-if="goBackFlag"></datablau-button>
      </div>
    </div>
    <!-- 点击系统 -->
      <div class="searchBoxRight" :style="{width: goBackFlag ? '436px' : '406px'}" v-if="information">
        <div class="top">
          <div class="title">{{information.categoryName}}</div>
          <div class="sTil">{{ information.categoryAbbreviation }}</div>
          <div class="description">描述：{{information.description ? information.description : '暂无描述'}}</div>
        </div>
        <div class="tableFlex">
          <datablau-tabs v-model="activeName" class="tabBBox" @tab-click="handleTabClick">
          <el-tab-pane label="基本信息" name="first">
            <ul class="information">
              <li><span>所属业务域</span>{{information.zone ? information.zone : '未指定业务域'}}</li>
              <li><span>IT部门</span>{{information.itDepartment}}</li>
              <li><span>负责人</span>{{information.owner}}</li>
              <li><span>当前状态</span>{{information.status}}</li>
              <li><span>部署地</span>{{information.deployment}}</li>
            </ul>
          </el-tab-pane>
          <el-tab-pane label="项目" name="second"></el-tab-pane>
          <el-tab-pane label="模型" name="third" v-if="ddmConnectable"></el-tab-pane>
          <el-tab-pane label="环境信息" name="four" v-if="customerId === 'gszc'"></el-tab-pane>
        </datablau-tabs>
          <div class="tableBto">
            <datablau-table
              :data="interface"
              v-loading="loading"
              height="100%"
              v-show="activeName === 'second'"
              show-overflow-tooltip
            >
              <el-table-column
                prop=""
                label=""
                width="10">
              </el-table-column>
              <el-table-column
                prop=""
                label="#"
                width="40">
                <template slot-scope="scope">
                  {{ scope.$index + 1 }}
                </template>
              </el-table-column>
              <el-table-column
                prop="name"
                label="项目名称"
                align="center"
              >
                <template slot-scope="{row}">
                  <span @click="goToProgram(row.id, 'proc')" style="cursor:pointer;" class="activeSpan">{{row.name}}</span>
                </template>
              </el-table-column>
            </datablau-table>
            <datablau-table
              :data="modelData"
              show-overflow-tooltip
              v-show="activeName === 'third'"
              height="100%"
            >
              <el-table-column
                prop=""
                label=""
                width="10">
              </el-table-column>
              <el-table-column
                prop="path"
                label="路径">
              </el-table-column>
              <el-table-column
                prop="name"
                label="名称">
              </el-table-column>
              <el-table-column
                prop="description"
                label="描述"
              >
              </el-table-column>
            </datablau-table>
            <datablau-table
          :data="environmentData"
          show-overflow-tooltip
          v-show="activeName === 'four'"
        >
          <el-table-column
            prop=""
            label=""
            width="10">
          </el-table-column>
          <el-table-column
            prop="label"
            width="150"
            label="用途">
          </el-table-column>
          <el-table-column
            prop="value"
            label="数据源">
          </el-table-column>
        </datablau-table>
          </div>
        </div>
      </div>
    <!-- 点击数据源 -->
      <div v-if="modelDetail" :style="{width: goBackFlag ? '436px' : '406px'}" class="searchBoxRight">
        <div class="top">
          <div class="title">{{modelDetail.categoryName}}</div>
          <div class="sTil"><span class="dropTop"></span>{{ modelDetail.definition}}</div>
        </div>
        <div class="tableFlex">
          <datablau-tabs v-model="activeName" class="intoPane" @tab-click="handleTabClick">
            <el-tab-pane label="基本信息" name="first">
              <ul class="information" v-if="modelDetail.reverseOptions">
                <li><span>版本</span>{{modelDetail.reverseOptions.DBVersion}}</li>
                <li><span>IP地址</span>{{modelDetail.reverseOptions.HostServer}}</li>
                <li><span>负责人</span>{{modelDetail.owner}}</li>
                <li><span>Schema</span><div>{{modelDetail.reverseOptions.SelectedSchemas}}</div></li>
              </ul>
            </el-tab-pane>
            <el-tab-pane :label="'表(' + modelTable.length + ')'" name="table">
            </el-tab-pane>
          </datablau-tabs>
          <div class="tableBto">
            <div v-show="activeName === 'table'" style="height: 100%;display: flex;flex-direction: column;position: relative">
              <datablau-input
                v-model="keyWords"
                class="tableSeclect"
                v-if="activeName === 'table'"
                :iconfont-state="true"
                :placeholder="'搜索模型内的表'"
                @keyup.enter.native="getModelTable"
                @clear="getModelTable"
                clearable></datablau-input>
              <div style="position: absolute;top: 34px;bottom: 0;left: 0;right: 0">
                <datablau-table
                :data="modelTable"
                v-loading="loading"
                class="modelTab"
                height="100%"
                @row-click="rowClick"
                show-overflow-tooltip
              >
                <el-table-column
                  prop=""
                  label=""
                  width="30">
                  <template scope="{row}">
                    <datablau-tooltip class="item" effect="dark" :content="row.lineageBindStatus === true ? '有血缘关系' : ''" placement="top" :disabled="row.lineageBindStatus !== true">
                      <div class="drop" :class="{'have': row.lineageBindStatus === true}"></div>
                    </datablau-tooltip>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="physicalName"
                  label="英文名称"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="name"
                  show-overflow-tooltip
                  label="中文名称">
                </el-table-column>
                <el-table-column
                  prop="definition"
                  label="描述"
                >
                </el-table-column>
              </datablau-table>
              </div>
            </div>
          </div>
        </div>

      </div>
    <!-- 搜索结果 -->
      <div v-if="showSearchBox" :style="{width: goBackFlag ? '436px' : '406px'}" class="searchBoxRight">
<!--      <div style="padding-left: 20px">搜索结果</div>-->
      <datablau-tabs v-model="activeName" class="searchListBox intoPane" @tab-click="handleTabClick">
        <el-tab-pane :label="'系统(' + systemSearList.length + ')'" name="first">
          <ul class="systemList">
            <li v-for="item in systemSearList" :key="item.id" @click="orientationNode(item)">
              <div class="titleName">
                <i class="icon-xitong iconfont"></i>
                {{ item.categoryName }}({{ item.categoryAbbreviation }})
              </div>
              <div class="property" style="margin-top: 0.5em">
                <span > IT部门：</span>{{ item.itDepartment }}
              </div>
              <div style="margin-top: 0.5em">
                <span>所属业务域：</span>{{ item.zone || '未指定业务域' }}
              </div>
              <div
                class="description"
                style="margin-top: 0.5em"
              >
                <span>描述：</span>{{item.description ? item.description : '暂无描述'}}
              </div>
            </li>
          </ul>
        </el-tab-pane>
        <el-tab-pane :label="'表(' + modelTable.length + ')'" name="tables">
          <ul class="systemList">
            <li v-for="item in modelTable" :key="item.id" @click="rowClick(item)">
              <div class="titleName">
                <i class="icon-biao iconfont"></i>
                {{ item.physicalName }}
              </div>
             <!-- <div class="property" style="margin-top: 0.5em">
                <span> 中文名： </span>{{ item.name }}
              </div>-->
              <div style="margin-top: 0.5em">
                <span>所属模型：</span>{{ item.zone || item.parentPhysicalName }}
              </div>
              <div
                class="description"
                style="margin-top: 0.5em"
              >
                <span>描述信息：</span>{{item.definition ? item.definition : '暂无描述'}}
              </div>
            </li>
          </ul>
        </el-tab-pane>
      </datablau-tabs>
    </div>
      <!-- 单击线 -->
      <div v-if="edgeClick" :style="{width: goBackFlag ? '436px' : '406px'}" class="searchBoxRight">
        <div>
          <div class="lingeDetail title oneline-eclipse" :title="fromText+' >> ' + toText">
            <span>{{ fromText }}</span>
            <i class="fa fa-arrow-right"></i>
            <span>{{ toText }}</span>
          </div>
        </div>
        <div class="tableFlex">
          <datablau-tabs v-model="activeName" class="searchListBox intoPane" @tab-click="handleTabClick">
            <el-tab-pane :label="'开发程序'" name="program" v-if="iface">

            </el-tab-pane>
            <el-tab-pane :label="'表级血缘'" name="blood" v-if="blood">

            </el-tab-pane>
            <el-tab-pane :label="'表级血缘'" name="modelEdgeClick" v-if="modelEdgeClick">

            </el-tab-pane>
          </datablau-tabs>
          <div class="tableBto">
            <datablau-table
              :data="programList"
              v-loading="loading"
              height="100%"
              v-show="activeName === 'program'"
              show-overflow-tooltip
            >
              <el-table-column
                prop=""
                label=""
                width="10">
              </el-table-column>
              <el-table-column
                prop=""
                label="#"
                width="40">
                <template slot-scope="scope">
                  {{ scope.$index + 1 }}
                </template>
              </el-table-column>
              <el-table-column
                prop="fileName"
                show-overflow-tooltip
                label="程序名称">
                <template slot-scope="{row}">
                  <span @click="checkKinship(row)" style="cursor:pointer;" class="activeSpan">{{row.fileName}}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="projectName"
                label="项目名称"
                show-overflow-tooltip
              >
                <template slot-scope="{row}">
                  <span @click="goToProgram(row)" style="cursor:pointer;" v-if="row.projectName" class="activeSpan">{{row.projectName}}</span>
                  <span v-else>来自DAM</span>
                </template>
              </el-table-column>
            </datablau-table>
            <datablau-table
              :data="detail.lineage"
              v-loading="loading"
              v-show="activeName === 'blood'"
              height="100%"
              show-overflow-tooltip
            >
              <el-table-column
                prop=""
                label=""
                width="10">
              </el-table-column>
              <el-table-column
                prop=""
                label="#"
                width="40">
                <template slot-scope="scope">
                  {{ scope.$index + 1 }}
                </template>
              </el-table-column>
              <el-table-column
                prop="from.model"
                show-overflow-tooltip
                label="源模型">
              </el-table-column>
              <el-table-column
                prop="from.tab"
                label="源表"
                show-overflow-tooltip
              >
              </el-table-column>
              <el-table-column
                prop="to.model"
                show-overflow-tooltip
                label="目标模型"
              >
              </el-table-column>
              <el-table-column
                prop="to.tab"
                label="目标表"
                show-overflow-tooltip
              >
              </el-table-column>
            </datablau-table>
            <datablau-table
              :data="detail.lineage"
              v-loading="loading"
              v-show="activeName === 'modelEdgeClick'"
              height="100%"
              @row-click="modeLineage"
              show-overflow-tooltip
              style="cursor: pointer"
            >
              <el-table-column
                prop=""
                label=""
                width="10">
              </el-table-column>
              <el-table-column
                prop=""
                label="#"
                width="40">
                <template slot-scope="scope">
                  {{ scope.$index + 1 }}
                </template>
              </el-table-column>
              <el-table-column
                prop="fromTab"
                label="源表"
                show-overflow-tooltip
              >
                <template slot-scope="{row}">
                  <span class="activeSpan">{{row.fromTab}}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="toTab"
                label="目标表"
                show-overflow-tooltip
              >
                <template slot-scope="{row}">
                  <span class="activeSpan">{{row.fromTab}}</span>
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </div>

    </div>
    <!-- 源到源的单机线 -->
    <!--<div v-if="modelEdgeClick"  :style="{width: goBackFlag ? '436px' : '406px'}" class="searchBoxRight">
      <div>
        <div class="lingeDetail title oneline-eclipse" :title="fromText+' >> ' + toText">
          <span>{{ fromText }}</span>
          <i class="fa fa-arrow-right"></i>
          <span>{{ toText }}</span>
        </div>
      </div>
      <div class="tableFlex">
        <datablau-tabs v-model="activeName" class="searchListBox intoPane" @tab-click="handleTabClick">
          <el-tab-pane :label="'表级血缘'" name="blood" v-if="blood">

          </el-tab-pane>
        </datablau-tabs>
        <div class="tableBto">

        </div>
      </div>
    </div>-->
    <rawData class="rawData" @close="close" :object="object" v-if="showRawData"></rawData>
    <lineageCom v-if="routineBlood" :propertiesFileData="propertiesFileData" @close="close"></lineageCom>
  </div>
</template>

<script>
import { register } from '@antv/x6-vue-shape'
import { Graph } from '@antv/x6'
import image from '@/assets/images/database/system.png'
import rawData from '@/dataWarehouse/views/dataMap/rawData'
import system from '@/dataWarehouse/views/dataMap/system'

import HTTP from '@/resource/http'
import insertCss from 'insert-css'
import lineageCom from './lineageCom'
export default {
  components: {
    rawData,
    lineageCom
  },
  beforeCreate () {
  },
  mounted () {
    // this.initEdge()
    this.registerNode()
    let dataMap = document.getElementById('dataMap')
    this.init(dataMap)
    this.getPublic()
    document.addEventListener(
      'webkitfullscreenchange',
      (e) => {
        if (!e.currentTarget.webkitIsFullScreen) {
          this.setFrameToWindow()
        } else {
          this.setFrameToFullScreen()
        }
      }
    )
  },
  beforeDestroy () {
  },
  data () {
    return {
      name: '',
      keyWords: '',
      modelId: '',
      object: {},
      goBackFlag: false,
      showRawData: false,
      dataMapShow: true,
      graph: null, // 初始化
      graph2: null, // 初始化
      systemName: '', // 系统名称
      shorthand: '', // 系统简写
      type: '', // 数据库类型
      image: image,
      nodeObj: {},
      fullScreen: false,
      allDataSource: [], //
      filterList: [],
      hierarchy: [],
      lineList: [],
      systemCall: [],
      interface: [],
      modelData: [],
      environmentData: null,
      activeName: 'first',
      information: null,
      loading: false,
      ddmConnectable: false,
      customerId: null,
      tableLevelData: [],
      programList: null,
      call: [],
      nodes: [],
      edges: [],
      itemEdges: [],
      categoryMap: {},
      sourceMap: {},
      groupMap: {},
      tableSystemList: [],
      modelTable: [],
      modelDetail: null,
      rawData: {},
      // categoryCnt: 0,
      systemSearList: [],
      showSearchBox: false,
      detail: {
        lineage: [],
        call: null
      },
      fromId: null,
      toId: null,
      fromText: '',
      toText: '',
      blood: true,
      iface: true,
      edgeClick: false,
      modelEdgeClick: false,
      routineBlood: false,
      propertiesFileData: {}
      // edgList: []
      // oldNode: {}
    }
  },
  watch: {
    /* modelId (val) {
      if (!val) return
      this.getModelDetail()
    } */
  },
  methods: {
    // 表点击获取详情
    getModelDetail () {
      this.$http.get(`${HTTP.$damServerUrl}models/${this.modelId}/plain`)
        .then(res => {
          this.modelTable = []
          this.modelDetail = res.data
          // 获取表
          this.getModelTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 模型表格点击
    rowClick (row, column, event) {
      this.object = row
      console.log(this.object, 'this.object')
      this.showRawData = true
    },
    modeLineage (data) {
      data.objectId = data.fromTabId
      data.physicalName = data.fromTab
      this.object = data
      this.showRawData = true
    },
    // 点击系统，高亮
    orientationNode (item) {
      this.goBackFlag && this.goBack()
      let all = this.graph.getNodes()
      let nodes = this.graph.getCellById(item.categoryId)
      all.forEach(item => {
        item.setData({
          highlight: false
        })
      })
      nodes.setData({
        highlight: true
      })
      this.showSearchBox = true
      let position = nodes.position()
      // this.graph.zoomTo(1.5)
      this.graph.centerPoint(position.x + 200, position.y)
    },
    close () {
      this.showRawData = false
      this.routineBlood = false
    },

    async getPublic () {
      const about = await this.$http.post(`${this.$gateway}main/about`)
      this.ddmConnectable = this.$enableList.indexOf('ddm') !== -1
      this.customerId = about.data.customerId
    },
    // 全屏
    setFrameToFullScreen () {
      this.fullScreen = true
      $('.con').css('position', 'fixed')
      $('.db-heading').hide()
      $('#top-menu').hide()
      this.$fullScreen()
      this.close()
    },
    // 取消全屏
    setFrameToWindow () {
      this.fullScreen = false
      $('.con').css('position', 'absolute')
      $('.db-heading').show()
      $('#top-menu').show()
      this.$exitFullScreen()
    },
    // 定位
    orientation () {
      this.graph.zoomTo(1)
      /* let nodes = this.graph.getNodes()
      let index = Math.floor(nodes.length / 2)
      let position = nodes[index].position()
      this.graph.centerPoint(position.x + 200, position.y) */
      let y = this.allDataSource.filter(v => v.y).map(v => v.y).sort((a, b) => a - b)
      let num = y[Math.floor(y.length / 2)]
      this.graph.centerPoint(480, num)
      // this.graph.centerContent()
      this.close()
    },
    handleTabClick () {
      switch (this.activeName) {
        case 'second':
          if (!this.interface) {
            this.getProjectData()
          }
          break
        case 'third':
          if (!this.modelData) {
            this.getModelData()
          }
          break
        case 'four':
          if (!this.environmentData) {
            this.getEnvironmentData()
          }
          break
        case 'table':
          if (!this.environmentData) {
            this.getModelTable()
          }
          break
      }
    },
    // 获取接口
    /* getCallData () {
      if (!this.information.categoryId) return
      const callMap = {}
      this.loading = true
      this.$http
        .post(`${HTTP.$damServerUrl}systemcall/search`, {
          currentPage: 0,
          pageSize: 500,
          srcModelCategoryIds: [this.information.categoryId]
        })
        .then(res => {
          const srcContent = res.data.content
          srcContent.forEach(item => {
            const id = 'out:' + item.calleeModelCategoryId
            if (!callMap.hasOwnProperty(id)) {
              callMap[id] = []
            }
            callMap[id].push(item)
          })
          this.$http
            .post(`${HTTP.$damServerUrl}systemcall/search`, {
              currentPage: 0,
              pageSize: 500,
              dstModelCategoryIds: [this.information.categoryId]
            })
            .then(res => {
              res.data.content.forEach(item => {
                const id = 'in:' + item.calleeModelCategoryId
                if (!callMap.hasOwnProperty(id)) {
                  callMap[id] = []
                }
                callMap[id].push(item)
              })
              this.handleCallMap(callMap)
              this.loading = false
            })
            .catch(e => {
              this.$showFailure(e)
              this.loading = false
            })
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    }, */
    // 获取项目列表
    getProjectData () {
      if (!this.information.categoryId) return
      this.$http.get(`${HTTP.$dddServerUrl}dataMap/${this.information.categoryId}`)
        .then(res => {
          this.interface = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取开发程序
    getProgramList (type) {
      if (!this.fromId || !this.toId) return
      let from = this.fromId + ''
      let to = this.toId + ''
      if (from?.indexOf('m') === 0 || from?.indexOf('c') === 0) {
        from = Number(from.substring(1))
      }
      if (to?.indexOf('m') === 0 || to?.indexOf('c') === 0) {
        to = Number(to.substring(1))
      }
      this.$http.get(`${HTTP.$dddServerUrl}dataMap/${from}/${to}/${type}`)
        .then(res => {
          this.programList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 跳转到项目
    goToProgram (row, type) {
      let id
      if (type === 'proc') {
        id = row
      } else {
        id = row.projectId
      }
      if (!id) return
      this.$http.get(`${this.$dddUrl}/service/project/auth/devlopment?projectId=${id}`)
        .then(res => {
          this.$http.get(`${this.$dddUrl}/service/datasource/auth/refresh?projectId=${id}`)
            .then(res => {})
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(`${baseUrl}sql_editor?projectId=${id}&fileId=${row.codeDetailId}`)
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    // 查看血缘
    checkKinship (row) {
      console.log(row, 'row')
      // ddd项目
      if (row.projectName) {
        this.$http.get(`${this.$dddUrl}/service/code/file/${row.codeDetailId
        }?projectId=${row.projectId}`)
          .then(res => {
            res.data.fileName = row.fileName
            this.propertiesFileData = res.data
            this.propertiesFileData.lineageId = row.lineageId
            this.routineBlood = true
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
      //  dam血缘导入
        this.$http.get(`${this.$damUrl}/service/lineage/${row.lineageId}`)
          .then(res => {
            let data = {
              rawData: res.data,
              fileName: row.fileName
            }
            this.propertiesFileData = data
            this.routineBlood = true
            /* res.data.fileName = row.fileName
            this.propertiesFileData = res.data
            this.routineBlood = true */
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    // 获取模型
    getModelData () {
      if (!this.information.categoryId) return
      const url = `${HTTP.$damServerUrl}models/ddm/systems/${this.information.categoryId}/models`
      this.$http
        .get(url)
        .then(res => {
          this.modelData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取环境
    getEnvironmentData () {
      if (!this.information.categoryId) return
      const modelCategoryId = this.information.categoryId
      const url = `${HTTP.$damServerUrl}models/category/${modelCategoryId}`
      this.$http
        .get(url)
        .then(res => {
          this.environmentData = []
          if (Array.isArray(res.data)) {
            res.data.forEach(item => {
              if (item.connectionInfo.parameterMap.Zone) {
                this.environmentData.push({
                  label: item.connectionInfo.parameterMap.Zone,
                  value: item.definition,
                  detail: item
                })
              }
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取model的表信息
    getModelTable () {
      this.modelTable = []
      const url = `${HTTP.$damServerUrl}entities/searchMetadata`
      this.$http
        .post(url, {
          currentPage: 1,
          keyword: this.keyWords || this.name,
          modelIds: this.modelId === '' ? null : [this.modelId],
          pageSize: 500,
          types: ['TABLE']
        })
        .then(res => {
          this.modelTable = res.data.content
          this.modelTable.forEach(item => {
            if (item.name === item.physicalName) {
              item.name = ''
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    /* handleCallMap (callMap) {
      this.interface = []

      for (const index in callMap) {
        const dir = index.split(':')[0]
        const categoryId = index.split(':')[1]
        const details = callMap[index]
        const length = details.length
        this.interface.push({
          dir: dir,
          categoryId: categoryId,
          categoryName: this.information.categoryName,
          //            details:details,
          length: length,
          icon: 'call'
        })
      }
    }, */
    init (container, graph) {
      let graphs = graph || 'graph'
      const width = document.getElementById('dataMap').scrollWidth || 800
      const height = document.getElementById('dataMap').scrollHeight || 800
      this[graphs] = new Graph({
        container,
        selecting: {
          enabled: true,
          multiple: true,
          rubberband: true,
          rubberEdge: true,
          movable: true,
          showNodeSelectionBox: false
        },
        interacting: () => {
          return { nodeMovable: false, edgeMovable: false } // 节点不能拖拽，要是放开，需要把系统得节点隐藏
        },
        scaling: {
          min: 0.2,
          max: 2
        },
        mousewheel: {
          enabled: true,
          modifiers: ['ctrl', 'meta']
        },
        width,
        height,
        autoResize: true,
        panning: true,
        background: { color: '#F7F8FC' },
        connecting: {
          router: {
            name: 'er',
            args: {
              direction: 'H'
            }
          }
        },
        embedding: {
          enabled: true
        },
        highlighting: {
          embedding: {
            name: 'stroke',
            args: {
              padding: -1,
              attrs: {
                stroke: '#73d13d'
              }
            }
          }
        }
      })
      /* this.graph.on('node:click', (e) => {
        // e.stopPropagation()
        console.log(e.target)
      }) */
      // 双击
      /* this.graph.on('node:dblclick', (e) => {
        // e.stopPropagation()
        // console.log(e)
        this.itemEdges = []
        this.tableSystemList = []
        this.nodes = []
        this.edges = []
        this.sourceMap = {}
        this.categoryMap = {}
        this.groupMap = {}
        this.findSystemCall(e.node.id, null, () => {
          this.relationships(e.node.id)
        })
      }) */
      this.graph.on('edge:click', (e) => {
        let edge = e.edge.store.data
        this.activeName = 'first'
        this.information = null
        this.modelDetail = null
        this.showSearchBox = null
        this.modelId = ''
        let from = edge.source.cell?.toString()
        let to = edge.target.cell?.toString()
        let nodesAll = this.graph.getNodes()
        nodesAll.forEach(item => {
          let text = item.store.data.data.text
          if (item.id.toString() === from?.toString() || item.id.toString() === edge.cell?.toString()) {
            this.fromText = text
            this.fromId = item.id
          }
          if (item.id.toString() === to?.toString() || item.id.toString() === edge.cell?.toString()) {
            this.toText = text
            this.toId = item.id
          }
        })
        this.detail = {
          lineage: [],
          call: null
        }
        if (edge.cell) {
          if (edge.cell.toString().indexOf('c') !== -1) {
            this.blood = false
            this.iface = true
            this.edgeClick = true
            this.modelEdgeClick = false
            this.getCall(edge.cell, edge.cell)
            return
          }
          if (edge.cell.toString().indexOf('m') !== -1) {
            this.edgeClick = true
            this.modelEdgeClick = false
            this.blood = true
            this.iface = true
            this.activeName = 'program'
            this.getProgramList(1)
            this.getTableLineage(edge.cell, edge.cell)
            return
          }
          this.getCall(edge.cell, edge.cell)
          this.getTableLineage(edge.cell, edge.cell)
          // 第一层的系统到系统 都是数字 自己指向自己
          // from = edge.source.cell
          // to = edge.target.cell
          this.blood = true
          this.iface = true
          this.edgeClick = true
          this.modelEdgeClick = false
          this.activeName = 'program'
          this.getProgramList(0)
          return
        }
        if (to.indexOf('c') !== -1 && from.indexOf('c') !== -1) {
          // 系统到系统, 下一层的
          // from = edge.source.cell.toString().substring(1)
          // to = edge.target.cell.toString().substring(1)
          this.blood = false
          this.iface = true
          this.activeName = 'program'
          this.getProgramList(0)
          this.edgeClick = true
          this.modelEdgeClick = false
          this.getCall(from, to)
        } else if (to.indexOf('m') !== -1 && from.indexOf('m') !== -1) {
          // 表到表, 下一层的
          // from = edge.source.cell.toString().substring(1)
          // to = edge.target.cell.toString().substring(1)
          this.modelEdgeClick = true
          this.edgeClick = true
          this.blood = false
          this.iface = true
          this.activeName = 'program'
          // this.getTableLineage(from, to)
          this.getProgramList(1)
          this.showEdgeDetail(from, to)
        } else if (!isNaN(to) && !isNaN(from)) {
          this.getCall(from, to)
          this.getTableLineage(from, to)
          // 第一层的系统到系统 都是数字
          // from = edge.source.cell
          // to = edge.target.cell
          this.blood = true
          this.iface = true
          this.edgeClick = true
          this.modelEdgeClick = false
          this.activeName = 'program'
          this.getProgramList(0)
        } else {
          // 系统到表 不显示
          this.edgeClick = false
          this.modelEdgeClick = false
        }
        /* if (edge.type === 'lineage' || edge.type === 'both') {
          this.getTableLineage(from, to)
        } else {
          this.detail.lineage = []
        }
        if (edge.type === 'call' || edge.type === 'both') {
          this.getCall(from, to)
        } else {
          this.detail.call = []
        } */
      })
      this.graph.on('edge:dblclick', (e) => {
        // console.log(e.edge.store.data, 'edge')
        this.itemEdges = []
        this.tableSystemList = []
        let edge = e.edge.store.data
        this.findSystemCall(edge.target.cell, edge.source.cell, () => {
          this.relationships(edge.source.cell, edge.target.cell)
        })
      })
      this.graph.on('blank:click', (e) => {
        this.modelDetail = null
        this.information = null
        this.keyWords = ''
        this.showSearchBox = false
        this.edgeClick = false
        this.modelEdgeClick = false
        let all = this.graph.getNodes()
        all.forEach(item => {
          item.setData({
            highlight: false,
            showDetail: false,
            db: false
          })
        })
        // this.orientation()
      })

      // 获取数据源
      this.getStatistics()
    },
    getTableLineage (from, to) {
      from = isNaN(from) ? from.toString().substring(1) : from
      to = isNaN(to) ? to.toString().substring(1) : to
      let requestUrl =
        HTTP.$damServerUrl + 'lineage/relationships?catId=' + from
      if (to) {
        requestUrl += '&targetCatId=' + to
      }
      this.$http
        .get(requestUrl).then(res => {
          this.detail.lineage = []
          const lineage = this.detail.lineage
          const data = res.data
          const endpoints = data.endpoints
          const relationships = data.relationships
          relationships.forEach(r => {
            lineage.push({
              from: endpoints[r.first],
              to: endpoints[r.second]
            })
          })
          // this.detail.lineage = lineage
          // console.log(this.detail.lineage, lineage)
        })
    },
    showEdgeDetail (from, to) {
      if (from.indexOf('m') === 0) {
        from = Number(from.substring(1))
      }
      if (to.indexOf('m') === 0) {
        to = Number(to.substring(1))
      }
      const lineageArr = []
      const { endpoints, relationships } = this.rawData.rawData
      relationships.forEach(v => {
        const fromPoint = endpoints[v.first]
        const toPoint = endpoints[v.second]
        if (fromPoint.modelId === from && toPoint.modelId === to) {
          lineageArr.push({
            fromTab: fromPoint.tab,
            fromTabAlias: fromPoint.tabAlias,
            fromTabId: fromPoint.tabId,
            toTab: toPoint.tab,
            toTabAlias: toPoint.tabAlias,
            toTabId: toPoint.tabId
          })
        }
      })
      this.detail.lineage = lineageArr
    },
    getCall (from, to) {
      from = isNaN(from) ? from.toString().substring(1) : from
      to = isNaN(to) ? to.toString().substring(1) : to
      const requestUrl = HTTP.$damServerUrl + 'systemcall/search'
      const requestBody = {
        pageSize: 500,
        currentPage: 0,
        srcModelCategoryIds: [to],
        dstModelCategoryIds: [from]
      }
      this.$http
        .post(requestUrl, requestBody)
        .then(res => {
          this.detail.call = res.data.content
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取数据源
    getStatistics () {
      this.$http
        .post(`${HTTP.$damBase}modelCategory/getModelCategories`)
        .then(res => {
          this.allDataSource = res.data
          // 获取系统之间的关系
          this.getSystemCall()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取系统之间关系
    getSystemCall () {
      this.$http
        .get(`${HTTP.$damServerUrl}systemcall/overview`)
        .then(res => {
          res.data.forEach(item => {
            this.systemCall.push({
              sourceId: item.dstSystemId,
              targetId: item.srcSystemId
            })
          })
          // 获取绘图线和节点关系
          this.getOverview()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取线和节点
    getOverview () {
      this.$http
        .get(`${HTTP.$damServerUrl}lineage/overview`)
        .then(res => {
          let data = res.data
          Object.keys(data.steps).forEach(item => {
            let line = data.lines.find(v => v.sourceStepId === item)
            if (!line) {
              line = data.lines.find(v => v.targetStepId === item)
            }
            data.steps[item].sourceId = data.steps[line.sourceStepId].properties.modelCategoryId
            data.steps[item].targetId = data.steps[line.targetStepId].properties.modelCategoryId
          })
          this.lineList = Object.values(data.steps)
          let haveLineList = [...this.systemCall, ...this.lineList]
          this.allDataSource.forEach(async item => {
            let haveLine = haveLineList.filter(v => Number(v.sourceId) === item.categoryId)
            if (haveLine.length === 1) {
              haveLine = haveLine[0]
              item.allTable = 0
            } else {
              item.allTable = haveLine.length
              // 查找每个终点，并加序号
              haveLine.forEach((v, i) => {
                let obj = this.allDataSource.find(k => k.categoryId === v.targetId)
                obj && (obj.frequency = i)
                !item.targetId && (item.targetId = v ? v.targetId : '')
                !item.sourceId && (item.sourceId = v ? v.sourceId : '')
                !item.arrows && (item.arrows = v ? haveLine.v : '')
              })
            }
            if (!haveLine && !haveLine.length) {
              haveLine = haveLineList.find(v => Number(v.targetId) === item.categoryId)
            }
            !item.targetId && (item.targetId = haveLine ? haveLine.targetId : '')
            !item.sourceId && (item.sourceId = haveLine ? haveLine.sourceId : '')
          })
          this.addNode()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 添加节点
    addNode () {
      let ary = [...this.lineList, ...this.systemCall]
      let x = []
      let y = []
      ary.forEach(item => {
        x = this.allDataSource.filter(v => v.x).map(v => v.x)
        y = this.allDataSource.filter(v => v.y).map(v => v.y)
        let source = this.allDataSource.find(v => v.categoryId === Number(item.sourceId))
        let target = this.allDataSource.find(v => v.categoryId === Number(item.targetId))
        // console.log([source.categoryName, source.x, source.y], [target.categoryName, target.x, target.y], '11111')
        if (!source || !target) return
        if (source.x && target.x) {
          // this.addEdge(item)
          return
        }
        if (!source.x) {
          source.child = []
          source.x = x.length ? Math.min(...x) : 228
          source.y = y.length ? Math.max(...y) + 170 : 220
          if (source.categoryId !== target.categoryId && !target.x) {
            target.x = source.x + 228
            target.y = !isNaN(target.frequency) ? source.y + 170 * (target.frequency - source.allTable / 2 + 1) : source.y
            // console.log([source.categoryName, source.x, source.y], [target.categoryName, target.x, target.y], '-=-')
            let maxY = y.length ? Math.max(...y) : ''
            if (maxY && target.y < maxY + 170) {
              target.y = maxY + 170
            }
            source.child.push(target.y)
            this.addItemNode(target)
          }
          this.addItemNode(source)
        } else if (source.x && !target.x) {
          // console.log(target.frequency, source.allTable)
          source.child = source.child || []
          target.x = source.x + 228
          target.y = !isNaN(target.frequency) ? source.y + 170 * (target.frequency - source.allTable / 2 + 1) : source.y
          let yMax = Math.max(...source.child) > Math.max(...y) ? Math.max(...source.child) : Math.max(...y)
          let maxY = y.length ? yMax : ''
          if (maxY && target.y < maxY + 170) {
            target.y = maxY + 170
          }
          source.child.push(target.y)
          // console.log([source.categoryName, source.x, source.y], [target.categoryName, target.x, target.y], 'q====q')
          this.addItemNode(target)
        } else {
          target.x = source.x + 228
          target.y = !isNaN(target.frequency) ? source.y + 170 * (target.frequency - source.allTable / 2 + 1) : source.y
          this.addItemNode(target)
        }
      })
      x = this.allDataSource.filter(v => v.x).map(v => v.x)
      y = this.allDataSource.filter(v => v.y).map(v => v.y)
      this.allDataSource.filter(v => !v.x).forEach((v, i) => {
        if (i > 4) {
          // 第六个开始为 5n-1 , 每5个为一组 x坐标为减去前一组的最后一个
          v.x = x.length ? (Math.min(...x) + 228 * i) - (Math.min(...x) + 228 * (5 * Math.floor(i / 5) - 1)) : 228 * i - (Math.min(...x) + 228 * (5 * Math.floor(i / 5) - 1))
        } else {
          v.x = x.length ? Math.min(...x) + 228 * i : 228 * i
        }
        v.y = y.length ? Math.max(...y) + 170 + 170 * Math.floor(i / 5) : 170 + 170 * Math.floor(i / 5)
        this.addItemNode(v)
      })
      this.addEdge()
      // this.graph.centerContent()
      /* let nodes = this.graph.getNodes()
      let index = Math.floor(nodes.length / 2)
      let position = nodes[index].position()
      this.graph.centerPoint(position.x + 200, position.y) */
      let yAry = this.allDataSource.filter(v => v.y).map(v => v.y).sort((a, b) => a - b)
      let num = yAry[Math.floor(yAry.length / 2)]
      this.graph.centerPoint(480, num)
    },
    addItemNode (item) {
      let obj = {
        id: item.categoryId,
        shape: 'cylinder',
        x: item.x,
        y: item.y,
        width: 128,
        height: 120,
        data: {
          text: `${item.categoryName}${item.categoryAbbreviation ? '(' + item.categoryAbbreviation + ')' : ''}`,
          id: item.categoryId,
          flag: 'system',
          type: item.type
        },
        ports: {
          items: [
            { id: '1', group: 'group1' },
            { id: '2', group: 'group2' },
            { id: '3', group: 'group3' },
            { id: '4', group: 'group4' }
          ],
          groups: {
            group1: { position: { name: 'top' }, zIndex: 1, attrs: { circle: { r: 0, magnet: 'true', stroke: 'rgba(0,0,0)', fill: 'rgba(0,0,0)', strokeWidth: 0 } } },
            group2: { position: { name: 'right' }, attrs: { circle: { r: 0, magnet: 'true', stroke: 'rgba(0,0,0)', fill: 'rgba(0,0,0)', strokeWidth: 0 } } },
            group3: { position: { name: 'bottom' }, attrs: { circle: { r: 0, magnet: 'true', stroke: 'rgba(0,0,0)', fill: 'rgba(0,0,0)', strokeWidth: 0 } } },
            group4: { position: { name: 'left' }, attrs: { circle: { r: 0, magnet: 'true', stroke: 'rgba(0,0,0)', fill: 'rgba(0,0,0)', strokeWidth: 0 } } }
          }
        }
      }
      let node = this.graph.addNode(obj)
      node.on('change:data', (res) => {
        // console.log(res, 'res')
        // 点击系统名称 双击
        if (res.current.showDetail && res.current.db) {
          this.itemEdges = []
          this.tableSystemList = []
          this.nodes = []
          this.edges = []
          this.sourceMap = {}
          this.categoryMap = {}
          this.groupMap = {}
          this.findSystemCall(res.current.id, null, () => {
            this.relationships(res.current.id)
          })
          node.setData({
            showDetail: false,
            db: false
          })
          return
        }
        if (res.current.showDetail) {
          this.modelDetail = null
          this.information = null
          this.showSearchBox = false
          this.edgeClick = false
          this.modelEdgeClick = false
          let all = this.graph.getNodes()
          all.forEach(item => {
            item.setData({
              highlight: false
            })
          })
          // this.orientation()
          this.keyWords = ''
          this.information = this.allDataSource.find(v => v.categoryId === res.current.id)
          res.current.type === 'category' && (this.information = this.allDataSource.find(v => v.categoryId === Number(res.current.id.slice(1))))
          res.current.type === 'model' && (this.modelId = res.current.id.slice(1))
          this.modelId && res.current.type === 'model' && this.getModelDetail()
          this.activeName = 'first'
          this.interface = null
          this.modelData = null
          node.setData({
            showDetail: false
          })
        }
      })
      // if (item.type) {
      //   item.sourceId && this.addItemEdge(item)
      //   return
      // }
      // console.log(item.sourceId, item.targetId)
      // item.sourceId && this.addEdge(item)
    },
    // 添加表单节点
    addTableNode () {
      this.tableSystemList = this.nodes.filter(v => v.type === 'category' || v.type === 'model')
      // console.log(this.tableSystemList, this.itemEdges)
      this.tableSystemList.forEach(item => {
        item.x = null
        item.y = null
        // item.drawEdge = false
        let haveLine = this.itemEdges.filter(v => v.sourceId === item.categoryId)
        if (haveLine.length === 1) {
          haveLine = haveLine[0]
        } else {
          item.allTable = haveLine.length
          // 查找每个终点，并加序号
          haveLine.forEach((v, i) => {
            let obj = this.tableSystemList.find(k => k.categoryId === v.targetId)
            obj.frequency = i
            if (v.arrows) {
              !item.targetId && (item.targetId = v ? v.targetId : '')
              !item.sourceId && (item.sourceId = v ? v.sourceId : '')
              !item.arrows && (item.arrows = v ? haveLine.v : '')
              // console.log(v, item.categoryName)
            }
          })
          return
        }
        if (!haveLine && !haveLine.length) {
          haveLine = this.itemEdges.find(v => v.targetId === item.categoryId)
        }
        // console.log(haveLine, item.categoryName)
        !item.targetId && (item.targetId = haveLine ? haveLine.targetId : '')
        !item.sourceId && (item.sourceId = haveLine ? haveLine.sourceId : '')
        !item.arrows && (item.arrows = haveLine ? haveLine.arrows : '')
      })
      // console.log(this.itemEdges, 'this.itemEdges')
      this.itemEdges.forEach((item, i) => {
        this.setNode(item, this.tableSystemList)
      })
      this.addItemEdge()
      this.graph.centerContent()
    },
    setNode (item, node) {
      // console.log(node)
      let x = []
      let y = []
      x = node.filter(v => v.x).map(v => v.x)
      y = node.filter(v => v.y).map(v => v.y)
      let source = node.find(v => v.categoryId === item.sourceId)
      let target = node.find(v => v.categoryId === item.targetId)
      // console.log([item.sourceId, item.targetId], source.categoryName, target.categoryName, '----', source.x, target.x, target.frequency, source.allTable)
      if (source.x && target.x) {
        // 自己指向自己
        if (item.sourceId === item.targetId && !item.drawEdge) {
          item.drawEdge = true
          this.graph.addEdge({
            cell: item.sourceId,
            // type: 'two',
            source: { x: source.x + 128, y: source.y },
            target: { x: source.x, y: source.y },
            vertices: [{ x: source.x + 64, y: source.y - 40 }],
            connector: {
              name: 'rounded',
              args: { radius: 50 }
            },
            attrs: {
              line: {
                stroke: '#3D79D9',
                strokeWidth: 2
              }
            }
          })
          return
        }
        // this.addItemEdge(item)
        return
      }

      if (!source.x) {
        source.child = []
        source.x = x.length ? Math.min(...x) : 228
        source.y = y.length ? Math.max(...y) + 170 : 220
        if (source.categoryId !== target.categoryId && !target.x) {
          let maxY = y.length ? Math.max(...y) : ''
          target.x = source.x + 228
          target.y = !isNaN(target.frequency) ? source.y + 170 * (target.frequency - source.allTable / 2 + 1) : source.y
          if (maxY && Math.abs(target.y) < maxY + 170) {
            target.y = maxY + 170
          }
          source.child.push(target.y)
          // console.log(target.x, target.y, [source.x, source.y, source.categoryName])
          this.addItemNode(target)
        }
        this.addItemNode(source)
      } else if (source.x && !target.x) {
        // console.log(target.frequency, source.allTable)
        source.child = source.child || []
        let yMax = Math.max(...source.child) > Math.max(...y) ? Math.max(...source.child) : Math.max(...y)
        let maxY = y.length ? yMax : ''
        target.x = target.categoryId.toString().indexOf('c') !== -1 ? source.x : source.x + 228
        target.y = !isNaN(target.frequency) ? source.y + 170 * (target.frequency - source.allTable / 2 + 1) : source.y
        if (maxY && Math.abs(target.y) < maxY + 170) {
          target.y = maxY + 170
        }
        source.child.push(target.y)
        // console.log([source.categoryName, source.x, source.y], [target.categoryName, target.x, target.y], 'q====q')
        this.addItemNode(target)
      } else {
        target.x = source.x + 228
        target.y = !isNaN(target.frequency) ? source.y + 170 * (target.frequency - source.allTable / 2 + 1) : source.y
        this.addItemNode(target)
      }
    },
    // 连线
    addEdge (item) {
      let ary = [...this.lineList, ...this.systemCall]
      let i = 0
      let x = 0
      ary.forEach(item => {
        let source = this.allDataSource.find(v => v.categoryId === Number(item.sourceId))
        let target = this.allDataSource.find(v => v.categoryId === Number(item.targetId))
        // console.log(this.graph.getCellById(item.sourceId), this.graph.getCellById(target.sourceId))
        /* if (item.drawEdge) return
      item.drawEdge = true */
        // console.log(item.sourceId, item.targetId, source.categoryName, target.categoryName, this.graph.getCells())
        if (!source || !target) return
        // console.log([source.x, source.y], [target.x, target.y], [source.targetId, target.sourceId, source.categoryName, target.categoryName])
        // console.log([target.x, source.x, target.x - source.x], [target.y, source.y], [source.categoryName, target.categoryName])
        let vertices = []
        // 双向绑定
        if (source.targetId === target.sourceId && source.sourceId === target.targetId && item.sourceId !== item.targetId) {
          this.graph.addEdge({
            source: item.sourceId,
            target: item.targetId,
            attrs: {
              line: {
                sourceMarker: {
                  // args,
                  name: 'block'
                },
                targetMarker: {
                  // args,
                  name: 'block'
                },
                stroke: '#3D79D9',
                strokeWidth: 2
              }
            }
          })
          return
        }

        // 自己指向自己
        if (item.sourceId === item.targetId) {
        // console.log([source.x, source.y], [source.x, source.y + 110], item.categoryName)
          this.graph.addEdge({
            cell: item.sourceId,
            source: { x: source.x + 128, y: source.y },
            target: { x: source.x, y: source.y },
            vertices: [{ x: source.x + 64, y: source.y - 40 }],
            connector: {
              name: 'rounded',
              args: { radius: 50 }
            },
            attrs: {
              line: {
                stroke: '#3D79D9',
                strokeWidth: 2
              }
            }
          })
          return
        }
        // 起点和终点在一条线上，需要从上面绘图 同x
        if (target.x && (target.y === source.y)) {
          x++
          // console.log(source.categoryName, target.categoryName)
          if (Math.abs(target.x - source.x) > 228) {
            vertices = [{ x: source.x + 60, y: source.y - 24 - 21 * x }, { x: target.x + 60, y: target.y - 24 - 21 * x }]
            this.graph.addEdge({
              source: item.sourceId,
              target: item.targetId,
              shape: 'custom-edge',
              vertices,
              attrs: {
                line: {
                  stroke: '#3D79D9',
                  strokeWidth: 2
                }
              }
            })
          } else if (Math.abs(target.x - source.x) === 228) {
            this.graph.addEdge({
              source: { cell: item.sourceId, port: 2 },
              target: { cell: item.targetId, port: 4 },
              shape: 'custom-edge',
              attrs: {
                line: {
                  stroke: '#3D79D9',
                  strokeWidth: 2
                }
              }
            })
          }
          return
        }
        // 同y轴  上下挨着
        if (target.x === source.x) {
          // console.log([source.categoryName, target.categoryName], target.y - source.y)
          let port1; let port2; let vertices = []
          let start
          let end
          i++
          if (target.y - source.y === -170) {
            port1 = 1
            port2 = 3
            start = 'bottom'
            end = 'top'
          } else if (target.y - source.y < -170 || target.y - source.y >= 170) {
            port1 = 2
            port2 = 2
            start = 'right'
            end = 'right'
            vertices = [{ x: source.x + 128 + 21 * i, y: source.y + 60 }, { x: target.x + 128 + 21 * i, y: target.y + 60 }]
          }
          /* else if (target.y - source.y > 170) {
            port1 = 2
            port2 = 2
            start = 'right'
            end = 'right'
            vertices = [{ x: source.x + 128 + 10 * i, y: source.y + 60 }, { x: target.x + 128 + 10 * i, y: target.y + 60 }]
            // vertices = [{ x: source.x + 188, y: source.y + 60 }, { x: target.x + 188, y: target.y + 60 }]
          } */
          this.graph.addEdge({
            source: { cell: item.sourceId, port: port1 },
            target: { cell: item.targetId, port: port2 },
            vertices,
            connector: {
              name: 'rounded',
              args: { radius: 10 }
            },
            router: {
              name: 'manhattan',
              args: {
                startDirections: [start || 'bottom'],
                endDirections: [end || 'top']
              }
            },
            attrs: {
              line: {
                stroke: '#3D79D9',
                strokeWidth: 2,
                targetMarker: 'block'
              }
            }
          })
          return
        }
        this.graph.addEdge({
          source: item.sourceId,
          target: item.targetId,
          shape: 'custom-edge',
          router: {
            name: 'manhattan',
            args: {
              startDirections: ['bottom'],
              endDirections: ['top']
            }
          },
          attrs: {
            line: {
              stroke: '#3D79D9',
              strokeWidth: 2
            }
          },
          vertices
        })
      })
    },
    addItemEdge (item) {
      let i = 0
      let x = 0
      this.itemEdges.forEach(item => {
        let source = this.tableSystemList.find(v => v.categoryId === item.sourceId)
        let target = this.tableSystemList.find(v => v.categoryId === item.targetId)
        // console.log(item.drawEdge)
        if (item.drawEdge) return
        item.drawEdge = true
        // console.log([item.sourceId, item.targetId], [source.targetId, target.sourceId, source.sourceId, target.targetId], [source.x, source.y], [target.x, target.y], [ source.categoryName, target.categoryName, target.y - source.y ], target.x - source.x)
        // 互相指向
        if (source.targetId === target.sourceId && source.sourceId === target.targetId && source.targetId && target.sourceId) {
          if (source.drawEdge || target.drawEdge) return
          source.drawEdge = target.drawEdge = true
          let x = item.sourceId; let y = item.targetId
          let router = {}
          let vertices = []
          if (source.x === target.x) {
            x = { cell: item.sourceId, port: 4 }
            y = { cell: item.targetId, port: 4 }
            vertices = [{ x: source.x - 30, y: source.y + 60 }, { x: target.x - 30, y: target.y + 60 }]
            router = {
              name: 'manhattan',
              args: {
                startDirections: ['bottom'],
                endDirections: ['top']
              }
            }
          }
          this.graph.addEdge({
            source: x,
            target: y,
            router,
            vertices,
            type: item.type,
            attrs: {
              line: {
                sourceMarker: !item.arrows ? null : {
                  // args,
                  name: 'block'
                },
                targetMarker: !item.arrows ? null : {
                  // args,
                  name: 'block'
                },
                stroke: !item.arrows ? '#56AFB0' : '#3D79D9',
                strokeWidth: 2
                // targetMarker: !item.arrows ? null : 'block'
              }
            }
          })
          return
        }
        // 起点和终点在一条线上，需要从上面绘图 同x
        if (target.x && (target.y === source.y)) {
          x++
          // console.log(source.categoryName, target.categoryName)
          if (Math.abs(target.x - source.x) > 228) {
            vertices = [{ x: source.x + 60, y: source.y - 24 - 10 * x }, { x: target.x + 60, y: target.y - 24 - 10 * x }]
            this.graph.addEdge({
              source: item.sourceId,
              target: item.targetId,
              shape: 'custom-edge',
              type: item.type,
              vertices,
              attrs: {
                line: {
                  stroke: !item.arrows ? '#56AFB0' : '#3D79D9',
                  strokeWidth: 2,
                  targetMarker: !item.arrows ? null : 'block'
                }
              }
            })
          } else if (Math.abs(target.x - source.x) === 228) {
            this.graph.addEdge({
              source: { cell: item.sourceId, port: 2 },
              target: { cell: item.targetId, port: 4 },
              type: item.type,
              shape: 'custom-edge',
              attrs: {
                line: {
                  stroke: !item.arrows ? '#56AFB0' : '#3D79D9',
                  strokeWidth: 2,
                  targetMarker: !item.arrows ? null : 'block'
                }
              }
            })
          }
          return
        }
        // 同y轴  上下挨着
        if (target.x === source.x) {
          let port1; let port2; let vertices = []
          if (target.y - source.y === -170) {
            port1 = 1
            port2 = 3
          } else if (target.y - source.y < -170 || target.y - source.y === 170) {
            port1 = 3
            port2 = 1
          } else if (target.y - source.y > 170) {
            port1 = 2
            port2 = 2
            vertices = [{ x: source.x + 188, y: source.y + 60 }, { x: target.x + 188, y: target.y + 60 }]
          }
          this.graph.addEdge({
            source: { cell: item.sourceId, port: port1 },
            target: { cell: item.targetId, port: port2 },
            type: item.type,
            vertices,
            connector: {
              name: 'rounded',
              args: { radius: 10 }
            },
            router: {
              name: 'manhattan',
              args: {
                startDirections: ['bottom'],
                endDirections: ['top']
              }
            },
            attrs: {
              line: {
                stroke: !item.arrows ? '#56AFB0' : '#3D79D9',
                strokeWidth: 2,
                targetMarker: !item.arrows ? null : 'block'
              }
            }
          })
          return
        }

        // 系统到表
        if (!item.arrows) {
          this.graph.addEdge({
            source: item.sourceId,
            target: item.targetId,
            type: item.type,
            connector: {
              name: 'rounded',
              args: { radius: 10 }
            },
            attrs: {
              line: {
                stroke: !item.arrows ? '#56AFB0' : '#3D79D9',
                strokeWidth: 2,
                targetMarker: null
              }
            }
          })
          return
        }
        this.graph.addEdge({
          source: item.sourceId,
          target: item.targetId,
          type: item.type,
          attrs: {
            line: {
              stroke: !item.arrows ? '#56AFB0' : '#3D79D9',
              strokeWidth: 2,
              targetMarker: !item.arrows ? null : 'block'
            }
          },
          router: {
            name: 'manhattan',
            args: {
              startDirections: ['bottom'],
              endDirections: ['top']
            }
          }
        })
      })

      /* let vertices = []
      let x, y
      if (target.x && (target.x === source.x)) {
        // 同x轴，y轴差一个单位
        if (Math.abs(target.y - source.y) <= 170) {
          // console.log([source.x, source.y], [target.x, target.y], [source.targetId, target.sourceId, source.categoryName, target.categoryName, Math.abs(target.y - source.y)])
          this.graph.addEdge({
            source: { x: source.x + 64, y: source.y + 120 },
            target: { x: target.x + 64, y: target.y },
            connector: {
              name: 'rounded',
              args: { radius: 10 }
            },
            attrs: {
              line: {
                stroke: '#98A0B2',
                strokeWidth: 1
              }
            }
          })
        } else if (Math.abs(target.y - source.y) > 220) {
          console.log([source.x, source.y], [target.x, target.y], [source.targetId, target.sourceId, source.categoryName, target.categoryName, Math.abs(target.y - source.y)])
          // 同x轴，y轴差不止一个单位
          this.graph.addEdge({
            source: { x: source.x, y: source.y + 60 },
            target: { x: source.x, y: source.y },
            shape: 'custom-edge',
            vertices
          })
        }
        return
      } */
    },

    // 节点双击
    relationships (catId, catId2) {
      this.information = false
      this.showSearchBox = false
      this.edgeClick = false
      this.modelEdgeClick = false
      let all = this.graph.getNodes()
      all.forEach(item => {
        item.setData({
          highlight: false
        })
      })
      this.orientation()
      let requestUrl =
        HTTP.$damServerUrl + 'lineage/relationships?catId=' + catId
      if (catId2) {
        requestUrl += '&targetCatId=' + catId2
      }
      this.$http.get(requestUrl)
        .then(res => {
          this.rawData.rawData = res.data
          let endpoints = res.data.endpoints
          let relationships = res.data.relationships
          // this.tableLevelData = res.data
          // console.log(endpoints, relationships)
          let obj = this.allDataSource.find(item => item.categoryId === catId)
          let i = -1
          if (Object.keys(endpoints).length === 0) {
            this.nodes.push({
              categoryId: 'c' + catId,
              id: 'c' + catId,
              categoryName:
                obj.categoryName +
                '(' +
                obj.categoryAbbreviation +
                ')',
              label:
                obj.categoryName +
                '(' +
                obj.categoryAbbreviation +
                ')',
              detail: obj,
              type: 'category',
              group: 0
            })
            this.categoryMap[catId] = true
          }
          const edgeSet = new Set()
          relationships.forEach(r => {
            edgeSet.add(r.first)
            edgeSet.add(r.second)
          })
          for (const k in endpoints) {
            const v = endpoints[k]
            let obj = this.allDataSource.find(item => item.categoryId === v.catId)
            //           let group = this.zoneMap[this.$modelCategoriesDetailsMap[v.catId].zone];
            if (!this.categoryMap.hasOwnProperty(v.catId)) {
              i++
              this.groupMap[v.catId] = i
              this.categoryMap[v.catId] = true
              this.nodes.push({
                categoryId: 'c' + v.catId,
                id: 'c' + v.catId,
                label:
                  v.cat +
                  '(' +
                  obj.categoryAbbreviation +
                  ')',
                categoryName:
                  v.cat +
                  '(' +
                  obj.categoryAbbreviation +
                  ')',
                detail: v,
                type: 'category',
                group: i
              })
            }
            if (!this.sourceMap.hasOwnProperty(v.modelId)) {
              this.sourceMap[v.modelId] = true
              this.nodes.push({
                categoryId: 'm' + v.modelId,
                id: 'm' + v.modelId,
                label: v.model,
                categoryName: v.model,
                detail: v,
                type: 'model',
                group: i,
                shape: 'icon',
                icon: {
                  face: 'FontAwesome',
                  code: '\uf1c0',
                  size: 25
                  // color: this.colors[this.groupMap[v.catId]]
                }
              })
              this.itemEdges.push({
                sourceId: 'c' + v.catId,
                targetId: 'm' + v.modelId,
                dashes: false,
                type: 'column'
              })
            }
            if (!v.tabAlias) {
              v.tabAlias = v.tab
            }
            if (edgeSet.has(k)) {
              this.nodes.push({
                id: k,
                label: this.lang === 'en' ? v.tab : v.tabAlias, // class="fa fa-table"
                alias: this.lang === 'en' ? v.tabAlias : v.tab,
                detail: v,
                type: 'table',
                group: this.groupMap[v.catId],
                shape: 'icon'
                /* icon: {
                  face: 'FontAwesome',
                  code: '\uf0ce',
                  size: 25
                  // color: this.colors[this.groupMap[v.catId]]
                } */
              })

              this.edges.push({
                from: 'm' + v.modelId,
                to: k,
                dashes: false,
                type: 'column'
              })
            }
            // this.$parent.tableCnt++
          }
          relationships.forEach(r => {
            this.edges.push({
              from: r.first,
              to: r.second,
              arrows: 'to',
              width: 3,
              dashes: true,
              type: 'lineage'
            })
            let fromItem = this.nodes.find(item => item.id === 'm' + endpoints[r.first]?.modelId)
            let toItem = this.nodes.find(item => item.id === 'm' + endpoints[r.second]?.modelId)
            let hasEdge = fromItem && toItem && this.itemEdges.find(item => item.sourceId === fromItem.id && item.targetId === toItem.id)
            if (fromItem && toItem && !hasEdge) {
              this.itemEdges.push({
                sourceId: fromItem.id,
                targetId: toItem.id,
                arrows: 'to',
                width: 3,
                dashes: true,
                type: 'lineage'
              })
            }
          })
          this.call.forEach(item => {
            let catId = item.calleeModelCategoryId
            let obj = this.allDataSource.find(item => item.categoryId === catId)
            if (!this.categoryMap.hasOwnProperty(catId)) {
              i++
              this.groupMap[catId] = i
              this.categoryMap[catId] = true

              this.nodes.push({
                categoryId: 'c' + catId,
                categoryName:
                  obj.categoryName +
                  '(' +
                  obj.categoryAbbreviation +
                  ')',
                detail: obj,
                type: 'category',
                group: i
              })
            }
            catId = item.callerModelCategoryId
            obj = this.allDataSource.find(item => item.categoryId === catId)
            if (!this.categoryMap.hasOwnProperty(catId)) {
              i++
              this.groupMap[catId] = i
              this.categoryMap[catId] = true
              this.nodes.push({
                categoryId: 'c' + catId,
                id: 'c' + catId,
                label:
                  obj.categoryName +
                  '(' +
                  obj.categoryAbbreviation +
                  ')',
                categoryName:
                  obj.categoryName +
                  '(' +
                  obj.categoryAbbreviation +
                  ')',
                detail: obj,
                type: 'category',
                group: i
              })
            }
            const to = item.calleeModelCategoryId
            const from = item.callerModelCategoryId
            this.itemEdges.push({
              targetId: 'c' + from,
              sourceId: 'c' + to,
              arrows: 'to',
              width: 3,
              dashes: true,
              type: 'call'
            })
          })
          // console.log(this.nodes, this.edges, this.sourceMap, this.categoryMap, this.groupMap)
          // console.log(this.nodes.filter(item => item.type === 'category' || item.type === 'model'), this.itemEdges)
          const cells = this.graph.getCells() // 获取所有单元格
          // 清空画布
          this.graph.removeCells(cells)
          this.addTableNode()
          this.goBackFlag = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // search接口
    findSystemCall (from, to, callback) {
      if (isNaN(from)) return
      const requestUrl = HTTP.$damServerUrl + 'systemcall/search'
      const requestBody = {
        pageSize: 500,
        currentPage: 0,
        srcModelCategoryIds: [from]
      }
      if (to) {
        requestBody.dstModelCategoryIds = [to]
        this.$http
          .post(requestUrl, requestBody)
          .then(res => {
            this.call = res.data.content
            if (callback) {
              callback()
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .post(requestUrl, requestBody)
          .then(res => {
            this.call = []
            this.call = this.call.concat(
              res.data.content
            )
            requestBody.dstModelCategoryIds = [from]
            delete requestBody.srcModelCategoryIds
            this.$http
              .post(requestUrl, requestBody)
              .then(res => {
                if (
                  !this.call ||
                  this.call.length === 0
                ) {
                  this.call = []
                }
                this.call = this.call.concat(
                  res.data.content
                )
                if (callback) {
                  callback()
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    // 由表到数据源
    goBack () {
      this.allDataSource.forEach(item => { item.x = null; item.y = null })
      const cells = this.graph.getCells() // 获取所有单元格
      // 清空画布
      this.graph.removeCells(cells)
      this.goBackFlag = false
      this.addNode()
      this.close()
      this.information = null
      this.modelDetail = null
      this.showSearchBox = null
      this.edgeClick = null
      this.modelEdgeClick = false
      this.modelId = ''
    },
    // 搜索节点高亮
    async getDataBySearch () {
      this.showSearchBox = true
      this.edgeClick = false
      this.modelEdgeClick = false
      this.modelTable = []
      this.information = null
      this.modelDetail = null
      this.keyWords = ''
      this.modelId = ''
      let all = this.graph.getNodes()
      all.forEach(item => {
        item.setData({
          highlight: false
        })
      })
      this.orientation()
      this.activeName = 'first'
      if (!this.name) {
        this.systemSearList = this.allDataSource
        // this.categoryCnt = this.systemSearList.length
      } else {
        const keyword = this.name.toLowerCase()
        this.modelTable = []
        this.systemSearList = this.allDataSource.filter(item => item.categoryName.toLowerCase().indexOf(keyword) > -1 ||
          item.categoryAbbreviation.toLowerCase().indexOf(keyword) > -1)
        // console.log(this.systemSearList)
        await this.getModelTable()
        this.showSearchBox = true
      }

      // allDataSource
    },
    // 自定义节点
    registerNode () {
      // 系统自定义节点
      register({
        shape: 'cylinder',
        width: 128,
        height: 120,
        component: system
      })
      // 自定义线
      Graph.registerEdge(
        'custom-edge',
        {
          inherit: 'edge',
          attrs: {
            line: {
              stroke: '#56AFB0',
              strokeWidth: 2
            }
          },
          connector: {
            name: 'rounded',
            args: {
              radius: 20
            }
          }
        },
        true
      )
      // 自定义样式
      insertCss(`
      .x6-edge:hover path:nth-child(2){
        stroke: #70CACB;
        stroke-width: 2px;
        z-index: 111
      }
      .x6-edge:hover path:nth-child(2)[marker-end]{
          stroke: #6C9AE5;
          stroke-width: 2px;
          z-index: 111
        }
        .x6-edge-selected path:nth-child(2){
          stroke: #409EFF;
          stroke-width: 1px;
          z-index: 111
        }
      `)
    }

  }
}
</script>
<style lang="scss" scoped>
  .con{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
#dataMap, #tableMap{
  width: 100%;
  height: 100%;
}
  .tooltipEl{
    position: absolute;
    width: 240px;
    /*height: 100px;*/
    background: #fff;
    border: 1px solid #0a0e14;
    padding: 10px 15px;
    div{
      margin-bottom: 5px;
    }
  }
  .searchBox{
    position: absolute;
    top: 16px;
    right: 16px;
    div{
      float: left;
    }
    .left{
      margin-right: 16px;
    }
    .right{
      padding: 4px 8px;
      background: #fff;
      &>div{
        cursor: pointer;
        position: relative;
        top: -1px;
      }
    }
  }
  .searchBoxRight{
    position: absolute;
    width:100%;
    top: 57px;
    bottom: 10px;
    right: 16px;
    background: #fff;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    /deep/.intoPane,/deep/.el-tabs, /deep/.el-tabs__content, /deep/.el-tab-pane{
      height: 100%;
      /*position: absolute;
      top: 0;
      bottom: 0;*/
    }

    /deep/.el-tab-pane,/deep/.el-tabs{
      display: flex;
      flex-direction: column;
    }
    .top{
      padding: 0 20px;
    }
    .title{
      font-size: 22px;
    }
    .sTil{
      font-size: 20px;
    }
    .description{
      max-height: 200px;
      overflow: auto;
      margin-top: 10px;
    }
    .tableFlex{
      flex: 1;
      position: relative;
    }
    .tableBto{
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      top: 46px;
    }
    .tabBBox{
      margin-top: 20px;
    }
    .searchListBox{
      margin-top: 0px;
    }
    .information{

      li{
        border-bottom: 1px solid #E5E5E5;
        line-height: 38px;
        padding: 0 20px;
        display: flex;
        span{
          display: inline-block;
          width: 100px;
        }
        div{
          flex: 1;
          display: inline-block;
          word-break: break-all;
        }
        &:hover{
          background-color: rgba(64, 158, 255, 0.1);
        }
      }
    }
  }
  /deep/.datablau-input .el-input__inner{
    border: 0;
  }
  /deep/.el-tabs__nav-scroll{
    padding: 0 20px;
  }
  .tableSeclect{
    border:1px solid #dddddd;
    /*position: absolute;*/
    margin-left: 20px;
    margin-right: 20px;
    /deep/.datablau-input .el-input__inner{
      border-color: #dddddd;
    }
  }
  .systemList{
    height: 100%;
    overflow: auto;
    li{
      border-bottom: 1px solid #E5E5E5;
      padding: 10px 20px;
      cursor: pointer;
      color: #777777;
      &:hover{
        background-color: rgba(64, 158, 255, 0.1);
      }
      .titleName{
        font-size: 14px;
        color: #555;
        i{
          color: #409EFF;
        }

      }
      span{
        display: inline-block;
        width: 76px
      }
    }
    .description{
      max-height: 200px;
      overflow: auto;
    }
  }
  .drop{
    margin: 0 auto;
    width: 6px;
    height: 6px;
    border-radius: 10px;
    background: #DDDDDD;
  }
  .have{
    width: 14px;
    height: 14px;
    background: rgba(64, 158, 255, 0.2);
    &::before{
      content: '';
      display: block;
      width: 6px;
      height: 6px;
      border-radius: 10px;
      margin: 5px auto;
      position: relative;
      top: 4px;
      background: #409EFF;
    }
  }
  .modelTab /deep/ tr{
    cursor: pointer;
  }
  .dropTop{
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 10px;
    background: rgba(64, 158, 255, 0.1);
    margin-right: 4px;
    position: relative;
    top: 2px;
  }
  .lingeDetail{
    padding-left: 20px;
    margin: 10px 0;
    font-size: 22px;
    i{
      padding: 0 10px;
    }
  }
  .activeSpan{
    color: #409EFF;
  }
</style>
