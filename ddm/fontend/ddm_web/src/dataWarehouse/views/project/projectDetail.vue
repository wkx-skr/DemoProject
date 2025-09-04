<template>
    <div class="project-detail" v-loading="loading">
      <datablau-dialog
          :visible.sync="showChangeList"
          title="版本发布"
          width="500px"
          height="380px"
          append-to-body
          @close="closeBtn"
          >
        <div class="content">
          <datablau-form
            size="small"
            label-width='90px'
            :model="formWork"
            :rules="rules"
            ref="form"
          >
            <el-form-item
              label="版本名称"
              prop="version"
            >
              <datablau-input
                v-model="formWork.version"
                class="input-detail"
                size="mini"
                style="width: 300px"
                placeholder="请输入版本名称"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              label="开发需求"
              prop="confirmedId"
            >
              <datablau-select
                v-model="formWork.confirmedId"
                size="mini"
                clearable
                style="width: 300px;"
                multiple
                @change="changeConfirmedList"
              >
                <el-option
                  v-for="v in confirmedList"
                  :key="v.id"
                  :label="v.name"
                  :value="v.id"
                  :disabled="v.disabled"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <p style="padding-left: 90px;
    padding-bottom: 20px;
    color: #999;">{{ processNameList.join('；') }}</p>
            <!-- <el-form-item
              label="选择工作流"
              prop="workflowCode"
            >
              <datablau-select
                v-model="formWork.workflowCode"
                size="mini"
                clearable
                style="width: 300px;"
                multiple
                @focus="changePersonnelList(formWork.workflowCode)"
                @clear="changePersonnelList('')"
                @change="changePersonnelList"
                v-selectLazyLoad="workLazyloading"
              >
                <el-option
                  v-for="v in workList"
                  :key="v.code"
                  :label="v.name"
                  :value="v.code"
                ></el-option>
              </datablau-select>
            </el-form-item> -->
            <!-- <el-form-item
              label="选择审批人"
              prop="approver"
            >
              <datablau-select
                v-model="formWork.approver"
                size="mini"
                clearable
                style="width: 300px;"
                filterable
                multiple
                @focus="changeApproverlList('')"
                @clear="changeApproverlList('')"
                @change="changeApproverlList"
                v-selectLazyLoad="approverListloading"
              >
                <el-option
                  v-for="v in userList"
                  :key="v.username"
                  :label="v.fullUserName+'('+v.username+')'"
                  :value="v.username"
                ></el-option>
              </datablau-select>
            </el-form-item> -->
            <el-form-item label="上传文件">
              <datablau-upload
                :isEdit="true"
                :drag="true"
                :action="action"
                :show-file-list="true"
                limitNum="1"
                :file-list="fileList"
                list-type="text"
                :auto-upload="false"
                :on-change="upChange"
                :accept="accept"
                :mini="true"
                :http-request="distribution"
              >
                <i class="iconfont icon-upload"></i>
                <span>点击上传</span>
                <div slot="tip" class="el-upload__tip">只能上传.zip文件</div>
              </datablau-upload>
            </el-form-item>
          </datablau-form>
        </div>
        <span slot="footer">
          <datablau-button @click="closeBtn" type="secondary">取 消</datablau-button>
          <datablau-button type="primary" @click="distribution">
            确 定
          </datablau-button>
          <!-- <datablau-tooltip
            content="当前选择开发需求未绑定工作流"
            style="display: inline-block;marginLeft:8px"
            v-if="processNameList.length === 0"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip> -->
        </span>

        <!--<datablau-form-submit>
          <datablau-table
          :data="workList"
          height="100%"
          :single-select="true"
          row-key="id"
          @selection-change="handleSelectionChange"
          >
            <el-table-column
              label="工作流名称"
              show-overflow-tooltip

              prop="name">
            </el-table-column>
            <el-table-column
              label="状态"
              show-overflow-tooltip

              prop="releaseState">
              <template scope="{row}">
                {{row.releaseState === 'OFFLINE' ? '下线' : '上线'}}
              </template>
            </el-table-column>
            <el-table-column
              label="创建时间"
              show-overflow-tooltip

              prop="createTime">
            </el-table-column>
            <el-table-column
              label="更新时间"
              show-overflow-tooltip

              prop="updateTime">
            </el-table-column>
            <el-table-column
              label="描述"
              show-overflow-tooltip

              prop="description">
            </el-table-column>
            <el-table-column
              label="创建用户"
              show-overflow-tooltip

              prop="userName">
            </el-table-column>
            <el-table-column
              label="修改用户"
              show-overflow-tooltip

              prop="modifyBy">
            </el-table-column>
            <el-table-column
              label="定时状态"
              show-overflow-tooltip

              prop="scheduleReleaseState">
              <template scope="{row}">
                {{row.scheduleReleaseState === 'ONLINE' ? '上线' : row.scheduleReleaseState === 'OFFLINE' ? '下线' : '-'}}
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <datablau-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="workPageNo"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="workPageSize"
              :total="workTotal"
              :layout="'total, sizes, prev, pager, next, jumper'"
            ></datablau-pagination>
            <div style="float: right">
              <datablau-button @click="showChangeList = false" type="secondary">取 消</datablau-button>
              <datablau-button type="primary" :disabled="!selectionObj.code" @click="distribution">
                确 定
              </datablau-button>
            </div>
          </template>
        </datablau-form-submit>-->
      </datablau-dialog>
      <datablau-dialog
        :visible.sync="dialogVisible"
        title="添加项目成员"
        width="720px"
        height="560px"
        append-to-body
      >
          <div class="contentSelect">
            <div
              class="leftbox"
              v-loading="loading"
              v-selectLazyLoad="lazyloading"
            >
              <datablau-input
                v-model="nameInput"
                :iconfont-state="true"
                :placeholder="'搜索用户名'"
                clearable
                class="nameInput"
              ></datablau-input>
              <datablau-tree
                ref="treeList"
                auto-expand-parent
                default-expand-all
                class="treeList"
                :data="userList"
                show-checkbox
                node-key="id"
                highlight-current
                :props="defaultProps"
                :render-content="renderContent"
                :filter-node-method="filterNodeNameInput"
                @check="checkedList"
              ></datablau-tree>
            </div>
            <div class="rightSelect">
              已选择{{checkedUsers.length}}名
              <ul class="selectPeo">
                <li v-for="(item, index) in checkedUsers" :key="item.id">
                  <div class="selLeft">
                    <datablau-tooltip
                      effect="dark"
                      class="authTypeObj"
                      :content="(item.fullUserName + '('+ item.username + ')')"
                      placement="bottom"
                      :disabled="(item.fullUserName + '('+ item.username + ')').length<=8"
                    >
                      <span v-if="(item.fullUserName + item.username).length>8">{{(item.fullUserName + '('+ item.username + ')').substr(0,8)+'…'}}</span>
                      <span v-else>{{item.fullUserName}}({{item.username}})</span>
                    </datablau-tooltip>
                  </div>
                  <div class="selRight">
                    <datablau-dropdown trigger="click" :hide-on-click="false">
                      <span class="el-dropdown-link">
                        <datablau-button
                          type="icon"
                          @click="handleClick"
                        >
                          <i class="icon-tianjia iconfont addBtn"></i>
                        </datablau-button>
                      </span>
                      <el-dropdown-menu class="dropdown" slot="dropdown">
                        <datablau-checkbox :checkboxType="'group'" v-model="item.authType" @change="authTypeChange(item)">
                          <div v-for="group in authOptions" class="groupBox" :key="group.value">
                            <el-dropdown-item>
                              <span class="labelName">{{group.label}}</span>
                            </el-dropdown-item>
                            <el-dropdown-item v-for="v in group.options" :key="v.value" >
                                <el-checkbox :label="v.value" @change="changeItemAdd(v,item)">{{v.label}}</el-checkbox>
                            </el-dropdown-item>
                          </div>
                        </datablau-checkbox>
                      </el-dropdown-menu>
                    </datablau-dropdown>
                    <datablau-tooltip
                      effect="dark"
                      class="authTypeObj"
                      :content="item.authTypeObj.join('、')"
                      placement="bottom"
                      :disabled="item.authTypeObj.length <3"
                    >
                      <div class="textObjBox">
                        <span v-if="item.authTypeObj.length<3">
                          <span v-for="v in item.authTypeObj" :key="v" class="bgSpan">{{v}}</span>
                        </span>
                        <span v-else>
                          <span class="bgSpan">{{item.authTypeObj[0]}}</span>
                          <span>更多{{item.authTypeObj.length-1}}条</span>
                        </span>
                      </div>
                    </datablau-tooltip>
                    <datablau-button
                      type="icon"
                      @click="personnelDel(item, index)"
                      class="iconBtn"
                    >
                      <i class="icon-false iconfont"></i>
                    </datablau-button>
                  </div>
                </li>
              </ul>
            </div>

          </div>
          <span slot="footer">
            <datablau-button @click="dialogVisible = false" type="secondary">取 消</datablau-button>
            <datablau-button :disabled="checkedUsers.length === 0" type="primary" @click="submitUsers">
              确 定
            </datablau-button>
          </span>
        </datablau-dialog>
      <datablau-dialog
        :visible.sync="bindVisible"
        title="绑定项目"
        width="960px"
        height="460px"
        append-to-body
      >
        <div class="content">
          <datablau-input placeholder="请输入项目名称" v-model="password" clearable @clear="keySearch" @keyup.enter.native="keySearch"></datablau-input>
          <datablau-table
            :data="tableData"
            ref="binTable"
            show-overflow-tooltip
            v-loading="binLoading"
          >
            <el-table-column
              header-align="center"
              align="center"
              prop="columnProp"
              label=""
              width="45"
            >
              <template slot-scope="scope">
                <el-radio
                  class="radioSel"
                  :label="scope.row.id"
                  v-model="signChecked"
                  :checked="scope.row.checked"
                  :disabled="scope.row.disabled"
                  @change.native="branchSelectList( scope.row)"
                ></el-radio>
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              label="项目名称"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="userName"
              label="所属用户"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="defCount"
              label="工作流定义数"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="instRunningCount"
              label="正在运行的流程数"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="description"
              label="描述"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="updateTime"
              label="更新时间"
              show-overflow-tooltip>
            </el-table-column>
          </datablau-table>
        </div>
        <span slot="footer">
          <datablau-pagination
            class="logPagination"
            style="float: left"
            @size-change="binSizeChangeLog"
            @current-change="binCurrentChangeLog"
            :current-page.sync="bind.page"
            :page-sizes="[20, 50, 100]"
            :page-size="bind.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="bind.total"
          ></datablau-pagination>
            <datablau-button @click="bindVisible = false" type="secondary">取 消</datablau-button>
            <datablau-button  type="primary" @click="submitBind">
              确 定
            </datablau-button>
        </span>
      </datablau-dialog>
      <datablau-dialog
        :visible.sync="addDemandrVisible"
        title="添加开发需求"
        width="960px"
        height="460px"
        append-to-body
      >
        <div class="content">
          <div style="position: absolute;top:0;bottom:0;left:20px;right:20px">
            <datablau-table
              :data="tableDataDemand"
              tooltip-effect="dark"
              data-selectable
              @selection-change="handleSelectionChangDemande"
              @sort-change="handleSortChangeDemand"
              height="100%"
            >
              <el-table-column
                min-width="100"
                :label="$t('indicator.demand.code')"
                prop="requirementCode"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.requirementCode }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="140"
                :label="$t('indicator.demand.name')"
                prop="name"
                sortable="custom"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.name }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="100"
                :label="$t('indicator.demand.priority')"
                prop="requirementPriority"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.requirementPriority }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="100"
                :label="$t('indicator.demand.state')"
                prop="requirementStauts"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <span
                    :style="`color:${getStatusColor(scope.row.requirementStauts)}`"
                  >
                    <span
                      :style="`background-color:${getStatusColor(
                        scope.row.requirementStauts
                      )}`"
                      class="circle"
                    ></span>
                    {{ statusFormatter(scope.row.requirementStauts) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                min-width="100"
                :label="$t('indicator.demand.module')"
                prop="module"
                sortable="custom"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ $t('indicator.demand.' + scope.row.module) }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="100"
                :label="$t('indicator.demand.owner')"
                prop="requirementLeader"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.requirementLeader }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                :label="$t('meta.DS.tableDetail.changeHistory.submitTime')"
                prop="requirementCreatTime"
                sortable="custom"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{
                    scope.row.requirementCreatTime
                      ? $timeFormatter(scope.row.requirementCreatTime).slice(0, 16)
                      : ''
                  }}
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </div>
        <span slot="footer">
          <datablau-pagination
            @size-change="handleSizeChangeDemand"
            @current-change="handleCurrentChangeDemand"
            :current-page="currentPageDemand"
            :page-sizes="[20, 50, 100, 500]"
            :page-size="pageSizeDemand"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalItemsDemand"
          ></datablau-pagination>
            <datablau-button @click="addDemandrVisible = false" type="secondary">取 消</datablau-button>
            <datablau-button  type="primary" @click="submitBindDemand" :disabled="selectionDemande.length === 0">
              确 定
            </datablau-button>
        </span>
      </datablau-dialog>
      <datablau-dialog
        :visible.sync="projectsDataVisible"
        :title="projectsDataTitle"
        width="960px"
        height="460px"
        append-to-body
      >
        <div class="content">
          <datablau-input :iconfont-state="true" v-model="projectsKeyword" placeholder="请输入项目名称" size="normal" clearable></datablau-input>
          <datablau-button type="important" style="margin-left:8px"  @click="projectsSearch">搜索</datablau-button>
          <div style="position: absolute;top:46px;bottom:0;left:20px;right:20px">
            <datablau-table
              v-loading="projectsDataLoading"
              :data="projectsData"
              tooltip-effect="dark"
              single-select
              @selection-change="handleSelectionChangProjects"
              height="100%"
            >
              <el-table-column
                min-width="100"
                label="项目名称"
                prop="name"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.name }}
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </div>
        <span slot="footer">
          <datablau-pagination
            @size-change="handleSizeChangeProjects"
            @current-change="handleCurrentChangeProjects"
            :current-page="projectsPageNo"
            :page-sizes="[20, 50, 100, 500]"
            :page-size="projectsPageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalItemsProjects"
          ></datablau-pagination>
            <datablau-button @click="closeProjects" type="secondary">取 消</datablau-button>
            <datablau-button  type="primary" @click="releaseLaunch" :disabled="selectionProjects.length===0">
              确 定
            </datablau-button>
        </span>
      </datablau-dialog>
      <datablau-dialog
          :visible.sync="showUsersApplyExamine"
          title="审批"
          width="500px"
          append-to-body
          >
        <div class="content">
          <datablau-form
            size="small"
            label-width='90px'
            :model="formExamine"
            ref="form"
          >
            <el-form-item
              label="选择审批人"
              prop="approver"
            >
              <datablau-select
                v-model="formExamine.approver"
                size="mini"
                clearable
                style="width: 300px;"
                filterable
                multiple
                remote
                :remote-method="remoteMethod"
                @focus="changeApproverlList('')"
                @clear="changeApproverlList('')"
                @change="changeApproverlList"
                v-selectLazyLoad="approverListloading"
              >
                <el-option
                  v-for="v in userList"
                  :key="v.username"
                  :label="v.fullUserName+'('+v.username+')'"
                  :value="v.username"
                ></el-option>
              </datablau-select>
            </el-form-item>
          </datablau-form>
        </div>
        <span slot="footer">
          <datablau-button @click="closeBtnExamine" type="secondary">取 消</datablau-button>
          <datablau-button type="primary" :disabled="formExamine.approver.length === 0" @click="applicationApproval">
            确 定
          </datablau-button>
        </span>
      </datablau-dialog>
      <datablau-breadcrumb
        :couldClick="false"
        :node-data="nodeData"
        :separator="'/'"
        @back="closeDetail()"
      ></datablau-breadcrumb>
      <div class="content">
        <div class="top-box">
          <div class="left">
            <div class="imageBox">
              <img src="@/assets/images/dataWarehouse/project.svg" alt="">
            </div>
            <div class="textCon">
              <div class="name" v-if="detail.enable" @click="toCodeDetail">
                {{detail.name}}
              </div>
              <div class="name textDisabled" v-else >
                {{detail.name}}
              </div>
              <div class="text-box">
                <div class="text" >负责人：{{detail.userFirstName}}</div>
                <el-divider direction="vertical"></el-divider>
                <div class="text">创建时间：{{getTime(detail.createTime)}}</div>
                <el-divider direction="vertical"></el-divider>
                <div class="text">状态：{{detail.enable ? '开启' : '关闭'}}</div>
              </div>
            </div>
          </div>
          <div class="right">
              <div class="status-box">
                <div class="title">
                  类型
                </div>
                <div :class="`rowType c${detail.type}`">
                  {{types[detail.type]}}
                </div>
              </div>
<!--              <div class="status-box">-->
                <!--<div class="title">
                  发布状态
                </div>
                <div>
                  <span :class="`status c${detail.status}`">{{status[detail.status]}}</span>
                </div>-->
                <!--<datablau-button type="important" @click="$parent.editProject(detail, true)" v-if="hasAuth(Auth.PROJECT_EDIT)" >编辑</datablau-button>
                <datablau-button type="secondary" @click="$parent.deleteProject(detail, true)" v-if="hasAuth(Auth.PROJECT_EDIT)">删除项目</datablau-button>-->
<!--              </div>-->
          <datablau-button  type="important" @click="toCodeDetail" :disabled="!detail.enable" style="margin-right:8px">开发</datablau-button>
              <datablau-dropdown @command="handleCommand"  style="display: inline-block;float:right;" trigger="click" v-if="$store.state.user.name === detail.creator || isAdmin">
                  <datablau-button type="secondary">
                    管理
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </datablau-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item  command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item  command="delete">删除</el-dropdown-item>
                   <el-dropdown-item v-if="seniorBindProject" command="bind">绑定项目</el-dropdown-item>
                  </el-dropdown-menu>
              </datablau-dropdown>
          </div>
        </div>
        <div class="tagManage" style="margin-top: 10px;">
          <span class="label">{{ $t('meta.DS.filter.tag') }}</span>
          <el-tag
            style="margin-left: 0.3em"
            size="small"
            closable
            v-for="(v, i) in currentTag"
            @close="handleCloseTagManage(v, i)"
            v-show="currentTag && i < 5"
            :key="i"
          >
            {{ tagNames[i] }}
          </el-tag>
          <span v-if="currentTag && currentTag.length > 5">
            等{{currentTag.length}}个标签
          </span>
          <datablau-button type="text" class="iconfont icon-tianjia" @click="addTagManage" >新增标签</datablau-button>

        </div>
        <div class="description">
          <datablau-detail-subtitle title="描述" mt="10px" mb="8px"></datablau-detail-subtitle>
          <div style="
                      overflow-y:auto;
                      ">
            {{detail.description}}
            <span v-if="!detail.description" class="noresult">
              <img src="@/assets/images/dataWarehouse/noresult.svg" alt="">
              暂无信息
            </span>
          </div>
        </div>
      </div>
      <datablau-tabs :value="'demand'" @tab-click="handleClick">
        <el-tab-pane label="需求管理" name="demand" >
            <div class="tool">
              <datablau-input :iconfont-state="true" v-model="demandKeyword" placeholder="请输入需求名称" size="normal" @input="searchDemand"></datablau-input>
              <datablau-button type="important" class="iconfont icon-tianjia" @click="addDemand" v-if="hasAuth(Auth.PROJECT_MANAGE) || hasAuth(Auth.PROJECT_DEMAND)">添加</datablau-button>
            </div>
            <div class="tableBox">
              <datablau-table
                  ref="table"
                  height="100%"
                  :data="demandList"
                  svgType="data/search/error"
                >
                  <el-table-column
                    prop="name"
                    label="名称"
                    show-overflow-tooltip
                    >
                  </el-table-column>
                  <el-table-column
                    prop="requirementPriority"
                    label="优先级"
                    show-overflow-tooltip
                    >
                  </el-table-column>
                  <el-table-column
                    min-width="100"
                    label="状态"
                    prop="requirementStauts"
                    show-overflow-tooltip
                  >
                  <template slot="header" slot-scope="scope">
                      <span :data="scope.$index" class="table-label required">{{$t('indicator.demand.state')}}
                        <el-popover
                          placement="top"
                          width="818"
                          trigger="hover">
                          <datablau-detail-subtitle title="流程说明" mt="0px" mb="0"></datablau-detail-subtitle>
                          <img  src="../demandManagement/flowchart.png"  style="width:100%;height: auto;"/>
                          <span class="iconfont icon-tips" style="color: #999;font-size: 14px;;margin-left: 2px;" slot="reference"></span>
                        </el-popover>
                      </span>
                    </template>
                    <template slot-scope="scope">
                      <span
                        :style="`color:${getStatusColor(scope.row.requirementStauts)}`"
                      >
                        <span
                          :style="`background-color:${getStatusColor(
                            scope.row.requirementStauts
                          )}`"
                          class="circle"
                        ></span>
                        {{ statusFormatter(scope.row.requirementStauts) }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="requirementLeader"
                    label="负责人"
                    show-overflow-tooltip
                    >
                  </el-table-column>
                  <el-table-column
                    label="操作"
                    width="180px" v-if="hasAuth(Auth.PROJECT_MANAGE) || hasAuth(Auth.PROJECT_DEMAND)">
                    <template slot-scope="scope">
                      <datablau-button type="icon" v-if="auth['DDD_DEMAND_VIEW']" @click="handleItemClickRequirement(scope.row)">
                          <datablau-tooltip
                            :content="$t('common.button.scan')"
                            placement="bottom"
                          >
                            <i class="iconfont icon-see"></i>
                          </datablau-tooltip>
                      </datablau-button>
                      <datablau-button type="icon" v-if="auth['DDD_DEMAND_BUSINESS_EDIT'] || auth['DDD_DEMAND_TECH_EDIT']"  :disabled="!((scope.row.requirementStauts === 'A' || scope.row.requirementStauts === 'RJ') && auth['DDD_DEMAND_BUSINESS_EDIT'] && ((scope.row.requirementLeader === $store.state.user.name)|| isAdmin)) && !((scope.row.requirementStauts === 'C'||scope.row.requirementStauts === 'RK') && auth['DDD_DEMAND_TECH_EDIT'])" @click="EditClickRequirement(scope.row)">
                          <datablau-tooltip
                            :content="$t('common.button.edit')"
                            placement="bottom"
                          >
                            <i class="iconfont icon-bianji"></i>
                          </datablau-tooltip>
                        </datablau-button>
                        <datablau-button type="icon" v-if="detail.userFirstName === $store.state.user.username || isAdmin" @click.stop="unbinding(scope.row)" :disabled="!(scope.row.requirementStauts === 'RJ' || scope.row.requirementStauts === 'L')">
                          <datablau-tooltip
                            content="删除"
                            placement="bottom"
                          >
                            <i class="iconfont icon-delete"></i>
                          </datablau-tooltip>
                        </datablau-button>
                      <datablau-button type="icon" v-if="auth['DDD_DEMAND_APPROVAL']" @click="applyReleaseRequirement(scope.row)" :disabled="scope.row.requirementStauts !== 'A' && scope.row.requirementStauts !== 'C'">
                        <datablau-tooltip
                          content="审批"
                          placement="bottom"
                        >
                          <i class="iconfont icon-menu-bwdsq"></i>
                        </datablau-tooltip>
                      </datablau-button>
                    </template>
                  </el-table-column>
                </datablau-table>
            </div>
          </el-tab-pane>
        <el-tab-pane label="成员管理" name="user" >
          <div class="tool">
            <datablau-input :iconfont-state="true" v-model="keyword" placeholder="请输入用户名" size="normal" @input="search"></datablau-input>
            <datablau-button v-if="hasAuth(Auth.PROJECT_MANAGE) || hasAuth(Auth.PROJECT_MEMBER)" type="important" :disabled="!auth['DDD_PROJECT_EDIT']" class="iconfont icon-tianjia" @click="addUser">添加</datablau-button>
          </div>
          <div class="tableBox">
            <datablau-table
                ref="table"
                height="100%"
                :data="displayList"
                svgType="data/search/error"
              >
                <el-table-column
                  prop="username"
                  label="登录名"
                  show-overflow-tooltip
                  >
                </el-table-column>
                <el-table-column
                  prop="firstName"
                  label="姓名"
                  show-overflow-tooltip
                  >
                </el-table-column>
                <el-table-column
                  prop="fullName"
                  label="机构"
                  show-overflow-tooltip
                  >
                </el-table-column>
                <el-table-column
                  prop="title"
                  label="职位"
                  show-overflow-tooltip
                  >
                </el-table-column>
                <el-table-column
                  prop="group"
                  label="系统角色"
                  show-overflow-tooltip
                  >
                </el-table-column>
                <!-- <el-table-column
                  prop="fullUserName"
                  label="姓名"
                  show-overflow-tooltip
                  >
                </el-table-column>
                <el-table-column
                  prop="orgFullName"
                  label="部门"
                  show-overflow-tooltip
                  >
                </el-table-column>
                <el-table-column
                  prop="emailAddress"
                  label="Email"
                  show-overflow-tooltip
                  >
                </el-table-column> -->
                <el-table-column
                  prop="username"
                  label="权限"
                  show-overflow-tooltip
                  width="440px"
                  align="left"
                  >
                  <template slot-scope="{row}">
                    <div class="authority">
                      <datablau-dropdown trigger="click" :hide-on-click="false">
                      <span class="el-dropdown-link">
                        <datablau-button
                          type="icon"
                          @click="handleClick"
                          v-if="hasAuth(Auth.PROJECT_MANAGE) || hasAuth(Auth.PROJECT_MEMBER)"
                          :disabled="!hasAuth(Auth.PROJECT_MANAGE) && !hasAuth(Auth.PROJECT_MEMBER)"
                        >
                          <i class="icon-tianjia iconfont"></i>
                        </datablau-button>
                      </span>
                      <el-dropdown-menu class="dropdown" slot="dropdown" v-show="hasAuth(Auth.PROJECT_MANAGE) || hasAuth(Auth.PROJECT_MEMBER)">
                        <datablau-checkbox :checkboxType="'group'" v-model="row.authType" @change="val =>changeAuth(row)">
                          <div v-for="group in authOptions" class="groupBox" :key="group.value">
                            <el-dropdown-item>
                              <span class="labelName">{{group.label}}</span>
                            </el-dropdown-item>
                            <el-dropdown-item v-for="v in group.options" :key="v.value" >
                              <el-checkbox :label="v.value" @change="changeItem(v,row)">{{v.label}}</el-checkbox>
                            </el-dropdown-item>
                          </div>
                        </datablau-checkbox>
                      </el-dropdown-menu>
                    </datablau-dropdown>
                      <el-tooltip
                        class="authTypeObj"
                        popper-class="tooltipBox"
                        effect="light"
                        placement="bottom"
                        :disabled="row.authTypeMes.length <4"
                      >
                        <div slot="content">
                          <div class="rangeTil">权限范围</div>
                          <div class="typeList" v-for="(item, key) in sourceType(row.authType)" :key="key">
                            <span class="til">{{key}}</span>
                            <span class="bgSpan" v-for="v in item" :key="v">{{v}}</span>
                          </div>
                        </div>
                        <div class="textObjBox">
                          <span  v-show="i<4" v-for="(v, i) in row.authTypeMes" :key="v" class="bgSpan">{{v}}</span>
                          <span  v-show="row.authTypeMes.length>4"><span>更多{{row.authTypeMes.length-4}}条</span></span>
                        </div>
                      </el-tooltip>
                    </div>
                    <!-- <datablau-tooltip
                      :content="scope.row.authTypeMes || '暂无权限'"
                      placement="left"
                      effect="dark"
                    >
                    <datablau-select
                        :disabled="!hasAuth(Auth.PROJECT_MEMBER_MANAGEMENT)"
                        v-model="scope.row.authType"
                        multiple
                        collapse-tags
                        style="margin-left: 20px;"
                        placeholder="请选择"
                        @change="val =>changeAuth(scope.row)"
                      >
                      <el-option-group
                        v-for="group in authOptions"
                        :key="group.label"
                        :label="group.label">
                        <el-option
                          v-for="item in group.options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-option-group>
                    </datablau-select>
                      </datablau-tooltip>-->
                  </template>
                </el-table-column>
                <el-table-column
                  label="启用状态"
                  width="100px"
                >
                  <template slot-scope="{row}">
                    <datablau-switch
                      v-model="row.enabled"
                      @change="changeEnabled(row)"
                      :disabled="!hasAuth(Auth.PROJECT_MANAGE) && !hasAuth(Auth.PROJECT_MEMBER)"
                    ></datablau-switch>
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="80px">
                  <template slot-scope="scope">
                    <datablau-tooltip
                        effect="dark"
                        content="删除"
                        placement="bottom"
                      >
                      <datablau-button :disabled="!hasAuth(Auth.PROJECT_MANAGE) && !hasAuth(Auth.PROJECT_MEMBER)" type="icon" @click.stop="deleteAuth(scope.row)" class="iconfont icon-delete"></datablau-button>
                    </datablau-tooltip>
                  </template>
                </el-table-column>
              </datablau-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="发布管理" name="branch">
          <datablau-button  @click="getWorkflowList" type="important"  v-if="hasAuth(Auth.PROJECT_MANAGE) || hasAuth(Auth.PROJECT_PUBLISH)">版本发布</datablau-button>
          <div class="tableBox">
            <datablau-table
            ref="table"
            height="100%"
            :data="branchList"
            svgType="data/search/error"
          >
            <el-table-column
              prop="version"
              label="版本名"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              prop="requirementName"
              label="需求名称"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态"
              show-overflow-tooltip
            >
              <template scope="{row}">
                <!--<span :class="`status c${row.status}`">{{status[row.status]}}</span>-->
                <datablau-status
                  style="width: 150px"
                  :type="statusTypeList[row.status]"
                  :desc="status[row.status]"
                ></datablau-status>
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              prop="updateTime"
              label="更新时间"
              show-overflow-tooltip
            >
            </el-table-column>
            <el-table-column
              prop="status"
              label="操作"
              width="280px"
              align="center"
              show-overflow-tooltip
              v-if="hasAuth(Auth.PROJECT_MANAGE) || hasAuth(Auth.PROJECT_PUBLISH)"
            >
              <template scope="{row}">
                <!--0是开发中 1是待审批 2是已发布-->
<!--                <datablau-button v-if="hasAuth(Auth.PROJECT_ONLINE)" :disabled="row.status === '1' || row.status === '2' " type="text" @click="addPublish(row.branch, 'line')">发版</datablau-button>-->
<!--                <datablau-button v-if="hasAuth(Auth.PROJECT_ONLINE)" :disabled="row.status === '1' || row.status === '0'" type="text" @click="addPublish(row.branch, 'offline')">下线</datablau-button>-->
                <el-dropdown trigger="click"  @command="
                  (command) => {
                    addPublish(command, row, 'downloadFile');
                  }
                " :disabled="row.status !== '2'">
                  <span class="el-dropdown-link">
                    <datablau-button :disabled="row.status !== '2'" type="text" >版本文档<i class="el-icon-arrow-down el-icon--right"></i></datablau-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="item.value" v-for="(item,index) in envOption" :key="index">{{ item.label }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-dropdown trigger="click"  @command="
                  (command) => {
                    addPublish(command, row, 'downloadWork');
                  }
                " :disabled="row.status !== '2'">
                  <span class="el-dropdown-link">
                    <datablau-button  :disabled="row.status !== '2'" type="text" >工作流文档<i class="el-icon-arrow-down el-icon--right"></i></datablau-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="item.value" v-for="(item,index) in envOption" :key="index">{{ item.label }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-dropdown trigger="click"  @command="modelValueChange" :disabled="row.status !== '2'">
                  <span class="el-dropdown-link">
                    <datablau-button @click="dropdownRow(row)"  :disabled="row.status !== '2'" type="text">上线<i class="el-icon-arrow-down el-icon--right"></i></datablau-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="item.value" v-for="(item,index) in envOption" :key="index">{{ item.label }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </el-table-column>
          </datablau-table>
          </div>
        </el-tab-pane>
          <el-tab-pane label="日志管理" name="log"  style="position: absolute;inset: 34px 0px 0px;">
            <div class="log-content">
              <div class="logSearch">
                <datablau-input
                  v-model="logKeyWord"
                  :iconfont-state="true"
                  placeholder="按操作人查询"
                  clearable
                ></datablau-input>
                <datablau-button
                  type="normal"
                  @click="logSearch"
                  style="margin-left: 8px;"
                >搜索</datablau-button>
              </div>
              <div class="logTable">
                <datablau-table
                  :data="tableLogData"
                  class="datablau-table table"
                  height="100%"
                  :show-column-selection="false"
                >
                <el-table-column
                    prop="itemId"
                    label="ID"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="itemName"
                    label="名称"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="operation"
                    label="操作动作"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="operator"
                    label="操作人"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    prop="createTime"
                    label="操作时间"
                    width="190"
                    :formatter="$timeFormatter"
                  ></el-table-column>
                </datablau-table>
              </div>
              <datablau-pagination
                class="logPagination"
                @size-change="handleSizeChangeLog"
                @current-change="handleCurrentChangeLog"
                :current-page.sync="logCurrentPage"
                :page-sizes="[20, 50, 100]"
                :page-size="logPageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="logTotalItems"
              ></datablau-pagination>
            </div>
          </el-tab-pane>
        <el-tab-pane label="血缘解析" name="analysis" style="position: absolute;inset: 34px 0px 0px;">
          <div class="log-content">
            <div class="tool">
              <datablau-input :iconfont-state="true" v-model="requirement" placeholder="请输入程序名称" size="normal" @input="requirementSearch"></datablau-input>
              <datablau-button v-if="hasAuth(Auth.PROJECT_MANAGE) || hasAuth(Auth.PROJECT_ANALYSIS)" type="important" :disabled="disRun" @click="requirementClick">一键血缘解析</datablau-button>
              <datablau-button v-if="hasAuth(Auth.PROJECT_MANAGE) || hasAuth(Auth.PROJECT_ANALYSIS)" type="normal" :disabled="requirementList && !requirementList.length"  style="margin-right:10px" @click="clearing">清除解析日志</datablau-button>
            </div>
            <div class="logTable">
              <datablau-table
                ref="table"
                height="100%"
                :data="requirementList"
                svgType="data/search/error"
              >
                <el-table-column
                  prop="filePath"
                  label="程序目录"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="fileName"
                  label="程序名称"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="projectVersionName"
                  label="项目版本"
                  show-overflow-tooltip
                >
                  <template scope="{row}">
                    <span>{{row.isLatest ? 'Latest' : row.projectVersionName}}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="analysisStatus"
                  label="解析状态"
                  show-overflow-tooltip
                >
                  <template scope="{row}">
                   <!-- <span>{{row.analysisStatus === 1 ? '成功' : '失败'}}</span>-->
                    <datablau-status
                      style="width: 150px"
                      v-if="row.analysisStatus === 1"
                      :type="4"
                      :desc="'成功'"
                    ></datablau-status>
                    <datablau-status
                      style="width: 150px"
                      v-else-if="row.analysisStatus === 0"
                      :type="2"
                      :desc="'运行中'"
                    ></datablau-status>
                    <datablau-tooltip class="item" effect="dark" v-else :content="row.errorMessage" placement="top">
                      <datablau-status
                        style="width: 150px"
                        :type="5"
                        :desc="'失败'"
                      ></datablau-status>
                    </datablau-tooltip>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="analysisTimeFormat"
                  label="解析时间"
                  :formatter="$timeFormatter"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  prop="username"
                  label="操作"
                  align="center"
                  v-if="hasAuth(Auth.PROJECT_MANAGE) || hasAuth(Auth.PROJECT_ANALYSIS)"
                >
                  <template scope="{row}">
                    <!-- <datablau-tooltip class="item" effect="dark" content="数据迁移文件不支持刷新血缘" placement="top" :disabled="row.type!==15"> -->
                      <datablau-button type="text" :disabled="row.refreshDisRun" @click="requirementRefresh(row)">刷新血缘</datablau-button>
                    <!-- </datablau-tooltip> -->
                  </template>
                </el-table-column>
              </datablau-table>
            </div>
            <datablau-pagination
            class="logPagination"
            @size-change="handleSizeChangeLogAnaly"
            @current-change="handleCurrentChangeLogAnaly"
            :current-page.sync="page"
            :page-sizes="[20, 50, 100]"
            :page-size="size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalAnaly"
          ></datablau-pagination>
          </div>
        </el-tab-pane>
      </datablau-tabs>
    </div>
</template>
<script>
import moment from 'moment'
import { Auth, AuthLabel } from '@/dataWarehouse/views/project/Auth'
import HTTP from '@/dataWarehouse/resource/http'

export default {
  props: ['id', 'name'],
  data () {
    return {
      Auth: Auth,
      dialogVisible: false,
      userList: [],
      keyword: '',
      total: 0,
      pageSize: 20,
      currentPage: 1,
      activeName: 'user',
      nodeData: [
        '项目管理'
      ],
      detail: {},
      checkedUsers: [],
      isClearSelections: false,
      displayList: [],
      authOptions: [
        {
          label: '项目管理',
          options: [
            {
              label: AuthLabel[Auth.PROJECT_MANAGE],
              value: Auth[Auth.PROJECT_MANAGE],
              class: false
            },
            {
              label: AuthLabel[Auth.PROJECT_DEMAND],
              value: Auth[Auth.PROJECT_DEMAND]
            },
            {
              label: AuthLabel[Auth.PROJECT_MEMBER],
              value: Auth[Auth.PROJECT_MEMBER]
            },
            {
              label: AuthLabel[Auth.PROJECT_PUBLISH],
              value: Auth[Auth.PROJECT_PUBLISH]
            },
            {
              label: AuthLabel[Auth.PROJECT_LOG],
              value: Auth[Auth.PROJECT_LOG]
            },
            {
              label: AuthLabel[Auth.PROJECT_ANALYSIS],
              value: Auth[Auth.PROJECT_ANALYSIS]
            }
          ]
        },
        {
          label: '数据模型',
          options: [
            {
              label: AuthLabel[Auth.MODEL_VIEW],
              value: Auth[Auth.MODEL_VIEW]
            },
            {
              label: AuthLabel[Auth.MODEL_EDIT],
              value: Auth[Auth.MODEL_EDIT]
            }
          ]
        },
        {
          label: '开发程序',
          options: [
            {
              label: AuthLabel[Auth.PROCEDURE_VIEW],
              value: Auth[Auth.PROCEDURE_VIEW]
            },
            {
              label: AuthLabel[Auth.PROCEDURE_EDIT],
              value: Auth[Auth.PROCEDURE_EDIT]
            }
          ]
        },
        {
          label: '工作流',
          options: [
            {
              label: AuthLabel[Auth.WORKFLOW_MANAGEMENT],
              value: Auth[Auth.WORKFLOW_MANAGEMENT]
            }
          ]
        }
      ],
      userList2: [],
      types: {},
      status: {
        0: '已驳回',
        1: '审批中',
        2: '已发布',
        3: '已撤回'
      },
      statusTypeList: {
        0: 5,
        1: 2,
        2: 4,
        3: 7
      },
      loading: false,
      udpList: [],
      showUdp: false,
      udpLoading: false,
      showUdpSelector: false,
      allUdps: [],
      checkedUdp: [],
      udpMap: [],
      udpValue: '',
      showUdpEdit: true,
      isAdmin: this.$store.state.user.isAdmin,
      authList: [],
      checkDisabledObj: {
        username: []
      },
      totalFlow: 0,
      flows: [],
      flowSize: 20,
      flowPage: 1,
      showFlow: false,
      checkedFlows: [],
      formContent: {
        branchName: ''
      },
      tableLogData: [],
      logCurrentPage: 1,
      logPageSize: 20,
      logTotalItems: 0,
      logKeyWord: '',
      defaultProps: {
        children: 'children',
        label: 'username'
      },
      nameInput: '',
      firstTimeout: null,
      branchList: [],
      titleLog: '',
      tabName: 'user',
      bindVisible: false,
      dsProjectId: {},
      binLoading: false,
      tableData: [],
      bind: {
        page: 1,
        size: 20,
        total: 0
      },
      signChecked: false,
      bindList: [],
      password: '',
      workCode: 0,
      workPageNo: 1,
      workPageSize: 20,
      searchVal: '',
      workList: [],
      workTotal: 0,
      showChangeList: false,
      selectionObj: {},
      formWork: {
        name: '',
        approver: [],
        workflowCode: [],
        confirmedId: []
      },
      rules: {
        version: {
          required: true,
          message: '请输入版本名称',
          trigger: 'blur'
        },
        workflowCode: {
          required: true,
          message: '请选择工作流',
          trigger: 'blur'
        },
        confirmedId: {
          required: true,
          message: '请选择工作流',
          trigger: 'blur'
        },
        approver: {
          required: true,
          message: '请选择审批人',
          trigger: 'blur'
        }
      },
      auth: this.$store.state.$auth,
      action: '',
      accept: '.zip',
      fileList: [],
      seniorBindProject: false,
      requirement: '',
      requirementList: null,
      size: 20,
      page: 1,
      totalAnaly: 0,
      interval: null,
      refreshInterval: null,
      disRun: false,
      refreshDisRun: false,
      demandList: [],
      // 需求优先级
      priorityOptions: [
        {
          value: 0,
          label: 'P1'
        },
        {
          value: 1,
          label: 'P2'
        },
        {
          value: 3,
          label: 'P3'
        }
      ],
      demandListArr: [],
      demandKeyword: '',
      addDemandrVisible: false,
      tableDataDemand: [],
      currentPageDemand: 1,
      pageSizeDemand: 20,
      totalItemsDemand: 0,
      selectionDemande: [],
      orderIsAsc: false,
      orderBy: 'requirementCreatTime',
      projectsData: [],
      projectsPageNo: 1,
      projectsPageSize: 20,
      totalItemsProjects: 0,
      projectsDataVisible: false,
      environment: '',
      projectsDataLoading: true,
      versionld: null,
      selectionProjects: [],
      projectsKeyword: '',
      projectsDataTitle: '',
      formExamine: {
        approver: []
      },
      applyReleaseList: null,
      showUsersApplyExamine: false,
      envOption: [],
      stautsOptionsList: {
        'A': '待审核',
        'RA': '审批中',
        'RJ': '已拒绝',
        'C': '已确认',
        'RC': '验收中',
        'RK': '验收未通过',
        'R': '验收通过',
        'RG': '需求变更审核中',
        'RL': '需求废弃审核中',
        'L': '已废弃'
      },
      confirmedList: [],
      processNameList: [],
      requirementName: [],
      currentTag: null,
      tagNames: null
    }
  },
  mounted () {
    this.init()
    $(document).on('keydown', this.advancedSetting)
  },
  beforeDestroy () {
    $(document).off('keydown')
  },
  methods: {
    gettagsAll (tagArr) {
      this.$http.post(`${this.$baseUrl}/tags/getAllTags`)
        .then(res => {
          this.currentTag = []
          res.data.forEach(element => {
            tagArr.forEach(item => {
              if (element.name === item) {
                this.currentTag.push(element.tagId)
              }
            })
          })
        }).catch(err => {
          this.$showFailure(err)
        })
    },
    handleCloseTagManage (v, i) {
      this.currentTag.splice(i, 1)
      this.tagNames.splice(i, 1)
      this.$parent.modifyProjectTag(this.detail, this.tagNames, 'close')
    },
    addTagManage () {
      this.$bus.$once('tagSelected', ({ keys, names }) => {
        if (keys && names) {
          this.currentTag = keys
          this.tagNames = names
          this.$parent.modifyProjectTag(this.detail, this.tagNames)
        }
      })
      this.$bus.$emit('callSelectorDialog', {
        type: 'tag',
        tagIds: this.currentTag
      })
    },
    changeConfirmedList (val, index) {
      let workflowCode = []
      let requirementName = []
      this.formWork.confirmedId.forEach(element => {
        this.confirmedList.forEach(item => {
          if (element === item.id) {
            requirementName.push(item.name)
            if (item.workflowCode) {
              item.workflowCode.forEach(code => {
                workflowCode.push(code)
              })
            }
          }
        })
      })
      this.formWork.workflowCode = [...new Set(workflowCode)]
      this.requirementName = requirementName
      this.getProcessName(new Set(workflowCode))
    },
    getProcessName (code) {
      this.$http.post(`${this.$dddUrl}/service/workflow/${this.id}/processName`, code)
        .then(res => {
          this.processNameList = res.data
        }).catch(err => {
          this.$showFailure(err)
        })
    },
    filterNodeNameInput (value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'fullUserName')) {
          return true
        }
        current = current.parent
      } while (current && current.data.fullUserName)
      return false
    },
    getEnvOption () {
      this.$http.get(`${this.$dddUrl}/service/local/ds-envs`).then(res => {
        let deWeightThree = () => {
          let map = new Map()
          for (let item of res.data) {
            if (!map.has(item.env)) {
              map.set(item.env, {
                value: item.env,
                label: item.env.toLocaleUpperCase()
              })
            }
          }
          return [...map.values()]
        }
        this.envOption = deWeightThree()
      })
    },
    closeProjects () {
      this.projectsDataVisible = false
    },
    projectsSearch () {
      this.getprojectsData()
    },
    getprojectsData () {
      this.projectsDataLoading = true
      this.selectionProjects = []
      this.$http.get(`${this.$dddUrl}/service/project/dolphin?pageSize=${this.projectsPageSize}&pageNo=${this.projectsPageNo}&searchVal=${this.projectsKeyword}&env=${this.environment}`).then(res => {
        this.projectsDataLoading = false
        this.projectsData = res.data.data.totalList
        this.totalItemsProjects = res.data.data.total
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleSelectionChangProjects (val) {
      this.selectionProjects = val
    },
    handleSizeChangeProjects (val) {
      this.projectsPageSize = val
      this.getprojectsData()
    },
    handleCurrentChangeProjects (val) {
      this.projectsPageNo = val
      this.getprojectsData()
    },
    releaseLaunch () {
      this.$http.post(`${this.$dddUrl}/service/workflow/${this.selectionProjects.code}/import?projectId=${this.id}&versionId=${this.versionld}&env=${this.environment}`)
        .then(res => {
          this.$blauShowSuccess('上线成功')
          this.projectsDataVisible = false
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    dropdownRow (row) {
      this.versionld = row.id
    },
    modelValueChange (value) {
      this.environment = value
      this.getprojectsData()
      this.projectsDataTitle = '上线到' + this.environment.toUpperCase()
      this.projectsDataVisible = true
    },
    // 需求查看
    handleItemClickRequirement (row) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + `main/demandManage?id=${row.id}&type=scan`)
    },
    // 需求编辑
    EditClickRequirement (row) {
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + `main/demandManage?id=${row.id}&type=edit`)
    },
    // 需求审批
    applyReleaseRequirement (row) {
      this.applyReleaseList = row
      // this.formExamine.approver = []
      // this.showUsersApplyExamine = true
      this.applicationApproval()
    },
    // 需求解绑
    unbinding (row) {
      this.$http.get(`${this.$dddUrl}/service/project/requirement/unbind?projectId=${this.id}&requirementId=${row.id}&requirementName=${row.name}`)
        .then(res => {
          this.$blauShowSuccess('解绑成功')
          this.init()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    closeBtnExamine () {
      this.showUsersApplyExamine = false
    },
    // 需求审批
    applicationApproval () {
      let priority = null
      this.priorityOptions.forEach(element => {
        if (element.label === this.applyReleaseList.requirementPriority) {
          priority = element.value
        }
      })
      let requestBody = {
        'id': this.applyReleaseList.id,
        'requirementCode': this.applyReleaseList.requirementCode,
        'name': this.applyReleaseList.name,
        'status': this.applyReleaseList.requirementStauts,
        'priority': priority,
        'module': this.applyReleaseList.module,
        'type': this.applyReleaseList.dmndType,
        'director': this.applyReleaseList.requirementLeader,
        'directory': this.applyReleaseList.categoryId,
        'projectId': Number(this.id)
        // 'approver': this.formExamine.approver.join(',')
      }

      this.$http.post(`${this.$dddUrl}/service/project/requirement/publish`, requestBody)
        .then(res => {
          this.$message.success('申请成功')
          this.showUsersApplyExamine = false
          this.getdemandList()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    submitBindDemand () {
      let idArr = []
      this.selectionDemande.forEach(element => {
        idArr.push({
          id: element.id,
          name: element.name
        })
      })
      this.$http.post(`${this.$dddUrl}/service/project/requirement/bind?projectId=${this.id}`, idArr)
        .then(res => {
          this.addDemandrVisible = false
          this.$blauShowSuccess('绑定成功')
          this.init()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    handleSelectionChangDemande (val) {
      this.selectionDemande = val
    },
    handleSortChangeDemand (sortData) {
      this.orderIsAsc = sortData.order === 'ascending'
      this.orderBy = sortData.prop
      this.getData()
    },
    handleSizeChangeDemand (val) {
      this.pageSizeDemand = val
      this.getData()
    },
    handleCurrentChangeDemand (val) {
      this.currentPageDemand = val
      this.getData()
    },
    // 获取需求列表
    getData () {
      let url = this.$domains + `requirementmanagement/page/filter`
      let body = {
        categoryId: null,
        currentPage: this.currentPageDemand,
        dmndType: null,
        keyword: '',
        pageSize: this.pageSizeDemand,
        requirementStatus: 'A',
        orderBy: this.orderBy ? this.orderBy : null,
        orderIsAsc: this.orderIsAsc,
        isBinding: 0,
        module: 'D3'
      }
      this.$http
        .post(url, body)
        .then(res => {
          this.tableDataDemand = res.data.content
          this.totalItemsDemand = res.data.totalItems
          // 翻译需求优先级
          this.tableDataDemand.forEach(element => {
            if (element.module == null) {
              element.module = ''
            }
            if (element.requirementPriority !== null) {
              element.requirementPriority = this.priorityOptions.filter(
                item => item.value === element.requirementPriority
              )[0].label
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addDemand () {
      this.orderBy = 'requirementCreatTime'
      this.orderIsAsc = false
      this.getData()
      this.addDemandrVisible = true
    },
    getdemandList () {
      let obj = {
        requirements: this.detail.requirementId
      }
      this.$http.post(this.$domains + `requirementmanagement/requirements`, this.detail.requirementId)
        .then(res => {
          this.demandListArr = res.data
          this.demandList = res.data
          this.confirmedList = res.data.filter(
            item => item.requirementStauts === 'R'
          )
          this.confirmedList.forEach(element => {
            if (element.workflowCode && element.workflowCode.length > 0) {
              element.disabled = false
            } else {
              element.disabled = true
            }
          })
          // 翻译需求优先级
          this.demandList.forEach(element => {
            if (element.module == null) {
              element.module = ''
            }
            if (element.requirementPriority !== null) {
              element.requirementPriority = this.priorityOptions.filter(
                item => item.value === element.requirementPriority
              )[0].label
            }
          })
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    advancedSetting (e) {
      if ((e.keyCode === 77 && e.ctrlKey)) {
        this.seniorBindProject = true
      }
    },
    getStatusColor (statue) {
      switch (statue) {
        case 'A':
          return '#5dc4c0'
        case 'RA':
          return '#409eff'
        case 'RJ':
          return '#ff4b53'
        case 'C':
          return '#BB6CF9'
        case 'RC':
          return '#409eff'
        case 'RK':
          return '#ff4b53'
        case 'R':
          return '#66bf16'
        case 'RG':
          return '#409eff'
        case 'RL':
          return '#409eff'
        case 'L':
          return '#AFB4BF'
      }
    },
    statusFormatter (status) {
      return this.stautsOptionsList[status]
    },
    searchDemand (keyword) {
      this.demandList = this.demandListArr.filter(v => v.name.indexOf(keyword) > -1)
    },
    toCodeDetail () {
      this.$http.get(`${this.$dddUrl}/service/project/auth/devlopment?projectId=${this.id}`)
        .then(res => {
          this.$http.get(`${this.$dddUrl}/service/datasource/auth/refresh?projectId=${this.id}`)
            .then(res => {})
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          // window.open(`${baseUrl}sql_editor?projectId=${this.id}`)
          let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('sqlEditor', {
            projectId: this.id
          })
          window.open(pageUrl)
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    logSearch () {
      this.getLogData()
    },
    // 获取项目版本列表
    getBranchList () {
      HTTP.getBranchList(this.id).then(res => {
        this.branchList = res || []
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    getLogData () {
      this.$http.get(`${this.$dddUrl}/service/project/log?projectId=${this.id}&pageSize=${this.logPageSize}&currentPage=${this.logCurrentPage}&user=${this.logKeyWord}`)
        .then(res => {
          this.tableLogData = res.data.content
          this.logCurrentPage = res.data.currentPage
          this.logPageSize = res.data.pageSize
          this.logTotalItems = res.data.totalItems
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    versionRelease () {
      HTTP.getWorkflowId(this.id)
        .then(res => {
          if (res.data.length) {
            this.workCode = res.data[0]?.projectCode
            this.getWorkflowList()
          } else {
            //  没有工作流
            this.workList = []
            this.workTotal = 0
          }
          this.showChangeList = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChangeLog (val) {
      this.logPageSize = val
      this.logCurrentPage = 1
      this.getLogData()
    },
    handleCurrentChangeLog (val) {
      this.logCurrentPage = val
      this.getLogData()
    },
    selectBlur (e) {
      // 属性类别
      if (e.target.value !== '') {
        this.formContent.branchName = e.target.value
        this.$forceUpdate() // 强制更新
      }
    },
    selectClear () {
      this.formContent.branchName = ''
      this.$forceUpdate()
    },
    selectChange (val) {
      this.formContent.branchName = val
      this.$forceUpdate()
    },
    handleSelectionChange (row) {
      this.selectionObj = row
    },
    upChange (file, fileList) {
      let size = Number(file.size / 1024 / 1024)
      if (file.name.indexOf('.zip') === -1) {
        this.$datablauMessage.info('请上传zip格式的文档')
        this.fileList = []
        return
      }
      /* else if (size > 10) {
        this.$datablauMessage.warning('上传文件大小不能超过10M')
        this.fileList = []
        return
      } */
      this.fileList = [file]
    },
    closeBtn () {
      this.showChangeList = false
      this.fileList = []
      this.$refs.form.resetFields()
    },
    distribution () {
      this.$refs.form.validate(valid => {
        if (valid) {
          let json = new FormData()
          this.fileList[0]?.raw && json.append('multipartFile', this.fileList[0]?.raw)
          json.append('projectId', this.id)
          json.append('version', this.formWork.version)
          // json.append('approver', this.formWork.approver.join(','))
          json.append('workflowCode', this.formWork.workflowCode)
          json.append('requirementName', this.requirementName)
          this.$http.post(`${this.$dddUrl}/service/version/file/publish/${this.detail.name}`, json)
            .then(res => {
              if (res.data.status === 200) {
                this.$blauShowSuccess('申请发版成功')
                this.init()
                this.showFlow = false
                this.closeBtn()
              } else {
                this.$blauShowSuccess(res.data.msg, 'info')
                this.showFlow = false
              }
              this.getBranchList()
            })
            .catch(err => {
              this.$showFailure(err)
            })
        }
      })
    },
    changePersonnelList (val) {
      this.workPageNo = 1
      this.searchVal = val || ''
      this.getWorkflowList()
    },
    workLazyloading () {
      this.workPageNo += 1
      this.getWorkflowList()
    },
    getWorkflowList () {
      this.processNameList = []
      // if (this.workList.length && this.workList.length >= this.workTotal) return
      /* HTTP.getWorkflowList({
        code: this.workCode,
        pageNo: this.workPageNo,
        pageSize: this.workPageSize,
        searchVal: this.searchVal
      }) */
      HTTP.getWorkflowList(this.id)
        .then(res => {
          this.workList = res.data
          this.showChangeList = true
          /* if (this.workPageNo === 1) {
            this.workList = (res.data && res.data.totalList) || []
          } else {
            this.workList.push(...res.data.totalList)
          }
          this.workTotal = (res.data && res.data.total) || 0 */
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    approverListloading () {
      if (this.total <= this.userList.length) return
      this.currentPage += 1
      this.getUsers('approver')
    },
    remoteMethod (val) {
      this.currentPage = 1
      this.getUsers(val)
    },
    changeApproverlList (val) {
      this.currentPage = 1
      this.nameInput = val || ''
      this.getUsers('approver')
    },

    addPublish (command, row, type) {
      let item = []
      this.checkedFlows.forEach(element => {
        item.push(element.id)
      })
      let url = type === 'downloadWork' ? `${this.$dddUrl}/service/version/workflow/${row.id}?env=${command}` : `${this.$dddUrl}/service/version/document/${row.id}?env=${command}`
      let name = type === 'downloadWork' ? 'workflow_version_' + row.version + '.json' : 'doc_version_' + row.version + '.json'
      this.$http({
        url: url,
        method: 'POST',
        responseType: 'blob'
      })
        .then(res => {
          const blob = res.data
          let link = document.createElement('a')
          link.href = URL.createObjectURL(new Blob([blob], { type: 'application/x-msdownload' }))
          link.download = name
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    startEdit (u, index) {
      if (u.udpType === 'ENUM') {
        this.optionsUdp = u.udpValConstant.split(',')
      }
      this.$set(u, 'editMode', u.udpType)
      this.udpValue = u.value
      this.showUdpEdit = false
    },
    save (udp, idx) {
      this.udpLoading = true
      udp.value = this.udpValue
      this.$http.put(`${this.$dddUrl}/service/udp/val`, [{
        updValId: udp.updValId,
        value: udp.value
      }])
        .then(res => {
          this.$blauShowSuccess('扩展属性 修改成功')
          this.getCurrentUdp(true)
          this.showUdpEdit = true
        })
        .catch(err => {
          this.udpLoading = false
          this.showUdpEdit = true
          this.$showFailure(err)
        })
    },
    cancel (u) {
      this.$set(u, 'editMode', false)
      this.showUdpEdit = true
    },
    getAuthStr (auth) {
      // let result = ''
      let arr = []
      if (auth && auth.length > 0) {
        arr = auth.map(v => AuthLabel[Auth[v]])
        // result = arr.join(',')
      }
      return arr
    },
    handleAuthChange (row) {
      let mes = this.getAuthStr(row.authType)
      this.$set(row, 'authTypeMes', mes)
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
              typeData.split('\n').join(';') +
              ')'
          )
        case 'BOOL':
          return this.$t('meta.DS.udp.valueType.boolean')
        default:
          return row.udpType
      }
    },
    handleUdpChange (val) {
      this.checkedUdp = val
    },
    submitAddUdp () {
      this.udpLoading = true
      let requestBody = {
        projectId: this.id,
        udpVal: this.checkedUdp.map(v => {
          return {
            udpId: v.id,
            value: ''
          }
        })
      }
      this.$http.post(`${this.$dddUrl}/service/udp/val`, requestBody)
        .then(res => {
          this.showUdpSelector = false
          this.getCurrentUdp()
          this.$blauShowSuccess('扩展属性添加成功')
        })
        .catch(err => {
          this.udpLoading = false
          this.$showFailure(err)
        })
    },
    handleAddUdp () {
      this.showUdpSelector = true
      this.getAllUdp()
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
            udpId: v.updId,
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
        })
    },
    deleteUdp (udp) {
      this.udpLoading = true
      this.$http.delete(`${this.$dddUrl}/service/udp/delete/project/${udp.updValId}`)
        .then(res => {
          this.showUdpSelector = false
          this.getCurrentUdp()
          this.$blauShowSuccess('扩展属性删除成功')
        })
        .catch(err => {
          this.udpLoading = false
          this.$showFailure(err)
        })
    },
    getTime (time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
    },
    async init () {
      this.loading = true
      try {
        let typeRes = await this.getProjectTypes()
        let statusRes = await this.getStatus()
        /* typeRes.data.forEach(i => {
          this.types[i.typeId] = i.type
        }) */
        this.types = typeRes.data[0]
        // this.status = statusRes.data[0]
        let detailRes = await this.getDetail()
        let { data } = detailRes
        this.detail = data
        if (this.detail.labelIds && this.detail.labelIds !== null) {
          this.tagNames = this.detail?.labelIds.split(',')
          this.gettagsAll(this.tagNames, ' this.tagNames')
        }
        this.getdemandList()
        this.nodeData = ['项目管理', data.name]
        let userRes = await this.getProjectUsers()
        let currentUsername = []
        userRes.data.forEach(v => {
          v.authType = v.authType || []
          v.authTypeMes = this.getAuthStr(v.authType)
          currentUsername.push(v.username)
        })
        this.checkDisabledObj.username = currentUsername
        let currentUser
        if (this.isAdmin) {
          currentUser = {
            authType: Object.values(Auth).filter(i => typeof i === 'string')
          }
        } else {
          currentUser = userRes.data.find(v => v.username === this.$store.state.user.name && v.enabled)
        }
        this.authList = currentUser ? currentUser.authType : []
        // if (this.authList && this.authList.length === 0 && !this.isAdmin) {
        //   this.$showFailure('没有当前项目权限')
        //   this.$router.push('main/project')
        // }
        this.displayList = userRes.data
        this.userList2 = userRes.data
        this.loading = false
      } catch (err) {
        this.$showFailure(err)
        this.loading = false
      }
    },
    getStatus () {
      return this.$http.get(`${this.$dddUrl}/service/project/status`)
    },
    getProjectTypes () {
      return this.$http.get(`${this.$dddUrl}/service/project/type`)
    },
    deleteAuth (row) {
      let { projectId, username, authType, enabled } = row
      let user = {
        projectId,
        username,
        authType
      }
      this.$http.delete(`${this.$dddUrl}/service/project/auth`, { data: user })
        .then(res => {
          this.$blauShowSuccess('权限删除成功')
          // this.$parent.refreshView()
          this.init()
        })
        .catch(() => {
          this.$showFailure('权限删除失败')
        })
    },
    authTypeChange (item) {
      let array = ['PROJECT_DEMAND', 'PROJECT_MEMBER', 'PROJECT_PUBLISH', 'PROJECT_LOG', 'PROJECT_ANALYSIS']
      let ary1 = item.authType.reduce((a, b) => {
        if (array.indexOf(b) !== -1 && a.indexOf(b) === -1) {
          a.push(b)
        }
        return a
      }, [])
      if (ary1.length === array.length) {
        item.authType.indexOf('PROJECT_MANAGE') === -1 && item.authType.push('PROJECT_MANAGE')
      } else {
        item.authType.indexOf('PROJECT_MANAGE') !== -1 && (item.authType = item.authType.filter(item => item !== 'PROJECT_MANAGE'))
      }
      let val = item.authType
      let ary = []
      this.authOptions.map(item => item.options)
        .flat()
        .find(item => {
          if (val.indexOf(item.value) !== -1) {
            ary.push(item.label)
          }
        })
      this.$set(item, 'authTypeObj', ary)
    },
    changeItemAdd (item, row) {
      let ary = ['PROJECT_DEMAND', 'PROJECT_MEMBER', 'PROJECT_PUBLISH', 'PROJECT_LOG', 'PROJECT_ANALYSIS']
      if (item.value === 'PROJECT_MANAGE') {
        if (row.authType.indexOf('PROJECT_MANAGE') !== -1) {
          ary.forEach(element => {
            row.authType.indexOf(element) === -1 && row.authType.push(element)
          })
        } else {
          row.authType = row.authType.filter(item => ary.indexOf(item) === -1)
        }
      }
    },
    changeEnabled (row) {
      let { projectId, username, authType, enabled } = row
      let user = {
        projectId,
        username,
        authType,
        enabled
      }
      this.$http.put(`${this.$dddUrl}/service/project/auth`, user)
        .then(res => {
          this.$blauShowSuccess('权限状态更改成功')
          this.init()
        })
        .catch(() => {
          this.$showFailure('权限状态更改失败')
          this.$set(row, 'enabled', !row.enabled)
        })
    },
    changeItem (item, row) {
      let ary = ['PROJECT_DEMAND', 'PROJECT_MEMBER', 'PROJECT_PUBLISH', 'PROJECT_LOG', 'PROJECT_ANALYSIS']
      if (item.value === 'PROJECT_MANAGE') {
        if (row.authType.indexOf('PROJECT_MANAGE') !== -1) {
          ary.forEach(element => {
            row.authType.indexOf(element) === -1 && row.authType.push(element)
          })
        } else {
          row.authType = row.authType.filter(item => ary.indexOf(item) === -1)
        }
      }
    },
    changeAuth (row) {
      let ary = ['PROJECT_DEMAND', 'PROJECT_MEMBER', 'PROJECT_PUBLISH', 'PROJECT_LOG', 'PROJECT_ANALYSIS']
      let ary1 = row.authType.reduce((a, b) => {
        if (ary.indexOf(b) !== -1 && a.indexOf(b) === -1) {
          a.push(b)
        }
        return a
      }, [])
      // if (ary1.length !== 0 && ary1.length < ary.length) {
      //   // this.authOptions[0].options[0].class = true
      // }
      if (ary1.length === ary.length) {
        row.authType.indexOf('PROJECT_MANAGE') === -1 && row.authType.push('PROJECT_MANAGE')
      } else {
        row.authType.indexOf('PROJECT_MANAGE') !== -1 && (row.authType = row.authType.filter(item => item !== 'PROJECT_MANAGE'))
      }
      let { projectId, username, authType, enabled } = row
      let user = {
        projectId,
        username,
        authType,
        enabled
      }
      if (!authType.length) {
        this.$blauShowSuccess('人员需最少设置一个权限', 'warning')
        this.init()
        return
      }
      this.$http.put(`${this.$dddUrl}/service/project/auth`, user)
        .then(res => {
          this.$blauShowSuccess('权限修改成功')
          this.init()
        })
        .catch(() => {
          this.$showFailure('权限修改失败')
          this.init()
        })
    },
    search (keyword) {
      this.displayList = this.userList2.filter(v => v.username.indexOf(keyword) > -1)
    },
    requirementSearch () {
      this.page = 1
      this.size = 20
      this.getAnalysisList()
    },
    // 一键血缘解析
    requirementClick () {
      this.$http.get(`${this.$dddUrl}
/lineage/analysisLatestVersion/${this.id}`)
        .then(res => {
          let jobId = res.data?.jobId
          let _this = this
          if (JSON.stringify(res.data) === '{}') {
            this.$datablauMessage.warning('该项目没有可解析的文件')
            return
          }
          // this.disRun = true
          this.$datablauMessage.success('血缘解析任务已提交')
          this.getAnalysisList()
          this.interval = setInterval(() => {
            _this.getJobStatus(jobId)
          }, 3000)
          // this.getAnalysisList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    clearing () {
      this.$http.delete(`${this.$dddUrl}/
lineage/deleteLineageRecordList/${this.id}`)
        .then(res => {
          this.$datablauMessage.success('清除解析日志成功')
          this.getAnalysisList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getJobStatus (jobId, row) {
      if (!jobId) return
      this.$http.get(`${HTTP.$damServerUrl}simplejobs/${jobId}`)
        .then(res => {
          if (res.data.jobStatus !== 'RUNNING') {
            if (row) {
              clearInterval(this.refreshInterval)
              this.$set(row, 'refreshDisRun', false)
            } else {
              clearInterval(this.interval)
              this.disRun = false
            }
            this.getAnalysisList()
            if (res.data.jobStatus === 'FAILED') {
              this.$showFailure(res.data.errorMessage)
            }
          }
        })
    },
    // 刷新血缘
    requirementRefresh (row) {
      this.$http.get(`${this.$dddUrl}/lineage/analysisOne/${this.id}/${row.codeTreeNodeId}`)
        .then(res => {
          let jobId = res.data
          let _this = this
          this.$set(row, 'refreshDisRun', true)
          this.$datablauMessage.success('血缘解析任务已提交')
          this.getAnalysisList()
          this.refreshInterval = setInterval(() => {
            _this.getJobStatus(jobId, row)
          }, 3000)
          // this.getAnalysisList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getProjectUsers () {
      return this.$http.get(`${this.$dddUrl}/service/project/auth/findAuthByProject?projectId=${this.detail.id}`)
    },
    submitUsers () {
      let flag = true
      let users = this.checkedUsers.map(v => {
        flag = v.authType.length
        return {
          projectId: this.detail.id,
          username: v.username,
          authType: v.authType,
          enabled: true
        }
      })
      if (!flag) {
        this.$blauShowSuccess('请给所选人员添加权限', 'warning')
        return
      }
      this.loading = true
      this.$http.post(`${this.$dddUrl}/service/project/auths`, users)
        .then(res => {
          this.dialogVisible = false
          this.$blauShowSuccess('添加成功')
          this.getProjectUsers()
            .then(res => {
              let currentUsername = []
              res.data.forEach(v => {
                v.authTypeMes = this.getAuthStr(v.authType)
                currentUsername.push(v.username)
              })
              let currentUser
              if (this.isAdmin) {
                currentUser = {
                  authType: Object.values(Auth).filter(i => typeof i === 'string')
                }
              } else {
                currentUser = res.data.find(v => v.username === this.$store.state.user.name && v.enabled)
              }
              this.authList = currentUser ? currentUser.authType : []
              this.checkDisabledObj.username = currentUsername
              this.displayList = res.data
              this.userList2 = res.data
              this.loading = false
            })
        })
        .catch(err => {
          this.$showFailure(err)
          this.loading = false
        })
    },
    /* handleSelectionChange (val) {
      this.checkedUsers = val
    }, */
    addUser () {
      this.currentPage = 1
      this.nameInput = ''
      this.getUsers()
      this.dialogVisible = true
      this.isClearSelections = true
    },
    lazyloading () {
      if (this.total <= this.userList.length) return
      this.currentPage++
      this.getUsers()
    },
    getUsers (approver) {
      let requestBody = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        username: this.nameInput,
        fullUserName: this.nameInput,
        enabled: true
      }
      // if (this.total && this.total <= this.userList.length) return
      this.$http.post('/user/org/groups/page?appName=ddt', requestBody)
        .then(res => {
          if (this.currentPage === 1) {
            this.userList = res.data.content
          } else {
            this.userList.push(...res.data.content)
          }
          this.total = res.data.totalItems
          approver !== 'approver' && (this.dialogVisible = true)
          this.userList.forEach(item => {
            if (this.checkDisabledObj.username.indexOf(item.username) !== -1) {
              item.disabled = true
            } else {
              item.disabled = false
            }
          })
          this.userList = this.userList.filter((item) => {
            if (item.username === 'admin') { this.total -= 1 }
            return item.username !== 'admin'
          })
          if (this.isClearSelections) {
            this.isClearSelections = false
            this.$nextTick(() => {
              this.checkedUsers = []
              this.$refs.treeList.setCheckedKeys([])
            })
          } else {
            let ary = this.checkedUsers.map(item => item.id)
            this.$refs.treeList.setCheckedKeys(ary)
          }
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    renderContent (h, { node, data, store }) {
      let style = {
        con: 'width:100%',
        right: 'float:right;padding-right:30px;text-align:right;width:100px;overflow: hidden;display: inline-block;vertical-align: top;white-space: nowrap;text-overflow: ellipsis;',
        names: 'width:150px;overflow: hidden;display: inline-block;vertical-align: top;white-space: nowrap;text-overflow: ellipsis;'
      }
      return (
        <div style={style.con}>
          <span style={style.names}>
            {data.fullUserName}
            {data.fullUserName && (
              <span className="conName">（{data.username}）</span>
            )}
          </span>
          <span style={style.right}>{data.orgFullName}</span>
        </div>
      )
    },
    sourceType (type) {
      let ary = { }
      this.authOptions.forEach(item => {
        let filAry = item.options.filter(v => type.indexOf(v.value) !== -1)
        let obj = (filAry && filAry.map(v => v.label)) || []
        if (obj.length) {
          ary[item.label] && ary[item.label].push(obj)
          !ary[item.label] && (ary[item.label] = obj)
        }
      })
      return ary
    },
    filterNode (value, data, node) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
      /* this.$refs.treeList &&

      this.$refs.treeList.setCheckedKeys([...this.nodeKeyList])
      if (!value) return true
      if (data.groupName) return data.groupName.indexOf(value) !== -1
      if (data.username) {
        return (
          data.username.indexOf(value) !== -1 ||
          data.fullUserName.indexOf(value) !== -1
        )
      }
      return (
        (data.fullName && data.fullName.indexOf(value) !== -1) ||
        (data.bm && data.bm.indexOf(value) !== -1)
      ) */
    },
    checkedList (obj, obj1) {
      let currentNode = this.$refs.treeList.getNode(obj)
      this.checkedKeys =
        this.$refs.treeList && this.$refs.treeList.getCheckedKeys()
      if (!currentNode.checked) {
        this.delectNode(currentNode) // 先删除自己
      } else {
        // 添加，
        // obj.authType = []
        this.$set(obj, 'authType', [])
        this.$set(obj, 'authTypeObj', [])
        this.checkedUsers.push(obj)
      }
    },
    delectNode (node) {
      this.checkedUsers = this.checkedUsers.filter(item => item.username !== node.data.username)
    },
    inputClear () {
      this.selectKeyWord('')
    },
    selectKeyWord (val) {
      clearTimeout(this.firstTimeout) // 防抖
      this.firstTimeout = setTimeout(() => {
        // if (this.title === this.$t('assets.permissionSettings.addUser')) {
        this.currentPage = 1
        this.getUsers()
        // }
        // this.$refs.treeList.filter(val)
      }, 200)
    },
    personnelDel (item, index) {
      this.checkedUsers.splice(index, 1)
      this.$refs.treeList &&
      this.$refs.treeList.setCheckedKeys([...this.nodeKeyList])
    },
    handleCommand (val) {
      switch (val) {
        case 'edit':
          this.$parent.editProject(this.detail, true)
          break
        case 'delete':
          this.$parent.deleteProject(this.detail, true)
          break
        case 'bind':
          this.bindProject()
          break
      }
    },
    handleSizeChange2 () {
      this.handleApply()
    },
    handleCurrentChange2 () {
      this.handleApply()
    },
    bindProject () {
      this.bindVisible = true
      this.password = ''
      this.getBindList()
      this.getBindProject()
    },
    submitBind () {
      let json = {
        dddProjectId: this.id,
        dsProjectCode: this.dsProjectId.code || this.dsProjectId.dsProjectCode,
        dsProjectId: this.dsProjectId.id || this.dsProjectId.dsProjectId,
        dsProjectName: this.dsProjectId.name || this.dsProjectName.dsProjectName
      }
      this.$http.post(`${this.$dddUrl}/service/project/bind`, json)
        .then(res => {
          this.$datablauMessage.success('绑定成功')
          this.bindVisible = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getBindProject () {
      HTTP.getBindProject(this.id).then(res => {
        this.dsProjectId = res
        this.getProjectList()
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    branchSelectList (val) {
      this.dsProjectId = val
    },
    getBindList () {
      HTTP.getBindList()
        .then(res => {
          this.bindList = res
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    keySearch () {
      this.bind.page = 1
      this.getProjectList()
    },
    getProjectList () {
      this.binLoading = true
      let params = {
        pageSize: this.bind.size,
        pageNo: this.bind.page,
        password: this.password
      }
      this.$refs.binTable && this.$refs.binTable.clearSingleSelect()
      HTTP.getProjectList(params)
        .then(res => {
          this.tableData = res.data.totalList
          this.bind.total = res.data.total
          this.tableData.forEach(item => {
            if (this.bindList.indexOf(item.code) !== -1) {
              this.$set(item, 'disabled', true)
            }
          })
          this.signChecked = this.dsProjectId.dsProjectId

          this.binLoading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.binLoading = false
        })
    },
    binSizeChangeLog (val) {
      this.bind.size = val
      this.getProjectList()
    },
    binCurrentChangeLog (val) {
      this.bind.page = val
      this.getProjectList()
    },
    async handleApply () {
      this.loading = true
      try {
        let idRes = await this.$http.get(`${this.$dddUrl}/service/project/ds-project-mapping/${this.id}`)
        let { dsProjectCode } = idRes.data
        let flowRes = await this.$http.get(`/dolphinscheduler/projects/${dsProjectCode}/process-definition?pageSize=${this.flowSize}&pageNo=${this.flowPage}`)
        let { totalList, total } = flowRes.data.data
        this.flows = totalList
        this.totalFlow = total
        this.showFlow = true
        this.loading = false
      } catch (err) {
        this.$showFailure(err)
        this.loading = false
      }
    },
    handleFlowChange (val) {
      this.checkedFlows = val
    },
    getCurrentUdp () {
      this.udpLoading = true
      this.$http.get(`${this.$dddUrl}/service/udp/getProject/udp/${this.id}`)
        .then(res => {
          this.udpMap = res.data.data.udpMaps
          this.udpLoading = false
          // let result = []
          // for (let group in res.data.data.udpMaps) {
          //   result = result.concat(res.data.data.udpMaps[group])
          // }
          // this.udpList = result
          // this.showUdp = !noShow
        })
        .catch(err => {
          this.$showFailure(err)
          this.udpLoading = false
        })
    },
    handleClick (tab, ev) {
      this.tabName = tab.name
      if (tab.name === 'log') {
        this.getLogData()
      }
      if (tab.name === 'demand') {
        this.getdemandList()
      }
      if (tab.name === 'branch') {
        this.getBranchList()
        this.getEnvOption()
      }
      if (tab.name === 'analysis') {
        this.getAnalysisList()
      }
    },
    handleSizeChangeLogAnaly (val) {
      this.size = val
      this.page = 1
      this.getAnalysisList()
    },
    handleCurrentChangeLogAnaly (val) {
      this.page = val
      this.getAnalysisList()
    },
    getAnalysisList () {
      this.$http.get(`${this.$dddUrl}/lineage/getLineageRecordList/${this.id}?currentPage=${this.page}&pageSize=${this.size}&fileName=${this.requirement}`)
        .then(res => {
          this.requirementList = res.data.content
          this.totalAnaly = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeDetail () {
      this.$emit('goProjectList')
    },
    getDetail () {
      return this.$http.get(`${this.$dddUrl}/service/project/id/${this.id}`)
    },
    hasAuth (auth) {
      return this.authList.includes(Auth[auth])
    },
    hasAnyAuth (...authList) {
      return authList.some(auth => {
        return this.hasAuth(auth)
      })
    }
  },
  computed: {
    nodeKeyList () {
      return this.checkedUsers.map(item => item.id)
    }
  },
  watch: {
    nameInput (val) {
      this.$refs.treeList.filter(val)
      this.currentPage = 1
      this.getUsers()
    }
  }
}

</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.log-content{
  margin: 0 20px;
  .logSearch,.tool{
    margin-top: 12px;
  }
  .logTable{
    position: absolute;
    top: 46px;
    left: 20px;
    right: 20px;
    bottom: 50px;
  }
  .logPagination{
    position: absolute;
    bottom: 0;
    height: 50px;
    left: 20px;
    right: 20px;
    background: #fff;
    display: inline-block;
    text-align: right;
    border-top: 1px solid #EFEFEF;
    padding-top: 9px;
  }
}
.tableBox{
  position: absolute;
  top: 80px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
.point-out{
  width: 100%;
  height: 32px;
  background: rgba(255, 117, 23, .1);
  border-radius: 2px;
  font-size: 12px;
  padding: 0 10px;
  color: #FF7517;
  display: flex;
  align-items: center;
  i{
    display: inline-block;
  }
  p{
    display: inline-block;
    line-height: 32px;
    padding-left: 4px;
    padding-bottom: 1px;
  }
  margin-bottom: 12px;
}
.datablau-pagination {
  float: left;
}
.secondBox {
  position: absolute;
    top: 240px;
    right: 10px;
    width: 400px;
    height: auto;
    min-height: 640px;
    padding: 16px 14px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(46,105,240,0.1);
     .secondBox-title {
    font-size: 12px;
    font-weight: 500;
    color: #7d8493;
  }

  .organization-part {
    padding-bottom: 23px;
  }

  .label-part {
    padding-bottom: 10px;

    .label-part-content {

      // padding-bottom: 23px;
      &:last-child {
        padding: 0;
      }
    }
  }

  ul {
    li {
      display: flex;
      align-items: flex-start;
      line-height: 34px;

      .title-name {
        display: flex;
        align-items: center;
        width: 40%;

        img {
          width: 24px;
          height: auto;
        }

        span {
          padding-left: 6px;
          font-size: 13px;
          font-weight: 400;
          color: #333;
          width: 80%;
          word-wrap : break-word ;
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

      .edit-btn {
        display: none;
        &:before{
          // font-size: 12px;
        }

      }

      &:hover {
        .edit-btn {
          display: inline-block;
        }
      }
    }
  }
}
.left-part {
  position: absolute;
  top: 200px;
  left: 20px;
  right: 420px;
  bottom: 0;
}
  $middle-color: #e0e0e0;
  $primary-green: #3dae5d;
  $primary-purple: #a14dff;
  $primary-orange: #eb8449;
  $primary-enum: #43c1ca;
  $primary-boolen: #5775dc;
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
.udp-tool {
  height: 32px;
  .is-block {
    float: right;
  }
}
.datablau-switch {
  margin-left: 10px;
  display: inline-block;
  height: 28px;
}
/*.datablau-select.multi-select /deep/ .el-select .el-select__tags span {
    background-color: transparent;
    color: #555555;
    display: inline-block;
    padding: 0 6px;
    margin-right: 0px;
    .el-tag .el-select__tags-text:after {
        content: '';
    }
}*/
/deep/.el-dropdown-menu__item {
      text-align: center;
          width: 90px;
    }
.project-detail {
    padding: 10px 20px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    background: #fff;
    .tool {
      height: 32px;
      .datablau-input {
        float: left;
      }
      .is-block {
        float: right;
      }
      /deep/ .is-block[class*='icon-']::before {
        margin-right: 6px;
      }
    }
    .content {
      margin-top: 7px;
      border-top: 1px solid #ddd;
    }
    .datablau-tabs {
      padding: 0 20px;
      position: absolute;
      top: 230px;
      left: 0;
      right: 10px;
      bottom: 0;
      /deep/ .el-tabs__content {
        /*overflow-y: auto;*/
        position: static;
      }
    }
    .top-box {
      padding-top: 16px;
      overflow: hidden;
      .name {
        font-size: 16px;
        font-weight: 500;
        color: #555;
        margin-bottom: 6px;
        cursor: pointer;
        &:hover{
          color: #409EFF;
        }
        &.textDisabled{
          cursor:default;
          &:hover{
            color: #555;;
          }
        }
      }
      .text-box {
        .text {
          font-size: 14px;
          display: inline-block;
          /*margin-right: 50px;*/
        }
      }
      .left {
        float: left;
        .imageBox{
          float: left;
          width: 48px;
          img{
            width: 100%;
          }
        }
        .textCon{
          margin-left: 64px;
        }
      }
      .right {
        float: right;
        height: 50px;
        padding-left: 20px;
        margin-right: 20px;
        .status-box {
            border-left: 2px solid #ddd;
            float: left;
            height: 40px;
            margin-right: 16px;
            padding-left: 16px;
            .title {
              width: 60px;
              height: 12px;
              margin-bottom: 4px;
              font-size: 12px;
              line-height: 12px;
              display: inline-block;
              vertical-align: middle;
            }
            .circle {
              position: relative;
              bottom: 1px;
              display: inline-block;
              width: 7px;
              height: 7px;
              margin-right: 7px;
              background-color: rgb(247, 155, 63);
              border-radius: 3.5px;
            }
        }
      }
    }
    /*.description {
      font-size: 12px;
    }*/
}
.rowType{
  display: block;
  width: 64px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  &.c0{
    background: rgba(141, 199, 138, 0.1);
    color: #8DC78A;
  }
  &.c1{
    background: rgba(78, 133, 247, 0.1);
    color: #4E85F7;
  }
  &.c2{
    background: rgba(187, 108, 249, 0.1);
    color: #BB6CF9;
  }
  &.c3{
    background: rgba(58, 209, 191, 0.1);
    color: #3AD1BF;
  }
}
.status {
  position: relative;
  color: #ff4b53;
  padding-left: 10px;
  /*top: 5px;*/
  &::before {
    position: absolute;
    top: 6px;
    left: -1px;
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #ff4b53;
    border-radius: 50%;
  }
  span {
    padding-left: 10px;
  }
  &.c1 {
    color: #409eff;
    &::before {
      background: #409eff;
    }
  }
  &.c2 {
    color: #66bf16;
    &::before {
      background: #66bf16;
    }
  }
  &.c3 {
    color: #999;
    &::before {
      background: #999;
    }
  }
}
.contentSelect{
  display: flex;
}
  .leftbox{
    width: 320px;
    height: 430px;
    border: 1px solid #DDDDDD;
    float: left;
    padding: 10px;
    overflow-y: scroll;
  }
  .rightSelect{
    height: 430px;
    flex: 1;
    overflow: auto;
    /*width: 100%;*/
    border: 1px solid #DDDDDD;
    border-left: 0;
    /*float: right;*/
    padding: 10px;
    /*padding-left: 330px;*/
  }
  /deep/span.el-tree-node__expand-icon.is-leaf{
    display: none;
  }
  .nameInput{
    margin-bottom: 10px;
  }
  .selectPeo{
    margin-top: 10px;
    li{
      margin-bottom: 10px;
      height: 27px;
    }
    .selLeft{
      float: left;
      background: rgba(64, 158, 255, 0.1);
      padding: 6px 8px;
      line-height: 1;
      color: #409EFF;
      line-height: 1;
      border-radius: 2px;
    }
    .selRight{
      float: right;
      width: 213px;
      &:after{
        content: '';
        display: block;
        clear: both;
      }
      &>div{
        float: left;
        .authTypeObj{
          width: 200px;
        }
      }
      .iconBtn{
        float: right;
      }

    }
  }
  .addBtn {
    color: #409EFF;
  }
.textObjBox{
  line-height: 27px;
  padding: 0 8px;
  margin-left: 5px;
}
.til{
  color: #999999;
  margin-right: 10px;
  display: inline-block;
  width: 50px;
  text-align: right;
}
.bgSpan{
  padding: 4px 8px;
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  margin-right: 4px;
  line-height: 1;
  font-size: 12px;
  border: 1px solid #409EFF;
}
.typeList{
  margin-bottom: 8px;
  height: 27px;
}
.rangeTil{
  font-size: 16px;
  margin-bottom: 18px;
  padding-top: 6px;
}
  .labelName{
    font-size: 12px;
    color: #909399;
  }
  /deep/.datablau-checkbox2 .el-checkbox-group{
    width: 100%;
  }
  .groupBox {
    padding-bottom: 20px;
    position: relative;
    &:after {
      content: '';
      position: absolute;
      display: block;
      left: 0px;
      right: 0px;
      bottom: 6px;
      height: 1px;
      background: #E4E7ED;
    }
    &:last-child{
      padding: 0;
      &:after{
        background: none;
      }
    }
  }
.authority{
  &>div{
    float: left;
    margin-right: 5px;
  }
}
  .noresult{
    color: #999999;
    img {margin-right: 12px;}
  }
.circle {
  position: relative;
  bottom: 1px;
  display: inline-block;
  margin-right: 7px;
  background-color: #5cb793;
  border-radius: 3.5px;
  width: 7px;
  height: 7px;
}
</style>
<style lang="scss">
  .dropdown{
    width: 150px;
    height: 300px;
    text-align: left;
    overflow: auto;
    .el-dropdown-menu__item{
      width: 100%;
      text-align: left;
    }
    .popper__arrow {
      display: none;
    }
  }
  .treeList{
    .grey-tree .el-tree-node__content{
      width: 100%;
    }
  }
  .tooltipBox.el-tooltip__popper.is-light {
    border: 0 !important;
    box-shadow: 0 0 6px #ccc;
  }
  .tooltipBox {
    .popper__arrow {
      border: 0 !important;
      box-shadow: 0 0 6px #ccc;
    }
  }
</style>
