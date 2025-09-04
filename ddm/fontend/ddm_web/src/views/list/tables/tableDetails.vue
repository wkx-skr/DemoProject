<template>
  <div
  id="table-details"
    class="container overflow avoid-citic"
    :class="{'is-edit':editMode}"
    v-loading="buttonLoading"
    :element-loading-text="this.$store.state.$v.dataEntity.updating"
  >
    <domain-code-selector
      ref="domainCodeSelector"
      @selected="handleCodeSelected"
    ></domain-code-selector>
    <domain-selector
      :limitedDsApply="currentModel.limitedDsApply"
      :limitedDsApplyConfig="getConfig()"
      ref="domainSelector"
      @selected="handleDomainSelector"
    ></domain-selector>
    <check-in-version
      :dialog-visible="checkInVersionDialogVisible"
      @close="checkInVersionDialogVisible=false"
      @save="save"
    ></check-in-version>
    <!-- <el-button
      v-if="editMode"
      @click="cancel"
      size="small"
      :disabled="buttonLoading"
      style="position:absolute;right:30px;top:15px;">{{$store.state.$v.dataEntity.cancel}}</el-button> -->
    <datablau-button
      v-if="writable && !editMode && rawData.tableMsg.RawType !== 'View'"
      @click="goToEdit"
      size="small"
      type="important"
      style="position:absolute;right:30px;top:34px;">
        <i class="iconfont icon-bianji" style="margin-right:5px;font-size:14px"></i>
        编辑
      </datablau-button>
    <datablau-button
      v-if="!editMode && rawData.tableMsg.RawType !== 'View' && $store.state.lic.archy"
      @click="checkLineage(rawData.tableMsg)"
      size="small"
      type="noraml"
      style="position:absolute;right:110px;top:34px;">血缘</datablau-button>
    <!-- <el-button
      v-else-if="writable && rawData.tableMsg.RawType !== 'View'"
      @click="beforeSave"
      size="small"
      type="primary"
      :disabled="buttonLoading || !requiredFormNotEmpty"
      style="position:absolute;right:110px;top:15px;">{{$store.state.$v.dataEntity.save}}</el-button> -->
    <div v-if="!rawData.appendMode && !editMode" class="new-title-box">
      <div class="header clearfixed">
        <img width="40" :src="rawData.tableMsg && rawData.tableMsg.RawType === 'View' ? viewImg : tableImg" alt="">
        <div class="text-box" :class="{'text-box2':typeDataWareHouse}">
          <h3>{{rawData.tableMsg.Name}}</h3>
          <p>中文名称：{{rawData.tableMsg.LogicalName}}</p>
        </div>
      </div>
    </div>
    <!-- <div class="title" v-if="!rawData.appendMode">{{rawData.tableMsg.Name}}<span v-show="rawData.tableMsg.LogicalName && rawData.tableMsg.LogicalName !== rawData.tableMsg.Name">({{rawData.tableMsg.LogicalName}})</span></div> -->
    <!-- <div class="title" v-if="rawData.appendMode">{{isLogicalModel ? $store.state.$v.dataEntity.addEntity : $store.state.$v.dataEntity.addTable}}</div> -->
<!--    <div class="sub-title">基本信息</div>-->
    <div v-if="editMode" class="top-area">
<!--      <datablau-detail-subtitle style="display:block" title="基本信息" mt="0px" mb="16px"></datablau-detail-subtitle>-->
      <div class="property">
        <span class="label">{{$store.state.$v.dataEntity.alias}}</span>
        <span v-if="!editMode" class="value">{{rawData.tableMsg.LogicalName}}</span>
        <span v-else class="value">
          <datablau-input
            v-model="requestBody.cnName"
            size="mini"
            placeholder="请输入"
            style=""></datablau-input>
        </span>
      </div>
      <div class="translate-wrapper" @click="handleTableCNNameTab(requestBody.cnName)" @mouseenter="translateActive=true" @mouseleave="translateActive=false">
        <span>翻译</span>
        <img :src="translateActive ? translateActiveImg : translateImg" alt="" />
      </div>
      <div class="property name" :class="{long:isLogicalModel}">
        <span class="label" :class="{required:editMode,long:isLogicalModel}">{{isLogicalModel?'实体名称': $store.state.$v.dataEntity.tableName}}</span>
        <span v-if="!editMode" class="value">{{rawData.tableMsg.Name}}</span>
        <span v-else class="value">
            <el-form size="mini" :rules="rules">
              <el-form-item style="height:32px;" prop="tableName">
                <datablau-input
                  size="mini"
                  v-model="requestBody.name"
                  placeholder="请输入"
                ></datablau-input>
              </el-form-item>
            </el-form>
          </span>
      </div>
    </div>
    <div class="content-box"  :style="!requestBody.description && !editMode ? 'top: 85px!important': ''" :class="{'is-edit':editMode}">
      <datablau-tabs
        v-model="activeTab"
        class="blue-tabs has-border"
        :class="{edit:editMode}"
        style="position:relative;top:1px;height:88%"
      >
        <el-tab-pane :label="isLogicalModel?'实体属性':'表属性'" name="udp" class="udp">
          <div v-if="editMode" style="padding-top:10px">
            <div
              v-if="isLogicalModel"
              style="height: 24px;line-height: 24px;display: inline-block;width: auto;"
              class="property thin">
              <datablau-checkbox
                style="display:inline-block;width:69px"
                :checkboxType="'single'"
                class="small"
                v-if="editMode"
                v-model="requestBody.logicalOnly"
              >{{$store.state.$v.dataEntity.logicalOnly}}</datablau-checkbox>
              <!-- <span class="label" style="width:20px;">
              <span v-if="!editMode">{{$store.state.$v.dataEntity.logicalOnly}}</span>
                <datablau-tips style="color:#999;font-size:14px" :content="$store.state.$v.dataEntity.logicalOnlyTitle" icon="icon-tips"></datablau-tips>
              </span> -->
              <span class="tip-text">
                <i class="iconfont icon-tips"></i>{{$store.state.$v.dataEntity.logicalOnlyTitle}}
              </span>
              <div v-if="!editMode" class="value">{{rawData.tableMsg.IsLogicalOnly ? $store.state.$v.dataEntity.yes : $store.state.$v.dataEntity.no}}</div>
            </div>
            <div
              v-else
              style="height: 24px;line-height: 24px;display: inline-block;width: auto;"
              class="property thin">
              <datablau-checkbox
                style="display:inline-block;width:69px"
                :checkboxType="'single'"
                class="small"
                v-if="editMode"
                v-model="requestBody.physicalOnly"
              >{{$store.state.$v.dataEntity.physicalOnly}}</datablau-checkbox>
              <!-- <span class="label" style="width:15px;">
                <span v-if="!editMode">{{$store.state.$v.dataEntity.physicalOnly}}</span>
                <datablau-tips style="color:#999" v-if="!isEn" :content="$store.state.$v.dataEntity.physicalOnlyTitle" icon="icon-tips"></datablau-tips>
              </span> -->
              <span class="tip-text">
                <i class="iconfont icon-tips"></i>{{$store.state.$v.dataEntity.physicalOnlyTitle}}
              </span>
              <div v-if="!editMode" class="value">{{rawData.tableMsg.IsPhysicalOnly ? $store.state.$v.dataEntity.yes : $store.state.$v.dataEntity.no}}</div>
            </div>
            <br/>
            <div class="property">
              <span class="label">{{$store.state.$v.dataEntity.definition}}</span>
              <span v-if="!editMode" class="value">
          <div v-if="rawData.tableMsg.Definition" class="" v-html="string.nl2br(rawData.tableMsg.Definition)"></div>
          {{rawData.tableMsg.Definition ? '' :$store.state.$v.dataEntity.noDefinition}}
        </span>
        <span v-else class="value">
          <datablau-input
            style="width: 704px;"
            :key="1"
            v-model="requestBody.description"
            type="textarea"
            :rows="5"
            :autosize="{minRows:3,maxRows:30}"
            size="mini"
            placeholder="请输入"
          ></datablau-input>
        </span>
            </div>
          </div>
          <div v-else class="secondary-box">
            <div
                v-if="isLogicalModel"
                style="margin: 2px 0 10px 112px;height: 24px;min-height: unset;line-height: 24px;"
                class="property thin">
              <datablau-checkbox
                  :disabled="true"
                  style="display:inline-block;width:69px"
                  :checkboxType="'single'"
                  class="small"
                  v-model="requestBody.logicalOnly"
              >{{ $store.state.$v.dataEntity.logicalOnly }}
              </datablau-checkbox>
              <!-- <span class="label" style="width:20px;line-height: 24px;height: 24px;">
                <datablau-tips :content="$store.state.$v.dataEntity.logicalOnlyTitle" icon="icon-tips"></datablau-tips>
              </span> -->
              <span class="tip-text">
                <i class="iconfont icon-tips"></i>{{$store.state.$v.dataEntity.logicalOnlyTitle}}
              </span>
            </div>
            <div
                v-else
                style="margin: 2px 0 10px 112px;height: 24px;min-height: unset;line-height: 24px;"
                class="property thin">
              <datablau-checkbox
                  :disabled="true"
                  style="display:inline-block;width:69px"
                  :checkboxType="'single'"
                  class="small"
                  v-model="requestBody.physicalOnly"
              >{{ $store.state.$v.dataEntity.physicalOnly }}
              </datablau-checkbox>
              <span class="tip-text">
                <i class="iconfont icon-tips"></i>{{ $store.state.$v.dataEntity.physicalOnlyTitle }}
              </span>
            </div>
            <br/>
            <div class="property udp">
              <span class="label">{{$store.state.$v.dataEntity.definition}}{{editMode ? '' : '：'}}</span>
              <!-- <span class="value">
                <datablau-input
                  :key="2"
                  :disabled="true"
                  style="width: 704px;"
                  v-model="requestBody.description"
                  type="textarea"
                  :rows="5"
                  :autosize="{minRows:5,maxRows:5}"
                  size="mini"
                ></datablau-input>
              </span> -->
              <span  class="value" >{{requestBody.description}}</span>
            </div>
          </div>
          <!-- <div v-if="editMode" style="margin-top: 20px;"></div> -->
          <div
              v-for="(u,k) in udpMessageDisplay"
              :key="k"
              class="property udp "
              :class="{'edit':editMode}"
          >
            <span class="label"
                  :class="{'edit':editMode}">{{
                dataByType.udp.get(Number.parseInt(k)).FriendlyName || dataByType.udp.get(Number.parseInt(k)).Name
              }}{{ editMode ? '' : '：' }}</span>
            <span class="value" v-if="!editMode">{{ u }}</span>
            <span class="value" :class="{edit:editMode}" v-else>
              <datablau-select
                  :key="k"
                  v-model="requestBody.allUdps[k]"
                  v-if="dataByType.udp.get(Number.parseInt(k)).Enum"
                  size="mini"
                  @change="$forceUpdate()"
              >
                <el-option
                    v-for="o in dataByType.udp.get(Number.parseInt(k)).Enum.split(';').filter(i => i !== '')"
                    :key="o"
                    :value="o"
                    :label="o"
                ></el-option>
              </datablau-select>
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
        </el-tab-pane>
        <el-tab-pane :label="isLogicalModel ? $store.state.$v.dataEntity.columnInfo1 : $store.state.$v.dataEntity.columnInfo" name="column">
          <div style="display: inline-block;margin-top:10px">
            <datablau-button class="iconfont" size="mini" @click="translateAll" type="secondary">
              翻译全部
            </datablau-button>
          </div>
          <datablau-button
            v-show="editMode"
            type="text"
            class="iconfont icon-tianjia"
            style="margin-left:10px"
            @click="addColumn"
          >{{isLogicalModel ?$store.state.$v.dataEntity.addAttr : $store.state.$v.dataEntity.addCol}}</datablau-button>
          <div class="table-content" :class="{'table-box1':editMode,'table-box2':!editMode}">
            <datablau-table
            class="datablau-table thin"
            :class="{'tableDetailField':typeDataWareHouse}"
            v-if="allCols"
            :data="allCols"
            :key="tableKey"
            height="100%"
            ref="tableDetailList"
            @cell-mouse-enter="handleCellMouseEnter"
            @keydown.native="onKeyPress"
          >
            <el-table-column fixed label="" width="30">
              <template slot-scope="scope">{{scope.$index+1}}</template>
            </el-table-column>
            <el-table-column
              fixed
              :label="$store.state.$v.modelDetail.cnName"
              prop="cnName"
              width="150"
              :show-overflow-tooltip="!editMode"
            >
              <template slot-scope="scope">
                <span v-if="!editMode">{{scope.row.cnName}}</span>
                <el-autocomplete
                  style="width:140px"
                  v-else
                  size="mini"
                  v-model="allCols[scope.$index].cnName"
                  :loading="domainLoading"
                  :fetch-suggestions="queryDomain"
                  :trigger-on-focus="false"
                  @select="handleOptionSelect($event, scope.row)"
                  @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColChName && !!scope.row.domainId ,scope)"
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
              </template>
            </el-table-column>
            <el-table-column
              fixed
              :label="$version.scan.dialog.name"
              prop="name"
              :width="150"
              :show-overflow-tooltip="!editMode"
            >
              <template slot="header" slot-scope="scope">
                <span v-if="editMode" :data="scope.$index" class="table-label required">{{isLogicalModel ? $store.state.$v.modelDetail.colName1 : $store.state.$v.modelDetail.colName}}</span>
                <span v-else class="table-label">{{isLogicalModel ? $store.state.$v.modelDetail.colName1 : $store.state.$v.modelDetail.colName}}</span>
              </template>
              <template slot-scope="scope">
                <span v-if="!editMode">{{scope.row.name}}</span>
                <el-form
                  v-else
                  size="mini"
                  :ref='`name-form${scope.$index}`'
                  :model="allCols[scope.$index]">
                  <el-form-item
                    style="height:29px;margin-bottom:1px;"
                    prop="name"
                    :rules="rules.columnName"
                  >
                    <datablau-input
                      size="mini"
                      @keydown.native="updateColumnsMapOfIndexEditor(allCols[scope.$index])"
                      v-model="allCols[scope.$index].name"
                      @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColName && !!scope.row.domainId ,scope)"
                    ></datablau-input>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column
              :label="isLogicalModel ? $store.state.$v.modelDetail.dataType1 : $store.state.$v.modelDetail.dataType"
              prop="dataType"
              min-width="180"
              class-name="data-type"
              :show-overflow-tooltip="!editMode"
            >
              <template slot="header">
                <span class="table-label" :class="{required:editMode}">{{isLogicalModel ? $store.state.$v.modelDetail.dataType1 : $store.state.$v.modelDetail.dataType}}</span>
              </template>
              <template slot-scope="scope">
                <span v-if="!editMode">{{scope.row.dataType}}</span>
                <el-form
                  v-else
                  size="mini"
                  :ref='`type-form${scope.$index}`'
                  :model="allCols[scope.$index]">
                  <el-form-item
                    style="height:29px;margin-bottom:1px;"
                    prop="dataType"
                    :rules="rules.dataType"
                  >
                    <el-autocomplete
                      size="mini"
                      @focus="onFocus(scope.$index)"
                      @input="onInput"
                      @select="(val) => {onSelect(val),clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!scope.row.domainId, scope)}"
                      clearable
                      v-model="allCols[scope.$index].dataType"
                      :fetch-suggestions="queryDataType"
                      @change="clearLimitedDomain(limitedDsApply && limitedDsApplyConfig.rColDt && !!scope.row.domainId ,scope)"
                    >
                      <template slot-scope="{ item }">
                        <div @click.stop v-if="item.type" style="cursor:initial;color:#aaaaaa;margin-left:0;">{{item.value}}</div>
                        <span v-else style="margin-left:2px;">{{item.value}}</span>
                      </template>
                    </el-autocomplete>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column
              :label="$store.state.$v.dataEntity.domain"
              :min-width="150"
              :show-overflow-tooltip="!editMode"
            >
              <template slot-scope="scope">
                <span v-if="!editMode">{{domainIdToName[scope.row.domainId]}}</span>
                <datablau-input
                  v-else
                  size="mini"
                  @focus="callDomainSelector(scope)"
                  :value="domainIdToName[scope.row.domainId]"
                  clearable
                  @clear="clearDomain(scope)"
                ></datablau-input>
              </template>
            </el-table-column>
            <el-table-column
              :label="$store.state.$v.dataEntity.domainCode"
              :min-width="120"
              :show-overflow-tooltip="!editMode"
            >
              <template slot-scope="scope">
                <span v-if="!editMode">{{$globalData.domainCodes && $globalData.domainCodes.map.get(scope.row.dataStandardCode)}}</span>
                <datablau-input
                  v-else
                  size="mini"
                  @focus="callCodeSelector(scope.row)"
                  :value="$globalData.domainCodes && $globalData.domainCodes.map.get(scope.row.dataStandardCode)"
                ></datablau-input>
              </template>
            </el-table-column>
            <el-table-column
              :label="$store.state.$v.dataEntity.pk"
              width="60"
            >
              <template slot-scope="scope">
<!--                <el-checkbox-->
<!--                  v-if="editMode"-->
<!--                  v-model="pkSelection[scope.$index]"-->
<!--                  @change="handlePkSelectionChange"-->
<!--                ></el-checkbox>-->
                <datablau-checked style="margin-left:6px" v-if="pk.indexOf(scope.row.elementId) > -1"></datablau-checked>
              </template>
            </el-table-column>
            <el-table-column
              :label="$store.state.$v.dataEntity.fk"
              width="60"
            >
              <template slot-scope="scope">
                <datablau-checked style="margin-left:6px" v-if="fk.indexOf(scope.row.elementId) > -1"></datablau-checked>
              </template>
            </el-table-column>
            <el-table-column
              :label="$store.state.$v.dataEntity.notNull"
              width="60"
              prop="IsNotNull"
            >
              <template slot-scope="scope">
                <i class="el-icon-check" style="margin-left:6px;font-weight:bold;font-size:16px;color:#6acf72;" v-if="!editMode && scope.row.notNull"></i>
                <datablau-checkbox
                  :checkboxType="'single'"
                  v-if="editMode"
                  v-model="scope.row.notNull"
                  style="margin-left:6px"
                ></datablau-checkbox>
              </template>
            </el-table-column>
            <el-table-column
              v-if="isLogicalModel"
              prop="IsLogicalOnly"
              min-width="60"
              :label="$store.state.$v.dataEntity.logicalOnly">
              <template slot-scope="scope">
                <datablau-checkbox
                  :checkboxType="'single'"
                  style="margin-left:12px"
                  v-if="editMode"
                  v-model="scope.row.logicalOnly"></datablau-checkbox>
                <datablau-checked style="margin-left:6px" v-else-if="scope.row.logicalOnly"></datablau-checked>
              </template>
            </el-table-column>
            <el-table-column
              v-else
              min-width="60"
              prop="IsPhysicalOnly"
              :label="$store.state.$v.dataEntity.physicalOnly">
              <template slot-scope="scope">
                <datablau-checkbox
                  :checkboxType="'single'"
                  style="margin-left:12px"
                  v-if="editMode"
                  v-model="scope.row.physicalOnly"></datablau-checkbox>
                <datablau-checked style="margin-left:6px" v-else-if="scope.row.physicalOnly"></datablau-checked>
              </template>
            </el-table-column>
            <el-table-column
              :label="$store.state.$v.dataEntity.defaultValue"
              :min-width="120"
              prop="defaultVal"
              :show-overflow-tooltip="!editMode"
            >
              <template slot-scope="scope">
                <span v-if="!editMode">{{scope.row.defaultVal}}</span>
                <el-input
                  v-else
                  size="mini"
                  v-model="allCols[scope.$index].defaultVal"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column
              :label="$store.state.$v.dataEntity.definition"
              prop="Definition"
              :width="180"
              :show-overflow-tooltip="!editMode"
            >
              <template slot-scope="scope">
                <span v-if="!editMode">{{scope.row.description}}</span>
                <el-input
                  v-else
                  size="mini"
                  v-model="allCols[scope.$index].description"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column
                :label="dataByType.udp.size > 0 ? (dataByType.udp.get(Number.parseInt(udpKey)).FriendlyName || dataByType.udp.get(Number.parseInt(udpKey)).Name) : ''"
                v-for="udpKey in columnsUdpKeysDisplay"
                :key="udpKey"
                :prop="String(udpKey)"
                :min-width="dataByType.udp.get(udpKey).ValueType==='System.DateTime' ? 210 : 180"
            >
              <template slot-scope="scope">
                <span v-if="!editMode">{{ scope.row.allUdps[udpKey] }}</span>
                <span v-else>
                  <el-select
                      v-model="scope.row.allUdps[udpKey]"
                      v-if="dataByType.udp.size > 0 ? dataByType.udp.get(udpKey).Enum : false"
                      size="mini"
                  >
                    <el-option
                        v-for="o in dataByType.udp.get(udpKey).Enum.split(';').filter(item => !!item)"
                        :key="o"
                        :value="o"
                        :label="o"
                    ></el-option>
                  </el-select>
                  <udp-validater-input
                    v-else
                    :key="udpKey + scope.row.elementId + scope.row.name"
                    :value="scope.row.allUdps[udpKey]"
                    @update="updateUdpValue(scope.row.allUdps, udpKey, $event)"
                    :udp="dataByType.udp.get(udpKey)"
                  >
                  </udp-validater-input>
                </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$store.state.$v.dataEntity.Operation"
              fixed="right"
              :width="80"
              v-if="editMode"
            >
              <template slot-scope="scope">
                <!-- <el-button type="text" v-else @click="deleteRow(scope.row, scope.$index)">{{$store.state.$v.dataEntity.delete}}</el-button> -->
                <datablau-button
                  :disabled="fk.indexOf(scope.row.elementId) > -1"
                    type="text"
                    @click.stop="deleteRow(scope.row, scope.$index)"
                    style="position: relative;
                            right: 4px;"
                  >
                  <i class="iconfont icon-delete"></i>
                </datablau-button>
                <datablau-tooltip v-if="fk.indexOf(scope.row.elementId) > -1" content="外键成员字段不允许被删除"></datablau-tooltip>
              </template>
            </el-table-column>
          </datablau-table>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$store.state.$v.dataEntity.indexInfo" name="index" class="index">
          <index-editor
            v-if="indexEditorVisible"
            ref="indexEditor"
            :raw-data="rawData"
            :edit-mode="editMode"
            :typeDataWareHouse="typeDataWareHouse"
            @updateIndexNotEmpty="updateIndexNotEmpty"
          ></index-editor>
        </el-tab-pane>
        <el-tab-pane class="code-generate" v-if="!isLogicalModel && !editMode" :label="$store.state.$v.dataEntity.codeGenerate" name="Code" :lazy="true">
          <datablau-button
            type="important"
            size="default"
            @click="callSet"
            style="
            position: absolute;
            top:10px;
            right: 10px;
            z-index: 1;
            "
            >{{activeTool === 'jpa' ? "JPA 脚本配置" :"SQL 脚本配置"}}
            </datablau-button>
          <datablau-tabs type="card"  v-model="activeTool"  tab-position="top" >
            <el-tab-pane
              label="JPA Class"
              name="jpa">
              <export-jpa
                ref='jpa'
                :typeDataWareHouse="typeDataWareHouse"
                :modelId ='this.currentModel.id'
                :tableId='rawData.tableMsg.Id'
                :currentModel="currentModel"
              ></export-jpa>
            </el-tab-pane>
            <el-tab-pane
              :label="$store.state.$v.dataEntity.ddlScript"
              name="ddl">
              <export-ddl
                ref='ddl'
                :typeDataWareHouse="typeDataWareHouse"
                :modelId ='this.currentModel.id'
                :tableId='rawData.tableMsg.Id'
                :currentModel="currentModel"
              ></export-ddl>
            </el-tab-pane>
          </datablau-tabs>

        </el-tab-pane>

      </datablau-tabs>
    </div>
    <div v-show="editMode" class="bottom-tool"  :class="{'shadow':isOverflow && activeTab === 'column'}">
      <datablau-button
        v-if="editMode && writable && rawData.tableMsg.RawType !== 'View'"
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
import tableDetail from './tableDetail.js'
export default tableDetail
</script>
<style lang="scss" scoped="scoped">
  @import '../paneDetail';
  /deep/ .el-input__inner {
    border: 1px solid #ddd;
  }
  .table-content {
    .el-autocomplete /deep/ .el-input__inner {
      background: #FFFFFF;
      border-radius: 2px;
      &:hover {
        border-color: #409EFF;
      }
    }
  }
  #table-details {
    /deep/ .icon-tianjia:before {
    margin-right: 5px;
    font-size: 14px !important;
  }
  .tip-text {
    display: inline-block;
    font-size: 12px;
    line-height: 25px;
    color: #777;
    .iconfont {
      position: relative;
      top: 1px;
      margin-right: 3px;
      color: #999;
      font-size: 14px;
    }
  }
    /deep/ .el-tooltip{
      &.iconfont {
        color: #999;
        font-size: 14px;
      }
    }
    .is-edit {
      .udp {
      .datablau-tips {
          position: relative;
          top: -3.5px;
        }
      }
    }
    .udp {
      width: 90%;
      /deep/ .datablau-checkbox2 .el-checkbox__input.is-disabled + span.el-checkbox__label {
        color: #555;
      }
      /deep/ .el-input__inner:hover {
        border-color: #409EFF;
      }
      .datablau-select {
        width: 360px;
      }
      .datablau-input {
        width: 360px;
      }
      .datablau-tips {
        position: relative;
        top: -5.5px;
      }
      .property {
        margin-bottom: 6px;
        width: 100%;
        max-width:unset;
        min-height: unset;
        margin-right: 0;
        .value {
          width: unset;
        }
      }
      .property.thin {
        // margin-left: 131px;
        margin: 2px 0 10px 123px;
      }
      .label {
        width: 152px;
        font-weight: bold;
        min-height: 26px;
        line-height: 18px;
        margin-top: 8px;
        color: #555;
        padding-right: 4px;
      }
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
        color: #555;
      }
      &:hover {
        span {
          color: #409EFF;
        }
      }
    }
    .datablau-input /deep/ .el-textarea .el-textarea {
      max-height: 100px;
    }
    /deep/ .java-container {
      height: unset;
      .language-java {
        overflow: unset;
        height: unset;
      }
    }
    .udp.property {
      width: 100%;
      margin-right: 0;
      max-width: unset;
      display: block;
      line-height: 32px;
      display: flex;
      .value {
        padding-top: 16px;
        line-height: 15px;
        display: inline-block;
        width: unset;
        font-size: 12px;
        color: #555;
        max-width: 704px;
        word-break: break-all;
        &.edit {
          padding-top: 0;
          margin-top: 8px;
          display: flex;
          align-items: center;
        }
      }
      .label {
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        width: 152px;
        font-weight: bold;
        min-height: 26px;
        line-height: 18px;
        margin-top: 8px;
        color: #555;
        padding-right: 4px;
      }
    }
      #pane-udp {
        height: unset;
      }
      .code-generate {
        /deep/ .el-tabs--card .el-tabs__content {
          top: 36px;
        }
        /deep/ .datablau-tabs.datablau-tabs-card .el-tabs.el-tabs--card .el-tabs__header .el-tabs__nav .el-tabs__item {
          border: 1px solid #dddddd !important;

          line-height: 30px;
          position: relative;
          padding: 0 10px !important;
          height: 32px;
          line-height: 32px;

          &:nth-child(n+2) {
            border-left-color: transparent !important;
          }

          &:nth-of-type(1) {
            // border-left: 1px solid #dddddd !important;
          }

          &.is-active {
            border: 1px solid #409EFF !important;
          }
        }
        /deep/ .el-collapse {
          display: none;
        }
      }
      .table-content {
        position: absolute;
        top: 10px;
        left: 0;
        right: 0;
        bottom: 0;
        height: unset;
        &.table-box1 {
          top: 52px;
        }
        /deep/ .el-table__fixed::before {
          display: none;
        }
        .datablau-input /deep/ .el-input__inner {
          height: 28px;
          line-height: 28px;
        }
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
      .secondary-box {
        padding-top: 10px;
      }
    .new-title-box .secondary-box {
      .datablau-tips {
        position: relative;
        top: 1px;
        color: #999;
        display: inline-block;
        /deep/ .iconfont {
          font-size: 14px;
        }
      }
      .row {
        padding-top: 3px;
        .property.thin {
          line-height: 24px;
          width: 88px;
          .label {
            height: 24px;
            line-height: 24px;
            span {
              margin-right: 6px;
            }
          }
        }
        .property.broader {
          position: relative;
          top: 1px;
          height: 24px;
          font-size: 12px;
        }
        .property .value > div {
          height: 24px;
          line-height: 24px;
        }
        .property .value {
          font-size: 12px;
        }
      }
    }
    .content-box {
      top: 75px;
      /deep/ .el-tabs {
        top: 10px;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
      }
       .edit {
          /deep/ .el-tabs {
            top: 20px;

          }
        }
      .blue-tabs {
        position: unset !important;
        height: 100% !important;
        /deep/ .el-tabs__active-bar {
            background-color: #409EFF;
        }
      }
      &.is-edit {
        bottom: 50px;
      }
      /deep/ .el-tabs__item {
        font-size: 12px;
      }
    }
    /deep/ .el-tabs__header {
      padding-left: 0;
      padding-right: 0;
    }
    .is-edit {
      top: 37px;
    }
    /deep/ .el-tabs__item {
      border: unset;
    }
    .label {
      margin-right: 10px;
      text-align: right;
      width: 54px;
      line-height: 32px;
      height: 32px;
      font-size: 12px;
      font-weight: 500;
      color: #555;
      font-weight: bold;
    }
    .top-area {
      .value {
        width: 300px;
      }
    }
  }
  .new-title-box {
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
  .top-area {
    width:90%;
    width: 1000px;
  }
  .top-area {
    .datablau-input {
      width: 100%;
    }
    .property {
      // height:3em;
      // line-height:2em;
      width: 364px;
      margin-right: 40px;
      min-height: unset;
      height: 32px;
      line-height: 32px;
      /deep/ .label.required::before {
        position: unset;
          left: 11px;
        }
         .label.long {
          width: 60px !important;
        }
       &.long {
          width: 374px;
        }
    }
  }
  .container {
    margin-left: 0;
  }
  .container.overflow {
    /*padding:10px;*/
    padding:15px 20px;
    overflow-x:hidden;
    overflow-y:auto;
    position:absolute;top:0px;left:0;bottom:0;right:0px;
    &.is-edit {
      top: 14px;
    }
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

</style>
<style
  lang="scss"
>
  #table-details {
    .el-tooltip__popper {
      max-width:600px;
    }
    .el-autocomplete-suggestion li {
       padding: 0 0px;
    }
    .el-tabs__content {
      overflow: auto;
      top: 26px;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .el-tab-pane {
      padding-top: 2px;
      height: 100%;
      &.index {
        padding-top: 20px;
      }
    }
    /* .el-input {
      width: 230px;
    } */
  }
  .tableDetailField{
    .el-table, .el-table__expanded-cell{
      background: #fffdff;
    }
    .el-table th.el-table__cell{
      background: #fffdff;
    }
    .el-table tr{
      background: #fffdff;
    }
    .el-table td.el-table__cell, .el-table th.el-table__cell.is-leaf{
      border-bottom: 1px solid #E5E5E5;
    }
    .el-autocomplete{
      .el-input__inner{
        background: #fff !important;
      }
    }
  }
</style>
