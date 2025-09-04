<template>
  <div>
    <!--<el-tabs
      v-model="activeName"
      style="position:relative;top:-8px;"
      @tab-click="handleClick"
      class="blue-tabs"
    >
      <el-tab-pane label="我的模型" name="first"></el-tab-pane>
    </el-tabs>-->
    <div class="table-area">
      <div class="title-line">
        <div class="title-wrapper clearfixed">
          <div class="com-title"><span
            style="position: relative;top: 1px;">{{ $store.state.$v.dashboard.myModel }}</span></div>
          <div class="demo-icons">
            <el-dropdown @command="handleSortCommand">
          <span class="el-dropdown-link">
            {{ sortBaseLabel }} <i class="fa fa-caret-down"></i>
          </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="name">{{ $v.modelList.byName }}</el-dropdown-item>
                <el-dropdown-item command="lastModificationTimestamp">{{ $v.modelList.byTime }}</el-dropdown-item>
                <el-dropdown-item command="star">{{ $v.modelList.byStar }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <i class="fa fa-sort-amount-desc" v-if="sortOrder==='desc'" @click="changeToAsc" title=""></i>
            <i class="fa fa-sort-amount-asc" v-else @click="changeToDesc" title=""></i>
          </div>
        </div>
      </div>
      <div class="table-line">
        <datablau-table
          height="100%"
          row-key="id"
          v-loading="loading"
          class="datablau-table thin"
          :data="showData"
          v-if="pathMap"
          row-class-name="row-can-click"
          @row-click="handleRowClick"
          :show-header="inElectron">
          <el-table-column width="48">
            <template>
              <i class="tree-icon model"></i>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="模型名称"
            :min-width="130"
            show-overflow-tooltip
          >
            <template slot-scope="scope"><b>{{ scope.row.modelName }}</b></template>
          </el-table-column>
          <el-table-column
            label="分支"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.branch">{{ scope.row.name }}</span>
              <span v-else>master</span>
            </template>
          </el-table-column>
          <el-table-column
            :min-width="200"
            show-overflow-tooltip
            label="模型路径"
          >
            <template slot-scope="scope">
              {{ pathMap.get(scope.row.categoryId) }}
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            header-align="center"
            align="center"
            :min-width="80"
            v-if="$store.state.featureMap.ddm_CustomStatus"
          >
            <template slot-scope="scope">
              <Status :type="scope.row.phase" :key="scope.row.id"></Status>
            </template>
          </el-table-column>
          <el-table-column
            prop="owner"
            label="提交人"
            :min-width="100"
          ></el-table-column>
          <!--<el-table-column-->
          <!--  label="对象数"-->
          <!--  prop="objCount"-->
          <!--&gt;-->
          <!--</el-table-column>-->
          <el-table-column
            :min-width="120"
            v-if="$store.state.featureMap.ddm_WebModelAdvancedAttribute"
            label="评分"
          >
            <template slot-scope="scope">
              <el-rate
                v-model="scope.row.rate"
                disabled
              ></el-rate>
            </template>
          </el-table-column>
          <el-table-column
            prop="lastModificationTimestamp"
            :formatter="$timeFormatter"
            :min-width="130"
            label="最近更新时间"
          >
          </el-table-column>
          <el-table-column class-name="shadow-wrapper" fixed="right" width="10">
          </el-table-column>
          <el-table-column
            label="操作"
            width="110"
            v-if="inElectron">
            <template slot-scope="scope">
              <div class="edit-model-btn" @click.stop="goEditPage(scope)">
                <img :src="editImg"/>
                <span>编辑</span>
              </div>
            </template>
          </el-table-column>
          <!--<el-table-column
            label="数据库类型"
          >
            <template slot-scope="scope">
              <Database-Type
                :key="scope.row.type"
                :value-1="scope.row.type"
                value="oracle"
                :size="24"
              ></Database-Type>
            </template>
          </el-table-column>
          <el-table-column
            prop="description"
            label="描述"
            show-overflow-tooltip
          ></el-table-column>-->
        </datablau-table>
      </div>
      <div class="pagination-line">
        <datablau-pagination
          :page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :pager-count="7"
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :total="total">
        </datablau-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import modelList from './modelList.js'
export default modelList
</script>
<style lang="scss" scoped>
/deep/ .el-table--enable-row-hover .el-table__body tr:hover>td.el-table__cell {
  background:rgb(236,245,255);
 }
/deep/ .el-table__row--level-1 {
    background: #F8F8F8;
  }
/deep/ .shadow-wrapper {
  border-top: none!important;
  border-bottom: none!important;
  background: #fff!important;
}
.tree-icon.model {
  position: absolute;
  left: 33px;
  top:12px;
}
  .title-wrapper {
    margin: 10px 0 10px 10px;
  }
  .com-title {
    &:before {
      display: inline-block;
      margin-right: 7px;
      content: '';
      width: 4px;
      height: 18px;
      background: #4386F5;
      border-radius: 2px;
      vertical-align: middle;
    }

    float: left;
    color: #20293B;
    font-weight: bold;
    font-size: 15px;
    display: inline-block;
  }

  $bottomHeight: 40px;
  .table-area {
    padding: 10px;
    background: #FFF;
    border-radius: 10px;
    position: absolute;
    top: 10px;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: auto;

    .table-line {
      position: absolute;
      top: 55px;
      bottom: $bottomHeight;
      left: 10px;
      right: 0;
      overflow: auto;
    }

    .pagination-line {
      border-top: 1px solid #EBEEF5;
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      top: auto;
      height: $bottomHeight;
      text-align: right;
      padding-top: 5px;
    }

    .datablau-table {
      border-radius: 10px;
      border-top: none;
    }
  }
  .datablau-table {
    color: #abadb3;
    b {
      color: #606266;
      &:hover {
        color: #4386f5;
      }
    }
  }
  .tag {
    display: inline-block;
    padding: 0 12px;
    width: auto!important;
  }
  .edit-model-btn {
    box-sizing: border-box;
    padding: 7px 10px;
    border: 1px solid #539FFD;
    font-size: 12px;
    line-height: 1;
    color: #539FFD;
    display: inline-block;
    border-radius: 2px;
    white-space: nowrap;
    img {
      width: 12px;
      margin-right: 8px;
    }
    span {
      vertical-align: top;
    }
  }
</style>
<style lang="sass">

</style>
