<template>
    <div class="tenant-cont">
        <datablau-filter-row>
            <div class="row-inner" style="min-width: 700px">
                <datablau-input
                    clearable
                    v-model="keyword"
                    style="width: 240px; display: inline-block"
                    :iconfont-state="true"
                    placeholder="输入关键字"
                ></datablau-input>
            </div>
            <div class="right-top" style="right: 30px">
                <datablau-button
                type="important"
                @click="addTenant"
                >
                创建租户
                </datablau-button>
            </div>
        </datablau-filter-row>
        <datablau-form-submit style="margin-top: 44px">
            <datablau-table
                ref="dsTable"
                :data="tenantList"
                height="100%"
                :data-selectable="option.selectable"
                :auto-hide-selection="option.autoHideSelectable"
                :show-column-selection="option.showColumnSelection"
                :column-selection="option.columnSelection"
                :border="option.columnResizable"
            >

                <el-table-column
                prop="tenantCode"
                min-width="150"
                label="操作系统租户"
                show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                prop="description"
                label="描述"
                min-width="80"
                show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                prop="queueName"
                label="队列"
                min-width="80"
                show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                prop="createTime"
                label="创建时间"
                min-width="130"
                show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                prop="updateTime"
                label="更新时间"
                min-width="130"
                show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                label="操作"
                width="180"
                header-align="center"
                align="center"
                fixed="right"
                >
                <template slot-scope="scope">
                  <datablau-tooltip
                    content="编辑"
                    placement="bottom"
                    effect="dark"
                  >
                    <datablau-button
                          type="icon"
                          class="btn-in-table-info"
                          @click="handleEdit(scope.row)"
                      >
                          <i class="iconfont icon-bianji"></i>
                      </datablau-button>
                  </datablau-tooltip>
                  <datablau-tooltip
                    content="删除"
                    placement="bottom"
                    effect="dark"
                  >
                    <datablau-button
                        type="icon"
                        class="btn-in-table-info"
                        @click="handleDelete(scope.row)"
                    >
                        <i class="iconfont icon-delete"></i>
                    </datablau-button>
                  </datablau-tooltip>
                </template>
                </el-table-column>
            </datablau-table>
            <template slot="buttons">
                <datablau-pagination
                    style="float: right; margin-right: 20px"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page.sync="currentPage"
                    :page-sizes="[20, 50, 100]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                ></datablau-pagination>
                </template>
        </datablau-form-submit>
        <datablau-dialog
          :visible.sync="tenantVisible"
          :title="tenantVisibleTitle"
          width="600px"
          @close="closeTenant"
        >
          <div class="content">
            <datablau-form
              label-width="100px"
              size="mini"
              :model="tenantForm"
              :rules="rules"
              ref="tenantForms"
              >
              <el-form-item label="操作系统租户" prop="tenantCode">
                <datablau-input :disabled="editRow" style="width:100%;display: inline-block;" v-model="tenantForm.tenantCode" clearable></datablau-input>
              </el-form-item>
              <el-form-item label="队列" prop="queueId">
                  <datablau-select
                      v-model="tenantForm.queueId"
                      clearable
                      filterable
                      style="width:100%"
                  >
                      <el-option
                      v-for="item in queuesList"
                      :key="item.id"
                      :label="item.queueName"
                      :value="item.id"
                      ></el-option>
                  </datablau-select>
              </el-form-item>
              <el-form-item label="描述">
                <datablau-input style="width:100%" type="textarea" v-model.trim="tenantForm.description"></datablau-input>
            </el-form-item>
            </datablau-form>
          </div>
          <span slot="footer">
            <datablau-button @click="closeTenant">取 消</datablau-button>
            <!-- :disabled="tenantForm.tenantCode === '' || tenantForm.queueId === ''" -->
            <datablau-button type="primary" :disabled="tenantForm.tenantCode === '' || tenantForm.queueId === ''" @click="addEditTenant" v-if="!editRow" >
              确定
            </datablau-button>
            <datablau-button type="primary" :disabled="tenantForm.tenantCode === '' || tenantForm.queueId === ''" @click="editTenant" v-else>
              确定
            </datablau-button>
          </span>
        </datablau-dialog>
    </div>
  </template>

<script>
import HTTP from '@/resource/http.js'

export default {
  components: {
    // iframeContainer

  },
  beforeCreate () {
  },
  mounted () {
    this.getTenantList()
  },
  beforeDestroy () {
  },
  data () {
    return {
      keyword: '',
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true
      },
      currentPage: 1,
      pageSize: 20,
      total: 0,
      tenantList: [],
      tenantForm: {
        tenantCode: '',
        queueId: '',
        description: ''
      },
      queuesList: [],
      tenantVisible: false,
      tenantVisibleTitle: '创建租户',
      rules: {
        tenantCode: [
          { required: true, message: '请输入操作系统租户', trigger: 'blur' }
        ],
        queueId: [
          { required: true, message: '请选择队列', trigger: 'change' }
        ]
      },
      editRow: false,
      editRowId: null
    }
  },
  methods: {
    getTenantList () {
      this.$http.get(`/dolphinscheduler/tenants?pageSize=${this.pageSize}&pageNo=${this.currentPage}&searchVal=${this.keyword}`).then(res => {
        this.tenantList = res.data.data.totalList
        this.total = res.data.data.total
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    getQueuesList () {
      this.$http.get(`/dolphinscheduler/queues/list`).then(res => {
        this.queuesList = res.data.data
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    /** 响应事件 */
    // 分页 设置
    handleSizeChange (size) {
      this.currentPage = 1
      this.pageSize = size
      this.getTenantList()
    },
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
      this.getTenantList()
    },
    handleDelete (row) {
      this.$DatablauCofirm(`确定要删除该条租户吗？`).then(() => {
        this.$http.delete(`${this.$dddUrl}/service/user/tenants/${row.id}`).then(res => {
          if (res.data.status === 200) {
            this.$message.success('删除成功')
            this.getTenantList()
          } else {
            this.$showFailure(res.data.msg)
          }
        })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    handleEdit (row) {
      this.tenantVisibleTitle = '修改租户'
      this.$set(this.tenantForm, 'tenantCode', row.tenantCode)
      this.$set(this.tenantForm, 'queueId', row.queueId)
      this.$set(this.tenantForm, 'description', row.description)
      this.editRowId = row.id
      this.editRow = true
      this.tenantVisible = true
    },
    addTenant () {
      this.editRow = false
      this.tenantVisibleTitle = '创建租户'
      this.getQueuesList()
      this.tenantForm = {
        tenantCode: '',
        queueId: '',
        description: ''
      }
      this.tenantVisible = true
    },
    closeTenant () {
      this.tenantVisible = false
      this.editRow = false
      this.tenantForm = {
        tenantCode: '',
        queueId: '',
        description: ''
      }
      this.$refs.tenantForms.resetFields()
    },
    addEditTenant () {
      this.$http.get(`/dolphinscheduler/tenants/verify-code?tenantCode=${this.tenantForm.tenantCode}`).then(res => {
        if (res.data.success) {
          this.$http.post(`${this.$dddUrl}/service/user/tenants?tenantCode=${this.tenantForm.tenantCode}&queueId=${this.tenantForm.queueId}&description=${this.tenantForm.description}`).then(res => {
            if (res.data.status === 200) {
              this.$message.success('创建成功')
              this.getTenantList()
              this.tenantVisible = false
            } else {
              this.$showFailure(res.data.msg)
            }
          })
        } else {
          this.$showFailure(res.data.msg)
        }
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    editTenant () {
      this.tenantForm.id = this.editRowId
      this.$http.put(`${this.$dddUrl}/service/user/tenants/${this.editRowId}?tenantCode=${this.tenantForm.tenantCode}&queueId=${this.tenantForm.queueId}&description=${this.tenantForm.description}&id=${this.editRowId}`).then(res => {
        if (res.data.status === 200) {
          this.$message.success('修改成功')
          this.getTenantList()
          this.tenantVisible = false
        } else {
          this.$showFailure(res.data.msg)
        }
      }).catch(e => {
        this.$showFailure(e)
      })
    }

  },
  watch: {
    keyword (newVal) {
      this.currentPage = 1
      this.getTenantList()
    }
  }
}
</script>
<style lang="scss" scoped>
.tenant-cont{
    position: absolute;
    top: 20px;
    left: 0px;
    right: 0px;
    bottom: 0;
    .right-top{
        right: 30px;
        position: absolute;
        top: 0;
    }
    .left-button {
        position: absolute;
        top: 50%;
        left: 20px;
        -webkit-transform: translateY(-50%);
        transform: translateY(-50%);
    .check-info {
        display: inline-block;
        width: 14px;
        height: 14px;
        margin-right: -13px;
        vertical-align: middle;
        background: #409eff;;
    }
    .footer-row-info {
        height: 50px;
        margin-right: 10px;
        &::before {
            margin-right: 5px;
            font-family: 'element-icons';
            font-size: 12px;
            font-weight: 200;
            line-height: 13px;
            color: white;
            vertical-align: middle;
            content: '\e6da';
        }
    }
    }
    .el-icon-refresh-right.animation {
      animation: rotating 2s linear infinite;
    }
}
</style>
<style lang="scss">
</style>
