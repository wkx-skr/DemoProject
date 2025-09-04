<template>
  <div class="listWrap">
    <datablau-list-search class="search-area">
      <!--      <template slot="title">
        <div></div>
      </template>-->
      <el-form>
        <el-form-item>
          <datablau-input
            style="border-radius: 2px; display: inline-block"
            v-model="keyword"
            :placeholder="$t('meta.lineageManage.scriptManage.fillScriptName')"
            :iconfont-state="true"
            clearable
          ></datablau-input>
        </el-form-item>
        <el-form-item class="btn">
          <datablau-button type="normal" @click="handleSearch">
            {{ $t('common.button.query') }}
          </datablau-button>
        </el-form-item>
      </el-form>
      <template slot="buttons">
        <div class="topBtns">
          <!--        <el-upload
          style="display: inline-block; margin-left: 10px; margin-right: 10px"
          :action="$url + '/service/datamasking/upload'"
          :before-upload="handleBeforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :show-file-list="false"
          accept=".xlsx"
          :headers="$headers"
        >
          <datablau-button
            type="secondary"
            class="icon-ic-quality-import button-icon"
          >
            上传脚本
          </datablau-button>
        </el-upload>-->
          <datablau-button
            class="iconfont icon-tianjia"
            type="important"
            @click="addScript"
          >
            {{ $t('meta.lineageManage.scriptManage.addScript') }}
          </datablau-button>
          <el-dropdown
            trigger="click"
            style="margin-left: 10px"
            @command="handleCommand"
          >
            <datablau-button type="secondary" class="el-dropdown-link">
              {{ $t('quality.page.ruleTemplate.moreOperation') }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </datablau-button>
            <el-dropdown-menu style="margin-top: 4px" slot="dropdown">
              <el-dropdown-item icon="el-icon-upload" command="uploadScript">
                <span @click="uploadScript">
                  {{ $t('meta.lineageManage.scriptManage.uploadScript') }}
                </span>
              </el-dropdown-item>
              <el-dropdown-item icon="el-icon-download" command="downloadTemp">
                <span @click="downloadTemp">
                  {{ $t('meta.lineageManage.scriptManage.downloadTemp') }}
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </template>
    </datablau-list-search>
    <datablau-form-submit style="margin-top: 44px">
      <datablau-table
        :data="tableData"
        ref="multipleTable"
        height="100%"
        style="height: 100%"
        @selection-change="handleSelectionChange"
        data-selectable
      >
        <el-table-column width="18">
          <datablau-icon
            :data-type="'code'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          prop="name"
          show-overflow-tooltip
          align="left"
          min-width="160"
          :label="$t('meta.lineageManage.scriptManage.scriptName')"
        ></el-table-column>
        <el-table-column
          prop="description"
          :label="$t('meta.lineageManage.scriptManage.description')"
          min-width="150"
          show-overflow-tooltip
          align="left"
        ></el-table-column>
        <el-table-column
          min-width="200"
          prop="lineageType"
          :label="$t('meta.lineageManage.scriptManage.lineageType')"
        ></el-table-column>
        <el-table-column
          prop="scriptTypeDesc"
          min-width="120"
          :label="$t('meta.lineageManage.scriptManage.langType')"
        ></el-table-column>
        <el-table-column
          prop="modifityTime"
          :label="$t('meta.lineageManage.scriptManage.modifityTime')"
          :formatter="$timeFormatter"
          width="190"
        ></el-table-column>
        <el-table-column
          prop="creator"
          min-width="100"
          :label="$t('meta.lineageManage.scriptManage.creator')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="createTime"
          :label="$t('meta.lineageManage.scriptManage.createTime')"
          :formatter="$timeFormatter"
          width="190"
        ></el-table-column>
        <el-table-column
          :label="$t('meta.lineageManage.scriptManage.operation')"
          header-align="center"
          align="center"
          fixed="right"
          width="120"
        >
          <template slot-scope="scope">
            <datablau-switch
              :title="
                scope.row.enabled
                  ? $t('meta.lineageManage.scriptManage.enable')
                  : $t('meta.lineageManage.scriptManage.disable')
              "
              v-model="scope.row.enabled"
              :active-value="true"
              :inactive-value="false"
              style="display: inline-block; margin-right: 10px"
              @change="changeStatus(scope.row.id, scope.row.enabled)"
            ></datablau-switch>
            <datablau-button
              type="icon"
              :title="$t('common.button.edit')"
              @click.prevent.stop="handleEdit(scope.row)"
            >
              <i class="iconfont icon-bianji"></i>
            </datablau-button>
            <datablau-button
              type="icon"
              :title="$t('common.button.delete')"
              @click.prevent.stop="preDel(scope.row.id)"
            >
              <i class="iconfont icon-delete"></i>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div
          class="left-button"
          style="display: inline-block"
          v-show="selected.length > 0"
        >
          <span class="check-info"></span>
          <span class="footer-row-info">
            {{
              $t('common.deleteMessage', {
                selection: selected.length,
              })
            }}
          </span>
          <datablau-button
            type="danger"
            class="el-icon-delete"
            @click="preDelBatch"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
          style="float: right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <el-upload
      v-if="showUpload"
      style="z-index: -9999; height: 0"
      :action="this.$meta_url + '/lineage/script/uploadScript'"
      :show-file-list="false"
      :before-upload="showBegain"
      :on-success="handleUpdateMetadataSuccess"
      :headers="$headers"
      :on-error="handleUpdateMetadataError"
    >
      <el-button type="text" size="small" ref="importScript"></el-button>
    </el-upload>
  </div>
</template>
<script>
import list from './list.js'
export default list
</script>
<style lang="scss" scoped="scoped">
.listWrap {
  position: absolute;
  top: 10px;
  right: 0;
  left: 0;
  bottom: 0;
  min-width: 700px;
  .search-area {
    padding-left: 20px;
    //height: 34px;
    .topBtns {
      margin-right: 20px;
    }
  }
}
</style>
