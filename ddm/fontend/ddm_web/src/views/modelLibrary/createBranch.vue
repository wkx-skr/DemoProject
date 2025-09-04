<template>
  <div>
    <datablau-dialog
        title="创建分支"
        :visible.sync="showDialog"
        :append-to-body="true"
        custom-class="create-branch-dialog"
        size="m"
        :height="380">
      <datablau-form
        :rules="rules"
        :model="branchData"
        label-width="80px"
        ref="form"
      >
        <el-form-item label="分支名称" prop="modelName">
          <datablau-input
            v-model="branchData.modelName"
            placeholder="请输入分支名称"
            clearable
          ></datablau-input>
        </el-form-item>
        <el-form-item label="版本名称" prop="target">
          <datablau-select
              v-model="branchData.versionId"
              clearable
              filterable
              style="width: 500px"
          >
            <el-option
                v-for="item in versionList"
                :key="item.id"
                :label="item.label"
                :value="item.id"
            ></el-option>
          </datablau-select>
        </el-form-item>

        <el-form-item label="版本备注" prop="content" style="margin-top: 14px;">
          <datablau-input
            v-model="branchData.description"
            type="textarea"
            :autoresize='{min:null,max:null}'
            :rows="3"
            placeholder="请输入"
            maxlength="200"
            show-word-limit
            clearable
            size="mini"
          ></datablau-input>
        </el-form-item>
      </datablau-form>

      <span slot="footer">
          <datablau-button @click="closeDialog" type="secondary">取 消</datablau-button>
          <datablau-button type="primary" @click="createBranch" :disabled="saving || !branchData.modelName">
            保 存
          </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import moment from 'moment'

export default {
  name: 'createBranch',
  data () {
    return {
      showDialog: false,
      modelId: '',
      branchData: {
        modelName: '',
        versionId: '',
        description: ''
      },
      versionList: [],
      saving: false,
      rules: {
        modelName: {
          required: true,
          message: '请输入分支名称',
          trigger: 'blur'
        }
      }
    }
  },
  components: {},
  computed: {},
  mounted () {
    // this.dataInit()
  },
  methods: {
    dataInit (data) {
      this.branchData = {
        modelName: '',
        versionId: '',
        description: ''
      }
      this.modelId = data.id
      this.getVersions()
      let branchName = data.branch ? data.name : 'master'
      this.branchData.description = `此分支基于分支 ${branchName}`
      console.log(data, 'data')
      this.showDialog = true
    },
    // 获取模型版本
    getVersions () {
      HTTP.getVersions({ modelId: this.modelId })
        .then(res => {
          this.versionList = res.map(item => {
            return {
              label: `${item.name} by ${item.creator} at ${moment(item.timestamp).format('YYYY/MM/DD HH:mm:ss')}`,
              id: item.id
            }
          })
          this.branchData.versionId = this.versionList[0].id
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    createBranch () {
      this.saving = true
      let versionId = this.branchData.versionId
      if (String(versionId).length > 10) {
        versionId = ''
      }
      let params = {
        modelId: this.modelId,
        versionId: versionId,
        requestBody: {
          version: this.branchData.modelName,
          description: this.branchData.description
        }
      }
      HTTP.createBranch(params)
        .then(res => {
          this.$emit('branchCreated', res)
          this.closeDialog()
          this.$datablauMessage.success('创建分支成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.saving = false
        })
    },
    closeDialog () {
      this.showDialog = false
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>

</style>

<style lang="scss">
.create-branch-dialog {
  .datablau-input, .el-textarea__inner, .el-form.db-form .datablau-input[type='textarea'] {
    width: 500px;
  }
}
</style>
