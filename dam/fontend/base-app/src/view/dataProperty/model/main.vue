<template>
  <div style="position: relative; width: 100%; height: 100%; background: #fff">
    <datablau-dialog
      title="新增模型"
      :visible.sync="showAddModelDialog"
      height="305px"
      width="430px"
      size="mini"
      :before-close="close"
    >
      <datablau-form
        :model="modelData"
        label-width="50px"
        :rules="modelRules"
        ref="modelForm"
      >
        <el-form-item label="代码" prop="Code">
          <datablau-input
            v-model="modelData.Code"
            placeholder="请输入代码"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="名称" prop="Name">
          <datablau-input
            v-model="modelData.Name"
            placeholder="请输入名称"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="描述">
          <datablau-input
            v-model="modelData.Definition"
            type="textarea"
            style="width: 300px"
            placeholder="请输入描述"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button type="info" @click="close">取消</datablau-button>
        <datablau-button type="primary" @click="confirm">确定</datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      size="l"
      append-to-body
      title="导入
      "
      :height="250"
      :close-on-click-modal="false"
      :visible.sync="uploadDialogVisible"
    >
      <div class="uploadContent">
        <p class="uploadtip">仅支持上传单个文件，支持上传文件格式为：xml</p>
        <!-- <datablau-button
          style="float: right; margin-right: -8px"
          type="text"
          @click="downloadTemplates"
        >
          下载模板
        </datablau-button> -->
        <datablau-upload
          :action="uploadUrl"
          :on-change="handleUploadChange"
          :before-remove="beforeRemove"
          :show-file-list="true"
          accept=".xml"
          :headers="$headers"
          ref="m1Import"
          :isEdit="true"
          :limit="1"
          :auto-upload="false"
          class="m1-upload"
        >
          <slot>
            <datablau-button type="secondary">
              <i class="iconfont icon-upload" style="margin-right: 6px"></i>
              <span>上传文件</span>
            </datablau-button>
          </slot>
          <div slot="tip" class="el-upload__tip"></div>
        </datablau-upload>
      </div>
      <div slot="footer">
        <datablau-button
          :disabled="formFile.length === 0"
          type="primary"
          @click="importAction"
        >
          {{ $t('domain.common.confirm') }}
        </datablau-button>
        <datablau-button type="secondary" @click="uploadDialogVisible = false">
          {{ $t('domain.common.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-page-title
      class="page-title-row2"
      parent-name="元数据"
      name="元模型"
    ></datablau-page-title>
    <div style="padding-right: 20px; width: 100%; float: left">
      <datablau-button
        class="iconfont icon-tianjia"
        @click="toAddModel"
        style="float: right"
      >
        新增
      </datablau-button>
    </div>
    <div
      style="position: absolute; top: 80px; left: 20px; right: 20px; bottom: 0"
    >
      <datablau-table :data="modelList" height="100%">
        <el-table-column width="28" header-align="center" align="center">
          <template slot-scope="scope">
            <datablau-icon
              class="iconForIe"
              :data-type="'metamodelicon'"
              :key="scope.row"
              :size="18"
              style="position: relative; margin-left: 5px; top: 3px"
            ></datablau-icon>
          </template>
        </el-table-column>
        <el-table-column label="元模型名称" prop="name">
          <template slot-scope="scope">
            <datablau-button
              type="text"
              @click="toEditModel(scope.row)"
            >
              {{ scope.row.name }}
            </datablau-button>
          </template>
        </el-table-column>
        <el-table-column label="代码" prop="code"></el-table-column>
        <el-table-column label="描述" prop="description"></el-table-column>
        <el-table-column label="版本" prop="startVer"></el-table-column>
        <el-table-column label="状态" prop="status"></el-table-column>
        <el-table-column
          label="上次更新时间"
          prop="updateTime"
          :formatter="$timeFormatter"
        ></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <datablau-button
              type="icon"
              class="iconfont icon-import"
              tooltipContent="导入"
              @click="toShowUploadDialog(scope.row.id)"
            ></datablau-button>
            <datablau-button
              type="icon"
              class="iconfont icon-export"
              tooltipContent="导出"
              @click="exportM1(scope.row.id)"
            ></datablau-button>
            <datablau-button
              type="icon"
              tooltipContent="编辑"
              class="iconfont icon-bianji"
              @click="toEditModel(scope.row)"
            ></datablau-button>
            <datablau-button
              type="icon"
              class="iconfont icon-delete"
              tooltipContent="删除"
              :disabled="scope.row.builtIn"
              @click="toDeleteModel(scope.row)"
            ></datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <Details
      v-if="showDetails && currentModelId"
      :id="currentModelId"
      style="position: absolute; top: 0; left: 0; right: 0; bottom: 0"
      @back="handleDetailsBack"
    ></Details>
  </div>
</template>

<script>
import MainJs from './main.js'
export default MainJs
</script>

<style lang="scss" scoped>
.page-content {
  position: relative;
  width: 100%;
  height: calc(100% - 60px);
  overflow: auto;
  .tree-content {
    position: absolute;
    left: 0;
    width: 600px;
    top: 0;
    bottom: 0;
  }
  .middle-line {
    position: absolute;
    top: 0;
    left: 605px;
    bottom: 0;
    z-index: 2;
    width: 7px;
    cursor: e-resize !important;
    background-color: transparent;
  }
  .prop-content {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 610px;
    width: calc(100% - 610px);
    border-left: 1px solid #ccc;
    padding-left: 20px;
  }
}

.prop-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  .prop-label {
    display: inline-block;
    width: 120px;
  }
  .prop-value {
    display: inline-block;
    width: 500px;
  }
}
.uploadContent {
  clear: both;
  background: #f7f9fb;
  border-radius: 4px;
  padding: 16px;
  .uploadtip {
    font-size: 12px;
    color: #777;
    padding-bottom: 16px;
    display: inline-block;
  }
  .autoCode {
    padding-top: 16px;
  }
}
</style>
