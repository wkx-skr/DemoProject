<template>
  <div class="page">
    <datablau-page-title
      :name="$t('common.page.plugInManager')"
    ></datablau-page-title>
    <datablau-filter-row>
      <div class="row-inner">
        <!--        <span class="tab-page-header">任务名称</span>-->
        <!--        <datablau-input
          clearable
          v-model="queryDto.name"
          :iconfont-state="true"
          placeholder="请输入关键字"
        ></datablau-input>-->
        <span class="tab-page-header">
          {{ $t('system.plugInManager.pluginType') }}
        </span>
        <datablau-select
          v-model="pluginType"
          class="job-tab-input"
          style="width: 200px; display: inline-block; margin-left: 10px"
          :clearable="false"
          @change="getData"
          :filterable="false"
        >
          <el-option
            v-for="item in PluginType"
            :key="item"
            :label="PluginTypeLabel[item]"
            :value="item"
          ></el-option>
        </datablau-select>
        <!--        <datablau-button @click="getData" style="margin-left: 10px;">搜索</datablau-button>-->
        <div class="page-btn-group right-top" style="top: 40px"></div>
      </div>
    </datablau-filter-row>
    <datablau-form-submit style="margin-top: 84px; padding: 0 20px">
      <datablau-table :data="tableData" height="100%">
        <el-table-column type="expand">
          <template slot-scope="props">
            <datablau-table
              :data="props.row.pluginDescriptor.files"
              style="margin: 10px 0 10px 50px"
            >
              <el-table-column
                prop="fileName"
                :label="$t('system.plugInManager.table.fileName')"
              ></el-table-column>
              <el-table-column
                prop="fileSize"
                :label="$t('system.plugInManager.table.fileSize')"
              >
                <template slot-scope="scope">
                  <span v-if="scope.row.fileSize">
                    {{ Math.ceil(scope.row.fileSize / 1024) }}KB
                  </span>
                  <span v-else>n/a</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="uploadTime"
                :label="$t('system.plugInManager.table.uploaded')"
                :formatter="$timeFormatter"
              ></el-table-column>
              <el-table-column
                prop="uploader"
                :label="$t('system.plugInManager.table.uploader')"
              ></el-table-column>
            </datablau-table>
          </template>
        </el-table-column>
        <el-table-column
          prop="pluginName"
          :label="$t('system.plugInManager.table.pluginName')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="pluginType"
          :label="$t('system.plugInManager.pluginType')"
        >
          <template slot-scope="scope">
            {{ PluginTypeLabel[scope.row.pluginType] }}
          </template>
        </el-table-column>
        <el-table-column
          prop="creationTime"
          :label="$t('system.plugInManager.table.creationTime')"
          :formatter="$timeFormatter"
        ></el-table-column>
        <el-table-column
          prop="lastUpdateTime"
          :label="$t('system.plugInManager.table.lastUpdateTime')"
          :formatter="$timeFormatter"
        ></el-table-column>
        <el-table-column
          prop="build"
          :label="$t('system.plugInManager.table.buildNumber')"
          show-overflow-tooltip
        ></el-table-column>
      </datablau-table>
    </datablau-form-submit>
    <datablau-upload
      :isEdit="true"
      :action="action"
      :show-file-list="false"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      accept=".zip"
    >
      <datablau-button
        class="iconfont icon-plus"
        style="position: absolute; right: 20px; top: 40px"
      >
        {{ $t('system.plugInManager.upload') }}
        {{ PluginTypeLabel[pluginType] }}
      </datablau-button>
    </datablau-upload>
  </div>
</template>
<script>
import { JobFileStatusLabel, JobFileStatus } from '@/view/jobMonitor/Constant'
import { PluginType, PluginTypeLabel } from '@/view/pluginManager/PluginType'
export default {
  data() {
    return {
      tableData: null,
      pluginType: PluginType.DataSourcePlugin,
    }
  },
  computed: {
    PluginType() {
      const result = {}
      Object.keys(PluginType).forEach(item => {
        if (isNaN(item - 0)) {
          result[item] = PluginType[item]
        }
      })
      return result
    },
    PluginTypeLabel() {
      return PluginTypeLabel
    },
    action() {
      return `/base/plugins/uploadPlugin?pluginType=${this.pluginType}`
    },
  },
  methods: {
    getData() {
      this.tableData = null
      this.$http
        .post(`/base/plugins/getAllPlugins?pluginType=${this.pluginType}`)
        .then(res => {
          res.data.forEach(item => {
            item.creationTime = item.pluginDescriptor.creationTime
            item.build = item.pluginDescriptor.build
          })
          this.tableData = res.data
        })
    },
    handleBeforeUpload(file) {
      if (file.type.includes('zip')) {
        this.$fullScreenLoading.open()
      }
    },
    handleUploadSuccess() {
      this.$fullScreenLoading.close()
      this.getData()
    },
    handleUploadError(e) {
      this.$fullScreenLoading.close()
      this.$showUploadFailure(e)
    },
  },
  mounted() {
    this.getData()
  },
}
</script>
<style scoped lang="scss">
.page {
  height: 100%;
  background-color: #fff;
}
</style>
