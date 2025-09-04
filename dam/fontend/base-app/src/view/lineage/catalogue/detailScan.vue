<template>
  <div class="catalogueDetail-scan">
    <choose-tag
      :tagTree="tagTree"
      :tagMap="tagMap"
      ref="chooseTag"
      :oldChoosedIds="formData.TagIds === '' ? [] : formData.TagIds"
      @choosedTagChanged="choosedTagChanged"
    ></choose-tag>
    <dataSource-dialog
      :selectionData="selectionData"
      :dialogVisible="dialogVisible"
      @closeDialog="closeDialog"
      @getModel="getModel"
      :folderId="folderId"
      @getTreeRef="getTreeRef"
      ref="dataSourceDialog"
    ></dataSource-dialog>
    <script-list-dialog
      ref="scriptDialog"
      @getScript="getScript"
      :scriptDialogVisible="scriptDialogVisible"
      @closeScriptDialog="closeScriptDialog"
      :folderId="folderId"
      @getTreeRef="getTreeRef"
    ></script-list-dialog>
    <datablau-dialog
      :visible.sync="dialogUploadTab"
      :title="$t('meta.lineageManage.importLineageFile')"
      width="1000px"
      :height="'500px'"
      :before-close="handleCloseUploadTab"
      append-to-body
    >
      <upload-tab
        ref="uploadTab"
        :lineage="uploadLineage"
        :catalogueScan="true"
        :folderId="uploadTabfolderId"
        @addUploadTab="addUploadTab"
        @handleCloseUploadTab="handleCloseUploadTab"
      ></upload-tab>
      <!-- <upload-tab
        v-show="!uploadState"
        ref="uploadTab"
        :lineage="uploadLineage"
        :catalogueScan="true"
        :folderId="uploadTabfolderId"
        @addUploadTab="addUploadTab"
        @handleCloseUploadTab="handleCloseUploadTab"
      ></upload-tab> -->
    </datablau-dialog>
    <h1>
      {{ $t('meta.lineageManage.lineageCatalogue.detailScan.catalogDetails') }}
    </h1>
    <datablau-tabs
      v-model="activeName"
      @tab-click="handleClick"
      style="position: absolute; top: 60px; left: 20px; right: 20px; bottom: 0"
    >
      <el-tab-pane
        :label="
          $t('meta.lineageManage.lineageCatalogue.detailScan.basicInformation')
        "
        name="first"
      >
        <datablau-form
          :model="formData"
          ref="formData"
          :disabled="disabledEdit"
          :label-width="$i18n.locale === 'zh' ? '100px' : '150px'"
          :rules="rules"
        >
          <el-form-item
            :label="
              $t('meta.lineageManage.lineageCatalogue.detailScan.directoryName')
            "
            prop="folderName"
          >
            <datablau-input
              v-model="formData.folderName"
              show-word-limit
              style="width: 500px"
              class="maxlengthInput"
              maxlength="100"
              placeholder=""
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="
              $t('meta.lineageManage.lineageCatalogue.detailScan.directoryPath')
            "
            prop="path"
          >
            <datablau-cascader
              :options="options"
              v-model="formData.path"
              :disabled="true"
              :props="dsCascaderProps"
            ></datablau-cascader>
          </el-form-item>
          <el-form-item
            :label="
              $t('meta.lineageManage.lineageCatalogue.detailScan.itDepartment')
            "
            prop="itDepartmentName"
          >
            <datablau-input
              v-model="formData.itDepartmentName"
              show-word-limit
              style="width: 500px"
              placeholder=""
              @focus="selectItDepartment"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="
              $t(
                'meta.lineageManage.lineageCatalogue.detailScan.bsDepartmentName'
              )
            "
            prop="bsDepartmentName"
          >
            <datablau-input
              v-model="formData.bsDepartmentName"
              show-word-limit
              style="width: 500px"
              placeholder=""
              @focus="selectBsDepartment"
            ></datablau-input>
          </el-form-item>
          <!--          <el-form-item
            :label="$t('meta.lineageManage.lineageCatalogue.detailScan.tag')"
            size="mini"
          >
            <el-select
              v-model="formData.TagIds"
              multiple
              filterable
              @focus="openChooseTag"
              ref="tagSelect"
              style="width: 500px"
            >
              <el-option
                v-for="item in tagMap"
                style="max-width: 460px"
                :label="item.name"
                :value="item.tagId"
                :key="item.tagId"
              ></el-option>
            </el-select>
          </el-form-item>-->
          <el-form-item
            :label="$t('meta.lineageManage.lineageCatalogue.detailScan.owner')"
            prop="owner"
          >
            <datablau-input
              v-model="formData.owner"
              @focus="selectProblemUser"
              show-word-limit
              style="width: 500px"
              placeholder=""
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="
              $t('meta.lineageManage.lineageCatalogue.detailScan.description')
            "
          >
            <datablau-input
              v-model="formData.description"
              show-word-limit
              style="width: 500px"
              placeholder=""
              maxlength="1000"
              type="textarea"
            ></datablau-input>
          </el-form-item>
          <el-form-item>
            <datablau-button
              type="normal"
              @click="editFormData"
              v-if="disabledEdit"
            >
              {{ $t('common.button.edit') }}
            </datablau-button>
            <datablau-button
              type="normal"
              @click="saveEdit"
              v-if="!disabledEdit"
            >
              {{ $t('common.button.save') }}
            </datablau-button>
            <datablau-button
              type="normal"
              @click="cancelEdit"
              v-if="!disabledEdit"
            >
              {{ $t('common.button.cancel') }}
            </datablau-button>
          </el-form-item>
        </datablau-form>
      </el-tab-pane>
      <!-- <el-tab-pane label="血缘展示" name="second">血缘展示</el-tab-pane> -->
      <el-tab-pane
        :label="$t('meta.lineageManage.lineageCatalogue.detailScan.dataSource')"
        name="third"
        style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0"
      >
        <datablau-input
          v-model="dataSourceKeywords"
          :iconfont-state="true"
          :placeholder="
            $t('meta.lineageManage.lineageCatalogue.detailScan.nameSys')
          "
          clearable
        ></datablau-input>
        <p
          style="display: inline-block; padding-left: 20px"
          v-if="inheritDataSource"
        >
          {{ $t('meta.lineageManage.lineageCatalogue.detailScan.inherit') }}
        </p>
        <datablau-button
          style="float: right"
          type="important"
          @click="addDataSource"
        >
          {{
            $t('meta.lineageManage.lineageCatalogue.detailScan.addDataSource')
          }}
        </datablau-button>
        <div
          style="
            margin-top: 10px;
            clear: both;
            top: 50px;
            bottom: 50px;
            left: 0px;
            right: 0px;
            position: absolute;
          "
        >
          <datablau-table
            :data="tableDataSource"
            :show-column-selection="optionTable.showColumnSelection"
            :column-selection="optionTable.columnSelection"
            :border="optionTable.columnResizable"
            :data-selectable="optionTable.selectable"
            height="100%"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
          >
            <el-table-column width="18">
              <datablau-icon
                :data-type="'datasource'"
                :size="18"
                style="margin-top: 8px"
              ></datablau-icon>
            </el-table-column>
            <el-table-column
              :label="$t('meta.dataSource.name')"
              min-width="180"
              prop="modelName"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('meta.dataSource.type')"
              min-width="120"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <database-type
                  :key="scope.row.datasourceType"
                  :value="scope.row.datasourceType"
                  :size="24"
                ></database-type>
              </template>
            </el-table-column>
            <el-table-column
              prop="ownerSystem"
              min-width="150"
              :label="$t('meta.dataSource.system')"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="owner"
              :label="$t('meta.dataSource.creator')"
              min-width="80"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              prop="createTime"
              :label="$t('meta.dataSource.createTime')"
              min-width="130"
              :formatter="$timeFormatter"
              show-overflow-tooltip
              sortable="custom"
            ></el-table-column>
          </datablau-table>
          <div
            style="
              width: 100%;
              position: absolute;
              bottom: -50px;
              right: 0px;
              height: 50px;
              background: rgb(255, 255, 255);
              border-top: 1px solid rgb(238, 238, 238);
            "
          >
            <div class="left-button" v-show="dataSourceSelection.length > 0">
              <span class="check-info"></span>
              <span class="footer-row-info">
                {{
                  $t('common.deleteMessage', {
                    selection: dataSourceSelection.length,
                  })
                }}
              </span>
              <datablau-button
                type="danger"
                class="el-icon-delete"
                @click="deleteDataSource"
              >
                {{ $t('common.button.delete') }}
              </datablau-button>
            </div>
            <datablau-pagination
              style="margin-top: 10px; text-align: right"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              :total="totalDataSource"
              :layout="'total, sizes, prev, pager, next, jumper'"
            ></datablau-pagination>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane
        v-if="$versionFeature['metadata_ScriptManagement']"
        :label="$t('meta.lineageManage.lineageCatalogue.detailScan.script')"
        name="fourth"
        style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0"
      >
        <datablau-input
          v-model="scriptKeywords"
          :iconfont-state="true"
          :placeholder="
            $t(
              'meta.lineageManage.lineageCatalogue.detailScan.scriptPlaceholder'
            )
          "
          clearable
        ></datablau-input>
        <p
          style="display: inline-block; padding-left: 20px"
          v-if="inheritScript"
        >
          {{ $t('meta.lineageManage.lineageCatalogue.detailScan.inherit') }}
        </p>
        <datablau-button
          style="float: right"
          type="important"
          @click="addScript"
        >
          {{ $t('meta.lineageManage.lineageCatalogue.detailScan.addScript') }}
        </datablau-button>
        <div
          style="
            margin-top: 10px;
            clear: both;
            top: 50px;
            bottom: 50px;
            left: 0px;
            right: 0px;
            position: absolute;
          "
        >
          <datablau-table
            :data="tableScript"
            ref="multipleTable"
            :show-column-selection="optionScriptTable.showColumnSelection"
            :column-selection="optionScriptTable.columnSelection"
            :border="optionScriptTable.columnResizable"
            height="100%"
            @selection-change="handleScriptSelectionChange"
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
              prop="scripName"
              show-overflow-tooltip
              align="left"
              min-width="160"
              :label="$t('meta.lineageManage.scriptManage.scriptName')"
            ></el-table-column>

            <el-table-column
              min-width="200"
              prop="lineageType"
              :label="
                $t('meta.lineageManage.lineageCatalogue.script.lineageType')
              "
            ></el-table-column>
            <el-table-column
              prop="scriptTypeDesc"
              min-width="140"
              :label="
                $t('meta.lineageManage.lineageCatalogue.script.scriptTypeDesc')
              "
            ></el-table-column>
            <el-table-column
              prop="addUser"
              min-width="100"
              :label="$t('meta.lineageManage.lineageCatalogue.script.addUser')"
            ></el-table-column>
            <el-table-column
              prop="createTime"
              min-width="120"
              :label="
                $t('meta.lineageManage.lineageCatalogue.script.createTime')
              "
              show-overflow-tooltip
              :formatter="$timeFormatter"
            ></el-table-column>
            <el-table-column
              prop="enabled"
              min-width="120"
              :label="$t('meta.lineageManage.lineageCatalogue.script.state')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{
                  scope.row.enabled === true
                    ? $t('meta.lineageManage.lineageCatalogue.script.enabled')
                    : $t('meta.lineageManage.lineageCatalogue.script.disabled')
                }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.lineageManage.scriptManage.operation')"
              header-align="center"
              align="center"
              fixed="right"
              width="120"
            >
              <template slot-scope="scope">
                <datablau-button
                  type="icon"
                  :title="$t('common.button.scan')"
                  @click.prevent.stop="viewScriptDetail(scope.row)"
                >
                  <i class="iconfont icon-see"></i>
                </datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <div
            style="
              width: 100%;
              position: absolute;
              bottom: -50px;
              right: 0px;
              height: 50px;
              background: rgb(255, 255, 255);
              border-top: 1px solid rgb(238, 238, 238);
            "
          >
            <div class="left-button" v-show="scriptSelection.length > 0">
              <span class="check-info"></span>
              <span class="footer-row-info">
                {{
                  $t('common.deleteMessage', {
                    selection: scriptSelection.length,
                  })
                }}
              </span>
              <datablau-button
                type="danger"
                class="el-icon-delete"
                @click="deleteScript"
              >
                {{ $t('common.button.delete') }}
              </datablau-button>
            </div>
            <datablau-pagination
              style="margin-top: 10px; text-align: right"
              @size-change="handleSizeChangeScript"
              @current-change="handleCurrentChangeScript"
              :current-page="currentPageScript"
              :page-sizes="[20, 50, 100]"
              :page-size="sizeScript"
              :total="totalScript"
              :layout="'total, sizes, prev, pager, next, jumper'"
            ></datablau-pagination>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane
        :label="
          $t('meta.lineageManage.lineageCatalogue.detailScan.lineageFile')
        "
        name="fifth"
        style="
          position: absolute;
          top: 0px;
          left: -20px;
          right: -20px;
          bottom: 0;
        "
      >
        <lineage-tab
          v-if="showLineageTab"
          key="list"
          ref="lineageTab"
          :catalogueScan="true"
          :folderId="uploadTabfolderId"
          :folder-name="uploadTabFolderName"
          @openUploadTab="addUploadTab"
        ></lineage-tab>
      </el-tab-pane>
      <el-tab-pane
        v-if="$auth['BASE_TASK_SCHEDULER_MANAGE']"
        :label="
          $t('meta.lineageManage.lineageCatalogue.detailScan.confBatchTask')
        "
        name="sixth"
        style="position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0"
      >
        <div v-if="showSystemSetting">
          <job-detail
            :isAddJob="isAddJob"
            :lineageTab="true"
            :lineageId="this.scanData.folderDto.folderId"
            :raw-data="loadLineageJobData"
            jobApp="metadata"
            jobType="元数据-载入血缘文件任务"
            @getTreeRef="getTreeRef"
          ></job-detail>
        </div>

        <!-- :job="loadLineageJobData" -->
      </el-tab-pane>
    </datablau-tabs>
    <datablau-dialog
      :visible.sync="scriptDetailVisible"
      :title="$t('meta.lineageManage.lineageCatalogue.detailScan.scanScript')"
      width="540px"
      :height="'300px'"
      append-to-body
    >
      <el-form
        class="add-form"
        label-position="right"
        label-width="120px"
        ref="addForm"
      >
        <el-form-item
          :label="$t('meta.lineageManage.scriptManage.scriptName1')"
        >
          <span>{{ currentScript.scripName }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('meta.lineageManage.scriptManage.lineageFileType')"
          prop="lineageType"
        >
          <span>{{ currentScript.lineageType }}</span>
        </el-form-item>
        <el-form-item :label="$t('meta.lineageManage.scriptManage.scriptType')">
          <span>
            {{
              currentScript.scriptType === 'REGEX'
                ? $t('meta.lineageManage.scriptManage.regex')
                : 'javascript'
            }}
          </span>
        </el-form-item>
        <el-form-item
          :label="$t('meta.lineageManage.scriptManage.scriptContent')"
        >
          <span>{{ currentScript.content }}</span>
        </el-form-item>
        <el-form-item
          :label="$t('meta.lineageManage.scriptManage.description')"
        >
          <span>{{ currentScript.description }}</span>
        </el-form-item>
      </el-form>
    </datablau-dialog>
  </div>
</template>
<script>
import detailScan from './detailScan.js'
export default detailScan
</script>
<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';

.left-button {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  left: 20px;
  .check-info {
    width: 14px;
    height: 14px;
    display: inline-block;
    background: $primary-color;
    margin-right: -13px;
    vertical-align: middle;
  }
  .footer-row-info {
    height: 50px;
    margin-right: 10px;
    &:before {
      content: '\e6da';
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      margin-right: 5px;
      vertical-align: middle;
      line-height: 13px;
      color: white;
    }
  }
}
.catalogueDetail-scan {
  padding: 20px;
}
</style>
<style lang="scss">
.catalogueDetail-scan .el-tabs__content {
  position: absolute;
  top: 34px;
  left: 0px;
  right: 0px;
  bottom: 0;
}
.catalogueDetail-scan {
  .el-select .el-input__inner,
  .el-cascader .el-input__inner {
    height: 34px !important;
  }
}
</style>
