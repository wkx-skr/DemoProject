<template>
  <div class="bpmn-model-edit-wrapper" v-loading="loading">
    <datablau-dialog
      class="checkin-version-wrapper"
      title="提示"
      :visible.sync="quitSecondConfirm"
      width="370px"
      append-to-body>
      <div class="el-message-box__status el-icon-warning" style="position: absolute;top: 22px;"></div>
      <div class="el-message-box__message"><p>模型【{{modelInfo.name}}】已经发生变更，是否保存模型？</p></div>
      <div slot="footer">
        <datablau-button @click="cancelQuit" size="mini">继续编辑</datablau-button>
        <datablau-button type="important" @click="saveModel" size="mini">保存</datablau-button>
        <datablau-button @click="immediateQuit" type="secondary" size="mini">不保存</datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="添加模型"
      :visible.sync="logModal"
      append-to-body
      width="800px"
      height="560px"
      custom-class="task-detail-dialog-wrapper"
    >
      <setModel @closeMode="closeMode" v-if="logModal" @result="bpmnResult" :oldData="bpmnModelList"></setModel>
    </datablau-dialog>
    <datablau-dialog
      title="添加业务对象"
      :visible.sync="businessDetailModal"
      append-to-body
      width="800px"
      height="560px"
      custom-class="task-detail-dialog-wrapper"
    >
      <businessObject @closeMode="closeMode" v-if="businessDetailModal" @result="businessObjectResult" :oldData="businessObjectList[businessObjectListIndex]" :allModal="businessObjectList"></businessObject>
    </datablau-dialog>
    <datablau-dialog
      title="添加组织机构"
      :visible.sync="structureDetailModal"
      append-to-body
      width="400px"
      height="560px"
      custom-class="task-detail-dialog-wrapper"
    >
      <setStructure @closeMode="closeMode" v-if="structureDetailModal" @result="structureResult" :oldData="LDMTypes[itemObject.TypeId]"></setStructure>
    </datablau-dialog>
    <datablau-dialog
      title="添加实体"
      :visible.sync="entityModal"
      append-to-body
      width="800px"
      height="560px"
      custom-class="task-detail-dialog-wrapper"
    >
      <entity :id="currentBusinessObject.id" v-if="entityModal" @closeMode="closeMode" @result="entityResult" :oldData="currentBusinessObject.entityList"></entity>
    </datablau-dialog>
    <div class="top-header-wrapper" :class="{'is-edit':isEdit}">
      <h2 v-if="isEdit">{{modelInfo.name}}</h2>
      <!--<el-autocomplete
        v-if="!isEdit"
        placeholder="搜索"
        size="mini"
        style="display: inline-block;"
        class="search-query-hint"
        :loading="searchLoading"
        v-model="searchQuery"
        :fetch-suggestions="lodash.debounce(queryElement, 200)"
        @select="handleOptionSelect"
        :trigger-on-focus="false"
      >
        <template slot-scope="{ item }">
          <div class="hint-wrapper">
            <h2>{{item.id}}{{item.businessObject.name ? `(${item.businessObject.name})` : ''}}</h2>
          </div>
        </template>
      </el-autocomplete>-->
      <datablau-select
        :loading="searchLoading"
        v-if="!isEdit"
        style="display: inline-block"
        v-model="searchQuery"
        filterable
        remote
        reserve-keyword
        clearable
        placeholder="搜索名称、ID"
        :remote-method="lodash.debounce(remoteMethod, 200)"
        size="small"
        class="search-panel"
        @clear="clearSelect"
        @change="handleOptionSelect"
        is-icon="iconfont icon-search"
      >
        <el-option
          v-for="item in options4"
          :key="item.id"
          :label="item.id + (item.businessObject.name ? `(${item.businessObject.name})` : '')"
          :value="item.id">
        </el-option>
      </datablau-select>
<!--      <i v-if="!isEdit" style="position: absolute;left: 5px;top: 15px;" class="iconfont icon-search"></i>-->
      <div class="operate-buttons">
        <div class="operate-left-btns" v-if="isEdit">
          <datablau-button style="margin-right: -2px;" tooltipContent="导入" type="icon" class="iconfont icon-openfile"><input style="position: absolute;left: 0;top:0;width: 20px;opacity: 0;cursor: pointer;" type="file" accept=".bpmn" @change="handleBatchUpload" /></datablau-button>
          <datablau-button tooltipContent="保存" type="icon" class="iconfont icon-save" @click="saveModel"></datablau-button>
          <datablau-button @click="undo" :disabled="commandStack._stackIdx === -1" type="icon" class="iconfont icon-revoke"></datablau-button>
          <datablau-button @click="redo" :disabled="(commandStack._stackIdx + 1) === (commandStack._stack && commandStack._stack.length)" type="icon" class="iconfont icon-redo"></datablau-button>
        </div>
        <div class="line"></div>
        <el-input-number class="input-number" v-model="zoomLevel" :precision="0" :step="50" @change="handleZoom" :min="50" size="small" :max="500"></el-input-number>
        <datablau-button style="margin-right: 2px;" tooltipContent="定位" type="icon" class="iconfont icon-location" @click="locationGraph"></datablau-button>
        <el-popover
          v-if="isEdit"
          placement="bottom"
          style="margin-right: 2px;"
          width="400"
          trigger="click">
          <div class="shortcut-keys-model">
            <h2>快捷键</h2>
            <p>全局搜索</p><p>Ctrl + F</p>
            <p>撤销</p><p>Ctrl + Z</p>
            <p>恢复</p><p>Ctrl + Shift + Z / ctrl + Y</p>
            <p>全选</p><p>Ctrl + A</p>
            <p>缩小</p><p>Ctrl + -</p>
            <p>放大</p><p>Ctrl + +</p>
<!--            <p>垂直滚动</p><p>Mouse Wheel</p>
            <p>水平滚动</p><p>Shift + Mouse Wheel</p>
            <p>替换结点</p><p>R</p>
            <p>追加结点</p><p>A</p>
            <p>创建结点</p><p>N</p>-->
          </div>
          <datablau-button slot="reference" type="icon" class="iconfont icon-tips"></datablau-button>
        </el-popover>
        <a id="js-download-diagram"><datablau-button tooltipContent="导出xml" type="icon" class="iconfont icon-download"></datablau-button></a>
        <div style="float: right">
          <datablau-button v-if="isEdit && itemObject.TypeId" :dblClickTimeout="0" @click="togglePanel" type="icon" class="iconfont icon-extent"></datablau-button>
          <datablau-button
            v-if="isEdit"
            type="secondary"
            @click="exit"
          >退出</datablau-button>
        </div>
      </div>
    </div>
    <div class="edit-panel-wrapper" :style="editModal? '': 'display: none;'" :class="{hide: !editModal}">
      <i class="iconfont icon-false close-btn" v-if="!isEdit" @click="togglePanel"></i>
      <div class="edit-detail-wrapper">
        <datablau-form :model="businessObject" label-width="120px">
          <h2>基本信息</h2>
          <el-form-item prop="name">
            <div slot="label" class="form-item-head">
              <datablau-icon class="icon-item" :data-type="'archyname'" icon-type="svg" :size="24" ></datablau-icon>
              <span class="name">名称</span>
            </div>
            <datablau-input v-if="isEdit" ref="inputRef" style="width: 230px;" show-word-limit :maxlength="30" v-model="businessObject.name" @change="changeName(itemObject.BPMNId, $event)"></datablau-input>
            <div v-else>{{businessObject.name}}</div>
          </el-form-item>
          <el-form-item prop="id">
            <div slot="label" class="form-item-head">
              <datablau-icon class="icon-item" :data-type="'archyid'" icon-type="svg" :size="24" ></datablau-icon>
              <span class="name">ID</span>
            </div>
            <div>{{itemObject.BPMNId}}</div>
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
              <div v-if="isEdit">
                <datablau-button v-if="isEdit" tooltipContent="添加" type="icon" class="iconfont icon-tianjia add-btn" @click="addBPMNModel"></datablau-button>
                <datablau-tag
                  :key="item"
                  v-for="(item, index) in bpmnModelList"
                  closable
                  @close="deleteItem(bpmnModelList, index)">
                  {{item.name}}
                </datablau-tag>
              </div>
              <div v-else>
                <datablau-button
                  :key="item"
                  v-for="item in bpmnModelList"
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
                </div>
                <div v-if="isEdit">
                  <datablau-button v-if="isEdit" tooltipContent="添加" type="icon" class="iconfont icon-tianjia add-btn" @click="addStructure"></datablau-button>
                  <datablau-tag
                    v-if="structureInfo.fullName"
                    closable
                    @close="structureInfo.fullName = ''; structureInfo.id = ''">
                    {{structureInfo.fullName}}
                  </datablau-tag>
                </div>
                <div v-else>
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
                  <div v-if="isEdit">
                    <datablau-button v-if="isEdit" tooltipContent="添加" type="icon" class="iconfont icon-tianjia add-btn" @click="addBusinessModel(index, 'updated')"></datablau-button>
                    <datablau-tag
                      closable
                      @close="deleteItem(businessObjectList, index)">
                      {{item.name}}
                    </datablau-tag>
                  </div>
                  <div v-else>
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
                  <div v-if="isEdit">
                    <datablau-button v-if="isEdit" tooltipContent="添加" type="icon" class="iconfont icon-tianjia add-btn"  @click="addEntityModal(item)"></datablau-button>
                    <datablau-tag
                      :key="idx"
                      v-for="(i, idx) in item.entityList"
                      closable
                      @close="deleteItem(item.entityList, idx)">
                      {{i.name}}
                    </datablau-tag>
                  </div>
                  <div v-else>
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
                  <span class="name">业务对象{{businessObjectList.length+1}}</span>
                </div>
                <datablau-button v-if="isEdit" tooltipContent="添加" type="icon" class="iconfont icon-tianjia add-btn"  @click="addBusinessModel(businessObjectList.length, 'added')"></datablau-button>
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
    <div class="container" :class="{'is-edit': isEdit, 'edit-modal': editModal}">
    </div>
  </div>
</template>

<script>
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'

import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import '@bpmn-io/properties-panel/assets/properties-panel.css'// 右边工具栏样式
import 'diagram-js-minimap/assets/diagram-js-minimap.css' // 缩略图样式
import 'bpmn-js-color-picker/colors/color-picker.css' // 颜色选择器弹层样式
import minimapModule from 'diagram-js-minimap'
import BpmnModeler from 'bpmn-js/lib/Modeler'
// import diagramXML from './pizza-collaboration.bpmn'
import customTranslate from '@/views/bpmn/bpmnModel/relatedLib/customTranslate'
import BpmnColorPickerModule from 'bpmn-js-color-picker'
import {
  CreateAppendAnythingModule
} from 'bpmn-js-create-append-anything'
import xmlJs from 'xml-js'
import _ from 'lodash'
import LDMTypes from '@constant/LDMTypes'
import { v4 as uuidv4 } from 'uuid'
import udpsList from './udpsList.vue'
import inElectron from '@/resource/utils/environment'
import setModel from '@/views/bpmn/bpmnModel/components/setModel'
import businessObject from '@/views/bpmn/bpmnModel/components/businessObject'
import setStructure from '@/views/bpmn/bpmnModel/components/setStructure'
import entity from '@/views/bpmn/bpmnModel/components/entity'
import string from '@/resource/utils/string'
import $ from 'jquery'
import HTTP from '@/resource/http'

let customTranslateModule = {
  translate: [ 'value', customTranslate ]
}
export default {
  props: {
    isEdit: {
      type: Boolean,
      default: true
    },
    id: {
      type: Number,
      default: 0
    }
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
  components: {
    udpsList,
    setModel,
    businessObject,
    setStructure,
    entity
  },
  data () {
    return {
      options4: [],
      modelId: +this.$route.query.id,
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
      structureInfo: {},
      currentBusinessObject: {},
      businessObjectListIndex: -1,
      businessObjectListOperate: 'added',
      bpmnModelList: [],
      businessObjectList: [],
      node: {},
      attribute: {},
      loading: false,
      modelInfo: {},
      quitSecondConfirm: false,
      commandStack: {},
      lodash: _,
      searchLoading: false,
      zoomLevel: 100,
      LDMTypes,
      searchQuery: '',
      modelInnerId: 2,
      bpmnIdToItemMapInit: {},
      bpmnIdToItemMap: {},
      currentVersion: 0,
      seed: 0,
      xml: '',
      businessObject: {},
      itemObject: {},
      editModal: false,
      modeler: null,
      modelObjInit: null,
      modelObjNow: null,
      bpmn2: 'bpmn2:',
      attr: '_attributes',
      history: [],
      udpList: [],
      udpMap: {},
      heartCount: 0,
      logModal: false,
      businessDetailModal: false,
      structureDetailModal: false,
      entityModal: false,
      allDepartmentList: []
    }
  },
  created () {
    if (!this.id) {
      this.modelId = +this.$route.query.id
    } else {
      this.modelId = this.id
    }
  },
  mounted () {
    // console.log(LDMTypes)
    this.getOrgList()
    this.init()
    this.getUdpsInfoList()
    if (this.isEdit) {
      this.heartBeat()
      this.heartBeatInterval = setInterval(() => {
        this.heartBeat()
      }, 1000 * 60)
    }
    if (this.isEdit) {
      let self = this
      window.addEventListener('beforeunload', function (e) {
        if (self.commandStack._stack.length) {
          var confirmationMessage = `还有操作未保存，确定要退出吗？`;
          (e || window.event).returnValue = confirmationMessage // 兼容 Gecko + IE
          return confirmationMessage // 兼容 Gecko + Webkit, Safari, Chrome
        }
      })
      window.addEventListener('pagehide', (event) => {
        navigator.sendBeacon(`${this.$bpmn}editor/${this.modelId}/unlock`)
      }, { capture: true })
      window.addEventListener('unload', (event) => {
        navigator.sendBeacon(`${this.$bpmn}editor/${this.modelId}/unlock`)
        this.$http.post(`${this.$bpmn}editor/${this.modelId}/unlock`).then(res => {

        }).catch((err) => {
          this.$showFailure(err)
        })
      }, { capture: true })
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
    clearSelect () {
      this.options4 = []
      this.modeler.get('elementRegistry').forEach((element) => {
        this.modeler.get('canvas').removeMarker(element.id, 'selected')
      })
    },
    remoteMethod (query) {
      if (query !== '') {
        this.searchLoading = true
        let result = []
        this.modeler.get('elementRegistry').forEach((element) => {
          let businessObject = element.businessObject
          if (element.type !== 'bpmn:Process' && element.type !== 'bpmn:Collaboration' && element.type !== 'label') { // 过滤看不到的元素
            if (!query || businessObject.id.toLowerCase().indexOf(query.trim().toLowerCase()) >= 0 || (businessObject.name && businessObject.name.toLowerCase().indexOf(query.trim().toLowerCase()) >= 0)) {
              result.push(element)
              // this.modeler.get('canvas').removeMarker(element.id, 'selected')
            } else {
              // this.modeler.get('canvas').removeMarker(element.id, 'selected')
            }
          }
        })
        this.options4 = result
        this.searchLoading = false
      } else {
        this.options4 = []
      }
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
    deleteItem (arr, index) {
      console.log(index)
      arr.splice(index, 1)
    },
    initRightPanel () {
      let elementRegistry = this.modeler.get('elementRegistry')
      let element = elementRegistry.get('Process_1') // 内置结点
      if (element) {
        this.businessObject = element.businessObject
        this.itemObject = this.bpmnIdToItemMap[this.businessObject.id]
        let { bpmnModelList, businessObjectList, structureInfo, node, attribute } = this.itemObject.BPMNBindObject
        this.bpmnModelList = bpmnModelList
        this.businessObjectList = businessObjectList
        this.structureInfo = structureInfo
        this.node = node
        this.attribute = attribute
      }
    },
    immediateQuit () {
      this.$http.post(`${this.$bpmn}editor/${this.modelId}/unlock`).then(res => {
        if (res.data) {
          this.commandStack._stack = []
          window.location.href = 'about:blank'
          window.close()
        } else {
          this.$blauShowFailure('模型解锁失败，请重试')
        }
      }).catch((err) => {
        this.$showFailure(err)
      })
    },
    cancelQuit () {
      this.quitSecondConfirm = false
    },
    exit () {
      if (this.commandStack._stack.length) {
        this.quitSecondConfirm = true
      } else {
        this.immediateQuit()
      }
    },
    applyCustomColor (element, color) {
      const gfx = this.modeler.get('elementRegistry').getGraphics(element)
      const visual = gfx.querySelector('.djs-visual')
      const nodes = visual.querySelectorAll('*')
      if (nodes.length) {
        nodes.forEach((node, index) => {
          // if (element.type.indexOf('Gateway') >= 0 && node.tagName === 'path') {
          //   node.attributes.style.value += `stroke: ${color};fill: ${color};`
          // } else if (index === 1 && node.tagName === 'path' && element.type === 'bpmn:EndEvent') {
          //   node.attributes.style.value += `fill: ${color};`
          // } else {
          //   node.attributes.style.value += `stroke: ${color};`
          // }
          // let color = ''
          // if (element.type === 'bpmn:StartEvent') {
          //   color = '#3EC899'
          // } else if (element.type === 'bpmn:EndEvent') {
          //   color = '#408CF0'
          // } else if (element.type.indexOf('Gateway') >= 0) {
          //   color = '#F09552'
          // } else {
          //   color = '#777'
          // }
          if (node.attributes.style?.value) {
            node.attributes.style.value = node.attributes.style.value.replace(/rgb\(34, 36, 42\)/g, color).replace(/rgb\(13, 67, 114\)/g, color).replace(/rgb\(107, 60, 0\)/g, color).replace(/rgb\(32, 80, 34\)/g, color).replace(/rgb\(131, 19, 17\)/g, color).replace(/rgb\(91, 23, 109\)/g, color)
          }
        })
      }
      // if (element.type === 'bpmn:EndEvent') {
      //   const secondCircle = gfx.querySelector('.djs-visual > circle:nth-child(2)')
      //   if (secondCircle) {
      //     secondCircle.attributes.style.value += `fill: ${color};`
      //   }
      // }
    },
    togglePanel () {
      this.editModal = !this.editModal
    },
    unLockModel () {
      clearTimeout(this.unlockTimer)
      this.unlockTimer = setTimeout(() => { // 两小时未操作解锁该模型
        this.$http.post(`${this.$bpmn}editor/${this.modelId}/unlock`).then(res => {
          if (res.data) {
            clearInterval(this.heartBeatInterval)
            this.$DatablauCofirm('2小时未操作，已解锁该模型， 是否继续编辑', '提示', {
              type: 'warning',
              confirmButtonText: '确定',
              showClose: false,
              closeOnClickModal: false
            }).then(() => {
              this.$http.get(this.$bpmn + `editor/model/${this.modelId}?withPath=true`).then(res => {
                if (res.data.currentVersion === this.currentVersion && this.isEdit) {
                  this.$http.put(`${this.$bpmn}editor/${this.modelId}/lock`).then(res => {
                    if (res.data) {
                      this.heartBeat()
                      this.heartBeatInterval = setInterval(() => {
                        this.heartBeat()
                      }, 1000 * 60)
                    } else {
                      this.$blauShowFailure('模型尝试加锁失败，请重试')
                    }
                  }).catch(err => {
                    this.$showFailure(err)
                  })
                } else {
                  this.$DatablauCofirm('模型在解锁期间已被修改，请刷新浏览器后再次操作', '提示', {
                    type: 'warning',
                    confirmButtonText: '确定',
                    showClose: false,
                    closeOnClickModal: false
                  })
                }
              }).catch(err => {
                this.$showFailure(err)
              })
            }).catch(() => {

            })
          } else {
            this.$blauShowFailure('模型解锁失败')
          }
        }).catch(err => {
          this.$showFailure(err)
        }).finally(() => {
        })
      }, 3600000 * 2)

      clearTimeout(this.unlockTimer1)
      this.noOperateTime = Date.now()
      this.unlockTimer1 = setTimeout(() => { // 半小时未操作提示用户
        this.$DatablauCofirm(`已超过${parseInt((Date.now() - this.noOperateTime) / 60000)}分钟未操作，超过两小时自动解锁该模型`, '提示', {
          type: 'warning',
          confirmButtonText: '确定',
          showClose: false,
          closeOnClickModal: false
        })
      }, 3600000 * 0.5)
    },
    heartBeat () {
      this.heartCount++
      this.$http.put(`${this.$bpmn}editor/${this.modelId}/heart`).then(res => {
        if (!res.data) {
          if (this.heartCount === 1) {
            setTimeout(() => {
              this.$http.put(`${this.$bpmn}editor/${this.modelId}/lock`).then(res => {
                if (res.data) {

                } else {
                  this.$blauShowFailure('模型尝试加锁失败，请退出后重新打开模型')
                }
              }).catch(err => {
                this.$showFailure(err)
              })
            }, 1000)
          } else {
            this.$blauShowFailure('心跳失败')
          }
        }
      }).catch(err => {
        // if (err.response.data.errorMessage.indexOf('保持心跳失败，失败原因') !== -1 && this.heartCount === 1) {
        if (this.heartCount === 1) {
          setTimeout(() => {
            this.$http.put(`${this.$bpmn}editor/${this.modelId}/lock`).then(res => {
              if (res.data) {

              } else {
                this.$blauShowFailure('模型尝试加锁失败，请退出后重新打开模型')
              }
            }).catch(err => {
              this.$showFailure(err)
            })
          }, 1000)
        } else {
          this.$showFailure(err)
        }
      })
    },
    getUdpsInfoList () {
      this.$http.get(this.$bpmn + 'udps/').then(res => {
        this.udpList = res.data.sort((a, b) => a.order - b.order)
        this.udpList.forEach(udp => {
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
    queryElement (query, cb) {
      this.searchLoading = true
      let result = []
      this.modeler.get('elementRegistry').forEach((element) => {
        let businessObject = element.businessObject
        if (!query || businessObject.id.toLowerCase().indexOf(query.trim().toLowerCase()) >= 0 || (businessObject.name && businessObject.name.toLowerCase().indexOf(query.trim().toLowerCase()) >= 0)) {
          // this.modeler.get('canvas').addMarker(element.id, 'selected')
          // this.modeler.get('canvas').zoom('fit-viewport', element)
          result.push(element)
          this.modeler.get('canvas').removeMarker(element.id, 'selected')
        } else {
          this.modeler.get('canvas').removeMarker(element.id, 'selected')
        }
      })
      cb(result)
      this.searchLoading = false
    },
    handleOptionSelect (id) {
      this.searchQuery = id
      let elementRegistry = this.modeler.get('elementRegistry')
      elementRegistry.forEach((element) => {
        this.modeler.get('canvas').removeMarker(element.id, 'selected')
      })
      this.modeler.get('canvas').addMarker(id, 'selected')
      let element = elementRegistry.get(id) // 内置结点
      this.modeler.get('canvas').zoom('fit-viewport', element)
    },
    handleZoom (val) {
      this.modeler.get('canvas').zoom(val / 100)
    },
    redo () {
      this.commandStack.redo()
    },
    undo () {
      this.commandStack.undo()
    },
    changeName (bpmnId, value) {
      let elementRegistry = this.modeler.get('elementRegistry')
      // 获取要修改的节点
      let element = elementRegistry.get(bpmnId)
      element.businessObject.name = value
      this.itemObject.Name = value
      // 开始事务itemObject以确保正确更新
      this.modeler.get('commandStack').execute('element.updateLabel', {
        element: element,
        newLabel: value
      })
    },
    locationGraph () {
      this.modeler.get('canvas').zoom('fit-viewport', 'auto')
      this.modeler.get('canvas').zoom(this.zoomLevel / 100)
    },
    searchBPMN () {
      this.modeler.get('elementRegistry').forEach((element) => {
        // this.modeler.get('canvas').removeMarker('highlight')
        let businessObject = element.businessObject
        if (businessObject.id.toLowerCase().indexOf(this.searchQuery.toLowerCase()) >= 0 || (businessObject.name && businessObject.name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) >= 0)) {
          this.modeler.get('canvas').addMarker(element.id, 'selected')
          this.modeler.get('canvas').zoom('fit-viewport', element)
        } else {
          this.modeler.get('canvas').removeMarker(element.id, 'selected')
        }
      })
    },
    encodeData (data) { // 字母转数字
      if (data instanceof Array) {
        return data.map(item => this.encodeData(item))
      } else if (data instanceof Object) {
        let obj = {}
        for (let key of Object.keys(data)) {
          if (!isNaN(Number(key))) {
            obj[key] = this.encodeData(data[key])
          } else if (LDMTypes[key] !== undefined) {
            obj[LDMTypes[key]] = this.encodeData(data[key])
          }
        }
        return obj
      } else {
        return data
      }
    },
    decodeData (data) { // 数字转字母
      if (data instanceof Array) {
        return data.map(item => this.decodeData(item))
      } else if (data instanceof Object) {
        let obj = {}
        for (let key of Object.keys(data)) {
          if (!isNaN(Number(key)) && LDMTypes[key]) {
            obj[LDMTypes[key]] = this.decodeData(data[key])
          } else {
            obj[key] = this.decodeData(data[key])
          }
        }
        return obj
      } else {
        return data
      }
    },
    transformDiff (obj, operate) {
      let bpmnId = obj.id
      let entityProperties = this.bpmnIdToItemMap[bpmnId] || {}
      if (entityProperties.BPMNBindObject) {
        entityProperties.BPMNBindObject = JSON.stringify(entityProperties.BPMNBindObject)
      }
      let parentProperties = obj.parentId === 0 ? { Id: this.modelInnerId } : this.bpmnIdToItemMap[obj.parentId] || {} // parentId === 0 表示为根结点
      let uId = uuidv4()
      if (operate === 'added') {
        let newElementId = ++this.seed
        let result = {
          modelId: this.modelId,
          elementId: newElementId,
          parentId: parentProperties.Id,
          alias: '',
          name: obj.name || '',
          typeId: LDMTypes[obj.type],
          objectClass: `Datablau.BPMN.${obj.type}`,
          properties: {
            ...this.encodeData(entityProperties),
            '90000001': LDMTypes[obj.type],
            '90000002': newElementId,
            '90000003': obj.name || '',
            '90000006': uId,
            '80210001': obj.id
          }
        }
        if (entityProperties.Id === undefined) { // 解决父元素没有ID
          this.bpmnIdToItemMap[bpmnId] = {
            BPMNBindObject: {
              bpmnModelList: [],
              businessObjectList: [],
              structureInfo: {},
              node: {},
              attribute: {}
            },
            Id: newElementId,
            BPMNId: bpmnId,
            TypeId: LDMTypes[obj.type],
            UniqueId: uId
          }
        }
        return result
      } else if (operate === 'updated') {
        let result = {
          modelId: this.modelId,
          elementId: entityProperties.Id,
          parentId: parentProperties.Id,
          alias: '',
          name: obj.name || '',
          typeId: LDMTypes[obj.type],
          objectClass: `Datablau.BPMN.${obj.type}`,
          properties: {
            ...this.encodeData(entityProperties),
            '90000001': LDMTypes[obj.type],
            '90000002': entityProperties.Id,
            '90000003': obj.name || '',
            '90000006': uuidv4(),
            '80210001': obj.id
          }
        }
        return result
      } else if (operate === 'removed') {
        return entityProperties.Id
      } else {
        return obj
      }
    },
    async saveModel () {
      const { xml } = await this.modeler.saveXML({ format: true })
      this.xml = xml
      const xmlToJson = xmlJs.xml2json(xml, { compact: true, spaces: 4 })
      this.modelObjNow = JSON.parse(xmlToJson)
      this.prepareData(this.modelObjNow)
      let flattenInit = []
      this.flatten(this.modelObjInit, flattenInit)
      let flattenNow = []
      this.flatten(this.modelObjNow, flattenNow)
      let diffResult = this.deepDiff(flattenInit, flattenNow)
      let { added, removed, updated } = diffResult
      this.$http.put(this.$bpmn + `editor/${this.modelId}/save`, {
        modelId: this.modelId,
        lastVersion: this.currentVersion,
        added: added.map(item => {
          return this.transformDiff(item, 'added')
        }),
        removed: removed.map(item => this.transformDiff(item, 'removed')),
        updated: updated.map(item => this.transformDiff(item, 'updated')),
        udps: [],
        useProtobuf: true,
        bpmnShapeContent: this.xml
      }).then(res => {
        this.$datablauMessage.success('保存成功')
        this.quitSecondConfirm = false
        this.init()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    prepareData (obj) {
      let attrs = obj[this.attr] || obj // this.bpmn2 == ''时，没有_attributes属性
      for (let key in obj) {
        if (key.indexOf('definitions') >= 0) {
          let index = key.indexOf(':')
          this.bpmn2 = key.slice(0, index + 1)
          console.log('bpmn2', this.bpmn2)
        }
        if (obj.hasOwnProperty(key)) {
          if (key.indexOf(this.bpmn2) >= 0) {
            let value = obj[key]
            if (key === `${this.bpmn2}sourceRef`) {
              attrs.sourceRef = obj[key]['_text'] || obj[key] // this.bpmn2 == ''时，没有_text属性
              delete obj[key]
            } else if (key === `${this.bpmn2}targetRef`) {
              attrs.targetRef = obj[key]['_text'] || obj[key] // this.bpmn2 == ''时，没有_text属性
              delete obj[key]
            }
            if (value instanceof Array) {
              value.forEach(item => {
                this.prepareData(item)
              })
            } else if (value instanceof Object) {
              this.prepareData(value)
            }
          } else if (key === this.attr) {

          }
        }
      }
      return obj
    },
    firstToUpperCase (str) {
      if (str.length > 0) {
        return str[0].toUpperCase() + str.slice(1)
      } else {
        return str
      }
    },
    flatten (obj, map) { // 将xml拍平解析成map
      for (let key in obj) {
        let parentId = obj[this.attr]?.id || 0
        if (obj.hasOwnProperty(key)) {
          let value = obj[key]
          let index = key.indexOf(this.bpmn2)
          if (index >= 0 && key !== 'bpmndi:BPMNDiagram') {
            if (value instanceof Array) {
              value.forEach(item => {
                let newObject = {
                  type: this.firstToUpperCase(key.slice(index + this.bpmn2.length)),
                  ...item[this.attr],
                  parentId
                }
                if (newObject.id) {
                  map[newObject.id] = newObject
                }
                this.flatten(item, map)
              })
            } else if (value instanceof Object) {
              let newObject = {
                type: this.firstToUpperCase(key.slice(index + this.bpmn2.length)),
                ...value[this.attr],
                parentId
              }
              if (newObject.id) {
                map[newObject.id] = newObject
              }
              this.flatten(value, map)
            }
          } else if (key === this.attr) {

          }
        }
      }
    },
    deepDiff (oldMap, newMap) { // 比较两个map的差异
      let added = []
      let removed = []
      let updated = []
      for (let key in oldMap) {
        if (!newMap[key]) {
          removed.push(oldMap[key])
        } else {
          if (JSON.stringify(oldMap[key]) !== JSON.stringify(newMap[key]) || JSON.stringify(this.bpmnIdToItemMapInit[key]) !== JSON.stringify(this.bpmnIdToItemMap[key])) {
            updated.push(newMap[key])
          }
        }
      }
      for (let key in newMap) {
        if (!oldMap[key]) {
          added.push(newMap[key])
        }
      }
      return {
        added,
        removed,
        updated
      }
    },
    handleBatchUpload (source) {
      let self = this
      const file = source.target.files
      if (!file[0].name.endsWith('.bpmn')) {
        this.$datablauMessage.error('请选择bpmn文件')
        return
      }
      const reader = new FileReader()// 新建一个FileReader
      reader.readAsText(file[0], 'UTF-8')// 读取文件
      reader.onload = async function (event) { // 读取完文件之后会回来这里
        const sileString = event.target.result// 读取文件内容
        // console.log('sileString:', sileString)// 这个就是文件内容为字符串格式
        await self.openDiagram(sileString, false)
        self.exportArtifacts()
      }
    },
    async openDiagram (xml, isInit = true) {
      // xml = `<?xml version="1.0" encoding="UTF-8"?>
      // <bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
      //   <bpmn2:process id="Process_1" isExecutable="true">
      //   </bpmn2:process>
      //   <bpmndi:BPMNDiagram id="BPMNDiagram_1">
      //     <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      //     </bpmndi:BPMNPlane>
      //   </bpmndi:BPMNDiagram>
      // </bpmn2:definitions>`
      const xmlToJson = xmlJs.xml2json(xml, { compact: true, spaces: 4 })
      if (isInit) {
        this.modelObjInit = JSON.parse(xmlToJson)
      }
      try {
        this.importingXml = true
        await this.modeler.importXML(xml)
        // 打开小地图
        this.modeler.get('minimap').open()
        // if (!isInit) { // 导入的xml才初始话起点
        this.locationGraph()
        // }
      } catch (err) {
        this.$showFailure(err)
      }
    },
    getModelDetailInfo (callback) {
      this.loading = true
      this.$http.get(this.$bpmn + `editor/model/${this.modelId}?withPath=true`).then(async res => {
        this.modelInfo = res.data
        this.currentVersion = res.data.currentVersion
        this.seed = res.data.seed
        await this.openDiagram(res.data.graphData)
        this.exportArtifacts()
        callback()
      }).catch(err => {
        this.$showFailure(err)
      }).finally(() => {
        this.loading = false
      })
    },
    getModelEntityList () {
      this.$http.get(this.$bpmn + `editor/${this.modelId}/direct/content/json?longKey=true`).then(res => {
        let data = this.decodeData(res.data)
        this.modelInnerId = data.properties.Id
        let bpmnIdToItemMap = {}
        data.children?.forEach(item => {
          bpmnIdToItemMap[item.properties.BPMNId] = item.properties
          if (bpmnIdToItemMap[item.properties.BPMNId].BPMNBindObject) { // 初始化绑定结构
            bpmnIdToItemMap[item.properties.BPMNId].BPMNBindObject = JSON.parse(bpmnIdToItemMap[item.properties.BPMNId].BPMNBindObject)
          } else {
            bpmnIdToItemMap[item.properties.BPMNId].BPMNBindObject = {
              bpmnModelList: [],
              businessObjectList: [],
              structureInfo: {},
              node: {},
              attribute: {}
            }
          }
        })
        this.bpmnIdToItemMap = bpmnIdToItemMap
        this.bpmnIdToItemMapInit = _.cloneDeep(this.bpmnIdToItemMap)
        // this.initRightPanel()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    changeNodeColor (element) {
      if (element.type === 'bpmn:StartEvent') {
        setTimeout(() => { // 元素加入的时候可能会不存在dom，需要延时设置
          this.applyCustomColor(element, '#3EC899')
        })
      } else if (element.type === 'bpmn:EndEvent') {
        setTimeout(() => {
          this.applyCustomColor(element, '#408CF0')
        })
      } else if (element.type.indexOf('Gateway') >= 0) {
        setTimeout(() => {
          this.applyCustomColor(element, '#F09552')
        })
      } else {
        setTimeout(() => {
          this.applyCustomColor(element, '#777')
        })
      }
    },
    checkRightPanel () {
      // this.$refs.udpListRef?.$refs.formRef.validate(valid => {
      // })
      setTimeout(() => {
        this.$refs.inputRef.focus()
      })
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
    addElementOrConnection (event) {
      let { element } = event
      let itemObj = {
        BPMNId: element.businessObject.id,
        TypeId: LDMTypes[element.type.split(':')[1]],
        UniqueId: uuidv4(),
        BPMNBindObject: {
          bpmnModelList: [],
          businessObjectList: [],
          structureInfo: {},
          node: {},
          attribute: {}
        }
      }
      if (!this.bpmnIdToItemMap[itemObj.BPMNId]) { // 修改name也会触发shape.added事件,如果已经存在则不再添加
        this.bpmnIdToItemMap[itemObj.BPMNId] = itemObj
      }
      this.changeNodeColor(element)
    },
    openRightPanel (event) {
      this.editModal = true
      this.businessObject = event.element.businessObject
      this.itemObject = this.bpmnIdToItemMap[this.businessObject.id]
      let { bpmnModelList, businessObjectList, structureInfo, node, attribute } = this.itemObject.BPMNBindObject
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
      setTimeout(() => {
        if (this.isEdit) {
          this.checkRightPanel()
        }
      }, 200)
    },
    init () {
      this.editModal = false
      if (this.modeler) {
        this.modeler.destroy()
      }
      this.modeler = new BpmnModeler({
        container: '.container',
        keyboard: {
          bindTo: window
        },
        additionalModules: [
          CreateAppendAnythingModule,
          customTranslateModule,
          minimapModule,
          BpmnColorPickerModule
        ]
      })
      this.commandStack = this.modeler.get('commandStack')
      this.getModelDetailInfo(this.getModelEntityList)
      // this.openDiagram(diagramXML)
      this.modeler.on('commandStack.changed', _.debounce(this.exportArtifacts, 500))
      this.modeler.on('shape.remove', (event) => {
        this.editModal = false
      })
      this.modeler.on('connection.remove', (event) => {
        this.editModal = false
      })
      this.modeler.on('element.click', 10000, (event) => {
        if (event.element.type === 'label') { // 防止文本出现右键菜单，设置背景色
          event.stopPropagation()
          event.preventDefault()
        }
        setTimeout(() => {
          if (!this.isDoubleClick) {
            if (event.element.type !== 'bpmn:Process' && event.element.type !== 'bpmn:Collaboration') {
              this.openRightPanel(event)
            }
          }
        }, 200)
      })
      this.modeler.on('element.dblclick', 10000, (event) => { // 使用更高的优先级（10000）来注册 element.dblclick 事件，以确保我们的处理器先于其他处理器执行。
        if (!this.isEdit) {
          event.stopPropagation()
          event.preventDefault()
        }
        this.isDoubleClick = true
        setTimeout(() => {
          this.isDoubleClick = false
        }, 500)
      })
      this.modeler.on('element.changed', (event) => {
        let { element } = event
        this.changeNodeColor(element)
        if (this.isEdit) {
          this.unLockModel()
        }
      })
      this.modeler.on('shape.added', (event) => {
        this.addElementOrConnection(event)
        if (!this.importingXml) {
          this.openRightPanel(event)
        }
      })
      this.modeler.on('connection.added', (event) => {
        this.addElementOrConnection(event)
        if (!this.importingXml) {
          this.openRightPanel(event)
        }
      })
      this.modeler.on('import.done', (event) => {
        this.importingXml = false // 导入模型会触发shape.added事件
      })
      // this.modeler.on('import.done', (event) => {
      //   const elementRegistry = this.modeler.get('elementRegistry')
      //   elementRegistry.forEach((element) => {
      //     if (element.type === 'bpmn:StartEvent') {
      //       this.applyCustomColor(element, 'red')
      //     }
      //   })
      // })
      // this.modeler.on('element.updateLabel', (event) => {
      //   console.log(this.commandStack._stackIdx) // -1 表示无变更
      //   this.businessObject = event.element.businessObject
      //   this.itemObject = this.bpmnIdToItemMap[this.businessObject.id]
      //   this.$set(this.itemObject, 'Name', this.businessObject.name)
      // })
    },
    async exportArtifacts () {
      let downloadLink = $('#js-download-diagram')
      let downloadSvgLink = $('#js-download-svg')
      function setEncoded (link, name, data) {
        let encodedData = encodeURIComponent(data)

        if (data) {
          link.addClass('active').attr({
            'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
            'download': name
          })
        } else {
          link.removeClass('active')
        }
      }
      try {
        const { svg } = await this.modeler.saveSVG()

        setEncoded(downloadSvgLink, 'diagram.svg', svg)
      } catch (err) {
        setEncoded(downloadSvgLink, 'diagram.svg', null)
      }

      try {
        const { xml } = await this.modeler.saveXML({ format: true })
        this.xml = xml
        const xmlToJson = xmlJs.xml2json(xml, { compact: true, spaces: 4 })
        // console.log(JSON.parse(xmlToJson))
        this.modelObjNow = JSON.parse(xmlToJson)
        this.prepareData(this.modelObjInit)
        this.prepareData(this.modelObjNow)
        // console.log('preparedData', this.modelObjInit, this.modelObjNow)
        let flattenInit = []
        this.flatten(this.modelObjInit, flattenInit)
        let flattenNow = []
        this.flatten(this.modelObjNow, flattenNow)
        // let diffResult = this.deepDiff(flattenInit, flattenNow)
        // console.log(flattenInit, flattenNow, diffResult)
        // const json = xmlToJson
        // const jsonToXml = xmlJs.json2xml(json, { compact: true, spaces: 4 })
        // console.log(jsonToXml, 'jsonToXml')
        setEncoded(downloadLink, 'diagram.bpmn', xml)
      } catch (err) {
        console.error('Error happened saving XML: ', err)
        setEncoded(downloadLink, 'diagram.bpmn', null)
      }
    },
    addBPMNModel () {
      this.logModal = true
    },
    addStructure () {
      this.structureDetailModal = true
    },
    addBusinessModel (index, operate) {
      this.businessObjectListIndex = index
      this.businessObjectListOperate = operate
      this.businessDetailModal = true
    },
    addEntityModal (item) {
      this.currentBusinessObject = item
      this.entityModal = true
    },
    closeMode () {
      this.logModal = false
      this.businessDetailModal = false
      this.structureDetailModal = false
      this.entityModal = false
    },
    bpmnResult (selection) {
      console.log(selection)
      this.bpmnModelList.splice(0, this.bpmnModelList.length, ...selection)
    },
    businessObjectResult (selection) {
      console.log(selection)
      if (this.businessObjectListOperate === 'added') {
        this.businessObjectList.splice(this.businessObjectListIndex, 0, selection)
      } else if (this.businessObjectListOperate === 'updated') {
        this.businessObjectList.splice(this.businessObjectListIndex, 1, selection)
      }
    },
    structureResult (selection) {
      console.log(selection)
      Object.assign(this.structureInfo, selection)
    },
    entityResult (selection) {
      console.log(selection)
      this.$set(this.currentBusinessObject, 'entityList', selection)
    }
  }
}
</script>

<style lang="scss" scoped>
.datablau-tag {
  margin-bottom: 0;
}
.edit-detail-wrapper .el-form-item {
  margin-bottom: 4px;
}
.icon-openfile:before {
  font-size: 18px!important;
}
.icon-location:before {
  font-size: 18px!important;
}
.search-query-hint /deep/ input {
  padding-left: 25px;
}
.operate-buttons {
  .is-block.icon {
    color: #999;
    &:hover {
      color: #0084FF;
    }
  }
  .input-number {
    margin-right: 10px;
    line-height: 25px;
    /deep/ {
      input {
        line-height: 25px;
        height: 25px;
      }
      .el-input-number__decrease, .el-input-number__increase {
        height: 23px;
        line-height: 23px;
      }
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
  position: absolute;
  top: 50px;
  right: 0;
  bottom: 0;
  width: 400px;
  z-index: 200;
  background: #fff;
  border: 1px solid #ddd;
  border-right: none;
  animation: showPanel 225ms cubic-bezier(0,0,.2,1) 0ms;
  box-shadow: -2px 2px 4px 2px rgba(85,85,85,0.1);
  &.hide {
    transform: translate(100%, 0);
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
.shortcut-keys-model {
  padding: 16px;
  h2 {
    font-weight: bold;
    font-size: 12px;
    color: #555;
  }
  p {
    display: inline-block;
    font-size: 12px;
    line-height: 26px;
    color: #555;
    width: 50%;
    text-align: left;
  }
}
.line {
  display: inline-block;
  vertical-align: middle;
  width: 1px;
  height: 20px;
  background: #ddd;
  margin: 0 10px;
}
.hint-wrapper {
  font-size: 12px;
  h2 {
    font-size: 12px;
  }
  p {
    color: #ddd;
  }
}
.bpmn-model-edit-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow: hidden;
}
.top-header-wrapper {
  position: relative;
  & > h2 {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 14px;
    transform: translate(-50%, -50%)
  }
  padding: 9px 0;
  &.is-edit {
    padding: 9px 16px;
  }
  text-align: left;
  display: flex;
  align-items: center;
  .datablau-input {
    width: 240px;
    float: left;
    flex: 0 0 auto;
  }
  .operate-buttons {
    flex: 1 1 auto;
    .operate-left-btns {
      display: inline-block;
    }
  }
}
.container {
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(221,221,221,0.2);
  border: 1px solid #ddd;
  &:not(.is-edit) /deep/ {
    .djs-context-pad, .djs-palette {
      display: none;
    }
  }
  & /deep/ .djs-minimap {
    top: unset;
    bottom: 20px;
  }
  &.edit-modal /deep/ .djs-minimap {
    right: 399px;
  }
}
.operator-btn {
  position: relative;
  z-index: 2;
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
    margin-top: 15px;
  }
}
/deep/ .bjs-powered-by {
  display: none;
}
/deep/ .djs-minimap.open .toggle {
  display: none;
}
/deep/ .djs-minimap .map {
  width: 240px;
}
/deep/ .layer-space .djs-crosshair-group .djs-crosshair {
  stroke: #0095FF
}
/deep/ .djs-palette .entry {
  color: #777;
}
/deep/ .djs-popup .entry {
  color: #777;
}
/deep/ [class^="entry bpmn-icon-start-event"] {
  color: #3EC899!important;
}
/deep/ [class^="djs-popup-entry-name bpmn-icon-start-event"] {
  color: #3EC899!important;
}
/deep/ [class^="entry bpmn-icon-end-event"] {
  color: #408CF0!important;
}
/deep/ [class^="djs-popup-entry-name bpmn-icon-end-event"] {
  color: #408CF0!important;
}
/deep/ [class^="entry bpmn-icon-gateway"] {
  color: #F09552!important;
}
/deep/ [class^="djs-popup-entry-name bpmn-icon-gateway"] {
  color: #F09552!important;
}
/deep/ .djs-popup-label {
  color: hsl(225, 10%, 15%);
}
/deep/ .djs-context-pad {
  box-shadow: 0px 0px 4px 0px rgba(85,85,85,0.2);
  background: #fff;
}
/deep/ .djs-context-pad {
  width: 82px;
  padding: 5px;
}
</style>
