<template>
  <div class="container">
    <!--    <div class="title">{{$store.state.$v.modelDetail.modelSummary}}</div>-->
    <datablau-dialog
      :title="$store.state.$v.modelDetail.edit + $store.state.$v.modelDetail.modelStatus"
      :visible.sync="showEditModelStatus"
      :append-to-body="true"
      width="480px"
      class="edit-synonyms-dia"
      :close-on-click-modal="false"
    >
      <div class="synonyms-dialog-body">
        <el-form
          ref="editModelStatus"
          label-position="right"
          label-width="110px"
          size="small"
          :model="statusForm"
          :rules="statusRules"
        >
          <el-form-item :label="`${$store.state.$v.modelDetail.modelStatus}：`" prop="modelStatus" >
            <datablau-select style="width:240px" size="mini" v-model="statusForm.modelStatus" filterable clearable>
              <el-option
                v-for="value in modelTypes"
                :key="value.id"
                :label="value.name"
                :value="value.id"
              ></el-option>
            </datablau-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="synonyms-dialog-footer">
        <datablau-button size="mini" type="secondary" @click="showEditModelStatus = false">{{$store.state.$v.modelDetail.cancel}}</datablau-button>
        <datablau-button size="mini" type="primary" @click="saveModeStatus" class="" :disabled="statusForm.modelStatus ===''">{{$store.state.$v.modelDetail.ok}}</datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="模型编辑描述"
      :visible.sync="showEditModelName"
      :append-to-body="true"
      width="600px"
      height="320px"
      custom-class="new-model-name"
      :close-on-click-modal="false"
    >
      <div class="synonyms-dialog-body">
        <el-form
          :model="detailCopy"
          ref="modelInfoForm"
          :rules="modelRules"
          label-width="80px"
          :inline="false"
          size="mini"
        >
          <el-form-item
            v-if="detailCopy.branch"
            label="分支名称"
            prop="name"
          >
            <datablau-input
              v-model="detailCopy.name"
              placeholder="输入分支名称"
              maxlength="200"
              show-word-limit
              clearable
            ></datablau-input>
          </el-form-item>
          <el-form-item
            v-else
            label="模型名称" prop="name"
          >
            <datablau-input
              v-model="detailCopy.name"
              placeholder="输入模型名称"
              maxlength="200"
              show-word-limit
              clearable
            ></datablau-input>
          </el-form-item>
          <el-form-item label="描述" style="margin-bottom:0">
            <datablau-input
              v-model="detailCopy.description"
              type="textarea"
              :autosize="{minRows: 6,maxRows: 6}"
              placeholder="输入模型描述"
              clearable
              show-word-limit
              maxlength="500"
            ></datablau-input>
          </el-form-item>

        </el-form>
      </div>
      <div slot="footer" class="synonyms-dialog-footer">
        <datablau-button size="mini" type="secondary" @click="showEditModelName = false">{{$v.modelDetail.cancel}}</datablau-button>
        <datablau-button size="mini" type="important" @click="saveModeName" class="">{{$v.modelDetail.ok}}</datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      :title="$store.state.$v.modelDetail.modelDescription"
      :visible.sync="showEditModelDescription"
      :append-to-body="true"
      width="600px"
      class="edit-synonyms-dia"
      :close-on-click-modal="false"
    >
      <div class="synonyms-dialog-body">
        <datablau-input
        v-model="detailCopy.description"
        type="textarea"
        placeholder="输入模型描述"
        clearable
        show-word-limit
        maxlength="500"
        ></datablau-input>
      </div>
      <div slot="footer" class="synonyms-dialog-footer">
        <datablau-button size="mini" type="secondary" @click="showEditModelDescription = false">{{$v.modelDetail.cancel}}</datablau-button>
        <datablau-button size="mini" type="primary" @click="saveModelDescription" class="">{{$v.modelDetail.ok}}</datablau-button>
      </div>
    </datablau-dialog>
    <div class="top-box">
      <img :src="bg" class="bg">
      <div class="left">
          <div class="model-icon" style="font-size:32px;position: relative;top: 2px;">
            <span class="icon-outer">
              <datablau-icon
                  v-if="!detail.dwModel"
                  data-type="model"
                  :size="22"
              ></datablau-icon>
              <datablau-icon
                  v-else
                  data-type="data-warehouse"
                  :size="22"
              ></datablau-icon>
            </span>
          </div>

       <div class="text-box">
         <span class="top-name">
           <datablau-tooltip
             effect="dark"
             :content="detail.modelName"
             placement="top"
             :open-delay="200"
             style="max-width: 90%"
           >
            <span style="line-height: 25px;" class="content">{{ detail.modelName }}</span>
           </datablau-tooltip>
          <datablau-button
            v-if="writable && !detail.branch"
            type="icon"
            low-key
            @click="editModelName"
            style="vertical-align: top; margin-left: 10px;"
          >
            <i class="iconfont icon-bianji"></i>
          </datablau-button>
        </span>
         <div class="bottom-text">
            <span class="value">
              <span class="name-label">模型分支：</span>
              <datablau-tooltip class="branch-name name-tooltip" :content="detail.name" v-if="detail.branch">
                <span>{{ detail.name }}</span>
              </datablau-tooltip>
              <span v-else>master</span>

               <datablau-button
                 v-if="writable && detail.branch"
                 type="icon"
                 low-key
                 @click="editModelName"
                 style="vertical-align: top;margin-left: 8px;"
               >
                 <i class="iconfont icon-bianji"></i>
               </datablau-button>
              <span
                class="right-line"
                style="border-right: 1px solid #D1D6E8; height: 14px;float: right;margin: 6px 0 0 4px;padding-left: 4px;"
              ></span>
            </span>

           <span class="value">
             <span class="name-label">模型路径：</span>
             <span class="path-outer" :title="(path.map(item => item.name)).join('/')">
               <span class="path" :key="item.id" @click="goLibrary(item.id)" v-for="(item, index) in path">
                 <span
                   class="path-item"
                 >{{ item.name }}</span>
                 <!--<datablau-tooltip-->
                 <!--  v-show="item.name.length >= 88"-->
                 <!--  :content="item.name"-->
                 <!--  placement="bottom"-->
                 <!--  effect="dark"-->
                 <!--&gt;-->
                 <!--  <a class="path-item">{{ item.name }}</a>-->
                 <!--</datablau-tooltip>-->
                 <span v-if="index < (path.length - 1)"> / </span>
               </span>
             </span>

           </span>
         </div>
       </div>
      </div>
      <div class="right">
        <div class="box">
          <div>数仓模型</div>
          <datablau-switch
            @change="changeDwStatus"
            size="mini"
            disabled="true"
            style="display: inline-block;margin-right:6px"
            v-model="detail.dwModel"></datablau-switch>
        </div>
        <div class="box" :class="{'hide-border': !$store.state.featureMap.ddm_WebModelAdvancedAttribute}">
          <div>锁定状态</div>
          <datablau-switch
            size="mini"
            disabled
            style="display: inline-block;margin-right:6px"
            v-model="detail.locked"></datablau-switch>
          <span v-if="!detail.locked">{{
              $store.state.$v.modelDetail.unLocked
            }}</span>{{ $store.state.$v.modelDetail.locked }}
        </div>
        <!-- <div class="box">
           <div>{{ $store.state.$v.modelDetail.objectCount }}</div>
           <div class="value" style="font-size:16px;font-weight:500">{{detail.objCount}}</div>
         </div> -->
        <div class="box" style="border-right:unset" v-if="$store.state.featureMap.ddm_WebModelAdvancedAttribute">
          <div>{{ $store.state.$v.modelDetail.score }}</div>
          <!--<el-rate disabled v-model="rate"></el-rate>-->
          <rate-in-table
            style="height: 18px;line-height: 18px;vertical-align: top;"
            :rate="rate"
          ></rate-in-table>
        </div>
        <slot></slot>
      </div>

    </div>
    <div class="content-left">
        <div class="top-content" :style="{visibility: !statisticsLoading? 'visible': 'hidden'}">
          <div class="num-box" @click="handleCurrentPaneChange('tables')">
            <div class="circle">
              <img :src="tableImg">
            </div>
            <div class="desc">{{isLogical || isConceptual ? '实体' : isCassandraOrMongoDB ? '集合' : '表'}}</div>
            <div class="num">{{modelInfoResult.Entity || 0}}</div>
            <div class="icon-circle el-icon-arrow-right">
            </div>
          </div>
           <div class="num-box" @click="handleCurrentPaneChange('tables')" >
            <div class="circle">
              <img :src="columImg" >
            </div>
            <div class="desc">{{isLogical || isConceptual ? '属性' : '字段'}}</div>
            <div class="num">{{modelInfoResult.Attribute || 0}}</div>
            <div class="icon-circle el-icon-arrow-right">
            </div>
          </div>
           <div class="num-box" @click="handleCurrentPaneChange('views',!showViewButton)" :style="showViewButton ? '' : 'cursor:unset'">
            <div class="circle">
              <img :src="viewImg">
            </div>
            <div class="desc">视图</div>
            <div class="num" v-if="showViewButton">{{modelInfoResult.View || 0}}</div>
            <div class="num" v-else>/</div>
            <div class="icon-circle el-icon-arrow-right" v-if="showViewButton">
            </div>
          </div>
           <div class="num-box" @click="go2Theme" style="margin-right:0;">
            <div class="circle">
              <img :src="themeImg">
            </div>
            <div class="desc">主题</div>
            <div class="num">{{modelInfoResult.Diagram || 0}}</div>
            <div class="icon-circle el-icon-arrow-right">
            </div>
          </div>
          <div class="num-box light " @click="handleCurrentPaneChange('manage')">
            <div class="circle">
              <img :src="userImg">
            </div>
            <div class="desc">用户</div>
            <div class="num">{{modelInfoResult.userCount || 0}}</div>
            <div class="icon-circle el-icon-arrow-right">
            </div>
          </div>
          <div class="num-box light "  @click="handleCurrentPaneChange('report')">
            <div class="circle">
              <img :src="reportImg">
            </div>
            <div class="desc">报告</div>
            <div class="num">{{modelInfoResult.ModelReport || 0}}</div>
            <div class="icon-circle el-icon-arrow-right">
            </div>
          </div>
          <div class="num-box light " @click="handleCurrentPaneChange('history')">
            <div class="circle">
              <img :src="versionImg">
            </div>
            <div class="desc">版本</div>
            <div class="num">{{modelInfoResult.ModelVersion}}</div>
            <div class="icon-circle el-icon-arrow-right">
            </div>
          </div>
          <div class="num-box light " v-if="$store.state.featureMap.ddm_WebModelAdvancedAttribute" @click="handleCurrentPaneChange('comment')" style="margin-right:0;">
            <div class="circle">
              <img :src="messageImg">
            </div>
            <div class="desc">留言</div>
            <div class="num">{{modelInfoResult.DataThreadMessage || 0}}</div>
            <div class="icon-circle el-icon-arrow-right">
            </div>
          </div>
        </div>
        <div class="table-container">
            <datablau-button
                type="text"
                @click="handleCurrentPaneChange('history')"
                style="
                  position: absolute;
                  margin-left: 0px;
                  top: 6px;
                  height: 24px;
                  z-index: 1;
                  right: 2px;
                  "
                >更多
            </datablau-button>

            <datablau-detail-subtitle title="最近修改记录" mt="5px" mb="9px" ></datablau-detail-subtitle>
      <datablau-table
        ref="expanTable"
        :data="tableData"
        v-loading="tableLoading"
        class="datablau-table"
        row-class-name="row-can-click"
        row-key="d"
        @row-click="handleRowClick"
      >
        <!--<el-table-column width="28">-->
        <!--  <template slot="header">-->
        <!--    <datablau-button-->
        <!--        type="icon"-->
        <!--        @click="autoToggleTableExpansion"-->
        <!--        low-key-->
        <!--        class="iconfont"-->
        <!--        :class="{'icon-shouqi': !toggleTable, 'icon-zhankai': toggleTable}"-->
        <!--    >-->
        <!--    </datablau-button>-->
        <!--  </template>-->
        <!--</el-table-column>-->
        <el-table-column type="expand">
          <template slot="header">
            <datablau-button
                type="icon"
                @click="autoToggleTableExpansion"
                low-key
                class="iconfont"
                :class="{
                'icon-shouqi': !toggleTable,
                'icon-zhankai': toggleTable,
              }"
            >
            </datablau-button>
          </template>
          <template slot-scope="scope">
            <edit-log-list
                :source="scope.row"
                :modelId="detail.id"
                :minnVerMap="minnVerMap"
                :key="scope.row.d"
            ></edit-log-list>
          </template>
        </el-table-column>
        <el-table-column
            prop="name"
            :label="$store.state.$v.modelDetail.versionNum"
            width="130"
            show-overflow-tooltip
            class-name="version-no">
          <template slot-scope="scope">
            <img :src="verImg" alt="" style="margin-right:8px">
            {{ scope.row.name }}
          </template>
        </el-table-column>
          <el-table-column
          :label="$store.state.$v.modelDetail.descOrRecord"
          show-overflow-tooltip
          min-width="250"
        >
            <template slot-scope="scope">
              <div v-if="!scope.row.user" :data-id="scope.row.d" v-html="nl2br(scope.row.description)"></div>
              <div v-else-if="!scope.row.isOpen">
                <el-button type="text" size="mini" @click="scanLog(scope.row)">{{$store.state.$v.modelDetail.viewRecord}}</el-button>
              </div>
              <div v-else>
                <ul class="man-list">
                  <li v-if="scope.row.log.length>0">{{$store.state.$v.modelDetail.total2}}{{scope.row.log.length}}{{$store.state.$v.modelDetail.nRecord}}</li>
                  <li v-else>{{$store.state.$v.modelDetail.noRecord}}</li>
                  <li
                    v-for="(l,k) in scope.row.log"
                    :key="k"
                  >{{k+1}}. {{logFormatter(l)}}</li>
                </ul>
              </div>
            </template>
        </el-table-column>
        <el-table-column
          prop="creator"
          width="160"
          :label="$store.state.$v.modelDetail.Submitter"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{scope.row.creator? scope.row.creator : scope.row.user}}</span>
          </template>
        </el-table-column>
        <el-table-column
          width="140"
          :label="$store.state.$v.modelDetail.commitTime"
          show-overflow-tooltip
          :formatter="$timeFormatter"
          prop="timestamp">
        </el-table-column>

      </datablau-table>
        </div>
        <div>
          <datablau-detail-subtitle :title="$store.state.$v.modelDetail.modelDescription" mt="22px" mb="9px" ></datablau-detail-subtitle>
        </div>
        <span class="value desc-text">{{ detail.description ? detail.description : $store.state.$v.modelDetail.noDescription }}</span>
       <!-- <datablau-detail-subtitle title="基本信息" mt="20px" mb="9px" style="display:block"></datablau-detail-subtitle>
       <div class="basic-info">
            <div class="row">
                <span class="label">{{ $v.modelDetail.modelName }}</span>
                <span class="value">{{ detail.modelName }}</span>
            </div>
            <div class="row">
                <span class="label">{{ $store.state.$v.modelDetail.modelStatus }}</span>
                <span class="value">
                  <div class="status-outer">
                    <Status text-align="left" :type="detail.phase"></Status>
                  </div>
                  <datablau-button
                    v-if="writable"
                    type="icon"
                    low-key
                    @click="editModelStatus"
                  >
                    <i class="iconfont icon-bianji"></i>
                  </datablau-button>
                </span>
            </div>
            <div class="row">
                 <span class="label">{{ $store.state.$v.modelDetail.branch }}</span>
                  <span class="value" v-if="detail.branch">{{detail.name}}</span>
                  <span class="value" v-else>master</span>
            </div>
            <div class="row">
                  <span class="label">{{ $store.state.$v.modelDetail.databaseType }}</span>
                  <span class="value">
                    <Database-Type
                      :value="detail.modelType"
                    ></Database-Type>
                  </span>
            </div>
       </div> -->
       <datablau-detail-subtitle  title="管理模式" mt="20px" mb="9px" style="display:block"  v-if="$store.state.featureMap.ddm_WebModelAdvancedAttribute"></datablau-detail-subtitle>
            <div  class="row" v-if="$store.state.featureMap.ddm_WebModelAdvancedAttribute">
                <span class="label">
                  {{ $store.state.$v.modelDetail.forcedMode }}
                </span>
                <div class="value">
                  <datablau-switch
                    style="display:inline-block;margin-right:6px"
                    class="limited-switch"
                    v-model="limitedDsApply"
                    @change="changeLimitedDsApply"
                    :disabled="!(detail.permission && detail.permission.admin) && !$store.state.user.isAdmin"
                  ></datablau-switch>
                   <span style="margin-right:30px">{{limitedDsApply ? $store.state.$v.modelDetail.enabled : $store.state.$v.modelDetail.disabled}}</span>
                  <datablau-checkbox
                    style="display: inline-block;"
                    class="limited-config"
                    v-model="limitedDsApplyConfig"
                    :disabled="!limitedDsApply || (!(detail.permission && detail.permission.admin) && !$store.state.user.isAdmin)"
                    @change="changeLimitedDsApply"
                  >
                    <el-checkbox label="rColDt">{{ $store.state.$v.modelDetail.dataType }}</el-checkbox>
                    <el-checkbox label="rColChName">{{ $store.state.$v.modelDetail.cnName }}</el-checkbox>
                    <el-checkbox label="rColName">{{ $store.state.$v.modelDetail.colName }}</el-checkbox>
                  </datablau-checkbox>
                  <datablau-tips :content="$store.state.$v.modelDetail.forcedTip2" icon="icon-tips" style="display:inline-block;margin-left:8px;color:#999"></datablau-tips>
                </div>
            </div>
    </div>
    <div class="content-right">
      <right-attr-info
          :attrs="detail"
          :editable="writable"
        >
          <datablau-button
            slot="editStatus"
            v-if="writable"
            type="icon"
            low-key
            class="edit-status iconfont icon-bianji"
            @click="editModelStatus"
          ></datablau-button>
          <datablau-button
          slot="tagButton"
          v-if="writable"
          type="text"
          class="button-new-tag iconfont icon-tianjia"
          size="mini"
          @click="openTagSelector">
          添加
          </datablau-button>
        </right-attr-info>
    </div>
    <datablau-dialog
      title="选择合并来源"
      :visible.sync="showMergeDialog"
      :append-to-body="true"
      width="640px"
      class="merge-branch-dia"
      :close-on-click-modal="false"
    >
      <datablau-form style="width: 600px" ref="mergeForm" :model="mergeData" :rules="rules" label-width="100px" size="mini">
        <el-form-item label="来源分支" required  prop="branchId">
          <datablau-select @change="changeBranchId" v-model="mergeData.branchId" filterable placeholder="请选择名称">
            <template v-for="item in branchIdToAllRelatedBranchList[id]">
              <el-option
                v-if="item.id !== id"
                :key="item.id"
                :label="item.name"
                :value="item.id"></el-option>
            </template>
          </datablau-select>
        </el-form-item>
        <el-form-item style="display: inline-block;" label="版本起始名称" required prop="startVer">
          <datablau-select style="width: 195px" v-model="mergeData.startVer" placeholder="请选择">
            <el-option v-for="item in branchVersions"
              :key="item.id"
              :label="item.name"
              :value="item.id"></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item style="display: inline-block;" label="版本截止名称" required prop="endVer">
          <datablau-select style="width: 195px" v-model="mergeData.endVer" placeholder="请选择">
            <el-option v-for="item in branchVersions"
                       :disabled="item.id <= mergeData.startVer"
                       :key="item.id"
                       :label="item.name"
                       :value="item.id"></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="迁入版本名称" required prop="mergeName">
          <datablau-input v-model="mergeData.mergeName" placeholder="请输入名称"></datablau-input>
        </el-form-item>
        <el-form-item label="合并主题域布局">
          <datablau-checkbox checkboxType="single" v-model="mergeData.includeDiagram"></datablau-checkbox>
        </el-form-item>
        <el-form-item label="嵌入版本描述">
          <datablau-input style="width: 500px;" type="textarea" v-model="mergeData.des" show-word-limit :maxlength="200"></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer" class="merge-branch-footer">
        <datablau-button type="secondary" @click="cancelMergeBranch">{{$v.modelDetail.cancel}}</datablau-button>
        <datablau-button type="important" @click="confirmMergeBranch">{{$v.modelDetail.ok}}</datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="分支合并结果"
      :visible.sync="showMergeResultDialog"
      :append-to-body="true"
      width="720px"
      class="merge-branch-dia"
      :close-on-click-modal="false"
    >
      <div class="merge-result-wrapper">
        <div class="hint-wrapper clearfixed">
          <i class="icon el-icon-warning"></i>
          <p>合并失败，来源分支起始版本中，以下对象的属性内容与当前分支中属性内容存在冲突，请前往<b>DDM客户端手动完成合并</b></p>
        </div>
        <div class="result-detail-wrapper">
          <div class="header">
            <div class="type">对象类型</div>
            <div class="name">对象名称</div>
            <div class="operate">操作</div>
          </div>
          <datablau-tree
            :data="mergeFailureResult"
            node-key="eid"
            default-expand-all
            :props="{
              value: 'eid',
              label: 'ename',
              children: 'sub'
            }"
            :expand-on-click-node="false"
            :render-content="renderContent">
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ data.ename }}123123</span>
              </span>
          </datablau-tree>
        </div>
      </div>
      <div slot="footer" class="merge-branch-footer">
        <datablau-button type="important" style="float: left;" @click="exportMergeResult">导出</datablau-button>
        <datablau-button type="secondary" @click="showMergeResultDialog = false">关闭</datablau-button>
      </div>
    </datablau-dialog>
    <!--<div class="property">
      <span class="label">{{ $v.modelDetail.modelName }}</span>
      <span
        class="value">{{ detail.modelName }}<el-button
        v-if="writable"
        type="text"
        icon="el-icon-edit-outline"
        class="edit-status"
        @click="editModelName"
      ></el-button></span>
    </div> -->
    <!-- <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.catalog }}</span>
      <span
        class="value">
        <span :key="item.id" @click="goLibrary(item.id)" v-for="(item, index) in path">
          <a style="color: #4a8af5;cursor: pointer;" v-if="index < (path.length - 1)">{{item.name}}/&nbsp;</a>
          <a style="color: #4a8af5;cursor: pointer;" v-else>&nbsp;{{item.name}}</a>
        </span>
      </span>
    </div> -->
    <!-- <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.modelDescription }}</span>
      <span
        class="value">{{ detail.description ? detail.description : $store.state.$v.modelDetail.noDescription }}<el-button
        v-if="writable"
        type="text"
        icon="el-icon-edit-outline"
        class="edit-status"
        @click="editModelDescription"
      ></el-button></span>
    </div> -->
    <!-- <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.lastModifier }}</span>
      <span class="value">{{ detail.lastModifier }}</span>
    </div>
    <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.owner }}</span>
      <span class="value">{{detail.owner}}</span>
    </div>
    <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.createTime }}</span>
      <span class="value">{{dateFormatter(detail.createdOn)}}</span>
    </div>
    <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.updateTime }}</span>
      <span class="value">{{dateFormatter(detail.lastModificationTimestamp)}}</span>
    </div>
    <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.modelStatus }}</span>
      <span class="value">
        <div class="status-outer">
          <Status text-align="left" :type="detail.phase"></Status>
        </div>
        <el-button
          v-if="writable"
          type="text"
          icon="el-icon-edit-outline"
          class="edit-status"
          @click="editModelStatus"
        ></el-button>
      </span>
    </div> -->
    <!-- <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.lockStatus }}</span>
      <span class="value">
        <span v-if="!detail.locked">{{ $store.state.$v.modelDetail.unLocked }}</span>{{ $store.state.$v.modelDetail.locked }}
        <el-switch
          size="mini"
          disabled
          style="position:relative;top:-1px;margin-left:5px;"
          v-model="detail.locked"></el-switch>
      </span>
    </div> -->
    <!--<div class="property">
      <span class="label">强管控状态</span>
      <span class="value">
        <el-switch
          size="mini"
          :disabled="!$store.state.user.isAdmin"
          style="position:relative;top:-1px;margin-left:5px;"
          @change="setLimitedDsApply"
          v-model="limitedDsApply"></el-switch>
      </span>
    </div>-->
    <!-- <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.branch }}</span>
      <span class="value" v-if="detail.branch">{{detail.name}}</span>
      <span class="value" v-else>master</span>
    </div> -->
    <!-- <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.objectCount }}</span>
      <span class="value">{{detail.objCount}}</span>
    </div>
    <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.score }}</span>
      <span class="value"><el-rate disabled :value="rate"></el-rate></span>
    </div>
    <div class="property">
      <span class="label">{{ $store.state.$v.modelDetail.databaseType }}</span>
      <span class="value">
        <Database-Type
          :value="detail.modelType"
        ></Database-Type>
      </span>
    </div> -->
    <!-- <div
      v-for="(u,k) in udpMessage"
      :key="k"
      class="property">
      <span class="label">{{dataByType.udp.get(parseInt(k)).FriendlyName}}</span>
      <span class="value">{{u}}</span>
    </div> -->
    <!-- <div class="property broader">
      <span class="label">{{ $store.state.$v.modelDetail.tag }}</span>
      <span class="value">
        <el-tag
          :key="tag.id"
          size="small"
          v-for="(tag, index) in tags"
          style="margin-right:1em;"
          :closable="writable"
          :disable-transitions="false"
          @close="handleClose(tag, index)">
          {{tag.name}}
        </el-tag>
        <datablau-button v-if="writable" type="normal" class="button-new-tag el-icon-plus" size="mini" @click="openTagSelector"></datablau-button>
      </span>
    </div> -->
    <tag-selector
      v-if="tagsLoaded"
      ref="tagDialog"
      @selected="updateTags"
    ></tag-selector>
    <!-- <div class="property broader">
      <span class="label">
        {{ $store.state.$v.modelDetail.forcedMode }}
      </span>
      <div class="value">
        <span>{{limitedDsApply ? $store.state.$v.modelDetail.enabled : $store.state.$v.modelDetail.disabled}}</span>
        <el-switch
          class="limited-switch"
          v-model="limitedDsApply"
          @change="changeLimitedDsApply"
        ></el-switch>
        <el-checkbox-group
          class="limited-config"
          v-model="limitedDsApplyConfig"
          :disabled="!limitedDsApply"
          @change="changeLimitedDsApply"
        >
          <el-checkbox label="rColDt">{{ $store.state.$v.modelDetail.dataType }}</el-checkbox>
          <el-checkbox label="rColChName">{{ $store.state.$v.modelDetail.cnName }}</el-checkbox>
          <el-checkbox label="rColName">{{ $store.state.$v.modelDetail.colName }}</el-checkbox>
        </el-checkbox-group>
        <el-tooltip effect="light" :content="$store.state.$v.modelDetail.forcedTip2" placement="top">
          <i class="fa fa-info-circle gray-info"></i>
        </el-tooltip>
      </div>
      <div class="control-props">
      </div>
    </div> -->
    <!-- <div class="merge-branch-wrapper">
      <h2>分支合并</h2>
      <datablau-button class="merge-btn" type="important" :disabled="branchIdToAllRelatedBranchList[id].length === 1" @click="showMergePanel">选择合并来源</datablau-button>
    </div> -->
  </div>
</template>
<script>
import paneDetail from './paneDetail.js'
export default paneDetail
</script>
<style scoped lang="scss">
@import '../paneDetail';
.synonyms-dialog-body {
  .datablau-input /deep/ .el-input__inner {
    padding-right: 80px;
  }
}
.table-container {
  position: relative;
  /deep/ .el-table__expand-icon {
    // position: relative;
    // right: 5px;
  }
  /deep/ .el-table__expand-icon:hover {
    color: #409EFF;
  }
  /deep/ .el-table__row--level-0 + .el-table__row--level-1 {
    box-shadow: inset 0px 2px 6px 1px rgba(0,0,0,0.04);
  }
  /deep/ .el-table__row--level-1 {
    background: #F8F8F8;
  }
}
.bg {
  position: absolute;
    right: 0;
    bottom: 0;
}
.is-block.icon.low-key {
  color: #999;
  &:hover {
    color: #0084FF;
}
}
.status-outer {
  vertical-align: unset;
}
.tag {
  border-radius: 2px;
  font-size: 14px;
  font-weight: 500;
}
.is-block /deep/ .iconfont.icon-bianji {
  font-size: 14px;
}
.property {
  position: relative;
  top: 90px;
}
.container {
  margin-left: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.top-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 10px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  border-bottom: 1px solid #ddd;
  .path {
    position: relative;
    //top: 4px;
    display: inline-block;
    max-width: 488px;
    // line-height: 17px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /deep/ .el-rate__icon {
    color: #efefef;
  }
  .left {
    display: flex ;
  }
  .right {
    padding-right: 20px;
    display: flex;
    .box {
      height: 34px;
      padding: 0 24px;
      border-right: 1px solid #D1D6E8;
      font-size: 12px;
      font-weight: 500;
      color: #555555;
      line-height: 14px;
      &.hide-border {
        border-right: unset;
      }
    }
    .box:nth-of-type(3) {
      border-right: unset;
    }
    div:nth-of-type(1) {
      margin-bottom: 7px;
    }
  }
  .model-icon {
    width: 32px;
    height: 32px;
    text-align: center;
    vertical-align: middle;
    //border: 1px solid red;
    .icon-outer {
      position: absolute;
      left: 0px;
      top: 5px;
      line-height: 0px;
    }
    /deep/ .img-icon-outer {
      display: inline-block;
    }
    //background-size: 32px;
  }
  .text-box {
    position: absolute;
    left: 52px;
    right: 290px;
    top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 46px;

    .edit-status {
      color: #999;
      line-height: 16px;
    }
    .bottom-text {
      display: inline-block;
      height: 24px;
      color: #555;
      font-size: 12px;
      line-height: 24px;
      vertical-align: top;
      white-space: nowrap;
      //overflow: hidden;
      //text-overflow: ellipsis;
      //border: 1px solid red;

      .name-label, .path {
        display: inline-block;
        height: 24px;
        line-height: 24px;
        vertical-align: top;
      }

      .value {
        display: inline-block;
        vertical-align: top;
        height: 24px;
        line-height: 24px;
      }

      .value:nth-of-type(1) {
        padding-right: 20px;
        //border-right: 1px solid #D1D6E8;
      }

      //.value:nth-of-type(2) {
      //  padding-left: 20px;
      //}

      .path-outer {
        display: inline-block;
        //border: 1px solid red;
        max-width: 300px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .path {
        vertical-align: top;
        //height: 17px;
      }

      .datablau-tooltip {
        position: relative;
        vertical-align: top;
        //top: 5px;
        //height: 17px;
        max-width: 488px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .branch-name {
        //border: 1px solid red;
        max-width: 150px;
      }
    }
  }
  .top-name {
    display: block;
    line-height: 18px;
    font-size: 16px;
    font-weight: 500;
    color: #555555;

    .content {
      display: block;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}

.content-left {
  padding-left: 20px;
  padding-right: 20px;
  position: absolute;
  top: 70px;
  left: 0;
  right: 290px;
  bottom: 0;
  overflow: auto;
  .icon.low-key:hover {
    color: #409EFF;
  }
  .top-content {
    padding-top: 10px;
    width: 100%;
    height: 162px;
    .num-box {
      float: left;
      margin-right: 0.78%;
      margin-bottom: 16px;
      padding-left: 12px;
      position: relative;
      width: 24.35%;
      height: 60px;
      background: #EBF5FF;
      border-radius: 4px;
      border: 1px solid #EBF5FF;
      cursor: pointer;
      transition: all 0.4s ease-in-out;
      &:hover {
        border-color:  #409EFF;
        box-shadow: 0px 0px 6px 0px rgba(64,158,255,0.2);
        .icon-circle {
          color:#fff;
          background: #409EFF;
        }
      }
       &::after {
        content:'';
        font-size: 0;
        height: 100%;
        display: inline-block;
        vertical-align: middle;
      }
      div {
        display: inline-block;
        vertical-align: middle;
      }
      .circle {
        position: relative;
        margin-right: 10px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, #FFFFFF 100%);
        box-shadow: 0px 2px 4px 0px rgba(64,158,255,0.1);
        img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
        }
      }
      .desc,
      .num {
        font-size: 14px;
        font-weight: 500;
        color: #555555;
      }
      .desc {
        margin-right: 8px;
        width: 28px;
      }
      .num {
        font-weight: 900;
        color: #777;
      }
      .icon-circle {
        position: absolute;
        top: 50%;
        margin-top: -9px;
        right: 12px;
        width: 20px;
        height: 20px;
        line-height: 20px;
        border-radius: 50%;
        font-size: 12px;
        color: #409EFF;
        text-align: center;
        background: #EBF5FF;
        transition: all 0.2s ease-in-out;
      }
    }
    .light {
      background: #fff;
      box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.1);
      border-color: #fff;
      &:hover {
        box-shadow: 0px 0px 6px 0px rgba(64,158,255,0.2);
      }
      .circle {
        background: rgba(64,158,255,0.1);
        box-shadow: unset;
      }
      .icon-circle {
        color: #999;
        background: #F5F5F5;
      }
    }
  }
  .desc-text {
    padding-left: 8px;
    display: block;
    max-width: 808px;
    min-height: 14px;
    font-size: 12px;
    font-weight: 400;
    color: #555555;
  }
  .basic-info {
    font-size: 12px;
    font-weight: 500;
    color: #555555;
    height: 236px;
    .label {
      text-align: right;
      margin-right: 16px;
      display: inline-block;
      width: 180px;
      color: #555;
      font-weight: 500;
    }
    .value {
      font-weight: 400;
    }
    .row {
      display: flex;
      align-items: center;
      margin-bottom: 34px;
      line-height: 14px;
    }
    .row:last-of-type {
      margin-bottom: 0;
    }
  }
  .row {
      font-size: 12px;
      font-weight: 500;
      color: #555555;
      display: flex;
      align-items: center;
      margin-bottom: 45px;
      line-height: 14px;
      .label {
        text-align: right;
        margin-right: 16px;
        display: inline-block;
        width: 180px;
      }
      /deep/ .el-tooltip.iconfont.icon-tips {
        font-size: 14px;
      }
      /deep/ .el-checkbox__label {
        font-size: 12px;
      }
    }
}
/*@media screen and (max-width: 1366px) {*/
/*    .content-left {*/
/*      right: 90px;*/
/*  }*/
/*}*/
.content-right {
    position: absolute;
    top: 70px;
    right: 0;
    bottom: 10px;
    z-index: 1;
  .left-line {
    position: absolute;
    top: 10px;
    bottom: 10px;
    width: 1px;
    background: #ddd;
  }
}
  .merge-branch-wrapper {
    h2 {
      font-weight: normal;
      font-size: 13px;
      line-height: 1;
      &:before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 13px;
        background: #409EFF;
        margin-right: 8px;
      }
    }
    .merge-btn {
      margin-top: 16px;
    }
  }
  .result-detail-wrapper {
    min-height: 320px;
    margin-top: 10px;
    border: 1px solid rgb(211, 211,211);
    max-height: 400px;
    overflow: auto;
    .header {
      display: flex;
      background: #f5f5f5;
      .type {
        padding: 0 5px;
        flex: 1 1 auto;
      }
      .name {
        padding: 0 5px;
        width: 200px;
        flex: 0 0 auto;
        border-left: 1px solid rgb(211, 211,211);
      }
      .operate {
        padding: 0 5px;
        width: 100px;
        flex: 0 0 auto;
        border-left: 1px solid rgb(211, 211,211);
      }
    }
    /deep/ {
      .el-tree-node__content {
        border-bottom: 1px solid #d3d3d3;
      }
      .content-detail {
        width: 100%;
        display: flex;
        padding-left: 15px;
        align-items: center;
        i {
          flex: 0 0 auto;
        }
      }
      .content-wrapper {
        flex: 1 1 auto;
        display: flex;
        .left {
          flex: 1 1 auto;
          padding: 0 5px;
        }
        .middle {
          border-left: 1px solid #d3d3d3;
          flex: 0 0 auto;
          width: 200px;
          padding: 0 5px;
          &.red-bg {
            background: rgb(255, 160, 122);
          }
        }
        .right {
          border-left: 1px solid #d3d3d3;
          flex: 0 0 auto;
          width: 100px;
          padding: 0 5px;
        }
      }
    }
  }
  .hint-wrapper {
    .icon {
      float: left;
      color: #FF7519;
      font-size: 18px;
      margin-right: 5px;
    }

    p {
      float: left;
      font-size: 12px;
      color: #555;
    }
  }

.tag {
  display: inline-block;
  padding: 0 12px;
  width: auto;
}

/deep/ .el-input__inner {
  font-size: 12px;
  color: #555;
  font-weight: 400;
}

.path-item {
  color: #409EFF;
  cursor: pointer;
  padding: 0 4px;
  transition: all 0.3s ease-in-out;
  margin: 0 2px;
  line-height: 24px;
  display: inline-block;

  &:hover {
    background-color: rgba(64, 158, 255, 0.1);
  }
}
</style>
<style lang="scss">
.new-model-name {
   .el-textarea__inner {
    height: 146px !important;
  }
}
 .synonyms-dialog-body {
  .datablau-input {
    display: block;
    .el-input__inner {
      height: 32px;
      line-height: 32px;
    }
  }
  .datablau-select {
    display: inline-block;
  }
  // .el-input__inner {
  //   width: 240px;
  // }
  .el-form .el-form-item label.el-form-item__label {
    height: 32px;
    line-height: 32px;
  }
 }
</style>
