<template>
  <div class="participle-tab">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      width="700px"
      class="edit-synonyms-dia"
      :close-on-click-modal="false"
    >
      <div class="synonyms-dialog-body">
        <el-form
          :rules="rules"
          :model="addNewVersion"
          ref="editSynonyms"
          label-position="right"
          label-width="110px"
          size="small"
        >
          <el-form-item
            label="版本号："
            prop="esTag"
            v-if="addNewVersion.edit === true"
          >
            <datablau-input
              style="width: 400px"
              v-model="addNewVersion.esTag"
              size="mini"
              autosize
            ></datablau-input>
          </el-form-item>
          <el-form-item label="分词词库：" prop="dictContent">
            <datablau-input
              :rows="8"
              type="textarea"
              :disabled="addNewVersion.edit === false"
              v-model="addNewVersion.dictContent"
              size="mini"
            ></datablau-input>
          </el-form-item>
        </el-form>
        <p
          style="padding-left: 110px; padding-top: 10px"
          v-if="addNewVersion.edit === false"
        >
          一共有&nbsp;
          <span style="color: #409eff">{{ participleNum }}</span>
          &nbsp;个分词
        </p>
      </div>
      <div
        slot="footer"
        class="synonyms-dialog-footer"
        style="text-align: right"
      >
        <el-button
          size="small"
          type="primary"
          @click="saveEditObj"
          v-if="addNewVersion.edit === true"
          class=""
          :disabled="editBottomItemConfirm"
        >
          确 定
        </el-button>
        <el-button size="small" @click="cancelDialogVisible"> {{ $t('common.button.cancel') }} </el-button>
      </div>
    </el-dialog>
    <div style="display: flex; align-items: center; padding-bottom: 10px">
      <span
        style="
          color: #20293b;
          font-size: 16px;
          margin-right: 15px;
          margin-left: 10px;
        "
      >
        远程词库
      </span>
      <el-switch
        style="font-size: 12px"
        @change="changeSwitch"
        v-model="enableStatus"
        :disabled="!$auth['ROLE_SUPERUSER']"
        active-text="已开启"
        inactive-text="未开启"
      ></el-switch>
      <el-tooltip>
        <span slot="content" style="line-height: 1.5em">
          只有系统管理员才可开启与关闭
        </span>
        <i class="el-icon-info" style="padding-top: 2px"></i>
      </el-tooltip>
    </div>
    <el-table :data="tableData" class="datablau-table">
      <el-table-column width="189" align="left" label="版本号">
        <template slot-scope="scope">
          {{ scope.row.esTag }}
        </template>
      </el-table-column>
      <el-table-column
        label="发布时间"
        prop="updateDate"
        :formatter="$timeFormatter"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="发布人"
        prop="updateUser"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="状态"
        prop="state"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="操作" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="newVersion(scope.row, false)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            v-if="scope.row.state === '当前生效版本' && $auth['ROLE_SUPERUSER']"
            @click="newVersion(scope.row, true)"
            size="small"
          >
            发布新版本
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import contentBoxVue from '../../../view/dataProperty/meta/contentBox.vue'
export default {
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      addNewVersion: {
        dictContent: '',
        esTag: '',
        edit: true,
      },
      editBottomItemConfirm: true,
      rules: {
        esTag: [{ required: true, message: '请填写版本号', trigger: 'blur' }],
        dictContent: [
          { required: true, message: '请填写分词词库', trigger: 'blur' },
        ],
      },
      enableStatus: true,
      participleNum: 0,
    }
  },
  components: {},
  beforeMount() {},
  computed: {
    dialogTitle() {
      console.log(this.addNewVersion)
      return this.addNewVersion.edit ? '发布新版本' : this.addNewVersion.esTag
    },
  },
  mounted() {
    this.getikdictList()
  },
  methods: {
    getikdictList() {
      this.$http
        .get(this.$url + '/service/ikdict/getList')
        .then(res => {
          this.tableData = res.data
          this.enableStatus = res.data[0].enableStatus
          res.data.forEach((element, index) => {
            if (index === 0) {
              element.state = '当前生效版本'
            } else {
              element.state = '历史版本'
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    newVersion(arr, edit) {
      this.dialogVisible = true
      this.addNewVersion.dictContent = arr.dictContent
      if (!edit) {
        this.addNewVersion.esTag = arr.esTag
      }
      this.addNewVersion.edit = edit
      if (typeof arr.dictContent === 'string' && arr.dictContent.length > 0) {
        this.participleNum =
          arr.dictContent.length - arr.dictContent.replace(/\n/g, '').length + 1
      } else {
        this.participleNum = 0
      }
    },
    saveEditObj() {
      const response = {
        dictContent: this.addNewVersion.dictContent.trim(),
        esTag: this.addNewVersion.esTag,
        enableStatus: this.tableData[0].enableStatus,
      }
      this.$http
        .post(this.$url + '/service/ikdict/update', response)
        .then(res => {
          this.dialogVisible = false
          this.$message({
            message: '发布成功',
            type: 'success',
          })
          this.addNewVersion.dictContent = ''
          this.addNewVersion.esTag = ''
          this.getikdictList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    cancelDialogVisible() {
      this.dialogVisible = false
      this.addNewVersion.dictContent = ''
      this.addNewVersion.esTag = ''
    },
    changeEnableStatus() {
      const response = this.tableData[0]
      response.enableStatus = this.enableStatus
      this.$http
        .post(this.$url + '/service/ikdict/update', response)
        .then(res => {
          this.$message({
            message: this.enableStatus === true ? '已开启' : '已关闭',
            type: 'success',
          })
          this.getikdictList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeSwitch(val) {
      this.changeEnableStatus()
    },
  },
  watch: {
    addNewVersion: {
      // 监听的对象
      handler(newVal) {
        if (newVal.dictContent !== '' && newVal.esTag !== '') {
          this.editBottomItemConfirm = false
        } else {
          this.editBottomItemConfirm = true
        }
      },
      deep: true,
    },
  },
}
</script>

<style lang="scss" scoped></style>

<style lang="scss">
.el-switch__label * {
  font-size: 12px;
}
</style>
