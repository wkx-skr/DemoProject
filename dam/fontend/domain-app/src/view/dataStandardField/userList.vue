<template>
  <div class="list-tab-container folder-user-list">
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      width="600px"
      class="edit-authority-dialog"
      :close-on-click-modal="false"
      size="l"
    >
      <div class="authority-dialog-body">
        <datablau-form
          ref="editAuthority"
          label-position="right"
          label-width="110px"
          size="small"
          v-model="authorityData"
          :rules="rules"
        >
          <el-form-item
            :label="`${$t('domain.fieldDomain.type')}${$t(
              'domain.common.colon'
            )}`"
            prop="type"
          >
            <datablau-select
              v-model="authorityData.type"
              size="mini"
              @change="handleTypeChange"
              :placeholder="$t('domain.common.pleaseSelect')"
              clearable
              :disabled="!$damEnabled || !isAddAuthority"
            >
              <el-option
                value="USER"
                :label="$t('system.user.user')"
              ></el-option>
              <el-option
                value="DEPARTMENT"
                :label="$t('domain.common.department')"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="`${$t('system.user.user')}${$t('domain.common.colon')}`"
            prop="target"
            v-if="authorityData.type === 'USER'"
          >
            <span style="color: #f56c6c; position: absolute; left: -56px">
              *
            </span>
            <datablau-select
              size="mini"
              v-model="authorityData.target"
              class="normal-with-input"
              :disabled="!isAddAuthority"
              v-if="!isAddAuthority"
            >
            </datablau-select>
            <datablau-input
              size="mini"
              clearable
              class="normal-with-input"
              v-model="authorityData.target"
              @focus="handleChooseUser"
              v-if="isAddAuthority"
              :disabled="!isAddAuthority"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="`${$t('domain.common.department')}${$t(
              'domain.common.colon'
            )}`"
            prop="target"
            v-if="authorityData.type === 'DEPARTMENT'"
          >
            <span style="color: #f56c6c; position: absolute; left: -56px">
              *
            </span>
            <datablau-select
              size="mini"
              clearable
              v-model="authorityData.target"
              class="normal-with-input"
              @focus="selectOrganization"
              :disabled="!isAddAuthority"
            >
              <el-option
                v-for="item in orginationData"
                :key="item.bm"
                :value="item.bm"
                :label="item.fullName"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="`${$t('domain.fieldDomain.permission')}${$t(
              'domain.common.colon'
            )}`"
            prop="level"
          >
            <datablau-select
              size="mini"
              v-model="authorityData.level"
              filterable
              clearable
            >
              <el-option
                v-for="item in levelArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </datablau-select>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer" class="synonyms-dialog-footer">
        <datablau-button
          @click="dialogVisible = false"
          size="mini"
          type="secondary"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="saveEditObj"
          class=""
          size="mini"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="inner-container">
      <div class="top-line">
        <datablau-breadcrumb
          :node-data="pathData"
          :couldClick="false"
          @back="backClick"
        ></datablau-breadcrumb>
      </div>

      <div class="list-outer authority-list-outer">
        <div class="filter-line">
          <div class="left-filter">
            <datablau-input
              v-model="keyword"
              :iconfont-state="true"
              :placeholder="$t('domain.fieldDomain.userSearchPlaceholder')"
              clearable
              class="search-input"
            ></datablau-input>
            <el-checkbox
              class="show-data-checkbox"
              :label="$t('domain.fieldDomain.showDisabledPermission')"
              v-model="showDisableData"
              @change="showDataChangeHandler"
            ></el-checkbox>
          </div>
          <div class="right-btn">
            <datablau-button
              class="iconfont icon-tianjia"
              type="primary"
              size="mini"
              @click="addAuthority"
            >
              {{
                $t('domain.common.addButton', {
                  type: $t('domain.fieldDomain.permission'),
                })
              }}
            </datablau-button>
          </div>
        </div>
        <div class="submit-outer">
          <datablau-form-submit>
            <div class="table-outer">
              <div class="user-list">
                <datablau-table
                  class="datablau-table"
                  :data="tableShowData"
                  height="100%"
                >
                  <el-table-column
                    :label="$t('domain.fieldDomain.type')"
                    prop="type"
                    show-overflow-tooltip
                    min-width="80"
                    :formatter="typeFormatter"
                  ></el-table-column>
                  <el-table-column
                    prop="accessor"
                    :label="$t('domain.fieldDomain.userDepartment')"
                    show-overflow-tooltip
                    min-width="180"
                    :formatter="departmentFormatter"
                  ></el-table-column>
                  <el-table-column
                    :label="$t('domain.fieldDomain.permission')"
                    prop="level"
                    show-overflow-tooltip
                    min-width="180"
                    :formatter="levelFormatter"
                  ></el-table-column>
                  <el-table-column
                    :label="$t('domain.common.operation')"
                    prop="candidate"
                    show-overflow-tooltip
                    width="120"
                    ref="check"
                    header-align="right"
                    align="right"
                    fixed="right"
                  >
                    <template slot-scope="scope">
                      <datablau-button
                        type="icon"
                        size="mini"
                        @click="editUser(scope)"
                      >
                        <datablau-tooltip :content="$t('common.button.edit')">
                          <i class="iconfont icon-bianji"></i>
                        </datablau-tooltip>
                      </datablau-button>
                      <datablau-button
                        type="icon"
                        size="mini"
                        @click="removeUser(scope)"
                        v-if="scope.row.level !== 'NONE'"
                      >
                        <datablau-tooltip
                          :content="$t('domain.common.disable')"
                        >
                          <i class="iconfont icon-jinzhi"></i>
                        </datablau-tooltip>
                      </datablau-button>
                    </template>
                  </el-table-column>
                </datablau-table>
              </div>
            </div>
            <template slot="buttons">
              <div class="tab-bottom-line">
                <div class="left-btn-container vertical-middle"></div>
                <div class="pagination-container vertical-middle">
                  <el-pagination
                    class="bottom-pagination"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-sizes="[20, 50, 100]"
                    :page-size="pageSize"
                    :total="totalShow"
                    layout="total, sizes, prev, pager, next, jumper"
                  ></el-pagination>
                </div>
              </div>
            </template>
          </datablau-form-submit>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'
import commonMixin from '@/components/common/commonMixin.js'

export default {
  data() {
    return {
      dialogTitle: this.$t('domain.fieldDomain.editPermission'),
      dialogVisible: false,
      authorityData: {
        type: 'USER', // USER,DEPARTMENT
        target: '',
        level: '', // ADMIN,WRITE,READ,NONE
      },
      rules: {
        type: [
          {
            required: true,
            message: this.$t('domain.common.itemRequiredChoose', {
              name: this.$t('domain.fieldDomain.permissionType'),
            }),
            trigger: 'blur',
          },
        ],
        level: [
          {
            required: true,
            message: this.$t('domain.common.itemRequiredChoose', {
              name: this.$t('domain.fieldDomain.permission'),
            }),
            trigger: 'blur',
          },
        ],
      },
      levelArr: [
        {value: 'ADMIN', label: this.$t('domain.common.manage')},
        {value: 'WRITE', label: this.$t('domain.common.edit')},
        {value: 'READ', label: this.$t('domain.common.check')},
        {value: 'NONE', label: this.$t('domain.common.disable')},
      ],

      columnDefs: [],
      tableShowData: null,
      tableOption: {
        selectable: false,
        columnResizable: true,
        rowSelection: 'single',
      },
      defaultParaData: {},
      getAuthList: null,
      orginationData: [],
      currentAuthObj: null,
      isAddAuthority: false,
      showDisableData: false,
      departmentsMap: {},
    }
  },
  props: {
    categoryId: {
      required: true,
    },
    pathData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  mixins: [commonMixin.tableWithPage],
  components: {},
  computed: {},
  beforeMount() {
    this.dataInit()
  },
  mounted() {},
  methods: {
    dataInit() {
      if (!this.categoryId) return
      this.getAllDepartments()
      this.refreshList()
      this.getShowData()
    },
    getAllDepartments(callback) {
      HTTP.getOrgTree()
        .then(res => {
          let departmentsMap = {}
          let getDepartmentsMap = (children, departmentsMap) => {
            if (children && Array.isArray(children)) {
              children.forEach(department => {
                departmentsMap[department.bm] = department
                let subs = department.children
                getDepartmentsMap(subs, departmentsMap)
              })
            }
          }
          let data = [res.data]
          getDepartmentsMap(data, departmentsMap)
          this.departmentsMap = departmentsMap
          this.orginationData = Object.keys(this.departmentsMap).map(item => this.departmentsMap[item])

          callback && callback(res.data)

        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleTypeChange() {
      this.authorityData.target = ''
    },
    handleChooseUser() {
      this.addUser()
    },
    getShowData() {
      return new Promise((resolve, reject) => {
        // this.refreshList()
        this.getAuthList
          .then(res => {
            let data = res.data || []
            if (!this.showDisableData) {
              data = data.filter(item => item.level !== 'NONE')
            }
            let keyword = _.trim(this.keyword)
            if (keyword) {
              let arr = data
              data = []
              arr.forEach(item => {
                item.department = this.departmentsMap[item.accessor]?.fullName
                if (this.$MatchKeyword(item, keyword, 'accessor', 'department')) {
                  data.push(item)
                }
              })
            }
            this.totalShow = data.length

            let s = this.pageSize
            let c = this.currentPage
            this.tableShowData = data.slice(s * (c - 1), s * c)
            resolve(this.tableShowData)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    addUser() {
      this.$utils.staffSelect.open([], true).then(data => {
        this.authorityData.target = (data[0] || {}).username || ''
      })
    },
    selectOrganization() {
      this.$utils.branchSelect.open().then(res => {
        // this.orginationData = [res]
        // this.authorityData.target = res.bm
        this.$set(this.authorityData, 'target', res.bm)
      })
    },
    addAuthority() {
      this.dialogTitle = this.$t('domain.fieldDomain.addPermission')
      this.currentAuthObj = null
      this.authorityData = {
        type: 'USER', // USER,DEPARTMENT
        target: '',
        level: '', // ADMIN,WRITE,READ,NONE
      }
      this.isAddAuthority = true
      this.dialogVisible = true
    },
    saveEditObj() {
      // this.$refs.editAuthority.validator()
      if (
        !(
          this.authorityData.type &&
          this.authorityData.target &&
          this.authorityData.level
        )
      ) {
        this.$message.error(this.$t('domain.common.requiredIsNull'))
        return
      }
      let para = _.cloneDeep(this.authorityData)
      para.categoryId = this.categoryId
      HTTP.setCategoryGrant(para)
        .then(res => {
          let data = res.data
          this.$message.success(this.$t('domain.common.saveSucceed'))
          this.dialogVisible = false
          this.refreshCurrentPage()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshList() {
      this.getAuthList = HTTP.getCategoryUser(this.categoryId)
    },
    refreshCurrentPage() {
      this.refreshList()
      this.getShowData()
    },
    getFirstPage() {
      this.currentPage = 1
      this.refreshCurrentPage()
    },
    typeFormatter(row, column, cellValue, index) {
      return cellValue === 'DEPARTMENT'
        ? this.$t('domain.common.department')
        : this.$t('system.user.user')
    },
    levelFormatter(row, column, cellValue, index) {
      let result = ''
      let levelArr = this.levelArr
      levelArr.forEach(item => {
        if (cellValue === item.value) {
          result = item.label
        }
      })
      return result
    },
    editUser({ row }) {
      this.dialogTitle = this.$t('domain.fieldDomain.editPermission')
      this.currentAuthObj = row
      this.isAddAuthority = false
      this.authorityData.type = row.type
      this.authorityData.target = row.accessor
      this.authorityData.level = row.level
      this.dialogVisible = true
    },
    removeUser({ row }) {
      this.$DatablauCofirm(
        this.$t('domain.common.disabledConfirm'),
        this.$t('domain.common.tip'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(res => {
          this.authorityData.type = row.type
          this.authorityData.target = row.accessor
          this.authorityData.level = 'NONE'
          let para = _.cloneDeep(this.authorityData)
          para.categoryId = this.categoryId
          HTTP.setCategoryGrant(para)
            .then(res => {
              this.$message.success(this.$t('domain.common.delSucceed'))
              this.refreshCurrentPage()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
        })
    },
    showDataChangeHandler() {
      this.getFirstPage()
    },
    backClick() {
      this.$emit('backClick')
    },
    departmentFormatter(row) {
      let result = row.accessor
      // 如果有部门， 显示部门名称
      if (row.type === "DEPARTMENT") {
        let department = this.departmentsMap[row.accessor]
        if (department && department.fullName) {
          result = department.fullName
        }
      }
      return result
    },
  },
  watch: {
    tableLoading: {
      immediate: true,
      handler: function (newValue) {
        if (newValue) {
          this.tableShowData = null
        }
      }
    }
  },
}
</script>

<style lang="scss" scoped>
@mixin absPo {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.vertical-middle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.list-tab-container {
  //border: 1px solid red;
  @include absPo;

  .inner-container {
    @include absPo;
    //left: 20px;
    //right: 20px;

    .top-line {
      padding: 10px 20px 10px;
      border-bottom: 1px solid #ddd;
    }

    .list-outer {
      //border: 1px solid red;
      @include absPo;
      top: 50px;

      .filter-line {
        height: 50px;
        padding: 5px 20px;

        .left-filter {
          display: inline-block;
          width: 500px;
          //border: 1px solid red;

          .search-input {
            width: 300px;
          }

          .show-data-checkbox {
            display: inline-block;
            margin-left: 10px;
          }
        }

        .right-btn {
          float: right;
        }
      }

      .submit-outer {
        @include absPo;
        top: 50px;
      }

      .table-outer {
        @include absPo;
        //top: 50px;
        bottom: 60px;
        left: 20px;
        right: 20px;
        //border: 1px solid red;
      }

      .tab-bottom-line {
        @include absPo;
        top: auto;
        height: 60px;

        .pagination-container {
          right: 20px;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
@mixin absPo {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.folder-user-list {
  .user-list {
    @include absPo;
  }
}
</style>

<style lang="scss">
.edit-authority-dialog {
  .normal-with-input {
    width: 300px;
  }
}
</style>
