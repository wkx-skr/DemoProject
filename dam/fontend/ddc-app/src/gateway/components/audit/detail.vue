<template>
  <div class="detail-page" :class="{ 'no-search-word': !wordShow }">
    <datablau-dialog
      title="详细信息"
      size="m"
      :visible.sync="showInfo"
      :noPadding="true"
    >
      <div class="dialog-detail-items">
        <div class="item">
          <div class="key">用户：</div>
          <div class="name">{{ propsParam.serviceUser }}</div>
        </div>
        <div class="item">
          <div class="key">时间：</div>
          <div class="name">{{ $timeFormatter(detailInfo.timestamp) }}</div>
        </div>
        <div class="item">
          <div class="key">网关：</div>
          <div class="name">{{ propsParam.jdbcUrl }}</div>
        </div>
        <div class="item">
          <div class="key">SQL：</div>
          <div class="name">{{ propsParam.query }}</div>
        </div>
        <div class="item">
          <div class="key">字段名称：</div>
          <div
            class="name"
            style="cursor: pointer; color: #409eff"
            @click="moreKeys(detailInfo)"
          >
            点击查看
          </div>
        </div>
        <div class="item">
          <div class="key">字段值：</div>
          <div
            class="name"
            style="cursor: pointer; color: #409eff"
            @click="moreKeys(detailInfo)"
          >
            点击查看
          </div>
        </div>
      </div>
    </datablau-dialog>
    <!-- <datablau-dialog
      title="SQL请求的详细信息"
      size="m"
      :visible.sync="showInfo"
      :noPadding="true"
    >
      <DatablauCodeMirror
        ref="sqleditor"
        :readOnly="true"
        :value="propsParam.query"
        :option="setOptions"
        :tables="tables"
      ></DatablauCodeMirror>
      <datablau-table :data="keyData">
        <el-table-column
          prop="name"
          label="字段名称"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="key"
          label="字段值"
          show-overflow-tooltip
        ></el-table-column>
      </datablau-table>
    </datablau-dialog> -->
    <datablau-dialog title="字段值" size="m" :visible.sync="showKey">
      <datablau-table :data="keyData">
        <el-table-column
          prop="name"
          label="字段名称"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="key"
          label="字段值"
          show-overflow-tooltip
        ></el-table-column>
      </datablau-table>
      <span slot="footer">
        <datablau-pagination
          class="turn-pages"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, jumper, next"
          :total="total"
        ></datablau-pagination>
      </span>
    </datablau-dialog>
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
      <div class="list">登录名：{{ propsParam.serviceUser }}</div>
      <datablau-tooltip
        :content="`${propsParam.jdbcUrl}`"
        placement="bottom"
        effect="dark"
      >
        <div class="list">安全网关地址：{{ propsParam.jdbcUrl }}</div>
      </datablau-tooltip>
      <datablau-tooltip
        :content="`${propsParam.query}`"
        placement="bottom"
        effect="dark"
      >
        <div class="list">SQL语句：{{ propsParam.query }}</div>
      </datablau-tooltip>
    </div>
    <div class="detail-search">
      <datablau-list-search>
        <el-form ref="form">
          <!-- <el-form-item label="">
            <datablau-input
              clearable
              type="text"
              v-model="form.column"
              placeholder="请输入字段名"
            ></datablau-input>
          </el-form-item> -->
          <!-- <el-form-item label="">
            <datablau-input
              clearable
              type="text"
              v-model="form.key"
              placeholder="请输入字段值"
            ></datablau-input>
          </el-form-item> -->
          <el-form-item label="时间范围">
            <datablau-dateRange
              @changeDateTime="changeEventStartTime"
              v-model="form.date"
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
          <datablau-button type="normal" @click="refresh">刷新</datablau-button>
        </template>
      </datablau-list-search>
    </div>
    <div class="detail-content" v-loading="loading">
      <datablau-form-submit>
        <datablau-table
          :data="tableData"
          :component-case-name="componentCaseName"
          height="100%"
          :allColumns="allColumns"
        >
          <template v-slot:key="slot">
            <datablau-button type="text" @click="moreKeys(slot.scope.row)">
              点击查看
            </datablau-button>
          </template>
          <template v-slot:name="slot">
            <datablau-button type="text" @click="moreKeys(slot.scope.row)">
              点击查看
            </datablau-button>
          </template>
          <template v-slot:option="slot">
            <datablau-button type="text" @click="view(slot.scope.row)">
              查看请求信息
            </datablau-button>
          </template>
        </datablau-table>
        <template slot="buttons">
          <datablau-button :disabled="canPrev" @click="handlePrev">
            上一页
          </datablau-button>
          <datablau-button
            type="important"
            :disabled="canNext"
            @click="handleNext"
          >
            下一页
          </datablau-button>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import auditDetail from './detail'
export default auditDetail
</script>

<style scoped lang="scss">
/deep/ .CodeMirror {
  height: 130px;
}
.detail-page {
  background: #fff;
  min-height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  &.no-search-word {
    .detail-search {
      padding-top: 10px;
    }
    .detail-content {
      top: 84px;
    }
  }
  .result-box {
    padding: 0px 20px;
    // line-height: 40px;
    // height: 40px;
    /deep/ .datablau-tooltip {
      display: block;
    }
    .list {
      height: 30px;
      line-height: 30px;
      max-width: 100%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      word-break: break-all;
      cursor: pointer;
    }
    span {
      vertical-align: middle;
      display: inline-block;
    }
  }
  .detail-search {
    padding: 0 20px;
    padding-top: 10px;
  }

  .detail-content {
    padding: 0 20px;
    position: absolute;
    top: 184px;
    left: 0;
    right: 0;
    bottom: 50px;
  }
}
.dialog-detail-items {
  color: #444;
  .item {
    line-height: 34px;
    margin-bottom: 14px;

    &:after {
      content: '';
      clear: both;
      display: block;
    }
    .key {
      width: 80px;
      float: left;
      text-align: right;
    }
    .name {
      float: left;
      width: 500px;
    }
  }
}
</style>
