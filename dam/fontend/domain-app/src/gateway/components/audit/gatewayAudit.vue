<template>
  <div>
    <div class="link-page" v-if="activeName === 'link'" v-resize="domResize">
      <div class="link-title">访问日志</div>
      <datablau-tabs v-model="currentTab" @tab-click="tabClick">
        <el-tab-pane name="desGateway" label="脱敏网关日志"></el-tab-pane>
        <el-tab-pane name="tranGateway" label="透明网关日志"></el-tab-pane>
      </datablau-tabs>
      <template v-if="currentTab === 'desGateway'">
        <div class="link-search" ref="searchBox">
          <datablau-list-search>
            <el-form ref="form">
              <el-form-item label="登录名">
                <datablau-input
                  style="width: 160px"
                  clearable
                  type="text"
                  v-model="form.userName"
                  placeholder="请输入登录名"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="数据源类型">
                <datablau-select
                  style="width: 160px"
                  v-model="form.type"
                  filterable
                  placeholder="请选择数据源类型"
                >
                  <el-option
                    v-for="item in dataTypeList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.name"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item label="数据源名称">
                <datablau-select
                  style="width: 200px"
                  v-model="form.datasourceName"
                  filterable
                  :loading="typeLoading"
                  placeholder="请选择数据源名称"
                >
                  <el-option
                    v-for="item in dataSource"
                    :key="item.modelId"
                    :label="item.definition"
                    :value="item.definition"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item label="网关名称">
                <datablau-select
                  style="width: 200px"
                  v-model="form.gatewayName"
                  filterable
                  remote
                  reserve-keyword
                  placeholder="请选择网关名称"
                  :loading="groupLoading"
                  :remote-method="remoteMethodType"
                  @focus="focus"
                >
                  <el-option
                    v-for="item in groupData"
                    :key="item.id"
                    :label="item.groupName + '/' + item.name"
                    :value="item.name"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item label="时间">
                <datablau-dateRange
                  v-model="form.date"
                  type="daterange"
                  @changeDateTime="changeEventStartTime"
                ></datablau-dateRange>
              </el-form-item>
              <el-form-item class="btn">
                <datablau-button type="normal" @click="query">
                  查询
                </datablau-button>
                <datablau-button type="secondary" @click="resetForm">
                  重置
                </datablau-button>
              </el-form-item>
            </el-form>
            <template slot="buttons">
              <datablau-button type="normal" @click="refresh">
                刷新
              </datablau-button>
            </template>
          </datablau-list-search>
        </div>
        <div class="link-content" :style="{ top: searchBoxH }">
          <datablau-form-submit>
            <datablau-table
              v-loading="loading"
              :data="tableData"
              :show-column-selection="true"
              :component-case-name="componentCaseName"
              height="100%"
              :allColumns="allColumns"
            >
              <template v-slot:option="slot">
                <datablau-tooltip
                  effect="dark"
                  content="查看"
                  placement="bottom"
                >
                  <datablau-button type="text" @click="detail(slot.scope.row)">
                    <i class="iconfont icon-see"></i>
                  </datablau-button>
                </datablau-tooltip>
              </template>
            </datablau-table>
            <template slot="buttons">
              <datablau-pagination
                class="turn-pages"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="form.pageNum"
                :page-sizes="[20, 50, 100]"
                :page-size="form.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
              ></datablau-pagination>
              <!-- <span style="margin-right: 10px; color: #555">
                共{{ total }}条
              </span>
              <span style="margin-right: 10px; color: #555">
                当前第 {{ form.pageNum }} 页
              </span>
              <datablau-button
                type="secondary"
                :disabled="canPrev"
                @click="handlePrev"
                class="page-button"
              >
                上一页
              </datablau-button>
              <datablau-button
                type="secondary"
                class="page-button"
                :disabled="canNext"
                @click="handleNext"
              >
                下一页
              </datablau-button> -->
            </template>
          </datablau-form-submit>
        </div>
      </template>
      <template v-if="currentTab === 'tranGateway'">
        <div class="gateway-box">
          <datablau-form-submit>
            <datablau-table
              v-loading="loading1"
              :data="tableData1"
              :show-column-selection="false"
              height="100%"
            >
              <el-table-column
                label="客户端地址"
                prop="ip"
                show-overflow-tooltip
                width="180"
              >
                <!-- <template slot-scope="scope">{{ scope.row.username }}</template> -->
              </el-table-column>
              <el-table-column
                label="SQL语句"
                prop="sql"
                show-overflow-tooltip
                min-width="150"
              ></el-table-column>
              <el-table-column
                label="执行时间"
                prop="timestamp"
                show-overflow-tooltip
                width="180"
                :formatter="$timeFormatter"
              ></el-table-column>
              <el-table-column label="操作" prop="option" width="80">
                <template slot-scope="scope">
                  <datablau-tooltip
                    effect="dark"
                    content="查看"
                    placement="bottom"
                  >
                    <datablau-button type="text" @click="toDetail(scope.row)">
                      <i class="iconfont icon-see"></i>
                    </datablau-button>
                  </datablau-tooltip>
                </template>
              </el-table-column>
            </datablau-table>
            <template slot="buttons">
              <datablau-pagination
                class="turn-pages"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="agentPage"
                :page-sizes="[20, 50, 100]"
                :page-size="agentSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total1"
              ></datablau-pagination>
              <!-- <span style="margin-right: 10px; color: #555">
                当前第 {{ agentPage }} 页
              </span>
              <datablau-button
                :disabled="canAgentPrev"
                @click="handlePrev"
                type="secondary"
                class="page-button"
              >
                上一页
              </datablau-button>
              <datablau-button
                type="secondary"
                class="page-button"
                :disabled="canAgentNext"
                @click="handleNext"
              >
                下一页
              </datablau-button> -->
            </template>
          </datablau-form-submit>
        </div>
      </template>
    </div>
    <sql
      v-if="activeName === 'sql'"
      :detailRow="detailRow"
      @close="close"
    ></sql>
    <datablau-dialog
      title="SQL语句查看"
      :visible.sync="showSql"
      v-if="showSql"
      size="m"
      height="450"
    >
      <DatablauCodeMirror
        :readOnly="true"
        :value="curQuery"
        :option="setOptions"
        :tables="tables"
      ></DatablauCodeMirror>
    </datablau-dialog>
  </div>
</template>

<script>
import index from './gatewayAudit'
export default index
</script>

<style scoped lang="scss">
/deep/ .el-form-item {
  .el-form-item__content {
    min-width: 160px !important;
  }
}
.page-button {
  height: 30px;
  line-height: 30px;
  /deep/ span {
    vertical-align: top;
    line-height: 28px;
    display: inline-block;
  }
}
/deep/ .datablau-tabs {
  .el-tabs {
    padding: 0 20px;
    .el-tabs__header {
      .el-tabs__item {
        font-size: 14px;
      }
    }

    .el-tabs__content {
      height: 10px;
      overflow: hidden;
    }
  }
}
.gateway-box {
  position: absolute;
  top: 84px;
  left: 0;
  right: 0;
  bottom: 50px;
  /deep/ .row-buttons {
    text-align: right;
  }
}
.link-page {
  background: #fff;
  min-height: 100vh;
  position: relative;
  .link-title {
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    font-weight: 600;
    padding: 0 20px;
  }
  .link-search {
    // padding: 10px 20px 0;
    padding: 0 20px;
  }
  .link-content {
    padding: 0 20px;
    position: absolute;
    top: 172px;
    top: 138px;
    left: 0;
    right: 0;
    bottom: 50px;
    /deep/ .row-buttons {
      text-align: right;
    }
  }
}
</style>
