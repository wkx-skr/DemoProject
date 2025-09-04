<template>
  <div>
    <el-tabs
      type="card"
      class="page-card-tabs"
      v-model="currentTab"
      @tab-remove="removeTab"
    >
      <el-tab-pane label="列表" name="list">
        <div class="tab-page">
          <div class="filter-row">
            <div class="row-inner">
              <span class="label">
                <b>搜索条件：</b>
                表名
              </span>
              <el-input
                v-model="query.table"
                style="width: 100px; margin-right: 1em"
                size="small"
                placeholder="必填项"
              ></el-input>
              <span class="label">Schema</span>
              <el-input
                v-model="query.schema"
                style="width: 100px; margin-right: 1em"
                size="small"
                placeholder="必填项"
              ></el-input>
              <el-button
                type="success"
                size="small"
                @click="searchTables"
                :disabled="!query.table || !query.schema"
              >
                搜索
              </el-button>
              <el-button type="text" size="small" @click="getAllTables">
                Load All Tables
              </el-button>
              <span style="float: right; margin-right: 20px">
                系统共处理了{{ count }}条sql语句
              </span>
            </div>
          </div>
          <div class="table-row" style="bottom: 0">
            <div
              style="
                background: #f1f5f7;
                height: 35px;
                line-height: 40px;
                font-weight: bold;
                text-indent: 2em;
              "
            >
              搜索结果
            </div>
            <div
              style="
                position: absolute;
                top: 35px;
                bottom: 0;
                left: 0;
                right: 0;
              "
            >
              <el-table
                v-if="tables"
                :data="tables"
                class="plain-table"
                border
                height="100%"
                :stripe="true"
                :default-sort="{ prop: 'queryTimes', order: 'descending' }"
              >
                <el-table-column
                  prop="table"
                  label="表名"
                  show-overflow-tooltip
                  sortable
                ></el-table-column>
                <el-table-column
                  prop="schema"
                  label="Schema"
                  show-overflow-tooltip
                  sortable
                ></el-table-column>
                <el-table-column
                  prop="queryTimes"
                  label="查询次数"
                  show-overflow-tooltip
                  sortable
                ></el-table-column>
                <el-table-column
                  prop="sqls"
                  label="sqls"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column label="操作" width="80">
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      size="mini"
                      @click="getRelatedTables(scope.row)"
                    >
                      获取关联表
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!--<div
              style="background:#f1f5f7;height:35px;line-height:40px;font-weight:bold;text-indent: 2em;margin-top:35px;"
              v-if="currentTable && relatedTables">与 {{currentTable.table}} （schema：{{currentTable.schema}}）相关联的表</div>-->
            <!--<el-table
              v-if="currentTable && relatedTables"
              :data="relatedTables"
              class="plain-table"
              :stripe="true"
              :max-height="280"
              :default-sort = "{prop: 'queryTimes', order: 'descending'}"
            >
              <el-table-column prop="table" label="表名" show-overflow-tooltip sortable></el-table-column>
              <el-table-column prop="schema" label="Schema" show-overflow-tooltip sortable></el-table-column>
              <el-table-column prop="queryTimes" label="查询次数" show-overflow-tooltip sortable></el-table-column>
              <el-table-column prop="sqls" label="sqls" show-overflow-tooltip ></el-table-column>
              <el-table-column label="操作" width="80">
                <template slot-scope="scope">
                  <el-button type="text" size="mini" @click="getSqls(scope.row)">查看sql语句</el-button>
                </template>
              </el-table-column>
            </el-table>-->
            <!--<div
              style="background:#f1f5f7;height:35px;line-height:40px;font-weight:bold;text-indent: 2em;margin-top:35px;"
              v-if="currentTable && thatTable"
            >构造 {{currentTable.table}} （schema：{{currentTable.schema}}）和
              {{thatTable.table}} （schema：{{thatTable.schema}}）关系的所有SQL语句
            </div>-->
          </div>
        </div>
        <!--<our-list :hasAccess="hasAccess"></our-list>-->
      </el-tab-pane>
      <el-tab-pane
        v-if="currentTable && relatedTables"
        :label="
          '与' +
          currentTable.table +
          '（' +
          currentTable.schema +
          '）相关联的表'
        "
        name="relatedTables"
        closable
      >
        <div
          style="
            background: #f1f5f7;
            height: 35px;
            line-height: 40px;
            font-weight: bold;
            text-indent: 2em;
            margin-top: -20px;
          "
          v-if="currentTable && relatedTables"
        >
          与 {{ currentTable.table }} （schema：{{
            currentTable.schema
          }}）相关联的表
        </div>
        <div
          style="position: absolute; top: 35px; bottom: 0; left: 0; right: 0"
        >
          <el-table
            v-if="currentTable && relatedTables"
            :data="relatedTables"
            class="plain-table"
            :stripe="true"
            height="100%"
            :default-sort="{ prop: 'queryTimes', order: 'descending' }"
          >
            <el-table-column
              prop="table"
              label="表名"
              show-overflow-tooltip
              sortable
            ></el-table-column>
            <el-table-column
              prop="schema"
              label="Schema"
              show-overflow-tooltip
              sortable
            ></el-table-column>
            <el-table-column
              prop="queryTimes"
              label="查询次数"
              show-overflow-tooltip
              sortable
            ></el-table-column>
            <el-table-column
              prop="sqls"
              label="sqls"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="getSqls(scope.row)">
                  查看sql语句
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      <el-tab-pane
        v-if="currentTable && thatTable"
        :label="'SQL语句'"
        name="thatTable"
        closable
      >
        <div
          style="
            background: #f1f5f7;
            height: 35px;
            line-height: 40px;
            font-weight: bold;
            text-indent: 2em;
            margin-top: -20px;
          "
        >
          构造 {{ currentTable.table }} （schema：{{ currentTable.schema }}）和
          {{ thatTable.table }} （schema：{{
            thatTable.schema
          }}）关系的所有SQL语句
        </div>
        <ul>
          <li v-for="sql in sqls" style="text-indent: 1em; line-height: 2em">
            {{ sql }}
          </li>
        </ul>
      </el-tab-pane>
    </el-tabs>
    <div class="page-btn-group right-top" style="top: 10px">
      <el-button size="mini" @click="downloadTemplate">
        <i class="el-icon-download"></i>
        下载模版
      </el-button>
      <el-upload
        style="display: inline-block; margin-left: 1em"
        :action="postUrl"
        :on-error="onError"
        :on-success="onSuccess"
        :show-file-list="false"
        :headers="$headers"
      >
        <el-button size="mini" type="primary">
          <i class="el-icon-upload"></i>
          上传Excel文件
        </el-button>
      </el-upload>
    </div>
  </div>
</template>

<script>
import main from './main'
export default main
</script>

<style scoped></style>
