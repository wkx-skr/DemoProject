<template>
  <div style="height: 100%" id="ddd" class="domain-component-outer">
    <template v-if="!blank">
      <div class="tree-area" :class="{ user: !hasAccess }">
        <datablau-tree-header>
          <template slot="title">信息项分类管理</template>
          <template slot="more" v-if="hasEditAuth">
            <datablau-tooltip content="新建目录">
              <i
                class="iconfont icon-tianjia"
                @click="commandHandle('addNext', {})"
              ></i>
            </datablau-tooltip>
          </template>
          <template slot="search">
            <div class="tree-search-box" style="width: 100%">
              <i
                v-show="showClose"
                class="el-icon-circle-close cursor-close"
                :class="{ 'show-cursor-close': showClose }"
                @click="clear"
              ></i>
              <datablau-select
                ref="loadSelect"
                class="filter-input"
                v-model="chooseResult"
                :iconfont-state="true"
                clearable
                filterable
                remote
                reserve-keyword
                placeholder="搜索信息项分类名称"
                :remote-method="searchCatalog"
                :loading="searchLoading"
                popper-class="tree-search-popper"
                @change="handleChooseChange"
                @focus="handleChooseSelectFocus"
                @visible-change="visibleChange"
                :isIcon="'icon-search'"
              >
                <el-option
                  v-for="item in searchResult"
                  :key="item.id"
                  :label="item.catalogPathName"
                  :value="item.id"
                ></el-option>
              </datablau-select>
            </div>
          </template>
        </datablau-tree-header>
        <div class="tree-box" style="overflow: auto">
          <datablau-tree
            ref="mainTree"
            class="grey-tree"
            :props="defaultProps"
            :show-checkbox="false"
            node-key="id"
            lazy
            :load="loadTreeData"
            :default-expanded-keys="[]"
            :default-expand-all="false"
            :expand-on-click-node="false"
            :highlight-current="true"
            auto-expand-parent
            :check-strictly="false"
            :data-icon-function="dataIconFunction"
            :data-options-function="dataOptionsFunction"
            :data-supervise="true"
            @node-click="handleItemClicked"
            show-overflow-tooltip
          ></datablau-tree>
        </div>
      </div>
      <div class="tree-area-margin-right"></div>
      <div class="content-area">
        <div class="folder-content-box">
          <div class="datastandard-folder-detail" id="domainFolder">
            <datablau-list-search class="search-outer">
              <el-form ref="searchForm" :inline="true" :model="searchFormData">
                <el-form-item prop="itemName" style="width: 120px">
                  <datablau-input
                    clearable
                    maxlength="100"
                    type="text"
                    :iconfont-state="true"
                    style="width: 250px"
                    v-model="searchFormData.itemName"
                    placeholder="请输入信息项名称、信息项编码"
                    @input="handleCurrentChange(1)"
                  ></datablau-input>
                </el-form-item>
              </el-form>
              <template slot="buttons">
                <div v-if="hasEditAuth">
                  <datablau-button
                    v-if="hasEditAuth"
                    type="primary"
                    class="iconfont icon-tianjia"
                    size="mini"
                    @click="addItem"
                  >
                    新增信息项
                  </datablau-button>
                  <el-dropdown
                    trigger="click"
                    @command="moreHandle"
                    class="more-fun-btn"
                    v-if="showMoreOptionsButton"
                  >
                    <datablau-button
                      size="mini"
                      type="secondary"
                      icon="el-icon-plus"
                    >
                      更多操作
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </datablau-button>
                    <el-dropdown-menu class="more-drop-box" slot="dropdown">
                      <el-dropdown-item icon="iconfont icon-import" command="a">
                        导入信息项
                      </el-dropdown-item>
                      <el-dropdown-item icon="iconfont icon-upload" command="b">
                        导出信息项
                      </el-dropdown-item>
                      <el-dropdown-item icon="iconfont icon-expand" command="c">
                        扩展属性
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </template>
            </datablau-list-search>
            <datablau-form-submit :style="{ top: '53px' }">
              <datablau-table
                class="datablau-table"
                height="100%"
                ref="itemTable"
                :data="itemList"
                :data-selectable="hasEditAuth"
                v-loading="tableLoading"
                :reserveSelection="true"
                :show-column-selection="false"
                :row-key="geItemRowKeys"
                @selection-change="tableSelectionChanged"
                @sort-change="handleItemSortChange"
              >
                <el-table-column width="30px">
                  <datablau-icon
                    style="margin-top: 5px"
                    data-type="infoitems"
                    :isIcon="true"
                    :size="18"
                  ></datablau-icon>
                </el-table-column>
                <el-table-column
                  min-width="120px"
                  label="信息项名称"
                  prop="name"
                  sortable="name"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  min-width="110px"
                  sortable="stdCode"
                  label="信息项编码"
                  prop="stdCode"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  min-width="120px"
                  label="英文名称"
                  prop="englishName"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  min-width="120px"
                  label="业务定义"
                  prop="businessDepartment"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  min-width="120px"
                  label="创建人"
                  prop="creator"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  label="创建时间"
                  min-width="160"
                  column-key="last"
                  prop="createTime"
                  sortable="createTime"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  label="操作"
                  align="center"
                  header-align="center"
                  width="120"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      v-if="$auth.DATA_SECURITY_AUTH_STANDARD"
                      style="margin: 0 3px"
                      type="icon"
                      @click="checkItem(scope.row)"
                    >
                      <datablau-tooltip content="查看" placement="top">
                        <i class="iconfont icon-see"></i>
                      </datablau-tooltip>
                    </datablau-button>

                    <div class="edit-btn domain-edit" v-if="hasEditAuth">
                      <datablau-button
                        style="margin: 0 3px"
                        type="icon"
                        @click="editItem(scope.row)"
                      >
                        <datablau-tooltip
                          :content="$t('common.button.edit')"
                          placement="top"
                        >
                          <i class="iconfont icon-bianji"></i>
                        </datablau-tooltip>
                      </datablau-button>
                      <datablau-button
                        style="margin: 0 3px"
                        type="icon"
                        :disabled="scope.row.bind"
                        @click="deleteItem([scope.row.itemId])"
                      >
                        <datablau-tooltip
                          :content="
                            scope.row.bind
                              ? '该信息项已关联数据分类，不允许删除'
                              : '删除'
                          "
                          placement="top"
                        >
                          <i class="iconfont icon-delete"></i>
                        </datablau-tooltip>
                      </datablau-button>
                    </div>
                  </template>
                </el-table-column>
              </datablau-table>
              <template slot="buttons">
                <div
                  class="left-btn"
                  v-show="tableSelection && tableSelection.length > 0"
                >
                  <div style="display: inline-block">
                    <span class="check-info"></span>
                    <span class="footer-row-info">
                      {{
                        $t('common.deleteMessage', {
                          selection: tableSelection.length,
                        })
                      }}
                    </span>
                    <datablau-button
                      class="iconfont icon-delete"
                      type="danger"
                      size="mini"
                      @click="deleteItem"
                      :tooltip-content="
                        tableSelection.find(item => item.bind)
                          ? '所选信息项中含已被安全分类关联的信息项，不可批量删除'
                          : ''
                      "
                      :disabled="!!tableSelection.find(item => item.bind)"
                    >
                      {{ $t('common.button.delete') }}
                    </datablau-button>
                  </div>
                </div>
                <datablau-pagination
                  class="pagination-component"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page.sync="itemPagination.currentPage"
                  :page-sizes="[20, 50, 100]"
                  :page-size="itemPagination.pageSize"
                  :pager-count="5"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="itemPagination.total"
                ></datablau-pagination>
              </template>
            </datablau-form-submit>
          </div>
        </div>
      </div>
    </template>
    <template v-if="showDetails">
      <div
        class="item-details"
        style="
          width: 100%;
          height: 100%;
          background-color: #fff;
          padding: 0;
          position: absolute;
          z-index: 99;
        "
      >
        <div class="title-row">
          <datablau-breadcrumb
            @back="cancelItem"
            :node-data="breadNodeData"
            :couldClick="false"
          ></datablau-breadcrumb>
        </div>
        <datablau-form-submit style="margin-top: 50px">
          <template v-if="itemEditable">
            <datablau-form
              :inline-message="false"
              label-position="right"
              :label-width="'100px'"
              size="small"
              ref="itemForm"
              :rules="itemEditable ? itemRules : {}"
              :model="itemDetails"
              style="padding-left: 20px"
            >
              <datablau-detail-subtitle
                title="基础属性"
                mt="0px"
                mb="10px"
              ></datablau-detail-subtitle>
              <el-form-item label="信息项名称" prop="name">
                <datablau-input
                  v-model="itemDetails.name"
                  placeholder="请输入信息项名称"
                  maxlength="50"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="信息项编码" prop="stdCode">
                <datablau-input
                  v-model="itemDetails.stdCode"
                  placeholder="请输入信息项编码，该项是信息项的唯一标识"
                  :disabled="!!itemDetails.itemId || autoCodeSelect"
                  :disabledGrey="!!itemDetails.itemId || autoCodeSelect"
                  :style="{ width: !itemDetails.itemId ? '412px' : '500px' }"
                ></datablau-input>
                <datablau-checkbox
                  v-if="!itemDetails.itemId"
                  :checkboxType="'single'"
                  v-model="autoCodeSelect"
                  @change="autoCodeChange"
                  :disabled="!autoCode"
                  style="display: inline-block; margin-left: 10px"
                >
                  自动生成
                </datablau-checkbox>
              </el-form-item>
              <el-form-item label="英文名称" prop="englishName">
                <datablau-input
                  v-model="itemDetails.englishName"
                  placeholder="请输入英文名称"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="选择目录" prop="catalogPathName">
                <datablau-input
                  placeholder="请选择目录"
                  v-model="itemDetails.catalogPathName"
                  @focus="openItemCatalogDialog"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="业务定义" prop="businessDepartment">
                <datablau-input
                  type="textarea"
                  v-model="itemDetails.businessDepartment"
                  placeholder="请输入业务定义"
                  style="width: 500px"
                ></datablau-input>
              </el-form-item>
              <template v-if="udps.length">
                <datablau-detail-subtitle
                  title="扩展属性"
                  mt="0px"
                  mb="10px"
                ></datablau-detail-subtitle>
                <el-form-item
                  v-for="(udp, index) in udps"
                  :key="index"
                  :prop="udp.propName"
                  :label="udp.propName"
                >
                  <datablau-input
                    v-if="udp.type === 'STRING'"
                    type="textarea"
                    :autosize="{ minRows: 2 }"
                    v-model="udp.value"
                    :placeholder="$version.domain.placeholder.property"
                    style="width: 500px"
                  ></datablau-input>
                  <datablau-select
                    v-if="udp.type === 'ENUM'"
                    v-model="udp.value"
                    :placeholder="$version.domain.placeholder.property"
                  >
                    <el-option
                      v-for="item in udp.typeData.split(',')"
                      :key="item"
                      :label="item"
                      :value="item"
                    ></el-option>
                  </datablau-select>
                  <el-input-number
                    v-if="udp.type === 'NUM'"
                    v-model="udp.value"
                  ></el-input-number>
                </el-form-item>
              </template>
            </datablau-form>
            <div slot="buttons">
              <datablau-button
                v-if="itemEditable"
                type="primary"
                size="mini"
                @click="submitItem"
              >
                保存
              </datablau-button>
              <datablau-button type="secondary" size="mini" @click="cancelItem">
                取消
              </datablau-button>
            </div>
          </template>
          <template v-else>
            <datablau-detail>
              <datablau-detail-subtitle
                title="基础属性"
                mt="0px"
                mb="10px"
              ></datablau-detail-subtitle>
              <el-form-item label="信息项名称" style="width: 100%">
                <span>{{ itemDetails.name }}</span>
              </el-form-item>
              <el-form-item label="信息项编码" style="width: 100%">
                <span>{{ itemDetails.stdCode }}</span>
              </el-form-item>
              <el-form-item label="英文名称" style="width: 100%">
                <span>{{ itemDetails.englishName }}</span>
              </el-form-item>
              <el-form-item label="选择目录" style="width: 100%">
                <span>
                  {{ itemDetails.catalogPathName }}
                </span>
              </el-form-item>
              <el-form-item label="业务定义" style="width: 100%">
                <span>{{ itemDetails.businessDepartment }}</span>
              </el-form-item>
              <template v-if="udps.length">
                <datablau-detail-subtitle
                  title="扩展属性"
                  mt="0px"
                  mb="10px"
                ></datablau-detail-subtitle>
                <el-form-item
                  v-for="(udp, index) in udps"
                  :key="index"
                  :label="udp.propName"
                  style="width: 100%"
                >
                  <template>{{ udp.value }}</template>
                </el-form-item>
              </template>
            </datablau-detail>
          </template>
        </datablau-form-submit>
      </div>
    </template>
    <!-- 导入信息项 -->
    <datablau-dialog
      :size="'m'"
      append-to-body
      :title="``"
      :close-on-click-modal="false"
      :visible.sync="uploadDialogVisible"
      @close="handleCloseUploadDialog"
    >
      <span slot="title">
        <span
          style="
            font-size: 16px;
            line-height: 24px;
            color: #555;
            font-weight: 500;
          "
        >
          导入信息项
        </span>
        <el-tooltip
          placement="right"
          effect="dark"
          popper-class="tooltipDomain"
        >
          <i class="iconfont icon-tips"></i>
          <div slot="content">模版内信息项中文名不可重复，全部为新增</div>
        </el-tooltip>
      </span>
      <template v-if="!showUploadRes">
        <div class="uploadContent" v-loading="uploading">
          <p class="uploadtip">仅支持上传单个文件，支持上传文件格式为：xlsx</p>
          <datablau-button
            style="
              float: right;
              margin-right: -25px;
              margin-top: -6px;
              line-height: 30px;
            "
            type="text"
            @click="modelDownload"
          >
            下载模板
          </datablau-button>
          <datablau-upload
            :action="standardUploadUrl"
            :before-upload="showBegain"
            :on-error="onError"
            :on-success="onSuccess"
            :on-change="onChange"
            :before-remove="beforeRemove"
            :show-file-list="true"
            accept=".xlsx"
            :headers="$headers"
            ref="itemImport"
            :isEdit="true"
            :limit="2"
            :auto-upload="false"
            class="standardImport-upload"
          >
            <slot>
              <datablau-button type="secondary">
                <i class="iconfont icon-upload" style="margin-right: 6px"></i>
                <span>上传文件</span>
              </datablau-button>
            </slot>
            <div slot="tip" class="el-upload__tip"></div>
          </datablau-upload>
          <div class="autoCode">
            <datablau-switch
              v-model="autoCodeSelect"
              :disabled="!autoCode"
              style="display: inline-block; margin-right: 8px"
            ></datablau-switch>

            <span
              style="margin-right: 2px; color: #555"
              :style="{
                color: autoCode && autoCodeSelect ? '#409eff' : '#555555',
              }"
            >
              自动生成信息项编码
            </span>
            <el-tooltip
              placement="right"
              effect="dark"
              popper-class="tooltipDomain"
              v-if="autoCodeSelect"
            >
              <i class="iconfont icon-tips"></i>
              <div slot="content">
                导入时自动生成信息项编码，模版内原有编码列的值失效
              </div>
            </el-tooltip>
          </div>
        </div>
        <div slot="footer">
          <datablau-button type="secondary" @click="handleCloseUploadDialog">
            取消
          </datablau-button>
          <datablau-button
            :disabled="formFile.length === 0"
            type="primary"
            @click="importItems"
          >
            确定
          </datablau-button>
        </div>
      </template>
      <template v-else>
        <div class="success-group">
          <div class="success-title">
            <i class="el-icon-success success-icon"></i>
            <span style="margin-left: 6px">
              导入成功：{{ uploadSuccessNum }}条
            </span>
          </div>
        </div>
        <div
          v-for="errorKey in Object.keys(uploadResList)"
          :key="errorKey"
          class="error-group"
        >
          <div class="error-title">
            <i class="el-icon-error fail-icon"></i>
            <span class="error-reason">{{ uploadResMap[errorKey] }}:</span>
            <span class="error-count">
              {{ uploadResList[errorKey].length }}条
            </span>
            <span class="copy" v-copy="uploadResList[errorKey].join('， ')">
              复制
            </span>
          </div>
          <div class="error-list">
            {{ uploadResList[errorKey].join('， ') }}
          </div>
        </div>
      </template>
    </datablau-dialog>
    <!-- 扩展属性弹窗 -->
    <datablau-dialog
      size="xl"
      title="扩展属性"
      :visible.sync="showUdps"
      append-to-body
      :height="400"
    >
      <udps
        :defaultUdps="udps"
        @update="updateUdps"
        @close="closeudpDialog"
      ></udps>
    </datablau-dialog>
    <!-- 信息项树节点弹窗 -->
    <datablau-dialog
      class="jobs-sta"
      width="650px"
      :title="catalogDialogTitle"
      :visible.sync="catalogDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      @close="cancelCatalog"
    >
      <datablau-form
        v-if="catalogEditable"
        :model="catalogDetails"
        :rules="catalogEditable ? rulePram : {}"
        ref="catalogForm"
        label-width="130px"
        size="mini"
        class="catalogDialog"
      >
        <el-form-item label="信息项分类名称" prop="name">
          <datablau-input
            clearable
            show-word-limit
            maxlength="30"
            size="small"
            style="width: 100%"
            v-model="catalogDetails.name"
            placeholder="请输入信息项分类名称，避免使用#/\@$_%<>等特殊字符"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <datablau-input
            type="textarea"
            clearable
            show-word-limit
            maxlength="200"
            size="small"
            class="item-desc"
            style="width: 100%"
            v-model="catalogDetails.comment"
            placeholder="请输入描述"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <datablau-detail v-else :fullWidth="true" label-width="110px">
        <el-form-item label="信息项分类名称" style="width: 100%">
          <span>{{ catalogDetails.name }}</span>
        </el-form-item>
        <el-form-item label="描述" style="width: 100%">
          <span>{{ catalogDetails.comment }}</span>
        </el-form-item>
      </datablau-detail>
      <div slot="footer">
        <datablau-button type="secondary" @click="cancelCatalog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          v-if="catalogEditable"
          type="important"
          @click="submitCatalog"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <!-- 信息项目录弹窗 -->
    <datablau-dialog
      class="jobs-sta"
      width="650px"
      title="请选择信息项目录"
      :visible.sync="itemCatalogDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      :before-close="closeItemCatalogDialog"
    >
      <div class="tree-box" style="overflow: auto; min-height: 400px">
        <datablau-tree
          v-if="itemCatalogDialogVisible"
          ref="selectTree"
          class="grey-tree"
          :props="defaultProps"
          :show-checkbox="false"
          node-key="id"
          lazy
          :load="loadTreeData"
          :default-expanded-keys="[]"
          :default-expand-all="false"
          :expand-on-click-node="false"
          :highlight-current="true"
          auto-expand-parent
          :check-strictly="false"
          :data-icon-function="dataIconFunction"
          :data-supervise="true"
          @node-click="handleItemClicked"
          show-overflow-tooltip
        ></datablau-tree>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="closeItemCatalogDialog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          :disabled="!targetItemCatalog"
          type="important"
          @click="selectItemCatalog"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <!-- 删除结果提示 -->
    <datablau-dialog title="提示" size="s" :visible.sync="showDeleteTips">
      <div class="tip-content">
        <div class="item">
          <template>
            <div class="title">
              <i class="el-icon-success success-icon"></i>
              成功删除：{{ successNum }}条
            </div>
            <div class="title">
              <i class="el-icon-error fail-icon"></i>
              失败删除：{{ deleteTipList.length }}条
              <span class="span-error-tip">
                （信息项已被关联到安全分类，不允许被删除）
              </span>
              <div
                class="copy"
                v-copy="deleteTipList.map(item => item.name).join('；')"
              >
                复制
              </div>
            </div>
            <div class="error-list">
              {{ deleteTipList.map(item => item.name).join(',') }}
            </div>
          </template>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="showDeleteTips = false">
          关闭
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import main from './index.js'
export default main
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
<style lang="scss">
.standardImport-upload {
  .el-upload-list__item {
    font-size: 12px;
  }
  .el-upload-list {
    display: inline-block;
    vertical-align: middle;
    padding-left: 4px;
  }
  .el-upload-list__item:first-child {
    margin-top: 0;
  }
  .el-upload__tip {
    display: none;
  }
}

.el-tooltip__popper.tooltipDomain.is-dark[x-placement^='right'] {
  transform: translate(-5px, 0px);
}
</style>
<style lang="scss" scoped>
.title-row {
  height: 40px;
  border-bottom: 1px solid #ebeef5;
  padding-top: 8px;
  padding-left: 20px;
}
#domainFolder .st-page-form {
  @media (max-width: 1525px) {
    .el-form-item__content {
      //border: 1px solid red;
      width: 110px;

      .el-input {
        width: 110px;
      }

      .el-button {
        padding: 7px 10px;
      }
    }
  }
}

.datastandard-folder-detail {
  position: relative;
  height: 100%;
  width: 100%;

  .inline-search-item {
    display: inline-block;
    margin-left: 8px;
  }

  .search-outer {
    padding: 10px 20px 0 20px;

    /deep/ .datablau-form-box .el-select.is-single {
      width: 100% !important;
    }
    /deep/ .datablau-form-box {
      // min-width: 1000px;
      display: flex;
    }
    /deep/ .datablau-form-box .list-buttons {
      // min-width: 1000px;
      display: flex;
      float: none;
      flex-shrink: 0;
    }
    /deep/ .datablau-form-box .list-search-box {
      // display: flex;
      // flex-wrap: wrap;
      flex-grow: 1;
      overflow-x: auto;
      margin-right: 0;
      // min-width: 840px;
      overflow-y: hidden;
    }

    /deep/ .datablau-form-box .list-search-box .el-form {
      // flex-grow: 1;
      min-width: 0;
    }

    /deep/ .datablau-form-box .list-search-box .el-form .el-form-item {
      //border: 1px solid red;
      margin-right: 10px;

      .el-form-item__content {
        min-width: auto;
        line-height: 30px;
      }
    }

    .more-condition-btn {
      //border: 1px solid red;
      position: absolute;
      top: 18px;
      right: 350px;

      i {
        transform: rotate(180deg);
      }
    }

    .more-fun-btn {
      margin-left: 10px;
    }
  }

  /deep/ .list-title {
    display: none;
  }

  .search-form {
    padding: 10px 0 0 20px;

    &.el-form.el-form--inline /deep/ .el-form-item {
      margin-bottom: 4px;
    }
  }

  /deep/ .form-submit {
    top: 105px;
  }

  /deep/ .row-buttons {
    text-align: left;
  }

  .left-btn {
    position: absolute;
    left: 0;
    height: 100%;
    width: 600px;
    padding-left: 20px;

    .footer-row-info {
      margin-right: 10px;
      &::before {
        margin-right: 5px;
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        line-height: 13px;
        color: white;
        vertical-align: middle;
        content: '\e6da';
      }
    }
  }

  .pagination-component {
    float: right;
    margin-right: 20px;
  }

  .hide-btn {
    visibility: hidden;
  }

  .not-subscribe {
    i.icon-dingyue {
      color: #999;
    }
  }
}

.edit-btn {
  display: inline-block;
}

.datastandard-folder-detail.less-search-line {
  /deep/ .form-submit {
    top: 80px;
  }

  .more-condition-btn {
    i {
      transform: rotate(0deg);
    }
  }
}

/deep/ .el-list-leave-active {
  transition: none;
  opacity: 0;
}
/deep/.el-form.db-form .el-form-item:last-child {
  margin-bottom: 0;
}
</style>
<style lang="scss">
.datastandard-folder-detail {
  border-top: 1px solid rgba(0, 0, 0, 0);

  .ag-root {
    // ag-grid root
    $headerHigth: 50px;

    .ag-header {
      .ag-header-row {
        .ag-header-cell {
          height: $headerHigth;
          line-height: $headerHigth;

          &::after {
            height: $headerHigth;
          }
        }
      }
    }
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
}
.more-drop-box .el-dropdown-menu__item {
  .iconfont {
    color: #999;
    font-size: 14px;
  }
  &:hover {
    color: #409eff;
    .iconfont {
      color: #409eff;
    }
  }
}
.el-popover {
  min-width: 100px;
}
.catalogDialog .el-textarea .el-input__count {
  bottom: 1px;
  right: 16px;
}
.catalogDialog .el-textarea .el-textarea__inner {
  padding-left: 10px;
  padding-right: 5px;
  padding-bottom: 20px;
}
.catalogDialog .el-form.db-form .el-textarea,
.catalogDialog .el-form.db-form .datablau-input[type='textarea'] {
  width: 100%;
}
</style>
