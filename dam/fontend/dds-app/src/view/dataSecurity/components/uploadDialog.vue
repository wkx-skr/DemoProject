<template>
  <datablau-dialog
    :size="'m'"
    append-to-body
    :title="title"
    :close-on-click-modal="false"
    :visible.sync="showUpload"
    @close="handleCloseUploadDialog"
  >
    <template>
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
            :style="{ color: autoCode ? '#409eff' : '#555555' }"
          >
            自动生成信息项编码
          </span>
          <el-tooltip placement="right" effect="dark" class="tooltipDomain">
            <i class="iconfont icon-tips"></i>
            <div style="width: 350px" slot="content">
              模板内信息项编码列失效，导入时自动为信息项生成信息项编码，模板内的信息项全部为新增信息项，信息项中文名不可重复
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
  </datablau-dialog>
</template>

<script>
export default {
  props: {
    showUpload: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss"></style>
