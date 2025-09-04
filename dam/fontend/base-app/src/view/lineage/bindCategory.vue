<template>
  <div class="container">
    <div id="table-outer" style="position: relative">
      <datablau-tabs
        style="height: 40px; width: 150px"
        v-model="activeTypeName"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          :label="$t('meta.lineageManage.graph.source')"
          name="source"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('meta.lineageManage.graph.target')"
          name="target"
        ></el-tab-pane>
      </datablau-tabs>
      <div style="width: 440px; position: absolute; top: 8px; left: 220px">
        <datablau-input
          style="width: 280px; display: inline-block"
          :placeholder="$t('meta.lineageManage.bindCatefory.queryName')"
          clearable
          v-model="keyword"
        ></datablau-input>
        <el-button
          type="text"
          size="small"
          @click="keyword = ''"
          style="margin-left: 10px"
        >
          {{ $t('meta.lineageManage.bindCatefory.clearQuery') }}
        </el-button>
      </div>
      <!--      <ag-grid-vue
        v-if="false"
        style="height: 240px"
        class="ag-theme-balham"
        :rowData="steps"
        rowSelection="multiple"
        @grid-ready="onGridReady"
        :frameworkComponents="frameworkComponents"
        enableBrowserTooltips
      >
        <ag-grid-column
          checkboxSelection
          headerCheckboxSelection
          :width="40"
        ></ag-grid-column>
        <ag-grid-column
          field="name"
          headerName="表名"
          sortable
          :width="270"
        ></ag-grid-column>
        <ag-grid-column headerName="绑定到" :width="290"></ag-grid-column>
        <ag-grid-column headerName="操作" :width="96"></ag-grid-column>
      </ag-grid-vue>-->
      <datablau-table
        :show-column-selection="false"
        :data="steps"
        class="plain-table"
        ref="multipleTable"
        :key="tableCal"
        :stripe="true"
        :height="408"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column
          type="selection"
          :selectable="selectable"
        ></el-table-column>
        <el-table-column
          prop="name"
          :label="$t('meta.lineageManage.tableName')"
          :width="270"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.lineageManage.bindCatefory.bound')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <i
              v-if="scope.row.isBind && !scope.row.ddmStep"
              class="tree-icon fa fa-database"
            ></i>
            <i
              v-else-if="scope.row.isBind && scope.row.ddmStep"
              class="tree-icon model"
              style="transform: translateY(6px)"
            ></i>
            <span v-show="scope.row.isBind">{{ scope.row.bindTo }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.lineageManage.operation')"
          :width="110"
        >
          <template slot-scope="scope">
            <el-popover placement="right" width="600" trigger="click">
              <el-button
                v-if="
                  scope.row.properties &&
                  JSON.stringify(scope.row.properties).length > 2
                "
                type="text"
                slot="reference"
              >
                {{ $t('meta.lineageManage.bindCatefory.prop') }}
              </el-button>
              <div class="pop-content">
                <div v-for="(p, i) in scope.row.properties">
                  <b>{{ i }}</b>
                  :{{ p }}
                </div>
                <br />
              </div>
            </el-popover>
            <el-button
              type="text"
              style="margin-left: 1em"
              @click="unbind(scope.row)"
              v-show="Boolean(tableDetail[scope.row.id]) || disableButton"
            >
              {{ $t('meta.lineageManage.bindCatefory.unbind') }}
            </el-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div id="category-area">
      <div class="sub-title">
        {{ $t('meta.lineageManage.bindCatefory.selSys') }}
      </div>
      <el-select
        class="category-selector"
        v-model="modelCategory"
        filterable
        :placeholder="$t('meta.lineageManage.bindCatefory.pleaseSelSys')"
        size="small"
        value-key="categoryId"
        @change="handleModelCategoryChange"
        clearable
      >
        <el-option
          v-for="item in $modelCategories"
          :key="item.categoryId"
          :label="item.categoryName + ' (' + item.categoryAbbreviation + ')'"
          :value="item"
        ></el-option>
      </el-select>
      <div class="sub-title">
        {{ $t('meta.lineageManage.bindCatefory.selDbs') }}
        <el-tooltip
          effect="light"
          :content="$t('meta.lineageManage.bindCatefory.selDbsTips')"
          placement="right"
        >
          <i class="el-icon-info"></i>
        </el-tooltip>
      </div>
      <el-select
        v-model="model"
        filterable
        :placeholder="$t('meta.lineageManage.bindCatefory.selSbsPlaceholder')"
        size="small"
        class="category-selector"
        :readonly="!modelCategory"
        clearable
        value-key="id"
      >
        <el-option
          v-for="ds in dataSources"
          :key="ds.id"
          :label="ds.name"
          :value="ds"
        >
          <i v-if="!ds.ddmModel" class="tree-icon fa fa-database"></i>
          <i
            v-else
            class="tree-icon model"
            style="transform: translateY(6px)"
          ></i>
          <span>{{ ds.name }}</span>
        </el-option>
      </el-select>

      <!-- <el-button
        style="display: inline-block; margin-right: 40px"
        size="small"
        :disabled="!model || selection.length === 0 || disableButton"
        type="primary"
        @click="bind"
      >
        绑定
      </el-button> -->
      <datablau-button
        style="display: inline-block; margin-right: 40px"
        :disabled="!model || selection.length === 0 || disableButton"
        type="important"
        @click="bind"
      >
        {{ $t('meta.lineageManage.bindCatefory.bind') }}
      </datablau-button>
      <el-switch
        v-show="!disableShowColumn"
        v-model="bindOnTable"
        inactive-color="#409EFF"
        :active-text="$t('meta.lineageManage.bindCatefory.bindToTable')"
        :inactive-text="$t('meta.lineageManage.bindCatefory.bindToColumn')"
      ></el-switch>
    </div>
    <div id="favourite-area">
      <div class="sub-title">
        {{ $t('meta.lineageManage.bindCatefory.history') }}
      </div>
      <datablau-table
        :show-column-selection="false"
        :data="clickedCategories"
        class="plain-table"
        ref="multipleTable"
        :stripe="true"
        :height="200"
        border
      >
        <el-table-column
          prop="categoryName"
          :label="$t('meta.lineageManage.bindCatefory.sysName')"
        ></el-table-column>
        <el-table-column
          prop="categoryAbbreviation"
          :label="$t('meta.lineageManage.bindCatefory.sysShortName')"
        ></el-table-column>
        <el-table-column
          :min-width="100"
          :label="$t('meta.lineageManage.bindCatefory.dataSourceName')"
        >
          <template slot-scope="scope">
            <i v-if="!scope.row.ddmModel" class="tree-icon fa fa-database"></i>
            <i
              v-else
              class="tree-icon model"
              style="transform: translateY(6px)"
            ></i>
            {{ scope.row.modelName }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.lineageManage.bindCatefory.operation')"
          :width="90"
        >
          <template slot-scope="scope">
            <!-- <el-button
              type="text"
              @click="bind('favourite', scope.row)"
              :disabled="selection.length == 0 || disableButton"
            >
              绑定
            </el-button> -->
            <datablau-button
              :disabled="selection.length == 0 || disableButton"
              type="important"
              @click="bind('favourite', scope.row)"
            >
              {{ $t('meta.lineageManage.bindCatefory.bind') }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <!-- <el-button
        size="small"
        style="float: right; margin-top: 10px"
        class="white-btn"
        @click="$parent.$parent.bindCategory.visible = false"
      >
        关闭
      </el-button> -->
      <datablau-button
        style="float: right; margin-top: 10px"
        class="white-btn"
        type="secondary"
        @click="$parent.$parent.bindCategory.visible = false"
      >
        {{ $t('common.button.close') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
import js from './bindCategory.js'
export default js
</script>

<style scoped="scoped">
.plain-table {
  margin-top: 20px;
}
.container {
  overflow: auto;
}
#table-outer {
  /*outline:1px solid pink;*/
  width: 700px;
  float: left;
}
#favourite-area {
  width: 430px;
  float: right;
}
#category-area {
  width: 430px;
  float: right;
}
.pop-content {
  padding: 12px;
  background: #fff;
}
.category-selector {
  width: 400px;
  margin: 10px 0;
}
.sub-title {
  font-size: 15px;
  font-weight: bold;
  margin-top: 1em;
}
</style>
