<template>
    <div class="layerManage">
        <div class="tree-area">
            <datablau-input
            style="display: block"
            v-model="keyword"
            :iconfont-state="true"
            :placeholder="$store.state.$v.common.placeholder"
            size="small"
            prefix-icon="el-icon-search"
            ></datablau-input>
            <div>
                <datablau-tree
                    ref="tree"
                    style="
                        position: absolute;
                        top: 53px;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        overflow: auto;
                    "
                    node-key="id"
                    :data="treeData"
                    :props="defaultProps"
                    :default-expanded-keys="defaultExpandedKeys"
                    data-supervise
                    :data-icon-function="dataIconFunction"
                    :data-options-function="dataOptionsFunction"
                    :filter-node-method="filterNode"
                    @node-click="handleNodeClick"
                ></datablau-tree>
            </div>
        </div>
        <div class="right-table" v-if="formDetail.id && formDetail.id!==0" v-show="this.$store.state.user.isAdmin || permissionObj.admin || permissionObj.editor || permissionObj.viewer">
          <div class="model-item-page-title">
            <datablau-breadcrumb
              :node-data="namePath"
              :couldClick="false"
              :showBack="false"
            ></datablau-breadcrumb>
          </div>
          <div class="content-header">
            <div class="cont-img">
              <i class="iconfont icon-file"></i>
            </div>
            <div class="cont-name">
              <is-show-tooltip
                :content="formDetail.name"
                :style="{maxWidth:'232px', paddingTop: '2px'}"
              ></is-show-tooltip>
              <el-popover
                placement="bottom-start"
                popper-class="common-card-pop-information"
                trigger="click">
                <div class="basic-information">
                  <div class="card-head">
                    <div class="card-head-img">
                      <i class="iconfont icon-menu-zlbg"></i>
                    </div>
                    <span>基本信息</span>
                  </div>
                  <div class="information">
                    <div class="information-li">
                      <div class="information-label">英文简称</div>
                      <div class="information-value">
                        <is-show-tooltip
                        :content="formDetail.alias"
                        :style="{maxWidth:'300px', paddingTop: '2px'}"
                      ></is-show-tooltip></div>
                    </div>
                    <div class="information-li">
                      <div class="information-label">创建时间</div>
                      <div class="information-value">{{  $timeFormatter(formDetail.createTime) }}</div>
                    </div>
                    <div class="information-li">
                      <div class="information-label">更新时间</div>
                      <div class="information-value">{{  $timeFormatter(formDetail.updateTime) }}</div>
                    </div>
                    <div class="information-li">
                      <div class="information-label">修改人</div>
                      <div class="information-value">{{ formDetail.updater }}</div>
                    </div>
                    <div class="information-li">
                      <div class="information-label">命名规则</div>
                      <div class="information-value">{{getNamingRule(formDetail.entityTemplateId)}}</div>
                    </div>
                    <div class="information-li">
                      <div class="information-label">绑定模型</div>
                      <div class="information-value">{{formDetail.modelId?modelsList.filter(item => item.id === formDetail.modelId)[0].name:'-'}}</div>
                    </div>
                    <div class="information-li information-li2">
                      <div class="information-label">定义</div>
                      <div class="information-value">{{ formDetail.description }}</div>
                    </div>
                  </div>
                </div>
                <div class="basic-information-button" slot="reference">
                  <i class="iconfont icon-menu-zlbg"></i>
                </div>
              </el-popover>

            </div>
            <div class="cont-owner">
              <span class="label">
              负责人
              </span>
              <div class="right">
                <div class="abbreviation" v-if="formDetail.creator">
                  {{ `${formDetail.creator}`.substr(0, 1) }}
                </div>
                <p>{{ formDetail.creator }}</p>
              </div>
            </div>
          </div>
            <div class="list-container">
              <datablau-tabs class="layerTabs" v-model="activeName" @tab-click="handleClickTab" >
                <el-tab-pane label="实体" name="first">
                  <div style="display: flex;
                    align-items: center;
                    justify-content: space-between;">
                    <div style="display: flex;
                      align-items: center;">
                      <datablau-input
                        style="width:200px;margin-top: 10px;"
                        v-model="keywordTable"
                        :iconfont-state="true"
                        :placeholder="$store.state.$v.common.placeholder"
                        size="small"
                        prefix-icon="el-icon-search"
                      ></datablau-input>
                      <div style="display: flex;
                        align-items: center; margin-top: 10px;margin-left: 10px">
                        <span>主题</span>
                        <datablau-select
                          v-model="subjectId"
                          style="width:200px;margin-left: 10px"
                          @change="themeDataChange"
                        >
                          <el-option
                            v-for="item in themeDataSelect"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                          ></el-option>
                        </datablau-select>
                      </div>
                    </div>

                    <div style="margin-top: 10px;">
                      <datablau-button
                        class="iconfont icon-refresh"
                        type="important"
                        @click="syncTable"
                      >
                        同步表
                      </datablau-button>
                      <datablau-button
                        class="iconfont icon-tianjia"
                        type="important"
                        @click="addTable"
                      >
                        新建表
                      </datablau-button>
                    </div>
                  </div>

                  <!-- 将对话框移到外层，不影响按钮布局 -->
                  <datablau-dialog
                    :visible.sync="syncTableDialogVisible"
                    title="选择需要同步的表"
                    size="m"
                    append-to-body
                  >
                    <div class="sync-table-dialog">
                      <datablau-input
                        v-model="syncTableKeyword"
                        :iconfont-state="true"
                        placeholder="搜索表名"
                        size="small"
                        prefix-icon="el-icon-search"
                        style="width: 100%"
                      ></datablau-input>
                      <div class="table-list">
                        <datablau-table
                          v-loading="syncTableLoading"
                          :data="filteredSyncTableList"
                          style="width: 100%"
                          height="400"
                          @selection-change="handleSyncTableSelectionChange"
                        >
                          <el-table-column
                            type="selection"
                            width="40"
                            fixed="left"
                            align="center">
                          </el-table-column>
                          <el-table-column
                            prop="name"
                            label="表名"
                            min-width="130"
                            fixed="left"
                            show-overflow-tooltip>
                          </el-table-column>
                          <el-table-column
                            prop="alis"
                            label="中文名"
                            min-width="130"
                            fixed="left"
                            show-overflow-tooltip>
                          </el-table-column>
                          <el-table-column
                            prop="definition"
                            label="定义"
                            min-width="150"
                            fixed="left"
                            show-overflow-tooltip>
                          </el-table-column>
                        </datablau-table>
                      </div>
                    </div>
                    <span slot="footer">
                      <datablau-button @click="syncTableDialogVisible = false">取消</datablau-button>
                      <datablau-button type="primary" @click="confirmSyncTable">确定</datablau-button>
                    </span>
                  </datablau-dialog>
                  <div style="position: absolute;
                    top: 50px;
                    left: 0;
                    right: 0;
                    bottom: 50px;">

                    <datablau-table
                      :data="tableData"
                      height="100%"
                      @sort-change="handleSortChange"
                    >
                    <el-table-column width="30">
                      <template >
                        <img style="
                            width:20px;
                            height:20px;
                            position: relative;
                            bottom: 2px;"
                            src="@/assets/images/mxgraphEdit/Table.svg"
                            class="table-img"
                        >
                      </template>
                    </el-table-column>
                      <el-table-column label="表名称" prop="name"  width="140" show-overflow-tooltip sortable="custom">

                      </el-table-column>
                      <el-table-column label="中文名称" prop="alis" sortable="custom" width="140" show-overflow-tooltip>

                      </el-table-column>
                      <el-table-column label="定义"  prop="definition" width="140" show-overflow-tooltip>

                      </el-table-column>
                      <el-table-column label="主题"  prop="subjectId" show-overflow-tooltip>
                        <template slot-scope="scope">
                          {{ getThemeName(scope.row.subjectId) }}
                        </template>
                      </el-table-column>

                      <el-table-column label="字段数" width="100"  prop="columnNumber" sortable="custom">

                      </el-table-column>
                      <el-table-column
                        min-width="120"
                        v-for="(udpList, index) in udpListfilteredArray"
                        :key="index"
                        :label="udpList.name">
                        <template slot-scope="scope">
                          {{scope.row.properties[udpList.udpId]}}
                        </template>
                      </el-table-column>
                      <el-table-column label="锁定状态" prop="lock"
                      show-overflow-tooltip
                      >
                        <template slot-scope="scope">
                          {{ scope.row.lock ? '已锁定' : '未锁定' }}
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" fixed="right" width="200">
                        <template slot-scope="scope">
                          <datablau-button tooltipContent="查看" type="icon" :disabled="!(scope.row.permissionLi && (scope.row.permissionLi.admin || scope.row.permissionLi.editor || scope.row.permissionLi.viewer))"  class="iconfont icon-see" @click.stop="onRowClick(scope.row)">
                          </datablau-button>
                          <datablau-button
                                type="text"
                                @click.stop="onRowEditClick(scope.row)"
                                :disabled="!(scope.row.permissionLi&&(scope.row.permissionLi.admin || scope.row.permissionLi.editor))"
                              >
                                <datablau-tooltip
                                  effect="dark"
                                  :content="$store.state.$v.dataEntity.edit"
                                  placement="bottom"
                                >
                                  <i class="iconfont icon-bianji"></i>
                                </datablau-tooltip>
                          </datablau-button>
                          <datablau-button
                                type="text"
                                @click.stop="onRowDeleteClick(scope.row)"
                                :disabled="!(scope.row.permissionLi&&(scope.row.permissionLi.admin ))"
                                style="margin-left:0"
                              >
                                <datablau-tooltip
                                  effect="dark"
                                  :content="$store.state.$v.dataEntity.delete"
                                  placement="bottom"
                                >
                                  <i class="iconfont icon-delete"></i>
                                </datablau-tooltip>
                          </datablau-button>
                          <datablau-button
                                type="text"
                                @click.stop="onRowAuthClick(scope.row)"
                                :disabled="!(scope.row.permissionLi&&scope.row.permissionLi.admin)"
                              >
                                <datablau-tooltip
                                  effect="dark"
                                  content="权限"
                                  placement="bottom"
                                >
                                  <i class="iconfont icon-lock"></i>
                                </datablau-tooltip>
                          </datablau-button>
                        </template>
                      </el-table-column>
                    </datablau-table>
                  </div>
                  <div class="footer-row">
                    <datablau-pagination
                      style="float: right; margin-top: 10px;margin-bottom: 10px;"
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                      :current-page.sync="currentPage"
                       :page-sizes="[20, 50, 100]"
                      :page-size="pageSize"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="totalShow"
                    ></datablau-pagination>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="主题" name="second">
                  <datablau-button
                    type="important"
                    style="margin-top: 10px;float:right;"
                    @click="addTheme()"
                     v-if="$store.state.user.isAdmin || this.$store.state.$auth['ROLE_DW_SUPERUSER_DDM'] ||  permissionObj.admin"
                  >添加主题</datablau-button>
                  <div style="position: absolute;
                    top: 50px;
                    left: 0;
                    right: 0;
                    bottom: 0;">
                    <datablau-table
                      :data="themeData"
                      height="100%"
                    >
                      <el-table-column label="名称" prop="name"  show-overflow-tooltip>

                      </el-table-column>
                      <el-table-column label="编码"  prop="subjectNo" show-overflow-tooltip>

                      </el-table-column>
                      <el-table-column label="路径" prop="path" show-overflow-tooltip>

                      </el-table-column>
                      <el-table-column label="创建时间"
                      prop="createTime"
                       :formatter="$timeFormatter">

                      </el-table-column>
                      <el-table-column
                        label="操作"
                        width="180"
                        header-align="center"
                        align="center"
                        v-if="$store.state.user.isAdmin || this.$store.state.$auth['ROLE_DW_SUPERUSER_DDM'] ||  permissionObj.admin"
                      >
                        <template slot-scope="scope">
                          <datablau-button tooltipContent="查看" type="icon"  class="iconfont icon-see" @click="scanDetailTheme(scope.row)"></datablau-button>
                          <datablau-button tooltipContent="解绑" type="icon" @click="deleteTheme(scope.row)" class="iconfont icon-unbind" :disabled="scope.row.enabled"></datablau-button>
                        </template>
                      </el-table-column>
                    </datablau-table>
                  </div>
                </el-tab-pane>
              </datablau-tabs>
            </div>
        </div>
        <datablau-dialog
          :visible.sync="layerVisible"
          :title="form.id?'编辑分层':'新建分层'"
          size="m"
          append-to-body
          height="500px"
        >
          <div class="content">
            <datablau-form
              :model="form"
              ref="form"
              size="small"
              :rules="rules"
              label-width="75px"
            >
            <div v-if="form.id && form.id===1">
              <el-form-item label="分层名称" prop="name">
                <datablau-input
                  style="width: 100%"
                  maxlength="100"
                  show-word-limit
                   class="maxlengthInput"
                  placeholder="请输入分层名称"
                  v-model="form.name"
                ></datablau-input>
              </el-form-item>
            </div>
              <div v-else>
                <el-form-item label="分层名称" prop="name">
                <datablau-input
                  style="width: 100%"
                  class="maxlengthInput"
                  maxlength="100"
                  show-word-limit
                  placeholder="请输入分层名称"
                  v-model="form.name"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="英文简称" >
                <datablau-input
                  style="width: 100%"
                  placeholder="请输入英文简称"
                  v-model="form.alias"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="分层目录" prop="layerId">
                <datablau-select
                        v-model="form.layerId"
                        clearable
                        style="width:100%"
                        placeholder="请选择分层目录"
                        @change="layerIdChange"
                        :disabled="form.id || layerIdDisabled"
                    >
                        <el-option
                        v-for="item in layerContents"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id+''"
                        ></el-option>
                    </datablau-select>
              </el-form-item>
              <el-form-item label="命名规则" prop="entityTemplateId">
                <div style="display: flex;align-items: center;justify-content: space-between;">
                  <datablau-select
                        v-model="form.entityTemplateId"
                        clearable
                        style="width:320px"
                    >
                        <el-option
                        v-for="item in templateList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                        ></el-option>
                    </datablau-select>
                    <datablau-button
                      type="text"
                      @click="goModelTemplate"
                      v-if="$auth.ROLE_TEMPLATE_MANAGE_DDM"
                    >
                    <i class="iconfont icon-tianjia" style="margin-right:4px"></i>创建规则</datablau-button>

                    <el-checkbox
                      class="small"
                      v-model="form.forceCheckFlag"
                    >设置强检查</el-checkbox>
                </div>
              </el-form-item>
              <el-form-item label="数据模型" prop="modelIdName">
                <div style="display: flex;align-items: center;">
                  <datablau-input
                        v-model="form.modelIdName"
                        clearable
                        style="width:100%"
                        @focus="openModelVisible()"
                    >
                    </datablau-input>
                </div>
              </el-form-item>
              <el-form-item label="定义" >
                <datablau-input
                  style="width: 100%"
                  placeholder=""
                  v-model="form.description"
                  maxlength="500"
                  show-word-limit
                  type="textarea"
                ></datablau-input>
              </el-form-item>
            </div>

            </datablau-form>
          </div>
          <span slot="footer">
            <datablau-button  @click="closeLayerVisible">
              取消
            </datablau-button>
            <datablau-button type="primary" @click="layerSave" :disabled="form.layerId === '' || form.name === ''">
              确定
            </datablau-button>
          </span>
        </datablau-dialog>
        <div class="auth-manage-container" v-if="showAuthManageDialog">
          <div class="head-breadcrumb">
            <datablau-breadcrumb
              class="top-bread"
              :node-data="nodeData"
              :couldClick="false"
              @back="goBack"
            ></datablau-breadcrumb>
          </div>
          <div class="manage-container">
            <permission
              manage-type="category"
              :categoryId="chosenCategoryId"
            ></permission>
          </div>
        </div>
        <!-- themeManagement -->
        <div class="auth-manage-container" v-if="showThemeManageDialog">
          <div class="head-breadcrumb">
            <datablau-breadcrumb
              class="top-bread"
              :node-data="nodeData"
              :couldClick="false"
              @back="goBack"
            ></datablau-breadcrumb>
          </div>
          <div class="theme-container">
            <themeManagement
            @onRowClick="onRowClick"
            @onRowClickTheme="onRowClickTheme"
            ></themeManagement>
          </div>
        </div>
        <!--  permission -->
        <div class="auth-manage-container" v-if="showAuthManageTableDialog">
          <div class="head-breadcrumb">
            <datablau-breadcrumb
              class="top-bread"
              :node-data="nodeData"
              :couldClick="false"
              @back="goBack"
            ></datablau-breadcrumb>
          </div>
          <div class="theme-container">
            <permission-table
              manage-type="category"
              :categoryId="currentModelId"
              :tableId="rowAuthTableId"
            ></permission-table>
          </div>
        </div>
        <datablau-dialog
          :visible.sync="addThemeVisible"
          title="添加主题"
          size="s"
          append-to-body
          height="500px"
        >
          <div class="content">
            <datablau-input
              style="display: block"
              v-model="keywordTheme"
              :iconfont-state="true"
              :placeholder="$store.state.$v.common.placeholder"
              size="small"
              prefix-icon="el-icon-search"
              ></datablau-input>
            <datablau-tree
              ref="treeTheme"
              style="
                  position: absolute;
                  top: 53px;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  overflow: auto;
              "
              node-key="id"
              :data="treeThemeData"
              :show-checkbox="true"
              :expand-on-click-node="false"
              show-overflow-tooltip
              :props="defaultThemeProps"
              @check="handleCheckChange"
              :default-expanded-keys="defaultExpandedThemeKeys"
              :data-icon-function="dataIconFunctionTheme"
              :filter-node-method="filterNodeTheme"
              check-strictly
              check-on-click-node
          ></datablau-tree>
          </div>
          <span slot="footer">
            <datablau-button type="primary" @click="themeSave" :disabled="themeCheckList.length === 0 && themeCheckedKey.length ===0">
              确定
            </datablau-button>
            <datablau-button type="cancel"  @click="closeThemeVisible">
            </datablau-button>
          </span>
        </datablau-dialog>
        <div class="tableDetail-content" v-if="tableDetailShow">
          <datablau-tabs
          class="detail-wrapper"
          v-model="currentTab"
          @tab-click="currentTabClick"
          @tab-remove="removeTab">
          <el-tab-pane  name="list">
            <span slot="label">{{openTableType ? '主题': '实体'}}</span>
          </el-tab-pane>
          <el-tab-pane
          v-for="(v,k) in tables"
          closable
          :key="'tableDetals'+k"
          :name="v.tableMsg.Id + ''">
          <span slot="label" style="max-width: 200px;
    display: inline-block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;line-height: 32px;
    height: 32px;
    vertical-align: bottom;">{{ tabLabelFormatter(v) }}</span>
            <table-details
              :loading="loading"
              :editorType="editorType"
              :key="v.tableMsg.Id"
              :deliverNum="deliverNum"
              :TypeUniqueIdToColumnDefaultType="TypeUniqueIdToColumnDefaultType"
              :tableDialogKey="tableDialogKey"
              ref="tableDetailsEdit"
              :rawData="v"
              :current-model="currentModel"
              :data-by-type="dataByType"
              :isLogicalModel="isLogicalModel"
              :isDesignModel="isDesignModel"
              :getTableHTMLFunction="null"
              :startIdToEndIds="{}"
              :createDeepRelation="() => {}"
              :calculateStartIdToEndIds="() => {}"
              :cellDialogData="null"
              :currentStyleRelatedShapeTemplate="{}"
              :formatThemeTemplateData="() => {}"
              :currentId="0"
              :isCassandraOrMongoDB="false"
              :isLogical="false"
              :isConceptual="false"
              :getTableNameNamingMap="getTableNameNamingMap"
              :getColumnNameNamingMap="getColumnNameNamingMap"
              :getIndexNameNamingMap="getIndexNameNamingMap"
              :categoryOrder="['']"
              :graph="null"
              :Changes="Changes"
              @openColumnDialog="openColumnDialog"
              @updateTabName="updateTabName"
              @updateVersion="updateVersion"
              @nameAbbreviationChange="nameAbbreviationChange"
              @updateTableData="updateTableData"
              :layerId="layerId"
              :layerIdName="layerIdName"
              @removeBlankTab="removeBlankTab"
              @removeTab="removeTab"
              :nodeClickDataLayer="nodeClickDataLayer"
              @handleDialogData="closeTableDetail">
            </table-details>
          </el-tab-pane>
        </datablau-tabs>
        </div>
         <datablau-dialog
          title="选择模型"
          :visible.sync="logModal"
          append-to-body
          width="800px"
          height="560px"
          custom-class="task-detail-dialog-wrapper"
        >
        <setModel @closeMode="closeMode" v-if="logModal" @result="bpmnResult" ></setModel>
      </datablau-dialog>
    </div>
</template>

<script>
import { getTargetAnchor } from '@antv/x6/lib/registry/router/util.js'
import main from './main.js'
export default main
</script>
<style lang="scss">
.layer-form{
  .el-form.db-form .el-form-item{
    margin-bottom: 0;
  }
}
.layerTabs{
  position: absolute;
    top: 85px;
    left: 16px;
    right: 16px;
    bottom: 0;
    .el-tabs__content{
      position: absolute;
    top: 32px;
    bottom: 0;
    left: 0;
    right: 0;
    }
}
.detail-wrapper{
  .el-tabs__content{
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
.common-card-pop-information{
  border: none;
  box-shadow: none;
  padding: 0;
  .popper__arrow{
    display: none;

  }
}
</style>
<style lang="scss" scoped>
.datablau-input .el-input__inner{
  padding-right: 62px;
}
.basic-information{
  width: 408px;
  height: 300px;
  background: #FFFFFF;
  box-shadow: 0px 4px 8px 0px rgba(140,161,182,0.32);
  border-radius: 8px;
  overflow: hidden;
  .card-head{
    width: 408px;
    height: 48px;
    background: url(~@/assets/images/layerManage/cardhead.png);
    display: flex;
    align-items: center;
    span{
      font-size: 16px;
      color: #354F7B;
    }
    .card-head-img{
      background: #fff;
      border-radius: 4px;
      color: #409EFF;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 12px;
      margin-right: 6px;

      i{
        padding: 3px 4px;
      }
    }
  }
  .information{
    height: 250px;
    overflow: auto;
    padding-left: 16px;
    padding-right: 16px;
    .information-li{
      height: 32px;
      display: flex;
      align-items: center;
      &.information-li2{
        height: auto;
        align-items: flex-start;
        margin-top: 8px;
        .information-value{
          width: 300px
        }
      }
      .information-label{
        width: 52px;
        color: #7C89A8;
        font-size: 13px;
      }
      .information-value{
        color: #354F7B;
        padding-left:16px;
        font-size: 13px;
      }
    }
  }
}
.tableDetail-content{
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 12;
  background-color: #fff;
  padding: 8px;
}
.model-item-page-title {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 9;
      height: 40px;
      margin: 0 20px;
      font-size: 16px;
      // line-height: 40px;
      padding-top: 8px;
      background: var(--default-bgc);
      border-bottom: 1px solid var(--border-color-lighter);
      // border-bottom: 1px solid red;
      button {
        margin-top: 8px;
      }
      .item-title {
        font-size: 18px;
      }
      .bottom-line {
        position: absolute;
        right: 20px;
        bottom: 0;
        left: 20px;
        display: inline-block;
        border-bottom: 1px solid #ddd;
      }
    }
.content-header{
    position: absolute;
    top: 50px;
    right: 20px;
    left: 20px;

    .basic-information-button{
      float: right;
      border-radius: 4px;
      color: #409EFF;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 6px;
      cursor: pointer;
      &:hover{
        background: rgba(64,158,255,.1);
      }
      i{
        padding: 3px 4px;
      }
    }
    .cont-img{
        display: inline-block;
        i{
            font-size: 32px;
            color: #409eff;
        }
    }
    .cont-name{
        display: inline-block;
        vertical-align: top;
        padding-top: 6px;
        padding-left: 16px;
        p{
            font-size: 12px;
            color: #555555;
            display: inline-block;
            padding-right: 8px;
            max-width: 500px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            vertical-align: bottom;
        }
        i{
            cursor: pointer;
            &:hover{
                color: #409eff;
            }
        }
    }
    .cont-owner{
        float: right;
        padding-top: 6px;
        .label{
            font-size: 12px;
            color: #555555;
            padding-right: 8px;
            line-height: 34px;
            display: inline-block;
        }
        .right{
            line-height: 34px;
            display: inline-block;
            padding: 0 8px;
            border-radius: 2px;
            transition: background-color .21s;
            // &:hover{
            //     background: transparentize(#409eff, 0.9);;
            //     .switchIcon{
            //         .switchIconBox{
            //             display: inline-block;
            //         }
            //     }
            // }
            .abbreviation{
                display: inline-block;
                width: 24px;
                height: 24px;
                background: transparentize(#409eff, 0.9);;
                line-height: 24px;
                text-align: center;
                border-radius: 100%;
                margin-right: 4px;
                font-size: 12px;
                color: #555555;
            }
            p{
                display: inline-block;
                margin-right: 4px;
                font-size: 14px;
                color:#555555;
                max-width: 100px;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                vertical-align: bottom;
            }
            .switchIcon{
                display: inline-block;
                width: 24px;
                .switchIconBox{
                    width: 24px;
                    height: 24px;
                    text-align: center;
                    display: none;
                    line-height: 24px;
                    cursor: pointer;
                    transition: background-color .2s;
                    i{
                        color: #409eff;
                    }
                    &:hover{
                        background-color:transparentize(#409eff, 0.9);
                        border-radius: 2px;
                    }
                }

            }
        }
    }
}
.auth-manage-container {
  //border: 1px solid red;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 12;
  background-color: #fff;

  .head-breadcrumb {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 40px;
    padding: 8px 0 0 20px;
  }
.theme-container{
  position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    border-top: 1px solid #e0e0e0;
}
  .manage-container {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    top: 40px;
  }
}
.layerManage{
    .tree-area{
        padding: 8px;
    }
    .right-table{
        position: absolute;
        left: 240px;
        padding: 16px;
        top: 0;
        right: 0;
        bottom: 0;
        .basic-information{
          .form-itemDiv{
            display: flex;
            align-items: center;
            p{
              width: 200px;
            }
          }
        }
        .list-container{

        }
    }
    .footer-row{
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: end;
      border-top: 1px solid #e0e0e0;
    }
}
.sync-table-dialog {
  padding: 0 20px;
  .table-list {
    margin-top: 10px;
    .el-table {
      /deep/ .el-table__fixed {
        height: 100% !important;
      }
      /deep/ .el-table__header-wrapper {
        .el-checkbox {
          margin-right: 0;
        }
      }
      /deep/ .el-table__body-wrapper {
        .el-checkbox {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
