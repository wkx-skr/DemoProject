<template>
  <div class="dev-logs">
    <div class="title">服务日志</div>
    <div class="content">
      <div class="search-filter">
        <datablau-select
          placeholder="搜索服务名"
          filterable
          clearable
          v-model="serviceKeyword"
        >
          <el-option v-for="server in serverList" :key="server" :value="server">
            {{ server }}
          </el-option>
        </datablau-select>
        <div class="filter-group">
          <span class="label">日志等级</span>
          <datablau-select
            clearable
            v-model="logLevel"
            placeholder="请选择"
            style="display: inline-block; margin-left: 10px"
          >
            <el-option label="ERROR" value="ERROR"></el-option>
            <el-option label="INFO" value="INFO"></el-option>
            <el-option label="WARN" value="WARN"></el-option>
          </datablau-select>
        </div>
        <div class="filter-group">
          <span class="label">时间</span>
          <datablau-date-range
            clearable
            v-model="logTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            valueFormat="yyyy-MM-dd"
            style="display: inline-block; margin-left: 8px; width: 260px"
          ></datablau-date-range>

          <datablau-button
            type="primary"
            style="margin-left: 12px"
            @click="getLogList({ pageNum: 1 })"
          >
            搜索
          </datablau-button>
          <datablau-button type="seconfary" @click="reset">
            重置
          </datablau-button>
          <datablau-button type="info" @click="exportLogs">
            导出
          </datablau-button>
        </div>
      </div>
      <div class="search-result">
        <datablau-form-submit style="top: 80px">
          <datablau-table ref="log-table" :data="logsData">
            <el-table-column
              label="时间"
              prop="timeMillis"
              min-width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ $timeFormatter(scope.row.timeMillis) }}
              </template>
            </el-table-column>
            <el-table-column
              label="服务名"
              prop="serverName"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="IP地址"
              prop="localIp"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="线程"
              prop="thread"
              min-width="200"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="线程号"
              prop="threadId"
              min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              label="日志等级"
              prop="level"
              min-width="80"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column label="操作" min-width="80">
              <template slot-scope="scope">
                <datablau-button type="icon" @click="toDetails(scope.row)">
                  <datablau-tooltip content="查看">
                    <i class="iconfont icon-see"></i>
                  </datablau-tooltip>
                </datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <datablau-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="currentPage"
              :page-sizes="[20, 50, 100, 200]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
            ></datablau-pagination>
          </template>
        </datablau-form-submit>
      </div>
    </div>
    <el-drawer
      title="查看详情"
      :visible.sync="drawerVisible"
      direction="rtl"
      :before-close="handleDrawerClose"
      custom-class="log-drawer"
      :append-to-body="true"
    >
      <div class="drawer-content">
        <div class="common-message">
          <div class="title">日志信息</div>
          <div class="content">{{ logDetails.message }}</div>
        </div>
        <div class="error-message">
          <div class="title">
            错误信息
            <span class="copy" v-copy="logDetails.exception">
              <datablau-tooltip content="复制">
                <i class="iconfont icon-copy"></i>
              </datablau-tooltip>
            </span>
          </div>
          <div class="content">{{ logDetails.exception }}</div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'DevLogs',
  data() {
    return {
      logsData: [],
      pageSize: 20,
      currentPage: 1,
      total: 0,
      serviceKeyword: '',
      logTime: null,
      logLevel: null,
      drawerVisible: false,
      logDetails: {},
      serverList: [],
    }
  },
  mounted() {
    this.getSeverList()
    this.getLogList()
  },
  methods: {
    getSeverList() {
      this.$http.post(`/audit/sys/server`).then(res => {
        this.serverList = res.data.data
      })
    },
    getLogList(defaultParams = {}) {
      const params = {
        pageNum: 1,
        pageSize: this.pageSize,
        orderBy: '',
        sort: '',
        loggerLevel: this.logLevel ? this.logLevel : null,
        queryStr: this.serviceKeyword,
        startTime: this.logTime ? this.logTime[0] : null,
        endTime: this.logTime ? this.logTime[1] : null,
        ...defaultParams,
      }
      this.$http.post(`/audit/sys/log`, params).then(res => {
        const { messages, totalHits } = res.data.data
        this.logsData = messages
        this.total = totalHits
        this.pageSize = params.pageSize
        this.currentPage = params.pageNum
      })
    },
    reset() {
      this.serviceKeyword = ''
      this.logLevel = null
      this.logTime = null
      this.getLogList({ pageNum: 1 })
    },
    exportLogs() {
      const params = {
        pageNum: 1,
        pageSize: 20,
        orderBy: '',
        sort: '',
        loggerLevel: this.logLevel ? this.logLevel : null,
        queryStr: this.serviceKeyword,
        startTime: this.logTime ? this.logTime[0] : null,
        endTime: this.logTime ? this.logTime[1] : null,
      }
      // this.$downloadFilePost(``, params, '')
      this.$http.post(`/audit/sys/log/download`, params).then(res => {
        this.$bus.$emit('getTaskJobResult', res.data.msg, 'export')
        if (this.total > 10000) {
          this.$blauShowSuccess('导出上限是10000条数据', 'warning')
        }
      })
    },
    handleSizeChange(pageSize) {
      this.getLogList({ pageSize })
    },
    handleCurrentChange(pageNum) {
      this.getLogList({ pageNum })
    },
    toDetails(row) {
      this.logDetails = {
        exception: row.exception,
        message: row.message,
      }
      this.drawerVisible = true
    },
    handleDrawerClose() {
      this.drawerVisible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.dev-logs {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #fff;
  padding: 0 16px;

  .title {
    height: 42px;
    line-height: 42px;
    font-size: 18px;
    font-weight: 600;
  }
  .content {
    .search-filter {
      display: flex;
      align-items: center;

      .filter-group {
        margin-left: 12px;
      }
    }
  }
}
.log-drawer {
  top: 50px;

  .drawer-content {
    width: 100%;
    padding: 0 16px;
    height: calc(100vh - 85px);
    overflow: auto;

    .common-message,
    .error-message {
      .title {
        font-size: 16px;
        font-weight: 500;
        .copy {
          color: #409eff;
          cursor: pointer;
          margin-left: 8px;
        }
      }
      .content {
        margin-top: 8px;
        margin-bottom: 8px;
      }
    }
  }
}
/deep/.el-drawer__header {
  > span {
    font-size: 18px;
    font-weight: 600;
  }
}
</style>
