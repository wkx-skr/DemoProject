<template>
    <div id="col-details">
      <!--<i class="tab-to-expand-btn el-icon-arrow-left" v-show="shrink" @click="toExpand"></i>
      <i class="tab-to-expand-btn el-icon-arrow-right" v-show="!shrink" @click="toShrink"></i>-->
      <div class="tab-to-expand-wrapper" @mouseenter="expandActive=true" @mouseleave="expandActive=false">
        <img class="tab-to-expand-btn" :src="expandActive? shrinkActiveImg: shrinkImg" alt="" v-show="shrink" @click="toExpand" />
        <img class="tab-to-expand-btn" :src="expandActive? expandActiveImg: expandImg" alt="" v-show="!shrink" @click="toShrink" />
      </div>
        <domain-selector
          :limitedDsApply="currentModel.limitedDsApply"
          :limitedDsApplyConfig="currentModel.limitedDsApplyConfig"
            ref="domainSelector"
            @selected="handleDomainSelector"
        ></domain-selector>
        <domain-code-selector
            ref="domainCodeSelector"
            @selected="handleCodeSelected"
        ></domain-code-selector>
        <el-form class="content-wrapper" ref="form" label-width="82px" :inline="true" size="mini" v-if="allCols[0]">
          <el-form-item label="中文名" style="margin-right: 24px;">
            <el-autocomplete
              size="mini"
              v-model="allCols[0].cnName"
              :loading="domainLoading"
              :fetch-suggestions="lodash.debounce(queryDomain, 1000)"
              :trigger-on-focus="false"
              @select="handleOptionSelect($event, allCols[0])"
              @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColChName && !!allCols[0].domainId)"
              @focusout.native="handleColumnNameTab(allCols[0].cnName, true)"
            >
              <template slot-scope="{ item }">
                    <span
                      v-if="item.private"
                      style="margin-left:1em;">
                      <span style="color:#76a797;font-weight: bold;font-size:14px;margin-right:.5em;">P</span>{{item.chName}}
                    </span>
                <span v-else style="margin-left:1em;">
                      <span style="color:#4d82b8;font-weight: bold;font-size:14px;margin-right:.5em;">G</span>{{item.chName}}
                    </span>
              </template>
            </el-autocomplete>
          </el-form-item>
          <div class="translate-wrapper" @click="handleColumnNameTab(allCols[0].cnName)" @mouseenter="translateActive=true" @mouseleave="translateActive=false">
            <span>翻译</span>
            <img :src="translateActive ? translateActiveImg : translateImg" alt="" />
          </div>
          <el-form-item required label="字段名">
              <datablau-input
                @focusout.native="formatColumnName(allCols[0])"
                @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColName && !! allCols[0].domainId)" ref="colName" v-model.trim="allCols[0].name" placeholder=""  @blur="checkColName(allCols[0].name)"></datablau-input>
          </el-form-item>
          <br>
          <el-form-item required label="数据类型" style="margin-right: 80px;">
              <el-autocomplete
                    size="mini"
                    clearable
                    ref="colDataType"
                    v-model="allCols[0].dataType"
                    @focus="onFocus"
                    @input="onInput"
                    :fetch-suggestions="queryDataType"
                    @select="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!allCols[0].domainId)"
                    @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!allCols[0].domainId)"
                  >
                    <template slot-scope="{ item }">
                      <div @click.stop v-if="item.type" style="cursor:initial;color:#aaaaaa;margin-left:-4px;">{{item.value}}</div>
                      <span v-else>{{item.value}}</span>
                    </template>
                  </el-autocomplete>
           </el-form-item>
           <el-form-item label="数据标准">
              <datablau-input
                size="mini"
                @focus="callDomainSelector(allCols[0])"
                :value="allCols[0].domainName !== '' ? allCols[0].domainName : domainIdToName[allCols[0].domainId]"
                clearable
                @clear="clearDomain(allCols[0])"
              ></datablau-input>
           </el-form-item>
           <br>
           <!-- <el-form-item label="主键" style="width:150px">
               <datablau-checked v-if="pk.indexOf(allCols[0].elementId) > -1"></datablau-checked>
           </el-form-item>
            <el-form-item label="外键" style="width:150px">
               <datablau-checked v-if="fk.indexOf(allCols[0].elementId) > -1"></datablau-checked>
           </el-form-item> -->
           <el-form-item label="字段设置" class="check-container"  style="margin-bottom:20px;width: 140px;">
               <el-checkbox
                v-model="allCols[0].notNull"
              >非空</el-checkbox>
          </el-form-item>
          <!--<el-form-item class="check-container"  style="margin-bottom:20px">
               <el-checkbox
                v-model="allCols[0].physicalOnly"
              >仅物理</el-checkbox>
          </el-form-item>-->
           <br>
        </el-form>
        <div class="content-box" v-if="allCols[0]">
            <datablau-tabs
                v-model="activeTab"
                class="blue-tabs has-border"
                style="position:relative;top:1px;height:99%;"
            >
                <el-tab-pane label="属性" name="properties" class="properties-page">
                    <el-form ref="propertiesForm" label-width="82px" :inline="true" size="mini">
                        <el-form-item label="默认值" style="margin-right: 80px;">
                            <datablau-input
                                size="mini"
                                v-model="allCols[0].defaultVal"
                            ></datablau-input>
                        </el-form-item>
                        <el-form-item label="英文名" >
                            <datablau-input
                                size="mini"
                                v-model="allCols[0].enName"
                            ></datablau-input>
                        </el-form-item>
                        <el-form-item class="def" label="定义"  style="width:100%">
                            <datablau-input
                                style="width:488px"
                                type="textarea"
                                size="mini"
                                :autosize="{ minRows: 2, maxRows: 2 }"
                                show-word-limit
                                maxlength="500"
                                v-model="allCols[0].description"
                            ></datablau-input>
                        </el-form-item>
                        <div v-if="udpMessageDisplay.size" class="disc">自定义属性</div>
                        <div style="position: absolute;top: 160px;bottom: 20px;left: 0px;right: 0px;overflow-y: auto;overflow-x: hidden">
                          <div :key="key" v-for="key of udpMessageDisplay.keys()">
                            <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 10px;">{{key}}</h2>
                            <udp-setting :tableMsg="rawData.tableMsg" :currentModel="currentModel" :type="80000005" :udp-map="udpMessageDisplay.get(key)" :data-by-type="dataByType" :edit-mode="true" :request-body="allCols[0]">
                            </udp-setting>
                          </div>
                        </div>
                        <!--<div style="position: absolute;top: 120px;bottom: 0px;left: 0px;right: 0px;overflow-y: auto;overflow-x: hidden">
                          <el-form label-width="" size="mini" class="udp-form">
                              <el-form-item
                                  :label="dataByType.udp.get(Number.parseInt(udpKey)).FriendlyName"
                                  v-for="udpKey in columnsUdpKeysDisplay"
                                  :key="udpKey"
                                  >
                                      <el-select
                                        v-model="allCols[0].allUdps[udpKey]"
                                        v-if="dataByType.udp.get(udpKey).Enum"
                                        size="mini"
                                      >
                                        <el-option
                                          v-for="o in dataByType.udp.get(udpKey).Enum.split(';').slice(0,-1)"
                                          :key="o"
                                          :value="o"
                                          :label="o"
                                        ></el-option>
                                      </el-select>
                                      <udp-validater-input
                                        v-else
                                        :key="udpKey + allCols[0].elementId + allCols[0].name"
                                        :value="allCols[0].allUdps[udpKey]"
                                        @update="updateUdpValue(allCols[0].allUdps, udpKey, $event)"
                                        :udp="dataByType.udp.get(udpKey)"
                                      >
                                      </udp-validater-input>
                              </el-form-item>
                            </el-form>
                        </div>-->
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="枚举代码" name="dataStandardCode">
                  <el-form ref="codeform" label-width="60px" :inline="true" size="mini" style="padding-top: 25px;position: relative;">
                    <el-form-item label="代码编号" style="margin-right: 20px;">
                        <datablau-input
                        size="mini"
                        @focus="callCodeSelector(allCols[0])"
                        :value="allCols[0].dataStandardCode"
                        clearable
                        @clear="clearCode(allCols[0])"
                      ></datablau-input>
                     </el-form-item>
                    <el-form-item label="代码名称">
                        <datablau-input
                        size="mini"
                        @focus="callCodeSelector(allCols[0])"
                        :value="$globalData.domainCodes && $globalData.domainCodes.map.get(allCols[0].dataStandardCode)"
                        clearable
                        @clear="clearCode(allCols[0])"
                      ></datablau-input>
                     </el-form-item>
                     <el-button v-if="false" type="text" size="mini" @click="clearCode" style="position: absolute;top: 0;right: 0;">清除代码</el-button>
                  </el-form>
                     <div class="table-content">
                       <el-table
                         height="100%"
                         class="datablau-table"
                         size="small"
                         :data="codeValuesPage">
                         <el-table-column
                           prop="value"
                           label="编码取值"
                           >
                         </el-table-column>
                         <el-table-column
                           prop="name"
                           label="编码名称"
                           >
                         </el-table-column>
                         <el-table-column
                           prop="definition"
                           label="编码含义"
                           >
                         </el-table-column>
                       </el-table>
                     </div>
                    <datablau-pagination
                      class="code-table-wrapper"
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                      :current-page="current"
                      :page-sizes="[20, 50, 100]"
                      :page-size="size"
                      :total="total"
                      layout="total, sizes, prev,pager, next"
                    ></datablau-pagination>
                </el-tab-pane>
               <el-tab-pane label="视图" name="view">
                 <el-form  label-width="60px" :inline="true" size="mini">
                   <el-form-item label="引用字段">
                     <datablau-input style="width:100px" ref="currentCol" v-model="currentCol.name" @focus="callShowTree"></datablau-input>
                     <datablau-button type="secondary" size="mini" @click="clearRef" style="display:inline-block;margin-left: 5px;padding-left:10px;padding-right:10px">清除</datablau-button>
                   </el-form-item>
                   <el-form-item label="引用表">
                     <datablau-input disabled v-model="currentTable"></datablau-input>
                   </el-form-item>
                   <el-form-item class="def" style="width:100%" label="表达式">
                     <datablau-input style="width: 420px;" size="mini" type="textarea" v-model="allCols[0].Text"></datablau-input>
                   </el-form-item>
                 </el-form>

               </el-tab-pane>
               <el-tab-pane label="样式" name="style">
                  <el-form  ref="styleForm"  label-width="80px"  size="mini">
                     <!-- <el-form-item class="style" label=""> -->
                      <div class="style-box">
                        <el-color-picker class="middle-y" show-alpha v-model="style.StyleBackColor" size="mini" style="margin-right: 15px;"></el-color-picker>
                        <span class="label-disc middle-y">背景颜色</span>
                        <opacity-component class="middle-y" :rgba.sync="style.StyleBackColor"></opacity-component>
                      </div>
                    <!-- </el-form-item> -->
                    <!-- <el-form-item class="style" label="" > -->
                      <div class="style-box">
                        <el-color-picker class="middle-y" show-alpha v-model="style.StyleTextColor" size="mini"  style="margin-right: 15px;"></el-color-picker>
                        <span class="label-disc middle-y">字体颜色</span>
                        <el-input-number style="width: 100px;margin-right:10px" class="middle-y" v-model="style.StyleFontSize" size="mini"></el-input-number>
                        <span class="label-disc middle-y">px</span>
                        <el-select style="margin-right:5px;width: 100px;" filterable  size="mini" v-model="style.StyleFontFamily" placeholder="请选择">
                          <el-option :value="item" :key="item" :label="item" v-for="item in fontFamily"></el-option>
                        </el-select>
                      </div>
                      <el-checkbox-group  v-model="checkList" @change="handleStyleListChange($event,style,'StyleFontBoldItalic')">
                        <el-checkbox-button class="bold" label="Bold">B</el-checkbox-button>
                        <el-checkbox-button label="Italic" style="font-style:italic">I</el-checkbox-button>
                      </el-checkbox-group>
                      <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="下划线" placement="bottom">
                        <el-checkbox-button class="underline"  size="mini" v-model="style.StyleFontUnderLine">U</el-checkbox-button>
                      </el-tooltip>
                      <el-tooltip :open-delay="900" :visible-arrow='false'  effect="dark" content="删除线" placement="bottom">
                        <el-checkbox-button class="line-through"  size="mini" v-model="style.StyleFontLineThrough">D</el-checkbox-button>
                      </el-tooltip>
                  </el-form>

                </el-tab-pane>
                <template v-for="page of udpMessagePageDisplay.keys()">
                  <el-tab-pane :label="page" :name="page" :key="page">
                    <div style="position: absolute;top: 10px;bottom: 20px;left: 0px;right: 0px;overflow-y: auto;overflow-x: hidden">
                      <div :key="key" v-for="key of udpMessagePageDisplay.get(page).keys()">
                        <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 10px;">{{key}}</h2>
                        <udp-setting :tableMsg="rawData.tableMsg" :currentModel="currentModel" :type="80000005" :udp-map="udpMessagePageDisplay.get(page).get(key)" :data-by-type="dataByType" :edit-mode="true" :request-body="allCols[0]">
                        </udp-setting>
                      </div>
                    </div>
                  </el-tab-pane>
                </template>
            </datablau-tabs>
        </div>
        <el-dialog
          title="选择字段"
          :visible.sync="showTree"
          width="30%"
         append-to-body
          >
            <el-tree style="height:250px;overflow: auto;" :data="tablesAndViews" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
          <span slot="footer">
            <el-button @click="showTree = false">取消</el-button>
            <el-button type="primary" @click="showTree = false">确定</el-button>
          </span>
        </el-dialog>

    </div>
</template>
<script>
import $const from '@/resource/const'
import DomainSelector from '@/components/selector/NewDomainSelector'
// import udpValidaterInput from '@/views/list/tables/udpValidaterInput.vue'
import DomainCodeSelector from '@/components/selector/DomainCodeSelector'
import opacityComponent from './opacityComponent.vue'
import udpSetting from '@/views/list/graph/editComponents/udpSetting.vue'
import translateImg from '@/assets/images/mxgraphEdit/translate.svg'
import translateActiveImg from '@/assets/images/mxgraphEdit/translate-active.svg'
import _ from 'lodash'
import $ from 'jquery'
import { v4 as uuidv4 } from 'uuid'
import shrinkImg from '@/assets/images/mxgraphEdit/shrink.svg'
import shrinkActiveImg from '@/assets/images/mxgraphEdit/shrink-active.svg'
import expandImg from '@/assets/images/mxgraphEdit/expand.svg'
import expandActiveImg from '@/assets/images/mxgraphEdit/expand-active.svg'

export default {
  components: { DomainSelector, DomainCodeSelector, opacityComponent, udpSetting },
  props: ['rawData', 'currentModel', 'dataByType', 'isLogicalModel', 'getTableHTMLFunction', 'graph', 'Changes', 'createRelation', 'diagramId', 'getViewHTMLFunction', 'formatThemeTemplateData', 'cellDialogData', 'fontFamily', 'getColumnNameNamingMap', 'categoryOrder', 'deliverNum', 'formatTextFontSimpleBack', 'getIndexNameNamingMap', 'reNameColumnType'],
  data () {
    let requestBody = {
      // elementId: null,
      test: '',
      name: null,
      cnName: null,
      description: null,
      newCols: [],
      modCols: [],
      newKeyGroups: [],
      delKeyGroups: [],
      allUdps: {},
      currentQueryDomainExists: false,
      currentQueryDomain: [],
      currentStyle: null,
      currentTableDiagram: null
    }
    // if (this.isLogicalModel) {
    //   requestBody.logicalOnly = null
    // } else {
    //   requestBody.physicalOnly = null
    // }
    return {
      size: 20,
      total: 0,
      current: 1,
      codeValues: [],
      codeValuesPage: [],
      lodash: _,
      expandActive: false,
      shrinkImg,
      shrinkActiveImg,
      expandImg,
      expandActiveImg,
      checkList: [],
      translateActive: false,
      translateImg,
      translateActiveImg,
      limitedDsApply: false,
      limitedDsApplyConfig: {
        rColDt: false,
        rColChName: false,
        rColName: false
      },
      requestBody,

      columnsUdpKeys: null,
      allCols: [],
      allColsInitial: null,
      pk: [],
      fk: [],
      domainIdToName: {},
      activeTab: 'properties',

      autoIncrementMap: {},
      tablesAndViews: [],
      defaultProps: {
        label: 'name'
      },
      currentCol: { name: '' },
      currentColBak: {},
      currentTable: '',
      showTree: false,
      shrink: true,
      style: {
        StyleFontBoldItalic: '',
        StyleFontFamily: 'Tahoma',
        StyleFontLineThrough: false,
        StyleFontSize: 9,
        StyleFontUnderLine: false,
        StyleTextColor: 'rgba(0, 0, 0, 1)',
        StyleBackColor: ''
      },
      defaultStyle: {
        StyleFontBoldItalic: '',
        StyleFontFamily: 'Tahoma',
        StyleFontLineThrough: false,
        StyleFontSize: 9,
        StyleFontUnderLine: false,
        StyleTextColor: 'rgba(0, 0, 0, 1)',
        StyleBackColor: '',
        fontStyle: [{
          label: '常规',
          value: ''
        }, {
          label: '斜体',
          value: 'Italic'
        }, {
          label: '加粗',
          value: 'Bold'
        }, {
          label: '加粗斜体',
          value: 'BoldItalic'
        } ]
      },
      domainLoading: false,
      currentQueryDomain: []
    }
  },
  beforeMount () {
    this.getTablesAndViews()
    this.getCurrentStyle()
  },
  mounted () {
    this.limitedDsApply = this.currentModel.limitedDsApply
    if (this.limitedDsApply) {
      this.limitedDsApplyConfig = this.currentModel.limitedDsApplyConfig
    }
    // this.onReady()
  },
  methods: {
    computedCodeValues () {
      this.codeValues = []
      this.codeValuesPage = []
      this.total = 0
      let domainCodes = this.$globalData.domainCodes
      if (domainCodes) {
        this.codeValues = domainCodes.valueMap.get(this.allCols[0].dataStandardCode)
        if (this.codeValues) {
          this.current = 1
          this.getCodeTableData()
          this.total = this.codeValues.length
        }
      }
    },
    handleCurrentChange (current) {
      this.current = current
      this.getCodeTableData()
    },
    getCodeTableData () {
      this.codeValuesPage = this.codeValues.slice((this.current - 1) * this.size, this.current * this.size)
    },
    handleSizeChange (size) {
      this.size = size
      this.getCodeTableData()
    },
    onFocus () {
      this.dataTypeSearchMode = false
    },
    onInput () {
      this.dataTypeSearchMode = true
    },
    handleStyleListChange (event, target, key) {
      let list = this.checkList
      if (list.indexOf('Bold') > -1 && list.indexOf('Italic') > -1) {
        this.$set(target, key, 'BoldItalic')
      } else if (list.length > 0) {
        let idx = list.indexOf('Bold')
        if (idx >= 0) {
          this.$set(target, key, 'Bold')
        } else {
          idx = list.indexOf('Italic')
          if (idx >= 0) {
            this.$set(target, key, 'Italic')
          }
        }
        if (list.length === 1 && list[0] === '') {
          this.$set(target, key, '')
        }
      } else {
        this.$set(target, key, '')
      }
    },
    formatColumnName (row) {
      row.name = this.getColumnNameNamingMap(row.name)
    },
    clearLimitedDomain (bool) {
      if (bool) {
        this.clearDomain(this.allCols[0])
      }
    },
    handleColumnNameTab (cnName, checkRealTimeTranslate) {
      if (cnName && (!checkRealTimeTranslate || (checkRealTimeTranslate && this.dataByType.namingOption.IsUsingRealTimeTranslate))) {
        this.$http.post(this.$url + `/service/nametranslate/`, {
          logicalNames: [cnName],
          namingSeperator: this.dataByType.namingOption.NamingSeperator,
          c2e: true,
          categorySet: this.categoryOrder
        }).then(res => {
          if (res.data[0]) {
            this.allCols[0].name = this.getColumnNameNamingMap(res.data[0])
            this.$refs.colName.focus()
          }
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    checkColName (name) {
      if (this.checkColIsDuplicate(name)) {
        this.$confirm('字段不能重名', '提示', {
          type: 'warning',
          closeOnClickModal: false
        })
          .then(() => {
            this.$refs['colName'].focus()
          })
          .catch(() => {
            this.$refs['colName'].focus()
          })
      } else if (name === '') {
        this.$confirm('字段名不能为空', '提示', {
          type: 'warning',
          closeOnClickModal: false
        })
          .then(() => {
            this.$refs['colName'].focus()
          })
          .catch(() => {
            this.$refs['colName'].focus()
          })
      }
    },
    checkColIsDuplicate (name) {
      return this.dataByType.view[this.rawData.tableMsg.Id].children.some(v => !v.properties.deleted && v.properties.Name === name && v.properties.Id !== this.rawData.colId)
    },
    toExpand () {
      this.shrink = false
      this.$emit('changeDialogWidth', `${$('#model-edit').width() - $('.left-panel-wrapper.tree-area').width() - 44}px`)
    },
    toShrink () {
      this.shrink = true
      this.$emit('changeDialogWidth', '600px')
    },
    getCurrentStyle () {
      let colId = this.rawData.colId
      let tableId = this.rawData.tableMsg.Id
      let tableDiagram = this.dataByType.diagram[this.diagramId].children.find(v => v.properties.OwneeRef === tableId)
      let colStyle = tableDiagram && tableDiagram.children && tableDiagram.children.find(v => v.properties.AttributeRef === colId)
      this.currentTableDiagram = tableDiagram
      if (colStyle) {
        // 说明已经有自定义样式则从diagram获取
        this.currentStyle = colStyle
        this.style = this.formatThemeTemplateData(_.cloneDeep(colStyle).properties)
        this.defaultStyle = _.cloneDeep(this.style)
        // this.defaultStyle.StyleFontSize = parseFloat(this.defaultStyle.StyleFontSize)
      } else {
        // 没有自定义则获取全局字段样式
        this.currentStyle = null // 存在currentStyle则修改样式，不存在则新增样式
        let style = this.formatThemeTemplateData(_.cloneDeep(this.rawData.columnsMsg[0]).properties)
        // 有全局样式时
        if (style.AttributeTextFontSize) {
          let newStyle = {
            StyleFontFamily: style.AttributeTextFontFamily,
            StyleFontLineThrough: style.AttributeTextFontLineThrough,
            StyleFontSize: style.AttributeTextFontSize,
            StyleFontUnderLine: style.AttributeTextFontUnderLine,
            StyleTextColor: style.AttributeTextColor,
            StyleBackColor: '',
            StyleFontBoldItalic: style.AttributeTextFontBoldItalic
          }
          this.style = newStyle
          this.defaultStyle = _.cloneDeep(newStyle)
          // this.defaultStyle.StyleFontSize = parseFloat(this.defaultStyle.StyleFontSize)
        }
      }
      this.getCheckList(this.style.StyleFontBoldItalic)
    },
    getCheckList (style) {
      let result = []
      if (style.indexOf('Bold') > -1) {
        result.push('Bold')
      }
      if (style.indexOf('Italic') > -1) {
        result.push('Italic')
      }
      this.checkList = result
    },
    formatColor (str) {
      if (str && str.indexOf('rgba') !== -1) {
        let arr = str.split(',')
        return `ARGBColor:${parseFloat(arr[3].slice(1, -1)) * 255}:${arr[0].slice(5)}:${arr[1].slice(1)}:${arr[2].slice(1)}`
      }
    },
    formatFont (fontFamily, fontSize) {
      return `${fontFamily}, ${fontSize}pt`
    },
    clearRef () {
      this.currentCol = { name: '' }
      this.currentTable = ''
      this.allCols[0].Reference = ''
    },
    callShowTree () {
      this.$refs.currentCol.blur()
      this.getTablesAndViews()
      this.showTree = true
    },
    handleNodeClick (data) {
      if (!data.type) {
        this.currentCol = data
        this.currentTable = data.pName
        this.allCols[0].Reference = data.id
      }
    },
    getTablesAndViews () {
      let newArr = []
      let tables = _.cloneDeep(this.dataByType.table)
      let views = _.cloneDeep(this.dataByType.view)
      // 排除当前view
      delete views[this.rawData.tableMsg.Id]
      for (let id in tables) {
        // let tableArr = tables[id].children.filter(v => v.objectClass === 'Datablau.LDM.EntityAttribute').map(v => { return { name: v.properties.Name, id: v.properties.Id } })
        if (!tables[id].properties.deleted && tables[id].properties.used) {
          newArr.push({
            id,
            type: 'table',
            name: tables[id].properties.Name,
            children: this.getObjChildren(tables[id], 'table')
          })
        }
      }
      for (let id in views) {
        // let viewArr = views[id].children.filter(v => v.objectClass === 'Datablau.LDM.EntityAttribute').map(v => { return { name: v.properties.Name, id: v.properties.Id } })
        if (!views[id].properties.deleted && views[id].properties.used) {
          newArr.push({
            id,
            type: 'view',
            name: views[id].properties.Name,
            children: this.getObjChildren(views[id], 'view')
          })
        }
      }
      this.tablesAndViews = newArr
    },
    getObjChildren (obj, type) {
      if (!obj.children) {
        return []
      }
      return obj.children.filter(v => v.objectClass === 'Datablau.LDM.EntityAttribute').map(v => { return { name: v.properties.Name, id: v.properties.Id, pName: obj.properties.Name, pId: obj.properties.Id, pType: type } })
    },
    clearCode () {
      this.allCols[0].dataStandardCode = ''
      this.computedCodeValues()
    },
    callCodeSelector (row) {
      this.$refs.domainCodeSelector.openDialog(row.dataStandardCode)
    },
    handleCodeSelected (code) {
      this.$refs.domainCodeSelector.closeDialog()
      this.allCols[0].dataStandardCode = code.code
      this.computedCodeValues()
    },
    onReady () {
      this.currentCol = { name: '' }
      this.currentTable = ''
      //   this.prepareTableUdps(this.requestBody)
      this.columnsUdpKeys = this.prepareColumnUdps(this.requestBody).udpMessage
      //   this.calculateYOfBottom()
      this.getPkColumnIds()
      this.prepareRequestBody()
      this.getCurrentStyle()
    },
    prepareColumnUdps (requestBody) {
      let columnsUdps = new Set()
      this.dataByType.udp.forEach(item => {
        if (item.entityType === 80000005) {
          columnsUdps.add(item.Id)
        }
      })
      return {
        udpMessage: columnsUdps
      }
    },
    getPkColumnIds () {
      this.pk = []
      this.fk = []
      Array.isArray(this.rawData.pk) && this.rawData.pk.forEach(p => {
        Array.isArray(p.children) && p.children.forEach(k => {
          this.pk.push(k.properties['AttributeRef'])
        })
      })
      Array.isArray(this.rawData.fk) && this.rawData.fk.forEach(p => {
        Array.isArray(p.children) && p.children.forEach(k => {
          this.fk.push(k.properties['AttributeRef'])
        })
      })
    },
    async prepareRequestBody () {
      //   if (this.rawData.tableMsg.Id) {
      //     this.requestBody.elementId = this.rawData.tableMsg.Id
      //   }
      //   this.requestBody.name = this.rawData.tableMsg.Name
      //   this.requestBody.cnName = this.rawData.tableMsg.LogicalName
      //   this.requestBody.description = this.rawData.tableMsg.Definition
      //   if (this.isLogicalModel) {
      //     this.requestBody.logicalOnly = this.rawData.tableMsg.IsLogicalOnly
      //   } else {
      //     this.requestBody.physicalOnly = this.rawData.tableMsg.IsPhysicalOnly
      //   }
      this.allCols = []
      this.rawData.columnsMsg.forEach(item => {
        let body = {
          elementId: item.properties.Id,
          name: item.properties.Name,
          cnName: item.properties.LogicalName,
          enName: item.properties.EnName,
          dataType: item.properties.DataType,
          notNull: item.properties.IsNotNull,
          domainId: item.properties.DataStandardRef,
          dataStandardCode: item.properties.DataStandardCode,
          defaultVal: item.properties.DefaultValue,
          description: item.properties.Definition,
          deleted: item.properties.deleted,
          Reference: item.properties.Reference,
          Text: item.properties.Text
          // IsAutoIncrement: item.properties.IsAutoIncrement,
          // StartingValue: item.properties.StartingValue,
          // IdentityIncrementBy: item.properties.IdentityIncrementBy,
          // IdentityMaxValue: item.properties.IdentityMaxValue,
          // IdentityMinValue: item.properties.IdentityMinValue,
          // IdentityCacheValue: item.properties.IdentityCacheValue,
          // IsIdentityOrder: item.properties.IsIdentityOrder,
          // IsIdentityCycle: item.properties.IsIdentityCycle
        }
        // 检查引用的关系是否存在
        // 1、先判断当前引用字段是否存在，不存在则清空当前引用
        // 2、查找当前视图和目标字段的视图直接的关系，判断是否存在包含当前视图字段与目标字段的关系
        // 通过引用字段id Reference 查找相关表与字段信息
        this.tablesAndViews.some(table => {
          return table.children.some(col => {
            if (col.id === item.properties.Reference) {
              this.currentCol = _.cloneDeep(col)
              this.currentColBak = _.cloneDeep(col)
              this.currentTable = col.pName
              return true
            }
          })
        })
        if (this.pk.indexOf(body.elementId) > -1) {
          body.notNull = true
        }
        if (this.isLogicalModel) {
          body.logicalOnly = item.properties.IsLogicalOnly
        } else {
          body.physicalOnly = item.properties.IsPhysicalOnly
        }
        body.allUdps = {}
        this.columnsUdpKeys && this.columnsUdpKeys.forEach(i => {
          body.allUdps[String(i)] = item.properties[i] === undefined ? null : item.properties[i]
        })
        this.allCols.push(body)
      })
      this.computedCodeValues()
      try {
        let res = await this.$http({
          url: this.$url + '/service/domains/namemap',
          method: 'post',
          data: this.rawData.columnsMsg.map(item => item.properties.DataStandardRef).filter(domainId => domainId)
        })
        let domainIdToName = res.data
        this.rawData.columnsMsg.forEach((item, index) => {
          if (this.allCols[index].domainId) {
            this.$set(this.allCols[index], 'domainName', domainIdToName[item.properties.DataStandardRef])
          }
        })
      } catch (e) {
        this.$showFailure(e)
      }
      this.allColsInitial = _.cloneDeep(this.allCols)
    //   this.highlightRow()
    },
    queryDomain (query, cb) {
      // let allDomains = this.$globalData.allDomains
      // let currentQueryDomain = allDomains.filter(item => {
      //   return string.matchKeyword(item, queryString, 'value')
      // })
      // this.currentQueryDomainExists = currentQueryDomain.length > 0
      // cb(currentQueryDomain)
      const obj = {
        chineseName: query,
        domainState: 'A',
        folderId: 1,
        submitter: '',
        firstPublishStart: null,
        firstPublishEnd: null,
        ownerOrg: '',
        orderColumn: ['createTime'],
        ascOrder: [false],
        currentPage: 1,
        pageSize: 10
      }
      this.domainLoading = true
      this.$http.post(`${this.$url}/service/domains/latest/page`, obj).then(res => {
        this.domainLoading = false
        this.currentQueryDomain = res.data.items
        this.currentQueryDomainExists = this.currentQueryDomain.length > 0
        cb(this.currentQueryDomain)
      }).catch(e => {
        this.$showFailure(e)
      }).finally(() => {
        this.domainLoading = false
      })
    },
    queryDataType (queryString, cb) {
      let allDataTypes = $const.DataTypes[this.currentModel.modelType.toLowerCase()]
      // switch (this.currentModel.modelType) {
      //   case 'Oracle':
      //   case 'Mysql':
      //   case 'Logical':
      //     allDataTypes
      //     break
      //   default:
      //     allDataTypes = $const.DataTypes.common
      //     break
      // }
      if (this.dataTypeFocusPrevent) {
        cb()
        return
      }
      let result = queryString && this.dataTypeSearchMode ? allDataTypes.filter((item) => {
        if (typeof item === 'string') {
          return (item.toLowerCase().indexOf(queryString.toLowerCase()) > -1)
        } else {
          return false
        }
      }) : allDataTypes
      const Folders = []
      if (queryString && this.dataTypeSearchMode) {
        /*  const folderSet = new Set()
        result.forEach(item => {
          let index = allDataTypes.indexOf(item)
          do {
            index--
          } while (typeof allDataTypes[index] === 'string')
          folderSet.add(allDataTypes[index])
        })
        result = _.concat(result, folderSet)  */
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
    handleOptionSelect (value, row) {
      // this.fillColumnDetailFromDomain(row, this.$globalData.domainIdFullMap.get(value.id))
      // this.currentQueryDomainExists = false
      row['cnName'] = value['chName']
      let domain = this.currentQueryDomain.find(d => d.domainCode === value.domainCode)
      if (domain) {
        domain.inheritType = _.cloneDeep(this.$refs.domainSelector.selectedType)
        this.fillColumnDetailFromDomain(row, domain)
        this.currentQueryDomainExists = false
      }
    },
    limitedDsApplyMessage (showMessage) {
      if (showMessage) {
        this.$message.warning('此字段引用了数据标准，强管控模式下不允许修改此表单项，请先取消对数据标准的引用')
      }
    },
    callDomainSelector (scope) {
      this.currentRow = scope
      this.$refs.domainSelector.openDialog()
    },
    clearDomain (scope) {
      scope.domainId = null
      scope.domainName = null
    },
    handleDomainSelector (domain) {
      this.$refs.domainSelector.closeDialog()
      this.fillColumnDetailFromDomain(this.currentRow, domain)
      this.computedCodeValues()
    },
    fillColumnDetailFromDomain (row, domain) {
      row.domainId = domain.id
      this.$set(row, 'domainName', domain.chName)
      this.domainIdToName[domain.id] = domain.chName
      // row.dataStandardCode = domain.domainCode
      if (domain.referenceCode) {
        this.$set(row, 'dataStandardCode', domain.referenceCode)
      }
      let { inheritType } = domain
      if (inheritType.includes('description')) {
        row.description = domain['description']
      }
      if (inheritType.includes('chName')) {
        row['cnName'] = domain['chName']
      }
      if (inheritType.includes('abbrivation')) {
        row['name'] = domain['abbrivation']
      }
      if (inheritType.includes('dataType')) {
        this.reNameColumnType(row, 'dataType', domain)
        // if (domain['dataScale']) {
        //   row['dataType'] = domain['dataType'] + '(' + domain['dataScale'] + ')'
        // } else {
        //   row['dataType'] = domain['dataType']
        // }
      }
      if (inheritType.includes('notNull')) {
        row['notNull'] = domain['notNull']
      }
      if (inheritType.includes('enName')) {
        row['enName'] = domain['enName']
      }
    },
    updateUdpValue (obj, index, value) {
      this.$set(obj, index, value)
    },
    async save () {
      if (!this.allCols[0].dataType) {
        this.$confirm(`数据类型不能为空`, '提示', {
          type: 'warning',
          closeOnClickModal: false
        })
          .then(() => {
            this.$refs['colDataType'].focus()
          })
          .catch(() => {
            this.$refs['colDataType'].focus()
          })
        return
      }
      let changes = []
      let isNewHistory = true // 新建关系的话不需要新建记录
      let entityId = this.rawData.tableMsg.Id
      let tableData = this.dataByType.view[entityId]
      let cellList = this.graph.graph.getDefaultParent().children
      let styleChanged = false
      this.requestBody.modCols = []
      if (JSON.stringify(this.allColsInitial[0]) !== JSON.stringify(this.allCols[0])) {
        this.allCols[0].changed = true
        this.requestBody.modCols = _.cloneDeep(this.allCols)
      }
      this.requestBody.modCols.map(item => ({
        ...item.allUdps,
        DataType: item.dataType,
        Id: item.elementId,
        IsNotNull: item.notNull,
        Name: item.name,
        EnName: item.enName,
        RawType: 'Attribute',
        DataStandardCode: item.dataStandardCode,
        TypeId: 80000005,
        LogicalName: item.cnName,
        DefaultValue: item.defaultVal,
        Definition: item.description,
        IsLogicalOnly: item.logicalOnly,
        IsPhysicalOnly: item.physicalOnly,
        DataStandardRef: item.domainId,
        changed: item.changed,
        deleted: item.deleted,
        Reference: item.Reference,
        Text: item.Text
        // IsAutoIncrement: item.IsAutoIncrement,
        // StartingValue: item.StartingValue,
        // IdentityIncrementBy: item.IdentityIncrementBy,
        // IdentityMaxValue: item.IdentityMaxValue,
        // IdentityMinValue: item.IdentityMinValue,
        // IdentityCacheValue: item.IdentityCacheValue,
        // IsIdentityOrder: item.IsIdentityOrder,
        // IsIdentityCycle: item.IsIdentityCycle
      })).forEach(item => {
        let index = this.dataByType.view[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && column.properties.Id === item.Id)
        if (index !== -1) {
          let change = new (this.Changes)('modifyColumn', {
            pId: entityId,
            pName: tableData.properties.Name,
            id: item.Id,
            name: item.Name,
            pre: _.cloneDeep(this.dataByType.view[entityId].children[index]),
            now: null
          })
          _.merge(this.dataByType.view[entityId].children[index].properties, item)
          change.obj.now = _.cloneDeep(this.dataByType.view[entityId].children[index])
          changes.push(change)
        }
      })
      // 目标改变则修改相应的索引和关系
      // // test
      // if (this.rawData.colId === 13) {
      //   this.currentColBak = {
      //     pId: 6,
      //     id: 12,
      //     pName: 'table_6'
      //   }
      //   alert('debug mode')
      // }
      let viewId = entityId
      let viewName = tableData.properties.Name
      let oldTableId = this.currentColBak.pId
      let oldTableName = this.currentColBak.pName
      let oldColId = this.currentColBak.id
      let tableId = this.currentCol.pId
      let colId = this.currentCol.id
      let tableName = this.currentCol.pName
      let viewColId = this.rawData.colId
      let relation = this.dataByType.relation
      let hitRelations = null // 符合当前视图id与目标表id的关系
      let currentHitRelation = null // 符合当前视图id与目标表id且相关的keygroup包含双方字段id的关系
      let oldCurrentHitRelation = null // 同上但是是包含旧的目标表和字段的关系
      // 找出新旧表和当前视图的所有虚拟keygroup
      let sourceOldTable = this.dataByType.table[oldTableId] || this.dataByType.view[oldTableId]
      let sourceTable = this.dataByType.table[tableId] || this.dataByType.view[tableId]
      let oldTableKeygroups = sourceOldTable?.children.filter(v => v.objectClass === 'Datablau.LDM.EntityKeyGroup' && v.properties.KeyGroupType === 'VirtualKey')
      let tablekeygroups = sourceTable?.children.filter(v => v.objectClass === 'Datablau.LDM.EntityKeyGroup' && v.properties.KeyGroupType === 'VirtualKey')
      let viewKeygroups = this.dataByType.view[viewId] && this.dataByType.view[viewId].children.filter(v => v.objectClass === 'Datablau.LDM.EntityKeyGroup' && v.properties.KeyGroupType === 'VirtualKey')
      let source = cellList.find(cell => cell.OwneeRef === this.currentCol.pId)
      let target = cellList.find(cell => cell.OwneeRef === entityId)
      if (colId !== oldColId) {
        // 之前的目标不为空的情况 找出旧的关系和相关keygroup,根据不同情况删除key、keygroup、关系
        if (this.currentColBak.id !== undefined) {
          let oldTablekeygroup = null
          let viewKeygroup = null
          // 查找符合的旧关系关系
          for (let key in relation) {
            if (relation.hasOwnProperty(key)) {
              if (relation[key].properties.ChildEntityRef === viewId && relation[key].objectClass === 'Datablau.LDM.RelationshipView' && !relation[key].properties.deleted) {
                if (relation[key].properties.ParentEntityRef === oldTableId) {
                  // hitRelations.push(relation[key])
                  let oldTableKeygroupId = relation[key].properties.ParentKeyRef
                  let viewKeygroupId = relation[key].properties.ChildKeyRef
                  // 找到当前关系下存在旧目标字段的keygroup
                  oldTablekeygroup = oldTableKeygroups.find(v => v.properties.Id === oldTableKeygroupId && v.children.some(v => v.properties.AttributeRef === oldColId))
                  viewKeygroup = viewKeygroups.find(v => v.properties.Id === viewKeygroupId && v.children.some(v => v.properties.AttributeRef === viewColId))
                  if (oldTablekeygroup && viewKeygroup) {
                    oldCurrentHitRelation = relation[key]
                    break
                  }
                }
              }
            }
          }
          // 有符合条件的旧关系 则需要把相关的key、keygroup、关系删除掉
          if (oldCurrentHitRelation) {
            let oldKeyId
            let viewKeyId
            let preTableKeyGroup = _.cloneDeep(this.dataByType.table[oldTableId].children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === oldTablekeygroup.properties.Id))
            let preViewKeyGroup = _.cloneDeep(this.dataByType.view[viewId].children.find(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === viewKeygroup.properties.Id))

            // 删除对应的旧keygroup中的key 添加撤回
            oldTablekeygroup.children.splice(oldTablekeygroup.children.findIndex(v => { oldKeyId = v.properties.Id; return v.properties.AttributeRef === oldColId }), 1)
            viewKeygroup.children.splice(viewKeygroup.children.findIndex(v => { viewKeyId = v.properties.Id; return v.properties.AttributeRef === viewColId }), 1)
            // 删除keygroup中KeyGroupMemberRefs的对应值 添加撤回
            oldTablekeygroup.properties.KeyGroupMemberRefs.splice(oldTablekeygroup.properties.KeyGroupMemberRefs.findIndex(v => v === oldKeyId), 1)
            viewKeygroup.properties.KeyGroupMemberRefs.splice(viewKeygroup.properties.KeyGroupMemberRefs.findIndex(v => v === viewKeyId), 1)
            changes.push(new (this.Changes)('modifyIndex', {
              pId: oldTableId,
              pName: oldTableName,
              id: oldTablekeygroup.properties.Id,
              name: oldTablekeygroup.properties.Name,
              pre: preTableKeyGroup,
              now: oldTablekeygroup
            }))
            this.dataByType.table[oldTableId].properties.changed = true
            changes.push(new (this.Changes)('modifyIndex', {
              pId: viewId,
              pName: viewName,
              id: viewKeygroup.properties.Id,
              name: viewKeygroup.properties.Name,
              pre: preViewKeyGroup,
              now: viewKeygroup
            }))
            // 检查keygroup的children 如果为空则删除该keygroup
            if (oldTablekeygroup.children.length === 0) {
              // 添加撤回
              changes.push(new (this.Changes)('deleteIndex', {
                pId: oldTableId,
                pName: oldTableName,
                id: oldTablekeygroup.properties.Id,
                name: oldTablekeygroup.properties.Name
              }))
              this.$set(oldTablekeygroup.properties, 'deleted', true)
              this.dataByType.table[oldTableId].properties.changed = true
              // oldTablekeygroup.properties.deleted = true
            }
            if (viewKeygroup.children.length === 0) {
              // 添加撤回
              changes.push(new (this.Changes)('deleteIndex', {
                pId: viewId,
                pName: viewName,
                id: viewKeygroup.properties.Id,
                name: viewKeygroup.properties.Name
              }))
              this.$set(viewKeygroup.properties, 'deleted', true)
              // viewKeygroup.properties.deleted = true
              // 当viewKeygroup删除时，删除旧关系与connection 添加撤回
              // oldCurrentHitRelation.properties.deleted = true
              this.$set(oldCurrentHitRelation.properties, 'deleted', true)
              changes.push(new (this.Changes)('deleteRelation', {
                id: oldCurrentHitRelation.properties.Id,
                name: oldCurrentHitRelation.properties.Name
              }))
              this.dataByType.diagram[this.diagramId].children.some(v => {
                if (v.objectClass === 'Datablau.ERD.ConnectionVirtualView' && v.properties.OwneeRef === oldCurrentHitRelation.properties.Id) {
                  // 添加撤回
                  v.properties.deleted = true
                  changes.push(new (this.Changes)('deleteConnection', {
                    id: v.properties.Id,
                    name: v.properties.Name
                  }))
                  return true
                }
              })
            }
          }
          // 不是相关的关系不做删除操作 到下一步建立新关系

          // 已经创建过关系则先删除索引与关系
          // 先找到表的索引并删除
          // this.dataByType.table[this.currentColBak.pId].children.forEach(v => {
          //   if (v.objectClass === 'Datablau.LDM.EntityKeyGroup') {
          //     v.children.forEach(v2 => {
          //       if (v2.properties.AttributeRef === this.currentColBak.id) {
          //         // 只有一个子成员就删除整个KeyGroup
          //         if (v.children.length === 1) {
          //           v.properties.deleted = true
          //           changes.push(new Changes('deleteIndex', {
          //             pId: this.currentCol.pId,
          //             pName: this.currentCol.pName,
          //             name: v.properties.Name,
          //             id: v.properties.Id
          //           }))
          //         }
          //       }
          //     })
          //   }
          // })
          // 找到当前视图字段的索引并删除
          // this.dataByType.view[entityId].children.forEach(v => {
          //   if (v.objectClass === 'Datablau.LDM.EntityKeyGroup') {
          //     v.children.forEach(v2 => {
          //       if (v2.properties.AttributeRef === this.rawData.colId) {
          //         v2.properties.deleted = true
          //       }
          //     })
          //   }
          // })
          // changes.push(new Changes('deleteIndex', {
          //   pId: entityId,
          //   pName: tableData.properties.Name,
          //   name: this.currentColBak.name,
          //   id: this.currentColBak.id
          // }))
        }
        if (colId) {
          let relationsLv1 = [] // 有目标字段和当前view字段的关系
          let relationsLv2 = []// 不完全符合条件的关系
          // let relationsLv3 = []// 只有当前view字段的关系
          // let relationsLv4 = []// 只有目标表和当前view的关系
          // 创建，先查看是否有符合的相关关系，有视图字段与目标字段相关的关系则不做创建操作
          for (let key in relation) {
            let tablekeygroup = null
            let viewKeygroup = null
            if (relation.hasOwnProperty(key)) {
              if (relation[key].properties.ChildEntityRef === viewId && relation[key].objectClass === 'Datablau.LDM.RelationshipView' && !relation[key].properties.deleted) {
                if (relation[key].properties.ParentEntityRef === tableId) {
                  let tableKeygroupId = relation[key].properties.ParentKeyRef
                  let viewKeygroupId = relation[key].properties.ChildKeyRef
                  tablekeygroup = tablekeygroups.find(v => v.properties.Id === tableKeygroupId && v.children.some(v => v.properties.AttributeRef === colId))
                  viewKeygroup = viewKeygroups.find(v => v.properties.Id === viewKeygroupId && v.children.some(v => v.properties.AttributeRef === viewColId))
                  if (tablekeygroup && viewKeygroup) {
                    relationsLv1.push(relation[key])
                    // 有完全符合条件的关系就不用找其他条件的关系
                    break
                  } else {
                    relationsLv2.push(relation[key])
                  }
                  // else if (tablekeygroup && !viewKeygroup) {
                  //   relationsLv2.push(relation[key])
                  // } else if (!tablekeygroup && viewKeygroup) {
                  //   relationsLv3.push(relation[key])
                  // } else if (!tablekeygroup && !viewKeygroup) {
                  //   relationsLv4.push(relation[key])
                  // }
                }
              }
            }
          }
          if (relationsLv1.length > 0) {
            // 完全符合条件：有关系，且有相应的keygroup不需要做任何创建操作

          } else if (relationsLv2.length > 0) {
            // 添加或创建缺少当前view字段的keygroup
            let keygroupId = relationsLv2[0].properties.ParentKeyRef
            let viewKeygroupId = relationsLv2[0].properties.ChildKeyRef
            let currentKeygroud = tablekeygroups.find(v => v.properties.Id === keygroupId)
            let currentViewKeygroud = viewKeygroups.find(v => v.properties.Id === viewKeygroupId)
            let preCurrentKeygroud = _.cloneDeep(currentKeygroud)
            let preCurrentViewKeygroud = _.cloneDeep(currentViewKeygroud)
            let currentKeyMember = currentKeygroud && currentKeygroud.children.find(v => v.properties.AttributeRef === colId)
            // 当keygroud都存在时
            if (currentKeygroud && currentViewKeygroud) {
              // 查看keyground里面是否包含目标字段，存在则复制一个加入到children中，不用新建
              if (currentKeyMember) {
                currentKeygroud.children.push(currentKeyMember)
                currentKeygroud.properties.KeyGroupMemberRefs.push(currentKeyMember.properties.Id)
                changes.push(new (this.Changes)('modifyIndex', {
                  pId: tableId,
                  pName: tableName,
                  id: currentKeygroud.properties.Id,
                  name: currentKeygroud.properties.Name,
                  pre: preCurrentKeygroud,
                  now: currentKeygroud
                }))
                this.dataByType.table[tableId].properties.changed = true
              } else if (currentKeygroud) {
                if (Array.isArray(currentKeygroud.children)) {
                // 添加撤回
                  currentKeygroud.children.push({
                    objectClass: 'Datablau.LDM.EntityKeyGroupMember',
                    properties: {
                      AttributeRef: colId,
                      Id: this.deliverNum.seed,
                      UniqueId: uuidv4(),
                      OrderType: 'None',
                      TypeId: 80500001,
                      Name: 'KeyGroupMember'
                    }
                  })
                  if (Array.isArray(currentKeygroud.properties.KeyGroupMemberRefs)) {
                  // 添加撤回
                    currentKeygroud.properties.KeyGroupMemberRefs.push(this.deliverNum.seed)
                  } else {
                  // 添加撤回
                    currentKeygroud.properties.KeyGroupMemberRefs = [this.deliverNum.seed]
                  }
                  changes.push(new (this.Changes)('modifyIndex', {
                    pId: tableId,
                    pName: tableName,
                    id: currentKeygroud.properties.Id,
                    name: currentKeygroud.properties.Name,
                    pre: preCurrentKeygroud,
                    now: currentKeygroud
                  }))
                  this.deliverNum.seed++
                  this.dataByType.table[tableId].properties.changed = true
                } else {
                // 添加撤回
                  currentKeygroud.children = [{
                    objectClass: 'Datablau.LDM.EntityKeyGroupMember',
                    properties: {
                      AttributeRef: colId,
                      Id: this.deliverNum.seed,
                      UniqueId: uuidv4(),
                      OrderType: 'None',
                      TypeId: 80500001,
                      Name: 'KeyGroupMember'
                    }
                  }]
                  if (Array.isArray(currentKeygroud.properties.KeyGroupMemberRefs)) {
                  // 添加撤回
                    currentKeygroud.properties.KeyGroupMemberRefs.push(this.deliverNum.seed)
                  } else {
                  // 添加撤回
                    currentKeygroud.properties.KeyGroupMemberRefs = [this.deliverNum.seed]
                  }
                  changes.push(new (this.Changes)('modifyIndex', {
                    pId: tableId,
                    pName: tableName,
                    id: currentKeygroud.properties.Id,
                    name: currentKeygroud.properties.Name,
                    pre: preCurrentKeygroud,
                    now: currentKeygroud
                  }))
                  this.deliverNum.seed++
                  this.dataByType.table[tableId].properties.changed = true
                }
              }
              if (Array.isArray(currentViewKeygroud.children)) {
              // 添加撤回
                currentViewKeygroud.children.push({
                  objectClass: 'Datablau.LDM.EntityKeyGroupMember',
                  properties: {
                    AttributeRef: viewColId,
                    Id: this.deliverNum.seed,
                    UniqueId: uuidv4(),
                    OrderType: 'None',
                    TypeId: 80500001,
                    Name: 'KeyGroupMember'
                  }
                })
                if (Array.isArray(currentViewKeygroud.properties.KeyGroupMemberRefs)) {
                // 添加撤回
                  currentViewKeygroud.properties.KeyGroupMemberRefs.push(this.deliverNum.seed)
                } else {
                // 添加撤回
                  currentViewKeygroud.properties.KeyGroupMemberRefs = [this.deliverNum.seed]
                }
                this.deliverNum.seed++
                changes.push(new (this.Changes)('modifyIndex', {
                  pId: viewId,
                  pName: viewName,
                  id: currentViewKeygroud.properties.Id,
                  name: currentViewKeygroud.properties.Name,
                  pre: preCurrentViewKeygroud,
                  now: currentViewKeygroud
                }))
              } else {
              // 添加撤回
                currentViewKeygroud.children = [{
                  objectClass: 'Datablau.LDM.EntityKeyGroupMember',
                  properties: {
                    AttributeRef: viewColId,
                    Id: this.deliverNum.seed,
                    UniqueId: uuidv4(),
                    TypeId: 80500001,
                    OrderType: 'None',
                    Name: 'KeyGroupMember'
                  }
                }]
                if (Array.isArray(currentViewKeygroud.properties.KeyGroupMemberRefs)) {
                // 添加撤回
                  currentViewKeygroud.properties.KeyGroupMemberRefs.push(this.deliverNum.seed)
                } else {
                // 添加撤回
                  currentViewKeygroud.properties.KeyGroupMemberRefs = [this.deliverNum.seed]
                }
                this.deliverNum.seed++
                changes.push(new (this.Changes)('modifyIndex', {
                  pId: viewId,
                  pName: viewName,
                  id: currentViewKeygroud.properties.Id,
                  name: currentViewKeygroud.properties.Name,
                  pre: preCurrentViewKeygroud,
                  now: currentViewKeygroud
                }))
              }
            } else {
              // 只有关系没keyground则需要创建keyground
              let viewIndex = this.createViewIndex()
              if (this.dataByType.view[entityId].children) {
                this.dataByType.view[entityId].children.push(viewIndex)
              } else {
                this.dataByType.view[entityId].children = [viewIndex]
              }
              let change = new (this.Changes)('insertIndex', {
                pId: entityId,
                pName: tableData.properties.Name,
                id: viewIndex.properties.Id,
                name: viewIndex.properties.Name,
                now: this.dataByType.view[entityId].children[this.dataByType.view[entityId].children.length - 1]
              })
              changes.push(change)
              // 创建目标表字段的索引
              let colIndex = this.createViewIndex(this.currentCol.id)
              let sourceTable = this.dataByType.table[this.currentCol.pId] || this.dataByType.view[this.currentCol.pId]
              if (sourceTable.children) {
                sourceTable.children.push(colIndex)
              } else {
                sourceTable.children = [colIndex]
              }
              change = new (this.Changes)('insertIndex', {
                pId: this.currentCol.pId,
                pName: this.currentCol.pName,
                id: colIndex.properties.Id,
                name: colIndex.properties.Name,
                now: sourceTable.children[sourceTable.children.length - 1]
              })
              sourceTable.properties.changed = true
              changes.push(change)
              let preRelation = _.cloneDeep(relationsLv2[0])
              relationsLv2[0].properties.ChildKeyRef = viewIndex.properties.Id
              relationsLv2[0].properties.ParentKeyRef = colIndex.properties.Id
              relationsLv2[0].properties.changed = true
              changes.push(new (this.Changes)('modifyRelation', {
                name: relationsLv2[0].properties.Name,
                pre: preRelation,
                now: _.cloneDeep(relationsLv2[0])
              }))
            }
          } else if (relationsLv1.length === 0 && relationsLv2.length === 0) {
            // 创建关系
            await this.createRelation(source, target, 'RelationalView', changes)
              .then(relation => {
                // 之前没有建立过关系，直接创建新的索引
                // 创建视图索引
                let viewIndex = this.createViewIndex()
                if (this.dataByType.view[entityId].children) {
                  this.dataByType.view[entityId].children.push(viewIndex)
                } else {
                  this.dataByType.view[entityId].children = [viewIndex]
                }
                let change = new (this.Changes)('insertIndex', {
                  pId: entityId,
                  pName: tableData.properties.Name,
                  id: viewIndex.properties.Id,
                  name: viewIndex.properties.Name,
                  now: this.dataByType.view[entityId].children[this.dataByType.view[entityId].children.length - 1]
                })
                changes.push(change)
                // 创建目标表字段的索引
                let colIndex = this.createViewIndex(this.currentCol.id)
                let sourceTable = this.dataByType.table[this.currentCol.pId] || this.dataByType.view[this.currentCol.pId]
                if (sourceTable.children) {
                  sourceTable.children.push(colIndex)
                } else {
                  sourceTable.children = [colIndex]
                }
                change = new (this.Changes)('insertIndex', {
                  pId: this.currentCol.pId,
                  pName: this.currentCol.pName,
                  id: colIndex.properties.Id,
                  name: colIndex.properties.Name,
                  now: sourceTable.children[sourceTable.children.length - 1]
                })
                sourceTable.properties.changed = true
                changes.push(change)
                // 把新建的索引挂载到新关系上面
                let preRelation = _.cloneDeep(relation)
                relation.properties.ChildKeyRef = viewIndex.properties.Id
                relation.properties.ParentKeyRef = colIndex.properties.Id
                changes.push(new (this.Changes)('modifyRelation', {
                  name: relation.properties.Name,
                  pre: preRelation,
                  now: _.cloneDeep(relation)
                }))
                isNewHistory = false
              })
          }
        }
      }

      // let udpsChanged = false
      // if (JSON.stringify(this.allUpdsInital) !== JSON.stringify(this.requestBody.allUdps)) {
      //   _.merge(this.dataByType.table[entityId].properties, this.requestBody.allUdps)
      //   udpsChanged = true
      // }
      // 样式改变了才写入dataByType
      if (JSON.stringify(this.style) !== JSON.stringify(this.defaultStyle)) {
        // 已经有字段自定义样式直接修改
        let transformStyle = _.cloneDeep(this.style)
        this.formatTextFontSimpleBack(transformStyle)
        if (this.currentStyle) {
          let change = new (this.Changes)('modifyShape', {
            id: this.currentTableDiagram.properties.Id,
            name: this.currentTableDiagram.properties.Name,
            pre: _.cloneDeep(this.currentTableDiagram),
            now: this.currentTableDiagram
          })
          let styleProperties = this.currentStyle.properties
          let { StyleFontBoldItalic, StyleFontFamily, StyleFontSize, StyleTextColor, StyleBackColor } = this.style
          styleProperties.StyleFont = transformStyle.StyleFont
          styleProperties.StyleTextColor = this.formatColor(StyleTextColor)
          styleProperties.StyleBackColor = this.formatColor(StyleBackColor)
          changes.push(change)
          styleProperties.changed = true
          this.currentTableDiagram.properties.changed = true
          styleChanged = true
        } else {
          // 无字段自定义样式需要新建
          let { StyleFontBoldItalic, StyleFontFamily, StyleFontSize, StyleTextColor, StyleBackColor } = this.style
          let newStyle = {
            objectClass: 'Datablau.ERD.ShapeMemberStyle',
            properties: {
              AttributeRef: this.rawData.colId,
              Id: this.deliverNum.seed++,
              Name: this.rawData.tableMsg.Name + this.rawData.colId,
              RawType: 'ShapeMemberStyle',
              TypeId: 80800042,
              UniqueId: uuidv4(),
              StyleFont: transformStyle.StyleFont,
              StyleTextColor: this.formatColor(StyleTextColor),
              StyleBackColor: this.formatColor(StyleBackColor),
              new: true
            }
          }
          let change = new (this.Changes)('modifyShape', {
            id: this.currentTableDiagram.properties.Id,
            name: this.currentTableDiagram.properties.Name,
            pre: _.cloneDeep(this.currentTableDiagram),
            now: this.currentTableDiagram
          })
          changes.push(change)
          this.currentTableDiagram.properties.changed = true
          styleChanged = true
          if (this.currentTableDiagram.children) {
            this.currentTableDiagram.children.push(newStyle)
          } else {
            this.currentTableDiagram.children = [newStyle]
          }
        }
      }
      let changed = this.requestBody.modCols.length > 0 || changes.length > 0
      if (changed) {
        let list = this.graph.graph.getDefaultParent().children
        let cell = list.find(cell => cell.OwneeRef === entityId)
        let oldtable = null
        if (oldTableId) {
          oldtable = list.find(cell => cell.OwneeRef === oldTableId)
        }
        let table = null
        if (tableId) {
          table = list.find(cell => cell.OwneeRef === tableId)
        }
        cell.value = await this.getViewHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
        if (oldtable) {
          if (oldtable.isTable) {
            oldtable.value = await this.getTableHTMLFunction(oldtable.OwneeRef, this.graph.graph, null, null, true)
          } else if (oldtable.isView) {
            oldtable.value = await this.getViewHTMLFunction(oldtable.OwneeRef, this.graph.graph, null, null, true)
          }
        }
        if (table) {
          if (table.isTable) {
            table.value = await this.getTableHTMLFunction(table.OwneeRef, this.graph.graph, null, null, true)
          } else if (table.isView) {
            table.value = await this.getViewHTMLFunction(table.OwneeRef, this.graph.graph, null, null, true)
          }
        }
        // this.graph.editor.undoManager.undoableEditHappened(new LayerEdit([]))
        if (oldCurrentHitRelation) {
          let oldRelation = list.find(cell => cell.OwneeRef === oldCurrentHitRelation.properties.Id)
          this.graph.graph.cellsRemoved([oldRelation])
        }
        if (styleChanged) {
          cell.changed = true
          cell.StyleThemeRef = this.currentTableDiagram.properties['StyleThemeRef']
          cell.StyleBackColor = this.currentTableDiagram.properties['StyleBackColor']
        }
        tableData.properties.changed = true
        // oldRelation.style = this.graph.drawEdgeShapeStyle(oldRelation.Id)
        // this.graph.graph.refresh(oldRelation)
        this.graph.graph.getView().refresh()
      }
      return {
        changes,
        isNewHistory
      }
    },
    createViewIndex (colid) {
      let maxPost = 0
      let macro = 'KeyGroup_%keyid%'
      let pre = 'vk'
      this.rawData.vk.forEach(item => {
        if (item.properties.deleted) {
          return
        }
        if (item.properties.Name) {
          let post = Number.parseInt(item.properties.Name.split('_')[item.properties.Name.split('_').length - 1])
          if (post > maxPost) {
            maxPost = post
          }
        }
      })
      // macro = pre + '_%owner%_' + (maxPost + 1)
      let properties = {
        properties: {
          Id: this.deliverNum.seed++,
          KeyGroupType: 'VirtualKey',
          Macro: macro,
          RawType: 'KeyGroup',
          KeyGroupMemberRefs: [this.deliverNum.seed],
          UniqueId: uuidv4(),
          TypeId: 80000093,
          new: true
        },
        children: [{
          objectClass: 'Datablau.LDM.EntityKeyGroupMember',
          properties: {
            AttributeRef: colid || this.rawData.colId,
            Id: this.deliverNum.seed++,
            UniqueId: uuidv4(),
            TypeId: 80500001,
            Name: 'KeyGroupMember'
          }
        }],
        objectClass: 'Datablau.LDM.EntityKeyGroup'
      }
      properties.properties.Name = this.getIndexNameNamingMap(properties.properties.Macro, this.rawData.tableMsg.Name, (maxPost + 1))
      return properties
    },
    // 通过视图id和表id找到对应的视图关系，并返回视图和表的keygroupId
    findRelation () {

    },
    handleIsAutoIncrementChange (val) {
      if (!val) {
        this.resetIncrementForm()
      }
    },
    resetIncrementForm () {
      let col = this.allCols[0]
      // col.IsAutoIncrement = false
      this.$set(col, 'IsAutoIncrement', false)
      // col.StartingValue = ''
      this.$set(col, 'StartingValue', '')
      // col.IncrementBy = ''
      this.$set(col, 'IdentityIncrementBy', '')
      // col.MaxValue = ''
      this.$set(col, 'IdentityMaxValue', '')
      // col.MinValue = ''
      this.$set(col, 'IdentityMinValue', '')
      // col.CacheValue = ''
      this.$set(col, 'IdentityCacheValue', '')
      // col.Order = ''
      this.$set(col, 'IsIdentityOrder', '')
      this.$set(col, 'IsIdentityCycle', '')
    }
  },
  computed: {
    udpMessageDisplay () {
      const udpMessage = this.allCols[0].allUdps
      const udpMessageDisplay = new Map()
      let udpList = [...this.dataByType.udp.values()].filter(item => !item.deleted && item.entityType === 80000005)
      if (udpList.some(item => item.UDPOrder)) {
        udpList.sort((a, b) => {
          return +a.UDPOrder - +b.UDPOrder
        })
      }
      udpList.forEach(udpDetail => {
        let k = udpDetail.Id
        if (!udpDetail.PageName) {
          let obj = udpMessageDisplay.get(udpDetail.ClassName || '')
          if (obj) {
            obj.set(k, udpMessage[k])
          } else {
            udpMessageDisplay.set(udpDetail.ClassName || '', new Map([[k, udpMessage[k]]]))
          }
        }
      })
      return udpMessageDisplay
    },
    udpMessagePageDisplay () {
      const udpMessage = this.allCols[0].allUdps
      const udpMessagePageDisplay = new Map()

      let udpList = [...this.dataByType.udp.values()].filter(item => !item.deleted && item.entityType === 80000005)
      if (udpList.some(item => item.UDPOrder)) {
        udpList.sort((a, b) => {
          return +a.UDPOrder - +b.UDPOrder
        })
      }
      udpList.forEach(udpDetail => {
        let k = udpDetail.Id
        if (udpDetail.PageName) {
          let pageMap = udpMessagePageDisplay.get(udpDetail.PageName)
          if (pageMap) {
            let obj = pageMap.get(udpDetail.ClassName || '')
            if (obj) {
              obj.set(k, udpMessage[k])
            } else {
              pageMap.set(udpDetail.ClassName || '', new Map([[k, udpMessage[k]]]))
            }
          } else {
            udpMessagePageDisplay.set(udpDetail.PageName, new Map([[udpDetail.ClassName || '', new Map([[k, udpMessage[k]]])]]))
          }
        }
      })
      return udpMessagePageDisplay
    },
    columnsUdpKeysDisplay () {
      const columnsUdpKeys = this.columnsUdpKeys
      const columnsUdpKeysDisplay = new Set()
      columnsUdpKeys.forEach(item => {
        if (this.dataByType.udp.get(Number.parseInt(item))) {
          columnsUdpKeysDisplay.add(item)
        }
      })
      return columnsUdpKeysDisplay
    },
    notInt () {
      if (this.allCols[0].dataType.toLowerCase().indexOf('int') === -1) {
        this.resetIncrementForm()
      }
      return this.allCols[0].dataType.toLowerCase().indexOf('int') === -1
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-autocomplete:hover /deep/ .el-input__inner {
    border-color: #409EFF;
  }
#col-details {
  .el-checkbox-group {
    display: inline-block;
    position: relative;
    bottom: 4px;
  }
  .el-checkbox-button {
    margin-right: 6px;
    display: inline-block;
    position: relative;
  }
  /deep/  .el-checkbox-button {
    .el-checkbox-button__inner {
      font-size: 14px;
      color: #777;
      padding: 5px;
      border: unset;
    }
    &.is-checked {
      .el-checkbox-button__inner {
        color: #409EFF;
        background-color: unset;
        border-color: unset;
        box-shadow: unset;
        padding: 5px;
      }
    }
    &.is-disabled {
      .el-checkbox-button__inner {
        color: #C0C4CC;
      }
    }
  }
  .underline /deep/ .el-checkbox-button__inner {
    text-decoration: underline;
  }
  .line-through /deep/ .el-checkbox-button__inner {
    text-decoration: line-through;
  }
  /deep/ .icon-tips:before {
    font-size: 14px;
  }
  /deep/ .el-tabs__item {
    font-size: 12px;
    color: #555;
    &.is-active {
      color: #409EFF;
    }
  }
  .el-form-item--mini.el-form-item {
    margin-bottom: 10px;
  }
  .translate-wrapper {
    cursor: pointer;
    top: 4px;
    margin-right: 18px;
    display: inline-block;
    position: relative;
    img {
      width: 36px;
    }
    span {
      position: absolute;
      left: 4px;
      top: -2px;
      font-size: 12px;
      line-height: 1;
      color: #409EFF;
    }
  }
    .content-box {
        position: absolute;
        top: 180px;
        left: 20px;
        right: 0px;
        bottom: 0;
        overflow: hidden;
    }
    .disc {
      padding-bottom: 20px;
    }
   .table-content {
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 50px;
    }
    .code-table-wrapper {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .tab-to-expand-btn {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          cursor: pointer;
    }
    .label-disc {
      margin-right: 20px;
      font-size: 12px;
      font-weight: 400;
      color: #555555;
    }
    .style-box  {
      display: inline-block;
      position: relative;
      height: 42px;
    }
    .middle-y {
      display: inline-block;
      vertical-align: middle;
    }
}
  #col-details {
    .el-tab-pane {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
    }
    /deep/ .el-tabs__content {
      position: relative;
      height: 93%;
    }
    /deep/ .el-tabs {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .content-wrapper {
      /deep/ {
        .el-form-item__content {
          width: 158px;
        }
        .el-tabs__header {
          border-color: #DDDDDD;
        }

        .el-form {
          width: 560px;
        }

        .el-form-item {
          width: 240px;
          margin-right: 0;
        }

        .el-autocomplete {
          display: block;
        }

        .el-input {
          width: 100%;
        }

        .properties-page {
          .el-input-number.el-input-number--mini {
            width: 100%;
          }

          .el-input-number__decrease,
          .el-input-number__increase {
            height: 32px;
          }
        }

        //.el-form-item__content {
        //  width: 170px !important;
        //}
        .def .el-form-item__content {
          width: 85%;
        }

        .check-container {
          font-size: 12px;

          &.el-form-item {
            width: 56px;
          }

          .el-form-item__content {
            width: 56px;
          }

          .el-checkbox__label {
            font-size: 12px;
          }
        }

        .udp-form {
          .el-form-item {
            display: block;
            width: 100%;
            margin: 0;

            &:last-of-type {
              .el-form-item__label {
                border-bottom: 1px solid #DDDDDD;
              }
            }
          }

          .el-form-item__label {
            width: 200px;
            height: 28px;
            background: #F5F5F5;
            border-radius: 2px 0px 0px 0px;
            border: 1px solid #DDDDDD;
            border-right: unset;
            border-bottom: unset;
          }

          .el-form-item__content {
            width: 360px;

          }

          .el-input__inner {
            height: 34px;
            line-height: 34px;
            // border-radius: 0;
            // border-bottom: unset;
          }

          .el-input {
            display: inline-block;
            height: 34px;
          }

          .el-input-number {
            width: 250px;
          }

          /deep/ .el-input__inner {
            height: 34px;
            line-height: 34px;
          }

          /deep/ .el-input-number__decrease {
            height: 34px;
          }

          /deep/ .el-input-number__increase {
            height: 34px;
          }

          .el-select {
            width: 100%;
          }
        }

        .increment-form {
          .el-form-item {
            width: 100%;
          }

          .el-form-item__content {
            width: 500px;
          }

          .el-select {
            width: 500px;
          }
        }
      }
    }
  }
</style>
