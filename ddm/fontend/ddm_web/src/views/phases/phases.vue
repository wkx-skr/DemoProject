<template>
    <div id="phases">
        <div class="header clearfixed">
          <div>{{ $v.customStatus.Statemanagement }}</div>
          <!--<i @click="refresh" class="el-icon-refresh"></i>-->
        </div>
      <div class="top-title">

        <div class="search-box">
          <!--请输入关键字-->
          <datablau-input
            class="search-input"
            v-model="keyword"
            :placeholder="$v.customStatus.pleaseKeys"
            size="small"
            @input="filter"
            :clearable="true"
            prefix-icon="el-icon-search"
            :iconfont-state="true"
            style="line-height: 32px;"
          ></datablau-input>
          <span style="display: inline-block;line-height:20px;height: 20px;color: rgba(0,0,0,.65); font-size: 12px; margin-left: 8px;">
            {{ $v.customStatus.dragRowStatusTsor }}
          </span>

          <div class="top-button">
            <div class="right-btn-container">
              <datablau-button
                type="primary"
                size="small"
                style="float: right;margin-top: 4px;"
                class="icon-tianjia iconfont"
                @click="openDialog"
              >
                {{ $v.customStatus.createStatus }}
              </datablau-button>
            </div>
          </div>
        </div>
      </div>
        <div class="container">
            <datablau-table
                class="datablau-table"
                 height="100%"
                :data="tableData"
                row-key="id"
                >
                <el-table-column
                  prop="modelPhaseName"
                  :label="$v.customStatus.name"
                  width="150"
                  align="left"
                >
                  <template slot-scope="scope">
                    <Status
                      style="display: inline-block;margin-top: 5px;"
                      :showDisabled="true"
                      :type="scope.row.modelPhaseCode"
                      :key="scope.row.id"
                    ></Status>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="description"
                  :label="$v.customStatus.describe"
                  show-overflow-tooltip
                >
                <!-- <template slot-scope="scope">
                  {{scope.row.modelPhaseBuildIn ? '内建状态无法编辑或移除' : scope.row.description}}
                </template> -->
                </el-table-column>
                <el-table-column
                  :label="$v.customStatus.EnableStatus"
                  width="138"
                  align="center"
                >
                  <template slot-scope="scope">
                    <datablau-switch
                      style="margin-right: 5px;"
                      v-model="scope.row.modelPhaseForbidden"
                      :active-value="false"
                      :inactive-value="true"
                      @change="updateStatus($event,scope.row)"
                      >
                    </datablau-switch>
                    <!--:active-text="scope.row.modelPhaseForbidden ? $v.customStatus.Disable : $v.customStatus.Enable"-->

                    <!--<span v-if="scope.row.modelPhaseForbidden">{{$v.customStatus.Disable}}</span>-->
                    <!--<span v-else>{{$v.customStatus.Enable}}</span>-->
                    <!-- <el-switch
                    v-else
                      v-model="isBuildIn"
                      :active-value="true"
                      :inactive-value="false"
                      :disabled="true"
                      >
                    </el-switch> -->
                  </template>
                </el-table-column>
                <el-table-column
                  :label="$v.customStatus.operation"
                  width="80"
                  header-align="center"
                  fixed="right"
                >
                  <template slot-scope="scope">
                    <datablau-button type="icon" v-if="!scope.row.modelPhaseBuildIn" :tooltip-content="'编辑'" class="iconfont icon-bianji" @click="edit(scope.row)"></datablau-button>
                    <datablau-button type="icon" v-if="!scope.row.modelPhaseBuildIn" :tooltip-content="'删除'" class="iconfont icon-delete" @click="deletePhase(scope.row)"></datablau-button>
                  </template>
                </el-table-column>
            </datablau-table>

        </div>
    <datablau-dialog
      :title="$v.customStatus.createStatus"
      :visible.sync="editDialogVisible"
      ref="phasesDialog"
      width="460px"
      :close-on-click-modal="false"
      append-to-body
      @close="closeEditDialog"
    >
      <datablau-form :model="form" ref="phasesForm" label-position="right" label-width="7em" size="mini" :rules="rules">
        <el-form-item :label="$v.customStatus.name" prop="name">
          <el-input
          :maxlength="5"
          show-word-limit
          ref="editDialogInput" v-model="form.name" @keydown.enter.native="save"></el-input>
        </el-form-item>
        <el-form-item :label="$v.customStatus.describe" prop="disc">
          <el-input type="textarea" v-model="form.disc" @keydown.enter.native="save"></el-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <el-button
          size="small"
          @click="closeEditDialog"
        >{{$v.customStatus.close}}</el-button>
        <el-button
          size="small"
          type="primary"
          @click="save"
        >{{$v.customStatus.save}}</el-button>
      </div>
    </datablau-dialog>
    </div>
</template>
<script>
import HTTP from '@/resource/http.js'
import Sortable from 'sortablejs'
import { Watch } from 'vue-property-decorator'
import Status from '@/views/list/Status.vue'

export default {
  components: {
    Status
  },
  data () {
    return {
      keyword: '',
      total: 0,
      pageSize: 20,
      currentPage: 1,
      editDialogVisible: false,
      tableData: [],
      form: {
        name: '',
        disc: ''
      },
      rules: {
        name: {
          required: true,
          trigger: 'blur',
          message: this.$v.customStatus.nameIsRequired // '名称是必填的'
        },
        disc: {
          required: true,
          trigger: 'blur',
          message: this.$v.customStatus.descriptionIsRequired // '描述是必填的'
        }
      },
      isEdit: false,
      isBuildIn: true
    }
  },
  mounted () {
    this.getCurrentPageData()
    this.rowDrop()
    this.tableData = this.phases
  },
  inject: ['refresh'],
  methods: {
    openDialog () {
      this.form = {
        name: '',
        disc: ''
      }
      this.editDialogVisible = true
    },
    getCurrentPageData () {
      this.$store.dispatch('getPhases')
    },
    handleSizeChange (size) {
      this.currentPage = 1
      this.pageSize = size
      this.getCurrentPageData()
    },
    handleCurrentChange () {
      this.getCurrentPageData()
    },
    sortNameMethod (a, b) {
      return a.id - b.id
    },
    save () {
      this.$refs.phasesForm.validate((valid) => {
        if (valid) {
          if (!this.isEdit) {
            HTTP.createPhases({
              modelPhaseName: this.form.name,
              description: this.form.disc,
              modelPhaseOrder: this.tableData.length
            })
              .then(res => {
                this.$message.success(this.$v.customStatus.statusCreatedSuccessfully)
                this.editDialogVisible = false
                this.$refs.phasesForm.resetFields()
                this.getCurrentPageData()
                this.updateStatus(true, { id: res.id }, true)
              })
              .catch(err => {
                console.error(err)
                this.$showFailure(err)
              })
          } else {
            let { modelPhaseBuildIn, modelPhaseCode, modelPhaseForbidden, id, modelPhaseOrder } = this.currentRow
            HTTP.updatePhase({
              id,
              modelPhaseName: this.form.name,
              description: this.form.disc,
              modelPhaseBuildIn,
              modelPhaseCode,
              modelPhaseForbidden,
              modelPhaseOrder
            }, this.currentId)
              .then(res => {
                this.$message.success(this.$v.customStatus.statusEditSuccessfully)
                this.editDialogVisible = false
                this.$refs.phasesForm.resetFields()
                this.isEdit = false
                this.getCurrentPageData()
              })
              .catch(err => {
                console.error(err)
                this.$showFailure(err)
              })
          }
        } else {
          return false
        }
      })
    },
    closeEditDialog () {
      this.editDialogVisible = false
      this.form = {
        name: '',
        disc: ''
      }
      this.$refs.phasesForm.resetFields()
    },
    updateStatus (status, row, hideMessage = false) {
      HTTP.updatePhaseStatus(row.id, status)
        .then(res => {
          if (!hideMessage) {
            this.$datablauMessage.success('修改成功')
          }
          this.getCurrentPageData()
        })
        .catch(err => {
          this.$showFailure(err)
          this.$set(row, 'modelPhaseForbidden', !status)
        })
    },
    edit (row) {
      this.currentRow = row
      this.form.name = row.modelPhaseName
      this.form.disc = row.description || ''
      this.editDialogVisible = true
      this.currentId = row.id
      this.isEdit = true
    },
    deletePhase (row) {
      this.$confirm(`${this.$v.customStatus.reallyDelete} ${row.modelPhaseName}? `, this.$v.customStatus.tips, {
        confirmButtonText: this.$v.customStatus.Yes, // '确定'
        cancelButtonText: this.$v.customStatus.cancel, // '取消'
        type: 'warning'
      }).then(() => {
        HTTP.deletePhase(row.id)
          .then(res => {
            this.$message.success(this.$v.customStatus.deletedSuccessfully)
            this.getCurrentPageData()
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    filter (keyword) {
      clearTimeout(this.timer)
      this.timer = setTimeout(
        () => { this.tableData = this.phases.filter(v => v.modelPhaseName.indexOf(keyword) > -1) },
        300
      )
    },
    rowDrop () {
      const tbody = document.querySelector('#phases .el-table__body-wrapper tbody')
      const _this = this
      Sortable.create(tbody, {
        onEnd ({ newIndex, oldIndex }) {
          const currRow = _this.tableData.splice(oldIndex, 1)[0]
          _this.tableData.splice(newIndex, 0, currRow)
          _this.updateAllOrder()
        }
      })
    },
    updateAllOrder () {
      let promises = []
      this.tableData.forEach((v, i) => {
        v.modelPhaseOrder = i
        if (!v.description) {
          v.description = ''
        }
        let promise = HTTP.updatePhase(v, v.id)
        promises.push(promise)
      })
      Promise.all(promises)
        .then(res => {
          this.$store.dispatch('getPhases')
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    }
  },
  computed: {
    phases () {
      return this.$store.getters.phases
    }
  },
  watch: {
    phases (val) {
      this.filter(this.keyword)
      // this.tableData = val
    }
  }
}
</script>
<style lang="scss" scoped>
    #phases {
        width: 100%;
        height: 100%;
        position: relative;
      .search-box {
        position: relative;
        .top-button {
          position: absolute;
          right: 0;
          top: 0;
        }
      }
        .header {
          height: 40px;
          font-size: 16px;
          line-height: 40px;
          margin-top: -20px;

          div {
            float: left;
            margin-right: 5px;
            font-weight: bold;

          }

          i {
            float: left;
            padding-top: 5px;
            cursor: pointer;
            color: #7D8493;
          }
        }
        .el-input {
            margin-left: 7px;
            width: 200px;
            height: 32px;
        }
        .create-button {
            float: right;
        }
        .container {
          position: absolute;
          left: 0px;
          right: 0px;
          top: 75px;
          bottom: 30px;
        }
        .pagination-container {
            bottom: -20px;
        }
        .el-icon-edit-outline {
          font-size: 16px;
          margin-right: 18px;
          cursor: pointer;
        }
        .el-icon-delete {
          font-size: 16px;
          cursor: pointer;
        }
    }
</style>
