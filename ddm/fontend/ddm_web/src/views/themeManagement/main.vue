<template>
    <div class="themeManagement">
        <div class="tree-area">
            <datablau-input
            style="display: block"
            v-model="keyword"
            :iconfont-state="true"
            :placeholder="$store.state.$v.common.placeholder"
            size="small"
            prefix-icon="el-icon-search"
            ></datablau-input>
            <div>
                <datablau-tree
                    ref="tree"
                    style="
                        position: absolute;
                        top: 53px;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        overflow: auto;
                    "
                    node-key="id"
                    :data="treeData"
                    :props="defaultProps"
                    :default-expanded-keys="defaultExpandedKeys"
                    :data-icon-function="dataIconFunction"
                    data-supervise
                    :data-options-function="dataOptionsFunction"
                    :filter-node-method="filterNode"
                    @node-click="handleNodeClick"
                    :useDefaultSort="false"
                    default-expand-all
                ></datablau-tree>
            </div>
        </div>
        <div class="right-Detail" v-if="formDetail.id && formDetail.id!==0">
            <div class="detail-txt">
              <is-show-tooltip
                :content="formDetail.name"
                :style="{
                  maxWidth:'800px',
                  paddingTop: '2px',
                  fontWeight: '500',
                    fontSize: '16px',
                    display: 'block',
                    color: '#555555'}"
              ></is-show-tooltip>
                <!-- <h1>{{ formDetail.name }}</h1> -->
                <datablau-detail-subtitle title="基本信息" mt="10px" mb="10px"></datablau-detail-subtitle>
                <datablau-form
                :model="formDetail"
                ref="formDetail"
                size="small"
                class="theme-form"
                label-width="75px"
                >
                <div class="form-itemDiv">
                    <el-form-item label="英文简称" style="height: 32px;">
                      <is-show-tooltip
                  :content="formDetail.alias"
                  :style="{
                    width:
                      '200px',
                      height:'32px'
                  }"
                ></is-show-tooltip>
                    </el-form-item>
                    <el-form-item label="主题编号" style="height: 32px;">
                      <is-show-tooltip
                  :content="formDetail.subjectNo"
                  :style="{
                    width:
                      '200px',
                      height:'32px'
                  }"
                ></is-show-tooltip>
                    </el-form-item>
                </div>
                <div class="form-itemDiv">
                    <el-form-item label="创建时间" >
                        <p>{{  $timeFormatter(formDetail.createTime) }}</p>
                    </el-form-item>
                    <el-form-item label="更新时间" >
                        <p>{{  $timeFormatter(formDetail.updateTime) }}</p>
                    </el-form-item>
                </div>
                <div class="form-itemDiv">
                    <el-form-item label="创建人" >
                        <p>{{ formDetail.creator }}</p>
                    </el-form-item>
                    <el-form-item label="修改人" >
                        <p>{{ formDetail.updater }}</p>
                    </el-form-item>
                </div>
                <el-form-item label="定义" >
                  <is-show-tooltip
                  :content="formDetail.definition"
                  :style="{
                    maxWidth:
                      '700px',
                  }"
                ></is-show-tooltip>
                </el-form-item>

                </datablau-form>
            </div>
            <div class="associationTable">
              <datablau-detail-subtitle title="关联表" mt="20px"></datablau-detail-subtitle>
              <div>
                <datablau-input
                  style="width:200px;margin-top: 10px;"
                  v-model="keywordTable"
                  :iconfont-state="true"
                  :placeholder="$store.state.$v.common.placeholder"
                  size="small"
                  prefix-icon="el-icon-search"
                  ></datablau-input>
                  <div style="position: absolute;
                    top: 50px;
                    left: 0;
                    right: 0;
                    bottom: 50px;">
                    <datablau-table
                      :data="tableData"
                      height="100%"
                       @sort-change="handleSortChange"
                    >
                      <el-table-column label="表名称" prop="name"  sortable="custom" show-overflow-tooltip>

                      </el-table-column>
                      <el-table-column label="中文名称" prop="alis" sortable="custom" show-overflow-tooltip>

                      </el-table-column>
                      <el-table-column label="定义"  prop="definition" show-overflow-tooltip>

                      </el-table-column>

                      <el-table-column label="字段数" prop="columnNumber" sortable="custom">

                      </el-table-column>
                      <el-table-column label="操作" >
                        <template slot-scope="scope">
                          <datablau-button tooltipContent="查看" type="icon"  class="iconfont icon-see" @click="scanDetailTable(scope.row)"></datablau-button>
                        </template>
                      </el-table-column>
                    </datablau-table>
                  </div>
                  <div class="footer-row">
                    <datablau-pagination
                      style="float: right; margin-top: 10px;margin-bottom: 10px;"
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                      :current-page.sync="currentPage"
                      :page-sizes="[20, 50, 100]"
                      :page-size="pageSize"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="totalShow"
                    ></datablau-pagination>
                  </div>
              </div>
            </div>
        </div>
        <datablau-dialog
          :visible.sync="themeVisible"
          :title="form.id ? '编辑主题': '新建主题'"
          size="m"
          append-to-body
        >
          <div class="content">
            <datablau-form
              :model="form"
              ref="form"
              size="small"
              :rules="rules"
              label-width="75px"
            >
                <el-form-item label="主题名称" prop="name">
                <datablau-input
                  style="width: 100%"
                  placeholder="请输入主题名称"
                  v-model="form.name"
                  maxlength="100"
                  show-word-limit
                   class="maxlengthInput"
                ></datablau-input>
              </el-form-item>
              <el-form-item label="英文简称" prop="alias">
                <datablau-input
                  style="width: 100%"
                  placeholder="请输入英文简称"
                  v-model="form.alias"
                  maxlength="100"
                   class="maxlengthInput"
                  show-word-limit
                ></datablau-input>
              </el-form-item>
              <el-form-item label="主题编号" prop="subjectNo">
                <datablau-input
                  style="width: 100%"
                  placeholder="请输入主题编号"
                  v-model="form.subjectNo"
                  maxlength="100"
                   class="maxlengthInput"
                  show-word-limit
                ></datablau-input>
              </el-form-item>
              <el-form-item label="定义" prop="definition">
                <datablau-input
                  style="width: 100%"
                  placeholder="定义"
                  v-model="form.definition"
                  maxlength="500"
                  show-word-limit
                  type="textarea"
                ></datablau-input>
              </el-form-item>
            </datablau-form>
          </div>
          <span slot="footer">
            <datablau-button type="primary" @click="themeSave">
              确定
            </datablau-button>
            <datablau-button type="cancel"  @click="closeThemeVisible">
            </datablau-button>
          </span>
        </datablau-dialog>
    </div>
</template>

<script>
import main from './main.js'
export default main
</script>
<style lang="scss">
.theme-form{
  .el-form.db-form .el-form-item{
    margin-bottom: 0;
  }
}
</style>
<style lang="scss" scoped>
.themeManagement{
    .tree-area{
        padding: 8px;
    }
    .right-Detail{
        position: absolute;
        left: 240px;
        padding: 16px;
        top: 0;
        right: 0;
        bottom: 0;
        .form-itemDiv{
            display: flex;
            align-items: center;
            p{
              width: 200px;
            }
          }
          .associationTable{
            position: absolute;
            top: 210px;
            left: 16px;
            right: 16px;
            bottom: 0;
          }
    }
    .footer-row{
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: end;
      border-top: 1px solid #e0e0e0;
    }
}
</style>
