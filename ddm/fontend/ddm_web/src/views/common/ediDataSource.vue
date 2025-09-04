<template>
  <div class="addDataSource tab-page edit-ds" v-loading="loadingDS">
    <div
      class="container"
      :style="{
        top: appName !== 'DDD' ? '0px' : '-40px',
      }"
    >
      <div class="form-container">
        <datablau-form
          class="page-form"
          label-position="right"
          label-width="130px"
          size="small"
          :model="dsform"
          :max-height="tableHeight"
          style="overflow: hidden"
          :key="formKey"
          ref="form"
        >
          <!--<el-form-item
            :label="$t('meta.dataSource.edit.modelType')"
            :rules="{ required: true }"
            test-name="add_datasource_model_type"
          >
            <el-radio
              :disabled="dsEditing"
              v-model="dataSourceType"
              :label="item.type"
              v-for="item in dsTypeArr"
              :key="item.type"
              @change="handleDataSourceTypeChange"
            >
              {{ item.name }}
            </el-radio>
          </el-form-item>-->
          <div
            class="database-info-container"
            v-if="dataSourceType !== 'report'"
          >
            <!-- 数据库 -->
            <el-form-item
              v-if="!isAgent"
              :label="$t('meta.dataSource.edit.dbs')"
              required
              test-name="add_datasource_dbs"
            >
              <datablau-select
                style="display: inline-block"
                size="mini"
                v-model="typeSelectWraper"
                :placeholder="$t('meta.dataSource.edit.selModelType')"
                @change="dbTypeWrapSelected"
                :disabled="(isFileData && dsEditing) || driverTypeDisabled"
                filterable
              >
                <el-option-group
                  v-for="group in modelFilters"
                  :key="group.type"
                  label="关系型物理模型">
                  <el-option
                    v-for="item in group.dataSourceTypeList"
                    :value="item.second"
                    :label="item.text2 || item.text"
                    :key="item.second"
                  >
                    <database-type :key="item.second" :value="item.second"></database-type>
                  </el-option>
                </el-option-group>
                <!--<el-option-group>
                  <el-option
                    v-for="item in sqlDbTypesWithOffline"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                    <database-type :key="item.value" :value="item.value"
                                   :size="24"></database-type>
                  </el-option>
                </el-option-group>
                <el-option-group>
                  <el-option
                    v-for="item in noSqlDbTypeArr"
                    :label="item.label"
                    :value="item.value"
                    :key="item.value"
                  >
                    <database-type :key="item.value" :value="item.value"
                                   :size="24"></database-type>
                  </el-option>
                </el-option-group>-->
              </datablau-select>
              <!--<datablau-tooltip
                v-if="dataSourceType !== 'file'"
                placement="right"
                :content="dbsVersion"
              >
                <i class="iconfont icon-tips"></i>
              </datablau-tooltip>-->
              <datablau-checkbox :checkboxType="'single'"
                style="margin-left: 10px;display: inline-block;"
                v-if="
                  customConnectionState && typeSelectWraper !== 'CUSTOMIZED'
                "
                v-model="customConnection"
              >
                {{ $t('meta.dataSource.edit.customStr') }}
              </datablau-checkbox>
              <el-upload
                :action="uploadDriUrl"
                :beforeUpload="uploadHandle"
                :on-success="onRefDocSuce"
                :on-error="onRefDocErr"
                :show-file-list="false"
                class="upload-wraper"
                v-if="useCustomedDbTye && typeSelectWraper !== 'CUSTOMIZED'"
                accept=".jar"
                :headers="$headers"
              >
                <datablau-button
                  size="small"
                  icon="el-icon-upload2"
                  class="upload-btn"
                >
                  {{ $t('meta.dataSource.edit.upload') }}
                </datablau-button>
              </el-upload>
            </el-form-item>
            <el-form-item
              :label="$t('meta.dataSource.edit.driver')"
              v-if="!isAgent && driverState"
              required
            >
              <datablau-select
                :disabled="driverTypeDisabled"
                v-model="driverValue"
                :placeholder="$t('meta.common.pleaseSelect')"
              >
                <el-option
                  v-for="item in driverOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <div
              class="form-line top-line"
              :class="{ 'show-line': useOfflineDs }"
            >
              <div class="out-line"></div>
              <el-form-item
                :label="$t('meta.dataSource.edit.saveDbsType')"
                v-if="useOfflineDs && typeSelectWraper !== 'OFFLINEDUMP_RAW'"
                :required="true"
              >
                <datablau-select
                  size="mini"
                  v-model="dsform.dbtype"
                  :placeholder="$t('meta.dataSource.edit.selModelType')"
                  @change="dbTypeSelected"
                  :disabled="dsEditing"
                  filterable
                >
                  <el-option-group :label="$t('meta.dataSource.edit.relDbs')">
                    <el-option label="Oracle" value="ORACLE"></el-option>
                    <el-option label="MySQL" value="MYSQL"></el-option>
                  </el-option-group>
                </datablau-select>
                <!-- <el-checkbox  v-model="useOfflineDs" @change="handleUseOfflineChange">使用离线数据源</el-checkbox> -->
              </el-form-item>
              <!--
              <el-form-item
                :label="$t('meta.dataSource.edit.conType')"
                v-if="false && isDBServer()"
              >
                <el-select
                  size="mini"
                  :placeholder="$t('meta.dataSource.edit.selConType')"
                  v-model="dsform.connectType"
                  :disabled="true"
                  @change="connectTypeChange"
                >
                  <el-option label="JDBC" value="JDBC" selected></el-option>
                  <el-option label="JNDI" value="WebLogic"></el-option>
                </el-select>
              </el-form-item>
              -->
              <!--              <el-form-item
                :label="$t('meta.dataSource.edit.JNDIName')"
                v-if="dsform.connectType == 'WebLogic'"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.JNDIName"
                  :disabled="dsEditing"
                ></datablau-input>
              </el-form-item>-->
              <el-form-item
                :label="$t('meta.dataSource.edit.JARName')"
                v-if="useCustomedDbTye && typeSelectWraper !== 'CUSTOMIZED'"
                :required="true"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.jarName"
                  :disabled="dsEditing"
                  :placeholder="$t('meta.dataSource.edit.fillJARName')"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.driverName')"
                v-if="useCustomedDbTye && typeSelectWraper !== 'CUSTOMIZED'"
                :required="true"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.driverClassname"
                  :disabled="dsEditing"
                  :placeholder="$t('meta.dataSource.edit.fillDriverName')"
                ></datablau-input>
              </el-form-item>
              <!--连接串-->
              <el-form-item
                :label="$t('meta.dataSource.conString')"
                v-if="useCustomedDbTye || customConnection"
                :required="true"
              >
                <datablau-input
                  style="width: 500px;"
                  type="textarea"
                  v-model="dsform.connUrl"
                  :placeholder="$t('meta.dataSource.fillConString')"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="hostNameLabel"
                v-if="!isAgent && showServerName"
                :rules="{ required: true }"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.hostname"
                  test-name="server_name"
                ></datablau-input>
                <datablau-tooltip
                  v-if="dsform.dbtype === 'HBASE'"
                  :content="$t('meta.dataSource.edit.fillMultipleServer')"
                >
                  <i class="iconfont icon-tips"></i>
                </datablau-tooltip>
              </el-form-item>
              <el-form-item
                :label="portText"
                v-show="!isAgent && showInputDbPort"
                :rules="{ required: requireDbport }"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.dbport"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.masterPort')"
                v-if="dsform.dbtype === 'HBASE'"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.HBaseMasterPort"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.regionserverPort')"
                v-if="dsform.dbtype === 'HBASE'"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.HBaseRegionserverPort"
                ></datablau-input>
              </el-form-item>
              <!--授权方式-->
              <el-form-item
                :label="$t('meta.dataSource.edit.authWay')"
                v-if="isDBServer()"
              >
                <datablau-select
                  style="width: 500px;"
                  size="mini"
                  :placeholder="$t('meta.dataSource.edit.selAuthWay')"
                  v-model="AuthenticationType"
                >
                  <el-option
                    :label="$t('meta.dataSource.edit.usernameOrPassword')"
                    :value="0"
                    selected
                  ></el-option>
                  <el-option label="Kerberos" :value="1"></el-option>
                </datablau-select>
                <datablau-tooltip
                  v-if="dsform.dbtype === 'ES'"
                  :content="$t('meta.dataSource.edit.noSupportTip')"
                >
                  <i class="iconfont icon-tips"></i>
                </datablau-tooltip>
              </el-form-item>
              <el-form-item
                v-if="dsform.dbtype === 'CSV'"
                :label="$t('meta.dataSource.edit.separator')"
              >
                <datablau-input
                  :placeholder="$t('meta.dataSource.edit.fillSeparator')"
                  v-model="dsform.delimiter"
                  maxlength="1"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                v-if="dsform.dbtype === 'CSV'"
                :label="$t('meta.dataSource.edit.firstLineIsColumnName')"
              >
                <datablau-switch
                  v-model="dsform.IsFirstRowColumnName"
                  inactive-value="f"
                  active-value="t"
                  :inactive-text="$t('meta.common.false')"
                  :active-text="$t('meta.common.true')"
                ></datablau-switch>
                <el-alert
                  title=""
                  :closable="false"
                  type="warning"
                  style="width: 360px"
                >
                  {{ $t('meta.dataSource.edit.utf8') }}
                </el-alert>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.file')"
                v-if="showFileUpload"
                :required="true"
              >
                <div
                  class="download-sample-file"
                  v-if="
                    dsform.dbtype == 'DATADICTIONARY' ||
                    dsform.dbtype == 'DATADICTIONARY_LOGICAL'
                  "
                >
                  <datablau-button
                    type="text"
                    class="download-btn"
                    @click="downloadSampleFile"
                  >
                    {{ $t('common.button.template') }}
                  </datablau-button>
                  <!--
                  <a href="resources/datadict/sample.xlsx">下载模版</a>
                  -->
                </div>
                <el-upload
                  v-if="!$isIE"
                  class="upload-demo"
                  style="width: 368px"
                  drag
                  :key="dsform.dbtype"
                  :file-list="fileUploadList"
                  :action="uploadHost"
                  :accept="acceptTypes"
                  :limit="1"
                  :before-upload="handleBeforeUpload"
                  :on-success="handleUploadSuccess"
                  :on-remove="handleFileRemoved"
                  :headers="$headers"
                  :on-change="handleUploadChange"
                  :on-exceed="
                    () => {
                      $message.info($t('meta.dataSource.edit.oneFile'))
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
                <form
                  :action="uploadHost"
                  v-else
                  method="post"
                  class="IE-upload"
                  enctype="multipart/form-data"
                  target="nm_iframe1"
                >
                  <input type="file" name="file" value="选择文件" />
                  <datablau-button size="mini">
                    <input
                      id="id_submit"
                      name="nm_submit"
                      type="submit"
                      @click="handleIEUpload"
                      value="添加"
                    />
                  </datablau-button>
                </form>
                <iframe
                  id="id_iframe"
                  name="nm_iframe1"
                  style="display: none"
                ></iframe>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.filePath')"
                v-if="dsform.dbtype === 'SMBSHAREFILE'"
                :required="true"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.sharePath"
                  clearable
                  :disabled="dsEditing"
                  class="pass-word"
                  :placeholder="$t('meta.dataSource.edit.fillFilePath')"
                ></datablau-input>
                <datablau-tooltip
                  :content="$t('meta.dataSource.edit.pathTemp')"
                  placement="bottom"
                >
                  <i class="iconfont icon-tips"></i>
                </datablau-tooltip>
                <el-checkbox
                  style="margin-left: 6px"
                  v-model="showSmbUserPw"
                  @change="handleUsePwChange"
                  v-if="!dsEditing"
                >
                  {{ $t('meta.dataSource.edit.useUserName') }}
                </el-checkbox>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.desc')"
                v-if="dsform.dbtype === 'SMBSHAREFILE'"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.description"
                  clearable
                  :disabled="false"
                  class="pass-word"
                  :placeholder="$t('meta.dataSource.edit.fillDesc')"
                ></datablau-input>
                <datablau-button
                  size="small"
                  type="secondary"
                  :disabled="testBtnDisabled"
                  @click="testDataSource"
                  v-if="!showSmbUserPw && !dsEditing"
                  class="test-btn"
                >
                  {{ $t('common.button.test') }}
                  <i class="el-icon-loading" v-if="disableTest"></i>
                </datablau-button>
              </el-form-item>
              <el-form-item
                :label="userLabel"
                v-if="dsform.dbtype === 'SMBSHAREFILE' && showSmbUserPw"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.username"
                  clearable
                  :disabled="false"
                  class="pass-word"
                  :placeholder="$t('meta.dataSource.edit.fillUsername1')"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="pwLabel"
                v-if="dsform.dbtype === 'SMBSHAREFILE' && showSmbUserPw"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.password"
                  clearable
                  :disabled="false"
                  class="pass-word"
                  type="password"
                  :placeholder="$t('meta.dataSource.edit.fillPassword1')"
                ></datablau-input>
                <datablau-button
                  size="small"
                  type="secondary"
                  :disabled="testBtnDisabled"
                  @click="testDataSource"
                  v-if="showSmbUserPw"
                  class="test-btn"
                >
                  {{ $t('common.button.test') }}
                  <i class="el-icon-loading" v-if="disableTest"></i>
                </datablau-button>
              </el-form-item>
              <el-form-item
                :label="userLabel"
                v-if="!isAgent && showUsernamePw"
                :rules="{ required: userPasswordRequ }"
              >
                <!-- 解决密码自动填充问题 勿删 -->
                <datablau-input style="display: none"></datablau-input>
                <!-- end -->
                <datablau-input
                  style="margin-right: 10px"
                  size="mini"
                  v-model="dsform.username"
                  clearable
                  :disabled="disabledUsernamePw"
                  class="pass-word"
                  :placeholder="$t('meta.common.pleaseInput')"
                  test-name="username"
                ></datablau-input>
                <el-checkbox
                  v-if="dsform.dbtype === 'ES'"
                  v-model="ESwithSsl"
                  @change="handleSslChange"
                >
                  {{ $t('meta.dataSource.edit.useSsl') }}
                </el-checkbox>
                <el-checkbox
                  v-if="dsEditing"
                  v-model="testPw"
                  :disabled="dsform.dbtype === 'HBASE'"
                >
                  {{ $t('meta.dataSource.edit.changePassword') }}
                </el-checkbox>
              </el-form-item>
              <el-form-item
                :label="pwLabel"
                v-if="!isAgent && showUsernamePw"
                :rules="{ required: userPasswordRequ }"
              >
                <datablau-input
                  size="mini"
                  type="password"
                  v-model="dsform.password"
                  clearable
                  :disabled="disabledUsernamePw"
                  class="user-name"
                  :placeholder="$t('meta.dataSource.edit.fillPassword1')"
                  test-name="password"
                ></datablau-input>
                <datablau-button
                  v-if="dsform.dbtype === 'OCEANBASE-ORACLE'"
                  size="small"
                  type="secondary"
                  @click="testDataSource"
                >
                  {{ $t('common.button.test') }}
                  <i class="el-icon-loading" v-if="disableTest"></i>
                </datablau-button>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.serverRule')"
                v-if="AuthenticationType == 1"
                :rules="{ required: dsform.dbtype !== 'HBASE' }"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.ServicePrincipal"
                  placeholder="Service Principal:Service/Hostname@REALM"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.userRule')"
                v-if="AuthenticationType == 1"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.UserPrincipal"
                  placeholder=""
                ></datablau-input>
              </el-form-item>
              <el-form-item label="Keytab路径" v-if="AuthenticationType == 1">
                <datablau-input
                  size="mini"
                  v-model="dsform.KeyTabPath"
                ></datablau-input>
              </el-form-item>
              <!-- zl -->
<!--              <el-form-item
                :label="$t('meta.dataSource.edit.keytab')"
                v-if="AuthenticationType == 1"
              >
                <el-upload
                  v-if="!$isIE"
                  class="upload-demo"
                  style="width: 368px"
                  drag
                  :file-list="keytabList"
                  :action="uploadKerberos"
                  :limit="1"
                  :before-upload="
                    file => {
                      return handleBeforeUpload(file, 'keytab')
                    }
                  "
                  :on-success="
                    (res, file) => {
                      return handleUploadSuccess(res, file, 'keytab')
                    }
                  "
                  :on-remove="
                    (res, file) => {
                      return handleFileRemoved(res, file, 'keytab')
                    }
                  "
                  :headers="$headers"
                  :on-change="
                    (file, fileList) => {
                      return handleUploadChange(file, fileList, 'keytab')
                    }
                  "
                  :on-exceed="
                    () => {
                      $message.info($t('meta.dataSource.edit.oneFile'))
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
                <form
                  :action="uploadKerberos"
                  v-else
                  method="post"
                  class="IE-upload"
                  enctype="multipart/form-data"
                  target="nm_iframe1"
                >
                  <input type="file" name="file" value="选择文件" />
                  <datablau-button size="mini">
                    <input
                      id="id_submit1"
                      name="nm_submit1"
                      type="submit"
                      @click="handleIEUpload"
                      value="添加"
                    />
                  </datablau-button>
                </form>
                <iframe
                  id="id_iframe1"
                  name="nm_iframe1"
                  style="display: none"
                ></iframe>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.krb5')"
                v-if="AuthenticationType == 1"
                :required="true"
              >
                <el-upload
                  v-if="!$isIE"
                  class="upload-demo"
                  style="width: 368px"
                  drag
                  :file-list="krb5List"
                  :action="uploadKerberos"
                  :limit="1"
                  :before-upload="
                    file => {
                      return handleBeforeUpload(file, 'krb5')
                    }
                  "
                  :on-success="
                    (res, file) => {
                      return handleUploadSuccess(res, file, 'krb5')
                    }
                  "
                  :on-remove="
                    (res, file) => {
                      return handleFileRemoved(res, file, 'krb5')
                    }
                  "
                  :headers="$headers"
                  :on-change="
                    (file, fileList) => {
                      return handleUploadChange(file, fileList, 'krb5')
                    }
                  "
                  :on-exceed="
                    () => {
                      $message.info($t('meta.dataSource.edit.oneFile'))
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
                <form
                  :action="uploadKerberos"
                  v-else
                  method="post"
                  class="IE-upload"
                  enctype="multipart/form-data"
                  target="nm_iframe1"
                >
                  <input type="file" name="file" value="选择文件" />
                  <datablau-button size="mini">
                    <input
                      id="id_submit2"
                      name="nm_submit2"
                      type="submit"
                      @click="handleIEUpload"
                      value="添加"
                    />
                  </datablau-button>
                </form>
                <iframe
                  id="id_iframe"
                  name="nm_iframe1"
                  style="display: none"
                ></iframe>
              </el-form-item>-->
              <!-- 连接模式 -->
              <el-form-item
                :label="$t('meta.dataSource.edit.collectMode')"
                v-show="isOracle() && dsform.connectType == 'JDBC'"
                :rules="{ required: true }"
              >
                <datablau-select
                  size="mini"
                  v-model="dsform.extraDbPara"
                  @change="changeConStyle"
                >
                  <el-option label="SID" value="SID"></el-option>
                  <el-option
                    label="Service Name"
                    value="Service Name"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.scansNum')"
                v-if="dsform.dbtype === 'HBASE'"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.ScanSize"
                  clearable
                  :placeholder="$t('meta.dataSource.edit.fillScansNum')"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.strUncode')"
                v-if="dsform.dbtype === 'HBASE'"
              >
                <datablau-select
                  size="mini"
                  v-model="dsform.Encoding"
                  allow-create
                  filterable
                  clearable
                  :placeholder="$t('meta.dataSource.edit.selStrUncode')"
                >
                  <el-option
                    v-for="item in [
                      'UTF-8',
                      'ASCII',
                      'GB2312',
                      'GBK',
                      'Unicode',
                    ]"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.targetType')"
                v-if="useCustomedDbTye"
              >
                <datablau-select
                  size="mini"
                  v-model="targetType"
                  :placeholder="$t('meta.common.pleaseSelect')"
                  :disabled="dsEditing"
                >
                  <el-option
                    v-for="item in [
                      {
                        label: $t('meta.dataSource.edit.dbs'),
                        value: 'database',
                      },
                      { label: 'schema', value: 'schema' },
                    ]"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </datablau-select>
              </el-form-item>
<!--              <el-form-item
                label="Server Instance"
                v-if="dsform.dbtype === 'INFORMIX'"
                :rules="{ required: true }"
              >
                <datablau-input
                  size="mini"
                  v-model="InstanceName"
                  placeholder="请输入Server Instance"
                ></datablau-input>
              </el-form-item>-->
<!--              <el-form-item label="">
                <el-checkbox
                  v-if="typeSelectWraper === 'GBASE'"
                  v-model="isMPP"
                  :disabled="dsEditing"
                >
                  指定VC登录
                </el-checkbox>
              </el-form-item>
              <el-form-item
                label="VC 名称"
                v-if="dsform.dbtype === 'GBASE' && isMPP"
                :rules="{ required: true }"
              >
                <datablau-input
                  size="mini"
                  v-model="GBaseMppVcName"
                  placeholder="请输入"
                  :disabled="dsEditing"
                ></datablau-input>
              </el-form-item>-->
              <!-- 数据库 -->
              <el-form-item
                :label="inputDBname"
                v-show="showDbName"
                :rules="{ required: dbNameRequ }"
              >
                <datablau-select
                  style="display: inline-block;"
                  v-if="onlyDatabase"
                  v-model="preDbnames"
                  :placeholder="dbplaceHolder"
                  :disabled="testBtnDisabled"
                  @change="handleDbnameChange"
                  test-name="data_base_name"
                  filterable
                >
                  <el-option
                    v-for="item in dataBaseNames"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </datablau-select>
                <el-autocomplete
                  style="width: 500px;"
                  ref="dbname"
                  size="mini"
                  v-model="dsform.dbname"
                  clearable
                  :placeholder="dbplaceHolder"
                  :disabled="testBtnDisabled"
                  v-else-if="
                    dsform.dbtype !== 'ORACLE' &&
                    dsform.dbtype !== 'DB2LUW' &&
                    dsform.dbtype !== 'INFORMIX' &&
                    dsform.dbtype !== 'MAXCOMPUTE'
                  "
                  :fetch-suggestions="
                    (queryString, cb) => {
                      cb(
                        $getSuggettionInputValue(
                          queryString,
                          cb,
                          dataBaseNames,
                          null,
                          { showAllOptions: showAllDbname }
                        )
                      )
                    }
                  "
                  @change="changeDBName"
                  @select="handleDbnameChange"
                  @clear="changeDBName"
                  @click.native="handleDbnameClick"
                ></el-autocomplete>
                <datablau-input
                  size="mini"
                  :disabled="testBtnDisabled"
                  v-model="dsform.dbname"
                  :placeholder="dbplaceHolder"
                  v-else
                ></datablau-input>
                <datablau-button
                  size="small"
                  type="secondary"
                  :disabled="testBtnDisabled"
                  @click="testDataSource"
                  style="margin-left: 10px"
                  test-name="test_btn"
                >
                  {{ $t('common.button.test') }}
                  <i class="el-icon-loading" v-if="disableTest"></i>
                </datablau-button>
                <datablau-tooltip
                  v-if="isDB2 && !dsform.dbname"
                  :content="$t('meta.dataSource.edit.fillDbs')"
                >
                  <i class="iconfont icon-tips"></i>
                </datablau-tooltip>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.KeyStorePath')"
                v-if="dsform.dbtype === 'ES' && ESwithSsl"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.KeyStorePath"
                ></datablau-input>
              </el-form-item>
              <el-form-item
                :label="$t('meta.dataSource.edit.KeyStorePassword')"
                v-if="dsform.dbtype === 'ES' && ESwithSsl"
              >
                <datablau-input
                  size="mini"
                  v-model="dsform.KeyStorePass"
                ></datablau-input>
              </el-form-item>
              <!-- schema -->
              <el-form-item
                :label="schemaText"
                v-if="hasSchema"
                :rules="{ required: dbNameRequ }"
              >
                <datablau-select
                  size="mini"
                  style="display: inline-block"
                  v-model="schemaSelected"
                  v-if="!useOfflineDs"
                  :placeholder="
                    $t('meta.dataSource.edit.sels', { name: schemaText })
                  "
                  :disabled="!dbConnected"
                  multiple
                  clearable
                  allow-create
                  filterable
                >
                  <el-option
                    v-for="val in schemas"
                    :label="val"
                    :key="val"
                    :value="val"
                  ></el-option>
                </datablau-select>
                <datablau-select
                  size="mini"
                  v-model="OfflineDumpTargetSchemaName"
                  v-else
                  :placeholder="
                    $t('meta.dataSource.edit.sels', { name: schemaText })
                  "
                  :disabled="!dbConnected || dsEditing"
                  clearable
                  allow-create
                  filterable
                  @change="offlineSchemaChange"
                >
                  <el-option
                    v-for="val in schemas"
                    :label="val"
                    :key="val"
                    :value="val"
                  ></el-option>
                </datablau-select>
                <datablau-button
                  size="small"
                  type="secondary"
                  :disabled="testBtnDisabled"
                  @click="testDataSource"
                  v-if="!showDbName && dsform.dbtype !== 'OCEANBASE-ORACLE'"
                  style="margin-left: 10px"
                >
                  {{ $t('common.button.test') }}
                  <i class="el-icon-loading" v-if="disableTest"></i>
                </datablau-button>
              </el-form-item>
            </div>
            <el-form-item
              :label="$t('meta.dataSource.edit.proDbtype')"
              v-if="typeSelectWraper === 'OFFLINEDUMP_RAW'"
              :required="true"
            >
              <datablau-select
                size="mini"
                v-model="dsform.OfflineDumpRealDBType"
                :placeholder="$t('meta.dataSource.edit.fillProDbtype')"
                clearable
                allow-create
                filterable
                :disabled="dsEditing"
                @change="handleDreverTypeChange"
              >
                <el-option
                  v-for="item in offlineDriverTypeArr"
                  :label="item.label"
                  :key="item.value"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('meta.dataSource.edit.prodb')"
              v-if="useOfflineDs"
              :required="testSuccessed"
            >
              <datablau-select
                size="mini"
                v-model="OfflineDumpTargetDBName"
                @change="offlineDbChange2"
                :placeholder="$t('meta.dataSource.edit.fillProDbtype')"
                clearable
                allow-create
                filterable
                :disabled="dsEditing"
                @clear="setValueNull"
              >
                <el-option
                  v-for="val in offlineInstancesArr"
                  :label="val"
                  :key="val"
                  :value="val"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <!-- 生产schema -->
            <el-form-item
              :label="$t('meta.dataSource.edit.proSchema')"
              v-if="useOfflineDs"
              :required="testSuccessed"
            >
              <!--  :disabled="dsEditing" -->
              <datablau-select
                size="mini"
                v-model="OfflineProSchema"
                :placeholder="$t('meta.dataSource.edit.fillProSchema')"
                clearable
                allow-create
                filterable
                multiple
              >
                <el-option
                  v-for="val in offlineSchemasArr"
                  :label="val"
                  :key="val"
                  :value="val"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('meta.dataSource.edit.owner')"
              v-show="dsform.owner"
            >
              <datablau-input
                v-model="dsform.owner"
                readonly
                style="margin-right: 10px"
              ></datablau-input>
              <datablau-button
                size="small"
                type="secondary"
                @click="selectProblemUser"
              >
                {{ $t('common.button.modify') }}
              </datablau-button>
            </el-form-item>
            <!--采集设置-->
            <!-- :disabled="dsEditing" -->
          </div>

          <!--添加报表-->
          <div class="database-info-container" v-else-if="!isAgent">
            <report-ds
              ref="reportDs"
              @createdJob="createdReportJob"
              @testSucceed="reportTest"
              :dsform="dsform"
              :isEdit="dsEditing"
            ></report-ds>
          </div>
        </datablau-form>
      </div>
    </div>
  </div>
</template>

<script>
'use strict'
import js from './ediDataSource.js'

export default js
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';

.tab-page {
  .container {
    // border-bottom: 1px solid #eee;
    //overflow: auto;

    .page-form {
      position: relative;
      top: 0;
      left: 0;
      .limitWidth .el-form-item__content {
        width: 620px;
      }
      textarea {
        width: 500px !important;
      }
      .contooltip {
        margin-right: 10px;
      }

      .disabled-with-border,
      .el-input__inner {
        border: 1px solid #dcdfe6;
        border-radius: 2px;
      }

      .user-name,
      .pass-word {
        &.is-disabled {
          .el-input__inner {
          }

          background-color: var(--table-hover-bgc);
          border-color: #e4e7ed;
          color: #c0c4cc;
          cursor: not-allowed;
          border-radius: 2px;
        }
      }

      .upload-wraper {
        display: inline-block;

        .upload-btn {
          background-color: $primary-color;
          color: #fff;
          margin-left: 10px;
        }
      }

      .form-line {
        position: relative;

        &.show-line {
          padding: 20px 20px 20px 0px;
          margin: 0px 0px 20px 0;
          display: inline-block;

          .out-line {
            position: absolute;
            top: 0;
            left: 20px;
            right: 0;
            bottom: 0;
            border: 1px solid #ddd;
          }
        }
      }
    }

    .more-set {
      // border: 1px solid red;
      border-top: none;
      width: 40%;
      min-width: 600px;
      padding-left: -30px;
    }

    .form-line.top-line {
      .el-form-item:last-child {
        margin-bottom: 18px;
      }

      &.show-line {
        .el-form-item:last-child {
          margin-bottom: 0px;
        }
      }
    }
  }

  .fakebutton {
    display: inline;
  }
}

.backupDatasourceDisabled {
  background-color: var(--table-hover-bgc);
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
  border-radius: 2px;
}

$back-line-height: 40px;
$bottom-line-height: 50px;
.edit-ds {
  .container {
    .breadcrumb-line {
      box-sizing: border-box;
      padding-top: 8px;
      position: absolute;
      left: 20px;
      top: 0;
      right: 20px;
      height: $back-line-height;

      border-bottom: 1px solid var(--border-color-lighter);
    }

    .form-container {
      padding: 20px 0 40px;

      .collect-item {
        margin-right: 20px;
      }

      /deep/ .datablau-input {
        display: inline-block;
      }
    }

    .confirm-box {
      border-top: 1px solid $border-color;
      background-color: #fff;
      padding: 8px 20px 0;
      font-size: 0;
      height: $bottom-line-height;

      &.with-bottom-line-shadow {
        box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
      }
    }

    .test-btn {
      margin-left: 10px;
    }
  }
}
</style>
