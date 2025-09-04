<template>
  <div>
    <datablau-dialog
      title="导入至git"
      :visible.sync="dialogVisible"
      ref="editionDialog"
      width="600px"
      height="520"
      :close-on-click-modal="false"
      append-to-body
      custom-class="release-version-dialog rule-version-dialog"
    >
      <el-form label-position="right" label-width="70px" size="mini" :rules="editionRules" :model="editionObj">
        <el-form-item label="URL" prop="URL">
          <datablau-input style="width: 100%" v-model="editionObj.URL" placeholder="请输入"></datablau-input>
        </el-form-item>
        <el-form-item label="项目分支" prop="branch">
          <datablau-input style="width: 100%" v-model="editionObj.branch" placeholder="请输入"></datablau-input>
        </el-form-item>
        <el-form-item label="私钥" prop="privateKey">
          <datablau-input style="width: 100%" v-model="editionObj.privateKey" placeholder="请输入"></datablau-input>
        </el-form-item>
        <el-form-item label="生成文件名" prop="fileName">
          <div class="left-input" style="display: inline-block;width: 100%;">
            <datablau-input
              style="width: 30%" v-model="editionObj.fileName" placeholder="请输入"
            ></datablau-input>
            <datablau-input
              style="width: 70%" v-model="fileName" placeholder=""
              readonly
            ></datablau-input>
          </div>
        </el-form-item>
        <el-form-item label="提交人" prop="user">
          <datablau-input style="width: 100%" v-model="editionObj.user" placeholder="请输入" readonly></datablau-input>
        </el-form-item>
        <el-form-item label="提交备注" prop="commit">
          <datablau-input style="width: 100%" v-model="editionObj.commit" placeholder="请输入"
                          type="textarea"></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button
          size="small"
          style="margin-top:10px;"
          @click="close"
          type="cancel"
        ></datablau-button>
         <datablau-button
           size="small"
           type="primary"
           style="margin-top:10px;"
           @click="submit"
           :disabled="!canSave"
         >确定</datablau-button>
       </span>
    </datablau-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import CryptoJS from 'crypto-js'

export default {
  name: 'pushToGit',
  data () {
    return {
      dialogVisible: false,
      editionRules: {
        URL: { required: true },
        branch: { required: true },
        privateKey: { required: true },
        user: { required: true },
        commit: { required: true },
      },
      editionObj: {
        URL: '',
        branch: '',
        privateKey: '',
        user: '',
        commit: '',
        fileName: '',
      },
      submitCallback: null,
      modelId: '',
    }
  },
  props: {},
  components: {},
  computed: {
    canSave () {
      let bool = true
      Object.keys(this.editionObj).forEach(key => {
        if (key !== 'fileName' && !this.editionObj[key]) {
          bool = false
        }
      })
      return bool
    },
    fileName () {
      let str = ''
      let nameStr = _.trim(this.editionObj.fileName) || '001'
      nameStr += `_${this.modelId}_${Math.round(Date.now() / 1000)}_DDM`
      // console.log(nameStr, 'nameStr')
      let md5Hash = CryptoJS.MD5(nameStr).toString().substring(0, 6).toLowerCase()
      // console.log(md5Hash, 'md5Hash')
      return `${nameStr}_${md5Hash}.sql`
    },
  },
  mounted () {
  },
  methods: {

    async open (pushData = { script: '', modelId: '' }) {
      this.modelId = pushData.modelId
      this.editionObj = {
        URL: '',
        branch: '',
        privateKey: '',
        user: this.$store.state.user.name,
        commit: '',
        fileName: '',
      }
      this.dialogVisible = true
      try {
        await new Promise((resolve, reject) => {
          this.submitCallback = resolve
        })
      } catch (e) {
        console.log('cancel: ', e)
      }

      let para = _.cloneDeep(this.editionObj)
      para.fileName = this.fileName
      para.script = pushData.script
      console.log(para, 'para')

      // this.$http
      //   .get(`${this.$url}/service/models/fesTemplate?group=jpa&name=${type}`)
      try {
        let saveData = this.$http.get(`${this.$url}/service/models/script/option?dbType=MYSQL`)
        this.dialogVisible = false
        this.$datablauMessage.success('导入 git 成功')

      } catch (e) {
        this.$showFailure(e)
      }
    },
    close () {
      this.dialogVisible = false
    },
    submit () {
      this.submitCallback && this.submitCallback()
    },
  },
  watch: {}
}
</script>

<style scoped>

</style>
