<template>
  <div class="report-ds">
    <div class="reportContent">
      <el-form
        class="page-form"
        label-position="right"
        label-width="130px"
        ref="form"
        :rules="rules"
        :model="importData"
      >
        <el-form-item
          :label="$t('meta.dataSource.edit.reName')"
          prop="displayName"
        >
          <datablau-input
            size="mini"
            v-model="importData.displayName"
            maxlength="50"
            clearable
            :placeholder="$t('meta.dataSource.edit.fillReName')"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('meta.dataSource.edit.reportType')"
          prop="type"
        >
          <datablau-select
            style="width: 300px"
            v-model="importData.type"
            :placeholder="$t('meta.dataSource.edit.selBIType')"
            clearable
            filterable
            :disabled="dsEditing"
            @change="handleTypeChange"
          >
            <el-option
              v-for="item in importTypeArr"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          :label="$t('meta.dataSource.edit.dbs')"
          v-if="importType === 'FINE_REPORT'"
          prop="dbtype"
        >
          <el-select
            size="mini"
            v-model="importData.dbtype"
            :placeholder="$t('meta.report.selDbs')"
            @change="changeDbType"
            filterable
          >
            <el-option-group>
              <el-option
                v-for="item in dbTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item
          label="Dispatcher URI"
          prop="CM_URL"
          v-if="importType === 'COGNOS'"
        >
          <el-input
            v-model="importData.CM_URL"
            :placeholder="$t('meta.dataSource.edit.fillDispatcherURI')"
            clearable
            @change="handleCmchange"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="Gateway URI"
          prop="GATEWAY_URL"
          v-if="importType === 'COGNOS'"
        >
          <el-input
            v-model="importData.GATEWAY_URL"
            :placeholder="$t('meta.dataSource.edit.fillGatewayURI')"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('meta.dataSource.edit.server')" prop="host">
          <el-input
            v-model="importData.host"
            :placeholder="$t('meta.dataSource.edit.fillServer')"
            clearable
            auto-complete="off"
            :disabled="hostEditDisabld"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="版本"
          prop="version"
          v-if="importType === 'SMARTBI'"
        >
          <el-select
            v-model="importData.version"
            placeholder="请选择版本"
            clearable
            :disabled="dsEditing"
            @change="handleTypeChange"
          >
            <el-option
              v-for="item in versionList"
              :label="item"
              :value="item"
              :key="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('meta.dataSource.edit.port')" prop="port">
          <el-input
            v-model="importData.port"
            :placeholder="$t('meta.dataSource.edit.fillPort')"
            clearable
            auto-complete="off"
            :disabled="hostEditDisabld"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="连接串参数"
          v-if="importType === 'FINE_REPORT' && importData.dbtype === 'MYSQL'"
        >
          <el-input
            v-model="importData.parameter"
            placeholder="请填写连接串参数"
            clearable
            auto-complete="off"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('meta.dataSource.edit.username')" prop="user">
          <el-input
            v-model="importData.user"
            :placeholder="$t('meta.dataSource.edit.fillUsername')"
            clearable
            auto-complete="new-password"
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('meta.dataSource.edit.password')"
          prop="password"
        >
          <el-input
            v-model="importData.password"
            :placeholder="$t('meta.dataSource.edit.fillPassword')"
            clearable
            auto-complete="new-password"
            type="password"
          ></el-input>
          <datablau-button
            size="small"
            type="white-btn"
            class="test-btn"
            @click="testConnect"
            :disabled="btnDisable"
            v-if="importType !== 'COGNOS' && importType !== 'FINE_REPORT'"
          >
            {{ $t('meta.dataSource.edit.test') }}
          </datablau-button>
        </el-form-item>
        <el-form-item
          label="预处理脚本"
          v-if="importType === 'FINE_REPORT'"
          prop="scriptName"
        >
          <datablau-input
            ref="scriptInput"
            v-model="importData.scriptName"
            @focus="toSelectScript"
            placeholder="请选择脚本"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="执行默认脚本"
          v-if="importType === 'FINE_REPORT'"
          prop="runDefaultScript"
        >
          <el-radio-group v-model="importData.runDefaultScript">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          :label="$t('meta.dataSource.edit.dbs')"
          prop="schema"
          v-if="importType === 'FINE_REPORT' && importData.dbtype === 'MYSQL'"
        >
          <el-input
            v-model="importData.schema"
            :placeholder="dbplaceHolder"
            clearable
          ></el-input>
          <datablau-button
            size="small"
            type="white-btn"
            class="test-btn"
            @click="testConnect"
            :disabled="btnDisable || !isFineReport"
          >
            {{ $t('meta.dataSource.edit.test') }}
          </datablau-button>
        </el-form-item>
        <el-form-item
          :label="$t('meta.dataSource.edit.collectMode')"
          v-if="importType === 'FINE_REPORT' && importData.dbtype === 'ORACLE'"
          prop="connectType"
        >
          <el-select
            size="mini"
            v-model="importData.connectType"
            @change="changeConnectType"
          >
            <el-option label="SID" value="SID"></el-option>
            <el-option label="Service Name" value="Service Name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="schema"
          v-if="importType === 'FINE_REPORT' && importData.dbtype === 'ORACLE'"
          prop="oracleSchema"
        >
          <el-input
            v-model="importData.oracleSchema"
            :placeholder="
              $t('meta.dataSource.edit.fillNames', { name: schema })
            "
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item
          label="schema"
          prop="realSchema"
          v-if="importType === 'FINE_REPORT' && importData.dbtype === 'ORACLE'"
        >
          <el-input
            v-model="importData.realSchema"
            placeholder="请输入schema"
            clearable
          ></el-input>
          <datablau-button
            size="small"
            type="white-btn"
            class="test-btn"
            @click="testConnect"
            :disabled="btnDisable || !isFineReport"
          >
            <!--          测试2&#45;&#45;{{ btnDisable }}&#45;&#45;{{ !isFineReport }}-->
            {{ $t('meta.dataSource.edit.test') }}
          </datablau-button>
        </el-form-item>
        <el-form-item
          :label="$t('meta.dataSource.edit.fineReportUrl')"
          prop="reportBaseUrl"
          v-if="importType === 'FINE_REPORT'"
        >
          <el-input
            v-model="importData.reportBaseUrl"
            placeholder="例：http://localhost:8075"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('meta.dataSource.edit.file')"
          v-if="importType === 'FINE_REPORT'"
          prop="fileId"
          style="padding-bottom: 20px"
        >
          <el-upload
            class="upload-demo"
            style="width: 368px"
            drag
            :accept="acceptTypes"
            :action="uploadaction"
            :file-list="fileList"
            :limit="1"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-remove="handleFileRemoved"
            :headers="$headers"
            :on-change="handleUploadChange"
            :on-exceed="
              () => {
                $message.info(this.$t('meta.dataSource.edit.oneFile'))
              }
            "
            :on-error="$showUploadFailure"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              {{ $t('meta.driveManage.dragOr') }}
              <em>{{ $t('meta.driveManage.click') }}</em>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item
          :label="$t('meta.dataSource.edit.nameSpace')"
          prop="NAMINGSPACE"
          v-if="importType === 'COGNOS'"
        >
          <el-input
            v-model="importData.NAMINGSPACE"
            :placeholder="$t('meta.dataSource.edit.fillNameSpace')"
            clearable
          ></el-input>
          <datablau-button
            type="white-btn"
            class="test-btn"
            @click="testConnect"
            :disabled="btnDisable"
          >
            {{ $t('meta.dataSource.edit.test') }}
          </datablau-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="confirm-box">
      <datablau-button
        size="small"
        style="margin-right: 10px"
        @click="removetab"
        type="secondary"
      >
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <div style="display: inline-block">
        <datablau-button
          size="small"
          type="important"
          @click="confirmPost"
          :disabled="!testSuccesd"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </div>
    <datablau-dialog
      title="选择脚本"
      width="1000px"
      height="600px"
      append-to-body
      :visible.sync="showScriptDialog"
    >
      <script-selector
        :single="true"
        @close="showScriptDialog = false"
        @confirm="confirmScripts"
      ></script-selector>
    </datablau-dialog>
  </div>
</template>

<script>
import js from './reportDs.js'
export default js
</script>
<style lang="scss" scoped>
.report-ds {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  .reportContent {
    position: absolute;
    top: 0;
    bottom: 60px;
    left: 0;
    right: 0;
    overflow: auto;
    .page-form {
      margin-top: 20px;
    }
  }
  .confirm-box {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    // text-align: right;
    border-top: 1px solid #e0e0e0;
    background-color: #fff;
    padding: 8px 20px 0;
    font-size: 0;
    height: 50px;

    &.with-bottom-line-shadow {
      box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    }
  }
  .test-btn {
    margin-left: 20px;
  }
}
</style>
