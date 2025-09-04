<template>
  <div>
    <datablau-dialog
      title="SQL请求的详细信息"
      size="m"
      :visible.sync="showInfo"
      :noPadding="true"
    >
      <DatablauCodeMirror
        :readOnly="true"
        :value="curQuery"
        :option="setOptions"
        :tables="tables"
      ></DatablauCodeMirror>
      <datablau-table :data="detailData">
        <el-table-column
          prop="name"
          label="表名称"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="key" label="表字段">
          <template slot-scope="scope">
            <span
              v-for="(item, index) in scope.row.keys"
              :key="index"
              style="
                color: #eb8449;
                background: rgba(235, 132, 73, 0.1);
                font-family: Microsoft YaHei, PingFang SC, serif;
                padding: 0 5px;
                height: 22px;
                font-size: 14px;
                line-height: 22px;
                text-align: center;
                border-radius: 2px;
                display: inline-block;
                margin-right: 10px;
              "
            >
              {{ item }}
            </span>
          </template>
        </el-table-column>
      </datablau-table>
    </datablau-dialog>
    <div class="sql-page" :class="{ 'no-search-word': !wordShow }">
      <div class="datablau-breadcrumb-header">
        <div>
          <datablau-breadcrumb
            :node-data="pathArr"
            @back="backClick"
            @nodeClick="nodeClick"
          ></datablau-breadcrumb>
        </div>
      </div>
      <div class="result-box" v-if="wordShow">
        <div class="list">
          登录名：
          <span>{{ detailRow.serviceUser }}</span>
        </div>
        <div class="list">
          数据源地址：
          <span>{{ detailRow.address }}</span>
        </div>
        <div class="list">
          数据源名称：
          <span>
            {{ detailRow.dateSourceName ? detailRow.dateSourceName : '-' }}
          </span>
        </div>
        <div class="list">
          安全网关组：
          <span>
            {{ detailRow.gatewayGroup ? detailRow.gatewayGroup : '-' }}
          </span>
        </div>
      </div>
      <div class="sql-search">
        <datablau-list-search>
          <el-form ref="form">
            <el-form-item label="SQL语句">
              <datablau-input
                clearable
                type="text"
                v-model="form.query"
                placeholder="请输入SQL语句"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="时间">
              <datablau-dateRange
                v-model="form.date"
                @changeDateTime="changeEventStartTime"
                :placeholder="'选择日期'"
              ></datablau-dateRange>
            </el-form-item>
            <el-form-item class="btn">
              <datablau-button type="important" @click="query">
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
      <div class="sql-content" v-loading="loading">
        <datablau-form-submit>
          <datablau-table
            height="100%"
            :data="tableData"
            :component-case-name="componentCaseName"
            :allColumns="allColumns"
          >
            <template v-slot:option="slot">
              <datablau-tooltip effect="dark" content="查看" placement="bottom">
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
              layout="total, sizes, prev, jumper, next"
              :total="total"
            ></datablau-pagination>
            <!-- <span style="margin-right: 10px; color: #555">
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
              :disabled="canNext"
              @click="handleNext"
              class="page-button"
            >
              下一页
            </datablau-button> -->
          </template>
        </datablau-form-submit>
      </div>
    </div>
    <detail v-if="isDetail" :rowItem="rowItem" @close="close"></detail>
  </div>
</template>

<script>
import sql from './sql'
export default sql
</script>

<style scoped lang="scss">
.page-button {
  height: 30px;
  line-height: 30px;
  /deep/ span {
    vertical-align: top;
    line-height: 28px;
    display: inline-block;
  }
}
/deep/ .CodeMirror {
  height: 130px;
}
.sql-page {
  background: #fff;
  min-height: 100vh;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 8;
  &.no-search-word {
    .sql-search {
      padding-top: 10px;
    }
    .sql-content {
      top: 84px;
    }
  }
  .result-box {
    padding: 0px 20px;
    .list {
      height: 34px;
      line-height: 34px;
      display: inline-block;
      margin-right: 20px;
      span {
        display: inline-block;
        min-width: 200px;
      }
    }
    span {
      // vertical-align: middle;
    }
  }
  .sql-search {
    padding: 0px 20px;
    padding-top: 10px;
  }
  .sql-content {
    padding: 0 20px;
    position: absolute;
    top: 128px;
    left: 0;
    right: 0;
    bottom: 50px;
    /deep/ .row-buttons {
      text-align: right;
    }
  }
}
</style>
