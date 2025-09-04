<template>
  <div class="boxLog">
    <div class="boxContent">
      <datablau-form :rules="rules" ref="migrationForm" :model="migrationForm" label-width="120px" >
        <datablau-detail-subtitle :themeBlack="true" title="任务基本信息" mt="14px"></datablau-detail-subtitle>
        <el-form-item label="任务名称" prop="name">
          <datablau-input :themeBlack="true" v-model.trim="migrationForm.name" placeholder="请输入任务名称（必填）" style="width:480px"></datablau-input>
        </el-form-item>
        <el-form-item label="运行方式" prop="" v-if="creationMode === 1">
          <datablau-radio
            v-model="runningState"
            @change="runningStateChange"
            :themeBlack="true"
          >
            <el-radio :label="true">立即运行</el-radio>
            <el-radio :label="false">暂不运行</el-radio>
          </datablau-radio>
        </el-form-item>
        <!-- <el-form-item label="运行标志">
          <datablau-radio v-model="migrationForm.flag">
            <el-radio label="YES">正常</el-radio>
            <el-radio label="NO">禁止执行</el-radio>
          </datablau-radio>
        </el-form-item> -->
        <el-form-item label="任务描述">
          <datablau-input
            v-model.trim="migrationForm.description"
            :themeBlack="true"
            placeholder="请输入描述"
            :rows="2"
            type="textarea"
            style="width :480px"></datablau-input>
        </el-form-item>
       <!-- <el-form-item label="任务优先级" prop="taskPriority">
          <datablau-select
            v-model.trim="migrationForm.taskPriority"
            placeholder="请选择"
            style="width :480px">
            <el-option
              v-for="(key, i) in taskList"
              :key="key.value"
              :label="key.label"
              :value="key.value"
            >
              <span>
                <i class="el-icon-top" :class="i<2 ? 'red' : 'yellow'" v-if="i < 3"></i>
                <i class="el-icon-bottom green" v-else></i>
                {{key.label}}
              </span>
            </el-option>
          </datablau-select>
        </el-form-item> -->
        <div class="clearBoth">
          <el-form-item label="Worker分组" prop="workerGroup" :inline="true" style="float: left">
            <datablau-select
              v-model.trim="migrationForm.workerGroup"
              placeholder="请选择"
              @change="workGroupChange"
              :themeBlack="true"
              style="width :185px">
              <el-option
                v-for="(key) in groupList"
                :key="key"
                :label="key"
                :value="key"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item label="环境名称" prop="environmentCode" :inline="true" style="float: left">
            <datablau-select
              v-model.trim="migrationForm.environmentCode"
              placeholder="请选择"
              :disabled="!migrationForm.workerGroup"
              :themeBlack="true"
              style="width:185px">
              <el-option
                v-for="(key) in codeMap"
                :key="key.id"
                :label="key.name"
                :value="key.id"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
        </div>
        <el-form-item label="源数据库路径" v-if="migrationForm.fromDBType === 'HIVE'" prop="hivePath">
          <datablau-input
            v-model.trim="migrationForm.hivePath"
            placeholder="例：/user/hive/warehouse/mytable01/"
            :themeBlack="true"
            style="width :480px"></datablau-input>
        </el-form-item>
        <el-form-item label="源hdfs连接信息" v-if="migrationForm.fromDBType === 'HIVE'" prop="sourceHdfsPath">
          <datablau-input
            v-model.trim="migrationForm.sourceHdfsPath"
            placeholder="例：hdfs://xxx:port"
            :themeBlack="true"
            style="width :480px"></datablau-input>
        </el-form-item>
        <el-form-item label="源表分隔符" v-if="migrationForm.fromDBType === 'HIVE'" prop="spliter">
          <datablau-input
            v-model.trim="migrationForm.spliter"
            placeholder=""
            :themeBlack="true"
            style="width :480px"></datablau-input>
        </el-form-item>
        <el-form-item label="FE节点地址" v-if="migrationForm.fromDBType === 'STARROCKS'" prop="loadUrlValue">
          <datablau-input
            v-model.trim="migrationForm.loadUrlValue"
            placeholder="以 ; 分割"
            :themeBlack="true"
            style="width :480px"></datablau-input>
        </el-form-item>
        <el-form-item label="目标数据库路径" v-if="migrationForm.toDBType === 'HIVE'" prop="targetHivePath">
          <datablau-input
            v-model.trim="migrationForm.targetHivePath"
            placeholder="例：/user/hive/warehouse/mytable01/"
            :themeBlack="true"
            style="width :480px"></datablau-input>
        </el-form-item>
        <el-form-item label="目标hdfs连接信息" v-if="migrationForm.toDBType === 'HIVE'" prop="targetHdfsPath">
          <datablau-input
            v-model.trim="migrationForm.targetHdfsPath"
            placeholder="例：hdfs://xxx:port"
            :themeBlack="true"
            style="width :480px"></datablau-input>
        </el-form-item>
        <!-- <el-form-item label="目标表分隔符" v-if="migrationForm.toDBType === 'HIVE'" prop="targetSpliter">
          <datablau-input
            v-model.trim="migrationForm.targetSpliter"
            placeholder=""
            style="width :480px"></datablau-input>
        </el-form-item> -->
        <!--  <div class="clearBoth">
          <el-form-item label="任务组名称" prop="taskGroupId" :inline="true" style="float: left">
            <datablau-select
              v-model.trim="migrationForm.taskGroupId"
              placeholder="请选择"
              style="width :185px">
              <el-option
                v-for="(key) in groupNameList"
                :key="key.id"
                :label="key.name"
                :value="key.id"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item label="组内优先级" prop="taskGroupPriority" :inline="true" style="width:240px;float: left">
            <el-input-number :disabled="!migrationForm.taskGroupId" v-model="migrationForm.taskGroupPriority" controls-position="right" :min="1" size="small" ></el-input-number>
          </el-form-item>
        </div>
        <div class="clearBoth">
          <el-form-item label="失败重试次数(次)" prop="failRetryTimes" :inline="true" style="width:295px;float: left">
            <el-input-number v-model="migrationForm.failRetryTimes" size="small" controls-position="right" :min="0" ></el-input-number>
          </el-form-item>
          <el-form-item label="失败重试间隔(分)" prop="failRetryInterval" :inline="true" style="width:295px;float: left">
            <el-input-number v-model="migrationForm.failRetryInterval" controls-position="right" :min="0" size="small" ></el-input-number>
          </el-form-item>
        </div>
        <div class="clearBoth">
          <el-form-item label="CPU配额(%)" prop="cpuQuota" :inline="true" style="width:295px;float: left">
            <el-input-number v-model="migrationForm.cpuQuota" controls-position="right" :min="-1" size="small" ></el-input-number>
          </el-form-item>
          <el-form-item label="最大内存(MB)" prop="memoryMax" :inline="true" style="width:295px;float: left">
            <el-input-number v-model="migrationForm.memoryMax" controls-position="right" :min="-1" size="small" ></el-input-number>
          </el-form-item>
        </div>
        <el-form-item label="延时执行时间(分)" prop="delayTime"  style="width:295px">
          <el-input-number v-model="migrationForm.delayTime" controls-position="right" :min="0" size="small" >
            <span>分</span>
          </el-input-number>
        </el-form-item>
        <el-form-item label="超时告警" prop="timeoutFlag">
          <datablau-switch
            v-model="migrationForm.timeoutFlag"
            active-value="OPEN"
            inactive-value="CLOSE"
          ></datablau-switch>
        </el-form-item>
        <div class="clearBoth" v-if="migrationForm.timeoutFlag == 'OPEN'">
          <el-form-item label="超时策略" prop="oldTimeoutNotifyStrategy" style="width: 295px;float:left">
            <datablau-checkbox v-model="migrationForm.oldTimeoutNotifyStrategy" @change="timeoutTip">
              <el-checkbox label="WARN">超时告警</el-checkbox>
              <el-checkbox label="FAILED">超时失败</el-checkbox>
            </datablau-checkbox>
            <span v-if="timeoutFlag" class="timeoutFlag">超时策略必须选一个</span>
          </el-form-item>
          <el-form-item label="超时时长(分)" prop="timeout" style="width:295px;float:left">
            <el-input-number v-model="migrationForm.timeout" controls-position="right" :min="1" size="small" ></el-input-number>
          </el-form-item>
        </div>
        <el-form-item label="自定义模板" prop="taskParams.customConfig">
          <datablau-switch
            v-model="migrationForm.taskParams.customConfig"
            active-value="1"
            inactive-value="0"
          ></datablau-switch>
        </el-form-item>
        <div class="clearBoth" v-if="migrationForm.taskParams.customConfig == '0'">
          <el-form-item label="数据源类型" prop="taskParams.dsType" :inline="true" style="float: left" >
            <datablau-select
              v-model.trim="migrationForm.taskParams.dsType"
              placeholder="请选择"
              style="width :185px"
              :disabled="true"
              @change="getDatasourceType('dsType', 'dataSourceList')"
            >
              <el-option
                v-for="(key) in dsTypeList"
                :key="key.value"
                :label="key.label"
                :value="key.value"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item label="数据源实例" prop="taskParams.dataSource" :inline="true" style="float: left">
            <datablau-select
              v-model.trim="migrationForm.taskParams.dataSource"
              placeholder="请选择"
              :disabled="true"
              style="width :185px">
              <el-option
                v-for="(key, i) in dataSourceList"
                :key="i + key.dsDsId"
                :label="key.dsDsName"
                :value="key.dsDsId"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
        </div>
        <el-form-item label="sql语句" prop="taskParams.sql" style="width: 650px">
          <monaco
            ref="editor"
            :opts="sqlMonacoOpts"
            @change="changeValue( 'sql', ...arguments)"
            :isDiff="false"
            style="height: 300px"
          ></monaco>
        </el-form-item>
        <el-form-item label="JSON" prop="taskParams.json"  style="width: 650px" v-if="migrationForm.taskParams.customConfig == '1'">
          <monaco
            ref="editors"
            :opts="monacoOpts"
            @change="changeValue( 'json', ...arguments)"
            :isDiff="false"
            style="height: 300px"
          ></monaco>
        </el-form-item>
        <el-form-item label="资源" prop="taskParams.oldresourceList" v-if="migrationForm.taskParams.customConfig == '1'">
          <datablau-cascader
            :options="resourceListList"
            :props="props"
            v-model="migrationForm.taskParams.oldresourceList"
            clearable
            style="width :480px"
          ></datablau-cascader>
        </el-form-item>
        <div v-if="migrationForm.taskParams.customConfig == '0'">
          <div class="clearBoth">
            <el-form-item label="数据源类型" prop="taskParams.dtType"  style="float: left">
              <datablau-select
                v-model.trim="migrationForm.taskParams.dtType"
                placeholder="请选择"
                :disabled="true"
                @change="getDatasourceType('dtType', 'dataTargetList')"
                style="width :130px">
                <el-option
                  v-for="(key) in dsTypeList"
                  :key="key.value"
                  :label="key.label"
                  :value="key.value"
                >
                </el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="数据源实例" prop="taskParams.dataTarget" label-width="80px"  style="float:left;margin-left: 10px">
              <datablau-select
                v-model.trim="migrationForm.taskParams.dataTarget"
                placeholder="请选择"
                :disabled="true"
                style="width :130px">
                <el-option
                  v-for="(key, i) in dataTargetList"
                  :key="i + key.dsDsId"
                  :label="key.dsDsName"
                  :value="key.dsDsId"
                >
                </el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="目标表" prop="taskParams.targetTable"  label-width="70px"  style="float: left">
              <datablau-input :disabled="true" v-model.trim="migrationForm.taskParams.targetTable" placeholder="请输入目标表名"  style="width :130px"></datablau-input>
            </el-form-item>
          </div>
          <el-form-item label="目标库前置SQL" prop="taskParams.preStatements">
            <div v-for="(v, i) in migrationForm.taskParams.preStatements"
            :key="v.value">
              <datablau-input
                v-model.trim="v.value" placeholder="请输入非查询SQL语句"
                style="width: 480px;margin-right: 10px"
              ></datablau-input>
              <datablau-button
              type="icon"
              class="iconfont icon-delete"
              @click="prepositionDel(i)"
              >
              </datablau-button>
            </div>

            <datablau-button
              type="normal"
              @click="prepositionSql"
              class="iconfont icon-tianjia"
            > 添加目标库前置SQL</datablau-button>

          </el-form-item>
          <el-form-item label="目标库后置SQL" prop="taskParams.postStatements">
            <div v-for="(v, i) in migrationForm.taskParams.postStatements"
                 :key="v.value">
              <datablau-input
                v-model.trim="v.value" placeholder="请输入非查询SQL语句"
                style="width: 480px;margin-right: 10px"
              ></datablau-input>
              <datablau-button
                type="icon"
                class="iconfont icon-delete"
                @click="postDel(i)"
              >
              </datablau-button>
            </div>
            <datablau-button
              type="normal"
              @click="postSql"
              class="iconfont icon-tianjia"
            > 添加目标库后置SQL</datablau-button>

          </el-form-item>
          <div class="clearBoth">
          <el-form-item label="限流(字节数)" prop="taskParams.jobSpeedByte"  style="float: left">
            <datablau-select
              v-model.trim="migrationForm.taskParams.jobSpeedByte"
              placeholder="请选择"
              style="width :185px">
              <el-option
                v-for="(key) in jobSpeedByteList"
                :key="key.value"
                :label="key.label"
                :value="key.value"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item label="限流(记录数)" prop="taskParams.jobSpeedRecord"  style="float: left">
            <datablau-select
              v-model.trim="migrationForm.taskParams.jobSpeedRecord"
              placeholder="请选择"
              style="width :185px">
              <el-option
                v-for="(key) in jobSpeedRecordList"
                :key="key.value"
                :label="key.label"
                :value="key.value"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
        </div>
        </div>
        <div class="clearBoth">
          <el-form-item label="最小内存" prop="taskParams.xms"  style="float: left">
            <datablau-select
              v-model.trim="migrationForm.taskParams.xms"
              placeholder="请选择"
              style="width :185px">
              <el-option
                v-for="(key) in xmsList"
                :key="key.value"
                :label="key.label"
                :value="key.value"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item label="最大内存" prop="taskParams.xmx"  style="float: left">
            <datablau-select
              v-model.trim="migrationForm.taskParams.xmx"
              placeholder="请选择"
              style="width :185px">
              <el-option
                v-for="(key) in xmsList"
                :key="key.value"
                :label="key.label"
                :value="key.value"
              >
              </el-option>
            </datablau-select>
          </el-form-item>
        </div>
        <el-form-item label="自定义参数" prop="taskParams.localParams">
          <div v-for="(v, i) in migrationForm.taskParams.localParams"
               :key="v.prop" class="localParamsBox">
            <datablau-input
              v-model.trim="v.prop" placeholder="prop(必填)"
              style="width: 200px;margin-right: 10px"
            ></datablau-input>
            <datablau-select
              v-model.trim="v.direct"
              placeholder="请选择"
              disabled
              style="width :130px">
              <el-option
                v-for="(key) in directList"
                :key="key.value"
                :label="key.label"
                :value="key.value"
              >
              </el-option>
            </datablau-select>
            <datablau-select
              v-model.trim="v.type"
              placeholder="请选择"
              disabled
              style="width :130px">
              <el-option
                v-for="(key) in typeList"
                :key="key.value"
                :label="key.label"
                :value="key.value"
              >
              </el-option>
            </datablau-select>
            <datablau-input
              v-model.trim="v.value" placeholder="value(必填)"
              style="width: 200px"
            ></datablau-input>
            <datablau-button
              type="icon"
              class="iconfont icon-delete delectBtn"
              @click="localParamsDel(i)"
            >
            </datablau-button>
          </div>
          <datablau-button
            type="normal"
            @click="localParamsAdd"
            class="iconfont icon-tianjia"
          > 添加自定义参数</datablau-button>

        </el-form-item>
        <el-form-item label="选择创建方式" required v-if="!modifyFlag">
          <datablau-radio v-model="creationMode" @change="creationModeChange">
            <el-radio :label="1">创建新工作流并运行</el-radio>
            <el-radio :label="2">添加到已有工作流</el-radio>
          </datablau-radio>
        </el-form-item>
        <el-form-item label="工作流名称" v-if="modifyFlag">
          {{workflowName}}
        </el-form-item> -->
      </datablau-form>
      <datablau-form v-if="creationMode === 1 " :rules="workflowRules" ref="workflowForm" :model="workflow" label-width="110px" >
        <datablau-detail-subtitle :themeBlack="true" title="工作流基本信息" mt="14px">
        </datablau-detail-subtitle>
        <!-- <el-form-item label="工作流名称" prop="name">
          <datablau-input v-model.trim="workflow.name" placeholder="请输入工作流名称（必填）" style="width:480px"></datablau-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <datablau-input v-model.trim="workflow.description" placeholder="请输入" type="textarea" style="width:480px"></datablau-input>
        </el-form-item> -->
        <el-form-item label="租户" prop="tenantCode">
          <datablau-select
            v-model.trim="workflow.tenantCode"
            placeholder="请选择"
            :themeBlack="true"
            style="width :480px">
            <el-option
              v-for="(key) in tenantCodeLists"
              :key="key.id"
              :label="key.tenantCode"
              :value="key.tenantCode"
            >
            </el-option>
          </datablau-select>
        </el-form-item>
        <!-- <el-form-item label="超时告警" prop="timeout">
          <datablau-switch
            v-model="workflow.timeout"
            active-value="1"
            inactive-value="0"
          ></datablau-switch>
        </el-form-item>
        <el-form-item label="执行策略" prop="">
          <datablau-select
            v-model.trim="workflow.executionType"
            placeholder="请选择"
            style="width :480px">
            <el-option
              v-for="(key) in executionTypeLists"
              :key="key.value"
              :label="key.label"
              :value="key.value"
            >
            </el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="全局变量" prop="globalParams">
          <div v-for="(item, i) in workflow.globalParams" :key="item.prop + i">
            <datablau-input  v-model="item.prop" placeholder="键" style="width: 235px;margin-right:10px"></datablau-input>
            <datablau-input v-model="item.value" placeholder="值" style="width: 235px;margin-right:10px"></datablau-input>
            <datablau-button
              type="icon"
              class="iconfont icon-delete delectBtn"
              @click="globalParamsDel(i)"
            >
            </datablau-button>
          </div>
          <datablau-button
            type="normal"
            @click="addGlobalParams"
            class="iconfont icon-tianjia"
          > 添加全局变量</datablau-button>
        </el-form-item> -->
      </datablau-form>

      <!-- <datablau-form v-if="creationMode === 2 && !modifyFlag" ref="projectCode" :model="projectCodeForm" label-width="110px" :rules="codeFormRules">
        <datablau-detail-subtitle title="选择工作流" mt="20px"></datablau-detail-subtitle>
        <el-form-item label="选择工作流"  prop="projectCode">
          <datablau-select
            v-model.trim="projectCodeForm.projectCode"
            placeholder="请选择"
            style="width :480px">
            <el-option
              v-for="(key) in projectCodeList"
              :key="key.code"
              :label="key.name"
              :value="key.code"
            >
            </el-option>
          </datablau-select>
        </el-form-item>
      </datablau-form> -->
    </div>
    <div class="transform-btn">
      <div class="nextStep">
        <datablau-button
          type="normal"
          :themeBlack="true"
          @click="prevBtn">上一步</datablau-button>
        <datablau-button
          type="important"
          :disabled="executionDisabled"
          :themeBlack="true"
          @click="execution">确 定</datablau-button>
          <span v-if="executionDisabled"><i   style="margin-left:10px;margin-right:10px"  class="iconfont icon-tips"></i>{{ tipsMsg }}</span>
      </div>
    </div>
  </div>
</template>

<script>
// import monaco from './monaco.vue'
import HTTP from '@/dataWarehouse/resource/http.js'
import { mapState } from 'vuex'
export default {
  // components: { monaco },

  props: {
    show: {
      type: Boolean,
      default: false
    },
    params: {
      type: Object,
      default: () => {}
    },
    codeTree: {
      type: Object,
      default: () => {}
    },
    migrationObj: {
      type: [Array, Object],
      default: () => {}
    },
    migrationId: {
      type: Number
    },
    gitPath: {
      type: [Array]
    }
  },
  computed: {
    modifyFlag () {
      return !!Object.keys(this.migrationObj).length
    }
  },
  watch: {
    params: {
      handler (val, oldVal) {
        if (!Object.keys(val).length) return
        // 数据源类型
        this.migrationForm.taskParams.dsType = this.params.dsDs.type
        this.migrationForm.taskParams.dataSource = this.params.dsDs.dsDsId
        // 数据源类型-目标表
        this.migrationForm.taskParams.dtType = this.params.dsDs2.type
        this.migrationForm.taskParams.dataTarget = this.params.dsDs2.dsDsId
        this.migrationForm.taskParams.targetTable = ''
        this.migrationForm.taskParams.sql = this.params.sql.join(';\n')
        this.migrationForm.dsDatabase = this.params.schemaName
        this.migrationForm.dtDatabase = this.params.schemaName2
        this.migrationForm.dsTable = this.params.tableName
        this.migrationForm.dtTable = this.params.tableName2
        this.migrationForm.isDeleted = this.params.clearTargetRecord
        this.migrationForm.isWholeTable = this.params.isWholeTable === false ? 0 : 1
        this.migrationForm.prefix = this.params.prefixValue
        this.migrationForm.suffix = this.params.suffixValue
        if (this.params.fromDBType === 'HIVE') {
          this.migrationForm.dsColumns = this.params.dsColumns
        } else {
          this.migrationForm.dsColumns = []
        }
        this.migrationForm.dtColumns = this.params.dtColumns
        this.migrationForm.defaultValues = this.params.defaultValues
        this.$set(this.migrationForm, 'fromDBType', this.params.fromDBType)
        this.$set(this.migrationForm, 'toDBType', this.params.toDBType)
        if (this.params.toDBType === 'HIVE') {
          this.migrationForm.targetSpliter = this.params.targetSpliter
        }
        this.$nextTick(() => {
          this.setValue('editor', this.params.sql)
        })
        this.getDatasourceType('dtType', 'dataTargetList')
        this.getDatasourceType('dsType', 'dataSourceList')
      },
      immediate: true,
      deep: true
    },
    migrationObj: {
      handler (value) {
        let val = value[0]
        // if (Object.keys(val).length) {
        if (val && JSON.stringify(val) !== '{}') {
          this.$nextTick(() => {
            this.migrationForm.name = val.fileName || ''
            this.migrationForm.flag = val.flag || 'YES'
            this.migrationForm.description = val.description || ''
            this.migrationForm.taskPriority = val.taskPriority || 'MEDIUM'
            this.migrationForm.workerGroup = val.workerGroup || ''
            this.migrationForm.environmentCode = val.environmentCode || ''
            this.migrationForm.taskGroupId = val.taskGroupId || ''
            this.migrationForm.taskGroupPriority = val.taskGroupPriority || ''
            this.migrationForm.failRetryTimes = val.failRetryTimes || 0
            this.migrationForm.failRetryInterval = val.failRetryInterval || 0
            this.migrationForm.cpuQuota = val.cpuQuota || -1
            this.migrationForm.memoryMax = val.memoryMax || -1
            this.migrationForm.taskType = 'DATAX'
            this.migrationForm.timeoutNotifyStrategy = val.timeoutNotifyStrategy || ''
            this.migrationForm.preTaskCode = val.preTaskCode || 0
            this.migrationForm.preTaskVersion = val.preTaskVersion || 0
            this.migrationForm.taskExecuteType = val.taskExecuteType || 'BATCH'
            this.migrationForm.delayTime = val.delayTime || 0
            this.migrationForm.timeoutFlag = val.timeoutFlag || 'CLOSE'
            this.migrationForm.oldTimeoutNotifyStrategy = val.oldTimeoutNotifyStrategy || ['WARN'] // 没返回
            this.migrationForm.timeout = val.timeout || 30
            this.migrationForm.taskParams = val.taskParams || this.migrationForm.taskParams
            this.workflowName = val.workflowName
            this.$set(this.migrationForm, 'fromDBType', val.pluginDto.dsType)
            this.$set(this.migrationForm, 'toDBType', val.pluginDto.dtType)
            if (val.pluginDto.dsType === 'HIVE') {
              this.migrationForm.hivePath = val.pluginDto.hivePath
              this.migrationForm.sourceHdfsPath = val.pluginDto.sourceHdfsPath
              this.migrationForm.spliter = val.pluginDto.spliter
            }
            if (val.pluginDto.dtType === 'HIVE') {
              this.migrationForm.targetHivePath = val.pluginDto.targetHivePath
              this.migrationForm.targetHdfsPath = val.pluginDto.targetHdfsPath
              // this.migrationForm.targetSpliter = val.pluginDto.targetSpliter
            }
            if (val.pluginDto.dsType === 'STARROCKS') {
              this.migrationForm.loadUrlValue = val.pluginDto.loadUrl.join(';')
            }
          })
        // }
        }
      },
      deep: true,
      immediate: true
    }
  },
  data () {
    return {
      workflowName: '',
      projectId: +this.$route.query.projectId,
      migrationForm: {
        flag: 'YES',
        taskPriority: 'MEDIUM',
        failRetryTimes: 0,
        failRetryInterval: 0,
        cpuQuota: -1,
        delayTime: 0,
        memoryMax: -1,
        description: '',
        environmentCode: '-1',
        taskType: 'DATAX',
        workerGroup: 'default',
        taskExecuteType: 'BATCH',
        name: '',
        taskParams: {
          preStatements: [],
          resourceList: [],
          oldresourceList: [],
          postStatements: [],
          customConfig: 0,
          dataSource: '',
          dataTarget: '',
          sql: '',
          json: '',
          targetTable: '',
          jobSpeedRecord: 1000,
          jobSpeedByte: 0,
          localParams: [],
          xms: '1',
          xmx: '1',
          dsType: 'MYSQL',
          dtType: 'MYSQL'
        },
        timeoutFlag: 'CLOSE',
        oldTimeoutNotifyStrategy: ['WARN'],
        timeoutNotifyStrategy: '',
        timeout: 30,
        preTaskCode: 0,
        preTaskVersion: 0
      },
      workflow: {
        tenantCode: '',
        executionType: 'SERIAL_WAIT',
        globalParams: [],
        description: '',
        timeout: 0
      },
      tenantCodeLists: [],
      executionTypeLists: [
        { value: 'PARALLEL', label: '并行' },
        { value: 'executionType', label: '执行策略' },
        { value: 'SERIAL_WAIT', label: '串行等待' },
        { value: 'SERIAL_DISCARD', label: '串行抛弃' },
        { value: 'SERIAL_PRIORITY', label: '串行优先' }
      ],
      taskList: [
        { value: 'HIGHEST', label: 'HIGHEST' },
        { value: 'HIGH', label: 'HIGH' },
        { value: 'MEDIUM', label: 'MEDIUM' },
        { value: 'LOW', label: 'LOW' },
        { value: 'LOWEST', label: 'LOWEST' }
      ],
      groupList: [],
      codeList: [],
      codeMap: [],
      groupNameList: [],
      dsTypeList: [
        { value: 'MYSQL', label: 'MYSQL' },
        { value: 'POSTGRESQL', label: 'POSTGRESQL' },
        { value: 'HIVE', label: 'HIVE' },
        { value: 'CLICKHOUSE', label: 'CLICKHOUSE' },
        { value: 'SQLSERVER', label: 'SQLSERVER' }
      ],
      dataSourceList: [],
      dtTypeList: [],
      dataTargetList: [],
      jobSpeedByteList: [
        { value: '0', label: '0(不限制)' },
        { value: '1', label: '1KB' },
        { value: '10', label: '10KB' },
        { value: '50', label: '50KB' },
        { value: '100', label: '100KB' },
        { value: '512', label: '512KB' }
      ],
      jobSpeedRecordList: [
        { value: '0', label: '0(不限制)' },
        { value: '500', label: '500' },
        { value: '1000', label: '1000' },
        { value: '1500', label: '1500' },
        { value: '2000', label: '2000' },
        { value: '2500', label: '2500' },
        { value: '3000', label: '3000' }
      ],
      xmsList: [
        { value: '1', label: '1G' },
        { value: '2', label: '2G' },
        { value: '3', label: '3G' },
        { value: '4', label: '4G' }
      ],
      directList: [
        { value: 'IN', label: 'IN' }
      ],
      typeList: [
        { value: 'VARCHAR', label: 'VARCHAR' }
      ],
      taskLists: [],
      resourceListList: [],
      props: {
        multiple: true,
        value: 'id',
        label: 'name',
        checkStrictly: true,
        emitPath: false,
        disabled: 'dirctory'
      },
      sqlMonacoOpts: {
        value: '',
        origin: '',
        readOnly: true,
        theme: 'vs-dark'
      },
      monacoOpts: {
        value: '',
        origin: '',
        readOnly: false,
        theme: 'vs-dark'
      },
      workflowRules: {
        name: [{
          required: true,
          trigger: 'blur',
          message: '节点名称为必填'
        }],
        tenantCode: [{
          required: true,
          trigger: 'blur',
          message: '租户为必填'
        }]
      },
      rules: {
        name: [{
          required: true,
          trigger: 'blur',
          message: '节点名称为必填'
        }],
        taskPriority: {
          required: true,
          trigger: 'blur',
          message: '任务优先级为必填'
        },
        workerGroup: {
          required: true,
          trigger: 'blur',
          message: 'Worker分组为必填'
        },
        hivePath: [{
          required: true,
          trigger: 'blur',
          message: '源数据库路径为必填'
        }],
        sourceHdfsPath: [{
          required: true,
          trigger: 'blur',
          message: '源hdfs连接信息为必填'
        }],
        spliter: [{
          required: true,
          trigger: 'blur',
          message: '源表分隔符为必填'
        }],
        loadUrlValue: [{
          required: true,
          trigger: 'blur',
          message: 'FE节点地址为必填'
        }],
        targetHivePath: [{
          required: true,
          trigger: 'blur',
          message: '目标数据库路径为必填'
        }],
        targetHdfsPath: [{
          required: true,
          trigger: 'blur',
          message: '目标hdfs连接信息为必填'
        }],
        targetSpliter: [{
          required: true,
          trigger: 'blur',
          message: '目标表分隔符为必填'
        }],
        'taskParams.dsType': {
          required: true,
          trigger: 'blur',
          message: '数据源类型为必填'
        },
        'taskParams.dataSource': {
          required: true,
          trigger: ['blur', 'change'],
          message: '数据源实例为必填'
        },
        'taskParams.sql': {
          required: true,
          trigger: 'blur',
          message: 'SQL语句为必填'
        },
        'taskParams.json': {
          required: true,
          trigger: 'blur',
          message: 'json为必填'
        },
        'taskParams.dtType': {
          required: true,
          trigger: 'blur',
          message: '数据源类型为必填'
        },
        'taskParams.dataTarget': {
          required: true,
          trigger: 'blur',
          message: '数据源实例为必填'
        },
        'taskParams.targetTable': {
          required: true,
          trigger: 'blur',
          message: '目标表为必填'
        }
      },
      timeoutFlag: false, // 超时策略是否最少有一个
      creationMode: 1,
      projectCodeList: [],
      projectCodeForm: {
        projectCode: ''
      },
      codeFormRules: {
        projectCode: {
          required: true,
          trigger: 'blur',
          message: '工作流为必填'
        }
      },
      executionDisabled: false,
      runningState: true,
      tipsMsg: ''
    }
  },
  methods: {
    runningStateChange () {

    },
    prepositionSql () {
      this.migrationForm.taskParams.preStatements.push({ value: '' })
    },
    postSql () {
      this.migrationForm.taskParams.postStatements.push({ value: '' })
    },
    prepositionDel (i) {
      this.migrationForm.taskParams.preStatements.splice(i, 1)
    },
    postDel (i) {
      this.migrationForm.taskParams.postStatements.splice(i, 1)
    },
    localParamsDel (i) {
      this.migrationForm.taskParams.localParams.splice(i, 1)
    },
    localParamsAdd () {
      this.migrationForm.taskParams.localParams.push({ 'prop': '', 'direct': 'IN', 'type': 'VARCHAR', 'value': '' })
    },
    addGlobalParams () {
      this.workflow.globalParams.push({ prop: '', value: '' })
    },
    globalParamsDel (i) {
      this.workflow.globalParams.splice(i, 1)
    },
    cancel () {
      this.$refs.migrationForm && this.$refs.migrationForm.clearValidate()
      this.$refs.workflowForm && this.$refs.workflowForm.clearValidate()
      this.$refs.migrationForm && this.$refs.migrationForm.resetFields()
      this.$refs.workflowForm && this.$refs.workflowForm.resetFields()
      this.setValue('editor', '')
      this.setValue('editors', '')
      this.$emit('cancel')
    },
    creationModeChange () {
      if (this.creationMode === 2) {
        HTTP.getProjectCodeList(this.projectId)
          .then(res => {
            this.projectCodeList = res.data
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    timeoutTip () {
      if (this.migrationForm.oldTimeoutNotifyStrategy.length === 0) {
        this.timeoutFlag = true
      } else {
        this.timeoutFlag = false
      }
    },
    setValue (editors, value) {
      setTimeout(() => {
        let editor = this.$refs[editors]?.monacoEditor
        editor?.setValue(value)
      }, 0)
    },
    dealWithParams () {
      if (this.migrationForm.timeoutFlag === 'CLOSE') {
        this.migrationForm.timeoutNotifyStrategy = ''
      } else {
        if (this.migrationForm.oldTimeoutNotifyStrategy.length === 2) {
          this.migrationForm.timeoutNotifyStrategy = 'WARNFAILED'
        } else {
          this.migrationForm.timeoutNotifyStrategy = this.migrationForm.oldTimeoutNotifyStrategy[0]
        }
      }
      // 处理资源的值
      if (this.migrationForm.taskParams.oldresourceList?.length) {
        let ary = []
        this.migrationForm.taskParams.oldresourceList.forEach(item => {
          ary.push({ id: item })
        })
        this.migrationForm.taskParams.resourceList = ary
      }
    },
    prevBtn () {
      this.$emit('prevBtn')
      this.$emit('backStep', '4')
    },
    execution () {
      let flag1 = true
      let flag2 = true
      this.dealWithParams()
      if (this.migrationForm.fromDBType === 'STARROCKS') {
        this.migrationForm.loadUrl = this.migrationForm.loadUrlValue.split(';').filter(v => v)
      }
      // if (this.migrationObj[0]?.id) {
      //   this.$refs.migrationForm?.validate((valid) => {
      //     flag1 = valid
      //   })
      //   this.$refs.workflowForm?.validate(valid => {
      //     flag2 = valid
      //   })
      //   let params = {
      //     dsDataxTaskDefinitionDto: [this.migrationForm],
      //     dsDataxTaskRelationDto: [
      //       {
      //         name: '',
      //         preTaskCode: 0,
      //         preTaskVersion: 0,
      //         postTaskVersion: 0,
      //         conditionType: 'NONE',
      //         conditionParams: {}
      //       }
      //     ],
      //     codeTreeNodeDto: {
      //       projectId: this.projectId,
      //       parentId: this.codeTree.currentParentId,
      //       type: 15,
      //       content: '',
      //       name: this.params.name,
      //       admin: this.$store.state.user.username,
      //       updater: this.$store.state.user.username,
      //       branch: this.codeTree.branchName || 'master',
      //       comment: this.params.comment
      //       // order: this.orderNum
      //     },
      //     conditionMap: this.params.conditionMap,
      //     ddl: this.params.ddlSql,
      //     fromModelId: this.params.dataSourceId,
      //     toModelId: this.params.dataSourceId2,
      //     tenantCode: this.workflow.tenantCode,
      //     name: this.params.name,
      //     type: this.params.type,
      //     rowLimit: this.params.rowLimit,
      //     isMultiplex: this.params.isMultiplex
      //   }
      //   this.executionDisabled = true
      //   this.tipsMsg = '正在更新请稍后...'
      //   if (flag1 && flag2 && !this.timeoutFlag) {
      //     this.$http.put(`${this.$dddUrl}/service/workflow/${this.projectId}/${this.migrationId}/update`, params)
      //       .then(res => {
      //         this.$datablauMessage.success('修改任务成功')
      //         this.executionDisabled = false

      //         this.$bus.$emit('interfaceSuccessEdit', this.migrationId)
      //         // 目录树刷新，数据迁移新增tab消失
      //         this.$parent.$parent.currentParentId = this.codeTree.currentParentId
      //         this.$parent.$parent.addMigration = false
      //         this.$parent.$parent.getFileTreeData()
      //         this.cancel()
      //       })
      //       .catch(e => {
      //         this.$showFailure(e)
      //       })
      //   }
      //   return
      // }
      // if (this.creationMode === 1) {
      //   this.$refs.migrationForm?.validate((valid) => {
      //     flag1 = valid
      //   })
      //   this.$refs.workflowForm?.validate(valid => {
      //     flag2 = valid
      //   })
      //   if (flag1 && flag2 && !this.timeoutFlag) {
      //     this.setNewBranch()
      //   }
      // } else {
      this.$refs.migrationForm?.validate((valid) => {
        flag1 = valid
      })
      this.$refs.workflowForm?.validate((valid) => {
        flag2 = valid
      })
      if (flag1 && flag2) {
        this.insertProject()
      }
      // }
    },
    insertProject () {
      let params = {
        dsDataxTaskDefinitionDto: [this.migrationForm],
        dsDataxTaskRelationDto: [
          {
            name: '',
            preTaskCode: 0,
            preTaskVersion: 0,
            postTaskVersion: 0,
            conditionType: 'NONE',
            conditionParams: {}
          }
        ],
        codeTreeNodeDto: {
          projectId: this.projectId,
          parentId: this.codeTree.currentParentId,
          type: 15,
          content: '',
          name: this.params.name,
          admin: this.$store.state.user.username,
          updater: this.$store.state.user.username,
          branch: this.codeTree.branchName || 'master',
          comment: this.params.comment,
          gitPath: this.gitPath.reverse().join('/') + '/' + this.params.name
          // order: this.orderNum
        },
        conditionMap: this.params.conditionMap,
        ddl: this.params.ddlSql,
        fromModelId: this.params.dataSourceId,
        toModelId: this.params.dataSourceId2,
        tenantCode: this.workflow.tenantCode,
        name: this.params.name,
        type: this.params.type,
        rowLimit: this.params.rowLimit,
        isMultiplex: this.params.isMultiplex,
        isIncrease: this.params.isIncrease
      }
      this.executionDisabled = true
      if (this.params.selectType === 2 && this.params.isWholeTable === false) {
        this.tipsMsg = '正在生成DDL请稍后...'
        let url = ''
        url = `${this.$dddUrl}/service/workflow/ddl/init`
        if (this.params.toDBType === 'HIVE') {
          this.params.generateDdlData[0].delimiter = this.params.targetSpliter
        }
        this.$http.post(url, this.params.generateDdlData)
          .then(res => {
            params.ddl = res.data
            this.tipsMsg = '正在创建请稍后...'
            let urlPath = ''
            if (this.modifyFlag) {
              urlPath = `${this.$dddUrl}/service/workflow/1/${this.projectId}/${this.projectCodeForm.projectCode}?isRun=${this.runningState}&isUpdate=true`
              params.codeTreeNodeDto.codeDetailId = this.migrationId
            } else {
              urlPath = `${this.$dddUrl}/service/workflow/1/${this.projectId}/${this.projectCodeForm.projectCode}?isRun=${this.runningState}`
            }
            this.$http.post(urlPath, params)
              .then(res => {
                this.$datablauMessage.success('新建任务成功')
                this.executionDisabled = false
                this.$bus.$emit('interfaceSuccess')
                // 目录树刷新，数据迁移新增tab消失
                this.$parent.$parent.currentParentId = this.codeTree.currentParentId
                this.$parent.$parent.addMigration = false
                this.$parent.$parent.getFileTreeData()
                this.cancel()
              })
              .catch(e => {
                this.executionDisabled = false
                this.$showFailure(e)
              })
          })
          .catch(e => {
            console.error(e)
            this.$showFailure(e)
          })
      } else {
        this.tipsMsg = '正在创建请稍后...'
        let urlPath = ''
        if (this.modifyFlag) {
          urlPath = `${this.$dddUrl}/service/workflow/1/${this.projectId}/${this.projectCodeForm.projectCode}?isRun=${this.runningState}&isUpdate=true`
          params.codeTreeNodeDto.codeDetailId = this.migrationId
        } else {
          urlPath = `${this.$dddUrl}/service/workflow/1/${this.projectId}/${this.projectCodeForm.projectCode}?isRun=${this.runningState}`
        }
        this.$http.post(urlPath, params)
          .then(res => {
            this.$datablauMessage.success('新建任务成功')
            this.executionDisabled = false
            this.$bus.$emit('interfaceSuccess')
            // 目录树刷新，数据迁移新增tab消失
            this.$parent.$parent.currentParentId = this.codeTree.currentParentId
            this.$parent.$parent.addMigration = false
            this.$parent.$parent.getFileTreeData()
            this.cancel()
          })
          .catch(e => {
            this.executionDisabled = false
            this.$showFailure(e)
          })
      }
    },
    // setNewBranch () {
    //   let params = {
    //     dsDataxTaskDefinitionDto: [this.migrationForm],
    //     dsDataxTaskRelationDto: [
    //       {
    //         name: '',
    //         preTaskCode: 0,
    //         preTaskVersion: 0,
    //         postTaskVersion: 0,
    //         conditionType: 'NONE',
    //         conditionParams: {}
    //       }
    //     ],
    //     codeTreeNodeDto: {
    //       projectId: this.projectId,
    //       parentId: this.codeTree.currentParentId,
    //       type: 15,
    //       content: '',
    //       name: this.codeTree.newFileName,
    //       admin: this.$store.state.user.username,
    //       updater: this.$store.state.user.username,
    //       branch: this.codeTree.branchName || 'master'
    //       // order: this.orderNum
    //     },
    //     ...this.workflow
    //   }
    //   this.$http.post(`${this.$dddUrl}/service/workflow/1/${this.projectId}`, params)
    //     .then(res => {
    //       this.$datablauMessage.success('新建工作流成功')
    //       this.$bus.$emit('interfaceSuccess')
    //       // 目录树刷新，数据迁移新增tab消失
    //       this.$parent.$parent.currentParentId = this.codeTree.currentParentId
    //       this.$parent.$parent.addMigration = false
    //       this.$parent.$parent.getFileTreeData()

    //       this.cancel()
    //     })
    //     .catch(e => {
    //       this.$showFailure(e)
    //     })
    // },
    changeValue (item, value) {
      this.migrationForm.taskParams[item] = value
    },
    getWorkerGroup () {
      HTTP.getWorkerGroup()
        .then(res => {
          this.groupList = res
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getEnvironment () {
      HTTP.getEnvironment()
        .then(res => {
          this.codeList = res
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTaskGroup () {
      this.projectId && HTTP.getTaskGroup(this.projectId)
        .then(res => {
          this.groupNameList = res
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getResources () {
      HTTP.getResources()
        .then(res => {
          this.resourceListList = res
          this.dataFilter(this.resourceListList)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    dataFilter (val) {
      val.forEach(item => {
        !item.children.length && (item.children = null)
        // item.disabled = item.dirctory
        if (item.children?.length) {
          this.dataFilter(item.children)
        }
      })
    },
    getDatasourceType (v, l) {
      let code = this.migrationForm.taskParams[v]
      HTTP.getDatasourceType(code)
        .then(res => {
          let data = res.filter(item => item.dsDsName)
          this[l] = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTenants () {
      HTTP.getTenants()
        .then(res => {
          this.tenantCodeLists = [...res]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    workGroupChange () {
      let worker = this.migrationForm.workerGroup
      this.codeMap = this.codeList.filter(item => item.workerGroups.indexOf(worker) !== -1)
      this.migrationForm.environmentCode = (this.codeMap.length && this.codeMap[0].id) || '-1'
    }
  },
  mounted () {
    // work分组
    this.getWorkerGroup()
    // 环境名称
    this.getEnvironment()
    this.getResources()
    this.getTaskGroup()
    this.getDatasourceType('dtType', 'dataTargetList')
    this.getDatasourceType('dsType', 'dataSourceList')
    this.getTenants()
  }
}
</script>

<style scoped lang='scss'>
/deep/.el-form.db-form .el-form-item__label{
  /*line-height: 20px;*/
  /*padding-bottom: 0;*/
}
.timeoutFlag{
  color: #F46565;
  position: absolute;
  top: 23px;
}
/deep/.el-form.db-form .datablau-input{
  width: 100%;
}
  i.red{
    color: #F46565;
  }
  i.yellow{
    color: #d89614;
  }
  i.green{
    color: #177ddc;
  }
  .clearBoth{
    &:after{
      content: '';
      clear: both;
      display: block;
    }
  }
  /deep/.el-input-number--small{
    width: 60%;
    text-align: left;
  }
  /deep/.el-input__inner:hover{
    border-color: #409EFF;
  }
  /deep/.el-input-number__decrease.is-disabled{
    color: #AFB1B4;
  }
  /deep/.el-input.is-disabled .el-input__inner{
    color: #999;
  }
  .localParamsBox{
    &:after{
      content: '';
      display: block;
      clear: both;
    }
    &>div{
      float: left;
      margin-right: 10px;
    }
    .delectBtn{
      position: relative;
      top: 8px;
    }
  }
  /deep/.el-cascader__tags .el-tag{
    background: #666;
    color: #BBBBBB;
  }
  /deep/.el-cascader__tags .el-tag .el-icon-close{
    color: #BBBBBB;
    background: transparent;
    position: relative;
    top: 1px;
    border: 0;
  }
  /deep/.el-cascader__tags .el-tag .el-icon-close:hover{
    color: #BBBBBB;
    background: transparent;
  }
.el-input-number.is-disabled /deep/.el-input-number__decrease, .el-input-number.is-disabled /deep/.el-input-number__increase{
  color: #AFB1B4;
  &:hover{
    color: #AFB1B4;
  }
}
  /deep/.el-input.is-disabled .el-input__inner{
    border-color: #666;
  }
  /deep/.el-input-number.is-controls-right .el-input-number__increase{
    border-left: 1px solid #666;
  }
  .boxLog{
    padding-left: 10px;
    // height: 100%;
    // position: relative;
    overflow: hidden;
  }
  .boxContent{
    /*width: 650px;*/
    padding-left: 20px;
    overflow: auto;
    position: absolute;
    top: 74px;
    left: 0;
    right: 0;
    bottom: 50px;
    /*height: 100%;*/
    /*margin-left: 20%;*/
    /*position: absolute;
    top: 0;
    bottom: 32px;*/

  }
  .dialog-footer{
    /*position: absolute;*/
    bottom: 0;
    left: 0;
    width: 100%;
  }
  /deep/.row-buttons{
    background: #333333!important;
  }
  .transform-btn{
  position: absolute;
  bottom: 0px;
  left: 0px;
  height: 50px;
  right: 0;
  box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    padding: 8px 20px;
    border-top: 1px solid #3D3D3D;
}
</style>
<style lang='scss'>
  .el-checkbox__input.is-checked .el-checkbox__inner::after{
    /*border: 1px solid #3C3F41;*/
    border-left: 0;
    border-top: 0;
  }
</style>
