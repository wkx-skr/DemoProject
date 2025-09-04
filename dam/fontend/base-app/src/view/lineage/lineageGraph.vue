<template>
  <div class="graph-outer" :style="{ backgroundColor: pageColor }">
    <el-dialog
      :title="$t('meta.lineageManage.graph.bindToSys')"
      width="1200px"
      :visible.sync="bindCategory.visible"
      append-to-body
    >
      <bind-category
        v-if="bindCategory.visible"
        :rawData="rawData"
        :disableShowColumn="disableShowColumn"
      ></bind-category>
    </el-dialog>
    <el-dialog
      :title="$t('meta.lineageManage.graph.selBindTo', { name: currentName })"
      width="800px"
      :visible.sync="metaDialogVisible"
      append-to-body
    >
      <el-input
        v-show="!select"
        size="mini"
        v-model="keyword"
        clearable
      ></el-input>
      <div class="tree-container" v-show="select">
        <source-select></source-select>
      </div>
      <el-button
        v-show="!select"
        type="primary"
        size="mini"
        plain
        @click="select = true"
      >
        {{ selectBtnText }}
        <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-table v-show="!select" :data="metaData" :height="300" border>
        <el-table-column
          sortable
          v-if="type === 'COLUMN'"
          prop="parentPhysicalName"
          :label="$t('meta.lineageManage.graph.owningTableLogicalName')"
        ></el-table-column>
        <el-table-column
          sortable
          prop="name"
          :label="$t('meta.lineageManage.graph.logicalName')"
        ></el-table-column>
        <el-table-column
          sortable
          prop="physicalName"
          :label="$t('meta.lineageManage.graph.physicalName')"
        ></el-table-column>
        <el-table-column :label="$t('meta.lineageManage.operation')">
          <template slot-scope="scope">
            <el-button size="mini" @click="query(scope.row, 'column')">
              {{ $t('common.button.scan') }}
            </el-button>
            <el-button size="mini" @click="handleBind(scope.row.objectId)">
              {{ $t('meta.lineageManage.graph.bind') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog
      :title="dialogRawData.name"
      :visible.sync="dialogVisible"
      v-if="dialogVisible"
      :key="dialogKey"
      append-to-body
    >
      <el-button
        type="primary"
        size="mini"
        v-if="$auth['ROLE_LINEAGE_ADMIN']"
        :disabled="!dialogRawData.bindTableEnable"
        @click="bind()"
      >
        {{ $t('meta.lineageManage.graph.bindTable') }}
      </el-button>
      <ul style="max-height: 150px; overflow-y: auto">
        <li v-for="(value, key) in dialogData">
          <div class="oneline-eclipse" style="display: inline-block">
            <b>{{ key }} :</b>
          </div>
          <div
            class="oneline-eclipse"
            style="display: inline-block; width: 60%"
          >
            <span>{{ value }}</span>
          </div>
        </li>
      </ul>
      <el-table :data="columns" :height="300" border>
        <el-table-column
          prop="name"
          :label="$t('meta.lineageManage.graph.name')"
          sortable
        ></el-table-column>
        <el-table-column
          prop="type"
          :label="$t('meta.lineageManage.graph.type')"
        ></el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <el-button
              v-if="!scope.row.bindMessage"
              size="mini"
              type="text"
              @click="bind(scope.row)"
            >
              {{ $t('meta.lineageManage.graph.bindColumn') }}
            </el-button>
            <span v-else>
              <!--<el-button size="mini" type="text"  @click="unbind(scope.row)">解绑</el-button>-->
              {{
                $t('meta.lineageManage.graph.bound', {
                  name: scope.row.bindMessage.columnName,
                })
              }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <div class="title">
      {{ title }}
    </div>
    <div class="subtitle">
      {{ subtitle }}
    </div>
    <div class="legend-container">
      {{ $t('meta.lineageManage.graph.legend') }}
      <div class="graph-legend" style="background: #e7c58e">
        {{ $t('meta.lineageManage.graph.source') }}
      </div>
      <div class="graph-legend" style="background: #cbe8ca">
        {{ $t('meta.lineageManage.graph.target') }}
      </div>
      <div class="graph-legend" style="background: #d9dfef">
        {{ $t('meta.lineageManage.graph.intermediateSteps') }}
      </div>
    </div>
    <div id="loading-box" v-if="loading">
      <i class="el-icon-loading"></i>
      <div id="loading-progress"></div>
    </div>
    <div id="consa-graph" v-show="!loading"></div>
    <div id="graph-outline" v-show="!loading"></div>
    <div id="consa-function" v-show="!loading">
      <!--<el-checkbox v-model="param.developerMode" @change="handleData" size="mini" label="开发者模式"></el-checkbox>-->
      <el-checkbox
        v-model="showFullProcess"
        v-show="param.developerMode"
        :label="$t('meta.lineageManage.graph.wholeProcess')"
      ></el-checkbox>
      <el-input
        placeholder="copy your json here..."
        class="textarea"
        v-model="jsonData"
        @change="handleJson"
        v-show="param.developerMode"
        type="textarea"
      ></el-input>
      <!--<el-checkbox v-model="param.showModel" @change="handleData" size="mini" label="显示模型"></el-checkbox>-->
      <el-checkbox v-model="param.showMiddleProcess" @change="paintGraph">
        {{ $t('meta.lineageManage.graph.middleProcess') }}
      </el-checkbox>
      <el-checkbox
        v-model="param.showColumn"
        v-if="!disableShowColumn"
        @change="paintGraph"
      >
        {{ $t('meta.lineageManage.graph.showColumn') }}
      </el-checkbox>
      <!-- <el-button
        type="success"
        :plain="false"
        size="small"
        v-if="$auth['ROLE_LINEAGE_ADMIN'] && writable"
        @click="callBindDialog"
      >
        绑定表到系统
      </el-button> -->
      <datablau-button
        style="margin-left: 15px"
        v-if="$auth['ROLE_LINEAGE_ADMIN'] && writable"
        type="important"
        @click="callBindDialog"
      >
        {{ $t('meta.lineageManage.graph.savePlan') }}
      </datablau-button>
      <datablau-button style="margin-left: 15px" type="" @click="goToDemo">
        体验新版
      </datablau-button>
      <!--背景颜色<el-color-picker v-model="pageColor" show-alpha :predefine="predefineColors" size="mini"></el-color-picker>-->
      <!--<el-color-picker style="display:none;" v-model="param.inputTableColor" size="mini" @change="handleData"></el-color-picker>-->
    </div>
  </div>
</template>
<script>
import lineageGraph from './lineageGraph.js'
export default lineageGraph
</script>
<style lang="scss" scoped>
.graph-outer {
  padding: 10px 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //background:#FFF;
  background-color: var(--default-bgc);
}
#consa-graph {
  position: absolute;
  bottom: 20px;
  top: 115px;
  left: 20px;
  right: 20px;
  border: 1px solid gray;
  overflow: auto;
  &.to-top {
    top: 20px;
  }
}
.legend-container {
  float: right;
}
.graph-legend {
  display: inline-block;
  width: 80px;
  text-align: center;
  border: 1px solid #bfbfbf;
}
.title {
  font-size: 20px;
  font-weight: bold;
}
.subtitle {
  font-size: 18px;
  font-style: italic;
}
#graph-outline {
  position: absolute;
  height: 200px;
  width: 300px;
  /*top: 100px;*/
  bottom: 40px;
  right: 38px;
  border: 1px solid gray;
  background: #efefef;
  opacity: 0.8;
}
.btn-group {
  float: right;
}
#loading-box {
  width: 200px;
  height: 36px;
  position: absolute;
  top: 50%;
  left: 50%;
  text-align: center;
  transform: translate(-50%, -50%);
  i {
    font-size: 36px;
  }
}
#consa-function {
  margin-top: 5px;
  height: 30px;
  line-height: 30px;
}
.textarea {
  position: absolute;
  width: 500px;
  right: 20px;
  top: 30px;
}
.tree-container {
  height: 300px;
  position: relative;
}
</style>
