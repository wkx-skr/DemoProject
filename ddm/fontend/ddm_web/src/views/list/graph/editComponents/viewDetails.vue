<template>
  <div
  id="table-details"
    class="container overflow avoid-citic"
    v-loading="buttonLoading"
    element-loading-text="正在处理数据,请稍候"
  >
    <domain-code-selector
      ref="domainCodeSelector"
      @selected="handleCodeSelected"
    ></domain-code-selector>
    <domain-selector
      :limitedDsApply="currentModel.limitedDsApply"
      :limitedDsApplyConfig="currentModel.limitedDsApplyConfig"
      ref="domainSelector"
      @selected="handleDomainSelector"
    ></domain-selector>
    <check-in-version
      :dialog-visible="checkInVersionDialogVisible"
      @close="checkInVersionDialogVisible=false"
      @save="saveInViewEditor"
    ></check-in-version>
    <datablau-button
      v-if="writable && !editMode"
      @click="goToEdit"
      size="small"
      type="important"
      style="position:absolute;right:30px;top:34px;">
      <i class="iconfont icon-bianji" style="margin-right:5px;font-size:14px"></i>
      编辑
    </datablau-button>
    <div v-if="!rawData.appendMode && !editMode" class="new-title-box">
      <div class="header clearfixed">
        <img width="40" :src="rawData.tableMsg && rawData.tableMsg.TypeId === 80500008 ? viewUsedImg : tableImg" alt="">
        <div class="text-box" :class="{'text-box2':typeDataWareHouse}">
          <h3>{{rawData.tableMsg.Name}}</h3>
          <p>中文名称：{{rawData.tableMsg.LogicalName}}</p>
        </div>
      </div>
    </div>
    <div v-if="editorType === 'model'" class="tab-to-expand-wrapper" @mouseenter="expandActive=true" @mouseleave="expandActive=false">
      <img class="tab-to-expand-btn" :src="expandActive? shrinkActiveImg: shrinkImg" alt="" v-show="shrink" @click="toExpand" />
      <img class="tab-to-expand-btn" :src="expandActive? expandActiveImg: expandImg" alt="" v-show="!shrink" @click="toShrink" />
    </div>
    <div v-if="editMode" class="header-wrapper">
      <h2><img style="margin-right: 5px;vertical-align: middle;" :src="rawData.tableMsg && rawData.tableMsg.TypeId === 80500008 ? viewUsedImg : tableImg" width="18" />视图：{{requestBody.name}}</h2>
    </div>
    <div v-if="editMode" class="top-area">
      <div class="property" style="margin-right: 24px;">
        <span class="label">中文名称</span>
        <span v-if="!editMode" class="value">{{rawData.tableMsg.LogicalName}}</span>
        <span v-else class="value">
          <datablau-input
            v-model="requestBody.cnName"
            size="mini"
            @focusout.native="handleTableCNNameTab(requestBody.cnName, true)"
            style=""></datablau-input>
        </span>
      </div>
      <div class="translate-wrapper" @click="handleTableCNNameTab(requestBody.cnName)" @mouseenter="translateActive=true" @mouseleave="translateActive=false">
        <span>翻译</span>
        <img :src="translateActive ? translateActiveImg : translateImg" alt="" />
      </div>
      <div class="property">
        <span class="label" :class="{required:editMode}">视图名</span>
        <span v-if="!editMode" class="value">{{rawData.tableMsg.Name}}</span>
        <span v-else class="value">
            <el-form @submit.native.prevent ref="tableNameRef" :model="requestBody" size="mini" :rules="rules">
              <el-form-item style="height:28px;" prop="tableName">
                <datablau-input
                  @blur="formatViewName"
                  size="mini"
                  v-model="requestBody.name"
                ></datablau-input>
              </el-form-item>
            </el-form>
          </span>
      </div>
    </div>
    <div :class="{'content-box': true,'is-edit': editMode, 'editor-type-table': editorType === 'table', 'editor-type-model': editorType === 'model'}">
      <datablau-tabs
        v-model="activeTab"
        class="blue-tabs has-border"
        style="position:relative;top:1px;height:100%"
      >
        <el-tab-pane label="字段" name="column">
          <div style="display:inline-block;margin-top: 10px;">
            <datablau-button size="mini" :disabled="!(isFocusArea || isFocusOnly)" @click="translateCurrent">
              翻译当前
            </datablau-button>
            <datablau-button size="mini" @click="translateAll">
              翻译全部
            </datablau-button>
          </div>
          <datablau-button
            :dblClickTimeout="0"
            v-show="editMode"
            type="text"
            @click="addColumn"
            style="margin-left: 6px;"
          >
            <i style="font-size:14px" class="el-icon-circle-plus-outline"></i>
            添加新字段
          </datablau-button>
          <div :class="{'table-box1':editMode,'table-box2':!editMode}">
            <datablau-table
              class="datablau-table thin"
              v-if="allCols && shrink && editorType === 'model'"
              :data="allCols"
              :key="tableKey"
              height="100%"
              ref="tableDetailList"
              @cell-mouse-enter="handleCellMouseEnter"
              @cell-mouse-leave="handleCellMouseLeave"
              @keyup.native="onKeyPress"
              :row-class-name="tableRowClassName"
              :border="editMode"
              header-row-class-name="table-header-class"
              @mousedown.native="handleTableMouseDown"
              @mouseup.native="handleTableMouseUp"
              :cell-class-name="tableCellClassName"
              @paste.native="handleTablePaste"
              @copy.native="handleTableCopy"
              @focusin.native="handleFocusIn"
              @focusout.native="handleFocusOut"
              :cell-style="{height: '30px'}"
            >
              <el-table-column v-if="!editMode" fixed label="" width="50">
                <template slot-scope="scope">{{scope.$index+1}}</template>
              </el-table-column>
              <el-table-column
                fixed
                label="中文名"
                prop="cnName"
                :width="188"
                :show-overflow-tooltip="!editMode"
              >
                <!--<template slot="header">
                  <span>中文名</span>
                  <div style="float: right" class="translate-wrapper" @click="translateAll" @mouseenter="translateActive2=true" @mouseleave="translateActive2=false">
                    <span>翻译</span>
                    <img key="2" :src="translateActive2 ? translateActiveImg : translateImg" alt="" />
                  </div>
                </template>-->
                <template slot-scope="scope">
                  <span v-if="!editMode">{{scope.row.cnName}}</span>
                  <el-autocomplete
                    :rowindex="scope.$index"
                    :class="caculateBorderClass(scope)"
                    :readonly="isFocusArea"
                    style="width:100%"
                    v-else
                    size="mini"
                    :loading="domainLoading"
                    v-model="allCols[scope.$index].cnName"
                    :fetch-suggestions="lodash.debounce(queryDomain, 1000)"
                    :trigger-on-focus="false"
                    @select="handleOptionSelect($event, scope.row)"
                    @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColChName && !!scope.row.domainId, scope)"
                    @focusout.native="handleCNNameTab(scope)"
                  >
                    <template slot-scope="{ item }">
                      <domain-popover :item="item"></domain-popover>
                    </template>
                  </el-autocomplete>
                </template>
              </el-table-column>
              <el-table-column
                fixed
                :label="$version.scan.dialog.name"
                prop="name"
                :width="120"
                :show-overflow-tooltip="!editMode"
              >
                <template slot="header" slot-scope="scope">
                  <span v-if="editMode" :data="scope.$index" class="table-label required">{{$version.scan.dialog.name}}</span>
                  <span v-else class="table-label">{{$version.scan.dialog.name}}</span>
                </template>
                <template slot-scope="scope">
                  <span v-if="!editMode">{{scope.row.name}}</span>
                  <el-form
                    @submit.native.prevent
                    v-else
                    :model="allCols[scope.$index]"
                    :key="allCols.elementId"
                    :ref='`name-form${scope.$index}-shrink`'
                    size="mini">
                    <el-form-item
                      class="input-content-box"
                      style="margin-bottom:1px;"
                      prop="name"
                      :rules="rules.columnName"
                    >
                      <el-input
                        :class="caculateBorderClass(scope)"
                        :readonly="isFocusArea"
                        size="mini"
                        :ref="`colName${scope.$index}`"
                        @keydown.native="updateColumnsMapOfIndexEditor(allCols[scope.$index])"
                        @blur="formatColumnName(scope.row)"
                        v-model="allCols[scope.$index].name"
                        @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColName && !!scope.row.domainId, scope)"
                      ></el-input>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column
                fixed
                :label="`字段类型`"
                prop="dataType"
                class-name="data-type"
                :show-overflow-tooltip="!editMode"
              >
                <template slot="header">
                  <span class="table-label" :class="{required:editMode}">{{$version.scan.dialog.type}}</span>
                </template>
                <template slot-scope="scope">
                  <span v-if="!editMode">{{scope.row.dataType}}</span>
                  <el-form
                    @submit.native.prevent
                    v-else
                    size="mini"
                    :rules="rules"
                    :model="allCols[scope.$index]"
                    :ref='`type-form${scope.$index}-shrink`'>
                    <el-form-item
                      style="height:29px;margin-bottom:1px;"
                      :prop="'dataType'"
                      :rules="rules.dataType"
                    >
                      <el-autocomplete
                        :class="caculateBorderClass(scope)"
                        :readonly="isFocusArea"
                        size="mini"
                        @focus="onFocus(scope.$index)"
                        @input="onInput"
                        @select="(val) => {onSelect(val),clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!scope.row.domainId, scope)}"
                        :clearable="false"
                        v-model="allCols[scope.$index].dataType"
                        :fetch-suggestions="queryDataType"
                        @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!scope.row.domainId, scope)"
                      >
                        <template slot-scope="{ item }">
                          <div @click.stop v-if="item.type" style="cursor:initial;color:#aaaaaa;margin-left: -4px;">{{item.value}}</div>
                          <span v-else>{{item.value}}</span>
                        </template>
                      </el-autocomplete>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                :width="120"
                v-if="editMode"
              >
                <template slot-scope="scope">
                  <div class="operator-wrapper">
                    <datablau-button type="icon" @click="editRow(scope.row)" class="iconfont icon-bianji"></datablau-button>
                    <datablau-button type="icon" style="font-size:14px" class="iconfont icon-delete" @click="deleteRow(scope.row, scope.$index)"></datablau-button>
                    <datablau-button type="icon" style="font-size:14px" size="mini" @click.stop="up(scope.$index)" :disabled="scope.$index===0" class="iconfont icon-up"></datablau-button>
                    <datablau-button type="icon" style="font-size:14px" size="mini" @click.stop="down(scope.$index)" :disabled="scope.$index===allCols.length-1" class="iconfont icon-down"></datablau-button>
                  </div>
                </template>
              </el-table-column>
            </datablau-table>
            <el-table
              class="datablau-table thin"
              v-if="allCols && (!shrink || editorType === 'table')"
              :data="allCols"
              :key="tableKey + 100000000"
              height="95%"
              ref="tableDetailList"
              @cell-mouse-enter="handleCellMouseEnter"
              @cell-mouse-leave="handleCellMouseLeave"
              @keyup.native="onKeyPress"
              :row-class-name="tableRowClassName"
              :border="editMode"
              header-row-class-name="table-header-class"
              @mousedown.native="handleTableMouseDown"
              @mouseup.native="handleTableMouseUp"
              :cell-class-name="tableCellClassName"
              @paste.native="handleTablePaste"
              @copy.native="handleTableCopy"
              @focusin.native="handleFocusIn"
              @focusout.native="handleFocusOut"
              :cell-style="{height: '30px'}"
            >
              <el-table-column v-if="!editMode" fixed label="" width="50">
                <template slot-scope="scope">{{scope.$index+1}}</template>
              </el-table-column>
            <el-table-column
              fixed
              label="中文名"
              prop="cnName"
              :width="188"
              :show-overflow-tooltip="!editMode"
            >
              <template slot-scope="scope">
                <span v-if="!editMode">{{scope.row.cnName}}</span>
                <el-autocomplete
                  :rowindex="scope.$index"
                  :class="caculateBorderClass(scope)"
                  :readonly="isFocusArea"
                  style="width:100%"
                  v-else
                  size="mini"
                  :loading="domainLoading"
                  v-model="allCols[scope.$index].cnName"
                  :fetch-suggestions="lodash.debounce(queryDomain, 1000)"
                  :trigger-on-focus="false"
                  @select="handleOptionSelect($event, scope.row)"
                  @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColChName && !!scope.row.domainId, scope)"
                >
                  <template slot-scope="{ item }">
                    <domain-popover :item="item"></domain-popover>
                  </template>
                </el-autocomplete>
              </template>
            </el-table-column>
            <el-table-column
              fixed
              :label="$version.scan.dialog.name"
              prop="name"
              :width="170"
              :show-overflow-tooltip="!editMode"
            >
              <template slot="header" slot-scope="scope">
                <span v-if="editMode" :data="scope.$index" class="table-label required">{{$version.scan.dialog.name}}</span>
                <span v-else class="table-label">{{$version.scan.dialog.name}}</span>
              </template>
              <template slot-scope="scope">
                <span v-if="!editMode">{{scope.row.name}}</span>
                <el-form
                  @submit.native.prevent
                  v-else
                  :model="allCols[scope.$index]"
                  :key="allCols.elementId"
                  :ref='`name-form${scope.$index}`'
                  size="mini">
                  <el-form-item
                    class="input-content-box"
                    style="margin-bottom:1px;"
                    prop="name"
                    :rules="rules.columnName"
                  >
                    <el-input
                      :class="caculateBorderClass(scope)"
                      :readonly="isFocusArea"
                      size="mini"
                      :ref="`colName${scope.$index}`"
                      @keydown.native="updateColumnsMapOfIndexEditor(allCols[scope.$index])"
                      v-model="allCols[scope.$index].name"
                      @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColName && !!scope.row.domainId, scope)"
                    ></el-input>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column
              :label="`字段类型`"
              prop="dataType"
              width="138"
              class-name="data-type"
              :show-overflow-tooltip="!editMode"
            >
              <template slot="header">
                <span class="table-label" :class="{required:editMode}">{{$version.scan.dialog.type}}</span>
              </template>
              <template slot-scope="scope">
                <span v-if="!editMode">{{scope.row.dataType}}</span>
                <el-form
                  @submit.native.prevent
                  v-else
                  size="mini"
                  :rules="rules"
                  :model="allCols[scope.$index]"
                  :ref='`type-form${scope.$index}`'>
                  <el-form-item
                    style="margin-bottom:0;"
                    :prop="'dataType'"
                    :rules="rules.dataType"
                  >
                    <el-autocomplete
                      :class="caculateBorderClass(scope)"
                      :readonly="isFocusArea"
                      size="mini"
                      :clearable="false"
                      @focus="onFocus(scope.$index)"
                      @input="onInput"
                      @select="(val) => {onSelect(val),clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!scope.row.domainId, scope)}"
                      v-model="allCols[scope.$index].dataType"
                      :fetch-suggestions="queryDataType"
                      @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!scope.row.domainId, scope)"
                    >
                      <template slot-scope="{ item }">
                        <div @click.stop v-if="item.type" style="cursor:initial;color:#aaaaaa;margin-left: -4px;">{{item.value}}</div>
                        <span v-else>{{item.value}}</span>
                      </template>
                    </el-autocomplete>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column
              label="数据标准"
              :width="200"
              :show-overflow-tooltip="!editMode"
            >
              <template slot-scope="scope">
                <span v-if="!editMode">{{scope.row.domainName !== '' ? scope.row.domainName : domainIdToName[scope.row.domainId]}}</span>
                <span :title="scope.row.domainName !== '' ? scope.row.domainName : domainIdToName[scope.row.domainId]" v-else style="display: flex;">
                  <el-select
                    size="mini"
                    style="width: 150px;border-raduis:0;flex: 1 1 auto;"
                    :value="scope.row.domainName !== '' ? scope.row.domainName : domainIdToName[scope.row.domainId]"
                    filterable
                    remote
                    placeholder="请输入标准"
                    :remote-method="searchDomain"
                    :loading="domainLoading"
                    @change="changeDomainId(...arguments, scope)"
                    clearable
                    @clear="clearDomain(scope)">
                    <el-option
                      v-for="item in domainOptions"
                      :key="item.domainCode"
                      :label="item.chName"
                      :value="item.domainCode">
                      <domain-popover :item="item"></domain-popover>
                    </el-option>
                  </el-select>
                  <el-button
                    style="color: #409EFF;position:relative;top: 1px;width: 40px;height: 28px;padding: 6px;flex: 0 0 auto;"
                    size="mini"
                    @click="callDomainSelector(scope)"
                  >选择</el-button>
                </span>
                <!-- <el-input
                  v-else
                  size="mini"
                  @focus="callDomainSelector(scope)"
                  :value="scope.row.domainName !== '' ? scope.row.domainName : domainIdToName[scope.row.domainId]"
                  clearable
                  @clear="clearDomain(scope)"
                ></el-input> -->
              </template>
            </el-table-column>
            <el-table-column
              label="标准代码"
              :width="200"
              :show-overflow-tooltip="!editMode"
            >
              <template slot-scope="scope">
                <span v-if="!editMode">{{$globalData.domainCodes && $globalData.domainCodes.map.get(scope.row.dataStandardCode)}}</span>
                <span :title="$globalData.domainCodes && $globalData.domainCodes.map.get(scope.row.dataStandardCode)" v-else>
                  <el-input
                    size="mini"
                    @focus="callCodeSelector(scope.row)"
                    :value="$globalData.domainCodes && $globalData.domainCodes.map.get(scope.row.dataStandardCode)"
                    clearable
                    @clear="clearCode(scope.row)"
                  ></el-input>
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="非空"
              min-width="50"
              prop="IsNotNull"
            >
              <template slot-scope="scope">
                <div style="float:left;">
                  <span style="padding-left: 10px;"></span>
                  <i class="el-icon-check" style="font-weight:bold;font-size:16px;color:#6acf72;" v-if="!editMode && scope.row.notNull"></i>
                  <el-checkbox
                    v-if="editMode"
                    v-model="scope.row.notNull"
                  ></el-checkbox>
                </div>
              </template>
            </el-table-column>
            <!--<el-table-column
              prop="IsPhysicalOnly"
              label="仅物理">
              <template slot-scope="scope">
                <el-checkbox
                  v-if="editMode"
                  v-model="scope.row.physicalOnly"></el-checkbox>
                <datablau-checked v-else-if="scope.row.physicalOnly"></datablau-checked>
              </template>
            </el-table-column>-->
            <el-table-column
              :label="udp.FriendlyName || udp.Name"
              v-for="udp of columnsUdpDisplay.values()"
              :key="udp.Id"
              :prop="String(udp.Id)"
              :width="190"
            >
              <template slot-scope="scope">
                <udp-setting class="in-column-wrapper" :hide-label="true" :tableMsg="requestBody.allUdps" :currentModel="currentModel" :type="80000005" :udp-map="new Map([[udp.Id, scope.row.allUdps[udp.Id]]])" :data-by-type="dataByType" :edit-mode="editMode" :request-body="scope.row">
                </udp-setting>
              </template>
            </el-table-column>
            <el-table-column
              fixed="right"
              label="操作"
              :width="120"
              v-if="editMode"
            >
              <template slot-scope="scope">
                <div class="operator-wrapper">
                  <datablau-button v-if="editorType === 'model'" type="icon" @click="editRow(scope.row)" class="iconfont icon-bianji"></datablau-button>
                  <datablau-button type="icon" style="font-size:14px" class="iconfont icon-delete" @click="deleteRow(scope.row, scope.$index)"></datablau-button>
                  <datablau-button type="icon" style="font-size:14px" size="mini" @click.stop="up(scope.$index)" :disabled="scope.$index===0" class="iconfont icon-up"></datablau-button>
                  <datablau-button type="icon" style="font-size:14px" size="mini" @click.stop="down(scope.$index)" :disabled="scope.$index===allCols.length-1" class="iconfont icon-down"></datablau-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          </div>

        </el-tab-pane>
        <el-tab-pane label="自定义SQL" name="sql">
          <datablau-button :disabled="!editMode" size="mini" @click="createSQL" style="margin-bottom: 10px;margin-top: 10px;">生成语句</datablau-button>
          <el-checkbox :disabled="!editMode" style="margin-left: 10px;" v-model="sqlOption.OptionOptionWithOwner" title="owner">with owner</el-checkbox>
          <el-checkbox :disabled="!editMode" v-model="sqlOption.OptionOptionWithDelimiter" title="delimiter">with delimiter</el-checkbox>
          <br/>
          <el-input
            :disabled="!editMode"
            style="width:553px;margin-top:15px"
            type="textarea"
            :autosize="{ minRows: 8, maxRows: 16 }"
            size="mini"
            v-model="requestBody.SQL"
          ></el-input>
        </el-tab-pane>
        <el-tab-pane label="索引" name="index">
          <index-editor
            :requestBody="requestBody"
            :deliverNum="deliverNum"
            v-if="indexEditorVisible"
            ref="indexEditor"
            :raw-data="rawData"
            :edit-mode="editMode"
            :virtualKey="true"
            :getIndexNameNamingMap="getIndexNameNamingMap"
            @updateIndexNotEmpty="updateIndexNotEmpty"
          ></index-editor>
        </el-tab-pane>
        <el-tab-pane label="视图属性" name="property">
          <div style="margin-top: 10px;">
            <div v-if="!isLogicalModel && isShowSchema" class="property" style="margin-top: 10px;width: 500px;">
              <span class="label" style="width: 82px;">schema</span>
              <el-select :disabled="!editMode" style="width:180px" size="mini" v-model="requestBody.SchemaRef" placeholder="" clearable filterable>
                <el-option v-for="item in Object.values(dataByType.schema).filter(i => !i.properties.deleted)"
                           :key="item.properties.Id"
                           :label="item.properties.Name"
                           :value="item.properties.Id">
                </el-option>
              </el-select>
            </div>
            <div class="property broader">
              <span class="label" style="width:82px;margin-right: 0;">定义</span>
              <span v-if="!editMode" class="value" style="line-height: 30px;">
              <div v-if="rawData.tableMsg.Definition" class="" v-html="string.nl2br(rawData.tableMsg.Definition)"></div>
              {{rawData.tableMsg.Definition ? '' :'暂无定义'}}
            </span>
              <span v-else class="value" style="width:478px">
              <el-input
                v-model="requestBody.description"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 2 }"
                show-word-limit
                maxlength="500"
                resize="none"
                size="mini"
                @change="changeAbsoluteTop"
              ></el-input>
            </span>
            </div>
            <div
              v-if="udpMessageDisplay.size"
              style="font-size: 12px;font-weight: 400;color: #555555;margin-bottom:10px"
            >自定义属性:</div>
            <div :style="{top: editorType === 'table'?'80px': '150px'}" style="position: absolute;top: 150px;bottom: 20px;left: 0px;right: 0px;overflow-y: auto;overflow-x: hidden">
              <div :key="key" v-for="key of udpMessageDisplay.keys()">
                <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 10px;">{{key}}</h2>
                <udp-setting :currentModel="currentModel" :type="80500008" :udp-map="udpMessageDisplay.get(key)" :data-by-type="dataByType" :edit-mode="editMode" :request-body="requestBody">
                </udp-setting>
              </div>
            </div>
            <!--<div style="position: absolute;top: 150px;bottom: 0px;left: 0px;right: 0px;overflow-y: auto;overflow-x: hidden">
              <div
                v-for="(u,k) in udpMessageDisplay"
                :key="k"
                class="property udp">
                <span class="label">{{dataByType.udp.get(Number.parseInt(k)).FriendlyName}}</span>
                <span class="value" v-if="!editMode">{{u}}</span>
                <span class="value" v-else>
                  <el-select
                    :key="k"
                    v-model="requestBody.allUdps[k]"
                    v-if="dataByType.udp.get(Number.parseInt(k)).Enum"
                    size="mini"
                  >
                    <el-option
                      v-for="o in dataByType.udp.get(Number.parseInt(k)).Enum.split(';').filter(i => i !== '')"
                      :key="o"
                      :value="o"
                      :label="o"
                    ></el-option>
                  </el-select>
                  <udp-validater-input
                    v-else
                    :key="k"
                    :value="requestBody.allUdps[k]"
                    @update="updateUdpValue(requestBody.allUdps, k, $event)"
                    :udp="dataByType.udp.get(Number.parseInt(k))"
                  >
                  </udp-validater-input>
                </span>
              </div>
            </div>-->
          </div>
        </el-tab-pane>
        <el-tab-pane v-if="editorType=== 'model'" label="样式" name="theme">
          <ul class="edit-style-dialog-content-wrapper" style="margin-top: 10px;">
            <li>样式：&nbsp;&nbsp;&nbsp;&nbsp;
              <datablau-select style="display: inline-block;width: 182px;" size="mini" placeholder="请选择" v-model="currentStyleRelatedShapeTemplate.StyleThemeRef">
                <template v-for="themeId in Object.keys(dataByType.theme)">
                  <el-option v-if="!dataByType.theme[themeId].properties.deleted" :key="dataByType.theme[themeId].properties.Name" :value="dataByType.theme[themeId].properties.Id" :label="dataByType.theme[themeId].properties.Name" ></el-option>
                </template>
              </datablau-select>
            </li>
            <li class="style-box">
              <el-color-picker style="margin-right: 15px;vertical-align: middle" show-alpha v-model="currentStyleRelatedShapeTemplate.StyleBackColor2" size="mini"></el-color-picker>
              <span class="label-disc middle-y">标题背景</span>
              <opacity-component class="middle-y" :rgba.sync="currentStyleRelatedShapeTemplate.StyleBackColor2"></opacity-component>
            </li>
            <li class="style-box">
              <el-color-picker style="margin-right: 15px;vertical-align: middle" show-alpha v-model="currentStyleRelatedShapeTemplate.StyleBackColor" size="mini"></el-color-picker>
              <span class="label-disc middle-y">背景颜色</span>
              <opacity-component class="middle-y" :rgba.sync="currentStyleRelatedShapeTemplate.StyleBackColor"></opacity-component>
            </li>
          </ul>
          <div style="text-align: left;margin-top: 5px;">
            <el-button type="primary" @click="resetStyleConfirm" size="mini">重置</el-button>
          </div>
        </el-tab-pane>
        <template v-for="page of udpMessagePageDisplay.keys()">
          <el-tab-pane :label="page" :name="page" :key="page">
            <div style="position: absolute;top: 10px;bottom: 20px;left: 0px;right: 0px;overflow-y: auto;overflow-x: hidden">
              <div :key="key" v-for="key of udpMessagePageDisplay.get(page).keys()">
                <h2 class="udp-class-title-hint" style="font-size: 14px;margin-top: 10px;">{{key}}</h2>
                <udp-setting :currentModel="currentModel" :type="80500008" :udp-map="udpMessagePageDisplay.get(page).get(key)" :data-by-type="dataByType" :edit-mode="editMode" :request-body="requestBody">
                </udp-setting>
              </div>
            </div>
          </el-tab-pane>
        </template>
      </datablau-tabs>
    </div>
    <div v-if="editMode && editorType === 'table'" class="bottom-tool"  :class="{'shadow': activeTab === 'column'}">
      <datablau-button
        v-if="editMode && writable"
        @click="beforeSave"
        size="small"
        type="important"
        :disabled="buttonLoading || !requiredFormNotEmpty"
      >{{$store.state.$v.dataEntity.ok}}</datablau-button>
      <datablau-button
        v-if="editMode"
        @click="cancel"
        size="small"
        type="secondary"
        :disabled="buttonLoading"
      >{{$store.state.$v.dataEntity.cancel}}</datablau-button>
    </div>
  </div>
</template>
<script>
import viewDetail from './viewDetail.js'
export default viewDetail
</script>
<style lang="scss" scoped="scoped">
  @import '@/views/list/_paneDetail.scss';
  .operator-wrapper {
    line-height: 30px;
    text-align: center;
  }
  #table-details .editor-type-table /deep/ .el-tabs__content {
    top: 40px;
  }
  .new-title-box {
    margin: 14px 0;
    .header {
      padding: 11px 16px;
      height: 70px;
      background: #F6F8FF;
      padding-top: 15px;
      img {
        float: left;
      }
      .text-box {
        padding-left: 10px;
        float: left;
        h3 {
          line-height: 20px;
          font-size: 20px;
        }
        p {
          padding-top: 3px;
          color: #7D8493;
          font-size: 13px;
        }
        &.text-box2 {
          display: inline-block;
          padding-left: 16px;
          vertical-align: super;
          h3 {
            line-height: 20px;
            font-size: 20px;
            color: #555555;
          }
          p {
            padding-top: 3px;
            color:#909399;
            font-size: 13px;
          }
        }
      }
    }
    .row {
      padding-top: 16px;
      .property {
        float: left;
        &.broader {
          height: unset;
          min-height: unset;
          // max-width: 1269px;
          width: calc(100% - 140px);
          margin-right: 0;
        }
        &.thin {
          height: 24px;
          min-height: unset;
          margin-right: 10px;
          width: 128px;
        }
        .value {
          color: #888F9D;
          word-break: break-word;
          & > div {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
  .editor-type-table.content-box {
    top: 100px;
    bottom: 35px;
  }
  .bottom-tool {
    padding: 9px 0;
    padding-left: 20px;
    position: absolute;
    bottom: 1px;
    left: 0;
    right: 0;
    height: 50px;
    border-top: 1px solid #ddd;
    background-color: #fff;
    z-index: 9;
    &.shadow {
      box-shadow: 0px -2px 4px 0px rgba(0,0,0,0.1);
      border-top: unset;
    }
  }
  /deep/ .el-table--border::after {
    display: none;
  }
  .el-table.datablau-table /deep/ thead th {
    color: #555;
  }
  .el-button {
    font-weight: normal;
  }
  /deep/ .el-table__fixed::before {
    display: none;
  }
  /deep/ .el-table::before {
    display: none;
  }
   /deep/ .blue-tabs .el-tabs__item.is-active {
    color: #409EFF;
  }
  /deep/ .blue-tabs .el-tabs__active-bar {
    background-color: #409EFF;
  }
  /deep/ .el-tabs__item {
    font-size: 12px;
    color: #555;
  }
  /deep/ .el-button {
    font-size: 12px;
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
  .translate-wrapper {
    cursor: pointer;
    top: 4px;
    margin-left: 18px;
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
     color: #555;
    }
    &:hover {
      span {
        color: #409EFF;
      }
    }
  }
  .table-box1 {
    height: unset!important;
    position: absolute;
    top: 50px;
    left: 0;
    bottom: 20px;
    right: 0;
    .el-autocomplete {
      display: block;
      height: 30px;
    }
  }
  .is-edit .table-box1 /deep/ td {
    border-right: 1px solid #EBEEF5!important;
  }
  .table-box1 /deep/ {
    .cell {
      height: 30px!important;
      line-height: 30px!important;
    }
    .el-table__row td:last-child .cell {
      border-right: 1px solid #ddd;
    }
    .table-header-class {
      th {
        background-color: #F5F5F5;
        height: 30px!important;
      }
    }
    .el-table--border th.is-leaf {
      border-right: 2px solid #EBEEF5;
    }
    .el-table__body {
      .el-select {
        vertical-align: top;
      }
      .el-checkbox {
        line-height: 30px;
        height: 30px;
      }
      i.el-icon-check {
        height: 30px;
        line-height: 30px;
      }
      tr > td .is-error input {
        border: 1px solid #F56C6C;
        color: #F56C6C;
      }
      tr > td.focus .top input {
        border-top: 1px solid rgb(64, 158, 255)
      }
      tr > td.focus .left input {
        border-left: 1px solid rgb(64, 158, 255)
      }
      tr > td.focus .right input {
        border-right: 1px solid rgb(64, 158, 255)
      }
      tr > td.focus .bottom input {
        border-bottom: 1px solid rgb(64, 158, 255)
      }
      tr > td input:focus {
        background-color: rgba(64, 158, 255, 0.1) !important;
        border: 1px solid rgb(64, 158, 255)
      }
      tr td.focus input {
        position: relative;
        background-color: rgba(64, 158, 255, 0.1) !important;
        border: none;
      }
    }
    .el-input {
      vertical-align: top;
    }
    td {
      vertical-align: top;
    }
    input {
      height: 30px;
      line-height: 30px;
      vertical-align: inherit;
      border: none;
      border-radius: 0;
      background-color: unset;
    }
    button {
      padding: 0;
      height: 30px!important;
      vertical-align: inherit;
      border: none;
      background-color: unset;
    }
    .el-table__body, .el-table__footer, .el-table__header {
      border-collapse: collapse;
    }
    .el-table--border {
      border: none;
    }
    .el-table__header-wrapper {
      table {
        border-right: 1px solid #EBEEF5;
        border-top: 1px solid #EBEEF5;
      }
    }
    .el-table__fixed-header-wrapper {
      table {
        border-left: 1px solid #EBEEF5;
        border-top: 1px solid #EBEEF5;
      }
    }
    .el-table__body-wrapper {
      table {
        border: 1px solid #EBEEF5;
        border-top: none;
        .cell {
          padding-left: 0;
        }
      }
    }
    .el-table__fixed-body-wrapper {
      table {
        border: 1px solid #EBEEF5;
        border-top: none;
        .cell {
          padding-left: 0;
        }
      }
    }
  }
   #table-details {
     box-shadow: 2px 0 8px 0 rgba(0,0,0,0.1);
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
  .new-title-box {
    .header {
      img {
        float: left;
      }
      .text-box {
        padding-left: 10px;
        float: left;
        h3 {
          line-height: 20px;
          font-size: 20px;
        }
        p {
          padding-top: 11px;
          color: #7D8493;
          font-size: 13px;
        }
      }
      &.text-box2 {
        display: inline-block;
        padding-left: 16px;
        vertical-align: super;
        h3 {
          line-height: 20px;
          font-size: 20px;
          color: #555555;
        }
        p {
          padding-top: 3px;
          color:#909399;
          font-size: 13px;
        }
      }
    }
    .row {
      padding-top: 16px;
      .property {
        float: left;
        &.broader {
          height: unset;
          min-height: unset;
          max-width: 1390px;
        }
        &.thin {
          height: 24px;
          min-height: unset;
          margin-right: 10px;
          width: 140px!important;
        }
        .value {
          color: #888F9D;
          word-break: break-word;
        }
      }
    }
  }
  .property {
    width: 30%;
    &.thin {
      width: 180px;
    }
    .label {
        font-size: 12px;
        font-weight: 400;
        color: #555555;
        line-height: 30px;
      }
    &.udp {
      width: 561px;
      max-width: unset;
      margin-right: unset;
      min-height: unset;
      &:last-of-type {
        .label {
          border-bottom:1px solid #DDDDDD;
        }
      }
      .label {
        padding-left: 10px;
        width: 200px;
        height: 34px;
        background: #F5F5F5;
        border-radius: 2px 0px 0px 0px;
        border: 1px solid #DDDDDD;
        border-bottom: unset;
      }
      .value {
        width: 361px;
        height: 34px;
        .el-input {
          display: inline-block;
          width: 250px;
          height: 34px;
        }
        .el-input-number {
          width: 250px;
        }
        /deep/ .el-input__inner {
          width: 250px;
          height: 34px;
          line-height: 34px;
        }
        /deep/ .el-input-number__decrease {
          height: 34px;
        }
        /deep/ .el-input-number__increase {
          height: 34px;
        }
      }
    }
  }
  .in-column-wrapper {
    .property {
      &.udp {
        .el-input__inner {
          height: 30px!important;
          line-height: 30px;
          width: 190px;
        }
        .el-input-number {
          width: 190px;
        }
      }
    }
  }
  .top-area {
     width:600px;
     padding-bottom: 15px;
    //  border-bottom: 1px solid #D8D8D8;
     .property.broader {
       margin-top: 10px;
       width: 100%;
     }
  }
  .top-area {
     .property {
      // height:3em;
      // line-height:2em;
      margin-right: unset;
      height: 30px;
      width: 240px;
      min-height: unset;
      .value {
        width: 160px;
        height: 30px;
      }
      .label {
        padding-left: 2px;
        width: 80px;
        line-height: 30px;
        text-align: right;
        padding-right:10px;
        &.required::before {
          position: static;
        }
      }
    }
  }
  .container.overflow {
    /*padding:10px;*/
    margin-left: 0;
    padding:0 20px 15px;
    overflow-x:hidden;
    overflow-y:auto;
    position:absolute;top:0;left:0;bottom:0;right:0px;
  }
  .title {
    margin-bottom:0.8em;
  }
  .outline {
    color:#494850;
    height:70px;
    position:relative;
    /*border: 1px solid red;*/
    .title{
      position:absolute;
      top:0px;
      left:20px;
      font-size:18px;
      /*max-width:350px;*/
    }
    .sub {
      position: absolute;
      top:30px;
      left:20px;
    }
  }
  .is-edit {
    top: 75px
  }
  /deep/ .hide-entity-row {
    display: none;
  }
  .header-wrapper {
    margin: 0 -20px 10px -20px;
    padding: 10px 0 10px;
    // border-bottom: 1px solid #D8D8D8;
    h2 {
      font-size: 14px;
      line-height: 1;
      color: #555;
      margin-left: 0px;
      // border-left: 4px solid #409EFF;
      padding-left: 22px;
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
  }
</style>
<style lang="scss">
  #table-details {
    .el-tooltip__popper {
      max-width:600px;
    }
    .el-autocomplete-suggestion li {
       padding: 0 0px;
    }
    .el-tabs__content {
      position: absolute;
      top: 50px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: auto;
    }
    .el-tab-pane {
      overflow: hidden;
      height: 100%;
    }
  }
  .el-popover.domain-popover {
    padding: 10px;

    .tree-icon.domain {
      left: 5px;
    }

    .domain-title {
      position: relative;
      font-size: 14px;
      font-weight: 500;
      color: #555555;

      > p {
        position: absolute;
        top: 0;
        right: 17px;
        color: #4496FF;
        font-size: 12px;
      }
    }

    .domain-disc {
      margin-bottom: 7px;
      padding-left: 24px;
      font-size: 12px;
      font-weight: 400;
      text-align: left;
      color: #555555;
      line-height: 24px;
      border-bottom: 1px solid rgba(85, 85, 85, 0.10);;
    }

    .text-item {
      font-size: 12px;
      font-weight: 400;
      color: #555555;
      margin-bottom: 5px;
    }

    .label {
      margin-right: 10px;
      display: inline-block;
      width: 72px;
      text-align: right;
    }
  }
</style>
