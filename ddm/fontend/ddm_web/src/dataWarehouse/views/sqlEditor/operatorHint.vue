<template>
  <div class="edit-operator-wrapper" :class="isThemeBlack ? 'black-theme': 'white-theme'" v-show="!currentFileType.hidRightMenu">
    <!--添加变量弹窗-->
    <datablau-dialog
      :visible.sync="variableDialog"
      title="添加变量属性"
      width="800px"
      :blackTheme="true"
      height="530px">
      <div class="content variableLog">
        <div v-for="(item, index) in variable" :key="'a' +index">
          <datablau-input  :themeBlack="true" placeholder="请输入变量名" clearable v-model="item.prop" class="nameInput" style="width:180px"></datablau-input>
<!--          <datablau-input placeholder="选择类型" clearable v-model="item.type" class="nameInput" style="width:240px"></datablau-input>-->
          <datablau-select
            v-model="item.type"
            filterable
            style="width: 180px; display: inline-block;margin-left:20px"
            :themeBlack="true"
          >
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
          <datablau-input :themeBlack="true" :placeholder="item.type !== 'LIST' ? '请输入值':'[参数1,参数2]'" clearable v-model="item.value" class="variableInput" style="width:180px"></datablau-input>
          <datablau-button
            type="icon"
            @click="handleClick(index)"
          >
            <i class="el-icon-delete"></i>
          </datablau-button>
          <datablau-button
            type="icon"
            @click="handleAdd()"
            v-if="index === variable.length-1"
          >
            <i class="iconfont icon-tianjia"></i>
          </datablau-button>
        </div>
      </div>
      <span slot="footer">
      <datablau-button :themeBlack="true" type="secondary" @click="variableDialog = false">取 消</datablau-button>
      <datablau-button :themeBlack="true" type="primary" @click="submitAddVariable" :disabled="!!btnFlag">
        确 定
      </datablau-button>
    </span>
    </datablau-dialog>
    <datablau-dialog
    :visible.sync="showUdpSelector"
    title="添加扩展属性"
    width="800px"
    height="530px"
    append-to-body
    custom-class="setting"
    :blackTheme="true"
  >
    <div class="content">
      <!-- <div class="udp-tool">
      </div> -->
      <datablau-table
        v-loading="udpLoading"
        @selection-change="handleUdpChange"
        :data="allUdps"
        data-selectable
        :checkDisabledObj="checkDisabledObj"
        show-overflow-tooltip
        :element-loading-background="isThemeBlack && 'rgba(0,0,0,0.6)'"
        :themeBlack="true"
        >
        <el-table-column
          prop="name"
          label="属性名称"
          show-overflow-tooltip
          >
        </el-table-column>
        <el-table-column
          prop="groupName"
          label="属性分组"
          show-overflow-tooltip
          >
        </el-table-column>
        <el-table-column
          prop="udpType"
          label="属性类型"
          show-overflow-tooltip
          width="100"
          >
          <template slot-scope="scope">
          <span :class="getTypeClass(scope.row.udpType)" class="type-info">
            {{ valueTypeFormatter(scope.row) }}
          </span>
        </template>
        </el-table-column>
      </datablau-table>

    </div>
    <span slot="footer">
      <datablau-button :themeBlack="true" type="secondary" @click="showUdpSelector = false">取 消</datablau-button>
      <datablau-button :themeBlack="true" type="primary" @click="submitAddUdp" :disabled="checkedUdp.length === 0">
        确 定
      </datablau-button>
    </span>
  </datablau-dialog>
    <datablau-dialog
      :title="generate ? '生成SQL' : '生成程序'"
      :visible.sync="newFileModel"
      :modal-append-to-body="true"
      :height="next ? '520px' : '320px'"
      :width="next ? '860px' : '560px'"
      :blackTheme="true"
    >
      <div v-if="next" style="height: 369px">
        <datablau-tabs :tab-position="'left'" class="tabsSql" v-model="sqlTabs"
          @tab-click="sqlTabsChange"
          :themeBlack="true"
        >
          <el-tab-pane label="ETL DML" name="sqlETL"></el-tab-pane>
          <el-tab-pane label="SQL映射" name="sqlMapping"></el-tab-pane>
          <el-tab-pane label="SELECT" name="sqlSelect"></el-tab-pane>
          <el-tab-pane label="SQL DDL" name="sqlCreate"></el-tab-pane>
          <el-tab-pane label="Flink DDL" name="flinkSqlCreate"></el-tab-pane>
        </datablau-tabs>
        <monaco
          v-loading="loading"
          :element-loading-background="'rgba(0,0,0,0.6)'"
          ref="editor"
          :opts="monacoOpts"
          :isDiff="false"
          class="monacoEdit"
          style="height: 100%"
        ></monaco>
      </div>
      <datablau-form size="small" label-width="75px" ref="fileForm" :model="fileForm" v-else :rules="formRules" >
        <el-form-item
          label="文件名"
          prop="newFileName">
          <datablau-input :themeBlack="true" style="width:100%" v-model="fileForm.newFileName" placeholder="请输入文件名"></datablau-input>
        </el-form-item>
        <el-form-item
          label="目录选择"
          prop="fileName">
          <datablau-cascader
            :options="fileList"
            v-model="fileForm.fileName"
            ref="cascader"
            style="width: 100%;"
            :props="{ checkStrictly: true ,children: 'childList',label: 'name', value: 'id'}"
            @change="changeCascader"
            :themeBlack="true"
            clearable></datablau-cascader>
          <!--<datablau-select
            v-model="fileForm.fileName"
            filterable
            style="width: 100%;"
            reda
          >
            <el-option
              v-for="item in fileList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>-->
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button :themeBlack="true" type="important" v-show="next"  @click="nextBtn">
          下一步
        </datablau-button>
        <datablau-button :themeBlack="true" type="strong"  v-show="prev"   @click="prevBtn">
          上一步
        </datablau-button>
        <datablau-button :themeBlack="true" type="important" v-show="prev"    @click="addNewFile">
          确定
        </datablau-button>
        <datablau-button :themeBlack="true" type="strong" v-show="next"    @click="copyFile">
          复制
        </datablau-button>
        <datablau-button :themeBlack="true" @click="closeFileLog">
          取消
        </datablau-button>

      </div>
    </datablau-dialog>
    <mata-detail :variableDialogMeta="variableDialogMeta" :metaObj="metaObj" @variableDialogMetaEmit="variableDialogMetaEmit "></mata-detail>
    <!--<div class="tab-to-expand-wrapper" :style="{right: shrink?'19px':'304px'}" @mouseenter="expandActive=true" @mouseleave="expandActive=false">
      <img class="tab-to-expand-btn" :src="expandActive? shrinkActiveImg: shrinkImg" alt="" v-show="shrink" @click="toExpand" />
      <img class="tab-to-expand-btn" :src="expandActive? expandActiveImg: expandImg" alt="" v-show="!shrink" @click="toShrink" />
    </div>-->
    <ul class="ulContent" >
      <li v-show="nowTab === 'asset'" class="left-wrapper-pane">
        <div>
          <datablau-select
              filterable
              clearable
              class="select-panel"
              v-model="dataSourceId"
              placeholder="请选择数据源"
              isIcon="iconfont icon-shujuyuan all lightColoW"
              @change="getChemaList()"
              :disabled="currentFileType.type === 'script'"
              :themeBlack="true"
          >
            <el-option
                v-for="ds in dataSourceList"
                :key="ds.id"
                :label="ds.sourceName"
                :value="ds.id">
              <div slot="default">
                <database-type style="display: inline-block" :size="24"
                               :value="ds.type" :hideLabel="true">
                </database-type>
                {{ ds.sourceName }}
                <span class="tagName">{{ ds.tagName }}</span>
              </div>
            </el-option>
          </datablau-select>
          <div class="schemaSelectBox">
            <datablau-select
              filterable
              clearable
              class="select-panel"
              isIcon="iconfont icon-schema lightColoW"
              v-model="schemaName"
              @change="changeSchemaName()"
              :disabled="currentFileType.type === 'script'"
              :themeBlack="true"
              placeholder="请选择schema">
              <el-option
                v-for="i in schemaList"
                :key="i"
                :label="i"
                :value="i">
              </el-option>
            </datablau-select>
            <datablau-tooltip
              content="刷新数据源"
              placement="bottom"
              effect="dark"
            >
              <datablau-button class="icon-refresh iconfont refreshBox" :disabled="!dataSourceId || !schemaName" style="display: inline-block" type="icon" @click="refreshTable" ></datablau-button>
            </datablau-tooltip>
          </div>
          <div style="display: flex">
            <datablau-input
            style="margin:0 9px 8px"
              v-model="searchName"
              :iconfont-state="true"
              :placeholder="placeText"
              @input="searchNameData"
              @clear="searchNameData"
              :themeBlack="true"
              clearable
            ></datablau-input>
            <datablau-dropdown class="sddd"  trigger="click" @command="handleCommand" style="margin-top: 8px">
              <div class="el-dropdown-link" style="width: 35px">
                 <i :class="linkText" style="margin-right:5px"></i>
                 <i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>
                </div>
              <el-dropdown-menu slot="dropdown" class="dropThemeBlack">
                <el-dropdown-item v-for="item in dropdownItem" :key="item.label" :command="item.command">
                  <i :class="item.type" class="dropdownIcon"></i>{{item.label}}
                </el-dropdown-item>
              </el-dropdown-menu>
            </datablau-dropdown>
          </div>
          <div v-show="nothingData" style="text-align: center">暂无数据</div>
          <div v-selectLazyLoad="lazyloading" class="asset-tree hightNum" v-show="tableData.length" >
            <db-tree
              :data="tableData"
              node-key="name"
              ref="tree"
              lazy
              :default-expanded-keys="expandKeys"
              :expand-on-click-node="false"
              :props="defaultProps"
              :load="loadNode"
              :data-supervise="(authPro['PROCEDURE_EDIT']||authPro.isAdmin) && currentFileType.type !== '' && currentFileType.type !== 0 && currentFileType.type !== 'script' ?true:false"
              :data-icon-function="dataIconFunction"
              :right-info-formatter="treeRightInfoFormatter"
              :data-options-function="dataOptionsFunction"
              right-info-width="40%"
              :show-overflow-tooltip="true"
              @node-click="nodeClick"
              :themeBlack="true"
            ></db-tree>
            <div v-if="!loadDisabled" style="text-align: center;padding: 10px;"><i class="el-icon-loading"></i> 加载中...</div>
          </div>
        </div>
      </li>
      <li v-show="nowTab === 'udp'"  class="left-wrapper-pane udp-part" v-loading="udpLoading">
        <div>
          <div v-show="currentFileType.type !== 0">
            <div style="margin-bottom:10px;overflow: hidden">

              <datablau-detail-subtitle :themeBlack="true" title="扩展属性" mt="0px" mb="0px"></datablau-detail-subtitle>
              <datablau-button
                type="icon"
                size="mini"
                class="iconfont icon-tianjia"
                style="float:right;margin-top:-3px"
                @click="handleAddUdp"
              >
              </datablau-button>
            </div>
            <div class="label-part">
                  <div
                    class="label-part-content"
                    v-for="(udps,key, index) in udpMap"
                    :key="index"
                  >
                    <p class="secondBox-title">{{ key }}</p>
                    <ul>
                      <li v-for="(valueIndex, index) in udps " :key="index">
                        <div class="title-name">
                          <img
                            src="@/assets/images/metadataIcon/udpdark.svg"
                            alt=""
                          />
                          <datablau-tooltip :content="valueIndex.name" placement="bottom" :disabled='valueIndex.name.length<=10'>
                            <span>{{ valueIndex.name.length > 10 ? valueIndex.name.substring(0,10) + '…': valueIndex.name}}</span>
                          </datablau-tooltip>

                        </div>
                        <div class="udpBox" >
                          <div class="valueBox" v-if="!valueIndex.editMode">
                            {{ valueIndex.value }}
                            <span v-show="!valueIndex.value" class="empty">暂无数据</span>
                            <datablau-button
                              type="icon"
                              size="mini"
                              class="edit-btn iconfont icon-bianji"
                              @click="startEdit(valueIndex, index)"
                            >
                            </datablau-button>
                          </div>
                          <div class="editInputBox" v-else>
                            <datablau-input
                              v-if="
                                valueIndex.editMode === 'STRING' ||
                                valueIndex.editMode === 'NUM_RANGE'
                              "
                              class="editInput"
                              style="height: 24px"
                              size="mini"
                              clearable
                              maxlength="100"
                              v-model="valueIndex.udpValue"
                              :themeBlack="true"
                            ></datablau-input>
                            <datablau-input
                              v-else-if="valueIndex.editMode === 'NUM'"
                              size="mini"
                              maxlength="100"
                              clearable
                              class="numBox editInput"
                              style="height: 24px"
                              v-model.number="valueIndex.udpValue"
                              :themeBlack="true"
                            ></datablau-input>
                            <datablau-select
                              v-else-if="valueIndex.editMode === 'BOOL'"
                              size="mini"
                              class="editInput"
                              style="height: 24px"
                              v-model="valueIndex.udpValue"
                              clearable
                              :themeBlack="true"
                            >
                              <el-option value="true" label="true"></el-option>
                              <el-option value="false" label="false"></el-option>
                            </datablau-select>
                            <datablau-select
                            v-else-if="valueIndex.editMode === 'ENUM'"
                            size="mini"
                            style="height: 24px"
                            v-model="valueIndex.udpValue"
                            clearable
                            class="editInput"
                            :themeBlack="true"
                          >
                            <el-option
                              v-for="(o, i) in valueIndex.optionsUdp"
                              :value="o"
                              :label="o"
                              :key="i"
                            ></el-option>
                          </datablau-select>
                          </div>
                          <div>
                            <datablau-button
                              v-show="valueIndex.editMode"
                              type="text"
                              size="mini"
                              @click="save(valueIndex, index)"
                            >
                              {{ $t('common.button.save') }}
                            </datablau-button>
                            <datablau-button
                              v-show="valueIndex.editMode"
                              type="text"
                              size="mini"
                              @click="cancel(valueIndex)"
                            >
                              {{ $t('common.button.cancel') }}
                            </datablau-button>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
            <div style="margin-bottom:10px ;overflow: hidden">
              <datablau-detail-subtitle :themeBlack="true" title="变量属性" mt="0px" mb="0px"></datablau-detail-subtitle>
              <datablau-button
                type="icon"
                size="mini"
                class="iconfont icon-tianjia"
                style="float:right;margin-top:-3px"
                @click="handleAddVariable"
              >
              </datablau-button>
            </div>
            <div class="variable">
              <div v-for="item in $store.state.variable[currentFileType.id]" :key="item.prop">
                <img
                  src="@/assets/images/metadataIcon/udpdark.svg"
                  alt=""
                  style="margin-right: 7px"
                />
                <datablau-tooltip :content="item.prop" placement="bottom" :disabled='item.prop.length<=10'>
                  <span>{{ item.prop.length > 10 ? item.prop.substring(0,10) + '…': item.prop}}</span>
                </datablau-tooltip>
                ({{item.type}})
                <div class="valueBox">
                  {{item.value}}
                </div>
                <!--<span>变量名：{{item.name}}</span>
                <span style="margin-left: 20px">值：{{item.value}}</span>-->
              </div>
            </div>
            <div v-show="udfShow">
            <div class="udfList"  style="margin-bottom:10px;overflow: hidden">
              <datablau-detail-subtitle :themeBlack="true" title="UDF函数" mt="0px" mb="0px"></datablau-detail-subtitle>
            </div>
            <datablau-select
            v-model="funcNames"
            clearable
            multiple
            style="width: 100%;height: 24px"
            size="mini"
            class="funNamesInput"
            placeholder="选择UDF函数"
            @change="funNamesBlur"
          >
            <el-option
              v-for="item in udfList"
              :key="item.funcName"
              :label="item.funcName"
              :value="item.funcName"
            ></el-option>
          </datablau-select>
            <div class="funcNamesList">
              <datablau-tag closable @close="closeFunc(v)" v-for="v in funcNames" :key="v">
                <datablau-tooltip :content="v" placement="bottom" :disabled='v.length<=10'>
                  <span>{{ v.length > 10 ? v.substring(0,10) + '…': v}}</span>
                </datablau-tooltip>
              </datablau-tag>
            </div>
          </div>
          </div>
          <!--工作流文件引用-->
          <div v-if="!hiddenBtn">
            <datablau-detail-subtitle :themeBlack="true" title="引用"></datablau-detail-subtitle>
            <el-collapse v-for="(val, key) in referenceList" :key="key" class="reference">
              <el-collapse-item :title="`${val.processChildName[0].split('/')[0]}(${val.processChildName.length})`" name="key">
                  <div v-for="(v, index) in val.processChildName" :key="v+index" class="refereBox" @click="clickReference(val.processId)">
                    <datablau-tooltip class="item" effect="dark" content="查看工作流" placement="bottom">
                      <span>{{index+1}}. {{v.split('/')[1]}}</span>
                    </datablau-tooltip>
                  </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </li>
      <li v-show="nowTab === 'setting'"  class="left-wrapper-pane">
        <div class="sqlSttingBox">
          <datablau-detail-subtitle :themeBlack="true" title="设置" mt="10px" mb="8px"></datablau-detail-subtitle>
          <div class="row">
            <span>超时时间（秒）
            <datablau-tooltip
              popper-class="tooltipBox"
              content="接口查询时间设置。当此项不填具体值时，设置为等待接口结果返回"
              placement="bottom"
              effect="dark"
            >
              <i
                class="icon-tips iconfont settingIcon"
                type="icon"
              >
              </i>
            </datablau-tooltip>
          </span>
            <datablau-input
              v-model="timeout"
              @blur="sqlSettingMethod"
              type="number"
              class="minInput"
              clearable
              :themeBlack="true"
            ></datablau-input>
          </div>
          <div class="row">
             <span>
            返回行数
            <datablau-tooltip
              popper-class="tooltipBox"
              content="限制查询结果返回的行数。当此项不填具体值时，设置为最大9999"
              placement="bottom"
              effect="dark"
            >
              <i
                class="icon-tips iconfont settingIcon"
                type="icon"
              >
              </i>
            </datablau-tooltip>
          </span>
            <datablau-input
              v-model="sqlNum"
              @blur="sqlSettingMethod"
              type="number"
              class="minInput"
              :themeBlack="true"
              clearable
            ></datablau-input>
          </div>

        </div>
      </li>
    </ul>
    <ul class="right-wrapper" >
      <li class="navigator-item" @click.stop="clickTab('asset')" :class="{active: nowTab === 'asset'}" v-if="!hiddenBtn">
        <div class="iconfont icon-biao"></div>
        <div style="margin-top: 8px;">资<br/>产</div>
      </li>
      <li class="navigator-item" @click.stop="clickTab('udp')" :class="{active: nowTab === 'udp'}" v-if="currentFileType.type !== '' && currentFileType.type !== 'script' && currentFileType.type !== 0 && procedure && currentFileType.temporarilyFile !== true">
        <div class="iconfont icon-menu-ztml"></div>
        <div style="margin-top: 8px;">属<br/>性</div>
      </li>
      <li class="navigator-item" @click.stop="clickTab('setting')" :class="{active: nowTab === 'setting'}" v-if="!hiddenBtn && procedure && currentFileType.type !== '' && currentFileType.type !== 'script' && currentFileType.type !== 0 && currentFileType.temporarilyFile !== true">
        <div class="iconfont icon-shezhi"></div>
        <div style="margin-top: 8px;">设<br/>置</div>
      </li>
    </ul>
    <div v-if="dataProbeDialog">
      <dataProbeLog
        :dataProbeDialog="dataProbeDialog"
        :columnMapping="columnMapping"
        :threeIdName="threeIdName"
        @closeLog="closeLog"
        :preview="preview"
      ></dataProbeLog>
    </div>
    <div class="contextMenu" v-if="offsetY" :style="{top:offsetY, left:offsetX}">
      <ul>
        <li v-for="(item, i) in contexMenu" :key="item.id+i" @click="nodeClick(item)">{{item.name}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import HTTP from '@/dataWarehouse/resource/http'
import shrinkImg from '@/assets/images/mxgraphEdit/shrink.svg'
import shrinkActiveImg from '@/assets/images/mxgraphEdit/shrink-active.svg'
import expandImg from '@/assets/images/mxgraphEdit/expand.svg'
import expandActiveImg from '@/assets/images/mxgraphEdit/expand-active.svg'
import databaseType from '@/components/common/DatabaseType.vue'
import dataProbeLog from '@/dataWarehouse/views/sqlEditor/dataProbeLog'
import monaco from './monaco.vue'
import dbTree from '@/views/modelLibrary/tree/DatablauTree.vue'
import { mapState } from 'vuex'
import mataDetail from '@/dataWarehouse/views/sqlEditor/mataDetail.vue'
export default {
  props: {
    hintW: {},
    testDataSource: {
      type: [String, Number, Array]
    },
    authPro: {
      type: Object
    },
    branchName: {
      type: String,
      default: 'master'
    }
  },
  data () {
    return {
      monacoContent: '',
      fileForm: {
        newFileName: '',
        fileName: []
      },
      formRules: {
        newFileName: { required: true, message: '请输入文件名', trigger: 'blur' },
        fileName: { required: true, message: '请选择目录', trigger: 'blur' }
      },
      fileList: [],
      shrink: false,
      newFileModel: false,
      dataProbeDialog: false,
      preview: false,
      columnMapping: {},
      shrinkImg,
      shrinkActiveImg,
      expandImg,
      expandActiveImg,
      expandActive: false,
      nowTab: 'asset',
      dataSourceList: [],
      dataSourceId: '',
      schemaList: [],
      schemaName: '',
      tableData: [],
      expandKeys: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf'
      },
      getTablesCache: this.getTables,
      getColumnsCache: this.memoize(this.getColumns),
      width: 304,

      udpLoading: false,
      showUdpSelector: false,
      allUdps: [],
      checkedUdp: [],
      udpMap: [],
      udpValue: '',
      showUdpEdit: true,
      id: this.$route.query.projectId,
      checkDisabledObj: {
        id: []
      },
      variableDialog: false,
      variable: [{ prop: '', value: '', type: 'VARCHAR' }], // 变量名list
      timeout: 1800, // 超时时间
      sqlNum: 10,
      udfList: [],
      funcNames: [],
      searchName: '',
      pageSizeTables: 40,
      currentPageTables: 1,
      totalItems: 0,
      loadDisabled: false,
      tableDataLoading: true,
      nothingData: false,
      typeList: [
        { label: 'VARCHAR', value: 'VARCHAR' },
        { label: 'INTEGER', value: 'INTEGER' },
        { label: 'LONG', value: 'LONG' },
        { label: 'FLOAT', value: 'FLOAT' },
        { label: 'DOUBLE', value: 'DOUBLE' },
        { label: 'DATE', value: 'DATE' },
        { label: 'TIME', value: 'TIME' },
        { label: 'TIMESTAMP', value: 'TIMESTAMP' },
        { label: 'BOOLEAN', value: 'BOOLEAN' },
        { label: 'LIST', value: 'LIST' }
      ],
      tagMap: [], // 标签列表
      referenceList: [],
      hiddenBtn: false,
      prev: false,
      next: true,
      generate: false,
      procedure: true,
      sqlTabs: 'sqlETL',
      sourceListType: {
        hive: 1,
        mysql: 2,
        postgresql: 3,
        oracle: 4,
        starrocks: 5,
        sqlserver: 6,
        flinksql: 7,
        flinkjar: 8,
        java: 9,
        python: 10,
        gbase: 11,
        'transwarp-inceptor': 12,
        shell: 13,
        file: 14,
        migration: 15,
        clickhouse: 16,
        oceanbase: 17,
        db2: 18
      },
      tableName: '',
      sqlObj: {},
      dropdownItem: [
        { label: '表', command: 'table', type: 'iconfont icon-biao' },
        { label: '存储过程', command: 'procedure', type: 'iconfont icon-chucun' },
        { label: '函数', command: 'func', type: 'iconfont icon-hanshu' },
        { label: '视图', command: 'view', type: 'iconfont icon-shitu' }
      ],
      command: 'table',
      offsetX: 0,
      offsetY: 0,
      contexMenu: [],
      loading: false,
      variableDialogMeta: false,
      metaObj: {}
    }
  },
  mounted () {
    this.getUdfList()
    this.getTagMap()
    this.$bus.$on('viewProcedure', (item) => {
      if (item.name.indexOf('.') !== -1) {
        let ary = item.name.split('.')
        item.schemaName = ary[0]
        item.name = ary[1]
      }
      item.modelId = item.modelId || this.dataSourceId
      item.schemaName = item.schemaName || this.schemaName
      if (!item.modelId || !item.schemaName) {
        this.$datablauMessage.warning('请先选择数据源和schema')
        return
      }
      let dbType = this.dataSourceList.find(item => item.modelId === this.dataSourceId)?.type
      item.dbType = dbType
      item.name && this.$http.get(`${this.$dddUrl}/datatype/${item.modelId}/${item.schemaName}/raw/procedure?pageSize=${50}&currentPage=1&search=${item.name}`)
        .then(res => {
          if (res.data.content.length) {
            this.offsetY = item.offsetY + 'px'
            this.offsetX = item.offsetX + 'px'
            let ary = res.data.content.map(i => ({
              name: i,
              type: 'procedure',
              id: item.schemaName + i,
              modelId: item.modelId,
              schemaName: item.schemaName,
              dbType: item.dbType
            }))
            this.contexMenu = ary
          } else {
            this.$datablauMessage.warning('暂无存储过程')
          }
        })
      $(document).click(e => { this.offsetY = 0 })
      // this.nodeClick(item)
    })
  },
  beforeDestroy () {
    this.$bus.$off('viewProcedure')
  },
  components: {
    databaseType,
    dataProbeLog,
    monaco,
    dbTree,
    mataDetail
  },
  computed: {
    linkText () {
      let className = this.dropdownItem.find(item => item.command === this.command)
      return className.type
    },
    placeText () {
      let className = this.dropdownItem.find(item => item.command === this.command)
      return className.label + '名称'
    },
    ...mapState({
      currentFileType: (state) => {
        return state.ddtStore.currentFileType || {}
      }
    }),
    isThemeBlack () {
      return (localStorage.getItem('editorTheme') || window.setting.editorTheme) === 'black'
    },
    btnFlag () {
      return this.variable.find(item => (item.prop && !item.value) || (!item.prop && item.value))
    },
    udfShow () {
      let obj = this.dataSourceList.find(item => item.modelId === this.dataSourceId)
      if (obj && (obj.type !== 'HIVE')) {
        // 删掉store 中hive函数
        this.$store.commit('delFunNames', this.currentFileType.id)
        this.$bus.$emit('setItemChanged', this.currentFileType.id)
      }
      return obj && (obj.type === 'HIVE')
    },
    monacoOpts () {
      return {
        value: this.monacoContent,
        origin: '',
        readOnly: true,
        theme: 'vs-dark'
      }
    },
    threeIdName () {
      return {
        tableName: this.tableName,
        dataSourceId: this.dataSourceId,
        schemaName: this.schemaName
      }
    }
  },
  watch: {
    dropdownItem: {
      handler () {
        if (!this.dropdownItem.find(item => item.selected)) {
          this.dropdownItem.forEach(item => (item.selected = true))
        }
      },
      deep: true
    },
    hintW (val) {
      this.width = val
    },
    dataSourceId () {
      this.$bus.$emit('sendAssetData', this.dataSourceId, '')
      this.tableName = ''
    },
    schemaName (val) {
      if (val === '') {
        this.searchName = ''
        this.tableData = []
      }
      this.tableName = ''
      if (val) {
        this.tableData = []
        this.searchName = ''
        this.currentPageTables = 1
        if (this.command === 'table') {
          this.handleTableData()
        } else {
          this.getProcedure()
        }
        this.$bus.$emit('sendAssetData', this.dataSourceId, this.schemaName)
      }
    },
    testDataSource () {
    },
    currentFileType (val) {
      if (val.type === 'procedure' || val.type === 'columnDetails' || val.type === 'view' || val.type === 'func') {
        this.procedure = false
        return
      }
      this.procedure = true
      if (val.type === 0) {
        this.nowTab = 'udp'
        this.getReferenceList()
        this.hiddenBtn = true
      } else {
        this.nowTab = 'asset'
        this.hiddenBtn = false
      }
      let sqlSetting = this.$store.state.ddtStore.sqlSetting[this.currentFileType.id]
      this.sqlNum = sqlSetting?.sqlNum || 10
      this.timeout = sqlSetting?.timeout || 1800
      this.$bus.$emit('sqlSetting', { timeout: this.timeout, sqlNum: this.sqlNum })
      this.dataSourceId = this.currentFileType.dataBaseId
      this.schemaName = this.currentFileType.schemaName ? this.currentFileType.schemaName : ''
      if (!this.currentFileType.schemaName) {
        this.tableData = []
      }
      this.dataSourceId && this.$bus.$emit('dataSourceIdChange', this.dataSourceId, this.schemaName)
      if (!val.codeDetailId) return
      // 使用当前文件保存的 数据源
      this.$http.get(this.$dddUrl + '/service/code/file/' + val.codeDetailId + `?projectId=${this.id}`).then(res => {
        if (!res.data.modelId) {
          this.dataSourceId = this.testDataSource[0]
          this.dataSourceList.forEach(element => {
            if (element.id === this.dataSourceId) {
              if (element.type === 'ORACLE' || element.type === 'POSTGRESQL') {
                this.schemaName = element.schemas.split(';')[0]
              } else {
                this.schemaName = element.database.split(';')[0]
              }
            }
          })
        } else {
          this.dataSourceId = res.data.modelId
          this.schemaName = res.data.database
        }
        this.dataSourceId && this.$bus.$emit('dataSourceIdChange', this.dataSourceId, this.schemaName)
        this.getChemaList('', this.schemaName)
      }).catch(e => {
        this.$showFailure(e)
      })
    }
  },
  methods: {
    variableDialogMetaEmit () {
      this.variableDialogMeta = false
    },
    handleCommand (command) {
      this.command = command
      if (!this.dataSourceId || !this.schemaName) {
        return
      }
      if (command === 'table') {
        this.currentPageTables = 1
        this.tableData = []
        this.handleTableData()
      } else {
        this.tableData = []
        this.currentPageTables = 1
        this.getProcedure()
      }
    },
    // 获取存储过程
    getProcedure () {
      let mapData = []
      this.tableDataLoading = true
      this.$http.get(`${this.$dddUrl}/datatype/${this.dataSourceId}/${this.schemaName}/raw/${this.command}?pageSize=${this.pageSizeTables}&currentPage=${this.currentPageTables}&search=${this.searchName}`)
        .then(res => {
          let dbType = this.dataSourceList.find(item => item.modelId === this.dataSourceId)?.type
          this.totalItems = res.data.totalItems
          mapData = res.data.content.map(i => ({
            name: i,
            type: this.command,
            leaf: true,
            id: i,
            modelId: this.dataSourceId,
            schemaName: this.schemaName,
            dbType
          }))
          mapData.forEach(element => {
            this.tableData.push(element)
          })
          this.tableDataLoading = false
          mapData.length && (this.loadDisabled = true)
          !mapData.length && (this.loadDisabled = false)
          if (this.tableData.length !== 0) {
            this.nothingData = false
          } else {
            this.nothingData = true
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 树点击
    async nodeClick (data, node) {
      if (data.type !== 'table' && data.type !== 'column') {
        let res = await this.getProcedureDetail(data.name)
        data.content = res.data?.data
        if (!res.data.data && this.command === 'procedure') {
          this.$datablauMessage.warning('暂无存储过程')
          return
        }
        this.$emit('showProcedureFile', data)
        this.offsetY = 0
      }
    },
    getProcedureDetail (name) {
      return this.$http.get(`${this.$dddUrl}/datatype/${this.dataSourceId}/${this.schemaName}/${name}/getContent/${this.command}`)
    },
    // 获取数据源标签
    getTagMap () {
      this.$http
        .post(this.$baseUrl + '/tags/getAllTags')
        .then(res => {
          const map = {}
          let datazoneTag = {}
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(item => {
              map[item.tagId] = item
              if (item.name === '数据区域') {
                datazoneTag = item
              }
            })
            res.data.forEach(item => {
              if (item.parentId && map[item.parentId]) {
                let parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              }
            })
            this.tagMap = map
            this.getDataSource()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    searchNameData () {
      if (!this.searchName.length || this.searchName.length >= 2) {
        this.tableData = []
        // this.getTables(this.dataSourceId, this.schemaName)
        this.currentPageTables = 1
        if (this.command === 'table') {
          this.handleTableData()
        } else {
          this.getProcedure()
        }
      }
    },
    // 获取工作流文件应用
    getReferenceList () {
      // console.log(this.currentFileType)
      (this.currentFileType.codeDetailId || this.currentFileType.id) && HTTP.getReferenceList(this.currentFileType.codeDetailId || this.currentFileType.id)
        .then(res => {
          // console.log(res)
          this.referenceList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    clickReference (key) {
      this.$bus.$emit('interfaceSuccess', Number(key))
      this.$store.commit('ddtStore/setCurrentFileType', {
        type: 0,
        id: null,
        hidRightMenu: true
      })
      this.$emit('changeDialogWidth', 24)
    },
    // 更新表单
    refreshTable () {
      HTTP.refreshTable({ modelId: this.dataSourceId, schemaName: encodeURIComponent(this.schemaName) })
        .then(res => {
          if (res) {
            this.tableData = []
            this.command = 'table'
            this.currentPageTables = 1
            this.getChemaList('noRefresh')
          } else {
            this.$datablauMessage.warning('刷新失败')
          }
        }).catch(e => {
          this.$showFailure(e)
        })
    },
    lazyloading () {
      if (this.totalItems > this.tableData.length && this.loadDisabled === true) {
        this.currentPageTables++
        if (this.command === 'table') {
          this.handleTableData()
        } else {
          this.getProcedure()
        }
        this.loadDisabled = false
      }
    },
    getUdfList () {
      this.$http.get(`/dolphinscheduler/resources/udf-func/list?type=HIVE`).then(res => {
        this.udfList = res.data.data
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    sqlSettingMethod () {
      if (this.sqlNum > 9999) {
        this.sqlNum = 9999
      }
      this.$store.commit('ddtStore/setSetting', { id: this.currentFileType.id, timeout: this.timeout, sqlNum: this.sqlNum })
      this.$bus.$emit('sqlSetting', { timeout: this.timeout, sqlNum: this.sqlNum })
    },
    getTypeClass (data) {
      return data.toLowerCase()
    },
    valueTypeFormatter (row) {
      const typeData = row.udpType || ''
      switch (row.udpType) {
        case 'STRING':
          return this.$t('meta.DS.udp.valueType.string')
        case 'NUM':
          return this.$t('meta.DS.udp.valueType.num')
        case 'NUM_RANGE':
          return this.$t('meta.DS.udp.valueType.numRange')
        case 'ENUM':
          return (
            this.$t('meta.DS.udp.valueType.enum') +
              '(' +
              row.udpValConstant +
              ')'
          )
        case 'BOOL':
          return this.$t('meta.DS.udp.valueType.boolean')
        default:
          return row.udpType
      }
    },
    startEdit (u, index) {
      if (u.udpType === 'ENUM') {
        this.$set(u, 'optionsUdp', u.udpValConstant.split(/,|，/g))
      }
      this.$set(u, 'editMode', u.udpType)
      this.$set(u, 'showUdpEdit', false)
      this.$set(u, 'udpValue', u.value || '')
      // u.udpValue = _.cloneDeep(u.value || '')
      // this.showUdpEdit = false
    },
    getCurrentUdp () {
      if (this.currentFileType.id === undefined) {
        return
      }
      this.udpLoading = true
      this.$http.get(`${this.$dddUrl}/service/udp/getProject/udp/${this.id}/${this.currentFileType.id}`)
        .then(res => {
          this.udpMap = _.cloneDeep(res.data.data)
          let result = []
          Object.keys(this.udpMap).forEach(item => {
            result = result.concat(this.udpMap[item])
            this.udpMap[item].forEach(v => { v.showUdpEdit = true })
          })
          this.udpLoading = false

          // for (let group in res.data.data) {
          //   result = result.concat(res.data.data[group])
          // }
          this.checkDisabledObj.id = result.map(v => v.id)
        })
        .catch(err => {
          this.$showFailure(err)
          this.udpLoading = false
        })
    },
    handleUdpChange (val) {
      this.checkedUdp = val
    },
    submitAddUdp () {
      this.udpLoading = true
      let requestBody = {
        projectId: this.id,
        fileType: this.currentFileType.type + '',
        udpVal: this.checkedUdp.map(v => {
          return {
            udpId: v.id,
            value: '',
            fileId: this.currentFileType.id
          }
        })
      }
      this.$http.post(`${this.$dddUrl}/service/udp/val`, requestBody)
        .then(res => {
          this.showUdpSelector = false
          this.getCurrentUdp()
          if (this.checkedUdp.length > 0) {
            this.$blauShowSuccess('扩展属性添加成功')
          }
        })
        .catch(err => {
          this.udpLoading = false
          this.$showFailure(err)
          console.error(err)
        })
    },
    handleAddUdp () {
      this.showUdpSelector = true
      this.checkedUdp = []
      this.getAllUdp()
    },
    // 添加变量名
    handleAddVariable () {
      this.variableDialog = true
      this.variable = this.$store.state.variable[this.currentFileType.id]?.length ? _.cloneDeep(this.$store.state.variable[this.currentFileType.id]) : [{ prop: '', value: '', type: 'VARCHAR' }]
      // this.variable.push({ name: '', value: '' })
      // this.$store.commit('setBranchMap', this.variable)
    },
    handleAdd () {
      this.variable.push({ prop: '', value: '', type: 'VARCHAR' })
    },
    submitAddVariable () {
      let ary = this.variable.find(item => !item.prop && !item.value)
      if (this.variable.length !== 1 && ary) {
        this.$datablauMessage.info('变量名和值为必填项')
        return
      }
      this.variableDialog = false
      let oldVariable = this.$store.state.variable[this.currentFileType.id]
      if (JSON.stringify(oldVariable) === JSON.stringify(this.variable)) return
      let key = {}
      key[this.currentFileType.id] = this.variable
      if (this.variable.length === 1 && !this.variable[0].prop) {
        // 空属性
        this.$store.commit('delVariable', this.currentFileType.id)
      } else {
        this.$store.commit('setVariable', key)
      }
      // this.$store.commit('setVariable', key)
      this.$bus.$emit('setItemChanged', this.currentFileType.id)
      // this.$store.commit('setVariable', this.variable)
      // console.log(this.$store.state.variable[this.currentFileType.id])
    },
    funNamesBlur () {
      // funNames   setFunNames
      let oldFunNames = this.$store.state.funNames[this.currentFileType.id] || []
      if (JSON.stringify(oldFunNames) === JSON.stringify(this.funcNames)) return
      let key = {}
      key[this.currentFileType.id] = this.funcNames
      if (!this.funcNames.length) {
        // 空属性
        this.$store.commit('delFunNames', this.currentFileType.id)
      } else {
        this.$store.commit('setFunNames', key)
      }
      this.$bus.$emit('setItemChanged', this.currentFileType.id)
    },
    closeFunc (val) {
      this.funcNames = this.funcNames.filter(item => item !== val)
      let key = {}
      key[this.currentFileType.id] = this.funcNames
      this.$store.commit('setFunNames', key)
      this.$bus.$emit('setItemChanged', this.currentFileType.id)
    },
    // 删除变量
    handleClick (index) {
      if (this.variable.length === 1) {
        this.variable = [{ prop: '', value: '', type: 'VARCHAR' }]
        return
      }
      this.variable.splice(index, 1)
      // this.$store.commit('setBranchMap', this.variable)
    },
    getAllUdp () {
      this.udpLoading = true
      this.$http.get(`${this.$dddUrl}/service/udp/`)
        .then(res => {
          this.udpLoading = false
          this.allUdps = res.data.data
        })
        .catch(err => {
          this.udpLoading = false
          this.$showFailure(err)
        })
    },
    editUdp () {
      this.udpLoading = true
      let requestBody = {
        projectId: this.id,
        udpVal: this.udpList.map(v => {
          return {
            udpId: v.updValId,
            value: v.value
          }
        })
      }
      this.$http.put(`${this.$dddUrl}/service/udp/val`, requestBody)
        .then(res => {
          this.showUdpSelector = false
          this.getCurrentUdp()
          this.$blauShowSuccess('扩展属性修改成功')
        })
        .catch(err => {
          this.udpLoading = false
          this.$showFailure(err)
          console.error(err)
        })
    },
    deleteUdp (udp) {
      this.$DatablauCofirm(`扩展属性“${udp.name}”的值，确定要删除？`).then(() => {
        this.udpLoading = true
        this.$http.delete(`${this.$dddUrl}/service/udp/delete/project/${udp.udpValId}`)
          .then(res => {
            this.showUdpSelector = false
            this.getCurrentUdp()
            this.$blauShowSuccess('扩展属性删除成功')
          })
          .catch(err => {
            this.udpLoading = false
            this.$showFailure(err)
            console.error(err)
          })
      })
    },
    save (udp, idx) {
      if (udp.editMode === 'NUM' && isNaN(udp.udpValue)) {
        this.$blauShowSuccess('请输入数值', 'warning')
        return
      }
      this.udpLoading = true
      udp.value = udp.udpValue
      this.$http.put(`${this.$dddUrl}/service/udp/val`, [{
        updValId: udp.udpValId,
        projectId: udp.projectId, // 文件id
        udpId: udp.id, // udpid
        fileId: this.currentFileType.id, // 文件id
        fileType: udp.fileType, //  文件类型
        value: udp.value
      }])
        .then(res => {
          this.$blauShowSuccess('扩展属性修改成功')
          this.getCurrentUdp(true)
          this.udpLoading = false
          this.$set(udp, 'showUdpEdit', true)
          // this.showUdpEdit = true
        })
        .catch(err => {
          this.udpLoading = false
          this.$set(udp, 'showUdpEdit', false)
          // this.showUdpEdit = false
          this.$showFailure(err)
        })
    },
    cancel (u) {
      this.$set(u, 'editMode', false)
      this.$set(u, 'showUdpEdit', true)
      // this.showUdpEdit = true
    },
    clickTab (name) {
      if (this.nowTab === name) {
        this.toggleState()
        if (this.shrink) {
          this.nowTab = ''
          return
        }
      } else if (this.shrink) {
        this.toggleState()
      }
      if (name === 'udp') {
        this.funcNames = this.$store.state.funNames[this.currentFileType.id] || []
        this.currentFileType.type !== 0 && this.getCurrentUdp()
        this.getReferenceList()
      }
      this.nowTab = name
    },
    toggleState () {
      this.shrink = !this.shrink
      this.$emit('changeDialogWidth', this.shrink ? 24 : 304)
    },
    toExpand () {
      this.shrink = false
      this.$emit('changeDialogWidth', this.width)
    },
    toShrink () {
      this.shrink = true
      // this.$emit('changeDialogWidth', '50vw')
      this.$emit('changeDialogWidth', 24)
    },
    memoize (fn) {
      let cache = {}
      return async function () {
        let key = JSON.stringify(arguments)
        cache[key] = await fn.apply(this, arguments)
        return cache[key]
      }
    },
    async getTables (modelId, schemaName) {
      return this.$http.get(`${this.$dddUrl}/datatype/${modelId}/${encodeURIComponent(schemaName)}/raw-tables?pageSize=${this.pageSizeTables}&currentPage=${this.currentPageTables}&search=${this.searchName}`)
    },
    async handleTableData () {
      let mapData = []
      this.tableDataLoading = true
      try {
        let res = await this.getTablesCache(this.dataSourceId, this.schemaName)
        this.totalItems = res.data.totalItems
        mapData = res.data.content.map(i => ({
          name: i,
          type: 'table',
          leaf: false,
          children: []
        }))
        mapData.forEach(element => {
          this.tableData.push(element)
        })
        this.tableDataLoading = false
        mapData.length && (this.loadDisabled = true)
        !mapData.length && (this.loadDisabled = false)
        if (this.tableData.length !== 0) {
          this.nothingData = false
        } else {
          this.nothingData = true
        }
      } catch (err) {
        this.$showFailure(err)
      }
    },
    async getColumns (modelId, schemaName, tableName) {
      return this.$http.get(`${this.$dddUrl}/datatype/${modelId}/${schemaName}/${tableName}/raw-columns-detail`)
    },
    renderContent (h, { node, data, store }) {
      if (node.data.type === 'table') {
        return (<span><i class='iconfont icon-biao' style='font-size:14px;padding-right:9px'></i>{data.name}</span>)
      } else {
        return (<span><i class='iconfont icon-ziduan' style='font-size:14px;padding-right:9px'></i>{data.name} <span style="color:#888;padding-left:4px">{data.dataType}({data.columnSize})</span></span>)
      }
    },
    treeRightInfoFormatter (node, data) {
      if (data.type === 'column') {
        return `<span style="color:#888;padding-left:4px;position: relative;top:-5px;display:block;width:100%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap">${data.columnType}</span>`
      } else {
        return ''
      }
    },
    dataOptionsFunction (data, node) {
      let result = []
      this.tableName = ''
      if (data.type === 'table') {
        result.push({
          label: '生成程序',
          callback: async () => {
            this.tableName = data.name
            this.monacoContent = ''
            this.sqlObj = {}
            await this.getSqlList()
            this.next = true
            this.prev = false
            this.generate = false
            this.newFileModel = true
            this.sqlTabs = 'sqlETL'
            await this.getSqlGeneration()
            this.getDataMapping()
            this.fileForm = {
              newFileName: '',
              fileName: []
            }
            this.$refs.fileForm.resetFields()
          }
        })
        result.push({
          label: '数据探查',
          callback: async () => {
            this.tableName = data.name
            await this.getColumnMapping()
            this.dataProbeDialog = true
            this.preview = false
          }
        })
        result.push({
          label: '数据预览',
          callback: async () => {
            this.tableName = data.name
            await this.getColumnMapping()
            this.dataProbeDialog = true
            this.preview = true
          }
        })
        // if (this.$store.state.$auth['DATASERVER_APIDEV_DDD']) {
        //   result.push({
        //     label: '生成数据服务',
        //     callback: async () => {
        //       var pos = location.href.indexOf('#/')
        //       var baseUrl = location.href.slice(0, pos + 2)
        //       window.open(baseUrl + `main/devApi?type=add`)
        //     }
        //   })
        // }
        result.push({
          label: '查看元数据',
          callback: async () => {
            this.tableName = data.name
            this.variableDialogMeta = true
            this.metaObj = {
              tableName: data.name,
              dataSourceId: this.dataSourceId,
              schemaName: this.schemaName,
              type: data.type
            }
          }
        })
        result.push({
          label: '查看表详情',
          callback: async () => {
            try {
              let res = await this.getColumnsCache(this.dataSourceId, this.schemaName, data.name)
              this.$emit('showProcedureFile', { content: res.data, type: 'columnDetails', name: data.name, id: this.schemaName + data.name, schemaName: this.schemaName })
            } catch (err) {
              this.$showFailure(err)
            }
          }
        })
        /* result.push({
          label: '生成SQL',
          callback: async () => {
            this.next = false
            this.prev = false
            this.generate = true
            this.sqlTabs = 'sqlETL'
            this.tableName = data.name
            this.newFileModel = true
            this.getSqlGeneration()
          }
        }) */
        /* result.push({
          label: '数据血缘',
          callback: () => {
          }
        }) */
      }
      return result
    },
    closeLog () {
      this.dataProbeDialog = false
    },
    getSqlList () {
      let branch = this.branchName || 'master'
      HTTP.changeDataTree({
        id: this.id,
        branch
      })
        .then(res => {
          this.fileList = [res]
          this.filterList(this.fileList)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    filterList (ary) {
      if (ary) {
        for (let i = 0; i < ary.length; i++) {
          if (ary[i].type !== 0) {
            ary.splice(i, 1)
            i--
          }
        }
        ary.forEach(item => {
          if (item.childList.length) {
            this.filterList(item.childList)
          }
          if (!item.childList.length) {
            item.childList = null
          }
        })
      }
    },
    getColumnMapping () {
      this.$http
        .post(HTTP.$damServerUrl + 'entities/getColumnMapping')
        .then(res => {
          this.columnMapping = res.data
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    closeFileLog () {
      // this.$refs.fileForm.resetFields()
      this.newFileModel = false
    },
    nextBtn () {
      /* this.$refs.fileForm.validate((valid) => {
        if (valid) { */
      this.prev = true
      this.next = false
      /* }
      }) */
    },
    changeCascader () {
      this.$refs.cascader.$refs.dataCascader.dropDownVisible = false
    },
    prevBtn () {
      this.next = true
      this.prev = false
    },
    addNewFile () {
      this.$refs.fileForm.validate((valid) => {
        if (valid) {
          this.closeFileLog()
          let source = this.dataSourceList.find(item => item.id === this.dataSourceId)
          let type = this.sourceListType[source.type.toLowerCase()]
          let dataSourceId = this.dataSourceId
          let schemaName = this.schemaName
          let gitPath = this.$refs['cascader'].$refs.dataCascader.getCheckedNodes()[0].pathLabels.join('/')
          this.$emit('setNewFile', { ...this.fileForm, content: this.monacoContent, type, dataSourceId, schemaName, gitPath })
        }
      })
      /* this.$refs.nameForm.validate((valid) => {
        if (!valid) {
          this.closeFileLog()
        }
      }) */
    },
    copyFile () {
      if (window.isSecureContext) {
        navigator.clipboard.writeText(this.monacoContent)
          .then(() => {
            this.$datablauMessage.success('复制成功')
            this.closeFileLog()
          })
          .catch(e => {
            this.$datablauMessage.warning('复制失败')
          })
      } else {
        const url = this.monacoContent
        const oInput = document.createElement('textarea')
        oInput.value = url
        document.body.appendChild(oInput)
        oInput.select() // 选择对象;
        document.execCommand('Copy') // 执行浏览器复制命令
        this.$message.success('复制成功')
        this.closeFileLog()
        oInput.remove()
      }
    },
    getSqlGeneration () {
      this.sqlObj = {}
      this.loading = true
      this.$http
        .get(HTTP.$dddServerUrl + `datatype/getSqlGeneration?datasourceId=${this.dataSourceId}&schemaName=${this.schemaName}&tableName=${this.tableName}`)
        .then(res => {
          this.sqlObj = Object.assign(res.data.data, this.sqlObj)
          this.monacoContent = res.data.data[this.sqlTabs]
          this.loading = false
        })
        .catch(err => {
          this.$showFailure(err)
          this.loading = false
        })
    },
    getDataMapping () {
      this.loading = true
      this.$http.post(this.$dddUrl + `/service/model/dwMapping/${this.dataSourceId}/table/${this.tableName}`)
        .then(async res => {
          if (!res.data) {
            this.sqlObj['sqlMapping'] = '本表无映射'
          } else {
            this.sqlObj['sqlMapping'] = res.data
          }
          this.sqlTabs === 'sqlMapping' && (this.monacoContent = this.sqlObj[this.sqlTabs] || '')
          this.loading = false
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    // 生成程序sql文件切换
    async sqlTabsChange () {
      if (this.sqlTabs === 'sqlMapping' && !this.sqlObj[this.sqlTabs]) {
        await this.getDataMapping('sqlMapping')
        this.monacoContent = ''
        return
      }
      this.monacoContent = this.sqlObj[this.sqlTabs] || ''
    },
    async loadNode (node, resolve) {
      if (node.data.type === 'table') {
        try {
          let res = await this.getColumnsCache(this.dataSourceId, this.schemaName, node.data.name)
          resolve(res.data.map(i => ({
            name: i.name,
            type: 'column',
            leaf: true,
            columnType: i.columnType
          })))
        } catch (err) {
          this.$showFailure(err)
        }
      }
    },
    dataIconFunction (data, node) {
      if (data.type === 'table') { // 表
        return 'iconfont icon-biao'
      } else if (data.type === 'column') { // 字段
        return 'iconfont icon-ziduan'
      } else if (data.type === 'procedure') { // 存储过程
        return 'iconfont icon-chucun'
      } else if (data.type === 'view') {
        return 'iconfont icon-shitu'
      } else if (data.type === 'func') {
        return 'iconfont icon-hanshu'
      } else {
        return ''
      }
    },
    getDataSource () {
      this.$http.get(`${this.$dddUrl}/service/model/getDataSource?projectId=${this.$route.query.projectId}`)
        .then(res => {
          let data = res.data.data
          this.dataSourceList = data
          this.dataSourceList.forEach(item => {
            let tagList = []
            // item.TagIds
            let tagId = item.connectionInfo?.parameterMap?.TagIds?.split(',') || []
            tagId.forEach(v => {
              if ((v || v === 0) && !isNaN(v - 0)) {
                tagList.push(this.tagMap[v - 0].name)
              }
            })
            item.tagName = tagList.join(',')
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getChemaList (val, database) {
      if (!this.dataSourceId) {
        this.searchName = ''
        this.schemaName = ''
        this.tableData = []
        return
      }
      this.$http.get(`${this.$dddUrl}/datatype/${this.dataSourceId}/raw-schemas?search=`).then(res => {
        this.schemaList = res.data
        if (!database) {
          this.dataSourceList.forEach(element => {
            if (element.id === this.dataSourceId) {
              if (element.type === 'ORACLE' || element.type === 'POSTGRESQL') {
                this.schemaName = element.schemas.split(';')[0]
              } else {
                this.schemaName = element.database.split(';')[0]
              }
            }
          })
          this.dataSourceId && this.$bus.$emit('dataSourceIdChange', this.dataSourceId, this.schemaName)
        }
        val && this.handleTableData()
        if (!database) {
          this.tableData = []
        }
      }).catch(err => {
        this.$showFailure(err)
      })

      this.dataSourceId && this.$bus.$emit('dataSourceIdChange', this.dataSourceId, this.schemaName)
    },
    changeSchemaName () {
      this.dataSourceId && this.$bus.$emit('dataSourceIdChange', this.dataSourceId, this.schemaName)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
 $middle-color: #e0e0e0;
  $primary-green: #3dae5d;
  $primary-purple: #a14dff;
  $primary-orange: #eb8449;
  $primary-enum: #43c1ca;
  $primary-boolen: #5775dc;
  .secondBox-title{
    color: #bbb;
  }
  .top-border {
    width: 1000px;
    height: 1px;
    background-color: $border-color;
    margin-left: -20px;
    margin-right: 20px;
    overflow: hidden;
  }
  .type-info {
    &:before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 8px;
      margin-left: 3px;
    }
    &.string {
      color: $primary-green;
      &:before {
        background-color: $primary-green;
      }
    }
    &.num {
      color: $primary-purple;
      &:before {
        background-color: $primary-purple;
      }
    }
    &.num_range {
      color: $primary-orange;
      &:before {
        background-color: $primary-orange;
      }
    }
    &.enum {
      color: $primary-enum;
      &:before {
        background-color: $primary-enum;
      }
    }
    &.bool {
      color: $primary-boolen;
      &:before {
        background-color: $primary-boolen;
      }
    }
  }
.udp-part {
  padding-top: 10px;
  padding-left: 10px;
}
 .label-part {
    padding-bottom: 10px;

    .label-part-content {

      // padding-bottom: 23px;
      &:last-child {
        padding: 0;
      }
    }
    ul {
    li {
      /*display: flex;*/
      /*align-items: flex-start;*/
      line-height: 34px;
      margin-bottom: 13px;
      .title-name {
       /* display: flex;
        align-items: center;*/
        width: 100%;
        img {
          width: 24px;
          height: auto;
        }

        span {
          padding-left: 6px;
          font-size: 13px;
          font-weight: 400;
          color: #bbb;
          width: 80%;
          word-wrap : break-word ;
          line-height: 15px;
        }
      }

      .system-value {
        display: inline-block;
        width: 60%;
        font-size: 13px;
        color: #333;

        .assetclassification {
          padding-right: 10px;
          cursor: pointer;
        }
      }

      .topUser {
        display: flex;
        align-items: center;

        .headPortrait {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 100%;

          &:nth-of-type(1) {
            background: #ffe4d9;
          }

          &:nth-of-type(2) {
            margin: 0 10px;
            background: #d7f5de;
          }

          &:nth-of-type(3) {
            background: #d1f3ff;
          }
        }
      }
    }
  }
  .udpBox span {
    color: #606266;
  }
  }

  .edit-operator-wrapper {
    overflow: hidden;
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
  .tab-to-expand-wrapper {
    user-select: none;
    position: absolute;
    right: 304px;
    top: 50%;
    transition: right .2s ease-in;
    transform: translateY(-50%);
    z-index: 2;
    img {
      height: 90px;
    }
  }
.select-panel {
  margin: 10px 8px;
}
  .left-wrapper-pane {
    position: absolute;
    left: 0;
    right: 24px;
    bottom: 0;
    top: 0;
    z-index: 1;
    border-top: 1px solid #222222;
    border-right: 2px solid #222222;
    min-width: 240px;
    &>div{
      height: 100%;
      overflow-y: auto;
    }
    .asset-tree {
      position: absolute;
      top: 134px;
      bottom: 10px;
      right: 0;
      left: 0;
      overflow: auto;
    }
  }
  .right-wrapper {
    position: absolute;
    right: 0;
    width: 24px;
    bottom: 0;
    top: 0;
    background: #333333;
    z-index: 1;
    .navigator-item {
      color: #999;
      padding: 8px 5px 8px;
      cursor: pointer;
      .iconfont {
        font-size: 14px;
        color: #999;
      }
      &:hover{
        color: #BBBBBB;
        background: rgba(30, 110, 210, 0.4);
        .iconfont {
          color: #BBBBBB;
        }
      }
      &.active {
        color: #fffefd!important;
        background: #1E6ED2;
        .iconfont {
          color: #fffefd!important;
        }
      }
    }
  }
  .variable{
    &>div{
      margin-bottom: 8px;
    }
  }
  .variableLog{
    &>div{
      margin: 10px 0;
      .variableInput{
        margin:0 20px ;
      }
    }
  }
  .sqlSttingBox{
    padding: 0 10px;
    .row{
      color: #bbbbbb;
      margin-bottom: 10px;
      .datablau-input{
        margin-top: 5px;
      }
      /deep/ input::-webkit-outer-spin-button,
      /deep/ input::-webkit-inner-spin-button {
        -webkit-appearance: none;
      }
      /deep/ input[type="number"] {
        -moz-appearance: textfield;
      }
    }
  }
  .ulContent{
    height: 100%;
  }
  .numBox {
    /deep/ input::-webkit-outer-spin-button,
    /deep/ input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      line-height: 32px;
    }
    /deep/ input[type="number"] {
      -moz-appearance: textfield;
      line-height: 32px;
    }
  }
  .ulContent{
    /deep/  .el-input.is-disabled .el-input__inner{
      color: #555!important;
      height: 32px !important;
    }
    /deep/  .el-input .el-input__inner{
      height: 32px !important;
    }
  }
  .settingIcon{
    color: #999999;
    margin-left: 10px;
    position: relative;
    top: 2px;
    cursor: pointer;
    &:hover{
      color: #409EFF;
    }
  }
 div.valueBox{
  width: 100%;
  line-height: 24px;
  background:#45494A;
  border-radius: 2px;
  color: #BBBBBB;
  padding: 0 8px;
  margin-top: 8px;
  border: 1px solid #45494A;
  cursor: pointer;
  position: relative;
  &:hover{
    border: 1px solid #888888;
    .edit-btn{
      display: inline-block;
      bottom: 0;
    }
  }
  .empty{
    color: #888888;
  }
  .edit-btn{
   /* position: absolute;
    right: 0;
    bottom: 0;*/
    float: right;
    color: #409EFF;
    display: none;
    margin-right: -8px;
  }
}
.edit-btn.is-block.icon[data-v-8d301a60]:hover{
  color: #409EFF;
}
.editInputBox{
  height: 26px;
}
.editInput, .minInput{
  width: 100%;
  /deep/ .el-select .el-input input,/deep/ .el-input__inner{
    width: 100%;
    height: 26px;
    background: #45494A;
    &:hover{
      border: 1px solid #666666;
    }
  }
}
  .minInput{
    /deep/.el-input__suffix-inner{
      position: relative;
      top: -3px;
    }
  }
  .funNamesInput{
    margin-top: 8px;
    /deep/.el-select{
      height: 26px;
    }
    /deep/.el-input__suffix-inner{
      position: relative;
      top: -3px;
    }
    /deep/.el-select .el-input input{
      height: 26px!important;
      &:hover{
        border: 1px solid #666666;
      }
    }

    /deep/ .el-select__tags{
      line-height: 26px;
    }
  }
  .udfList{
    margin-top: 22px;
  }
/deep/.el-input__inner::placeholder{
  color: #888888;
}
  .funcNamesList{
    margin-top: 10px;
    /deep/.el-tag{
      background-color:rgba(64, 158, 255,0.2) ;
      color: #409EFF;
      .el-tag__close:hover {
        background: rgba(64, 158, 255, 0.3);
        color: #409EFF;
      }
    }
  }
.black-theme {
  /* 槽 */
  ::-webkit-scrollbar-track {
    -webkit-box-shadow: none;
    width: 16px;
    border-radius: 0;
    background: transparent;
    /*滚动条有底色 #4e5152;*/
    /*&:hover {
      background: rgb(67,70,71);
    }*/
  }
  /* 滑块 */
  ::-webkit-scrollbar-thumb {
    background-color:#666666;
    -webkit-border-radius: 10px;
    border-radius: 10px;
    border: 4px solid transparent;
    background-clip: content-box;
    &:hover {
      background: rgb(79,79,79);
    }

  }
  ::-webkit-scrollbar {
    width: 16px;
    height:8px;
  }
}
.tagName {
  position: absolute;
  right: 10px;
  color: #999;
  width: 23%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: right;
}
  .reference{
   color: #bbb;
    /deep/.el-collapse-item__header{
      color: #bbb;
      line-height: 30px;
      height: 30px;
    }
    /deep/.el-collapse-item__content{
      color: #bbb;
      cursor: pointer;
    }
  }
  .refereBox{
    padding-left: 10px;
  }
  .tabsSql{
    width: 20%;
    float: left;
  }
  .monacoEdit{
    width: 80%;
    float: right;
  }
  /deep/.datablau-tabs .el-tabs .el-tabs__item:last-child{
    padding: 0 10px;
  }
.scriptInput{
  border: 1px solid #646464;
  height: 32px;
  line-height: 32px;
  border-radius: 2px;
  padding-left: 10px;
  i{
    margin-right: 10px;
  }
}
  .schemaSelectBox{
    height: 42px;
    position: relative;
    /deep/.el-input--suffix .el-input__inner{
      padding-right: 54px;
    }
    .refreshBox{
      position: absolute;
      right: 38px;
      top: 4px
    }
  }
  /deep/.datablau-dropdown .el-dropdown-link{
    width: 90px;
    margin-right: 9px;
  }
  .contextMenu{
    position: fixed;
    min-width: 100px;
    max-height: 200px;
    overflow: auto;
    z-index: 1111;
    background: #3c3c3c;
    ul{
      padding: 5px 10px;
      li{
        border-bottom: 1px solid #ddd;
        color: #F0F0F0;
        padding: 5px 0;
        cursor: pointer;
        &:last-child{
          border: 0;
        }
      }
    }
  }
/deep/.is-block.strong:hover {
  color: #fffffd!important;
}
</style>
<style lang="scss">
  .grey-tree.datablau-tree .iconfont.icon-ziduan {
    color: #B44C97;
  }
  .grey-tree.datablau-tree .iconfont.icon-biao {
    color: #409EFE;
  }
  .grey-tree.datablau-tree .iconfont.icon-chucun{
    color: #867BA9  !important;
  }
  .dropdownIcon.iconfont.icon-chucun{
    color: #867BA9  !important;
  }
  .dropdownIcon.iconfont.icon-biao {
    color: #409EFE;
  }
  .dropdownIcon.iconfont.icon-shitu {
    color: #4B5CC4;
  }
  .grey-tree.datablau-tree .iconfont.icon-shitu {
    color: #4B5CC4;
  }
  .dropdownIcon.iconfont.icon-hanshu {
    color: #C97586;
  }
  .grey-tree.datablau-tree .iconfont.icon-hanshu {
    color: #C97586;
  }
  .lightColoW{
    color: #BBBBBB;
  }
  .reference{
    .el-collapse-item__header{
      background-color: transparent;
      border-bottom:1px solid #4D4D4D;
    }
    .el-collapse-item__wrap{
      background-color: transparent;
      border-bottom:1px solid #4D4D4D;
    }
  }
</style>
