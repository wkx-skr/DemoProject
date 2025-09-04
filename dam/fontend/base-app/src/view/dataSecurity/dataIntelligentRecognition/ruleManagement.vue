<template>
  <div v-loading="tableLoading" id="dir-rule-management">
    <datablau-dialog
      title="添加目录"
      size="s"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
    >
      <el-form
        label-width="80px"
        :rules="rules"
        ref="ruleForm"
        :model="ruleForm"
      >
        <el-form-item label="目录名称" prop="name" style="margin-top: 10px">
          <datablau-input
            maxlength="50"
            style="width: 100%"
            v-model.trim="ruleForm.name"
            @keydown.native="nameKeydown"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="dialogVisible = false">
          取消
        </datablau-button>
        <datablau-button type="important" @click="sureName">
          确定
        </datablau-button>
      </span>
    </datablau-dialog>
    <div class="tree-box">
      <div class="tree-search-box">
        <datablau-input
          class="filter-input"
          v-model="treeKey"
          clearable
          :iconfont-state="true"
          placeholder="检索目录"
        ></datablau-input>
        <el-tooltip
          class="item"
          effect="dark"
          content="添加目录"
          placement="top"
        >
          <i class="iconfont icon-tianjia" @click="addClassGroup"></i>
        </el-tooltip>
      </div>
      <div
        class="tree-title"
        :class="{ 'tree-title-active': isSelect }"
        @click="selectRule"
      >
        <i class="iconfont icon-shuju"></i>
        <span>全部业务规则</span>
      </div>
      <div class="tree-line"></div>
      <div class="tree-content">
        <datablau-tree
          class="el-tree"
          style="position: relative"
          :show-checkbox="false"
          ref="tree"
          :data="treeData"
          :expand-on-click-node="false"
          default-expand-all
          :props="defaultProps"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          check-strictly
          node-key="id"
          :data-supervise="true"
          :data-icon-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
        ></datablau-tree>
      </div>
    </div>
    <div class="resize-column-middle"></div>
    <div class="right-box">
      <datablau-list-search style="padding: 0 20px">
        <template slot="title">
          <div>业务识别规则</div>
        </template>
        <div>
          <datablau-input
            v-model="keyword"
            placeholder="搜索规则名称"
            :iconfont-state="true"
            clearable
          ></datablau-input>
        </div>
        <template slot="buttons">
          <el-upload
            style="display: inline-block; margin-left: 10px; margin-right: 10px"
            :action="$url + '/service/discern/import'"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :show-file-list="false"
            accept=".xlsx"
            :headers="$headers"
          >
            <datablau-button
              type="secondary"
              class="icon-ic-quality-import button-icon"
            >
              导入规则
            </datablau-button>
          </el-upload>
          <datablau-button
            class="iconfont icon-tianjia"
            type="important"
            @click="showEdit"
          >
            新建规则
          </datablau-button>
        </template>
      </datablau-list-search>
      <div class="table-box">
        <datablau-form-submit>
          <datablau-table
            :data="tableData"
            :data-selectable="true"
            @selection-change="tableSelectionChanged"
            ref="table"
            size="small"
            class="datablau-table table"
            style="width: 100%"
            height="100%"
          >
            <el-table-column
              :sortable="true"
              show-overflow-tooltip
              prop="ruleName"
              label="规则名称"
              min-width="150"
            ></el-table-column>
            <el-table-column
              prop="discernType"
              label="识别对象"
              min-width="150"
              :sortable="true"
            >
              <template slot-scope="scope">
                <div
                  v-show="scope.row.discernType === 80000004"
                  class="meta-data surface"
                >
                  表
                </div>
                <div
                  v-show="scope.row.discernType === 80500008"
                  class="meta-data view"
                >
                  视图
                </div>
                <div
                  v-show="scope.row.discernType === 80000005"
                  class="meta-data field"
                >
                  字段
                </div>
              </template>
            </el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="ruleDescription"
              label="规则描述"
              min-width="180"
            ></el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              min-width="150"
              sortable
              :formatter="timeFormatter"
            ></el-table-column>
            <el-table-column
              label="操作"
              fixed="right"
              align="center"
              width="150"
            >
              <template slot-scope="scope">
                <datablau-tooltip
                  effect="dark"
                  content="更新状态"
                  placement="bottom"
                  style="margin-right: 6px"
                >
                  <datablau-switch
                    v-model="scope.row.enabled"
                    :active-value="true"
                    :inactive-value="false"
                    @change="updateDIscernRuleStatus($event, scope.row)"
                  ></datablau-switch>
                </datablau-tooltip>
                <datablau-tooltip
                  effect="dark"
                  content="编辑"
                  placement="bottom"
                >
                  <datablau-button
                    type="text"
                    class="iconfont icon-bianji"
                    @click="editRule(scope.row)"
                  ></datablau-button>
                </datablau-tooltip>
                <datablau-tooltip
                  effect="dark"
                  content="删除"
                  placement="bottom"
                >
                  <datablau-button
                    class="iconfont icon-delete"
                    type="text"
                    @click="deleteRule(scope.row.ruleName, scope.row.ruleId)"
                  ></datablau-button>
                </datablau-tooltip>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <div class="bottom">
              <span v-show="selections.length > 0" class="footer-row-info">
                当前选中“{{ selections.length }}条”信息，是否
              </span>
              <datablau-button
                class="el-icon-delete"
                type="danger"
                v-show="selections.length > 0"
                @click="mulipleDeleRule"
              >
                删除
              </datablau-button>
              <datablau-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                :page-sizes="[10, 20, 50, 100]"
                :page-size.sync="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                class="page"
              ></datablau-pagination>
            </div>
          </template>
        </datablau-form-submit>
      </div>
    </div>
    <rule-edit
      :treeData1="treeData"
      v-if="renderEdit"
      :isEditMode="isEditMode"
      :ruleInfoCatalog="ruleInfoCatalog"
      :ruleType="ruleType"
      :ruleId="ruleId"
      @close="close"
    ></rule-edit>
  </div>
</template>
<script>
import ruleEdit from './ruleEdit.vue'
import HTTP from '@/http/main.js'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'

export default {
  data() {
    return {
      isSelect: true,
      treeKey: '',
      treeData: [],
      ruleInfoCatalog: '',
      defaultProps: {
        value: 'id',
        label: 'name',
        children: 'subNodes',
      },
      dialogVisible: false,
      ruleForm: {
        name: '',
        type: 'DISCERN_RULE',
      },
      rules: {
        name: [{ required: true, message: '请输入目录名称', trigger: 'blur' }],
      },
      tableLoading: false,
      tableData: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      renderEdit: false,
      isEditMode: false,
      ruleType: '',
      keyword: '',
      ruleId: null,

      selections: [],
    }
  },
  components: {
    ruleEdit,
  },
  mounted() {
    this.getRules()
    this.getTree()
    this.initResizeHorizontal()
  },
  methods: {
    handleBeforeUpload(file) {
      if (file.name.includes('.xlsx')) {
      } else {
        this.$message.error(`只能上传xlsx格式的文件!`)
        return false
      }
    },
    handleUploadError(e) {
      this.$showUploadFailure(e)
    },
    handleUploadSuccess(file) {
      this.$message.success('上传成功')
      this.getRules()
    },
    nameKeydown(e) {
      e.target.value = e.target.value.replace(/[`\\/]/g, '')
    },
    getTree() {
      this.$http
        .get(this.$url + '/service/categories/tree/?type=DISCERN_RULE')
        .then(data => {
          if (data.data.subNodes) {
            this.treeData = data.data.subNodes
          }
        })
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      options.push({
        icon: 'iconfont icon-revise',
        label: '修改',
        callback: () => {
          this.modifyFolder(data)
        },
        args: 'folder',
      })
      options.push({
        icon: 'iconfont icon-delete',
        label: '删除',
        callback: () => {
          this.deleteFolder(data)
        },
        args: 'folder',
      })
      return options
    },
    modifyFolder(data) {
      this.ruleForm = {
        id: data.id,
        name: data.name,
        type: 'DISCERN_RULE',
      }
      this.dialogVisible = true
    },
    deleteFolder(data) {
      this.$DatablauCofirm(`是否确认删除目录“${data.name}”`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.$http
          .delete(this.$url + '/service/discern/category/discern/' + data.id)
          .then(res => {
            this.$message.success('删除目录成功')
            this.dialogVisible = false
            this.getTree()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    selectRule() {
      this.isSelect = true
      this.$refs.tree.setCurrentKey(null)
      this.ruleInfoCatalog = ''
      this.getRules()
    },
    handleNodeClick(data, e) {
      this.isSelect = false
      this.ruleInfoCatalog = data.name
      this.getRules()
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name && data.name.indexOf(value) !== -1
    },
    sureName() {
      this.ruleForm.name = this.ruleForm.name.replace('/', '')
      if (this.ruleForm.id) {
        const params = this.ruleForm
        params.parentId = 0
        this.$http
          .put(
            this.$url + '/service/discern/category/discern/' + this.ruleForm.id,
            params
          )
          .then(res => {
            this.$message.success('修改目录成功')
            this.dialogVisible = false
            this.getTree()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .post(this.$url + '/service/categories/', this.ruleForm)
          .then(res => {
            this.$message.success('目录创建成功')
            this.dialogVisible = false
            this.getTree()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    addClassGroup() {
      this.ruleForm = {
        id: '',
        name: '',
        type: 'DISCERN_RULE',
      }
      this.dialogVisible = true
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-box'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
        })
      }, 1000)
    },
    getDate(time) {
      return moment(time).format('YYYY-MM-DD HH:mm')
    },
    deleteRule(name, id) {
      this.beforeDelete(name, id).then(res => {
        HTTP.deleteDIscernRule(id)
          .then(res => {
            if (res.data.data.length > 0) {
              let newList = []
              this.tableData.map(item => {
                res.data.data.map(id => {
                  if (id === item.ruleId) {
                    newList.push(item.ruleName)
                  }
                })
              })
              this.$DatablauCofirm(
                `有即将执行的任务引用“${newList.join('，')}”规则，无法删除`
              )
            } else {
              this.$message.success('删除成功')
            }
            this.getRules()
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    tableSelectionChanged(selection) {
      this.selections = selection
    },
    // 删除多条规则，传入规则的id数组
    mulipleDeleRule() {
      let name = ''
      const ids = this.selections.map(v => v.ruleId).join(',')
      if (this.selections.length === 1) {
        name = this.selections.map(v => v.ruleName)
      }
      this.deleteRule(name, ids)
    },
    editRule(obj) {
      this.ruleId = obj.ruleId
      this.renderEdit = true
      this.isEditMode = true
    },
    showEdit() {
      this.renderEdit = true
      this.isEditMode = false
    },
    close() {
      this.renderEdit = false
      this.getRules()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getRules()
    },
    handleCurrentChange() {
      this.getRules()
    },
    getRules() {
      this.tableLoading = true
      HTTP.getDIscernRules({
        keyword: encodeURI(this.keyword),
        page: this.currentPage,
        size: this.pageSize,
        ruleInfoCatalog: this.ruleInfoCatalog,
        order_by: 'createTime',
        is_asc: false,
      })
        .then(res => {
          this.tableLoading = false
          const data = res.data || {}
          this.tableData = data.content || []
          this.total = data.totalItems
          this.$refs.table.doLayout()
        })
        .catch(err => {
          this.tableLoading = false
          this.$showFailure(err)
        })
    },
    updateDIscernRuleStatus(bool, row) {
      HTTP.updateDIscernRuleStatus(row.ruleId, bool ? 'enable' : 'disable')
        .then(res => {
          this.$message.success(`${row.ruleName} 状态更新成功`)
        })
        .catch(err => {
          this.$showFailure(`${row.ruleName} 状态更新失败`)
          this.$set(row, 'enabled', !bool)
        })
    },
    beforeDelete(name, id) {
      if (id.toString().includes(',')) {
        return this.$DatablauCofirm(
          `选中“${this.selections.length}条”数据，是否确认删除？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
      } else {
        return this.$DatablauCofirm(`确认删除规则“${name}”？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
      }
    },
    timeFormatter() {
      if (typeof arguments[0] === 'number') {
        return moment(arguments[0]).format('YYYY-MM-DD HH:mm')
      } else if (arguments[0] == undefined) {
        return ''
      } else if (typeof arguments[0] === 'string') {
        return arguments[0]
      }
      if (arguments[0][arguments[1].property]) {
        return moment(arguments[0][arguments[1].property]).format(
          'YYYY-MM-DD HH:mm'
        )
      } else {
        return '-'
      }
    },
  },
  watch: {
    keyword() {
      clearTimeout(this.keyTimer)
      this.keyTimer = setTimeout(() => {
        this.currentPage = 1
        this.getRules()
      }, 600)
    },
    treeKey(val) {
      this.$refs.tree.filter(val)
    },
  },
}
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
#dir-rule-management {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--default-bgc);
  .tree-box {
    position: absolute;
    left: 0;
    width: 280px;
    top: 0;
    bottom: 0;
    // border: 1px solid var(--border-color-lighter);
    border-left: none;
    background-color: var(--default-bgc);
    .tree-search-box {
      padding: 10px;
      height: 34px;
      line-height: 34px;
      box-sizing: content-box;
      position: relative;
      .filter-input {
        padding-right: 47px;
        width: 100%;
        position: relative;
        &:after {
          content: '';
          position: absolute;
          top: 9px;
          right: 30px;
          height: 16px;
          border-left: 1px solid $border-color;
        }
      }
      i {
        position: absolute;
        right: 10px;
        top: 19px;
        cursor: pointer;
      }
    }
    .tree-title {
      height: 34px;
      line-height: 34px;
      padding: 0 20px;
      box-sizing: content-box;
      cursor: pointer;
      // border-bottom: 1px solid #efefef;
      &.tree-title-active {
        background: rgba(64, 158, 255, 0.1);
        span {
          color: #409eff;
        }
      }
      i {
        color: #409eff;
      }
      span {
        margin-left: 5px;
      }
    }
    .tree-line {
      height: 1px;
      margin: 10px;
      background: #efefef;
    }
    .tree-content {
      position: absolute;
      top: 108px;
      bottom: 10px;
      left: 0;
      overflow-y: auto;
      width: 100%;
    }
  }
  .resize-column-middle {
    left: 280px;
    z-index: 8;
  }
  .right-box {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 280px;
    border-left: 1px solid var(--border-color-lighter);
  }
  .search-wrapper {
    height: 34px;
    padding: 0 20px;
  }
  .header {
    box-sizing: border-box;
    padding: 0 20px;
    width: 100%;
    height: 90px;
    .title {
      float: left;
      font-size: 16px;
      line-height: 50px;
    }
    .input-box {
      width: 220px;
    }
  }
  .table-box {
    position: absolute;
    top: 84px;
    left: 0;
    bottom: 0px;
    right: 0;
    padding: 0 20px;
    // border-top: 1px solid #ebeef5;
    // border-top: 1px solid var(--border-color-lighter);
    .edit {
      color: #7d8493;
      font-size: 19px;
      padding-right: 10px;
    }
    .delete {
      color: #7d8493;
      font-size: 19px;
    }
  }
  .meta-data {
    border-radius: 2px;
    display: inline-block;
    padding: 0px 6px;
    width: auto;
    height: 22px;
    line-height: 22px;
    vertical-align: middle;
    color: #719ff5;
    font-size: 12px;
    margin: 0 auto;
    &.surface {
      color: #0095d9;
      background: transparentize(#0095d9, 0.9);
    }
    &.view {
      color: #4b5cc4;
      background: transparentize(#4b5cc4, 0.9);
    }
    &.field {
      color: #b44c97;
      background: transparentize(#b44c97, 0.9);
    }
    // border: 1px solid #719ff5;
  }
  .entity-data {
    border-radius: 2px;
    padding: 5px 10px;
    width: 82px;
    height: 22px;
    color: #ba984a;
    text-align: center;
    line-height: 10px;
    font-size: 12px;
    border: 1px solid #ba984a;
  }
  .bottom {
    box-sizing: border-box;
    padding: 10px 20px 0;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 50px;
    .page {
      float: right;
    }

    .el-icon-delete {
      height: 30px;
      line-height: 28px;
      &:before {
        font-size: 16px;
        vertical-align: middle;
      }
    }
  }
}
</style>
<style lang="scss">
#dir-rule-management {
  .el-table th {
    position: relative;
    left: 5px;
  }
  .el-button--text {
    padding-right: 5px;
    font-size: 16px;
    color: #9099a3;
  }
  .el-button--primary.is-disabled {
    color: #555;
    background-color: #fff;
    border-color: rgb(220, 223, 230);
  }
}
</style>
