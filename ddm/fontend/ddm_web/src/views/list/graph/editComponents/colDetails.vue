<template>
    <div id="col-details" v-loading="caculating">
      <!-- <i class="tab-to-expand-btn el-icon-arrow-left" v-show="shrink" @click="toExpand"></i>
      <i class="tab-to-expand-btn el-icon-arrow-right" v-show="!shrink" @click="toShrink"></i> -->
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
        <div class="tab-to-expand-wrapper" @mouseenter="expandActive=true" @mouseleave="expandActive=false">
          <img class="tab-to-expand-btn" :src="expandActive? shrinkActiveImg: shrinkImg" alt="" v-show="shrink" @click="toExpand" />
          <img class="tab-to-expand-btn" :src="expandActive? expandActiveImg: expandImg" alt="" v-show="!shrink" @click="toShrink" />
        </div>
        <el-form class="content-wrapper" ref="form" label-width="82px" :inline="true" size="mini" v-if="allCols[0]">
            <el-form-item label="属性中文名" :required="true" style="margin-right: 34px;">
              <el-autocomplete
                ref="logicalName"
                size="mini"
                v-model="allCols[0].cnName"
                :loading="domainLoading"
                :fetch-suggestions="lodash.debounce(queryDomain, 1000)"
                :trigger-on-focus="false"
                @select="handleOptionSelect($event, allCols[0])"
                @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColChName && !! allCols[0].domainId)"
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
<!--            <div class="translate-wrapper" @click="handleColumnNameTab(allCols[0].cnName)" @mouseenter="translateActive=true" @mouseleave="translateActive=false">
              <span>翻译</span>
              <img :src="translateActive ? translateActiveImg : translateImg" alt="" />
            </div>-->
              <el-form-item :required="true" :label="isDesignModel ? '属性英文名' : '字段名'">
                  <datablau-input
                    @focusout.native="formatColumnName(allCols[0])"
                    ref="colName"
                    @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColName && !! allCols[0].domainId)"
                    v-model.trim="allCols[0].name" placeholder=""  @blur="checkColName(allCols[0].name)"></datablau-input>
              </el-form-item>
            <br>
            <el-form-item :required="true" label="属性数据类型" style="margin-right: 10px;width: 260px;" label-width="100px">
                <el-autocomplete
                      size="mini"
                      clearable
                      ref="colDataType"
                      v-model="allCols[0].dataType"
                      @focus="onFocus"
                      @input="onInput"
                      :fetch-suggestions="queryDataType"
                      :disabled="fk.indexOf(allCols[0].elementId) > -1"
                      @select="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!allCols[0].domainId, $event)"
                      @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!allCols[0].domainId, $event)"
                    >
                      <template slot-scope="{ item }">
                        <div @click.stop v-if="item.type" style="cursor:initial;color:#aaaaaa;margin-left: -4px;">{{item.value}}</div>
                        <span v-else>{{item.value}}</span>
                      </template>
                    </el-autocomplete>
             </el-form-item>
             <el-form-item label="标准数据元中文名" :required="true" label-width="130px" style="width: 290px;">
                <datablau-input
                  size="mini"
                  ref="colDataStandard"
                  :disabled="fk.indexOf(allCols[0].elementId) > -1"
                  @focus="callDomainSelector(allCols[0])"
                  :value="allCols[0].domainName !== '' ? allCols[0].domainName : domainIdToName[allCols[0].domainId]"
                  clearable
                  @clear="clearDomain(allCols[0])"
                ></datablau-input>
             </el-form-item>
             <br>
             <el-form-item label="字段设置"  class="check-container" style="margin-bottom:20px;width: 140px;">
                 <!-- <datablau-checked v-if="pk.indexOf(allCols[0].elementId) > -1"></datablau-checked> -->
                 <el-checkbox v-model="isPK" :disabled="disabledPk.has(allCols[0].elementId)" @change="handlePkSelectionChange">主键</el-checkbox>
             </el-form-item>
              <el-form-item v-if="fk.indexOf(allCols[0].elementId) > -1" class="check-container" style="margin-bottom:20px" :style="fk.indexOf(allCols[0].elementId) > -1 ? '' : 'padding-left:14px'">
                 <!-- <datablau-checked v-if="fk.indexOf(allCols[0].elementId) > -1"></datablau-checked> <span style="font-size:12px">外键</span> -->
                 <el-checkbox v-model="isFK" disabled>外键</el-checkbox>
             </el-form-item>
             <el-form-item label="" class="check-container" style="margin-bottom:20px">
                 <el-checkbox
                 v-if="!isPK"
                  v-model="allCols[0].notNull"
                >非空</el-checkbox>
                <el-checkbox
                 v-else
                 disabled
                  v-model="allCols[0].notNull"
                >非空</el-checkbox>
            </el-form-item>
            <el-form-item v-if="isDesignModel" label="" class="check-container" style="margin-bottom:20px">
                 <el-checkbox
                  v-model="allCols[0].logicalOnly"
                >仅逻辑</el-checkbox>
            </el-form-item>
            <el-form-item v-else label="" class="check-container" style="margin-bottom:20px">
              <el-checkbox
                v-model="allCols[0].physicalOnly"
              >仅物理</el-checkbox>
            </el-form-item>
             <br>
        </el-form>
        <div class="content-box" v-if="allCols[0]">
            <datablau-tabs
                v-model="activeTab"
                class="blue-tabs has-border"
                style="position:relative;top:1px;height:99%"
            >
                <el-tab-pane label="属性" name="properties" class="properties-page">
                    <el-form ref="propertiesForm" label-width="82px" :inline="true" size="mini">
                        <el-form-item label="默认值"  style="margin-right: 80px;">
                            <datablau-input
                                size="mini"
                                v-model="allCols[0].defaultVal"
                            ></datablau-input>
                        </el-form-item>
                        <!-- <el-form-item label="属性英文名" :required="true">
                            <datablau-input
                                size="mini"
                                ref="colEnName"
                                v-model="allCols[0].enName"
                            ></datablau-input>
                        </el-form-item> -->
                        <el-form-item class="def" label="业务定义" :required="true"  style="width:100%">
                            <datablau-input
                                style="width:488px"
                                type="textarea"
                                size="mini"
                                ref="colDefinition"
                                v-model="allCols[0].description"
                                :autosize="{ minRows: 2, maxRows: 2 }"
                                show-word-limit
                                maxlength="500"
                            ></datablau-input>
                        </el-form-item>
                        <div v-if="udpMessageDisplay.size" class="disc">自定义属性</div>
                        <div style="position: absolute;top: 130px;bottom: 20px;left: 0px;right: 0px;overflow-y: auto;overflow-x: hidden">
                          <div :key="key" v-for="key of udpMessageDisplay.keys()">
                            <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 10px;">{{key}}</h2>
                            <udp-setting :tableMsg="rawData.tableMsg" :currentModel="currentModel" :type="80000005" :udp-map="udpMessageDisplay.get(key)" :data-by-type="dataByType" :edit-mode="editMode" :request-body="allCols[0]">
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
                    <el-form-item label="代码编号" style="margin-right: 80px;">
                        <datablau-input
                        size="mini"
                        @focus="callCodeSelector(allCols[0])"
                        :value="allCols[0].dataStandardCode"
                        clearable
                        @clear="clearCode(allCols[0])"
                        disabled-grey
                      ></datablau-input>
                     </el-form-item>
                    <el-form-item label="代码名称">
                        <datablau-input
                        size="mini"
                        @focus="callCodeSelector(allCols[0])"
                        :value="$globalData.domainCodes && $globalData.domainCodes.map.get(allCols[0].dataStandardCode)"
                        clearable
                        @clear="clearCode(allCols[0])"
                        disabled-grey
                      ></datablau-input>
                     </el-form-item>
                     <el-button v-if="false" type="text" size="mini" @click="clearCode" style="position: absolute;top: 0;right: 0;">清除代码</el-button>
                  </el-form>
                     <div class="table-content">
                       <el-table
                         height="100%"
                         class="datablau-table"
                         size="small"
                          :data="codeValuesPage" >
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
                <el-tab-pane label="自增" v-if="this.autoIncrementMap.hasAutoIncrement" name="increment">
                    <datablau-form  ref="incrementForm"  label-width="82px" size="mini" class="increment-form">
                      <el-form-item :class="{disabled: zizengDisabled}" label="是否自增" >
                        <datablau-tooltip content="需要数据类型为整型" :disabled="!zizengDisabled">
                          <datablau-switch
                            v-model="allCols[0].IsAutoIncrement"
                            @change="handleIsAutoIncrementChange" :disabled="zizengDisabled"
                          ></datablau-switch>
                        </datablau-tooltip>
                      </el-form-item>
                      <el-form-item style="display: inline-block" label="起始值" v-if="autoIncrementMap.hasStartingValue">
                        <datablau-input @input="changeValue(allCols[0], 'StartingValue', $event)" :disabled="!allCols[0].IsAutoIncrement" v-model="allCols[0].StartingValue"></datablau-input>
                      </el-form-item>
                      <el-form-item style="display: inline-block" label="步长" v-if="autoIncrementMap.hasRange">
                        <datablau-input @input="changeValue(allCols[0], 'IdentityIncrementBy', $event)" :disabled="!allCols[0].IsAutoIncrement" v-model="allCols[0].IdentityIncrementBy"></datablau-input>
                      </el-form-item>
                      <el-form-item style="display: inline-block" label="最大值" v-if="autoIncrementMap.hasMaxValue">
                        <datablau-input @input="changeValue(allCols[0], 'IdentityMaxValue', $event)" :disabled="!allCols[0].IsAutoIncrement" v-model="allCols[0].IdentityMaxValue"></datablau-input>
                      </el-form-item>
                      <el-form-item style="display: inline-block" label="最小值" v-if="autoIncrementMap.hasMinValue">
                        <datablau-input @input="changeValue(allCols[0], 'IdentityMinValue', $event)" :disabled="!allCols[0].IsAutoIncrement" v-model="allCols[0].IdentityMinValue"></datablau-input>
                      </el-form-item>
                      <el-form-item style="display: inline-block;" label="缓存" v-if="autoIncrementMap.hasCache">
                        <datablau-input @input="changeValue(allCols[0], 'IdentityCacheValue', $event)" :disabled="!allCols[0].IsAutoIncrement" v-model="allCols[0].IdentityCacheValue"></datablau-input>
                      </el-form-item>
                       <el-form-item style="display: inline-block;" label="顺序" v-if="autoIncrementMap.hasOrder">
                        <datablau-select :disabled="!allCols[0].IsAutoIncrement" v-model="allCols[0].IsIdentityOrder"  placeholder="请选择" clearable>
                          <el-option
                            label="是"
                            :value="true">
                          </el-option>
                          <el-option
                            label="否"
                            :value="false">
                          </el-option>
                        </datablau-select>

                      </el-form-item>
                       <el-form-item style="display: inline-block" label="循环" v-if="autoIncrementMap.hasLoop">
                        <datablau-select :disabled="!allCols[0].IsAutoIncrement" v-model="allCols[0].IsIdentityCycle"  placeholder="请选择" clearable>
                          <el-option
                            label="是"
                            :value="true">
                          </el-option>
                          <el-option
                            label="否"
                            :value="false">
                          </el-option>
                        </datablau-select>
                      </el-form-item>
                    </datablau-form>
                </el-tab-pane>
                <el-tab-pane v-if="rawData.tableMsg.TypeId !== 80100073" label="样式" name="style" class="style-page">
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
                        <el-select style="margin-right:5px;width:100px" filterable  size="mini" v-model="style.StyleFontFamily" placeholder="请选择">
                          <el-option :value="item" :key="item" :label="item" v-for="item in fontFamily"></el-option>
                        </el-select>
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
                      </div>
                    <!-- </el-form-item> -->
                    <!-- <el-form-item label="字体" >
                      <el-input style="width: 120px;" v-model="style.StyleFontFamily" size="mini"></el-input>
                    </el-form-item> -->
                    <!-- <el-form-item label="字形" >
                      <el-select style="width: 120px;" size="mini" v-model="style.StyleFontBoldItalic" placeholder="请选择">
                        <el-option :value="item.value" :key="item.value" :label="item.label" v-for="item in fontStyle"></el-option>
                      </el-select>
                    </el-form-item> -->
                    <!-- <el-form-item label="大小" >
                        <el-input-number style="width: 100px;" v-model="style.StyleFontSize" size="mini"></el-input-number>
                    </el-form-item> -->
                     <!-- <el-checkbox style="margin: 6px 5px 0;" size="mini" v-model="style.StyleFontUnderLine">下划线：</el-checkbox>
                    <el-checkbox style="margin-top: 6px;" size="mini" v-model="style.StyleFontLineThrough">删除线：</el-checkbox> -->
                  </el-form>

                </el-tab-pane>
                <template v-for="page of udpMessagePageDisplay.keys()">
                  <el-tab-pane :label="page" :name="page" :key="page">
                    <div style="position: absolute;top: 10px;bottom: 20px;left: 0px;right: 0px;overflow-y: auto;overflow-x: hidden">
                      <div :key="key" v-for="key of udpMessagePageDisplay.get(page).keys()">
                        <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 10px;">{{key}}</h2>
                        <udp-setting :tableMsg="rawData.tableMsg" :currentModel="currentModel" :type="80000005" :udp-map="udpMessagePageDisplay.get(page).get(key)" :data-by-type="dataByType" :edit-mode="editMode" :request-body="allCols[0]">
                        </udp-setting>
                      </div>
                    </div>
                  </el-tab-pane>
                </template>
            </datablau-tabs>
        </div>
        <index-editor
            :deliverNum="deliverNum"
            v-if="indexEditorVisible"
            v-show="false"
            ref="indexEditor"
            :raw-data="rawData"
            :edit-mode="editMode"
            :virtualKey="false"
            @updateIndexMemberList="updateIndexMemberList"
          ></index-editor>
    </div>
</template>
<script>
import $const from '@/resource/const'
import string from '@/resource/utils/string'
import DomainSelector from '@/components/selector/NewDomainSelector'
// import datablauChecked from '@/views/list/tables/datablauChecked.vue'
// import udpValidaterInput from '@/views/list/tables/udpValidaterInput.vue'
import DomainCodeSelector from '@/components/selector/DomainCodeSelector'
import udpSetting from '@/views/list/graph/editComponents/udpSetting.vue'
import autoIncrementMap from './autoIncrementMap.js'
import indexEditor from './indexEditor.vue'
import opacityComponent from './opacityComponent.vue'
import translateImg from '@/assets/images/mxgraphEdit/translate.svg'
import translateActiveImg from '@/assets/images/mxgraphEdit/translate-active.svg'
import shrinkImg from '@/assets/images/mxgraphEdit/shrink.svg'
import shrinkActiveImg from '@/assets/images/mxgraphEdit/shrink-active.svg'
import expandImg from '@/assets/images/mxgraphEdit/expand.svg'
import expandActiveImg from '@/assets/images/mxgraphEdit/expand-active.svg'
import _ from 'lodash'
import $ from 'jquery'
import { v4 as uuidv4 } from 'uuid'

export default {
  components: { DomainSelector, DomainCodeSelector, indexEditor, opacityComponent, udpSetting },
  props: ['rawData', 'currentModel', 'dataByType', 'isLogicalModel', 'getTableHTMLFunction', 'graph', 'Changes', 'diagramId', 'formatThemeTemplateData', 'cellDialogData', 'calculateStartIdToEndIds', 'startIdToEndIds', 'createDeepRelation', 'fontFamily', 'getColumnNameNamingMap', 'formatTextFontSimpleBack', 'isDesignModel', 'LayerEdit', 'deliverNum', 'categoryOrder', 'reNameColumnType'],
  data () {
    let requestBody = {
      // elementId: null,
      name: null,
      cnName: null,
      description: null,
      newCols: [],
      modCols: [],
      newKeyGroups: [],
      delKeyGroups: [],
      allUdps: {},
      currentQueryDomainExists: false
    }
    // if (this.isLogicalModel) {
    //   requestBody.logicalOnly = null
    // } else {
    //   requestBody.physicalOnly = null
    // }
    return {
      disabledPk: new Set(),
      size: 20,
      total: 0,
      current: 1,
      codeValues: [],
      codeValuesPage: [],
      lodash: _,
      caculating: false,
      checkList: [],
      expandActive: false,
      shrinkImg,
      shrinkActiveImg,
      expandImg,
      expandActiveImg,
      translateActive: false,
      translateImg,
      translateActiveImg,
      currentQueryDomain: [],
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
      style: {
        StyleFontFamily: 'Tahoma',
        StyleFontLineThrough: false,
        StyleFontSize: 9,
        StyleFontUnderLine: false,
        StyleTextColor: 'rgba(0, 0, 0, 1)',
        StyleBackColor: 'rgba(255, 255, 255, 1)',
        StyleFontBoldItalic: ''
      },
      defaultStyle: {
        StyleFontFamily: 'Tahoma',
        StyleFontLineThrough: false,
        StyleFontSize: 9,
        StyleFontUnderLine: false,
        StyleTextColor: 'rgba(255, 255, 255, 1)',
        StyleBackColor: 'rgba(255, 255, 255, 1)',
        StyleFontBoldItalic: ''
      },
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
      } ],
      currentStyle: null,
      currentTableDiagram: null,
      isPK: false,
      isFK: true,
      indexEditorVisible: false,
      editMode: true,
      shrink: true,
      domainLoading: false
    }
  },
  beforeMount () {
    this.autoIncrementMap = autoIncrementMap[this.dataByType.model.TypeUniqueId.toUpperCase()] || {}
    if (this.autoIncrementMap === undefined) {
      let errMsg = `autoIncrementMap 不存在id为 ${this.dataByType.model.TypeUniqueId.toUpperCase()} 的对象`
      this.$showFailure(errMsg)
      console.error(errMsg)
    }
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
    changeValue (item, key, value) {
      let valueInt = parseInt(value)
      if (isNaN(value) || parseFloat(value).toString().includes('.') || value.toString().includes('.')) {
        this.$datablauMessage.warning('必须大于等于0的整数')
        item[key] = isNaN(valueInt) ? undefined : valueInt
      } else if (valueInt < 0) {
        this.$datablauMessage.warning('必须大于等于0的整数')
        item[key] = 0
      }
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
            console.log(this.$refs)
            this.$refs.colName.focus()
          }
        }).catch(err => {
          this.$showFailure(err)
        })
      }
    },
    checkColName (name) {
      if (this.checkColIsDuplicate(name)) {
        this.$confirm(`${this.isDesignModel ? '属性名' : '字段名'}不能重名`, '提示', {
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
        this.$confirm(`${this.isDesignModel ? '属性名' : '字段名'}不能为空`, '提示', {
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
      return this.dataByType.table[this.rawData.tableMsg.Id].children.some(v => !v.properties.deleted && v.properties.Name === name && v.properties.Id !== this.rawData.colId)
    },
    checkColLogicalIsDuplicate (name) {
      return this.dataByType.table[this.rawData.tableMsg.Id].children.some(v => !v.properties.deleted && v.properties.LogicalName === name && v.properties.Id !== this.rawData.colId)
    },
    toExpand () {
      this.shrink = false
      this.$emit('changeDialogWidth', `${$('#model-edit').width() - $('.left-panel-wrapper.tree-area').width() - 44}px`)
    },
    toShrink () {
      this.shrink = true
      this.$emit('changeDialogWidth', '600px')
    },
    deepDeliver (table, changes, change, noIndexModifed, deliverColumnIds) {
      this.$bus.$emit('clearPathIds')
      try {
        this.calculateStartIdToEndIds()
        setTimeout(() => {
          let endIds = this.startIdToEndIds[table.properties.Id]
          let target = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === table.properties.Id)
          this.createDeepRelation(endIds, target, changes, change.obj.preTable, noIndexModifed, deliverColumnIds)
        })
      } catch (e) {
        console.log(e)
      }
    },
    editIndex () {
      if (this.indexEditorVisible) {
        this.$refs.indexEditor.prepareTableData()
      }
      this.indexEditorVisible = true
      // this.$nextTick(() => {
      //   this.$refs.indexEditor.editMode = this.editMode
      // })
    },
    async handlePkSelectionChange (val) {
      // if (this.caculating && this.caculatingTimer) {
      //   return
      // }
      // this.caculating = true
      // this.caculatingTimer = setTimeout(() => {
      //   this.caculating = false
      //   this.caculatingTimer = null
      // }, 400)
      // let pk = []
      this.allCols.forEach((item, index) => {
        let currentColIndex = this.pk.indexOf(item.elementId)
        if (this.isPK && currentColIndex === -1) {
          this.pk.push(item.elementId)
          this.$set(item, 'notNull', true)
          // item.notNull = true
        }
        if (!this.isPK && currentColIndex > -1) {
          this.pk.splice(currentColIndex, 1)
        }
        // else {
        //   this.$set(item, 'notNull', false)
        // }
      })
      // this.pk = pk
      const index = this.$refs.indexEditor.indexS
      let primaryKey = index.find(item => item.properties.KeyGroupType === 'PrimaryKey' && !item.properties.deleted)
      if (primaryKey && primaryKey.children && !val) {
        primaryKey.children = primaryKey.children.filter(member => member.properties.AttributeRef !== this.allCols[0].Id)
        // member.properties.deleted = !val
      }
      if (primaryKey) {
        if (!primaryKey.children) {
          primaryKey.children = []
        }
        let children = []
        this.pk.forEach(columnId => {
          let member = primaryKey.children.find(member => member.properties.AttributeRef === columnId)
          if (member) {
            children.push(member)
          } else {
            children.push({
              objectClass: 'Datablau.LDM.EntityKeyGroupMember',
              properties: {
                AttributeRef: columnId,
                Id: this.deliverNum.seed++,
                OrderType: 'Ascending',
                UniqueId: uuidv4(),
                TypeId: 80500001,
                Name: 'KeyGroupMember',
                new: true
              }
            })
          }
        })
        primaryKey.children = children
        primaryKey.properties.KeyGroupMemberRefs = children.map(column => column.properties.Id)
      } else {
        let keyId = 1
        if (index && index.length) {
          let name = index[index.length - 1].properties.Name
          keyId = parseInt(name.slice(name.search(/\d+$/)))
        }
        let children = this.pk.map(columnId => ({
          objectClass: 'Datablau.LDM.EntityKeyGroupMember',
          properties: {
            AttributeRef: columnId,
            Id: this.deliverNum.seed++,
            OrderType: 'Ascending',
            UniqueId: uuidv4(),
            TypeId: 80500001,
            Name: 'KeyGroupMember',
            new: true
          }
        }))
        index.push({
          children,
          objectClass: 'Datablau.LDM.EntityKeyGroup',
          properties: {
            Id: this.deliverNum.seed++,
            KeyGroupMemberRefs: children.map(i => i.properties.Id),
            KeyGroupType: 'PrimaryKey',
            Macro: this.dataByType.namingOption.PKDefaultMacro,
            Name: this.dataByType.namingOption.PKDefaultMacro.replace(/%owner%/, this.rawData.tableMsg.Name).replace(/%keyid%/, '' + (keyId++)),
            RawType: 'KeyGroup',
            TypeId: 80000093,
            UniqueId: uuidv4(),
            new: true
          }
        })
      }
      // 点击主键提交一条保存记录，因为主键member会删除无法恢复
      // let changes = await this.save()
      // let data = new (this.LayerEdit)(changes)
      // if (changes && changes.length) {
      //   this.dataByType.table[this.rawData.tableMsg.Id].properties.changed = true
      //   this.graph.editor.undoManager.undoableEditHappened(data)
      //   this.$parent.$parent.afterHandleColDialogData(this.rawData.tableMsg.Id, this.allCols[0].elementId, false)
      // }
    },
    updateIndexMemberList (columnId, memberList) {
      for (let name of ['pk', 'fk', 'uk', 'nk', 'vk']) {
        let column = this.rawData[name].find(column => column.properties.Id === columnId)
        if (column) {
          column.children = memberList
          column.properties.KeyGroupMemberRefs = memberList.map(column => column.properties.Id)
          break
        }
      }
      this.getPkColumnIds()
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
            // StyleFontBoldItalic: style.AttributeTextFontBoldItalic,
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
        return `ARGBColor:${(parseFloat(arr[3].slice(1, -1)) * 255).toFixed(0)}:${arr[0].slice(5)}:${arr[1].slice(1)}:${arr[2].slice(1)}`
      }
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
      //   this.prepareTableUdps(this.requestBody)
      this.columnsUdpKeys = this.prepareColumnUdps(this.requestBody).udpMessage
      //   this.calculateYOfBottom()
      this.getPkColumnIds()
      this.prepareRequestBody()
      this.getCurrentStyle()
      setTimeout(() => {
        this.editIndex()
        this.caculateSubtypeRelatedForeinKey(this.rawData.fk)
      })
    },
    caculateSubtypeRelatedForeinKey (fkArr) {
      this.disabledPk = new Set()
      fkArr.forEach(keygroup => {
        let fkId = keygroup.properties.Id
        let subtypeRelation = Object.values(this.dataByType.relation).find(relation => !relation.properties.deleted && relation.properties.ChildKeyRef === fkId && relation.objectClass === 'Datablau.LDM.RelationshipSubtype')
        if (subtypeRelation) {
          keygroup.children?.forEach(member => {
            this.disabledPk.add(member.properties.AttributeRef)
          })
        }
      })
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
      this.isPK = false
      Array.isArray(this.rawData.pk) && this.rawData.pk.forEach(p => {
        Array.isArray(p.children) && p.children.forEach(k => {
          this.pk.push(k.properties['AttributeRef'])
          if (k.properties['AttributeRef'] === this.rawData.colId) {
            this.isPK = true
          }
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
          IsAutoIncrement: item.properties.IsAutoIncrement,
          StartingValue: item.properties.StartingValue,
          IdentityIncrementBy: item.properties.IdentityIncrementBy,
          IdentityMaxValue: item.properties.IdentityMaxValue,
          IdentityMinValue: item.properties.IdentityMinValue,
          IdentityCacheValue: item.properties.IdentityCacheValue,
          IsIdentityOrder: item.properties.IsIdentityOrder,
          IsIdentityCycle: item.properties.IsIdentityCycle
        }
        if (this.pk.indexOf(body.elementId) > -1) {
          this.isPK = true
          body.notNull = true
        }
        if (this.isDesignModel) {
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
      // if (!allDomains) {
      //   clearTimeout(this.timer)
      //   this.timer = setTimeout(() => {
      //     this.queryDomain(queryString, cb)
      //   }, 500)
      //   return
      // }
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
    clearLimitedDomain (bool, val) {
      if (bool) {
        this.clearDomain(this.allCols[0])
      }
      // if (val.value === 'INT' || val.value === 'BIGINT' || val.value === 'INTEGER' || val.value === 'BIT' || val.value === 'SMALLINT') {
      //
      // } else {
      //   this.allCols[0].IsAutoIncrement = false
      // }
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
      if (domain.referenceCode) {
        this.$set(row, 'dataStandardCode', domain.referenceCode)
      }
      // row.dataStandardCode = domain.referenceCode
      let { inheritType } = domain
      if (inheritType.includes('description')) {
        row['description'] = domain['description']
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
      if (this.checkColIsDuplicate(this.allCols[0].name)) {
        this.$confirm(`${this.isDesignModel ? '属性名' : '字段名'}字段不能重名`, '提示', {
          type: 'warning',
          closeOnClickModal: false
        })
          .then(() => {
            this.$refs['colName'].focus()
          })
          .catch(() => {
            this.$refs['colName'].focus()
          })
        return
      }
      if (this.isDesignModel && this.allCols[0].cnName) {
        if (this.checkColLogicalIsDuplicate(this.allCols[0].cnName)) {
          this.$confirm('属性中文名不能重名', '提示', {
            type: 'warning',
            closeOnClickModal: false
          })
            .then(() => {
              this.$refs['logicalName'].focus()
            })
            .catch(() => {
              this.$refs['logicalName'].focus()
            })
          return
        }
      }
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
      if (!this.allCols[0].domainName) {
        this.$confirm(`标准数据元中文名不能为空`, '提示', {
          type: 'warning',
          closeOnClickModal: false
        })
          .then(() => {
            this.$refs['colDataStandard'].focus()
          })
          .catch(() => {
            this.$refs['colDataStandard'].focus()
          })
        return
      }
      if (!this.allCols[0].cnName) {
        this.$confirm(`属性中文名不能为空`, '提示', {
          type: 'warning',
          closeOnClickModal: false
        })
          .then(() => {
            this.$refs['logicalName'].focus()
          })
          .catch(() => {
            this.$refs['logicalName'].focus()
          })
        return
      }
      // if (!this.allCols[0].enName) {
      //   this.$confirm(`属性英文名不能为空`, '提示', {
      //     type: 'warning',
      //     closeOnClickModal: false
      //   })
      //     .then(() => {
      //       this.$refs['colEnName'].focus()
      //     })
      //     .catch(() => {
      //       this.$refs['colEnName'].focus()
      //     })
      //   return
      // }
      if (!this.allCols[0].description) {
        this.$confirm(`业务定义不能为空`, '提示', {
          type: 'warning',
          closeOnClickModal: false
        })
          .then(() => {
            this.$refs['colDefinition'].focus()
          })
          .catch(() => {
            this.$refs['colDefinition'].focus()
          })
        return
      }
      let changes = []
      let entityId = this.rawData.tableMsg.Id
      let tableData = this.dataByType.table[entityId]
      let styleChanged = false
      this.requestBody.modCols = []
      if (JSON.stringify(this.allColsInitial[0]) !== JSON.stringify(this.allCols[0])) {
        this.allCols[0].changed = true
        this.requestBody.modCols = _.cloneDeep(this.allCols)
      }
      let { parentKeyRefs, columnIds } = this.caculateDeliverParentKeyRef(tableData)
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
        IsAutoIncrement: item.IsAutoIncrement,
        StartingValue: item.StartingValue,
        IdentityIncrementBy: item.IdentityIncrementBy,
        IdentityMaxValue: item.IdentityMaxValue,
        IdentityMinValue: item.IdentityMinValue,
        IdentityCacheValue: item.IdentityCacheValue,
        IsIdentityOrder: item.IsIdentityOrder,
        IsIdentityCycle: item.IsIdentityCycle
      })).forEach(item => {
        let index = this.dataByType.table[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityAttribute' && column.properties.Id === item.Id)
        if (index !== -1) {
          let change = new (this.Changes)('modifyColumn', {
            pId: entityId,
            pName: tableData.properties.Name,
            id: item.Id,
            name: item.Name,
            pre: _.cloneDeep(this.dataByType.table[entityId].children[index]),
            preTable: _.cloneDeep(this.dataByType.table[entityId]),
            now: null
          })
          _.merge(this.dataByType.table[entityId].children[index].properties, item)
          change.obj.now = _.cloneDeep(this.dataByType.table[entityId].children[index])
          changes.push(change)
          let primaryKey = this.dataByType.table[entityId].children.find(column => column.properties.KeyGroupType === 'PrimaryKey')
          // if (primaryKey && primaryKey.children && primaryKey.children.find(member => member.properties.AttributeRef === item.Id)) {
          if (columnIds.includes(item.Id)) {
            let table = this.dataByType.table[entityId]
            this.$bus.$emit('clearPathIds')
            try {
              this.calculateStartIdToEndIds()
              setTimeout(() => {
                let endIds = this.startIdToEndIds[table.properties.Id]
                let target = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === table.properties.Id)
                this.createDeepRelation(endIds, target, changes, change.obj.preTable, true, [item.Id]) // true表明不需要修改索引，只是修改字段信息传递
              })
            } catch (e) {
              console.log(e)
            }
          }
        }
      })
      if (this.$refs.indexEditor) {
        this.$refs.indexEditor.temporarySave()
        this.requestBody.newKeyGroups = this.$refs.indexEditor.newKeyGroups
        this.requestBody.modKeyGroups = this.$refs.indexEditor.modKeyGroups
        this.requestBody.delKeyGroups = this.$refs.indexEditor.delKeyGroups
        for (let item of this.requestBody.modKeyGroups) {
          item.properties.changed = true
          let index = this.dataByType.table[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === item.properties.Id)
          if (index !== -1) {
            let change = new (this.Changes)('modifyIndex', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              pre: _.cloneDeep(this.dataByType.table[entityId].children[index]),
              preTable: _.cloneDeep(this.dataByType.table[entityId]),
              now: null
            })
            this.dataByType.table[entityId].children[index] = item
            let table = this.dataByType.table[entityId]
            setTimeout(() => {
              if (item.properties.KeyGroupType === 'PrimaryKey') {
                this.changeUpRelationType(table, item, changes, change.obj.pre)
              }
            }, 200)
            if (parentKeyRefs.includes(item.properties.Id)) {
              let deliverColumnIds = this.caculateDeliverColumnIds(change.obj.pre, item)
              this.deepDeliver(table, changes, change, true, deliverColumnIds) // 传递
            }

            change.obj.now = _.cloneDeep(item)
            changes.push(change)
          }
        }
        this.requestBody.newKeyGroups.forEach(item => {
          if (!item.properties.deleted) {
            let change = new (this.Changes)('insertIndex', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.Id,
              name: item.properties.Name,
              now: null,
              preTable: _.cloneDeep(this.dataByType.table[entityId])
            })
            if (this.dataByType.table[entityId].children) {
              this.dataByType.table[entityId].children.push(item)
            } else {
              this.dataByType.table[entityId].children = [item]
            }
            change.obj.now = this.dataByType.table[entityId].children[this.dataByType.table[entityId].children.length - 1]
            changes.push(change)
            let table = this.dataByType.table[entityId]
            setTimeout(() => {
              if (item.properties.KeyGroupType === 'PrimaryKey') {
                this.changeUpRelationType(table, item, changes)
              }
            }, 200)
            if (parentKeyRefs.includes(item.properties.Id)) {
              this.deepDeliver(table, changes, change, true)
            }
          }
        })

        this.requestBody.delKeyGroups.forEach(item => {
          let index = this.dataByType.table[entityId].children.findIndex(column => column.objectClass === 'Datablau.LDM.EntityKeyGroup' && column.properties.Id === item.properties.Id)
          if (index !== -1) {
            let change = new (this.Changes)('deleteIndex', {
              pId: entityId,
              pName: tableData.properties.Name,
              id: item.properties.Id,
              name: item.properties.Name,
              pre: _.cloneDeep(this.dataByType.table[entityId].children[index]),
              preTable: _.cloneDeep(this.dataByType.table[entityId])
            })
            this.$set(this.dataByType.table[entityId].children[index].properties, 'deleted', true)
            changes.push(change)
            let table = this.dataByType.table[entityId]
            setTimeout(() => {
              if (item.properties.KeyGroupType === 'PrimaryKey') {
                this.changeUpRelationType(table, item, changes, change.obj.pre)
              }
            }, 200)
            if (parentKeyRefs.includes(item.properties.Id)) {
              this.deepDeliver(table, changes, change, true)
            }
          }
        })
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
      // let changed = this.requestBody.modCols.length > 0
      if (changes.length > 0) {
        let cell = this.graph.graph.getDefaultParent().children.find(cell => cell.OwneeRef === entityId)
        if (cell) {
          cell.value = await this.getTableHTMLFunction(cell.OwneeRef, this.graph.graph, null, null, true)
          if (styleChanged) {
            cell.changed = true
            cell.StyleThemeRef = this.currentTableDiagram.properties['StyleThemeRef']
            cell.StyleBackColor = this.currentTableDiagram.properties['StyleBackColor']
          }
          this.graph.graph.getView().refresh()
        }
      }
      return changes
    },
    caculateDeliverColumnIds (preKeyGroup, nowKeyGroup) {
      let preColumnIds = preKeyGroup?.children?.map(member => member.properties.AttributeRef) || []
      let newColumnIds = nowKeyGroup?.children?.map(member => member.properties.AttributeRef) || []
      let resColumnIds = []
      preColumnIds.forEach(columnId => {
        if (!newColumnIds.includes(columnId)) {
          resColumnIds.push(columnId)
        }
      })
      newColumnIds.forEach(columnId => {
        if (!preColumnIds.includes(columnId)) {
          resColumnIds.push(columnId)
        }
      })
      return resColumnIds
    },
    caculateDeliverParentKeyRef (table) {
      let relations = Object.values(this.dataByType.relation).filter(relation => !relation.properties.deleted && (relation.properties.RelationalType === 'Identifying' || relation.properties.RelationalType === 'NonIdentifying') && relation.properties.ParentEntityRef === table.properties.Id)
      let parentKeyRefs = relations?.map(relation => relation.properties.ParentKeyRef)
      let keyGroup = table?.children?.filter(column => parentKeyRefs?.includes(column.properties.Id))
      let columnIds = table?.children?.filter(column => keyGroup?.reduce((pre, cur) => pre.concat(cur.children?.map(m => m.properties.AttributeRef)), []).includes(column.properties.Id)).map(column => column.properties.Id)
      return {
        parentKeyRefs: parentKeyRefs || [],
        columnIds: columnIds || []
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
        let primaryKeyMapColumns = targetPrimaryKey.properties.deleted ? [] : targetPrimaryKey?.children.map(member => member.properties.AttributeRef)
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
    zizengDisabled () {
      let res = !(this.autoIncrementMap.hasAutoIncrement && this.allCols && (
        this.allCols[0].dataType.toUpperCase().indexOf('INT') === 0 ||
        this.allCols[0].dataType.toUpperCase().indexOf('BIGINT') === 0 ||
        this.allCols[0].dataType.toUpperCase().indexOf('TINYINT') === 0 ||
        this.allCols[0].dataType.toUpperCase().indexOf('SMALLINT') === 0 ||
        this.allCols[0].dataType.toUpperCase().indexOf('MEDIUMINT') === 0
        // this.allCols[0].dataType.toUpperCase().indexOf('BIT') === 0
      ))
      if (res) {
        this.resetIncrementForm()
      }
      return res
    },
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
      if (this.allCols[0].dataType.toLowerCase().indexOf('int') === -1 && this.allCols[0].dataType.toLowerCase().indexOf('bit') === -1) {
        this.resetIncrementForm()
      }
      return this.allCols[0].dataType.toLowerCase().indexOf('int') === -1 && this.allCols[0].dataType.toLowerCase().indexOf('bit') === -1
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-form.db-form .datablau-select {
    width: auto;
  }
  .el-autocomplete:hover /deep/ .el-input__inner {
    border-color: #409EFF;
  }
#col-details {
  padding: 0 20px 15px;
  margin-left: 0;
  overflow-x: hidden;
  overflow-y: auto;
  position: absolute;
  top: 40px;
  left: 0;
  bottom: 0;
  right: 0px;

  /deep/ {
    .udp-form .el-form-item__content {
      width: 200px;
    }

    .el-form-item__content {
      width: 158px;

      .datablau-input {
        width: 100%;
      }
    }
  }

  .tab-to-expand-wrapper {
    user-select: none;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);

    img {
      height: 90px;
    }
  }
  .tab-to-expand-btn {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    &:hover {
      color: #409EFF;
    }
    cursor: pointer;
  }
  .required::before {
    content: '*';
    color: #e86666;
    font-size: 13px;
}
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
  /deep/ .el-tabs__item {
    font-size: 12px;
    color: #555;
    &.is-active {
      color: #409EFF;
    }
  }
  /deep/ .el-tabs {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .el-form-item--mini.el-form-item {
    margin-bottom: 10px;
  }
  .translate-wrapper {
    cursor: pointer;
    top: 4px;
    margin-right: 8px;
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
        top: 120px;
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
      position: relative;
      height: 42px;
    }
    .middle-y {
      display: inline-block;
      vertical-align: middle;
    }
}
  #col-details {
    .disabled /deep/ .el-form-item__label {
      color: #777!important;
    }
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
    .content-wrapper {
      /deep/ {
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
