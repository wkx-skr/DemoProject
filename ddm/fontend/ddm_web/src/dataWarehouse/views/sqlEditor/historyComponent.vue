<template>
  <div class="result-data" :class="{'dark-theme-result': theme === 'dark'}">
    <div class="top-line">
      <!--<div class="searchBox" style="">
        <datablau-form
          size="small"
          :inline="true"
          label-width="75px"
        >
          <el-form-item
            :label="'任务名称'"

          >
            <datablau-input style="width:100%" v-model="searchFrom.searchVal" clearable></datablau-input>
          </el-form-item>
          <el-form-item
            :label="'执行用户'"

          >
            <datablau-input style="width:100%" v-model="searchFrom.executorName" clearable
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="'状态'"

          >
            <datablau-select
              v-model="searchFrom.stateType"
              placeholder="请选择状态"
              filterable
              clearable
              style="width: 100%;"
            >
              <el-option
                v-for="(item, key) in stateTypeList"
                :key="key"
                :label="item"
                :value="key"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="'时间'"

          >
            <el-date-picker
              v-model="searchFrom.time"
              type="daterange"
              range-separator="至"
              clearable
              @change="timeChange"
              format="yyyy - MM - dd "
              value-format="yyyy-MM-dd"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <datablau-button type="important" @click="sqlStart" >查询</datablau-button>
          </el-form-item>
        </datablau-form>
      </div>-->
      <div class="hidden-btn">
        <datablau-button
          @click="hiddenLineageTab"
          size="small"
          type="icon"
          class="icon el-icon-minus"
        >
        </datablau-button>
      </div>
    </div>
    <div>

      <datablau-form-submit style="top:32px;background:#222;">
        <datablau-table
          :data="historyList"
          class="tableMOdelDetail"
          row-key="id"
          ref="loadTable"
          height="100%"
          :themeBlack="true"
        >
          <el-table-column
            prop="taskDefinitionVersion"
            label="历史版本"
            width="60px"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="name"
            label="任务名称"
            width="100px"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="executorName"
            label="执行用户"
            width="90px"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="taskType"
            label="节点类型"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="state"
            label="状态"
            show-overflow-tooltip>
              <template scope="{row}">
                <datablau-status
                  style="width: 150px"
                  :type="statusTypeList[row.state]"
                  :desc="stateTypeList[row.state]"
                ></datablau-status>
<!--                {{stateTypeList[row.state]}}-->
              </template>
          </el-table-column>
          <el-table-column
            prop="submitTime"
            label="提交时间"
            width="140px"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="startTime"
            label="开始时间"
            width="140px"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="endTime"
            label="结束时间"
            width="140px"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="duration"
            label="运行时间"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="retryTimes"
            label="重试次数"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="dryRun"
            label="空跑标识"
            show-overflow-tooltip>
            <template scope="{row}">
              {{row.dryRun === 1 ? 'YES' : 'NO'}}
            </template>
          </el-table-column>
          <el-table-column
            prop="host"
            label="主机"
            width="150px"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="host"
            fixed="right"
            label="操作"
            :width="fileType === 19|| fileType === 7? '450px' :'400px'"
            show-overflow-tooltip>
            <template scope="{row}">
              <datablau-button @click="stopLog(row)" type="text" size="small" :disabled="!row.host" v-if="fileType === 19">停止</datablau-button>
              <datablau-button @click="savepoint(row)" type="text" size="small" :disabled="!row.host" v-if="fileType === 19">保存点</datablau-button>
              <datablau-button @click="lookLog(row)" type="text" size="small" :disabled="!row.host">查看日志</datablau-button>
              <datablau-button @click="handleClick(row)" type="text" size="small">执行历史</datablau-button>
              <datablau-button @click="sqlContent(row)" type="text" size="small" v-if="!item.taskParam || item.taskParam.extension === '.sql'">脚本内容</datablau-button>
              <datablau-button @click="programContent(row)" type="text" size="small" v-else>程序内容</datablau-button>
              <datablau-button :disabled="jumpDisabled" @click="jumpUrl(row)" type="text" size="small" v-if="fileType === 7 || fileType === 19 ">任务详情</datablau-button>
            </template>
          </el-table-column>
        </datablau-table>
      </datablau-form-submit>
    </div>
    <datablau-dialog
      title="脚本内容"
      :visible.sync="tenantFlag"
      :modal-append-to-body="true"
      size="l"
      height="500px"
      :blackTheme="true"
    >
      <monaco
        v-if="tenantFlag"
        ref="editor"
        :opts="monacoOpts"
        :isDiff="false"
        class="monaco"
      ></monaco>
      <div slot="footer">
        <datablau-button :themeBlack="true" type="important" @click="tenantFlag=false" >确认</datablau-button>
        <datablau-button :themeBlack="true" @click="tenantFlag=false">取消</datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="程序内容"
      :visible.sync="program"
      :modal-append-to-body="true"
      size="m"
      height="300px"
      :blackTheme="true"
    >
      <div class="programBox">
        <div>
          <span>程序类型：</span>
          {{programParam.programType}}
        </div>
        <div>
          <span>主函数的Class：</span>
          {{programParam.mainClass}}
        </div>
        <div>
          <span>主程序包：</span>
          {{programParam.mainJar && programParam.mainJar.resourceName.substring(1)}}
        </div>
      </div>
      <div slot="footer">
        <datablau-button :themeBlack="true" type="important" @click="program=false" >确认</datablau-button>
        <datablau-button :themeBlack="true" @click="program=false">取消</datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import monaco from './monaco.vue'
import HTTP from '@/dataWarehouse/resource/http'
export default {
  data () {
    return {
      historyList: null,
      pageSize: 20,
      pageNo: 1,
      total: 0,
      searchFrom: {
        searchVal: '',
        executorName: '',
        stateType: '',
        host: '',
        startTime: '',
        endTime: ''
      },
      statusTypeList: {
        SUBMITTED_SUCCESS: 3,
        RUNNING_EXECUTION: 2,
        PAUSE: 5,
        FAILURE: 5,
        SUCCESS: 4,
        NEED_FAULT_TOLERANCE: 5,
        KILL: 6,
        DELAY_EXECUTION: 2,
        FORCED_SUCCESS: 4,
        DISPATCH: 1
      },
      stateTypeList: {
        SUBMITTED_SUCCESS: '提交成功',
        RUNNING_EXECUTION: '正在执行',
        PAUSE: '暂停',
        FAILURE: '失败',
        SUCCESS: '成功',
        NEED_FAULT_TOLERANCE: '需要容错',
        KILL: 'Kill',
        DELAY_EXECUTION: '延时执行',
        FORCED_SUCCESS: '强制成功',
        DISPATCH: '派发'
      },
      monacoOpts: {
        value: '',
        origin: '',
        readOnly: true,
        theme: 'vs-dark'
      },
      tenantFlag: false,
      program: false,
      programParam: {},
      jumpDisabled: false
    }
  },
  components: { monaco },
  props: {
    theme: {
      type: String
    },
    dsProjectCode: {
      type: [Number, String]
    },
    taskCode: {
      type: [Number, String]
    },
    fileType: {
      type: [Number, String]
    },
    item: {
      type: Object
    }
  },
  /* computed: {
    flag () {
      console.log({ dsProjectCode: this.dsProjectCode, taskCode: this.taskCode })
      return { dsProjectCode: this.dsProjectCode, taskCode: this.taskCode }
    }
  },
  watch: {
    flag (val) {
      if (val.dsProjectCode && val.taskCode) {
        this.getHistoryList()
      }
    }
  }, */
  methods: {
    jumpUrl (row) {
      this.jumpDisabled = true
      let params = {
        dsProjectCode: this.dsProjectCode,
        id: row.id
      }
      HTTP.getUrlDetail(params)
        .then(res => {
          this.jumpDisabled = false
          if (res.code === 0) {
            window.open(res.data)
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    hiddenLineageTab () {
      this.$emit('hiddenLineageTab')
    },
    lazyloading () {
      if (this.total > this.historyList.length) {
        this.pageNo++
        this.getHistoryList()
      }
    },
    sqlStart () {
      this.pageNo = 1
      this.getHistoryList()
    },
    getHistoryList () {
      let params = {
        ...this.searchFrom,
        pageSize: this.pageSize,
        pageNo: this.pageNo,
        taskCode: this.taskCode,
        dsProjectCode: this.dsProjectCode

      }
      this.fileType === 19 && (params.taskExecuteType = 'STREAM')
      HTTP.getHistoryList(params)
        .then(res => {
          if (this.pageNo === 1) {
            this.historyList = res.data.totalList
          } else {
            this.historyList.push(...res.data.totalList)
          }
          this.total = res.data.total
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.scrollMeth()
    },
    scrollMeth () {
      this.$nextTick(() => {
        let dom = this.$refs.loadTable.$el
        let wrapper = $(dom).find('.el-table__body-wrapper')
        wrapper.on('scroll', () => {
          if (wrapper.scrollTop() + wrapper.innerHeight() >= wrapper[0].scrollHeight) {
            this.lazyloading()
          }
        })
      })
    },
    handleClick (row) {
      this.$emit('taskVersio', row.taskDefinitionVersion)
    },
    lookLog (row) {
      this.$emit('lookLog', row.id)
    },
    savepoint (row) {
      HTTP.savepoint({
        taskInstanceId: this.dsProjectCode,
        id: row.id
      })
        .then(res => {
          this.$datablauMessage.success('保存点成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    stopLog (row) {
      HTTP.stopLog({
        taskInstanceId: this.dsProjectCode,
        id: row.id
      })
        .then(res => {
          this.$datablauMessage.success('停止成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    sqlContent (row) {
      let param = JSON.parse(row.taskParams)
      this.$set(this.monacoOpts, 'value', param.rawScript)
      this.tenantFlag = true
    },
    async programContent (row) {
      this.programParam = JSON.parse(row.taskParams)
      // let mainJarList = await this.getMainJars(this.programParam.programType)
      // let obj = mainJarList.data.find(item => item.id === this.programParam.mainJar)
      // obj && (this.programParam.mainJar = obj.name)
      // console.log(obj, this.programParam, 'obj')
      this.program = true
    },
    /* getMainJars (val) {
      return HTTP.getMainJars({ programType: val })
    }, */
    timeChange (val) {
      this.searchFrom.startTime = val[0] + ' 00:00:00'
      this.searchFrom.endTime = val[1] + ' 00:00:00'
    }
  },
  mounted () {
  }
}
</script>

<style scoped lang='scss'>
  .result-data {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    .top-line {
      position: relative;
      height: 32px;
      border-bottom: 1px solid #e5e5e4;
      overflow: hidden;

      .data-tabs {
        margin-left: 20px;
      }
    }

    .hidden-btn {
      position: absolute;
      right: 20px;
      top: 3px;
      width: 20px;
      height: 20px;
      z-index: 2;
    }

    &.dark-theme-result {
      .top-line {
        border-bottom: 1px solid #353535;
      }
    }
  }
  .monaco{
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    bottom: 0;
  }
  /deep/.el-date-editor .el-range-input{
    background: none;
    color: #888888;
  }
  /deep/.el-range-editor--small .el-range-separator{
    color: #888888;
  }
  /deep/.el-date-editor .el-range__icon, /deep/.el-date-editor .el-range__close-icon{
    color: #888888;
  }
  .programBox {
    color: #bbb;
    div{
      margin-bottom: 10px;
    }
    span {
      display: inline-block;
      width: 100px;
      text-align: right;
    }
  }
</style>
