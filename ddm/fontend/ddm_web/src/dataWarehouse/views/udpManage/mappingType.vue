<template>
  <div>
    <div class="top-row">
      <datablau-input
        :iconfont-state="true"
        v-model.trim="type"
        placeholder="请输入映射类型"
        @keydown.enter.native="searchMapping"
        clearable
        @clear="searchMapping"></datablau-input>
      <div class="btn-info">
        <datablau-button
          test-name="metadata_udp_add"
          @click="creatingRule"
          type="primary"
          class="iconfont icon-tianjia"
        >
          创建映射规则
        </datablau-button>
        <!--<datablau-button type="primary" size="small">保存</datablau-button>-->
      </div>
    </div>
    <datablau-form-submit class="tableCon">
      <datablau-table
        :show-column-selection="false"
        class="datablau-table"
        height="100%"
        :data="mappingList"
      >
        <el-table-column
          prop="mappingType"
          label="映射类型"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="mappingExp"
          label="映射表达式"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="createTime"
          label="创捷时间"
          :formatter="$timeFormatter"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="updateTime"
          label="更新时间"
          show-overflow-tooltip
          :formatter="$timeFormatter"
        ></el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="description"
          label="操作"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-button type="icon" tooltipContent="编辑" class="iconfont icon-bianji" @click="editRule(scope.row)"></datablau-button>
            <datablau-button type="icon" tooltipContent="删除" class="iconfont icon-delete right-btn" @click="delRule(scope.row)"></datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
          :current-page='currentPage'
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentChange"
          :layout="'total, sizes, prev, pager, next, jumper'"
        />
      </template>
    </datablau-form-submit>
    <datablau-dialog
      :visible.sync="addRule"
      :title="edite ? '编辑映射规则' :  '添加映射规则'"
      width="640px"
      height="430px"
      append-to-body
    >
      <div class="content">
        <datablau-form label-width="80px" :model="udpForm" ref="udpForm" :rules="udpRules"  >
          <el-form-item label="映射类型" prop="mappingType">
            <datablau-input maxlength="255" v-model.trim="udpForm.mappingType" :disabled="edite" placeholder="请输入映射类型"   clearable></datablau-input>
          </el-form-item>
          <el-form-item label="映射表达式" prop="mappingExp">
            <datablau-input maxlength="255" v-model.trim="udpForm.mappingExp" placeholder="请输入映射表达式"  clearable></datablau-input>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <datablau-input
              maxlength="255"
              v-model.trim="udpForm.description"
              placeholder="请输入描述"
              :rows="2"
              type="textarea"
              style="width:500px;margin-top: 5px"
              clearable></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <span slot="footer">
      <datablau-button type="secondary" @click="addRule = false">取 消</datablau-button>
      <datablau-button type="primary" @click="submitAddForm">
        确 定
      </datablau-button>
    </span>
    </datablau-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      mappingList: null,
      pageSize: 20,
      currentPage: 1,
      total: 0,
      addRule: false,
      edite: false,
      id: '',
      type: '',
      udpForm: {
        mappingType: '',
        mappingExp: '',
        description: ''
      },
      udpRules: {
        mappingType: {
          required: true,
          message: '请输入映射规则类型',
          trigger: 'blur'
        },
        mappingExp: {
          required: true,
          message: '请输入映射表达式',
          trigger: 'blur'
        }
      }
    }
  },
  methods: {
    creatingRule () {
      this.addRule = true
      this.edite = false
      this.$refs.udpForm && this.$refs.udpForm.resetFields()
      this.udpForm = {
        mappingType: '',
        mappingExp: '',
        description: ''
      }
    },
    searchMapping () {
      if (!this.type) {
        this.pageSize = 20
        this.currentPage = 1
        this.getMappingList()
        return
      }
      this.$http.get(`${this.$dddUrl}/service/dwmapping/${this.type}`)
        .then(res => {
          // console.log(res)
          this.mappingList = [res.data]
          this.total = 1
        })
        .catch(e => { this.$showFailure(e) })
    },
    handlePageSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
      this.getMappingList()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getMappingList()
    },
    getMappingList () {
      this.$http.get(`${this.$dddUrl}/service/dwmapping?currentPage=${this.currentPage}&pageSize=${this.pageSize}`)
        .then(res => {
          this.mappingList = res.data.content
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    editRule (row) {
      this.$refs.udpForm && this.$refs.udpForm.resetFields()
      this.udpForm = {
        mappingType: row.mappingType,
        mappingExp: row.mappingExp,
        description: row.description
      }
      this.id = row.id
      this.edite = true
      this.addRule = true
    },
    delRule (row) {
      this.$DatablauCofirm(`确定要删除？`).then(() => {
        this.$http.delete(`${this.$dddUrl}/service/dwmapping/${row.mappingType}`)
          .then(res => {
            this.$datablauMessage.success('删除成功')
            /* this.pageSize = 20
            this.currentPage = 1 */
            this.getMappingList()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
        .catch(e => {})
    },
    submitAddForm () {
      this.$refs.udpForm.validate(valid => {
        if (!valid) return
        if (this.edite) {
          this.$http.put(`${this.$dddUrl}/service/dwmapping`, { ...this.udpForm, id: this.id })
            .then(res => {
              this.$datablauMessage.success('修改成功')
              this.addRule = false
              this.pageSize = 20
              this.currentPage = 1
              this.getMappingList()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          this.$http.post(`${this.$dddUrl}/service/dwmapping`, this.udpForm)
            .then(res => {
              this.$datablauMessage.success('创建成功')
              this.addRule = false
              this.pageSize = 20
              this.currentPage = 1
              this.getMappingList()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    }
  },
  mounted () {
    this.getMappingList()
  }
}
</script>

<style scoped lang='scss'>
  .tableCon{
    position: absolute;
    top: 78px;
    left: -20px;
    right: -20px;
    .tableBox{
      height: 100%;
    }
  }
  .btn-info {
    float: right;
  }
</style>
