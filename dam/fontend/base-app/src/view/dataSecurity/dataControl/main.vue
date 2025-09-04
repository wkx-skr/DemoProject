<template>
  <div class="data-control-wrapper">
    <el-dialog
      :visible.sync="applyTable.showAuthorityDialog"
      title="数据申请表"
      width="805px"
      class="few-content"
      :modal-append-to-body="false"
    >
      <div class="authority-wrapper">
        <ul>
          <li>
            <span>权限类型</span>
            <el-checkbox-group disabled v-model="applyTable.authorityType">
              <el-checkbox label="查询"></el-checkbox>
              <el-checkbox label="修改"></el-checkbox>
              <el-checkbox label="写入"></el-checkbox>
              <el-checkbox label="删除"></el-checkbox>
            </el-checkbox-group>
          </li>
          <li>
            <span>有效期</span>
            <el-radio-group disabled v-model="applyTable.authorityDate">
              <el-radio label="长期"></el-radio>
              <el-radio label="30天"></el-radio>
              <el-radio label="60天"></el-radio>
              <el-radio label="90天"></el-radio>
              <el-radio label="自定义日期"></el-radio>
              <el-date-picker
                disabled
                v-model="applyTable.userAuthorityDate"
                type="date"
                :clearable="false"
                placeholder="选择日期"
              ></el-date-picker>
            </el-radio-group>
          </li>
          <li>
            <span style="vertical-align: top">申请原因</span>
            <el-input
              :rows="3"
              type="textarea"
              disabled
              v-model="applyTable.applyReason"
            ></el-input>
          </li>
          <li>
            <span>审核状态</span>
            <span>{{ applyTable.applyStatus }}</span>
          </li>
          <li v-if="applyTable.applyStatus !== '审核中'">
            <span style="vertical-align: top">审批备注</span>
            <el-input
              :rows="3"
              type="textarea"
              disabled
              v-model="applyTable.assigneeComment"
            ></el-input>
          </li>
        </ul>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          size="small"
          @click="applyTable.showAuthorityDialog = false"
        >
          {{ $t('common.button.ok') }}
        </el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="toDoTable.showToDoDialog"
      title="数据申请表"
      width="805px"
      class="few-content"
      :modal-append-to-body="false"
    >
      <div class="authority-wrapper">
        <ul>
          <li>
            <span>申请人</span>
            <el-input disabled v-model="toDoTable.applyName"></el-input>
            <span style="margin-left: 100px">所在部门</span>
            <el-input disabled v-model="toDoTable.department"></el-input>
          </li>
          <li>
            <span>申请人访问等级</span>
            <el-input disabled v-model="toDoTable.accessLevel"></el-input>
            <span style="margin-left: 100px">数据安全等级</span>
            <el-input disabled v-model="toDoTable.assetsLevel"></el-input>
          </li>
          <li>
            <span>授权评估</span>
            <el-input disabled v-model="toDoTable.ultraVires"></el-input>
          </li>
          <li>
            <span style="vertical-align: top">备注</span>
            <el-input
              v-model="toDoTable.description"
              :rows="3"
              type="textarea"
            ></el-input>
          </li>
          <li style="text-align: right">
            <el-button type="primary" size="small" @click="approve">
              {{ $t('common.button.approve') }}
            </el-button>
            <el-button type="primary" size="small" @click="reject">
              {{ $t('common.button.reject') }}
            </el-button>
          </li>
          <li>
            <span>权限类型</span>
            <el-checkbox-group disabled v-model="toDoTable.authorityType">
              <el-checkbox label="查询"></el-checkbox>
              <el-checkbox label="修改"></el-checkbox>
              <el-checkbox label="写入"></el-checkbox>
              <el-checkbox label="删除"></el-checkbox>
            </el-checkbox-group>
          </li>
          <li>
            <span>有效期</span>
            <el-radio-group disabled v-model="toDoTable.authorityDate">
              <el-radio label="长期"></el-radio>
              <el-radio label="30天"></el-radio>
              <el-radio label="60天"></el-radio>
              <el-radio label="90天"></el-radio>
              <el-radio label="自定义日期"></el-radio>
              <el-date-picker
                disabled
                v-model="toDoTable.userAuthorityDate"
                type="date"
                :clearable="false"
                placeholder="选择日期"
              ></el-date-picker>
            </el-radio-group>
          </li>
          <li>
            <span style="vertical-align: top">申请原因</span>
            <el-input
              type="textarea"
              :rows="3"
              disabled
              v-model="toDoTable.applyReason"
            ></el-input>
          </li>
        </ul>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="doneTable.showDoneDialog"
      title="数据申请表"
      width="805px"
      class="few-content"
      :modal-append-to-body="false"
    >
      <div class="authority-wrapper">
        <ul>
          <li>
            <span>申请人</span>
            <el-input disabled v-model="doneTable.applyName"></el-input>
            <span style="margin-left: 100px">所在部门</span>
            <el-input disabled v-model="doneTable.department"></el-input>
          </li>
          <li>
            <span>申请人访问等级</span>
            <el-input disabled v-model="doneTable.accessLevel"></el-input>
            <span style="margin-left: 100px">数据安全等级</span>
            <el-input disabled v-model="doneTable.assetsLevel"></el-input>
          </li>
          <li>
            <span>授权评估</span>
            <el-input disabled v-model="doneTable.ultraVires"></el-input>
          </li>
          <li>
            <span style="vertical-align: top">审批备注</span>
            <el-input
              disabled
              v-model="doneTable.assigneeComment"
              :rows="3"
              type="textarea"
            ></el-input>
          </li>
          <li>
            <span>审批状态</span>
            <el-input disabled v-model="doneTable.applyStatus"></el-input>
          </li>
          <li>
            <span>权限类型</span>
            <el-checkbox-group disabled v-model="doneTable.authorityType">
              <el-checkbox label="查询"></el-checkbox>
              <el-checkbox label="修改"></el-checkbox>
              <el-checkbox label="写入"></el-checkbox>
              <el-checkbox label="删除"></el-checkbox>
            </el-checkbox-group>
          </li>
          <li>
            <span>有效期</span>
            <el-radio-group disabled v-model="doneTable.authorityDate">
              <el-radio label="长期"></el-radio>
              <el-radio label="30天"></el-radio>
              <el-radio label="60天"></el-radio>
              <el-radio label="90天"></el-radio>
              <el-radio label="自定义日期"></el-radio>
              <el-date-picker
                disabled
                v-model="doneTable.userAuthorityDate"
                type="date"
                :clearable="false"
                placeholder="选择日期"
              ></el-date-picker>
            </el-radio-group>
          </li>
          <li>
            <span style="vertical-align: top">申请原因</span>
            <el-input
              type="textarea"
              :rows="3"
              disabled
              v-model="doneTable.applyReason"
            ></el-input>
          </li>
        </ul>
      </div>
    </el-dialog>
    <el-tabs v-model="tabName" @tab-click="handleClick">
      <!--<el-tab-pane label="数据申请" name="apply">
        <el-table
          :data="applyTable.data"
          stripe>
          <el-table-column
            prop="applyName"
            label="数据资产"
            width="180">
          </el-table-column>
          <el-table-column
            label="数据源"
            width="250">
            <template slot-scope="scope">
              <span>{{scope.row.info && scope.row.info.dataObject && scope.row.info.dataObject.modelName}}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="schema"
            width="180">
            <template slot-scope="scope">
              <span>{{scope.row.info && scope.row.info.dataObject && scope.row.info.dataObject.schema}}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="申请人"
            prop="applyUser"
            width="180">
          </el-table-column>
          <el-table-column
            prop="applyResult"
            label="状态">
          </el-table-column>
          <el-table-column
            prop="startTime"
            label="创建时间"
            width="180">
            <template slot-scope="scope">
              <span>{{moment(scope.row.startTime).format('YYYY-MM-DD HH:mm:ss')}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="startTime"
            label="办理时间"
            width="180">
            <template v-if="scope.row.applyResult !== '审核中'" slot-scope="scope">
              <span>{{moment(scope.row.endTime).format('YYYY-MM-DD HH:mm:ss')}}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作">
            <template slot-scope="scope">
              <el-button @click="showApplyDetail(scope.row)" size="mini" type="primary">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination
            @size-change="handleApplySizeChange"
            @current-change="handleApplyCurrentChange"
            :current-page.sync="applyTable.current"
            :page-sizes="[20, 50, 100]"
            :page-size="applyTable.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="applyTable.total">
          </el-pagination>
        </div>
      </el-tab-pane> -->
      <el-tab-pane label="待审批" name="todo">
        <el-table :data="toDoTable.data" stripe>
          <el-table-column
            prop="applyName"
            label="数据资产"
            width="180"
          ></el-table-column>
          <el-table-column label="数据源" width="250">
            <template slot-scope="scope">
              <el-tooltip
                effect="dark"
                :content="scope.row.info.dataObject.modelName"
                placement="top"
              >
                <span>
                  {{
                    scope.row.info &&
                    scope.row.info.dataObject &&
                    scope.row.info.dataObject.modelName
                  }}
                </span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="schema" width="180">
            <template slot-scope="scope">
              <span>
                {{
                  scope.row.info &&
                  scope.row.info.dataObject &&
                  scope.row.info.dataObject.schema
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="申请人" prop="applyUser"></el-table-column>
          <el-table-column prop="applyResult" label="状态"></el-table-column>
          <el-table-column prop="startTime" label="创建时间" width="180">
            <template slot-scope="scope">
              <span>
                {{ moment(scope.row.startTime).format('YYYY-MM-DD HH:mm:ss') }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                @click="showToDoDetail(scope.row)"
                size="mini"
                type="primary"
              >
                办理
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination
            @size-change="handleToDoSizeChange"
            @current-change="handleToDoCurrentChange"
            :current-page.sync="toDoTable.current"
            :page-sizes="[20, 50, 100]"
            :page-size="toDoTable.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="toDoTable.total"
          ></el-pagination>
        </div>
      </el-tab-pane>
      <el-tab-pane label="已处理" name="done">
        <el-table :data="doneTable.data" stripe>
          <el-table-column
            prop="applyName"
            label="数据资产"
            width="180"
          ></el-table-column>
          <el-table-column label="数据源" width="250">
            <template slot-scope="scope">
              <el-tooltip
                effect="dark"
                :content="scope.row.info.dataObject.modelName"
                placement="top"
              >
                <span>
                  {{
                    scope.row.info &&
                    scope.row.info.dataObject &&
                    scope.row.info.dataObject.modelName
                  }}
                </span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="schema" width="180">
            <template slot-scope="scope">
              <span>
                {{
                  scope.row.info &&
                  scope.row.info.dataObject &&
                  scope.row.info.dataObject.schema
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="申请人" width="180" prop="applyUser">
            <template slot-scope="scope">
              <el-tooltip
                effect="dark"
                :content="scope.row.applyUser"
                placement="top"
              >
                <span>{{ scope.row.applyUser }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="applyResult"
            width="180"
            label="状态"
          ></el-table-column>
          <el-table-column prop="startTime" label="创建时间" width="180">
            <template slot-scope="scope">
              <span>
                {{ moment(scope.row.startTime).format('YYYY-MM-DD HH:mm:ss') }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="办理时间" width="180">
            <template slot-scope="scope">
              <span>
                {{ moment(scope.row.endTime).format('YYYY-MM-DD HH:mm:ss') }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                @click="showDoneDetail(scope.row)"
                size="mini"
                type="primary"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination
            @size-change="handleDoneSizeChange"
            @current-change="handleDoneCurrentChange"
            :current-page.sync="doneTable.current"
            :page-sizes="[20, 50, 100]"
            :page-size="doneTable.size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="doneTable.total"
          ></el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  data() {
    return {
      tabName: 'todo',
      applyTable: {
        data: [],
        current: 1,
        size: 20,
        total: 1,
        showAuthorityDialog: false,
        authorityType: [],
        authorityDate: '30天',
        userAuthorityDate: Date.now(),
        applyReason: '',
        applyStatus: '',
      },
      map: {
        deleted: '删除',
        modifiable: '修改',
        readable: '查询',
        writable: '写入',
      },
      toDoTable: {
        data: [],
        current: 1,
        size: 20,
        total: 1,
        showToDoDialog: false,
        authorityType: [],
        authorityDate: '30天',
        userAuthorityDate: Date.now(),
        applyReason: '',
        applyStatus: '',
        description: '',
        id: null,
        department: '',
        applyName: '',
        accessLevel: '',
        assetsLevel: '',
        ultraVires: '',
      },
      doneTable: {
        data: [],
        current: 1,
        size: 20,
        total: 1,
        showDoneDialog: false,
        authorityType: [],
        authorityDate: '30天',
        userAuthorityDate: Date.now(),
        applyReason: '',
        applyStatus: '',
        description: '',
        id: null,
        department: '',
        applyName: '',
        accessLevel: '',
        assetsLevel: '',
        ultraVires: '',
      },
      moment: moment,
    }
  },
  mounted() {
    this.getApplyData()
    this.getToDoData()
    this.getDoneData()
  },
  methods: {
    showDoneDetail(data) {
      this.doneTable.authorityType = Object.keys(data.info)
        .filter(key => data.info[key] === 'true')
        .map(key => this.map[key])
      this.$http
        .get(this.$url + '/service/auth/apply/detail/' + data.id)
        .then(res => {
          const data = res.data
          this.doneTable.authorityDate = data.effectiveStr
          this.doneTable.userAuthorityDate = data.endTime
          this.doneTable.applyReason = data.applyReason
          this.doneTable.applyStatus = data.applyResult
          this.doneTable.id = data.id
          this.doneTable.applyName = data.applyUser
          this.doneTable.department = data.orgFullName
          this.doneTable.accessLevel = data.accessLevel.name
          this.doneTable.assetsLevel = data.assetsLevel.name
          this.doneTable.ultraVires = data.ultraVires
          this.doneTable.assigneeComment = data.assigneeComment
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.doneTable.showDoneDialog = true
    },
    handleDoneSizeChange(size) {
      this.toDoTable.size = size
      this.toDoTable.current = 1
      this.getDoneData()
    },
    handleDoneCurrentChange(current) {
      this.toDoTable.current = current
      this.getDoneData()
    },
    getDoneData() {
      this.$http
        .post(this.$url + '/service/auth/apply/page', {
          currentPage: this.applyTable.current,
          pageSize: this.applyTable.size,
          assignee: this.$user.username,
          endApply: true,
        })
        .then(res => {
          this.doneTable.data = res.data.content
          this.doneTable.total = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    approve() {
      this.$http
        .post(this.$url + '/service/auth/apply/complete', {
          id: this.toDoTable.id,
          applyResult: '审核通过',
          assigneeComment: this.toDoTable.description,
          info: {},
        })
        .then(res => {
          this.$message.success('审核通过')
          this.getApplyData()
          this.getToDoData()
          this.getDoneData()
          this.toDoTable.showToDoDialog = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    reject() {
      this.$http
        .post(this.$url + '/service/auth/apply/complete', {
          id: this.toDoTable.id,
          applyResult: '审核不通过',
          assigneeComment: this.toDoTable.description,
          info: {},
        })
        .then(res => {
          this.$message.success('审核不通过')
          this.getApplyData()
          this.getToDoData()
          this.getDoneData()
          this.toDoTable.showToDoDialog = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    showToDoDetail(data) {
      this.toDoTable.authorityType = Object.keys(data.info)
        .filter(key => data.info[key])
        .map(key => this.map[key])
      this.$http
        .get(this.$url + '/service/auth/apply/detail/' + data.id)
        .then(res => {
          const data = res.data
          this.toDoTable.authorityDate = data.effectiveStr
          this.toDoTable.userAuthorityDate = data.endTime
          this.toDoTable.applyReason = data.applyReason
          this.toDoTable.applyStatus = data.applyResult
          this.toDoTable.id = data.id
          this.toDoTable.applyName = data.applyUser
          this.toDoTable.department = data.orgFullName
          this.toDoTable.accessLevel = data.accessLevel.name
          this.toDoTable.assetsLevel = data.assetsLevel.name
          this.toDoTable.ultraVires = data.ultraVires
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.toDoTable.showToDoDialog = true
    },
    handleToDoSizeChange(size) {
      this.toDoTable.size = size
      this.toDoTable.current = 1
      this.getToDoData()
    },
    handleToDoCurrentChange(current) {
      this.toDoTable.current = current
      this.getToDoData()
    },
    getToDoData() {
      this.$http
        .post(this.$url + '/service/auth/apply/page', {
          currentPage: this.applyTable.current,
          pageSize: this.applyTable.size,
          assignee: this.$user.username,
          applyResult: '审核中',
        })
        .then(res => {
          this.toDoTable.data = res.data.content
          this.toDoTable.total = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    showApplyDetail(data) {
      this.applyTable.authorityType = Object.keys(data.info)
        .filter(key => data.info[key])
        .map(key => this.map[key])
      this.applyTable.authorityDate = data.effectiveStr
      this.applyTable.userAuthorityDate = data.endTime
      this.applyTable.applyReason = data.applyReason
      this.applyTable.applyStatus = data.applyResult
      this.applyTable.assigneeComment = data.assigneeComment
      this.applyTable.showAuthorityDialog = true
    },
    handleApplySizeChange(size) {
      this.applyTable.size = size
      this.applyTable.current = 1
      this.getApplyData()
    },
    handleApplyCurrentChange(current) {
      this.applyTable.current = current
      this.getApplyData()
    },
    getApplyData() {
      this.$http
        .post(this.$url + '/service/auth/apply/page', {
          currentPage: this.applyTable.current,
          pageSize: this.applyTable.size,
          applyUser: this.$user.username,
        })
        .then(res => {
          this.applyTable.data = res.data.content
          this.applyTable.total = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleClick() {},
  },
}
</script>

<style lang="scss" scoped>
.data-control-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  padding: 20px;
}
.pagination {
  margin-top: 10px;
  text-align: right;
}
.authority-wrapper {
  ul {
    text-align: left;
  }
  li > span,
  li > .el-checkbox-group,
  li > .el-radio-group {
    display: inline-block;
  }
  li > span {
    width: 100px;
  }
  li > .el-checkbox-group {
    width: 400px;
  }
  li > .el-radio-group {
    width: 660px;
  }
  li > .el-textarea {
    width: 660px;
  }
  li > .el-input {
    width: 200px;
  }
  li + li {
    margin-top: 10px;
  }
}
/deep/ .el-input__icon {
  line-height: 32px;
}
.el-table {
  width: auto;
  position: absolute;
  top: 70px;
  left: 20px;
  right: 20px;
  bottom: 50px;
  overflow: auto;
}
.pagination {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  .el-pagination {
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
  }
}
.el-table::before {
  display: none;
}
</style>
<style>
.data-control-wrapper .el-tabs__content {
  position: static;
}
.data-control-wrapper .el-table .cell {
  white-space: nowrap;
}
.data-control-wrapper .el-table--scrollable-x .el-table__body-wrapper {
  overflow: visible;
}
</style>
