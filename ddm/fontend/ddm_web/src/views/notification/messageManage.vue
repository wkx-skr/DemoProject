<template>
  <div class="message-manage-page">
    <div class="header clearfixed">
      <div>系统消息管理</div>
    </div>
    <div class="top-title">
      <div class="search-box">
        <!--请输入关键字-->
        <datablau-input
          class="search-input"
          v-model="keyword"
          :placeholder="$v.customStatus.pleaseKeys"
          size="small"
          :clearable="true"
          prefix-icon="el-icon-search"
          :iconfont-state="true"
          style="line-height: 32px;"
        ></datablau-input>
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
          prop="title"
          label="通知标题"
          width="150"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-list-icon :dataType="'icon-biaoti'"></datablau-list-icon>
            {{ scope.row.title }}
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="通知内容"
          min-width="450"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="description"
          label="通知人"
          show-overflow-tooltip
          width="250"
        >
          <template slot-scope="scope">
            <div class="check-box-outer">
              <datablau-checkbox
                :checkboxType="'single'"
                v-model="scope.row.targetUser.admin"
                @change="updateStatus(scope.row)"
                :disabled="saving || !scope.row.enable"
              >
                管理员
              </datablau-checkbox>
              <datablau-checkbox
                :checkboxType="'single'"
                v-model="scope.row.targetUser.editor"
                @change="updateStatus(scope.row)"
                :disabled="saving || !scope.row.enable"
              >
                编辑
              </datablau-checkbox>
              <datablau-checkbox
                :checkboxType="'single'"
                v-model="scope.row.targetUser.view"
                @change="updateStatus(scope.row)"
                :disabled="saving || !scope.row.enable"
              >
                只读权限
              </datablau-checkbox>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$v.customStatus.EnableStatus" width="138" fixed="right" header-align="center" align="center">
          <template slot-scope="scope">
            <datablau-switch
              style="margin-right: 5px"
              v-model="scope.row.enable"
              :disabled="saving"
              @change="updateStatus(scope.row)"
            >
              <!--:active-text="scope.row.enable ? $v.customStatus.Enable : $v.customStatus.Disable"-->
            </datablau-switch>
            <!--<span v-if="!scope.row.enable">{{ $v.customStatus.Disable }}</span>-->
            <!--<span v-else>{{ $v.customStatus.Enable }}</span>-->
          </template>
        </el-table-column>
      </datablau-table>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
export default {
  name: 'messageManage',
  data () {
    return {
      allData: [],
      tableData: [],
      keyword: '',
      saving: false
    }
  },
  components: {},
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      HTTP.getSystemMessageConfig()
        .then((data) => {
          this.allData = data.map((item) => {
            let obj = _.cloneDeep(item)
            obj.targetUser = {
              admin: (4 | item.permiss) === item.permiss,
              editor: (2 | item.permiss) === item.permiss,
              view: (1 | item.permiss) === item.permiss
            }
            return obj
          })
          this.filterData()
        })
        .catch((e) => {
          this.$showFailure(e)
        })
    },
    filterData () {
      this.tableData = this.allData.filter((item) => {
        return item.title.indexOf(this.keyword) > -1
      })
    },
    updateStatus (row) {
      // this.saving = true
      let permiss = 0
      if (row.targetUser.admin) {
        permiss += 4
      }
      if (row.targetUser.editor) {
        permiss += 2
      }
      if (row.targetUser.view) {
        permiss += 1
      }
      let requestBody = [
        {
          id: row.id,
          permiss,
          enable: !!row.enable
        }
      ]
      HTTP.setSystemMessageConfig({ requestBody })
        .then((res) => {
          this.$datablauMessage.success('修改成功')
          this.dataInit()
        })
        .catch((e) => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.saving = false
        })
    }
  },
  watch: {
    keyword (newVal, oldVal) {
      this.filterData()
    }
  }
}
</script>

<style lang="scss" scoped>
.message-manage-page {
  width: 100%;
  height: 100%;
  position: relative;
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
      color: #7d8493;
    }
  }
  .el-input {
    margin-left: 7px;
    width: 200px;
    height: 32px;
  }

  .container {
    position: absolute;
    left: 0px;
    right: 0px;
    top: 75px;
    bottom: 30px;

    .check-box-outer {
      /deep/ .datablau-checkbox2 {
        display: inline-block;
        margin-right: 8px;
      }
    }
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
